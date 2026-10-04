#pragma once

#include <stdint.h>

#ifdef __cplusplus
extern "C" {
#endif

/* Pure subsets recovered from LuaEngine root pinning + frame residual
   opaque_call_008607a0 (VA 0x008607a0). Freestanding only — not wired into
   Game::Update ABI and not a Lua boot slice.

   Evidence (hash-bound):
     tools/isaac-ng.unpacked.exe SHA-256 5129DF72…7200
     multi-evidence pins: Init 0x008604c0, RegisterClasses 0x00866960,
       RunBundledScript 0x0086e5e0
     exact ZHL destroy pin 0x0086e520 (unique)
     FrameOpaque_8607a0 decompile + agent3 / host-event residual notes
     ZHL LuaEngine struct layout (offsets version-bound until re-verified)
     PE Capstone of Init / RunBundled / FUN_0086e6c0 (0x0086e6c0) /
       RegisterClasses head / destroy 0x0086e520 /
       materialize FUN_00872980 (0x00872980) /
       method-install helpers 0x008a06a0 family /
       stack-ref RAII 0x0085dab0 / 0x008a7e10 / 0x0085d910 /
       pop 0x0085cce0 / class create registry rawseti /
       method 0x008a06a0 SetReference imms + Vector class create (ABI v8)

   ABI v44: LuaRef-holder destructor 0x008a80b0 pure CF — member offsets
     (state +0 / ref +4 / string +8), full-word push conduct into host
     luaL_unref (ref, LUA_REGISTRYINDEX, state), registryindex imm,
     cdecl cleanup 0xc, ret 0, 4 COMDAT scope-dtor tail thunks, and the
     Tidy-before-unref ordering law.
   ABI v45: SetReference wrapper successors 0x008a8180 / 0x008a81d0 /
     0x008a8270 (the "0x008a80d0+ band" after the landed v10 wrapper) —
     shared registry ref-set decision (lua_type(L,1) full-word test;
     zero -> obj 0 else check-helper key 0xc82980 -> [ret+4]), per-wrapper
     check flags (0 / 1 / 1), touserdata upvalueindex(1) index, ud[0]
     thiscall fn off, return values (0 / 1 / 1), wrapper #2 newuserdata
     0x10 + vtable tag 0xb73574 + payload self-off +4/+8 + rawgetp
     metatable key == check key + setmetatable −2 + 8-byte ret-slot copy
     {lo,hi}, wrapper #3 arg2 getArgObject helper 0x8baa50 (error string
     0xb7539c "nil passed to reference", nil gate + null gate) + vec of 2
     floats + x87 fstp/movss float32 ret + pushnumber helper 0x85c050
     (cvtss2sd widening law) + return 1. Install sites (pushcclosure fn
     literal): 0x8a05b0 / 0x8a0521 / 0x8a0481. Host lua_* IAT and
     0x0085c590 / ud[0] / newuserdata-metatable calls stay host.
   ABI v46: closure-install helpers 0x008a0460 / 0x008a0500 /
     0x008a05a0 (the pushcclosure band AFTER the landed 0x8a06a0
     SetReference helper) — DUAL register-held shape (0x8a0460/0x8a0500:
     ud[0] = [ebp+8] real_fn, name from edx, pushvalue lua_pushvalue(L,-1)
     dups the closure, TWO absindex/pushstring/rotate/rawset chains at −5
     then −3, cleanups 0x40+0x24) vs SINGLE immediate-held shape (0x8a05a0:
     ud[0] = imm real_fn, imm name, ONE chain at −3, cleanup 0x38) +
     per-site register-call records (7 Vector sites) and the
     register-vs-immediate consume law.
   ABI v47: the remaining nine closure-install helpers of the same band
     (indices 3..11: 0x8a0400 / 0x8a0360 / 0x8a0220 / 0x8a01c0 /
     0x8a0160 / 0x8a00c0 / 0x8a0020 / 0x89ff80 / 0x89fee0) — all one C++
     template with per-site laws, plus a NEW third shape DUAL_IMM
     (0x8a00c0 / 0x89fee0): dual chain layout (pushvalue dup + 2 rawset
     chains, cleanups 0x40+0x24) but name + real_fn are BODY IMMEDIATES;
     edx and [ebp+8] are NOT consumed (no ebx spill, no [ebp+8] read;
     name pushed twice as an imm), rotate called directly through
     [0xb1840c] instead of the ebx-cached DUAL form. Laws extended:
     chain count 2 for DUAL + DUAL_IMM, name/real_fn source IMMEDIATE for
     SINGLE + DUAL_IMM (REGISTER for DUAL). Per-site records 7 -> 21
     (14 new Vector sites Lerp .. __tostring, ascending callVa between
     0x00866aeb and 0x00866c72). All nine bodies address-stable (no exact
     ZHL).
   ABI v50: the FontRenderSettings install helpers 0x0089fde0 / 0x0089fd80
     (helpers 12 + 13 of the v47 template family, 14 rows now) — the
     pushcclosure band BELOW 0x89fee0 that pushes the v49 wrapper bodies.
     Helper 12 = DUAL_IMM (0x89fde0, 67 insns, ret 0x89fe76, wrapper
     0x8a89e0 GetAlignment, name imm 0xb702a0 x2, ud[0] imm 0x40c3a0,
     chain 1 @ -5 then chain 2 @ -3, cleanups 0x40 + 0x24); helper 13 =
     SINGLE with REGISTER-held operands (0x89fd80, 50 insns, ret 0x89fdd3,
     wrapper 0x8a8a40 setter, name from edx, ud[0] = [ebp+8], ONE chain @
     -3, cleanup 0x38) — a NEW source combination (SINGLE shape, REGISTER
     operands) that the v47 shape-derived source law cannot express.
     NAME_SOURCE / REAL_FN_SOURCE became per-helper 14-row tables.
     Per-site records 21 -> 25 (4 FontRenderSettings installs
     0x866dcc .. 0x866e35). The v47 consume law now keys off the SOURCE
     table (REGISTER -> pass operand through, IMMEDIATE -> body imm).
   ABI v1: frame unref gate, GetMaskedPointer XOR, GetLuaDebug.
   ABI v2: Init pure pointer-mask mix (post host seed), Init boot path
     predicates (custom allocator / debug / requiref table), shared heap
     tracker base select, RunBundled alloc/path-copy constants + null gate.
   ABI v3: tracked-alloc commit (header + payload + tracker add64) shared by
     Init registry malloc and RunBundled path buffer; Init field-store pure
     islands (+0x10/+0x14/+0x18); RunBundled fopen gate; FUN_0086e6c0 pure
     list/SSO/load status gates (script runner residual body of RunBundled);
     RegisterClasses entry state-ready + relative stack-index constant;
     MSVC basic_string free pure size/align checks used on the boot path.
   ABI v4: LuaEngine::destroy pure list/registry teardown islands; shared
     doubly-linked list unlink + count dec (destroy reset / FUN_0086e6c0
     match-remove); FUN_00872980 materialize call nargs/nresults + out
     layout; RegisterClasses table-install userdata size + closure nups
     immediates; registry object free size shared with destroy.
   ABI v5: deeper RegisterClasses table-install pure islands — method-helper
     relative stack indices (-1/-3/-4/-5), method-closure nups=1 (distinct
     from class-ctor nups=0), stack-ref RAII nest/return/settop pure (helpers
     0x0085dab0 / 0x008a7e10 / 0x0085d910), metatable-create-needed gate,
     userdata C-function store identity, set-meta push-1 immediate.
   ABI v6: stack-ref construct pure (0x0085dab0 pre/post IAT slot stores +
     return this) and stack-ref pop pure (0x0085cce0 slots-ready / settop
     index ~count / slots after). First host residual after pure state load
     is IAT lua_getglobal inside construct @ 0x0085dac2.
   ABI v7: class create 0x008a7e10 pure prologue beyond nest (state copy from
     src, slots interim init, return this) + EntityPtr create-path registry
     rawseti keys for stack -1/-2/-3 + name/ctor/metamethod rdata VAs.
     Sequential RegisterClasses call site 0x008669a8 → 0x008a7e10; first host
     IAT after pure nest stores is @ 0x008a7e65 (lua_pushvalue).
   ABI v8: method-install helper 0x008a06a0 pure imms (EntityPtr SetReference
     name/wrapper/real_fn VAs + table absindex −3) + class-create residual
     first-pushvalue index (−1 @ 0x008a7e65) + already-registered dual
     setmetatable stack indices (−3 then −2) + sibling Vector class create
     0x008a7c00 name/ctor/registry keys (parallel EntityPtr shape).
   ABI v9: method helper 0x008a06a0 remaining pure between IAT chain —
     corrected import map (newuserdata → pushcclosure → absindex →
     pushstring → rotate → rawset); peel absindex idx, rotate idx/n, stack
     cleanup 0x38; recharacterize v5 "set-meta push-1" / v8 "pushvalue −3"
     as rotate n=1 and absindex −3 on this path. Host lua_* IAT stay
     address-stable.
   ABI v10: SetReference wrapper 0x008a80d0 pure indices/keys/constants —
     lua_type arg indices 1/2, registry keys 0xc8297d/0xc8297a, touserdata
     index 0xfff0b9d7 (lua_upvalueindex(1)), type-nonzero gates, check-helper
     stack indices 1/2 + flags 0, object field +4, return 0. Host lua_* IAT
     and 0x0085c590 / real_fn call remain address-stable.
   ABI v11: check/get helper 0x0085c590 pure args/gates around host
     lua_rawgetp / lua_isuserdata IAT (and residual pure constants on the
     identity/const/parent/type paths). All lua_* IAT stay host.
   ABI v12: remaining pure CF/imms in 0x0085c590 body after first host IAT
     0x0085c5ab — rawequal match gate, parent-type present gate, lua_copy
     dest/src, parent/type rotate imms, tolstring len/indices, got needs
     typename gate, absindex −1, stack-index store identity. IAT stay host.
   ABI v13: frame residual 0x008607a0 pure CF around platform unref +
     FUN_00872980 materialize pure imms between IAT — flag mask, engine
     global DAT, registry-holder off (+0x10), materialize stack arg imms
     (1 / −1), SEH try level, luaL_unref REGISTRYINDEX; materialize
     rawgeti/ref REGISTRYINDEX, pcallk msgh/ctx/k zeros, pushvalue −1,
     settop −2, input layout offs, out state/ref stores. All lua_* IAT
     and materialize/unref call bodies stay host.
   ABI v14: FUN_00872980 residual pure CF around first IAT lua_rawgeti
     @ 0x0087299c — holder object field offs (state +0 / key +4),
     cdq lua_Integer lo/hi sign-extend (rawgeti key + pushinteger ×2),
     post-IAT stack cleanup sizes (0x1c / 0xc / 0x18), return-out
     identity. Host IAT stay address-stable.
   ABI v15: deeper RegisterClasses (0x00866960 … ret 0x0086e4c9, 0x7b6a
     bytes) pure *structural* table-install model, recovered by exhaustive
     Capstone scan of the whole body — not by pattern guessing:
       - install record shape `mov ecx,<recv>; add esp,imm8; mov edx,imm32;
         push imm32; call rel32` in three observed operand schedulings
         (REP ×89 / PRE ×3 / EPR ×3, 95 sites) whose encoded size is
         scheduling-invariant: 21 bytes for an `[ebp-disp8]` receiver,
         20 for a `[esi]` receiver. Predicted stride matched every one of
         the 82 adjacent record pairs in the body.
       - operand role decode proven from the callee body, not proximity:
         metamethod setter 0x0085bf90 takes ecx=L, edx=table index,
         [ebp+8]=name → for its 10 sites edx is the −2 index and the pushed
         imm is the .rdata name; the other 85 sites carry edx=.rdata name
         and pushed=.text target. Section membership separates the two with
         no overlap (85/85 and 10/10).
       - x86 push-immediate encoding rule `push imm8` iff the value is a
         signed byte, else `push imm32` — 0 mismatches over all 3377
         immediate pushes in the body; and rel32 call resolution
         (target = site+5+rel32) — 0 mismatches over all 1824 direct calls.
       - property/enum builder chain `push a2; push a1; push a0(.rdata);
         mov ecx,eax; call` — 413 sites, arg0 in .rdata for all 413,
         chained receiver eax on 408; entry byte-size model exact 413/413.
       - MSVC EH state slot [ebp-4]: 181 stores (103 byte-form / 78
         dword-form / 36 unwind −1). Byte form only ever appears where the
         incoming state is in [0,0xff] (0 violations), and every store after
         an unwind −1 uses the dword form (36/36) — x86-exact partial-store
         semantics translated.
       - local layout: 19 scope-exit `0x0085cce0(this=&local,
         arg=*(local+4))` sites, delta 4 on all 19; 37 class-create
         prologues all loading the Lua state from engine+0x18.
       - per-entry constant table for the representative Vector class span
         (23 install entries 0x00866a82…0x00866c72 + 2 property entries).
     Every `lua_*` IAT, install helper, builder helper and class-create
     body stays an address-stable host call.
   ABI v16: the single RegisterClasses branch and the tail it selects.
     - `engine+0x1c` data flow proven end to end. `0x0086064f` is the *only*
       caller of RegisterClasses in the image (one `E8` site; the dword
       `0x00866960` occurs zero times anywhere in the file, so there is no
       vtable/function-pointer edge). At that site Init does
       `mov al, byte [ebp+8]` (`0x00860647`) → `mov ecx, esi` →
       `mov byte [esi+0x1c], al` (`0x0086064c`) → `call 0x00866960`
       (`0x0086064f`): store to call with **no intervening call and no
       intervening branch target** (both incoming edges, `jmp` @ `0x0086060d`
       and `je` @ `0x0086061b`, converge on `0x00860647`, before the load).
       So `[ebx+0x1c]` at RegisterClasses entry is exactly the low byte of
       the Init `bool` stack argument, and no other writer of `+0x1c`
       anywhere in the image can reach it.
     - The byte is genuinely **variable**, so it is modelled as a captured
       input with both sides translated, capture point `0x0086064c`. Init has
       3 callers: boot `0x009aa6f7` passes a runtime local (`[ebp-0x198]`);
       reload sites `0x008f8c28` and `0x009b246f` each `destroy()` then pass
       `movzx eax, byte [esi+0x1c]` — the engine's own current byte — back
       into the same parameter, so the flag round-trips across reloads.
     - Branch `cmp byte [ebx+0x1c], 0` / `jne 0x0086e483` @ `0x0086e461`:
       the guarded block runs only when the byte is 0. Init tests the *same*
       byte at `0x008605b0` (`cmp byte [ebp+8], 0` / `je`, ABI v2
       `init_take_debug_path`), so the RegisterClasses gate is the exact
       complement of the Init debug predicate — a machine cross-check, not
       an interpretation.
     - Tail `0x0086e43f … ret 0x0086e4c9` translated as a repeated global
       install record `push 0; push cfunc; push [ebx+0x18]; call
       lua_pushcclosure; add esp,0xc; push name; push [ebx+0x18]; call
       lua_setglobal; add esp,8` = 28 bytes, or 25 when the setglobal
       cleanup merges into the next record's (`add esp, 0x14` = 8 + 0xc).
       4 entries; entry 1 is the gated one.
     - Closes the one v15 modelling gap: the closure-install prelude
       (`newuserdata(L,4)` + `ud[0]=real_fn` + `pushcclosure(nups=1)`) has
       exactly 2 instances in the body, both `28 + 2 × push-L bytes`
       (34 with an `[ebp-disp8]` state load, 32 with `[esi]`), so the v15
       install record stays 21/20 across it.
     - Generic per-class constant table: 8 named class registrations with
       their create-helper VAs, plus fully recovered install/property runs
       for EntityPtr, Vector and KColor.
   ABI v17: the class-create helper family proven as one template.
     All 8 helpers are 528 bytes / 179 instructions and 503 of those 528
     bytes (95.3%) are byte-identical across every instance. The direct
     call targets (0x0085d040 / 0x0085d2c0 / 0x0085d500) and the whole
     lua_* IAT sequence are identical in all 8. Only 25 bytes differ, in
     12 runs, and every one is a per-instance immediate of exactly three
     kinds, each an exact arithmetic progression over the registration
     index r (0 = EntityPtr, first registered):
       create helper VA   = 0x008a7e10 - 0x210 * r
       __gc closure VA    = 0x008c32b0 - 0x20  * r
       registry key(-3)   = 0x00c8297c + 3     * r   (-2 = +1, -1 = +2)
     plus the class name VA, which is data, not arithmetic. All three laws
     reproduce the PE for all 8 instances and agree with the ABI v7/v8
     EntityPtr and Vector constants recovered independently.
     Recharacterization (v9 precedent, names kept for ABI continuity): the
     .text pointer v7/v8 recorded as `..._CTOR_VA` is NOT a constructor.
     The PE does `lua_pushcclosure(L, fn, 0)`, then `absindex(-2)`,
     `pushstring("__gc")` (literal at 0x00b753b4), `rotate(-2, 1)`,
     `rawset` — so it is installed as the `__gc` metamethod. The real
     constructor is the separate closure RegisterClasses installs under
     `__call`. Old constants retained; corrected accessors added.
     Class span rule, used to populate the per-class table from structure:
     a class's span is (own create call, next create call) and its install
     run is every install site in that span whose receiver is the slot the
     create `lea ecx, [ebp-slot]` wrote. 6 of 8 spans are receiver-clean
     (100% agreement); FontRenderSettings (13 installs) and Font (10) are
     newly populated on that basis. Color and Sprite stay unpopulated
     because their spans contain `[esi]`-receiver installs from an
     unresolved nested registration, and EntityRef stays unpopulated
     because it has no successor create, so its span has no proven upper
     bound. Guessing any of the three was avoided.
   ABI v18: the three shared calls inside the class-create template are
     metatable builders, now translated as ordered metafield programs.
       0x0085d040 `ret 4`  const metatable  — 5 metafields
       0x0085d2c0 `ret 4`  class metatable  — 8 metafields
       0x0085d500 `ret 4`  static metatable — 6 metafields
     Each takes ecx = the class stack-ref and one stack argument (the class
     name), and each ends with a gated `__metatable = nil`.
     Every one of the 19 metafield installs uses the identical record
     `absindex(idx) / pushstring(name) / rotate(-2, 1) / rawset(abs)` —
     rotate is (-2, 1) on **19/19**, absindex is -2 on **18/19** with one
     documented exception (`__class` in the class builder uses -3). That is
     the same record shape as the ABI v9 method-install tail and the ABI v15
     metamethod setter 0x0085bf90, so three independently recovered paths
     agree on it.
     Prologue, shared by the const and class builders: createtable(0, 0);
     pushvalue(-1); setmetatable(-2); pushboolean(1);
     rawsetp(-2, 0x00c7f4b8). That key is the ABI v11
     CHECK_GET_IDENTITY_KEY_VA — the builders *write* `true` under the key
     the v11 check helper *reads*, an independent two-sided confirmation.
     The static builder instead does createtable ×2, pushvalue(-1),
     setmetatable(-3), rotate(-2, 1), then rawsets the class name into the
     outer table at absindex(-5).
     The const builder's `__type` value is an MSVC string built from the
     6-char literal "const " (SSO capacity 0xf, length 6, source dwords
     0x00b6eaa4 / 0x00b6eaa8) concatenated with the class name; the class
     builder's `__type` is the bare class name. The surrounding MSVC string
     free uses the ABI v3 constants 0x10 / 0x1000 / 0x1f unchanged.
     `__metatable = nil` is guarded by `call 0x0085c390; test al, al; je`.
     That callee reads `fs:[0x2c]` TLS plus globals 0x00c7f4b4 / 0x00c7f4b0,
     so it stays host; only the low-byte gate on its return is translated.
     These calls do **not** unblock Color and Sprite. Their `[esi]`-receiver
     installs come from `mov esi, eax` after a *property-builder* helper
     (0x00875960 / 0x008757f0 / 0x00875ae0) returns a stack-ref, then
     `mov ecx, [esi]`. That is the builder-helper return contract, a
     different boundary, so both classes keep SPAN_MIXED_RECEIVER and
     EntityRef keeps SPAN_NO_SUCCESSOR.
     ZHL naming tension on `+0x1c` is recorded, not resolved by renaming:
     ZHL calls it `_runCallbackRegistryKey`, but the PE stores the Init
     `bool` there as a byte, tests it as a byte, and round-trips it through
     the `bool` parameter on reload, while the actual `luaL_ref` results go
     to `+0x10` (`0x008606a1`) and `+0x14` (`0x00860716`). No exact ZHL
     signature evidence exists for a field name, so the field stays
     address-stable and both names are kept side by side.
   ABI v19: the property-builder family 0x00875230 / 0x008753a0 /
     0x00875510 / 0x00875680 / 0x008757f0 / 0x00875960 / 0x00875ae0 is one
     template, and its return contract resolves the Color and Sprite spans.
       - Six members are 0x16a bytes / 133 instructions with an identical
         28-call body (absindex 6, pushstring 6, rawget 3, newuserdata 2,
         pushcclosure 2, pushvalue 1, rotate 3, rawset 3, settop 2; IAT
         slots re-resolved from the import directory). Byte diff against
         representative 0x00875510: 7/7/0/4/4/4 differing bytes, all inside
         three operand fields (get-trampoline imm32 @ +0x62, set-trampoline
         imm32 @ +0x118, setter ud-source disp8 @ +0x114). VA stride 0x170,
         0x180 after the folded member.
       - Body: rawget __propget of the tables at -2 and -4 (the v18
         metafield name VAs — writer/reader confirmation), newuserdata(4) +
         *ud = <getter src> + pushcclosure(nups=1) + pushvalue(-1), install
         under the property name into both via the same absindex/pushstring/
         rotate(-2,1)/rawset record as ABI v9/v15/v18 (fourth independent
         path), settop(-3); then rawget __propset at -2, setter closure,
         one install, settop(-2). Cleanups 0x44/0x48/0x44/0x24 = 61 arg
         dwords exactly.
       - Return contract (machine facts, all 7): entry ecx saved once to
         [ebp-4], read back 6x, only memory writes are the two userdata
         stores, epilogue mov eax,esi / ret 0xc with esi = [ebp-4]. So each
         member returns its receiver unchanged and never writes through it;
         chained `mov ecx, eax` keeps the receiver invariant and
         `mov esi, eax` makes [esi] the same slot state.
       - Kinds: SHARED_ARG (0x875230 / 0x8753a0) stores arg2 into both
         userdatas (arg3 pushed but dead — arg_disps [8,12]); SPLIT_ARG
         stores arg2/arg3; FOLDED (0x875960) reads no stack args yet still
         ret 0xc, with name 0x00b6508c ("Color", pooled with the Color
         class name) and ud imms 0x407410/0x4073d0 folded in. Its single
         image-wide caller 0x0086754e pushes exactly those values —
         machine-proven single-caller constant folding. Byte-exact
         derivation from the template: trampoline imms + 3x name-push ->
         push-imm32 + 2x load+store -> imm store + 2 scheduling swaps.
       - 20 call sites image-wide, all in RegisterClasses (2 Vector /
         4 KColor / 7 Color / 2+2+1+2 Sprite); Vector and KColor rows
         reproduce the v15/v16 field tables and now carry per-entry
         call/builder VAs.
       - Span walk with the contract: Color (slot [ebp-0x24]) 14/14
         receivers resolved (7 installs + 7 fields), Sprite (slot
         [ebp-0x14]) 45/45 (38 installs + 7 fields), 0 unresolved. Both
         populated on the same agreement standard as FontRenderSettings
         13/13 and Font 10/10; populated goes 5 -> 7 of 8.
       - Recharacterization (v9/v17 precedent): span_status keeps its v17
         values as the *structural* receiver classification (Color/Sprite
         stay SPAN_MIXED_RECEIVER — their spans do contain [esi]-form
         receivers; EntityRef stays SPAN_NO_SUCCESSOR). The new axis
         span_resolution = DIRECT / RETURN_CONTRACT / UNRESOLVED carries
         whether receiver agreement is proven and by what; populated ==
         (resolution != UNRESOLVED). RECEIVER_CLEAN_COUNT stays 6 under its
         original meaning. EntityRef stays unpopulated: no successor create
         bounds its span, and its field run uses the distinct sibling band
         0x00875c50…0x00876240 (recorded, not modelled).
       - Byte-width parameter sweep (class defect, orchestrator-routed):
         all 7 uint8_t scalar parameters widened to uint32_t with explicit
         low-byte masks in the bodies. The Wasm ABI does not narrow i32
         arguments and -O2 deletes an in-body mask it can prove redundant
         for a uint8_t parameter, so the shipped module disagreed with the
         PE byte semantics for arguments above 0xff. Direct probe on the
         built module BEFORE the fix: 6 of the 7 parameters divergent
         (get_debug / init_take_debug_path / init_debug_arg_store_byte /
         run_script_take_debug_path / check_get_needs_const_argerror both
         params); frame_unref_needs_host was shape-only (its explicit & 2
         confines the test inside the low byte); the v18
         metatable_protect_gate was already wide + masked and probed
         clean. Signatures are pinned by function-pointer checks in the
         .cpp and the header-doc test rejects any uint8_t parameter.

   Host residuals (do not peel here):
     FUN_00a68490 seed source for pointer mask
     lua_newstate / luaL_newstate / lua_atpanic / luaL_openlibs / luaL_requiref
     FUN_0085ef00 package path mutators
     RegisterClasses body (0x00866960 … 0x0086e4c9, 0x7b6a bytes) beyond the
       pure islands: all 54 distinct install helper targets (0x0089e610 …
       0x008a06a0 band), the metamethod setter 0x0085bf90 body, the 413
       builder-chain helper calls, the 37 class-create helpers, and the
       scope dtor 0x0085cce0 body. The tail predicate
       `cmp byte [ebx+0x1c], 0` / `jne 0x0086e483` @ 0x0086e461 and the
       block it selects are translated in ABI v16; the tail's own
       lua_pushcclosure / lua_setglobal IAT and the four installed C
       functions (0x008603d0 / 0x0085fec0 / 0x00860000 / 0x008601f0)
       remain host
     method-install helpers 0x008a06a0 family VM IAT (newuserdata @ 0x008a06a7
       / pushcclosure / absindex / pushstring / rotate / rawset) and class
       create residual body after pure prologue (IAT from 0x008a7e65;
       sibling Vector 0x008a7c00 from 0x008a7c55)
     SetReference wrapper 0x008a80d0 host: lua_type @ 0x008a80e0 / 0x008a8123,
       lua_touserdata @ 0x008a8116, check helper 0x0085c590 body (IAT from
       0x0085c5ab rawgetp), real_fn call via ud[0] (EntityPtr::SetReference
       0x00872050 when upvalue holds it)
     check/get 0x0085c590 host IAT: lua_rawgetp @ 0x0085c5ab /
       lua_isuserdata @ 0x0085c5b3 / getmetatable / type / settop / absindex /
       pushstring / rawget / rawequal / copy / rotate / touserdata / tolstring /
       typename / pushfstring / luaL_argerror
     stack-ref construct IAT lua_getglobal (0x0085dac2) / gettop / settop
     fopen / strncpy / malloc / FUN_0086e6c0 script runner body (VM/IO)
     FUN_00872980 materialize host rawgeti/pushinteger/pcallk/pushvalue/
       luaL_ref/settop (lua_State*, registry) — pure imms peeled v13;
       residual pure CF around first IAT peeled v14 (holder offs / cdq /
       stack cleanup / return out)
     frame residual 0x008607a0 host: call materialize @ 0x008607fb +
       IAT luaL_unref @ 0x0086080b (pure gate + arg imms peeled)
     destroy host 0x00870e00 walk body + luaL_unref + free + lua_close
     property-builder bodies 0x00875230…0x00875ae0 (lua_* IAT host surface;
       v19 models structure, operands and the return contract only), the 14
       get/set trampolines 0x008bb2e0…0x0089e530, the Color/Sprite install
       helper band 0x0089e610…0x0089f4a0, the Color Lerp closure pair
       0x0089f2b0 / 0x006832e0, and the EntityRef data-builder band
       0x00875c50…0x008763b0 (lua_* IAT host surface; v20 models structure,
       operands, closure immediates and the return contract only — the
       get/set closure bodies 0x008bb900…0x008bbc60 / 0x0089e4c0 /
       0x0089e450 and the EntityRef install helpers 0x00876530…0x008767f0
       stay address-stable host)
     LUA5.3.3r.dll full VM surface

   ABI v21: the property-builder template is not a 7-member family and not a
     13-member one — a whole-image census of the exact 28-call program finds
     173 members spanning 0x00875230 … 0x008952b0 with 394 call sites, and
     ONE template reproduces every one of them byte-exactly.
       - Census method: scan all of .text for the template prologue
         (55 8bec 51 53 56 8bc1 57 6afe), decode each hit to its `ret`, and
         resolve the ordered call program (indirect IAT calls plus `call ebx`
         resolved through the live `mov ebx,[imm]`). 195 prologue hits, 173
         whose program equals the representative's exactly. Two body shapes
         only: 0x16a bytes / 133 insns (80) and 0x172 / 131 (93) — the shape
         is a total function of the fold axis, with no third shape anywhere.
       - Two orthogonal axes, which the v19/v20 three-value `kind` enum
         conflated (the "near-identical siblings merged" defect class):
           fold axis   — ARG (name and both uds read from the stack) vs
                         FOLDED (name and both uds are immediates).
           shared axis — setter ud source is arg2 (SHARED, arg3 pushed but
                         dead) or arg3 (SPLIT).
         Population: ARG/SHARED 53, ARG/SPLIT 27, FOLDED/SHARED 66,
         FOLDED/SPLIT 27. The old enum could not express FOLDED x shared, so
         the setter-ud derivation of all 93 folded members was unrecorded.
       - L1 ARG law (whole-body census, 80/80, 0 mismatches): an ARG member
         is the representative 0x00875510 body with exactly four operand
         fields overwritten — getter ud disp8 @ +0x5e, getter closure imm32
         @ +0x62, setter ud disp8 @ +0x114, setter closure imm32 @ +0x118.
         No ARG member differs from the template ANYWHERE outside those four
         fields (0 of 80).
       - L2 FOLDED law (whole-body census, 93/93, 0 mismatches): a FOLDED
         member is the folded representative 0x00875960 body with seven
         imm32 fields overwritten — getter closure @ +0x5f, getter ud @
         +0x65, name @ +0x8a, name @ +0xbb, setter closure @ +0x11a, setter
         ud @ +0x120, name @ +0x13d. Across all 93 members only 21 of the
         370 body bytes ever vary; 349 are invariant. Each field varies in
         its low three bytes only — every folded value is < 0x01000000, so
         the top byte of all seven imm32s is 0x00 image-wide.
       - L3 one-template law (93/93, 0 mismatches): the FOLDED bodies are
         not a second template. Applying one edit script to the ARG template
         reproduces every folded member byte-exactly: (a) at each ud site
         delete `mov ecx,[ebp+disp]` (3 B) and widen `mov [eax],ecx` (2 B)
         to `mov dword [eax],imm32` (6 B), net +1 each; (b) rewrite each of
         the 3 `push dword [ebp+8]` (3 B) as `push imm32` (5 B), net +2
         each; (c) swap `mov esi,eax` / `push edi` at name pushes 1 and 2
         only — name push 3 keeps the ARG schedule. 2*(+1) + 3*(+2) = +8 =
         0x172 - 0x16a exactly.
       - L4 caller law (93/93, 0 unexplained): for every FOLDED member the
         single image-wide caller's pushed args give the folded immediates —
         name == arg1 (93/93) and getter ud == arg2 (93/93); the setter ud
         is arg2 on the 66 SHARED members and arg3 on the 27 SPLIT ones.
         This CORRECTS the v20 note "the folded immediates equal the single
         caller's pushed args", whose own worked example contradicts it:
         0x875c50's caller pushes (0x00b6d1a4, 0, 1) while the body folds
         ud 0/0 — arg3 is 1 because arg3 is the DEAD third argument on a
         SHARED member, not a userdata source. 65 of the 66 SHARED callers
         push literal 1 there.
       - L5 fold/caller equivalence (exact, both directions): FOLDED holds
         if and only if the member has exactly one image-wide call site.
         93/93 FOLDED members have exactly 1; 0 of 80 ARG members do. This
         is LTCG constant folding, and it makes the fold axis derivable from
         the call-site census alone.
       - L6 alignment law and its two exceptions: a body is padded with int3
         to a 0x10 multiple, so the next member begins at va + pad16(size) —
         0x170 after an ARG body, 0x180 after a FOLDED one. Of the 102
         adjacent pairs the law is exact for 100. TWO ARG members are
         followed by 22 int3 bytes instead of 6, putting the next member at
         +0x180 rather than +0x170: 0x0087ddd0 -> 0x0087df50 and
         0x0088be50 -> 0x0088bfd0. A `stride = FOLDED ? 0x180 : 0x170` rule
         is therefore wrong at 2 of 173 sites, and a rule that applies any
         stride to the 70 NON-adjacent pairs is wrong at all 70 — the v19
         next_va shape happened to be safe only because its table was 7
         contiguous members. v21 reports the censused successor and a
         separate body_end_va for the padding law.
       - Cross-family agreement: all 7 v19 rows and all 6 v20 rows are
         reproduced by this independent census — VA, both closure VAs, kind
         projection and call-site count agree on 13 of 13, 0 disagreements.
       - 79 distinct property-name strings back the 93 folded members, every
         one resolved through the SECTION TABLE into .rdata (a .text-only
         offset formula is off by 0xE00 there and returns plausible garbage).
       - Scope unchanged: the 28 lua_* IAT calls are the external Lua VM and
         stay host. v21 models member identity, the operand laws, the
         derivation and the return contract — 173 members and 394 call sites
         instead of 13 and 28.
*/

enum { ISAAC_LUA_ENGINE_PURE_HELPERS_ABI_VERSION = 103 };

/* ZHL-documented field offsets on LuaEngine (size 0x268). Treat as
   REPENTOGON-era layout evidence; re-verify before sparse capture ABI.
   PE Init writes the Debug *argument* as a byte at +0x1c (VA 0x0086064c)
   immediately before RegisterClasses — tension with ZHL naming that field
   _runCallbackRegistryKey. Do not invent a source-level rename. */
enum {
  ISAAC_LUA_ENGINE_OFF_DEBUG = 0x0c,
  ISAAC_LUA_ENGINE_OFF_RUN_CALLBACK_REGISTRY = 0x10,
  ISAAC_LUA_ENGINE_OFF_UNLOAD_MOD_FUNC_REF = 0x14,
  ISAAC_LUA_ENGINE_OFF_STATE = 0x18,
  ISAAC_LUA_ENGINE_OFF_INIT_DEBUG_ARG_BYTE = 0x1c,
  ISAAC_LUA_ENGINE_OFF_RUN_CALLBACK_REGISTRY_KEY = 0x1c,
  ISAAC_LUA_ENGINE_OFF_POINTER_MASK = 0x20,
  ISAAC_LUA_ENGINE_OBJECT_SIZE = 0x268
};

/* Lua 5.3 LUA_REGISTRYINDEX as the uint32 constant used at the frame
   unref call site (0xfff0b9d8 == -1001000). */
enum { ISAAC_LUA53_REGISTRY_INDEX_U32 = 0xfff0b9d8u };

/* Relative stack index -2 used by Init requiref settop and RegisterClasses
   metatable helpers (PE imm 0xfffffffe). Not LUA_REGISTRYINDEX. */
enum { ISAAC_LUA_RELATIVE_STACK_INDEX_MINUS_2_U32 = 0xfffffffeu };

/* Init pointer-mask mix immediates (VA 0x008604dc … 0x00860569). */
enum {
  ISAAC_LUA_INIT_MASK_MUL_C1 = 0xd7b634dbu,
  ISAAC_LUA_INIT_MASK_MUL_C2 = 0x431bde82u,
  ISAAC_LUA_INIT_MASK_XOR_DEADBEEF = 0xdeadbeefu,
  ISAAC_LUA_INIT_MASK_SHRD_BITS = 0x12,
  ISAAC_LUA_INIT_MASK_SHR_A = 4,
  ISAAC_LUA_INIT_MASK_SHL_B = 5,
  ISAAC_LUA_INIT_MASK_SHR_C = 0xb
};

/* Shared debug-heap tracker select (Init VA 0x0086066c, RunBundled
   VA 0x0086e607): global non-null → base = global + 0x30, else DAT. */
enum {
  ISAAC_LUA_HEAP_TRACKER_DELTA = 0x30,
  /* DAT_00c7f618 — hash-bound default tracker base when global is null. */
  ISAAC_LUA_HEAP_TRACKER_DEFAULT_BASE = 0x00c7f618u
};

/* RunBundledScript alloc / path-copy immediates (VA 0x0086e61b … 0x0086e64e). */
enum {
  ISAAC_LUA_RUN_BUNDLED_ALLOC_SIZE = 0x131,
  ISAAC_LUA_RUN_BUNDLED_PATH_COPY = 0x12c,
  /* Payload bytes after 4-byte size header (0x131 - 4). */
  ISAAC_LUA_RUN_BUNDLED_PAYLOAD_SIZE = 0x12d
};

/* Init post-bundled registry object alloc size (VA 0x00860680 / 0x008606f7). */
enum {
  ISAAC_LUA_INIT_REGISTRY_ALLOC_SIZE = 0x0c,
  /* Payload after header: state dword + ref dword. */
  ISAAC_LUA_INIT_REGISTRY_PAYLOAD_SIZE = 0x08,
  ISAAC_LUA_INIT_REGISTRY_OFF_STATE = 0x00,
  ISAAC_LUA_INIT_REGISTRY_OFF_REF = 0x04
};

/* Debug-heap size-header advance (Init / RunBundled tracked malloc). */
enum { ISAAC_LUA_TRACKED_ALLOC_HEADER_SIZE = 0x04 };

/* MSVC basic_string SSO / free thresholds used on RunBundled path
   (FUN_0086e6c0 SSO at +0x14 capacity, free at VA 0x0086e86e …). */
enum {
  ISAAC_LUA_MSVC_STRING_SSO_CAPACITY = 0x0f,
  ISAAC_LUA_MSVC_STRING_HEAP_THRESHOLD = 0x10,
  ISAAC_LUA_MSVC_STRING_ALIGN_THRESHOLD = 0x1000,
  ISAAC_LUA_MSVC_STRING_ALIGN_PAD = 0x23,
  ISAAC_LUA_MSVC_STRING_ALIGN_SLACK_MAX = 0x1f
};

/* ---------------------------------------------------------------------------
 * ABI v4 — destroy / shared list / materialize / RegisterClasses install
 * --------------------------------------------------------------------------- */

/* Pending-mod list globals (hash-bound). Shared by destroy + FUN_0086e6c0. */
enum {
  ISAAC_LUA_PENDING_MOD_LIST_SENTINEL_DAT = 0x00c7985cu,
  ISAAC_LUA_PENDING_MOD_LIST_COUNT_DAT = 0x00c79860u,
  /* Node: +0 next, +4 prev, +8 path string (MSVC basic_string). */
  ISAAC_LUA_LIST_NODE_NEXT_OFF = 0x00,
  ISAAC_LUA_LIST_NODE_PREV_OFF = 0x04,
  ISAAC_LUA_LIST_NODE_PAYLOAD_OFF = 0x08,
  /* FUN_0086e6c0 match-remove free size (push 0x58). */
  ISAAC_LUA_LIST_NODE_FREE_SIZE = 0x58
};

/* destroy free of registry objects at +0x10 / +0x14 (push 8). */
enum { ISAAC_LUA_DESTROY_REGISTRY_FREE_SIZE = 0x08 };

/* FUN_00872980 materialize: push 0,0,0,1,2,L before pcallk (nargs=2,nresults=1).
 * ABI v13: pcallk msgh/ctx/k are the three leading push-0; pushvalue −1 before
 * luaL_ref; settop −2 after; input this layout +0 holder / +4 arg1 / +8 arg2.
 * ABI v14: holder object (engine+0x10 payload) +0 L / +4 key; cdq lo/hi for
 * lua_Integer; post-IAT add esp sizes; return out identity. */
enum {
  ISAAC_LUA_MATERIALIZE_CALL_NARGS = 2,
  ISAAC_LUA_MATERIALIZE_CALL_NRESULTS = 1,
  ISAAC_LUA_MATERIALIZE_OUT_OFF_STATE = 0x00,
  ISAAC_LUA_MATERIALIZE_OUT_OFF_REF = 0x04,
  ISAAC_LUA_MATERIALIZE_INPUT_OFF_HOLDER = 0x00,
  ISAAC_LUA_MATERIALIZE_INPUT_OFF_ARG1 = 0x04,
  ISAAC_LUA_MATERIALIZE_INPUT_OFF_ARG2 = 0x08,
  /* Registry holder object (Init payload after tracked header): L / key. */
  ISAAC_LUA_MATERIALIZE_HOLDER_OFF_STATE = 0x00,
  ISAAC_LUA_MATERIALIZE_HOLDER_OFF_KEY = 0x04,
  ISAAC_LUA_MATERIALIZE_PCALL_MSGH = 0,
  ISAAC_LUA_MATERIALIZE_PCALL_CTX = 0,
  ISAAC_LUA_MATERIALIZE_PCALL_K = 0,
  /* pushvalue(L, −1) before luaL_ref @ 0x008729d8. */
  ISAAC_LUA_MATERIALIZE_PUSHVALUE_INDEX_U32 = 0xffffffffu,
  /* lua_settop(L, −2) after luaL_ref @ 0x008729f2. */
  ISAAC_LUA_MATERIALIZE_SETTOP_INDEX_U32 = 0xfffffffeu,
  /* add esp after rawgeti(16)+pushinteger(12) @ 0x008729b4. */
  ISAAC_LUA_MATERIALIZE_STACK_CLEAN_RAWGETI_PUSHINT = 0x1c,
  /* add esp after second pushinteger @ 0x008729bd. */
  ISAAC_LUA_MATERIALIZE_STACK_CLEAN_PUSHINT = 0x0c,
  /* add esp after pcallk (6×4) @ 0x008729d1 / success triad @ 0x008729fe. */
  ISAAC_LUA_MATERIALIZE_STACK_CLEAN_PCALL = 0x18,
  ISAAC_LUA_MATERIALIZE_STACK_CLEAN_SUCCESS = 0x18
};

/* ---------------------------------------------------------------------------
 * ABI v25 — FUN_00872980 materialize BODY as an ordered host-event program.
 * ---------------------------------------------------------------------------
 * PE facts (this unit, section-table + capstone):
 *   fn 0x00872980 .. 0x00872a1d (first int3). Success path ends `ret 8`
 *   @ 0x00872a09 (3 bytes -> 0x00872a0c); error path runs
 *   0x00872a0c .. 0x00872a1d and NEVER returns (int3; ret 8 unreachable).
 *   entry: `and esp, 0xfffffff8` (stack alignment).
 *   this: +0 holder ptr / +4 arg1 / +8 arg2; holder object +0 state / +4 key.
 *   Ordered host-event program (Lua5.3.3r IAT slots stay address-stable):
 *     ev0 lua_rawgeti    [0xb18318]  L, REGISTRYINDEX, sext(key64)
 *     ev1 lua_pushinteger [0xb183f8] L, sext(arg1)
 *     ev2 lua_pushinteger [0xb183f8] L, sext(arg2)
 *     ev3 lua_pcallk     [0xb183d8]  L, 2, 1, 0, 0, 0 (nargs, nresults,
 *                                    msgh, ctx, k)
 *     gate @ 0x008729d4: `test eax,eax; jne error` — success iff status==0
 *     ev4 lua_pushvalue  [0xb183c8]  L, -1
 *     ev5 luaL_ref       [0xb18314]  L, REGISTRYINDEX
 *     ev6 lua_settop     [0xb18328]  L, -2
 *   Out store ORDER (defect class 6 — call ordering):
 *     out->state stored @ 0x008729ea BEFORE the luaL_ref call @ 0x008729ec;
 *     out->ref stored @ 0x008729f5 AFTER luaL_ref, BEFORE settop @ 0x008729f8.
 *   Error path: sub esp,0x28; 0x85c080(L, &buf) builds an MSVC error string
 *   (returns normally, ret 8 @ 0x85c1c5); 0x8727d0 raises and never returns
 *   (int3 @ 0x00872a1d). Both stay address-stable host.
 *   ret 8 = 2 stack dwords: out + the dead Game argument pushed by the only
 *   caller 0x008607a0 @ 0x008607ec (frame residual, ABI v13).
 */
enum {
  ISAAC_LUA_MATERIALIZE_FN_VA = 0x00872980u,
  ISAAC_LUA_MATERIALIZE_SUCCESS_RET_END = 0x00872a0cu,
  ISAAC_LUA_MATERIALIZE_ERROR_PATH_START = 0x00872a0cu,
  ISAAC_LUA_MATERIALIZE_FN_END = 0x00872a1du,
  ISAAC_LUA_MATERIALIZE_PROGRAM_EVENT_COUNT = 7,
  ISAAC_LUA_MATERIALIZE_EVENT_RAWGETI = 0,
  ISAAC_LUA_MATERIALIZE_EVENT_PUSHINTEGER_1 = 1,
  ISAAC_LUA_MATERIALIZE_EVENT_PUSHINTEGER_2 = 2,
  ISAAC_LUA_MATERIALIZE_EVENT_PCALLK = 3,
  ISAAC_LUA_MATERIALIZE_EVENT_PUSHVALUE = 4,
  ISAAC_LUA_MATERIALIZE_EVENT_LUAL_REF = 5,
  ISAAC_LUA_MATERIALIZE_EVENT_SETTOP = 6,
  ISAAC_LUA_MATERIALIZE_EVENT_IAT_RAWGETI = 0x00b18318u,
  ISAAC_LUA_MATERIALIZE_EVENT_IAT_PUSHINTEGER = 0x00b183f8u,
  ISAAC_LUA_MATERIALIZE_EVENT_IAT_PCALLK = 0x00b183d8u,
  ISAAC_LUA_MATERIALIZE_EVENT_IAT_PUSHVALUE = 0x00b183c8u,
  ISAAC_LUA_MATERIALIZE_EVENT_IAT_LUAL_REF = 0x00b18314u,
  ISAAC_LUA_MATERIALIZE_EVENT_IAT_SETTOP = 0x00b18328u,
  /* push args per event: rawgeti 4 (L, regidx, lo, hi) / pushinteger 3 /
     pcallk 6 / pushvalue 2 / luaL_ref 2 / settop 2. */
  ISAAC_LUA_MATERIALIZE_EVENT_ARGS_RAWGETI = 4,
  ISAAC_LUA_MATERIALIZE_EVENT_ARGS_PUSHINTEGER = 3,
  ISAAC_LUA_MATERIALIZE_EVENT_ARGS_PCALLK = 6,
  ISAAC_LUA_MATERIALIZE_EVENT_ARGS_PUSHVALUE = 2,
  ISAAC_LUA_MATERIALIZE_EVENT_ARGS_LUAL_REF = 2,
  ISAAC_LUA_MATERIALIZE_EVENT_ARGS_SETTOP = 2,
  /* imm slots per event (push order): rawgeti 1 (REGISTRYINDEX), pcallk 5
     (msgh/ctx/k=0, nresults=1, nargs=2), pushvalue 1 (-1), luaL_ref 1
     (REGISTRYINDEX), settop 1 (-2); pushinteger events carry none. */
  ISAAC_LUA_MATERIALIZE_EVENT_IMS_RAWGETI = 1,
  ISAAC_LUA_MATERIALIZE_EVENT_IMS_PCALLK = 5,
  ISAAC_LUA_MATERIALIZE_EVENT_IMS_PUSHVALUE = 1,
  ISAAC_LUA_MATERIALIZE_EVENT_IMS_LUAL_REF = 1,
  ISAAC_LUA_MATERIALIZE_EVENT_IMS_SETTOP = 1,
  ISAAC_LUA_MATERIALIZE_ERROR_BUF_SIZE = 0x28,
  ISAAC_LUA_MATERIALIZE_ERROR_BUILDER_VA = 0x0085c080u,
  ISAAC_LUA_MATERIALIZE_ERROR_RAISER_VA = 0x008727d0u,
  ISAAC_LUA_MATERIALIZE_ENTRY_ALIGN_MASK = 0xfffffff8u,
  ISAAC_LUA_MATERIALIZE_RET_DWORDS = 2
};

/* ABI v26 - error-path callee bodies (0x85c080 builder / 0x8727d0 raiser)
   as ordered host-event programs. PE + import-directory evidence this
   unit; see the declarations below for the per-VA comments. */
enum {
  ISAAC_LUA_MATERIALIZE_BUILDER_FN_VA = 0x0085c080u,
  ISAAC_LUA_MATERIALIZE_BUILDER_RET_END = 0x0085c1c5u,
  ISAAC_LUA_MATERIALIZE_BUILDER_EVENT_COUNT = 5,
  ISAAC_LUA_MATERIALIZE_BUILDER_EVENT_GETTOP = 0,
  ISAAC_LUA_MATERIALIZE_BUILDER_EVENT_TOSTRING = 1,
  ISAAC_LUA_MATERIALIZE_BUILDER_EVENT_ASSIGN = 2,
  ISAAC_LUA_MATERIALIZE_BUILDER_EVENT_MEMCPY = 3,
  ISAAC_LUA_MATERIALIZE_BUILDER_EVENT_NEW = 4,
  /* Lua VM IAT slots (Lua5.3.3r.dll, address-stable host surface). */
  ISAAC_LUA_MATERIALIZE_BUILDER_IAT_GETTOP = 0x00b183d4u,
  ISAAC_LUA_MATERIALIZE_BUILDER_IAT_TOSTRING = 0x00b183d0u,
  /* Shared helper bodies (address-stable host; not exact-ZHL roots). */
  ISAAC_LUA_MATERIALIZE_BUILDER_ASSIGN_VA = 0x0040ccd0u,
  ISAAC_LUA_MATERIALIZE_BUILDER_MEMCPY_VA = 0x00af08bdu,
  ISAAC_LUA_MATERIALIZE_BUILDER_NEW_VA = 0x0040cf00u,
  ISAAC_LUA_MATERIALIZE_BUILDER_EVENT_ARGS_GETTOP = 1,
  ISAAC_LUA_MATERIALIZE_BUILDER_EVENT_ARGS_TOSTRING = 3,
  ISAAC_LUA_MATERIALIZE_BUILDER_EVENT_ARGS_ASSIGN = 2,
  ISAAC_LUA_MATERIALIZE_BUILDER_EVENT_ARGS_MEMCPY = 3,
  ISAAC_LUA_MATERIALIZE_BUILDER_EVENT_ARGS_NEW = 0,
  ISAAC_LUA_MATERIALIZE_BUILDER_EVENT_IMS_TOSTRING = 2,
  ISAAC_LUA_MATERIALIZE_BUILDER_EVENT_IMS_MEMCPY = 2,
  ISAAC_LUA_MATERIALIZE_BUILDER_TOSTRING_INDEX_U32 = 0xffffffffu,
  ISAAC_LUA_MATERIALIZE_BUILDER_TOSTRING_LEN_NULL = 0,
  ISAAC_LUA_MATERIALIZE_BUILDER_LITERAL_VA = 0x00b6e96cu,
  ISAAC_LUA_MATERIALIZE_BUILDER_LITERAL_LEN = 0x0d,
  ISAAC_LUA_MATERIALIZE_BUILDER_DEFAULT_LITERAL_VA = 0x00b1a4ecu,
  ISAAC_LUA_MATERIALIZE_BUILDER_VTABLE_VA = 0x00b753d0u,
  ISAAC_LUA_MATERIALIZE_BUILDER_OFF_STATE = 0x0c,
  ISAAC_LUA_MATERIALIZE_BUILDER_OFF_STRING = 0x10,
  ISAAC_LUA_MATERIALIZE_BUILDER_OFF_SIZE = 0x20,
  ISAAC_LUA_MATERIALIZE_BUILDER_OFF_CAPACITY = 0x24,
  ISAAC_LUA_MATERIALIZE_BUILDER_INIT_CAPACITY = 0x0f,
  ISAAC_LUA_MATERIALIZE_BUILDER_SEH_HANDLER_VA = 0x00b039d8u,
  ISAAC_LUA_MATERIALIZE_BUILDER_RET_DWORDS = 2,
  ISAAC_LUA_MATERIALIZE_BUILDER_CALLSITE_COUNT = 49,
  ISAAC_LUA_MATERIALIZE_RAISER_FN_VA = 0x008727d0u,
  ISAAC_LUA_MATERIALIZE_RAISER_FN_END = 0x00872819u,
  ISAAC_LUA_MATERIALIZE_RAISER_EVENT_COUNT = 2,
  ISAAC_LUA_MATERIALIZE_RAISER_EVENT_EXC_CTOR = 0,
  ISAAC_LUA_MATERIALIZE_RAISER_EVENT_THROW = 1,
  ISAAC_LUA_MATERIALIZE_RAISER_EXC_CTOR_VA = 0x00897620u,
  ISAAC_LUA_MATERIALIZE_RAISER_THROW_VA = 0x00af05ebu,
  ISAAC_LUA_MATERIALIZE_RAISER_THROW_IAT = 0x00b18758u,
  ISAAC_LUA_MATERIALIZE_RAISER_EVENT_ARGS_EXC_CTOR = 1,
  ISAAC_LUA_MATERIALIZE_RAISER_EVENT_ARGS_THROW = 2,
  ISAAC_LUA_MATERIALIZE_RAISER_EXC_LOCAL_OFF = 0x38,
  ISAAC_LUA_MATERIALIZE_RAISER_VARARGS_SRC_OFF = 0x08,
  ISAAC_LUA_MATERIALIZE_RAISER_THROW_INFO_VA = 0x00bd5bf8u,
  ISAAC_LUA_MATERIALIZE_RAISER_SEH_HANDLER_VA = 0x00b04ecdu
};

/* ABI v27 - first band-C primary BODY 0x008c32d0 pure islands (body stays
   host, as v22/v23). PE 0x5c bytes, no exact-ZHL match. See decls. */
enum {
  ISAAC_LUA_BAND_C_PRIMARY_BODY_VA = 0x008c32d0u,
  ISAAC_LUA_BAND_C_PRIMARY_TYPE_INDEX = 1,
  ISAAC_LUA_BAND_C_PRIMARY_CHECK_FLAG = 1,
  ISAAC_LUA_BAND_C_PRIMARY_CHECK_STACK_INDEX = 1,
  ISAAC_LUA_BAND_C_PRIMARY_CLASS_KEY = 0x00c82a30u,
  ISAAC_LUA_BAND_C_PRIMARY_OBJECT_FIELD_OFF = 4,
  ISAAC_LUA_BAND_C_PRIMARY_TOUSERDATA_INDEX_U32 = 0xfff0b9d7u,
  ISAAC_LUA_BAND_C_PRIMARY_IAT_LUA_TYPE = 0x00b18400u,
  ISAAC_LUA_BAND_C_PRIMARY_IAT_LUA_TOUSERDATA = 0x00b183b0u,
  ISAAC_LUA_BAND_C_PRIMARY_RETURN = 1,
  ISAAC_LUA_BAND_C_PRIMARY_NIL_STILL_CALLS = 1,
  ISAAC_LUA_BAND_C_NEXT_PRIMARY_VA = 0x008c4e90u
};

/* ABI v28 - all 10 band-C primaries are one 0x5c-byte template.
   Byte-diff vs 0x008c32d0: 87/92 identical; union diffs only at +0x1f
   (class-key low byte of `push imm32`) and the two position-rel32s
   (+0x2b check 0x0085c590, +0x4f push 0x0085bff0). identify-zhl: no
   exact match on any primary. Shared CF is the v27 law (type gate /
   this-select / touserdata / IATs / ret). Per-index: VA =
   0x008c32d0 + 0x60 * i; class key from the band-C table. Bodies stay
   host. Next untranslated: first secondary 0x008c4e90. */
enum {
  ISAAC_LUA_BAND_C_PRIMARY_STRIDE = 0x60,
  ISAAC_LUA_BAND_C_PRIMARY_IDENTICAL_BYTES = 87,
  ISAAC_LUA_BAND_C_PRIMARY_DIFF_OFF_KEY = 0x1f,
  ISAAC_LUA_BAND_C_PRIMARY_DIFF_OFF_CHECK_REL = 0x2b,
  ISAAC_LUA_BAND_C_PRIMARY_DIFF_OFF_PUSH_REL = 0x4f
};

/* ABI v29 - all 16 band-C secondaries are one 0xa4-byte template.
   Byte-diff vs 0x008c4e90: 158/164 identical; union diffs only at
   +0x25 (check-flag imm8), +0x27 (class-key low byte of `push imm32`),
   the position-rel32 (+0x33 check 0x0085c590), and +0x74 (wrap-key
   imm32). identify-zhl: no exact match on any secondary. Shared CF
   reuses the v27 law (type gate / this-select / nil-still-calls /
   touserdata / IATs / ret) plus the indexed-getter wrap: luaL_checkinteger
   arg 2, FULL-WORD result-null gate, userdata(8) + tag 0xb753c8 +
   field +4, rawgetp REGISTRYINDEX / setmetatable(-2), null path
   pushnil still ret 1. Per-index: VA = 0x008c4e90 + 0xc0 * i; class
   key from the band-C table at 10+i. Bodies stay host. Next
   untranslated: 0x008c5a90. */
enum {
  ISAAC_LUA_BAND_C_SECONDARY_BODY_VA = 0x008c4e90u,
  ISAAC_LUA_BAND_C_SECONDARY_STRIDE = 0xc0,
  ISAAC_LUA_BAND_C_SECONDARY_IDENTICAL_BYTES = 158,
  ISAAC_LUA_BAND_C_SECONDARY_DIFF_OFF_FLAG = 0x25,
  ISAAC_LUA_BAND_C_SECONDARY_DIFF_OFF_KEY = 0x27,
  ISAAC_LUA_BAND_C_SECONDARY_DIFF_OFF_CHECK_REL = 0x33,
  ISAAC_LUA_BAND_C_SECONDARY_DIFF_OFF_WRAP_KEY = 0x74,
  ISAAC_LUA_BAND_C_SECONDARY_CHECKINTEGER_INDEX = 2,
  ISAAC_LUA_BAND_C_SECONDARY_WRAP_UD_SIZE = 8,
  ISAAC_LUA_BAND_C_SECONDARY_WRAP_TAG_VA = 0x00b753c8u,
  ISAAC_LUA_BAND_C_SECONDARY_WRAP_FIELD_OFF = 4,
  ISAAC_LUA_BAND_C_SECONDARY_RAWGETP_REGISTRY_INDEX_U32 = 0xfff0b9d8u,
  ISAAC_LUA_BAND_C_SECONDARY_SETMETA_INDEX_U32 = 0xfffffffeu,
  ISAAC_LUA_BAND_C_SECONDARY_IAT_CHECKINTEGER = 0x00b183f4u,
  ISAAC_LUA_BAND_C_SECONDARY_IAT_NEWUSERDATA = 0x00b1839cu,
  ISAAC_LUA_BAND_C_SECONDARY_IAT_RAWGETP = 0x00b183bcu,
  ISAAC_LUA_BAND_C_SECONDARY_IAT_SETMETATABLE = 0x00b18398u,
  ISAAC_LUA_BAND_C_SECONDARY_IAT_PUSHNIL = 0x00b183e0u,
  ISAAC_LUA_BAND_C_SECONDARY_NULL_STILL_RETURNS = 1,
  ISAAC_LUA_BAND_C_SECONDARY_RETURN = 1,
  /* First insn after last secondary. Classified dtor in v30, not peeled. */
  ISAAC_LUA_BAND_C_NEXT_VA = 0x008c5a90u
};

/* ABI v30 - leftover extra getter BODY 0x008a0600 pure islands.
   0x008c5a90 is a scalar-object dtor (vtable 0xb73044 then 0xb753c0,
   sized free 0xaef15c, ret 4), not a getter; sibling @ 0x008c5ae0 is
   another dtor (0x758). identify-zhl empty on both. Peel leftover
   extra instead. PE 0x88 bytes to first ret (null-path ret @
   0x008a069a); identify-zhl: no match.
   Shared CF reuses v27 (type gate / this-select / nil-still-calls /
   touserdata / IATs) and v29 wrap (FULL-WORD result-null gate,
   userdata(8)+tag 0xb753c8+field +4, rawgetp REGISTRYINDEX /
   setmetatable(-2), null path pushnil still ret 1) BY REFERENCE.
   Distinct from v29 secondaries: no luaL_checkinteger; wrap key
   0xc8297a; class key 0xc8297d (fourth-region / EntityPtr -2).
   Body stays host. Next peel candidate after the two dtors:
   0x008c5b90.
   v31 census (no ABI bump): 0x008c5b90 is a 10-body release/unref
   family, not a getter. 0x1e-byte bodies, stride 0x20, VAs
   0x008c5b90..0x008c5cb0. Each: ecx=L, push class-key, call
   0x0085c3e0 (absindex/rawgetp REGISTRYINDEX/getmetatable/type/
   identity 0xc7f4b8), then push 0; call [vtable+0]; xor eax,eax;
   ret. Class keys = the 10 band-C primary BSS keys. identify-zhl
   empty. After last release: vtable thunks 0x008c5ccf, host
   0x008c5d20, SEH ctor 0x008c5d70. No lua_type / 0x85c590 after
   0x008c5b90. Next getter-shaped VA: 0x008976a0 (fourth-region
   getter, 0x31 bytes) — peeled in ABI v31. */
enum {
  ISAAC_LUA_LEFTOVER_EXTRA_BODY_VA = 0x008a0600u,
  ISAAC_LUA_LEFTOVER_EXTRA_BODY_BYTES = 0x88,
  ISAAC_LUA_LEFTOVER_EXTRA_CLASS_KEY = 0x00c8297du,
  ISAAC_LUA_LEFTOVER_EXTRA_CHECK_FLAG = 1,
  ISAAC_LUA_LEFTOVER_EXTRA_CHECK_STACK_INDEX = 1,
  ISAAC_LUA_LEFTOVER_EXTRA_WRAP_KEY = 0x00c8297au,
  ISAAC_LUA_LEFTOVER_EXTRA_CODE_UD_VA = 0x0040c3a0u,
  ISAAC_LUA_LEFTOVER_EXTRA_HAS_CHECKINTEGER = 0,
  ISAAC_LUA_LEFTOVER_EXTRA_RETURN = 1,
  ISAAC_LUA_LEFTOVER_EXTRA_NULL_STILL_RETURNS = 1,
  ISAAC_LUA_DTOR_008C5A90_VA = 0x008c5a90u,
  ISAAC_LUA_LEFTOVER_EXTRA_NEXT_VA = 0x008c5b90u,
};

/* ABI v31 - fourth-region string getter BODY 0x008976a0 pure islands.
   Sibling hunt (throughput rule 1): nearby fourth getters/setters
   (0x008976f0 / 0x00897730 / 0x00897770 / 0x008977a0 / 0x00897930 /
   0x00898f50 / 0x008991a0) are different shapes (setters, checkinteger,
   float/bool push). Image-wide exact 0x31-byte body: 1 hit.
   identify-zhl: empty. Not a template.
   PE 0x31 bytes to first ret (non-null @ 0x008976d0); whole body to
   last ret is 0x43 (null-path ret @ 0x008976e2).
   No lua_type / no class-check / no this-select — v27 type/this
   law is NOT this shape. touserdata(L, 0xfff0b9d7) IAT 0xb183b0;
   call [ud]; FULL-WORD result-null gate (v29 law BY REFERENCE);
   non-null lua_pushstring IAT 0xb18414; null lua_pushnil IAT
   0xb183e0; both ret 1. Distinct from v29 wrap: no userdata(8)/
   tag/rawgetp/setmetatable. Host: IAT surface + the upvalue fn.
   CODE_PTR ud 0x0085eee0. Next fourth-region body: 0x008976f0. */
enum {
  ISAAC_LUA_FOURTH_GETTER_BODY_VA = 0x008976a0u,
  ISAAC_LUA_FOURTH_GETTER_BODY_BYTES = 0x31,
  ISAAC_LUA_FOURTH_GETTER_FULL_BYTES = 0x43,
  ISAAC_LUA_FOURTH_GETTER_CODE_UD_VA = 0x0085eee0u,
  ISAAC_LUA_FOURTH_GETTER_TOUSERDATA_INDEX_U32 = 0xfff0b9d7u,
  ISAAC_LUA_FOURTH_GETTER_IAT_LUA_TOUSERDATA = 0x00b183b0u,
  ISAAC_LUA_FOURTH_GETTER_IAT_LUA_PUSHSTRING = 0x00b18414u,
  ISAAC_LUA_FOURTH_GETTER_IAT_LUA_PUSHNIL = 0x00b183e0u,
  ISAAC_LUA_FOURTH_GETTER_HAS_TYPE_GATE = 0,
  ISAAC_LUA_FOURTH_GETTER_HAS_THIS_SELECT = 0,
  ISAAC_LUA_FOURTH_GETTER_HAS_CHECKINTEGER = 0,
  ISAAC_LUA_FOURTH_GETTER_SIBLING_COUNT = 1,
  ISAAC_LUA_FOURTH_GETTER_NULL_STILL_RETURNS = 1,
  ISAAC_LUA_FOURTH_GETTER_RETURN = 1,
  ISAAC_LUA_FOURTH_GETTER_NEXT_VA = 0x008976f0u
};

/* ABI v32 - fourth-region integer setter BODY 0x008976f0 pure islands.
   Sibling hunt (throughput rule 1): exact 0x32-byte body image-wide
   1 hit. Nearby fourth bodies are different shapes (0x00897730
   toboolean+setne, 0x00897770 pushboolean getter, 0x008977a0
   checknumber). identify-zhl: empty. Not a template.
   NOT the v31 0x31/0x43 getter (no FULL-WORD null gate, no
   pushstring/pushnil, ret 0 not 1).
   touserdata(L, 0xfff0b9d7) IAT 0xb183b0 BY REFERENCE from v31;
   luaL_checkinteger(L, 1) IAT 0xb183f4 BY REFERENCE from v29
   (index 1, not v29's 2); call [ud](integer); add esp,0x14;
   xor eax,eax; ret 0. Always calls — no result-null gate.
   Host: IAT surface + the upvalue fn. Next fourth-region body:
   0x00897730. */
enum {
  ISAAC_LUA_FOURTH_SETTER_BODY_VA = 0x008976f0u,
  ISAAC_LUA_FOURTH_SETTER_BODY_BYTES = 0x32,
  ISAAC_LUA_FOURTH_SETTER_CHECKINTEGER_INDEX = 1,
  ISAAC_LUA_FOURTH_SETTER_STACK_CLEAN = 0x14,
  ISAAC_LUA_FOURTH_SETTER_HAS_TYPE_GATE = 0,
  ISAAC_LUA_FOURTH_SETTER_HAS_THIS_SELECT = 0,
  ISAAC_LUA_FOURTH_SETTER_HAS_NULL_GATE = 0,
  ISAAC_LUA_FOURTH_SETTER_HAS_PUSH = 0,
  ISAAC_LUA_FOURTH_SETTER_SIBLING_COUNT = 1,
  ISAAC_LUA_FOURTH_SETTER_RETURN = 0,
  ISAAC_LUA_FOURTH_SETTER_NEXT_VA = 0x00897730u
};

/* ABI v33 - fourth-region boolean setter BODY 0x00897730 pure islands.
   Sibling hunt (throughput rule 1): exact 0x37-byte body image-wide
   1 hit. touserdata+toboolean+setne mid: 1 hit. setne+call+ret0
   tail: 1 hit. Nearby fourth bodies are different shapes
   (0x00897770 pushboolean getter / BYTE test al, 0x008977a0
   checknumber). identify-zhl: empty. Not a template.
   NOT the v32 0x32 integer setter (toboolean IAT 0xb183e8, not
   checkinteger 0xb183f4). NOT the v31 0x31/0x43 getter (no
   FULL-WORD null gate, no pushstring/pushnil, ret 0 not 1).
   touserdata(L, 0xfff0b9d7) IAT 0xb183b0 BY REFERENCE from v31;
   lua_toboolean(L, 1) IAT 0xb183e8 BY REFERENCE from v22
   property-closure IAT; FULL-WORD test eax,eax / setne [ebp-4]
   BY REFERENCE from v22 boolean-normalize; call [ud](bool);
   add esp,0x14; xor eax,eax; ret 0. Always calls — no
   result-null gate. Host: IAT surface + the upvalue fn.
   Next fourth-region body: 0x00897770. */
enum {
  ISAAC_LUA_FOURTH_BOOL_SETTER_BODY_VA = 0x00897730u,
  ISAAC_LUA_FOURTH_BOOL_SETTER_BODY_BYTES = 0x37,
  ISAAC_LUA_FOURTH_BOOL_SETTER_TOBOOLEAN_INDEX = 1,
  ISAAC_LUA_FOURTH_BOOL_SETTER_STACK_CLEAN = 0x14,
  ISAAC_LUA_FOURTH_BOOL_SETTER_HAS_TYPE_GATE = 0,
  ISAAC_LUA_FOURTH_BOOL_SETTER_HAS_THIS_SELECT = 0,
  ISAAC_LUA_FOURTH_BOOL_SETTER_HAS_NULL_GATE = 0,
  ISAAC_LUA_FOURTH_BOOL_SETTER_HAS_PUSH = 0,
  ISAAC_LUA_FOURTH_BOOL_SETTER_HAS_CHECKINTEGER = 0,
  ISAAC_LUA_FOURTH_BOOL_SETTER_SIBLING_COUNT = 1,
  ISAAC_LUA_FOURTH_BOOL_SETTER_RETURN = 0,
  ISAAC_LUA_FOURTH_BOOL_SETTER_NEXT_VA = 0x00897770u
};

/* ABI v34 - fourth-region boolean getter BODY 0x00897770 pure islands.
   Sibling hunt (throughput rule 1): exact 0x30-byte body to first ret.
   identify-zhl: empty. Not a template.
   NOT the v33 0x37 boolean setter (FULL-WORD test eax,eax / toboolean
   / ret 0 / stack 0x14). NOT the v31 0x31/0x43 string getter
   (pushstring/pushnil + FULL-WORD null gate). Do not open 0x008977a0.
   touserdata(L, 0xfff0b9d7) IAT 0xb183b0 BY REFERENCE from v31;
   call [ud](); BYTE test al,al / setne cl (NOT v22/v33 FULL-WORD
   setne); lua_pushboolean(L, cl) IAT 0xb183ec BY REFERENCE from v22
   property-closure IAT; add esp,0x10; mov eax,1; ret 1.
   Host: IAT surface + the upvalue fn. Next fourth-region body:
   0x008977a0. */
enum {
  ISAAC_LUA_FOURTH_BOOL_GETTER_BODY_VA = 0x00897770u,
  ISAAC_LUA_FOURTH_BOOL_GETTER_BODY_BYTES = 0x30,
  ISAAC_LUA_FOURTH_BOOL_GETTER_STACK_CLEAN = 0x10,
  ISAAC_LUA_FOURTH_BOOL_GETTER_HAS_TYPE_GATE = 0,
  ISAAC_LUA_FOURTH_BOOL_GETTER_HAS_THIS_SELECT = 0,
  ISAAC_LUA_FOURTH_BOOL_GETTER_HAS_NULL_GATE = 0,
  ISAAC_LUA_FOURTH_BOOL_GETTER_HAS_CHECKINTEGER = 0,
  ISAAC_LUA_FOURTH_BOOL_GETTER_SIBLING_COUNT = 1,
  ISAAC_LUA_FOURTH_BOOL_GETTER_RETURN = 1,
  ISAAC_LUA_FOURTH_BOOL_GETTER_NEXT_VA = 0x008977a0u
};

/* ABI v35 - fourth-region number setter BODY 0x008977a0 pure islands.
   Sibling hunt (throughput rule 1): exact 0x4d-byte body to ret.
   identify-zhl: empty. Not a template.
   NOT the v32 0x32 integer setter (checknumber IAT 0xb18324, not
   checkinteger 0xb183f4). NOT the v33/v34 toboolean/pushboolean
   bodies. Do not open past int3 (0x008977ed).
   touserdata(L, 0xfff0b9d7) IAT 0xb183b0 BY REFERENCE from v31;
   luaL_checknumber(L, 1) IAT 0xb18324 BY REFERENCE from v22
   property-closure IAT; fstp f32 + bit-stable dword reload;
   call [ud](f32); add esp,0xc then add esp,4; xor eax,eax; ret 0.
   Always calls — no result-null gate. Host: IAT surface + the
   upvalue fn. Next body after int3 pad: 0x008977f0. */
enum {
  ISAAC_LUA_FOURTH_NUMBER_SETTER_BODY_VA = 0x008977a0u,
  ISAAC_LUA_FOURTH_NUMBER_SETTER_BODY_BYTES = 0x4d,
  ISAAC_LUA_FOURTH_NUMBER_SETTER_CHECKNUMBER_INDEX = 1,
  ISAAC_LUA_FOURTH_NUMBER_SETTER_STACK_CLEAN = 0x0c,
  ISAAC_LUA_FOURTH_NUMBER_SETTER_STACK_CLEAN_HOST = 0x04,
  ISAAC_LUA_FOURTH_NUMBER_SETTER_HAS_TYPE_GATE = 0,
  ISAAC_LUA_FOURTH_NUMBER_SETTER_HAS_THIS_SELECT = 0,
  ISAAC_LUA_FOURTH_NUMBER_SETTER_HAS_NULL_GATE = 0,
  ISAAC_LUA_FOURTH_NUMBER_SETTER_HAS_PUSH = 0,
  ISAAC_LUA_FOURTH_NUMBER_SETTER_HAS_CHECKINTEGER = 0,
  ISAAC_LUA_FOURTH_NUMBER_SETTER_SIBLING_COUNT = 1,
  ISAAC_LUA_FOURTH_NUMBER_SETTER_RETURN = 0,
  ISAAC_LUA_FOURTH_NUMBER_SETTER_NEXT_VA = 0x008977f0u
};

/* ABI v36 - fourth-region number getter BODY 0x00897930 pure islands.
   Sibling hunt (throughput rule 1): exact 0x36-byte body to first ret.
   identify-zhl: empty. Not a template.
   Skip 0x008977f0 (6-IAT userdata ctor) — this body is the cheaper sibling.
   Do not open 0x00897970.
   NOT the v35 0x4d number setter (ret 0 / checknumber / no push).
   NOT the v34 0x30 boolean getter (pushboolean IAT, not host 0x85c050).
   NOT the v31 0x31 string getter (pushstring/pushnil + FULL-WORD null gate).
   touserdata(L, 0xfff0b9d7) IAT 0xb183b0 BY REFERENCE from v31;
   call [ud](); fstp f32; movss xmm1; call 0x85c050 (host push-f32,
   typed VA export, stays host); mov eax,1; ret 1.
   Always calls — no result-null gate. Host: IAT surface + upvalue fn
   + 0x85c050. Next: 0x00897970. */
enum {
  ISAAC_LUA_FOURTH_NUMBER_GETTER_BODY_VA = 0x00897930u,
  ISAAC_LUA_FOURTH_NUMBER_GETTER_BODY_BYTES = 0x36,
  ISAAC_LUA_FOURTH_NUMBER_GETTER_HOST_VA_PUSH = 0x0085c050u,
  ISAAC_LUA_FOURTH_NUMBER_GETTER_HAS_TYPE_GATE = 0,
  ISAAC_LUA_FOURTH_NUMBER_GETTER_HAS_THIS_SELECT = 0,
  ISAAC_LUA_FOURTH_NUMBER_GETTER_HAS_NULL_GATE = 0,
  ISAAC_LUA_FOURTH_NUMBER_GETTER_HAS_CHECKINTEGER = 0,
  ISAAC_LUA_FOURTH_NUMBER_GETTER_SIBLING_COUNT = 1,
  ISAAC_LUA_FOURTH_NUMBER_GETTER_RETURN = 1,
  ISAAC_LUA_FOURTH_NUMBER_GETTER_NEXT_VA = 0x00897970u
};

/* ABI v37 - sequential indexed bool setter BODY 0x00897f00 pure islands.
   Skip 0x00897970: 6-IAT Vector userdata wrap/ctor (newuserdata 0x10,
   vtable 0xb73574, rawgetp 0xc82980, setmetatable; callee 0x8baa50
   host). Same family as the skipped 0x008977f0 ctor. Do not reopen.
   Skip SEH/host 0x00897a10 / 0x00897b00 / 0x00897c00 / 0x00897d50
   (fs:[0] cookie, luaL_ref, 0x8ba0c0 / 0x6a80f0). Do not reopen
   0x008977f0.
   Sibling hunt (throughput rule 1): exact 0x49-byte body image-wide
   1 hit. identify-zhl: empty on body and IAT slots. Not a template.
   NOT the v33 0x37 boolean setter (toboolean index 2 not 1; also
   checkinteger IAT 0xb183f4; stack 0x20 not 0x14).
   NOT the v32 0x32 integer setter (also toboolean; ret 0 both).
   NOT the v34 0x30 boolean getter (FULL-WORD setne, ret 0, no push).
   NOT the v36 0x36 number getter (no host 0x85c050 / fstp).
   touserdata(L, 0xfff0b9d7) IAT 0xb183b0 BY REFERENCE from v31;
   lua_toboolean(L, 2) IAT 0xb183e8 BY REFERENCE from v22;
   FULL-WORD test eax,eax / setne byte (v22 boolean-normalize BY
   REFERENCE); luaL_checkinteger(L, 1) IAT 0xb183f4 BY REFERENCE
   from v32; call [ud](integer, bool); add esp,0x20; xor eax,eax;
   ret 0. Always calls — no result-null gate.
   Host: IAT surface + the upvalue fn. Next after int3: 0x00897f50. */
enum {
  ISAAC_LUA_FOURTH_INT_BOOL_SETTER_BODY_VA = 0x00897f00u,
  ISAAC_LUA_FOURTH_INT_BOOL_SETTER_BODY_BYTES = 0x49,
  ISAAC_LUA_FOURTH_INT_BOOL_SETTER_TOBOOLEAN_INDEX = 2,
  ISAAC_LUA_FOURTH_INT_BOOL_SETTER_CHECKINTEGER_INDEX = 1,
  ISAAC_LUA_FOURTH_INT_BOOL_SETTER_STACK_CLEAN = 0x20,
  ISAAC_LUA_FOURTH_INT_BOOL_SETTER_STACK_ALIGN_MASK = 0xfffffff8u,
  ISAAC_LUA_FOURTH_INT_BOOL_SETTER_SKIPPED_CTOR_VA = 0x00897970u,
  ISAAC_LUA_FOURTH_INT_BOOL_SETTER_HAS_TYPE_GATE = 0,
  ISAAC_LUA_FOURTH_INT_BOOL_SETTER_HAS_THIS_SELECT = 0,
  ISAAC_LUA_FOURTH_INT_BOOL_SETTER_HAS_NULL_GATE = 0,
  ISAAC_LUA_FOURTH_INT_BOOL_SETTER_HAS_PUSH = 0,
  ISAAC_LUA_FOURTH_INT_BOOL_SETTER_HAS_CHECKINTEGER = 1,
  ISAAC_LUA_FOURTH_INT_BOOL_SETTER_SIBLING_COUNT = 1,
  ISAAC_LUA_FOURTH_INT_BOOL_SETTER_RETURN = 0,
  ISAAC_LUA_FOURTH_INT_BOOL_SETTER_NEXT_VA = 0x00897f50u
};

/* ABI v38 - sequential indexed integer getter BODY 0x008984e0 pure islands.
   Skip assigned 0x00897f50: SEH/host (fs:[0] cookie 0xbf93b4, 0x8ba5e0 /
   0x6a80f0 / 0x40cf50 / 0x40d040, first_ret 0x00898130, 0x1e0 bytes).
   Skip wrap/ctor 0x00898140 (newuserdata 8 + vtable 0xb753c8 + rawgetp
   0xc829ad + setmetatable; same 6-IAT userdata wrap family as the
   skipped 0x008977f0 / 0x00897970). Do not reopen those.
   Skip SEH 0x008981b0 / 0x008982a0 / 0x008983e0.
   Skip unref 0x00898490 (host 0x6a80f0 + luaL_unref REGISTRYINDEX).
   Sibling hunt (throughput rule 1): exact 0x41-byte body image-wide
   1 hit. identify-zhl: empty on body and IAT slots. Not a template.
   NOT the v32 0x32 integer setter (ret 1 / pushinteger / cdq, not ret 0).
   NOT the v37 0x49 indexed bool setter (no toboolean; ret 1; stack 0x14).
   NOT the v34 0x30 boolean getter (pushinteger IAT 0xb183f8, not
   pushboolean; also checkinteger).
   NOT the v36 0x36 number getter (no host 0x85c050 / fstp).
   NOT the v31 0x31 string getter (no FULL-WORD null gate / pushstring).
   touserdata(L, 0xfff0b9d7) IAT 0xb183b0 BY REFERENCE from v31;
   luaL_checkinteger(L, 1) IAT 0xb183f4 BY REFERENCE from v32;
   call [ud](integer); add esp,0x14; cdq lua_Integer BY REFERENCE from
   v14 materialize; lua_pushinteger IAT 0xb183f8 BY REFERENCE from v22
   property-closure; add esp,0xc; mov eax,1; ret 1.
   Always calls — no result-null gate. Host: IAT surface + the upvalue fn.
   Next after int3: 0x00898530. */
enum {
  ISAAC_LUA_FOURTH_INT_GETTER_BODY_VA = 0x008984e0u,
  ISAAC_LUA_FOURTH_INT_GETTER_BODY_BYTES = 0x41,
  ISAAC_LUA_FOURTH_INT_GETTER_CHECKINTEGER_INDEX = 1,
  ISAAC_LUA_FOURTH_INT_GETTER_STACK_CLEAN = 0x14,
  ISAAC_LUA_FOURTH_INT_GETTER_STACK_CLEAN_PUSH = 0x0c,
  ISAAC_LUA_FOURTH_INT_GETTER_STACK_ALIGN_MASK = 0xfffffff8u,
  ISAAC_LUA_FOURTH_INT_GETTER_SKIPPED_SEH_VA = 0x00897f50u,
  ISAAC_LUA_FOURTH_INT_GETTER_SKIPPED_CTOR_VA = 0x00898140u,
  ISAAC_LUA_FOURTH_INT_GETTER_HAS_TYPE_GATE = 0,
  ISAAC_LUA_FOURTH_INT_GETTER_HAS_THIS_SELECT = 0,
  ISAAC_LUA_FOURTH_INT_GETTER_HAS_NULL_GATE = 0,
  ISAAC_LUA_FOURTH_INT_GETTER_HAS_PUSH = 1,
  ISAAC_LUA_FOURTH_INT_GETTER_HAS_CHECKINTEGER = 1,
  ISAAC_LUA_FOURTH_INT_GETTER_SIBLING_COUNT = 1,
  ISAAC_LUA_FOURTH_INT_GETTER_RETURN = 1,
  ISAAC_LUA_FOURTH_INT_GETTER_NEXT_VA = 0x00898530u
};

/* ABI v39 - fourth-region i32 getter BODY 0x00898f50 pure islands.
   Skip assigned 0x00898530: host-irreducible (class-check 0x0085c590 /
   wrap 0x008baa50 / luaL_checknumber IAT 0xb18324 / lua_type IAT
   0xb18400 / call [ud]; xor eax,eax; ret 0). Do not translate.
   Sequential skip of wrap/ctor/SEH (int3-pad separated):
     0x00898600 Vector wrap/ctor (6-IAT, vtable 0xb73574, key 0xc82980,
       callee 0x8baa50) — same family as skipped 0x008977f0 / 0x00897970.
     0x008986d0 SEH (fs:[0], cookie 0xbf93b4, 0x8ba1e0 / 0x40ccd0 /
       0x40cf50 / 0x40d040 / 0xaef12b).
     0x00898890 SEH (fs:[0], cookie, many checknumber, 0x40ccd0).
     0x00898ae0 wrap/ctor (wrap 0x8baa50 + toboolean + checkinteger +
       newuserdata 8 / vtable 0xb753c8).
     0x00898c00 wrap/ctor (host 0x8b9ee0 + newuserdata wrap).
     0x00898cf0 SEH (fs:[0], 0x8b9ff0 / 0x40cf50 / 0x40d040).
     0x00898d90 / 0x00898e00 / 0x00898e70 wrap/ctor template
       (newuserdata 8 / vtable 0xb753c8 / keys 0xc82a19/16/13).
     0x00898ee0 Vector wrap/ctor (vtable 0xb73574, key 0xc82980).
   Do not reopen 0x008977f0 / 0x00897970 / 0x00898140.
   Sibling hunt (throughput rule 1): exact 0x29-byte body image-wide
   1 hit. 0x008991a0 is the same length but differs by 2 rel32 bytes
   — not a template. identify-zhl: empty on body, IAT, and 0x85bff0.
   NOT an 11th census row: this IS fourth-region row 7 (already in
   the v24 table of 10). Census table unchanged.
   NOT the v38 0x41 indexed int getter (no checkinteger / cdq /
   pushinteger IAT; host 0x85bff0 not IAT 0xb183f8; body 0x29).
   NOT the v36 0x36 number getter (host 0x85bff0 not 0x85c050; no fstp).
   NOT the v34 0x30 boolean getter (no pushboolean / BYTE setne).
   NOT the v32 0x32 integer setter (ret 1 / has_push; no checkinteger).
   NOT the v37 0x49 indexed bool setter (no toboolean; ret 1).
   touserdata(L, 0xfff0b9d7) IAT 0xb183b0 BY REFERENCE from v31;
   call [ud](); add esp,8; ecx=L edx=result; call 0x0085bff0
   (band-C push-i32 BY REFERENCE, stays host); mov eax,1; ret 1.
   Always calls — no result-null gate. Host: IAT surface + the
   upvalue fn + 0x85bff0. Next after int3: 0x00898f80. */
enum {
  ISAAC_LUA_FOURTH_I32_GETTER_BODY_VA = 0x00898f50u,
  ISAAC_LUA_FOURTH_I32_GETTER_BODY_BYTES = 0x29,
  ISAAC_LUA_FOURTH_I32_GETTER_STACK_CLEAN = 0x08,
  ISAAC_LUA_FOURTH_I32_GETTER_HOST_VA_PUSH = 0x0085bff0u,
  ISAAC_LUA_FOURTH_I32_GETTER_SKIPPED_HOST_VA = 0x00898530u,
  ISAAC_LUA_FOURTH_I32_GETTER_SKIPPED_CTOR_VA = 0x00898600u,
  ISAAC_LUA_FOURTH_I32_GETTER_SKIPPED_SEH_VA = 0x008986d0u,
  ISAAC_LUA_FOURTH_I32_GETTER_SKIP_COUNT = 11,
  ISAAC_LUA_FOURTH_I32_GETTER_CENSUS_INDEX = 7,
  ISAAC_LUA_FOURTH_I32_GETTER_HAS_TYPE_GATE = 0,
  ISAAC_LUA_FOURTH_I32_GETTER_HAS_THIS_SELECT = 0,
  ISAAC_LUA_FOURTH_I32_GETTER_HAS_NULL_GATE = 0,
  ISAAC_LUA_FOURTH_I32_GETTER_HAS_PUSH = 1,
  ISAAC_LUA_FOURTH_I32_GETTER_HAS_CHECKINTEGER = 0,
  ISAAC_LUA_FOURTH_I32_GETTER_SIBLING_COUNT = 1,
  ISAAC_LUA_FOURTH_I32_GETTER_RETURN = 1,
  ISAAC_LUA_FOURTH_I32_GETTER_NEXT_VA = 0x00898f80u
};

/* ABI v40 - fourth-region i32 sign-extend getter BODY 0x008991a0
   pure islands.
   Skip assigned 0x00898f80: host-irreducible (lua_type IAT 0xb18400
   + class-check 0x0085c590 x2 + touserdata + Vector field loads +
   call [ud]; xor eax,eax; ret 0). Do not translate. Do not reopen
   0x00898530 / 0x00898f50 / 0x008977f0 / 0x00897970 / 0x00897f50 /
   0x008984e0.
   Sequential skip of wrap/ctor and host:
     0x00899030 wrap/ctor (newuserdata 8 + vtable 0xb753c8 + rawgetp
       0xc8297f + setmetatable; same 6-IAT userdata wrap family as
       skipped 0x008977f0 / 0x00897970).
     0x008990d0 host setter (class-check 0x85c590 + checkinteger IAT
       0xb183f4 + call [ud]; xor eax,eax; ret 0).
     0x00899140 host (class-check 0x85c590 + host 0x85bfd0).
   Sibling hunt (throughput rule 1): exact 0x29-byte body image-wide
   1 hit. Differs from v39 0x00898f50 by 2 rel32 bytes (host 0x85bfd0
   not 0x85bff0) - not a template. identify-zhl: empty on body, IAT,
   and 0x85bfd0.
   NOT an 11th census row: this IS fourth-region row 8 (already in
   the v24 table of 10). Census table unchanged.
   NOT the v39 0x29 i32 getter (host 0x85bfd0 sign-extend cdq, not
   0x85bff0 zero-extend).
   NOT the v38 0x41 indexed int getter (no checkinteger / pushinteger
   IAT; host 0x85bfd0 not IAT 0xb183f8).
   NOT the v36 0x36 number getter (host 0x85bfd0 not 0x85c050).
   NOT the v34 0x30 boolean getter (no pushboolean / BYTE setne).
   NOT the v32 0x32 integer setter (ret 1 / has_push; no checkinteger).
   *   touserdata(L, 0xfff0b9d7) IAT 0xb183b0 BY REFERENCE from v31;
   *   call [ud](); add esp,8; ecx=L edx=result; call 0x0085bfd0
   *   (closure push-i32-sext, LANDED v55 as pusher ROW 3 — the v55
   *   FOURTH_I32_SEXT_GETTER_PUSH_ROW pin == PUSHER_3_VA); mov eax,1; ret 1.
   *   Always calls - no result-null gate. Host: IAT surface + the
   *   upvalue fn. Next after int3: 0x008991d0. */
enum {
  ISAAC_LUA_FOURTH_I32_SEXT_GETTER_BODY_VA = 0x008991a0u,
  ISAAC_LUA_FOURTH_I32_SEXT_GETTER_BODY_BYTES = 0x29,
  ISAAC_LUA_FOURTH_I32_SEXT_GETTER_STACK_CLEAN = 0x08,
  ISAAC_LUA_FOURTH_I32_SEXT_GETTER_HOST_VA_PUSH = 0x0085bfd0u,
  ISAAC_LUA_FOURTH_I32_SEXT_GETTER_SKIPPED_HOST_VA = 0x00898f80u,
  ISAAC_LUA_FOURTH_I32_SEXT_GETTER_SKIPPED_WRAP_VA = 0x00899030u,
  ISAAC_LUA_FOURTH_I32_SEXT_GETTER_SKIPPED_CHECK_VA = 0x008990d0u,
  ISAAC_LUA_FOURTH_I32_SEXT_GETTER_SKIPPED_TYPE_VA = 0x00899140u,
  ISAAC_LUA_FOURTH_I32_SEXT_GETTER_SKIP_COUNT = 4,
  ISAAC_LUA_FOURTH_I32_SEXT_GETTER_CENSUS_INDEX = 8,
  ISAAC_LUA_FOURTH_I32_SEXT_GETTER_HAS_TYPE_GATE = 0,
  ISAAC_LUA_FOURTH_I32_SEXT_GETTER_HAS_THIS_SELECT = 0,
  ISAAC_LUA_FOURTH_I32_SEXT_GETTER_HAS_NULL_GATE = 0,
  ISAAC_LUA_FOURTH_I32_SEXT_GETTER_HAS_PUSH = 1,
  ISAAC_LUA_FOURTH_I32_SEXT_GETTER_HAS_CHECKINTEGER = 0,
  ISAAC_LUA_FOURTH_I32_SEXT_GETTER_SIBLING_COUNT = 1,
  ISAAC_LUA_FOURTH_I32_SEXT_GETTER_RETURN = 1,
  ISAAC_LUA_FOURTH_I32_SEXT_GETTER_NEXT_VA = 0x008991d0u
};

/* ABI v41 - sequential no-arg setter-shaped BODY 0x008991d0 pure islands.
   Assigned INLINE_NEXT_VA at ABI 40 was 0x008991d0. identify-zhl: empty
   on body, IAT 0xb183b0, installer 0x00893270, CODE_PTR 0x009e94e0,
   and next 0x008991f0.
   No wrap/ctor / SEH / class-check / newuserdata before this island —
   skip_count=0. Do not reopen 0x00898f50 / 0x008991a0 / 0x00898530 /
   0x00897970 / 0x008977f0 / 0x00898140.
   Sibling hunt (throughput rule 1): exact 0x1c-byte body image-wide
   1 hit. Not a template. Census via section table: one install site
   0x00893270 (pushcclosure 0x008991d0, CODE_PTR ud 0x009e94e0,
   name 0x00b7454c). Method-install record (newuserdata 4 / nups 1 /
   absindex -2 / rotate(-2,1) / rawset / ret 8) — not a fourth-region
   property-pair installer. Fourth census table (10) unchanged; not an
   11th row. Property-accessor install surface stays COMPLETE at 383.
   NOT the v40 0x29 i32-sext getter (ret 0 / has_push 0 / no host
   0x85bfd0 / body 0x1c not 0x29).
   NOT the v39 0x29 i32 getter (no host 0x85bff0).
   NOT the v38 0x41 indexed int getter (no checkinteger / pushinteger).
   NOT the v32 0x32 integer setter (no checkinteger; stack 0x08 not
   0x14; body 0x1c not 0x32).
   NOT the v37 0x49 indexed bool setter (no toboolean).
   NOT the v31 0x31 string getter (no FULL-WORD null gate; ret 0).
   touserdata(L, 0xfff0b9d7) IAT 0xb183b0 BY REFERENCE from v31;
   call [ud](); add esp,8; xor eax,eax; ret 0. Always calls — no
   result-null gate. Host: IAT surface + the upvalue fn 0x009e94e0.
   Next after int3: 0x008991f0 (SEH/host). */
enum {
  ISAAC_LUA_FOURTH_NOARG_SETTER_BODY_VA = 0x008991d0u,
  ISAAC_LUA_FOURTH_NOARG_SETTER_BODY_BYTES = 0x1c,
  ISAAC_LUA_FOURTH_NOARG_SETTER_STACK_CLEAN = 0x08,
  ISAAC_LUA_FOURTH_NOARG_SETTER_SKIP_COUNT = 0,
  ISAAC_LUA_FOURTH_NOARG_SETTER_CODE_UD_VA = 0x009e94e0u,
  ISAAC_LUA_FOURTH_NOARG_SETTER_INSTALLER_VA = 0x00893270u,
  ISAAC_LUA_FOURTH_NOARG_SETTER_HAS_TYPE_GATE = 0,
  ISAAC_LUA_FOURTH_NOARG_SETTER_HAS_THIS_SELECT = 0,
  ISAAC_LUA_FOURTH_NOARG_SETTER_HAS_NULL_GATE = 0,
  ISAAC_LUA_FOURTH_NOARG_SETTER_HAS_PUSH = 0,
  ISAAC_LUA_FOURTH_NOARG_SETTER_HAS_CHECKINTEGER = 0,
  ISAAC_LUA_FOURTH_NOARG_SETTER_SIBLING_COUNT = 1,
  ISAAC_LUA_FOURTH_NOARG_SETTER_RETURN = 0,
  ISAAC_LUA_FOURTH_NOARG_SETTER_NEXT_VA = 0x008991f0u
};

/* Frame residual 0x008607a0 pure imms (ABI v13).
 *   mov ecx, [DAT_00c71690]
 *   mov [ebp-0x24], 1              ; materialize this+4
 *   mov [ebp-0x20], 0xffffffff     ; materialize this+8
 *   mov eax, [ecx+0x10]            ; registry holder (ZHL +0x10)
 *   mov [ebp-0x28], eax
 *   mov eax, [ecx]; test byte [eax], 2; je skip
 *   mov [ebp-4], 0                 ; SEH try level
 *   call FUN_00872980
 *   luaL_unref(out.state, REGISTRYINDEX, out.ref)
 */
enum {
  ISAAC_LUA_FRAME_UNREF_ENGINE_GLOBAL_DAT = 0x00c71690u,
  ISAAC_LUA_FRAME_UNREF_FLAG_MASK = 0x02,
  /* engine+0x10 load — same numeric off as RUN_CALLBACK_REGISTRY. */
  ISAAC_LUA_FRAME_UNREF_REGISTRY_HOLDER_OFF = 0x10,
  ISAAC_LUA_FRAME_UNREF_MATERIALIZE_ARG1 = 0x01,
  ISAAC_LUA_FRAME_UNREF_MATERIALIZE_ARG2_U32 = 0xffffffffu,
  ISAAC_LUA_FRAME_UNREF_TRY_LEVEL = 0
};

/* RegisterClasses install immediates (Vector island VA 0x00866b38 …).
 * Class-ctor path (0x008a7e10) uses nups=0; method helpers (0x008a06a0
 * family) use nups=1 — see ABI v5 METHOD_CLOSURE_NUPS. */
enum {
  ISAAC_LUA_REGISTER_USERDATA_SIZE = 0x04,
  ISAAC_LUA_REGISTER_CLOSURE_NUPS = 0x00
};

/* ---------------------------------------------------------------------------
 * ABI v5 — RegisterClasses table-install / stack-ref pure islands
 * --------------------------------------------------------------------------- */

/* Relative stack indices used by method-install helpers + setmetatable
 * sequences (PE push imm8 sign-extended / mov edx, imm32). -2 is ABI v3. */
enum {
  ISAAC_LUA_RELATIVE_STACK_INDEX_MINUS_1_U32 = 0xffffffffu,
  ISAAC_LUA_RELATIVE_STACK_INDEX_MINUS_3_U32 = 0xfffffffdu,
  ISAAC_LUA_RELATIVE_STACK_INDEX_MINUS_4_U32 = 0xfffffffcu,
  ISAAC_LUA_RELATIVE_STACK_INDEX_MINUS_5_U32 = 0xfffffffbu
};

/* Method-install helper nups (0x008a06a0 family): after newuserdata(L,4),
 * PE push 1; push wrapper; push L; call pushcclosure — nups=1 (userdata
 * upvalue). Distinct from class-ctor nups=0. */
enum { ISAAC_LUA_REGISTER_METHOD_CLOSURE_NUPS = 0x01 };

/* setmetatable / metamethod install: push 1; push -2 before IAT
 * (0x0085bf90, method helpers). */
enum { ISAAC_LUA_REGISTER_SET_META_PUSH_N = 0x01 };

/* Stack-ref RAII object used by RegisterClasses head (0x0085dab0 construct,
 * 0x008a7e10 class create nest-take, 0x0085d910 transfer/return,
 * 0x0085cce0 pop/dtor).
 * Layout: +0 lua_State* (or holder), +4 outstanding slot count. */
enum {
  ISAAC_LUA_STACK_REF_OFF_STATE = 0x00,
  ISAAC_LUA_STACK_REF_OFF_SLOTS = 0x04,
  /* 0x008a7e10: dest.slots = src.slots + 3; src.slots = 0 */
  ISAAC_LUA_STACK_REF_NEST_DELTA = 0x03,
  /* 0x0085d910: after transfer src.slots left at 3; settop if gettop>=3 */
  ISAAC_LUA_STACK_REF_RETURN_LEAVE = 0x03,
  ISAAC_LUA_STACK_REF_SETTOP_THRESHOLD = 0x03,
  /* 0x0085dab0 after host lua_getglobal("_G"): inc dword slots */
  ISAAC_LUA_STACK_REF_CONSTRUCT_PUSH_DELTA = 0x01,
  /* Hash-bound rdata VA of "_G" pushed before construct IAT. */
  ISAAC_LUA_STACK_REF_CONSTRUCT_GLOBAL_NAME_VA = 0x00b6ea60u
};

/* ---------------------------------------------------------------------------
 * ABI v7 — class create 0x008a7e10 (EntityPtr) pure islands
 * RegisterClasses 0x008669a8 → call 0x008a7e10 after construct returns.
 * Prologue pure (before first IAT @ 0x008a7e65):
 *   dest.state = src.state; dest.slots = 0; dest.slots = src.slots+3; src.slots=0
 * Create path (getmetatable null) later rawseti(L, REGISTRY, key) for
 * stack positions -1/-2/-3 with fixed EntityPtr keys (hash-bound).
 * --------------------------------------------------------------------------- */
enum {
  /* Hash-bound rdata VA of "EntityPtr" (hardcoded inside 0x008a7e10). */
  ISAAC_LUA_CLASS_CREATE_ENTITYPTR_NAME_VA = 0x00b701e4u,
  /* C ctor pushed with nups=0 before pushcclosure (VA 0x008a7eb1). */
  ISAAC_LUA_CLASS_CREATE_ENTITYPTR_CTOR_VA = 0x008c32b0u,
  /* Metamethod name rdata VAs used on create + already-registered paths. */
  ISAAC_LUA_CLASS_CREATE_META_GC_NAME_VA = 0x00b753b4u,    /* "__gc" */
  ISAAC_LUA_CLASS_CREATE_META_CLASS_NAME_VA = 0x00b6ea70u, /* "__class" */
  ISAAC_LUA_CLASS_CREATE_META_CONST_NAME_VA = 0x00b6e9c4u, /* "__const" */
  /* EntityPtr create-path lua_rawseti registry integer keys (stack -1/-2/-3). */
  ISAAC_LUA_CLASS_CREATE_REGISTRY_KEY_MINUS_1 = 0x00c8297eu,
  ISAAC_LUA_CLASS_CREATE_REGISTRY_KEY_MINUS_2 = 0x00c8297du,
  ISAAC_LUA_CLASS_CREATE_REGISTRY_KEY_MINUS_3 = 0x00c8297cu
};

/* ---------------------------------------------------------------------------
 * ABI v8 — method helper 0x008a06a0 (EntityPtr::SetReference install) +
 * class-create residual host-arg pure + Vector sibling 0x008a7c00
 *
 * Method helper 0x008a06a0 (thiscall L in ECX) — IAT chain (v9-corrected):
 *   push 4; push L; call lua_newuserdata          ; HOST first IAT @ 0x008a06a7
 *   push 1; push wrapper; push L;
 *     mov [ud], real_fn; call lua_pushcclosure    ; pure nups/wrapper/real_fn
 *   push -3; push L; call lua_absindex            ; pure table absindex −3
 *   push name; push L; mov esi,eax; call pushstring ; pure "SetReference"
 *   push 1; push -2; push L; call lua_rotate      ; pure rotate n=1 idx=−2
 *   push esi; push L; call lua_rawset             ; HOST (abs idx from absindex)
 *   add esp, 0x38                                 ; pure stack cleanup (v9)
 *
 * Class create residual first host @ 0x008a7e65: lua_pushvalue(L, −1).
 * Already-registered dual setmetatable (0x008a7fee…): n=1 idx=−3 then −2.
 * Vector class create 0x008a7c00: parallel EntityPtr shape; first IAT
 * @ 0x008a7c55; create-path rawseti keys 0xc82981/80/7f.
 * --------------------------------------------------------------------------- */
enum {
  /* Hash-bound rdata VA of "SetReference" (method name at 0x008a06ca). */
  ISAAC_LUA_METHOD_SETREFERENCE_NAME_VA = 0x00b701f0u,
  /* Closure wrapper pushed as pushcclosure fn (VA 0x008a06af). */
  ISAAC_LUA_METHOD_SETREFERENCE_WRAPPER_VA = 0x008a80d0u,
  /* Real C method stored into userdata after newuserdata (VA 0x008a06b5). */
  ISAAC_LUA_METHOD_SETREFERENCE_REAL_FN_VA = 0x00872050u,
  /* lua_absindex table index after pushcclosure in 0x008a06a0 (push −3).
   * v8 name retained (historically "pushvalue"); same u32 as ABSINDEX. */
  ISAAC_LUA_METHOD_INSTALL_TABLE_PUSHVALUE_INDEX_U32 = 0xfffffffdu,
  /* Class create residual first pushvalue index (push −1 @ 0x008a7e62). */
  ISAAC_LUA_CLASS_CREATE_FIRST_PUSHVALUE_INDEX_U32 = 0xffffffffu,
  /* Already-registered dual setmetatable stack indices (push 1; push idx). */
  ISAAC_LUA_CLASS_CREATE_ALREADY_SETMETA_INDEX_A_U32 = 0xfffffffdu, /* −3 */
  ISAAC_LUA_CLASS_CREATE_ALREADY_SETMETA_INDEX_B_U32 = 0xfffffffeu, /* −2 */
  /* Vector class create 0x008a7c00 install immediates. */
  ISAAC_LUA_CLASS_CREATE_VECTOR_NAME_VA = 0x00b701dcu,
  ISAAC_LUA_CLASS_CREATE_VECTOR_CTOR_VA = 0x008c3290u,
  /* Vector create-path lua_rawseti registry keys (stack −1/−2/−3). */
  ISAAC_LUA_CLASS_CREATE_VECTOR_REGISTRY_KEY_MINUS_1 = 0x00c82981u,
  ISAAC_LUA_CLASS_CREATE_VECTOR_REGISTRY_KEY_MINUS_2 = 0x00c82980u,
  ISAAC_LUA_CLASS_CREATE_VECTOR_REGISTRY_KEY_MINUS_3 = 0x00c8297fu
};

/* ---------------------------------------------------------------------------
 * ABI v9 — method helper 0x008a06a0 remaining pure between IAT calls
 *
 * Import map (hash-bound IAT slots, Lua5.3.3r.dll):
 *   0xb1839c lua_newuserdata   @ 0x008a06a7
 *   0xb183fc lua_pushcclosure  @ 0x008a06bb
 *   0xb18418 lua_absindex      @ 0x008a06c4
 *   0xb18414 lua_pushstring    @ 0x008a06d2
 *   0xb1840c lua_rotate        @ 0x008a06dd
 *   0xb18408 lua_rawset        @ 0x008a06e5
 *
 * Shared rotate (n=1, idx=−2) also appears in metamethod setter 0x0085bf90
 * (v5 SET_META_PUSH_N was the rotate-n imm on this path).
 * --------------------------------------------------------------------------- */
enum {
  /* lua_absindex(L, −3) after pushcclosure — absolute table index into ESI. */
  ISAAC_LUA_METHOD_INSTALL_ABSINDEX_INDEX_U32 = 0xfffffffdu, /* −3 */
  /* lua_rotate(L, −2, 1) — swap name/closure into rawset key/value order. */
  ISAAC_LUA_METHOD_INSTALL_ROTATE_INDEX_U32 = 0xfffffffeu,   /* −2 */
  ISAAC_LUA_METHOD_INSTALL_ROTATE_N = 0x01,
  /* add esp, 0x38 after six IAT calls (PE VA 0x008a06eb). */
  ISAAC_LUA_METHOD_INSTALL_STACK_ARG_BYTES = 0x38
};

/* ---------------------------------------------------------------------------
 * ABI v10 — SetReference wrapper 0x008a80d0 pure indices / keys / constants
 *
 * Closure wrapper installed by method helper 0x008a06a0 (pushcclosure fn).
 * Full body (hash-bound PE Capstone):
 *   L = [ebp+8]
 *   push 1; push L; call lua_type              ; HOST @ 0x008a80e0  pure idx 1
 *   test eax,eax; je nil_arg1
 *   push 0; push 0xc8297d; edx=1; ecx=L
 *     call 0x0085c590                          ; HOST check/get
 *     arg1_ctx = [eax+4]                       ; pure field +4
 *   nil_arg1: arg1_ctx = 0
 *   push 0xfff0b9d7; push L
 *     call lua_touserdata                      ; HOST @ 0x008a8116  pure uv1
 *   push 2; push L; call lua_type              ; HOST @ 0x008a8123  pure idx 2
 *   test eax,eax; je nil_arg2
 *   push 0; push 0xc8297a; edx=2; ecx=L
 *     call 0x0085c590; arg2 = [eax+4]
 *     call real_fn via [ud](ctx, arg2)
 *   nil_arg2: call real_fn via [ud](ctx, 0)
 *   return 0
 *
 * 0xfff0b9d7 == LUA_REGISTRYINDEX − 1 == lua_upvalueindex(1).
 * Registry key 0xc8297d equals EntityPtr create-path key at stack −2.
 * Registry key 0xc8297a is arg2 type key (no ZHL name; address-stable).
 * --------------------------------------------------------------------------- */
enum {
  /* lua_type(L, 1) @ 0x008a80dd / lua_type(L, 2) @ 0x008a811c. */
  ISAAC_LUA_SETREF_WRAPPER_TYPE_INDEX_1 = 0x01,
  ISAAC_LUA_SETREF_WRAPPER_TYPE_INDEX_2 = 0x02,
  /* Registry integer keys pushed before host check helper 0x0085c590. */
  ISAAC_LUA_SETREF_WRAPPER_REGISTRY_KEY_ARG1 = 0x00c8297du,
  ISAAC_LUA_SETREF_WRAPPER_REGISTRY_KEY_ARG2 = 0x00c8297au,
  /* lua_touserdata(L, lua_upvalueindex(1)) @ 0x008a8110. */
  ISAAC_LUA_SETREF_WRAPPER_TOUSERDATA_INDEX_U32 = 0xfff0b9d7u,
  /* edx stack-index args to 0x0085c590 (arg1 path / arg2 path). */
  ISAAC_LUA_SETREF_WRAPPER_CHECK_STACK_INDEX_1 = 0x01,
  ISAAC_LUA_SETREF_WRAPPER_CHECK_STACK_INDEX_2 = 0x02,
  /* push 0 third arg before 0x0085c590 (flags / optional). */
  ISAAC_LUA_SETREF_WRAPPER_CHECK_FLAGS = 0x00,
  /* [eax+4] field load after check helper returns object. */
  ISAAC_LUA_SETREF_WRAPPER_OBJECT_FIELD_OFF = 0x04,
  /* xor eax,eax before ret (both paths). */
  ISAAC_LUA_SETREF_WRAPPER_RETURN_OK = 0x00
};

/* ---------------------------------------------------------------------------
 * ABI v11 — check/get helper 0x0085c590 pure args / gates
 *
 * Address-stable LuaBridge-style Userdata::getClass residual used by the
 * SetReference wrapper (and siblings). Calling convention from PE + wrapper:
 *   ecx = lua_State* L
 *   edx = stack index (int)
 *   [ebp+8]  = void* class registry key (e.g. 0xc8297d / 0xc8297a)
 *   [ebp+0xc] = canBeConst flags byte (wrapper pushes 0)
 *   returns Userdata* in eax (or 0 after host argerror path)
 *
 * Entry (hash-bound Capstone; see section-notes/lua-v11/disasm-85c590.txt):
 *   push key; mov edi,ecx; mov esi,edx
 *   push 0xfff0b9d8; push L          ; PURE REGISTRYINDEX
 *   mov [ebp-8],esi; xor ebx,ebx    ; PURE got init 0
 *   call lua_rawgetp                ; HOST @ 0x0085c5ab
 *   push esi; push L
 *   call lua_isuserdata             ; HOST @ 0x0085c5b3
 *   test eax,eax; je mismatch       ; PURE isuserdata-continue gate
 *   … getmetatable + rawgetp identity key 0xc7f4b8 …
 *   call lua_type(-1); cmp eax,1    ; PURE LUA_TBOOLEAN
 *   jne not_ours
 *   … __const / isConst / canBeConst argerror / __parent walk / __type …
 *   match: lua_touserdata(L, index); ret
 *   mismatch: pushfstring + luaL_argerror; xor eax,eax; ret
 *
 * Host IAT remain address-stable. Pure peels cover immediates + simple gates.
 * --------------------------------------------------------------------------- */
enum {
  /* lua_rawgetp(L, LUA_REGISTRYINDEX, key) registry arg @ 0x0085c5a0. */
  ISAAC_LUA_CHECK_GET_RAWGETP_REGISTRY_INDEX_U32 = 0xfff0b9d8u,
  /* xor ebx,ebx before first IAT — "got" typename string starts null. */
  ISAAC_LUA_CHECK_GET_GOT_INIT = 0x00,
  /* Identity light-key for second lua_rawgetp (LuaBridge getIdentityKey). */
  ISAAC_LUA_CHECK_GET_IDENTITY_KEY_VA = 0x00c7f4b8u,
  /* lua_type(L, −1) after identity rawgetp @ 0x0085c5da. */
  ISAAC_LUA_CHECK_GET_IDENTITY_TYPE_INDEX_U32 = 0xffffffffu, /* −1 */
  /* cmp eax,1 — Lua 5.3 LUA_TBOOLEAN. */
  ISAAC_LUA_CHECK_GET_LUA_TBOOLEAN = 0x01,
  /* lua_settop(L, −2) pop after identity boolean accept @ 0x0085c5f5. */
  ISAAC_LUA_CHECK_GET_SETTOP_POP_INDEX_U32 = 0xfffffffeu, /* −2 */
  /* Field name rdata VAs (hash-bound). */
  ISAAC_LUA_CHECK_GET_CONST_NAME_VA = 0x00b6e9c4u,         /* "__const" */
  ISAAC_LUA_CHECK_GET_CANNOT_BE_CONST_MSG_VA = 0x00b6e9b4u, /* "cannot be const" */
  ISAAC_LUA_CHECK_GET_PARENT_NAME_VA = 0x00b6e988u,        /* "__parent" */
  ISAAC_LUA_CHECK_GET_TYPE_NAME_VA = 0x00b6e9ccu,          /* "__type" */
  ISAAC_LUA_CHECK_GET_EXPECTED_FMT_VA = 0x00b6e9a0u,       /* "%s expected, got %s" */
  /* lua_rawequal(L, −2, −1) indices in match loop @ 0x0085c670. */
  ISAAC_LUA_CHECK_GET_RAWEQUAL_INDEX_A_U32 = 0xfffffffeu, /* −2 */
  ISAAC_LUA_CHECK_GET_RAWEQUAL_INDEX_B_U32 = 0xffffffffu, /* −1 */
  /* lua_settop(L, −3) after match @ 0x0085c682. */
  ISAAC_LUA_CHECK_GET_MATCH_SETTOP_INDEX_U32 = 0xfffffffdu, /* −3 */
  /* xor eax,eax after host argerror path @ 0x0085c7c8. */
  ISAAC_LUA_CHECK_GET_ERROR_RETURN_NULL = 0x00
};

/* ---------------------------------------------------------------------------
 * ABI v12 — check/get helper 0x0085c590 remaining pure CF after host IAT
 *
 * First host residual remains lua_rawgetp @ 0x0085c5ab. This unit peels pure
 * control-flow gates and stack imms deeper in the body that sit between
 * subsequent host IAT calls (copy / rawequal / parent walk / type-name /
 * mismatch format). All lua_* IAT stay address-stable host.
 *
 * Match loop (simplified):
 *   rawequal(-2,-1); if match → settop -3; const gate; touserdata
 *   else: rawget __parent; if type!=0 → rotate(-2,-1); settop -2; loop
 *         else → rotate(-1,-1); settop -2; rawget __type; rotate(-3,1);
 *                tolstring; format + argerror; return 0
 * Const promote (when __const type==0): lua_copy(L, -1, -3); settop -2
 * --------------------------------------------------------------------------- */
enum {
  /* lua_copy(L, src=-1, dest=-3) on const-promote path @ 0x0085c655. */
  ISAAC_LUA_CHECK_GET_COPY_DEST_INDEX_U32 = 0xfffffffdu, /* −3 */
  ISAAC_LUA_CHECK_GET_COPY_SRC_INDEX_U32 = 0xffffffffu,  /* −1 */
  /* lua_rotate on parent-present path: rotate(L, −2, −1) @ 0x0085c6d9. */
  ISAAC_LUA_CHECK_GET_PARENT_ROTATE_INDEX_U32 = 0xfffffffeu, /* −2 */
  /* lua_rotate on parent-nil path: rotate(L, −1, −1) @ 0x0085c701. */
  ISAAC_LUA_CHECK_GET_PARENT_NIL_ROTATE_INDEX_U32 = 0xffffffffu, /* −1 */
  /* Shared rotate n for both parent paths (push −1 before type test). */
  ISAAC_LUA_CHECK_GET_PARENT_ROTATE_N_U32 = 0xffffffffu, /* −1 */
  /* lua_rotate after __type rawget on no-parent: rotate(L, −3, 1) @ 0x0085c72e. */
  ISAAC_LUA_CHECK_GET_TYPE_ROTATE_INDEX_U32 = 0xfffffffdu, /* −3 */
  ISAAC_LUA_CHECK_GET_TYPE_ROTATE_N = 0x01,
  /* lua_tolstring(L, idx, len=NULL): push 0 for len pointer. */
  ISAAC_LUA_CHECK_GET_TOLSTRING_LEN_NULL = 0x00,
  /* tolstring index on got-from-__type path (parent nil) @ 0x0085c743. */
  ISAAC_LUA_CHECK_GET_TOLSTRING_GOT_INDEX_U32 = 0xfffffffeu, /* −2 */
  /* tolstring index on mismatch / not-ours path @ 0x0085c780. */
  ISAAC_LUA_CHECK_GET_TOLSTRING_MISMATCH_INDEX_U32 = 0xffffffffu, /* −1 */
  /* lua_absindex relative index used across body (push −1) @ 0x0085c5fa etc. */
  ISAAC_LUA_CHECK_GET_ABSINDEX_INDEX_U32 = 0xffffffffu /* −1 */
};

/* Frame residual opaque_call_008607a0 pure gate.
   PE: if ((*(byte *)*DAT_00c71690 & 2) != 0) { materialize; luaL_unref; }
   Caller supplies the already-loaded flag byte from the global engine object
   (*DAT_00c71690). Returns 1 when the host residual (FUN_00872980 +
   luaL_unref) must run; 0 when the original returns with no VM side effects.
   Does not touch Game sparse fields.
   ABI v19: parameter deliberately wide with an explicit low-byte mask in the
   body — a uint8_t parameter lets -O2 delete the narrowing the Wasm ABI
   never performs (class defect; see the v19 byte-width sweep). */
int32_t isaac_lua_engine_frame_unref_needs_host(uint32_t engine_flag_byte);

/* ZHL inline LuaEngine::GetMaskedPointer — pure XOR policy for userdata
   pointer boxing. 32-bit wrap matches x86 PE. */
uint32_t isaac_lua_engine_get_masked_pointer(uint32_t pointer,
                                             uint32_t pointer_mask);

/* ZHL inline LuaEngine::GetLuaDebug — non-zero byte is true. Wide param,
   low byte masked in the body (v19 byte-width sweep). */
int32_t isaac_lua_engine_get_debug(uint32_t debug_field);

/* ---------------------------------------------------------------------------
 * Init VA 0x008604d6 … 0x00860569 — pure pointer-mask mix.
 * Host FUN_00a68490 supplies the 64-bit seed (edx:eax) first; this peels only
 * the subsequent mul/adc/shrd/xor chain that stores this+0x20.
 * seed_lo = EAX after the host call; seed_hi = EDX.
 * --------------------------------------------------------------------------- */
uint32_t isaac_lua_engine_init_pointer_mask(uint32_t seed_lo, uint32_t seed_hi);

/* Init VA 0x0086056c … 0x00860573:
 *   mov eax, [DAT_00c7168c]; test eax,eax; je luaL_newstate
 * Returns 1 when PE takes lua_newstate(custom_alloc) path. */
int32_t isaac_lua_engine_init_use_custom_newstate(uint32_t allocator_global);

/* Init VA 0x0086058b … 0x0086058d after custom lua_newstate:
 *   test eax,eax; je skip_atpanic
 * Returns 1 when PE calls lua_atpanic (state non-null). */
int32_t isaac_lua_engine_init_custom_newstate_ok(uint32_t state_ptr);

/* Init VA 0x008605b0 … 0x008605b4:
 *   cmp byte ptr [ebp+8], 0; je non_debug_requiref_path
 * Returns 1 when PE takes the debug boot path (log + openlibs + _LUADEBUG).
 * Returns 0 when PE takes the non-debug luaL_requiref table path.
 * Wide param, low byte masked in the body (v19 byte-width sweep). */
int32_t isaac_lua_engine_init_take_debug_path(uint32_t debug_arg);

/* Init VA 0x0086060f … 0x0086061b (non-debug only):
 *   mov eax, [DAT_00b23eb4]; test eax,eax; je skip_requiref
 * first_openf is the dword at table_base+4. Returns 1 to enter the loop. */
int32_t isaac_lua_engine_init_requiref_table_ready(uint32_t first_openf);

/* Init VA 0x00860636 … 0x00860641 requiref loop continue:
 *   mov eax, [edi+0xc]; lea edi,[edi+8]; test eax,eax; jne loop
 * next_openf is the dword at current_entry+0xc before/as the advance.
 * Returns 1 to continue the requiref loop. */
int32_t isaac_lua_engine_init_requiref_continue(uint32_t next_openf);

/* Init VA 0x0086064c: mov byte ptr [this+0x1c], DebugArg.
 * Returns the u8 that PE stores (debug_arg & 0xff) as uint32.
 * Wide param, low byte masked in the body (v19 byte-width sweep). */
uint32_t isaac_lua_engine_init_debug_arg_store_byte(uint32_t debug_arg);

/* ---------------------------------------------------------------------------
 * Heap tracker base select (Init 0x0086066c / RunBundled 0x0086e607):
 *   mov edi, [DAT_00c7de78]
 *   test edi, edi
 *   je  use_default
 *   add edi, 0x30
 *   jmp cont
 * use_default: mov edi, DAT_00c7f618
 * --------------------------------------------------------------------------- */
int32_t isaac_lua_engine_heap_tracker_use_global(uint32_t tracker_global);

/* Compute tracker base: global!=0 → global+0x30, else default_base.
 * Pass ISAAC_LUA_HEAP_TRACKER_DEFAULT_BASE for the PE default. */
uint32_t isaac_lua_engine_heap_tracker_base(uint32_t tracker_global,
                                           uint32_t default_base);

/* RunBundled VA 0x0086e62b … 0x0086e62d / Init malloc sites:
 *   test reg,reg; jne ok
 * Returns 1 when allocation pointer is usable (non-null). */
int32_t isaac_lua_engine_alloc_nonnull(uint32_t alloc_ptr);

/* ---------------------------------------------------------------------------
 * ABI v3 — tracked debug-heap alloc commit (Init + RunBundled)
 * After non-null malloc (size S):
 *   mov dword ptr [alloc], S
 *   add alloc, 4                  ; payload
 *   add dword ptr [tracker], S
 *   adc dword ptr [tracker+4], 0
 *   test payload / je null_path   ; Init only (add eax,4; je)
 * --------------------------------------------------------------------------- */

/* Payload pointer after 4-byte size header (32-bit wrap). */
uint32_t isaac_lua_engine_tracked_alloc_payload(uint32_t alloc_ptr);

/* Init VA 0x008606ba … 0x008606c1 / 0x0086075d … 0x00860764:
 *   add eax, 4; je null_path
 * Returns 1 when payload is usable (non-zero after wrap). */
int32_t isaac_lua_engine_tracked_payload_usable(uint32_t payload);

/* 64-bit tracker accumulate: (hi:lo) += size with x86 add/adc wrap.
 * add_lo returns new lo; add_hi returns hi + CF(lo+size). */
uint32_t isaac_lua_engine_heap_tracker_add_lo(uint32_t lo, uint32_t size);
uint32_t isaac_lua_engine_heap_tracker_add_hi(uint32_t lo, uint32_t hi,
                                             uint32_t size);

/* ---------------------------------------------------------------------------
 * ABI v3 — Init field-store pure islands (VA 0x00860584 … 0x00860716)
 * --------------------------------------------------------------------------- */

/* Store-ready state value (identity; documents this+0x18 write). */
uint32_t isaac_lua_engine_init_state_store(uint32_t state_ptr);

/* Null-path store for +0x10 / +0x14 when malloc fails (xor eax,eax). */
uint32_t isaac_lua_engine_init_registry_null_store(void);

/* Returns 1 when a non-null registry object pointer should be written to
 * this+0x10 or this+0x14 (host residual fills object first). */
int32_t isaac_lua_engine_init_registry_store_nonnull(uint32_t object_ptr);

/* ---------------------------------------------------------------------------
 * ABI v3 — RegisterClasses entry pure (VA 0x0086698d)
 *   mov edx, [ebx+0x18]   ; state
 * Body is host (~31KB). Pure gate only: state non-null is required for a
 * well-formed engine; PE itself does not branch, but boot ABI callers need
 * the predicate before host install.
 * --------------------------------------------------------------------------- */
int32_t isaac_lua_engine_register_classes_state_ready(uint32_t state_ptr);

/* Relative stack index -2 as uint32 (PE imm used at RegisterClasses and
 * Init requiref settop). */
uint32_t isaac_lua_engine_relative_stack_index_minus_2(void);

/* ---------------------------------------------------------------------------
 * ABI v3 — RunBundled fopen gate (VA 0x0086e66f … 0x0086e671)
 *   call fopen; test eax,eax; je skip_fclose
 * Returns 1 when PE takes fclose residual (handle non-null).
 * --------------------------------------------------------------------------- */
int32_t isaac_lua_engine_file_handle_open(uint32_t file_handle);

/* ---------------------------------------------------------------------------
 * ABI v3 — FUN_0086e6c0 (VA 0x0086e6c0) pure islands
 * (RunBundled script-runner residual)
 * --------------------------------------------------------------------------- */

/* List empty gate VA 0x0086e725 … 0x0086e729:
 *   mov esi, [sentinel]; cmp esi, sentinel; je skip_walk
 * Returns 1 when the pending-mod list walk is empty (head == sentinel). */
int32_t isaac_lua_engine_run_script_list_empty(uint32_t head,
                                              uint32_t sentinel);

/* MSVC basic_string SSO: capacity < 0x10 → use inline buffer.
 * capacity is the dword at string+0x14 (PE cmp …, 0x10 / jb). */
int32_t isaac_lua_engine_msvc_string_sso_local(uint32_t capacity);

/* Select data pointer: capacity < 0x10 → local_buf, else heap_ptr. */
uint32_t isaac_lua_engine_msvc_string_data_ptr(uint32_t local_buf,
                                              uint32_t heap_ptr,
                                              uint32_t capacity);

/* Needs operator delete residual: capacity >= 0x10. */
int32_t isaac_lua_engine_msvc_string_needs_heap_free(uint32_t capacity);

/* Free byte count = capacity + 1 (PE inc edx before free). */
uint32_t isaac_lua_engine_msvc_string_free_bytes(uint32_t capacity);

/* Aligned free path: free_bytes >= 0x1000 (reads header at ptr-4). */
int32_t isaac_lua_engine_msvc_string_aligned_free(uint32_t free_bytes);

/* Aligned header validation:
 *   real = *(ptr-4); slack = (ptr - real) - 4; ok if slack <= 0x1f
 * Returns 1 when PE continues to free (slack in range); 0 → invalid_param. */
int32_t isaac_lua_engine_msvc_string_aligned_header_ok(uint32_t ptr,
                                                      uint32_t real_base);

/* Debug package-path rewrite gate (VA 0x0086e7ee / 0x0086eb8c):
 *   cmp byte ptr [engine+0x1c], 0; je skip
 * Same byte Init stored from DebugArg. Returns 1 to take debug rewrite.
 * Wide param, low byte masked in the body (v19 byte-width sweep). */
int32_t isaac_lua_engine_run_script_take_debug_path(uint32_t debug_arg_byte);

/* luaL_loadfilex / lua_pcallk status: 0 = LUA_OK.
 * Returns 1 when status is success (PE je / jne on eax). */
int32_t isaac_lua_engine_lua_status_ok(int32_t status);

/* FUN_0086e6c0 result flag assembly (VA 0x0086eb5e … 0x0086eb8c):
 *   load_status != 0 → fail
 *   else pcall_status != 0 → fail
 *   else success
 * Returns 1 on failure (PE stores 1 into local), 0 on success — matches the
 * inverted bool that becomes the function's al after further host work? PE
 * stores failure into [ebp-0x98] as 1; final return is that byte inverted
 * later. This helper peels only the failure-flag assembly. */
int32_t isaac_lua_engine_run_script_fail_flag(int32_t load_status,
                                             int32_t pcall_status);

/* Invert fail flag to bool success (al): fail==0 → 1. */
int32_t isaac_lua_engine_run_script_success_bool(int32_t fail_flag);

/* ---------------------------------------------------------------------------
 * ABI v4 — LuaEngine::destroy pure islands (VA 0x0086e520, exact ZHL unique)
 * Ordered residual:
 *   list walk host 0x00870e00(this, node+8) while head != sentinel
 *   pure list reset (self-link next/prev, count=0)
 *   if +0x10 non-null: host luaL_unref + free(8); pure null +0x10
 *   if +0x14 non-null: same; pure null +0x14
 *   host lua_close(+0x18); pure null +0x18
 * --------------------------------------------------------------------------- */

/* List empty: head == sentinel (same predicate as run_script_list_empty). */
int32_t isaac_lua_engine_destroy_list_empty(uint32_t head, uint32_t sentinel);

/* Node payload / path string: PE lea eax,[esi+8] before host 0x00870e00. */
uint32_t isaac_lua_engine_destroy_list_node_payload(uint32_t node);

/* Self-link store value for sentinel->next and sentinel->prev (identity). */
uint32_t isaac_lua_engine_destroy_list_self_link(uint32_t sentinel);

/* Count clear store for DAT_00c79860 after list reset. */
uint32_t isaac_lua_engine_destroy_list_count_clear(void);

/* Registry object present at this+0x10 / this+0x14 → host unref+free. */
int32_t isaac_lua_engine_destroy_registry_present(uint32_t object_ptr);

/* Null field store after free / lua_close (+0x10 / +0x14 / +0x18). */
uint32_t isaac_lua_engine_destroy_field_null_store(void);

/* Free size pushed before operator delete on registry objects (push 8). */
uint32_t isaac_lua_engine_destroy_registry_free_size(void);

/* ---------------------------------------------------------------------------
 * ABI v4 — doubly-linked list unlink pure (FUN_0086e6c0 match-remove
 * VA 0x0086e778 … 0x0086e78a; also conceptual inverse of destroy reset)
 *   next = [node]; prev = [node+4]
 *   [prev] = next; [next+4] = prev; count--
 * Caller supplies already-loaded next/prev/count; helpers return store values.
 * --------------------------------------------------------------------------- */
uint32_t isaac_lua_engine_list_unlink_prev_next_store(uint32_t next);
uint32_t isaac_lua_engine_list_unlink_next_prev_store(uint32_t prev);
/* 32-bit wrap dec (PE dec dword). */
uint32_t isaac_lua_engine_list_count_dec(uint32_t count);

/* ---------------------------------------------------------------------------
 * ABI v4 — FUN_00872980 materialize pure (frame residual host body)
 * After host rawgeti + value pushes, PE:
 *   push 0; push 0; push 0; push 1; push 2; push L; call  (nargs=2,nresults=1)
 *   test eax,eax; jne error
 * Success: out+0 = L, out+4 = luaL_ref result (host).
 * --------------------------------------------------------------------------- */
uint32_t isaac_lua_engine_materialize_call_nargs(void);
uint32_t isaac_lua_engine_materialize_call_nresults(void);
/* Call success gate (status == 0) — same as lua_status_ok, frame site. */
int32_t isaac_lua_engine_materialize_call_ok(int32_t status);

/* Registry object field loads (document offsets; identity pass-through). */
uint32_t isaac_lua_engine_registry_object_state(uint32_t state_field);
uint32_t isaac_lua_engine_registry_object_ref(uint32_t ref_field);

/* ---------------------------------------------------------------------------
 * ABI v25 — FUN_00872980 materialize BODY as an ordered host-event program.
 * PE (this unit): fn 0x00872980 .. 0x00872a1d; success `ret 8` @ 0x00872a09;
 * error path 0x00872a0c .. 0x00872a1d NEVER returns (int3). Entry aligns the
 * stack (and esp, 0xfffffff8). Program order and IAT slots are pinned by the
 * tests; the Lua VM IAT surface (Lua5.3.3r.dll) stays address-stable host.
 * --------------------------------------------------------------------------- */
uint32_t isaac_lua_engine_materialize_program_event_count(void);
/* Event kind for index, -1 out of range. */
int32_t isaac_lua_engine_materialize_program_event_kind(int32_t index);
/* IAT slot (VA) hosting the event, 0 out of range. */
uint32_t isaac_lua_engine_materialize_program_event_iat_slot(int32_t index);
/* Stack-arg push count for the event (incl. L), 0 out of range. */
uint32_t isaac_lua_engine_materialize_program_event_args(int32_t index);
/* imm-slot count for the event (pushinteger events carry none), 0 OOR. */
uint32_t isaac_lua_engine_materialize_program_event_ims(int32_t index);
/* imm value at (event, slot); 0 when the slot is not an imm or OOR. */
uint32_t isaac_lua_engine_materialize_program_event_imm(int32_t index,
                                                        int32_t slot);
/* pcallk success gate: status == 0 (full-dword test, unmasked). */
int32_t isaac_lua_engine_materialize_program_gate(int32_t status);
/* out->state is stored BEFORE the luaL_ref call; out->ref AFTER it. */
int32_t isaac_lua_engine_materialize_out_state_store_before_ref(void);
/* Error path: 0x85c080(L, &buf) builds an MSVC error string (returns
   normally, ret 8 @ 0x85c1c5); 0x8727d0 raises and never returns. */
uint32_t isaac_lua_engine_materialize_error_builder_va(void);
uint32_t isaac_lua_engine_materialize_error_raiser_va(void);
int32_t isaac_lua_engine_materialize_error_path_no_return(void);
uint32_t isaac_lua_engine_materialize_error_buf_size(void);
uint32_t isaac_lua_engine_materialize_entry_align_mask(void);
uint32_t isaac_lua_engine_materialize_ret_dwords(void);
uint32_t isaac_lua_engine_materialize_success_ret_end(void);
uint32_t isaac_lua_engine_materialize_error_path_start(void);
uint32_t isaac_lua_engine_materialize_fn_end(void);

/* ---------------------------------------------------------------------------
 * ABI v26 -- error-path callee bodies inside the v25 materialize boundary
 * as ordered host-event programs (transcribed this unit from the PE).
 * Builder 0x85c080 (ret 8 @ 0x85c1c5; returns this): error-message object
 * ctor { vtable 0xb753d0 @ +0, std::exception @ +4 (zeroed), L @ +0xc,
 * std::string @ +0x10 (SSO 0x10..0x1f, size +0x20, capacity +0x24) }.
 *   path A (gettop > 0, SIGNED jle @ 0x85c0ed): lua_tolstring(L,-1,0);
 *     result or default literal 0xb1a4ec (first byte 0 -> empty); inline
 *     strlen; std::string::assign(ptr,len) 0x40ccd0.
 *   path B (gettop <= 0): capacity RE-READ from [this+0x24] per call;
 *     cap >= 0xd (UNSIGNED jb) reuses the buffer (SSO if cap < 0x10 else
 *     heap ptr), memcpy 0xaf08bd(dst, 0xb6e96c, 0xd) with size stored
 *     BEFORE and null term AFTER; else grow law (unsigned shr/jbe/cmova):
 *     newcap = cap <= 0x7fffffff-(cap>>1) ? max(0xf, cap+(cap>>1))
 *     : 0x7fffffff; operator new 0x40cf00(size=newcap+1 via ecx); size,
 *     then cap, then 13-byte literal copy (8+4+1), then heap ptr LAST.
 * Raiser 0x8727d0 (NEVER returns; int3 @ 0x872819): local exc object at
 *   ebp-0x38; error-exc ctor 0x897620(this=&local, arg=&varargs at ebp+8);
 *   _CxxThrowException via IAT 0xb18758 (thunk 0xaf05eb) with (obj,
 *   _ThrowInfo 0xbd5bf8, unwind dtor 0x85c1d0).
 * 49 identical (builder, raiser) call pairs image-wide (census this unit).
 * The Lua VM IAT surface, the shared std::string/CRT helpers and the C++
 * throw machinery stay address-stable host. All gates take full dwords and
 * are driven UNMASKED (no uint8_t narrowing anywhere).
 * ------------------------------------------------------------------------- */
uint32_t isaac_lua_engine_materialize_builder_va(void);
uint32_t isaac_lua_engine_materialize_builder_ret_end(void);
uint32_t isaac_lua_engine_materialize_builder_event_count(void);
int32_t isaac_lua_engine_materialize_builder_event_kind(int32_t index);
/* Call-target VA per event (IAT slot for lua_* events, helper VA for the
   shared string/CRT helpers), 0 out of range. */
uint32_t isaac_lua_engine_materialize_builder_event_iat_slot(int32_t index);
uint32_t isaac_lua_engine_materialize_builder_event_args(int32_t index);
uint32_t isaac_lua_engine_materialize_builder_event_ims(int32_t index);
/* Imm at (event, slot) in PUSH order; 0 when not an imm or OOR. */
uint32_t isaac_lua_engine_materialize_builder_event_imm(int32_t index,
                                                        int32_t slot);
/* path-A gate: gettop > 0 (SIGNED full-dword test, PE jle @ 0x85c0ed). */
int32_t isaac_lua_engine_materialize_builder_gettop_gate(int32_t top);
/* tostring result select: nonzero stays, 0 -> default literal 0xb1a4ec. */
uint32_t isaac_lua_engine_materialize_builder_tostring_result(uint32_t str);
/* reuse gate: capacity >= 0xd (UNSIGNED jb @ 0x85c12b; capacity re-read
   per call, never folded). */
int32_t isaac_lua_engine_materialize_builder_reuse_gate(uint32_t cap);
/* SSO gate: capacity < 0x10 (UNSIGNED jb @ 0x85c133). */
int32_t isaac_lua_engine_materialize_builder_sso_gate(uint32_t cap);
/* grow law (unsigned shr/jbe/cmova @ 0x85c158..0x85c17b). */
uint32_t isaac_lua_engine_materialize_builder_grow_capacity(uint32_t cap);
/* allocation size = newcap + 1 (u32 wrap). */
uint32_t isaac_lua_engine_materialize_builder_grow_alloc_size(uint32_t cap);
uint32_t isaac_lua_engine_materialize_builder_literal_va(void);
uint32_t isaac_lua_engine_materialize_builder_literal_len(void);
uint32_t isaac_lua_engine_materialize_builder_default_literal_va(void);
uint32_t isaac_lua_engine_materialize_builder_vtable_va(void);
uint32_t isaac_lua_engine_materialize_builder_off_state(void);
uint32_t isaac_lua_engine_materialize_builder_off_string(void);
uint32_t isaac_lua_engine_materialize_builder_off_size(void);
uint32_t isaac_lua_engine_materialize_builder_off_capacity(void);
uint32_t isaac_lua_engine_materialize_builder_init_capacity(void);
uint32_t isaac_lua_engine_materialize_builder_seh_handler_va(void);
uint32_t isaac_lua_engine_materialize_builder_ret_dwords(void);
/* epilogue returns this (mov eax, edi @ 0x85c1b2). */
int32_t isaac_lua_engine_materialize_builder_return_this(void);
/* grow path store order: size then cap then literal copy then heap ptr
   LAST (@ 0x85c183 / 0x85c18a / 0x85c18d / 0x85c1af). */
int32_t isaac_lua_engine_materialize_builder_buf_ptr_store_last(void);
/* Whole-image census: 49 direct E8 callers, all identical pairs. */
uint32_t isaac_lua_engine_materialize_builder_callsite_count(void);
uint32_t isaac_lua_engine_materialize_raiser_va(void);
uint32_t isaac_lua_engine_materialize_raiser_fn_end(void);
uint32_t isaac_lua_engine_materialize_raiser_event_count(void);
int32_t isaac_lua_engine_materialize_raiser_event_kind(int32_t index);
/* Call-target VA per event (exc ctor 0x897620 / throw thunk 0xaf05eb). */
uint32_t isaac_lua_engine_materialize_raiser_event_iat_slot(int32_t index);
uint32_t isaac_lua_engine_materialize_raiser_event_args(int32_t index);
uint32_t isaac_lua_engine_materialize_raiser_event_ims(int32_t index);
uint32_t isaac_lua_engine_materialize_raiser_event_imm(int32_t index,
                                                       int32_t slot);
/* raiser NEVER returns: int3 @ 0x872819, no ret in the body. */
int32_t isaac_lua_engine_materialize_raiser_no_return(void);
uint32_t isaac_lua_engine_materialize_raiser_exc_local_off(void);
uint32_t isaac_lua_engine_materialize_raiser_varargs_src_off(void);
uint32_t isaac_lua_engine_materialize_raiser_throw_info_va(void);
uint32_t isaac_lua_engine_materialize_raiser_exc_ctor_va(void);
uint32_t isaac_lua_engine_materialize_raiser_throw_iat(void);
uint32_t isaac_lua_engine_materialize_raiser_seh_handler_va(void);

/* ---------------------------------------------------------------------------
 * ABI v27 -- first band-C primary getter BODY 0x008c32d0 pure islands.
 * PE (section table, raw 0x4c26d0, 0x5c bytes; identify-zhl: no match):
 *   lua_type(L, 1) via IAT 0xb18400; test eax,eax / jne (FULL-WORD);
 *   type==0 -> edi=0, skip check; else push flag 1, key 0xc82a30,
 *   edx=1, ecx=L, call 0x85c590, edi=[eax+4];
 *   lua_touserdata(L, 0xfff0b9d7) via IAT 0xb183b0;
 *   ecx=edi; edx=[eax]; call edx; then 0x85bff0(L, result); ret 1.
 * Nil receiver STILL calls the upvalue (this=0). Host: both IAT, the
 * class-check body, the upvalue fn, and the 0x85bff0 pusher.
 * ------------------------------------------------------------------------- */
uint32_t isaac_lua_engine_band_c_primary_va(void);
uint32_t isaac_lua_engine_band_c_primary_type_index(void);
/* PE 0x8c32e4: test eax,eax / jne - FULL-WORD (same encoding as v22 C7
   on this body, independently observed). 0x100 takes the check path. */
int32_t isaac_lua_engine_band_c_primary_type_gate_taken(uint32_t lua_type_result);
/* this = (type != 0) ? checked_this : 0. checked_this is [eax+4] from
   the class-check; nil path zeros edi. Drive UNMASKED. */
uint32_t isaac_lua_engine_band_c_primary_this(uint32_t lua_type_result,
                                              uint32_t checked_this);
int32_t isaac_lua_engine_band_c_primary_nil_still_calls(void);
uint32_t isaac_lua_engine_band_c_primary_check_flag(void);
uint32_t isaac_lua_engine_band_c_primary_check_stack_index(void);
uint32_t isaac_lua_engine_band_c_primary_class_key(void);
uint32_t isaac_lua_engine_band_c_primary_object_field_off(void);
uint32_t isaac_lua_engine_band_c_primary_touserdata_index(void);
uint32_t isaac_lua_engine_band_c_primary_iat_lua_type(void);
uint32_t isaac_lua_engine_band_c_primary_iat_lua_touserdata(void);
uint32_t isaac_lua_engine_band_c_primary_push_va(void);
uint32_t isaac_lua_engine_band_c_primary_return_value(void);
uint32_t isaac_lua_engine_band_c_next_va(void);

/* ---------------------------------------------------------------------------
 * ABI v28 -- band-C primary template (10 x 0x5c, stride 0x60).
 * Shared CF is v27 (type gate / this-select / nil-still-calls). Per-index
 * islands: VA = 0x008c32d0 + 0x60 * i; class key from kBandC[i].
 * Out-of-range index -> 0 / -1. Rel32s are position-derived (not stored).
 * ------------------------------------------------------------------------- */
uint32_t isaac_lua_engine_band_c_primary_stride(void);
uint32_t isaac_lua_engine_band_c_primary_identical_bytes(void);
uint32_t isaac_lua_engine_band_c_primary_va_at(int32_t index);
uint32_t isaac_lua_engine_band_c_primary_class_key_at(int32_t index);
int32_t isaac_lua_engine_band_c_primary_index_for_va(uint32_t va);

/* ---------------------------------------------------------------------------
 * ABI v29 -- band-C secondary template (16 x 0xa4, stride 0xc0).
 * Shared CF is v27 (type gate / this-select / nil-still-calls) plus the
 * indexed wrap: luaL_checkinteger(2), FULL-WORD result-null gate,
 * userdata(8)+tag 0xb753c8, rawgetp/setmetatable(-2). Per-index:
 * VA = 0x008c4e90 + 0xc0 * i; class key from kBandC[10+i].
 * Out-of-range index -> 0 / -1. Rel32s are position-derived (not stored).
 * ------------------------------------------------------------------------- */
uint32_t isaac_lua_engine_band_c_secondary_stride(void);
uint32_t isaac_lua_engine_band_c_secondary_identical_bytes(void);
uint32_t isaac_lua_engine_band_c_secondary_va_at(int32_t index);
uint32_t isaac_lua_engine_band_c_secondary_class_key_at(int32_t index);
uint32_t isaac_lua_engine_band_c_secondary_check_flag_at(int32_t index);
uint32_t isaac_lua_engine_band_c_secondary_wrap_key_at(int32_t index);
int32_t isaac_lua_engine_band_c_secondary_index_for_va(uint32_t va);
int32_t isaac_lua_engine_band_c_secondary_result_null_gate(uint32_t result);
uint32_t isaac_lua_engine_band_c_secondary_checkinteger_index(void);
uint32_t isaac_lua_engine_band_c_secondary_wrap_ud_size(void);
uint32_t isaac_lua_engine_band_c_secondary_wrap_tag_va(void);
uint32_t isaac_lua_engine_band_c_secondary_return_value(void);

/* ---------------------------------------------------------------------------
 * ABI v30 -- leftover extra getter BODY 0x008a0600 pure islands.
 * PE (section table, raw 0x49fa00, 0x88 bytes; identify-zhl: no match):
 *   v27 prefix: lua_type(L,1) IAT 0xb18400; FULL-WORD type gate;
 *   type==0 -> edi=0; else push flag 1, key 0xc8297d, edx=1, ecx=L,
 *   call 0x85c590, edi=[eax+4];
 *   lua_touserdata(L, 0xfff0b9d7) IAT 0xb183b0; ecx=edi; edx=[ud];
 *   call edx; result in edi.
 *   v29 wrap minus checkinteger: test edi,edi / je (FULL-WORD);
 *   userdata(8)+tag 0xb753c8+field +4; rawgetp key 0xc8297a /
 *   REGISTRYINDEX; setmetatable(-2); null path pushnil; both ret 1.
 * 0x008c5a90 classified dtor, not peeled. Host: IAT surface, 0x85c590,
 * the upvalue fn. Shared CF is v27/v29 BY REFERENCE.
 * v31 census: 0x008c5b90 is 10 release/unref wrappers
 * (call 0x85c3e0 then vtbl[0](0); ret 0), not a getter. Next
 * getter-shaped VA 0x008976a0 is peeled in ABI v31.
 * ------------------------------------------------------------------------- */
uint32_t isaac_lua_engine_leftover_extra_va(void);
uint32_t isaac_lua_engine_leftover_extra_body_bytes(void);
uint32_t isaac_lua_engine_leftover_extra_class_key(void);
uint32_t isaac_lua_engine_leftover_extra_check_flag(void);
uint32_t isaac_lua_engine_leftover_extra_wrap_key(void);
uint32_t isaac_lua_engine_leftover_extra_code_ud_va(void);
int32_t isaac_lua_engine_leftover_extra_has_checkinteger(void);
int32_t isaac_lua_engine_leftover_extra_result_null_gate(uint32_t result);
uint32_t isaac_lua_engine_leftover_extra_return_value(void);
uint32_t isaac_lua_engine_leftover_extra_next_va(void);

/* ---------------------------------------------------------------------------
 * ABI v31 -- fourth-region string getter BODY 0x008976a0 pure islands.
 * PE (section table, raw 0x496aa0, 0x31 bytes to first ret; identify-zhl:
 * no match; image-wide exact body: 1 site):
 *   lua_touserdata(L, 0xfff0b9d7) IAT 0xb183b0; call [ud];
 *   test eax,eax / je (FULL-WORD); pushstring IAT 0xb18414 else
 *   pushnil IAT 0xb183e0; both ret 1.
 * No lua_type / this-select (v27 law is a different shape). Null
 * gate reuses the v29 FULL-WORD law BY REFERENCE. Distinct from
 * v29 wrap: no userdata(8)/tag/rawgetp/setmetatable. Host: IAT
 * surface + the upvalue fn. Next: 0x008976f0.
 * ------------------------------------------------------------------------- */
uint32_t isaac_lua_engine_fourth_getter_va(void);
uint32_t isaac_lua_engine_fourth_getter_body_bytes(void);
uint32_t isaac_lua_engine_fourth_getter_full_bytes(void);
uint32_t isaac_lua_engine_fourth_getter_code_ud_va(void);
uint32_t isaac_lua_engine_fourth_getter_touserdata_index(void);
uint32_t isaac_lua_engine_fourth_getter_iat_lua_touserdata(void);
uint32_t isaac_lua_engine_fourth_getter_iat_lua_pushstring(void);
uint32_t isaac_lua_engine_fourth_getter_iat_lua_pushnil(void);
int32_t isaac_lua_engine_fourth_getter_has_type_gate(void);
int32_t isaac_lua_engine_fourth_getter_has_this_select(void);
int32_t isaac_lua_engine_fourth_getter_has_checkinteger(void);
int32_t isaac_lua_engine_fourth_getter_sibling_count(void);
int32_t isaac_lua_engine_fourth_getter_result_null_gate(uint32_t result);
uint32_t isaac_lua_engine_fourth_getter_return_value(void);
uint32_t isaac_lua_engine_fourth_getter_next_va(void);

/* ---------------------------------------------------------------------------
 * ABI v32 -- fourth-region integer setter BODY 0x008976f0 pure islands.
 * PE (section table, raw 0x496af0, 0x32 bytes to ret; identify-zhl:
 * no match; image-wide exact body: 1 site):
 *   lua_touserdata(L, 0xfff0b9d7) IAT 0xb183b0 (v31 BY REFERENCE);
 *   luaL_checkinteger(L, 1) IAT 0xb183f4 (v29 IAT BY REFERENCE;
 *   index 1, not v29's 2); call [ud](integer); add esp,0x14;
 *   xor eax,eax; ret 0.
 * No lua_type / this-select (v27 law is a different shape).
 * No FULL-WORD null gate / pushstring / pushnil (v31 getter is a
 * different shape). Host: IAT surface + the upvalue fn. Next:
 * 0x00897730.
 * ------------------------------------------------------------------------- */
uint32_t isaac_lua_engine_fourth_setter_va(void);
uint32_t isaac_lua_engine_fourth_setter_body_bytes(void);
uint32_t isaac_lua_engine_fourth_setter_checkinteger_index(void);
uint32_t isaac_lua_engine_fourth_setter_stack_clean(void);
uint32_t isaac_lua_engine_fourth_setter_touserdata_index(void);
uint32_t isaac_lua_engine_fourth_setter_iat_lua_touserdata(void);
uint32_t isaac_lua_engine_fourth_setter_iat_checkinteger(void);
int32_t isaac_lua_engine_fourth_setter_has_type_gate(void);
int32_t isaac_lua_engine_fourth_setter_has_this_select(void);
int32_t isaac_lua_engine_fourth_setter_has_null_gate(void);
int32_t isaac_lua_engine_fourth_setter_has_push(void);
int32_t isaac_lua_engine_fourth_setter_sibling_count(void);
uint32_t isaac_lua_engine_fourth_setter_return_value(void);
uint32_t isaac_lua_engine_fourth_setter_next_va(void);

/* ---------------------------------------------------------------------------
 * ABI v33 -- fourth-region boolean setter BODY 0x00897730 pure islands.
 * PE (section table, raw 0x496b30, 0x37 bytes to ret; identify-zhl:
 * no match; image-wide exact body: 1 site):
 *   lua_touserdata(L, 0xfff0b9d7) IAT 0xb183b0 (v31 BY REFERENCE);
 *   lua_toboolean(L, 1) IAT 0xb183e8 (v22 IAT BY REFERENCE);
 *   FULL-WORD test eax,eax / setne (v22 boolean-normalize BY
 *   REFERENCE); call [ud](bool); add esp,0x14; xor eax,eax; ret 0.
 * No lua_type / this-select (v27 law is a different shape).
 * No FULL-WORD null gate / pushstring / pushnil (v31 getter is a
 * different shape). No checkinteger (v32 setter is a different
 * shape). Host: IAT surface + the upvalue fn. Next: 0x00897770.
 * ------------------------------------------------------------------------- */
uint32_t isaac_lua_engine_fourth_bool_setter_va(void);
uint32_t isaac_lua_engine_fourth_bool_setter_body_bytes(void);
uint32_t isaac_lua_engine_fourth_bool_setter_toboolean_index(void);
uint32_t isaac_lua_engine_fourth_bool_setter_stack_clean(void);
uint32_t isaac_lua_engine_fourth_bool_setter_touserdata_index(void);
uint32_t isaac_lua_engine_fourth_bool_setter_iat_lua_touserdata(void);
uint32_t isaac_lua_engine_fourth_bool_setter_iat_lua_toboolean(void);
int32_t isaac_lua_engine_fourth_bool_setter_has_type_gate(void);
int32_t isaac_lua_engine_fourth_bool_setter_has_this_select(void);
int32_t isaac_lua_engine_fourth_bool_setter_has_null_gate(void);
int32_t isaac_lua_engine_fourth_bool_setter_has_push(void);
int32_t isaac_lua_engine_fourth_bool_setter_has_checkinteger(void);
int32_t isaac_lua_engine_fourth_bool_setter_sibling_count(void);
int32_t isaac_lua_engine_fourth_bool_setter_boolean_normalize(uint32_t value);
uint32_t isaac_lua_engine_fourth_bool_setter_return_value(void);
uint32_t isaac_lua_engine_fourth_bool_setter_next_va(void);

/* ---------------------------------------------------------------------------
 * ABI v34 -- fourth-region boolean getter BODY 0x00897770 pure islands.
 * PE (section table, raw 0x496b70, 0x30 bytes to first ret; identify-zhl:
 * no match; do not open 0x008977a0):
 *   lua_touserdata(L, 0xfff0b9d7) IAT 0xb183b0 (v31 BY REFERENCE);
 *   call [ud](); BYTE test al,al / setne cl (NOT v22/v33 FULL-WORD);
 *   lua_pushboolean(L, cl) IAT 0xb183ec (v22 IAT BY REFERENCE);
 *   add esp,0x10; mov eax,1; ret 1.
 * No lua_type / this-select (v27 law is a different shape).
 * No FULL-WORD null gate / pushstring / pushnil (v31 getter is a
 * different shape). No toboolean / FULL-WORD setne / ret 0 (v33
 * setter is a different shape). Host: IAT surface + the upvalue fn.
 * Next: 0x008977a0.
 * ------------------------------------------------------------------------- */
uint32_t isaac_lua_engine_fourth_bool_getter_va(void);
uint32_t isaac_lua_engine_fourth_bool_getter_body_bytes(void);
uint32_t isaac_lua_engine_fourth_bool_getter_stack_clean(void);
uint32_t isaac_lua_engine_fourth_bool_getter_touserdata_index(void);
uint32_t isaac_lua_engine_fourth_bool_getter_iat_lua_touserdata(void);
uint32_t isaac_lua_engine_fourth_bool_getter_iat_lua_pushboolean(void);
int32_t isaac_lua_engine_fourth_bool_getter_has_type_gate(void);
int32_t isaac_lua_engine_fourth_bool_getter_has_this_select(void);
int32_t isaac_lua_engine_fourth_bool_getter_has_null_gate(void);
int32_t isaac_lua_engine_fourth_bool_getter_has_checkinteger(void);
int32_t isaac_lua_engine_fourth_bool_getter_sibling_count(void);
int32_t isaac_lua_engine_fourth_bool_getter_boolean_normalize(uint32_t value);
uint32_t isaac_lua_engine_fourth_bool_getter_return_value(void);
uint32_t isaac_lua_engine_fourth_bool_getter_next_va(void);

/* ---------------------------------------------------------------------------
 * ABI v35 -- fourth-region number setter BODY 0x008977a0 pure islands.
 * PE (section table, raw 0x496ba0, 0x4d bytes to ret; identify-zhl:
 * no match; do not open past int3 0x008977ed):
 *   lua_touserdata(L, 0xfff0b9d7) IAT 0xb183b0 (v31 BY REFERENCE);
 *   luaL_checknumber(L, 1) IAT 0xb18324 (v22 IAT BY REFERENCE);
 *   fstp f32 + bit-stable dword reload; call [ud](f32);
 *   add esp,0xc then add esp,4; xor eax,eax; ret 0.
 * No lua_type / this-select (v27 law is a different shape).
 * No checkinteger (v32 setter is a different shape / IAT).
 * No toboolean / pushboolean (v33/v34 are different shapes).
 * Host: IAT surface + the upvalue fn. Next: 0x008977f0.
 * ------------------------------------------------------------------------- */
uint32_t isaac_lua_engine_fourth_number_setter_va(void);
uint32_t isaac_lua_engine_fourth_number_setter_body_bytes(void);
uint32_t isaac_lua_engine_fourth_number_setter_checknumber_index(void);
uint32_t isaac_lua_engine_fourth_number_setter_stack_clean(void);
uint32_t isaac_lua_engine_fourth_number_setter_stack_clean_host(void);
uint32_t isaac_lua_engine_fourth_number_setter_touserdata_index(void);
uint32_t isaac_lua_engine_fourth_number_setter_iat_lua_touserdata(void);
uint32_t isaac_lua_engine_fourth_number_setter_iat_checknumber(void);
int32_t isaac_lua_engine_fourth_number_setter_has_type_gate(void);
int32_t isaac_lua_engine_fourth_number_setter_has_this_select(void);
int32_t isaac_lua_engine_fourth_number_setter_has_null_gate(void);
int32_t isaac_lua_engine_fourth_number_setter_has_push(void);
int32_t isaac_lua_engine_fourth_number_setter_has_checkinteger(void);
int32_t isaac_lua_engine_fourth_number_setter_sibling_count(void);
uint32_t isaac_lua_engine_fourth_number_setter_f32_bits(uint32_t bits);
uint32_t isaac_lua_engine_fourth_number_setter_return_value(void);
uint32_t isaac_lua_engine_fourth_number_setter_next_va(void);

/* ---------------------------------------------------------------------------
 * ABI v36 -- fourth-region number getter BODY 0x00897930 pure islands.
 * PE (section table, raw 0x496d30, 0x36 bytes to first ret; identify-zhl:
 * no match; skip 0x008977f0 ctor; do not open 0x00897970):
 *   lua_touserdata(L, 0xfff0b9d7) IAT 0xb183b0 (v31 BY REFERENCE);
 *   call [ud](); fstp f32; movss xmm1; call 0x85c050 (host push-f32,
 *   typed VA export, stays host); mov eax,1; ret 1.
 * No lua_type / this-select (v27 law is a different shape).
 * No FULL-WORD null gate (v31 getter is a different shape).
 * No checknumber (v35 setter is a different shape).
 * Host: IAT surface + the upvalue fn + 0x85c050. Next: 0x00897970.
 * ------------------------------------------------------------------------- */
uint32_t isaac_lua_engine_fourth_number_getter_va(void);
uint32_t isaac_lua_engine_fourth_number_getter_body_bytes(void);
uint32_t isaac_lua_engine_fourth_number_getter_touserdata_index(void);
uint32_t isaac_lua_engine_fourth_number_getter_iat_lua_touserdata(void);
uint32_t isaac_lua_engine_fourth_number_getter_host_va_push(void);
int32_t isaac_lua_engine_fourth_number_getter_has_type_gate(void);
int32_t isaac_lua_engine_fourth_number_getter_has_this_select(void);
int32_t isaac_lua_engine_fourth_number_getter_has_null_gate(void);
int32_t isaac_lua_engine_fourth_number_getter_has_checkinteger(void);
int32_t isaac_lua_engine_fourth_number_getter_sibling_count(void);
uint32_t isaac_lua_engine_fourth_number_getter_return_value(void);
uint32_t isaac_lua_engine_fourth_number_getter_next_va(void);

/* ---------------------------------------------------------------------------
 * ABI v37 -- sequential indexed bool setter BODY 0x00897f00 pure islands.
 * PE (section table, raw 0x497300, 0x49 bytes to first ret; identify-zhl:
 * no match; skip 0x00897970 Vector wrap/ctor; skip SEH 0x00897a10..
 * 0x00897d50; do not reopen 0x008977f0):
 *   lua_touserdata(L, 0xfff0b9d7) IAT 0xb183b0 (v31 BY REFERENCE);
 *   lua_toboolean(L, 2) IAT 0xb183e8 (v22 IAT BY REFERENCE);
 *   FULL-WORD test eax,eax / setne (v22 boolean-normalize BY
 *   REFERENCE); luaL_checkinteger(L, 1) IAT 0xb183f4 (v32 BY
 *   REFERENCE); call [ud](integer, bool); add esp,0x20;
 *   xor eax,eax; ret 0.
 * No lua_type / this-select (v27 law is a different shape).
 * No FULL-WORD null gate (v31 getter is a different shape).
 * No host 0x85c050 (v36 getter is a different shape).
 * Host: IAT surface + the upvalue fn. Next: 0x00897f50.
 * ------------------------------------------------------------------------- */
uint32_t isaac_lua_engine_fourth_int_bool_setter_va(void);
uint32_t isaac_lua_engine_fourth_int_bool_setter_body_bytes(void);
uint32_t isaac_lua_engine_fourth_int_bool_setter_toboolean_index(void);
uint32_t isaac_lua_engine_fourth_int_bool_setter_checkinteger_index(void);
uint32_t isaac_lua_engine_fourth_int_bool_setter_stack_clean(void);
uint32_t isaac_lua_engine_fourth_int_bool_setter_stack_align_mask(void);
uint32_t isaac_lua_engine_fourth_int_bool_setter_skipped_ctor_va(void);
uint32_t isaac_lua_engine_fourth_int_bool_setter_touserdata_index(void);
uint32_t isaac_lua_engine_fourth_int_bool_setter_iat_lua_touserdata(void);
uint32_t isaac_lua_engine_fourth_int_bool_setter_iat_lua_toboolean(void);
uint32_t isaac_lua_engine_fourth_int_bool_setter_iat_checkinteger(void);
int32_t isaac_lua_engine_fourth_int_bool_setter_has_type_gate(void);
int32_t isaac_lua_engine_fourth_int_bool_setter_has_this_select(void);
int32_t isaac_lua_engine_fourth_int_bool_setter_has_null_gate(void);
int32_t isaac_lua_engine_fourth_int_bool_setter_has_push(void);
int32_t isaac_lua_engine_fourth_int_bool_setter_has_checkinteger(void);
int32_t isaac_lua_engine_fourth_int_bool_setter_sibling_count(void);
int32_t isaac_lua_engine_fourth_int_bool_setter_boolean_normalize(uint32_t value);
uint32_t isaac_lua_engine_fourth_int_bool_setter_return_value(void);
uint32_t isaac_lua_engine_fourth_int_bool_setter_next_va(void);

/* ---------------------------------------------------------------------------
 * ABI v38 -- sequential indexed integer getter BODY 0x008984e0 pure islands.
 * PE (section table, raw 0x4978e0, 0x41 bytes to first ret; identify-zhl:
 * no match; skip SEH 0x00897f50; skip wrap/ctor 0x00898140; skip SEH
 * 0x008981b0..0x008983e0; skip unref 0x00898490; do not reopen
 * 0x008977f0 / 0x00897970):
 *   lua_touserdata(L, 0xfff0b9d7) IAT 0xb183b0 (v31 BY REFERENCE);
 *   luaL_checkinteger(L, 1) IAT 0xb183f4 (v32 BY REFERENCE);
 *   call [ud](integer); add esp,0x14; cdq (v14 lua_Integer BY
 *   REFERENCE); lua_pushinteger IAT 0xb183f8 (v22 BY REFERENCE);
 *   add esp,0xc; mov eax,1; ret 1.
 * No lua_type / this-select (v27 law is a different shape).
 * No FULL-WORD null gate (v31 getter is a different shape).
 * No toboolean (v37 setter is a different shape).
 * Host: IAT surface + the upvalue fn. Next: 0x00898530.
 * ------------------------------------------------------------------------- */
uint32_t isaac_lua_engine_fourth_int_getter_va(void);
uint32_t isaac_lua_engine_fourth_int_getter_body_bytes(void);
uint32_t isaac_lua_engine_fourth_int_getter_checkinteger_index(void);
uint32_t isaac_lua_engine_fourth_int_getter_stack_clean(void);
uint32_t isaac_lua_engine_fourth_int_getter_stack_clean_push(void);
uint32_t isaac_lua_engine_fourth_int_getter_stack_align_mask(void);
uint32_t isaac_lua_engine_fourth_int_getter_skipped_seh_va(void);
uint32_t isaac_lua_engine_fourth_int_getter_skipped_ctor_va(void);
uint32_t isaac_lua_engine_fourth_int_getter_touserdata_index(void);
uint32_t isaac_lua_engine_fourth_int_getter_iat_lua_touserdata(void);
uint32_t isaac_lua_engine_fourth_int_getter_iat_checkinteger(void);
uint32_t isaac_lua_engine_fourth_int_getter_iat_pushinteger(void);
int32_t isaac_lua_engine_fourth_int_getter_has_type_gate(void);
int32_t isaac_lua_engine_fourth_int_getter_has_this_select(void);
int32_t isaac_lua_engine_fourth_int_getter_has_null_gate(void);
int32_t isaac_lua_engine_fourth_int_getter_has_push(void);
int32_t isaac_lua_engine_fourth_int_getter_has_checkinteger(void);
int32_t isaac_lua_engine_fourth_int_getter_sibling_count(void);
uint32_t isaac_lua_engine_fourth_int_getter_lua_integer_hi(uint32_t value);
uint32_t isaac_lua_engine_fourth_int_getter_return_value(void);
uint32_t isaac_lua_engine_fourth_int_getter_next_va(void);

/* ---------------------------------------------------------------------------
 * ABI v39 -- fourth-region i32 getter BODY 0x00898f50 pure islands.
 * PE (section table, raw 0x498350, 0x29 bytes through ret; identify-zhl:
 * no match; skip host 0x00898530; skip wrap/ctor 0x00898600; skip SEH
 * 0x008986d0 / 0x00898890; skip wrap 0x00898ae0 / 0x00898c00; skip
 * SEH 0x00898cf0; skip wrap 0x00898d90 / 0x00898e00 / 0x00898e70 /
 * 0x00898ee0; do not reopen 0x008977f0 / 0x00897970 / 0x00898140):
 *   lua_touserdata(L, 0xfff0b9d7) IAT 0xb183b0 (v31 BY REFERENCE);
 *   call [ud](); add esp,8; call 0x0085bff0 (band-C push-i32 BY
 *   REFERENCE, stays host); mov eax,1; ret 1.
 * No lua_type / this-select (v27 law is a different shape).
 * No FULL-WORD null gate (v31 getter is a different shape).
 * No checkinteger / cdq / pushinteger IAT (v38 is a different shape).
 * No host 0x85c050 / fstp (v36 is a different shape).
 * Host: IAT surface + the upvalue fn + 0x85bff0. Next: 0x00898f80.
 * ------------------------------------------------------------------------- */
uint32_t isaac_lua_engine_fourth_i32_getter_va(void);
uint32_t isaac_lua_engine_fourth_i32_getter_body_bytes(void);
uint32_t isaac_lua_engine_fourth_i32_getter_stack_clean(void);
uint32_t isaac_lua_engine_fourth_i32_getter_host_va_push(void);
uint32_t isaac_lua_engine_fourth_i32_getter_skipped_host_va(void);
uint32_t isaac_lua_engine_fourth_i32_getter_skipped_ctor_va(void);
uint32_t isaac_lua_engine_fourth_i32_getter_skipped_seh_va(void);
uint32_t isaac_lua_engine_fourth_i32_getter_skip_count(void);
uint32_t isaac_lua_engine_fourth_i32_getter_census_index(void);
uint32_t isaac_lua_engine_fourth_i32_getter_touserdata_index(void);
uint32_t isaac_lua_engine_fourth_i32_getter_iat_lua_touserdata(void);
int32_t isaac_lua_engine_fourth_i32_getter_has_type_gate(void);
int32_t isaac_lua_engine_fourth_i32_getter_has_this_select(void);
int32_t isaac_lua_engine_fourth_i32_getter_has_null_gate(void);
int32_t isaac_lua_engine_fourth_i32_getter_has_push(void);
int32_t isaac_lua_engine_fourth_i32_getter_has_checkinteger(void);
int32_t isaac_lua_engine_fourth_i32_getter_sibling_count(void);
uint32_t isaac_lua_engine_fourth_i32_getter_return_value(void);
uint32_t isaac_lua_engine_fourth_i32_getter_next_va(void);

/* ---------------------------------------------------------------------------
 * ABI v40 -- fourth-region i32 sign-extend getter BODY 0x008991a0
 * pure islands.
 * PE (section table, raw 0x4985a0, 0x29 bytes through ret; identify-zhl:
 * no match; skip host 0x00898f80; skip wrap/ctor 0x00899030; skip host
 * setter 0x008990d0; skip host 0x00899140; do not reopen 0x00898530 /
 * 0x00898f50 / 0x008977f0 / 0x00897970 / 0x00897f50 / 0x008984e0):
 *   lua_touserdata(L, 0xfff0b9d7) IAT 0xb183b0 (v31 BY REFERENCE);
 *   call [ud](); add esp,8; call 0x0085bfd0 (closure push-i32-sext BY
 *   REFERENCE, stays host); mov eax,1; ret 1.
 * No lua_type / this-select (v27 law is a different shape).
 * No FULL-WORD null gate (v31 getter is a different shape).
 * No checkinteger / pushinteger IAT (v38 is a different shape).
 * No host 0x85bff0 (v39 is a different shape).
 * Host: IAT surface + the upvalue fn + 0x85bfd0. Next: 0x008991d0.
 * ------------------------------------------------------------------------- */
uint32_t isaac_lua_engine_fourth_i32_sext_getter_va(void);
uint32_t isaac_lua_engine_fourth_i32_sext_getter_body_bytes(void);
uint32_t isaac_lua_engine_fourth_i32_sext_getter_stack_clean(void);
uint32_t isaac_lua_engine_fourth_i32_sext_getter_host_va_push(void);
uint32_t isaac_lua_engine_fourth_i32_sext_getter_skipped_host_va(void);
uint32_t isaac_lua_engine_fourth_i32_sext_getter_skipped_wrap_va(void);
uint32_t isaac_lua_engine_fourth_i32_sext_getter_skipped_check_va(void);
uint32_t isaac_lua_engine_fourth_i32_sext_getter_skipped_type_va(void);
uint32_t isaac_lua_engine_fourth_i32_sext_getter_skip_count(void);
uint32_t isaac_lua_engine_fourth_i32_sext_getter_census_index(void);
uint32_t isaac_lua_engine_fourth_i32_sext_getter_touserdata_index(void);
uint32_t isaac_lua_engine_fourth_i32_sext_getter_iat_lua_touserdata(void);
int32_t isaac_lua_engine_fourth_i32_sext_getter_has_type_gate(void);
int32_t isaac_lua_engine_fourth_i32_sext_getter_has_this_select(void);
int32_t isaac_lua_engine_fourth_i32_sext_getter_has_null_gate(void);
int32_t isaac_lua_engine_fourth_i32_sext_getter_has_push(void);
int32_t isaac_lua_engine_fourth_i32_sext_getter_has_checkinteger(void);
int32_t isaac_lua_engine_fourth_i32_sext_getter_sibling_count(void);
uint32_t isaac_lua_engine_fourth_i32_sext_getter_lua_integer_hi(uint32_t value);
uint32_t isaac_lua_engine_fourth_i32_sext_getter_return_value(void);
uint32_t isaac_lua_engine_fourth_i32_sext_getter_next_va(void);

/* ---------------------------------------------------------------------------
 * ABI v41 -- sequential no-arg setter-shaped BODY 0x008991d0
 * pure islands.
 * PE (section table, raw 0x4985d0, 0x1c bytes through ret; identify-zhl:
 * no match; skip_count=0; do not reopen 0x00898f50 / 0x008991a0 /
 * 0x00898530 / 0x00897970 / 0x008977f0 / 0x00898140):
 *   lua_touserdata(L, 0xfff0b9d7) IAT 0xb183b0 (v31 BY REFERENCE);
 *   call [ud](); add esp,8; xor eax,eax; ret 0.
 * No lua_type / this-select (v27 law is a different shape).
 * No FULL-WORD null gate (v31 getter is a different shape).
 * No checkinteger (v32/v38 are different shapes).
 * No host 0x85bfd0 (v40 is a different shape).
 * Host: IAT surface + the upvalue fn 0x009e94e0. Next: 0x008991f0.
 * ------------------------------------------------------------------------- */
uint32_t isaac_lua_engine_fourth_noarg_setter_va(void);
uint32_t isaac_lua_engine_fourth_noarg_setter_body_bytes(void);
uint32_t isaac_lua_engine_fourth_noarg_setter_stack_clean(void);
uint32_t isaac_lua_engine_fourth_noarg_setter_skip_count(void);
uint32_t isaac_lua_engine_fourth_noarg_setter_code_ud_va(void);
uint32_t isaac_lua_engine_fourth_noarg_setter_installer_va(void);
uint32_t isaac_lua_engine_fourth_noarg_setter_touserdata_index(void);
uint32_t isaac_lua_engine_fourth_noarg_setter_iat_lua_touserdata(void);
int32_t isaac_lua_engine_fourth_noarg_setter_has_type_gate(void);
int32_t isaac_lua_engine_fourth_noarg_setter_has_this_select(void);
int32_t isaac_lua_engine_fourth_noarg_setter_has_null_gate(void);
int32_t isaac_lua_engine_fourth_noarg_setter_has_push(void);
int32_t isaac_lua_engine_fourth_noarg_setter_has_checkinteger(void);
int32_t isaac_lua_engine_fourth_noarg_setter_sibling_count(void);
uint32_t isaac_lua_engine_fourth_noarg_setter_return_value(void);
uint32_t isaac_lua_engine_fourth_noarg_setter_next_va(void);


/* ---------------------------------------------------------------------------
 * ABI v4 — RegisterClasses table-install pure immediates
 * PE at Vector/EntityPtr install islands (e.g. VA 0x00866b38 / push-0 sites):
 *   push 4; … lua_newuserdata-sized payload
 *   push 0; … lua_pushcclosure nups (class-ctor path)
 * Full install remains host (names, C closures, metatables).
 * --------------------------------------------------------------------------- */
uint32_t isaac_lua_engine_register_userdata_size(void);
uint32_t isaac_lua_engine_register_closure_nups(void);

/* ---------------------------------------------------------------------------
 * ABI v5 — deeper RegisterClasses table-install pure islands
 * Evidence: method helpers 0x008a06a0…0x0089ff80 (nups=1, stack -1/-3/-5),
 * metamethod setter 0x0085bf90 (push 1; push -2), class create 0x008a7e10
 * (nest +3 / getmetatable gate), transfer 0x0085d910 (leave 3 / settop -4).
 * --------------------------------------------------------------------------- */

/* Relative stack index constants as uint32 (PE imm). */
uint32_t isaac_lua_engine_relative_stack_index_minus_1(void);
uint32_t isaac_lua_engine_relative_stack_index_minus_3(void);
uint32_t isaac_lua_engine_relative_stack_index_minus_4(void);
uint32_t isaac_lua_engine_relative_stack_index_minus_5(void);

/* Method-install pushcclosure nups (1). Class-ctor remains nups=0 via
 * register_closure_nups. */
uint32_t isaac_lua_engine_register_method_closure_nups(void);

/* push 1 paired with -2 in setmetatable / metamethod install sequences. */
uint32_t isaac_lua_engine_register_set_meta_push_n(void);

/* Store C function pointer into userdata after newuserdata (identity). */
uint32_t isaac_lua_engine_register_userdata_fn_store(uint32_t fn_ptr);

/* Class create gate (0x008a7e10 after getmetatable):
 *   test eax,eax; jne already_registered
 * Returns 1 when PE must create the metatable (result null). */
int32_t isaac_lua_engine_register_metatable_create_needed(
    uint32_t getmetatable_result);

/* Stack-ref nest take (0x008a7e10): dest_slots = src_slots + 3 (wrap). */
uint32_t isaac_lua_engine_stack_ref_nest_take_slots(uint32_t src_slots);
/* Source clear store after nest take. */
uint32_t isaac_lua_engine_stack_ref_nest_src_clear(void);

/* Stack-ref return/transfer (0x0085d910): dest_slots = src_slots - 3 (wrap). */
uint32_t isaac_lua_engine_stack_ref_return_dest_slots(uint32_t src_slots);
/* Source leave-slots store after transfer (constant 3). */
uint32_t isaac_lua_engine_stack_ref_return_src_leave(void);

/* settop residual needed when signed gettop >= 3 (PE cmp eax,3; jl skip). */
int32_t isaac_lua_engine_stack_ref_settop_needed(int32_t gettop);
/* settop index push -4. */
uint32_t isaac_lua_engine_stack_ref_settop_index(void);
/* After settop: slots += -3 (32-bit wrap). */
uint32_t isaac_lua_engine_stack_ref_slots_after_settop(uint32_t slots);

/* ---------------------------------------------------------------------------
 * ABI v6 — stack-ref construct (0x0085dab0) + pop (0x0085cce0) pure islands
 * RegisterClasses first host call site 0x00866993 → construct; pure stores
 * bracket IAT lua_getglobal(L, "_G") @ 0x0085dac2. Pop used on class-install
 * cleanup (push slots; call 0x0085cce0).
 * --------------------------------------------------------------------------- */

/* Construct: [this+0] = state (edx); identity store value. */
uint32_t isaac_lua_engine_stack_ref_construct_state_store(uint32_t state);
/* Construct: [this+4] = 0 before IAT. */
uint32_t isaac_lua_engine_stack_ref_construct_slots_init(void);
/* Construct post-IAT: slots + 1 (PE inc dword). */
uint32_t isaac_lua_engine_stack_ref_construct_slots_after_global(uint32_t slots);
/* Construct return: eax = this (identity). */
uint32_t isaac_lua_engine_stack_ref_construct_return_this(uint32_t this_ptr);

/* Pop gate (0x0085cce0): signed slots >= count → host gettop/settop residual.
 * Same predicate reused for gettop >= count after host lua_gettop. */
int32_t isaac_lua_engine_stack_ref_pop_slots_ready(int32_t slots,
                                                  int32_t count);
/* settop index = ~count (PE not eax) — pop `count` stack slots. */
uint32_t isaac_lua_engine_stack_ref_pop_settop_index(uint32_t count);
/* After settop: slots -= count (32-bit wrap). */
uint32_t isaac_lua_engine_stack_ref_pop_slots_after(uint32_t slots,
                                                   uint32_t count);

/* ---------------------------------------------------------------------------
 * ABI v7 — class create 0x008a7e10 pure prologue + EntityPtr create-path imms
 * After construct returns, RegisterClasses calls class create at 0x008669a8.
 * Pure stores bracket first host IAT lua_pushvalue @ 0x008a7e65. Nest take
 * (+3 / src clear) retained from ABI v5; this unit peels state copy, interim
 * slots zero, return this, registry rawseti keys, and install rdata VAs.
 * --------------------------------------------------------------------------- */

/* dest.state = src.state (PE mov eax,[src]; mov [dest],eax) — identity. */
uint32_t isaac_lua_engine_stack_ref_class_create_state_store(uint32_t src_state);
/* dest.slots interim = 0 before nest take (PE mov [dest+4],0). */
uint32_t isaac_lua_engine_stack_ref_class_create_slots_init(void);
/* Function return: eax = this (identity). */
uint32_t isaac_lua_engine_stack_ref_class_create_return_this(uint32_t this_ptr);

/* EntityPtr create-path registry keys for rawseti at stack -1/-2/-3. */
uint32_t isaac_lua_engine_class_create_registry_key_minus_1(void);
uint32_t isaac_lua_engine_class_create_registry_key_minus_2(void);
uint32_t isaac_lua_engine_class_create_registry_key_minus_3(void);

/* Consecutive-key step used by create path:
 *   key(rel) = key_minus_1 + rel + 1  (32-bit wrap; rel is signed stack index)
 * PE uses fixed keys for -1/-2/-3; helper documents the arithmetic relation. */
uint32_t isaac_lua_engine_class_create_registry_key_at_rel(uint32_t key_minus_1,
                                                          int32_t rel_index);

/* EntityPtr install immediates (hash-bound rdata / code VAs). */
uint32_t isaac_lua_engine_class_create_entityptr_name_va(void);
uint32_t isaac_lua_engine_class_create_entityptr_ctor_va(void);
uint32_t isaac_lua_engine_class_create_meta_gc_name_va(void);
uint32_t isaac_lua_engine_class_create_meta_class_name_va(void);
uint32_t isaac_lua_engine_class_create_meta_const_name_va(void);

/* ---------------------------------------------------------------------------
 * ABI v8 — method helper 0x008a06a0 pure imms + residual host-arg pure +
 * Vector class create 0x008a7c00 pure islands
 * --------------------------------------------------------------------------- */

/* EntityPtr::SetReference method-install immediates (0x008a06a0). */
uint32_t isaac_lua_engine_method_setreference_name_va(void);
uint32_t isaac_lua_engine_method_setreference_wrapper_va(void);
uint32_t isaac_lua_engine_method_setreference_real_fn_va(void);
/* Historical v8 name: absindex table index after pushcclosure (−3 as u32). */
uint32_t isaac_lua_engine_method_install_table_pushvalue_index(void);

/* Class create residual first host arg: lua_pushvalue(L, −1) @ 0x008a7e65. */
uint32_t isaac_lua_engine_class_create_first_pushvalue_index(void);
/* Already-registered dual setmetatable stack indices (−3 then −2). */
uint32_t isaac_lua_engine_class_create_already_setmeta_index_a(void);
uint32_t isaac_lua_engine_class_create_already_setmeta_index_b(void);

/* Vector class create 0x008a7c00 name / ctor / registry keys. */
uint32_t isaac_lua_engine_class_create_vector_name_va(void);
uint32_t isaac_lua_engine_class_create_vector_ctor_va(void);
uint32_t isaac_lua_engine_class_create_vector_registry_key_minus_1(void);
uint32_t isaac_lua_engine_class_create_vector_registry_key_minus_2(void);
uint32_t isaac_lua_engine_class_create_vector_registry_key_minus_3(void);

/* ---------------------------------------------------------------------------
 * ABI v9 — method helper IAT-chain pure (absindex / rotate / stack cleanup)
 * --------------------------------------------------------------------------- */

/* lua_absindex(L, −3) pure index imm (same u32 as table_pushvalue_index). */
uint32_t isaac_lua_engine_method_install_absindex_index(void);
/* lua_rotate(L, idx, n) pure imms: idx=−2, n=1. */
uint32_t isaac_lua_engine_method_install_rotate_index(void);
uint32_t isaac_lua_engine_method_install_rotate_n(void);
/* add esp, 0x38 after the six host IAT calls. */
uint32_t isaac_lua_engine_method_install_stack_arg_bytes(void);
/* rawset table index is the absindex return (identity pass-through). */
uint32_t isaac_lua_engine_method_install_rawset_index(uint32_t abs_index);

/* ---------------------------------------------------------------------------
 * ABI v10 — SetReference wrapper 0x008a80d0 pure indices / keys / constants
 * --------------------------------------------------------------------------- */

/* lua_type stack indices for arg1 / arg2. */
uint32_t isaac_lua_engine_setref_wrapper_type_index_1(void);
uint32_t isaac_lua_engine_setref_wrapper_type_index_2(void);
/* Registry keys for check helper on arg1 / arg2 paths. */
uint32_t isaac_lua_engine_setref_wrapper_registry_key_arg1(void);
uint32_t isaac_lua_engine_setref_wrapper_registry_key_arg2(void);
/* lua_touserdata index (lua_upvalueindex(1) as u32). */
uint32_t isaac_lua_engine_setref_wrapper_touserdata_index(void);
/* type result gate: non-zero → take check-helper path (PE test eax,eax; jne). */
int32_t isaac_lua_engine_setref_wrapper_type_nonzero(int32_t lua_type_result);
/* edx stack indices passed to check helper 0x0085c590. */
uint32_t isaac_lua_engine_setref_wrapper_check_stack_index_1(void);
uint32_t isaac_lua_engine_setref_wrapper_check_stack_index_2(void);
/* push-0 flags arg before check helper. */
uint32_t isaac_lua_engine_setref_wrapper_check_flags(void);
/* Field offset of ctx/entity pointer inside check-helper object (+4). */
uint32_t isaac_lua_engine_setref_wrapper_object_field_off(void);
/* Wrapper returns 0 (xor eax,eax) on both paths. */
uint32_t isaac_lua_engine_setref_wrapper_return_ok(void);
/* Pure relation: upvalueindex(n) = LUA_REGISTRYINDEX − n (32-bit wrap). */
uint32_t isaac_lua_engine_lua_upvalueindex(uint32_t n);

/* ---------------------------------------------------------------------------
 * ABI v11 — check/get helper 0x0085c590 pure args / gates
 * --------------------------------------------------------------------------- */

/* lua_rawgetp registry index imm (LUA_REGISTRYINDEX as u32). */
uint32_t isaac_lua_engine_check_get_rawgetp_registry_index(void);
/* ebx / "got" pointer init before first IAT (xor ebx,ebx → 0). */
uint32_t isaac_lua_engine_check_get_got_init(void);
/* After host lua_isuserdata: non-zero → continue match path (test eax,eax; je). */
int32_t isaac_lua_engine_check_get_isuserdata_continue(int32_t isuserdata_result);
/* Identity-key VA for second lua_rawgetp (0xc7f4b8). */
uint32_t isaac_lua_engine_check_get_identity_key_va(void);
/* lua_type index after identity rawgetp (−1). */
uint32_t isaac_lua_engine_check_get_identity_type_index(void);
/* LUA_TBOOLEAN immediate used in cmp eax,1. */
uint32_t isaac_lua_engine_check_get_lua_tboolean(void);
/* type == LUA_TBOOLEAN → our userdata (identity boolean present). */
int32_t isaac_lua_engine_check_get_identity_is_boolean(int32_t lua_type_result);
/* lua_settop pop index after accepting identity (−2). */
uint32_t isaac_lua_engine_check_get_settop_pop_index(void);
/* rdata VAs for residual field / message strings. */
uint32_t isaac_lua_engine_check_get_const_name_va(void);
uint32_t isaac_lua_engine_check_get_cannot_be_const_msg_va(void);
uint32_t isaac_lua_engine_check_get_parent_name_va(void);
uint32_t isaac_lua_engine_check_get_type_name_va(void);
uint32_t isaac_lua_engine_check_get_expected_fmt_va(void);
/* After host lua_type of __const field: type==0 (nil) → object is const. */
int32_t isaac_lua_engine_check_get_is_const_from_type(int32_t lua_type_result);
/* isConst && !canBeConst → host luaL_argerror("cannot be const").
   Both PE operands are byte compares ([ebp-1] / byte [ebp+0xc]); wide
   params, low bytes masked in the body (v19 byte-width sweep). */
int32_t isaac_lua_engine_check_get_needs_const_argerror(
    uint32_t is_const_flag, uint32_t can_be_const_flag);
/* lua_rawequal stack indices (−2, −1). */
uint32_t isaac_lua_engine_check_get_rawequal_index_a(void);
uint32_t isaac_lua_engine_check_get_rawequal_index_b(void);
/* lua_settop index after class match (−3). */
uint32_t isaac_lua_engine_check_get_match_settop_index(void);
/* xor eax,eax after host error path. */
uint32_t isaac_lua_engine_check_get_error_return_null(void);

/* ---------------------------------------------------------------------------
 * ABI v12 — check/get 0x0085c590 remaining pure CF / stack imms
 * --------------------------------------------------------------------------- */

/* After host lua_rawequal: non-zero → class match path (test eax,eax; je parent). */
int32_t isaac_lua_engine_check_get_rawequal_match(int32_t rawequal_result);
/* After host lua_type of __parent: non-zero → parent-present rotate path. */
int32_t isaac_lua_engine_check_get_parent_type_present(int32_t lua_type_result);
/* lua_copy dest/src indices on const-promote path. */
uint32_t isaac_lua_engine_check_get_copy_dest_index(void);
uint32_t isaac_lua_engine_check_get_copy_src_index(void);
/* Parent-walk lua_rotate imms (present idx=−2 / nil idx=−1 / n=−1). */
uint32_t isaac_lua_engine_check_get_parent_rotate_index(void);
uint32_t isaac_lua_engine_check_get_parent_nil_rotate_index(void);
uint32_t isaac_lua_engine_check_get_parent_rotate_n(void);
/* No-parent __type path lua_rotate(L, −3, 1). */
uint32_t isaac_lua_engine_check_get_type_rotate_index(void);
uint32_t isaac_lua_engine_check_get_type_rotate_n(void);
/* lua_tolstring len=NULL + stack indices (got vs mismatch). */
uint32_t isaac_lua_engine_check_get_tolstring_len_null(void);
uint32_t isaac_lua_engine_check_get_tolstring_got_index(void);
uint32_t isaac_lua_engine_check_get_tolstring_mismatch_index(void);
/* got pointer (ebx) null → host lua_typename residual @ 0x0085c792. */
int32_t isaac_lua_engine_check_get_got_needs_typename(uint32_t got_ptr);
/* lua_absindex relative index imm (−1) used across the body. */
uint32_t isaac_lua_engine_check_get_absindex_index(void);
/* Stack-index store into [ebp-8] before first IAT (identity of edx). */
uint32_t isaac_lua_engine_check_get_stack_index_store(uint32_t stack_index);

/* ---------------------------------------------------------------------------
 * ABI v13 — frame residual 0x008607a0 pure CF + materialize 0x00872980 imms
 * Host residual: call FUN_00872980 @ 0x008607fb then IAT luaL_unref @
 * 0x0086080b. Materialize first IAT lua_rawgeti @ 0x0087299c.
 * --------------------------------------------------------------------------- */

/* Hash-bound global: mov ecx, [DAT_00c71690] @ 0x008607cb. */
uint32_t isaac_lua_engine_frame_unref_engine_global_dat(void);
/* test byte ptr [eax], 2 — bit mask (needs_host peels the gate). */
uint32_t isaac_lua_engine_frame_unref_flag_mask(void);
/* mov eax, [ecx+0x10] — registry-holder field off on engine object. */
uint32_t isaac_lua_engine_frame_unref_registry_holder_off(void);
/* mov [ebp-0x24], 1 / [ebp-0x20], −1 — materialize this+4 / this+8. */
uint32_t isaac_lua_engine_frame_unref_materialize_arg1(void);
uint32_t isaac_lua_engine_frame_unref_materialize_arg2(void);
/* push 0xfff0b9d8 before IAT luaL_unref @ 0x00860803. */
uint32_t isaac_lua_engine_frame_unref_registry_index(void);
/* mov [ebp-4], 0 — SEH try level before materialize call. */
uint32_t isaac_lua_engine_frame_unref_try_level(void);

/* Materialize input layout offs (this = lea [ebp-0x28] on frame path). */
uint32_t isaac_lua_engine_materialize_input_holder_off(void);
uint32_t isaac_lua_engine_materialize_input_arg1_off(void);
uint32_t isaac_lua_engine_materialize_input_arg2_off(void);
/* lua_rawgeti(L, REGISTRYINDEX, key) registry imm @ 0x00872996. */
uint32_t isaac_lua_engine_materialize_rawgeti_registry_index(void);
/* lua_pcallk(L, 2, 1, msgh=0, ctx=0, k=0) pure zeros @ 0x008729c0. */
uint32_t isaac_lua_engine_materialize_pcall_msgh(void);
uint32_t isaac_lua_engine_materialize_pcall_ctx(void);
uint32_t isaac_lua_engine_materialize_pcall_k(void);
/* lua_pushvalue(L, −1) before luaL_ref @ 0x008729d8. */
uint32_t isaac_lua_engine_materialize_pushvalue_index(void);
/* luaL_ref(L, REGISTRYINDEX) registry imm @ 0x008729e4. */
uint32_t isaac_lua_engine_materialize_ref_registry_index(void);
/* lua_settop(L, −2) after luaL_ref @ 0x008729f2. */
uint32_t isaac_lua_engine_materialize_settop_index(void);
/* out+0 = L / out+4 = luaL_ref result — pure identity stores. */
uint32_t isaac_lua_engine_materialize_out_state_store(uint32_t state_ptr);
uint32_t isaac_lua_engine_materialize_out_ref_store(uint32_t ref_value);

/* ---------------------------------------------------------------------------
 * ABI v14 — FUN_00872980 residual pure CF around first IAT lua_rawgeti
 * @ 0x0087299c. PE prologue before host:
 *   edi = this
 *   holder = [edi+INPUT_OFF_HOLDER]
 *   L = [holder+HOLDER_OFF_STATE]; key = [holder+HOLDER_OFF_KEY]
 *   cdq; push edx:eax, REGISTRYINDEX, L; call lua_rawgeti   ; HOST
 *   then pushinteger(this+4) / pushinteger(this+8) with same cdq
 * --------------------------------------------------------------------------- */

/* Holder object field offs (Init payload; free size 8). */
uint32_t isaac_lua_engine_materialize_holder_off_state(void);
uint32_t isaac_lua_engine_materialize_holder_off_key(void);
/* Pointer arithmetic: holder + off (32-bit wrap). */
uint32_t isaac_lua_engine_materialize_holder_state_addr(uint32_t holder);
uint32_t isaac_lua_engine_materialize_holder_key_addr(uint32_t holder);
/* PE cdq before rawgeti key / pushinteger args — lua_Integer lo/hi. */
uint32_t isaac_lua_engine_materialize_lua_integer_lo(uint32_t value);
uint32_t isaac_lua_engine_materialize_lua_integer_hi(uint32_t value);
/* Post-IAT stack cleanup sizes (add esp, imm). */
uint32_t isaac_lua_engine_materialize_stack_clean_rawgeti_pushint(void);
uint32_t isaac_lua_engine_materialize_stack_clean_pushint(void);
uint32_t isaac_lua_engine_materialize_stack_clean_pcall(void);
uint32_t isaac_lua_engine_materialize_stack_clean_success(void);
/* Success return: mov eax, esi — out pointer identity. */
uint32_t isaac_lua_engine_materialize_return_out(uint32_t out_ptr);

/* ---------------------------------------------------------------------------
 * ABI v15 — RegisterClasses (0x00866960) structural table-install model
 *
 * Body extent proven by disassembly: entry 0x00866960 … single `ret`
 * 0x0086e4c9 (0x7b6a bytes). Straight-line apart from one predicate
 * (`cmp byte [ebx+0x1c], 0` / `jne` @ 0x0086e461) at the very tail.
 * Prologue: push -1 / push 0x00b04a88 (SEH scope table) / fs:[0] link /
 * sub esp, 0x144 / stack cookie from DAT 0x00bf93b4.
 *
 * The body is a long repetition of two records:
 *
 *   install record (95 sites, 85 method + 10 metamethod)
 *     mov ecx, <receiver>        ; 3 bytes [ebp-disp8] / 2 bytes [esi]
 *     add esp, imm8              ; 3 bytes (cleanup of the previous record)
 *     mov edx, imm32             ; 5
 *     push imm32                 ; 5
 *     call rel32                 ; 5
 *   The three operand-carrying instructions appear in three schedulings
 *   (mov ecx / push / mov edx orderings REP, PRE, EPR) but the encoded
 *   record size is scheduling-invariant.
 *
 *   builder chain entry (413 sites)
 *     push a2; push a1; push a0 ; mov ecx, eax ; call rel32
 *   arg0 (pushed last, first cdecl argument) is a .rdata name VA on all
 *   413 sites; 408 chain the previous entry's eax return as the receiver.
 * --------------------------------------------------------------------------- */

/* PE image geometry (hash-bound section table). Used only to classify an
 * install operand as code vs read-only data — the section split is what
 * proves the metamethod/method operand roles. */
enum {
  ISAAC_LUA_PE_TEXT_LO_VA = 0x00401000u,
  ISAAC_LUA_PE_TEXT_HI_VA = 0x00b17134u,
  ISAAC_LUA_PE_RDATA_LO_VA = 0x00b18000u,
  ISAAC_LUA_PE_RDATA_HI_VA = 0x00bf7948u,
  ISAAC_LUA_PE_OPERAND_SECTION_OTHER = 0,
  ISAAC_LUA_PE_OPERAND_SECTION_TEXT = 1,
  ISAAC_LUA_PE_OPERAND_SECTION_RDATA = 2
};

/* RegisterClasses body extent + frame constants. */
enum {
  ISAAC_LUA_REGISTER_CLASSES_VA = 0x00866960u,
  ISAAC_LUA_REGISTER_CLASSES_RET_VA = 0x0086e4c9u,
  ISAAC_LUA_REGISTER_CLASSES_BODY_BYTES = 0x7b6a,
  ISAAC_LUA_REGISTER_FRAME_LOCALS_BYTES = 0x144,
  ISAAC_LUA_REGISTER_SEH_SCOPE_TABLE_VA = 0x00b04a88u,
  ISAAC_LUA_REGISTER_STACK_COOKIE_DAT = 0x00bf93b4u
};

/* x86 instruction encoding sizes used by the record model. */
enum {
  ISAAC_LUA_REGISTER_PUSH_IMM8_BYTES = 2,   /* 6A ib */
  ISAAC_LUA_REGISTER_PUSH_IMM32_BYTES = 5,  /* 68 id */
  ISAAC_LUA_REGISTER_MOV_EDX_IMM32_BYTES = 5,
  ISAAC_LUA_REGISTER_CALL_REL32_BYTES = 5,
  ISAAC_LUA_REGISTER_ADD_ESP_IMM8_BYTES = 3,
  ISAAC_LUA_REGISTER_MOV_ECX_EAX_BYTES = 2,
  ISAAC_LUA_REGISTER_RECV_LOAD_DISP8_BYTES = 3, /* mov ecx,[ebp-disp8] */
  ISAAC_LUA_REGISTER_RECV_LOAD_BASE_BYTES = 2   /* mov ecx,[esi]       */
};

/* Install-record census (exhaustive scan of the body). */
enum {
  ISAAC_LUA_REGISTER_INSTALL_TRIAD_BYTES = 0x0f,
  ISAAC_LUA_REGISTER_INSTALL_RECORD_BYTES_DISP8 = 0x15,
  ISAAC_LUA_REGISTER_INSTALL_RECORD_BYTES_BASE = 0x14,
  ISAAC_LUA_REGISTER_INSTALL_CLEANUP_BYTES = 0x04,
  ISAAC_LUA_REGISTER_INSTALL_SITE_COUNT = 95,
  ISAAC_LUA_REGISTER_INSTALL_METHOD_COUNT = 85,
  ISAAC_LUA_REGISTER_INSTALL_META_COUNT = 10,
  ISAAC_LUA_REGISTER_INSTALL_HELPER_COUNT = 54,
  ISAAC_LUA_REGISTER_INSTALL_ADJACENT_PAIRS = 82,
  /* Metamethod setter: ecx=L, edx=index, [ebp+8]=name; absindex/pushstring/
     rotate(-2,1)/rawset with add esp, 0x24. Address-stable host call. */
  ISAAC_LUA_REGISTER_INSTALL_META_HELPER_VA = 0x0085bf90u,
  ISAAC_LUA_REGISTER_INSTALL_META_INDEX_U32 = 0xfffffffeu,
  ISAAC_LUA_REGISTER_INSTALL_META_STACK_CLEAN = 0x24
};

/* Builder-chain census. */
enum {
  ISAAC_LUA_REGISTER_BUILDER_CHAIN_COUNT = 413,
  ISAAC_LUA_REGISTER_BUILDER_CHAINED_COUNT = 408,
  ISAAC_LUA_REGISTER_BUILDER_ARG_COUNT = 3
};

/* MSVC EH state slot [ebp-4] census + semantics. */
enum {
  ISAAC_LUA_REGISTER_EH_STATE_ENTRY = 0,
  ISAAC_LUA_REGISTER_EH_STATE_UNWOUND_U32 = 0xffffffffu,
  ISAAC_LUA_REGISTER_EH_STATE_MAX = 0x90,
  ISAAC_LUA_REGISTER_EH_STORE_COUNT = 181,
  ISAAC_LUA_REGISTER_EH_BYTE_STORE_COUNT = 103,
  ISAAC_LUA_REGISTER_EH_DWORD_STORE_COUNT = 78,
  ISAAC_LUA_REGISTER_EH_UNWIND_STORE_COUNT = 36,
  ISAAC_LUA_REGISTER_EH_BYTE_STORE_BYTES = 4,  /* C6 45 FC ib */
  ISAAC_LUA_REGISTER_EH_DWORD_STORE_BYTES = 7  /* C7 45 FC id */
};

/* Scope-exit destructor + class-create prologue census. */
enum {
  ISAAC_LUA_REGISTER_DTOR_HELPER_VA = 0x0085cce0u,
  ISAAC_LUA_REGISTER_DTOR_PAYLOAD_DELTA = 0x04,
  ISAAC_LUA_REGISTER_DTOR_SITE_COUNT = 19,
  ISAAC_LUA_REGISTER_CLASS_CREATE_COUNT = 37,
  ISAAC_LUA_REGISTER_CLASS_STACK_REF_HELPER_VA = 0x0085dab0u
};

/* Representative per-entry constant table: Vector class span
 * 0x00866a42 (stack-ref take) … 0x00866c96 (last property entry). */
enum {
  ISAAC_LUA_REGISTER_VECTOR_INSTALL_COUNT = 23,
  ISAAC_LUA_REGISTER_VECTOR_FIRST_CALL_VA = 0x00866a82u,
  ISAAC_LUA_REGISTER_VECTOR_LAST_CALL_VA = 0x00866c72u,
  ISAAC_LUA_REGISTER_VECTOR_FIELD_COUNT = 2,
  ISAAC_LUA_REGISTER_VECTOR_FIELD_HELPER_VA = 0x00875230u
};

/* `push imm32` (68 id) unless the value is a signed byte, then `push imm8`
 * (6A ib). 0 mismatches over all 3377 immediate pushes in the body. */
uint32_t isaac_lua_engine_register_push_imm_bytes(uint32_t value);
/* Receiver load size: 2 for `mov ecx,[esi]`, 3 for `mov ecx,[ebp-disp8]`. */
uint32_t isaac_lua_engine_register_recv_load_bytes(int32_t base_only);
/* Full install record size — scheduling invariant (21 / 20). */
uint32_t isaac_lua_engine_register_install_record_bytes(int32_t base_only);
/* Next adjacent install call VA (32-bit wrap). Matched 82/82 in the body. */
uint32_t isaac_lua_engine_register_install_next_call_va(uint32_t prev_call_va,
                                                        int32_t base_only);
/* Builder-chain entry size: push a2 + push a1 + push a0 + [mov ecx,eax] +
 * call rel32. Exact on 413/413 chain entries. */
uint32_t isaac_lua_engine_register_builder_entry_bytes(uint32_t arg0,
                                                       uint32_t arg1,
                                                       uint32_t arg2,
                                                       int32_t chained);

/* rel32 direct-call encoding (0 mismatches over all 1824 direct calls). */
uint32_t isaac_lua_engine_register_call_target(uint32_t site_va,
                                               uint32_t rel32);
uint32_t isaac_lua_engine_register_call_rel32(uint32_t site_va,
                                              uint32_t target_va);

/* Operand classification / install role decode. */
int32_t isaac_lua_engine_register_operand_section(uint32_t value);
int32_t isaac_lua_engine_register_install_is_metamethod(uint32_t edx_imm);
uint32_t isaac_lua_engine_register_install_name_va(uint32_t edx_imm,
                                                   uint32_t push_imm);
uint32_t isaac_lua_engine_register_install_target_va(uint32_t edx_imm,
                                                     uint32_t push_imm);
/* 1 when the operand pair matches the section split observed on every site
 * (method: edx .rdata + push .text; metamethod: edx −2 + push .rdata). */
int32_t isaac_lua_engine_register_install_operands_well_formed(
    uint32_t edx_imm, uint32_t push_imm);

/* EH state slot [ebp-4] — x86 partial-store semantics. */
uint32_t isaac_lua_engine_register_eh_state_apply(uint32_t prev_state,
                                                  uint32_t value,
                                                  int32_t byte_form);
int32_t isaac_lua_engine_register_eh_byte_form_safe(uint32_t prev_state);
uint32_t isaac_lua_engine_register_eh_store_bytes(int32_t byte_form);

/* Scope-exit dtor argument address and class-create state load. */
uint32_t isaac_lua_engine_register_dtor_payload_addr(uint32_t local_addr);
uint32_t isaac_lua_engine_register_class_state_addr(uint32_t engine_ptr);

/* Representative Vector class per-entry constant table.
 * VA accessors return 0 out of range; flags return −1 out of range. */
int32_t isaac_lua_engine_register_vector_install_count(void);
uint32_t isaac_lua_engine_register_vector_install_call_va(int32_t index);
uint32_t isaac_lua_engine_register_vector_install_name_va(int32_t index);
uint32_t isaac_lua_engine_register_vector_install_target_va(int32_t index);
uint32_t isaac_lua_engine_register_vector_install_helper_va(int32_t index);
int32_t isaac_lua_engine_register_vector_install_is_metamethod(int32_t index);
int32_t isaac_lua_engine_register_vector_install_adjacent(int32_t index);
int32_t isaac_lua_engine_register_vector_field_count(void);
uint32_t isaac_lua_engine_register_vector_field_name_va(int32_t index);
uint32_t isaac_lua_engine_register_vector_field_arg1(int32_t index);
uint32_t isaac_lua_engine_register_vector_field_arg2(int32_t index);

/* ---------------------------------------------------------------------------
 * ABI v16 — the single RegisterClasses branch, its tail, and the generic
 * per-class constant table.
 *
 * Init (`0x008604c0`, `ret 4`) reaching RegisterClasses:
 *
 *   0x008605b0  cmp byte ptr [ebp + 8], 0     ; ABI v2 init_take_debug_path
 *   0x008605b4  je  0x0086060f
 *   ...  both arms converge on 0x00860647 ...
 *   0x00860647  mov al, byte ptr [ebp + 8]    ; reload the SAME argument
 *   0x0086064a  mov ecx, esi
 *   0x0086064c  mov byte ptr [esi + 0x1c], al ; capture point
 *   0x0086064f  call 0x00866960               ; sole caller
 *
 * RegisterClasses tail:
 *
 *   0x0086e461  cmp byte ptr [ebx + 0x1c], 0
 *   0x0086e465  jne 0x0086e483                ; skip when byte != 0
 * --------------------------------------------------------------------------- */

/* Data-flow pins for the branch input. */
enum {
  ISAAC_LUA_INIT_VA = 0x008604c0u,
  ISAAC_LUA_INIT_DEBUG_ARG_STACK_OFF = 8, /* [ebp + 8] */
  ISAAC_LUA_INIT_DEBUG_ARG_TEST_VA = 0x008605b0u,
  ISAAC_LUA_INIT_DEBUG_ARG_RELOAD_VA = 0x00860647u,
  ISAAC_LUA_INIT_DEBUG_ARG_STORE_VA = 0x0086064cu,
  ISAAC_LUA_REGISTER_CLASSES_CALL_SITE_VA = 0x0086064fu,
  ISAAC_LUA_REGISTER_CLASSES_CALLER_COUNT = 1,
  ISAAC_LUA_REGISTER_CLASSES_DATA_REF_COUNT = 0,
  ISAAC_LUA_INIT_CALLER_COUNT = 3,
  ISAAC_LUA_INIT_CALLER_BOOT_VA = 0x009aa6f7u,
  ISAAC_LUA_INIT_CALLER_RELOAD_A_VA = 0x008f8c28u,
  ISAAC_LUA_INIT_CALLER_RELOAD_B_VA = 0x009b246fu,
  /* Instructions between the capture store and the call (none of them a
     call or a branch target). */
  ISAAC_LUA_INIT_STORE_TO_CALL_INSNS = 1
};

/* The branch itself and the record it guards. */
enum {
  ISAAC_LUA_REGISTER_TAIL_GATE_VA = 0x0086e461u,
  ISAAC_LUA_REGISTER_TAIL_GATE_SKIP_VA = 0x0086e483u,
  ISAAC_LUA_REGISTER_TAIL_START_VA = 0x0086e43fu,
  /* push 0; push cfunc; push L; call pushcclosure; add esp,0xc;
     push name; push L; call setglobal; add esp,8 */
  ISAAC_LUA_REGISTER_GLOBAL_RECORD_BYTES = 28,
  ISAAC_LUA_REGISTER_GLOBAL_RECORD_BYTES_MERGED = 25,
  ISAAC_LUA_REGISTER_GLOBAL_CLOSURE_NUPS = 0,
  ISAAC_LUA_REGISTER_GLOBAL_PUSHCCLOSURE_CLEAN = 0x0c,
  ISAAC_LUA_REGISTER_GLOBAL_SETGLOBAL_CLEAN = 0x08,
  ISAAC_LUA_REGISTER_GLOBAL_MERGED_CLEAN = 0x14,
  ISAAC_LUA_REGISTER_GLOBAL_COUNT = 4,
  ISAAC_LUA_REGISTER_GLOBAL_GATED_INDEX = 1,
  /* Host IAT used by the tail (address-stable). */
  ISAAC_LUA_REGISTER_PUSHCCLOSURE_IAT_VA = 0x00b183fcu,
  ISAAC_LUA_REGISTER_SETGLOBAL_IAT_VA = 0x00b18340u
};

/* Closure-install prelude — the one shape that interrupted the v15 install
 * record run. 2 instances; both `28 + 2 x push-L bytes`. */
enum {
  ISAAC_LUA_REGISTER_CLOSURE_PRELUDE_FIXED_BYTES = 28,
  ISAAC_LUA_REGISTER_CLOSURE_PRELUDE_COUNT = 2,
  ISAAC_LUA_REGISTER_CLOSURE_PRELUDE_BYTES_DISP8 = 34,
  ISAAC_LUA_REGISTER_CLOSURE_PRELUDE_BYTES_BASE = 32,
  ISAAC_LUA_REGISTER_CLOSURE_PRELUDE_A_VA = 0x00866b2fu,
  ISAAC_LUA_REGISTER_CLOSURE_PRELUDE_B_VA = 0x00867169u,
  /* Install-run adjacency census over the whole body. */
  ISAAC_LUA_REGISTER_INSTALL_GAP_COUNT = 12,
  ISAAC_LUA_REGISTER_INSTALL_PRELUDE_GAPS = 2,
  ISAAC_LUA_REGISTER_INSTALL_OTHER_GAPS = 10
};

/* Named class registrations recovered from the body. */
enum {
  ISAAC_LUA_REGISTER_CLASS_TABLE_COUNT = 8,
  ISAAC_LUA_REGISTER_CLASS_ENTITYPTR = 0,
  ISAAC_LUA_REGISTER_CLASS_VECTOR = 1,
  ISAAC_LUA_REGISTER_CLASS_KCOLOR = 2
};

/* Capture: the byte the PE writes at 0x0086064c is the low byte of the Init
 * stack argument (`mov al, byte ptr [ebp+8]`). */
uint32_t isaac_lua_engine_register_debug_byte_at_entry(uint32_t init_debug_arg);
/* The reload callers re-read that byte with `movzx eax, byte [esi+0x1c]`
 * and push it back into the same parameter — zero-extended round trip. */
uint32_t isaac_lua_engine_init_reload_debug_arg(uint32_t stored_byte);
/* `cmp byte [ebx+0x1c],0 / jne` — 1 when the guarded record executes. */
int32_t isaac_lua_engine_register_require_install_gate(uint32_t debug_byte);
/* Machine cross-check: the gate is the complement of the Init predicate. */
int32_t isaac_lua_engine_register_gate_complements_init(uint32_t debug_byte);

/* Tail global-install record. */
uint32_t isaac_lua_engine_register_global_record_bytes(int32_t merged_cleanup);
int32_t isaac_lua_engine_register_global_count(void);
uint32_t isaac_lua_engine_register_global_pushcclosure_va(int32_t index);
uint32_t isaac_lua_engine_register_global_cfunc_va(int32_t index);
uint32_t isaac_lua_engine_register_global_name_va(int32_t index);
int32_t isaac_lua_engine_register_global_gated(int32_t index);
/* Whether entry `index` runs for a given captured debug byte. */
int32_t isaac_lua_engine_register_global_installed(int32_t index,
                                                   uint32_t debug_byte);
/* Number of tail globals installed for a given captured debug byte. */
int32_t isaac_lua_engine_register_global_installed_count(uint32_t debug_byte);

/* Closure-install prelude size, and the resulting next install call VA. */
uint32_t isaac_lua_engine_register_closure_prelude_bytes(int32_t base_only);
uint32_t isaac_lua_engine_register_install_next_call_va_after_prelude(
    uint32_t prev_call_va, int32_t prelude_base_only, int32_t recv_base_only);

/* Generic per-class constant table. VA accessors return 0 out of range;
 * count accessors return −1; flags return −1. */
int32_t isaac_lua_engine_register_class_count(void);
uint32_t isaac_lua_engine_register_class_name_va(int32_t cls);
uint32_t isaac_lua_engine_register_class_create_helper_va(int32_t cls);
uint32_t isaac_lua_engine_register_class_create_call_va(int32_t cls);
/* 1 when this class's install/property run is recovered in this ABI. */
int32_t isaac_lua_engine_register_class_populated(int32_t cls);
int32_t isaac_lua_engine_register_class_install_count(int32_t cls);
uint32_t isaac_lua_engine_register_class_install_call_va(int32_t cls,
                                                         int32_t index);
uint32_t isaac_lua_engine_register_class_install_name_va(int32_t cls,
                                                         int32_t index);
uint32_t isaac_lua_engine_register_class_install_target_va(int32_t cls,
                                                           int32_t index);
uint32_t isaac_lua_engine_register_class_install_helper_va(int32_t cls,
                                                           int32_t index);
int32_t isaac_lua_engine_register_class_install_is_metamethod(int32_t cls,
                                                              int32_t index);
int32_t isaac_lua_engine_register_class_install_adjacent(int32_t cls,
                                                         int32_t index);
int32_t isaac_lua_engine_register_class_field_count(int32_t cls);
uint32_t isaac_lua_engine_register_class_field_helper_va(int32_t cls);
uint32_t isaac_lua_engine_register_class_field_name_va(int32_t cls,
                                                       int32_t index);
uint32_t isaac_lua_engine_register_class_field_arg1(int32_t cls, int32_t index);
uint32_t isaac_lua_engine_register_class_field_arg2(int32_t cls, int32_t index);

/* ---------------------------------------------------------------------------
 * ABI v17 — the class-create helper family is one template instantiation.
 *
 * All 8 helpers: 528 bytes, 179 instructions, 503/528 bytes identical.
 * Shared body (identical in every instance):
 *
 *   out->state  = src->state                  ; out+0
 *   out->slots  = 0
 *   out->slots  = src->slots + 3              ; NEST_DELTA, ABI v5/v7
 *   src->slots  = 0
 *   absindex(L,-1) / pushstring(name) / rawget / lua_type(L,-1)
 *   if type != 0  -> already-registered arm (__class / __const rawget,
 *                    rotate(-3,1), rotate(-2,1))
 *   else          -> create arm: 3x [ helper(name) ;
 *                    pushcclosure(L, gc_closure, 0) ; absindex(-2) ;
 *                    pushstring("__gc") ; rotate(-2,1) ; rawset ]
 *                    then pushvalue(-1)/lua_rawsetp(key-1),
 *                         pushvalue(-2)/lua_rawsetp(key-2),
 *                         pushvalue(-3)/lua_rawsetp(key-3)
 *   return this ; ret 8
 *
 * Per-instance immediates, by registration index r (0 = EntityPtr):
 *   class name VA      : data (3 push sites, same value)
 *   __gc closure VA    : 0x008c32b0 - 0x20  * r   (2 push sites)
 *   registry key(-3)   : 0x00c8297c + 3     * r   (-2 = +1, -1 = +2)
 * --------------------------------------------------------------------------- */

enum {
  ISAAC_LUA_CLASS_CREATE_TEMPLATE_COUNT = 8,
  ISAAC_LUA_CLASS_CREATE_TEMPLATE_BYTES = 0x210,
  ISAAC_LUA_CLASS_CREATE_TEMPLATE_INSNS = 179,
  ISAAC_LUA_CLASS_CREATE_TEMPLATE_VARIANT_BYTES = 25,
  ISAAC_LUA_CLASS_CREATE_TEMPLATE_VARIANT_RUNS = 12,
  /* r = 0 is EntityPtr, the first class registered. */
  ISAAC_LUA_CLASS_CREATE_HELPER_BASE_VA = 0x008a7e10u,
  ISAAC_LUA_CLASS_CREATE_HELPER_STRIDE = 0x210,
  ISAAC_LUA_CLASS_CREATE_GC_CLOSURE_BASE_VA = 0x008c32b0u,
  ISAAC_LUA_CLASS_CREATE_GC_CLOSURE_STRIDE = 0x20,
  ISAAC_LUA_CLASS_CREATE_REGISTRY_KEY_BASE = 0x00c8297cu, /* r=0, rel -3 */
  ISAAC_LUA_CLASS_CREATE_REGISTRY_KEY_STRIDE = 3,
  /* Shared direct calls inside the template (address-stable hosts). */
  ISAAC_LUA_CLASS_CREATE_SHARED_CALL_A_VA = 0x0085d040u,
  ISAAC_LUA_CLASS_CREATE_SHARED_CALL_B_VA = 0x0085d2c0u,
  ISAAC_LUA_CLASS_CREATE_SHARED_CALL_C_VA = 0x0085d500u,
  ISAAC_LUA_CLASS_CREATE_SEH_SCOPE_TABLE_VA = 0x00b0533du,
  /* pushcclosure(L, gc_closure, 0) — no upvalues on this path. */
  ISAAC_LUA_CLASS_CREATE_GC_CLOSURE_NUPS = 0,
  ISAAC_LUA_CLASS_CREATE_GC_INSTALL_COUNT = 2,
  /* IAT the template uses (all host). */
  ISAAC_LUA_IAT_LUA_TYPE_VA = 0x00b18400u,
  ISAAC_LUA_IAT_LUA_SETTOP_VA = 0x00b18328u,
  ISAAC_LUA_IAT_LUA_RAWSETP_VA = 0x00b1838cu,
  ISAAC_LUA_IAT_LUA_RAWGET_VA = 0x00b18410u,
  ISAAC_LUA_IAT_LUA_PUSHVALUE_VA = 0x00b183c8u
};

/* ABI v42 — class-create template BODY control flow (one template, 8 sites).
 *
 * The v17/v18 units recovered the per-index ARITHMETIC (helper / __gc
 * closure / registry keys) and the three shared metatable-builder calls;
 * the template BODY control flow was still host. This block pins the body
 * CF from the PE instruction stream of all 8 instances (identical 0x210-byte
 * spans; 25 variant bytes are exactly the v17 immediates):
 *
 *   prologue: dest->state = src->state ; dest->slots = 0
 *             dest->slots = src->slots + 3 (32-bit wrap)
 *             src->slots = 0                       (v5 nest law by reference)
 *   gate:     absindex(L,-1) ; pushstring(L,name) ; rawget ;
 *             lua_type(L,-1) ; test eax,eax / jne ALREADY   (FULL-WORD)
 *   CREATE arm (type == 0):
 *       lua_settop(L, -2) ONCE (pops the rawget result)
 *       iteration 1: builder A(name) ; pushcclosure(L, gc, 0) ;
 *                    absindex(-2) ; pushstring("__gc") ; rotate(-2,1) ;
 *                    rawset
 *       iteration 2: builder B(name) ; same __gc record
 *       iteration 3: builder C(name) ;
 *                    pushvalue(-1)/rawsetp(REGISTRYINDEX, key-1)
 *                    pushvalue(-2)/rawsetp(REGISTRYINDEX, key-2)
 *                    pushvalue(-3)/rawsetp(REGISTRYINDEX, key-3)
 *   ALREADY arm (type != 0):
 *       absindex(-1) ; pushstring("__class") ; rawget
 *       absindex(-1) ; pushstring("__const") ; rawget
 *       rotate(-3, 1) ; rotate(-2, 1)
 *   epilogue: return this ; ret 8
 *
 * Per-instance data (verified from the raw bytes of all 8 instances):
 *   name VA: EntityPtr 0xb701e4 / Vector 0xb701dc / KColor 0xb702e8 /
 *            FontRenderSettings 0xb702c4 / Font 0xb70424 / Color 0xb6508c /
 *            Sprite 0xb704ac / EntityRef 0xb70704  (matches kClasses[]).
 * All 8 instances share the builder trio 0x85d040/0x85d2c0/0x85d500 and
 * the full 10-slot lua_* IAT sequence (v17 census).
 * ---------------------------------------------------------------------- */
enum {
  ISAAC_LUA_CLASS_CREATE_BODY_BYTES = 0x207, /* first ret 0x8a8017 - 0x8a7e10 */
  ISAAC_LUA_CLASS_CREATE_FIRST_RET_VA = 0x008a8017u,
  ISAAC_LUA_CLASS_CREATE_ARM_CREATE = 0,
  ISAAC_LUA_CLASS_CREATE_ARM_ALREADY = 1,
  ISAAC_LUA_CLASS_CREATE_CREATE_ITERATIONS = 3,
  /* lua_settop(L, -2) pops the rawget result once, before iteration 1. */
  ISAAC_LUA_CLASS_CREATE_CREATE_ENTRY_SETTOP_INDEX_U32 = 0xfffffffeu,
  /* Iterations 1..2 carry the __gc closure record; iteration 3 carries the
     registry key stores (pushvalue/rawsetp). */
  ISAAC_LUA_CLASS_CREATE_GC_RECORD_ITERATIONS = 2,
  ISAAC_LUA_CLASS_CREATE_ITERATION_ABSINDEX_INDEX_U32 = 0xfffffffeu,
  ISAAC_LUA_CLASS_CREATE_ITERATION_ROTATE_INDEX_U32 = 0xfffffffeu,
  ISAAC_LUA_CLASS_CREATE_ITERATION_ROTATE_N = 1,
  ISAAC_LUA_CLASS_CREATE_ALREADY_ABSINDEX_INDEX_U32 = 0xffffffffu,
  ISAAC_LUA_CLASS_CREATE_ALREADY_ROTATE_INDEX_A_U32 = 0xfffffffdu, /* -3 */
  ISAAC_LUA_CLASS_CREATE_ALREADY_ROTATE_INDEX_B_U32 = 0xfffffffeu, /* -2 */
  ISAAC_LUA_CLASS_CREATE_ALREADY_ROTATE_N = 1,
  ISAAC_LUA_CLASS_CREATE_RET_ARGS = 8,
  /* pushcclosure is the one template IAT slot not yet pinned; the other
     nine (type/settop/rawsetp/rawget/pushvalue/absindex/pushstring/
     rotate/rawset) are pinned by the v16/v17/v19 slot blocks. */
  ISAAC_LUA_IAT_LUA_PUSHCClOSURE_VA = 0x00b183fcu
};

/* Class-span classification (why a per-class run is or is not recovered). */
enum {
  ISAAC_LUA_CLASS_SPAN_OK = 0,
  /* v19 recharacterization: structural code — the span contains [esi]-form
     receivers. No longer a blocker; see span_resolution. */
  ISAAC_LUA_CLASS_SPAN_MIXED_RECEIVER = 1,
  ISAAC_LUA_CLASS_SPAN_NO_SUCCESSOR = 2,    /* no next create to bound it */
  ISAAC_LUA_CLASS_RECEIVER_CLEAN_COUNT = 6,
  /* v19: Color + Sprite populated via the property-builder return contract. */
  ISAAC_LUA_CLASS_POPULATED_COUNT = 7,
  ISAAC_LUA_CLASS_ENTITYPTR_INSTALLS = 2,
  ISAAC_LUA_CLASS_VECTOR_INSTALLS = 23,
  ISAAC_LUA_CLASS_KCOLOR_INSTALLS = 1,
  ISAAC_LUA_CLASS_FONTRENDERSETTINGS = 3,
  ISAAC_LUA_CLASS_FONTRENDERSETTINGS_INSTALLS = 13,
  ISAAC_LUA_CLASS_FONT = 4,
  ISAAC_LUA_CLASS_FONT_INSTALLS = 10,
  ISAAC_LUA_CLASS_COLOR = 5,
  ISAAC_LUA_CLASS_SPRITE = 6,
  ISAAC_LUA_CLASS_ENTITYREF = 7
};

/* Template arithmetic. Out-of-range index (not 0..7) returns 0 / −1. */
uint32_t isaac_lua_engine_class_create_helper_va_for_index(int32_t index);
uint32_t isaac_lua_engine_class_create_gc_closure_va_for_index(int32_t index);
/* rel must be −1, −2 or −3 (the pushvalue index the key pairs with). */
uint32_t isaac_lua_engine_class_create_registry_key_for_index(int32_t index,
                                                              int32_t rel);
/* Inverse of the helper-VA law: exact multiple of the stride inside the
 * family window, else −1. */
int32_t isaac_lua_engine_class_create_index_for_helper_va(uint32_t helper_va);
/* Inverse of the __gc closure law. */
int32_t isaac_lua_engine_class_create_index_for_gc_closure_va(uint32_t va);

/* Per-class create data driven by the laws above. */
uint32_t isaac_lua_engine_register_class_gc_closure_va(int32_t cls);
uint32_t isaac_lua_engine_register_class_registry_key(int32_t cls, int32_t rel);
/* Why a class is or is not populated (ISAAC_LUA_CLASS_SPAN_*). */
int32_t isaac_lua_engine_register_class_span_status(int32_t cls);
int32_t isaac_lua_engine_register_class_receiver_clean(int32_t cls);

/* ABI v42 — class-create template BODY control flow (one template, 8 sites).
 * Body geometry. */
uint32_t isaac_lua_engine_class_create_body_bytes(void);
uint32_t isaac_lua_engine_class_create_first_ret_va(void);
uint32_t isaac_lua_engine_class_create_ret_args(void);
/* Per-class name VA (data table, matches kClasses[] / register_class_name_va). */
uint32_t isaac_lua_engine_class_create_name_va_for_index(int32_t index);
/* FULL-WORD arm gate: PE `test eax,eax / jne ALREADY` on lua_type(L,-1).
 * type == 0 -> CREATE, any non-zero -> ALREADY. No byte masking. */
int32_t isaac_lua_engine_class_create_arm_select(uint32_t type);
/* CREATE arm geometry. */
int32_t isaac_lua_engine_class_create_create_iterations(void);
uint32_t isaac_lua_engine_class_create_create_entry_settop_index(void);
/* Iteration 1..3: the shared metatable builder called with this + name. */
uint32_t isaac_lua_engine_class_create_iteration_builder_va(int32_t iteration);
/* Iterations 1..2 carry the __gc closure record; iteration 3 the keys. */
int32_t isaac_lua_engine_class_create_iteration_has_gc_record(int32_t iteration);
uint32_t isaac_lua_engine_class_create_iteration_gc_closure_va(int32_t iteration,
                                                               int32_t index);
uint32_t isaac_lua_engine_class_create_iteration_absindex_index(void);
uint32_t isaac_lua_engine_class_create_iteration_rotate_index(void);
int32_t isaac_lua_engine_class_create_iteration_rotate_n(void);
/* Key-store phase: pushvalue(-k) pairs with registry key rel -k, k=1..3. */
int32_t isaac_lua_engine_class_create_iteration_store_rel(int32_t iteration);
uint32_t isaac_lua_engine_class_create_iteration_pushvalue_index(
    int32_t iteration);
uint32_t isaac_lua_engine_class_create_iteration_registry_key(int32_t iteration,
                                                              int32_t index);
/* ALREADY arm geometry: __class/__const rawgets + rotate pair. */
uint32_t isaac_lua_engine_class_create_already_absindex_index(void);
uint32_t isaac_lua_engine_class_create_already_class_key_va(void);
uint32_t isaac_lua_engine_class_create_already_const_key_va(void);
uint32_t isaac_lua_engine_class_create_already_rotate_index_a(void);
uint32_t isaac_lua_engine_class_create_already_rotate_index_b(void);
int32_t isaac_lua_engine_class_create_already_rotate_n(void);

/* ---------------------------------------------------------------------------
 * ABI v43 — std::vector<T>::at family (3 compiled sites, one template).
 *
 * Three sequential bodies in the same band as the class-create template:
 *   0x008a8020 (16-byte elements), 0x008a8050 (8-byte), 0x008a8080 (4-byte).
 * Each is the MSVC bounds-checked vector at() (all three are the CODE_PTR
 * immediates written into the band-C secondary getter userdata, 10 rows):
 *
 *   mov eax,[ecx+4] ; mov edx,[ecx] ; sub eax,edx     byte_count = end-begin
 *   mov ecx,[ebp+8]                                    index (one stack arg)
 *   sar eax, log2(stride)                              size (SIGNED shift)
 *   cmp eax,ecx ; jbe OOB                              UNSIGNED compare
 *   lea eax,[edx+ecx*stride]                           begin + index*stride
 *   pop ebp ; ret 4                                    (c2 04 00)
 *   OOB: call 0x008ba150                               noreturn throw
 *
 * The OOB fatal (0x008ba150) pushes 0xb75380 ("invalid vector subscript")
 * and calls IAT 0xb18468 = MSVCP140 std::_Xout_of_range, the std::out_of_range
 * throw (identified via lua-v16/iat.txt). Stays host: imported CRT noreturn.
 * Site 0's body carries one extra `add ecx,ecx` (stride 16 as lea x8) so its
 * first ret sits 0x2e after site 0 (0x1a body) vs 0x18/0x18 for sites 1..2.
 * ------------------------------------------------------------------------- */

enum {
  ISAAC_LUA_AT_TEMPLATE_COUNT = 3,
  ISAAC_LUA_AT_TEMPLATE_BASE_VA = 0x008a8020u, /* site 0 = 16-byte elements */
  ISAAC_LUA_AT_TEMPLATE_STRIDE_VA = 0x30,  /* 0x8a8020 -> 0x8a8050 -> 0x8a8080 */
  ISAAC_LUA_AT_STRIDE_BASE = 16,           /* stride(site) = 16 >> site */
  ISAAC_LUA_AT_SHIFT_BASE = 4,             /* shift(site) = 4 - site = log2 */
  ISAAC_LUA_AT_FIRST_RET_0_VA = 0x008a803au,
  ISAAC_LUA_AT_FIRST_RET_1_VA = 0x008a8068u,
  ISAAC_LUA_AT_FIRST_RET_2_VA = 0x008a8098u,
  ISAAC_LUA_AT_RET_ARGS = 4,               /* c2 04 00: this + 1 stack arg */
  ISAAC_LUA_AT_FATAL_VA = 0x008ba150u,     /* _Xout_of_range stub */
  ISAAC_LUA_AT_FATAL_STRING_VA = 0x00b75380u, /* "invalid vector subscript" */
  ISAAC_LUA_AT_FATAL_IAT_VA = 0x00b18468u, /* MSVCP140 _Xout_of_range */
  ISAAC_LUA_AT_OOB_NORETURN = 1            /* call + int3: throw, no return */
};

/* ABI v43 — std::vector<T>::at family laws (one template, 3 sites). */
int32_t isaac_lua_engine_at_count(void);
uint32_t isaac_lua_engine_at_va_for_index(int32_t index);
int32_t isaac_lua_engine_at_stride_for_index(int32_t index);
int32_t isaac_lua_engine_at_shift_for_index(int32_t index);
uint32_t isaac_lua_engine_at_first_ret_va_for_index(int32_t index);
uint32_t isaac_lua_engine_at_body_bytes_for_index(int32_t index);
/* Inverse of the site-VA law: exact multiple of the 0x30 stride inside the
 * family window, else -1. */
int32_t isaac_lua_engine_at_index_for_va(uint32_t va);
int32_t isaac_lua_engine_at_ret_args(void);
uint32_t isaac_lua_engine_at_fatal_va(void);
uint32_t isaac_lua_engine_at_fatal_string_va(void);
uint32_t isaac_lua_engine_at_fatal_iat_va(void);
int32_t isaac_lua_engine_at_oob_noreturn(void);
/* size = SAR(byte_count, shift(site)) — SIGNED shift, full word. OOR site
 * returns 0. */
uint32_t isaac_lua_engine_at_size(uint32_t byte_count, int32_t site);
/* PE `cmp eax,ecx / jbe OOB`: OOB iff (uint32)size <= (uint32)index, so
 * in-bounds iff size > index (UNSIGNED, full word). Returns 1 in-bounds /
 * 0 OOB / -1 bad site. */
int32_t isaac_lua_engine_at_gate(uint32_t end, uint32_t begin, uint32_t index,
                                 int32_t site);
/* In-bounds result: begin + index*stride with 32-bit wrap (the lea law). */
uint32_t isaac_lua_engine_at_compute(uint32_t begin, uint32_t index,
                                     int32_t site);

/* ---------------------------------------------------------------------------
 * ABI v44 — LuaRef-holder destructor 0x008a80b0.
 *
 * The sequential body after the v43 at() family (16 int3 pad bytes at
 * 0x008a80a0..0x008a80af, then this body). NOTE: the v46 handoff named
 * 0x008a80c0 ("mov ecx,0x36fffff0; call [0xb1831c]") — that VA is a
 * misaligned decode 0x10 bytes into this body: byte 0x8a80be starts
 * `push 0xfff0b9d8` (68 d8 b9 f0 ff) and 0x8a80c0 lands inside that
 * immediate. True machine CF (cpu-dump/008a80b0.txt, 0x20 bytes, 11 insns):
 *
 *   0x008a80b0: push esi
 *   0x008a80b1: mov esi, ecx                 ; this
 *   0x008a80b3: lea ecx, [esi+8]             ; &this->str
 *   0x008a80b6: call 0x0040d040              ; MSVC basic_string::_Tidy
 *   0x008a80bb: push dword ptr [esi+4]       ; ref      (FULL WORD)
 *   0x008a80be: push 0xfff0b9d8              ; LUA_REGISTRYINDEX
 *   0x008a80c3: push dword ptr [esi]         ; L state  (FULL WORD)
 *   0x008a80c5: call dword ptr [0xb1831c]    ; luaL_unref (host IAT)
 *   0x008a80cb: add esp, 0xc                 ; cdecl cleanup, 3 args
 *   0x008a80ce: pop esi
 *   0x008a80cf: ret                          ; ret 0 (no stack args)
 *
 * Layout: +0 lua_State* L, +4 int ref (registry ref to unref), +8 MSVC
 * basic_string (a name). Reachability (whole-image scan): 4 inbound edges,
 * all COMDAT scope-dtor tail thunks `lea ecx,[ebp-disp]; jmp 0x8a80b0` at
 * 0x00b0507b (disp 0x34) / 0x00b0508e (0x84) / 0x00b050eb (0x38) /
 * 0x00b050fe (0x90) — the body is a SHARED destructor tail of 4 frames.
 *   Host: IAT 0xb1831c = Lua5.3.3r.dll!luaL_unref (lua-v16/iat.txt).
 *   0x40d040 is the MSVC basic_string SSO reset whose pure gates are
 *   already law'd at ABI v3 (msvc_string_sso_local / free_bytes /
 *   aligned_free / aligned_header_ok); pinned here as call target + the
 *   ordering law (Tidy BEFORE luaL_unref).
 * ------------------------------------------------------------------------- */

enum {
  ISAAC_LUA_REF_DTOR_VA = 0x008a80b0u,   /* body start (post-at-family) */
  ISAAC_LUA_REF_DTOR_RET_VA = 0x008a80cfu, /* first ret */
  ISAAC_LUA_REF_DTOR_BODY_BYTES = 0x1f,  /* first ret - body VA (ret instruction excluded, 0x1f; 0x20 including the ret) */
  ISAAC_LUA_REF_DTOR_INSN_COUNT = 11,
  ISAAC_LUA_REF_OFF_STATE = 0x00,        /* this+0: lua_State* L */
  ISAAC_LUA_REF_OFF_REF = 0x04,          /* this+4: registry ref */
  ISAAC_LUA_REF_OFF_STRING = 0x08,       /* this+8: MSVC basic_string */
  ISAAC_LUA_REF_DTOR_STRING_TIDY_VA = 0x0040d040u, /* sub-object reset */
  ISAAC_LUA_REF_DTOR_UNREF_IAT_VA = 0x00b1831cu,   /* luaL_unref */
  ISAAC_LUA_REF_DTOR_UNREF_REGISTRY_INDEX_U32 = 0xfff0b9d8u, /* LUA_REGISTRYINDEX */
  ISAAC_LUA_REF_DTOR_STACK_CLEANUP = 0x0c, /* add esp,0xc after luaL_unref */
  ISAAC_LUA_REF_DTOR_RET_ARGS = 0,       /* c3: no stack args to pop */
  ISAAC_LUA_REF_DTOR_THUNK_COUNT = 4,    /* COMDAT scope-dtor tail thunks */
  ISAAC_LUA_REF_DTOR_THUNK_0_VA = 0x00b0507bu, /* lea ecx,[ebp-0x34] */
  ISAAC_LUA_REF_DTOR_THUNK_1_VA = 0x00b0508eu, /* lea ecx,[ebp-0x84] */
  ISAAC_LUA_REF_DTOR_THUNK_2_VA = 0x00b050ebu, /* lea ecx,[ebp-0x38] */
  ISAAC_LUA_REF_DTOR_THUNK_3_VA = 0x00b050feu, /* lea ecx,[ebp-0x90] */
  ISAAC_LUA_REF_DTOR_THUNK_0_LOCAL_DISP = 0x34,
  ISAAC_LUA_REF_DTOR_THUNK_1_LOCAL_DISP = 0x84,
  ISAAC_LUA_REF_DTOR_THUNK_2_LOCAL_DISP = 0x38,
  ISAAC_LUA_REF_DTOR_THUNK_3_LOCAL_DISP = 0x90
};

/* ABI v44 — LuaRef-holder destructor laws. */
uint32_t isaac_lua_engine_lua_ref_dtor_va(void);
uint32_t isaac_lua_engine_lua_ref_dtor_ret_va(void);
uint32_t isaac_lua_engine_lua_ref_dtor_body_bytes(void);
int32_t isaac_lua_engine_lua_ref_dtor_insn_count(void);
uint32_t isaac_lua_engine_lua_ref_state_off(void);
uint32_t isaac_lua_engine_lua_ref_ref_off(void);
uint32_t isaac_lua_engine_lua_ref_string_off(void);
uint32_t isaac_lua_engine_lua_ref_dtor_string_tidy_va(void);
uint32_t isaac_lua_engine_lua_ref_dtor_unref_iat_va(void);
uint32_t isaac_lua_engine_lua_ref_dtor_unref_registry_index(void);
uint32_t isaac_lua_engine_lua_ref_dtor_stack_cleanup(void);
uint32_t isaac_lua_engine_lua_ref_dtor_ret_args(void);
/* Number of COMDAT scope-dtor tail thunks that jump into the body. */
int32_t isaac_lua_engine_lua_ref_dtor_reach_thunk_count(void);
/* Thunk site VA for index 0..3 (the `jmp 0x8a80b0` address); OOR -> 0. */
uint32_t isaac_lua_engine_lua_ref_dtor_reach_thunk_va_for_index(int32_t index);
/* EBP displacement of the destroyed local in the calling frame; OOR -> 0. */
uint32_t isaac_lua_engine_lua_ref_dtor_reach_thunk_local_disp_for_index(
    int32_t index);
/* Dword pushed at push position 0..2 before IAT luaL_unref: 0 = ref
 * (this+4), 1 = LUA_REGISTRYINDEX, 2 = state L (this+0). FULL WORD, never
 * byte-masked (PE `push dword ptr [esi+4]` / `push dword ptr [esi]`).
 * OOR argument -> 0. */
uint32_t isaac_lua_engine_lua_ref_dtor_unref_arg_at(uint32_t argument,
                                                    uint32_t state,
                                                    uint32_t ref);
/* Call ordering law: the basic_string Tidy (0x40d040) at +6 PRECEDES the
 * luaL_unref IAT call at +0x15 (PE call order; a swapped order changes
 * observable destruction order of the two members). */
int32_t isaac_lua_engine_lua_ref_dtor_tidy_before_unref(void);

/* ---------------------------------------------------------------------------
 * ABI v45 — SetReference wrapper successors 0x008a8180 / 0x008a81d0 /
 * 0x008a8270 (the "0x008a80d0+ band" after the landed v10 wrapper).
 *
 * Handoff correction (lua-v48): the v47 handoff named 0x008a82c0 as "the
 * next sequential UNLANDED body (37 insns, first_ret 0x008a8308)". That VA
 * is NOT a body start — it is the TAIL of the real body at 0x008a8270
 * (prologue `push ebp; mov ebp,esp; sub esp,0x14; push esi; push edi`,
 * 64 insns, first_ret 0x008a8308). The span tool split a duplicate at
 * 0x8a82c0 because the v47 unit requested that VA. To the LEFT of 0x8a8270
 * sit TWO MORE unlanded successors: 0x008a8180 (41 insns, ret 0x8a81cf)
 * and 0x008a81d0 (65 insns, ret 0x8a826d). All three are LIVE (whole-image
 * abs scan): installed by the 0x8a0470 / 0x8a0510 / 0x8a05a0 install
 * helpers via lua_pushcclosure (IAT 0xb183fc) with the wrapper VA as a
 * literal push argument at 0x8a0481 / 0x8a0521 / 0x8a05b0.
 *
 * Shared shape (all three, PE Capstone):
 *   L = [ebp+8]
 *   push 1; push L; call [0xb18400]        ; lua_type(L,1) HOST
 *   test eax,eax; je obj_zero              ; FULL-WORD zero test
 *     obj_zero: obj = 0
 *   else: push flags; push 0xc82980; mov edx,1; mov ecx,L
 *     call 0x0085c590                      ; check/get helper (LANDED v11)
 *     add esp,8; obj = [eax+4]             ; object field +4
 *   push 0xfff0b9d7; push L; call [0xb183b0]  ; lua_touserdata(L,
 *     upvalueindex(1)) HOST
 *   fn = ud[0] (off 0); ecx = obj; call fn ; thiscall
 *
 * Wrapper #1 0x8a8180: flags 0, no extra args, ret 0 (xor eax,eax).
 * Wrapper #2 0x8a81d0: flags 1; ud[0](obj, &ret8) with ret slot [ebp-8]
 *   (8 bytes); lua_newuserdata(L, 0x10) @ 0xb1839c; newud[0] = 0xb73574
 *   (rdata class-info record: dword 0x008bae70 + "RoomDescriptor");
 *   newud[4] = &newud[8] (payload self-ptr); lua_rawgetp(L, 0xfff0b9d8,
 *   0xc82980) @ 0xb183bc (metatable key == check key); lua_setmetatable(L,
 *   −2) @ 0xb18398; payload {lo,hi} = ret8 {[ebp-8],[ebp-4]}; ret 1.
 * Wrapper #3 0x8a8270: flags 1; obj1 = [ebp-4]; edx=2; ecx=L; call
 *   0x8baa50 (getArgObject helper, below) -> obj2; vec = {obj2[0],
 *   obj2[4]} (2 floats); fn = ud[0]; ud[0](obj1, &vec) via [ebp-8] slot;
 *   fstp dword ptr [ebp-8] (float32 ret through x87); movss xmm1,[ebp-8];
 *   ecx=L; call 0x85c050 (pushNumber helper, below); ret 1.
 *
 * Helper 0x8baa50 getArgObject(L, idx): ecx=L, edx=idx. lua_type(L,idx)
 *   @ 0xb18400; if 0 -> luaL_error(L, 0xb7539c "nil passed to reference")
 *   @ 0xb18390, ret 0; else push 1; push 0xc82980; edx=idx; call 0x85c590
 *   -> obj=[eax+4]; if obj==0 -> luaL_error again; ret obj.
 * Helper 0x85c050 pushNumber(L, xmm1): cvtss2sd xmm1 -> xmm0; movsd
 *   [esp],xmm0; push ecx; call lua_pushnumber @ 0xb183f0; add esp,0xc;
 *   ret. The float32->float64 widening is exact (cvtss2sd law).
 * ------------------------------------------------------------------------- */

enum {
  ISAAC_LUA_SETREF_SUCCESSOR_COUNT = 3,
  ISAAC_LUA_SETREF_SUCCESSOR_0_VA = 0x008a8180u,
  ISAAC_LUA_SETREF_SUCCESSOR_1_VA = 0x008a81d0u,
  ISAAC_LUA_SETREF_SUCCESSOR_2_VA = 0x008a8270u,
  ISAAC_LUA_SETREF_SUCCESSOR_0_RET_VA = 0x008a81cfu,
  ISAAC_LUA_SETREF_SUCCESSOR_1_RET_VA = 0x008a826du,
  ISAAC_LUA_SETREF_SUCCESSOR_2_RET_VA = 0x008a8308u,
  ISAAC_LUA_SETREF_SUCCESSOR_0_INSN_COUNT = 41,
  ISAAC_LUA_SETREF_SUCCESSOR_1_INSN_COUNT = 65,
  ISAAC_LUA_SETREF_SUCCESSOR_2_INSN_COUNT = 64,
  /* pushcclosure fn-literal sites (the wrapper VA is the pushed imm). */
  ISAAC_LUA_SETREF_SUCCESSOR_0_INSTALL_VA = 0x008a05b0u,
  ISAAC_LUA_SETREF_SUCCESSOR_1_INSTALL_VA = 0x008a0521u,
  ISAAC_LUA_SETREF_SUCCESSOR_2_INSTALL_VA = 0x008a0481u,
  /* shared arg conduct / gates */
  ISAAC_LUA_SETREF_SUCCESSOR_TYPE_INDEX = 0x01,
  ISAAC_LUA_SETREF_SUCCESSOR_CHECK_STACK_INDEX = 0x01,
  ISAAC_LUA_SETREF_SUCCESSOR_REGISTRY_KEY = 0x00c82980u,
  ISAAC_LUA_SETREF_SUCCESSOR_OBJECT_FIELD_OFF = 0x04,
  ISAAC_LUA_SETREF_SUCCESSOR_TOUSERDATA_INDEX_U32 = 0xfff0b9d7u,
  ISAAC_LUA_SETREF_SUCCESSOR_FN_OFF = 0x00,
  /* per-wrapper check-helper flags (push imm before key). */
  ISAAC_LUA_SETREF_SUCCESSOR_0_CHECK_FLAGS = 0x00,
  ISAAC_LUA_SETREF_SUCCESSOR_1_CHECK_FLAGS = 0x01,
  ISAAC_LUA_SETREF_SUCCESSOR_2_CHECK_FLAGS = 0x01,
  /* per-wrapper return value. */
  ISAAC_LUA_SETREF_SUCCESSOR_0_RETURN_VALUE = 0,
  ISAAC_LUA_SETREF_SUCCESSOR_1_RETURN_VALUE = 1,
  ISAAC_LUA_SETREF_SUCCESSOR_2_RETURN_VALUE = 1,
  /* host IAT pins (lua-v16/iat.txt). */
  ISAAC_LUA_SETREF_SUCCESSOR_IAT_LUA_TYPE = 0x00b18400u,
  ISAAC_LUA_SETREF_SUCCESSOR_IAT_LUA_TOUSERDATA = 0x00b183b0u,
  ISAAC_LUA_SETREF_SUCCESSOR_IAT_LUA_PUSHCClOSURE = 0x00b183fcu,
  /* wrapper #2 (0x8a81d0) specifics. */
  ISAAC_LUA_SETREF_SUCCESSOR_RET_SLOT_STACK_OFF = 0xfffffff8u, /* [ebp-8] */
  ISAAC_LUA_SETREF_SUCCESSOR_NEWUSERDATA_SIZE = 0x10,
  ISAAC_LUA_SETREF_SUCCESSOR_VTABLE_TAG_VA = 0x00b73574u,
  ISAAC_LUA_SETREF_SUCCESSOR_PAYLOAD_SELF_OFF = 0x04, /* [ud+4]=&ud[8] */
  ISAAC_LUA_SETREF_SUCCESSOR_PAYLOAD_OFF = 0x08,      /* payload at ud+8 */
  ISAAC_LUA_SETREF_SUCCESSOR_METATABLE_RAWGETP_KEY = 0x00c82980u,
  ISAAC_LUA_SETREF_SUCCESSOR_LUA_REGISTRY_INDEX_U32 = 0xfff0b9d8u,
  ISAAC_LUA_SETREF_SUCCESSOR_SETMETA_INDEX_U32 = 0xfffffffeu, /* -2 */
  ISAAC_LUA_SETREF_SUCCESSOR_PAYLOAD_LO_OFF = 0x00,
  ISAAC_LUA_SETREF_SUCCESSOR_PAYLOAD_HI_OFF = 0x04,
  ISAAC_LUA_SETREF_SUCCESSOR_IAT_LUA_NEWUSERDATA = 0x00b1839cu,
  ISAAC_LUA_SETREF_SUCCESSOR_IAT_LUA_RAWGETP = 0x00b183bcu,
  ISAAC_LUA_SETREF_SUCCESSOR_IAT_LUA_SETMETATABLE = 0x00b18398u,
  /* wrapper #3 (0x8a8270) specifics. */
  ISAAC_LUA_SETREF_SUCCESSOR_ARG2_STACK_INDEX = 0x02,
  ISAAC_LUA_SETREF_SUCCESSOR_ARG2_VEC_FLOAT_COUNT = 0x02,
  ISAAC_LUA_SETREF_SUCCESSOR_ARG2_VEC_OFF_0 = 0x00,
  ISAAC_LUA_SETREF_SUCCESSOR_ARG2_VEC_OFF_1 = 0x04,
  ISAAC_LUA_SETREF_SUCCESSOR_FN_SLOT_STACK_OFF = 0xfffffff8u, /* [ebp-8] */
  ISAAC_LUA_SETREF_SUCCESSOR_FLOAT_RET_SLOT_STACK_OFF = 0xfffffff8u,
  ISAAC_LUA_SETREF_SUCCESSOR_GET_ARG_OBJECT_VA = 0x008baa50u,
  ISAAC_LUA_SETREF_SUCCESSOR_GET_ARG_OBJECT_ERROR_RET_VA = 0x008baa7au,
  ISAAC_LUA_SETREF_SUCCESSOR_GET_ARG_OBJECT_RET_VA = 0x008baaa8u,
  ISAAC_LUA_SETREF_SUCCESSOR_ERROR_STRING_VA = 0x00b7539cu,
  ISAAC_LUA_SETREF_SUCCESSOR_IAT_LUA_L_ERROR = 0x00b18390u,
  ISAAC_LUA_SETREF_SUCCESSOR_PUSH_NUMBER_VA = 0x0085c050u,
  ISAAC_LUA_SETREF_SUCCESSOR_PUSH_NUMBER_RET_VA = 0x0085c072u,
  ISAAC_LUA_SETREF_SUCCESSOR_PUSH_NUMBER_IAT_LUA_PUSHNUMBER = 0x00b183f0u,
  ISAAC_LUA_SETREF_SUCCESSOR_PUSH_NUMBER_CLEANUP = 0x0c
};

/* ABI v45 — SetReference wrapper successor laws. */
int32_t isaac_lua_engine_setref_successor_count(void);
uint32_t isaac_lua_engine_setref_successor_va(int32_t index);
uint32_t isaac_lua_engine_setref_successor_ret_va(int32_t index);
/* first ret - body VA (ret excluded, family convention). */
uint32_t isaac_lua_engine_setref_successor_body_bytes(int32_t index);
int32_t isaac_lua_engine_setref_successor_insn_count(int32_t index);
/* pushcclosure fn-literal site (reachability edge). OOR -> 0. */
uint32_t isaac_lua_engine_setref_successor_install_va(int32_t index);
int32_t isaac_lua_engine_setref_successor_check_flags(int32_t index);
int32_t isaac_lua_engine_setref_successor_return_value(int32_t index);
/* Shared arg conduct. */
uint32_t isaac_lua_engine_setref_successor_type_index(void);
uint32_t isaac_lua_engine_setref_successor_check_stack_index(void);
uint32_t isaac_lua_engine_setref_successor_registry_key(void);
uint32_t isaac_lua_engine_setref_successor_object_field_off(void);
uint32_t isaac_lua_engine_setref_successor_touserdata_index(void);
uint32_t isaac_lua_engine_setref_successor_fn_off(void);
uint32_t isaac_lua_engine_setref_successor_iat_lua_type(void);
uint32_t isaac_lua_engine_setref_successor_iat_lua_touserdata(void);
uint32_t isaac_lua_engine_setref_successor_iat_lua_pushcclosure(void);
/* Registry ref-set decision: PE `test eax,eax; je obj_zero` is a FULL-WORD
 * zero test of the lua_type(L,1) result. obj = (type != 0) ? check_field
 * : 0. Drive UNMASKED (0x100/0x1ff/0xffffffff); a low-byte mutant fails. */
uint32_t isaac_lua_engine_setref_successor_object_resolve(
    uint32_t type_result, uint32_t check_field);
/* Wrapper #2 constants. */
uint32_t isaac_lua_engine_setref_successor_ret_slot_stack_off(void);
uint32_t isaac_lua_engine_setref_successor_newuserdata_size(void);
uint32_t isaac_lua_engine_setref_successor_vtable_tag_va(void);
uint32_t isaac_lua_engine_setref_successor_payload_self_off(void);
uint32_t isaac_lua_engine_setref_successor_payload_off(void);
uint32_t isaac_lua_engine_setref_successor_metatable_rawgetp_key(void);
uint32_t isaac_lua_engine_setref_successor_lua_registry_index(void);
uint32_t isaac_lua_engine_setref_successor_setmeta_index(void);
uint32_t isaac_lua_engine_setref_successor_payload_lo_off(void);
uint32_t isaac_lua_engine_setref_successor_payload_hi_off(void);
uint32_t isaac_lua_engine_setref_successor_iat_lua_newuserdata(void);
uint32_t isaac_lua_engine_setref_successor_iat_lua_rawgetp(void);
uint32_t isaac_lua_engine_setref_successor_iat_lua_setmetatable(void);
/* Wrapper #3 constants. */
uint32_t isaac_lua_engine_setref_successor_arg2_stack_index(void);
uint32_t isaac_lua_engine_setref_successor_arg2_vec_float_count(void);
uint32_t isaac_lua_engine_setref_successor_arg2_vec_off_0(void);
uint32_t isaac_lua_engine_setref_successor_arg2_vec_off_1(void);
uint32_t isaac_lua_engine_setref_successor_fn_slot_stack_off(void);
uint32_t isaac_lua_engine_setref_successor_float_ret_slot_stack_off(void);
uint32_t isaac_lua_engine_setref_successor_get_arg_object_va(void);
uint32_t isaac_lua_engine_setref_successor_get_arg_object_error_ret_va(void);
uint32_t isaac_lua_engine_setref_successor_get_arg_object_ret_va(void);
uint32_t isaac_lua_engine_setref_successor_error_string_va(void);
uint32_t isaac_lua_engine_setref_successor_iat_lua_l_error(void);
uint32_t isaac_lua_engine_setref_successor_push_number_va(void);
uint32_t isaac_lua_engine_setref_successor_push_number_ret_va(void);
uint32_t isaac_lua_engine_setref_successor_push_number_iat_lua_pushnumber(
    void);
uint32_t isaac_lua_engine_setref_successor_push_number_cleanup(void);
/* getArgObject law: type==0 -> error path (ret 0); else obj=check_field;
 * obj==0 -> error path again; else return obj. */
uint32_t isaac_lua_engine_setref_successor_get_arg_object(
    uint32_t type_result, uint32_t check_field);
/* pushNumber cvtss2sd widening: float32 bits -> exact float64 bits (hi/lo
 * as two uint32). Exact for finite/inf/zero/denormal inputs. */
uint32_t isaac_lua_engine_setref_successor_push_number_widen_hi(
    uint32_t f32_bits);
uint32_t isaac_lua_engine_setref_successor_push_number_widen_lo(
    uint32_t f32_bits);

/* ---------------------------------------------------------------------------
 * ABI v47 — closure-install helpers 0x8a0460..0x89fee0 (12 bodies) + ABI v50
 * helpers 12/13 (0x89fde0 / 0x89fd80 — 14 rows total)
 *
 * The Vector method-install helpers that push the v45 closure wrappers
 * (pushcclosure fn literals 0x8a8270 / 0x8a81d0 / 0x8a8180 / 0x8a8310 /
 * 0x8a8430 / 0x8a8510 / 0x8a8580 / 0x8a8610 / 0x8a8680 / 0x8a8740 /
 * 0x8a8810 / 0x8a88f0) plus the v49 FontRenderSettings wrappers
 * (0x8a89e0 / 0x8a8a40, helpers 12/13, ABI v50 — full machine
 * transcription in section-notes/lua-v53/NOTES.md). Four shapes (all
 * compiled from one template, per-site laws):
 *
 *   DUAL (0x8a0460, 0x8a0500, 0x8a0360, 0x8a0220, 0x8a0020, 0x89ff80 —
 *     REGISTER-held): newuserdata(L, 4); ud[0] = [ebp+8] (real_fn
 *     register, caller-pushed); pushcclosure(L, wrapper, nups=1);
 *     lua_pushvalue(L, −1) [0xb183c8] duplicates the closure; then TWO
 *     install chains, both spelling name from edx:
 *       absindex(L, −5) ; pushstring(L, name) ; rotate(L, −2, 1) ;
 *       rawset(L, abs)      ; add esp, 0x40
 *       absindex(L, −3) ; pushstring(L, name) ; rotate(L, −2, 1) ;
 *       rawset(L, abs)      ; add esp, 0x24
 *   SINGLE (0x8a05a0, 0x8a0400, 0x8a01c0, 0x8a0160; the landed 0x8a06a0
 *     is the same template) — IMMEDIATE-held: same prologue but
 *     ud[0] = <real_fn imm> and the name is an imm; ONE chain:
 *     absindex(L, −3) ; pushstring; rotate; rawset; add esp, 0x38. The
 *     IAT 0xb183c8 usage at 0x8a048f (dual) is the pushvalue dup — the
 *     second use of that slot after materialize (v25).
 *   DUAL_IMM (0x8a00c0, 0x89fee0, 0x89fde0(v50, helper 12)): dual chain
 *     layout (pushvalue dup + two rawset chains, cleanups 0x40 + 0x24)
 *     but name and real_fn are BODY IMMEDIATES — edx and [ebp+8] are NOT
 *     consumed (0x8a00c0: no ebx spill, no [ebp+8] read; name pushed
 *     twice as an imm, ud[0] = imm since 0x8a00dc). Regalloc: rotate
 *     called directly through [0xb1840c] (two sites) instead of the
 *     ebx-cached DUAL form.
 *   SINGLE-reg (0x89fd80, v50, helper 13): SINGLE chain layout (ONE
 *     chain at −3, cleanup 0x38) but name + real_fn are REGISTER-held
 *     (edx -> name push, [ebp+8] -> ud[0]) — the v47 shape-derived
 *     source law cannot express this combination, so NAME_SOURCE /
 *     REAL_FN_SOURCE became per-helper 14-row tables (body for the
 *     single helper 13: `mov edi,edx` name, `mov esi,[ebp+8]` real_fn,
 *     `push edi` name, `mov [eax],esi` ud[0], single absindex
 *     (−3)/pushstring/rotate/rawset chain, add esp 0x38).
 *
 * Call sites (RegisterClasses Vector + FontRenderSettings sections) are
 * a uniform record `mov ecx,L; mov edx,name; push real_fn; call helper;
 * add esp,4`. DUAL and SINGLE-reg helpers CONSUME edx + [ebp+8]; SINGLE
 * (immediate-held) and DUAL_IMM helpers ignore them (the record still
 * carries matching dead values).
 * --------------------------------------------------------------------------- */

enum {
  ISAAC_LUA_INSTALL_HELPER_COUNT = 29,
  /* index order: 0 = 0x8a0460, 1 = 0x8a0500, 2 = 0x8a05a0, 3 = 0x8a0400,
   * 4 = 0x8a0360, 5 = 0x8a0220, 6 = 0x8a01c0, 7 = 0x8a0160, 8 = 0x8a00c0,
   * 9 = 0x8a0020, 10 = 0x89ff80, 11 = 0x89fee0, 12 = 0x89fde0 (v50,
   * DUAL_IMM), 13 = 0x89fd80 (v50, SINGLE-reg), 14 = 0x89fe80 (v51,
   * SINGLE), 15..28 = 0x89fce0..0x89f600 (v51 FontRenderSettings install
   * run helpers). */
  ISAAC_LUA_INSTALL_HELPER_0_VA = 0x008a0460u,
  ISAAC_LUA_INSTALL_HELPER_1_VA = 0x008a0500u,
  ISAAC_LUA_INSTALL_HELPER_2_VA = 0x008a05a0u,
  ISAAC_LUA_INSTALL_HELPER_3_VA = 0x008a0400u,
  ISAAC_LUA_INSTALL_HELPER_4_VA = 0x008a0360u,
  ISAAC_LUA_INSTALL_HELPER_5_VA = 0x008a0220u,
  ISAAC_LUA_INSTALL_HELPER_6_VA = 0x008a01c0u,
  ISAAC_LUA_INSTALL_HELPER_7_VA = 0x008a0160u,
  ISAAC_LUA_INSTALL_HELPER_8_VA = 0x008a00c0u,
  ISAAC_LUA_INSTALL_HELPER_9_VA = 0x008a0020u,
  ISAAC_LUA_INSTALL_HELPER_10_VA = 0x0089ff80u,
  ISAAC_LUA_INSTALL_HELPER_11_VA = 0x0089fee0u,
  ISAAC_LUA_INSTALL_HELPER_12_VA = 0x0089fde0u,
  ISAAC_LUA_INSTALL_HELPER_13_VA = 0x0089fd80u,
  /* v51 — FontRenderSettings install-run helpers 14..28 (0x89fe80 and the
   * 0x89fce0..0x89f600 band; 0x89fe80 is the SetAlignment installer that
   * sits between helpers 11/12 in the PE — appended here in run order
   * without renumbering the landed 12/13). */
  ISAAC_LUA_INSTALL_HELPER_14_VA = 0x0089fe80u,
  ISAAC_LUA_INSTALL_HELPER_15_VA = 0x0089fce0u,
  ISAAC_LUA_INSTALL_HELPER_16_VA = 0x0089fc40u,
  ISAAC_LUA_INSTALL_HELPER_17_VA = 0x0089fbe0u,
  ISAAC_LUA_INSTALL_HELPER_18_VA = 0x0089fb40u,
  ISAAC_LUA_INSTALL_HELPER_19_VA = 0x0089fae0u,
  ISAAC_LUA_INSTALL_HELPER_20_VA = 0x0089fa40u,
  ISAAC_LUA_INSTALL_HELPER_21_VA = 0x0089f9e0u,
  ISAAC_LUA_INSTALL_HELPER_22_VA = 0x0089f980u,
  ISAAC_LUA_INSTALL_HELPER_23_VA = 0x0089f8e0u,
  ISAAC_LUA_INSTALL_HELPER_24_VA = 0x0089f840u,
  ISAAC_LUA_INSTALL_HELPER_25_VA = 0x0089f7a0u,
  ISAAC_LUA_INSTALL_HELPER_26_VA = 0x0089f700u,
  ISAAC_LUA_INSTALL_HELPER_27_VA = 0x0089f660u,
  ISAAC_LUA_INSTALL_HELPER_28_VA = 0x0089f600u,
  ISAAC_LUA_INSTALL_HELPER_0_RET_VA = 0x008a04f6u,
  ISAAC_LUA_INSTALL_HELPER_1_RET_VA = 0x008a0596u,
  ISAAC_LUA_INSTALL_HELPER_2_RET_VA = 0x008a05f0u,
  ISAAC_LUA_INSTALL_HELPER_3_RET_VA = 0x008a0450u,
  ISAAC_LUA_INSTALL_HELPER_4_RET_VA = 0x008a03f6u,
  ISAAC_LUA_INSTALL_HELPER_5_RET_VA = 0x008a02b6u,
  ISAAC_LUA_INSTALL_HELPER_6_RET_VA = 0x008a0210u,
  ISAAC_LUA_INSTALL_HELPER_7_RET_VA = 0x008a01b0u,
  ISAAC_LUA_INSTALL_HELPER_8_RET_VA = 0x008a0156u,
  ISAAC_LUA_INSTALL_HELPER_9_RET_VA = 0x008a00b6u,
  ISAAC_LUA_INSTALL_HELPER_10_RET_VA = 0x008a0016u,
  ISAAC_LUA_INSTALL_HELPER_11_RET_VA = 0x0089ff76u,
  ISAAC_LUA_INSTALL_HELPER_12_RET_VA = 0x0089fe76u,
  ISAAC_LUA_INSTALL_HELPER_13_RET_VA = 0x0089fdd3u,
  ISAAC_LUA_INSTALL_HELPER_14_RET_VA = 0x0089fed0u,
  ISAAC_LUA_INSTALL_HELPER_15_RET_VA = 0x0089fd76u,
  ISAAC_LUA_INSTALL_HELPER_16_RET_VA = 0x0089fcd6u,
  ISAAC_LUA_INSTALL_HELPER_17_RET_VA = 0x0089fc30u,
  ISAAC_LUA_INSTALL_HELPER_18_RET_VA = 0x0089fbd6u,
  ISAAC_LUA_INSTALL_HELPER_19_RET_VA = 0x0089fb30u,
  ISAAC_LUA_INSTALL_HELPER_20_RET_VA = 0x0089fad6u,
  ISAAC_LUA_INSTALL_HELPER_21_RET_VA = 0x0089fa30u,
  ISAAC_LUA_INSTALL_HELPER_22_RET_VA = 0x0089f9d0u,
  ISAAC_LUA_INSTALL_HELPER_23_RET_VA = 0x0089f976u,
  ISAAC_LUA_INSTALL_HELPER_24_RET_VA = 0x0089f8d6u,
  ISAAC_LUA_INSTALL_HELPER_25_RET_VA = 0x0089f836u,
  ISAAC_LUA_INSTALL_HELPER_26_RET_VA = 0x0089f796u,
  ISAAC_LUA_INSTALL_HELPER_27_RET_VA = 0x0089f6f6u,
  ISAAC_LUA_INSTALL_HELPER_28_RET_VA = 0x0089f650u,
  ISAAC_LUA_INSTALL_HELPER_0_INSNS = 72,
  ISAAC_LUA_INSTALL_HELPER_1_INSNS = 73,
  ISAAC_LUA_INSTALL_HELPER_2_INSNS = 44,
  ISAAC_LUA_INSTALL_HELPER_3_INSNS = 44,
  ISAAC_LUA_INSTALL_HELPER_4_INSNS = 73,
  ISAAC_LUA_INSTALL_HELPER_5_INSNS = 72,
  ISAAC_LUA_INSTALL_HELPER_6_INSNS = 44,
  ISAAC_LUA_INSTALL_HELPER_7_INSNS = 44,
  ISAAC_LUA_INSTALL_HELPER_8_INSNS = 67,
  ISAAC_LUA_INSTALL_HELPER_9_INSNS = 74,
  ISAAC_LUA_INSTALL_HELPER_10_INSNS = 72,
  ISAAC_LUA_INSTALL_HELPER_11_INSNS = 66,
  ISAAC_LUA_INSTALL_HELPER_12_INSNS = 67,
  ISAAC_LUA_INSTALL_HELPER_13_INSNS = 50,
  ISAAC_LUA_INSTALL_HELPER_14_INSNS = 44,
  ISAAC_LUA_INSTALL_HELPER_15_INSNS = 68,
  ISAAC_LUA_INSTALL_HELPER_16_INSNS = 74,
  ISAAC_LUA_INSTALL_HELPER_17_INSNS = 44,
  ISAAC_LUA_INSTALL_HELPER_18_INSNS = 67,
  ISAAC_LUA_INSTALL_HELPER_19_INSNS = 44,
  ISAAC_LUA_INSTALL_HELPER_20_INSNS = 67,
  ISAAC_LUA_INSTALL_HELPER_21_INSNS = 44,
  ISAAC_LUA_INSTALL_HELPER_22_INSNS = 44,
  ISAAC_LUA_INSTALL_HELPER_23_INSNS = 67,
  ISAAC_LUA_INSTALL_HELPER_24_INSNS = 68,
  ISAAC_LUA_INSTALL_HELPER_25_INSNS = 68,
  ISAAC_LUA_INSTALL_HELPER_26_INSNS = 74,
  ISAAC_LUA_INSTALL_HELPER_27_INSNS = 66,
  ISAAC_LUA_INSTALL_HELPER_28_INSNS = 44,
  /* pushcclosure fn literals (v45 wrappers #3 / #2 / #1, then the nine
   * wrapper successors 0x8a8310..0x8a88f0 pushed by helpers 3..11, then
   * the two v49 FontRenderSettings wrappers pushed by helpers 12/13). */
  ISAAC_LUA_INSTALL_HELPER_0_WRAPPER_VA = 0x008a8270u,
  ISAAC_LUA_INSTALL_HELPER_1_WRAPPER_VA = 0x008a81d0u,
  ISAAC_LUA_INSTALL_HELPER_2_WRAPPER_VA = 0x008a8180u,
  ISAAC_LUA_INSTALL_HELPER_3_WRAPPER_VA = 0x008a8310u,
  ISAAC_LUA_INSTALL_HELPER_4_WRAPPER_VA = 0x008a8430u,
  ISAAC_LUA_INSTALL_HELPER_5_WRAPPER_VA = 0x008a8510u,
  ISAAC_LUA_INSTALL_HELPER_6_WRAPPER_VA = 0x008a8580u,
  ISAAC_LUA_INSTALL_HELPER_7_WRAPPER_VA = 0x008a8610u,
  ISAAC_LUA_INSTALL_HELPER_8_WRAPPER_VA = 0x008a8680u,
  ISAAC_LUA_INSTALL_HELPER_9_WRAPPER_VA = 0x008a8740u,
  ISAAC_LUA_INSTALL_HELPER_10_WRAPPER_VA = 0x008a8810u,
  ISAAC_LUA_INSTALL_HELPER_11_WRAPPER_VA = 0x008a88f0u,
  ISAAC_LUA_INSTALL_HELPER_12_WRAPPER_VA = 0x008a89e0u, /* GetAlignment */
  ISAAC_LUA_INSTALL_HELPER_13_WRAPPER_VA = 0x008a8a40u, /* setter */
  /* v51 wrappers: SetAlignment 0x8a8970 (shared by helper 19 too),
   * GetMaxCharacters 0x8a8ab0, IsAutoWrap/IsTruncation 0x8a8b10,
   * SetLineHeightModifier 0x8a8b80, GetLineHeightModifier 0x8a8c10,
   * GetMissingCharacterOverride 0x8a8c80, Load 0x8a8ce0, Unload 0x8a8d80,
   * IsLoaded 0x8a8dd0, GetCharacterWidth 0x8a8e40, GetStringWidth 0x8a8ec0,
   * GetLineHeight/GetBaselineHeight 0x8a8f60, DrawString 0x8a8fc0,
   * SetMissingCharacter 0x8a9180. */
  ISAAC_LUA_INSTALL_HELPER_14_WRAPPER_VA = 0x008a8970u,
  ISAAC_LUA_INSTALL_HELPER_15_WRAPPER_VA = 0x008a8ab0u,
  ISAAC_LUA_INSTALL_HELPER_16_WRAPPER_VA = 0x008a8b10u,
  ISAAC_LUA_INSTALL_HELPER_17_WRAPPER_VA = 0x008a8b80u,
  ISAAC_LUA_INSTALL_HELPER_18_WRAPPER_VA = 0x008a8c10u,
  ISAAC_LUA_INSTALL_HELPER_19_WRAPPER_VA = 0x008a8970u,
  ISAAC_LUA_INSTALL_HELPER_20_WRAPPER_VA = 0x008a8c80u,
  ISAAC_LUA_INSTALL_HELPER_21_WRAPPER_VA = 0x008a8ce0u,
  ISAAC_LUA_INSTALL_HELPER_22_WRAPPER_VA = 0x008a8d80u,
  ISAAC_LUA_INSTALL_HELPER_23_WRAPPER_VA = 0x008a8dd0u,
  ISAAC_LUA_INSTALL_HELPER_24_WRAPPER_VA = 0x008a8e40u,
  ISAAC_LUA_INSTALL_HELPER_25_WRAPPER_VA = 0x008a8ec0u,
  ISAAC_LUA_INSTALL_HELPER_26_WRAPPER_VA = 0x008a8f60u,
  ISAAC_LUA_INSTALL_HELPER_27_WRAPPER_VA = 0x008a8fc0u,
  ISAAC_LUA_INSTALL_HELPER_28_WRAPPER_VA = 0x008a9180u,
  /* Immediate-held name/real_fn (SINGLE + DUAL_IMM bodies; DUAL holds
   * neither — the operands come from edx / [ebp+8]). Helpers 12 (DUAL_IMM)
   * holds both imms; helper 13 (SINGLE-reg) holds NEITHER (edx + [ebp+8]). */
  ISAAC_LUA_INSTALL_HELPER_2_NAME_VA = 0x00b701c0u, /* "Normalize" */
  ISAAC_LUA_INSTALL_HELPER_2_REAL_FN_VA = 0x00a0ffc0u,
  ISAAC_LUA_INSTALL_HELPER_3_NAME_VA = 0x00b70244u, /* "Lerp" */
  ISAAC_LUA_INSTALL_HELPER_3_REAL_FN_VA = 0x00a10210u,
  ISAAC_LUA_INSTALL_HELPER_6_NAME_VA = 0x00b70200u, /* "Resize" */
  ISAAC_LUA_INSTALL_HELPER_6_REAL_FN_VA = 0x00a100b0u,
  ISAAC_LUA_INSTALL_HELPER_7_NAME_VA = 0x00b70290u, /* "Clamp" */
  ISAAC_LUA_INSTALL_HELPER_7_REAL_FN_VA = 0x00a103c0u,
  ISAAC_LUA_INSTALL_HELPER_8_NAME_VA = 0x00b70298u, /* "Clamped" */
  ISAAC_LUA_INSTALL_HELPER_8_REAL_FN_VA = 0x00a103f0u,
  ISAAC_LUA_INSTALL_HELPER_11_NAME_VA = 0x00b70300u, /* "__tostring" */
  ISAAC_LUA_INSTALL_HELPER_11_REAL_FN_VA = 0x0085e630u,
  ISAAC_LUA_INSTALL_HELPER_12_NAME_VA = 0x00b702a0u, /* "GetAlignment" */
  ISAAC_LUA_INSTALL_HELPER_12_REAL_FN_VA = 0x0040c3a0u,
  /* v51 immediate-held names/real_fns (helpers 16/26 are DUAL-register:
   * neither operand is an immediate). */
  ISAAC_LUA_INSTALL_HELPER_14_NAME_VA = 0x00b702d8u, /* "SetAlignment" */
  ISAAC_LUA_INSTALL_HELPER_14_REAL_FN_VA = 0x00a1a5c0u,
  ISAAC_LUA_INSTALL_HELPER_15_NAME_VA = 0x00b70394u, /* "GetMaxCharacters" */
  ISAAC_LUA_INSTALL_HELPER_15_REAL_FN_VA = 0x00a1a5e0u,
  ISAAC_LUA_INSTALL_HELPER_17_NAME_VA = 0x00b70354u, /* "SetLineHeightModifier" */
  ISAAC_LUA_INSTALL_HELPER_17_REAL_FN_VA = 0x00407280u,
  ISAAC_LUA_INSTALL_HELPER_18_NAME_VA = 0x00b7030cu, /* "GetLineHeightModifier" */
  ISAAC_LUA_INSTALL_HELPER_18_REAL_FN_VA = 0x00407270u,
  ISAAC_LUA_INSTALL_HELPER_19_NAME_VA = 0x00b70324u, /* "SetMissingCharacterOverride" */
  ISAAC_LUA_INSTALL_HELPER_19_REAL_FN_VA = 0x00a1a630u,
  ISAAC_LUA_INSTALL_HELPER_20_NAME_VA = 0x00b70408u, /* "GetMissingCharacterOverride" */
  ISAAC_LUA_INSTALL_HELPER_20_REAL_FN_VA = 0x0040c2e0u,
  ISAAC_LUA_INSTALL_HELPER_21_NAME_VA = 0x00b703f8u, /* "Load" */
  ISAAC_LUA_INSTALL_HELPER_21_REAL_FN_VA = 0x0085e470u,
  ISAAC_LUA_INSTALL_HELPER_22_NAME_VA = 0x00b70400u, /* "Unload" */
  ISAAC_LUA_INSTALL_HELPER_22_REAL_FN_VA = 0x00a1ad90u,
  ISAAC_LUA_INSTALL_HELPER_23_NAME_VA = 0x00b703d8u, /* "IsLoaded" */
  ISAAC_LUA_INSTALL_HELPER_23_REAL_FN_VA = 0x006b83d0u,
  ISAAC_LUA_INSTALL_HELPER_24_NAME_VA = 0x00b703e4u, /* "GetCharacterWidth" */
  ISAAC_LUA_INSTALL_HELPER_24_REAL_FN_VA = 0x00a1ae70u,
  ISAAC_LUA_INSTALL_HELPER_25_NAME_VA = 0x00b703b8u, /* "GetStringWidth" */
  ISAAC_LUA_INSTALL_HELPER_25_REAL_FN_VA = 0x00a1ae80u,
  ISAAC_LUA_INSTALL_HELPER_27_NAME_VA = 0x00b70468u, /* "DrawString" */
  ISAAC_LUA_INSTALL_HELPER_27_REAL_FN_VA = 0x00a1b140u,
  ISAAC_LUA_INSTALL_HELPER_28_NAME_VA = 0x00b7043cu, /* "SetMissingCharacter" */
  ISAAC_LUA_INSTALL_HELPER_28_REAL_FN_VA = 0x00a1b3b0u,
  /* shape / operand-source enums. */
  ISAAC_LUA_INSTALL_SHAPE_DUAL = 0,
  ISAAC_LUA_INSTALL_SHAPE_SINGLE = 1,
  ISAAC_LUA_INSTALL_SHAPE_DUAL_IMM = 2,
  ISAAC_LUA_INSTALL_SOURCE_REGISTER = 0,
  ISAAC_LUA_INSTALL_SOURCE_IMMEDIATE = 1,
  /* shared IAT-chain imms. */
  ISAAC_LUA_INSTALL_NEWUSERDATA_SIZE = 4,
  ISAAC_LUA_INSTALL_CLOSURE_NUPS = 1,
  ISAAC_LUA_INSTALL_PUSHVALUE_INDEX_U32 = 0xffffffffu, /* push −1 @ 0x8a048f */
  ISAAC_LUA_INSTALL_DUAL_ABSINDEX_FIRST_U32 = 0xfffffffbu, /* −5 chain 1 */
  ISAAC_LUA_INSTALL_DUAL_ABSINDEX_SECOND_U32 = 0xfffffffdu, /* −3 chain 2 */
  ISAAC_LUA_INSTALL_ABSINDEX_INDEX_U32 = 0xfffffffdu,       /* −3 single */
  ISAAC_LUA_INSTALL_ROTATE_INDEX_U32 = 0xfffffffeu,         /* −2 */
  ISAAC_LUA_INSTALL_ROTATE_N = 1,
  ISAAC_LUA_INSTALL_DUAL_CLEANUP_FIRST = 0x40,  /* add esp after chain 1 */
  ISAAC_LUA_INSTALL_DUAL_CLEANUP_SECOND = 0x24, /* add esp after chain 2 */
  ISAAC_LUA_INSTALL_SINGLE_CLEANUP = 0x38,
  /* IAT slots (Lua5.3.3r.dll import directory; pushvalue == materialize
   * v25 slot 0xb183c8). */
  ISAAC_LUA_INSTALL_IAT_NEWUSERDATA = 0x00b1839cu,
  ISAAC_LUA_INSTALL_IAT_PUSHCClOSURE = 0x00b183fcu,
  ISAAC_LUA_INSTALL_IAT_PUSHVALUE = 0x00b183c8u,
  ISAAC_LUA_INSTALL_IAT_ABSINDEX = 0x00b18418u,
  ISAAC_LUA_INSTALL_IAT_PUSHSTRING = 0x00b18414u,
  ISAAC_LUA_INSTALL_IAT_ROTATE = 0x00b1840cu,
  ISAAC_LUA_INSTALL_IAT_RAWSET = 0x00b18408u
};

/* Per-site register-call records (RegisterClasses Vector section +
 * FontRenderSettings install run, ABI v50). Sites 7..20 are the remaining
 * Vector installs (Lerp .. __tostring), all five upstream of the old
 * __unm site between 0x00866aeb and 0x00866c72 (ascending callVa).
 * Sites 21..24 (v50) are the four FontRenderSettings installs
 * 0x00866dcc .. 0x00866e35 (GetAlignment -> helper 12, SetMaxCharacters /
 * EnableAutoWrap / EnableTruncation -> helper 13). */
enum {
  ISAAC_LUA_INSTALL_SITE_COUNT = 42,
  ISAAC_LUA_INSTALL_SITE_NORMALIZE_CALL_VA = 0x00866a97u,
  ISAAC_LUA_INSTALL_SITE_NORMALIZED_CALL_VA = 0x00866aacu,
  ISAAC_LUA_INSTALL_SITE_DOT_CALL_VA = 0x00866ac1u,
  ISAAC_LUA_INSTALL_SITE_CROSS_CALL_VA = 0x00866ad6u,
  ISAAC_LUA_INSTALL_SITE_LERP_CALL_VA = 0x00866aebu,
  ISAAC_LUA_INSTALL_SITE_DISTANCE_CALL_VA = 0x00866b00u,
  ISAAC_LUA_INSTALL_SITE_DISTANCE_SQUARED_CALL_VA = 0x00866b15u,
  ISAAC_LUA_INSTALL_SITE_ROTATED_CALL_VA = 0x00866b2au,
  ISAAC_LUA_INSTALL_SITE_GET_ANGLE_DEGREES_CALL_VA = 0x00866b76u,
  ISAAC_LUA_INSTALL_SITE_RESIZE_CALL_VA = 0x00866b8bu,
  ISAAC_LUA_INSTALL_SITE_RESIZED_CALL_VA = 0x00866ba0u,
  ISAAC_LUA_INSTALL_SITE_CLAMP_CALL_VA = 0x00866bb5u,
  ISAAC_LUA_INSTALL_SITE_CLAMPED_CALL_VA = 0x00866bcau,
  ISAAC_LUA_INSTALL_SITE_LENGTH_CALL_VA = 0x00866bdfu,
  ISAAC_LUA_INSTALL_SITE_LENGTH_SQUARED_CALL_VA = 0x00866bf4u,
  ISAAC_LUA_INSTALL_SITE_ADD_CALL_VA = 0x00866c09u,
  ISAAC_LUA_INSTALL_SITE_SUB_CALL_VA = 0x00866c1eu,
  ISAAC_LUA_INSTALL_SITE_MUL_CALL_VA = 0x00866c33u,
  ISAAC_LUA_INSTALL_SITE_DIV_CALL_VA = 0x00866c48u,
  ISAAC_LUA_INSTALL_SITE_UNM_CALL_VA = 0x00866c5du,
  ISAAC_LUA_INSTALL_SITE_TOSTRING_CALL_VA = 0x00866c72u,
  /* v50 — FontRenderSettings install run (E8 into helpers 12/13). */
  ISAAC_LUA_INSTALL_SITE_GET_ALIGNMENT_CALL_VA = 0x00866dccu,
  ISAAC_LUA_INSTALL_SITE_SET_MAX_CHARACTERS_CALL_VA = 0x00866de1u,
  ISAAC_LUA_INSTALL_SITE_ENABLE_AUTO_WRAP_CALL_VA = 0x00866e0bu,
  ISAAC_LUA_INSTALL_SITE_ENABLE_TRUNCATION_CALL_VA = 0x00866e35u,
  /* v51 — FontRenderSettings install-run sites 25..41 (helpers 14..28). */
  ISAAC_LUA_INSTALL_SITE_SET_ALIGNMENT_CALL_VA = 0x00866db7u,
  ISAAC_LUA_INSTALL_SITE_GET_MAX_CHARACTERS_CALL_VA = 0x00866df6u,
  ISAAC_LUA_INSTALL_SITE_IS_AUTO_WRAP_ENABLED_CALL_VA = 0x00866e20u,
  ISAAC_LUA_INSTALL_SITE_IS_TRUNCATION_ENABLED_CALL_VA = 0x00866e4au,
  ISAAC_LUA_INSTALL_SITE_SET_LINE_HEIGHT_MODIFIER_CALL_VA = 0x00866e5fu,
  ISAAC_LUA_INSTALL_SITE_GET_LINE_HEIGHT_MODIFIER_CALL_VA = 0x00866e74u,
  ISAAC_LUA_INSTALL_SITE_SET_MISSING_CHARACTER_OVERRIDE_CALL_VA = 0x00866e89u,
  ISAAC_LUA_INSTALL_SITE_GET_MISSING_CHARACTER_OVERRIDE_CALL_VA = 0x00866e9eu,
  ISAAC_LUA_INSTALL_SITE_LOAD_CALL_VA = 0x00866efcu,
  ISAAC_LUA_INSTALL_SITE_UNLOAD_CALL_VA = 0x00866f11u,
  ISAAC_LUA_INSTALL_SITE_IS_LOADED_CALL_VA = 0x00866f26u,
  ISAAC_LUA_INSTALL_SITE_GET_CHARACTER_WIDTH_CALL_VA = 0x00866f3bu,
  ISAAC_LUA_INSTALL_SITE_GET_STRING_WIDTH_CALL_VA = 0x00866f50u,
  ISAAC_LUA_INSTALL_SITE_GET_LINE_HEIGHT_CALL_VA = 0x00866f65u,
  ISAAC_LUA_INSTALL_SITE_GET_BASELINE_HEIGHT_CALL_VA = 0x00866f7au,
  ISAAC_LUA_INSTALL_SITE_DRAW_STRING_CALL_VA = 0x00866f8fu,
  ISAAC_LUA_INSTALL_SITE_SET_MISSING_CHARACTER_CALL_VA = 0x00866fa4u,
  ISAAC_LUA_INSTALL_SITE_NORMALIZE_NAME_VA = 0x00b701c0u,
  ISAAC_LUA_INSTALL_SITE_NORMALIZED_NAME_VA = 0x00b701ccu,
  ISAAC_LUA_INSTALL_SITE_DOT_NAME_VA = 0x00b701b4u,
  ISAAC_LUA_INSTALL_SITE_CROSS_NAME_VA = 0x00b701b8u,
  ISAAC_LUA_INSTALL_SITE_LERP_NAME_VA = 0x00b70244u,
  ISAAC_LUA_INSTALL_SITE_DISTANCE_NAME_VA = 0x00b7024cu,
  ISAAC_LUA_INSTALL_SITE_DISTANCE_SQUARED_NAME_VA = 0x00b7022cu,
  ISAAC_LUA_INSTALL_SITE_ROTATED_NAME_VA = 0x00b7023cu,
  ISAAC_LUA_INSTALL_SITE_GET_ANGLE_DEGREES_NAME_VA = 0x00b7021cu,
  ISAAC_LUA_INSTALL_SITE_RESIZE_NAME_VA = 0x00b70200u,
  ISAAC_LUA_INSTALL_SITE_RESIZED_NAME_VA = 0x00b70208u,
  ISAAC_LUA_INSTALL_SITE_CLAMP_NAME_VA = 0x00b70290u,
  ISAAC_LUA_INSTALL_SITE_CLAMPED_NAME_VA = 0x00b70298u,
  ISAAC_LUA_INSTALL_SITE_LENGTH_NAME_VA = 0x00b70278u,
  ISAAC_LUA_INSTALL_SITE_LENGTH_SQUARED_NAME_VA = 0x00b70280u,
  ISAAC_LUA_INSTALL_SITE_ADD_NAME_VA = 0x00b70268u,
  ISAAC_LUA_INSTALL_SITE_SUB_NAME_VA = 0x00b70270u,
  ISAAC_LUA_INSTALL_SITE_MUL_NAME_VA = 0x00b70258u,
  ISAAC_LUA_INSTALL_SITE_DIV_NAME_VA = 0x00b70260u,
  ISAAC_LUA_INSTALL_SITE_UNM_NAME_VA = 0x00b702f8u,
  ISAAC_LUA_INSTALL_SITE_TOSTRING_NAME_VA = 0x00b70300u,
  ISAAC_LUA_INSTALL_SITE_NORMALIZE_REAL_FN_VA = 0x00a0ffc0u,
  ISAAC_LUA_INSTALL_SITE_NORMALIZED_REAL_FN_VA = 0x00a10030u,
  ISAAC_LUA_INSTALL_SITE_DOT_REAL_FN_VA = 0x00a10180u,
  ISAAC_LUA_INSTALL_SITE_CROSS_REAL_FN_VA = 0x00a101a0u,
  ISAAC_LUA_INSTALL_SITE_LERP_REAL_FN_VA = 0x00a10210u,
  ISAAC_LUA_INSTALL_SITE_DISTANCE_REAL_FN_VA = 0x00a0ff30u,
  ISAAC_LUA_INSTALL_SITE_DISTANCE_SQUARED_REAL_FN_VA = 0x00a0ff90u,
  ISAAC_LUA_INSTALL_SITE_ROTATED_REAL_FN_VA = 0x00a102e0u,
  ISAAC_LUA_INSTALL_SITE_GET_ANGLE_DEGREES_REAL_FN_VA = 0x00a10390u,
  ISAAC_LUA_INSTALL_SITE_RESIZE_REAL_FN_VA = 0x00a100b0u,
  ISAAC_LUA_INSTALL_SITE_RESIZED_REAL_FN_VA = 0x00a10100u,
  ISAAC_LUA_INSTALL_SITE_CLAMP_REAL_FN_VA = 0x00a103c0u,
  ISAAC_LUA_INSTALL_SITE_CLAMPED_REAL_FN_VA = 0x00a103f0u,
  ISAAC_LUA_INSTALL_SITE_LENGTH_REAL_FN_VA = 0x00a0fea0u,
  ISAAC_LUA_INSTALL_SITE_LENGTH_SQUARED_REAL_FN_VA = 0x00a0fed0u,
  ISAAC_LUA_INSTALL_SITE_ADD_REAL_FN_VA = 0x00a10420u,
  ISAAC_LUA_INSTALL_SITE_SUB_REAL_FN_VA = 0x00a10480u,
  ISAAC_LUA_INSTALL_SITE_MUL_REAL_FN_VA = 0x00a104e0u,
  ISAAC_LUA_INSTALL_SITE_DIV_REAL_FN_VA = 0x00a105a0u,
  ISAAC_LUA_INSTALL_SITE_UNM_REAL_FN_VA = 0x00a10660u,
  ISAAC_LUA_INSTALL_SITE_TOSTRING_REAL_FN_VA = 0x0085e630u,
  /* v50 — FontRenderSettings install-run names / real fns. */
  ISAAC_LUA_INSTALL_SITE_GET_ALIGNMENT_NAME_VA = 0x00b702a0u,
  ISAAC_LUA_INSTALL_SITE_GET_ALIGNMENT_REAL_FN_VA = 0x0040c3a0u,
  ISAAC_LUA_INSTALL_SITE_SET_MAX_CHARACTERS_NAME_VA = 0x00b702b0u,
  ISAAC_LUA_INSTALL_SITE_SET_MAX_CHARACTERS_REAL_FN_VA = 0x00a1a5d0u,
  ISAAC_LUA_INSTALL_SITE_ENABLE_AUTO_WRAP_NAME_VA = 0x00b703a8u,
  ISAAC_LUA_INSTALL_SITE_ENABLE_AUTO_WRAP_REAL_FN_VA = 0x0085e450u,
  ISAAC_LUA_INSTALL_SITE_ENABLE_TRUNCATION_NAME_VA = 0x00b70380u,
  /* v51 names. */
  ISAAC_LUA_INSTALL_SITE_SET_ALIGNMENT_NAME_VA = 0x00b702d8u,
  ISAAC_LUA_INSTALL_SITE_GET_MAX_CHARACTERS_NAME_VA = 0x00b70394u,
  ISAAC_LUA_INSTALL_SITE_IS_AUTO_WRAP_ENABLED_NAME_VA = 0x00b7036cu,
  ISAAC_LUA_INSTALL_SITE_IS_TRUNCATION_ENABLED_NAME_VA = 0x00b70340u,
  ISAAC_LUA_INSTALL_SITE_SET_LINE_HEIGHT_MODIFIER_NAME_VA = 0x00b70354u,
  ISAAC_LUA_INSTALL_SITE_GET_LINE_HEIGHT_MODIFIER_NAME_VA = 0x00b7030cu,
  ISAAC_LUA_INSTALL_SITE_SET_MISSING_CHARACTER_OVERRIDE_NAME_VA = 0x00b70324u,
  ISAAC_LUA_INSTALL_SITE_GET_MISSING_CHARACTER_OVERRIDE_NAME_VA = 0x00b70408u,
  ISAAC_LUA_INSTALL_SITE_LOAD_NAME_VA = 0x00b703f8u,
  ISAAC_LUA_INSTALL_SITE_UNLOAD_NAME_VA = 0x00b70400u,
  ISAAC_LUA_INSTALL_SITE_IS_LOADED_NAME_VA = 0x00b703d8u,
  ISAAC_LUA_INSTALL_SITE_GET_CHARACTER_WIDTH_NAME_VA = 0x00b703e4u,
  ISAAC_LUA_INSTALL_SITE_GET_STRING_WIDTH_NAME_VA = 0x00b703b8u,
  ISAAC_LUA_INSTALL_SITE_GET_LINE_HEIGHT_NAME_VA = 0x00b703c8u,
  ISAAC_LUA_INSTALL_SITE_GET_BASELINE_HEIGHT_NAME_VA = 0x00b70454u,
  ISAAC_LUA_INSTALL_SITE_DRAW_STRING_NAME_VA = 0x00b70468u,
  ISAAC_LUA_INSTALL_SITE_SET_MISSING_CHARACTER_NAME_VA = 0x00b7043cu,
  ISAAC_LUA_INSTALL_SITE_ENABLE_TRUNCATION_REAL_FN_VA = 0x00a1a600u,
  /* v51 real-fn VAs (site rows 25..41). */
  ISAAC_LUA_INSTALL_SITE_SET_ALIGNMENT_REAL_FN_VA = 0x00a1a5c0u,
  ISAAC_LUA_INSTALL_SITE_GET_MAX_CHARACTERS_REAL_FN_VA = 0x00a1a5e0u,
  ISAAC_LUA_INSTALL_SITE_IS_AUTO_WRAP_ENABLED_REAL_FN_VA = 0x00a1a5f0u,
  ISAAC_LUA_INSTALL_SITE_IS_TRUNCATION_ENABLED_REAL_FN_VA = 0x00a1a620u,
  ISAAC_LUA_INSTALL_SITE_SET_LINE_HEIGHT_MODIFIER_REAL_FN_VA = 0x00407280u,
  ISAAC_LUA_INSTALL_SITE_GET_LINE_HEIGHT_MODIFIER_REAL_FN_VA = 0x00407270u,
  ISAAC_LUA_INSTALL_SITE_SET_MISSING_CHARACTER_OVERRIDE_REAL_FN_VA = 0x00a1a630u,
  ISAAC_LUA_INSTALL_SITE_GET_MISSING_CHARACTER_OVERRIDE_REAL_FN_VA = 0x0040c2e0u,
  ISAAC_LUA_INSTALL_SITE_LOAD_REAL_FN_VA = 0x0085e470u,
  ISAAC_LUA_INSTALL_SITE_UNLOAD_REAL_FN_VA = 0x00a1ad90u,
  ISAAC_LUA_INSTALL_SITE_IS_LOADED_REAL_FN_VA = 0x006b83d0u,
  ISAAC_LUA_INSTALL_SITE_GET_CHARACTER_WIDTH_REAL_FN_VA = 0x00a1ae70u,
  ISAAC_LUA_INSTALL_SITE_GET_STRING_WIDTH_REAL_FN_VA = 0x00a1ae80u,
  ISAAC_LUA_INSTALL_SITE_GET_LINE_HEIGHT_REAL_FN_VA = 0x00a1aea0u,
  ISAAC_LUA_INSTALL_SITE_GET_BASELINE_HEIGHT_REAL_FN_VA = 0x00a1aeb0u,
  ISAAC_LUA_INSTALL_SITE_DRAW_STRING_REAL_FN_VA = 0x00a1b140u,
  ISAAC_LUA_INSTALL_SITE_SET_MISSING_CHARACTER_REAL_FN_VA = 0x00a1b3b0u
};

/* ABI v47 — closure-install helper laws. */
int32_t isaac_lua_engine_install_helper_count(void);
uint32_t isaac_lua_engine_install_helper_va(int32_t index);
uint32_t isaac_lua_engine_install_helper_ret_va(int32_t index);
/* first ret - body VA (ret excluded, family convention). OOR -> 0. */
uint32_t isaac_lua_engine_install_helper_body_bytes(int32_t index);
int32_t isaac_lua_engine_install_helper_insn_count(int32_t index);
/* pushcclosure fn literal (the v45 wrapper pushed by this helper). */
uint32_t isaac_lua_engine_install_helper_wrapper_va(int32_t index);
/* ISAAC_LUA_INSTALL_SHAPE_DUAL / _DUAL_IMM (2 rawset chains) /
 * _SINGLE (1). OOR -> -1. */
int32_t isaac_lua_engine_install_helper_shape(int32_t index);
/* ISAAC_LUA_INSTALL_SOURCE_REGISTER / _IMMEDIATE for name and real_fn,
 * per-helper 14-row tables (ABI v50): REGISTER for DUAL rows
 * 0/1/4/5/9/10 AND the SINGLE-reg helper 13 (0x89fd80: name edx, ud[0]
 * [ebp+8]); IMMEDIATE for SINGLE-imm rows 2/3/6/7, DUAL_IMM rows
 * 8/11/12. */
int32_t isaac_lua_engine_install_helper_name_source(int32_t index);
int32_t isaac_lua_engine_install_helper_real_fn_source(int32_t index);
/* Immediate name / real_fn when the helper holds them (0 for duals). */
uint32_t isaac_lua_engine_install_helper_name_imm_va(int32_t index);
uint32_t isaac_lua_engine_install_helper_real_fn_imm_va(int32_t index);
/* Shared IAT-chain imm laws. */
uint32_t isaac_lua_engine_install_helper_newuserdata_size(void);
uint32_t isaac_lua_engine_install_helper_closure_nups(void);
/* lua_pushvalue(L, −1) @ 0x8a048f / 0x8a0532 (dual + dual-imm shapes). */
uint32_t isaac_lua_engine_install_helper_pushvalue_index(void);
/* absindex imms: dual chain 1 −5, chain 2 −3; single −3. */
uint32_t isaac_lua_engine_install_helper_dual_absindex_first(void);
uint32_t isaac_lua_engine_install_helper_dual_absindex_second(void);
uint32_t isaac_lua_engine_install_helper_single_absindex_index(void);
uint32_t isaac_lua_engine_install_helper_rotate_index(void);
uint32_t isaac_lua_engine_install_helper_rotate_n(void);
/* add esp stack-arg cleanups (host pushes). */
uint32_t isaac_lua_engine_install_helper_dual_cleanup_first(void);
uint32_t isaac_lua_engine_install_helper_dual_cleanup_second(void);
uint32_t isaac_lua_engine_install_helper_single_cleanup(void);
/* IAT slot pins. */
uint32_t isaac_lua_engine_install_helper_iat_newuserdata(void);
uint32_t isaac_lua_engine_install_helper_iat_pushcclosure(void);
uint32_t isaac_lua_engine_install_helper_iat_pushvalue(void);
uint32_t isaac_lua_engine_install_helper_iat_absindex(void);
uint32_t isaac_lua_engine_install_helper_iat_pushstring(void);
uint32_t isaac_lua_engine_install_helper_iat_rotate(void);
uint32_t isaac_lua_engine_install_helper_iat_rawset(void);

/* ABI v47 — per-site install records (21 Vector + 4 FontRenderSettings). */
int32_t isaac_lua_engine_install_site_count(void);
uint32_t isaac_lua_engine_install_site_call_va(int32_t index);
/* helper index for this site (0..13). OOR -> -1. */
int32_t isaac_lua_engine_install_site_helper_index(int32_t index);
uint32_t isaac_lua_engine_install_site_name_va(int32_t index);
uint32_t isaac_lua_engine_install_site_real_fn_va(int32_t index);
/* Reverse lookup callVa -> site index, -1 when unknown. */
int32_t isaac_lua_engine_install_site_index_for_call_va(uint32_t call_va);
/* rawset chain count for the site's helper (2 dual + dual-imm, 1 single).
 * OOR -> -1. */
int32_t isaac_lua_engine_install_site_chain_count(int32_t index);
/* Register-vs-immediate consume law (keys off the per-helper SOURCE
 * table, ABI v50): REGISTER helpers (DUAL rows + SINGLE-reg helper 13)
 * CONSUME the passed operand and return it unchanged — drive them with
 * WIDE UNMASKED values (0x100/0x1ff/0xffffffff); IMMEDIATE helpers
 * (SINGLE-imm + DUAL_IMM, incl. helper 12) ignore the operand and return
 * the body imm. OOR -> 0. */
uint32_t isaac_lua_engine_install_site_consumed_name_va(int32_t index,
                                                        uint32_t name_va);
uint32_t isaac_lua_engine_install_site_consumed_real_fn_va(
    int32_t index, uint32_t real_fn_va);
/* Total host stack-arg bytes the helper cleans (0x40+0x24 dual +
 * dual-imm, 0x38 single). OOR -> 0. */
uint32_t isaac_lua_engine_install_site_stack_arg_bytes_total(int32_t index);

/* ---------------------------------------------------------------------------
 * ABI v48 — wrapper BODIES 0x8a8310..0x8a88f0 (9 closures) + helper
 * 0x8ba890 getArgVector.
 *
 * The pushcclosure closure bodies installed by helpers 3..11 (v47). v45
 * landed the first three of the band (0x8a8180 / 0x8a81d0 / 0x8a8270);
 * this unit lands the remaining nine, one C++ template with per-site laws
 * (same shared arg conduct as v45):
 *   L=[ebp+8]; lua_type(L,1) @0xb18400; test eax,eax FULL-WORD; je zero:
 *     obj1=0; else push CHECK_FLAGS; push 0xc82980; mov edx,1; ecx=L;
 *     call 0x85c590; obj1=[eax+4]; lua_touserdata(L, 0xfff0b9d7)
 *     @0xb183b0; fn=ud[0]; per-wrapper arg conduct -> ud[0](obj1,...)
 *     -> per-wrapper tail.
 *
 * | w | VA        | insns | ret       | flags | arg2/arg3/arg4        | tail        | ret |
 * |---|-----------|-------|-----------|-------|-----------------------|-------------|-----|
 * | 0 | 0x8a8310  | 87    | 0x8a8412  | 0     | getArgObject(2) vec2; | BOX8        | 1   |
 * |   |           |       |           |       | checknumber(3) f32;   | (0xb753c8 / |     |
 * |   |           |       |           |       | toboolean(4) flag     | 0xc8297f)   |     |
 * | 1 | 0x8a8430  | 82    | 0x8a8508  | 1     | checknumber(2) f32    | BOX10       | 1   |
 * | 2 | 0x8a8510  | 50    | 0x8a8578  | 1     | —                     | FLOAT       | 1   |
 * | 3 | 0x8a8580  | 60    | 0x8a8601  | 0     | checknumber(2) f32    | VOID        | 0   |
 * | 4 | 0x8a8610  | 51    | 0x8a867f  | 0     | getArgVector 0x8ba890 | VOID        | 0   |
 * | 5 | 0x8a8680  | 75    | 0x8a873b  | 1     | getArgVector 0x8ba890 | BOX10       | 1   |
 * | 6 | 0x8a8740  | 78    | 0x8a880e  | 1     | getArgObject(2) vec2  | BOX10       | 1   |
 * | 7 | 0x8a8810  | 85    | 0x8a88e2  | 1     | checknumber(2) f32    | BOX10       | 1   |
 * | 8 | 0x8a88f0  | 42    | 0x8a8951  | 1     | —                     | PUSHSTRING  | 1   |
 *
 * Tails (branch-by-branch):
 *   BOX10 (w 1,5,6,7 — Rotated/Clamped/__add/__mul family, same as v45
 *     wrapper #2): lua_newuserdata(L,0x10) @0xb1839c; newud[0]=0xb73574
 *     (vtable tag); newud[4]=&newud[8] (payload self-ptr); lua_rawgetp(L,
 *     0xfff0b9d8, 0xc82980) @0xb183bc (metatable push); lua_setmetatable
 *     (L,-2) @0xb18398; payload {lo,hi} = fn 8-byte ret -> newud[8]; ret 1.
 *   BOX8 (w 0 — Lerp): fn returns a POINTER; test FULL-WORD; je ->
 *     lua_pushnil @0xb183e0, ret 1; else lua_newuserdata(L,8) @0xb1839c;
 *     newud[0]=0xb753c8 (DIFFERENT vtable tag); newud[4]=fn ret ptr;
 *     rawgetp key 0xc8297f (DIFFERENT metatable key); setmetatable -2;
 *     ret 1.
 *   FLOAT (w 2 — GetAngleDegrees/Length): fn returns double in ST0;
 *     fstp dword [ebp-4] (float32 narrowing); movss xmm1; call 0x85c050
 *     (pushNumber, landed v45); ret 1.
 *   VOID (w 3,4 — Resize/Clamp): ud[0](obj1[, vec16]) then xor eax,eax;
 *     ret 0.
 *   PUSHSTRING (w 8 — __tostring): fn returns str ptr; test FULL-WORD;
 *     je -> lua_pushnil @0xb183e0, ret 1; else lua_pushstring(L,str)
 *     @0xb18414, ret 1.
 *
 * Helper 0x8ba890 getArgVector (used by w 4,5): thiscall ecx=OUT (20B),
 * cdecl stack arg L, ret 4 cleans it. Calls luaL_checknumber(L, idx)
 * @0xb18324 in CALL ORDER 5,4,3,2; out[0]=f32(ck2), out[4]=f32(ck3),
 * out[8]=f32(ck4), out[12]=f32(ck5), out[16]=L (dead dword). Callers read
 * the first 16 bytes (movups -> by-value vec4 arg to ud[0]).
 * ------------------------------------------------------------------------- */

enum {
  /* local wrapper index 0..8 = install-helper VAs 0x8a8310..0x8a88f0
   * (LUA_INSTALL_HELPER_WRAPPER_VAS[3..11] linkage law, asserted). */
  ISAAC_LUA_WRAPPER_COUNT = 9,
  ISAAC_LUA_WRAPPER_0_VA = 0x008a8310u,
  ISAAC_LUA_WRAPPER_1_VA = 0x008a8430u,
  ISAAC_LUA_WRAPPER_2_VA = 0x008a8510u,
  ISAAC_LUA_WRAPPER_3_VA = 0x008a8580u,
  ISAAC_LUA_WRAPPER_4_VA = 0x008a8610u,
  ISAAC_LUA_WRAPPER_5_VA = 0x008a8680u,
  ISAAC_LUA_WRAPPER_6_VA = 0x008a8740u,
  ISAAC_LUA_WRAPPER_7_VA = 0x008a8810u,
  ISAAC_LUA_WRAPPER_8_VA = 0x008a88f0u,
  ISAAC_LUA_WRAPPER_0_RET_VA = 0x008a8412u,
  ISAAC_LUA_WRAPPER_1_RET_VA = 0x008a8508u,
  ISAAC_LUA_WRAPPER_2_RET_VA = 0x008a8578u,
  ISAAC_LUA_WRAPPER_3_RET_VA = 0x008a8601u,
  ISAAC_LUA_WRAPPER_4_RET_VA = 0x008a867fu,
  ISAAC_LUA_WRAPPER_5_RET_VA = 0x008a873bu,
  ISAAC_LUA_WRAPPER_6_RET_VA = 0x008a880eu,
  ISAAC_LUA_WRAPPER_7_RET_VA = 0x008a88e2u,
  ISAAC_LUA_WRAPPER_8_RET_VA = 0x008a8951u,
  ISAAC_LUA_WRAPPER_0_INSNS = 87,
  ISAAC_LUA_WRAPPER_1_INSNS = 82,
  ISAAC_LUA_WRAPPER_2_INSNS = 50,
  ISAAC_LUA_WRAPPER_3_INSNS = 60,
  ISAAC_LUA_WRAPPER_4_INSNS = 51,
  ISAAC_LUA_WRAPPER_5_INSNS = 75,
  ISAAC_LUA_WRAPPER_6_INSNS = 78,
  ISAAC_LUA_WRAPPER_7_INSNS = 85,
  ISAAC_LUA_WRAPPER_8_INSNS = 42,
  /* per-wrapper check-helper flags (push imm before key 0xc82980). */
  ISAAC_LUA_WRAPPER_0_CHECK_FLAGS = 0x00,
  ISAAC_LUA_WRAPPER_1_CHECK_FLAGS = 0x01,
  ISAAC_LUA_WRAPPER_2_CHECK_FLAGS = 0x01,
  ISAAC_LUA_WRAPPER_3_CHECK_FLAGS = 0x00,
  ISAAC_LUA_WRAPPER_4_CHECK_FLAGS = 0x00,
  ISAAC_LUA_WRAPPER_5_CHECK_FLAGS = 0x01,
  ISAAC_LUA_WRAPPER_6_CHECK_FLAGS = 0x01,
  ISAAC_LUA_WRAPPER_7_CHECK_FLAGS = 0x01,
  ISAAC_LUA_WRAPPER_8_CHECK_FLAGS = 0x01,
  /* per-wrapper Lua return value. */
  ISAAC_LUA_WRAPPER_0_RETURN_VALUE = 1,
  ISAAC_LUA_WRAPPER_1_RETURN_VALUE = 1,
  ISAAC_LUA_WRAPPER_2_RETURN_VALUE = 1,
  ISAAC_LUA_WRAPPER_3_RETURN_VALUE = 0,
  ISAAC_LUA_WRAPPER_4_RETURN_VALUE = 0,
  ISAAC_LUA_WRAPPER_5_RETURN_VALUE = 1,
  ISAAC_LUA_WRAPPER_6_RETURN_VALUE = 1,
  ISAAC_LUA_WRAPPER_7_RETURN_VALUE = 1,
  ISAAC_LUA_WRAPPER_8_RETURN_VALUE = 1,
  /* arg2/arg3 conduct kinds. */
  ISAAC_LUA_WRAPPER_ARG2_NONE = 0,
  ISAAC_LUA_WRAPPER_ARG2_CHECKNUMBER_F32 = 1,
  ISAAC_LUA_WRAPPER_ARG2_GET_ARG_OBJECT_VEC2 = 2,
  ISAAC_LUA_WRAPPER_ARG2_GET_ARG_VECTOR = 3,
  ISAAC_LUA_WRAPPER_ARG3_NONE = 0,
  ISAAC_LUA_WRAPPER_ARG3_CHECKNUMBER_F32 = 1,
  /* tail kinds. */
  ISAAC_LUA_WRAPPER_TAIL_BOX10 = 0,
  ISAAC_LUA_WRAPPER_TAIL_BOX8 = 1,
  ISAAC_LUA_WRAPPER_TAIL_FLOAT = 2,
  ISAAC_LUA_WRAPPER_TAIL_VOID = 3,
  ISAAC_LUA_WRAPPER_TAIL_PUSHSTRING = 4,
  /* shared arg conduct (all 9 wrappers; typed by table below). */
  ISAAC_LUA_WRAPPER_TYPE_INDEX = 0x01,
  ISAAC_LUA_WRAPPER_CHECK_STACK_INDEX = 0x01,
  ISAAC_LUA_WRAPPER_REGISTRY_KEY = 0x00c82980u,
  ISAAC_LUA_WRAPPER_OBJECT_FIELD_OFF = 0x04,
  ISAAC_LUA_WRAPPER_TOUSERDATA_INDEX_U32 = 0xfff0b9d7u,
  ISAAC_LUA_WRAPPER_FN_OFF = 0x00,
  /* E8 helpers (all landed: 0x85c590 v11/v12, 0x8baa50 + 0x85c050 v45). */
  ISAAC_LUA_WRAPPER_CHECK_HELPER_VA = 0x0085c590u,
  ISAAC_LUA_WRAPPER_GET_ARG_OBJECT_VA = 0x008baa50u,
  ISAAC_LUA_WRAPPER_PUSH_NUMBER_VA = 0x0085c050u,
  /* host IAT pins (lua-v16/iat.txt). */
  ISAAC_LUA_WRAPPER_IAT_LUA_TYPE = 0x00b18400u,
  ISAAC_LUA_WRAPPER_IAT_LUA_TOUSERDATA = 0x00b183b0u,
  ISAAC_LUA_WRAPPER_IAT_LUA_CHECKNUMBER = 0x00b18324u,
  ISAAC_LUA_WRAPPER_IAT_LUA_TOBOOLEAN = 0x00b183e8u,
  /* BOX10 tail constants (w 1,5,6,7 — same as v45 wrapper #2 0x8a81d0). */
  ISAAC_LUA_WRAPPER_BOX10_NEWUSERDATA_SIZE = 0x10,
  ISAAC_LUA_WRAPPER_BOX10_VTABLE_TAG_VA = 0x00b73574u,
  ISAAC_LUA_WRAPPER_BOX10_PAYLOAD_SELF_OFF = 0x04,
  ISAAC_LUA_WRAPPER_BOX10_PAYLOAD_OFF = 0x08,
  ISAAC_LUA_WRAPPER_BOX10_METATABLE_RAWGETP_KEY = 0x00c82980u,
  ISAAC_LUA_WRAPPER_BOX10_REGISTRY_INDEX_U32 = 0xfff0b9d8u,
  ISAAC_LUA_WRAPPER_BOX10_SETMETA_INDEX_U32 = 0xfffffffeu, /* -2 */
  ISAAC_LUA_WRAPPER_BOX10_PAYLOAD_LO_OFF = 0x00,
  ISAAC_LUA_WRAPPER_BOX10_PAYLOAD_HI_OFF = 0x04,
  /* BOX8 tail constants (w 0 — Lerp; DIFFERENT vtable + metatable key). */
  ISAAC_LUA_WRAPPER_BOX8_NEWUSERDATA_SIZE = 0x08,
  ISAAC_LUA_WRAPPER_BOX8_VTABLE_TAG_VA = 0x00b753c8u,
  ISAAC_LUA_WRAPPER_BOX8_PAYLOAD_OFF = 0x04,
  ISAAC_LUA_WRAPPER_BOX8_METATABLE_RAWGETP_KEY = 0x00c8297fu,
  ISAAC_LUA_WRAPPER_BOX8_REGISTRY_INDEX_U32 = 0xfff0b9d8u,
  ISAAC_LUA_WRAPPER_BOX8_SETMETA_INDEX_U32 = 0xfffffffeu, /* -2 */
  /* FLOAT tail (w 2): fn double in ST0 -> fstp dword [ebp-4]. */
  ISAAC_LUA_WRAPPER_FLOAT_SLOT_STACK_OFF = 0xfffffffcu, /* [ebp-4] = -4 */
  /* PUSHSTRING tail (w 8). */
  ISAAC_LUA_WRAPPER_PUSHSTRING_IAT_LUA_PUSHSTRING = 0x00b18414u,
  ISAAC_LUA_WRAPPER_PUSHSTRING_IAT_LUA_PUSHNIL = 0x00b183e0u,
  /* helper 0x8ba890 getArgVector (w 4,5). */
  ISAAC_LUA_WRAPPER_GET_ARG_VECTOR_VA = 0x008ba890u,
  ISAAC_LUA_WRAPPER_GET_ARG_VECTOR_RET_VA = 0x008ba8f6u,
  ISAAC_LUA_WRAPPER_GET_ARG_VECTOR_INSNS = 51,
  ISAAC_LUA_WRAPPER_GET_ARG_VECTOR_IAT_LUA_CHECKNUMBER = 0x00b18324u,
  /* call order: luaL_checknumber(L, idx) for idx in [5,4,3,2] (head
   * first). out[0]=f32(ck2), out[4]=f32(ck3), out[8]=f32(ck4),
   * out[12]=f32(ck5), out[16]=L (dead upper dword). */
  ISAAC_LUA_WRAPPER_GET_ARG_VECTOR_CALL_ORDER_0 = 5,
  ISAAC_LUA_WRAPPER_GET_ARG_VECTOR_CALL_ORDER_1 = 4,
  ISAAC_LUA_WRAPPER_GET_ARG_VECTOR_CALL_ORDER_2 = 3,
  ISAAC_LUA_WRAPPER_GET_ARG_VECTOR_CALL_ORDER_3 = 2,
  ISAAC_LUA_WRAPPER_GET_ARG_VECTOR_OUT_F32_COUNT = 4,
  ISAAC_LUA_WRAPPER_GET_ARG_VECTOR_OUT_F32_STRIDE = 4,
  ISAAC_LUA_WRAPPER_GET_ARG_VECTOR_OUT_L_PTR_OFF = 0x10,
  ISAAC_LUA_WRAPPER_GET_ARG_VECTOR_RET_ARGS = 4
};

/* ABI v48 — wrapper body laws. */
int32_t isaac_lua_engine_wrapper_count(void);
uint32_t isaac_lua_engine_wrapper_va(int32_t index);
uint32_t isaac_lua_engine_wrapper_ret_va(int32_t index);
/* first ret - body VA (ret excluded, family convention). OOR -> 0. */
uint32_t isaac_lua_engine_wrapper_body_bytes(int32_t index);
int32_t isaac_lua_engine_wrapper_insn_count(int32_t index);
int32_t isaac_lua_engine_wrapper_check_flags(int32_t index);
int32_t isaac_lua_engine_wrapper_return_value(int32_t index);
/* ISAAC_LUA_WRAPPER_ARG2_* kind. OOR -> -1. */
int32_t isaac_lua_engine_wrapper_arg2_kind(int32_t index);
/* Lua stack index for the arg2 read (2 for checknumber/getArgObject;
 * getArgVector reads 2..5 via the helper; 0 for NONE). OOR -> -1. */
int32_t isaac_lua_engine_wrapper_arg2_index(int32_t index);
/* ISAAC_LUA_WRAPPER_ARG3_* kind (0 = none). OOR -> -1. */
int32_t isaac_lua_engine_wrapper_arg3_kind(int32_t index);
int32_t isaac_lua_engine_wrapper_arg3_index(int32_t index);
/* arg4 is the Lerp toboolean(L,4) read; 0 on all others. OOR -> -1. */
int32_t isaac_lua_engine_wrapper_arg4_index(int32_t index);
/* ISAAC_LUA_WRAPPER_TAIL_* kind. OOR -> -1. */
int32_t isaac_lua_engine_wrapper_tail_kind(int32_t index);
/* Shared arg conduct. */
uint32_t isaac_lua_engine_wrapper_type_index(void);
uint32_t isaac_lua_engine_wrapper_check_stack_index(void);
uint32_t isaac_lua_engine_wrapper_registry_key(void);
uint32_t isaac_lua_engine_wrapper_object_field_off(void);
uint32_t isaac_lua_engine_wrapper_touserdata_index(void);
uint32_t isaac_lua_engine_wrapper_fn_off(void);
uint32_t isaac_lua_engine_wrapper_check_helper_va(void);
uint32_t isaac_lua_engine_wrapper_get_arg_object_va(void);
uint32_t isaac_lua_engine_wrapper_push_number_va(void);
uint32_t isaac_lua_engine_wrapper_iat_lua_type(void);
uint32_t isaac_lua_engine_wrapper_iat_lua_touserdata(void);
uint32_t isaac_lua_engine_wrapper_iat_lua_checknumber(void);
uint32_t isaac_lua_engine_wrapper_iat_lua_toboolean(void);
/* Registry ref-set decision: PE `test eax,eax; je obj_zero` FULL-WORD.
 * obj = (type != 0) ? check_field : 0. Drive UNMASKED. */
uint32_t isaac_lua_engine_wrapper_object_resolve(uint32_t type_result,
                                                 uint32_t check_field);
/* arg2 getArgObject law (w 0,6): type==0 -> error (ret 0); else
 * obj=check_field; obj==0 -> error again; else return obj. The full-word
 * gates mirror the v45 setref-successor law on the same helper 0x8baa50. */
uint32_t isaac_lua_engine_wrapper_arg2_get_arg_object(
    uint32_t type_result, uint32_t check_field);
/* arg4 toboolean flag law (w 0): PE `test eax,eax; setne byte` on the
 * lua_toboolean(L,4) result -> 0/1. FULL-WORD, never byte-masked. */
uint32_t isaac_lua_engine_wrapper_toboolean_flag(uint32_t toboolean_result);
/* FLOAT tail narrowing: `fstp dword` takes the fn's double ret in ST0 and
 * stores float32. Exact double-bits -> f32-bits (round-to-nearest-even,
 * the x87 default). Finite/inf/zero; NaN payload unspecified. */
uint32_t isaac_lua_engine_wrapper_float_f32_bits(uint32_t hi, uint32_t lo);
/* getArgVector helpers: out position p (0..3) reads luaL_checknumber(L,
 * p+2); the CALL ORDER is [5,4,3,2] (head first). OOR -> 0. */
int32_t isaac_lua_engine_wrapper_get_arg_vector_va(void);
int32_t isaac_lua_engine_wrapper_get_arg_vector_ret_va(void);
int32_t isaac_lua_engine_wrapper_get_arg_vector_body_bytes(void);
int32_t isaac_lua_engine_wrapper_get_arg_vector_insn_count(void);
int32_t isaac_lua_engine_wrapper_get_arg_vector_call_order_at(
    int32_t position);
int32_t isaac_lua_engine_wrapper_get_arg_vector_index_at(int32_t position);
int32_t isaac_lua_engine_wrapper_get_arg_vector_out_f32_count(void);
int32_t isaac_lua_engine_wrapper_get_arg_vector_out_stride(void);
int32_t isaac_lua_engine_wrapper_get_arg_vector_out_l_ptr_off(void);
int32_t isaac_lua_engine_wrapper_get_arg_vector_ret_args(void);
/* BOX10/BOX8/FLOAT/PUSHSTRING constants. */
uint32_t isaac_lua_engine_wrapper_box10_newuserdata_size(void);
uint32_t isaac_lua_engine_wrapper_box10_vtable_tag_va(void);
uint32_t isaac_lua_engine_wrapper_box10_payload_self_off(void);
uint32_t isaac_lua_engine_wrapper_box10_payload_off(void);
uint32_t isaac_lua_engine_wrapper_box10_metatable_rawgetp_key(void);
uint32_t isaac_lua_engine_wrapper_box10_registry_index(void);
uint32_t isaac_lua_engine_wrapper_box10_setmeta_index(void);
uint32_t isaac_lua_engine_wrapper_box10_payload_lo_off(void);
uint32_t isaac_lua_engine_wrapper_box10_payload_hi_off(void);
uint32_t isaac_lua_engine_wrapper_box8_newuserdata_size(void);
uint32_t isaac_lua_engine_wrapper_box8_vtable_tag_va(void);
uint32_t isaac_lua_engine_wrapper_box8_payload_off(void);
uint32_t isaac_lua_engine_wrapper_box8_metatable_rawgetp_key(void);
uint32_t isaac_lua_engine_wrapper_box8_registry_index(void);
uint32_t isaac_lua_engine_wrapper_box8_setmeta_index(void);
uint32_t isaac_lua_engine_wrapper_float_slot_stack_off(void);
uint32_t isaac_lua_engine_wrapper_pushstring_iat_lua_pushstring(void);
uint32_t isaac_lua_engine_wrapper_pushstring_iat_lua_pushnil(void);

/* ---------------------------------------------------------------------------
 * ABI v49 — FontRenderSettings accessor wrapper BODIES 0x008a89e0
 * (GetAlignment) + 0x008a8a40 (SetMaxCharacters / EnableAutoWrap /
 * EnableTruncation).
 *
 * Shared arg conduct (both): L=[ebp+8]; lua_type(L,1) @0xb18400; FULL-WORD
 * gate (0 -> obj=0, skip check); else push CHKFLAGS; push 0xc82986 (NEW
 * registry key — the FontRenderSettings identity key, +6 vs the v48 Vector
 * key 0xc82980); edx=1; ecx=L; call 0x85c590; obj=[eax+4]; touserdata
 * (L, upvalueindex(1) 0xfff0b9d7) @0xb183b0; fn=ud[0]; per-wrapper
 * conduct/tail.
 *   GetAlignment (0x8a89e0, CHKFLAGS=1): ud[0](obj) -> i32 eax; cdq
 *     sign-extend; lua_pushinteger(L, {hi,lo}) @0xb183f8; cleanup 0xc;
 *     ret 1.
 *   Setter (0x8a8a40, CHKFLAGS=0): luaL_checkinteger(L,2) @0xb183f4
 *     (call order: touserdata first; combined cleanup 0x10);
 *     movzx edx, ax — LOW-WORD (16-bit) zero-extend; ud[0](obj, word);
 *     xor eax,eax; ret 0.
 * Reachability: each wrapper VA is the pushcclosure fn literal in the
 * .text install helper body (0x8a89e0 @ 0x89fdf7 inside DUAL_IMM helper
 * 0x89fde0; 0x8a8a40 @ 0x89fd99 inside SINGLE helper 0x89fd80) — the
 * only 32-bit LE occurrences in the whole image. E8 sites: 0x866dcc ->
 * 0x89fde0 (GetAlignment, name 0xb702a0, real_fn 0x40c3a0);
 * 0x866de1/0x866e0b/0x866e35 -> 0x89fd80 (SetMaxCharacters 0xb702b0/
 * 0xa1a5d0, EnableAutoWrap 0xb703a8/0x85e450, EnableTruncation 0xb70380/
 * 0xa1a600). All lua_* IAT + the check/get 0x85c590 body + the real_fn
 * stay host. No uint8_t scalar params.
 * ------------------------------------------------------------------------- */

enum {
  /* 0 = GetAlignment (int getter), 1 = SetMaxCharacters-family setter
   * (v49); 2..14 = v51 band bodies (0x8a8970 SetAlignment/
   * SetMissingCharacterOverride shared wrapper, 0x8a8ab0 GetMaxCharacters,
   * 0x8a8b10 IsAutoWrapEnabled/IsTruncationEnabled, 0x8a8b80
   * SetLineHeightModifier, 0x8a8c10 GetLineHeightModifier, 0x8a8c80
   * GetMissingCharacterOverride, 0x8a8ce0 Load, 0x8a8d80 Unload, 0x8a8dd0
   * IsLoaded, 0x8a8e40 GetCharacterWidth, 0x8a8ec0 GetStringWidth, 0x8a8f60
   * GetLineHeight/GetBaselineHeight, 0x8a9180 SetMissingCharacter).
   * 0x8a8fc0 DrawString LANDED at v52 (SEH + float-vector marshaling
   * laws; wrapper + vec helper + getRef). */
  ISAAC_LUA_FONTSETTINGS_WRAPPER_COUNT = 15,
  ISAAC_LUA_FONTSETTINGS_WRAPPER_0_VA = 0x008a89e0u,
  ISAAC_LUA_FONTSETTINGS_WRAPPER_1_VA = 0x008a8a40u,
  ISAAC_LUA_FONTSETTINGS_WRAPPER_2_VA = 0x008a8970u,
  ISAAC_LUA_FONTSETTINGS_WRAPPER_3_VA = 0x008a8ab0u,
  ISAAC_LUA_FONTSETTINGS_WRAPPER_4_VA = 0x008a8b10u,
  ISAAC_LUA_FONTSETTINGS_WRAPPER_5_VA = 0x008a8b80u,
  ISAAC_LUA_FONTSETTINGS_WRAPPER_6_VA = 0x008a8c10u,
  ISAAC_LUA_FONTSETTINGS_WRAPPER_7_VA = 0x008a8c80u,
  ISAAC_LUA_FONTSETTINGS_WRAPPER_8_VA = 0x008a8ce0u, /* Load */
  ISAAC_LUA_FONTSETTINGS_WRAPPER_9_VA = 0x008a8d80u,
  ISAAC_LUA_FONTSETTINGS_WRAPPER_10_VA = 0x008a8dd0u,
  ISAAC_LUA_FONTSETTINGS_WRAPPER_11_VA = 0x008a8e40u,
  ISAAC_LUA_FONTSETTINGS_WRAPPER_12_VA = 0x008a8ec0u,
  ISAAC_LUA_FONTSETTINGS_WRAPPER_13_VA = 0x008a8f60u,
  ISAAC_LUA_FONTSETTINGS_WRAPPER_14_VA = 0x008a9180u,
  ISAAC_LUA_FONTSETTINGS_WRAPPER_0_RET_VA = 0x008a8a3fu,
  ISAAC_LUA_FONTSETTINGS_WRAPPER_1_RET_VA = 0x008a8aa0u,
  ISAAC_LUA_FONTSETTINGS_WRAPPER_2_RET_VA = 0x008a89dbu,
  ISAAC_LUA_FONTSETTINGS_WRAPPER_3_RET_VA = 0x008a8b0bu,
  ISAAC_LUA_FONTSETTINGS_WRAPPER_4_RET_VA = 0x008a8b74u,
  ISAAC_LUA_FONTSETTINGS_WRAPPER_5_RET_VA = 0x008a8c01u,
  ISAAC_LUA_FONTSETTINGS_WRAPPER_6_RET_VA = 0x008a8c78u,
  ISAAC_LUA_FONTSETTINGS_WRAPPER_7_RET_VA = 0x008a8cdbu,
  ISAAC_LUA_FONTSETTINGS_WRAPPER_8_RET_VA = 0x008a8d75u,
  ISAAC_LUA_FONTSETTINGS_WRAPPER_9_RET_VA = 0x008a8dcfu,
  ISAAC_LUA_FONTSETTINGS_WRAPPER_10_RET_VA = 0x008a8e34u,
  ISAAC_LUA_FONTSETTINGS_WRAPPER_11_RET_VA = 0x008a8eb5u,
  ISAAC_LUA_FONTSETTINGS_WRAPPER_12_RET_VA = 0x008a8f51u,
  ISAAC_LUA_FONTSETTINGS_WRAPPER_13_RET_VA = 0x008a8fbbu,
  ISAAC_LUA_FONTSETTINGS_WRAPPER_14_RET_VA = 0x008a91ebu,
  /* Load's MID-BODY RET TRAP: `jne 0x8a8d54` @0x8a8d3e branches past the
   * nil-path ret at 0x8a8d53 to the string tail; the true tail ret is
   * 0x8a8d75 (0x8a8d76 int3). 0 for every other wrapper. */
  ISAAC_LUA_FONTSETTINGS_WRAPPER_8_FIRST_RET_VA = 0x008a8d53u,
  ISAAC_LUA_FONTSETTINGS_WRAPPER_0_INSNS = 38,
  ISAAC_LUA_FONTSETTINGS_WRAPPER_1_INSNS = 55,
  ISAAC_LUA_FONTSETTINGS_WRAPPER_2_INSNS = 52,
  ISAAC_LUA_FONTSETTINGS_WRAPPER_3_INSNS = 46,
  ISAAC_LUA_FONTSETTINGS_WRAPPER_4_INSNS = 53,
  ISAAC_LUA_FONTSETTINGS_WRAPPER_5_INSNS = 60,
  ISAAC_LUA_FONTSETTINGS_WRAPPER_6_INSNS = 51,
  ISAAC_LUA_FONTSETTINGS_WRAPPER_7_INSNS = 45,
  ISAAC_LUA_FONTSETTINGS_WRAPPER_8_INSNS = 62,
  ISAAC_LUA_FONTSETTINGS_WRAPPER_9_INSNS = 40,
  ISAAC_LUA_FONTSETTINGS_WRAPPER_10_INSNS = 53,
  ISAAC_LUA_FONTSETTINGS_WRAPPER_11_INSNS = 60,
  ISAAC_LUA_FONTSETTINGS_WRAPPER_12_INSNS = 67,
  ISAAC_LUA_FONTSETTINGS_WRAPPER_13_INSNS = 44,
  ISAAC_LUA_FONTSETTINGS_WRAPPER_14_INSNS = 52,
  /* per-wrapper check-helper flags (push imm before the registry key). */
  ISAAC_LUA_FONTSETTINGS_WRAPPER_0_CHECK_FLAGS = 0x01,
  ISAAC_LUA_FONTSETTINGS_WRAPPER_1_CHECK_FLAGS = 0x00,
  ISAAC_LUA_FONTSETTINGS_WRAPPER_2_CHECK_FLAGS = 0x00,
  ISAAC_LUA_FONTSETTINGS_WRAPPER_3_CHECK_FLAGS = 0x01,
  ISAAC_LUA_FONTSETTINGS_WRAPPER_4_CHECK_FLAGS = 0x01,
  ISAAC_LUA_FONTSETTINGS_WRAPPER_5_CHECK_FLAGS = 0x00,
  ISAAC_LUA_FONTSETTINGS_WRAPPER_6_CHECK_FLAGS = 0x01,
  ISAAC_LUA_FONTSETTINGS_WRAPPER_7_CHECK_FLAGS = 0x01,
  ISAAC_LUA_FONTSETTINGS_WRAPPER_8_CHECK_FLAGS = 0x00,
  ISAAC_LUA_FONTSETTINGS_WRAPPER_9_CHECK_FLAGS = 0x00,
  ISAAC_LUA_FONTSETTINGS_WRAPPER_10_CHECK_FLAGS = 0x01,
  ISAAC_LUA_FONTSETTINGS_WRAPPER_11_CHECK_FLAGS = 0x01,
  ISAAC_LUA_FONTSETTINGS_WRAPPER_12_CHECK_FLAGS = 0x01,
  ISAAC_LUA_FONTSETTINGS_WRAPPER_13_CHECK_FLAGS = 0x01,
  ISAAC_LUA_FONTSETTINGS_WRAPPER_14_CHECK_FLAGS = 0x00,
  /* per-wrapper Lua return value. */
  ISAAC_LUA_FONTSETTINGS_WRAPPER_0_RETURN_VALUE = 1,
  ISAAC_LUA_FONTSETTINGS_WRAPPER_1_RETURN_VALUE = 0,
  ISAAC_LUA_FONTSETTINGS_WRAPPER_2_RETURN_VALUE = 0,
  ISAAC_LUA_FONTSETTINGS_WRAPPER_3_RETURN_VALUE = 1,
  ISAAC_LUA_FONTSETTINGS_WRAPPER_4_RETURN_VALUE = 1,
  ISAAC_LUA_FONTSETTINGS_WRAPPER_5_RETURN_VALUE = 0,
  ISAAC_LUA_FONTSETTINGS_WRAPPER_6_RETURN_VALUE = 1,
  ISAAC_LUA_FONTSETTINGS_WRAPPER_7_RETURN_VALUE = 1,
  ISAAC_LUA_FONTSETTINGS_WRAPPER_8_RETURN_VALUE = 0,
  ISAAC_LUA_FONTSETTINGS_WRAPPER_9_RETURN_VALUE = 0,
  ISAAC_LUA_FONTSETTINGS_WRAPPER_10_RETURN_VALUE = 1,
  ISAAC_LUA_FONTSETTINGS_WRAPPER_11_RETURN_VALUE = 1,
  ISAAC_LUA_FONTSETTINGS_WRAPPER_12_RETURN_VALUE = 1,
  ISAAC_LUA_FONTSETTINGS_WRAPPER_13_RETURN_VALUE = 1,
  ISAAC_LUA_FONTSETTINGS_WRAPPER_14_RETURN_VALUE = 0,
  /* arg2 kinds. */
  ISAAC_LUA_FONTSETTINGS_WRAPPER_ARG2_NONE = 0,
  ISAAC_LUA_FONTSETTINGS_WRAPPER_ARG2_CHECKINTEGER_LOWW = 1,
  ISAAC_LUA_FONTSETTINGS_WRAPPER_ARG2_CHECKINTEGER_FULLWORD = 2,
  ISAAC_LUA_FONTSETTINGS_WRAPPER_ARG2_CHECKNUMBER_F32 = 3,
  ISAAC_LUA_FONTSETTINGS_WRAPPER_ARG2_CHECKLSTRING_GATED = 4,
  ISAAC_LUA_FONTSETTINGS_WRAPPER_ARG2_CHECKLSTRING_BYTE = 5,
  /* tail kinds. */
  ISAAC_LUA_FONTSETTINGS_WRAPPER_TAIL_PUSHINTEGER = 0,
  ISAAC_LUA_FONTSETTINGS_WRAPPER_TAIL_VOID = 1,
  ISAAC_LUA_FONTSETTINGS_WRAPPER_TAIL_PUSHBOOLEAN = 2,
  ISAAC_LUA_FONTSETTINGS_WRAPPER_TAIL_PUSHINT_HELPER = 3,
  ISAAC_LUA_FONTSETTINGS_WRAPPER_TAIL_PUSHNUMBER_F32 = 4,
  ISAAC_LUA_FONTSETTINGS_WRAPPER_TAIL_PUSHINTEGER_HI0 = 5,
  /* per-row tail helper slots (0 for IAT-less/void tails). */
  ISAAC_LUA_FONTSETTINGS_WRAPPER_3_TAIL_HELPER_VA = 0x0085c010u, /* push-u16-zext */
  ISAAC_LUA_FONTSETTINGS_WRAPPER_4_TAIL_HELPER_VA = 0x00b183ecu, /* pushboolean */
  ISAAC_LUA_FONTSETTINGS_WRAPPER_6_TAIL_HELPER_VA = 0x0085c050u, /* pushNumber */
  ISAAC_LUA_FONTSETTINGS_WRAPPER_7_TAIL_HELPER_VA = 0x0085bff0u, /* push-u32-zext */
  ISAAC_LUA_FONTSETTINGS_WRAPPER_10_TAIL_HELPER_VA = 0x00b183ecu,
  ISAAC_LUA_FONTSETTINGS_WRAPPER_11_TAIL_HELPER_VA = 0x0085bff0u,
  ISAAC_LUA_FONTSETTINGS_WRAPPER_12_TAIL_HELPER_VA = 0x00b183f8u, /* pushinteger */
  ISAAC_LUA_FONTSETTINGS_WRAPPER_13_TAIL_HELPER_VA = 0x0085bff0u,
  /* per-row registry keys: first band (indices 0..7) 0xc82986, Load band
   * (8..14) 0xc82989. */
  ISAAC_LUA_FONTSETTINGS_WRAPPER_REGISTRY_KEY_ALPHA = 0x00c82986u,
  ISAAC_LUA_FONTSETTINGS_WRAPPER_REGISTRY_KEY_BETA = 0x00c82989u,
  /* shared arg conduct. */
  ISAAC_LUA_FONTSETTINGS_WRAPPER_TYPE_INDEX = 0x01,
  ISAAC_LUA_FONTSETTINGS_WRAPPER_CHECK_STACK_INDEX = 0x01,
  ISAAC_LUA_FONTSETTINGS_WRAPPER_REGISTRY_KEY = 0x00c82986u,
  ISAAC_LUA_FONTSETTINGS_WRAPPER_OBJECT_FIELD_OFF = 0x04,
  ISAAC_LUA_FONTSETTINGS_WRAPPER_TOUSERDATA_INDEX_U32 = 0xfff0b9d7u,
  ISAAC_LUA_FONTSETTINGS_WRAPPER_FN_OFF = 0x00,
  ISAAC_LUA_FONTSETTINGS_WRAPPER_CHECK_HELPER_VA = 0x0085c590u,
  /* host IAT pins (same import dir as v48 + checkinteger/pushinteger +
   * v51 checklstring/pushboolean). */
  ISAAC_LUA_FONTSETTINGS_WRAPPER_IAT_LUA_TYPE = 0x00b18400u,
  ISAAC_LUA_FONTSETTINGS_WRAPPER_IAT_LUA_TOUSERDATA = 0x00b183b0u,
  ISAAC_LUA_FONTSETTINGS_WRAPPER_IAT_LUA_CHECKINTEGER = 0x00b183f4u,
  ISAAC_LUA_FONTSETTINGS_WRAPPER_IAT_LUA_PUSHINTEGER = 0x00b183f8u,
  /* v51: luaL_checklstring(L,idx,&len) @0xb183e4 (import stub 0x7f4d72,
   * between pushnil 0x7f4d86 and toboolean 0x7f4d62) and
   * lua_pushboolean(L,b) @0xb183ec (stub 0x7f4d50). */
  ISAAC_LUA_FONTSETTINGS_WRAPPER_IAT_LUA_CHECKLSTRING = 0x00b183e4u,
  ISAAC_LUA_FONTSETTINGS_WRAPPER_IAT_LUA_PUSHBOOLEAN = 0x00b183ecu,
  /* setter arg2: index 2, low-word (16-bit) mask, combined cleanup 0x10. */
  ISAAC_LUA_FONTSETTINGS_WRAPPER_ARG2_INDEX = 0x02,
  ISAAC_LUA_FONTSETTINGS_WRAPPER_ARG2_LOW_WORD_MASK = 0xffffu,
  ISAAC_LUA_FONTSETTINGS_WRAPPER_SETTER_STACK_CLEAN = 0x10,
  /* getter tail: pushinteger cleanup 0xc. */
  ISAAC_LUA_FONTSETTINGS_WRAPPER_GETTER_PUSH_CLEAN = 0x0c,
  /* v51 cleanups: Load/GetStringWidth second lua_type pair 0x10 (4
   * dwords: upvalueindex + L + idx2 + L); checklstring 3-dword call 0xc;
   * GetCharacterWidth combined 0x14 (5 dwords from the touserdata push);
   * GetStringWidth pushinteger(L,hi=0,lo) 0xc. */
  ISAAC_LUA_FONTSETTINGS_WRAPPER_SECOND_TYPE_CLEAN = 0x10,
  ISAAC_LUA_FONTSETTINGS_WRAPPER_CHECKLSTRING_CLEAN = 0x0c,
  ISAAC_LUA_FONTSETTINGS_WRAPPER_CHARBYTE_STACK_CLEAN = 0x14,
  ISAAC_LUA_FONTSETTINGS_WRAPPER_PUSHINTEGER_HI0 = 0x00,
  ISAAC_LUA_FONTSETTINGS_WRAPPER_PUSHINTEGER_HI0_CLEAN = 0x0c,
  /* install helpers that push the wrapper fn literals. */
  /* fn-literal dwords: value bytes at install_site (push opcode at -1). */
  ISAAC_LUA_FONTSETTINGS_WRAPPER_0_INSTALL_VA = 0x0089fde0u,
  ISAAC_LUA_FONTSETTINGS_WRAPPER_1_INSTALL_VA = 0x0089fd80u,
  ISAAC_LUA_FONTSETTINGS_WRAPPER_2_INSTALL_VA = 0x0089fe80u,
  ISAAC_LUA_FONTSETTINGS_WRAPPER_3_INSTALL_VA = 0x0089fce0u,
  ISAAC_LUA_FONTSETTINGS_WRAPPER_4_INSTALL_VA = 0x0089fc40u,
  ISAAC_LUA_FONTSETTINGS_WRAPPER_5_INSTALL_VA = 0x0089fbe0u,
  ISAAC_LUA_FONTSETTINGS_WRAPPER_6_INSTALL_VA = 0x0089fb40u,
  ISAAC_LUA_FONTSETTINGS_WRAPPER_7_INSTALL_VA = 0x0089fa40u,
  ISAAC_LUA_FONTSETTINGS_WRAPPER_8_INSTALL_VA = 0x0089f9e0u,
  ISAAC_LUA_FONTSETTINGS_WRAPPER_9_INSTALL_VA = 0x0089f980u,
  ISAAC_LUA_FONTSETTINGS_WRAPPER_10_INSTALL_VA = 0x0089f8e0u,
  ISAAC_LUA_FONTSETTINGS_WRAPPER_11_INSTALL_VA = 0x0089f840u,
  ISAAC_LUA_FONTSETTINGS_WRAPPER_12_INSTALL_VA = 0x0089f7a0u,
  ISAAC_LUA_FONTSETTINGS_WRAPPER_13_INSTALL_VA = 0x0089f700u,
  ISAAC_LUA_FONTSETTINGS_WRAPPER_14_INSTALL_VA = 0x0089f600u,
  ISAAC_LUA_FONTSETTINGS_WRAPPER_0_INSTALL_SITE_VA = 0x0089fdf7u,
  ISAAC_LUA_FONTSETTINGS_WRAPPER_1_INSTALL_SITE_VA = 0x0089fd99u,
  ISAAC_LUA_FONTSETTINGS_WRAPPER_2_INSTALL_SITE_VA = 0x0089fe8fu,
  ISAAC_LUA_FONTSETTINGS_WRAPPER_3_INSTALL_SITE_VA = 0x0089fcf7u,
  ISAAC_LUA_FONTSETTINGS_WRAPPER_4_INSTALL_SITE_VA = 0x0089fc62u,
  ISAAC_LUA_FONTSETTINGS_WRAPPER_5_INSTALL_SITE_VA = 0x0089fbf0u,
  ISAAC_LUA_FONTSETTINGS_WRAPPER_6_INSTALL_SITE_VA = 0x0089fb57u,
  ISAAC_LUA_FONTSETTINGS_WRAPPER_7_INSTALL_SITE_VA = 0x0089fa57u,
  ISAAC_LUA_FONTSETTINGS_WRAPPER_8_INSTALL_SITE_VA = 0x0089f9f0u,
  ISAAC_LUA_FONTSETTINGS_WRAPPER_9_INSTALL_SITE_VA = 0x0089f990u,
  ISAAC_LUA_FONTSETTINGS_WRAPPER_10_INSTALL_SITE_VA = 0x0089f8f7u,
  ISAAC_LUA_FONTSETTINGS_WRAPPER_11_INSTALL_SITE_VA = 0x0089f857u,
  ISAAC_LUA_FONTSETTINGS_WRAPPER_12_INSTALL_SITE_VA = 0x0089f7b7u,
  ISAAC_LUA_FONTSETTINGS_WRAPPER_13_INSTALL_SITE_VA = 0x0089f722u,
  ISAAC_LUA_FONTSETTINGS_WRAPPER_14_INSTALL_SITE_VA = 0x0089f60fu,
  /* FontRenderSettings method-install sites (E8 -> install helper). */
  ISAAC_LUA_FONTSETTINGS_SITE_COUNT = 21,
  ISAAC_LUA_FONTSETTINGS_SITE_0_CALL_VA = 0x00866dccu,
  ISAAC_LUA_FONTSETTINGS_SITE_0_NAME_VA = 0x00b702a0u, /* "GetAlignment" */
  ISAAC_LUA_FONTSETTINGS_SITE_0_REAL_FN_VA = 0x0040c3a0u,
  ISAAC_LUA_FONTSETTINGS_SITE_0_HELPER_VA = 0x0089fde0u,
  ISAAC_LUA_FONTSETTINGS_SITE_0_WRAPPER_VA = 0x008a89e0u,
  ISAAC_LUA_FONTSETTINGS_SITE_1_CALL_VA = 0x00866de1u,
  ISAAC_LUA_FONTSETTINGS_SITE_1_NAME_VA = 0x00b702b0u, /* "SetMaxCharacters" */
  ISAAC_LUA_FONTSETTINGS_SITE_1_REAL_FN_VA = 0x00a1a5d0u,
  ISAAC_LUA_FONTSETTINGS_SITE_1_HELPER_VA = 0x0089fd80u,
  ISAAC_LUA_FONTSETTINGS_SITE_1_WRAPPER_VA = 0x008a8a40u,
  ISAAC_LUA_FONTSETTINGS_SITE_2_CALL_VA = 0x00866e0bu,
  ISAAC_LUA_FONTSETTINGS_SITE_2_NAME_VA = 0x00b703a8u, /* "EnableAutoWrap" */
  ISAAC_LUA_FONTSETTINGS_SITE_2_REAL_FN_VA = 0x0085e450u,
  ISAAC_LUA_FONTSETTINGS_SITE_2_HELPER_VA = 0x0089fd80u,
  ISAAC_LUA_FONTSETTINGS_SITE_2_WRAPPER_VA = 0x008a8a40u,
  ISAAC_LUA_FONTSETTINGS_SITE_3_CALL_VA = 0x00866e35u,
  ISAAC_LUA_FONTSETTINGS_SITE_3_NAME_VA = 0x00b70380u, /* "EnableTruncation" */
  ISAAC_LUA_FONTSETTINGS_SITE_3_REAL_FN_VA = 0x00a1a600u,
  ISAAC_LUA_FONTSETTINGS_SITE_3_HELPER_VA = 0x0089fd80u,
  ISAAC_LUA_FONTSETTINGS_SITE_3_WRAPPER_VA = 0x008a8a40u,
  /* v51 sites 4..20 (append order; SetAlignment 0x866db7 predates
   * GetAlignment in the PE but is appended to keep v49 indices stable). */
  ISAAC_LUA_FONTSETTINGS_SITE_4_CALL_VA = 0x00866db7u,
  ISAAC_LUA_FONTSETTINGS_SITE_4_NAME_VA = 0x00b702d8u, /* "SetAlignment" */
  ISAAC_LUA_FONTSETTINGS_SITE_4_REAL_FN_VA = 0x00a1a5c0u,
  ISAAC_LUA_FONTSETTINGS_SITE_4_HELPER_VA = 0x0089fe80u,
  ISAAC_LUA_FONTSETTINGS_SITE_4_WRAPPER_VA = 0x008a8970u,
  ISAAC_LUA_FONTSETTINGS_SITE_5_CALL_VA = 0x00866df6u,
  ISAAC_LUA_FONTSETTINGS_SITE_5_NAME_VA = 0x00b70394u, /* "GetMaxCharacters" */
  ISAAC_LUA_FONTSETTINGS_SITE_5_REAL_FN_VA = 0x00a1a5e0u,
  ISAAC_LUA_FONTSETTINGS_SITE_5_HELPER_VA = 0x0089fce0u,
  ISAAC_LUA_FONTSETTINGS_SITE_5_WRAPPER_VA = 0x008a8ab0u,
  ISAAC_LUA_FONTSETTINGS_SITE_6_CALL_VA = 0x00866e20u,
  ISAAC_LUA_FONTSETTINGS_SITE_6_NAME_VA = 0x00b7036cu, /* "IsAutoWrapEnabled" */
  ISAAC_LUA_FONTSETTINGS_SITE_6_REAL_FN_VA = 0x00a1a5f0u,
  ISAAC_LUA_FONTSETTINGS_SITE_6_HELPER_VA = 0x0089fc40u,
  ISAAC_LUA_FONTSETTINGS_SITE_6_WRAPPER_VA = 0x008a8b10u,
  ISAAC_LUA_FONTSETTINGS_SITE_7_CALL_VA = 0x00866e4au,
  ISAAC_LUA_FONTSETTINGS_SITE_7_NAME_VA = 0x00b70340u, /* "IsTruncationEnabled" */
  ISAAC_LUA_FONTSETTINGS_SITE_7_REAL_FN_VA = 0x00a1a620u,
  ISAAC_LUA_FONTSETTINGS_SITE_7_HELPER_VA = 0x0089fc40u,
  ISAAC_LUA_FONTSETTINGS_SITE_7_WRAPPER_VA = 0x008a8b10u,
  ISAAC_LUA_FONTSETTINGS_SITE_8_CALL_VA = 0x00866e5fu,
  ISAAC_LUA_FONTSETTINGS_SITE_8_NAME_VA = 0x00b70354u, /* "SetLineHeightModifier" */
  ISAAC_LUA_FONTSETTINGS_SITE_8_REAL_FN_VA = 0x00407280u,
  ISAAC_LUA_FONTSETTINGS_SITE_8_HELPER_VA = 0x0089fbe0u,
  ISAAC_LUA_FONTSETTINGS_SITE_8_WRAPPER_VA = 0x008a8b80u,
  ISAAC_LUA_FONTSETTINGS_SITE_9_CALL_VA = 0x00866e74u,
  ISAAC_LUA_FONTSETTINGS_SITE_9_NAME_VA = 0x00b7030cu, /* "GetLineHeightModifier" */
  ISAAC_LUA_FONTSETTINGS_SITE_9_REAL_FN_VA = 0x00407270u,
  ISAAC_LUA_FONTSETTINGS_SITE_9_HELPER_VA = 0x0089fb40u,
  ISAAC_LUA_FONTSETTINGS_SITE_9_WRAPPER_VA = 0x008a8c10u,
  ISAAC_LUA_FONTSETTINGS_SITE_10_CALL_VA = 0x00866e89u,
  ISAAC_LUA_FONTSETTINGS_SITE_10_NAME_VA = 0x00b70324u, /* "SetMissingCharacterOverride" */
  ISAAC_LUA_FONTSETTINGS_SITE_10_REAL_FN_VA = 0x00a1a630u,
  ISAAC_LUA_FONTSETTINGS_SITE_10_HELPER_VA = 0x0089fae0u,
  ISAAC_LUA_FONTSETTINGS_SITE_10_WRAPPER_VA = 0x008a8970u,
  ISAAC_LUA_FONTSETTINGS_SITE_11_CALL_VA = 0x00866e9eu,
  ISAAC_LUA_FONTSETTINGS_SITE_11_NAME_VA = 0x00b70408u, /* "GetMissingCharacterOverride" */
  ISAAC_LUA_FONTSETTINGS_SITE_11_REAL_FN_VA = 0x0040c2e0u,
  ISAAC_LUA_FONTSETTINGS_SITE_11_HELPER_VA = 0x0089fa40u,
  ISAAC_LUA_FONTSETTINGS_SITE_11_WRAPPER_VA = 0x008a8c80u,
  ISAAC_LUA_FONTSETTINGS_SITE_12_CALL_VA = 0x00866efcu,
  ISAAC_LUA_FONTSETTINGS_SITE_12_NAME_VA = 0x00b703f8u, /* "Load" */
  ISAAC_LUA_FONTSETTINGS_SITE_12_REAL_FN_VA = 0x0085e470u,
  ISAAC_LUA_FONTSETTINGS_SITE_12_HELPER_VA = 0x0089f9e0u,
  ISAAC_LUA_FONTSETTINGS_SITE_12_WRAPPER_VA = 0x008a8ce0u,
  ISAAC_LUA_FONTSETTINGS_SITE_13_CALL_VA = 0x00866f11u,
  ISAAC_LUA_FONTSETTINGS_SITE_13_NAME_VA = 0x00b70400u, /* "Unload" */
  ISAAC_LUA_FONTSETTINGS_SITE_13_REAL_FN_VA = 0x00a1ad90u,
  ISAAC_LUA_FONTSETTINGS_SITE_13_HELPER_VA = 0x0089f980u,
  ISAAC_LUA_FONTSETTINGS_SITE_13_WRAPPER_VA = 0x008a8d80u,
  ISAAC_LUA_FONTSETTINGS_SITE_14_CALL_VA = 0x00866f26u,
  ISAAC_LUA_FONTSETTINGS_SITE_14_NAME_VA = 0x00b703d8u, /* "IsLoaded" */
  ISAAC_LUA_FONTSETTINGS_SITE_14_REAL_FN_VA = 0x006b83d0u,
  ISAAC_LUA_FONTSETTINGS_SITE_14_HELPER_VA = 0x0089f8e0u,
  ISAAC_LUA_FONTSETTINGS_SITE_14_WRAPPER_VA = 0x008a8dd0u,
  ISAAC_LUA_FONTSETTINGS_SITE_15_CALL_VA = 0x00866f3bu,
  ISAAC_LUA_FONTSETTINGS_SITE_15_NAME_VA = 0x00b703e4u, /* "GetCharacterWidth" */
  ISAAC_LUA_FONTSETTINGS_SITE_15_REAL_FN_VA = 0x00a1ae70u,
  ISAAC_LUA_FONTSETTINGS_SITE_15_HELPER_VA = 0x0089f840u,
  ISAAC_LUA_FONTSETTINGS_SITE_15_WRAPPER_VA = 0x008a8e40u,
  ISAAC_LUA_FONTSETTINGS_SITE_16_CALL_VA = 0x00866f50u,
  ISAAC_LUA_FONTSETTINGS_SITE_16_NAME_VA = 0x00b703b8u, /* "GetStringWidth" */
  ISAAC_LUA_FONTSETTINGS_SITE_16_REAL_FN_VA = 0x00a1ae80u,
  ISAAC_LUA_FONTSETTINGS_SITE_16_HELPER_VA = 0x0089f7a0u,
  ISAAC_LUA_FONTSETTINGS_SITE_16_WRAPPER_VA = 0x008a8ec0u,
  ISAAC_LUA_FONTSETTINGS_SITE_17_CALL_VA = 0x00866f65u,
  ISAAC_LUA_FONTSETTINGS_SITE_17_NAME_VA = 0x00b703c8u, /* "GetLineHeight" */
  ISAAC_LUA_FONTSETTINGS_SITE_17_REAL_FN_VA = 0x00a1aea0u,
  ISAAC_LUA_FONTSETTINGS_SITE_17_HELPER_VA = 0x0089f700u,
  ISAAC_LUA_FONTSETTINGS_SITE_17_WRAPPER_VA = 0x008a8f60u,
  ISAAC_LUA_FONTSETTINGS_SITE_18_CALL_VA = 0x00866f7au,
  ISAAC_LUA_FONTSETTINGS_SITE_18_NAME_VA = 0x00b70454u, /* "GetBaselineHeight" */
  ISAAC_LUA_FONTSETTINGS_SITE_18_REAL_FN_VA = 0x00a1aeb0u,
  ISAAC_LUA_FONTSETTINGS_SITE_18_HELPER_VA = 0x0089f700u,
  ISAAC_LUA_FONTSETTINGS_SITE_18_WRAPPER_VA = 0x008a8f60u,
  ISAAC_LUA_FONTSETTINGS_SITE_19_CALL_VA = 0x00866f8fu,
  ISAAC_LUA_FONTSETTINGS_SITE_19_NAME_VA = 0x00b70468u, /* "DrawString" */
  ISAAC_LUA_FONTSETTINGS_SITE_19_REAL_FN_VA = 0x00a1b140u,
  ISAAC_LUA_FONTSETTINGS_SITE_19_HELPER_VA = 0x0089f660u,
  ISAAC_LUA_FONTSETTINGS_SITE_19_WRAPPER_VA = 0x008a8fc0u,
  ISAAC_LUA_FONTSETTINGS_SITE_20_CALL_VA = 0x00866fa4u,
  ISAAC_LUA_FONTSETTINGS_SITE_20_NAME_VA = 0x00b7043cu, /* "SetMissingCharacter" */
  ISAAC_LUA_FONTSETTINGS_SITE_20_REAL_FN_VA = 0x00a1b3b0u,
  ISAAC_LUA_FONTSETTINGS_SITE_20_HELPER_VA = 0x0089f600u,
  ISAAC_LUA_FONTSETTINGS_SITE_20_WRAPPER_VA = 0x008a9180u
};

/* ABI v49 — FontRenderSettings wrapper body laws. */
int32_t isaac_lua_engine_fontsettings_wrapper_count(void);
/* OOR -> 0 / -1 per accessor (v48 convention). */
uint32_t isaac_lua_engine_fontsettings_wrapper_va(int32_t index);
uint32_t isaac_lua_engine_fontsettings_wrapper_ret_va(int32_t index);
/* first ret - body VA (ret excluded, family convention). OOR -> 0. */
uint32_t isaac_lua_engine_fontsettings_wrapper_body_bytes(int32_t index);
int32_t isaac_lua_engine_fontsettings_wrapper_insn_count(int32_t index);
int32_t isaac_lua_engine_fontsettings_wrapper_check_flags(int32_t index);
int32_t isaac_lua_engine_fontsettings_wrapper_return_value(int32_t index);
/* ISAAC_LUA_FONTSETTINGS_WRAPPER_ARG2_* kind. OOR -> -1. */
int32_t isaac_lua_engine_fontsettings_wrapper_arg2_kind(int32_t index);
/* Lua stack index for the checkinteger read (2 on the setter, 0 else). */
int32_t isaac_lua_engine_fontsettings_wrapper_arg2_index(int32_t index);
/* ISAAC_LUA_FONTSETTINGS_WRAPPER_TAIL_* kind. OOR -> -1. */
int32_t isaac_lua_engine_fontsettings_wrapper_tail_kind(int32_t index);
/* Shared arg conduct. */
uint32_t isaac_lua_engine_fontsettings_wrapper_type_index(void);
uint32_t isaac_lua_engine_fontsettings_wrapper_check_stack_index(void);
uint32_t isaac_lua_engine_fontsettings_wrapper_registry_key(void);
uint32_t isaac_lua_engine_fontsettings_wrapper_object_field_off(void);
uint32_t isaac_lua_engine_fontsettings_wrapper_touserdata_index(void);
uint32_t isaac_lua_engine_fontsettings_wrapper_fn_off(void);
uint32_t isaac_lua_engine_fontsettings_wrapper_check_helper_va(void);
uint32_t isaac_lua_engine_fontsettings_wrapper_iat_lua_type(void);
uint32_t isaac_lua_engine_fontsettings_wrapper_iat_lua_touserdata(void);
uint32_t isaac_lua_engine_fontsettings_wrapper_iat_lua_checkinteger(void);
uint32_t isaac_lua_engine_fontsettings_wrapper_iat_lua_pushinteger(void);
/* Registry ref-set decision: PE `test eax,eax; je obj_zero` FULL-WORD.
 * obj = (type != 0) ? check_field : 0. Drive UNMASKED. */
uint32_t isaac_lua_engine_fontsettings_wrapper_object_resolve(
    uint32_t type_result, uint32_t check_field);
/* Setter arg2 law: PE `movzx edx, ax` @ 0x8a8a90 — LOW-WORD (16-bit)
 * zero-extend of the luaL_checkinteger(L,2) result. A byte-mask mutant
 * diverges at 0x100; a full-word pass diverges at 0x10000. */
uint32_t isaac_lua_engine_fontsettings_wrapper_arg2_low_word(
    uint32_t value);
/* Getter tail cdq law: PE `cdq` @ 0x8a8a2a sign-extends the fn's i32
 * return into edx:eax for lua_pushinteger. hi = bit31 ? 0xffffffff : 0. */
uint32_t isaac_lua_engine_fontsettings_wrapper_getter_lua_integer_hi(
    uint32_t value);
/* Getter pushinteger cleanup 0xc; setter IAT-pair cleanup 0x10. */
uint32_t isaac_lua_engine_fontsettings_wrapper_getter_push_cleanup(void);
uint32_t isaac_lua_engine_fontsettings_wrapper_setter_stack_clean(void);
/* Install linkage: wrapper -> pushing install helper + literal site. */
uint32_t isaac_lua_engine_fontsettings_wrapper_install_va(int32_t index);
uint32_t isaac_lua_engine_fontsettings_wrapper_install_literal_va(
    int32_t index);
/* FontRenderSettings install-site records (E8 -> helper). OOR -> 0. */
int32_t isaac_lua_engine_fontsettings_site_count(void);
uint32_t isaac_lua_engine_fontsettings_site_call_va(int32_t index);
uint32_t isaac_lua_engine_fontsettings_site_name_va(int32_t index);
uint32_t isaac_lua_engine_fontsettings_site_real_fn_va(int32_t index);
uint32_t isaac_lua_engine_fontsettings_site_helper_va(int32_t index);
uint32_t isaac_lua_engine_fontsettings_site_wrapper_va(int32_t index);

/* ABI v51 — Load-band wrapper laws (0x8a8970..0x8a9180). */
/* Per-row registry key: 0xc82986 (indices 0..7) / 0xc82989 (8..14).
 * OOR -> 0. (Suffix _i: the v49 no-arg registry_key(void) singleton
 * keeps the unsuffixed name.) */
uint32_t isaac_lua_engine_fontsettings_wrapper_registry_key_i(int32_t index);
/* First ret encountered by the disassembler (0x8a8d53 trap for Load,
 * == ret_va for every other wrapper). OOR -> 0. */
uint32_t isaac_lua_engine_fontsettings_wrapper_first_ret_va(int32_t index);
/* Tail helper/IAT slot for PUSHBOOLEAN/PUSHINT_HELPER/PUSHNUMBER_F32/
 * PUSHINTEGER_HI0 rows; 0 for VOID/PUSHINTEGER. OOR -> 0. */
uint32_t isaac_lua_engine_fontsettings_wrapper_tail_helper_va(int32_t index);
/* CHECKINTEGER_FULLWORD law (0x8a8970/0x8a9180 push the whole checkinteger
 * result — NO movzx). WIDE pass-through; a LOWW fold would fail. */
uint32_t isaac_lua_engine_fontsettings_wrapper_arg2_full_word(uint32_t value);
/* CHECKLSTRING_BYTE law (0x8a8e40): `mov dl,[eax]` byte0 of the string.
 * PE pushes the dword with garbage upper bytes ([ebp-4] slot); the pure
 * law is the low byte only. */
uint32_t isaac_lua_engine_fontsettings_wrapper_arg2_byte0(uint32_t value);
/* CHECKLSTRING_GATED law (Load 0x8a8ce0 / GetStringWidth 0x8a8ec0):
 * second lua_type(L,2) FULL-WORD gate — nil -> NULL arg, any non-zero
 * type -> the checklstring result. Never byte-masked. */
uint32_t isaac_lua_engine_fontsettings_wrapper_checklstring_gate(
    uint32_t type_result, uint32_t string_result);
/* PUSHBOOLEAN law (0x8a8b10/0x8a8dd0): `test al,al; setne cl` — LOW-BYTE
 * test of the fn's bool return, normalized to 0/1. */
uint32_t isaac_lua_engine_fontsettings_wrapper_bool_low_byte(uint32_t value);
uint32_t isaac_lua_engine_fontsettings_wrapper_iat_lua_checklstring(void);
uint32_t isaac_lua_engine_fontsettings_wrapper_iat_lua_pushboolean(void);
/* v51 stack-clean constants (Load band). */
uint32_t isaac_lua_engine_fontsettings_wrapper_second_type_clean(void);
uint32_t isaac_lua_engine_fontsettings_wrapper_checklstring_clean(void);
uint32_t isaac_lua_engine_fontsettings_wrapper_charbyte_stack_clean(void);
uint32_t isaac_lua_engine_fontsettings_wrapper_pushinteger_hi0(void);
uint32_t isaac_lua_engine_fontsettings_wrapper_pushinteger_hi0_clean(void);

/* ---------------------------------------------------------------------------
 * ABI v53 — pusher leaf stubs 0x85c050 (PUSHNUMBER_F32) / 0x85bff0
 * (PUSHINT_U32) / 0x85c010 (PUSHINT_U16) + 0x85c590 true-body bounds.
 *
 * The three pushers were only ever PINNED by callers (v36/v39/v45/v51
 * HOST_VA_PUSH / TAIL_HELPER_VA / PUSH_*_ZEXT_VA constants) — the BODIES
 * were never landed. All three share the leaf-stub shape:
 *   push ebp; mov ebp,esp; and esp,ALIGN; <marshal>; push ecx; push args;
 *   call IAT; add esp,CLEANUP; mov esp,ebp; pop ebp; ret
 *
 * 0x85c050 PUSHNUMBER_F32 (13 insns, ret 0x85c072, body 0x22):
 *   and esp,0xffffffc0 (-64 align); xorps xmm0,xmm0 (dep break);
 *   sub esp,8 (8-byte f64 slot); cvtss2sd xmm0,xmm1 (EXACT f32->f64,
 *   RN — no double rounding; DataView bit-exact in the JS oracle);
 *   movsd [esp],xmm0 (LE store: lo@[esp], hi@[esp+4]); push ecx (L);
 *   call [0xb183f0] lua_pushnumber; add esp,0xc; ret.
 *   Laws: stack 0xffffffc0, f64 slot 8, IAT 0xb183f0, cleanup 0xc,
 *   widen_hi/widen_lo (cvtss2sd widening — SAME law as the v45
 *   setref_successor widen pair, now under the pusher band name).
 *
 * 0x85bff0 PUSHINT_U32 (11 insns, ret 0x85c006, body 0x16):
 *   and esp,0xfffffff8 (-8 align); push 0 (hi); push edx (lo — FULL
 *   32-bit word, NO mask); push ecx (L); call [0xb183f8]
 *   lua_pushinteger; add esp,0xc; ret.
 *   Laws: stack 0xfffffff8, IAT 0xb183f8, cleanup 0xc, lo = edx
 *   (0xffffffff/0x10000 survive), hi = 0 (literal push 0).
 *
 * 0x85c010 PUSHINT_U16 (13 insns, ret 0x85c029, body 0x19):
 *   and esp,0xfffffff8; movzx eax,dx (lo = u16 LOW WORD); cdq (hi =
 *   sign32(eax) — ALWAYS 0 since eax in [0,0xffff]); push edx (hi);
 *   push eax (lo); push ecx (L); call [0xb183f8]; add esp,0xc; ret.
 *   Laws: stack 0xfffffff8, IAT 0xb183f8, cleanup 0xc, lo = u16(edx)
 *   (0x10000 -> 0), hi = 0 (movzx+cdq; a movsx/sign16 fold is wrong:
 *   dx=0x8000 -> lo 0x8000 hi 0).
 *
 * 0x85c590 check/get TRUE body bounds (215 insns, body 0x240, rets 2):
 *   the census records "first_ret 0x85c700 rets 1" — a MID-BODY TRAP
 *   RET on the IDENTITY-SUCCESS path (`lua_touserdata(L,idx)` @0xb183b0
 *   tail, `push esi; push edi; call [0xb183b0]; add esp,8; pop
 *   edi/esi/ebx; mov esp,ebp; pop ebp; ret` @0x85c6ef..0x85c700), which
 *   the parent-walk path `je 0x85c701` @0x85c6d7 jumps PAST. TRUE final
 *   ret @0x85c7d0 (after luaL_argerror @0xb183a4, `xor eax,eax`
 *   @0x85c7c8). All decision islands were already landed at v11/v12 —
 *   this block lands the BODY BOUNDS only (body va / dual rets / bytes /
 *   insns / success-tail IAT+cleanup).
 * ------------------------------------------------------------------------- */

enum {
  ISAAC_LUA_PUSHER_COUNT = 4,
  ISAAC_LUA_PUSHER_KIND_PUSHNUMBER_F32 = 0,
  ISAAC_LUA_PUSHER_KIND_PUSHINT_U32 = 1,
  ISAAC_LUA_PUSHER_KIND_PUSHINT_U16 = 2,
  ISAAC_LUA_PUSHER_KIND_PUSHINT_I32_SEXT = 3,
  ISAAC_LUA_PUSHER_0_VA = 0x0085c050u,         /* PUSHNUMBER_F32 */
  ISAAC_LUA_PUSHER_0_RET_VA = 0x0085c072u,
  ISAAC_LUA_PUSHER_0_INSNS = 13,
  ISAAC_LUA_PUSHER_0_STACK_ALIGN_MASK = 0xffffffc0u,
  ISAAC_LUA_PUSHER_0_F64_SLOT_BYTES = 8,
  ISAAC_LUA_PUSHER_0_IAT_VA = 0x00b183f0u,     /* lua_pushnumber */
  ISAAC_LUA_PUSHER_0_CLEANUP = 0x0cu,
  ISAAC_LUA_PUSHER_1_VA = 0x0085bff0u,         /* PUSHINT_U32 */
  ISAAC_LUA_PUSHER_1_RET_VA = 0x0085c006u,
  ISAAC_LUA_PUSHER_1_INSNS = 11,
  ISAAC_LUA_PUSHER_1_STACK_ALIGN_MASK = 0xfffffff8u,
  ISAAC_LUA_PUSHER_1_F64_SLOT_BYTES = 0,
  ISAAC_LUA_PUSHER_1_IAT_VA = 0x00b183f8u,     /* lua_pushinteger */
  ISAAC_LUA_PUSHER_1_CLEANUP = 0x0cu,
  ISAAC_LUA_PUSHER_2_VA = 0x0085c010u,         /* PUSHINT_U16 */
  ISAAC_LUA_PUSHER_2_RET_VA = 0x0085c029u,
  ISAAC_LUA_PUSHER_2_INSNS = 13,
  ISAAC_LUA_PUSHER_2_STACK_ALIGN_MASK = 0xfffffff8u,
  ISAAC_LUA_PUSHER_2_F64_SLOT_BYTES = 0,
  ISAAC_LUA_PUSHER_2_IAT_VA = 0x00b183f8u,     /* lua_pushinteger */
  ISAAC_LUA_PUSHER_2_CLEANUP = 0x0cu,
  ISAAC_LUA_PUSHER_3_VA = 0x0085bfd0u,         /* PUSHINT_I32_SEXT (v55) */
  ISAAC_LUA_PUSHER_3_RET_VA = 0x0085bfe8u,
  ISAAC_LUA_PUSHER_3_INSNS = 13,
  ISAAC_LUA_PUSHER_3_STACK_ALIGN_MASK = 0xfffffff8u,
  ISAAC_LUA_PUSHER_3_F64_SLOT_BYTES = 0,
  ISAAC_LUA_PUSHER_3_IAT_VA = 0x00b183f8u,     /* lua_pushinteger */
  ISAAC_LUA_PUSHER_3_CLEANUP = 0x0cu
};

enum {
  ISAAC_LUA_CHECK_GET_BODY_VA = 0x0085c590u,
  ISAAC_LUA_CHECK_GET_SUCCESS_RET_VA = 0x0085c700u, /* identity-success ret */
  ISAAC_LUA_CHECK_GET_TRUE_RET_VA = 0x0085c7d0u,    /* argerror tail ret */
  ISAAC_LUA_CHECK_GET_BODY_INSNS = 215,
  ISAAC_LUA_CHECK_GET_SUCCESS_IAT_LUA_TOUSERDATA = 0x00b183b0u,
  ISAAC_LUA_CHECK_GET_SUCCESS_CLEANUP = 0x08u
};

/* v53 pusher band laws (indexed 0..2). */
int32_t isaac_lua_engine_pusher_count(void);
uint32_t isaac_lua_engine_pusher_va(int32_t index);
uint32_t isaac_lua_engine_pusher_ret_va(int32_t index);
uint32_t isaac_lua_engine_pusher_body_bytes(int32_t index);
int32_t isaac_lua_engine_pusher_insn_count(int32_t index);
uint32_t isaac_lua_engine_pusher_stack_align_mask(int32_t index);
int32_t isaac_lua_engine_pusher_f64_slot_bytes(int32_t index);
uint32_t isaac_lua_engine_pusher_iat_va(int32_t index);
int32_t isaac_lua_engine_pusher_call_cleanup(int32_t index);
int32_t isaac_lua_engine_pusher_kind(int32_t index);
/* Widen law — cvtss2sd EXACT f32->f64 (bit-exact via DataView oracle). */
uint32_t isaac_lua_engine_pusher_pushnumber_f32_widen_hi(uint32_t f32_bits);
uint32_t isaac_lua_engine_pusher_pushnumber_f32_widen_lo(uint32_t f32_bits);
/* Pushint width laws (uint32_t args; NO uint8_t params). */
uint32_t isaac_lua_engine_pusher_pushint_u32_lo(uint32_t value);
uint32_t isaac_lua_engine_pusher_pushint_u32_hi(uint32_t value);
uint32_t isaac_lua_engine_pusher_pushint_u16_lo(uint32_t value);
uint32_t isaac_lua_engine_pusher_pushint_u16_hi(uint32_t value);
/* 0x85bfd0 PUSHINT_I32_SEXT width laws (v55): lo is the FULL 32-bit word
 * (mov eax,edx @0x85bfd6); hi is the replicated sign of lo bit31 (cdq
 * @0x85bfd8) — 0x80000000 -> 0xffffffff, 0x100 -> 0. */
uint32_t isaac_lua_engine_pusher_pushint_i32_sext_lo(uint32_t value);
uint32_t isaac_lua_engine_pusher_pushint_i32_sext_hi(uint32_t value);
/* 0x85c590 body-bound laws (dual ret, true body end). */
uint32_t isaac_lua_engine_check_get_body_va(void);
uint32_t isaac_lua_engine_check_get_success_ret_va(void);
uint32_t isaac_lua_engine_check_get_true_ret_va(void);
uint32_t isaac_lua_engine_check_get_body_bytes(void);
int32_t isaac_lua_engine_check_get_insn_count(void);
int32_t isaac_lua_engine_check_get_dual_ret(void);
uint32_t isaac_lua_engine_check_get_success_iat_lua_touserdata(void);
int32_t isaac_lua_engine_check_get_success_cleanup(void);

/* ---------------------------------------------------------------------------
 * wave-16 · ABI v25h — getArgObject BODY 0x008baa50 (ecx=L, edx=idx -> obj).
 *
 * The Vector-library arg-object resolver with 86 whole-image E8 callers.
 * Before this block the VA was only PINNED (v45 setref-successor +
 * v48 wrapper compose a two-gate CALL-SITE law) — the BODY laws were
 * not landed. Machine truth: cpu-dump/008baa50.txt + 008baa7b.txt
 * (36 insns, plain ret; dual rets 0x8baa7a nil / 0x8baaa8 main; body
 * 0x58). section-notes/lua-v25h-8baa50/NOTES.md.
 *
 *   ecx=L; edx=idx -> mov esi,edx / mov edi,ecx
 *   push idx; push L; call [0xb18400] lua_type(L,idx); add esp,8
 *   test eax,eax @0x8baa61 — FULL-WORD nil gate; jne -> main @0x8baa7b
 *   nil: push 0xb7539c; push L; xor esi,esi; call [0xb18390]
 *     luaL_error; add esp,8; mov eax,esi(0); pop edi/esi; ret @0x8baa7a
 *   main: push 1 (CHKFLAGS); push 0xc82980 (KEY); mov edx,esi (idx FULL
 *     32-bit passthrough); mov ecx,edi (L); call 0x85c590; add esp,8
 *     mov esi,[eax+4] (obj field off 4); test esi,esi @0x8baa91 —
 *     FULL-WORD obj gate; jne -> ret @0x8baaa4
 *   obj==0: push 0xb7539c; push L; call [0xb18390]; add esp,8; fall
 *   @0x8baaa4: pop edi; mov eax,esi; pop esi; ret @0x8baaa8
 *
 * Caller-side vec semantics (header 0x8a8270 comment): the returned obj
 * IS the vec base pointer; callers read two f32 lanes {obj2[0],
 * obj2[4]} (lane stride 4, count 2). lua_* IAT bodies (0xb18400 /
 * 0xb18390) and the check body 0x85c590 stay host.
 * ------------------------------------------------------------------------- */

enum {
  ISAAC_LUA_GET_ARG_OBJECT_BODY_VA = 0x008baa50u,
  ISAAC_LUA_GET_ARG_OBJECT_NIL_RET_VA = 0x008baa7au,
  ISAAC_LUA_GET_ARG_OBJECT_MAIN_RET_VA = 0x008baaa8u,
  ISAAC_LUA_GET_ARG_OBJECT_BODY_INSNS = 36,
  /* register conduct / arg order */
  ISAAC_LUA_GET_ARG_OBJECT_ECX_IS_L = 0x01,
  ISAAC_LUA_GET_ARG_OBJECT_EDX_IS_IDX = 0x01,
  /* type gate: lua_type(L,idx) @0xb18400 FULL-WORD nil test @0x8baa61 */
  ISAAC_LUA_GET_ARG_OBJECT_IAT_LUA_TYPE = 0x00b18400u,
  ISAAC_LUA_GET_ARG_OBJECT_TYPE_CALL_ARGS = 0x02,
  ISAAC_LUA_GET_ARG_OBJECT_TYPE_CALL_CLEANUP = 0x08,
  /* error facts */
  ISAAC_LUA_GET_ARG_OBJECT_ERROR_STRING_VA = 0x00b7539cu,
  ISAAC_LUA_GET_ARG_OBJECT_IAT_LUA_L_ERROR = 0x00b18390u,
  ISAAC_LUA_GET_ARG_OBJECT_ERROR_CALL_CLEANUP = 0x08,
  /* check call @0x8baa7b: flags/key/idx register */
  ISAAC_LUA_GET_ARG_OBJECT_CHECK_FLAGS = 0x01,
  ISAAC_LUA_GET_ARG_OBJECT_REGISTRY_KEY = 0x00c82980u,
  ISAAC_LUA_GET_ARG_OBJECT_CHECK_HELPER_VA = 0x0085c590u,
  ISAAC_LUA_GET_ARG_OBJECT_CHECK_CLEANUP = 0x08,
  ISAAC_LUA_GET_ARG_OBJECT_CHECK_EDX_REGISTER = 0x01, /* idx: edx reg */
  /* obj read: [eax+4] FULL-WORD gate @0x8baa91 */
  ISAAC_LUA_GET_ARG_OBJECT_OBJECT_FIELD_OFF = 0x04,
  /* caller-side vec lane laws (obj2[0], obj2[4] two f32 lanes) */
  ISAAC_LUA_GET_ARG_OBJECT_LANE_COUNT = 0x02,
  ISAAC_LUA_GET_ARG_OBJECT_LANE_STRIDE = 0x04,
  ISAAC_LUA_GET_ARG_OBJECT_LANE_OFF_0 = 0x00,
  ISAAC_LUA_GET_ARG_OBJECT_LANE_OFF_1 = 0x04,
  ISAAC_LUA_GET_ARG_OBJECT_OUT_PTR_IS_RETURN = 0x01 /* eax == vec base */
};
/* caller census (86 E8 rel32 sites; whole-image scan this unit). */
enum {
  ISAAC_LUA_GET_ARG_OBJECT_CALLER_COUNT = 86
};

/* wave-16 · ABI v25h — getArgObject 0x8baa50 BODY laws. No uint8_t
 * scalar params; gates take uint32_t and re-narrow in the body. */
uint32_t isaac_lua_engine_get_arg_object_body_va(void);
uint32_t isaac_lua_engine_get_arg_object_nil_ret_va(void);
uint32_t isaac_lua_engine_get_arg_object_main_ret_va(void);
uint32_t isaac_lua_engine_get_arg_object_body_bytes(void);
int32_t isaac_lua_engine_get_arg_object_insn_count(void);
int32_t isaac_lua_engine_get_arg_object_dual_ret(void);
/* idx passthrough: PE mov esi,edx / mov edx,esi — FULL 32-bit, no mask.
 * Drive UNMASKED (0x100/0x1ff/0xffffffff survive). */
uint32_t isaac_lua_engine_get_arg_object_idx_passthrough(uint32_t value);
/* FULL-WORD gates: return 1 when the error path is taken (v == 0). */
int32_t isaac_lua_engine_get_arg_object_type_gate_taken(uint32_t value);
int32_t isaac_lua_engine_get_arg_object_obj_gate_taken(uint32_t value);
/* check call constants. */
int32_t isaac_lua_engine_get_arg_object_check_flags(void);
uint32_t isaac_lua_engine_get_arg_object_registry_key(void);
uint32_t isaac_lua_engine_get_arg_object_check_helper_va(void);
int32_t isaac_lua_engine_get_arg_object_check_cleanup(void);
int32_t isaac_lua_engine_get_arg_object_check_edx_register(void);
uint32_t isaac_lua_engine_get_arg_object_object_field_off(void);
/* error + IAT facts. */
uint32_t isaac_lua_engine_get_arg_object_error_string_va(void);
uint32_t isaac_lua_engine_get_arg_object_iat_lua_type(void);
uint32_t isaac_lua_engine_get_arg_object_iat_lua_l_error(void);
int32_t isaac_lua_engine_get_arg_object_type_call_cleanup(void);
/* result law: type==0 -> 0 (nil error); obj==0 -> 0 (null error); else
 * obj. (Body-level twin of the v45 composed call-site law.) */
uint32_t isaac_lua_engine_get_arg_object_resolve(uint32_t type_result,
                                                 uint32_t check_field);
/* caller-side vec lane laws. */
int32_t isaac_lua_engine_get_arg_object_lane_count(void);
int32_t isaac_lua_engine_get_arg_object_lane_stride(void);
uint32_t isaac_lua_engine_get_arg_object_lane_off_0(void);
uint32_t isaac_lua_engine_get_arg_object_lane_off_1(void);
int32_t isaac_lua_engine_get_arg_object_out_ptr_is_return(void);
/* caller census: 86 E8 sites. OOR -> 0. */
int32_t isaac_lua_engine_get_arg_object_caller_count(void);
uint32_t isaac_lua_engine_get_arg_object_caller_va_at(int32_t index);

/* ---------------------------------------------------------------------------
 * wave-16 · v25g — PUSH_I64_PAIR 0x85c030 body (property-closure band
 * pusher; NO ABI bump — the coordinator merges per-family ABI bumps at the
 * end of the wave; ABI_VERSION stays 53).
 *
 * 0x85c030 (11 insns, ret 0x85c049, body 0x19 = 25): push ebp; mov
 * ebp,esp; and esp,0xfffffff8; push [ebp+0xc] (HI); push [ebp+8] (LO);
 * push ecx (L); call [0xb183f8] lua_pushinteger; add esp,0xc; mov
 * esp,ebp; pop ebp; ret. The 8-byte arg reaches lua_pushinteger as
 * lo@[esp+4], hi@[esp+8] (little-endian int64). The marshal is IDENTITY
 * on both lanes — no mask, no sign-extension; the int64 sign lives in hi
 * bit 31 (lo bit 31 is IRRELEVANT). 5 true E8 callers in the image (the
 * 4 closure-band rows the v21/v53 census pins + one out-of-band clone
 * 0x8ae89e with the same shape). Machine truth:
 * section-notes/lua-v25g-85c030 (cpu-dump/0085c030.txt + caller dumps
 * 0089b690.txt / 008ae860.txt).
 * ------------------------------------------------------------------------- */

enum {
  ISAAC_LUA_PROPERTY_CLOSURE_PUSH_I64_PAIR_RET_VA = 0x0085c049u,
  ISAAC_LUA_PROPERTY_CLOSURE_PUSH_I64_PAIR_BODY_BYTES = 0x19u,
  ISAAC_LUA_PROPERTY_CLOSURE_PUSH_I64_PAIR_INSNS = 11,
  ISAAC_LUA_PROPERTY_CLOSURE_PUSH_I64_PAIR_STACK_ALIGN_MASK = 0xfffffff8u,
  ISAAC_LUA_PROPERTY_CLOSURE_PUSH_I64_PAIR_IAT_VA = 0x00b183f8u, /* lua_pushinteger */
  ISAAC_LUA_PROPERTY_CLOSURE_PUSH_I64_PAIR_CALL_CLEANUP = 0x0cu,
  ISAAC_LUA_PROPERTY_CLOSURE_PUSH_I64_PAIR_SIGN_MASK = 0x80000000u,
  ISAAC_LUA_PROPERTY_CLOSURE_PUSH_I64_PAIR_E8_CALLERS = 5
};

/* v25g PUSH_I64_PAIR 0x85c030 laws. uint32_t args ONLY — no uint8_t
 * scalar params; drive the lane laws UNMASKED (0x100/0x1ff/0xffffffff
 * survive on both lanes). */
uint32_t isaac_lua_engine_property_closure_push_i64_pair_ret_va(void);
uint32_t isaac_lua_engine_property_closure_push_i64_pair_body_bytes(void);
int32_t isaac_lua_engine_property_closure_push_i64_pair_insn_count(void);
uint32_t isaac_lua_engine_property_closure_push_i64_pair_stack_align_mask(void);
uint32_t isaac_lua_engine_property_closure_push_i64_pair_iat_va(void);
int32_t isaac_lua_engine_property_closure_push_i64_pair_call_cleanup(void);
int32_t isaac_lua_engine_property_closure_push_i64_pair_e8_callers(void);
uint32_t isaac_lua_engine_property_closure_push_i64_pair_lo(uint32_t lo,
                                                             uint32_t hi);
uint32_t isaac_lua_engine_property_closure_push_i64_pair_hi(uint32_t lo,
                                                             uint32_t hi);
int32_t isaac_lua_engine_property_closure_push_i64_pair_sign(uint32_t lo,
                                                              uint32_t hi);

/* ---------------------------------------------------------------------------
 * ABI v52 — DrawString wrapper 0x008a8fc0 + its vec-construction helper
 * 0x008baab0 + the by-reference getter 0x008bb070.
 *
 * DrawString 0x8a8fc0 (127 insns, ret 0x8a917a; the v51 census kept it
 * HOST — SEH + float-vector marshaling; this unit lands the marshaling
 * laws): L=[ebp+8]; lua_type(L,1) @0xb18400 FULL-WORD gate; je obj=0,
 * else push 1 (CHKFLAGS); push 0xc82989 (BETA key — same as the Load
 * band); mov edx,1; ecx=L; call 0x85c590; obj=[eax+4]; push 0xfff0b9d7;
 * push L; call [0xb183b0] touserdata; lea ecx,[ebp-0xec] (OUT slot);
 * push L; call 0x8baab0 (vec helper) -> eax = OUT ptr; push 2; push L;
 * call [0xb18400] lua_type(L,2); add esp,8; FULL-WORD gate: je text=0,
 * else push 0 (len=NULL); push 2; push L; call [0xb183e4]
 * luaL_checklstring(L,2,NULL); add esp,0xc; text=eax; then real_fn
 * (ud[0], ecx=obj) with 7 stack dwords: text, f32 vec[0], vec[4],
 * vec[8], vec[0xc], &copyA([ebp-0x4c]), &copyB([ebp-0x38]); xor
 * eax,eax; ret (0 Lua values).
 *
 * vec helper 0x8baab0 (100 insns, `ret 4` @0x8babf6): (ecx=OUT,
 * [ebp+8]=L, pops 1 dword). gate8: lua_type(L,8) @0xb18400 FULL-WORD
 * gate; nil -> error; push 1; push 0xc82986; mov edx,8; ecx=L; call
 * 0x85c590; obj8=[eax+4]; obj8==0 -> error; edx=7; ecx=L; call
 * 0x8bb070 -> obj7 (REGISTER call, no stack); four luaL_checknumber
 * (L,6),(L,5),(L,4),(L,3) @0xb18324; x87 -> f32 via fstp. OUT layout:
 *   OUT[0x00] f32 = checknumber(L,3)   (tail `fstp [eax]`)
 *   OUT[0x04] f32 = checknumber(L,4)
 *   OUT[0x08] f32 = checknumber(L,5)
 *   OUT[0x0c] f32 = checknumber(L,6)
 *   OUT[0x10] f32 = obj7[0x00]
 *   OUT[0x14] f32 = obj7[0x04]
 *   OUT[0x18] f32 = obj7[0x08]
 *   OUT[0x1c] f32 = obj7[0x0c]
 *   OUT[0x20] u32 = obj7[0x10]
 *   OUT[0x24..0x33] 16B = obj8[0x00..0x0f]
 *   OUT[0x34..0x43] 16B = obj8[0x10..0x17] + obj8[0x18] + 4B stack
 *   residue (law covers the meaningful 12 bytes).
 * Error paths (both gates) push 0xb7539c "nil passed to reference" +
 * L and call luaL_error @0xb18390 (raises; never returns).
 *
 * getRef 0x8bb070 (36 insns; rets 0x8bb09a nil-path + 0x8bb0c8 main):
 * (ecx=L, edx=idx REGISTER). lua_type(L,idx) @0xb18400 FULL-WORD
 * gate; nil -> error (msg 0xb7539c / 0xb18390) -> ret 0 (esi=0);
 * else push 1; push 0xc82983; edx=idx (register passthrough); ecx=L;
 * call 0x85c590; obj=[eax+4]; test FULL-WORD; 0 -> error; ret obj.
 * ------------------------------------------------------------------------- */

enum {
  ISAAC_LUA_DRAWSTRING_WRAPPER_VA = 0x008a8fc0u,
  ISAAC_LUA_DRAWSTRING_WRAPPER_RET_VA = 0x008a917au,
  ISAAC_LUA_DRAWSTRING_WRAPPER_INSNS = 127,
  ISAAC_LUA_DRAWSTRING_SEH_HANDLER_VA = 0x00b053a8u,
  ISAAC_LUA_DRAWSTRING_GS_COOKIE_VA = 0x00bf93b4u,
  ISAAC_LUA_DRAWSTRING_CHECK_FLAGS = 1,
  ISAAC_LUA_DRAWSTRING_REGISTRY_KEY = 0x00c82989u,
  ISAAC_LUA_DRAWSTRING_CHECK_EDX = 1,
  ISAAC_LUA_DRAWSTRING_TYPE_INDEX = 0x01u,
  ISAAC_LUA_DRAWSTRING_OBJECT_FIELD_OFF = 0x04u,
  ISAAC_LUA_DRAWSTRING_TOUSERDATA_INDEX_U32 = 0xfff0b9d7u,
  ISAAC_LUA_DRAWSTRING_FN_OFF = 0x00u,
  ISAAC_LUA_DRAWSTRING_IAT_LUA_TYPE = 0x00b18400u,
  ISAAC_LUA_DRAWSTRING_IAT_LUA_TOUSERDATA = 0x00b183b0u,
  ISAAC_LUA_DRAWSTRING_IAT_LUA_CHECKLSTRING = 0x00b183e4u,
  ISAAC_LUA_DRAWSTRING_CHECKLSTRING_CLEAN = 0x0cu,
  ISAAC_LUA_DRAWSTRING_VEC_HELPER_VA = 0x008baab0u,
  ISAAC_LUA_DRAWSTRING_VEC_OUT_FRAME_OFF = 0xecu,
  ISAAC_LUA_DRAWSTRING_CALL_ARGS = 7,
  ISAAC_LUA_DRAWSTRING_CALL_F32_COUNT = 4,
  ISAAC_LUA_DRAWSTRING_CALL_STRUCT_COUNT = 2,
  ISAAC_LUA_DRAWSTRING_RETURN_VALUE = 0,
  ISAAC_LUA_DRAWSTRING_INSTALL_HELPER_VA = 0x0089f660u,
  ISAAC_LUA_DRAWSTRING_INSTALL_LITERAL_VA = 0x0089f677u
};

enum {
  ISAAC_LUA_DRAWSTRING_VEC_RET_VA = 0x008babf6u,
  ISAAC_LUA_DRAWSTRING_VEC_INSNS = 100,
  ISAAC_LUA_DRAWSTRING_VEC_RET_CLEAN = 4,
  ISAAC_LUA_DRAWSTRING_VEC_OUT_ECX = 1,
  ISAAC_LUA_DRAWSTRING_VEC_GATE_TYPE_INDEX = 0x08u,
  ISAAC_LUA_DRAWSTRING_VEC_GATE_CHECK_FLAGS = 1,
  ISAAC_LUA_DRAWSTRING_VEC_GATE_REGISTRY_KEY = 0x00c82986u,
  ISAAC_LUA_DRAWSTRING_VEC_GATE_CHECK_EDX = 0x08u,
  ISAAC_LUA_DRAWSTRING_VEC_GATE_OBJECT_FIELD_OFF = 0x04u,
  ISAAC_LUA_DRAWSTRING_VEC_ERROR_MSG_VA = 0x00b7539cu,
  ISAAC_LUA_DRAWSTRING_VEC_IAT_LUA_ERROR = 0x00b18390u,
  ISAAC_LUA_DRAWSTRING_VEC_GETREF_EDX = 0x07u,
  ISAAC_LUA_DRAWSTRING_VEC_GETREF_HELPER_VA = 0x008bb070u,
  ISAAC_LUA_DRAWSTRING_VEC_IAT_LUA_CHECKNUMBER = 0x00b18324u,
  ISAAC_LUA_DRAWSTRING_VEC_CHECKNUMBER_COUNT = 4,
  ISAAC_LUA_DRAWSTRING_VEC_U32_OUT_OFF = 0x20u,
  ISAAC_LUA_DRAWSTRING_VEC_U32_OBJ7_FIELD_OFF = 0x10u,
  ISAAC_LUA_DRAWSTRING_VEC_BLOCK16_A_OUT_OFF = 0x24u,
  ISAAC_LUA_DRAWSTRING_VEC_BLOCK16_A_SRC_OFF = 0x00u,
  ISAAC_LUA_DRAWSTRING_VEC_BLOCK16_B_OUT_OFF = 0x34u,
  ISAAC_LUA_DRAWSTRING_VEC_BLOCK16_B_SRC_OFF = 0x10u,
  ISAAC_LUA_DRAWSTRING_VEC_BLOCK16_B_SRC_DWORD_OFF = 0x18u,
  ISAAC_LUA_DRAWSTRING_VEC_BLOCK16_B_VALID_BYTES = 12
};

enum {
  ISAAC_LUA_DRAWSTRING_GETREF_VA = 0x008bb070u,
  ISAAC_LUA_DRAWSTRING_GETREF_RET_VA = 0x008bb0c8u,
  ISAAC_LUA_DRAWSTRING_GETREF_NIL_RET_VA = 0x008bb09au,
  ISAAC_LUA_DRAWSTRING_GETREF_INSNS = 36,
  ISAAC_LUA_DRAWSTRING_GETREF_CHECK_FLAGS = 1,
  ISAAC_LUA_DRAWSTRING_GETREF_REGISTRY_KEY = 0x00c82983u,
  ISAAC_LUA_DRAWSTRING_GETREF_EDX_REGISTER = 1,
  ISAAC_LUA_DRAWSTRING_GETREF_OBJECT_FIELD_OFF = 0x04u,
  ISAAC_LUA_DRAWSTRING_GETREF_IAT_LUA_TYPE = 0x00b18400u,
  ISAAC_LUA_DRAWSTRING_GETREF_IAT_LUA_ERROR = 0x00b18390u,
  ISAAC_LUA_DRAWSTRING_GETREF_ERROR_MSG_VA = 0x00b7539cu
};

/* FULL-WORD type gate (DrawString arg1 / arg2): text/obj = (type != 0) ?
 * value : 0. Never byte-masked. */
uint32_t isaac_lua_engine_drawstring_object_resolve(uint32_t type_result,
                                                    uint32_t check_field);
uint32_t isaac_lua_engine_drawstring_text_arg(uint32_t type_result,
                                              uint32_t lstring_result);
/* Vec helper: out f32 lane `checknumber_index` (3..6) lands at OUT+off. */
uint32_t isaac_lua_engine_drawstring_vec_out_f32_off_at(
    int32_t checknumber_index);
/* Vec helper: obj7 f32 lane `lane` (4..7) reads obj7 + 4*(lane-4). */
uint32_t isaac_lua_engine_drawstring_vec_obj7_f32_off_at(int32_t lane);
/* Gate laws (FULL-WORD, both gates). */
uint32_t isaac_lua_engine_drawstring_vec_gate(uint32_t type_result,
                                              uint32_t check_field);
uint32_t isaac_lua_engine_drawstring_getref_resolve(uint32_t type_result,
                                                    uint32_t check_field);
/* getRef edx passthrough: the index REGISTER crosses to both lua_type and
 * the 0x85c590 edx unchanged. FULL-WORD. */
uint32_t isaac_lua_engine_drawstring_getref_edx_index(uint32_t index);

/* v52 no-arg getters (DrawString wrapper 0x8a8fc0). */
uint32_t isaac_lua_engine_drawstring_wrapper_va(void);
uint32_t isaac_lua_engine_drawstring_wrapper_ret_va(void);
uint32_t isaac_lua_engine_drawstring_wrapper_body_bytes(void);
int32_t isaac_lua_engine_drawstring_wrapper_insn_count(void);
uint32_t isaac_lua_engine_drawstring_seh_handler_va(void);
uint32_t isaac_lua_engine_drawstring_gs_cookie_va(void);
int32_t isaac_lua_engine_drawstring_check_flags(void);
uint32_t isaac_lua_engine_drawstring_registry_key(void);
int32_t isaac_lua_engine_drawstring_check_edx(void);
uint32_t isaac_lua_engine_drawstring_type_index(void);
uint32_t isaac_lua_engine_drawstring_object_field_off(void);
uint32_t isaac_lua_engine_drawstring_touserdata_index(void);
uint32_t isaac_lua_engine_drawstring_fn_off(void);
uint32_t isaac_lua_engine_drawstring_iat_lua_type(void);
uint32_t isaac_lua_engine_drawstring_iat_lua_touserdata(void);
uint32_t isaac_lua_engine_drawstring_iat_lua_checklstring(void);
uint32_t isaac_lua_engine_drawstring_checklstring_clean(void);
uint32_t isaac_lua_engine_drawstring_vec_helper_va(void);
uint32_t isaac_lua_engine_drawstring_vec_out_frame_off(void);
int32_t isaac_lua_engine_drawstring_call_args(void);
int32_t isaac_lua_engine_drawstring_call_f32_count(void);
int32_t isaac_lua_engine_drawstring_call_struct_count(void);
int32_t isaac_lua_engine_drawstring_return_value(void);
uint32_t isaac_lua_engine_drawstring_install_helper_va(void);
uint32_t isaac_lua_engine_drawstring_install_literal_va(void);

/* v52 no-arg getters (vec-construction helper 0x8baab0). */
uint32_t isaac_lua_engine_drawstring_vec_helper_ret_va(void);
uint32_t isaac_lua_engine_drawstring_vec_helper_body_bytes(void);
int32_t isaac_lua_engine_drawstring_vec_helper_insn_count(void);
int32_t isaac_lua_engine_drawstring_vec_helper_ret_clean(void);
int32_t isaac_lua_engine_drawstring_vec_out_ecx(void);
uint32_t isaac_lua_engine_drawstring_vec_gate_type_index(void);
int32_t isaac_lua_engine_drawstring_vec_gate_check_flags(void);
uint32_t isaac_lua_engine_drawstring_vec_gate_registry_key(void);
int32_t isaac_lua_engine_drawstring_vec_gate_check_edx(void);
uint32_t isaac_lua_engine_drawstring_vec_gate_object_field_off(void);
uint32_t isaac_lua_engine_drawstring_vec_error_msg_va(void);
uint32_t isaac_lua_engine_drawstring_vec_iat_lua_error(void);
int32_t isaac_lua_engine_drawstring_vec_getref_edx(void);
uint32_t isaac_lua_engine_drawstring_vec_getref_helper_va(void);
uint32_t isaac_lua_engine_drawstring_vec_iat_lua_checknumber(void);
int32_t isaac_lua_engine_drawstring_vec_checknumber_count(void);
uint32_t isaac_lua_engine_drawstring_vec_u32_out_off(void);
uint32_t isaac_lua_engine_drawstring_vec_u32_obj7_field_off(void);
uint32_t isaac_lua_engine_drawstring_vec_block16_a_out_off(void);
uint32_t isaac_lua_engine_drawstring_vec_block16_a_src_off(void);
uint32_t isaac_lua_engine_drawstring_vec_block16_b_out_off(void);
uint32_t isaac_lua_engine_drawstring_vec_block16_b_src_off(void);
uint32_t isaac_lua_engine_drawstring_vec_block16_b_src_dword_off(void);
int32_t isaac_lua_engine_drawstring_vec_block16_b_valid_bytes(void);

/* v52 no-arg getters (getRef helper 0x8bb070). */
uint32_t isaac_lua_engine_drawstring_getref_va(void);
uint32_t isaac_lua_engine_drawstring_getref_ret_va(void);
uint32_t isaac_lua_engine_drawstring_getref_nil_ret_va(void);
uint32_t isaac_lua_engine_drawstring_getref_body_bytes(void);
int32_t isaac_lua_engine_drawstring_getref_insn_count(void);
int32_t isaac_lua_engine_drawstring_getref_check_flags(void);
uint32_t isaac_lua_engine_drawstring_getref_registry_key(void);
int32_t isaac_lua_engine_drawstring_getref_edx_register(void);
uint32_t isaac_lua_engine_drawstring_getref_object_field_off(void);
uint32_t isaac_lua_engine_drawstring_getref_iat_lua_type(void);
uint32_t isaac_lua_engine_drawstring_getref_iat_lua_error(void);
uint32_t isaac_lua_engine_drawstring_getref_error_msg_va(void);

/* ---------------------------------------------------------------------------
 * ABI v18 — the three metatable builders shared by the class-create template.
 *
 * Shared metafield install record, 19 sites across the three builders:
 *   absindex(L, idx)            ; -2 on 18/19, -3 once (__class in class)
 *   pushstring(L, "__name")
 *   rotate(L, -2, 1)            ; 19/19
 *   rawset(L, abs)              ; table[name] = value
 *
 * Values are pushed *before* the record, one of six kinds.
 * --------------------------------------------------------------------------- */

enum {
  ISAAC_LUA_METATABLE_BUILDER_COUNT = 3,
  ISAAC_LUA_METATABLE_BUILDER_CONST = 0,
  ISAAC_LUA_METATABLE_BUILDER_CLASS = 1,
  ISAAC_LUA_METATABLE_BUILDER_STATIC = 2,
  ISAAC_LUA_METATABLE_BUILDER_CONST_VA = 0x0085d040u,
  ISAAC_LUA_METATABLE_BUILDER_CLASS_VA = 0x0085d2c0u,
  ISAAC_LUA_METATABLE_BUILDER_STATIC_VA = 0x0085d500u,
  ISAAC_LUA_METAFIELD_INSTALL_TOTAL = 19,
  ISAAC_LUA_METAFIELD_ABSINDEX_U32 = 0xfffffffeu,
  ISAAC_LUA_METAFIELD_ABSINDEX_EXCEPTION_U32 = 0xfffffffdu,
  ISAAC_LUA_METAFIELD_ROTATE_INDEX_U32 = 0xfffffffeu,
  ISAAC_LUA_METAFIELD_ROTATE_N = 1,
  ISAAC_LUA_METAFIELD_ROTATE_AGREEMENT = 19,
  ISAAC_LUA_METAFIELD_ABSINDEX_AGREEMENT = 18
};

/* Builder prologue immediates. */
enum {
  ISAAC_LUA_METATABLE_CREATETABLE_NARR = 0,
  ISAAC_LUA_METATABLE_CREATETABLE_NREC = 0,
  ISAAC_LUA_METATABLE_SELF_PUSHVALUE_INDEX_U32 = 0xffffffffu,  /* -1 */
  ISAAC_LUA_METATABLE_SETMETATABLE_INDEX_U32 = 0xfffffffeu,    /* -2 */
  ISAAC_LUA_METATABLE_STATIC_SETMETA_INDEX_U32 = 0xfffffffdu,  /* -3 */
  ISAAC_LUA_METATABLE_STATIC_NAME_ABSINDEX_U32 = 0xfffffffbu,  /* -5 */
  ISAAC_LUA_METATABLE_IDENTITY_PUSHBOOLEAN = 1,
  ISAAC_LUA_METATABLE_IDENTITY_RAWSETP_INDEX_U32 = 0xfffffffeu,
  /* Same key the ABI v11 check helper rawgetp's. */
  ISAAC_LUA_METATABLE_IDENTITY_KEY_VA = 0x00c7f4b8u,
  /* `call 0x0085c390; test al, al; je` — callee reads fs:[0x2c] + globals. */
  ISAAC_LUA_METATABLE_PROTECT_GATE_VA = 0x0085c390u,
  ISAAC_LUA_METATABLE_PROTECT_GATE_DAT_A = 0x00c7f4b4u,
  ISAAC_LUA_METATABLE_PROTECT_GATE_DAT_B = 0x00c7f4b0u
};

/* "const " prefix used to build the const metatable's __type string. */
enum {
  ISAAC_LUA_CONST_PREFIX_LEN = 6,
  ISAAC_LUA_CONST_PREFIX_SSO_CAPACITY = 0x0f,
  ISAAC_LUA_CONST_PREFIX_LO_VA = 0x00b6eaa4u, /* 'cons' */
  ISAAC_LUA_CONST_PREFIX_HI_VA = 0x00b6eaa8u, /* 't '   */
  /* The exact dword/word the PE loads at 0x0085d0ac / 0x0085d0b4. */
  ISAAC_LUA_CONST_PREFIX_LO_BYTES = 0x736e6f63u, /* "cons" */
  ISAAC_LUA_CONST_PREFIX_HI_BYTES = 0x2074u,     /* "t "   */
  ISAAC_LUA_CONST_PREFIX_CONCAT_VA = 0x0060c790u
};

/* Metafield name VAs first seen on this path (v11 already pins __type and
 * __const; __gc is ABI v7). */
enum {
  ISAAC_LUA_METAFIELD_INDEX_NAME_VA = 0x00b6ea78u,     /* "__index" */
  ISAAC_LUA_METAFIELD_NEWINDEX_NAME_VA = 0x00b6ea80u,  /* "__newindex" */
  ISAAC_LUA_METAFIELD_PROPGET_NAME_VA = 0x00b6e994u,   /* "__propget" */
  ISAAC_LUA_METAFIELD_PROPSET_NAME_VA = 0x00b6ea38u,   /* "__propset" */
  ISAAC_LUA_METAFIELD_METATABLE_NAME_VA = 0x00b6ea64u, /* "__metatable" */
  ISAAC_LUA_METAFIELD_CLASS_NAME_VA = 0x00b6ea70u      /* "__class" */
};

/* Closures the builders install (pushcclosure nups 0; address-stable). */
enum {
  ISAAC_LUA_METATABLE_INDEX_CLOSURE_VA = 0x0085cd40u,
  ISAAC_LUA_METATABLE_NEWINDEX_CLOSURE_VA = 0x0085cf30u,
  ISAAC_LUA_METATABLE_STATIC_INDEX_CLOSURE_VA = 0x0085c810u,
  ISAAC_LUA_METATABLE_STATIC_NEWINDEX_CLOSURE_VA = 0x0085c970u,
  ISAAC_LUA_METATABLE_CLOSURE_NUPS = 0
};

/* Metafield value kinds. */
enum {
  ISAAC_LUA_METAFIELD_VALUE_STRING_PREFIXED = 0, /* "const " + class name */
  ISAAC_LUA_METAFIELD_VALUE_STRING_NAME = 1,     /* bare class name */
  ISAAC_LUA_METAFIELD_VALUE_CLOSURE = 2,
  ISAAC_LUA_METAFIELD_VALUE_NEWTABLE = 3,
  ISAAC_LUA_METAFIELD_VALUE_PUSHVALUE = 4,
  ISAAC_LUA_METAFIELD_VALUE_NIL = 5
};

/* `test al, al` after the protection call — low byte only. */
int32_t isaac_lua_engine_metatable_protect_gate(uint32_t gate_return);
/* Length of the const metatable's __type string (32-bit wrap). */
uint32_t isaac_lua_engine_const_prefix_string_len(uint32_t class_name_len);

int32_t isaac_lua_engine_metatable_builder_count(void);
uint32_t isaac_lua_engine_metatable_builder_va(int32_t builder);
int32_t isaac_lua_engine_metafield_count(int32_t builder);
uint32_t isaac_lua_engine_metafield_call_va(int32_t builder, int32_t index);
uint32_t isaac_lua_engine_metafield_name_va(int32_t builder, int32_t index);
int32_t isaac_lua_engine_metafield_value_kind(int32_t builder, int32_t index);
/* Closure VA for CLOSURE entries, else 0. */
uint32_t isaac_lua_engine_metafield_value_va(int32_t builder, int32_t index);
/* Stack index for PUSHVALUE entries, else 0. */
uint32_t isaac_lua_engine_metafield_value_index(int32_t builder, int32_t index);
/* absindex immediate for this record (-2, or -3 for the one exception). */
uint32_t isaac_lua_engine_metafield_absindex(int32_t builder, int32_t index);
int32_t isaac_lua_engine_metafield_gated(int32_t builder, int32_t index);
/* Whether entry `index` runs for a given protection-gate return. */
int32_t isaac_lua_engine_metafield_installed(int32_t builder, int32_t index,
                                             uint32_t gate_return);
int32_t isaac_lua_engine_metafield_installed_count(int32_t builder,
                                                   uint32_t gate_return);

/* ---------------------------------------------------------------------------
 * ABI v19 — the property-builder family and its return contract.
 *
 * Seven members, one template. Six are 0x16a bytes / 133 instructions and
 * byte-identical except three operand fields; 0x00875960 is the folded
 * single-caller instantiation (0x172 bytes / 131 instructions). All seven
 * share one 28-call body and the same epilogue `mov eax, esi; ret 0xc` with
 * esi = the receiver saved once at [ebp-4] — return this, receiver bytes
 * never written. Family order is ascending VA.
 * --------------------------------------------------------------------------- */

enum {
  ISAAC_LUA_PROPERTY_BUILDER_COUNT = 7,
  ISAAC_LUA_PROPERTY_BUILDER_TEMPLATE_BYTES = 0x16a,
  ISAAC_LUA_PROPERTY_BUILDER_TEMPLATE_INSNS = 133,
  ISAAC_LUA_PROPERTY_BUILDER_FOLDED_BODY_BYTES = 0x172,
  ISAAC_LUA_PROPERTY_BUILDER_FOLDED_BODY_INSNS = 131,
  /* VA deltas between consecutive members: 0x170 x5, then 0x180 after the
     folded member (0x172 body padded to 0x180). */
  ISAAC_LUA_PROPERTY_BUILDER_STRIDE = 0x170,
  ISAAC_LUA_PROPERTY_BUILDER_STRIDE_AFTER_FOLDED = 0x180,
  /* ret 0xc — three dword args (name, a1, a2). */
  ISAAC_LUA_PROPERTY_BUILDER_ARG_BYTES = 0x0c,
  ISAAC_LUA_PROPERTY_BUILDER_ARG_COUNT = 3,
  /* First member VA (Vector's addData builder, already the v16 field helper). */
  ISAAC_LUA_PROPERTY_BUILDER_BASE_VA = 0x00875230u,
  ISAAC_LUA_PROPERTY_BUILDER_FOLDED_VA = 0x00875960u,
  ISAAC_LUA_PROPERTY_BUILDER_LAST_VA = 0x00875ae0u
};

/* Member kinds: which source feeds the two 4-byte userdata payloads. */
enum {
  /* both userdatas store arg2; arg3 is pushed by every caller but never
     read (census arg_disps [8, 12]) — dead third argument. */
  ISAAC_LUA_PROPERTY_BUILDER_KIND_SHARED_ARG = 0,
  /* getter ud = arg2, setter ud = arg3 (arg_disps [8, 12, 16]). */
  ISAAC_LUA_PROPERTY_BUILDER_KIND_SPLIT_ARG = 1,
  /* no stack args read at all (arg_disps []) yet still ret 0xc; name and
     both ud values are folded immediates. */
  ISAAC_LUA_PROPERTY_BUILDER_KIND_FOLDED = 2
};

/* Whole-body call census — identical ordered sequence in all 7 members. */
enum {
  ISAAC_LUA_PROPERTY_BUILDER_CALL_COUNT = 28,
  ISAAC_LUA_PROPERTY_BUILDER_ABSINDEX_CALLS = 6,
  ISAAC_LUA_PROPERTY_BUILDER_PUSHSTRING_CALLS = 6,
  ISAAC_LUA_PROPERTY_BUILDER_RAWGET_CALLS = 3,
  ISAAC_LUA_PROPERTY_BUILDER_NEWUSERDATA_CALLS = 2,
  ISAAC_LUA_PROPERTY_BUILDER_PUSHCCLOSURE_CALLS = 2,
  ISAAC_LUA_PROPERTY_BUILDER_PUSHVALUE_CALLS = 1,
  ISAAC_LUA_PROPERTY_BUILDER_ROTATE_CALLS = 3,
  ISAAC_LUA_PROPERTY_BUILDER_RAWSET_CALLS = 3,
  ISAAC_LUA_PROPERTY_BUILDER_SETTOP_CALLS = 2
};

/* Byte-diff census against representative 0x00875510 (exact measured
 * counts) and the three operand-field offsets that contain every diff. */
enum {
  ISAAC_LUA_PROPERTY_BUILDER_REP_VA = 0x00875510u,
  ISAAC_LUA_PROPERTY_BUILDER_DIFF_BYTES_SHARED = 7,  /* 0x875230 / 0x8753a0 */
  ISAAC_LUA_PROPERTY_BUILDER_DIFF_BYTES_SPLIT = 4,   /* 680 / 7f0 / ae0 */
  ISAAC_LUA_PROPERTY_BUILDER_GET_TRAMP_IMM_OFF = 0x62,
  ISAAC_LUA_PROPERTY_BUILDER_SET_TRAMP_IMM_OFF = 0x118,
  ISAAC_LUA_PROPERTY_BUILDER_GET_UD_DISP_OFF = 0x5e,
  ISAAC_LUA_PROPERTY_BUILDER_SET_UD_DISP_OFF = 0x114,
  /* mov ecx, [ebp+disp8] source disp per kind. */
  ISAAC_LUA_PROPERTY_BUILDER_UD_DISP_ARG2 = 0x0c,
  ISAAC_LUA_PROPERTY_BUILDER_UD_DISP_ARG3 = 0x10,
  /* Folded derivation: template + trampoline imms + 3x name-push ->
     push-imm32 + 2x load+store -> mov [eax],imm32 + exactly two local
     scheduling swaps of (mov esi,eax / push edi) = byte-exact. */
  ISAAC_LUA_PROPERTY_BUILDER_FOLDED_NAME_PUSHES = 3,
  ISAAC_LUA_PROPERTY_BUILDER_FOLDED_UD_IMM_STORES = 2,
  ISAAC_LUA_PROPERTY_BUILDER_FOLDED_SCHED_SWAPS = 2
};

/* The shared stack program (relative indices as u32 immediates).
 * Getter half: rawget __propget of the tables at -2 then -4; closure with
 * the ud upvalue; pushvalue(-1); install into absindex(-4) then absindex(-2)
 * via the ABI v9/v15/v18 record (absindex / pushstring / rotate(-2,1) /
 * rawset — fourth independent path); settop(-3).
 * Setter half: rawget __propset at -2; closure; one install at
 * absindex(-2); settop(-2). */
enum {
  ISAAC_LUA_PROPERTY_BUILDER_PROPGET_RAWGET_A_U32 = 0xfffffffeu, /* -2 */
  ISAAC_LUA_PROPERTY_BUILDER_PROPGET_RAWGET_B_U32 = 0xfffffffcu, /* -4 */
  ISAAC_LUA_PROPERTY_BUILDER_GET_INSTALL_ABS_A_U32 = 0xfffffffcu, /* -4 */
  ISAAC_LUA_PROPERTY_BUILDER_GET_INSTALL_ABS_B_U32 = 0xfffffffeu, /* -2 */
  ISAAC_LUA_PROPERTY_BUILDER_GET_SETTOP_U32 = 0xfffffffdu,        /* -3 */
  ISAAC_LUA_PROPERTY_BUILDER_PROPSET_RAWGET_U32 = 0xfffffffeu,    /* -2 */
  ISAAC_LUA_PROPERTY_BUILDER_SET_INSTALL_ABS_U32 = 0xfffffffeu,   /* -2 */
  ISAAC_LUA_PROPERTY_BUILDER_SET_SETTOP_U32 = 0xfffffffeu,        /* -2 */
  ISAAC_LUA_PROPERTY_BUILDER_PUSHVALUE_INDEX_U32 = 0xffffffffu,   /* -1 */
  ISAAC_LUA_PROPERTY_BUILDER_ROTATE_INDEX_U32 = 0xfffffffeu,      /* -2 */
  ISAAC_LUA_PROPERTY_BUILDER_ROTATE_N = 1,
  /* == ABI v4 REGISTER_USERDATA_SIZE / v5 REGISTER_METHOD_CLOSURE_NUPS. */
  ISAAC_LUA_PROPERTY_BUILDER_UD_SIZE = 0x04,
  ISAAC_LUA_PROPERTY_BUILDER_CLOSURE_NUPS = 0x01,
  /* add esp cleanups in body order; total = the 61 argument dwords the 28
     calls push (0 mismatch). */
  ISAAC_LUA_PROPERTY_BUILDER_CLEAN_A = 0x44,
  ISAAC_LUA_PROPERTY_BUILDER_CLEAN_B = 0x48,
  ISAAC_LUA_PROPERTY_BUILDER_CLEAN_C = 0x44,
  ISAAC_LUA_PROPERTY_BUILDER_CLEAN_D = 0x24,
  ISAAC_LUA_PROPERTY_BUILDER_CLEAN_TOTAL = 0xf4,
  ISAAC_LUA_PROPERTY_BUILDER_ARG_DWORDS = 61,
  /* Return-contract census, identical in all 7: entry ecx stored once at
     [ebp-4], read back 6x; only memory writes are the two ud stores. */
  ISAAC_LUA_PROPERTY_BUILDER_THIS_SAVE_COUNT = 1,
  ISAAC_LUA_PROPERTY_BUILDER_THIS_READ_COUNT = 6
};

/* Property names pushed by the body — exactly the v18 metafield name VAs
 * the metatable builders install those tables under (writer/reader
 * confirmation, same standard as the v18 identity key). */
enum {
  ISAAC_LUA_PROPERTY_BUILDER_PROPGET_NAME_VA = 0x00b6e994u,
  ISAAC_LUA_PROPERTY_BUILDER_PROPSET_NAME_VA = 0x00b6ea38u
};

/* IAT slots the family calls (import-directory resolved this unit; extends
 * the v16/v17 slot pins — same Lua5.3.3r.dll surface as ABI v9's map). */
enum {
  ISAAC_LUA_IAT_LUA_ABSINDEX_VA = 0x00b18418u,
  ISAAC_LUA_IAT_LUA_PUSHSTRING_VA = 0x00b18414u,
  ISAAC_LUA_IAT_LUA_ROTATE_VA = 0x00b1840cu,
  ISAAC_LUA_IAT_LUA_RAWSET_VA = 0x00b18408u,
  ISAAC_LUA_IAT_LUA_NEWUSERDATA_VA = 0x00b1839cu
};

/* Folded member 0x00875960: name/ud immediates and the single image-wide
 * caller, which pushes exactly the folded values (machine-proven LTCG
 * constant folding). 0x00b6508c is "Color" — pooled with the Color class
 * name (per-class table cls 5); asserted as VA equality only. */
enum {
  ISAAC_LUA_PROPERTY_BUILDER_FOLDED_NAME_VA = 0x00b6508cu,
  ISAAC_LUA_PROPERTY_BUILDER_FOLDED_GET_UD = 0x00407410u,
  ISAAC_LUA_PROPERTY_BUILDER_FOLDED_SET_UD = 0x004073d0u,
  ISAAC_LUA_PROPERTY_BUILDER_FOLDED_CALLER_VA = 0x0086754eu,
  ISAAC_LUA_PROPERTY_BUILDER_FOLDED_CALLER_COUNT = 1
};

/* Image-wide call-site census (E8 scan of all of .text): 20 sites, all in
 * the RegisterClasses body. */
enum {
  ISAAC_LUA_PROPERTY_BUILDER_CALLSITE_TOTAL = 20,
  ISAAC_LUA_PROPERTY_BUILDER_CALLSITES_OUTSIDE_RC = 0
};

/* v19 span resolution axis (see the v17 span_status recharacterization).
 * populated == (resolution != UNRESOLVED). */
enum {
  ISAAC_LUA_CLASS_SPAN_RESOLVED_DIRECT = 0,
  ISAAC_LUA_CLASS_SPAN_RESOLVED_RETURN_CONTRACT = 1,
  ISAAC_LUA_CLASS_SPAN_UNRESOLVED = 2
};

/* Color / Sprite population census (receiver-agreement evidence). */
enum {
  ISAAC_LUA_CLASS_COLOR_INSTALLS = 7,
  ISAAC_LUA_CLASS_COLOR_FIELDS = 7,
  ISAAC_LUA_CLASS_SPRITE_INSTALLS = 38,
  ISAAC_LUA_CLASS_SPRITE_FIELDS = 7,
  /* receiver sites resolved / total (installs + fields). */
  ISAAC_LUA_CLASS_COLOR_RECEIVER_SITES = 14,
  ISAAC_LUA_CLASS_SPRITE_RECEIVER_SITES = 45,
  /* [esi]-form install receivers inside each span (the structural fact
     behind SPAN_MIXED_RECEIVER). */
  ISAAC_LUA_CLASS_COLOR_BASE_RECEIVER_INSTALLS = 6,
  ISAAC_LUA_CLASS_SPRITE_BASE_RECEIVER_INSTALLS = 4,
  /* span slots ([ebp - slot] the create call wrote). */
  ISAAC_LUA_CLASS_COLOR_SLOT_DISP = 0x24,
  ISAAC_LUA_CLASS_SPRITE_SLOT_DISP = 0x14
};

/* Family member table. Out-of-range index returns 0 / -1. */
int32_t isaac_lua_engine_property_builder_count(void);
uint32_t isaac_lua_engine_property_builder_va(int32_t index);
int32_t isaac_lua_engine_property_builder_kind(int32_t index);
uint32_t isaac_lua_engine_property_builder_get_trampoline_va(int32_t index);
uint32_t isaac_lua_engine_property_builder_set_trampoline_va(int32_t index);
uint32_t isaac_lua_engine_property_builder_body_bytes(int32_t index);
uint32_t isaac_lua_engine_property_builder_body_insns(int32_t index);
int32_t isaac_lua_engine_property_builder_callsite_count(int32_t index);
/* Inverse of the member list: exact member VA -> index, else -1. */
int32_t isaac_lua_engine_property_builder_index_for_va(uint32_t va);
/* Stride law: VA of member index+1 from member index (0 out of range). */
uint32_t isaac_lua_engine_property_builder_next_va(int32_t index);

/* Return contract: eax = entry ecx (PE mov eax, esi; esi = [ebp-4]). */
uint32_t isaac_lua_engine_property_builder_return_this(uint32_t this_ptr);
/* Chained builder entry receiver: `mov ecx, eax` of the previous return —
 * identity, so chains keep the receiver invariant. */
uint32_t isaac_lua_engine_property_builder_chain_receiver(uint32_t prev_return);
/* The state field the [esi]-receiver installs read: this + 0 (the ABI v5
 * stack-ref state offset; the body never writes through this). */
uint32_t isaac_lua_engine_property_builder_state_addr(uint32_t this_ptr);
/* Userdata payload sources by member kind (folded members ignore both
 * args and return the folded immediates). */
uint32_t isaac_lua_engine_property_builder_getter_ud_value(int32_t index,
                                                           uint32_t arg2,
                                                           uint32_t arg3);
uint32_t isaac_lua_engine_property_builder_setter_ud_value(int32_t index,
                                                           uint32_t arg2,
                                                           uint32_t arg3);

/* Folded member immediates. */
uint32_t isaac_lua_engine_property_builder_folded_name_va(void);
uint32_t isaac_lua_engine_property_builder_folded_get_ud(void);
uint32_t isaac_lua_engine_property_builder_folded_set_ud(void);
uint32_t isaac_lua_engine_property_builder_folded_caller_va(void);

/* v19 span resolution axis. -1 out of range. */
int32_t isaac_lua_engine_register_class_span_resolution(int32_t cls);

/* Per-field call site and builder VAs (0 when unrecorded / out of range).
 * Sprite's builders are heterogeneous, so its class-level field_helper_va
 * is 0 and the per-entry accessor carries the real builder. */
uint32_t isaac_lua_engine_register_class_field_call_va(int32_t cls,
                                                       int32_t index);
uint32_t isaac_lua_engine_register_class_field_builder_va(int32_t cls,
                                                          int32_t index);

/* ---------------------------------------------------------------------------
 * ABI v20 — the EntityRef data-builder band 0x00875c50…0x008763b0.
 *
 * Six members, one template — the exact 28-call body of the v19 property
 * builders (absindex 6 / pushstring 6 / rawget 3 / newuserdata 2 /
 * pushcclosure 2 / pushvalue 1 / rotate 3 / rawset 3 / settop 2), with
 * per-member closure immediates and userdata sources. The band is the
 * v19-recorded sibling of 0x00875230…0x00875ae0 and sits immediately after
 * it; a whole-image census of the 28-call program finds exactly these 6
 * members between the v19 family and the next run (0x00876530…): the v19
 * family is indices 0..6 of that census, the band 7..12 (0x00875c50,
 * 0x00875dd0, 0x00875f40, 0x008760c0, 0x00876240, 0x008763b0), and the
 * rest are other classes' builder runs.
 *
 * Members by ascending VA (property, callsites, get/set closure, ud):
 *   0 0x00875c50 "Type"          folded  1 site  0x8bb900 / 0x8bb960  ud 0/0
 *   1 0x00875dd0 "Variant"       arg     2 sites 0x8bb9c0 / 0x8bb960  ud arg2/arg2
 *   2 0x00875f40 "SpawnerType"   folded  1 site  0x8bba20 / 0x8bb960  ud 8/8
 *   3 0x008760c0 "Position"      folded  1 site  0x8bba80 / 0x8bbb20  ud 0x10/0x10
 *   4 0x00876240 "IsCharmed"     arg     2 sites 0x89e4c0 / 0x89e450  ud arg2/arg3
 *   5 0x008763b0 "Entity"        folded  1 site  0x8bbbc0 / 0x8bbc60  ud 0x24/0x24
 *
 * Kinds mirror v19: SHARED_ARG (both uds = arg2, arg3 dead), SPLIT_ARG
 * (arg2/arg3), FOLDED (no stack args read yet still ret 0xc; the 3 name
 * pushes and 2 ud stores are immediates). FOLDED members are 0x172 bytes /
 * 131 instructions, ARG members 0x16a / 133; each body is padded with
 * int3 to a 0x10 multiple, so the next-member stride is 0x180 after a
 * FOLDED member and 0x170 after an ARG member (the v19 stride law).
 *
 * FOLDED derivation from the ARG template (v19 §4 precedent, machine
 * verified on all four folded members): (a) own get/set closure imms,
 * (b) 3x name-push `push [ebp+8]` -> `push imm32`, (c) 2x
 * `mov ecx,[ebp+0xc]/0x10; mov [eax],ecx` -> `mov [eax],imm32`,
 * (d) 2 scheduling swaps of `mov esi,eax` / `push edi` around name pushes
 * 1 and 2 (the setter-install name push keeps the ARG schedule).
 * 0 mismatches over all six members (capstone whole-body census).
 *
 * The folded immediates equal the single image-wide caller's pushed args
 * on all four (machine cross-check): e.g. 0x875c50's caller 0x00867686
 * pushes (0x00b6d1a4, 0, 1), its body folds name 0x00b6d1a4 and ud 0/0.
 * Callsites (8 total, all in the RegisterClasses EntityRef span):
 *   0x00867686 / 0x008676a6 / 0x008676c6 / 0x00867702 folded members;
 *   0x00867696 + 0x008676b6 (Variant / SpawnerVariant) and
 *   0x008676dc + 0x008676f2 (IsCharmed / IsFriendly) the ARG members.
 *
 * Return contract identical to v19: entry ecx stored once to [ebp-4],
 * read back 6x, only memory writes are the two ud stores, epilogue
 * mov eax, esi with esi = [ebp-4] — return this, receiver never written
 * (verified for both an ARG and a FOLDED representative).
 * --------------------------------------------------------------------------- */

enum {
  ISAAC_LUA_ENTITYREF_BAND_COUNT = 6,
  ISAAC_LUA_ENTITYREF_BAND_TEMPLATE_BYTES = 0x16a,  /* ARG body */
  ISAAC_LUA_ENTITYREF_BAND_TEMPLATE_INSNS = 133,
  ISAAC_LUA_ENTITYREF_BAND_FOLDED_BODY_BYTES = 0x172,
  ISAAC_LUA_ENTITYREF_BAND_FOLDED_BODY_INSNS = 131,
  /* next-member stride: 0x170 after ARG (0x16a padded to 0x170),
     0x180 after FOLDED (0x172 padded to 0x180) — body pad to 0x10. */
  ISAAC_LUA_ENTITYREF_BAND_STRIDE = 0x170,
  ISAAC_LUA_ENTITYREF_BAND_STRIDE_AFTER_FOLDED = 0x180,
  ISAAC_LUA_ENTITYREF_BAND_BASE_VA = 0x00875c50u,
  ISAAC_LUA_ENTITYREF_BAND_LAST_VA = 0x008763b0u,
  /* ret 0xc — three dword args (name, a1, a2). */
  ISAAC_LUA_ENTITYREF_BAND_ARG_BYTES = 0x0c,
  ISAAC_LUA_ENTITYREF_BAND_ARG_COUNT = 3
};

/* Member kinds (v19 kinds reused). */
enum {
  ISAAC_LUA_ENTITYREF_BAND_KIND_SHARED_ARG = 0, /* 0x875dd0: ud arg2/arg2 */
  ISAAC_LUA_ENTITYREF_BAND_KIND_SPLIT_ARG = 1,  /* 0x876240: ud arg2/arg3 */
  ISAAC_LUA_ENTITYREF_BAND_KIND_FOLDED = 2      /* 4 members, immediates */
};

/* The shared stack program is byte-identical to v19's (same 28 calls,
   same stack indices, same cleanups). Constants reused from the
   property-builder block (CALL_COUNT / cleanups / ud size / nups). */
enum {
  ISAAC_LUA_ENTITYREF_BAND_CALL_COUNT = 28,
  ISAAC_LUA_ENTITYREF_BAND_ABSINDEX_CALLS = 6,
  ISAAC_LUA_ENTITYREF_BAND_PUSHSTRING_CALLS = 6,
  ISAAC_LUA_ENTITYREF_BAND_RAWGET_CALLS = 3,
  ISAAC_LUA_ENTITYREF_BAND_NEWUSERDATA_CALLS = 2,
  ISAAC_LUA_ENTITYREF_BAND_PUSHCCLOSURE_CALLS = 2,
  ISAAC_LUA_ENTITYREF_BAND_PUSHVALUE_CALLS = 1,
  ISAAC_LUA_ENTITYREF_BAND_ROTATE_CALLS = 3,
  ISAAC_LUA_ENTITYREF_BAND_RAWSET_CALLS = 3,
  ISAAC_LUA_ENTITYREF_BAND_SETTOP_CALLS = 2,
  ISAAC_LUA_ENTITYREF_BAND_UD_SIZE = 0x04,      /* == v4 REGISTER_USERDATA_SIZE */
  ISAAC_LUA_ENTITYREF_BAND_CLOSURE_NUPS = 0x01, /* == v5 METHOD_CLOSURE_NUPS */
  /* cleanups in body order — same 61 arg dwords as v19. */
  ISAAC_LUA_ENTITYREF_BAND_CLEAN_A = 0x44,
  ISAAC_LUA_ENTITYREF_BAND_CLEAN_B = 0x48,
  ISAAC_LUA_ENTITYREF_BAND_CLEAN_C = 0x44,
  ISAAC_LUA_ENTITYREF_BAND_CLEAN_D = 0x24,
  ISAAC_LUA_ENTITYREF_BAND_CLEAN_TOTAL = 0xf4,
  ISAAC_LUA_ENTITYREF_BAND_ARG_DWORDS = 61,
  /* return-contract census, identical to v19 (1 save / 6 reads). */
  ISAAC_LUA_ENTITYREF_BAND_THIS_SAVE_COUNT = 1,
  ISAAC_LUA_ENTITYREF_BAND_THIS_READ_COUNT = 6,
  /* folded derivation deltas (v19 §4 numbers, re-verified). */
  ISAAC_LUA_ENTITYREF_BAND_FOLDED_NAME_PUSHES = 3,
  ISAAC_LUA_ENTITYREF_BAND_FOLDED_UD_IMM_STORES = 2,
  ISAAC_LUA_ENTITYREF_BAND_FOLDED_SCHED_SWAPS = 2
};

/* Byte-diff offsets inside the ARG template — the same three operand
 * fields v19 measured on its sibling template. */
enum {
  ISAAC_LUA_ENTITYREF_BAND_GET_CLOSURE_IMM_OFF = 0x62,
  ISAAC_LUA_ENTITYREF_BAND_GET_UD_DISP_OFF = 0x5e,
  ISAAC_LUA_ENTITYREF_BAND_SET_UD_DISP_OFF = 0x114,
  ISAAC_LUA_ENTITYREF_BAND_SET_CLOSURE_IMM_OFF = 0x118
};

/* The body rawgets the same v18 metafield tables as v19 (shared VAs). */
enum {
  ISAAC_LUA_ENTITYREF_BAND_PROPGET_NAME_VA = 0x00b6e994u,
  ISAAC_LUA_ENTITYREF_BAND_PROPSET_NAME_VA = 0x00b6ea38u
};

/* Property-name rdata VAs folded into the 4 single-caller members. */
enum {
  ISAAC_LUA_ENTITYREF_BAND_TYPE_NAME_VA = 0x00b6d1a4u,      /* "Type" */
  ISAAC_LUA_ENTITYREF_BAND_SPAWNER_TYPE_NAME_VA = 0x00b706e4u, /* "SpawnerType" */
  ISAAC_LUA_ENTITYREF_BAND_POSITION_NAME_VA = 0x00b65080u,  /* "Position" */
  ISAAC_LUA_ENTITYREF_BAND_ENTITY_NAME_VA = 0x00b706b8u     /* "Entity" */
};

/* Image-wide call-site census: 8 sites, all inside the RegisterClasses
 * EntityRef span (0x00867686 … 0x00867702). */
enum {
  ISAAC_LUA_ENTITYREF_BAND_CALLSITE_TOTAL = 8,
  ISAAC_LUA_ENTITYREF_BAND_CALLSITES_OUTSIDE_RC = 0,
  ISAAC_LUA_ENTITYREF_BAND_FIRST_CALLSITE_VA = 0x00867686u
};

/* ARG members' name pushes read [ebp+8]; folded members push the name imm
 * 3x. The getter ud source disp is 0x0c in every ARG member; the setter
 * disp is 0x0c (SHARED) or 0x10 (SPLIT). */
enum {
  ISAAC_LUA_ENTITYREF_BAND_UD_DISP_ARG2 = 0x0c,
  ISAAC_LUA_ENTITYREF_BAND_UD_DISP_ARG3 = 0x10
};

/* Family member table. Out-of-range index returns 0 / -1. */
int32_t isaac_lua_engine_entityref_data_builder_count(void);
uint32_t isaac_lua_engine_entityref_data_builder_va(int32_t index);
int32_t isaac_lua_engine_entityref_data_builder_kind(int32_t index);
uint32_t isaac_lua_engine_entityref_data_builder_get_closure_va(int32_t index);
uint32_t isaac_lua_engine_entityref_data_builder_set_closure_va(int32_t index);
uint32_t isaac_lua_engine_entityref_data_builder_body_bytes(int32_t index);
uint32_t isaac_lua_engine_entityref_data_builder_body_insns(int32_t index);
int32_t isaac_lua_engine_entityref_data_builder_callsite_count(int32_t index);
uint32_t isaac_lua_engine_entityref_data_builder_first_call_site_va(int32_t index);
/* Inverse of the member list: exact member VA -> index, else -1. */
int32_t isaac_lua_engine_entityref_data_builder_index_for_va(uint32_t va);
/* Stride law: VA of member index+1 (0 out of range / last). */
uint32_t isaac_lua_engine_entityref_data_builder_next_va(int32_t index);

/* Return contract: eax = entry ecx (PE mov eax, esi; esi = [ebp-4]). */
uint32_t isaac_lua_engine_entityref_data_builder_return_this(uint32_t this_ptr);
/* Userdata payload sources by kind (FOLDED members ignore args). */
uint32_t isaac_lua_engine_entityref_data_builder_getter_ud_value(int32_t index,
                                                                 uint32_t arg2,
                                                                 uint32_t arg3);
uint32_t isaac_lua_engine_entityref_data_builder_setter_ud_value(int32_t index,
                                                                 uint32_t arg2,
                                                                 uint32_t arg3);
/* Folded immediates (0 for ARG members / out of range). */
uint32_t isaac_lua_engine_entityref_data_builder_folded_name_va(int32_t index);
uint32_t isaac_lua_engine_entityref_data_builder_folded_get_ud(int32_t index);
uint32_t isaac_lua_engine_entityref_data_builder_folded_set_ud(int32_t index);

/* ---------------------------------------------------------------------------
 * ABI v21 — the whole-image property-builder population.
 *
 * 173 members, one template, 394 call sites. See the v21 changelog entry
 * above for the six laws (L1 ARG bytes, L2 FOLDED bytes, L3 one-template
 * edit script, L4 caller-arg derivation, L5 fold <=> single caller, L6
 * alignment and its two exceptions), each censused over the whole body.
 * --------------------------------------------------------------------------- */

enum {
  ISAAC_LUA_PROPERTY_FAMILY_COUNT = 173,
  ISAAC_LUA_PROPERTY_FAMILY_PROLOGUE_HITS = 195,
  ISAAC_LUA_PROPERTY_FAMILY_BASE_VA = 0x00875230u,
  ISAAC_LUA_PROPERTY_FAMILY_LAST_VA = 0x008952b0u,
  ISAAC_LUA_PROPERTY_FAMILY_CALLSITE_TOTAL = 394,
  ISAAC_LUA_PROPERTY_FAMILY_CALLSITE_LO_VA = 0x00866c86u,
  ISAAC_LUA_PROPERTY_FAMILY_CALLSITE_HI_VA = 0x0086da12u,
  ISAAC_LUA_PROPERTY_FAMILY_DISTINCT_NAMES = 79
};

/* The two orthogonal axes. `kind` below is the lossy v19 projection. */
enum {
  ISAAC_LUA_PROPERTY_FAMILY_ARG_MEMBERS = 80,
  ISAAC_LUA_PROPERTY_FAMILY_FOLDED_MEMBERS = 93,
  ISAAC_LUA_PROPERTY_FAMILY_SHARED_MEMBERS = 119,
  ISAAC_LUA_PROPERTY_FAMILY_SPLIT_MEMBERS = 54,
  ISAAC_LUA_PROPERTY_FAMILY_ARG_SHARED = 53,
  ISAAC_LUA_PROPERTY_FAMILY_ARG_SPLIT = 27,
  ISAAC_LUA_PROPERTY_FAMILY_FOLDED_SHARED = 66,
  ISAAC_LUA_PROPERTY_FAMILY_FOLDED_SPLIT = 27
};

/* Body shape is a total function of the fold axis — no third shape exists
   anywhere in the image. */
enum {
  ISAAC_LUA_PROPERTY_FAMILY_ARG_BODY_BYTES = 0x16a,
  ISAAC_LUA_PROPERTY_FAMILY_ARG_BODY_INSNS = 133,
  ISAAC_LUA_PROPERTY_FAMILY_FOLDED_BODY_BYTES = 0x172,
  ISAAC_LUA_PROPERTY_FAMILY_FOLDED_BODY_INSNS = 131,
  /* 2 ud sites at +1 B and 3 name pushes at +2 B. */
  ISAAC_LUA_PROPERTY_FAMILY_FOLD_SIZE_DELTA = 8,
  ISAAC_LUA_PROPERTY_FAMILY_FOLD_UD_SITE_DELTA = 1,
  ISAAC_LUA_PROPERTY_FAMILY_FOLD_NAME_SITE_DELTA = 2,
  ISAAC_LUA_PROPERTY_FAMILY_FOLD_UD_SITES = 2,
  ISAAC_LUA_PROPERTY_FAMILY_FOLD_NAME_SITES = 3,
  /* only name pushes 1 and 2 swap `mov esi,eax` / `push edi`. */
  ISAAC_LUA_PROPERTY_FAMILY_FOLD_SCHED_SWAPS = 2
};

/* L1: the four ARG operand fields. Every ARG member is the representative
   with exactly these overwritten — 0 of 80 differ anywhere else. */
enum {
  ISAAC_LUA_PROPERTY_TEMPLATE_ARG_REP_VA = 0x00875510u,
  ISAAC_LUA_PROPERTY_TEMPLATE_ARG_GET_UD_DISP_OFF = 0x5e,
  ISAAC_LUA_PROPERTY_TEMPLATE_ARG_GET_CLOSURE_OFF = 0x62,
  ISAAC_LUA_PROPERTY_TEMPLATE_ARG_SET_UD_DISP_OFF = 0x114,
  ISAAC_LUA_PROPERTY_TEMPLATE_ARG_SET_CLOSURE_OFF = 0x118,
  ISAAC_LUA_PROPERTY_TEMPLATE_ARG_FIELDS = 4,
  /* `push dword ptr [ebp+8]` sites the fold rewrites to `push imm32`. */
  ISAAC_LUA_PROPERTY_TEMPLATE_ARG_NAME_PUSH_A_OFF = 0x88,
  ISAAC_LUA_PROPERTY_TEMPLATE_ARG_NAME_PUSH_B_OFF = 0xb7,
  ISAAC_LUA_PROPERTY_TEMPLATE_ARG_NAME_PUSH_C_OFF = 0x136,
  /* mov ecx,[ebp+disp8] source disp per shared axis. */
  ISAAC_LUA_PROPERTY_TEMPLATE_UD_DISP_ARG2 = 0x0c,
  ISAAC_LUA_PROPERTY_TEMPLATE_UD_DISP_ARG3 = 0x10
};

/* L2: the seven FOLDED imm32 fields; 21 of 370 body bytes ever vary. */
enum {
  ISAAC_LUA_PROPERTY_TEMPLATE_FOLDED_REP_VA = 0x00875960u,
  ISAAC_LUA_PROPERTY_TEMPLATE_FOLDED_GET_CLOSURE_OFF = 0x5f,
  ISAAC_LUA_PROPERTY_TEMPLATE_FOLDED_GET_UD_OFF = 0x65,
  ISAAC_LUA_PROPERTY_TEMPLATE_FOLDED_NAME_A_OFF = 0x8a,
  ISAAC_LUA_PROPERTY_TEMPLATE_FOLDED_NAME_B_OFF = 0xbb,
  ISAAC_LUA_PROPERTY_TEMPLATE_FOLDED_SET_CLOSURE_OFF = 0x11a,
  ISAAC_LUA_PROPERTY_TEMPLATE_FOLDED_SET_UD_OFF = 0x120,
  ISAAC_LUA_PROPERTY_TEMPLATE_FOLDED_NAME_C_OFF = 0x13d,
  ISAAC_LUA_PROPERTY_TEMPLATE_FOLDED_FIELDS = 7,
  ISAAC_LUA_PROPERTY_TEMPLATE_FOLDED_VARIABLE_BYTES = 21,
  ISAAC_LUA_PROPERTY_TEMPLATE_FOLDED_INVARIANT_BYTES = 349,
  /* each field varies in its low 3 bytes only — every folded value is
     below 0x01000000, so the top byte is 0x00 image-wide. */
  ISAAC_LUA_PROPERTY_TEMPLATE_FOLDED_FIELD_VARY_BYTES = 3,
  ISAAC_LUA_PROPERTY_TEMPLATE_FOLDED_VALUE_LIMIT = 0x01000000u
};

/* L6: int3 pad to 0x10; two ARG members get an extra 0x10 of padding. */
enum {
  ISAAC_LUA_PROPERTY_FAMILY_BODY_ALIGN = 0x10,
  ISAAC_LUA_PROPERTY_FAMILY_ADJACENT_PAIRS = 102,
  ISAAC_LUA_PROPERTY_FAMILY_ALIGN_LAW_EXACT = 100,
  ISAAC_LUA_PROPERTY_FAMILY_ALIGN_EXCEPTIONS = 2,
  ISAAC_LUA_PROPERTY_FAMILY_ALIGN_EXC_A_VA = 0x0087ddd0u,
  ISAAC_LUA_PROPERTY_FAMILY_ALIGN_EXC_B_VA = 0x0088be50u,
  ISAAC_LUA_PROPERTY_FAMILY_ALIGN_EXC_PAD_BYTES = 22,
  ISAAC_LUA_PROPERTY_FAMILY_ALIGN_NORMAL_ARG_PAD = 6,
  ISAAC_LUA_PROPERTY_FAMILY_NON_ADJACENT_PAIRS = 70
};

/* L4/L5 census results (0 mismatches, 0 unexplained). */
enum {
  ISAAC_LUA_PROPERTY_CENSUS_ARG_EXACT = 80,
  ISAAC_LUA_PROPERTY_CENSUS_ARG_MISMATCH = 0,
  ISAAC_LUA_PROPERTY_CENSUS_ARG_OUTSIDE_FIELDS = 0,
  ISAAC_LUA_PROPERTY_CENSUS_FOLDED_EXACT = 93,
  ISAAC_LUA_PROPERTY_CENSUS_FOLDED_MISMATCH = 0,
  ISAAC_LUA_PROPERTY_CENSUS_EDIT_SCRIPT_EXACT = 93,
  ISAAC_LUA_PROPERTY_CENSUS_NAME_IS_ARG1 = 93,
  ISAAC_LUA_PROPERTY_CENSUS_GET_UD_IS_ARG2 = 93,
  ISAAC_LUA_PROPERTY_CENSUS_SET_UD_IS_ARG2 = 66,
  ISAAC_LUA_PROPERTY_CENSUS_SET_UD_IS_ARG3 = 27,
  ISAAC_LUA_PROPERTY_CENSUS_CALLER_UNEXPLAINED = 0,
  /* the dead third argument: 65 of the 66 SHARED callers push literal 1. */
  ISAAC_LUA_PROPERTY_FAMILY_DEAD_ARG3_SENTINEL = 1,
  ISAAC_LUA_PROPERTY_FAMILY_DEAD_ARG3_SENTINEL_SITES = 65,
  /* cross-family agreement with the v19 (7) and v20 (6) tables. */
  ISAAC_LUA_PROPERTY_CENSUS_LEGACY_ROWS = 13,
  ISAAC_LUA_PROPERTY_CENSUS_LEGACY_DISAGREEMENTS = 0
};

/* Member table. Out-of-range index returns 0 / -1 throughout. */
int32_t isaac_lua_engine_property_family_count(void);
uint32_t isaac_lua_engine_property_family_va(int32_t index);
/* Fold axis: name and both uds are immediates (1) or stack args (0). */
int32_t isaac_lua_engine_property_family_is_folded(int32_t index);
/* Shared axis: setter ud is arg2 (1) or arg3 (0). Meaningful for FOLDED
   members too — it is how the folded immediate was derived (L4). */
int32_t isaac_lua_engine_property_family_is_shared(int32_t index);
/* Lossy v19 projection: SHARED_ARG / SPLIT_ARG / FOLDED. */
int32_t isaac_lua_engine_property_family_kind(int32_t index);
uint32_t isaac_lua_engine_property_family_get_closure_va(int32_t index);
uint32_t isaac_lua_engine_property_family_set_closure_va(int32_t index);
/* Shape from the fold axis alone (L1/L2). */
uint32_t isaac_lua_engine_property_family_body_bytes(int32_t index);
uint32_t isaac_lua_engine_property_family_body_insns(int32_t index);
/* L6 padding law: va + pad16(body bytes). NOT the successor VA — see the
   two exceptions and the 70 non-adjacent pairs. */
uint32_t isaac_lua_engine_property_family_body_end_va(int32_t index);
/* Censused successor (0 at the last member); 1 iff it equals body_end_va. */
uint32_t isaac_lua_engine_property_family_next_va(int32_t index);
int32_t isaac_lua_engine_property_family_is_adjacent(int32_t index);
int32_t isaac_lua_engine_property_family_callsite_count(int32_t index);
uint32_t isaac_lua_engine_property_family_first_callsite_va(int32_t index);
/* Exact member VA -> index, else -1. */
int32_t isaac_lua_engine_property_family_index_for_va(uint32_t va);
/* Per-member folded immediates (0 for ARG members). */
uint32_t isaac_lua_engine_property_family_folded_name_va(int32_t index);
uint32_t isaac_lua_engine_property_family_folded_get_ud(int32_t index);
uint32_t isaac_lua_engine_property_family_folded_set_ud(int32_t index);
/* Operand sources. FOLDED members ignore the arguments entirely. */
uint32_t isaac_lua_engine_property_family_name_value(int32_t index,
                                                     uint32_t arg1);
uint32_t isaac_lua_engine_property_family_getter_ud_value(int32_t index,
                                                          uint32_t arg2,
                                                          uint32_t arg3);
uint32_t isaac_lua_engine_property_family_setter_ud_value(int32_t index,
                                                          uint32_t arg2,
                                                          uint32_t arg3);
/* Return contract, identical in all 173: eax = entry ecx. */
uint32_t isaac_lua_engine_property_family_return_this(uint32_t this_ptr);
/* L5: fold axis is derivable from the call-site census alone. */
int32_t isaac_lua_engine_property_family_folded_from_callsites(
    int32_t callsite_count);

/* ---------------------------------------------------------------------
   v22: the get/set CLOSURE population behind the v21 member family.

   The 173 members install 346 get/set closures that land on 326 distinct
   bodies in two bands (band A 0x00898f80..0x0089f590, 102 bodies; band B
   0x008bb2e0..0x008c28b0, 224 bodies). Normalising each body - zero every
   encoded operand field (immediate + displacement, offset and width from
   the instruction encoding), resolve every rel32 branch to its absolute
   target - collapses the population to 62 clusters. Re-encoding template
   image + field values reproduces all 326 bodies BYTE-EXACTLY: 326 exact,
   0 mismatch, only 1677 of 39146 body bytes ever vary.

   Per-body laws, censused over all 326: exactly one lua_upvalueindex(1)
   push and one lua_touserdata (the FIELD OFFSET lives in the upvalue, not
   in the body); every body calls the class-check helper 0x0085c590;
   getters push const flag 1 and return 1, setters push 0 and return 0 with
   ONE recorded exception (0x008bbc60, member 12's setter, returns 1 -
   reproduced, not corrected); all 371 lua_type sites are followed by a
   FULL-WORD test, never a low-byte test; a member's getter and setter push
   the SAME class key in 173/173 cases, which is the tie-back to v21.

   The class keys 0x00c8297a..0x00c82a58 are inside .data's virtual range
   but PAST its raw end: zero at load, not file backed. A .text-only
   formula would resolve 0x00c8297a to file offset 0x00881d7a, inside raw
   .reloc, and return plausible garbage instead of failing. They are used
   only as lua_rawgetp registry key ADDRESSES and are never dereferenced.

   Orphans: walking the bands finds 100 further bodies no member points at
   (86 in band A, 14 in band B); 21 of them carry the property-closure
   shape, so the v21 member census does not reach every property accessor
   in the image. Recorded as counts only.

   Address-stable host: 15 Lua5.3.3r.dll IAT slots (+1 CRT slot) and 25
   direct call targets. The five push wrappers are characterised only for
   their x86 extension semantics (sign vs zero extension, float widening).
   --------------------------------------------------------------------- */
enum {
  ISAAC_LUA_PROPERTY_CLOSURE_TOTAL = 326,
  ISAAC_LUA_PROPERTY_CLOSURE_BAND_A_LO = 0x00898f80u,
  ISAAC_LUA_PROPERTY_CLOSURE_BAND_A_HI = 0x0089f590u,
  ISAAC_LUA_PROPERTY_CLOSURE_BAND_A_COUNT = 102,
  ISAAC_LUA_PROPERTY_CLOSURE_BAND_B_LO = 0x008bb2e0u,
  ISAAC_LUA_PROPERTY_CLOSURE_BAND_B_HI = 0x008c28b0u,
  ISAAC_LUA_PROPERTY_CLOSURE_BAND_B_COUNT = 224,

  ISAAC_LUA_PROPERTY_CLOSURE_CLUSTER_COUNT = 62,
  ISAAC_LUA_PROPERTY_CLOSURE_CENSUS_EXACT = 326,
  ISAAC_LUA_PROPERTY_CLOSURE_CENSUS_MISMATCH = 0,
  ISAAC_LUA_PROPERTY_CLOSURE_BODY_BYTES_TOTAL = 39146,
  ISAAC_LUA_PROPERTY_CLOSURE_BODY_INSNS_TOTAL = 14480,
  ISAAC_LUA_PROPERTY_CLOSURE_VARIABLE_BYTES = 1677,
  ISAAC_LUA_PROPERTY_CLOSURE_CLUSTERS_0_FREE = 20,
  ISAAC_LUA_PROPERTY_CLOSURE_CLUSTERS_1_FREE = 31,
  ISAAC_LUA_PROPERTY_CLOSURE_CLUSTERS_2_FREE = 7,
  ISAAC_LUA_PROPERTY_CLOSURE_CLUSTERS_3_FREE = 3,
  ISAAC_LUA_PROPERTY_CLOSURE_CLUSTERS_5_FREE = 1,
  ISAAC_LUA_PROPERTY_CLOSURE_MAX_FREE_FIELDS = 5,
  ISAAC_LUA_PROPERTY_CLOSURE_CLUSTER_MAX_MEMBERS = 34,
  ISAAC_LUA_PROPERTY_CLOSURE_CLUSTER_SINGLETONS = 20,

  ISAAC_LUA_PROPERTY_CLOSURE_GET_ONLY = 171,
  ISAAC_LUA_PROPERTY_CLOSURE_SET_ONLY = 155,
  ISAAC_LUA_PROPERTY_CLOSURE_DUAL_ROLE = 0,
  ISAAC_LUA_PROPERTY_CLOSURE_REFERENCE_TOTAL = 346,
  ISAAC_LUA_PROPERTY_CLOSURE_SHARED_BODIES = 15,
  ISAAC_LUA_PROPERTY_CLOSURE_MAX_REFS = 4,

  ISAAC_LUA_PROPERTY_CLOSURE_CLASS_KEY_COUNT = 52,
  /* 41 distinct RECEIVER keys (first check) + 20 value-class keys
     (second check); 11 value keys are never a receiver -> union 52. */
  ISAAC_LUA_PROPERTY_CLOSURE_PRIMARY_KEY_COUNT = 41,
  ISAAC_LUA_PROPERTY_CLOSURE_SECONDARY_KEY_COUNT = 20,
  ISAAC_LUA_PROPERTY_CLOSURE_SECONDARY_ONLY_KEYS = 11,
  ISAAC_LUA_PROPERTY_CLOSURE_CLASS_KEY_LO = 0x00c8297au,
  ISAAC_LUA_PROPERTY_CLOSURE_CLASS_KEY_HI = 0x00c82a58u,
  /* .data raw size 0x69e00 ends at VA 0x00c61e00, so the whole key blob is
     BSS: zero at load, not file backed. */
  ISAAC_LUA_PROPERTY_CLOSURE_CLASS_KEY_FILE_BACKED = 0,
  /* what a .text-only VA->offset formula would have returned for the LO key:
     0x400 + (0x00c8297a - 0x401000), which lands inside raw .reloc. */
  ISAAC_LUA_PROPERTY_CLOSURE_CLASS_KEY_NAIVE_TEXT_OFF = 0x00881d7au,
  ISAAC_LUA_PROPERTY_CLOSURE_MEMBER_KEY_AGREE = 173,
  ISAAC_LUA_PROPERTY_CLOSURE_MEMBER_KEY_DISAGREE = 0,
  ISAAC_LUA_PROPERTY_CLOSURE_SINGLE_CHECK = 280,
  ISAAC_LUA_PROPERTY_CLOSURE_DOUBLE_CHECK = 46,
  ISAAC_LUA_PROPERTY_CLOSURE_DOUBLE_CHECK_DISTINCT = 45,

  ISAAC_LUA_PROPERTY_CLOSURE_UPVALUE_INDEX_U32 = (int)0xfff0b9d7u, /* upvalue 1 */
  ISAAC_LUA_PROPERTY_CLOSURE_REGISTRY_INDEX_U32 = (int)0xfff0b9d8u,
  ISAAC_LUA_PROPERTY_CLOSURE_LUAI_MAXSTACK = 1000000,
  ISAAC_LUA_PROPERTY_CLOSURE_UPVALUE_PUSH_EXACT = 326,
  ISAAC_LUA_PROPERTY_CLOSURE_TOUSERDATA_EXACT = 326,
  ISAAC_LUA_PROPERTY_CLOSURE_CLASS_CHECK_EXACT = 326,
  ISAAC_LUA_PROPERTY_CLOSURE_ENDS_WITH_RET = 326,

  ISAAC_LUA_PROPERTY_CLOSURE_GET_CONST_FLAG = 1,
  ISAAC_LUA_PROPERTY_CLOSURE_SET_CONST_FLAG = 0,
  ISAAC_LUA_PROPERTY_CLOSURE_GET_FLAG_SITES = 171,
  ISAAC_LUA_PROPERTY_CLOSURE_SET_FLAG_SITES = 155,
  ISAAC_LUA_PROPERTY_CLOSURE_GET_RETURN = 1,
  ISAAC_LUA_PROPERTY_CLOSURE_SET_RETURN = 0,
  ISAAC_LUA_PROPERTY_CLOSURE_GET_RETURN_EXACT = 171,
  ISAAC_LUA_PROPERTY_CLOSURE_SET_RETURN_EXACT = 154,
  ISAAC_LUA_PROPERTY_CLOSURE_RETURN_EXCEPTIONS = 1,
  ISAAC_LUA_PROPERTY_CLOSURE_RETURN_EXCEPTION_VA = 0x008bbc60u,
  ISAAC_LUA_PROPERTY_CLOSURE_RETURN_EXCEPTION_MEMBER = 12,

  ISAAC_LUA_PROPERTY_CLOSURE_LUA_TYPE_CALLS = 371,
  ISAAC_LUA_PROPERTY_CLOSURE_LUA_TYPE_FULLWORD_TESTS = 371,
  ISAAC_LUA_PROPERTY_CLOSURE_LUA_TYPE_BYTE_TESTS = 0,

  ISAAC_LUA_PROPERTY_CLOSURE_CLASS_CHECK_VA = 0x0085c590u,
  ISAAC_LUA_PROPERTY_CLOSURE_CONST_MSG_VA = 0x00b6e9b4u,   /* "cannot be const" */
  ISAAC_LUA_PROPERTY_CLOSURE_CONST_FIELD_VA = 0x00b6e9c4u, /* "__const" */
  ISAAC_LUA_PROPERTY_CLOSURE_PUSH_I32_SEXT_VA = 0x0085bfd0u,
  ISAAC_LUA_PROPERTY_CLOSURE_PUSH_U32_ZEXT_VA = 0x0085bff0u,
  ISAAC_LUA_PROPERTY_CLOSURE_PUSH_U16_ZEXT_VA = 0x0085c010u,
  ISAAC_LUA_PROPERTY_CLOSURE_PUSH_I64_PAIR_VA = 0x0085c030u,
  ISAAC_LUA_PROPERTY_CLOSURE_PUSH_F32_CVT_VA = 0x0085c050u,
  ISAAC_LUA_PROPERTY_CLOSURE_PUSH_I32_SEXT_USES = 35,
  ISAAC_LUA_PROPERTY_CLOSURE_PUSH_U32_ZEXT_USES = 11,
  ISAAC_LUA_PROPERTY_CLOSURE_PUSH_U16_ZEXT_USES = 2,
  ISAAC_LUA_PROPERTY_CLOSURE_PUSH_I64_PAIR_USES = 4,
  ISAAC_LUA_PROPERTY_CLOSURE_PUSH_F32_CVT_USES = 25,
  ISAAC_LUA_PROPERTY_CLOSURE_PUSH_HELPER_BODIES = 77,

  ISAAC_LUA_PROPERTY_CLOSURE_IAT_SLOT_COUNT = 16,
  ISAAC_LUA_PROPERTY_CLOSURE_IAT_LUA_SLOTS = 15,
  ISAAC_LUA_PROPERTY_CLOSURE_IAT_CALL_TOTAL = 1014,
  ISAAC_LUA_PROPERTY_CLOSURE_DIRECT_CALL_TARGETS = 25,
  ISAAC_LUA_PROPERTY_CLOSURE_IAT_LUA_TYPE = 0x00b18400u,
  ISAAC_LUA_PROPERTY_CLOSURE_IAT_LUA_TOUSERDATA = 0x00b183b0u,
  ISAAC_LUA_PROPERTY_CLOSURE_IAT_LUAL_CHECKINTEGER = 0x00b183f4u,
  ISAAC_LUA_PROPERTY_CLOSURE_IAT_LUAL_CHECKNUMBER = 0x00b18324u,
  ISAAC_LUA_PROPERTY_CLOSURE_IAT_LUA_TOBOOLEAN = 0x00b183e8u,
  ISAAC_LUA_PROPERTY_CLOSURE_IAT_LUA_PUSHBOOLEAN = 0x00b183ecu,
  ISAAC_LUA_PROPERTY_CLOSURE_IAT_LUA_PUSHINTEGER = 0x00b183f8u,
  ISAAC_LUA_PROPERTY_CLOSURE_IAT_LUA_PUSHNUMBER = 0x00b183f0u,
  ISAAC_LUA_PROPERTY_CLOSURE_IAT_LUA_RAWGETP = 0x00b183bcu,

  ISAAC_LUA_PROPERTY_CLOSURE_STORE_BYTE = 17,
  ISAAC_LUA_PROPERTY_CLOSURE_STORE_WORD = 4,
  ISAAC_LUA_PROPERTY_CLOSURE_STORE_DWORD = 44,
  ISAAC_LUA_PROPERTY_CLOSURE_STORE_MOVSS = 22,
  ISAAC_LUA_PROPERTY_CLOSURE_STORE_INDIRECT = 68,

  ISAAC_LUA_PROPERTY_CLOSURE_BAND_UNMODELLED = 100,
  ISAAC_LUA_PROPERTY_CLOSURE_BAND_A_UNMODELLED = 86,
  ISAAC_LUA_PROPERTY_CLOSURE_BAND_B_UNMODELLED = 14,
  ISAAC_LUA_PROPERTY_CLOSURE_ORPHAN_PROPERTY_SHAPED = 21,
  ISAAC_LUA_PROPERTY_CLOSURE_ORPHAN_A_PROPERTY_SHAPED = 14,
  ISAAC_LUA_PROPERTY_CLOSURE_ORPHAN_B_PROPERTY_SHAPED = 7
};

/* Enumerations used by the closure table. */
enum {
  ISAAC_LUA_PROPERTY_CLOSURE_ROLE_GET = 0,
  ISAAC_LUA_PROPERTY_CLOSURE_ROLE_SET = 1,
  ISAAC_LUA_PROPERTY_CLOSURE_BAND_A = 0,
  ISAAC_LUA_PROPERTY_CLOSURE_BAND_B = 1,
  ISAAC_LUA_PROPERTY_CLOSURE_PUSH_NONE = 0,
  ISAAC_LUA_PROPERTY_CLOSURE_PUSH_I32_SEXT = 1,
  ISAAC_LUA_PROPERTY_CLOSURE_PUSH_U32_ZEXT = 2,
  ISAAC_LUA_PROPERTY_CLOSURE_PUSH_U16_ZEXT = 3,
  ISAAC_LUA_PROPERTY_CLOSURE_PUSH_I64_PAIR = 4,
  ISAAC_LUA_PROPERTY_CLOSURE_PUSH_F32_CVT = 5,
  ISAAC_LUA_PROPERTY_CLOSURE_STORE_KIND_BYTE = 0,
  ISAAC_LUA_PROPERTY_CLOSURE_STORE_KIND_WORD = 1,
  ISAAC_LUA_PROPERTY_CLOSURE_STORE_KIND_DWORD = 2,
  ISAAC_LUA_PROPERTY_CLOSURE_STORE_KIND_MOVSS = 3,
  ISAAC_LUA_PROPERTY_CLOSURE_STORE_KIND_INDIRECT = 4
};

/* Closure table. Out-of-range index returns 0 / -1 throughout. */
int32_t isaac_lua_engine_closure_count(void);
uint32_t isaac_lua_engine_closure_va(int32_t index);
int32_t isaac_lua_engine_closure_cluster(int32_t index);
/* 0 = getter, 1 = setter. No body is ever both (C8). */
int32_t isaac_lua_engine_closure_role(int32_t index);
/* lua_rawgetp registry key ADDRESS - never dereferenced (BSS at load). */
uint32_t isaac_lua_engine_closure_class_key(int32_t index);
/* First v21 member index that installs this body in that role. */
int32_t isaac_lua_engine_closure_member(int32_t index);
int32_t isaac_lua_engine_closure_push_kind(int32_t index);
int32_t isaac_lua_engine_closure_store_kind(int32_t index);
/* Shape is a total function of the cluster (C1). */
uint32_t isaac_lua_engine_closure_body_bytes(int32_t index);
uint32_t isaac_lua_engine_closure_body_insns(int32_t index);
int32_t isaac_lua_engine_closure_band(int32_t index);
/* Band from a raw VA; -1 outside both bands. Takes a full 32-bit VA. */
int32_t isaac_lua_engine_closure_band_for_va(uint32_t va);
/* Exact closure VA -> index, else -1. */
int32_t isaac_lua_engine_closure_index_for_va(uint32_t va);
/* C5: const-check flag is a total function of the role. */
int32_t isaac_lua_engine_closure_const_flag(int32_t index);
/* C6 including the single recorded exception at 0x008bbc60. */
int32_t isaac_lua_engine_closure_return_value(int32_t index);

/* Cluster table. */
int32_t isaac_lua_engine_closure_cluster_count(void);
uint32_t isaac_lua_engine_closure_cluster_rep_va(int32_t index);
int32_t isaac_lua_engine_closure_cluster_bodies(int32_t index);
uint32_t isaac_lua_engine_closure_cluster_body_bytes(int32_t index);
uint32_t isaac_lua_engine_closure_cluster_body_insns(int32_t index);
int32_t isaac_lua_engine_closure_cluster_band(int32_t index);
int32_t isaac_lua_engine_closure_cluster_operand_fields(int32_t index);
int32_t isaac_lua_engine_closure_cluster_free_fields(int32_t index);

/* ---- x86 semantics lifted out of the closure bodies -------------------
   Every scalar parameter below is uint32_t and every narrowing is written
   explicitly in the body. A uint8_t parameter would let -O2 delete a mask
   the Wasm ABI never applies; drive these with UNMASKED 0x100 / 0x1ff /
   0x80000000 / 0xffffffff. */

/* `test eax, eax` / `jne` after lua_type: FULL-WORD (C7). 0x100 takes it. */
int32_t isaac_lua_engine_closure_type_gate_taken(uint32_t lua_type_result);
/* 0x0085c590 raises luaL_argerror("cannot be const") iff the const marker
   BYTE is nonzero and the caller's flag BYTE is zero - both `cmp byte ptr`,
   so flag 0x100 behaves exactly like flag 0. */
int32_t isaac_lua_engine_closure_const_gate_raises(uint32_t const_marker,
                                                   uint32_t flag_arg);
/* `test eax, eax` / `setne` on the lua_toboolean result. */
int32_t isaac_lua_engine_closure_boolean_normalize(uint32_t value);
/* 0x0085bfd0 `mov eax, edx ; cdq`. */
uint32_t isaac_lua_engine_closure_push_i32_lo(uint32_t value);
uint32_t isaac_lua_engine_closure_push_i32_hi(uint32_t value);
/* 0x0085bff0 `push 0 ; push edx`. */
uint32_t isaac_lua_engine_closure_push_u32_lo(uint32_t value);
uint32_t isaac_lua_engine_closure_push_u32_hi(uint32_t value);
/* 0x0085c010 `movzx eax, dx ; cdq` - narrows BEFORE sign extending. */
uint32_t isaac_lua_engine_closure_push_u16_lo(uint32_t value);
uint32_t isaac_lua_engine_closure_push_u16_hi(uint32_t value);
/* Setter store narrowing by store kind. */
uint32_t isaac_lua_engine_closure_store_value(int32_t store_kind,
                                              uint32_t value);
/* lua_upvalueindex(n) derived from LUAI_MAXSTACK, not looked up. */
uint32_t isaac_lua_engine_closure_upvalue_index(int32_t n);

/* ---------------------------------------------------------------------
   v23: the INLINE property-installer family and its property getters.

   v21 modelled the 173-member property-builder population; v22 modelled the
   326 get/set closure bodies those members install (upvalue = FIELD OFFSET).
   Walking the two v22 closure bands body-by-body, v22 recorded 100 further
   bodies no member points at; 21 carry the property-closure shape
   (exactly one lua_upvalueindex(1) push + the class-check 0x0085c590).

   Those 21 are installed NOT by the builder family but by a scattered band
   of INLINE installer functions (0x008794b0 … 0x0088f1b0, 23 install sites,
   reached from RegisterClasses' class registrars at 0x0086801a…0x0086bfd9).
   Each installer is one install record
     newuserdata(L, 4); mov [ud], <UPVALUE>; pushcclosure(L, body, nups=1)
   then installs `body` under a property name into the __propget subtable(s)
   (0x00b6e994) fetched by rawget. Census invariants over all 23:
     - nups == 1 (23/23), userdata size == 4 (23/23)
     - installed under __propget only; NONE touch __propset (0/23) - so all
       21 bodies are READ-ONLY getters (all return 1, all take the receiver
       class-check with const flag 1).

   THREE upvalue disciplines, proven per-site from the write instruction and
   NOT collapsed (the near-identical-siblings defect class is live: two of the
   21 - 0x0089e150 and 0x0089bf10 - even have two installers each, and
   0x0089bf10's two installers disagree on discipline):
     CODE_PTR     `mov dword [eax], <imm in .text>`  (14 sites) - upvalue is a
                  C function pointer; the getter calls through it.
     FIELD_OFFSET `mov dword [eax], <imm < 0x1000>`  (3 sites: 0x4/0x14/0x44)
                  - upvalue is a struct field offset (the v21 discipline,
                  appearing inline here too).
     CALLER_ARG   `mov dword [eax], <reg from stack>` (6 sites) - the upvalue
                  value is supplied by the installer's own caller.
   Both-sided law: an orphan whose body calls the upvalue as a function
   (0x00899930/0x008999e0/0x00899a50/0x0089e290, 4/4) is installed by a
   CODE_PTR installer; every FIELD_OFFSET-installed orphan (3/3) uses the
   upvalue as data (never calls it). The four call-target function pointers are
   0x00872000 / 0x00872020 / 0x00872040 / 0x0085dbd0.

   The `mov [eax], imm` discipline is a pure function of the immediate,
   resolved through the SECTION TABLE (never a fixed offset): imm < 0x1000 is a
   field offset; imm inside .text [0x00401000, 0x00b17134) is a code pointer;
   otherwise a data pointer.

   COMPLETENESS - NOT reached, reported honestly. The property-accessor surface
   is every closure installed under __propget/__propset. A whole-image census
   (every lua_pushcclosure whose install context rawgets __propget/__propset)
   finds the surface extends BEYOND v22's two bands: a third region band C
   (0x008c32d0 … 0x008c59d0, 26 property getters) plus 0x008a0600, installed
   under __propget by further inline installers in the 0x0087a010 … 0x00891750
   band, is covered by NEITHER v22's 326 NOR this unit's 21. So after v23 the
   surface is 326 + 21 = 347 of ~374 modelled; ~27 remain. v22's "two bands"
   scoping was itself incomplete. Next VA: 0x008c32d0 (band C).

   Scope: v23 models installer identity, the install record invariants, the
   per-site upvalue discipline, and orphan identity/role/key/return. The 21
   getter bodies' Lua VM IAT surface and their real getter C functions stay
   address-stable host, exactly as v22 kept the 326.
   --------------------------------------------------------------------- */

/* Upvalue-write disciplines (proven per-site from the mov [eax], X form). */
enum {
  ISAAC_LUA_INLINE_UD_FIELD_OFFSET = 0,
  ISAAC_LUA_INLINE_UD_CODE_PTR = 1,
  ISAAC_LUA_INLINE_UD_CALLER_ARG = 2
};

/* Bands (same numbering as the v22 closure bands). */
enum {
  ISAAC_LUA_INLINE_BAND_A = 0,
  ISAAC_LUA_INLINE_BAND_B = 1
};

/* .text virtual extent used ONLY to classify a ud immediate as a code
   pointer, resolved from the section table (not a fixed formula). */
enum {
  ISAAC_LUA_INLINE_TEXT_LO = 0x00401000u,
  ISAAC_LUA_INLINE_TEXT_HI = 0x00b17134u,
  ISAAC_LUA_INLINE_FIELD_OFFSET_LIMIT = 0x1000u
};

/* Install-record invariants and the __propget/__propset string VAs. */
enum {
  ISAAC_LUA_INLINE_INSTALL_NUPS = 1,
  ISAAC_LUA_INLINE_INSTALL_USERDATA_SIZE = 4,
  ISAAC_LUA_INLINE_PROPGET_NAME_VA = 0x00b6e994u, /* "__propget" */
  ISAAC_LUA_INLINE_PROPSET_NAME_VA = 0x00b6ea38u  /* "__propset" */
};

/* The four upvalue code pointers the CODE_PTR installers write whose getters
   call through them (task-named 0x872000/20/40 + 0x0085dbd0). */
enum {
  ISAAC_LUA_INLINE_CALL_FN_A = 0x00872000u,
  ISAAC_LUA_INLINE_CALL_FN_B = 0x00872020u,
  ISAAC_LUA_INLINE_CALL_FN_C = 0x00872040u,
  ISAAC_LUA_INLINE_CALL_FN_D = 0x0085dbd0u
};

/* Census results (0 mismatches). */
enum {
  ISAAC_LUA_INLINE_INSTALLER_COUNT = 23,
  ISAAC_LUA_INLINE_ORPHAN_COUNT = 21,
  ISAAC_LUA_INLINE_ORPHAN_BAND_A = 14,
  ISAAC_LUA_INLINE_ORPHAN_BAND_B = 7,
  ISAAC_LUA_INLINE_ORPHAN_GETTERS = 21,
  ISAAC_LUA_INLINE_ORPHAN_SETTERS = 0,
  ISAAC_LUA_INLINE_ORPHAN_CALLS_UPVALUE = 4,
  ISAAC_LUA_INLINE_ORPHAN_DISTINCT_KEYS = 11,
  ISAAC_LUA_INLINE_INSTALLER_CODE_PTR = 14,
  ISAAC_LUA_INLINE_INSTALLER_FIELD_OFFSET = 3,
  ISAAC_LUA_INLINE_INSTALLER_CALLER_ARG = 6,
  ISAAC_LUA_INLINE_INSTALLER_RET8 = 16,
  ISAAC_LUA_INLINE_INSTALLER_RET_C = 7,
  ISAAC_LUA_INLINE_INSTALLER_NUPS1 = 23,
  ISAAC_LUA_INLINE_INSTALLER_UD_SIZE4 = 23,
  ISAAC_LUA_INLINE_INSTALLER_PROPSET = 0,
  ISAAC_LUA_INLINE_INSTALLER_LO_VA = 0x008794b0u,
  ISAAC_LUA_INLINE_INSTALLER_HI_VA = 0x0088f1b0u,
  ISAAC_LUA_INLINE_ORPHAN_LO_VA = 0x00899930u,
  ISAAC_LUA_INLINE_ORPHAN_HI_VA = 0x008c2350u
};

/* Completeness census over the whole image. v23 reported this NOT reached and
   scoped the residual as band C (26) + one straggler (27). v24's whole-image
   install-side census (every lua_pushcclosure whose install context rawgets
   __propget/__propset, section-table resolved, branch-aware over all reach
   encodings) proves the TRUE residual is 36 and the TRUE total is 383 - v23's
   scoping missed a FOURTH region of 9 bodies. All 36 are now modelled, so the
   property-accessor install surface is COMPLETE (383 censused == 383 modelled).

   v24 UPDATES these three shared constants from their v23 values (347/27/0)
   to the v24 truth (383/0/1). They describe the CURRENT modelled state. */
enum {
  ISAAC_LUA_INLINE_SURFACE_V22 = 326,
  ISAAC_LUA_INLINE_SURFACE_V23 = 21,
  ISAAC_LUA_INLINE_SURFACE_MODELLED = 383,
  ISAAC_LUA_INLINE_SURFACE_RESIDUAL = 0,
  ISAAC_LUA_INLINE_SURFACE_COMPLETE = 1,
  ISAAC_LUA_INLINE_RESIDUAL_BAND_C_LO = 0x008c32d0u,
  ISAAC_LUA_INLINE_RESIDUAL_BAND_C_HI = 0x008c59d0u,
  ISAAC_LUA_INLINE_RESIDUAL_BAND_C_COUNT = 26,
  ISAAC_LUA_INLINE_RESIDUAL_EXTRA_VA = 0x008a0600u,
  /* v30: leftover extra 0x008a0600 peeled. 0x008c5a90 classified
     dtor (not a getter). Sequential handoff was 0x008c5b90
     (10-body release/unref family, not a getter).
     v31: fourth-region string getter 0x008976a0 peeled.
     v32: fourth-region integer setter 0x008976f0 peeled.
     v33: fourth-region boolean setter 0x00897730 peeled.
     v34: fourth-region boolean getter 0x00897770 peeled.
     v35: fourth-region number setter 0x008977a0 peeled.
     v36: skip 0x008977f0 ctor; peel fourth-region number
     getter 0x00897930. Next body: 0x00897970.
     v37: skip 0x00897970 Vector wrap/ctor + SEH
     0x00897a10..0x00897d50; peel indexed bool setter
     0x00897f00. Next body: 0x00897f50.
     v38: skip SEH 0x00897f50 + wrap/ctor 0x00898140 +
     SEH 0x008981b0..0x008983e0 + unref 0x00898490;
     peel indexed int getter 0x008984e0. Next body:
     0x00898530.
     v39: skip host 0x00898530 (class-check 0x85c590 /
     wrap 0x8baa50 / checknumber) + wrap/ctor 0x00898600
     + SEH 0x008986d0 / 0x00898890 + wrap 0x00898ae0 /
     0x00898c00 + SEH 0x00898cf0 + wrap 0x00898d90 /
     0x00898e00 / 0x00898e70 / 0x00898ee0; peel fourth-
     region i32 getter 0x00898f50. Next body:
     0x00898f80.
     v40: skip host 0x00898f80 (lua_type + class-check
     0x85c590 x2) + wrap/ctor 0x00899030 + host setter
     0x008990d0 + host 0x00899140; peel fourth-region
     i32 sign-extend getter 0x008991a0. Next body:
     0x008991d0.
     v41: peel sequential no-arg setter-shaped 0x008991d0
     (touserdata + call [ud]; xor eax,eax; ret 0). Skip
     count 0 — no wrap/ctor/SEH/class-check before it.
     Next body: 0x008991f0. */
  ISAAC_LUA_INLINE_NEXT_VA = 0x008991f0u
};

/* Installer table. Out-of-range index returns 0 / -1 throughout. */
int32_t isaac_lua_engine_inline_installer_count(void);
uint32_t isaac_lua_engine_inline_installer_va(int32_t index);
/* The orphan getter body this installer installs. */
uint32_t isaac_lua_engine_inline_installer_body(int32_t index);
/* Upvalue immediate the installer writes (0 for CALLER_ARG - not an immediate). */
uint32_t isaac_lua_engine_inline_installer_ud_value(int32_t index);
/* Discipline taken directly from the table (recorded per-site). */
int32_t isaac_lua_engine_inline_installer_ud_discipline(int32_t index);
uint32_t isaac_lua_engine_inline_installer_ret_imm(int32_t index);
int32_t isaac_lua_engine_inline_installer_propget_pushes(int32_t index);
uint32_t isaac_lua_engine_inline_installer_size(int32_t index);
int32_t isaac_lua_engine_inline_installer_index_for_va(uint32_t va);

/* Orphan getter table. */
uint32_t isaac_lua_engine_inline_orphan_va(int32_t index);
int32_t isaac_lua_engine_inline_orphan_band(int32_t index);
uint32_t isaac_lua_engine_inline_orphan_class_key(int32_t index);
/* 1 iff the body calls the upvalue userdata dword as a function pointer. */
int32_t isaac_lua_engine_inline_orphan_calls_upvalue(int32_t index);
int32_t isaac_lua_engine_inline_orphan_return_value(int32_t index);
int32_t isaac_lua_engine_inline_orphan_check_count(int32_t index);
uint32_t isaac_lua_engine_inline_orphan_size(int32_t index);
int32_t isaac_lua_engine_inline_orphan_index_for_va(uint32_t va);

/* Pure discipline classifier for a ud immediate, resolved through the section
   table. Takes uint32_t and re-narrows internally; drive it UNMASKED with
   0x100 / 0x1ff / 0x80000000 / 0xffffffff. */
int32_t isaac_lua_engine_inline_ud_discipline_for_value(uint32_t ud_value);

/* ---------------------------------------------------------------------
   v24: band C closes the property-accessor surface, and a whole-image
   install-side census replaces v23's "~374" with a real number.

   Whole-image census method (all resolved through the SECTION TABLE):
   enumerate every lua_pushcclosure reach site in .text - direct FF15,
   E8-to-FF25-thunk, and mov reg,[slot] + call reg (the property-builder
   members reach it via `call ebx`); segment .text into functions by int3
   padding + direct-call targets; for each function that references the
   __propget/__propset string, track the live table context (the last
   rawget whose key push is __propget/__propset) and, BRANCH-AWARE, collect
   every closure-fn immediate installed while that context is live. That is
   exhaustive for the in-function-fetch install route: 379 distinct bodies.
   The only other route is a stack-threaded chain (the table is fetched by
   an ancestor registrar and passed on the Lua stack); v23 enumerated that
   route's inline-installer band and it contributes exactly its 4 unique
   chain-installed orphans. 379 + 4 = 383.

   THE REAL TOTAL IS 383, not "~374":
     v22  326  (get/set closure bodies, bands A + B)
     v23   21  (inline-installer orphan getters)
     v24   36  (band C 26 + fourth region 10)  <- THIS UNIT
     ----  ---
          383  censused == modelled -> COMPLETE

   v23's residual estimate (27 = band C 26 + straggler 0x008a0600) UNDER-
   counted by 9: a FOURTH region of getter/setter-pair accessors sits below
   and around band A, installed by compound inline installers
   0x008968b0 / 0x00896ae0 / 0x00896cf0 / 0x00897120 / 0x008973e0 (plus
   0x00875130 for the 0x008a0600 straggler). Exactly the under-scoping the
   two prior units each fell into; found here as required.

   BAND C (0x008c32d0 .. 0x008c59d0, 26 getters, all __propget, all ret 1,
   all take the receiver class-check 0x0085c590 with a distinct BSS class key
   in [0x00c82a2d, 0x00c82a47], all CALL the upvalue as a function pointer):
     - two shapes, a total function of arity:
         PRIMARY   10 bodies, 0x5c bytes - no-arg getter (type, check,
                   touserdata, `mov edx,[eax]; call edx`, push i32 via
                   0x0085bff0). Worked example matches the brief exactly:
                   installer 0x00891750 does pushcclosure(0x008c32d0) with
                   `mov [ud], 0x40c3a0`.
         SECONDARY 16 bodies, 0xa4 bytes - indexed getter (luaL_checkinteger
                   arg 2, call the upvalue with it, optionally wrap the
                   result in a fresh userdata + setmetatable).
     - EVERY band C body is installed CODE_PTR (`mov dword [eax], <imm in
       .text>`) and calls the upvalue - both-sided law HOLDS (26/26).
     - 10 installers (0x0087a010 .. 0x00891750); each fetches __propget at
       relative -2 and -4 (a class and its `const` variant), installs one
       primary (twice, into two table pairs) + one or two secondaries.

   FOURTH REGION (10 bodies, scattered 0x0085cad0 / 0x008976a0 / 0x008976f0 /
   0x00897730 / 0x00897770 / 0x008977a0 / 0x00897930 / 0x00898f50 /
   0x008991a0 / 0x008a0600 - 6 getters + 4 setters):
     - installed by COMPOUND getter/setter-pair installers that fetch BOTH
       __propget and __propset and install a getter then a branch-selected
       setter (`test arg4,arg4; je` picks a CALLER_ARG setter vs the shared
       read-only-reject setter 0x0085cad0 whose upvalue is the property-name
       STACKVAL - a discipline v23 never saw).
     - COUNTEREXAMPLE to v23's both-sided law (calls-upvalue => CODE_PTR
       installer): 7 fourth-region bodies CALL the upvalue as a function yet
       are installed via CALLER_ARG (the code pointer is supplied by the
       installer's own caller at run time, `mov [eax], <reg from stack>`).
       The law holds only for the IMMEDIATE disciplines; CALLER_ARG breaks
       "calls-upvalue => CODE_PTR". Reported, not hidden.
     - "two installers disagree on discipline" defect class is LIVE and
       wider here: 0x008991a0 is installed by THREE installers - one CODE_PTR
       (0x008932d0, `mov [eax], 0x9e9ab0`) and two CALLER_ARG - so a single
       getter body carries both disciplines. Classified PER SITE.

   Scope (as v22/v23): v24 models body identity, region, role, the per-site
   upvalue discipline, the class-check key, the return value and the census.
   The 36 getter/setter BODIES' Lua VM IAT surface and their real C getter/
   setter functions stay address-stable host, exactly as v22 kept the 326
   and v23 kept the 21.
   --------------------------------------------------------------------- */

/* Extended upvalue-write disciplines (v23 had FIELD_OFFSET/CODE_PTR/
   CALLER_ARG; v24 adds STACKVAL - a captured pushstring value, no
   newuserdata - and DATA_PTR for completeness of the classifier). */
enum {
  ISAAC_LUA_INLINE_UD_STACKVAL = 3,
  ISAAC_LUA_INLINE_UD_DATA_PTR = 4
};

/* Accessor roles + band-C body shapes. */
enum {
  ISAAC_LUA_ACCESSOR_ROLE_GET = 0,
  ISAAC_LUA_ACCESSOR_ROLE_SET = 1,
  ISAAC_LUA_BAND_C_SHAPE_PRIMARY = 0,   /* 0x5c bytes, no-arg getter */
  ISAAC_LUA_BAND_C_SHAPE_SECONDARY = 1  /* 0xa4 bytes, indexed getter */
};

/* Whole-image census result (the real total, no `~`). */
enum {
  ISAAC_LUA_ACCESSOR_SURFACE_TOTAL = 383,
  ISAAC_LUA_ACCESSOR_SURFACE_V22 = 326,
  ISAAC_LUA_ACCESSOR_SURFACE_V23 = 21,
  ISAAC_LUA_ACCESSOR_SURFACE_V24 = 36,
  ISAAC_LUA_ACCESSOR_SURFACE_IN_FUNCTION = 379,
  ISAAC_LUA_ACCESSOR_SURFACE_CHAIN = 4,
  ISAAC_LUA_ACCESSOR_SURFACE_COMPLETE = 1
};

/* Band C census (assigned target). */
enum {
  ISAAC_LUA_BAND_C_COUNT = 26,
  ISAAC_LUA_BAND_C_PRIMARY_COUNT = 10,
  ISAAC_LUA_BAND_C_SECONDARY_COUNT = 16,
  ISAAC_LUA_BAND_C_PRIMARY_BYTES = 0x5c,
  ISAAC_LUA_BAND_C_SECONDARY_BYTES = 0xa4,
  ISAAC_LUA_BAND_C_LO_VA = 0x008c32d0u,
  ISAAC_LUA_BAND_C_HI_VA = 0x008c59d0u,
  ISAAC_LUA_BAND_C_INSTALLER_COUNT = 10,
  ISAAC_LUA_BAND_C_INSTALLER_LO_VA = 0x0087a010u,
  ISAAC_LUA_BAND_C_INSTALLER_HI_VA = 0x00891750u,
  ISAAC_LUA_BAND_C_ALL_GETTERS = 26,
  ISAAC_LUA_BAND_C_ALL_CODE_PTR = 26,
  ISAAC_LUA_BAND_C_ALL_CALL_UPVALUE = 26,
  ISAAC_LUA_BAND_C_ALL_RET_1 = 26,
  ISAAC_LUA_BAND_C_CLASS_KEY_LO = 0x00c82a2du,
  ISAAC_LUA_BAND_C_CLASS_KEY_HI = 0x00c82a47u,
  ISAAC_LUA_BAND_C_CLASS_CHECK_VA = 0x0085c590u,
  ISAAC_LUA_BAND_C_PUSH_I32_VA = 0x0085bff0u,   /* primary result pusher */
  /* worked-example primary getter + its CODE_PTR upvalue (brief pin). */
  ISAAC_LUA_BAND_C_EXAMPLE_BODY_VA = 0x008c32d0u,
  ISAAC_LUA_BAND_C_EXAMPLE_UD_VA = 0x0040c3a0u,
  ISAAC_LUA_BAND_C_EXAMPLE_INSTALLER_VA = 0x00891750u
};

/* Fourth region census (the sub-band v23 missed). */
enum {
  ISAAC_LUA_FOURTH_COUNT = 10,
  ISAAC_LUA_FOURTH_NEW_VS_V23 = 9,      /* v23 predicted only 0x008a0600 */
  ISAAC_LUA_FOURTH_GETTERS = 6,
  ISAAC_LUA_FOURTH_SETTERS = 4,
  ISAAC_LUA_FOURTH_INSTALLER_COUNT = 6,
  ISAAC_LUA_FOURTH_PAIR_INSTALLER_COUNT = 5,  /* getter/setter-pair builders */
  /* both-sided-law counterexamples: call the upvalue yet CALLER_ARG-installed */
  ISAAC_LUA_FOURTH_LAW_COUNTEREXAMPLES = 7,
  /* bodies carrying two disciplines across their install sites. */
  ISAAC_LUA_FOURTH_DUAL_DISCIPLINE = 2,
  ISAAC_LUA_FOURTH_SHARED_SETTER_VA = 0x0085cad0u,  /* read-only reject */
  ISAAC_LUA_FOURTH_STRADDLER_VA = 0x008a0600u,      /* v23's lone prediction */
  ISAAC_LUA_FOURTH_LO_VA = 0x0085cad0u,
  ISAAC_LUA_FOURTH_HI_VA = 0x008a0600u
};

/* Discipline bit flags used by the fourth-region per-body discipline mask.
   bit index == the ISAAC_LUA_INLINE_UD_* enum value. */
enum {
  ISAAC_LUA_UD_BIT_FIELD_OFFSET = 1 << 0,
  ISAAC_LUA_UD_BIT_CODE_PTR = 1 << 1,
  ISAAC_LUA_UD_BIT_CALLER_ARG = 1 << 2,
  ISAAC_LUA_UD_BIT_STACKVAL = 1 << 3,
  ISAAC_LUA_UD_BIT_DATA_PTR = 1 << 4
};

/* Band C body table (26). Out-of-range index returns 0 / -1 throughout. */
int32_t isaac_lua_engine_band_c_count(void);
uint32_t isaac_lua_engine_band_c_va(int32_t index);
int32_t isaac_lua_engine_band_c_shape(int32_t index);
uint32_t isaac_lua_engine_band_c_body_bytes(int32_t index);
uint32_t isaac_lua_engine_band_c_class_key(int32_t index);
/* CODE_PTR upvalue immediate the installer writes (always inside .text). */
uint32_t isaac_lua_engine_band_c_ud_value(int32_t index);
int32_t isaac_lua_engine_band_c_ud_discipline(int32_t index);
uint32_t isaac_lua_engine_band_c_installer_va(int32_t index);
int32_t isaac_lua_engine_band_c_calls_upvalue(int32_t index);
int32_t isaac_lua_engine_band_c_return_value(int32_t index);
int32_t isaac_lua_engine_band_c_role(int32_t index);
int32_t isaac_lua_engine_band_c_index_for_va(uint32_t va);

/* Fourth-region body table (10). */
int32_t isaac_lua_engine_fourth_count(void);
uint32_t isaac_lua_engine_fourth_va(int32_t index);
int32_t isaac_lua_engine_fourth_role(int32_t index);
int32_t isaac_lua_engine_fourth_calls_upvalue(int32_t index);
/* Bitmask over ISAAC_LUA_UD_BIT_* - a body may carry >1 discipline. */
int32_t isaac_lua_engine_fourth_discipline_mask(int32_t index);
/* CODE_PTR immediate when a CODE_PTR install site exists, else 0. */
uint32_t isaac_lua_engine_fourth_code_ud_value(int32_t index);
uint32_t isaac_lua_engine_fourth_class_key(int32_t index);
/* -1 for the read-only-reject setter (raises; no normal return). */
int32_t isaac_lua_engine_fourth_return_value(int32_t index);
uint32_t isaac_lua_engine_fourth_body_bytes(int32_t index);
int32_t isaac_lua_engine_fourth_index_for_va(uint32_t va);
/* 1 iff this body is a both-sided-law counterexample (calls the upvalue yet is
   installed via CALLER_ARG). */
int32_t isaac_lua_engine_fourth_is_law_counterexample(int32_t index);

/* Site-level discipline classifier (v24). Extends the v23 immediate
   classifier with STACKVAL (no immediate: -1 sentinel value 0xffffffff for
   "captured stack value") and CALLER_ARG (sentinel 0xfffffffe for "register
   from stack"). uint32_t in, re-narrowed; drive UNMASKED. */
int32_t isaac_lua_engine_accessor_site_discipline(uint32_t ud_value,
                                                  int32_t is_register,
                                                  int32_t has_newuserdata);

/* Export ABI version for differential / Wasm export checks. */
int32_t isaac_lua_engine_pure_helpers_abi_version(void);

/* ---------------------------------------------------------------------------
 * wave-16 · ABI v25i — pusher-band ROW consolidation + 0x85c590 tail
 * decision islands (NO ABI bump; ABI stays 53 — the Part-C coordinator
 * merges per-family bumps at the end of the wave).
 *
 * CONSOLIDATION: the v36/v39 fourth-region getter host-push PINS are now
 * expressed as ROWS of the landed v53 pusher band table:
 *   ISAAC_LUA_FOURTH_NUMBER_GETTER_HOST_VA_PUSH (0x0085c050) == pusher
 *   ROW 0 (PUSHNUMBER_F32); ISAAC_LUA_FOURTH_I32_GETTER_HOST_VA_PUSH
 *   (0x0085bff0) == pusher ROW 1 (PUSHINT_U32). The row getters complete
 *   the band 0x85bff0..0x85c590: per-row input WIDTH (bits) + a row-
 *   dispatched lo/hi VALUE pair (widen_lo/hi for row 0, u32 lo/hi for
 *   row 1, u16 lo/hi for row 2) — v53 exported count/va/ret + per-KIND
 *   laws; the per-ROW width/hi dispatchers were missing. The v40 sext
 *   getter pin 0x85bfd0 is a FOURTH pusher NOT in the 3-row band
 *   (row_for_va -> -1; closure sext pusher stays host, un-landed).
 *
 * 0x85c590 REMAINING TAIL ISLANDS (v53 landed body bounds; v11/v12 the
 * gates/imms; THIS block the tail CF/IAT facts that stay unpinned):
 *   - ebx-cached settop: `mov ebx,[0xb18328]` @0x85c5ef (identity-
 *     success path) + 7 call-ebx sites {-2 x6, -3 x1}; the IDENTITY-FAIL
 *     path (jne @0x85c5e9) calls [0xb18328] DIRECT with index -3
 *     @0x85c753..0x85c756 (ebx is still 0 there — the cache load never
 *     runs; ebx==0 also drives the later got==0 -> typename fallback).
 *   - typename fallback @0x85c792..0x85c7a6: test ebx,ebx; jne skip;
 *     lua_type(L, esi=[ebp-8] SAVED idx) @0x85c798 via IAT 0xb18400;
 *     lua_typename(L, eax) @0x85c7a0 via IAT 0xb183ac; eax -> ebx.
 *   - message build @0x85c7ae..0x85c7c5: push gotB=ebx; push gotA=eax
 *     ([ebp-0xc] spill); push fmt 0xb6e9a0; push L; call lua_pushfstring
 *     [0xb183a8] (msg = gotA FIRST, gotB SECOND); push msg; push esi
 *     (SAVED idx); push L; call luaL_argerror [0xb183a4]; add esp,0x1c
 *     (= 4 args pushfstring 0x10 + 3 args argerror 0xc).
 *   - const-fail @0x85c696..0x85c6a6: push 0xb6e9b4 (cannot-be-const);
 *     push esi; push L; call luaL_argerror [0xb183a4]; add esp,0xc;
 *     jmp 0x85c670 — RELOOP into the rawequal loop head (argerror-then-
 *     retry CF, not a terminal path).
 *   - got tolstring prep @0x85c741..0x85c74f (gotB): push 0 (len NULL);
 *     push -2; push L; call lua_tolstring [0xb183d0]; mov ebx,eax
 *     (gotB receiver = ebx); jmp 0x85c75f. And the mismatch tail
 *     @0x85c77e..0x85c78f (gotA): push 0; push -1; call [0xb183d0];
 *     mov [ebp-0xc],eax (gotA frame spill) + mov esi,[ebp-8] idx reload.
 *   All lua_* IAT bodies stay host; the VAs + CF shapes are pure laws.
 *   No uint8_t scalar params (all uint32_t/int32_t, driven UNMASKED).
 * ------------------------------------------------------------------------- */

enum {
  /* Re-pointed getter push pins -> landed pusher ROW indices. */
  ISAAC_LUA_FOURTH_NUMBER_GETTER_PUSH_ROW = 0,   /* == PUSHER_0_VA 0x85c050 */
  ISAAC_LUA_FOURTH_I32_GETTER_PUSH_ROW = 1,      /* == PUSHER_1_VA 0x85bff0 */
  /* v55: the v40 sext getter host push 0x85bfd0 IS pusher ROW 3. */
  ISAAC_LUA_FOURTH_I32_SEXT_GETTER_PUSH_ROW = 3, /* == PUSHER_3_VA 0x85bfd0 */
  /* Per-row input width (bits): PUSHNUMBER_F32 32 / PUSHINT_U32 32 /
     PUSHINT_U16 16 / PUSHINT_I32_SEXT 32. */
  ISAAC_LUA_PUSHER_WIDTH_BITS_0 = 32,
  ISAAC_LUA_PUSHER_WIDTH_BITS_1 = 32,
  ISAAC_LUA_PUSHER_WIDTH_BITS_2 = 16,
  ISAAC_LUA_PUSHER_WIDTH_BITS_3 = 32,
  /* 0x85c590 tail CF/IAT laws. */
  ISAAC_LUA_CHECK_GET_SETTOP_EBX_CACHE_IAT_VA = 0x00b18328u, /* lua_settop */
  ISAAC_LUA_CHECK_GET_SETTOP_EBX_CACHE_SITE_VA = 0x0085c5efu,
  ISAAC_LUA_CHECK_GET_SETTOP_EBX_CALL_SITES = 7,
  ISAAC_LUA_CHECK_GET_IDENTITY_FAIL_SETTOP_INDEX_U32 = 0xfffffffd, /* -3 */
  ISAAC_LUA_CHECK_GET_IDENTITY_FAIL_SETTOP_DIRECT_IAT = 1, /* via IAT, not ebx */
  ISAAC_LUA_CHECK_GET_TYPENAME_IAT_VA = 0x00b183acu,       /* lua_typename */
  ISAAC_LUA_CHECK_GET_TYPENAME_TYPE_INDEX_SAVED = 1,       /* esi = [ebp-8] */
  ISAAC_LUA_CHECK_GET_PUSHFSTRING_IAT_VA = 0x00b183a8u,    /* lua_pushfstring */
  ISAAC_LUA_CHECK_GET_MSG_GOT_A_FIRST = 1,                 /* %s order: gotA, gotB */
  ISAAC_LUA_CHECK_GET_ARGERROR_IAT_VA = 0x00b183a4u,       /* luaL_argerror */
  ISAAC_LUA_CHECK_GET_ARGERROR_INDEX_SAVED = 1,            /* esi = [ebp-8] */
  ISAAC_LUA_CHECK_GET_ERROR_TAIL_CLEANUP = 0x1c,
  ISAAC_LUA_CHECK_GET_CONST_FAIL_ARGERROR_CLEANUP = 0x0c,
  ISAAC_LUA_CHECK_GET_CONST_FAIL_RELOOPS = 1,              /* jmp 0x85c670 */
  ISAAC_LUA_CHECK_GET_GOT_TOLSTRING_IAT_VA = 0x00b183d0u,  /* lua_tolstring */
  ISAAC_LUA_CHECK_GET_GOT_B_RECEIVER_EBX = 1,              /* mov ebx,eax */
  ISAAC_LUA_CHECK_GET_GOT_A_SPILL_FRAME_SLOT = 1           /* [ebp-0xc] */
};

/* v25i pusher-band ROW getters (complete the 0x85bff0..0x85c590 band). */
int32_t isaac_lua_engine_pusher_row_for_va(uint32_t va);
int32_t isaac_lua_engine_pusher_width_bits(int32_t row);
uint32_t isaac_lua_engine_pusher_value_lo(int32_t row, uint32_t value);
uint32_t isaac_lua_engine_pusher_value_hi(int32_t row, uint32_t value);
/* Re-pointed v36/v39 getter push rows. */
int32_t isaac_lua_engine_fourth_number_getter_push_row(void);
int32_t isaac_lua_engine_fourth_i32_getter_push_row(void);
/* v55: re-pointed v40 sext getter push row (0x85bfd0 == ROW 3). */
int32_t isaac_lua_engine_fourth_i32_sext_getter_push_row(void);
/* 0x85c590 tail island laws. */
uint32_t isaac_lua_engine_check_get_settop_ebx_cache_iat_va(void);
uint32_t isaac_lua_engine_check_get_settop_ebx_cache_site_va(void);
int32_t isaac_lua_engine_check_get_settop_ebx_call_sites(void);
uint32_t isaac_lua_engine_check_get_identity_fail_settop_index(void);
int32_t isaac_lua_engine_check_get_identity_fail_settop_direct_iat(void);
uint32_t isaac_lua_engine_check_get_typename_iat_va(void);
int32_t isaac_lua_engine_check_get_typename_type_index_saved(void);
uint32_t isaac_lua_engine_check_get_pushfstring_iat_va(void);
int32_t isaac_lua_engine_check_get_msg_got_a_first(void);
uint32_t isaac_lua_engine_check_get_argerror_iat_va(void);
int32_t isaac_lua_engine_check_get_argerror_index_saved(void);
int32_t isaac_lua_engine_check_get_error_tail_cleanup(void);
int32_t isaac_lua_engine_check_get_const_fail_argerror_cleanup(void);
int32_t isaac_lua_engine_check_get_const_fail_reloops(void);
uint32_t isaac_lua_engine_check_get_got_tolstring_iat_va(void);
int32_t isaac_lua_engine_check_get_got_b_receiver_ebx(void);
int32_t isaac_lua_engine_check_get_got_a_spill_frame_slot(void);

/* ---------------------------------------------------------------------------
 * ABI v56 — EntityRef vec-helper band 0x8b91d0 (wrapper) / 0x8b9270
 * (Fadein vec-A) / 0x8b9380 (Fadeout vec-B). The wave-19 recorded frontier
 * below 0x8bb070's getRef (v52): the vec-helper siblings that CALL
 * 0x8bb070 (getRef) with edx=4, plus the GetAmbush wrapper that shares the
 * same check key 0xc82a13 (the KColor property-closure class key).
 *
 * PE (fresh dumps 008b91d0/008b9258/008b9270/008b9290/008b9380/008b9400 +
 * capstone bounds; identify-zhl: no exact matches — address-stable):
 *
 * WRAPPER 0x8b91d0 "GetAmbush" (56 insns, body 0x9b, DUAL ret
 * @0x8b9257 WRAP + @0x8b926a NIL — the census "first_ret 0x8b9257" is a
 * MID-BODY RET TRAP: `je 0x8b9258` @0x8b921e jumps past it): L=[ebp+8];
 * lua_type(L,1) @0xb18400 FULL-WORD gate; nil -> obj=0; else push 0
 * (CHKFLAGS); push KEY 0xc82a13; edx=1; ecx=L; call 0x85c590; add esp,8;
 * obj=[eax+4]; touserdata(L, 0xfff0b9d7) @0xb183b0; real_fn = ud[0];
 * ecx=obj; call eax; edi=result; test edi,edi FULL-WORD; je NIL.
 * WRAP path: push 8; push L; call lua_newuserdata(L,8) @0xb1839c;
 * ud[0]=0xb753c8 (vtable tag); ud[4]=edi (result); push 0xc82a2b; push
 * 0xfff0b9d8 (=LUA_REGISTRYINDEX); push L; call lua_rawgetp @0xb183bc;
 * push -2; push L; call lua_setmetatable @0xb18398; add esp,0x1c;
 * mov eax,1; ret @0x8b9257 (return 1 = the userdata).
 * NIL path: push L; call lua_pushnil @0xb183e0; add esp,4; mov eax,1;
 * ret @0x8b926a (return 1 = nil).
 *
 * VEC-A 0x8b9270 "Fadein" (87 insns census, ret @0x8b937a; body 0x10b)
 * and VEC-B 0x8b9380 "Fadeout" (88 insns census, ret @0x8b9487; body
 * 0x108) — the SAME vec-helper template, differing ONLY in the arg-3
 * conductor:
 *   - VEC-A: lua_toboolean(L,3) @0xb183e8; test eax,eax FULL-WORD;
 *     setne bl; byte store [esp+0x38]=bl; pushed arg dword low byte =
 *     flag. BYTE-GATED.
 *   - VEC-B: luaL_checkinteger(L,3) @0xb183f4; mov esi,eax FULL WORD;
 *     dword store [esp+0x38]=esi; push esi. FULL-WORD passthrough.
 * Shared template: L=[ebp+8]; lua_type(L,1) FULL-WORD; nil -> obj=0;
 * else push 0 (CHKFLAGS); push 0xc82a13 (KEY — same as wrapper); edx=1;
 * call 0x85c590; obj1=[eax+4]; touserdata(L, 0xfff0b9d7) @0xb183b0
 * (NOTE: NO add esp after touserdata — 2 arg dwords stay pushed, shifting
 * the frame; resolves the wave-19 "this-slot 8-byte mystery": the
 * `mov ecx,[esp+0x1c]` @0x8b9353/0x8b9460 reads abs -64 = obj1, the same
 * slot stored at [esp+0x10] — this=obj1, the SAME template as siblings
 * 0x8b9490/0x8b95c0 which set ecx=[ebp-4] explicitly); edx=4; ecx=L;
 * call 0x8bb070 (getRef L,4) -> obj4; 4x f32 lanes obj4[0..0xc] ->
 * out[0..0xc]; u32 obj4[0x10] -> esi/edi -> out[0x10]; arg2 =
 * luaL_checknumber(L,2) @0xb18324 -> x87 -> fstp -> f32 arg; real_fn =
 * ud[0]; ecx=obj1 (this); args: f32, flag/int, &out (5 dwords); xor
 * eax,eax; ret (0 Lua values).
 *
 * Reachability (whole-image abs scan, correct raw->VA mapping):
 *   - 0x8b91d0 literal @ raw 0x494543 -> VA 0x895143 in SINGLE installer
 *     0x895130 (ud[0]=0x5b1860 real_fn, name 0xb74b58 "GetAmbush").
 *   - 0x8b9270 literal @ raw 0x4945a3 -> VA 0x8951a3 in installer
 *     0x895190 (ud[0]=0x6f5210, name 0xb74b30 "Fadein").
 *   - 0x8b9380 literal @ raw 0x494603 -> VA 0x895203 in installer
 *     0x8951f0 (ud[0]=0x6f5290, name 0xb74b38 "Fadeout").
 * All three installers: 45 insns, SINGLE chain @ -3, cleanup 0x38,
 * ret 8 (class-ref ebx=ecx; L=[ebx]) — a NEW ret-8 SINGLE shape NOT in
 * the v47/v51 29-row install-helper table (recorded as INSTALL SITES).
 * 0x89f660 (DrawString DUAL_IMM, v51 row 27) FITS its row law verbatim
 * (name 0xb70468 x2, real_fn 0xa1b140, chains -5/-3, cleanups 0x40+0x24)
 * — assessed once, no new law.
 * Host: lua_* IAT bodies, 0x85c590 (v11/v12), 0x8bb070 (v52), the ud[0]
 * real_fns, the ret-8 installer bodies.
 * No uint8_t scalar params (all gates/words uint32_t; byte-gated laws use
 * explicit & 0xff and are driven WIDE unmasked).
 * ------------------------------------------------------------------------- */

enum {
  ISAAC_LUA_VECBAND_WRAPPER_VA = 0x008b91d0u,
  ISAAC_LUA_VECBAND_WRAPPER_WRAP_RET_VA = 0x008b9257u,
  ISAAC_LUA_VECBAND_WRAPPER_NIL_RET_VA = 0x008b926au,
  ISAAC_LUA_VECBAND_WRAPPER_INSNS = 56,
  ISAAC_LUA_VECBAND_CHECK_FLAGS = 0,
  ISAAC_LUA_VECBAND_CHECK_KEY = 0x00c82a13u,
  ISAAC_LUA_VECBAND_CHECK_EDX = 1,
  ISAAC_LUA_VECBAND_TYPE_INDEX = 0x01u,
  ISAAC_LUA_VECBAND_OBJECT_FIELD_OFF = 0x04u,
  ISAAC_LUA_VECBAND_TOUSERDATA_INDEX_U32 = 0xfff0b9d7u,
  ISAAC_LUA_VECBAND_FN_OFF = 0x00u,
  ISAAC_LUA_VECBAND_WRAP_UD_SIZE = 8,
  ISAAC_LUA_VECBAND_WRAP_VTABLE_TAG_VA = 0x00b753c8u,
  ISAAC_LUA_VECBAND_WRAP_RESULT_OFF = 0x04u,
  ISAAC_LUA_VECBAND_WRAP_KEY = 0x00c82a2bu,
  ISAAC_LUA_VECBAND_REGISTRY_INDEX_U32 = 0xfff0b9d8u,
  ISAAC_LUA_VECBAND_SETMETA_INDEX_U32 = 0xfffffffeu, /* -2 */
  ISAAC_LUA_VECBAND_WRAP_CLEANUP = 0x1cu
};

enum {
  ISAAC_LUA_VECBAND_VEC_A_VA = 0x008b9270u,
  ISAAC_LUA_VECBAND_VEC_A_RET_VA = 0x008b937au,
  ISAAC_LUA_VECBAND_VEC_A_INSNS = 87, /* census; true body = ret..ret */
  ISAAC_LUA_VECBAND_VEC_B_VA = 0x008b9380u,
  ISAAC_LUA_VECBAND_VEC_B_RET_VA = 0x008b9487u,
  ISAAC_LUA_VECBAND_VEC_B_INSNS = 88,
  ISAAC_LUA_VECBAND_VEC_GETREF_EDX = 0x04u,
  ISAAC_LUA_VECBAND_VEC_GETREF_HELPER_VA = 0x008bb070u,
  ISAAC_LUA_VECBAND_VEC_CHECKNUMBER_IAT_VA = 0x00b18324u,
  ISAAC_LUA_VECBAND_VEC_TOBOOLEAN_IAT_VA = 0x00b183e8u,
  ISAAC_LUA_VECBAND_VEC_CHECKINTEGER_IAT_VA = 0x00b183f4u,
  ISAAC_LUA_VECBAND_VEC_ARG2_CHECKNUMBER_INDEX_U32 = 0x02u,
  ISAAC_LUA_VECBAND_VEC_ARG3_TOBOOLEAN_INDEX_U32 = 0x03u,
  ISAAC_LUA_VECBAND_VEC_ARG3_CHECKINTEGER_INDEX_U32 = 0x03u,
  ISAAC_LUA_VECBAND_VEC_OUT_DWORDS = 5,
  ISAAC_LUA_VECBAND_VEC_LANE_COUNT = 4,
  ISAAC_LUA_VECBAND_VEC_U32_OUT_OFF = 0x10u,
  ISAAC_LUA_VECBAND_VEC_U32_SRC_OFF = 0x10u,
  ISAAC_LUA_VECBAND_RETURN_VALUE = 0
};

enum {
  ISAAC_LUA_VECBAND_INSTALL_GETAMBUSH_VA = 0x00895130u,
  ISAAC_LUA_VECBAND_INSTALL_GETAMBUSH_LITERAL_VA = 0x00895143u,
  ISAAC_LUA_VECBAND_INSTALL_GETAMBUSH_NAME_VA = 0x00b74b58u,
  ISAAC_LUA_VECBAND_INSTALL_GETAMBUSH_REAL_FN_VA = 0x005b1860u,
  ISAAC_LUA_VECBAND_INSTALL_FADEIN_VA = 0x00895190u,
  ISAAC_LUA_VECBAND_INSTALL_FADEIN_LITERAL_VA = 0x008951a3u,
  ISAAC_LUA_VECBAND_INSTALL_FADEIN_NAME_VA = 0x00b74b30u,
  ISAAC_LUA_VECBAND_INSTALL_FADEIN_REAL_FN_VA = 0x006f5210u,
  ISAAC_LUA_VECBAND_INSTALL_FADEOUT_VA = 0x008951f0u,
  ISAAC_LUA_VECBAND_INSTALL_FADEOUT_LITERAL_VA = 0x00895203u,
  ISAAC_LUA_VECBAND_INSTALL_FADEOUT_NAME_VA = 0x00b74b38u,
  ISAAC_LUA_VECBAND_INSTALL_FADEOUT_REAL_FN_VA = 0x006f5290u
};

/* FULL-WORD type gate (shared by wrapper + both vec bodies):
 * obj = (type != 0) ? check_field : 0. Never byte-masked. */
uint32_t isaac_lua_engine_vecband_object_resolve(uint32_t type_result,
                                                 uint32_t check_field);
/* FULL-WORD result gate (wrapper): 1 = wrap path, 0 = nil path. */
uint32_t isaac_lua_engine_vecband_wrapper_result_gate(uint32_t result);
/* VEC-A byte-gated arg: (tobool_result != 0) & 0xff — 0x100 -> 1. */
uint32_t isaac_lua_engine_vecband_vec_a_flag_byte(uint32_t tobool_result);
/* VEC-B full-word arg: checkinteger passthrough, no mask. */
uint32_t isaac_lua_engine_vecband_vec_b_arg_word(uint32_t checkint_result);
/* Shared getRef edx (REGISTER 4 -> 0x85c590 passthrough). */
uint32_t isaac_lua_engine_vecband_vec_getref_edx(uint32_t index);
/* Vec out lane offset: out + 4*lane (0..3); u32 at +0x10. */
uint32_t isaac_lua_engine_vecband_vec_out_f32_off_at(int32_t lane);
uint32_t isaac_lua_engine_vecband_vec_u32_out_off(void);

/* v56 no-arg getters. */
uint32_t isaac_lua_engine_vecband_wrapper_va(void);
uint32_t isaac_lua_engine_vecband_wrapper_wrap_ret_va(void);
uint32_t isaac_lua_engine_vecband_wrapper_nil_ret_va(void);
uint32_t isaac_lua_engine_vecband_wrapper_body_bytes(void);
int32_t isaac_lua_engine_vecband_wrapper_insn_count(void);
int32_t isaac_lua_engine_vecband_check_flags(void);
uint32_t isaac_lua_engine_vecband_check_key(void);
int32_t isaac_lua_engine_vecband_check_edx(void);
uint32_t isaac_lua_engine_vecband_touserdata_index(void);
uint32_t isaac_lua_engine_vecband_fn_off(void);
uint32_t isaac_lua_engine_vecband_wrap_ud_size(void);
uint32_t isaac_lua_engine_vecband_wrap_vtable_tag_va(void);
uint32_t isaac_lua_engine_vecband_wrap_result_off(void);
uint32_t isaac_lua_engine_vecband_wrap_key(void);
uint32_t isaac_lua_engine_vecband_registry_index(void);
uint32_t isaac_lua_engine_vecband_setmeta_index(void);
uint32_t isaac_lua_engine_vecband_wrap_cleanup(void);
uint32_t isaac_lua_engine_vecband_vec_a_va(void);
uint32_t isaac_lua_engine_vecband_vec_a_ret_va(void);
uint32_t isaac_lua_engine_vecband_vec_a_body_bytes(void);
int32_t isaac_lua_engine_vecband_vec_a_insn_count(void);
uint32_t isaac_lua_engine_vecband_vec_b_va(void);
uint32_t isaac_lua_engine_vecband_vec_b_ret_va(void);
uint32_t isaac_lua_engine_vecband_vec_b_body_bytes(void);
int32_t isaac_lua_engine_vecband_vec_b_insn_count(void);
uint32_t isaac_lua_engine_vecband_vec_getref_helper_va(void);
uint32_t isaac_lua_engine_vecband_vec_checknumber_iat_va(void);
uint32_t isaac_lua_engine_vecband_vec_toboolean_iat_va(void);
uint32_t isaac_lua_engine_vecband_vec_checkinteger_iat_va(void);
uint32_t isaac_lua_engine_vecband_vec_arg2_checknumber_index(void);
uint32_t isaac_lua_engine_vecband_vec_arg3_toboolean_index(void);
uint32_t isaac_lua_engine_vecband_vec_arg3_checkinteger_index(void);
int32_t isaac_lua_engine_vecband_vec_out_dwords(void);
int32_t isaac_lua_engine_vecband_vec_lane_count(void);
int32_t isaac_lua_engine_vecband_return_value(void);
uint32_t isaac_lua_engine_vecband_install_getambush_va(void);
uint32_t isaac_lua_engine_vecband_install_getambush_literal_va(void);
uint32_t isaac_lua_engine_vecband_install_getambush_name_va(void);
uint32_t isaac_lua_engine_vecband_install_getambush_real_fn_va(void);
uint32_t isaac_lua_engine_vecband_install_fadein_va(void);
uint32_t isaac_lua_engine_vecband_install_fadein_literal_va(void);
uint32_t isaac_lua_engine_vecband_install_fadein_name_va(void);
uint32_t isaac_lua_engine_vecband_install_fadein_real_fn_va(void);
uint32_t isaac_lua_engine_vecband_install_fadeout_va(void);
uint32_t isaac_lua_engine_vecband_install_fadeout_literal_va(void);
uint32_t isaac_lua_engine_vecband_install_fadeout_name_va(void);
uint32_t isaac_lua_engine_vecband_install_fadeout_real_fn_va(void);

/* ---------------------------------------------------------------------------
 * ABI v57 — sibling band 0x8b9490 "MakeShockwave" / 0x8b95a0 "Play".
 * The v56 NOTES next-frontier: the ebp-framed siblings ABOVE the
 * GetAmbush/Fadein/Fadeout band, both calling the same 0x85c590
 * object-resolve helper (v11/v12) and 0x8baa50 getArgObject (v25h BODY,
 * sibling A only). section-notes/lua-v57-siblings/NOTES.md.
 *
 * PE (fresh dumps 008b9490.txt / 008b95a0.txt + capstone bounds;
 * identify-zhl: no exact matches — address-stable):
 *
 * SIBLING A 0x8b9490 "MakeShockwave" (89 insns TRUE body, ret 0x8b959f,
 * body 0x10f; the handoff "96 insns" is a linear census incl. B's
 * prologue): ebx-framed + aligned ebp subframe; L=edi=[ebx+8]; obj1 =
 * lua_type(L,1) FULL-WORD gate -> 0x85c590 (flags 0, KEY 0xc82a13, edx
 * 1) -> [eax+4]; touserdata(L, upvalueindex(1) 0xfff0b9d7) — NO add
 * esp,8, all locals ebp-relative; arg3 = checkinteger(L,5) FULL WORD;
 * arg2 = checknumber(L,4) f32; arg1 = checknumber(L,3) f32;
 * getArgObject(L, edx=2) -> r0=[eax], r1=[eax+4]; out struct 24 bytes
 * @[ebp-0x50] = [r0 f32, r1 f32, num3 f32, num4 f32, int5 u32, ud u32];
 * real_fn = ud[0]; ecx = obj1; stack args (&out, num3, num4, int5);
 * ret 0.
 *
 * SIBLING B 0x8b95a0 "Play" (99 insns TRUE body, ret 0x8b96c8, body
 * 0x128; the handoff "97 insns" is a mid-body census from 0x8b95c0):
 * same frame; L=esi=[ebx+8]; obj1 resolve SAME template but KEY
 * **0xc82a16** (the next check-key band above 0xc82a13); NO getArgObject
 * call (single 0x85c590); ud = touserdata(L, 0xfff0b9d7) -> edi, NO add
 * esp,8 — the 2 leftover dwords become the arg4/arg5 SLOTS (movss
 * [esp]/[esp+4] after the fused add esp,0x30): final stack args
 * (int2, num3, int4, bool5, num6, num7) = checkinteger(L,2) FULL WORD,
 * checknumber(L,3) f32, checkinteger(L,4) FULL WORD, toboolean(L,5)
 * FULL-WORD test -> setne -> LOW BYTE ONLY (the pushed dword is
 * reloaded from memory: high 3 bytes stale garbage), checknumber(L,6)
 * f32, checknumber(L,7) f32. real_fn = ud[0]; ecx = obj1; ret 0.
 *
 * Install sites (reachability, ret-8 SINGLE shape, byte-identical to the
 * v56 band — recorded as INSTALL SITES, not 29-row table rows):
 * 0x895250 ud[0]=0x703770 name 0xb74c00 "MakeShockwave" literal @0x895263;
 * 0x895450 ud[0]=0x92dc30 name 0xb70498 "Play" literal @0x895463; both
 * 45 insns, cleanup 0x38, ret 8.
 * ----------------------------------------------------------------------- */
enum {
  ISAAC_LUA_V57_SIB_A_VA = 0x008b9490u,
  ISAAC_LUA_V57_SIB_A_RET_VA = 0x008b959fu,
  ISAAC_LUA_V57_SIB_A_INSNS = 89, /* capstone TRUE body, ret inclusive */
  ISAAC_LUA_V57_SIB_B_VA = 0x008b95a0u,
  ISAAC_LUA_V57_SIB_B_RET_VA = 0x008b96c8u,
  ISAAC_LUA_V57_SIB_B_INSNS = 99,
  ISAAC_LUA_V57_CHECK_FLAGS = 0,
  ISAAC_LUA_V57_CHECK_EDX = 1,
  ISAAC_LUA_V57_TYPE_INDEX = 0x01u,
  ISAAC_LUA_V57_OBJECT_FIELD_OFF = 0x04u,
  ISAAC_LUA_V57_KEY_A = 0x00c82a13u,
  ISAAC_LUA_V57_KEY_B = 0x00c82a16u,
  ISAAC_LUA_V57_TOUSERDATA_INDEX_U32 = 0xfff0b9d7u,
  ISAAC_LUA_V57_FN_OFF = 0x00u,
  ISAAC_LUA_V57_GET_ARG_OBJECT_VA = 0x008baa50u,
  ISAAC_LUA_V57_GET_ARG_EDX = 0x02u,
  ISAAC_LUA_V57_IAT_LUA_TYPE = 0x00b18400u,
  ISAAC_LUA_V57_IAT_LUA_TOUSERDATA = 0x00b183b0u,
  ISAAC_LUA_V57_IAT_LUA_CHECKINTEGER = 0x00b183f4u,
  ISAAC_LUA_V57_IAT_LUA_CHECKNUMBER = 0x00b18324u,
  ISAAC_LUA_V57_IAT_LUA_TOBOOLEAN = 0x00b183e8u,
  ISAAC_LUA_V57_SIB_A_ARG1_CHECKNUMBER_INDEX_U32 = 0x03u,
  ISAAC_LUA_V57_SIB_A_ARG2_CHECKNUMBER_INDEX_U32 = 0x04u,
  ISAAC_LUA_V57_SIB_A_ARG3_CHECKINTEGER_INDEX_U32 = 0x05u,
  ISAAC_LUA_V57_SIB_A_OUT_F32_COUNT = 4,
  ISAAC_LUA_V57_SIB_A_OUT_DWORDS = 6,
  ISAAC_LUA_V57_SIB_A_OUT_U32_OFF = 0x10u,
  ISAAC_LUA_V57_SIB_A_OUT_UD_OFF = 0x14u,
  ISAAC_LUA_V57_SIB_B_ARG0_CHECKINTEGER_INDEX_U32 = 0x02u,
  ISAAC_LUA_V57_SIB_B_ARG1_CHECKNUMBER_INDEX_U32 = 0x03u,
  ISAAC_LUA_V57_SIB_B_ARG2_CHECKINTEGER_INDEX_U32 = 0x04u,
  ISAAC_LUA_V57_SIB_B_ARG3_TOBOOLEAN_INDEX_U32 = 0x05u,
  ISAAC_LUA_V57_SIB_B_ARG4_CHECKNUMBER_INDEX_U32 = 0x06u,
  ISAAC_LUA_V57_SIB_B_ARG5_CHECKNUMBER_INDEX_U32 = 0x07u,
  ISAAC_LUA_V57_RETURN_VALUE = 0
};

enum {
  ISAAC_LUA_V57_INSTALL_A_VA = 0x00895250u,
  ISAAC_LUA_V57_INSTALL_A_LITERAL_VA = 0x00895263u,
  ISAAC_LUA_V57_INSTALL_A_NAME_VA = 0x00b74c00u,
  ISAAC_LUA_V57_INSTALL_A_REAL_FN_VA = 0x00703770u,
  ISAAC_LUA_V57_INSTALL_B_VA = 0x00895450u,
  ISAAC_LUA_V57_INSTALL_B_LITERAL_VA = 0x00895463u,
  ISAAC_LUA_V57_INSTALL_B_NAME_VA = 0x00b70498u,
  ISAAC_LUA_V57_INSTALL_B_REAL_FN_VA = 0x0092dc30u
};

/* FULL-WORD lua_type(L,1) gate (both siblings): obj = (type != 0) ?
 * check_field : 0 — `test eax,eax` @0x8b94ba / @0x8b95ca. Never masked. */
uint32_t isaac_lua_engine_v57_object_resolve(uint32_t type_result,
                                             uint32_t check_field);
/* Sibling-B arg3 LOW-BYTE law: toboolean FULL-WORD test -> setne byte
 * ([ebp-0x20] @0x8b9638); the pushed dword is a MEMORY reload with
 * stale high bytes — only (tobool != 0) & 0xff is deterministic. */
uint32_t isaac_lua_engine_v57_bool_low_byte(uint32_t tobool_result);
/* checkinteger FULL WORD passthrough (A arg3 `mov esi,eax` @0x8b94fa;
 * B arg0/arg2 `mov edx,eax` @0x8b967e + [ebp-0x40] @0x8b9652). */
uint32_t isaac_lua_engine_v57_int_word(uint32_t checkint_result);
/* Sibling-A out f32 lane offset: out + 4*lane (0..3); u32 @ +0x10,
 * ud @ +0x14. */
uint32_t isaac_lua_engine_v57_out_f32_off_at(int32_t lane);
uint32_t isaac_lua_engine_v57_out_u32_off(void);
uint32_t isaac_lua_engine_v57_out_ud_off(void);

/* v57 no-arg getters. */
uint32_t isaac_lua_engine_v57_sib_a_va(void);
uint32_t isaac_lua_engine_v57_sib_a_ret_va(void);
uint32_t isaac_lua_engine_v57_sib_a_body_bytes(void);
int32_t isaac_lua_engine_v57_sib_a_insn_count(void);
uint32_t isaac_lua_engine_v57_sib_b_va(void);
uint32_t isaac_lua_engine_v57_sib_b_ret_va(void);
uint32_t isaac_lua_engine_v57_sib_b_body_bytes(void);
int32_t isaac_lua_engine_v57_sib_b_insn_count(void);
int32_t isaac_lua_engine_v57_check_flags(void);
int32_t isaac_lua_engine_v57_check_edx(void);
uint32_t isaac_lua_engine_v57_key_a(void);
uint32_t isaac_lua_engine_v57_key_b(void);
uint32_t isaac_lua_engine_v57_object_field_off(void);
uint32_t isaac_lua_engine_v57_type_index(void);
uint32_t isaac_lua_engine_v57_touserdata_index(void);
uint32_t isaac_lua_engine_v57_fn_off(void);
uint32_t isaac_lua_engine_v57_get_arg_object_va(void);
uint32_t isaac_lua_engine_v57_get_arg_edx(void);
uint32_t isaac_lua_engine_v57_iat_lua_type(void);
uint32_t isaac_lua_engine_v57_iat_lua_touserdata(void);
uint32_t isaac_lua_engine_v57_iat_lua_checkinteger(void);
uint32_t isaac_lua_engine_v57_iat_lua_checknumber(void);
uint32_t isaac_lua_engine_v57_iat_lua_toboolean(void);
uint32_t isaac_lua_engine_v57_sib_a_arg1_checknumber_index(void);
uint32_t isaac_lua_engine_v57_sib_a_arg2_checknumber_index(void);
uint32_t isaac_lua_engine_v57_sib_a_arg3_checkinteger_index(void);
int32_t isaac_lua_engine_v57_sib_a_out_f32_count(void);
int32_t isaac_lua_engine_v57_sib_a_out_dwords(void);
uint32_t isaac_lua_engine_v57_sib_b_arg0_checkinteger_index(void);
uint32_t isaac_lua_engine_v57_sib_b_arg1_checknumber_index(void);
uint32_t isaac_lua_engine_v57_sib_b_arg2_checkinteger_index(void);
uint32_t isaac_lua_engine_v57_sib_b_arg3_toboolean_index(void);
uint32_t isaac_lua_engine_v57_sib_b_arg4_checknumber_index(void);
uint32_t isaac_lua_engine_v57_sib_b_arg5_checknumber_index(void);
int32_t isaac_lua_engine_v57_return_value(void);
uint32_t isaac_lua_engine_v57_install_a_va(void);
uint32_t isaac_lua_engine_v57_install_a_literal_va(void);
uint32_t isaac_lua_engine_v57_install_a_name_va(void);
uint32_t isaac_lua_engine_v57_install_a_real_fn_va(void);
uint32_t isaac_lua_engine_v57_install_b_va(void);
uint32_t isaac_lua_engine_v57_install_b_literal_va(void);
uint32_t isaac_lua_engine_v57_install_b_name_va(void);
uint32_t isaac_lua_engine_v57_install_b_real_fn_va(void);

/* ---------------------------------------------------------------------------
 * ABI v58 — the 0x8b96d0-family head wrapper 0x8b96d0 "AdjustVolume" /
 * "AdjustPitch" (the body after v57 Play; v57 NOTES next-frontier).
 * The NET AUDIT's top open candidate (scripts/decomp/lua-net-audit.py):
 * the first caller-bearing UNLANDED body after Play in the 0x8b wrapper
 * band; exactly one 32-bit LE literal @0x8954c9 (the dword of `push
 * 0x8b96d0` @0x8954c8 inside the ret-8 SINGLE-reg installer 0x8954b0);
 * zero E8 callers. section-notes/lua-v58-net/NOTES.md.
 *
 * PE (fresh dump cpu-dump/008b96d0.txt + capstone TRUE body):
 * 0x8b96d0..0x8b9751, 48 insns, body 0x81 (0x8b9751 - 0x8b96d0). SIMPLE ebp frame (NOT the
 * ebx-framed + aligned-ebp v56/v57 template): `push ebp; mov ebp,esp;
 * sub esp,0x10; push esi; push edi`; L = esi = [ebp+8]; locals [ebp-4]
 * (obj1) and [ebp-0xc] (num3), both ebp-relative -> immune to the
 * esp-shift trap.
 *   obj1 = lua_type(L,1) FULL-WORD gate @0x8b96e7 -> 0x85c590 (flags 0,
 *     KEY 0xc82a16, edx 1) @0x8b96fe -> [eax+4] @[ebp-4].
 *   ud = touserdata(L, 0xfff0b9d7) @0xb183b0 @0x8b9712 -> edi — NO add
 *     esp,8; then checknumber(L,3) + checkinteger(L,2): all THREE IAT
 *     pairs left pushed, cleaned by ONE fused `add esp,0x14` @0x8b9732.
 *     The leftover upvidx dword is reused as the arg1 SLOT: `movss
 *     [esp],xmm0` @0x8b9740 writes num3 f32 exactly into it (the v57
 *     Play esp lesson, one dword instead of two).
 *   arg0 = int2 = checkinteger(L,2) FULL WORD -> `push eax` @0x8b9745.
 *   arg1 = num3 = checknumber(L,3) f32 -> fstp [ebp-0xc] -> movss [esp].
 *   real_fn = ud[0]; ecx = obj1 (this) @0x8b9735; stack args (int2,
 *     num3); xor eax,eax @0x8b974b -> ret 0 Lua values.
 *
 * Install site (reachability, ret-8 SINGLE-reg shape — v50 helper-13
 * 0x89fd80 lineage; recorded as INSTALL SITE, not a 29-row table row):
 * 0x8954b0 (48 insns, ret 8 @0x895507, cleanup 0x38): newuserdata(L,4);
 * ud[0] = [ebp+0xc] (REGISTER-held real_fn); pushcclosure(L, wrapper imm
 * 0x8b96d0, nups=1); absindex(-3); pushstring [ebp+8] (REGISTER-held
 * name); rotate(-2,1); rawset. TWO E8 callers in the class-registration
 * run 0x86da80: @0x86da96 (real_fn 0x92df40, name 0xb74bf0
 * "AdjustVolume") and @0x86daa7 (real_fn 0x92e050, name 0xb74bc4
 * "AdjustPitch"). One wrapper body, TWO (name, real_fn) pairs.
 * ----------------------------------------------------------------------- */
enum {
  ISAAC_LUA_V58_VA = 0x008b96d0u,
  ISAAC_LUA_V58_RET_VA = 0x008b9751u,
  ISAAC_LUA_V58_INSNS = 48, /* capstone TRUE body, ret inclusive */
  ISAAC_LUA_V58_CHECK_FLAGS = 0,
  ISAAC_LUA_V58_CHECK_EDX = 1,
  ISAAC_LUA_V58_TYPE_INDEX = 0x01u,
  ISAAC_LUA_V58_OBJECT_FIELD_OFF = 0x04u,
  ISAAC_LUA_V58_KEY = 0x00c82a16u,
  ISAAC_LUA_V58_TOUSERDATA_INDEX_U32 = 0xfff0b9d7u,
  ISAAC_LUA_V58_FN_OFF = 0x00u,
  ISAAC_LUA_V58_IAT_LUA_TYPE = 0x00b18400u,
  ISAAC_LUA_V58_IAT_LUA_TOUSERDATA = 0x00b183b0u,
  ISAAC_LUA_V58_IAT_LUA_CHECKNUMBER = 0x00b18324u,
  ISAAC_LUA_V58_IAT_LUA_CHECKINTEGER = 0x00b183f4u,
  ISAAC_LUA_V58_ARG0_CHECKINTEGER_INDEX_U32 = 0x02u,
  ISAAC_LUA_V58_ARG1_CHECKNUMBER_INDEX_U32 = 0x03u,
  ISAAC_LUA_V58_RETURN_VALUE = 0
};

enum {
  ISAAC_LUA_V58_INSTALL_VA = 0x008954b0u,
  ISAAC_LUA_V58_INSTALL_LITERAL_VA = 0x008954c9u,
  ISAAC_LUA_V58_INSTALL_REAL_FN_A_VA = 0x0092df40u,
  ISAAC_LUA_V58_INSTALL_NAME_A_VA = 0x00b74bf0u,
  ISAAC_LUA_V58_INSTALL_CALLER_A_VA = 0x0086da96u,
  ISAAC_LUA_V58_INSTALL_REAL_FN_B_VA = 0x0092e050u,
  ISAAC_LUA_V58_INSTALL_NAME_B_VA = 0x00b74bc4u,
  ISAAC_LUA_V58_INSTALL_CALLER_B_VA = 0x0086daa7u
};

/* FULL-WORD lua_type(L,1) gate (`test eax,eax` @0x8b96e7): obj =
 * (type != 0) ? check_field : 0. Never masked (0x100 -> 1). */
uint32_t isaac_lua_engine_v58_object_resolve(uint32_t type_result,
                                             uint32_t check_field);
/* checkinteger FULL WORD passthrough (`push eax` @0x8b9745): arg0 =
 * int2; 0x100 / 0x10000 / 0xffffffff ALL survive. Never masked. */
uint32_t isaac_lua_engine_v58_int_word(uint32_t checkint_result);

/* v58 no-arg getters. */
uint32_t isaac_lua_engine_v58_va(void);
uint32_t isaac_lua_engine_v58_ret_va(void);
uint32_t isaac_lua_engine_v58_body_bytes(void);
int32_t isaac_lua_engine_v58_insn_count(void);
int32_t isaac_lua_engine_v58_check_flags(void);
int32_t isaac_lua_engine_v58_check_edx(void);
uint32_t isaac_lua_engine_v58_key(void);
uint32_t isaac_lua_engine_v58_object_field_off(void);
uint32_t isaac_lua_engine_v58_type_index(void);
uint32_t isaac_lua_engine_v58_touserdata_index(void);
uint32_t isaac_lua_engine_v58_fn_off(void);
uint32_t isaac_lua_engine_v58_iat_lua_type(void);
uint32_t isaac_lua_engine_v58_iat_lua_touserdata(void);
uint32_t isaac_lua_engine_v58_iat_lua_checknumber(void);
uint32_t isaac_lua_engine_v58_iat_lua_checkinteger(void);
uint32_t isaac_lua_engine_v58_arg0_checkinteger_index(void);
uint32_t isaac_lua_engine_v58_arg1_checknumber_index(void);
int32_t isaac_lua_engine_v58_return_value(void);
uint32_t isaac_lua_engine_v58_install_va(void);
uint32_t isaac_lua_engine_v58_install_literal_va(void);
uint32_t isaac_lua_engine_v58_install_real_fn_a_va(void);
uint32_t isaac_lua_engine_v58_install_name_a_va(void);
uint32_t isaac_lua_engine_v58_install_caller_a_va(void);
uint32_t isaac_lua_engine_v58_install_real_fn_b_va(void);
uint32_t isaac_lua_engine_v58_install_name_b_va(void);
uint32_t isaac_lua_engine_v58_install_caller_b_va(void);

/* ---------------------------------------------------------------------------
 * ABI v59 — the 0x8b9760-family head wrapper 0x8b9760 "Stop" /
 * "Preload" (the body after v58 AdjustVolume; v58 NOTES
 * next-frontier). The NET AUDIT's next open candidate
 * (scripts/decomp/lua-net-audit.py): the first caller-bearing UNLANDED
 * body of the 0x8b9760..0x8b9e80 band; exactly one 32-bit LE literal
 * @0x895529 (the dword of `push 0x8b9760` @0x895528 inside the ret-8
 * SINGLE-reg installer 0x895510); zero E8 callers.
 * section-notes/lua-v59-8b9760/NOTES.md.
 *
 * PE (fresh dump cpu-dump/008b9760.txt + capstone TRUE body):
 * 0x8b9760..0x8b97cb, 41 insns, body 0x6b (0x8b97cb - 0x8b9760). Frame: `push ebp;
 * mov ebp,esp; and esp,0xfffffff8; sub esp,8; push esi; push edi` — the
 * ALIGNED-ebp subframe WITHOUT the ebx register frame (v56/v57 =
 * ebx-framed + aligned; v58 = SIMPLE ebp; v59 = aligned-ebp, no ebx —
 * a new shape in the band). L = edi = [ebp+8]; obj1 local at [esp+0xc]
 * (esp-relative but touched ONLY at deterministic esp points after each
 * `add esp,8` — the aligned frame resolves every access to the same
 * [ebp-4] slot; capstone esp-tracking: no shift trap).
 *   obj1 = lua_type(L,1) FULL-WORD gate @0x8b977a -> 0x85c590 (flags 0,
 *     KEY 0xc82a16, edx 1) @0x8b9792 -> [eax+4] @[esp+0xc].
 *   ud = touserdata(L, 0xfff0b9d7) @0xb183b0 @0x8b97a7 -> esi — NO add
 *     esp,8; then checkinteger(L,2) @0xb183f4 @0x8b97b2: all 4 dwords
 *     left pushed, cleaned by ONE fused `add esp,0x10` @0x8b97bc.
 *   ecx = obj1 loaded BEFORE cleanup @0x8b97b8 ([esp+0x1c] = [ebp-4]).
 *   arg0 = int2 = checkinteger(L,2) FULL WORD -> `push eax` @0x8b97bf.
 *   real_fn = ud[0] (FN_OFF 0); ecx = obj1 (this); ONE stack arg int2;
 *   xor eax,eax @0x8b97c5 -> ret 0 Lua values. (Epilogue pops the
 *   leftover arg dword into the DEAD edi then restores via mov esp,ebp —
 *   value-irrelevant.)
 *
 * Install site (reachability, ret-8 SINGLE-reg shape — byte-identical
 * to the v58 installer 0x8954b0; recorded as INSTALL SITE, not a
 * 29-row table row): 0x895510 (48 insns, ret 8 @0x895567, cleanup
 * 0x38): newuserdata(L,4); ud[0] = [ebp+0xc] (REGISTER-held real_fn);
 * pushcclosure(L, wrapper imm 0x8b9760, nups=1); absindex(-3);
 * pushstring [ebp+8] (REGISTER-held name); rotate(-2,1); rawset. TWO
 * E8 callers in the class-registration run 0x86da80: @0x86dab8
 * (real_fn 0x92e230, name 0xb1d6f4 "Stop") and @0x86dada (real_fn
 * 0x92cf40, name 0xb74bac "Preload" — v59-B corrected from a
 * misattribution; the 0x92e300/"StopLoopingSounds" pair belongs to the
 * NEXT installer 0x895570, landed as the v60 unit). One wrapper body,
 * TWO (name, real_fn) pairs.
 * ----------------------------------------------------------------------- */
enum {
  ISAAC_LUA_V59_VA = 0x008b9760u,
  ISAAC_LUA_V59_RET_VA = 0x008b97cbu,
  ISAAC_LUA_V59_INSNS = 41, /* capstone TRUE body, ret inclusive */
  ISAAC_LUA_V59_CHECK_FLAGS = 0,
  ISAAC_LUA_V59_CHECK_EDX = 1,
  ISAAC_LUA_V59_TYPE_INDEX = 0x01u,
  ISAAC_LUA_V59_OBJECT_FIELD_OFF = 0x04u,
  ISAAC_LUA_V59_KEY = 0x00c82a16u,
  ISAAC_LUA_V59_TOUSERDATA_INDEX_U32 = 0xfff0b9d7u,
  ISAAC_LUA_V59_FN_OFF = 0x00u,
  ISAAC_LUA_V59_IAT_LUA_TYPE = 0x00b18400u,
  ISAAC_LUA_V59_IAT_LUA_TOUSERDATA = 0x00b183b0u,
  ISAAC_LUA_V59_IAT_LUA_CHECKINTEGER = 0x00b183f4u,
  ISAAC_LUA_V59_ARG0_CHECKINTEGER_INDEX_U32 = 0x02u,
  ISAAC_LUA_V59_RETURN_VALUE = 0
};

enum {
  ISAAC_LUA_V59_INSTALL_VA = 0x00895510u,
  ISAAC_LUA_V59_INSTALL_LITERAL_VA = 0x00895529u,
  ISAAC_LUA_V59_INSTALL_REAL_FN_A_VA = 0x0092e230u,
  ISAAC_LUA_V59_INSTALL_NAME_A_VA = 0x00b1d6f4u,
  ISAAC_LUA_V59_INSTALL_CALLER_A_VA = 0x0086dab8u,
  ISAAC_LUA_V59_INSTALL_REAL_FN_B_VA = 0x0092cf40u,
  ISAAC_LUA_V59_INSTALL_NAME_B_VA = 0x00b74bacu,
  ISAAC_LUA_V59_INSTALL_CALLER_B_VA = 0x0086dadau
};

/* FULL-WORD lua_type(L,1) gate (`test eax,eax` @0x8b977a): obj =
 * (type != 0) ? check_field : 0. Never masked (0x100 -> 1). */
uint32_t isaac_lua_engine_v59_object_resolve(uint32_t type_result,
                                             uint32_t check_field);
/* checkinteger FULL WORD passthrough (`push eax` @0x8b97bf): arg0 =
 * int2; 0x100 / 0x10000 / 0xffffffff ALL survive. Never masked. */
uint32_t isaac_lua_engine_v59_int_word(uint32_t checkint_result);

/* v59 no-arg getters. */
uint32_t isaac_lua_engine_v59_va(void);
uint32_t isaac_lua_engine_v59_ret_va(void);
uint32_t isaac_lua_engine_v59_body_bytes(void);
int32_t isaac_lua_engine_v59_insn_count(void);
int32_t isaac_lua_engine_v59_check_flags(void);
int32_t isaac_lua_engine_v59_check_edx(void);
uint32_t isaac_lua_engine_v59_key(void);
uint32_t isaac_lua_engine_v59_object_field_off(void);
uint32_t isaac_lua_engine_v59_type_index(void);
uint32_t isaac_lua_engine_v59_touserdata_index(void);
uint32_t isaac_lua_engine_v59_fn_off(void);
uint32_t isaac_lua_engine_v59_iat_lua_type(void);
uint32_t isaac_lua_engine_v59_iat_lua_touserdata(void);
uint32_t isaac_lua_engine_v59_iat_lua_checkinteger(void);
uint32_t isaac_lua_engine_v59_arg0_checkinteger_index(void);
int32_t isaac_lua_engine_v59_return_value(void);
uint32_t isaac_lua_engine_v59_install_va(void);
uint32_t isaac_lua_engine_v59_install_literal_va(void);
uint32_t isaac_lua_engine_v59_install_real_fn_a_va(void);
uint32_t isaac_lua_engine_v59_install_name_a_va(void);
uint32_t isaac_lua_engine_v59_install_caller_a_va(void);
uint32_t isaac_lua_engine_v59_install_real_fn_b_va(void);
uint32_t isaac_lua_engine_v59_install_name_b_va(void);
uint32_t isaac_lua_engine_v59_install_caller_b_va(void);

/* ---------------------------------------------------------------------------
 * ABI v60 — wrapper 0x8b97d0 "StopLoopingSounds" (the SECOND body of the
 * 0x8b9760..0x8b9e80 band; v59 NOTES next-frontier: "check the installer
 * after 0x895510 (0x895570 area) for the 0x8b97d0 literal"). Exactly one
 * 32-bit LE literal @0x895583 (the dword of `push 0x8b97d0` @0x895582
 * inside the IMMEDIATE-held ret-8 installer 0x895570); zero E8 callers.
 * section-notes/lua-v60-8b97d0/NOTES.md.
 *
 * PE (fresh capstone TRUE body):
 * 0x8b97d0..0x8b981f, 32 insns, body 0x4f (0x8b981f - 0x8b97d0). Frame:
 * `push ebp; mov ebp,esp; push esi; mov esi,[ebp+8]; push edi` — SIMPLE
 * ebp (v58-shaped; NO `and esp` aligned subframe — NOT the v59 aligned
 * no-ebx shape). L = esi = [ebp+8]. obj1 lives in EDI (REGISTER) the
 * whole body — ZERO mem stores (the v59 [esp+0xc] slot is absent).
 *   obj1 = lua_type(L,1) FULL-WORD gate @0x8b97e4 -> 0x85c590 (flags 0,
 *     KEY 0xc82a16, edx 1) @0x8b97fa -> [eax+4] @0x8b9802.
 *   ud = touserdata(L, 0xfff0b9d7) @0xb183b0 @0x8b980b -> add esp,8
 *     @0x8b9811 (cleanup PRESENT — the v59 fused no-cleanup is NOT this
 *     body); ecx = obj1 (edi) @0x8b9814 AFTER cleanup; eax = [eax]
 *     (ud[0], FN_OFF 0) @0x8b9816; `call eax` @0x8b9818 — ZERO pushed
 *     args (NO checkinteger/checknumber/toboolean anywhere: indirect
 *     list is ONLY [0xb18400] + [0xb183b0] + eax). xor eax,eax
 *     @0x8b981b -> ret 0 Lua values; ret @0x8b981f.
 *
 * ZERO-ARG wrapper (contrast v58 2-arg / v59 1-checkinteger-arg): no
 * int_word law, no arg0 index, no checkinteger IAT. Same key 0xc82a16
 * band as v57/v58/v59.
 *
 * Install site (reachability; recorded as INSTALL SITE, not a 29-row
 * table row): 0x895570 (TRUE 33 insns, ret 8 @0x8955c6, cleanup 0x38)
 * — IMMEDIATE-held SINGLE shape (the handoff's "0x895570 area"): `push
 * ebx; push esi; mov ebx,ecx; push edi` (receiver this carries state:
 * edi = [ebx] = L); newuserdata(L,4) @0xb1839c; mov [eax],0x92e300
 * @0x895588 (REAL_FN immediate); pushcclosure(L, wrapper imm 0x8b97d0,
 * nups=1) @0xb183fc; absindex(-3) @0xb18418; push 0xb74bd0 @0x89559d
 * (NAME immediate); pushstring @0xb18414; rotate(-2,1) @0xb1840c;
 * rawset @0xb18408; cleanup 0x38; mov eax,ebx; ret 8. ONE E8 caller
 * @0x86dac9 in the class-reg run 0x86da80 (pushed 0x92e300 + 0xb74bd0
 * are DEAD — immediates authoritative). Same wrapper body, ONE
 * (name, real_fn) pair: "StopLoopingSounds" 0xb74bd0 / 0x92e300.
 * ----------------------------------------------------------------------- */
enum {
  ISAAC_LUA_V60_VA = 0x008b97d0u,
  ISAAC_LUA_V60_RET_VA = 0x008b981fu,
  ISAAC_LUA_V60_INSNS = 32, /* capstone TRUE body, ret inclusive */
  ISAAC_LUA_V60_CHECK_FLAGS = 0,
  ISAAC_LUA_V60_CHECK_EDX = 1,
  ISAAC_LUA_V60_TYPE_INDEX = 0x01u,
  ISAAC_LUA_V60_OBJECT_FIELD_OFF = 0x04u,
  ISAAC_LUA_V60_KEY = 0x00c82a16u,
  ISAAC_LUA_V60_TOUSERDATA_INDEX_U32 = 0xfff0b9d7u,
  ISAAC_LUA_V60_FN_OFF = 0x00u,
  ISAAC_LUA_V60_IAT_LUA_TYPE = 0x00b18400u,
  ISAAC_LUA_V60_IAT_LUA_TOUSERDATA = 0x00b183b0u,
  ISAAC_LUA_V60_RETURN_VALUE = 0
};

enum {
  ISAAC_LUA_V60_INSTALL_VA = 0x00895570u,
  ISAAC_LUA_V60_INSTALL_LITERAL_VA = 0x00895583u,
  ISAAC_LUA_V60_INSTALL_REAL_FN_VA = 0x0092e300u,
  ISAAC_LUA_V60_INSTALL_NAME_VA = 0x00b74bd0u,
  ISAAC_LUA_V60_INSTALL_CALLER_VA = 0x0086dac9u
};

/* FULL-WORD lua_type(L,1) gate (`test eax,eax` @0x8b97e4): obj =
 * (type != 0) ? check_field : 0. Never masked (0x100 -> 1). */
uint32_t isaac_lua_engine_v60_object_resolve(uint32_t type_result,
                                             uint32_t check_field);

/* v60 no-arg getters. No int_word / arg0 / checkinteger exports — this
 * body is a ZERO-ARG wrapper (call eax @0x8b9818 has NO pushed args). */
uint32_t isaac_lua_engine_v60_va(void);
uint32_t isaac_lua_engine_v60_ret_va(void);
uint32_t isaac_lua_engine_v60_body_bytes(void);
int32_t isaac_lua_engine_v60_insn_count(void);
int32_t isaac_lua_engine_v60_check_flags(void);
int32_t isaac_lua_engine_v60_check_edx(void);
uint32_t isaac_lua_engine_v60_key(void);
uint32_t isaac_lua_engine_v60_object_field_off(void);
uint32_t isaac_lua_engine_v60_type_index(void);
uint32_t isaac_lua_engine_v60_touserdata_index(void);
uint32_t isaac_lua_engine_v60_fn_off(void);
uint32_t isaac_lua_engine_v60_iat_lua_type(void);
uint32_t isaac_lua_engine_v60_iat_lua_touserdata(void);
int32_t isaac_lua_engine_v60_return_value(void);
uint32_t isaac_lua_engine_v60_install_va(void);
uint32_t isaac_lua_engine_v60_install_literal_va(void);
uint32_t isaac_lua_engine_v60_install_real_fn_va(void);
uint32_t isaac_lua_engine_v60_install_name_va(void);
uint32_t isaac_lua_engine_v60_install_caller_va(void);

/* ---------------------------------------------------------------------------
 * ABI v61 — wrapper 0x8b9820 "IsPlaying" (the THIRD body of the
 * 0x8b9760..0x8b9e80 band; v60 NOTES next-frontier: "0x8b9820 (48
 * insns, lit=1 @0x8955e3 — next installer 0x8955d0 area per class-reg
 * run @0x86daeb)"). Exactly one 32-bit LE literal @0x8955e3 (the dword
 * of `push 0x8b9820` @0x8955e2 inside the IMMEDIATE-held ret-8
 * installer 0x8955d0); zero E8 callers. One E8 caller of the installer
 * @0x86daeb (class-reg run 0x86da80, pushed 0x92e560 + 0xb70584 DEAD).
 * section-notes/lua-v61-8b9820/NOTES.md.
 *
 * PE (fresh capstone TRUE body):
 * 0x8b9820..0x8b98a0, 48 insns, body 0x80 (0x8b98a0 - 0x8b9820). Frame:
 * `push ebp; mov ebp,esp; and esp,0xfffffff8; sub esp,8; push esi; push
 * edi` — ALIGNED-ebp no-ebx (v59-shaped; v60's SIMPLE ebp is NOT this
 * body). L = edi = [ebp+8]. obj1 lives in the [esp+0xc] SPILL SLOT
 * (mem-stores 2, both @[esp+0xc]).
 *   obj1 = lua_type(L,1) FULL-WORD gate @0x8b983a -> 0x85c590 (flags 0,
 *     KEY 0xc82a16, edx 1) @0x8b9852 -> [eax+4] @0x8b985a -> [esp+0xc].
 *   ud = touserdata(L, 0xfff0b9d7) @0xb183b0 @0x8b9867 -> esi (NO add
 *     esp,8 — the 2 arg dwords stay pushed, the v56/v57/v59 lesson);
 *     arg0 = int2 = luaL_checkinteger(L,2) @0xb183f4 @0x8b9872 (push 2;
 *     push edi) -> eax.
 *   ESP-TRACKING: real_fn = [esi] (ud[0], FN_OFF 0) loaded BEFORE
 *     cleanup @0x8b9878, ONE fused add esp,0x10 @0x8b987a, THEN obj1 =
 *     [esp+0xc] @0x8b987d AFTER the restore (write level == read level
 *     -> same [ebp-4] slot; contrast v59 read-before-cleanup
 *     @[esp+0x1c]); `push eax` @0x8b9881 = int2 FULL WORD; `call edx`
 *     @0x8b9882 — real_fn(obj1, int2).
 *   BYTE-GATED RETURN: xor ecx,ecx; test al,al @0x8b9886; setne cl
 *     @0x8b9888 ((eax & 0xff) != 0); push ecx; push edi (L);
 *     lua_pushboolean(L, res) @0xb183ec @0x8b988d; add esp,8; mov
 *     eax,1 @0x8b9896 -> ret 1 Lua value; ret @0x8b98a0.
 *
 * ONE int arg (checkinteger idx 2 FULL WORD) + ONE byte-gated bool
 * return (the family's first pushboolean law in this band — expressed
 * as `(result & 0xffu) != 0` on a uint32_t, NO uint8_t scalar). Same
 * key 0xc82a16 band as v57..v60.
 *
 * Install site (reachability; recorded as INSTALL SITE, not a 29-row
 * table row): 0x8955d0 (TRUE 33 insns, ret 8 @0x895626, cleanup 0x38)
 * — IMMEDIATE-held SINGLE shape (the v60 0x895570 variant): `push ebx;
 * push esi; mov ebx,ecx; push edi` (receiver this carries state: edi =
 * [ebx] = L); newuserdata(L,4) @0xb1839c; mov [eax],0x92e560 @0x8955e8
 * (REAL_FN immediate); pushcclosure(L, wrapper imm 0x8b9820, nups=1)
 * @0xb183fc; absindex(-3) @0xb18418; push 0xb70584 @0x8955fd (NAME
 * immediate); pushstring @0xb18414; rotate(-2,1) @0xb1840c; rawset
 * @0xb18408; cleanup 0x38; mov eax,ebx; ret 8. ONE E8 caller @0x86daeb
 * (pushed 0x92e560 + 0xb70584 are DEAD — immediates authoritative).
 * Same wrapper body, ONE (name, real_fn) pair: "IsPlaying" 0xb70584 /
 * 0x92e560.
 * ----------------------------------------------------------------------- */
enum {
  ISAAC_LUA_V61_VA = 0x008b9820u,
  ISAAC_LUA_V61_RET_VA = 0x008b98a0u,
  ISAAC_LUA_V61_INSNS = 48, /* capstone TRUE body, ret inclusive */
  ISAAC_LUA_V61_CHECK_FLAGS = 0,
  ISAAC_LUA_V61_CHECK_EDX = 1,
  ISAAC_LUA_V61_TYPE_INDEX = 0x01u,
  ISAAC_LUA_V61_OBJECT_FIELD_OFF = 0x04u,
  ISAAC_LUA_V61_KEY = 0x00c82a16u,
  ISAAC_LUA_V61_TOUSERDATA_INDEX_U32 = 0xfff0b9d7u,
  ISAAC_LUA_V61_FN_OFF = 0x00u,
  ISAAC_LUA_V61_ARG0_CHECKINTEGER_INDEX_U32 = 0x02u,
  ISAAC_LUA_V61_IAT_LUA_TYPE = 0x00b18400u,
  ISAAC_LUA_V61_IAT_LUA_TOUSERDATA = 0x00b183b0u,
  ISAAC_LUA_V61_IAT_LUA_CHECKINTEGER = 0x00b183f4u,
  ISAAC_LUA_V61_IAT_LUA_PUSHBOOLEAN = 0x00b183ecu,
  ISAAC_LUA_V61_RETURN_VALUE = 1
};

enum {
  ISAAC_LUA_V61_INSTALL_VA = 0x008955d0u,
  ISAAC_LUA_V61_INSTALL_LITERAL_VA = 0x008955e3u,
  ISAAC_LUA_V61_INSTALL_REAL_FN_VA = 0x0092e560u,
  ISAAC_LUA_V61_INSTALL_NAME_VA = 0x00b70584u,
  ISAAC_LUA_V61_INSTALL_CALLER_VA = 0x0086daebu
};

/* FULL-WORD lua_type(L,1) gate (`test eax,eax` @0x8b983a): obj =
 * (type != 0) ? check_field : 0. Never masked (0x100 -> 1). */
uint32_t isaac_lua_engine_v61_object_resolve(uint32_t type_result,
                                             uint32_t check_field);
/* checkinteger FULL WORD passthrough (`push eax` @0x8b9881): 0x100 /
 * 0x10000 / 0xffffffff all survive. Never masked. */
uint32_t isaac_lua_engine_v61_int_word(uint32_t checkint_result);
/* BYTE-GATED return (`test al,al; setne cl` @0x8b9886/@0x8b9888 — the
 * real_fn's cdecl bool in eax, low byte tested): (result & 0xff) != 0
 * -> 1 (lua_pushboolean). uint32_t in/out — NO uint8_t scalar. */
uint32_t isaac_lua_engine_v61_return_gate(uint32_t real_fn_result);

/* v61 no-arg getters. */
uint32_t isaac_lua_engine_v61_va(void);
uint32_t isaac_lua_engine_v61_ret_va(void);
uint32_t isaac_lua_engine_v61_body_bytes(void);
int32_t isaac_lua_engine_v61_insn_count(void);
int32_t isaac_lua_engine_v61_check_flags(void);
int32_t isaac_lua_engine_v61_check_edx(void);
uint32_t isaac_lua_engine_v61_key(void);
uint32_t isaac_lua_engine_v61_object_field_off(void);
uint32_t isaac_lua_engine_v61_type_index(void);
uint32_t isaac_lua_engine_v61_touserdata_index(void);
uint32_t isaac_lua_engine_v61_fn_off(void);
uint32_t isaac_lua_engine_v61_arg0_checkinteger_index(void);
uint32_t isaac_lua_engine_v61_iat_lua_type(void);
uint32_t isaac_lua_engine_v61_iat_lua_touserdata(void);
uint32_t isaac_lua_engine_v61_iat_lua_checkinteger(void);
uint32_t isaac_lua_engine_v61_iat_lua_pushboolean(void);
int32_t isaac_lua_engine_v61_return_value(void);
uint32_t isaac_lua_engine_v61_install_va(void);
uint32_t isaac_lua_engine_v61_install_literal_va(void);
uint32_t isaac_lua_engine_v61_install_real_fn_va(void);
uint32_t isaac_lua_engine_v61_install_name_va(void);
uint32_t isaac_lua_engine_v61_install_caller_va(void);

/* ---------------------------------------------------------------------------
 * ABI v62 — wrapper 0x8b98b0 "SetAmbientSound" (the FOURTH body of the
 * 0x8b9760..0x8b9e80 band; v61 NOTES next-frontier: "0x8b98b0 (54
 * insns, lit=1 @0x895643 — installer 0x895630 per the class-reg run
 * @0x86dafc)"). Exactly one 32-bit LE literal @0x895643 (the dword of
 * `push 0x8b98b0` @0x895642 inside the IMMEDIATE-held ret-8 installer
 * 0x895630); zero E8 callers. One E8 caller of the installer @0x86dafc
 * (class-reg run 0x86da80, pushed 0x92e620 + 0xb74bb4 DEAD).
 * section-notes/lua-v62-8b98b0/NOTES.md.
 *
 * PE (fresh capstone TRUE body):
 * 0x8b98b0..0x8b9948, 54 insns, body 0x98 (0x8b9948 - 0x8b98b0). Frame:
 * `push ebp; mov ebp,esp; sub esp,0x14; push esi; push edi` — SIMPLE
 * ebp (v60-shaped; v61's ALIGNED-ebp no-ebx is NOT this body). L =
 * edi = [ebp+8]. obj1 lives in the [ebp-4] SPILL SLOT (mem-stores 2,
 * both @[ebp-4]; ebp-relative -> esp-shift immune).
 *   obj1 = lua_type(L,1) FULL-WORD gate @0x8b98c7 -> 0x85c590 (flags 0,
 *     KEY 0xc82a16, edx 1) @0x8b98de -> [eax+4] @0x8b98e6 -> [ebp-4].
 *   ud = touserdata(L, 0xfff0b9d7) @0xb183b0 @0x8b98f2 -> esi (NO add
 *     esp,8 — the 2 arg dwords stay pushed, the v56/v57/v59 lesson);
 *     arg2 = num4 = luaL_checknumber(L,4) @0xb18324 @0x8b98fd -> x87 ->
 *     `fstp dword ptr [ebp-0x10]` @0x8b9905; arg1 = num3 =
 *     luaL_checknumber(L,3) @0xb18324 @0x8b9909 -> `fstp dword ptr
 *     [ebp-8]` @0x8b9915; arg0 = int2 = luaL_checkinteger(L,2)
 *     @0xb183f4 @0x8b991b -> eax. SIX dwords pushed; ONE fused
 *     add esp,0x18 @0x8b9926.
 *   ESP-TRACKING (the v62 lesson): AFTER the restored esp, movss
 *     [esp+4] @0x8b992c (num4) and movss [esp] @0x8b9937 (num3) write
 *     into the DEAD SAVED-REGISTER slots ([esp+4]=[ebp-0x18] saved esi,
 *     [esp]=[ebp-0x1c] saved edi — safe, the register copies stay
 *     live); `push eax` @0x8b993c = int2 FULL WORD; real_fn = [esi]
 *     (ud[0], FN_OFF 0) @0x8b993d AFTER all pushes (register-held esi);
 *     `call eax` @0x8b993f. Final stack: [esp+0]=int2, [esp+4]=B(num3),
 *     [esp+8]=A(num4), [esp+0xc]=junk (real_fn ret 0xc consumes 3
 *     dwords). this = obj1 in ECX (`mov ecx,[ebp-4]` @0x8b9929 — after
 *     cleanup, ebp-relative).
 *   xor eax,eax @0x8b9942 -> ret 0 Lua values (NO byte gate — this body
 *     has no pushboolean; v61's byte-gated body is NOT this body); ret
 *     @0x8b9948.
 *
 * THREE-ARG wrapper: arg0 = int2 (checkinteger FULL WORD), arg1 = num3
 * (checknumber idx 3), arg2 = num4 (checknumber idx 4) — the FIRST
 * float-lane (checknumber) wrapper of the band. No byte-gated law
 * (unconditional xor eax,eax). Same key 0xc82a16 band as v57B..v61.
 *
 * Install site (reachability; recorded as INSTALL SITE, not a 29-row
 * table row): 0x895630 (TRUE 33 insns, ret 8 @0x895686, cleanup 0x38)
 * — IMMEDIATE-held SINGLE shape (the v60 0x895570 / v61 0x8955d0
 * variant): `push ebx; push esi; mov ebx,ecx; push edi` (receiver this
 * carries state: edi = [ebx] = L); newuserdata(L,4) @0xb1839c;
 * mov [eax],0x92e620 @0x895648 (REAL_FN immediate);
 * pushcclosure(L, wrapper imm 0x8b98b0, nups=1) @0xb183fc; absindex(-3)
 * @0xb18418; push 0xb74bb4 @0x89565d (NAME immediate); pushstring
 * @0xb18414; rotate(-2,1) @0xb1840c; rawset @0xb18408; cleanup 0x38;
 * mov eax,ebx; ret 8. ONE E8 caller @0x86dafc (pushed 0x92e620 +
 * 0xb74bb4 are DEAD — immediates authoritative). Same wrapper body, ONE
 * (name, real_fn) pair: "SetAmbientSound" 0xb74bb4 / 0x92e620.
 * ----------------------------------------------------------------------- */
enum {
  ISAAC_LUA_V62_VA = 0x008b98b0u,
  ISAAC_LUA_V62_RET_VA = 0x008b9948u,
  ISAAC_LUA_V62_INSNS = 54, /* capstone TRUE body, ret inclusive */
  ISAAC_LUA_V62_CHECK_FLAGS = 0,
  ISAAC_LUA_V62_CHECK_EDX = 1,
  ISAAC_LUA_V62_TYPE_INDEX = 0x01u,
  ISAAC_LUA_V62_OBJECT_FIELD_OFF = 0x04u,
  ISAAC_LUA_V62_KEY = 0x00c82a16u,
  ISAAC_LUA_V62_TOUSERDATA_INDEX_U32 = 0xfff0b9d7u,
  ISAAC_LUA_V62_FN_OFF = 0x00u,
  ISAAC_LUA_V62_ARG0_CHECKINTEGER_INDEX_U32 = 0x02u,
  ISAAC_LUA_V62_ARG1_CHECKNUMBER_INDEX_U32 = 0x03u,
  ISAAC_LUA_V62_ARG2_CHECKNUMBER_INDEX_U32 = 0x04u,
  ISAAC_LUA_V62_IAT_LUA_TYPE = 0x00b18400u,
  ISAAC_LUA_V62_IAT_LUA_TOUSERDATA = 0x00b183b0u,
  ISAAC_LUA_V62_IAT_LUA_CHECKINTEGER = 0x00b183f4u,
  ISAAC_LUA_V62_IAT_LUA_CHECKNUMBER = 0x00b18324u,
  ISAAC_LUA_V62_RETURN_VALUE = 0
};

enum {
  ISAAC_LUA_V62_INSTALL_VA = 0x00895630u,
  ISAAC_LUA_V62_INSTALL_LITERAL_VA = 0x00895643u,
  ISAAC_LUA_V62_INSTALL_REAL_FN_VA = 0x0092e620u,
  ISAAC_LUA_V62_INSTALL_NAME_VA = 0x00b74bb4u,
  ISAAC_LUA_V62_INSTALL_CALLER_VA = 0x0086dafcu
};

/* FULL-WORD lua_type(L,1) gate (`test eax,eax` @0x8b98c7): obj =
 * (type != 0) ? check_field : 0. Never masked (0x100 -> 1). */
uint32_t isaac_lua_engine_v62_object_resolve(uint32_t type_result,
                                             uint32_t check_field);
/* checkinteger FULL WORD passthrough (`push eax` @0x8b993c): 0x100 /
 * 0x10000 / 0xffffffff all survive. Never masked. */
uint32_t isaac_lua_engine_v62_int_word(uint32_t checkint_result);

/* v62 no-arg getters. No return_gate / pushboolean exports — this body
 * returns 0 Lua values unconditionally (`xor eax,eax` @0x8b9942; NO
 * byte-gated lane). arg1/arg2 are the checknumber float lanes (idx 3/4,
 * the band's first). */
uint32_t isaac_lua_engine_v62_va(void);
uint32_t isaac_lua_engine_v62_ret_va(void);
uint32_t isaac_lua_engine_v62_body_bytes(void);
int32_t isaac_lua_engine_v62_insn_count(void);
int32_t isaac_lua_engine_v62_check_flags(void);
int32_t isaac_lua_engine_v62_check_edx(void);
uint32_t isaac_lua_engine_v62_key(void);
uint32_t isaac_lua_engine_v62_object_field_off(void);
uint32_t isaac_lua_engine_v62_type_index(void);
uint32_t isaac_lua_engine_v62_touserdata_index(void);
uint32_t isaac_lua_engine_v62_fn_off(void);
uint32_t isaac_lua_engine_v62_arg0_checkinteger_index(void);
uint32_t isaac_lua_engine_v62_arg1_checknumber_index(void);
uint32_t isaac_lua_engine_v62_arg2_checknumber_index(void);
uint32_t isaac_lua_engine_v62_iat_lua_type(void);
uint32_t isaac_lua_engine_v62_iat_lua_touserdata(void);
uint32_t isaac_lua_engine_v62_iat_lua_checkinteger(void);
uint32_t isaac_lua_engine_v62_iat_lua_checknumber(void);
int32_t isaac_lua_engine_v62_return_value(void);
uint32_t isaac_lua_engine_v62_install_va(void);
uint32_t isaac_lua_engine_v62_install_literal_va(void);
uint32_t isaac_lua_engine_v62_install_real_fn_va(void);
uint32_t isaac_lua_engine_v62_install_name_va(void);
uint32_t isaac_lua_engine_v62_install_caller_va(void);

/* ---------------------------------------------------------------------------
 * ABI v63 — Lua-registered closure BODY laws 0x85e370
 * "GetNumEncounteredBosses" + 0x85e380 "GetScreenShakeCountdown"
 * (PlayerHUD band 0x85e330..0x85e38f; wave-24 F10 closed-ledger lease;
 * playerhud-v39-getters census DECLINED them as 0-caller accessors and
 * recorded them as lua-family BODY candidates — this unit lands them).
 * section-notes/lua-v62-getters/NOTES.md.
 *
 * PE (fresh capstone TRUE bodies):
 * 0x85e370..0x85e37f, 4 insns, body 0xf (0x85e37f - 0x85e370), thiscall:
 *   mov eax,[ecx+0x269d8]; sub eax,[ecx+0x269d4]; sar eax,3; ret.
 *   SAR = SIGNED arithmetic shift (floor /8): (0,9) -> 0xfffffffe (-2),
 *   NOT C-truncating division (-1); 0x80000000 -> 0xf0000000, NOT logical
 *   shr (0x10000000). v43 at_size precedent.
 * 0x85e380..0x85e386, 2 insns, body 0x6 (0x85e386 - 0x85e380), thiscall:
 *   lea eax,[ecx+0x26508]; ret — the lea identity (u32 wrap add).
 * Both bodies: 0 E8, 0 indirect, 0 mem-stores, ret 0 getters; NO byte
 * gates (the closure trampolines consume the returns host-side).
 * Reachability: ZERO rel32 callers image-wide (fresh whole-.text scan;
 * 0x85e360 cross-check = its known 6 callers), ZERO data-pointer entries,
 * ZERO exports, ZERO identify-zhl exact matches (all 12 pins) — LIVE only
 * as Lua-registered closures: `push 0x85e370` @0x86d81e (literal dword
 * @0x86d81f; name push 0xb74950 @0x86d823; call 0x894bc0 @0x86d82a);
 * `push 0x85e380` @0x86d8ab (literal dword @0x86d8ac; name push 0xb74a04
 * @0x86d8b0; call 0x894e00 @0x86d8b7).
 * Names (raw .rdata, verified): 0xb74950 = "GetNumEncounteredBosses",
 * 0xb74a04 = "GetScreenShakeCountdown".
 * Installer bodies stay HOST (install sites, NOT 29-row table rows):
 *   0x894bc0 = IMMEDIATE-held SINGLE (ret 8 @0x894c16, cleanup 0x38, ONE
 *     rawset chain @ -3); fill `mov dword ptr [eax],0x85e370` @0x894bd8
 *     (imm @0x894bdb); closure trampoline 0x8b8e80; name imm @0x894bed.
 *   0x894e00 = DUAL_IMM ebp-frame variant (cleanups 0x40 + 0x24, chains
 *     pushvalue(-1)+absindex(-5) then absindex(-3), rawset via edi);
 *     fill `mov dword ptr [eax],0x85e380` @0x894e23 (imm @0x894e26);
 *     closure trampoline 0x8b8f70; name imm @0x894e41.
 * Trampolines (HOST closure entries): 0x8b8e80 calls ud[0] real_fn
 * thiscall then pushes the FULL DWORD return via the v55 PUSH_I32_SEXT
 * pusher 0x85bfd0 (Lua integer; NO byte gate); 0x8b8f70 instead
 * DOWNCONVERTS the i32 return with movd/cvtdq2pd/movsd (Lua number f64).
 * ----------------------------------------------------------------------- */
enum {
  ISAAC_LUA_V63_NUM_BOSSES_VA = 0x0085e370u,
  ISAAC_LUA_V63_NUM_BOSSES_RET_VA = 0x0085e37fu,
  ISAAC_LUA_V63_NUM_BOSSES_INSNS = 4, /* capstone TRUE body, ret inclusive */
  ISAAC_LUA_V63_NUM_BOSSES_HEAD_OFF = 0x269d8u,
  ISAAC_LUA_V63_NUM_BOSSES_BASE_OFF = 0x269d4u,
  ISAAC_LUA_V63_NUM_BOSSES_STRIDE_SHIFT = 3 /* sar imm; element stride 8 */
};

enum {
  ISAAC_LUA_V63_NUM_BOSSES_INSTALL_HELPER_VA = 0x00894bc0u,
  ISAAC_LUA_V63_NUM_BOSSES_INSTALL_FILL_VA = 0x00894bdbu,
  ISAAC_LUA_V63_NUM_BOSSES_INSTALL_LITERAL_VA = 0x0086d81fu,
  ISAAC_LUA_V63_NUM_BOSSES_INSTALL_REAL_FN_VA = 0x0085e370u,
  ISAAC_LUA_V63_NUM_BOSSES_INSTALL_NAME_VA = 0x00b74950u,
  ISAAC_LUA_V63_NUM_BOSSES_INSTALL_TRAMPOLINE_VA = 0x008b8e80u,
  ISAAC_LUA_V63_NUM_BOSSES_INSTALL_CALLER_VA = 0x0086d81eu,
  ISAAC_LUA_V63_NUM_BOSSES_INSTALL_CALL_VA = 0x0086d82au
};

enum {
  ISAAC_LUA_V63_SHAKE_COUNTDOWN_VA = 0x0085e380u,
  ISAAC_LUA_V63_SHAKE_COUNTDOWN_RET_VA = 0x0085e386u,
  ISAAC_LUA_V63_SHAKE_COUNTDOWN_INSNS = 2, /* capstone TRUE body, ret incl. */
  ISAAC_LUA_V63_SHAKE_COUNTDOWN_FIELD_OFF = 0x26508u
};

enum {
  ISAAC_LUA_V63_SHAKE_COUNTDOWN_INSTALL_HELPER_VA = 0x00894e00u,
  ISAAC_LUA_V63_SHAKE_COUNTDOWN_INSTALL_FILL_VA = 0x00894e26u,
  ISAAC_LUA_V63_SHAKE_COUNTDOWN_INSTALL_LITERAL_VA = 0x0086d8acu,
  ISAAC_LUA_V63_SHAKE_COUNTDOWN_INSTALL_REAL_FN_VA = 0x0085e380u,
  ISAAC_LUA_V63_SHAKE_COUNTDOWN_INSTALL_NAME_VA = 0x00b74a04u,
  ISAAC_LUA_V63_SHAKE_COUNTDOWN_INSTALL_TRAMPOLINE_VA = 0x008b8f70u,
  ISAAC_LUA_V63_SHAKE_COUNTDOWN_INSTALL_CALLER_VA = 0x0086d8abu,
  ISAAC_LUA_V63_SHAKE_COUNTDOWN_INSTALL_CALL_VA = 0x0086d8b7u
};

/* PE `sub eax,[ecx+0x269d4]; sar eax,3` @0x85e376/@0x85e37c — 32-bit wrap
 * delta then SIGNED arithmetic shift (floor /8): (0,9) -> 0xfffffffe (-2),
 * NOT C-truncation -1; 0x80000000 -> 0xf0000000, NOT shr_u 0x10000000.
 * uint32_t in/out — NO uint8_t scalar. */
uint32_t isaac_lua_engine_v63_num_bosses_count(uint32_t head_field,
                                               uint32_t base_field);
/* PE `lea eax,[ecx+0x26508]` @0x85e380 — this + FIELD_OFF, u32 wrap. */
uint32_t isaac_lua_engine_v63_shake_countdown_ptr(uint32_t this_ptr);

/* v63 no-arg getters. */
uint32_t isaac_lua_engine_v63_num_bosses_va(void);
uint32_t isaac_lua_engine_v63_num_bosses_ret_va(void);
uint32_t isaac_lua_engine_v63_num_bosses_body_bytes(void);
int32_t isaac_lua_engine_v63_num_bosses_insn_count(void);
uint32_t isaac_lua_engine_v63_num_bosses_head_off(void);
uint32_t isaac_lua_engine_v63_num_bosses_base_off(void);
int32_t isaac_lua_engine_v63_num_bosses_stride_shift(void);
uint32_t isaac_lua_engine_v63_num_bosses_install_helper_va(void);
uint32_t isaac_lua_engine_v63_num_bosses_install_fill_va(void);
uint32_t isaac_lua_engine_v63_num_bosses_install_literal_va(void);
uint32_t isaac_lua_engine_v63_num_bosses_install_real_fn_va(void);
uint32_t isaac_lua_engine_v63_num_bosses_install_name_va(void);
uint32_t isaac_lua_engine_v63_num_bosses_install_trampoline_va(void);
uint32_t isaac_lua_engine_v63_num_bosses_install_caller_va(void);
uint32_t isaac_lua_engine_v63_num_bosses_install_call_va(void);
uint32_t isaac_lua_engine_v63_shake_countdown_va(void);
uint32_t isaac_lua_engine_v63_shake_countdown_ret_va(void);
uint32_t isaac_lua_engine_v63_shake_countdown_body_bytes(void);
int32_t isaac_lua_engine_v63_shake_countdown_insn_count(void);
uint32_t isaac_lua_engine_v63_shake_countdown_field_off(void);
uint32_t isaac_lua_engine_v63_shake_countdown_install_helper_va(void);
uint32_t isaac_lua_engine_v63_shake_countdown_install_fill_va(void);
uint32_t isaac_lua_engine_v63_shake_countdown_install_literal_va(void);
uint32_t isaac_lua_engine_v63_shake_countdown_install_real_fn_va(void);
uint32_t isaac_lua_engine_v63_shake_countdown_install_name_va(void);
uint32_t isaac_lua_engine_v63_shake_countdown_install_trampoline_va(void);
uint32_t isaac_lua_engine_v63_shake_countdown_install_caller_va(void);
uint32_t isaac_lua_engine_v63_shake_countdown_install_call_va(void);

/* ---------------------------------------------------------------------------
 * ABI v64 — Lua-registered closure wrapper 0x8b9950 "GetAmbientSoundVolume"
 * (the FIFTH body of the 0x8b9760..0x8b9e80 band; lua-v62-getters
 * NEXT-FRONTIER). section-notes/lua-v64-8b9950/NOTES.md.
 *
 * PE (fresh capstone TRUE body 0x8b9950..0x8b99e3, 50 insns, body 0x93 =
 * RET_VA - VA): ALIGNED ebp frame (`push ebp; mov ebp,esp; and
 * esp,0xfffffff8; sub esp,8; push esi; push edi` — the v61-shaped
 * frame, NOT v62's SIMPLE ebp). L = edi = [ebp+8]. obj1 resolve:
 * lua_type(L,1) FULL-WORD `test eax,eax` @0x8b996a -> 0x85c590 (flags
 * 0, KEY 0xc82a16, edx 1) @0x8b9982 -> [eax+4] (OBJ_FIELD_OFF 4) ->
 * obj1 spill at [esp+8] (= [ebp-0xc], esp-relative constant-disp).
 * ud = touserdata(L, 0xfff0b9d7) @0xb183b0 -> esi (NO add esp,8 — the
 * 2 arg dwords stay pushed); arg0 = int2 = checkinteger(L,2)
 * @0xb183f4 -> eax. ESP-TRACKING (v62 lesson): `mov ecx,[esp+0x18]`
 * @0x8b99a8 loads obj1 (this) BEFORE the fused `add esp,0x10`
 * @0x8b99ac; `push eax` @0x8b99af = int2 FULL WORD; real_fn = [esi]
 * (ud[0], FN_OFF 0) @0x8b99b0 -> temp `mov [esp+0x10],eax` @0x8b99b2
 * (dead [ebp-8] slot); `call dword ptr [esp+0x10]` @0x8b99b6. Final
 * stack: [esp+0]=int2 + 3 junk dwords; real_fn 0x92e6e0 ret 4
 * consumes int2; this = obj1 in ECX.
 * RETURN LANE (the v64 lesson — the band's first pushnumber body):
 * real_fn returns double in x87 ST0; `fstp dword ptr [esp+0xc]`
 * @0x8b99ba stores ONLY the low dword into the dead obj1 spill slot —
 * the return is TRUNCATED to float32 (RN); movss @0x8b99be; sub
 * esp,8 @0x8b99c4; `cvtps2pd` @0x8b99c7 = EXACT f32->f64 widen (the
 * v55 pusher 0x85c05c cvtss2sd law precedent); movsd [esp] @0x8b99ca;
 * push edi; `call [0xb183f0]` @0x8b99d0 = lua_pushnumber (IAT-
 * verified); add esp,0xc. `mov eax,1` @0x8b99d9 -> ret **1** Lua
 * value. NO byte gate (no pushboolean — v61's byte-gated body is NOT
 * this body).
 * Reachability: ZERO rel32 callers image-wide (fresh whole-.text scan;
 * the only intra-body jump is the nil-path jmp @0x8b9972), ONE literal
 * `push 0x8b9950` @0x8956a2 (imm dword @0x8956a3), ZERO data-pointer
 * entries, ZERO exports, ZERO identify-zhl matches (all 12 pins) —
 * LIVE only as a Lua-registered closure: installer 0x895690
 * (IMMEDIATE-held SINGLE, ret 8 @0x8956e6, cleanup 0x38, ONE rawset
 * chain @ -3; real_fn fill `mov [eax],0x92e6e0` @0x8956a8 imm
 * @0x8956aa; name imm 0xb74c64 @0x8956bd; caller @0x86db0d's pushed
 * dwords 0x92e6e0 + 0xb74c64 DEAD — immediates authoritative).
 * Name (raw .rdata, verified): 0xb74c64 = "GetAmbientSoundVolume".
 * real_fn 0x92e6e0 (HOST): `double __thiscall (Entity*, int idx)` MSVC
 * member fn — idx<0 or idx>=count -> `fldz; ret 4`; valid path calls
 * 0x92e560 (the v61-era real_fn) + 0xa112c0 log; ret 4 returns the
 * double in ST0. Installer stays HOST (install site, NOT a 29-row
 * table row).
 * ----------------------------------------------------------------------- */
enum {
  ISAAC_LUA_V64_VA = 0x008b9950u,
  ISAAC_LUA_V64_RET_VA = 0x008b99e3u,
  ISAAC_LUA_V64_INSNS = 50, /* capstone TRUE body, ret inclusive */
  ISAAC_LUA_V64_CHECK_FLAGS = 0,
  ISAAC_LUA_V64_CHECK_EDX = 1,
  ISAAC_LUA_V64_TYPE_INDEX = 0x01u,
  ISAAC_LUA_V64_OBJECT_FIELD_OFF = 0x04u,
  ISAAC_LUA_V64_KEY = 0x00c82a16u,
  ISAAC_LUA_V64_TOUSERDATA_INDEX_U32 = 0xfff0b9d7u,
  ISAAC_LUA_V64_FN_OFF = 0x00u,
  ISAAC_LUA_V64_ARG0_CHECKINTEGER_INDEX_U32 = 0x02u,
  ISAAC_LUA_V64_IAT_LUA_TYPE = 0x00b18400u,
  ISAAC_LUA_V64_IAT_LUA_TOUSERDATA = 0x00b183b0u,
  ISAAC_LUA_V64_IAT_LUA_CHECKINTEGER = 0x00b183f4u,
  ISAAC_LUA_V64_IAT_LUA_PUSHNUMBER = 0x00b183f0u,
  ISAAC_LUA_V64_RETURN_VALUE = 1
};

enum {
  ISAAC_LUA_V64_INSTALL_VA = 0x00895690u,
  ISAAC_LUA_V64_INSTALL_LITERAL_VA = 0x008956a3u,
  ISAAC_LUA_V64_INSTALL_REAL_FN_VA = 0x0092e6e0u,
  ISAAC_LUA_V64_INSTALL_NAME_VA = 0x00b74c64u,
  ISAAC_LUA_V64_INSTALL_CALLER_VA = 0x0086db0du
};

/* FULL-WORD lua_type(L,1) gate (`test eax,eax` @0x8b996a): obj =
 * (type != 0) ? check_field : 0. Never masked (0x100 -> 1). */
uint32_t isaac_lua_engine_v64_object_resolve(uint32_t type_result,
                                             uint32_t check_field);
/* checkinteger FULL WORD passthrough (`push eax` @0x8b99af): 0x100 /
 * 0x10000 / 0xffffffff all survive. Never masked. */
uint32_t isaac_lua_engine_v64_int_word(uint32_t checkint_result);
/* `fstp dword ptr [esp+0xc]` @0x8b99ba — the x87 ST0 double return is
 * truncated to float32 (round-to-nearest-even), returned as the f32
 * bits. The subsequent cvtps2pd @0x8b99c7 is the EXACT f32->f64 widen
 * (v55 pusher 0x85c05c cvtss2sd law precedent); the value pushed by
 * lua_pushnumber is (double)(float)return. */
uint32_t isaac_lua_engine_v64_f32_trunc_bits(uint32_t ret_hi,
                                             uint32_t ret_lo);

/* v64 no-arg getters. return_value = 1 (mov eax,1 @0x8b99d9 — the
 * pushnumber lane; NO byte-gated return law, v61's pushboolean body is
 * NOT this body). */
uint32_t isaac_lua_engine_v64_va(void);
uint32_t isaac_lua_engine_v64_ret_va(void);
uint32_t isaac_lua_engine_v64_body_bytes(void);
int32_t isaac_lua_engine_v64_insn_count(void);
int32_t isaac_lua_engine_v64_check_flags(void);
int32_t isaac_lua_engine_v64_check_edx(void);
uint32_t isaac_lua_engine_v64_key(void);
uint32_t isaac_lua_engine_v64_object_field_off(void);
uint32_t isaac_lua_engine_v64_type_index(void);
uint32_t isaac_lua_engine_v64_touserdata_index(void);
uint32_t isaac_lua_engine_v64_fn_off(void);
uint32_t isaac_lua_engine_v64_arg0_checkinteger_index(void);
uint32_t isaac_lua_engine_v64_iat_lua_type(void);
uint32_t isaac_lua_engine_v64_iat_lua_touserdata(void);
uint32_t isaac_lua_engine_v64_iat_lua_checkinteger(void);
uint32_t isaac_lua_engine_v64_iat_lua_pushnumber(void);
int32_t isaac_lua_engine_v64_return_value(void);
uint32_t isaac_lua_engine_v64_install_va(void);
uint32_t isaac_lua_engine_v64_install_literal_va(void);
uint32_t isaac_lua_engine_v64_install_real_fn_va(void);
uint32_t isaac_lua_engine_v64_install_name_va(void);
uint32_t isaac_lua_engine_v64_install_caller_va(void);

/* ---------------------------------------------------------------------------
 * ABI v65 — wrapper 0x8b99f0 DOUBLE-literal installer ("Play" +
 * "Crossfade", MusicManager class key 0xc82a19; the v64 handoff's lit=2
 * frontier). section-notes/lua-v65-lit2/NOTES.md.
 *
 * PE (fresh capstone TRUE body): 0x8b99f0..0x8b9a71, 48 insns, body 0x81
 * = RET_VA - VA. SIMPLE ebp frame (`push ebp; mov ebp,esp; sub esp,0x10;
 * push esi; mov esi,[ebp+8]; push edi` — v60/v62-shaped); L = esi =
 * [ebp+8] (v62's edi is NOT this body); obj1 in the [ebp-4] SPILL SLOT
 * (ebp-relative, esp-shift immune).
 * lua_type(L,1) @0xb18400 @0x8b99fe, add esp,8, FULL-WORD `test
 * eax,eax` @0x8b9a07; nil -> obj1=0 @[ebp-4] + jmp @0x8b9a2c; else push
 * 0 (flags); push KEY 0xc82a19 @0x8b9a12 (MusicManager — first landed
 * wrapper of the key-0xc82a19 run; v62's 0xc82a16 is a different class);
 * edx=1; ecx=esi; call 0x85c590 @0x8b9a1e; obj=[eax+4] @0x8b9a26 ->
 * [ebp-4] @0x8b9a29. touserdata(L, 0xfff0b9d7) @0xb183b0 @0x8b9a32 ->
 * edi (mov edi,eax @0x8b9a3b BETWEEN the next call's arg pushes — NO
 * add esp,8, the v56/v57/v59 lesson); arg1 = num3 =
 * luaL_checknumber(L,3) @0xb18324 @0x8b9a3d -> x87 -> `fstp dword ptr
 * [ebp-0xc]` @0x8b9a46 (float32 lane); arg0 = int2 =
 * luaL_checkinteger(L,2) @0xb183f4 @0x8b9a49 -> eax; SIX dwords, ONE
 * fused add esp,0x14 @0x8b9a52 cleans FIVE — the SIXTH (dead first
 * touserdata arg) stays at [esp]. ESP-TRACKING (v65 lesson): the f32
 * lane round-trips through [ebp-0xc] (mov edx,[ebp-0xc] @0x8b9a4f
 * BEFORE the cleanup; re-store @0x8b9a58; movss xmm0,[ebp-0xc]
 * @0x8b9a5b; `movss [esp],xmm0` @0x8b9a60 overwrites the dead dword);
 * this = obj1 = [ebp-4] into ECX @0x8b9a55 (after cleanup,
 * ebp-relative); `push eax` @0x8b9a65 = int2 FULL WORD; real_fn = [edi]
 * (ud[0], FN_OFF 0) @0x8b9a66 AFTER all pushes (register-held edi);
 * `call eax` @0x8b9a68. Final stack: [esp+0]=int2, [esp+4]=B(f32 num3),
 * [esp+8]=junk (saved edi slot) — real_fns 0x7e1d50 / 0x7e1e70 both
 * `ret 8` consume exactly 2 dwords. xor eax,eax @0x8b9a6b -> ret 0 Lua
 * values (NO byte-gated lane — no pushboolean; v61's byte-gated body is
 * NOT this body); ret @0x8b9a71.
 *
 * DOUBLE-LITERAL installer (the unit's namesake): the SAME wrapper is
 * installed by TWO IMMEDIATE-held SINGLE ret-8 helpers, each with its
 * OWN name/real_fn pair baked as body immediates:
 *   A: installer 0x895710 (ret 8 @0x895766, body 0x56, cleanup 0x38),
 *      wrapper literal @0x895723 (push 0x8b99f0 @0x895722), real_fn
 *      0x7e1d50 (mov [eax],imm @0x895728, imm @0x89572b), name 0xb70498
 *      @0x89573d = "Play", caller @0x86db80 (pushed dwords DEAD).
 *   B: installer 0x895770 (ret 8 @0x8957c6, body 0x56, cleanup 0x38),
 *      wrapper literal @0x895783 (push 0x8b99f0 @0x895782), real_fn
 *      0x7e1e70 (mov [eax],imm @0x895788, imm @0x89578b), name 0xb74c50
 *      @0x89579d = "Crossfade", caller @0x86dba2 (pushed dwords DEAD).
 * Class: MusicManager (class-create 0x8a0740 via stub 0x8956f0
 * @0x86db6b; name push 0xb74c7c = "MusicManager"; registry key 0xc82a19
 * rawsetp REGISTRYINDEX @0x8a08ac — all 10 wrappers 0x8b99f0..0x8b9e80
 * of the run share it; 0xc82a19 is an opaque .data VA (packed 16-bit
 * table), NOT a cstr). 0 E8 callers of the wrapper; exactly two 32-bit
 * LE literals image-wide (@0x895723 + @0x895783). Real_fns are near-
 * identical MSVC member fns (track-list at this+0x31c/+0x320, magic
 * 0x2aaaaaab ÷12 bounds gate, ret 8) — HOST.
 * All gates/words uint32_t (no uint8_t scalar params).
 * ----------------------------------------------------------------------- */
enum {
  ISAAC_LUA_V65_VA = 0x008b99f0u,
  ISAAC_LUA_V65_RET_VA = 0x008b9a71u,
  ISAAC_LUA_V65_INSNS = 48, /* capstone TRUE body, ret inclusive */
  ISAAC_LUA_V65_CHECK_FLAGS = 0,
  ISAAC_LUA_V65_CHECK_EDX = 1,
  ISAAC_LUA_V65_TYPE_INDEX = 0x01u,
  ISAAC_LUA_V65_OBJECT_FIELD_OFF = 0x04u,
  ISAAC_LUA_V65_KEY = 0x00c82a19u,
  ISAAC_LUA_V65_TOUSERDATA_INDEX_U32 = 0xfff0b9d7u,
  ISAAC_LUA_V65_FN_OFF = 0x00u,
  ISAAC_LUA_V65_ARG0_CHECKINTEGER_INDEX_U32 = 0x02u,
  ISAAC_LUA_V65_ARG1_CHECKNUMBER_INDEX_U32 = 0x03u,
  ISAAC_LUA_V65_IAT_LUA_TYPE = 0x00b18400u,
  ISAAC_LUA_V65_IAT_LUA_TOUSERDATA = 0x00b183b0u,
  ISAAC_LUA_V65_IAT_LUA_CHECKINTEGER = 0x00b183f4u,
  ISAAC_LUA_V65_IAT_LUA_CHECKNUMBER = 0x00b18324u,
  ISAAC_LUA_V65_RETURN_VALUE = 0,
  ISAAC_LUA_V65_INSTALL_COUNT = 2 /* lit=2: TWO name/real_fn pairs */
};

enum {
  ISAAC_LUA_V65_INSTALL_A_VA = 0x00895710u,
  ISAAC_LUA_V65_INSTALL_A_RET_VA = 0x00895766u,
  ISAAC_LUA_V65_INSTALL_A_LITERAL_VA = 0x00895723u,
  ISAAC_LUA_V65_INSTALL_A_REAL_FN_VA = 0x007e1d50u,
  ISAAC_LUA_V65_INSTALL_A_NAME_VA = 0x00b70498u, /* "Play" */
  ISAAC_LUA_V65_INSTALL_A_CALLER_VA = 0x0086db80u,
  ISAAC_LUA_V65_INSTALL_B_VA = 0x00895770u,
  ISAAC_LUA_V65_INSTALL_B_RET_VA = 0x008957c6u,
  ISAAC_LUA_V65_INSTALL_B_LITERAL_VA = 0x00895783u,
  ISAAC_LUA_V65_INSTALL_B_REAL_FN_VA = 0x007e1e70u,
  ISAAC_LUA_V65_INSTALL_B_NAME_VA = 0x00b74c50u, /* "Crossfade" */
  ISAAC_LUA_V65_INSTALL_B_CALLER_VA = 0x0086dba2u
};

/* FULL-WORD lua_type(L,1) gate (`test eax,eax` @0x8b9a07): obj =
 * (type != 0) ? check_field : 0. Never masked (0x100 -> 1). */
uint32_t isaac_lua_engine_v65_object_resolve(uint32_t type_result,
                                             uint32_t check_field);
/* checkinteger FULL WORD passthrough (`push eax` @0x8b9a65): 0x100 /
 * 0x10000 / 0xffffffff all survive. Never masked. */
uint32_t isaac_lua_engine_v65_int_word(uint32_t checkint_result);

/* v65 no-arg getters. No return_gate / pushboolean exports — this body
 * returns 0 Lua values unconditionally (`xor eax,eax` @0x8b9a6b; NO
 * byte-gated lane). arg1 is the checknumber float lane (idx 3). */
uint32_t isaac_lua_engine_v65_va(void);
uint32_t isaac_lua_engine_v65_ret_va(void);
uint32_t isaac_lua_engine_v65_body_bytes(void);
int32_t isaac_lua_engine_v65_insn_count(void);
int32_t isaac_lua_engine_v65_check_flags(void);
int32_t isaac_lua_engine_v65_check_edx(void);
uint32_t isaac_lua_engine_v65_key(void);
uint32_t isaac_lua_engine_v65_object_field_off(void);
uint32_t isaac_lua_engine_v65_type_index(void);
uint32_t isaac_lua_engine_v65_touserdata_index(void);
uint32_t isaac_lua_engine_v65_fn_off(void);
uint32_t isaac_lua_engine_v65_arg0_checkinteger_index(void);
uint32_t isaac_lua_engine_v65_arg1_checknumber_index(void);
uint32_t isaac_lua_engine_v65_iat_lua_type(void);
uint32_t isaac_lua_engine_v65_iat_lua_touserdata(void);
uint32_t isaac_lua_engine_v65_iat_lua_checkinteger(void);
uint32_t isaac_lua_engine_v65_iat_lua_checknumber(void);
int32_t isaac_lua_engine_v65_return_value(void);
int32_t isaac_lua_engine_v65_install_count(void);
uint32_t isaac_lua_engine_v65_install_a_va(void);
uint32_t isaac_lua_engine_v65_install_a_ret_va(void);
uint32_t isaac_lua_engine_v65_install_a_literal_va(void);
uint32_t isaac_lua_engine_v65_install_a_real_fn_va(void);
uint32_t isaac_lua_engine_v65_install_a_name_va(void);
uint32_t isaac_lua_engine_v65_install_a_caller_va(void);
uint32_t isaac_lua_engine_v65_install_b_va(void);
uint32_t isaac_lua_engine_v65_install_b_ret_va(void);
uint32_t isaac_lua_engine_v65_install_b_literal_va(void);
uint32_t isaac_lua_engine_v65_install_b_real_fn_va(void);
uint32_t isaac_lua_engine_v65_install_b_name_va(void);
uint32_t isaac_lua_engine_v65_install_b_caller_va(void);

/* ---------------------------------------------------------------------------
 * ABI v66 — wrapper 0x8b9a80 "Fadein" (MusicManager class key 0xc82a19;
 * the v65 handoff's lit=1 frontier, the THIRD wrapper of the
 * 0x8b99f0..0x8b9e80 run). section-notes/lua-v66-8b9a80/NOTES.md.
 *
 * PE (fresh capstone TRUE body): 0x8b9a80..0x8b9b18, 54 insns, body 0x98
 * = RET_VA - VA. SIMPLE ebp frame (`push ebp; mov ebp,esp; sub esp,0x14;
 * push esi; push edi; mov edi,[ebp+8]` — v62-shaped; v65's L=esi is NOT
 * this body: **L = edi = [ebp+8]**); obj1 in the [ebp-4] SPILL SLOT
 * (ebp-relative, esp-shift immune).
 * lua_type(L,1) @0xb18400 @0x8b9a8e, add esp,8, FULL-WORD `test
 * eax,eax` @0x8b9a97; nil -> obj1=0 @[ebp-4] + jmp @0x8b9abc; else push
 * 0 (flags); push KEY 0xc82a19 @0x8b9aa2 (MusicManager — the v65 key
 * band); edx=1; ecx=edi; call 0x85c590 @0x8b9aae; obj=[eax+4] @0x8b9ab6
 * -> [ebp-4] @0x8b9ab9. touserdata(L, 0xfff0b9d7) @0xb183b0 @0x8b9ac2 ->
 * esi (mov esi,eax @0x8b9acb BETWEEN the next call's arg pushes — NO
 * add esp,8, the v56/v57/v59 lesson); arg2 = num4 =
 * luaL_checknumber(L,4) @0xb18324 @0x8b9acd -> x87 -> `fstp dword ptr
 * [ebp-0x10]` @0x8b9ad5 (float32 lane); arg1 = num3 =
 * luaL_checknumber(L,3) @0xb18324 @0x8b9ad9 -> `fstp dword ptr
 * [ebp-8]` @0x8b9ae5; arg0 = int2 = luaL_checkinteger(L,2) @0xb183f4
 * @0x8b9aeb -> eax. EIGHT dwords pushed, ONE fused add esp,0x18 @0x8b9af6
 * cleans SIX — the TWO dead dwords (0xfff0b9d7 + first edi L copy) stay
 * at [esp+4]/[esp] and are OVERWRITTEN.
 * ESP-TRACKING (v66 lesson, the v62 3-arg dead-slot overwrite extended
 * to TWO f32 lanes): movss xmm0,[ebp-0x10] @0x8b9af1 (num4, BEFORE the
 * fused cleanup); add esp,0x18; mov ecx,[ebp-4] @0x8b9af9 (obj1 this,
 * after cleanup, ebp-relative); movss [esp+4],xmm0 @0x8b9afc (num4 into
 * the dead 0xfff0b9d7 slot); movss xmm0,[ebp-8] @0x8b9b02 (num3);
 * movss [esp],xmm0 @0x8b9b07 (num3 into the dead edi-L slot);
 * `push eax` @0x8b9b0c = int2 FULL WORD; real_fn = [esi] (ud[0], FN_OFF
 * 0) @0x8b9b0d AFTER all pushes (register-held esi); `call eax` @0x8b9b0f.
 * Final stack: [esp+0]=int2, [esp+4]=B(num3 f32), [esp+8]=A(num4 f32),
 * [esp+0xc]=junk (saved edi slot) — real_fn 0x7e2080 `ret 0xc` consumes
 * exactly 3 dwords. xor eax,eax @0x8b9b12 -> ret 0 Lua values (NO
 * byte-gated lane — no pushboolean; v61's byte-gated body is NOT this
 * body); ret @0x8b9b18.
 *
 * THREE-ARG wrapper (int2, num3 f32, num4 f32) — the SECOND 3-arg body
 * of the band (v62 SetAmbientSound was int2+num3+num4 with key
 * 0xc82a16 — DIFFERENT class); SECOND with TWO checknumber float lanes.
 * SINGLE-literal installer (lit=1): ONE IMMEDIATE-held SINGLE ret-8
 * helper 0x8957d0 (body 0x56, cleanup 0x38, ONE rawset @ -3), wrapper
 * literal push 0x8b9a80 @0x8957e2 (dword @0x8957e3), real_fn 0x7e2080
 * (mov [eax],imm @0x8957e8, imm @0x8957eb), name 0xb74b30 @0x8957fd =
 * "Fadein" (.rdata cstr — SHARED string with the v56 vec-band install
 * @0x895190, DIFFERENT site/class), caller @0x86db91 (pushed dwords
 * DEAD). Class: MusicManager (class-create stub 0x8956f0 @0x86db6b,
 * name 0xb74c7c = "MusicManager", registry key 0xc82a19 rawsetp
 * REGISTRYINDEX — all wrappers 0x8b99f0..0x8b9e80 of the run share it;
 * 0xc82a19 is an opaque .data VA (packed 16-bit table), NOT a cstr).
 * 0 E8 callers of the wrapper; exactly ONE 32-bit LE literal image-wide
 * (@0x8957e3). real_fn 0x7e2080 = ZHL-identified EXACT
 * `__thiscall void Music::Fadein(unsigned int Id, float Volume, float
 * FadeRate)` (third_party/REPENTOGON/libzhl/functions/Music.zhl) —
 * MSVC member fn, track-list at this+0x31c/+0x320 (magic 0x2aaaaaab
 * ÷12 bounds gate, OOB -> error path; valid path calls 0x7e1d50 then
 * writes [eax+esi+0x178]=0 / [eax+esi+0x17c]=num3 / [eax+esi+0x180]=
 * num4), `ret 0xc` @0x7e20f9 — HOST.
 * All gates/words uint32_t (no uint8_t scalar params).
 * ----------------------------------------------------------------------- */
enum {
  ISAAC_LUA_V66_VA = 0x008b9a80u,
  ISAAC_LUA_V66_RET_VA = 0x008b9b18u,
  ISAAC_LUA_V66_INSNS = 54, /* capstone TRUE body, ret inclusive */
  ISAAC_LUA_V66_CHECK_FLAGS = 0,
  ISAAC_LUA_V66_CHECK_EDX = 1,
  ISAAC_LUA_V66_TYPE_INDEX = 0x01u,
  ISAAC_LUA_V66_OBJECT_FIELD_OFF = 0x04u,
  ISAAC_LUA_V66_KEY = 0x00c82a19u,
  ISAAC_LUA_V66_TOUSERDATA_INDEX_U32 = 0xfff0b9d7u,
  ISAAC_LUA_V66_FN_OFF = 0x00u,
  ISAAC_LUA_V66_ARG0_CHECKINTEGER_INDEX_U32 = 0x02u,
  ISAAC_LUA_V66_ARG1_CHECKNUMBER_INDEX_U32 = 0x03u,
  ISAAC_LUA_V66_ARG2_CHECKNUMBER_INDEX_U32 = 0x04u,
  ISAAC_LUA_V66_IAT_LUA_TYPE = 0x00b18400u,
  ISAAC_LUA_V66_IAT_LUA_TOUSERDATA = 0x00b183b0u,
  ISAAC_LUA_V66_IAT_LUA_CHECKINTEGER = 0x00b183f4u,
  ISAAC_LUA_V66_IAT_LUA_CHECKNUMBER = 0x00b18324u,
  ISAAC_LUA_V66_RETURN_VALUE = 0,
  ISAAC_LUA_V66_INSTALL_COUNT = 1 /* lit=1: ONE name/real_fn pair */
};

enum {
  ISAAC_LUA_V66_INSTALL_VA = 0x008957d0u,
  ISAAC_LUA_V66_INSTALL_RET_VA = 0x00895826u,
  ISAAC_LUA_V66_INSTALL_LITERAL_VA = 0x008957e3u,
  ISAAC_LUA_V66_INSTALL_REAL_FN_VA = 0x007e2080u,
  ISAAC_LUA_V66_INSTALL_NAME_VA = 0x00b74b30u, /* "Fadein" */
  ISAAC_LUA_V66_INSTALL_CALLER_VA = 0x0086db91u
};

/* FULL-WORD lua_type(L,1) gate (`test eax,eax` @0x8b9a97): obj =
 * (type != 0) ? check_field : 0. Never masked (0x100 -> 1). */
uint32_t isaac_lua_engine_v66_object_resolve(uint32_t type_result,
                                             uint32_t check_field);
/* checkinteger FULL WORD passthrough (`push eax` @0x8b9b0c): 0x100 /
 * 0x10000 / 0xffffffff all survive. Never masked. */
uint32_t isaac_lua_engine_v66_int_word(uint32_t checkint_result);

/* v66 no-arg getters. No return_gate / pushboolean exports — this body
 * returns 0 Lua values unconditionally (`xor eax,eax` @0x8b9b12; NO
 * byte-gated lane). arg1/arg2 are the checknumber float lanes (idx
 * 3/4 — the SECOND two-lane body of the band). */
uint32_t isaac_lua_engine_v66_va(void);
uint32_t isaac_lua_engine_v66_ret_va(void);
uint32_t isaac_lua_engine_v66_body_bytes(void);
int32_t isaac_lua_engine_v66_insn_count(void);
int32_t isaac_lua_engine_v66_check_flags(void);
int32_t isaac_lua_engine_v66_check_edx(void);
uint32_t isaac_lua_engine_v66_key(void);
uint32_t isaac_lua_engine_v66_object_field_off(void);
uint32_t isaac_lua_engine_v66_type_index(void);
uint32_t isaac_lua_engine_v66_touserdata_index(void);
uint32_t isaac_lua_engine_v66_fn_off(void);
uint32_t isaac_lua_engine_v66_arg0_checkinteger_index(void);
uint32_t isaac_lua_engine_v66_arg1_checknumber_index(void);
uint32_t isaac_lua_engine_v66_arg2_checknumber_index(void);
uint32_t isaac_lua_engine_v66_iat_lua_type(void);
uint32_t isaac_lua_engine_v66_iat_lua_touserdata(void);
uint32_t isaac_lua_engine_v66_iat_lua_checkinteger(void);
uint32_t isaac_lua_engine_v66_iat_lua_checknumber(void);
int32_t isaac_lua_engine_v66_return_value(void);
int32_t isaac_lua_engine_v66_install_count(void);
uint32_t isaac_lua_engine_v66_install_va(void);
uint32_t isaac_lua_engine_v66_install_ret_va(void);
uint32_t isaac_lua_engine_v66_install_literal_va(void);
uint32_t isaac_lua_engine_v66_install_real_fn_va(void);
uint32_t isaac_lua_engine_v66_install_name_va(void);
uint32_t isaac_lua_engine_v66_install_caller_va(void);

/* ---------------------------------------------------------------------------
 * ABI v67 — MusicManager band 0x8b9b20..0x8b9e80 (EIGHT wrappers landed
 * under ONE ABI bump, v63 precedent; the v66 handoff's 8-wrapper
 * frontier, ALL key 0xc82a19). section-notes/lua-v67-8b9b20/NOTES.md.
 *
 * Shared laws (8/8): FULL-WORD lua_type(L,1) gate (`test eax,eax`, nil
 * -> obj1 = 0, else push CHKFLAGS + KEY 0xc82a19 + edx=1 + call
 * 0x85c590, obj=[eax+4] OBJ_FIELD_OFF 4, TYPE_INDEX 1);
 * lua_touserdata(L, 0xfff0b9d7) IAT 0xb183b0 (register-held ud, FN_OFF
 * 0); thiscall this = obj1 in ECX; CHECK_EDX 1. IAT type 0xb18400.
 * Per-wrapper: CHECK_FLAGS (0 x5 / 1 x3), arg lanes, RETURN_VALUE,
 * byte-gate laws where present. NO uint8_t scalar params — every gate
 * law takes/returns uint32_t (& 0xff on the low byte where the PE
 * tests `al`).
 *
 * Wrapper bodies (fresh capstone TRUE bodies):
 * 0x8b9b20 "Queue"     41 insns ret 0x8b9b8b body 0x6b — ALIGNED ebp
 *   frame (and esp,-8), obj1 [esp+0xc]; arg0 = int2 checkinteger idx 2
 *   FULL WORD (push eax); real_fn 0x7e2480 ret 4; ret 0. ALSO
 *   DisableLayer via the 2nd installer site @0x86dc08 (real_fn
 *   0x7e2410, name 0xb74c1c) — same body, census row, NOT a model pin.
 * 0x8b9b90 "Fadeout"   45 insns ret 0x8b9c11 body 0x81 — aligned ebp,
 *   obj1 [esp+0xc]; arg1 = num2 checknumber idx 2 f32 lane (fstp
 *   [esp+0x14]/movss [esp]); real_fn 0x7e2100 ret 4; ret 0. ALSO
 *   PitchSlide via @0x86dc5d (0x7e24c0/0xb74cd4). SECOND site census.
 * 0x8b9c20 "Pause"     32 insns ret 0x8b9c6f body 0x4f — SIMPLE ebp,
 *   obj1 in EDI REGISTER (no spill; the band's register-held obj
 *   variant); symmetric add esp,8 after touserdata; NO args; real_fn
 *   0x7e2140 ret 0; ret 0. SIX sites (Pause/Resume/Enable/Disable/
 *   ResetPitch/UpdateVolume) — the generic zero-arg body; primary
 *   pinned, five census rows.
 * 0x8b9c70 "EnableLayer" 47 insns ret 0x8b9cef body 0x7f — aligned
 *   ebp, obj1 [esp+8]; arg1 = lua_toboolean(L,3) IAT 0xb183e8 with
 *   FULL-WORD test/setne BYTE-GATED bool word (v22 normalize BY
 *   REFERENCE; stored via setne, pushed as a FULL dword); arg0 = int2
 *   checkinteger idx 2; real_fn 0x7e2280 ret 8; ret 0.
 * 0x8b9cf0 "IsLayerEnabled" 48 insns ret 0x8b9d70 body 0x80 — aligned
 *   ebp, obj1 [esp+0xc]; CHKFLAGS 1; arg0 = int2 checkinteger idx 2;
 *   real_fn 0x7e2440 ret 4; BYTE-GATED return (`test al,al; setne cl`
 *   -> lua_pushboolean IAT 0xb183ec), ret 1.
 * 0x8b9d80 "IsEnabled" 39 insns ret 0x8b9de4 body 0x64 — SIMPLE ebp,
 *   obj1 in EDI; CHKFLAGS 1; NO args; real_fn 0x85e430 ret 0;
 *   BYTE-GATED return (pushboolean 0xb183ec), ret 1.
 * 0x8b9df0 "VolumeSlide" 50 insns ret 0x8b9e7e body 0x8e — SIMPLE ebp
 *   + sub 0x18, obj1 [ebp-4] (the v66 Fadein slot law); arg1 = num2
 *   checknumber idx 2 + arg2 = num3 checknumber idx 3 (TWO f32 lanes,
 *   fstp [ebp-0x18]/[ebp-0xc] + movss [esp]/[esp+4]); real_fn 0x7e2510
 *   ret 8; ret 0.
 * 0x8b9e80 "GetCurrentMusicID" 35 insns ret 0x8b9edb body 0x5b —
 *   SIMPLE ebp, obj1 in EDI; CHKFLAGS 1; NO args; real_fn 0x7e1780 ret
 *   0; result eax -> edx, L -> ecx, call 0x85bfd0 (the closure
 *   push-i32-sext helper — v55 pusher ROW 3 LANDED; this body adds the
 *   edge pin, the pusher's own laws stay the v55 row), ret 1. ALSO
 *   GetQueuedMusicID via @0x86dcb2 (0x7e1790/0xb74d40).
 *
 * Install sites (all ret-8; recorded as sites, NOT rows):
 *   0x895830 SINGLE @-3 (reg operands from caller) lit @0x895849 Queue
 *   0x895890 SINGLE @-3 (reg operands)         lit @0x8958a9 Fadeout
 *   0x8958f0 SINGLE @-3 (reg operands, x6)     lit @0x895909 Pause
 *   0x895950 IMMEDIATE-held SINGLE (body imms) lit @0x895963 EnableLayer
 *   0x8959b0 IMMEDIATE-held DUAL (name x2)     lit @0x8959ce IsLayerEnabled
 *   0x895a60 IMMEDIATE-held DUAL (name x2)     lit @0x895a7e IsEnabled
 *   0x895b10 IMMEDIATE-held SINGLE (body imms) lit @0x895b23 VolumeSlide
 *   0x895b70 REGISTER-operand DUAL             lit @0x895b91 GetCurrentMusicID
 * ----------------------------------------------------------------------- */
enum {
  ISAAC_LUA_V67_QUEUE_VA = 0x008b9b20u,
  ISAAC_LUA_V67_QUEUE_RET_VA = 0x008b9b8bu,
  ISAAC_LUA_V67_QUEUE_INSNS = 41, /* capstone TRUE body, ret inclusive */
  ISAAC_LUA_V67_QUEUE_CHECK_FLAGS = 0,
  ISAAC_LUA_V67_QUEUE_CHECK_EDX = 1,
  ISAAC_LUA_V67_QUEUE_TYPE_INDEX = 0x01u,
  ISAAC_LUA_V67_QUEUE_OBJECT_FIELD_OFF = 0x04u,
  ISAAC_LUA_V67_QUEUE_KEY = 0x00c82a19u, /* MusicManager class key */
  ISAAC_LUA_V67_QUEUE_TOUSERDATA_INDEX_U32 = 0xfff0b9d7u,
  ISAAC_LUA_V67_QUEUE_FN_OFF = 0x00u,
  ISAAC_LUA_V67_QUEUE_ARG0_CHECKINTEGER_INDEX_U32 = 0x02u,
  ISAAC_LUA_V67_QUEUE_IAT_LUA_TYPE = 0x00b18400u,
  ISAAC_LUA_V67_QUEUE_IAT_LUA_TOUSERDATA = 0x00b183b0u,
  ISAAC_LUA_V67_QUEUE_IAT_LUA_CHECKINTEGER = 0x00b183f4u,
  ISAAC_LUA_V67_QUEUE_RETURN_VALUE = 0,
  ISAAC_LUA_V67_QUEUE_INSTALL_COUNT = 1 /* lit=1: ONE primary pair */
};

enum {
  ISAAC_LUA_V67_QUEUE_INSTALL_VA = 0x00895830u,
  ISAAC_LUA_V67_QUEUE_INSTALL_RET_VA = 0x00895887u,
  ISAAC_LUA_V67_QUEUE_INSTALL_LITERAL_VA = 0x00895849u,
  ISAAC_LUA_V67_QUEUE_INSTALL_REAL_FN_VA = 0x007e2480u, /* Music::Queue, HOST */
  ISAAC_LUA_V67_QUEUE_INSTALL_NAME_VA = 0x00b74c5cu, /* "Queue" */
  ISAAC_LUA_V67_QUEUE_INSTALL_CALLER_VA = 0x0086dbb3u
};

enum {
  ISAAC_LUA_V67_FADEOUT_VA = 0x008b9b90u,
  ISAAC_LUA_V67_FADEOUT_RET_VA = 0x008b9c11u,
  ISAAC_LUA_V67_FADEOUT_INSNS = 45, /* capstone TRUE body, ret inclusive */
  ISAAC_LUA_V67_FADEOUT_CHECK_FLAGS = 0,
  ISAAC_LUA_V67_FADEOUT_CHECK_EDX = 1,
  ISAAC_LUA_V67_FADEOUT_TYPE_INDEX = 0x01u,
  ISAAC_LUA_V67_FADEOUT_OBJECT_FIELD_OFF = 0x04u,
  ISAAC_LUA_V67_FADEOUT_KEY = 0x00c82a19u,
  ISAAC_LUA_V67_FADEOUT_TOUSERDATA_INDEX_U32 = 0xfff0b9d7u,
  ISAAC_LUA_V67_FADEOUT_FN_OFF = 0x00u,
  ISAAC_LUA_V67_FADEOUT_ARG1_CHECKNUMBER_INDEX_U32 = 0x02u,
  ISAAC_LUA_V67_FADEOUT_IAT_LUA_TYPE = 0x00b18400u,
  ISAAC_LUA_V67_FADEOUT_IAT_LUA_TOUSERDATA = 0x00b183b0u,
  ISAAC_LUA_V67_FADEOUT_IAT_LUA_CHECKNUMBER = 0x00b18324u,
  ISAAC_LUA_V67_FADEOUT_RETURN_VALUE = 0,
  ISAAC_LUA_V67_FADEOUT_INSTALL_COUNT = 1
};

enum {
  ISAAC_LUA_V67_FADEOUT_INSTALL_VA = 0x00895890u,
  ISAAC_LUA_V67_FADEOUT_INSTALL_RET_VA = 0x008958e7u,
  ISAAC_LUA_V67_FADEOUT_INSTALL_LITERAL_VA = 0x008958a9u,
  ISAAC_LUA_V67_FADEOUT_INSTALL_REAL_FN_VA = 0x007e2100u, /* Music::Fadeout, HOST */
  ISAAC_LUA_V67_FADEOUT_INSTALL_NAME_VA = 0x00b74b38u, /* "Fadeout" — v56 vec-band shares the string, site differs */
  ISAAC_LUA_V67_FADEOUT_INSTALL_CALLER_VA = 0x0086dbc4u
};

enum {
  ISAAC_LUA_V67_PAUSE_VA = 0x008b9c20u,
  ISAAC_LUA_V67_PAUSE_RET_VA = 0x008b9c6fu,
  ISAAC_LUA_V67_PAUSE_INSNS = 32, /* capstone TRUE body, ret inclusive */
  ISAAC_LUA_V67_PAUSE_CHECK_FLAGS = 0,
  ISAAC_LUA_V67_PAUSE_CHECK_EDX = 1,
  ISAAC_LUA_V67_PAUSE_TYPE_INDEX = 0x01u,
  ISAAC_LUA_V67_PAUSE_OBJECT_FIELD_OFF = 0x04u,
  ISAAC_LUA_V67_PAUSE_KEY = 0x00c82a19u,
  ISAAC_LUA_V67_PAUSE_TOUSERDATA_INDEX_U32 = 0xfff0b9d7u,
  ISAAC_LUA_V67_PAUSE_FN_OFF = 0x00u,
  ISAAC_LUA_V67_PAUSE_IAT_LUA_TYPE = 0x00b18400u,
  ISAAC_LUA_V67_PAUSE_IAT_LUA_TOUSERDATA = 0x00b183b0u,
  ISAAC_LUA_V67_PAUSE_RETURN_VALUE = 0,
  ISAAC_LUA_V67_PAUSE_INSTALL_COUNT = 1 /* six class-reg sites; primary pinned */
};

enum {
  ISAAC_LUA_V67_PAUSE_INSTALL_VA = 0x008958f0u,
  ISAAC_LUA_V67_PAUSE_INSTALL_RET_VA = 0x00895947u,
  ISAAC_LUA_V67_PAUSE_INSTALL_LITERAL_VA = 0x00895909u,
  ISAAC_LUA_V67_PAUSE_INSTALL_REAL_FN_VA = 0x007e2140u, /* Music::Pause, HOST */
  ISAAC_LUA_V67_PAUSE_INSTALL_NAME_VA = 0x00b6b02cu, /* "Pause" */
  ISAAC_LUA_V67_PAUSE_INSTALL_CALLER_VA = 0x0086dbd5u
};

enum {
  ISAAC_LUA_V67_ENABLELAYER_VA = 0x008b9c70u,
  ISAAC_LUA_V67_ENABLELAYER_RET_VA = 0x008b9cefu,
  ISAAC_LUA_V67_ENABLELAYER_INSNS = 47, /* capstone TRUE body, ret inclusive */
  ISAAC_LUA_V67_ENABLELAYER_CHECK_FLAGS = 0,
  ISAAC_LUA_V67_ENABLELAYER_CHECK_EDX = 1,
  ISAAC_LUA_V67_ENABLELAYER_TYPE_INDEX = 0x01u,
  ISAAC_LUA_V67_ENABLELAYER_OBJECT_FIELD_OFF = 0x04u,
  ISAAC_LUA_V67_ENABLELAYER_KEY = 0x00c82a19u,
  ISAAC_LUA_V67_ENABLELAYER_TOUSERDATA_INDEX_U32 = 0xfff0b9d7u,
  ISAAC_LUA_V67_ENABLELAYER_FN_OFF = 0x00u,
  ISAAC_LUA_V67_ENABLELAYER_ARG0_CHECKINTEGER_INDEX_U32 = 0x02u,
  ISAAC_LUA_V67_ENABLELAYER_ARG1_TOBOOLEAN_INDEX_U32 = 0x03u,
  ISAAC_LUA_V67_ENABLELAYER_IAT_LUA_TYPE = 0x00b18400u,
  ISAAC_LUA_V67_ENABLELAYER_IAT_LUA_TOUSERDATA = 0x00b183b0u,
  ISAAC_LUA_V67_ENABLELAYER_IAT_LUA_TOBOOLEAN = 0x00b183e8u, /* v22 BY REFERENCE */
  ISAAC_LUA_V67_ENABLELAYER_IAT_LUA_CHECKINTEGER = 0x00b183f4u,
  ISAAC_LUA_V67_ENABLELAYER_RETURN_VALUE = 0,
  ISAAC_LUA_V67_ENABLELAYER_INSTALL_COUNT = 1
};

enum {
  ISAAC_LUA_V67_ENABLELAYER_INSTALL_VA = 0x00895950u,
  ISAAC_LUA_V67_ENABLELAYER_INSTALL_RET_VA = 0x008959a6u,
  ISAAC_LUA_V67_ENABLELAYER_INSTALL_LITERAL_VA = 0x00895963u,
  ISAAC_LUA_V67_ENABLELAYER_INSTALL_REAL_FN_VA = 0x007e2280u, /* Music::EnableLayer, HOST */
  ISAAC_LUA_V67_ENABLELAYER_INSTALL_NAME_VA = 0x00b74c44u, /* "EnableLayer" */
  ISAAC_LUA_V67_ENABLELAYER_INSTALL_CALLER_VA = 0x0086dbf7u
};

enum {
  ISAAC_LUA_V67_ISLAYERENABLED_VA = 0x008b9cf0u,
  ISAAC_LUA_V67_ISLAYERENABLED_RET_VA = 0x008b9d70u,
  ISAAC_LUA_V67_ISLAYERENABLED_INSNS = 48, /* capstone TRUE body, ret inclusive */
  ISAAC_LUA_V67_ISLAYERENABLED_CHECK_FLAGS = 1,
  ISAAC_LUA_V67_ISLAYERENABLED_CHECK_EDX = 1,
  ISAAC_LUA_V67_ISLAYERENABLED_TYPE_INDEX = 0x01u,
  ISAAC_LUA_V67_ISLAYERENABLED_OBJECT_FIELD_OFF = 0x04u,
  ISAAC_LUA_V67_ISLAYERENABLED_KEY = 0x00c82a19u,
  ISAAC_LUA_V67_ISLAYERENABLED_TOUSERDATA_INDEX_U32 = 0xfff0b9d7u,
  ISAAC_LUA_V67_ISLAYERENABLED_FN_OFF = 0x00u,
  ISAAC_LUA_V67_ISLAYERENABLED_ARG0_CHECKINTEGER_INDEX_U32 = 0x02u,
  ISAAC_LUA_V67_ISLAYERENABLED_IAT_LUA_TYPE = 0x00b18400u,
  ISAAC_LUA_V67_ISLAYERENABLED_IAT_LUA_TOUSERDATA = 0x00b183b0u,
  ISAAC_LUA_V67_ISLAYERENABLED_IAT_LUA_CHECKINTEGER = 0x00b183f4u,
  ISAAC_LUA_V67_ISLAYERENABLED_IAT_LUA_PUSHBOOLEAN = 0x00b183ecu, /* v22 BY REFERENCE */
  ISAAC_LUA_V67_ISLAYERENABLED_RETURN_VALUE = 1,
  ISAAC_LUA_V67_ISLAYERENABLED_INSTALL_COUNT = 1
};

enum {
  ISAAC_LUA_V67_ISLAYERENABLED_INSTALL_VA = 0x008959b0u,
  ISAAC_LUA_V67_ISLAYERENABLED_INSTALL_RET_VA = 0x00895a50u,
  ISAAC_LUA_V67_ISLAYERENABLED_INSTALL_LITERAL_VA = 0x008959ceu,
  ISAAC_LUA_V67_ISLAYERENABLED_INSTALL_REAL_FN_VA = 0x007e2440u, /* Music::IsLayerEnabled, HOST */
  ISAAC_LUA_V67_ISLAYERENABLED_INSTALL_NAME_VA = 0x00b74c2cu, /* "IsLayerEnabled" */
  ISAAC_LUA_V67_ISLAYERENABLED_INSTALL_CALLER_VA = 0x0086dc19u
};

enum {
  ISAAC_LUA_V67_ISENABLED_VA = 0x008b9d80u,
  ISAAC_LUA_V67_ISENABLED_RET_VA = 0x008b9de4u,
  ISAAC_LUA_V67_ISENABLED_INSNS = 39, /* capstone TRUE body, ret inclusive */
  ISAAC_LUA_V67_ISENABLED_CHECK_FLAGS = 1,
  ISAAC_LUA_V67_ISENABLED_CHECK_EDX = 1,
  ISAAC_LUA_V67_ISENABLED_TYPE_INDEX = 0x01u,
  ISAAC_LUA_V67_ISENABLED_OBJECT_FIELD_OFF = 0x04u,
  ISAAC_LUA_V67_ISENABLED_KEY = 0x00c82a19u,
  ISAAC_LUA_V67_ISENABLED_TOUSERDATA_INDEX_U32 = 0xfff0b9d7u,
  ISAAC_LUA_V67_ISENABLED_FN_OFF = 0x00u,
  ISAAC_LUA_V67_ISENABLED_IAT_LUA_TYPE = 0x00b18400u,
  ISAAC_LUA_V67_ISENABLED_IAT_LUA_TOUSERDATA = 0x00b183b0u,
  ISAAC_LUA_V67_ISENABLED_IAT_LUA_PUSHBOOLEAN = 0x00b183ecu,
  ISAAC_LUA_V67_ISENABLED_RETURN_VALUE = 1,
  ISAAC_LUA_V67_ISENABLED_INSTALL_COUNT = 1
};

enum {
  ISAAC_LUA_V67_ISENABLED_INSTALL_VA = 0x00895a60u,
  ISAAC_LUA_V67_ISENABLED_INSTALL_RET_VA = 0x00895b00u,
  ISAAC_LUA_V67_ISENABLED_INSTALL_LITERAL_VA = 0x00895a7eu,
  ISAAC_LUA_V67_ISENABLED_INSTALL_REAL_FN_VA = 0x0085e430u, /* IsEnabled .text closure, HOST */
  ISAAC_LUA_V67_ISENABLED_INSTALL_NAME_VA = 0x00b74cc8u, /* "IsEnabled" */
  ISAAC_LUA_V67_ISENABLED_INSTALL_CALLER_VA = 0x0086dc4cu
};

enum {
  ISAAC_LUA_V67_VOLUMESLIDE_VA = 0x008b9df0u,
  ISAAC_LUA_V67_VOLUMESLIDE_RET_VA = 0x008b9e7eu,
  ISAAC_LUA_V67_VOLUMESLIDE_INSNS = 50, /* capstone TRUE body, ret inclusive */
  ISAAC_LUA_V67_VOLUMESLIDE_CHECK_FLAGS = 0,
  ISAAC_LUA_V67_VOLUMESLIDE_CHECK_EDX = 1,
  ISAAC_LUA_V67_VOLUMESLIDE_TYPE_INDEX = 0x01u,
  ISAAC_LUA_V67_VOLUMESLIDE_OBJECT_FIELD_OFF = 0x04u,
  ISAAC_LUA_V67_VOLUMESLIDE_KEY = 0x00c82a19u,
  ISAAC_LUA_V67_VOLUMESLIDE_TOUSERDATA_INDEX_U32 = 0xfff0b9d7u,
  ISAAC_LUA_V67_VOLUMESLIDE_FN_OFF = 0x00u,
  ISAAC_LUA_V67_VOLUMESLIDE_ARG1_CHECKNUMBER_INDEX_U32 = 0x02u,
  ISAAC_LUA_V67_VOLUMESLIDE_ARG2_CHECKNUMBER_INDEX_U32 = 0x03u,
  ISAAC_LUA_V67_VOLUMESLIDE_IAT_LUA_TYPE = 0x00b18400u,
  ISAAC_LUA_V67_VOLUMESLIDE_IAT_LUA_TOUSERDATA = 0x00b183b0u,
  ISAAC_LUA_V67_VOLUMESLIDE_IAT_LUA_CHECKNUMBER = 0x00b18324u,
  ISAAC_LUA_V67_VOLUMESLIDE_RETURN_VALUE = 0,
  ISAAC_LUA_V67_VOLUMESLIDE_INSTALL_COUNT = 1
};

enum {
  ISAAC_LUA_V67_VOLUMESLIDE_INSTALL_VA = 0x00895b10u,
  ISAAC_LUA_V67_VOLUMESLIDE_INSTALL_RET_VA = 0x00895b66u,
  ISAAC_LUA_V67_VOLUMESLIDE_INSTALL_LITERAL_VA = 0x00895b23u,
  ISAAC_LUA_V67_VOLUMESLIDE_INSTALL_REAL_FN_VA = 0x007e2510u, /* Music::VolumeSlide, HOST */
  ISAAC_LUA_V67_VOLUMESLIDE_INSTALL_NAME_VA = 0x00b74cbcu, /* "VolumeSlide" */
  ISAAC_LUA_V67_VOLUMESLIDE_INSTALL_CALLER_VA = 0x0086dc7fu
};

enum {
  ISAAC_LUA_V67_GETCURRENTMUSICID_VA = 0x008b9e80u,
  ISAAC_LUA_V67_GETCURRENTMUSICID_RET_VA = 0x008b9edbu,
  ISAAC_LUA_V67_GETCURRENTMUSICID_INSNS = 35, /* capstone TRUE body, ret inclusive */
  ISAAC_LUA_V67_GETCURRENTMUSICID_CHECK_FLAGS = 1,
  ISAAC_LUA_V67_GETCURRENTMUSICID_CHECK_EDX = 1,
  ISAAC_LUA_V67_GETCURRENTMUSICID_TYPE_INDEX = 0x01u,
  ISAAC_LUA_V67_GETCURRENTMUSICID_OBJECT_FIELD_OFF = 0x04u,
  ISAAC_LUA_V67_GETCURRENTMUSICID_KEY = 0x00c82a19u,
  ISAAC_LUA_V67_GETCURRENTMUSICID_TOUSERDATA_INDEX_U32 = 0xfff0b9d7u,
  ISAAC_LUA_V67_GETCURRENTMUSICID_FN_OFF = 0x00u,
  ISAAC_LUA_V67_GETCURRENTMUSICID_SEXT_PUSH_VA = 0x0085bfd0u, /* v55 pusher ROW 3 — its laws stay the v55 row */
  ISAAC_LUA_V67_GETCURRENTMUSICID_IAT_LUA_TYPE = 0x00b18400u,
  ISAAC_LUA_V67_GETCURRENTMUSICID_IAT_LUA_TOUSERDATA = 0x00b183b0u,
  ISAAC_LUA_V67_GETCURRENTMUSICID_RETURN_VALUE = 1,
  ISAAC_LUA_V67_GETCURRENTMUSICID_INSTALL_COUNT = 1
};

enum {
  ISAAC_LUA_V67_GETCURRENTMUSICID_INSTALL_VA = 0x00895b70u,
  ISAAC_LUA_V67_GETCURRENTMUSICID_INSTALL_RET_VA = 0x00895c0bu,
  ISAAC_LUA_V67_GETCURRENTMUSICID_INSTALL_LITERAL_VA = 0x00895b91u,
  ISAAC_LUA_V67_GETCURRENTMUSICID_INSTALL_REAL_FN_VA = 0x007e1780u, /* Music::GetCurrentMusicID, HOST */
  ISAAC_LUA_V67_GETCURRENTMUSICID_INSTALL_NAME_VA = 0x00b74c9cu, /* "GetCurrentMusicID" */
  ISAAC_LUA_V67_GETCURRENTMUSICID_INSTALL_CALLER_VA = 0x0086dca1u
};

/* FULL-WORD lua_type(L,1) gates (`test eax,eax`): obj = (type != 0) ?
 * check_field : 0. One per wrapper (8/8 — shared law, per-wrapper
 * export for pinning parity with the v66 shape). Never masked. */
uint32_t isaac_lua_engine_v67_queue_object_resolve(uint32_t type_result,
                                                   uint32_t check_field);
uint32_t isaac_lua_engine_v67_fadeout_object_resolve(uint32_t type_result,
                                                     uint32_t check_field);
uint32_t isaac_lua_engine_v67_pause_object_resolve(uint32_t type_result,
                                                   uint32_t check_field);
uint32_t isaac_lua_engine_v67_enablelayer_object_resolve(uint32_t type_result,
                                                         uint32_t check_field);
uint32_t isaac_lua_engine_v67_islayerenabled_object_resolve(uint32_t type_result,
                                                            uint32_t check_field);
uint32_t isaac_lua_engine_v67_isenabled_object_resolve(uint32_t type_result,
                                                       uint32_t check_field);
uint32_t isaac_lua_engine_v67_volumeslide_object_resolve(uint32_t type_result,
                                                         uint32_t check_field);
uint32_t isaac_lua_engine_v67_getcurrentmusicid_object_resolve(uint32_t type_result,
                                                               uint32_t check_field);

/* checkinteger FULL WORD passthroughs (`push eax`): the three
 * int-arg/ret bodies. 0x100 / 0x10000 / 0xffffffff survive. */
uint32_t isaac_lua_engine_v67_queue_int_word(uint32_t checkint_result);
uint32_t isaac_lua_engine_v67_enablelayer_int_word(uint32_t checkint_result);
uint32_t isaac_lua_engine_v67_islayerenabled_int_word(uint32_t checkint_result);

/* EnableLayer bool gate: PE `test eax,eax; setne byte [esp+0x24]`
 * @0x8b9cc8/@0x8b9ccd — FULL-WORD test of the lua_toboolean(L,3)
 * result (v22 boolean-normalize BY REFERENCE), the gate word pushed as
 * a full dword. uint32 in/out (NO uint8_t param). */
uint32_t isaac_lua_engine_v67_enablelayer_bool_word(uint32_t toboolean_result);

/* BYTE-GATED returns: PE `test al,al; setne cl` @0x8b9d56/@0x8b9d58
 * (IsLayerEnabled) and @0x8b9dcc/@0x8b9dce (IsEnabled) — the real_fn's
 * AL return byte -> lua_pushboolean(L, bool) IAT 0xb183ec; ret 1. The
 * gate law takes the full uint32 return word and tests (& 0xff) != 0
 * (NO uint8_t param). */
uint32_t isaac_lua_engine_v67_islayerenabled_return_gate(uint32_t real_fn_result);
uint32_t isaac_lua_engine_v67_isenabled_return_gate(uint32_t real_fn_result);

/* GetCurrentMusicID result word: PE `mov edx,eax` @0x8b9eca — the
 * real_fn FULL DWORD result passed to the 0x85bfd0 sext pusher. */
uint32_t isaac_lua_engine_v67_getcurrentmusicid_result_word(uint32_t real_fn_result);

/* v67 no-arg getters (per wrapper, mirroring the v66 shape). */
uint32_t isaac_lua_engine_v67_queue_va(void);
uint32_t isaac_lua_engine_v67_queue_ret_va(void);
uint32_t isaac_lua_engine_v67_queue_body_bytes(void);
int32_t isaac_lua_engine_v67_queue_insn_count(void);
int32_t isaac_lua_engine_v67_queue_check_flags(void);
int32_t isaac_lua_engine_v67_queue_check_edx(void);
uint32_t isaac_lua_engine_v67_queue_key(void);
uint32_t isaac_lua_engine_v67_queue_object_field_off(void);
uint32_t isaac_lua_engine_v67_queue_type_index(void);
uint32_t isaac_lua_engine_v67_queue_touserdata_index(void);
uint32_t isaac_lua_engine_v67_queue_fn_off(void);
uint32_t isaac_lua_engine_v67_queue_arg0_checkinteger_index(void);
uint32_t isaac_lua_engine_v67_queue_iat_lua_type(void);
uint32_t isaac_lua_engine_v67_queue_iat_lua_touserdata(void);
uint32_t isaac_lua_engine_v67_queue_iat_lua_checkinteger(void);
int32_t isaac_lua_engine_v67_queue_return_value(void);
int32_t isaac_lua_engine_v67_queue_install_count(void);
uint32_t isaac_lua_engine_v67_queue_install_va(void);
uint32_t isaac_lua_engine_v67_queue_install_ret_va(void);
uint32_t isaac_lua_engine_v67_queue_install_literal_va(void);
uint32_t isaac_lua_engine_v67_queue_install_real_fn_va(void);
uint32_t isaac_lua_engine_v67_queue_install_name_va(void);
uint32_t isaac_lua_engine_v67_queue_install_caller_va(void);

uint32_t isaac_lua_engine_v67_fadeout_va(void);
uint32_t isaac_lua_engine_v67_fadeout_ret_va(void);
uint32_t isaac_lua_engine_v67_fadeout_body_bytes(void);
int32_t isaac_lua_engine_v67_fadeout_insn_count(void);
int32_t isaac_lua_engine_v67_fadeout_check_flags(void);
int32_t isaac_lua_engine_v67_fadeout_check_edx(void);
uint32_t isaac_lua_engine_v67_fadeout_key(void);
uint32_t isaac_lua_engine_v67_fadeout_object_field_off(void);
uint32_t isaac_lua_engine_v67_fadeout_type_index(void);
uint32_t isaac_lua_engine_v67_fadeout_touserdata_index(void);
uint32_t isaac_lua_engine_v67_fadeout_fn_off(void);
uint32_t isaac_lua_engine_v67_fadeout_arg1_checknumber_index(void);
uint32_t isaac_lua_engine_v67_fadeout_iat_lua_type(void);
uint32_t isaac_lua_engine_v67_fadeout_iat_lua_touserdata(void);
uint32_t isaac_lua_engine_v67_fadeout_iat_lua_checknumber(void);
int32_t isaac_lua_engine_v67_fadeout_return_value(void);
int32_t isaac_lua_engine_v67_fadeout_install_count(void);
uint32_t isaac_lua_engine_v67_fadeout_install_va(void);
uint32_t isaac_lua_engine_v67_fadeout_install_ret_va(void);
uint32_t isaac_lua_engine_v67_fadeout_install_literal_va(void);
uint32_t isaac_lua_engine_v67_fadeout_install_real_fn_va(void);
uint32_t isaac_lua_engine_v67_fadeout_install_name_va(void);
uint32_t isaac_lua_engine_v67_fadeout_install_caller_va(void);

uint32_t isaac_lua_engine_v67_pause_va(void);
uint32_t isaac_lua_engine_v67_pause_ret_va(void);
uint32_t isaac_lua_engine_v67_pause_body_bytes(void);
int32_t isaac_lua_engine_v67_pause_insn_count(void);
int32_t isaac_lua_engine_v67_pause_check_flags(void);
int32_t isaac_lua_engine_v67_pause_check_edx(void);
uint32_t isaac_lua_engine_v67_pause_key(void);
uint32_t isaac_lua_engine_v67_pause_object_field_off(void);
uint32_t isaac_lua_engine_v67_pause_type_index(void);
uint32_t isaac_lua_engine_v67_pause_touserdata_index(void);
uint32_t isaac_lua_engine_v67_pause_fn_off(void);
uint32_t isaac_lua_engine_v67_pause_iat_lua_type(void);
uint32_t isaac_lua_engine_v67_pause_iat_lua_touserdata(void);
int32_t isaac_lua_engine_v67_pause_return_value(void);
int32_t isaac_lua_engine_v67_pause_install_count(void);
uint32_t isaac_lua_engine_v67_pause_install_va(void);
uint32_t isaac_lua_engine_v67_pause_install_ret_va(void);
uint32_t isaac_lua_engine_v67_pause_install_literal_va(void);
uint32_t isaac_lua_engine_v67_pause_install_real_fn_va(void);
uint32_t isaac_lua_engine_v67_pause_install_name_va(void);
uint32_t isaac_lua_engine_v67_pause_install_caller_va(void);

uint32_t isaac_lua_engine_v67_enablelayer_va(void);
uint32_t isaac_lua_engine_v67_enablelayer_ret_va(void);
uint32_t isaac_lua_engine_v67_enablelayer_body_bytes(void);
int32_t isaac_lua_engine_v67_enablelayer_insn_count(void);
int32_t isaac_lua_engine_v67_enablelayer_check_flags(void);
int32_t isaac_lua_engine_v67_enablelayer_check_edx(void);
uint32_t isaac_lua_engine_v67_enablelayer_key(void);
uint32_t isaac_lua_engine_v67_enablelayer_object_field_off(void);
uint32_t isaac_lua_engine_v67_enablelayer_type_index(void);
uint32_t isaac_lua_engine_v67_enablelayer_touserdata_index(void);
uint32_t isaac_lua_engine_v67_enablelayer_fn_off(void);
uint32_t isaac_lua_engine_v67_enablelayer_arg0_checkinteger_index(void);
uint32_t isaac_lua_engine_v67_enablelayer_arg1_toboolean_index(void);
uint32_t isaac_lua_engine_v67_enablelayer_iat_lua_type(void);
uint32_t isaac_lua_engine_v67_enablelayer_iat_lua_touserdata(void);
uint32_t isaac_lua_engine_v67_enablelayer_iat_lua_toboolean(void);
uint32_t isaac_lua_engine_v67_enablelayer_iat_lua_checkinteger(void);
int32_t isaac_lua_engine_v67_enablelayer_return_value(void);
int32_t isaac_lua_engine_v67_enablelayer_install_count(void);
uint32_t isaac_lua_engine_v67_enablelayer_install_va(void);
uint32_t isaac_lua_engine_v67_enablelayer_install_ret_va(void);
uint32_t isaac_lua_engine_v67_enablelayer_install_literal_va(void);
uint32_t isaac_lua_engine_v67_enablelayer_install_real_fn_va(void);
uint32_t isaac_lua_engine_v67_enablelayer_install_name_va(void);
uint32_t isaac_lua_engine_v67_enablelayer_install_caller_va(void);

uint32_t isaac_lua_engine_v67_islayerenabled_va(void);
uint32_t isaac_lua_engine_v67_islayerenabled_ret_va(void);
uint32_t isaac_lua_engine_v67_islayerenabled_body_bytes(void);
int32_t isaac_lua_engine_v67_islayerenabled_insn_count(void);
int32_t isaac_lua_engine_v67_islayerenabled_check_flags(void);
int32_t isaac_lua_engine_v67_islayerenabled_check_edx(void);
uint32_t isaac_lua_engine_v67_islayerenabled_key(void);
uint32_t isaac_lua_engine_v67_islayerenabled_object_field_off(void);
uint32_t isaac_lua_engine_v67_islayerenabled_type_index(void);
uint32_t isaac_lua_engine_v67_islayerenabled_touserdata_index(void);
uint32_t isaac_lua_engine_v67_islayerenabled_fn_off(void);
uint32_t isaac_lua_engine_v67_islayerenabled_arg0_checkinteger_index(void);
uint32_t isaac_lua_engine_v67_islayerenabled_iat_lua_type(void);
uint32_t isaac_lua_engine_v67_islayerenabled_iat_lua_touserdata(void);
uint32_t isaac_lua_engine_v67_islayerenabled_iat_lua_checkinteger(void);
uint32_t isaac_lua_engine_v67_islayerenabled_iat_lua_pushboolean(void);
int32_t isaac_lua_engine_v67_islayerenabled_return_value(void);
int32_t isaac_lua_engine_v67_islayerenabled_install_count(void);
uint32_t isaac_lua_engine_v67_islayerenabled_install_va(void);
uint32_t isaac_lua_engine_v67_islayerenabled_install_ret_va(void);
uint32_t isaac_lua_engine_v67_islayerenabled_install_literal_va(void);
uint32_t isaac_lua_engine_v67_islayerenabled_install_real_fn_va(void);
uint32_t isaac_lua_engine_v67_islayerenabled_install_name_va(void);
uint32_t isaac_lua_engine_v67_islayerenabled_install_caller_va(void);

uint32_t isaac_lua_engine_v67_isenabled_va(void);
uint32_t isaac_lua_engine_v67_isenabled_ret_va(void);
uint32_t isaac_lua_engine_v67_isenabled_body_bytes(void);
int32_t isaac_lua_engine_v67_isenabled_insn_count(void);
int32_t isaac_lua_engine_v67_isenabled_check_flags(void);
int32_t isaac_lua_engine_v67_isenabled_check_edx(void);
uint32_t isaac_lua_engine_v67_isenabled_key(void);
uint32_t isaac_lua_engine_v67_isenabled_object_field_off(void);
uint32_t isaac_lua_engine_v67_isenabled_type_index(void);
uint32_t isaac_lua_engine_v67_isenabled_touserdata_index(void);
uint32_t isaac_lua_engine_v67_isenabled_fn_off(void);
uint32_t isaac_lua_engine_v67_isenabled_iat_lua_type(void);
uint32_t isaac_lua_engine_v67_isenabled_iat_lua_touserdata(void);
uint32_t isaac_lua_engine_v67_isenabled_iat_lua_pushboolean(void);
int32_t isaac_lua_engine_v67_isenabled_return_value(void);
int32_t isaac_lua_engine_v67_isenabled_install_count(void);
uint32_t isaac_lua_engine_v67_isenabled_install_va(void);
uint32_t isaac_lua_engine_v67_isenabled_install_ret_va(void);
uint32_t isaac_lua_engine_v67_isenabled_install_literal_va(void);
uint32_t isaac_lua_engine_v67_isenabled_install_real_fn_va(void);
uint32_t isaac_lua_engine_v67_isenabled_install_name_va(void);
uint32_t isaac_lua_engine_v67_isenabled_install_caller_va(void);

uint32_t isaac_lua_engine_v67_volumeslide_va(void);
uint32_t isaac_lua_engine_v67_volumeslide_ret_va(void);
uint32_t isaac_lua_engine_v67_volumeslide_body_bytes(void);
int32_t isaac_lua_engine_v67_volumeslide_insn_count(void);
int32_t isaac_lua_engine_v67_volumeslide_check_flags(void);
int32_t isaac_lua_engine_v67_volumeslide_check_edx(void);
uint32_t isaac_lua_engine_v67_volumeslide_key(void);
uint32_t isaac_lua_engine_v67_volumeslide_object_field_off(void);
uint32_t isaac_lua_engine_v67_volumeslide_type_index(void);
uint32_t isaac_lua_engine_v67_volumeslide_touserdata_index(void);
uint32_t isaac_lua_engine_v67_volumeslide_fn_off(void);
uint32_t isaac_lua_engine_v67_volumeslide_arg1_checknumber_index(void);
uint32_t isaac_lua_engine_v67_volumeslide_arg2_checknumber_index(void);
uint32_t isaac_lua_engine_v67_volumeslide_iat_lua_type(void);
uint32_t isaac_lua_engine_v67_volumeslide_iat_lua_touserdata(void);
uint32_t isaac_lua_engine_v67_volumeslide_iat_lua_checknumber(void);
int32_t isaac_lua_engine_v67_volumeslide_return_value(void);
int32_t isaac_lua_engine_v67_volumeslide_install_count(void);
uint32_t isaac_lua_engine_v67_volumeslide_install_va(void);
uint32_t isaac_lua_engine_v67_volumeslide_install_ret_va(void);
uint32_t isaac_lua_engine_v67_volumeslide_install_literal_va(void);
uint32_t isaac_lua_engine_v67_volumeslide_install_real_fn_va(void);
uint32_t isaac_lua_engine_v67_volumeslide_install_name_va(void);
uint32_t isaac_lua_engine_v67_volumeslide_install_caller_va(void);

uint32_t isaac_lua_engine_v67_getcurrentmusicid_va(void);
uint32_t isaac_lua_engine_v67_getcurrentmusicid_ret_va(void);
uint32_t isaac_lua_engine_v67_getcurrentmusicid_body_bytes(void);
int32_t isaac_lua_engine_v67_getcurrentmusicid_insn_count(void);
int32_t isaac_lua_engine_v67_getcurrentmusicid_check_flags(void);
int32_t isaac_lua_engine_v67_getcurrentmusicid_check_edx(void);
uint32_t isaac_lua_engine_v67_getcurrentmusicid_key(void);
uint32_t isaac_lua_engine_v67_getcurrentmusicid_object_field_off(void);
uint32_t isaac_lua_engine_v67_getcurrentmusicid_type_index(void);
uint32_t isaac_lua_engine_v67_getcurrentmusicid_touserdata_index(void);
uint32_t isaac_lua_engine_v67_getcurrentmusicid_fn_off(void);
uint32_t isaac_lua_engine_v67_getcurrentmusicid_sext_push_va(void);
uint32_t isaac_lua_engine_v67_getcurrentmusicid_iat_lua_type(void);
uint32_t isaac_lua_engine_v67_getcurrentmusicid_iat_lua_touserdata(void);
int32_t isaac_lua_engine_v67_getcurrentmusicid_return_value(void);
int32_t isaac_lua_engine_v67_getcurrentmusicid_install_count(void);
uint32_t isaac_lua_engine_v67_getcurrentmusicid_install_va(void);
uint32_t isaac_lua_engine_v67_getcurrentmusicid_install_ret_va(void);
uint32_t isaac_lua_engine_v67_getcurrentmusicid_install_literal_va(void);
uint32_t isaac_lua_engine_v67_getcurrentmusicid_install_real_fn_va(void);
uint32_t isaac_lua_engine_v67_getcurrentmusicid_install_name_va(void);
uint32_t isaac_lua_engine_v67_getcurrentmusicid_install_caller_va(void);

/* ---------------------------------------------------------------------------
 * ABI v68 — fourth-region Isaac-global wrapper band 0x897870..0x898f4b
 * (EIGHT wrappers landed under ONE ABI bump, v67 precedent; the v67
 * handoff's remaining-census outside the MusicManager band — hosts C/D:
 * sites 0x86dd0e..0x86e17b, installers 0x895c70..0x896750 ret-8 family,
 * names/real_fns from caller-site pushes `push <real_fn>; push <name>`).
 * section-notes/lua-v68-8b9b20/NOTES.md.
 *
 * Shared laws (8/8): NO lua_type gate, NO 0x85c590 check helper — the
 * registration closure's upvalue IS the userdata: direct
 * lua_touserdata(L, 0xfff0b9d7) IAT 0xb183b0, real_fn = ud[0] (FN_OFF
 * 0). Every gate/word uint32_t (no uint8_t scalar params). Installers
 * are the ret-8 reg-held helpers of the 0x895cxx..0x8967xx band; each
 * wrapper literal pins the helper-body `push <wrapper>` site.
 *
 * 0x897870 "GetButtonValue" 35 insns ret 0x8978c6 body 0x56 — SIMPLE
 *   ebp; ud register-held (edi); real_fn cdecl 2 args
 *   (checkinteger(L,1) + checkinteger(L,2) IAT 0xb183f4 esi-cached);
 *   real_fn returns FLOAT: fstp [ebp-4] + movss xmm1,[ebp-4]
 *   (store-forward slot, F32_SLOT_OFF -4) then call 0x85c050 = pusher
 *   ROW 0 PUSHNUMBER_F32 (edge pin; pusher laws stay the v55 row),
 *   ret 1. ALSO GetActionValue via 2nd site @0x86e16a — census row.
 * 0x8978d0 "IsButtonTriggered" 36 insns ret 0x897923 body 0x53 —
 *   SIMPLE ebp; ud register-held; real_fn cdecl 2 args
 *   checkinteger(L,1)+(L,2); BYTE-GATED return (`test al,al; setne cl`
 *   @0x897907/@0x897909 -> lua_pushboolean IAT 0xb183ec), ret 1. ALSO
 *   IsButtonPressed @0x86e126 / IsActionTriggered @0x86e148 /
 *   IsActionPressed @0x86e159 — census rows.
 * 0x89e300 "GetBuiltInCallbackState" 29 insns ret 0x89e343 body 0x43 —
 *   ALIGNED ebp (and esp,-8); ud register-held (esi); real_fn cdecl 1
 *   arg checkinteger(L,1); BYTE-GATED return (pushboolean), ret 1.
 *   ALSO IsMouseBtnPressed @0x86e17b — census row.
 * 0x898d90 "MusicManager" 32 insns ret 0x898de8 body 0x58 — SIMPLE
 *   ebp; ud register-held; real_fn 0x428cd0 cdecl 0 args returns the
 *   game singleton ptr; FULL-WORD null gate (`test edi,edi; je`) — nil
 *   path ret 1 WITHOUT wrapping; else newuserdata(L,8), ud[0] = vtable
 *   0xb753c8, ud[4] = obj, lua_rawgetp(L, REG 0xfff0b9d8, 0xc82a19)
 *   IAT 0xb183bc pushes the registered class object then
 *   lua_setmetatable(L,-2) IAT 0xb18398 attaches it to the ud; ret 1.
 * 0x898e00 "SFXManager" 32 insns ret 0x898e58 — same template,
 *   rawgetp key 0xc82a16, real_fn 0x420af0.
 * 0x898e70 "Game_0" 32 insns ret 0x898ec8 — same template, rawgetp key
 *   0xc82a13, real_fn 0x86fc60.
 * 0x898ee0 "RandomVector" 39 insns ret 0x898f4b body 0x6b — SIMPLE
 *   ebp; ud register-held (esi); real_fn 0x67f070 cdecl 1 arg &vec8
 *   fills {lo,hi}; newuserdata(L,0x10), ud[0] = vtable 0xb73574 (the
 *   v45 Vector tag), payload self-off +8 {lo,hi} copy from the vec
 *   locals; rawgetp(REG, 0xc82980) + setmetatable(-2) — class attach;
 *   ret 1. ALSO GetRandomPosition @0x86de02 — census row.
 * 0x898490 "GetRoomEntities" 23 insns ret 0x8984d6 body 0x46 — ud
 *   register-held; real_fn 0x86fb20 cdecl 1 arg &vec8 fills {L, ref}
 *   (createtable + luaL_ref INSIDE the host real_fn); call 0x6a80f0
 *   (this=&vec, arg1=L; shared 18-caller host helper: cdq sign-extend
 *   [this+4] -> lua_rawgeti(L, REG, key) IAT 0xb18318 — the helper's
 *   laws stay HOST, edge pin only) pushes the cached table;
 *   luaL_unref(L=vec.lo, LUA_REGISTRYINDEX 0xfff0b9d8, ref=vec.hi)
 *   IAT 0xb1831c releases the fresh ref, ret 1.
 *
 * Install sites (all ret-8; primary pair pinned per wrapper, extra
 * sites recorded as census rows in the notes):
 *   0x895c70 lit @0x895c87 RandomVector (caller 0x86dd1f)
 *   0x895cd0 lit @0x895ce1 Game_0      (caller 0x86dd30)
 *   0x895d30 lit @0x895d41 SFXManager  (caller 0x86dd41)
 *   0x895d90 lit @0x895da1 MusicManager(caller 0x86dd52)
 *   0x8961b0 lit @0x8961c1 GetRoomEntities (caller 0x86de46)
 *   0x896450 lit @0x896467 GetBuiltInCallbackState (caller 0x86dfef)
 *   0x8966f0 lit @0x896707 IsButtonTriggered (caller 0x86e115)
 *   0x896750 lit @0x896767 GetButtonValue (caller 0x86e137)
 * ----------------------------------------------------------------------- */
enum {
  ISAAC_LUA_V68_GETBUTTONVALUE_VA = 0x00897870u,
  ISAAC_LUA_V68_GETBUTTONVALUE_RET_VA = 0x008978c6u,
  ISAAC_LUA_V68_GETBUTTONVALUE_INSNS = 35, /* capstone TRUE body, ret inclusive */
  ISAAC_LUA_V68_GETBUTTONVALUE_TOUSERDATA_INDEX_U32 = 0xfff0b9d7u,
  ISAAC_LUA_V68_GETBUTTONVALUE_FN_OFF = 0x00u,
  ISAAC_LUA_V68_GETBUTTONVALUE_ARG0_CHECKINTEGER_INDEX_U32 = 0x01u,
  ISAAC_LUA_V68_GETBUTTONVALUE_ARG1_CHECKINTEGER_INDEX_U32 = 0x02u,
  ISAAC_LUA_V68_GETBUTTONVALUE_F32_SLOT_OFF_U32 = 0xffffffbcu, /* ebp-4 store-forward slot */
  ISAAC_LUA_V68_GETBUTTONVALUE_NUMBER_PUSH_VA = 0x0085c050u, /* pusher ROW 0 PUSHNUMBER_F32 */
  ISAAC_LUA_V68_GETBUTTONVALUE_IAT_LUA_TOUSERDATA = 0x00b183b0u,
  ISAAC_LUA_V68_GETBUTTONVALUE_IAT_LUA_CHECKINTEGER = 0x00b183f4u,
  ISAAC_LUA_V68_GETBUTTONVALUE_RETURN_VALUE = 1,
  ISAAC_LUA_V68_GETBUTTONVALUE_INSTALL_COUNT = 1
};

enum {
  ISAAC_LUA_V68_GETBUTTONVALUE_INSTALL_VA = 0x00896750u,
  ISAAC_LUA_V68_GETBUTTONVALUE_INSTALL_RET_VA = 0x008967a9u,
  ISAAC_LUA_V68_GETBUTTONVALUE_INSTALL_LITERAL_VA = 0x00896767u,
  ISAAC_LUA_V68_GETBUTTONVALUE_INSTALL_REAL_FN_VA = 0x0086fcd0u, /* Isaac global GetButtonValue, HOST */
  ISAAC_LUA_V68_GETBUTTONVALUE_INSTALL_NAME_VA = 0x00b75074u, /* "GetButtonValue" */
  ISAAC_LUA_V68_GETBUTTONVALUE_INSTALL_CALLER_VA = 0x0086e137u
};

enum {
  ISAAC_LUA_V68_ISBUTTONTRIGGERED_VA = 0x008978d0u,
  ISAAC_LUA_V68_ISBUTTONTRIGGERED_RET_VA = 0x00897923u,
  ISAAC_LUA_V68_ISBUTTONTRIGGERED_INSNS = 36,
  ISAAC_LUA_V68_ISBUTTONTRIGGERED_TOUSERDATA_INDEX_U32 = 0xfff0b9d7u,
  ISAAC_LUA_V68_ISBUTTONTRIGGERED_FN_OFF = 0x00u,
  ISAAC_LUA_V68_ISBUTTONTRIGGERED_ARG0_CHECKINTEGER_INDEX_U32 = 0x01u,
  ISAAC_LUA_V68_ISBUTTONTRIGGERED_ARG1_CHECKINTEGER_INDEX_U32 = 0x02u,
  ISAAC_LUA_V68_ISBUTTONTRIGGERED_IAT_LUA_TOUSERDATA = 0x00b183b0u,
  ISAAC_LUA_V68_ISBUTTONTRIGGERED_IAT_LUA_CHECKINTEGER = 0x00b183f4u,
  ISAAC_LUA_V68_ISBUTTONTRIGGERED_IAT_LUA_PUSHBOOLEAN = 0x00b183ecu,
  ISAAC_LUA_V68_ISBUTTONTRIGGERED_RETURN_VALUE = 1,
  ISAAC_LUA_V68_ISBUTTONTRIGGERED_INSTALL_COUNT = 1
};

enum {
  ISAAC_LUA_V68_ISBUTTONTRIGGERED_INSTALL_VA = 0x008966f0u,
  ISAAC_LUA_V68_ISBUTTONTRIGGERED_INSTALL_RET_VA = 0x00896749u,
  ISAAC_LUA_V68_ISBUTTONTRIGGERED_INSTALL_LITERAL_VA = 0x00896707u,
  ISAAC_LUA_V68_ISBUTTONTRIGGERED_INSTALL_REAL_FN_VA = 0x0086fc70u, /* HOST */
  ISAAC_LUA_V68_ISBUTTONTRIGGERED_INSTALL_NAME_VA = 0x00b75098u, /* "IsButtonTriggered" */
  ISAAC_LUA_V68_ISBUTTONTRIGGERED_INSTALL_CALLER_VA = 0x0086e115u
};

enum {
  ISAAC_LUA_V68_GETBUILTINCALLBACKSTATE_VA = 0x0089e300u,
  ISAAC_LUA_V68_GETBUILTINCALLBACKSTATE_RET_VA = 0x0089e343u,
  ISAAC_LUA_V68_GETBUILTINCALLBACKSTATE_INSNS = 29,
  ISAAC_LUA_V68_GETBUILTINCALLBACKSTATE_STACK_ALIGN_MASK = 0xfffffff8u, /* and esp,-8 */
  ISAAC_LUA_V68_GETBUILTINCALLBACKSTATE_TOUSERDATA_INDEX_U32 = 0xfff0b9d7u,
  ISAAC_LUA_V68_GETBUILTINCALLBACKSTATE_FN_OFF = 0x00u,
  ISAAC_LUA_V68_GETBUILTINCALLBACKSTATE_ARG0_CHECKINTEGER_INDEX_U32 = 0x01u,
  ISAAC_LUA_V68_GETBUILTINCALLBACKSTATE_IAT_LUA_TOUSERDATA = 0x00b183b0u,
  ISAAC_LUA_V68_GETBUILTINCALLBACKSTATE_IAT_LUA_CHECKINTEGER = 0x00b183f4u,
  ISAAC_LUA_V68_GETBUILTINCALLBACKSTATE_IAT_LUA_PUSHBOOLEAN = 0x00b183ecu,
  ISAAC_LUA_V68_GETBUILTINCALLBACKSTATE_RETURN_VALUE = 1,
  ISAAC_LUA_V68_GETBUILTINCALLBACKSTATE_INSTALL_COUNT = 1
};

enum {
  ISAAC_LUA_V68_GETBUILTINCALLBACKSTATE_INSTALL_VA = 0x00896450u,
  ISAAC_LUA_V68_GETBUILTINCALLBACKSTATE_INSTALL_RET_VA = 0x008964a9u,
  ISAAC_LUA_V68_GETBUILTINCALLBACKSTATE_INSTALL_LITERAL_VA = 0x00896467u,
  ISAAC_LUA_V68_GETBUILTINCALLBACKSTATE_INSTALL_REAL_FN_VA = 0x0086f4f0u, /* HOST */
  ISAAC_LUA_V68_GETBUILTINCALLBACKSTATE_INSTALL_NAME_VA = 0x00b74f20u, /* "GetBuiltInCallbackState" */
  ISAAC_LUA_V68_GETBUILTINCALLBACKSTATE_INSTALL_CALLER_VA = 0x0086dfefu
};

enum {
  ISAAC_LUA_V68_MUSICMANAGER_VA = 0x00898d90u,
  ISAAC_LUA_V68_MUSICMANAGER_RET_VA = 0x00898de8u,
  ISAAC_LUA_V68_MUSICMANAGER_INSNS = 32,
  ISAAC_LUA_V68_MUSICMANAGER_TOUSERDATA_INDEX_U32 = 0xfff0b9d7u,
  ISAAC_LUA_V68_MUSICMANAGER_FN_OFF = 0x00u,
  ISAAC_LUA_V68_MUSICMANAGER_NEWUSERDATA_SIZE = 0x08u,
  ISAAC_LUA_V68_MUSICMANAGER_UD_VTABLE_VA = 0x00b753c8u, /* ud[0] tag */
  ISAAC_LUA_V68_MUSICMANAGER_UD_OBJECT_OFF = 0x04u,
  ISAAC_LUA_V68_MUSICMANAGER_RAWGETP_KEY = 0x00c82a19u,
  ISAAC_LUA_V68_MUSICMANAGER_REGISTRY_INDEX_U32 = 0xfff0b9d8u,
  ISAAC_LUA_V68_MUSICMANAGER_SETMETA_INDEX_U32 = 0xfffffffeu, /* -2 */
  ISAAC_LUA_V68_MUSICMANAGER_IAT_LUA_TOUSERDATA = 0x00b183b0u,
  ISAAC_LUA_V68_MUSICMANAGER_IAT_LUA_NEWUSERDATA = 0x00b1839cu,
  ISAAC_LUA_V68_MUSICMANAGER_IAT_LUA_RAWGETP = 0x00b183bcu,
  ISAAC_LUA_V68_MUSICMANAGER_IAT_LUA_SETMETATABLE = 0x00b18398u,
  ISAAC_LUA_V68_MUSICMANAGER_RETURN_VALUE = 1,
  ISAAC_LUA_V68_MUSICMANAGER_INSTALL_COUNT = 1
};

enum {
  ISAAC_LUA_V68_MUSICMANAGER_INSTALL_VA = 0x00895d90u,
  ISAAC_LUA_V68_MUSICMANAGER_INSTALL_RET_VA = 0x00895de8u,
  ISAAC_LUA_V68_MUSICMANAGER_INSTALL_LITERAL_VA = 0x00895da1u,
  ISAAC_LUA_V68_MUSICMANAGER_INSTALL_REAL_FN_VA = 0x00428cd0u, /* game singleton accessor, HOST */
  ISAAC_LUA_V68_MUSICMANAGER_INSTALL_NAME_VA = 0x00b74c7cu, /* "MusicManager" */
  ISAAC_LUA_V68_MUSICMANAGER_INSTALL_CALLER_VA = 0x0086dd52u
};

enum {
  ISAAC_LUA_V68_SFXMANAGER_VA = 0x00898e00u,
  ISAAC_LUA_V68_SFXMANAGER_RET_VA = 0x00898e58u,
  ISAAC_LUA_V68_SFXMANAGER_INSNS = 32,
  ISAAC_LUA_V68_SFXMANAGER_TOUSERDATA_INDEX_U32 = 0xfff0b9d7u,
  ISAAC_LUA_V68_SFXMANAGER_FN_OFF = 0x00u,
  ISAAC_LUA_V68_SFXMANAGER_NEWUSERDATA_SIZE = 0x08u,
  ISAAC_LUA_V68_SFXMANAGER_UD_VTABLE_VA = 0x00b753c8u,
  ISAAC_LUA_V68_SFXMANAGER_UD_OBJECT_OFF = 0x04u,
  ISAAC_LUA_V68_SFXMANAGER_RAWGETP_KEY = 0x00c82a16u,
  ISAAC_LUA_V68_SFXMANAGER_REGISTRY_INDEX_U32 = 0xfff0b9d8u,
  ISAAC_LUA_V68_SFXMANAGER_SETMETA_INDEX_U32 = 0xfffffffeu,
  ISAAC_LUA_V68_SFXMANAGER_IAT_LUA_TOUSERDATA = 0x00b183b0u,
  ISAAC_LUA_V68_SFXMANAGER_IAT_LUA_NEWUSERDATA = 0x00b1839cu,
  ISAAC_LUA_V68_SFXMANAGER_IAT_LUA_RAWGETP = 0x00b183bcu,
  ISAAC_LUA_V68_SFXMANAGER_IAT_LUA_SETMETATABLE = 0x00b18398u,
  ISAAC_LUA_V68_SFXMANAGER_RETURN_VALUE = 1,
  ISAAC_LUA_V68_SFXMANAGER_INSTALL_COUNT = 1
};

enum {
  ISAAC_LUA_V68_SFXMANAGER_INSTALL_VA = 0x00895d30u,
  ISAAC_LUA_V68_SFXMANAGER_INSTALL_RET_VA = 0x00895d88u,
  ISAAC_LUA_V68_SFXMANAGER_INSTALL_LITERAL_VA = 0x00895d41u,
  ISAAC_LUA_V68_SFXMANAGER_INSTALL_REAL_FN_VA = 0x00420af0u, /* game singleton accessor, HOST */
  ISAAC_LUA_V68_SFXMANAGER_INSTALL_NAME_VA = 0x00b74be4u, /* "SFXManager" */
  ISAAC_LUA_V68_SFXMANAGER_INSTALL_CALLER_VA = 0x0086dd41u
};

enum {
  ISAAC_LUA_V68_GAME0_VA = 0x00898e70u,
  ISAAC_LUA_V68_GAME0_RET_VA = 0x00898ec8u,
  ISAAC_LUA_V68_GAME0_INSNS = 32,
  ISAAC_LUA_V68_GAME0_TOUSERDATA_INDEX_U32 = 0xfff0b9d7u,
  ISAAC_LUA_V68_GAME0_FN_OFF = 0x00u,
  ISAAC_LUA_V68_GAME0_NEWUSERDATA_SIZE = 0x08u,
  ISAAC_LUA_V68_GAME0_UD_VTABLE_VA = 0x00b753c8u,
  ISAAC_LUA_V68_GAME0_UD_OBJECT_OFF = 0x04u,
  ISAAC_LUA_V68_GAME0_RAWGETP_KEY = 0x00c82a13u,
  ISAAC_LUA_V68_GAME0_REGISTRY_INDEX_U32 = 0xfff0b9d8u,
  ISAAC_LUA_V68_GAME0_SETMETA_INDEX_U32 = 0xfffffffeu,
  ISAAC_LUA_V68_GAME0_IAT_LUA_TOUSERDATA = 0x00b183b0u,
  ISAAC_LUA_V68_GAME0_IAT_LUA_NEWUSERDATA = 0x00b1839cu,
  ISAAC_LUA_V68_GAME0_IAT_LUA_RAWGETP = 0x00b183bcu,
  ISAAC_LUA_V68_GAME0_IAT_LUA_SETMETATABLE = 0x00b18398u,
  ISAAC_LUA_V68_GAME0_RETURN_VALUE = 1,
  ISAAC_LUA_V68_GAME0_INSTALL_COUNT = 1
};

enum {
  ISAAC_LUA_V68_GAME0_INSTALL_VA = 0x00895cd0u,
  ISAAC_LUA_V68_GAME0_INSTALL_RET_VA = 0x00895d28u,
  ISAAC_LUA_V68_GAME0_INSTALL_LITERAL_VA = 0x00895ce1u,
  ISAAC_LUA_V68_GAME0_INSTALL_REAL_FN_VA = 0x0086fc60u, /* game singleton accessor, HOST */
  ISAAC_LUA_V68_GAME0_INSTALL_NAME_VA = 0x00b74d38u, /* "Game_0" */
  ISAAC_LUA_V68_GAME0_INSTALL_CALLER_VA = 0x0086dd30u
};

enum {
  ISAAC_LUA_V68_RANDOMVECTOR_VA = 0x00898ee0u,
  ISAAC_LUA_V68_RANDOMVECTOR_RET_VA = 0x00898f4bu,
  ISAAC_LUA_V68_RANDOMVECTOR_INSNS = 39,
  ISAAC_LUA_V68_RANDOMVECTOR_TOUSERDATA_INDEX_U32 = 0xfff0b9d7u,
  ISAAC_LUA_V68_RANDOMVECTOR_FN_OFF = 0x00u,
  ISAAC_LUA_V68_RANDOMVECTOR_NEWUSERDATA_SIZE = 0x10u,
  ISAAC_LUA_V68_RANDOMVECTOR_UD_VTABLE_VA = 0x00b73574u, /* the v45 Vector tag */
  ISAAC_LUA_V68_RANDOMVECTOR_UD_PAYLOAD_OFF = 0x08u,
  ISAAC_LUA_V68_RANDOMVECTOR_RAWGETP_KEY = 0x00c82980u, /* Vector class registry key (v45) */
  ISAAC_LUA_V68_RANDOMVECTOR_REGISTRY_INDEX_U32 = 0xfff0b9d8u,
  ISAAC_LUA_V68_RANDOMVECTOR_SETMETA_INDEX_U32 = 0xfffffffeu,
  ISAAC_LUA_V68_RANDOMVECTOR_IAT_LUA_TOUSERDATA = 0x00b183b0u,
  ISAAC_LUA_V68_RANDOMVECTOR_IAT_LUA_NEWUSERDATA = 0x00b1839cu,
  ISAAC_LUA_V68_RANDOMVECTOR_IAT_LUA_RAWGETP = 0x00b183bcu,
  ISAAC_LUA_V68_RANDOMVECTOR_IAT_LUA_SETMETATABLE = 0x00b18398u,
  ISAAC_LUA_V68_RANDOMVECTOR_RETURN_VALUE = 1,
  ISAAC_LUA_V68_RANDOMVECTOR_INSTALL_COUNT = 1
};

enum {
  ISAAC_LUA_V68_RANDOMVECTOR_INSTALL_VA = 0x00895c70u,
  ISAAC_LUA_V68_RANDOMVECTOR_INSTALL_RET_VA = 0x00895cc9u,
  ISAAC_LUA_V68_RANDOMVECTOR_INSTALL_LITERAL_VA = 0x00895c87u,
  ISAAC_LUA_V68_RANDOMVECTOR_INSTALL_REAL_FN_VA = 0x0067f070u, /* game rng helper, HOST */
  ISAAC_LUA_V68_RANDOMVECTOR_INSTALL_NAME_VA = 0x00b74d28u, /* "RandomVector" */
  ISAAC_LUA_V68_RANDOMVECTOR_INSTALL_CALLER_VA = 0x0086dd1fu
};

enum {
  ISAAC_LUA_V68_GETROOMENTITIES_VA = 0x00898490u,
  ISAAC_LUA_V68_GETROOMENTITIES_RET_VA = 0x008984d6u,
  ISAAC_LUA_V68_GETROOMENTITIES_INSNS = 23,
  ISAAC_LUA_V68_GETROOMENTITIES_TOUSERDATA_INDEX_U32 = 0xfff0b9d7u,
  ISAAC_LUA_V68_GETROOMENTITIES_FN_OFF = 0x00u,
  ISAAC_LUA_V68_GETROOMENTITIES_RAWGETI_HELPER_VA = 0x006a80f0u, /* shared 18-caller host helper (cdq -> lua_rawgeti 0xb18318); its laws stay HOST */
  ISAAC_LUA_V68_GETROOMENTITIES_REGISTRY_INDEX_U32 = 0xfff0b9d8u,
  ISAAC_LUA_V68_GETROOMENTITIES_VEC_OFF_LO_U32 = 0xfffffff8u, /* ebp-8 */
  ISAAC_LUA_V68_GETROOMENTITIES_VEC_OFF_REF_U32 = 0xfffffffcu, /* ebp-4 */
  ISAAC_LUA_V68_GETROOMENTITIES_IAT_LUA_TOUSERDATA = 0x00b183b0u,
  ISAAC_LUA_V68_GETROOMENTITIES_IAT_LUA_LUAL_UNREF = 0x00b1831cu,
  ISAAC_LUA_V68_GETROOMENTITIES_RETURN_VALUE = 1,
  ISAAC_LUA_V68_GETROOMENTITIES_INSTALL_COUNT = 1
};

enum {
  ISAAC_LUA_V68_GETROOMENTITIES_INSTALL_VA = 0x008961b0u,
  ISAAC_LUA_V68_GETROOMENTITIES_INSTALL_RET_VA = 0x00896208u,
  ISAAC_LUA_V68_GETROOMENTITIES_INSTALL_LITERAL_VA = 0x008961c1u,
  ISAAC_LUA_V68_GETROOMENTITIES_INSTALL_REAL_FN_VA = 0x0086fb20u, /* Isaac global GetRoomEntities, HOST */
  ISAAC_LUA_V68_GETROOMENTITIES_INSTALL_NAME_VA = 0x00b74dbcu, /* "GetRoomEntities" */
  ISAAC_LUA_V68_GETROOMENTITIES_INSTALL_CALLER_VA = 0x0086de46u
};

/* BYTE-GATED returns (the v67 IsEnabled/IsLayerEnabled law shape): PE
 * `test al,al; setne cl` @0x897907/@0x897909 (IsButtonTriggered) and
 * @0x89e329/@0x89e32b (GetBuiltInCallbackState) — the real_fn's AL
 * return byte -> lua_pushboolean(L, bool) IAT 0xb183ec; ret 1. The
 * gate law takes the FULL uint32 return word and tests (& 0xff) != 0
 * (NO uint8_t param). */
uint32_t isaac_lua_engine_v68_isbuttontriggered_return_gate(uint32_t real_fn_result);
uint32_t isaac_lua_engine_v68_getbuiltincallbackstate_return_gate(uint32_t real_fn_result);

/* FULL-WORD null gates for the three class-singleton closures: PE
 * `test edi,edi; je` @0x898dad (MusicManager) / @0x898e1d (SFXManager)
 * / @0x898e8d (Game_0) — the real_fn's FULL DWORD return decides the
 * wrap path (0 -> ret 1 with NO userdata). uint32 in/out, never
 * masked. */
uint32_t isaac_lua_engine_v68_musicmanager_null_gate(uint32_t real_fn_result);
uint32_t isaac_lua_engine_v68_sfxmanager_null_gate(uint32_t real_fn_result);
uint32_t isaac_lua_engine_v68_game0_null_gate(uint32_t real_fn_result);

/* v68 wrappers (per wrapper, mirroring the v67 shape). */
uint32_t isaac_lua_engine_v68_getbuttonvalue_va(void);
uint32_t isaac_lua_engine_v68_getbuttonvalue_ret_va(void);
uint32_t isaac_lua_engine_v68_getbuttonvalue_body_bytes(void);
int32_t isaac_lua_engine_v68_getbuttonvalue_insn_count(void);
uint32_t isaac_lua_engine_v68_getbuttonvalue_touserdata_index(void);
uint32_t isaac_lua_engine_v68_getbuttonvalue_fn_off(void);
uint32_t isaac_lua_engine_v68_getbuttonvalue_arg0_checkinteger_index(void);
uint32_t isaac_lua_engine_v68_getbuttonvalue_arg1_checkinteger_index(void);
uint32_t isaac_lua_engine_v68_getbuttonvalue_f32_slot_off(void);
uint32_t isaac_lua_engine_v68_getbuttonvalue_number_push_va(void);
uint32_t isaac_lua_engine_v68_getbuttonvalue_iat_lua_touserdata(void);
uint32_t isaac_lua_engine_v68_getbuttonvalue_iat_lua_checkinteger(void);
int32_t isaac_lua_engine_v68_getbuttonvalue_return_value(void);
int32_t isaac_lua_engine_v68_getbuttonvalue_install_count(void);
uint32_t isaac_lua_engine_v68_getbuttonvalue_install_va(void);
uint32_t isaac_lua_engine_v68_getbuttonvalue_install_ret_va(void);
uint32_t isaac_lua_engine_v68_getbuttonvalue_install_literal_va(void);
uint32_t isaac_lua_engine_v68_getbuttonvalue_install_real_fn_va(void);
uint32_t isaac_lua_engine_v68_getbuttonvalue_install_name_va(void);
uint32_t isaac_lua_engine_v68_getbuttonvalue_install_caller_va(void);

uint32_t isaac_lua_engine_v68_isbuttontriggered_va(void);
uint32_t isaac_lua_engine_v68_isbuttontriggered_ret_va(void);
uint32_t isaac_lua_engine_v68_isbuttontriggered_body_bytes(void);
int32_t isaac_lua_engine_v68_isbuttontriggered_insn_count(void);
uint32_t isaac_lua_engine_v68_isbuttontriggered_touserdata_index(void);
uint32_t isaac_lua_engine_v68_isbuttontriggered_fn_off(void);
uint32_t isaac_lua_engine_v68_isbuttontriggered_arg0_checkinteger_index(void);
uint32_t isaac_lua_engine_v68_isbuttontriggered_arg1_checkinteger_index(void);
uint32_t isaac_lua_engine_v68_isbuttontriggered_iat_lua_touserdata(void);
uint32_t isaac_lua_engine_v68_isbuttontriggered_iat_lua_checkinteger(void);
uint32_t isaac_lua_engine_v68_isbuttontriggered_iat_lua_pushboolean(void);
int32_t isaac_lua_engine_v68_isbuttontriggered_return_value(void);
int32_t isaac_lua_engine_v68_isbuttontriggered_install_count(void);
uint32_t isaac_lua_engine_v68_isbuttontriggered_install_va(void);
uint32_t isaac_lua_engine_v68_isbuttontriggered_install_ret_va(void);
uint32_t isaac_lua_engine_v68_isbuttontriggered_install_literal_va(void);
uint32_t isaac_lua_engine_v68_isbuttontriggered_install_real_fn_va(void);
uint32_t isaac_lua_engine_v68_isbuttontriggered_install_name_va(void);
uint32_t isaac_lua_engine_v68_isbuttontriggered_install_caller_va(void);

uint32_t isaac_lua_engine_v68_getbuiltincallbackstate_va(void);
uint32_t isaac_lua_engine_v68_getbuiltincallbackstate_ret_va(void);
uint32_t isaac_lua_engine_v68_getbuiltincallbackstate_body_bytes(void);
int32_t isaac_lua_engine_v68_getbuiltincallbackstate_insn_count(void);
uint32_t isaac_lua_engine_v68_getbuiltincallbackstate_stack_align_mask(void);
uint32_t isaac_lua_engine_v68_getbuiltincallbackstate_touserdata_index(void);
uint32_t isaac_lua_engine_v68_getbuiltincallbackstate_fn_off(void);
uint32_t isaac_lua_engine_v68_getbuiltincallbackstate_arg0_checkinteger_index(void);
uint32_t isaac_lua_engine_v68_getbuiltincallbackstate_iat_lua_touserdata(void);
uint32_t isaac_lua_engine_v68_getbuiltincallbackstate_iat_lua_checkinteger(void);
uint32_t isaac_lua_engine_v68_getbuiltincallbackstate_iat_lua_pushboolean(void);
int32_t isaac_lua_engine_v68_getbuiltincallbackstate_return_value(void);
int32_t isaac_lua_engine_v68_getbuiltincallbackstate_install_count(void);
uint32_t isaac_lua_engine_v68_getbuiltincallbackstate_install_va(void);
uint32_t isaac_lua_engine_v68_getbuiltincallbackstate_install_ret_va(void);
uint32_t isaac_lua_engine_v68_getbuiltincallbackstate_install_literal_va(void);
uint32_t isaac_lua_engine_v68_getbuiltincallbackstate_install_real_fn_va(void);
uint32_t isaac_lua_engine_v68_getbuiltincallbackstate_install_name_va(void);
uint32_t isaac_lua_engine_v68_getbuiltincallbackstate_install_caller_va(void);

uint32_t isaac_lua_engine_v68_musicmanager_va(void);
uint32_t isaac_lua_engine_v68_musicmanager_ret_va(void);
uint32_t isaac_lua_engine_v68_musicmanager_body_bytes(void);
int32_t isaac_lua_engine_v68_musicmanager_insn_count(void);
uint32_t isaac_lua_engine_v68_musicmanager_touserdata_index(void);
uint32_t isaac_lua_engine_v68_musicmanager_fn_off(void);
uint32_t isaac_lua_engine_v68_musicmanager_newuserdata_size(void);
uint32_t isaac_lua_engine_v68_musicmanager_ud_vtable_va(void);
uint32_t isaac_lua_engine_v68_musicmanager_ud_object_off(void);
uint32_t isaac_lua_engine_v68_musicmanager_rawgetp_key(void);
uint32_t isaac_lua_engine_v68_musicmanager_registry_index(void);
uint32_t isaac_lua_engine_v68_musicmanager_setmeta_index(void);
uint32_t isaac_lua_engine_v68_musicmanager_iat_lua_touserdata(void);
uint32_t isaac_lua_engine_v68_musicmanager_iat_lua_newuserdata(void);
uint32_t isaac_lua_engine_v68_musicmanager_iat_lua_rawgetp(void);
uint32_t isaac_lua_engine_v68_musicmanager_iat_lua_setmetatable(void);
int32_t isaac_lua_engine_v68_musicmanager_return_value(void);
int32_t isaac_lua_engine_v68_musicmanager_install_count(void);
uint32_t isaac_lua_engine_v68_musicmanager_install_va(void);
uint32_t isaac_lua_engine_v68_musicmanager_install_ret_va(void);
uint32_t isaac_lua_engine_v68_musicmanager_install_literal_va(void);
uint32_t isaac_lua_engine_v68_musicmanager_install_real_fn_va(void);
uint32_t isaac_lua_engine_v68_musicmanager_install_name_va(void);
uint32_t isaac_lua_engine_v68_musicmanager_install_caller_va(void);

uint32_t isaac_lua_engine_v68_sfxmanager_va(void);
uint32_t isaac_lua_engine_v68_sfxmanager_ret_va(void);
uint32_t isaac_lua_engine_v68_sfxmanager_body_bytes(void);
int32_t isaac_lua_engine_v68_sfxmanager_insn_count(void);
uint32_t isaac_lua_engine_v68_sfxmanager_touserdata_index(void);
uint32_t isaac_lua_engine_v68_sfxmanager_fn_off(void);
uint32_t isaac_lua_engine_v68_sfxmanager_newuserdata_size(void);
uint32_t isaac_lua_engine_v68_sfxmanager_ud_vtable_va(void);
uint32_t isaac_lua_engine_v68_sfxmanager_ud_object_off(void);
uint32_t isaac_lua_engine_v68_sfxmanager_rawgetp_key(void);
uint32_t isaac_lua_engine_v68_sfxmanager_registry_index(void);
uint32_t isaac_lua_engine_v68_sfxmanager_setmeta_index(void);
uint32_t isaac_lua_engine_v68_sfxmanager_iat_lua_touserdata(void);
uint32_t isaac_lua_engine_v68_sfxmanager_iat_lua_newuserdata(void);
uint32_t isaac_lua_engine_v68_sfxmanager_iat_lua_rawgetp(void);
uint32_t isaac_lua_engine_v68_sfxmanager_iat_lua_setmetatable(void);
int32_t isaac_lua_engine_v68_sfxmanager_return_value(void);
int32_t isaac_lua_engine_v68_sfxmanager_install_count(void);
uint32_t isaac_lua_engine_v68_sfxmanager_install_va(void);
uint32_t isaac_lua_engine_v68_sfxmanager_install_ret_va(void);
uint32_t isaac_lua_engine_v68_sfxmanager_install_literal_va(void);
uint32_t isaac_lua_engine_v68_sfxmanager_install_real_fn_va(void);
uint32_t isaac_lua_engine_v68_sfxmanager_install_name_va(void);
uint32_t isaac_lua_engine_v68_sfxmanager_install_caller_va(void);

uint32_t isaac_lua_engine_v68_game0_va(void);
uint32_t isaac_lua_engine_v68_game0_ret_va(void);
uint32_t isaac_lua_engine_v68_game0_body_bytes(void);
int32_t isaac_lua_engine_v68_game0_insn_count(void);
uint32_t isaac_lua_engine_v68_game0_touserdata_index(void);
uint32_t isaac_lua_engine_v68_game0_fn_off(void);
uint32_t isaac_lua_engine_v68_game0_newuserdata_size(void);
uint32_t isaac_lua_engine_v68_game0_ud_vtable_va(void);
uint32_t isaac_lua_engine_v68_game0_ud_object_off(void);
uint32_t isaac_lua_engine_v68_game0_rawgetp_key(void);
uint32_t isaac_lua_engine_v68_game0_registry_index(void);
uint32_t isaac_lua_engine_v68_game0_setmeta_index(void);
uint32_t isaac_lua_engine_v68_game0_iat_lua_touserdata(void);
uint32_t isaac_lua_engine_v68_game0_iat_lua_newuserdata(void);
uint32_t isaac_lua_engine_v68_game0_iat_lua_rawgetp(void);
uint32_t isaac_lua_engine_v68_game0_iat_lua_setmetatable(void);
int32_t isaac_lua_engine_v68_game0_return_value(void);
int32_t isaac_lua_engine_v68_game0_install_count(void);
uint32_t isaac_lua_engine_v68_game0_install_va(void);
uint32_t isaac_lua_engine_v68_game0_install_ret_va(void);
uint32_t isaac_lua_engine_v68_game0_install_literal_va(void);
uint32_t isaac_lua_engine_v68_game0_install_real_fn_va(void);
uint32_t isaac_lua_engine_v68_game0_install_name_va(void);
uint32_t isaac_lua_engine_v68_game0_install_caller_va(void);

uint32_t isaac_lua_engine_v68_randomvector_va(void);
uint32_t isaac_lua_engine_v68_randomvector_ret_va(void);
uint32_t isaac_lua_engine_v68_randomvector_body_bytes(void);
int32_t isaac_lua_engine_v68_randomvector_insn_count(void);
uint32_t isaac_lua_engine_v68_randomvector_touserdata_index(void);
uint32_t isaac_lua_engine_v68_randomvector_fn_off(void);
uint32_t isaac_lua_engine_v68_randomvector_newuserdata_size(void);
uint32_t isaac_lua_engine_v68_randomvector_ud_vtable_va(void);
uint32_t isaac_lua_engine_v68_randomvector_ud_payload_off(void);
uint32_t isaac_lua_engine_v68_randomvector_rawgetp_key(void);
uint32_t isaac_lua_engine_v68_randomvector_registry_index(void);
uint32_t isaac_lua_engine_v68_randomvector_setmeta_index(void);
uint32_t isaac_lua_engine_v68_randomvector_iat_lua_touserdata(void);
uint32_t isaac_lua_engine_v68_randomvector_iat_lua_newuserdata(void);
uint32_t isaac_lua_engine_v68_randomvector_iat_lua_rawgetp(void);
uint32_t isaac_lua_engine_v68_randomvector_iat_lua_setmetatable(void);
int32_t isaac_lua_engine_v68_randomvector_return_value(void);
int32_t isaac_lua_engine_v68_randomvector_install_count(void);
uint32_t isaac_lua_engine_v68_randomvector_install_va(void);
uint32_t isaac_lua_engine_v68_randomvector_install_ret_va(void);
uint32_t isaac_lua_engine_v68_randomvector_install_literal_va(void);
uint32_t isaac_lua_engine_v68_randomvector_install_real_fn_va(void);
uint32_t isaac_lua_engine_v68_randomvector_install_name_va(void);
uint32_t isaac_lua_engine_v68_randomvector_install_caller_va(void);

uint32_t isaac_lua_engine_v68_getromentities_va(void);
uint32_t isaac_lua_engine_v68_getromentities_ret_va(void);
uint32_t isaac_lua_engine_v68_getromentities_body_bytes(void);
int32_t isaac_lua_engine_v68_getromentities_insn_count(void);
uint32_t isaac_lua_engine_v68_getromentities_touserdata_index(void);
uint32_t isaac_lua_engine_v68_getromentities_fn_off(void);
uint32_t isaac_lua_engine_v68_getromentities_rawgeti_helper_va(void);
uint32_t isaac_lua_engine_v68_getromentities_registry_index(void);
uint32_t isaac_lua_engine_v68_getromentities_vec_off_lo(void);
uint32_t isaac_lua_engine_v68_getromentities_vec_off_ref(void);
uint32_t isaac_lua_engine_v68_getromentities_iat_lua_touserdata(void);
uint32_t isaac_lua_engine_v68_getromentities_iat_lua_lual_unref(void);
int32_t isaac_lua_engine_v68_getromentities_return_value(void);
int32_t isaac_lua_engine_v68_getromentities_install_count(void);
uint32_t isaac_lua_engine_v68_getromentities_install_va(void);
uint32_t isaac_lua_engine_v68_getromentities_install_ret_va(void);
uint32_t isaac_lua_engine_v68_getromentities_install_literal_va(void);
uint32_t isaac_lua_engine_v68_getromentities_install_real_fn_va(void);
uint32_t isaac_lua_engine_v68_getromentities_install_name_va(void);
uint32_t isaac_lua_engine_v68_getromentities_install_caller_va(void);
/* ---------------------------------------------------------------------------
 * ABI v69 - the 13 remaining fourth-region wrapper bodies under ONE bump
 * (v68 precedent). Shared laws (13/13): NO lua_type gate, NO 0x85c590 check
 * helper; direct lua_touserdata(L, 0xfff0b9d7) IAT 0xb183b0; real_fn = ud[0]
 * (FN_OFF 0); every gate/word uint32_t. SEH bodies are bounded-peel: the
 * pure string/ref prefix is modelled; the SEH spine is exported as glue
 * constants (handler VA / cookie 0xbf93b4 / security check 0xaef12b /
 * try-level -1). Host edge pins stay host: 0x6a80f0 (18-caller rawgeti
 * helper), 0x8b9ff0 / 0x8b9ee0 / 0x8ba0c0 / 0x8ba7c0 (string/ref builders),
 * 0x40cf50 / 0x40d040 (string copy ctor/dtor), 0x40ccd0 (string assign),
 * 0x85c590 (check helper), 0x8baa50 (getArgObject), the v53/v55 pusher rows
 * (0x85bfd0 ROW 3 PUSHINT_I32_SEXT, 0x85bff0 ROW 1 PUSHINT_U32) and the
 * runtime tails 0xaef12b / 0xaef15c.
 * Installers: ret-8 blocks of the 0x60-stride template (block 0 = REG-held:
 * name [ebp+8], real_fn [ebp+0xc]; interior blocks = SINGLE_IMM body
 * immediates). LEA-corrected caller census: every record is the 17-byte
 * `push fn; push name; mov ecx,<ref>; call` (5+5+2+5); the Get*ByName run
 * 0x86de68..0x86df23 is 11 records, not 12 (v68 handoff said x12; corrected).
 * identify-zhl: LuaEngine::Isaac_GetItemIdByName 0x86f640, Seeds::String2Seed
 * 0x9eb6b0; no wrapper has an exact match. 0x8c2850 TimeCounter stays
 * untranslated (real_fn literal 0x264fc is not an image VA; table-dispatch
 * by obj; census row only). See section-notes/lua-v69-8b9b20/NOTES.md.
 *
 * 0x008983e0 "Get*ByName x11 (GetEntityTypeByName .. GetMusicIdByName)" 56 insns ret 0x00898483
 * 0x00899440 "GetTextWidth/String2Seed (same template, pusher ROW 1)" 55 insns ret 0x008994e3
 * 0x00898cf0 "DebugString/ConsoleOutput (same template, NO pusher)" 51 insns ret 0x00898d85
 * 0x008981b0 "ExecuteCommand (pushlstring tail)" 80 insns ret 0x0089829b
 * 0x008982a0 "GetPlayerTypeByName (bool lane + ROW 3)" 100 insns ret 0x008983de
 * 0x00898c00 "Spawn (6-arg builder + entity wrap)" 82 insns ret 0x00898cc8
 * 0x00898ae0 "GridSpawn (bool+ints+vec2, key 0xc82a1e)" 98 insns ret 0x00898be5
 * 0x00898890 "RenderText (str + 6 float lanes, ret 0)" 155 insns ret 0x00898ad2
 * 0x008b90e0 "UpdateStrangeAttractor (check helper + float lanes)" 74 insns ret 0x008b91c0
 * 0x00897a10 "RemoveModData (ref-pair + unrefs, ret 0)" 79 insns ret 0x00897af2
 * 0x00897b00 "HasModData (byte gate pushboolean)" 90 insns ret 0x00897bfe
 * 0x00897c00 "LoadModData (pushlstring tail)" 115 insns ret 0x00897d4d
 * 0x00897d50 "SaveModData (pushvalue+ref pair, ret 0)" 136 insns ret 0x00897eff
 * ------------------------------------------------------------------------ */
enum {
  ISAAC_LUA_V69_GETBYNAME_VA = 0x008983e0u,
  ISAAC_LUA_V69_GETBYNAME_RET_VA = 0x00898483u,
  ISAAC_LUA_V69_GETBYNAME_INSNS = 56,
  ISAAC_LUA_V69_GETBYNAME_TOUSERDATA_INDEX_U32 = 0xfff0b9d7u,
  ISAAC_LUA_V69_GETBYNAME_FN_OFF = 0x00000000u,
  ISAAC_LUA_V69_GETBYNAME_IAT_LUA_TOUSERDATA = 0x00b183b0u,
  ISAAC_LUA_V69_GETBYNAME_SEH_HANDLER_VA = 0x00b051e5u,
  ISAAC_LUA_V69_GETBYNAME_CHECK_STRING_BUILDER_VA = 0x008b9ff0u, /* host pin */
  ISAAC_LUA_V69_GETBYNAME_STRING_COPY_CTOR_VA = 0x0040cf50u, /* host */
  ISAAC_LUA_V69_GETBYNAME_STRING_DTOR_VA = 0x0040d040u, /* host */
  ISAAC_LUA_V69_GETBYNAME_REAL_FN_ARG_COUNT = 0x00000001u,
  ISAAC_LUA_V69_GETBYNAME_REAL_FN_CLEANUP = 0x00000004u,
  ISAAC_LUA_V69_GETBYNAME_PUSHER_VA = 0x0085bfd0u, /* ROW 3 */
  ISAAC_LUA_V69_GETBYNAME_PUSHER_ROW = 0x00000003u,
  ISAAC_LUA_V69_GETBYNAME_RETURN_VALUE = 1,
  ISAAC_LUA_V69_GETBYNAME_INSTALL_COUNT = 11,
  ISAAC_LUA_V69_GETBYNAME_INSTALL_VA = 0x00896210u,
  ISAAC_LUA_V69_GETBYNAME_INSTALL_RET_VA = 0x00896269u,
  ISAAC_LUA_V69_GETBYNAME_INSTALL_LITERAL_VA = 0x00896227u,
  ISAAC_LUA_V69_GETBYNAME_INSTALL_REAL_FN_VA = 0x0086f520u, /* HOST */
  ISAAC_LUA_V69_GETBYNAME_INSTALL_NAME_VA = 0x00b74d94u,
  ISAAC_LUA_V69_GETBYNAME_INSTALL_CALLER_VA = 0x0086de68u,
};

enum {
  ISAAC_LUA_V69_GETTEXTWIDTH_VA = 0x00899440u,
  ISAAC_LUA_V69_GETTEXTWIDTH_RET_VA = 0x008994e3u,
  ISAAC_LUA_V69_GETTEXTWIDTH_INSNS = 55,
  ISAAC_LUA_V69_GETTEXTWIDTH_TOUSERDATA_INDEX_U32 = 0xfff0b9d7u,
  ISAAC_LUA_V69_GETTEXTWIDTH_FN_OFF = 0x00000000u,
  ISAAC_LUA_V69_GETTEXTWIDTH_IAT_LUA_TOUSERDATA = 0x00b183b0u,
  ISAAC_LUA_V69_GETTEXTWIDTH_SEH_HANDLER_VA = 0x00b051e5u,
  ISAAC_LUA_V69_GETTEXTWIDTH_CHECK_STRING_BUILDER_VA = 0x008b9ff0u, /* host pin */
  ISAAC_LUA_V69_GETTEXTWIDTH_STRING_COPY_CTOR_VA = 0x0040cf50u, /* host */
  ISAAC_LUA_V69_GETTEXTWIDTH_STRING_DTOR_VA = 0x0040d040u, /* host */
  ISAAC_LUA_V69_GETTEXTWIDTH_REAL_FN_ARG_COUNT = 0x00000001u,
  ISAAC_LUA_V69_GETTEXTWIDTH_REAL_FN_CLEANUP = 0x00000004u,
  ISAAC_LUA_V69_GETTEXTWIDTH_PUSHER_VA = 0x0085bff0u, /* ROW 1 */
  ISAAC_LUA_V69_GETTEXTWIDTH_PUSHER_ROW = 0x00000001u,
  ISAAC_LUA_V69_GETTEXTWIDTH_RETURN_VALUE = 1,
  ISAAC_LUA_V69_GETTEXTWIDTH_INSTALL_COUNT = 2,
  ISAAC_LUA_V69_GETTEXTWIDTH_INSTALL_A_VA = 0x00896030u,
  ISAAC_LUA_V69_GETTEXTWIDTH_INSTALL_A_RET_VA = 0x00896088u,
  ISAAC_LUA_V69_GETTEXTWIDTH_INSTALL_A_LITERAL_VA = 0x00896041u,
  ISAAC_LUA_V69_GETTEXTWIDTH_INSTALL_A_REAL_FN_VA = 0x0086f370u, /* HOST */
  ISAAC_LUA_V69_GETTEXTWIDTH_INSTALL_A_NAME_VA = 0x00b74dccu,
  ISAAC_LUA_V69_GETTEXTWIDTH_INSTALL_A_CALLER_VA = 0x0086ddf1u,
  ISAAC_LUA_V69_GETTEXTWIDTH_INSTALL_B_VA = 0x00892f80u,
  ISAAC_LUA_V69_GETTEXTWIDTH_INSTALL_B_RET_VA = 0x00892fd8u,
  ISAAC_LUA_V69_GETTEXTWIDTH_INSTALL_B_LITERAL_VA = 0x00892f91u,
  ISAAC_LUA_V69_GETTEXTWIDTH_INSTALL_B_REAL_FN_VA = 0x009eb6b0u, /* HOST */
  ISAAC_LUA_V69_GETTEXTWIDTH_INSTALL_B_NAME_VA = 0x00b74418u,
  ISAAC_LUA_V69_GETTEXTWIDTH_INSTALL_B_CALLER_VA = 0x0086d067u,
};

enum {
  ISAAC_LUA_V69_DEBUGSTRING_VA = 0x00898cf0u,
  ISAAC_LUA_V69_DEBUGSTRING_RET_VA = 0x00898d85u,
  ISAAC_LUA_V69_DEBUGSTRING_INSNS = 51,
  ISAAC_LUA_V69_DEBUGSTRING_TOUSERDATA_INDEX_U32 = 0xfff0b9d7u,
  ISAAC_LUA_V69_DEBUGSTRING_FN_OFF = 0x00000000u,
  ISAAC_LUA_V69_DEBUGSTRING_IAT_LUA_TOUSERDATA = 0x00b183b0u,
  ISAAC_LUA_V69_DEBUGSTRING_SEH_HANDLER_VA = 0x00b051e5u,
  ISAAC_LUA_V69_DEBUGSTRING_CHECK_STRING_BUILDER_VA = 0x008b9ff0u, /* host pin */
  ISAAC_LUA_V69_DEBUGSTRING_STRING_COPY_CTOR_VA = 0x0040cf50u, /* host */
  ISAAC_LUA_V69_DEBUGSTRING_STRING_DTOR_VA = 0x0040d040u, /* host */
  ISAAC_LUA_V69_DEBUGSTRING_REAL_FN_ARG_COUNT = 0x00000001u,
  ISAAC_LUA_V69_DEBUGSTRING_REAL_FN_CLEANUP = 0x00000004u,
  ISAAC_LUA_V69_DEBUGSTRING_PUSHER_VA = 0x00000000u, /* ROW 4294967295 */
  ISAAC_LUA_V69_DEBUGSTRING_PUSHER_ROW = 0xffffffffu,
  ISAAC_LUA_V69_DEBUGSTRING_RETURN_VALUE = 0,
  ISAAC_LUA_V69_DEBUGSTRING_INSTALL_COUNT = 2,
  ISAAC_LUA_V69_DEBUGSTRING_INSTALL_A_VA = 0x00895df0u,
  ISAAC_LUA_V69_DEBUGSTRING_INSTALL_A_RET_VA = 0x00895e49u,
  ISAAC_LUA_V69_DEBUGSTRING_INSTALL_A_LITERAL_VA = 0x00895e07u,
  ISAAC_LUA_V69_DEBUGSTRING_INSTALL_A_REAL_FN_VA = 0x0086ef30u, /* HOST */
  ISAAC_LUA_V69_DEBUGSTRING_INSTALL_A_NAME_VA = 0x00b74d10u,
  ISAAC_LUA_V69_DEBUGSTRING_INSTALL_A_CALLER_VA = 0x0086dd7au,
  ISAAC_LUA_V69_DEBUGSTRING_INSTALL_B_VA = 0x00895df0u,
  ISAAC_LUA_V69_DEBUGSTRING_INSTALL_B_RET_VA = 0x00895e49u,
  ISAAC_LUA_V69_DEBUGSTRING_INSTALL_B_LITERAL_VA = 0x00895e07u,
  ISAAC_LUA_V69_DEBUGSTRING_INSTALL_B_REAL_FN_VA = 0x00870130u, /* HOST */
  ISAAC_LUA_V69_DEBUGSTRING_INSTALL_B_NAME_VA = 0x00b74edcu,
  ISAAC_LUA_V69_DEBUGSTRING_INSTALL_B_CALLER_VA = 0x0086df56u,
};

enum {
  ISAAC_LUA_V69_EXECUTECOMMAND_VA = 0x008981b0u,
  ISAAC_LUA_V69_EXECUTECOMMAND_RET_VA = 0x0089829bu,
  ISAAC_LUA_V69_EXECUTECOMMAND_INSNS = 80,
  ISAAC_LUA_V69_EXECUTECOMMAND_TOUSERDATA_INDEX_U32 = 0xfff0b9d7u,
  ISAAC_LUA_V69_EXECUTECOMMAND_FN_OFF = 0x00000000u,
  ISAAC_LUA_V69_EXECUTECOMMAND_IAT_LUA_TOUSERDATA = 0x00b183b0u,
  ISAAC_LUA_V69_EXECUTECOMMAND_SEH_HANDLER_VA = 0x00b05155u,
  ISAAC_LUA_V69_EXECUTECOMMAND_CHECK_STRING_BUILDER_VA = 0x008b9ff0u, /* host pin */
  ISAAC_LUA_V69_EXECUTECOMMAND_STRING_COPY_CTOR_VA = 0x0040cf50u, /* host */
  ISAAC_LUA_V69_EXECUTECOMMAND_STRING_DTOR_VA = 0x0040d040u, /* host */
  ISAAC_LUA_V69_EXECUTECOMMAND_REAL_FN_ARG_COUNT = 0x00000002u,
  ISAAC_LUA_V69_EXECUTECOMMAND_REAL_FN_CLEANUP = 0x00000008u,
  ISAAC_LUA_V69_EXECUTECOMMAND_IAT_LUA_PUSHLSTRING = 0x00b183dcu, /* lua_pushlstring */
  ISAAC_LUA_V69_EXECUTECOMMAND_SSO_CAP_U32 = 0x00000010u,
  ISAAC_LUA_V69_EXECUTECOMMAND_RETURN_VALUE = 1,
  ISAAC_LUA_V69_EXECUTECOMMAND_INSTALL_COUNT = 1,
  ISAAC_LUA_V69_EXECUTECOMMAND_INSTALL_VA = 0x008962d0u,
  ISAAC_LUA_V69_EXECUTECOMMAND_INSTALL_RET_VA = 0x00896328u,
  ISAAC_LUA_V69_EXECUTECOMMAND_INSTALL_LITERAL_VA = 0x008962e1u,
  ISAAC_LUA_V69_EXECUTECOMMAND_INSTALL_REAL_FN_VA = 0x00870020u, /* HOST */
  ISAAC_LUA_V69_EXECUTECOMMAND_INSTALL_NAME_VA = 0x00b74eccu,
  ISAAC_LUA_V69_EXECUTECOMMAND_INSTALL_CALLER_VA = 0x0086df45u,
};

enum {
  ISAAC_LUA_V69_GETPLAYERTYPEBYNAME_VA = 0x008982a0u,
  ISAAC_LUA_V69_GETPLAYERTYPEBYNAME_RET_VA = 0x008983deu,
  ISAAC_LUA_V69_GETPLAYERTYPEBYNAME_INSNS = 100,
  ISAAC_LUA_V69_GETPLAYERTYPEBYNAME_TOUSERDATA_INDEX_U32 = 0xfff0b9d7u,
  ISAAC_LUA_V69_GETPLAYERTYPEBYNAME_FN_OFF = 0x00000000u,
  ISAAC_LUA_V69_GETPLAYERTYPEBYNAME_IAT_LUA_TOUSERDATA = 0x00b183b0u,
  ISAAC_LUA_V69_GETPLAYERTYPEBYNAME_SEH_HANDLER_VA = 0x00b0519du,
  ISAAC_LUA_V69_GETPLAYERTYPEBYNAME_CHECKLSTRING_IAT_VA = 0x00b183e4u, /* luaL_checklstring */
  ISAAC_LUA_V69_GETPLAYERTYPEBYNAME_CHECKLSTRING_INDEX_U32 = 0x00000001u,
  ISAAC_LUA_V69_GETPLAYERTYPEBYNAME_STRING_ASSIGN_VA = 0x0040ccd0u, /* host */
  ISAAC_LUA_V69_GETPLAYERTYPEBYNAME_TOBOOLEAN_IAT_VA = 0x00b183e8u, /* lua_toboolean */
  ISAAC_LUA_V69_GETPLAYERTYPEBYNAME_TOBOOLEAN_INDEX_U32 = 0x00000002u,
  ISAAC_LUA_V69_GETPLAYERTYPEBYNAME_BYTE_GATE_OFF_U32 = 0xffffffbau, /* ebp-0x46 */
  ISAAC_LUA_V69_GETPLAYERTYPEBYNAME_WORD_SLOT_OFF_U32 = 0xfffffff4u, /* ebp-0x2c */
  ISAAC_LUA_V69_GETPLAYERTYPEBYNAME_PUSHER_VA = 0x0085bfd0u, /* ROW 3 */
  ISAAC_LUA_V69_GETPLAYERTYPEBYNAME_PUSHER_ROW = 0x00000003u,
  ISAAC_LUA_V69_GETPLAYERTYPEBYNAME_COPY_CTOR_VA = 0x0040cf50u, /* host */
  ISAAC_LUA_V69_GETPLAYERTYPEBYNAME_DTOR_VA = 0x0040d040u, /* host */
  ISAAC_LUA_V69_GETPLAYERTYPEBYNAME_REAL_FN_ARG_COUNT = 0x00000002u,
  ISAAC_LUA_V69_GETPLAYERTYPEBYNAME_REAL_FN_CLEANUP = 0x00000008u,
  ISAAC_LUA_V69_GETPLAYERTYPEBYNAME_RETURN_VALUE = 1,
  ISAAC_LUA_V69_GETPLAYERTYPEBYNAME_INSTALL_COUNT = 1,
  ISAAC_LUA_V69_GETPLAYERTYPEBYNAME_INSTALL_VA = 0x00896270u,
  ISAAC_LUA_V69_GETPLAYERTYPEBYNAME_INSTALL_RET_VA = 0x008962c8u,
  ISAAC_LUA_V69_GETPLAYERTYPEBYNAME_INSTALL_LITERAL_VA = 0x00896281u,
  ISAAC_LUA_V69_GETPLAYERTYPEBYNAME_INSTALL_REAL_FN_VA = 0x0086f760u, /* HOST */
  ISAAC_LUA_V69_GETPLAYERTYPEBYNAME_INSTALL_NAME_VA = 0x00b74e6cu,
  ISAAC_LUA_V69_GETPLAYERTYPEBYNAME_INSTALL_CALLER_VA = 0x0086de9bu,
};

enum {
  ISAAC_LUA_V69_SPAWN_VA = 0x00898c00u,
  ISAAC_LUA_V69_SPAWN_RET_VA = 0x00898cc8u,
  ISAAC_LUA_V69_SPAWN_INSNS = 82,
  ISAAC_LUA_V69_SPAWN_TOUSERDATA_INDEX_U32 = 0xfff0b9d7u,
  ISAAC_LUA_V69_SPAWN_FN_OFF = 0x00000000u,
  ISAAC_LUA_V69_SPAWN_IAT_LUA_TOUSERDATA = 0x00b183b0u,
  ISAAC_LUA_V69_SPAWN_BUILDER_VA = 0x008b9ee0u, /* host pin */
  ISAAC_LUA_V69_SPAWN_REAL_FN_ARG_COUNT = 0x00000006u,
  ISAAC_LUA_V69_SPAWN_REAL_FN_CLEANUP = 0x00000018u,
  ISAAC_LUA_V69_SPAWN_NEWUSERDATA_SIZE = 0x00000008u,
  ISAAC_LUA_V69_SPAWN_UD_VTABLE_VA = 0x00b753c8u,
  ISAAC_LUA_V69_SPAWN_UD_OBJECT_OFF = 0x00000004u,
  ISAAC_LUA_V69_SPAWN_RAWGETP_KEY = 0x00c8297au,
  ISAAC_LUA_V69_SPAWN_REGISTRY_INDEX_U32 = 0xfff0b9d8u,
  ISAAC_LUA_V69_SPAWN_SETMETA_INDEX_U32 = 0xfffffffeu,
  ISAAC_LUA_V69_SPAWN_IAT_LUA_NEWUSERDATA = 0x00b1839cu,
  ISAAC_LUA_V69_SPAWN_IAT_LUA_RAWGETP = 0x00b183bcu,
  ISAAC_LUA_V69_SPAWN_IAT_LUA_SETMETATABLE = 0x00b18398u,
  ISAAC_LUA_V69_SPAWN_IAT_LUA_PUSHNIL = 0x00b183e0u, /* lua_pushnil */
  ISAAC_LUA_V69_SPAWN_RETURN_VALUE = 1,
  ISAAC_LUA_V69_SPAWN_INSTALL_COUNT = 1,
  ISAAC_LUA_V69_SPAWN_INSTALL_VA = 0x00895eb0u,
  ISAAC_LUA_V69_SPAWN_INSTALL_RET_VA = 0x00895f08u,
  ISAAC_LUA_V69_SPAWN_INSTALL_LITERAL_VA = 0x00895ec1u,
  ISAAC_LUA_V69_SPAWN_INSTALL_REAL_FN_VA = 0x0086f0a0u, /* HOST */
  ISAAC_LUA_V69_SPAWN_INSTALL_NAME_VA = 0x00b1de50u,
  ISAAC_LUA_V69_SPAWN_INSTALL_CALLER_VA = 0x0086ddadu,
};

enum {
  ISAAC_LUA_V69_GRIDSPAWN_VA = 0x00898ae0u,
  ISAAC_LUA_V69_GRIDSPAWN_RET_VA = 0x00898be5u,
  ISAAC_LUA_V69_GRIDSPAWN_INSNS = 98,
  ISAAC_LUA_V69_GRIDSPAWN_TOUSERDATA_INDEX_U32 = 0xfff0b9d7u,
  ISAAC_LUA_V69_GRIDSPAWN_FN_OFF = 0x00000000u,
  ISAAC_LUA_V69_GRIDSPAWN_IAT_LUA_TOUSERDATA = 0x00b183b0u,
  ISAAC_LUA_V69_GRIDSPAWN_TOBOOLEAN_IAT_VA = 0x00b183e8u, /* lua_toboolean */
  ISAAC_LUA_V69_GRIDSPAWN_TOBOOLEAN_INDEX_U32 = 0x00000004u,
  ISAAC_LUA_V69_GRIDSPAWN_CHECKINTEGER_IAT_VA = 0x00b183f4u, /* luaL_checkinteger */
  ISAAC_LUA_V69_GRIDSPAWN_ARG1_CHECKINTEGER_INDEX_U32 = 0x00000001u,
  ISAAC_LUA_V69_GRIDSPAWN_ARG2_CHECKINTEGER_INDEX_U32 = 0x00000002u,
  ISAAC_LUA_V69_GRIDSPAWN_GETARGOBJECT_VA = 0x008baa50u, /* 0x8baa50 host */
  ISAAC_LUA_V69_GRIDSPAWN_GETARGOBJECT_ARG_INDEX_U32 = 0x00000003u,
  ISAAC_LUA_V69_GRIDSPAWN_REAL_FN_ARG_COUNT = 0x00000004u,
  ISAAC_LUA_V69_GRIDSPAWN_REAL_FN_CLEANUP = 0x00000030u,
  ISAAC_LUA_V69_GRIDSPAWN_NEWUSERDATA_SIZE = 0x00000008u,
  ISAAC_LUA_V69_GRIDSPAWN_UD_VTABLE_VA = 0x00b753c8u,
  ISAAC_LUA_V69_GRIDSPAWN_UD_OBJECT_OFF = 0x00000004u,
  ISAAC_LUA_V69_GRIDSPAWN_RAWGETP_KEY = 0x00c82a1eu,
  ISAAC_LUA_V69_GRIDSPAWN_REGISTRY_INDEX_U32 = 0xfff0b9d8u,
  ISAAC_LUA_V69_GRIDSPAWN_SETMETA_INDEX_U32 = 0xfffffffeu,
  ISAAC_LUA_V69_GRIDSPAWN_IAT_LUA_NEWUSERDATA = 0x00b1839cu,
  ISAAC_LUA_V69_GRIDSPAWN_IAT_LUA_RAWGETP = 0x00b183bcu,
  ISAAC_LUA_V69_GRIDSPAWN_IAT_LUA_SETMETATABLE = 0x00b18398u,
  ISAAC_LUA_V69_GRIDSPAWN_IAT_LUA_PUSHNIL = 0x00b183e0u, /* lua_pushnil */
  ISAAC_LUA_V69_GRIDSPAWN_RETURN_VALUE = 1,
  ISAAC_LUA_V69_GRIDSPAWN_INSTALL_COUNT = 1,
  ISAAC_LUA_V69_GRIDSPAWN_INSTALL_VA = 0x00895f10u,
  ISAAC_LUA_V69_GRIDSPAWN_INSTALL_RET_VA = 0x00895f68u,
  ISAAC_LUA_V69_GRIDSPAWN_INSTALL_LITERAL_VA = 0x00895f21u,
  ISAAC_LUA_V69_GRIDSPAWN_INSTALL_REAL_FN_VA = 0x0086f0d0u, /* HOST */
  ISAAC_LUA_V69_GRIDSPAWN_INSTALL_NAME_VA = 0x00b74d1cu,
  ISAAC_LUA_V69_GRIDSPAWN_INSTALL_CALLER_VA = 0x0086ddbeu,
};

enum {
  ISAAC_LUA_V69_RENDERTEXT_VA = 0x00898890u,
  ISAAC_LUA_V69_RENDERTEXT_RET_VA = 0x00898ad2u,
  ISAAC_LUA_V69_RENDERTEXT_INSNS = 155,
  ISAAC_LUA_V69_RENDERTEXT_TOUSERDATA_INDEX_U32 = 0xfff0b9d7u,
  ISAAC_LUA_V69_RENDERTEXT_FN_OFF = 0x00000000u,
  ISAAC_LUA_V69_RENDERTEXT_IAT_LUA_TOUSERDATA = 0x00b183b0u,
  ISAAC_LUA_V69_RENDERTEXT_SEH_HANDLER_VA = 0x00b05280u,
  ISAAC_LUA_V69_RENDERTEXT_CHECKLSTRING_IAT_VA = 0x00b183e4u, /* luaL_checklstring */
  ISAAC_LUA_V69_RENDERTEXT_CHECKLSTRING_INDEX_U32 = 0x00000001u,
  ISAAC_LUA_V69_RENDERTEXT_STRING_ASSIGN_VA = 0x0040ccd0u, /* host */
  ISAAC_LUA_V69_RENDERTEXT_COPY_CTOR_VA = 0x0040cf50u, /* host */
  ISAAC_LUA_V69_RENDERTEXT_DTOR_VA = 0x0040d040u, /* host */
  ISAAC_LUA_V69_RENDERTEXT_REAL_FN_ARG_COUNT = 0x00000007u,
  ISAAC_LUA_V69_RENDERTEXT_REAL_FN_CLEANUP = 0x0000001cu,
  ISAAC_LUA_V69_RENDERTEXT_CHECKNUMBER_IAT_VA = 0x00b18324u, /* luaL_checknumber float lane */
  ISAAC_LUA_V69_RENDERTEXT_FLOAT_LANE_FIRST_INDEX_U32 = 0x00000002u,
  ISAAC_LUA_V69_RENDERTEXT_FLOAT_LANE_COUNT = 0x00000006u,
  ISAAC_LUA_V69_RENDERTEXT_RETURN_VALUE = 0,
  ISAAC_LUA_V69_RENDERTEXT_INSTALL_COUNT = 1,
  ISAAC_LUA_V69_RENDERTEXT_INSTALL_VA = 0x00895f70u,
  ISAAC_LUA_V69_RENDERTEXT_INSTALL_RET_VA = 0x00895fc8u,
  ISAAC_LUA_V69_RENDERTEXT_INSTALL_LITERAL_VA = 0x00895f81u,
  ISAAC_LUA_V69_RENDERTEXT_INSTALL_REAL_FN_VA = 0x0086f1b0u, /* HOST */
  ISAAC_LUA_V69_RENDERTEXT_INSTALL_NAME_VA = 0x00b74cf0u,
  ISAAC_LUA_V69_RENDERTEXT_INSTALL_CALLER_VA = 0x0086ddcfu,
};

enum {
  ISAAC_LUA_V69_UPDATESTRANGEATTRACTOR_VA = 0x008b90e0u,
  ISAAC_LUA_V69_UPDATESTRANGEATTRACTOR_RET_VA = 0x008b91c0u,
  ISAAC_LUA_V69_UPDATESTRANGEATTRACTOR_INSNS = 74,
  ISAAC_LUA_V69_UPDATESTRANGEATTRACTOR_TOUSERDATA_INDEX_U32 = 0xfff0b9d7u,
  ISAAC_LUA_V69_UPDATESTRANGEATTRACTOR_FN_OFF = 0x00000000u,
  ISAAC_LUA_V69_UPDATESTRANGEATTRACTOR_IAT_LUA_TOUSERDATA = 0x00b183b0u,
  ISAAC_LUA_V69_UPDATESTRANGEATTRACTOR_CHECK_HELPER_VA = 0x0085c590u, /* 0x85c590 host */
  ISAAC_LUA_V69_UPDATESTRANGEATTRACTOR_ARG1_CHECK_EDX_U32 = 0x00000001u,
  ISAAC_LUA_V69_UPDATESTRANGEATTRACTOR_ARG1_CHECK_KEY = 0x00c82a13u, /* Game class key */
  ISAAC_LUA_V69_UPDATESTRANGEATTRACTOR_GETARGOBJECT_VA = 0x008baa50u, /* 0x8baa50 host */
  ISAAC_LUA_V69_UPDATESTRANGEATTRACTOR_ARG2_GETARGOBJECT_ARG_INDEX_U32 = 0x00000002u,
  ISAAC_LUA_V69_UPDATESTRANGEATTRACTOR_CHECKNUMBER_IAT_VA = 0x00b18324u, /* luaL_checknumber float lane */
  ISAAC_LUA_V69_UPDATESTRANGEATTRACTOR_ARG3_LANE_INDEX_U32 = 0x00000003u,
  ISAAC_LUA_V69_UPDATESTRANGEATTRACTOR_ARG4_LANE_INDEX_U32 = 0x00000004u,
  ISAAC_LUA_V69_UPDATESTRANGEATTRACTOR_REAL_FN_ARG_COUNT = 0x00000003u,
  ISAAC_LUA_V69_UPDATESTRANGEATTRACTOR_REAL_FN_CLEANUP = 0x00000000u, /* frame-reset discard */
  ISAAC_LUA_V69_UPDATESTRANGEATTRACTOR_RETURN_VALUE = 0,
  ISAAC_LUA_V69_UPDATESTRANGEATTRACTOR_INSTALL_COUNT = 1,
  ISAAC_LUA_V69_UPDATESTRANGEATTRACTOR_INSTALL_VA = 0x008950d0u,
  ISAAC_LUA_V69_UPDATESTRANGEATTRACTOR_INSTALL_RET_VA = 0x00895126u,
  ISAAC_LUA_V69_UPDATESTRANGEATTRACTOR_INSTALL_LITERAL_VA = 0x008950e2u,
  ISAAC_LUA_V69_UPDATESTRANGEATTRACTOR_INSTALL_REAL_FN_VA = 0x0085e390u, /* HOST */
  ISAAC_LUA_V69_UPDATESTRANGEATTRACTOR_INSTALL_NAME_VA = 0x00b74b40u,
  ISAAC_LUA_V69_UPDATESTRANGEATTRACTOR_INSTALL_CALLER_VA = 0x0086d9bbu,
};

enum {
  ISAAC_LUA_V69_REMOVEMODDATA_VA = 0x00897a10u,
  ISAAC_LUA_V69_REMOVEMODDATA_RET_VA = 0x00897af2u,
  ISAAC_LUA_V69_REMOVEMODDATA_INSNS = 79,
  ISAAC_LUA_V69_REMOVEMODDATA_TOUSERDATA_INDEX_U32 = 0xfff0b9d7u,
  ISAAC_LUA_V69_REMOVEMODDATA_FN_OFF = 0x00000000u,
  ISAAC_LUA_V69_REMOVEMODDATA_IAT_LUA_TOUSERDATA = 0x00b183b0u,
  ISAAC_LUA_V69_REMOVEMODDATA_SEH_HANDLER_VA = 0x00b04ff5u,
  ISAAC_LUA_V69_REMOVEMODDATA_BUILDER_VA = 0x008ba0c0u, /* host pin */
  ISAAC_LUA_V69_REMOVEMODDATA_RAWGETI_HELPER_VA = 0x006a80f0u, /* shared 18-caller host helper */
  ISAAC_LUA_V69_REMOVEMODDATA_LUAL_REF_IAT_VA = 0x00b18314u, /* luaL_ref */
  ISAAC_LUA_V69_REMOVEMODDATA_LUAL_UNREF_IAT_VA = 0x00b1831cu, /* luaL_unref */
  ISAAC_LUA_V69_REMOVEMODDATA_REGISTRY_INDEX_U32 = 0xfff0b9d8u,
  ISAAC_LUA_V69_REMOVEMODDATA_REFNIL_U32 = 0xffffffffu, /* LUA_REFNIL */
  ISAAC_LUA_V69_REMOVEMODDATA_REAL_FN_ARG_COUNT = 0x00000002u,
  ISAAC_LUA_V69_REMOVEMODDATA_REAL_FN_CLEANUP = 0x00000020u, /* final stack cleanup */
  ISAAC_LUA_V69_REMOVEMODDATA_RETURN_VALUE = 0,
  ISAAC_LUA_V69_REMOVEMODDATA_INSTALL_COUNT = 1,
  ISAAC_LUA_V69_REMOVEMODDATA_INSTALL_VA = 0x008965d0u,
  ISAAC_LUA_V69_REMOVEMODDATA_INSTALL_RET_VA = 0x00896628u,
  ISAAC_LUA_V69_REMOVEMODDATA_INSTALL_LITERAL_VA = 0x008965e1u,
  ISAAC_LUA_V69_REMOVEMODDATA_INSTALL_REAL_FN_VA = 0x00871c10u, /* HOST */
  ISAAC_LUA_V69_REMOVEMODDATA_INSTALL_NAME_VA = 0x00b74ffcu,
  ISAAC_LUA_V69_REMOVEMODDATA_INSTALL_CALLER_VA = 0x0086e033u,
};

enum {
  ISAAC_LUA_V69_HASHMODDATA_VA = 0x00897b00u,
  ISAAC_LUA_V69_HASHMODDATA_RET_VA = 0x00897bfeu,
  ISAAC_LUA_V69_HASHMODDATA_INSNS = 90,
  ISAAC_LUA_V69_HASHMODDATA_TOUSERDATA_INDEX_U32 = 0xfff0b9d7u,
  ISAAC_LUA_V69_HASHMODDATA_FN_OFF = 0x00000000u,
  ISAAC_LUA_V69_HASHMODDATA_IAT_LUA_TOUSERDATA = 0x00b183b0u,
  ISAAC_LUA_V69_HASHMODDATA_SEH_HANDLER_VA = 0x00b04ff5u,
  ISAAC_LUA_V69_HASHMODDATA_BUILDER_VA = 0x008ba0c0u, /* host pin */
  ISAAC_LUA_V69_HASHMODDATA_RAWGETI_HELPER_VA = 0x006a80f0u, /* shared 18-caller host helper */
  ISAAC_LUA_V69_HASHMODDATA_LUAL_REF_IAT_VA = 0x00b18314u, /* luaL_ref */
  ISAAC_LUA_V69_HASHMODDATA_LUAL_UNREF_IAT_VA = 0x00b1831cu, /* luaL_unref */
  ISAAC_LUA_V69_HASHMODDATA_REGISTRY_INDEX_U32 = 0xfff0b9d8u,
  ISAAC_LUA_V69_HASHMODDATA_REFNIL_U32 = 0xffffffffu, /* LUA_REFNIL */
  ISAAC_LUA_V69_HASHMODDATA_REAL_FN_ARG_COUNT = 0x00000002u,
  ISAAC_LUA_V69_HASHMODDATA_REAL_FN_CLEANUP = 0x00000028u, /* final stack cleanup */
  ISAAC_LUA_V69_HASHMODDATA_IAT_LUA_PUSHBOOLEAN = 0x00b183ecu, /* lua_pushboolean */
  ISAAC_LUA_V69_HASHMODDATA_RETURN_VALUE = 1,
  ISAAC_LUA_V69_HASHMODDATA_INSTALL_COUNT = 1,
  ISAAC_LUA_V69_HASHMODDATA_INSTALL_VA = 0x00896570u,
  ISAAC_LUA_V69_HASHMODDATA_INSTALL_RET_VA = 0x008965c8u,
  ISAAC_LUA_V69_HASHMODDATA_INSTALL_LITERAL_VA = 0x00896581u,
  ISAAC_LUA_V69_HASHMODDATA_INSTALL_REAL_FN_VA = 0x00871980u, /* HOST */
  ISAAC_LUA_V69_HASHMODDATA_INSTALL_NAME_VA = 0x00b74f14u,
  ISAAC_LUA_V69_HASHMODDATA_INSTALL_CALLER_VA = 0x0086e022u,
};

enum {
  ISAAC_LUA_V69_LOADMODDATA_VA = 0x00897c00u,
  ISAAC_LUA_V69_LOADMODDATA_RET_VA = 0x00897d4du,
  ISAAC_LUA_V69_LOADMODDATA_INSNS = 115,
  ISAAC_LUA_V69_LOADMODDATA_TOUSERDATA_INDEX_U32 = 0xfff0b9d7u,
  ISAAC_LUA_V69_LOADMODDATA_FN_OFF = 0x00000000u,
  ISAAC_LUA_V69_LOADMODDATA_IAT_LUA_TOUSERDATA = 0x00b183b0u,
  ISAAC_LUA_V69_LOADMODDATA_SEH_HANDLER_VA = 0x00b05035u,
  ISAAC_LUA_V69_LOADMODDATA_BUILDER_VA = 0x008ba0c0u, /* host pin */
  ISAAC_LUA_V69_LOADMODDATA_RAWGETI_HELPER_VA = 0x006a80f0u, /* shared 18-caller host helper */
  ISAAC_LUA_V69_LOADMODDATA_LUAL_REF_IAT_VA = 0x00b18314u, /* luaL_ref */
  ISAAC_LUA_V69_LOADMODDATA_LUAL_UNREF_IAT_VA = 0x00b1831cu, /* luaL_unref */
  ISAAC_LUA_V69_LOADMODDATA_REGISTRY_INDEX_U32 = 0xfff0b9d8u,
  ISAAC_LUA_V69_LOADMODDATA_REFNIL_U32 = 0xffffffffu, /* LUA_REFNIL */
  ISAAC_LUA_V69_LOADMODDATA_REAL_FN_ARG_COUNT = 0x00000003u,
  ISAAC_LUA_V69_LOADMODDATA_REAL_FN_CLEANUP = 0x00000024u, /* final stack cleanup */
  ISAAC_LUA_V69_LOADMODDATA_IAT_LUA_PUSHLSTRING = 0x00b183dcu, /* lua_pushlstring */
  ISAAC_LUA_V69_LOADMODDATA_SSO_CAP_U32 = 0x00000010u,
  ISAAC_LUA_V69_LOADMODDATA_RETURN_VALUE = 1,
  ISAAC_LUA_V69_LOADMODDATA_INSTALL_COUNT = 1,
  ISAAC_LUA_V69_LOADMODDATA_INSTALL_VA = 0x00896510u,
  ISAAC_LUA_V69_LOADMODDATA_INSTALL_RET_VA = 0x00896568u,
  ISAAC_LUA_V69_LOADMODDATA_INSTALL_LITERAL_VA = 0x00896521u,
  ISAAC_LUA_V69_LOADMODDATA_INSTALL_REAL_FN_VA = 0x00871550u, /* HOST */
  ISAAC_LUA_V69_LOADMODDATA_INSTALL_NAME_VA = 0x00b74f08u,
  ISAAC_LUA_V69_LOADMODDATA_INSTALL_CALLER_VA = 0x0086e011u,
};

enum {
  ISAAC_LUA_V69_SAVEMODDATA_VA = 0x00897d50u,
  ISAAC_LUA_V69_SAVEMODDATA_RET_VA = 0x00897effu,
  ISAAC_LUA_V69_SAVEMODDATA_INSNS = 136,
  ISAAC_LUA_V69_SAVEMODDATA_TOUSERDATA_INDEX_U32 = 0xfff0b9d7u,
  ISAAC_LUA_V69_SAVEMODDATA_FN_OFF = 0x00000000u,
  ISAAC_LUA_V69_SAVEMODDATA_IAT_LUA_TOUSERDATA = 0x00b183b0u,
  ISAAC_LUA_V69_SAVEMODDATA_SEH_HANDLER_VA = 0x00b05098u,
  ISAAC_LUA_V69_SAVEMODDATA_BUILDER_VA = 0x008ba7c0u, /* host pin */
  ISAAC_LUA_V69_SAVEMODDATA_RAWGETI_HELPER_VA = 0x006a80f0u, /* shared 18-caller host helper */
  ISAAC_LUA_V69_SAVEMODDATA_LUAL_REF_IAT_VA = 0x00b18314u, /* luaL_ref */
  ISAAC_LUA_V69_SAVEMODDATA_LUAL_UNREF_IAT_VA = 0x00b1831cu, /* luaL_unref */
  ISAAC_LUA_V69_SAVEMODDATA_REGISTRY_INDEX_U32 = 0xfff0b9d8u,
  ISAAC_LUA_V69_SAVEMODDATA_REFNIL_U32 = 0xffffffffu, /* LUA_REFNIL */
  ISAAC_LUA_V69_SAVEMODDATA_REAL_FN_ARG_COUNT = 0x00000003u,
  ISAAC_LUA_V69_SAVEMODDATA_REAL_FN_CLEANUP = 0x0000000cu, /* final stack cleanup */
  ISAAC_LUA_V69_SAVEMODDATA_PUSHVALUE_IAT_VA = 0x00b183c8u, /* lua_pushvalue */
  ISAAC_LUA_V69_SAVEMODDATA_RETURN_VALUE = 0,
  ISAAC_LUA_V69_SAVEMODDATA_INSTALL_COUNT = 1,
  ISAAC_LUA_V69_SAVEMODDATA_INSTALL_VA = 0x008964b0u,
  ISAAC_LUA_V69_SAVEMODDATA_INSTALL_RET_VA = 0x00896508u,
  ISAAC_LUA_V69_SAVEMODDATA_INSTALL_LITERAL_VA = 0x008964c1u,
  ISAAC_LUA_V69_SAVEMODDATA_INSTALL_REAL_FN_VA = 0x008711f0u, /* HOST */
  ISAAC_LUA_V69_SAVEMODDATA_INSTALL_NAME_VA = 0x00b74f38u,
  ISAAC_LUA_V69_SAVEMODDATA_INSTALL_CALLER_VA = 0x0086e000u,
};

enum {
  ISAAC_LUA_V69_GETBYNAME_SITE_COUNT = 11,
};

enum {
  ISAAC_LUA_V69_GETBYNAME_SITE_0_CALLER_VA = 0x0086de68u,
  ISAAC_LUA_V69_GETBYNAME_SITE_0_REAL_FN_VA = 0x0086f520u, /* HOST */
  ISAAC_LUA_V69_GETBYNAME_SITE_0_NAME_VA = 0x00b74d94u,
};

enum {
  ISAAC_LUA_V69_GETBYNAME_SITE_1_CALLER_VA = 0x0086de79u,
  ISAAC_LUA_V69_GETBYNAME_SITE_1_REAL_FN_VA = 0x0086f5b0u, /* HOST */
  ISAAC_LUA_V69_GETBYNAME_SITE_1_NAME_VA = 0x00b74d5cu,
};

enum {
  ISAAC_LUA_V69_GETBYNAME_SITE_2_CALLER_VA = 0x0086de8au,
  ISAAC_LUA_V69_GETBYNAME_SITE_2_REAL_FN_VA = 0x0086f640u, /* HOST */
  ISAAC_LUA_V69_GETBYNAME_SITE_2_NAME_VA = 0x00b74d74u,
};

enum {
  ISAAC_LUA_V69_GETBYNAME_SITE_3_CALLER_VA = 0x0086deacu,
  ISAAC_LUA_V69_GETBYNAME_SITE_3_REAL_FN_VA = 0x0086f800u, /* HOST */
  ISAAC_LUA_V69_GETBYNAME_SITE_3_NAME_VA = 0x00b74e80u,
};

enum {
  ISAAC_LUA_V69_GETBYNAME_SITE_4_CALLER_VA = 0x0086debdu,
  ISAAC_LUA_V69_GETBYNAME_SITE_4_REAL_FN_VA = 0x0086f880u, /* HOST */
  ISAAC_LUA_V69_GETBYNAME_SITE_4_NAME_VA = 0x00b74e44u,
};

enum {
  ISAAC_LUA_V69_GETBYNAME_SITE_5_CALLER_VA = 0x0086deceu,
  ISAAC_LUA_V69_GETBYNAME_SITE_5_REAL_FN_VA = 0x0086f6e0u, /* HOST */
  ISAAC_LUA_V69_GETBYNAME_SITE_5_NAME_VA = 0x00b74e58u,
};

enum {
  ISAAC_LUA_V69_GETBYNAME_SITE_6_CALLER_VA = 0x0086dedfu,
  ISAAC_LUA_V69_GETBYNAME_SITE_6_REAL_FN_VA = 0x0086f900u, /* HOST */
  ISAAC_LUA_V69_GETBYNAME_SITE_6_NAME_VA = 0x00b74e18u,
};

enum {
  ISAAC_LUA_V69_GETBYNAME_SITE_7_CALLER_VA = 0x0086def0u,
  ISAAC_LUA_V69_GETBYNAME_SITE_7_REAL_FN_VA = 0x0086f980u, /* HOST */
  ISAAC_LUA_V69_GETBYNAME_SITE_7_NAME_VA = 0x00b74e30u,
};

enum {
  ISAAC_LUA_V69_GETBYNAME_SITE_8_CALLER_VA = 0x0086df01u,
  ISAAC_LUA_V69_GETBYNAME_SITE_8_REAL_FN_VA = 0x0086f9f0u, /* HOST */
  ISAAC_LUA_V69_GETBYNAME_SITE_8_NAME_VA = 0x00b74df0u,
};

enum {
  ISAAC_LUA_V69_GETBYNAME_SITE_9_CALLER_VA = 0x0086df12u,
  ISAAC_LUA_V69_GETBYNAME_SITE_9_REAL_FN_VA = 0x0086fab0u, /* HOST */
  ISAAC_LUA_V69_GETBYNAME_SITE_9_NAME_VA = 0x00b74e04u,
};

enum {
  ISAAC_LUA_V69_GETBYNAME_SITE_10_CALLER_VA = 0x0086df23u,
  ISAAC_LUA_V69_GETBYNAME_SITE_10_REAL_FN_VA = 0x0086fa50u, /* HOST */
  ISAAC_LUA_V69_GETBYNAME_SITE_10_NAME_VA = 0x00b74eecu,
};

/* BYTE gate `test eax,eax; setne` @0x8982e4 */
uint32_t isaac_lua_engine_v69_getplayertypebyname_arg1_gate(uint32_t toboolean_result);
/* 16-bit copy law `mov ax,[ebp-0x46]` @0x898332: low byte = gate, high byte = [ebp-0x45] residue */
uint32_t isaac_lua_engine_v69_getplayertypebyname_arg1_word_lane(uint32_t gate, uint32_t spill);
/* FULL-WORD null gate `test esi,esi; je` @0x898c88 */
uint32_t isaac_lua_engine_v69_spawn_null_gate(uint32_t real_fn_result);
/* FULL-WORD null gate `test edi,edi; je` @0x898ba2 */
uint32_t isaac_lua_engine_v69_gridspawn_null_gate(uint32_t real_fn_result);
/* BYTE gate on lua_toboolean(L,4) `test/setne` @0x898b16 */
uint32_t isaac_lua_engine_v69_gridspawn_has_arg4_gate(uint32_t toboolean_result);
/* (float)luaL_checknumber lane `fstp dword` after IAT 0xb18324 */
uint32_t isaac_lua_engine_v69_rendertext_f32_lane_bits(uint32_t double_lo, uint32_t double_hi);
/* (float)luaL_checknumber lane `fstp dword` after IAT 0xb18324 */
uint32_t isaac_lua_engine_v69_updatestrangeattractor_f32_lane_bits(uint32_t double_lo, uint32_t double_hi);
/* LUA_REFNIL gate `cmp ref,-1; je` */
uint32_t isaac_lua_engine_v69_removemoddata_refnil_gate(int32_t ref);
/* BYTE gate `mov bl,al; test bl,bl; setne cl` @0x897bbf */
uint32_t isaac_lua_engine_v69_hashmoddata_return_gate(uint32_t real_fn_result);
/* LUA_REFNIL gate `cmp ref,-1; je` */
uint32_t isaac_lua_engine_v69_hashmoddata_refnil_gate(int32_t ref);
/* LUA_REFNIL gate `cmp ref,-1; je` */
uint32_t isaac_lua_engine_v69_loadmoddata_refnil_gate(int32_t ref);
/* LUA_REFNIL gate `cmp ref,-1; je` */
uint32_t isaac_lua_engine_v69_savemoddata_refnil_gate(int32_t ref);

uint32_t isaac_lua_engine_v69_getbyname_va(void);
uint32_t isaac_lua_engine_v69_getbyname_ret_va(void);
uint32_t isaac_lua_engine_v69_getbyname_body_bytes(void); /* bytes = RET-VA */
int32_t isaac_lua_engine_v69_getbyname_insn_count(void);
uint32_t isaac_lua_engine_v69_getbyname_touserdata_index(void);
uint32_t isaac_lua_engine_v69_getbyname_fn_off(void);
uint32_t isaac_lua_engine_v69_getbyname_iat_lua_touserdata(void);
int32_t isaac_lua_engine_v69_getbyname_return_value(void);
int32_t isaac_lua_engine_v69_getbyname_install_count(void);
uint32_t isaac_lua_engine_v69_getbyname_seh_handler_va(void);
uint32_t isaac_lua_engine_v69_getbyname_check_string_builder_va(void);
uint32_t isaac_lua_engine_v69_getbyname_string_copy_ctor_va(void);
uint32_t isaac_lua_engine_v69_getbyname_string_dtor_va(void);
uint32_t isaac_lua_engine_v69_getbyname_real_fn_arg_count(void);
uint32_t isaac_lua_engine_v69_getbyname_real_fn_cleanup(void);
uint32_t isaac_lua_engine_v69_getbyname_pusher_va(void);
uint32_t isaac_lua_engine_v69_getbyname_pusher_row(void);
uint32_t isaac_lua_engine_v69_getbyname_install_va(void);
uint32_t isaac_lua_engine_v69_getbyname_install_ret_va(void);
uint32_t isaac_lua_engine_v69_getbyname_install_literal_va(void);
uint32_t isaac_lua_engine_v69_getbyname_install_real_fn_va(void);
uint32_t isaac_lua_engine_v69_getbyname_install_name_va(void);
uint32_t isaac_lua_engine_v69_getbyname_install_caller_va(void);
int32_t isaac_lua_engine_v69_getbyname_site_count(void);
uint32_t isaac_lua_engine_v69_getbyname_site_caller_va_at(int32_t index);
uint32_t isaac_lua_engine_v69_getbyname_site_real_fn_va_at(int32_t index);
uint32_t isaac_lua_engine_v69_getbyname_site_name_va_at(int32_t index);

uint32_t isaac_lua_engine_v69_gettextwidth_va(void);
uint32_t isaac_lua_engine_v69_gettextwidth_ret_va(void);
uint32_t isaac_lua_engine_v69_gettextwidth_body_bytes(void); /* bytes = RET-VA */
int32_t isaac_lua_engine_v69_gettextwidth_insn_count(void);
uint32_t isaac_lua_engine_v69_gettextwidth_touserdata_index(void);
uint32_t isaac_lua_engine_v69_gettextwidth_fn_off(void);
uint32_t isaac_lua_engine_v69_gettextwidth_iat_lua_touserdata(void);
int32_t isaac_lua_engine_v69_gettextwidth_return_value(void);
int32_t isaac_lua_engine_v69_gettextwidth_install_count(void);
uint32_t isaac_lua_engine_v69_gettextwidth_seh_handler_va(void);
uint32_t isaac_lua_engine_v69_gettextwidth_check_string_builder_va(void);
uint32_t isaac_lua_engine_v69_gettextwidth_string_copy_ctor_va(void);
uint32_t isaac_lua_engine_v69_gettextwidth_string_dtor_va(void);
uint32_t isaac_lua_engine_v69_gettextwidth_real_fn_arg_count(void);
uint32_t isaac_lua_engine_v69_gettextwidth_real_fn_cleanup(void);
uint32_t isaac_lua_engine_v69_gettextwidth_pusher_va(void);
uint32_t isaac_lua_engine_v69_gettextwidth_pusher_row(void);
uint32_t isaac_lua_engine_v69_gettextwidth_install_a_va(void);
uint32_t isaac_lua_engine_v69_gettextwidth_install_a_ret_va(void);
uint32_t isaac_lua_engine_v69_gettextwidth_install_a_literal_va(void);
uint32_t isaac_lua_engine_v69_gettextwidth_install_a_real_fn_va(void);
uint32_t isaac_lua_engine_v69_gettextwidth_install_a_name_va(void);
uint32_t isaac_lua_engine_v69_gettextwidth_install_a_caller_va(void);
uint32_t isaac_lua_engine_v69_gettextwidth_install_b_va(void);
uint32_t isaac_lua_engine_v69_gettextwidth_install_b_ret_va(void);
uint32_t isaac_lua_engine_v69_gettextwidth_install_b_literal_va(void);
uint32_t isaac_lua_engine_v69_gettextwidth_install_b_real_fn_va(void);
uint32_t isaac_lua_engine_v69_gettextwidth_install_b_name_va(void);
uint32_t isaac_lua_engine_v69_gettextwidth_install_b_caller_va(void);

uint32_t isaac_lua_engine_v69_debugstring_va(void);
uint32_t isaac_lua_engine_v69_debugstring_ret_va(void);
uint32_t isaac_lua_engine_v69_debugstring_body_bytes(void); /* bytes = RET-VA */
int32_t isaac_lua_engine_v69_debugstring_insn_count(void);
uint32_t isaac_lua_engine_v69_debugstring_touserdata_index(void);
uint32_t isaac_lua_engine_v69_debugstring_fn_off(void);
uint32_t isaac_lua_engine_v69_debugstring_iat_lua_touserdata(void);
int32_t isaac_lua_engine_v69_debugstring_return_value(void);
int32_t isaac_lua_engine_v69_debugstring_install_count(void);
uint32_t isaac_lua_engine_v69_debugstring_seh_handler_va(void);
uint32_t isaac_lua_engine_v69_debugstring_check_string_builder_va(void);
uint32_t isaac_lua_engine_v69_debugstring_string_copy_ctor_va(void);
uint32_t isaac_lua_engine_v69_debugstring_string_dtor_va(void);
uint32_t isaac_lua_engine_v69_debugstring_real_fn_arg_count(void);
uint32_t isaac_lua_engine_v69_debugstring_real_fn_cleanup(void);
uint32_t isaac_lua_engine_v69_debugstring_pusher_va(void);
uint32_t isaac_lua_engine_v69_debugstring_pusher_row(void);
uint32_t isaac_lua_engine_v69_debugstring_install_a_va(void);
uint32_t isaac_lua_engine_v69_debugstring_install_a_ret_va(void);
uint32_t isaac_lua_engine_v69_debugstring_install_a_literal_va(void);
uint32_t isaac_lua_engine_v69_debugstring_install_a_real_fn_va(void);
uint32_t isaac_lua_engine_v69_debugstring_install_a_name_va(void);
uint32_t isaac_lua_engine_v69_debugstring_install_a_caller_va(void);
uint32_t isaac_lua_engine_v69_debugstring_install_b_va(void);
uint32_t isaac_lua_engine_v69_debugstring_install_b_ret_va(void);
uint32_t isaac_lua_engine_v69_debugstring_install_b_literal_va(void);
uint32_t isaac_lua_engine_v69_debugstring_install_b_real_fn_va(void);
uint32_t isaac_lua_engine_v69_debugstring_install_b_name_va(void);
uint32_t isaac_lua_engine_v69_debugstring_install_b_caller_va(void);

uint32_t isaac_lua_engine_v69_executecommand_va(void);
uint32_t isaac_lua_engine_v69_executecommand_ret_va(void);
uint32_t isaac_lua_engine_v69_executecommand_body_bytes(void); /* bytes = RET-VA */
int32_t isaac_lua_engine_v69_executecommand_insn_count(void);
uint32_t isaac_lua_engine_v69_executecommand_touserdata_index(void);
uint32_t isaac_lua_engine_v69_executecommand_fn_off(void);
uint32_t isaac_lua_engine_v69_executecommand_iat_lua_touserdata(void);
int32_t isaac_lua_engine_v69_executecommand_return_value(void);
int32_t isaac_lua_engine_v69_executecommand_install_count(void);
uint32_t isaac_lua_engine_v69_executecommand_seh_handler_va(void);
uint32_t isaac_lua_engine_v69_executecommand_check_string_builder_va(void);
uint32_t isaac_lua_engine_v69_executecommand_string_copy_ctor_va(void);
uint32_t isaac_lua_engine_v69_executecommand_string_dtor_va(void);
uint32_t isaac_lua_engine_v69_executecommand_real_fn_arg_count(void);
uint32_t isaac_lua_engine_v69_executecommand_real_fn_cleanup(void);
uint32_t isaac_lua_engine_v69_executecommand_iat_lua_pushlstring(void);
uint32_t isaac_lua_engine_v69_executecommand_sso_cap_u32(void);
uint32_t isaac_lua_engine_v69_executecommand_install_va(void);
uint32_t isaac_lua_engine_v69_executecommand_install_ret_va(void);
uint32_t isaac_lua_engine_v69_executecommand_install_literal_va(void);
uint32_t isaac_lua_engine_v69_executecommand_install_real_fn_va(void);
uint32_t isaac_lua_engine_v69_executecommand_install_name_va(void);
uint32_t isaac_lua_engine_v69_executecommand_install_caller_va(void);

uint32_t isaac_lua_engine_v69_getplayertypebyname_va(void);
uint32_t isaac_lua_engine_v69_getplayertypebyname_ret_va(void);
uint32_t isaac_lua_engine_v69_getplayertypebyname_body_bytes(void); /* bytes = RET-VA */
int32_t isaac_lua_engine_v69_getplayertypebyname_insn_count(void);
uint32_t isaac_lua_engine_v69_getplayertypebyname_touserdata_index(void);
uint32_t isaac_lua_engine_v69_getplayertypebyname_fn_off(void);
uint32_t isaac_lua_engine_v69_getplayertypebyname_iat_lua_touserdata(void);
int32_t isaac_lua_engine_v69_getplayertypebyname_return_value(void);
int32_t isaac_lua_engine_v69_getplayertypebyname_install_count(void);
uint32_t isaac_lua_engine_v69_getplayertypebyname_seh_handler_va(void);
uint32_t isaac_lua_engine_v69_getplayertypebyname_checklstring_iat_va(void);
uint32_t isaac_lua_engine_v69_getplayertypebyname_checklstring_index_u32(void);
uint32_t isaac_lua_engine_v69_getplayertypebyname_string_assign_va(void);
uint32_t isaac_lua_engine_v69_getplayertypebyname_toboolean_iat_va(void);
uint32_t isaac_lua_engine_v69_getplayertypebyname_toboolean_index_u32(void);
uint32_t isaac_lua_engine_v69_getplayertypebyname_byte_gate_off_u32(void);
uint32_t isaac_lua_engine_v69_getplayertypebyname_word_slot_off_u32(void);
uint32_t isaac_lua_engine_v69_getplayertypebyname_pusher_va(void);
uint32_t isaac_lua_engine_v69_getplayertypebyname_pusher_row(void);
uint32_t isaac_lua_engine_v69_getplayertypebyname_copy_ctor_va(void);
uint32_t isaac_lua_engine_v69_getplayertypebyname_dtor_va(void);
uint32_t isaac_lua_engine_v69_getplayertypebyname_real_fn_arg_count(void);
uint32_t isaac_lua_engine_v69_getplayertypebyname_real_fn_cleanup(void);
uint32_t isaac_lua_engine_v69_getplayertypebyname_install_va(void);
uint32_t isaac_lua_engine_v69_getplayertypebyname_install_ret_va(void);
uint32_t isaac_lua_engine_v69_getplayertypebyname_install_literal_va(void);
uint32_t isaac_lua_engine_v69_getplayertypebyname_install_real_fn_va(void);
uint32_t isaac_lua_engine_v69_getplayertypebyname_install_name_va(void);
uint32_t isaac_lua_engine_v69_getplayertypebyname_install_caller_va(void);

uint32_t isaac_lua_engine_v69_spawn_va(void);
uint32_t isaac_lua_engine_v69_spawn_ret_va(void);
uint32_t isaac_lua_engine_v69_spawn_body_bytes(void); /* bytes = RET-VA */
int32_t isaac_lua_engine_v69_spawn_insn_count(void);
uint32_t isaac_lua_engine_v69_spawn_touserdata_index(void);
uint32_t isaac_lua_engine_v69_spawn_fn_off(void);
uint32_t isaac_lua_engine_v69_spawn_iat_lua_touserdata(void);
int32_t isaac_lua_engine_v69_spawn_return_value(void);
int32_t isaac_lua_engine_v69_spawn_install_count(void);
uint32_t isaac_lua_engine_v69_spawn_builder_va(void);
uint32_t isaac_lua_engine_v69_spawn_real_fn_arg_count(void);
uint32_t isaac_lua_engine_v69_spawn_real_fn_cleanup(void);
uint32_t isaac_lua_engine_v69_spawn_newuserdata_size(void);
uint32_t isaac_lua_engine_v69_spawn_ud_vtable_va(void);
uint32_t isaac_lua_engine_v69_spawn_ud_object_off(void);
uint32_t isaac_lua_engine_v69_spawn_rawgetp_key(void);
uint32_t isaac_lua_engine_v69_spawn_registry_index_u32(void);
uint32_t isaac_lua_engine_v69_spawn_setmeta_index_u32(void);
uint32_t isaac_lua_engine_v69_spawn_iat_lua_newuserdata(void);
uint32_t isaac_lua_engine_v69_spawn_iat_lua_rawgetp(void);
uint32_t isaac_lua_engine_v69_spawn_iat_lua_setmetatable(void);
uint32_t isaac_lua_engine_v69_spawn_iat_lua_pushnil(void);
uint32_t isaac_lua_engine_v69_spawn_install_va(void);
uint32_t isaac_lua_engine_v69_spawn_install_ret_va(void);
uint32_t isaac_lua_engine_v69_spawn_install_literal_va(void);
uint32_t isaac_lua_engine_v69_spawn_install_real_fn_va(void);
uint32_t isaac_lua_engine_v69_spawn_install_name_va(void);
uint32_t isaac_lua_engine_v69_spawn_install_caller_va(void);

uint32_t isaac_lua_engine_v69_gridspawn_va(void);
uint32_t isaac_lua_engine_v69_gridspawn_ret_va(void);
uint32_t isaac_lua_engine_v69_gridspawn_body_bytes(void); /* bytes = RET-VA */
int32_t isaac_lua_engine_v69_gridspawn_insn_count(void);
uint32_t isaac_lua_engine_v69_gridspawn_touserdata_index(void);
uint32_t isaac_lua_engine_v69_gridspawn_fn_off(void);
uint32_t isaac_lua_engine_v69_gridspawn_iat_lua_touserdata(void);
int32_t isaac_lua_engine_v69_gridspawn_return_value(void);
int32_t isaac_lua_engine_v69_gridspawn_install_count(void);
uint32_t isaac_lua_engine_v69_gridspawn_toboolean_iat_va(void);
uint32_t isaac_lua_engine_v69_gridspawn_toboolean_index_u32(void);
uint32_t isaac_lua_engine_v69_gridspawn_checkinteger_iat_va(void);
uint32_t isaac_lua_engine_v69_gridspawn_arg1_checkinteger_index_u32(void);
uint32_t isaac_lua_engine_v69_gridspawn_arg2_checkinteger_index_u32(void);
uint32_t isaac_lua_engine_v69_gridspawn_getargobject_va(void);
uint32_t isaac_lua_engine_v69_gridspawn_getargobject_arg_index_u32(void);
uint32_t isaac_lua_engine_v69_gridspawn_real_fn_arg_count(void);
uint32_t isaac_lua_engine_v69_gridspawn_real_fn_cleanup(void);
uint32_t isaac_lua_engine_v69_gridspawn_newuserdata_size(void);
uint32_t isaac_lua_engine_v69_gridspawn_ud_vtable_va(void);
uint32_t isaac_lua_engine_v69_gridspawn_ud_object_off(void);
uint32_t isaac_lua_engine_v69_gridspawn_rawgetp_key(void);
uint32_t isaac_lua_engine_v69_gridspawn_registry_index_u32(void);
uint32_t isaac_lua_engine_v69_gridspawn_setmeta_index_u32(void);
uint32_t isaac_lua_engine_v69_gridspawn_iat_lua_newuserdata(void);
uint32_t isaac_lua_engine_v69_gridspawn_iat_lua_rawgetp(void);
uint32_t isaac_lua_engine_v69_gridspawn_iat_lua_setmetatable(void);
uint32_t isaac_lua_engine_v69_gridspawn_iat_lua_pushnil(void);
uint32_t isaac_lua_engine_v69_gridspawn_install_va(void);
uint32_t isaac_lua_engine_v69_gridspawn_install_ret_va(void);
uint32_t isaac_lua_engine_v69_gridspawn_install_literal_va(void);
uint32_t isaac_lua_engine_v69_gridspawn_install_real_fn_va(void);
uint32_t isaac_lua_engine_v69_gridspawn_install_name_va(void);
uint32_t isaac_lua_engine_v69_gridspawn_install_caller_va(void);

uint32_t isaac_lua_engine_v69_rendertext_va(void);
uint32_t isaac_lua_engine_v69_rendertext_ret_va(void);
uint32_t isaac_lua_engine_v69_rendertext_body_bytes(void); /* bytes = RET-VA */
int32_t isaac_lua_engine_v69_rendertext_insn_count(void);
uint32_t isaac_lua_engine_v69_rendertext_touserdata_index(void);
uint32_t isaac_lua_engine_v69_rendertext_fn_off(void);
uint32_t isaac_lua_engine_v69_rendertext_iat_lua_touserdata(void);
int32_t isaac_lua_engine_v69_rendertext_return_value(void);
int32_t isaac_lua_engine_v69_rendertext_install_count(void);
uint32_t isaac_lua_engine_v69_rendertext_seh_handler_va(void);
uint32_t isaac_lua_engine_v69_rendertext_checklstring_iat_va(void);
uint32_t isaac_lua_engine_v69_rendertext_checklstring_index_u32(void);
uint32_t isaac_lua_engine_v69_rendertext_string_assign_va(void);
uint32_t isaac_lua_engine_v69_rendertext_copy_ctor_va(void);
uint32_t isaac_lua_engine_v69_rendertext_dtor_va(void);
uint32_t isaac_lua_engine_v69_rendertext_real_fn_arg_count(void);
uint32_t isaac_lua_engine_v69_rendertext_real_fn_cleanup(void);
uint32_t isaac_lua_engine_v69_rendertext_checknumber_iat_va(void);
uint32_t isaac_lua_engine_v69_rendertext_float_lane_first_index_u32(void);
uint32_t isaac_lua_engine_v69_rendertext_float_lane_count(void);
uint32_t isaac_lua_engine_v69_rendertext_install_va(void);
uint32_t isaac_lua_engine_v69_rendertext_install_ret_va(void);
uint32_t isaac_lua_engine_v69_rendertext_install_literal_va(void);
uint32_t isaac_lua_engine_v69_rendertext_install_real_fn_va(void);
uint32_t isaac_lua_engine_v69_rendertext_install_name_va(void);
uint32_t isaac_lua_engine_v69_rendertext_install_caller_va(void);

uint32_t isaac_lua_engine_v69_updatestrangeattractor_va(void);
uint32_t isaac_lua_engine_v69_updatestrangeattractor_ret_va(void);
uint32_t isaac_lua_engine_v69_updatestrangeattractor_body_bytes(void); /* bytes = RET-VA */
int32_t isaac_lua_engine_v69_updatestrangeattractor_insn_count(void);
uint32_t isaac_lua_engine_v69_updatestrangeattractor_touserdata_index(void);
uint32_t isaac_lua_engine_v69_updatestrangeattractor_fn_off(void);
uint32_t isaac_lua_engine_v69_updatestrangeattractor_iat_lua_touserdata(void);
int32_t isaac_lua_engine_v69_updatestrangeattractor_return_value(void);
int32_t isaac_lua_engine_v69_updatestrangeattractor_install_count(void);
uint32_t isaac_lua_engine_v69_updatestrangeattractor_check_helper_va(void);
uint32_t isaac_lua_engine_v69_updatestrangeattractor_arg1_check_edx_u32(void);
uint32_t isaac_lua_engine_v69_updatestrangeattractor_arg1_check_key(void);
uint32_t isaac_lua_engine_v69_updatestrangeattractor_getargobject_va(void);
uint32_t isaac_lua_engine_v69_updatestrangeattractor_arg2_getargobject_arg_index_u32(void);
uint32_t isaac_lua_engine_v69_updatestrangeattractor_checknumber_iat_va(void);
uint32_t isaac_lua_engine_v69_updatestrangeattractor_arg3_lane_index_u32(void);
uint32_t isaac_lua_engine_v69_updatestrangeattractor_arg4_lane_index_u32(void);
uint32_t isaac_lua_engine_v69_updatestrangeattractor_real_fn_arg_count(void);
uint32_t isaac_lua_engine_v69_updatestrangeattractor_real_fn_cleanup(void);
uint32_t isaac_lua_engine_v69_updatestrangeattractor_install_va(void);
uint32_t isaac_lua_engine_v69_updatestrangeattractor_install_ret_va(void);
uint32_t isaac_lua_engine_v69_updatestrangeattractor_install_literal_va(void);
uint32_t isaac_lua_engine_v69_updatestrangeattractor_install_real_fn_va(void);
uint32_t isaac_lua_engine_v69_updatestrangeattractor_install_name_va(void);
uint32_t isaac_lua_engine_v69_updatestrangeattractor_install_caller_va(void);

uint32_t isaac_lua_engine_v69_removemoddata_va(void);
uint32_t isaac_lua_engine_v69_removemoddata_ret_va(void);
uint32_t isaac_lua_engine_v69_removemoddata_body_bytes(void); /* bytes = RET-VA */
int32_t isaac_lua_engine_v69_removemoddata_insn_count(void);
uint32_t isaac_lua_engine_v69_removemoddata_touserdata_index(void);
uint32_t isaac_lua_engine_v69_removemoddata_fn_off(void);
uint32_t isaac_lua_engine_v69_removemoddata_iat_lua_touserdata(void);
int32_t isaac_lua_engine_v69_removemoddata_return_value(void);
int32_t isaac_lua_engine_v69_removemoddata_install_count(void);
uint32_t isaac_lua_engine_v69_removemoddata_seh_handler_va(void);
uint32_t isaac_lua_engine_v69_removemoddata_builder_va(void);
uint32_t isaac_lua_engine_v69_removemoddata_rawgeti_helper_va(void);
uint32_t isaac_lua_engine_v69_removemoddata_lual_ref_iat_va(void);
uint32_t isaac_lua_engine_v69_removemoddata_lual_unref_iat_va(void);
uint32_t isaac_lua_engine_v69_removemoddata_registry_index_u32(void);
uint32_t isaac_lua_engine_v69_removemoddata_refnil_u32(void);
uint32_t isaac_lua_engine_v69_removemoddata_real_fn_arg_count(void);
uint32_t isaac_lua_engine_v69_removemoddata_real_fn_cleanup(void);
uint32_t isaac_lua_engine_v69_removemoddata_install_va(void);
uint32_t isaac_lua_engine_v69_removemoddata_install_ret_va(void);
uint32_t isaac_lua_engine_v69_removemoddata_install_literal_va(void);
uint32_t isaac_lua_engine_v69_removemoddata_install_real_fn_va(void);
uint32_t isaac_lua_engine_v69_removemoddata_install_name_va(void);
uint32_t isaac_lua_engine_v69_removemoddata_install_caller_va(void);

uint32_t isaac_lua_engine_v69_hashmoddata_va(void);
uint32_t isaac_lua_engine_v69_hashmoddata_ret_va(void);
uint32_t isaac_lua_engine_v69_hashmoddata_body_bytes(void); /* bytes = RET-VA */
int32_t isaac_lua_engine_v69_hashmoddata_insn_count(void);
uint32_t isaac_lua_engine_v69_hashmoddata_touserdata_index(void);
uint32_t isaac_lua_engine_v69_hashmoddata_fn_off(void);
uint32_t isaac_lua_engine_v69_hashmoddata_iat_lua_touserdata(void);
int32_t isaac_lua_engine_v69_hashmoddata_return_value(void);
int32_t isaac_lua_engine_v69_hashmoddata_install_count(void);
uint32_t isaac_lua_engine_v69_hashmoddata_seh_handler_va(void);
uint32_t isaac_lua_engine_v69_hashmoddata_builder_va(void);
uint32_t isaac_lua_engine_v69_hashmoddata_rawgeti_helper_va(void);
uint32_t isaac_lua_engine_v69_hashmoddata_lual_ref_iat_va(void);
uint32_t isaac_lua_engine_v69_hashmoddata_lual_unref_iat_va(void);
uint32_t isaac_lua_engine_v69_hashmoddata_registry_index_u32(void);
uint32_t isaac_lua_engine_v69_hashmoddata_refnil_u32(void);
uint32_t isaac_lua_engine_v69_hashmoddata_real_fn_arg_count(void);
uint32_t isaac_lua_engine_v69_hashmoddata_real_fn_cleanup(void);
uint32_t isaac_lua_engine_v69_hashmoddata_iat_lua_pushboolean(void);
uint32_t isaac_lua_engine_v69_hashmoddata_install_va(void);
uint32_t isaac_lua_engine_v69_hashmoddata_install_ret_va(void);
uint32_t isaac_lua_engine_v69_hashmoddata_install_literal_va(void);
uint32_t isaac_lua_engine_v69_hashmoddata_install_real_fn_va(void);
uint32_t isaac_lua_engine_v69_hashmoddata_install_name_va(void);
uint32_t isaac_lua_engine_v69_hashmoddata_install_caller_va(void);

uint32_t isaac_lua_engine_v69_loadmoddata_va(void);
uint32_t isaac_lua_engine_v69_loadmoddata_ret_va(void);
uint32_t isaac_lua_engine_v69_loadmoddata_body_bytes(void); /* bytes = RET-VA */
int32_t isaac_lua_engine_v69_loadmoddata_insn_count(void);
uint32_t isaac_lua_engine_v69_loadmoddata_touserdata_index(void);
uint32_t isaac_lua_engine_v69_loadmoddata_fn_off(void);
uint32_t isaac_lua_engine_v69_loadmoddata_iat_lua_touserdata(void);
int32_t isaac_lua_engine_v69_loadmoddata_return_value(void);
int32_t isaac_lua_engine_v69_loadmoddata_install_count(void);
uint32_t isaac_lua_engine_v69_loadmoddata_seh_handler_va(void);
uint32_t isaac_lua_engine_v69_loadmoddata_builder_va(void);
uint32_t isaac_lua_engine_v69_loadmoddata_rawgeti_helper_va(void);
uint32_t isaac_lua_engine_v69_loadmoddata_lual_ref_iat_va(void);
uint32_t isaac_lua_engine_v69_loadmoddata_lual_unref_iat_va(void);
uint32_t isaac_lua_engine_v69_loadmoddata_registry_index_u32(void);
uint32_t isaac_lua_engine_v69_loadmoddata_refnil_u32(void);
uint32_t isaac_lua_engine_v69_loadmoddata_real_fn_arg_count(void);
uint32_t isaac_lua_engine_v69_loadmoddata_real_fn_cleanup(void);
uint32_t isaac_lua_engine_v69_loadmoddata_iat_lua_pushlstring(void);
uint32_t isaac_lua_engine_v69_loadmoddata_sso_cap_u32(void);
uint32_t isaac_lua_engine_v69_loadmoddata_install_va(void);
uint32_t isaac_lua_engine_v69_loadmoddata_install_ret_va(void);
uint32_t isaac_lua_engine_v69_loadmoddata_install_literal_va(void);
uint32_t isaac_lua_engine_v69_loadmoddata_install_real_fn_va(void);
uint32_t isaac_lua_engine_v69_loadmoddata_install_name_va(void);
uint32_t isaac_lua_engine_v69_loadmoddata_install_caller_va(void);

uint32_t isaac_lua_engine_v69_savemoddata_va(void);
uint32_t isaac_lua_engine_v69_savemoddata_ret_va(void);
uint32_t isaac_lua_engine_v69_savemoddata_body_bytes(void); /* bytes = RET-VA */
int32_t isaac_lua_engine_v69_savemoddata_insn_count(void);
uint32_t isaac_lua_engine_v69_savemoddata_touserdata_index(void);
uint32_t isaac_lua_engine_v69_savemoddata_fn_off(void);
uint32_t isaac_lua_engine_v69_savemoddata_iat_lua_touserdata(void);
int32_t isaac_lua_engine_v69_savemoddata_return_value(void);
int32_t isaac_lua_engine_v69_savemoddata_install_count(void);
uint32_t isaac_lua_engine_v69_savemoddata_seh_handler_va(void);
uint32_t isaac_lua_engine_v69_savemoddata_builder_va(void);
uint32_t isaac_lua_engine_v69_savemoddata_rawgeti_helper_va(void);
uint32_t isaac_lua_engine_v69_savemoddata_lual_ref_iat_va(void);
uint32_t isaac_lua_engine_v69_savemoddata_lual_unref_iat_va(void);
uint32_t isaac_lua_engine_v69_savemoddata_registry_index_u32(void);
uint32_t isaac_lua_engine_v69_savemoddata_refnil_u32(void);
uint32_t isaac_lua_engine_v69_savemoddata_real_fn_arg_count(void);
uint32_t isaac_lua_engine_v69_savemoddata_real_fn_cleanup(void);
uint32_t isaac_lua_engine_v69_savemoddata_pushvalue_iat_va(void);
uint32_t isaac_lua_engine_v69_savemoddata_install_va(void);
uint32_t isaac_lua_engine_v69_savemoddata_install_ret_va(void);
uint32_t isaac_lua_engine_v69_savemoddata_install_literal_va(void);
uint32_t isaac_lua_engine_v69_savemoddata_install_real_fn_va(void);
uint32_t isaac_lua_engine_v69_savemoddata_install_name_va(void);
uint32_t isaac_lua_engine_v69_savemoddata_install_caller_va(void);

/* ---------------------------------------------------------------------------
 * ABI v70 - the 39-band 17-byte-record wrapper closure: SIX more
 * fourth-region wrapper bodies under ONE bump (v68/v69 precedent), from
 * the v59-v69 installer census cross-check
 * (scripts/decomp/census-v70-records.py). Shared laws (6/6): NO lua_type
 * gate, NO 0x85c590 check helper; direct lua_touserdata(L, 0xfff0b9d7)
 * IAT 0xb183b0; real_fn = ud[0] (FN_OFF 0); every gate/word uint32_t.
 * Installers: ret-8 helpers of the 0x895xxx..0x896xxx band; 17-byte
 * records `push fn; push name; mov ecx,<ref>; call` (record reads at
 * caller-11 fn imm / caller-6 name imm). identify-zhl: no exact match on
 * any of the six bodies. ScreenToWorld-family = ONE body, FIVE install
 * sites (ScreenToWorld/WorldToScreen/WorldToScreenDistance/
 * WorldToRenderPosition/ScreenToWorldDistance). RegisterMod 0x897f50 was
 * a v38 skip row ("SEH/host") but verify-open shows the SAME bounded-peel
 * SEH ref-pair template as the v69 mod-data band (spine in prologue,
 * pure string/ref prefix modeled, spine glued) -> landed. Explode
 * 0x898530 stays a census row (host-irreducible: 0x85c590 class-check /
 * 0x8baa50 wrap / luaL_checknumber / lua_type / call [ud]; xor eax,eax;
 * ret 0). 0x8c2850 TimeCounter stays a census row (real_fn literal
 * 0x264fc is NOT an image VA - table-dispatch by obj; existing closure
 * rows 0x8c2850/0x8c28b0 + property-family row [0x8952b0, 3, 0x8c2850,
 * 0x8c28b0, 1, 0x86da12, 0xb74c10, 0x264fc, 0x264fc] document it; do NOT
 * translate). Mod-data band 0x897a10..0x897d50 re-censused pin-exact
 * under the v69 bounded-peel law (handlers at prologue, pure prefix
 * modeled, SEH spine glued). See section-notes/lua-v70-8b9b20/NOTES.md.
 *
 * 0x008977f0 "GetMousePosition (toboolean bool lane + Vector wrap)" 54 insns ret 0x0089786f
 * 0x00897970 "ScreenToWorld-family x5 (getArgObject + Vector wrap)" 60 insns ret 0x00897a07
 * 0x00897f50 "RegisterMod (SEH ref-pair string, ret 0)" 146 insns ret 0x00898130
 * 0x00898140 "GetItemConfig (pushnil null gate class wrap)" 44 insns ret 0x00898198
 * 0x00898600 "GetFreeNearPosition (float lane + Vector wrap)" 64 insns ret 0x008986c7
 * 0x008986d0 "RenderScaledText (SEH string + 8 float lanes, ret 0)" 125 insns ret 0x00898889
 * ------------------------------------------------------------------------ */
enum {
  ISAAC_LUA_V70_GETMOUSEPOSITION_VA = 0x008977f0u,
  ISAAC_LUA_V70_GETMOUSEPOSITION_RET_VA = 0x0089786fu,
  ISAAC_LUA_V70_GETMOUSEPOSITION_INSNS = 54,
  ISAAC_LUA_V70_GETMOUSEPOSITION_TOUSERDATA_INDEX_U32 = 0xfff0b9d7u,
  ISAAC_LUA_V70_GETMOUSEPOSITION_FN_OFF = 0x00000000u,
  ISAAC_LUA_V70_GETMOUSEPOSITION_IAT_LUA_TOUSERDATA = 0x00b183b0u,
  ISAAC_LUA_V70_GETMOUSEPOSITION_IAT_LUA_TOBOOLEAN = 0x00b183e8u,
  ISAAC_LUA_V70_GETMOUSEPOSITION_TOBOOLEAN_INDEX_U32 = 0x00000001u,
  ISAAC_LUA_V70_GETMOUSEPOSITION_TOBOOLEAN_GATE_VA = 0x00897812u, /* test eax,eax; setne */
  ISAAC_LUA_V70_GETMOUSEPOSITION_REAL_FN_ARG_COUNT = 0x00000002u, /* &vec8, bool word */
  ISAAC_LUA_V70_GETMOUSEPOSITION_REAL_FN_CLEANUP = 0x00000034u,
  ISAAC_LUA_V70_GETMOUSEPOSITION_NEWUSERDATA_SIZE = 0x00000010u,
  ISAAC_LUA_V70_GETMOUSEPOSITION_UD_VTABLE_VA = 0x00b73574u, /* Vector tag */
  ISAAC_LUA_V70_GETMOUSEPOSITION_UD_OBJECT_OFF = 0x00000008u,
  ISAAC_LUA_V70_GETMOUSEPOSITION_RAWGETP_KEY = 0x00c82980u,
  ISAAC_LUA_V70_GETMOUSEPOSITION_REGISTRY_INDEX_U32 = 0xfff0b9d8u,
  ISAAC_LUA_V70_GETMOUSEPOSITION_SETMETA_INDEX_U32 = 0xfffffffeu, /* -2 */
  ISAAC_LUA_V70_GETMOUSEPOSITION_IAT_LUA_NEWUSERDATA = 0x00b1839cu,
  ISAAC_LUA_V70_GETMOUSEPOSITION_IAT_LUA_RAWGETP = 0x00b183bcu,
  ISAAC_LUA_V70_GETMOUSEPOSITION_IAT_LUA_SETMETATABLE = 0x00b18398u,
  ISAAC_LUA_V70_GETMOUSEPOSITION_RETURN_VALUE = 1,
  ISAAC_LUA_V70_GETMOUSEPOSITION_INSTALL_COUNT = 1,
  ISAAC_LUA_V70_GETMOUSEPOSITION_INSTALL_VA = 0x008967b0u,
  ISAAC_LUA_V70_GETMOUSEPOSITION_INSTALL_RET_VA = 0x00896808u,
  ISAAC_LUA_V70_GETMOUSEPOSITION_INSTALL_LITERAL_VA = 0x008967c1u,
  ISAAC_LUA_V70_GETMOUSEPOSITION_INSTALL_REAL_FN_VA = 0x0086fe50u, /* HOST */
  ISAAC_LUA_V70_GETMOUSEPOSITION_INSTALL_NAME_VA = 0x00b750fcu,
  ISAAC_LUA_V70_GETMOUSEPOSITION_INSTALL_CALLER_VA = 0x0086e18cu,
};

enum {
  ISAAC_LUA_V70_SCREENTOWORLD_VA = 0x00897970u,
  ISAAC_LUA_V70_SCREENTOWORLD_RET_VA = 0x00897a07u,
  ISAAC_LUA_V70_SCREENTOWORLD_INSNS = 60,
  ISAAC_LUA_V70_SCREENTOWORLD_TOUSERDATA_INDEX_U32 = 0xfff0b9d7u,
  ISAAC_LUA_V70_SCREENTOWORLD_FN_OFF = 0x00000000u,
  ISAAC_LUA_V70_SCREENTOWORLD_IAT_LUA_TOUSERDATA = 0x00b183b0u,
  ISAAC_LUA_V70_SCREENTOWORLD_GETARGOBJECT_VA = 0x008baa50u, /* host */
  ISAAC_LUA_V70_SCREENTOWORLD_GETARGOBJECT_ARG_INDEX_U32 = 0x00000001u,
  ISAAC_LUA_V70_SCREENTOWORLD_REAL_FN_ARG_COUNT = 0x00000002u, /* &vec8 out, &vec8 in */
  ISAAC_LUA_V70_SCREENTOWORLD_REAL_FN_CLEANUP = 0x0000002cu,
  ISAAC_LUA_V70_SCREENTOWORLD_NEWUSERDATA_SIZE = 0x00000010u,
  ISAAC_LUA_V70_SCREENTOWORLD_UD_VTABLE_VA = 0x00b73574u,
  ISAAC_LUA_V70_SCREENTOWORLD_UD_OBJECT_OFF = 0x00000008u,
  ISAAC_LUA_V70_SCREENTOWORLD_RAWGETP_KEY = 0x00c82980u,
  ISAAC_LUA_V70_SCREENTOWORLD_REGISTRY_INDEX_U32 = 0xfff0b9d8u,
  ISAAC_LUA_V70_SCREENTOWORLD_SETMETA_INDEX_U32 = 0xfffffffeu,
  ISAAC_LUA_V70_SCREENTOWORLD_IAT_LUA_NEWUSERDATA = 0x00b1839cu,
  ISAAC_LUA_V70_SCREENTOWORLD_IAT_LUA_RAWGETP = 0x00b183bcu,
  ISAAC_LUA_V70_SCREENTOWORLD_IAT_LUA_SETMETATABLE = 0x00b18398u,
  ISAAC_LUA_V70_SCREENTOWORLD_RETURN_VALUE = 1,
  ISAAC_LUA_V70_SCREENTOWORLD_INSTALL_COUNT = 5,
  ISAAC_LUA_V70_SCREENTOWORLD_INSTALL_VA = 0x00896630u,
  ISAAC_LUA_V70_SCREENTOWORLD_INSTALL_RET_VA = 0x00896689u,
  ISAAC_LUA_V70_SCREENTOWORLD_INSTALL_LITERAL_VA = 0x00896647u,
  ISAAC_LUA_V70_SCREENTOWORLD_INSTALL_REAL_FN_VA = 0x00870160u, /* HOST */
  ISAAC_LUA_V70_SCREENTOWORLD_INSTALL_NAME_VA = 0x00b7500cu,
  ISAAC_LUA_V70_SCREENTOWORLD_INSTALL_CALLER_VA = 0x0086e044u,
};

enum {
  ISAAC_LUA_V70_REGISTERMOD_VA = 0x00897f50u,
  ISAAC_LUA_V70_REGISTERMOD_RET_VA = 0x00898130u,
  ISAAC_LUA_V70_REGISTERMOD_INSNS = 146,
  ISAAC_LUA_V70_REGISTERMOD_TOUSERDATA_INDEX_U32 = 0xfff0b9d7u,
  ISAAC_LUA_V70_REGISTERMOD_FN_OFF = 0x00000000u,
  ISAAC_LUA_V70_REGISTERMOD_IAT_LUA_TOUSERDATA = 0x00b183b0u,
  ISAAC_LUA_V70_REGISTERMOD_SEH_HANDLER_VA = 0x00b05108u,
  ISAAC_LUA_V70_REGISTERMOD_BUILDER_VA = 0x008ba5e0u, /* host pin */
  ISAAC_LUA_V70_REGISTERMOD_RAWGETI_HELPER_VA = 0x006a80f0u, /* shared 18-caller host helper */
  ISAAC_LUA_V70_REGISTERMOD_LUAL_REF_IAT_VA = 0x00b18314u,
  ISAAC_LUA_V70_REGISTERMOD_LUAL_UNREF_IAT_VA = 0x00b1831cu,
  ISAAC_LUA_V70_REGISTERMOD_PUSHVALUE_IAT_VA = 0x00b183c8u,
  ISAAC_LUA_V70_REGISTERMOD_STRING_COPY_CTOR_VA = 0x0040cf50u, /* host */
  ISAAC_LUA_V70_REGISTERMOD_STRING_DTOR_VA = 0x0040d040u, /* host */
  ISAAC_LUA_V70_REGISTERMOD_REGISTRY_INDEX_U32 = 0xfff0b9d8u,
  ISAAC_LUA_V70_REGISTERMOD_REFNIL_U32 = 0xffffffffu, /* LUA_REFNIL */
  ISAAC_LUA_V70_REGISTERMOD_REAL_FN_ARG_COUNT = 0x00000004u, /* 2 strings + ref pair */
  ISAAC_LUA_V70_REGISTERMOD_REAL_FN_CLEANUP = 0x00000010u,
  ISAAC_LUA_V70_REGISTERMOD_RETURN_VALUE = 0,
  ISAAC_LUA_V70_REGISTERMOD_INSTALL_COUNT = 1,
  ISAAC_LUA_V70_REGISTERMOD_INSTALL_VA = 0x00896390u,
  ISAAC_LUA_V70_REGISTERMOD_INSTALL_RET_VA = 0x008963e8u,
  ISAAC_LUA_V70_REGISTERMOD_INSTALL_LITERAL_VA = 0x008963a1u,
  ISAAC_LUA_V70_REGISTERMOD_INSTALL_REAL_FN_VA = 0x00870f40u, /* HOST */
  ISAAC_LUA_V70_REGISTERMOD_INSTALL_NAME_VA = 0x00b74f44u,
  ISAAC_LUA_V70_REGISTERMOD_INSTALL_CALLER_VA = 0x0086dfcdu,
};

enum {
  ISAAC_LUA_V70_GETITEMCONFIG_VA = 0x00898140u,
  ISAAC_LUA_V70_GETITEMCONFIG_RET_VA = 0x00898198u,
  ISAAC_LUA_V70_GETITEMCONFIG_NIL_RET_VA = 0x008981abu,
  ISAAC_LUA_V70_GETITEMCONFIG_INSNS = 44,
  ISAAC_LUA_V70_GETITEMCONFIG_TOUSERDATA_INDEX_U32 = 0xfff0b9d7u,
  ISAAC_LUA_V70_GETITEMCONFIG_FN_OFF = 0x00000000u,
  ISAAC_LUA_V70_GETITEMCONFIG_IAT_LUA_TOUSERDATA = 0x00b183b0u,
  ISAAC_LUA_V70_GETITEMCONFIG_NULL_GATE_VA = 0x0089815du, /* test edi,edi; je nil */
  ISAAC_LUA_V70_GETITEMCONFIG_NEWUSERDATA_SIZE = 0x00000008u,
  ISAAC_LUA_V70_GETITEMCONFIG_UD_VTABLE_VA = 0x00b753c8u,
  ISAAC_LUA_V70_GETITEMCONFIG_UD_OBJECT_OFF = 0x00000004u,
  ISAAC_LUA_V70_GETITEMCONFIG_RAWGETP_KEY = 0x00c829adu,
  ISAAC_LUA_V70_GETITEMCONFIG_REGISTRY_INDEX_U32 = 0xfff0b9d8u,
  ISAAC_LUA_V70_GETITEMCONFIG_SETMETA_INDEX_U32 = 0xfffffffeu,
  ISAAC_LUA_V70_GETITEMCONFIG_IAT_LUA_NEWUSERDATA = 0x00b1839cu,
  ISAAC_LUA_V70_GETITEMCONFIG_IAT_LUA_RAWGETP = 0x00b183bcu,
  ISAAC_LUA_V70_GETITEMCONFIG_IAT_LUA_SETMETATABLE = 0x00b18398u,
  ISAAC_LUA_V70_GETITEMCONFIG_IAT_LUA_PUSHNIL = 0x00b183e0u,
  ISAAC_LUA_V70_GETITEMCONFIG_REAL_FN_ARG_COUNT = 0x00000000u,
  ISAAC_LUA_V70_GETITEMCONFIG_REAL_FN_CLEANUP = 0x0000001cu,
  ISAAC_LUA_V70_GETITEMCONFIG_RETURN_VALUE = 1,
  ISAAC_LUA_V70_GETITEMCONFIG_INSTALL_COUNT = 1,
  ISAAC_LUA_V70_GETITEMCONFIG_INSTALL_VA = 0x00896330u,
  ISAAC_LUA_V70_GETITEMCONFIG_INSTALL_RET_VA = 0x00896388u,
  ISAAC_LUA_V70_GETITEMCONFIG_INSTALL_LITERAL_VA = 0x00896341u,
  ISAAC_LUA_V70_GETITEMCONFIG_INSTALL_REAL_FN_VA = 0x0042ca00u, /* HOST */
  ISAAC_LUA_V70_GETITEMCONFIG_INSTALL_NAME_VA = 0x00b74eacu,
  ISAAC_LUA_V70_GETITEMCONFIG_INSTALL_CALLER_VA = 0x0086df67u,
};

enum {
  ISAAC_LUA_V70_GETFREENEARPOSITION_VA = 0x00898600u,
  ISAAC_LUA_V70_GETFREENEARPOSITION_RET_VA = 0x008986c7u,
  ISAAC_LUA_V70_GETFREENEARPOSITION_INSNS = 64,
  ISAAC_LUA_V70_GETFREENEARPOSITION_TOUSERDATA_INDEX_U32 = 0xfff0b9d7u,
  ISAAC_LUA_V70_GETFREENEARPOSITION_FN_OFF = 0x00000000u,
  ISAAC_LUA_V70_GETFREENEARPOSITION_IAT_LUA_TOUSERDATA = 0x00b183b0u,
  ISAAC_LUA_V70_GETFREENEARPOSITION_CHECKNUMBER_IAT_VA = 0x00b18324u,
  ISAAC_LUA_V70_GETFREENEARPOSITION_ARG2_CHECKNUMBER_INDEX_U32 = 0x00000002u,
  ISAAC_LUA_V70_GETFREENEARPOSITION_GETARGOBJECT_VA = 0x008baa50u, /* host */
  ISAAC_LUA_V70_GETFREENEARPOSITION_GETARGOBJECT_ARG_INDEX_U32 = 0x00000001u,
  ISAAC_LUA_V70_GETFREENEARPOSITION_REAL_FN_ARG_COUNT = 0x00000002u, /* &vec8 out, &vec8 in */
  ISAAC_LUA_V70_GETFREENEARPOSITION_REAL_FN_CLEANUP = 0x00000028u,
  ISAAC_LUA_V70_GETFREENEARPOSITION_NEWUSERDATA_SIZE = 0x00000010u,
  ISAAC_LUA_V70_GETFREENEARPOSITION_UD_VTABLE_VA = 0x00b73574u,
  ISAAC_LUA_V70_GETFREENEARPOSITION_UD_OBJECT_OFF = 0x00000008u,
  ISAAC_LUA_V70_GETFREENEARPOSITION_RAWGETP_KEY = 0x00c82980u,
  ISAAC_LUA_V70_GETFREENEARPOSITION_REGISTRY_INDEX_U32 = 0xfff0b9d8u,
  ISAAC_LUA_V70_GETFREENEARPOSITION_SETMETA_INDEX_U32 = 0xfffffffeu,
  ISAAC_LUA_V70_GETFREENEARPOSITION_IAT_LUA_NEWUSERDATA = 0x00b1839cu,
  ISAAC_LUA_V70_GETFREENEARPOSITION_IAT_LUA_RAWGETP = 0x00b183bcu,
  ISAAC_LUA_V70_GETFREENEARPOSITION_IAT_LUA_SETMETATABLE = 0x00b18398u,
  ISAAC_LUA_V70_GETFREENEARPOSITION_RETURN_VALUE = 1,
  ISAAC_LUA_V70_GETFREENEARPOSITION_INSTALL_COUNT = 1,
  ISAAC_LUA_V70_GETFREENEARPOSITION_INSTALL_VA = 0x00896090u,
  ISAAC_LUA_V70_GETFREENEARPOSITION_INSTALL_RET_VA = 0x008960e8u,
  ISAAC_LUA_V70_GETFREENEARPOSITION_INSTALL_LITERAL_VA = 0x008960a1u,
  ISAAC_LUA_V70_GETFREENEARPOSITION_INSTALL_REAL_FN_VA = 0x0086f3d0u, /* HOST */
  ISAAC_LUA_V70_GETFREENEARPOSITION_INSTALL_NAME_VA = 0x00b74ddcu,
  ISAAC_LUA_V70_GETFREENEARPOSITION_INSTALL_CALLER_VA = 0x0086de13u,
};

enum {
  ISAAC_LUA_V70_RENDERSCALEDTEXT_VA = 0x008986d0u,
  ISAAC_LUA_V70_RENDERSCALEDTEXT_RET_VA = 0x00898889u,
  ISAAC_LUA_V70_RENDERSCALEDTEXT_INSNS = 125,
  ISAAC_LUA_V70_RENDERSCALEDTEXT_TOUSERDATA_INDEX_U32 = 0xfff0b9d7u,
  ISAAC_LUA_V70_RENDERSCALEDTEXT_FN_OFF = 0x00000000u,
  ISAAC_LUA_V70_RENDERSCALEDTEXT_IAT_LUA_TOUSERDATA = 0x00b183b0u,
  ISAAC_LUA_V70_RENDERSCALEDTEXT_SEH_HANDLER_VA = 0x00b05230u,
  ISAAC_LUA_V70_RENDERSCALEDTEXT_BUILDER_VA = 0x008ba1e0u, /* host pin */
  ISAAC_LUA_V70_RENDERSCALEDTEXT_CHECKLSTRING_IAT_VA = 0x00b183e4u,
  ISAAC_LUA_V70_RENDERSCALEDTEXT_CHECKLSTRING_INDEX_U32 = 0x00000001u,
  ISAAC_LUA_V70_RENDERSCALEDTEXT_STRING_ASSIGN_VA = 0x0040ccd0u, /* host */
  ISAAC_LUA_V70_RENDERSCALEDTEXT_STRING_COPY_CTOR_VA = 0x0040cf50u, /* host */
  ISAAC_LUA_V70_RENDERSCALEDTEXT_STRING_DTOR_VA = 0x0040d040u, /* host */
  ISAAC_LUA_V70_RENDERSCALEDTEXT_SSO_CAP_U32 = 0x00000010u,
  ISAAC_LUA_V70_RENDERSCALEDTEXT_FLOAT_LANE_COUNT = 0x00000008u,
  ISAAC_LUA_V70_RENDERSCALEDTEXT_REAL_FN_ARG_COUNT = 0x00000009u, /* string + 8 f32 */
  ISAAC_LUA_V70_RENDERSCALEDTEXT_REAL_FN_CLEANUP = 0x00000024u,
  ISAAC_LUA_V70_RENDERSCALEDTEXT_RETURN_VALUE = 0,
  ISAAC_LUA_V70_RENDERSCALEDTEXT_INSTALL_COUNT = 1,
  ISAAC_LUA_V70_RENDERSCALEDTEXT_INSTALL_VA = 0x00895fd0u,
  ISAAC_LUA_V70_RENDERSCALEDTEXT_INSTALL_RET_VA = 0x00896028u,
  ISAAC_LUA_V70_RENDERSCALEDTEXT_INSTALL_LITERAL_VA = 0x00895fe1u,
  ISAAC_LUA_V70_RENDERSCALEDTEXT_INSTALL_REAL_FN_VA = 0x0086f280u, /* HOST */
  ISAAC_LUA_V70_RENDERSCALEDTEXT_INSTALL_NAME_VA = 0x00b74cfcu,
  ISAAC_LUA_V70_RENDERSCALEDTEXT_INSTALL_CALLER_VA = 0x0086dde0u,
};

enum {
  ISAAC_LUA_V70_SCREENTOWORLD_SITE_COUNT = 5,
};

enum {
  ISAAC_LUA_V70_SCREENTOWORLD_SITE_0_CALLER_VA = 0x0086e044u,
  ISAAC_LUA_V70_SCREENTOWORLD_SITE_0_REAL_FN_VA = 0x00870160u, /* HOST */
  ISAAC_LUA_V70_SCREENTOWORLD_SITE_0_NAME_VA = 0x00b7500cu,
};

enum {
  ISAAC_LUA_V70_SCREENTOWORLD_SITE_1_CALLER_VA = 0x0086e055u,
  ISAAC_LUA_V70_SCREENTOWORLD_SITE_1_REAL_FN_VA = 0x00870220u, /* HOST */
  ISAAC_LUA_V70_SCREENTOWORLD_SITE_1_NAME_VA = 0x00b74fd4u,
};

enum {
  ISAAC_LUA_V70_SCREENTOWORLD_SITE_2_CALLER_VA = 0x0086e066u,
  ISAAC_LUA_V70_SCREENTOWORLD_SITE_2_REAL_FN_VA = 0x00870390u, /* HOST */
  ISAAC_LUA_V70_SCREENTOWORLD_SITE_2_NAME_VA = 0x00b74fe4u,
};

enum {
  ISAAC_LUA_V70_SCREENTOWORLD_SITE_3_CALLER_VA = 0x0086e077u,
  ISAAC_LUA_V70_SCREENTOWORLD_SITE_3_REAL_FN_VA = 0x008703c0u, /* HOST */
  ISAAC_LUA_V70_SCREENTOWORLD_SITE_3_NAME_VA = 0x00b74fa4u,
};

enum {
  ISAAC_LUA_V70_SCREENTOWORLD_SITE_4_CALLER_VA = 0x0086e088u,
  ISAAC_LUA_V70_SCREENTOWORLD_SITE_4_REAL_FN_VA = 0x008704c0u, /* HOST */
  ISAAC_LUA_V70_SCREENTOWORLD_SITE_4_NAME_VA = 0x00b74fbcu,
};

/* BYTE gate `test eax,eax; setne` @0x897812/0x897817: bool word from
 * lua_toboolean(L,1). PE setne stores 0/1; wide input narrows to AL. */
uint32_t isaac_lua_engine_v70_getmouseposition_bool_gate(uint32_t toboolean_result);
/* FULL-WORD null gate `test edi,edi; je` @0x89815d: obj==0 -> pushnil path. */
uint32_t isaac_lua_engine_v70_getitemconfig_null_gate(uint32_t real_fn_result);
/* LUA_REFNIL gate `cmp ref,-1; je` (3 sites: @0x897fcb/0x89802e/0x8980a2). */
uint32_t isaac_lua_engine_v70_registermod_refnil_gate(int32_t ref);

uint32_t isaac_lua_engine_v70_getmouseposition_va(void);
uint32_t isaac_lua_engine_v70_getmouseposition_ret_va(void);
uint32_t isaac_lua_engine_v70_getmouseposition_body_bytes(void);
int32_t isaac_lua_engine_v70_getmouseposition_insn_count(void);
uint32_t isaac_lua_engine_v70_getmouseposition_touserdata_index(void);
uint32_t isaac_lua_engine_v70_getmouseposition_fn_off(void);
uint32_t isaac_lua_engine_v70_getmouseposition_iat_lua_touserdata(void);
uint32_t isaac_lua_engine_v70_getmouseposition_iat_lua_toboolean(void);
uint32_t isaac_lua_engine_v70_getmouseposition_toboolean_index_u32(void);
uint32_t isaac_lua_engine_v70_getmouseposition_toboolean_gate_va(void);
uint32_t isaac_lua_engine_v70_getmouseposition_real_fn_arg_count(void);
uint32_t isaac_lua_engine_v70_getmouseposition_real_fn_cleanup(void);
uint32_t isaac_lua_engine_v70_getmouseposition_newuserdata_size(void);
uint32_t isaac_lua_engine_v70_getmouseposition_ud_vtable_va(void);
uint32_t isaac_lua_engine_v70_getmouseposition_ud_object_off(void);
uint32_t isaac_lua_engine_v70_getmouseposition_rawgetp_key(void);
uint32_t isaac_lua_engine_v70_getmouseposition_registry_index_u32(void);
uint32_t isaac_lua_engine_v70_getmouseposition_setmeta_index_u32(void);
uint32_t isaac_lua_engine_v70_getmouseposition_iat_lua_newuserdata(void);
uint32_t isaac_lua_engine_v70_getmouseposition_iat_lua_rawgetp(void);
uint32_t isaac_lua_engine_v70_getmouseposition_iat_lua_setmetatable(void);
int32_t isaac_lua_engine_v70_getmouseposition_return_value(void);
int32_t isaac_lua_engine_v70_getmouseposition_install_count(void);
uint32_t isaac_lua_engine_v70_getmouseposition_install_va(void);
uint32_t isaac_lua_engine_v70_getmouseposition_install_ret_va(void);
uint32_t isaac_lua_engine_v70_getmouseposition_install_literal_va(void);
uint32_t isaac_lua_engine_v70_getmouseposition_install_real_fn_va(void);
uint32_t isaac_lua_engine_v70_getmouseposition_install_name_va(void);
uint32_t isaac_lua_engine_v70_getmouseposition_install_caller_va(void);

uint32_t isaac_lua_engine_v70_screentoworld_va(void);
uint32_t isaac_lua_engine_v70_screentoworld_ret_va(void);
uint32_t isaac_lua_engine_v70_screentoworld_body_bytes(void);
int32_t isaac_lua_engine_v70_screentoworld_insn_count(void);
uint32_t isaac_lua_engine_v70_screentoworld_touserdata_index(void);
uint32_t isaac_lua_engine_v70_screentoworld_fn_off(void);
uint32_t isaac_lua_engine_v70_screentoworld_iat_lua_touserdata(void);
uint32_t isaac_lua_engine_v70_screentoworld_getargobject_va(void);
uint32_t isaac_lua_engine_v70_screentoworld_getargobject_arg_index_u32(void);
uint32_t isaac_lua_engine_v70_screentoworld_real_fn_arg_count(void);
uint32_t isaac_lua_engine_v70_screentoworld_real_fn_cleanup(void);
uint32_t isaac_lua_engine_v70_screentoworld_newuserdata_size(void);
uint32_t isaac_lua_engine_v70_screentoworld_ud_vtable_va(void);
uint32_t isaac_lua_engine_v70_screentoworld_ud_object_off(void);
uint32_t isaac_lua_engine_v70_screentoworld_rawgetp_key(void);
uint32_t isaac_lua_engine_v70_screentoworld_registry_index_u32(void);
uint32_t isaac_lua_engine_v70_screentoworld_setmeta_index_u32(void);
uint32_t isaac_lua_engine_v70_screentoworld_iat_lua_newuserdata(void);
uint32_t isaac_lua_engine_v70_screentoworld_iat_lua_rawgetp(void);
uint32_t isaac_lua_engine_v70_screentoworld_iat_lua_setmetatable(void);
int32_t isaac_lua_engine_v70_screentoworld_return_value(void);
int32_t isaac_lua_engine_v70_screentoworld_install_count(void);
uint32_t isaac_lua_engine_v70_screentoworld_install_va(void);
uint32_t isaac_lua_engine_v70_screentoworld_install_ret_va(void);
uint32_t isaac_lua_engine_v70_screentoworld_install_literal_va(void);
uint32_t isaac_lua_engine_v70_screentoworld_install_real_fn_va(void);
uint32_t isaac_lua_engine_v70_screentoworld_install_name_va(void);
uint32_t isaac_lua_engine_v70_screentoworld_install_caller_va(void);
int32_t isaac_lua_engine_v70_screentoworld_site_count(void);
uint32_t isaac_lua_engine_v70_screentoworld_site_caller_va_at(int32_t index);
uint32_t isaac_lua_engine_v70_screentoworld_site_real_fn_va_at(int32_t index);
uint32_t isaac_lua_engine_v70_screentoworld_site_name_va_at(int32_t index);

uint32_t isaac_lua_engine_v70_registermod_va(void);
uint32_t isaac_lua_engine_v70_registermod_ret_va(void);
uint32_t isaac_lua_engine_v70_registermod_body_bytes(void);
int32_t isaac_lua_engine_v70_registermod_insn_count(void);
uint32_t isaac_lua_engine_v70_registermod_touserdata_index(void);
uint32_t isaac_lua_engine_v70_registermod_fn_off(void);
uint32_t isaac_lua_engine_v70_registermod_iat_lua_touserdata(void);
uint32_t isaac_lua_engine_v70_registermod_seh_handler_va(void);
uint32_t isaac_lua_engine_v70_registermod_builder_va(void);
uint32_t isaac_lua_engine_v70_registermod_rawgeti_helper_va(void);
uint32_t isaac_lua_engine_v70_registermod_lual_ref_iat_va(void);
uint32_t isaac_lua_engine_v70_registermod_lual_unref_iat_va(void);
uint32_t isaac_lua_engine_v70_registermod_pushvalue_iat_va(void);
uint32_t isaac_lua_engine_v70_registermod_string_copy_ctor_va(void);
uint32_t isaac_lua_engine_v70_registermod_string_dtor_va(void);
uint32_t isaac_lua_engine_v70_registermod_registry_index_u32(void);
uint32_t isaac_lua_engine_v70_registermod_refnil_u32(void);
uint32_t isaac_lua_engine_v70_registermod_real_fn_arg_count(void);
uint32_t isaac_lua_engine_v70_registermod_real_fn_cleanup(void);
int32_t isaac_lua_engine_v70_registermod_return_value(void);
int32_t isaac_lua_engine_v70_registermod_install_count(void);
uint32_t isaac_lua_engine_v70_registermod_install_va(void);
uint32_t isaac_lua_engine_v70_registermod_install_ret_va(void);
uint32_t isaac_lua_engine_v70_registermod_install_literal_va(void);
uint32_t isaac_lua_engine_v70_registermod_install_real_fn_va(void);
uint32_t isaac_lua_engine_v70_registermod_install_name_va(void);
uint32_t isaac_lua_engine_v70_registermod_install_caller_va(void);

uint32_t isaac_lua_engine_v70_getitemconfig_va(void);
uint32_t isaac_lua_engine_v70_getitemconfig_ret_va(void);
uint32_t isaac_lua_engine_v70_getitemconfig_nil_ret_va(void);
uint32_t isaac_lua_engine_v70_getitemconfig_body_bytes(void);
int32_t isaac_lua_engine_v70_getitemconfig_insn_count(void);
uint32_t isaac_lua_engine_v70_getitemconfig_touserdata_index(void);
uint32_t isaac_lua_engine_v70_getitemconfig_fn_off(void);
uint32_t isaac_lua_engine_v70_getitemconfig_iat_lua_touserdata(void);
uint32_t isaac_lua_engine_v70_getitemconfig_null_gate_va(void);
uint32_t isaac_lua_engine_v70_getitemconfig_newuserdata_size(void);
uint32_t isaac_lua_engine_v70_getitemconfig_ud_vtable_va(void);
uint32_t isaac_lua_engine_v70_getitemconfig_ud_object_off(void);
uint32_t isaac_lua_engine_v70_getitemconfig_rawgetp_key(void);
uint32_t isaac_lua_engine_v70_getitemconfig_registry_index_u32(void);
uint32_t isaac_lua_engine_v70_getitemconfig_setmeta_index_u32(void);
uint32_t isaac_lua_engine_v70_getitemconfig_iat_lua_newuserdata(void);
uint32_t isaac_lua_engine_v70_getitemconfig_iat_lua_rawgetp(void);
uint32_t isaac_lua_engine_v70_getitemconfig_iat_lua_setmetatable(void);
uint32_t isaac_lua_engine_v70_getitemconfig_iat_lua_pushnil(void);
uint32_t isaac_lua_engine_v70_getitemconfig_real_fn_arg_count(void);
uint32_t isaac_lua_engine_v70_getitemconfig_real_fn_cleanup(void);
int32_t isaac_lua_engine_v70_getitemconfig_return_value(void);
int32_t isaac_lua_engine_v70_getitemconfig_install_count(void);
uint32_t isaac_lua_engine_v70_getitemconfig_install_va(void);
uint32_t isaac_lua_engine_v70_getitemconfig_install_ret_va(void);
uint32_t isaac_lua_engine_v70_getitemconfig_install_literal_va(void);
uint32_t isaac_lua_engine_v70_getitemconfig_install_real_fn_va(void);
uint32_t isaac_lua_engine_v70_getitemconfig_install_name_va(void);
uint32_t isaac_lua_engine_v70_getitemconfig_install_caller_va(void);

uint32_t isaac_lua_engine_v70_getfreenearposition_va(void);
uint32_t isaac_lua_engine_v70_getfreenearposition_ret_va(void);
uint32_t isaac_lua_engine_v70_getfreenearposition_body_bytes(void);
int32_t isaac_lua_engine_v70_getfreenearposition_insn_count(void);
uint32_t isaac_lua_engine_v70_getfreenearposition_touserdata_index(void);
uint32_t isaac_lua_engine_v70_getfreenearposition_fn_off(void);
uint32_t isaac_lua_engine_v70_getfreenearposition_iat_lua_touserdata(void);
uint32_t isaac_lua_engine_v70_getfreenearposition_checknumber_iat_va(void);
uint32_t isaac_lua_engine_v70_getfreenearposition_arg2_checknumber_index_u32(void);
uint32_t isaac_lua_engine_v70_getfreenearposition_getargobject_va(void);
uint32_t isaac_lua_engine_v70_getfreenearposition_getargobject_arg_index_u32(void);
uint32_t isaac_lua_engine_v70_getfreenearposition_real_fn_arg_count(void);
uint32_t isaac_lua_engine_v70_getfreenearposition_real_fn_cleanup(void);
uint32_t isaac_lua_engine_v70_getfreenearposition_newuserdata_size(void);
uint32_t isaac_lua_engine_v70_getfreenearposition_ud_vtable_va(void);
uint32_t isaac_lua_engine_v70_getfreenearposition_ud_object_off(void);
uint32_t isaac_lua_engine_v70_getfreenearposition_rawgetp_key(void);
uint32_t isaac_lua_engine_v70_getfreenearposition_registry_index_u32(void);
uint32_t isaac_lua_engine_v70_getfreenearposition_setmeta_index_u32(void);
uint32_t isaac_lua_engine_v70_getfreenearposition_iat_lua_newuserdata(void);
uint32_t isaac_lua_engine_v70_getfreenearposition_iat_lua_rawgetp(void);
uint32_t isaac_lua_engine_v70_getfreenearposition_iat_lua_setmetatable(void);
int32_t isaac_lua_engine_v70_getfreenearposition_return_value(void);
int32_t isaac_lua_engine_v70_getfreenearposition_install_count(void);
uint32_t isaac_lua_engine_v70_getfreenearposition_install_va(void);
uint32_t isaac_lua_engine_v70_getfreenearposition_install_ret_va(void);
uint32_t isaac_lua_engine_v70_getfreenearposition_install_literal_va(void);
uint32_t isaac_lua_engine_v70_getfreenearposition_install_real_fn_va(void);
uint32_t isaac_lua_engine_v70_getfreenearposition_install_name_va(void);
uint32_t isaac_lua_engine_v70_getfreenearposition_install_caller_va(void);

uint32_t isaac_lua_engine_v70_renderscaledtext_va(void);
uint32_t isaac_lua_engine_v70_renderscaledtext_ret_va(void);
uint32_t isaac_lua_engine_v70_renderscaledtext_body_bytes(void);
int32_t isaac_lua_engine_v70_renderscaledtext_insn_count(void);
uint32_t isaac_lua_engine_v70_renderscaledtext_touserdata_index(void);
uint32_t isaac_lua_engine_v70_renderscaledtext_fn_off(void);
uint32_t isaac_lua_engine_v70_renderscaledtext_iat_lua_touserdata(void);
uint32_t isaac_lua_engine_v70_renderscaledtext_seh_handler_va(void);
uint32_t isaac_lua_engine_v70_renderscaledtext_builder_va(void);
uint32_t isaac_lua_engine_v70_renderscaledtext_checklstring_iat_va(void);
uint32_t isaac_lua_engine_v70_renderscaledtext_checklstring_index_u32(void);
uint32_t isaac_lua_engine_v70_renderscaledtext_string_assign_va(void);
uint32_t isaac_lua_engine_v70_renderscaledtext_string_copy_ctor_va(void);
uint32_t isaac_lua_engine_v70_renderscaledtext_string_dtor_va(void);
uint32_t isaac_lua_engine_v70_renderscaledtext_sso_cap_u32(void);
uint32_t isaac_lua_engine_v70_renderscaledtext_float_lane_count(void);
uint32_t isaac_lua_engine_v70_renderscaledtext_real_fn_arg_count(void);
uint32_t isaac_lua_engine_v70_renderscaledtext_real_fn_cleanup(void);
int32_t isaac_lua_engine_v70_renderscaledtext_return_value(void);
int32_t isaac_lua_engine_v70_renderscaledtext_install_count(void);
uint32_t isaac_lua_engine_v70_renderscaledtext_install_va(void);
uint32_t isaac_lua_engine_v70_renderscaledtext_install_ret_va(void);
uint32_t isaac_lua_engine_v70_renderscaledtext_install_literal_va(void);
uint32_t isaac_lua_engine_v70_renderscaledtext_install_real_fn_va(void);
uint32_t isaac_lua_engine_v70_renderscaledtext_install_name_va(void);
uint32_t isaac_lua_engine_v70_renderscaledtext_install_caller_va(void);

/* ---------------------------------------------------------------------------
 * ABI v71 - the 0x8991f0..0x8995c0 band (5 wrappers, one bump).
 * LEA-CORRECTED caller census: the v70 span-last helper attribution was
 * multi-body-contaminated (helper 0x892790 pushes 0x8b5ed0 NOT 0x8994f0;
 * 0x8925c0 pushes 0x8994f0; 0x892060 pushes 0x8b5be0). Direct per-body
 * reading: IsStringValidSeed/IsSpecialSeed 0x8992e0 (SEH bounded-peel,
 * BYTE bool gate + pushboolean), Seed2String 0x899390 (checkinteger +
 * pushlstring, SSO/free gates), RemoveCurses 0x8994f0 (lua_type FULL-WORD
 * gate key 0xc82a0a + checkinteger + 1-arg [ud] ret 0), GetDungeonPlacementSeed
 * 0x899560 (type gate + thiscall + pusher ROW 1 0x85bff0, FULL-WORD result),
 * DungeonReturnPosition setter 0x8995c0 (TWO type gates, 2nd key 0xc82980
 * VECTOR, vec2 float args ret 0). Explode 0x898530 re-verified: NO pure
 * decision prefix before the first host call (lua_touserdata @0x898554;
 * +0x24 frame setup only) -> census row, do not translate.
 * See section-notes/lua-v71-8992e0/NOTES.md.
 *
 * 0x008992e0 "IsStringValidSeed/IsSpecialSeed (SEH + byte bool)" 61 insns ret 0x0089938e
 * 0x00899390 "Seed2String (checkinteger + pushlstring)" 58 insns ret 0x00899434
 * 0x008994f0 "RemoveCurses (type gate + 1-arg thiscall, ret 0)" 41 insns ret 0x0089955b
 * 0x00899560 "GetDungeonPlacementSeed (type gate + ROW-1 bool)" 35 insns ret 0x008995bb
 * 0x008995c0 "DungeonReturnPosition setter (vec2 float args, ret 0)" 56 insns ret 0x0089966c
 * ------------------------------------------------------------------------ */
enum {
  ISAAC_LUA_V71_ISSTRINGVALIDSEED_VA = 0x008992e0u,
  ISAAC_LUA_V71_ISSTRINGVALIDSEED_RET_VA = 0x0089938eu,
  ISAAC_LUA_V71_ISSTRINGVALIDSEED_INSNS = 61,
  ISAAC_LUA_V71_ISSTRINGVALIDSEED_TOUSERDATA_INDEX_U32 = 0xfff0b9d7u,
  ISAAC_LUA_V71_ISSTRINGVALIDSEED_FN_OFF = 0x00000000u,
  ISAAC_LUA_V71_ISSTRINGVALIDSEED_IAT_LUA_TOUSERDATA = 0x00b183b0u,
  ISAAC_LUA_V71_ISSTRINGVALIDSEED_SEH_HANDLER_VA = 0x00b05305u,
  ISAAC_LUA_V71_ISSTRINGVALIDSEED_CHECK_STRING_BUILDER_VA = 0x008b9ff0u, /* host pin */
  ISAAC_LUA_V71_ISSTRINGVALIDSEED_STRING_COPY_CTOR_VA = 0x0040cf50u, /* host */
  ISAAC_LUA_V71_ISSTRINGVALIDSEED_STRING_DTOR_VA = 0x0040d040u, /* host */
  ISAAC_LUA_V71_ISSTRINGVALIDSEED_REAL_FN_ARG_COUNT = 0x00000001u,
  ISAAC_LUA_V71_ISSTRINGVALIDSEED_REAL_FN_CLEANUP = 0x00000004u,
  ISAAC_LUA_V71_ISSTRINGVALIDSEED_BYTE_GATE_VA = 0x0089934du, /* mov bl,al; test bl,bl; setne cl */
  ISAAC_LUA_V71_ISSTRINGVALIDSEED_IAT_LUA_PUSHBOOLEAN = 0x00b183ecu,
  ISAAC_LUA_V71_ISSTRINGVALIDSEED_RETURN_VALUE = 1,
  ISAAC_LUA_V71_ISSTRINGVALIDSEED_INSTALL_COUNT = 2,
  ISAAC_LUA_V71_ISSTRINGVALIDSEED_INSTALL_VA = 0x00893040u,
  ISAAC_LUA_V71_ISSTRINGVALIDSEED_INSTALL_RET_VA = 0x00893099u,
  ISAAC_LUA_V71_ISSTRINGVALIDSEED_INSTALL_LITERAL_VA = 0x00893057u,
  ISAAC_LUA_V71_ISSTRINGVALIDSEED_INSTALL_REAL_FN_VA = 0x009eb590u, /* HOST */
  ISAAC_LUA_V71_ISSTRINGVALIDSEED_INSTALL_NAME_VA = 0x00b743f4u,
  ISAAC_LUA_V71_ISSTRINGVALIDSEED_INSTALL_CALLER_VA = 0x0086d089u,
  ISAAC_LUA_V71_ISSTRINGVALIDSEED_INSTALL_B_VA = 0x00893040u,
  ISAAC_LUA_V71_ISSTRINGVALIDSEED_INSTALL_B_RET_VA = 0x00893099u,
  ISAAC_LUA_V71_ISSTRINGVALIDSEED_INSTALL_B_LITERAL_VA = 0x00893057u,
  ISAAC_LUA_V71_ISSTRINGVALIDSEED_INSTALL_B_REAL_FN_VA = 0x00685ea0u, /* HOST */
  ISAAC_LUA_V71_ISSTRINGVALIDSEED_INSTALL_B_NAME_VA = 0x00b74470u,
  ISAAC_LUA_V71_ISSTRINGVALIDSEED_INSTALL_B_CALLER_VA = 0x0086d100u,
};

enum {
  ISAAC_LUA_V71_SEED2STRING_VA = 0x00899390u,
  ISAAC_LUA_V71_SEED2STRING_RET_VA = 0x00899434u,
  ISAAC_LUA_V71_SEED2STRING_INSNS = 58,
  ISAAC_LUA_V71_SEED2STRING_TOUSERDATA_INDEX_U32 = 0xfff0b9d7u,
  ISAAC_LUA_V71_SEED2STRING_FN_OFF = 0x00000000u,
  ISAAC_LUA_V71_SEED2STRING_IAT_LUA_TOUSERDATA = 0x00b183b0u,
  ISAAC_LUA_V71_SEED2STRING_CHECKINTEGER_IAT_VA = 0x00b183f4u, /* luaL_checkinteger */
  ISAAC_LUA_V71_SEED2STRING_CHECKINTEGER_INDEX_U32 = 0x00000001u,
  ISAAC_LUA_V71_SEED2STRING_REAL_FN_ARG_COUNT = 0x00000002u, /* int in, string* out */
  ISAAC_LUA_V71_SEED2STRING_REAL_FN_CLEANUP = 0x00000024u,
  ISAAC_LUA_V71_SEED2STRING_IAT_LUA_PUSHLSTRING = 0x00b183dcu,
  ISAAC_LUA_V71_SEED2STRING_SSO_CAP_U32 = 0x00000010u,
  ISAAC_LUA_V71_SEED2STRING_HEAP_THRESHOLD_U32 = 0x00001000u,
  ISAAC_LUA_V71_SEED2STRING_ALIGN_SLACK_U32 = 0x0000001fu,
  ISAAC_LUA_V71_SEED2STRING_FREE_TAIL_VA = 0x00aef15cu, /* host */
  ISAAC_LUA_V71_SEED2STRING_COOKIE_DAT_VA = 0x00bf93b4u,
  ISAAC_LUA_V71_SEED2STRING_SECURITY_CHECK_VA = 0x00aef12bu, /* host */
  ISAAC_LUA_V71_SEED2STRING_RETURN_VALUE = 1,
  ISAAC_LUA_V71_SEED2STRING_INSTALL_COUNT = 1,
  ISAAC_LUA_V71_SEED2STRING_INSTALL_VA = 0x00892fe0u,
  ISAAC_LUA_V71_SEED2STRING_INSTALL_RET_VA = 0x00893038u,
  ISAAC_LUA_V71_SEED2STRING_INSTALL_LITERAL_VA = 0x00892ff1u,
  ISAAC_LUA_V71_SEED2STRING_INSTALL_REAL_FN_VA = 0x009eb5b0u, /* HOST */
  ISAAC_LUA_V71_SEED2STRING_INSTALL_NAME_VA = 0x00b743e8u,
  ISAAC_LUA_V71_SEED2STRING_INSTALL_CALLER_VA = 0x0086d078u,
};

enum {
  ISAAC_LUA_V71_REMOVECURSES_VA = 0x008994f0u,
  ISAAC_LUA_V71_REMOVECURSES_RET_VA = 0x0089955bu,
  ISAAC_LUA_V71_REMOVECURSES_INSNS = 41,
  ISAAC_LUA_V71_REMOVECURSES_TOUSERDATA_INDEX_U32 = 0xfff0b9d7u,
  ISAAC_LUA_V71_REMOVECURSES_FN_OFF = 0x00000000u,
  ISAAC_LUA_V71_REMOVECURSES_IAT_LUA_TOUSERDATA = 0x00b183b0u,
  ISAAC_LUA_V71_REMOVECURSES_LUA_TYPE_IAT_VA = 0x00b18400u,
  ISAAC_LUA_V71_REMOVECURSES_TYPE_INDEX_U32 = 0x00000001u,
  ISAAC_LUA_V71_REMOVECURSES_TYPE_GATE_VA = 0x0089950au, /* test eax,eax; jne — FULL WORD */
  ISAAC_LUA_V71_REMOVECURSES_CHECK_HELPER_VA = 0x0085c590u, /* host */
  ISAAC_LUA_V71_REMOVECURSES_CHECK_FLAGS_U32 = 0x00000000u,
  ISAAC_LUA_V71_REMOVECURSES_CHECK_KEY_VA = 0x00c82a0au,
  ISAAC_LUA_V71_REMOVECURSES_CHECK_ARG_INDEX_U32 = 0x00000001u,
  ISAAC_LUA_V71_REMOVECURSES_CHECKINTEGER_IAT_VA = 0x00b183f4u,
  ISAAC_LUA_V71_REMOVECURSES_CHECKINTEGER_INDEX_U32 = 0x00000002u,
  ISAAC_LUA_V71_REMOVECURSES_REAL_FN_ARG_COUNT = 0x00000001u, /* int; ecx=this */
  ISAAC_LUA_V71_REMOVECURSES_REAL_FN_CLEANUP = 0x00000010u,
  ISAAC_LUA_V71_REMOVECURSES_RETURN_VALUE = 0,
  ISAAC_LUA_V71_REMOVECURSES_INSTALL_COUNT = 1,
  ISAAC_LUA_V71_REMOVECURSES_INSTALL_VA = 0x008925c0u,
  ISAAC_LUA_V71_REMOVECURSES_INSTALL_RET_VA = 0x00892616u,
  ISAAC_LUA_V71_REMOVECURSES_INSTALL_LITERAL_VA = 0x008925d2u,
  ISAAC_LUA_V71_REMOVECURSES_INSTALL_REAL_FN_VA = 0x00748bc0u, /* HOST */
  ISAAC_LUA_V71_REMOVECURSES_INSTALL_NAME_VA = 0x00b74278u,
  ISAAC_LUA_V71_REMOVECURSES_INSTALL_CALLER_VA = 0x0086ce24u,
};

enum {
  ISAAC_LUA_V71_GETDUNGEONPLACEMENTSEED_VA = 0x00899560u,
  ISAAC_LUA_V71_GETDUNGEONPLACEMENTSEED_RET_VA = 0x008995bbu,
  ISAAC_LUA_V71_GETDUNGEONPLACEMENTSEED_INSNS = 35,
  ISAAC_LUA_V71_GETDUNGEONPLACEMENTSEED_TOUSERDATA_INDEX_U32 = 0xfff0b9d7u,
  ISAAC_LUA_V71_GETDUNGEONPLACEMENTSEED_FN_OFF = 0x00000000u,
  ISAAC_LUA_V71_GETDUNGEONPLACEMENTSEED_IAT_LUA_TOUSERDATA = 0x00b183b0u,
  ISAAC_LUA_V71_GETDUNGEONPLACEMENTSEED_LUA_TYPE_IAT_VA = 0x00b18400u,
  ISAAC_LUA_V71_GETDUNGEONPLACEMENTSEED_TYPE_INDEX_U32 = 0x00000001u,
  ISAAC_LUA_V71_GETDUNGEONPLACEMENTSEED_TYPE_GATE_VA = 0x00899574u, /* test eax,eax; jne — FULL WORD */
  ISAAC_LUA_V71_GETDUNGEONPLACEMENTSEED_CHECK_HELPER_VA = 0x0085c590u, /* host */
  ISAAC_LUA_V71_GETDUNGEONPLACEMENTSEED_CHECK_FLAGS_U32 = 0x00000001u,
  ISAAC_LUA_V71_GETDUNGEONPLACEMENTSEED_CHECK_KEY_VA = 0x00c82a0au,
  ISAAC_LUA_V71_GETDUNGEONPLACEMENTSEED_CHECK_ARG_INDEX_U32 = 0x00000001u,
  ISAAC_LUA_V71_GETDUNGEONPLACEMENTSEED_PUSHER_VA = 0x0085bff0u, /* ROW 1 PUSHBOOL */
  ISAAC_LUA_V71_GETDUNGEONPLACEMENTSEED_PUSHER_ROW = 0x00000001u,
  ISAAC_LUA_V71_GETDUNGEONPLACEMENTSEED_REAL_FN_ARG_COUNT = 0x00000000u, /* thiscall 0 stack args */
  ISAAC_LUA_V71_GETDUNGEONPLACEMENTSEED_REAL_FN_CLEANUP = 0x00000008u, /* touserdata add esp,8 */
  ISAAC_LUA_V71_GETDUNGEONPLACEMENTSEED_RETURN_VALUE = 1,
  ISAAC_LUA_V71_GETDUNGEONPLACEMENTSEED_INSTALL_COUNT = 1,
  ISAAC_LUA_V71_GETDUNGEONPLACEMENTSEED_INSTALL_VA = 0x00892620u,
  ISAAC_LUA_V71_GETDUNGEONPLACEMENTSEED_INSTALL_RET_VA = 0x008926c0u,
  ISAAC_LUA_V71_GETDUNGEONPLACEMENTSEED_INSTALL_LITERAL_VA = 0x0089263du,
  ISAAC_LUA_V71_GETDUNGEONPLACEMENTSEED_INSTALL_REAL_FN_VA = 0x0060d000u, /* HOST */
  ISAAC_LUA_V71_GETDUNGEONPLACEMENTSEED_INSTALL_NAME_VA = 0x00b74288u,
  ISAAC_LUA_V71_GETDUNGEONPLACEMENTSEED_INSTALL_CALLER_VA = 0x0086ce35u,
};

enum {
  ISAAC_LUA_V71_DUNGEONRETURNPOSITIONSETTER_VA = 0x008995c0u,
  ISAAC_LUA_V71_DUNGEONRETURNPOSITIONSETTER_RET_VA = 0x0089966cu,
  ISAAC_LUA_V71_DUNGEONRETURNPOSITIONSETTER_INSNS = 56,
  ISAAC_LUA_V71_DUNGEONRETURNPOSITIONSETTER_TOUSERDATA_INDEX_U32 = 0xfff0b9d7u,
  ISAAC_LUA_V71_DUNGEONRETURNPOSITIONSETTER_FN_OFF = 0x00000000u,
  ISAAC_LUA_V71_DUNGEONRETURNPOSITIONSETTER_IAT_LUA_TOUSERDATA = 0x00b183b0u,
  ISAAC_LUA_V71_DUNGEONRETURNPOSITIONSETTER_LUA_TYPE_IAT_VA = 0x00b18400u,
  ISAAC_LUA_V71_DUNGEONRETURNPOSITIONSETTER_TYPE_1_INDEX_U32 = 0x00000001u,
  ISAAC_LUA_V71_DUNGEONRETURNPOSITIONSETTER_TYPE_2_INDEX_U32 = 0x00000002u,
  ISAAC_LUA_V71_DUNGEONRETURNPOSITIONSETTER_GATE_1_VA = 0x008995d9u, /* test eax,eax; jne — FULL WORD */
  ISAAC_LUA_V71_DUNGEONRETURNPOSITIONSETTER_GATE_2_VA = 0x0089961cu, /* test eax,eax; jne — FULL WORD */
  ISAAC_LUA_V71_DUNGEONRETURNPOSITIONSETTER_CHECK_HELPER_VA = 0x0085c590u, /* host */
  ISAAC_LUA_V71_DUNGEONRETURNPOSITIONSETTER_CHECK_1_FLAGS_U32 = 0x00000000u,
  ISAAC_LUA_V71_DUNGEONRETURNPOSITIONSETTER_CHECK_1_KEY_VA = 0x00c82a0au,
  ISAAC_LUA_V71_DUNGEONRETURNPOSITIONSETTER_CHECK_1_ARG_INDEX_U32 = 0x00000001u,
  ISAAC_LUA_V71_DUNGEONRETURNPOSITIONSETTER_CHECK_2_FLAGS_U32 = 0x00000001u,
  ISAAC_LUA_V71_DUNGEONRETURNPOSITIONSETTER_CHECK_2_KEY_VA = 0x00c82980u, /* Vector */
  ISAAC_LUA_V71_DUNGEONRETURNPOSITIONSETTER_CHECK_2_ARG_INDEX_U32 = 0x00000002u,
  ISAAC_LUA_V71_DUNGEONRETURNPOSITIONSETTER_REAL_FN_ARG_COUNT = 0x00000002u, /* float y, float x */
  ISAAC_LUA_V71_DUNGEONRETURNPOSITIONSETTER_REAL_FN_CLEANUP = 0x00000000u, /* mov esp,ebp epilogue */
  ISAAC_LUA_V71_DUNGEONRETURNPOSITIONSETTER_RETURN_VALUE = 0,
  ISAAC_LUA_V71_DUNGEONRETURNPOSITIONSETTER_INSTALL_COUNT = 1,
  ISAAC_LUA_V71_DUNGEONRETURNPOSITIONSETTER_INSTALL_VA = 0x008922e0u, /* dual container (getter 0x899670) */
  ISAAC_LUA_V71_DUNGEONRETURNPOSITIONSETTER_INSTALL_RET_VA = 0x0089244fu,
  ISAAC_LUA_V71_DUNGEONRETURNPOSITIONSETTER_INSTALL_LITERAL_VA = 0x008923f9u,
  ISAAC_LUA_V71_DUNGEONRETURNPOSITIONSETTER_INSTALL_REAL_FN_VA = 0x0057be60u, /* HOST (setter) */
  ISAAC_LUA_V71_DUNGEONRETURNPOSITIONSETTER_INSTALL_NAME_VA = 0x00b7409cu,
  ISAAC_LUA_V71_DUNGEONRETURNPOSITIONSETTER_INSTALL_CALLER_VA = 0x0086cca9u,
};

/* BYTE gate `mov bl,al; test bl,bl; setne cl` @0x89934d/0x899356/0x899358:
 * real_fn bool narrows to AL; wide input 0x100 -> 0. */
uint32_t isaac_lua_engine_v71_isstringvalidseed_byte_gate(uint32_t real_fn_result);

uint32_t isaac_lua_engine_v71_isstringvalidseed_va(void);
uint32_t isaac_lua_engine_v71_isstringvalidseed_ret_va(void);
uint32_t isaac_lua_engine_v71_isstringvalidseed_body_bytes(void);
int32_t isaac_lua_engine_v71_isstringvalidseed_insn_count(void);
uint32_t isaac_lua_engine_v71_isstringvalidseed_touserdata_index(void);
uint32_t isaac_lua_engine_v71_isstringvalidseed_fn_off(void);
uint32_t isaac_lua_engine_v71_isstringvalidseed_iat_lua_touserdata(void);
uint32_t isaac_lua_engine_v71_isstringvalidseed_seh_handler_va(void);
uint32_t isaac_lua_engine_v71_isstringvalidseed_check_string_builder_va(void);
uint32_t isaac_lua_engine_v71_isstringvalidseed_string_copy_ctor_va(void);
uint32_t isaac_lua_engine_v71_isstringvalidseed_string_dtor_va(void);
uint32_t isaac_lua_engine_v71_isstringvalidseed_real_fn_arg_count(void);
uint32_t isaac_lua_engine_v71_isstringvalidseed_real_fn_cleanup(void);
uint32_t isaac_lua_engine_v71_isstringvalidseed_byte_gate_va(void);
uint32_t isaac_lua_engine_v71_isstringvalidseed_iat_lua_pushboolean(void);
int32_t isaac_lua_engine_v71_isstringvalidseed_return_value(void);
int32_t isaac_lua_engine_v71_isstringvalidseed_install_count(void);
uint32_t isaac_lua_engine_v71_isstringvalidseed_install_va(void);
uint32_t isaac_lua_engine_v71_isstringvalidseed_install_ret_va(void);
uint32_t isaac_lua_engine_v71_isstringvalidseed_install_literal_va(void);
uint32_t isaac_lua_engine_v71_isstringvalidseed_install_real_fn_va(void);
uint32_t isaac_lua_engine_v71_isstringvalidseed_install_name_va(void);
uint32_t isaac_lua_engine_v71_isstringvalidseed_install_caller_va(void);
uint32_t isaac_lua_engine_v71_isstringvalidseed_install_b_va(void);
uint32_t isaac_lua_engine_v71_isstringvalidseed_install_b_ret_va(void);
uint32_t isaac_lua_engine_v71_isstringvalidseed_install_b_literal_va(void);
uint32_t isaac_lua_engine_v71_isstringvalidseed_install_b_real_fn_va(void);
uint32_t isaac_lua_engine_v71_isstringvalidseed_install_b_name_va(void);
uint32_t isaac_lua_engine_v71_isstringvalidseed_install_b_caller_va(void);

uint32_t isaac_lua_engine_v71_seed2string_va(void);
uint32_t isaac_lua_engine_v71_seed2string_ret_va(void);
uint32_t isaac_lua_engine_v71_seed2string_body_bytes(void);
int32_t isaac_lua_engine_v71_seed2string_insn_count(void);
uint32_t isaac_lua_engine_v71_seed2string_touserdata_index(void);
uint32_t isaac_lua_engine_v71_seed2string_fn_off(void);
uint32_t isaac_lua_engine_v71_seed2string_iat_lua_touserdata(void);
uint32_t isaac_lua_engine_v71_seed2string_checkinteger_iat_va(void);
uint32_t isaac_lua_engine_v71_seed2string_checkinteger_index_u32(void);
uint32_t isaac_lua_engine_v71_seed2string_real_fn_arg_count(void);
uint32_t isaac_lua_engine_v71_seed2string_real_fn_cleanup(void);
uint32_t isaac_lua_engine_v71_seed2string_iat_lua_pushlstring(void);
uint32_t isaac_lua_engine_v71_seed2string_sso_cap_u32(void);
uint32_t isaac_lua_engine_v71_seed2string_heap_threshold_u32(void);
uint32_t isaac_lua_engine_v71_seed2string_align_slack_u32(void);
uint32_t isaac_lua_engine_v71_seed2string_free_tail_va(void);
uint32_t isaac_lua_engine_v71_seed2string_cookie_dat_va(void);
uint32_t isaac_lua_engine_v71_seed2string_security_check_va(void);
int32_t isaac_lua_engine_v71_seed2string_return_value(void);
int32_t isaac_lua_engine_v71_seed2string_install_count(void);
uint32_t isaac_lua_engine_v71_seed2string_install_va(void);
uint32_t isaac_lua_engine_v71_seed2string_install_ret_va(void);
uint32_t isaac_lua_engine_v71_seed2string_install_literal_va(void);
uint32_t isaac_lua_engine_v71_seed2string_install_real_fn_va(void);
uint32_t isaac_lua_engine_v71_seed2string_install_name_va(void);
uint32_t isaac_lua_engine_v71_seed2string_install_caller_va(void);

uint32_t isaac_lua_engine_v71_removecurses_va(void);
uint32_t isaac_lua_engine_v71_removecurses_ret_va(void);
uint32_t isaac_lua_engine_v71_removecurses_body_bytes(void);
int32_t isaac_lua_engine_v71_removecurses_insn_count(void);
uint32_t isaac_lua_engine_v71_removecurses_touserdata_index(void);
uint32_t isaac_lua_engine_v71_removecurses_fn_off(void);
uint32_t isaac_lua_engine_v71_removecurses_iat_lua_touserdata(void);
uint32_t isaac_lua_engine_v71_removecurses_lua_type_iat_va(void);
uint32_t isaac_lua_engine_v71_removecurses_type_index_u32(void);
uint32_t isaac_lua_engine_v71_removecurses_type_gate_va(void);
uint32_t isaac_lua_engine_v71_removecurses_check_helper_va(void);
uint32_t isaac_lua_engine_v71_removecurses_check_flags_u32(void);
uint32_t isaac_lua_engine_v71_removecurses_check_key_va(void);
uint32_t isaac_lua_engine_v71_removecurses_check_arg_index_u32(void);
uint32_t isaac_lua_engine_v71_removecurses_checkinteger_iat_va(void);
uint32_t isaac_lua_engine_v71_removecurses_checkinteger_index_u32(void);
uint32_t isaac_lua_engine_v71_removecurses_real_fn_arg_count(void);
uint32_t isaac_lua_engine_v71_removecurses_real_fn_cleanup(void);
int32_t isaac_lua_engine_v71_removecurses_return_value(void);
int32_t isaac_lua_engine_v71_removecurses_install_count(void);
uint32_t isaac_lua_engine_v71_removecurses_install_va(void);
uint32_t isaac_lua_engine_v71_removecurses_install_ret_va(void);
uint32_t isaac_lua_engine_v71_removecurses_install_literal_va(void);
uint32_t isaac_lua_engine_v71_removecurses_install_real_fn_va(void);
uint32_t isaac_lua_engine_v71_removecurses_install_name_va(void);
uint32_t isaac_lua_engine_v71_removecurses_install_caller_va(void);

uint32_t isaac_lua_engine_v71_getdungeonplacementseed_va(void);
uint32_t isaac_lua_engine_v71_getdungeonplacementseed_ret_va(void);
uint32_t isaac_lua_engine_v71_getdungeonplacementseed_body_bytes(void);
int32_t isaac_lua_engine_v71_getdungeonplacementseed_insn_count(void);
uint32_t isaac_lua_engine_v71_getdungeonplacementseed_touserdata_index(void);
uint32_t isaac_lua_engine_v71_getdungeonplacementseed_fn_off(void);
uint32_t isaac_lua_engine_v71_getdungeonplacementseed_iat_lua_touserdata(void);
uint32_t isaac_lua_engine_v71_getdungeonplacementseed_lua_type_iat_va(void);
uint32_t isaac_lua_engine_v71_getdungeonplacementseed_type_index_u32(void);
uint32_t isaac_lua_engine_v71_getdungeonplacementseed_type_gate_va(void);
uint32_t isaac_lua_engine_v71_getdungeonplacementseed_check_helper_va(void);
uint32_t isaac_lua_engine_v71_getdungeonplacementseed_check_flags_u32(void);
uint32_t isaac_lua_engine_v71_getdungeonplacementseed_check_key_va(void);
uint32_t isaac_lua_engine_v71_getdungeonplacementseed_check_arg_index_u32(void);
uint32_t isaac_lua_engine_v71_getdungeonplacementseed_pusher_va(void);
uint32_t isaac_lua_engine_v71_getdungeonplacementseed_pusher_row(void);
uint32_t isaac_lua_engine_v71_getdungeonplacementseed_real_fn_arg_count(void);
uint32_t isaac_lua_engine_v71_getdungeonplacementseed_real_fn_cleanup(void);
int32_t isaac_lua_engine_v71_getdungeonplacementseed_return_value(void);
int32_t isaac_lua_engine_v71_getdungeonplacementseed_install_count(void);
uint32_t isaac_lua_engine_v71_getdungeonplacementseed_install_va(void);
uint32_t isaac_lua_engine_v71_getdungeonplacementseed_install_ret_va(void);
uint32_t isaac_lua_engine_v71_getdungeonplacementseed_install_literal_va(void);
uint32_t isaac_lua_engine_v71_getdungeonplacementseed_install_real_fn_va(void);
uint32_t isaac_lua_engine_v71_getdungeonplacementseed_install_name_va(void);
uint32_t isaac_lua_engine_v71_getdungeonplacementseed_install_caller_va(void);

uint32_t isaac_lua_engine_v71_dungeonreturnpositionsetter_va(void);
uint32_t isaac_lua_engine_v71_dungeonreturnpositionsetter_ret_va(void);
uint32_t isaac_lua_engine_v71_dungeonreturnpositionsetter_body_bytes(void);
int32_t isaac_lua_engine_v71_dungeonreturnpositionsetter_insn_count(void);
uint32_t isaac_lua_engine_v71_dungeonreturnpositionsetter_touserdata_index(void);
uint32_t isaac_lua_engine_v71_dungeonreturnpositionsetter_fn_off(void);
uint32_t isaac_lua_engine_v71_dungeonreturnpositionsetter_iat_lua_touserdata(void);
uint32_t isaac_lua_engine_v71_dungeonreturnpositionsetter_lua_type_iat_va(void);
uint32_t isaac_lua_engine_v71_dungeonreturnpositionsetter_type_1_index_u32(void);
uint32_t isaac_lua_engine_v71_dungeonreturnpositionsetter_type_2_index_u32(void);
uint32_t isaac_lua_engine_v71_dungeonreturnpositionsetter_gate_1_va(void);
uint32_t isaac_lua_engine_v71_dungeonreturnpositionsetter_gate_2_va(void);
uint32_t isaac_lua_engine_v71_dungeonreturnpositionsetter_check_helper_va(void);
uint32_t isaac_lua_engine_v71_dungeonreturnpositionsetter_check_1_flags_u32(void);
uint32_t isaac_lua_engine_v71_dungeonreturnpositionsetter_check_1_key_va(void);
uint32_t isaac_lua_engine_v71_dungeonreturnpositionsetter_check_1_arg_index_u32(void);
uint32_t isaac_lua_engine_v71_dungeonreturnpositionsetter_check_2_flags_u32(void);
uint32_t isaac_lua_engine_v71_dungeonreturnpositionsetter_check_2_key_va(void);
uint32_t isaac_lua_engine_v71_dungeonreturnpositionsetter_check_2_arg_index_u32(void);
uint32_t isaac_lua_engine_v71_dungeonreturnpositionsetter_real_fn_arg_count(void);
uint32_t isaac_lua_engine_v71_dungeonreturnpositionsetter_real_fn_cleanup(void);
int32_t isaac_lua_engine_v71_dungeonreturnpositionsetter_return_value(void);
int32_t isaac_lua_engine_v71_dungeonreturnpositionsetter_install_count(void);
uint32_t isaac_lua_engine_v71_dungeonreturnpositionsetter_install_va(void);
uint32_t isaac_lua_engine_v71_dungeonreturnpositionsetter_install_ret_va(void);
uint32_t isaac_lua_engine_v71_dungeonreturnpositionsetter_install_literal_va(void);
uint32_t isaac_lua_engine_v71_dungeonreturnpositionsetter_install_real_fn_va(void);
uint32_t isaac_lua_engine_v71_dungeonreturnpositionsetter_install_name_va(void);
uint32_t isaac_lua_engine_v71_dungeonreturnpositionsetter_install_caller_va(void);

/* ==== ABI v72: fourth-region wrapper real-fn twins 0x00899770 /
 *   0x00899790 — bounds-gated element-address getters (census
 *   CORRECTION: the family-frontier-survey note called these "cmp
 *   predicate twins"; the full decode shows a NULL-on-OOB indexer).
 *
 *   PE 0x899770..0x89978a (thiscall, 1 stack arg, both arms ret 4):
 *     mov edx,[ebp+8]; cmp edx,[ecx]; jb L1; xor eax,eax; pop ebp;
 *     ret 4
 *     L1: mov eax,[ecx+4]; lea eax,[eax+edx*4]; pop ebp; ret 4
 *   Law A: out = (u32)arg < bound ? base + arg*4 : 0
 *     (bound = [this+0], base = [this+4], STRIDE 4)
 *
 *   PE 0x899790..0x8997ad (same shape):
 *     L1: imul eax,eax,0xb8; add eax,[ecx+4]
 *   Law B: out = (u32)arg < bound ? base + arg*0xb8 : 0 (STRIDE 0xb8)
 *
 *   Wrapper rows: {wrapper 0x8c59d0, key 0xc82a30, helper 0x891750} ->
 *   real_fn 0x899770; {wrapper 0x8c5910, key 0xc82a3c, helper
 *   0x891490} -> real_fn 0x899790. Slot stores `mov [eax],imm`:
 *   0x891946 / 0x891686. ZERO direct E8/E9 callers. identify-zhl
 *   empty (batch B, this unit). */
enum { ISAAC_LUA_ENGINE_899770_VA = 0x00899770u };
enum { ISAAC_LUA_ENGINE_899770_END_VA = 0x0089978au };
enum { ISAAC_LUA_ENGINE_899770_NEXT_VA = 0x00899790u };
enum { ISAAC_LUA_ENGINE_899770_BOUND_OFF = 0x0u };
enum { ISAAC_LUA_ENGINE_899770_BASE_OFF = 0x4u };
enum { ISAAC_LUA_ENGINE_899770_STRIDE = 0x4u };
enum { ISAAC_LUA_ENGINE_899770_STACK_ARGS = 0x1u };
enum { ISAAC_LUA_ENGINE_899770_THISCALL = 0x1u };
enum { ISAAC_LUA_ENGINE_899770_WRAPPER_ROW_VA = 0x008c59d0u };
enum { ISAAC_LUA_ENGINE_899770_CLASS_KEY = 0x00c82a30u };
enum { ISAAC_LUA_ENGINE_899770_HELPER_VA = 0x00891750u };
enum { ISAAC_LUA_ENGINE_899770_SLOT_STORE_VA = 0x00891946u };
enum { ISAAC_LUA_ENGINE_899790_VA = 0x00899790u };
enum { ISAAC_LUA_ENGINE_899790_END_VA = 0x008997adu };
enum { ISAAC_LUA_ENGINE_899790_NEXT_VA = 0x008997b0u };
enum { ISAAC_LUA_ENGINE_899790_BOUND_OFF = 0x0u };
enum { ISAAC_LUA_ENGINE_899790_BASE_OFF = 0x4u };
enum { ISAAC_LUA_ENGINE_899790_STRIDE = 0xb8u };
enum { ISAAC_LUA_ENGINE_899790_STACK_ARGS = 0x1u };
enum { ISAAC_LUA_ENGINE_899790_THISCALL = 0x1u };
enum { ISAAC_LUA_ENGINE_899790_WRAPPER_ROW_VA = 0x008c5910u };
enum { ISAAC_LUA_ENGINE_899790_CLASS_KEY = 0x00c82a3cu };
enum { ISAAC_LUA_ENGINE_899790_HELPER_VA = 0x00891490u };
enum { ISAAC_LUA_ENGINE_899790_SLOT_STORE_VA = 0x00891686u };

uint32_t isaac_lua_engine_899770_index4(uint32_t bound, uint32_t base,
                                        uint32_t arg);
uint32_t isaac_lua_engine_899790_indexb8(uint32_t bound, uint32_t base,
                                         uint32_t arg);
uint32_t isaac_lua_engine_899770_host_va(void);
uint32_t isaac_lua_engine_899770_end_va(void);
uint32_t isaac_lua_engine_899770_next_va(void);
uint32_t isaac_lua_engine_899770_bound_off(void);
uint32_t isaac_lua_engine_899770_base_off(void);
uint32_t isaac_lua_engine_899770_stride(void);
uint32_t isaac_lua_engine_899770_stack_args(void);
uint32_t isaac_lua_engine_899770_this_call(void);
uint32_t isaac_lua_engine_899770_wrapper_row_va(void);
uint32_t isaac_lua_engine_899770_class_key(void);
uint32_t isaac_lua_engine_899770_helper_va(void);
uint32_t isaac_lua_engine_899770_slot_store_va(void);
uint32_t isaac_lua_engine_899790_host_va(void);
uint32_t isaac_lua_engine_899790_end_va(void);
uint32_t isaac_lua_engine_899790_next_va(void);
uint32_t isaac_lua_engine_899790_bound_off(void);
uint32_t isaac_lua_engine_899790_base_off(void);
uint32_t isaac_lua_engine_899790_stride(void);
uint32_t isaac_lua_engine_899790_stack_args(void);
uint32_t isaac_lua_engine_899790_this_call(void);
uint32_t isaac_lua_engine_899790_wrapper_row_va(void);
uint32_t isaac_lua_engine_899790_class_key(void);
uint32_t isaac_lua_engine_899790_helper_va(void);
uint32_t isaac_lua_engine_899790_slot_store_va(void);

/* ==== ABI v73: wrapper-band continuation past the v72 twins.
 *
 * PE 0x8997b0..0x899846 (L in ECX, 1 stack arg, plain ret — caller
 * cleans; int3 pad 0x899847..4f): STRAIGHT-LINE HOST wrapper, zero
 * pure decisions. Event program:
 *   ud  = lua_newuserdata(L, 4)          IAT 0xb1839c @0x8997c6
 *   [ud+0] = stack_arg                   (payload at +0)
 *   lua_pushcclosure(L, 0x8b3440, 1)     IAT 0xb183fc @0x8997d9
 *   lua_pushvalue(L, -1)                 IAT 0xb183c8 @0x8997e2
 *   tA = lua_absindex(L, -5)             IAT 0xb18418 @0x8997eb
 *   lua_pushstring(L, edx-name)          IAT 0xb18414 @0x8997f5
 *   lua_rotate(L, -2, 1)                 IAT 0xb1840c @0x899806
 *   lua_rawset(L, tA)                    IAT 0xb18408 @0x899810
 *   tB = lua_absindex(L, -3); pushstring(name);
 *   lua_rotate(L, -2, 1); lua_rawset(L, tB)   (second registration)
 * All imms lawed below; the calls stay HOST.
 *
 * PE 0x899850..0x8998b8 (1 stack arg, no ecx arg, plain ret; int3 pad
 * 0x8998b9..bf): pure islands lawed:
 *   g  = lua_type(L, 1) != 0             FULL WORD (test eax,eax;
 *     jne 0x89986e @0x899866/68); nil -> null-object path
 *   check/get helper 0x85c590(ecx=L, edx=1, key 0xc82a04, def 0)
 *     @0x89987c -> obj = [eax+4]
 *   ud = lua_touserdata(L, 0xfff0b9d7)   IAT 0xb183b0 @0x89988d
 *   b  = lua_toboolean(L, 2) != 0        FULL WORD setne
 *     (test eax,eax @0x8998a3 / setne [ebp-4] @0x8998a7)
 *   method = [ud+0]; method(obj, b)      HOST call-through @0x8998ae
 *
 * NEXT frontier: 0x008998c0. Evidence
 * section-notes/lua-v73-8997b0/NOTES.md. ==== */
enum { ISAAC_LUA_ENGINE_8997B0_VA = 0x008997b0u };
enum { ISAAC_LUA_ENGINE_8997B0_END_VA = 0x00899847u };
enum { ISAAC_LUA_ENGINE_8997B0_NEXT_VA = 0x00899850u };
enum { ISAAC_LUA_ENGINE_8997B0_STACK_ARGS = 0x1u };
enum { ISAAC_LUA_ENGINE_8997B0_ECX_ARG = 0x1u };
enum { ISAAC_LUA_ENGINE_8997B0_CALLEE_POPS_STACK_ARGS = 0x0u };
enum { ISAAC_LUA_ENGINE_8997B0_UD_PAYLOAD_OFF = 0x0u };
enum { ISAAC_LUA_ENGINE_8997B0_NEWUSERDATA_SIZE = 0x4u };
enum { ISAAC_LUA_ENGINE_8997B0_CLOSURE_FN_VA = 0x008b3440u };
enum { ISAAC_LUA_ENGINE_8997B0_CLOSURE_NUPS = 0x1u };
enum { ISAAC_LUA_ENGINE_8997B0_PUSHVALUE_INDEX_U32 = 0xffffffffu };
enum { ISAAC_LUA_ENGINE_8997B0_TABLE_A_ABSINDEX_INDEX_U32 = 0xfffffffbu };
enum { ISAAC_LUA_ENGINE_8997B0_TABLE_B_ABSINDEX_INDEX_U32 = 0xfffffffdu };
enum { ISAAC_LUA_ENGINE_8997B0_ROTATE_INDEX_U32 = 0xfffffffeu };
enum { ISAAC_LUA_ENGINE_8997B0_ROTATE_N = 0x1u };
enum { ISAAC_LUA_ENGINE_8997B0_RAWSET_COUNT = 0x2u };
enum { ISAAC_LUA_ENGINE_8997B0_IAT_LUA_NEWUSERDATA = 0x00b1839cu };
enum { ISAAC_LUA_ENGINE_8997B0_IAT_LUA_PUSHCCLOSURE = 0x00b183fcu };
enum { ISAAC_LUA_ENGINE_8997B0_IAT_LUA_PUSHVALUE = 0x00b183c8u };
enum { ISAAC_LUA_ENGINE_8997B0_IAT_LUA_ABSINDEX = 0x00b18418u };
enum { ISAAC_LUA_ENGINE_8997B0_IAT_LUA_PUSHSTRING = 0x00b18414u };
enum { ISAAC_LUA_ENGINE_8997B0_IAT_LUA_ROTATE = 0x00b1840cu };
enum { ISAAC_LUA_ENGINE_8997B0_IAT_LUA_RAWSET = 0x00b18408u };
enum { ISAAC_LUA_ENGINE_899850_VA = 0x00899850u };
enum { ISAAC_LUA_ENGINE_899850_END_VA = 0x008998b9u };
enum { ISAAC_LUA_ENGINE_899850_NEXT_VA = 0x008998c0u };
enum { ISAAC_LUA_ENGINE_899850_STACK_ARGS = 0x1u };
enum { ISAAC_LUA_ENGINE_899850_ECX_ARG = 0x0u };
enum { ISAAC_LUA_ENGINE_899850_CALLEE_POPS_STACK_ARGS = 0x0u };
enum { ISAAC_LUA_ENGINE_899850_IAT_LUA_TYPE = 0x00b18400u };
enum { ISAAC_LUA_ENGINE_899850_CHECKGET_KEY = 0x00c82a04u };
enum { ISAAC_LUA_ENGINE_899850_CHECKGET_INDEX = 0x1u };
enum { ISAAC_LUA_ENGINE_899850_CHECKGET_DEF_ARG = 0x0u };
enum { ISAAC_LUA_ENGINE_899850_CHECKGET_FIELD_OFF = 0x4u };
enum { ISAAC_LUA_ENGINE_899850_CHECKGET_HELPER_VA = 0x0085c590u };
enum { ISAAC_LUA_ENGINE_899850_TOUSERDATA_INDEX_U32 = 0xfff0b9d7u };
enum { ISAAC_LUA_ENGINE_899850_IAT_LUA_TOUSERDATA = 0x00b183b0u };
enum { ISAAC_LUA_ENGINE_899850_TOBOOLEAN_INDEX = 0x2u };
enum { ISAAC_LUA_ENGINE_899850_IAT_LUA_TOBOOLEAN = 0x00b183e8u };
enum { ISAAC_LUA_ENGINE_899850_METHOD_VTABLE_FIELD_OFF = 0x0u };
int32_t isaac_lua_engine_899850_type1_gate_taken(uint32_t type_result);
int32_t isaac_lua_engine_899850_bool_word(uint32_t toboolean_result);
uint32_t isaac_lua_engine_8997b0_host_va(void);
uint32_t isaac_lua_engine_8997b0_end_va(void);
uint32_t isaac_lua_engine_8997b0_next_va(void);
uint32_t isaac_lua_engine_8997b0_stack_args(void);
uint32_t isaac_lua_engine_8997b0_ecx_arg(void);
uint32_t isaac_lua_engine_8997b0_callee_pops_stack_args(void);
uint32_t isaac_lua_engine_8997b0_ud_payload_off(void);
uint32_t isaac_lua_engine_8997b0_newuserdata_size(void);
uint32_t isaac_lua_engine_8997b0_closure_fn_va(void);
uint32_t isaac_lua_engine_8997b0_closure_nups(void);
uint32_t isaac_lua_engine_8997b0_pushvalue_index(void);
uint32_t isaac_lua_engine_8997b0_table_a_absindex_index(void);
uint32_t isaac_lua_engine_8997b0_table_b_absindex_index(void);
uint32_t isaac_lua_engine_8997b0_rotate_index(void);
uint32_t isaac_lua_engine_8997b0_rotate_n(void);
uint32_t isaac_lua_engine_8997b0_rawset_count(void);
uint32_t isaac_lua_engine_8997b0_iat_lua_newuserdata(void);
uint32_t isaac_lua_engine_8997b0_iat_lua_pushcclosure(void);
uint32_t isaac_lua_engine_8997b0_iat_lua_pushvalue(void);
uint32_t isaac_lua_engine_8997b0_iat_lua_absindex(void);
uint32_t isaac_lua_engine_8997b0_iat_lua_pushstring(void);
uint32_t isaac_lua_engine_8997b0_iat_lua_rotate(void);
uint32_t isaac_lua_engine_8997b0_iat_lua_rawset(void);
uint32_t isaac_lua_engine_899850_host_va(void);
uint32_t isaac_lua_engine_899850_end_va(void);
uint32_t isaac_lua_engine_899850_next_va(void);
uint32_t isaac_lua_engine_899850_stack_args(void);
uint32_t isaac_lua_engine_899850_ecx_arg(void);
uint32_t isaac_lua_engine_899850_callee_pops_stack_args(void);
uint32_t isaac_lua_engine_899850_iat_lua_type(void);
uint32_t isaac_lua_engine_899850_checkget_key(void);
uint32_t isaac_lua_engine_899850_checkget_index(void);
uint32_t isaac_lua_engine_899850_checkget_def_arg(void);
uint32_t isaac_lua_engine_899850_checkget_field_off(void);
uint32_t isaac_lua_engine_899850_checkget_helper_va(void);
uint32_t isaac_lua_engine_899850_touserdata_index(void);
uint32_t isaac_lua_engine_899850_iat_lua_touserdata(void);
uint32_t isaac_lua_engine_899850_toboolean_index(void);
uint32_t isaac_lua_engine_899850_iat_lua_toboolean(void);
uint32_t isaac_lua_engine_899850_method_vtable_field_off(void);

/* ==== ABI v74: wrapper-band continuation — 0x008998c0 boolean getter
 *   and 0x00899930 box constructor.
 *
 * PE 0x8998c0..0x899924 (1 stack arg, no ecx arg, plain ret — caller
 * cleans; int3 pad 0x899925..2f): boolean getter wrapper.
 *   g  = lua_type(L, 1)                IAT 0xb18400 @0x8998cb
 *      FULL-WORD gate `test eax,eax; jne 0x8998dc` @0x8998d4/d6
 *   obj = check/get 0x85c590(ecx=L, edx=1, key 0xc82a04, def 1)
 *      @0x8998ea -> [eax+4]            (null-object path: obj = 0)
 *   ud = lua_touserdata(L, 0xfff0b9d7) IAT 0xb183b0 @0x8998fb
 *   r  = [ud+0](obj)                   HOST call-through @0x899908
 *   b  = (uint8_t)r != 0               BYTE gate `test al,al; setne cl`
 *      @0x89990c/0e (v61_return_gate shape — NOT the 0x899850
 *      full-word bool word)
 *   lua_pushboolean(L, b)              IAT 0xb183ec @0x899913
 *   return 1
 *
 * PE 0x899930..0x8999d1 (1 stack arg, no ecx arg, plain ret; int3 pad
 * 0x8999d2..df; `and esp,-8` aligned prologue): box constructor.
 *   ud = lua_touserdata(L, 0xfff0b9d7) IAT 0xb183b0 @0x899944
 *   g  = lua_type(L, 1)                IAT 0xb18400 @0x89994f
 *      FULL-WORD gate `test eax,eax; jne 0x899960` @0x899958/5a
 *   obj = check/get 0x85c590(ecx=L, edx=1, key 0xc82a01, def 1)
 *      @0x89996e -> [eax+4]            (null-object path: obj = 0)
 *   method = [ud+0]; method(&out, obj) HOST call-through @0x899981
 *   box = lua_newuserdata(L, 0x10)     IAT 0xb1839c @0x899986
 *   box[0] = 0xb73538 (vtable); box[4] = &box[8] (payload self-ptr)
 *   lua_rawgetp(L, 0xfff0b9d8, 0xc82a33) IAT 0xb183bc @0x8999a5
 *   lua_setmetatable(L, -2)            IAT 0xb18398 @0x8999ae
 *   payload {lo,hi} = out pair         @0x8999c8/cb
 *   return 1
 *
 * NEXT frontier: 0x008999e0. Evidence
 * section-notes/lua-v74-8998c0/NOTES.md. ==== */
enum { ISAAC_LUA_ENGINE_8998C0_VA = 0x008998c0u };
enum { ISAAC_LUA_ENGINE_8998C0_END_VA = 0x00899925u };
enum { ISAAC_LUA_ENGINE_8998C0_NEXT_VA = 0x00899930u };
enum { ISAAC_LUA_ENGINE_8998C0_STACK_ARGS = 0x1u };
enum { ISAAC_LUA_ENGINE_8998C0_ECX_ARG = 0x0u };
enum { ISAAC_LUA_ENGINE_8998C0_CALLEE_POPS_STACK_ARGS = 0x0u };
enum { ISAAC_LUA_ENGINE_8998C0_IAT_LUA_TYPE = 0x00b18400u };
enum { ISAAC_LUA_ENGINE_8998C0_CHECKGET_KEY = 0x00c82a04u };
enum { ISAAC_LUA_ENGINE_8998C0_CHECKGET_INDEX = 0x1u };
enum { ISAAC_LUA_ENGINE_8998C0_CHECKGET_DEF_ARG = 0x1u };
enum { ISAAC_LUA_ENGINE_8998C0_CHECKGET_FIELD_OFF = 0x4u };
enum { ISAAC_LUA_ENGINE_8998C0_CHECKGET_HELPER_VA = 0x0085c590u };
enum { ISAAC_LUA_ENGINE_8998C0_TOUSERDATA_INDEX_U32 = 0xfff0b9d7u };
enum { ISAAC_LUA_ENGINE_8998C0_IAT_LUA_TOUSERDATA = 0x00b183b0u };
enum { ISAAC_LUA_ENGINE_8998C0_METHOD_VTABLE_FIELD_OFF = 0x0u };
enum { ISAAC_LUA_ENGINE_8998C0_IAT_LUA_PUSHBOOLEAN = 0x00b183ecu };
enum { ISAAC_LUA_ENGINE_8998C0_RETURN_VALUE = 0x1u };
enum { ISAAC_LUA_ENGINE_899930_VA = 0x00899930u };
enum { ISAAC_LUA_ENGINE_899930_END_VA = 0x008999d2u };
enum { ISAAC_LUA_ENGINE_899930_NEXT_VA = 0x008999e0u };
enum { ISAAC_LUA_ENGINE_899930_STACK_ARGS = 0x1u };
enum { ISAAC_LUA_ENGINE_899930_ECX_ARG = 0x0u };
enum { ISAAC_LUA_ENGINE_899930_CALLEE_POPS_STACK_ARGS = 0x0u };
enum { ISAAC_LUA_ENGINE_899930_ALIGNED_PROLOGUE = 0x1u };
enum { ISAAC_LUA_ENGINE_899930_IAT_LUA_TOUSERDATA = 0x00b183b0u };
enum { ISAAC_LUA_ENGINE_899930_TOUSERDATA_INDEX_U32 = 0xfff0b9d7u };
enum { ISAAC_LUA_ENGINE_899930_IAT_LUA_TYPE = 0x00b18400u };
enum { ISAAC_LUA_ENGINE_899930_CHECKGET_KEY = 0x00c82a01u };
enum { ISAAC_LUA_ENGINE_899930_CHECKGET_INDEX = 0x1u };
enum { ISAAC_LUA_ENGINE_899930_CHECKGET_DEF_ARG = 0x1u };
enum { ISAAC_LUA_ENGINE_899930_CHECKGET_FIELD_OFF = 0x4u };
enum { ISAAC_LUA_ENGINE_899930_CHECKGET_HELPER_VA = 0x0085c590u };
enum { ISAAC_LUA_ENGINE_899930_METHOD_VTABLE_FIELD_OFF = 0x0u };
enum { ISAAC_LUA_ENGINE_899930_NEWUSERDATA_SIZE = 0x10u };
enum { ISAAC_LUA_ENGINE_899930_UD_VTABLE_VA = 0x00b73538u };
enum { ISAAC_LUA_ENGINE_899930_UD_PAYLOAD_PTR_OFF = 0x4u };
enum { ISAAC_LUA_ENGINE_899930_UD_PAYLOAD_OFF = 0x8u };
enum { ISAAC_LUA_ENGINE_899930_REGISTRY_INDEX_U32 = 0xfff0b9d8u };
enum { ISAAC_LUA_ENGINE_899930_METATABLE_RAWGETP_KEY = 0x00c82a33u };
enum { ISAAC_LUA_ENGINE_899930_IAT_LUA_RAWGETP = 0x00b183bcu };
enum { ISAAC_LUA_ENGINE_899930_IAT_LUA_SETMETATABLE = 0x00b18398u };
enum { ISAAC_LUA_ENGINE_899930_SETMETATABLE_INDEX_U32 = 0xfffffffeu };
enum { ISAAC_LUA_ENGINE_899930_RETURN_VALUE = 0x1u };
int32_t isaac_lua_engine_8998c0_type1_gate_taken(uint32_t type_result);
int32_t isaac_lua_engine_8998c0_method_return_byte_gate(uint32_t method_result);
int32_t isaac_lua_engine_899930_type1_gate_taken(uint32_t type_result);
uint32_t isaac_lua_engine_8998c0_host_va(void);
uint32_t isaac_lua_engine_8998c0_end_va(void);
uint32_t isaac_lua_engine_8998c0_next_va(void);
uint32_t isaac_lua_engine_8998c0_stack_args(void);
uint32_t isaac_lua_engine_8998c0_ecx_arg(void);
uint32_t isaac_lua_engine_8998c0_callee_pops_stack_args(void);
uint32_t isaac_lua_engine_8998c0_iat_lua_type(void);
uint32_t isaac_lua_engine_8998c0_checkget_key(void);
uint32_t isaac_lua_engine_8998c0_checkget_index(void);
uint32_t isaac_lua_engine_8998c0_checkget_def_arg(void);
uint32_t isaac_lua_engine_8998c0_checkget_field_off(void);
uint32_t isaac_lua_engine_8998c0_checkget_helper_va(void);
uint32_t isaac_lua_engine_8998c0_touserdata_index(void);
uint32_t isaac_lua_engine_8998c0_iat_lua_touserdata(void);
uint32_t isaac_lua_engine_8998c0_method_vtable_field_off(void);
uint32_t isaac_lua_engine_8998c0_iat_lua_pushboolean(void);
uint32_t isaac_lua_engine_8998c0_return_value(void);
uint32_t isaac_lua_engine_899930_host_va(void);
uint32_t isaac_lua_engine_899930_end_va(void);
uint32_t isaac_lua_engine_899930_next_va(void);
uint32_t isaac_lua_engine_899930_stack_args(void);
uint32_t isaac_lua_engine_899930_ecx_arg(void);
uint32_t isaac_lua_engine_899930_callee_pops_stack_args(void);
uint32_t isaac_lua_engine_899930_aligned_prologue(void);
uint32_t isaac_lua_engine_899930_iat_lua_touserdata(void);
uint32_t isaac_lua_engine_899930_touserdata_index(void);
uint32_t isaac_lua_engine_899930_iat_lua_type(void);
uint32_t isaac_lua_engine_899930_checkget_key(void);
uint32_t isaac_lua_engine_899930_checkget_index(void);
uint32_t isaac_lua_engine_899930_checkget_def_arg(void);
uint32_t isaac_lua_engine_899930_checkget_field_off(void);
uint32_t isaac_lua_engine_899930_checkget_helper_va(void);
uint32_t isaac_lua_engine_899930_method_vtable_field_off(void);
uint32_t isaac_lua_engine_899930_newuserdata_size(void);
uint32_t isaac_lua_engine_899930_ud_vtable_va(void);
uint32_t isaac_lua_engine_899930_ud_payload_ptr_off(void);
uint32_t isaac_lua_engine_899930_ud_payload_off(void);
uint32_t isaac_lua_engine_899930_registry_index(void);
uint32_t isaac_lua_engine_899930_metatable_rawgetp_key(void);
uint32_t isaac_lua_engine_899930_iat_lua_rawgetp(void);
uint32_t isaac_lua_engine_899930_iat_lua_setmetatable(void);
uint32_t isaac_lua_engine_899930_setmetatable_index(void);
uint32_t isaac_lua_engine_899930_return_value(void);

/* ==== ABI v75: wrapper-band continuation — 0x008999e0 integer getter
 *   and 0x00899a50 box constructor (clone of the 0x899930 band).
 *
 * PE 0x8999e0..0x00899a45 (1 stack arg, no ecx arg, plain ret; int3
 * pad 0x899a46..4f; `and esp,-8` aligned prologue): integer getter.
 *   ud = lua_touserdata(L, 0xfff0b9d7) IAT 0xb183b0 @0x8999f1
 *   g  = lua_type(L, 1)                IAT 0xb18400 @0x8999fc
 *      FULL-WORD gate `test eax,eax; jne 0x899a0d` @0x899a05/07
 *   obj = check/get 0x85c590(ecx=L, edx=1, key 0xc82a01, def 1)
 *      @0x899a1b -> [eax+4]            (null-object path: edx = 0)
 *   r  = [ud+0](obj)                   method with obj as STACK arg
 *      (`push edx; call ecx; add esp,4` @0x899a26..2b)
 *   lua_pushinteger(L, (u64)r)         IAT 0xb183f8 @0x899a32 —
 *      ZERO-EXTENDED: hi dword imm 0 (`push 0; push eax`)
 *   return 1
 *
 * PE 0x899a50..0x00899af1 (plain ret; int3 pad 0x899af2..ff; aligned
 * prologue): box constructor, clone of the 0x899930 band with
 * key/vtable/meta-key swaps.
 *   ud = lua_touserdata(L, 0xfff0b9d7) IAT 0xb183b0 @0x899a64
 *   g  = lua_type(L, 1)                IAT 0xb18400 @0x899a6f
 *      FULL-WORD gate `test eax,eax; jne 0x899a80` @0x899a78/7a
 *   obj = check/get 0x85c590(ecx=L, edx=1, key 0xc829fe, def 1)
 *      @0x899a8e -> [eax+4]            (null-object path: ecx = 0)
 *   method = [ud+0]; method(&out, obj) HOST call-through @0x899aa1
 *   box = lua_newuserdata(L, 0x10)     IAT 0xb1839c @0x899aa6
 *   box[0] = 0xb7354c (vtable); box[4] = &box[8] (payload self-ptr)
 *   lua_rawgetp(L, 0xfff0b9d8, 0xc82a36) IAT 0xb183bc @0x899ac5
 *   lua_setmetatable(L, -2)            IAT 0xb18398 @0x899ace
 *   return 1
 *
 * NEXT frontier: 0x00899b00. Evidence
 * section-notes/lua-v75-8999e0/NOTES.md. ==== */
enum { ISAAC_LUA_ENGINE_8999E0_VA = 0x008999e0u };
enum { ISAAC_LUA_ENGINE_8999E0_END_VA = 0x00899a46u };
enum { ISAAC_LUA_ENGINE_8999E0_NEXT_VA = 0x00899a50u };
enum { ISAAC_LUA_ENGINE_8999E0_STACK_ARGS = 0x1u };
enum { ISAAC_LUA_ENGINE_8999E0_ECX_ARG = 0x0u };
enum { ISAAC_LUA_ENGINE_8999E0_CALLEE_POPS_STACK_ARGS = 0x0u };
enum { ISAAC_LUA_ENGINE_8999E0_ALIGNED_PROLOGUE = 0x1u };
enum { ISAAC_LUA_ENGINE_8999E0_IAT_LUA_TOUSERDATA = 0x00b183b0u };
enum { ISAAC_LUA_ENGINE_8999E0_TOUSERDATA_INDEX_U32 = 0xfff0b9d7u };
enum { ISAAC_LUA_ENGINE_8999E0_IAT_LUA_TYPE = 0x00b18400u };
enum { ISAAC_LUA_ENGINE_8999E0_CHECKGET_KEY = 0x00c82a01u };
enum { ISAAC_LUA_ENGINE_8999E0_CHECKGET_INDEX = 0x1u };
enum { ISAAC_LUA_ENGINE_8999E0_CHECKGET_DEF_ARG = 0x1u };
enum { ISAAC_LUA_ENGINE_8999E0_CHECKGET_FIELD_OFF = 0x4u };
enum { ISAAC_LUA_ENGINE_8999E0_CHECKGET_HELPER_VA = 0x0085c590u };
enum { ISAAC_LUA_ENGINE_8999E0_METHOD_VTABLE_FIELD_OFF = 0x0u };
enum { ISAAC_LUA_ENGINE_8999E0_METHOD_STACK_ARGS = 0x1u };
enum { ISAAC_LUA_ENGINE_8999E0_IAT_LUA_PUSHINTEGER = 0x00b183f8u };
enum { ISAAC_LUA_ENGINE_8999E0_PUSHINTEGER_HI_WORD = 0x0u };
enum { ISAAC_LUA_ENGINE_8999E0_RETURN_VALUE = 0x1u };
enum { ISAAC_LUA_ENGINE_899A50_VA = 0x00899a50u };
enum { ISAAC_LUA_ENGINE_899A50_END_VA = 0x00899af2u };
enum { ISAAC_LUA_ENGINE_899A50_NEXT_VA = 0x00899b00u };
enum { ISAAC_LUA_ENGINE_899A50_STACK_ARGS = 0x1u };
enum { ISAAC_LUA_ENGINE_899A50_ECX_ARG = 0x0u };
enum { ISAAC_LUA_ENGINE_899A50_CALLEE_POPS_STACK_ARGS = 0x0u };
enum { ISAAC_LUA_ENGINE_899A50_ALIGNED_PROLOGUE = 0x1u };
enum { ISAAC_LUA_ENGINE_899A50_IAT_LUA_TOUSERDATA = 0x00b183b0u };
enum { ISAAC_LUA_ENGINE_899A50_TOUSERDATA_INDEX_U32 = 0xfff0b9d7u };
enum { ISAAC_LUA_ENGINE_899A50_IAT_LUA_TYPE = 0x00b18400u };
enum { ISAAC_LUA_ENGINE_899A50_CHECKGET_KEY = 0x00c829feu };
enum { ISAAC_LUA_ENGINE_899A50_CHECKGET_INDEX = 0x1u };
enum { ISAAC_LUA_ENGINE_899A50_CHECKGET_DEF_ARG = 0x1u };
enum { ISAAC_LUA_ENGINE_899A50_CHECKGET_FIELD_OFF = 0x4u };
enum { ISAAC_LUA_ENGINE_899A50_CHECKGET_HELPER_VA = 0x0085c590u };
enum { ISAAC_LUA_ENGINE_899A50_METHOD_VTABLE_FIELD_OFF = 0x0u };
enum { ISAAC_LUA_ENGINE_899A50_METHOD_STACK_ARGS = 0x2u };
enum { ISAAC_LUA_ENGINE_899A50_NEWUSERDATA_SIZE = 0x10u };
enum { ISAAC_LUA_ENGINE_899A50_UD_VTABLE_VA = 0x00b7354cu };
enum { ISAAC_LUA_ENGINE_899A50_UD_PAYLOAD_PTR_OFF = 0x4u };
enum { ISAAC_LUA_ENGINE_899A50_UD_PAYLOAD_OFF = 0x8u };
enum { ISAAC_LUA_ENGINE_899A50_REGISTRY_INDEX_U32 = 0xfff0b9d8u };
enum { ISAAC_LUA_ENGINE_899A50_METATABLE_RAWGETP_KEY = 0x00c82a36u };
enum { ISAAC_LUA_ENGINE_899A50_IAT_LUA_RAWGETP = 0x00b183bcu };
enum { ISAAC_LUA_ENGINE_899A50_IAT_LUA_SETMETATABLE = 0x00b18398u };
enum { ISAAC_LUA_ENGINE_899A50_SETMETATABLE_INDEX_U32 = 0xfffffffeu };
enum { ISAAC_LUA_ENGINE_899A50_RETURN_VALUE = 0x1u };
int32_t isaac_lua_engine_8999e0_type1_gate_taken(uint32_t type_result);
int32_t isaac_lua_engine_899a50_type1_gate_taken(uint32_t type_result);
uint32_t isaac_lua_engine_8999e0_host_va(void);
uint32_t isaac_lua_engine_8999e0_end_va(void);
uint32_t isaac_lua_engine_8999e0_next_va(void);
uint32_t isaac_lua_engine_8999e0_stack_args(void);
uint32_t isaac_lua_engine_8999e0_ecx_arg(void);
uint32_t isaac_lua_engine_8999e0_callee_pops_stack_args(void);
uint32_t isaac_lua_engine_8999e0_aligned_prologue(void);
uint32_t isaac_lua_engine_8999e0_iat_lua_touserdata(void);
uint32_t isaac_lua_engine_8999e0_touserdata_index(void);
uint32_t isaac_lua_engine_8999e0_iat_lua_type(void);
uint32_t isaac_lua_engine_8999e0_checkget_key(void);
uint32_t isaac_lua_engine_8999e0_checkget_index(void);
uint32_t isaac_lua_engine_8999e0_checkget_def_arg(void);
uint32_t isaac_lua_engine_8999e0_checkget_field_off(void);
uint32_t isaac_lua_engine_8999e0_checkget_helper_va(void);
uint32_t isaac_lua_engine_8999e0_method_vtable_field_off(void);
uint32_t isaac_lua_engine_8999e0_method_stack_args(void);
uint32_t isaac_lua_engine_8999e0_iat_lua_pushinteger(void);
uint32_t isaac_lua_engine_8999e0_pushinteger_hi_word(void);
uint32_t isaac_lua_engine_8999e0_return_value(void);
uint32_t isaac_lua_engine_899a50_host_va(void);
uint32_t isaac_lua_engine_899a50_end_va(void);
uint32_t isaac_lua_engine_899a50_next_va(void);
uint32_t isaac_lua_engine_899a50_stack_args(void);
uint32_t isaac_lua_engine_899a50_ecx_arg(void);
uint32_t isaac_lua_engine_899a50_callee_pops_stack_args(void);
uint32_t isaac_lua_engine_899a50_aligned_prologue(void);
uint32_t isaac_lua_engine_899a50_iat_lua_touserdata(void);
uint32_t isaac_lua_engine_899a50_touserdata_index(void);
uint32_t isaac_lua_engine_899a50_iat_lua_type(void);
uint32_t isaac_lua_engine_899a50_checkget_key(void);
uint32_t isaac_lua_engine_899a50_checkget_index(void);
uint32_t isaac_lua_engine_899a50_checkget_def_arg(void);
uint32_t isaac_lua_engine_899a50_checkget_field_off(void);
uint32_t isaac_lua_engine_899a50_checkget_helper_va(void);
uint32_t isaac_lua_engine_899a50_method_vtable_field_off(void);
uint32_t isaac_lua_engine_899a50_method_stack_args(void);
uint32_t isaac_lua_engine_899a50_newuserdata_size(void);
uint32_t isaac_lua_engine_899a50_ud_vtable_va(void);
uint32_t isaac_lua_engine_899a50_ud_payload_ptr_off(void);
uint32_t isaac_lua_engine_899a50_ud_payload_off(void);
uint32_t isaac_lua_engine_899a50_registry_index(void);
uint32_t isaac_lua_engine_899a50_metatable_rawgetp_key(void);
uint32_t isaac_lua_engine_899a50_iat_lua_rawgetp(void);
uint32_t isaac_lua_engine_899a50_iat_lua_setmetatable(void);
uint32_t isaac_lua_engine_899a50_setmetatable_index(void);
uint32_t isaac_lua_engine_899a50_return_value(void);

/* ==== ABI v76: wrapper-band continuation — 0x00899b00 integer-arg
 *   method call and 0x00899b70 sext-pusher band.
 *
 * PE 0x899b00..0x00899b6b (1 stack arg, no ecx arg, plain ret; int3
 * pad 0x899b6c..6f; `and esp,-8` aligned prologue): integer-arg method
 * call wrapper.
 *   g   = lua_type(L, 1)              IAT 0xb18400 @0x899b11
 *       FULL-WORD gate `test eax,eax; jne 0x899b24` @0x899b1a/1c;
 *       nil -> obj = 0 ([esp+0xc] = eax = 0)
 *   obj = check/get 0x85c590(ecx=L, edx=1, key 0xc829e6, def 0)
 *       @0x899b32 -> [eax+4]
 *   ud  = lua_touserdata(L, 0xfff0b9d7) IAT 0xb183b0 @0x899b47
 *   a   = lua_checkinteger(L, 2)      IAT 0xb183f4 @0x899b52
 *   [ud+0](a, obj)                    HOST call-through @0x899b62
 *     (obj in ecx, arg as stack arg)
 *   return 0
 *
 * PE 0x899b70..0x00899bcb (plain ret; int3 pad 0x899bcc..cf; NO
 * alignment prologue): sext-pusher band.
 *   g   = lua_type(L, 1)              IAT 0xb18400 @0x899b7b
 *       FULL-WORD gate `test eax,eax; jne 0x899b8c` @0x899b84/86;
 *       nil -> obj = 0 (edi = 0)
 *   obj = check/get 0x85c590(ecx=L, edx=1, key 0xc829e6, def 1)
 *       @0x899b9a -> [eax+4]
 *   ud  = lua_touserdata(L, 0xfff0b9d7) IAT 0xb183b0 @0x899bab
 *   r   = [ud+0](obj)                 HOST call-through @0x899bb8
 *       (obj in ecx, zero stack args)
 *   0x85bfd0(ecx=L, edx=r)            v55 ROW-3 SEXT PUSHER @0x899bbe
 *   return 1
 *
 * NEXT frontier: 0x00899bd0. Evidence
 * section-notes/lua-v76-899b00/NOTES.md. ==== */
enum { ISAAC_LUA_ENGINE_899B00_VA = 0x00899b00u };
enum { ISAAC_LUA_ENGINE_899B00_END_VA = 0x00899b6cu };
enum { ISAAC_LUA_ENGINE_899B00_NEXT_VA = 0x00899b70u };
enum { ISAAC_LUA_ENGINE_899B00_STACK_ARGS = 0x1u };
enum { ISAAC_LUA_ENGINE_899B00_ECX_ARG = 0x0u };
enum { ISAAC_LUA_ENGINE_899B00_CALLEE_POPS_STACK_ARGS = 0x0u };
enum { ISAAC_LUA_ENGINE_899B00_ALIGNED_PROLOGUE = 0x1u };
enum { ISAAC_LUA_ENGINE_899B00_IAT_LUA_TYPE = 0x00b18400u };
enum { ISAAC_LUA_ENGINE_899B00_CHECKGET_KEY = 0x00c829e6u };
enum { ISAAC_LUA_ENGINE_899B00_CHECKGET_INDEX = 0x1u };
enum { ISAAC_LUA_ENGINE_899B00_CHECKGET_DEF_ARG = 0x0u };
enum { ISAAC_LUA_ENGINE_899B00_CHECKGET_FIELD_OFF = 0x4u };
enum { ISAAC_LUA_ENGINE_899B00_CHECKGET_HELPER_VA = 0x0085c590u };
enum { ISAAC_LUA_ENGINE_899B00_IAT_LUA_TOUSERDATA = 0x00b183b0u };
enum { ISAAC_LUA_ENGINE_899B00_TOUSERDATA_INDEX_U32 = 0xfff0b9d7u };
enum { ISAAC_LUA_ENGINE_899B00_METHOD_VTABLE_FIELD_OFF = 0x0u };
enum { ISAAC_LUA_ENGINE_899B00_IAT_LUA_CHECKINTEGER = 0x00b183f4u };
enum { ISAAC_LUA_ENGINE_899B00_CHECKINTEGER_INDEX = 0x2u };
enum { ISAAC_LUA_ENGINE_899B00_METHOD_STACK_ARGS = 0x1u };
enum { ISAAC_LUA_ENGINE_899B00_RETURN_VALUE = 0x0u };
enum { ISAAC_LUA_ENGINE_899B70_VA = 0x00899b70u };
enum { ISAAC_LUA_ENGINE_899B70_END_VA = 0x00899bccu };
enum { ISAAC_LUA_ENGINE_899B70_NEXT_VA = 0x00899bd0u };
enum { ISAAC_LUA_ENGINE_899B70_STACK_ARGS = 0x1u };
enum { ISAAC_LUA_ENGINE_899B70_ECX_ARG = 0x0u };
enum { ISAAC_LUA_ENGINE_899B70_CALLEE_POPS_STACK_ARGS = 0x0u };
enum { ISAAC_LUA_ENGINE_899B70_ALIGNED_PROLOGUE = 0x0u };
enum { ISAAC_LUA_ENGINE_899B70_IAT_LUA_TYPE = 0x00b18400u };
enum { ISAAC_LUA_ENGINE_899B70_CHECKGET_KEY = 0x00c829e6u };
enum { ISAAC_LUA_ENGINE_899B70_CHECKGET_INDEX = 0x1u };
enum { ISAAC_LUA_ENGINE_899B70_CHECKGET_DEF_ARG = 0x1u };
enum { ISAAC_LUA_ENGINE_899B70_CHECKGET_FIELD_OFF = 0x4u };
enum { ISAAC_LUA_ENGINE_899B70_CHECKGET_HELPER_VA = 0x0085c590u };
enum { ISAAC_LUA_ENGINE_899B70_IAT_LUA_TOUSERDATA = 0x00b183b0u };
enum { ISAAC_LUA_ENGINE_899B70_TOUSERDATA_INDEX_U32 = 0xfff0b9d7u };
enum { ISAAC_LUA_ENGINE_899B70_METHOD_VTABLE_FIELD_OFF = 0x0u };
enum { ISAAC_LUA_ENGINE_899B70_METHOD_STACK_ARGS = 0x0u };
enum { ISAAC_LUA_ENGINE_899B70_PUSHER_HELPER_VA = 0x0085bfd0u };
enum { ISAAC_LUA_ENGINE_899B70_RETURN_VALUE = 0x1u };
int32_t isaac_lua_engine_899b00_type1_gate_taken(uint32_t type_result);
int32_t isaac_lua_engine_899b70_type1_gate_taken(uint32_t type_result);
uint32_t isaac_lua_engine_899b00_host_va(void);
uint32_t isaac_lua_engine_899b00_end_va(void);
uint32_t isaac_lua_engine_899b00_next_va(void);
uint32_t isaac_lua_engine_899b00_stack_args(void);
uint32_t isaac_lua_engine_899b00_ecx_arg(void);
uint32_t isaac_lua_engine_899b00_callee_pops_stack_args(void);
uint32_t isaac_lua_engine_899b00_aligned_prologue(void);
uint32_t isaac_lua_engine_899b00_iat_lua_type(void);
uint32_t isaac_lua_engine_899b00_checkget_key(void);
uint32_t isaac_lua_engine_899b00_checkget_index(void);
uint32_t isaac_lua_engine_899b00_checkget_def_arg(void);
uint32_t isaac_lua_engine_899b00_checkget_field_off(void);
uint32_t isaac_lua_engine_899b00_checkget_helper_va(void);
uint32_t isaac_lua_engine_899b00_iat_lua_touserdata(void);
uint32_t isaac_lua_engine_899b00_touserdata_index(void);
uint32_t isaac_lua_engine_899b00_method_vtable_field_off(void);
uint32_t isaac_lua_engine_899b00_iat_lua_checkinteger(void);
uint32_t isaac_lua_engine_899b00_checkinteger_index(void);
uint32_t isaac_lua_engine_899b00_method_stack_args(void);
uint32_t isaac_lua_engine_899b00_return_value(void);
uint32_t isaac_lua_engine_899b70_host_va(void);
uint32_t isaac_lua_engine_899b70_end_va(void);
uint32_t isaac_lua_engine_899b70_next_va(void);
uint32_t isaac_lua_engine_899b70_stack_args(void);
uint32_t isaac_lua_engine_899b70_ecx_arg(void);
uint32_t isaac_lua_engine_899b70_callee_pops_stack_args(void);
uint32_t isaac_lua_engine_899b70_aligned_prologue(void);
uint32_t isaac_lua_engine_899b70_iat_lua_type(void);
uint32_t isaac_lua_engine_899b70_checkget_key(void);
uint32_t isaac_lua_engine_899b70_checkget_index(void);
uint32_t isaac_lua_engine_899b70_checkget_def_arg(void);
uint32_t isaac_lua_engine_899b70_checkget_field_off(void);
uint32_t isaac_lua_engine_899b70_checkget_helper_va(void);
uint32_t isaac_lua_engine_899b70_iat_lua_touserdata(void);
uint32_t isaac_lua_engine_899b70_touserdata_index(void);
uint32_t isaac_lua_engine_899b70_method_vtable_field_off(void);
uint32_t isaac_lua_engine_899b70_method_stack_args(void);
uint32_t isaac_lua_engine_899b70_pusher_helper_va(void);
uint32_t isaac_lua_engine_899b70_return_value(void);

enum { ISAAC_LUA_ENGINE_899BD0_VA = 0x00899bd0u };
enum { ISAAC_LUA_ENGINE_899BD0_END_VA = 0x00899c69u };
enum { ISAAC_LUA_ENGINE_899BD0_NEXT_VA = 0x00899c70u };
enum { ISAAC_LUA_ENGINE_899BD0_STACK_ARGS = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899BD0_ECX_ARG = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899BD0_CALLEE_POPS_STACK_ARGS = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899BD0_ALIGNED_PROLOGUE = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899BD0_GATE_INVERTED_ENCODING = 0x1u };
enum { ISAAC_LUA_ENGINE_899BD0_IAT_LUA_TYPE = 0x00b18400u };
enum { ISAAC_LUA_ENGINE_899BD0_CHECKGET_KEY = 0x00c82a1eu };
enum { ISAAC_LUA_ENGINE_899BD0_CHECKGET_INDEX = 0x1u };
enum { ISAAC_LUA_ENGINE_899BD0_CHECKGET_DEF_ARG = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899BD0_CHECKGET_FIELD_OFF = 0x4u };
enum { ISAAC_LUA_ENGINE_899BD0_CHECKGET_HELPER_VA = 0x0085c590u };
enum { ISAAC_LUA_ENGINE_899BD0_CAST_HELPER_VA = 0x00af08b1u };
enum { ISAAC_LUA_ENGINE_899BD0_CAST_VF_DELTA = 0x0u };
enum { ISAAC_LUA_ENGINE_899BD0_CAST_SRC_TYPE_VA = 0x00c5d7a4u };
enum { ISAAC_LUA_ENGINE_899BD0_CAST_DST_TYPE_VA = 0x00c5e8ecu };
enum { ISAAC_LUA_ENGINE_899BD0_CAST_IS_REFERENCE = 0x0u };
enum { ISAAC_LUA_ENGINE_899BD0_IAT_LUA_PUSHNIL = 0x00b183e0u };
enum { ISAAC_LUA_ENGINE_899BD0_NEWUSERDATA_SIZE = 0x00000008u };
enum { ISAAC_LUA_ENGINE_899BD0_UD_VTABLE_VA = 0x00b753c8u };
enum { ISAAC_LUA_ENGINE_899BD0_UD_PTR_FIELD_OFF = 0x00000004u };
enum { ISAAC_LUA_ENGINE_899BD0_REGISTRY_INDEX_U32 = 0xfff0b9d8u };
enum { ISAAC_LUA_ENGINE_899BD0_METATABLE_RAWGETP_KEY = 0x00c829f1u };
enum { ISAAC_LUA_ENGINE_899BD0_IAT_LUA_RAWGETP = 0x00b183bcu };
enum { ISAAC_LUA_ENGINE_899BD0_IAT_LUA_SETMETATABLE = 0x00b18398u };
enum { ISAAC_LUA_ENGINE_899BD0_SETMETATABLE_INDEX_U32 = 0xfffffffeu };
enum { ISAAC_LUA_ENGINE_899BD0_RETURN_VALUE = 0x1u };
int32_t isaac_lua_engine_899bd0_type1_gate_taken(uint32_t type_result);
uint32_t isaac_lua_engine_899bd0_host_va(void);
uint32_t isaac_lua_engine_899bd0_end_va(void);
uint32_t isaac_lua_engine_899bd0_next_va(void);
uint32_t isaac_lua_engine_899bd0_stack_args(void);
uint32_t isaac_lua_engine_899bd0_ecx_arg(void);
uint32_t isaac_lua_engine_899bd0_callee_pops_stack_args(void);
uint32_t isaac_lua_engine_899bd0_aligned_prologue(void);
uint32_t isaac_lua_engine_899bd0_iat_lua_type(void);
uint32_t isaac_lua_engine_899bd0_gate_inverted_encoding(void);
uint32_t isaac_lua_engine_899bd0_checkget_key(void);
uint32_t isaac_lua_engine_899bd0_checkget_index(void);
uint32_t isaac_lua_engine_899bd0_checkget_def_arg(void);
uint32_t isaac_lua_engine_899bd0_checkget_field_off(void);
uint32_t isaac_lua_engine_899bd0_checkget_helper_va(void);
uint32_t isaac_lua_engine_899bd0_cast_helper_va(void);
uint32_t isaac_lua_engine_899bd0_cast_vf_delta(void);
uint32_t isaac_lua_engine_899bd0_cast_src_type_va(void);
uint32_t isaac_lua_engine_899bd0_cast_dst_type_va(void);
uint32_t isaac_lua_engine_899bd0_cast_is_reference(void);
uint32_t isaac_lua_engine_899bd0_iat_lua_pushnil(void);
uint32_t isaac_lua_engine_899bd0_newuserdata_size(void);
uint32_t isaac_lua_engine_899bd0_ud_vtable_va(void);
uint32_t isaac_lua_engine_899bd0_ud_ptr_field_off(void);
uint32_t isaac_lua_engine_899bd0_registry_index(void);
uint32_t isaac_lua_engine_899bd0_metatable_rawgetp_key(void);
uint32_t isaac_lua_engine_899bd0_iat_lua_rawgetp(void);
uint32_t isaac_lua_engine_899bd0_iat_lua_setmetatable(void);
uint32_t isaac_lua_engine_899bd0_setmetatable_index(void);
uint32_t isaac_lua_engine_899bd0_return_value(void);
enum { ISAAC_LUA_ENGINE_899C70_VA = 0x00899c70u };
enum { ISAAC_LUA_ENGINE_899C70_END_VA = 0x00899d09u };
enum { ISAAC_LUA_ENGINE_899C70_NEXT_VA = 0x00899d10u };
enum { ISAAC_LUA_ENGINE_899C70_STACK_ARGS = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899C70_ECX_ARG = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899C70_CALLEE_POPS_STACK_ARGS = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899C70_ALIGNED_PROLOGUE = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899C70_GATE_INVERTED_ENCODING = 0x1u };
enum { ISAAC_LUA_ENGINE_899C70_IAT_LUA_TYPE = 0x00b18400u };
enum { ISAAC_LUA_ENGINE_899C70_CHECKGET_KEY = 0x00c82a1eu };
enum { ISAAC_LUA_ENGINE_899C70_CHECKGET_INDEX = 0x1u };
enum { ISAAC_LUA_ENGINE_899C70_CHECKGET_DEF_ARG = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899C70_CHECKGET_FIELD_OFF = 0x4u };
enum { ISAAC_LUA_ENGINE_899C70_CHECKGET_HELPER_VA = 0x0085c590u };
enum { ISAAC_LUA_ENGINE_899C70_CAST_HELPER_VA = 0x00af08b1u };
enum { ISAAC_LUA_ENGINE_899C70_CAST_VF_DELTA = 0x0u };
enum { ISAAC_LUA_ENGINE_899C70_CAST_SRC_TYPE_VA = 0x00c5d7a4u };
enum { ISAAC_LUA_ENGINE_899C70_CAST_DST_TYPE_VA = 0x00c5e8ecu };
enum { ISAAC_LUA_ENGINE_899C70_CAST_IS_REFERENCE = 0x0u };
enum { ISAAC_LUA_ENGINE_899C70_IAT_LUA_PUSHNIL = 0x00b183e0u };
enum { ISAAC_LUA_ENGINE_899C70_NEWUSERDATA_SIZE = 0x00000008u };
enum { ISAAC_LUA_ENGINE_899C70_UD_VTABLE_VA = 0x00b753c8u };
enum { ISAAC_LUA_ENGINE_899C70_UD_PTR_FIELD_OFF = 0x00000004u };
enum { ISAAC_LUA_ENGINE_899C70_REGISTRY_INDEX_U32 = 0xfff0b9d8u };
enum { ISAAC_LUA_ENGINE_899C70_METATABLE_RAWGETP_KEY = 0x00c829f2u };
enum { ISAAC_LUA_ENGINE_899C70_IAT_LUA_RAWGETP = 0x00b183bcu };
enum { ISAAC_LUA_ENGINE_899C70_IAT_LUA_SETMETATABLE = 0x00b18398u };
enum { ISAAC_LUA_ENGINE_899C70_SETMETATABLE_INDEX_U32 = 0xfffffffeu };
enum { ISAAC_LUA_ENGINE_899C70_RETURN_VALUE = 0x1u };
int32_t isaac_lua_engine_899c70_type1_gate_taken(uint32_t type_result);
uint32_t isaac_lua_engine_899c70_host_va(void);
uint32_t isaac_lua_engine_899c70_end_va(void);
uint32_t isaac_lua_engine_899c70_next_va(void);
uint32_t isaac_lua_engine_899c70_stack_args(void);
uint32_t isaac_lua_engine_899c70_ecx_arg(void);
uint32_t isaac_lua_engine_899c70_callee_pops_stack_args(void);
uint32_t isaac_lua_engine_899c70_aligned_prologue(void);
uint32_t isaac_lua_engine_899c70_iat_lua_type(void);
uint32_t isaac_lua_engine_899c70_gate_inverted_encoding(void);
uint32_t isaac_lua_engine_899c70_checkget_key(void);
uint32_t isaac_lua_engine_899c70_checkget_index(void);
uint32_t isaac_lua_engine_899c70_checkget_def_arg(void);
uint32_t isaac_lua_engine_899c70_checkget_field_off(void);
uint32_t isaac_lua_engine_899c70_checkget_helper_va(void);
uint32_t isaac_lua_engine_899c70_cast_helper_va(void);
uint32_t isaac_lua_engine_899c70_cast_vf_delta(void);
uint32_t isaac_lua_engine_899c70_cast_src_type_va(void);
uint32_t isaac_lua_engine_899c70_cast_dst_type_va(void);
uint32_t isaac_lua_engine_899c70_cast_is_reference(void);
uint32_t isaac_lua_engine_899c70_iat_lua_pushnil(void);
uint32_t isaac_lua_engine_899c70_newuserdata_size(void);
uint32_t isaac_lua_engine_899c70_ud_vtable_va(void);
uint32_t isaac_lua_engine_899c70_ud_ptr_field_off(void);
uint32_t isaac_lua_engine_899c70_registry_index(void);
uint32_t isaac_lua_engine_899c70_metatable_rawgetp_key(void);
uint32_t isaac_lua_engine_899c70_iat_lua_rawgetp(void);
uint32_t isaac_lua_engine_899c70_iat_lua_setmetatable(void);
uint32_t isaac_lua_engine_899c70_setmetatable_index(void);
uint32_t isaac_lua_engine_899c70_return_value(void);

enum { ISAAC_LUA_ENGINE_899D10_VA = 0x00899d10u };
enum { ISAAC_LUA_ENGINE_899D10_END_VA = 0x00899da9u };
enum { ISAAC_LUA_ENGINE_899D10_NEXT_VA = 0x00899db0u };
enum { ISAAC_LUA_ENGINE_899D10_STACK_ARGS = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899D10_ECX_ARG = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899D10_CALLEE_POPS_STACK_ARGS = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899D10_ALIGNED_PROLOGUE = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899D10_GATE_INVERTED_ENCODING = 0x1u };
enum { ISAAC_LUA_ENGINE_899D10_IAT_LUA_TYPE = 0x00b18400u };
enum { ISAAC_LUA_ENGINE_899D10_CHECKGET_KEY = 0x00c82a1eu };
enum { ISAAC_LUA_ENGINE_899D10_CHECKGET_INDEX = 0x1u };
enum { ISAAC_LUA_ENGINE_899D10_CHECKGET_DEF_ARG = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899D10_CHECKGET_FIELD_OFF = 0x4u };
enum { ISAAC_LUA_ENGINE_899D10_CHECKGET_HELPER_VA = 0x0085c590u };
enum { ISAAC_LUA_ENGINE_899D10_CAST_HELPER_VA = 0x00af08b1u };
enum { ISAAC_LUA_ENGINE_899D10_CAST_VF_DELTA = 0x0u };
enum { ISAAC_LUA_ENGINE_899D10_CAST_SRC_TYPE_VA = 0x00c5d7a4u };
enum { ISAAC_LUA_ENGINE_899D10_CAST_DST_TYPE_VA = 0x00c5d804u };
enum { ISAAC_LUA_ENGINE_899D10_CAST_IS_REFERENCE = 0x0u };
enum { ISAAC_LUA_ENGINE_899D10_IAT_LUA_PUSHNIL = 0x00b183e0u };
enum { ISAAC_LUA_ENGINE_899D10_NEWUSERDATA_SIZE = 0x00000008u };
enum { ISAAC_LUA_ENGINE_899D10_UD_VTABLE_VA = 0x00b753c8u };
enum { ISAAC_LUA_ENGINE_899D10_UD_PTR_FIELD_OFF = 0x00000004u };
enum { ISAAC_LUA_ENGINE_899D10_REGISTRY_INDEX_U32 = 0xfff0b9d8u };
enum { ISAAC_LUA_ENGINE_899D10_METATABLE_RAWGETP_KEY = 0x00c829f7u };
enum { ISAAC_LUA_ENGINE_899D10_IAT_LUA_RAWGETP = 0x00b183bcu };
enum { ISAAC_LUA_ENGINE_899D10_IAT_LUA_SETMETATABLE = 0x00b18398u };
enum { ISAAC_LUA_ENGINE_899D10_SETMETATABLE_INDEX_U32 = 0xfffffffeu };
enum { ISAAC_LUA_ENGINE_899D10_RETURN_VALUE = 0x1u };
int32_t isaac_lua_engine_899d10_type1_gate_taken(uint32_t type_result);
uint32_t isaac_lua_engine_899d10_host_va(void);
uint32_t isaac_lua_engine_899d10_end_va(void);
uint32_t isaac_lua_engine_899d10_next_va(void);
uint32_t isaac_lua_engine_899d10_stack_args(void);
uint32_t isaac_lua_engine_899d10_ecx_arg(void);
uint32_t isaac_lua_engine_899d10_callee_pops_stack_args(void);
uint32_t isaac_lua_engine_899d10_aligned_prologue(void);
uint32_t isaac_lua_engine_899d10_iat_lua_type(void);
uint32_t isaac_lua_engine_899d10_gate_inverted_encoding(void);
uint32_t isaac_lua_engine_899d10_checkget_key(void);
uint32_t isaac_lua_engine_899d10_checkget_index(void);
uint32_t isaac_lua_engine_899d10_checkget_def_arg(void);
uint32_t isaac_lua_engine_899d10_checkget_field_off(void);
uint32_t isaac_lua_engine_899d10_checkget_helper_va(void);
uint32_t isaac_lua_engine_899d10_cast_helper_va(void);
uint32_t isaac_lua_engine_899d10_cast_vf_delta(void);
uint32_t isaac_lua_engine_899d10_cast_src_type_va(void);
uint32_t isaac_lua_engine_899d10_cast_dst_type_va(void);
uint32_t isaac_lua_engine_899d10_cast_is_reference(void);
uint32_t isaac_lua_engine_899d10_iat_lua_pushnil(void);
uint32_t isaac_lua_engine_899d10_newuserdata_size(void);
uint32_t isaac_lua_engine_899d10_ud_vtable_va(void);
uint32_t isaac_lua_engine_899d10_ud_ptr_field_off(void);
uint32_t isaac_lua_engine_899d10_registry_index(void);
uint32_t isaac_lua_engine_899d10_metatable_rawgetp_key(void);
uint32_t isaac_lua_engine_899d10_iat_lua_rawgetp(void);
uint32_t isaac_lua_engine_899d10_iat_lua_setmetatable(void);
uint32_t isaac_lua_engine_899d10_setmetatable_index(void);
uint32_t isaac_lua_engine_899d10_return_value(void);
enum { ISAAC_LUA_ENGINE_899DB0_VA = 0x00899db0u };
enum { ISAAC_LUA_ENGINE_899DB0_END_VA = 0x00899e49u };
enum { ISAAC_LUA_ENGINE_899DB0_NEXT_VA = 0x00899e50u };
enum { ISAAC_LUA_ENGINE_899DB0_STACK_ARGS = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899DB0_ECX_ARG = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899DB0_CALLEE_POPS_STACK_ARGS = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899DB0_ALIGNED_PROLOGUE = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899DB0_GATE_INVERTED_ENCODING = 0x1u };
enum { ISAAC_LUA_ENGINE_899DB0_IAT_LUA_TYPE = 0x00b18400u };
enum { ISAAC_LUA_ENGINE_899DB0_CHECKGET_KEY = 0x00c82a1eu };
enum { ISAAC_LUA_ENGINE_899DB0_CHECKGET_INDEX = 0x1u };
enum { ISAAC_LUA_ENGINE_899DB0_CHECKGET_DEF_ARG = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899DB0_CHECKGET_FIELD_OFF = 0x4u };
enum { ISAAC_LUA_ENGINE_899DB0_CHECKGET_HELPER_VA = 0x0085c590u };
enum { ISAAC_LUA_ENGINE_899DB0_CAST_HELPER_VA = 0x00af08b1u };
enum { ISAAC_LUA_ENGINE_899DB0_CAST_VF_DELTA = 0x0u };
enum { ISAAC_LUA_ENGINE_899DB0_CAST_SRC_TYPE_VA = 0x00c5d7a4u };
enum { ISAAC_LUA_ENGINE_899DB0_CAST_DST_TYPE_VA = 0x00c5d804u };
enum { ISAAC_LUA_ENGINE_899DB0_CAST_IS_REFERENCE = 0x0u };
enum { ISAAC_LUA_ENGINE_899DB0_IAT_LUA_PUSHNIL = 0x00b183e0u };
enum { ISAAC_LUA_ENGINE_899DB0_NEWUSERDATA_SIZE = 0x00000008u };
enum { ISAAC_LUA_ENGINE_899DB0_UD_VTABLE_VA = 0x00b753c8u };
enum { ISAAC_LUA_ENGINE_899DB0_UD_PTR_FIELD_OFF = 0x00000004u };
enum { ISAAC_LUA_ENGINE_899DB0_REGISTRY_INDEX_U32 = 0xfff0b9d8u };
enum { ISAAC_LUA_ENGINE_899DB0_METATABLE_RAWGETP_KEY = 0x00c829f8u };
enum { ISAAC_LUA_ENGINE_899DB0_IAT_LUA_RAWGETP = 0x00b183bcu };
enum { ISAAC_LUA_ENGINE_899DB0_IAT_LUA_SETMETATABLE = 0x00b18398u };
enum { ISAAC_LUA_ENGINE_899DB0_SETMETATABLE_INDEX_U32 = 0xfffffffeu };
enum { ISAAC_LUA_ENGINE_899DB0_RETURN_VALUE = 0x1u };
int32_t isaac_lua_engine_899db0_type1_gate_taken(uint32_t type_result);
uint32_t isaac_lua_engine_899db0_host_va(void);
uint32_t isaac_lua_engine_899db0_end_va(void);
uint32_t isaac_lua_engine_899db0_next_va(void);
uint32_t isaac_lua_engine_899db0_stack_args(void);
uint32_t isaac_lua_engine_899db0_ecx_arg(void);
uint32_t isaac_lua_engine_899db0_callee_pops_stack_args(void);
uint32_t isaac_lua_engine_899db0_aligned_prologue(void);
uint32_t isaac_lua_engine_899db0_iat_lua_type(void);
uint32_t isaac_lua_engine_899db0_gate_inverted_encoding(void);
uint32_t isaac_lua_engine_899db0_checkget_key(void);
uint32_t isaac_lua_engine_899db0_checkget_index(void);
uint32_t isaac_lua_engine_899db0_checkget_def_arg(void);
uint32_t isaac_lua_engine_899db0_checkget_field_off(void);
uint32_t isaac_lua_engine_899db0_checkget_helper_va(void);
uint32_t isaac_lua_engine_899db0_cast_helper_va(void);
uint32_t isaac_lua_engine_899db0_cast_vf_delta(void);
uint32_t isaac_lua_engine_899db0_cast_src_type_va(void);
uint32_t isaac_lua_engine_899db0_cast_dst_type_va(void);
uint32_t isaac_lua_engine_899db0_cast_is_reference(void);
uint32_t isaac_lua_engine_899db0_iat_lua_pushnil(void);
uint32_t isaac_lua_engine_899db0_newuserdata_size(void);
uint32_t isaac_lua_engine_899db0_ud_vtable_va(void);
uint32_t isaac_lua_engine_899db0_ud_ptr_field_off(void);
uint32_t isaac_lua_engine_899db0_registry_index(void);
uint32_t isaac_lua_engine_899db0_metatable_rawgetp_key(void);
uint32_t isaac_lua_engine_899db0_iat_lua_rawgetp(void);
uint32_t isaac_lua_engine_899db0_iat_lua_setmetatable(void);
uint32_t isaac_lua_engine_899db0_setmetatable_index(void);
uint32_t isaac_lua_engine_899db0_return_value(void);

enum { ISAAC_LUA_ENGINE_899E50_STACK_ARGS = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899E50_ECX_ARG = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899E50_CALLEE_POPS_STACK_ARGS = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899E50_ALIGNED_PROLOGUE = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899E50_GATE_INVERTED_ENCODING = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899E50_IAT_LUA_TYPE = 0x00b18400u };
enum { ISAAC_LUA_ENGINE_899E50_CHECKGET_KEY = 0x00c82a1eu };
enum { ISAAC_LUA_ENGINE_899E50_CHECKGET_INDEX = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899E50_CHECKGET_FIELD_OFF = 0x00000004u };
enum { ISAAC_LUA_ENGINE_899E50_CHECKGET_HELPER_VA = 0x0085c590u };
enum { ISAAC_LUA_ENGINE_899E50_CAST_HELPER_VA = 0x00af08b1u };
enum { ISAAC_LUA_ENGINE_899E50_CAST_VF_DELTA = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899E50_CAST_SRC_TYPE_VA = 0x00c5d7a4u };
enum { ISAAC_LUA_ENGINE_899E50_CAST_IS_REFERENCE = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899E50_IAT_LUA_PUSHNIL = 0x00b183e0u };
enum { ISAAC_LUA_ENGINE_899E50_NEWUSERDATA_SIZE = 0x00000008u };
enum { ISAAC_LUA_ENGINE_899E50_UD_VTABLE_VA = 0x00b753c8u };
enum { ISAAC_LUA_ENGINE_899E50_UD_PTR_FIELD_OFF = 0x00000004u };
enum { ISAAC_LUA_ENGINE_899E50_REGISTRY_INDEX_U32 = 0xfff0b9d8u };
enum { ISAAC_LUA_ENGINE_899E50_IAT_LUA_RAWGETP = 0x00b183bcu };
enum { ISAAC_LUA_ENGINE_899E50_IAT_LUA_SETMETATABLE = 0x00b18398u };
enum { ISAAC_LUA_ENGINE_899E50_SETMETATABLE_INDEX_U32 = 0xfffffffeu };
enum { ISAAC_LUA_ENGINE_899E50_RETURN_VALUE = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899E50_VA = 0x00899e50u };
enum { ISAAC_LUA_ENGINE_899E50_END_VA = 0x00899ee9u };
enum { ISAAC_LUA_ENGINE_899E50_NEXT_VA = 0x00899ef0u };
enum { ISAAC_LUA_ENGINE_899E50_CHECKGET_DEF_ARG = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899E50_CAST_DST_TYPE_VA = 0x00c5e814u };
enum { ISAAC_LUA_ENGINE_899E50_METATABLE_RAWGETP_KEY = 0x00c829f4u };
int32_t isaac_lua_engine_899e50_type1_gate_taken(uint32_t type_result);
uint32_t isaac_lua_engine_899e50_host_va(void);
uint32_t isaac_lua_engine_899e50_end_va(void);
uint32_t isaac_lua_engine_899e50_next_va(void);
uint32_t isaac_lua_engine_899e50_stack_args(void);
uint32_t isaac_lua_engine_899e50_ecx_arg(void);
uint32_t isaac_lua_engine_899e50_callee_pops_stack_args(void);
uint32_t isaac_lua_engine_899e50_aligned_prologue(void);
uint32_t isaac_lua_engine_899e50_iat_lua_type(void);
uint32_t isaac_lua_engine_899e50_gate_inverted_encoding(void);
uint32_t isaac_lua_engine_899e50_checkget_key(void);
uint32_t isaac_lua_engine_899e50_checkget_index(void);
uint32_t isaac_lua_engine_899e50_checkget_def_arg(void);
uint32_t isaac_lua_engine_899e50_checkget_field_off(void);
uint32_t isaac_lua_engine_899e50_checkget_helper_va(void);
uint32_t isaac_lua_engine_899e50_cast_helper_va(void);
uint32_t isaac_lua_engine_899e50_cast_vf_delta(void);
uint32_t isaac_lua_engine_899e50_cast_src_type_va(void);
uint32_t isaac_lua_engine_899e50_cast_dst_type_va(void);
uint32_t isaac_lua_engine_899e50_cast_is_reference(void);
uint32_t isaac_lua_engine_899e50_iat_lua_pushnil(void);
uint32_t isaac_lua_engine_899e50_newuserdata_size(void);
uint32_t isaac_lua_engine_899e50_ud_vtable_va(void);
uint32_t isaac_lua_engine_899e50_ud_ptr_field_off(void);
uint32_t isaac_lua_engine_899e50_registry_index(void);
uint32_t isaac_lua_engine_899e50_metatable_rawgetp_key(void);
uint32_t isaac_lua_engine_899e50_iat_lua_rawgetp(void);
uint32_t isaac_lua_engine_899e50_iat_lua_setmetatable(void);
uint32_t isaac_lua_engine_899e50_setmetatable_index(void);
uint32_t isaac_lua_engine_899e50_return_value(void);
enum { ISAAC_LUA_ENGINE_899EF0_STACK_ARGS = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899EF0_ECX_ARG = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899EF0_CALLEE_POPS_STACK_ARGS = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899EF0_ALIGNED_PROLOGUE = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899EF0_GATE_INVERTED_ENCODING = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899EF0_IAT_LUA_TYPE = 0x00b18400u };
enum { ISAAC_LUA_ENGINE_899EF0_CHECKGET_KEY = 0x00c82a1eu };
enum { ISAAC_LUA_ENGINE_899EF0_CHECKGET_INDEX = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899EF0_CHECKGET_FIELD_OFF = 0x00000004u };
enum { ISAAC_LUA_ENGINE_899EF0_CHECKGET_HELPER_VA = 0x0085c590u };
enum { ISAAC_LUA_ENGINE_899EF0_CAST_HELPER_VA = 0x00af08b1u };
enum { ISAAC_LUA_ENGINE_899EF0_CAST_VF_DELTA = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899EF0_CAST_SRC_TYPE_VA = 0x00c5d7a4u };
enum { ISAAC_LUA_ENGINE_899EF0_CAST_IS_REFERENCE = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899EF0_IAT_LUA_PUSHNIL = 0x00b183e0u };
enum { ISAAC_LUA_ENGINE_899EF0_NEWUSERDATA_SIZE = 0x00000008u };
enum { ISAAC_LUA_ENGINE_899EF0_UD_VTABLE_VA = 0x00b753c8u };
enum { ISAAC_LUA_ENGINE_899EF0_UD_PTR_FIELD_OFF = 0x00000004u };
enum { ISAAC_LUA_ENGINE_899EF0_REGISTRY_INDEX_U32 = 0xfff0b9d8u };
enum { ISAAC_LUA_ENGINE_899EF0_IAT_LUA_RAWGETP = 0x00b183bcu };
enum { ISAAC_LUA_ENGINE_899EF0_IAT_LUA_SETMETATABLE = 0x00b18398u };
enum { ISAAC_LUA_ENGINE_899EF0_SETMETATABLE_INDEX_U32 = 0xfffffffeu };
enum { ISAAC_LUA_ENGINE_899EF0_RETURN_VALUE = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899EF0_VA = 0x00899ef0u };
enum { ISAAC_LUA_ENGINE_899EF0_END_VA = 0x00899f89u };
enum { ISAAC_LUA_ENGINE_899EF0_NEXT_VA = 0x00899fa0u };
enum { ISAAC_LUA_ENGINE_899EF0_CHECKGET_DEF_ARG = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899EF0_CAST_DST_TYPE_VA = 0x00c5e814u };
enum { ISAAC_LUA_ENGINE_899EF0_METATABLE_RAWGETP_KEY = 0x00c829f5u };
int32_t isaac_lua_engine_899ef0_type1_gate_taken(uint32_t type_result);
uint32_t isaac_lua_engine_899ef0_host_va(void);
uint32_t isaac_lua_engine_899ef0_end_va(void);
uint32_t isaac_lua_engine_899ef0_next_va(void);
uint32_t isaac_lua_engine_899ef0_stack_args(void);
uint32_t isaac_lua_engine_899ef0_ecx_arg(void);
uint32_t isaac_lua_engine_899ef0_callee_pops_stack_args(void);
uint32_t isaac_lua_engine_899ef0_aligned_prologue(void);
uint32_t isaac_lua_engine_899ef0_iat_lua_type(void);
uint32_t isaac_lua_engine_899ef0_gate_inverted_encoding(void);
uint32_t isaac_lua_engine_899ef0_checkget_key(void);
uint32_t isaac_lua_engine_899ef0_checkget_index(void);
uint32_t isaac_lua_engine_899ef0_checkget_def_arg(void);
uint32_t isaac_lua_engine_899ef0_checkget_field_off(void);
uint32_t isaac_lua_engine_899ef0_checkget_helper_va(void);
uint32_t isaac_lua_engine_899ef0_cast_helper_va(void);
uint32_t isaac_lua_engine_899ef0_cast_vf_delta(void);
uint32_t isaac_lua_engine_899ef0_cast_src_type_va(void);
uint32_t isaac_lua_engine_899ef0_cast_dst_type_va(void);
uint32_t isaac_lua_engine_899ef0_cast_is_reference(void);
uint32_t isaac_lua_engine_899ef0_iat_lua_pushnil(void);
uint32_t isaac_lua_engine_899ef0_newuserdata_size(void);
uint32_t isaac_lua_engine_899ef0_ud_vtable_va(void);
uint32_t isaac_lua_engine_899ef0_ud_ptr_field_off(void);
uint32_t isaac_lua_engine_899ef0_registry_index(void);
uint32_t isaac_lua_engine_899ef0_metatable_rawgetp_key(void);
uint32_t isaac_lua_engine_899ef0_iat_lua_rawgetp(void);
uint32_t isaac_lua_engine_899ef0_iat_lua_setmetatable(void);
uint32_t isaac_lua_engine_899ef0_setmetatable_index(void);
uint32_t isaac_lua_engine_899ef0_return_value(void);

enum { ISAAC_LUA_ENGINE_899FA0_STACK_ARGS = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899FA0_ECX_ARG = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899FA0_CALLEE_POPS_STACK_ARGS = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899FA0_ALIGNED_PROLOGUE = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899FA0_GATE_INVERTED_ENCODING = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899FA0_IAT_LUA_TYPE = 0x00b18400u };
enum { ISAAC_LUA_ENGINE_899FA0_CHECKGET_KEY = 0x00c82a1eu };
enum { ISAAC_LUA_ENGINE_899FA0_CHECKGET_INDEX = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899FA0_CHECKGET_FIELD_OFF = 0x00000004u };
enum { ISAAC_LUA_ENGINE_899FA0_CHECKGET_HELPER_VA = 0x0085c590u };
enum { ISAAC_LUA_ENGINE_899FA0_CAST_HELPER_VA = 0x00af08b1u };
enum { ISAAC_LUA_ENGINE_899FA0_CAST_VF_DELTA = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899FA0_CAST_SRC_TYPE_VA = 0x00c5d7a4u };
enum { ISAAC_LUA_ENGINE_899FA0_CAST_IS_REFERENCE = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899FA0_IAT_LUA_PUSHNIL = 0x00b183e0u };
enum { ISAAC_LUA_ENGINE_899FA0_NEWUSERDATA_SIZE = 0x00000008u };
enum { ISAAC_LUA_ENGINE_899FA0_UD_VTABLE_VA = 0x00b753c8u };
enum { ISAAC_LUA_ENGINE_899FA0_UD_PTR_FIELD_OFF = 0x00000004u };
enum { ISAAC_LUA_ENGINE_899FA0_REGISTRY_INDEX_U32 = 0xfff0b9d8u };
enum { ISAAC_LUA_ENGINE_899FA0_IAT_LUA_RAWGETP = 0x00b183bcu };
enum { ISAAC_LUA_ENGINE_899FA0_IAT_LUA_SETMETATABLE = 0x00b18398u };
enum { ISAAC_LUA_ENGINE_899FA0_SETMETATABLE_INDEX_U32 = 0xfffffffeu };
enum { ISAAC_LUA_ENGINE_899FA0_RETURN_VALUE = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899FA0_VA = 0x00899fa0u };
enum { ISAAC_LUA_ENGINE_899FA0_END_VA = 0x0089a039u };
enum { ISAAC_LUA_ENGINE_899FA0_NEXT_VA = 0x0089a040u };
enum { ISAAC_LUA_ENGINE_899FA0_CHECKGET_DEF_ARG = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899FA0_CAST_DST_TYPE_VA = 0x00c5d8ccu };
enum { ISAAC_LUA_ENGINE_899FA0_METATABLE_RAWGETP_KEY = 0x00c829eeu };
int32_t isaac_lua_engine_899fa0_type1_gate_taken(uint32_t type_result);
uint32_t isaac_lua_engine_899fa0_host_va(void);
uint32_t isaac_lua_engine_899fa0_end_va(void);
uint32_t isaac_lua_engine_899fa0_next_va(void);
uint32_t isaac_lua_engine_899fa0_stack_args(void);
uint32_t isaac_lua_engine_899fa0_ecx_arg(void);
uint32_t isaac_lua_engine_899fa0_callee_pops_stack_args(void);
uint32_t isaac_lua_engine_899fa0_aligned_prologue(void);
uint32_t isaac_lua_engine_899fa0_iat_lua_type(void);
uint32_t isaac_lua_engine_899fa0_gate_inverted_encoding(void);
uint32_t isaac_lua_engine_899fa0_checkget_key(void);
uint32_t isaac_lua_engine_899fa0_checkget_index(void);
uint32_t isaac_lua_engine_899fa0_checkget_def_arg(void);
uint32_t isaac_lua_engine_899fa0_checkget_field_off(void);
uint32_t isaac_lua_engine_899fa0_checkget_helper_va(void);
uint32_t isaac_lua_engine_899fa0_cast_helper_va(void);
uint32_t isaac_lua_engine_899fa0_cast_vf_delta(void);
uint32_t isaac_lua_engine_899fa0_cast_src_type_va(void);
uint32_t isaac_lua_engine_899fa0_cast_dst_type_va(void);
uint32_t isaac_lua_engine_899fa0_cast_is_reference(void);
uint32_t isaac_lua_engine_899fa0_iat_lua_pushnil(void);
uint32_t isaac_lua_engine_899fa0_newuserdata_size(void);
uint32_t isaac_lua_engine_899fa0_ud_vtable_va(void);
uint32_t isaac_lua_engine_899fa0_ud_ptr_field_off(void);
uint32_t isaac_lua_engine_899fa0_registry_index(void);
uint32_t isaac_lua_engine_899fa0_metatable_rawgetp_key(void);
uint32_t isaac_lua_engine_899fa0_iat_lua_rawgetp(void);
uint32_t isaac_lua_engine_899fa0_iat_lua_setmetatable(void);
uint32_t isaac_lua_engine_899fa0_setmetatable_index(void);
uint32_t isaac_lua_engine_899fa0_return_value(void);
enum { ISAAC_LUA_ENGINE_899A040_STACK_ARGS = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899A040_ECX_ARG = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899A040_CALLEE_POPS_STACK_ARGS = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899A040_ALIGNED_PROLOGUE = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899A040_GATE_INVERTED_ENCODING = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899A040_IAT_LUA_TYPE = 0x00b18400u };
enum { ISAAC_LUA_ENGINE_899A040_CHECKGET_KEY = 0x00c82a1eu };
enum { ISAAC_LUA_ENGINE_899A040_CHECKGET_INDEX = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899A040_CHECKGET_FIELD_OFF = 0x00000004u };
enum { ISAAC_LUA_ENGINE_899A040_CHECKGET_HELPER_VA = 0x0085c590u };
enum { ISAAC_LUA_ENGINE_899A040_CAST_HELPER_VA = 0x00af08b1u };
enum { ISAAC_LUA_ENGINE_899A040_CAST_VF_DELTA = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899A040_CAST_SRC_TYPE_VA = 0x00c5d7a4u };
enum { ISAAC_LUA_ENGINE_899A040_CAST_IS_REFERENCE = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899A040_IAT_LUA_PUSHNIL = 0x00b183e0u };
enum { ISAAC_LUA_ENGINE_899A040_NEWUSERDATA_SIZE = 0x00000008u };
enum { ISAAC_LUA_ENGINE_899A040_UD_VTABLE_VA = 0x00b753c8u };
enum { ISAAC_LUA_ENGINE_899A040_UD_PTR_FIELD_OFF = 0x00000004u };
enum { ISAAC_LUA_ENGINE_899A040_REGISTRY_INDEX_U32 = 0xfff0b9d8u };
enum { ISAAC_LUA_ENGINE_899A040_IAT_LUA_RAWGETP = 0x00b183bcu };
enum { ISAAC_LUA_ENGINE_899A040_IAT_LUA_SETMETATABLE = 0x00b18398u };
enum { ISAAC_LUA_ENGINE_899A040_SETMETATABLE_INDEX_U32 = 0xfffffffeu };
enum { ISAAC_LUA_ENGINE_899A040_RETURN_VALUE = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899A040_VA = 0x0089a040u };
enum { ISAAC_LUA_ENGINE_899A040_END_VA = 0x0089a0d9u };
enum { ISAAC_LUA_ENGINE_899A040_NEXT_VA = 0x0089a0e0u };
enum { ISAAC_LUA_ENGINE_899A040_CHECKGET_DEF_ARG = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899A040_CAST_DST_TYPE_VA = 0x00c5d8ccu };
enum { ISAAC_LUA_ENGINE_899A040_METATABLE_RAWGETP_KEY = 0x00c829efu };
int32_t isaac_lua_engine_899a040_type1_gate_taken(uint32_t type_result);
uint32_t isaac_lua_engine_899a040_host_va(void);
uint32_t isaac_lua_engine_899a040_end_va(void);
uint32_t isaac_lua_engine_899a040_next_va(void);
uint32_t isaac_lua_engine_899a040_stack_args(void);
uint32_t isaac_lua_engine_899a040_ecx_arg(void);
uint32_t isaac_lua_engine_899a040_callee_pops_stack_args(void);
uint32_t isaac_lua_engine_899a040_aligned_prologue(void);
uint32_t isaac_lua_engine_899a040_iat_lua_type(void);
uint32_t isaac_lua_engine_899a040_gate_inverted_encoding(void);
uint32_t isaac_lua_engine_899a040_checkget_key(void);
uint32_t isaac_lua_engine_899a040_checkget_index(void);
uint32_t isaac_lua_engine_899a040_checkget_def_arg(void);
uint32_t isaac_lua_engine_899a040_checkget_field_off(void);
uint32_t isaac_lua_engine_899a040_checkget_helper_va(void);
uint32_t isaac_lua_engine_899a040_cast_helper_va(void);
uint32_t isaac_lua_engine_899a040_cast_vf_delta(void);
uint32_t isaac_lua_engine_899a040_cast_src_type_va(void);
uint32_t isaac_lua_engine_899a040_cast_dst_type_va(void);
uint32_t isaac_lua_engine_899a040_cast_is_reference(void);
uint32_t isaac_lua_engine_899a040_iat_lua_pushnil(void);
uint32_t isaac_lua_engine_899a040_newuserdata_size(void);
uint32_t isaac_lua_engine_899a040_ud_vtable_va(void);
uint32_t isaac_lua_engine_899a040_ud_ptr_field_off(void);
uint32_t isaac_lua_engine_899a040_registry_index(void);
uint32_t isaac_lua_engine_899a040_metatable_rawgetp_key(void);
uint32_t isaac_lua_engine_899a040_iat_lua_rawgetp(void);
uint32_t isaac_lua_engine_899a040_iat_lua_setmetatable(void);
uint32_t isaac_lua_engine_899a040_setmetatable_index(void);
uint32_t isaac_lua_engine_899a040_return_value(void);

enum { ISAAC_LUA_ENGINE_899A0E0_STACK_ARGS = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899A0E0_ECX_ARG = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899A0E0_CALLEE_POPS_STACK_ARGS = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899A0E0_ALIGNED_PROLOGUE = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899A0E0_GATE_INVERTED_ENCODING = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899A0E0_IAT_LUA_TYPE = 0x00b18400u };
enum { ISAAC_LUA_ENGINE_899A0E0_CHECKGET_KEY = 0x00c82a1eu };
enum { ISAAC_LUA_ENGINE_899A0E0_CHECKGET_INDEX = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899A0E0_CHECKGET_FIELD_OFF = 0x00000004u };
enum { ISAAC_LUA_ENGINE_899A0E0_CHECKGET_HELPER_VA = 0x0085c590u };
enum { ISAAC_LUA_ENGINE_899A0E0_CAST_HELPER_VA = 0x00af08b1u };
enum { ISAAC_LUA_ENGINE_899A0E0_CAST_VF_DELTA = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899A0E0_CAST_SRC_TYPE_VA = 0x00c5d7a4u };
enum { ISAAC_LUA_ENGINE_899A0E0_CAST_IS_REFERENCE = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899A0E0_IAT_LUA_PUSHNIL = 0x00b183e0u };
enum { ISAAC_LUA_ENGINE_899A0E0_NEWUSERDATA_SIZE = 0x00000008u };
enum { ISAAC_LUA_ENGINE_899A0E0_UD_VTABLE_VA = 0x00b753c8u };
enum { ISAAC_LUA_ENGINE_899A0E0_UD_PTR_FIELD_OFF = 0x00000004u };
enum { ISAAC_LUA_ENGINE_899A0E0_REGISTRY_INDEX_U32 = 0xfff0b9d8u };
enum { ISAAC_LUA_ENGINE_899A0E0_IAT_LUA_RAWGETP = 0x00b183bcu };
enum { ISAAC_LUA_ENGINE_899A0E0_IAT_LUA_SETMETATABLE = 0x00b18398u };
enum { ISAAC_LUA_ENGINE_899A0E0_SETMETATABLE_INDEX_U32 = 0xfffffffeu };
enum { ISAAC_LUA_ENGINE_899A0E0_RETURN_VALUE = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899A0E0_VA = 0x0089a0e0u };
enum { ISAAC_LUA_ENGINE_899A0E0_END_VA = 0x0089a179u };
enum { ISAAC_LUA_ENGINE_899A0E0_NEXT_VA = 0x0089a180u };
enum { ISAAC_LUA_ENGINE_899A0E0_CHECKGET_DEF_ARG = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899A0E0_CAST_DST_TYPE_VA = 0x00c5d770u };
enum { ISAAC_LUA_ENGINE_899A0E0_METATABLE_RAWGETP_KEY = 0x00c829e8u };
int32_t isaac_lua_engine_899a0e0_type1_gate_taken(uint32_t type_result);
uint32_t isaac_lua_engine_899a0e0_host_va(void);
uint32_t isaac_lua_engine_899a0e0_end_va(void);
uint32_t isaac_lua_engine_899a0e0_next_va(void);
uint32_t isaac_lua_engine_899a0e0_stack_args(void);
uint32_t isaac_lua_engine_899a0e0_ecx_arg(void);
uint32_t isaac_lua_engine_899a0e0_callee_pops_stack_args(void);
uint32_t isaac_lua_engine_899a0e0_aligned_prologue(void);
uint32_t isaac_lua_engine_899a0e0_iat_lua_type(void);
uint32_t isaac_lua_engine_899a0e0_gate_inverted_encoding(void);
uint32_t isaac_lua_engine_899a0e0_checkget_key(void);
uint32_t isaac_lua_engine_899a0e0_checkget_index(void);
uint32_t isaac_lua_engine_899a0e0_checkget_def_arg(void);
uint32_t isaac_lua_engine_899a0e0_checkget_field_off(void);
uint32_t isaac_lua_engine_899a0e0_checkget_helper_va(void);
uint32_t isaac_lua_engine_899a0e0_cast_helper_va(void);
uint32_t isaac_lua_engine_899a0e0_cast_vf_delta(void);
uint32_t isaac_lua_engine_899a0e0_cast_src_type_va(void);
uint32_t isaac_lua_engine_899a0e0_cast_dst_type_va(void);
uint32_t isaac_lua_engine_899a0e0_cast_is_reference(void);
uint32_t isaac_lua_engine_899a0e0_iat_lua_pushnil(void);
uint32_t isaac_lua_engine_899a0e0_newuserdata_size(void);
uint32_t isaac_lua_engine_899a0e0_ud_vtable_va(void);
uint32_t isaac_lua_engine_899a0e0_ud_ptr_field_off(void);
uint32_t isaac_lua_engine_899a0e0_registry_index(void);
uint32_t isaac_lua_engine_899a0e0_metatable_rawgetp_key(void);
uint32_t isaac_lua_engine_899a0e0_iat_lua_rawgetp(void);
uint32_t isaac_lua_engine_899a0e0_iat_lua_setmetatable(void);
uint32_t isaac_lua_engine_899a0e0_setmetatable_index(void);
uint32_t isaac_lua_engine_899a0e0_return_value(void);
enum { ISAAC_LUA_ENGINE_899A180_STACK_ARGS = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899A180_ECX_ARG = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899A180_CALLEE_POPS_STACK_ARGS = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899A180_ALIGNED_PROLOGUE = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899A180_GATE_INVERTED_ENCODING = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899A180_IAT_LUA_TYPE = 0x00b18400u };
enum { ISAAC_LUA_ENGINE_899A180_CHECKGET_KEY = 0x00c82a1eu };
enum { ISAAC_LUA_ENGINE_899A180_CHECKGET_INDEX = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899A180_CHECKGET_FIELD_OFF = 0x00000004u };
enum { ISAAC_LUA_ENGINE_899A180_CHECKGET_HELPER_VA = 0x0085c590u };
enum { ISAAC_LUA_ENGINE_899A180_CAST_HELPER_VA = 0x00af08b1u };
enum { ISAAC_LUA_ENGINE_899A180_CAST_VF_DELTA = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899A180_CAST_SRC_TYPE_VA = 0x00c5d7a4u };
enum { ISAAC_LUA_ENGINE_899A180_CAST_IS_REFERENCE = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899A180_IAT_LUA_PUSHNIL = 0x00b183e0u };
enum { ISAAC_LUA_ENGINE_899A180_NEWUSERDATA_SIZE = 0x00000008u };
enum { ISAAC_LUA_ENGINE_899A180_UD_VTABLE_VA = 0x00b753c8u };
enum { ISAAC_LUA_ENGINE_899A180_UD_PTR_FIELD_OFF = 0x00000004u };
enum { ISAAC_LUA_ENGINE_899A180_REGISTRY_INDEX_U32 = 0xfff0b9d8u };
enum { ISAAC_LUA_ENGINE_899A180_IAT_LUA_RAWGETP = 0x00b183bcu };
enum { ISAAC_LUA_ENGINE_899A180_IAT_LUA_SETMETATABLE = 0x00b18398u };
enum { ISAAC_LUA_ENGINE_899A180_SETMETATABLE_INDEX_U32 = 0xfffffffeu };
enum { ISAAC_LUA_ENGINE_899A180_RETURN_VALUE = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899A180_VA = 0x0089a180u };
enum { ISAAC_LUA_ENGINE_899A180_END_VA = 0x0089a219u };
enum { ISAAC_LUA_ENGINE_899A180_NEXT_VA = 0x0089a220u };
enum { ISAAC_LUA_ENGINE_899A180_CHECKGET_DEF_ARG = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899A180_CAST_DST_TYPE_VA = 0x00c5d770u };
enum { ISAAC_LUA_ENGINE_899A180_METATABLE_RAWGETP_KEY = 0x00c829e9u };
int32_t isaac_lua_engine_899a180_type1_gate_taken(uint32_t type_result);
uint32_t isaac_lua_engine_899a180_host_va(void);
uint32_t isaac_lua_engine_899a180_end_va(void);
uint32_t isaac_lua_engine_899a180_next_va(void);
uint32_t isaac_lua_engine_899a180_stack_args(void);
uint32_t isaac_lua_engine_899a180_ecx_arg(void);
uint32_t isaac_lua_engine_899a180_callee_pops_stack_args(void);
uint32_t isaac_lua_engine_899a180_aligned_prologue(void);
uint32_t isaac_lua_engine_899a180_iat_lua_type(void);
uint32_t isaac_lua_engine_899a180_gate_inverted_encoding(void);
uint32_t isaac_lua_engine_899a180_checkget_key(void);
uint32_t isaac_lua_engine_899a180_checkget_index(void);
uint32_t isaac_lua_engine_899a180_checkget_def_arg(void);
uint32_t isaac_lua_engine_899a180_checkget_field_off(void);
uint32_t isaac_lua_engine_899a180_checkget_helper_va(void);
uint32_t isaac_lua_engine_899a180_cast_helper_va(void);
uint32_t isaac_lua_engine_899a180_cast_vf_delta(void);
uint32_t isaac_lua_engine_899a180_cast_src_type_va(void);
uint32_t isaac_lua_engine_899a180_cast_dst_type_va(void);
uint32_t isaac_lua_engine_899a180_cast_is_reference(void);
uint32_t isaac_lua_engine_899a180_iat_lua_pushnil(void);
uint32_t isaac_lua_engine_899a180_newuserdata_size(void);
uint32_t isaac_lua_engine_899a180_ud_vtable_va(void);
uint32_t isaac_lua_engine_899a180_ud_ptr_field_off(void);
uint32_t isaac_lua_engine_899a180_registry_index(void);
uint32_t isaac_lua_engine_899a180_metatable_rawgetp_key(void);
uint32_t isaac_lua_engine_899a180_iat_lua_rawgetp(void);
uint32_t isaac_lua_engine_899a180_iat_lua_setmetatable(void);
uint32_t isaac_lua_engine_899a180_setmetatable_index(void);
uint32_t isaac_lua_engine_899a180_return_value(void);

enum { ISAAC_LUA_ENGINE_899A220_STACK_ARGS = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899A220_ECX_ARG = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899A220_CALLEE_POPS_STACK_ARGS = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899A220_ALIGNED_PROLOGUE = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899A220_GATE_INVERTED_ENCODING = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899A220_IAT_LUA_TYPE = 0x00b18400u };
enum { ISAAC_LUA_ENGINE_899A220_CHECKGET_KEY = 0x00c82a1eu };
enum { ISAAC_LUA_ENGINE_899A220_CHECKGET_INDEX = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899A220_CHECKGET_FIELD_OFF = 0x00000004u };
enum { ISAAC_LUA_ENGINE_899A220_CHECKGET_HELPER_VA = 0x0085c590u };
enum { ISAAC_LUA_ENGINE_899A220_CAST_HELPER_VA = 0x00af08b1u };
enum { ISAAC_LUA_ENGINE_899A220_CAST_VF_DELTA = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899A220_CAST_SRC_TYPE_VA = 0x00c5d7a4u };
enum { ISAAC_LUA_ENGINE_899A220_CAST_IS_REFERENCE = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899A220_IAT_LUA_PUSHNIL = 0x00b183e0u };
enum { ISAAC_LUA_ENGINE_899A220_NEWUSERDATA_SIZE = 0x00000008u };
enum { ISAAC_LUA_ENGINE_899A220_UD_VTABLE_VA = 0x00b753c8u };
enum { ISAAC_LUA_ENGINE_899A220_UD_PTR_FIELD_OFF = 0x00000004u };
enum { ISAAC_LUA_ENGINE_899A220_REGISTRY_INDEX_U32 = 0xfff0b9d8u };
enum { ISAAC_LUA_ENGINE_899A220_IAT_LUA_RAWGETP = 0x00b183bcu };
enum { ISAAC_LUA_ENGINE_899A220_IAT_LUA_SETMETATABLE = 0x00b18398u };
enum { ISAAC_LUA_ENGINE_899A220_SETMETATABLE_INDEX_U32 = 0xfffffffeu };
enum { ISAAC_LUA_ENGINE_899A220_RETURN_VALUE = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899A220_VA = 0x0089a220u };
enum { ISAAC_LUA_ENGINE_899A220_END_VA = 0x0089a2b9u };
enum { ISAAC_LUA_ENGINE_899A220_NEXT_VA = 0x0089a2c0u };
enum { ISAAC_LUA_ENGINE_899A220_CHECKGET_DEF_ARG = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899A220_CAST_DST_TYPE_VA = 0x00c5e8b8u };
enum { ISAAC_LUA_ENGINE_899A220_METATABLE_RAWGETP_KEY = 0x00c829ebu };
int32_t isaac_lua_engine_899a220_type1_gate_taken(uint32_t type_result);
uint32_t isaac_lua_engine_899a220_host_va(void);
uint32_t isaac_lua_engine_899a220_end_va(void);
uint32_t isaac_lua_engine_899a220_next_va(void);
uint32_t isaac_lua_engine_899a220_stack_args(void);
uint32_t isaac_lua_engine_899a220_ecx_arg(void);
uint32_t isaac_lua_engine_899a220_callee_pops_stack_args(void);
uint32_t isaac_lua_engine_899a220_aligned_prologue(void);
uint32_t isaac_lua_engine_899a220_iat_lua_type(void);
uint32_t isaac_lua_engine_899a220_gate_inverted_encoding(void);
uint32_t isaac_lua_engine_899a220_checkget_key(void);
uint32_t isaac_lua_engine_899a220_checkget_index(void);
uint32_t isaac_lua_engine_899a220_checkget_def_arg(void);
uint32_t isaac_lua_engine_899a220_checkget_field_off(void);
uint32_t isaac_lua_engine_899a220_checkget_helper_va(void);
uint32_t isaac_lua_engine_899a220_cast_helper_va(void);
uint32_t isaac_lua_engine_899a220_cast_vf_delta(void);
uint32_t isaac_lua_engine_899a220_cast_src_type_va(void);
uint32_t isaac_lua_engine_899a220_cast_dst_type_va(void);
uint32_t isaac_lua_engine_899a220_cast_is_reference(void);
uint32_t isaac_lua_engine_899a220_iat_lua_pushnil(void);
uint32_t isaac_lua_engine_899a220_newuserdata_size(void);
uint32_t isaac_lua_engine_899a220_ud_vtable_va(void);
uint32_t isaac_lua_engine_899a220_ud_ptr_field_off(void);
uint32_t isaac_lua_engine_899a220_registry_index(void);
uint32_t isaac_lua_engine_899a220_metatable_rawgetp_key(void);
uint32_t isaac_lua_engine_899a220_iat_lua_rawgetp(void);
uint32_t isaac_lua_engine_899a220_iat_lua_setmetatable(void);
uint32_t isaac_lua_engine_899a220_setmetatable_index(void);
uint32_t isaac_lua_engine_899a220_return_value(void);
enum { ISAAC_LUA_ENGINE_899A2C0_STACK_ARGS = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899A2C0_ECX_ARG = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899A2C0_CALLEE_POPS_STACK_ARGS = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899A2C0_ALIGNED_PROLOGUE = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899A2C0_GATE_INVERTED_ENCODING = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899A2C0_IAT_LUA_TYPE = 0x00b18400u };
enum { ISAAC_LUA_ENGINE_899A2C0_CHECKGET_KEY = 0x00c82a1eu };
enum { ISAAC_LUA_ENGINE_899A2C0_CHECKGET_INDEX = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899A2C0_CHECKGET_FIELD_OFF = 0x00000004u };
enum { ISAAC_LUA_ENGINE_899A2C0_CHECKGET_HELPER_VA = 0x0085c590u };
enum { ISAAC_LUA_ENGINE_899A2C0_CAST_HELPER_VA = 0x00af08b1u };
enum { ISAAC_LUA_ENGINE_899A2C0_CAST_VF_DELTA = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899A2C0_CAST_SRC_TYPE_VA = 0x00c5d7a4u };
enum { ISAAC_LUA_ENGINE_899A2C0_CAST_IS_REFERENCE = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899A2C0_IAT_LUA_PUSHNIL = 0x00b183e0u };
enum { ISAAC_LUA_ENGINE_899A2C0_NEWUSERDATA_SIZE = 0x00000008u };
enum { ISAAC_LUA_ENGINE_899A2C0_UD_VTABLE_VA = 0x00b753c8u };
enum { ISAAC_LUA_ENGINE_899A2C0_UD_PTR_FIELD_OFF = 0x00000004u };
enum { ISAAC_LUA_ENGINE_899A2C0_REGISTRY_INDEX_U32 = 0xfff0b9d8u };
enum { ISAAC_LUA_ENGINE_899A2C0_IAT_LUA_RAWGETP = 0x00b183bcu };
enum { ISAAC_LUA_ENGINE_899A2C0_IAT_LUA_SETMETATABLE = 0x00b18398u };
enum { ISAAC_LUA_ENGINE_899A2C0_SETMETATABLE_INDEX_U32 = 0xfffffffeu };
enum { ISAAC_LUA_ENGINE_899A2C0_RETURN_VALUE = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899A2C0_VA = 0x0089a2c0u };
enum { ISAAC_LUA_ENGINE_899A2C0_END_VA = 0x0089a359u };
enum { ISAAC_LUA_ENGINE_899A2C0_NEXT_VA = 0x0089a360u };
enum { ISAAC_LUA_ENGINE_899A2C0_CHECKGET_DEF_ARG = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899A2C0_CAST_DST_TYPE_VA = 0x00c5e8b8u };
enum { ISAAC_LUA_ENGINE_899A2C0_METATABLE_RAWGETP_KEY = 0x00c829ecu };
int32_t isaac_lua_engine_899a2c0_type1_gate_taken(uint32_t type_result);
uint32_t isaac_lua_engine_899a2c0_host_va(void);
uint32_t isaac_lua_engine_899a2c0_end_va(void);
uint32_t isaac_lua_engine_899a2c0_next_va(void);
uint32_t isaac_lua_engine_899a2c0_stack_args(void);
uint32_t isaac_lua_engine_899a2c0_ecx_arg(void);
uint32_t isaac_lua_engine_899a2c0_callee_pops_stack_args(void);
uint32_t isaac_lua_engine_899a2c0_aligned_prologue(void);
uint32_t isaac_lua_engine_899a2c0_iat_lua_type(void);
uint32_t isaac_lua_engine_899a2c0_gate_inverted_encoding(void);
uint32_t isaac_lua_engine_899a2c0_checkget_key(void);
uint32_t isaac_lua_engine_899a2c0_checkget_index(void);
uint32_t isaac_lua_engine_899a2c0_checkget_def_arg(void);
uint32_t isaac_lua_engine_899a2c0_checkget_field_off(void);
uint32_t isaac_lua_engine_899a2c0_checkget_helper_va(void);
uint32_t isaac_lua_engine_899a2c0_cast_helper_va(void);
uint32_t isaac_lua_engine_899a2c0_cast_vf_delta(void);
uint32_t isaac_lua_engine_899a2c0_cast_src_type_va(void);
uint32_t isaac_lua_engine_899a2c0_cast_dst_type_va(void);
uint32_t isaac_lua_engine_899a2c0_cast_is_reference(void);
uint32_t isaac_lua_engine_899a2c0_iat_lua_pushnil(void);
uint32_t isaac_lua_engine_899a2c0_newuserdata_size(void);
uint32_t isaac_lua_engine_899a2c0_ud_vtable_va(void);
uint32_t isaac_lua_engine_899a2c0_ud_ptr_field_off(void);
uint32_t isaac_lua_engine_899a2c0_registry_index(void);
uint32_t isaac_lua_engine_899a2c0_metatable_rawgetp_key(void);
uint32_t isaac_lua_engine_899a2c0_iat_lua_rawgetp(void);
uint32_t isaac_lua_engine_899a2c0_iat_lua_setmetatable(void);
uint32_t isaac_lua_engine_899a2c0_setmetatable_index(void);
uint32_t isaac_lua_engine_899a2c0_return_value(void);

enum { ISAAC_LUA_ENGINE_899A360_STACK_ARGS = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899A360_ECX_ARG = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899A360_CALLEE_POPS_STACK_ARGS = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899A360_ALIGNED_PROLOGUE = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899A360_GATE_INVERTED_ENCODING = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899A360_IAT_LUA_TYPE = 0x00b18400u };
enum { ISAAC_LUA_ENGINE_899A360_CHECKGET_KEY = 0x00c82a1eu };
enum { ISAAC_LUA_ENGINE_899A360_CHECKGET_INDEX = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899A360_CHECKGET_FIELD_OFF = 0x00000004u };
enum { ISAAC_LUA_ENGINE_899A360_CHECKGET_HELPER_VA = 0x0085c590u };
enum { ISAAC_LUA_ENGINE_899A360_CAST_HELPER_VA = 0x00af08b1u };
enum { ISAAC_LUA_ENGINE_899A360_CAST_VF_DELTA = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899A360_CAST_SRC_TYPE_VA = 0x00c5d7a4u };
enum { ISAAC_LUA_ENGINE_899A360_CAST_IS_REFERENCE = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899A360_IAT_LUA_PUSHNIL = 0x00b183e0u };
enum { ISAAC_LUA_ENGINE_899A360_NEWUSERDATA_SIZE = 0x00000008u };
enum { ISAAC_LUA_ENGINE_899A360_UD_VTABLE_VA = 0x00b753c8u };
enum { ISAAC_LUA_ENGINE_899A360_UD_PTR_FIELD_OFF = 0x00000004u };
enum { ISAAC_LUA_ENGINE_899A360_REGISTRY_INDEX_U32 = 0xfff0b9d8u };
enum { ISAAC_LUA_ENGINE_899A360_IAT_LUA_RAWGETP = 0x00b183bcu };
enum { ISAAC_LUA_ENGINE_899A360_IAT_LUA_SETMETATABLE = 0x00b18398u };
enum { ISAAC_LUA_ENGINE_899A360_SETMETATABLE_INDEX_U32 = 0xfffffffeu };
enum { ISAAC_LUA_ENGINE_899A360_RETURN_VALUE = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899A360_VA = 0x0089a360u };
enum { ISAAC_LUA_ENGINE_899A360_END_VA = 0x0089a3f9u };
enum { ISAAC_LUA_ENGINE_899A360_NEXT_VA = 0x0089a400u };
enum { ISAAC_LUA_ENGINE_899A360_CHECKGET_DEF_ARG = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899A360_CAST_DST_TYPE_VA = 0x00c5d964u };
enum { ISAAC_LUA_ENGINE_899A360_METATABLE_RAWGETP_KEY = 0x00c829e5u };
int32_t isaac_lua_engine_899a360_type1_gate_taken(uint32_t type_result);
uint32_t isaac_lua_engine_899a360_host_va(void);
uint32_t isaac_lua_engine_899a360_end_va(void);
uint32_t isaac_lua_engine_899a360_next_va(void);
uint32_t isaac_lua_engine_899a360_stack_args(void);
uint32_t isaac_lua_engine_899a360_ecx_arg(void);
uint32_t isaac_lua_engine_899a360_callee_pops_stack_args(void);
uint32_t isaac_lua_engine_899a360_aligned_prologue(void);
uint32_t isaac_lua_engine_899a360_iat_lua_type(void);
uint32_t isaac_lua_engine_899a360_gate_inverted_encoding(void);
uint32_t isaac_lua_engine_899a360_checkget_key(void);
uint32_t isaac_lua_engine_899a360_checkget_index(void);
uint32_t isaac_lua_engine_899a360_checkget_def_arg(void);
uint32_t isaac_lua_engine_899a360_checkget_field_off(void);
uint32_t isaac_lua_engine_899a360_checkget_helper_va(void);
uint32_t isaac_lua_engine_899a360_cast_helper_va(void);
uint32_t isaac_lua_engine_899a360_cast_vf_delta(void);
uint32_t isaac_lua_engine_899a360_cast_src_type_va(void);
uint32_t isaac_lua_engine_899a360_cast_dst_type_va(void);
uint32_t isaac_lua_engine_899a360_cast_is_reference(void);
uint32_t isaac_lua_engine_899a360_iat_lua_pushnil(void);
uint32_t isaac_lua_engine_899a360_newuserdata_size(void);
uint32_t isaac_lua_engine_899a360_ud_vtable_va(void);
uint32_t isaac_lua_engine_899a360_ud_ptr_field_off(void);
uint32_t isaac_lua_engine_899a360_registry_index(void);
uint32_t isaac_lua_engine_899a360_metatable_rawgetp_key(void);
uint32_t isaac_lua_engine_899a360_iat_lua_rawgetp(void);
uint32_t isaac_lua_engine_899a360_iat_lua_setmetatable(void);
uint32_t isaac_lua_engine_899a360_setmetatable_index(void);
uint32_t isaac_lua_engine_899a360_return_value(void);
enum { ISAAC_LUA_ENGINE_899A400_STACK_ARGS = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899A400_ECX_ARG = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899A400_CALLEE_POPS_STACK_ARGS = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899A400_ALIGNED_PROLOGUE = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899A400_GATE_INVERTED_ENCODING = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899A400_IAT_LUA_TYPE = 0x00b18400u };
enum { ISAAC_LUA_ENGINE_899A400_CHECKGET_KEY = 0x00c82a1eu };
enum { ISAAC_LUA_ENGINE_899A400_CHECKGET_INDEX = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899A400_CHECKGET_FIELD_OFF = 0x00000004u };
enum { ISAAC_LUA_ENGINE_899A400_CHECKGET_HELPER_VA = 0x0085c590u };
enum { ISAAC_LUA_ENGINE_899A400_CAST_HELPER_VA = 0x00af08b1u };
enum { ISAAC_LUA_ENGINE_899A400_CAST_VF_DELTA = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899A400_CAST_SRC_TYPE_VA = 0x00c5d7a4u };
enum { ISAAC_LUA_ENGINE_899A400_CAST_IS_REFERENCE = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899A400_IAT_LUA_PUSHNIL = 0x00b183e0u };
enum { ISAAC_LUA_ENGINE_899A400_NEWUSERDATA_SIZE = 0x00000008u };
enum { ISAAC_LUA_ENGINE_899A400_UD_VTABLE_VA = 0x00b753c8u };
enum { ISAAC_LUA_ENGINE_899A400_UD_PTR_FIELD_OFF = 0x00000004u };
enum { ISAAC_LUA_ENGINE_899A400_REGISTRY_INDEX_U32 = 0xfff0b9d8u };
enum { ISAAC_LUA_ENGINE_899A400_IAT_LUA_RAWGETP = 0x00b183bcu };
enum { ISAAC_LUA_ENGINE_899A400_IAT_LUA_SETMETATABLE = 0x00b18398u };
enum { ISAAC_LUA_ENGINE_899A400_SETMETATABLE_INDEX_U32 = 0xfffffffeu };
enum { ISAAC_LUA_ENGINE_899A400_RETURN_VALUE = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899A400_VA = 0x0089a400u };
enum { ISAAC_LUA_ENGINE_899A400_END_VA = 0x0089a499u };
enum { ISAAC_LUA_ENGINE_899A400_NEXT_VA = 0x0089a4a0u };
enum { ISAAC_LUA_ENGINE_899A400_CHECKGET_DEF_ARG = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899A400_CAST_DST_TYPE_VA = 0x00c5d964u };
enum { ISAAC_LUA_ENGINE_899A400_METATABLE_RAWGETP_KEY = 0x00c829e6u };
int32_t isaac_lua_engine_899a400_type1_gate_taken(uint32_t type_result);
uint32_t isaac_lua_engine_899a400_host_va(void);
uint32_t isaac_lua_engine_899a400_end_va(void);
uint32_t isaac_lua_engine_899a400_next_va(void);
uint32_t isaac_lua_engine_899a400_stack_args(void);
uint32_t isaac_lua_engine_899a400_ecx_arg(void);
uint32_t isaac_lua_engine_899a400_callee_pops_stack_args(void);
uint32_t isaac_lua_engine_899a400_aligned_prologue(void);
uint32_t isaac_lua_engine_899a400_iat_lua_type(void);
uint32_t isaac_lua_engine_899a400_gate_inverted_encoding(void);
uint32_t isaac_lua_engine_899a400_checkget_key(void);
uint32_t isaac_lua_engine_899a400_checkget_index(void);
uint32_t isaac_lua_engine_899a400_checkget_def_arg(void);
uint32_t isaac_lua_engine_899a400_checkget_field_off(void);
uint32_t isaac_lua_engine_899a400_checkget_helper_va(void);
uint32_t isaac_lua_engine_899a400_cast_helper_va(void);
uint32_t isaac_lua_engine_899a400_cast_vf_delta(void);
uint32_t isaac_lua_engine_899a400_cast_src_type_va(void);
uint32_t isaac_lua_engine_899a400_cast_dst_type_va(void);
uint32_t isaac_lua_engine_899a400_cast_is_reference(void);
uint32_t isaac_lua_engine_899a400_iat_lua_pushnil(void);
uint32_t isaac_lua_engine_899a400_newuserdata_size(void);
uint32_t isaac_lua_engine_899a400_ud_vtable_va(void);
uint32_t isaac_lua_engine_899a400_ud_ptr_field_off(void);
uint32_t isaac_lua_engine_899a400_registry_index(void);
uint32_t isaac_lua_engine_899a400_metatable_rawgetp_key(void);
uint32_t isaac_lua_engine_899a400_iat_lua_rawgetp(void);
uint32_t isaac_lua_engine_899a400_iat_lua_setmetatable(void);
uint32_t isaac_lua_engine_899a400_setmetatable_index(void);
uint32_t isaac_lua_engine_899a400_return_value(void);

enum { ISAAC_LUA_ENGINE_899A4A0_VA = 0x0089a4a0u };
enum { ISAAC_LUA_ENGINE_899A4A0_END_VA = 0x0089a50cu };
enum { ISAAC_LUA_ENGINE_899A4A0_NEXT_VA = 0x0089a510u };
enum { ISAAC_LUA_ENGINE_899A4A0_STACK_ARGS = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899A4A0_ECX_ARG = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899A4A0_CALLEE_POPS_STACK_ARGS = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899A4A0_ALIGNED_PROLOGUE = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899A4A0_GATE_INVERTED_ENCODING = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899A4A0_IAT_LUA_TYPE = 0x00b18400u };
enum { ISAAC_LUA_ENGINE_899A4A0_CHECKGET_KEY = 0x00c82a1eu };
enum { ISAAC_LUA_ENGINE_899A4A0_CHECKGET_INDEX = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899A4A0_CHECKGET_DEF_ARG = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899A4A0_CHECKGET_FIELD_OFF = 0x00000004u };
enum { ISAAC_LUA_ENGINE_899A4A0_CHECKGET_HELPER_VA = 0x0085c590u };
enum { ISAAC_LUA_ENGINE_899A4A0_IAT_LUA_TOUSERDATA = 0x00b183b0u };
enum { ISAAC_LUA_ENGINE_899A4A0_TOUSERDATA_INDEX_U32 = 0xfff0b9d7u };
enum { ISAAC_LUA_ENGINE_899A4A0_METHOD_VTABLE_FIELD_OFF = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899A4A0_IAT_LUA_CHECKINTEGER = 0x00b183f4u };
enum { ISAAC_LUA_ENGINE_899A4A0_CHECKINTEGER_INDEX = 0x00000002u };
enum { ISAAC_LUA_ENGINE_899A4A0_METHOD_STACK_ARGS = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899A4A0_RETURN_VALUE = 0x00000000u };
int32_t isaac_lua_engine_899a4a0_type1_gate_taken(uint32_t type_result);
uint32_t isaac_lua_engine_899a4a0_host_va(void);
uint32_t isaac_lua_engine_899a4a0_end_va(void);
uint32_t isaac_lua_engine_899a4a0_next_va(void);
uint32_t isaac_lua_engine_899a4a0_stack_args(void);
uint32_t isaac_lua_engine_899a4a0_ecx_arg(void);
uint32_t isaac_lua_engine_899a4a0_callee_pops_stack_args(void);
uint32_t isaac_lua_engine_899a4a0_aligned_prologue(void);
uint32_t isaac_lua_engine_899a4a0_gate_inverted_encoding(void);
uint32_t isaac_lua_engine_899a4a0_iat_lua_type(void);
uint32_t isaac_lua_engine_899a4a0_checkget_key(void);
uint32_t isaac_lua_engine_899a4a0_checkget_index(void);
uint32_t isaac_lua_engine_899a4a0_checkget_def_arg(void);
uint32_t isaac_lua_engine_899a4a0_checkget_field_off(void);
uint32_t isaac_lua_engine_899a4a0_checkget_helper_va(void);
uint32_t isaac_lua_engine_899a4a0_iat_lua_touserdata(void);
uint32_t isaac_lua_engine_899a4a0_touserdata_index(void);
uint32_t isaac_lua_engine_899a4a0_method_vtable_field_off(void);
uint32_t isaac_lua_engine_899a4a0_iat_lua_checkinteger(void);
uint32_t isaac_lua_engine_899a4a0_checkinteger_index(void);
uint32_t isaac_lua_engine_899a4a0_method_stack_args(void);
uint32_t isaac_lua_engine_899a4a0_return_value(void);
enum { ISAAC_LUA_ENGINE_899A510_VA = 0x0089a510u };
enum { ISAAC_LUA_ENGINE_899A510_END_VA = 0x0089a56cu };
enum { ISAAC_LUA_ENGINE_899A510_NEXT_VA = 0x0089a570u };
enum { ISAAC_LUA_ENGINE_899A510_STACK_ARGS = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899A510_ECX_ARG = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899A510_CALLEE_POPS_STACK_ARGS = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899A510_ALIGNED_PROLOGUE = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899A510_GATE_INVERTED_ENCODING = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899A510_IAT_LUA_TYPE = 0x00b18400u };
enum { ISAAC_LUA_ENGINE_899A510_CHECKGET_KEY = 0x00c82a1eu };
enum { ISAAC_LUA_ENGINE_899A510_CHECKGET_INDEX = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899A510_CHECKGET_DEF_ARG = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899A510_CHECKGET_FIELD_OFF = 0x00000004u };
enum { ISAAC_LUA_ENGINE_899A510_CHECKGET_HELPER_VA = 0x0085c590u };
enum { ISAAC_LUA_ENGINE_899A510_IAT_LUA_TOUSERDATA = 0x00b183b0u };
enum { ISAAC_LUA_ENGINE_899A510_TOUSERDATA_INDEX_U32 = 0xfff0b9d7u };
enum { ISAAC_LUA_ENGINE_899A510_METHOD_VTABLE_FIELD_OFF = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899A510_METHOD_STACK_ARGS = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899A510_RETURN_VALUE = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899A510_PUSHER_HELPER_VA = 0x0085bfd0u };
int32_t isaac_lua_engine_899a510_type1_gate_taken(uint32_t type_result);
uint32_t isaac_lua_engine_899a510_host_va(void);
uint32_t isaac_lua_engine_899a510_end_va(void);
uint32_t isaac_lua_engine_899a510_next_va(void);
uint32_t isaac_lua_engine_899a510_stack_args(void);
uint32_t isaac_lua_engine_899a510_ecx_arg(void);
uint32_t isaac_lua_engine_899a510_callee_pops_stack_args(void);
uint32_t isaac_lua_engine_899a510_aligned_prologue(void);
uint32_t isaac_lua_engine_899a510_gate_inverted_encoding(void);
uint32_t isaac_lua_engine_899a510_iat_lua_type(void);
uint32_t isaac_lua_engine_899a510_checkget_key(void);
uint32_t isaac_lua_engine_899a510_checkget_index(void);
uint32_t isaac_lua_engine_899a510_checkget_def_arg(void);
uint32_t isaac_lua_engine_899a510_checkget_field_off(void);
uint32_t isaac_lua_engine_899a510_checkget_helper_va(void);
uint32_t isaac_lua_engine_899a510_iat_lua_touserdata(void);
uint32_t isaac_lua_engine_899a510_touserdata_index(void);
uint32_t isaac_lua_engine_899a510_method_vtable_field_off(void);
uint32_t isaac_lua_engine_899a510_method_stack_args(void);
uint32_t isaac_lua_engine_899a510_pusher_helper_va(void);
uint32_t isaac_lua_engine_899a510_return_value(void);

enum { ISAAC_LUA_ENGINE_899A570_VA = 0x0089a570u };
enum { ISAAC_LUA_ENGINE_899A570_END_VA = 0x0089a5ccu };
enum { ISAAC_LUA_ENGINE_899A570_NEXT_VA = 0x0089a5d0u };
enum { ISAAC_LUA_ENGINE_899A570_STACK_ARGS = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899A570_ECX_ARG = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899A570_CALLEE_POPS_STACK_ARGS = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899A570_ALIGNED_PROLOGUE = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899A570_GATE_INVERTED_ENCODING = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899A570_IAT_LUA_TYPE = 0x00b18400u };
enum { ISAAC_LUA_ENGINE_899A570_CHECKGET_KEY = 0x00c82a1eu };
enum { ISAAC_LUA_ENGINE_899A570_CHECKGET_INDEX = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899A570_CHECKGET_DEF_ARG = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899A570_CHECKGET_FIELD_OFF = 0x00000004u };
enum { ISAAC_LUA_ENGINE_899A570_CHECKGET_HELPER_VA = 0x0085c590u };
enum { ISAAC_LUA_ENGINE_899A570_IAT_LUA_TOUSERDATA = 0x00b183b0u };
enum { ISAAC_LUA_ENGINE_899A570_TOUSERDATA_INDEX_U32 = 0xfff0b9d7u };
enum { ISAAC_LUA_ENGINE_899A570_METHOD_VTABLE_FIELD_OFF = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899A570_METHOD_STACK_ARGS = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899A570_RETURN_VALUE = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899A570_PUSHER_HELPER_VA = 0x0085bff0u };
int32_t isaac_lua_engine_899a570_type1_gate_taken(uint32_t type_result);
uint32_t isaac_lua_engine_899a570_host_va(void);
uint32_t isaac_lua_engine_899a570_end_va(void);
uint32_t isaac_lua_engine_899a570_next_va(void);
uint32_t isaac_lua_engine_899a570_stack_args(void);
uint32_t isaac_lua_engine_899a570_ecx_arg(void);
uint32_t isaac_lua_engine_899a570_callee_pops_stack_args(void);
uint32_t isaac_lua_engine_899a570_aligned_prologue(void);
uint32_t isaac_lua_engine_899a570_gate_inverted_encoding(void);
uint32_t isaac_lua_engine_899a570_iat_lua_type(void);
uint32_t isaac_lua_engine_899a570_checkget_key(void);
uint32_t isaac_lua_engine_899a570_checkget_index(void);
uint32_t isaac_lua_engine_899a570_checkget_def_arg(void);
uint32_t isaac_lua_engine_899a570_checkget_field_off(void);
uint32_t isaac_lua_engine_899a570_checkget_helper_va(void);
uint32_t isaac_lua_engine_899a570_iat_lua_touserdata(void);
uint32_t isaac_lua_engine_899a570_touserdata_index(void);
uint32_t isaac_lua_engine_899a570_method_vtable_field_off(void);
uint32_t isaac_lua_engine_899a570_method_stack_args(void);
uint32_t isaac_lua_engine_899a570_pusher_helper_va(void);
uint32_t isaac_lua_engine_899a570_return_value(void);
enum { ISAAC_LUA_ENGINE_899A5D0_VA = 0x0089a5d0u };
enum { ISAAC_LUA_ENGINE_899A5D0_END_VA = 0x0089a66eu };
enum { ISAAC_LUA_ENGINE_899A5D0_NEXT_VA = 0x0089a670u };
enum { ISAAC_LUA_ENGINE_899A5D0_STACK_ARGS = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899A5D0_ECX_ARG = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899A5D0_CALLEE_POPS_STACK_ARGS = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899A5D0_ALIGNED_PROLOGUE = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899A5D0_GATE_INVERTED_ENCODING = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899A5D0_IAT_LUA_TYPE = 0x00b18400u };
enum { ISAAC_LUA_ENGINE_899A5D0_CHECKGET_KEY = 0x00c82a1eu };
enum { ISAAC_LUA_ENGINE_899A5D0_CHECKGET_INDEX = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899A5D0_CHECKGET_DEF_ARG = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899A5D0_CHECKGET_FIELD_OFF = 0x00000004u };
enum { ISAAC_LUA_ENGINE_899A5D0_CHECKGET_HELPER_VA = 0x0085c590u };
enum { ISAAC_LUA_ENGINE_899A5D0_IAT_LUA_TOUSERDATA = 0x00b183b0u };
enum { ISAAC_LUA_ENGINE_899A5D0_TOUSERDATA_INDEX_U32 = 0xfff0b9d7u };
enum { ISAAC_LUA_ENGINE_899A5D0_METHOD_VTABLE_FIELD_OFF = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899A5D0_METHOD_STACK_ARGS = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899A5D0_RETURN_VALUE = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899A5D0_NEWUSERDATA_SIZE = 0x00000010u };
enum { ISAAC_LUA_ENGINE_899A5D0_UD_VTABLE_VA = 0x00b73574u };
enum { ISAAC_LUA_ENGINE_899A5D0_UD_PAYLOAD_PTR_OFF = 0x00000004u };
enum { ISAAC_LUA_ENGINE_899A5D0_UD_PAYLOAD_OFF = 0x00000008u };
enum { ISAAC_LUA_ENGINE_899A5D0_REGISTRY_INDEX_U32 = 0xfff0b9d8u };
enum { ISAAC_LUA_ENGINE_899A5D0_METATABLE_RAWGETP_KEY = 0x00c82980u };
int32_t isaac_lua_engine_899a5d0_type1_gate_taken(uint32_t type_result);
uint32_t isaac_lua_engine_899a5d0_host_va(void);
uint32_t isaac_lua_engine_899a5d0_end_va(void);
uint32_t isaac_lua_engine_899a5d0_next_va(void);
uint32_t isaac_lua_engine_899a5d0_stack_args(void);
uint32_t isaac_lua_engine_899a5d0_ecx_arg(void);
uint32_t isaac_lua_engine_899a5d0_callee_pops_stack_args(void);
uint32_t isaac_lua_engine_899a5d0_aligned_prologue(void);
uint32_t isaac_lua_engine_899a5d0_gate_inverted_encoding(void);
uint32_t isaac_lua_engine_899a5d0_iat_lua_type(void);
uint32_t isaac_lua_engine_899a5d0_checkget_key(void);
uint32_t isaac_lua_engine_899a5d0_checkget_index(void);
uint32_t isaac_lua_engine_899a5d0_checkget_def_arg(void);
uint32_t isaac_lua_engine_899a5d0_checkget_field_off(void);
uint32_t isaac_lua_engine_899a5d0_checkget_helper_va(void);
uint32_t isaac_lua_engine_899a5d0_iat_lua_touserdata(void);
uint32_t isaac_lua_engine_899a5d0_touserdata_index(void);
uint32_t isaac_lua_engine_899a5d0_method_vtable_field_off(void);
uint32_t isaac_lua_engine_899a5d0_method_stack_args(void);
uint32_t isaac_lua_engine_899a5d0_newuserdata_size(void);
uint32_t isaac_lua_engine_899a5d0_ud_vtable_va(void);
uint32_t isaac_lua_engine_899a5d0_ud_payload_ptr_off(void);
uint32_t isaac_lua_engine_899a5d0_ud_payload_off(void);
uint32_t isaac_lua_engine_899a5d0_registry_index(void);
uint32_t isaac_lua_engine_899a5d0_metatable_rawgetp_key(void);
uint32_t isaac_lua_engine_899a5d0_return_value(void);

enum { ISAAC_LUA_ENGINE_899A670_VA = 0x0089a670u };
enum { ISAAC_LUA_ENGINE_899A670_END_VA = 0x0089a6f2u };
enum { ISAAC_LUA_ENGINE_899A670_NEXT_VA = 0x0089a700u };
enum { ISAAC_LUA_ENGINE_899A670_STACK_ARGS = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899A670_ECX_ARG = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899A670_CALLEE_POPS_STACK_ARGS = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899A670_ALIGNED_PROLOGUE = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899A670_GATE_INVERTED_ENCODING = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899A670_IAT_LUA_TYPE = 0x00b18400u };
enum { ISAAC_LUA_ENGINE_899A670_CHECKGET_KEY = 0x00c82a1eu };
enum { ISAAC_LUA_ENGINE_899A670_CHECKGET_INDEX = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899A670_CHECKGET_DEF_ARG = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899A670_CHECKGET_FIELD_OFF = 0x00000004u };
enum { ISAAC_LUA_ENGINE_899A670_CHECKGET_HELPER_VA = 0x0085c590u };
enum { ISAAC_LUA_ENGINE_899A670_IAT_LUA_TOUSERDATA = 0x00b183b0u };
enum { ISAAC_LUA_ENGINE_899A670_TOUSERDATA_INDEX_U32 = 0xfff0b9d7u };
enum { ISAAC_LUA_ENGINE_899A670_METHOD_VTABLE_FIELD_OFF = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899A670_METHOD_STACK_ARGS = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899A670_RETURN_VALUE = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899A670_FLOAT_LANE = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899A670_IAT_LUA_CHECKNUMBER = 0x00b18324u };
enum { ISAAC_LUA_ENGINE_899A670_CHECKNUMBER_INDEX = 0x00000002u };
int32_t isaac_lua_engine_899a670_type1_gate_taken(uint32_t type_result);
uint32_t isaac_lua_engine_899a670_host_va(void);
uint32_t isaac_lua_engine_899a670_end_va(void);
uint32_t isaac_lua_engine_899a670_next_va(void);
uint32_t isaac_lua_engine_899a670_stack_args(void);
uint32_t isaac_lua_engine_899a670_ecx_arg(void);
uint32_t isaac_lua_engine_899a670_callee_pops_stack_args(void);
uint32_t isaac_lua_engine_899a670_aligned_prologue(void);
uint32_t isaac_lua_engine_899a670_gate_inverted_encoding(void);
uint32_t isaac_lua_engine_899a670_iat_lua_type(void);
uint32_t isaac_lua_engine_899a670_checkget_key(void);
uint32_t isaac_lua_engine_899a670_checkget_index(void);
uint32_t isaac_lua_engine_899a670_checkget_def_arg(void);
uint32_t isaac_lua_engine_899a670_checkget_field_off(void);
uint32_t isaac_lua_engine_899a670_checkget_helper_va(void);
uint32_t isaac_lua_engine_899a670_iat_lua_touserdata(void);
uint32_t isaac_lua_engine_899a670_touserdata_index(void);
uint32_t isaac_lua_engine_899a670_method_vtable_field_off(void);
uint32_t isaac_lua_engine_899a670_method_stack_args(void);
uint32_t isaac_lua_engine_899a670_float_lane(void);
uint32_t isaac_lua_engine_899a670_iat_lua_checknumber(void);
uint32_t isaac_lua_engine_899a670_checknumber_index(void);
uint32_t isaac_lua_engine_899a670_return_value(void);
enum { ISAAC_LUA_ENGINE_899A700_VA = 0x0089a700u };
enum { ISAAC_LUA_ENGINE_899A700_END_VA = 0x0089a769u };
enum { ISAAC_LUA_ENGINE_899A700_NEXT_VA = 0x0089a770u };
enum { ISAAC_LUA_ENGINE_899A700_STACK_ARGS = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899A700_ECX_ARG = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899A700_CALLEE_POPS_STACK_ARGS = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899A700_ALIGNED_PROLOGUE = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899A700_GATE_INVERTED_ENCODING = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899A700_IAT_LUA_TYPE = 0x00b18400u };
enum { ISAAC_LUA_ENGINE_899A700_CHECKGET_KEY = 0x00c82a1eu };
enum { ISAAC_LUA_ENGINE_899A700_CHECKGET_INDEX = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899A700_CHECKGET_DEF_ARG = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899A700_CHECKGET_FIELD_OFF = 0x00000004u };
enum { ISAAC_LUA_ENGINE_899A700_CHECKGET_HELPER_VA = 0x0085c590u };
enum { ISAAC_LUA_ENGINE_899A700_IAT_LUA_TOUSERDATA = 0x00b183b0u };
enum { ISAAC_LUA_ENGINE_899A700_TOUSERDATA_INDEX_U32 = 0xfff0b9d7u };
enum { ISAAC_LUA_ENGINE_899A700_METHOD_VTABLE_FIELD_OFF = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899A700_METHOD_STACK_ARGS = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899A700_RETURN_VALUE = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899A700_FLOAT_PUSHER_HELPER_VA = 0x0085c050u };
enum { ISAAC_LUA_ENGINE_899A700_FLOAT_LANE = 0x00000001u };
int32_t isaac_lua_engine_899a700_type1_gate_taken(uint32_t type_result);
uint32_t isaac_lua_engine_899a700_host_va(void);
uint32_t isaac_lua_engine_899a700_end_va(void);
uint32_t isaac_lua_engine_899a700_next_va(void);
uint32_t isaac_lua_engine_899a700_stack_args(void);
uint32_t isaac_lua_engine_899a700_ecx_arg(void);
uint32_t isaac_lua_engine_899a700_callee_pops_stack_args(void);
uint32_t isaac_lua_engine_899a700_aligned_prologue(void);
uint32_t isaac_lua_engine_899a700_gate_inverted_encoding(void);
uint32_t isaac_lua_engine_899a700_iat_lua_type(void);
uint32_t isaac_lua_engine_899a700_checkget_key(void);
uint32_t isaac_lua_engine_899a700_checkget_index(void);
uint32_t isaac_lua_engine_899a700_checkget_def_arg(void);
uint32_t isaac_lua_engine_899a700_checkget_field_off(void);
uint32_t isaac_lua_engine_899a700_checkget_helper_va(void);
uint32_t isaac_lua_engine_899a700_iat_lua_touserdata(void);
uint32_t isaac_lua_engine_899a700_touserdata_index(void);
uint32_t isaac_lua_engine_899a700_method_vtable_field_off(void);
uint32_t isaac_lua_engine_899a700_method_stack_args(void);
uint32_t isaac_lua_engine_899a700_float_lane(void);
uint32_t isaac_lua_engine_899a700_float_pusher_helper_va(void);
uint32_t isaac_lua_engine_899a700_return_value(void);

enum { ISAAC_LUA_ENGINE_899A770_VA = 0x0089a770u };
enum { ISAAC_LUA_ENGINE_899A770_END_VA = 0x0089a803u };
enum { ISAAC_LUA_ENGINE_899A770_NEXT_VA = 0x0089a810u };
enum { ISAAC_LUA_ENGINE_899A770_STACK_ARGS = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899A770_ECX_ARG = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899A770_CALLEE_POPS_STACK_ARGS = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899A770_ALIGNED_PROLOGUE = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899A770_GATE_INVERTED_ENCODING = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899A770_IAT_LUA_TYPE = 0x00b18400u };
enum { ISAAC_LUA_ENGINE_899A770_CHECKGET_KEY = 0x00c829e0u };
enum { ISAAC_LUA_ENGINE_899A770_CHECKGET_INDEX = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899A770_CHECKGET_DEF_ARG = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899A770_CHECKGET_FIELD_OFF = 0x00000004u };
enum { ISAAC_LUA_ENGINE_899A770_CHECKGET_HELPER_VA = 0x0085c590u };
enum { ISAAC_LUA_ENGINE_899A770_IAT_LUA_TOUSERDATA = 0x00b183b0u };
enum { ISAAC_LUA_ENGINE_899A770_TOUSERDATA_INDEX_U32 = 0xfff0b9d7u };
enum { ISAAC_LUA_ENGINE_899A770_METHOD_VTABLE_FIELD_OFF = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899A770_METHOD_STACK_ARGS = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899A770_RETURN_VALUE = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899A770_SECOND_CHECKGET_KEY = 0x00c8299bu };
enum { ISAAC_LUA_ENGINE_899A770_SECOND_CHECKGET_INDEX = 0x00000002u };
enum { ISAAC_LUA_ENGINE_899A770_SECOND_CHECKGET_DEF_ARG = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899A770_SECOND_CHECKGET_FIELD_OFF = 0x00000004u };
enum { ISAAC_LUA_ENGINE_899A770_METHOD_STRUCT_ARG_BYTES = 0x00000010u };
int32_t isaac_lua_engine_899a770_type1_gate_taken(uint32_t type_result);
uint32_t isaac_lua_engine_899a770_host_va(void);
uint32_t isaac_lua_engine_899a770_end_va(void);
uint32_t isaac_lua_engine_899a770_next_va(void);
uint32_t isaac_lua_engine_899a770_stack_args(void);
uint32_t isaac_lua_engine_899a770_ecx_arg(void);
uint32_t isaac_lua_engine_899a770_callee_pops_stack_args(void);
uint32_t isaac_lua_engine_899a770_aligned_prologue(void);
uint32_t isaac_lua_engine_899a770_gate_inverted_encoding(void);
uint32_t isaac_lua_engine_899a770_iat_lua_type(void);
uint32_t isaac_lua_engine_899a770_checkget_key(void);
uint32_t isaac_lua_engine_899a770_checkget_index(void);
uint32_t isaac_lua_engine_899a770_checkget_def_arg(void);
uint32_t isaac_lua_engine_899a770_checkget_field_off(void);
uint32_t isaac_lua_engine_899a770_checkget_helper_va(void);
uint32_t isaac_lua_engine_899a770_second_checkget_key(void);
uint32_t isaac_lua_engine_899a770_second_checkget_index(void);
uint32_t isaac_lua_engine_899a770_second_checkget_def_arg(void);
uint32_t isaac_lua_engine_899a770_second_checkget_field_off(void);
uint32_t isaac_lua_engine_899a770_iat_lua_touserdata(void);
uint32_t isaac_lua_engine_899a770_touserdata_index(void);
uint32_t isaac_lua_engine_899a770_method_vtable_field_off(void);
uint32_t isaac_lua_engine_899a770_method_struct_arg_bytes(void);
uint32_t isaac_lua_engine_899a770_method_stack_args(void);
uint32_t isaac_lua_engine_899a770_return_value(void);
enum { ISAAC_LUA_ENGINE_899A810_VA = 0x0089a810u };
enum { ISAAC_LUA_ENGINE_899A810_END_VA = 0x0089a8aau };
enum { ISAAC_LUA_ENGINE_899A810_NEXT_VA = 0x0089a8b0u };
enum { ISAAC_LUA_ENGINE_899A810_STACK_ARGS = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899A810_ECX_ARG = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899A810_CALLEE_POPS_STACK_ARGS = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899A810_ALIGNED_PROLOGUE = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899A810_GATE_INVERTED_ENCODING = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899A810_IAT_LUA_TYPE = 0x00b18400u };
enum { ISAAC_LUA_ENGINE_899A810_CHECKGET_KEY = 0x00c829e0u };
enum { ISAAC_LUA_ENGINE_899A810_CHECKGET_INDEX = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899A810_CHECKGET_DEF_ARG = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899A810_CHECKGET_FIELD_OFF = 0x00000004u };
enum { ISAAC_LUA_ENGINE_899A810_CHECKGET_HELPER_VA = 0x0085c590u };
enum { ISAAC_LUA_ENGINE_899A810_IAT_LUA_TOUSERDATA = 0x00b183b0u };
enum { ISAAC_LUA_ENGINE_899A810_TOUSERDATA_INDEX_U32 = 0xfff0b9d7u };
enum { ISAAC_LUA_ENGINE_899A810_METHOD_VTABLE_FIELD_OFF = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899A810_METHOD_STACK_ARGS = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899A810_RETURN_VALUE = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899A810_NEWUSERDATA_SIZE = 0x00000018u };
enum { ISAAC_LUA_ENGINE_899A810_UD_VTABLE_VA = 0x00b7364cu };
enum { ISAAC_LUA_ENGINE_899A810_UD_PAYLOAD_PTR_OFF = 0x00000004u };
enum { ISAAC_LUA_ENGINE_899A810_UD_PAYLOAD_OFF = 0x00000008u };
enum { ISAAC_LUA_ENGINE_899A810_UD_PAYLOAD_BYTES = 0x00000010u };
enum { ISAAC_LUA_ENGINE_899A810_REGISTRY_INDEX_U32 = 0xfff0b9d8u };
enum { ISAAC_LUA_ENGINE_899A810_METATABLE_RAWGETP_KEY = 0x00c8299bu };
int32_t isaac_lua_engine_899a810_type1_gate_taken(uint32_t type_result);
uint32_t isaac_lua_engine_899a810_host_va(void);
uint32_t isaac_lua_engine_899a810_end_va(void);
uint32_t isaac_lua_engine_899a810_next_va(void);
uint32_t isaac_lua_engine_899a810_stack_args(void);
uint32_t isaac_lua_engine_899a810_ecx_arg(void);
uint32_t isaac_lua_engine_899a810_callee_pops_stack_args(void);
uint32_t isaac_lua_engine_899a810_aligned_prologue(void);
uint32_t isaac_lua_engine_899a810_gate_inverted_encoding(void);
uint32_t isaac_lua_engine_899a810_iat_lua_type(void);
uint32_t isaac_lua_engine_899a810_checkget_key(void);
uint32_t isaac_lua_engine_899a810_checkget_index(void);
uint32_t isaac_lua_engine_899a810_checkget_def_arg(void);
uint32_t isaac_lua_engine_899a810_checkget_field_off(void);
uint32_t isaac_lua_engine_899a810_checkget_helper_va(void);
uint32_t isaac_lua_engine_899a810_iat_lua_touserdata(void);
uint32_t isaac_lua_engine_899a810_touserdata_index(void);
uint32_t isaac_lua_engine_899a810_method_vtable_field_off(void);
uint32_t isaac_lua_engine_899a810_method_stack_args(void);
uint32_t isaac_lua_engine_899a810_newuserdata_size(void);
uint32_t isaac_lua_engine_899a810_ud_vtable_va(void);
uint32_t isaac_lua_engine_899a810_ud_payload_ptr_off(void);
uint32_t isaac_lua_engine_899a810_ud_payload_off(void);
uint32_t isaac_lua_engine_899a810_ud_payload_bytes(void);
uint32_t isaac_lua_engine_899a810_registry_index(void);
uint32_t isaac_lua_engine_899a810_metatable_rawgetp_key(void);
uint32_t isaac_lua_engine_899a810_return_value(void);

enum { ISAAC_LUA_ENGINE_899A8B0_VA = 0x0089a8b0u };
enum { ISAAC_LUA_ENGINE_899A8B0_END_VA = 0x0089aa4eu };
enum { ISAAC_LUA_ENGINE_899A8B0_NEXT_VA = 0x0089aa50u };
enum { ISAAC_LUA_ENGINE_899A8B0_STACK_ARGS = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899A8B0_ECX_ARG = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899A8B0_CALLEE_POPS_STACK_ARGS = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899A8B0_ALIGNED_PROLOGUE = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899A8B0_GATE_INVERTED_ENCODING = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899A8B0_IAT_LUA_TYPE = 0x00b18400u };
enum { ISAAC_LUA_ENGINE_899A8B0_CHECKGET_KEY = 0x00c8297au };
enum { ISAAC_LUA_ENGINE_899A8B0_CHECKGET_INDEX = 0x00000004u };
enum { ISAAC_LUA_ENGINE_899A8B0_CHECKGET_DEF_ARG = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899A8B0_CHECKGET_FIELD_OFF = 0x00000004u };
enum { ISAAC_LUA_ENGINE_899A8B0_CHECKGET_HELPER_VA = 0x0085c590u };
enum { ISAAC_LUA_ENGINE_899A8B0_IAT_LUA_TOUSERDATA = 0x00b183b0u };
enum { ISAAC_LUA_ENGINE_899A8B0_TOUSERDATA_INDEX_U32 = 0xfff0b9d7u };
enum { ISAAC_LUA_ENGINE_899A8B0_METHOD_VTABLE_FIELD_OFF = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899A8B0_METHOD_STACK_ARGS = 0x00000006u };
enum { ISAAC_LUA_ENGINE_899A8B0_RETURN_VALUE = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899A8B0_FRAME_REALIGNMENT = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899A8B0_PRE_GATE_TOUSERDATA = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899A8B0_CHECKNUMBER_INDEX = 0x00000005u };
enum { ISAAC_LUA_ENGINE_899A8B0_VECTOR_HELPER_VA = 0x008baa50u };
enum { ISAAC_LUA_ENGINE_899A8B0_VECTOR_CALL_COUNT = 0x00000003u };
enum { ISAAC_LUA_ENGINE_899A8B0_NEWUSERDATA_SIZE = 0x00000010u };
enum { ISAAC_LUA_ENGINE_899A8B0_UD_VTABLE_VA = 0x00b73574u };
enum { ISAAC_LUA_ENGINE_899A8B0_UD_PAYLOAD_PTR_OFF = 0x00000004u };
enum { ISAAC_LUA_ENGINE_899A8B0_UD_PAYLOAD_OFF = 0x00000008u };
enum { ISAAC_LUA_ENGINE_899A8B0_UD_PAYLOAD_BYTES = 0x00000008u };
enum { ISAAC_LUA_ENGINE_899A8B0_REGISTRY_INDEX_U32 = 0xfff0b9d8u };
enum { ISAAC_LUA_ENGINE_899A8B0_METATABLE_RAWGETP_KEY = 0x00c82980u };
int32_t isaac_lua_engine_899a8b0_type1_gate_taken(uint32_t type_result);
uint32_t isaac_lua_engine_899a8b0_host_va(void);
uint32_t isaac_lua_engine_899a8b0_end_va(void);
uint32_t isaac_lua_engine_899a8b0_next_va(void);
uint32_t isaac_lua_engine_899a8b0_stack_args(void);
uint32_t isaac_lua_engine_899a8b0_ecx_arg(void);
uint32_t isaac_lua_engine_899a8b0_callee_pops_stack_args(void);
uint32_t isaac_lua_engine_899a8b0_frame_realignment(void);
uint32_t isaac_lua_engine_899a8b0_aligned_prologue(void);
uint32_t isaac_lua_engine_899a8b0_gate_inverted_encoding(void);
uint32_t isaac_lua_engine_899a8b0_pre_gate_touserdata(void);
uint32_t isaac_lua_engine_899a8b0_iat_lua_type(void);
uint32_t isaac_lua_engine_899a8b0_checkget_key(void);
uint32_t isaac_lua_engine_899a8b0_checkget_index(void);
uint32_t isaac_lua_engine_899a8b0_checkget_def_arg(void);
uint32_t isaac_lua_engine_899a8b0_checkget_field_off(void);
uint32_t isaac_lua_engine_899a8b0_checkget_helper_va(void);
uint32_t isaac_lua_engine_899a8b0_checknumber_index(void);
uint32_t isaac_lua_engine_899a8b0_vector_helper_va(void);
uint32_t isaac_lua_engine_899a8b0_vector_call_count(void);
uint32_t isaac_lua_engine_899a8b0_iat_lua_touserdata(void);
uint32_t isaac_lua_engine_899a8b0_touserdata_index(void);
uint32_t isaac_lua_engine_899a8b0_method_vtable_field_off(void);
uint32_t isaac_lua_engine_899a8b0_method_stack_args(void);
uint32_t isaac_lua_engine_899a8b0_newuserdata_size(void);
uint32_t isaac_lua_engine_899a8b0_ud_vtable_va(void);
uint32_t isaac_lua_engine_899a8b0_ud_payload_ptr_off(void);
uint32_t isaac_lua_engine_899a8b0_ud_payload_off(void);
uint32_t isaac_lua_engine_899a8b0_ud_payload_bytes(void);
uint32_t isaac_lua_engine_899a8b0_registry_index(void);
uint32_t isaac_lua_engine_899a8b0_metatable_rawgetp_key(void);
uint32_t isaac_lua_engine_899a8b0_return_value(void);
enum { ISAAC_LUA_ENGINE_899AA50_VA = 0x0089aa50u };
enum { ISAAC_LUA_ENGINE_899AA50_END_VA = 0x0089aad2u };
enum { ISAAC_LUA_ENGINE_899AA50_NEXT_VA = 0x0089aae0u };
enum { ISAAC_LUA_ENGINE_899AA50_STACK_ARGS = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899AA50_ECX_ARG = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899AA50_CALLEE_POPS_STACK_ARGS = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899AA50_ALIGNED_PROLOGUE = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899AA50_GATE_INVERTED_ENCODING = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899AA50_IAT_LUA_TYPE = 0x00b18400u };
enum { ISAAC_LUA_ENGINE_899AA50_CHECKGET_KEY = 0x00c829ddu };
enum { ISAAC_LUA_ENGINE_899AA50_CHECKGET_INDEX = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899AA50_CHECKGET_DEF_ARG = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899AA50_CHECKGET_FIELD_OFF = 0x00000004u };
enum { ISAAC_LUA_ENGINE_899AA50_CHECKGET_HELPER_VA = 0x0085c590u };
enum { ISAAC_LUA_ENGINE_899AA50_IAT_LUA_TOUSERDATA = 0x00b183b0u };
enum { ISAAC_LUA_ENGINE_899AA50_TOUSERDATA_INDEX_U32 = 0xfff0b9d7u };
enum { ISAAC_LUA_ENGINE_899AA50_METHOD_VTABLE_FIELD_OFF = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899AA50_METHOD_STACK_ARGS = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899AA50_RETURN_VALUE = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899AA50_CHECKNUMBER_INDEX = 0x00000002u };
int32_t isaac_lua_engine_899aa50_type1_gate_taken(uint32_t type_result);
uint32_t isaac_lua_engine_899aa50_host_va(void);
uint32_t isaac_lua_engine_899aa50_end_va(void);
uint32_t isaac_lua_engine_899aa50_next_va(void);
uint32_t isaac_lua_engine_899aa50_stack_args(void);
uint32_t isaac_lua_engine_899aa50_ecx_arg(void);
uint32_t isaac_lua_engine_899aa50_callee_pops_stack_args(void);
uint32_t isaac_lua_engine_899aa50_aligned_prologue(void);
uint32_t isaac_lua_engine_899aa50_gate_inverted_encoding(void);
uint32_t isaac_lua_engine_899aa50_iat_lua_type(void);
uint32_t isaac_lua_engine_899aa50_checkget_key(void);
uint32_t isaac_lua_engine_899aa50_checkget_index(void);
uint32_t isaac_lua_engine_899aa50_checkget_def_arg(void);
uint32_t isaac_lua_engine_899aa50_checkget_field_off(void);
uint32_t isaac_lua_engine_899aa50_checkget_helper_va(void);
uint32_t isaac_lua_engine_899aa50_checknumber_index(void);
uint32_t isaac_lua_engine_899aa50_iat_lua_touserdata(void);
uint32_t isaac_lua_engine_899aa50_touserdata_index(void);
uint32_t isaac_lua_engine_899aa50_method_vtable_field_off(void);
uint32_t isaac_lua_engine_899aa50_method_stack_args(void);
uint32_t isaac_lua_engine_899aa50_return_value(void);

enum { ISAAC_LUA_ENGINE_899AAE0_VA = 0x0089aae0u };
enum { ISAAC_LUA_ENGINE_899AAE0_END_VA = 0x0089ab49u };
enum { ISAAC_LUA_ENGINE_899AAE0_NEXT_VA = 0x0089ab50u };
enum { ISAAC_LUA_ENGINE_899AAE0_STACK_ARGS = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899AAE0_ECX_ARG = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899AAE0_CALLEE_POPS_STACK_ARGS = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899AAE0_GATE_INVERTED_ENCODING = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899AAE0_IAT_LUA_TYPE = 0x00b18400u };
enum { ISAAC_LUA_ENGINE_899AAE0_CHECKGET_KEY = 0x00c829ddu };
enum { ISAAC_LUA_ENGINE_899AAE0_CHECKGET_INDEX = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899AAE0_CHECKGET_DEF_ARG = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899AAE0_CHECKGET_FIELD_OFF = 0x00000004u };
enum { ISAAC_LUA_ENGINE_899AAE0_CHECKGET_HELPER_VA = 0x0085c590u };
enum { ISAAC_LUA_ENGINE_899AAE0_IAT_LUA_TOUSERDATA = 0x00b183b0u };
enum { ISAAC_LUA_ENGINE_899AAE0_TOUSERDATA_INDEX_U32 = 0xfff0b9d7u };
enum { ISAAC_LUA_ENGINE_899AAE0_METHOD_VTABLE_FIELD_OFF = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899AAE0_METHOD_STACK_ARGS = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899AAE0_RETURN_VALUE = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899AAE0_PUSHER_HELPER_VA = 0x0085c050u };
int32_t isaac_lua_engine_899aae0_type1_gate_taken(uint32_t type_result);
uint32_t isaac_lua_engine_899aae0_host_va(void);
uint32_t isaac_lua_engine_899aae0_end_va(void);
uint32_t isaac_lua_engine_899aae0_next_va(void);
uint32_t isaac_lua_engine_899aae0_stack_args(void);
uint32_t isaac_lua_engine_899aae0_ecx_arg(void);
uint32_t isaac_lua_engine_899aae0_callee_pops_stack_args(void);
uint32_t isaac_lua_engine_899aae0_gate_inverted_encoding(void);
uint32_t isaac_lua_engine_899aae0_iat_lua_type(void);
uint32_t isaac_lua_engine_899aae0_checkget_key(void);
uint32_t isaac_lua_engine_899aae0_checkget_index(void);
uint32_t isaac_lua_engine_899aae0_checkget_def_arg(void);
uint32_t isaac_lua_engine_899aae0_checkget_field_off(void);
uint32_t isaac_lua_engine_899aae0_checkget_helper_va(void);
uint32_t isaac_lua_engine_899aae0_iat_lua_touserdata(void);
uint32_t isaac_lua_engine_899aae0_touserdata_index(void);
uint32_t isaac_lua_engine_899aae0_method_vtable_field_off(void);
uint32_t isaac_lua_engine_899aae0_method_stack_args(void);
uint32_t isaac_lua_engine_899aae0_pusher_helper_va(void);
uint32_t isaac_lua_engine_899aae0_return_value(void);
enum { ISAAC_LUA_ENGINE_899AB50_VA = 0x0089ab50u };
enum { ISAAC_LUA_ENGINE_899AB50_END_VA = 0x0089abe3u };
enum { ISAAC_LUA_ENGINE_899AB50_NEXT_VA = 0x0089abf0u };
enum { ISAAC_LUA_ENGINE_899AB50_STACK_ARGS = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899AB50_ECX_ARG = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899AB50_CALLEE_POPS_STACK_ARGS = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899AB50_GATE_INVERTED_ENCODING = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899AB50_IAT_LUA_TYPE = 0x00b18400u };
enum { ISAAC_LUA_ENGINE_899AB50_CHECKGET_KEY = 0x00c829ddu };
enum { ISAAC_LUA_ENGINE_899AB50_CHECKGET_INDEX = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899AB50_CHECKGET_DEF_ARG = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899AB50_CHECKGET_FIELD_OFF = 0x00000004u };
enum { ISAAC_LUA_ENGINE_899AB50_CHECKGET_HELPER_VA = 0x0085c590u };
enum { ISAAC_LUA_ENGINE_899AB50_IAT_LUA_TOUSERDATA = 0x00b183b0u };
enum { ISAAC_LUA_ENGINE_899AB50_TOUSERDATA_INDEX_U32 = 0xfff0b9d7u };
enum { ISAAC_LUA_ENGINE_899AB50_METHOD_VTABLE_FIELD_OFF = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899AB50_METHOD_STACK_ARGS = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899AB50_RETURN_VALUE = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899AB50_SECOND_CHECKGET_KEY = 0x00c8299bu };
enum { ISAAC_LUA_ENGINE_899AB50_SECOND_CHECKGET_INDEX = 0x00000002u };
enum { ISAAC_LUA_ENGINE_899AB50_SECOND_CHECKGET_DEF_ARG = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899AB50_SECOND_CHECKGET_FIELD_OFF = 0x00000004u };
enum { ISAAC_LUA_ENGINE_899AB50_METHOD_STRUCT_ARG_BYTES = 0x00000010u };
int32_t isaac_lua_engine_899ab50_type1_gate_taken(uint32_t type_result);
uint32_t isaac_lua_engine_899ab50_host_va(void);
uint32_t isaac_lua_engine_899ab50_end_va(void);
uint32_t isaac_lua_engine_899ab50_next_va(void);
uint32_t isaac_lua_engine_899ab50_stack_args(void);
uint32_t isaac_lua_engine_899ab50_ecx_arg(void);
uint32_t isaac_lua_engine_899ab50_callee_pops_stack_args(void);
uint32_t isaac_lua_engine_899ab50_gate_inverted_encoding(void);
uint32_t isaac_lua_engine_899ab50_iat_lua_type(void);
uint32_t isaac_lua_engine_899ab50_checkget_key(void);
uint32_t isaac_lua_engine_899ab50_checkget_index(void);
uint32_t isaac_lua_engine_899ab50_checkget_def_arg(void);
uint32_t isaac_lua_engine_899ab50_checkget_field_off(void);
uint32_t isaac_lua_engine_899ab50_checkget_helper_va(void);
uint32_t isaac_lua_engine_899ab50_second_checkget_key(void);
uint32_t isaac_lua_engine_899ab50_second_checkget_index(void);
uint32_t isaac_lua_engine_899ab50_second_checkget_def_arg(void);
uint32_t isaac_lua_engine_899ab50_second_checkget_field_off(void);
uint32_t isaac_lua_engine_899ab50_iat_lua_touserdata(void);
uint32_t isaac_lua_engine_899ab50_touserdata_index(void);
uint32_t isaac_lua_engine_899ab50_method_vtable_field_off(void);
uint32_t isaac_lua_engine_899ab50_method_struct_arg_bytes(void);
uint32_t isaac_lua_engine_899ab50_method_stack_args(void);
uint32_t isaac_lua_engine_899ab50_return_value(void);
enum { ISAAC_LUA_ENGINE_899ABF0_VA = 0x0089abf0u };
enum { ISAAC_LUA_ENGINE_899ABF0_END_VA = 0x0089ac8au };
enum { ISAAC_LUA_ENGINE_899ABF0_NEXT_VA = 0x0089ac90u };
enum { ISAAC_LUA_ENGINE_899ABF0_STACK_ARGS = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899ABF0_ECX_ARG = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899ABF0_CALLEE_POPS_STACK_ARGS = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899ABF0_IAT_LUA_TOUSERDATA = 0x00b183b0u };
enum { ISAAC_LUA_ENGINE_899ABF0_TOUSERDATA_INDEX_U32 = 0xfff0b9d7u };
enum { ISAAC_LUA_ENGINE_899ABF0_METHOD_VTABLE_FIELD_OFF = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899ABF0_GATE_INVERTED_ENCODING = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899ABF0_IAT_LUA_TYPE = 0x00b18400u };
enum { ISAAC_LUA_ENGINE_899ABF0_CHECKGET_KEY = 0x00c829ddu };
enum { ISAAC_LUA_ENGINE_899ABF0_CHECKGET_INDEX = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899ABF0_CHECKGET_DEF_ARG = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899ABF0_CHECKGET_FIELD_OFF = 0x00000004u };
enum { ISAAC_LUA_ENGINE_899ABF0_CHECKGET_HELPER_VA = 0x0085c590u };
enum { ISAAC_LUA_ENGINE_899ABF0_METHOD_STACK_ARGS = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899ABF0_RETURN_VALUE = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899ABF0_NEWUSERDATA_SIZE = 0x00000018u };
enum { ISAAC_LUA_ENGINE_899ABF0_UD_VTABLE_VA = 0x00b7364cu };
enum { ISAAC_LUA_ENGINE_899ABF0_UD_PTR_FIELD_OFF = 0x00000004u };
enum { ISAAC_LUA_ENGINE_899ABF0_UD_PAYLOAD_BYTES = 0x00000010u };
enum { ISAAC_LUA_ENGINE_899ABF0_REGISTRY_INDEX_U32 = 0xfff0b9d8u };
enum { ISAAC_LUA_ENGINE_899ABF0_METATABLE_RAWGETP_KEY = 0x00c8299bu };
int32_t isaac_lua_engine_899abf0_type1_gate_taken(uint32_t type_result);
uint32_t isaac_lua_engine_899abf0_host_va(void);
uint32_t isaac_lua_engine_899abf0_end_va(void);
uint32_t isaac_lua_engine_899abf0_next_va(void);
uint32_t isaac_lua_engine_899abf0_stack_args(void);
uint32_t isaac_lua_engine_899abf0_ecx_arg(void);
uint32_t isaac_lua_engine_899abf0_callee_pops_stack_args(void);
uint32_t isaac_lua_engine_899abf0_gate_inverted_encoding(void);
uint32_t isaac_lua_engine_899abf0_iat_lua_type(void);
uint32_t isaac_lua_engine_899abf0_checkget_key(void);
uint32_t isaac_lua_engine_899abf0_checkget_index(void);
uint32_t isaac_lua_engine_899abf0_checkget_def_arg(void);
uint32_t isaac_lua_engine_899abf0_checkget_field_off(void);
uint32_t isaac_lua_engine_899abf0_checkget_helper_va(void);
uint32_t isaac_lua_engine_899abf0_iat_lua_touserdata(void);
uint32_t isaac_lua_engine_899abf0_touserdata_index(void);
uint32_t isaac_lua_engine_899abf0_method_vtable_field_off(void);
uint32_t isaac_lua_engine_899abf0_method_stack_args(void);
uint32_t isaac_lua_engine_899abf0_newuserdata_size(void);
uint32_t isaac_lua_engine_899abf0_ud_vtable_va(void);
uint32_t isaac_lua_engine_899abf0_ud_ptr_field_off(void);
uint32_t isaac_lua_engine_899abf0_ud_payload_bytes(void);
uint32_t isaac_lua_engine_899abf0_registry_index(void);
uint32_t isaac_lua_engine_899abf0_metatable_rawgetp_key(void);
uint32_t isaac_lua_engine_899abf0_return_value(void);
enum { ISAAC_LUA_ENGINE_899AC90_VA = 0x0089ac90u };
enum { ISAAC_LUA_ENGINE_899AC90_END_VA = 0x0089ad6du };
enum { ISAAC_LUA_ENGINE_899AC90_NEXT_VA = 0x0089ad70u };
enum { ISAAC_LUA_ENGINE_899AC90_STACK_ARGS = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899AC90_ECX_ARG = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899AC90_CALLEE_POPS_STACK_ARGS = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899AC90_IAT_LUA_TOUSERDATA = 0x00b183b0u };
enum { ISAAC_LUA_ENGINE_899AC90_TOUSERDATA_INDEX_U32 = 0xfff0b9d7u };
enum { ISAAC_LUA_ENGINE_899AC90_METHOD_VTABLE_FIELD_OFF = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899AC90_METHOD_STACK_ARGS = 0x00000007u };
enum { ISAAC_LUA_ENGINE_899AC90_RETURN_VALUE = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899AC90_FRAME_REALIGNMENT = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899AC90_PRE_GATE_TOUSERDATA = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899AC90_STRUCT_HELPER_VA = 0x008b1c80u };
enum { ISAAC_LUA_ENGINE_899AC90_NULL_RESULT_IAT_LUA_PUSHNIL = 0x00b183e0u };
enum { ISAAC_LUA_ENGINE_899AC90_NEWUSERDATA_SIZE = 0x00000008u };
enum { ISAAC_LUA_ENGINE_899AC90_UD_VTABLE_VA = 0x00b753c8u };
enum { ISAAC_LUA_ENGINE_899AC90_UD_PTR_FIELD_OFF = 0x00000004u };
enum { ISAAC_LUA_ENGINE_899AC90_UD_PAYLOAD_BYTES = 0x00000008u };
enum { ISAAC_LUA_ENGINE_899AC90_REGISTRY_INDEX_U32 = 0xfff0b9d8u };
enum { ISAAC_LUA_ENGINE_899AC90_METATABLE_RAWGETP_KEY = 0x00c829ddu };
uint32_t isaac_lua_engine_899ac90_host_va(void);
uint32_t isaac_lua_engine_899ac90_end_va(void);
uint32_t isaac_lua_engine_899ac90_next_va(void);
uint32_t isaac_lua_engine_899ac90_stack_args(void);
uint32_t isaac_lua_engine_899ac90_ecx_arg(void);
uint32_t isaac_lua_engine_899ac90_callee_pops_stack_args(void);
uint32_t isaac_lua_engine_899ac90_frame_realignment(void);
uint32_t isaac_lua_engine_899ac90_pre_gate_touserdata(void);
uint32_t isaac_lua_engine_899ac90_struct_helper_va(void);
uint32_t isaac_lua_engine_899ac90_null_result_iat_lua_pushnil(void);
uint32_t isaac_lua_engine_899ac90_iat_lua_touserdata(void);
uint32_t isaac_lua_engine_899ac90_touserdata_index(void);
uint32_t isaac_lua_engine_899ac90_method_vtable_field_off(void);
uint32_t isaac_lua_engine_899ac90_method_stack_args(void);
uint32_t isaac_lua_engine_899ac90_newuserdata_size(void);
uint32_t isaac_lua_engine_899ac90_ud_vtable_va(void);
uint32_t isaac_lua_engine_899ac90_ud_ptr_field_off(void);
uint32_t isaac_lua_engine_899ac90_ud_payload_bytes(void);
uint32_t isaac_lua_engine_899ac90_registry_index(void);
uint32_t isaac_lua_engine_899ac90_metatable_rawgetp_key(void);
uint32_t isaac_lua_engine_899ac90_return_value(void);
enum { ISAAC_LUA_ENGINE_899AD70_VA = 0x0089ad70u };
enum { ISAAC_LUA_ENGINE_899AD70_END_VA = 0x0089adf2u };
enum { ISAAC_LUA_ENGINE_899AD70_NEXT_VA = 0x0089ae00u };
enum { ISAAC_LUA_ENGINE_899AD70_STACK_ARGS = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899AD70_ECX_ARG = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899AD70_CALLEE_POPS_STACK_ARGS = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899AD70_ALIGNED_PROLOGUE = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899AD70_GATE_INVERTED_ENCODING = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899AD70_IAT_LUA_TYPE = 0x00b18400u };
enum { ISAAC_LUA_ENGINE_899AD70_CHECKGET_KEY = 0x00c829dau };
enum { ISAAC_LUA_ENGINE_899AD70_CHECKGET_INDEX = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899AD70_CHECKGET_DEF_ARG = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899AD70_CHECKGET_FIELD_OFF = 0x00000004u };
enum { ISAAC_LUA_ENGINE_899AD70_CHECKGET_HELPER_VA = 0x0085c590u };
enum { ISAAC_LUA_ENGINE_899AD70_IAT_LUA_TOUSERDATA = 0x00b183b0u };
enum { ISAAC_LUA_ENGINE_899AD70_TOUSERDATA_INDEX_U32 = 0xfff0b9d7u };
enum { ISAAC_LUA_ENGINE_899AD70_METHOD_VTABLE_FIELD_OFF = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899AD70_METHOD_STACK_ARGS = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899AD70_RETURN_VALUE = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899AD70_CHECKNUMBER_INDEX = 0x00000002u };
int32_t isaac_lua_engine_899ad70_type1_gate_taken(uint32_t type_result);
uint32_t isaac_lua_engine_899ad70_host_va(void);
uint32_t isaac_lua_engine_899ad70_end_va(void);
uint32_t isaac_lua_engine_899ad70_next_va(void);
uint32_t isaac_lua_engine_899ad70_stack_args(void);
uint32_t isaac_lua_engine_899ad70_ecx_arg(void);
uint32_t isaac_lua_engine_899ad70_callee_pops_stack_args(void);
uint32_t isaac_lua_engine_899ad70_aligned_prologue(void);
uint32_t isaac_lua_engine_899ad70_gate_inverted_encoding(void);
uint32_t isaac_lua_engine_899ad70_iat_lua_type(void);
uint32_t isaac_lua_engine_899ad70_checkget_key(void);
uint32_t isaac_lua_engine_899ad70_checkget_index(void);
uint32_t isaac_lua_engine_899ad70_checkget_def_arg(void);
uint32_t isaac_lua_engine_899ad70_checkget_field_off(void);
uint32_t isaac_lua_engine_899ad70_checkget_helper_va(void);
uint32_t isaac_lua_engine_899ad70_iat_lua_touserdata(void);
uint32_t isaac_lua_engine_899ad70_touserdata_index(void);
uint32_t isaac_lua_engine_899ad70_method_vtable_field_off(void);
uint32_t isaac_lua_engine_899ad70_method_stack_args(void);
uint32_t isaac_lua_engine_899ad70_checknumber_index(void);
uint32_t isaac_lua_engine_899ad70_return_value(void);
enum { ISAAC_LUA_ENGINE_899AE00_VA = 0x0089ae00u };
enum { ISAAC_LUA_ENGINE_899AE00_END_VA = 0x0089ae69u };
enum { ISAAC_LUA_ENGINE_899AE00_NEXT_VA = 0x0089ae70u };
enum { ISAAC_LUA_ENGINE_899AE00_STACK_ARGS = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899AE00_ECX_ARG = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899AE00_CALLEE_POPS_STACK_ARGS = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899AE00_ALIGNED_PROLOGUE = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899AE00_GATE_INVERTED_ENCODING = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899AE00_IAT_LUA_TYPE = 0x00b18400u };
enum { ISAAC_LUA_ENGINE_899AE00_CHECKGET_KEY = 0x00c829dau };
enum { ISAAC_LUA_ENGINE_899AE00_CHECKGET_INDEX = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899AE00_CHECKGET_DEF_ARG = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899AE00_CHECKGET_FIELD_OFF = 0x00000004u };
enum { ISAAC_LUA_ENGINE_899AE00_CHECKGET_HELPER_VA = 0x0085c590u };
enum { ISAAC_LUA_ENGINE_899AE00_IAT_LUA_TOUSERDATA = 0x00b183b0u };
enum { ISAAC_LUA_ENGINE_899AE00_TOUSERDATA_INDEX_U32 = 0xfff0b9d7u };
enum { ISAAC_LUA_ENGINE_899AE00_METHOD_VTABLE_FIELD_OFF = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899AE00_METHOD_STACK_ARGS = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899AE00_RETURN_VALUE = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899AE00_PUSHER_HELPER_VA = 0x0085c050u };
int32_t isaac_lua_engine_899ae00_type1_gate_taken(uint32_t type_result);
uint32_t isaac_lua_engine_899ae00_host_va(void);
uint32_t isaac_lua_engine_899ae00_end_va(void);
uint32_t isaac_lua_engine_899ae00_next_va(void);
uint32_t isaac_lua_engine_899ae00_stack_args(void);
uint32_t isaac_lua_engine_899ae00_ecx_arg(void);
uint32_t isaac_lua_engine_899ae00_callee_pops_stack_args(void);
uint32_t isaac_lua_engine_899ae00_aligned_prologue(void);
uint32_t isaac_lua_engine_899ae00_gate_inverted_encoding(void);
uint32_t isaac_lua_engine_899ae00_iat_lua_type(void);
uint32_t isaac_lua_engine_899ae00_checkget_key(void);
uint32_t isaac_lua_engine_899ae00_checkget_index(void);
uint32_t isaac_lua_engine_899ae00_checkget_def_arg(void);
uint32_t isaac_lua_engine_899ae00_checkget_field_off(void);
uint32_t isaac_lua_engine_899ae00_checkget_helper_va(void);
uint32_t isaac_lua_engine_899ae00_iat_lua_touserdata(void);
uint32_t isaac_lua_engine_899ae00_touserdata_index(void);
uint32_t isaac_lua_engine_899ae00_method_vtable_field_off(void);
uint32_t isaac_lua_engine_899ae00_method_stack_args(void);
uint32_t isaac_lua_engine_899ae00_pusher_helper_va(void);
uint32_t isaac_lua_engine_899ae00_return_value(void);
enum { ISAAC_LUA_ENGINE_899AE70_VA = 0x0089ae70u };
enum { ISAAC_LUA_ENGINE_899AE70_END_VA = 0x0089aed9u };
enum { ISAAC_LUA_ENGINE_899AE70_NEXT_VA = 0x0089aee0u };
enum { ISAAC_LUA_ENGINE_899AE70_STACK_ARGS = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899AE70_ECX_ARG = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899AE70_CALLEE_POPS_STACK_ARGS = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899AE70_GATE_INVERTED_ENCODING = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899AE70_IAT_LUA_TYPE = 0x00b18400u };
enum { ISAAC_LUA_ENGINE_899AE70_CHECKGET_KEY = 0x00c829dau };
enum { ISAAC_LUA_ENGINE_899AE70_CHECKGET_INDEX = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899AE70_CHECKGET_DEF_ARG = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899AE70_CHECKGET_FIELD_OFF = 0x00000004u };
enum { ISAAC_LUA_ENGINE_899AE70_CHECKGET_HELPER_VA = 0x0085c590u };
enum { ISAAC_LUA_ENGINE_899AE70_IAT_LUA_TOUSERDATA = 0x00b183b0u };
enum { ISAAC_LUA_ENGINE_899AE70_TOUSERDATA_INDEX_U32 = 0xfff0b9d7u };
enum { ISAAC_LUA_ENGINE_899AE70_METHOD_VTABLE_FIELD_OFF = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899AE70_METHOD_STACK_ARGS = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899AE70_RETURN_VALUE = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899AE70_IAT_LUA_TOBOOLEAN = 0x00b183e8u };
enum { ISAAC_LUA_ENGINE_899AE70_TOBOOLEAN_INDEX = 0x00000002u };
int32_t isaac_lua_engine_899ae70_type1_gate_taken(uint32_t type_result);
uint32_t isaac_lua_engine_899ae70_host_va(void);
uint32_t isaac_lua_engine_899ae70_end_va(void);
uint32_t isaac_lua_engine_899ae70_next_va(void);
uint32_t isaac_lua_engine_899ae70_stack_args(void);
uint32_t isaac_lua_engine_899ae70_ecx_arg(void);
uint32_t isaac_lua_engine_899ae70_callee_pops_stack_args(void);
uint32_t isaac_lua_engine_899ae70_gate_inverted_encoding(void);
uint32_t isaac_lua_engine_899ae70_iat_lua_type(void);
uint32_t isaac_lua_engine_899ae70_checkget_key(void);
uint32_t isaac_lua_engine_899ae70_checkget_index(void);
uint32_t isaac_lua_engine_899ae70_checkget_def_arg(void);
uint32_t isaac_lua_engine_899ae70_checkget_field_off(void);
uint32_t isaac_lua_engine_899ae70_checkget_helper_va(void);
uint32_t isaac_lua_engine_899ae70_iat_lua_touserdata(void);
uint32_t isaac_lua_engine_899ae70_touserdata_index(void);
uint32_t isaac_lua_engine_899ae70_method_vtable_field_off(void);
uint32_t isaac_lua_engine_899ae70_iat_lua_toboolean(void);
uint32_t isaac_lua_engine_899ae70_toboolean_index(void);
uint32_t isaac_lua_engine_899ae70_method_stack_args(void);
uint32_t isaac_lua_engine_899ae70_return_value(void);
enum { ISAAC_LUA_ENGINE_899AEE0_VA = 0x0089aee0u };
enum { ISAAC_LUA_ENGINE_899AEE0_END_VA = 0x0089af45u };
enum { ISAAC_LUA_ENGINE_899AEE0_NEXT_VA = 0x0089af50u };
enum { ISAAC_LUA_ENGINE_899AEE0_STACK_ARGS = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899AEE0_ECX_ARG = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899AEE0_CALLEE_POPS_STACK_ARGS = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899AEE0_GATE_INVERTED_ENCODING = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899AEE0_IAT_LUA_TYPE = 0x00b18400u };
enum { ISAAC_LUA_ENGINE_899AEE0_CHECKGET_KEY = 0x00c829dau };
enum { ISAAC_LUA_ENGINE_899AEE0_CHECKGET_INDEX = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899AEE0_CHECKGET_DEF_ARG = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899AEE0_CHECKGET_FIELD_OFF = 0x00000004u };
enum { ISAAC_LUA_ENGINE_899AEE0_CHECKGET_HELPER_VA = 0x0085c590u };
enum { ISAAC_LUA_ENGINE_899AEE0_IAT_LUA_TOUSERDATA = 0x00b183b0u };
enum { ISAAC_LUA_ENGINE_899AEE0_TOUSERDATA_INDEX_U32 = 0xfff0b9d7u };
enum { ISAAC_LUA_ENGINE_899AEE0_METHOD_VTABLE_FIELD_OFF = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899AEE0_METHOD_STACK_ARGS = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899AEE0_RETURN_VALUE = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899AEE0_IAT_LUA_PUSHBOOLEAN = 0x00b183ecu };
int32_t isaac_lua_engine_899aee0_type1_gate_taken(uint32_t type_result);
uint32_t isaac_lua_engine_899aee0_host_va(void);
uint32_t isaac_lua_engine_899aee0_end_va(void);
uint32_t isaac_lua_engine_899aee0_next_va(void);
uint32_t isaac_lua_engine_899aee0_stack_args(void);
uint32_t isaac_lua_engine_899aee0_ecx_arg(void);
uint32_t isaac_lua_engine_899aee0_callee_pops_stack_args(void);
uint32_t isaac_lua_engine_899aee0_gate_inverted_encoding(void);
uint32_t isaac_lua_engine_899aee0_iat_lua_type(void);
uint32_t isaac_lua_engine_899aee0_checkget_key(void);
uint32_t isaac_lua_engine_899aee0_checkget_index(void);
uint32_t isaac_lua_engine_899aee0_checkget_def_arg(void);
uint32_t isaac_lua_engine_899aee0_checkget_field_off(void);
uint32_t isaac_lua_engine_899aee0_checkget_helper_va(void);
uint32_t isaac_lua_engine_899aee0_iat_lua_touserdata(void);
uint32_t isaac_lua_engine_899aee0_touserdata_index(void);
uint32_t isaac_lua_engine_899aee0_method_vtable_field_off(void);
uint32_t isaac_lua_engine_899aee0_method_stack_args(void);
uint32_t isaac_lua_engine_899aee0_iat_lua_pushboolean(void);
uint32_t isaac_lua_engine_899aee0_return_value(void);
enum { ISAAC_LUA_ENGINE_899AF50_VA = 0x0089af50u };
enum { ISAAC_LUA_ENGINE_899AF50_END_VA = 0x0089afe3u };
enum { ISAAC_LUA_ENGINE_899AF50_NEXT_VA = 0x0089aff0u };
enum { ISAAC_LUA_ENGINE_899AF50_STACK_ARGS = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899AF50_ECX_ARG = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899AF50_CALLEE_POPS_STACK_ARGS = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899AF50_IAT_LUA_TOUSERDATA = 0x00b183b0u };
enum { ISAAC_LUA_ENGINE_899AF50_TOUSERDATA_INDEX_U32 = 0xfff0b9d7u };
enum { ISAAC_LUA_ENGINE_899AF50_METHOD_VTABLE_FIELD_OFF = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899AF50_GATE_INVERTED_ENCODING = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899AF50_IAT_LUA_TYPE = 0x00b18400u };
enum { ISAAC_LUA_ENGINE_899AF50_CHECKGET_KEY = 0x00c829ddu };
enum { ISAAC_LUA_ENGINE_899AF50_CHECKGET_INDEX = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899AF50_CHECKGET_DEF_ARG = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899AF50_CHECKGET_FIELD_OFF = 0x00000004u };
enum { ISAAC_LUA_ENGINE_899AF50_CHECKGET_HELPER_VA = 0x0085c590u };
enum { ISAAC_LUA_ENGINE_899AF50_METHOD_STACK_ARGS = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899AF50_RETURN_VALUE = 0x00000000u };
int32_t isaac_lua_engine_899af50_type1_gate_taken(uint32_t type_result);
uint32_t isaac_lua_engine_899af50_host_va(void);
uint32_t isaac_lua_engine_899af50_end_va(void);
uint32_t isaac_lua_engine_899af50_next_va(void);
uint32_t isaac_lua_engine_899af50_stack_args(void);
uint32_t isaac_lua_engine_899af50_ecx_arg(void);
uint32_t isaac_lua_engine_899af50_callee_pops_stack_args(void);
uint32_t isaac_lua_engine_899af50_gate_inverted_encoding(void);
uint32_t isaac_lua_engine_899af50_iat_lua_type(void);
uint32_t isaac_lua_engine_899af50_checkget_key(void);
uint32_t isaac_lua_engine_899af50_checkget_index(void);
uint32_t isaac_lua_engine_899af50_checkget_def_arg(void);
uint32_t isaac_lua_engine_899af50_checkget_field_off(void);
uint32_t isaac_lua_engine_899af50_checkget_helper_va(void);
uint32_t isaac_lua_engine_899af50_iat_lua_touserdata(void);
uint32_t isaac_lua_engine_899af50_touserdata_index(void);
uint32_t isaac_lua_engine_899af50_method_vtable_field_off(void);
uint32_t isaac_lua_engine_899af50_method_stack_args(void);
uint32_t isaac_lua_engine_899af50_return_value(void);
enum { ISAAC_LUA_ENGINE_899AFF0_VA = 0x0089aff0u };
enum { ISAAC_LUA_ENGINE_899AFF0_END_VA = 0x0089b08au };
enum { ISAAC_LUA_ENGINE_899AFF0_NEXT_VA = 0x0089b090u };
enum { ISAAC_LUA_ENGINE_899AFF0_STACK_ARGS = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899AFF0_ECX_ARG = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899AFF0_CALLEE_POPS_STACK_ARGS = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899AFF0_IAT_LUA_TOUSERDATA = 0x00b183b0u };
enum { ISAAC_LUA_ENGINE_899AFF0_TOUSERDATA_INDEX_U32 = 0xfff0b9d7u };
enum { ISAAC_LUA_ENGINE_899AFF0_METHOD_VTABLE_FIELD_OFF = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899AFF0_GATE_INVERTED_ENCODING = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899AFF0_IAT_LUA_TYPE = 0x00b18400u };
enum { ISAAC_LUA_ENGINE_899AFF0_CHECKGET_KEY = 0x00c829ddu };
enum { ISAAC_LUA_ENGINE_899AFF0_CHECKGET_INDEX = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899AFF0_CHECKGET_DEF_ARG = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899AFF0_CHECKGET_FIELD_OFF = 0x00000004u };
enum { ISAAC_LUA_ENGINE_899AFF0_CHECKGET_HELPER_VA = 0x0085c590u };
enum { ISAAC_LUA_ENGINE_899AFF0_METHOD_STACK_ARGS = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899AFF0_RETURN_VALUE = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899AFF0_NEWUSERDATA_SIZE = 0x00000018u };
enum { ISAAC_LUA_ENGINE_899AFF0_UD_VTABLE_VA = 0x00b7364cu };
enum { ISAAC_LUA_ENGINE_899AFF0_UD_PTR_FIELD_OFF = 0x00000004u };
enum { ISAAC_LUA_ENGINE_899AFF0_UD_PAYLOAD_BYTES = 0x00000010u };
enum { ISAAC_LUA_ENGINE_899AFF0_REGISTRY_INDEX_U32 = 0xfff0b9d8u };
enum { ISAAC_LUA_ENGINE_899AFF0_METATABLE_RAWGETP_KEY = 0x00c8299bu };
int32_t isaac_lua_engine_899aff0_type1_gate_taken(uint32_t type_result);
uint32_t isaac_lua_engine_899aff0_host_va(void);
uint32_t isaac_lua_engine_899aff0_end_va(void);
uint32_t isaac_lua_engine_899aff0_next_va(void);
uint32_t isaac_lua_engine_899aff0_stack_args(void);
uint32_t isaac_lua_engine_899aff0_ecx_arg(void);
uint32_t isaac_lua_engine_899aff0_callee_pops_stack_args(void);
uint32_t isaac_lua_engine_899aff0_gate_inverted_encoding(void);
uint32_t isaac_lua_engine_899aff0_iat_lua_type(void);
uint32_t isaac_lua_engine_899aff0_checkget_key(void);
uint32_t isaac_lua_engine_899aff0_checkget_index(void);
uint32_t isaac_lua_engine_899aff0_checkget_def_arg(void);
uint32_t isaac_lua_engine_899aff0_checkget_field_off(void);
uint32_t isaac_lua_engine_899aff0_checkget_helper_va(void);
uint32_t isaac_lua_engine_899aff0_iat_lua_touserdata(void);
uint32_t isaac_lua_engine_899aff0_touserdata_index(void);
uint32_t isaac_lua_engine_899aff0_method_vtable_field_off(void);
uint32_t isaac_lua_engine_899aff0_method_stack_args(void);
uint32_t isaac_lua_engine_899aff0_newuserdata_size(void);
uint32_t isaac_lua_engine_899aff0_ud_vtable_va(void);
uint32_t isaac_lua_engine_899aff0_ud_ptr_field_off(void);
uint32_t isaac_lua_engine_899aff0_ud_payload_bytes(void);
uint32_t isaac_lua_engine_899aff0_registry_index(void);
uint32_t isaac_lua_engine_899aff0_metatable_rawgetp_key(void);
uint32_t isaac_lua_engine_899aff0_return_value(void);
enum { ISAAC_LUA_ENGINE_899B090_VA = 0x0089b090u };
enum { ISAAC_LUA_ENGINE_899B090_END_VA = 0x0089b133u };
enum { ISAAC_LUA_ENGINE_899B090_NEXT_VA = 0x0089b140u };
enum { ISAAC_LUA_ENGINE_899B090_STACK_ARGS = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899B090_ECX_ARG = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899B090_CALLEE_POPS_STACK_ARGS = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899B090_ALIGNED_PROLOGUE = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899B090_GATE_INVERTED_ENCODING = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899B090_TYPE_GATES = 0x00000002u };
enum { ISAAC_LUA_ENGINE_899B090_IAT_LUA_TYPE = 0x00b18400u };
enum { ISAAC_LUA_ENGINE_899B090_CHECKGET_KEY = 0x00c829d7u };
enum { ISAAC_LUA_ENGINE_899B090_CHECKGET_INDEX = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899B090_CHECKGET_DEF_ARG = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899B090_CHECKGET_FIELD_OFF = 0x00000004u };
enum { ISAAC_LUA_ENGINE_899B090_CHECKGET_HELPER_VA = 0x0085c590u };
enum { ISAAC_LUA_ENGINE_899B090_IAT_LUA_TOUSERDATA = 0x00b183b0u };
enum { ISAAC_LUA_ENGINE_899B090_TOUSERDATA_INDEX_U32 = 0xfff0b9d7u };
enum { ISAAC_LUA_ENGINE_899B090_METHOD_VTABLE_FIELD_OFF = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899B090_METHOD_STACK_ARGS = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899B090_NIL_PATH_METHOD_ARG = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899B090_WRAP_CHECKGET_KEY = 0x00c8297au };
enum { ISAAC_LUA_ENGINE_899B090_WRAP_CHECKGET_INDEX = 0x00000002u };
enum { ISAAC_LUA_ENGINE_899B090_WRAP_CHECKGET_DEF_ARG = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899B090_RETURN_VALUE = 0x00000000u };
int32_t isaac_lua_engine_899b090_type1_gate_taken(uint32_t type_result);
int32_t isaac_lua_engine_899b090_type2_gate_taken(uint32_t type_result);
uint32_t isaac_lua_engine_899b090_host_va(void);
uint32_t isaac_lua_engine_899b090_end_va(void);
uint32_t isaac_lua_engine_899b090_next_va(void);
uint32_t isaac_lua_engine_899b090_stack_args(void);
uint32_t isaac_lua_engine_899b090_ecx_arg(void);
uint32_t isaac_lua_engine_899b090_callee_pops_stack_args(void);
uint32_t isaac_lua_engine_899b090_aligned_prologue(void);
uint32_t isaac_lua_engine_899b090_gate_inverted_encoding(void);
uint32_t isaac_lua_engine_899b090_type_gates(void);
uint32_t isaac_lua_engine_899b090_iat_lua_type(void);
uint32_t isaac_lua_engine_899b090_checkget_key(void);
uint32_t isaac_lua_engine_899b090_checkget_index(void);
uint32_t isaac_lua_engine_899b090_checkget_def_arg(void);
uint32_t isaac_lua_engine_899b090_checkget_field_off(void);
uint32_t isaac_lua_engine_899b090_checkget_helper_va(void);
uint32_t isaac_lua_engine_899b090_iat_lua_touserdata(void);
uint32_t isaac_lua_engine_899b090_touserdata_index(void);
uint32_t isaac_lua_engine_899b090_method_vtable_field_off(void);
uint32_t isaac_lua_engine_899b090_method_stack_args(void);
uint32_t isaac_lua_engine_899b090_nil_path_method_arg(void);
uint32_t isaac_lua_engine_899b090_wrap_checkget_key(void);
uint32_t isaac_lua_engine_899b090_wrap_checkget_index(void);
uint32_t isaac_lua_engine_899b090_wrap_checkget_def_arg(void);
uint32_t isaac_lua_engine_899b090_return_value(void);
enum { ISAAC_LUA_ENGINE_899B140_VA = 0x0089b140u };
enum { ISAAC_LUA_ENGINE_899B140_END_VA = 0x0089b1dbu };
enum { ISAAC_LUA_ENGINE_899B140_NEXT_VA = 0x0089b1e0u };
enum { ISAAC_LUA_ENGINE_899B140_STACK_ARGS = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899B140_ECX_ARG = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899B140_CALLEE_POPS_STACK_ARGS = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899B140_ALIGNED_PROLOGUE = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899B140_GATE_INVERTED_ENCODING = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899B140_TYPE_GATES = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899B140_IAT_LUA_TYPE = 0x00b18400u };
enum { ISAAC_LUA_ENGINE_899B140_CHECKGET_KEY = 0x00c829d7u };
enum { ISAAC_LUA_ENGINE_899B140_CHECKGET_INDEX = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899B140_CHECKGET_DEF_ARG = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899B140_CHECKGET_FIELD_OFF = 0x00000004u };
enum { ISAAC_LUA_ENGINE_899B140_CHECKGET_HELPER_VA = 0x0085c590u };
enum { ISAAC_LUA_ENGINE_899B140_IAT_LUA_TOUSERDATA = 0x00b183b0u };
enum { ISAAC_LUA_ENGINE_899B140_TOUSERDATA_INDEX_U32 = 0xfff0b9d7u };
enum { ISAAC_LUA_ENGINE_899B140_METHOD_VTABLE_FIELD_OFF = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899B140_METHOD_STACK_ARGS = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899B140_IAT_LUA_PUSHNIL = 0x00b183e0u };
enum { ISAAC_LUA_ENGINE_899B140_NEWUSERDATA_SIZE = 0x00000008u };
enum { ISAAC_LUA_ENGINE_899B140_UD_VTABLE_VA = 0x00b753c8u };
enum { ISAAC_LUA_ENGINE_899B140_UD_PTR_FIELD_OFF = 0x00000004u };
enum { ISAAC_LUA_ENGINE_899B140_REGISTRY_INDEX_U32 = 0xfff0b9d8u };
enum { ISAAC_LUA_ENGINE_899B140_METATABLE_RAWGETP_KEY = 0x00c8297au };
enum { ISAAC_LUA_ENGINE_899B140_IAT_LUA_RAWGETP = 0x00b183bcu };
enum { ISAAC_LUA_ENGINE_899B140_IAT_LUA_SETMETATABLE = 0x00b18398u };
enum { ISAAC_LUA_ENGINE_899B140_SETMETATABLE_INDEX_U32 = 0xfffffffeu };
enum { ISAAC_LUA_ENGINE_899B140_RETURN_VALUE = 0x00000001u };
int32_t isaac_lua_engine_899b140_type1_gate_taken(uint32_t type_result);
uint32_t isaac_lua_engine_899b140_host_va(void);
uint32_t isaac_lua_engine_899b140_end_va(void);
uint32_t isaac_lua_engine_899b140_next_va(void);
uint32_t isaac_lua_engine_899b140_stack_args(void);
uint32_t isaac_lua_engine_899b140_ecx_arg(void);
uint32_t isaac_lua_engine_899b140_callee_pops_stack_args(void);
uint32_t isaac_lua_engine_899b140_aligned_prologue(void);
uint32_t isaac_lua_engine_899b140_gate_inverted_encoding(void);
uint32_t isaac_lua_engine_899b140_type_gates(void);
uint32_t isaac_lua_engine_899b140_iat_lua_type(void);
uint32_t isaac_lua_engine_899b140_checkget_key(void);
uint32_t isaac_lua_engine_899b140_checkget_index(void);
uint32_t isaac_lua_engine_899b140_checkget_def_arg(void);
uint32_t isaac_lua_engine_899b140_checkget_field_off(void);
uint32_t isaac_lua_engine_899b140_checkget_helper_va(void);
uint32_t isaac_lua_engine_899b140_iat_lua_touserdata(void);
uint32_t isaac_lua_engine_899b140_touserdata_index(void);
uint32_t isaac_lua_engine_899b140_method_vtable_field_off(void);
uint32_t isaac_lua_engine_899b140_method_stack_args(void);
uint32_t isaac_lua_engine_899b140_iat_lua_pushnil(void);
uint32_t isaac_lua_engine_899b140_newuserdata_size(void);
uint32_t isaac_lua_engine_899b140_ud_vtable_va(void);
uint32_t isaac_lua_engine_899b140_ud_ptr_field_off(void);
uint32_t isaac_lua_engine_899b140_registry_index(void);
uint32_t isaac_lua_engine_899b140_metatable_rawgetp_key(void);
uint32_t isaac_lua_engine_899b140_iat_lua_rawgetp(void);
uint32_t isaac_lua_engine_899b140_iat_lua_setmetatable(void);
uint32_t isaac_lua_engine_899b140_setmetatable_index(void);
uint32_t isaac_lua_engine_899b140_return_value(void);
enum { ISAAC_LUA_ENGINE_899B1E0_VA = 0x0089b1e0u };
enum { ISAAC_LUA_ENGINE_899B1E0_END_VA = 0x0089b27bu };
enum { ISAAC_LUA_ENGINE_899B1E0_NEXT_VA = 0x0089b280u };
enum { ISAAC_LUA_ENGINE_899B1E0_STACK_ARGS = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899B1E0_ECX_ARG = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899B1E0_CALLEE_POPS_STACK_ARGS = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899B1E0_ALIGNED_PROLOGUE = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899B1E0_GATE_INVERTED_ENCODING = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899B1E0_TYPE_GATES = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899B1E0_IAT_LUA_TYPE = 0x00b18400u };
enum { ISAAC_LUA_ENGINE_899B1E0_CHECKGET_KEY = 0x00c829d7u };
enum { ISAAC_LUA_ENGINE_899B1E0_CHECKGET_INDEX = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899B1E0_CHECKGET_DEF_ARG = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899B1E0_CHECKGET_FIELD_OFF = 0x00000004u };
enum { ISAAC_LUA_ENGINE_899B1E0_CHECKGET_HELPER_VA = 0x0085c590u };
enum { ISAAC_LUA_ENGINE_899B1E0_IAT_LUA_TOUSERDATA = 0x00b183b0u };
enum { ISAAC_LUA_ENGINE_899B1E0_TOUSERDATA_INDEX_U32 = 0xfff0b9d7u };
enum { ISAAC_LUA_ENGINE_899B1E0_METHOD_VTABLE_FIELD_OFF = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899B1E0_METHOD_STACK_ARGS = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899B1E0_IAT_LUA_PUSHNIL = 0x00b183e0u };
enum { ISAAC_LUA_ENGINE_899B1E0_NEWUSERDATA_SIZE = 0x00000008u };
enum { ISAAC_LUA_ENGINE_899B1E0_UD_VTABLE_VA = 0x00b753c8u };
enum { ISAAC_LUA_ENGINE_899B1E0_UD_PTR_FIELD_OFF = 0x00000004u };
enum { ISAAC_LUA_ENGINE_899B1E0_REGISTRY_INDEX_U32 = 0xfff0b9d8u };
enum { ISAAC_LUA_ENGINE_899B1E0_METATABLE_RAWGETP_KEY = 0x00c829d7u };
enum { ISAAC_LUA_ENGINE_899B1E0_IAT_LUA_RAWGETP = 0x00b183bcu };
enum { ISAAC_LUA_ENGINE_899B1E0_IAT_LUA_SETMETATABLE = 0x00b18398u };
enum { ISAAC_LUA_ENGINE_899B1E0_SETMETATABLE_INDEX_U32 = 0xfffffffeu };
enum { ISAAC_LUA_ENGINE_899B1E0_RETURN_VALUE = 0x00000001u };
int32_t isaac_lua_engine_899b1e0_type1_gate_taken(uint32_t type_result);
uint32_t isaac_lua_engine_899b1e0_host_va(void);
uint32_t isaac_lua_engine_899b1e0_end_va(void);
uint32_t isaac_lua_engine_899b1e0_next_va(void);
uint32_t isaac_lua_engine_899b1e0_stack_args(void);
uint32_t isaac_lua_engine_899b1e0_ecx_arg(void);
uint32_t isaac_lua_engine_899b1e0_callee_pops_stack_args(void);
uint32_t isaac_lua_engine_899b1e0_aligned_prologue(void);
uint32_t isaac_lua_engine_899b1e0_gate_inverted_encoding(void);
uint32_t isaac_lua_engine_899b1e0_type_gates(void);
uint32_t isaac_lua_engine_899b1e0_iat_lua_type(void);
uint32_t isaac_lua_engine_899b1e0_checkget_key(void);
uint32_t isaac_lua_engine_899b1e0_checkget_index(void);
uint32_t isaac_lua_engine_899b1e0_checkget_def_arg(void);
uint32_t isaac_lua_engine_899b1e0_checkget_field_off(void);
uint32_t isaac_lua_engine_899b1e0_checkget_helper_va(void);
uint32_t isaac_lua_engine_899b1e0_iat_lua_touserdata(void);
uint32_t isaac_lua_engine_899b1e0_touserdata_index(void);
uint32_t isaac_lua_engine_899b1e0_method_vtable_field_off(void);
uint32_t isaac_lua_engine_899b1e0_method_stack_args(void);
uint32_t isaac_lua_engine_899b1e0_iat_lua_pushnil(void);
uint32_t isaac_lua_engine_899b1e0_newuserdata_size(void);
uint32_t isaac_lua_engine_899b1e0_ud_vtable_va(void);
uint32_t isaac_lua_engine_899b1e0_ud_ptr_field_off(void);
uint32_t isaac_lua_engine_899b1e0_registry_index(void);
uint32_t isaac_lua_engine_899b1e0_metatable_rawgetp_key(void);
uint32_t isaac_lua_engine_899b1e0_iat_lua_rawgetp(void);
uint32_t isaac_lua_engine_899b1e0_iat_lua_setmetatable(void);
uint32_t isaac_lua_engine_899b1e0_setmetatable_index(void);
uint32_t isaac_lua_engine_899b1e0_return_value(void);
enum { ISAAC_LUA_ENGINE_899B280_VA = 0x0089b280u };
enum { ISAAC_LUA_ENGINE_899B280_END_VA = 0x0089b302u };
enum { ISAAC_LUA_ENGINE_899B280_NEXT_VA = 0x0089b310u };
enum { ISAAC_LUA_ENGINE_899B280_STACK_ARGS = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899B280_ECX_ARG = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899B280_CALLEE_POPS_STACK_ARGS = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899B280_ALIGNED_PROLOGUE = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899B280_GATE_INVERTED_ENCODING = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899B280_TYPE_GATES = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899B280_IAT_LUA_TYPE = 0x00b18400u };
enum { ISAAC_LUA_ENGINE_899B280_CHECKGET_KEY = 0x00c829d7u };
enum { ISAAC_LUA_ENGINE_899B280_CHECKGET_INDEX = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899B280_CHECKGET_DEF_ARG = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899B280_CHECKGET_FIELD_OFF = 0x00000004u };
enum { ISAAC_LUA_ENGINE_899B280_CHECKGET_HELPER_VA = 0x0085c590u };
enum { ISAAC_LUA_ENGINE_899B280_IAT_LUA_TOUSERDATA = 0x00b183b0u };
enum { ISAAC_LUA_ENGINE_899B280_TOUSERDATA_INDEX_U32 = 0xfff0b9d7u };
enum { ISAAC_LUA_ENGINE_899B280_METHOD_VTABLE_FIELD_OFF = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899B280_METHOD_STACK_ARGS = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899B280_FLOAT_LANE = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899B280_IAT_LUA_CHECKNUMBER = 0x00b18324u };
enum { ISAAC_LUA_ENGINE_899B280_CHECKNUMBER_INDEX = 0x00000002u };
enum { ISAAC_LUA_ENGINE_899B280_RETURN_VALUE = 0x00000000u };
int32_t isaac_lua_engine_899b280_type1_gate_taken(uint32_t type_result);
uint32_t isaac_lua_engine_899b280_host_va(void);
uint32_t isaac_lua_engine_899b280_end_va(void);
uint32_t isaac_lua_engine_899b280_next_va(void);
uint32_t isaac_lua_engine_899b280_stack_args(void);
uint32_t isaac_lua_engine_899b280_ecx_arg(void);
uint32_t isaac_lua_engine_899b280_callee_pops_stack_args(void);
uint32_t isaac_lua_engine_899b280_aligned_prologue(void);
uint32_t isaac_lua_engine_899b280_gate_inverted_encoding(void);
uint32_t isaac_lua_engine_899b280_type_gates(void);
uint32_t isaac_lua_engine_899b280_iat_lua_type(void);
uint32_t isaac_lua_engine_899b280_checkget_key(void);
uint32_t isaac_lua_engine_899b280_checkget_index(void);
uint32_t isaac_lua_engine_899b280_checkget_def_arg(void);
uint32_t isaac_lua_engine_899b280_checkget_field_off(void);
uint32_t isaac_lua_engine_899b280_checkget_helper_va(void);
uint32_t isaac_lua_engine_899b280_iat_lua_touserdata(void);
uint32_t isaac_lua_engine_899b280_touserdata_index(void);
uint32_t isaac_lua_engine_899b280_method_vtable_field_off(void);
uint32_t isaac_lua_engine_899b280_method_stack_args(void);
uint32_t isaac_lua_engine_899b280_float_lane(void);
uint32_t isaac_lua_engine_899b280_iat_lua_checknumber(void);
uint32_t isaac_lua_engine_899b280_checknumber_index(void);
uint32_t isaac_lua_engine_899b280_return_value(void);
enum { ISAAC_LUA_ENGINE_899B310_VA = 0x0089b310u };
enum { ISAAC_LUA_ENGINE_899B310_END_VA = 0x0089b379u };
enum { ISAAC_LUA_ENGINE_899B310_NEXT_VA = 0x0089b380u };
enum { ISAAC_LUA_ENGINE_899B310_STACK_ARGS = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899B310_ECX_ARG = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899B310_CALLEE_POPS_STACK_ARGS = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899B310_ALIGNED_PROLOGUE = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899B310_GATE_INVERTED_ENCODING = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899B310_TYPE_GATES = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899B310_IAT_LUA_TYPE = 0x00b18400u };
enum { ISAAC_LUA_ENGINE_899B310_CHECKGET_KEY = 0x00c829d7u };
enum { ISAAC_LUA_ENGINE_899B310_CHECKGET_INDEX = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899B310_CHECKGET_DEF_ARG = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899B310_CHECKGET_FIELD_OFF = 0x00000004u };
enum { ISAAC_LUA_ENGINE_899B310_CHECKGET_HELPER_VA = 0x0085c590u };
enum { ISAAC_LUA_ENGINE_899B310_IAT_LUA_TOUSERDATA = 0x00b183b0u };
enum { ISAAC_LUA_ENGINE_899B310_TOUSERDATA_INDEX_U32 = 0xfff0b9d7u };
enum { ISAAC_LUA_ENGINE_899B310_METHOD_VTABLE_FIELD_OFF = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899B310_METHOD_STACK_ARGS = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899B310_FLOAT_LANE = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899B310_FLOAT_PUSHER_HELPER_VA = 0x0085c050u };
enum { ISAAC_LUA_ENGINE_899B310_RETURN_VALUE = 0x00000001u };
int32_t isaac_lua_engine_899b310_type1_gate_taken(uint32_t type_result);
uint32_t isaac_lua_engine_899b310_host_va(void);
uint32_t isaac_lua_engine_899b310_end_va(void);
uint32_t isaac_lua_engine_899b310_next_va(void);
uint32_t isaac_lua_engine_899b310_stack_args(void);
uint32_t isaac_lua_engine_899b310_ecx_arg(void);
uint32_t isaac_lua_engine_899b310_callee_pops_stack_args(void);
uint32_t isaac_lua_engine_899b310_aligned_prologue(void);
uint32_t isaac_lua_engine_899b310_gate_inverted_encoding(void);
uint32_t isaac_lua_engine_899b310_type_gates(void);
uint32_t isaac_lua_engine_899b310_iat_lua_type(void);
uint32_t isaac_lua_engine_899b310_checkget_key(void);
uint32_t isaac_lua_engine_899b310_checkget_index(void);
uint32_t isaac_lua_engine_899b310_checkget_def_arg(void);
uint32_t isaac_lua_engine_899b310_checkget_field_off(void);
uint32_t isaac_lua_engine_899b310_checkget_helper_va(void);
uint32_t isaac_lua_engine_899b310_iat_lua_touserdata(void);
uint32_t isaac_lua_engine_899b310_touserdata_index(void);
uint32_t isaac_lua_engine_899b310_method_vtable_field_off(void);
uint32_t isaac_lua_engine_899b310_method_stack_args(void);
uint32_t isaac_lua_engine_899b310_float_lane(void);
uint32_t isaac_lua_engine_899b310_float_pusher_helper_va(void);
uint32_t isaac_lua_engine_899b310_return_value(void);
enum { ISAAC_LUA_ENGINE_899B380_VA = 0x0089b380u };
enum { ISAAC_LUA_ENGINE_899B380_END_VA = 0x0089b533u };
enum { ISAAC_LUA_ENGINE_899B380_NEXT_VA = 0x0089b540u };
enum { ISAAC_LUA_ENGINE_899B380_STACK_ARGS = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899B380_ECX_ARG = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899B380_CALLEE_POPS_STACK_ARGS = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899B380_ALIGNED_PROLOGUE = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899B380_ALIGN_MASK = 0xfffffff0u };
enum { ISAAC_LUA_ENGINE_899B380_PRE_GATE_TOUSERDATA = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899B380_IAT_LUA_TOUSERDATA = 0x00b183b0u };
enum { ISAAC_LUA_ENGINE_899B380_TOUSERDATA_INDEX_U32 = 0xfff0b9d7u };
enum { ISAAC_LUA_ENGINE_899B380_UD_FN_POINTER_CALL = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899B380_TYPE_GATES = 0x00000002u };
enum { ISAAC_LUA_ENGINE_899B380_IAT_LUA_TYPE = 0x00b18400u };
enum { ISAAC_LUA_ENGINE_899B380_TYPE_IAT_VIA_REGISTER = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899B380_ARG3_GATE_INVERTED_ENCODING = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899B380_ARG2_GATE_INVERTED_ENCODING = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899B380_IAT_LUA_CHECKNUMBER = 0x00b18324u };
enum { ISAAC_LUA_ENGINE_899B380_CHECKNUMBER_INDEX = 0x00000005u };
enum { ISAAC_LUA_ENGINE_899B380_IAT_LUA_TOBOOLEAN = 0x00b183e8u };
enum { ISAAC_LUA_ENGINE_899B380_TOBOOLEAN_INDEX = 0x00000004u };
enum { ISAAC_LUA_ENGINE_899B380_VECTOR_CHECKGET_KEY = 0x00c82980u };
enum { ISAAC_LUA_ENGINE_899B380_VECTOR_CHECKGET_INDEX = 0x00000003u };
enum { ISAAC_LUA_ENGINE_899B380_VECTOR_CHECKGET_DEF_ARG = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899B380_WRAP_CHECKGET_KEY = 0x00c8297au };
enum { ISAAC_LUA_ENGINE_899B380_WRAP_CHECKGET_INDEX = 0x00000002u };
enum { ISAAC_LUA_ENGINE_899B380_WRAP_CHECKGET_DEF_ARG = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899B380_CHECKGET_FIELD_OFF = 0x00000004u };
enum { ISAAC_LUA_ENGINE_899B380_CHECKGET_HELPER_VA = 0x0085c590u };
enum { ISAAC_LUA_ENGINE_899B380_WRAP_CTOR_VA = 0x008baa50u };
enum { ISAAC_LUA_ENGINE_899B380_METHOD_STACK_ARGS = 0x00000006u };
enum { ISAAC_LUA_ENGINE_899B380_METHOD_SRET_OUT = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899B380_METHOD_FLOAT_COMPONENTS = 0x00000004u };
enum { ISAAC_LUA_ENGINE_899B380_METHOD_CALLER_CLEANUP = 0x00000018u };
enum { ISAAC_LUA_ENGINE_899B380_IAT_LUA_PUSHNIL = 0x00b183e0u };
enum { ISAAC_LUA_ENGINE_899B380_NEWUSERDATA_SIZE = 0x00000008u };
enum { ISAAC_LUA_ENGINE_899B380_UD_VTABLE_VA = 0x00b753c8u };
enum { ISAAC_LUA_ENGINE_899B380_UD_PTR_FIELD_OFF = 0x00000004u };
enum { ISAAC_LUA_ENGINE_899B380_REGISTRY_INDEX_U32 = 0xfff0b9d8u };
enum { ISAAC_LUA_ENGINE_899B380_METATABLE_RAWGETP_KEY = 0x00c829d7u };
enum { ISAAC_LUA_ENGINE_899B380_IAT_LUA_RAWGETP = 0x00b183bcu };
enum { ISAAC_LUA_ENGINE_899B380_IAT_LUA_SETMETATABLE = 0x00b18398u };
enum { ISAAC_LUA_ENGINE_899B380_SETMETATABLE_INDEX_U32 = 0xfffffffeu };
enum { ISAAC_LUA_ENGINE_899B380_RETURN_VALUE = 0x00000001u };
int32_t isaac_lua_engine_899b380_type3_gate_taken(uint32_t type_result);
int32_t isaac_lua_engine_899b380_type2_gate_taken(uint32_t type_result);
uint32_t isaac_lua_engine_899b380_host_va(void);
uint32_t isaac_lua_engine_899b380_end_va(void);
uint32_t isaac_lua_engine_899b380_next_va(void);
uint32_t isaac_lua_engine_899b380_stack_args(void);
uint32_t isaac_lua_engine_899b380_ecx_arg(void);
uint32_t isaac_lua_engine_899b380_callee_pops_stack_args(void);
uint32_t isaac_lua_engine_899b380_aligned_prologue(void);
uint32_t isaac_lua_engine_899b380_align_mask(void);
uint32_t isaac_lua_engine_899b380_pre_gate_touserdata(void);
uint32_t isaac_lua_engine_899b380_iat_lua_touserdata(void);
uint32_t isaac_lua_engine_899b380_touserdata_index(void);
uint32_t isaac_lua_engine_899b380_ud_fn_pointer_call(void);
uint32_t isaac_lua_engine_899b380_type_gates(void);
uint32_t isaac_lua_engine_899b380_iat_lua_type(void);
uint32_t isaac_lua_engine_899b380_type_iat_via_register(void);
uint32_t isaac_lua_engine_899b380_arg3_gate_inverted_encoding(void);
uint32_t isaac_lua_engine_899b380_arg2_gate_inverted_encoding(void);
uint32_t isaac_lua_engine_899b380_iat_lua_checknumber(void);
uint32_t isaac_lua_engine_899b380_checknumber_index(void);
uint32_t isaac_lua_engine_899b380_iat_lua_toboolean(void);
uint32_t isaac_lua_engine_899b380_toboolean_index(void);
uint32_t isaac_lua_engine_899b380_vector_checkget_key(void);
uint32_t isaac_lua_engine_899b380_vector_checkget_index(void);
uint32_t isaac_lua_engine_899b380_vector_checkget_def_arg(void);
uint32_t isaac_lua_engine_899b380_wrap_checkget_key(void);
uint32_t isaac_lua_engine_899b380_wrap_checkget_index(void);
uint32_t isaac_lua_engine_899b380_wrap_checkget_def_arg(void);
uint32_t isaac_lua_engine_899b380_checkget_field_off(void);
uint32_t isaac_lua_engine_899b380_checkget_helper_va(void);
uint32_t isaac_lua_engine_899b380_wrap_ctor_va(void);
uint32_t isaac_lua_engine_899b380_method_stack_args(void);
uint32_t isaac_lua_engine_899b380_method_sret_out(void);
uint32_t isaac_lua_engine_899b380_method_float_components(void);
uint32_t isaac_lua_engine_899b380_method_caller_cleanup(void);
uint32_t isaac_lua_engine_899b380_iat_lua_pushnil(void);
uint32_t isaac_lua_engine_899b380_newuserdata_size(void);
uint32_t isaac_lua_engine_899b380_ud_vtable_va(void);
uint32_t isaac_lua_engine_899b380_ud_ptr_field_off(void);
uint32_t isaac_lua_engine_899b380_registry_index(void);
uint32_t isaac_lua_engine_899b380_metatable_rawgetp_key(void);
uint32_t isaac_lua_engine_899b380_iat_lua_rawgetp(void);
uint32_t isaac_lua_engine_899b380_iat_lua_setmetatable(void);
uint32_t isaac_lua_engine_899b380_setmetatable_index(void);
uint32_t isaac_lua_engine_899b380_return_value(void);
enum { ISAAC_LUA_ENGINE_899B540_VA = 0x0089b540u };
enum { ISAAC_LUA_ENGINE_899B540_END_VA = 0x0089b5a9u };
enum { ISAAC_LUA_ENGINE_899B540_NEXT_VA = 0x0089b5b0u };
enum { ISAAC_LUA_ENGINE_899B540_STACK_ARGS = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899B540_ECX_ARG = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899B540_CALLEE_POPS_STACK_ARGS = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899B540_ALIGNED_PROLOGUE = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899B540_GATE_INVERTED_ENCODING = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899B540_TYPE_GATES = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899B540_IAT_LUA_TYPE = 0x00b18400u };
enum { ISAAC_LUA_ENGINE_899B540_CHECKGET_KEY = 0x00c829d7u };
enum { ISAAC_LUA_ENGINE_899B540_CHECKGET_INDEX = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899B540_CHECKGET_DEF_ARG = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899B540_CHECKGET_FIELD_OFF = 0x00000004u };
enum { ISAAC_LUA_ENGINE_899B540_CHECKGET_HELPER_VA = 0x0085c590u };
enum { ISAAC_LUA_ENGINE_899B540_IAT_LUA_TOUSERDATA = 0x00b183b0u };
enum { ISAAC_LUA_ENGINE_899B540_TOUSERDATA_INDEX_U32 = 0xfff0b9d7u };
enum { ISAAC_LUA_ENGINE_899B540_UD_FN_POINTER_CALL = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899B540_METHOD_STACK_ARGS = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899B540_IAT_LUA_TOBOOLEAN = 0x00b183e8u };
enum { ISAAC_LUA_ENGINE_899B540_TOBOOLEAN_INDEX = 0x00000002u };
enum { ISAAC_LUA_ENGINE_899B540_BOOL_ARG_SETNE = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899B540_RETURN_VALUE = 0x00000000u };
int32_t isaac_lua_engine_899b540_type1_gate_taken(uint32_t type_result);
uint32_t isaac_lua_engine_899b540_host_va(void);
uint32_t isaac_lua_engine_899b540_end_va(void);
uint32_t isaac_lua_engine_899b540_next_va(void);
uint32_t isaac_lua_engine_899b540_stack_args(void);
uint32_t isaac_lua_engine_899b540_ecx_arg(void);
uint32_t isaac_lua_engine_899b540_callee_pops_stack_args(void);
uint32_t isaac_lua_engine_899b540_aligned_prologue(void);
uint32_t isaac_lua_engine_899b540_gate_inverted_encoding(void);
uint32_t isaac_lua_engine_899b540_type_gates(void);
uint32_t isaac_lua_engine_899b540_iat_lua_type(void);
uint32_t isaac_lua_engine_899b540_checkget_key(void);
uint32_t isaac_lua_engine_899b540_checkget_index(void);
uint32_t isaac_lua_engine_899b540_checkget_def_arg(void);
uint32_t isaac_lua_engine_899b540_checkget_field_off(void);
uint32_t isaac_lua_engine_899b540_checkget_helper_va(void);
uint32_t isaac_lua_engine_899b540_iat_lua_touserdata(void);
uint32_t isaac_lua_engine_899b540_touserdata_index(void);
uint32_t isaac_lua_engine_899b540_ud_fn_pointer_call(void);
uint32_t isaac_lua_engine_899b540_method_stack_args(void);
uint32_t isaac_lua_engine_899b540_iat_lua_toboolean(void);
uint32_t isaac_lua_engine_899b540_toboolean_index(void);
uint32_t isaac_lua_engine_899b540_bool_arg_setne(void);
uint32_t isaac_lua_engine_899b540_return_value(void);
enum { ISAAC_LUA_ENGINE_899B5B0_VA = 0x0089b5b0u };
enum { ISAAC_LUA_ENGINE_899B5B0_END_VA = 0x0089b615u };
enum { ISAAC_LUA_ENGINE_899B5B0_NEXT_VA = 0x0089b620u };
enum { ISAAC_LUA_ENGINE_899B5B0_STACK_ARGS = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899B5B0_ECX_ARG = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899B5B0_CALLEE_POPS_STACK_ARGS = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899B5B0_ALIGNED_PROLOGUE = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899B5B0_GATE_INVERTED_ENCODING = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899B5B0_TYPE_GATES = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899B5B0_IAT_LUA_TYPE = 0x00b18400u };
enum { ISAAC_LUA_ENGINE_899B5B0_CHECKGET_KEY = 0x00c829d7u };
enum { ISAAC_LUA_ENGINE_899B5B0_CHECKGET_INDEX = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899B5B0_CHECKGET_DEF_ARG = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899B5B0_CHECKGET_FIELD_OFF = 0x00000004u };
enum { ISAAC_LUA_ENGINE_899B5B0_CHECKGET_HELPER_VA = 0x0085c590u };
enum { ISAAC_LUA_ENGINE_899B5B0_IAT_LUA_TOUSERDATA = 0x00b183b0u };
enum { ISAAC_LUA_ENGINE_899B5B0_TOUSERDATA_INDEX_U32 = 0xfff0b9d7u };
enum { ISAAC_LUA_ENGINE_899B5B0_UD_FN_POINTER_CALL = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899B5B0_METHOD_STACK_ARGS = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899B5B0_METHOD_RESULT_LOW_BYTE_GATE = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899B5B0_IAT_LUA_PUSHBOOLEAN = 0x00b183ecu };
enum { ISAAC_LUA_ENGINE_899B5B0_RETURN_VALUE = 0x00000001u };
int32_t isaac_lua_engine_899b5b0_type1_gate_taken(uint32_t type_result);
uint32_t isaac_lua_engine_899b5b0_host_va(void);
uint32_t isaac_lua_engine_899b5b0_end_va(void);
uint32_t isaac_lua_engine_899b5b0_next_va(void);
uint32_t isaac_lua_engine_899b5b0_stack_args(void);
uint32_t isaac_lua_engine_899b5b0_ecx_arg(void);
uint32_t isaac_lua_engine_899b5b0_callee_pops_stack_args(void);
uint32_t isaac_lua_engine_899b5b0_aligned_prologue(void);
uint32_t isaac_lua_engine_899b5b0_gate_inverted_encoding(void);
uint32_t isaac_lua_engine_899b5b0_type_gates(void);
uint32_t isaac_lua_engine_899b5b0_iat_lua_type(void);
uint32_t isaac_lua_engine_899b5b0_checkget_key(void);
uint32_t isaac_lua_engine_899b5b0_checkget_index(void);
uint32_t isaac_lua_engine_899b5b0_checkget_def_arg(void);
uint32_t isaac_lua_engine_899b5b0_checkget_field_off(void);
uint32_t isaac_lua_engine_899b5b0_checkget_helper_va(void);
uint32_t isaac_lua_engine_899b5b0_iat_lua_touserdata(void);
uint32_t isaac_lua_engine_899b5b0_touserdata_index(void);
uint32_t isaac_lua_engine_899b5b0_ud_fn_pointer_call(void);
uint32_t isaac_lua_engine_899b5b0_method_stack_args(void);
uint32_t isaac_lua_engine_899b5b0_method_result_low_byte_gate(void);
uint32_t isaac_lua_engine_899b5b0_iat_lua_pushboolean(void);
uint32_t isaac_lua_engine_899b5b0_return_value(void);
enum { ISAAC_LUA_ENGINE_899B620_VA = 0x0089b620u };
enum { ISAAC_LUA_ENGINE_899B620_END_VA = 0x0089b68du };
enum { ISAAC_LUA_ENGINE_899B620_NEXT_VA = 0x0089b690u };
enum { ISAAC_LUA_ENGINE_899B620_STACK_ARGS = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899B620_ECX_ARG = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899B620_CALLEE_POPS_STACK_ARGS = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899B620_ALIGNED_PROLOGUE = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899B620_GATE_INVERTED_ENCODING = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899B620_TYPE_GATES = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899B620_IAT_LUA_TYPE = 0x00b18400u };
enum { ISAAC_LUA_ENGINE_899B620_CHECKGET_KEY = 0x00c829d4u };
enum { ISAAC_LUA_ENGINE_899B620_CHECKGET_INDEX = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899B620_CHECKGET_DEF_ARG = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899B620_CHECKGET_FIELD_OFF = 0x00000004u };
enum { ISAAC_LUA_ENGINE_899B620_CHECKGET_HELPER_VA = 0x0085c590u };
enum { ISAAC_LUA_ENGINE_899B620_IAT_LUA_TOUSERDATA = 0x00b183b0u };
enum { ISAAC_LUA_ENGINE_899B620_TOUSERDATA_INDEX_U32 = 0xfff0b9d7u };
enum { ISAAC_LUA_ENGINE_899B620_UD_FN_POINTER_CALL = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899B620_METHOD_STACK_ARGS = 0x00000002u };
enum { ISAAC_LUA_ENGINE_899B620_METHOD_I64_ARG = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899B620_IAT_LUAL_CHECKINTEGER = 0x00b183f4u };
enum { ISAAC_LUA_ENGINE_899B620_CHECKINTEGER_INDEX = 0x00000002u };
enum { ISAAC_LUA_ENGINE_899B620_RETURN_VALUE = 0x00000000u };
int32_t isaac_lua_engine_899b620_type1_gate_taken(uint32_t type_result);
uint32_t isaac_lua_engine_899b620_host_va(void);
uint32_t isaac_lua_engine_899b620_end_va(void);
uint32_t isaac_lua_engine_899b620_next_va(void);
uint32_t isaac_lua_engine_899b620_stack_args(void);
uint32_t isaac_lua_engine_899b620_ecx_arg(void);
uint32_t isaac_lua_engine_899b620_callee_pops_stack_args(void);
uint32_t isaac_lua_engine_899b620_aligned_prologue(void);
uint32_t isaac_lua_engine_899b620_gate_inverted_encoding(void);
uint32_t isaac_lua_engine_899b620_type_gates(void);
uint32_t isaac_lua_engine_899b620_iat_lua_type(void);
uint32_t isaac_lua_engine_899b620_checkget_key(void);
uint32_t isaac_lua_engine_899b620_checkget_index(void);
uint32_t isaac_lua_engine_899b620_checkget_def_arg(void);
uint32_t isaac_lua_engine_899b620_checkget_field_off(void);
uint32_t isaac_lua_engine_899b620_checkget_helper_va(void);
uint32_t isaac_lua_engine_899b620_iat_lua_touserdata(void);
uint32_t isaac_lua_engine_899b620_touserdata_index(void);
uint32_t isaac_lua_engine_899b620_ud_fn_pointer_call(void);
uint32_t isaac_lua_engine_899b620_method_stack_args(void);
uint32_t isaac_lua_engine_899b620_method_i64_arg(void);
uint32_t isaac_lua_engine_899b620_iat_lual_checkinteger(void);
uint32_t isaac_lua_engine_899b620_checkinteger_index(void);
uint32_t isaac_lua_engine_899b620_return_value(void);
enum { ISAAC_LUA_ENGINE_899B690_VA = 0x0089b690u };
enum { ISAAC_LUA_ENGINE_899B690_END_VA = 0x0089b6efu };
enum { ISAAC_LUA_ENGINE_899B690_NEXT_VA = 0x0089b6f0u };
enum { ISAAC_LUA_ENGINE_899B690_STACK_ARGS = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899B690_ECX_ARG = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899B690_CALLEE_POPS_STACK_ARGS = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899B690_ALIGNED_PROLOGUE = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899B690_GATE_INVERTED_ENCODING = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899B690_TYPE_GATES = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899B690_IAT_LUA_TYPE = 0x00b18400u };
enum { ISAAC_LUA_ENGINE_899B690_CHECKGET_KEY = 0x00c829d4u };
enum { ISAAC_LUA_ENGINE_899B690_CHECKGET_INDEX = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899B690_CHECKGET_DEF_ARG = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899B690_CHECKGET_FIELD_OFF = 0x00000004u };
enum { ISAAC_LUA_ENGINE_899B690_CHECKGET_HELPER_VA = 0x0085c590u };
enum { ISAAC_LUA_ENGINE_899B690_IAT_LUA_TOUSERDATA = 0x00b183b0u };
enum { ISAAC_LUA_ENGINE_899B690_TOUSERDATA_INDEX_U32 = 0xfff0b9d7u };
enum { ISAAC_LUA_ENGINE_899B690_UD_FN_POINTER_CALL = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899B690_METHOD_STACK_ARGS = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899B690_METHOD_I64_RETURN = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899B690_I64_PUSHER_HELPER_VA = 0x0085c030u };
enum { ISAAC_LUA_ENGINE_899B690_RETURN_VALUE = 0x00000001u };
int32_t isaac_lua_engine_899b690_type1_gate_taken(uint32_t type_result);
uint32_t isaac_lua_engine_899b690_host_va(void);
uint32_t isaac_lua_engine_899b690_end_va(void);
uint32_t isaac_lua_engine_899b690_next_va(void);
uint32_t isaac_lua_engine_899b690_stack_args(void);
uint32_t isaac_lua_engine_899b690_ecx_arg(void);
uint32_t isaac_lua_engine_899b690_callee_pops_stack_args(void);
uint32_t isaac_lua_engine_899b690_aligned_prologue(void);
uint32_t isaac_lua_engine_899b690_gate_inverted_encoding(void);
uint32_t isaac_lua_engine_899b690_type_gates(void);
uint32_t isaac_lua_engine_899b690_iat_lua_type(void);
uint32_t isaac_lua_engine_899b690_checkget_key(void);
uint32_t isaac_lua_engine_899b690_checkget_index(void);
uint32_t isaac_lua_engine_899b690_checkget_def_arg(void);
uint32_t isaac_lua_engine_899b690_checkget_field_off(void);
uint32_t isaac_lua_engine_899b690_checkget_helper_va(void);
uint32_t isaac_lua_engine_899b690_iat_lua_touserdata(void);
uint32_t isaac_lua_engine_899b690_touserdata_index(void);
uint32_t isaac_lua_engine_899b690_ud_fn_pointer_call(void);
uint32_t isaac_lua_engine_899b690_method_stack_args(void);
uint32_t isaac_lua_engine_899b690_method_i64_return(void);
uint32_t isaac_lua_engine_899b690_i64_pusher_helper_va(void);
uint32_t isaac_lua_engine_899b690_return_value(void);
enum { ISAAC_LUA_ENGINE_899B6F0_VA = 0x0089b6f0u };
enum { ISAAC_LUA_ENGINE_899B6F0_END_VA = 0x0089b75cu };
enum { ISAAC_LUA_ENGINE_899B6F0_NEXT_VA = 0x0089b760u };
enum { ISAAC_LUA_ENGINE_899B6F0_STACK_ARGS = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899B6F0_ECX_ARG = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899B6F0_CALLEE_POPS_STACK_ARGS = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899B6F0_ALIGNED_PROLOGUE = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899B6F0_GATE_INVERTED_ENCODING = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899B6F0_TYPE_GATES = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899B6F0_IAT_LUA_TYPE = 0x00b18400u };
enum { ISAAC_LUA_ENGINE_899B6F0_CHECKGET_KEY = 0x00c829d4u };
enum { ISAAC_LUA_ENGINE_899B6F0_CHECKGET_INDEX = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899B6F0_CHECKGET_DEF_ARG = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899B6F0_CHECKGET_FIELD_OFF = 0x00000004u };
enum { ISAAC_LUA_ENGINE_899B6F0_CHECKGET_HELPER_VA = 0x0085c590u };
enum { ISAAC_LUA_ENGINE_899B6F0_IAT_LUA_TOUSERDATA = 0x00b183b0u };
enum { ISAAC_LUA_ENGINE_899B6F0_TOUSERDATA_INDEX_U32 = 0xfff0b9d7u };
enum { ISAAC_LUA_ENGINE_899B6F0_UD_FN_POINTER_CALL = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899B6F0_METHOD_STACK_ARGS = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899B6F0_METHOD_I32_ARG = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899B6F0_IAT_LUAL_CHECKINTEGER = 0x00b183f4u };
enum { ISAAC_LUA_ENGINE_899B6F0_CHECKINTEGER_INDEX = 0x00000002u };
enum { ISAAC_LUA_ENGINE_899B6F0_RETURN_VALUE = 0x00000000u };
int32_t isaac_lua_engine_899b6f0_type1_gate_taken(uint32_t type_result);
uint32_t isaac_lua_engine_899b6f0_host_va(void);
uint32_t isaac_lua_engine_899b6f0_end_va(void);
uint32_t isaac_lua_engine_899b6f0_next_va(void);
uint32_t isaac_lua_engine_899b6f0_stack_args(void);
uint32_t isaac_lua_engine_899b6f0_ecx_arg(void);
uint32_t isaac_lua_engine_899b6f0_callee_pops_stack_args(void);
uint32_t isaac_lua_engine_899b6f0_aligned_prologue(void);
uint32_t isaac_lua_engine_899b6f0_gate_inverted_encoding(void);
uint32_t isaac_lua_engine_899b6f0_type_gates(void);
uint32_t isaac_lua_engine_899b6f0_iat_lua_type(void);
uint32_t isaac_lua_engine_899b6f0_checkget_key(void);
uint32_t isaac_lua_engine_899b6f0_checkget_index(void);
uint32_t isaac_lua_engine_899b6f0_checkget_def_arg(void);
uint32_t isaac_lua_engine_899b6f0_checkget_field_off(void);
uint32_t isaac_lua_engine_899b6f0_checkget_helper_va(void);
uint32_t isaac_lua_engine_899b6f0_iat_lua_touserdata(void);
uint32_t isaac_lua_engine_899b6f0_touserdata_index(void);
uint32_t isaac_lua_engine_899b6f0_ud_fn_pointer_call(void);
uint32_t isaac_lua_engine_899b6f0_method_stack_args(void);
uint32_t isaac_lua_engine_899b6f0_method_i32_arg(void);
uint32_t isaac_lua_engine_899b6f0_iat_lual_checkinteger(void);
uint32_t isaac_lua_engine_899b6f0_checkinteger_index(void);
uint32_t isaac_lua_engine_899b6f0_return_value(void);
enum { ISAAC_LUA_ENGINE_899B760_VA = 0x0089b760u };
enum { ISAAC_LUA_ENGINE_899B760_END_VA = 0x0089b7bcu };
enum { ISAAC_LUA_ENGINE_899B760_NEXT_VA = 0x0089b7c0u };
enum { ISAAC_LUA_ENGINE_899B760_STACK_ARGS = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899B760_ECX_ARG = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899B760_CALLEE_POPS_STACK_ARGS = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899B760_ALIGNED_PROLOGUE = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899B760_GATE_INVERTED_ENCODING = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899B760_TYPE_GATES = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899B760_IAT_LUA_TYPE = 0x00b18400u };
enum { ISAAC_LUA_ENGINE_899B760_CHECKGET_KEY = 0x00c829d4u };
enum { ISAAC_LUA_ENGINE_899B760_CHECKGET_INDEX = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899B760_CHECKGET_DEF_ARG = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899B760_CHECKGET_FIELD_OFF = 0x00000004u };
enum { ISAAC_LUA_ENGINE_899B760_CHECKGET_HELPER_VA = 0x0085c590u };
enum { ISAAC_LUA_ENGINE_899B760_IAT_LUA_TOUSERDATA = 0x00b183b0u };
enum { ISAAC_LUA_ENGINE_899B760_TOUSERDATA_INDEX_U32 = 0xfff0b9d7u };
enum { ISAAC_LUA_ENGINE_899B760_UD_FN_POINTER_CALL = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899B760_METHOD_STACK_ARGS = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899B760_METHOD_I32_RETURN = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899B760_I32_SEXT_PUSHER_HELPER_VA = 0x0085bfd0u };
enum { ISAAC_LUA_ENGINE_899B760_RETURN_VALUE = 0x00000001u };
int32_t isaac_lua_engine_899b760_type1_gate_taken(uint32_t type_result);
uint32_t isaac_lua_engine_899b760_host_va(void);
uint32_t isaac_lua_engine_899b760_end_va(void);
uint32_t isaac_lua_engine_899b760_next_va(void);
uint32_t isaac_lua_engine_899b760_stack_args(void);
uint32_t isaac_lua_engine_899b760_ecx_arg(void);
uint32_t isaac_lua_engine_899b760_callee_pops_stack_args(void);
uint32_t isaac_lua_engine_899b760_aligned_prologue(void);
uint32_t isaac_lua_engine_899b760_gate_inverted_encoding(void);
uint32_t isaac_lua_engine_899b760_type_gates(void);
uint32_t isaac_lua_engine_899b760_iat_lua_type(void);
uint32_t isaac_lua_engine_899b760_checkget_key(void);
uint32_t isaac_lua_engine_899b760_checkget_index(void);
uint32_t isaac_lua_engine_899b760_checkget_def_arg(void);
uint32_t isaac_lua_engine_899b760_checkget_field_off(void);
uint32_t isaac_lua_engine_899b760_checkget_helper_va(void);
uint32_t isaac_lua_engine_899b760_iat_lua_touserdata(void);
uint32_t isaac_lua_engine_899b760_touserdata_index(void);
uint32_t isaac_lua_engine_899b760_ud_fn_pointer_call(void);
uint32_t isaac_lua_engine_899b760_method_stack_args(void);
uint32_t isaac_lua_engine_899b760_method_i32_return(void);
uint32_t isaac_lua_engine_899b760_i32_sext_pusher_helper_va(void);
uint32_t isaac_lua_engine_899b760_return_value(void);
enum { ISAAC_LUA_ENGINE_899B7C0_VA = 0x0089b7c0u };
enum { ISAAC_LUA_ENGINE_899B7C0_END_VA = 0x0089b842u };
enum { ISAAC_LUA_ENGINE_899B7C0_NEXT_VA = 0x0089b850u };
enum { ISAAC_LUA_ENGINE_899B7C0_STACK_ARGS = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899B7C0_ECX_ARG = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899B7C0_CALLEE_POPS_STACK_ARGS = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899B7C0_ALIGNED_PROLOGUE = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899B7C0_GATE_INVERTED_ENCODING = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899B7C0_TYPE_GATES = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899B7C0_IAT_LUA_TYPE = 0x00b18400u };
enum { ISAAC_LUA_ENGINE_899B7C0_CHECKGET_KEY = 0x00c829d4u };
enum { ISAAC_LUA_ENGINE_899B7C0_CHECKGET_INDEX = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899B7C0_CHECKGET_DEF_ARG = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899B7C0_CHECKGET_FIELD_OFF = 0x00000004u };
enum { ISAAC_LUA_ENGINE_899B7C0_CHECKGET_HELPER_VA = 0x0085c590u };
enum { ISAAC_LUA_ENGINE_899B7C0_IAT_LUA_TOUSERDATA = 0x00b183b0u };
enum { ISAAC_LUA_ENGINE_899B7C0_TOUSERDATA_INDEX_U32 = 0xfff0b9d7u };
enum { ISAAC_LUA_ENGINE_899B7C0_UD_FN_POINTER_CALL = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899B7C0_METHOD_STACK_ARGS = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899B7C0_FLOAT_LANE = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899B7C0_IAT_LUA_CHECKNUMBER = 0x00b18324u };
enum { ISAAC_LUA_ENGINE_899B7C0_CHECKNUMBER_INDEX = 0x00000002u };
enum { ISAAC_LUA_ENGINE_899B7C0_RETURN_VALUE = 0x00000000u };
int32_t isaac_lua_engine_899b7c0_type1_gate_taken(uint32_t type_result);
uint32_t isaac_lua_engine_899b7c0_host_va(void);
uint32_t isaac_lua_engine_899b7c0_end_va(void);
uint32_t isaac_lua_engine_899b7c0_next_va(void);
uint32_t isaac_lua_engine_899b7c0_stack_args(void);
uint32_t isaac_lua_engine_899b7c0_ecx_arg(void);
uint32_t isaac_lua_engine_899b7c0_callee_pops_stack_args(void);
uint32_t isaac_lua_engine_899b7c0_aligned_prologue(void);
uint32_t isaac_lua_engine_899b7c0_gate_inverted_encoding(void);
uint32_t isaac_lua_engine_899b7c0_type_gates(void);
uint32_t isaac_lua_engine_899b7c0_iat_lua_type(void);
uint32_t isaac_lua_engine_899b7c0_checkget_key(void);
uint32_t isaac_lua_engine_899b7c0_checkget_index(void);
uint32_t isaac_lua_engine_899b7c0_checkget_def_arg(void);
uint32_t isaac_lua_engine_899b7c0_checkget_field_off(void);
uint32_t isaac_lua_engine_899b7c0_checkget_helper_va(void);
uint32_t isaac_lua_engine_899b7c0_iat_lua_touserdata(void);
uint32_t isaac_lua_engine_899b7c0_touserdata_index(void);
uint32_t isaac_lua_engine_899b7c0_ud_fn_pointer_call(void);
uint32_t isaac_lua_engine_899b7c0_method_stack_args(void);
uint32_t isaac_lua_engine_899b7c0_float_lane(void);
uint32_t isaac_lua_engine_899b7c0_iat_lua_checknumber(void);
uint32_t isaac_lua_engine_899b7c0_checknumber_index(void);
uint32_t isaac_lua_engine_899b7c0_return_value(void);
enum { ISAAC_LUA_ENGINE_899B850_VA = 0x0089b850u };
enum { ISAAC_LUA_ENGINE_899B850_END_VA = 0x0089b8b9u };
enum { ISAAC_LUA_ENGINE_899B850_NEXT_VA = 0x0089b8c0u };
enum { ISAAC_LUA_ENGINE_899B850_STACK_ARGS = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899B850_ECX_ARG = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899B850_CALLEE_POPS_STACK_ARGS = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899B850_ALIGNED_PROLOGUE = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899B850_GATE_INVERTED_ENCODING = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899B850_TYPE_GATES = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899B850_IAT_LUA_TYPE = 0x00b18400u };
enum { ISAAC_LUA_ENGINE_899B850_CHECKGET_KEY = 0x00c829d4u };
enum { ISAAC_LUA_ENGINE_899B850_CHECKGET_INDEX = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899B850_CHECKGET_DEF_ARG = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899B850_CHECKGET_FIELD_OFF = 0x00000004u };
enum { ISAAC_LUA_ENGINE_899B850_CHECKGET_HELPER_VA = 0x0085c590u };
enum { ISAAC_LUA_ENGINE_899B850_IAT_LUA_TOUSERDATA = 0x00b183b0u };
enum { ISAAC_LUA_ENGINE_899B850_TOUSERDATA_INDEX_U32 = 0xfff0b9d7u };
enum { ISAAC_LUA_ENGINE_899B850_UD_FN_POINTER_CALL = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899B850_METHOD_STACK_ARGS = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899B850_FLOAT_LANE = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899B850_FLOAT_PUSHER_HELPER_VA = 0x0085c050u };
enum { ISAAC_LUA_ENGINE_899B850_RETURN_VALUE = 0x00000001u };
int32_t isaac_lua_engine_899b850_type1_gate_taken(uint32_t type_result);
uint32_t isaac_lua_engine_899b850_host_va(void);
uint32_t isaac_lua_engine_899b850_end_va(void);
uint32_t isaac_lua_engine_899b850_next_va(void);
uint32_t isaac_lua_engine_899b850_stack_args(void);
uint32_t isaac_lua_engine_899b850_ecx_arg(void);
uint32_t isaac_lua_engine_899b850_callee_pops_stack_args(void);
uint32_t isaac_lua_engine_899b850_aligned_prologue(void);
uint32_t isaac_lua_engine_899b850_gate_inverted_encoding(void);
uint32_t isaac_lua_engine_899b850_type_gates(void);
uint32_t isaac_lua_engine_899b850_iat_lua_type(void);
uint32_t isaac_lua_engine_899b850_checkget_key(void);
uint32_t isaac_lua_engine_899b850_checkget_index(void);
uint32_t isaac_lua_engine_899b850_checkget_def_arg(void);
uint32_t isaac_lua_engine_899b850_checkget_field_off(void);
uint32_t isaac_lua_engine_899b850_checkget_helper_va(void);
uint32_t isaac_lua_engine_899b850_iat_lua_touserdata(void);
uint32_t isaac_lua_engine_899b850_touserdata_index(void);
uint32_t isaac_lua_engine_899b850_ud_fn_pointer_call(void);
uint32_t isaac_lua_engine_899b850_method_stack_args(void);
uint32_t isaac_lua_engine_899b850_float_lane(void);
uint32_t isaac_lua_engine_899b850_float_pusher_helper_va(void);
uint32_t isaac_lua_engine_899b850_return_value(void);
enum { ISAAC_LUA_ENGINE_899B8C0_VA = 0x0089b8c0u };
enum { ISAAC_LUA_ENGINE_899B8C0_END_VA = 0x0089b93eu };
enum { ISAAC_LUA_ENGINE_899B8C0_NEXT_VA = 0x0089b940u };
enum { ISAAC_LUA_ENGINE_899B8C0_STACK_ARGS = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899B8C0_ECX_ARG = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899B8C0_CALLEE_POPS_STACK_ARGS = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899B8C0_ALIGNED_PROLOGUE = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899B8C0_TYPE_GATES = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899B8C0_PRE_GATE_TOUSERDATA = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899B8C0_IAT_LUA_TOUSERDATA = 0x00b183b0u };
enum { ISAAC_LUA_ENGINE_899B8C0_TOUSERDATA_INDEX_U32 = 0xfff0b9d7u };
enum { ISAAC_LUA_ENGINE_899B8C0_UD_FN_POINTER_CALL = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899B8C0_METHOD_STACK_ARGS = 0x00000002u };
enum { ISAAC_LUA_ENGINE_899B8C0_METHOD_SRET_OUT = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899B8C0_SRET_COPY_BYTES = 0x00000008u };
enum { ISAAC_LUA_ENGINE_899B8C0_IAT_LUAL_CHECKINTEGER = 0x00b183f4u };
enum { ISAAC_LUA_ENGINE_899B8C0_CHECKINTEGER_INDEX = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899B8C0_NEWUSERDATA_SIZE = 0x00000010u };
enum { ISAAC_LUA_ENGINE_899B8C0_UD_VTABLE_VA = 0x00b73574u };
enum { ISAAC_LUA_ENGINE_899B8C0_UD_SELF_PTR_FIELD_OFF = 0x00000004u };
enum { ISAAC_LUA_ENGINE_899B8C0_PAYLOAD_FIELD_OFF = 0x00000008u };
enum { ISAAC_LUA_ENGINE_899B8C0_REGISTRY_INDEX_U32 = 0xfff0b9d8u };
enum { ISAAC_LUA_ENGINE_899B8C0_METATABLE_RAWGETP_KEY = 0x00c82980u };
enum { ISAAC_LUA_ENGINE_899B8C0_IAT_LUA_RAWGETP = 0x00b183bcu };
enum { ISAAC_LUA_ENGINE_899B8C0_IAT_LUA_SETMETATABLE = 0x00b18398u };
enum { ISAAC_LUA_ENGINE_899B8C0_SETMETATABLE_INDEX_U32 = 0xfffffffeu };
enum { ISAAC_LUA_ENGINE_899B8C0_RETURN_VALUE = 0x00000001u };
uint32_t isaac_lua_engine_899b8c0_host_va(void);
uint32_t isaac_lua_engine_899b8c0_end_va(void);
uint32_t isaac_lua_engine_899b8c0_next_va(void);
uint32_t isaac_lua_engine_899b8c0_stack_args(void);
uint32_t isaac_lua_engine_899b8c0_ecx_arg(void);
uint32_t isaac_lua_engine_899b8c0_callee_pops_stack_args(void);
uint32_t isaac_lua_engine_899b8c0_aligned_prologue(void);
uint32_t isaac_lua_engine_899b8c0_type_gates(void);
uint32_t isaac_lua_engine_899b8c0_pre_gate_touserdata(void);
uint32_t isaac_lua_engine_899b8c0_iat_lua_touserdata(void);
uint32_t isaac_lua_engine_899b8c0_touserdata_index(void);
uint32_t isaac_lua_engine_899b8c0_ud_fn_pointer_call(void);
uint32_t isaac_lua_engine_899b8c0_method_stack_args(void);
uint32_t isaac_lua_engine_899b8c0_method_sret_out(void);
uint32_t isaac_lua_engine_899b8c0_sret_copy_bytes(void);
uint32_t isaac_lua_engine_899b8c0_iat_lual_checkinteger(void);
uint32_t isaac_lua_engine_899b8c0_checkinteger_index(void);
uint32_t isaac_lua_engine_899b8c0_newuserdata_size(void);
uint32_t isaac_lua_engine_899b8c0_ud_vtable_va(void);
uint32_t isaac_lua_engine_899b8c0_ud_self_ptr_field_off(void);
uint32_t isaac_lua_engine_899b8c0_payload_field_off(void);
uint32_t isaac_lua_engine_899b8c0_registry_index(void);
uint32_t isaac_lua_engine_899b8c0_metatable_rawgetp_key(void);
uint32_t isaac_lua_engine_899b8c0_iat_lua_rawgetp(void);
uint32_t isaac_lua_engine_899b8c0_iat_lua_setmetatable(void);
uint32_t isaac_lua_engine_899b8c0_setmetatable_index(void);
uint32_t isaac_lua_engine_899b8c0_return_value(void);
enum { ISAAC_LUA_ENGINE_899B940_VA = 0x0089b940u };
enum { ISAAC_LUA_ENGINE_899B940_END_VA = 0x0089b9acu };
enum { ISAAC_LUA_ENGINE_899B940_NEXT_VA = 0x0089b9b0u };
enum { ISAAC_LUA_ENGINE_899B940_STACK_ARGS = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899B940_ECX_ARG = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899B940_CALLEE_POPS_STACK_ARGS = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899B940_ALIGNED_PROLOGUE = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899B940_GATE_INVERTED_ENCODING = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899B940_TYPE_GATES = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899B940_IAT_LUA_TYPE = 0x00b18400u };
enum { ISAAC_LUA_ENGINE_899B940_CHECKGET_KEY = 0x00c829d1u };
enum { ISAAC_LUA_ENGINE_899B940_CHECKGET_INDEX = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899B940_CHECKGET_DEF_ARG = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899B940_CHECKGET_FIELD_OFF = 0x00000004u };
enum { ISAAC_LUA_ENGINE_899B940_CHECKGET_HELPER_VA = 0x0085c590u };
enum { ISAAC_LUA_ENGINE_899B940_IAT_LUA_TOUSERDATA = 0x00b183b0u };
enum { ISAAC_LUA_ENGINE_899B940_TOUSERDATA_INDEX_U32 = 0xfff0b9d7u };
enum { ISAAC_LUA_ENGINE_899B940_UD_FN_POINTER_CALL = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899B940_METHOD_STACK_ARGS = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899B940_METHOD_I32_ARG = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899B940_IAT_LUAL_CHECKINTEGER = 0x00b183f4u };
enum { ISAAC_LUA_ENGINE_899B940_CHECKINTEGER_INDEX = 0x00000002u };
enum { ISAAC_LUA_ENGINE_899B940_RETURN_VALUE = 0x00000000u };
int32_t isaac_lua_engine_899b940_type1_gate_taken(uint32_t type_result);
uint32_t isaac_lua_engine_899b940_host_va(void);
uint32_t isaac_lua_engine_899b940_end_va(void);
uint32_t isaac_lua_engine_899b940_next_va(void);
uint32_t isaac_lua_engine_899b940_stack_args(void);
uint32_t isaac_lua_engine_899b940_ecx_arg(void);
uint32_t isaac_lua_engine_899b940_callee_pops_stack_args(void);
uint32_t isaac_lua_engine_899b940_aligned_prologue(void);
uint32_t isaac_lua_engine_899b940_gate_inverted_encoding(void);
uint32_t isaac_lua_engine_899b940_type_gates(void);
uint32_t isaac_lua_engine_899b940_iat_lua_type(void);
uint32_t isaac_lua_engine_899b940_checkget_key(void);
uint32_t isaac_lua_engine_899b940_checkget_index(void);
uint32_t isaac_lua_engine_899b940_checkget_def_arg(void);
uint32_t isaac_lua_engine_899b940_checkget_field_off(void);
uint32_t isaac_lua_engine_899b940_checkget_helper_va(void);
uint32_t isaac_lua_engine_899b940_iat_lua_touserdata(void);
uint32_t isaac_lua_engine_899b940_touserdata_index(void);
uint32_t isaac_lua_engine_899b940_ud_fn_pointer_call(void);
uint32_t isaac_lua_engine_899b940_method_stack_args(void);
uint32_t isaac_lua_engine_899b940_method_i32_arg(void);
uint32_t isaac_lua_engine_899b940_iat_lual_checkinteger(void);
uint32_t isaac_lua_engine_899b940_checkinteger_index(void);
uint32_t isaac_lua_engine_899b940_return_value(void);
enum { ISAAC_LUA_ENGINE_899B9B0_VA = 0x0089b9b0u };
enum { ISAAC_LUA_ENGINE_899B9B0_END_VA = 0x0089ba0cu };
enum { ISAAC_LUA_ENGINE_899B9B0_NEXT_VA = 0x0089ba10u };
enum { ISAAC_LUA_ENGINE_899B9B0_STACK_ARGS = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899B9B0_ECX_ARG = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899B9B0_CALLEE_POPS_STACK_ARGS = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899B9B0_ALIGNED_PROLOGUE = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899B9B0_GATE_INVERTED_ENCODING = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899B9B0_TYPE_GATES = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899B9B0_IAT_LUA_TYPE = 0x00b18400u };
enum { ISAAC_LUA_ENGINE_899B9B0_CHECKGET_KEY = 0x00c829d1u };
enum { ISAAC_LUA_ENGINE_899B9B0_CHECKGET_INDEX = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899B9B0_CHECKGET_DEF_ARG = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899B9B0_CHECKGET_FIELD_OFF = 0x00000004u };
enum { ISAAC_LUA_ENGINE_899B9B0_CHECKGET_HELPER_VA = 0x0085c590u };
enum { ISAAC_LUA_ENGINE_899B9B0_IAT_LUA_TOUSERDATA = 0x00b183b0u };
enum { ISAAC_LUA_ENGINE_899B9B0_TOUSERDATA_INDEX_U32 = 0xfff0b9d7u };
enum { ISAAC_LUA_ENGINE_899B9B0_UD_FN_POINTER_CALL = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899B9B0_METHOD_STACK_ARGS = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899B9B0_METHOD_I32_RETURN = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899B9B0_I32_SEXT_PUSHER_HELPER_VA = 0x0085bfd0u };
enum { ISAAC_LUA_ENGINE_899B9B0_RETURN_VALUE = 0x00000001u };
int32_t isaac_lua_engine_899b9b0_type1_gate_taken(uint32_t type_result);
uint32_t isaac_lua_engine_899b9b0_host_va(void);
uint32_t isaac_lua_engine_899b9b0_end_va(void);
uint32_t isaac_lua_engine_899b9b0_next_va(void);
uint32_t isaac_lua_engine_899b9b0_stack_args(void);
uint32_t isaac_lua_engine_899b9b0_ecx_arg(void);
uint32_t isaac_lua_engine_899b9b0_callee_pops_stack_args(void);
uint32_t isaac_lua_engine_899b9b0_aligned_prologue(void);
uint32_t isaac_lua_engine_899b9b0_gate_inverted_encoding(void);
uint32_t isaac_lua_engine_899b9b0_type_gates(void);
uint32_t isaac_lua_engine_899b9b0_iat_lua_type(void);
uint32_t isaac_lua_engine_899b9b0_checkget_key(void);
uint32_t isaac_lua_engine_899b9b0_checkget_index(void);
uint32_t isaac_lua_engine_899b9b0_checkget_def_arg(void);
uint32_t isaac_lua_engine_899b9b0_checkget_field_off(void);
uint32_t isaac_lua_engine_899b9b0_checkget_helper_va(void);
uint32_t isaac_lua_engine_899b9b0_iat_lua_touserdata(void);
uint32_t isaac_lua_engine_899b9b0_touserdata_index(void);
uint32_t isaac_lua_engine_899b9b0_ud_fn_pointer_call(void);
uint32_t isaac_lua_engine_899b9b0_method_stack_args(void);
uint32_t isaac_lua_engine_899b9b0_method_i32_return(void);
uint32_t isaac_lua_engine_899b9b0_i32_sext_pusher_helper_va(void);
uint32_t isaac_lua_engine_899b9b0_return_value(void);
enum { ISAAC_LUA_ENGINE_899BA10_VA = 0x0089ba10u };
enum { ISAAC_LUA_ENGINE_899BA10_END_VA = 0x0089bab3u };
enum { ISAAC_LUA_ENGINE_899BA10_NEXT_VA = 0x0089bac0u };
enum { ISAAC_LUA_ENGINE_899BA10_STACK_ARGS = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899BA10_ECX_ARG = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899BA10_CALLEE_POPS_STACK_ARGS = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899BA10_ALIGNED_PROLOGUE = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899BA10_GATE_INVERTED_ENCODING = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899BA10_TYPE_GATES = 0x00000002u };
enum { ISAAC_LUA_ENGINE_899BA10_IAT_LUA_TYPE = 0x00b18400u };
enum { ISAAC_LUA_ENGINE_899BA10_CHECKGET_KEY = 0x00c829d1u };
enum { ISAAC_LUA_ENGINE_899BA10_CHECKGET_INDEX = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899BA10_CHECKGET_DEF_ARG = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899BA10_CHECKGET_FIELD_OFF = 0x00000004u };
enum { ISAAC_LUA_ENGINE_899BA10_CHECKGET_HELPER_VA = 0x0085c590u };
enum { ISAAC_LUA_ENGINE_899BA10_IAT_LUA_TOUSERDATA = 0x00b183b0u };
enum { ISAAC_LUA_ENGINE_899BA10_TOUSERDATA_INDEX_U32 = 0xfff0b9d7u };
enum { ISAAC_LUA_ENGINE_899BA10_UD_FN_POINTER_CALL = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899BA10_METHOD_STACK_ARGS = 0x00000001u };
enum { ISAAC_LUA_ENGINE_899BA10_NIL_PATH_METHOD_ARG = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899BA10_WRAP_CHECKGET_KEY = 0x00c829c8u };
enum { ISAAC_LUA_ENGINE_899BA10_WRAP_CHECKGET_INDEX = 0x00000002u };
enum { ISAAC_LUA_ENGINE_899BA10_WRAP_CHECKGET_DEF_ARG = 0x00000000u };
enum { ISAAC_LUA_ENGINE_899BA10_RETURN_VALUE = 0x00000000u };
int32_t isaac_lua_engine_899ba10_type1_gate_taken(uint32_t type_result);
int32_t isaac_lua_engine_899ba10_type2_gate_taken(uint32_t type_result);
uint32_t isaac_lua_engine_899ba10_host_va(void);
uint32_t isaac_lua_engine_899ba10_end_va(void);
uint32_t isaac_lua_engine_899ba10_next_va(void);
uint32_t isaac_lua_engine_899ba10_stack_args(void);
uint32_t isaac_lua_engine_899ba10_ecx_arg(void);
uint32_t isaac_lua_engine_899ba10_callee_pops_stack_args(void);
uint32_t isaac_lua_engine_899ba10_aligned_prologue(void);
uint32_t isaac_lua_engine_899ba10_gate_inverted_encoding(void);
uint32_t isaac_lua_engine_899ba10_type_gates(void);
uint32_t isaac_lua_engine_899ba10_iat_lua_type(void);
uint32_t isaac_lua_engine_899ba10_checkget_key(void);
uint32_t isaac_lua_engine_899ba10_checkget_index(void);
uint32_t isaac_lua_engine_899ba10_checkget_def_arg(void);
uint32_t isaac_lua_engine_899ba10_checkget_field_off(void);
uint32_t isaac_lua_engine_899ba10_checkget_helper_va(void);
uint32_t isaac_lua_engine_899ba10_iat_lua_touserdata(void);
uint32_t isaac_lua_engine_899ba10_touserdata_index(void);
uint32_t isaac_lua_engine_899ba10_ud_fn_pointer_call(void);
uint32_t isaac_lua_engine_899ba10_method_stack_args(void);
uint32_t isaac_lua_engine_899ba10_nil_path_method_arg(void);
uint32_t isaac_lua_engine_899ba10_wrap_checkget_key(void);
uint32_t isaac_lua_engine_899ba10_wrap_checkget_index(void);
uint32_t isaac_lua_engine_899ba10_wrap_checkget_def_arg(void);
uint32_t isaac_lua_engine_899ba10_return_value(void);

int32_t isaac_lua_engine_899ae70_bool_word(uint32_t toboolean_result);
int32_t isaac_lua_engine_899aee0_method_return_byte_gate(uint32_t method_result);

#ifdef __cplusplus
}
#endif
