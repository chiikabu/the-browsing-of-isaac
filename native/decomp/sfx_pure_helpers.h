#pragma once

#include <stdint.h>

#ifdef __cplusplus
extern "C" {
#endif

/* Pure subsets recovered from the SFX / SoundEffects manager itself.
   NEW freestanding helper family, ABI v1. Nothing here is Update-wired yet;
   the Update / Exit sections reference these VAs as address-stable host
   actions and this family peels the parts of those bodies that are decidable
   without an audio device.

   Roots (all identity-confirmed with scripts/decomp/identify-zhl-address.mjs):
     0x0092dc30  exact SFXManager::Play(int ID, float Volume, int FrameDelay,
                 bool Loop, float Pitch, float Pan)
                 (dual exact match with SoundEffects::Play â€” identical 44-byte
                  wildcard pattern; SFXManager.zhl preferred. `ret 0x18`
                  independently confirms the six-dword argument pack.)
     0x0092e430  exact SoundEffects::ClearVolumeModifier()
                 (ZHL pattern is only 10 literal bytes
                  55 8b ec 83 ec 0c 8b c1 33 c9, but that byte string occurs
                  exactly once in .text of this image, so the match is unique.
                  Every identifier below still carries the VA.)
     0x0092e230  no exact ZHL match â€” address-stable "stop id" mutator
     0x0092df40  no exact ZHL match â€” address-stable "set volume" mutator
     0x0092e050  no exact ZHL match â€” address-stable "set pitch" mutator
     0x0092cfb0  exact SoundEffect::Load() â€” host action (device preload)
     0x00a112c0 / 0x00a2abd0 / 0x00a2add0 / 0x00a2ac20 / 0x007e2740  no match

   0x0092e300 was deliberately NOT modelled here through v6 (the Update slice
   owns an opaque split for it). v7 SUPERSEDES that note: 0x0092e300 is a
   method on the SAME receiver as 0x0092e230 and the two are near-identical
   siblings, so leaving one unmodelled is exactly how a future unit would
   merge them. v7 adds a whole-body model plus an explicit divergence table.
   The Update slice's own gate (isaac_game_update_slice_opaque_0092e300_
   needs_host) is consumed BY REFERENCE and is not edited or re-derived here;
   note only that it closes on "every group disabled or empty" and is
   therefore CONSERVATIVE â€” see the v7 block for the strictly larger no-op
   region this family proves.

   0x00956780 (PM3 pre-play sound-id swap) is already peeled by the
   PlayerManager::Update family as PMP
   (isaac_pm_pre_play_plan / isaac_pm_intensity_play_id). It is caller-side
   id selection, not audio-manager code, so it is not duplicated here. Note
   that it drives a DIFFERENT global RNG quad (0x00c5d2b0, seed 0x69696969,
   shifts 2/7/7) from the one SFXManager::Play uses (0x00c5d2a0, seed
   0x12345678, shifts 5/27/8 â€” see below). Do not conflate the two streams.

   Binary: tools/isaac-ng.unpacked.exe
   SHA-256: 5129DF723E645DAAEA59514394195F3EA1DCE1671BB0433D724648A845017200

   Evidence (raw PE, fully disassembled):
     Play                    VA 0x0092dc30..0x0092def4
     set volume              VA 0x0092df40..0x0092e04d
     set pitch               VA 0x0092e050..0x0092e10f
     stop                    VA 0x0092e230..0x0092e2f2
     ClearVolumeModifier     VA 0x0092e430..0x0092e559
     is-playing probe head   VA 0x0092e560..0x0092e5ae (gate cross-check only)
     .rdata 0x00baa454 = 1.0f
     .rdata 0x00b1f6c0 = { 5, 0x1b, 8 }  (one-time RNG shift triple)
     .data  0x00c5d2a0 = 0x12345678, 0x00c5d2a4..ac = 0 until the magic-static
            initializer at VA 0x0092deb9 copies the .rdata triple in
     strings 0x00b7b1fc "[warn] Sound %d has no samples."
             0x00b7b1d8 "[warn] Sound %d was not preloaded."
             0x00b6bf54 "RNG Seed is zero!"
     section-notes/sfx-v1/

   Receiver layout proven by the exact Play signature + the four siblings.
   The manager holds a std::vector<SoundEffect> with 0x1b8-byte elements:
     this[0x00] begin, this[0x04] end, this[0x0c] "not preloaded" counter,
     this[0x10] volume-modifier float (address-stable; do NOT promote to a
     ZHL field name â€” only its use in the three volume formulas is proven).
   Entry (SoundEffect, stride 0x1b8):
     [0x000] frame start stamp (int32), [0x004] frame end stamp (int32),
     [0x190] voice count (unsigned), [0x194] base volume (float),
     [0x198] enabled byte, voices at [0x20 + i*0x38].
   Voice record (0x38 bytes, base = entry + 0x20 + i*0x38):
     +0x00 channel object pointer (COM-style vtable â€” always host)
     +0x08 loop byte,  +0x09 pending byte,  +0x0c volume float,
     +0x14 pitch float, +0x18 stream-reload flag byte

   Everything that reaches the audio device stays an address-stable host
   action: the channel vtable slots (+0x28 probe, +0x2c start, +0x38 activity
   probe, +0x3c stop, +0x40 set-loop, +0x44 query, +0x48 set-volume,
   +0x58 set-pitch), the global sound-system object at 0x00c5aaa0 (vtable
   slot +0x24 creates a stream), the 0x00a2abd0 / 0x00a2add0 / 0x00a2ac20
   channel helpers, SoundEffect::Load, and the 0x00a112c0 logger.
   The audio backend is a platform primitive, not game logic. */

/* ---------- v2 additions ----------

   v2 adds the is-playing probe root and the three channel-wrapper helpers:

     0x0092e560  no exact ZHL match â€” address-stable is-playing probe.
                 Its prologue is the same four tests as the mutators, with one
                 difference that a shared gate would have erased: an entry with
                 no samples jumps straight to `xor al,al` and emits NO warn log
                 (VA 0x0092e5a4 -> 0x0092e5fd). So the gate now carries an
                 explicit form (MUTATOR / PLAY / PROBE) and the warn decision
                 is a function of both.
                 Its voice loop RE-READS the vector's begin pointer and the
                 entry's voice count on every iteration (VA 0x0092e5eb), so the
                 bound must not be folded once.
     0x00a2abd0  no match â€” channel-wrapper reset (release, then a fixed
                 constant pack).
     0x00a2add0  no match â€” channel-wrapper assign: same reset, then attach via
                 0x008f2c90, then push the just-reset defaults to the device.
     0x00a2ac20  no match â€” channel-wrapper set-pan with a non-mono guard.
     0x008f2c90  no match â€” host attach; writes ONLY wrapper[0x00] / [0x04]
                 (a pointer-pair swap), which is what makes the 0x00a2add0
                 device arguments provably the reset constants.
     0x00a2ae60  no match â€” host release.

   Channel wrapper layout, now proven from the three helpers plus Play:
     wrapper base = entry + 0x20 + i*0x38
       +0x00 channel object pointer   +0x04 secondary pointer
       +0x08 loop byte                +0x09 pending byte
       +0x0a flag byte                +0x0c volume float (default 1.0f)
       +0x10 pan float (default 0.0f) +0x14 pitch float (default 1.0f)
       +0x18 stream-needed byte  (the byte Play tests at entry + (i+1)*0x38)
   The 0x18 bytes below the wrapper (entry + 0x08 + i*0x38 .. +0x1f) are an
   MSVC std::string: Play reads its capacity at +0x14 and picks the inline
   buffer when it is below 0x10 (VA 0x0092ddaf).

   Two 16-bit stores make one-byte reasoning wrong, so they are modelled:
     VA 0x00a2abda `mov word [wrapper+0x08], 0`  clears loop AND pending
     VA 0x0092de78 `mov word [wrapper+0x09], 1`  sets pending=1 AND clears
                                                 the +0x0a flag byte */

/* ---------- v3 additions ----------

   v3 splits SoundEffect::Load (0x0092cfb0, exact ZHL, 47 pattern bytes) into
   the sample-table bookkeeping (translated here) and the device/file open
   (host forever), and adds the channel-wrapper copy-assign sibling.

   Load's complete body, VA 0x0092cfb0..0x0092d131:

     0x0092cfe0  cmp dword [entry+0x190], 0 ; jbe 0x0092d10f   (unsigned)
     0x0092cff4  edi = entry + 0x20                            (wrapper cursor)
     per voice, VA 0x0092d000..0x0092d109:
       0x0092d014  call 0x008f5ad0  exact ModManager::TryRedirectPath(
                     std_string* result, std_string* filePath) â€” 78 pattern
                     bytes. filePath is entry + 0x08 + i*0x38 (edi-0x18), the
                     voice's own name string; result is a stack local.  HOST.
       0x0092d023  ecx = size-4 ; cmp size,ecx ; jb 0x0092d138
                     `size - (size-4)` borrows exactly when size < 4, so the
                     fatal path is `resolved length < 4`.  PURE.
       0x0092d031  eax = size-(size-4) â€” always exactly 4 past that guard, so
                     the `cmovb edx,eax` at 0x0092d03f can never fire and the
                     compare length is the constant 4.  PURE (PE truth).
       0x0092d045  cmp capacity,0x10 ; cmovae eax,heap â€” MSVC SSO select. PURE.
       0x0092d052  call 0x00423480 (no ZHL match) with ecx = data+size-4,
                     edx = 4, and (0x00b7b1bc, 4) on the stack. 0x00b7b1bc is
                     the 4-byte literal ".ogg".  HOST (the resolved path is an
                     IO result), but its outcome is a single 0/non-0 bit.
       0x0092d05e  match  -> al = 1, skip the device work entirely
       0x0092d062  else   -> [0x00c5aaa0]->vtbl[0x24](&handle, path, 0, 0)
                     then 0x00a2add0(wrapper, &handle), then the vtbl[0x0c]
                     probe + the 0x00c7f484 hook, then al = 0.  HOST.
       0x0092d0c7  mov byte [edi+0x18], al   â€” the stream-reload byte, i.e.
                     entry + (i+1)*0x38.  PURE given the compare bit.
       0x0092d0ca  cmp capacity,0x10 ; jb â€” free the heap buffer.  allocator.
       0x0092d103  cmp i, dword [entry+0x190] ; jb â€” the bound is RE-READ from
                     the entry on every iteration.  PURE.
     0x0092d10f  mov byte [entry+0x198], 1  â€” unconditional, reached from BOTH
                   the zero-voice `jbe` and the loop exit.  PURE.

   The split is clean. Load's ONLY stores into the entry are the enabled byte
   at 0x198 and one stream byte per visited voice at entry + (i+1)*0x38.
   Neither can alias entry[0x000], entry[0x004] or entry[0x190]: those would
   need i*0x38 == 0x170-k for k in {0,4,8,9,0xa,0xc,0x10,0x14,0x18}, and 0x38
   divides none of 0x158..0x170. The callees cannot reach them either â€” the
   only entry-derived pointers Load hands out are the voice's name string
   (entry + 0x08 + i*0x38) and its wrapper (entry + 0x20 + i*0x38), and
   0x00a2add0 writes only wrapper[0x00..0x14].

   Consequence: Play's `voices_after_load` and `entry_end_4` re-reads are
   provably equal to the pre-Load values, so both recaptures are removed in
   v3 and IsaacSfxPlayInput loses the voices_after_load field. Only the picked
   voice's stream byte stays a recaptured host input (it is an IO result).
   isaac_sfx_play_recapture_mask carries that answer as machine evidence.

   Latent defect, reproduced not corrected: voice i occupies
   [0x08 + i*0x38, 0x08 + (i+1)*0x38), so the entry holds exactly SEVEN voice
   slots (voice 6 ends at 0x190). With entry[0x190] >= 8 the loop still runs:
   voice 7's name std::string IS entry[0x190..0x1a8] (the voice count, the base
   volume and the enabled byte re-read as size/capacity/buffer), and its stream
   byte lands at entry+0x1c0, past the 0x1b8 stride, in the NEXT entry.

   0x00a2ac90 (no ZHL match) â€” channel-wrapper copy-assign, called from
   0x00a2ab21 (the copy-constructor, which pre-installs the same constant pack)
   and from 0x0092d782. VA 0x00a2ac90..0x00a2adc5:
     snapshot the five source fields FIRST (0x00a2accf..0x00a2acf0: loop into
     bl, pending into bh, volume/pan/pitch into stack slots), then release
     (0x00a2acf5), then write the reset constant pack, then exchange the
     pointer pair with a clone (0x00a2ad25..0x00a2ad39 â€” a true swap, not a
     copy), then restore the snapshot (0x00a2ad63..0x00a2ad82).
     +0x0a is cleared by the pack and NEVER restored, so a copy-assign always
     leaves the flag byte 0 even when the source had it set. Snapshot-first
     also makes self-assign value-preserving for the other five fields.

   0x00a2ac00 (no ZHL match) â€” channel start/resume. It is byte-for-byte the
   tail Play inlines at VA 0x0092de6a..0x0092de7e: `if (channel) {
   vtbl[0x2c](1); mov word [wrapper+9], 1; }`. Modelled so the two can be
   cross-checked against each other.

   Whole-body census (scripts run against .text of this image, 0x00401000 +
   0x716200 bytes):
     - the reset constant pack `mov dword [r+0xc],0x3f800000 ;
       mov dword [r+0x10],0 ; mov dword [r+0x14],0x3f800000` occurs at exactly
       8 sites, every one of them preceded by `mov word [r+8],0` and
       `mov byte [r+0xa],0`: 0x007e14a1, 0x007e175b, 0x00a2aa39, 0x00a2ab0c,
       0x00a2ab76, 0x00a2abe4, 0x00a2ad0b, 0x00a2adec. One template, no
       exceptions â€” isaac_sfx_channel_reset_defaults covers all 8.
     - SoundEffect::Load has 22 rel32 callers, one of which is Play's
       0x0092dcdc, so this peel is not a one-site peel.
     - `mov word [r+9], 1` occurs at 5 sites plus Play's wrapper-relative
       `mov word [entry+0x29], 1` at 0x0092de78. */

/* ---------- v4 additions ----------

   v4 takes `0x0092d140`, the sample-table (re)builder that sits immediately
   after SoundEffect::Load (epilogue `0x0092dbaa`, `ret 8` at `0x0092dbc7`,
   0x10418-byte probed frame, 2 rel32 callers: 0x008f42cd / 0x0095310f).
   Most of it is XML parsing and stays host. Two bounded blocks are peeled:

   A. the vector clear/destroy walk, VA 0x0092d1c4..0x0092d2d7
   B. the fixed resize to 0x443 elements, VA 0x0092d2da..0x0092d379

   -- A: clear/destroy walk -------------------------------------------------
     0x0092d1c4  lea eax,[ebp-0x20] ; cmp eax,esi ; je 0x0092d2da
                   inlined self-assignment guard comparing a local of THIS
                   frame against the caller's `this`. STATICALLY DEAD â€” see
                   the dead-branch registry below. Arithmetic retained.
     0x0092d1cf  detach: begin/end/cap read, then all three zeroed BEFORE any
                   destructor runs (0x0092d1d7/0x0092d1e3/0x0092d1f0).
     0x0092d1f7  test begin,begin ; je   -> nothing to free
     0x0092d1ff  cmp begin,end ; je 0x0092d297 -> skip the loop, still free
     per element, 0x0092d210..0x0092d289:
       0x0092d217  the entry's OWN std::string at elem+0x1a0:
                     capacity at +0x14 (elem+0x1b4), size at +0x10 (elem+0x1b0),
                     buffer at +0x00 (elem+0x1a0).
                     cmp capacity,0x10 ; jb -> inline, no free
                     inc capacity ; cmp,0x1000 ; jb -> plain free
                     else back = ptr[-1] ; size += 0x23 ;
                          (ptr-back)-4 > 0x1f (UNSIGNED ja) -> fatal
                          free(back) instead of free(ptr)
       0x0092d259  reset: size := 0, capacity := 0x0f, buffer[0] := 0
       0x0092d24a  __ehvec_dtor(base = elem+0x08, size = 0x38, count = 7,
                                dtor = 0x0092cf10)
                     *** the SEVEN-slot voice array, stated by the machine
                     itself rather than derived. v3 proved it arithmetically
                     (voice 6 ends exactly at 0x190); this is the independent
                     confirmation.
       0x0092d270  add esi,0x1b8 ; cmp elem,end ; jne â€” walk by the stride
     0x0092d297  sub ecx,begin  (capacity byte span)
     0x0092d299  <shared magic divide>  -> capacity element count
     0x0092d2aa  imul ecx, eax, 0x1b8
                   *** the free size is the count RE-MULTIPLIED, so a capacity
                   span that is not a multiple of 0x1b8 is rounded DOWN.
     0x0092d2b2  the same >=0x1000 / back-pointer / 0x1f slack dance, on the
                   element block this time.

   `0x0092cf10` (the per-slot destructor) closes the layout question for good:
     0x0092cf13  lea ecx,[slot+0x18] ; call 0x00a2ab40   <- the channel wrapper
     0x0092cf1e  jmp 0x0040d040 with ecx = slot+0x00      <- the name string
   so slot = { std::string name @ +0x00 (0x18 B), channel wrapper @ +0x18 },
   and with base elem+0x08 and stride 0x38 that is exactly the v3 layout
   (name at 0x08+i*0x38, wrapper at 0x20+i*0x38). `0x0092ea80` says the same
   from the other side: `lea esi,[elem+8]` then `lea ecx,[esi+0x198]`, i.e.
   the entry's own string at elem+0x1a0.

   -- B: resize to 0x443 ---------------------------------------------------
     0x0092d2dd  size_count    = (end - begin) / 0x1b8
     0x0092d2f2  cmp size_count, 0x443 ; jbe 0x0092d320      (UNSIGNED)
       >  0x443 -> 0x0092d30d call 0x0092ea80 (destroy range) with
                   this->end := begin + 0x75328, and 0x75328 == 0x443 * 0x1b8
       == 0x443 -> 0x0092d320 `jae 0x0092d379`: nothing at all. The second
                   branch REUSES the flags of the first compare.
       <  0x443 -> 0x0092d328 capacity_count = (cap - begin) / 0x1b8
                   0x0092d33e cmp capacity_count, 0x443 ; jae (UNSIGNED)
                     >= -> 0x0092d371 call 0x0092edc0 append (0x443 - size)
                     <  -> 0x0092d353 call 0x0092ee40 grow/reallocate

   -- the shared count model ------------------------------------------------
   All three v4 divides use the family's `0x094f2095 / sar 4` sequence, so the
   model is REUSED rather than re-derived. It is NOT byte-identical at all
   three: the divide cores at 0x0092d299 and 0x0092d328 are the exact bytes
   `c1fa04 8bc2 c1e81f 03c2` the six v1/v2 roots use, but 0x0092d2dd is
   `c1fa04 8bf2 c1ee1f 03f2` â€” the same instructions with esi as the
   destination instead of eax. Register allocation only; the arithmetic is
   identical, and a cross-helper differential pins the two models together.

   -- host ------------------------------------------------------------------
   0x0092ea80 destroy-range, 0x0092edc0 append-n, 0x0092ee40 grow,
   0x00aef638 __ehvec_dtor, 0x0040d040 std::string dtor, 0x00aef15c free,
   0x00a178d0 file open, 0x00413b90/0x004155d0/0x00413c70/0x00413bf0 the XML
   reader, 0x00a112c0 logger.

   -- v5: 0x0092d140 C/D (attribute walks, append-vs-replace, fill) ---------
   v5 translates the attribute-list walks at both sites of the (re)builder,
   the append-vs-replace arm at 0x0092d5b0, the id-bounds decision at
   0x0092d6c4, and the per-slot voice-count guard at 0x0092d8ac. What stays
   host: the XML reader itself, the numeric parse through IAT 0x00b187a8,
   every std::string assign (0x0040ccd0 / 0x00421680), the vector push
   (0x0092e830 / 0x0092e900), both __ehvec calls (0x00aef5c4 / 0x00aef638),
   the channel wrapper copy-assign 0x00a2ac90, and both log calls
   (0x00a112c0). See section-notes/sfx-v5/ for the full 0x0092d140 body and
   the byte-level evidence for each helper. */

/* ---------- v6: the per-sound tail 0x0092da86..0x0092db29 ----------------
   v6 peels the post-samples tail of the (re)builder:

     0x92da86  imul ecx,[ebp-0x10264],0x1b8  -> index * 0x1b8  (wraps)
     0x92da96  entry = begin + that          -> PURE (spans the vector)
     0x92da98  call 0x92cfb0                 -> SoundEffect::Load(entry) HOST
     0x92da9d  inc dword [mgr+0xc]           -> preload-count step   PURE
     0x92daa4..0x92dadb  proto name-string free â€” the SAME cap-based MSVC
                         string shape v4 models (cmp cap,0x10 ; jb ; inc ;
                         cmp 0x1000 ; back ptr ; slack-4 > 0x1f UNSIGNED
                         ja -> abort IAT 0x00b18894). free HOST,
                         decide PURE
     0x92daed..0x92db09  reset stores (size := 0, cap := 0xf, buf[0] := 0)
                         always (both free paths join at 0x92dade), then
                         __ehvec_dtor(base=[ebp-0x103f8], 0x38, 7,
                         0x92cf10) â€” the IDENTICAL seven-slot triple v4
                         isolates. dtor HOST, args PURE.
     0x92db0e..0x92db23  sound = sound[0x2c] ; test ; jne 0x92d470 (loop)
                         â€” the full-word chain test; null falls to the
                         epilogue at 0x92db29.
   0x92db29..0x92dbc7 (the epilogue: the second string free, the 0x414730
   doc destructor and the 0x00b187dc allocator teardown, `ret 8`) is the
   next unit's first VA. XML readers, the 0x00a112c0 logger, Load, free,
   __ehvec_dtor and the abort stay host with exact call ordering. */

/* ---------- v8: 0x0092cf40 preload + the 0x0092d140 epilogue ----------

   v8 lands the family's last two open sequential VAs in the 0x0092d1xx..
   0x92cfa3 neighbourhood: the whole `PreloadSound(int id)` body at
   0x0092cf40 (the script-binding sibling the v7 handoff recorded) AND the
   0x0092d140 epilogue at 0x0092db29..0x0092dbc9 that the v6 notes left as
   the "next unit's first VA". With both landed, EVERY instruction of
   0x0092d140..0x0092dbc7 and 0x0092cf40..0x0092cfa3 is classified (host XML
   parsing and host allocator/free bodies aside) and the sequential frontier
   in this corner of the manager is closed.

   ---- 0x0092cf40 PreloadSound(int id) --- measured 0x64 bytes, 38 insns,
   `__thiscall`, `ret 4`, receiver = *(0x00c7169c) + 0x2a324 (the same
   manager as the v1 roots). identify-zhl: NO exact match (address-stable).
   Reach census (linear .text decode, resync; plus raw dword scan of all
   five sections): 0 direct rel32 calls, 0 jmp tails, no .rdata/.data
   pointers, ONE immediate â€” `push 0x92cf40` at 0x0086dace, the script-
   binding block that also registers 0x92e300 and 0x92e560 (the dword at
   0x86dacf is that push's own immediate).

     0x0092cf4b  test edi,edi ; js 0x92cf9d        id < 0 -> MISS (SIGNED)
     0x0092cf59  span = end - begin ; magic divide  (0x094f2095 sar 4)
     0x0092cf67  cmp edi,eax ; jge 0x92cf9d        id >= count -> MISS
     0x0092cf6b  imul esi,edi,0x1b8 ; add esi,begin  entry offset (wraps)
     0x0092cf73  cmp byte [entry+0x198],0 ; jne 0x92cf96
                   *** INVERSE sense of the mutators: the ENABLED entry
                   skips the load; the DISABLED entry loads. There is NO
                   voice-count test anywhere in the body.
     0x0092cf7c  push edi ; push 0xb7b1c4 ; push 1 ; call 0x00a112c0
                   the THIRD warn shape: {level 1, "Preload sound %d.\n",
                   id} â€” WITH its vararg (3 dwords, add esp,0xc).
     0x0092cf8e  call 0x92cfb0 (exact SoundEffect::Load) with ecx = entry
     0x0092cf93  inc dword [this+0xc]               preload counter (wrap)
     0x0092cf96  mov byte [entry+0x199], 0          pad-byte clear â€” on BOTH
                   arms, i.e. EVERY in-range call. This is where the v6 fill
                   plan's "uninitialized pad byte" gets zeroed.
     0x0092cfa1  ret 4
   Load preserves esi (callee-saved; `pop esi` at 0x92d122), so the pad
   store after the call hits the same entry. On the PRELOAD arm Load also
   sets entry[0x198] = 1 (its unconditional enabled store), which the
   cross-helper test asserts through isaac_sfx_load_plan.

   ---- the 0x0092d140 epilogue 0x92db29..0x92dbc9 --- 52 insns ending in
   `ret 8`. Everything else in 0x92d140 that is decidable without the XML
   reader was already v4/v5/v6; this block is the frame teardown:

     0x92db29..0x92db60  the ROOT-NAME string free: capacity [ebp-0x18] vs
                         0x10 (SSO skip), cap+1, the 0x1000 big-alloc edge,
                         back ptr, +0x23 bias, slack-4 vs 0x1f UNSIGNED ->
                         abort via IAT 0x00b18894, else free 0x00aef15c.
                         The SAME MSVC shape the v4/v6 sites use â€” but with
                         NO reset stores: unlike the tail site, the string is
                         never reset after the free. Pinned as a divergence.
     0x92db63..0x92db70  lea ecx,[ebp-0x10218] ; call 0x00414730 â€” the XML
                         doc destructor, UNCONDITIONAL (both free paths
                         join at 0x92db63). HOST.
     0x92db75..0x92db9f  the reader-buffer allocator teardown: edx =
                         [0xc7de78] (BSS ptr; null -> fallback 0xc7f618,
                         else +0x30), buffer [ebp-0x10410] non-null ->
                         counter -= [buf-4] ; sbb [edx+4],0 ; free via IAT
                         0x00b187dc. Raw alloc bookkeeping â€” platform
                         primitive per the standing decision; the pure
                         parts are the two null tests.
     0x92dba8  mov al,1 ; SEH restore ; __security_check_cookie (0xaef12b)
               ; ret 8.  Returns TRUE on every path that reaches it.
   The abort, both frees, the doc dtor and the cookie check stay host with
   exact ordering: string free -> doc dtor -> buffer teardown -> ret.

   NEXT FRONTIER (depth, not sequential): no VAs remain open in
   0x0092cf40..0x0092dbc9. The family's next unit should pick one of the
   two irreducibly-host mid-bodies â€” the 0x0092d140 XML-reader block
   (0x0092d1xx..0x0092da86, v4/v5 host) or SoundEffect::Load internals
   (0x0092cfb0, v3 host) â€” or audit 0x0092e560/0x0092e300 for depth. */

enum { ISAAC_SFX_PURE_HELPERS_ABI_VERSION = 41 };

/* ---------- v24: 0x0092d140 callee depth audit â€” string/alloc/vector
   growth laws ----------

   The 0x92d140 XML-reader block's internal E8 callees were previously
   classified host without a depth audit. v24 disassembles every callee of
   the block body (37 direct sites; census in section-notes/sfx-v24/) and
   lands the recoverable PURE decision islands: the std::string assign
   growth chain (0x0040ccd0, four in-block sites 0x92d446/0x92d594/0x92d770/
   0x92d81a), the concat builder 0x00421680 (site 0x92d984), the grow
   allocator 0x0040cf00, the SoundEntry vector growth of 0x0092e900 (push
   back, site 0x92d654) and 0x0092ee40 (reserve-to-0x443, site 0x92d353),
   the string copy-ctor 0x0040cf50 and the file-open gates of 0x00a178d0
   (site 0x92d1a2). ALL compares below are re-traced from the machine;
   UNSIGNED means the literal cmp/jcc pair in the listing. */

/* Shared string-growth constants. The 0xf is the SSO buffer CAP value
   (cap field [str+0x14]); the free side's 0x10 SSO limit is the separate
   ISAAC_SFX_STRING_SSO_LIMIT pin the v13 tail uses. */
enum {
  ISAAC_SFX_STRING_SSO_CAP = 0xf,             /* esi=0xf at 0x40cd1a/0x421692 */
  ISAAC_SFX_STRING_CAP_CLAMP = 0x7fffffff,    /* cmp ,0x7fffffff ; jbe/ja/cmovb */
  ISAAC_SFX_BUILD_FLOOR_16 = 0x16,            /* 0x4216c5 `cmp esi,0x16 ; cmovb` */
  ISAAC_SFX_THROW_LEN_40CCC0 = 0x0040ccc0u,   /* assign len>0x7fffffff throw */
  ISAAC_SFX_THROW_LENGTH_40CEE0 = 0x0040cee0u,/* length_error throws: 0x40cf43 /
                                                 0x92ea72 / 0x92ef68 */
  ISAAC_SFX_THROW_VEC_COUNT_MAX_415BC0 = 0x00415bc0u, /* 0x92ea6d count==MAX */
  ISAAC_SFX_ASSIGN_VA_40CCD0 = 0x0040ccd0u,   /* string assign (same as the
                                                 v5 HOST_VA pin) */
  ISAAC_SFX_BUILD_VA_421680 = 0x00421680u     /* concat builder (v5 HOST pin) */
};

/* The grow allocator 0x0040cf00 (reached from the assign/builder/copy grows
   and the vector grows). cmp size,0x1000 ; jb -> FAST (raw malloc); slow arm
   biases +0x23, wrap-checks, aligns &~0x1f and stores the back pointer at
   [aligned-4]. */
enum {
  ISAAC_SFX_ALLOC_FAST_LIMIT = 0x1000,
  ISAAC_SFX_ALLOC_BIG_BIAS = 0x23,
  ISAAC_SFX_ALLOC_ALIGN_MASK = 0xffffffe0,
  ISAAC_SFX_ALLOC_BACK_PTR_OFF = 4, /* aligned - 4 holds the raw ptr */
  ISAAC_SFX_GROW_ALLOC_VA_40CF00 = 0x0040cf00u,
  ISAAC_SFX_ALLOC_CRT_VA_A0F4C0 = 0x00a0f4c0u  /* raw malloc/operator new */
};

/* SoundEntry vector growth: 0x0092e900 push-back (0x92d654) and 0x0092ee40
   reserve (0x92d353). MAX 0x94f209 is the element-count cap; ecc is the
   capacity in elements, count the current size. 1.5x growth = ecc+(ecc>>1);
   the push-back takes max with count+1 (cmovae UNSIGNED), the reserve floors
   at 0x443 (cmp esi,0x443 ; jae keep). count==MAX -> throw happens ONLY in
   the push-back body (cmp eax,0x94f209 ; je 0x92ea6d). */
enum {
  ISAAC_SFX_VEC_MAX_COUNT = 0x94f209,
  ISAAC_SFX_VEC_RESERVE_FLOOR = 0x443,
  ISAAC_SFX_VEC_PUSH_GROW_VA_92E900 = 0x0092e900u,
  ISAAC_SFX_VEC_RESERVE_VA_92EE40 = 0x0092ee40u,
  ISAAC_SFX_VEC_COPY_CTOR_VA_40CF50 = 0x0040cf50u /* string copy-ctor mover */
};

/* File open 0x00a178d0 (site 0x92d1a2): FULL-WORD NULL gate on the path
   pointer, then a LOW-BYTE empty test on the path's first byte; the result
   flag re-tested FULL-WORD at 0xa1792a. The open/alloc IAT calls are host. */
enum {
  ISAAC_SFX_FILE_OPEN_VA_A178D0 = 0x00a178d0u,
  ISAAC_SFX_FILE_OPEN_ALLOC_VA_A648B0 = 0x00a648b0u
};

/* One big-alloc decision. alloc_size = size+0x23 (32-bit wrap); wrapped
   = alloc_size <= size (UNSIGNED cmp/jbe at 0x40cf0c), which throws
   0x40cee0. The caller then aligns alloc_align(raw). */
typedef struct IsaacSfxGrowAllocBigPlan {
  uint32_t alloc_size;
  int32_t wrapped;
} IsaacSfxGrowAllocBigPlan;

/* 0x40cce2 `cmp len,cap ; ja` UNSIGNED: 1 = grow (len > cap), 0 = inline. */
int32_t isaac_sfx_string_assign_grow(uint32_t len, uint32_t cap);

/* 0x40cce8 `cmp cap,0x10 ; jb` UNSIGNED FULL-WORD: 1 = SSO in-place buffer
   (cap < 0x10), 0 = heap buffer ([str+0x00]). */
int32_t isaac_sfx_string_assign_sso(uint32_t cap);

/* 0x40cd0e `cmp len,0x7fffffff ; ja` UNSIGNED: 0 = throw 0x40ccc0
   (len > 0x7fffffff), else 1. */
int32_t isaac_sfx_string_grow_len_ok(uint32_t len);

/* 0x40cd1a..0x40cd49: the MSVC grow-cap chain. start = len|0xf; if
   start > 0x7fffffff (U) clamp1; else if cap > 0x7fffffff - (cap>>1)
   (U) clamp2; else max(start, cap+(cap>>1)) (U cmovb). Allocation size
   is new_cap+1 via 0x40cf00. */
uint32_t isaac_sfx_string_grow_cap(uint32_t cap, uint32_t len);

/* 0x421684 `add eax,[ebp+0x1c]` â€” len1+len2, 32-bit wrap. */
uint32_t isaac_sfx_string_build_total(uint32_t len1, uint32_t len2);

/* 0x4216ad `cmp total,0xf ; jbe` UNSIGNED: 1 = SSO (total <= 0xf). */
int32_t isaac_sfx_string_build_sso(uint32_t total);

/* 0x4216b1..0x4216cf: builder cap. SSO arm keeps 0xf; else start=total|0xf;
   clamp 0x7fffffff (U); floor max(start, 0x16) (U cmovb). Alloc size =
   cap+1. */
uint32_t isaac_sfx_string_build_cap(uint32_t total);

/* 0x40cf01 `cmp size,0x1000 ; jb` UNSIGNED: 1 = fast arm (raw malloc). */
int32_t isaac_sfx_grow_alloc_fast(uint32_t size);

/* 0x40cf30 `test size,size ; je` FULL-WORD: 1 = size == 0 (NULL, no
   malloc, fast arm only). */
int32_t isaac_sfx_grow_alloc_zero(uint32_t size);

/* 0x40cf09..0x40cf0e `lea eax,[size+0x23] ; cmp eax,size ; jbe`:
   big-arm size + 0x23 with the UNSIGNED wrap gate (wrapped -> throw
   0x40cee0). */
void isaac_sfx_grow_alloc_big_plan(uint32_t size,
                                   IsaacSfxGrowAllocBigPlan* out);

/* 0x40cf1f/22 `lea eax,[raw+0x23] ; and eax,0xffffffe0` â€” the aligned
   user pointer of the slow arm (back ptr stored at aligned-4). */
uint32_t isaac_sfx_grow_alloc_align(uint32_t raw);

/* 0x92e990/0x92eea7 `cmp ecc,0x94f209-(ecc>>1) ; jbe in-place` UNSIGNED:
   1 = allocate-MAX arm (ecc > MAX - (ecc>>1)), 0 = in-place 1.5x arm. */
int32_t isaac_sfx_vec_cap_gate(uint32_t ecc);

/* 0x92e9f6..0x92e9fd push-back: new = ecc+(ecc>>1); max(new, count+1)
   (U cmovae; count+1 wraps). The 0x92ee40 reserve does NOT take count+1. */
uint32_t isaac_sfx_vec_push_grow_new(uint32_t ecc, uint32_t count);

/* 0x92ef24..0x92ef2f reserve: new = ecc+(ecc>>1); floor 0x443 (U:
   cmp esi,0x443 ; jae keep / mov 0x443). */
uint32_t isaac_sfx_vec_reserve_grow_new(uint32_t ecc);

/* 0x92ea03 / 0x92ef3c `cmp new_cap,0x94f209 ; ja` UNSIGNED: 1 = throw
   0x40cee0. */
int32_t isaac_sfx_vec_cap_overflow(uint32_t new_cap);

/* 0x92e961 `cmp count,0x94f209 ; je 0x92ea6d` â€” EQUALITY ONLY (push-back
   body); 1 = throw 0x415bc0. */
int32_t isaac_sfx_vec_count_max(uint32_t count);

/* 0x40cf7d `cmp size,0x10 ; jae heap` â€” JAE polarity: 1 = SSO copy
   (size < 0x10). */
int32_t isaac_sfx_string_copy_sso(uint32_t size);

/* 0x40cf9c..0x40cfa8 copy-ctor: cap = size|0xf, clamp 0x7fffffff (U
   cmova). No 1.5x, no floor; alloc size = cap+1. */
uint32_t isaac_sfx_string_copy_cap(uint32_t size);

/* 0xa178f9/0xa17901: path ptr NULL (FULL-WORD) or first byte 0
   (LOW-BYTE) -> 0 (no open); else 1. */
int32_t isaac_sfx_file_open_path_gate(uint32_t path_ptr_null,
                                      uint32_t first_byte);

/* 0xa1792a `cmp [ebp+8],0 ; jne` â€” FULL-WORD open-result flag. */
int32_t isaac_sfx_file_open_flag_gate(uint32_t flag);

/* ---------- v8 constants ---------- */

/* The preload gate's three arms. Unlike every other gate in the family
   there is NO voice-count test and the enabled sense is INVERTED. */
enum {
  ISAAC_SFX_PRELOAD_GATE_MISS = 0,    /* id < 0 or id >= count (signed) */
  ISAAC_SFX_PRELOAD_GATE_ENABLED = 1, /* in range, enabled != 0: pad only */
  ISAAC_SFX_PRELOAD_GATE_LOAD = 2     /* in range, enabled == 0: log+Load */
};

/* The third logger warn shape: {level 1, 0x00b7b1c4, id} â€” the id IS
   supplied (unlike the v6 out-of-bounds defect). */
enum {
  ISAAC_SFX_WARN_KIND_PRELOAD = 2,
  ISAAC_SFX_PRELOAD_WARN_LEVEL = 1,    /* push 1   at 0x0092cf82 */
  ISAAC_SFX_PRELOAD_WARN_ARGS = 3,     /* id + fmt + level */
  ISAAC_SFX_PRELOAD_WARN_VARARGS = 1   /* the "%d" receives the id */
};

/* The pad byte 0x0092cf96 clears â€” the exact byte the v6 fill model flags
   as copied from uninitialized stack (ISAAC_SFX_FILL_HEADER_OFF_3). */
enum {
  ISAAC_SFX_PRELOAD_PAD_OFF_199 = 0x199,
  ISAAC_SFX_PRELOAD_PAD_CLEAR_VALUE = 0
};

/* 0x0092d140 epilogue host edges. The doc dtor reuses the v6 constant
   ISAAC_SFX_HOST_VA_DOC_DTOR_414730. */
enum {
  ISAAC_SFX_HOST_VA_FREE_B187DC = 0x00b187dcu, /* IAT _free of the reader buf */
  ISAAC_SFX_EPILOGUE_BUFFER_OFF_10410 = 0x10410u, /* [ebp-0x10410] slot */
  ISAAC_SFX_EPILOGUE_ROOT_CAP_OFF_18 = 0x18,  /* [ebp-0x18] capacity */
  ISAAC_SFX_EPILOGUE_ROOT_BUF_OFF_2C = 0x2c,  /* [ebp-0x2c] buffer */
  ISAAC_SFX_EPILOGUE_DOC_OFF_10218 = 0x10218u,/* [ebp-0x10218] doc object */
  /* The allocator-counter selection at 0x92db75..0x92db84: edx =
     [0xc7de78] (a BSS pointer, zero at load) -> +0x30 when non-null,
     else the constant fallback 0xc7f618 (itself BSS, zero at load). */
  ISAAC_SFX_EPILOGUE_HEAP_COUNTER_PTR_VA = 0x00c7de78u,
  ISAAC_SFX_EPILOGUE_HEAP_COUNTER_FALLBACK_VA = 0x00c7f618u,
  ISAAC_SFX_EPILOGUE_HEAP_COUNTER_OFF_30 = 0x30,
  ISAAC_SFX_EPILOGUE_CRT_COUNTER_STORES = 2 /* sub + sbb, on the free path */
};

/* ---------- PE constants (hash-bound) ---------- */

enum {
  /* Manager (receiver) offsets. */
  ISAAC_SFX_MGR_OFF_BEGIN = 0x00,
  ISAAC_SFX_MGR_OFF_END = 0x04,
  ISAAC_SFX_MGR_OFF_NOT_PRELOADED_COUNT = 0x0c, /* inc dword [ebx+0xc] */
  ISAAC_SFX_MGR_OFF_VOLUME_MODIFIER_10 = 0x10,  /* float; address-stable */

  /* SoundEffect entry offsets. */
  ISAAC_SFX_ENTRY_STRIDE = 0x1b8,
  ISAAC_SFX_ENTRY_OFF_FRAME_START = 0x000,
  ISAAC_SFX_ENTRY_OFF_FRAME_END = 0x004,
  ISAAC_SFX_ENTRY_OFF_VOICE_COUNT_190 = 0x190,
  ISAAC_SFX_ENTRY_OFF_BASE_VOLUME_194 = 0x194,
  ISAAC_SFX_ENTRY_OFF_ENABLED_198 = 0x198,

  /* Voice record. */
  ISAAC_SFX_VOICE_STRIDE = 0x38,
  ISAAC_SFX_VOICE_BASE_OFF = 0x20,     /* entry + 0x20 + i*0x38 */
  ISAAC_SFX_VOICE_OFF_CHANNEL = 0x00,  /* [esi-9] with esi = entry+0x29+i*0x38 */
  ISAAC_SFX_VOICE_OFF_SECONDARY_04 = 0x04,
  ISAAC_SFX_VOICE_OFF_LOOP_08 = 0x08,
  ISAAC_SFX_VOICE_OFF_PENDING_09 = 0x09,
  ISAAC_SFX_VOICE_OFF_FLAG_0A = 0x0a,
  ISAAC_SFX_VOICE_OFF_VOLUME_0C = 0x0c,
  ISAAC_SFX_VOICE_OFF_PAN_10 = 0x10,
  ISAAC_SFX_VOICE_OFF_PITCH_14 = 0x14,
  ISAAC_SFX_VOICE_OFF_STREAM_18 = 0x18,
  /* std::string that precedes the wrapper: entry + 0x08 + i*0x38. */
  ISAAC_SFX_VOICE_NAME_OFF = 0x08,
  ISAAC_SFX_VOICE_NAME_CAPACITY_OFF = 0x14, /* cmp [name+0x14], 0x10 ; jb */

  /* eax = 0x094f2095 ; imul span ; sar edx,4 ; add (edx>>>31).
     Exact signed truncating divide by 0x1b8 for every int32 span. Shared by
     all five roots (VA 0x0092dc81 / 0x0092df5e / 0x0092e063 / 0x0092e243 /
     0x0092e448). */
  ISAAC_SFX_ENTRY_DIV_MAGIC = 0x094f2095u,
  ISAAC_SFX_ENTRY_DIV_SHIFT = 4,

  /* Globals reached through *(uint32*)0x00c7169c. */
  ISAAC_SFX_GLOBAL_ROOT_VA = 0x00c7169cu,
  ISAAC_SFX_GLOBAL_OFF_FRAME_CLOCK_4ABBC = 0x4abbcu, /* int32; sar ecx,1 */
  ISAAC_SFX_GLOBAL_OFF_MASTER_VOLUME_2A358 = 0x2a358u, /* float */

  /* Play-local RNG (NOT the 0x00c5d2b0 quad used by 0x00956780). */
  ISAAC_SFX_RNG_SEED_VA = 0x00c5d2a0u,
  ISAAC_SFX_RNG_SHIFT1_VA = 0x00c5d2a4u,
  ISAAC_SFX_RNG_SHIFT2_VA = 0x00c5d2a8u,
  ISAAC_SFX_RNG_SHIFT3_VA = 0x00c5d2acu,
  ISAAC_SFX_RNG_SEED_DEFAULT = 0x12345678u, /* .data initializer */
  ISAAC_SFX_RNG_SHIFT1_DEFAULT = 5,         /* .rdata 0x00b1f6c0 */
  ISAAC_SFX_RNG_SHIFT2_DEFAULT = 0x1b,      /* .rdata 0x00b1f6c4 */
  ISAAC_SFX_RNG_SHIFT3_DEFAULT = 8,         /* .rdata 0x00b1f6c8 */
  ISAAC_SFX_RNG_SHIFT_TRIPLE_RDATA_VA = 0x00b1f6c0u,
  ISAAC_SFX_RNG_INIT_GUARD_VA = 0x00c94050u, /* magic-static epoch guard */

  /* Immediates / literals. */
  ISAAC_SFX_F32_ONE_BITS = 0x3f800000u,          /* DAT_00baa454 = 1.0f */
  ISAAC_SFX_STOP_FRAME_END_SENTINEL = -1,        /* mov dword [edi+4], -1 */
  ISAAC_SFX_PLAY_STREAM_CREATE_SSO_LIMIT = 0x10, /* cmp [esi+0x1c], 0x10 */

  /* Host residual VAs. */
  ISAAC_SFX_HOST_VA_PLAY = 0x0092dc30u,
  ISAAC_SFX_HOST_VA_SET_VOLUME = 0x0092df40u,
  ISAAC_SFX_HOST_VA_SET_PITCH = 0x0092e050u,
  ISAAC_SFX_HOST_VA_STOP = 0x0092e230u,
  ISAAC_SFX_HOST_VA_STOP_ALL = 0x0092e300u, /* v7 sibling, same receiver */
  ISAAC_SFX_MANAGER_RECEIVER_OFF = 0x2a324u, /* *(0x00c7169c) + this */
  ISAAC_SFX_STOP_SIZE_BYTES = 0xc5,      /* 0x0092e230..0x0092e2f4, 73 insns */
  ISAAC_SFX_STOP_ALL_SIZE_BYTES = 0x123, /* 0x0092e300..0x0092e422, 103 insns */
  ISAAC_SFX_STOP_DIRECT_CALLERS = 51,    /* censused, whole .text */
  ISAAC_SFX_STOP_ALL_DIRECT_CALLERS = 4, /* censused, whole .text */
  ISAAC_SFX_VTBL_QUERY_44_STOP_ALL_ONLY = 1, /* the +0x44 stage is e300-only */
  /* v7 handoff recorded this VA as the family's next frontier; v8 LANDS it
     (whole body below), so this block is now the modelled-root registry, not
     a handoff. The stale shared continuation table still says 0x0092cfb0
     (landed at v3) â€” do not re-open it. */
  ISAAC_SFX_HOST_VA_PRELOAD = 0x0092cf40u,
  ISAAC_SFX_PRELOAD_SIZE_BYTES = 0x64, /* measured 0x92cf40..0x92cfa3 (ret 4);
                                          v8 corrects the v7 estimate 0x62 */
  ISAAC_SFX_LOG_STR_PRELOAD_VA = 0x00b7b1c4u, /* "Preload sound %d.\n" */
  ISAAC_SFX_PRELOAD_CLEARS_ENTRY_199 = 1,     /* 0x0092cf96, unconditional */
  ISAAC_SFX_HOST_VA_CLEAR_VOLUME_MODIFIER = 0x0092e430u,
  ISAAC_SFX_HOST_VA_IS_PLAYING = 0x0092e560u,
  ISAAC_SFX_HOST_VA_SOUND_EFFECT_LOAD = 0x0092cfb0u, /* exact SoundEffect::Load */
  ISAAC_SFX_HOST_VA_LOG = 0x00a112c0u,
  ISAAC_SFX_HOST_VA_CHANNEL_RESET = 0x00a2abd0u,
  ISAAC_SFX_HOST_VA_CHANNEL_ASSIGN = 0x00a2add0u,
  ISAAC_SFX_HOST_VA_CHANNEL_PAN = 0x00a2ac20u,
  ISAAC_SFX_HOST_VA_CHANNEL_RELEASE_INNER = 0x00a2ae60u, /* called by both */
  ISAAC_SFX_HOST_VA_CHANNEL_ATTACH = 0x008f2c90u, /* writes only +0x00/+0x04 */
  ISAAC_SFX_HOST_VA_STRING_DTOR = 0x007e2740u,
  ISAAC_SFX_HOST_VA_SOUND_SYSTEM_GLOBAL = 0x00c5aaa0u,
  ISAAC_SFX_HOST_VA_ATTACH_HOOK_PTR = 0x00c7f484u, /* .data fn-ptr, non-null */

  /* Channel-wrapper reset constants (VA 0x00a2abda..0x00a2abf2, identical at
     VA 0x00a2ade2..0x00a2adfa). */
  ISAAC_SFX_CHANNEL_DEFAULT_LOOP_PENDING_WORD = 0,   /* mov word [+8], 0 */
  ISAAC_SFX_CHANNEL_DEFAULT_FLAG_0A = 0,
  ISAAC_SFX_CHANNEL_DEFAULT_VOLUME_BITS = 0x3f800000u, /* 1.0f */
  ISAAC_SFX_CHANNEL_DEFAULT_PAN_BITS = 0u,             /* 0.0f */
  ISAAC_SFX_CHANNEL_DEFAULT_PITCH_BITS = 0x3f800000u,  /* 1.0f */
  /* Play's `mov word [wrapper+0x09], 1` at VA 0x0092de78. */
  ISAAC_SFX_PLAY_STARTED_WORD = 1,

  /* Pan guard (VA 0x00a2ac44..0x00a2ac62). */
  ISAAC_SFX_PAN_MONO_MAX_CHANNELS = 1,  /* cmp eax,1 ; jle â€” SIGNED */
  ISAAC_SFX_PAN_NEUTRAL_BITS = 0u,      /* DAT_00ba9fe4 = 0.0f */
  ISAAC_SFX_PAN_WARN_LOG_LEVEL = 4,
  ISAAC_SFX_PAN_WARN_STR_VA = 0x00b9c3e0u,

  /* Logger arguments. */
  ISAAC_SFX_LOG_LEVEL_WARN = 1,
  ISAAC_SFX_LOG_LEVEL_FATAL = 0x10,
  ISAAC_SFX_LOG_STR_NO_SAMPLES_VA = 0x00b7b1fcu,
  ISAAC_SFX_LOG_STR_NOT_PRELOADED_VA = 0x00b7b1d8u,
  ISAAC_SFX_LOG_STR_SEED_ZERO_VA = 0x00b6bf54u,

  /* Channel vtable slots (all host). */
  ISAAC_SFX_VTBL_PLAY_PROBE_28 = 0x28,
  ISAAC_SFX_VTBL_START_2C = 0x2c,
  ISAAC_SFX_VTBL_ACTIVITY_38 = 0x38,
  ISAAC_SFX_VTBL_STOP_3C = 0x3c,
  ISAAC_SFX_VTBL_SET_LOOP_40 = 0x40,
  ISAAC_SFX_VTBL_QUERY_44 = 0x44,
  ISAAC_SFX_VTBL_SET_VOLUME_48 = 0x48,
  ISAAC_SFX_VTBL_SET_PAN_50 = 0x50,
  ISAAC_SFX_VTBL_SET_PITCH_58 = 0x58,
  ISAAC_SFX_VTBL_CHANNEL_COUNT_60 = 0x60,
  ISAAC_SFX_VTBL_LIVE_PROBE_0C = 0x0c,
  ISAAC_SFX_VTBL_NAME_0C = 0x0c,
  ISAAC_SFX_VTBL_CREATE_STREAM_24 = 0x24,

  /* ---------- v3 ---------- */

  /* SoundEffect::Load host edges. */
  ISAAC_SFX_HOST_VA_LOAD_REDIRECT_PATH = 0x008f5ad0u, /* exact
                                                         ModManager::
                                                         TryRedirectPath */
  ISAAC_SFX_HOST_VA_LOAD_SUFFIX_COMPARE = 0x00423480u,
  ISAAC_SFX_HOST_VA_LOAD_PATH_FATAL = 0x00499950u, /* size < 4 -> int3 */
  ISAAC_SFX_HOST_VA_LOAD_PATH_MANAGER_OFF = 0x2a6c0u, /* lea ecx,[root+â€¦] */

  /* .rdata 0x00b7b1bc = ".ogg" â€” 4 bytes, compared without a NUL. A match
     means "stream", and Load then skips the whole device-create branch. */
  ISAAC_SFX_LOAD_STREAM_SUFFIX_VA = 0x00b7b1bcu,
  ISAAC_SFX_LOAD_SUFFIX_LEN = 4,
  ISAAC_SFX_LOAD_MIN_PATH_LEN = 4,      /* cmp size,size-4 ; jb  (borrow) */
  ISAAC_SFX_LOAD_SSO_CAPACITY_LIMIT = 0x10, /* cmp capacity,0x10 ; cmovae */
  ISAAC_SFX_LOAD_ENABLED_AFTER = 1,     /* mov byte [entry+0x198], 1 */
  ISAAC_SFX_LOAD_STREAM_BYTE_STREAM = 1,   /* al = 1 on a suffix match */
  ISAAC_SFX_LOAD_STREAM_BYTE_STATIC = 0,   /* xor al,al otherwise */
  /* Voice i spans [0x08 + i*0x38, 0x08 + (i+1)*0x38); voice 6 ends exactly at
     entry[0x190], so the entry holds seven slots and slot 7 IS the header. */
  ISAAC_SFX_LOAD_VOICE_SLOT_CAPACITY = 7,
  ISAAC_SFX_LOAD_HEADER_ALIAS_INDEX = 7,
  ISAAC_SFX_LOAD_CALLER_COUNT = 22,     /* rel32 census over .text */
  /* v22: the device-create arm's probe slot. [created]->vtbl[0x0c] is the
     "is this source valid" probe whose LOW-BYTE result gates the 0xc7f484
     attach hook (PE 0x92d09b..0x92d0a4). */
  ISAAC_SFX_LOAD_PROBE_SLOT_0C = 0x0c,

  /* Channel-wrapper siblings recovered in v3. */
  ISAAC_SFX_HOST_VA_CHANNEL_COPY_ASSIGN = 0x00a2ac90u,
  ISAAC_SFX_HOST_VA_CHANNEL_COPY_CTOR_CALLSITE = 0x00a2ab21u,
  ISAAC_SFX_HOST_VA_CHANNEL_RESET_HOOKED = 0x00a2ab40u,
  ISAAC_SFX_HOST_VA_CHANNEL_START = 0x00a2ac00u,
  ISAAC_SFX_HOST_VA_CHANNEL_ADOPT = 0x008f2d20u, /* conditional pair adopt */
  ISAAC_SFX_CHANNEL_RESET_PACK_SITE_COUNT = 8,   /* whole-.text census */
  ISAAC_SFX_CHANNEL_COPY_ASSIGN_ADOPT_CALLS = 2,
  ISAAC_SFX_CHANNEL_COPY_ASSIGN_HOOK_SITES = 2,
  ISAAC_SFX_CHANNEL_START_ARG = 1, /* the immediate pushed to vtbl[0x2c] */

  /* ---------- v4 ---------- */

  /* The fixed table size the (re)builder resizes to. */
  ISAAC_SFX_TABLE_TARGET_COUNT = 0x443,      /* 1091 */
  ISAAC_SFX_TABLE_TARGET_BYTES = 0x75328,    /* == 0x443 * 0x1b8, asserted */

  /* __ehvec_dtor arguments at VA 0x0092d24a â€” the machine's own statement of
     the seven-slot voice array. */
  ISAAC_SFX_ENTRY_VOICE_DTOR_BASE_OFF = 0x08,
  ISAAC_SFX_ENTRY_VOICE_DTOR_STRIDE = 0x38,
  ISAAC_SFX_ENTRY_VOICE_DTOR_COUNT = 7,

  /* Voice slot internals, proven by the destructor at 0x0092cf10. */
  ISAAC_SFX_VOICE_SLOT_OFF_NAME = 0x00,
  ISAAC_SFX_VOICE_SLOT_OFF_WRAPPER = 0x18,

  /* The entry's OWN std::string (not a voice name): elem+0x1a0..0x1b8. */
  ISAAC_SFX_ENTRY_OFF_NAME_STRING_1A0 = 0x1a0,
  ISAAC_SFX_STRING_OFF_SIZE_10 = 0x10,
  ISAAC_SFX_STRING_OFF_CAPACITY_14 = 0x14,

  /* MSVC string/block free arithmetic shared by both free sites. */
  ISAAC_SFX_STRING_SSO_LIMIT = 0x10,        /* cmp capacity,0x10 ; jb */
  ISAAC_SFX_STRING_BIG_ALLOC_LIMIT = 0x1000,/* cmp size,0x1000 ; jb */
  ISAAC_SFX_STRING_BIG_ALLOC_BIAS = 0x23,   /* add size,0x23 */
  ISAAC_SFX_STRING_ALIGN_SLACK_MAX = 0x1f,  /* cmp slack,0x1f ; ja fatal */
  ISAAC_SFX_STRING_RESET_CAPACITY = 0x0f,   /* mov dword [cap], 0xf */

  /* v4 host VAs. */
  ISAAC_SFX_HOST_VA_TABLE_LOAD = 0x0092d140u,
  ISAAC_SFX_HOST_VA_TABLE_DESTROY_RANGE = 0x0092ea80u,
  ISAAC_SFX_HOST_VA_TABLE_APPEND_N = 0x0092edc0u,
  ISAAC_SFX_HOST_VA_TABLE_GROW = 0x0092ee40u,
  ISAAC_SFX_HOST_VA_VOICE_SLOT_DTOR = 0x0092cf10u,
  ISAAC_SFX_HOST_VA_VECTOR_DTOR_ITER = 0x00aef638u,
  ISAAC_SFX_HOST_VA_STRING_DTOR_40D040 = 0x0040d040u,
  ISAAC_SFX_HOST_VA_FREE = 0x00aef15cu,
  ISAAC_SFX_TABLE_LOAD_CALLER_COUNT = 2 /* rel32 census over .text */
};

/* 0x0092d2f2 / 0x0092d33e outcome. Both compares are UNSIGNED and the second
   branch reuses the first compare's flags. */
enum {
  ISAAC_SFX_TABLE_RESIZE_SHRINK = 0,       /* size > 0x443 : destroy range */
  ISAAC_SFX_TABLE_RESIZE_NONE = 1,         /* size == 0x443 : nothing */
  ISAAC_SFX_TABLE_RESIZE_GROW_INPLACE = 2, /* capacity >= 0x443 : append n */
  ISAAC_SFX_TABLE_RESIZE_GROW_REALLOC = 3  /* capacity <  0x443 : grow */
};

/* Branches this family has PROVEN unreachable. They are flagged, never
   deleted: the arithmetic around them is still modelled exactly, and the
   registry records why the branch cannot be taken so a later unit cannot
   quietly re-introduce it as a live path. */
enum {
  /* VA 0x0092dd7e `test edi,edi ; je 0x0092dd82` guards Play's `div edi`.
     edi is entry[0x190] re-read after SoundEffect::Load; the gate at
     0x0092dca4 already rejected zero with `ja`, and v3 proved Load cannot
     store into entry[0x190]. */
  ISAAC_SFX_DEAD_BRANCH_PLAY_VOICE_DIV_GUARD = 0,
  /* VA 0x0092d1c9 `lea eax,[ebp-0x20] ; cmp eax,esi ; je` â€” an inlined
     self-assignment guard comparing a local of the CURRENT frame against the
     caller-supplied `this`. They cannot be the same object. */
  ISAAC_SFX_DEAD_BRANCH_TABLE_SELF_ASSIGN = 1,
  ISAAC_SFX_DEAD_BRANCH_COUNT = 2
};

/* ---------- v5: XML layout + attribute constants (0x0092d140 C/D) ------- */

/* Node / attribute field offsets read by the (re)builder. The XML document
   itself is host-side; these offsets and the two walk shapes are machine
   facts from the disassembly (see section-notes/sfx-v5/). */
enum {
  ISAAC_SFX_XML_NODE_OFF_NAME_00 = 0x00,    /* name ptr, "" fallback */
  ISAAC_SFX_XML_NODE_OFF_NAME_LEN_08 = 0x08,
  ISAAC_SFX_XML_NODE_OFF_CHILDREN_18 = 0x18,/* children head (sample find) */
  ISAAC_SFX_XML_NODE_OFF_ATTRS_20 = 0x20,   /* attributes head */
  ISAAC_SFX_XML_NODE_OFF_NEXT_2C = 0x2c,    /* next sibling link */

  ISAAC_SFX_XML_ATTR_OFF_NAME_00 = 0x00,    /* name ptr, "" fallback */
  ISAAC_SFX_XML_ATTR_OFF_VALUE_04 = 0x04,   /* value ptr, "" fallback */
  ISAAC_SFX_XML_ATTR_OFF_CONTINUE_10 = 0x10,/* continue test (cmp dword,0) */
  ISAAC_SFX_XML_ATTR_OFF_NEXT_18 = 0x18,    /* next attribute link */

  /* The four attribute names, exactly as read from .rdata of this image,
     plus the "sample" child-node name. Index order is the constant-table
     order the helpers expose (0=id, 1=name, 2=path, 3=weight, 4=sample). */
  ISAAC_SFX_ATTR_NAME_ID_VA = 0x00b1bff0u,
  ISAAC_SFX_ATTR_NAME_NAME_VA = 0x00b1c13cu,
  ISAAC_SFX_ATTR_NAME_PATH_VA = 0x00b66e0cu,
  ISAAC_SFX_ATTR_NAME_WEIGHT_VA = 0x00b1c174u,
  ISAAC_SFX_XML_SAMPLE_ELEMENT_VA = 0x00b7b168u, /* "sample" */
  ISAAC_SFX_XML_SOUND_ELEMENT_VA = 0x00b7b1acu,  /* "sound" */
  ISAAC_SFX_XML_ROOT_ELEMENT_VA = 0x00b66f40u,   /* "root" */
  ISAAC_SFX_XML_SAMPLE_NAME_LEN = 6,  /* strlen("sample") â€” the ==6 gate */
  ISAAC_SFX_ATTR_CONSTANT_COUNT = 5,

  /* The cmovne fallback for every null name/value pointer: the empty string
     at 0x00c71640. It sits in .data past the raw end (a zero page, not
     file-backed) â€” read from the PE section table, never a raw read. */
  ISAAC_SFX_ATTR_EMPTY_STRING_VA = 0x00c71640u,

  /* The numeric parse every "id"/"weight" arm calls, via IAT slot
     0x00b187a8 â€” host (the reader itself is host too). */
  ISAAC_SFX_ATTR_PARSE_IAT_VA = 0x00b187a8u,

  /* Entry fields the fill loop writes that v4 had not yet pinned. */
  ISAAC_SFX_ENTRY_OFF_PAD_199 = 0x199,  /* copied byte â€” UNINITIALIZED stack */
  ISAAC_SFX_ENTRY_OFF_ID_19C = 0x19c,   /* the sound id dword */
  ISAAC_SFX_SLOT_OFF_WEIGHT_34 = 0x34,  /* dword the "weight" parse stores */

  ISAAC_SFX_MAX_SAMPLES_PER_SOUND = 7,  /* cmp voice_count,7 ; jae warn */
  /* the id bound is ISAAC_SFX_TABLE_TARGET_COUNT (0x443) â€” same compare */

  ISAAC_SFX_OUT_OF_BOUNDS_WARN_VA = 0x00b7b170u,   /* level 0x10, no vararg */
  ISAAC_SFX_MAX_SAMPLES_WARN_VA = 0x00b7b220u,     /* level 1, arg = index */

  ISAAC_SFX_HOST_VA_STRING_ASSIGN_40CCD0 = 0x0040ccd0u,
  ISAAC_SFX_HOST_VA_STRING_ASSIGN_421680 = 0x00421680u,
  ISAAC_SFX_HOST_VA_VECTOR_EMPLACE = 0x0092e830u,   /* end < cap: push */
  ISAAC_SFX_HOST_VA_VECTOR_GROW_APPEND = 0x0092e900u, /* end == cap: grow */
  ISAAC_SFX_HOST_VA_EHVEC_CTOR = 0x00aef5c4u,

  /* Attribute-walk site A/B selection. Entry: first=id (numeric parse),
     second=name (string assign). Slot: first=path (string assign),
     second=weight (numeric parse). */
  ISAAC_SFX_ATTR_SITE_ENTRY = 0,
  ISAAC_SFX_ATTR_SITE_SLOT = 1,

  ISAAC_SFX_ATTR_ARM_NONE = 0,
  ISAAC_SFX_ATTR_ARM_FIRST = 1,
  ISAAC_SFX_ATTR_ARM_SECOND = 2,

  ISAAC_SFX_ATTR_ACTION_NONE = 0,
  ISAAC_SFX_ATTR_ACTION_NUMERIC_PARSE = 1,
  ISAAC_SFX_ATTR_ACTION_STRING_ASSIGN = 2
};

/* ---------- v6: tail constants and original-defect pins (0x92da86) ------ */

/* The two logger warn stack shapes. 0x0092d6cf pushes ONLY the format
   string 0x00b7b170 and the level 0x10 â€” NO vararg word for its "%d": the
   PE formats garbage. The max-samples warn at 0x0092da76 pushes the index,
   the format 0x00b7b220, then the level 1. The shapes must never be
   conflated (a "fix" wedging the index into the first call would change
   observable behaviour â€” original defect, reproduced and pinned). */
enum {
  ISAAC_SFX_WARN_KIND_OUT_OF_BOUNDS = 0,
  ISAAC_SFX_WARN_KIND_MAX_SAMPLES = 1,
  ISAAC_SFX_OUT_OF_BOUNDS_WARN_LEVEL = 0x10, /* push 0x10 at 0x0092d6d4 */
  ISAAC_SFX_MAX_SAMPLES_WARN_LEVEL = 1,      /* push 1   at 0x0092da7c */
  ISAAC_SFX_OUT_OF_BOUNDS_WARN_ARGS = 2,     /* fmt + level only */
  ISAAC_SFX_MAX_SAMPLES_WARN_ARGS = 3,       /* index + fmt + level */
  ISAAC_SFX_OUT_OF_BOUNDS_WARN_VARARGS = 0,  /* the "%d" gets garbage */
  ISAAC_SFX_MAX_SAMPLES_WARN_VARARGS = 1
};

/* The fill loop's five header stores (0x0092d7b3..0x0092d7ef). Two of their
   sources are stack slots the proto builder NEVER initializes (0x92d494..
   0x92d4c3 writes 0x190/0x198/0x19c, the string and its size/cap), so the
   stores to entry[0x194] (movss from [ebp-0x1026c]) and entry[0x199]
   (movzx from [ebp-0x10267]) copy uninitialized garbage. Original defect,
   reproduced and pinned â€” these two bits are what the fill plan's
   "uninit" accessor reports. */
enum {
  ISAAC_SFX_FILL_HEADER_COUNT = 5,
  ISAAC_SFX_FILL_HEADER_OFF_0 = 0x190, /* voice count (proto[0x190], init 0) */
  ISAAC_SFX_FILL_HEADER_OFF_1 = 0x194, /* base volume â€” UNINITIALIZED */
  ISAAC_SFX_FILL_HEADER_OFF_2 = 0x198, /* enabled byte (proto[0x198], init) */
  ISAAC_SFX_FILL_HEADER_OFF_3 = 0x199, /* pad byte â€” UNINITIALIZED */
  ISAAC_SFX_FILL_HEADER_OFF_4 = 0x19c, /* the sound id */
  ISAAC_SFX_FILL_HEADER_UNINIT_MASK = 0x0a /* bits 1 and 3: 0x194 + 0x199 */
};

/* Tail host edges. */
enum {
  /* __ehvec_ctor (0x00aef5c4u) at the loop head 0x92d48f, __ehvec_dtor
     (0x00aef638u) in the tail 0x92db09 â€” the proto voice-array lifecycle. */
  ISAAC_SFX_HOST_VA_EHVEC_DTOR = 0x00aef638u,
  ISAAC_SFX_HOST_VA_ABORT_B18894 = 0x00b18894u,/* IAT abort of the corrupt free */
  ISAAC_SFX_HOST_VA_DOC_DTOR_414730 = 0x00414730u, /* epilogue (next unit) */
  ISAAC_SFX_TAIL_CHAIN_OFF_2C = 0x2c /* sound[0x2c] â€” the next link */
};

/* Which of Play's post-Load reads still have to come from the host. The two
   cleared bits are the whole point of the v3 Load split: SoundEffect::Load
   provably cannot store into entry[0x004] or entry[0x190]. */
enum {
  ISAAC_SFX_PLAY_RECAPTURE_NONE = 0,
  ISAAC_SFX_PLAY_RECAPTURE_ENTRY_END_4 = 1,
  ISAAC_SFX_PLAY_RECAPTURE_VOICES_190 = 2,
  ISAAC_SFX_PLAY_RECAPTURE_STREAM_FLAG = 4
};

/* Which root's prologue a gate classification is for. The three forms agree on
   the four tests and disagree on what happens at the exits. */
enum {
  ISAAC_SFX_GATE_FORM_MUTATOR = 0, /* 0x0092df40 / 0x0092e050 / 0x0092e230 */
  ISAAC_SFX_GATE_FORM_PLAY = 1,    /* 0x0092dc30 */
  ISAAC_SFX_GATE_FORM_PROBE = 2    /* 0x0092e560 */
};

/* 0x00a2ac20 outcome after the pan value has already been stored. */
enum {
  ISAAC_SFX_PAN_ACTION_NONE = 0, /* no channel object: store only */
  ISAAC_SFX_PAN_ACTION_SET = 1,  /* vtbl[0x50](pan) */
  ISAAC_SFX_PAN_ACTION_WARN = 2  /* non-mono + non-neutral pan: log, no set */
};

/* Mutator entry-table gate (0x0092df40 / 0x0092e050 / 0x0092e230):
     if ((int32)id < 0)                  -> MISS   (js, immediate return)
     count = span / 0x1b8                (signed magic divide)
     if ((int32)id >= count)             -> MISS   (jge, immediate return)
     if (entry[0x190] == 0u)             -> NO_SAMPLES (warn log, return)
     if ((entry[0x198] & 0xff) == 0)     -> DISABLED (immediate return)
     else                                -> LIVE   (per-voice host loop) */
enum {
  ISAAC_SFX_GATE_MISS = 0,
  ISAAC_SFX_GATE_NO_SAMPLES = 1,
  ISAAC_SFX_GATE_DISABLED = 2,
  ISAAC_SFX_GATE_LIVE = 3
};

/* Play uses the SAME first three tests but a DIFFERENT fourth one: a disabled
   entry does not return. VA 0x0092dcd1..0x0092dcf4 calls SoundEffect::Load
   (0x0092cfb0), logs "[warn] Sound %d was not preloaded.", increments
   this[0xc], and FALLS THROUGH into the frame-window test. Modelling Play
   with the mutator gate would silently drop a whole preload path. */
enum {
  ISAAC_SFX_PLAY_GATE_MISS = 0,
  ISAAC_SFX_PLAY_GATE_NO_SAMPLES = 1,
  ISAAC_SFX_PLAY_GATE_PRELOAD = 2, /* enabled == 0: Load + warn + counter */
  ISAAC_SFX_PLAY_GATE_LIVE = 3
};

/* Gate resolution for one (id, entry) pair. */
typedef struct IsaacSfxGate {
  int32_t kind;             /* MISS / NO_SAMPLES / DISABLED|PRELOAD / LIVE */
  int32_t entry_count;      /* signed span / 0x1b8 */
  int32_t entry_offset;     /* id * 0x1b8 (32-bit wrap); 0 when out of range */
  int32_t index_in_range;   /* 1 when 0 <= id < entry_count */
  int32_t warn_log_needed;  /* 1 when kind == NO_SAMPLES */
  int32_t voice_loop_needed;/* 1 when the per-voice host loop runs */
  int32_t no_effect;        /* 1 when the callee returns with no side effect */
} IsaacSfxGate;

/* Per-voice activity decision shared by every voice loop in this family
   (VA 0x0092dfc0..0x0092dfec, 0x0092e0b7..0x0092e0e3,
    0x0092e2a7..0x0092e2d3, 0x0092e48a..0x0092e4be).

     ch = voice[0x00];
     if (ch == 0) -> skip (no host call at all)
     if (voice[0x09] != 0) { if (ch->vtbl[0x38]()) voice[0x09] = 0; }
     r = ch->vtbl[0x38]();                 // reloaded ptr, UNCHECKED deref
     if (r == 0 && voice[0x09] == 0) -> skip
     else -> act

   The two probe results are host inputs; the decision over them is pure.
   Note the second probe is issued even when the first was skipped, and the
   compare at the end reads the possibly-cleared pending byte, not the
   original. */
typedef struct IsaacSfxVoiceDecision {
  int32_t first_probe_needed;  /* ch != 0 && pending != 0 */
  int32_t second_probe_needed; /* ch != 0 (then dereferenced unconditionally) */
  int32_t pending_cleared;     /* first probe truthy -> byte := 0 */
  int32_t pending_after;       /* pending byte the final compare sees */
  int32_t act;                 /* 1 when the mutator body runs for this voice */
  int32_t skip;                /* !act */
} IsaacSfxVoiceDecision;

/* SFXManager::Play input pack. Every field is 4 bytes so the Wasm-side layout
   is unambiguous; byte-width PE tests are applied inside (documented per
   field). Fields marked "recaptured" are host-supplied because an opaque call
   can move them. */
typedef struct IsaacSfxPlayInput {
  int32_t id;                 /* [ebp+8] */
  int32_t span_bytes;         /* this[4] - this[0] */
  uint32_t voices_190;        /* entry[0x190] as first read (VA 0x0092dca4).
                                 v3: the re-read at VA 0x0092dd1a uses this
                                 same value â€” SoundEffect::Load cannot store
                                 into entry[0x190], so the old
                                 voices_after_load recapture is gone. */
  uint32_t enabled_198;       /* entry[0x198]; only the low byte is tested */
  int32_t clock_4abbc;        /* *(int32*)(root + 0x4abbc) */
  int32_t entry_end_4;        /* entry[4] at VA 0x0092dcff. v3: a single
                                 capture, not a recapture â€” Load does not
                                 store into entry[0x004] either. */
  int32_t frame_delay;        /* [ebp+0x10] */
  uint32_t rng_seed;          /* *(uint32*)0x00c5d2a0 */
  uint32_t rng_shift1;        /* *(uint32*)0x00c5d2a4 */
  uint32_t rng_shift2;        /* *(uint32*)0x00c5d2a8 */
  uint32_t rng_shift3;        /* *(uint32*)0x00c5d2ac */
  uint32_t stream_flag_38;    /* entry[v*0x38 + 0x38] low byte â€” the ONE
                                 remaining recaptured input. SoundEffect::Load
                                 writes it as `resolved path ends in ".ogg"`,
                                 which is an IO result. */
  int32_t loop_arg;           /* [ebp+0x14]; the vtable +0x40 call gets the
                                 whole dword, the store keeps only dl */
  float volume;               /* [ebp+0xc] */
  float pitch;                /* [ebp+0x18] */
  float pan;                  /* [ebp+0x1c] */
  float mgr_volume_modifier;  /* this[0x10] */
  float master_volume;        /* *(float*)(root + 0x2a358) */
} IsaacSfxPlayInput;

/* SFXManager::Play resolved plan. */
typedef struct IsaacSfxPlayPlan {
  int32_t gate_kind;          /* MISS / NO_SAMPLES / PRELOAD / LIVE */
  int32_t entry_count;
  int32_t entry_offset;
  int32_t warn_no_samples;    /* host log then immediate return */
  int32_t preload_needed;     /* host SoundEffect::Load + warn + this[0xc]++ */
  int32_t window_open;        /* 1 when the PE proceeds past VA 0x0092dd06 */
  int32_t frame_start;        /* entry[0]   = clock >> 1 (arithmetic) */
  int32_t frame_end;          /* entry[4]   = frame_start + FrameDelay (wrap) */
  int32_t entry_stores_done;  /* 1 when the three entry stores happen */
  int32_t rng_advanced;       /* 1 when the xorshift ran and stored back */
  uint32_t rng_seed_out;      /* 0x00c5d2a0 after the step */
  int32_t seed_zero_fatal;    /* seed == 0 -> log + re-read + int3 path */
  uint32_t voice_index;       /* seed_out % voices_after_load, or 0 */
  int32_t voice_offset;       /* voice_index * 0x38 (32-bit wrap) */
  int32_t stream_create_needed; /* stream flag byte != 0 -> device create */
  int32_t voice_loop_byte;    /* voice[0x08] = (uint8)loop_arg â€” the store
                                 keeps only dl ... */
  int32_t voice_loop_arg;     /* ... while the +0x40 vtable call receives the
                                 whole dword (host echo) */
  float entry_volume;         /* entry[0x194] = Volume */
  float voice_volume;         /* voice[0x0c] = min(clamp0(mod)*Vol*master,1) */
  float voice_pitch;          /* voice[0x14] = Pitch (raw 32-bit copy) */
  float voice_pan;            /* xmm1 argument of 0x00a2ac20 (host echo) */
  int32_t pure_complete;      /* 1 iff the PE performs no host action at all */
  int32_t host_needed;        /* !pure_complete */
} IsaacSfxPlayPlan;

/* SoundEffects::ClearVolumeModifier per-(entry, voice) plan.
   Outer walk VA 0x0092e441..0x0092e54d, inner walk VA 0x0092e480..0x0092e520.
   Two structural differences from the mutators:
     - a zero voice count skips the entry with NO warn log (jbe 0x0092e474)
     - the enabled byte is tested INSIDE the voice loop (0x0092e480), so a
       disabled entry still advances the cursor once per voice
   and one arithmetic difference: the volume product is stored WITHOUT the
   minss 1.0f clamp that Play and the set-volume mutator apply. */
typedef struct IsaacSfxClearVolumePlan {
  int32_t entry_count;      /* span / 0x1b8 */
  int32_t walk_enter;       /* count != 0 (je 0x0092e459) */
  int32_t entry_voices_open;/* voices != 0, unsigned (jbe 0x0092e474) */
  int32_t voice_enabled;    /* per-voice enabled byte test */
  int32_t voice_visited;    /* walk_enter && entry_voices_open */
  int32_t voice_gate_open;  /* voice_visited && voice_enabled â€” the walk
                               reaches the per-voice activity decision
                               (IsaacSfxVoiceDecision) for this slot */
  float voice_volume;       /* clamp0(mod) * entry[0x194] * master, unclamped;
                               the value the acting voice stores at +0x0c and
                               passes to the +0x48 vtable call. 0.0f when the
                               slot is never reached. */
} IsaacSfxClearVolumePlan;

/* ---------- SG: entry-table gate ---------- */

/* count = span / 0x1b8 through the PE magic multiply (exact truncation). */
int32_t isaac_sfx_entry_count(int32_t span_bytes);

/* imul reg, id, 0x1b8 â€” 32-bit wrapping multiply, no range check. */
int32_t isaac_sfx_entry_offset(int32_t id);

/* 1 when the PE reaches the entry loads: id >= 0 (js) and id < count (jge). */
int32_t isaac_sfx_id_in_range(int32_t id, int32_t span_bytes);

/* Mutator gate (stop / set volume / set pitch). enabled_198 is tested as a
   byte; voices_190 as a full unsigned dword. */
int32_t isaac_sfx_mutator_gate(int32_t id,
                               int32_t span_bytes,
                               uint32_t voices_190,
                               uint32_t enabled_198);

/* Play gate. Same first three tests, DISABLED replaced by PRELOAD. */
int32_t isaac_sfx_play_gate(int32_t id,
                            int32_t span_bytes,
                            uint32_t voices_190,
                            uint32_t enabled_198);

/* 1 when a mutator returns with no observable effect at all (MISS/DISABLED).
   NO_SAMPLES still emits the warn log; LIVE still runs the voice loop.
   MUTATOR FORM ONLY â€” see isaac_sfx_gate_no_effect. */
int32_t isaac_sfx_mutator_no_effect(int32_t gate_kind);

/* Form-aware "did this exit do nothing at all". Necessary because
   ISAAC_SFX_GATE_DISABLED and ISAAC_SFX_PLAY_GATE_PRELOAD are BOTH 2: the
   kind number alone cannot tell "the mutator returned" from "Play preloaded
   and carried on", and answering that question from the bare number is a
   silent way to delete the whole preload + playback path. Always pass the
   form. Per form:
     MUTATOR : MISS or DISABLED
     PLAY    : MISS only (PRELOAD calls SoundEffect::Load and continues)
     PROBE   : anything that is not LIVE (it never logs) */
int32_t isaac_sfx_gate_no_effect(int32_t gate_kind, int32_t form);

/* The probe at 0x0092e560 classifies exactly like a mutator (a disabled entry
   returns), so this is the same function; it exists so callers do not have to
   assume the coincidence. */
int32_t isaac_sfx_probe_gate(int32_t id,
                             int32_t span_bytes,
                             uint32_t voices_190,
                             uint32_t enabled_198);

/* Does this exit emit "[warn] Sound %d has no samples."? Play and the three
   mutators do; the probe jumps straight to `xor al,al` and does not
   (VA 0x0092e5a4). form is ISAAC_SFX_GATE_FORM_*. */
int32_t isaac_sfx_gate_warn_log_needed(int32_t gate_kind, int32_t form);

/* Struct form. `form` is ISAAC_SFX_GATE_FORM_* (0 = mutator, 1 = play,
   2 = probe); any non-zero value other than 2 is treated as Play, which keeps
   the v1 boolean call sites valid. out may be null (no-op). */
void isaac_sfx_gate_plan(int32_t id,
                         int32_t span_bytes,
                         uint32_t voices_190,
                         uint32_t enabled_198,
                         int32_t form,
                         IsaacSfxGate* out);

/* ---------- SV: voice cursor + loop control flow ---------- */

/* Byte offset of voice i inside the entry: 0x20 + i*0x38 (32-bit wrap). */
int32_t isaac_sfx_voice_base_offset(int32_t index);

/* Byte offset of the pending flag: 0x29 + i*0x38 â€” the actual PE cursor
   (`lea esi, [entry + 0x29]`, `add esi, 0x38`). */
int32_t isaac_sfx_voice_pending_offset(int32_t index);

/* Loop-back test after a voice body: `inc; cmp; jb` against the voice count
   RE-READ from the entry, unsigned. */
int32_t isaac_sfx_voice_loop_continue(uint32_t next_index,
                                      uint32_t voices_reloaded);

/* ---------- SA: per-voice activity decision ---------- */

int32_t isaac_sfx_voice_first_probe_needed(int32_t channel_null,
                                           uint32_t pending_09);

/* Pending byte value the final compare observes. */
int32_t isaac_sfx_voice_pending_after(int32_t channel_null,
                                      uint32_t pending_09,
                                      int32_t probe_first);

/* 1 when the mutator body runs for this voice. */
int32_t isaac_sfx_voice_act(int32_t channel_null,
                            uint32_t pending_09,
                            int32_t probe_first,
                            int32_t probe_second);

/* Struct form. out may be null (no-op). */
void isaac_sfx_voice_decide(int32_t channel_null,
                            uint32_t pending_09,
                            int32_t probe_first,
                            int32_t probe_second,
                            IsaacSfxVoiceDecision* out);

/* Stop-specific tail (VA 0x0092e2d3): the pointer is reloaded and re-checked
   before the +0x3c vtable call, and the pending byte is cleared only when
   that reload is non-null. Returns 1 when the pending clear happens. */
int32_t isaac_sfx_stop_clears_pending(int32_t act, int32_t channel_null_reload);

/* Value the stop loop writes to entry[4] at the TOP of every voice iteration
   (VA 0x0092e2a0): a plain -1 sentinel, not a computed stamp. */
int32_t isaac_sfx_stop_frame_end_value(void);

/* ---------- SM: volume / pitch float arithmetic ---------- */

/* VA 0x0092de22 / 0x0092dfef / 0x0092e4c1:
     xorps xmm1,xmm1 ; comiss mod,xmm1 ; ja keep ; else 0.0f
   Ordered-greater only, so NaN and -0.0f both collapse to +0.0f. */
float isaac_sfx_volume_modifier_base(float mgr_volume_modifier);

/* minss x, 1.0f â€” `(x < 1.0f) ? x : 1.0f`, so NaN yields 1.0f. */
float isaac_sfx_min_one(float x);

/* Play (VA 0x0092de41) and the set-volume mutator (VA 0x0092e00e) share:
     min( clamp0(mod) * volume * master , 1.0f )
   Multiplies are left-to-right, each rounded to float32. */
float isaac_sfx_voice_volume_clamped(float mgr_volume_modifier,
                                     float volume,
                                     float master_volume);

/* ClearVolumeModifier (VA 0x0092e4df) uses the entry's stored base volume and
   omits the minss, so the product can exceed 1.0f. */
float isaac_sfx_voice_volume_unclamped(float mgr_volume_modifier,
                                       float entry_base_volume,
                                       float master_volume);

/* ---------- SP: SFXManager::Play pure islands ---------- */

/* `sar ecx, 1` on the global frame clock â€” arithmetic, so negatives floor. */
int32_t isaac_sfx_play_frame_half(int32_t clock_4abbc);

/* VA 0x0092dd04..0x0092dd0a:
     cmp half, entry_end ; jge open ; test entry_end,entry_end ; jns return
   The PE returns iff (half < entry_end) && (entry_end >= 0). Returns 1 when
   Play proceeds. A negative entry_end therefore always re-opens the window. */
int32_t isaac_sfx_play_window_open(int32_t clock_4abbc, int32_t entry_end_4);

/* entry[4] = (clock>>1) + FrameDelay with 32-bit wrap (`add eax, ecx`). */
int32_t isaac_sfx_play_frame_end(int32_t clock_4abbc, int32_t frame_delay);

/* Exact 32-bit xorshift at VA 0x0092dd51..0x0092dd77 over the 0x00c5d2a0
   quad. Shift counts are masked to 5 bits like the x86 shr/shl cl encoding.
   Defaults are (5, 27, 8) â€” distinct from the 0x00c5d2b0 stream. */
uint32_t isaac_sfx_rng_next(uint32_t seed,
                            uint32_t shift1,
                            uint32_t shift2,
                            uint32_t shift3);

/* VA 0x0092dd75..0x0092dd80: `xor edx,edx ; test edi,edi ; je ; div edi`.
   Unsigned remainder, and a zero voice count skips the divide entirely and
   leaves index 0 rather than faulting. */
uint32_t isaac_sfx_voice_select(uint32_t seed_out, uint32_t voices);

/* VA 0x0092dd82..0x0092dd90: `lea eax,[edx*8] ; sub eax,edx` then an *8
   address scale â€” i.e. index * 0x38 with 32-bit wrap at both steps. */
int32_t isaac_sfx_voice_pick_offset(uint32_t voice_index);

/* Byte offset of the stream-reload flag the PE tests for the picked voice:
   entry + v*0x38 + 0x38 (== voice base + 0x18). */
int32_t isaac_sfx_play_stream_flag_offset(uint32_t voice_index);

/* Full Play plan. in_ and out may be null (no-op when out is null). */
void isaac_sfx_play_plan(const IsaacSfxPlayInput* in_, IsaacSfxPlayPlan* out);

/* ---------- SC: SoundEffects::ClearVolumeModifier ---------- */

/* `je 0x0092e459` on the computed entry count: an empty table returns. */
int32_t isaac_sfx_clear_volume_walk_enter(int32_t span_bytes);

/* `cmp dword [entry+0x190], 0 ; jbe` â€” unsigned, per entry, no warn log. */
int32_t isaac_sfx_clear_volume_entry_open(uint32_t voices_190);

/* `cmp byte [entry+0x198], 0 ; je next_voice` â€” re-tested per voice. */
int32_t isaac_sfx_clear_volume_voice_enabled(uint32_t enabled_198);

/* Struct form. out may be null (no-op). */
void isaac_sfx_clear_volume_plan(int32_t span_bytes,
                                 uint32_t voices_190,
                                 uint32_t enabled_198,
                                 float mgr_volume_modifier,
                                 float entry_base_volume,
                                 float master_volume,
                                 IsaacSfxClearVolumePlan* out);

/* ---------- SQ: is-playing probe 0x0092e560 (v2) ---------- */

/* One voice's recaptured host inputs for the probe / mutator voice loops.
   16 bytes, all 4-byte fields. */
typedef struct IsaacSfxVoiceSample {
  int32_t channel_null;  /* 1 when wrapper[0x00] reads as 0 */
  uint32_t pending_09;   /* wrapper[0x09]; only the low byte is tested */
  int32_t probe_first;   /* result of the conditional vtbl[0x38] call */
  int32_t probe_second;  /* result of the unconditional vtbl[0x38] call */
} IsaacSfxVoiceSample;

typedef struct IsaacSfxProbePlan {
  int32_t gate_kind;         /* MISS / NO_SAMPLES / DISABLED / LIVE */
  int32_t result;            /* the al the PE returns (0 or 1) */
  int32_t known_without_host;/* 1 when no vtbl[0x38] call is needed at all */
  int32_t voices_visited;    /* iterations the walk actually executes */
  int32_t probe_calls;       /* vtbl[0x38] calls the walk issues */
  int32_t first_active_index;/* index that short-circuits to al=1, else -1 */
  uint32_t pending_clear_mask; /* bit i set when voice i's byte is zeroed */
  int32_t pure_complete;     /* 1 when the PE performs no host action */
} IsaacSfxProbePlan;

/* Byte offsets the probe cursor reaches. entry_offset is id*0x1b8; the PE
   keeps it in ebx and adds 0x38 per iteration, so both wrap at 32 bits. */
int32_t isaac_sfx_probe_voice_channel_offset(int32_t entry_offset,
                                             int32_t index);
int32_t isaac_sfx_probe_voice_pending_offset(int32_t entry_offset,
                                             int32_t index);

/* How many vtbl[0x38] calls one voice iteration issues: 0 with no channel,
   2 when the pending byte is set (conditional probe then unconditional one),
   1 otherwise. */
int32_t isaac_sfx_probe_voice_probe_calls(int32_t channel_null,
                                          uint32_t pending_09);

/* 1 when the answer is decided before the voice loop (every non-LIVE gate). */
int32_t isaac_sfx_is_playing_known(int32_t gate_kind);

/* The answer on those short-circuit exits. Every one of them lands on
   `xor al,al` at VA 0x0092e5ff, so this is always 0. */
int32_t isaac_sfx_is_playing_short_circuit_result(int32_t gate_kind);

/* Walk the voice loop at VA 0x0092e5b4..0x0092e5fb. The per-voice test is
   byte-identical to isaac_sfx_voice_act; the walk stops at the FIRST acting
   voice (`jne 0x0092e608`), so later samples are never consulted and their
   probe calls are never issued. count is the voice count; the PE re-reads it
   from the live vector every iteration, so the caller supplies the value that
   was in force for the walk it is modelling. out may be null (no-op). */
void isaac_sfx_is_playing_walk(int32_t gate_kind,
                               const IsaacSfxVoiceSample* samples,
                               int32_t count,
                               IsaacSfxProbePlan* out);

/* ---------- SW: 16-bit stores over two byte fields (v2) ---------- */

/* `mov word [wrapper+N], imm` writes two adjacent byte fields at once.
   Modelling either store as a single byte write is wrong: the reset clears
   loop AND pending, and Play's started-store sets pending AND clears +0x0a. */
int32_t isaac_sfx_word_store_lo(uint32_t word);
int32_t isaac_sfx_word_store_hi(uint32_t word);

/* ---------- SR / SN: channel wrapper reset + assign (v2) ---------- */

typedef struct IsaacSfxChannelDefaults {
  int32_t loop_08;
  int32_t pending_09;
  int32_t flag_0a;
  float volume_0c;
  float pan_10;
  float pitch_14;
} IsaacSfxChannelDefaults;

typedef struct IsaacSfxChannelAssignPlan {
  int32_t release_needed;  /* 0x00a2ae60 always runs first */
  int32_t attach_needed;   /* 0x008f2c90 always runs after the reset */
  int32_t device_calls;    /* 4 when the attached channel is live, else 0 */
  int32_t set_loop_arg;    /* movzx of the just-cleared loop byte => 0 */
  float set_volume_arg;    /* wrapper[0x0c] => 1.0f */
  float set_pan_arg;       /* wrapper[0x10] => 0.0f */
  float set_pitch_arg;     /* wrapper[0x14] => 1.0f */
} IsaacSfxChannelAssignPlan;

/* Constant pack both 0x00a2abd0 and 0x00a2add0 write. out may be null. */
void isaac_sfx_channel_reset_defaults(IsaacSfxChannelDefaults* out);

/* The release at 0x00a2ae60 precedes the stores in both helpers. */
int32_t isaac_sfx_channel_reset_release_first(void);

/* 0x00a2add0. The four device arguments are provably the reset constants:
   the reset stores happen before 0x008f2c90 and that attach writes only
   wrapper[0x00] and wrapper[0x04] (a pointer-pair swap, VA 0x008f2cc4..
   0x008f2cd8). channel_null_after_attach is recaptured. out may be null. */
void isaac_sfx_channel_assign_plan(int32_t channel_null_after_attach,
                                   IsaacSfxChannelAssignPlan* out);

/* ---------- SX: channel set-pan 0x00a2ac20 (v2) ---------- */

typedef struct IsaacSfxChannelPanPlan {
  int32_t action;            /* NONE / SET / WARN */
  int32_t store_needed;      /* always 1: wrapper[0x10] = pan before the test */
  int32_t count_probe_needed;/* 1 when vtbl[0x60] is called */
  int32_t warn_log_needed;   /* 1 when action == WARN */
  float stored_pan;          /* raw 32-bit copy of the argument */
} IsaacSfxChannelPanPlan;

/* VA 0x00a2ac49..0x00a2ac54: `ucomiss pan,[0x00ba9fe4]` then the MSVC
   `lahf ; test ah,0x44 ; jnp` equality idiom. The branch is taken only for an
   ORDERED equality, so -0.0f counts as neutral and NaN does not. */
int32_t isaac_sfx_pan_equals_neutral(float pan);

/* NONE when there is no channel; otherwise SET when the source is mono
   (`cmp eax,1 ; jle` â€” SIGNED, so a negative count also counts as mono) or
   the pan is neutral; WARN otherwise (log level 4, string 0x00b9c3e0, and
   the device is NOT told about the pan). */
int32_t isaac_sfx_channel_pan_action(int32_t channel_null,
                                     int32_t channel_count,
                                     float pan);

/* Struct form. out may be null (no-op). */
void isaac_sfx_channel_pan_plan(int32_t channel_null,
                                int32_t channel_count,
                                float pan,
                                IsaacSfxChannelPanPlan* out);

/* ---------- RNG stream identity (v2) ---------- */

/* Carried natively so a caller cannot silently reuse the 0x00c5d2b0 stream
   the PM3 pre-play helper drives. The two generators have the same shape and
   adjacent addresses; merging them would desynchronise audio RNG from
   gameplay RNG with no visible error. */
typedef struct IsaacSfxRngDefaults {
  uint32_t seed;
  uint32_t shift1;
  uint32_t shift2;
  uint32_t shift3;
  uint32_t seed_va;
  uint32_t shift_rdata_va;
} IsaacSfxRngDefaults;

void isaac_sfx_rng_defaults(IsaacSfxRngDefaults* out);

/* ---------- SL: SoundEffect::Load bookkeeping split (v3) ---------- */

/* Entry-level result of one 0x0092cfb0 call. Nothing here needs a device. */
typedef struct IsaacSfxLoadPlan {
  int32_t voice_loop_enter;    /* voices != 0 (cmp â€¦,0 ; jbe â€” unsigned) */
  uint32_t voices_visited;     /* == voices: the bound is re-read per pass and
                                  Load never writes it */
  int32_t enabled_after;       /* entry[0x198] := 1 on BOTH paths */
  uint32_t voices_after;       /* entry[0x190] â€” unchanged */
  int32_t frame_start_after;   /* entry[0x000] â€” unchanged */
  int32_t frame_end_after;     /* entry[0x004] â€” unchanged */
  int32_t entry_header_stores; /* always exactly 1 (the enabled byte) */
  uint32_t stream_byte_stores; /* one per visited voice */
  int32_t header_alias_index;  /* first visited voice whose own bytes overlap
                                  entry[0x190..0x1b8), else -1 */
  int32_t pure_complete;       /* 1 iff voices == 0: the enabled store is the
                                  only thing that happens */
} IsaacSfxLoadPlan;

/* Per-voice result. resolved_size / capacity / suffix_compare_result are the
   host inputs (the resolved path is IO); everything else is decided here. */
typedef struct IsaacSfxLoadVoicePlan {
  int32_t name_offset;          /* entry + 0x08 + i*0x38 (TryRedirectPath arg) */
  int32_t wrapper_offset;       /* entry + 0x20 + i*0x38 */
  int32_t stream_byte_offset;   /* entry + (i+1)*0x38 == wrapper + 0x18 */
  int32_t path_len_fatal;       /* resolved_size < 4 -> 0x00499950 + int3 */
  int32_t suffix_compare_needed;/* !path_len_fatal */
  int32_t compare_length;       /* the cmovb can never fire: always 4 */
  int32_t uses_heap_buffer;     /* capacity >= 0x10 */
  int32_t stream_byte_value;    /* 1 on a ".ogg" match, else 0 */
  int32_t device_create_needed; /* !match: sound-system vtbl[0x24] */
  int32_t channel_assign_needed;/* !match: 0x00a2add0 */
  int32_t heap_free_needed;     /* capacity >= 0x10 */
  int32_t aliases_entry_header; /* this voice's bytes overlap the header */
} IsaacSfxLoadVoicePlan;

int32_t isaac_sfx_load_voice_name_offset(int32_t index);
int32_t isaac_sfx_load_voice_wrapper_offset(int32_t index);
int32_t isaac_sfx_load_stream_byte_offset(int32_t index);

/* `lea ecx,[size-4] ; cmp size,ecx ; jb fatal`. The subtraction borrows iff
   size < 4, so this is an exact unsigned "shorter than the suffix" test. */
int32_t isaac_sfx_load_path_len_fatal(uint32_t resolved_size);

/* PE truth: past that guard `sub eax,ecx` yields exactly 4, so the
   `cmp eax,edx ; cmovb edx,eax` at 0x0092d03b never takes the cmov. */
int32_t isaac_sfx_load_compare_length(uint32_t resolved_size);

/* MSVC short-string select: `cmp capacity,0x10 ; cmovae ptr,heap`. */
int32_t isaac_sfx_load_uses_heap_buffer(uint32_t capacity);

/* al after the compare: 1 when 0x00423480 returned 0 (".ogg"), else 0. */
int32_t isaac_sfx_load_stream_byte(int32_t suffix_compare_result);

/* 1 iff voice `index` fits entirely below entry[0x190] (index 0..6). */
int32_t isaac_sfx_load_voice_slot_in_bounds(int32_t index);

/* 1 iff voice `index`'s own bytes overlap entry[0x190..0x1b8) â€” true only for
   index 7, where the "name string" is the voice count / base volume /
   enabled byte. Reproduced, not corrected. */
int32_t isaac_sfx_load_voice_aliases_entry_header(int32_t index);

/* 1 iff SoundEffect::Load can store any byte inside the 4-byte entry field at
   `offset` when the entry reports `voices` voices. The only stores are the
   enabled byte at 0x198 and one byte at (i+1)*0x38 per visited voice.
   Negative offsets answer 0 (entry fields are non-negative). */
int32_t isaac_sfx_load_writes_entry_field(int32_t offset, uint32_t voices);

void isaac_sfx_load_voice_plan(int32_t index,
                               uint32_t resolved_size,
                               uint32_t capacity,
                               int32_t suffix_compare_result,
                               IsaacSfxLoadVoicePlan* out);

/* frame_start / frame_end are passed in only so the plan can state that Load
   leaves them alone; they are echoed unchanged. out may be null (no-op). */
void isaac_sfx_load_plan(uint32_t voices_190,
                         int32_t frame_start,
                         int32_t frame_end,
                         IsaacSfxLoadPlan* out);

/* Which of Play's post-Load reads still need a host recapture, as a mask of
   ISAAC_SFX_PLAY_RECAPTURE_*. ENTRY_END_4 and VOICES_190 are never set â€” that
   is the v3 result. STREAM_FLAG is set on every path that reaches the picked
   voice (PRELOAD and LIVE). */
int32_t isaac_sfx_play_recapture_mask(int32_t gate_kind, uint32_t voices);

/* ---------- v22: Load's residual decision islands (0x0092cfb0) ----------

   v3 peeled Load's bookkeeping (loop, offsets, path-len fatal, SSO select,
   stream byte, slot aliasing). Two decision islands in the same body were
   still HOST at v21; both are pure laws over host-produced inputs:

   A. The device-create arm's hook-probe wiring, PE 0x92d094..0x92d0b8:

        0x92d094  mov ecx,[ebp-0x34]        ; probe target (create result)
        0x92d097  test ecx,ecx ; je 0x92d0b8; FULL-WORD gate -> probe_runs
        0x92d09b  [ecx]->vtbl[0x0c](ecx)    ; probe call (HOST)
        0x92d0a2  test al,al   ; je 0x92d0b8; LOW-BYTE gate on the result
        0x92d0a6  mov eax,[0x00c7f484]      ; the attach-hook function ptr
        0x92d0ab  test eax,eax ; je 0x92d0b8; FULL-WORD gate
        0x92d0af..0x92d0b5  hook(&h)        ; (HOST)

      The probe result is tested at its LOW BYTE: 0x100 means "no hook".
      This whole island is reachable ONLY on the non-".ogg" (device) arm.

   B. The per-voice redirected-path free, PE 0x92d0ca..0x92d0f5:

        0x92d0ca  cmp cap,0x10 ; jb 0x92d0f6; SSO inline never freed
        0x92d0cf  lea ecx,[cap+1]           ; size = capacity+1 (wraps)
        0x92d0d4  cmp size,0x1000 ; jb fast ; free_fast iff size < 0x1000
        0x92d0dc  mov esi,[esi-4]           ; back pointer (HOST memory read)
        0x92d0df  add size,0x23             ; big-alloc bias
        0x92d0e2..0x92d0e7 slack-4 > 0x1f (UNSIGNED ja) -> abort 0x00b18894
        0x92d0ec..0x92d0f3  free            ; (HOST)

      Same MSVC tail as IsaacSfxStringFreePlan, but this SITE diverges: it
      runs once per visited voice INSIDE the Load loop and NEVER resets the
      string (0x92d0f6..0x92d109 advance straight on) — the entry-string
      site at 0x0092d217 resets, this one does not. */

/* What the hook wiring of ONE device-arm voice decides. out may be null. */
typedef struct IsaacSfxLoadHookPlan {
  int32_t probe_runs;         /* probe_target != 0 (test ecx,ecx, FULL-WORD) */
  int32_t probe_byte_nonzero; /* (probe_result & 0xff) != 0 (test al,al) */
  int32_t hook_ptr_nonzero;   /* hook_ptr != 0 (test eax, from 0x00c7f484) */
  int32_t hook_runs;          /* all three */
} IsaacSfxLoadHookPlan;

void isaac_sfx_load_hook_plan(uint32_t probe_target,
                              uint32_t probe_result,
                              uint32_t hook_ptr,
                              IsaacSfxLoadHookPlan* out);

/* What the per-voice free of ONE visited voice decides; the free() call and
   the 0x00b18894 abort stay host. ptr_minus_back is the recaptured
   `ptr - ptr[-1]` difference (only consulted on the large path). out may be
   null. */
typedef struct IsaacSfxLoadVoiceFreePlan {
  int32_t free_needed;      /* cap >= 0x10 (cmp cap,0x10 ; jb skip) */
  int32_t free_fast;        /* free_needed && cap+1 < 0x1000 (jb plain) */
  uint32_t free_size;       /* cap+1, +0x23 on the big path (wraps) */
  int32_t slack_checked;    /* == big path selected */
  int32_t corrupt_fatal;    /* slack-4 > 0x1f, UNSIGNED -> abort */
  int32_t reset_needed;     /* ALWAYS 0: no reset stores (vs 0x0092d217) */
} IsaacSfxLoadVoiceFreePlan;

void isaac_sfx_load_voice_free_plan(uint32_t capacity,
                                    uint32_t ptr_minus_back,
                                    IsaacSfxLoadVoiceFreePlan* out);

/* ---------- v23: TryRedirectPath open-addressing probe walk (0x008f5ad0) ---------- */

/* VA 0x008f5ad0 ModManager::TryRedirectPath (exact ZHL). The body is a
   game-logic-with-stores open-addressing hash-table walk (0x7fff mask,
   0x8000 probe cap), node alloc/free, SEH, std::string copies — HOST. The
   probe-walk STATE MACHINE (0x8f5b60..0x8f5bc1) is pure and lands here:
   probe index = hash & 0x7fff (mask 0x7fff = 0x8000 slots), per-slot
   key pair at [slot+0]/[slot+4] compared FULL-WORD against (k0, k1), a
   UNSIGNED probe-count cap at 0x8000 (`cmp eax,0x8000 ; jae`), and a
   match found exactly AT the cap (count == 0x8000) is destroyed
   (dtor 0x0040d040 on [slot+0xc] + sized free 0x24 via 0x00aef15c) and
   reported NOT-FOUND — the cap evicts even a matching node. */
enum {
  ISAAC_SFX_REDIRECT_PROBE_MASK = 0x7fffu,   /* and esi,0x7fff @0x8f5b60 */
  ISAAC_SFX_REDIRECT_PROBE_CAP = 0x8000u,    /* cmp eax,0x8000 ; jae (unsigned) */
  ISAAC_SFX_REDIRECT_SLOT_OFF = 0x0cu,       /* mov edi,[edi+esi*4+0xc] @0x8f5b6b */
  ISAAC_SFX_REDIRECT_SLOT_STRIDE = 4u,
  ISAAC_SFX_REDIRECT_KEY0_OFF = 0x00u,       /* cmp [edi],ecx @0x8f5b73 */
  ISAAC_SFX_REDIRECT_KEY1_OFF = 0x04u,       /* cmp [edi+4],edx @0x8f5b77 */
  ISAAC_SFX_REDIRECT_DTOR_THIS_OFF = 0x0cu,  /* lea ecx,[edi+0xc] @0x8f5ba4 */
  ISAAC_SFX_REDIRECT_FREE_SIZE = 0x24u,      /* push 0x24 @0x8f5bac */
  ISAAC_SFX_REDIRECT_DTOR_VA = 0x0040d040u,  /* node dtor, host */
  ISAAC_SFX_REDIRECT_FREE_VA = 0x00aef15cu,  /* sized free, host */
  ISAAC_SFX_REDIRECT_FIRST_PROBE_VA = 0x008f5b60u,
  ISAAC_SFX_REDIRECT_WALK_END_VA = 0x008f5bc1u,
  ISAAC_SFX_REDIRECT_FOUND_TAIL_VA = 0x008f608fu,
};

/* One walk step's decision. outcome: 0=CONTINUE 1=FOUND 2=NOT_FOUND
   3=CAP_DESTROY. next_count/next_index are meaningful only on CONTINUE.
   destroy_size == 0x24 only on CAP_DESTROY (the node the host must
   dtor+free). out may be null. */
typedef struct IsaacSfxRedirectProbeStep {
  int32_t outcome;
  uint32_t next_count;
  uint32_t next_index;
  int32_t destroy_size;
} IsaacSfxRedirectProbeStep;

/* hash & 0x7fff — the first probe index. */
uint32_t isaac_sfx_redirect_probe_start(uint32_t hash);

/* (index + 1) & 0x7fff — the next open-addressing probe. */
uint32_t isaac_sfx_redirect_probe_next(uint32_t index);

/* count >= 0x8000, UNSIGNED (cmp eax,0x8000 ; jae). count never exceeds
   the cap. */
int32_t isaac_sfx_redirect_probe_cap(uint32_t count);

/* FULL-WORD key equality: slot_key0 == k0 && slot_key1 == k1. */
int32_t isaac_sfx_redirect_probe_match(uint32_t k0, uint32_t k1,
                                       uint32_t slot_key0,
                                       uint32_t slot_key1);

/* One probe iteration: slot absent -> NOT_FOUND; keys match at
   count != 0x8000 -> FOUND, at count == 0x8000 -> CAP_DESTROY; keys
   differ at count >= 0x8000 -> CAP_DESTROY, else CONTINUE (count+1,
   index = (index+1) & 0x7fff). */
void isaac_sfx_redirect_probe_step(uint32_t count, uint32_t index,
                                   int32_t slot_present,
                                   int32_t keys_match,
                                   IsaacSfxRedirectProbeStep* out);

/* ---------- SY: channel-wrapper copy-assign 0x00a2ac90 (v3) ---------- */

/* VA 0x00a2ad25..0x00a2ad39 exchanges both pointer slots between the wrapper
   and the clone; it is a swap, so the wrapper's old pair survives in the
   temporary and is what the following hook probe observes. */
typedef struct IsaacSfxChannelPointerSwap {
  int32_t dst_00;
  int32_t dst_04;
  int32_t tmp_00;
  int32_t tmp_04;
} IsaacSfxChannelPointerSwap;

void isaac_sfx_channel_pointer_swap(int32_t dst_00,
                                    int32_t dst_04,
                                    int32_t tmp_00,
                                    int32_t tmp_04,
                                    IsaacSfxChannelPointerSwap* out);

typedef struct IsaacSfxChannelCopyAssignPlan {
  int32_t release_needed;          /* 0x00a2ae60, once */
  int32_t adopt_calls;             /* 0x008f2d20, exactly twice */
  int32_t swap_needed;             /* the pair is exchanged, not copied */
  int32_t snapshot_before_release; /* the five source reads precede everything */
  int32_t self_assign_safe;        /* consequence of the above */
  int32_t hook_probe_sites;        /* 0x00a2ad3f and 0x00a2ad8e */
  /* What the wrapper holds between the reset and the restore â€” the window the
     two hook probes run in. */
  int32_t transient_loop_08;
  int32_t transient_pending_09;
  int32_t transient_flag_0a;
  float transient_volume_0c;
  float transient_pan_10;
  float transient_pitch_14;
  /* What the wrapper holds on return. */
  int32_t final_loop_08;
  int32_t final_pending_09;
  int32_t final_flag_0a; /* ALWAYS 0: cleared by the pack, never restored */
  float final_volume_0c;
  float final_pan_10;
  float final_pitch_14;
} IsaacSfxChannelCopyAssignPlan;

/* The three floats are moved with movss, i.e. raw 32-bit copies, so NaN
   payloads and signed zeros survive verbatim. out may be null (no-op). */
void isaac_sfx_channel_copy_assign_plan(uint32_t src_loop_08,
                                        uint32_t src_pending_09,
                                        float src_volume_0c,
                                        float src_pan_10,
                                        float src_pitch_14,
                                        IsaacSfxChannelCopyAssignPlan* out);

/* ---------- SZ: channel start 0x00a2ac00 (v3) ---------- */

/* Byte-for-byte the tail Play inlines at VA 0x0092de6a..0x0092de7e. */
typedef struct IsaacSfxChannelStartPlan {
  int32_t device_start_needed; /* channel pointer non-null */
  int32_t start_arg;           /* the pushed immediate, always 1 */
  int32_t word_store_needed;   /* == device_start_needed */
  int32_t pending_09_after;    /* 1 when started, else unchanged */
  int32_t flag_0a_after;       /* 0 when started (word store), else unchanged */
} IsaacSfxChannelStartPlan;

void isaac_sfx_channel_start_plan(int32_t channel_null,
                                  uint32_t pending_09,
                                  uint32_t flag_0a,
                                  IsaacSfxChannelStartPlan* out);

/* ---------- SD: table clear / destroy walk 0x0092d1c4..0x0092d2d7 (v4) --- */

/* __ehvec_dtor(base, size, count, dtor) as the PE pushes it at 0x0092d24a. */
typedef struct IsaacSfxVoiceDtorArgs {
  int32_t base_offset; /* elem + 0x08 */
  int32_t stride;      /* 0x38 */
  int32_t count;       /* 7 â€” the machine's own seven-slot statement */
  uint32_t dtor_va;    /* 0x0092cf10 */
  int32_t slot_name_offset;    /* +0x00 inside the slot */
  int32_t slot_wrapper_offset; /* +0x18 inside the slot */
  int32_t span_end;    /* base_offset + count*stride == 0x190 exactly */
} IsaacSfxVoiceDtorArgs;

void isaac_sfx_entry_voice_dtor_args(IsaacSfxVoiceDtorArgs* out);

/* One MSVC std::string / block free, shared by the entry-string site
   (0x0092d217) and the element-block site (0x0092d2b2).
   `ptr_minus_back` is the recaptured `ptr - ptr[-1]` difference; it is only
   consulted on the large-allocation path. */
typedef struct IsaacSfxStringFreePlan {
  int32_t free_needed;      /* capacity >= 0x10 (inline buffers never free) */
  int32_t uses_back_pointer;/* capacity+1 >= 0x1000 */
  uint32_t free_size;       /* capacity+1, plus 0x23 on the large path */
  int32_t slack_checked;    /* == uses_back_pointer */
  int32_t corrupt_fatal;    /* (ptr-back)-4 > 0x1f, UNSIGNED */
  int32_t reset_size;       /* the string is reset to size 0 ... */
  int32_t reset_capacity;   /* ... capacity 0x0f, buffer[0] = 0 */
} IsaacSfxStringFreePlan;

/* Same shape for the element block, where the size is not `capacity+1` but
   the re-multiplied element count. Returns the plan through the same struct;
   `block_size` replaces `capacity+1` as the starting size. */
void isaac_sfx_string_free_plan(uint32_t capacity,
                                uint32_t ptr_minus_back,
                                IsaacSfxStringFreePlan* out);
void isaac_sfx_block_free_plan(uint32_t block_size,
                               uint32_t ptr_minus_back,
                               IsaacSfxStringFreePlan* out);

typedef struct IsaacSfxTableClearPlan {
  int32_t self_assign_guard_taken; /* PROVEN 0 â€” see the dead-branch registry */
  int32_t detach_stores;           /* 3: begin, end and cap zeroed ... */
  int32_t detach_before_destroy;   /* ... and all three before any destructor */
  int32_t destroy_loop_enter;      /* begin != 0 && begin != end */
  int32_t elements_destroyed;      /* size span / 0x1b8, shared count model */
  int32_t free_needed;             /* begin != 0 */
  int32_t free_bytes;              /* (cap span / 0x1b8) * 0x1b8, 32-bit wrap */
  int32_t free_span_rounded_down;  /* free_bytes != cap span */
  int32_t pure_complete;           /* begin == 0: only the three zero stores */
} IsaacSfxTableClearPlan;

/* begin_null is 1 when the vector's begin pointer reads as 0. The two spans
   are `end - begin` and `cap - begin` in bytes, signed exactly as the PE's
   `sub` + magic divide treats them. out may be null (no-op). */
void isaac_sfx_table_clear_plan(int32_t begin_null,
                                int32_t size_span_bytes,
                                int32_t cap_span_bytes,
                                IsaacSfxTableClearPlan* out);

/* ---------- SE: resize to 0x443 elements 0x0092d2da..0x0092d379 (v4) ----- */

typedef struct IsaacSfxTableResizePlan {
  int32_t action;              /* ISAAC_SFX_TABLE_RESIZE_* */
  int32_t target_count;        /* 0x443 */
  int32_t destroy_range_needed;/* 0x0092ea80 */
  int32_t append_needed;       /* 0x0092edc0 */
  int32_t grow_needed;         /* 0x0092ee40 */
  int32_t capacity_read;       /* 1 only when size < 0x443 */
  uint32_t append_count;       /* 0x443 - size, GROW_INPLACE only */
  int32_t new_end_offset;      /* begin + 0x75328, SHRINK only */
  int32_t pure_complete;       /* action == NONE */
} IsaacSfxTableResizePlan;

/* Both compares are unsigned; the second reuses the first's flags, so an
   exact 0x443 does nothing at all. out may be null (no-op). */
int32_t isaac_sfx_table_resize_action(uint32_t size_count,
                                      uint32_t capacity_count);
void isaac_sfx_table_resize_plan(uint32_t size_count,
                                 uint32_t capacity_count,
                                 IsaacSfxTableResizePlan* out);

/* 0x443 * 0x1b8 == 0x75328. Exported so the identity is machine-checked
   rather than trusted as a comment. */
int32_t isaac_sfx_table_target_bytes(void);

/* ---------- proven-dead branch registry (v4) ---------- */

typedef struct IsaacSfxDeadBranch {
  int32_t id;
  uint32_t va;                 /* the branch instruction */
  int32_t taken;               /* PROVEN 0 */
  int32_t arithmetic_retained; /* 1: the surrounding model still computes it */
} IsaacSfxDeadBranch;

int32_t isaac_sfx_dead_branch_count(void);
void isaac_sfx_dead_branch(int32_t id, IsaacSfxDeadBranch* out);

/* ---------- v5: attribute walks + fill control (0x0092d140 C/D) -------- */

/* One attribute as the host reads it from the XML document. `name_ptr` /
   `name_len` point at the name bytes (NUL INCLUDED) in wasm linear memory;
   when `name_null` is nonzero the PE substitutes the 0x00c71640 empty string
   and the pointer is NOT read. `value_null` is the same full-word test on
   the value pointer. `next_flag` is attr[0x10] != 0 (the continue test) and
   `next_null` is attr[0x18] == 0. */
typedef struct IsaacSfxAttrSample {
  int32_t name_null;
  int32_t name_ptr;
  int32_t name_len;
  int32_t value_null;
  int32_t next_flag;
  int32_t next_null;
} IsaacSfxAttrSample;

typedef struct IsaacSfxAttrWalkPlan {
  int32_t attrs_visited;         /* iterations of the walk loop */
  int32_t numeric_count;         /* attrs taking the parse arm (site A) */
  int32_t string_count;          /* attrs taking the assign arm (site B) */
  int32_t inert_count;           /* attrs matching neither constant */
  int32_t value_fallback_count;  /* non-inert attrs with a null value */
  uint32_t numeric_mask;         /* bit i: attr i took the parse arm */
  uint32_t string_mask;          /* bit i: attr i took the assign arm */
  uint32_t fallback_mask;        /* bit i: non-inert attr i had a null value */
  int32_t host_parse_needed;     /* numeric_count > 0 */
  int32_t host_assign_needed;    /* string_count > 0 */
  int32_t pure_complete;         /* 1 when no host action is needed */
} IsaacSfxAttrWalkPlan;

/* `site` selects the constant pair (ENTRY: id/name, SLOT: path/weight).
   `count` bounds the sample array; the walk stops at the first attr whose
   continue test fails (next_flag == 0 or next_null). out may be null. */
void isaac_sfx_attr_walk(int32_t head_null,
                         const IsaacSfxAttrSample* samples,
                         int32_t count,
                         int32_t site,
                         IsaacSfxAttrWalkPlan* out);

/* The inline strcmp (0x0092d4f3..0x0092d560): two bytes per iteration,
   UNSIGNED byte compares, 0 on equality, -1/+1 via the `sbb eax,eax ;
   or eax,1` idiom. `name_null` substitutes the empty string (a full-word
   test, not a low-byte one). Returns -1/0/1; out-of-range constant_index
   returns 1 (never equal). */
int32_t isaac_sfx_attr_strcmp(int32_t name_null,
                              int32_t name_ptr,
                              int32_t name_len,
                              int32_t constant_index);

/* The two compares -> arm decision (0x0092d550..0x0092d56d): the second
   compare is only reached when the first did not match. */
int32_t isaac_sfx_attr_arm(int32_t cmp_first, int32_t cmp_second);

/* Arm -> host action for the site. ENTRY: first=parse, second=assign.
   SLOT: first=assign, second=parse. */
int32_t isaac_sfx_attr_arm_action(int32_t arm, int32_t site);

/* Inline strlen (0x0092d583..0x0092d58a / 0x0092d95a..0x0092d961): length of
   the value in bytes, 0 for the empty-string fallback. max_len must include
   the NUL; a scan that exhausts max_len returns max_len (caller error). */
int32_t isaac_sfx_attr_value_strlen(int32_t value_null,
                                    int32_t value_ptr,
                                    int32_t max_len);

/* Loop-bottom continue test (0x0092d59f..0x0092d5aa): another iteration
   happens iff attr[0x10] != 0 AND attr[0x18] != 0. Both full-word tests. */
int32_t isaac_sfx_attr_walk_continue(int32_t next_flag_nonzero,
                                     int32_t next_null);

/* Constant table accessors, machine-checked against the .rdata bytes. */
int32_t isaac_sfx_attr_constant_len(int32_t constant_index);
uint32_t isaac_sfx_attr_constant_va(int32_t constant_index);

/* The "sample" child-node test (0x0092d859..0x0092d87e): 1 iff the name
   length is exactly 6 AND the six bytes match "sample". name_cap bounds the
   memory read; a name_cap below 6 never matches. */
int32_t isaac_sfx_xml_node_is_sample(int32_t name_len,
                                     int32_t name_ptr,
                                     int32_t name_cap);

/* The append-vs-replace byte test on the (re)builder's second argument:
   `cmp byte [arg+0xc], 0` â€” LOW-BYTE semantics. */
int32_t isaac_sfx_table_append_flag(uint32_t flag);

typedef struct IsaacSfxTableFillPlan {
  int32_t append_mode;          /* low byte of the flag != 0 */
  int32_t count_recomputed;     /* append: the shared divide ran (0x92d5c0) */
  int32_t target_index;         /* append: the re-derived count; else the id */
  int32_t target_offset;        /* target_index * 0x1b8, 32-bit wrap */
  int32_t out_of_bounds_warn;   /* non-append: id >= 0x443 (signed, js first)
                                   -> log(0x10, 0x00b7b170) â€” the PE pushes no
                                   vararg for its "%d" (original defect) */
  int32_t id_recheck_needed;    /* == out_of_bounds_warn (the warn is opaque,
                                   so the id is re-read after it) */
  int32_t fill_skipped;         /* warn && re-read id still >= 0x443 */
  int32_t fill_needed;          /* !fill_skipped */
  int32_t slot_copies;          /* 7 when fill_needed (voice slots) */
  int32_t header_stores;        /* 6 when fill_needed (0x190..0x1a0) */
  int32_t tail_copies;          /* 14 when fill_needed (byte+dword per slot) */
  int32_t entry_string_assign;  /* fill_needed && !string_self_assign */
  int32_t pure_complete;        /* always 0 â€” every arm reaches a host action
                                   (append push, warn, or the fill copies) */
} IsaacSfxTableFillPlan;

/* The 0x0092d5b0 arm decision and the fill-target arithmetic. `id` is the
   entry-level parse result; `id_after_warn` is the id RE-READ after the
   opaque warn call (only consulted when the warn fires). `span_bytes` is
   `end - begin` of the manager's vector, exactly as the PE subtracts it.
   out may be null. */
void isaac_sfx_table_fill_plan(uint32_t append_flag,
                               int32_t id,
                               int32_t id_after_warn,
                               int32_t span_bytes,
                               int32_t string_self_assign,
                               IsaacSfxTableFillPlan* out);

typedef struct IsaacSfxSampleSlotPlan {
  int32_t overflow;             /* voice_count >= 7 (UNSIGNED jae, 0x92d8ac)
                                   -> log(1, 0x00b7b220, sound index) */
  int32_t slot_offset;          /* 8 + count*0x38, 32-bit wrap; 0 on overflow */
  int32_t count_after;          /* count+1 when !overflow, else unchanged */
  int32_t attr_walk_needed;     /* !overflow â€” the slot's own attr walk */
  int32_t pure_complete;        /* !overflow â€” the count store is pure; the
                                   overflow warn is the only host action this
                                   plan itself decides */
} IsaacSfxSampleSlotPlan;

void isaac_sfx_sample_slot_plan(uint32_t voice_count,
                                IsaacSfxSampleSlotPlan* out);

/* Slot + 0x34 â€” where the "weight" parse stores and the fill loop's tail
   dword copy lands (0x0092da49 / 0x0092d79e). */
int32_t isaac_sfx_slot_weight_offset(int32_t index);

/* ---------- v6: tail plan / chain walk (0x0092da86..0x0092db29) ------ */

/* One warn call's exact stack shape. kind is ISAAC_SFX_WARN_KIND_*.
   arg_count counts the pushed dwords (level is the FIRST cdecl argument,
   so OOB pushes {level, fmt} = 2 dwords and max-samples pushes
   {level, fmt, index} = 3). vararg_count is how many of the "%d"'s the
   call actually supplies: 0 for the out-of-bounds warn â€” the documented
   original defect â€” and 1 for the max-samples warn. */
typedef struct IsaacSfxWarnStack {
  int32_t arg_count;
  int32_t vararg_count;
  int32_t level;
  uint32_t format_string_va;
} IsaacSfxWarnStack;

/* Per-sound post-samples plan (0x0092da86..0x0092db23). `next_node` is the
   re-read sound[0x2c] the PE tests after the teardown; full-word. */
typedef struct IsaacSfxTailPlan {
  int32_t entry_index;          /* [ebp-0x10264]: the id or the count */
  int32_t entry_offset;         /* index * 0x1b8, 32-bit wrap */
  int32_t load_needed;          /* 1 â€” SoundEffect::Load (0x92cfb0) runs */
  uint32_t counter_before;      /* mgr[0x0c] before the step */
  uint32_t counter_after;       /* +1, 32-bit wrap (inc at 0x92da9d) */
  int32_t proto_free_needed;    /* cap >= 0x10: the proto string free runs */
  int32_t proto_uses_back_pointer; /* cap+1 >= 0x1000 */
  uint32_t proto_free_size;     /* cap+1, +0x23 on the big path */
  int32_t proto_slack_checked;  /* == uses_back_pointer */
  int32_t proto_corrupt_fatal;  /* slack-4 > 0x1f, UNSIGNED (ja 0x92d2ca) */
  int32_t proto_reset_stores;   /* 3: size:=0, cap:=0xf, buf[0]:=0 */
  int32_t dtor_runs;            /* 1 â€” __ehvec_dtor always runs */
  int32_t dtor_count;           /* 7 */
  int32_t dtor_stride;          /* 0x38 */
  uint32_t dtor_va;             /* 0x0092cf10 */
  int32_t free_before_dtor;     /* 1 */
  int32_t reset_before_dtor;    /* 1 */
  int32_t load_before_free;     /* 1: Load call AND the counter inc precede
                                   the proto free â€” free AFTER last use */
  int32_t loop_back;            /* next_node != 0 -> 0x92d470 again */
  int32_t exit_reached;         /* next_node == 0 -> the 0x92db29 epilogue */
  int32_t pure_complete;        /* 0 â€” Load, free and dtor are host */
} IsaacSfxTailPlan;

void isaac_sfx_tail_plan(int32_t entry_index,
                         uint32_t counter_before,
                         uint32_t proto_capacity,
                         uint32_t proto_ptr_minus_back,
                         int32_t next_node,
                         IsaacSfxTailPlan* out);

/* Sound-node chain walk (the outer loop of 0x0092d140). next_links[i] is
   the raw re-read of node i's [0x2c] link â€” the PE tests it with
   `test esi,esi ; jne`, a FULL-WORD test, so 0x100 is a live link and
   only 0 stops the chain. count bounds the array (a chain that does not
   end inside the array is reported truncated â€” the PE itself just keeps
   walking). */
typedef struct IsaacSfxSoundChainPlan {
  int32_t head_nonzero;    /* the first node exists (0x92d466) */
  int32_t sounds_visited;  /* per-sound passes the loop runs */
  int32_t loops_back;      /* links that continued (0x92db23 jne) */
  int32_t stops_at_null;   /* the last visited link was NULL */
  int32_t truncated;       /* the array ran out first (model bound) */
  int32_t pure_complete;   /* 1 â€” the chain decisions are pure */
} IsaacSfxSoundChainPlan;

void isaac_sfx_sound_chain_plan(int32_t head_nonzero,
                                const uint32_t* next_links,
                                int32_t count,
                                IsaacSfxSoundChainPlan* out);

/* inc dword [mgr+0xc] â€” 32-bit wrap, pure. */
uint32_t isaac_sfx_preload_counter_after(uint32_t before);

/* test esi,esi ; jne 0x92d470 on the re-read sound[0x2c] â€” FULL-WORD. */
int32_t isaac_sfx_tail_chain_continue(int32_t next_node_nonzero);

/* The fill-loop store header offsets, order of the PE: 0x190, 0x194,
   0x198, 0x199, 0x19c. -1 out of range. */
int32_t isaac_sfx_fill_header_offset(int32_t index);

/* 1 when index's source byte is stack garbage the proto builder never
   initializes â€” index 1 (0x194) and index 3 (0x199) only. */
int32_t isaac_sfx_fill_header_uninitialized(int32_t index);

/* Exact stack shape of the two logger warns (see IsaacSfxWarnStack). */
void isaac_sfx_warn_stack(int32_t warn_kind, IsaacSfxWarnStack* out);

/* ================= v7: the two SFX stop bodies, whole-body =================

   v7 closes the assessment of the two Update-slice opaque boundary records
   in this area by modelling BOTH stop bodies end to end. Both were read from
   the instruction stream; nothing below comes from a decompiler.

   Machine-derived census (linear decode from each entry, 0 resyncs):

     0x0092e230  StopSoundEffect(int id)   197 bytes / 73 instructions
                 `__thiscall`, `ret 4`, receiver *(0x00c7169c) + 0x2a324
                 own-frame stores 0 (no `sub esp` â€” the body has NO locals)
                 observable stores 3, calls 4
                   0x0092e27a  direct rel32 -> 0x00a112c0   (shared logger)
                   0x0092e2b8  call eax = [[chan]+0x38]
                   0x0092e2c9  call eax = [[chan]+0x38]
                   0x0092e2dc  call dword [eax+0x3c]

     0x0092e300  StopAll()                 291 bytes / 103 instructions
                 `__thiscall`, `ret` (no args), SAME receiver
                 own-frame stores 5 ([ebp-4]/[ebp-8]/[ebp-0xc], unwound)
                 observable stores 2, calls 4 â€” ZERO direct rel32 calls
                   0x0092e375  call eax = [[chan]+0x38]
                   0x0092e389  call eax = [[chan]+0x38]
                   0x0092e3ad  call eax = [[chan]+0x44]
                   0x0092e3c4  call dword [eax+0x3c]

   Reach census (full linear .text decode, 2,094,319 instructions,
   469 resyncs; plus a raw little-endian dword scan of ALL FIVE sections):

     0x0092e230  51 direct rel32 `call`, 0 `jmp` tail entries, 0 `call/jmp
                 [imm32]`, 0 memory-displacement reads, 1 immediate operand
                 (`push 0x92e230` at 0x0086daac), 1 raw dword â€” which IS
                 that push's own immediate at 0x0086daad.
     0x0092e300  4 direct rel32 `call` (0x006fa0f3, 0x006fb408, 0x0092f99d,
                 0x009b7725), 0 `jmp` tails, 0 indirect, 2 immediate operands
                 (`push 0x92e300` at 0x0086dabd, `mov dword [eax],0x92e300`
                 at 0x00895588), 2 raw dwords â€” both those immediates.

   NEITHER VA OCCURS ANYWHERE IN .rdata, .data, .rsrc OR .reloc. So neither
   body is a virtual method and neither sits in any dispatch table: the
   vtable dispatch in this area is entirely INTERNAL, on the per-voice audio
   channel objects. The 0x0086daac / 0x0086dabd immediates are a script
   binding registration (0x00895510 / 0x00895570 install a thunk that stores
   the address with `mov dword [eax], 0x92e300`); per the evidence rules a
   binding never names a body, but it IS a reach channel and is counted here.

   ---- 0x0092e230, arm by arm ----

     0x0092e23b  test esi,esi ; js  0x92e2ee   SIGNED  -> MISS
     0x0092e25b  cmp esi,eax  ; jge 0x92e2ee   SIGNED  -> MISS
                 count = span / 0x1b8, signed magic 0x094f2095 sar 4 + fixup
     0x0092e270  cmp dword [entry+0x190],0 ; ja        -> else NO_SAMPLES
     0x0092e290  cmp byte  [entry+0x198],0 ; je        -> DISABLED
     else                                              -> LIVE

     MISS       zero stores, zero calls.                      PURE NO-OP.
     DISABLED   zero stores, zero calls.                      PURE NO-OP.
     NO_SAMPLES zero stores; ONE call, the shared logger
                (level 1, "[warn] Sound %d has no samples.").
                Under the standing logger split its level gate is game logic
                (already translated, log family) and its vsnprintf/
                OutputDebugString/file tail is a platform primitive, so this
                arm carries NO untranslated game logic.
     LIVE       per voice, in this order:
                  0x0092e2a0  mov dword [entry+4], -1   UNCONDITIONAL â€” it is
                              the first instruction of the loop body, and LIVE
                              already proved [entry+0x190] > 0, so on LIVE this
                              store ALWAYS happens at least once.
                  channel null -> next voice (no calls at all)
                  else vtbl[0x38] probes, then a reloaded+null-tested
                  vtbl[0x3c] stop and the pending-byte clears.
                The loop bound is RE-READ from [entry+0x190] every iteration
                (0x0092e2e6, unsigned `jb`) through a POINTER PINNED at
                0x0092e267 â€” edi is never rewritten inside the loop.

     New at v7 and NOT covered by the shared entry gate: on LIVE with EVERY
     channel pointer null the body issues ZERO device calls and its whole
     effect is the pure constant store [entry+4] = -1. `host_is_logger_only`
     reports exactly that condition (device_calls == 0), which is strictly
     weaker than `pure_complete` (device_calls == 0 AND no observable store).

   ---- 0x0092e300, arm by arm ----

     0x0092e32a  je 0x92e41d on the flags of `add eax,edx` -> count == 0,
                 an EQUALITY test, NOT a signed `jle`. A negative count does
                 not return here; the outer loop-back at 0x0092e416 is an
                 UNSIGNED `jb`, so a corrupt span walks instead of exiting.
                 Reproduced, not corrected.
     per group   0x0092e34a  cmp byte [grp+0x198],0 ; je 0x92e3ec -> skip
                 0x0092e359  cmp dword [grp+0x190],ebx ; jbe 0x92e3e9 -> skip
     per voice   channel null -> next; vtbl[0x38] x1-2; then, only when the
                 shared `act` test passes, a THIRD stage the sibling does not
                 have; then a reloaded+null-tested vtbl[0x3c] stop.

     The two skip edges land on DIFFERENT instructions and that is load
     bearing. An inbound-edge census over all of .text finds exactly two
     jumps into this tail (0x0092e34a `je 0x92e3ec`, 0x0092e359
     `jbe 0x92e3e9`), and the inner-loop exit at 0x0092e3e6 FALLS THROUGH
     into 0x0092e3e9. So `mov ebx,[ebp-8]` runs on the empty edge AND after
     a completed walk â€” it is skipped only by the disabled edge, whose test
     at 0x0092e340 precedes the `xor ebx,ebx` at 0x0092e350 so ebx still
     holds the group index. Reading 0x0092e3e9 as "the empty path" is the
     natural mistake and it is wrong; this family got it wrong first and the
     trace oracle caught it.

     count == 0, and "every group disabled or empty", are pure no-ops.
     So is an enabled NON-EMPTY group whose channel pointers are all null:
     the inner loop then makes zero calls and â€” because 0x0092e300 has no
     `mov [entry+4],-1` at all â€” zero observable stores too. That case is a
     COMPLETE no-op here while the same case in 0x0092e230 still stores the
     sentinel. It is the sharpest of the nine divergences below.

   ---- where the siblings diverge (isaac_sfx_stop_divergence) ----

   They share the receiver, the 0x1b8 stride, the signed magic divide, the
   0x38 voice stride, the +0x09 pending byte and the entire two-probe `act`
   test â€” which is why isaac_sfx_voice_act is REUSED by both walks and a
   cross-helper test pins them together. They differ in nine places, and
   two of those make a merged model wrong:

     0x0092e2a0 writes the entry[+4] = -1 sentinel; 0x0092e300 NEVER does.
     0x0092e3a2 substitutes the wrapper's +0x08 LOOP byte for the vtbl[0x44]
       query when the channel pointer has gone null by the third read â€” a
       different FIELD, on a stage the sibling does not have at all.

   ---- honest boundary accounting ----

   Both Update-slice records are NARROWED, not removed. Every non-LIVE arm
   of 0x0092e230 and every skip arm of 0x0092e300 is either a pure no-op or
   logger-only, but a single live channel pointer reaches an audio-backend
   vtable slot whose RETURN VALUE STEERS control flow (`test al,al` on the
   +0x38 probe and the +0x44 query) and whose +0x3c slot is a device side
   effect. The audio backend is not covered by any of the four standing
   decisions, so that arm is an irreducible host body and neither record
   drops. This family does not own the Update slice and changes no count.

   ---- handoff: this family's OWN next VA ----

   NOT 0x0092cfb0. The shared continuation table still lists that as the next
   target ("SoundEffect::Load bookkeeping split"); it landed at v3 and this
   header has documented the split since. Verified again at v7 with
   identify-zhl-address.mjs: exact SoundEffect::Load, 47 pattern bytes.

   The real frontier is ISAAC_SFX_HOST_VA_PRELOAD = 0x0092cf40, size 0x62
   (0x0092cf40..0x0092cfa1, `ret 4`). It is registered in the same script
   binding block as the five roots this family already owns (0x0086dace,
   between the 0x0092e300 and 0x0092e560 registrations) and was simply never
   listed. No exact ZHL match, so it stays address-stable.

   It reuses four things this family already owns and adds two:
     - the SAME signed magic divide and the SAME signed js/jge MISS pair
       (0x0092cf4d / 0x0092cf69) â€” isaac_sfx_mutator_gate's first half;
     - `cmp byte [entry+0x198],0 ; jne 0x0092cf96` â€” the INVERSE sense of the
       stop's `je`, so the enabled entry is the one that does nothing;
     - the "not preloaded" warn (level 1, 0x00b7b1c4 = "Preload sound %d.",
       WITH its vararg) then `call 0x0092cfb0` then `inc [mgr+0xc]`, all three
       already modelled (isaac_sfx_load_plan, isaac_sfx_preload_counter_after);
     - NEW: `mov byte [entry+0x199], 0` at 0x0092cf96 is UNCONDITIONAL on both
       arms, and 0x199 is precisely the pad byte the v6 fill plan flags as
       copied-from-uninitialized-stack (ISAAC_SFX_FILL_HEADER_OFF_3). So this
       body is where that garbage byte gets cleared, which the fill plan
       cannot see on its own.
     - NEW: a third warn string, not either of the two already pinned. */

/* One voice's observed host results inside the 0x0092e230 loop. Every
   field is a value the PE read or a call it made, in PE order. */
typedef struct IsaacSfxStopVoiceSample {
  int32_t channel_null;        /* [wrapper+0x00]==0, 1st read  0x0092e2a7 */
  uint32_t pending_09;         /* [wrapper+0x09]              0x0092e2ae */
  int32_t probe_first;         /* AL of vtbl[0x38]            0x0092e2b8 */
  int32_t probe_second;        /* AL of vtbl[0x38]            0x0092e2c9 */
  int32_t channel_null_reload; /* [wrapper+0x00]==0, reload   0x0092e2d3 */
  uint32_t voices_reloaded;    /* [entry+0x190] re-read       0x0092e2e6 */
} IsaacSfxStopVoiceSample;

typedef struct IsaacSfxStopPlan {
  int32_t gate_kind;           /* MISS / NO_SAMPLES / DISABLED / LIVE */
  int32_t warn_log_needed;     /* 1 only on NO_SAMPLES (0x0092e27a) */
  int32_t frame_end_writes;    /* executions of [entry+4] = -1 */
  int32_t frame_end_value;     /* the sentinel when written, else 0 */
  int32_t voices_visited;
  int32_t probe_calls;         /* vtbl[0x38] */
  int32_t stop_calls;          /* vtbl[0x3c] */
  uint32_t pending_clear_mask; /* bit i: voice i's +0x09 byte was zeroed */
  int32_t observable_stores;   /* EVERY observable write, counted separately
                                  (the same byte cleared twice counts twice) */
  int32_t device_calls;        /* probe + stop; the logger is NOT counted */
  int32_t pure_complete;       /* no device call AND no observable store */
  int32_t host_is_logger_only; /* device_calls == 0: the only host CALL that
                                  can remain is 0x00a112c0, so every other
                                  effect is a pure store the port applies */
} IsaacSfxStopPlan;

/* Whole body of 0x0092e230. The gate comes from isaac_sfx_mutator_gate and
   the per-voice test from isaac_sfx_voice_act â€” both reused, not restated.
   The walk advances only while isaac_sfx_voice_loop_continue accepts the
   count RE-READ by that iteration (samples[i].voices_reloaded); `count`
   only bounds the supplied array. out may be null (no-op). */
void isaac_sfx_stop_plan(int32_t id,
                         int32_t span_bytes,
                         uint32_t voices_190,
                         uint32_t enabled_198,
                         const IsaacSfxStopVoiceSample* samples,
                         int32_t count,
                         IsaacSfxStopPlan* out);

/* 1 when the LIVE loop body's unconditional [entry+4] = -1 executes at all,
   i.e. exactly when the gate is LIVE. Split out because it is the one
   observable effect of 0x0092e230 that needs no device. */
int32_t isaac_sfx_stop_writes_frame_end(int32_t gate_kind);

/* ---------- SQ: 0x0092e300 ---------- */

/* What the outer walk does with one 0x1b8 group. */
enum {
  ISAAC_SFX_STOP_ALL_GROUP_DISABLED = 0, /* je  0x0092e3ec */
  ISAAC_SFX_STOP_ALL_GROUP_EMPTY = 1,    /* jbe 0x0092e3e9 */
  ISAAC_SFX_STOP_ALL_GROUP_WALK = 2
};

int32_t isaac_sfx_stop_all_group_action(uint32_t enabled_198,
                                        uint32_t voices_190);

/* 1 when the skip edge lands on 0x0092e3e9 and restores the outer index from
   [ebp-8]. Only the EMPTY edge does; the DISABLED edge jumps past it to
   0x0092e3ec because `xor ebx,ebx` has not run yet on that path. */
int32_t isaac_sfx_stop_all_group_restores_index(int32_t action);

typedef struct IsaacSfxStopAllVoiceSample {
  int32_t channel_null;        /* 1st read  0x0092e361 */
  uint32_t pending_09;         /* [wrapper+0x09] 0x0092e369 */
  int32_t probe_first;         /* AL of vtbl[0x38] 0x0092e375 */
  int32_t probe_second;        /* AL of vtbl[0x38] 0x0092e389 */
  int32_t channel_null_third;  /* 3rd read  0x0092e39a */
  uint32_t loop_08;            /* [wrapper+0x08] fallback 0x0092e3a2 */
  uint32_t query_44;           /* AL of vtbl[0x44] 0x0092e3ad */
  int32_t channel_null_fourth; /* 4th read  0x0092e3b7 */
  uint32_t voices_reloaded;    /* [grp+0x190] re-read 0x0092e3d9 */
} IsaacSfxStopAllVoiceSample;

typedef struct IsaacSfxStopAllVoiceDecision {
  int32_t first_probe_needed;
  int32_t second_probe_needed;
  int32_t pending_cleared_early; /* store 0x0092e37b */
  int32_t act;                   /* the SHARED isaac_sfx_voice_act result */
  int32_t query_needed;          /* the vtbl[0x44] call is issued */
  int32_t query_from_loop_byte;  /* fallback taken instead (0x0092e3a2) */
  int32_t query_value;           /* the cl tested at 0x0092e3b3 */
  int32_t stop_called;           /* vtbl[0x3c] 0x0092e3c4 */
  int32_t pending_cleared_late;  /* store 0x0092e3c7 */
  int32_t probe_calls;
  int32_t device_calls;
  int32_t observable_stores;
} IsaacSfxStopAllVoiceDecision;

/* One inner iteration of 0x0092e300. out may be null (no-op). */
void isaac_sfx_stop_all_voice_decide(const IsaacSfxStopAllVoiceSample* sample,
                                     IsaacSfxStopAllVoiceDecision* out);

/* Flat outer-walk input: one record per 0x1b8 group. first_voice indexes the
   flat sample array, so the whole body is describable without nesting. */
typedef struct IsaacSfxStopAllGroup {
  uint32_t enabled_198;
  uint32_t voices_190;
  int32_t first_voice;
} IsaacSfxStopAllGroup;

typedef struct IsaacSfxStopAllPlan {
  int32_t group_count;          /* span / 0x1b8, same signed magic divide */
  int32_t returns_immediately;  /* count == 0 -> 0x0092e41d, skips `pop esi` */
  int32_t groups_visited;
  int32_t groups_disabled;
  int32_t groups_empty;
  int32_t groups_walked;
  int32_t index_restores;       /* how often 0x0092e3e9 ran */
  int32_t voices_visited;
  int32_t probe_calls;          /* vtbl[0x38] */
  int32_t query_calls;          /* vtbl[0x44] â€” the sibling has none */
  int32_t stop_calls;           /* vtbl[0x3c] */
  int32_t device_calls;
  int32_t observable_stores;
  int32_t frame_end_writes;     /* ALWAYS 0 â€” divergence 0, pinned here */
  int32_t logger_calls;         /* ALWAYS 0 â€” divergence 1, pinned here */
  int32_t pure_complete;
  int32_t host_is_logger_only;  /* device_calls == 0; with logger_calls also
                                   0 this arm has no host content at all */
} IsaacSfxStopAllPlan;

/* Whole body of 0x0092e300. `group_count_supplied` / `voice_count_supplied`
   bound the arrays only; the walk length comes from the span divide and from
   each iteration's own re-read count. out may be null (no-op). */
void isaac_sfx_stop_all_plan(int32_t span_bytes,
                             const IsaacSfxStopAllGroup* groups,
                             int32_t group_count_supplied,
                             const IsaacSfxStopAllVoiceSample* samples,
                             int32_t voice_count_supplied,
                             IsaacSfxStopAllPlan* out);

/* ---------- SX: the sibling divergence table ---------- */

enum {
  ISAAC_SFX_STOP_DIVERGENCE_COUNT = 9,

  /* An effect present in one body and structurally absent in the other. */
  ISAAC_SFX_STOP_DIVERGE_ABSENT = 0,
  /* Both act, but on a different field, target or signedness. */
  ISAAC_SFX_STOP_DIVERGE_DIFFERENT = 1
};

typedef struct IsaacSfxStopDivergence {
  int32_t id;
  uint32_t stop_site;     /* VA inside 0x0092e230, 0 when the step is absent */
  uint32_t stop_all_site; /* VA inside 0x0092e300, 0 when the step is absent */
  int32_t kind;           /* ABSENT / DIFFERENT */
} IsaacSfxStopDivergence;

int32_t isaac_sfx_stop_divergence_count(void);

/* id out of range clears out. out may be null (no-op). */
void isaac_sfx_stop_divergence(int32_t id, IsaacSfxStopDivergence* out);

/* ---------- SP: 0x0092cf40 PreloadSound (v8) ---------- */

/* Whole-body plan of 0x0092cf40. gate_kind is ISAAC_SFX_PRELOAD_GATE_*.
   The gate reuses the shared first half (js/jge + magic divide) and the
   entry offset is the same wrapping imul â€” asserted cross-helper. Nearby
   mutation traps, both machine-verified: the enabled test is a LOW-BYTE
   test; the pad store runs on BOTH in-range arms. */
typedef struct IsaacSfxPreloadPlan {
  int32_t gate_kind;          /* MISS / ENABLED / LOAD */
  int32_t in_range;           /* 1 when the entry exists (js/jge passed) */
  int32_t entry_offset;       /* id * 0x1b8, 32-bit wrap; 0 when MISS */
  int32_t pad_cleared;        /* = in_range: entry[0x199] := 0 happens on
                                 BOTH arms (0x0092cf96) */
  int32_t warn_log_needed;    /* 1 only on LOAD: the 0x00a112c0 call */
  int32_t load_needed;        /* 1 only on LOAD: SoundEffect::Load(entry) */
  int32_t counter_step;       /* 1 only on LOAD: inc [this+0xc] */
  uint32_t counter_before;    /* [this+0xc] before the step (echo) */
  uint32_t counter_after;     /* +1 wrapped on LOAD, else unchanged */
  int32_t host_calls;         /* 2 on LOAD (logger + Load), else 0 */
  int32_t observable_stores;  /* 1 when in_range (the pad byte), else 0 */
  int32_t pure_complete;      /* 1 only on MISS: nothing happens at all */
  int32_t log_before_load;    /* 1 on LOAD: 0x92cf84 before 0x92cf8e */
  int32_t load_before_counter;/* 1 on LOAD: 0x92cf8e before 0x92cf93 */
  int32_t counter_before_pad; /* 1 on LOAD: 0x92cf93 before 0x92cf96 */
} IsaacSfxPreloadPlan;

/* The pad byte offset 0x199 â€” machine-pinned, exported so the plan cannot
   drift from the constant. */
int32_t isaac_sfx_preload_pad_offset(void);

/* Gate classification of 0x0092cf40. enabled_198 is a LOW-BYTE test; the
   function takes uint32_t and narrows in the body. */
int32_t isaac_sfx_preload_gate(int32_t id,
                               int32_t span_bytes,
                               uint32_t enabled_198);

/* 1 when the pad store runs for this gate (every non-MISS gate). */
int32_t isaac_sfx_preload_clears_pad(int32_t gate_kind);

/* Whole body. counter_before is the recaptured [this+0xc]; out may be
   null (no-op). */
void isaac_sfx_preload_plan(int32_t id,
                            int32_t span_bytes,
                            uint32_t enabled_198,
                            uint32_t counter_before,
                            IsaacSfxPreloadPlan* out);

/* ---------- SE: 0x0092d140 epilogue (v8) ---------- */

/* The epilogue's root-name string free differs from every earlier site in
   ONE way: it never resets the string (v4/v6 sites store size 0, cap 0xf,
   buf[0] = 0 after the free; here 0x92db60 `add esp,8` goes straight to
   the doc dtor). isaac_sfx_string_free_plan's reset fields therefore do
   NOT apply here â€” pinned as a divergence. */
typedef struct IsaacSfxEpiloguePlan {
  int32_t root_name_free_needed;   /* cap >= 0x10 (SSO skip 0x92db33) */
  int32_t root_uses_back_pointer;  /* cap+1 >= 0x1000 */
  uint32_t root_free_size;         /* cap+1, +0x23 on the big path */
  int32_t root_slack_checked;      /* == root_uses_back_pointer */
  int32_t root_corrupt_fatal;      /* slack-4 > 0x1f, UNSIGNED -> abort */
  int32_t root_reset_stores;       /* ALWAYS 0 â€” divergence vs v4/v6 */
  int32_t doc_dtor_runs;           /* ALWAYS 1: 0x92db70 unconditional */
  uint32_t doc_dtor_va;            /* 0x00414730 */
  int32_t buffer_free_needed;      /* reader buffer [ebp-0x10410] != 0 */
  uint32_t buffer_free_va;         /* IAT 0x00b187dc */
  int32_t crt_counter_stores;      /* 2 iff buffer_free_needed (sub+sbb) */
  int32_t counter_uses_fallback;   /* [0xc7de78] read as null -> 0xc7f618 */
  uint32_t counter_fallback_va;    /* 0x00c7f618 */
  int32_t returns_al_1;            /* ALWAYS 1: 0x92dba8 */
  int32_t host_calls;              /* string free + doc dtor + abort? +
                                      buffer free, counted exactly */
  int32_t observable_stores;       /* 0 â€” the only stores are CRT counter
                                      bookkeeping (platform) */
  int32_t pure_complete;           /* 0 â€” the doc dtor is unconditional */
  int32_t string_free_before_dtor; /* ALWAYS 1 (0x92db5b before 0x92db70) */
  int32_t dtor_before_buffer_free; /* ALWAYS 1 (0x92db70 before 0x92db9f) */
} IsaacSfxEpiloguePlan;

/* root_name_capacity is [ebp-0x18], root_name_ptr_minus_back the
   recaptured buf - buf[-1] (big path only), buffer_null 1 when
   [ebp-0x10410] reads as 0, heap_state_null 1 when [0xc7de78] reads as 0.
   out may be null (no-op). */
void isaac_sfx_table_epilogue_plan(uint32_t root_name_capacity,
                                   uint32_t root_name_ptr_minus_back,
                                   int32_t buffer_null,
                                   int32_t heap_state_null,
                                   IsaacSfxEpiloguePlan* out);

/* ---------- v9: the 0x0092d140 append-arm skip law ---------- */

/* 0x0092d5b0..0x0092d6c2, the append arm of the 0x0092d140 XML/append
   block. Only the SKIP LAW is translated; the vector-append machinery
   (0x92d5f4..0x92d6b8: ctor 0xaef5c4, push_back 0x92e830 / 0x92e900, bulk
   append 0xaef638) stays host with exact ordering. Machine truth:

     0x0092d5b0  cmp byte [ebx+0xc],0 ; je 0x92d6c4
                 ebx = the entry esp, so [ebx+0xc] is the LOW BYTE of the
                 function's second stack argument (ret 8, two args). A zero
                 low byte SKIPS the whole arm and the pre-arm
                 [ebp-0x10264] value flows to the 0x92d6c4 join unchanged.
     0x0092d5d1  mov ecx,[esi+4] ; sub ecx,[esi]  32-bit wrap span of the
                 source vector at [ebp-0x10404] (== the receiver `this`)
     0x0092d5d6  imul ecx (eax=0x094f2095) ; sar edx,4 ; mov eax,edx ;
                 shr eax,0x1f ; add eax,edx   -- the SAME signed magic
                 divide by 0x1b8 as every other root, so the count export
                 reuses entry_count_impl and the cross-helper identity is
                 asserted. count is stored to [ebp-0x10264] and re-read at
                 0x92d6bc.
     0x0092d6c4  test eax,eax ; js 0x92d6f4      count < 0 -> parse path
     0x0092d6cd  cmp eax,0x443 ; jl 0x92d6f4     count < 0x443 -> parse
                 path. The warn block (logger + re-read + state byte 6 +
                 jmp 0x92daa4) stays host.

   The arm's local SSO string at [ebp-0x60] is written with capacity 0xf
   (0x92d620) and re-written with 0xf (0x92d6a0) with NO other store in
   between, so the 0x92d65d free test always takes the cap < 0x10 skip:
   the 0x92d689 free is DEAD on every path through this arm (pinned).
   host_calls = 3 when the arm runs: 0xaef5c4 ctor + one push_back
   (0x92e830 or 0x92e900, capacity-dependent) + 0xaef638 bulk append. */

typedef struct IsaacSfxAppendArmPlan {
  int32_t skip;                /* 1: byte [arg2] low == 0 -> join 0x92d6c4 */
  int32_t arm_runs;            /* !skip */
  int32_t count;               /* [ebp-0x10264] at the join (signed) */
  int32_t warn_path;           /* count >= 0x443 (signed) -> warn block */
  int32_t prev_count_carried;  /* skip: pre-arm [ebp-0x10264] flows through */
  int32_t host_mutates_source; /* arm_runs: the vector grow/append is host */
  int32_t arm_string_free_dead;/* ALWAYS 1: SSO cap 0xf < 0x10, pinned */
  int32_t host_calls;          /* 0 skipped / 3 when the arm runs */
} IsaacSfxAppendArmPlan;

/* The [ebp-0x10404] source law: (int32)(end - begin) / 0x1b8, signed
   trunc-toward-zero via the shared 0x094f2095 magic. */
int32_t isaac_sfx_append_arm_count(uint32_t src_begin, uint32_t src_end);

/* Full skip law: gate low byte, count recompute-or-carry, and the 0x92d6c4
   warn-vs-parse decision. out may be null (no-op). */
void isaac_sfx_append_arm_plan(uint32_t gate_byte, uint32_t src_begin,
                               uint32_t src_end, int32_t prev_count,
                               IsaacSfxAppendArmPlan* out);

/* ---------- v9 (wave-2 XML-read half): the 0x0092d140 read prologue,
              root-name string, proto templates, append-arm push ---------- */

/* The XML-read block 0x0092d37f..0x0092d470. Machine truth (0x0092d37f):

     0x92d37f  mov eax,[edi] ; mov ecx,edi      ; vtbl[4] -> size probe
     0x92d38a  lea ecx,[esi+1]                  ; ALLOC SIZE = size + 1
     0x92d38d  call 0xa0f4e0                    ; allocator (host)
     0x92d3a3  call [ecx+0x14]                  ; read (host)
     0x92d3ad  mov byte [eax+esi],0             ; PURE: NUL at buf[size]
     0x92d3b7  call [ecx]                       ; close (host)
     0x92d3c5  mov dword [eax+0xc],0            ; PURE: preload count reset

   then the doc ctor 0x413b90 (WHOLE BODY landed at v10), doc.Parse
   0x4155d0 (still HOST), the "sounds" element
   0x413c70 (0xb7b1b4), the "root" ATTR find 0x413bf0 (0xb66f40), the
   root-name string assign 0x40ccd0, and the "sound" element 0x413c70
   (0xb7b1ac) — Parse and the two finds stay HOST. The first-sound
   gate 0x92d466 (test esi,esi ;
   The root name (0x92d40d..0x92d446): string init {buf 0, size 0,
   cap 0xf, buf[0]=0 at [ebp-0x2c]}, then edx = 0xc71640 ("" fallback),
   ecx = [eax+4] (the attr value), `test ecx,ecx ; cmovne edx,ecx` —
   FULL-WORD null test — then the SAME inline strlen shape the v5 slot
   walk uses (lea edi,[ecx+1] ; loop ...), then push len/ptr and call
   0x40ccd0 (host assign). The fallback and the strlen are pure; the
   assign is the single host edge. */

typedef struct IsaacSfxReadPlan {
  uint32_t alloc_size;         /* read_size + 1, 32-bit wrap (lea [esi+1]) */
  uint32_t nul_offset;         /* read_size: buffer[read_size] = 0, always */
  int32_t nul_store;           /* ALWAYS 1 (0x92d3ad unconditional) */
  int32_t counter_reset;       /* ALWAYS 1: [mgr+0xc] = 0 (0x92d3c5) */
  int32_t counter_offset;      /* 0xc = ISAAC_SFX_MGR_OFF_NOT_PRELOADED_COUNT */
  int32_t host_edge_count;     /* 4: size probe, alloc 0xa0f4e0, read, close */
} IsaacSfxReadPlan;

typedef struct IsaacSfxRootNamePlan {
  int32_t init_store_count;    /* ALWAYS 4: buf, size, cap, byte buf[0] */
  int32_t init_cap;            /* ALWAYS 0xf */
  int32_t fallback_used;       /* value_null != 0 (FULL-WORD cmovne) */
  int32_t name_len;            /* strlen over the SELECTED pointer (0 if
                                  fallback) — same loop shape as v5 slot */
  int32_t assign_needed;       /* ALWAYS 1 (0x92d446 call 0x40ccd0) */
  uint32_t assign_va;          /* 0x0040ccd0 */
} IsaacSfxRootNamePlan;

/* The proto-entry init template, shared by the loop head (0x92d494..
   0x92d4c9, proto1 at [ebp-0x10400]) and the append arm (0x92d600..
   0x92d627, proto2 at [ebp-0x200]). Machine truth: the +4 frame-end
   sentinel 0xffffffff is written BEFORE the __ehvec_ctor (0x92d484 /
   0x92d5df), the voice array sits at proto+8, and the seven header/name
   stores land AFTER the ctor: [0x190] voice count = 0, [0x1a0] name buf
   = 0, byte [0x198] enabled = 0, [0x19c] id = 0, [0x1b0] name size = 0,
   [0x1b4] name cap = 0xf, byte [0x1a0] buf[0] = 0. NEITHER site writes
   [0x194] (base volume) or [0x199] (pad) — the exact two fields the v6
   fill law flags uninitialized, pinned by ISAAC_SFX_PROTO_UNINIT_MASK.
   ONE order divergence: the loop head stores [0x190] first, the append
   arm stores [0x1a0] first (first_store_offset). Everything else is
   byte-identical between sites — one template, one law. */
typedef struct IsaacSfxProtoInitPlan {
  int32_t site_valid;          /* 1; site 0 = LOOP_HEAD, nonzero = APPEND */
  int32_t store_count;         /* ALWAYS 7 (the five header + two string
                                  head stores, excluding the sentinel) */
  int32_t sentinel_offset;     /* 4 (frame-end, written before the ctor) */
  uint32_t sentinel_value;     /* 0xffffffff */
  int32_t first_store_offset;  /* 0x190 (loop head) / 0x1a0 (append) */
  int32_t uninit_mask;         /* 0xa: bits 1,3 = +0x194 and +0x199 */
  uint32_t ctor_va;            /* 0x00aef5c4 __ehvec_ctor */
  int32_t ctor_count;          /* 7 */
  int32_t ctor_stride;         /* 0x38 */
  uint32_t ctor_ctor_va;       /* 0x0092ce30 */
  uint32_t ctor_dtor_va;       /* 0x0092cf10 */
  int32_t voice_base_off;      /* 8: voices at proto+8 */
} IsaacSfxProtoInitPlan;

/* The append-arm vector push (0x92d62f..0x92d659). `test/cmp` on the
   LIVE end/cap pair is FULL-WORD: `cmp eax,[esi+8] ; je 0x92d651`
   sends end == cap to the grow+append 0x92e900 (host); end != cap
   emplaces at end (0x92e830, host) and then `add dword [esi+4],0x1b8`
   (0x92d648) advances end by exactly ONE stride — the only pure store
   of the push. On the grow path the end update happens inside the host
   call, so end_after carries the INPUT end. */
typedef struct IsaacSfxPushPlan {
  int32_t emplace;             /* end != cap (FULL-WORD compare) */
  int32_t grow;                /* end == cap */
  uint32_t end_after;          /* emplace: end + 0x1b8 (wrap); grow: end */
  uint32_t emplace_va;         /* 0x0092e830 */
  uint32_t grow_va;            /* 0x0092e900 */
} IsaacSfxPushPlan;

/* read_size is the size probe result, value_null 1 when the attr value
   read as null (its pointer is then NOT read), value_ptr/max_len for the
   root-name strlen. site: 0 = loop head, nonzero = append arm. end/cap
   are the LIVE vector end/cap. out may be null (no-op). */
int32_t isaac_sfx_table_open_gate(int32_t file_open_result);
void isaac_sfx_table_read_plan(int32_t read_size, IsaacSfxReadPlan* out);
void isaac_sfx_table_root_name_plan(int32_t value_null, int32_t value_ptr,
                                    int32_t max_len,
                                    IsaacSfxRootNamePlan* out);
void isaac_sfx_table_proto_init_plan(int32_t site,
                                     IsaacSfxProtoInitPlan* out);
void isaac_sfx_table_push_plan(int32_t end, int32_t cap,
                               IsaacSfxPushPlan* out);

/* ---------- v10: 0x00413b90 XML document constructor ----------

   identify-zhl: NO exact match (address-stable). Measured 0x5b bytes,
   22 instructions, `__thiscall`, bare `ret` (no stack args). Zero
   calls, zero memory reads, eleven stores, returns `this` in eax.
   Preceded by a 5-byte int3 run at 0x413beb..0x413bef; the next
   function is the ATTR find at 0x00413bf0 (still host).

   Reach census (E8/E9 scan of .text + raw LE-dword scan of all five
   PE sections via the section table): 40 direct rel32 callers, 0 jmp
   tails, 0 address-taken hits. One of the 40 is the 0x0092d140 site
   at 0x0092d3cc (`lea ecx,[ebp-0x10248] ; call 0x413b90`), which
   then pushes the reader buffer and calls Parse at 0x004155d0.

   Machine truth, VA 0x00413b90..0x00413bea:

     0x413b91  esi = ecx                                  (this)
     0x413b93  edx = esi + 0x1003c                        (pool end)
     0x413b99  [edx] = 0                                  FIRST store
     0x413b9f  ecx = esi + 0x3c                           (pool base)
     0x413ba2  [esi+0x00] = 0
     0x413baa  [esi+0x04] = 0
     0x413bb1  eax = -ecx ; and eax,3 ; add eax,ecx
               4-byte align-up of the pool base:
               cursor = pool_base + ((-pool_base) & 3)
               (32-bit wrap; equivalent to round-up, independently
               checked). Slack is 0/3/2/1 for pool_base mod 4 =
               0/1/2/3.
     0x413bb3  [esi+0x10] = 0
     0x413bbd  [esi+0x14] = 0
     0x413bc6  [esi+0x18] = 0
     0x413bcd  [esi+0x34] = eax                           (cursor)
     0x413bd0  eax = esi                                  (return this)
     0x413bd2  [esi+0x20] = 0
     0x413bd9  [esi+0x10040] = 0
     0x413be3  [esi+0x30] = ecx                           (pool base)
     0x413be6  [esi+0x38] = edx                           (pool end)

   Eleven stores, eight of them the literal 0. NOT written: +0x08,
   +0x0c, +0x1c, +0x24, +0x28, +0x2c, and the pool bytes at +0x3c
   themselves. Pool span is exactly 0x10000 (0x1003c - 0x3c).

   No host edge: the body is pure. Parse (0x004155d0) had its entry
   islands peeled at v11; the nested parser at 0x00416040 stays host.
   Next VA is ATTR find 0x00413bf0. */

enum {
  ISAAC_SFX_HOST_VA_XML_DOC_CTOR = 0x00413b90u,
  ISAAC_SFX_XML_DOC_CTOR_SIZE_BYTES = 0x5b, /* 0x413b90..0x413bea */
  ISAAC_SFX_XML_DOC_CTOR_INSNS = 22,
  ISAAC_SFX_XML_DOC_CTOR_CALLERS = 40,      /* E8 only; 0 E9; 0 dword */
  ISAAC_SFX_XML_DOC_CTOR_SFX_CALLSITE = 0x0092d3ccu,
  ISAAC_SFX_HOST_VA_XML_DOC_PARSE = 0x004155d0u, /* v11 islands; not whole body */

  ISAAC_SFX_XML_DOC_POOL_BASE_OFF = 0x3c,
  ISAAC_SFX_XML_DOC_POOL_END_OFF = 0x1003cu,
  ISAAC_SFX_XML_DOC_POOL_BYTES = 0x10000,
  ISAAC_SFX_XML_DOC_OFF_ROOT_00 = 0x00,
  ISAAC_SFX_XML_DOC_OFF_04 = 0x04,
  ISAAC_SFX_XML_DOC_OFF_10 = 0x10,
  ISAAC_SFX_XML_DOC_OFF_14 = 0x14,
  ISAAC_SFX_XML_DOC_OFF_18 = 0x18,
  ISAAC_SFX_XML_DOC_OFF_20 = 0x20,
  ISAAC_SFX_XML_DOC_OFF_POOL_BASE_30 = 0x30,
  ISAAC_SFX_XML_DOC_OFF_CURSOR_34 = 0x34,
  ISAAC_SFX_XML_DOC_OFF_POOL_END_38 = 0x38,
  ISAAC_SFX_XML_DOC_OFF_POOL_MARK_1003C = 0x1003cu,
  ISAAC_SFX_XML_DOC_OFF_10040 = 0x10040u,
  ISAAC_SFX_XML_DOC_CTOR_STORE_COUNT = 11,
  ISAAC_SFX_XML_DOC_CTOR_ZERO_STORES = 8,
  ISAAC_SFX_XML_DOC_CTOR_FIRST_STORE_OFF = 0x1003c,
  ISAAC_SFX_XML_DOC_CTOR_ALIGN = 4
};

typedef struct IsaacSfxXmlDocCtorPlan {
  uint32_t pool_base;          /* this + 0x3c (wrap) */
  uint32_t pool_end;           /* this + 0x1003c (wrap) */
  uint32_t cursor;             /* 4-byte-aligned pool_base (wrap) */
  uint32_t align_slack;        /* (-pool_base) & 3  — 0..3 */
  int32_t store_count;         /* ALWAYS 11 */
  int32_t zero_store_count;    /* ALWAYS 8 */
  int32_t first_store_offset;  /* ALWAYS 0x1003c */
  int32_t host_calls;          /* ALWAYS 0 */
  int32_t returns_this;        /* ALWAYS 1 */
  uint32_t size_bytes;         /* ALWAYS 0x5b */
  int32_t caller_count;        /* ALWAYS 40 */
} IsaacSfxXmlDocCtorPlan;

/* Pool-base / pool-end / 4-byte cursor of 0x00413b90. `this_ptr` is
   the full 32-bit receiver; every add wraps. */
uint32_t isaac_sfx_xml_doc_ctor_pool_base(uint32_t this_ptr);
uint32_t isaac_sfx_xml_doc_ctor_pool_end(uint32_t this_ptr);
uint32_t isaac_sfx_xml_doc_ctor_cursor(uint32_t this_ptr);
uint32_t isaac_sfx_xml_doc_ctor_align_slack(uint32_t this_ptr);

/* 1 iff `off` is one of the eleven store displacements. 0x3c (the
   pool bytes themselves) is NOT a store. out of the plan may be
   null (no-op). */
int32_t isaac_sfx_xml_doc_ctor_writes_offset(uint32_t off);
void isaac_sfx_xml_doc_ctor_plan(uint32_t this_ptr,
                                 IsaacSfxXmlDocCtorPlan* out);



/* ---------- v11: 0x004155d0 XML document Parse islands ----------

   identify-zhl: NO exact match on the body, the nested parse
   0x00416040, the BSS error slot 0x00c7de4c, the whitespace table
   0x00b1b060, or the "expected <" string 0x00b1b66c. Address-stable.
   Measured 0xe5 bytes, 88 instructions, `__thiscall`, `ret 4` (one
   stack arg — the input pointer). One E8, zero indirect / IAT.
   Preceded by ctor 0x00413b90 (v10, complete pure body). Next
   sequential XML helpers named in v10: ATTR find 0x00413bf0 /
   0x00413c70 (still host).

   Reach census (E8/E9 of .text verified by one-insn decode + raw
   LE-dword scan of every PE section via the section table): 40
   direct rel32 callers, 0 jmp tails, 0 address-taken hits. One of
   the 40 is the 0x0092d140 site at 0x0092d3e4, immediately after
   the v10 ctor callsite 0x0092d3cc.

   A full XML parser is host-irreducible — the nested body at
   0x00416040 (3 rel32 callers: 0x415666, 0x4167bf, 0x8f6509;
   allocator 0x416510 inside) is NOT translated. Parse itself is
   the document driver. v11 peels the first honest PURE islands
   and records the rest as typed host VAs. Narrowed, not removed.

   Machine truth, VA 0x004155d0..0x004156b4:

     0x4155d6  eax = [esi+0x18]                         (children head)
               ISAAC_SFX_XML_DOC_OFF_18 consumed BY
               REFERENCE from the v10 ctor store set.
     0x4155d9  test eax,eax ; je 0x4155ee               FULL-WORD.
               0x100 is a live head, not null.
     0x4155e0  [eax+0x10] = 0 ; eax = [eax+0x2c]        walk: node+0x10
               zero, next via ISAAC_SFX_XML_NODE_OFF_NEXT_2C.
               +0x10 is ISAAC_SFX_XML_ATTR_OFF_CONTINUE_10
               consumed BY REFERENCE — not renamed.
     0x4155ee  eax = [esi+0x20]
     0x4155f1  [esi+0x18] = 0                           ALWAYS detach
     0x4155f8  test eax,eax ; je 0x41560e               FULL-WORD attrs
     0x415600  [eax+0x10] = 0 ; eax = [eax+0x18]        attr walk next
               via ISAAC_SFX_XML_ATTR_OFF_NEXT_18.
     0x41560e  eax = [ebp+8]                            input pointer
     0x415611  [esi+0x20] = 0                           ALWAYS detach
     0x415618  cmp byte [eax], 0xef                     BOM 0xEF BB BF
     0x41561d  cmp byte [eax+1], 0xbb                   LOW-BYTE each
     0x415623  cmp byte [eax+2], 0xbf                   all three or skip
     0x415629  add eax, 3                               skip length 3
     0x415630  movzx ecx, byte [eax]
     0x415633  cmp byte [ecx+0xb1b060], 0               space table:
               .rdata 256 bytes, 1 ONLY at 9/10/13/32
               (TAB/LF/CR/SPACE). Everything else 0.
     0x415640  skip loop                                host-length walk
               over the input. Not translated.
     0x41564e  [ebp+8] = eax
     0x415651  test cl,cl ; je 0x4156b0                 EMPTY: silent ret
     0x415657  cmp cl, 0x3c ; jne 0x4156a6              '<' or ERROR
     0x41565c  inc eax ; ecx = esi ; push &cursor
     0x415666  call 0x00416040                          HOST nested parse
     0x41566b  test ecx,ecx ; je 0x415630               FULL-WORD; null
               reloads cursor and continues (host loop).
     0x415676  cmp dword [esi+0x18], 0 ; je 0x41568a    FULL-WORD
               first-child vs sibling. +0x18 already
               detached; a later iteration recaptures.
     0x41567c  [ecx+0x28] = [esi+0x1c]                  sibling link
     0x415685  [[esi+0x1c]+0x2c] = ecx
     0x41568a  [ecx+0x28] = 0 ; [esi+0x18] = ecx        first-child arm
     0x415694  [esi+0x1c] = ecx                         last at +0x1c —
               the displacement the v10 ctor does NOT
               write (ctor NOT-written list includes
               +0x1c). Discriminator vs ctor collapse.
     0x415697  [ecx+0x10] = esi ; [ecx+0x2c] = 0
     0x4156a1  jmp 0x415630                             host loop
     0x4156a6  [0xc7de4c] = 0xb1b66c                    ERROR: BSS slot
               past .data raw end, string "expected <"
     0x4156b0  pop esi ; pop ebp ; ret 4

   This-pointer stores Parse can perform: +0x18, +0x20 (always
   detach), +0x1c (link). NOT the v10 eleven-store set: Parse
   never writes +0x00/+0x04/+0x10/+0x14/+0x30/+0x34/+0x38/
   +0x1003c/+0x10040. host_calls is 1 on the LT arm and 0
   otherwise — ctor host_calls is ALWAYS 0.

   Remaining host: nested parse 0x00416040 (3 rel32: 0x415666,
   0x4167bf, 0x8f6509; allocator 0x416510 inside, which itself
   calls 0xa0f4e0 — guest allocator, not translated), the
   input/whitespace skip loop, the sibling-walk length.
   — LANDED at v14: the nested parse DECISION LAYER (see the v14 block);
   the allocator, attrs 0x4165a0 and children 0x416770 stay host.
   Next VA was ATTR find 0x00413bf0 — LANDED at v12 below as a
   complete pure body (see the v12 block). Linear-decode census of
   .text (2,094,319 insns / 469 resyncs): 39 rel32, 0 E9, 0
   address-taken, 0 calls, 0 stores. 0x72 bytes
   0x413bf0..0x413c61, three `ret 0xc` (match / miss /
   null-name). Byte-diff vs child-find 0x00413c70 (96 rel32) is
   125/128 over 0x80 with a 3-byte law (head 0x20/0x18, next
   0x18/0x2c, null-name return [this+head]). The v11 objection —
   "the search walks host XML name bytes, and the null-name arm
   returns [this+0x20]" — is resolved at v12: both bodies have no
   call/store/host edge, the name bytes are the node's own
   {ptr,len} pair plus the argument, and the null-name return is
   modelled as the NULL_ARG kind returning the head. */

enum {
  ISAAC_SFX_XML_DOC_PARSE_SIZE_BYTES = 0xe5, /* 0x4155d0..0x4156b4 */
  ISAAC_SFX_XML_DOC_PARSE_INSNS = 88,
  ISAAC_SFX_XML_DOC_PARSE_CALLERS = 40,      /* E8 only; 0 E9; 0 dword */
  ISAAC_SFX_XML_DOC_PARSE_SFX_CALLSITE = 0x0092d3e4u,

  ISAAC_SFX_HOST_VA_XML_NESTED_PARSE = 0x00416040u,
  ISAAC_SFX_HOST_VA_XML_PARSE_ERROR_SLOT = 0x00c7de4cu, /* BSS */
  ISAAC_SFX_XML_PARSE_ERROR_STR_VA = 0x00b1b66cu,       /* "expected <" */
  ISAAC_SFX_XML_PARSE_SPACE_TABLE_VA = 0x00b1b060u,

  ISAAC_SFX_HOST_VA_XML_ATTR_FIND = 0x00413bf0u,  /* v12: landed, pure */
  ISAAC_SFX_HOST_VA_XML_CHILD_FIND = 0x00413c70u, /* v12: landed, pure */

  ISAAC_SFX_XML_PARSE_BOM0 = 0xef,
  ISAAC_SFX_XML_PARSE_BOM1 = 0xbb,
  ISAAC_SFX_XML_PARSE_BOM2 = 0xbf,
  ISAAC_SFX_XML_PARSE_BOM_SKIP = 3,
  ISAAC_SFX_XML_PARSE_LT = 0x3c,              /* '<' */
  ISAAC_SFX_XML_PARSE_SPACE_TAB = 9,
  ISAAC_SFX_XML_PARSE_SPACE_LF = 10,
  ISAAC_SFX_XML_PARSE_SPACE_CR = 13,
  ISAAC_SFX_XML_PARSE_SPACE_SP = 32,

  ISAAC_SFX_XML_PARSE_GATE_EMPTY = 0,         /* test cl,cl ; je ret */
  ISAAC_SFX_XML_PARSE_GATE_LT = 1,            /* cmp cl,0x3c ; call nested */
  ISAAC_SFX_XML_PARSE_GATE_ERROR = 2,         /* else store "expected <" */

  /* Parse this-pointer stores. +0x18/+0x20 reuse the v10 ctor
     displacements BY REFERENCE; +0x1c is the link last-pointer
     the ctor does NOT write. +0x28 is the node field the first/
     sibling arms write (not a ctor this-store). */
  ISAAC_SFX_XML_DOC_OFF_LAST_1C = 0x1c,
  ISAAC_SFX_XML_NODE_OFF_28 = 0x28,
  ISAAC_SFX_XML_DOC_PARSE_THIS_STORE_COUNT = 3,
  ISAAC_SFX_XML_NESTED_PARSE_CALLERS = 3
};

typedef struct IsaacSfxXmlDocParsePlan {
  int32_t children_walk;           /* children_head != 0 (FULL-WORD) */
  int32_t attrs_walk;              /* attrs_head != 0 (FULL-WORD) */
  int32_t detach_children;         /* ALWAYS 1 ([this+0x18] = 0) */
  int32_t detach_attrs;            /* ALWAYS 1 ([this+0x20] = 0) */
  int32_t bom_skip;                /* 3 or 0 (LOW-BYTE BOM triple) */
  int32_t gate_kind;               /* EMPTY / LT / ERROR (LOW-BYTE) */
  int32_t nested_parse_needed;     /* gate == LT */
  uint32_t nested_parse_va;        /* ALWAYS 0x00416040 */
  int32_t error_store;             /* gate == ERROR */
  uint32_t error_slot_va;          /* ALWAYS 0x00c7de4c */
  uint32_t error_str_va;           /* ALWAYS 0x00b1b66c */
  int32_t link_needed;             /* LT and parsed_node != 0 FULL-WORD */
  int32_t link_first;              /* link and first_child_re == 0 */
  int32_t host_calls;              /* 1 iff LT; ctor is ALWAYS 0 */
  int32_t pure_complete;           /* ALWAYS 0 — nested parse remains */
  uint32_t size_bytes;             /* ALWAYS 0xe5 */
  int32_t caller_count;            /* ALWAYS 40 */
} IsaacSfxXmlDocParsePlan;

/* FULL-WORD null test (0x4155d9 / 0x4155f8 / 0x41566d / 0x415676).
   0x100 is live. */
int32_t isaac_sfx_xml_doc_parse_head_live(uint32_t head);

/* 0x415618..0x415629: three cmp-byte against 0xEF BB BF. LOW BYTE
   of each arg. Returns 3 or 0. */
int32_t isaac_sfx_xml_doc_parse_bom_skip(uint32_t b0, uint32_t b1,
                                         uint32_t b2);

/* Table 0xb1b060: 1 iff low byte is 9, 10, 13 or 32. */
int32_t isaac_sfx_xml_doc_parse_is_space(uint32_t byte);

/* 0x415651 / 0x415657: EMPTY / LT / ERROR from the LOW BYTE. */
int32_t isaac_sfx_xml_doc_parse_gate(uint32_t byte);

/* 1 iff `off` is +0x18, +0x20 or +0x1c. The v10 eleven-store set
   minus those two shared detach offs is 0. out of the plan may be
   null (no-op). */
int32_t isaac_sfx_xml_doc_parse_writes_this_offset(uint32_t off);
void isaac_sfx_xml_doc_parse_plan(uint32_t children_head,
                                  uint32_t attrs_head,
                                  uint32_t b0, uint32_t b1, uint32_t b2,
                                  uint32_t after_ws_byte,
                                  uint32_t parsed_node,
                                  uint32_t first_child_re,
                                  IsaacSfxXmlDocParsePlan* out);



/* ---------- v12: 0x00413bf0 ATTR find / 0x00413c70 CHILD find ----------

   Byte-identical twins, 125/128 over 0x80. Full bodies, 71 instructions
   each, 0 E8 / 0 indirect / 0 mem-stores, three `ret 0xc` (match / miss /
   null-name). Both are now FULLY PURE: the "search walks host XML name
   bytes" objection from v11 does not hold — the walk reads this and the
   node chain (receiver + node fields only), and the name bytes it compares
   are the node's own {ptr,len} pair (custom XML string, NOT std::string:
   node+0x00 name pointer, node+0x08 name length — the family's
   ISAAC_SFX_XML_NODE_OFF_NAME_00 / _NAME_LEN_08) plus the argument
   C-string. The only fixed data address is the empty-string fallback
   0x00c71640 (SFX_ATTR_EMPTY_STRING_VA, the v5 "" fallback). There is no
   device, allocator or logging edge anywhere in either body.

   Law (transcribed branch-by-branch from the instruction stream):

     arg = C-string [esp+4] (this in ecx)
   * 0x413bf7/0x413c77  test arg,arg ; je  -> return [this+head_off]
     (NULL_ARG arm returns the HEAD — the machine's FirstAttribute dual —
     not zero)
     0x413bfb..0x413c07 strlen: scan to NUL, length = end - arg
     0x413c09/0x413c89  node = [this+head_off]
     0x413c0f/0x413c8f  node == 0 -> xor eax,eax ; ret (MISS)
     per node:
       0x413c13/0x413c93  buf = [node+0x00]
       0x413c15/0x413c95  buf == 0 (SSO empty arm) -> size = 0,
                          buf = 0x00c71640
       0x413c19/0x413c99  buf != 0 -> size = [node+0x08]
       0x413c25/0x413ca5  cmp size, arg_len ; jne next  (FULL 32-bit)
       0x413c29..0x413c3c  byte loop, exactly `size` bytes:
                          cmp buf[i], arg[i] ; jne next
                          (0x413c30 sub esi,eax folds arg-buf once;
                           mismatch path re-loads arg from [ebp+8])
       0x413c3e/0x413cbe  all equal -> mov eax,node ; ret (MATCH)
       0x413c4a/0x413cca  next = [node+next_off] ; next == 0 -> MISS
     ATTR:  head_off 0x20 (ISAAC_SFX_XML_NODE_OFF_ATTRS_20),
            next_off 0x18 (ISAAC_SFX_XML_ATTR_OFF_NEXT_18),
            39 rel32 callers, 0 E9, 0 address-taken.
     CHILD: head_off 0x18 (ISAAC_SFX_XML_NODE_OFF_CHILDREN_18),
            next_off 0x2c (ISAAC_SFX_XML_NODE_OFF_NEXT_2C),
            96 rel32 callers.

   The plan walks IN-MODULE: `receiver` is the guest `this` pointer (the
   ecx the machine keeps, same shape as the anm2 three-stage lookup plan),
   arg_addr and every node pointer are guest addresses read from the chain
   itself. host_calls is ALWAYS 0 and pure_complete ALWAYS 1 — these two
   bodies are the first COMPLETE XML helpers in the family (ctor
   0x00413b90 was already complete; Parse 0x004155d0 keeps nested
   0x00416040 + the skip loop host).

   Remaining host in the XML cluster: nested parse 0x00416040, the
   input/whitespace skip loop inside Parse, Parse itself as a whole
   (link stores + recaptures), 0x004155d0's sibling-walk length, and the
   doc parser 0x0092d140 C/D driver. Next sequential XML VA after the two
   finds is the nested parse 0x00416040 (3 rel32: 0x415666, 0x4167bf,
   0x8f6509; allocator 0x416510 inside — device/allocator bound, will
   stay host or narrow). — LANDED at v14 below: the nested parse's
   DECISION LAYER (head gate, name table 0xb1ae60, "?xml " gate, "<!"
   markup kind, name/close/scan error laws, node type + init template,
   NUL-in-place addresses, per-path cursor math) is in-module; the
   allocator 0x416510, attrs 0x4165a0 and children 0x416770 stay host. */

enum {
  ISAAC_SFX_XML_FIND_SIZE_BYTES = 0x72, /* 0x413bf0..0x413c61 / 0x413c70..0x413ce1 */
  ISAAC_SFX_XML_FIND_INSNS = 71,
  ISAAC_SFX_XML_FIND_RET_ADJUST = 0xc,  /* 3 dwords: this + 2 args */

  ISAAC_SFX_XML_ATTR_FIND_HEAD_OFF = 0x20, /* [this+0x20] attr chain head */
  ISAAC_SFX_XML_ATTR_FIND_NEXT_OFF = 0x18, /* [node+0x18] attr next link */
  ISAAC_SFX_XML_CHILD_FIND_HEAD_OFF = 0x18, /* [this+0x18] child chain head */
  ISAAC_SFX_XML_CHILD_FIND_NEXT_OFF = 0x2c, /* [node+0x2c] child next link */

  /* node name is the family's custom {ptr,len} pair — NOT std::string.
     buf == 0 selects the empty-inline arm: size 0 at 0x00c71640. */
  ISAAC_SFX_XML_FIND_NAME_OFF = 0x00,
  ISAAC_SFX_XML_FIND_NAME_LEN_OFF = 0x08,
  ISAAC_SFX_XML_FIND_EMPTY_STRING_VA = 0x00c71640u,

  ISAAC_SFX_XML_ATTR_FIND_CALLERS = 39, /* E8 only; 0 E9; 0 dword */
  ISAAC_SFX_XML_CHILD_FIND_CALLERS = 96,

  ISAAC_SFX_XML_FIND_KIND_MISS = 0,     /* xor eax,eax ; ret 0xc */
  ISAAC_SFX_XML_FIND_KIND_MATCH = 1,    /* mov eax,edx ; ret 0xc */
  ISAAC_SFX_XML_FIND_KIND_NULL_ARG = 2  /* mov eax,[this+head] ; ret 0xc */
};

typedef struct IsaacSfxXmlFindPlan {
  int32_t entered;             /* mem != 0 */
  int32_t arg_null;            /* arg_addr == 0 (NULL_ARG arm) */
  uint32_t arg_len;            /* strlen(arg) — scan to NUL */
  uint32_t head;               /* [this+head_off] (NULL_ARG return value) */
  int32_t head_null;           /* head == 0 on a non-null arg */
  int32_t kind;                /* MISS / MATCH / NULL_ARG */
  uint32_t result;             /* node (MATCH) / head (NULL_ARG) / 0 */
  uint32_t visited;            /* nodes walked (NULL_ARG and empty walk: 0) */
  int32_t matched_index;       /* node ordinal on MATCH, else -1 */
  int32_t host_calls;          /* ALWAYS 0 — zero call instructions */
  int32_t pure_complete;       /* ALWAYS 1 — whole body is pure */
  uint32_t size_bytes;         /* ALWAYS 0x72 */
  int32_t caller_count;        /* 39 (ATTR) / 96 (CHILD) */
} IsaacSfxXmlFindPlan;

/* The four offset constants, as the C++ body consumes them. */
uint32_t isaac_sfx_xml_attr_find_head_off(void);
uint32_t isaac_sfx_xml_attr_find_next_off(void);
uint32_t isaac_sfx_xml_child_find_head_off(void);
uint32_t isaac_sfx_xml_child_find_next_off(void);

/* Walk this's attribute chain (head [this+0x20], next [node+0x18]) for a
   node whose name equals the C-string at arg_addr. `receiver` is the
   guest `this` pointer (linear-memory address, the anm2 plan shape:
   the pointer the machine keeps in ecx); arg_addr / every node pointer
   are guest addresses read from the chain itself. out may be null
   (no-op). Fully pure. */
void isaac_sfx_xml_attr_find_plan(uint8_t* receiver, uint32_t arg_addr,
                                  IsaacSfxXmlFindPlan* out);

/* Same law on the child chain (head [this+0x18], next [node+0x2c]). */
void isaac_sfx_xml_child_find_plan(uint8_t* receiver, uint32_t arg_addr,
                                   IsaacSfxXmlFindPlan* out);

/* ---------- v13: 0x00423480 the ".ogg" suffix compare ----------

   The SoundEffect::Load per-voice decision "does the resolved path end in
   .ogg" was recorded at v3 as a HOST edge: the compare call at VA 0x0092d052
   (`call 0x423480`) was treated as an opaque IO-result bit. The callee is
   actually a pure, self-contained string compare with zero calls, zero
   indirect branches, zero stores and two `ret`s. The resolved-path BYTES
   stay host (they are the output of ModManager::TryRedirectPath), but the
   DECISION over them is now transcribed as a law, so the previously-opaque
   "suffix_compare_result" becomes computable from four pure bytes. This unit
   lands the callee, not a new caller.

   identify-zhl: NO exact match — address-stable name kept.
   Measured 0x7d bytes 0x00423480..0x004234fc, 65 instructions, `ret` (cdecl
   register/stack pack: a in ecx, len_a in edx, b at [ebp+8], len_b at
   [ebp+0xc]). Whole-.text census: 33 direct rel32 callers, 0 E9 tails, 0
   address-taken dwords. One of the 33 is the SFX Load site at 0x0092d052;
   the other 32 are unrelated string compares (the helper is shared CRT
   glue). Machine truth, VA 0x00423480..0x004234fc:

     0x423484  ebx = [ebp+0xc]                  (len_b)
     0x423487  cmp ebx, edx ; mov esi, edx ; cmovb esi, ebx
                -> common = min(len_a, len_b), UNSIGNED (the cmovb gate).
     0x423493  sub esi, 4 ; jb 0x4234a9         common < 4 -> no dword pass
     0x423498  dword loop: eax = [ecx] ; cmp eax, [edi] ; jne byte-resolve
                ecx += 4 ; edi += 4 ; esi -= 4 ; jae loop
                -> floor(common/4) LITTLE-ENDIAN dword comparisons.
     0x4234a9  cmp esi,-4 ; je 0x4234e2        common%4 == 0 -> equal
     0x4234ae  byte tail: cmp byte [ecx+k],[edi+k] for k = 0..3 with
                `cmp esi,-3/-2/-1 ; je equal` guards between them.
     0x4234db  sbb eax,eax ; or eax,1           first differing byte:
                +1 iff a_byte > b_byte (CF=0), -1 iff a_byte < b_byte
                (CF=1) — an UNSIGNED byte compare.
     0x4234e2  xor eax,eax                      equal-so-far
     0x4234e8  cmp ebx,edx ; jbe 0x4234f4 ; or eax,-1
                len_b > len_a -> -1 (a is the shorter span).
     0x4234f4  sbb eax,eax ; neg eax            +1 iff len_a > len_b, else 0.

   The whole body is therefore the standard lexicographic compare of the two
   byte spans: the first differing byte decides by unsigned value; a common
   equal prefix ties by length. The SFX site passes len_a = len_b = 4
   (edx = 4 pinned at 0x0092d03f, the stack 4 at 0x0092d040) with a = the
   resolved path tail and b = the ".ogg" literal at 0x00b7b1bc
   (bytes 2e 6f 67 67, LE dword 0x67676f2e), so the site's match bit is
   `compare == 0` — exactly the law isaac_sfx_load_stream_byte consumes. */

enum {
  ISAAC_SFX_HOST_VA_OGG_COMPARE = 0x00423480u, /* no ZHL match */
  ISAAC_SFX_OGG_COMPARE_SIZE_BYTES = 0x7d,     /* 0x423480..0x4234fc */
  ISAAC_SFX_OGG_COMPARE_INSNS = 65,
  ISAAC_SFX_OGG_COMPARE_CALLERS = 33,          /* E8 only; 0 E9; 0 dword */
  ISAAC_SFX_OGG_COMPARE_SFX_CALLSITE = 0x0092d052u,
  ISAAC_SFX_OGG_LITERAL_VA = 0x00b7b1bcu,      /* ".ogg" + NULs */
  ISAAC_SFX_OGG_BYTE0 = 0x2e,                  /* '.' */
  ISAAC_SFX_OGG_BYTE1 = 0x6f,                  /* 'o' */
  ISAAC_SFX_OGG_BYTE2 = 0x67,                  /* 'g' */
  ISAAC_SFX_OGG_BYTE3 = 0x67,                  /* 'g' */
  ISAAC_SFX_OGG_DWORD_LE = 0x67676f2eu,        /* the dword pass literal */
  ISAAC_SFX_OGG_SUFFIX_LEN = 4                 /* both site lengths */
};

/* The `mov esi,edx ; cmp ebx,edx ; cmovb esi,ebx` at 0x423487: the number of
   bytes actually compared, UNSIGNED min of the two lengths. */
uint32_t isaac_sfx_cmp_common_len(uint32_t len_a, uint32_t len_b);

/* The 0x4234e8..0x4234f6 length tie-break: -1 when len_a < len_b (a is the
   shorter span), +1 when len_a > len_b, 0 when equal. The PE compares
   `cmp len_b,len_a ; jbe` and folds the borrow through `sbb/neg`. */
int32_t isaac_sfx_cmp_length_tie(uint32_t len_a, uint32_t len_b);

/* The full 0x00423480 body specialized to the SFX call site (both lengths
   are exactly 4): one LE dword pass then byte resolution. Every input is a
   full-width slot whose LOW byte is the character; wide values (0x100 etc.)
   are deliberately NOT pre-masked by the caller. Returns -1/0/+1. */
int32_t isaac_sfx_cmp4_three_way(uint32_t a0, uint32_t a1, uint32_t a2,
                                 uint32_t a3, uint32_t b0, uint32_t b1,
                                 uint32_t b2, uint32_t b3);

/* The Load-site call: a-side is the caller's tail bytes, b-side is pinned
   to the ".ogg" literal. Returns 0 exactly when the four low bytes equal
   2e 6f 67 67. */
int32_t isaac_sfx_ogg_suffix_compare(uint32_t b0, uint32_t b1, uint32_t b2,
                                     uint32_t b3);

/* The Load stream byte: 1 (stream) on an exact ".ogg" match, 0 (static)
   otherwise — the decision the v3 split consumed as an opaque result bit. */
int32_t isaac_sfx_ogg_suffix_match(uint32_t b0, uint32_t b1, uint32_t b2,
                                   uint32_t b3);

/* Integration: the same law behind isaac_sfx_load_stream_byte, computed from
   the four resolved-path tail bytes instead of an opaque compare result. */
int32_t isaac_sfx_load_stream_byte_from_tail(uint32_t b0, uint32_t b1,
                                             uint32_t b2, uint32_t b3);

typedef struct IsaacSfxSuffixComparePlan {
  uint32_t common_len;       /* min(len_a, len_b), unsigned (0x423487) */
  int32_t dword_loop;        /* common_len >= 4 — the `jb` gate at 0x423493 */
  int32_t prefix_equal;      /* equal-so-far after min(common_len,4) bytes,
                                i.e. the machine reached `xor eax,eax` at
                                0x4234e2 */
  int32_t three_way;         /* the final -1/0/+1 of the whole body */
  int32_t match;             /* three_way == 0 — the Load stream byte */
  uint32_t tail_bytes;       /* common_len % 4 — the byte-tail length */
} IsaacSfxSuffixComparePlan;

/* Struct form. len_a/len_b may be wider than 4; only the first four bytes of
   each side are supplied (the site always passes 4). out may be null. */
void isaac_sfx_suffix_compare_plan(uint32_t a0, uint32_t a1, uint32_t a2,
                                   uint32_t a3, uint32_t b0, uint32_t b1,
                                   uint32_t b2, uint32_t b3, uint32_t len_a,
                                   uint32_t len_b,
                                   IsaacSfxSuffixComparePlan* out);

/* ---------- v14: 0x00416040 the nested XML node parse ----------

   The body v11..v13 recorded as the irreducible "nested parse" host edge
   (3 rel32 callers: 0x415666 / 0x4167bf / 0x8f6509; the v11 Parse gate
   consumed it as `call 0x416040` on the LT arm). The whole body is NOT
   translated: the three callee bodies (node allocator 0x416510, attrs
   0x4165a0, children 0x416770) are device/allocator bound and stay host.
   What is landed here is the pure DECISION LAYER of the parse itself:
   every byte gate, every error-slot law, every node-link store arithmetic,
   and the per-path cursor advancement (the input-walk lengths stay
   host: the caller reports how far the host scan walked, exactly the v11
   after_ws_byte recapture shape).

   identify-zhl: NO exact match on the body, the allocator 0x416510, the
   attrs 0x4165a0, the children 0x416770, the name table 0xb1ae60, or the
   error strings 0xb1b678/0xb1b690/0xb1b6a8. Address-stable. Measured
   0x3f1 bytes 0x00416040..0x00416430, 336 instructions, 7 `ret 4`
   (one stack arg = pointer to the int32 cursor), 4 E8, 0 indirect,
   50 mem-stores. Whole-.text census: 3 direct rel32 callers, 0 E9,
   0 address-taken dwords.

   Calling shape: `node* __thiscall (this, int32* cursor_ptr)` — this is
   the doc receiver, cursor_ptr points at the int32 cursor.
   esi = cursor_ptr, [esi] = the int32 cursor (a position in the input
   buffer). The body advances [esi] as it consumes. Returns the parsed
   node (element / cdata) or 0 (PI / comment / doctype / generic markup).

   Machine truth, VA 0x00416040..0x00416430 (each exit verified):

     0x41604f  ecx = [esi]                    cursor value
     0x416051  al  = byte [ecx]               head byte
     0x416053  cmp al,0x21 ; je 0x41620e      '!' -> MARKUP
     0x41605b  cmp al,0x3f ; je 0x41617a      '?' -> PI
               else -> ELEMENT (head gate, LOW BYTE)

   ELEMENT (0x416063..0x416162):
     0x416065  lea ecx,[this+0x30] ; push 0x30 ; call 0x416510
               HOST node allocator (returns node; the allocator body
               itself calls 0xa0f4e0 or an indirect [pool+0x1000c]).
     0x41606f  node init template, six dword stores:
               [n+0x00]=0 [n+0x04]=0 [n+0x10]=0 [n+0x14]=1(ELEMENT)
               [n+0x18]=0 [n+0x20]=0          (children/attrs heads)
     0x416098  name scan: edx = [esi] (name start); skip while
               name_table[byte] != 0 (table 0xb1ae60: 1 EXCEPT
               0/9/10/13/32/47/62/63). ecx = name end.
     0x4160be  cmp ecx,edx                    name-empty FULL-WORD
     0x4160c7  [node+0x00] = name start       ISAAC_SFX_XML_NODE_OFF_NAME_00
     0x4160c9  cmovne eax,[0xc7de4c]          name_len!=0 -> prev slot
               with eax = 0xb1b690            else "expected element name"
     0x4160d0  sub ecx,edx ; [node+0x08] = ecx name_len (32-bit wrap)
     0x4160d7  [0xc7de4c] = eax               name error store
     0x4160dc  whitespace skip over table 0xb1b060 (space predicate,
               consumed BY REFERENCE from v11) — host length.
     0x416104  push node ; push &cursor ; ecx=this ; call 0x4165a0
               HOST attrs parse.
     0x41610d  al = byte [cursor]             tail byte
     0x416111  '>'  -> [cursor]=+1 ; push node ; call 0x416770
               HOST children parse.
     0x416125  '/'  -> [cursor]=+1 ; al-law close:
               0x41612d cmp byte [cursor+1],0x3e ; cmove eax,[0xc7de4c]
               with eax = 0xb1b6a8            next '>' -> keep slot
               else "expected >"; [cursor] += 1 (total +2).
     0x416143  else -> [0xc7de4c] = 0xb1b6a8  "expected >"
     0x41614d  eax = [node+0x00] ; test ; je 0x416165
     0x416156  byte [name_ptr + name_len] = 0 NUL-terminate in place
     0x416165  byte [0xc71640] = 0            empty-name arm (the v5
               SFX_ATTR_EMPTY_STRING_VA)     return node.
     cursor_after = cursor + name_len + ws_skip + (1 '>' / 2 '/' / 0 else).

   PI (0x41617a..0x41620c, head '?'):
     0x41617a  [cursor] = +1 ; dl = byte [cursor]
     0x41617f  dl in {x,X} && [c+1] in {m,M} && [c+2] in {l,L}
               && space_table(byte [c+3])     -> "?xml " decl scan
               else generic "?>" scan (0x4161e9).
               (each in the family's case-insensitive xml letters)
     0x4161ac  NUL latch law: `test dl,dl ; mov eax,0xb1b678 ;
               cmovne eax,edi ; inc ecx` — a NUL BEFORE "?>" latches
               the slot to 0xb1b678 ("unexpected end of data"), the
               scan keeps advancing (host length).
     0x4161d3  "?>" found: [cursor] = pos+2 ; [0xc7de4c] = latched ;
               return 0.  cursor_after = found_pos + 2.

   MARKUP (0x41620e..0x41642e, head '!'):
     0x41620e  b1 = byte [cursor+1]
               b1 '-' && b2 '-'      -> COMMENT ("<!--")
               b1 'D' && "OCTYPE" at b2..b7 && space(b8) -> DOCTYPE
               b1 '[' && b2..b6 "CDATA" && b7 '[' -> CDATA
               else                  -> GENERIC ("<!")
               (markup kind gate, LOW BYTES, in machine order)
     COMMENT (0x4163ae): find "-->" with the NUL latch; found:
               [cursor] = pos+3 ; [0xc7de4c] = latched ; return 0.
     CDATA  (0x416267): text_start = cursor+8 ; find "]]>" with latch;
               found: HOST allocator 0x416510 (node, type 3); node init
               template with [n+0x14]=3 (CDATA), [n+0x04]=text_start,
               [n+0x0c] = found - text_start (32-bit wrap), then
               byte [found] = 0 (NUL in place), [cursor] = pos+3,
               return node.  cursor_after = found_pos + 3.
     DOCTYPE (0x4162f2): find '>' with SIGNED bracket depth for
               "[...]": '[' depth++ / ']' depth-- / NUL 0xb1b678 ;
               `movsx eax,byte` makes the byte SIGNED at the depth
               compare (`test edx,edx ; jg`); found: [cursor]=pos+1,
               return 0. The NUL error is stored DURING the scan, so
               error_store = latched.  cursor_after = found_pos + 1.
     GENERIC (0x4163f6): find '>' after cursor+1 with the NUL latch;
               found: [cursor] = pos+1 ; [0xc7de4c] = latched ;
               return 0.  cursor_after = found_pos + 1.

   Node type law: ELEMENT -> 1 at node+0x14, CDATA -> 3. The two init
   templates share the SAME six offsets {0x00,0x04,0x10,0x14,0x18,0x20};
   the type value at +0x14 is the only difference. Node size 0x30.

   Remaining host: the node allocator 0x416510 (=> 0xa0f4e0), attrs
   0x4165a0, children 0x416770, and the host-length input walks (the
   caller reports name_len / ws_skip / found_pos / latch). */

enum {
  ISAAC_SFX_XML_NESTED_PARSE_SIZE_BYTES = 0x3f1u, /* 0x416040..0x416430 */
  ISAAC_SFX_XML_NESTED_PARSE_INSNS = 336,
  ISAAC_SFX_XML_NESTED_PARSE_RETS = 7,       /* all `ret 4` */
  ISAAC_SFX_XML_NESTED_PARSE_E8 = 4,         /* 2x 0x416510, 0x4165a0, 0x416770 */
  ISAAC_SFX_XML_NESTED_PARSE_STORES = 50,

  ISAAC_SFX_XML_NESTED_NAME_TABLE_VA = 0x00b1ae60u, /* 1 except 0/9/10/13/32/47/62/63 */
  ISAAC_SFX_XML_NESTED_ERR_UNEXPECTED_VA = 0x00b1b678u, /* "unexpected end of data" */
  ISAAC_SFX_XML_NESTED_ERR_NAME_VA = 0x00b1b690u,   /* "expected element name" */
  ISAAC_SFX_XML_NESTED_ERR_GT_VA = 0x00b1b6a8u,     /* "expected >" */

  ISAAC_SFX_XML_NESTED_HEAD_ELEMENT = 0,     /* head gate: else arm */
  ISAAC_SFX_XML_NESTED_HEAD_PI = 1,          /* '?' 0x3f */
  ISAAC_SFX_XML_NESTED_HEAD_MARKUP = 2,      /* '!' 0x21 */
  ISAAC_SFX_XML_NESTED_HEAD_BANG = 0x21,
  ISAAC_SFX_XML_NESTED_HEAD_QMARK = 0x3f,
  ISAAC_SFX_XML_NESTED_TAIL_OTHER = 0,       /* element tail gate */
  ISAAC_SFX_XML_NESTED_TAIL_GT = 1,          /* '>' 0x3e -> children */
  ISAAC_SFX_XML_NESTED_TAIL_CLOSE = 2,       /* '/' 0x2f -> self-close */
  ISAAC_SFX_XML_NESTED_TAIL_GT_BYTE = 0x3e,
  ISAAC_SFX_XML_NESTED_TAIL_SLASH_BYTE = 0x2f,
  ISAAC_SFX_XML_NESTED_MARKUP_DASH_BYTE = 0x2d, /* "--" start of a comment */

  ISAAC_SFX_XML_NESTED_MARKUP_GENERIC = 0,   /* "<! ..." fallback */
  ISAAC_SFX_XML_NESTED_MARKUP_COMMENT = 1,   /* "<!--" */
  ISAAC_SFX_XML_NESTED_MARKUP_CDATA = 2,     /* "<![CDATA[" */
  ISAAC_SFX_XML_NESTED_MARKUP_DOCTYPE = 3,   /* "<!DOCTYPE" */

  ISAAC_SFX_XML_NESTED_NODE_TYPE_ELEMENT = 1, /* the +0x14 init value */
  ISAAC_SFX_XML_NESTED_NODE_TYPE_CDATA = 3,
  ISAAC_SFX_XML_NESTED_NODE_SIZE = 0x30,
  ISAAC_SFX_XML_NESTED_ALLOC_VA = 0x00416510u,   /* host node allocator */
  ISAAC_SFX_XML_NESTED_ALLOC_TARGET = 0x00a0f4e0u, /* guest allocator */
  ISAAC_SFX_XML_NESTED_ATTRS_VA = 0x004165a0u,   /* host attrs parse */
  ISAAC_SFX_XML_NESTED_CHILDREN_VA = 0x00416770u,/* host children parse */

  ISAAC_SFX_XML_NODE_OFF_TEXT_04 = 0x04,     /* cdata: text ptr */
  ISAAC_SFX_XML_NODE_OFF_TEXT_LEN_0C = 0x0c, /* cdata: text length */
  ISAAC_SFX_XML_NODE_OFF_TYPE_14 = 0x14,     /* 1 element / 3 cdata */
  ISAAC_SFX_XML_NODE_OFF_PARENT_10 = 0x10,   /* init zero; parse links it */

  /* element name ptr/len reuse the family's custom pair BY REFERENCE:
     ISAAC_SFX_XML_NODE_OFF_NAME_00 / ISAAC_SFX_XML_NODE_OFF_NAME_LEN_08.
     node+0x18 / +0x20 are the children/attrs heads BY REFERENCE too. */
  ISAAC_SFX_XML_NESTED_INIT_OFFSETS_COUNT = 6
};

/* 0x416051..0x41605d: the head byte LOW BYTE: '!' -> MARKUP,
   '?' -> PI, else ELEMENT. */
int32_t isaac_sfx_xml_nested_parse_head_gate(uint32_t head_byte);

/* Table 0xb1ae60: 1 except NUL/TAB/LF/CR/SPACE/'/'/'>'/'?'
   (0, 9, 10, 13, 32, 47, 62, 63). LOW BYTE. The element name scan and
   PI/x-markup candidates skip while this is 1. */
int32_t isaac_sfx_xml_nested_parse_name_char(uint32_t byte);

/* 0x41617f..0x4161a3: "?xml " gate — byte1 in {x,X}, byte2 in {m,M},
   byte3 in {l,L}, and byte4 the v11 space predicate (0xb1b060). LOW
   BYTES each. 1 = xml-declaration scan, 0 = generic "?>" scan. */
int32_t isaac_sfx_xml_nested_parse_pi_decl_gate(uint32_t b1, uint32_t b2,
                                                uint32_t b3, uint32_t b4);

/* 0x41620e..0x416261: the markup kind of "<!" from the byte after '!'
   and the seven following. ORDER is the machine's: COMMENT (b1 '-',
   b2 '-'), DOCTYPE (b1 'D', "OCTYPE", space(b8)), CDATA (b1 '[',
   "CDATA", b7 '['), else GENERIC. LOW BYTES. */
int32_t isaac_sfx_xml_nested_parse_markup_kind(uint32_t b1, uint32_t b2,
                                               uint32_t b3, uint32_t b4,
                                               uint32_t b5, uint32_t b6,
                                               uint32_t b7, uint32_t b8);

/* 0x4160d0 `sub ecx,edx`: name_len = end - start, 32-bit wrap. */
uint32_t isaac_sfx_xml_nested_parse_name_len(uint32_t name_start,
                                             uint32_t name_end);

/* 0x4160c9 `cmp ecx,edx ; cmovne` — the FULL-WORD name-empty slot law:
   name_len == 0 -> 0xb1b690 ("expected element name"), else prev. */
uint32_t isaac_sfx_xml_nested_parse_name_error(uint32_t prev_error,
                                               uint32_t name_len);

/* 0x41612d `cmp byte [cursor+1],0x3e ; cmove` — the element close law:
   the byte after '/' is '>' (LOW BYTE) -> keep prev slot, else
   0xb1b6a8 ("expected >"). */
uint32_t isaac_sfx_xml_nested_parse_tail_error(uint32_t prev_error,
                                               uint32_t close_byte);

/* 0x4161c4 / 0x416286 / 0x4163d1 / 0x416405: the scan NUL latch.
   byte == 0 (LOW BYTE) -> 0xb1b678 ("unexpected end of data"), else
   keep prev. One law shared by PI, comment, cdata, generic and (as an
   immediate store) doctype. */
uint32_t isaac_sfx_xml_nested_parse_scan_error(uint32_t prev_error,
                                               uint32_t byte);

/* The node type at node+0x14: ELEMENT -> 1, CDATA -> 3, else 0. */
int32_t isaac_sfx_xml_nested_parse_node_type(int32_t head_gate,
                                             int32_t markup_kind);

/* 1 iff `off` is one of the six node init store displacements
   {0x00,0x04,0x10,0x14,0x18,0x20} (element and cdata share the set). */
int32_t isaac_sfx_xml_nested_parse_node_writes_offset(uint32_t off);

/* 0x416156 `mov byte [eax+ecx],0` — the in-place NUL address of the
   element name = name_ptr + name_len (64-bit free; the PE adds the two
   full words). */
uint32_t isaac_sfx_xml_nested_parse_nul_position(uint32_t name_ptr,
                                                 uint32_t name_len);

/* 0x4162db `sub ecx,ebx` — the cdata text length = found - text_start,
   32-bit wrap. */
uint32_t isaac_sfx_xml_nested_parse_cdata_text_len(uint32_t text_start,
                                                   uint32_t found);

/* Per-path cursor arithmetic. post_attrs = the cursor the HOST attrs call
   leaves (ELEMENT only; it already includes the name+ws walk); found_pos
   = absolute position of the terminator's FIRST byte (scan paths); the
   tail gate is only meaningful on ELEMENT. Returns the wrap [cursor] the
   body leaves. */
uint32_t isaac_sfx_xml_nested_parse_cursor_after(
    int32_t head_gate, int32_t markup_kind, int32_t tail_gate,
    uint32_t post_attrs, uint32_t found_pos);

typedef struct IsaacSfxXmlNestedParsePlan {
  int32_t entered;             /* recoverable gate (always 1) */
  int32_t head_gate;           /* ELEMENT / PI / MARKUP */
  int32_t markup_kind;         /* GENERIC / COMMENT / CDATA / DOCTYPE */
  int32_t node_type;           /* 1 element / 3 cdata / 0 none */
  int32_t allocator_call;      /* 1 iff a node is allocated (elem/cdata) */
  uint32_t allocator_va;       /* ALWAYS 0x00416510 */
  uint32_t allocator_target;   /* ALWAYS 0x00a0f4e0 */
  uint32_t node_size;          /* ALWAYS 0x30 */
  int32_t attrs_call;          /* 1 on ELEMENT (0x4165a0) */
  uint32_t attrs_va;           /* ALWAYS 0x004165a0 */
  int32_t children_call;       /* 1 iff ELEMENT tail GT (0x416770) */
  uint32_t children_va;        /* ALWAYS 0x00416770 */
  uint32_t name_ptr;           /* ELEMENT: node+0x00 store value */
  uint32_t name_len;           /* ELEMENT: node+0x08 store value */
  int32_t name_empty;          /* name_len == 0 (FULL-WORD) */
  uint32_t name_error;         /* the slot value after the name scan */
  int32_t ws_skip;             /* ELEMENT: host space-skip length */
  int32_t tail_gate;           /* ELEMENT: OTHER / GT / CLOSE */
  uint32_t close_error;        /* ELEMENT CLOSE: slot after the close law */
  uint32_t error_slot;         /* the final [0xc7de4c] value */
  int32_t error_store;         /* 1 iff the body stores the slot */
  int32_t scan_latched;        /* a NUL was seen before the terminator */
  uint32_t text_ptr;           /* CDATA: node+0x04 store value */
  uint32_t text_len;           /* CDATA: node+0x0c store value */
  uint32_t nul_pos;            /* the in-place 0 store address */
  uint32_t cursor_after;       /* the [cursor] the body leaves */
  int32_t host_calls;          /* elem 2/3, cdata 1, else 0 */
  int32_t pure_complete;       /* ALWAYS 0 — allocator/attrs/children host */
  uint32_t size_bytes;         /* ALWAYS 0x3f1 */
  int32_t caller_count;        /* ALWAYS 3 (ISAAC_SFX_XML_NESTED_PARSE_CALLERS) */
} IsaacSfxXmlNestedParsePlan;

/* The full decision record. head_gate / markup_kind / tail_gate come
   from the gate exports above; name_len, ws_skip, found_pos (= absolute
   terminator position, any path), close_byte, scan_latched and
   post_attrs (ELEMENT only: the cursor value the HOST attrs call leaves)
   are the HOST-walk recaptures; prev_error is [0xc7de4c] at entry;
   cursor_base is the cursor value the body started from (name start for
   element, the '!' / '?' position for the scan paths). out may be null. */
void isaac_sfx_xml_nested_parse_plan(uint32_t cursor_base,
                                     uint32_t post_attrs, int32_t head_gate,
                                     int32_t markup_kind, uint32_t name_len,
                                     uint32_t ws_skip, int32_t tail_gate,
                                     uint32_t close_byte,
                                     uint32_t found_pos,
                                     int32_t scan_latched,
                                     uint32_t prev_error,
                                     IsaacSfxXmlNestedParsePlan* out);

/* ============================ v15 ==========================================
 * ABI 15 peels the PURE pool arithmetic of the XML node allocator
 * 0x00416510 (66 insns, first_ret 0x41659a, 1 ret 4, 1 E8, 1 indirect, 5
 * mem-stores, 16 direct callers) and the pure decision laws of its ATTRS
 * caller 0x004165a0 (152 insns, first_ret 0x416769, 1 ret 8, 3 E8, 31
 * stores, 1 direct caller: 0x416104 in the nested parse). The allocator
 * call itself stays host: the direct arm targets 0xa0f4e0, the indirect
 * arm calls [pool+0x1000c] (the doc's 0x1003c pool-mark slot; nonzero
 * asks for a custom grow, 0 routes to 0xa0f4e0 — the standing allocator
 * decision). The attrs scanner callees 0x416b70 / 0x416920 stay host too.
 *
 * The pool `this` sits at doc+0x30, so [+0x00] = [doc+0x30] (base),
 * [+0x04] = [doc+0x34] (the cursor / free), [+0x08] = [doc+0x38] (pool
 * end) and [+0x1000c] = [doc+0x1003c] (the pool mark / grow function).
 * LANDED arithmetic, all re-traced from the listing:
 *   0x41651a..0x416522 align-up: free + ((-free) & 3) (neg/and/add).
 *   0x416525..0x41652b cap compare: aligned+size vs end, UNSIGNED, grow
 *     only when strictly above (`jbe` fast arm).
 *   0x416533..0x416540 grow request: max(size, 0x10000) UNSIGNED + 0xa.
 *   0x41656d..0x416594 grow tail: given host alloc result r — link slot
 *     align4(r), node_ptr align4(link_slot+4), base = r, end = r +
 *     request, free = node_ptr + size.
 *   0x41658f..0x416594 fast tail: return align4(free), free = that+size.
 *
 * AUDITED at v20: the v15 note's "OOM slot update stays host" claim was
 * WRONG on the value. The DECISION (`r==0 -> 0xb1b6b4 else prev`,
 * FULL-WORD `test edx,edx` + `cmovne` at 0x41655a..0x416561) is pure —
 * only the alloc CALL and the 0x416568 [0xc7de4c] STORE are host. The
 * grow-arm SELECT (`test eax,[pool+0x1000c] ; je DIRECT` at 0x416543) is
 * also pure. Both land at v20 below. The indirect arm never touches the
 * slot (jumps to the common tail), so the OOM law is direct-arm only —
 * matching the original "direct arm only" qualifier.
 *
 * ATTRS laws landed (each re-traced branch-by-branch):
 *   name chars: table 0xb1af60 — 0 at {0,9,10,13,32,33,47,60,61,62,63}
 *     (245 of 256 one), STRICTER than the element table 0xb1ae60: attr
 *     names cannot hold '!' '<' '=' either.
 *   name-empty: FULL-WORD cmp end,start; empty -> 0xb1b6c4 ("expected
 *     attribute name") else prev.
 *   '=' gate: LOW-BYTE cmp 0x3d; '=' -> prev else 0xb1b6dc ("expected =").
 *   quote dispatch: LOW BYTE 0x27 single, 0x22 double, else unquoted.
 *   value-close: LOW-BYTE cmp end_byte,quote_byte; equal -> the CURRENT
 *     slot (prev) else 0xb1b6e8 ("expected ' or \"").
 *   value length: end - start wrap (0x4166e6).
 *   the attr node writes 7 store offsets {0x00,0x04,0x08,0x0c,0x10,0x14,
 *     0x18} (name ptr, value ptr, name len, value len, parent, prev,
 *     next); node size 0x1c. The ws skips reuse the v11 0xb1b060 space
 *     predicate (isaac_sfx_xml_doc_parse_is_space) unchanged. */

enum {
  ISAAC_SFX_XML_POOL_ALLOC_VA = 0x00416510u, /* this = doc+0x30 */
  ISAAC_SFX_XML_POOL_DIRECT_TARGET = 0x00a0f4e0u, /* direct grow arm */
  ISAAC_SFX_XML_POOL_OFF_BASE_00 = 0x00,
  ISAAC_SFX_XML_POOL_OFF_FREE_04 = 0x04, /* [doc+0x34] the cursor/free */
  ISAAC_SFX_XML_POOL_OFF_END_08 = 0x08,  /* [doc+0x38] pool end */
  ISAAC_SFX_XML_POOL_OFF_GROW_FN_1000C = 0x1000cu, /* [doc+0x1003c] mark */
  ISAAC_SFX_XML_POOL_ALIGN = 4,          /* neg/and/add modulus */
  ISAAC_SFX_XML_POOL_CAP = 0x10000u,     /* cmovbe cap */
  ISAAC_SFX_XML_POOL_GROW_OVERHEAD = 0x0au, /* always added to the request */
  ISAAC_SFX_XML_POOL_ERR_OOM_VA = 0x00b1b6b4u, /* "out of memory" */
  ISAAC_SFX_XML_POOL_ERR_SLOT_VA = 0x00c7de4cu, /* the global error slot */
  ISAAC_SFX_XML_POOL_ALLOC_SIZE_BYTES = 0x90u,    /* 0x416510..0x4165a0 */
  ISAAC_SFX_XML_POOL_ALLOC_INSNS = 66,
  ISAAC_SFX_XML_POOL_ALLOC_RETS = 1,
  ISAAC_SFX_XML_POOL_ALLOC_E8 = 1,
  ISAAC_SFX_XML_POOL_ALLOC_INDIRECT = 1,
  ISAAC_SFX_XML_POOL_ALLOC_STORES = 5,
  ISAAC_SFX_XML_POOL_ALLOC_CALLERS = 16,

  ISAAC_SFX_XML_ATTR_NAME_TABLE_VA = 0x00b1af60u,
  ISAAC_SFX_XML_ATTR_ERR_NAME_VA = 0x00b1b6c4u, /* "expected attribute name" */
  ISAAC_SFX_XML_ATTR_ERR_EQ_VA = 0x00b1b6dcu,   /* "expected =" */
  ISAAC_SFX_XML_ATTR_ERR_VALUE_VA = 0x00b1b6e8u, /* "expected ' or \"" */
  ISAAC_SFX_XML_ATTR_EQ_BYTE = 0x3d,            /* '=' */
  ISAAC_SFX_XML_ATTR_QUOTE_SINGLE_BYTE = 0x27,  /* '\'' */
  ISAAC_SFX_XML_ATTR_QUOTE_DOUBLE_BYTE = 0x22,  /* '"' */
  ISAAC_SFX_XML_ATTR_QUOTE_UNQUOTED = 0,        /* no quote byte */
  ISAAC_SFX_XML_ATTR_QUOTE_SINGLE = 1,
  ISAAC_SFX_XML_ATTR_QUOTE_DOUBLE = 2,
  ISAAC_SFX_XML_ATTR_QUOTE_NONE = 3,            /* unquoted value arm */
  ISAAC_SFX_XML_ATTR_NODE_SIZE = 0x1cu,
  ISAAC_SFX_XML_ATTR_NODE_STORE_OFFSETS_COUNT = 7,
  ISAAC_SFX_XML_ATTRS_SIZE_BYTES = 0x1d0u, /* 0x4165a0..0x416770 */
  ISAAC_SFX_XML_ATTRS_INSNS = 152,
  ISAAC_SFX_XML_ATTRS_RETS = 1,
  ISAAC_SFX_XML_ATTRS_E8 = 3, /* 0x416510, 0x416b70, 0x416920 */
  ISAAC_SFX_XML_ATTRS_STORES = 31,
  ISAAC_SFX_XML_ATTRS_CALLERS = 1
};

/* 0x41651a..0x416522 (and the grow-tail repeats at 0x416571..0x416576 /
   0x416587..0x41658c): `neg edx ; and edx,3 ; add edx,orig` — x +
   ((-x) & 3), the pool align-up to 4, 32-bit wrap. */
uint32_t isaac_sfx_xml_pool_align4(uint32_t x);

/* 0x416525..0x41652b `lea eax,[aligned+size] ; cmp eax,[pool+8] ; jbe`:
   1 iff align4(free) + size > end, UNSIGNED (`jbe` fast arm: grow only
   when strictly above). */
int32_t isaac_sfx_xml_pool_need_grow(uint32_t free, uint32_t end,
                                     uint32_t size);

/* 0x416533..0x416540 `cmp size,0x10000 ; cmovbe` then `add 0xa`: the
   request handed to the grow call = (size <= 0x10000 ? 0x10000 : size)
   + 0xa, UNSIGNED, wrap. Computed on the grow arm only. */
uint32_t isaac_sfx_xml_pool_grow_request(uint32_t size);

typedef struct IsaacSfxXmlPoolGrowTail {
  uint32_t link_slot; /* align4(alloc) — where the previous base is stored */
  uint32_t node_ptr;  /* align4(link_slot + 4) — the returned node */
  uint32_t new_base;  /* [pool+0] = alloc */
  uint32_t new_end;   /* [pool+8] = alloc + request */
  uint32_t new_free;  /* [pool+4] = node_ptr + size */
} IsaacSfxXmlPoolGrowTail;

/* 0x41656d..0x416594 — the grow-arm layout arithmetic GIVEN the host
   alloc result r (the direct/indirect call, the OOM slot store and the
   base-write memory are host). out may be null. */
void isaac_sfx_xml_pool_grow_tail(uint32_t alloc_ptr, uint32_t request,
                                  uint32_t size,
                                  IsaacSfxXmlPoolGrowTail* out);

typedef struct IsaacSfxXmlPoolPlan {
  uint32_t aligned_free;   /* align4(free) — the FAST-path return value */
  uint32_t fast_bump;      /* aligned_free + size — [pool+4] on the fast arm */
  int32_t grow;            /* aligned_free + size > end, UNSIGNED */
  uint32_t grow_request;   /* the alloc arg (0 on the fast arm — the cap
                              arithmetic runs only after the jbe) */
  int32_t pool_slots;      /* ALWAYS 4 — the pool fields the body touches */
  uint32_t alloc_va;       /* ALWAYS 0x00416510 */
  uint32_t alloc_target;   /* ALWAYS 0x00a0f4e0 (the direct arm) */
  uint32_t grow_fn_offset; /* ALWAYS 0x1000c (the indirect arm) */
  int32_t host_calls;      /* 1 iff grow (the alloc call), else 0 */
  int32_t pure_complete;   /* ALWAYS 0 — the alloc call stays host */
} IsaacSfxXmlPoolPlan;

/* The pool decision record. free = [pool+4], end = [pool+8], size = the
   requested node bytes. out may be null. */
void isaac_sfx_xml_pool_plan(uint32_t free, uint32_t end, uint32_t size,
                             IsaacSfxXmlPoolPlan* out);

/* ============================ v20 ==========================================
 * The last two PURE decisions inside the node allocator 0x00416510 (the
 * v15 arithmetic covered the bump/grow/cap laws; the AUDIT at v20 found
 * the two remaining gates — both FULL-WORD zero tests — that v15 had
 * wrongly declared host. The alloc CALL itself (0xa0f4e0 direct /
 * [pool+0x1000c] indirect) and every memory STORE stay host; these laws
 * are the VALUES fed to those edges).
 *
 *   0x416543..0x416545 `test eax,eax ; je 0x416551` on eax =
 *   [pool+0x1000c] (the pool mark / grow fn, loaded at 0x41653a): the
 *   grow arm selects DIRECT (call 0xa0f4e0) iff the grow fn is 0,
 *   else INDIRECT (call eax). FULL-WORD. The indirect arm receives the
 *   request on the stack; the direct arm in ecx — the arm choice is the
 *   decision, the calls stay host.
 *   0x41655a..0x416561 `mov eax,0xb1b6b4 ; test edx,edx ; cmovne
 *   eax,[0xc7de4c]` on edx = r, the direct-arm alloc result: r == 0
 *   -> 0xb1b6b4 ("out of memory"), r != 0 -> the PREV slot value
 *   (recaptured at cmovne time). FULL-WORD; the 0x416568 [0xc7de4c]
 *   STORE is host memory, the VALUE is pure. Runs on the DIRECT arm
 *   only (the indirect arm jumps to the common tail without touching
 *   the slot).
 */
enum {
  ISAAC_SFX_XML_POOL_ARM_DIRECT = 0,  /* grow_fn == 0 -> 0xa0f4e0 */
  ISAAC_SFX_XML_POOL_ARM_INDIRECT = 1, /* grow_fn != 0 -> call [pool+0x1000c] */
};

/* 0x416543..0x416545 `test eax,eax ; je 0x416551` — FULL-WORD zero test
   of the pool grow fn: 0 -> DIRECT, anything else -> INDIRECT. */
int32_t isaac_sfx_xml_pool_grow_arm(uint32_t grow_fn);

/* 0x41655a..0x416561 `mov eax,0xb1b6b4 ; test edx,edx ; cmovne
   eax,[0xc7de4c]` — FULL-WORD: the direct-arm OOM slot VALUE =
   (alloc_r == 0) ? 0xb1b6b4 : prev_slot. The store stays host. */
uint32_t isaac_sfx_xml_pool_oom_slot(uint32_t alloc_r,
                                     uint32_t prev_slot);

/* ============================ v21 ==========================================
 * The parent XML reader 0x0092d140's ELEMENT DISPATCH + error gating,
 * VA 0x92d3ec..0x92d470 (0x84 bytes). The reader primitives 0x413c70
 * (CHILD find) / 0x413bf0 (ATTR find) are fully pure at v12 and the
 * root-name string law (0x92d40d..0x92d446) at v9; v21 lands the
 * reader's DISPATCH GRAMMAR: the three element-name constants
 * ("sounds" -> "root" attr -> "sound" children), the find variant each
 * dispatch uses, the ONE explicit gate (0x92d466 FULL-WORD sound-
 * element test -> epilogue skip) and the per-sound pipeline stage
 * wiring into the landed helpers.
 *
 * Machine trace (from the raw PE, .text VA 0x401000):
 *   0x92d3f2 push 0xb7b1b4 ("sounds" ; 0x92d3f7 call 0x413c70 —
 *     CHILD find on the DOC (head 0x18 / next 0x2c) -> esi. The machine
 *     branches NOWHERE on this result.
 *   0x92d403 push 0xb66f40 ("root") ; 0x92d408 call 0x413bf0 — ATTR
 *     find on the sounds node (head 0x20 / next 0x18) -> eax. NO gate;
 *     the attr's VALUE ptr at +0x04 is the root name the v9
 *     root_name_plan consumes (its own FULL-WORD fallback covers a null
 *     result). SEH marks: dword [ebp-4] = 1 before the parse call
 *     (0x92d3dd), byte [ebp-4] = 2 before the sound find (0x92d44e).
 *   0x92d454 push 0xb7b1ac ("sound") ; 0x92d459 call 0x413c70 — CHILD
 *     find on the sounds node (head 0x18 / next 0x2c) -> esi.
 *   0x92d466 test esi,esi ; 0x92d468 je 0x92db29 — THE gate, FULL-WORD:
 *     no "sound" child -> the 0x92db29 epilogue (returns TRUE), which
 *     skips the ENTIRE per-sound pipeline (proto/attrs/append/fill/
 *     sample/slot/tail) while the root-name string free still runs (v8).
 *   0x92d470 = the pipeline head — proto_init(0x92d470, v9) ->
 *     entry_attrs(0x92d4cd, v5) -> append_arm(0x92d5b0, v5/v9) ->
 *     fill(0x92d6fa, v5) -> sample_find(0x92d81f, v5) ->
 *     slot_fill(0x92d890, v5) -> tail/Load+counter(0x92da86, v6) ->
 *     chain_next(0x92db21, v6).
 *
 * Dispatch host edges: 3 finds (0x92d3f7 / 0x92d408 / 0x92d459) + 1
 * string assign (0x92d446) — always, once the v9 open gate passed.
 * Per visited sound node: 1 Load edge (0x92da98 = SoundEffect::Load,
 * the v3 host split) when the gate passes. The doc ctor (0x92d3cc) and
 * parse (0x92d3e4) callsites are the already-asserted constants.
 */
enum {
  ISAAC_SFX_XML_ELEM_SOUNDS_VA = 0x00b7b1b4u, /* "sounds" — the doc CHILD */
  ISAAC_SFX_XML_ELEM_SOUNDS_LEN = 7,
  ISAAC_SFX_XML_ELEM_ROOT_VA = 0x00b66f40u,   /* "root" — the sounds ATTR */
  ISAAC_SFX_XML_ELEM_ROOT_LEN = 4,
  ISAAC_SFX_XML_ELEM_SOUND_VA = 0x00b7b1acu,  /* "sound" — per-sound child */
  ISAAC_SFX_XML_ELEM_SOUND_LEN = 5,
  ISAAC_SFX_XML_SOUND_DISPATCH_COUNT = 3, /* table rows: sounds/root/sound */
  ISAAC_SFX_XML_SEH_STATE_PARSE = 1,      /* dword [ebp-4] at 0x92d3dd */
  ISAAC_SFX_XML_SEH_STATE_SOUND = 2,      /* byte  [ebp-4] at 0x92d44e */
  ISAAC_SFX_XML_ROOT_NAME_READ_OFF = 0x04, /* the attr VALUE ptr (+0x04) */
  /* Find-variant reply for the three dispatches — the v12 head/next
     pairs, shared: CHILD = {0x18, 0x2c}, ATTR = {0x20, 0x18}. */
  ISAAC_SFX_XML_FIND_VARIANT_CHILD = 0,
  ISAAC_SFX_XML_FIND_VARIANT_ATTR = 1,
  /* Per-sound pipeline stage bits (stages_mask), in machine order. */
  ISAAC_SFX_SOUND_PIPE_PROTO = 0x01,        /* 0x92d470 proto init (v9) */
  ISAAC_SFX_SOUND_PIPE_ENTRY_ATTRS = 0x02,  /* 0x92d4cd entry attrs (v5) */
  ISAAC_SFX_SOUND_PIPE_APPEND_ARM = 0x04,   /* 0x92d5b0 append arm (v5/v9) */
  ISAAC_SFX_SOUND_PIPE_FILL = 0x08,         /* 0x92d6fa fill (v5) */
  ISAAC_SFX_SOUND_PIPE_SAMPLE_FIND = 0x10,  /* 0x92d81f sample find (v5) */
  ISAAC_SFX_SOUND_PIPE_SLOT_FILL = 0x20,    /* 0x92d890 slot fill (v5) */
  ISAAC_SFX_SOUND_PIPE_TAIL = 0x40,         /* 0x92da86 tail (v6) */
  ISAAC_SFX_SOUND_PIPE_CHAIN = 0x80,        /* 0x92db21 chain (v6) */
  ISAAC_SFX_SOUND_PIPE_ALL = 0xff,          /* every stage on one sound */
  ISAAC_SFX_XML_SOUND_DISPATCH_HOST_CALLS = 4, /* 3 finds + 1 assign */
  ISAAC_SFX_XML_SOUND_DISPATCH_SIZE_BYTES = 0x84u, /* 0x92d3ec..0x92d470 */
  ISAAC_SFX_XML_SOUND_DISPATCH_CALLERS = 2, /* 0x008f42cd / 0x0095310f */
};

/* The dispatch-name table, index 0..2 = sounds/root/sound. -1 out of
   range. */
int32_t isaac_sfx_xml_dispatch_elem_va(int32_t index);
int32_t isaac_sfx_xml_dispatch_elem_len(int32_t index);

/* 0x92d466 `test esi,esi ; je 0x92db29` on the find("sound") result —
   FULL-WORD: nonzero -> 1 (the per-sound pipeline runs), zero -> the
   0x92db29 epilogue (TRUE, nothing else runs). */
int32_t isaac_sfx_xml_sound_gate(uint32_t node_nonzero);

typedef struct IsaacSfxXmlSoundDispatchPlan {
  int32_t  sounds_found;      /* find("sounds") != 0 — FULL-WORD; the
                                 machine branches NOWHERE on this */
  int32_t  root_attr_found;   /* find attr "root" != 0 — FULL-WORD;
                                 feeds the v9 root-name fallback */
  int32_t  sound_found;       /* find("sound") != 0 — FULL-WORD, THE
                                 0x92d466 gate */
  int32_t  loop_entered;      /* = sound_found (the pipeline runs) */
  int32_t  epilogue_skip;     /* = !sound_found (je 0x92db29) */
  uint32_t stages_mask;       /* SOUND_PIPE_ALL when entered else 0 */
  int32_t  dispatch_host_calls;  /* ALWAYS 4 (3 finds + 1 assign) */
  int32_t  per_sound_host_calls; /* 1 (SoundEffect::Load) when entered */
  int32_t  seh_state_parse;   /* ALWAYS 1 (dword [ebp-4]) */
  int32_t  seh_state_sound;   /* ALWAYS 2 (byte [ebp-4]) */
  int32_t  root_name_read_off;/* ALWAYS 4 (attr VALUE ptr) */
  int32_t  sounds_find_kind;  /* ALWAYS CHILD (on the DOC) */
  int32_t  root_find_kind;    /* ALWAYS ATTR (on the sounds node) */
  int32_t  sound_find_kind;   /* ALWAYS CHILD (on the sounds node) */
  uint32_t sounds_elem_va;    /* ALWAYS 0xb7b1b4 */
  uint32_t root_elem_va;      /* ALWAYS 0xb66f40 */
  uint32_t sound_elem_va;     /* ALWAYS 0xb7b1ac */
  uint32_t size_bytes;        /* ALWAYS 0x84 (0x92d3ec..0x92d470) */
  int32_t  caller_count;      /* ALWAYS 2 */
} IsaacSfxXmlSoundDispatchPlan;

/* The composed dispatch/error-gate record. find_sounds_result /
   find_root_result / find_sound_result are the three reader-find return
   values (the CHILD find on the doc, the ATTR find on the sounds node,
   the CHILD find on the sounds node). out may be null. */
void isaac_sfx_xml_sound_dispatch_plan(int32_t find_sounds_result,
                                       int32_t find_root_result,
                                       int32_t find_sound_result,
                                       IsaacSfxXmlSoundDispatchPlan* out);

/* Table 0xb1af60 — 245 of 256 bytes are 1; the eleven zeros are NUL,
   TAB, LF, CR, SPACE, '!', '/', '<', '=', '>', '?' (0, 9, 10, 13, 32,
   33, 47, 60, 61, 62, 63). Verified against .rdata of this image. The
   table is 0x100 past the element table 0xb1ae60 and is STRICTER. LOW
   BYTE; the attrs body walks it for the attr-name scan (0x4165ab /
   0x4165d0 / 0x4165e5) and the per-attr continuation gate (0x416753). */
int32_t isaac_sfx_xml_attr_name_char(uint32_t byte);

/* 0x4165ee..0x4165f9 `cmp ecx,esi ; mov eax,0xb1b6c4 ; cmovne eax,edx` —
   the FULL-WORD name-empty slot law: name_len == 0 -> 0xb1b6c4
   ("expected attribute name"), else prev. */
uint32_t isaac_sfx_xml_attr_name_error(uint32_t prev_error,
                                       uint32_t name_len);

/* 0x416678..0x41667b `cmp byte [ecx],0x3d ; cmove eax,[0xc7de4c]` with
   eax = 0xb1b6dc: byte == '=' (LOW BYTE) -> prev, else "expected =". */
uint32_t isaac_sfx_xml_attr_eq_error(uint32_t prev_error, uint32_t byte);

/* 0x4166c5..0x4166cb `cmp al,0x27 ; je ; cmp al,0x22 ; je` — the quote
   dispatch, LOW BYTE, machine order: 0x27 -> SINGLE, 0x22 -> DOUBLE,
   else UNQUOTED (the 0x4166cd..0x4166da arm that pre-stores 0xb1b6e8). */
int32_t isaac_sfx_xml_attr_quote_kind(uint32_t byte);

/* 0x4166f3..0x4166f7 `cmp byte [ecx],cl ; cmove edx,[0xc7de4c]` with
   edx = 0xb1b6e8: end_byte == quote_byte (LOW BYTE) -> prev (the CURRENT
   slot the machine re-reads — 0xb1b6e8 on the unquoted arm, the '=' gate
   value on the quoted arms), else "expected ' or \"". */
uint32_t isaac_sfx_xml_attr_value_error(uint32_t prev_error,
                                        uint32_t quote_byte,
                                        uint32_t end_byte);

/* 0x4166e6 `sub eax,esi` — the attr value length = value_end -
   value_start, 32-bit wrap. */
uint32_t isaac_sfx_xml_attr_value_len(uint32_t value_start,
                                      uint32_t value_end);

/* The seven attr-node store displacements {0x00,0x04,0x08,0x0c,0x10,
   0x14,0x18}: name ptr, value ptr, name len, value len, parent
   (0x41664b), prev (0x416633/0x41663e), next (0x416639/0x41664e/0x416610
   init). Parent link stores at {0x20,0x24} and the sibling next at
   {0x18} are the element-side offsets (v11 constants by reference). */
int32_t isaac_sfx_xml_attr_node_writes_offset(uint32_t off);

typedef struct IsaacSfxXmlAttrPlan {
  int32_t entered;       /* 1 iff the first byte is an attr-name char
                            (the 0x4165ae gate; 0 -> the body returns
                            without storing/touching anything) */
  int32_t name_empty;    /* name_len == 0 (FULL-WORD) */
  uint32_t name_error;   /* slot after the name scan (0xb1b6c4 arm) */
  int32_t quote_kind;    /* SINGLE / DOUBLE / NONE */
  uint32_t eq_error;     /* slot after the '=' gate (0xb1b6dc arm) */
  uint32_t value_error;  /* slot after the quote-close law (0xb1b6e8 arm) */
  uint32_t error_slot;   /* the final [0xc7de4c] value this iteration */
  uint32_t value_len;    /* value_end - value_start (wrap) */
  uint32_t allocator_va; /* ALWAYS 0x00416510 */
  uint32_t node_size;    /* ALWAYS 0x1c */
  int32_t node_stores;   /* 7 when entered, else 0 */
  int32_t host_calls;    /* ALWAYS 2 when entered (alloc + scan) */
  int32_t pure_complete; /* ALWAYS 0 — the 3 E8 stay host */
  uint32_t size_bytes;   /* ALWAYS 0x1d0 */
  int32_t caller_count;  /* ALWAYS 1 (0x416104) */
} IsaacSfxXmlAttrPlan;

/* The per-attr decision record. prev_error is [0xc7de4c] at iteration
   entry; first_byte is the byte under the cursor (the 0x4165ae gate);
   name_len / eq_byte / quote_byte / end_byte / value_start / value_end
   are the HOST-walk recaptures of one attribute. The value-close law's
   "prev" is the CURRENT slot: 0xb1b6e8 on the unquoted arm (stored at
   0x4166d0 BEFORE the scan), the '=' gate value on the quoted arms. */
void isaac_sfx_xml_attr_plan(uint32_t prev_error, uint32_t first_byte,
                             uint32_t name_len, uint32_t eq_byte,
                             uint32_t quote_byte, uint32_t end_byte,
                             uint32_t value_start, uint32_t value_end,
                             IsaacSfxXmlAttrPlan* out);

/* ============ v16: 0x00416770 the children parse ============
   `void __thiscall (this = doc, int32* cursor, node* parent)` —
   139 insns, first_ret 0x41690f, `ret 8`, 3 E8 (0x416040 nested parse,
   0x416e80 text scanner, 0x416510 node allocator), 38 mem-stores,
   **1 direct caller 0x41611a** (nested parse element GT arm). The 3 E8
   and the host-length ws/name skip walks stay host; what is landed here
   is the recursion/continuation decision layer: the top byte gate
   (0x4167a2..a8), the close-tag '/' gate (0x4167ac), the nested-return
   gate (0x4167c6, FULL-WORD), the sibling tail-append arm + +0x28 store
   value (0x4167ca/0x4167d4/0x416841, FULL-WORD children head), the text
   node ctor constants + store offsets (0x416819..65), the wrap text
   length (0x416817), the text-accum law (0x41686c..81: FULL-WORD
   parent->text + LOW-BYTE first char; the 0xc71640 default is NOT a
   string — first byte 0xed — so the default arm never stores), the END
   slot law (0x4167ef, unconditional 0xb1b678), the close "expected >"
   law (0x4168f5..ff — same opcode pair as the v14 tail_error, REUSED),
   and the per-arm cursor continuation. pure_complete stays 0; the three
   VAs and census are pinned. */

enum {
  ISAAC_SFX_XML_CHILDREN_NESTED_VA = 0x00416040u, /* recursion target */
  ISAAC_SFX_XML_CHILDREN_SCANNER_VA = 0x00416e80u, /* text scanner */
  ISAAC_SFX_XML_CHILDREN_ALLOC_VA = 0x00416510u,  /* == POOL_ALLOC_VA */
  ISAAC_SFX_XML_CHILDREN_ERR_END_VA = 0x00b1b678u, /* "unexpected end of data" */
  ISAAC_SFX_XML_CHILDREN_ERR_GT_VA = 0x00b1b6a8u,  /* "expected >" */
  ISAAC_SFX_XML_CHILDREN_ERR_SLOT_VA = 0x00c7de4cu, /* the global error slot */
  ISAAC_SFX_XML_CHILDREN_TEXT_DEFAULT_VA = 0x00c71640u, /* byte[0] == 0xed */
  ISAAC_SFX_XML_CHILDREN_TEXT_TYPE = 2,          /* node +0x14, text arm */
  ISAAC_SFX_XML_CHILDREN_NODE_SIZE = 0x30,       /* allocator request */
  ISAAC_SFX_XML_CHILDREN_TOP_END = 0,            /* NUL under the cursor */
  ISAAC_SFX_XML_CHILDREN_TOP_TAG = 1,            /* '<' */
  ISAAC_SFX_XML_CHILDREN_TOP_TEXT = 2,           /* any other byte */
  ISAAC_SFX_XML_CHILDREN_CLOSE_OPEN_BYTE = 0x2f, /* '/' at cursor+1 */
  ISAAC_SFX_XML_CHILDREN_TEXT_STORE_OFFSETS_COUNT = 9,
  ISAAC_SFX_XML_CHILDREN_SIZE_BYTES = 0x1a2u,    /* 0x416770..0x416912 */
  ISAAC_SFX_XML_CHILDREN_INSNS = 139,
  ISAAC_SFX_XML_CHILDREN_RETS = 1,
  ISAAC_SFX_XML_CHILDREN_E8 = 3, /* 0x416040, 0x416e80, 0x416510 */
  ISAAC_SFX_XML_CHILDREN_STORES = 38,
  ISAAC_SFX_XML_CHILDREN_CALLERS = 1             /* 0x41611a */
};

/* 0x4167a2..0x4167a8 `test al,al ; je 0x4167ef ; cmp al,0x3c ; jne
   0x4167f9` — the top-of-loop byte gate, LOW BYTE (loaded into al):
   0 -> END (the 0xb1b678 slot store), 0x3c -> TAG, else TEXT. */
int32_t isaac_sfx_xml_children_top_gate(uint32_t byte);

/* 0x4167ac `cmp byte [ecx + 1], 0x2f ; je 0x4168af` — the close-tag
   gate on the TAG arm, LOW BYTE: '/' -> the close-tag path (returns,
   parent untouched), else the nested-parse recursion. */
int32_t isaac_sfx_xml_children_close_open(uint32_t byte);

/* 0x4167c6 `test ecx,ecx ; je 0x416780` — the nested-parse RETURN gate,
   FULL-WORD: node == 0 -> continue the loop WITHOUT linking (the "no
   more children" gate); node != 0 -> link. */
int32_t isaac_sfx_xml_children_nested_live(uint32_t node);

/* 0x4167ca / 0x416841 `cmp dword ptr [esi + 0x18], 0 ; je FIRST` — the
   sibling tail-append arm, FULL-WORD on the parent children head:
   children_head == 0 -> FIRST arm ([node+0x28] = 0, [+0x18] = node),
   else append arm (node->prev = parent->last, last->next = node). Both
   the element link and the text link use this same gate. */
int32_t isaac_sfx_xml_children_link_first(uint32_t children_head);

/* 0x4167d7 / 0x416855 — the node+0x28 (prev) store value: the FIRST arm
   stores the constant 0; the append arm stores [esi+0x1c] (parent->last,
   RE-READ at 0x4167da). */
uint32_t isaac_sfx_xml_children_link_prev(uint32_t children_head,
                                          uint32_t last_child);

/* 0x416817 `sub edx, ebx` — text_len = text_end - text_start, 32-bit
   wrap. */
uint32_t isaac_sfx_xml_children_text_len(uint32_t text_start,
                                         uint32_t text_end);

/* 0x41686c..0x416881 `mov ecx,0xc71640 ; mov eax,[esi+4] ; test eax,eax ;
   cmovne ecx,eax ; cmp byte [ecx],0 ; jne skip` — store the text span
   into the parent iff parent->text != 0 (FULL-WORD) AND *parent->text
   == 0 (LOW BYTE). With parent_text == 0 the machine tests byte
   [0xc71640] == 0xed, so the default arm NEVER stores. */
int32_t isaac_sfx_xml_children_text_accum(uint32_t parent_text,
                                          uint32_t first_byte);

/* The TEXT-arm node ctor store displacements: {0x00,0x04,0x0c,0x10,0x14,
   0x18,0x20,0x28,0x2c} (0x416819..0x416865: name 0, parent 0 then link,
   type 2, children/attrs heads, text ptr/len, prev, next). */
int32_t isaac_sfx_xml_children_text_node_writes_offset(uint32_t off);

/* The per-arm cursor continuation (where the loop resumes / the parse
   ends): END and TEXT leave *cursor at the scanner END (0x416e80's
   cursor-write); TAG element stores cursor+1 before the recursion
   (0x4167bd); TAG close stores name_end+1 (0x416904). 32-bit wrap. */
uint32_t isaac_sfx_xml_children_cursor_after(uint32_t top_gate,
                                             uint32_t close_open,
                                             uint32_t tag_pos,
                                             uint32_t text_end,
                                             uint32_t name_end);

typedef struct IsaacSfxXmlChildrenPlan {
  int32_t top_gate;        /* END 0 / TAG 1 / TEXT 2 (0x4167a2..a8) */
  uint32_t end_error;      /* END: ALWAYS 0xb1b678 (0x4167ef unconditional
                              store); else prev_error (slot untouched) */
  int32_t close_open;      /* '/' at cursor+1 (computed on TAG only) */
  int32_t nested_recurses; /* TAG && !close_open -> the 0x416040 call */
  int32_t nested_live;     /* element: nested node != 0 (FULL-WORD); on
                              TEXT/END ALWAYS 1 (the node was allocated) */
  int32_t link_needed;     /* TEXT/END: 1; element: nested_live */
  int32_t link_first;      /* link arms: children_head == 0 (FULL-WORD) */
  uint32_t link_prev;      /* link arms: 0 (FIRST) or last_child (append) */
  uint32_t text_len;       /* TEXT/END: end - start (wrap); else 0 */
  uint32_t text_type;      /* TEXT/END: ALWAYS 2 (node +0x14) */
  int32_t text_accum;      /* TEXT/END: the accum law (0x41686c..81) */
  int32_t cursor_undo;     /* TEXT/END: 1 (*cursor restored to ebx at
                              0x4167fb); TAG: 0 */
  uint32_t close_error;    /* TAG-close: '>' (0x3e) -> prev else 0xb1b6a8;
                              other arms: prev (slot untouched) */
  uint32_t cursor_after;   /* the per-arm continuation position */
  uint32_t nested_va;      /* ALWAYS 0x00416040 */
  uint32_t scanner_va;     /* ALWAYS 0x00416e80 */
  uint32_t allocator_va;   /* ALWAYS 0x00416510 */
  int32_t host_calls;      /* TEXT/END 2 (scanner + alloc), element 1
                              (nested), close 0 */
  int32_t pure_complete;   /* ALWAYS 0 — the 3 E8 stay host */
  uint32_t size_bytes;     /* ALWAYS 0x1a2 */
  int32_t insns;           /* ALWAYS 139 */
  int32_t stores;          /* ALWAYS 38 */
  int32_t caller_count;    /* ALWAYS 1 (0x41611a) */
} IsaacSfxXmlChildrenPlan;

/* The per-iteration children decision record. top_byte is the byte under
   the ws-skipped cursor (the 0x4167a0 load); close_byte is cursor+1
   (TAG arm); tag_pos is the '<' position; nested_node is the 0x416040
   return (element arm); children_head / last_child are [parent+0x18] /
   [parent+0x1c] at link time; text_start / text_end bound the scanner
   span (TEXT/END arms); parent_text is [parent+4] and text_first_byte
   its first byte (the accum law); name_end is the close-tag post-walk
   position and close_tail_byte the byte there (the '>' test); prev_error
   is [0xc7de4c] at iteration entry. out may be null. */
void isaac_sfx_xml_children_plan(uint32_t top_byte, uint32_t close_byte,
                                 uint32_t tag_pos, uint32_t nested_node,
                                 uint32_t children_head,
                                 uint32_t last_child, uint32_t text_start,
                                 uint32_t text_end, uint32_t parent_text,
                                 uint32_t text_first_byte,
                                 uint32_t name_end,
                                 uint32_t close_tail_byte,
                                 uint32_t prev_error,
                                 IsaacSfxXmlChildrenPlan* out);

/* ============ v17: 0x00416e80 the text scanner ============
   `char* __fastcall (this = int32* cursor)` — the leaf decode the
   children TEXT/END arms call (0x4167fd). 146 insns, first_ret
   0x41705b, plain `ret`, 1 E8 (0x416dc0 — the utf8-append helper,
   HOST), 11 mem-stores, **1 direct caller 0x4167fd** (the children
   TEXT arm; END falls into TEXT). The entry skip-until-special walk
   (table 0xb1a760, zeros {0,'&','<'}), the decode walk, the digit walk
   and the utf8 helper stay host; what is landed here is EVERY decision:
   the entry-skip per-byte gate, the text-continue per-byte gate (table
   0xb1aa60, zeros {0,'<'}), the hex/digit nibble (table 0xb1ad60),
   the entity dispatch (int8 range window + case table 0x417074), the
   five named-entity full-match laws (packed skip/emit, literal-'&' on
   any mismatch, the amp/apos COMMIT), the numeric value fold (hex
   <<4 / decimal *10, 32-bit wrap), the ';' error law (0xb1b6f8 =
   "expected ;" on a missing semicolon), and the two position laws:
   *cursor (READ pos) vs eax (OUT pos) — they differ exactly when an
   entity shrinks the text. pure_complete stays 0; the VAs and census
   are pinned. The numeric digit gate uses the HEX table on the decimal
   path too, so hex letters fold in with *10. */

enum {
  ISAAC_SFX_XML_SCAN_HELPER_VA = 0x00416dc0u, /* utf8-append, HOST */
  ISAAC_SFX_XML_SCAN_SKIP_TABLE_VA = 0x00b1a760u, /* zeros {0,'&','<'} */
  ISAAC_SFX_XML_SCAN_TEXT_TABLE_VA = 0x00b1aa60u, /* zeros {0,'<'} */
  ISAAC_SFX_XML_SCAN_HEX_TABLE_VA = 0x00b1ad60u,  /* 0..15 / 0xff */
  ISAAC_SFX_XML_SCAN_JUMP_TABLE_VA = 0x0041705cu, /* 6 ptrs after ret */
  ISAAC_SFX_XML_SCAN_DISPATCH_TABLE_VA = 0x00417074u, /* 79 idx bytes */
  ISAAC_SFX_XML_SCAN_ERR_SEMI_VA = 0x00b1b6f8u, /* "expected ;" */
  ISAAC_SFX_XML_SCAN_DISPATCH_RANGE_LO = 0x23u, /* '#' */
  ISAAC_SFX_XML_SCAN_DISPATCH_RANGE_HI = 0x4eu, /* 'q' - 0x23 */
  ISAAC_SFX_XML_SCAN_AMP_BYTE = 0x26u,          /* '&' entity introducer */
  ISAAC_SFX_XML_SCAN_SEMI_BYTE = 0x3bu,         /* ';' terminator */
  ISAAC_SFX_XML_SCAN_HEX_X_BYTE = 0x78u,        /* 'x' hex prefix */
  ISAAC_SFX_XML_SCAN_CASE_NUM = 0,   /* '#' numeric char ref */
  ISAAC_SFX_XML_SCAN_CASE_AMP = 1,   /* 'a' -> &amp; / &apos; */
  ISAAC_SFX_XML_SCAN_CASE_GT = 2,    /* 'g' -> &gt; */
  ISAAC_SFX_XML_SCAN_CASE_LT = 3,    /* 'l' -> &lt; */
  ISAAC_SFX_XML_SCAN_CASE_QUOT = 4,  /* 'q' -> &quot; */
  ISAAC_SFX_XML_SCAN_CASE_NONE = 5,  /* default: literal '&' */
  ISAAC_SFX_XML_SCAN_AMP_EMIT = 0x26u,   /* "&amp;" -> '&' */
  ISAAC_SFX_XML_SCAN_APOS_EMIT = 0x27u,  /* "&apos;" -> '\'' */
  ISAAC_SFX_XML_SCAN_QUOT_EMIT = 0x22u,  /* "&quot;" -> '"' */
  ISAAC_SFX_XML_SCAN_GT_EMIT = 0x3eu,    /* "&gt;" -> '>' */
  ISAAC_SFX_XML_SCAN_LT_EMIT = 0x3cu,    /* "&lt;" -> '<' */
  ISAAC_SFX_XML_SCAN_AMP_SKIP = 5,       /* "&amp;" source len */
  ISAAC_SFX_XML_SCAN_APOS_SKIP = 6,      /* "&apos;" source len */
  ISAAC_SFX_XML_SCAN_QUOT_SKIP = 6,      /* "&quot;" source len */
  ISAAC_SFX_XML_SCAN_GT_SKIP = 4,        /* "&gt;" source len */
  ISAAC_SFX_XML_SCAN_LT_SKIP = 4,        /* "&lt;" source len */
  ISAAC_SFX_XML_SCAN_SIZE_BYTES = 0xdbu, /* 0x416e80..0x41705b */
  ISAAC_SFX_XML_SCAN_INSNS = 146,
  ISAAC_SFX_XML_SCAN_RETS = 1,
  ISAAC_SFX_XML_SCAN_E8 = 1, /* 0x416dc0 only */
  ISAAC_SFX_XML_SCAN_STORES = 11,
  ISAAC_SFX_XML_SCAN_CALLERS = 1           /* 0x4167fd (TEXT/END arm) */
};

/* 0x416e8b..0x416eac `movzx eax, byte[esi] ; cmp byte[eax+0xb1a760],0 ;
   je done ; loop: movzx eax, byte[esi+1] ; inc esi ; cmp
   byte[eax+0xb1a760],0 ; jne loop` — the ENTRY skip-until-special gate,
   LOW BYTE: 1 while the byte is plain text (the walk advances), 0 at
   the specials {NUL, '&', '<'} (the walk stops). */
int32_t isaac_sfx_xml_scan_skip_char(uint32_t byte);

/* 0x416eba / 0x417044 `cmp byte[eax+0xb1aa60],0` — the TEXT-continue
   gate, LOW BYTE: 1 for text bytes INCLUDING '&' and '>', 0 at {NUL,
   '<'} (the scan's end-of-text boundary; the first gate at 0x416eba
   and the loop-bottom gate at 0x417044 use the same table). */
int32_t isaac_sfx_xml_scan_text_char(uint32_t byte);

/* 0x416fcc / 0x416ff4 `mov al, byte[eax+0xb1ad60] ; cmp al,0xff ; je` —
   the digit nibble, LOW BYTE: '0'..'9' -> 0..9, 'A'..'F'/'a'..'f' ->
   10..15, else 0xff (0xff = "not a digit"). The SAME table gates both
   the hex and the decimal numeric paths. */
uint32_t isaac_sfx_xml_scan_hex_nibble(uint32_t byte);

/* 0x416ed0..0x416ee7 `movsx eax, byte[esi+1] ; add eax,-0x23 ; cmp
   eax,0x4e ; ja default ; movzx eax, byte[eax+0x417074] ; jmp
   [eax*4+0x41705c]` — the entity dispatch, computed from the byte
   AFTER the '&' (SIGN-extended, unsigned range window 0x23..0x71,
   case table 0x417074): '#' -> CASE_NUM, 'a' -> CASE_AMP, 'g' ->
   CASE_GT, 'l' -> CASE_LT, 'q' -> CASE_QUOT, anything else (in or out
   of the window) -> CASE_NONE (the literal-'&' arm). */
int32_t isaac_sfx_xml_scan_entity_case(uint32_t byte);

/* 0x416eee..0x416f76 — the named-entity full-match laws, packed as
   (skip << 8) | emit, 0 = NO match (the literal '&' arm 0x417036):
   CASE_AMP: "amp;" (b2 'm' b3 'p' b4 ';') -> 0x526; elif "apos;" (b2
   'p' b3 'o' b4 's' b5 ';') -> 0x627 — the machine COMMITS to 'm'
   first (an "am"-prefix failure never retries "apos;");
   CASE_GT: "gt;"  (b2 't' b3 ';') -> 0x43e;
   CASE_LT: "lt;"  (b2 't' b3 ';') -> 0x43c;
   CASE_QUOT: "quot;" (b2 'u' b3 'o' b4 't' b5 ';') -> 0x622;
   all others 0. All LOW BYTE compares. */
uint32_t isaac_sfx_xml_scan_named_entity(uint32_t case_id, uint32_t b2,
                                         uint32_t b3, uint32_t b4,
                                         uint32_t b5);

/* 0x416fda / 0x417007 — the per-digit numeric fold, 32-bit wrap: hex
   `shl edx,4 ; add edx,eax` -> (value<<4) + nibble; decimal `lea
   ecx,[edx+edx*4] ; lea edx,[eax+ecx*2]` -> value*10 + nibble. */
uint32_t isaac_sfx_xml_scan_num_value(uint32_t value, uint32_t nibble,
                                      uint32_t is_hex);

/* 0x41701f..0x417034 `cmp byte[esi],0x3b ; jne err ; inc esi ;
   ... mov [0xc7de4c],0xb1b6f8` — the numeric ';' law, LOW BYTE: ';' ->
   prev_error (the slot STAYS, esi advances past ';'); else ->
   0xb1b6f8 ("expected ;", UNCONDITIONAL store, esi NOT advanced). */
uint32_t isaac_sfx_xml_scan_num_error(uint32_t prev_error, uint32_t byte);

/* 0x417051 `mov [edi], esi` — the scanner's *cursor write = the READ
   position at exit = start + skip_len + consumed, 32-bit wrap (the
   boundary byte the children gate on: NUL or '<'). */
uint32_t isaac_sfx_xml_scan_cursor_after(uint32_t start,
                                         uint32_t skip_len,
                                         uint32_t consumed);

/* 0x417053 `mov eax, edx` — the scanner's RETURN = the OUT position at
   exit = start + skip_len + written, 32-bit wrap (the children TEXT
   arm's text_len end; differs from the cursor when entities shrink). */
uint32_t isaac_sfx_xml_scan_end_pos(uint32_t start, uint32_t skip_len,
                                    uint32_t written);

/* ============ v18: 0x00416dc0 the utf8-append helper + attrs leaves ============
 * ABI 18 transcribes the SINGLE host edge shared by all three entity
 * scanners: `void __fastcall utf8_append(int32* out, uint32 value)`
 * (ecx = &outpos, edx = value; 0x416dc0..0x416e69, 70 insns, 5 rets, no
 * E8, 15 mem-stores, **3 callers** 0x41701a / 0x416d0a / 0x416aba). It
 * writes the UTF-8 encoding of value through *out and advances *out by
 * the encoding length; value >= 0x110000 writes NOTHING and stores the
 * error constant 0xb1b704 ("invalid numeric character entity") into the
 * global error slot [0xc7de4c] UNCONDITIONALLY (no prev recapture —
 * mirrors the v17 ';' law). All four length compares UNSIGNED (jae).
 * The byte laws preserve the exact x86 semantics: continuation bytes
 * 0x80|(x&0x3f); lead bytes 0xc0|(lo(v>>6)) / 0xe0|(lo(v>>12)) /
 * 0xf0|(lo(v>>18)) where lo() = &0xff of the FULL dword shift.
 *
 * Also CENSUS'd the two attrs leaf scanners 0x416b70 / 0x416920 (from
 * v15's host list): each is the SAME scanner shape as 0x416e80 (146
 * insns, 1 ret, 1 E8 -> 0x416dc0, 11 stores, 1 caller inside 0x4165a0)
 * with its OWN gate tables — 0x416b70 (caller 0x4166de): entry 0xb1a860
 * zeros {0,'"','&'}, text 0xb1ab60 zeros {0,'"'}; 0x416920 (caller
 * 0x41671e): entry 0xb1a960 zeros {0,'&','\''}, text 0xb1ac60 zeros
 * {0,'\''}. Verified byte-identical dispatch/jump/hex/semi tables
 * across all three scanners, so the v17 scan laws transfer; the FOUR
 * gate tables are the only new per-byte truth, landed here. */

enum {
  ISAAC_SFX_XML_UTF8_VA = 0x00416dc0u, /* the utf8-append helper */
  ISAAC_SFX_XML_UTF8_SIZE_BYTES = 0xaau, /* 0x416dc0..0x416e69 */
  ISAAC_SFX_XML_UTF8_INSNS = 70,
  ISAAC_SFX_XML_UTF8_RETS = 5,
  ISAAC_SFX_XML_UTF8_E8 = 0,
  ISAAC_SFX_XML_UTF8_STORES = 15,
  ISAAC_SFX_XML_UTF8_CALLERS = 3, /* 0x41701a, 0x416d0a, 0x416aba */
  ISAAC_SFX_XML_UTF8_L1 = 0x80u,       /* value < 0x80 -> 1 byte */
  ISAAC_SFX_XML_UTF8_L2 = 0x800u,      /* value < 0x800 -> 2 bytes */
  ISAAC_SFX_XML_UTF8_L3 = 0x10000u,    /* value < 0x10000 -> 3 bytes */
  ISAAC_SFX_XML_UTF8_MAX = 0x110000u,  /* value < 0x110000 -> 4 bytes */
  ISAAC_SFX_XML_UTF8_CONT = 0x80u,     /* continuation prefix */
  ISAAC_SFX_XML_UTF8_CONT_MASK = 0x3fu,/* continuation payload mask */
  ISAAC_SFX_XML_UTF8_LEAD_L2 = 0xc0u,  /* 2-byte lead prefix */
  ISAAC_SFX_XML_UTF8_LEAD_L3 = 0xe0u,  /* 3-byte lead prefix */
  ISAAC_SFX_XML_UTF8_LEAD_L4 = 0xf0u,  /* 4-byte lead prefix */
  ISAAC_SFX_XML_UTF8_ERR_VA = 0x00b1b704u, /* "invalid numeric character
                                               entity" */
  ISAAC_SFX_XML_UTF8_ERR_SLOT_VA = 0x00c7de4cu, /* the global error slot */
  ISAAC_SFX_XML_UTF8_NO_BYTE = 0x100u, /* out-of-range index sentinel */

  ISAAC_SFX_XML_ATTR_DQUOTE_VA = 0x00416b70u,   /* dquote attrs scanner */
  ISAAC_SFX_XML_ATTR_SQUOTE_VA = 0x00416920u,   /* squote attrs scanner */
  ISAAC_SFX_XML_ATTR_DQUOTE_SIZE_BYTES = 0x1dcu, /* 0x416b70..0x416d4b */
  ISAAC_SFX_XML_ATTR_SQUOTE_SIZE_BYTES = 0x1dcu, /* 0x416920..0x416afb */
  ISAAC_SFX_XML_ATTR_DQUOTE_INSNS = 146,
  ISAAC_SFX_XML_ATTR_SQUOTE_INSNS = 146,
  ISAAC_SFX_XML_ATTR_DQUOTE_RETS = 1,
  ISAAC_SFX_XML_ATTR_SQUOTE_RETS = 1,
  ISAAC_SFX_XML_ATTR_DQUOTE_E8 = 1, /* 0x416dc0 only */
  ISAAC_SFX_XML_ATTR_SQUOTE_E8 = 1, /* 0x416dc0 only */
  ISAAC_SFX_XML_ATTR_DQUOTE_STORES = 11,
  ISAAC_SFX_XML_ATTR_SQUOTE_STORES = 11,
  ISAAC_SFX_XML_ATTR_DQUOTE_CALLERS = 1, /* 0x4166de (inside 0x4165a0) */
  ISAAC_SFX_XML_ATTR_SQUOTE_CALLERS = 1, /* 0x41671e (inside 0x4165a0) */
  ISAAC_SFX_XML_ATTR_DQUOTE_SKIP_TABLE_VA = 0x00b1a860u, /* 0 {0,'"','&'} */
  ISAAC_SFX_XML_ATTR_SQUOTE_SKIP_TABLE_VA = 0x00b1a960u, /* 0 {0,'&','\''} */
  ISAAC_SFX_XML_ATTR_DQUOTE_TEXT_TABLE_VA = 0x00b1ab60u, /* 0 {0,'"'} */
  ISAAC_SFX_XML_ATTR_SQUOTE_TEXT_TABLE_VA = 0x00b1ac60u, /* 0 {0,'\''} */
  ISAAC_SFX_XML_ATTR_DQUOTE_DISPATCH_VA = 0x00416d64u,
  ISAAC_SFX_XML_ATTR_SQUOTE_DISPATCH_VA = 0x00416b14u,
  ISAAC_SFX_XML_ATTR_DQUOTE_JUMP_VA = 0x00416d4cu,
  ISAAC_SFX_XML_ATTR_SQUOTE_JUMP_VA = 0x00416afcu
};

/* 0x416dc3..0x416e2a — the utf8 length ladder, ALL UNSIGNED (jae):
   value < 0x80 -> 1, < 0x800 -> 2, < 0x10000 -> 3, < 0x110000 -> 4,
   >= 0x110000 -> 0 (the error path writes NO bytes and does NOT advance
   *out). */
uint32_t isaac_sfx_xml_utf8_len(uint32_t value);

/* 0x416dcb..0x416e5a — the per-index encoding byte of `value` (index
   0..3). Continuation: 0x80 | (x & 0x3f) where x is v after k shr-6
   steps; lead: 0xc0/0xe0/0xf0 | ((v >> 6/12/18) & 0xff). Index >= the
   length (or the error arm) -> ISAAC_SFX_XML_UTF8_NO_BYTE (the machine
   does not write there). */
uint32_t isaac_sfx_xml_utf8_byte(uint32_t value, uint32_t index);

/* 0x416e5e `mov [0xc7de4c], 0xb1b704` — the error-slot law: value <
   0x110000 -> prev_error (slot untouched); else UNCONDITIONALLY
   0xb1b704 ("invalid numeric character entity"). */
uint32_t isaac_sfx_xml_utf8_error(uint32_t prev_error, uint32_t value);

/* 0x416b7b / 0x416b95 `cmp byte[eax+0xb1a860],0` — the dquote attrs
   value ENTRY skip-until-special gate, LOW BYTE: 1 for plain value
   bytes, 0 at {NUL, '"', '&'} (the walk stops). */
int32_t isaac_sfx_xml_attr_dquote_skip_char(uint32_t byte);

/* 0x416baa / 0x416d34 `cmp byte[eax+0xb1ab60],0` — the dquote attrs
   value TEXT-continue gate, LOW BYTE: 1 for value bytes INCLUDING '&',
   0 at {NUL, '"'} (the end-of-value boundary). */
int32_t isaac_sfx_xml_attr_dquote_text_char(uint32_t byte);

/* 0x41692e / 0x416945 `cmp byte[eax+0xb1a960],0` — the squote attrs
   value ENTRY skip-until-special gate, LOW BYTE: 1 for plain value
   bytes, 0 at {NUL, '&', '\''} (the walk stops). */
int32_t isaac_sfx_xml_attr_squote_skip_char(uint32_t byte);

/* 0x41695a / 0x416ae4 `cmp byte[eax+0xb1ac60],0` — the squote attrs
   value TEXT-continue gate, LOW BYTE: 1 for value bytes INCLUDING '&',
   0 at {NUL, '\''} (the end-of-value boundary). */
int32_t isaac_sfx_xml_attr_squote_text_char(uint32_t byte);

/* ============ v19: 0x004165a0 the attrs parse-loop DECISION LAYER ============
 * ABI 19 lands the decisions BETWEEN the v15 per-attr laws: the parse
 * loop structure of the whole attrs body (152 insns, `ret 8`, 3 E8:
 * allocator 0x416510, dquote scanner 0x416b70, squote scanner
 * 0x416920). v15 landed each scalar law; v19 lands WHEN the cursor
 * advances (the +1 arithmetic between the host walks), HOW the fresh
 * attr node links into the parent's attrs list, the NUL-in-place
 * addresses, the once-per-loop error-slot capture, and the per-attr
 * continuation gate.
 *
 * The body's error-slot arithmetic (the "error gating" law): `mov
 * edx,[0xc7de4c]` runs ONCE at 0x4165bb, BEFORE the loop. The name-
 * empty `cmovne eax,edx` at 0x4165f9 therefore reads that SAME entry
 * slot on EVERY iteration — the slot NEVER accumulates. The '=' gate
 * (0x41667b `cmove eax,[0xc7de4c]`) and the value-close gate
 * (0x4166f7 `cmove edx,[0xc7de4c]`) re-read the CURRENT slot (the
 * just-stored name value / the pre-stored 0xb1b6e8 on the unquoted
 * arm), so the only slot input to the whole loop is the entry slot.
 *
 * The cursor-advance laws (the ws skips and the name/value walks are
 * host-length walks; their ENDS are recaptures feeding the pure +1s):
 *   0x416687..0x41668a  *cursor = ws1_end + 1        (past '=')
 *   0x4166cd/0x416713   value_start = ws2_end + 1    (BOTH arms)
 *   0x4166fe..0x4166ff  *cursor = value_end + 1
 * The link-append (0x416627..0x41664e): FULL-WORD test on the parent
 * attrs head [parent+0x20]; append arm writes node->prev = tail (re-
 * read at 0x416630 AND 0x416636) and [tail+0x18] = node; first arm
 * writes node->prev = 0 and [parent+0x20] = node; ALWAYS
 * [parent+0x24] = node, [node+0x10] = parent, [node+0x18] = 0.
 * The NUL-in-place (0x41668c..0x41669e name, 0x416701..0x41672c
 * value): FULL-WORD ptr test, addr = ptr != 0 ? ptr + len : 0xc71640
 * (fallback offset 0), byte 0 stored. The continuation gate
 * (0x416753..0x41675d): LOW-BYTE table 0xb1af60 on the byte after the
 * trailing ws — a name char resumes the loop at 0x4165c8.
 *
 * The clean-scan modeling bound is inherited from v15: the value-close
 * "prev" is the CLEAN-scan current slot (0xb1b6e8 unquoted pre-store /
 * '=' gate value quoted). A scanner-latched error (0xb1b704 / 0xb1b6f8
 * from the v17/v18 laws) inside the value is modelled by those laws,
 * not re-chained through the attr plan. */

enum {
  /* OFFSET pins shared by reference with the v5 attr-walk block (NOT
     re-declared): name 0x00 / value 0x04 / next 0x18. */
  ISAAC_SFX_XML_ATTR_OFF_NAME_LEN_08 = 0x08, /* node name len */
  ISAAC_SFX_XML_ATTR_OFF_VALUE_LEN_0C = 0x0c,/* node value len */
  ISAAC_SFX_XML_ATTR_OFF_PARENT_10 = 0x10,   /* node parent ptr */
  ISAAC_SFX_XML_ATTR_OFF_PREV_14 = 0x14,     /* node prev attr */
  ISAAC_SFX_XML_ATTR_PARENT_OFF_HEAD_20 = 0x20, /* parent attrs head */
  ISAAC_SFX_XML_ATTR_PARENT_OFF_TAIL_24 = 0x24, /* parent attrs tail */
  ISAAC_SFX_XML_ATTR_NUL_DEFAULT_VA = 0x00c71640u, /* byte[0] == 0xed,
                                                     written 0 on the
                                                     fallback arm */
};

/* 0x416687..0x41668a `lea eax,[ecx+1] ; mov [ebx],eax` — the cursor
   AFTER the '=' gate = ws1_end + 1, 32-bit wrap. */
uint32_t isaac_sfx_xml_attr_cursor_after_eq(uint32_t ws1_end);

/* 0x4166cd `lea esi,[ecx+1]` (unquoted) / 0x416713 (quoted) — the value
   START = ws2_end + 1, 32-bit wrap, BOTH arms. */
uint32_t isaac_sfx_xml_attr_value_start(uint32_t ws2_end);

/* 0x4166fe..0x4166ff `inc eax ; mov [ebx],eax` with eax = the post-scan
   *cursor re-read at 0x4166f3 — the cursor AFTER the value span =
   value_end + 1, 32-bit wrap. */
uint32_t isaac_sfx_xml_attr_cursor_after_value(uint32_t value_end);

/* 0x41662a `cmp dword ptr [ecx+0x20], 0 ; je first` — the attrs list
   append gate, FULL-WORD on the parent attrs head: head == 0 -> the
   fresh node is the list head, else it appends after the tail. */
int32_t isaac_sfx_xml_attr_link_first(uint32_t parent_head);

/* 0x416630 / 0x41663e — the node+0x14 (prev) store value: head == 0 ->
   the constant 0; else [parent+0x24] (the tail, RE-READ at 0x416630 and
   0x416636). */
uint32_t isaac_sfx_xml_attr_link_prev(uint32_t parent_head,
                                      uint32_t parent_tail);

/* 0x416639 `mov [eax+0x18], edi` / 0x41664e `mov [edi+0x18], 0` — the
   previous-tail's next store: head == 0 -> 0 (no tail exists, node->next
   is zeroed instead); else node (the append-wire). */
uint32_t isaac_sfx_xml_attr_link_tail_next(uint32_t parent_head,
                                           uint32_t node);

/* 0x416645 `mov [ecx+0x20], edi` — the parent attrs HEAD store value:
   head == 0 -> node (the first arm writes the head); else the head is
   left untouched (no store on the append arm). */
uint32_t isaac_sfx_xml_attr_link_new_head(uint32_t parent_head,
                                          uint32_t node);

/* 0x41668c..0x41669e (name) / 0x416701..0x41672c (value) — the NUL-in-
   place ADDRESS law, FULL-WORD ptr test with the 0xc71640 fallback:
   ptr != 0 -> ptr + len (wrap), else 0xc71640 + 0 (the machine xors
   the offset on the fallback arm). Byte 0 is stored at the result. */
uint32_t isaac_sfx_xml_attr_nul_addr(uint32_t ptr, uint32_t len);

typedef struct IsaacSfxXmlAttrsIterPlan {
  int32_t entered;          /* name_table[first_byte] != 0 (LOW BYTE) */
  int32_t name_empty;       /* name_len == 0 (FULL-WORD) */
  uint32_t name_error;      /* empty ? 0xb1b6c4 : ENTRY slot (0x4165f9
                               reads the once-captured edx, STALE across
                               iterations) */
  int32_t quote_kind;       /* SINGLE / DOUBLE / NONE */
  uint32_t eq_error;        /* '=' ? name_error : 0xb1b6dc (the cmove
                               re-reads the slot just stored) */
  uint32_t value_error;     /* close ? CURRENT slot : 0xb1b6e8 (CURRENT =
                               0xb1b6e8 pre-store unquoted / eq_error
                               quoted; clean-scan bound) */
  uint32_t error_slot;      /* = value_error (the 4th slot write) */
  uint32_t value_len;       /* value_end - value_start (wrap) */
  uint32_t cursor_after_eq; /* ws1_end + 1 */
  uint32_t value_start_pos; /* ws2_end + 1 (BOTH arms) */
  uint32_t cursor_after_value; /* value_end + 1 */
  int32_t link_first;       /* parent attrs head == 0 (FULL-WORD) */
  uint32_t node_prev;       /* first ? 0 : parent_tail ([node+0x14]) */
  uint32_t tail_next;       /* first ? 0 : node ([tail+0x18] store) */
  uint32_t new_head;        /* first ? node : parent_head (head store) */
  uint32_t name_nul_addr;   /* name ptr != 0 ? name+name_len : 0xc71640 */
  uint32_t value_nul_addr;  /* value ptr != 0 ? value+value_len : 0xc71640 */
  uint32_t parent_off_head; /* ALWAYS 0x20 */
  uint32_t parent_off_tail; /* ALWAYS 0x24 */
  uint32_t node_off_parent; /* ALWAYS 0x10 */
  uint32_t node_off_prev;   /* ALWAYS 0x14 */
  uint32_t node_off_next;   /* ALWAYS 0x18 */
  uint32_t nul_default_va;  /* ALWAYS 0x00c71640 */
  int32_t iterate;          /* name_table[cont_byte] != 0 (LOW BYTE) —
                               the 0x41675d loop back-edge gate */
  uint32_t node_size;       /* ALWAYS 0x1c (the allocator request) */
  int32_t node_stores;      /* 7 when entered, else 0 */
  int32_t host_calls;       /* 2 when entered (alloc + value scan),
                               else 0 */
  int32_t pure_complete;    /* ALWAYS 0 — the 3 E8 stay host */
  uint32_t size_bytes;      /* ALWAYS 0x1d0 */
  int32_t caller_count;     /* ALWAYS 1 (0x416104) */
} IsaacSfxXmlAttrsIterPlan;

/* The per-iteration attrs decision record. entry_slot is [0xc7de4c]
   BEFORE the loop (the 0x4165bb capture — every iteration's name gate
   re-uses it, the slot never accumulates); first_byte is the byte under
   the cursor at iteration start; name_start/name_end bound the name walk
   (0x4165cb..0x4165f0); ws1_end/ws2_end are the two ws walk ENDS (the
   walks are host) and eq_byte is byte[ws1_end] (the '=' gate);
   quote_byte is byte[ws2_end]; value_start/value_end bound the scanned
   value span; end_byte is byte[value_end] (the value-close law — on the
   machine this is *cursor AFTER the scan, re-read at 0x4166f3);
   parent_head/parent_tail are [parent+0x20]/[parent+0x24] at link time;
   node is the allocator result (host); name_ptr/value_ptr are the
   node's stored name/value pointers at the NUL writes; cont_byte is
   byte[ws3_end] (the continuation gate). out may be null. */
void isaac_sfx_xml_attrs_iter_plan(
    uint32_t entry_slot, uint32_t first_byte, uint32_t name_start,
    uint32_t name_end, uint32_t ws1_end, uint32_t eq_byte,
    uint32_t ws2_end, uint32_t quote_byte, uint32_t value_start,
    uint32_t value_end, uint32_t end_byte, uint32_t parent_head,
    uint32_t parent_tail, uint32_t node, uint32_t name_ptr,
    uint32_t value_ptr, uint32_t cont_byte,
    IsaacSfxXmlAttrsIterPlan* out);

/* ---------- v25f: 0xa178d0 file-open POST-GATE decisions + 0x92d140
   arg-prep (wave-16; NO ABI bump — coordinator merges). v24 laws 19/20
   covered the path NULL/empty gates (0xa178f9/0xa17901) and the result
   flag (0xa1792a); v9 covered the 0x92d1af call-site result gate. These
   are the REMAINING decision islands of the open body: the attempt-#2
   retry gate (0xa1792a), the arg2 OUT-store gate (0xa1793d/0xa17951),
   the esi ALLOC-arm gate (0xa17941/0xa17955), the SEH guard select
   (0xa17945 vs 0xa17959) and the call-site arg prep pins (0x92d190
   this=0xc37a10, 0x92d195 arg2=0). ALL gates FULL-WORD. */

enum {
  ISAAC_SFX_OPEN_CALL_THIS_C37A10 = 0xc37a10u, /* 0x92d190 this for open */
  ISAAC_SFX_OPEN_CALL_ARG2 = 0,   /* 0x92d195 push 0 — NULL out-ptr */
  ISAAC_SFX_OPEN_GUARD_NONE = 0xffffffffu, /* initial SEH state, no write */
  ISAAC_SFX_OPEN_GUARD_RETRY = 0, /* 0xa17959 writes eax==arg2==0 */
  ISAAC_SFX_OPEN_GUARD_SKIP = 1   /* 0xa17945 writes literal 1 */
};

/* 0xa1792a `cmp [ebp+8],0 ; jne 0xa1794e` — FULL-WORD: attempt #2 runs
   iff the result slot == 0. Complement of the v24 flag gate. */
int32_t isaac_sfx_file_open_retry_gate(uint32_t result1);

/* 0xa1793d/0xa17951 `test arg2 ; jne` — FULL-WORD: arg2 != 0 stores the
   handle (*arg2 = esi). */
int32_t isaac_sfx_file_open_out_gate(uint32_t arg2);

/* 0xa17941/0xa17955 `test esi ; je` — FULL-WORD: the guard write + the
   0xa648b0 alloc arm are reached iff the handle is non-zero. */
int32_t isaac_sfx_file_open_alloc_gate(uint32_t handle);

/* Guard value: NONE (no write) / RETRY=0 / SKIP=1. */
uint32_t isaac_sfx_file_open_guard_select(uint32_t result1, uint32_t arg2,
                                          uint32_t handle);

/* Call-site prep: 0x92d195 push 0 (out-ptr) / 0x92d190 this=0xc37a10. */
int32_t isaac_sfx_open_call_arg2(void);
int32_t isaac_sfx_open_call_this(void);

/* ---------- v25a: 0x92d93a..0x92d984 "path" dispatch arm caller-side
   (wave-16; NO ABI bump — coordinator merges). The "path" attr arm of
   the per-sample slot walk: the concat TOTAL gate 0x92d963 (`cmp eax,
   ecx ; jb 0x92dbca` — UNSIGNED, strict jb, wrap limit 0x7fffffff -
   root_len, length_error 0x40ccc0), the cmovae root-buffer select
   0x92d96b (`cmp cap,0x10 ; lea eax,SSO ; cmovae eax,[heap]` — UNSIGNED,
   boundary 0x10 picks the heap), and the concat-call flag (0x92d984
   0x421680 + 0x92d989 or-flag). Values FULL-WORD. */

enum {
  ISAAC_SFX_SAMPLE_PATH_SSO_LIMIT = 0x10 /* cmovae boundary: cap>=0x10
                                            selects the heap buffer */
};

/* The path-arm caller decision record. value_len is the scan length
   (0x92d947..0x92d957, bounded by value_max), limit the wrap difference
   0x7fffffff-root_len (0x92d961), overflow the UNSIGNED jb gate
   (0x92d963 -> throw), root_buf the cmovae select (0x92d96b..0x92d973),
   concat_called whether 0x421680 runs (0x92d984, false when throwing),
   throw_va the 0x40ccc0 length_error target when overflow. */
typedef struct IsaacSfxSamplePathPlan {
  int32_t value_len;
  uint32_t limit;
  int32_t overflow;
  uint32_t root_buf;
  int32_t concat_called;
  uint32_t throw_va;
  int32_t host_calls;     /* ALWAYS 1 (concat OR throw) */
  int32_t pure_complete;  /* ALWAYS 0 — 0x421680/0x40ccc0 stay host */
} IsaacSfxSamplePathPlan;

/* 0x92d961 sub eax,esi — 0x7fffffff - root_len, 32-bit wrap. */
uint32_t isaac_sfx_sample_path_limit(uint32_t root_len);

/* 0x92d963 cmp/jb — UNSIGNED strict: value_len > 0x7fffffff-root_len. */
int32_t isaac_sfx_sample_path_overflow(uint32_t root_len,
                                       uint32_t value_len);

/* 0x92d96b..0x92d973 cmp cap,0x10 ; cmovae — UNSIGNED; 0x10 -> heap. */
uint32_t isaac_sfx_sample_path_root_buf(uint32_t root_cap,
                                        uint32_t sso_ptr,
                                        uint32_t heap_ptr);

void isaac_sfx_sample_path_plan(
    uint32_t root_len, uint32_t root_cap, uint32_t root_sso,
    uint32_t root_heap, uint32_t value_null, uint32_t value_ptr,
    uint32_t value_max, uint32_t throw_va, IsaacSfxSamplePathPlan* out);

/* ============ v25c: 0x00416e80 numeric/amp entity scan gates ============
 * Wave-16, banner v25c, NO ABI bump (stays 24 — the coordinator merges).
 * The text scanner's CASE 0 numeric-entity run WALK layer + the amp
 * named-entity consume/emit split (v17 landed the per-byte gates, the
 * dispatch, the named packed match, the per-digit fold, the ';' error
 * and the whole-scanner cursor/end positions; v18 the utf8-append
 * helper). The utf8-append call (0x416dc0) and the walks' memory reads
 * stay HOST; the scanner boundary (callee of 0x4167fd) stays — this
 * unit narrows its decision surface to removal-ready. */

enum {
  ISAAC_SFX_XML_SCAN_VA = 0x00416e80u, /* the scanner anchor */
  ISAAC_SFX_XML_SCAN_NUM_X_BYTE = 0x78u,   /* 'x' — the hex prefix */
  ISAAC_SFX_XML_SCAN_NUM_ENTRY_DEC = 2u,   /* decimal entry skip from '&' */
  ISAAC_SFX_XML_SCAN_NUM_ENTRY_HEX = 3u,   /* hex entry skip from '&' */
  ISAAC_SFX_XML_SCAN_NUM_NOT_DIGIT = 0xffu,/* table marker: not a digit */
  ISAAC_SFX_XML_SCAN_AMP_LITERAL_CONSUMED = 1, /* packed 0 consumes 1 */
  ISAAC_SFX_XML_SCAN_AMP_LITERAL_EMIT = 0x26 /* packed 0 emits '&' */
};

typedef struct IsaacSfxXmlScanNumRunPlan {
  int32_t hex_path;         /* is_hex != 0 narrowed to 0/1 */
  int32_t entry_digits;     /* 3 hex / 2 decimal — the '&' offset */
  int32_t first_digit_ok;   /* count>0 && gate(nibbles[0]) */
  int32_t run_len;          /* folded digit count (gate-stopped) */
  uint32_t value;           /* 32-bit wrap fold chain */
  int32_t end_digits;       /* entry + run_len (wrap): read pos at the
                               utf8/';' point, offset from the '&' */
  uint32_t utf8_va;         /* ALWAYS 0x00416dc0 (the host append edge) */
  int32_t pure_complete;    /* ALWAYS 1 — this law's decisions are pure */
  uint32_t scan_va;         /* ALWAYS 0x00416e80 */
} IsaacSfxXmlScanNumRunPlan;

/* 0x416fc0 `cmp cl,0x78 ; jne dec` — LOW-BYTE 'x' path select: 1 hex
   (first digit at '&'+3), 0 decimal (first digit = byte at '&'+2). */
int32_t isaac_sfx_xml_scan_num_hex_path(uint32_t cl);

/* 0x416fc5 add esi,3 / 0x416ff1 add esi,2 — the digit-run entry skip. */
int32_t isaac_sfx_xml_scan_num_entry_digits(uint32_t is_hex);

/* 0x416fd2/0x416ffa/0x416fe8/0x417013 `cmp al,0xff` — LOW BYTE: 0xff ->
   0 (run stops), else 1. Same gate at run entry and loop bottom. */
int32_t isaac_sfx_xml_scan_num_digit_gate(uint32_t nibble);

/* 0x41701f read-pos offset = entry + run_len, 32-bit wrap. */
int32_t isaac_sfx_xml_scan_num_end_digits(uint32_t is_hex,
                                          uint32_t run_len);

/* The digit-run fold walk over the NIBBLE sequence (hex shl4 / decimal
   *10, 32-bit wrap; one run position per consumed digit; the first
   failing gate ends the run without folding/consuming). out may be
   null. The digest-table lookups (0xb1ad60) happen in the host frame;
   the caller passes table-decoded nibbles. */
void isaac_sfx_xml_scan_num_run(uint32_t is_hex, const uint8_t* nibbles,
                                uint32_t count,
                                IsaacSfxXmlScanNumRunPlan* out);

/* 0x416f09..0x416fb6 commits + 0x417036 literal arm — amp consumption:
   skip = packed>>8, packed 0 -> 1 (the literal '&' arm consumes 1). */
int32_t isaac_sfx_xml_scan_amp_consumed(uint32_t packed);

/* 0x417039 literal store 0x26 / commits 0x26/0x27/0x22/0x3e/0x3c — amp
   emit = packed&0xff, packed 0 -> 0x26 (the literal '&'). */
int32_t isaac_sfx_xml_scan_amp_emit(uint32_t packed);

/* ============ v25b: 0x00416b70/0x00416920 attr-value scanners ==========
 * Wave-16, banner v25b, NO ABI bump (stays 24 — the coordinator merges).
 * The two ATTR-VALUE decode leaves of the attrs parse (callees of
 * 0x4165a0 at 0x4166de dquote / 0x41671e squote): the dquote "..." and
 * squote '...' entity decoders (148/146 insns, ret plain, 1 E8 ->
 * 0x416dc0, 1 caller each, body 0x416b70..0x416d4b / 0x416920..0x416afb).
 * v15 landed the four per-char gate tables (entry/text) for both sites;
 * v17/v18/v25c landed the SHARED entity laws (dispatch case content,
 * named packed ladder, numeric fold/run, ';' error, utf8-append).
 * This block lands the ATTR-SITE IDENTITY (which body/entry/text/
 * dispatch/jump table each site uses — the case table CONTENT is
 * byte-identical to the text site 0x417074, the VAs differ) and the
 * COMPOSED per-iteration decode record that WIRES the still-host body:
 * the two gate tables, the dispatch case id, the named-vs-numeric-vs-
 * literal arm select, the numeric ';' error law (0xb1b6f8) and the
 * cursor/out advance math. The walks' memory reads and the utf8-append
 * call 0x416dc0 stay HOST; the two scanner boundaries stay (this unit
 * narrows their decision surface to removal-ready). */

enum {
  ISAAC_SFX_XML_ATTR_VALUE_SITE_DQUOTE = 0, /* 0x416b70 "..." */
  ISAAC_SFX_XML_ATTR_VALUE_SITE_SQUOTE = 1, /* 0x416920 '...' */
  ISAAC_SFX_XML_ATTR_VALUE_SITE_COUNT = 2,
  ISAAC_SFX_XML_ATTR_VALUE_AMP_BYTE = 0x26u, /* the entity lead '&' */
  ISAAC_SFX_XML_ATTR_VALUE_ERR_SEMI_VA = 0x00b1b6f8u, /* "expected ;" */
  ISAAC_SFX_XML_ATTR_VALUE_NIBBLE_TABLE_VA =
      ISAAC_SFX_XML_SCAN_HEX_TABLE_VA, /* shared 0xb1ad60 */
  ISAAC_SFX_XML_ATTR_VALUE_DQUOTE_ENTRY_VA =
      ISAAC_SFX_XML_ATTR_DQUOTE_SKIP_TABLE_VA, /* 0xb1a860 {0,'"','&'} */
  ISAAC_SFX_XML_ATTR_VALUE_DQUOTE_TEXT_VA =
      ISAAC_SFX_XML_ATTR_DQUOTE_TEXT_TABLE_VA, /* 0xb1ab60 {0,'"'} */
  ISAAC_SFX_XML_ATTR_VALUE_SQUOTE_ENTRY_VA =
      ISAAC_SFX_XML_ATTR_SQUOTE_SKIP_TABLE_VA, /* 0xb1a960 {0,'&','\''} */
  ISAAC_SFX_XML_ATTR_VALUE_SQUOTE_TEXT_VA =
      ISAAC_SFX_XML_ATTR_SQUOTE_TEXT_TABLE_VA, /* 0xb1ac60 {0,'\''} */
  ISAAC_SFX_XML_ATTR_VALUE_DQUOTE_DISPATCH_VA =
      ISAAC_SFX_XML_ATTR_DQUOTE_DISPATCH_VA, /* 0x416d64 */
  ISAAC_SFX_XML_ATTR_VALUE_SQUOTE_DISPATCH_VA =
      ISAAC_SFX_XML_ATTR_SQUOTE_DISPATCH_VA, /* 0x416b14 */
  ISAAC_SFX_XML_ATTR_VALUE_DQUOTE_JUMP_VA =
      ISAAC_SFX_XML_ATTR_DQUOTE_JUMP_VA, /* 0x416d4c */
  ISAAC_SFX_XML_ATTR_VALUE_SQUOTE_JUMP_VA =
      ISAAC_SFX_XML_ATTR_SQUOTE_JUMP_VA /* 0x416afc */
};

/* The per-iteration attr-value decode record (one entity/literal step of
   0x416b70/0x416920). entry_byte is the byte under the cursor BEFORE the
   entry skip walk; first_byte is byte[skip_end] (or byte[*cursor] when
   the walk does not advance); b1..b5 are the five bytes after the '&'
   (dispatch + named ladder + numeric select); semi_byte is the byte at
   the numeric ';' check; prev_error is [0xc7de4c] at iteration entry. */
typedef struct IsaacSfxXmlAttrValueScanPlan {
  uint32_t scanner_va;      /* site body: 0x416b70 / 0x416920 */
  uint32_t entry_table_va;  /* site entry gate table */
  uint32_t text_table_va;   /* site text continue table */
  uint32_t dispatch_table_va; /* site dispatch case table */
  uint32_t jump_table_va;   /* site jump table */
  int32_t entry_advances;   /* entry_table[entry_byte] != 0 (LOW BYTE):
                               the skip walk runs */
  int32_t text_open;        /* text_table[first_byte] != 0 (LOW BYTE):
                               the decode loop entered */
  int32_t entity;           /* first_byte == '&' (LOW BYTE) && text_open */
  int32_t dispatch_ok;      /* (int8)b1 - 0x23 in unsigned [0,0x4e]
                               (movsx; 0x80+ b1 values are out) */
  int32_t case_id;          /* NUM/AMP/GT/LT/QUOT/NONE (attr table) */
  uint32_t named_packed;    /* shared named-entity law, 0 = no match */
  int32_t named_skip;       /* packed>>8, 0 -> 1 (literal '&') */
  int32_t named_emit;       /* packed&0xff, 0 -> 0x26 ('&') */
  int32_t numeric;          /* case_id == NUM */
  int32_t num_hex;          /* low(b2) == 0x78 ('x') — hex path select */
  int32_t num_first_digit_ok; /* low(first_digit) != 0xff (run gate) */
  int32_t num_run_len;      /* digit count folded (input from host run) */
  uint32_t num_value;       /* folded value (input from host run) */
  int32_t num_end_digits;   /* entry skip (3 hex / 2 dec) + run_len */
  int32_t num_semi_ok;      /* low(semi_byte) == 0x3b */
  uint32_t error_after;     /* numeric && !semi_ok -> 0xb1b6f8 :
                               prev_error (all other paths) */
  int32_t consumed;         /* named skip / (num end_digits + semi?1:0) /
                               literal 1 ('&') / 0 when text_closed */
  int32_t emitted;          /* named 1 (single store) / utf8 len / literal
                               1 / 0 when text_closed */
  int32_t utf8_called;      /* numeric (the 0x416dc0 edge) */
  int32_t literal;          /* !entity || !dispatch_ok || (named==0 &&
                               !numeric) — the copy arm ran */
  int32_t host_calls;       /* utf8_called && num_first_digit_ok?0:1 —
                               the append edge ALWAYS runs on the numeric
                               arm even with no digits (v18: value 0) */
  int32_t pure_complete;    /* ALWAYS 0 — walks + utf8 stay host */
  uint32_t size_bytes;      /* ALWAYS 0x1dc (site body span) */
  int32_t caller_count;     /* ALWAYS 1 (0x4166de / 0x41671e) */
} IsaacSfxXmlAttrValueScanPlan;

/* 0x416bd0 / 0x416980 `movzx eax, byte[eax+<tbl>]` — the attr dispatch
   case law: (int8)b1-0x23 in unsigned [0,0x4e] -> table value (same
   content as the text site), else NONE. LOW BYTE of b1 (movsx). */
int32_t isaac_sfx_xml_attr_value_dispatch_ok(uint32_t b1);

/* 0x416b7b..0x416b9c entry-skip gate (SITE-select: dquote 0xb1a860 /
   squote 0xb1a960) and 0x416baa/0x416d34 text-continue gate
   (SITE-select: dquote 0xb1ab60 / squote 0xb1ac60). LOW BYTE. */
int32_t isaac_sfx_xml_attr_value_entry_char(uint32_t site, uint32_t byte);
int32_t isaac_sfx_xml_attr_value_text_char(uint32_t site, uint32_t byte);

/* The attrs-site entity-name compare lands via the SHARED
   isaac_sfx_xml_scan_named_entity (0x416bde..0x416ca6 / 0x41698e..
   0x416a56 are the SAME ladders as the text site; no re-land). */

/* 0x416cab..0x416d24 / 0x416a5b..0x416ad4 — the numeric ';' error law:
   numeric && low(semi_byte) != 0x3b -> 0xb1b6f8, else prev_error. The
   semi byte is read AFTER the utf8 call (0x416d0f re-read). */
uint32_t isaac_sfx_xml_attr_value_semi_error(int32_t numeric,
                                             uint32_t semi_byte,
                                             uint32_t prev_error);

/* 0x416b9e/0x416ba0/0x416d26.. / twins — the consumed/emitted count
   laws of ONE iteration: consumed = named_skip / numeric
   (end_digits + semi_ok) / literal 1; emitted = named_emit / utf8_len
   / literal 1. */
int32_t isaac_sfx_xml_attr_value_consumed(uint32_t named_packed,
                                          int32_t numeric,
                                          int32_t num_end_digits,
                                          int32_t num_semi_ok,
                                          int32_t literal);
int32_t isaac_sfx_xml_attr_value_emitted(uint32_t named_packed,
                                         int32_t numeric,
                                         uint32_t num_value,
                                         int32_t utf8_len,
                                         int32_t literal);

/* Composed per-iteration decode record (pick the site's tables and
   wire the loop's arms; out may be null). */
void isaac_sfx_xml_attr_value_scan_plan(
    uint32_t site, uint32_t entry_byte, uint32_t first_byte, uint32_t b1,
    uint32_t b2, uint32_t b3, uint32_t b4, uint32_t b5, uint32_t semi_byte,
    uint32_t prev_error, uint32_t num_run_len, uint32_t num_value,
    IsaacSfxXmlAttrValueScanPlan* out);

/* ============ v25d: 0x92d528/0x92da3a numeric-scan gates at the atoi
 * IAT (wave-16, banner v25d, NO ABI bump — coordinator merges).
 * The v24 census said "IAT strtoul (numeric parse) HOST"; the slot
 * 0xb187a8 is VERIFIED **atoi** (hint 80, one arg). This block lands
 * the DECISION surface around the two atoi calls (the call itself stays
 * host): the FULL-WORD value-ptr select for the atoi ARG
 * (0x92d51d..0x92d524 / 0x92da2f..0x92da36), the IAT-VA pin, the count
 * store [ebp-0x10264] = FULL eax (0x92d531, signed-checked later v9),
 * the POST-CALL slot re-read [ebp-0x1040c] (0x92da40 — defect-1: never
 * the pre-call fold) and the weight store [slot+0x34] = FULL eax
 * (0x92da49). The v5 strcmp/arm/action laws route WHICH attr parses. */

enum {
  /* The two atoi call sites of the 0x92d140 reader. */
  ISAAC_SFX_NUMERIC_ID_CALL_92D528 = 0x0092d528u,
  ISAAC_SFX_NUMERIC_WEIGHT_CALL_92DA3A = 0x0092da3au,
  /* The count field the id arm stores (0x92d531). */
  ISAAC_SFX_NUMERIC_COUNT_FIELD_10264 = 0x00010264u,
  /* The sample-slot weight field (0x92da49; entry+0x3c+idx*0x38). */
  ISAAC_SFX_NUMERIC_WEIGHT_OFF_34 = 0x34u
};

/* 0x92d51d..0x92d524 / 0x92da2f..0x92da36 — FULL-WORD NULL select for
   the atoi arg: value_ptr != 0 -> value_ptr, else the 0xc71640 empty
   string. LOW-BYTE would wrongly fall back on 0x100. */
uint32_t isaac_sfx_numeric_atoi_arg(uint32_t value_ptr);

/* 0x92d527/0x92da39 — the IAT slot IS atoi (hint 80), VA 0xb187a8. */
uint32_t isaac_sfx_numeric_atoi_iat_va(void);

/* 0x92d531 — the count field = the atoi result, FULL 32-bit eax. */
int32_t isaac_sfx_numeric_id_count(uint32_t atoi_result);

/* 0x92da40 — the slot pointer re-read AFTER the atoi call; the weight
   store targets the POST-call value (defect-class-1: never pre-call). */
uint32_t isaac_sfx_numeric_weight_slot_after(uint32_t slot_pre,
                                             uint32_t slot_post);

/* 0x92da49 — slot->weight = the atoi result, FULL 32-bit at +0x34. */
int32_t isaac_sfx_numeric_weight_value(uint32_t atoi_result);

/* ============ v26: 0x92d140 sibling callee bodies — emplace / destroy-
 * range / resize-n decision layers (lost v25e unit, landed 2026-08-16 as
 * ABI 25->26; model block was in place, cpp/header/tests never landed).
 * The three STILL-HOST callee bodies of the 0x92d140 XML block that v24
 * left classified: 0x92e830 slot emplace (move-construct at end, site
 * 0x92d640), 0x92ea80 destroy-range [begin..end) (sites 0x92d30d +
 * 0x92edc0's tail), 0x92edc0 resize-n construct (site 0x92d371, n =
 * 0x443 - size_count). The DECISION content is pure: the n==0/empty je
 * trivial arms, the equality-terminated stride-loop iteration counts,
 * the emplace copy-run map, the 8-write source/dest reset ORDER, the
 * funclet state parity and the calling-convention shapes (destroy-range
 * `ret` + caller dummy stack arg; resize-n `ret 0xc` = 3 stack args).
 * Host edges stay host: 0xaef956 (0x38 mover), 0x40d040 (string dtor),
 * 0xaef638 (__ehvec_dtor), 0x92cea0 (element ctor).
 * All params uint32_t (no uint8_t scalar anywhere). */

enum {
  ISAAC_SFX_EMPLACE_VA_92E830 = 0x0092e830u, /* slot emplace body */
  ISAAC_SFX_DESTROY_RANGE_VA_92EA80 = 0x0092ea80u, /* destroy [begin..end) */
  ISAAC_SFX_RESIZE_N_VA_92EDC0 = 0x0092edc0u, /* resize-n construct */
  ISAAC_SFX_EMPLACE_MOVER_VA_AEF956 = 0x00aef956u, /* host 0x38 mover */
  ISAAC_SFX_EHVEC_DTOR_VA_AEF638 = 0x00aef638u, /* host __ehvec_dtor */
  ISAAC_SFX_STRING_DTOR_VA_40D040 = 0x0040d040u, /* host string dtor */
  ISAAC_SFX_RESIZE_N_CTOR_VA_92CEA0 = 0x0092cea0u, /* host element ctor */
  ISAAC_SFX_EMPLACE_STR_OFF_1A0 = 0x1a0u, /* string field in the entry */
  ISAAC_SFX_EMPLACE_SUB_OFF_8 = 0x08u,    /* subobject at slot+8 */
  ISAAC_SFX_EMPLACE_SUB_SIZE_38 = 0x38u,  /* subobject span */
  ISAAC_SFX_EMPLACE_RESET_SSO_TAG = 0x0fu, /* source reset SSO tag */
  ISAAC_SFX_DESTROY_STR_OFF_1A0 = 0x1a0u,
  ISAAC_SFX_DESTROY_SUB_OFF_8 = 0x08u,
  ISAAC_SFX_DESTROY_SUB_SIZE_38 = 0x38u,
  ISAAC_SFX_GUARD_SENTINEL_FFFFFFFF = 0xffffffffu,
  ISAAC_SFX_FUNCLET_STATE_AFTER = 0xffffffffu,
  ISAAC_SFX_EMPLACE_RUNS = 8u /* copy runs / write steps */
};

/* Run k's source offset (0x92e846..0x92e8d1); k >= 8 -> 0xffffffff. */
uint32_t isaac_sfx_emplace_copy_run_start(uint32_t k);

/* Run k's byte width; the +8 run is 0x38 (mover span), the trailing run
   is 0x1a0..0x1b8 = 0x20 (movups 16 + movq 8). */
uint32_t isaac_sfx_emplace_copy_run_width(uint32_t k);

/* Write-event kind for step 0..7: 0 = dest pre-zero, 1 = copy,
    2 = source reset; step >= 8 -> 0xffffffff. */
uint32_t isaac_sfx_emplace_write_kind(uint32_t step);

/* Field of write-event step (0 target, 1 offset, 2 width, 3 value);
   copy events report value = 0xffffffff; invalid step/field -> guard. */
uint32_t isaac_sfx_emplace_write_info(uint32_t step, uint32_t field);

/* Destroy-range iteration count (0x92eaa6..0x92eae3): begin == end -> 0
   (trivial je arm); aligned spans -> (end-begin)/0x1b8 (the loop is
   EQUALITY-terminated on begin+(i+1)*0x1b8 != end); misaligned or
   inverted spans never hit the equality before wrap — the machine spins;
   the model reports the 0xffffffff unbounded guard (caller contract:
   aligned spans only; 0x75328 == 0x443*0x1b8). */
uint32_t isaac_sfx_destroy_range_iters(uint32_t begin, uint32_t end);

/* The i-th iteration's std::string dtor target offset (slot+0x1a0;
   `lea ecx,[esi+0x198]` with esi = slot+8), 32-bit wrap. */
uint32_t isaac_sfx_destroy_range_slot_string_off(uint32_t i);

/* The i-th iteration's 0x38 subobject (__ehvec_dtor) offset slot+8,
   32-bit wrap. */
uint32_t isaac_sfx_destroy_range_slot_sub_off(uint32_t i);

/* Funclet state at transition t (0-based): even t -> 0 (before the
   string dtor), odd t -> 0xffffffff (after the __ehvec_dtor):
   [ebp-4] = 0 at 0x92eab6, = 0xffffffff at 0x92ead7. */
uint32_t isaac_sfx_destroy_range_funclet_state(uint32_t t);

/* The caller pushes a dummy stack arg at 0x92d302 / 0x92ee16 that the
   callee never reads; the body is `ret` (cleans nothing). Pins 1. */
int32_t isaac_sfx_destroy_range_stack_dummy(void);

/* Resize-n ctor count (0x92edfd..0x92ee14): `test edi,edi ; je` trivial
   arm -> 0 for n==0, else the `sub edi,1 ; jne` down-count runs EXACTLY
   n times. */
uint32_t isaac_sfx_resize_n_ctor_count(uint32_t n);

/* Result pointer = begin + n*0x1b8, 32-bit wrap per-step add
   (0x92ee08/0x92ee23). */
uint32_t isaac_sfx_resize_n_end(uint32_t begin, uint32_t n);

/* The i-th default-ctor target offset (0x92ee01..0x92ee08), 32-bit
   wrap. */
uint32_t isaac_sfx_resize_n_ctor_off(uint32_t begin, uint32_t i);

/* The tail destroy_range(new_end, new_end) (0x92ee16..0x92ee1b) is
   ALWAYS the destroy-range trivial arm — 0 iterations. */
uint32_t isaac_sfx_resize_n_tail_iters(uint32_t begin, uint32_t n);

/* `ret 0xc` = 3 stack args (begin, n, unused allocator dword). */
int32_t isaac_sfx_resize_n_stack_args(void);

/* ============ v26b: SFXManager::Play 0x92dc30 device-LEAF decisions
 * (wave-18, record idx 46; ABI converges at 26 — no second bump).
 * The Play body's pure islands were landed at v5 (gate/window/RNG/voice/
 * arg laws, see SP section above). What was still HOST-side was the
 * DECISION structure of the voice-allocate block and the tail device
 * calls — which channel-gated leaf fires. These laws put every one of
 * those gates in-module so record 46 and the frame-opaque/room callers
 * can emit TYPED host leaves (the calls themselves stay device).
 * All params uint32_t/int32_t/float — no uint8_t scalar (B-jump sites
 * tested at 0x92dd98..0x92de75 re-read the channel pointer; the stream
 * byte is low-byte-tested like the family's other byte gates). */

/* Gate -> typed host leaf discriminators (record-46 wiring):
   NO_SAMPLES -> the "[warn] Sound %d has no samples." log + ret 0x92dcce
   (the 0x92dcb5 call to 0xa112c0 is the ONLY side effect on that arm);
   PRELOAD -> Load 0x92cfb0 + "not preloaded" log + this[0xc]++ + the
   continuation body edge (0x92dcda..0x92dcf1 — NOT a no-op);
   LIVE -> the per-voice device body below. MISS -> nothing. */
int32_t isaac_sfx_play_no_samples_host(int32_t gate_kind);
int32_t isaac_sfx_play_preload_host(int32_t gate_kind);
int32_t isaac_sfx_play_body_host(int32_t gate_kind);

/* 0x92dd98 test ecx,ecx ; je skip — vtbl+0x28 probe fires iff the picked
   voice's channel pointer is non-null. */
int32_t isaac_sfx_play_probe_needed(int32_t channel_null);

/* 0x92dda3 test al,al ; je skip — the channel-wrapper reset 0xa2abd0
   fires iff the probe ran AND reported true (channel non-null + probe
   result nonzero). */
int32_t isaac_sfx_play_reset_needed(int32_t channel_null,
                                    int32_t probe_alive);

/* 0x92ddb3..0x92ddb8 `lea ecx,[slot+8] ; cmp [slot+0x1c],0x10 ; jb inline
   ; mov ecx,[slot+8]` — the stream-name pointer fed to the 0xc5aaa0
   vtbl+0x24 create: UNSIGNED capacity below 0x10 -> the inline SSO
   buffer (slot+8), else the heap pointer stored at slot+8. */
uint32_t isaac_sfx_play_stream_name_ptr(uint32_t name_cap,
                                        uint32_t inline_base,
                                        uint32_t heap_ptr);

/* 0x92ddfc test ecx,ecx ; je — the vtbl+0x40 set-loop call fires iff the
   channel read at the tail start is non-null (FIRST read; the loop byte
   store [voice+0x28] = dl happens regardless). */
int32_t isaac_sfx_play_set_loop_needed(int32_t channel_null);

/* 0x92de13 test ecx,ecx ; je — vtbl+0x58 set-pitch iff channel != 0. */
int32_t isaac_sfx_play_set_pitch_needed(int32_t channel_null);

/* 0x92de5b test ecx,ecx ; je — vtbl+0x48 set-volume iff channel != 0
   (the volume store [voice+0x2c] happens regardless). */
int32_t isaac_sfx_play_set_volume_needed(int32_t channel_null);

/* 0x92de6d test ecx,ecx ; je — vtbl+0x2c start fires iff the channel is
   non-null at the RELOAD ([voice+0x20] re-read after set-volume). */
int32_t isaac_sfx_play_start_needed(int32_t channel_null);

/* Word [voice+0x29] = 1 iff the start call fires (pending 1, flag +0x0a
   cleared — one 16-bit store at 0x92de78). 1 on a live channel, 0 when
   the voice has no channel at the reload. */
int32_t isaac_sfx_play_pending_word(int32_t channel_null);

typedef struct IsaacSfxPlayLeafInput {
  int32_t gate_kind;      /* ISAAC_SFX_PLAY_GATE_* */
  int32_t window_open;    /* isaac_sfx_play_window_open */
  int32_t channel_null;   /* picked voice channel == 0 */
  int32_t probe_alive;    /* vtbl+0x28 al (host-resolved) */
  uint32_t stream_flag;   /* picked voice stream byte (low byte tested) */
  uint32_t name_cap;      /* wrapper string capacity (slot+0x1c) */
  uint32_t name_inline;   /* inline buffer address (slot+0x08) */
  uint32_t name_heap;     /* heap buffer pointer (slot+0x08 slot) */
  int32_t channel_count;  /* the 0xa2ac20 mono gate's channel count */
  float pan;              /* pan arg (the wrapper's non-mono guard) */
} IsaacSfxPlayLeafInput;

typedef struct IsaacSfxPlayLeafPlan {
  int32_t no_samples_host;   /* warn log leaf fires (gate NO_SAMPLES) */
  int32_t preload_host;      /* Load+log+counter leaf fires (PRELOAD) */
  int32_t body_reached;      /* PRELOAD||LIVE && window_open */
  int32_t allocate_needed;   /* body && low(stream_flag) != 0 */
  int32_t probe_needed;      /* allocate && channel != 0 */
  int32_t reset_needed;      /* probe && probe_alive */
  uint32_t stream_name_ptr;  /* SSO select on the allocate path, else 0 */
  int32_t set_loop_needed;   /* body && channel != 0 (1st read) */
  int32_t set_pitch_needed;  /* body && channel != 0 */
  int32_t set_volume_needed; /* body && channel != 0 */
  int32_t start_needed;      /* body && channel != 0 (reload) */
  int32_t pending_word;      /* 1 iff start_needed */
  int32_t pan_action;        /* ISAAC_SFX_PAN_ACTION_* (0xa2ac20 law) */
  int32_t device_calls;      /* total typed-host device/wrapper calls:
                                allocate ? 3 + probe + reset : 0, +
                                set_loop + set_pitch + set_volume +
                                start + (body ? 1 : 0) pan wrapper */
  int32_t pure_complete;     /* 0 iff ANY host leaf fires */
  int32_t host_needed;       /* !pure_complete */
} IsaacSfxPlayLeafPlan;

/* Full typed-leaf record of the Play continuation. in_/out may be null
   (no-op when out is null; a null in_ leaves out zeroed). */
void isaac_sfx_play_leaf_plan(const IsaacSfxPlayLeafInput* in_,
                              IsaacSfxPlayLeafPlan* out);

/* ============ v26: 0xa17f40 / 0xa17ea0 attempt bodies of the 0xa178d0
 * file-open retry gate (wave-18; ABI stays 26 — idempotent, v26b
 * declares no second bump). The open calls attempt #1 (0xa17f40) with
 * (this, handle, &result_slot); the v25f retry gate runs attempt #2
 * (0xa17ea0) iff the CALLER's result slot is ZERO after attempt #1
 * (0xa1792a cmp [ebp+8],0). Both attempts write the caller slot ONLY
 * through the out pointer — the *out write laws below; their own
 * [ebp+8] writes (0xa17f8a hash1, 0xa1800a alloc1, 0xa17eca alloc2)
 * are MSVC arg-slot reuse spills, NOT the caller slot (defect-class
 * guard: never fold the post-call value to the callee-local [ebp+8]).
 * Host: 0xa159d0/0xa15ab0 string hashes, slot-table reads, 0xa0f4c0
 * alloc, 0xa68a50 ctor, 0xa524b0/0xa52540 + vtbl[0x24] loaders, vtbl[0]
 * dtor. All params uint32_t (no uint8_t scalar anywhere). */

enum {
  ISAAC_SFX_OPEN_ATTEMPT1_VA_A17F40 = 0x00a17f40u, /* attempt #1 body */
  ISAAC_SFX_OPEN_ATTEMPT2_VA_A17EA0 = 0x00a17ea0u, /* attempt #2 body */
  ISAAC_SFX_OPEN_ATTEMPT1_HASH1_VA_A159D0 =
      0x00a159d0u, /* host string hash #1 */
  ISAAC_SFX_OPEN_ATTEMPT1_HASH2_VA_A15AB0 =
      0x00a15ab0u,                        /* host string hash #2 */
  ISAAC_SFX_OPEN_ATTEMPT2_LOADER_VA_A524B0 =
      0x00a524b0u, /* host loader (out==NULL arm) */
  ISAAC_SFX_OPEN_ATTEMPT2_LOADER_VA_A52540 =
      0x00a52540u, /* host loader (vtbl[0x24] direct target) */
  ISAAC_SFX_OPEN_ATTEMPT2_VTABLE_B9E940 =
      0x00b9e940u, /* attempt-2 object vtable ptr */
  ISAAC_SFX_OPEN_ATTEMPT1_CTOR_VA_A68A50 =
      0x00a68a50u, /* host ctor (attempt-1 found store) */
  ISAAC_SFX_OPEN_ATTEMPT1_SLOTS_OFF_108 =
      0x108u, /* slot table offset in the open object */
  ISAAC_SFX_OPEN_ATTEMPT_PROBE_MASK = 0x7fffu,   /* 15-bit probe mask */
  ISAAC_SFX_OPEN_ATTEMPT_PROBE_LIMIT = 0x8000u,  /* 0x8000 slots */
  ISAAC_SFX_OPEN_ATTEMPT1_ALLOC_SIZE = 0xc2cu,   /* attempt-1 alloc */
  ISAAC_SFX_OPEN_ATTEMPT2_ALLOC_SIZE = 0x10u,    /* attempt-2 alloc */
  ISAAC_SFX_OPEN_OUT_NONE = 0xffffffffu /* no *out write (slot=0 stays) */
};

/* 0xa17f8d `and esi,0x7fff` — probe start = hash1 & 0x7fff (15-bit
   index into the 0x8000-slot table at this+0x108, stride 4; FULL-WORD). */
uint32_t isaac_sfx_open_attempt1_probe_start(uint32_t hash1);

/* 0xa17fcf/d0 `inc esi ; and esi,0x7fff` — probe advance wraps 0x7fff
   back to 0. */
uint32_t isaac_sfx_open_attempt1_probe_next(uint32_t idx);

/* 0xa17fc5 / 0xa17fee `cmp counter,0x8000 ; jae` — UNSIGNED probe bound:
   1 = counter >= 0x8000 (all 0x8000 slots exhausted). */
int32_t isaac_sfx_open_attempt1_probe_done(uint32_t counter);

/* 0xa17fb8/0xa17fbd — FULL-WORD pair compare: entry->key1 == hash1 AND
   entry->key2 == hash2. */
int32_t isaac_sfx_open_attempt1_slot_match(uint32_t key1, uint32_t key2,
                                           uint32_t hash1, uint32_t hash2);

/* 0xa17fe1 (slot nonzero) + 0xa17fee (counter < 0x8000, UNSIGNED) —
   the found verdict after the walk. */
int32_t isaac_sfx_open_attempt1_found(uint32_t slot_nonzero,
                                      uint32_t counter);

/* 0xa18027/0xa18041 al=1 (found tails) vs 0xa18057 al=0 (path-bad or
   miss) — ret = name_ok && found. */
int32_t isaac_sfx_open_attempt1_ret(uint32_t name_ok, uint32_t found);

/* Result-slot write law #1: NONE (0xffffffff) when no *out write (name
   fail / miss / out==0); else alloc_ok ? ctor_result : 0. */
uint32_t isaac_sfx_open_attempt1_out_plan(uint32_t name_ok, uint32_t found,
                                          uint32_t out, uint32_t alloc_ok,
                                          uint32_t ctor_result);

/* 0xa17eba `test ebx,ebx ; je host-arm` — FULL-WORD: out != 0 keeps the
   alloc/load path; out == 0 goes to the HOST 0xa524b0 arm. */
int32_t isaac_sfx_open_attempt2_out_gate(uint32_t out);

/* 0xa17ecd `test esi,esi ; je 0xa17eee` — FULL-WORD alloc gate (the
   alloc==0 arm is a PE NULL-deref crash in practice; typed note). */
int32_t isaac_sfx_open_attempt2_alloc_gate(uint32_t alloc);

/* 0xa17ef8 `cmp fn,0xa52540 ; jne indirect` — direct-call select on the
   vtbl[0x24] loader pointer. */
int32_t isaac_sfx_open_attempt2_dispatch_direct(uint32_t fn);

/* 0xa17f08 `test al,al ; jne keep` — LOW-BYTE: loader al nonzero keeps
   the object; 0x100/0x1ff must NOT keep. */
int32_t isaac_sfx_open_attempt2_keep(uint32_t load_result);

/* 0xa17f1a `setne al` — ret = alloc_ok && keep (obj != NULL). */
int32_t isaac_sfx_open_attempt2_ret(uint32_t alloc_ok, uint32_t keep);

/* Result-slot write law #2: NONE when the main path is not reached
   (name fail / out==0 host arms); else kept ? alloc_ptr : 0. */
uint32_t isaac_sfx_open_attempt2_out_plan(uint32_t name_ok, uint32_t out,
                                          uint32_t alloc_ok, uint32_t keep,
                                          uint32_t alloc_ptr);

/* ============ v27: 0xa17180 build body of the 0xa178d0 file-open +
 * 56-site canonical-key builder (wave-19 handoff; ABI 26 -> 27).
 * The body builds the canonical key handle the open passes to attempt
 * #1/#2 (v26). Pure decision layer: the drive-absolute prefix gate
 * (name!=0 FULL-WORD + strlen>2 UNSIGNED + bytes ':' '\\'/'/'), the
 * validator keep (LOW-BYTE al), the ABS-arm return/dispose plans, the
 * FAIL-arm resolve-result gate (FULL-WORD), the variant select (BYTE
 * flag) and the variant-A dispose gate (FULL-WORD). Host: 0xa5a7a0
 * (canonicalizer), 0xa524b0 (validator — already registered as the
 * attempt-2 loader), 0xa16c60 (relative resolver), 0xa68790 (join),
 * 0xa648b0 (dispose, registered), inline strlen scan (CRT). The final
 * return value is a HOST canonicalizer result in every arm; the SEH
 * guard writes (0/1/0xffffffff) at the two dispose sites are
 * deterministic glue — typed host. All params uint32_t (no uint8_t
 * scalar anywhere; byte discipline = & 0xff inside the laws). */

enum {
  ISAAC_SFX_BUILD_VA_A17180 = 0x00a17180u, /* the build body span
                                              0xa17180..0xa172d3 ret 4 */
  ISAAC_SFX_BUILD_CHAR_COLON = 0x3au,      /* 0xa171bf cmp ':' */
  ISAAC_SFX_BUILD_CHAR_BACKSLASH = 0x5cu,  /* 0xa171c8 cmp 0x5c */
  ISAAC_SFX_BUILD_CHAR_SLASH = 0x2fu,      /* 0xa171cc cmp 0x2f */
  ISAAC_SFX_BUILD_MIN_ABS_LEN = 2u,        /* 0xa171ba jbe: len must
                                               EXCEED 2 (min "X:\") */
  ISAAC_SFX_BUILD_CANON_VA_A5A7A0 = 0x00a5a7a0u, /* host canonicalizer */
  ISAAC_SFX_BUILD_RESOLVE_VA_A16C60 = 0x00a16c60u, /* host relative
                                                       resolver */
  ISAAC_SFX_BUILD_JOIN_VA_A68790 = 0x00a68790u, /* host join machinery */
};

/* 0xa171a5..0xa171ce — the drive-absolute prefix test selecting the ABS
   arm: name!=0 (FULL-WORD 0xa171a8), strlen(name)>2 (UNSIGNED jbe
   0xa171ba), c1==':' (BYTE 0xa171bf), c2=='\\' || c2=='/' (BYTE
   0xa171c8/0xa171cc). All four must hold; any failure -> FAIL arm. */
int32_t isaac_sfx_build_abs_gate(uint32_t name_nonzero, uint32_t len,
                                 uint32_t c1, uint32_t c2);

/* 0xa171e9 `test al,al ; jne RET` — LOW-BYTE: the validator's al
   nonzero keeps the canonicalized handle; 0x100/0x1ff drive must NOT
   keep (the JNE sees only al). */
int32_t isaac_sfx_build_abs_keep(uint32_t ok_result);

/* 0xa1720a `mov eax,esi` — ABS-arm return value: keep ? s1 : 0 (the
   dispose arm xor esi,esi folds to 0; s1==0 arm is already 0). */
uint32_t isaac_sfx_build_abs_out(uint32_t keep, uint32_t s1);

/* 0xa171f1..0xa17208 — the ABS-arm dispose edge fires (HOST 0xa648b0)
   iff NOT keep AND s1 != 0 (FULL-WORD 0xa171ed test); result folds 0. */
int32_t isaac_sfx_build_abs_dispose(uint32_t keep, uint32_t s1);

/* 0xa17230 `test edi,edi ; je RET0` — FULL-WORD gate on the FAIL-arm
   resolve result (0xa16c60): 0 -> RET 0, nonzero -> variant select. */
int32_t isaac_sfx_build_resolve_gate(uint32_t r);

/* 0xa17238 `cmp byte[ebp+0xb],0 ; je variant-A` — LOW-BYTE flag test:
   flag byte 0 -> VARIANT A (1), any nonzero byte -> VARIANT B (0).
   0x100/0x1ff must read as 0 (al of the flagged byte). */
int32_t isaac_sfx_build_variant_select(uint32_t flag);

/* 0xa17279 `test esi,esi ; je skip` — FULL-WORD: variant-A's second
   canonicalizer result s2 != 0 runs the dispose edge (HOST 0xa648b0). */
int32_t isaac_sfx_build_variant_a_dispose(uint32_t s2);


/* ============ v28: 0xa159d0 / 0xa15ab0 string-hash pair (wave-20
 * handoff; ABI 27 -> 28). The file-open canonical-key hashes: hash #1
 * (0xa159d0, djb2-style h = h*33 + norm(byte), 23 direct rel32 callers)
 * and hash #2 (0xa15ab0, FNV-1a h = (h ^ norm(byte)) * 0x1000193, 2
 * direct callers). Both bodies are self-contained folds - 0 E8, 0
 * indirect, 0 mem-stores; the string POINTER/BYTES are the host input
 * stream, the fold arithmetic is pure and removal-ready (supersedes
 * the v26/v27 "stay HOST" note: the pointer read stays host, the fold
 * lands). Shared per-byte layer: norm (A..Z -> a..z via UNSIGNED
 * (b-0x41)>0x19, then 0x5c -> 0x2f) + loop-continue (LOW-BYTE
 * byte!=0); per-hash layer: FULL-WORD null gate (s==0 -> 0), seed
 * init, fold step. Consumers (landed, unchanged): v26 probe_start
 * (hash1 & 0x7fff) and slot_match (hash1/hash2 pair compare). Caller
 * census 2026-08-18 (raw .text e8 rel32 scan, re-derived): 23 direct
 * callers of 0xa159d0 incl. 0x40e567 (`e8 64 74 60 00`), 0x40ee12
 * (`e8 b9 6b 60 00`), 0xa12c57 (`e8 74 2d 00 00`), 0xa16313
 * (`e8 b8 f6 ff ff`) byte-verified; 2 direct callers of 0xa15ab0
 * (0x008f5b4b, 0x00a17fa5). All params uint32_t (no uint8_t scalar
 * anywhere; byte discipline = & 0xff inside the laws). */

enum {
  ISAAC_SFX_HASH1_VA_A159D0 = 0x00a159d0u, /* hash #1 body
                                              0xa159d0..0xa15a28 ret plain */
  ISAAC_SFX_HASH2_VA_A15AB0 = 0x00a15ab0u, /* hash #2 body
                                              0xa15ab0..0xa15b08 ret plain */
  ISAAC_SFX_HASH1_SEED = 0x1505u,        /* 0xa159dd mov eax,0x1505 */
  ISAAC_SFX_HASH2_SEED = 0x5bb2220eu,    /* 0xa15abb mov esi,0x5bb2220e */
  ISAAC_SFX_HASH2_PRIME = 0x1000193u,    /* 0xa15af6 imul esi,eax,0x1000193 */
  ISAAC_SFX_HASH_NORM_A = 0x41u,         /* 0xa159f7/0xa15ad7 sub 0x41 */
  ISAAC_SFX_HASH_NORM_LOWER_DELTA = 0x19u, /* 0xa159fd/0xa15adc cmp 0x19
                                               (UNSIGNED above -> keep) */
  ISAAC_SFX_HASH_NORM_CASE_SHIFT = 0x20u,  /* 0xa159fa/0xa15ada add 0x20 */
  ISAAC_SFX_HASH_NORM_BACKSLASH = 0x5cu,   /* 0xa15a0b/0xa15ae8 cmp 0x5c */
  ISAAC_SFX_HASH_NORM_SLASH = 0x2fu,       /* cmove edi = 0x2f */
  ISAAC_SFX_HASH1_CALLER_COUNT = 23u,      /* census 2026-08-18 */
  ISAAC_SFX_HASH2_CALLER_COUNT = 2u,       /* census 2026-08-18 */
};

/* 0xa159f7..0xa15a11 == 0xa15ad7..0xa15aee - the SHARED per-byte
   normalize: b = c&0xff; d = (b-0x41)&0xff; lo = (b+0x20)&0xff;
   n = d > 0x19 (UNSIGNED) ? b : lo; n == 0x5c -> 0x2f. BYTE in/out
   (0x13a reads 0x3a, 0x15c reads 0x2f). */
uint32_t isaac_sfx_hash_byte_norm(uint32_t c);

/* 0xa159e3/0xa15a21 (hash1) + 0xa15ac0/0xa15aff (hash2) `test
   ch,ch ; jne` - LOW-BYTE loop-continue: (c&0xff) != 0 keeps folding;
   the NUL terminator is never folded. */
int32_t isaac_sfx_hash_byte_continue(uint32_t c);

/* 0xa159d5 `test esi,esi ; jne body` - FULL-WORD: hash1(s==0) = 0
   (xor eax,eax arm). */
int32_t isaac_sfx_hash1_null_gate(uint32_t s);

/* 0xa159dd `mov eax,0x1505` - hash #1 seed. */
uint32_t isaac_sfx_hash1_init(void);

/* 0xa15a14..0xa15a1c `shl eax,5 ; add eax,ecx ; add eax,dl` - the
   djb2 fold step: h = h*33 + norm(c) (mod 2^32). */
uint32_t isaac_sfx_hash1_step(uint32_t h, uint32_t c);

/* 0xa15ab2 `test ecx,ecx ; jne body` - FULL-WORD: hash2(s==0) = 0. */
int32_t isaac_sfx_hash2_null_gate(uint32_t s);

/* 0xa15abb `mov esi,0x5bb2220e` - hash #2 seed. */
uint32_t isaac_sfx_hash2_init(void);

/* 0xa15af4..0xa15af6 `xor eax,esi ; imul esi,eax,0x1000193` - the
   FNV-1a fold step: h = (h ^ norm(c)) * 0x1000193 (mod 2^32). */
uint32_t isaac_sfx_hash2_step(uint32_t h, uint32_t c);

/* ---------- v29: 0x92dbd0 SoundEffect entry destructor (wave-22 NET
   audit; ABI 28 -> 29) ----------

   Net-audit landing: the FIRST caller-bearing unclassified body of the
   SFX-declared band (section-notes/sfx-v29-net/). Body
   0x92dbd0..0x92dc21 (ret plain @ 0x92dc21; int3 pad 0x92dc22..0x92dc2f;
   next body 0x92dc30 = Play). Inbound census (raw .text E8/E9 scan):
   exactly 2 jmp-tail callers = 0xb0ab89 (`lea ecx,[ebp-0x10400]`) and
   0xb0ab94 (`lea ecx,[ebp-0x200]`) - the 0x92d140 XML-reader's TWO
   PROTO-entry SEH cold destroy arms (proto1 frame [ebp-0x10400], proto2
   frame [ebp-0x200]; byte-verified `e9 42 30 e2 ff` / `e9 37 30 e2 ff`),
   so this dtor is the shared destroy target of both proto paths of the
   landed 0x92d140 record (whose normal-path proto dtor was v6-documented
   INLINE at 0x92daed with the SAME 0x38/7/0x92cf10 triple).

   Machine body (straight-line, 0 conditional branches):
     0x92dbd3  push -1            ; SEH guard initial = 0xffffffff,
                                  ; NEVER transitioned (no [ebp-4] writes)
     0x92dbd5  push 0xaf0d10      ; SEH handler (fs chain install)
     0x92dbf3  mov esi,ecx        ; this = entry (thiscall)
     0x92dbf5  lea ecx,[esi+0x1a0]      ; the entry's OWN std::string
     0x92dbfb  call 0x0040d040          ; std::string dtor - UNCONDITIONAL
     0x92dc00  push 0x92cf10 / push 7 / push 0x38 ; slot-dtor, count,
     0x92dc09  lea eax,[esi+8] ; push eax         ; stride, voices base
     0x92dc0d  call 0x00aef638  ; __ehvec_dtor - UNCONDITIONAL, AFTER the
                                ; string dtor (order pinned)
     0x92dc21  ret               ; PLAIN - thiscall, 0 stack args

   Third independent confirmation of the entry layout from the
   DESTRUCTOR side: string @ +0x1a0, voices @ +8, stride 0x38, count 7,
   slot dtor 0x92cf10 - byte-identical to the v4 clear/destroy walk and
   the v6 proto tail. The two callees stay host; the pure layer is the
   exact destroy plan (offsets, arity triple, order, guard, census). */

enum {
  ISAAC_SFX_ENTRY_DTOR_VA_92DBD0 = 0x0092dbd0u,   /* body root */
  ISAAC_SFX_ENTRY_DTOR_END_VA_92DC21 = 0x0092dc21u, /* first ret */
  ISAAC_SFX_ENTRY_DTOR_NEXT_VA_92DC30 = 0x0092dc30u, /* Play (v1 root) */
  ISAAC_SFX_ENTRY_DTOR_CALLER_COUNT = 2, /* 0xb0ab89 / 0xb0ab94 */
  ISAAC_SFX_ENTRY_DTOR_CALLER1_VA_B0AB89 = 0x00b0ab89u, /* proto1 arm */
  ISAAC_SFX_ENTRY_DTOR_CALLER2_VA_B0AB94 = 0x00b0ab94u, /* proto2 arm */
  ISAAC_SFX_ENTRY_DTOR_STRING_OFF_1A0 = 0x1a0u, /* own name string */
  ISAAC_SFX_ENTRY_DTOR_STRING_DTOR_VA_40D040 = 0x0040d040u,
  ISAAC_SFX_ENTRY_DTOR_VOICES_OFF_8 = 0x08u,    /* voices base */
  ISAAC_SFX_ENTRY_DTOR_STRIDE_38 = 0x38u,       /* per-slot stride */
  ISAAC_SFX_ENTRY_DTOR_COUNT_7 = 7,             /* seven slots */
  ISAAC_SFX_ENTRY_DTOR_SLOT_DTOR_VA_92CF10 = 0x0092cf10u,
  ISAAC_SFX_ENTRY_DTOR_EHVEC_VA_AEF638 = 0x00aef638u, /* __ehvec_dtor */
  ISAAC_SFX_ENTRY_DTOR_ORDER_STRING_FIRST = 1,  /* 0x92dbfb < 0x92dc0d */
  ISAAC_SFX_ENTRY_DTOR_SEH_GUARD_INITIAL = 0xffffffffu, /* push -1 */
  ISAAC_SFX_ENTRY_DTOR_BRANCH_COUNT = 0,        /* straight-line body */
};

/* 0x92dbd0 - the SoundEffect entry destructor body root. */
uint32_t isaac_sfx_entry_dtor_va(void);

/* 0x92dc21 - the body's first ret (body end, exclusive). */
uint32_t isaac_sfx_entry_dtor_end_va(void);

/* 0x92dc30 - the next body after the int3 pad (Play). */
uint32_t isaac_sfx_entry_dtor_next_va(void);

/* Raw .text E9-scan census: 2 jmp-tail callers (0xb0ab89/0xb0ab94). */
uint32_t isaac_sfx_entry_dtor_caller_count(void);

/* 0x92dbf5 `lea ecx,[esi+0x1a0]` - the entry's own name string. */
uint32_t isaac_sfx_entry_dtor_string_off(void);

/* 0x92dbfb - the std::string destructor for the name string. */
uint32_t isaac_sfx_entry_dtor_string_dtor_va(void);

/* 0x92dc09 `lea eax,[esi+8]` - the seven-slot voice array base. */
uint32_t isaac_sfx_entry_dtor_voices_off(void);

/* 0x92dc07 `push 0x38` - the per-slot stride passed to __ehvec_dtor. */
uint32_t isaac_sfx_entry_dtor_stride(void);

/* 0x92dc05 `push 7` - the slot count passed to __ehvec_dtor. */
uint32_t isaac_sfx_entry_dtor_count(void);

/* 0x92dc00 `push 0x92cf10` - the per-slot dtor (v4 record). */
uint32_t isaac_sfx_entry_dtor_slot_dtor_va(void);

/* 0x92dc0d - the __ehvec_dtor call (host; arity is pure). */
uint32_t isaac_sfx_entry_dtor_ehvec_va(void);

/* Order: 1 = string dtor (0x92dbfb) runs BEFORE the voices (0x92dc0d). */
uint32_t isaac_sfx_entry_dtor_string_first(void);

/* 0x92dbd3 `push -1` - SEH guard initial value; never transitioned. */
uint32_t isaac_sfx_entry_dtor_guard_initial(void);

/* Conditional-branch census of the whole body: 0 (straight-line). */
uint32_t isaac_sfx_entry_dtor_branches(void);

/* ---------- v30: 0x92e620 Play-ducking wrapper (wave-22 F6 handoff;
   ABI 29 -> 30) ----------

   The sfx-side consumer of the 0x956780 pre-play ctor (the v29 net
   audit's cross-family lease candidate) and the NEXT frontier the v29
   handoff named: the wrapper the 0x92e68c arm lives in. Body
   0x92e620..0x92e6d3 (`ret 0xc` @ 0x92e6d3; int3 pad 0x92e6d6..0x92e6df;
   next body 0x92e6e0 = GetVolume). Inbound census (raw .text E8/E9
   scan): 31 direct call sites + 2 imm32 refs (0x86daf1 `push 0x92e620`
   in the script-binding block that also registers 0x92cf40/0x92e300/
   0x92e560 per v8; 0x89564a `mov [eax],0x92e620` slot-store in the
   binder tail). thiscall, 3 stack args: id @ [ebp+8], volume @
   [ebp+0xc], pitch @ [ebp+0x10]; `ret 0xc`.

   Decision tree (3 conditional branches total):

     movss xmm0,[0xbaa06c]   ; THRESHOLD = 0.01f (0x3c23d70a, .rdata)
     comiss xmm0,[ebp+0xc]   ; 0.01 vs volume
     jb 0x92e656             ; 0.01 < volume -> AUDIBLE arm
     ; else SILENT arm (volume <= 0.01f): is_playing(this,id); if idle
     ;   -> shared tail (0x92e6cf), NO stop; if playing -> stop(this,id)
     ;   -> its own tail (ret 0xc @ 0x92e653).
     ; AUDIBLE arm: is_playing(this,id); if idle -> PLAY arm (0x92e68c);
     ;   if playing -> set_volume(this,id,vol) THEN set_pitch(this,id,
     ;   pitch) (order pinned; 0x92e66d < 0x92e680) -> ret 0xc @ 0x92e689.
     ; PLAY arm (0x92e68c): [ebp+8] := id ; pre_play(&id slot) via
     ;   0x956780 (thiscall, 0 stack args, C3 @ 0x956884); then
     ;   Play(this = *(0xc7169c) + 0x2a324, id', vol, 2, 1, pitch, 0)
     ;   with 6 stack args (ret 0x18 @ 0x92dcce/0x92de9c) -> shared tail.

   Arity audit (every arm balances): is_playing ret 4 (0x92e605),
   stop ret 4 (0x92e286/0x92e2f2), set_volume/set_pitch ret 8
   (0x92df9e/0x92e04d, 0x92e0a6/0x92e10f), pre-play C3, Play ret 0x18.
   The push ecx at 0x92e6bb is a DEAD push (overwritten by movss [esp]):
   the pure fact is arg2 = volume. The body performs NO byte reads (the
   gates are the comiss float compare and the is_playing AL result), so
   there are no byte-gate laws; all 37 laws are uint32_t. */

enum {
  ISAAC_SFX_DUCK_VA_92E620 = 0x0092e620u,        /* body root */
  ISAAC_SFX_DUCK_END_VA_92E6D3 = 0x0092e6d3u,    /* shared-tail ret */
  ISAAC_SFX_DUCK_FIRST_RET_VA_92E653 = 0x0092e653u, /* silent-arm ret */
  ISAAC_SFX_DUCK_NEXT_VA_92E6E0 = 0x0092e6e0u,   /* GetVolume */
  ISAAC_SFX_DUCK_CALLER_COUNT = 31,              /* direct rel32 sites */
  ISAAC_SFX_DUCK_IMM32_REF1_VA_86DAF1 = 0x0086daf1u, /* binding push */
  ISAAC_SFX_DUCK_IMM32_REF2_VA_89564A = 0x0089564au, /* binder store */
  ISAAC_SFX_DUCK_THRESHOLD_VA_BAA06C = 0x00baa06cu, /* .rdata float */
  ISAAC_SFX_DUCK_THRESHOLD_BITS_3C23D70A = 0x3c23d70au, /* 0.01f */
  ISAAC_SFX_DUCK_ID_ARG_OFF_8 = 0x08u,
  ISAAC_SFX_DUCK_VOL_ARG_OFF_C = 0x0cu,
  ISAAC_SFX_DUCK_PITCH_ARG_OFF_10 = 0x10u,
  ISAAC_SFX_DUCK_STACK_ARGS_3 = 3,               /* ret 0xc */
  ISAAC_SFX_DUCK_ARM_SILENT_VA_92E63A = 0x0092e63au, /* vol <= thr */
  ISAAC_SFX_DUCK_ARM_AUDIBLE_VA_92E656 = 0x0092e656u, /* vol > thr */
  ISAAC_SFX_DUCK_ARM_PLAY_VA_92E68C = 0x0092e68cu, /* pre-play + Play */
  ISAAC_SFX_DUCK_GATE_AUDIBLE_GT = 1,  /* jb: 0.01f < vol -> audible */
  ISAAC_SFX_DUCK_SHARED_ID_PUSH_VA_92E637 = 0x0092e637u,
  ISAAC_SFX_DUCK_SILENT_STOP_WHEN_PLAYING = 1,   /* 0x92e64a stop */
  ISAAC_SFX_DUCK_SILENT_IDLE_EXIT_VA_92E6CF = 0x0092e6cfu,
  ISAAC_SFX_DUCK_AUDIBLE_ADJUST_WHEN_PLAYING = 1, /* vol+pitch arms */
  ISAAC_SFX_DUCK_VOLUME_BEFORE_PITCH = 1,        /* 0x92e66d < 0x92e680 */
  ISAAC_SFX_DUCK_AUDIBLE_PLAY_WHEN_IDLE = 1,     /* je 0x92e68c */
  ISAAC_SFX_DUCK_PRE_PLAY_VA_956780 = 0x00956780u, /* PM pre-play */
  ISAAC_SFX_DUCK_PRE_SLOT_OFF_8 = 0x08u,  /* lea ecx,[ebp+8] = &id */
  ISAAC_SFX_DUCK_PLAY_ROOT_VA_C7169C = 0x00c7169cu, /* *(root)+0x2a324 */
  ISAAC_SFX_DUCK_PLAY_RECV_OFF_2A324 = 0x2a324u,
  ISAAC_SFX_DUCK_PLAY_VA_92DC30 = 0x0092dc30u,   /* Play, ret 0x18 */
  ISAAC_SFX_DUCK_PLAY_ARG3_IMM_2 = 2,            /* push 2 @ 0x92e6b9 */
  ISAAC_SFX_DUCK_PLAY_ARG4_IMM_1 = 1,            /* push 1 @ 0x92e6b7 */
  ISAAC_SFX_DUCK_PLAY_ARG6_IMM_0 = 0,            /* mov [esp+4],0 */
  ISAAC_SFX_DUCK_PLAY_STACK_ARGS_6 = 6,          /* ret 0x18 = 24 B */
  ISAAC_SFX_DUCK_IS_PLAYING_VA_92E560 = 0x0092e560u, /* gate callee */
  ISAAC_SFX_DUCK_STOP_VA_92E230 = 0x0092e230u,   /* silent action */
  ISAAC_SFX_DUCK_SET_VOLUME_VA_92DF40 = 0x0092df40u, /* audible act 1 */
  ISAAC_SFX_DUCK_SET_PITCH_VA_92E050 = 0x0092e050u,  /* audible act 2 */
  ISAAC_SFX_DUCK_BRANCH_COUNT_3 = 3,             /* jb + je + je */
};

/* 0x92e620 - the Play-ducking wrapper body root. */
uint32_t isaac_sfx_duck_va(void);

/* 0x92e6d3 - the shared-tail ret (last ret in the body). */
uint32_t isaac_sfx_duck_end_va(void);

/* 0x92e653 - the silent arm's ret (first ret in the body). */
uint32_t isaac_sfx_duck_first_ret_va(void);

/* 0x92e6e0 - the next body after the int3 pad (GetVolume). */
uint32_t isaac_sfx_duck_next_va(void);

/* Raw .text E8/E9 census: 31 direct call sites. */
uint32_t isaac_sfx_duck_caller_count(void);

/* 0x86daf1 - `push 0x92e620` (script-binding block, v8 siblings). */
uint32_t isaac_sfx_duck_imm32_ref1_va(void);

/* 0x89564a - binder tail `mov [eax],0x92e620` slot-store. */
uint32_t isaac_sfx_duck_imm32_ref2_va(void);

/* 0xbaa06c - the .rdata ducking-threshold float dword. */
uint32_t isaac_sfx_duck_threshold_va(void);

/* 0x3c23d70a - the threshold's float bits = 0.01f. */
uint32_t isaac_sfx_duck_threshold_bits(void);

/* 0x92e632 - id argument offset [ebp+8]. */
uint32_t isaac_sfx_duck_id_arg_off(void);

/* 0x92e62c - volume argument offset [ebp+0xc] (comiss operand). */
uint32_t isaac_sfx_duck_vol_arg_off(void);

/* 0x92e672 - pitch argument offset [ebp+0x10]. */
uint32_t isaac_sfx_duck_pitch_arg_off(void);

/* `ret 0xc` - 3 stack args (id, volume, pitch). */
uint32_t isaac_sfx_duck_stack_args(void);

/* 0x92e63a - the silent arm (volume <= threshold). */
uint32_t isaac_sfx_duck_arm_silent_va(void);

/* 0x92e656 - the audible arm (volume > threshold). */
uint32_t isaac_sfx_duck_arm_audible_va(void);

/* 0x92e68c - the pre-play + Play delegation arm. */
uint32_t isaac_sfx_duck_arm_play_va(void);

/* Gate: 1 = comiss jb jumps to AUDIBLE when 0.01f < volume (fall =
   SILENT). */
uint32_t isaac_sfx_duck_gate_audible_gt(void);

/* 0x92e637 - the single id push consumed by either arm's is_playing. */
uint32_t isaac_sfx_duck_shared_id_push_va(void);

/* Silent arm: 1 = stop (0x92e64a) runs only when is_playing is true. */
uint32_t isaac_sfx_duck_silent_stop_when_playing(void);

/* Silent arm: 1 = idle exits via the shared tail (0x92e6cf), no stop. */
uint32_t isaac_sfx_duck_silent_idle_exit_va(void);

/* Audible arm: 1 = set_volume + set_pitch run only when playing. */
uint32_t isaac_sfx_duck_audible_adjust_when_playing(void);

/* Order: 1 = set_volume (0x92e66d) runs BEFORE set_pitch (0x92e680). */
uint32_t isaac_sfx_duck_volume_before_pitch(void);

/* Audible arm: 1 = idle (is_playing false) jumps to the PLAY arm. */
uint32_t isaac_sfx_duck_audible_play_when_idle(void);

/* 0x956780 - the pre-play ctor (thiscall, 0 stack args; PM host). */
uint32_t isaac_sfx_duck_pre_play_va(void);

/* 0x92e692 `lea ecx,[ebp+8]` - pre-play receives the &id slot (off 8). */
uint32_t isaac_sfx_duck_pre_slot_off(void);

/* 0xc7169c - the global root for the Play receiver (cross v1). */
uint32_t isaac_sfx_duck_play_root_va(void);

/* 0x2a324 - receiver = *(0xc7169c) + 0x2a324 (cross v1). */
uint32_t isaac_sfx_duck_play_recv_off(void);

/* 0x92dc30 - Play (ret 0x18; 6 stack args). */
uint32_t isaac_sfx_duck_play_va(void);

/* Play arg3 - the `push 2` at 0x92e6b9. */
uint32_t isaac_sfx_duck_play_arg3(void);

/* Play arg4 - the `push 1` at 0x92e6b7. */
uint32_t isaac_sfx_duck_play_arg4(void);

/* Play arg6 - the `mov [esp+4],0` at 0x92e6a5. */
uint32_t isaac_sfx_duck_play_arg6(void);

/* Play stack args - 6 (ret 0x18 = 24 bytes). */
uint32_t isaac_sfx_duck_play_stack_args(void);

/* 0x92e560 - is_playing (the shared gate callee; ret 4). */
uint32_t isaac_sfx_duck_is_playing_va(void);

/* 0x92e230 - stop (the silent arm's action; ret 4). */
uint32_t isaac_sfx_duck_stop_va(void);

/* 0x92df40 - set_volume (audible action 1; ret 8). */
uint32_t isaac_sfx_duck_set_volume_va(void);

/* 0x92e050 - set_pitch (audible action 2; ret 8). */
uint32_t isaac_sfx_duck_set_pitch_va(void);

/* Conditional-branch census of the body: 3 (jb@0x92e638, je@0x92e641,
   je@0x92e65d). */
uint32_t isaac_sfx_duck_branches(void);

/* ---------- v31: 0x92e120 manager SetPan / 0x92e6e0 GetVolume /
   0x92e750 vector clear+dealloc (wave-23 F14 handoff; ABI 30 -> 31)

   The three in-band unclassified caller-bearing bodies left by the v29
   net audit and named by the v30 handoff. All three are thiscall on the
   SAME +0x2a324 manager receiver; all three re-use family laws by
   reference (the mutator NO_SAMPLES warn pair, the v2 per-voice
   probe/pending/act laws, the v2 pan island, the v4 block-free tail).

   SetPan 0x92e120..0x92e224 (ret 4; first ret 0x92e178; int3 pad
   0x92e224..0x92e22f; next body 0x92e230 = stop): 2 direct callers,
   0x7089be (id = 0x3f0; `movss xmm2,[esp+0x24]` immediately before)
   and 0x801d44 (the end of a divss/maxss/minss/mulss chain) - the pan
   argument arrives in XMM2 (spill `movss [ebp-4],xmm2` @ 0x92e134;
   reload @ 0x92e1d2; the island and the device funnel both use the
   reloaded spill slot; a callee cannot touch the caller's [ebp-4], so
   all three reads are equal). THE GATE LACKS THE id<0 FLOOR
   (`cmp ecx,count ; jge` - SIGNED upper bound only): negative ids fall
   through into the out-of-bounds entry read (defect pin,
   setpan_lacks_floor). The NO_SAMPLES warn (0x92e16a -> 0xa112c0,
   fmt 0xb7b1fc, level 1, arg id) and the silent disabled arm
   (`cmp byte [ebx+0x198],0 ; je`) match the v1 mutator shape.

   Per voice (bound re-read per iteration at 0x92e20f): no channel ->
   skip; pending -> vtbl[0x38] probe, active clears pending; vtbl[0x38]
   probe AGAIN on the reloaded channel (0x92e1ab); act = probe2 ||
   pending-after (the v2 is-playing per-voice law). On act the WRAPPER
   pan field [w+0x10] gets the value (store BEFORE the island); then
   the vtbl[0x60] channel-count probe; count <= 1 (SIGNED cmp eax,1 ;
   jle) -> device set-pan vtbl[0x50]; else the pan island (xorps +0.0
   @ 0x92e1dc ; ucomiss pan,+0.0 ; lahf ; test ah,0x44 ; jnp): SET iff
   pan is ORDERED EQUAL to +0.0 (i.e. +/-0.0; NaN and every nonzero
   ordered pan WARN) - decision-identical to the v2 wrapper island
   0x00a2ac20 (which loads .rdata +0.0 0xba9fe4 instead). The `test
   ah,0x44` parity reading: R = ah&0x44 is 0x40 (ZF, pan == +/-0.0)
   -> one bit -> PF' = 0 -> jnp taken -> SET; R = 0x44 (NaN) or 0
   (ordered nonzero) -> PF' = 1 -> fall -> WARN. WARN arm: log(level 4,
   fmt 0xb9c3e0, arg [channel+0xc]) @ 0x92e1f4 and NO device call; SET
   arm: push channel ; movss [esp],xmm2 (the reloaded pan) ; call
   vtbl[0x50]. 13 conditional branches; 4 indirect calls.

   GetVolume 0x92e6e0..0x92e74b (ret 4 @ 0x92e72c and @ 0x92e74b;
   int3 pad 0x92e74e..0x92e74f; next body 0x92e750): 7 direct callers
   (0x441eb4, 0x56fbc2, 0x56fc50, 0x5939f1, 0x59483b, 0x59488a,
   0x5a46bc) + imm32 refs 0x86db02 (binding push, sibling block of the
   v30 0x86daf1) and 0x8956aa (binder-tail slot-store, sibling of
   0x89564a). The getter law: id<0 (js) -> +0.0 SILENT; id>=count
   (jge SIGNED) -> +0.0 SILENT; voices==0 (UNSIGNED ja) -> the
   NO_SAMPLES warn (same 0xb7b1fc/level-1/id) THEN +0.0;
   enabled==0 (LOW-BYTE) -> +0.0 SILENT; then is_playing(this, id)
   (0x92e739 -> 0x92e560) with a LOW-BYTE al gate; false -> +0.0,
   true -> the entry base volume `fld [esi+0x194]` (x87 ST0 return;
   0x194 == SFX_ENTRY_OFF_BASE_VOLUME_194). 5 conditional branches.

   Vector clear 0x92e750..0x92e7be (single plain ret, 0 stack args;
   abort IAT stub 0x92e7bf (`call [0xb18894]`) between; next body
   0x92e7d0 = the v25 DECLARED destroy-range wrapper): inbound = 1
   direct call 0x951686 (`lea ecx,[ebx+0x2a324] ; call 0x92e750`, part
   of the same +0x2a324 manager teardown that calls 0x725190/0x40d040/
   0x7df450/0x9314c0/0x950f10) + 1 jmp tail 0x92cf30 (`e9 ...` stub
   right before PreloadSound), and the stub itself is jmp-targeted from
   the COLD arm 0xb0bb1d (`mov ecx,[ebp-0x10] ; add ecx,0x2a324 ;
   jmp 0x92cf30` - a chained tail, same pattern as the v29 entry-dtor
   cold arms). Semantics: begin == 0 (FULL-WORD test @0x92e755) ->
   NOTHING at all. Else destroy-range(ecx=begin, edx=end) FIRST
   (host walk; the call also carries a DEAD stack arg = begin that the
   plain-ret callee ignores and the caller pops at 0x92e76d), then
   size = entry_count(cap - begin) * 0x1b8 (the shared magic divide,
   re-multiplied - down-ROUNDED and 32-bit wrapped; the span is
   CAP-begin, the allocated extent), then the v4 element-block free
   tail (>= 0x1000 UNSIGNED jb -> plain; else back = [begin-4],
   size += 0x23, slack = (begin-back)-4 > 0x1f UNSIGNED ja -> abort
   [0xb18894], free(back, size')) - the existing
   isaac_sfx_block_free_plan law REUSED by reference - then the three
   zero dword stores begin := end := cap := 0 (0x92e7a8/ae/b5).
   The size law (isaac_sfx_clear_vec_size) and the composed plan
   (isaac_sfx_clear_vec_free_plan) are the new decisions. 3 conditional
   branches. */

enum {
  ISAAC_SFX_SETPAN_VA_92E120 = 0x0092e120u,     /* body root */
  ISAAC_SFX_SETPAN_FIRST_RET_VA_92E178 = 0x0092e178u, /* warn epilogue */
  ISAAC_SFX_SETPAN_END_VA_92E221 = 0x0092e221u, /* last ret (ret 4) */
  ISAAC_SFX_SETPAN_NEXT_VA_92E230 = 0x0092e230u, /* stop */
  ISAAC_SFX_SETPAN_CALLER_COUNT = 2,
  ISAAC_SFX_SETPAN_CALLER1_VA_7089BE = 0x007089beu,
  ISAAC_SFX_SETPAN_CALLER2_VA_801D44 = 0x00801d44u,
  ISAAC_SFX_SETPAN_ID_ARG_OFF_8 = 0x08u,
  ISAAC_SFX_SETPAN_STACK_ARGS_1 = 1,            /* ret 4; pan in XMM2 */
  ISAAC_SFX_SETPAN_PAN_SPILL_VA_92E134 = 0x0092e134u, /* movss [ebp-4],xmm2 */
  ISAAC_SFX_SETPAN_PAN_RELOAD_VA_92E1D2 = 0x0092e1d2u,
  ISAAC_SFX_SETPAN_PAN_STORE_SITE_92E1C4 = 0x0092e1c4u, /* wrapper[0x10] */
  ISAAC_SFX_SETPAN_PAN_FIELD_OFF_10 = 0x10u,   /* == SFX_VOICE_OFF_PAN_10 */
  ISAAC_SFX_SETPAN_PROBE_SLOT_38 = 0x38u,      /* vtbl activity probe x2 */
  ISAAC_SFX_SETPAN_COUNT_SLOT_60 = 0x60u,      /* vtbl channel count */
  ISAAC_SFX_SETPAN_SET_SLOT_50 = 0x50u,        /* vtbl device set-pan */
  ISAAC_SFX_SETPAN_WARN_SITE_92E1F4 = 0x0092e1f4u, /* pan-warn log call */
  ISAAC_SFX_SETPAN_WARN_LOG_LEVEL_4 = 4,       /* == SFX_PAN_WARN_LOG_LEVEL */
  ISAAC_SFX_SETPAN_WARN_STR_VA_B9C3E0 = 0x00b9c3e0u, /* == PAN_WARN_STR_VA */
  ISAAC_SFX_SETPAN_WARN_ARG_OFF_C = 0x0cu,     /* [channel+0xc] object field */
  ISAAC_SFX_SETPAN_NEUTRAL_XORPS_VA_92E1DC = 0x0092e1dcu, /* inlined +0.0 */
  ISAAC_SFX_SETPAN_LACKS_FLOOR = 1,            /* no id<0 test (defect) */
  ISAAC_SFX_SETPAN_VOICE_BOUND_RELOAD = 1,     /* 0x92e20f re-read */
  ISAAC_SFX_SETPAN_BRANCH_COUNT_13 = 13,
  ISAAC_SFX_GETVOLUME_VA_92E6E0 = 0x0092e6e0u, /* body root */
  ISAAC_SFX_GETVOLUME_FIRST_RET_VA_92E72C = 0x0092e72cu, /* +0.0 return */
  ISAAC_SFX_GETVOLUME_END_VA_92E74B = 0x0092e74bu, /* base-volume return */
  ISAAC_SFX_GETVOLUME_NEXT_VA_92E750 = 0x0092e750u, /* clear body */
  ISAAC_SFX_GETVOLUME_CALLER_COUNT = 7,
  ISAAC_SFX_GETVOLUME_IMM32_REF1_VA_86DB02 = 0x0086db02u, /* binding push */
  ISAAC_SFX_GETVOLUME_IMM32_REF2_VA_8956AA = 0x008956aau, /* binder store */
  ISAAC_SFX_GETVOLUME_ID_ARG_OFF_8 = 0x08u,
  ISAAC_SFX_GETVOLUME_STACK_ARGS_1 = 1,        /* ret 4 */
  ISAAC_SFX_GETVOLUME_ZERO_RET_VA_92E727 = 0x0092e727u, /* fldz tail */
  ISAAC_SFX_GETVOLUME_VALUE_RET_VA_92E742 = 0x0092e742u, /* fld [esi+0x194] */
  ISAAC_SFX_GETVOLUME_BASE_OFF_194 = 0x194u,   /* == SFX_ENTRY_OFF_BASE_VOLUME_194 */
  ISAAC_SFX_GETVOLUME_IS_PLAYING_SITE_92E739 = 0x0092e739u,
  ISAAC_SFX_GETVOLUME_BRANCH_COUNT_5 = 5,
  ISAAC_SFX_CLEARVEC_VA_92E750 = 0x0092e750u,  /* body root */
  ISAAC_SFX_CLEARVEC_END_VA_92E7BE = 0x0092e7beu, /* plain ret */
  ISAAC_SFX_CLEARVEC_NEXT_VA_92E7D0 = 0x0092e7d0u, /* destroy-range wrapper */
  ISAAC_SFX_CLEARVEC_CALLER_COUNT = 2,         /* call + jmp tail */
  ISAAC_SFX_CLEARVEC_CALL_SITE_VA_951686 = 0x00951686u,
  ISAAC_SFX_CLEARVEC_JMP_STUB_VA_92CF30 = 0x0092cf30u, /* jmp 0x92e750 */
  ISAAC_SFX_CLEARVEC_STUB_INBOUND_VA_B0BB1D = 0x00b0bb1du, /* cold arm */
  ISAAC_SFX_CLEARVEC_BEGIN_GATE_VA_92E755 = 0x0092e755u, /* test ecx,ecx */
  ISAAC_SFX_CLEARVEC_STACK_ARGS_0 = 0,         /* ret plain */
  ISAAC_SFX_CLEARVEC_DEAD_PUSH_ARG = 1,        /* push begin, callee ignores */
  ISAAC_SFX_CLEARVEC_DESTROY_SITE_92E75E = 0x0092e75eu,
  ISAAC_SFX_CLEARVEC_ZERO_STORES_3 = 3,        /* begin/end/cap dwords */
  ISAAC_SFX_CLEARVEC_BRANCH_COUNT_3 = 3,
};

typedef struct IsaacSfxSetPanVoicePlan {
  int32_t enter;               /* channel live && (probe2 || pending-after) */
  int32_t pending_clear;       /* byte store [w+9] := 0 ran */
  int32_t pan_stored;          /* wrapper[0x10] := pan (only on enter) */
  int32_t action;              /* SFX_PAN_ACTION_NONE / SET / WARN */
  int32_t warn_log_needed;     /* action == WARN: no device call */
  int32_t device_call_needed;  /* action == SET (vtbl[0x50]) */
  uint32_t stored_pan_bits;    /* the spill-slot dword, reloaded */
} IsaacSfxSetPanVoicePlan;

typedef struct IsaacSfxGetVolumePlan {
  int32_t gate_kind;           /* SFX_GATE_MISS / NO_SAMPLES / DISABLED /
                                  LIVE */
  int32_t warn_log_needed;     /* NO_SAMPLES only (0xb7b1fc, level 1, id) */
  int32_t is_playing_gate_ran; /* LIVE: the 0x92e739 call ran */
  int32_t returns_base_volume; /* LIVE && byte(playing_al): fld [0x194] */
  uint32_t base_volume_off;    /* 0x194 within the entry */
} IsaacSfxGetVolumePlan;

typedef struct IsaacSfxClearVecFreePlan {
  int32_t destroy_runs;        /* begin != 0: destroy-range ran first */
  uint32_t block_size;         /* entry_count(cap - begin) * 0x1b8 */
  int32_t uses_back_pointer;   /* size >= 0x1000 (UNSIGNED) */
  uint32_t free_size;          /* size (+ 0x23 on the big arm) */
  int32_t slack_checked;       /* big arm only */
  int32_t corrupt_fatal;       /* (begin-back)-4 > 0x1f (UNSIGNED): abort */
  int32_t zero_stores;         /* 3 dword stores when destroy_runs */
} IsaacSfxClearVecFreePlan;

/* ---------- v31 decls ---------- */

/* 0x92e120 - the manager SetPan body root. */
uint32_t isaac_sfx_setpan_va(void);

/* 0x92e178 - the NO_SAMPLES warn epilogue (first ret in the body). */
uint32_t isaac_sfx_setpan_first_ret_va(void);

/* 0x92e221 - the last ret (ret 4). */
uint32_t isaac_sfx_setpan_end_va(void);

/* 0x92e230 - the next body (stop). */
uint32_t isaac_sfx_setpan_next_va(void);

/* Raw .text E8/E9 census: 2 direct call sites (0x7089be, 0x801d44). */
uint32_t isaac_sfx_setpan_caller_count(void);

/* 0x7089be - caller 1: `movss xmm2,[esp+0x24]` then push id 0x3f0. */
uint32_t isaac_sfx_setpan_caller1_va(void);

/* 0x801d44 - caller 2: end of the divss/maxss/minss/mulss pan chain. */
uint32_t isaac_sfx_setpan_caller2_va(void);

/* 0x92e632 - id argument offset [ebp+8]. */
uint32_t isaac_sfx_setpan_id_arg_off(void);

/* `ret 4` - 1 stack arg; the pan argument rides in XMM2. */
uint32_t isaac_sfx_setpan_stack_args(void);

/* 0x92e134 - `movss [ebp-4],xmm2`: the pan spill (convention pin). */
uint32_t isaac_sfx_setpan_pan_spill_va(void);

/* 0x92e1d2 - `movss xmm2,[ebp-4]`: the pan reload before the island. */
uint32_t isaac_sfx_setpan_pan_reload_va(void);

/* 0x92e1c4 - the wrapper pan store `movss [esi+0x10],xmm0`. */
uint32_t isaac_sfx_setpan_pan_store_site(void);

/* 0x10 - the wrapper pan field (== SFX_VOICE_OFF_PAN_10). */
uint32_t isaac_sfx_setpan_pan_field_off(void);

/* 0x38 - the vtbl activity-probe slot (probed twice per voice). */
uint32_t isaac_sfx_setpan_probe_slot(void);

/* 0x60 - the vtbl channel-count probe (island input). */
uint32_t isaac_sfx_setpan_count_slot(void);

/* 0x50 - the vtbl device set-pan slot. */
uint32_t isaac_sfx_setpan_set_slot(void);

/* 0x92e1f4 - the pan-warn log call (level 4, fmt 0xb9c3e0). */
uint32_t isaac_sfx_setpan_warn_site(void);

/* 4 - the pan-warn log level (== SFX_PAN_WARN_LOG_LEVEL). */
uint32_t isaac_sfx_setpan_warn_level(void);

/* 0xb9c3e0 - the pan-warn format string (== SFX_PAN_WARN_STR_VA). */
uint32_t isaac_sfx_setpan_warn_str_va(void);

/* 0xc - the warn's extra arg: [channel+0xc], an object field. */
uint32_t isaac_sfx_setpan_warn_arg_off(void);

/* 0x92e1dc - the island's +0.0 is INLINED (xorps xmm0,xmm0), unlike the
   wrapper's .rdata 0xba9fe4 load. */
uint32_t isaac_sfx_setpan_neutral_xorps_va(void);

/* 1 - the entry gate has NO id<0 floor (`cmp id,count ; jge` SIGNED
   upper bound only). Negative ids fall through (defect, pinned). */
uint32_t isaac_sfx_setpan_lacks_floor(void);

/* 1 - the voice-loop bound re-reads [entry+0x190] every iteration. */
uint32_t isaac_sfx_setpan_voice_bound_reload(void);

/* Conditional-branch census of the body: 13. */
uint32_t isaac_sfx_setpan_branches(void);

/* Per-voice wrapper-arm dispatch: 1 when the voice reaches the pan store
   and the island (channel live && (probe2 || pending-after)). Byte
   gates: pending09 / probe1 / probe2 masked & 0xff inside. */
int32_t isaac_sfx_setpan_voice_enter(int32_t channel_null,
                                     uint32_t pending09,
                                     uint32_t probe1,
                                     uint32_t probe2);

/* 1 when the pending byte store [w+9] := 0 ran (first probe on a
   pending voice reported active). Byte gate on probe1. */
int32_t isaac_sfx_setpan_pending_clear(int32_t channel_null,
                                       uint32_t pending09,
                                       uint32_t probe1);

/* Island decision: SET when count <= 1 (SIGNED cmp eax,1 ; jle) or the
   pan (from its bits) is ordered-equal +0.0; WARN otherwise (every
   nonzero pan and NaN). Decision-identical to
   isaac_sfx_channel_pan_action(0, count, pan) - the v2 wrapper island
   re-verified on this body, consumed by reference (channel_null = 0:
   the null arm lives in the loop dispatch). */
int32_t isaac_sfx_setpan_pan_action(int32_t channel_count,
                                    uint32_t pan_bits);

/* Struct form. out may be null (no-op). stored_pan_bits is the spill
   dword; enter == 0 leaves action NONE with no stores. */
void isaac_sfx_setpan_voice_plan(int32_t channel_null,
                                 uint32_t pending09,
                                 uint32_t probe1,
                                 uint32_t probe2,
                                 int32_t channel_count,
                                 uint32_t pan_bits,
                                 IsaacSfxSetPanVoicePlan* out);

/* 0x92e6e0 - the GetVolume body root. */
uint32_t isaac_sfx_getvolume_va(void);

/* 0x92e72c - the +0.0 return (first ret). */
uint32_t isaac_sfx_getvolume_first_ret_va(void);

/* 0x92e74b - the base-volume return (last ret). */
uint32_t isaac_sfx_getvolume_end_va(void);

/* 0x92e750 - the next body (vector clear). */
uint32_t isaac_sfx_getvolume_next_va(void);

/* Raw .text E8/E9 census: 7 direct call sites. */
uint32_t isaac_sfx_getvolume_caller_count(void);

/* 0x86db02 - `push 0x92e6e0` (script-binding block). */
uint32_t isaac_sfx_getvolume_imm32_ref1_va(void);

/* 0x8956aa - binder tail `mov [eax],0x92e6e0` slot-store. */
uint32_t isaac_sfx_getvolume_imm32_ref2_va(void);

/* [ebp+8] - the id argument offset. */
uint32_t isaac_sfx_getvolume_id_arg_off(void);

/* `ret 4` - 1 stack arg; the value returns in x87 ST0. */
uint32_t isaac_sfx_getvolume_stack_args(void);

/* 0x92e727 - the `fldz` return tail (every zero path). */
uint32_t isaac_sfx_getvolume_zero_ret_va(void);

/* 0x92e742 - the `fld [esi+0x194]` return tail. */
uint32_t isaac_sfx_getvolume_value_ret_va(void);

/* 0x194 - the entry base-volume offset (== SFX_ENTRY_OFF_BASE_VOLUME_194). */
uint32_t isaac_sfx_getvolume_base_off(void);

/* 0x92e739 - the is_playing call site (-> 0x92e560, ret 4). */
uint32_t isaac_sfx_getvolume_is_playing_site(void);

/* Conditional-branch census of the body: 5. */
uint32_t isaac_sfx_getvolume_branches(void);

/* The getter decision: gate_kind (SFX_GATE_*; MISS and DISABLED are
   silent, NO_SAMPLES warns then returns +0.0), then the is_playing
   LOW-BYTE al gate picks +0.0 vs the entry base volume. */
void isaac_sfx_getvolume_plan(int32_t id,
                              int32_t span_bytes,
                              uint32_t voices_190,
                              uint32_t enabled_198,
                              uint32_t playing_al,
                              IsaacSfxGetVolumePlan* out);

/* 0x92e750 - the vector clear body root. */
uint32_t isaac_sfx_clearvec_va(void);

/* 0x92e7be - the plain ret (first and last). */
uint32_t isaac_sfx_clearvec_end_va(void);

/* 0x92e7d0 - the next body (destroy-range wrapper; the 0x92e7bf abort
   IAT stub sits between). */
uint32_t isaac_sfx_clearvec_next_va(void);

/* Raw .text E8/E9 census: 2 inbound (call 0x951686 + jmp tail
   0x92cf30). */
uint32_t isaac_sfx_clearvec_caller_count(void);

/* 0x951686 - the direct caller. */
uint32_t isaac_sfx_clearvec_call_site_va(void);

/* 0x92cf30 - the `jmp 0x92e750` stub (right before PreloadSound). */
uint32_t isaac_sfx_clearvec_jmp_stub_va(void);

/* 0xb0bb1d - the cold-arm `jmp 0x92cf30` (chained tail). */
uint32_t isaac_sfx_clearvec_stub_inbound_va(void);

/* 0x92e755 - the FULL-WORD begin==0 gate (`test ecx,ecx ; je`). */
uint32_t isaac_sfx_clearvec_begin_gate_va(void);

/* plain ret - 0 stack args (thiscall). */
uint32_t isaac_sfx_clearvec_stack_args(void);

/* 1 - the call to destroy-range carries a DEAD stack arg (begin) the
   plain-ret callee ignores; the caller pops it at 0x92e76d. */
uint32_t isaac_sfx_clearvec_dead_push_arg(void);

/* 0x92e75e - the destroy-range call site (-> 0x92ea80, host walk). */
uint32_t isaac_sfx_clearvec_destroy_site(void);

/* 3 - the zero dword stores begin := end := cap := 0 (0x92e7a8/ae/b5),
   only on the destroy path. */
uint32_t isaac_sfx_clearvec_zero_stores(void);

/* Conditional-branch census of the body: 3. */
uint32_t isaac_sfx_clearvec_branches(void);

/* size = entry_count(cap - begin) * 0x1b8: the shared divide, re-
   multiplied (32-bit wrap, down-rounded). The span is the ALLOCATED
   extent (CAP-begin). */
uint32_t isaac_sfx_clear_vec_size(uint32_t cap_bytes, uint32_t begin_bytes);

/* Struct form of the clear: destroy-range first, then the element-block
   free (the v4 block-free tail consumed by reference), then the three
   zero stores. begin_nonzero == 0 -> no-op everywhere. */
void isaac_sfx_clear_vec_free_plan(int32_t begin_nonzero,
                                   uint32_t cap_bytes,
                                   uint32_t begin_bytes,
                                   uint32_t ptr_minus_back,
                                   IsaacSfxClearVecFreePlan* out);

/* ---------- v32: the [entry+0x20] stream state machine (wave-25 F14
   census) — wrapper default ctor / release pair / SoundEffect ctor

   Whole-.text census (census-sfx-stream.py, notes sfx-v32-stream):
   the channel slot [entry+0x20+i*0x38] has EXACTLY five writer sites in
   four bodies (0xa2a9bc/0xa2aa29 dword-zero in the wrapper default ctor
   0xa2a990; 0xa2aee1 arg echo in the release 0xa2ae60; 0x8f2cd8 attach
   pair-swap; 0xa2ad39 copy-assign pair-swap) and zero direct stores
   anywhere else in .text. The stream object itself is opaque: zero
   stores through a channel pointer image-wide, one direct member read
   ([ch+0xc], the v31/v2 pan-warn pair — setpan_warn_arg_off). These
   laws pin the value STATE MACHINE so the 0x92e300 all-null no-op gates
   (v85/v88/v94/v95) reason BY REFERENCE:

     FRESH  (SoundEffect ctor 0x92cea0 -> __ehvec_ctor -> slot ctor
             0x92ce30 -> wrapper ctor 0xa2a990):   channel = 0 (x2)
     RESET  (0xa2abd0) / SLOT DTOR (0xa2ab40)
            (= release(0)):                         channel = 0
     ATTACH (0x8f2c90, via assign 0xa2add0 from
            SoundEffect::Load/Play allocate):       channel = device
                                                    handle [0xc5aaa0]
                                                    ->vtbl[0x24] product
     COPY-ASSIGN (0xa2ac90 swap):                   channel = clone[0]
   So the stream is RUNTIME-MUTABLE, not a singleton and not a constant
   BSS slot; the vtable slot VALUES of the 0x92e300 walk (+0x38/+0x44/
   +0x3c) cannot fold (record idx 1 stays NARROWED, 49 boundaries).

   Fresh PE dumps this unit: cpu-dump/00a2a990.txt (wrapper ctor),
   00a2ae60.txt (release), 0092cea0.txt (SoundEffect ctor),
   0092ce30.txt (voice slot ctor), 008f2c90.txt (attach). */

enum {
  ISAAC_SFX_CHANNEL_CTOR_VA_A2A990 = 0x00a2a990u,  /* wrapper default ctor */
  ISAAC_SFX_CHANNEL_CTOR_CHANNEL_STORE1_VA_A2A9BC = 0x00a2a9bcu, /* [w+0]=0 */
  ISAAC_SFX_CHANNEL_CTOR_CHANNEL_STORE2_VA_A2AA29 = 0x00a2aa29u, /* [w+0]=0 */
  ISAAC_SFX_CHANNEL_CTOR_ZERO_STORES_2 = 2,        /* the null-by-construction pin */
  ISAAC_SFX_CHANNEL_CTOR_SECONDARY_ALLOC_18 = 0x18u, /* heap alloc size */
  ISAAC_SFX_CHANNEL_CTOR_SECONDARY_VTABLE_B9C430 = 0x00b9c430u, /* .rdata vtable */
  ISAAC_SFX_CHANNEL_CTOR_SECONDARY_ZEROED_FIRST = 1, /* [w+4]=0 before the alloc */
  ISAAC_SFX_RELEASE_VA_A2AE60 = 0x00a2ae60u,       /* release / pair writer */
  ISAAC_SFX_RELEASE_CHANNEL_STORE_VA_A2AEE1 = 0x00a2aee1u, /* [w+0]=arg */
  ISAAC_SFX_RELEASE_SECONDARY_STORE_VA_A2AEE3 = 0x00a2aee3u, /* [w+4]=alloc */
  ISAAC_SFX_RELEASE_SECONDARY_ALLOC_18 = 0x18u,
  ISAAC_SFX_RELEASE_SECONDARY_VTABLE_B9C430 = 0x00b9c430u,
  ISAAC_SFX_RELEASE_ARG_ECHO_OFF_14 = 0x14u,       /* [new+0x14]=arg */
  ISAAC_SFX_RELEASE_PROBE_SLOT_0C = 0x0cu,         /* vtbl[0xc] on OLD secondary */
  ISAAC_SFX_RELEASE_HOOK_GLOBAL_C7F484 = 0x00c7f484u, /* .data fn-ptr gate */
  ISAAC_SFX_ENTRY_CTOR_VA_92CEA0 = 0x0092cea0u,    /* SoundEffect default ctor */
  ISAAC_SFX_ENTRY_CTOR_FRAME_END_STORE_VA_92CEBC = 0x0092cebcu, /* [e+4]=-1 */
  ISAAC_SFX_ENTRY_CTOR_FRAME_END_NEG1 = 0xffffffffu, /* default frame-end */
  ISAAC_SFX_ENTRY_CTOR_VOICES_0 = 0,               /* [e+0x190]=0 at build */
  ISAAC_SFX_ENTRY_CTOR_ENABLED_0 = 0,              /* [e+0x198]=0 at build */
  ISAAC_SFX_ENTRY_CTOR_STRING_CAP_0F = 0x0fu,      /* SSO cap 0xf */
  ISAAC_SFX_ENTRY_CTOR_VOICE_SLOTS_7 = 7,          /* __ehvec_ctor count */
  ISAAC_SFX_SLOT_CTOR_VA_92CE30 = 0x0092ce30u,     /* per-slot voice ctor */
  ISAAC_SFX_SLOT_CTOR_STREAM_BYTE_STORE_VA_92CE7F = 0x0092ce7fu, /* [w+0x18]=0 */
  ISAAC_SFX_SLOT_CTOR_FIELD_1C_STORE_VA_92CE85 = 0x0092ce85u, /* [w+0x1c]=1 */
  ISAAC_SFX_SLOT_CTOR_FIELD_1C_DEFAULT_1 = 1,
};

typedef struct IsaacSfxChannelCtorPlan {
  int32_t channel_00_after;      /* 0 — two explicit dword-zero stores */
  int32_t secondary_04_alloc;    /* 1 — host heap alloc(size 0x18) */
  uint32_t secondary_04_vtable;  /* 0xb9c430 — .rdata vtable of the pair object */
  int32_t loop_pending_08_after; /* word 0 → loop 0, pending 0 */
  int32_t flag_0a_after;         /* 0 */
  float volume_0c_after;         /* 1.0f (bits 0x3f800000) */
  float pan_10_after;            /* 0.0f */
  float pitch_14_after;          /* 1.0f (bits 0x3f800000) */
} IsaacSfxChannelCtorPlan;

typedef struct IsaacSfxChannelReleasePlan {
  int32_t channel_00_after;      /* == release_arg (full dword echo) */
  int32_t secondary_04_alloc;    /* 1 — fresh heap object (host) */
  uint32_t secondary_04_vtable;  /* 0xb9c430 */
  int32_t arg_echo_14;           /* the new object's +0x14 = release_arg */
  int32_t hook_probe_runs;       /* old secondary != 0 (FULL word) */
  int32_t hook_runs;             /* probe_runs && byte(probe) && hook_ptr */
} IsaacSfxChannelReleasePlan;

typedef struct IsaacSfxEntryCtorPlan {
  int32_t frame_end_04_after;    /* 0xffffffff — the -1 default stamp */
  int32_t voices_190_after;      /* 0 */
  int32_t enabled_198_after;     /* 0 */
  uint32_t entry_string_cap;     /* 0xf (SSO) */
  int32_t voice_slots;           /* 7 — __ehvec_ctor count */
  int32_t channels_null;         /* 7 — every wrapper ctor ran (channel 0) */
  int32_t stream_bytes_zero;     /* 7 — [w+0x18] := 0 per slot */
} IsaacSfxEntryCtorPlan;

/* Wrapper default ctor 0xa2a990 (NULL BY CONSTRUCTION): channel = 0
   (stores 0xa2a9bc/0xa2aa29), secondary = fresh 0x18 heap object with
   .rdata vtable 0xb9c430, then the shared constant pack. 0 inputs —
   the immutable construction state. out may be null (no-op). */
void isaac_sfx_channel_ctor_defaults(IsaacSfxChannelCtorPlan* out);

/* Release 0xa2ae60: [w+0x00] := release_arg (FULL dword echo @
   0xa2aee1 — the reset/slot-dtor/clear sites pass 0, so the slot stays
   null; the assign sites pass the runtime handle), [w+0x04] := fresh
   0x18 object (vtable 0xb9c430, arg echoed at +0x14), and the OLD
   secondary hook gate (old != 0, FULL word; vtbl[0xc] probe LOW-BYTE;
   hook ptr 0xc7f484 FULL word) — the v22 island-A gate shape by
   reference. out may be null (no-op). */
void isaac_sfx_channel_release_plan(uint32_t release_arg,
                                    uint32_t old_secondary_04,
                                    uint32_t probe_result,
                                    uint32_t hook_ptr,
                                    IsaacSfxChannelReleasePlan* out);

/* SoundEffect default ctor 0x92cea0: entry[0x04] := 0xffffffff (the -1
   frame-end DEFAULT — fresh entries already carry the sentinel, which
   is why StopAll 0x92e300 has NO `mov [entry+4],-1`), voices := 0,
   enabled := 0, entry string SSO (cap 0xf), and all seven voice slots
   constructed via 0x92ce30 -> 0xa2a990 (every channel null). 0 inputs.
   out may be null (no-op). */
void isaac_sfx_entry_ctor_defaults(IsaacSfxEntryCtorPlan* out);

/* ---------- v33: SoundEffect::Load (0x92cfb0) load-arm gates ----------
   (wave-26 F14; notes sfx-v33-load; census-sfx-load.py this unit)

   Verify-open: 0x92cfb0 = exact `__thiscall void SoundEffect::Load()`
   (47-B SoundEffects.zhl pattern re-derived this unit, 22 rel32
   callers incl. the 0x92cf40 wrapper @0x92cf8e). The body's pure
   decision layer was split in v3 and the residual islands landed v13/
   v22; this block pins the THREE missing standalone laws: the ENTRY
   GATE, the per-voice LOAD-ARM enum (the file-open/read decision) and
   the typed-host COLD-TAIL declaration (v29-net class, machine-pinned
   by the corrected census).

   Entry gate 0x92cfe0/0x92cfee: `cmp dword [esi+0x190],0 ; jbe
   0x92d10f` — UNSIGNED zero-voice check; the only skip value is 0
   (0x100/0xffffffff loop). SKIP still lands on the enabled:=1 tail
   (0x92d10f) — same tail as the loop exit.

   Load-arm 0x92d023..0x92d0c7 (per voice): FATAL (resolved size < 4,
   UNSIGNED borrow `cmp size,size-4 ; jb` -> 0x499950 — no stores, no
   frees), STREAM (the 4-byte ".ogg" suffix compare @0x92d052 returns 0
   -> al=1, the DEVICE ARM IS SKIPPED ENTIRELY), DEVICE (compare != 0
   -> [0xc5aaa0]->vtbl[0x24](&handle,path,0,0) + assign 0xa2add0 + the
   vtbl[0xc] LOW-BYTE probe + the 0xc7f484 hook, then al=0). The arm
   enum is the file-open/read decision: file_open_needed is 1 ONLY on
   DEVICE. The compare result is a FULL word; no byte gates in this
   block (the probe byte gate is the v22 law, uint32_t + & 0xff).

   Cold tails (typed-host, single-inbound per census): 0x92d132 abort
   IAT stub (call [0xb18894]) reached ONLY from the 0x92d0ea `ja`
   (big-alloc slack (ptr-back-4) > 0x1f UNSIGNED); 0x92d138 fatal
   (call 0x499950) reached ONLY from the 0x92d028 `jb` (size < 4);
   0x92d10f enable tail reached from exactly two edges (the 0x92cfee
   jbe + the 0x92d109 loop-exit fallthrough). Both tails declared
   typed-host since v3/v29 — now pinned. */

enum {
  ISAAC_SFX_LOAD_ENTRY_GATE_SKIP = 0, /* voices == 0 -> jbe 0x92d10f */
  ISAAC_SFX_LOAD_ENTRY_GATE_LOOP = 1, /* voices != 0 -> per-voice walk */
  ISAAC_SFX_LOAD_ARM_FATAL = 0,   /* size < 4 (unsigned borrow 0x92d023) */
  ISAAC_SFX_LOAD_ARM_STREAM = 1,  /* ".ogg" match -> al=1, device skipped */
  ISAAC_SFX_LOAD_ARM_DEVICE = 2,  /* mismatch -> vtbl[0x24] open + probe */
  ISAAC_SFX_LOAD_TAIL_ABORT_VA_92D132 = 0x0092d132u, /* abort IAT stub */
  ISAAC_SFX_LOAD_TAIL_FATAL_VA_92D138 = 0x0092d138u, /* fatal 0x499950 */
  ISAAC_SFX_LOAD_TAIL_ABORT_IAT_B18894 = 0x00b18894u, /* call [..] */
  ISAAC_SFX_LOAD_TAIL_FATAL_CALLEE_499950 = 0x00499950u,
  ISAAC_SFX_LOAD_TAIL_ABORT_SOURCE_D0EA = 0x0092d0eau, /* ja slack>0x1f */
  ISAAC_SFX_LOAD_TAIL_FATAL_SOURCE_D028 = 0x0092d028u, /* jb size<4 */
  ISAAC_SFX_LOAD_TAIL_ENABLE_VA_D10F = 0x0092d10fu,
  ISAAC_SFX_LOAD_TAIL_ENABLE_SOURCES_2 = 2, /* jbe 0x92cfee + 0x92d109 fall */
  ISAAC_SFX_LOAD_TAIL_COUNT_2 = 2,
};

typedef struct IsaacSfxLoadArmPlan {
  int32_t arm_kind;            /* FATAL(0) / STREAM(1) / DEVICE(2) */
  int32_t fatal;               /* 1 iff resolved_size < 4 (0x92d023) */
  int32_t ogg_match;           /* 1 iff the 4-byte compare returned 0 */
  int32_t file_open_needed;    /* 1 iff DEVICE (vtbl[0x24] open runs) */
  int32_t stream_byte_value;   /* al at 0x92d0c7: 0 fatal (no store),
                                  1 STREAM, 0 DEVICE */
  int32_t uses_heap_buffer;    /* capacity >= 0x10 (0x92d045 cmovae) */
  int32_t heap_free_needed;    /* !fatal && uses_heap_buffer */
  int32_t suffix_compare_needed; /* !fatal (0x92d052 runs) */
} IsaacSfxLoadArmPlan;

/* Entry gate 0x92cfe0/0x92cfee: 1 = LOOP, 0 = SKIP (unsigned jbe on
   the voices dword; 0 is the only skip value; skip still enables). */
int32_t isaac_sfx_load_entry_gate(uint32_t voices_190);

/* Per-voice load-arm decision 0x92d023..0x92d0c7 (composes the v3
   primitives; no duplicated arithmetic). out may be null (no-op). */
void isaac_sfx_load_arm_plan(uint32_t resolved_size,
                             uint32_t capacity,
                             int32_t suffix_compare_result,
                             IsaacSfxLoadArmPlan* out);

/* Typed-host cold-tail declaration (v29-net class; single-inbound per
   the corrected census; see the enum above for the pins). */
uint32_t isaac_sfx_load_tail_abort_va(void);
uint32_t isaac_sfx_load_tail_fatal_va(void);
uint32_t isaac_sfx_load_tail_abort_iat_va(void);
uint32_t isaac_sfx_load_tail_fatal_callee_va(void);
uint32_t isaac_sfx_load_tail_abort_source_va(void);
uint32_t isaac_sfx_load_tail_fatal_source_va(void);
uint32_t isaac_sfx_load_tail_enable_va(void);
uint32_t isaac_sfx_load_tail_enable_inbounds(void);
uint32_t isaac_sfx_load_tail_count(void);

/* ---------- v34: audio-wrapper 0xa2b1e0 suffix/arm gates ----------
   (wave-27 F14; notes sfx-v34-wrapper; census-sfx-wrapper.py)

   Verify-open: 0xa2b1e0 was UNOPENED in this family (zero references).
   It is vtable slot +0x28 of three manager-class vtables (0xb9c4d8 /
   0xba3068 / 0xba30ac), `ret 0x10` @0xa2b779, 98 jcc/call edges, 13 E8
   callees — the channel-pair OPEN wrapper: its "not initialized" arm
   builds the known 0x18 secondary (vtable 0xb9c430, ctor 0x40cc10),
   its loaded path virtual-dispatches slot +0x28 with the outer a4
   passed through on the stack, and its extension chain picks one of
   six sample/stream source objects by `.wav` / `.ogg` / `.org`.

   The suffix decision is made through the runtime-resolved audio-API
   slot 0xb18770 (20 flat-mem refs image-wide: 15 `call [0xb18770]`,
   4 `mov reg,[0xb18770]` + register call, 1 thunk 0xaf05d9
   `jmp [0xb18770]`; the slot file-encodes a .data descriptor and is
   ZERO at load — typed host, identity loader-resolved). Each stage
   calls fn(name, literal) and tests eax: NON-ZERO = "the literal is
   present in the name" -> that stage's arms run; ZERO = continue to
   the next literal. The ".ogg" literal 0xb7b1bc has EXACTLY TWO imm
   refs image-wide: 0x92d048 (Load's suffix compare, v3/v33) and
   0xa2b3e9 (this body) — the SHARED '.ogg' decision pin. Literals:
   0xb9c448 ".wav" / 0xb7b1bc ".ogg" / 0xb9c4b0 ".org"; logs:
   0xb9c478 "Unknown sound type '.%s'.\n" level 8 (0xa2b741 arm),
   0xb9c4b8 "Failed to open %s \"%s\"\n" level 1 with 'sample'
   0xb7b168 / 'stream' 0xb9c4d0 chosen by `test ebx,ebx ; cmovne`
   (error tail 0xa2b5c2).

   Gates (all byte-gates are uint32_t + & 0xff; NO uint8_t anywhere):
   - INIT GATE 0xa2b217/0xa2b231 `mov eax,[this+4] ; test al,1` (the
     low BYTE of the flags dword is read; 0x100 is NOT initialized).
   - BYTE GATE 0xa2b2e3 `cmp byte [ebp+0x14],0 ; jne 0xa2b347` — the
     a4 word's low byte forces the suffix chain (0x100 does NOT).
   - CHAIN GATE: the loaded path enters the suffix chain iff the
     vtbl28 result is 0 (FULL dword test 0xa2b2df) OR byte_gate(a4);
     else the normal-return path (adopt + hook, both host).
   - MODE dispatch 0xa2b360..0xa2b36a — FULL dword compares:
     mode==0 sample, mode==1 stream, else the error tail.
   - NAME COPY gate 0xa2b625 `test edi,edi ; jne copy` — NULL name
     skips strlen/alloc/strcpy/hash (0xa159d0 hash of local+0xc).

   Arm table (alloc size / ctor / .rdata vtable):
     WAV_SAMPLE  0x64   0xa9fa20 0xba2974   WAV_STREAM 0xa8 0xaa0110 0xba29e4
     OGG_SAMPLE  0x58   0xa9fa20 0xba2aa4   OGG_STREAM 0xc4 0xaa0110 0xba2b50
     ORG_SAMPLE  0x4c   0xa9fa20 0xba2bec   ORG_STREAM 0x20740 0xaa0110 0xba2c5c
     UNKNOWN     log 8 / 0xb9c478 (mode ignored) ; INVALID_MODE log 1 /
                 0xb9c4b8 (kind: mode!=0 -> 'stream' else 'sample').
   Each arm vtable has EXACTLY 2 imm refs image-wide: this body's
   arm-install + the class ctor (0xa7b60d 0xa7ba6d 0xa7bcfd 0xa7c1de
   0xa7cbdd 0xa7ce2e). All six arms funnel through release 0xa2ae60
   + adopt 0x8f2d20. The four hook-gate islands (0xa2b291/0xa2b317/
   0xa2b6bf/0xa2b714) are the v22 island-A shape BY REFERENCE. */

enum {
  ISAAC_SFX_WRAPPER_VA_A2B1E0 = 0x00a2b1e0u,  /* vtable slot +0x28 */
  ISAAC_SFX_WRAPPER_END_VA_A2B779 = 0x00a2b779u, /* ret 0x10 */
  ISAAC_SFX_WRAPPER_RET_IMM = 0x10,
  ISAAC_SFX_WRAPPER_BODY_EDGES = 98,          /* jcc/call census */
  ISAAC_SFX_WRAPPER_FNPTR_SLOT_B18770 = 0x00b18770u, /* runtime audio-API */
  ISAAC_SFX_WRAPPER_FNPTR_SLOT_PAIR_6C = 0x00b1876cu,
  ISAAC_SFX_WRAPPER_FNPTR_SITES = 20,         /* 15 call + 4 mov/call + thunk */
  ISAAC_SFX_WRAPPER_FNPTR_THUNK_AF05D9 = 0x00af05d9u, /* jmp [0xb18770] */
  ISAAC_SFX_WRAPPER_DIRECT_CALLERS = 0,       /* vtable-borne only */
  ISAAC_SFX_WRAPPER_VTABLE_SLOT = 0x28,
  ISAAC_SFX_WRAPPER_VTABLE_B9C4D8 = 0x00b9c4d8u,
  ISAAC_SFX_WRAPPER_VTABLE_BA3068 = 0x00ba3068u,
  ISAAC_SFX_WRAPPER_VTABLE_BA30AC = 0x00ba30acu,
  ISAAC_SFX_WRAPPER_VTABLE_SLOT_SITES = 3,
  ISAAC_SFX_WRAPPER_OFF_FLAGS_04 = 4,         /* [this+4] flags dword */
  ISAAC_SFX_WRAPPER_FLAG_BIT_INIT = 1,        /* test al,1 (LOW BYTE) */
  ISAAC_SFX_WRAPPER_INIT_GATE_SITES_2 = 2,    /* 0xa2b217 + 0xa2b231 */
  ISAAC_SFX_WRAPPER_WAV_LITERAL_VA = 0x00b9c448u,  /* ".wav" */
  ISAAC_SFX_WRAPPER_ORG_LITERAL_VA = 0x00b9c4b0u,  /* ".org" */
  ISAAC_SFX_WRAPPER_LIT_UNKNOWN_TYPE = 0x00b9c478u, /* level 8 */
  ISAAC_SFX_WRAPPER_LIT_FAILED_OPEN = 0x00b9c4b8u,  /* level 1 */
  ISAAC_SFX_WRAPPER_LIT_SAMPLE = 0x00b7b168u,  /* mode==0 error kind */
  ISAAC_SFX_WRAPPER_LIT_STREAM = 0x00b9c4d0u,  /* mode!=0 error kind */
  ISAAC_SFX_WRAPPER_LOG_LEVEL_UNKNOWN_TYPE = 8,
  ISAAC_SFX_WRAPPER_LOG_LEVEL_FAILED_OPEN = 1,
  ISAAC_SFX_WRAPPER_OGG_LITERAL_SHARE_SITES = 2, /* 0x92d048 + 0xa2b3e9 */
  ISAAC_SFX_WRAPPER_OGG_LITERAL_LOAD_SITE_D048 = 0x0092d048u,
  ISAAC_SFX_WRAPPER_OGG_LITERAL_WRAPPER_SITE_A2B3E9 = 0x00a2b3e9u,
  ISAAC_SFX_WRAPPER_HOOK_GATES = 4,           /* v22 island shape x4 */
  ISAAC_SFX_WRAPPER_SELF_DISPATCH_SITE_A2B2CF = 0x00a2b2cfu, /* [eax+0x28] */
  ISAAC_SFX_WRAPPER_SECONDARY_ALLOC_18 = 0x18u, /* init-arm alloc */
  ISAAC_SFX_WRAPPER_SECONDARY_CTOR_40CC10 = 0x0040cc10u,
  ISAAC_SFX_WRAPPER_SECONDARY_VTABLE_B9C430 = 0x00b9c430u, /* shares 0xa2a990 */
  ISAAC_SFX_WRAPPER_PAIR_MOVE_A2BD60_CALLERS = 1, /* only this body */
  /* arm selection enums */
  ISAAC_SFX_WRAPPER_MODE_SAMPLE = 0,          /* mode == 0 */
  ISAAC_SFX_WRAPPER_MODE_STREAM = 1,          /* mode == 1 */
  ISAAC_SFX_WRAPPER_MODE_OTHER = 2,           /* else (error tail) */
  ISAAC_SFX_WRAPPER_SUFFIX_WAV = 0,           /* stage-1 match first */
  ISAAC_SFX_WRAPPER_SUFFIX_OGG = 1,
  ISAAC_SFX_WRAPPER_SUFFIX_ORG = 2,
  ISAAC_SFX_WRAPPER_SUFFIX_NONE = 3,          /* all three compares 0 */
  ISAAC_SFX_WRAPPER_ARM_WAV_SAMPLE = 0,
  ISAAC_SFX_WRAPPER_ARM_WAV_STREAM = 1,
  ISAAC_SFX_WRAPPER_ARM_OGG_SAMPLE = 2,
  ISAAC_SFX_WRAPPER_ARM_OGG_STREAM = 3,
  ISAAC_SFX_WRAPPER_ARM_ORG_SAMPLE = 4,
  ISAAC_SFX_WRAPPER_ARM_ORG_STREAM = 5,
  ISAAC_SFX_WRAPPER_ARM_UNKNOWN = 6,          /* log 8 / 0xb9c478 */
  ISAAC_SFX_WRAPPER_ARM_INVALID_MODE = 7,     /* log 1 / 0xb9c4b8 */
  ISAAC_SFX_WRAPPER_ARM_COUNT = 8,
  /* per-arm host constants */
  ISAAC_SFX_WRAPPER_ARM_WAV_SAMPLE_ALLOC = 0x64u,    /* ctor 0xa9fa20 v 0xba2974 */
  ISAAC_SFX_WRAPPER_ARM_WAV_STREAM_ALLOC = 0xa8u,    /* ctor 0xaa0110 v 0xba29e4 */
  ISAAC_SFX_WRAPPER_ARM_OGG_SAMPLE_ALLOC = 0x58u,    /* ctor 0xa9fa20 v 0xba2aa4 */
  ISAAC_SFX_WRAPPER_ARM_OGG_STREAM_ALLOC = 0xc4u,    /* ctor 0xaa0110 v 0xba2b50 */
  ISAAC_SFX_WRAPPER_ARM_ORG_SAMPLE_ALLOC = 0x4cu,    /* ctor 0xa9fa20 v 0xba2bec */
  ISAAC_SFX_WRAPPER_ARM_ORG_STREAM_ALLOC = 0x20740u, /* ctor 0xaa0110 v 0xba2c5c */
  ISAAC_SFX_WRAPPER_CTOR_SAMPLE_A9FA20 = 0x00a9fa20u,
  ISAAC_SFX_WRAPPER_CTOR_STREAM_AA0110 = 0x00aa0110u,
  ISAAC_SFX_WRAPPER_VTABLE_WAV_SAMPLE_BA2974 = 0x00ba2974u,
  ISAAC_SFX_WRAPPER_VTABLE_WAV_STREAM_BA29E4 = 0x00ba29e4u,
  ISAAC_SFX_WRAPPER_VTABLE_OGG_SAMPLE_BAAAA4 = 0x00ba2aa4u,
  ISAAC_SFX_WRAPPER_VTABLE_OGG_STREAM_BA2B50 = 0x00ba2b50u,
  ISAAC_SFX_WRAPPER_VTABLE_ORG_SAMPLE_BA2BEC = 0x00ba2becu,
  ISAAC_SFX_WRAPPER_VTABLE_ORG_STREAM_BA2C5C = 0x00ba2c5cu,
};

typedef struct IsaacSfxWrapperArmPlan {
  int32_t arm;               /* ISAAC_SFX_WRAPPER_ARM_* (8 values) */
  int32_t suffix_kind;       /* WAV/OGG/ORG/NONE */
  int32_t mode_kind;         /* SAMPLE/STREAM/OTHER */
  int32_t valid_mode;        /* 1 iff mode in {0,1} */
  int32_t compare_stages;    /* 1/2/3/3 — compares executed before decide */
  int32_t alloc_needed;      /* 1 for the six construction arms */
  uint32_t alloc_size;       /* per-arm size (0 for UNKNOWN/INVALID_MODE) */
  uint32_t ctor_va;          /* per-arm source ctor (0 none) */
  uint32_t vtable_va;        /* per-arm .rdata vtable (0 none) */
  int32_t log_needed;        /* UNKNOWN or INVALID_MODE */
  uint32_t log_level;        /* 8 unknown-type / 1 failed-open */
  uint32_t log_format_va;    /* 0xb9c478 / 0xb9c4b8 */
  uint32_t log_kind_va;      /* 'sample'/'stream' literal (invalid mode) */
  int32_t name_copy_needed;  /* a2 != 0: strlen/alloc/strcpy run */
  int32_t hash_call_runs;    /* a2 != 0: 0xa159d0(local+0xc) -> local+0x10 */
} IsaacSfxWrapperArmPlan;

/* Init gate 0xa2b217/0xa2b231 `test al,1` on [this+4]: 1 iff the LOW
   BYTE of the flags dword has bit 0 set (0x100 -> 0; byte-gate). */
int32_t isaac_sfx_wrapper_init_gate(uint32_t flags);

/* Byte gate 0xa2b2e3 `cmp byte [ebp+0x14],0`: 1 iff (a4 & 0xff) != 0
   — the a4 word's low byte forces the suffix chain (0x100 -> 0). */
int32_t isaac_sfx_wrapper_byte_gate(uint32_t a4);

/* Chain gate: the loaded path enters the suffix chain iff the vtbl28
   result is 0 (FULL dword test 0xa2b2df) OR byte_gate(a4); else the
   normal-return path (0xa2b2e9). */
int32_t isaac_sfx_wrapper_chain_gate(uint32_t vtbl28_result, uint32_t a4);

/* Mode dispatch 0xa2b360..0xa2b36a: SAMPLE iff mode==0, STREAM iff
   mode==1, OTHER else (FULL dword compares; 0x100 is OTHER). */
int32_t isaac_sfx_wrapper_mode(int32_t mode);

/* The error tail's `test ebx,ebx ; cmovne` (0xa2b5ff): the log kind
   literal — mode != 0 -> 0xb9c4d0 "stream", else 0xb7b168 "sample". */
uint32_t isaac_sfx_wrapper_mode_log_kind(int32_t mode);

/* The fn-ptr compare's decision bit (0xa2b358 test eax,eax ; je
   next): 1 iff the result is NON-ZERO — "the literal is present in
   the name". Zero continues to the next stage (or the unknown arm). */
int32_t isaac_sfx_wrapper_suffix_match(int32_t compare_result);

/* Stage chain: WAV iff has_wav (stage 1 dispatches BEFORE the .ogg
   compare runs), else OGG iff has_ogg, else ORG iff has_org, else
   NONE (0xa2b741 unknown arm). Rows with several bits set resolve to
   the FIRST non-zero stage. */
int32_t isaac_sfx_wrapper_suffix_kind(uint32_t has_wav,
                                      uint32_t has_ogg,
                                      uint32_t has_org);

/* The eight-way arm: suffix_kind x mode, UNKNOWN ignores mode,
   INVALID_MODE when mode not in {0,1} at the reached stage. */
int32_t isaac_sfx_wrapper_arm(uint32_t has_wav,
                              uint32_t has_ogg,
                              uint32_t has_org,
                              int32_t mode);

/* Full arm plan (see the struct; every byte gate is uint32_t & 0xff;
   the v22 hook islands are consumed by reference, not re-derived).
   out may be null (no-op). */
void isaac_sfx_wrapper_arm_plan(uint32_t has_wav,
                                uint32_t has_ogg,
                                uint32_t has_org,
                                int32_t mode,
                                uint32_t name,
                                IsaacSfxWrapperArmPlan* out);

/* Name-copy gate 0xa2b625 `test edi,edi ; jne copy`: 1 iff name != 0
   (NULL skips strlen/alloc/strcpy and the 0xa159d0 hash call). */
int32_t isaac_sfx_wrapper_name_copy_needed(uint32_t name);

/* Census pins (corrected tooling, census-sfx-wrapper.py). */
uint32_t isaac_sfx_wrapper_va(void);
uint32_t isaac_sfx_wrapper_ret_imm(void);
uint32_t isaac_sfx_wrapper_body_edges(void);
uint32_t isaac_sfx_wrapper_direct_callers(void);
uint32_t isaac_sfx_wrapper_vtable_slot_sites(void);
uint32_t isaac_sfx_wrapper_fnptr_sites(void);
uint32_t isaac_sfx_wrapper_fnptr_thunk_va(void);
uint32_t isaac_sfx_wrapper_ogg_literal_share_sites(void);
uint32_t isaac_sfx_wrapper_hook_gates(void);
uint32_t isaac_sfx_wrapper_pair_move_callers(void);

/* ---------- v35: audio-wrapper cluster rest ----------
   (wave-28 F11; notes sfx-v35-cluster; census-sfx-cluster.py)

   The v34 unit landed slot +0x28 (0xa2b1e0); this block lands the
   SIBLING slot methods of the same three manager vtables (0xb9c4d8 /
   0xba3068 / 0xba30ac) plus the shared flag-bit family:

     slot +0x04  0xa2af00  dtor wrapper  (BYTE-gated free, size 0x34)
     slot +0x08  0xa2afd0  hook install  (flag bit0 SET, hook := 0xa2bb10)
     slot +0x0c  0xa2b000  hook clear    (flag bit0 CLEAR, hook := 0)
     slot +0x10  0xa2b050  collect walk  (entry gate + probe keep)
     slot +0x14  0xa2b180  vtbl[0x24] forwarder, const arg 0
     slot +0x18  0xa2b1a0  vtbl[0x24] forwarder, const arg 1
     slot +0x1c  0xa2b1c0  flag bit1 SET
     slot +0x20  0xa2b1d0  flag bit1 CLEAR
     slot +0x24  0xa135c0  flag bit1 GETTER (flag family head)
     flag family: 0xa135d0 bit2 set/clear BYTE-gated, 0xa13600 bit2 get,
                  0xa13610 bit3 set/clear, 0xa13640 bit3 get,
                  0xa13650 bit4 set/clear, 0xa13680 bit4 get
     slot +0x2c  0xa2b7f0  map find (result != end gate)
     slot +0x30  0xa2b990  init-gated map walk (v34 init gate reuse)

   Census (corrected tooling, census-sfx-cluster.py): ALL 17 bodies have
   0 E8 callers and 0 imm32 address-taken refs image-wide — the caller
   surface is vtable-borne. The flag-bit family is SHARED by six vtable
   rows: the three manager rows (0xb9c4d8 slot +0x24, 0xba3068 slot
   +0x24, 0xba30ac slot +0x24) and three class rows (0xb81a84 /
   0xb82468 / 0xb82638 at slots +0x04..+0x1c). The attach-hook global
   0xc7f484 has EXACTLY two WRITE sites image-wide: 0xa2afeb (install,
   value 0xa2bb10) and 0xa2b004 (clear, value 0) — every other 0xc7f484
   reference is a read (the v22 islands consume the pointer).

   The manager flags dword at [this+4] is the SAME word the v34 init
   gate tests (`test al,1`): the cluster mutators write bits 0 (hook
   install/clear) and 1 (0xa2b1c0/0xa2b1d0), the getters read bits
   1..4, the BYTE-gated setters write bits 2..4, and the 0xa2b050 walk
   entry gate needs bit0 SET and bit1 CLEAR (both byte reads).

   Byte-gate discipline: every machine byte read is uint32_t + & 0xff
   (NO uint8_t); full-dword tests stay full-dword (map found gate). */

enum {
  ISAAC_SFX_CLUSTER_DTOR_WRAPPER_VA = 0x00a2af00u,   /* slot +0x04 */
  ISAAC_SFX_CLUSTER_HOOK_INSTALL_VA = 0x00a2afd0u,   /* slot +0x08 */
  ISAAC_SFX_CLUSTER_HOOK_CLEAR_VA = 0x00a2b000u,     /* slot +0x0c */
  ISAAC_SFX_CLUSTER_WALK_VA = 0x00a2b050u,           /* slot +0x10 */
  ISAAC_SFX_CLUSTER_FORWARD0_VA = 0x00a2b180u,       /* slot +0x14 */
  ISAAC_SFX_CLUSTER_FORWARD1_VA = 0x00a2b1a0u,       /* slot +0x18 */
  ISAAC_SFX_CLUSTER_FLAG_SET1_VA = 0x00a2b1c0u,      /* slot +0x1c */
  ISAAC_SFX_CLUSTER_FLAG_CLEAR1_VA = 0x00a2b1d0u,    /* slot +0x20 */
  ISAAC_SFX_FLAG_GET1_VA = 0x00a135c0u,              /* slot +0x24 */
  ISAAC_SFX_FLAG_SET2_VA = 0x00a135d0u,
  ISAAC_SFX_FLAG_GET2_VA = 0x00a13600u,
  ISAAC_SFX_FLAG_SET3_VA = 0x00a13610u,
  ISAAC_SFX_FLAG_GET3_VA = 0x00a13640u,
  ISAAC_SFX_FLAG_SET4_VA = 0x00a13650u,
  ISAAC_SFX_FLAG_GET4_VA = 0x00a13680u,
  ISAAC_SFX_CLUSTER_MAP_VA = 0x00a2b7f0u,            /* slot +0x2c */
  ISAAC_SFX_CLUSTER_INIT_WALK_VA = 0x00a2b990u,      /* slot +0x30 */
  ISAAC_SFX_CLUSTER_BODY_COUNT = 17,
  ISAAC_SFX_CLUSTER_DIRECT_CALLERS = 0,
  ISAAC_SFX_FLAG_FAMILY_VTABLE_ROWS = 6,     /* 3 manager + 3 class */
  ISAAC_SFX_HOOK_GLOBAL = 0x00c7f484u,       /* the v22 attach hook */
  ISAAC_SFX_HOOK_INSTALL_TARGET = 0x00a2bb10u,  /* install writes this */
  ISAAC_SFX_HOOK_WRITE_SITES = 2,            /* 0xa2afeb + 0xa2b004 */
  ISAAC_SFX_HOOK_INSTALL_SITE = 0x00a2afebu,
  ISAAC_SFX_HOOK_CLEAR_SITE = 0x00a2b004u,
  ISAAC_SFX_DTOR_FREE_SIZE_34 = 0x34u,       /* free(this, 0x34) */
  ISAAC_SFX_DTOR_FREE_GATE_SITE = 0x00a2af0bu, /* test byte [ebp+8],1 */
  ISAAC_SFX_WRAPPER_FORWARDER_RET_IMM = 0x0cu,  /* ret 0xc */
  ISAAC_SFX_WALK_ENTRY_BIT0 = 1u,            /* needs bit0 SET */
  ISAAC_SFX_WALK_ENTRY_BIT1 = 2u,            /* needs bit1 CLEAR */
  ISAAC_SFX_WALK_BOUND_RELOAD = 1,           /* [eax+0x20] re-read */
  ISAAC_SFX_MAP_FOUND_BODIES = 2,            /* 0xa2b7f0 + 0xa2b990 */
  ISAAC_SFX_INIT_GATE_BODY_SITES = 3,        /* a2b217/a2b231 + a2b9b8 */
  ISAAC_SFX_INIT_GATE_WALK_SITE = 0x00a2b9b8u, /* 0xa2b990 reuses v34 */
};

typedef struct IsaacSfxHookInstallPlan {
  uint32_t flags_after;   /* flags | 1 (bit0 SET @0xa2afe5) */
  uint32_t hook_value;    /* 0xa2bb10 (install globals @0xa2afeb) */
  int32_t returns_one;    /* mov al,1 @0xa2afe9 */
} IsaacSfxHookInstallPlan;

typedef struct IsaacSfxHookClearPlan {
  uint32_t flags_after;   /* flags & ~1 (bit0 CLEAR @0xa2b040) */
  uint32_t hook_value;    /* 0 (clear globals @0xa2b004) */
} IsaacSfxHookClearPlan;

/* Flag-bit family (getters 0xa135c0/0xa13600/0xa13640/0xa13680:
   `mov eax,[ecx+4] ; shr eax,imm ; and al,1` — FULL dword shift, the
   `and al,1` is the machine's return width, NOT a byte gate). */
int32_t isaac_sfx_flag_bit_get(uint32_t flags, uint32_t bit);

/* BYTE-gated setters 0xa135d0/0xa13610/0xa13650: `cmp byte [ebp+8],0
   ; je clear` then bts/btr — set iff (arg & 0xff) != 0 (0x100 -> 0
   -> CLEAR arm), clear iff the low byte is zero. */
int32_t isaac_sfx_flag_bit_set(uint32_t flags, uint32_t bit,
                               uint32_t arg);

/* Unconditional bit1 ops on the manager flags dword (0xa2b1c0
   `or dword [ecx+4],2` / 0xa2b1d0 `and dword [ecx+4],0xfffffffd`). */
uint32_t isaac_sfx_manager_flag_set1(uint32_t flags);
uint32_t isaac_sfx_manager_flag_clear1(uint32_t flags);

/* Hook install 0xa2afd0: flags bit0 SET + hook := 0xa2bb10 + return 1
   (the vtbl[0x4] calls before the stores are host). Hook clear
   0xa2b000: hook := 0 + flags bit0 CLEAR (list clear + vtbl[0x8]
   host). These are the ONLY two hook-global write sites image-wide. */
void isaac_sfx_wrapper_hook_install_plan(uint32_t flags,
                                         IsaacSfxHookInstallPlan* out);
void isaac_sfx_wrapper_hook_clear_plan(uint32_t flags,
                                       IsaacSfxHookClearPlan* out);

/* Dtor wrapper 0xa2af00 `test byte [ebp+8],1 ; je skip`: the scalar-
   deleting-dtor free runs iff bit0 of the arg's LOW BYTE is set
   (0x100 -> 0 -> no free); free size 0x34. */
int32_t isaac_sfx_dtor_free_gate(uint32_t arg);

/* Walk 0xa2b050 entry gate 0xa2b080/0xa2b088 `test al,1 ; je skip` +
   `test al,2 ; jne skip`: enter iff (flags&0xff) has bit0 SET and
   bit1 CLEAR — both BYTE reads of the flags dword. */
int32_t isaac_sfx_walk_entry_gate(uint32_t flags);

/* Walk per-element probe 0xa2b0d9 `test al,al ; je skip`: collect the
   element iff the vtbl[0x74] probe result's LOW BYTE is non-zero. */
int32_t isaac_sfx_walk_probe_keep(uint32_t probe_al);

/* Forwarders 0xa2b180/0xa2b1a0: vtbl[0x24] with a CONSTANT argument
   (0 / 1), then `mov eax,[ebp+8]` echo. The constant is the law; the
   call is host. */
int32_t isaac_sfx_wrapper_forward0_const(void);
int32_t isaac_sfx_wrapper_forward1_const(void);

/* Map find gate 0xa2b853 / 0xa2b9fe `cmp eax,[esi+8] ; je` — the map
   lookup result equals the stored end sentinel -> NOT FOUND; any
   other value (FULL dword) -> found. */
int32_t isaac_sfx_map_found(uint32_t result, uint32_t end);

/* Census pins (corrected tooling; see notes sfx-v35-cluster). */
uint32_t isaac_sfx_cluster_direct_callers(void);
uint32_t isaac_sfx_cluster_body_count(void);
uint32_t isaac_sfx_flag_family_vtable_rows(void);
uint32_t isaac_sfx_hook_write_sites(void);
uint32_t isaac_sfx_hook_install_target(void);
uint32_t isaac_sfx_dtor_free_size(void);
uint32_t isaac_sfx_walk_bound_reload(void);
uint32_t isaac_sfx_init_gate_body_sites(void);

/* ---------- v36: map find/construct 0xa2b7f0 + init walk 0xa2b990
   full-body peels (wave-29 F4; notes sfx-v36-mapwalk;
   fresh dumps cpu-dump/00a2b7f0.txt + 00a2b990.txt)

   Full-body decode of the last two v35-cluster bodies. Both keep every
   vtbl slot call, the hash 0xa159d0, the map find 0xa12280, the adopt
   0x8f2d20, the alloc 0xa0f4c0, the secondary ctor 0x40cc10, the walk
   advance 0x414a80, the remove 0x415d20, the free 0xaef15c and the
   logger 0xa112c0 as host edges; the DECISION layer is translated.

   --- 0xa2b7f0 (map find/construct, slot +0x2c of the three manager
   vtables 0xb9c4d8/0xba3068/0xba30ac) ---------------------------------
   ret 0xc at 0xa2b98d -> THREE stack args (the v35 NOTES' "ret 4"
   came from the truncated 129-insn dump; the fresh full-body dump
   proves ret 0xc). arg1 [ebp+8] is echoed back (`mov eax,esi`); arg2
   [ebp+0xc] is the name, hashed IN PLACE by 0xa159d0 then handed to
   the map find; arg3 [ebp+0x10] is NEVER referenced (dead arg pin).
   Always (no early exit): vtbl[0xc](&this[0x10], -1), hash1(arg2),
   map find(&this[8], &hash, &pair0), vtbl[0x10](&this[0x10]).
   FOUND arm (find result != [this+8], the v35 map-found law): adopt1
   (node+0x14 -> the 8-byte pair at [ebp-0x24]/[ebp-0x20], host), then
   island3 probes [ebp-0x20] (pair1): hook runs iff pair1 != 0 AND the
   vtbl[0xc] byte result != 0 AND hook != 0 -> hook(&pair0); then
   adopt2(arg1 <- adopt1 result). CONSTRUCT arm: alloc 0x18; iff
   non-NULL: ctor 0x40cc10, [obj+0] := 0xb9c430 (the secondary
   vtable), [obj+0x14] := 0; island1 probes the [ebp-0x18] slot which
   is ZERO-INTIALIZED and never written before the island -> hook can
   NEVER run there (dead-by-construction pin); then adopt2(arg1 <-
   secondary). The ebx bit dance (1/2 -> |4 -> &~2 / &~1) chooses
   island2 on construct and island3 on found; both arms end with
   ebx == 4 (a pure control-flow pin, the [ebp-0x10] state slot is
   never read again).

   --- 0xa2b990 (init walk, slot +0x30 of 0xb9c4d8 ONLY — the
   secondary manager rows carry a foreign 0xa7d790 there) ---------------
   ret 4 at 0xa2ba84 -> ONE stack arg, arg1 [ebp+8]. Gate 1 (site
   0xa2b9b8, the v35 init-gate law at its second body): byte bit0 of
   [this+4] NOT set -> warn log 0xa112c0(level 0x10, fmt 0xb9c450),
   then the body CONTINUES (no early exit). Gate 2: arg1 == 0 (FULL
   dword test, site 0xa2b9d0) -> the ENTIRE walk is skipped INCLUDING
   the tail vtbl[0x10] call. Else: vtbl[0xc](&this[0x10], -1); key :=
   [arg1+0x10]; map find(&this[8], &key, &[ebp+8]) with the result
   landing in the ARG slot; find result == [this+8] -> tail. Loop
   (site 0xa2ba03): node = head; member = [node+0x14]; member->[0x10]
   == key (FULL dword) else EXIT; member == arg1 (FULL dword) -> FOUND
   arm; else advance 0x414a80 (host) and loop while head != sentinel.
   FOUND arm: remove 0x415d20 (host) -> freed node; the island probes
   [node+0x18]: hook runs iff node_b != 0 AND vtbl[0xc] byte result
   != 0 AND hook != 0 -> hook(&node+0x14); then free(node, 0x1c)
   UNCONDITIONAL. Every non-NULL path ends with tail
   vtbl[0x10](&this[0x10]).

   Byte-gate discipline unchanged: every machine byte read is
   uint32_t + & 0xff; the arg1/arg2/node/member/key compares are FULL
   dword. Step model: the walk iteration is a pure step function
   (node==sentinel -> MISS; member key != key -> MISMATCH; member ==
   arg1 -> FOUND; else ADVANCE with a host 0x414a80 call). */

enum {
  ISAAC_SFX_MAP_CONSTRUCT_ARM_FOUND = 0,        /* adopt arm (node hit) */
  ISAAC_SFX_MAP_CONSTRUCT_ARM_CONSTRUCT = 1,    /* alloc + ctor arm */
  ISAAC_SFX_INIT_WALK_STEP_MISS = 0,            /* sentinel head -> tail */
  ISAAC_SFX_INIT_WALK_STEP_FOUND = 1,           /* member == arg1 */
  ISAAC_SFX_INIT_WALK_STEP_ADVANCE = 2,         /* 0x414a80 advances */
  ISAAC_SFX_INIT_WALK_STEP_MISMATCH = 3,        /* member key != key */
  ISAAC_SFX_MAP_CONSTRUCT_RET_IMM = 0x0cu,      /* ret 0xc @0xa2b98d */
  ISAAC_SFX_MAP_CONSTRUCT_STACK_ARGS = 3,
  ISAAC_SFX_MAP_CONSTRUCT_ARG3_DEAD = 1,        /* [ebp+0x10] never read */
  ISAAC_SFX_MAP_CONSTRUCT_VTABLE_ROWS = 3,      /* b9c4d8/ba3068/ba30ac */
  ISAAC_SFX_MAP_CONSTRUCT_SEH_HANDLER_VA = 0x00b1220fu, /* push @0xa2b7f5 */
  ISAAC_SFX_MAP_CONSTRUCT_ALLOC_SIZE = 0x18u,   /* 0xa2b875 push 0x18 */
  ISAAC_SFX_MAP_CONSTRUCT_NODE_MEMBER_OFF = 0x14u, /* adopt1 arg offset */
  ISAAC_SFX_MAP_CONSTRUCT_SECONDARY_VTABLE_VA = 0x00b9c430u, /* [obj+0] */
  ISAAC_SFX_MAP_CONSTRUCT_HASH_SITE = 0x00a2b82fu,  /* -> 0xa159d0 */
  ISAAC_SFX_MAP_CONSTRUCT_FIND_SITE = 0x00a2b842u,  /* -> 0xa12280 */
  ISAAC_SFX_MAP_CONSTRUCT_ADOPT1_SITE = 0x00a2b85fu, /* -> 0x8f2d20 */
  ISAAC_SFX_MAP_CONSTRUCT_ALLOC_SITE = 0x00a2b885u,  /* -> 0xa0f4c0 */
  ISAAC_SFX_MAP_CONSTRUCT_CTOR_SITE = 0x00a2b89fu,   /* -> 0x40cc10 */
  ISAAC_SFX_MAP_CONSTRUCT_ADOPT2_SITE = 0x00a2b8ffu, /* -> 0x8f2d20 */
  ISAAC_SFX_MAP_CONSTRUCT_VTABLE_STORE_SITE = 0x00a2b8a4u,
  ISAAC_SFX_MAP_CONSTRUCT_FIELD14_STORE_SITE = 0x00a2b8aau,
  ISAAC_SFX_MAP_CONSTRUCT_HASH_IN_PLACE_SITE = 0x00a2b834u,
  ISAAC_SFX_MAP_ISLAND1_SITE = 0x00a2b8b9u,      /* zero slot, never fires */
  ISAAC_SFX_MAP_ISLAND2_SITE = 0x00a2b919u,
  ISAAC_SFX_MAP_ISLAND3_SITE = 0x00a2b956u,
  ISAAC_SFX_INIT_WALK_RET_IMM = 4,               /* ret 4 @0xa2ba84 */
  ISAAC_SFX_INIT_WALK_STACK_ARGS = 1,
  ISAAC_SFX_INIT_WALK_VTABLE_ROWS = 1,           /* b9c4d8 only (slot+0x30) */
  ISAAC_SFX_INIT_WALK_SEH_HANDLER_VA = 0x00af0eb0u, /* push @0xa2b995 */
  ISAAC_SFX_INIT_WALK_WARN_SITE = 0x00a2b9beu,   /* push 0xb9c450; push 0x10 */
  ISAAC_SFX_INIT_WALK_WARN_FMT_VA = 0x00b9c450u,
  ISAAC_SFX_INIT_WALK_WARN_LEVEL = 0x10u,
  ISAAC_SFX_INIT_WALK_WARN_STACK_ARGS = 2,       /* add esp,8 @0xa2b9ca */
  ISAAC_SFX_INIT_WALK_MEMBER_OFF = 0x14u,        /* [node+0x14] member */
  ISAAC_SFX_INIT_WALK_KEY_OFF = 0x10u,           /* [member+0x10] / [arg1+0x10] */
  ISAAC_SFX_INIT_WALK_NODE_B_OFF = 0x18u,        /* island probe target */
  ISAAC_SFX_INIT_WALK_FREE_SIZE = 0x1cu,         /* push 0x1c @0xa2ba5a */
  ISAAC_SFX_INIT_WALK_ADVANCE_VA = 0x00414a80u,  /* host chain advance */
  ISAAC_SFX_INIT_WALK_REMOVE_VA = 0x00415d20u,   /* host map remove */
  ISAAC_SFX_INIT_WALK_FIND_SITE = 0x00a2b9f6u,   /* -> 0xa12280 */
  ISAAC_SFX_INIT_WALK_ISLAND_SITE = 0x00a2ba39u, /* probes [node+0x18] */
  ISAAC_SFX_INIT_WALK_FREE_SITE = 0x00a2ba64u,   /* -> 0xaef15c */
  ISAAC_SFX_INIT_WALK_TAIL_SITE = 0x00a2ba6cu,   /* vtbl[0x10] tail */
};

typedef struct IsaacSfxMapConstructPlan {
  uint32_t arm;                 /* FOUND / CONSTRUCT */
  uint32_t found;               /* map_found(find_result, map_end) */
  uint32_t adopt_calls;         /* 2 found / 1 construct */
  uint32_t alloc_call_runs;     /* construct arm only */
  uint32_t ctor_call_runs;      /* construct && alloc non-NULL */
  uint32_t secondary_vtable_va; /* 0xb9c430 store, ctor arms only */
  uint32_t secondary_field14_zero; /* [obj+0x14] := 0, ctor arms only */
  uint32_t island1_hook_runs;   /* ALWAYS 0 (zero-init probe slot) */
  uint32_t island2_hook_runs;   /* construct arm, byte-gated */
  uint32_t island3_hook_runs;   /* found arm, byte-gated */
  uint32_t returns_arg1;        /* mov eax,esi echo */
  uint32_t ret_imm;             /* 0xc */
  uint32_t stack_args;          /* 3 */
  uint32_t arg3_dead;           /* [ebp+0x10] never referenced */
  uint32_t alloc_size;          /* 0x18 */
  uint32_t node_member_offset;  /* 0x14 */
} IsaacSfxMapConstructPlan;

typedef struct IsaacSfxInitWalkPlan {
  uint32_t warn_needed;         /* init-gate byte bit0 clear */
  uint32_t body_runs;           /* arg1 != 0 (FULL dword) */
  uint32_t step;                /* MISS / FOUND / ADVANCE / MISMATCH */
  uint32_t found_arm_runs;      /* step == FOUND */
  uint32_t advance_calls;       /* step == ADVANCE (0x414a80 host) */
  uint32_t remove_call_runs;    /* == found_arm_runs (0x415d20 host) */
  uint32_t free_runs;           /* == found_arm_runs (0xaef15c host) */
  uint32_t free_size;           /* 0x1c */
  uint32_t island_hook_runs;    /* found arm, byte-gated */
  uint32_t tail_sub10_call_runs; /* vtbl[0x10] tail, == body_runs */
  uint32_t member_offset;       /* 0x14 */
  uint32_t key_offset_in_member; /* 0x10 */
  uint32_t key_offset_in_arg;   /* 0x10 */
  uint32_t node_b_offset;       /* 0x18 */
  uint32_t ret_imm;             /* 4 */
  uint32_t stack_args;          /* 1 */
  uint32_t warn_level;          /* 0x10 */
  uint32_t warn_fmt_va;         /* 0xb9c450 */
  uint32_t warn_stack_args;     /* 2 */
} IsaacSfxInitWalkPlan;

/* Init gate at its second body (site 0xa2b9b8, `test byte [edi+4],1
   ; jne skip`): the "not initialized" warn runs iff byte bit0 of the
   flags dword is clear; the body then CONTINUES regardless. */
int32_t isaac_sfx_init_walk_warn_needed(uint32_t flags);

/* Arg gate 0xa2b9d0 `test esi,esi ; je 0xa2ba73`: a NULL arg1 skips
   the ENTIRE walk, map find and tail call. FULL dword zero test. */
int32_t isaac_sfx_init_walk_body_runs(uint32_t arg1);

/* One walk iteration (0xa2ba03..0xa2ba20). member_is_arg and the key
   match are FULL dword compares; the sentinel head test decides
   BEFORE any member dereference. */
int32_t isaac_sfx_init_walk_step(uint32_t node_is_sentinel,
                                 uint32_t node_member_ptr,
                                 uint32_t node_member_key,
                                 uint32_t arg1,
                                 uint32_t key);

/* Found-arm hook island 0xa2ba39: probes [node+0x18], byte-gated
   vtbl[0xc] result and the hook pointer gate (v22 island shape). */
int32_t isaac_sfx_init_walk_island_hook(int32_t found_arm_runs,
                                        uint32_t node_b,
                                        uint32_t probe_al,
                                        uint32_t hook);

/* Construct-arm island2 0xa2b919 (probe = the new secondary). */
int32_t isaac_sfx_map_construct_island2(uint32_t alloc_nonnull,
                                        uint32_t probe_al,
                                        uint32_t hook);

/* Found-arm island3 0xa2b956 (probe = the adopt pair's second dword,
   host-written). */
int32_t isaac_sfx_map_construct_island3(uint32_t pair1,
                                        uint32_t probe_al,
                                        uint32_t hook);

/* Island1 0xa2b8b9 can NEVER call the hook: its probe slot [ebp-0x18]
   is zero-initialized at 0xa2b87e and not written again before the
   island. Dead-by-construction pin. */
int32_t isaac_sfx_map_construct_island1(void);

/* Full plan forms (vtbl/hash/adopt/alloc/ctor calls stay host; the
   plan records which host edges run and the pure const stores). */
void isaac_sfx_map_construct_plan(uint32_t find_result,
                                  uint32_t map_end,
                                  uint32_t alloc_nonnull,
                                  uint32_t pair1,
                                  uint32_t probe2_al,
                                  uint32_t probe3_al,
                                  uint32_t hook,
                                  IsaacSfxMapConstructPlan* out);

void isaac_sfx_init_walk_plan(uint32_t flags,
                              uint32_t arg1,
                              uint32_t node_is_sentinel,
                              uint32_t node_member_ptr,
                              uint32_t node_member_key,
                              uint32_t key,
                              uint32_t node_b,
                              uint32_t probe_al,
                              uint32_t hook,
                              IsaacSfxInitWalkPlan* out);

/* v36 census pins (fresh full-body dumps; see notes sfx-v36-mapwalk). */
uint32_t isaac_sfx_map_construct_ret_imm(void);
uint32_t isaac_sfx_map_construct_stack_args(void);
uint32_t isaac_sfx_map_construct_arg3_dead(void);
uint32_t isaac_sfx_map_construct_vtable_rows(void);
uint32_t isaac_sfx_map_construct_seh_handler_va(void);
uint32_t isaac_sfx_map_construct_alloc_size(void);
uint32_t isaac_sfx_map_construct_node_member_off(void);
uint32_t isaac_sfx_map_construct_secondary_vtable_va(void);
uint32_t isaac_sfx_map_construct_hash_site(void);
uint32_t isaac_sfx_map_construct_find_site(void);
uint32_t isaac_sfx_map_construct_adopt1_site(void);
uint32_t isaac_sfx_map_construct_alloc_site(void);
uint32_t isaac_sfx_map_construct_ctor_site(void);
uint32_t isaac_sfx_map_construct_adopt2_site(void);
uint32_t isaac_sfx_map_construct_vtable_store_site(void);
uint32_t isaac_sfx_map_construct_field14_store_site(void);
uint32_t isaac_sfx_map_construct_hash_in_place_site(void);
uint32_t isaac_sfx_map_island1_site(void);
uint32_t isaac_sfx_map_island2_site(void);
uint32_t isaac_sfx_map_island3_site(void);
uint32_t isaac_sfx_init_walk_ret_imm(void);
uint32_t isaac_sfx_init_walk_stack_args(void);
uint32_t isaac_sfx_init_walk_vtable_rows(void);
uint32_t isaac_sfx_init_walk_seh_handler_va(void);
uint32_t isaac_sfx_init_walk_warn_site(void);
uint32_t isaac_sfx_init_walk_warn_fmt_va(void);
uint32_t isaac_sfx_init_walk_warn_level(void);
uint32_t isaac_sfx_init_walk_warn_stack_args(void);
uint32_t isaac_sfx_init_walk_member_off(void);
uint32_t isaac_sfx_init_walk_key_off(void);
uint32_t isaac_sfx_init_walk_node_b_off(void);
uint32_t isaac_sfx_init_walk_free_size(void);
uint32_t isaac_sfx_init_walk_advance_va(void);
uint32_t isaac_sfx_init_walk_remove_va(void);
uint32_t isaac_sfx_init_walk_find_site(void);
uint32_t isaac_sfx_init_walk_island_site(void);
uint32_t isaac_sfx_init_walk_free_site(void);
uint32_t isaac_sfx_init_walk_tail_site(void);

/* ---------- v37: 0xb9c4dc dtor-forest vtable chain census + pure
   dtor laws (wave-30 F4; notes sfx-v37-dtorforest; fresh dumps
   cpu-dump/00a156e0.txt, 00a68440.txt, 00a61a80.txt, 0040cb50.txt,
   0040cbb0.txt, 004149d0.txt, 00a13590.txt, 00a7d260.txt,
   00a7dac0.txt, 00a2bcb0.txt, 00a2bb10.txt)

   0xb9c4dc IS the manager-class vftable address (0xb9c4d8 holds its
   RTTI locator 0xbb0978; the machine stores 0xb9c4dc as the object
   vptr — the dtor swap at 0xa2af34). The v35 census read that table
   1-indexed from the RTTI slot; every table here is 0-indexed from
   the STORED vftable base.

   Dtor-forest rows (all dtor bodies classified HOST — no pure leaf;
   the decision layers below are the laws):
     manager          0xb9c4dc [0] 0xa2af00  (v35 wrapper; gate lawed)
     secondary 1      0xba306c [0] 0xa7d260  (foreign; calls 0xa2af30)
     secondary 2      0xba30b0 [0] 0xa7dac0  (foreign; calls 0xa2af30)
     manager base     0xb9fdcc [0] 0xa61a80  (flags put0 + byte gate)
     member           0xb81c0c [0] 0xa156e0  (owned gate + lock clear)
     member base      0xba04b4 [0] 0xa68440  (byte gate)
     pair object      0xb9c430 [0] 0x40cb50  (owned gate + lock clear)
     pair base        0xb1a6fc [0] 0x40cbb0  (owned gate + lock clear)
     flag rows        0xb81a84/0xb82468/0xb82638 [0] = 0xa13590 — the
                      byte-gated bit1 SETTER (v35 law, 8th site), NOT
                      a dtor
     arm rows         [0] = 0xa7b5e0/0xa7ba40/0xa7bcd0/0xa7c1b0/
                      0xa7cbb0/0xa7ce00 — foreign class dtors
   The nested dtor 0xa2af30 is SHARED by all three manager wrappers
   (E8 callers 0xa2af06/0xa7d276/0xa7dad6; jmp thunk 0xb16e59). Its
   layout: vptr +0x00, flags +0x04, map head ptr +0x08, size +0x0c,
   member1 +0x10 (vftable 0xb81c0c, lock byte +0x14, owned ptr +0x18,
   vector triple +0x1c -> 0x4149d0), member2 +0x28 (lock +0x2c, owned
   ptr +0x30). Owned ptrs and map nodes free with size 0x1c via the
   runtime fnptr 0xb18274 (37 read sites, 0 writers — host) then
   free 0xaef15c. 0x4149d0 = the v4 block-free shape BY REFERENCE.
   Cross-row byte gate: `test byte [ebp+8],1` (the v35 dtor_free_gate)
   now covers EIGHT bodies with free sizes 0x34/8/8/0x18/0x14/0xc/
   0x4c/0x64. Byte gates uint32_t + & 0xff; the owned-ptr tests and
   the flags put0 are FULL dword ops. */

enum {
  ISAAC_SFX_MANAGER_VFTABLE_VA = 0x00b9c4dcu,   /* stored vptr; RTTI 0xb9c4d8 */
  ISAAC_SFX_MANAGER_VFTABLE_RTTI_VA = 0x00b9c4d8u,
  ISAAC_SFX_NESTED_DTOR_VA = 0x00a2af30u,       /* shared by 3 wrappers */
  ISAAC_SFX_NESTED_DTOR_SHARED_BODIES = 3,      /* a2af00/a7d260/a7dac0 */
  ISAAC_SFX_NESTED_DTOR_E8_CALLERS = 3,         /* a2af06/a7d276/a7dad6 */
  ISAAC_SFX_NESTED_DTOR_CALLER1 = 0x00a2af06u,
  ISAAC_SFX_NESTED_DTOR_CALLER2 = 0x00a7d276u,
  ISAAC_SFX_NESTED_DTOR_CALLER3 = 0x00a7dad6u,
  ISAAC_SFX_NESTED_DTOR_THUNK_VA = 0x00b16e59u, /* jmp alias */
  ISAAC_SFX_SECONDARY1_VFTABLE_VA = 0x00ba306cu, /* stored vptr; RTTI 0xba3068 */
  ISAAC_SFX_SECONDARY1_RTTI_VA = 0x00ba3068u,
  ISAAC_SFX_SECONDARY2_VFTABLE_VA = 0x00ba30b0u, /* stored vptr; RTTI 0xba30ac */
  ISAAC_SFX_SECONDARY2_RTTI_VA = 0x00ba30acu,
  ISAAC_SFX_SECONDARY_DTOR1_VA = 0x00a7d260u,   /* foreign; free 0x4c */
  ISAAC_SFX_SECONDARY_DTOR2_VA = 0x00a7dac0u,   /* foreign; free 0x64 */
  ISAAC_SFX_SECONDARY_DTOR_FREE1 = 0x4cu,
  ISAAC_SFX_SECONDARY_DTOR_FREE2 = 0x64u,
  ISAAC_SFX_SECONDARY_BASE_DTOR_VA = 0x00a5a4c0u, /* foreign host */
  ISAAC_SFX_MANAGER_BASE_VFTABLE_VA = 0x00b9fdccu, /* final vptr @0xa2afc6 */
  ISAAC_SFX_MANAGER_BASE_DTOR_VA = 0x00a61a80u,
  ISAAC_SFX_MANAGER_BASE_DTOR_FREE = 8u,
  ISAAC_SFX_MEMBER_VFTABLE_VA = 0x00b81c0cu,    /* locked-container member */
  ISAAC_SFX_MEMBER_DTOR_VA = 0x00a156e0u,       /* deleting; free 0xc */
  ISAAC_SFX_MEMBER_DTOR_PLAIN_VA = 0x00a15730u, /* non-deleting sibling */
  ISAAC_SFX_MEMBER_RELEASE_VA = 0x00a157c0u,    /* vtbl[0x8] of the rows */
  ISAAC_SFX_MEMBER_LOCK_ACQUIRE_VA = 0x00a15770u, /* vtbl[0x4] (host) */
  ISAAC_SFX_MEMBER_DTOR_FREE = 0xcu,
  ISAAC_SFX_MEMBER_BASE_VFTABLE_VA = 0x00ba04b4u,
  ISAAC_SFX_MEMBER_BASE_DTOR_VA = 0x00a68440u,
  ISAAC_SFX_MEMBER_BASE_DTOR_FREE = 8u,
  ISAAC_SFX_MEMBER_BASE_LOCK_CLEAR_VA = 0x00a68480u, /* and byte [ecx+4],0xfe */
  ISAAC_SFX_PAIR_VFTABLE_VA = 0x00b9c430u,      /* the 0x18 secondary */
  ISAAC_SFX_PAIR_DTOR_VA = 0x0040cb50u,         /* deleting; free 0x18 */
  ISAAC_SFX_PAIR_BASE_VFTABLE_VA = 0x00b1a6fcu,
  ISAAC_SFX_PAIR_BASE_DTOR_VA = 0x0040cbb0u,    /* free 0x14 */
  ISAAC_SFX_PAIR_DTOR_FREE = 0x18u,
  ISAAC_SFX_PAIR_BASE_DTOR_FREE = 0x14u,
  ISAAC_SFX_FLAG_ROW0_VA = 0x00b81a84u,         /* [0] = 0xa13590 bit1 setter */
  ISAAC_SFX_FLAG_ROW1_VA = 0x00b82468u,
  ISAAC_SFX_FLAG_ROW2_VA = 0x00b82638u,
  ISAAC_SFX_FLAG_BIT1_SETTER_VA = 0x00a13590u,  /* byte-gated bit1 (8th site) */
  ISAAC_SFX_DTOR_FOREST_VTABLES = 6,    /* b9c4dc/b9fdcc/b81c0c/ba04b4/b9c430/b1a6fc */
  ISAAC_SFX_DTOR_DELETE_GATE_BODIES = 8, /* byte [ebp+8] bit0 free gate */
  ISAAC_SFX_DTOR_OWNED_FREE_GATE_SITES = 7,
  ISAAC_SFX_DTOR_LOCK_CLEAR_SITES = 8,
  ISAAC_SFX_DTOR_FLAGS_PUT0_SITES = 3,  /* a2afbf/a2b040/a61a86 */
  ISAAC_SFX_DTOR_OWNED_FREE_SIZE = 0x1cu,
  ISAAC_SFX_DTOR_MAP_HEAD_OFF = 0x08u,  /* this[8] head node ptr */
  ISAAC_SFX_DTOR_MAP_SIZE_OFF = 0x0cu,  /* this[0xc] size dword */
  ISAAC_SFX_DTOR_MEMBER1_OFF = 0x10u,   /* {vptr, lock+4, ptr+8, vec+0xc} */
  ISAAC_SFX_DTOR_MEMBER1_LOCK_OFF = 0x14u,
  ISAAC_SFX_DTOR_MEMBER1_PTR_OFF = 0x18u,
  ISAAC_SFX_DTOR_MEMBER1_VEC_OFF = 0x1cu, /* 0x4149d0 receiver */
  ISAAC_SFX_DTOR_MEMBER2_OFF = 0x28u,
  ISAAC_SFX_DTOR_MEMBER2_LOCK_OFF = 0x2cu,
  ISAAC_SFX_DTOR_MEMBER2_PTR_OFF = 0x30u,
  ISAAC_SFX_DTOR_BLOCK_FREE_VA = 0x004149d0u,  /* v4 block-free shape */
  ISAAC_SFX_DTOR_BLOCK_FREE_SITE = 0x00a2af6fu, /* the member1 vec free */
  ISAAC_SFX_LIST_CLEAR_VA = 0x00a2bcb0u,       /* host; 5 E8 callers */
  ISAAC_SFX_LIST_CLEAR_CALLERS = 5,
  ISAAC_SFX_HOOK_CALLABLE_VA = 0x00a2bb10u,    /* the v22 hook target */
  ISAAC_SFX_RELEASE_FNPTR_VA = 0x00b18274u,    /* 37 reads, 0 writers */
  ISAAC_SFX_DTOR_VPTR_STORE1_VA = 0x00a2af34u, /* -> 0xb9c4dc */
  ISAAC_SFX_DTOR_VPTR_STORE2_VA = 0x00a2afc6u, /* -> 0xb9fdcc */
  ISAAC_SFX_DTOR_FLAGS_PUT0_SITE1 = 0x00a2afbfu,
  ISAAC_SFX_DTOR_FLAGS_PUT0_SITE2 = 0x00a2b040u,
  ISAAC_SFX_DTOR_FLAGS_PUT0_SITE3 = 0x00a61a86u,
  ISAAC_SFX_HOOK_INSTALL_LOCK_SITES = 2, /* a2afd9/a2afe2 -> 0xa15770 */
  ISAAC_SFX_HOOK_CLEAR_LOCK_SITES = 2,   /* a2b034/a2b03d -> 0xa157c0 */
  ISAAC_SFX_HOOK_CLEAR_REINIT_STORES = 4, /* 3 self-loops + count zero */
  ISAAC_SFX_HOOK_CLEAR_REINIT_SITES_3 = 3, /* a2b020/a2b026/a2b028 */
  ISAAC_SFX_HOOK_CLEAR_COUNT_STORE_VA = 0x00a2b02bu, /* this[0xc] := 0 */
};

/* Owned-pointer free gate, 0xa2af44/0xa2af7e + the member/pair dtors
   (7 sites): `test esi,esi ; je skip` — FULL dword. When 1 the body
   runs the IAT [0xb18274] release + free(ptr, 0x1c) + zero store. */
int32_t isaac_sfx_dtor_owned_free_gate(uint32_t ptr);

/* Lock-byte clear, `and byte [m+4], 0xfe` (8 sites incl. the inline
   member clears in 0xa2af30 and the 0xa68480 virtual): clears bit0
   of the member byte unconditionally on the destroy path. The input
   is the BYTE the machine reads (masked & 0xff); result is the
   stored byte. */
int32_t isaac_sfx_dtor_lock_bit_clear(uint32_t byte);

/* Manager flags put0, `and dword [this+4], 0xfffffffe` (3 sites:
   0xa2afbf dtor / 0xa2b040 hook-clear / 0xa61a86 base dtor). The
   hook-clear plan's flags_after consumes this op BY REFERENCE. */
uint32_t isaac_sfx_dtor_flags_put0(uint32_t flags);

/* v37 census pins (fresh dumps + whole-.text census; notes
   sfx-v37-dtorforest). */
uint32_t isaac_sfx_nested_dtor_va(void);
uint32_t isaac_sfx_nested_dtor_shared_bodies(void);
uint32_t isaac_sfx_nested_dtor_e8_callers(void);
uint32_t isaac_sfx_manager_vftable_va(void);
uint32_t isaac_sfx_secondary1_vftable_va(void);
uint32_t isaac_sfx_secondary2_vftable_va(void);
uint32_t isaac_sfx_manager_base_vftable_va(void);
uint32_t isaac_sfx_member_vftable_va(void);
uint32_t isaac_sfx_member_base_vftable_va(void);
uint32_t isaac_sfx_pair_vftable_va(void);
uint32_t isaac_sfx_pair_base_vftable_va(void);
uint32_t isaac_sfx_flag_bit1_setter_va(void);
uint32_t isaac_sfx_dtor_forest_vtables(void);
uint32_t isaac_sfx_dtor_delete_gate_bodies(void);
uint32_t isaac_sfx_dtor_owned_free_gate_sites(void);
uint32_t isaac_sfx_dtor_lock_clear_sites(void);
uint32_t isaac_sfx_dtor_flags_put0_sites(void);
uint32_t isaac_sfx_dtor_owned_free_size(void);
uint32_t isaac_sfx_dtor_block_free_va(void);
uint32_t isaac_sfx_dtor_block_free_site(void);
uint32_t isaac_sfx_list_clear_va(void);
uint32_t isaac_sfx_list_clear_callers(void);
uint32_t isaac_sfx_hook_callable_va(void);
uint32_t isaac_sfx_release_fnptr_va(void);
uint32_t isaac_sfx_dtor_vptr_store1_va(void);
uint32_t isaac_sfx_dtor_vptr_store2_va(void);
uint32_t isaac_sfx_hook_install_lock_sites(void);
uint32_t isaac_sfx_hook_clear_lock_sites(void);
uint32_t isaac_sfx_hook_clear_reinit_stores(void);

/* ---------- v38: 0xa2bb10 hook-callable decision layer (wave-31 F4;
   notes sfx-v38-hook; fresh dump cpu-dump/00a2bb10.txt)

   Verify-open: the v37 §2h reached-leaves audit's only caller-bearing
   upstream body — the v22 attach-hook BODY the wrapper cluster
   installs into 0xc7f484 and the family's own islands dispatch. The
   brief's 0x92cfb0 Load decision surface was CLOSED at v33 (22 rel32
   callers re-censused this unit, all in landed/out-of-extent bodies)
   and the 0x92e68c ducking play arm was LANDED at v30 — nothing open
   there. 0xa2bb10: body 0xa2bb10..0xa2bc9d (plain ret, 1 stack arg =
   the pair pointer), 125 insns, SEH 0xaf12f0, identify-zhl no match;
   census (lea-corrected, census-sfx-hook.py): 0 E8/E9 direct callers,
   2 imm32 refs (0xa2afeb install + 0xa7d53a second install), 30 flat
   refs to 0xc7f484 (2 writers + 28 reads = the island dispatch
   surface). next body 0xa2bcb0 list clear (5 E8 callers, cross-pin).

   Decision layer (byte gates uint32_t + & 0xff; the WORD gate reads
   the two member bytes as the machine does):
   - G1 0xa2bb3b pair1 = [pair+4] FULL-dword non-null; NULL -> the
     body does NOTHING.
   - G2 0xa2bb54 `movzx esi, WORD [member2+4] ; cmp esi,1` — 16-BIT
     read == 1 (byte4 lock byte set AND byte5 clear, re-read after
     the child lock acquire, before its release).
   - G3 0xa2bb69 key = [pair+0] FULL-dword non-null; NULL skips the
     64-entry walk (the warn gate still runs).
   - G4 0xa2bb79 walk entry[8] == key (FULL dword); MATCH clears
     [match+0x34] and [entry+8], runs IAT 0xb18540(entry[0]) +
     0xb1854c(entry[0], 0x1009, 0); the walk then CONTINUES (no early
     exit). Base [0xc5aadc] re-read every iteration; stride 0xc;
     CONSTANT bound: `add esi,0xc ; cmp esi,0x300 ; jb` — exactly 64
     iterations when entered.
   - G5 0xa2bbc2 `test byte [0xc5aaa4],1 ; jne skip` — BYTE bit0 of
     the flags global; warn (0xa112c0, level 0x10, fmt 0xb9c450 —
     SAME consts as the v36 init-walk warn at body #2 / new global)
     iff bit0 clear.
   - G6 0xa2bbda key NULL -> skip the map phase (no unlock tail);
     the SAME FULL-dword test as G3 at its second site.
   - MAP phase: vtbl[0xc](&0xc5aab0,-1) ; key2 = [key+0x10] ; map
     find 0xa12280 ; result == [0xc5aaa8] -> MISS (the v35
     isaac_sfx_map_found law, body #2); loop 0xa2bc16 = the v36
     isaac_sfx_init_walk_step model at body #2 (member=[node+0x14],
     member key [member+0x10] == key2 else MISMATCH, member == key ->
     FOUND, else 0x414a80 advance while result != end). FOUND arm:
     remove 0x415d20 -> node; island = the v36 island law at body #3
     (probe [node+0x18] FULL dword, vtbl[0xc] LOW-BYTE result, hook
     ptr -> hook(&node+0x14)); free(node, 0x1c) UNCONDITIONAL.
   - TAIL 0xa2bc80 vtbl[0x10](&0xc5aab0) unlock runs on EVERY map-
     phase exit (miss/mismatch/found/advance-exhaust). */

enum {
  ISAAC_SFX_HOOK_VA_A2BB10 = 0x00a2bb10u,   /* the v22 hook body root */
  ISAAC_SFX_HOOK_END_VA_A2BC9D = 0x00a2bc9du, /* plain ret */
  ISAAC_SFX_HOOK_NEXT_VA_A2BCB0 = 0x00a2bcb0u, /* list clear (5 E8 callers) */
  ISAAC_SFX_HOOK_DIRECT_CALLERS = 0,        /* E8/E9 census; dispatch-borne */
  ISAAC_SFX_HOOK_IMM32_REFS = 2,            /* 0xa2afeb + 0xa7d53a installs */
  ISAAC_SFX_HOOK_INSTALL2_SITE = 0x00a7d53au, /* second install (foreign) */
  ISAAC_SFX_HOOK_BODY_INSNS = 125,          /* linear resync span count */
  ISAAC_SFX_HOOK_SEH_HANDLER_VA = 0x00af12f0u,
  ISAAC_SFX_HOOK_STACK_ARGS = 1,            /* [ebp+8] = the pair pointer */
  ISAAC_SFX_HOOK_RET_IMM = 0,               /* plain ret */
  ISAAC_SFX_HOOK_PAIR_MEMBER2_OFF = 4,      /* [pair+4] member2 */
  ISAAC_SFX_HOOK_PAIR_KEY_OFF = 0,          /* [pair+0] key */
  ISAAC_SFX_HOOK_MEMBER_LOCK_WORD_OFF = 4,  /* WORD [member2+4] */
  ISAAC_SFX_HOOK_LOCK_WORD_GATE_VALUE = 1,  /* cmp esi,1 */
  ISAAC_SFX_HOOK_KEY_GATE_SITES = 2,        /* 0xa2bb69 walk + 0xa2bbda map */
  ISAAC_SFX_HOOK_KEY_GATE_WALK_SITE = 0x00a2bb69u,
  ISAAC_SFX_HOOK_KEY_GATE_MAP_SITE = 0x00a2bbdau,
  ISAAC_SFX_HOOK_TABLE_GLOBAL = 0x00c5aadcu, /* member table base */
  ISAAC_SFX_HOOK_TABLE_STRIDE = 0x0cu,
  ISAAC_SFX_HOOK_TABLE_BOUND = 0x300u,      /* CONSTANT bound (cmp esi,0x300) */
  ISAAC_SFX_HOOK_TABLE_ITERATIONS = 64,     /* 0x300 / 0xc */
  ISAAC_SFX_HOOK_TABLE_KEY_OFF = 8,         /* entry[8] key slot */
  ISAAC_SFX_HOOK_TABLE_HANDLE_OFF = 0,      /* entry[0] handle */
  ISAAC_SFX_HOOK_TABLE_RELOAD = 1,          /* [0xc5aadc] re-read per iter */
  ISAAC_SFX_HOOK_MATCH_FIELD34_OFF = 0x34,  /* [match+0x34] := 0 */
  ISAAC_SFX_HOOK_MATCH_CLEARS = 2,          /* field34 + entry[8] stores */
  ISAAC_SFX_HOOK_IAT_RELEASE_18540 = 0x00b18540u, /* release(entry[0]) */
  ISAAC_SFX_HOOK_IAT_KILL_1854C = 0x00b1854cu,    /* kill(entry[0], 0x1009, 0) */
  ISAAC_SFX_HOOK_KILL_ARG1 = 0x1009u,
  ISAAC_SFX_HOOK_KILL_ARG2 = 0u,
  ISAAC_SFX_HOOK_IAT_CALL_SITE1 = 0x00a2bb99u,
  ISAAC_SFX_HOOK_IAT_CALL_SITE2 = 0x00a2bbaeu,
  ISAAC_SFX_HOOK_FLAGS_GLOBAL = 0x00c5aaa4u, /* byte bit0 warn gate */
  ISAAC_SFX_HOOK_WARN_SITE = 0x00a2bbc2u,
  ISAAC_SFX_HOOK_WARN_FMT_VA = 0x00b9c450u, /* SAME as v36 init-walk warn */
  ISAAC_SFX_HOOK_WARN_LEVEL = 0x10u,
  ISAAC_SFX_HOOK_MAP_GLOBAL = 0x00c5aaa8u,  /* map head global */
  ISAAC_SFX_HOOK_MAP_LOCK_GLOBAL = 0x00c5aab0u, /* vtbl[0xc]/[0x10] obj */
  ISAAC_SFX_HOOK_MAP_FIND_SITE = 0x00a2bc04u, /* -> 0xa12280 */
  ISAAC_SFX_HOOK_MAP_FOUND_SITE = 0x00a2bc12u, /* v35 map_found body #2 */
  ISAAC_SFX_HOOK_MAP_LOOP_SITE = 0x00a2bc16u,  /* v36 step body #2 */
  ISAAC_SFX_HOOK_MAP_MEMBER_OFF = 0x14u,    /* [node+0x14] member */
  ISAAC_SFX_HOOK_MAP_KEY_OFF = 0x10u,       /* [member+0x10] / [key+0x10] */
  ISAAC_SFX_HOOK_MAP_REMOVE_SITE = 0x00a2bc36u, /* -> 0x415d20 */
  ISAAC_SFX_HOOK_ISLAND_SITE = 0x00a2bc4du, /* v36 island body #3 */
  ISAAC_SFX_HOOK_ISLAND_PROBE_OFF = 4,      /* [node+0x18] probe */
  ISAAC_SFX_HOOK_ISLAND_TARGET_OFF = 0x14,  /* hook(&node+0x14) */
  ISAAC_SFX_HOOK_FREE_SIZE = 0x1cu,         /* free(node, 0x1c) */
  ISAAC_SFX_HOOK_FREE_SITE = 0x00a2bc78u,   /* -> 0xaef15c */
  ISAAC_SFX_HOOK_TAIL_SITE = 0x00a2bc80u,   /* vtbl[0x10] unlock tail */
  ISAAC_SFX_HOOK_LOCK_ACQUIRE_SITE = 0x00a2bb4du, /* child vtbl[0xc] */
  ISAAC_SFX_HOOK_LOCK_RELEASE_SITE = 0x00a2bb58u, /* child vtbl[0x10] */
  ISAAC_SFX_HOOK_ISLAND_SELF_SITE = 0x00a2bc5fu,  /* own 0xc7f484 dispatch */
  /* walk/map step enums (v36 semantics, consumed by reference) */
  ISAAC_SFX_HOOK_STEP_MISS = 0,
  ISAAC_SFX_HOOK_STEP_FOUND = 1,
  ISAAC_SFX_HOOK_STEP_ADVANCE = 2,
  ISAAC_SFX_HOOK_STEP_MISMATCH = 3,
};

typedef struct IsaacSfxHookPlan {
  uint32_t pair1_gate;          /* G1 0xa2bb3b: [pair+4] != 0 FULL dword */
  uint32_t lock_word_gate;      /* G2 0xa2bb5b: word[member2+4] == 1 */
  uint32_t body_runs;           /* pair1_gate && lock_word_gate */
  uint32_t key_gate;            /* G3+G6 0xa2bb69/0xa2bbda: [pair+0] != 0 */
  uint32_t walk_runs;           /* body_runs && key_gate */
  uint32_t walk_iterations;     /* 64 when walk_runs, else 0 (const bound) */
  uint32_t walk_match_found;    /* any of the 64 entries matched (input) */
  uint32_t warn_runs;           /* body_runs && warn_needed(flags) */
  uint32_t map_runs;            /* body_runs && key_gate (G6) */
  uint32_t map_step;            /* MISS/FOUND/ADVANCE/MISMATCH (v36 model) */
  uint32_t found_arm_runs;      /* map_step == FOUND */
  uint32_t advance_calls;       /* map_step == ADVANCE (0x414a80 host) */
  uint32_t remove_call_runs;    /* == found_arm_runs (0x415d20 host) */
  uint32_t free_runs;           /* == found_arm_runs (0xaef15c host) */
  uint32_t island_hook_runs;    /* found arm, v36 island triple gate */
  uint32_t tail_unlock_runs;    /* == map_runs (vtbl[0x10] on 0xc5aab0) */
  uint32_t map_find_call_runs;  /* == map_runs (0xa12280 host) */
} IsaacSfxHookPlan;

/* G1: 1 iff the pair's member2 pointer is non-NULL (FULL dword test
   at 0xa2bb3b; a NULL member2 makes the body do nothing). */
int32_t isaac_sfx_hook_gate_pair1(uint32_t pair1);

/* G2: the 16-bit member lock word == 1. The machine reads SIXTEEN
   bits (`movzx esi, word [member2+4]` re-read after the child lock
   acquire) and compares to 1: ((b4 & 0xff) | ((b5 & 0xff) << 8)) ==
   1 — byte4 lock set AND byte5 clear. NOT a byte gate. */
int32_t isaac_sfx_hook_lock_word_gate(uint32_t b4, uint32_t b5);

/* G3/G6: 1 iff the pair's key pointer is non-NULL (FULL dword, TWO
   sites: 0xa2bb69 walk skip / 0xa2bbda map skip). */
int32_t isaac_sfx_hook_gate_key(uint32_t key);

/* G4: walk entry[8] == key (FULL dword at 0xa2bb79); a match clears
   [match+0x34] and [entry+8] and runs the IAT release pair (host);
   the walk CONTINUES (no early exit). */
int32_t isaac_sfx_hook_walk_match(uint32_t entry8, uint32_t key);

/* Loop bound 0xa2bbb7/0xa2bbba: (index + 0xc) < 0x300 UNSIGNED with
   32-bit wrap. In-reach runs: index 0,0xc,...,0x2f4 (64 iterations);
   index 0x2f4 is the only in-reach stop (next 0x300). */
int32_t isaac_sfx_hook_walk_continue(uint32_t index);

/* G5: warn needed iff BYTE bit0 of the flags global (0xc5aaa4) is
   clear — same semantics as the v36 init-walk warn at its second
   body/site ((flags & 0xff) & 1) == 0. */
int32_t isaac_sfx_hook_warn_needed(uint32_t flags);

/* Full plan (see the struct; v35 map_found + v36 step/island/warn laws
   consumed by reference at bodies #2/#3; every host edge recorded as a
   tally). out may be null (no-op). */
void isaac_sfx_hook_plan(uint32_t pair1,
                         uint32_t lock_b4,
                         uint32_t lock_b5,
                         uint32_t key,
                         uint32_t walk_match_found,
                         uint32_t flags_global,
                         uint32_t map_result,
                         uint32_t map_end,
                         uint32_t node_member_ptr,
                         uint32_t node_member_key,
                         uint32_t node_b,
                         uint32_t probe_al,
                         uint32_t hook,
                         IsaacSfxHookPlan* out);

/* v38 census pins (lea-corrected tooling; see notes sfx-v38-hook). */
uint32_t isaac_sfx_hook_end_va(void);
uint32_t isaac_sfx_hook_next_va(void);
uint32_t isaac_sfx_hook_direct_callers(void);
uint32_t isaac_sfx_hook_imm32_refs(void);
uint32_t isaac_sfx_hook_install2_site(void);
uint32_t isaac_sfx_hook_body_insns(void);
uint32_t isaac_sfx_hook_seh_handler_va(void);
uint32_t isaac_sfx_hook_stack_args(void);
uint32_t isaac_sfx_hook_pair_member2_off(void);
uint32_t isaac_sfx_hook_pair_key_off(void);
uint32_t isaac_sfx_hook_member_lock_word_off(void);
uint32_t isaac_sfx_hook_lock_word_gate_value(void);
uint32_t isaac_sfx_hook_key_gate_sites(void);
uint32_t isaac_sfx_hook_key_gate_walk_site(void);
uint32_t isaac_sfx_hook_key_gate_map_site(void);
uint32_t isaac_sfx_hook_table_global(void);
uint32_t isaac_sfx_hook_table_stride(void);
uint32_t isaac_sfx_hook_table_bound(void);
uint32_t isaac_sfx_hook_table_iterations(void);
uint32_t isaac_sfx_hook_table_key_off(void);
uint32_t isaac_sfx_hook_table_handle_off(void);
uint32_t isaac_sfx_hook_table_reload(void);
uint32_t isaac_sfx_hook_match_field34_off(void);
uint32_t isaac_sfx_hook_match_clears(void);
uint32_t isaac_sfx_hook_iat_release(void);
uint32_t isaac_sfx_hook_iat_kill(void);
uint32_t isaac_sfx_hook_kill_arg1(void);
uint32_t isaac_sfx_hook_kill_arg2(void);
uint32_t isaac_sfx_hook_iat_call_site1(void);
uint32_t isaac_sfx_hook_iat_call_site2(void);
uint32_t isaac_sfx_hook_flags_global(void);
uint32_t isaac_sfx_hook_warn_site(void);
uint32_t isaac_sfx_hook_warn_fmt_va(void);
uint32_t isaac_sfx_hook_warn_level(void);
uint32_t isaac_sfx_hook_map_global(void);
uint32_t isaac_sfx_hook_map_lock_global(void);
uint32_t isaac_sfx_hook_map_find_site(void);
uint32_t isaac_sfx_hook_map_found_site(void);
uint32_t isaac_sfx_hook_map_loop_site(void);
uint32_t isaac_sfx_hook_map_member_off(void);
uint32_t isaac_sfx_hook_map_key_off(void);
uint32_t isaac_sfx_hook_map_remove_site(void);
uint32_t isaac_sfx_hook_island_site(void);
uint32_t isaac_sfx_hook_island_probe_off(void);
uint32_t isaac_sfx_hook_island_target_off(void);
uint32_t isaac_sfx_hook_free_size(void);
uint32_t isaac_sfx_hook_free_site(void);
uint32_t isaac_sfx_hook_tail_site(void);
uint32_t isaac_sfx_hook_lock_acquire_site(void);
uint32_t isaac_sfx_hook_lock_release_site(void);
uint32_t isaac_sfx_hook_island_self_site(void);

/* ---------- v39: 0xa2bcb0 list-clear decision seams + the
   0x92e7d0/0x92e7f0 declared destroy/free wrappers (wave-32 F4;
   notes sfx-v39-listclear; fresh dumps cpu-dump/00a2bcb0.txt,
   0092e7d0.txt, 0092e7f0.txt)

   The v38 handoff's two open rows, landed together: the 0xa2bcb0
   list clear (the v37 §2h reached-leaves row v38 left host; fresh
   lea-corrected census THIS unit: 5 E8 callers — 0xa2afb1, 0xa2b01b,
   0xa2bcec SELF recursion, 0xa7d599, 0xa9e61e — byte-identical to
   v37/v38) and the two declared thin wrappers between the v31
   clear-vec end (0x92e7be) and the 0x92e830 emplace.

   List clear 0xa2bcb0..0xa2bd4c (ret 8; thiscall this + TWO stack
   args: [ebp+8] arg1, [ebp+0xc] the node; SEH 0xaf1380): per-node
   decisions — G1/G2 BYTE node[0xd] == 0 at TWO sites (0xa2bcde
   entry, 0xa2bd35 loop re-test), else TAIL; per walked node the
   body RECURSES FIRST on node[8] with the ORIGINAL arg1 (0xa2bcec),
   then runs the island = the v36 island law at body #4 (probe ptr
   pair[4] == node+0x18 FULL dword, vtbl[0xc] LOW-BYTE result, hook
   global 0xc7f484 FULL dword -> hook(&node+0x14); site 0xa2bcff),
   then free(node, 0x1c) UNCONDITIONALLY (0xa2bd20 -> 0xaef15c; NOT
   gated by the island), then next := node[0] and loop while BYTE
   next[0xd] == 0. The byte gate is a per-node predicate; the
   recursion makes the total walk a chain property, so the plan is
   per-node (IsaacSfxListClearPlan).

   Destroy wrapper 0x92e7d0..0x92e7e3 (8 insns, ret 8): UNCONDITIONAL
   forward to the v4 host destroy-range 0x92ea80 (ecx=begin,
   edx=end; the begin==end gate is INSIDE the host at 0x92eaa6 — the
   wrapper has no decision surface). 2 callers: 0x92ea54 (0x92e900
   grow body) + 0x92ef4f (0x92ee40 grow SEH cleanup arm).

   Free wrapper 0x92e7f0..0x92e822 (18 insns, ret 8; abort IAT stub
   0x92e825 -> [0xb18894]): size = imul(count, 0x1b8) (32-bit wrap);
   size < 0x1000 UNSIGNED (jb) -> free(begin, size); else back =
   [begin-4], size += 0x23, slack = (begin-back)-4 UNSIGNED > 0x1f
   -> abort, else free(back, size'). That is the v4 sfxBlockFreePlan
   freeTail consumed BY REFERENCE at its next body. 2 callers:
   0x92ea5f (0x92e900 grow body) + 0x92ef5a (0x92ee40 cleanup arm). */

enum {
  ISAAC_SFX_LIST_CLEAR_VA_A2BCB0 = 0x00a2bcb0u,   /* body root */
  ISAAC_SFX_LIST_CLEAR_END_VA_A2BD4C = 0x00a2bd4cu, /* ret 8 */
  ISAAC_SFX_LIST_CLEAR_NEXT_VA_A2BD60 = 0x00a2bd60u, /* copy-pair helper */
  /* the 5-caller census pin is the v37 ISAAC_SFX_LIST_CLEAR_CALLERS */
  ISAAC_SFX_LIST_CLEAR_CALLER1_VA_A2AFB1 = 0x00a2afb1u,
  ISAAC_SFX_LIST_CLEAR_CALLER2_VA_A2B01B = 0x00a2b01bu,
  ISAAC_SFX_LIST_CLEAR_SELF_SITE_A2BCEC = 0x00a2bcecu, /* recursion */
  ISAAC_SFX_LIST_CLEAR_CALLER4_VA_A7D599 = 0x00a7d599u,
  ISAAC_SFX_LIST_CLEAR_CALLER5_VA_A9E61E = 0x00a9e61eu,
  ISAAC_SFX_LIST_CLEAR_IMM32_REFS = 5,
  ISAAC_SFX_LIST_CLEAR_BODY_INSNS = 58,
  ISAAC_SFX_LIST_CLEAR_SEH_HANDLER_VA = 0x00af1380u,
  ISAAC_SFX_LIST_CLEAR_STACK_ARGS = 2,
  ISAAC_SFX_LIST_CLEAR_RET_IMM = 8,
  ISAAC_SFX_LIST_CLEAR_NODE_NEXT_OFF = 0,      /* node[0] next ptr */
  ISAAC_SFX_LIST_CLEAR_NODE_CHILD_OFF = 8,     /* node[8] recursion arg2 */
  ISAAC_SFX_LIST_CLEAR_NODE_FLAG_BYTE_OFF = 0x0d, /* BYTE gate site */
  ISAAC_SFX_LIST_CLEAR_PAIR_OFF = 0x14,        /* hook(&node+0x14) */
  ISAAC_SFX_LIST_CLEAR_PROBE_OFF = 0x18,       /* pair[4] probe target */
  ISAAC_SFX_LIST_CLEAR_ENTRY_GATE_SITES = 2,   /* 0xa2bcde + 0xa2bd35 */
  ISAAC_SFX_LIST_CLEAR_ENTRY_GATE_SITE_1 = 0x00a2bcdeu,
  ISAAC_SFX_LIST_CLEAR_ENTRY_GATE_SITE_2 = 0x00a2bd35u,
  ISAAC_SFX_LIST_CLEAR_RECURSION_SITE = 0x00a2bcecu,
  ISAAC_SFX_LIST_CLEAR_ISLAND_SITE = 0x00a2bcffu, /* v36 island body #4 */
  ISAAC_SFX_LIST_CLEAR_HOOK_READ_SITE = 0x00a2bd11u, /* [0xc7f484] read */
  ISAAC_SFX_LIST_CLEAR_FREE_SIZE = 0x1cu,
  ISAAC_SFX_LIST_CLEAR_FREE_SITE = 0x00a2bd2au, /* -> 0xaef15c */
  ISAAC_SFX_LIST_CLEAR_LOOP_SITE = 0x00a2bd35u,
  ISAAC_SFX_DESTROY_WRAP_VA_92E7D0 = 0x0092e7d0u, /* body root */
  ISAAC_SFX_DESTROY_WRAP_END_VA_92E7E3 = 0x0092e7e3u, /* ret 8 */
  ISAAC_SFX_DESTROY_WRAP_NEXT_VA_92E7F0 = 0x0092e7f0u, /* free wrapper */
  ISAAC_SFX_DESTROY_WRAP_CALLERS = 2,
  ISAAC_SFX_DESTROY_WRAP_CALLER1_VA_92EA54 = 0x0092ea54u, /* 0x92e900 body */
  ISAAC_SFX_DESTROY_WRAP_CALLER2_VA_92EF4F = 0x0092ef4fu, /* 0x92ee40 arm */
  ISAAC_SFX_DESTROY_WRAP_IMM32_REFS = 2,
  ISAAC_SFX_DESTROY_WRAP_BODY_INSNS = 8,
  ISAAC_SFX_DESTROY_WRAP_FORWARD_TARGET_92EA80 = 0x0092ea80u, /* host */
  ISAAC_SFX_DESTROY_WRAP_STACK_ARGS = 2,
  ISAAC_SFX_DESTROY_WRAP_RET_IMM = 8,
  ISAAC_SFX_DESTROY_RANGE_CALLERS = 8,         /* 0x92ea80 whole-text */
  ISAAC_SFX_FREE_WRAP_VA_92E7F0 = 0x0092e7f0u, /* body root */
  ISAAC_SFX_FREE_WRAP_END_VA_92E822 = 0x0092e822u, /* ret 8 */
  ISAAC_SFX_FREE_WRAP_ABORT_SITE_92E825 = 0x0092e825u, /* [0xb18894] */
  ISAAC_SFX_FREE_WRAP_NEXT_VA_92E830 = 0x0092e830u, /* emplace (host) */
  ISAAC_SFX_FREE_WRAP_CALLERS = 2,
  ISAAC_SFX_FREE_WRAP_CALLER1_VA_92EA5F = 0x0092ea5fu, /* 0x92e900 body */
  ISAAC_SFX_FREE_WRAP_CALLER2_VA_92EF5A = 0x0092ef5au, /* 0x92ee40 arm */
  ISAAC_SFX_FREE_WRAP_IMM32_REFS = 2,
  ISAAC_SFX_FREE_WRAP_BODY_INSNS = 18,
  ISAAC_SFX_FREE_WRAP_STACK_ARGS = 2,
  ISAAC_SFX_FREE_WRAP_RET_IMM = 8,
  ISAAC_SFX_FREE_WRAP_STRIDE_1B8 = 0x1b8u,      /* imul count */
  ISAAC_SFX_FREE_WRAP_BIG_THRESHOLD = 0x1000u, /* UNSIGNED jb */
  ISAAC_SFX_FREE_WRAP_BIG_BIAS = 0x23u,        /* size += 0x23 */
  ISAAC_SFX_FREE_WRAP_SLACK_MAX = 0x1fu,       /* UNSIGNED ja -> abort */
  ISAAC_SFX_FREE_WRAP_ABORT_IAT_VA = 0x00b18894u,
};

typedef struct IsaacSfxListClearPlan {
  uint32_t entry_gate;          /* BYTE node[0xd] == 0 (2 sites) */
  uint32_t walk_runs;           /* == entry_gate */
  uint32_t recursion_runs;      /* == walk_runs (node[8], FIRST) */
  uint32_t probe_ptr_gate;      /* FULL dword ptr != 0 (node+0x18) */
  uint32_t probe_al_gate;       /* LOW-BYTE vtbl[0xc] result != 0 */
  uint32_t hook_gate;           /* FULL dword 0xc7f484 != 0 */
  uint32_t island_hook_runs;    /* the triple gate, then hook(&node+0x14) */
  uint32_t free_runs;           /* == walk_runs (0x1c, UNCONDITIONAL) */
  uint32_t free_size;           /* 0x1c */
  uint32_t next_continue;       /* BYTE next[0xd] == 0 (loop re-test) */
  uint32_t stack_args;          /* 2 */
  uint32_t ret_imm;             /* 8 */
} IsaacSfxListClearPlan;

typedef struct IsaacSfxDestroyWrapperPlan {
  uint32_t destroy_runs;        /* CONSTANT 1 (no gate in the wrapper) */
  uint32_t begin_passthrough;   /* ecx := begin */
  uint32_t end_passthrough;     /* edx := end */
  uint32_t forward_target;      /* 0x92ea80 (host) */
  uint32_t stack_args;          /* 2 */
  uint32_t ret_imm;             /* 8 */
} IsaacSfxDestroyWrapperPlan;

typedef struct IsaacSfxFreeWrapperPlan {
  uint32_t size;                /* imul(count, 0x1b8), 32-bit wrap */
  uint32_t big;                 /* size >= 0x1000 (UNSIGNED) */
  uint32_t uses_back_pointer;   /* == big (back = [begin-4]) */
  uint32_t slack_checked;       /* big only */
  uint32_t corrupt_fatal;       /* (begin-back)-4 > 0x1f (UNSIGNED): abort */
  uint32_t free_size;           /* size (+ 0x23 on the big arm) */
  uint32_t free_needed;         /* CONSTANT 1 */
  uint32_t stack_args;          /* 2 */
  uint32_t ret_imm;             /* 8 */
} IsaacSfxFreeWrapperPlan;

/* G1/G2: 1 iff the node's [0xd] flag byte is 0. BYTE read at TWO
   sites (0xa2bcde entry, 0xa2bd35 loop re-test); the input is the
   byte the machine reads, masked & 0xff as `cmp byte` does. */
int32_t isaac_sfx_list_clear_entry_gate(uint32_t flag_byte);

/* The v36 island law at body #4 (site 0xa2bcff): probe ptr
   (pair[4] == node+0x18) FULL dword != 0 && (probe_al & 0xff) != 0
   && hook (0xc7f484) FULL dword != 0 -> hook(&node+0x14). Same
   shape/offsets as the v38 hook island body #3. */
int32_t isaac_sfx_list_clear_island_hook(uint32_t probe_ptr,
                                         uint32_t probe_al,
                                         uint32_t hook);

/* Per-node plan (see the struct). The recursion runs FIRST for every
   walked node; free(node, 0x1c) is UNCONDITIONAL (free_runs ==
   walk_runs, NOT gated by the island); next_continue re-tests the
   SAME byte gate on node[0]+0xd. out may be null (no-op). */
void isaac_sfx_list_clear_plan(uint32_t flag_byte,
                               uint32_t next_flag_byte,
                               uint32_t probe_ptr,
                               uint32_t probe_al,
                               uint32_t hook,
                               IsaacSfxListClearPlan* out);

/* 0x92e7d0: the UNCONDITIONAL forward to the v4 host destroy-range
   0x92ea80 (ecx=begin, edx=end). destroy_runs is the CONSTANT 1 —
   the wrapper has no gate; the begin==end gate lives inside the
   host (0x92eaa6). out may be null (no-op). */
void isaac_sfx_destroy_wrapper_plan(uint32_t begin,
                                    uint32_t end,
                                    IsaacSfxDestroyWrapperPlan* out);

/* imul [ebp+0xc],0x1b8: the free size is count * 0x1b8, 32-bit
   wrapped (the v4 entry stride). */
uint32_t isaac_sfx_free_wrapper_size(uint32_t count);

/* 0x92e7f0: the v4 sfxBlockFreePlan tail at its next body, fed the
   imul'd size (see the struct). ptr_minus_back = begin - back (the
   big-arm recapture; begin itself is a free operand only — it never
   enters the decision). out may be null (no-op). */
void isaac_sfx_free_wrapper_plan(uint32_t count,
                                 uint32_t ptr_minus_back,
                                 IsaacSfxFreeWrapperPlan* out);

/* v39 census pins (lea-corrected tooling; see notes sfx-v39-listclear). */
uint32_t isaac_sfx_list_clear_end_va(void);
uint32_t isaac_sfx_list_clear_next_va(void);
uint32_t isaac_sfx_list_clear_callers(void);
uint32_t isaac_sfx_list_clear_caller1_va(void);
uint32_t isaac_sfx_list_clear_caller2_va(void);
uint32_t isaac_sfx_list_clear_self_site(void);
uint32_t isaac_sfx_list_clear_caller4_va(void);
uint32_t isaac_sfx_list_clear_caller5_va(void);
uint32_t isaac_sfx_list_clear_imm32_refs(void);
uint32_t isaac_sfx_list_clear_body_insns(void);
uint32_t isaac_sfx_list_clear_seh_handler_va(void);
uint32_t isaac_sfx_list_clear_stack_args(void);
uint32_t isaac_sfx_list_clear_ret_imm(void);
uint32_t isaac_sfx_list_clear_node_next_off(void);
uint32_t isaac_sfx_list_clear_node_child_off(void);
uint32_t isaac_sfx_list_clear_node_flag_byte_off(void);
uint32_t isaac_sfx_list_clear_pair_off(void);
uint32_t isaac_sfx_list_clear_probe_off(void);
uint32_t isaac_sfx_list_clear_entry_gate_sites(void);
uint32_t isaac_sfx_list_clear_entry_gate_site1(void);
uint32_t isaac_sfx_list_clear_entry_gate_site2(void);
uint32_t isaac_sfx_list_clear_recursion_site(void);
uint32_t isaac_sfx_list_clear_island_site(void);
uint32_t isaac_sfx_list_clear_hook_read_site(void);
uint32_t isaac_sfx_list_clear_free_size(void);
uint32_t isaac_sfx_list_clear_free_site(void);
uint32_t isaac_sfx_list_clear_loop_site(void);
uint32_t isaac_sfx_destroy_wrap_end_va(void);
uint32_t isaac_sfx_destroy_wrap_next_va(void);
uint32_t isaac_sfx_destroy_wrap_callers(void);
uint32_t isaac_sfx_destroy_wrap_caller1_va(void);
uint32_t isaac_sfx_destroy_wrap_caller2_va(void);
uint32_t isaac_sfx_destroy_wrap_imm32_refs(void);
uint32_t isaac_sfx_destroy_wrap_body_insns(void);
uint32_t isaac_sfx_destroy_wrap_forward_target(void);
uint32_t isaac_sfx_destroy_wrap_stack_args(void);
uint32_t isaac_sfx_destroy_wrap_ret_imm(void);
uint32_t isaac_sfx_destroy_range_callers(void);
uint32_t isaac_sfx_free_wrap_end_va(void);
uint32_t isaac_sfx_free_wrap_abort_site(void);
uint32_t isaac_sfx_free_wrap_next_va(void);
uint32_t isaac_sfx_free_wrap_callers(void);
uint32_t isaac_sfx_free_wrap_caller1_va(void);
uint32_t isaac_sfx_free_wrap_caller2_va(void);
uint32_t isaac_sfx_free_wrap_imm32_refs(void);
uint32_t isaac_sfx_free_wrap_body_insns(void);
uint32_t isaac_sfx_free_wrap_stack_args(void);
uint32_t isaac_sfx_free_wrap_ret_imm(void);
uint32_t isaac_sfx_free_wrap_stride(void);
uint32_t isaac_sfx_free_wrap_big_threshold(void);
uint32_t isaac_sfx_free_wrap_big_bias(void);
uint32_t isaac_sfx_free_wrap_slack_max(void);
uint32_t isaac_sfx_free_wrap_abort_iat_va(void);

/* ---------- v40: 0xa2bd60 copy-pair helper (+ its 0xa2bd90 insert
   body) and the 0x92e900 vector grow body's decision seams (wave-33
   F4; notes sfx-v40-pairgrow; fresh dumps cpu-dump/00a2bd60.txt,
   00a2bd90.txt, 0092e900.txt)

   The v39 handoff's two open rows, landed together: 0xa2bd60 (until
   now only the v39 list-clear NEXT-VA pin) and the 0x92e900 grow
   body (host since v4; its only landed seams were the v24 laws,
   whose sites this unit re-pins). Fresh lea-corrected census THIS
   unit: 0xa2bd60 1 E8 caller (0xa2b6a4 — the v34 audio-wrapper
   pair-move edge), 0xa2bd90 1 E8 caller (0xa2bd71, the wrapper's
   own call), 0x92e900 1 E8 caller (0x92d654, the v4/v24 push-back
   site). identify-zhl: exactMatches [] for all three.

   Copy-pair wrapper 0xa2bd60..0xa2bd81 (13 insns, ret 8, NO
   branches, NO SEH): UNCONDITIONALLY calls the insert body
   0xa2bd90(out=&local, src) with thiscall this passed through
   untouched, then copies the callee's out-pair FIRST dword to
   *dst (0xa2bd7c; the pair's second slot at out[4] is the flag
   byte 1, written by the body at 0xa2bf3c and NOT copied).
   call_runs and out_dword_copy_runs are CONSTANT 1.

   Insert body 0xa2bd90..0xa2bf51 (152 insns, ret 8, SEH 0xb1227d):
   allocs a 0x1c-byte node (0xa0f4c0), copies src[0] into
   node[0x10] (key dword) and the 8-byte pair {src[4], src[8]}
   into node[0x14] via 0x8f2d20 (the v36 adopt-pair law; its own
   island at 0x8f2d60 is consumed by reference — NONE of the three
   bodies reads 0xc7f484 directly), initialises the tree links
   ([0]/[4]/[8] := head, word [0xc] := 0), then inserts by the
   machine's ordered-tree rules:
     WALK (0xa2be0c..0xa2be3b): starts at head[4]; BYTE gate
     [x+0xd] != 0 -> no walk; per step `cmp [ebx+0x10], ecx ; jae`
     UNSIGNED: new_key >= node_key -> right ([x+8]) else left
     ([x]); loop while BYTE [next+0xd] == 0.
     COUNT (0xa2be3b..0xa2be4a): this[4] == 0x9249249 (the first
     count whose 0x1c span overflows 32 bits) -> throw 0x4170d0;
     else this[4]++.
     LINK (0xa2be4d..0xa2be7e): [node+4] := parent ALWAYS; parent
     == head -> head arm ([head]=[head+4]=[head+8]=node, byte
     [node+0xc] := 1, no fixup); else the side bit = sbb/neg of
     the WALK's last key compare (0xa2be31, CARRIED): new_key <
     parent_key -> LEFT ([parent] := node + [head] := node when
     parent == [head]); else RIGHT ([parent+8] := node + [head+8]
     := node when parent == [head+8]).
     FIXUP (0xa2be81..0xa2bf2d): BYTE [parent+0xc] == 0 -> run;
     per step: uncle color BYTE == 0 -> RECOLOR arm (parent := 1,
     uncle := 1, grandparent := 0, node := grandparent); else
     ROTATE arm (node == [parent+8]/[parent] -> pre-rotate via
     0x415fe0/0x415f80 with node := parent — host; parent := 1,
     grandparent := 0, rotate — host); loop while BYTE
     [new parent+0xc] == 0. Rotations are host; the arm decisions
     are pure given the recaptured tree state (inputs).
     OUT (0xa2bf37..0xa2bf3c): [out] := node, byte [out+4] := 1.

   Grow body 0x92e900..0x92ea4b (117 insns, ret 8) + SEH cleanup
   arm 0x92ea4e..0x92ea6b (9 insns; SEH 0xb0ac10; thiscall this +
   TWO stack args: [ebp+8] the caller's advanced end, [ebp+0xc]
   the payload). The v24 laws are consumed BY REFERENCE at their
   exact sites: cur_count == 0x94f209 -> 0x415bc0 (0x92e961),
   cap gate (0x92e990), push-grow-new (0x92e9f6), new_cap >
   0x94f209 -> 0x40cee0 (0x92ea03). This unit's seams:
     size_count = (arg1 - begin) / 0x1b8 and cur_count =
     (end - begin) / 0x1b8 (both the family entry-count model);
     alloc_size = new_cap * 0x1b8 (imul wrap, 0x92e99c) into the
     v24 allocator 0x40cf00 (its fast gate = the v24
     grow_alloc_fast law on the size);
     spot := block + size_count*0x1b8; new_end := spot + 0x1b8;
     emplace 0x92e830(spot, [ebp+0xc]) (host, 3-site census);
     G 0x92e9e7 `cmp arg1, end ; jne 0x92ea0d` — FULL-dword arm
     gate: equal -> ONE 0x92ec30 move call; extended -> TWO
     0x92ed30 move calls (0x92ea11 + 0x92ea24);
     relink 0x92eba0(this, block, cur_count+1, new_cap) (host;
     its destroy-range 0x92ea80 edge is the v39 8-site row);
     SEH cleanup arm (state 0 from 0x92e9ac): destroy wrapper
     0x92e7d0(begin=[ebp-0x14], end=[ebp-0x1c]) at 0x92ea54, free
     wrapper 0x92e7f0(count=[ebp-0x20], begin=[ebp-0x28]) at
     0x92ea5f, unwind 0xaf05eb at 0x92ea68 — the v39 wrapper
     forward edges CONSUMED BY REFERENCE. [ebp-0x14] is the
     constructed-so-far boundary: new_end (pre-emplace), spot
     (post-emplace), block on the extended arm (after the first
     move call), so the cleanup destroy begin is a pure function
     of the failure stage: stage 0 -> new_end (empty range, == the
     host's 0x92eaa6 gate), stage 1 -> spot, stage 2 -> block
     (extended arm) or spot (== arm). The free-wrapper and unwind
     calls run on EVERY stage. */

enum {
  ISAAC_SFX_COPY_PAIR_VA_A2BD60 = 0x00a2bd60u,  /* body root */
  ISAAC_SFX_COPY_PAIR_END_VA_A2BD81 = 0x00a2bd81u, /* ret 8 */
  ISAAC_SFX_COPY_PAIR_NEXT_VA_A2BD90 = 0x00a2bd90u, /* the insert body */
  ISAAC_SFX_COPY_PAIR_CALLERS = 1,
  ISAAC_SFX_COPY_PAIR_CALLER1_VA_A2B6A4 = 0x00a2b6a4u, /* v34 pair-move */
  ISAAC_SFX_COPY_PAIR_IMM32_REFS = 1,
  ISAAC_SFX_COPY_PAIR_BODY_INSNS = 13,
  ISAAC_SFX_COPY_PAIR_STACK_ARGS = 2,
  ISAAC_SFX_COPY_PAIR_RET_IMM = 8,
  ISAAC_SFX_COPY_PAIR_FORWARD_VA_A2BD90 = 0x00a2bd90u,
  ISAAC_SFX_COPY_PAIR_CALL_SITE = 0x00a2bd71u,
  ISAAC_SFX_COPY_PAIR_OUT_COPY_SITE = 0x00a2bd7cu, /* mov [eax],ecx */
  ISAAC_SFX_COPY_PAIR_OUT_FLAG_OFF = 4,  /* out[4] := 1; NOT copied */
  ISAAC_SFX_INSERT_VA_A2BD90 = 0x00a2bd90u,  /* body root */
  ISAAC_SFX_INSERT_END_VA_A2BF51 = 0x00a2bf51u, /* ret 8 */
  ISAAC_SFX_INSERT_NEXT_VA_A2BF60 = 0x00a2bf60u,
  ISAAC_SFX_INSERT_CALLERS = 1,
  ISAAC_SFX_INSERT_CALLER1_VA_A2BD71 = 0x00a2bd71u, /* the wrapper */
  ISAAC_SFX_INSERT_IMM32_REFS = 1,
  ISAAC_SFX_INSERT_BODY_INSNS = 152,
  ISAAC_SFX_INSERT_SEH_HANDLER_VA = 0x00b1227du,
  ISAAC_SFX_INSERT_STACK_ARGS = 2,
  ISAAC_SFX_INSERT_RET_IMM = 8,
  ISAAC_SFX_INSERT_NODE_SIZE = 0x1cu,      /* alloc 0xa0f4c0 */
  ISAAC_SFX_INSERT_NODE_LEFT_OFF = 0,      /* [node] */
  ISAAC_SFX_INSERT_NODE_PARENT_OFF = 4,    /* [node+4] */
  ISAAC_SFX_INSERT_NODE_RIGHT_OFF = 8,     /* [node+8] */
  ISAAC_SFX_INSERT_NODE_COLOR_BYTE_OFF = 0x0cu,
  ISAAC_SFX_INSERT_NODE_FLAG_BYTE_OFF = 0x0du,
  ISAAC_SFX_INSERT_NODE_KEY_DWORD_OFF = 0x10u, /* src[0] copy */
  ISAAC_SFX_INSERT_NODE_PAIR_OFF = 0x14u,  /* 8-byte {src[4], src[8]} */
  ISAAC_SFX_INSERT_TREE_HEAD_OFF = 0,      /* this[0] head node */
  ISAAC_SFX_INSERT_TREE_COUNT_OFF = 4,     /* this[4] element count */
  ISAAC_SFX_INSERT_WALK_START_OFF = 4,     /* walk starts at head[4] */
  ISAAC_SFX_INSERT_COUNT_SENTINEL = 0x09249249u, /* == -> throw */
  ISAAC_SFX_INSERT_WALK_GATE_SITE = 0x00a2be16u, /* BYTE [x+0xd] != 0 */
  ISAAC_SFX_INSERT_WALK_LOOP_SITE = 0x00a2be20u,
  ISAAC_SFX_INSERT_WALK_CMP_SITE = 0x00a2be25u,  /* UNSIGNED jae */
  ISAAC_SFX_INSERT_WALK_RETEST_SITE = 0x00a2be35u, /* BYTE loop gate */
  ISAAC_SFX_INSERT_COUNT_CMP_SITE = 0x00a2be3eu, /* == 0x9249249 */
  ISAAC_SFX_INSERT_COUNT_INC_SITE = 0x00a2be4au, /* this[4]++ */
  ISAAC_SFX_INSERT_SIDE_DETECT_SITE = 0x00a2be31u, /* sbb/neg carry */
  ISAAC_SFX_INSERT_HEAD_ARM_SITE = 0x00a2be54u,  /* parent == head */
  ISAAC_SFX_INSERT_HEAD_COLOR_STORE = 0x00a2be5cu, /* byte [node+0xc]=1 */
  ISAAC_SFX_INSERT_LINK_RIGHT_SITE = 0x00a2be69u, /* [parent+8] := node */
  ISAAC_SFX_INSERT_LINK_LEFT_SITE = 0x00a2be76u,  /* [parent] := node */
  ISAAC_SFX_INSERT_FIXUP_ENTRY_SITE = 0x00a2be83u, /* BYTE [parent+0xc] */
  ISAAC_SFX_INSERT_FIXUP_LOOP_SITE = 0x00a2be90u,
  ISAAC_SFX_INSERT_RECOLOR_SITE = 0x00a2bedau, /* uncle color == 0 arm */
  ISAAC_SFX_INSERT_FIXUP_RETEST_SITE = 0x00a2bf23u, /* BYTE loop gate */
  ISAAC_SFX_INSERT_OUT_STORE_SITE = 0x00a2bf37u,  /* [out] := node */
  ISAAC_SFX_INSERT_OUT_FLAG_SITE = 0x00a2bf3cu,   /* byte [out+4] := 1 */
  ISAAC_SFX_INSERT_THROW_SITE = 0x00a2bf54u,  /* -> 0x4170d0 */
  ISAAC_SFX_INSERT_ALLOC_SITE = 0x00a2bdcfu,  /* -> 0xa0f4c0 */
  ISAAC_SFX_INSERT_ADOPT_SITE = 0x00a2bdf2u,  /* -> 0x8f2d20 */
  ISAAC_SFX_INSERT_ROTATE_SITES = 4,          /* 0x415fe0 x2 + 0x415f80 x2 */
  ISAAC_SFX_INSERT_ROTATE_SITE_1 = 0x00a2beafu, /* -> 0x415fe0 */
  ISAAC_SFX_INSERT_ROTATE_SITE_2 = 0x00a2becdu, /* -> 0x415f80 */
  ISAAC_SFX_INSERT_ROTATE_SITE_3 = 0x00a2befdu, /* -> 0x415f80 */
  ISAAC_SFX_INSERT_ROTATE_SITE_4 = 0x00a2bf1bu, /* -> 0x415fe0 */
  ISAAC_SFX_ADOPT_CALLEE_CENSUS = 10,         /* 0x8f2d20 whole-text */
  /* the two body-spawned rotate callees, whole-text (105 each) */
  ISAAC_SFX_ROTATE_FE0_CENSUS = 105,
  ISAAC_SFX_ROTATE_F80_CENSUS = 105,
  ISAAC_SFX_COPY_PAIR_STEP_LEFT = 0,  /* new_key < node_key -> [node] */
  ISAAC_SFX_COPY_PAIR_STEP_RIGHT = 1, /* new_key >= node_key -> [node+8] */
  ISAAC_SFX_COPY_PAIR_STEP_SITE = 2,  /* BYTE node_flag != 0: stop */
  ISAAC_SFX_GROW_VA_92E900 = 0x0092e900u,     /* body root */
  ISAAC_SFX_GROW_END_VA_92EA4B = 0x0092ea4bu, /* ret 8 */
  ISAAC_SFX_GROW_SEH_ARM_END = 0x0092ea6bu,   /* last cleanup insn */
  ISAAC_SFX_GROW_NEXT_VA_92EA80 = 0x0092ea80u, /* destroy-range host */
  ISAAC_SFX_GROW_CALLERS = 1,
  ISAAC_SFX_GROW_CALLER1_VA_92D654 = 0x0092d654u, /* push-back site */
  ISAAC_SFX_GROW_IMM32_REFS = 1,
  ISAAC_SFX_GROW_BODY_INSNS = 117,
  ISAAC_SFX_GROW_SEH_ARM_INSNS = 9,
  ISAAC_SFX_GROW_SEH_HANDLER_VA = 0x00b0ac10u,
  ISAAC_SFX_GROW_STACK_ARGS = 2,
  ISAAC_SFX_GROW_RET_IMM = 8,
  ISAAC_SFX_GROW_GATE_SITE = 0x0092e9e7u,     /* cmp arg1,end ; jne */
  ISAAC_SFX_GROW_ARM_EQUAL_SITE = 0x0092e9ebu,  /* one 0x92ec30 call */
  ISAAC_SFX_GROW_ARM_EXTENDED_SITE = 0x0092ea0du, /* two 0x92ed30 */
  ISAAC_SFX_GROW_EMPLACE_SITE = 0x0092e9d0u,  /* -> 0x92e830 */
  ISAAC_SFX_GROW_MOVE1_SITE = 0x0092e9efu,    /* -> 0x92ec30 (== arm) */
  ISAAC_SFX_GROW_MOVE2_SITE = 0x0092ea11u,    /* -> 0x92ed30 (ext) */
  ISAAC_SFX_GROW_MOVE3_SITE = 0x0092ea24u,    /* -> 0x92ed30 (ext) */
  ISAAC_SFX_GROW_RELINK_SITE = 0x0092ea32u,   /* -> 0x92eba0 */
  ISAAC_SFX_GROW_ALLOC_SITE = 0x0092e9a2u,    /* -> 0x40cf00 */
  ISAAC_SFX_GROW_THROW_MAX_SITE = 0x0092ea6du,  /* -> 0x415bc0 (v24) */
  ISAAC_SFX_GROW_THROW_OVER_SITE = 0x0092ea72u, /* -> 0x40cee0 (v24) */
  ISAAC_SFX_GROW_DESTROY_WRAP_SITE = 0x0092ea54u, /* -> 0x92e7d0 (v39) */
  ISAAC_SFX_GROW_FREE_WRAP_SITE = 0x0092ea5fu,    /* -> 0x92e7f0 (v39) */
  ISAAC_SFX_GROW_UNWIND_SITE = 0x0092ea68u,       /* -> 0xaf05eb */
  ISAAC_SFX_GROW_ARM_EQUAL_MOVE_CALLS = 1,
  ISAAC_SFX_GROW_ARM_EXTENDED_MOVE_CALLS = 2,
};

typedef struct IsaacSfxCopyPairWrapperPlan {
  uint32_t call_runs;           /* CONSTANT 1 (0xa2bd71 unconditional) */
  uint32_t out_dword_copy_runs; /* CONSTANT 1 (0xa2bd7c) */
  uint32_t out_flag_off;        /* 4: the body's out[4] := 1, NOT copied */
  uint32_t forward_target;      /* 0xa2bd90 (the insert body) */
  uint32_t stack_args;          /* 2 */
  uint32_t ret_imm;             /* 8 */
} IsaacSfxCopyPairWrapperPlan;

typedef struct IsaacSfxCopyPairInsertPlan {
  uint32_t alloc_call_runs;      /* == 1 (0xa0f4c0, node 0x1c) */
  uint32_t node_size;            /* 0x1c */
  uint32_t key_dword_off;        /* 0x10 (src[0] copy) */
  uint32_t pair_off;             /* 0x14 (8-byte {src[4], src[8]}) */
  uint32_t pair_copy_runs;       /* == 1 (0x8f2d20) */
  uint32_t walk_entry;           /* BYTE head[4] flag == 0 -> walk runs */
  uint32_t walk_steps;           /* host chain input */
  uint32_t count_fatal;          /* this[4] == 0x9249249 -> throw 0x4170d0 */
  uint32_t count_inc_store;      /* == !count_fatal */
  uint32_t parent_link_store;    /* == 1 ([node+4] := parent) */
  uint32_t side;                 /* LEFT/RIGHT (sbb/neg of the last cmp) */
  uint32_t head_arm;             /* parent == head */
  uint32_t head_leftmost_update; /* parent == [head+0] */
  uint32_t head_rightmost_update;/* parent == [head+8] */
  uint32_t fixup_entry;          /* BYTE [parent+0xc] == 0 -> fixup runs */
  uint32_t fixup_steps;          /* host chain input */
  uint32_t fixup_recolor;        /* BYTE uncle color == 0 -> recolor arm */
  uint32_t fixup_rotate;         /* == !fixup_recolor */
  uint32_t pre_rotate_left;      /* node == [parent+8] (host input) */
  uint32_t rotation_calls;       /* host tally (0x415fe0/0x415f80) */
  uint32_t out_store_runs;       /* == 1 ([out] := node + out[4] := 1) */
  uint32_t throw_runs;           /* == count_fatal */
  uint32_t stack_args;           /* 2 */
  uint32_t ret_imm;              /* 8 */
} IsaacSfxCopyPairInsertPlan;

typedef struct IsaacSfxGrowPlan {
  uint32_t size_count;           /* (arg1 - begin) / 0x1b8 */
  uint32_t cur_count;            /* (end - begin) / 0x1b8 */
  uint32_t count_max_fatal;      /* v24 vec_count_max (0x92e961) */
  uint32_t cap_gate_max_alloc;   /* v24 vec_cap_gate (0x92e990) */
  uint32_t new_cap;              /* v24 vec_push_grow_new (0x92e9f6) */
  uint32_t new_cap_overflow;     /* v24 vec_cap_overflow (0x92ea03) */
  uint32_t alloc_size;           /* new_cap * 0x1b8 (0x92e99c, wrap) */
  uint32_t alloc_fast;           /* v24 grow_alloc_fast on alloc_size */
  uint32_t spot_offset;          /* size_count * 0x1b8 (0x92e9b3, wrap) */
  uint32_t new_end_offset;       /* spot_offset + 0x1b8 */
  uint32_t extended;             /* G 0x92e9e7: arg1 != end */
  uint32_t move_calls;           /* 1 (== arm) | 2 (extended arm) */
  uint32_t emplace_runs;         /* == 1 (0x92e830) */
  uint32_t relink_runs;          /* == 1 (0x92eba0) */
  uint32_t destroy_wrapper_runs; /* cleanup: 1 iff fail_stage != 0 */
  uint32_t free_wrapper_runs;    /* cleanup: == destroy_wrapper_runs */
  uint32_t unwind_runs;          /* cleanup: == destroy_wrapper_runs */
  uint32_t cleanup_destroy_begin;/* stage/arm derived */
  uint32_t cleanup_destroy_end;  /* new_end (constant) */
  uint32_t cleanup_free_count;   /* new_cap */
  uint32_t cleanup_free_begin;   /* block */
} IsaacSfxGrowPlan;

/* The wrapper's CONSTANT contract: the call (0xa2bd71) and the
   out-dword copy (0xa2bd7c) are unconditional; only the pair's
   first dword is copied (out_flag_off at 4 is the body's flag
   byte, never copied). out may be null (no-op). */
void isaac_sfx_copy_pair_wrapper_plan(IsaacSfxCopyPairWrapperPlan* out);

/* One ordered-tree walk step: BYTE node_flag (& 0xff) != 0 ->
   SITE (the walk stops here); else UNSIGNED (jae, 0xa2be25):
   new_key >= node_key -> RIGHT ([node+8]), else LEFT ([node]). */
int32_t isaac_sfx_copy_pair_walk_step(uint32_t new_key,
                                      uint32_t node_key,
                                      uint32_t node_flag);

/* 0xa2be3e: 1 iff count == 0x9249249 (UNSIGNED equality; the first
   count whose 0x1c byte span overflows 32 bits) — the 0x4170d0
   throw gate. */
int32_t isaac_sfx_copy_pair_count_fatal(uint32_t count);

/* The sbb/neg of the walk's LAST key compare (0xa2be31..0xa2be33,
   carried into 0xa2be65): 1 iff new_key < parent_key (LEFT),
   else 0 (RIGHT). */
int32_t isaac_sfx_copy_pair_side(uint32_t new_key, uint32_t parent_key);

/* Per-call plan (see the struct). walk_steps / fixup_steps /
   rotation_calls are host chain tallies (the walk + fixup lengths
   are chain properties); every DECISION is derived from the given
   tree-state recaptures. out may be null (no-op). */
void isaac_sfx_copy_pair_insert_plan(
    uint32_t count,
    uint32_t head_parent_flag,
    uint32_t new_key,
    uint32_t parent_key,
    uint32_t parent_is_head,
    uint32_t parent_is_head_left,
    uint32_t parent_is_head_right,
    uint32_t parent_color,
    uint32_t uncle_color,
    uint32_t node_is_inner,
    uint32_t walk_steps,
    uint32_t fixup_steps,
    uint32_t rotation_calls,
    IsaacSfxCopyPairInsertPlan* out);

/* G 0x92e9e7 (FULL dword cmp): 1 iff arg1 (new_end) != end — the
   extended arm (TWO 0x92ed30 move calls); 0 = the == arm (ONE
   0x92ec30 call). */
int32_t isaac_sfx_grow_extended(uint32_t new_end, uint32_t old_end);

/* 0x92e99c `imul ecx, edi, 0x1b8`: the allocator size for the new
   capacity, 32-bit wrap. */
uint32_t isaac_sfx_grow_alloc_size(uint32_t new_cap);

/* 0x92e9b3 `imul eax, [ebp-0x1c], 0x1b8`: the emplace spot offset
   from the new block, 32-bit wrap; the new end = spot + 0x1b8. */
uint32_t isaac_sfx_grow_spot_offset(uint32_t size_count);

/* The 0x92e900 SEH cleanup arm (0x92ea4e..0x92ea6b) with the v39
   wrapper forward edges consumed by reference. fail_stage: 0 = no
   exception (no cleanup), 1 = emplace threw (destroy begin ==
   new_end), 2 = a move call threw (begin == spot), 3 = later
   (second move / relink; begin == block on the extended arm, spot
   on the == arm). The free-wrapper call (count = new_cap, begin =
   block) and the 0xaf05eb unwind run on every failure stage.
   out may be null (no-op). */
void isaac_sfx_grow_cleanup_plan(uint32_t fail_stage,
                                 uint32_t extended,
                                 uint32_t block,
                                 uint32_t spot,
                                 uint32_t new_end,
                                 uint32_t new_cap,
                                 IsaacSfxGrowPlan* out);

/* The full body plan (see the struct); the v24 growth laws are
   consumed by reference (vec_count_max / vec_cap_gate /
   vec_push_grow_new / vec_cap_overflow / grow_alloc_fast).
   fail_stage feeds the cleanup fields. out may be null (no-op). */
void isaac_sfx_grow_plan(uint32_t new_end,
                         uint32_t begin,
                         uint32_t old_end,
                         uint32_t cap,
                         uint32_t block,
                         uint32_t fail_stage,
                         IsaacSfxGrowPlan* out);

/* v40 census pins (lea-corrected tooling; see notes sfx-v40-pairgrow). */
uint32_t isaac_sfx_copy_pair_end_va(void);
uint32_t isaac_sfx_copy_pair_next_va(void);
uint32_t isaac_sfx_copy_pair_callers(void);
uint32_t isaac_sfx_copy_pair_caller1_va(void);
uint32_t isaac_sfx_copy_pair_imm32_refs(void);
uint32_t isaac_sfx_copy_pair_body_insns(void);
uint32_t isaac_sfx_copy_pair_stack_args(void);
uint32_t isaac_sfx_copy_pair_ret_imm(void);
uint32_t isaac_sfx_copy_pair_forward_va(void);
uint32_t isaac_sfx_copy_pair_call_site(void);
uint32_t isaac_sfx_copy_pair_out_copy_site(void);
uint32_t isaac_sfx_copy_pair_out_flag_off(void);
uint32_t isaac_sfx_insert_end_va(void);
uint32_t isaac_sfx_insert_next_va(void);
uint32_t isaac_sfx_insert_callers(void);
uint32_t isaac_sfx_insert_caller1_va(void);
uint32_t isaac_sfx_insert_imm32_refs(void);
uint32_t isaac_sfx_insert_body_insns(void);
uint32_t isaac_sfx_insert_seh_handler_va(void);
uint32_t isaac_sfx_insert_stack_args(void);
uint32_t isaac_sfx_insert_ret_imm(void);
uint32_t isaac_sfx_insert_node_size(void);
uint32_t isaac_sfx_insert_node_left_off(void);
uint32_t isaac_sfx_insert_node_parent_off(void);
uint32_t isaac_sfx_insert_node_right_off(void);
uint32_t isaac_sfx_insert_node_color_byte_off(void);
uint32_t isaac_sfx_insert_node_flag_byte_off(void);
uint32_t isaac_sfx_insert_node_key_dword_off(void);
uint32_t isaac_sfx_insert_node_pair_off(void);
uint32_t isaac_sfx_insert_tree_head_off(void);
uint32_t isaac_sfx_insert_tree_count_off(void);
uint32_t isaac_sfx_insert_walk_start_off(void);
uint32_t isaac_sfx_insert_count_sentinel(void);
uint32_t isaac_sfx_insert_walk_gate_site(void);
uint32_t isaac_sfx_insert_walk_loop_site(void);
uint32_t isaac_sfx_insert_walk_cmp_site(void);
uint32_t isaac_sfx_insert_walk_retest_site(void);
uint32_t isaac_sfx_insert_count_cmp_site(void);
uint32_t isaac_sfx_insert_count_inc_site(void);
uint32_t isaac_sfx_insert_side_detect_site(void);
uint32_t isaac_sfx_insert_head_arm_site(void);
uint32_t isaac_sfx_insert_head_color_store(void);
uint32_t isaac_sfx_insert_link_right_site(void);
uint32_t isaac_sfx_insert_link_left_site(void);
uint32_t isaac_sfx_insert_fixup_entry_site(void);
uint32_t isaac_sfx_insert_fixup_loop_site(void);
uint32_t isaac_sfx_insert_recolor_site(void);
uint32_t isaac_sfx_insert_fixup_retest_site(void);
uint32_t isaac_sfx_insert_out_store_site(void);
uint32_t isaac_sfx_insert_out_flag_site(void);
uint32_t isaac_sfx_insert_throw_site(void);
uint32_t isaac_sfx_insert_alloc_site(void);
uint32_t isaac_sfx_insert_adopt_site(void);
uint32_t isaac_sfx_insert_rotate_sites(void);
uint32_t isaac_sfx_insert_rotate_site1(void);
uint32_t isaac_sfx_insert_rotate_site2(void);
uint32_t isaac_sfx_insert_rotate_site3(void);
uint32_t isaac_sfx_insert_rotate_site4(void);
uint32_t isaac_sfx_adopt_callee_census(void);
uint32_t isaac_sfx_rotate_fe0_census(void);
uint32_t isaac_sfx_rotate_f80_census(void);
uint32_t isaac_sfx_grow_end_va(void);
uint32_t isaac_sfx_grow_seh_arm_end(void);
uint32_t isaac_sfx_grow_next_va(void);
uint32_t isaac_sfx_grow_callers(void);
uint32_t isaac_sfx_grow_caller1_va(void);
uint32_t isaac_sfx_grow_imm32_refs(void);
uint32_t isaac_sfx_grow_body_insns(void);
uint32_t isaac_sfx_grow_seh_arm_insns(void);
uint32_t isaac_sfx_grow_seh_handler_va(void);
uint32_t isaac_sfx_grow_stack_args(void);
uint32_t isaac_sfx_grow_ret_imm(void);
uint32_t isaac_sfx_grow_gate_site(void);
uint32_t isaac_sfx_grow_arm_equal_site(void);
uint32_t isaac_sfx_grow_arm_extended_site(void);
uint32_t isaac_sfx_grow_emplace_site(void);
uint32_t isaac_sfx_grow_move1_site(void);
uint32_t isaac_sfx_grow_move2_site(void);
uint32_t isaac_sfx_grow_move3_site(void);
uint32_t isaac_sfx_grow_relink_site(void);
uint32_t isaac_sfx_grow_alloc_site(void);
uint32_t isaac_sfx_grow_throw_max_site(void);
uint32_t isaac_sfx_grow_throw_over_site(void);
uint32_t isaac_sfx_grow_destroy_wrap_site(void);
uint32_t isaac_sfx_grow_free_wrap_site(void);
uint32_t isaac_sfx_grow_unwind_site(void);
uint32_t isaac_sfx_grow_arm_equal_move_calls(void);
uint32_t isaac_sfx_grow_arm_extended_move_calls(void);

/* ---------- v41: 0xa2bf60 leaf/node destroy body — the insert
   body's own EH-destroy sibling and the sequential frontier after
   the v40 landing (notes sfx-v41-frontier; fresh dump
   cpu-dump/00a2bf60.txt + census-sfx-v41.py)

   Frontier scan THIS unit: window 0xa2bf60..0xa2cf60 (4KB cap,
   11 bodies classified; identify-zhl ONE invocation, exactMatches
   [] for every body):
     0xa2bf60  LEAF/NODE DESTROY — landed below
     0xa2bfe0  CRT UTF-8 -> UTF-16 decoder (jump tables
               0xa2c1fc/0xa2c20c/0xa2c224 + lead table 0xb9c470) — HOST
     0xa2c250  wide-pad helper (0xa112c0 logger + SEH 0xb122ad) — HOST
     0xa2c370  narrow->wide converter (SEH 0xb122ad) — HOST
     0xa2c470  UTF-8 decode loop writer — HOST
     0xa2c570  UTF-16 -> UTF-8 encoder (jt 0xa2c6cc, tbl 0xb9c528) — HOST
     0xa2c6e0  convert driver (fn-ptr table 0xa2c470/0xa2c570) — HOST
     0xa2c860  vector grow helper — HOST allocator
     0xa2c8b0  vector byte-insert helper — HOST allocator
     0xa2c980  foreign-family zero-init (16 x 0x28 slots + memset
               0x280; callers 0xa1e165/0xa1f8d8 outside this
               cluster) — pinned HOST for this family
     0xa2ca10  giant switch dispatcher (jump table 0xa30348, 1472
               direct callers, Windows API imports) — giant HOST

   THE LANDED BODY 0xa2bf60..0xa2bfda (48 insns, plain ret, SEH
   0xaf09f0 pushed at 0xa2bf65, cookie 0xbf93b4): the destroy-side
   sibling of the v39 list-clear, named next-open by the v40
   handoff. thiscall this = esi; the machine:
     0xa2bf86  node := [this+4]
     G1 0xa2bf89  node == 0 -> reload (skips probe AND free)
     0xa2bf8d  pair := node + 0x14 ; state := 0
     0xa2bf97  obj := [pair+4]  (== [node+0x18])
     G2 0xa2bf9c  obj == 0 -> reload (free still runs)
     P1 0xa2bfa3  call [obj->vtbl+0xc] -> al    (HOST probe)
     G3 0xa2bfa7  BYTE al == 0 -> reload        (& 0xff gate)
     H1 0xa2bfa9  hook := [0xc7f484]            (the 30-ref census)
     G4 0xa2bfb0  hook == 0 -> reload
     C1 0xa2bfb3  hook(pair); esp += 4          (HOST)
     R1 0xa2bfb8  RELOAD node := [this+4]       (every path lands here)
     G5 0xa2bfbb  reloaded node == 0 -> skip free
     F1 0xa2bfc2  free(node, 0x1c) via 0xaef15c (HOST allocator)
     epilogue: fs:[0] restore, plain ret at 0xa2bfda.
   So: probe_call_runs = (node != 0 && obj != 0);
       hook_call_runs = probe arm && LOW-BYTE(probe_bit) != 0 &&
                        hook_present != 0 (arg = node+0x14);
       free_runs = (node != 0); reload_runs is CONSTANT 1.
   Inbound census (lea-corrected decode): ZERO E8 callers image-wide;
   ONE E9 cold thunk 0xb12273 (`lea ecx,[ebp-0x14]; jmp` — the
   insert body's own unwind-map entry stub; funcinfo 0xbd2d80,
   handler 0xb1227d = the push at 0xa2bd95); ZERO imm32 refs. The
   receiver identity (which container owns the freed node) stays
   OPEN on purpose: the plan consumes node/obj as recaptured values,
   so nothing here asserts a tree-object layout beyond the v40
   insert body's own {head@0, count@4} reads. */

enum {
  ISAAC_SFX_LEAF_DESTROY_VA_A2BF60 = 0x00a2bf60u,
  ISAAC_SFX_LEAF_DESTROY_END_VA_A2BFDA = 0x00a2bfdau, /* plain ret */
  ISAAC_SFX_LEAF_DESTROY_NEXT_VA_A2BFE0 = 0x00a2bfe0u, /* CRT utf8 host */
  ISAAC_SFX_LEAF_DESTROY_E8_CALLERS = 0,
  ISAAC_SFX_LEAF_DESTROY_E9_COLD_VA_B12273 = 0x00b12273u,
  ISAAC_SFX_LEAF_DESTROY_IMM32_REFS = 0,
  ISAAC_SFX_LEAF_DESTROY_BODY_INSNS = 48,
  ISAAC_SFX_LEAF_DESTROY_SEH_HANDLER_VA_AF09F0 = 0x00af09f0u,
  ISAAC_SFX_LEAF_DESTROY_NODE_LOAD_SITE = 0x00a2bf86u,
  ISAAC_SFX_LEAF_DESTROY_PAIR_ADD_SITE = 0x00a2bf8du,
  ISAAC_SFX_LEAF_DESTROY_OBJ_LOAD_SITE = 0x00a2bf97u,
  ISAAC_SFX_LEAF_DESTROY_PROBE_CALL_SITE = 0x00a2bfa3u,
  ISAAC_SFX_LEAF_DESTROY_HOOK_READ_SITE = 0x00a2bfa9u,
  ISAAC_SFX_LEAF_DESTROY_HOOK_CALL_SITE = 0x00a2bfb3u,
  ISAAC_SFX_LEAF_DESTROY_RELOAD_SITE = 0x00a2bfb8u,
  ISAAC_SFX_LEAF_DESTROY_FREE_SITE = 0x00a2bfc2u,
  ISAAC_SFX_LEAF_DESTROY_NODE_OFF_4 = 4u,      /* [this+4] */
  ISAAC_SFX_LEAF_DESTROY_PAIR_OFF_14 = 0x14u,  /* node + 0x14 */
  ISAAC_SFX_LEAF_DESTROY_OBJ_OFF_4 = 4u,       /* [pair+4], abs 0x18 */
  ISAAC_SFX_LEAF_DESTROY_PROBE_VTBL_SLOT_0C = 0x0cu,
  ISAAC_SFX_LEAF_DESTROY_FREE_SIZE_1C = 0x1cu,
  ISAAC_SFX_LEAF_DESTROY_FREE_CALLEE_AEF15C = 0x00aef15cu,
  ISAAC_SFX_LEAF_DESTROY_INDIRECT_CALLS = 2,
  ISAAC_SFX_LEAF_DESTROY_HOOK_REFS_INBODY = 1,
};

typedef struct IsaacSfxLeafDestroyPlan {
  uint32_t node_loaded;     /* != 0 iff node != 0 (gate 0xa2bf89) */
  uint32_t pair_offset;     /* CONSTANT 0x14 (add at 0xa2bf8d) */
  uint32_t probe_call_runs; /* node != 0 && obj != 0 (0xa2bfa3) */
  uint32_t probe_vtbl_slot; /* CONSTANT 0xc (load at 0xa2bfa0) */
  uint32_t hook_call_runs;  /* probe arm && BYTE bit && hook present */
  uint32_t hook_arg;        /* node + 0x14 when the hook runs, else 0 */
  uint32_t reload_runs;     /* CONSTANT 1 (0xa2bfb8, all paths) */
  uint32_t free_runs;       /* != 0 iff node != 0 (reloaded; 0xa2bfc2) */
  uint32_t free_size;       /* CONSTANT 0x1c */
  uint32_t seh_handler_va;  /* CONSTANT 0xaf09f0 */
  uint32_t stack_args;      /* CONSTANT 0 */
  uint32_t ret_imm;         /* CONSTANT 0 (plain ret) */
} IsaacSfxLeafDestroyPlan;

/* The whole-body decision/tally layer. node / pair_obj /
   probe_bit / hook_present are recaptures (the vtable probe and
   the hook call are HOST edges; their RESULTS are inputs). out may
   be null (no-op). */
void isaac_sfx_leaf_destroy_plan(uint32_t node,
                                 uint32_t pair_obj,
                                 uint32_t probe_bit,
                                 uint32_t hook_present,
                                 IsaacSfxLeafDestroyPlan* out);

/* v41 census pins (lea-corrected tooling; see notes
   sfx-v41-frontier). */
uint32_t isaac_sfx_leaf_destroy_end_va(void);
uint32_t isaac_sfx_leaf_destroy_next_va(void);
uint32_t isaac_sfx_leaf_destroy_e8_callers(void);
uint32_t isaac_sfx_leaf_destroy_e9_cold_va(void);
uint32_t isaac_sfx_leaf_destroy_imm32_refs(void);
uint32_t isaac_sfx_leaf_destroy_body_insns(void);
uint32_t isaac_sfx_leaf_destroy_seh_handler_va(void);
uint32_t isaac_sfx_leaf_destroy_node_load_site(void);
uint32_t isaac_sfx_leaf_destroy_pair_add_site(void);
uint32_t isaac_sfx_leaf_destroy_obj_load_site(void);
uint32_t isaac_sfx_leaf_destroy_probe_call_site(void);
uint32_t isaac_sfx_leaf_destroy_hook_read_site(void);
uint32_t isaac_sfx_leaf_destroy_hook_call_site(void);
uint32_t isaac_sfx_leaf_destroy_reload_site(void);
uint32_t isaac_sfx_leaf_destroy_free_site(void);
uint32_t isaac_sfx_leaf_destroy_node_off(void);
uint32_t isaac_sfx_leaf_destroy_pair_off(void);
uint32_t isaac_sfx_leaf_destroy_obj_off(void);
uint32_t isaac_sfx_leaf_destroy_probe_vtbl_slot(void);
uint32_t isaac_sfx_leaf_destroy_free_size(void);
uint32_t isaac_sfx_leaf_destroy_free_callee_va(void);

uint32_t isaac_sfx_pure_helpers_abi_version(void);

#ifdef __cplusplus
}
#endif
