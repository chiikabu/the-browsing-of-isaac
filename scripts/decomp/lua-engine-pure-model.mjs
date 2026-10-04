/** Independent JS oracle for LuaEngine freestanding pure helpers.
 *  Do not derive mechanically from the C++ implementation.
 *
 *  Covers:
 *    - opaque_call_008607a0 pure gate (engine flag byte bit 2)
 *    - ZHL GetMaskedPointer / GetLuaDebug inlines
 *    - Init pure pointer-mask mix (post host seed) + boot path predicates
 *    - heap tracker base select (Init + RunBundled)
 *    - RunBundled alloc/path constants + null gate
 *    - ABI v3 tracked-alloc commit, Init field stores, RegisterClasses
 *      state-ready, RunBundled fopen, FUN_0086e6c0 list/SSO/load gates,
 *      MSVC basic_string free pure checks
 *    - ABI v4 destroy pure list/registry teardown, list unlink + count dec,
 *      materialize call nargs/nresults, RegisterClasses userdata/nups imms
 *    - ABI v5 deeper RegisterClasses table-install: relative stack -1/-3/-4/-5,
 *      method-closure nups=1, stack-ref RAII nest/return/settop, metatable
 *      create gate, userdata fn store, set-meta push-1
 *    - ABI v6 stack-ref construct pure (state/slots init/after-global/return)
 *      + pop pure (slots-ready / settop ~count / slots after)
 *    - ABI v7 class create 0x008a7e10 pure prologue (state store / slots init /
 *      return this) + EntityPtr registry rawseti keys + name/ctor/meta VAs
 *    - ABI v8 method helper 0x008a06a0 pure imms (SetReference name/wrapper/
 *      real_fn + table absindex âˆ’3) + class-create residual first pushvalue
 *      (âˆ’1 @ 0x008a7e65) + already-registered dual setmeta indices + Vector
 *      class create 0x008a7c00 name/ctor/registry keys
 *    - ABI v9 method helper IAT-chain pure: absindex âˆ’3, rotate (âˆ’2, n=1),
 *      stack cleanup 0x38, rawset index identity; corrected import map
 *      (newuserdata/pushcclosure/absindex/pushstring/rotate/rawset)
 *    - ABI v10 SetReference wrapper 0x008a80d0 pure: type indices 1/2,
 *      registry keys 0xc8297d/0xc8297a, touserdata 0xfff0b9d7 (upvalueindex 1),
 *      type-nonzero gates, check-helper stack indices/flags, object +4, ret 0
 *    - ABI v11 check/get helper 0x0085c590 pure: rawgetp REGISTRYINDEX, got
 *      init 0, isuserdata-continue gate, identity key 0xc7f4b8, LUA_TBOOLEAN,
 *      settop/rawequal indices, __const/__parent/__type/fmt VAs, isConst +
 *      canBeConst argerror gate, error return 0
 *    - ABI v12 check/get remaining pure CF after host IAT 0x0085c5ab:
 *      rawequal match + parent-type present gates, lua_copy dest/src,
 *      parent/type rotate imms, tolstring len/indices, got needs typename,
 *      absindex âˆ’1, stack-index store identity
 *    - ABI v13 frame residual 0x008607a0 pure CF around platform unref +
 *      FUN_00872980 materialize pure imms: flag mask, engine global DAT,
 *      registry-holder off, materialize arg 1/âˆ’1, SEH try level, unref
 *      REGISTRYINDEX; materialize rawgeti/ref REGISTRYINDEX, pcallk zeros,
 *      pushvalue âˆ’1, settop âˆ’2, input layout offs, out state/ref stores
 *    - ABI v14 materialize FUN_00872980 residual pure CF around first IAT
 *      lua_rawgeti @ 0x0087299c: holder state/key offs, cdq lua_Integer
 *      lo/hi, post-IAT stack cleanup sizes, return-out identity
 *    - ABI v15 RegisterClasses 0x00866960 â€¦ ret 0x0086e4c9 structural
 *      table-install model: install-record encoding size (scheduling
 *      invariant 21/20), adjacent-record stride, operand role split by PE
 *      section, push imm8/imm32 rule, rel32 call resolution, builder-chain
 *      entry size, MSVC EH state slot partial-store semantics, scope dtor
 *      payload delta, class-create state load, Vector per-entry table
 *    - ABI v16 the single RegisterClasses branch @ 0x0086e461 and the tail
 *      it selects: engine+0x1c capture from the Init bool argument, gate as
 *      the complement of the Init debug predicate, tail global-install
 *      record (28 / 25 merged) + 4-entry table, closure-install prelude
 *      (closes the v15 gap), generic per-class constant table
 *    - ABI v17 class-create helper family proven as one template: 8 x 528
 *      bytes, 503/528 identical, shared calls + IAT, and three exact
 *      per-instance arithmetic laws (helper VA / __gc closure / registry
 *      key triple); FontRenderSettings + Font populated from the class-span
 *      rule; Color, Sprite, EntityRef left unpopulated with a reason code
 *    - ABI v18 the three metatable builders the create template calls
 *      (0x0085d040 const / 0x0085d2c0 class / 0x0085d500 static): shared
 *      absindex/pushstring/rotate(-2,1)/rawset metafield record (19 sites),
 *      per-builder ordered metafield programs with value kinds, identity
 *      rawsetp key shared with ABI v11, "const " prefix SSO constants, and
 *      the low-byte __metatable protection gate
 *    - ABI v19 the property-builder family 0x00875230â€¦0x00875ae0 as one
 *      template (six 0x16a-byte members + the folded single-caller
 *      0x00875960; identical 28-call body; diffs confined to trampoline
 *      imms and one ud-source disp), its return contract (return this,
 *      receiver never written), the ud-source kinds (shared / split /
 *      folded), the 20-callsite census, and the Color + Sprite spans
 *      populated via the contract (14/14 and 45/45 receiver agreement);
 *      span_resolution axis (DIRECT / RETURN_CONTRACT / UNRESOLVED);
 *      per-field call and builder VAs; the byte-width parameter sweep
 *      (all byte gates take wide args and mask the low byte explicitly â€”
 *      the oracle side always did)
 *    - layout constants + Lua 5.3 LUA_REGISTRYINDEX u32
 *    - ABI v25 materialize BODY (FUN_00872980) as an ordered 7-event
 *      host-event program: rawgeti -> pushinteger x2 -> pcallk -> pushvalue
 *      -> luaL_ref -> settop, with per-event IAT slot (import directory)
 *      and arg/imm counts, the full-dword pcallk status gate, the out store
 *      ORDER (state before luaL_ref, ref after), the error path facts
 *      (0x85c080 builder returns, 0x8727d0 raiser no-return, 0x28 buffer,
 *      int3 @ 0x00872a1d), entry alignment and ret 8; the Lua VM surface
 *      itself stays address-stable host
 *    - ABI v27 first band-C primary BODY 0x008c32d0 pure islands (body
 *      stays host): lua_type(L,1) full-word gate, nil this=0 still calls
 *      the upvalue, class-check key 0xc82a30 / flag 1 / edx=1, object
 *      field +4, touserdata 0xfff0b9d7, IAT 0xb18400 / 0xb183b0, ret 1
 *    - ABI v28 all 10 band-C primaries as one 0x5c template (87/92
 *      identical; diffs only class-key +0x1f and the two position-rel32s).
 *      VA = 0x008c32d0 + 0x60 * i; class key from the band-C table.
 *      Shared CF is the v27 law. NEXT_VA advanced to first secondary
 *      0x008c4e90. Bodies stay host.
 *    - ABI v29 all 16 band-C secondaries as one 0xa4 template (158/164
 *      identical; diffs only check-flag +0x25, class-key +0x27,
 *      check-rel32 +0x33, wrap-key +0x74). VA = 0x008c4e90 + 0xc0 * i;
 *      class key from the band-C table at 10+i. Shared CF is the v27
 *      law plus indexed wrap / FULL-WORD null gate. NEXT_VA advances
 *      to 0x008c5a90. Bodies stay host.
 *    - ABI v30 leftover extra BODY 0x008a0600 pure islands (body stays
 *      host). 0x008c5a90 is a scalar-object dtor (vtable 0xb73044 then
 *      0xb753c0, sized free 0xaef15c, ret 4), not a getter. Shared CF
 *      is the v27 law plus the v29 wrap minus luaL_checkinteger. Class
 *      key 0xc8297d / wrap key 0xc8297a / CODE_PTR 0x40c3a0. INLINE
 *      NEXT_VA advances past the two dtors to 0x008c5b90.
 *      v31 census: 0x008c5b90 is a 10-body
 *      release/unref family (0x85c3e0 + vtbl[0](0); ret 0), not a
 *      getter. Next getter-shaped VA 0x008976a0 peeled in ABI v31:
 *      fourth-region string getter (touserdata + call [ud] + FULL-WORD
 *      null gate + pushstring/pushnil, ret 1). Image-wide 1 site.
 *      v32 peels 0x008976f0: fourth-region integer setter (touserdata
 *      + checkinteger(1) + call [ud]; ret 0). Image-wide 1 site.
 *      NOT the v31 0x31/0x43 getter. v33 peels 0x00897730:
 *      fourth-region boolean setter (touserdata + toboolean(1) +
 *      FULL-WORD setne + call [ud]; ret 0). Image-wide 1 site.
 *      NOT the v32 checkinteger setter. v34 peels 0x00897770:
 *      fourth-region boolean getter (touserdata + call [ud] +
 *      BYTE test al,al / setne + pushboolean; ret 1). Image-wide
 *      1 site. NOT the v33 FULL-WORD setter. v35 peels 0x008977a0:
 *      fourth-region number setter (touserdata + checknumber(1) +
 *      bit-stable f32 + call [ud]; ret 0). Image-wide 1 site.
 *      NOT the v32 checkinteger setter (IAT 0xb18324, not
 *      0xb183f4). v36 skips 0x008977f0 (6-IAT userdata ctor)
 *      and peels 0x00897930: fourth-region number getter
 *      (touserdata + call [ud] + fstp f32 + host 0x85c050;
 *      ret 1). Image-wide 1 site. NOT the v35 checknumber
 *      setter. INLINE NEXT_VA advances to 0x00897970.
 *      v37 skips 0x00897970 (6-IAT Vector userdata wrap/ctor,
 *      same family as 0x008977f0) and the SEH run
 *      0x00897a10..0x00897d50, then peels 0x00897f00:
 *      sequential indexed bool setter (touserdata +
 *      toboolean(2) + FULL-WORD setne + checkinteger(1) +
 *      call [ud]; ret 0). Image-wide 1 site. NOT the v33
 *      toboolean(1) setter. INLINE NEXT_VA advances to
 *      0x00897f50.
 *      v38 skips SEH 0x00897f50, wrap/ctor 0x00898140
 *      (same 6-IAT userdata wrap family as 0x008977f0 /
 *      0x00897970), SEH 0x008981b0..0x008983e0, and
 *      unref 0x00898490 (host 0x6a80f0 + luaL_unref),
 *      then peels 0x008984e0: sequential indexed integer
 *      getter (touserdata + checkinteger(1) + call [ud]
 *      + cdq + pushinteger; ret 1). Image-wide 1 site.
 *      NOT the v32 ret-0 integer setter. INLINE NEXT_VA
 *      advances to 0x00898530.
 *      v39 skips host 0x00898530 (class-check 0x85c590 /
 *      wrap 0x8baa50 / luaL_checknumber), wrap/ctor
 *      0x00898600, SEH 0x008986d0 / 0x00898890, wrap
 *      0x00898ae0 / 0x00898c00, SEH 0x00898cf0, wrap
 *      0x00898d90 / 0x00898e00 / 0x00898e70 / 0x00898ee0,
 *      then peels 0x00898f50: fourth-region i32 getter
 *      (touserdata + call [ud] + host 0x85bff0 band-C
 *      push-i32; ret 1). Image-wide 1 site. Already
 *      census row 7 — not an 11th row. NOT the v38
 *      indexed int getter. NOT the v36 0x85c050 number
 *      getter. INLINE NEXT_VA advances to 0x00898f80.
 *      v40 skips host 0x00898f80 (lua_type + class-check
 *      0x85c590 x2), wrap/ctor 0x00899030, host setter
 *      0x008990d0, host 0x00899140, then peels 0x008991a0:
 *      fourth-region i32 sign-extend getter (touserdata +
 *      call [ud] + 0x85bfd0 closure push-i32-sext — LANDED
 *      v55 as pusher ROW 3 PUSHINT_I32_SEXT;
 *      ret 1). Image-wide 1 site. Already census row 8 —
 *      not an 11th row. NOT the v39 0x85bff0 i32 getter.
 *      INLINE NEXT_VA advances to 0x008991d0.
 *      v41 peels 0x008991d0: sequential no-arg setter-shaped
 *      island (touserdata + call [ud]; xor eax,eax; ret 0).
 *      Skip count 0 — no wrap/ctor/SEH/class-check before it.
 *      Image-wide 1 site. Not a fourth-census row. NOT the
 *      v40 0x29 i32-sext getter. NOT the v32 checkinteger
 *      setter. INLINE NEXT_VA advances to 0x008991f0.
 *
 *  Not a Lua boot ABI and not wired into Game::Update.
 */

export const LUA_ENGINE_PURE_ABI_VERSION = 103;

export const LUA_ENGINE_OFF_DEBUG = 0x0c;
export const LUA_ENGINE_OFF_RUN_CALLBACK_REGISTRY = 0x10;
export const LUA_ENGINE_OFF_UNLOAD_MOD_FUNC_REF = 0x14;
export const LUA_ENGINE_OFF_STATE = 0x18;
/** PE Init stores Debug arg as a byte here (VA 0x0086064c). */
export const LUA_ENGINE_OFF_INIT_DEBUG_ARG_BYTE = 0x1c;
export const LUA_ENGINE_OFF_RUN_CALLBACK_REGISTRY_KEY = 0x1c;
export const LUA_ENGINE_OFF_POINTER_MASK = 0x20;
export const LUA_ENGINE_OBJECT_SIZE = 0x268;

/** PE constant at luaL_unref second arg (Lua 5.3 LUA_REGISTRYINDEX). */
export const LUA53_REGISTRY_INDEX_U32 = 0xfff0b9d8;

/** Relative stack index -2 (Init requiref settop / RegisterClasses). */
export const LUA_RELATIVE_STACK_INDEX_MINUS_2_U32 = 0xfffffffe;
/** Relative stack indices used by method-install / stack-ref helpers (ABI v5). */
export const LUA_RELATIVE_STACK_INDEX_MINUS_1_U32 = 0xffffffff;
export const LUA_RELATIVE_STACK_INDEX_MINUS_3_U32 = 0xfffffffd;
export const LUA_RELATIVE_STACK_INDEX_MINUS_4_U32 = 0xfffffffc;
export const LUA_RELATIVE_STACK_INDEX_MINUS_5_U32 = 0xfffffffb;

export const LUA_INIT_MASK_MUL_C1 = 0xd7b634db;
export const LUA_INIT_MASK_MUL_C2 = 0x431bde82;
export const LUA_INIT_MASK_XOR_DEADBEEF = 0xdeadbeef;
export const LUA_INIT_MASK_SHRD_BITS = 0x12;
export const LUA_INIT_MASK_SHR_A = 4;
export const LUA_INIT_MASK_SHL_B = 5;
export const LUA_INIT_MASK_SHR_C = 0xb;

export const LUA_HEAP_TRACKER_DELTA = 0x30;
export const LUA_HEAP_TRACKER_DEFAULT_BASE = 0x00c7f618;

export const LUA_RUN_BUNDLED_ALLOC_SIZE = 0x131;
export const LUA_RUN_BUNDLED_PATH_COPY = 0x12c;
export const LUA_RUN_BUNDLED_PAYLOAD_SIZE = 0x12d;
export const LUA_INIT_REGISTRY_ALLOC_SIZE = 0x0c;
export const LUA_INIT_REGISTRY_PAYLOAD_SIZE = 0x08;
export const LUA_TRACKED_ALLOC_HEADER_SIZE = 0x04;

export const LUA_MSVC_STRING_SSO_CAPACITY = 0x0f;
export const LUA_MSVC_STRING_HEAP_THRESHOLD = 0x10;
export const LUA_MSVC_STRING_ALIGN_THRESHOLD = 0x1000;
export const LUA_MSVC_STRING_ALIGN_SLACK_MAX = 0x1f;

/** Pending-mod list globals (hash-bound; destroy + FUN_0086e6c0). */
export const LUA_PENDING_MOD_LIST_SENTINEL_DAT = 0x00c7985c;
export const LUA_PENDING_MOD_LIST_COUNT_DAT = 0x00c79860;
export const LUA_LIST_NODE_PAYLOAD_OFF = 0x08;
export const LUA_LIST_NODE_FREE_SIZE = 0x58;
export const LUA_DESTROY_REGISTRY_FREE_SIZE = 0x08;

export const LUA_MATERIALIZE_CALL_NARGS = 2;
export const LUA_MATERIALIZE_CALL_NRESULTS = 1;
export const LUA_MATERIALIZE_OUT_OFF_STATE = 0x00;
export const LUA_MATERIALIZE_OUT_OFF_REF = 0x04;
/** Materialize this layout (frame residual builds at [ebp-0x28]). */
export const LUA_MATERIALIZE_INPUT_OFF_HOLDER = 0x00;
export const LUA_MATERIALIZE_INPUT_OFF_ARG1 = 0x04;
export const LUA_MATERIALIZE_INPUT_OFF_ARG2 = 0x08;
/** Registry holder object (Init 8-byte payload): L at +0, key at +4. */
export const LUA_MATERIALIZE_HOLDER_OFF_STATE = 0x00;
export const LUA_MATERIALIZE_HOLDER_OFF_KEY = 0x04;
export const LUA_MATERIALIZE_PCALL_MSGH = 0;
export const LUA_MATERIALIZE_PCALL_CTX = 0;
export const LUA_MATERIALIZE_PCALL_K = 0;
export const LUA_MATERIALIZE_PUSHVALUE_INDEX_U32 = 0xffffffff; /* âˆ’1 */
export const LUA_MATERIALIZE_SETTOP_INDEX_U32 = 0xfffffffe; /* âˆ’2 */
/** Post-IAT add esp sizes in FUN_00872980 (ABI v14). */
export const LUA_MATERIALIZE_STACK_CLEAN_RAWGETI_PUSHINT = 0x1c;
export const LUA_MATERIALIZE_STACK_CLEAN_PUSHINT = 0x0c;
export const LUA_MATERIALIZE_STACK_CLEAN_PCALL = 0x18;
export const LUA_MATERIALIZE_STACK_CLEAN_SUCCESS = 0x18;
export const LUA_MATERIALIZE_FN_VA = 0x00872980;
export const LUA_MATERIALIZE_SUCCESS_RET_END = 0x00872a0c;
export const LUA_MATERIALIZE_ERROR_PATH_START = 0x00872a0c;
export const LUA_MATERIALIZE_FN_END = 0x00872a1d;
export const LUA_MATERIALIZE_PROGRAM_EVENT_COUNT = 7;
export const LUA_MATERIALIZE_EVENT_RAWGETI = 0;
export const LUA_MATERIALIZE_EVENT_PUSHINTEGER_1 = 1;
export const LUA_MATERIALIZE_EVENT_PUSHINTEGER_2 = 2;
export const LUA_MATERIALIZE_EVENT_PCALLK = 3;
export const LUA_MATERIALIZE_EVENT_PUSHVALUE = 4;
export const LUA_MATERIALIZE_EVENT_LUAL_REF = 5;
export const LUA_MATERIALIZE_EVENT_SETTOP = 6;
export const LUA_MATERIALIZE_EVENT_IAT_RAWGETI = 0x00b18318;
export const LUA_MATERIALIZE_EVENT_IAT_PUSHINTEGER = 0x00b183f8;
export const LUA_MATERIALIZE_EVENT_IAT_PCALLK = 0x00b183d8;
export const LUA_MATERIALIZE_EVENT_IAT_PUSHVALUE = 0x00b183c8;
export const LUA_MATERIALIZE_EVENT_IAT_LUAL_REF = 0x00b18314;
export const LUA_MATERIALIZE_EVENT_IAT_SETTOP = 0x00b18328;
export const LUA_MATERIALIZE_EVENT_ARGS_RAWGETI = 4;
export const LUA_MATERIALIZE_EVENT_ARGS_PUSHINTEGER = 3;
export const LUA_MATERIALIZE_EVENT_ARGS_PCALLK = 6;
export const LUA_MATERIALIZE_EVENT_ARGS_PUSHVALUE = 2;
export const LUA_MATERIALIZE_EVENT_ARGS_LUAL_REF = 2;
export const LUA_MATERIALIZE_EVENT_ARGS_SETTOP = 2;
export const LUA_MATERIALIZE_EVENT_IMS_RAWGETI = 1;
export const LUA_MATERIALIZE_EVENT_IMS_PCALLK = 5;
export const LUA_MATERIALIZE_EVENT_IMS_PUSHVALUE = 1;
export const LUA_MATERIALIZE_EVENT_IMS_LUAL_REF = 1;
export const LUA_MATERIALIZE_EVENT_IMS_SETTOP = 1;
export const LUA_MATERIALIZE_ERROR_BUF_SIZE = 0x28;
export const LUA_MATERIALIZE_ERROR_BUILDER_VA = 0x0085c080;
export const LUA_MATERIALIZE_ERROR_RAISER_VA = 0x008727d0;
export const LUA_MATERIALIZE_ENTRY_ALIGN_MASK = 0xfffffff8;
export const LUA_MATERIALIZE_RET_DWORDS = 2;

/* ---- ABI v26: error-path callee bodies as ordered host-event programs
 * (transcribed this unit from the PE; the Lua VM IAT surface, the shared
 * std::string/CRT helpers and the C++ throw machinery stay address-stable
 * host). Builder 0x85c080 is the error-message object ctor
 * { vtable @ +0, std::exception @ +4, L @ +0xc, std::string @ +0x10 };
 * raiser 0x8727d0 builds the exception copy and throws (_CxxThrowException
 * via IAT 0xb18758, _ThrowInfo 0xbd5bf8) and NEVER returns. Both bodies
 * are the direct callees of the v25 materialize error path (0x872a0c).
 * 49 identical (builder, raiser) call pairs image-wide (census, this unit).
 * ---------------------------------------------------------------------- */
export const LUA_MATERIALIZE_BUILDER_FN_VA = 0x0085c080;
export const LUA_MATERIALIZE_BUILDER_RET_END = 0x0085c1c5; /* ret 8 */
export const LUA_MATERIALIZE_BUILDER_EVENT_COUNT = 5;
export const LUA_MATERIALIZE_BUILDER_EVENT_GETTOP = 0;
export const LUA_MATERIALIZE_BUILDER_EVENT_TOSTRING = 1;
export const LUA_MATERIALIZE_BUILDER_EVENT_ASSIGN = 2;
export const LUA_MATERIALIZE_BUILDER_EVENT_MEMCPY = 3;
export const LUA_MATERIALIZE_BUILDER_EVENT_NEW = 4;
export const LUA_MATERIALIZE_BUILDER_IAT_GETTOP = 0x00b183d4; /* lua_gettop */
export const LUA_MATERIALIZE_BUILDER_IAT_TOSTRING = 0x00b183d0; /* lua_tolstring */
export const LUA_MATERIALIZE_BUILDER_ASSIGN_VA = 0x0040ccd0; /* std::string::assign(char const*, size_t), this=&str */
export const LUA_MATERIALIZE_BUILDER_MEMCPY_VA = 0x00af08bd; /* CRT memcpy */
export const LUA_MATERIALIZE_BUILDER_NEW_VA = 0x0040cf00; /* operator new, size in ecx */
export const LUA_MATERIALIZE_BUILDER_EVENT_ARGS_GETTOP = 1;
export const LUA_MATERIALIZE_BUILDER_EVENT_ARGS_TOSTRING = 3; /* L, -1, 0 */
export const LUA_MATERIALIZE_BUILDER_EVENT_ARGS_ASSIGN = 2; /* ptr, len */
export const LUA_MATERIALIZE_BUILDER_EVENT_ARGS_MEMCPY = 3; /* dst, src, 0xd */
export const LUA_MATERIALIZE_BUILDER_EVENT_ARGS_NEW = 0; /* size via ecx */
export const LUA_MATERIALIZE_BUILDER_EVENT_IMS_TOSTRING = 2; /* push order: len-null 0, idx -1 */
export const LUA_MATERIALIZE_BUILDER_EVENT_IMS_MEMCPY = 2; /* push order: len 0xd, src 0xb6e96c */
export const LUA_MATERIALIZE_BUILDER_TOSTRING_INDEX_U32 = 0xffffffff; /* -1 */
export const LUA_MATERIALIZE_BUILDER_TOSTRING_LEN_NULL = 0;
export const LUA_MATERIALIZE_BUILDER_LITERAL_VA = 0x00b6e96c; /* "missing error" */
export const LUA_MATERIALIZE_BUILDER_LITERAL_LEN = 0x0d;
export const LUA_MATERIALIZE_BUILDER_DEFAULT_LITERAL_VA = 0x00b1a4ec; /* first byte 0 -> "" */
export const LUA_MATERIALIZE_BUILDER_VTABLE_VA = 0x00b753d0;
export const LUA_MATERIALIZE_BUILDER_OFF_STATE = 0x0c;
export const LUA_MATERIALIZE_BUILDER_OFF_STRING = 0x10;
export const LUA_MATERIALIZE_BUILDER_OFF_SIZE = 0x20;
export const LUA_MATERIALIZE_BUILDER_OFF_CAPACITY = 0x24;
export const LUA_MATERIALIZE_BUILDER_INIT_CAPACITY = 0x0f;
export const LUA_MATERIALIZE_BUILDER_SEH_HANDLER_VA = 0x00b039d8;
export const LUA_MATERIALIZE_BUILDER_RET_DWORDS = 2;
export const LUA_MATERIALIZE_BUILDER_CALLSITE_COUNT = 49;
export const LUA_MATERIALIZE_RAISER_FN_VA = 0x008727d0;
export const LUA_MATERIALIZE_RAISER_FN_END = 0x00872819; /* first int3 */
export const LUA_MATERIALIZE_RAISER_EVENT_COUNT = 2;
export const LUA_MATERIALIZE_RAISER_EVENT_EXC_CTOR = 0;
export const LUA_MATERIALIZE_RAISER_EVENT_THROW = 1;
export const LUA_MATERIALIZE_RAISER_EXC_CTOR_VA = 0x00897620; /* error-exc ctor from varargs, ret 4 */
export const LUA_MATERIALIZE_RAISER_THROW_VA = 0x00af05eb; /* jmp [0xb18758] = _CxxThrowException */
export const LUA_MATERIALIZE_RAISER_THROW_IAT = 0x00b18758;
export const LUA_MATERIALIZE_RAISER_EVENT_ARGS_EXC_CTOR = 1; /* &varargs; receiver ecx = local */
export const LUA_MATERIALIZE_RAISER_EVENT_ARGS_THROW = 2; /* obj, throwinfo */
export const LUA_MATERIALIZE_RAISER_EXC_LOCAL_OFF = 0x38; /* ebp-0x38 */
export const LUA_MATERIALIZE_RAISER_VARARGS_SRC_OFF = 0x08; /* ebp+8 */
export const LUA_MATERIALIZE_RAISER_THROW_INFO_VA = 0x00bd5bf8; /* _ThrowInfo, unwind = dtor 0x85c1d0 */
export const LUA_MATERIALIZE_RAISER_SEH_HANDLER_VA = 0x00b04ecd;

const LUA_MATERIALIZE_BUILDER_EVENT_KINDS = Object.freeze([
  LUA_MATERIALIZE_BUILDER_EVENT_GETTOP,
  LUA_MATERIALIZE_BUILDER_EVENT_TOSTRING,
  LUA_MATERIALIZE_BUILDER_EVENT_ASSIGN,
  LUA_MATERIALIZE_BUILDER_EVENT_MEMCPY,
  LUA_MATERIALIZE_BUILDER_EVENT_NEW,
]);
const LUA_MATERIALIZE_BUILDER_EVENT_CALL_VAS = Object.freeze([
  LUA_MATERIALIZE_BUILDER_IAT_GETTOP,
  LUA_MATERIALIZE_BUILDER_IAT_TOSTRING,
  LUA_MATERIALIZE_BUILDER_ASSIGN_VA,
  LUA_MATERIALIZE_BUILDER_MEMCPY_VA,
  LUA_MATERIALIZE_BUILDER_NEW_VA,
]);
const LUA_MATERIALIZE_BUILDER_EVENT_ARGS = Object.freeze([
  LUA_MATERIALIZE_BUILDER_EVENT_ARGS_GETTOP,
  LUA_MATERIALIZE_BUILDER_EVENT_ARGS_TOSTRING,
  LUA_MATERIALIZE_BUILDER_EVENT_ARGS_ASSIGN,
  LUA_MATERIALIZE_BUILDER_EVENT_ARGS_MEMCPY,
  LUA_MATERIALIZE_BUILDER_EVENT_ARGS_NEW,
]);
const LUA_MATERIALIZE_BUILDER_EVENT_IMS = Object.freeze([
  0,
  LUA_MATERIALIZE_BUILDER_EVENT_IMS_TOSTRING,
  0,
  LUA_MATERIALIZE_BUILDER_EVENT_IMS_MEMCPY,
  0,
]);
const LUA_MATERIALIZE_RAISER_EVENT_KINDS = Object.freeze([
  LUA_MATERIALIZE_RAISER_EVENT_EXC_CTOR,
  LUA_MATERIALIZE_RAISER_EVENT_THROW,
]);
const LUA_MATERIALIZE_RAISER_EVENT_CALL_VAS = Object.freeze([
  LUA_MATERIALIZE_RAISER_EXC_CTOR_VA,
  LUA_MATERIALIZE_RAISER_THROW_VA,
]);
const LUA_MATERIALIZE_RAISER_EVENT_ARGS = Object.freeze([
  LUA_MATERIALIZE_RAISER_EVENT_ARGS_EXC_CTOR,
  LUA_MATERIALIZE_RAISER_EVENT_ARGS_THROW,
]);

export function luaEngineMaterializeBuilderVa() {
  return LUA_MATERIALIZE_BUILDER_FN_VA >>> 0;
}
export function luaEngineMaterializeBuilderRetEnd() {
  return LUA_MATERIALIZE_BUILDER_RET_END >>> 0;
}
export function luaEngineMaterializeBuilderEventCount() {
  return LUA_MATERIALIZE_BUILDER_EVENT_COUNT;
}
export function luaEngineMaterializeBuilderEventKind(index) {
  const i = index | 0;
  return i >= 0 && i < LUA_MATERIALIZE_BUILDER_EVENT_KINDS.length
    ? LUA_MATERIALIZE_BUILDER_EVENT_KINDS[i] : -1;
}
export function luaEngineMaterializeBuilderEventIatSlot(index) {
  const i = index | 0;
  return i >= 0 && i < LUA_MATERIALIZE_BUILDER_EVENT_CALL_VAS.length
    ? LUA_MATERIALIZE_BUILDER_EVENT_CALL_VAS[i] >>> 0 : 0;
}
export function luaEngineMaterializeBuilderEventArgs(index) {
  const i = index | 0;
  return i >= 0 && i < LUA_MATERIALIZE_BUILDER_EVENT_ARGS.length
    ? LUA_MATERIALIZE_BUILDER_EVENT_ARGS[i] >>> 0 : 0;
}
export function luaEngineMaterializeBuilderEventIms(index) {
  const i = index | 0;
  return i >= 0 && i < LUA_MATERIALIZE_BUILDER_EVENT_IMS.length
    ? LUA_MATERIALIZE_BUILDER_EVENT_IMS[i] >>> 0 : 0;
}
export function luaEngineMaterializeBuilderEventImm(index, slot) {
  const i = index | 0;
  const s = slot | 0;
  if (i < 0 || i >= LUA_MATERIALIZE_BUILDER_EVENT_KINDS.length || s < 0) return 0;
  const k = LUA_MATERIALIZE_BUILDER_EVENT_KINDS[i];
  if (k === LUA_MATERIALIZE_BUILDER_EVENT_TOSTRING) {
    /* push order: slot 0 = len-null (0), slot 1 = index -1. */
    return s === 0 ? LUA_MATERIALIZE_BUILDER_TOSTRING_LEN_NULL :
      s === 1 ? LUA_MATERIALIZE_BUILDER_TOSTRING_INDEX_U32 : 0;
  }
  if (k === LUA_MATERIALIZE_BUILDER_EVENT_MEMCPY) {
    /* push order: slot 0 = len 0xd, slot 1 = src literal VA. */
    return s === 0 ? LUA_MATERIALIZE_BUILDER_LITERAL_LEN :
      s === 1 ? LUA_MATERIALIZE_BUILDER_LITERAL_VA : 0;
  }
  return 0;
}
/* PE 0x85c0ed: test eax,eax; jle 0x85c128 - tostring path iff top > 0
   (SIGNED full dword; driven UNMASKED). */
export function luaEngineMaterializeBuilderGettopGate(top) {
  return (top | 0) > 0 ? 1 : 0;
}
/* PE 0x85c101..0x85c108: cmovne - tostring result, else default literal
   0xb1a4ec (first byte 0, so the inline strlen yields 0 = empty assign). */
export function luaEngineMaterializeBuilderTostringResult(str) {
  const s = str >>> 0;
  return s !== 0 ? s : (LUA_MATERIALIZE_BUILDER_DEFAULT_LITERAL_VA >>> 0);
}
/* PE 0x85c12b: cmp ecx,0xd; jb 0x85c158 - reuse buffer iff cap >= 0xd
   (UNSIGNED; capacity re-read from [this+0x24] per call). */
export function luaEngineMaterializeBuilderReuseGate(cap) {
  return (cap >>> 0) >= LUA_MATERIALIZE_BUILDER_LITERAL_LEN ? 1 : 0;
}
/* PE 0x85c133: cmp ecx,0x10; jb - SSO buffer iff cap < 0x10 (UNSIGNED). */
export function luaEngineMaterializeBuilderSsoGate(cap) {
  return (cap >>> 0) < 0x10 ? 1 : 0;
}
/* PE 0x85c158..0x85c17b grow law, ALL unsigned (shr/jbe/cmova):
   half = cap >>> 1; if cap <= 0x7fffffff - half then
   newcap = max(0xf, cap + half) else newcap = 0x7fffffff. */
export function luaEngineMaterializeBuilderGrowCapacity(cap) {
  const c = cap >>> 0;
  const half = c >>> 1;
  const limit = (0x7fffffff - half) >>> 0;
  if (c <= limit) {
    const cand = (half + c) >>> 0;
    return cand > 0xf ? cand : 0xf;
  }
  return 0x7fffffff;
}
/* PE 0x85c17b: lea ecx,[ebx+1] - allocation size = newcap + 1 (u32 wrap). */
export function luaEngineMaterializeBuilderGrowAllocSize(newcap) {
  return ((newcap >>> 0) + 1) >>> 0;
}
export function luaEngineMaterializeBuilderLiteralVa() {
  return LUA_MATERIALIZE_BUILDER_LITERAL_VA >>> 0;
}
export function luaEngineMaterializeBuilderLiteralLen() {
  return LUA_MATERIALIZE_BUILDER_LITERAL_LEN >>> 0;
}
export function luaEngineMaterializeBuilderDefaultLiteralVa() {
  return LUA_MATERIALIZE_BUILDER_DEFAULT_LITERAL_VA >>> 0;
}
export function luaEngineMaterializeBuilderVtableVa() {
  return LUA_MATERIALIZE_BUILDER_VTABLE_VA >>> 0;
}
export function luaEngineMaterializeBuilderOffState() {
  return LUA_MATERIALIZE_BUILDER_OFF_STATE >>> 0;
}
export function luaEngineMaterializeBuilderOffString() {
  return LUA_MATERIALIZE_BUILDER_OFF_STRING >>> 0;
}
export function luaEngineMaterializeBuilderOffSize() {
  return LUA_MATERIALIZE_BUILDER_OFF_SIZE >>> 0;
}
export function luaEngineMaterializeBuilderOffCapacity() {
  return LUA_MATERIALIZE_BUILDER_OFF_CAPACITY >>> 0;
}
export function luaEngineMaterializeBuilderInitCapacity() {
  return LUA_MATERIALIZE_BUILDER_INIT_CAPACITY >>> 0;
}
export function luaEngineMaterializeBuilderSehHandlerVa() {
  return LUA_MATERIALIZE_BUILDER_SEH_HANDLER_VA >>> 0;
}
export function luaEngineMaterializeBuilderRetDwords() {
  return LUA_MATERIALIZE_BUILDER_RET_DWORDS >>> 0;
}
/* epilogue: mov eax, edi - returns this. */
export function luaEngineMaterializeBuilderReturnThis() {
  return 1;
}
/* grow path store order: size @ 0x85c183, cap @ 0x85c18a, literal copy
   @ 0x85c18d..0x85c1a8, null term @ 0x85c1ab, heap ptr @ 0x85c1af LAST. */
export function luaEngineMaterializeBuilderBufPtrStoreLast() {
  return 1;
}
/* Whole-image census (this unit): 49 direct E8 callers, every one the
   identical `sub esp,0x28; mov ecx,esp; push ecx; push L` + raiser pair. */
export function luaEngineMaterializeBuilderCallsiteCount() {
  return LUA_MATERIALIZE_BUILDER_CALLSITE_COUNT >>> 0;
}
export function luaEngineMaterializeRaiserVa() {
  return LUA_MATERIALIZE_RAISER_FN_VA >>> 0;
}
export function luaEngineMaterializeRaiserFnEnd() {
  return LUA_MATERIALIZE_RAISER_FN_END >>> 0;
}
export function luaEngineMaterializeRaiserEventCount() {
  return LUA_MATERIALIZE_RAISER_EVENT_COUNT;
}
export function luaEngineMaterializeRaiserEventKind(index) {
  const i = index | 0;
  return i >= 0 && i < LUA_MATERIALIZE_RAISER_EVENT_KINDS.length
    ? LUA_MATERIALIZE_RAISER_EVENT_KINDS[i] : -1;
}
export function luaEngineMaterializeRaiserEventIatSlot(index) {
  const i = index | 0;
  return i >= 0 && i < LUA_MATERIALIZE_RAISER_EVENT_CALL_VAS.length
    ? LUA_MATERIALIZE_RAISER_EVENT_CALL_VAS[i] >>> 0 : 0;
}
export function luaEngineMaterializeRaiserEventArgs(index) {
  const i = index | 0;
  return i >= 0 && i < LUA_MATERIALIZE_RAISER_EVENT_ARGS.length
    ? LUA_MATERIALIZE_RAISER_EVENT_ARGS[i] >>> 0 : 0;
}
export function luaEngineMaterializeRaiserEventIms(index) {
  const i = index | 0;
  return i >= 0 && i < LUA_MATERIALIZE_RAISER_EVENT_KINDS.length ? 0 : 0;
}
export function luaEngineMaterializeRaiserEventImm(index, slot) {
  return 0;
}
/* raiser never returns: int3 @ 0x872819, no ret in body. */
export function luaEngineMaterializeRaiserNoReturn() {
  return 1;
}
export function luaEngineMaterializeRaiserExcLocalOff() {
  return LUA_MATERIALIZE_RAISER_EXC_LOCAL_OFF >>> 0;
}
export function luaEngineMaterializeRaiserVarargsSrcOff() {
  return LUA_MATERIALIZE_RAISER_VARARGS_SRC_OFF >>> 0;
}
export function luaEngineMaterializeRaiserThrowInfoVa() {
  return LUA_MATERIALIZE_RAISER_THROW_INFO_VA >>> 0;
}
export function luaEngineMaterializeRaiserExcCtorVa() {
  return LUA_MATERIALIZE_RAISER_EXC_CTOR_VA >>> 0;
}
export function luaEngineMaterializeRaiserThrowIat() {
  return LUA_MATERIALIZE_RAISER_THROW_IAT >>> 0;
}
export function luaEngineMaterializeRaiserSehHandlerVa() {
  return LUA_MATERIALIZE_RAISER_SEH_HANDLER_VA >>> 0;
}


/** Frame residual 0x008607a0 pure imms (ABI v13). */
export const LUA_FRAME_UNREF_ENGINE_GLOBAL_DAT = 0x00c71690;
export const LUA_FRAME_UNREF_FLAG_MASK = 0x02;
export const LUA_FRAME_UNREF_REGISTRY_HOLDER_OFF = 0x10;
export const LUA_FRAME_UNREF_MATERIALIZE_ARG1 = 0x01;
export const LUA_FRAME_UNREF_MATERIALIZE_ARG2_U32 = 0xffffffff;
export const LUA_FRAME_UNREF_TRY_LEVEL = 0;

export const LUA_REGISTER_USERDATA_SIZE = 0x04;
export const LUA_REGISTER_CLOSURE_NUPS = 0x00;
/** Method-install helpers (0x008a06a0 family) pushcclosure nups. */
export const LUA_REGISTER_METHOD_CLOSURE_NUPS = 0x01;
/** setmetatable / metamethod install push-1 immediate. */
export const LUA_REGISTER_SET_META_PUSH_N = 0x01;

/** Stack-ref RAII (RegisterClasses 0x0085dab0 / 0x008a7e10 / 0x0085d910 / 0x0085cce0). */
export const LUA_STACK_REF_OFF_STATE = 0x00;
export const LUA_STACK_REF_OFF_SLOTS = 0x04;
export const LUA_STACK_REF_NEST_DELTA = 0x03;
export const LUA_STACK_REF_RETURN_LEAVE = 0x03;
export const LUA_STACK_REF_SETTOP_THRESHOLD = 0x03;
/** 0x0085dab0 after host lua_getglobal("_G"): inc slots. */
export const LUA_STACK_REF_CONSTRUCT_PUSH_DELTA = 0x01;
/** Hash-bound rdata VA of "_G". */
export const LUA_STACK_REF_CONSTRUCT_GLOBAL_NAME_VA = 0x00b6ea60;

/** Class create 0x008a7e10 (EntityPtr) install immediates (ABI v7). */
export const LUA_CLASS_CREATE_ENTITYPTR_NAME_VA = 0x00b701e4;
export const LUA_CLASS_CREATE_ENTITYPTR_CTOR_VA = 0x008c32b0;
export const LUA_CLASS_CREATE_META_GC_NAME_VA = 0x00b753b4;
export const LUA_CLASS_CREATE_META_CLASS_NAME_VA = 0x00b6ea70;
export const LUA_CLASS_CREATE_META_CONST_NAME_VA = 0x00b6e9c4;
/** EntityPtr create-path rawseti registry keys (stack -1/-2/-3). */
export const LUA_CLASS_CREATE_REGISTRY_KEY_MINUS_1 = 0x00c8297e;
export const LUA_CLASS_CREATE_REGISTRY_KEY_MINUS_2 = 0x00c8297d;
export const LUA_CLASS_CREATE_REGISTRY_KEY_MINUS_3 = 0x00c8297c;

/** Method helper 0x008a06a0 (EntityPtr::SetReference) pure imms (ABI v8). */
export const LUA_METHOD_SETREFERENCE_NAME_VA = 0x00b701f0;
export const LUA_METHOD_SETREFERENCE_WRAPPER_VA = 0x008a80d0;
export const LUA_METHOD_SETREFERENCE_REAL_FN_VA = 0x00872050;
/** Historical v8 name: absindex table index after pushcclosure (âˆ’3). */
export const LUA_METHOD_INSTALL_TABLE_PUSHVALUE_INDEX_U32 = 0xfffffffd;
/** Class create residual first pushvalue index (âˆ’1 @ 0x008a7e65). */
export const LUA_CLASS_CREATE_FIRST_PUSHVALUE_INDEX_U32 = 0xffffffff;
/** Already-registered dual setmetatable stack indices (âˆ’3 then âˆ’2). */
export const LUA_CLASS_CREATE_ALREADY_SETMETA_INDEX_A_U32 = 0xfffffffd;
export const LUA_CLASS_CREATE_ALREADY_SETMETA_INDEX_B_U32 = 0xfffffffe;
/** Vector class create 0x008a7c00 install immediates (ABI v8). */
export const LUA_CLASS_CREATE_VECTOR_NAME_VA = 0x00b701dc;
export const LUA_CLASS_CREATE_VECTOR_CTOR_VA = 0x008c3290;
export const LUA_CLASS_CREATE_VECTOR_REGISTRY_KEY_MINUS_1 = 0x00c82981;
export const LUA_CLASS_CREATE_VECTOR_REGISTRY_KEY_MINUS_2 = 0x00c82980;
export const LUA_CLASS_CREATE_VECTOR_REGISTRY_KEY_MINUS_3 = 0x00c8297f;

/** Method helper IAT-chain pure imms (ABI v9). */
export const LUA_METHOD_INSTALL_ABSINDEX_INDEX_U32 = 0xfffffffd; /* âˆ’3 */
export const LUA_METHOD_INSTALL_ROTATE_INDEX_U32 = 0xfffffffe; /* âˆ’2 */
export const LUA_METHOD_INSTALL_ROTATE_N = 0x01;
export const LUA_METHOD_INSTALL_STACK_ARG_BYTES = 0x38;

/** SetReference wrapper 0x008a80d0 pure imms (ABI v10). */
export const LUA_SETREF_WRAPPER_TYPE_INDEX_1 = 0x01;
export const LUA_SETREF_WRAPPER_TYPE_INDEX_2 = 0x02;
export const LUA_SETREF_WRAPPER_REGISTRY_KEY_ARG1 = 0x00c8297d;
export const LUA_SETREF_WRAPPER_REGISTRY_KEY_ARG2 = 0x00c8297a;
/** lua_touserdata index = lua_upvalueindex(1) = LUA_REGISTRYINDEX âˆ’ 1. */
export const LUA_SETREF_WRAPPER_TOUSERDATA_INDEX_U32 = 0xfff0b9d7;
export const LUA_SETREF_WRAPPER_CHECK_STACK_INDEX_1 = 0x01;
export const LUA_SETREF_WRAPPER_CHECK_STACK_INDEX_2 = 0x02;
export const LUA_SETREF_WRAPPER_CHECK_FLAGS = 0x00;
export const LUA_SETREF_WRAPPER_OBJECT_FIELD_OFF = 0x04;
export const LUA_SETREF_WRAPPER_RETURN_OK = 0x00;

/** Check/get helper 0x0085c590 pure imms (ABI v11). */
export const LUA_CHECK_GET_RAWGETP_REGISTRY_INDEX_U32 = 0xfff0b9d8;
export const LUA_CHECK_GET_GOT_INIT = 0x00;
export const LUA_CHECK_GET_IDENTITY_KEY_VA = 0x00c7f4b8;
export const LUA_CHECK_GET_IDENTITY_TYPE_INDEX_U32 = 0xffffffff; /* âˆ’1 */
export const LUA_CHECK_GET_LUA_TBOOLEAN = 0x01;
export const LUA_CHECK_GET_SETTOP_POP_INDEX_U32 = 0xfffffffe; /* âˆ’2 */
export const LUA_CHECK_GET_CONST_NAME_VA = 0x00b6e9c4;
export const LUA_CHECK_GET_CANNOT_BE_CONST_MSG_VA = 0x00b6e9b4;
export const LUA_CHECK_GET_PARENT_NAME_VA = 0x00b6e988;
export const LUA_CHECK_GET_TYPE_NAME_VA = 0x00b6e9cc;
export const LUA_CHECK_GET_EXPECTED_FMT_VA = 0x00b6e9a0;
export const LUA_CHECK_GET_RAWEQUAL_INDEX_A_U32 = 0xfffffffe; /* âˆ’2 */
export const LUA_CHECK_GET_RAWEQUAL_INDEX_B_U32 = 0xffffffff; /* âˆ’1 */
export const LUA_CHECK_GET_MATCH_SETTOP_INDEX_U32 = 0xfffffffd; /* âˆ’3 */
export const LUA_CHECK_GET_ERROR_RETURN_NULL = 0x00;

/** Check/get helper 0x0085c590 remaining pure CF (ABI v12). */
export const LUA_CHECK_GET_COPY_DEST_INDEX_U32 = 0xfffffffd; /* âˆ’3 */
export const LUA_CHECK_GET_COPY_SRC_INDEX_U32 = 0xffffffff; /* âˆ’1 */
export const LUA_CHECK_GET_PARENT_ROTATE_INDEX_U32 = 0xfffffffe; /* âˆ’2 */
export const LUA_CHECK_GET_PARENT_NIL_ROTATE_INDEX_U32 = 0xffffffff; /* âˆ’1 */
export const LUA_CHECK_GET_PARENT_ROTATE_N_U32 = 0xffffffff; /* âˆ’1 */
export const LUA_CHECK_GET_TYPE_ROTATE_INDEX_U32 = 0xfffffffd; /* âˆ’3 */
export const LUA_CHECK_GET_TYPE_ROTATE_N = 0x01;
export const LUA_CHECK_GET_TOLSTRING_LEN_NULL = 0x00;
export const LUA_CHECK_GET_TOLSTRING_GOT_INDEX_U32 = 0xfffffffe; /* âˆ’2 */
export const LUA_CHECK_GET_TOLSTRING_MISMATCH_INDEX_U32 = 0xffffffff; /* âˆ’1 */
export const LUA_CHECK_GET_ABSINDEX_INDEX_U32 = 0xffffffff; /* âˆ’1 */

/**
 * Frame residual pure gate for VA 0x008607a0.
 * @param {number} engineFlagByte low byte of *DAT_00c71690 object
 * @returns {number} 1 host residual needed, 0 pure no-op
 */
export function luaEngineFrameUnrefNeedsHost(engineFlagByte) {
  return ((engineFlagByte | 0) & 0xff & 2) !== 0 ? 1 : 0;
}

/**
 * ZHL GetMaskedPointer â€” 32-bit XOR wrap.
 * @param {number} pointer
 * @param {number} pointerMask
 * @returns {number} uint32
 */
export function luaEngineGetMaskedPointer(pointer, pointerMask) {
  return ((pointer >>> 0) ^ (pointerMask >>> 0)) >>> 0;
}

/**
 * ZHL GetLuaDebug.
 * @param {number} debugField byte at +0x0c
 * @returns {number} 1 if non-zero
 */
export function luaEngineGetDebug(debugField) {
  return ((debugField | 0) & 0xff) !== 0 ? 1 : 0;
}

function mul32(a, b) {
  const p = BigInt(a >>> 0) * BigInt(b >>> 0);
  return {
    lo: Number(p & 0xffffffffn) >>> 0,
    hi: Number((p >> 32n) & 0xffffffffn) >>> 0,
  };
}

/**
 * Init pure pointer-mask mix (VA 0x008604d6 â€¦ 0x00860569).
 * Independent of C++ â€” re-derived from PE mul/adc/shrd/xor order.
 * @param {number} seedLo EAX after host FUN_00a68490
 * @param {number} seedHi EDX after host FUN_00a68490
 * @returns {number} uint32 stored at this+0x20
 */
export function luaEngineInitPointerMask(seedLo, seedHi) {
  const lo = seedLo >>> 0;
  const hi = seedHi >>> 0;
  const p1 = mul32(lo, LUA_INIT_MASK_MUL_C1);
  const p2 = mul32(lo, LUA_INIT_MASK_MUL_C2);
  const p3 = mul32(hi, LUA_INIT_MASK_MUL_C1);
  const p4 = mul32(hi, LUA_INIT_MASK_MUL_C2);

  // add lo3, hi1
  let t = (p3.lo >>> 0) + (p1.hi >>> 0);
  let ecx = t >>> 0;
  let cf = t > 0xffffffff ? 1 : 0;
  // adc hi3, 0
  t = (p3.hi >>> 0) + cf;
  let edx = t >>> 0;
  // add lo2, ecx â€” retain CF only
  t = (p2.lo >>> 0) + ecx;
  cf = t > 0xffffffff ? 1 : 0;
  // adc hi2, 0
  t = (p2.hi >>> 0) + cf;
  ecx = t >>> 0;
  // xor eax,eax; add edx, ecx; adc eax, eax
  t = (edx >>> 0) + (ecx >>> 0);
  edx = t >>> 0;
  let eax = t > 0xffffffff ? 1 : 0;
  // add lo4, edx
  t = (p4.lo >>> 0) + (edx >>> 0);
  let edi = t >>> 0;
  cf = t > 0xffffffff ? 1 : 0;
  // adc hi4, eax
  t = (p4.hi >>> 0) + eax + cf;
  ecx = t >>> 0;

  // shrd edi, ecx, 0x12
  const wide = (BigInt(ecx >>> 0) << 32n) | BigInt(edi >>> 0);
  edi = Number((wide >> BigInt(LUA_INIT_MASK_SHRD_BITS)) & 0xffffffffn) >>> 0;

  eax = (edi >>> LUA_INIT_MASK_SHR_A) >>> 0;
  edi = (edi ^ eax) >>> 0;
  ecx = edi;
  edi = (edi << LUA_INIT_MASK_SHL_B) >>> 0;
  ecx = (ecx ^ LUA_INIT_MASK_XOR_DEADBEEF) >>> 0;
  ecx = (ecx + edi) >>> 0;
  eax = (ecx >>> LUA_INIT_MASK_SHR_C) >>> 0;
  return (eax ^ ecx) >>> 0;
}

/** @param {number} allocatorGlobal DAT_00c7168c */
export function luaEngineInitUseCustomNewstate(allocatorGlobal) {
  return (allocatorGlobal >>> 0) !== 0 ? 1 : 0;
}

/** @param {number} statePtr */
export function luaEngineInitCustomNewstateOk(statePtr) {
  return (statePtr >>> 0) !== 0 ? 1 : 0;
}

/** @param {number} debugArg Init(bool Debug) low byte */
export function luaEngineInitTakeDebugPath(debugArg) {
  return ((debugArg | 0) & 0xff) !== 0 ? 1 : 0;
}

/** @param {number} firstOpenf dword at requiref table base+4 */
export function luaEngineInitRequirefTableReady(firstOpenf) {
  return (firstOpenf >>> 0) !== 0 ? 1 : 0;
}

/** @param {number} nextOpenf dword at entry+0xc in requiref loop */
export function luaEngineInitRequirefContinue(nextOpenf) {
  return (nextOpenf >>> 0) !== 0 ? 1 : 0;
}

/** @param {number} debugArg */
export function luaEngineInitDebugArgStoreByte(debugArg) {
  return (debugArg | 0) & 0xff;
}

/** @param {number} trackerGlobal DAT_00c7de78 */
export function luaEngineHeapTrackerUseGlobal(trackerGlobal) {
  return (trackerGlobal >>> 0) !== 0 ? 1 : 0;
}

/**
 * @param {number} trackerGlobal
 * @param {number} defaultBase
 */
export function luaEngineHeapTrackerBase(trackerGlobal, defaultBase) {
  const g = trackerGlobal >>> 0;
  if (g !== 0) return (g + LUA_HEAP_TRACKER_DELTA) >>> 0;
  return defaultBase >>> 0;
}

/** @param {number} allocPtr */
export function luaEngineAllocNonnull(allocPtr) {
  return (allocPtr >>> 0) !== 0 ? 1 : 0;
}

/* ---- ABI v3 ---- */

/** @param {number} allocPtr */
export function luaEngineTrackedAllocPayload(allocPtr) {
  return ((allocPtr >>> 0) + LUA_TRACKED_ALLOC_HEADER_SIZE) >>> 0;
}

/** @param {number} payload */
export function luaEngineTrackedPayloadUsable(payload) {
  return (payload >>> 0) !== 0 ? 1 : 0;
}

/** @param {number} lo @param {number} size */
export function luaEngineHeapTrackerAddLo(lo, size) {
  return ((lo >>> 0) + (size >>> 0)) >>> 0;
}

/**
 * @param {number} lo
 * @param {number} hi
 * @param {number} size
 */
export function luaEngineHeapTrackerAddHi(lo, hi, size) {
  const t = BigInt(lo >>> 0) + BigInt(size >>> 0);
  const cf = Number(t >> 32n) & 1;
  return ((hi >>> 0) + cf) >>> 0;
}

/** @param {number} statePtr */
export function luaEngineInitStateStore(statePtr) {
  return statePtr >>> 0;
}

export function luaEngineInitRegistryNullStore() {
  return 0;
}

/** @param {number} objectPtr */
export function luaEngineInitRegistryStoreNonnull(objectPtr) {
  return (objectPtr >>> 0) !== 0 ? 1 : 0;
}

/** @param {number} statePtr */
export function luaEngineRegisterClassesStateReady(statePtr) {
  return (statePtr >>> 0) !== 0 ? 1 : 0;
}

export function luaEngineRelativeStackIndexMinus2() {
  return LUA_RELATIVE_STACK_INDEX_MINUS_2_U32 >>> 0;
}

/** @param {number} fileHandle */
export function luaEngineFileHandleOpen(fileHandle) {
  return (fileHandle >>> 0) !== 0 ? 1 : 0;
}

/**
 * @param {number} head
 * @param {number} sentinel
 */
export function luaEngineRunScriptListEmpty(head, sentinel) {
  return (head >>> 0) === (sentinel >>> 0) ? 1 : 0;
}

/** @param {number} capacity */
export function luaEngineMsvcStringSsoLocal(capacity) {
  return (capacity >>> 0) < LUA_MSVC_STRING_HEAP_THRESHOLD ? 1 : 0;
}

/**
 * @param {number} localBuf
 * @param {number} heapPtr
 * @param {number} capacity
 */
export function luaEngineMsvcStringDataPtr(localBuf, heapPtr, capacity) {
  if ((capacity >>> 0) < LUA_MSVC_STRING_HEAP_THRESHOLD) {
    return localBuf >>> 0;
  }
  return heapPtr >>> 0;
}

/** @param {number} capacity */
export function luaEngineMsvcStringNeedsHeapFree(capacity) {
  return (capacity >>> 0) >= LUA_MSVC_STRING_HEAP_THRESHOLD ? 1 : 0;
}

/** @param {number} capacity */
export function luaEngineMsvcStringFreeBytes(capacity) {
  return ((capacity >>> 0) + 1) >>> 0;
}

/** @param {number} freeBytes */
export function luaEngineMsvcStringAlignedFree(freeBytes) {
  return (freeBytes >>> 0) >= LUA_MSVC_STRING_ALIGN_THRESHOLD ? 1 : 0;
}

/**
 * PE: slack = (ptr - real_base) + (-4); ok if slack <= 0x1f (unsigned).
 * @param {number} ptr
 * @param {number} realBase
 */
export function luaEngineMsvcStringAlignedHeaderOk(ptr, realBase) {
  const slack = (((ptr >>> 0) - (realBase >>> 0)) + 0xfffffffc) >>> 0;
  return slack <= LUA_MSVC_STRING_ALIGN_SLACK_MAX ? 1 : 0;
}

/** @param {number} debugArgByte */
export function luaEngineRunScriptTakeDebugPath(debugArgByte) {
  return ((debugArgByte | 0) & 0xff) !== 0 ? 1 : 0;
}

/** @param {number} status */
export function luaEngineLuaStatusOk(status) {
  return (status | 0) === 0 ? 1 : 0;
}

/**
 * @param {number} loadStatus
 * @param {number} pcallStatus
 */
export function luaEngineRunScriptFailFlag(loadStatus, pcallStatus) {
  if ((loadStatus | 0) !== 0) return 1;
  if ((pcallStatus | 0) !== 0) return 1;
  return 0;
}

/** @param {number} failFlag */
export function luaEngineRunScriptSuccessBool(failFlag) {
  return (failFlag | 0) === 0 ? 1 : 0;
}

/* ---- ABI v4 ---- */

/**
 * destroy list empty (VA 0x0086e532): head == sentinel.
 * @param {number} head
 * @param {number} sentinel
 */
export function luaEngineDestroyListEmpty(head, sentinel) {
  return (head >>> 0) === (sentinel >>> 0) ? 1 : 0;
}

/** @param {number} node PE lea eax,[esi+8] */
export function luaEngineDestroyListNodePayload(node) {
  return ((node >>> 0) + LUA_LIST_NODE_PAYLOAD_OFF) >>> 0;
}

/** @param {number} sentinel self-link store value */
export function luaEngineDestroyListSelfLink(sentinel) {
  return sentinel >>> 0;
}

export function luaEngineDestroyListCountClear() {
  return 0;
}

/** @param {number} objectPtr this+0x10 / +0x14 */
export function luaEngineDestroyRegistryPresent(objectPtr) {
  return (objectPtr >>> 0) !== 0 ? 1 : 0;
}

export function luaEngineDestroyFieldNullStore() {
  return 0;
}

export function luaEngineDestroyRegistryFreeSize() {
  return LUA_DESTROY_REGISTRY_FREE_SIZE >>> 0;
}

/** @param {number} next prev->next store */
export function luaEngineListUnlinkPrevNextStore(next) {
  return next >>> 0;
}

/** @param {number} prev next->prev store */
export function luaEngineListUnlinkNextPrevStore(prev) {
  return prev >>> 0;
}

/** @param {number} count PE dec dword, 32-bit wrap */
export function luaEngineListCountDec(count) {
  return ((count >>> 0) - 1) >>> 0;
}

export function luaEngineMaterializeCallNargs() {
  return LUA_MATERIALIZE_CALL_NARGS >>> 0;
}

export function luaEngineMaterializeCallNresults() {
  return LUA_MATERIALIZE_CALL_NRESULTS >>> 0;
}

/** @param {number} status */
export function luaEngineMaterializeCallOk(status) {
  return (status | 0) === 0 ? 1 : 0;
}

/** @param {number} stateField */
export function luaEngineRegistryObjectState(stateField) {
  return stateField >>> 0;
}

/** @param {number} refField */
export function luaEngineRegistryObjectRef(refField) {
  return refField >>> 0;
}

export function luaEngineRegisterUserdataSize() {
  return LUA_REGISTER_USERDATA_SIZE >>> 0;
}

export function luaEngineRegisterClosureNups() {
  return LUA_REGISTER_CLOSURE_NUPS >>> 0;
}

/* ---- ABI v5 ---- */

export function luaEngineRelativeStackIndexMinus1() {
  return LUA_RELATIVE_STACK_INDEX_MINUS_1_U32 >>> 0;
}

export function luaEngineRelativeStackIndexMinus3() {
  return LUA_RELATIVE_STACK_INDEX_MINUS_3_U32 >>> 0;
}

export function luaEngineRelativeStackIndexMinus4() {
  return LUA_RELATIVE_STACK_INDEX_MINUS_4_U32 >>> 0;
}

export function luaEngineRelativeStackIndexMinus5() {
  return LUA_RELATIVE_STACK_INDEX_MINUS_5_U32 >>> 0;
}

export function luaEngineRegisterMethodClosureNups() {
  return LUA_REGISTER_METHOD_CLOSURE_NUPS >>> 0;
}

export function luaEngineRegisterSetMetaPushN() {
  return LUA_REGISTER_SET_META_PUSH_N >>> 0;
}

/** @param {number} fnPtr C function stored into userdata after newuserdata */
export function luaEngineRegisterUserdataFnStore(fnPtr) {
  return fnPtr >>> 0;
}

/**
 * Class create needed when getmetatable returned null (PE test eax; jne skip).
 * @param {number} getmetatableResult
 */
export function luaEngineRegisterMetatableCreateNeeded(getmetatableResult) {
  return (getmetatableResult >>> 0) === 0 ? 1 : 0;
}

/** @param {number} srcSlots nest take: dest = src + 3 (wrap) */
export function luaEngineStackRefNestTakeSlots(srcSlots) {
  return ((srcSlots >>> 0) + LUA_STACK_REF_NEST_DELTA) >>> 0;
}

export function luaEngineStackRefNestSrcClear() {
  return 0;
}

/** @param {number} srcSlots return transfer: dest = src - 3 (wrap) */
export function luaEngineStackRefReturnDestSlots(srcSlots) {
  return ((srcSlots >>> 0) - LUA_STACK_REF_NEST_DELTA) >>> 0;
}

export function luaEngineStackRefReturnSrcLeave() {
  return LUA_STACK_REF_RETURN_LEAVE >>> 0;
}

/**
 * settop residual when signed gettop >= 3 (PE cmp eax,3; jl skip).
 * @param {number} gettop
 */
export function luaEngineStackRefSettopNeeded(gettop) {
  return (gettop | 0) >= LUA_STACK_REF_SETTOP_THRESHOLD ? 1 : 0;
}

export function luaEngineStackRefSettopIndex() {
  return LUA_RELATIVE_STACK_INDEX_MINUS_4_U32 >>> 0;
}

/** @param {number} slots after settop: slots + (-3) wrap */
export function luaEngineStackRefSlotsAfterSettop(slots) {
  return ((slots >>> 0) - LUA_STACK_REF_NEST_DELTA) >>> 0;
}

/* ---- ABI v6 ---- */

/** @param {number} state construct [this+0] = L (identity) */
export function luaEngineStackRefConstructStateStore(state) {
  return state >>> 0;
}

export function luaEngineStackRefConstructSlotsInit() {
  return 0;
}

/** @param {number} slots post-getglobal: slots + 1 (wrap) */
export function luaEngineStackRefConstructSlotsAfterGlobal(slots) {
  return ((slots >>> 0) + LUA_STACK_REF_CONSTRUCT_PUSH_DELTA) >>> 0;
}

/** @param {number} thisPtr construct return this (identity) */
export function luaEngineStackRefConstructReturnThis(thisPtr) {
  return thisPtr >>> 0;
}

/**
 * Pop residual needed when signed slots >= count (PE cmp; jl skip).
 * Same for gettop >= count after host lua_gettop.
 * @param {number} slots
 * @param {number} count
 */
export function luaEngineStackRefPopSlotsReady(slots, count) {
  return (slots | 0) >= (count | 0) ? 1 : 0;
}

/**
 * settop index = ~count (PE not eax) â€” pops `count` stack values.
 * @param {number} count
 */
export function luaEngineStackRefPopSettopIndex(count) {
  return (~(count >>> 0)) >>> 0;
}

/**
 * After settop: slots -= count (wrap).
 * @param {number} slots
 * @param {number} count
 */
export function luaEngineStackRefPopSlotsAfter(slots, count) {
  return ((slots >>> 0) - (count >>> 0)) >>> 0;
}

/* ---- ABI v7 ---- */

/** @param {number} srcState class create dest.state = src.state (identity) */
export function luaEngineStackRefClassCreateStateStore(srcState) {
  return srcState >>> 0;
}

export function luaEngineStackRefClassCreateSlotsInit() {
  return 0;
}

/** @param {number} thisPtr class create return this (identity) */
export function luaEngineStackRefClassCreateReturnThis(thisPtr) {
  return thisPtr >>> 0;
}

export function luaEngineClassCreateRegistryKeyMinus1() {
  return LUA_CLASS_CREATE_REGISTRY_KEY_MINUS_1 >>> 0;
}

export function luaEngineClassCreateRegistryKeyMinus2() {
  return LUA_CLASS_CREATE_REGISTRY_KEY_MINUS_2 >>> 0;
}

export function luaEngineClassCreateRegistryKeyMinus3() {
  return LUA_CLASS_CREATE_REGISTRY_KEY_MINUS_3 >>> 0;
}

/**
 * Consecutive registry key at signed relative stack index.
 * PE: key(rel) = key_minus_1 + rel + 1 (32-bit wrap).
 * @param {number} keyMinus1 key used at stack -1
 * @param {number} relIndex signed relative stack index (e.g. -1/-2/-3)
 */
export function luaEngineClassCreateRegistryKeyAtRel(keyMinus1, relIndex) {
  return ((keyMinus1 >>> 0) + ((relIndex | 0) >>> 0) + 1) >>> 0;
}

export function luaEngineClassCreateEntityptrNameVa() {
  return LUA_CLASS_CREATE_ENTITYPTR_NAME_VA >>> 0;
}

export function luaEngineClassCreateEntityptrCtorVa() {
  return LUA_CLASS_CREATE_ENTITYPTR_CTOR_VA >>> 0;
}

export function luaEngineClassCreateMetaGcNameVa() {
  return LUA_CLASS_CREATE_META_GC_NAME_VA >>> 0;
}

export function luaEngineClassCreateMetaClassNameVa() {
  return LUA_CLASS_CREATE_META_CLASS_NAME_VA >>> 0;
}

export function luaEngineClassCreateMetaConstNameVa() {
  return LUA_CLASS_CREATE_META_CONST_NAME_VA >>> 0;
}

/* ---- ABI v8 ---- */

export function luaEngineMethodSetreferenceNameVa() {
  return LUA_METHOD_SETREFERENCE_NAME_VA >>> 0;
}

export function luaEngineMethodSetreferenceWrapperVa() {
  return LUA_METHOD_SETREFERENCE_WRAPPER_VA >>> 0;
}

export function luaEngineMethodSetreferenceRealFnVa() {
  return LUA_METHOD_SETREFERENCE_REAL_FN_VA >>> 0;
}

/** pushvalue table index after pushcclosure in method helper (âˆ’3 as u32). */
export function luaEngineMethodInstallTablePushvalueIndex() {
  return LUA_METHOD_INSTALL_TABLE_PUSHVALUE_INDEX_U32 >>> 0;
}

/** Class create residual first host arg: lua_pushvalue(L, âˆ’1) @ 0x008a7e65. */
export function luaEngineClassCreateFirstPushvalueIndex() {
  return LUA_CLASS_CREATE_FIRST_PUSHVALUE_INDEX_U32 >>> 0;
}

/** Already-registered dual setmetatable first index (âˆ’3). */
export function luaEngineClassCreateAlreadySetmetaIndexA() {
  return LUA_CLASS_CREATE_ALREADY_SETMETA_INDEX_A_U32 >>> 0;
}

/** Already-registered dual setmetatable second index (âˆ’2). */
export function luaEngineClassCreateAlreadySetmetaIndexB() {
  return LUA_CLASS_CREATE_ALREADY_SETMETA_INDEX_B_U32 >>> 0;
}

export function luaEngineClassCreateVectorNameVa() {
  return LUA_CLASS_CREATE_VECTOR_NAME_VA >>> 0;
}

export function luaEngineClassCreateVectorCtorVa() {
  return LUA_CLASS_CREATE_VECTOR_CTOR_VA >>> 0;
}

export function luaEngineClassCreateVectorRegistryKeyMinus1() {
  return LUA_CLASS_CREATE_VECTOR_REGISTRY_KEY_MINUS_1 >>> 0;
}

export function luaEngineClassCreateVectorRegistryKeyMinus2() {
  return LUA_CLASS_CREATE_VECTOR_REGISTRY_KEY_MINUS_2 >>> 0;
}

export function luaEngineClassCreateVectorRegistryKeyMinus3() {
  return LUA_CLASS_CREATE_VECTOR_REGISTRY_KEY_MINUS_3 >>> 0;
}

/* ---- ABI v9 ---- */

/** lua_absindex(L, âˆ’3) pure index after pushcclosure in method helper. */
export function luaEngineMethodInstallAbsindexIndex() {
  return LUA_METHOD_INSTALL_ABSINDEX_INDEX_U32 >>> 0;
}

/** lua_rotate(L, âˆ’2, n) pure index. */
export function luaEngineMethodInstallRotateIndex() {
  return LUA_METHOD_INSTALL_ROTATE_INDEX_U32 >>> 0;
}

/** lua_rotate n immediate (=1; same imm as v5 set-meta push-n on this path). */
export function luaEngineMethodInstallRotateN() {
  return LUA_METHOD_INSTALL_ROTATE_N >>> 0;
}

/** add esp, 0x38 after six IAT calls in method helper. */
export function luaEngineMethodInstallStackArgBytes() {
  return LUA_METHOD_INSTALL_STACK_ARG_BYTES >>> 0;
}

/**
 * rawset table index is the absindex return (identity).
 * @param {number} absIndex
 * @returns {number} uint32
 */
export function luaEngineMethodInstallRawsetIndex(absIndex) {
  return absIndex >>> 0;
}

/* ---- ABI v10 â€” SetReference wrapper 0x008a80d0 ---- */

/** lua_type(L, 1) stack index before first host IAT @ 0x008a80e0. */
export function luaEngineSetrefWrapperTypeIndex1() {
  return LUA_SETREF_WRAPPER_TYPE_INDEX_1 >>> 0;
}

/** lua_type(L, 2) stack index before second lua_type @ 0x008a8123. */
export function luaEngineSetrefWrapperTypeIndex2() {
  return LUA_SETREF_WRAPPER_TYPE_INDEX_2 >>> 0;
}

/** Registry key for arg1 check-helper path (EntityPtr create key âˆ’2). */
export function luaEngineSetrefWrapperRegistryKeyArg1() {
  return LUA_SETREF_WRAPPER_REGISTRY_KEY_ARG1 >>> 0;
}

/** Registry key for arg2 check-helper path (address-stable; no ZHL name). */
export function luaEngineSetrefWrapperRegistryKeyArg2() {
  return LUA_SETREF_WRAPPER_REGISTRY_KEY_ARG2 >>> 0;
}

/** lua_touserdata(L, lua_upvalueindex(1)) pure index as u32. */
export function luaEngineSetrefWrapperTouserdataIndex() {
  return LUA_SETREF_WRAPPER_TOUSERDATA_INDEX_U32 >>> 0;
}

/**
 * type result gate: non-zero â†’ take check-helper path (PE test eax,eax; jne).
 * @param {number} luaTypeResult
 * @returns {number} 1 when nonzero
 */
export function luaEngineSetrefWrapperTypeNonzero(luaTypeResult) {
  return (luaTypeResult | 0) !== 0 ? 1 : 0;
}

/** edx stack index for 0x0085c590 on arg1 path. */
export function luaEngineSetrefWrapperCheckStackIndex1() {
  return LUA_SETREF_WRAPPER_CHECK_STACK_INDEX_1 >>> 0;
}

/** edx stack index for 0x0085c590 on arg2 path. */
export function luaEngineSetrefWrapperCheckStackIndex2() {
  return LUA_SETREF_WRAPPER_CHECK_STACK_INDEX_2 >>> 0;
}

/** push-0 flags arg before check helper. */
export function luaEngineSetrefWrapperCheckFlags() {
  return LUA_SETREF_WRAPPER_CHECK_FLAGS >>> 0;
}

/** [eax+4] field offset after check helper returns object. */
export function luaEngineSetrefWrapperObjectFieldOff() {
  return LUA_SETREF_WRAPPER_OBJECT_FIELD_OFF >>> 0;
}

/** Wrapper return value (xor eax,eax â†’ 0) on both paths. */
export function luaEngineSetrefWrapperReturnOk() {
  return LUA_SETREF_WRAPPER_RETURN_OK >>> 0;
}

/**
 * Lua 5.3 lua_upvalueindex(n) = LUA_REGISTRYINDEX âˆ’ n (32-bit wrap).
 * @param {number} n
 * @returns {number} uint32
 */
export function luaEngineLuaUpvalueindex(n) {
  return (LUA53_REGISTRY_INDEX_U32 - (n >>> 0)) >>> 0;
}

/* ---- ABI v11 â€” check/get helper 0x0085c590 ---- */

/** lua_rawgetp(L, REGISTRYINDEX, key) registry imm. */
export function luaEngineCheckGetRawgetpRegistryIndex() {
  return LUA_CHECK_GET_RAWGETP_REGISTRY_INDEX_U32 >>> 0;
}

/** ebx / "got" init before first IAT. */
export function luaEngineCheckGetGotInit() {
  return LUA_CHECK_GET_GOT_INIT >>> 0;
}

/**
 * isuserdata gate: non-zero â†’ continue match path (PE test eax,eax; je mismatch).
 * @param {number} isuserdataResult
 * @returns {number} 1 when nonzero
 */
export function luaEngineCheckGetIsuserdataContinue(isuserdataResult) {
  return (isuserdataResult | 0) !== 0 ? 1 : 0;
}

/** Identity-key VA for second lua_rawgetp. */
export function luaEngineCheckGetIdentityKeyVa() {
  return LUA_CHECK_GET_IDENTITY_KEY_VA >>> 0;
}

/** lua_type index after identity rawgetp (âˆ’1). */
export function luaEngineCheckGetIdentityTypeIndex() {
  return LUA_CHECK_GET_IDENTITY_TYPE_INDEX_U32 >>> 0;
}

/** LUA_TBOOLEAN immediate. */
export function luaEngineCheckGetLuaTboolean() {
  return LUA_CHECK_GET_LUA_TBOOLEAN >>> 0;
}

/**
 * Identity boolean gate: type == LUA_TBOOLEAN â†’ ours.
 * @param {number} luaTypeResult
 * @returns {number} 1 when type == 1
 */
export function luaEngineCheckGetIdentityIsBoolean(luaTypeResult) {
  return (luaTypeResult | 0) === (LUA_CHECK_GET_LUA_TBOOLEAN | 0) ? 1 : 0;
}

/** lua_settop pop index after identity accept (âˆ’2). */
export function luaEngineCheckGetSettopPopIndex() {
  return LUA_CHECK_GET_SETTOP_POP_INDEX_U32 >>> 0;
}

/** rdata VA of "__const". */
export function luaEngineCheckGetConstNameVa() {
  return LUA_CHECK_GET_CONST_NAME_VA >>> 0;
}

/** rdata VA of "cannot be const". */
export function luaEngineCheckGetCannotBeConstMsgVa() {
  return LUA_CHECK_GET_CANNOT_BE_CONST_MSG_VA >>> 0;
}

/** rdata VA of "__parent". */
export function luaEngineCheckGetParentNameVa() {
  return LUA_CHECK_GET_PARENT_NAME_VA >>> 0;
}

/** rdata VA of "__type". */
export function luaEngineCheckGetTypeNameVa() {
  return LUA_CHECK_GET_TYPE_NAME_VA >>> 0;
}

/** rdata VA of "%s expected, got %s". */
export function luaEngineCheckGetExpectedFmtVa() {
  return LUA_CHECK_GET_EXPECTED_FMT_VA >>> 0;
}

/**
 * isConst from __const field type: type==0 (nil) â†’ const object.
 * @param {number} luaTypeResult
 * @returns {number} 1 when type == 0
 */
export function luaEngineCheckGetIsConstFromType(luaTypeResult) {
  return (luaTypeResult | 0) === 0 ? 1 : 0;
}

/**
 * Const-violation gate: isConst && !canBeConst â†’ host argerror.
 * @param {number} isConstFlag
 * @param {number} canBeConstFlag
 * @returns {number} 1 when argerror must run
 */
export function luaEngineCheckGetNeedsConstArgerror(isConstFlag, canBeConstFlag) {
  return ((isConstFlag | 0) & 0xff) !== 0 && ((canBeConstFlag | 0) & 0xff) === 0
    ? 1
    : 0;
}

/** lua_rawequal first index (âˆ’2). */
export function luaEngineCheckGetRawequalIndexA() {
  return LUA_CHECK_GET_RAWEQUAL_INDEX_A_U32 >>> 0;
}

/** lua_rawequal second index (âˆ’1). */
export function luaEngineCheckGetRawequalIndexB() {
  return LUA_CHECK_GET_RAWEQUAL_INDEX_B_U32 >>> 0;
}

/** lua_settop index after class match (âˆ’3). */
export function luaEngineCheckGetMatchSettopIndex() {
  return LUA_CHECK_GET_MATCH_SETTOP_INDEX_U32 >>> 0;
}

/** xor eax,eax after host error path. */
export function luaEngineCheckGetErrorReturnNull() {
  return LUA_CHECK_GET_ERROR_RETURN_NULL >>> 0;
}

/* ---- ABI v12 â€” check/get 0x0085c590 remaining pure CF ---- */

/**
 * After host lua_rawequal: non-zero â†’ class match path.
 * @param {number} rawequalResult
 * @returns {number} 1 when nonzero
 */
export function luaEngineCheckGetRawequalMatch(rawequalResult) {
  return (rawequalResult | 0) !== 0 ? 1 : 0;
}

/**
 * After host lua_type of __parent: non-zero â†’ parent-present rotate path.
 * @param {number} luaTypeResult
 * @returns {number} 1 when nonzero
 */
export function luaEngineCheckGetParentTypePresent(luaTypeResult) {
  return (luaTypeResult | 0) !== 0 ? 1 : 0;
}

/** lua_copy dest index (âˆ’3). */
export function luaEngineCheckGetCopyDestIndex() {
  return LUA_CHECK_GET_COPY_DEST_INDEX_U32 >>> 0;
}

/** lua_copy src index (âˆ’1). */
export function luaEngineCheckGetCopySrcIndex() {
  return LUA_CHECK_GET_COPY_SRC_INDEX_U32 >>> 0;
}

/** Parent-present lua_rotate index (âˆ’2). */
export function luaEngineCheckGetParentRotateIndex() {
  return LUA_CHECK_GET_PARENT_ROTATE_INDEX_U32 >>> 0;
}

/** Parent-nil lua_rotate index (âˆ’1). */
export function luaEngineCheckGetParentNilRotateIndex() {
  return LUA_CHECK_GET_PARENT_NIL_ROTATE_INDEX_U32 >>> 0;
}

/** Parent-walk lua_rotate n (âˆ’1 as u32). */
export function luaEngineCheckGetParentRotateN() {
  return LUA_CHECK_GET_PARENT_ROTATE_N_U32 >>> 0;
}

/** No-parent __type lua_rotate index (âˆ’3). */
export function luaEngineCheckGetTypeRotateIndex() {
  return LUA_CHECK_GET_TYPE_ROTATE_INDEX_U32 >>> 0;
}

/** No-parent __type lua_rotate n (1). */
export function luaEngineCheckGetTypeRotateN() {
  return LUA_CHECK_GET_TYPE_ROTATE_N >>> 0;
}

/** lua_tolstring len=NULL immediate (0). */
export function luaEngineCheckGetTolstringLenNull() {
  return LUA_CHECK_GET_TOLSTRING_LEN_NULL >>> 0;
}

/** tolstring stack index on got-from-__type path (âˆ’2). */
export function luaEngineCheckGetTolstringGotIndex() {
  return LUA_CHECK_GET_TOLSTRING_GOT_INDEX_U32 >>> 0;
}

/** tolstring stack index on mismatch path (âˆ’1). */
export function luaEngineCheckGetTolstringMismatchIndex() {
  return LUA_CHECK_GET_TOLSTRING_MISMATCH_INDEX_U32 >>> 0;
}

/**
 * got pointer null â†’ host lua_typename residual.
 * @param {number} gotPtr
 * @returns {number} 1 when got is null
 */
export function luaEngineCheckGetGotNeedsTypename(gotPtr) {
  return (gotPtr >>> 0) === 0 ? 1 : 0;
}

/** lua_absindex relative index (âˆ’1). */
export function luaEngineCheckGetAbsindexIndex() {
  return LUA_CHECK_GET_ABSINDEX_INDEX_U32 >>> 0;
}

/**
 * Stack-index store into [ebp-8] before first IAT (identity).
 * @param {number} stackIndex
 * @returns {number} uint32
 */
export function luaEngineCheckGetStackIndexStore(stackIndex) {
  return stackIndex >>> 0;
}

/* ---- ABI v13 â€” frame residual 0x008607a0 + materialize 0x00872980 ---- */

/** Hash-bound global DAT_00c71690 loaded at frame residual entry. */
export function luaEngineFrameUnrefEngineGlobalDat() {
  return LUA_FRAME_UNREF_ENGINE_GLOBAL_DAT >>> 0;
}

/** test byte ptr [eax], 2 â€” flag bit mask. */
export function luaEngineFrameUnrefFlagMask() {
  return LUA_FRAME_UNREF_FLAG_MASK >>> 0;
}

/** mov eax, [ecx+0x10] â€” registry holder field off on engine. */
export function luaEngineFrameUnrefRegistryHolderOff() {
  return LUA_FRAME_UNREF_REGISTRY_HOLDER_OFF >>> 0;
}

/** mov [ebp-0x24], 1 â€” materialize this+4 pushinteger value. */
export function luaEngineFrameUnrefMaterializeArg1() {
  return LUA_FRAME_UNREF_MATERIALIZE_ARG1 >>> 0;
}

/** mov [ebp-0x20], âˆ’1 â€” materialize this+8 pushinteger value. */
export function luaEngineFrameUnrefMaterializeArg2() {
  return LUA_FRAME_UNREF_MATERIALIZE_ARG2_U32 >>> 0;
}

/** push REGISTRYINDEX before IAT luaL_unref. */
export function luaEngineFrameUnrefRegistryIndex() {
  return LUA53_REGISTRY_INDEX_U32 >>> 0;
}

/** mov [ebp-4], 0 â€” SEH try level before materialize. */
export function luaEngineFrameUnrefTryLevel() {
  return LUA_FRAME_UNREF_TRY_LEVEL >>> 0;
}

export function luaEngineMaterializeInputHolderOff() {
  return LUA_MATERIALIZE_INPUT_OFF_HOLDER >>> 0;
}

export function luaEngineMaterializeInputArg1Off() {
  return LUA_MATERIALIZE_INPUT_OFF_ARG1 >>> 0;
}

export function luaEngineMaterializeInputArg2Off() {
  return LUA_MATERIALIZE_INPUT_OFF_ARG2 >>> 0;
}

/** lua_rawgeti registry index imm. */
export function luaEngineMaterializeRawgetiRegistryIndex() {
  return LUA53_REGISTRY_INDEX_U32 >>> 0;
}

export function luaEngineMaterializePcallMsgh() {
  return LUA_MATERIALIZE_PCALL_MSGH >>> 0;
}

export function luaEngineMaterializePcallCtx() {
  return LUA_MATERIALIZE_PCALL_CTX >>> 0;
}

export function luaEngineMaterializePcallK() {
  return LUA_MATERIALIZE_PCALL_K >>> 0;
}

/** lua_pushvalue(L, âˆ’1) before luaL_ref. */
export function luaEngineMaterializePushvalueIndex() {
  return LUA_MATERIALIZE_PUSHVALUE_INDEX_U32 >>> 0;
}

/** luaL_ref registry index imm. */
export function luaEngineMaterializeRefRegistryIndex() {
  return LUA53_REGISTRY_INDEX_U32 >>> 0;
}

/** lua_settop(L, âˆ’2) after luaL_ref. */
export function luaEngineMaterializeSettopIndex() {
  return LUA_MATERIALIZE_SETTOP_INDEX_U32 >>> 0;
}

/**
 * out+0 = L store (identity).
 * @param {number} statePtr
 */
export function luaEngineMaterializeOutStateStore(statePtr) {
  return statePtr >>> 0;
}

/**
 * out+4 = luaL_ref result store (identity).
 * @param {number} refValue
 */
export function luaEngineMaterializeOutRefStore(refValue) {
  return refValue >>> 0;
}

/* ---- ABI v14 â€” materialize residual pure CF around first IAT ---- */

/** Holder object L field off (PE mov ebx, [eax] @ 0x0087298e). */
export function luaEngineMaterializeHolderOffState() {
  return LUA_MATERIALIZE_HOLDER_OFF_STATE >>> 0;
}

/** Holder object key field off (PE mov eax, [eax+4] @ 0x00872990). */
export function luaEngineMaterializeHolderOffKey() {
  return LUA_MATERIALIZE_HOLDER_OFF_KEY >>> 0;
}

/**
 * Address of holder L field (holder + 0).
 * @param {number} holder
 */
export function luaEngineMaterializeHolderStateAddr(holder) {
  return (holder + LUA_MATERIALIZE_HOLDER_OFF_STATE) >>> 0;
}

/**
 * Address of holder key field (holder + 4).
 * @param {number} holder
 */
export function luaEngineMaterializeHolderKeyAddr(holder) {
  return (holder + LUA_MATERIALIZE_HOLDER_OFF_KEY) >>> 0;
}

/**
 * PE cdq low dword of lua_Integer (identity bit pattern).
 * @param {number} value s32-as-u32
 */
export function luaEngineMaterializeLuaIntegerLo(value) {
  return value >>> 0;
}

/**
 * PE cdq high dword of lua_Integer (arithmetic sar 31).
 * @param {number} value s32-as-u32
 */
export function luaEngineMaterializeLuaIntegerHi(value) {
  return ((value | 0) >> 31) >>> 0;
}

/** add esp, 0x1c after rawgeti + first pushinteger. */
export function luaEngineMaterializeStackCleanRawgetiPushint() {
  return LUA_MATERIALIZE_STACK_CLEAN_RAWGETI_PUSHINT >>> 0;
}

/** add esp, 0xc after second pushinteger. */
export function luaEngineMaterializeStackCleanPushint() {
  return LUA_MATERIALIZE_STACK_CLEAN_PUSHINT >>> 0;
}

/** add esp, 0x18 after pcallk. */
export function luaEngineMaterializeStackCleanPcall() {
  return LUA_MATERIALIZE_STACK_CLEAN_PCALL >>> 0;
}

/** add esp, 0x18 after success pushvalue/ref/settop triad. */
export function luaEngineMaterializeStackCleanSuccess() {
  return LUA_MATERIALIZE_STACK_CLEAN_SUCCESS >>> 0;
}

/**
 * Success return out pointer (mov eax, esi identity).
 * @param {number} outPtr
 */
export function luaEngineMaterializeReturnOut(outPtr) {
  return outPtr >>> 0;
}

/* ---- ABI v25: FUN_00872980 materialize BODY as an ordered host-event
 * program (independently transcribed from the PE this unit; the Lua VM
 * IAT surface stays address-stable host). ---- */

export const LUA_MATERIALIZE_EVENT_KINDS = Object.freeze([
  LUA_MATERIALIZE_EVENT_RAWGETI,
  LUA_MATERIALIZE_EVENT_PUSHINTEGER_1,
  LUA_MATERIALIZE_EVENT_PUSHINTEGER_2,
  LUA_MATERIALIZE_EVENT_PCALLK,
  LUA_MATERIALIZE_EVENT_PUSHVALUE,
  LUA_MATERIALIZE_EVENT_LUAL_REF,
  LUA_MATERIALIZE_EVENT_SETTOP,
]);

export function luaEngineMaterializeProgramEventCount() {
  return LUA_MATERIALIZE_PROGRAM_EVENT_COUNT;
}

export function luaEngineMaterializeProgramEventKind(index) {
  const i = index | 0;
  return i >= 0 && i < LUA_MATERIALIZE_EVENT_KINDS.length
    ? LUA_MATERIALIZE_EVENT_KINDS[i] : -1;
}

export function luaEngineMaterializeProgramEventIatSlot(index) {
  const i = index | 0;
  if (i < 0 || i >= LUA_MATERIALIZE_PROGRAM_EVENT_COUNT) return 0;
  const byKind = {
    [LUA_MATERIALIZE_EVENT_RAWGETI]: LUA_MATERIALIZE_EVENT_IAT_RAWGETI,
    [LUA_MATERIALIZE_EVENT_PUSHINTEGER_1]: LUA_MATERIALIZE_EVENT_IAT_PUSHINTEGER,
    [LUA_MATERIALIZE_EVENT_PUSHINTEGER_2]: LUA_MATERIALIZE_EVENT_IAT_PUSHINTEGER,
    [LUA_MATERIALIZE_EVENT_PCALLK]: LUA_MATERIALIZE_EVENT_IAT_PCALLK,
    [LUA_MATERIALIZE_EVENT_PUSHVALUE]: LUA_MATERIALIZE_EVENT_IAT_PUSHVALUE,
    [LUA_MATERIALIZE_EVENT_LUAL_REF]: LUA_MATERIALIZE_EVENT_IAT_LUAL_REF,
    [LUA_MATERIALIZE_EVENT_SETTOP]: LUA_MATERIALIZE_EVENT_IAT_SETTOP,
  };
  return byKind[LUA_MATERIALIZE_EVENT_KINDS[i]] >>> 0;
}

export function luaEngineMaterializeProgramEventArgs(index) {
  const i = index | 0;
  if (i < 0 || i >= LUA_MATERIALIZE_PROGRAM_EVENT_COUNT) return 0;
  const byKind = {
    [LUA_MATERIALIZE_EVENT_RAWGETI]: LUA_MATERIALIZE_EVENT_ARGS_RAWGETI,
    [LUA_MATERIALIZE_EVENT_PUSHINTEGER_1]: LUA_MATERIALIZE_EVENT_ARGS_PUSHINTEGER,
    [LUA_MATERIALIZE_EVENT_PUSHINTEGER_2]: LUA_MATERIALIZE_EVENT_ARGS_PUSHINTEGER,
    [LUA_MATERIALIZE_EVENT_PCALLK]: LUA_MATERIALIZE_EVENT_ARGS_PCALLK,
    [LUA_MATERIALIZE_EVENT_PUSHVALUE]: LUA_MATERIALIZE_EVENT_ARGS_PUSHVALUE,
    [LUA_MATERIALIZE_EVENT_LUAL_REF]: LUA_MATERIALIZE_EVENT_ARGS_LUAL_REF,
    [LUA_MATERIALIZE_EVENT_SETTOP]: LUA_MATERIALIZE_EVENT_ARGS_SETTOP,
  };
  return byKind[LUA_MATERIALIZE_EVENT_KINDS[i]] >>> 0;
}

export function luaEngineMaterializeProgramEventIms(index) {
  const i = index | 0;
  if (i < 0 || i >= LUA_MATERIALIZE_PROGRAM_EVENT_COUNT) return 0;
  const byKind = {
    [LUA_MATERIALIZE_EVENT_RAWGETI]: LUA_MATERIALIZE_EVENT_IMS_RAWGETI,
    [LUA_MATERIALIZE_EVENT_PUSHINTEGER_1]: 0,
    [LUA_MATERIALIZE_EVENT_PUSHINTEGER_2]: 0,
    [LUA_MATERIALIZE_EVENT_PCALLK]: LUA_MATERIALIZE_EVENT_IMS_PCALLK,
    [LUA_MATERIALIZE_EVENT_PUSHVALUE]: LUA_MATERIALIZE_EVENT_IMS_PUSHVALUE,
    [LUA_MATERIALIZE_EVENT_LUAL_REF]: LUA_MATERIALIZE_EVENT_IMS_LUAL_REF,
    [LUA_MATERIALIZE_EVENT_SETTOP]: LUA_MATERIALIZE_EVENT_IMS_SETTOP,
  };
  return byKind[LUA_MATERIALIZE_EVENT_KINDS[i]] >>> 0;
}

export function luaEngineMaterializeProgramEventImm(index, slot) {
  const i = index | 0;
  const s = slot | 0;
  if (i < 0 || i >= LUA_MATERIALIZE_PROGRAM_EVENT_COUNT || s < 0) return 0;
  const k = LUA_MATERIALIZE_EVENT_KINDS[i];
  if (k === LUA_MATERIALIZE_EVENT_RAWGETI) {
    return s === 0 ? LUA53_REGISTRY_INDEX_U32 : 0;
  }
  if (k === LUA_MATERIALIZE_EVENT_PCALLK) {
    const row = [LUA_MATERIALIZE_PCALL_MSGH, LUA_MATERIALIZE_PCALL_CTX,
      LUA_MATERIALIZE_PCALL_K, LUA_MATERIALIZE_CALL_NRESULTS,
      LUA_MATERIALIZE_CALL_NARGS];
    return s < row.length ? row[s] : 0;
  }
  if (k === LUA_MATERIALIZE_EVENT_PUSHVALUE) {
    return s === 0 ? LUA_MATERIALIZE_PUSHVALUE_INDEX_U32 : 0;
  }
  if (k === LUA_MATERIALIZE_EVENT_LUAL_REF) {
    return s === 1 ? LUA53_REGISTRY_INDEX_U32 : 0;
  }
  if (k === LUA_MATERIALIZE_EVENT_SETTOP) {
    return s === 0 ? LUA_MATERIALIZE_SETTOP_INDEX_U32 : 0;
  }
  return 0;
}

export function luaEngineMaterializeProgramGate(status) {
  // PE @ 0x008729d4: test eax,eax; jne error â€” success iff status == 0.
  return (status | 0) === 0 ? 1 : 0;
}

export function luaEngineMaterializeOutStateStoreBeforeRef() {
  // out->state @ 0x008729ea BEFORE luaL_ref @ 0x008729ec; out->ref @
  // 0x008729f5 AFTER luaL_ref, BEFORE settop @ 0x008729f8.
  return 1;
}

export function luaEngineMaterializeErrorBuilderVa() {
  return LUA_MATERIALIZE_ERROR_BUILDER_VA >>> 0;
}

export function luaEngineMaterializeErrorRaiserVa() {
  return LUA_MATERIALIZE_ERROR_RAISER_VA >>> 0;
}

export function luaEngineMaterializeErrorPathNoReturn() {
  return 1;
}

export function luaEngineMaterializeErrorBufSize() {
  return LUA_MATERIALIZE_ERROR_BUF_SIZE >>> 0;
}

export function luaEngineMaterializeEntryAlignMask() {
  return LUA_MATERIALIZE_ENTRY_ALIGN_MASK >>> 0;
}

export function luaEngineMaterializeRetDwords() {
  return LUA_MATERIALIZE_RET_DWORDS >>> 0;
}

export function luaEngineMaterializeSuccessRetEnd() {
  return LUA_MATERIALIZE_SUCCESS_RET_END >>> 0;
}

export function luaEngineMaterializeErrorPathStart() {
  return LUA_MATERIALIZE_ERROR_PATH_START >>> 0;
}

export function luaEngineMaterializeFnEnd() {
  return LUA_MATERIALIZE_FN_END >>> 0;
}

/* ---- ABI v15 â€” RegisterClasses structural table-install model ----
 *
 * Reasoned from the instruction stream of LuaEngine::RegisterClasses
 * (entry 0x00866960, single `ret` at 0x0086e4c9, 0x7b6a bytes, straight
 * line except the tail `cmp byte [ebx+0x1c],0` / `jne` at 0x0086e461).
 *
 * The body is two repeated records. The install record is
 *   mov ecx,<receiver> ; add esp,imm8 ; mov edx,imm32 ; push imm32 ;
 *   call rel32
 * emitted in three operand orderings; each ordering encodes to the same
 * number of bytes, so the record stride only depends on whether the
 * receiver load carries a disp8. The builder-chain record is
 *   push a2 ; push a1 ; push a0 ; [mov ecx,eax] ; call rel32
 * where a0 is always an .rdata name pointer.
 */

/** PE section geometry from the image section table. */
export const LUA_PE_TEXT_LO_VA = 0x00401000;
export const LUA_PE_TEXT_HI_VA = 0x00b17134;
export const LUA_PE_RDATA_LO_VA = 0x00b18000;
export const LUA_PE_RDATA_HI_VA = 0x00bf7948;
export const LUA_PE_OPERAND_SECTION_OTHER = 0;
export const LUA_PE_OPERAND_SECTION_TEXT = 1;
export const LUA_PE_OPERAND_SECTION_RDATA = 2;

export const LUA_REGISTER_CLASSES_VA = 0x00866960;
export const LUA_REGISTER_CLASSES_RET_VA = 0x0086e4c9;
export const LUA_REGISTER_CLASSES_BODY_BYTES = 0x7b6a;
export const LUA_REGISTER_FRAME_LOCALS_BYTES = 0x144;
export const LUA_REGISTER_SEH_SCOPE_TABLE_VA = 0x00b04a88;
export const LUA_REGISTER_STACK_COOKIE_DAT = 0x00bf93b4;

export const LUA_REGISTER_PUSH_IMM8_BYTES = 2;
export const LUA_REGISTER_PUSH_IMM32_BYTES = 5;
export const LUA_REGISTER_MOV_EDX_IMM32_BYTES = 5;
export const LUA_REGISTER_CALL_REL32_BYTES = 5;
export const LUA_REGISTER_ADD_ESP_IMM8_BYTES = 3;
export const LUA_REGISTER_MOV_ECX_EAX_BYTES = 2;
export const LUA_REGISTER_RECV_LOAD_DISP8_BYTES = 3;
export const LUA_REGISTER_RECV_LOAD_BASE_BYTES = 2;

export const LUA_REGISTER_INSTALL_TRIAD_BYTES = 0x0f;
export const LUA_REGISTER_INSTALL_RECORD_BYTES_DISP8 = 0x15;
export const LUA_REGISTER_INSTALL_RECORD_BYTES_BASE = 0x14;
export const LUA_REGISTER_INSTALL_CLEANUP_BYTES = 0x04;
export const LUA_REGISTER_INSTALL_SITE_COUNT = 95;
export const LUA_REGISTER_INSTALL_METHOD_COUNT = 85;
export const LUA_REGISTER_INSTALL_META_COUNT = 10;
export const LUA_REGISTER_INSTALL_HELPER_COUNT = 54;
export const LUA_REGISTER_INSTALL_ADJACENT_PAIRS = 82;
export const LUA_REGISTER_INSTALL_META_HELPER_VA = 0x0085bf90;
export const LUA_REGISTER_INSTALL_META_INDEX_U32 = 0xfffffffe;
export const LUA_REGISTER_INSTALL_META_STACK_CLEAN = 0x24;

export const LUA_REGISTER_BUILDER_CHAIN_COUNT = 413;
export const LUA_REGISTER_BUILDER_CHAINED_COUNT = 408;
export const LUA_REGISTER_BUILDER_ARG_COUNT = 3;

export const LUA_REGISTER_EH_STATE_ENTRY = 0;
export const LUA_REGISTER_EH_STATE_UNWOUND_U32 = 0xffffffff;
export const LUA_REGISTER_EH_STATE_MAX = 0x90;
export const LUA_REGISTER_EH_STORE_COUNT = 181;
export const LUA_REGISTER_EH_BYTE_STORE_COUNT = 103;
export const LUA_REGISTER_EH_DWORD_STORE_COUNT = 78;
export const LUA_REGISTER_EH_UNWIND_STORE_COUNT = 36;
export const LUA_REGISTER_EH_BYTE_STORE_BYTES = 4;
export const LUA_REGISTER_EH_DWORD_STORE_BYTES = 7;

export const LUA_REGISTER_DTOR_HELPER_VA = 0x0085cce0;
export const LUA_REGISTER_DTOR_PAYLOAD_DELTA = 0x04;
export const LUA_REGISTER_DTOR_SITE_COUNT = 19;
export const LUA_REGISTER_CLASS_CREATE_COUNT = 37;
export const LUA_REGISTER_CLASS_STACK_REF_HELPER_VA = 0x0085dab0;

export const LUA_REGISTER_VECTOR_FIRST_CALL_VA = 0x00866a82;
export const LUA_REGISTER_VECTOR_LAST_CALL_VA = 0x00866c72;
export const LUA_REGISTER_VECTOR_FIELD_HELPER_VA = 0x00875230;

/**
 * Encoded size of `push imm`. The PE only uses the short 6A form when the
 * dword reinterpreted as a signed byte round-trips.
 * @param {number} value u32
 */
export function luaEngineRegisterPushImmBytes(value) {
  const signed = value | 0;
  const roundTrips = ((signed << 24) >> 24) === signed;
  return roundTrips ? LUA_REGISTER_PUSH_IMM8_BYTES : LUA_REGISTER_PUSH_IMM32_BYTES;
}

/**
 * Encoded size of the receiver load in an install record.
 * @param {number|boolean} baseOnly truthy for `mov ecx,[esi]`
 */
export function luaEngineRegisterRecvLoadBytes(baseOnly) {
  return baseOnly ? LUA_REGISTER_RECV_LOAD_BASE_BYTES : LUA_REGISTER_RECV_LOAD_DISP8_BYTES;
}

/**
 * Encoded size of one whole install record.
 * @param {number|boolean} baseOnly
 */
export function luaEngineRegisterInstallRecordBytes(baseOnly) {
  const fixed =
    LUA_REGISTER_ADD_ESP_IMM8_BYTES +
    LUA_REGISTER_MOV_EDX_IMM32_BYTES +
    LUA_REGISTER_PUSH_IMM32_BYTES +
    LUA_REGISTER_CALL_REL32_BYTES;
  return luaEngineRegisterRecvLoadBytes(baseOnly) + fixed;
}

/**
 * VA of the next adjacent install `call` (32-bit wrap).
 * @param {number} prevCallVa
 * @param {number|boolean} baseOnly receiver form of the next record
 */
export function luaEngineRegisterInstallNextCallVa(prevCallVa, baseOnly) {
  return (prevCallVa + luaEngineRegisterInstallRecordBytes(baseOnly)) >>> 0;
}

/**
 * Encoded size of one builder-chain entry.
 * @param {number} arg0 first cdecl arg (pushed last) â€” .rdata name VA
 * @param {number} arg1
 * @param {number} arg2 last cdecl arg (pushed first)
 * @param {number|boolean} chained `mov ecx, eax` present
 */
export function luaEngineRegisterBuilderEntryBytes(arg0, arg1, arg2, chained) {
  const pushes =
    luaEngineRegisterPushImmBytes(arg2) +
    luaEngineRegisterPushImmBytes(arg1) +
    luaEngineRegisterPushImmBytes(arg0);
  const recv = chained ? LUA_REGISTER_MOV_ECX_EAX_BYTES : 0;
  return pushes + recv + LUA_REGISTER_CALL_REL32_BYTES;
}

/**
 * `call rel32` target: rel32 is relative to the end of the 5-byte insn.
 * @param {number} siteVa
 * @param {number} rel32
 */
export function luaEngineRegisterCallTarget(siteVa, rel32) {
  return (siteVa + LUA_REGISTER_CALL_REL32_BYTES + rel32) >>> 0;
}

/**
 * Inverse of luaEngineRegisterCallTarget.
 * @param {number} siteVa
 * @param {number} targetVa
 */
export function luaEngineRegisterCallRel32(siteVa, targetVa) {
  return (targetVa - (siteVa + LUA_REGISTER_CALL_REL32_BYTES)) >>> 0;
}

/**
 * Classify an install operand by PE section.
 * @param {number} value u32
 */
export function luaEngineRegisterOperandSection(value) {
  const v = value >>> 0;
  if (v >= LUA_PE_TEXT_LO_VA && v < LUA_PE_TEXT_HI_VA) {
    return LUA_PE_OPERAND_SECTION_TEXT;
  }
  if (v >= LUA_PE_RDATA_LO_VA && v < LUA_PE_RDATA_HI_VA) {
    return LUA_PE_OPERAND_SECTION_RDATA;
  }
  return LUA_PE_OPERAND_SECTION_OTHER;
}

/**
 * Metamethod install sites put the relative table index in edx.
 * @param {number} edxImm
 */
export function luaEngineRegisterInstallIsMetamethod(edxImm) {
  return (edxImm >>> 0) === (LUA_REGISTER_INSTALL_META_INDEX_U32 >>> 0) ? 1 : 0;
}

/**
 * Name string VA of an install site.
 * @param {number} edxImm
 * @param {number} pushImm
 */
export function luaEngineRegisterInstallNameVa(edxImm, pushImm) {
  return luaEngineRegisterInstallIsMetamethod(edxImm) ? pushImm >>> 0 : edxImm >>> 0;
}

/**
 * Code target VA of an install site (0 on metamethod sites).
 * @param {number} edxImm
 * @param {number} pushImm
 */
export function luaEngineRegisterInstallTargetVa(edxImm, pushImm) {
  return luaEngineRegisterInstallIsMetamethod(edxImm) ? 0 : pushImm >>> 0;
}

/**
 * Section split observed on every install site in the body.
 * @param {number} edxImm
 * @param {number} pushImm
 */
export function luaEngineRegisterInstallOperandsWellFormed(edxImm, pushImm) {
  const pushSec = luaEngineRegisterOperandSection(pushImm);
  if (luaEngineRegisterInstallIsMetamethod(edxImm)) {
    return pushSec === LUA_PE_OPERAND_SECTION_RDATA ? 1 : 0;
  }
  const edxSec = luaEngineRegisterOperandSection(edxImm);
  return edxSec === LUA_PE_OPERAND_SECTION_RDATA && pushSec === LUA_PE_OPERAND_SECTION_TEXT
    ? 1
    : 0;
}

/**
 * Result of storing the MSVC EH state. The byte form touches only bits 0..7.
 * @param {number} prevState u32
 * @param {number} value u32
 * @param {number|boolean} byteForm
 */
export function luaEngineRegisterEhStateApply(prevState, value, byteForm) {
  if (!byteForm) return value >>> 0;
  return (((prevState >>> 8) << 8) | (value & 0xff)) >>> 0;
}

/**
 * Whether the byte form yields the intended state given the incoming one.
 * @param {number} prevState u32
 */
export function luaEngineRegisterEhByteFormSafe(prevState) {
  return (prevState >>> 0) < 0x100 ? 1 : 0;
}

/**
 * Encoded size of the EH state store.
 * @param {number|boolean} byteForm
 */
export function luaEngineRegisterEhStoreBytes(byteForm) {
  return byteForm ? LUA_REGISTER_EH_BYTE_STORE_BYTES : LUA_REGISTER_EH_DWORD_STORE_BYTES;
}

/**
 * Address of the dword the scope-exit dtor receives (local + 4).
 * @param {number} localAddr
 */
export function luaEngineRegisterDtorPayloadAddr(localAddr) {
  return (localAddr + LUA_REGISTER_DTOR_PAYLOAD_DELTA) >>> 0;
}

/**
 * Address of the Lua state field every class-create prologue loads.
 * @param {number} enginePtr
 */
export function luaEngineRegisterClassStateAddr(enginePtr) {
  return (enginePtr + LUA_ENGINE_OFF_STATE) >>> 0;
}

/** Vector class install entries, in PE order (0x00866a82 â€¦ 0x00866c72). */
export const LUA_REGISTER_VECTOR_INSTALLS = Object.freeze([
  { callVa: 0x00866a82, nameVa: 0x00b75378, targetVa: 0, helperVa: 0x0085bf90, meta: 1, adjacent: 0 },
  { callVa: 0x00866a97, nameVa: 0x00b701c0, targetVa: 0x00a0ffc0, helperVa: 0x008a05a0, meta: 0, adjacent: 1 },
  { callVa: 0x00866aac, nameVa: 0x00b701cc, targetVa: 0x00a10030, helperVa: 0x008a0500, meta: 0, adjacent: 1 },
  { callVa: 0x00866ac1, nameVa: 0x00b701b4, targetVa: 0x00a10180, helperVa: 0x008a0460, meta: 0, adjacent: 1 },
  { callVa: 0x00866ad6, nameVa: 0x00b701b8, targetVa: 0x00a101a0, helperVa: 0x008a0460, meta: 0, adjacent: 1 },
  { callVa: 0x00866aeb, nameVa: 0x00b70244, targetVa: 0x00a10210, helperVa: 0x008a0400, meta: 0, adjacent: 1 },
  { callVa: 0x00866b00, nameVa: 0x00b7024c, targetVa: 0x00a0ff30, helperVa: 0x008a0460, meta: 0, adjacent: 1 },
  { callVa: 0x00866b15, nameVa: 0x00b7022c, targetVa: 0x00a0ff90, helperVa: 0x008a0460, meta: 0, adjacent: 1 },
  { callVa: 0x00866b2a, nameVa: 0x00b7023c, targetVa: 0x00a102e0, helperVa: 0x008a0360, meta: 0, adjacent: 1 },
  { callVa: 0x00866b61, nameVa: 0x00b70210, targetVa: 0, helperVa: 0x0085bf90, meta: 1, adjacent: 0 },
  { callVa: 0x00866b76, nameVa: 0x00b7021c, targetVa: 0x00a10390, helperVa: 0x008a0220, meta: 0, adjacent: 1 },
  { callVa: 0x00866b8b, nameVa: 0x00b70200, targetVa: 0x00a100b0, helperVa: 0x008a01c0, meta: 0, adjacent: 1 },
  { callVa: 0x00866ba0, nameVa: 0x00b70208, targetVa: 0x00a10100, helperVa: 0x008a0360, meta: 0, adjacent: 1 },
  { callVa: 0x00866bb5, nameVa: 0x00b70290, targetVa: 0x00a103c0, helperVa: 0x008a0160, meta: 0, adjacent: 1 },
  { callVa: 0x00866bca, nameVa: 0x00b70298, targetVa: 0x00a103f0, helperVa: 0x008a00c0, meta: 0, adjacent: 1 },
  { callVa: 0x00866bdf, nameVa: 0x00b70278, targetVa: 0x00a0fea0, helperVa: 0x008a0220, meta: 0, adjacent: 1 },
  { callVa: 0x00866bf4, nameVa: 0x00b70280, targetVa: 0x00a0fed0, helperVa: 0x008a0220, meta: 0, adjacent: 1 },
  { callVa: 0x00866c09, nameVa: 0x00b70268, targetVa: 0x00a10420, helperVa: 0x008a0020, meta: 0, adjacent: 1 },
  { callVa: 0x00866c1e, nameVa: 0x00b70270, targetVa: 0x00a10480, helperVa: 0x008a0020, meta: 0, adjacent: 1 },
  { callVa: 0x00866c33, nameVa: 0x00b70258, targetVa: 0x00a104e0, helperVa: 0x0089ff80, meta: 0, adjacent: 1 },
  { callVa: 0x00866c48, nameVa: 0x00b70260, targetVa: 0x00a105a0, helperVa: 0x0089ff80, meta: 0, adjacent: 1 },
  { callVa: 0x00866c5d, nameVa: 0x00b702f8, targetVa: 0x00a10660, helperVa: 0x008a0500, meta: 0, adjacent: 1 },
  { callVa: 0x00866c72, nameVa: 0x00b70300, targetVa: 0x0085e630, helperVa: 0x0089fee0, meta: 0, adjacent: 1 },
]);

/** Trailing Vector property entries (builder 0x00875230; ABI v19 adds the
 *  per-entry call site and builder VAs, reproduced by the v19 census). */
export const LUA_REGISTER_VECTOR_FIELDS = Object.freeze([
  { nameVa: 0x00b6a748, arg1: 0x00000000, arg2: 0x00000001, callVa: 0x00866c86, builderVa: 0x00875230 },
  { nameVa: 0x00b6d134, arg1: 0x00000004, arg2: 0x00000001, callVa: 0x00866c96, builderVa: 0x00875230 },
]);

export const LUA_REGISTER_VECTOR_INSTALL_COUNT = LUA_REGISTER_VECTOR_INSTALLS.length;
export const LUA_REGISTER_VECTOR_FIELD_COUNT = LUA_REGISTER_VECTOR_FIELDS.length;

function vectorInstallAt(index) {
  return Number.isInteger(index) && index >= 0 && index < LUA_REGISTER_VECTOR_INSTALLS.length
    ? LUA_REGISTER_VECTOR_INSTALLS[index]
    : null;
}

function vectorFieldAt(index) {
  return Number.isInteger(index) && index >= 0 && index < LUA_REGISTER_VECTOR_FIELDS.length
    ? LUA_REGISTER_VECTOR_FIELDS[index]
    : null;
}

/** Number of Vector install entries. */
export function luaEngineRegisterVectorInstallCount() {
  return LUA_REGISTER_VECTOR_INSTALL_COUNT;
}

/** @param {number} index */
export function luaEngineRegisterVectorInstallCallVa(index) {
  const e = vectorInstallAt(index);
  return e ? e.callVa >>> 0 : 0;
}

/** @param {number} index */
export function luaEngineRegisterVectorInstallNameVa(index) {
  const e = vectorInstallAt(index);
  return e ? e.nameVa >>> 0 : 0;
}

/** @param {number} index */
export function luaEngineRegisterVectorInstallTargetVa(index) {
  const e = vectorInstallAt(index);
  return e ? e.targetVa >>> 0 : 0;
}

/** @param {number} index */
export function luaEngineRegisterVectorInstallHelperVa(index) {
  const e = vectorInstallAt(index);
  return e ? e.helperVa >>> 0 : 0;
}

/** @param {number} index */
export function luaEngineRegisterVectorInstallIsMetamethod(index) {
  const e = vectorInstallAt(index);
  return e ? e.meta : -1;
}

/** @param {number} index */
export function luaEngineRegisterVectorInstallAdjacent(index) {
  const e = vectorInstallAt(index);
  return e ? e.adjacent : -1;
}

/** Number of Vector property entries. */
export function luaEngineRegisterVectorFieldCount() {
  return LUA_REGISTER_VECTOR_FIELD_COUNT;
}

/** @param {number} index */
export function luaEngineRegisterVectorFieldNameVa(index) {
  const e = vectorFieldAt(index);
  return e ? e.nameVa >>> 0 : 0;
}

/** @param {number} index */
export function luaEngineRegisterVectorFieldArg1(index) {
  const e = vectorFieldAt(index);
  return e ? e.arg1 >>> 0 : 0;
}

/** @param {number} index */
export function luaEngineRegisterVectorFieldArg2(index) {
  const e = vectorFieldAt(index);
  return e ? e.arg2 >>> 0 : 0;
}

/* ---- ABI v16 â€” the single RegisterClasses branch, its tail, per-class table ----
 *
 * Reasoned from the instruction stream on both sides of the boundary.
 *
 * Producer side, LuaEngine::Init (0x008604c0, `ret 4`, one stack argument):
 *   0x008605b0  cmp byte ptr [ebp + 8], 0      ; the same byte, ABI v2
 *   0x008605b4  je  0x0086060f
 *   ... both arms converge on 0x00860647 ...
 *   0x00860647  mov al, byte ptr [ebp + 8]
 *   0x0086064a  mov ecx, esi
 *   0x0086064c  mov byte ptr [esi + 0x1c], al  ; capture point
 *   0x0086064f  call 0x00866960                ; the ONLY call to it
 *
 * Consumer side, RegisterClasses tail:
 *   0x0086e461  cmp byte ptr [ebx + 0x1c], 0
 *   0x0086e465  jne 0x0086e483                 ; skip the guarded record
 *
 * Since nothing between the store and the call is a call or a branch target,
 * the branch input is exactly the low byte of the Init argument. It is not
 * constant: the boot caller passes a runtime local and the two reload callers
 * pass the engine's own current byte back through the same parameter, so it
 * is modelled as a captured input with both sides translated.
 */

export const LUA_INIT_VA = 0x008604c0;
export const LUA_INIT_DEBUG_ARG_STACK_OFF = 8;
export const LUA_INIT_DEBUG_ARG_TEST_VA = 0x008605b0;
export const LUA_INIT_DEBUG_ARG_RELOAD_VA = 0x00860647;
export const LUA_INIT_DEBUG_ARG_STORE_VA = 0x0086064c;
export const LUA_REGISTER_CLASSES_CALL_SITE_VA = 0x0086064f;
export const LUA_REGISTER_CLASSES_CALLER_COUNT = 1;
export const LUA_REGISTER_CLASSES_DATA_REF_COUNT = 0;
export const LUA_INIT_CALLER_COUNT = 3;
export const LUA_INIT_CALLER_BOOT_VA = 0x009aa6f7;
export const LUA_INIT_CALLER_RELOAD_A_VA = 0x008f8c28;
export const LUA_INIT_CALLER_RELOAD_B_VA = 0x009b246f;
export const LUA_INIT_STORE_TO_CALL_INSNS = 1;

export const LUA_REGISTER_TAIL_GATE_VA = 0x0086e461;
export const LUA_REGISTER_TAIL_GATE_SKIP_VA = 0x0086e483;
export const LUA_REGISTER_TAIL_START_VA = 0x0086e43f;
export const LUA_REGISTER_GLOBAL_RECORD_BYTES = 28;
export const LUA_REGISTER_GLOBAL_RECORD_BYTES_MERGED = 25;
export const LUA_REGISTER_GLOBAL_CLOSURE_NUPS = 0;
export const LUA_REGISTER_GLOBAL_PUSHCCLOSURE_CLEAN = 0x0c;
export const LUA_REGISTER_GLOBAL_SETGLOBAL_CLEAN = 0x08;
export const LUA_REGISTER_GLOBAL_MERGED_CLEAN = 0x14;
export const LUA_REGISTER_GLOBAL_GATED_INDEX = 1;
export const LUA_REGISTER_PUSHCCLOSURE_IAT_VA = 0x00b183fc;
export const LUA_REGISTER_SETGLOBAL_IAT_VA = 0x00b18340;

export const LUA_REGISTER_CLOSURE_PRELUDE_FIXED_BYTES = 28;
export const LUA_REGISTER_CLOSURE_PRELUDE_COUNT = 2;
export const LUA_REGISTER_CLOSURE_PRELUDE_BYTES_DISP8 = 34;
export const LUA_REGISTER_CLOSURE_PRELUDE_BYTES_BASE = 32;
export const LUA_REGISTER_CLOSURE_PRELUDE_A_VA = 0x00866b2f;
export const LUA_REGISTER_CLOSURE_PRELUDE_B_VA = 0x00867169;
export const LUA_REGISTER_INSTALL_GAP_COUNT = 12;
export const LUA_REGISTER_INSTALL_PRELUDE_GAPS = 2;
export const LUA_REGISTER_INSTALL_OTHER_GAPS = 10;

export const LUA_REGISTER_CLASS_ENTITYPTR = 0;
export const LUA_REGISTER_CLASS_VECTOR = 1;
export const LUA_REGISTER_CLASS_KCOLOR = 2;

/**
 * The byte written at 0x0086064c: `mov al, byte ptr [ebp+8]` keeps only the
 * low 8 bits of the pushed dword.
 * @param {number} initDebugArg u32 as pushed
 */
export function luaEngineRegisterDebugByteAtEntry(initDebugArg) {
  return (initDebugArg & 0xff) >>> 0;
}

/**
 * Reload callers re-read the stored byte with `movzx` and push it back into
 * the same bool parameter.
 * @param {number} storedByte
 */
export function luaEngineInitReloadDebugArg(storedByte) {
  return (storedByte & 0xff) >>> 0;
}

/**
 * `cmp byte [ebx+0x1c],0 / jne` â€” 1 when the guarded record executes.
 * @param {number} debugByte
 */
export function luaEngineRegisterRequireInstallGate(debugByte) {
  return (debugByte & 0xff) === 0 ? 1 : 0;
}

/**
 * The gate must be the exact complement of the ABI v2 Init debug predicate,
 * because both read the same byte.
 * @param {number} debugByte
 */
export function luaEngineRegisterGateComplementsInit(debugByte) {
  const gate = luaEngineRegisterRequireInstallGate(debugByte);
  const initDebug = luaEngineInitTakeDebugPath(debugByte & 0xff);
  return gate === (initDebug ? 0 : 1) ? 1 : 0;
}

/**
 * Tail global-install record size. The merged form drops one `add esp,imm8`.
 * @param {number|boolean} mergedCleanup
 */
export function luaEngineRegisterGlobalRecordBytes(mergedCleanup) {
  return mergedCleanup
    ? LUA_REGISTER_GLOBAL_RECORD_BYTES_MERGED
    : LUA_REGISTER_GLOBAL_RECORD_BYTES;
}

/** Tail global installs, in PE order. */
export const LUA_REGISTER_TAIL_GLOBALS = Object.freeze([
  { pushcclosureVa: 0x0086e449, cfuncVa: 0x008603d0, nameVa: 0x00b75254, gated: 0 },
  { pushcclosureVa: 0x0086e471, cfuncVa: 0x0085fec0, nameVa: 0x00b75260, gated: 1 },
  { pushcclosureVa: 0x0086e48d, cfuncVa: 0x00860000, nameVa: 0x00b75244, gated: 0 },
  { pushcclosureVa: 0x0086e4a6, cfuncVa: 0x008601f0, nameVa: 0x00b7524c, gated: 0 },
]);

export const LUA_REGISTER_GLOBAL_COUNT = LUA_REGISTER_TAIL_GLOBALS.length;

function tailGlobalAt(index) {
  return Number.isInteger(index) && index >= 0 && index < LUA_REGISTER_TAIL_GLOBALS.length
    ? LUA_REGISTER_TAIL_GLOBALS[index]
    : null;
}

/** Number of tail global installs. */
export function luaEngineRegisterGlobalCount() {
  return LUA_REGISTER_GLOBAL_COUNT;
}

/** @param {number} index */
export function luaEngineRegisterGlobalPushcclosureVa(index) {
  const e = tailGlobalAt(index);
  return e ? e.pushcclosureVa >>> 0 : 0;
}

/** @param {number} index */
export function luaEngineRegisterGlobalCfuncVa(index) {
  const e = tailGlobalAt(index);
  return e ? e.cfuncVa >>> 0 : 0;
}

/** @param {number} index */
export function luaEngineRegisterGlobalNameVa(index) {
  const e = tailGlobalAt(index);
  return e ? e.nameVa >>> 0 : 0;
}

/** @param {number} index */
export function luaEngineRegisterGlobalGated(index) {
  const e = tailGlobalAt(index);
  return e ? e.gated : -1;
}

/**
 * Whether a tail global is installed for a captured debug byte.
 * @param {number} index
 * @param {number} debugByte
 */
export function luaEngineRegisterGlobalInstalled(index, debugByte) {
  const e = tailGlobalAt(index);
  if (!e) return -1;
  if (!e.gated) return 1;
  return luaEngineRegisterRequireInstallGate(debugByte);
}

/**
 * How many tail globals run for a captured debug byte.
 * @param {number} debugByte
 */
export function luaEngineRegisterGlobalInstalledCount(debugByte) {
  let total = 0;
  for (let i = 0; i < LUA_REGISTER_TAIL_GLOBALS.length; i += 1) {
    if (luaEngineRegisterGlobalInstalled(i, debugByte) === 1) total += 1;
  }
  return total;
}

/**
 * Closure-install prelude size â€” only the two `push <L>` encodings vary.
 * @param {number|boolean} baseOnly truthy for `push dword [esi]`
 */
export function luaEngineRegisterClosurePreludeBytes(baseOnly) {
  const pushL = baseOnly
    ? LUA_REGISTER_RECV_LOAD_BASE_BYTES
    : LUA_REGISTER_RECV_LOAD_DISP8_BYTES;
  return LUA_REGISTER_CLOSURE_PRELUDE_FIXED_BYTES + pushL + pushL;
}

/**
 * Next install call VA across a closure-install prelude (32-bit wrap).
 * @param {number} prevCallVa
 * @param {number|boolean} preludeBaseOnly
 * @param {number|boolean} recvBaseOnly
 */
export function luaEngineRegisterInstallNextCallVaAfterPrelude(
  prevCallVa,
  preludeBaseOnly,
  recvBaseOnly,
) {
  const span =
    luaEngineRegisterClosurePreludeBytes(preludeBaseOnly) +
    luaEngineRegisterInstallRecordBytes(recvBaseOnly);
  return (prevCallVa + span) >>> 0;
}

const ENTITYPTR_INSTALLS = Object.freeze([
  { callVa: 0x008669d3, nameVa: 0x00b75378, targetVa: 0, helperVa: 0x0085bf90, meta: 1, adjacent: 0 },
  { callVa: 0x008669e8, nameVa: 0x00b701f0, targetVa: 0x00872050, helperVa: 0x008a06a0, meta: 0, adjacent: 1 },
]);

const KCOLOR_INSTALLS = Object.freeze([
  { callVa: 0x00866d1b, nameVa: 0x00b75378, targetVa: 0, helperVa: 0x0085bf90, meta: 1, adjacent: 0 },
]);

const KCOLOR_FIELDS = Object.freeze([
  { nameVa: 0x00b6d1cc, arg1: 0x0000000c, arg2: 0x00000001, callVa: 0x00866d2f, builderVa: 0x008753a0 },
  { nameVa: 0x00b633c4, arg1: 0x00000000, arg2: 0x00000001, callVa: 0x00866d3f, builderVa: 0x008753a0 },
  { nameVa: 0x00b702f0, arg1: 0x00000004, arg2: 0x00000001, callVa: 0x00866d4f, builderVa: 0x008753a0 },
  { nameVa: 0x00b634c0, arg1: 0x00000008, arg2: 0x00000001, callVa: 0x00866d5f, builderVa: 0x008753a0 },
]);

/* ABI v17 â€” recovered from the class-span rule (span = own create call ..
 * next create call; every install in the span uses the slot the create
 * `lea ecx, [ebp-slot]` wrote). 13/13 and 10/10 receiver agreement. */
const FONTRENDERSETTINGS_INSTALLS = Object.freeze([
  { callVa: 0x00866da2, nameVa: 0x00b75378, targetVa: 0, helperVa: 0x0085bf90, meta: 1, adjacent: 0 },
  { callVa: 0x00866db7, nameVa: 0x00b702d8, targetVa: 0x00a1a5c0, helperVa: 0x0089fe80, meta: 0, adjacent: 1 },
  { callVa: 0x00866dcc, nameVa: 0x00b702a0, targetVa: 0x0040c3a0, helperVa: 0x0089fde0, meta: 0, adjacent: 1 },
  { callVa: 0x00866de1, nameVa: 0x00b702b0, targetVa: 0x00a1a5d0, helperVa: 0x0089fd80, meta: 0, adjacent: 1 },
  { callVa: 0x00866df6, nameVa: 0x00b70394, targetVa: 0x00a1a5e0, helperVa: 0x0089fce0, meta: 0, adjacent: 1 },
  { callVa: 0x00866e0b, nameVa: 0x00b703a8, targetVa: 0x0085e450, helperVa: 0x0089fd80, meta: 0, adjacent: 1 },
  { callVa: 0x00866e20, nameVa: 0x00b7036c, targetVa: 0x00a1a5f0, helperVa: 0x0089fc40, meta: 0, adjacent: 1 },
  { callVa: 0x00866e35, nameVa: 0x00b70380, targetVa: 0x00a1a600, helperVa: 0x0089fd80, meta: 0, adjacent: 1 },
  { callVa: 0x00866e4a, nameVa: 0x00b70340, targetVa: 0x00a1a620, helperVa: 0x0089fc40, meta: 0, adjacent: 1 },
  { callVa: 0x00866e5f, nameVa: 0x00b70354, targetVa: 0x00407280, helperVa: 0x0089fbe0, meta: 0, adjacent: 1 },
  { callVa: 0x00866e74, nameVa: 0x00b7030c, targetVa: 0x00407270, helperVa: 0x0089fb40, meta: 0, adjacent: 1 },
  { callVa: 0x00866e89, nameVa: 0x00b70324, targetVa: 0x00a1a630, helperVa: 0x0089fae0, meta: 0, adjacent: 1 },
  { callVa: 0x00866e9e, nameVa: 0x00b70408, targetVa: 0x0040c2e0, helperVa: 0x0089fa40, meta: 0, adjacent: 1 },
]);

const FONT_INSTALLS = Object.freeze([
  { callVa: 0x00866ee7, nameVa: 0x00b75378, targetVa: 0, helperVa: 0x0085bf90, meta: 1, adjacent: 0 },
  { callVa: 0x00866efc, nameVa: 0x00b703f8, targetVa: 0x0085e470, helperVa: 0x0089f9e0, meta: 0, adjacent: 1 },
  { callVa: 0x00866f11, nameVa: 0x00b70400, targetVa: 0x00a1ad90, helperVa: 0x0089f980, meta: 0, adjacent: 1 },
  { callVa: 0x00866f26, nameVa: 0x00b703d8, targetVa: 0x006b83d0, helperVa: 0x0089f8e0, meta: 0, adjacent: 1 },
  { callVa: 0x00866f3b, nameVa: 0x00b703e4, targetVa: 0x00a1ae70, helperVa: 0x0089f840, meta: 0, adjacent: 1 },
  { callVa: 0x00866f50, nameVa: 0x00b703b8, targetVa: 0x00a1ae80, helperVa: 0x0089f7a0, meta: 0, adjacent: 1 },
  { callVa: 0x00866f65, nameVa: 0x00b703c8, targetVa: 0x00a1aea0, helperVa: 0x0089f700, meta: 0, adjacent: 1 },
  { callVa: 0x00866f7a, nameVa: 0x00b70454, targetVa: 0x00a1aeb0, helperVa: 0x0089f700, meta: 0, adjacent: 1 },
  { callVa: 0x00866f8f, nameVa: 0x00b70468, targetVa: 0x00a1b140, helperVa: 0x0089f660, meta: 0, adjacent: 1 },
  { callVa: 0x00866fa4, nameVa: 0x00b7043c, targetVa: 0x00a1b3b0, helperVa: 0x0089f600, meta: 0, adjacent: 1 },
]);

/* ---- ABI v19 â€” Color and Sprite spans, populated via the property-builder
 * return contract. Install rows are the machine-extracted (edx, push)
 * operand pairs from the span walk (receiver census 14/14 and 45/45
 * resolved, 0 unresolved); field rows are the family call sites. ---- */

const COLOR_INSTALLS = Object.freeze([
  { callVa: 0x00867077, nameVa: 0x00b75378, targetVa: 0, helperVa: 0x0085bf90, meta: 1, adjacent: 0 },
  { callVa: 0x00867128, nameVa: 0x00b1ce7c, targetVa: 0x00682ed0, helperVa: 0x0089f4a0, meta: 0, adjacent: 0 },
  { callVa: 0x0086713c, nameVa: 0x00b704b4, targetVa: 0x00682f20, helperVa: 0x0089f440, meta: 0, adjacent: 1 },
  { callVa: 0x00867150, nameVa: 0x00b704bc, targetVa: 0x00682fb0, helperVa: 0x0089f440, meta: 0, adjacent: 1 },
  { callVa: 0x00867164, nameVa: 0x00b704a0, targetVa: 0x00682fe0, helperVa: 0x0089f3e0, meta: 0, adjacent: 1 },
  // after closure prelude B (0x00867169); rawsetfield form (edx = -2)
  { callVa: 0x00867198, nameVa: 0x00b70244, targetVa: 0, helperVa: 0x0085bf90, meta: 1, adjacent: 0 },
  { callVa: 0x008671ac, nameVa: 0x00b70258, targetVa: 0x006831c0, helperVa: 0x0089f250, meta: 0, adjacent: 1 },
]);

const SPRITE_INSTALLS = Object.freeze([
  { callVa: 0x0086723d, nameVa: 0x00b75378, targetVa: 0, helperVa: 0x0085bf90, meta: 1, adjacent: 0 },
  { callVa: 0x00867252, nameVa: 0x00b7048c, targetVa: 0x0040a530, helperVa: 0x0089f1b0, meta: 0, adjacent: 1 },
  { callVa: 0x00867267, nameVa: 0x00b70498, targetVa: 0x0040a360, helperVa: 0x0089f150, meta: 0, adjacent: 1 },
  { callVa: 0x0086727c, nameVa: 0x00b70474, targetVa: 0x0040a690, helperVa: 0x0089f0f0, meta: 0, adjacent: 1 },
  { callVa: 0x00867291, nameVa: 0x00b70480, targetVa: 0x0040a720, helperVa: 0x0089f090, meta: 0, adjacent: 1 },
  { callVa: 0x008672a6, nameVa: 0x00b1ce7c, targetVa: 0x00407f10, helperVa: 0x0089f030, meta: 0, adjacent: 1 },
  { callVa: 0x008672bb, nameVa: 0x00b70518, targetVa: 0x00409100, helperVa: 0x0089f030, meta: 0, adjacent: 1 },
  { callVa: 0x008672d0, nameVa: 0x00b70520, targetVa: 0x0040a0d0, helperVa: 0x0089efd0, meta: 0, adjacent: 1 },
  { callVa: 0x008672e5, nameVa: 0x00b70504, targetVa: 0x0040a140, helperVa: 0x0089ef70, meta: 0, adjacent: 1 },
  { callVa: 0x008672fa, nameVa: 0x00b703f8, targetVa: 0x0040bd50, helperVa: 0x0089f150, meta: 0, adjacent: 1 },
  { callVa: 0x0086730f, nameVa: 0x00b70510, targetVa: 0x0040bea0, helperVa: 0x0089f030, meta: 0, adjacent: 1 },
  { callVa: 0x00867324, nameVa: 0x00b704e0, targetVa: 0x0040bf30, helperVa: 0x0089ef10, meta: 0, adjacent: 1 },
  { callVa: 0x00867339, nameVa: 0x00b704f4, targetVa: 0x0040bff0, helperVa: 0x0089f030, meta: 0, adjacent: 1 },
  { callVa: 0x0086734e, nameVa: 0x00b703d8, targetVa: 0x00420160, helperVa: 0x0089ee70, meta: 0, adjacent: 1 },
  { callVa: 0x00867363, nameVa: 0x00b704c8, targetVa: 0x004312e0, helperVa: 0x0089edd0, meta: 0, adjacent: 1 },
  { callVa: 0x00867378, nameVa: 0x00b704d4, targetVa: 0x0040a2b0, helperVa: 0x0089ed70, meta: 0, adjacent: 1 },
  { callVa: 0x0086738d, nameVa: 0x00b1d6f4, targetVa: 0x0040a910, helperVa: 0x0089f030, meta: 0, adjacent: 1 },
  { callVa: 0x008673a2, nameVa: 0x00b70590, targetVa: 0x0040a5b0, helperVa: 0x0089ed10, meta: 0, adjacent: 1 },
  { callVa: 0x008673b7, nameVa: 0x00b705a0, targetVa: 0x0040a780, helperVa: 0x0089ec70, meta: 0, adjacent: 1 },
  { callVa: 0x008673cc, nameVa: 0x00b70574, targetVa: 0x0040a760, helperVa: 0x0089f030, meta: 0, adjacent: 1 },
  { callVa: 0x008673e1, nameVa: 0x00b70584, targetVa: 0x0040a4b0, helperVa: 0x0089f1b0, meta: 0, adjacent: 1 },
  { callVa: 0x008673f6, nameVa: 0x00b70558, targetVa: 0x0040a7e0, helperVa: 0x0089ec10, meta: 0, adjacent: 1 },
  { callVa: 0x0086740b, nameVa: 0x00b70568, targetVa: 0x0040a920, helperVa: 0x0089f150, meta: 0, adjacent: 1 },
  { callVa: 0x00867420, nameVa: 0x00b70528, targetVa: 0x0040aad0, helperVa: 0x0089ed10, meta: 0, adjacent: 1 },
  { callVa: 0x00867435, nameVa: 0x00b7053c, targetVa: 0x00431300, helperVa: 0x0089ebb0, meta: 0, adjacent: 1 },
  { callVa: 0x0086744a, nameVa: 0x00b7061c, targetVa: 0x0040abb0, helperVa: 0x0089f0f0, meta: 0, adjacent: 1 },
  { callVa: 0x0086745f, nameVa: 0x00b7062c, targetVa: 0x0040ac50, helperVa: 0x0089eb50, meta: 0, adjacent: 1 },
  { callVa: 0x00867474, nameVa: 0x00b705f8, targetVa: 0x0040ac60, helperVa: 0x0089f030, meta: 0, adjacent: 1 },
  { callVa: 0x00867489, nameVa: 0x00b70608, targetVa: 0x0040a9d0, helperVa: 0x0089f1b0, meta: 0, adjacent: 1 },
  { callVa: 0x0086749e, nameVa: 0x00b705d0, targetVa: 0x0040aa50, helperVa: 0x0089f1b0, meta: 0, adjacent: 1 },
  { callVa: 0x008674b3, nameVa: 0x00b705e4, targetVa: 0x0040b000, helperVa: 0x0089f1b0, meta: 0, adjacent: 1 },
  { callVa: 0x008674c8, nameVa: 0x00b705ac, targetVa: 0x0040b060, helperVa: 0x0089f1b0, meta: 0, adjacent: 1 },
  { callVa: 0x008674dd, nameVa: 0x00b705c0, targetVa: 0x00440e40, helperVa: 0x0089eab0, meta: 0, adjacent: 1 },
  { callVa: 0x008674f2, nameVa: 0x00b7068c, targetVa: 0x004a5cf0, helperVa: 0x0089ea10, meta: 0, adjacent: 1 },
  // [esi] receiver after the Offset/Scale/Rotation/Color property chain
  { callVa: 0x00867561, nameVa: 0x00b70678, targetVa: 0x0040b590, helperVa: 0x0089e610, meta: 0, adjacent: 0 },
  // [esi] receiver after the FlipX/FlipY/PlaybackSpeed property chain
  { callVa: 0x008675b9, nameVa: 0x00b7063c, targetVa: 0x004a5cf0, helperVa: 0x0089ea10, meta: 0, adjacent: 0 },
  { callVa: 0x008675cd, nameVa: 0x00b70650, targetVa: 0x0085db20, helperVa: 0x0089edd0, meta: 0, adjacent: 1 },
  { callVa: 0x008675e1, nameVa: 0x00b706f0, targetVa: 0x0085db70, helperVa: 0x0089edd0, meta: 0, adjacent: 1 },
]);

const COLOR_FIELDS = Object.freeze([
  { nameVa: 0x00b70450, arg1: 0x00407240, arg2: 0x005cd370, callVa: 0x00867091, builderVa: 0x00875510 },
  { nameVa: 0x00b70434, arg1: 0x00407250, arg2: 0x005cd380, callVa: 0x008670a7, builderVa: 0x00875510 },
  { nameVa: 0x00b6d178, arg1: 0x00407260, arg2: 0x005cd3a0, callVa: 0x008670bd, builderVa: 0x00875510 },
  { nameVa: 0x00b6d17c, arg1: 0x00407270, arg2: 0x00407280, callVa: 0x008670d3, builderVa: 0x00875510 },
  { nameVa: 0x00b70438, arg1: 0x004072b0, arg2: 0x005cd3d0, callVa: 0x008670e9, builderVa: 0x00875510 },
  { nameVa: 0x00b7042c, arg1: 0x004072c0, arg2: 0x005cd3f0, callVa: 0x008670ff, builderVa: 0x00875510 },
  { nameVa: 0x00b70430, arg1: 0x004072d0, arg2: 0x005cd410, callVa: 0x00867115, builderVa: 0x00875510 },
]);

const SPRITE_FIELDS = Object.freeze([
  { nameVa: 0x00b6c978, arg1: 0x0049cb40, arg2: 0x00456340, callVa: 0x0086750c, builderVa: 0x00875680 },
  { nameVa: 0x00b706a4, arg1: 0x00417200, arg2: 0x00420170, callVa: 0x00867522, builderVa: 0x00875680 },
  { nameVa: 0x00b1b4cc, arg1: 0x00417210, arg2: 0x0043ee80, callVa: 0x00867538, builderVa: 0x008757f0 },
  // the folded member; the caller pushes exactly the folded immediates
  { nameVa: 0x00b6508c, arg1: 0x00407410, arg2: 0x004073d0, callVa: 0x0086754e, builderVa: 0x00875960 },
  { nameVa: 0x00b70684, arg1: 0x00407420, arg2: 0x00435c60, callVa: 0x0086757a, builderVa: 0x00875ae0 },
  { nameVa: 0x00b70660, arg1: 0x00407430, arg2: 0x00505b50, callVa: 0x00867590, builderVa: 0x00875ae0 },
  { nameVa: 0x00b70668, arg1: 0x00456360, arg2: 0x00440e50, callVa: 0x008675a6, builderVa: 0x008757f0 },
]);

/** Named class registrations recovered from the body, in PE order. */
export const LUA_REGISTER_CLASSES = Object.freeze([
  {
    nameVa: 0x00b701e4, createHelperVa: 0x008a7e10, createCallVa: 0x008669a8,
    populated: 1, installs: ENTITYPTR_INSTALLS, fieldHelperVa: 0, fields: null,
  },
  {
    nameVa: 0x00b701dc, createHelperVa: 0x008a7c00, createCallVa: 0x00866a5d,
    populated: 1, installs: LUA_REGISTER_VECTOR_INSTALLS,
    fieldHelperVa: 0x00875230, fields: LUA_REGISTER_VECTOR_FIELDS,
  },
  {
    nameVa: 0x00b702e8, createHelperVa: 0x008a79f0, createCallVa: 0x00866cf6,
    populated: 1, installs: KCOLOR_INSTALLS,
    fieldHelperVa: 0x008753a0, fields: KCOLOR_FIELDS,
  },
  {
    nameVa: 0x00b702c4, createHelperVa: 0x008a77e0, createCallVa: 0x00866d7d,
    populated: 1, installs: FONTRENDERSETTINGS_INSTALLS, fieldHelperVa: 0, fields: null,
  },
  {
    nameVa: 0x00b70424, createHelperVa: 0x008a75d0, createCallVa: 0x00866ec2,
    populated: 1, installs: FONT_INSTALLS, fieldHelperVa: 0, fields: null,
  },
  {
    // ABI v19: populated via the property-builder return contract (14/14)
    nameVa: 0x00b6508c, createHelperVa: 0x008a73c0, createCallVa: 0x00867052,
    populated: 1, installs: COLOR_INSTALLS,
    fieldHelperVa: 0x00875510, fields: COLOR_FIELDS,
  },
  {
    // ABI v19: populated (45/45); heterogeneous builders, class-level
    // field helper stays 0 and the per-entry builderVa carries the real one
    nameVa: 0x00b704ac, createHelperVa: 0x008a71b0, createCallVa: 0x00867218,
    populated: 1, installs: SPRITE_INSTALLS,
    fieldHelperVa: 0, fields: SPRITE_FIELDS,
  },
  {
    nameVa: 0x00b70704, createHelperVa: 0x008a6fa0, createCallVa: 0x0086764d,
    populated: 0, installs: null, fieldHelperVa: 0, fields: null,
  },
]);

export const LUA_REGISTER_CLASS_TABLE_COUNT = LUA_REGISTER_CLASSES.length;

function classAt(cls) {
  return Number.isInteger(cls) && cls >= 0 && cls < LUA_REGISTER_CLASSES.length
    ? LUA_REGISTER_CLASSES[cls]
    : null;
}

function classInstallAt(cls, index) {
  const c = classAt(cls);
  if (!c || !c.installs) return null;
  return Number.isInteger(index) && index >= 0 && index < c.installs.length
    ? c.installs[index]
    : null;
}

function classFieldAt(cls, index) {
  const c = classAt(cls);
  if (!c || !c.fields) return null;
  return Number.isInteger(index) && index >= 0 && index < c.fields.length
    ? c.fields[index]
    : null;
}

/** Number of named class registrations. */
export function luaEngineRegisterClassCount() {
  return LUA_REGISTER_CLASS_TABLE_COUNT;
}

/** @param {number} cls */
export function luaEngineRegisterClassNameVa(cls) {
  const c = classAt(cls);
  return c ? c.nameVa >>> 0 : 0;
}

/** @param {number} cls */
export function luaEngineRegisterClassCreateHelperVa(cls) {
  const c = classAt(cls);
  return c ? c.createHelperVa >>> 0 : 0;
}

/** @param {number} cls */
export function luaEngineRegisterClassCreateCallVa(cls) {
  const c = classAt(cls);
  return c ? c.createCallVa >>> 0 : 0;
}

/** @param {number} cls */
export function luaEngineRegisterClassPopulated(cls) {
  const c = classAt(cls);
  return c ? c.populated : -1;
}

/** @param {number} cls */
export function luaEngineRegisterClassInstallCount(cls) {
  const c = classAt(cls);
  if (!c) return -1;
  return c.installs ? c.installs.length : 0;
}

/** @param {number} cls @param {number} index */
export function luaEngineRegisterClassInstallCallVa(cls, index) {
  const e = classInstallAt(cls, index);
  return e ? e.callVa >>> 0 : 0;
}

/** @param {number} cls @param {number} index */
export function luaEngineRegisterClassInstallNameVa(cls, index) {
  const e = classInstallAt(cls, index);
  return e ? e.nameVa >>> 0 : 0;
}

/** @param {number} cls @param {number} index */
export function luaEngineRegisterClassInstallTargetVa(cls, index) {
  const e = classInstallAt(cls, index);
  return e ? e.targetVa >>> 0 : 0;
}

/** @param {number} cls @param {number} index */
export function luaEngineRegisterClassInstallHelperVa(cls, index) {
  const e = classInstallAt(cls, index);
  return e ? e.helperVa >>> 0 : 0;
}

/** @param {number} cls @param {number} index */
export function luaEngineRegisterClassInstallIsMetamethod(cls, index) {
  const e = classInstallAt(cls, index);
  return e ? e.meta : -1;
}

/** @param {number} cls @param {number} index */
export function luaEngineRegisterClassInstallAdjacent(cls, index) {
  const e = classInstallAt(cls, index);
  return e ? e.adjacent : -1;
}

/** @param {number} cls */
export function luaEngineRegisterClassFieldCount(cls) {
  const c = classAt(cls);
  if (!c) return -1;
  return c.fields ? c.fields.length : 0;
}

/** @param {number} cls */
export function luaEngineRegisterClassFieldHelperVa(cls) {
  const c = classAt(cls);
  return c ? c.fieldHelperVa >>> 0 : 0;
}

/** @param {number} cls @param {number} index */
export function luaEngineRegisterClassFieldNameVa(cls, index) {
  const e = classFieldAt(cls, index);
  return e ? e.nameVa >>> 0 : 0;
}

/** @param {number} cls @param {number} index */
export function luaEngineRegisterClassFieldArg1(cls, index) {
  const e = classFieldAt(cls, index);
  return e ? e.arg1 >>> 0 : 0;
}

/** @param {number} cls @param {number} index */
export function luaEngineRegisterClassFieldArg2(cls, index) {
  const e = classFieldAt(cls, index);
  return e ? e.arg2 >>> 0 : 0;
}

/* ---- ABI v17 â€” class-create helper family as one template ----
 *
 * Reasoned from a byte-level diff of the 8 helpers plus a full read of one
 * instance. Each is 528 bytes / 179 instructions; 503 of the 528 bytes are
 * identical everywhere, the direct call targets and the whole lua_* IAT
 * sequence are identical, and the 25 differing bytes fall into exactly three
 * per-instance immediate kinds plus the class name pointer.
 *
 * Registration index r counts PE registration order, r = 0 being EntityPtr.
 * The helper VAs descend with r because the template instantiations were
 * emitted in the reverse order.
 */

export const LUA_CLASS_CREATE_TEMPLATE_COUNT = 8;
export const LUA_CLASS_CREATE_TEMPLATE_BYTES = 0x210;
export const LUA_CLASS_CREATE_TEMPLATE_INSNS = 179;
export const LUA_CLASS_CREATE_TEMPLATE_VARIANT_BYTES = 25;
export const LUA_CLASS_CREATE_TEMPLATE_VARIANT_RUNS = 12;
export const LUA_CLASS_CREATE_HELPER_BASE_VA = 0x008a7e10;
export const LUA_CLASS_CREATE_HELPER_STRIDE = 0x210;
export const LUA_CLASS_CREATE_GC_CLOSURE_BASE_VA = 0x008c32b0;
export const LUA_CLASS_CREATE_GC_CLOSURE_STRIDE = 0x20;
export const LUA_CLASS_CREATE_REGISTRY_KEY_BASE = 0x00c8297c;
export const LUA_CLASS_CREATE_REGISTRY_KEY_STRIDE = 3;
export const LUA_CLASS_CREATE_SHARED_CALL_A_VA = 0x0085d040;
export const LUA_CLASS_CREATE_SHARED_CALL_B_VA = 0x0085d2c0;
export const LUA_CLASS_CREATE_SHARED_CALL_C_VA = 0x0085d500;
export const LUA_CLASS_CREATE_SEH_SCOPE_TABLE_VA = 0x00b0533d;
export const LUA_CLASS_CREATE_GC_CLOSURE_NUPS = 0;
export const LUA_CLASS_CREATE_GC_INSTALL_COUNT = 2;

export const LUA_IAT_LUA_TYPE_VA = 0x00b18400;
export const LUA_IAT_LUA_SETTOP_VA = 0x00b18328;
export const LUA_IAT_LUA_RAWSETP_VA = 0x00b1838c;
export const LUA_IAT_LUA_RAWGET_VA = 0x00b18410;
export const LUA_IAT_LUA_PUSHVALUE_VA = 0x00b183c8;

export const LUA_CLASS_SPAN_OK = 0;
/* v19 recharacterization: structural code â€” span contains [esi]-form
 * receivers. No longer a blocker; see luaEngineRegisterClassSpanResolution. */
export const LUA_CLASS_SPAN_MIXED_RECEIVER = 1;
export const LUA_CLASS_SPAN_NO_SUCCESSOR = 2;
export const LUA_CLASS_RECEIVER_CLEAN_COUNT = 6;
/* v19: Color + Sprite populated via the property-builder return contract. */
export const LUA_CLASS_POPULATED_COUNT = 7;
export const LUA_CLASS_FONTRENDERSETTINGS = 3;
export const LUA_CLASS_FONTRENDERSETTINGS_INSTALLS = 13;
export const LUA_CLASS_FONT = 4;
export const LUA_CLASS_FONT_INSTALLS = 10;
export const LUA_CLASS_COLOR = 5;
export const LUA_CLASS_SPRITE = 6;
export const LUA_CLASS_ENTITYREF = 7;

function templateIndexOk(index) {
  return Number.isInteger(index) && index >= 0 && index < LUA_CLASS_CREATE_TEMPLATE_COUNT;
}

/**
 * Create-helper VA for a registration index (descending by 0x210).
 * @param {number} index
 */
export function luaEngineClassCreateHelperVaForIndex(index) {
  if (!templateIndexOk(index)) return 0;
  return (LUA_CLASS_CREATE_HELPER_BASE_VA - LUA_CLASS_CREATE_HELPER_STRIDE * index) >>> 0;
}

/**
 * `__gc` closure VA for a registration index (descending by 0x20).
 * @param {number} index
 */
export function luaEngineClassCreateGcClosureVaForIndex(index) {
  if (!templateIndexOk(index)) return 0;
  return (
    LUA_CLASS_CREATE_GC_CLOSURE_BASE_VA - LUA_CLASS_CREATE_GC_CLOSURE_STRIDE * index
  ) >>> 0;
}

/**
 * Registry key for a registration index and the pushvalue index it pairs
 * with (rel is -1, -2 or -3; the triple is consecutive with base at -3).
 * @param {number} index
 * @param {number} rel
 */
export function luaEngineClassCreateRegistryKeyForIndex(index, rel) {
  if (!templateIndexOk(index)) return 0;
  if (!Number.isInteger(rel) || rel < -3 || rel > -1) return 0;
  return (
    LUA_CLASS_CREATE_REGISTRY_KEY_BASE +
    LUA_CLASS_CREATE_REGISTRY_KEY_STRIDE * index +
    (rel + 3)
  ) >>> 0;
}

/**
 * Inverse of the helper-VA law; -1 unless the VA is an exact family member.
 * @param {number} helperVa
 */
export function luaEngineClassCreateIndexForHelperVa(helperVa) {
  const va = helperVa >>> 0;
  if (va > LUA_CLASS_CREATE_HELPER_BASE_VA) return -1;
  const delta = LUA_CLASS_CREATE_HELPER_BASE_VA - va;
  if (delta % LUA_CLASS_CREATE_HELPER_STRIDE !== 0) return -1;
  const index = delta / LUA_CLASS_CREATE_HELPER_STRIDE;
  return index < LUA_CLASS_CREATE_TEMPLATE_COUNT ? index : -1;
}

/**
 * Inverse of the `__gc` closure law.
 * @param {number} va
 */
export function luaEngineClassCreateIndexForGcClosureVa(va) {
  const v = va >>> 0;
  if (v > LUA_CLASS_CREATE_GC_CLOSURE_BASE_VA) return -1;
  const delta = LUA_CLASS_CREATE_GC_CLOSURE_BASE_VA - v;
  if (delta % LUA_CLASS_CREATE_GC_CLOSURE_STRIDE !== 0) return -1;
  const index = delta / LUA_CLASS_CREATE_GC_CLOSURE_STRIDE;
  return index < LUA_CLASS_CREATE_TEMPLATE_COUNT ? index : -1;
}

/** @param {number} cls */
export function luaEngineRegisterClassGcClosureVa(cls) {
  return luaEngineClassCreateGcClosureVaForIndex(cls);
}

/** @param {number} cls @param {number} rel */
export function luaEngineRegisterClassRegistryKey(cls, rel) {
  return luaEngineClassCreateRegistryKeyForIndex(cls, rel);
}

/**
 * Why a class run is or is not recovered.
 * @param {number} cls
 */
export function luaEngineRegisterClassSpanStatus(cls) {
  if (!Number.isInteger(cls) || cls < 0 || cls >= LUA_REGISTER_CLASSES.length) return -1;
  if (cls === LUA_CLASS_COLOR || cls === LUA_CLASS_SPRITE) {
    return LUA_CLASS_SPAN_MIXED_RECEIVER;
  }
  if (cls === LUA_CLASS_ENTITYREF) return LUA_CLASS_SPAN_NO_SUCCESSOR;
  return LUA_CLASS_SPAN_OK;
}

/** @param {number} cls */
export function luaEngineRegisterClassReceiverClean(cls) {
  const status = luaEngineRegisterClassSpanStatus(cls);
  if (status < 0) return -1;
  return status === LUA_CLASS_SPAN_MIXED_RECEIVER ? 0 : 1;
}

/* ---- ABI v42 — class-create template BODY control flow (8 sites) ----
 *
 * The v17/v18 laws cover the per-index ARITHMETIC and the three shared
 * metatable builders; this block pins the shared BODY control flow,
 * transcribed from the PE instruction stream of 0x008a7e10 (identical in
 * all 8 instances; the 25 variant bytes are exactly the v17 immediates):
 *
 *   prologue: dest->state = src->state ; dest->slots = 0 ;
 *             dest->slots = src->slots + 3 (wrap) ; src->slots = 0
 *   gate:     absindex(L,-1) ; pushstring(L,name) ; rawget ;
 *             lua_type(L,-1) ; test eax,eax / jne ALREADY   (FULL-WORD)
 *   CREATE arm (type == 0): settop(L,-2) once ; then 3 iterations:
 *       iteration 1: builder A(name) ; pushcclosure(L, gc, 0) ;
 *                    absindex(-2) ; pushstring("__gc") ; rotate(-2,1) ; rawset
 *       iteration 2: builder B(name) ; same __gc record
 *       iteration 3: builder C(name) ;
 *                    pushvalue(-1)/rawsetp(REGISTRYINDEX, key-1) ;
 *                    pushvalue(-2)/rawsetp(REGISTRYINDEX, key-2) ;
 *                    pushvalue(-3)/rawsetp(REGISTRYINDEX, key-3)
 *   ALREADY arm (type != 0):
 *       absindex(-1) ; pushstring("__class") ; rawget ;
 *       absindex(-1) ; pushstring("__const") ; rawget ;
 *       rotate(-3,1) ; rotate(-2,1)
 *   epilogue: return this ; ret 8
 *
 * Per-instance names verified from the raw PE bytes of all 8 instances
 * (match kClasses[] / luaEngineRegisterClassNameVa order 0..7).
 */

export const LUA_CLASS_CREATE_BODY_BYTES = 0x207;
export const LUA_CLASS_CREATE_FIRST_RET_VA = 0x008a8017;
export const LUA_CLASS_CREATE_ARM_CREATE = 0;
export const LUA_CLASS_CREATE_ARM_ALREADY = 1;
export const LUA_CLASS_CREATE_CREATE_ITERATIONS = 3;
export const LUA_CLASS_CREATE_CREATE_ENTRY_SETTOP_INDEX_U32 = 0xfffffffe;
export const LUA_CLASS_CREATE_GC_RECORD_ITERATIONS = 2;
export const LUA_CLASS_CREATE_ITERATION_ABSINDEX_INDEX_U32 = 0xfffffffe;
export const LUA_CLASS_CREATE_ITERATION_ROTATE_INDEX_U32 = 0xfffffffe;
export const LUA_CLASS_CREATE_ITERATION_ROTATE_N = 1;
export const LUA_CLASS_CREATE_ALREADY_ABSINDEX_INDEX_U32 = 0xffffffff;
export const LUA_CLASS_CREATE_ALREADY_ROTATE_INDEX_A_U32 = 0xfffffffd;
export const LUA_CLASS_CREATE_ALREADY_ROTATE_INDEX_B_U32 = 0xfffffffe;
export const LUA_CLASS_CREATE_ALREADY_ROTATE_N = 1;
export const LUA_CLASS_CREATE_RET_ARGS = 8;
export const LUA_IAT_LUA_PUSHCClOSURE_VA = 0x00b183fc;

export const LUA_CLASS_CREATE_NAMES = Object.freeze([
  0x00b701e4, /* EntityPtr */
  0x00b701dc, /* Vector */
  0x00b702e8, /* KColor */
  0x00b702c4, /* FontRenderSettings */
  0x00b70424, /* Font */
  0x00b6508c, /* Color */
  0x00b704ac, /* Sprite */
  0x00b70704, /* EntityRef */
]);

export const LUA_CLASS_CREATE_BUILDERS = Object.freeze([
  LUA_CLASS_CREATE_SHARED_CALL_A_VA,
  LUA_CLASS_CREATE_SHARED_CALL_B_VA,
  LUA_CLASS_CREATE_SHARED_CALL_C_VA,
]);

function createIterationOk(iteration) {
  return Number.isInteger(iteration) && iteration >= 1 &&
    iteration <= LUA_CLASS_CREATE_CREATE_ITERATIONS;
}

/** Body size to the first (only) ret; the 9 int3 pad bytes to the next
 *  function are not part of the body (span is 0x210). */
export function luaEngineClassCreateBodyBytes() {
  return LUA_CLASS_CREATE_BODY_BYTES >>> 0;
}

export function luaEngineClassCreateFirstRetVa() {
  return LUA_CLASS_CREATE_FIRST_RET_VA >>> 0;
}

export function luaEngineClassCreateRetArgs() {
  return LUA_CLASS_CREATE_RET_ARGS >>> 0;
}

/** Per-class name VA (data table, PE-verified for all 8 instances). */
export function luaEngineClassCreateNameVaForIndex(index) {
  if (!templateIndexOk(index)) return 0;
  return LUA_CLASS_CREATE_NAMES[index] >>> 0;
}

/**
 * FULL-WORD arm gate: PE `test eax,eax / jne ALREADY` on lua_type(L,-1).
 * type == 0 -> CREATE; any non-zero -> ALREADY. Never byte-mask.
 * @param {number} type
 */
export function luaEngineClassCreateArmSelect(type) {
  return type !== 0 ? LUA_CLASS_CREATE_ARM_ALREADY : LUA_CLASS_CREATE_ARM_CREATE;
}

export function luaEngineClassCreateCreateIterations() {
  return LUA_CLASS_CREATE_CREATE_ITERATIONS;
}

export function luaEngineClassCreateCreateEntrySettopIndex() {
  return LUA_CLASS_CREATE_CREATE_ENTRY_SETTOP_INDEX_U32 >>> 0;
}

/** @param {number} iteration 1..3 */
export function luaEngineClassCreateIterationBuilderVa(iteration) {
  if (!createIterationOk(iteration)) return 0;
  return LUA_CLASS_CREATE_BUILDERS[iteration - 1] >>> 0;
}

/** Iterations 1..2 carry the __gc closure record; iteration 3 the keys.
 *  @param {number} iteration */
export function luaEngineClassCreateIterationHasGcRecord(iteration) {
  if (!createIterationOk(iteration)) return -1;
  return iteration <= LUA_CLASS_CREATE_GC_RECORD_ITERATIONS ? 1 : 0;
}

/** @param {number} iteration @param {number} index */
export function luaEngineClassCreateIterationGcClosureVa(iteration, index) {
  if (!createIterationOk(iteration) ||
      iteration > LUA_CLASS_CREATE_GC_RECORD_ITERATIONS) return 0;
  return luaEngineClassCreateGcClosureVaForIndex(index);
}

export function luaEngineClassCreateIterationAbsindexIndex() {
  return LUA_CLASS_CREATE_ITERATION_ABSINDEX_INDEX_U32 >>> 0;
}

export function luaEngineClassCreateIterationRotateIndex() {
  return LUA_CLASS_CREATE_ITERATION_ROTATE_INDEX_U32 >>> 0;
}

export function luaEngineClassCreateIterationRotateN() {
  return LUA_CLASS_CREATE_ITERATION_ROTATE_N;
}

/** pushvalue(-k) stores the registry key at rel -k, k = 1..3 (PE order:
 *  -1 first, then -2, then -3). @param {number} iteration */
export function luaEngineClassCreateIterationStoreRel(iteration) {
  if (!createIterationOk(iteration)) return 0;
  return -iteration;
}

/** @param {number} iteration */
export function luaEngineClassCreateIterationPushvalueIndex(iteration) {
  if (!createIterationOk(iteration)) return 0;
  return (-iteration) >>> 0;
}

/** @param {number} iteration @param {number} index */
export function luaEngineClassCreateIterationRegistryKey(iteration, index) {
  if (!createIterationOk(iteration)) return 0;
  return luaEngineClassCreateRegistryKeyForIndex(index, -iteration);
}

export function luaEngineClassCreateAlreadyAbsindexIndex() {
  return LUA_CLASS_CREATE_ALREADY_ABSINDEX_INDEX_U32 >>> 0;
}

export function luaEngineClassCreateAlreadyClassKeyVa() {
  return LUA_CLASS_CREATE_META_CLASS_NAME_VA >>> 0;
}

export function luaEngineClassCreateAlreadyConstKeyVa() {
  return LUA_CLASS_CREATE_META_CONST_NAME_VA >>> 0;
}

export function luaEngineClassCreateAlreadyRotateIndexA() {
  return LUA_CLASS_CREATE_ALREADY_ROTATE_INDEX_A_U32 >>> 0;
}

export function luaEngineClassCreateAlreadyRotateIndexB() {
  return LUA_CLASS_CREATE_ALREADY_ROTATE_INDEX_B_U32 >>> 0;
}

export function luaEngineClassCreateAlreadyRotateN() {
  return LUA_CLASS_CREATE_ALREADY_ROTATE_N;
}

/* ---- ABI v43 — std::vector<T>::at family (3 compiled sites) ----
 *
 * Bodies 0x008a8020 (16-byte elements) / 0x008a8050 (8-byte) /
 * 0x008a8080 (4-byte), the MSVC bounds-checked vector at() (CODE_PTR
 * immediates of the band-C secondary getter userdata, 10 rows:
 *
 *   mov eax,[ecx+4] ; mov edx,[ecx] ; sub eax,edx    byte_count = end-begin
 *   mov ecx,[ebp+8]                                   index (one stack arg)
 *   sar eax, log2(stride)                             size (SIGNED shift)
 *   cmp eax,ecx ; jbe OOB                             UNSIGNED compare
 *   lea eax,[edx+ecx*stride]                          begin + index*stride
 *   pop ebp ; ret 4                                   (c2 04 00)
 *   OOB: call 0x008ba150                              noreturn throw
 *
 * OOB fatal 0x008ba150 pushes 0xb75380 ("invalid vector subscript") and
 * calls IAT 0xb18468 = MSVCP140 std::_Xout_of_range — the std::out_of_range
 * throw (lua-v16/iat.txt). Host (imported CRT noreturn). Site 0 carries an
 * extra `add ecx,ecx` (stride 16 as lea x8), so first rets are
 * 0x803a / 0x8068 / 0x8098 (bodies 0x1a / 0x18 / 0x18). Site law:
 * stride(site) = 16 >> site ; shift(site) = 4 - site.
 */

export const LUA_AT_TEMPLATE_COUNT = 3;
export const LUA_AT_TEMPLATE_BASE_VA = 0x008a8020;
export const LUA_AT_TEMPLATE_STRIDE_VA = 0x30;
export const LUA_AT_STRIDE_BASE = 16;
export const LUA_AT_SHIFT_BASE = 4;
export const LUA_AT_FIRST_RETS = Object.freeze([
  0x008a803a,
  0x008a8068,
  0x008a8098,
]);
export const LUA_AT_RET_ARGS = 4;
export const LUA_AT_FATAL_VA = 0x008ba150;
export const LUA_AT_FATAL_STRING_VA = 0x00b75380;
export const LUA_AT_FATAL_IAT_VA = 0x00b18468;
export const LUA_AT_OOB_NORETURN = 1;

function atSiteOk(site) {
  return Number.isInteger(site) && site >= 0 && site < LUA_AT_TEMPLATE_COUNT;
}

export function luaEngineAtCount() {
  return LUA_AT_TEMPLATE_COUNT;
}

export function luaEngineAtVaForIndex(index) {
  if (!atSiteOk(index)) return 0;
  return (LUA_AT_TEMPLATE_BASE_VA + index * LUA_AT_TEMPLATE_STRIDE_VA) >>> 0;
}

/** stride(site) = 16 >> site (sar imm 4 / 3 / 2 and lea scaling match). */
export function luaEngineAtStrideForIndex(index) {
  if (!atSiteOk(index)) return 0;
  return LUA_AT_STRIDE_BASE >> index;
}

/** sar imm = log2(stride) = 4 - site. */
export function luaEngineAtShiftForIndex(index) {
  if (!atSiteOk(index)) return 0;
  return LUA_AT_SHIFT_BASE - index;
}

export function luaEngineAtFirstRetVaForIndex(index) {
  if (!atSiteOk(index)) return 0;
  return LUA_AT_FIRST_RETS[index] >>> 0;
}

/** first ret - body VA = 0x1a / 0x18 / 0x18 (ret 4 excluded). */
export function luaEngineAtBodyBytesForIndex(index) {
  if (!atSiteOk(index)) return 0;
  return (LUA_AT_FIRST_RETS[index] -
    (LUA_AT_TEMPLATE_BASE_VA + index * LUA_AT_TEMPLATE_STRIDE_VA)) >>> 0;
}

/** Inverse of the site-VA law: exact multiple of 0x30 in the window. */
export function luaEngineAtIndexForVa(va) {
  if (!Number.isInteger(va) || va < 0 || va < LUA_AT_TEMPLATE_BASE_VA) return -1;
  const delta = va - LUA_AT_TEMPLATE_BASE_VA;
  if (delta % LUA_AT_TEMPLATE_STRIDE_VA !== 0 ||
      delta / LUA_AT_TEMPLATE_STRIDE_VA >= LUA_AT_TEMPLATE_COUNT) return -1;
  return delta / LUA_AT_TEMPLATE_STRIDE_VA;
}

export function luaEngineAtRetArgs() {
  return LUA_AT_RET_ARGS;
}

export function luaEngineAtFatalVa() {
  return LUA_AT_FATAL_VA >>> 0;
}

export function luaEngineAtFatalStringVa() {
  return LUA_AT_FATAL_STRING_VA >>> 0;
}

export function luaEngineAtFatalIatVa() {
  return LUA_AT_FATAL_IAT_VA >>> 0;
}

export function luaEngineAtOobNoreturn() {
  return LUA_AT_OOB_NORETURN;
}

/**
 * size = SAR(byte_count, shift(site)) — SIGNED arithmetic shift of the
 * wrapped 32-bit byte count (PE sar imm 4/3/2).
 * @param {number} byteCount @param {number} site
 */
export function luaEngineAtSize(byteCount, site) {
  if (!atSiteOk(site)) return 0;
  return ((byteCount | 0) >> (LUA_AT_SHIFT_BASE - site)) >>> 0;
}

/**
 * PE `cmp eax,ecx / jbe OOB`: OOB iff (uint32)size <= (uint32)index, so the
 * in-bounds arm is size > index — UNSIGNED, full word, never byte-masked.
 * Returns 1 in-bounds / 0 OOB / -1 bad site.
 * @param {number} end @param {number} begin @param {number} index
 * @param {number} site
 */
export function luaEngineAtGate(end, begin, index, site) {
  if (!atSiteOk(site)) return -1;
  return luaEngineAtSize(end - begin, site) > index ? 1 : 0;
}

/**
 * In-bounds result: begin + index*stride with 32-bit wrap (the lea law).
 * @param {number} begin @param {number} index @param {number} site
 */
export function luaEngineAtCompute(begin, index, site) {
  if (!atSiteOk(site)) return 0;
  return (begin + Math.imul(index, LUA_AT_STRIDE_BASE >> site)) >>> 0;
}

/* ---- ABI v44 â€” LuaRef-holder destructor 0x008a80b0 ---- */
/*
 * The sequential body after the v43 at() family (16 int3 pad bytes at
 * 0x008a80a0..0x008a80af). NOTE: the v46 handoff named 0x008a80c0
 * ("mov ecx,0x36fffff0 ; call [0xb1831c]") â€” that VA is a misaligned
 * decode 0x10 bytes into this body: byte 0x8a80be starts the three-byte
 * `push 0xfff0b9d8` (68 d8 b9 f0 ff) and 0x8a80c0 lands inside that
 * immediate. True machine CF (cpu-dump/008a80b0.txt, 0x20 bytes, 11 insns):
 *   push esi ; mov esi,ecx ; lea ecx,[esi+8]
 *   call 0x0040d040                       basic_string::_Tidy
 *   push [esi+4] ; push 0xfff0b9d8 ; push [esi]
 *   call [0xb1831c]                       luaL_unref (host IAT)
 *   add esp,0xc ; pop esi ; ret
 * Layout: +0 lua_State* L, +4 int ref, +8 MSVC basic_string.
 * Reachability (whole-image scan): 4 inbound edges, all COMDAT scope-dtor
 * tail thunks `lea ecx,[ebp-disp]; jmp 0x8a80b0` at 0xb0507b (0x34) /
 * 0xb0508e (0x84) / 0xb050eb (0x38) / 0xb050fe (0x90) â€” a SHARED dtor tail.
 */

export const LUA_REF_DTOR_VA = 0x008a80b0;
export const LUA_REF_DTOR_RET_VA = 0x008a80cf;
export const LUA_REF_DTOR_BODY_BYTES = 0x1f;
export const LUA_REF_DTOR_INSN_COUNT = 11;
export const LUA_REF_OFF_STATE = 0x00;
export const LUA_REF_OFF_REF = 0x04;
export const LUA_REF_OFF_STRING = 0x08;
export const LUA_REF_DTOR_STRING_TIDY_VA = 0x0040d040;
export const LUA_REF_DTOR_UNREF_IAT_VA = 0x00b1831c;
export const LUA_REF_DTOR_UNREF_REGISTRY_INDEX_U32 = 0xfff0b9d8;
export const LUA_REF_DTOR_STACK_CLEANUP = 0x0c;
export const LUA_REF_DTOR_RET_ARGS = 0;
export const LUA_REF_DTOR_THUNK_COUNT = 4;
export const LUA_REF_DTOR_THUNK_VAS = Object.freeze([
  0x00b0507b,
  0x00b0508e,
  0x00b050eb,
  0x00b050fe,
]);
export const LUA_REF_DTOR_THUNK_LOCAL_DISPS = Object.freeze([
  0x34,
  0x84,
  0x38,
  0x90,
]);

function luaRefThunkOk(index) {
  return Number.isInteger(index) && index >= 0 && index < LUA_REF_DTOR_THUNK_COUNT;
}

export function luaEngineLuaRefDtorVa() {
  return LUA_REF_DTOR_VA >>> 0;
}

export function luaEngineLuaRefDtorRetVa() {
  return LUA_REF_DTOR_RET_VA >>> 0;
}

export function luaEngineLuaRefDtorBodyBytes() {
  return (LUA_REF_DTOR_RET_VA - LUA_REF_DTOR_VA) >>> 0;
}

export function luaEngineLuaRefDtorInsnCount() {
  return LUA_REF_DTOR_INSN_COUNT;
}

export function luaEngineLuaRefStateOff() {
  return LUA_REF_OFF_STATE >>> 0;
}

export function luaEngineLuaRefRefOff() {
  return LUA_REF_OFF_REF >>> 0;
}

export function luaEngineLuaRefStringOff() {
  return LUA_REF_OFF_STRING >>> 0;
}

export function luaEngineLuaRefDtorStringTidyVa() {
  return LUA_REF_DTOR_STRING_TIDY_VA >>> 0;
}

export function luaEngineLuaRefDtorUnrefIatVa() {
  return LUA_REF_DTOR_UNREF_IAT_VA >>> 0;
}

export function luaEngineLuaRefDtorUnrefRegistryIndex() {
  return LUA_REF_DTOR_UNREF_REGISTRY_INDEX_U32 >>> 0;
}

export function luaEngineLuaRefDtorStackCleanup() {
  return LUA_REF_DTOR_STACK_CLEANUP >>> 0;
}

export function luaEngineLuaRefDtorRetArgs() {
  return LUA_REF_DTOR_RET_ARGS >>> 0;
}

export function luaEngineLuaRefDtorReachThunkCount() {
  return LUA_REF_DTOR_THUNK_COUNT;
}

export function luaEngineLuaRefDtorReachThunkVaForIndex(index) {
  if (!luaRefThunkOk(index)) return 0;
  return LUA_REF_DTOR_THUNK_VAS[index] >>> 0;
}

export function luaEngineLuaRefDtorReachThunkLocalDispForIndex(index) {
  if (!luaRefThunkOk(index)) return 0;
  return LUA_REF_DTOR_THUNK_LOCAL_DISPS[index] >>> 0;
}

/* Push order before IAT luaL_unref: 0 = ref (this+4), 1 = LUA_REGISTRYINDEX,
 * 2 = state L (this+0). FULL WORD, never byte-masked. OOR -> 0. */
export function luaEngineLuaRefDtorUnrefArgAt(argument, state, ref) {
  switch (argument) {
    case 0:
      return ref >>> 0;
    case 1:
      return LUA_REF_DTOR_UNREF_REGISTRY_INDEX_U32 >>> 0;
    case 2:
      return state >>> 0;
    default:
      return 0;
  }
}

/* Call ordering law: string Tidy (0x40d040) precedes luaL_unref. */
export function luaEngineLuaRefDtorTidyBeforeUnref() {
  return 1;
}

/* ---- ABI v45 â€” SetReference wrapper successors (the 0x8a80d0+ band) ----
 *
 * Handoff correction (lua-v48): the v47 handoff named 0x008a82c0 as the
 * next unlanded body. That VA is the TAIL of the real body at 0x008a8270
 * (prologue push ebp; mov ebp,esp; sub esp,0x14; push esi; push edi; 64
 * insns; first ret 0x008a8308). Two more successors sit to its LEFT:
 * 0x008a8180 (41 insns, ret 0x8a81cf) and 0x008a81d0 (65 insns, ret
 * 0x8a826d). All three are LIVE (whole-image abs scan): install helpers
 * 0x8a0470 / 0x8a0510 / 0x8a05a0 push them as pushcclosure fn literals at
 * 0x8a0481 / 0x8a0521 / 0x8a05b0 (IAT 0xb183fc).
 *
 * Shared machine CF (all three, PE Capstone):
 *   L = [ebp+8]
 *   push 1; push L; call [0xb18400]        lua_type(L,1) HOST
 *   test eax,eax; je obj_zero              FULL-WORD zero test
 *     obj_zero: obj = 0
 *   else push flags; push 0xc82980; mov edx,1; mov ecx,L
 *     call 0x0085c590                      check/get helper (LANDED v11)
 *     add esp,8; obj = [eax+4]             object field +4
 *   push 0xfff0b9d7; push L; call [0xb183b0]  lua_touserdata(L,
 *     upvalueindex(1)) HOST
 *   fn = ud[0] (off 0); ecx = obj; call fn
 *
 * Wrapper #1 0x8a8180: flags 0, no extra args, ret 0.
 * Wrapper #2 0x8a81d0: flags 1; ud[0](obj, &ret8) ret slot [ebp-8];
 *   lua_newuserdata(L, 0x10); newud[0]=0xb73574 (rdata class-info:
 *   dword 0x008bae70 + "RoomDescriptor"); newud[4]=&newud[8];
 *   lua_rawgetp(L, 0xfff0b9d8, 0xc82980) (metatable key == check key);
 *   lua_setmetatable(L, âˆ’2); payload {lo,hi} = ret8 {[ebp-8],[ebp-4]};
 *   ret 1.
 * Wrapper #3 0x8a8270: flags 1; obj1=[ebp-4]; edx=2; ecx=L;
 *   call 0x8baa50 (getArgObject) -> obj2; vec = {obj2[0], obj2[4]} two
 *   floats; fn=ud[0] via [ebp-8]; ud[0](obj1, &vec); fstp [ebp-8];
 *   movss xmm1,[ebp-8]; ecx=L; call 0x85c050 (pushNumber); ret 1.
 *
 * Helper 0x8baa50 getArgObject(L, idx): lua_type(L,idx); 0 ->
 *   luaL_error(L, 0xb7539c "nil passed to reference"), ret 0; else
 *   check 0x85c590 (flags 1, key 0xc82980) -> obj=[eax+4]; obj==0 ->
 *   luaL_error again; ret obj.
 * Helper 0x85c050 pushNumber(L, xmm1): cvtss2sd; push double; push L;
 *   call lua_pushnumber @ 0xb183f0; add esp,0xc; ret.
 */

export const LUA_SETREF_SUCCESSOR_COUNT = 3;
export const LUA_SETREF_SUCCESSOR_VAS = Object.freeze([
  0x008a8180,
  0x008a81d0,
  0x008a8270,
]);
export const LUA_SETREF_SUCCESSOR_RET_VAS = Object.freeze([
  0x008a81cf,
  0x008a826d,
  0x008a8308,
]);
export const LUA_SETREF_SUCCESSOR_INSN_COUNTS = Object.freeze([41, 65, 64]);
/** pushcclosure fn-literal sites (wrapper VA is the pushed imm). */
export const LUA_SETREF_SUCCESSOR_INSTALL_VAS = Object.freeze([
  0x008a05b0,
  0x008a0521,
  0x008a0481,
]);
export const LUA_SETREF_SUCCESSOR_TYPE_INDEX = 0x01;
export const LUA_SETREF_SUCCESSOR_CHECK_STACK_INDEX = 0x01;
export const LUA_SETREF_SUCCESSOR_REGISTRY_KEY = 0x00c82980;
export const LUA_SETREF_SUCCESSOR_OBJECT_FIELD_OFF = 0x04;
export const LUA_SETREF_SUCCESSOR_TOUSERDATA_INDEX_U32 = 0xfff0b9d7;
export const LUA_SETREF_SUCCESSOR_FN_OFF = 0x00;
export const LUA_SETREF_SUCCESSOR_CHECK_FLAGS = Object.freeze([0x00, 0x01, 0x01]);
export const LUA_SETREF_SUCCESSOR_RETURN_VALUES = Object.freeze([0, 1, 1]);
export const LUA_SETREF_SUCCESSOR_IAT_LUA_TYPE = 0x00b18400;
export const LUA_SETREF_SUCCESSOR_IAT_LUA_TOUSERDATA = 0x00b183b0;
export const LUA_SETREF_SUCCESSOR_IAT_LUA_PUSHCClOSURE = 0x00b183fc;
export const LUA_SETREF_SUCCESSOR_RET_SLOT_STACK_OFF = 0xfffffff8;
export const LUA_SETREF_SUCCESSOR_NEWUSERDATA_SIZE = 0x10;
export const LUA_SETREF_SUCCESSOR_VTABLE_TAG_VA = 0x00b73574;
export const LUA_SETREF_SUCCESSOR_PAYLOAD_SELF_OFF = 0x04;
export const LUA_SETREF_SUCCESSOR_PAYLOAD_OFF = 0x08;
export const LUA_SETREF_SUCCESSOR_METATABLE_RAWGETP_KEY = 0x00c82980;
export const LUA_SETREF_SUCCESSOR_LUA_REGISTRY_INDEX_U32 = 0xfff0b9d8;
export const LUA_SETREF_SUCCESSOR_SETMETA_INDEX_U32 = 0xfffffffe;
export const LUA_SETREF_SUCCESSOR_PAYLOAD_LO_OFF = 0x00;
export const LUA_SETREF_SUCCESSOR_PAYLOAD_HI_OFF = 0x04;
export const LUA_SETREF_SUCCESSOR_IAT_LUA_NEWUSERDATA = 0x00b1839c;
export const LUA_SETREF_SUCCESSOR_IAT_LUA_RAWGETP = 0x00b183bc;
export const LUA_SETREF_SUCCESSOR_IAT_LUA_SETMETATABLE = 0x00b18398;
export const LUA_SETREF_SUCCESSOR_ARG2_STACK_INDEX = 0x02;
export const LUA_SETREF_SUCCESSOR_ARG2_VEC_FLOAT_COUNT = 0x02;
export const LUA_SETREF_SUCCESSOR_ARG2_VEC_OFF_0 = 0x00;
export const LUA_SETREF_SUCCESSOR_ARG2_VEC_OFF_1 = 0x04;
export const LUA_SETREF_SUCCESSOR_FN_SLOT_STACK_OFF = 0xfffffff8;
export const LUA_SETREF_SUCCESSOR_FLOAT_RET_SLOT_STACK_OFF = 0xfffffff8;
export const LUA_SETREF_SUCCESSOR_GET_ARG_OBJECT_VA = 0x008baa50;
export const LUA_SETREF_SUCCESSOR_GET_ARG_OBJECT_ERROR_RET_VA = 0x008baa7a;
export const LUA_SETREF_SUCCESSOR_GET_ARG_OBJECT_RET_VA = 0x008baaa8;
export const LUA_SETREF_SUCCESSOR_ERROR_STRING_VA = 0x00b7539c;
export const LUA_SETREF_SUCCESSOR_IAT_LUA_L_ERROR = 0x00b18390;
export const LUA_SETREF_SUCCESSOR_PUSH_NUMBER_VA = 0x0085c050;
export const LUA_SETREF_SUCCESSOR_PUSH_NUMBER_RET_VA = 0x0085c072;
export const LUA_SETREF_SUCCESSOR_PUSH_NUMBER_IAT_LUA_PUSHNUMBER = 0x00b183f0;
export const LUA_SETREF_SUCCESSOR_PUSH_NUMBER_CLEANUP = 0x0c;

function setrefSuccessorOk(index) {
  return Number.isInteger(index) && index >= 0 && index < LUA_SETREF_SUCCESSOR_COUNT;
}

export function luaEngineSetrefSuccessorCount() {
  return LUA_SETREF_SUCCESSOR_COUNT;
}

export function luaEngineSetrefSuccessorVa(index) {
  if (!setrefSuccessorOk(index)) return 0;
  return LUA_SETREF_SUCCESSOR_VAS[index] >>> 0;
}

export function luaEngineSetrefSuccessorRetVa(index) {
  if (!setrefSuccessorOk(index)) return 0;
  return LUA_SETREF_SUCCESSOR_RET_VAS[index] >>> 0;
}

export function luaEngineSetrefSuccessorBodyBytes(index) {
  if (!setrefSuccessorOk(index)) return 0;
  return (LUA_SETREF_SUCCESSOR_RET_VAS[index] - LUA_SETREF_SUCCESSOR_VAS[index]) >>> 0;
}

export function luaEngineSetrefSuccessorInsnCount(index) {
  if (!setrefSuccessorOk(index)) return -1;
  return LUA_SETREF_SUCCESSOR_INSN_COUNTS[index];
}

export function luaEngineSetrefSuccessorInstallVa(index) {
  if (!setrefSuccessorOk(index)) return 0;
  return LUA_SETREF_SUCCESSOR_INSTALL_VAS[index] >>> 0;
}

export function luaEngineSetrefSuccessorCheckFlags(index) {
  if (!setrefSuccessorOk(index)) return -1;
  return LUA_SETREF_SUCCESSOR_CHECK_FLAGS[index];
}

export function luaEngineSetrefSuccessorReturnValue(index) {
  if (!setrefSuccessorOk(index)) return -1;
  return LUA_SETREF_SUCCESSOR_RETURN_VALUES[index];
}

export function luaEngineSetrefSuccessorTypeIndex() {
  return LUA_SETREF_SUCCESSOR_TYPE_INDEX >>> 0;
}

export function luaEngineSetrefSuccessorCheckStackIndex() {
  return LUA_SETREF_SUCCESSOR_CHECK_STACK_INDEX >>> 0;
}

export function luaEngineSetrefSuccessorRegistryKey() {
  return LUA_SETREF_SUCCESSOR_REGISTRY_KEY >>> 0;
}

export function luaEngineSetrefSuccessorObjectFieldOff() {
  return LUA_SETREF_SUCCESSOR_OBJECT_FIELD_OFF >>> 0;
}

export function luaEngineSetrefSuccessorTouserdataIndex() {
  return LUA_SETREF_SUCCESSOR_TOUSERDATA_INDEX_U32 >>> 0;
}

export function luaEngineSetrefSuccessorFnOff() {
  return LUA_SETREF_SUCCESSOR_FN_OFF >>> 0;
}

export function luaEngineSetrefSuccessorIatLuaType() {
  return LUA_SETREF_SUCCESSOR_IAT_LUA_TYPE >>> 0;
}

export function luaEngineSetrefSuccessorIatLuaTouserdata() {
  return LUA_SETREF_SUCCESSOR_IAT_LUA_TOUSERDATA >>> 0;
}

export function luaEngineSetrefSuccessorIatLuaPushcclosure() {
  return LUA_SETREF_SUCCESSOR_IAT_LUA_PUSHCClOSURE >>> 0;
}

/**
 * Registry ref-set decision: PE `test eax,eax; je obj_zero` is a FULL-WORD
 * zero test of lua_type(L,1). obj = (type != 0) ? check_field : 0. Drive
 * UNMASKED (0x100/0x1ff/0xffffffff) â€” a low-byte mutant fails.
 * @param {number} typeResult
 * @param {number} checkField
 */
export function luaEngineSetrefSuccessorObjectResolve(typeResult, checkField) {
  return typeResult !== 0 ? checkField >>> 0 : 0;
}

export function luaEngineSetrefSuccessorRetSlotStackOff() {
  return LUA_SETREF_SUCCESSOR_RET_SLOT_STACK_OFF >>> 0;
}

export function luaEngineSetrefSuccessorNewuserdataSize() {
  return LUA_SETREF_SUCCESSOR_NEWUSERDATA_SIZE >>> 0;
}

export function luaEngineSetrefSuccessorVtableTagVa() {
  return LUA_SETREF_SUCCESSOR_VTABLE_TAG_VA >>> 0;
}

export function luaEngineSetrefSuccessorPayloadSelfOff() {
  return LUA_SETREF_SUCCESSOR_PAYLOAD_SELF_OFF >>> 0;
}

export function luaEngineSetrefSuccessorPayloadOff() {
  return LUA_SETREF_SUCCESSOR_PAYLOAD_OFF >>> 0;
}

export function luaEngineSetrefSuccessorMetatableRawgetpKey() {
  return LUA_SETREF_SUCCESSOR_METATABLE_RAWGETP_KEY >>> 0;
}

export function luaEngineSetrefSuccessorLuaRegistryIndex() {
  return LUA_SETREF_SUCCESSOR_LUA_REGISTRY_INDEX_U32 >>> 0;
}

export function luaEngineSetrefSuccessorSetmetaIndex() {
  return LUA_SETREF_SUCCESSOR_SETMETA_INDEX_U32 >>> 0;
}

export function luaEngineSetrefSuccessorPayloadLoOff() {
  return LUA_SETREF_SUCCESSOR_PAYLOAD_LO_OFF >>> 0;
}

export function luaEngineSetrefSuccessorPayloadHiOff() {
  return LUA_SETREF_SUCCESSOR_PAYLOAD_HI_OFF >>> 0;
}

export function luaEngineSetrefSuccessorIatLuaNewuserdata() {
  return LUA_SETREF_SUCCESSOR_IAT_LUA_NEWUSERDATA >>> 0;
}

export function luaEngineSetrefSuccessorIatLuaRawgetp() {
  return LUA_SETREF_SUCCESSOR_IAT_LUA_RAWGETP >>> 0;
}

export function luaEngineSetrefSuccessorIatLuaSetmetatable() {
  return LUA_SETREF_SUCCESSOR_IAT_LUA_SETMETATABLE >>> 0;
}

export function luaEngineSetrefSuccessorArg2StackIndex() {
  return LUA_SETREF_SUCCESSOR_ARG2_STACK_INDEX >>> 0;
}

export function luaEngineSetrefSuccessorArg2VecFloatCount() {
  return LUA_SETREF_SUCCESSOR_ARG2_VEC_FLOAT_COUNT >>> 0;
}

export function luaEngineSetrefSuccessorArg2VecOff0() {
  return LUA_SETREF_SUCCESSOR_ARG2_VEC_OFF_0 >>> 0;
}

export function luaEngineSetrefSuccessorArg2VecOff1() {
  return LUA_SETREF_SUCCESSOR_ARG2_VEC_OFF_1 >>> 0;
}

export function luaEngineSetrefSuccessorFnSlotStackOff() {
  return LUA_SETREF_SUCCESSOR_FN_SLOT_STACK_OFF >>> 0;
}

export function luaEngineSetrefSuccessorFloatRetSlotStackOff() {
  return LUA_SETREF_SUCCESSOR_FLOAT_RET_SLOT_STACK_OFF >>> 0;
}

export function luaEngineSetrefSuccessorGetArgObjectVa() {
  return LUA_SETREF_SUCCESSOR_GET_ARG_OBJECT_VA >>> 0;
}

export function luaEngineSetrefSuccessorGetArgObjectErrorRetVa() {
  return LUA_SETREF_SUCCESSOR_GET_ARG_OBJECT_ERROR_RET_VA >>> 0;
}

export function luaEngineSetrefSuccessorGetArgObjectRetVa() {
  return LUA_SETREF_SUCCESSOR_GET_ARG_OBJECT_RET_VA >>> 0;
}

export function luaEngineSetrefSuccessorErrorStringVa() {
  return LUA_SETREF_SUCCESSOR_ERROR_STRING_VA >>> 0;
}

export function luaEngineSetrefSuccessorIatLuaLError() {
  return LUA_SETREF_SUCCESSOR_IAT_LUA_L_ERROR >>> 0;
}

export function luaEngineSetrefSuccessorPushNumberVa() {
  return LUA_SETREF_SUCCESSOR_PUSH_NUMBER_VA >>> 0;
}

export function luaEngineSetrefSuccessorPushNumberRetVa() {
  return LUA_SETREF_SUCCESSOR_PUSH_NUMBER_RET_VA >>> 0;
}

export function luaEngineSetrefSuccessorPushNumberIatLuaPushnumber() {
  return LUA_SETREF_SUCCESSOR_PUSH_NUMBER_IAT_LUA_PUSHNUMBER >>> 0;
}

export function luaEngineSetrefSuccessorPushNumberCleanup() {
  return LUA_SETREF_SUCCESSOR_PUSH_NUMBER_CLEANUP >>> 0;
}

/**
 * getArgObject law: type==0 -> error path (ret 0); else obj=checkField;
 * obj==0 -> error path again; else return obj. Full-word gates.
 * @param {number} typeResult
 * @param {number} checkField
 */
export function luaEngineSetrefSuccessorGetArgObject(typeResult, checkField) {
  if (typeResult === 0) return 0;
  if (checkField === 0) return 0;
  return checkField >>> 0;
}

/* pushNumber cvtss2sd widening: float32 bits -> exact float64 bits.
 * Exact for finite/inf/zero/denormal (no rounding in the widening). */
export function luaEngineSetrefSuccessorPushNumberWidenHi(f32Bits) {
  const f32 = new DataView(new ArrayBuffer(4));
  f32.setUint32(0, f32Bits >>> 0, true);
  const f = f32.getFloat32(0, true);
  const f64 = new DataView(new ArrayBuffer(8));
  f64.setFloat64(0, f, true);
  return f64.getUint32(4, true) >>> 0; /* high dword of the f64 bits */
}

export function luaEngineSetrefSuccessorPushNumberWidenLo(f32Bits) {
  const f32 = new DataView(new ArrayBuffer(4));
  f32.setUint32(0, f32Bits >>> 0, true);
  const f = f32.getFloat32(0, true);
  const f64 = new DataView(new ArrayBuffer(8));
  f64.setFloat64(0, f, true);
  return f64.getUint32(0, true) >>> 0; /* low dword of the f64 bits */
}

/* ---- ABI v47 â€” closure-install helpers 0x8a0460..0x89fee0 (12 bodies)
 * ---- + ABI v50 helpers 12/13 (0x89fde0 / 0x89fd80, 14 rows total) ----
 *
 * Vector method-install helpers (the pushcclosure band after the landed
 * 0x8a06a0 SetReference helper) + the v49 FontRenderSettings install
 * helpers (lua-v53 notes). Four shapes (one template, per-site laws):
 *
 *   DUAL register-held (0x8a0460 / 0x8a0500 / 0x8a0360 / 0x8a0220 /
 *     0x8a0020 / 0x89ff80): newuserdata(L,4);
 *     ud[0] = [ebp+8] real_fn REGISTER; pushcclosure(L, wrapper, nups=1);
 *     lua_pushvalue(L, âˆ’1) [0xb183c8] duplicates the closure; TWO
 *     absindex/pushstring/rotate(âˆ’2,1)/rawset chains at âˆ’5 then âˆ’3;
 *     cleanups 0x40 then 0x24. Name from the edx register.
 *   SINGLE immediate-held (0x8a05a0 / 0x8a0400 / 0x8a01c0 / 0x8a0160):
 *     ud[0] = imm real_fn; imm name; ONE
 *     chain at âˆ’3; cleanup 0x38. Same template as the landed 0x8a06a0.
 *   DUAL_IMM (0x8a00c0 / 0x89fee0 â€” v47 third shape; 0x89fde0 v50
 *     helper 12): dual chain layout
 *     (pushvalue dup + 2 chains, cleanups 0x40 + 0x24) but name and
 *     real_fn are BODY IMMEDIATES; edx / [ebp+8] NOT consumed; rotate
 *     called directly through [0xb1840c] instead of the ebx-cached form.
 *   SINGLE-reg (0x89fd80 â€” v50 helper 13): SINGLE chain layout (ONE
 *     chain at âˆ’3, cleanup 0x38) but name + real_fn are REGISTER-held
 *     (name from edx, ud[0] = [ebp+8]) â€” the shape-derived source law
 *     cannot express this; NAME_SOURCES / REAL_FN_SOURCES are per-helper
 *     14-row tables.
 *
 * Call sites (RegisterClasses Vector + FontRenderSettings sections):
 * uniform record `mov ecx,L; mov edx,name; push real_fn; call helper;
 * add esp,4`. DUAL and SINGLE-reg helpers CONSUME edx + [ebp+8];
 * SINGLE (immediate-held) + DUAL_IMM ignore them.
 */

export const LUA_INSTALL_HELPER_COUNT = 29;
export const LUA_INSTALL_HELPER_VAS = Object.freeze([
  0x008a0460, 0x008a0500, 0x008a05a0, 0x008a0400, 0x008a0360, 0x008a0220,
  0x008a01c0, 0x008a0160, 0x008a00c0, 0x008a0020, 0x0089ff80, 0x0089fee0,
  0x0089fde0, /* v50 DUAL_IMM — GetAlignment install */
  0x0089fd80, /* v50 SINGLE-reg — setter install */
  /* v51 FontRenderSettings install-run helpers (0x89fe80 + 0x89fce0..
   * 0x89f600 band). */
  0x0089fe80, /* SINGLE — SetAlignment install */
  0x0089fce0, /* DUAL_IMM — GetMaxCharacters */
  0x0089fc40, /* DUAL-reg — IsAutoWrapEnabled / IsTruncationEnabled */
  0x0089fbe0, /* SINGLE — SetLineHeightModifier */
  0x0089fb40, /* DUAL_IMM — GetLineHeightModifier */
  0x0089fae0, /* SINGLE — SetMissingCharacterOverride */
  0x0089fa40, /* DUAL_IMM — GetMissingCharacterOverride */
  0x0089f9e0, /* SINGLE — Load */
  0x0089f980, /* SINGLE — Unload */
  0x0089f8e0, /* DUAL_IMM — IsLoaded */
  0x0089f840, /* DUAL_IMM — GetCharacterWidth */
  0x0089f7a0, /* DUAL_IMM — GetStringWidth */
  0x0089f700, /* DUAL-reg — GetLineHeight / GetBaselineHeight */
  0x0089f660, /* DUAL_IMM — DrawString */
  0x0089f600, /* SINGLE — SetMissingCharacter */
]);
export const LUA_INSTALL_HELPER_RET_VAS = Object.freeze([
  0x008a04f6, 0x008a0596, 0x008a05f0, 0x008a0450, 0x008a03f6, 0x008a02b6,
  0x008a0210, 0x008a01b0, 0x008a0156, 0x008a00b6, 0x008a0016, 0x0089ff76,
  0x0089fe76, 0x0089fdd3,
  0x0089fed0, 0x0089fd76, 0x0089fcd6, 0x0089fc30, 0x0089fbd6, 0x0089fb30,
  0x0089fad6, 0x0089fa30, 0x0089f9d0, 0x0089f976, 0x0089f8d6, 0x0089f836,
  0x0089f796, 0x0089f6f6, 0x0089f650,
]);
export const LUA_INSTALL_HELPER_INSN_COUNTS = Object.freeze([
  72, 73, 44, 44, 73, 72, 44, 44, 67, 74, 72, 66,
  67, 50,
  44, 68, 74, 44, 67, 44, 67, 44, 44, 67, 68, 68, 74, 66, 44,
]);
export const LUA_INSTALL_HELPER_WRAPPER_VAS = Object.freeze([
  0x008a8270, 0x008a81d0, 0x008a8180, 0x008a8310, 0x008a8430, 0x008a8510,
  0x008a8580, 0x008a8610, 0x008a8680, 0x008a8740, 0x008a8810, 0x008a88f0,
  0x008a89e0, /* v50 GetAlignment (pushed @ 0x89fdf6) */
  0x008a8a40, /* v50 setter (pushed @ 0x89fd98) */
  0x008a8970, /* v51 SetAlignment */
  0x008a8ab0, /* v51 GetMaxCharacters */
  0x008a8b10, /* v51 IsAutoWrapEnabled / IsTruncationEnabled */
  0x008a8b80, /* v51 SetLineHeightModifier */
  0x008a8c10, /* v51 GetLineHeightModifier */
  0x008a8970, /* v51 SetMissingCharacterOverride (SHARED wrapper) */
  0x008a8c80, /* v51 GetMissingCharacterOverride */
  0x008a8ce0, /* v51 Load */
  0x008a8d80, /* v51 Unload */
  0x008a8dd0, /* v51 IsLoaded */
  0x008a8e40, /* v51 GetCharacterWidth */
  0x008a8ec0, /* v51 GetStringWidth */
  0x008a8f60, /* v51 GetLineHeight / GetBaselineHeight */
  0x008a8fc0, /* v51 DrawString */
  0x008a9180, /* v51 SetMissingCharacter */
]);
export const LUA_INSTALL_SHAPE_DUAL = 0;
export const LUA_INSTALL_SHAPE_SINGLE = 1;
export const LUA_INSTALL_SHAPE_DUAL_IMM = 2;
export const LUA_INSTALL_HELPER_SHAPES = Object.freeze([
  LUA_INSTALL_SHAPE_DUAL, LUA_INSTALL_SHAPE_DUAL, LUA_INSTALL_SHAPE_SINGLE,
  LUA_INSTALL_SHAPE_SINGLE, LUA_INSTALL_SHAPE_DUAL, LUA_INSTALL_SHAPE_DUAL,
  LUA_INSTALL_SHAPE_SINGLE, LUA_INSTALL_SHAPE_SINGLE,
  LUA_INSTALL_SHAPE_DUAL_IMM, LUA_INSTALL_SHAPE_DUAL, LUA_INSTALL_SHAPE_DUAL,
  LUA_INSTALL_SHAPE_DUAL_IMM,
  LUA_INSTALL_SHAPE_DUAL_IMM, /* v50 0x89fde0 */
  LUA_INSTALL_SHAPE_SINGLE,   /* v50 0x89fd80 (register-held) */
  /* v51: 14 SINGLE, 15 DUAL_IMM, 16 DUAL-reg, 17 SINGLE, 18 DUAL_IMM,
   * 19 SINGLE, 20 DUAL_IMM, 21 SINGLE, 22 SINGLE, 23 DUAL_IMM,
   * 24 DUAL_IMM, 25 DUAL_IMM, 26 DUAL-reg, 27 DUAL_IMM, 28 SINGLE. */
  LUA_INSTALL_SHAPE_SINGLE,
  LUA_INSTALL_SHAPE_DUAL_IMM,
  LUA_INSTALL_SHAPE_DUAL,
  LUA_INSTALL_SHAPE_SINGLE,
  LUA_INSTALL_SHAPE_DUAL_IMM,
  LUA_INSTALL_SHAPE_SINGLE,
  LUA_INSTALL_SHAPE_DUAL_IMM,
  LUA_INSTALL_SHAPE_SINGLE,
  LUA_INSTALL_SHAPE_SINGLE,
  LUA_INSTALL_SHAPE_DUAL_IMM,
  LUA_INSTALL_SHAPE_DUAL_IMM,
  LUA_INSTALL_SHAPE_DUAL_IMM,
  LUA_INSTALL_SHAPE_DUAL,
  LUA_INSTALL_SHAPE_DUAL_IMM,
  LUA_INSTALL_SHAPE_SINGLE,
]);
export const LUA_INSTALL_SOURCE_REGISTER = 0;
export const LUA_INSTALL_SOURCE_IMMEDIATE = 1;
/* Per-helper operand-source tables (ABI v50; v51 rows 14..28: REGISTER for
 * the DUAL-reg helpers 16/26, IMMEDIATE for all others). */
export const LUA_INSTALL_HELPER_NAME_SOURCES = Object.freeze([
  LUA_INSTALL_SOURCE_REGISTER, LUA_INSTALL_SOURCE_REGISTER,
  LUA_INSTALL_SOURCE_IMMEDIATE, LUA_INSTALL_SOURCE_IMMEDIATE,
  LUA_INSTALL_SOURCE_REGISTER, LUA_INSTALL_SOURCE_REGISTER,
  LUA_INSTALL_SOURCE_IMMEDIATE, LUA_INSTALL_SOURCE_IMMEDIATE,
  LUA_INSTALL_SOURCE_IMMEDIATE, LUA_INSTALL_SOURCE_REGISTER,
  LUA_INSTALL_SOURCE_REGISTER, LUA_INSTALL_SOURCE_IMMEDIATE,
  LUA_INSTALL_SOURCE_IMMEDIATE, /* 12 0x89fde0 */
  LUA_INSTALL_SOURCE_REGISTER,   /* 13 0x89fd80 */
  LUA_INSTALL_SOURCE_IMMEDIATE,  /* 14 0x89fe80 */
  LUA_INSTALL_SOURCE_IMMEDIATE,  /* 15 0x89fce0 */
  LUA_INSTALL_SOURCE_REGISTER,   /* 16 0x89fc40 (edx name) */
  LUA_INSTALL_SOURCE_IMMEDIATE,  /* 17 0x89fbe0 */
  LUA_INSTALL_SOURCE_IMMEDIATE,  /* 18 0x89fb40 */
  LUA_INSTALL_SOURCE_IMMEDIATE,  /* 19 0x89fae0 */
  LUA_INSTALL_SOURCE_IMMEDIATE,  /* 20 0x89fa40 */
  LUA_INSTALL_SOURCE_IMMEDIATE,  /* 21 0x89f9e0 (Load) */
  LUA_INSTALL_SOURCE_IMMEDIATE,  /* 22 0x89f980 */
  LUA_INSTALL_SOURCE_IMMEDIATE,  /* 23 0x89f8e0 */
  LUA_INSTALL_SOURCE_IMMEDIATE,  /* 24 0x89f840 */
  LUA_INSTALL_SOURCE_IMMEDIATE,  /* 25 0x89f7a0 */
  LUA_INSTALL_SOURCE_REGISTER,   /* 26 0x89f700 (edx name) */
  LUA_INSTALL_SOURCE_IMMEDIATE,  /* 27 0x89f660 */
  LUA_INSTALL_SOURCE_IMMEDIATE,  /* 28 0x89f600 */
]);
export const LUA_INSTALL_HELPER_REAL_FN_SOURCES = Object.freeze([
  LUA_INSTALL_SOURCE_REGISTER, LUA_INSTALL_SOURCE_REGISTER,
  LUA_INSTALL_SOURCE_IMMEDIATE, LUA_INSTALL_SOURCE_IMMEDIATE,
  LUA_INSTALL_SOURCE_REGISTER, LUA_INSTALL_SOURCE_REGISTER,
  LUA_INSTALL_SOURCE_IMMEDIATE, LUA_INSTALL_SOURCE_IMMEDIATE,
  LUA_INSTALL_SOURCE_IMMEDIATE, LUA_INSTALL_SOURCE_REGISTER,
  LUA_INSTALL_SOURCE_REGISTER, LUA_INSTALL_SOURCE_IMMEDIATE,
  LUA_INSTALL_SOURCE_IMMEDIATE, /* 12 0x89fde0 */
  LUA_INSTALL_SOURCE_REGISTER,   /* 13 0x89fd80 */
  LUA_INSTALL_SOURCE_IMMEDIATE,  /* 14 0x89fe80 */
  LUA_INSTALL_SOURCE_IMMEDIATE,  /* 15 0x89fce0 */
  LUA_INSTALL_SOURCE_REGISTER,   /* 16 0x89fc40 ([ebp+8] ud[0]) */
  LUA_INSTALL_SOURCE_IMMEDIATE,  /* 17 0x89fbe0 */
  LUA_INSTALL_SOURCE_IMMEDIATE,  /* 18 0x89fb40 */
  LUA_INSTALL_SOURCE_IMMEDIATE,  /* 19 0x89fae0 */
  LUA_INSTALL_SOURCE_IMMEDIATE,  /* 20 0x89fa40 */
  LUA_INSTALL_SOURCE_IMMEDIATE,  /* 21 0x89f9e0 (Load) */
  LUA_INSTALL_SOURCE_IMMEDIATE,  /* 22 0x89f980 */
  LUA_INSTALL_SOURCE_IMMEDIATE,  /* 23 0x89f8e0 */
  LUA_INSTALL_SOURCE_IMMEDIATE,  /* 24 0x89f840 */
  LUA_INSTALL_SOURCE_IMMEDIATE,  /* 25 0x89f7a0 */
  LUA_INSTALL_SOURCE_REGISTER,   /* 26 0x89f700 ([ebp+8] ud[0]) */
  LUA_INSTALL_SOURCE_IMMEDIATE,  /* 27 0x89f660 */
  LUA_INSTALL_SOURCE_IMMEDIATE,  /* 28 0x89f600 */
]);
export const LUA_INSTALL_HELPER_NAME_IMMS = Object.freeze([
  0, 0, 0x00b701c0, /* "Normalize" */
  0x00b70244, /* "Lerp" */
  0, 0,
  0x00b70200, /* "Resize" */
  0x00b70290, /* "Clamp" */
  0x00b70298, /* "Clamped" */
  0, 0,
  0x00b70300, /* "__tostring" */
  0x00b702a0, /* 12 "GetAlignment" */
  0,          /* 13 register-held */
  /* v51 immediate-held rows (register rows 16/26 -> 0). */
  0x00b702d8, /* 14 "SetAlignment" */
  0x00b70394, /* 15 "GetMaxCharacters" */
  0,
  0x00b70354, /* 17 "SetLineHeightModifier" */
  0x00b7030c, /* 18 "GetLineHeightModifier" */
  0x00b70324, /* 19 "SetMissingCharacterOverride" */
  0x00b70408, /* 20 "GetMissingCharacterOverride" */
  0x00b703f8, /* 21 "Load" */
  0x00b70400, /* 22 "Unload" */
  0x00b703d8, /* 23 "IsLoaded" */
  0x00b703e4, /* 24 "GetCharacterWidth" */
  0x00b703b8, /* 25 "GetStringWidth" */
  0,
  0x00b70468, /* 27 "DrawString" */
  0x00b7043c, /* 28 "SetMissingCharacter" */
]);
export const LUA_INSTALL_HELPER_REAL_FN_IMMS = Object.freeze([
  0, 0, 0x00a0ffc0,
  0x00a10210, /* Lerp */
  0, 0,
  0x00a100b0, /* Resize */
  0x00a103c0, /* Clamp */
  0x00a103f0, /* Clamped */
  0, 0,
  0x0085e630, /* __tostring */
  0x0040c3a0, /* 12 GetAlignment real_fn */
  0,          /* 13 register-held */
  /* v51 immediate-held rows (register rows 16/26 -> 0). */
  0x00a1a5c0, /* 14 SetAlignment */
  0x00a1a5e0, /* 15 GetMaxCharacters */
  0,
  0x00407280, /* 17 SetLineHeightModifier */
  0x00407270, /* 18 GetLineHeightModifier */
  0x00a1a630, /* 19 SetMissingCharacterOverride */
  0x0040c2e0, /* 20 GetMissingCharacterOverride */
  0x0085e470, /* 21 Load */
  0x00a1ad90, /* 22 Unload */
  0x006b83d0, /* 23 IsLoaded */
  0x00a1ae70, /* 24 GetCharacterWidth */
  0x00a1ae80, /* 25 GetStringWidth */
  0,
  0x00a1b140, /* 27 DrawString */
  0x00a1b3b0, /* 28 SetMissingCharacter */
]);
export const LUA_INSTALL_NEWUSERDATA_SIZE = 4;
export const LUA_INSTALL_CLOSURE_NUPS = 1;
export const LUA_INSTALL_PUSHVALUE_INDEX_U32 = 0xffffffff; /* âˆ’1 @ 0x8a048f */
export const LUA_INSTALL_DUAL_ABSINDEX_FIRST_U32 = 0xfffffffb; /* âˆ’5 */
export const LUA_INSTALL_DUAL_ABSINDEX_SECOND_U32 = 0xfffffffd; /* âˆ’3 */
export const LUA_INSTALL_ABSINDEX_INDEX_U32 = 0xfffffffd; /* âˆ’3 single */
export const LUA_INSTALL_ROTATE_INDEX_U32 = 0xfffffffe; /* âˆ’2 */
export const LUA_INSTALL_ROTATE_N = 1;
export const LUA_INSTALL_DUAL_CLEANUP_FIRST = 0x40;
export const LUA_INSTALL_DUAL_CLEANUP_SECOND = 0x24;
export const LUA_INSTALL_SINGLE_CLEANUP = 0x38;
export const LUA_INSTALL_IAT_NEWUSERDATA = 0x00b1839c;
export const LUA_INSTALL_IAT_PUSHCClOSURE = 0x00b183fc;
export const LUA_INSTALL_IAT_PUSHVALUE = 0x00b183c8; /* == materialize v25 */
export const LUA_INSTALL_IAT_ABSINDEX = 0x00b18418;
export const LUA_INSTALL_IAT_PUSHSTRING = 0x00b18414;
export const LUA_INSTALL_IAT_ROTATE = 0x00b1840c;
export const LUA_INSTALL_IAT_RAWSET = 0x00b18408;

export const LUA_INSTALL_SITE_COUNT = 42;
export const LUA_INSTALL_SITES = Object.freeze([
  { callVa: 0x00866a97, helper: 2, nameVa: 0x00b701c0, realFnVa: 0x00a0ffc0 }, /* Normalize */
  { callVa: 0x00866aac, helper: 1, nameVa: 0x00b701cc, realFnVa: 0x00a10030 }, /* Normalized */
  { callVa: 0x00866ac1, helper: 0, nameVa: 0x00b701b4, realFnVa: 0x00a10180 }, /* Dot */
  { callVa: 0x00866ad6, helper: 0, nameVa: 0x00b701b8, realFnVa: 0x00a101a0 }, /* Cross */
  { callVa: 0x00866aeb, helper: 3, nameVa: 0x00b70244, realFnVa: 0x00a10210 }, /* Lerp */
  { callVa: 0x00866b00, helper: 0, nameVa: 0x00b7024c, realFnVa: 0x00a0ff30 }, /* Distance */
  { callVa: 0x00866b15, helper: 0, nameVa: 0x00b7022c, realFnVa: 0x00a0ff90 }, /* DistanceSquared */
  { callVa: 0x00866b2a, helper: 4, nameVa: 0x00b7023c, realFnVa: 0x00a102e0 }, /* Rotated */
  { callVa: 0x00866b76, helper: 5, nameVa: 0x00b7021c, realFnVa: 0x00a10390 }, /* GetAngleDegrees */
  { callVa: 0x00866b8b, helper: 6, nameVa: 0x00b70200, realFnVa: 0x00a100b0 }, /* Resize */
  { callVa: 0x00866ba0, helper: 4, nameVa: 0x00b70208, realFnVa: 0x00a10100 }, /* Resized */
  { callVa: 0x00866bb5, helper: 7, nameVa: 0x00b70290, realFnVa: 0x00a103c0 }, /* Clamp */
  { callVa: 0x00866bca, helper: 8, nameVa: 0x00b70298, realFnVa: 0x00a103f0 }, /* Clamped */
  { callVa: 0x00866bdf, helper: 5, nameVa: 0x00b70278, realFnVa: 0x00a0fea0 }, /* Length */
  { callVa: 0x00866bf4, helper: 5, nameVa: 0x00b70280, realFnVa: 0x00a0fed0 }, /* LengthSquared */
  { callVa: 0x00866c09, helper: 9, nameVa: 0x00b70268, realFnVa: 0x00a10420 }, /* __add */
  { callVa: 0x00866c1e, helper: 9, nameVa: 0x00b70270, realFnVa: 0x00a10480 }, /* __sub */
  { callVa: 0x00866c33, helper: 10, nameVa: 0x00b70258, realFnVa: 0x00a104e0 }, /* __mul */
  { callVa: 0x00866c48, helper: 10, nameVa: 0x00b70260, realFnVa: 0x00a105a0 }, /* __div */
  { callVa: 0x00866c5d, helper: 1, nameVa: 0x00b702f8, realFnVa: 0x00a10660 }, /* __unm */
  { callVa: 0x00866c72, helper: 11, nameVa: 0x00b70300, realFnVa: 0x0085e630 }, /* __tostring */
  /* v50 — FontRenderSettings install run (E8 into helpers 12/13). */
  { callVa: 0x00866dcc, helper: 12, nameVa: 0x00b702a0, realFnVa: 0x0040c3a0 }, /* GetAlignment */
  { callVa: 0x00866de1, helper: 13, nameVa: 0x00b702b0, realFnVa: 0x00a1a5d0 }, /* SetMaxCharacters */
  { callVa: 0x00866e0b, helper: 13, nameVa: 0x00b703a8, realFnVa: 0x0085e450 }, /* EnableAutoWrap */
  { callVa: 0x00866e35, helper: 13, nameVa: 0x00b70380, realFnVa: 0x00a1a600 }, /* EnableTruncation */
  /* v51 — FontRenderSettings install-run sites 25..41 (helpers 14..28). */
  { callVa: 0x00866db7, helper: 14, nameVa: 0x00b702d8, realFnVa: 0x00a1a5c0 }, /* SetAlignment */
  { callVa: 0x00866df6, helper: 15, nameVa: 0x00b70394, realFnVa: 0x00a1a5e0 }, /* GetMaxCharacters */
  { callVa: 0x00866e20, helper: 16, nameVa: 0x00b7036c, realFnVa: 0x00a1a5f0 }, /* IsAutoWrapEnabled */
  { callVa: 0x00866e4a, helper: 16, nameVa: 0x00b70340, realFnVa: 0x00a1a620 }, /* IsTruncationEnabled */
  { callVa: 0x00866e5f, helper: 17, nameVa: 0x00b70354, realFnVa: 0x00407280 }, /* SetLineHeightModifier */
  { callVa: 0x00866e74, helper: 18, nameVa: 0x00b7030c, realFnVa: 0x00407270 }, /* GetLineHeightModifier */
  { callVa: 0x00866e89, helper: 19, nameVa: 0x00b70324, realFnVa: 0x00a1a630 }, /* SetMissingCharacterOverride */
  { callVa: 0x00866e9e, helper: 20, nameVa: 0x00b70408, realFnVa: 0x0040c2e0 }, /* GetMissingCharacterOverride */
  { callVa: 0x00866efc, helper: 21, nameVa: 0x00b703f8, realFnVa: 0x0085e470 }, /* Load */
  { callVa: 0x00866f11, helper: 22, nameVa: 0x00b70400, realFnVa: 0x00a1ad90 }, /* Unload */
  { callVa: 0x00866f26, helper: 23, nameVa: 0x00b703d8, realFnVa: 0x006b83d0 }, /* IsLoaded */
  { callVa: 0x00866f3b, helper: 24, nameVa: 0x00b703e4, realFnVa: 0x00a1ae70 }, /* GetCharacterWidth */
  { callVa: 0x00866f50, helper: 25, nameVa: 0x00b703b8, realFnVa: 0x00a1ae80 }, /* GetStringWidth */
  { callVa: 0x00866f65, helper: 26, nameVa: 0x00b703c8, realFnVa: 0x00a1aea0 }, /* GetLineHeight */
  { callVa: 0x00866f7a, helper: 26, nameVa: 0x00b70454, realFnVa: 0x00a1aeb0 }, /* GetBaselineHeight */
  { callVa: 0x00866f8f, helper: 27, nameVa: 0x00b70468, realFnVa: 0x00a1b140 }, /* DrawString */
  { callVa: 0x00866fa4, helper: 28, nameVa: 0x00b7043c, realFnVa: 0x00a1b3b0 }, /* SetMissingCharacter */
]);

function installHelperOk(index) {
  return index >= 0 && index < LUA_INSTALL_HELPER_COUNT;
}
function installSiteOk(index) {
  return index >= 0 && index < LUA_INSTALL_SITE_COUNT;
}

export function luaEngineInstallHelperCount() {
  return LUA_INSTALL_HELPER_COUNT;
}
export function luaEngineInstallHelperVa(index) {
  return installHelperOk(index) ? LUA_INSTALL_HELPER_VAS[index] >>> 0 : 0;
}
export function luaEngineInstallHelperRetVa(index) {
  return installHelperOk(index) ? LUA_INSTALL_HELPER_RET_VAS[index] >>> 0 : 0;
}
export function luaEngineInstallHelperBodyBytes(index) {
  if (!installHelperOk(index)) return 0;
  return (LUA_INSTALL_HELPER_RET_VAS[index] - LUA_INSTALL_HELPER_VAS[index]) >>> 0;
}
export function luaEngineInstallHelperInsnCount(index) {
  return installHelperOk(index) ? LUA_INSTALL_HELPER_INSN_COUNTS[index] : -1;
}
export function luaEngineInstallHelperWrapperVa(index) {
  return installHelperOk(index) ? LUA_INSTALL_HELPER_WRAPPER_VAS[index] >>> 0 : 0;
}
export function luaEngineInstallHelperShape(index) {
  return installHelperOk(index) ? LUA_INSTALL_HELPER_SHAPES[index] : -1;
}
export function luaEngineInstallHelperNameSource(index) {
  if (!installHelperOk(index)) return -1;
  return LUA_INSTALL_HELPER_NAME_SOURCES[index];
}
export function luaEngineInstallHelperRealFnSource(index) {
  if (!installHelperOk(index)) return -1;
  return LUA_INSTALL_HELPER_REAL_FN_SOURCES[index];
}
export function luaEngineInstallHelperNameImmVa(index) {
  return installHelperOk(index) ? LUA_INSTALL_HELPER_NAME_IMMS[index] >>> 0 : 0;
}
export function luaEngineInstallHelperRealFnImmVa(index) {
  return installHelperOk(index)
    ? LUA_INSTALL_HELPER_REAL_FN_IMMS[index] >>> 0
    : 0;
}
export function luaEngineInstallHelperNewuserdataSize() {
  return LUA_INSTALL_NEWUSERDATA_SIZE >>> 0;
}
export function luaEngineInstallHelperClosureNups() {
  return LUA_INSTALL_CLOSURE_NUPS >>> 0;
}
export function luaEngineInstallHelperPushvalueIndex() {
  return LUA_INSTALL_PUSHVALUE_INDEX_U32 >>> 0;
}
export function luaEngineInstallHelperDualAbsindexFirst() {
  return LUA_INSTALL_DUAL_ABSINDEX_FIRST_U32 >>> 0;
}
export function luaEngineInstallHelperDualAbsindexSecond() {
  return LUA_INSTALL_DUAL_ABSINDEX_SECOND_U32 >>> 0;
}
export function luaEngineInstallHelperSingleAbsindexIndex() {
  return LUA_INSTALL_ABSINDEX_INDEX_U32 >>> 0;
}
export function luaEngineInstallHelperRotateIndex() {
  return LUA_INSTALL_ROTATE_INDEX_U32 >>> 0;
}
export function luaEngineInstallHelperRotateN() {
  return LUA_INSTALL_ROTATE_N >>> 0;
}
export function luaEngineInstallHelperDualCleanupFirst() {
  return LUA_INSTALL_DUAL_CLEANUP_FIRST >>> 0;
}
export function luaEngineInstallHelperDualCleanupSecond() {
  return LUA_INSTALL_DUAL_CLEANUP_SECOND >>> 0;
}
export function luaEngineInstallHelperSingleCleanup() {
  return LUA_INSTALL_SINGLE_CLEANUP >>> 0;
}
export function luaEngineInstallHelperIatNewuserdata() {
  return LUA_INSTALL_IAT_NEWUSERDATA >>> 0;
}
export function luaEngineInstallHelperIatPushcclosure() {
  return LUA_INSTALL_IAT_PUSHCClOSURE >>> 0;
}
export function luaEngineInstallHelperIatPushvalue() {
  return LUA_INSTALL_IAT_PUSHVALUE >>> 0;
}
export function luaEngineInstallHelperIatAbsindex() {
  return LUA_INSTALL_IAT_ABSINDEX >>> 0;
}
export function luaEngineInstallHelperIatPushstring() {
  return LUA_INSTALL_IAT_PUSHSTRING >>> 0;
}
export function luaEngineInstallHelperIatRotate() {
  return LUA_INSTALL_IAT_ROTATE >>> 0;
}
export function luaEngineInstallHelperIatRawset() {
  return LUA_INSTALL_IAT_RAWSET >>> 0;
}

export function luaEngineInstallSiteCount() {
  return LUA_INSTALL_SITE_COUNT;
}
export function luaEngineInstallSiteCallVa(index) {
  return installSiteOk(index) ? LUA_INSTALL_SITES[index].callVa >>> 0 : 0;
}
export function luaEngineInstallSiteHelperIndex(index) {
  return installSiteOk(index) ? LUA_INSTALL_SITES[index].helper : -1;
}
export function luaEngineInstallSiteNameVa(index) {
  return installSiteOk(index) ? LUA_INSTALL_SITES[index].nameVa >>> 0 : 0;
}
export function luaEngineInstallSiteRealFnVa(index) {
  return installSiteOk(index) ? LUA_INSTALL_SITES[index].realFnVa >>> 0 : 0;
}
export function luaEngineInstallSiteIndexForCallVa(callVa) {
  for (let i = 0; i < LUA_INSTALL_SITE_COUNT; i += 1) {
    if (LUA_INSTALL_SITES[i].callVa === (callVa >>> 0)) return i;
  }
  return -1;
}
export function luaEngineInstallSiteChainCount(index) {
  if (!installSiteOk(index)) return -1;
  return LUA_INSTALL_HELPER_SHAPES[LUA_INSTALL_SITES[index].helper] ===
    LUA_INSTALL_SHAPE_SINGLE
    ? 1
    : 2;
}
export function luaEngineInstallSiteConsumedNameVa(index, nameVa) {
  if (!installSiteOk(index)) return 0;
  const helper = LUA_INSTALL_SITES[index].helper;
  if (LUA_INSTALL_HELPER_NAME_SOURCES[helper] === LUA_INSTALL_SOURCE_REGISTER) {
    return nameVa >>> 0;
  }
  return LUA_INSTALL_HELPER_NAME_IMMS[helper] >>> 0;
}
export function luaEngineInstallSiteConsumedRealFnVa(index, realFnVa) {
  if (!installSiteOk(index)) return 0;
  const helper = LUA_INSTALL_SITES[index].helper;
  if (LUA_INSTALL_HELPER_REAL_FN_SOURCES[helper] === LUA_INSTALL_SOURCE_REGISTER) {
    return realFnVa >>> 0;
  }
  return LUA_INSTALL_HELPER_REAL_FN_IMMS[helper] >>> 0;
}
export function luaEngineInstallSiteStackArgBytesTotal(index) {
  if (!installSiteOk(index)) return 0;
  return LUA_INSTALL_HELPER_SHAPES[LUA_INSTALL_SITES[index].helper] ===
    LUA_INSTALL_SHAPE_SINGLE
    ? LUA_INSTALL_SINGLE_CLEANUP >>> 0
    : (LUA_INSTALL_DUAL_CLEANUP_FIRST + LUA_INSTALL_DUAL_CLEANUP_SECOND) >>> 0;
}

/* ---- ABI v18 â€” metatable builders shared by the class-create template ----
 *
 * Reasoned from full reads of 0x0085d040 / 0x0085d2c0 / 0x0085d500. Each
 * takes ecx = the class stack-ref and one stack argument (the class name),
 * builds one metatable, and returns with `ret 4`.
 *
 * Every metafield install is the same four-call record:
 *   absindex(L, idx) ; pushstring(L, "__name") ; rotate(L, -2, 1) ;
 *   rawset(L, abs)
 * with the value already on the stack. rotate is (-2, 1) on all 19 sites;
 * absindex is -2 on 18 of them, -3 on the single `__class` record in the
 * class builder.
 */

export const LUA_METATABLE_BUILDER_COUNT = 3;
export const LUA_METATABLE_BUILDER_CONST = 0;
export const LUA_METATABLE_BUILDER_CLASS = 1;
export const LUA_METATABLE_BUILDER_STATIC = 2;
export const LUA_METATABLE_BUILDER_CONST_VA = 0x0085d040;
export const LUA_METATABLE_BUILDER_CLASS_VA = 0x0085d2c0;
export const LUA_METATABLE_BUILDER_STATIC_VA = 0x0085d500;
export const LUA_METAFIELD_INSTALL_TOTAL = 19;
export const LUA_METAFIELD_ABSINDEX_U32 = 0xfffffffe;
export const LUA_METAFIELD_ABSINDEX_EXCEPTION_U32 = 0xfffffffd;
export const LUA_METAFIELD_ROTATE_INDEX_U32 = 0xfffffffe;
export const LUA_METAFIELD_ROTATE_N = 1;
export const LUA_METAFIELD_ROTATE_AGREEMENT = 19;
export const LUA_METAFIELD_ABSINDEX_AGREEMENT = 18;

export const LUA_METATABLE_CREATETABLE_NARR = 0;
export const LUA_METATABLE_CREATETABLE_NREC = 0;
export const LUA_METATABLE_SELF_PUSHVALUE_INDEX_U32 = 0xffffffff;
export const LUA_METATABLE_SETMETATABLE_INDEX_U32 = 0xfffffffe;
export const LUA_METATABLE_STATIC_SETMETA_INDEX_U32 = 0xfffffffd;
export const LUA_METATABLE_STATIC_NAME_ABSINDEX_U32 = 0xfffffffb;
export const LUA_METATABLE_IDENTITY_PUSHBOOLEAN = 1;
export const LUA_METATABLE_IDENTITY_RAWSETP_INDEX_U32 = 0xfffffffe;
export const LUA_METATABLE_IDENTITY_KEY_VA = 0x00c7f4b8;
export const LUA_METATABLE_PROTECT_GATE_VA = 0x0085c390;
export const LUA_METATABLE_PROTECT_GATE_DAT_A = 0x00c7f4b4;
export const LUA_METATABLE_PROTECT_GATE_DAT_B = 0x00c7f4b0;

export const LUA_CONST_PREFIX_LEN = 6;
export const LUA_CONST_PREFIX_SSO_CAPACITY = 0x0f;
export const LUA_CONST_PREFIX_LO_VA = 0x00b6eaa4;
export const LUA_CONST_PREFIX_HI_VA = 0x00b6eaa8;
/** The exact dword/word the PE loads at 0x0085d0ac / 0x0085d0b4. */
export const LUA_CONST_PREFIX_LO_BYTES = 0x736e6f63;
export const LUA_CONST_PREFIX_HI_BYTES = 0x2074;
export const LUA_CONST_PREFIX_CONCAT_VA = 0x0060c790;

export const LUA_METAFIELD_INDEX_NAME_VA = 0x00b6ea78;
export const LUA_METAFIELD_NEWINDEX_NAME_VA = 0x00b6ea80;
export const LUA_METAFIELD_PROPGET_NAME_VA = 0x00b6e994;
export const LUA_METAFIELD_PROPSET_NAME_VA = 0x00b6ea38;
export const LUA_METAFIELD_METATABLE_NAME_VA = 0x00b6ea64;
export const LUA_METAFIELD_CLASS_NAME_VA = 0x00b6ea70;

export const LUA_METATABLE_INDEX_CLOSURE_VA = 0x0085cd40;
export const LUA_METATABLE_NEWINDEX_CLOSURE_VA = 0x0085cf30;
export const LUA_METATABLE_STATIC_INDEX_CLOSURE_VA = 0x0085c810;
export const LUA_METATABLE_STATIC_NEWINDEX_CLOSURE_VA = 0x0085c970;
export const LUA_METATABLE_CLOSURE_NUPS = 0;

export const LUA_METAFIELD_VALUE_STRING_PREFIXED = 0;
export const LUA_METAFIELD_VALUE_STRING_NAME = 1;
export const LUA_METAFIELD_VALUE_CLOSURE = 2;
export const LUA_METAFIELD_VALUE_NEWTABLE = 3;
export const LUA_METAFIELD_VALUE_PUSHVALUE = 4;
export const LUA_METAFIELD_VALUE_NIL = 5;

/**
 * `test al, al` after the protection call â€” only the low byte decides.
 * @param {number} gateReturn
 */
export function luaEngineMetatableProtectGate(gateReturn) {
  return (gateReturn & 0xff) !== 0 ? 1 : 0;
}

/**
 * Length of the const metatable's __type string, "const " + class name.
 * @param {number} classNameLen
 */
export function luaEngineConstPrefixStringLen(classNameLen) {
  return (LUA_CONST_PREFIX_LEN + classNameLen) >>> 0;
}

const CONST_METAFIELDS = Object.freeze([
  { callVa: 0x0085d185, nameVa: 0x00b6e9cc, kind: LUA_METAFIELD_VALUE_STRING_PREFIXED, valueVa: 0, valueIndex: 0, absindex: 0xfffffffe, gated: 0 },
  { callVa: 0x0085d1c5, nameVa: 0x00b6ea78, kind: LUA_METAFIELD_VALUE_CLOSURE, valueVa: 0x0085cd40, valueIndex: 0, absindex: 0xfffffffe, gated: 0 },
  { callVa: 0x0085d205, nameVa: 0x00b6ea80, kind: LUA_METAFIELD_VALUE_CLOSURE, valueVa: 0x0085cf30, valueIndex: 0, absindex: 0xfffffffe, gated: 0 },
  { callVa: 0x0085d240, nameVa: 0x00b6e994, kind: LUA_METAFIELD_VALUE_NEWTABLE, valueVa: 0, valueIndex: 0, absindex: 0xfffffffe, gated: 0 },
  { callVa: 0x0085d280, nameVa: 0x00b6ea64, kind: LUA_METAFIELD_VALUE_NIL, valueVa: 0, valueIndex: 0, absindex: 0xfffffffe, gated: 1 },
]);

const CLASS_METAFIELDS = Object.freeze([
  { callVa: 0x0085d326, nameVa: 0x00b6e9cc, kind: LUA_METAFIELD_VALUE_STRING_NAME, valueVa: 0, valueIndex: 0, absindex: 0xfffffffe, gated: 0 },
  { callVa: 0x0085d366, nameVa: 0x00b6ea78, kind: LUA_METAFIELD_VALUE_CLOSURE, valueVa: 0x0085cd40, valueIndex: 0, absindex: 0xfffffffe, gated: 0 },
  { callVa: 0x0085d3a6, nameVa: 0x00b6ea80, kind: LUA_METAFIELD_VALUE_CLOSURE, valueVa: 0x0085cf30, valueIndex: 0, absindex: 0xfffffffe, gated: 0 },
  { callVa: 0x0085d3e6, nameVa: 0x00b6e994, kind: LUA_METAFIELD_VALUE_NEWTABLE, valueVa: 0, valueIndex: 0, absindex: 0xfffffffe, gated: 0 },
  { callVa: 0x0085d420, nameVa: 0x00b6ea38, kind: LUA_METAFIELD_VALUE_NEWTABLE, valueVa: 0, valueIndex: 0, absindex: 0xfffffffe, gated: 0 },
  { callVa: 0x0085d45e, nameVa: 0x00b6e9c4, kind: LUA_METAFIELD_VALUE_PUSHVALUE, valueVa: 0, valueIndex: 0xfffffffe, absindex: 0xfffffffe, gated: 0 },
  { callVa: 0x0085d499, nameVa: 0x00b6ea70, kind: LUA_METAFIELD_VALUE_PUSHVALUE, valueVa: 0, valueIndex: 0xffffffff, absindex: 0xfffffffd, gated: 0 },
  { callVa: 0x0085d4d9, nameVa: 0x00b6ea64, kind: LUA_METAFIELD_VALUE_NIL, valueVa: 0, valueIndex: 0, absindex: 0xfffffffe, gated: 1 },
]);

const STATIC_METAFIELDS = Object.freeze([
  { callVa: 0x0085d594, nameVa: 0x00b6ea78, kind: LUA_METAFIELD_VALUE_CLOSURE, valueVa: 0x0085c810, valueIndex: 0, absindex: 0xfffffffe, gated: 0 },
  { callVa: 0x0085d5d3, nameVa: 0x00b6ea80, kind: LUA_METAFIELD_VALUE_CLOSURE, valueVa: 0x0085c970, valueIndex: 0, absindex: 0xfffffffe, gated: 0 },
  { callVa: 0x0085d613, nameVa: 0x00b6e994, kind: LUA_METAFIELD_VALUE_NEWTABLE, valueVa: 0, valueIndex: 0, absindex: 0xfffffffe, gated: 0 },
  { callVa: 0x0085d64d, nameVa: 0x00b6ea38, kind: LUA_METAFIELD_VALUE_NEWTABLE, valueVa: 0, valueIndex: 0, absindex: 0xfffffffe, gated: 0 },
  { callVa: 0x0085d686, nameVa: 0x00b6ea70, kind: LUA_METAFIELD_VALUE_PUSHVALUE, valueVa: 0, valueIndex: 0xfffffffe, absindex: 0xfffffffe, gated: 0 },
  { callVa: 0x0085d6c6, nameVa: 0x00b6ea64, kind: LUA_METAFIELD_VALUE_NIL, valueVa: 0, valueIndex: 0, absindex: 0xfffffffe, gated: 1 },
]);

/** The three metatable builders, in the order the create template calls them. */
export const LUA_METATABLE_BUILDERS = Object.freeze([
  { builderVa: LUA_METATABLE_BUILDER_CONST_VA, entries: CONST_METAFIELDS },
  { builderVa: LUA_METATABLE_BUILDER_CLASS_VA, entries: CLASS_METAFIELDS },
  { builderVa: LUA_METATABLE_BUILDER_STATIC_VA, entries: STATIC_METAFIELDS },
]);

function builderAt(builder) {
  return Number.isInteger(builder) && builder >= 0 && builder < LUA_METATABLE_BUILDERS.length
    ? LUA_METATABLE_BUILDERS[builder]
    : null;
}

function metafieldAt(builder, index) {
  const b = builderAt(builder);
  if (!b) return null;
  return Number.isInteger(index) && index >= 0 && index < b.entries.length
    ? b.entries[index]
    : null;
}

/** Number of metatable builders. */
export function luaEngineMetatableBuilderCount() {
  return LUA_METATABLE_BUILDERS.length;
}

/** @param {number} builder */
export function luaEngineMetatableBuilderVa(builder) {
  const b = builderAt(builder);
  return b ? b.builderVa >>> 0 : 0;
}

/** @param {number} builder */
export function luaEngineMetafieldCount(builder) {
  const b = builderAt(builder);
  return b ? b.entries.length : -1;
}

/** @param {number} builder @param {number} index */
export function luaEngineMetafieldCallVa(builder, index) {
  const e = metafieldAt(builder, index);
  return e ? e.callVa >>> 0 : 0;
}

/** @param {number} builder @param {number} index */
export function luaEngineMetafieldNameVa(builder, index) {
  const e = metafieldAt(builder, index);
  return e ? e.nameVa >>> 0 : 0;
}

/** @param {number} builder @param {number} index */
export function luaEngineMetafieldValueKind(builder, index) {
  const e = metafieldAt(builder, index);
  return e ? e.kind : -1;
}

/** @param {number} builder @param {number} index */
export function luaEngineMetafieldValueVa(builder, index) {
  const e = metafieldAt(builder, index);
  return e ? e.valueVa >>> 0 : 0;
}

/** @param {number} builder @param {number} index */
export function luaEngineMetafieldValueIndex(builder, index) {
  const e = metafieldAt(builder, index);
  return e ? e.valueIndex >>> 0 : 0;
}

/** @param {number} builder @param {number} index */
export function luaEngineMetafieldAbsindex(builder, index) {
  const e = metafieldAt(builder, index);
  return e ? e.absindex >>> 0 : 0;
}

/** @param {number} builder @param {number} index */
export function luaEngineMetafieldGated(builder, index) {
  const e = metafieldAt(builder, index);
  return e ? e.gated : -1;
}

/**
 * Whether a metafield install runs for a given protection-gate return.
 * @param {number} builder @param {number} index @param {number} gateReturn
 */
export function luaEngineMetafieldInstalled(builder, index, gateReturn) {
  const e = metafieldAt(builder, index);
  if (!e) return -1;
  if (!e.gated) return 1;
  return luaEngineMetatableProtectGate(gateReturn);
}

/**
 * How many metafields a builder installs for a given gate return.
 * @param {number} builder @param {number} gateReturn
 */
export function luaEngineMetafieldInstalledCount(builder, gateReturn) {
  const b = builderAt(builder);
  if (!b) return -1;
  let total = 0;
  for (let i = 0; i < b.entries.length; i += 1) {
    if (luaEngineMetafieldInstalled(builder, i, gateReturn) === 1) total += 1;
  }
  return total;
}

/* ---- ABI v19 â€” the property-builder family and its return contract ----
 *
 * Reasoned from the whole-body byte census of the seven members (byte diff
 * against 0x00875510, import-directory IAT resolution, image-wide E8
 * call-site scan) and the Color/Sprite span receiver walk â€” independently
 * of the C++ table encoding.
 */

export const LUA_PROPERTY_BUILDER_COUNT = 7;
export const LUA_PROPERTY_BUILDER_TEMPLATE_BYTES = 0x16a;
export const LUA_PROPERTY_BUILDER_TEMPLATE_INSNS = 133;
export const LUA_PROPERTY_BUILDER_FOLDED_BODY_BYTES = 0x172;
export const LUA_PROPERTY_BUILDER_FOLDED_BODY_INSNS = 131;
export const LUA_PROPERTY_BUILDER_STRIDE = 0x170;
export const LUA_PROPERTY_BUILDER_STRIDE_AFTER_FOLDED = 0x180;
export const LUA_PROPERTY_BUILDER_ARG_BYTES = 0x0c;
export const LUA_PROPERTY_BUILDER_ARG_COUNT = 3;
export const LUA_PROPERTY_BUILDER_BASE_VA = 0x00875230;
export const LUA_PROPERTY_BUILDER_FOLDED_VA = 0x00875960;
export const LUA_PROPERTY_BUILDER_LAST_VA = 0x00875ae0;

export const LUA_PROPERTY_BUILDER_KIND_SHARED_ARG = 0;
export const LUA_PROPERTY_BUILDER_KIND_SPLIT_ARG = 1;
export const LUA_PROPERTY_BUILDER_KIND_FOLDED = 2;

export const LUA_PROPERTY_BUILDER_CALL_COUNT = 28;
export const LUA_PROPERTY_BUILDER_ABSINDEX_CALLS = 6;
export const LUA_PROPERTY_BUILDER_PUSHSTRING_CALLS = 6;
export const LUA_PROPERTY_BUILDER_RAWGET_CALLS = 3;
export const LUA_PROPERTY_BUILDER_NEWUSERDATA_CALLS = 2;
export const LUA_PROPERTY_BUILDER_PUSHCCLOSURE_CALLS = 2;
export const LUA_PROPERTY_BUILDER_PUSHVALUE_CALLS = 1;
export const LUA_PROPERTY_BUILDER_ROTATE_CALLS = 3;
export const LUA_PROPERTY_BUILDER_RAWSET_CALLS = 3;
export const LUA_PROPERTY_BUILDER_SETTOP_CALLS = 2;

export const LUA_PROPERTY_BUILDER_REP_VA = 0x00875510;
export const LUA_PROPERTY_BUILDER_DIFF_BYTES_SHARED = 7;
export const LUA_PROPERTY_BUILDER_DIFF_BYTES_SPLIT = 4;
export const LUA_PROPERTY_BUILDER_GET_TRAMP_IMM_OFF = 0x62;
export const LUA_PROPERTY_BUILDER_SET_TRAMP_IMM_OFF = 0x118;
export const LUA_PROPERTY_BUILDER_GET_UD_DISP_OFF = 0x5e;
export const LUA_PROPERTY_BUILDER_SET_UD_DISP_OFF = 0x114;
export const LUA_PROPERTY_BUILDER_UD_DISP_ARG2 = 0x0c;
export const LUA_PROPERTY_BUILDER_UD_DISP_ARG3 = 0x10;
export const LUA_PROPERTY_BUILDER_FOLDED_NAME_PUSHES = 3;
export const LUA_PROPERTY_BUILDER_FOLDED_UD_IMM_STORES = 2;
export const LUA_PROPERTY_BUILDER_FOLDED_SCHED_SWAPS = 2;

export const LUA_PROPERTY_BUILDER_PROPGET_RAWGET_A_U32 = 0xfffffffe;
export const LUA_PROPERTY_BUILDER_PROPGET_RAWGET_B_U32 = 0xfffffffc;
export const LUA_PROPERTY_BUILDER_GET_INSTALL_ABS_A_U32 = 0xfffffffc;
export const LUA_PROPERTY_BUILDER_GET_INSTALL_ABS_B_U32 = 0xfffffffe;
export const LUA_PROPERTY_BUILDER_GET_SETTOP_U32 = 0xfffffffd;
export const LUA_PROPERTY_BUILDER_PROPSET_RAWGET_U32 = 0xfffffffe;
export const LUA_PROPERTY_BUILDER_SET_INSTALL_ABS_U32 = 0xfffffffe;
export const LUA_PROPERTY_BUILDER_SET_SETTOP_U32 = 0xfffffffe;
export const LUA_PROPERTY_BUILDER_PUSHVALUE_INDEX_U32 = 0xffffffff;
export const LUA_PROPERTY_BUILDER_ROTATE_INDEX_U32 = 0xfffffffe;
export const LUA_PROPERTY_BUILDER_ROTATE_N = 1;
export const LUA_PROPERTY_BUILDER_UD_SIZE = 0x04;
export const LUA_PROPERTY_BUILDER_CLOSURE_NUPS = 0x01;
export const LUA_PROPERTY_BUILDER_CLEAN_A = 0x44;
export const LUA_PROPERTY_BUILDER_CLEAN_B = 0x48;
export const LUA_PROPERTY_BUILDER_CLEAN_C = 0x44;
export const LUA_PROPERTY_BUILDER_CLEAN_D = 0x24;
export const LUA_PROPERTY_BUILDER_CLEAN_TOTAL = 0xf4;
export const LUA_PROPERTY_BUILDER_ARG_DWORDS = 61;
export const LUA_PROPERTY_BUILDER_THIS_SAVE_COUNT = 1;
export const LUA_PROPERTY_BUILDER_THIS_READ_COUNT = 6;

export const LUA_PROPERTY_BUILDER_PROPGET_NAME_VA = 0x00b6e994;
export const LUA_PROPERTY_BUILDER_PROPSET_NAME_VA = 0x00b6ea38;

export const LUA_IAT_LUA_ABSINDEX_VA = 0x00b18418;
export const LUA_IAT_LUA_PUSHSTRING_VA = 0x00b18414;
export const LUA_IAT_LUA_ROTATE_VA = 0x00b1840c;
export const LUA_IAT_LUA_RAWSET_VA = 0x00b18408;
export const LUA_IAT_LUA_NEWUSERDATA_VA = 0x00b1839c;

export const LUA_PROPERTY_BUILDER_FOLDED_NAME_VA = 0x00b6508c;
export const LUA_PROPERTY_BUILDER_FOLDED_GET_UD = 0x00407410;
export const LUA_PROPERTY_BUILDER_FOLDED_SET_UD = 0x004073d0;
export const LUA_PROPERTY_BUILDER_FOLDED_CALLER_VA = 0x0086754e;
export const LUA_PROPERTY_BUILDER_FOLDED_CALLER_COUNT = 1;

export const LUA_PROPERTY_BUILDER_CALLSITE_TOTAL = 20;
export const LUA_PROPERTY_BUILDER_CALLSITES_OUTSIDE_RC = 0;

export const LUA_CLASS_SPAN_RESOLVED_DIRECT = 0;
export const LUA_CLASS_SPAN_RESOLVED_RETURN_CONTRACT = 1;
export const LUA_CLASS_SPAN_UNRESOLVED = 2;

export const LUA_CLASS_COLOR_INSTALLS = 7;
export const LUA_CLASS_COLOR_FIELDS = 7;
export const LUA_CLASS_SPRITE_INSTALLS = 38;
export const LUA_CLASS_SPRITE_FIELDS = 7;
export const LUA_CLASS_COLOR_RECEIVER_SITES = 14;
export const LUA_CLASS_SPRITE_RECEIVER_SITES = 45;
export const LUA_CLASS_COLOR_BASE_RECEIVER_INSTALLS = 6;
export const LUA_CLASS_SPRITE_BASE_RECEIVER_INSTALLS = 4;
export const LUA_CLASS_COLOR_SLOT_DISP = 0x24;
export const LUA_CLASS_SPRITE_SLOT_DISP = 0x14;

/** Family member rows, ascending VA (independent transcription of the
 *  census: kind from the ud-source disp, trampolines from the imm fields,
 *  call-site counts from the image-wide E8 scan). */
export const LUA_PROPERTY_BUILDERS = Object.freeze([
  { va: 0x00875230, kind: 0, getTramp: 0x008bb2e0, setTramp: 0x008bb340, bytes: 0x16a, insns: 133, callsites: 2 },
  { va: 0x008753a0, kind: 0, getTramp: 0x008bb420, setTramp: 0x008bb480, bytes: 0x16a, insns: 133, callsites: 4 },
  { va: 0x00875510, kind: 1, getTramp: 0x0089f590, setTramp: 0x0089f500, bytes: 0x16a, insns: 133, callsites: 7 },
  { va: 0x00875680, kind: 1, getTramp: 0x0089e970, setTramp: 0x0089e8e0, bytes: 0x16a, insns: 133, callsites: 2 },
  { va: 0x008757f0, kind: 1, getTramp: 0x0089e870, setTramp: 0x0089e7e0, bytes: 0x16a, insns: 133, callsites: 2 },
  { va: 0x00875960, kind: 2, getTramp: 0x0089e740, setTramp: 0x0089e6b0, bytes: 0x172, insns: 131, callsites: 1 },
  { va: 0x00875ae0, kind: 1, getTramp: 0x0089e5a0, setTramp: 0x0089e530, bytes: 0x16a, insns: 133, callsites: 2 },
]);

function propertyBuilderAt(index) {
  return Number.isInteger(index) && index >= 0 && index < LUA_PROPERTY_BUILDERS.length
    ? LUA_PROPERTY_BUILDERS[index]
    : null;
}

export function luaEnginePropertyBuilderCount() {
  return LUA_PROPERTY_BUILDERS.length;
}

/** @param {number} index */
export function luaEnginePropertyBuilderVa(index) {
  const e = propertyBuilderAt(index);
  return e ? e.va >>> 0 : 0;
}

/** @param {number} index */
export function luaEnginePropertyBuilderKind(index) {
  const e = propertyBuilderAt(index);
  return e ? e.kind : -1;
}

/** @param {number} index */
export function luaEnginePropertyBuilderGetTrampolineVa(index) {
  const e = propertyBuilderAt(index);
  return e ? e.getTramp >>> 0 : 0;
}

/** @param {number} index */
export function luaEnginePropertyBuilderSetTrampolineVa(index) {
  const e = propertyBuilderAt(index);
  return e ? e.setTramp >>> 0 : 0;
}

/** @param {number} index */
export function luaEnginePropertyBuilderBodyBytes(index) {
  const e = propertyBuilderAt(index);
  return e ? e.bytes >>> 0 : 0;
}

/** @param {number} index */
export function luaEnginePropertyBuilderBodyInsns(index) {
  const e = propertyBuilderAt(index);
  return e ? e.insns >>> 0 : 0;
}

/** @param {number} index */
export function luaEnginePropertyBuilderCallsiteCount(index) {
  const e = propertyBuilderAt(index);
  return e ? e.callsites : -1;
}

/** Exact member VA -> family index, else -1. @param {number} va */
export function luaEnginePropertyBuilderIndexForVa(va) {
  const v = va >>> 0;
  for (let i = 0; i < LUA_PROPERTY_BUILDERS.length; i += 1) {
    if (LUA_PROPERTY_BUILDERS[i].va === v) return i;
  }
  return -1;
}

/** Stride law: next member VA (0x170; 0x180 after the folded member).
 *  @param {number} index */
export function luaEnginePropertyBuilderNextVa(index) {
  const e = propertyBuilderAt(index);
  if (!e || index + 1 >= LUA_PROPERTY_BUILDERS.length) return 0;
  const stride = e.kind === LUA_PROPERTY_BUILDER_KIND_FOLDED
    ? LUA_PROPERTY_BUILDER_STRIDE_AFTER_FOLDED
    : LUA_PROPERTY_BUILDER_STRIDE;
  return (e.va + stride) >>> 0;
}

/** PE epilogue mov eax, esi with esi = [ebp-4] = entry ecx (stored once,
 *  never rewritten) â€” return this. @param {number} thisPtr */
export function luaEnginePropertyBuilderReturnThis(thisPtr) {
  return thisPtr >>> 0;
}

/** Chained entry receiver `mov ecx, eax` â€” the previous return.
 *  @param {number} prevReturn */
export function luaEnginePropertyBuilderChainReceiver(prevReturn) {
  return prevReturn >>> 0;
}

/** The state field [esi]-receiver installs read: this + 0 (ABI v5 layout;
 *  the body never writes through this). @param {number} thisPtr */
export function luaEnginePropertyBuilderStateAddr(thisPtr) {
  return (thisPtr + LUA_STACK_REF_OFF_STATE) >>> 0;
}

/** Getter userdata payload: arg2, or the folded immediate; never arg3.
 *  @param {number} index @param {number} arg2 @param {number} arg3 */
export function luaEnginePropertyBuilderGetterUdValue(index, arg2, arg3) {
  const e = propertyBuilderAt(index);
  void arg3;
  if (!e) return 0;
  if (e.kind === LUA_PROPERTY_BUILDER_KIND_FOLDED) {
    return LUA_PROPERTY_BUILDER_FOLDED_GET_UD;
  }
  return arg2 >>> 0;
}

/** Setter userdata payload: arg2 for SHARED_ARG (arg3 pushed but dead),
 *  arg3 for SPLIT_ARG, folded immediate otherwise.
 *  @param {number} index @param {number} arg2 @param {number} arg3 */
export function luaEnginePropertyBuilderSetterUdValue(index, arg2, arg3) {
  const e = propertyBuilderAt(index);
  if (!e) return 0;
  if (e.kind === LUA_PROPERTY_BUILDER_KIND_SHARED_ARG) return arg2 >>> 0;
  if (e.kind === LUA_PROPERTY_BUILDER_KIND_SPLIT_ARG) return arg3 >>> 0;
  return LUA_PROPERTY_BUILDER_FOLDED_SET_UD;
}

export function luaEnginePropertyBuilderFoldedNameVa() {
  return LUA_PROPERTY_BUILDER_FOLDED_NAME_VA;
}

export function luaEnginePropertyBuilderFoldedGetUd() {
  return LUA_PROPERTY_BUILDER_FOLDED_GET_UD;
}

export function luaEnginePropertyBuilderFoldedSetUd() {
  return LUA_PROPERTY_BUILDER_FOLDED_SET_UD;
}

export function luaEnginePropertyBuilderFoldedCallerVa() {
  return LUA_PROPERTY_BUILDER_FOLDED_CALLER_VA;
}

/** v19 span-resolution axis: DIRECT for the six receiver-clean spans,
 *  RETURN_CONTRACT for Color/Sprite, UNRESOLVED for EntityRef.
 *  populated == (resolution != UNRESOLVED). @param {number} cls */
export function luaEngineRegisterClassSpanResolution(cls) {
  if (!Number.isInteger(cls) || cls < 0 || cls >= LUA_REGISTER_CLASSES.length) return -1;
  if (cls === LUA_CLASS_COLOR || cls === LUA_CLASS_SPRITE) {
    return LUA_CLASS_SPAN_RESOLVED_RETURN_CONTRACT;
  }
  if (cls === LUA_CLASS_ENTITYREF) return LUA_CLASS_SPAN_UNRESOLVED;
  return LUA_CLASS_SPAN_RESOLVED_DIRECT;
}

/** @param {number} cls @param {number} index */
export function luaEngineRegisterClassFieldCallVa(cls, index) {
  const e = classFieldAt(cls, index);
  return e && e.callVa ? e.callVa >>> 0 : 0;
}

/** @param {number} cls @param {number} index */
export function luaEngineRegisterClassFieldBuilderVa(cls, index) {
  const e = classFieldAt(cls, index);
  return e && e.builderVa ? e.builderVa >>> 0 : 0;
}

/* ---- ABI v20 â€” the EntityRef data-builder band (RegisterClasses depth) ----
 *
 * Six members at 0x00875c50â€¦0x008763b0, one 28-call template shared with
 * the v19 property builders. Transcribed independently from the disasm
 * dumps in section-notes/lua-v20/ (fresh-band, entityref-span, 8763b0):
 *
 *   m0 FOLDED 0x875c50 get 0x8bb900 set 0x8bb960 ud 0/0   name 0xb6d1a4
 *   m1 SHARED 0x875dd0 get 0x8bb9c0 set 0x8bb960 ud arg2/arg2
 *   m2 FOLDED 0x875f40 get 0x8bba20 set 0x8bb960 ud 8/8   name 0xb706e4
 *   m3 FOLDED 0x8760c0 get 0x8bba80 set 0x8bbb20 ud 0x10/0x10 name 0xb65080
 *   m4 SPLIT  0x876240 get 0x89e4c0 set 0x89e450 ud arg2/arg3
 *   m5 FOLDED 0x8763b0 get 0x8bbbc0 set 0x8bbc60 ud 0x24/0x24 name 0xb706b8
 */

export const LUA_ENTITYREF_BAND_COUNT = 6;
export const LUA_ENTITYREF_BAND_TEMPLATE_BYTES = 0x16a;
export const LUA_ENTITYREF_BAND_TEMPLATE_INSNS = 133;
export const LUA_ENTITYREF_BAND_FOLDED_BODY_BYTES = 0x172;
export const LUA_ENTITYREF_BAND_FOLDED_BODY_INSNS = 131;
export const LUA_ENTITYREF_BAND_STRIDE = 0x170;
export const LUA_ENTITYREF_BAND_STRIDE_AFTER_FOLDED = 0x180;
export const LUA_ENTITYREF_BAND_ARG_BYTES = 0x0c;
export const LUA_ENTITYREF_BAND_ARG_COUNT = 3;
export const LUA_ENTITYREF_BAND_BASE_VA = 0x00875c50;
export const LUA_ENTITYREF_BAND_LAST_VA = 0x008763b0;

export const LUA_ENTITYREF_BAND_KIND_SHARED_ARG = 0;
export const LUA_ENTITYREF_BAND_KIND_SPLIT_ARG = 1;
export const LUA_ENTITYREF_BAND_KIND_FOLDED = 2;

export const LUA_ENTITYREF_BAND_GET_CLOSURE_IMM_OFF = 0x62;
export const LUA_ENTITYREF_BAND_SET_CLOSURE_IMM_OFF = 0x118;
export const LUA_ENTITYREF_BAND_GET_UD_DISP_OFF = 0x5e;
export const LUA_ENTITYREF_BAND_SET_UD_DISP_OFF = 0x114;
export const LUA_ENTITYREF_BAND_UD_DISP_ARG2 = 0x0c;
export const LUA_ENTITYREF_BAND_UD_DISP_ARG3 = 0x10;

export const LUA_ENTITYREF_BAND_CALLSITE_TOTAL = 8;
export const LUA_ENTITYREF_BAND_CALLSITES_OUTSIDE_RC = 0;
export const LUA_ENTITYREF_BAND_FIRST_CALLSITE_VA = 0x00867686;

export const LUA_ENTITYREF_BAND_TYPE_NAME_VA = 0x00b6d1a4;
export const LUA_ENTITYREF_BAND_SPAWNER_TYPE_NAME_VA = 0x00b706e4;
export const LUA_ENTITYREF_BAND_POSITION_NAME_VA = 0x00b65080;
export const LUA_ENTITYREF_BAND_ENTITY_NAME_VA = 0x00b706b8;

/** Six member rows, ascending VA.
 *  kind: 0 = ud arg2/arg2, 1 = ud arg2/arg3, 2 = folded immediates.
 *  firstCallSite from the RegisterClasses entityref-span walk; all 8
 *  call sites are inside RegisterClasses (CALLSITES_OUTSIDE_RC = 0). */
export const LUA_ENTITYREF_BUILDERS = Object.freeze([
  { va: 0x00875c50, kind: 2, getClosure: 0x008bb900, setClosure: 0x008bb960, bytes: 0x172, insns: 131, callsites: 1, firstCallSite: 0x00867686, nameVa: 0x00b6d1a4, getUd: 0x00, setUd: 0x00 },
  { va: 0x00875dd0, kind: 0, getClosure: 0x008bb9c0, setClosure: 0x008bb960, bytes: 0x16a, insns: 133, callsites: 2, firstCallSite: 0x00867696, nameVa: 0x00, getUd: 0x00, setUd: 0x00 },
  { va: 0x00875f40, kind: 2, getClosure: 0x008bba20, setClosure: 0x008bb960, bytes: 0x172, insns: 131, callsites: 1, firstCallSite: 0x008676a6, nameVa: 0x00b706e4, getUd: 0x08, setUd: 0x08 },
  { va: 0x008760c0, kind: 2, getClosure: 0x008bba80, setClosure: 0x008bbb20, bytes: 0x172, insns: 131, callsites: 1, firstCallSite: 0x008676c6, nameVa: 0x00b65080, getUd: 0x10, setUd: 0x10 },
  { va: 0x00876240, kind: 1, getClosure: 0x0089e4c0, setClosure: 0x0089e450, bytes: 0x16a, insns: 133, callsites: 2, firstCallSite: 0x008676dc, nameVa: 0x00, getUd: 0x00, setUd: 0x00 },
  { va: 0x008763b0, kind: 2, getClosure: 0x008bbbc0, setClosure: 0x008bbc60, bytes: 0x172, insns: 131, callsites: 1, firstCallSite: 0x00867702, nameVa: 0x00b706b8, getUd: 0x24, setUd: 0x24 },
]);

function entityrefBuilderAt(index) {
  return Number.isInteger(index) && index >= 0 && index < LUA_ENTITYREF_BUILDERS.length
    ? LUA_ENTITYREF_BUILDERS[index]
    : null;
}

export function luaEngineEntityrefDataBuilderCount() {
  return LUA_ENTITYREF_BUILDERS.length;
}

/** @param {number} index */
export function luaEngineEntityrefDataBuilderVa(index) {
  const e = entityrefBuilderAt(index);
  return e ? e.va >>> 0 : 0;
}

/** @param {number} index */
export function luaEngineEntityrefDataBuilderKind(index) {
  const e = entityrefBuilderAt(index);
  return e ? e.kind : -1;
}

/** @param {number} index */
export function luaEngineEntityrefDataBuilderGetClosureVa(index) {
  const e = entityrefBuilderAt(index);
  return e ? e.getClosure >>> 0 : 0;
}

/** @param {number} index */
export function luaEngineEntityrefDataBuilderSetClosureVa(index) {
  const e = entityrefBuilderAt(index);
  return e ? e.setClosure >>> 0 : 0;
}

/** @param {number} index */
export function luaEngineEntityrefDataBuilderBodyBytes(index) {
  const e = entityrefBuilderAt(index);
  return e ? e.bytes >>> 0 : 0;
}

/** @param {number} index */
export function luaEngineEntityrefDataBuilderBodyInsns(index) {
  const e = entityrefBuilderAt(index);
  return e ? e.insns >>> 0 : 0;
}

/** @param {number} index */
export function luaEngineEntityrefDataBuilderCallsiteCount(index) {
  const e = entityrefBuilderAt(index);
  return e ? e.callsites : -1;
}

/** @param {number} index */
export function luaEngineEntityrefDataBuilderFirstCallSiteVa(index) {
  const e = entityrefBuilderAt(index);
  return e ? e.firstCallSite >>> 0 : 0;
}

/** Exact member VA -> band index, else -1. @param {number} va */
export function luaEngineEntityrefDataBuilderIndexForVa(va) {
  const v = va >>> 0;
  for (let i = 0; i < LUA_ENTITYREF_BUILDERS.length; i += 1) {
    if (LUA_ENTITYREF_BUILDERS[i].va === v) return i;
  }
  return -1;
}

/** Stride law: next member VA (0x170 after ARG, 0x180 after FOLDED).
 *  @param {number} index */
export function luaEngineEntityrefDataBuilderNextVa(index) {
  const e = entityrefBuilderAt(index);
  if (!e || index + 1 >= LUA_ENTITYREF_BUILDERS.length) return 0;
  const stride = e.kind === LUA_ENTITYREF_BAND_KIND_FOLDED
    ? LUA_ENTITYREF_BAND_STRIDE_AFTER_FOLDED
    : LUA_ENTITYREF_BAND_STRIDE;
  return (e.va + stride) >>> 0;
}

/** PE epilogue mov eax, esi with esi = [ebp-4] = entry ecx (stored once,
 *  never rewritten) â€” return this. @param {number} thisPtr */
export function luaEngineEntityrefDataBuilderReturnThis(thisPtr) {
  return thisPtr >>> 0;
}

/** Getter userdata source: folded members carry the immediate, ARG members
 *  read [ebp+0xc] (arg2). arg3 is never read for the getter.
 *  @param {number} index @param {number} arg2 @param {number} arg3 */
export function luaEngineEntityrefDataBuilderGetterUdValue(index, arg2, arg3) {
  const e = entityrefBuilderAt(index);
  if (!e) return 0;
  if (e.kind === LUA_ENTITYREF_BAND_KIND_FOLDED) return e.getUd >>> 0;
  return arg2 >>> 0;
}

/** Setter userdata: SHARED -> arg2, SPLIT -> arg3, FOLDED -> immediate.
 *  @param {number} index @param {number} arg2 @param {number} arg3 */
export function luaEngineEntityrefDataBuilderSetterUdValue(index, arg2, arg3) {
  const e = entityrefBuilderAt(index);
  if (!e) return 0;
  if (e.kind === LUA_ENTITYREF_BAND_KIND_SHARED_ARG) return arg2 >>> 0;
  if (e.kind === LUA_ENTITYREF_BAND_KIND_SPLIT_ARG) return arg3 >>> 0;
  return e.setUd >>> 0;
}

/** @param {number} index */
export function luaEngineEntityrefDataBuilderFoldedNameVa(index) {
  const e = entityrefBuilderAt(index);
  return e ? e.nameVa >>> 0 : 0;
}

/** @param {number} index */
export function luaEngineEntityrefDataBuilderFoldedGetUd(index) {
  const e = entityrefBuilderAt(index);
  return e ? e.getUd >>> 0 : 0;
}

/** @param {number} index */
export function luaEngineEntityrefDataBuilderFoldedSetUd(index) {
  const e = entityrefBuilderAt(index);
  return e ? e.setUd >>> 0 : 0;
}

/* ---- ABI v21 - the whole-image property-builder population --------------
 *
 * Independent transcription of the whole-.text census of the exact 28-call
 * program (195 prologue hits -> 173 members whose resolved call program
 * equals representative 0x00875510's). Rows are packed differently from the
 * C++ side on purpose: the two axes travel as a 2-bit field, and the body
 * shapes are DERIVED from the fold edit-script deltas rather than looked up,
 * so a transcription slip on either side shows up as a differential failure
 * instead of matching noise.
 *
 *   flags bit0 = folded (name and both uds are immediates)
 *   flags bit1 = shared (setter ud is arg2; otherwise arg3)
 *
 * Laws: L1 ARG bytes 80/80, L2 FOLDED bytes 93/93, L3 one edit script 93/93,
 * L4 caller args 93/93 (name==arg1, getUd==arg2, setUd==arg2|arg3),
 * L5 folded <=> exactly one call site (93/93 and 0/80), L6 pad-to-0x10 with
 * two extra-padded ARG members.
 */

export const LUA_PROPERTY_FAMILY_COUNT = 173;
export const LUA_PROPERTY_FAMILY_PROLOGUE_HITS = 195;
export const LUA_PROPERTY_FAMILY_BASE_VA = 0x00875230;
export const LUA_PROPERTY_FAMILY_LAST_VA = 0x008952b0;
export const LUA_PROPERTY_FAMILY_CALLSITE_TOTAL = 394;
export const LUA_PROPERTY_FAMILY_CALLSITE_LO_VA = 0x00866c86;
export const LUA_PROPERTY_FAMILY_CALLSITE_HI_VA = 0x0086da12;
export const LUA_PROPERTY_FAMILY_DISTINCT_NAMES = 79;

export const LUA_PROPERTY_FAMILY_ARG_MEMBERS = 80;
export const LUA_PROPERTY_FAMILY_FOLDED_MEMBERS = 93;
export const LUA_PROPERTY_FAMILY_SHARED_MEMBERS = 119;
export const LUA_PROPERTY_FAMILY_SPLIT_MEMBERS = 54;
export const LUA_PROPERTY_FAMILY_ARG_SHARED = 53;
export const LUA_PROPERTY_FAMILY_ARG_SPLIT = 27;
export const LUA_PROPERTY_FAMILY_FOLDED_SHARED = 66;
export const LUA_PROPERTY_FAMILY_FOLDED_SPLIT = 27;

export const LUA_PROPERTY_FAMILY_ARG_BODY_BYTES = 0x16a;
export const LUA_PROPERTY_FAMILY_ARG_BODY_INSNS = 133;
export const LUA_PROPERTY_FAMILY_FOLDED_BODY_BYTES = 0x172;
export const LUA_PROPERTY_FAMILY_FOLDED_BODY_INSNS = 131;
export const LUA_PROPERTY_FAMILY_FOLD_SIZE_DELTA = 8;
export const LUA_PROPERTY_FAMILY_FOLD_UD_SITE_DELTA = 1;
export const LUA_PROPERTY_FAMILY_FOLD_NAME_SITE_DELTA = 2;
export const LUA_PROPERTY_FAMILY_FOLD_UD_SITES = 2;
export const LUA_PROPERTY_FAMILY_FOLD_NAME_SITES = 3;
export const LUA_PROPERTY_FAMILY_FOLD_SCHED_SWAPS = 2;

export const LUA_PROPERTY_TEMPLATE_ARG_REP_VA = 0x00875510;
export const LUA_PROPERTY_TEMPLATE_ARG_GET_UD_DISP_OFF = 0x5e;
export const LUA_PROPERTY_TEMPLATE_ARG_GET_CLOSURE_OFF = 0x62;
export const LUA_PROPERTY_TEMPLATE_ARG_SET_UD_DISP_OFF = 0x114;
export const LUA_PROPERTY_TEMPLATE_ARG_SET_CLOSURE_OFF = 0x118;
export const LUA_PROPERTY_TEMPLATE_ARG_FIELDS = 4;
export const LUA_PROPERTY_TEMPLATE_ARG_NAME_PUSH_A_OFF = 0x88;
export const LUA_PROPERTY_TEMPLATE_ARG_NAME_PUSH_B_OFF = 0xb7;
export const LUA_PROPERTY_TEMPLATE_ARG_NAME_PUSH_C_OFF = 0x136;
export const LUA_PROPERTY_TEMPLATE_UD_DISP_ARG2 = 0x0c;
export const LUA_PROPERTY_TEMPLATE_UD_DISP_ARG3 = 0x10;

export const LUA_PROPERTY_TEMPLATE_FOLDED_REP_VA = 0x00875960;
export const LUA_PROPERTY_TEMPLATE_FOLDED_GET_CLOSURE_OFF = 0x5f;
export const LUA_PROPERTY_TEMPLATE_FOLDED_GET_UD_OFF = 0x65;
export const LUA_PROPERTY_TEMPLATE_FOLDED_NAME_A_OFF = 0x8a;
export const LUA_PROPERTY_TEMPLATE_FOLDED_NAME_B_OFF = 0xbb;
export const LUA_PROPERTY_TEMPLATE_FOLDED_SET_CLOSURE_OFF = 0x11a;
export const LUA_PROPERTY_TEMPLATE_FOLDED_SET_UD_OFF = 0x120;
export const LUA_PROPERTY_TEMPLATE_FOLDED_NAME_C_OFF = 0x13d;
export const LUA_PROPERTY_TEMPLATE_FOLDED_FIELDS = 7;
export const LUA_PROPERTY_TEMPLATE_FOLDED_VARIABLE_BYTES = 21;
export const LUA_PROPERTY_TEMPLATE_FOLDED_INVARIANT_BYTES = 349;
export const LUA_PROPERTY_TEMPLATE_FOLDED_FIELD_VARY_BYTES = 3;
export const LUA_PROPERTY_TEMPLATE_FOLDED_VALUE_LIMIT = 0x01000000;

export const LUA_PROPERTY_FAMILY_BODY_ALIGN = 0x10;
export const LUA_PROPERTY_FAMILY_ADJACENT_PAIRS = 102;
export const LUA_PROPERTY_FAMILY_ALIGN_LAW_EXACT = 100;
export const LUA_PROPERTY_FAMILY_ALIGN_EXCEPTIONS = 2;
export const LUA_PROPERTY_FAMILY_ALIGN_EXC_A_VA = 0x0087ddd0;
export const LUA_PROPERTY_FAMILY_ALIGN_EXC_B_VA = 0x0088be50;
export const LUA_PROPERTY_FAMILY_ALIGN_EXC_PAD_BYTES = 22;
export const LUA_PROPERTY_FAMILY_ALIGN_NORMAL_ARG_PAD = 6;
export const LUA_PROPERTY_FAMILY_NON_ADJACENT_PAIRS = 70;

export const LUA_PROPERTY_CENSUS_ARG_EXACT = 80;
export const LUA_PROPERTY_CENSUS_ARG_MISMATCH = 0;
export const LUA_PROPERTY_CENSUS_ARG_OUTSIDE_FIELDS = 0;
export const LUA_PROPERTY_CENSUS_FOLDED_EXACT = 93;
export const LUA_PROPERTY_CENSUS_FOLDED_MISMATCH = 0;
export const LUA_PROPERTY_CENSUS_EDIT_SCRIPT_EXACT = 93;
export const LUA_PROPERTY_CENSUS_NAME_IS_ARG1 = 93;
export const LUA_PROPERTY_CENSUS_GET_UD_IS_ARG2 = 93;
export const LUA_PROPERTY_CENSUS_SET_UD_IS_ARG2 = 66;
export const LUA_PROPERTY_CENSUS_SET_UD_IS_ARG3 = 27;
export const LUA_PROPERTY_CENSUS_CALLER_UNEXPLAINED = 0;
export const LUA_PROPERTY_FAMILY_DEAD_ARG3_SENTINEL = 1;
export const LUA_PROPERTY_FAMILY_DEAD_ARG3_SENTINEL_SITES = 65;
export const LUA_PROPERTY_CENSUS_LEGACY_ROWS = 13;
export const LUA_PROPERTY_CENSUS_LEGACY_DISAGREEMENTS = 0;

/* row = [va, flags, getClosure, setClosure, callsites, firstSite,
 *        foldedName, foldedGetUd, foldedSetUd] */
const PF_VA = 0;
const PF_FLAGS = 1;
const PF_GETC = 2;
const PF_SETC = 3;
const PF_SITES = 4;
const PF_FIRST = 5;
const PF_NAME = 6;
const PF_GETUD = 7;
const PF_SETUD = 8;

export const LUA_PROPERTY_FAMILY_ROWS = Object.freeze([
  [0x875230, 2, 0x8bb2e0, 0x8bb340, 2, 0x866c86, 0x000000, 0x000000, 0x000000],
  [0x8753a0, 2, 0x8bb420, 0x8bb480, 4, 0x866d2f, 0x000000, 0x000000, 0x000000],
  [0x875510, 0, 0x89f590, 0x89f500, 7, 0x867091, 0x000000, 0x000000, 0x000000],
  [0x875680, 0, 0x89e970, 0x89e8e0, 2, 0x86750c, 0x000000, 0x000000, 0x000000],
  [0x8757f0, 0, 0x89e870, 0x89e7e0, 2, 0x867538, 0x000000, 0x000000, 0x000000],
  [0x875960, 1, 0x89e740, 0x89e6b0, 1, 0x86754e, 0xb6508c, 0x407410, 0x4073d0],
  [0x875ae0, 0, 0x89e5a0, 0x89e530, 2, 0x86757a, 0x000000, 0x000000, 0x000000],
  [0x875c50, 3, 0x8bb900, 0x8bb960, 1, 0x867686, 0xb6d1a4, 0x000000, 0x000000],
  [0x875dd0, 2, 0x8bb9c0, 0x8bb960, 2, 0x867696, 0x000000, 0x000000, 0x000000],
  [0x875f40, 3, 0x8bba20, 0x8bb960, 1, 0x8676a6, 0xb706e4, 0x000008, 0x000008],
  [0x8760c0, 3, 0x8bba80, 0x8bbb20, 1, 0x8676c6, 0xb65080, 0x000010, 0x000010],
  [0x876240, 0, 0x89e4c0, 0x89e450, 2, 0x8676dc, 0x000000, 0x000000, 0x000000],
  [0x8763b0, 3, 0x8bbbc0, 0x8bbc60, 1, 0x867702, 0xb706b8, 0x000024, 0x000024],
  [0x876840, 3, 0x8bbdb0, 0x8bbe10, 1, 0x867827, 0xb70710, 0x000000, 0x000000],
  [0x8769c0, 2, 0x8bbe80, 0x8bbee0, 13, 0x867837, 0x000000, 0x000000, 0x000000],
  [0x876b30, 3, 0x8bbf50, 0x8bbfb0, 1, 0x8678d7, 0xb6508c, 0x00002c, 0x00002c],
  [0x876cb0, 2, 0x8bc070, 0x8bc0d0, 2, 0x8678e7, 0x000000, 0x000000, 0x000000],
  [0x876e20, 2, 0x8bc130, 0x8bc1d0, 3, 0x8678f7, 0x000000, 0x000000, 0x000000],
  [0x876f90, 2, 0x8bc270, 0x8bc2d0, 3, 0x867937, 0x000000, 0x000000, 0x000000],
  [0x8774f0, 2, 0x8bc3c0, 0x8bc420, 2, 0x867a91, 0x000000, 0x000000, 0x000000],
  [0x877b00, 2, 0x8bc480, 0x8bc4e0, 4, 0x867c48, 0x000000, 0x000000, 0x000000],
  [0x877c70, 2, 0x8bc540, 0x8bc5b0, 3, 0x867c68, 0x000000, 0x000000, 0x000000],
  [0x877de0, 3, 0x8bc6c0, 0x8bc720, 1, 0x867c98, 0xb709d4, 0x000050, 0x000050],
  [0x877f70, 3, 0x8bc790, 0x8bc4e0, 1, 0x867ca8, 0xb709e8, 0x000054, 0x000054],
  [0x8780f0, 3, 0x8bc7f0, 0x8bc4e0, 1, 0x867cb8, 0xb709b8, 0x000058, 0x000058],
  [0x878270, 3, 0x8bc7f0, 0x8bc4e0, 1, 0x867cc8, 0xb709c4, 0x00005c, 0x00005c],
  [0x8784b0, 2, 0x8bc850, 0x8bc8b0, 4, 0x867d9a, 0x000000, 0x000000, 0x000000],
  [0x878620, 3, 0x8bc910, 0x8bc980, 1, 0x867dba, 0xb1b350, 0x000008, 0x000008],
  [0x8787a0, 3, 0x8bca90, 0x8bcaf0, 1, 0x867dca, 0xb709d4, 0x000038, 0x000038],
  [0x878920, 2, 0x8bcb60, 0x8bc8b0, 2, 0x867dda, 0x000000, 0x000000, 0x000000],
  [0x878a90, 2, 0x8bcbc0, 0x8bcc50, 2, 0x867e1a, 0x000000, 0x000000, 0x000000],
  [0x878d70, 2, 0x8bccf0, 0x8bcd50, 15, 0x867ef6, 0x000000, 0x000000, 0x000000],
  [0x878ee0, 2, 0x8bcdb0, 0x8bce20, 3, 0x867f16, 0x000000, 0x000000, 0x000000],
  [0x879050, 3, 0x8bcf30, 0x8bcd50, 1, 0x867f56, 0xb70ab0, 0x000054, 0x000054],
  [0x8791d0, 2, 0x8bcf90, 0x8bd000, 6, 0x867ff9, 0x000000, 0x000000, 0x000000],
  [0x879340, 2, 0x8bd070, 0x8bd0d0, 2, 0x868009, 0x000000, 0x000000, 0x000000],
  [0x8795b0, 3, 0x8bd130, 0x8bcd50, 1, 0x868040, 0xb70ba0, 0x0000ac, 0x0000ac],
  [0x879730, 3, 0x8bd190, 0x8bd1f0, 1, 0x8680c2, 0xb70c1c, 0x0000b8, 0x0000b8],
  [0x879a30, 2, 0x8bd250, 0x8bd2b0, 2, 0x868192, 0x000000, 0x000000, 0x000000],
  [0x879ba0, 3, 0x8bd310, 0x8bd380, 1, 0x8681a2, 0xb70be0, 0x000004, 0x000004],
  [0x879d20, 2, 0x8bd490, 0x8bd4f0, 4, 0x8681c2, 0x000000, 0x000000, 0x000000],
  [0x879e90, 3, 0x8bd560, 0x8bd5f0, 1, 0x8681f2, 0xb70c68, 0x000024, 0x000024],
  [0x87b150, 2, 0x8bd690, 0x8bd6f0, 2, 0x8683f3, 0x000000, 0x000000, 0x000000],
  [0x87b2c0, 3, 0x8bd750, 0x8bd7b0, 1, 0x868413, 0xb70dd0, 0x000008, 0x000008],
  [0x87b440, 3, 0x8bd870, 0x8bd900, 1, 0x868423, 0xb70ddc, 0x000038, 0x000038],
  [0x87b5c0, 2, 0x8bd990, 0x8bd9f0, 3, 0x868433, 0x000000, 0x000000, 0x000000],
  [0x87b750, 3, 0x8bda60, 0x8bdb00, 1, 0x8684bf, 0xb67800, 0x000000, 0x000000],
  [0x87b8d0, 3, 0x8bdb90, 0x8bdbf0, 1, 0x8684cf, 0xb1d668, 0x000004, 0x000004],
  [0x87ba50, 1, 0x89e220, 0x89e1b0, 1, 0x8684e5, 0xb63968, 0x7538f0, 0x85e1d0],
  [0x87bf10, 3, 0x8bdc50, 0x8bdcf0, 1, 0x868554, 0xb67800, 0x000000, 0x000000],
  [0x87c090, 2, 0x8bdd80, 0x8bdde0, 2, 0x868564, 0x000000, 0x000000, 0x000000],
  [0x87d130, 2, 0x8bde40, 0x8bdee0, 2, 0x86880d, 0x000000, 0x000000, 0x000000],
  [0x87d2c0, 2, 0x8bdf80, 0x8bdfe0, 6, 0x868850, 0x000000, 0x000000, 0x000000],
  [0x87d430, 3, 0x8be040, 0x8be0a0, 1, 0x8688a0, 0xb70fac, 0x000018, 0x000018],
  [0x87d5d0, 3, 0x8be110, 0x8be170, 1, 0x868937, 0xb7105c, 0x00036c, 0x00036c],
  [0x87d7b0, 0, 0x89e0b0, 0x89e020, 3, 0x86895e, 0x000000, 0x000000, 0x000000],
  [0x87d920, 1, 0x89df90, 0x89def0, 1, 0x86898a, 0xb6508c, 0x871ed0, 0x871f70],
  [0x87ddd0, 0, 0x89de30, 0x89dab0, 3, 0x868a6c, 0x000000, 0x000000, 0x000000],
  [0x87df50, 0, 0x89de90, 0x89dab0, 4, 0x868a98, 0x000000, 0x000000, 0x000000],
  [0x87e290, 1, 0x89dd90, 0x89dd00, 1, 0x868b08, 0xb71074, 0x4e47a0, 0x456380],
  [0x87e410, 0, 0x89dc90, 0x89dc20, 2, 0x868b1e, 0x000000, 0x000000, 0x000000],
  [0x87e580, 0, 0x89db80, 0x89e020, 3, 0x868b34, 0x000000, 0x000000, 0x000000],
  [0x87e6f0, 1, 0x89db20, 0x89dab0, 1, 0x868b60, 0xb71140, 0x592250, 0x565dd0],
  [0x87e8d0, 0, 0x89da40, 0x89d9b0, 6, 0x868bc9, 0x000000, 0x000000, 0x000000],
  [0x87ea40, 1, 0x89d930, 0x89d8b0, 1, 0x868bf0, 0xb6d1ac, 0x871f90, 0x871fa0],
  [0x87ed10, 1, 0x89db80, 0x89d800, 1, 0x868c80, 0xb70834, 0x4aad30, 0x435d60],
  [0x87f3d0, 0, 0x89d760, 0x89d6b0, 4, 0x868ec5, 0x000000, 0x000000, 0x000000],
  [0x87fdd0, 0, 0x89c9c0, 0x89c930, 5, 0x869067, 0x000000, 0x000000, 0x000000],
  [0x87ff40, 1, 0x89c890, 0x89c7f0, 1, 0x8690bf, 0xb70ddc, 0x4177c0, 0x676150],
  [0x880340, 2, 0x8be1e0, 0x8be240, 2, 0x86915f, 0x000000, 0x000000, 0x000000],
  [0x8805a0, 2, 0x8be2b0, 0x8be310, 2, 0x869183, 0x000000, 0x000000, 0x000000],
  [0x880710, 2, 0x8be370, 0x8be410, 3, 0x869196, 0x000000, 0x000000, 0x000000],
  [0x880880, 3, 0x8be4b0, 0x8be550, 1, 0x8691cd, 0xb715a8, 0x000478, 0x000478],
  [0x880a00, 3, 0x8be5e0, 0x8be640, 1, 0x869206, 0xb71558, 0x0007e8, 0x0007e8],
  [0x881950, 1, 0x89c650, 0x89c5a0, 1, 0x869772, 0xb719c0, 0x753930, 0x7792f0],
  [0x8824d0, 1, 0x89c530, 0x89c4c0, 1, 0x869bea, 0xb71e5c, 0x6b84a0, 0x5b17a0],
  [0x882650, 1, 0x89c460, 0x89c3f0, 1, 0x869c00, 0xb71e20, 0x85e250, 0x5b17b0],
  [0x882d50, 1, 0x89c350, 0x89c2b0, 1, 0x869e36, 0xb72068, 0x5cd7d0, 0x5cd7a0],
  [0x8830a0, 1, 0x89c000, 0x89bf70, 1, 0x869e90, 0xb71124, 0x60d0a0, 0x85e2a0],
  [0x8837c0, 1, 0x89bea0, 0x89be10, 1, 0x86a0c6, 0xb7234c, 0x782a70, 0x782ab0],
  [0x883940, 2, 0x8be6b0, 0x8be710, 10, 0x86a0d9, 0x000000, 0x000000, 0x000000],
  [0x883ab0, 3, 0x8be780, 0x8be810, 1, 0x86a171, 0xb70ddc, 0x001488, 0x001488],
  [0x883c30, 2, 0x8be8a0, 0x8be900, 2, 0x86a184, 0x000000, 0x000000, 0x000000],
  [0x883da0, 3, 0x8be9c0, 0x8bea20, 1, 0x86a1aa, 0xb723cc, 0x001570, 0x001570],
  [0x883f40, 3, 0x8bea90, 0x8beb20, 1, 0x86a1d0, 0xb723b4, 0x001aec, 0x001aec],
  [0x8840c0, 3, 0x8bebc0, 0x8bec60, 1, 0x86a1e3, 0xb7247c, 0x0017c4, 0x0017c4],
  [0x884240, 2, 0x8becf0, 0x8bed50, 3, 0x86a1f6, 0x000000, 0x000000, 0x000000],
  [0x8849b0, 0, 0x89bdb0, 0x89bd40, 6, 0x86a524, 0x000000, 0x000000, 0x000000],
  [0x884c70, 0, 0x89bcd0, 0x89bc60, 2, 0x86a588, 0x000000, 0x000000, 0x000000],
  [0x884ea0, 3, 0x8bedb0, 0x8bee10, 1, 0x86a648, 0xb727e4, 0x000584, 0x000584],
  [0x8850a0, 0, 0x89bbf0, 0x89bb60, 4, 0x86a695, 0x000000, 0x000000, 0x000000],
  [0x885330, 2, 0x8bee70, 0x8beed0, 3, 0x86a72e, 0x000000, 0x000000, 0x000000],
  [0x8854a0, 2, 0x8bef40, 0x8befa0, 4, 0x86a741, 0x000000, 0x000000, 0x000000],
  [0x885610, 3, 0x8bf000, 0x8bf060, 1, 0x86a7a0, 0xb72808, 0x000464, 0x000464],
  [0x885790, 3, 0x8bf0d0, 0x8bf170, 1, 0x86a7b3, 0xb71538, 0x000468, 0x000468],
  [0x885990, 1, 0x89bac0, 0x89ba10, 1, 0x86a832, 0xb728d4, 0x4361f0, 0x62e020],
  [0x885b10, 0, 0x89b9b0, 0x89b940, 3, 0x86a848, 0x000000, 0x000000, 0x000000],
  [0x885f80, 2, 0x8bf210, 0x8bf270, 8, 0x86a9ca, 0x000000, 0x000000, 0x000000],
  [0x8860f0, 2, 0x8bf2d0, 0x8bf330, 2, 0x86aa29, 0x000000, 0x000000, 0x000000],
  [0x886260, 3, 0x8bf3a0, 0x8bf440, 1, 0x86aa3c, 0xb72a1c, 0x000d64, 0x000d64],
  [0x8863e0, 2, 0x8bf4e0, 0x8bf540, 2, 0x86aa9b, 0x000000, 0x000000, 0x000000],
  [0x886570, 0, 0x89b850, 0x89b7c0, 10, 0x86aaea, 0x000000, 0x000000, 0x000000],
  [0x886740, 0, 0x89b760, 0x89b6f0, 2, 0x86aba1, 0x000000, 0x000000, 0x000000],
  [0x886910, 0, 0x89b690, 0x89b620, 2, 0x86abc8, 0x000000, 0x000000, 0x000000],
  [0x886b60, 1, 0x89b5b0, 0x89b540, 1, 0x86accf, 0xb7136c, 0x8c5d0b, 0x436220],
  [0x886ff0, 1, 0x89b310, 0x89b280, 1, 0x86ad7e, 0xb706a4, 0x4567a0, 0x6d6610],
  [0x887660, 1, 0x89b140, 0x89b090, 1, 0x86ae71, 0xb70704, 0x4e4850, 0x6d0c20],
  [0x8877e0, 2, 0x8bf5b0, 0x8bf610, 6, 0x86ae84, 0x000000, 0x000000, 0x000000],
  [0x887950, 3, 0x8bf670, 0x8bf700, 1, 0x86ae97, 0xb72c90, 0x000414, 0x000414],
  [0x887ad0, 3, 0x8bf920, 0x8bf610, 1, 0x86aeaa, 0xb727e4, 0x000b64, 0x000b64],
  [0x887c50, 2, 0x8bf980, 0x8bfa20, 2, 0x86aee3, 0x000000, 0x000000, 0x000000],
  [0x887de0, 1, 0x89aff0, 0x89af50, 1, 0x86af6b, 0xb72d18, 0x5cd560, 0x6a6910],
  [0x887f70, 1, 0x89aee0, 0x89ae70, 1, 0x86af81, 0xb72cf4, 0x4316a0, 0x60cdb0],
  [0x8880f0, 0, 0x89ae00, 0x89ad70, 2, 0x86af97, 0x000000, 0x000000, 0x000000],
  [0x888340, 1, 0x89abf0, 0x89ab50, 1, 0x86b008, 0xb70ddc, 0x4177c0, 0x456830],
  [0x8884c0, 0, 0x89aae0, 0x89aa50, 2, 0x86b01e, 0x000000, 0x000000, 0x000000],
  [0x888a70, 2, 0x8bfac0, 0x8bfb60, 2, 0x86b135, 0x000000, 0x000000, 0x000000],
  [0x888be0, 2, 0x8bfc00, 0x8bfc60, 10, 0x86b148, 0x000000, 0x000000, 0x000000],
  [0x888d50, 3, 0x8bfcd0, 0x8bfd60, 1, 0x86b181, 0xb70ddc, 0x000428, 0x000428],
  [0x888ed0, 3, 0x8bfdf0, 0x8bfe50, 1, 0x86b194, 0xb7276c, 0x000458, 0x000458],
  [0x889050, 2, 0x8bfeb0, 0x8bff10, 6, 0x86b1a7, 0x000000, 0x000000, 0x000000],
  [0x8891c0, 3, 0x8bff80, 0x8c0010, 1, 0x86b1ba, 0xb72e70, 0x00045d, 0x00045d],
  [0x889340, 3, 0x8c00b0, 0x8c0140, 1, 0x86b1f3, 0xb72e58, 0x000464, 0x000464],
  [0x8894c0, 3, 0x8c0230, 0x8bfe50, 1, 0x86b23f, 0xb72ef0, 0x0004c4, 0x0004c4],
  [0x889640, 3, 0x8c0290, 0x8c0320, 1, 0x86b28b, 0xb72ec0, 0x0004d4, 0x0004d4],
  [0x8897c0, 3, 0x8c03c0, 0x8c0460, 1, 0x86b2c4, 0xb72eb4, 0x0004e8, 0x0004e8],
  [0x889960, 1, 0x89a810, 0x89a770, 1, 0x86b339, 0xb70ddc, 0x85de90, 0x5cd5c0],
  [0x889ae0, 0, 0x89a700, 0x89a670, 2, 0x86b34f, 0x000000, 0x000000, 0x000000],
  [0x889f70, 2, 0x8c04f0, 0x8c0550, 6, 0x86b3ef, 0x000000, 0x000000, 0x000000],
  [0x88a100, 2, 0x8c05c0, 0x8c0620, 4, 0x86b575, 0x000000, 0x000000, 0x000000],
  [0x88a270, 2, 0x8c0680, 0x8c0620, 3, 0x86b585, 0x000000, 0x000000, 0x000000],
  [0x88a3e0, 3, 0x8c06e0, 0x8c0740, 1, 0x86b5d5, 0xb72ff4, 0x000018, 0x000018],
  [0x88a740, 1, 0x89a570, 0x89a4a0, 1, 0x86b68d, 0xb727e4, 0x4176f0, 0x665b70],
  [0x88ac20, 1, 0x89a510, 0x89a4a0, 1, 0x86b76f, 0xb71054, 0x67efc0, 0x718ed0],
  [0x88ada0, 3, 0x8c07b0, 0x8c0850, 1, 0x86b77f, 0xb730d4, 0x000004, 0x000004],
  [0x88af40, 3, 0x8c08f0, 0x8c0950, 1, 0x86b78f, 0xb730dc, 0x00003c, 0x00003c],
  [0x88b600, 0, 0x899b70, 0x899b00, 3, 0x86b83e, 0x000000, 0x000000, 0x000000],
  [0x88bb60, 2, 0x8c09b0, 0x8c0a10, 4, 0x86b98d, 0x000000, 0x000000, 0x000000],
  [0x88bcd0, 3, 0x8c0a70, 0x8c0b00, 1, 0x86b9c6, 0xb732cc, 0x00027c, 0x00027c],
  [0x88be50, 2, 0x8c0c10, 0x8c0c70, 2, 0x86b9d9, 0x000000, 0x000000, 0x000000],
  [0x88bfd0, 3, 0x8c0ce0, 0x8c0d70, 1, 0x86ba12, 0xb732bc, 0x000398, 0x000398],
  [0x88c150, 3, 0x8c0e10, 0x8c0ea0, 1, 0x86ba25, 0xb73294, 0x00039c, 0x00039c],
  [0x88c2d0, 2, 0x8c0f40, 0x8c0fb0, 4, 0x86ba38, 0x000000, 0x000000, 0x000000],
  [0x88c4c0, 3, 0x8c10c0, 0x8c1120, 1, 0x86bacc, 0xb73304, 0x000154, 0x000154],
  [0x88c640, 3, 0x8c1180, 0x8c11f0, 1, 0x86badf, 0xb73310, 0x000158, 0x000158],
  [0x88c7c0, 3, 0x8c1300, 0x8c1360, 1, 0x86baf2, 0xb732e8, 0x000170, 0x000170],
  [0x88ca80, 3, 0x8c13d0, 0x8c1430, 1, 0x86bb61, 0xb733b4, 0x000154, 0x000154],
  [0x88ce40, 2, 0x8c14a0, 0x8c1510, 2, 0x86bbde, 0x000000, 0x000000, 0x000000],
  [0x88cfb0, 3, 0x8c1620, 0x8c1680, 1, 0x86bc04, 0xb73420, 0x000190, 0x000190],
  [0x88d150, 3, 0x8c16e0, 0x8c1740, 1, 0x86bc3a, 0xb73420, 0x000154, 0x000154],
  [0x88d350, 3, 0x8c17a0, 0x8c1830, 1, 0x86bc84, 0xb733e0, 0x000154, 0x000154],
  [0x88d4d0, 3, 0x8c1940, 0x8c19c0, 1, 0x86bc97, 0xb7349c, 0x000268, 0x000268],
  [0x88d650, 3, 0x8c1a50, 0x8c1ae0, 1, 0x86bcaa, 0xb734b0, 0x00026c, 0x00026c],
  [0x88d7f0, 3, 0x8c1b70, 0x8c1bd0, 1, 0x86bce6, 0xb7276c, 0x000154, 0x000154],
  [0x88df10, 3, 0x8c1c30, 0x8c1c90, 1, 0x86be03, 0xb6d1a4, 0x000000, 0x000000],
  [0x88e090, 2, 0x8c1cf0, 0x8c1d50, 2, 0x86be13, 0x000000, 0x000000, 0x000000],
  [0x88e200, 3, 0x8c1db0, 0x8c1e10, 1, 0x86be33, 0xb6a14c, 0x000008, 0x000008],
  [0x88e450, 2, 0x8c1e80, 0x8c1ee0, 2, 0x86be7d, 0x000000, 0x000000, 0x000000],
  [0x88e6c0, 3, 0x8c1f40, 0x8c1fa0, 1, 0x86beae, 0xb73508, 0x000008, 0x000008],
  [0x88e840, 3, 0x8c2000, 0x8c2060, 1, 0x86bebe, 0xb73514, 0x00000c, 0x00000c],
  [0x88f2c0, 2, 0x8c23b0, 0x8c2410, 5, 0x86c08c, 0x000000, 0x000000, 0x000000],
  [0x88f430, 2, 0x8c2470, 0x8c2510, 2, 0x86c0bc, 0x000000, 0x000000, 0x000000],
  [0x88f5a0, 3, 0x8c25a0, 0x8c2630, 1, 0x86c0dc, 0xb73638, 0x000018, 0x000018],
  [0x88f720, 2, 0x8c26d0, 0x8c2410, 6, 0x86c0ec, 0x000000, 0x000000, 0x000000],
  [0x88f890, 0, 0x8998c0, 0x899850, 7, 0x86c122, 0x000000, 0x000000, 0x000000],
  [0x88fa00, 3, 0x8c2730, 0x8c2790, 1, 0x86c132, 0xb735d4, 0x00004a, 0x00004a],
  [0x88fb80, 2, 0x8c27f0, 0x8c2790, 3, 0x86c1c6, 0x000000, 0x000000, 0x000000],
  [0x8920c0, 0, 0x899710, 0x8994f0, 3, 0x86cc6c, 0x000000, 0x000000, 0x000000],
  [0x8922e0, 1, 0x899670, 0x8995c0, 1, 0x86cca9, 0xb7409c, 0x85e140, 0x57be60],
  [0x8927f0, 1, 0x899560, 0x8994f0, 1, 0x86ce8f, 0xb74330, 0x70c5b0, 0x753800],
  [0x894950, 0, 0x899140, 0x8990d0, 3, 0x86d69e, 0x000000, 0x000000, 0x000000],
  [0x894c80, 1, 0x899030, 0x898f80, 1, 0x86d8a6, 0xb74a30, 0x407490, 0x7e92e0],
  [0x8952b0, 3, 0x8c2850, 0x8c28b0, 1, 0x86da12, 0xb74c10, 0x0264fc, 0x0264fc],
].map(Object.freeze));

/** @param {number} index */
function propertyFamilyAt(index) {
  return Number.isInteger(index) && index >= 0 && index < LUA_PROPERTY_FAMILY_ROWS.length
    ? LUA_PROPERTY_FAMILY_ROWS[index]
    : null;
}

export function luaEnginePropertyFamilyCount() {
  return LUA_PROPERTY_FAMILY_ROWS.length;
}

/** @param {number} index */
export function luaEnginePropertyFamilyVa(index) {
  const r = propertyFamilyAt(index);
  return r ? r[PF_VA] >>> 0 : 0;
}

/** @param {number} index */
export function luaEnginePropertyFamilyIsFolded(index) {
  const r = propertyFamilyAt(index);
  return r ? (r[PF_FLAGS] & 1) : -1;
}

/** @param {number} index */
export function luaEnginePropertyFamilyIsShared(index) {
  const r = propertyFamilyAt(index);
  return r ? ((r[PF_FLAGS] >> 1) & 1) : -1;
}

/** Lossy v19 projection - FOLDED swallows the shared axis.
 *  @param {number} index */
export function luaEnginePropertyFamilyKind(index) {
  const r = propertyFamilyAt(index);
  if (!r) return -1;
  if ((r[PF_FLAGS] & 1) === 1) return LUA_PROPERTY_BUILDER_KIND_FOLDED;
  return ((r[PF_FLAGS] >> 1) & 1) === 1
    ? LUA_PROPERTY_BUILDER_KIND_SHARED_ARG
    : LUA_PROPERTY_BUILDER_KIND_SPLIT_ARG;
}

/** @param {number} index */
export function luaEnginePropertyFamilyGetClosureVa(index) {
  const r = propertyFamilyAt(index);
  return r ? r[PF_GETC] >>> 0 : 0;
}

/** @param {number} index */
export function luaEnginePropertyFamilySetClosureVa(index) {
  const r = propertyFamilyAt(index);
  return r ? r[PF_SETC] >>> 0 : 0;
}

/** Derived from the L3 edit script, not looked up: folding each of the 2 ud
 *  sites costs +1 byte and each of the 3 name pushes +2.
 *  @param {number} index */
export function luaEnginePropertyFamilyBodyBytes(index) {
  const r = propertyFamilyAt(index);
  if (!r) return 0;
  const delta = (r[PF_FLAGS] & 1) === 1
    ? LUA_PROPERTY_FAMILY_FOLD_UD_SITES * LUA_PROPERTY_FAMILY_FOLD_UD_SITE_DELTA +
      LUA_PROPERTY_FAMILY_FOLD_NAME_SITES * LUA_PROPERTY_FAMILY_FOLD_NAME_SITE_DELTA
    : 0;
  return (LUA_PROPERTY_FAMILY_ARG_BODY_BYTES + delta) >>> 0;
}

/** Each folded ud site collapses `mov ecx,[ebp+d]` + `mov [eax],ecx` (2
 *  instructions) into one `mov [eax],imm32`; the name pushes stay one
 *  instruction each. @param {number} index */
export function luaEnginePropertyFamilyBodyInsns(index) {
  const r = propertyFamilyAt(index);
  if (!r) return 0;
  const drop = (r[PF_FLAGS] & 1) === 1 ? LUA_PROPERTY_FAMILY_FOLD_UD_SITES : 0;
  return (LUA_PROPERTY_FAMILY_ARG_BODY_INSNS - drop) >>> 0;
}

/** L6 padding law only - NOT the successor. @param {number} index */
export function luaEnginePropertyFamilyBodyEndVa(index) {
  const r = propertyFamilyAt(index);
  if (!r) return 0;
  const end = (r[PF_VA] + luaEnginePropertyFamilyBodyBytes(index)) >>> 0;
  const a = LUA_PROPERTY_FAMILY_BODY_ALIGN;
  return (Math.ceil(end / a) * a) >>> 0;
}

/** Censused successor. A per-kind stride would be wrong at the two
 *  extra-padded ARG members and at all 70 non-adjacent pairs.
 *  @param {number} index */
export function luaEnginePropertyFamilyNextVa(index) {
  const r = propertyFamilyAt(index);
  if (!r || index + 1 >= LUA_PROPERTY_FAMILY_ROWS.length) return 0;
  return LUA_PROPERTY_FAMILY_ROWS[index + 1][PF_VA] >>> 0;
}

/** @param {number} index */
export function luaEnginePropertyFamilyIsAdjacent(index) {
  const next = luaEnginePropertyFamilyNextVa(index);
  if (next === 0) return 0;
  return next === luaEnginePropertyFamilyBodyEndVa(index) ? 1 : 0;
}

/** @param {number} index */
export function luaEnginePropertyFamilyCallsiteCount(index) {
  const r = propertyFamilyAt(index);
  return r ? r[PF_SITES] : -1;
}

/** @param {number} index */
export function luaEnginePropertyFamilyFirstCallsiteVa(index) {
  const r = propertyFamilyAt(index);
  return r ? r[PF_FIRST] >>> 0 : 0;
}

/** @param {number} va */
export function luaEnginePropertyFamilyIndexForVa(va) {
  const v = va >>> 0;
  for (let i = 0; i < LUA_PROPERTY_FAMILY_ROWS.length; i += 1) {
    if (LUA_PROPERTY_FAMILY_ROWS[i][PF_VA] === v) return i;
  }
  return -1;
}

/** @param {number} index */
export function luaEnginePropertyFamilyFoldedNameVa(index) {
  const r = propertyFamilyAt(index);
  return r ? r[PF_NAME] >>> 0 : 0;
}

/** @param {number} index */
export function luaEnginePropertyFamilyFoldedGetUd(index) {
  const r = propertyFamilyAt(index);
  return r ? r[PF_GETUD] >>> 0 : 0;
}

/** @param {number} index */
export function luaEnginePropertyFamilyFoldedSetUd(index) {
  const r = propertyFamilyAt(index);
  return r ? r[PF_SETUD] >>> 0 : 0;
}

/** FOLDED bodies push the name immediate 3x and never read [ebp+8].
 *  @param {number} index @param {number} arg1 */
export function luaEnginePropertyFamilyNameValue(index, arg1) {
  const r = propertyFamilyAt(index);
  if (!r) return 0;
  return (r[PF_FLAGS] & 1) === 1 ? r[PF_NAME] >>> 0 : arg1 >>> 0;
}

/** Getter ud is arg2 in every ARG member (disp 0x0c); arg3 is never a
 *  getter source.
 *  @param {number} index @param {number} arg2 @param {number} arg3 */
export function luaEnginePropertyFamilyGetterUdValue(index, arg2, arg3) {
  const r = propertyFamilyAt(index);
  void arg3;
  if (!r) return 0;
  return (r[PF_FLAGS] & 1) === 1 ? r[PF_GETUD] >>> 0 : arg2 >>> 0;
}

/** Setter ud: folded immediate, else arg2 (SHARED, arg3 dead) or arg3
 *  (SPLIT). @param {number} index @param {number} arg2 @param {number} arg3 */
export function luaEnginePropertyFamilySetterUdValue(index, arg2, arg3) {
  const r = propertyFamilyAt(index);
  if (!r) return 0;
  if ((r[PF_FLAGS] & 1) === 1) return r[PF_SETUD] >>> 0;
  return ((r[PF_FLAGS] >> 1) & 1) === 1 ? arg2 >>> 0 : arg3 >>> 0;
}

/** Epilogue mov eax, esi with esi = [ebp-4] = entry ecx.
 *  @param {number} thisPtr */
export function luaEnginePropertyFamilyReturnThis(thisPtr) {
  return thisPtr >>> 0;
}

/** L5: LTCG folds exactly when there is one caller. @param {number} n */
export function luaEnginePropertyFamilyFoldedFromCallsites(n) {
  return n === 1 ? 1 : 0;
}

/* ------------------------------------------------------------------------
 * ABI v22 - the get/set CLOSURE population behind the 173-member property
 * builder family (v21).
 *
 * Evidence: tools/isaac-ng.unpacked.exe, SHA-256 5129DF72...017200, every
 * VA resolved through the PE SECTION TABLE (.text va 0x00401000 raw 0x400;
 * .rdata va 0x00b18000 raw 0x716600; .data va 0x00bf8000 raw 0x7f6000 with
 * raw size 0x69e00). The class-registry keys live at 0x00c8297a..0x00c82a58,
 * inside .data's VIRTUAL range but PAST its raw end: zero at load and not
 * file backed. A .text-only formula resolves 0x00c8297a to file offset
 * 0x00881d7a, which lands inside raw .reloc and returns plausible garbage
 * instead of failing - so the key is recorded as an ADDRESS and is never
 * dereferenced by the model.
 *
 * The 173 members each install a getter and a setter closure. The 346
 * references land on 326 distinct bodies in two bands:
 *   band A 0x00898f80..0x0089f590  102 bodies
 *   band B 0x008bb2e0..0x008c28b0  224 bodies
 * Every one of the 326 decodes cleanly (stop at the first int3).
 *
 * TEMPLATE MODEL (C1). Each body is normalised by zeroing every ENCODED
 * OPERAND FIELD (immediate + memory displacement, byte offset and width taken
 * from the instruction encoding) and by resolving every rel32 branch to its
 * ABSOLUTE target. Bodies with an identical normalised image AND an identical
 * field layout form a cluster: 62 clusters over 326 bodies. Inside a cluster
 * each field is INVARIANT, DERIVED (target == base + const, i.e. an intra-body
 * branch) or FREE. Re-encoding template image + field values reproduces all
 * 326 bodies BYTE-EXACTLY (326 exact / 0 mismatch). Only 1677 of the 39146
 * body bytes ever vary (4.28%); no cluster has more than 5 FREE fields and 20
 * clusters have none at all.
 *
 * PER-BODY LAWS, censused over all 326 (counts pinned below):
 *   C2  exactly one push of lua_upvalueindex(1) = 0xfff0b9d7 and exactly one
 *       lua_touserdata call - 326/326. The FIELD OFFSET is not in the closure:
 *       it is the dword the builder stored in the 4-byte upvalue userdata, so
 *       the body is generic per (class, type) and the member supplies the
 *       offset. That is why 173 members need only 52 distinct classes.
 *   C3  every body calls the class-check helper 0x0085c590 at least once
 *       (326/326); 280 call it once, 46 twice (45 of those with two distinct
 *       keys - the setter also checks the assigned value's class).
 *   C4  the class key pushed by a member's getter and by its setter agree -
 *       173/173, 0 disagreements. This is the tie-back between the closure
 *       population and the v21 member population.
 *   C5  const gate: getters push flag 1 (171/171), setters push flag 0
 *       (155/155). 0x0085c590 tests that argument as a BYTE
 *       (cmp byte ptr [ebp+0xc], 0) and raises luaL_argerror with the .rdata
 *       string 0x00b6e9b4 "cannot be const" only when the byte is zero.
 *   C6  return law: getters mov eax,1 (171/171); setters xor eax,eax
 *       (154/155). ONE recorded exception: 0x008bbc60, the setter of member
 *       12 (0x008763b0), returns 1. Reproduced, not corrected.
 *   C7  type gate: all 371 lua_type call sites inside the 326 bodies are
 *       followed by a FULL-WORD `test eax, eax`, never a low-byte test
 *       (371 full-word / 0 byte). The opposite of the uint8_t defect class:
 *       a wide lua_type result DOES take the branch here.
 *   C8  roles are disjoint: 171 bodies are only ever a getter, 155 only ever
 *       a setter, 0 are both. 15 bodies are shared by more than one member
 *       slot (max 4 references).
 *
 * ORPHANS. Walking each band body-by-body finds 100 further bodies that no
 * member's get/set closure VA points at (86 in band A, 14 in band B). 21 of
 * those carry the property-closure shape (lua_upvalueindex(1) + the class
 * check), so the v21 member census does NOT reach every property accessor in
 * the image; the other 79 are other registered Lua C functions. Recorded as
 * counts - they are outside this model, not inside it.
 *
 * ADDRESS-STABLE HOST. No call target here is translated to behaviour: the 15
 * Lua5.3.3r.dll IAT slots (plus one CRT slot) and the 25 direct call targets
 * stay host. The five integer/float push wrappers ARE characterised, because
 * their whole difference is x86 extension semantics:
 *   0x0085bfd0  mov eax,edx ; cdq        -> sign-extend int32  (35 uses)
 *   0x0085bff0  push 0 ; push edx        -> zero-extend uint32 (11 uses)
 *   0x0085c010  movzx eax,dx ; cdq       -> zero-extend uint16 (2 uses)
 *   0x0085c030  push [ebp+0xc]/[ebp+8]   -> caller 64-bit pair (4 uses)
 *   0x0085c050  cvtss2sd xmm1            -> float32 -> double  (25 uses)
 * ------------------------------------------------------------------------ */

export const LUA_PROPERTY_CLOSURE_TOTAL = 326;
export const LUA_PROPERTY_CLOSURE_BAND_A_LO = 0x00898f80;
export const LUA_PROPERTY_CLOSURE_BAND_A_HI = 0x0089f590;
export const LUA_PROPERTY_CLOSURE_BAND_A_COUNT = 102;
export const LUA_PROPERTY_CLOSURE_BAND_B_LO = 0x008bb2e0;
export const LUA_PROPERTY_CLOSURE_BAND_B_HI = 0x008c28b0;
export const LUA_PROPERTY_CLOSURE_BAND_B_COUNT = 224;

export const LUA_PROPERTY_CLOSURE_CLUSTER_COUNT = 62;
export const LUA_PROPERTY_CLOSURE_CENSUS_EXACT = 326;
export const LUA_PROPERTY_CLOSURE_CENSUS_MISMATCH = 0;
export const LUA_PROPERTY_CLOSURE_BODY_BYTES_TOTAL = 39146;
export const LUA_PROPERTY_CLOSURE_BODY_INSNS_TOTAL = 14480;
export const LUA_PROPERTY_CLOSURE_VARIABLE_BYTES = 1677;
export const LUA_PROPERTY_CLOSURE_CLUSTERS_0_FREE = 20;
export const LUA_PROPERTY_CLOSURE_CLUSTERS_1_FREE = 31;
export const LUA_PROPERTY_CLOSURE_CLUSTERS_2_FREE = 7;
export const LUA_PROPERTY_CLOSURE_CLUSTERS_3_FREE = 3;
export const LUA_PROPERTY_CLOSURE_CLUSTERS_5_FREE = 1;
export const LUA_PROPERTY_CLOSURE_MAX_FREE_FIELDS = 5;
export const LUA_PROPERTY_CLOSURE_CLUSTER_MAX_MEMBERS = 34;
export const LUA_PROPERTY_CLOSURE_CLUSTER_SINGLETONS = 20;

export const LUA_PROPERTY_CLOSURE_GET_ONLY = 171;
export const LUA_PROPERTY_CLOSURE_SET_ONLY = 155;
export const LUA_PROPERTY_CLOSURE_DUAL_ROLE = 0;
export const LUA_PROPERTY_CLOSURE_REFERENCE_TOTAL = 346;
export const LUA_PROPERTY_CLOSURE_SHARED_BODIES = 15;
export const LUA_PROPERTY_CLOSURE_MAX_REFS = 4;

export const LUA_PROPERTY_CLOSURE_CLASS_KEY_COUNT = 52;
/* 41 distinct RECEIVER keys (the first check) + 20 distinct value-class
 * keys (the second check of the 46 double-check bodies); 11 of the value
 * keys never appear as a receiver, so the union is 52. */
export const LUA_PROPERTY_CLOSURE_PRIMARY_KEY_COUNT = 41;
export const LUA_PROPERTY_CLOSURE_SECONDARY_KEY_COUNT = 20;
export const LUA_PROPERTY_CLOSURE_SECONDARY_ONLY_KEYS = 11;
export const LUA_PROPERTY_CLOSURE_CLASS_KEY_LO = 0x00c8297a;
export const LUA_PROPERTY_CLOSURE_CLASS_KEY_HI = 0x00c82a58;
export const LUA_PROPERTY_CLOSURE_CLASS_KEY_FILE_BACKED = 0;
export const LUA_PROPERTY_CLOSURE_CLASS_KEY_NAIVE_TEXT_OFF = 0x00881d7a;
export const LUA_PROPERTY_CLOSURE_MEMBER_KEY_AGREE = 173;
export const LUA_PROPERTY_CLOSURE_MEMBER_KEY_DISAGREE = 0;
export const LUA_PROPERTY_CLOSURE_SINGLE_CHECK = 280;
export const LUA_PROPERTY_CLOSURE_DOUBLE_CHECK = 46;
export const LUA_PROPERTY_CLOSURE_DOUBLE_CHECK_DISTINCT = 45;

export const LUA_PROPERTY_CLOSURE_UPVALUE_INDEX_U32 = 0xfff0b9d7;
export const LUA_PROPERTY_CLOSURE_REGISTRY_INDEX_U32 = 0xfff0b9d8;
export const LUA_PROPERTY_CLOSURE_LUAI_MAXSTACK = 1000000;
export const LUA_PROPERTY_CLOSURE_UPVALUE_PUSH_EXACT = 326;
export const LUA_PROPERTY_CLOSURE_TOUSERDATA_EXACT = 326;
export const LUA_PROPERTY_CLOSURE_CLASS_CHECK_EXACT = 326;
export const LUA_PROPERTY_CLOSURE_ENDS_WITH_RET = 326;

export const LUA_PROPERTY_CLOSURE_GET_CONST_FLAG = 1;
export const LUA_PROPERTY_CLOSURE_SET_CONST_FLAG = 0;
export const LUA_PROPERTY_CLOSURE_GET_FLAG_SITES = 171;
export const LUA_PROPERTY_CLOSURE_SET_FLAG_SITES = 155;
export const LUA_PROPERTY_CLOSURE_GET_RETURN = 1;
export const LUA_PROPERTY_CLOSURE_SET_RETURN = 0;
export const LUA_PROPERTY_CLOSURE_GET_RETURN_EXACT = 171;
export const LUA_PROPERTY_CLOSURE_SET_RETURN_EXACT = 154;
export const LUA_PROPERTY_CLOSURE_RETURN_EXCEPTIONS = 1;
export const LUA_PROPERTY_CLOSURE_RETURN_EXCEPTION_VA = 0x008bbc60;
export const LUA_PROPERTY_CLOSURE_RETURN_EXCEPTION_MEMBER = 12;

export const LUA_PROPERTY_CLOSURE_LUA_TYPE_CALLS = 371;
export const LUA_PROPERTY_CLOSURE_LUA_TYPE_FULLWORD_TESTS = 371;
export const LUA_PROPERTY_CLOSURE_LUA_TYPE_BYTE_TESTS = 0;

export const LUA_PROPERTY_CLOSURE_CLASS_CHECK_VA = 0x0085c590;
export const LUA_PROPERTY_CLOSURE_CONST_MSG_VA = 0x00b6e9b4;
export const LUA_PROPERTY_CLOSURE_CONST_FIELD_VA = 0x00b6e9c4;
export const LUA_PROPERTY_CLOSURE_PUSH_I32_SEXT_VA = 0x0085bfd0;
export const LUA_PROPERTY_CLOSURE_PUSH_U32_ZEXT_VA = 0x0085bff0;
export const LUA_PROPERTY_CLOSURE_PUSH_U16_ZEXT_VA = 0x0085c010;
export const LUA_PROPERTY_CLOSURE_PUSH_I64_PAIR_VA = 0x0085c030;
export const LUA_PROPERTY_CLOSURE_PUSH_F32_CVT_VA = 0x0085c050;
export const LUA_PROPERTY_CLOSURE_PUSH_I32_SEXT_USES = 35;
export const LUA_PROPERTY_CLOSURE_PUSH_U32_ZEXT_USES = 11;
export const LUA_PROPERTY_CLOSURE_PUSH_U16_ZEXT_USES = 2;
export const LUA_PROPERTY_CLOSURE_PUSH_I64_PAIR_USES = 4;
export const LUA_PROPERTY_CLOSURE_PUSH_F32_CVT_USES = 25;
export const LUA_PROPERTY_CLOSURE_PUSH_HELPER_BODIES = 77;

export const LUA_PROPERTY_CLOSURE_IAT_SLOT_COUNT = 16;
export const LUA_PROPERTY_CLOSURE_IAT_LUA_SLOTS = 15;
export const LUA_PROPERTY_CLOSURE_IAT_CALL_TOTAL = 1014;
export const LUA_PROPERTY_CLOSURE_DIRECT_CALL_TARGETS = 25;
export const LUA_PROPERTY_CLOSURE_IAT_LUA_TYPE = 0x00b18400;
export const LUA_PROPERTY_CLOSURE_IAT_LUA_TOUSERDATA = 0x00b183b0;
export const LUA_PROPERTY_CLOSURE_IAT_LUAL_CHECKINTEGER = 0x00b183f4;
export const LUA_PROPERTY_CLOSURE_IAT_LUAL_CHECKNUMBER = 0x00b18324;
export const LUA_PROPERTY_CLOSURE_IAT_LUA_TOBOOLEAN = 0x00b183e8;
export const LUA_PROPERTY_CLOSURE_IAT_LUA_PUSHBOOLEAN = 0x00b183ec;
export const LUA_PROPERTY_CLOSURE_IAT_LUA_PUSHINTEGER = 0x00b183f8;
export const LUA_PROPERTY_CLOSURE_IAT_LUA_PUSHNUMBER = 0x00b183f0;
export const LUA_PROPERTY_CLOSURE_IAT_LUA_RAWGETP = 0x00b183bc;

export const LUA_PROPERTY_CLOSURE_STORE_BYTE = 17;
export const LUA_PROPERTY_CLOSURE_STORE_WORD = 4;
export const LUA_PROPERTY_CLOSURE_STORE_DWORD = 44;
export const LUA_PROPERTY_CLOSURE_STORE_MOVSS = 22;
export const LUA_PROPERTY_CLOSURE_STORE_INDIRECT = 68;

export const LUA_PROPERTY_CLOSURE_BAND_UNMODELLED = 100;
export const LUA_PROPERTY_CLOSURE_BAND_A_UNMODELLED = 86;
export const LUA_PROPERTY_CLOSURE_BAND_B_UNMODELLED = 14;
export const LUA_PROPERTY_CLOSURE_ORPHAN_PROPERTY_SHAPED = 21;
export const LUA_PROPERTY_CLOSURE_ORPHAN_A_PROPERTY_SHAPED = 14;
export const LUA_PROPERTY_CLOSURE_ORPHAN_B_PROPERTY_SHAPED = 7;

export const LUA_PROPERTY_CLOSURE_ROLE_GET = 0;
export const LUA_PROPERTY_CLOSURE_ROLE_SET = 1;
export const LUA_PROPERTY_CLOSURE_BAND_A = 0;
export const LUA_PROPERTY_CLOSURE_BAND_B = 1;
export const LUA_PROPERTY_CLOSURE_PUSH_NONE = 0;
export const LUA_PROPERTY_CLOSURE_PUSH_I32_SEXT = 1;
export const LUA_PROPERTY_CLOSURE_PUSH_U32_ZEXT = 2;
export const LUA_PROPERTY_CLOSURE_PUSH_U16_ZEXT = 3;
export const LUA_PROPERTY_CLOSURE_PUSH_I64_PAIR = 4;
export const LUA_PROPERTY_CLOSURE_PUSH_F32_CVT = 5;
export const LUA_PROPERTY_CLOSURE_STORE_KIND_BYTE = 0;
export const LUA_PROPERTY_CLOSURE_STORE_KIND_WORD = 1;
export const LUA_PROPERTY_CLOSURE_STORE_KIND_DWORD = 2;
export const LUA_PROPERTY_CLOSURE_STORE_KIND_MOVSS = 3;
export const LUA_PROPERTY_CLOSURE_STORE_KIND_INDIRECT = 4;

/* cluster row = [repVa, bodies, bodyBytes, bodyInsns, band, operandFields,
 *                freeFields] - ordered by descending population. */
const PC_REP = 0;
const PC_N = 1;
const PC_BYTES = 2;
const PC_INSNS = 3;
const PC_BAND = 4;
const PC_FIELDS = 5;
const PC_FREE = 6;

export const LUA_PROPERTY_CLOSURE_CLUSTERS = Object.freeze([
  [0x8bb900, 34, 0x59, 33, 1, 17, 2],
  [0x8bb960, 27, 0x5c, 37, 1, 17, 1],
  [0x8bb2e0, 14, 0x5b, 33, 1, 17, 1],
  [0x8bb340, 14, 0x69, 41, 1, 19, 1],
  [0x8bbdb0, 14, 0x5f, 36, 1, 17, 1],
  [0x8bbe10, 14, 0x61, 39, 1, 17, 1],
  [0x899140, 12, 0x5c, 35, 0, 17, 2],
  [0x89a670, 11, 0x82, 45, 0, 26, 1],
  [0x89a700, 11, 0x69, 39, 0, 21, 1],
  [0x899030, 10, 0x9b, 56, 0, 30, 2],
  [0x8990d0, 9, 0x6c, 41, 0, 22, 1],
  [0x899850, 9, 0x69, 43, 0, 19, 1],
  [0x8998c0, 9, 0x65, 39, 0, 18, 1],
  [0x8bba80, 8, 0x91, 52, 1, 29, 1],
  [0x8bbb20, 8, 0x93, 52, 1, 29, 1],
  [0x8bc540, 7, 0x68, 40, 1, 22, 1],
  [0x8bc5b0, 7, 0x101, 92, 1, 54, 1],
  [0x8bbbc0, 6, 0x98, 54, 1, 30, 2],
  [0x8bd560, 6, 0x8b, 50, 1, 27, 3],
  [0x8bd5f0, 6, 0x92, 58, 1, 27, 2],
  [0x8bdb00, 5, 0x90, 57, 1, 27, 3],
  [0x898f80, 4, 0xad, 56, 0, 37, 1],
  [0x89a770, 4, 0x93, 53, 0, 32, 1],
  [0x89a810, 4, 0x9a, 54, 0, 31, 1],
  [0x8bba20, 4, 0x5c, 36, 1, 17, 1],
  [0x8bd0d0, 4, 0x60, 38, 1, 17, 1],
  [0x8bd870, 4, 0x8d, 50, 1, 27, 3],
  [0x8bd900, 4, 0x8c, 50, 1, 31, 2],
  [0x899670, 3, 0x9e, 56, 0, 33, 1],
  [0x89b090, 3, 0xa3, 60, 0, 33, 2],
  [0x89bf70, 3, 0x83, 47, 0, 26, 1],
  [0x8bbf50, 3, 0x58, 33, 1, 17, 1],
  [0x8bbfb0, 3, 0xbc, 66, 1, 40, 1],
  [0x8bc070, 3, 0x5d, 34, 1, 18, 1],
  [0x8bc0d0, 3, 0x60, 38, 1, 18, 1],
  [0x8bd070, 3, 0x5d, 36, 1, 17, 1],
  [0x8bf670, 3, 0x90, 50, 1, 28, 5],
  [0x89dd00, 2, 0x90, 51, 0, 27, 1],
  [0x8bcbc0, 2, 0x8b, 50, 1, 27, 1],
  [0x8bcc50, 2, 0x94, 59, 1, 27, 1],
  [0x8c0b00, 2, 0xfd, 75, 1, 50, 1],
  [0x8c1cf0, 2, 0x5a, 33, 1, 17, 1],
  [0x89b620, 1, 0x6d, 42, 0, 22, 0],
  [0x89b690, 1, 0x5f, 37, 0, 18, 0],
  [0x89c2b0, 1, 0x9c, 57, 0, 33, 0],
  [0x89d8b0, 1, 0x76, 45, 0, 23, 0],
  [0x89d930, 1, 0x7c, 44, 0, 23, 0],
  [0x89db20, 1, 0x60, 38, 0, 18, 0],
  [0x89def0, 1, 0xa0, 55, 0, 32, 0],
  [0x89df90, 1, 0x82, 47, 0, 25, 0],
  [0x8bbc60, 1, 0xf3, 88, 1, 46, 0],
  [0x8bebc0, 1, 0x93, 52, 1, 29, 0],
  [0x8bec60, 1, 0x8d, 52, 1, 29, 0],
  [0x8bf700, 1, 0x217, 147, 1, 105, 0],
  [0x8c00b0, 1, 0x8d, 50, 1, 28, 0],
  [0x8c0140, 1, 0xe6, 76, 1, 50, 0],
  [0x8c07b0, 1, 0x95, 52, 1, 29, 0],
  [0x8c0850, 1, 0x94, 52, 1, 33, 0],
  [0x8c1940, 1, 0x74, 45, 1, 22, 0],
  [0x8c19c0, 1, 0x81, 53, 1, 25, 0],
  [0x8c1f40, 1, 0x5d, 36, 1, 17, 0],
  [0x8c1fa0, 1, 0x5c, 37, 1, 17, 0],
].map(Object.freeze));

/* closure row = [va, cluster, role, pushKind, storeKind, classKey, member]
 * ordered by ascending VA. member is the first v21 member index whose getter
 * (role 0) or setter (role 1) is this body. */
const PX_VA = 0;
const PX_CLUSTER = 1;
const PX_ROLE = 2;
const PX_PUSH = 3;
const PX_STORE = 4;
const PX_KEY = 5;
const PX_MEMBER = 6;

export const LUA_PROPERTY_CLOSURES = Object.freeze([
  [0x898f80, 21, 1, 0, 4, 0xc82a13, 171],
  [0x899030, 9, 0, 0, 4, 0xc82a13, 171],
  [0x8990d0, 10, 1, 0, 4, 0xc82a13, 170],
  [0x899140, 6, 0, 1, 4, 0xc82a13, 170],
  [0x8994f0, 10, 1, 0, 4, 0xc82a0a, 167],
  [0x899560, 6, 0, 2, 4, 0xc82a0a, 169],
  [0x8995c0, 21, 1, 0, 4, 0xc82a0a, 168],
  [0x899670, 28, 0, 0, 4, 0xc82a0a, 168],
  [0x899710, 6, 0, 1, 4, 0xc82a0a, 167],
  [0x899850, 11, 1, 0, 4, 0xc82a04, 164],
  [0x8998c0, 12, 0, 0, 4, 0xc82a04, 164],
  [0x899b00, 10, 1, 0, 4, 0xc829e6, 136],
  [0x899b70, 6, 0, 1, 4, 0xc829e6, 136],
  [0x89a4a0, 10, 1, 0, 4, 0xc82a1e, 132],
  [0x89a510, 6, 0, 1, 4, 0xc82a1e, 133],
  [0x89a570, 6, 0, 2, 4, 0xc82a1e, 132],
  [0x89a670, 7, 1, 0, 4, 0xc829e0, 127],
  [0x89a700, 8, 0, 5, 4, 0xc829e0, 127],
  [0x89a770, 22, 1, 0, 4, 0xc829e0, 126],
  [0x89a810, 23, 0, 0, 4, 0xc829e0, 126],
  [0x89aa50, 7, 1, 0, 4, 0xc829dd, 115],
  [0x89aae0, 8, 0, 5, 4, 0xc829dd, 115],
  [0x89ab50, 22, 1, 0, 4, 0xc829dd, 114],
  [0x89abf0, 23, 0, 0, 4, 0xc829dd, 114],
  [0x89ad70, 7, 1, 0, 4, 0xc829da, 113],
  [0x89ae00, 8, 0, 5, 4, 0xc829da, 113],
  [0x89ae70, 11, 1, 0, 4, 0xc829da, 112],
  [0x89aee0, 12, 0, 0, 4, 0xc829da, 112],
  [0x89af50, 22, 1, 0, 4, 0xc829da, 111],
  [0x89aff0, 23, 0, 0, 4, 0xc829da, 111],
  [0x89b090, 29, 1, 0, 4, 0xc829d7, 106],
  [0x89b140, 9, 0, 0, 4, 0xc829d7, 106],
  [0x89b280, 7, 1, 0, 4, 0xc829d7, 105],
  [0x89b310, 8, 0, 5, 4, 0xc829d7, 105],
  [0x89b540, 11, 1, 0, 4, 0xc829d7, 104],
  [0x89b5b0, 12, 0, 0, 4, 0xc829d7, 104],
  [0x89b620, 42, 1, 0, 4, 0xc829d4, 103],
  [0x89b690, 43, 0, 4, 4, 0xc829d4, 103],
  [0x89b6f0, 10, 1, 0, 4, 0xc829d4, 102],
  [0x89b760, 6, 0, 1, 4, 0xc829d4, 102],
  [0x89b7c0, 7, 1, 0, 4, 0xc829d4, 101],
  [0x89b850, 8, 0, 5, 4, 0xc829d4, 101],
  [0x89b940, 10, 1, 0, 4, 0xc829d1, 96],
  [0x89b9b0, 6, 0, 1, 4, 0xc829d1, 96],
  [0x89ba10, 29, 1, 0, 4, 0xc829d1, 95],
  [0x89bac0, 9, 0, 0, 4, 0xc829d1, 95],
  [0x89bb60, 7, 1, 0, 4, 0xc829ce, 90],
  [0x89bbf0, 8, 0, 5, 4, 0xc829ce, 90],
  [0x89bc60, 11, 1, 0, 4, 0xc829cb, 88],
  [0x89bcd0, 12, 0, 0, 4, 0xc829cb, 88],
  [0x89bd40, 10, 1, 0, 4, 0xc829cb, 87],
  [0x89bdb0, 6, 0, 1, 4, 0xc829cb, 87],
  [0x89be10, 7, 1, 0, 4, 0xc829c8, 79],
  [0x89bea0, 8, 0, 5, 4, 0xc829c8, 79],
  [0x89bf70, 30, 1, 0, 4, 0xc829c8, 78],
  [0x89c000, 28, 0, 0, 4, 0xc829c8, 78],
  [0x89c2b0, 44, 1, 0, 4, 0xc829c8, 77],
  [0x89c350, 9, 0, 0, 4, 0xc829c8, 77],
  [0x89c3f0, 10, 1, 0, 4, 0xc829c8, 76],
  [0x89c460, 6, 0, 1, 4, 0xc829c8, 76],
  [0x89c4c0, 11, 1, 0, 4, 0xc829c8, 75],
  [0x89c530, 12, 0, 0, 4, 0xc829c8, 75],
  [0x89c5a0, 21, 1, 0, 4, 0xc829c8, 74],
  [0x89c650, 9, 0, 0, 4, 0xc829c8, 74],
  [0x89c7f0, 22, 1, 0, 4, 0xc829c5, 68],
  [0x89c890, 23, 0, 0, 4, 0xc829c5, 68],
  [0x89c930, 7, 1, 0, 4, 0xc829c5, 67],
  [0x89c9c0, 8, 0, 5, 4, 0xc829c5, 67],
  [0x89d6b0, 29, 1, 0, 4, 0xc8297a, 66],
  [0x89d760, 9, 0, 0, 4, 0xc8297a, 66],
  [0x89d800, 21, 1, 0, 4, 0xc8297a, 65],
  [0x89d8b0, 45, 1, 0, 4, 0xc8297a, 64],
  [0x89d930, 46, 0, 0, 4, 0xc8297a, 64],
  [0x89d9b0, 7, 1, 0, 4, 0xc8297a, 63],
  [0x89da40, 8, 0, 5, 4, 0xc8297a, 63],
  [0x89dab0, 10, 1, 0, 4, 0xc8297a, 57],
  [0x89db20, 47, 0, 0, 4, 0xc8297a, 62],
  [0x89db80, 9, 0, 0, 4, 0xc8297a, 61],
  [0x89dc20, 11, 1, 0, 4, 0xc8297a, 60],
  [0x89dc90, 12, 0, 0, 4, 0xc8297a, 60],
  [0x89dd00, 37, 1, 0, 4, 0xc8297a, 59],
  [0x89dd90, 9, 0, 0, 4, 0xc8297a, 59],
  [0x89de30, 6, 0, 2, 4, 0xc8297a, 57],
  [0x89de90, 6, 0, 1, 4, 0xc8297a, 58],
  [0x89def0, 48, 1, 0, 4, 0xc8297a, 56],
  [0x89df90, 49, 0, 0, 4, 0xc8297a, 56],
  [0x89e020, 30, 1, 0, 4, 0xc8297a, 55],
  [0x89e0b0, 28, 0, 0, 4, 0xc8297a, 55],
  [0x89e1b0, 11, 1, 0, 4, 0xc829b3, 48],
  [0x89e220, 12, 0, 0, 4, 0xc829b3, 48],
  [0x89e450, 11, 1, 0, 4, 0xc82992, 11],
  [0x89e4c0, 12, 0, 0, 4, 0xc82992, 11],
  [0x89e530, 11, 1, 0, 4, 0xc8298f, 6],
  [0x89e5a0, 12, 0, 0, 4, 0xc8298f, 6],
  [0x89e6b0, 37, 1, 0, 4, 0xc8298f, 5],
  [0x89e740, 9, 0, 0, 4, 0xc8298f, 5],
  [0x89e7e0, 7, 1, 0, 4, 0xc8298f, 4],
  [0x89e870, 8, 0, 5, 4, 0xc8298f, 4],
  [0x89e8e0, 30, 1, 0, 4, 0xc8298f, 3],
  [0x89e970, 9, 0, 0, 4, 0xc8298f, 3],
  [0x89f500, 7, 1, 0, 4, 0xc8298c, 2],
  [0x89f590, 8, 0, 5, 4, 0xc8298c, 2],
  [0x8bb2e0, 2, 0, 5, 4, 0xc82980, 0],
  [0x8bb340, 3, 1, 0, 3, 0xc82980, 0],
  [0x8bb420, 2, 0, 5, 4, 0xc82983, 1],
  [0x8bb480, 3, 1, 0, 3, 0xc82983, 1],
  [0x8bb900, 0, 0, 1, 4, 0xc82992, 7],
  [0x8bb960, 1, 1, 0, 2, 0xc82992, 7],
  [0x8bb9c0, 0, 0, 2, 4, 0xc82992, 8],
  [0x8bba20, 24, 0, 0, 4, 0xc82992, 9],
  [0x8bba80, 13, 0, 0, 4, 0xc82992, 10],
  [0x8bbb20, 14, 1, 0, 3, 0xc82992, 10],
  [0x8bbbc0, 17, 0, 0, 4, 0xc82992, 12],
  [0x8bbc60, 50, 1, 0, 2, 0xc82992, 12],
  [0x8bbdb0, 4, 0, 0, 4, 0xc82998, 13],
  [0x8bbe10, 5, 1, 0, 0, 0xc82998, 13],
  [0x8bbe80, 2, 0, 5, 4, 0xc82998, 14],
  [0x8bbee0, 3, 1, 0, 3, 0xc82998, 14],
  [0x8bbf50, 31, 0, 0, 4, 0xc82998, 15],
  [0x8bbfb0, 32, 1, 0, 4, 0xc82998, 15],
  [0x8bc070, 33, 0, 4, 4, 0xc82998, 16],
  [0x8bc0d0, 34, 1, 0, 2, 0xc82998, 16],
  [0x8bc130, 13, 0, 0, 4, 0xc82998, 17],
  [0x8bc1d0, 14, 1, 0, 3, 0xc82998, 17],
  [0x8bc270, 0, 0, 1, 4, 0xc82998, 18],
  [0x8bc2d0, 1, 1, 0, 2, 0xc82998, 18],
  [0x8bc3c0, 33, 0, 4, 4, 0xc8299b, 19],
  [0x8bc420, 34, 1, 0, 2, 0xc8299b, 19],
  [0x8bc480, 0, 0, 1, 4, 0xc829a1, 20],
  [0x8bc4e0, 1, 1, 0, 2, 0xc829a1, 20],
  [0x8bc540, 15, 0, 0, 4, 0xc829a1, 21],
  [0x8bc5b0, 16, 1, 0, 4, 0xc829a1, 21],
  [0x8bc6c0, 4, 0, 0, 4, 0xc829a1, 22],
  [0x8bc720, 5, 1, 0, 0, 0xc829a1, 22],
  [0x8bc790, 0, 0, 2, 4, 0xc829a1, 23],
  [0x8bc7f0, 24, 0, 0, 4, 0xc829a1, 24],
  [0x8bc850, 0, 0, 1, 4, 0xc829a4, 26],
  [0x8bc8b0, 1, 1, 0, 2, 0xc829a4, 26],
  [0x8bc910, 15, 0, 0, 4, 0xc829a4, 27],
  [0x8bc980, 16, 1, 0, 4, 0xc829a4, 27],
  [0x8bca90, 4, 0, 0, 4, 0xc829a4, 28],
  [0x8bcaf0, 5, 1, 0, 0, 0xc829a4, 28],
  [0x8bcb60, 24, 0, 0, 4, 0xc829a4, 29],
  [0x8bcbc0, 38, 0, 0, 4, 0xc829a4, 30],
  [0x8bcc50, 39, 1, 0, 0, 0xc829a4, 30],
  [0x8bccf0, 0, 0, 1, 4, 0xc829a7, 31],
  [0x8bcd50, 1, 1, 0, 2, 0xc829a7, 31],
  [0x8bcdb0, 15, 0, 0, 4, 0xc829a7, 32],
  [0x8bce20, 16, 1, 0, 4, 0xc829a7, 32],
  [0x8bcf30, 0, 0, 2, 4, 0xc829a7, 33],
  [0x8bcf90, 4, 0, 0, 4, 0xc829a7, 34],
  [0x8bd000, 5, 1, 0, 0, 0xc829a7, 34],
  [0x8bd070, 35, 0, 0, 4, 0xc829a7, 35],
  [0x8bd0d0, 25, 1, 0, 1, 0xc829a7, 35],
  [0x8bd130, 24, 0, 0, 4, 0xc829a7, 36],
  [0x8bd190, 33, 0, 4, 4, 0xc829a7, 37],
  [0x8bd1f0, 34, 1, 0, 2, 0xc829a7, 37],
  [0x8bd250, 0, 0, 1, 4, 0xc829aa, 38],
  [0x8bd2b0, 1, 1, 0, 2, 0xc829aa, 38],
  [0x8bd310, 15, 0, 0, 4, 0xc829aa, 39],
  [0x8bd380, 16, 1, 0, 4, 0xc829aa, 39],
  [0x8bd490, 4, 0, 0, 4, 0xc829aa, 40],
  [0x8bd4f0, 5, 1, 0, 0, 0xc829aa, 40],
  [0x8bd560, 18, 0, 0, 4, 0xc829aa, 41],
  [0x8bd5f0, 19, 1, 0, 2, 0xc829aa, 41],
  [0x8bd690, 0, 0, 1, 4, 0xc829b0, 42],
  [0x8bd6f0, 1, 1, 0, 2, 0xc829b0, 42],
  [0x8bd750, 31, 0, 0, 4, 0xc829b0, 43],
  [0x8bd7b0, 32, 1, 0, 4, 0xc829b0, 43],
  [0x8bd870, 26, 0, 0, 4, 0xc829b0, 44],
  [0x8bd900, 27, 1, 0, 4, 0xc829b0, 44],
  [0x8bd990, 2, 0, 5, 4, 0xc829b0, 45],
  [0x8bd9f0, 3, 1, 0, 3, 0xc829b0, 45],
  [0x8bda60, 17, 0, 0, 4, 0xc829b3, 46],
  [0x8bdb00, 20, 1, 0, 2, 0xc829b3, 46],
  [0x8bdb90, 0, 0, 1, 4, 0xc829b3, 47],
  [0x8bdbf0, 1, 1, 0, 2, 0xc829b3, 47],
  [0x8bdc50, 17, 0, 0, 4, 0xc829b6, 49],
  [0x8bdcf0, 20, 1, 0, 2, 0xc829b6, 49],
  [0x8bdd80, 0, 0, 1, 4, 0xc829b6, 50],
  [0x8bdde0, 1, 1, 0, 2, 0xc829b6, 50],
  [0x8bde40, 13, 0, 0, 4, 0xc829bf, 51],
  [0x8bdee0, 14, 1, 0, 3, 0xc829bf, 51],
  [0x8bdf80, 0, 0, 1, 4, 0xc829c2, 52],
  [0x8bdfe0, 1, 1, 0, 2, 0xc829c2, 52],
  [0x8be040, 2, 0, 5, 4, 0xc829c2, 53],
  [0x8be0a0, 3, 1, 0, 3, 0xc829c2, 53],
  [0x8be110, 2, 0, 5, 4, 0xc8297a, 54],
  [0x8be170, 3, 1, 0, 3, 0xc8297a, 54],
  [0x8be1e0, 2, 0, 5, 4, 0xc829c5, 69],
  [0x8be240, 3, 1, 0, 3, 0xc829c5, 69],
  [0x8be2b0, 0, 0, 1, 4, 0xc829c5, 70],
  [0x8be310, 1, 1, 0, 2, 0xc829c5, 70],
  [0x8be370, 13, 0, 0, 4, 0xc829c5, 71],
  [0x8be410, 14, 1, 0, 3, 0xc829c5, 71],
  [0x8be4b0, 17, 0, 0, 4, 0xc829c5, 72],
  [0x8be550, 20, 1, 0, 2, 0xc829c5, 72],
  [0x8be5e0, 4, 0, 0, 4, 0xc829c5, 73],
  [0x8be640, 5, 1, 0, 0, 0xc829c5, 73],
  [0x8be6b0, 2, 0, 5, 4, 0xc829c8, 80],
  [0x8be710, 3, 1, 0, 3, 0xc829c8, 80],
  [0x8be780, 26, 0, 0, 4, 0xc829c8, 81],
  [0x8be810, 27, 1, 0, 4, 0xc829c8, 81],
  [0x8be8a0, 31, 0, 0, 4, 0xc829c8, 82],
  [0x8be900, 32, 1, 0, 4, 0xc829c8, 82],
  [0x8be9c0, 4, 0, 0, 4, 0xc829c8, 83],
  [0x8bea20, 5, 1, 0, 0, 0xc829c8, 83],
  [0x8bea90, 18, 0, 0, 4, 0xc829c8, 84],
  [0x8beb20, 19, 1, 0, 2, 0xc829c8, 84],
  [0x8bebc0, 51, 0, 0, 4, 0xc829c8, 85],
  [0x8bec60, 52, 1, 0, 2, 0xc829c8, 85],
  [0x8becf0, 0, 0, 1, 4, 0xc829c8, 86],
  [0x8bed50, 1, 1, 0, 2, 0xc829c8, 86],
  [0x8bedb0, 0, 0, 2, 4, 0xc829cb, 89],
  [0x8bee10, 1, 1, 0, 2, 0xc829cb, 89],
  [0x8bee70, 2, 0, 5, 4, 0xc829ce, 91],
  [0x8beed0, 3, 1, 0, 3, 0xc829ce, 91],
  [0x8bef40, 0, 0, 1, 4, 0xc829ce, 92],
  [0x8befa0, 1, 1, 0, 2, 0xc829ce, 92],
  [0x8bf000, 4, 0, 0, 4, 0xc829ce, 93],
  [0x8bf060, 5, 1, 0, 0, 0xc829ce, 93],
  [0x8bf0d0, 13, 0, 0, 4, 0xc829ce, 94],
  [0x8bf170, 14, 1, 0, 3, 0xc829ce, 94],
  [0x8bf210, 0, 0, 1, 4, 0xc829d1, 97],
  [0x8bf270, 1, 1, 0, 2, 0xc829d1, 97],
  [0x8bf2d0, 2, 0, 5, 4, 0xc829d1, 98],
  [0x8bf330, 3, 1, 0, 3, 0xc829d1, 98],
  [0x8bf3a0, 13, 0, 0, 4, 0xc829d1, 99],
  [0x8bf440, 14, 1, 0, 3, 0xc829d1, 99],
  [0x8bf4e0, 4, 0, 0, 4, 0xc829d1, 100],
  [0x8bf540, 5, 1, 0, 0, 0xc829d1, 100],
  [0x8bf5b0, 0, 0, 1, 4, 0xc829d7, 107],
  [0x8bf610, 1, 1, 0, 2, 0xc829d7, 107],
  [0x8bf670, 36, 0, 0, 4, 0xc829d7, 108],
  [0x8bf700, 53, 1, 0, 4, 0xc829d7, 108],
  [0x8bf920, 0, 0, 2, 4, 0xc829d7, 109],
  [0x8bf980, 13, 0, 0, 4, 0xc829d7, 110],
  [0x8bfa20, 14, 1, 0, 3, 0xc829d7, 110],
  [0x8bfac0, 13, 0, 0, 4, 0xc829dd, 116],
  [0x8bfb60, 14, 1, 0, 3, 0xc829dd, 116],
  [0x8bfc00, 2, 0, 5, 4, 0xc829dd, 117],
  [0x8bfc60, 3, 1, 0, 3, 0xc829dd, 117],
  [0x8bfcd0, 26, 0, 0, 4, 0xc829dd, 118],
  [0x8bfd60, 27, 1, 0, 4, 0xc829dd, 118],
  [0x8bfdf0, 0, 0, 1, 4, 0xc829dd, 119],
  [0x8bfe50, 1, 1, 0, 2, 0xc829dd, 119],
  [0x8bfeb0, 4, 0, 0, 4, 0xc829dd, 120],
  [0x8bff10, 5, 1, 0, 0, 0xc829dd, 120],
  [0x8bff80, 38, 0, 0, 4, 0xc829dd, 121],
  [0x8c0010, 39, 1, 0, 0, 0xc829dd, 121],
  [0x8c00b0, 54, 0, 0, 4, 0xc829dd, 122],
  [0x8c0140, 55, 1, 0, 4, 0xc829dd, 122],
  [0x8c0230, 0, 0, 2, 4, 0xc829dd, 123],
  [0x8c0290, 18, 0, 0, 4, 0xc829dd, 124],
  [0x8c0320, 19, 1, 0, 2, 0xc829dd, 124],
  [0x8c03c0, 17, 0, 0, 4, 0xc829dd, 125],
  [0x8c0460, 20, 1, 0, 2, 0xc829dd, 125],
  [0x8c04f0, 2, 0, 5, 4, 0xc829e0, 128],
  [0x8c0550, 3, 1, 0, 3, 0xc829e0, 128],
  [0x8c05c0, 0, 0, 1, 4, 0xc829e3, 129],
  [0x8c0620, 1, 1, 0, 2, 0xc829e3, 129],
  [0x8c0680, 0, 0, 2, 4, 0xc829e3, 130],
  [0x8c06e0, 4, 0, 0, 4, 0xc829e3, 131],
  [0x8c0740, 5, 1, 0, 0, 0xc829e3, 131],
  [0x8c07b0, 56, 0, 0, 4, 0xc82a1e, 134],
  [0x8c0850, 57, 1, 0, 4, 0xc82a1e, 134],
  [0x8c08f0, 0, 0, 1, 4, 0xc82a1e, 135],
  [0x8c0950, 1, 1, 0, 2, 0xc82a1e, 135],
  [0x8c09b0, 0, 0, 1, 4, 0xc829e6, 137],
  [0x8c0a10, 1, 1, 0, 2, 0xc829e6, 137],
  [0x8c0a70, 36, 0, 0, 4, 0xc829e6, 138],
  [0x8c0b00, 40, 1, 0, 4, 0xc829e6, 138],
  [0x8c0c10, 4, 0, 0, 4, 0xc829e6, 139],
  [0x8c0c70, 5, 1, 0, 0, 0xc829e6, 139],
  [0x8c0ce0, 18, 0, 0, 4, 0xc829e6, 140],
  [0x8c0d70, 19, 1, 0, 2, 0xc829e6, 140],
  [0x8c0e10, 18, 0, 0, 4, 0xc829e6, 141],
  [0x8c0ea0, 19, 1, 0, 2, 0xc829e6, 141],
  [0x8c0f40, 15, 0, 0, 4, 0xc829e6, 142],
  [0x8c0fb0, 16, 1, 0, 4, 0xc829e6, 142],
  [0x8c10c0, 0, 0, 1, 4, 0xc829e9, 143],
  [0x8c1120, 1, 1, 0, 2, 0xc829e9, 143],
  [0x8c1180, 15, 0, 0, 4, 0xc829e9, 144],
  [0x8c11f0, 16, 1, 0, 4, 0xc829e9, 144],
  [0x8c1300, 4, 0, 0, 4, 0xc829e9, 145],
  [0x8c1360, 5, 1, 0, 0, 0xc829e9, 145],
  [0x8c13d0, 4, 0, 0, 4, 0xc829ec, 146],
  [0x8c1430, 5, 1, 0, 0, 0xc829ec, 146],
  [0x8c14a0, 15, 0, 0, 4, 0xc829ef, 147],
  [0x8c1510, 16, 1, 0, 4, 0xc829ef, 147],
  [0x8c1620, 0, 0, 1, 4, 0xc829ef, 148],
  [0x8c1680, 1, 1, 0, 2, 0xc829ef, 148],
  [0x8c16e0, 0, 0, 1, 4, 0xc829f2, 149],
  [0x8c1740, 1, 1, 0, 2, 0xc829f2, 149],
  [0x8c17a0, 36, 0, 0, 4, 0xc829f5, 150],
  [0x8c1830, 40, 1, 0, 4, 0xc829f5, 150],
  [0x8c1940, 58, 0, 0, 4, 0xc829f5, 151],
  [0x8c19c0, 59, 1, 0, 2, 0xc829f5, 151],
  [0x8c1a50, 26, 0, 0, 4, 0xc829f5, 152],
  [0x8c1ae0, 27, 1, 0, 4, 0xc829f5, 152],
  [0x8c1b70, 0, 0, 1, 4, 0xc829f8, 153],
  [0x8c1bd0, 1, 1, 0, 2, 0xc829f8, 153],
  [0x8c1c30, 0, 0, 1, 4, 0xc829fb, 154],
  [0x8c1c90, 1, 1, 0, 2, 0xc829fb, 154],
  [0x8c1cf0, 41, 0, 3, 4, 0xc829fb, 155],
  [0x8c1d50, 25, 1, 0, 1, 0xc829fb, 155],
  [0x8c1db0, 2, 0, 5, 4, 0xc829fb, 156],
  [0x8c1e10, 3, 1, 0, 3, 0xc829fb, 156],
  [0x8c1e80, 35, 0, 0, 4, 0xc829fe, 157],
  [0x8c1ee0, 25, 1, 0, 1, 0xc829fe, 157],
  [0x8c1f40, 60, 0, 0, 4, 0xc829fe, 158],
  [0x8c1fa0, 61, 1, 0, 0, 0xc829fe, 158],
  [0x8c2000, 2, 0, 5, 4, 0xc829fe, 159],
  [0x8c2060, 3, 1, 0, 3, 0xc829fe, 159],
  [0x8c23b0, 0, 0, 1, 4, 0xc82a04, 160],
  [0x8c2410, 1, 1, 0, 2, 0xc82a04, 160],
  [0x8c2470, 17, 0, 0, 4, 0xc82a04, 161],
  [0x8c2510, 20, 1, 0, 2, 0xc82a04, 161],
  [0x8c25a0, 18, 0, 0, 4, 0xc82a04, 162],
  [0x8c2630, 19, 1, 0, 2, 0xc82a04, 162],
  [0x8c26d0, 0, 0, 2, 4, 0xc82a04, 163],
  [0x8c2730, 41, 0, 3, 4, 0xc82a04, 165],
  [0x8c2790, 25, 1, 0, 1, 0xc82a04, 165],
  [0x8c27f0, 35, 0, 0, 4, 0xc82a04, 166],
  [0x8c2850, 0, 0, 1, 4, 0xc82a13, 172],
  [0x8c28b0, 1, 1, 0, 2, 0xc82a13, 172],
].map(Object.freeze));

/** @param {number} index */
function closureAt(index) {
  return Number.isInteger(index) && index >= 0 && index < LUA_PROPERTY_CLOSURES.length
    ? LUA_PROPERTY_CLOSURES[index]
    : null;
}

/** @param {number} index */
function closureClusterAt(index) {
  return Number.isInteger(index) && index >= 0 &&
    index < LUA_PROPERTY_CLOSURE_CLUSTERS.length
    ? LUA_PROPERTY_CLOSURE_CLUSTERS[index]
    : null;
}

export function luaEngineClosureCount() {
  return LUA_PROPERTY_CLOSURES.length;
}

/** @param {number} index */
export function luaEngineClosureVa(index) {
  const r = closureAt(index);
  return r ? r[PX_VA] >>> 0 : 0;
}

/** @param {number} index */
export function luaEngineClosureCluster(index) {
  const r = closureAt(index);
  return r ? r[PX_CLUSTER] : -1;
}

/** 0 = getter, 1 = setter. Never both (C8). @param {number} index */
export function luaEngineClosureRole(index) {
  const r = closureAt(index);
  return r ? r[PX_ROLE] : -1;
}

/** Registry light-userdata key ADDRESS. Never dereferenced: the blob is past
 *  .data's raw end and is zero at load. @param {number} index */
export function luaEngineClosureClassKey(index) {
  const r = closureAt(index);
  return r ? r[PX_KEY] >>> 0 : 0;
}

/** @param {number} index */
export function luaEngineClosureMember(index) {
  const r = closureAt(index);
  return r ? r[PX_MEMBER] : -1;
}

/** @param {number} index */
export function luaEngineClosurePushKind(index) {
  const r = closureAt(index);
  return r ? r[PX_PUSH] : -1;
}

/** Setter store width. Getters, and setters that dispatch through the upvalue
 *  instead of storing directly, are INDIRECT. @param {number} index */
export function luaEngineClosureStoreKind(index) {
  const r = closureAt(index);
  return r ? r[PX_STORE] : -1;
}

/** Body shape is a total function of the cluster (C1). @param {number} index */
export function luaEngineClosureBodyBytes(index) {
  const r = closureAt(index);
  if (!r) return 0;
  return LUA_PROPERTY_CLOSURE_CLUSTERS[r[PX_CLUSTER]][PC_BYTES] >>> 0;
}

/** @param {number} index */
export function luaEngineClosureBodyInsns(index) {
  const r = closureAt(index);
  if (!r) return 0;
  return LUA_PROPERTY_CLOSURE_CLUSTERS[r[PX_CLUSTER]][PC_INSNS] >>> 0;
}

/** Derived from the VA, not stored. @param {number} va */
export function luaEngineClosureBandForVa(va) {
  const v = va >>> 0;
  if (v >= LUA_PROPERTY_CLOSURE_BAND_A_LO && v <= LUA_PROPERTY_CLOSURE_BAND_A_HI) {
    return LUA_PROPERTY_CLOSURE_BAND_A;
  }
  if (v >= LUA_PROPERTY_CLOSURE_BAND_B_LO && v <= LUA_PROPERTY_CLOSURE_BAND_B_HI) {
    return LUA_PROPERTY_CLOSURE_BAND_B;
  }
  return -1;
}

/** @param {number} index */
export function luaEngineClosureBand(index) {
  const r = closureAt(index);
  return r ? luaEngineClosureBandForVa(r[PX_VA]) : -1;
}

/** @param {number} va */
export function luaEngineClosureIndexForVa(va) {
  const v = va >>> 0;
  for (let i = 0; i < LUA_PROPERTY_CLOSURES.length; i += 1) {
    if (LUA_PROPERTY_CLOSURES[i][PX_VA] === v) return i;
  }
  return -1;
}

/** C5: the const-check flag is a total function of the role. @param {number} index */
export function luaEngineClosureConstFlag(index) {
  const role = luaEngineClosureRole(index);
  if (role < 0) return -1;
  return role === LUA_PROPERTY_CLOSURE_ROLE_GET
    ? LUA_PROPERTY_CLOSURE_GET_CONST_FLAG
    : LUA_PROPERTY_CLOSURE_SET_CONST_FLAG;
}

/** C6 including its single recorded exception - the PE value, not the law.
 *  @param {number} index */
export function luaEngineClosureReturnValue(index) {
  const r = closureAt(index);
  if (!r) return -1;
  if (r[PX_VA] === LUA_PROPERTY_CLOSURE_RETURN_EXCEPTION_VA) return 1;
  return r[PX_ROLE] === LUA_PROPERTY_CLOSURE_ROLE_GET
    ? LUA_PROPERTY_CLOSURE_GET_RETURN
    : LUA_PROPERTY_CLOSURE_SET_RETURN;
}

export function luaEngineClosureClusterCount() {
  return LUA_PROPERTY_CLOSURE_CLUSTERS.length;
}

/** @param {number} index */
export function luaEngineClosureClusterRepVa(index) {
  const r = closureClusterAt(index);
  return r ? r[PC_REP] >>> 0 : 0;
}

/** @param {number} index */
export function luaEngineClosureClusterBodies(index) {
  const r = closureClusterAt(index);
  return r ? r[PC_N] : -1;
}

/** @param {number} index */
export function luaEngineClosureClusterBodyBytes(index) {
  const r = closureClusterAt(index);
  return r ? r[PC_BYTES] >>> 0 : 0;
}

/** @param {number} index */
export function luaEngineClosureClusterBodyInsns(index) {
  const r = closureClusterAt(index);
  return r ? r[PC_INSNS] >>> 0 : 0;
}

/** @param {number} index */
export function luaEngineClosureClusterBand(index) {
  const r = closureClusterAt(index);
  return r ? r[PC_BAND] : -1;
}

/** Encoded operand fields in the template (immediates + displacements).
 *  @param {number} index */
export function luaEngineClosureClusterOperandFields(index) {
  const r = closureClusterAt(index);
  return r ? r[PC_FIELDS] : -1;
}

/** Of those, the ones that are neither INVARIANT nor DERIVED.
 *  @param {number} index */
export function luaEngineClosureClusterFreeFields(index) {
  const r = closureClusterAt(index);
  return r ? r[PC_FREE] : -1;
}

/* ---- x86 semantics extracted from the closure bodies --------------------
 * These take uint32_t-width values and re-narrow explicitly. The Wasm ABI
 * does not narrow i32 arguments, so every gate below must be driven with
 * UNMASKED wide values (0x100, 0x1ff, 0x80000000, 0xffffffff) or the test
 * cannot see a dropped narrowing.
 */

/** `test eax, eax` / `jne` after lua_type - a FULL-WORD test (C7). 0x100 is
 *  nonzero here and DOES take the branch. @param {number} luaTypeResult */
export function luaEngineClosureTypeGateTaken(luaTypeResult) {
  return (luaTypeResult >>> 0) !== 0 ? 1 : 0;
}

/** 0x0085c590 raises luaL_argerror("cannot be const") iff the recorded const
 *  marker byte is nonzero AND the caller's flag BYTE is zero. Both operands
 *  are read with `cmp byte ptr`, so only the low byte counts: flag 0x100
 *  behaves exactly like flag 0.
 *  @param {number} constMarker @param {number} flagArg */
export function luaEngineClosureConstGateRaises(constMarker, flagArg) {
  const marker = (constMarker >>> 0) & 0xff;
  const flag = (flagArg >>> 0) & 0xff;
  return marker !== 0 && flag === 0 ? 1 : 0;
}

/** `test eax, eax` / `setne byte ptr [ebp-4]` on the lua_toboolean result:
 *  full-word test, byte 0/1 result. @param {number} v */
export function luaEngineClosureBooleanNormalize(v) {
  return (v >>> 0) !== 0 ? 1 : 0;
}

/** 0x0085bfd0 `mov eax, edx ; cdq` - low half. @param {number} v */
export function luaEngineClosurePushI32Lo(v) {
  return v >>> 0;
}

/** 0x0085bfd0 high half: the replicated sign of the 32-bit value.
 *  @param {number} v */
export function luaEngineClosurePushI32Hi(v) {
  return ((v >>> 0) & 0x80000000) !== 0 ? 0xffffffff : 0;
}

/** 0x0085bff0 `push 0 ; push edx` - zero extension. @param {number} v */
export function luaEngineClosurePushU32Lo(v) {
  return v >>> 0;
}

/** @param {number} v */
export function luaEngineClosurePushU32Hi(v) {
  void v;
  return 0;
}

/** 0x0085c010 `movzx eax, dx ; cdq` - the 16-bit narrowing happens BEFORE the
 *  sign extension, so the result is never negative. @param {number} v */
export function luaEngineClosurePushU16Lo(v) {
  return (v >>> 0) & 0xffff;
}

/** @param {number} v */
export function luaEngineClosurePushU16Hi(v) {
  void v;
  return 0;
}

/** Setter store narrowing: `mov byte/word/dword ptr [ebx+ecx], ...`. MOVSS is
 *  a raw 32-bit copy and INDIRECT performs no direct store, so both are the
 *  identity on the value. @param {number} storeKind @param {number} v */
export function luaEngineClosureStoreValue(storeKind, v) {
  const value = v >>> 0;
  if (storeKind === LUA_PROPERTY_CLOSURE_STORE_KIND_BYTE) return value & 0xff;
  if (storeKind === LUA_PROPERTY_CLOSURE_STORE_KIND_WORD) return value & 0xffff;
  if (storeKind === LUA_PROPERTY_CLOSURE_STORE_KIND_DWORD ||
      storeKind === LUA_PROPERTY_CLOSURE_STORE_KIND_MOVSS ||
      storeKind === LUA_PROPERTY_CLOSURE_STORE_KIND_INDIRECT) {
    return value;
  }
  return 0;
}

/** lua_upvalueindex(n) = LUA_REGISTRYINDEX - n with
 *  LUA_REGISTRYINDEX = -LUAI_MAXSTACK - 1000 and LUAI_MAXSTACK = 1000000.
 *  Derived, not looked up: n = 1 must reproduce the 0xfff0b9d7 the 326 bodies
 *  push. @param {number} n */
export function luaEngineClosureUpvalueIndex(n) {
  const registry = -(LUA_PROPERTY_CLOSURE_LUAI_MAXSTACK + 1000);
  return (registry - (n | 0)) >>> 0;
}

/* ---------------------------------------------------------------------
 * v23: inline property-installer family + its 21 read-only getters.
 * Independently transcribed from the PE (not derived from the C++).
 * ------------------------------------------------------------------- */

export const LUA_INLINE_UD_FIELD_OFFSET = 0;
export const LUA_INLINE_UD_CODE_PTR = 1;
export const LUA_INLINE_UD_CALLER_ARG = 2;
export const LUA_INLINE_BAND_A = 0;
export const LUA_INLINE_BAND_B = 1;

export const LUA_INLINE_TEXT_LO = 0x00401000;
export const LUA_INLINE_TEXT_HI = 0x00b17134;
export const LUA_INLINE_FIELD_OFFSET_LIMIT = 0x1000;

export const LUA_INLINE_INSTALL_NUPS = 1;
export const LUA_INLINE_INSTALL_USERDATA_SIZE = 4;
export const LUA_INLINE_PROPGET_NAME_VA = 0x00b6e994;
export const LUA_INLINE_PROPSET_NAME_VA = 0x00b6ea38;

export const LUA_INLINE_CALL_FN_A = 0x00872000;
export const LUA_INLINE_CALL_FN_B = 0x00872020;
export const LUA_INLINE_CALL_FN_C = 0x00872040;
export const LUA_INLINE_CALL_FN_D = 0x0085dbd0;

export const LUA_INLINE_INSTALLER_COUNT = 23;
export const LUA_INLINE_ORPHAN_COUNT = 21;
export const LUA_INLINE_ORPHAN_BAND_A = 14;
export const LUA_INLINE_ORPHAN_BAND_B = 7;
export const LUA_INLINE_ORPHAN_GETTERS = 21;
export const LUA_INLINE_ORPHAN_SETTERS = 0;
export const LUA_INLINE_ORPHAN_CALLS_UPVALUE = 4;
export const LUA_INLINE_ORPHAN_DISTINCT_KEYS = 11;
export const LUA_INLINE_INSTALLER_CODE_PTR = 14;
export const LUA_INLINE_INSTALLER_FIELD_OFFSET = 3;
export const LUA_INLINE_INSTALLER_CALLER_ARG = 6;
export const LUA_INLINE_INSTALLER_RET8 = 16;
export const LUA_INLINE_INSTALLER_RET_C = 7;
export const LUA_INLINE_INSTALLER_NUPS1 = 23;
export const LUA_INLINE_INSTALLER_UD_SIZE4 = 23;
export const LUA_INLINE_INSTALLER_PROPSET = 0;
export const LUA_INLINE_INSTALLER_LO_VA = 0x008794b0;
export const LUA_INLINE_INSTALLER_HI_VA = 0x0088f1b0;
export const LUA_INLINE_ORPHAN_LO_VA = 0x00899930;
export const LUA_INLINE_ORPHAN_HI_VA = 0x008c2350;

export const LUA_INLINE_SURFACE_V22 = 326;
export const LUA_INLINE_SURFACE_V23 = 21;
/* v24: the whole-image install-side census replaced v23's estimate. These
 * three shared constants describe the CURRENT modelled state: 383 total
 * (326 + 21 + 36), zero residual, surface complete. */
export const LUA_INLINE_SURFACE_MODELLED = 383;
export const LUA_INLINE_SURFACE_RESIDUAL = 0;
export const LUA_INLINE_SURFACE_COMPLETE = 1;
export const LUA_INLINE_RESIDUAL_BAND_C_LO = 0x008c32d0;
export const LUA_INLINE_RESIDUAL_BAND_C_HI = 0x008c59d0;
export const LUA_INLINE_RESIDUAL_BAND_C_COUNT = 26;
export const LUA_INLINE_RESIDUAL_EXTRA_VA = 0x008a0600;
export const LUA_INLINE_NEXT_VA = 0x008991f0;

// [va, band, key, callsUpvalue, ret, nchecks, bodyBytes]
const IO_VA = 0, IO_BAND = 1, IO_KEY = 2, IO_CALLS = 3, IO_RET = 4,
      IO_CHECKS = 5, IO_SIZE = 6;
export const LUA_INLINE_ORPHANS = Object.freeze([
  [0x00899930, 0, 0x00c82a01, 1, 1, 1, 0xa2],
  [0x008999e0, 0, 0x00c82a01, 1, 1, 1, 0x66],
  [0x00899a50, 0, 0x00c829fe, 1, 1, 1, 0xa2],
  [0x0089a5d0, 0, 0x00c82a1e, 0, 1, 1, 0x9e],
  [0x0089a8b0, 0, 0x00c8297a, 0, 1, 1, 0x19e],
  [0x0089b1e0, 0, 0x00c829d7, 0, 1, 1, 0x9b],
  [0x0089b380, 0, 0x00c82980, 0, 1, 2, 0x1b3],
  [0x0089bf10, 0, 0x00c829c8, 0, 1, 1, 0x5c],
  [0x0089c0a0, 0, 0x00c82a20, 0, 1, 3, 0x20a],
  [0x0089c6f0, 0, 0x00c829c5, 0, 1, 1, 0x9b],
  [0x0089c790, 0, 0x00c829c5, 0, 1, 1, 0x5c],
  [0x0089e150, 0, 0x00c829bc, 0, 1, 1, 0x5c],
  [0x0089e290, 0, 0x00c829a7, 1, 1, 1, 0x68],
  [0x0089e3b0, 0, 0x00c829a7, 0, 1, 1, 0x9b],
  [0x008c20d0, 1, 0x00c82a01, 0, 1, 1, 0x59],
  [0x008c2130, 1, 0x00c82a01, 0, 1, 1, 0x59],
  [0x008c2190, 1, 0x00c82a01, 0, 1, 1, 0x8b],
  [0x008c2220, 1, 0x00c82a01, 0, 1, 1, 0x68],
  [0x008c2290, 1, 0x00c82a01, 0, 1, 1, 0x5b],
  [0x008c22f0, 1, 0x00c82a01, 0, 1, 1, 0x5a],
  [0x008c2350, 1, 0x00c82a01, 0, 1, 1, 0x5d],
].map(Object.freeze));

// [va, body, udValue, udDiscipline, retImm, propgetPushes, size]
const II_VA = 0, II_BODY = 1, II_UD = 2, II_DISC = 3, II_RET = 4,
      II_PG = 5, II_SIZE = 6;
export const LUA_INLINE_INSTALLERS = Object.freeze([
  [0x008794b0, 0x0089e3b0, 0x0085dbc0, 1, 0x8, 2, 0xf5],
  [0x0087ad70, 0x0089e290, 0x0085dbd0, 1, 0x8, 0, 0x5b],
  [0x0087ce80, 0x0089e150, 0x004176f0, 1, 0x8, 2, 0xf5],
  [0x0087cfb0, 0x0089e150, 0x004176f0, 1, 0x8, 0, 0xa3],
  [0x008800c0, 0x0089c790, 0x004aade0, 1, 0x8, 2, 0xf5],
  [0x00880b80, 0x0089c6f0, 0x0085dd90, 1, 0x8, 2, 0xf5],
  [0x00881390, 0x0089bf10, 0x00000000, 2, 0x8, 0, 0x9e],
  [0x00882f90, 0x0089c0a0, 0x00782160, 1, 0x8, 0, 0x5b],
  [0x00883220, 0x0089bf10, 0x00423950, 1, 0x8, 2, 0xf5],
  [0x00886d80, 0x0089b380, 0x006c2750, 1, 0x8, 0, 0x5b],
  [0x00887570, 0x0089b1e0, 0x00000000, 2, 0x8, 2, 0xf0],
  [0x00888a10, 0x0089a8b0, 0x0096fd60, 1, 0x8, 0, 0x5b],
  [0x0088a580, 0x0089a5d0, 0x00709df0, 1, 0x8, 2, 0xf5],
  [0x0088e5c0, 0x00899a50, 0x00872000, 1, 0x8, 2, 0xf5],
  [0x0088e9e0, 0x008c20d0, 0x00000000, 2, 0xc, 2, 0xf0],
  [0x0088ead0, 0x008c2130, 0x00000000, 2, 0xc, 2, 0xf0],
  [0x0088ebc0, 0x008c2190, 0x00000004, 0, 0xc, 2, 0xf5],
  [0x0088ecc0, 0x008c2220, 0x00000014, 0, 0xc, 2, 0xf5],
  [0x0088edc0, 0x008c2290, 0x00000000, 2, 0xc, 2, 0xf0],
  [0x0088eeb0, 0x008999e0, 0x00872040, 1, 0x8, 2, 0xf5],
  [0x0088efb0, 0x00899930, 0x00872020, 1, 0x8, 2, 0xf5],
  [0x0088f0b0, 0x008c22f0, 0x00000044, 0, 0xc, 2, 0xf5],
  [0x0088f1b0, 0x008c2350, 0x00000000, 2, 0xc, 2, 0xf0],
].map(Object.freeze));

/** @param {number} index */
export function luaEngineInlineInstallerCount() {
  return LUA_INLINE_INSTALLERS.length;
}
function inlineInstallerAt(index) {
  const i = index | 0;
  return i >= 0 && i < LUA_INLINE_INSTALLERS.length ? LUA_INLINE_INSTALLERS[i] : null;
}
function inlineOrphanAt(index) {
  const i = index | 0;
  return i >= 0 && i < LUA_INLINE_ORPHANS.length ? LUA_INLINE_ORPHANS[i] : null;
}
export function luaEngineInlineInstallerVa(i) {
  const r = inlineInstallerAt(i); return r ? r[II_VA] >>> 0 : 0;
}
export function luaEngineInlineInstallerBody(i) {
  const r = inlineInstallerAt(i); return r ? r[II_BODY] >>> 0 : 0;
}
export function luaEngineInlineInstallerUdValue(i) {
  const r = inlineInstallerAt(i); return r ? r[II_UD] >>> 0 : 0;
}
export function luaEngineInlineInstallerUdDiscipline(i) {
  const r = inlineInstallerAt(i); return r ? r[II_DISC] | 0 : -1;
}
export function luaEngineInlineInstallerRetImm(i) {
  const r = inlineInstallerAt(i); return r ? r[II_RET] >>> 0 : 0;
}
export function luaEngineInlineInstallerPropgetPushes(i) {
  const r = inlineInstallerAt(i); return r ? r[II_PG] | 0 : -1;
}
export function luaEngineInlineInstallerSize(i) {
  const r = inlineInstallerAt(i); return r ? r[II_SIZE] >>> 0 : 0;
}
export function luaEngineInlineInstallerIndexForVa(va) {
  const t = va >>> 0;
  for (let i = 0; i < LUA_INLINE_INSTALLERS.length; i += 1) {
    if ((LUA_INLINE_INSTALLERS[i][II_VA] >>> 0) === t) return i;
  }
  return -1;
}
export function luaEngineInlineOrphanVa(i) {
  const r = inlineOrphanAt(i); return r ? r[IO_VA] >>> 0 : 0;
}
export function luaEngineInlineOrphanBand(i) {
  const r = inlineOrphanAt(i); return r ? r[IO_BAND] | 0 : -1;
}
export function luaEngineInlineOrphanClassKey(i) {
  const r = inlineOrphanAt(i); return r ? r[IO_KEY] >>> 0 : 0;
}
export function luaEngineInlineOrphanCallsUpvalue(i) {
  const r = inlineOrphanAt(i); return r ? r[IO_CALLS] | 0 : -1;
}
export function luaEngineInlineOrphanReturnValue(i) {
  const r = inlineOrphanAt(i); return r ? r[IO_RET] | 0 : -1;
}
export function luaEngineInlineOrphanCheckCount(i) {
  const r = inlineOrphanAt(i); return r ? r[IO_CHECKS] | 0 : -1;
}
export function luaEngineInlineOrphanSize(i) {
  const r = inlineOrphanAt(i); return r ? r[IO_SIZE] >>> 0 : 0;
}
export function luaEngineInlineOrphanIndexForVa(va) {
  const t = va >>> 0;
  for (let i = 0; i < LUA_INLINE_ORPHANS.length; i += 1) {
    if ((LUA_INLINE_ORPHANS[i][IO_VA] >>> 0) === t) return i;
  }
  return -1;
}

/** Pure discipline classifier for a ud immediate, resolved via section table.
 *  uint32 in, re-narrowed; must handle UNMASKED wide values.
 *  @param {number} udValue */
export function luaEngineInlineUdDisciplineForValue(udValue) {
  const value = udValue >>> 0;
  if (value < (LUA_INLINE_FIELD_OFFSET_LIMIT >>> 0)) {
    return LUA_INLINE_UD_FIELD_OFFSET;
  }
  if (value >= (LUA_INLINE_TEXT_LO >>> 0) && value < (LUA_INLINE_TEXT_HI >>> 0)) {
    return LUA_INLINE_UD_CODE_PTR;
  }
  return -1;
}

/* ---------------------------------------------------------------------
 * v24: band C closes the property-accessor surface; whole-image census.
 * Independently transcribed from the PE census evidence (installer
 * disassembly + branch-aware install-record parse), NOT from the C++.
 *
 * Census: every lua_pushcclosure reach site in .text (FF15 + thunk +
 * mov reg,[slot]/call reg), function-scoped table context (last rawget
 * keyed __propget/__propset), branch-aware body collection. In-function
 * route: 379 distinct bodies. Stack-threaded chain route (v23's 4 unique
 * chain orphans): +4. REAL TOTAL 383 = v22 326 + v23 21 + v24 36.
 * v24 = band C 26 getters + fourth region 10 (6 get / 4 set).
 * ------------------------------------------------------------------- */

export const LUA_ACCESSOR_SURFACE_TOTAL = 383;
export const LUA_ACCESSOR_SURFACE_V22 = 326;
export const LUA_ACCESSOR_SURFACE_V23 = 21;
export const LUA_ACCESSOR_SURFACE_V24 = 36;
export const LUA_ACCESSOR_SURFACE_IN_FUNCTION = 379;
export const LUA_ACCESSOR_SURFACE_CHAIN = 4;
export const LUA_ACCESSOR_SURFACE_COMPLETE = 1;

export const LUA_INLINE_UD_STACKVAL = 3;
export const LUA_INLINE_UD_DATA_PTR = 4;
export const LUA_ACCESSOR_ROLE_GET = 0;
export const LUA_ACCESSOR_ROLE_SET = 1;
export const LUA_BAND_C_SHAPE_PRIMARY = 0;
export const LUA_BAND_C_SHAPE_SECONDARY = 1;

export const LUA_BAND_C_COUNT = 26;
export const LUA_BAND_C_PRIMARY_COUNT = 10;
export const LUA_BAND_C_SECONDARY_COUNT = 16;
export const LUA_BAND_C_PRIMARY_BYTES = 0x5c;
export const LUA_BAND_C_SECONDARY_BYTES = 0xa4;
export const LUA_BAND_C_LO_VA = 0x008c32d0;
export const LUA_BAND_C_HI_VA = 0x008c59d0;
export const LUA_BAND_C_INSTALLER_COUNT = 10;
export const LUA_BAND_C_INSTALLER_LO_VA = 0x0087a010;
export const LUA_BAND_C_INSTALLER_HI_VA = 0x00891750;
export const LUA_BAND_C_CLASS_KEY_LO = 0x00c82a2d;
export const LUA_BAND_C_CLASS_KEY_HI = 0x00c82a47;
export const LUA_BAND_C_CLASS_CHECK_VA = 0x0085c590;
export const LUA_BAND_C_PUSH_I32_VA = 0x0085bff0;
export const LUA_BAND_C_EXAMPLE_BODY_VA = 0x008c32d0;
export const LUA_BAND_C_EXAMPLE_UD_VA = 0x0040c3a0;
export const LUA_BAND_C_EXAMPLE_INSTALLER_VA = 0x00891750;

export const LUA_FOURTH_COUNT = 10;
export const LUA_FOURTH_NEW_VS_V23 = 9;
export const LUA_FOURTH_GETTERS = 6;
export const LUA_FOURTH_SETTERS = 4;
export const LUA_FOURTH_INSTALLER_COUNT = 6;
export const LUA_FOURTH_PAIR_INSTALLER_COUNT = 5;
export const LUA_FOURTH_LAW_COUNTEREXAMPLES = 7;
export const LUA_FOURTH_DUAL_DISCIPLINE = 2;
export const LUA_FOURTH_SHARED_SETTER_VA = 0x0085cad0;
export const LUA_FOURTH_STRADDLER_VA = 0x008a0600;
export const LUA_FOURTH_LO_VA = 0x0085cad0;
export const LUA_FOURTH_HI_VA = 0x008a0600;

export const LUA_UD_BIT_FIELD_OFFSET = 1 << 0;
export const LUA_UD_BIT_CODE_PTR = 1 << 1;
export const LUA_UD_BIT_CALLER_ARG = 1 << 2;
export const LUA_UD_BIT_STACKVAL = 1 << 3;
export const LUA_UD_BIT_DATA_PTR = 1 << 4;

// Band C rows: [va, shape, classKey, udValue(CODE_PTR imm), installerVa, bytes]
const BC_VA = 0, BC_SHAPE = 1, BC_KEY = 2, BC_UD = 3, BC_INST = 4, BC_BYTES = 5;
export const LUA_BAND_C_ROWS = Object.freeze([
  [0x008c32d0, 0, 0x00c82a30, 0x0040c3a0, 0x00891750, 0x5c],
  [0x008c3330, 0, 0x00c82a3c, 0x0040c3a0, 0x00891490, 0x5c],
  [0x008c3390, 0, 0x00c82a33, 0x0040c3a0, 0x0088dc30, 0x5c],
  [0x008c33f0, 0, 0x00c82a36, 0x0040c3a0, 0x0088d970, 0x5c],
  [0x008c3450, 0, 0x00c82a45, 0x007dca60, 0x0087c200, 0x5c],
  [0x008c34b0, 0, 0x00c82a47, 0x0042f160, 0x0087bbd0, 0x5c],
  [0x008c3510, 0, 0x00c82a2d, 0x0089e390, 0x0087a940, 0x5c],
  [0x008c3570, 0, 0x00c82a3f, 0x00417840, 0x0087a630, 0x5c],
  [0x008c35d0, 0, 0x00c82a43, 0x00417840, 0x0087a320, 0x5c],
  [0x008c3630, 0, 0x00c82a41, 0x00417840, 0x0087a010, 0x5c],
  [0x008c4e90, 1, 0x00c82a41, 0x008a8080, 0x0087a010, 0xa4],
  [0x008c4f50, 1, 0x00c82a41, 0x008a8080, 0x0087a010, 0xa4],
  [0x008c5010, 1, 0x00c82a43, 0x008a8080, 0x0087a320, 0xa4],
  [0x008c50d0, 1, 0x00c82a43, 0x008a8080, 0x0087a320, 0xa4],
  [0x008c5190, 1, 0x00c82a3f, 0x008a8080, 0x0087a630, 0xa4],
  [0x008c5250, 1, 0x00c82a3f, 0x008a8080, 0x0087a630, 0xa4],
  [0x008c5310, 1, 0x00c82a2d, 0x0089e350, 0x0087a940, 0xa4],
  [0x008c53d0, 1, 0x00c82a2d, 0x0089e350, 0x0087a940, 0xa4],
  [0x008c5490, 1, 0x00c82a47, 0x008a8050, 0x0087bbd0, 0xa4],
  [0x008c5550, 1, 0x00c82a47, 0x008a8050, 0x0087bbd0, 0xa4],
  [0x008c5610, 1, 0x00c82a45, 0x008a8020, 0x0087c200, 0xa4],
  [0x008c56d0, 1, 0x00c82a45, 0x008a8020, 0x0087c200, 0xa4],
  [0x008c5790, 1, 0x00c82a36, 0x008a0720, 0x0088d970, 0xa4],
  [0x008c5850, 1, 0x00c82a33, 0x008a0700, 0x0088dc30, 0xa4],
  [0x008c5910, 1, 0x00c82a3c, 0x00899790, 0x00891490, 0xa4],
  [0x008c59d0, 1, 0x00c82a30, 0x00899770, 0x00891750, 0xa4],
].map(Object.freeze));

// Fourth rows: [va, role, callsUpvalue, discMask, codeUd, classKey, ret, bytes]
const F4_VA = 0, F4_ROLE = 1, F4_CALLS = 2, F4_MASK = 3, F4_CODEUD = 4,
      F4_KEY = 5, F4_RET = 6, F4_BYTES = 7;
export const LUA_FOURTH_ROWS = Object.freeze([
  [0x0085cad0, 1, 0, 0x0c, 0x00000000, 0x00000000, -1, 0x203],
  [0x008976a0, 0, 1, 0x02, 0x0085eee0, 0x00000000, 1, 0x31],
  [0x008976f0, 1, 1, 0x04, 0x00000000, 0x00000000, 0, 0x32],
  [0x00897730, 1, 1, 0x04, 0x00000000, 0x00000000, 0, 0x37],
  [0x00897770, 0, 1, 0x04, 0x00000000, 0x00000000, 1, 0x30],
  [0x008977a0, 1, 1, 0x04, 0x00000000, 0x00000000, 0, 0x4d],
  [0x00897930, 0, 1, 0x04, 0x00000000, 0x00000000, 1, 0x36],
  [0x00898f50, 0, 1, 0x04, 0x00000000, 0x00000000, 1, 0x29],
  [0x008991a0, 0, 1, 0x06, 0x009e9ab0, 0x00000000, 1, 0x29],
  [0x008a0600, 0, 1, 0x02, 0x0040c3a0, 0x00c8297d, 1, 0x88],
].map(Object.freeze));

function bandCAt(index) {
  const i = index | 0;
  return i >= 0 && i < LUA_BAND_C_ROWS.length ? LUA_BAND_C_ROWS[i] : null;
}
function fourthAt(index) {
  const i = index | 0;
  return i >= 0 && i < LUA_FOURTH_ROWS.length ? LUA_FOURTH_ROWS[i] : null;
}

export function luaEngineBandCCount() {
  return LUA_BAND_C_ROWS.length;
}
export function luaEngineBandCVa(i) {
  const r = bandCAt(i); return r ? r[BC_VA] >>> 0 : 0;
}
export function luaEngineBandCShape(i) {
  const r = bandCAt(i); return r ? r[BC_SHAPE] | 0 : -1;
}
export function luaEngineBandCBodyBytes(i) {
  const r = bandCAt(i); return r ? r[BC_BYTES] >>> 0 : 0;
}
export function luaEngineBandCClassKey(i) {
  const r = bandCAt(i); return r ? r[BC_KEY] >>> 0 : 0;
}
export function luaEngineBandCUdValue(i) {
  const r = bandCAt(i); return r ? r[BC_UD] >>> 0 : 0;
}
/** Discipline derived from the value through the section-table classifier,
 *  never assumed. All band C ud values are .text immediates. */
export function luaEngineBandCUdDiscipline(i) {
  const r = bandCAt(i);
  return r ? luaEngineInlineUdDisciplineForValue(r[BC_UD] >>> 0) : -1;
}
export function luaEngineBandCInstallerVa(i) {
  const r = bandCAt(i); return r ? r[BC_INST] >>> 0 : 0;
}
/** every band C body does `mov edx,[ud] ; call edx`. */
export function luaEngineBandCCallsUpvalue(i) {
  return bandCAt(i) ? 1 : -1;
}
export function luaEngineBandCReturnValue(i) {
  return bandCAt(i) ? 1 : -1;
}
export function luaEngineBandCRole(i) {
  return bandCAt(i) ? LUA_ACCESSOR_ROLE_GET : -1;
}
export function luaEngineBandCIndexForVa(va) {
  const t = va >>> 0;
  for (let i = 0; i < LUA_BAND_C_ROWS.length; i += 1) {
    if ((LUA_BAND_C_ROWS[i][BC_VA] >>> 0) === t) return i;
  }
  return -1;
}

export function luaEngineFourthCount() {
  return LUA_FOURTH_ROWS.length;
}
export function luaEngineFourthVa(i) {
  const r = fourthAt(i); return r ? r[F4_VA] >>> 0 : 0;
}
export function luaEngineFourthRole(i) {
  const r = fourthAt(i); return r ? r[F4_ROLE] | 0 : -1;
}
export function luaEngineFourthCallsUpvalue(i) {
  const r = fourthAt(i); return r ? r[F4_CALLS] | 0 : -1;
}
export function luaEngineFourthDisciplineMask(i) {
  const r = fourthAt(i); return r ? r[F4_MASK] | 0 : -1;
}
export function luaEngineFourthCodeUdValue(i) {
  const r = fourthAt(i); return r ? r[F4_CODEUD] >>> 0 : 0;
}
export function luaEngineFourthClassKey(i) {
  const r = fourthAt(i); return r ? r[F4_KEY] >>> 0 : 0;
}
export function luaEngineFourthReturnValue(i) {
  const r = fourthAt(i); return r ? r[F4_RET] | 0 : -2;
}
export function luaEngineFourthBodyBytes(i) {
  const r = fourthAt(i); return r ? r[F4_BYTES] >>> 0 : 0;
}
export function luaEngineFourthIndexForVa(va) {
  const t = va >>> 0;
  for (let i = 0; i < LUA_FOURTH_ROWS.length; i += 1) {
    if ((LUA_FOURTH_ROWS[i][F4_VA] >>> 0) === t) return i;
  }
  return -1;
}
/** 1 iff the body calls its upvalue as a function yet has a CALLER_ARG
 *  install site â€” the counterexample class to v23's both-sided law. */
export function luaEngineFourthIsLawCounterexample(i) {
  const r = fourthAt(i);
  if (!r) return -1;
  const callerArg = (r[F4_MASK] & LUA_UD_BIT_CALLER_ARG) !== 0;
  return r[F4_CALLS] === 1 && callerArg ? 1 : 0;
}

/** Site-level discipline classifier (v24). A site with no newuserdata in its
 *  install record captured a pushstring value (STACKVAL); a register write is
 *  CALLER_ARG; otherwise the immediate classifies through the section table,
 *  falling back to DATA_PTR. uint32 in, re-narrowed; drive UNMASKED.
 *  @param {number} udValue @param {number} isRegister
 *  @param {number} hasNewuserdata */
export function luaEngineAccessorSiteDiscipline(udValue, isRegister,
                                                hasNewuserdata) {
  const value = udValue >>> 0;
  if ((hasNewuserdata | 0) === 0) {
    return LUA_INLINE_UD_STACKVAL;
  }
  if ((isRegister | 0) !== 0) {
    return LUA_INLINE_UD_CALLER_ARG;
  }
  const imm = luaEngineInlineUdDisciplineForValue(value);
  if (imm >= 0) {
    return imm;
  }
  return LUA_INLINE_UD_DATA_PTR;
}

/* ---- ABI v27: first band-C primary BODY 0x008c32d0 pure islands
 * (transcribed this unit from the PE; body stays host).
 * lua_type(L, 1) via IAT 0xb18400; test eax,eax / jne (FULL-WORD);
 * type==0 -> this=0, skip check; else push flag 1, key 0xc82a30,
 * edx=1, ecx=L, call 0x85c590, this=[eax+4];
 * lua_touserdata(L, 0xfff0b9d7); ecx=this; edx=[ud]; call edx;
 * 0x85bff0(L, result); ret 1. Nil receiver STILL calls the upvalue.
 * ---------------------------------------------------------------------- */
export const LUA_BAND_C_PRIMARY_BODY_VA = 0x008c32d0;
export const LUA_BAND_C_PRIMARY_TYPE_INDEX = 1;
export const LUA_BAND_C_PRIMARY_CHECK_FLAG = 1;
export const LUA_BAND_C_PRIMARY_CHECK_STACK_INDEX = 1;
export const LUA_BAND_C_PRIMARY_CLASS_KEY = 0x00c82a30;
export const LUA_BAND_C_PRIMARY_OBJECT_FIELD_OFF = 4;
export const LUA_BAND_C_PRIMARY_TOUSERDATA_INDEX_U32 = 0xfff0b9d7;
export const LUA_BAND_C_PRIMARY_IAT_LUA_TYPE = 0x00b18400;
export const LUA_BAND_C_PRIMARY_IAT_LUA_TOUSERDATA = 0x00b183b0;
export const LUA_BAND_C_PRIMARY_RETURN = 1;
export const LUA_BAND_C_PRIMARY_NIL_STILL_CALLS = 1;
export const LUA_BAND_C_NEXT_PRIMARY_VA = 0x008c4e90;

export function luaEngineBandCPrimaryVa() {
  return LUA_BAND_C_PRIMARY_BODY_VA >>> 0;
}
export function luaEngineBandCPrimaryTypeIndex() {
  return LUA_BAND_C_PRIMARY_TYPE_INDEX >>> 0;
}
/* PE 0x8c32e4: test eax,eax; jne - FULL-WORD. 0x100 takes the check. */
export function luaEngineBandCPrimaryTypeGateTaken(luaTypeResult) {
  return (luaTypeResult >>> 0) !== 0 ? 1 : 0;
}
/* this = (type != 0) ? checked_this : 0. Drive UNMASKED. */
export function luaEngineBandCPrimaryThis(luaTypeResult, checkedThis) {
  return (luaTypeResult >>> 0) !== 0 ? (checkedThis >>> 0) : 0;
}
export function luaEngineBandCPrimaryNilStillCalls() {
  return LUA_BAND_C_PRIMARY_NIL_STILL_CALLS;
}
export function luaEngineBandCPrimaryCheckFlag() {
  return LUA_BAND_C_PRIMARY_CHECK_FLAG >>> 0;
}
export function luaEngineBandCPrimaryCheckStackIndex() {
  return LUA_BAND_C_PRIMARY_CHECK_STACK_INDEX >>> 0;
}
export function luaEngineBandCPrimaryClassKey() {
  return LUA_BAND_C_PRIMARY_CLASS_KEY >>> 0;
}
export function luaEngineBandCPrimaryObjectFieldOff() {
  return LUA_BAND_C_PRIMARY_OBJECT_FIELD_OFF >>> 0;
}
export function luaEngineBandCPrimaryTouserdataIndex() {
  return LUA_BAND_C_PRIMARY_TOUSERDATA_INDEX_U32 >>> 0;
}
export function luaEngineBandCPrimaryIatLuaType() {
  return LUA_BAND_C_PRIMARY_IAT_LUA_TYPE >>> 0;
}
export function luaEngineBandCPrimaryIatLuaTouserdata() {
  return LUA_BAND_C_PRIMARY_IAT_LUA_TOUSERDATA >>> 0;
}
export function luaEngineBandCPrimaryPushVa() {
  return LUA_BAND_C_PUSH_I32_VA >>> 0;
}
export function luaEngineBandCPrimaryReturnValue() {
  return LUA_BAND_C_PRIMARY_RETURN >>> 0;
}
export function luaEngineBandCNextVa() {
  return LUA_BAND_C_NEXT_VA >>> 0;
}

/* ---- ABI v28: band-C primary template (10 x 0x5c, stride 0x60)
 * Byte-diff vs 0x008c32d0: 87/92 identical. Union diffs only at +0x1f
 * (push class-key imm32) and the two E8 rel32s (+0x2b -> 0x0085c590,
 * +0x4f -> 0x0085bff0). Shared CF is the v27 law (type gate / this /
 * nil-still-calls / touserdata / IATs / ret). Per-index: VA law and
 * class key from LUA_BAND_C_ROWS[i]. identify-zhl: no exact match.
 * ---------------------------------------------------------------------- */
export const LUA_BAND_C_PRIMARY_STRIDE = 0x60;
export const LUA_BAND_C_PRIMARY_IDENTICAL_BYTES = 87;
export const LUA_BAND_C_PRIMARY_DIFF_OFF_KEY = 0x1f;
export const LUA_BAND_C_PRIMARY_DIFF_OFF_CHECK_REL = 0x2b;
export const LUA_BAND_C_PRIMARY_DIFF_OFF_PUSH_REL = 0x4f;

export function luaEngineBandCPrimaryStride() {
  return LUA_BAND_C_PRIMARY_STRIDE >>> 0;
}
export function luaEngineBandCPrimaryIdenticalBytes() {
  return LUA_BAND_C_PRIMARY_IDENTICAL_BYTES >>> 0;
}
export function luaEngineBandCPrimaryVaAt(index) {
  const i = index | 0;
  if (i < 0 || i >= LUA_BAND_C_PRIMARY_COUNT) return 0;
  return (LUA_BAND_C_PRIMARY_BODY_VA + LUA_BAND_C_PRIMARY_STRIDE * i) >>> 0;
}
export function luaEngineBandCPrimaryClassKeyAt(index) {
  const i = index | 0;
  if (i < 0 || i >= LUA_BAND_C_PRIMARY_COUNT) return 0;
  return luaEngineBandCClassKey(i);
}
export function luaEngineBandCPrimaryIndexForVa(va) {
  const t = va >>> 0;
  const base = LUA_BAND_C_PRIMARY_BODY_VA >>> 0;
  const stride = LUA_BAND_C_PRIMARY_STRIDE >>> 0;
  if (t < base) return -1;
  const delta = (t - base) >>> 0;
  if (delta % stride !== 0) return -1;
  const i = (delta / stride) >>> 0;
  if (i >= LUA_BAND_C_PRIMARY_COUNT) return -1;
  return i | 0;
}

/* ---- ABI v29: band-C secondary template (16 x 0xa4, stride 0xc0)
 * Byte-diff vs 0x008c4e90: 158/164 identical. Union diffs only at
 * +0x25 (check-flag imm8), +0x27 (class-key imm32), +0x33 (E8 rel32
 * -> 0x0085c590), +0x74 (wrap-key imm32). Shared CF is the v27 law
 * plus luaL_checkinteger(2), FULL-WORD result-null gate (0x100 is
 * NON-null), userdata(8)+tag 0xb753c8+field +4, rawgetp
 * REGISTRYINDEX / setmetatable(-2). Null path pushnil still ret 1.
 * identify-zhl: no exact match. Transcribed this unit from the PE.
 * ---------------------------------------------------------------------- */
export const LUA_BAND_C_SECONDARY_BODY_VA = 0x008c4e90;
export const LUA_BAND_C_SECONDARY_STRIDE = 0xc0;
export const LUA_BAND_C_SECONDARY_IDENTICAL_BYTES = 158;
export const LUA_BAND_C_SECONDARY_DIFF_OFF_FLAG = 0x25;
export const LUA_BAND_C_SECONDARY_DIFF_OFF_KEY = 0x27;
export const LUA_BAND_C_SECONDARY_DIFF_OFF_CHECK_REL = 0x33;
export const LUA_BAND_C_SECONDARY_DIFF_OFF_WRAP_KEY = 0x74;
export const LUA_BAND_C_SECONDARY_CHECKINTEGER_INDEX = 2;
export const LUA_BAND_C_SECONDARY_WRAP_UD_SIZE = 8;
export const LUA_BAND_C_SECONDARY_WRAP_TAG_VA = 0x00b753c8;
export const LUA_BAND_C_SECONDARY_WRAP_FIELD_OFF = 4;
export const LUA_BAND_C_SECONDARY_RAWGETP_REGISTRY_INDEX_U32 = 0xfff0b9d8;
export const LUA_BAND_C_SECONDARY_SETMETA_INDEX_U32 = 0xfffffffe;
export const LUA_BAND_C_SECONDARY_IAT_CHECKINTEGER = 0x00b183f4;
export const LUA_BAND_C_SECONDARY_IAT_NEWUSERDATA = 0x00b1839c;
export const LUA_BAND_C_SECONDARY_IAT_RAWGETP = 0x00b183bc;
export const LUA_BAND_C_SECONDARY_IAT_SETMETATABLE = 0x00b18398;
export const LUA_BAND_C_SECONDARY_IAT_PUSHNIL = 0x00b183e0;
export const LUA_BAND_C_SECONDARY_NULL_STILL_RETURNS = 1;
export const LUA_BAND_C_SECONDARY_RETURN = 1;
export const LUA_BAND_C_NEXT_VA = 0x008c5a90;

/* Wrap-key immediates at +0x74, PE order (independent of the C++ table). */
const BAND_C_SECONDARY_WRAP_KEYS = Object.freeze([
  0x00c82a4a, 0x00c82a49, 0x00c82a4c, 0x00c82a4b,
  0x00c82a4e, 0x00c82a4d, 0x00c829aa, 0x00c829a9,
  0x00c82980, 0x00c8297f, 0x00c829b6, 0x00c829b5,
  0x00c829fa, 0x00c829fd, 0x00c82a03, 0x00c82a4f,
]);
/* Check-flag imm8 at +0x25, PE order. */
const BAND_C_SECONDARY_CHECK_FLAGS = Object.freeze([
  0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1,
]);

export function luaEngineBandCSecondaryStride() {
  return LUA_BAND_C_SECONDARY_STRIDE >>> 0;
}
export function luaEngineBandCSecondaryIdenticalBytes() {
  return LUA_BAND_C_SECONDARY_IDENTICAL_BYTES >>> 0;
}
export function luaEngineBandCSecondaryVaAt(index) {
  const i = index | 0;
  if (i < 0 || i >= LUA_BAND_C_SECONDARY_COUNT) return 0;
  return (LUA_BAND_C_SECONDARY_BODY_VA + LUA_BAND_C_SECONDARY_STRIDE * i) >>> 0;
}
export function luaEngineBandCSecondaryClassKeyAt(index) {
  const i = index | 0;
  if (i < 0 || i >= LUA_BAND_C_SECONDARY_COUNT) return 0;
  return luaEngineBandCClassKey(LUA_BAND_C_PRIMARY_COUNT + i);
}
export function luaEngineBandCSecondaryCheckFlagAt(index) {
  const i = index | 0;
  if (i < 0 || i >= LUA_BAND_C_SECONDARY_COUNT) return 0;
  return BAND_C_SECONDARY_CHECK_FLAGS[i] >>> 0;
}
export function luaEngineBandCSecondaryWrapKeyAt(index) {
  const i = index | 0;
  if (i < 0 || i >= LUA_BAND_C_SECONDARY_COUNT) return 0;
  return BAND_C_SECONDARY_WRAP_KEYS[i] >>> 0;
}
export function luaEngineBandCSecondaryIndexForVa(va) {
  const t = va >>> 0;
  const base = LUA_BAND_C_SECONDARY_BODY_VA >>> 0;
  const stride = LUA_BAND_C_SECONDARY_STRIDE >>> 0;
  if (t < base) return -1;
  const delta = (t - base) >>> 0;
  if (delta % stride !== 0) return -1;
  const i = (delta / stride) >>> 0;
  if (i >= LUA_BAND_C_SECONDARY_COUNT) return -1;
  return i | 0;
}
/* PE 0x8c4ef6: test esi,esi / je - FULL-WORD. 0x100 is NON-null. */
export function luaEngineBandCSecondaryResultNullGate(result) {
  return (result >>> 0) === 0 ? 1 : 0;
}
export function luaEngineBandCSecondaryCheckintegerIndex() {
  return LUA_BAND_C_SECONDARY_CHECKINTEGER_INDEX >>> 0;
}
export function luaEngineBandCSecondaryWrapUdSize() {
  return LUA_BAND_C_SECONDARY_WRAP_UD_SIZE >>> 0;
}
export function luaEngineBandCSecondaryWrapTagVa() {
  return LUA_BAND_C_SECONDARY_WRAP_TAG_VA >>> 0;
}
export function luaEngineBandCSecondaryReturnValue() {
  return LUA_BAND_C_SECONDARY_RETURN >>> 0;
}

/* ---- ABI v30: leftover extra getter BODY 0x008a0600 pure islands
 * (transcribed this unit from the PE; body stays host).
 * v27 prefix: lua_type(L,1) IAT 0xb18400; FULL-WORD type gate;
 * type==0 -> this=0 still calls the upvalue; else check flag 1,
 * key 0xc8297d, edx=1, call 0x85c590, this=[eax+4];
 * touserdata 0xfff0b9d7; call [ud].
 * v29 wrap minus checkinteger: FULL-WORD result-null gate (0x100 is
 * NON-null), userdata(8)+tag 0xb753c8+field +4, rawgetp key 0xc8297a
 * / REGISTRYINDEX, setmetatable(-2). Null path pushnil still ret 1.
 * 0x008c5a90 classified dtor, not peeled. identify-zhl: no match.
 * v31 census: 0x008c5b90 is 10 release/unref
 * wrappers (class-key + 0x85c3e0 + vtbl[0](0); ret 0). Next
 * getter-shaped VA 0x008976a0 is peeled in ABI v31.
 * ---------------------------------------------------------------------- */
export const LUA_LEFTOVER_EXTRA_BODY_VA = 0x008a0600;
export const LUA_LEFTOVER_EXTRA_BODY_BYTES = 0x88;
export const LUA_LEFTOVER_EXTRA_CLASS_KEY = 0x00c8297d;
export const LUA_LEFTOVER_EXTRA_CHECK_FLAG = 1;
export const LUA_LEFTOVER_EXTRA_CHECK_STACK_INDEX = 1;
export const LUA_LEFTOVER_EXTRA_WRAP_KEY = 0x00c8297a;
export const LUA_LEFTOVER_EXTRA_CODE_UD_VA = 0x0040c3a0;
export const LUA_LEFTOVER_EXTRA_HAS_CHECKINTEGER = 0;
export const LUA_LEFTOVER_EXTRA_RETURN = 1;
export const LUA_LEFTOVER_EXTRA_NULL_STILL_RETURNS = 1;
export const LUA_DTOR_008C5A90_VA = 0x008c5a90;
export const LUA_LEFTOVER_EXTRA_NEXT_VA = 0x008c5b90;

export function luaEngineLeftoverExtraVa() {
  return LUA_LEFTOVER_EXTRA_BODY_VA >>> 0;
}
export function luaEngineLeftoverExtraBodyBytes() {
  return LUA_LEFTOVER_EXTRA_BODY_BYTES >>> 0;
}
export function luaEngineLeftoverExtraClassKey() {
  return LUA_LEFTOVER_EXTRA_CLASS_KEY >>> 0;
}
export function luaEngineLeftoverExtraCheckFlag() {
  return LUA_LEFTOVER_EXTRA_CHECK_FLAG >>> 0;
}
export function luaEngineLeftoverExtraWrapKey() {
  return LUA_LEFTOVER_EXTRA_WRAP_KEY >>> 0;
}
export function luaEngineLeftoverExtraCodeUdVa() {
  return LUA_LEFTOVER_EXTRA_CODE_UD_VA >>> 0;
}
export function luaEngineLeftoverExtraHasCheckinteger() {
  return LUA_LEFTOVER_EXTRA_HAS_CHECKINTEGER | 0;
}
/* PE 0x8a064c: test edi,edi / je - FULL-WORD. Reuses v29 law. */
export function luaEngineLeftoverExtraResultNullGate(result) {
  return luaEngineBandCSecondaryResultNullGate(result);
}
export function luaEngineLeftoverExtraReturnValue() {
  return LUA_LEFTOVER_EXTRA_RETURN >>> 0;
}
export function luaEngineLeftoverExtraNextVa() {
  return LUA_LEFTOVER_EXTRA_NEXT_VA >>> 0;
}

/* ---- ABI v31: fourth-region string getter BODY 0x008976a0
 * (transcribed this unit from the PE; body stays host).
 * Sibling hunt: nearby fourth bodies are different shapes
 * (setters / checkinteger / float / bool). Image-wide exact
 * 0x31-byte body: 1 hit. identify-zhl: no match.
 * touserdata(L, 0xfff0b9d7) IAT 0xb183b0; call [ud];
 * FULL-WORD result-null gate (v29 law BY REFERENCE; 0x100 is
 * NON-null); non-null lua_pushstring IAT 0xb18414; null
 * lua_pushnil IAT 0xb183e0; both ret 1.
 * No lua_type / this-select (v27 law is a different shape).
 * Distinct from v29 wrap: no userdata(8)/tag/rawgetp/setmetatable.
 * CODE_PTR ud 0x0085eee0. Next: 0x008976f0.
 * ---------------------------------------------------------------------- */
export const LUA_FOURTH_GETTER_BODY_VA = 0x008976a0;
export const LUA_FOURTH_GETTER_BODY_BYTES = 0x31;
export const LUA_FOURTH_GETTER_FULL_BYTES = 0x43;
export const LUA_FOURTH_GETTER_CODE_UD_VA = 0x0085eee0;
export const LUA_FOURTH_GETTER_TOUSERDATA_INDEX_U32 = 0xfff0b9d7;
export const LUA_FOURTH_GETTER_IAT_LUA_TOUSERDATA = 0x00b183b0;
export const LUA_FOURTH_GETTER_IAT_LUA_PUSHSTRING = 0x00b18414;
export const LUA_FOURTH_GETTER_IAT_LUA_PUSHNIL = 0x00b183e0;
export const LUA_FOURTH_GETTER_HAS_TYPE_GATE = 0;
export const LUA_FOURTH_GETTER_HAS_THIS_SELECT = 0;
export const LUA_FOURTH_GETTER_HAS_CHECKINTEGER = 0;
export const LUA_FOURTH_GETTER_SIBLING_COUNT = 1;
export const LUA_FOURTH_GETTER_NULL_STILL_RETURNS = 1;
export const LUA_FOURTH_GETTER_RETURN = 1;
export const LUA_FOURTH_GETTER_NEXT_VA = 0x008976f0;

export function luaEngineFourthGetterVa() {
  return LUA_FOURTH_GETTER_BODY_VA >>> 0;
}
export function luaEngineFourthGetterBodyBytes() {
  return LUA_FOURTH_GETTER_BODY_BYTES >>> 0;
}
export function luaEngineFourthGetterFullBytes() {
  return LUA_FOURTH_GETTER_FULL_BYTES >>> 0;
}
export function luaEngineFourthGetterCodeUdVa() {
  return LUA_FOURTH_GETTER_CODE_UD_VA >>> 0;
}
export function luaEngineFourthGetterTouserdataIndex() {
  return LUA_FOURTH_GETTER_TOUSERDATA_INDEX_U32 >>> 0;
}
export function luaEngineFourthGetterIatLuaTouserdata() {
  return LUA_FOURTH_GETTER_IAT_LUA_TOUSERDATA >>> 0;
}
export function luaEngineFourthGetterIatLuaPushstring() {
  return LUA_FOURTH_GETTER_IAT_LUA_PUSHSTRING >>> 0;
}
export function luaEngineFourthGetterIatLuaPushnil() {
  return LUA_FOURTH_GETTER_IAT_LUA_PUSHNIL >>> 0;
}
export function luaEngineFourthGetterHasTypeGate() {
  return LUA_FOURTH_GETTER_HAS_TYPE_GATE | 0;
}
export function luaEngineFourthGetterHasThisSelect() {
  return LUA_FOURTH_GETTER_HAS_THIS_SELECT | 0;
}
export function luaEngineFourthGetterHasCheckinteger() {
  return LUA_FOURTH_GETTER_HAS_CHECKINTEGER | 0;
}
export function luaEngineFourthGetterSiblingCount() {
  return LUA_FOURTH_GETTER_SIBLING_COUNT | 0;
}
/* PE 0x8976ba: test eax,eax / je - FULL-WORD. Reuses v29 law. */
export function luaEngineFourthGetterResultNullGate(result) {
  return luaEngineBandCSecondaryResultNullGate(result);
}
export function luaEngineFourthGetterReturnValue() {
  return LUA_FOURTH_GETTER_RETURN >>> 0;
}
export function luaEngineFourthGetterNextVa() {
  return LUA_FOURTH_GETTER_NEXT_VA >>> 0;
}

/* ---- ABI v32: fourth-region integer setter BODY 0x008976f0
 * (transcribed this unit from the PE; body stays host).
 * Sibling hunt: exact 0x32-byte body image-wide 1 hit. Nearby
 * fourth bodies are different shapes (0x00897730 toboolean,
 * 0x00897770 pushboolean, 0x008977a0 checknumber).
 * identify-zhl: no match. NOT the v31 0x31/0x43 getter.
 * touserdata(L, 0xfff0b9d7) IAT 0xb183b0 (v31 BY REFERENCE);
 * luaL_checkinteger(L, 1) IAT 0xb183f4 (v29 IAT BY REFERENCE;
 * index 1, not v29's 2); call [ud](integer); add esp,0x14;
 * xor eax,eax; ret 0.
 * No lua_type / this-select (v27 law is a different shape).
 * No FULL-WORD null gate / pushstring / pushnil (v31 getter is
 * a different shape). Always calls. Next: 0x00897730.
 * ---------------------------------------------------------------------- */
export const LUA_FOURTH_SETTER_BODY_VA = 0x008976f0;
export const LUA_FOURTH_SETTER_BODY_BYTES = 0x32;
export const LUA_FOURTH_SETTER_CHECKINTEGER_INDEX = 1;
export const LUA_FOURTH_SETTER_STACK_CLEAN = 0x14;
export const LUA_FOURTH_SETTER_HAS_TYPE_GATE = 0;
export const LUA_FOURTH_SETTER_HAS_THIS_SELECT = 0;
export const LUA_FOURTH_SETTER_HAS_NULL_GATE = 0;
export const LUA_FOURTH_SETTER_HAS_PUSH = 0;
export const LUA_FOURTH_SETTER_SIBLING_COUNT = 1;
export const LUA_FOURTH_SETTER_RETURN = 0;
export const LUA_FOURTH_SETTER_NEXT_VA = 0x00897730;

export function luaEngineFourthSetterVa() {
  return LUA_FOURTH_SETTER_BODY_VA >>> 0;
}
export function luaEngineFourthSetterBodyBytes() {
  return LUA_FOURTH_SETTER_BODY_BYTES >>> 0;
}
export function luaEngineFourthSetterCheckintegerIndex() {
  return LUA_FOURTH_SETTER_CHECKINTEGER_INDEX >>> 0;
}
export function luaEngineFourthSetterStackClean() {
  return LUA_FOURTH_SETTER_STACK_CLEAN >>> 0;
}
export function luaEngineFourthSetterTouserdataIndex() {
  return luaEngineFourthGetterTouserdataIndex();
}
export function luaEngineFourthSetterIatLuaTouserdata() {
  return luaEngineFourthGetterIatLuaTouserdata();
}
export function luaEngineFourthSetterIatCheckinteger() {
  return LUA_BAND_C_SECONDARY_IAT_CHECKINTEGER >>> 0;
}
export function luaEngineFourthSetterHasTypeGate() {
  return LUA_FOURTH_SETTER_HAS_TYPE_GATE | 0;
}
export function luaEngineFourthSetterHasThisSelect() {
  return LUA_FOURTH_SETTER_HAS_THIS_SELECT | 0;
}
export function luaEngineFourthSetterHasNullGate() {
  return LUA_FOURTH_SETTER_HAS_NULL_GATE | 0;
}
export function luaEngineFourthSetterHasPush() {
  return LUA_FOURTH_SETTER_HAS_PUSH | 0;
}
export function luaEngineFourthSetterSiblingCount() {
  return LUA_FOURTH_SETTER_SIBLING_COUNT | 0;
}
export function luaEngineFourthSetterReturnValue() {
  return LUA_FOURTH_SETTER_RETURN >>> 0;
}
export function luaEngineFourthSetterNextVa() {
  return LUA_FOURTH_SETTER_NEXT_VA >>> 0;
}

/* ---- ABI v33: fourth-region boolean setter BODY 0x00897730
 * (transcribed this unit from the PE; body stays host).
 * Sibling hunt: exact 0x37-byte body image-wide 1 hit.
 * touserdata+toboolean+setne mid: 1 hit. setne+call+ret0
 * tail: 1 hit. Nearby fourth bodies are different shapes
 * (0x00897770 pushboolean, 0x008977a0 checknumber).
 * identify-zhl: no match. NOT the v32 0x32 checkinteger setter.
 * touserdata(L, 0xfff0b9d7) IAT 0xb183b0 (v31 BY REFERENCE);
 * lua_toboolean(L, 1) IAT 0xb183e8 (v22 IAT BY REFERENCE);
 * FULL-WORD test eax,eax / setne (v22 boolean-normalize BY
 * REFERENCE); call [ud](bool); add esp,0x14; xor eax,eax; ret 0.
 * No FULL-WORD null gate / pushstring / pushnil (v31 getter is
 * a different shape). Always calls. Next: 0x00897770.
 * ---------------------------------------------------------------------- */
export const LUA_FOURTH_BOOL_SETTER_BODY_VA = 0x00897730;
export const LUA_FOURTH_BOOL_SETTER_BODY_BYTES = 0x37;
export const LUA_FOURTH_BOOL_SETTER_TOBOOLEAN_INDEX = 1;
export const LUA_FOURTH_BOOL_SETTER_STACK_CLEAN = 0x14;
export const LUA_FOURTH_BOOL_SETTER_HAS_TYPE_GATE = 0;
export const LUA_FOURTH_BOOL_SETTER_HAS_THIS_SELECT = 0;
export const LUA_FOURTH_BOOL_SETTER_HAS_NULL_GATE = 0;
export const LUA_FOURTH_BOOL_SETTER_HAS_PUSH = 0;
export const LUA_FOURTH_BOOL_SETTER_HAS_CHECKINTEGER = 0;
export const LUA_FOURTH_BOOL_SETTER_SIBLING_COUNT = 1;
export const LUA_FOURTH_BOOL_SETTER_RETURN = 0;
export const LUA_FOURTH_BOOL_SETTER_NEXT_VA = 0x00897770;

export function luaEngineFourthBoolSetterVa() {
  return LUA_FOURTH_BOOL_SETTER_BODY_VA >>> 0;
}
export function luaEngineFourthBoolSetterBodyBytes() {
  return LUA_FOURTH_BOOL_SETTER_BODY_BYTES >>> 0;
}
export function luaEngineFourthBoolSetterTobooleanIndex() {
  return LUA_FOURTH_BOOL_SETTER_TOBOOLEAN_INDEX >>> 0;
}
export function luaEngineFourthBoolSetterStackClean() {
  return LUA_FOURTH_BOOL_SETTER_STACK_CLEAN >>> 0;
}
export function luaEngineFourthBoolSetterTouserdataIndex() {
  return luaEngineFourthGetterTouserdataIndex();
}
export function luaEngineFourthBoolSetterIatLuaTouserdata() {
  return luaEngineFourthGetterIatLuaTouserdata();
}
export function luaEngineFourthBoolSetterIatLuaToboolean() {
  return LUA_PROPERTY_CLOSURE_IAT_LUA_TOBOOLEAN >>> 0;
}
export function luaEngineFourthBoolSetterHasTypeGate() {
  return LUA_FOURTH_BOOL_SETTER_HAS_TYPE_GATE | 0;
}
export function luaEngineFourthBoolSetterHasThisSelect() {
  return LUA_FOURTH_BOOL_SETTER_HAS_THIS_SELECT | 0;
}
export function luaEngineFourthBoolSetterHasNullGate() {
  return LUA_FOURTH_BOOL_SETTER_HAS_NULL_GATE | 0;
}
export function luaEngineFourthBoolSetterHasPush() {
  return LUA_FOURTH_BOOL_SETTER_HAS_PUSH | 0;
}
export function luaEngineFourthBoolSetterHasCheckinteger() {
  return LUA_FOURTH_BOOL_SETTER_HAS_CHECKINTEGER | 0;
}
export function luaEngineFourthBoolSetterSiblingCount() {
  return LUA_FOURTH_BOOL_SETTER_SIBLING_COUNT | 0;
}
/* PE 0x897750: test eax,eax / setne. Reuses v22 law. */
export function luaEngineFourthBoolSetterBooleanNormalize(v) {
  return luaEngineClosureBooleanNormalize(v);
}
export function luaEngineFourthBoolSetterReturnValue() {
  return LUA_FOURTH_BOOL_SETTER_RETURN >>> 0;
}
export function luaEngineFourthBoolSetterNextVa() {
  return LUA_FOURTH_BOOL_SETTER_NEXT_VA >>> 0;
}

/* ---- ABI v34: fourth-region boolean getter BODY 0x00897770
 * (transcribed this unit from the PE; body stays host).
 * Sibling hunt: exact 0x30-byte body to first ret. identify-zhl:
 * no match. Do not open 0x008977a0.
 * NOT the v33 0x37 boolean setter (FULL-WORD test eax,eax /
 * toboolean / ret 0 / stack 0x14). NOT the v31 0x31/0x43 string
 * getter (pushstring/pushnil + FULL-WORD null gate).
 * touserdata(L, 0xfff0b9d7) IAT 0xb183b0 (v31 BY REFERENCE);
 * call [ud](); BYTE test al,al / setne cl (NOT v22/v33
 * FULL-WORD); lua_pushboolean(L, cl) IAT 0xb183ec (v22 IAT BY
 * REFERENCE); add esp,0x10; mov eax,1; ret 1. Always calls.
 * Next: 0x008977a0.
 * ---------------------------------------------------------------------- */
export const LUA_FOURTH_BOOL_GETTER_BODY_VA = 0x00897770;
export const LUA_FOURTH_BOOL_GETTER_BODY_BYTES = 0x30;
export const LUA_FOURTH_BOOL_GETTER_STACK_CLEAN = 0x10;
export const LUA_FOURTH_BOOL_GETTER_HAS_TYPE_GATE = 0;
export const LUA_FOURTH_BOOL_GETTER_HAS_THIS_SELECT = 0;
export const LUA_FOURTH_BOOL_GETTER_HAS_NULL_GATE = 0;
export const LUA_FOURTH_BOOL_GETTER_HAS_CHECKINTEGER = 0;
export const LUA_FOURTH_BOOL_GETTER_SIBLING_COUNT = 1;
export const LUA_FOURTH_BOOL_GETTER_RETURN = 1;
export const LUA_FOURTH_BOOL_GETTER_NEXT_VA = 0x008977a0;

export function luaEngineFourthBoolGetterVa() {
  return LUA_FOURTH_BOOL_GETTER_BODY_VA >>> 0;
}
export function luaEngineFourthBoolGetterBodyBytes() {
  return LUA_FOURTH_BOOL_GETTER_BODY_BYTES >>> 0;
}
export function luaEngineFourthBoolGetterStackClean() {
  return LUA_FOURTH_BOOL_GETTER_STACK_CLEAN >>> 0;
}
export function luaEngineFourthBoolGetterTouserdataIndex() {
  return luaEngineFourthGetterTouserdataIndex();
}
export function luaEngineFourthBoolGetterIatLuaTouserdata() {
  return luaEngineFourthGetterIatLuaTouserdata();
}
export function luaEngineFourthBoolGetterIatLuaPushboolean() {
  return LUA_PROPERTY_CLOSURE_IAT_LUA_PUSHBOOLEAN >>> 0;
}
export function luaEngineFourthBoolGetterHasTypeGate() {
  return LUA_FOURTH_BOOL_GETTER_HAS_TYPE_GATE | 0;
}
export function luaEngineFourthBoolGetterHasThisSelect() {
  return LUA_FOURTH_BOOL_GETTER_HAS_THIS_SELECT | 0;
}
export function luaEngineFourthBoolGetterHasNullGate() {
  return LUA_FOURTH_BOOL_GETTER_HAS_NULL_GATE | 0;
}
export function luaEngineFourthBoolGetterHasCheckinteger() {
  return LUA_FOURTH_BOOL_GETTER_HAS_CHECKINTEGER | 0;
}
export function luaEngineFourthBoolGetterSiblingCount() {
  return LUA_FOURTH_BOOL_GETTER_SIBLING_COUNT | 0;
}
/* PE 0x897787: test al,al / setne cl. Low byte only. */
export function luaEngineFourthBoolGetterBooleanNormalize(v) {
  return ((v >>> 0) & 0xff) !== 0 ? 1 : 0;
}
export function luaEngineFourthBoolGetterReturnValue() {
  return LUA_FOURTH_BOOL_GETTER_RETURN >>> 0;
}
export function luaEngineFourthBoolGetterNextVa() {
  return LUA_FOURTH_BOOL_GETTER_NEXT_VA >>> 0;
}

/* ---- ABI v35: fourth-region number setter BODY 0x008977a0
 * (transcribed this unit from the PE; body stays host).
 * Sibling hunt: exact 0x4d-byte body to ret. identify-zhl:
 * no match. Do not open past int3 0x008977ed.
 * NOT the v32 0x32 integer setter (checknumber IAT 0xb18324,
 * not checkinteger 0xb183f4). NOT the v33/v34 toboolean /
 * pushboolean bodies.
 * touserdata(L, 0xfff0b9d7) IAT 0xb183b0 (v31 BY REFERENCE);
 * luaL_checknumber(L, 1) IAT 0xb18324 (v22 IAT BY REFERENCE);
 * fstp f32 + bit-stable dword reload; call [ud](f32);
 * add esp,0xc then add esp,4; xor eax,eax; ret 0. Always calls.
 * Next: 0x008977f0.
 * ---------------------------------------------------------------------- */
export const LUA_FOURTH_NUMBER_SETTER_BODY_VA = 0x008977a0;
export const LUA_FOURTH_NUMBER_SETTER_BODY_BYTES = 0x4d;
export const LUA_FOURTH_NUMBER_SETTER_CHECKNUMBER_INDEX = 1;
export const LUA_FOURTH_NUMBER_SETTER_STACK_CLEAN = 0x0c;
export const LUA_FOURTH_NUMBER_SETTER_STACK_CLEAN_HOST = 0x04;
export const LUA_FOURTH_NUMBER_SETTER_HAS_TYPE_GATE = 0;
export const LUA_FOURTH_NUMBER_SETTER_HAS_THIS_SELECT = 0;
export const LUA_FOURTH_NUMBER_SETTER_HAS_NULL_GATE = 0;
export const LUA_FOURTH_NUMBER_SETTER_HAS_PUSH = 0;
export const LUA_FOURTH_NUMBER_SETTER_HAS_CHECKINTEGER = 0;
export const LUA_FOURTH_NUMBER_SETTER_SIBLING_COUNT = 1;
export const LUA_FOURTH_NUMBER_SETTER_RETURN = 0;
export const LUA_FOURTH_NUMBER_SETTER_NEXT_VA = 0x008977f0;

export function luaEngineFourthNumberSetterVa() {
  return LUA_FOURTH_NUMBER_SETTER_BODY_VA >>> 0;
}
export function luaEngineFourthNumberSetterBodyBytes() {
  return LUA_FOURTH_NUMBER_SETTER_BODY_BYTES >>> 0;
}
export function luaEngineFourthNumberSetterChecknumberIndex() {
  return LUA_FOURTH_NUMBER_SETTER_CHECKNUMBER_INDEX >>> 0;
}
export function luaEngineFourthNumberSetterStackClean() {
  return LUA_FOURTH_NUMBER_SETTER_STACK_CLEAN >>> 0;
}
export function luaEngineFourthNumberSetterStackCleanHost() {
  return LUA_FOURTH_NUMBER_SETTER_STACK_CLEAN_HOST >>> 0;
}
export function luaEngineFourthNumberSetterTouserdataIndex() {
  return luaEngineFourthGetterTouserdataIndex();
}
export function luaEngineFourthNumberSetterIatLuaTouserdata() {
  return luaEngineFourthGetterIatLuaTouserdata();
}
export function luaEngineFourthNumberSetterIatChecknumber() {
  return LUA_PROPERTY_CLOSURE_IAT_LUAL_CHECKNUMBER >>> 0;
}
export function luaEngineFourthNumberSetterHasTypeGate() {
  return LUA_FOURTH_NUMBER_SETTER_HAS_TYPE_GATE | 0;
}
export function luaEngineFourthNumberSetterHasThisSelect() {
  return LUA_FOURTH_NUMBER_SETTER_HAS_THIS_SELECT | 0;
}
export function luaEngineFourthNumberSetterHasNullGate() {
  return LUA_FOURTH_NUMBER_SETTER_HAS_NULL_GATE | 0;
}
export function luaEngineFourthNumberSetterHasPush() {
  return LUA_FOURTH_NUMBER_SETTER_HAS_PUSH | 0;
}
export function luaEngineFourthNumberSetterHasCheckinteger() {
  return LUA_FOURTH_NUMBER_SETTER_HAS_CHECKINTEGER | 0;
}
export function luaEngineFourthNumberSetterSiblingCount() {
  return LUA_FOURTH_NUMBER_SETTER_SIBLING_COUNT | 0;
}
/* PE 0x8977ce..0x8977d2: mov ecx,[esp+0xc]; mov [esp+0xc],ecx.
   Bit-stable f32 store-reload. Drive UNMASKED. */
export function luaEngineFourthNumberSetterF32Bits(bits) {
  return bits >>> 0;
}
export function luaEngineFourthNumberSetterReturnValue() {
  return LUA_FOURTH_NUMBER_SETTER_RETURN >>> 0;
}
export function luaEngineFourthNumberSetterNextVa() {
  return LUA_FOURTH_NUMBER_SETTER_NEXT_VA >>> 0;
}

/* ---- ABI v36: fourth-region number getter BODY 0x00897930
 * (transcribed this unit from the PE; body stays host).
 * Skip 0x008977f0 (6-IAT userdata ctor). Do not open 0x00897970.
 * touserdata(L, 0xfff0b9d7) IAT 0xb183b0 BY REFERENCE from v31;
 * call [ud](); fstp f32; movss xmm1; call 0x85c050 (host, stays
 * host); mov eax,1; ret 1. Always calls. Image-wide 1 site.
 * ---------------------------------------------------------------------- */
export const LUA_FOURTH_NUMBER_GETTER_BODY_VA = 0x00897930;
export const LUA_FOURTH_NUMBER_GETTER_BODY_BYTES = 0x36;
export const LUA_FOURTH_NUMBER_GETTER_HOST_VA_PUSH = 0x0085c050;
export const LUA_FOURTH_NUMBER_GETTER_HAS_TYPE_GATE = 0;
export const LUA_FOURTH_NUMBER_GETTER_HAS_THIS_SELECT = 0;
export const LUA_FOURTH_NUMBER_GETTER_HAS_NULL_GATE = 0;
export const LUA_FOURTH_NUMBER_GETTER_HAS_CHECKINTEGER = 0;
export const LUA_FOURTH_NUMBER_GETTER_SIBLING_COUNT = 1;
export const LUA_FOURTH_NUMBER_GETTER_RETURN = 1;
export const LUA_FOURTH_NUMBER_GETTER_NEXT_VA = 0x00897970;

export function luaEngineFourthNumberGetterVa() {
  return LUA_FOURTH_NUMBER_GETTER_BODY_VA >>> 0;
}
export function luaEngineFourthNumberGetterBodyBytes() {
  return LUA_FOURTH_NUMBER_GETTER_BODY_BYTES >>> 0;
}
export function luaEngineFourthNumberGetterTouserdataIndex() {
  return luaEngineFourthGetterTouserdataIndex();
}
export function luaEngineFourthNumberGetterIatLuaTouserdata() {
  return luaEngineFourthGetterIatLuaTouserdata();
}
export function luaEngineFourthNumberGetterHostVaPush() {
  return LUA_FOURTH_NUMBER_GETTER_HOST_VA_PUSH >>> 0;
}
export function luaEngineFourthNumberGetterHasTypeGate() {
  return LUA_FOURTH_NUMBER_GETTER_HAS_TYPE_GATE | 0;
}
export function luaEngineFourthNumberGetterHasThisSelect() {
  return LUA_FOURTH_NUMBER_GETTER_HAS_THIS_SELECT | 0;
}
export function luaEngineFourthNumberGetterHasNullGate() {
  return LUA_FOURTH_NUMBER_GETTER_HAS_NULL_GATE | 0;
}
export function luaEngineFourthNumberGetterHasCheckinteger() {
  return LUA_FOURTH_NUMBER_GETTER_HAS_CHECKINTEGER | 0;
}
export function luaEngineFourthNumberGetterSiblingCount() {
  return LUA_FOURTH_NUMBER_GETTER_SIBLING_COUNT | 0;
}
export function luaEngineFourthNumberGetterReturnValue() {
  return LUA_FOURTH_NUMBER_GETTER_RETURN >>> 0;
}
export function luaEngineFourthNumberGetterNextVa() {
  return LUA_FOURTH_NUMBER_GETTER_NEXT_VA >>> 0;
}

/* ---- ABI v37: sequential indexed bool setter BODY 0x00897f00
 * (transcribed this unit from the PE; body stays host).
 * Skip 0x00897970 (6-IAT Vector userdata wrap/ctor). Skip SEH
 * 0x00897a10..0x00897d50. Do not reopen 0x008977f0.
 * touserdata(L, 0xfff0b9d7) IAT 0xb183b0 BY REFERENCE from v31;
 * lua_toboolean(L, 2) IAT 0xb183e8 BY REFERENCE from v22;
 * FULL-WORD test eax,eax / setne (v22 boolean-normalize BY
 * REFERENCE); luaL_checkinteger(L, 1) IAT 0xb183f4 BY REFERENCE
 * from v32; call [ud](integer, bool); add esp,0x20;
 * xor eax,eax; ret 0. Always calls. Image-wide 1 site.
 * ---------------------------------------------------------------------- */
export const LUA_FOURTH_INT_BOOL_SETTER_BODY_VA = 0x00897f00;
export const LUA_FOURTH_INT_BOOL_SETTER_BODY_BYTES = 0x49;
export const LUA_FOURTH_INT_BOOL_SETTER_TOBOOLEAN_INDEX = 2;
export const LUA_FOURTH_INT_BOOL_SETTER_CHECKINTEGER_INDEX = 1;
export const LUA_FOURTH_INT_BOOL_SETTER_STACK_CLEAN = 0x20;
export const LUA_FOURTH_INT_BOOL_SETTER_STACK_ALIGN_MASK = 0xfffffff8;
export const LUA_FOURTH_INT_BOOL_SETTER_SKIPPED_CTOR_VA = 0x00897970;
export const LUA_FOURTH_INT_BOOL_SETTER_HAS_TYPE_GATE = 0;
export const LUA_FOURTH_INT_BOOL_SETTER_HAS_THIS_SELECT = 0;
export const LUA_FOURTH_INT_BOOL_SETTER_HAS_NULL_GATE = 0;
export const LUA_FOURTH_INT_BOOL_SETTER_HAS_PUSH = 0;
export const LUA_FOURTH_INT_BOOL_SETTER_HAS_CHECKINTEGER = 1;
export const LUA_FOURTH_INT_BOOL_SETTER_SIBLING_COUNT = 1;
export const LUA_FOURTH_INT_BOOL_SETTER_RETURN = 0;
export const LUA_FOURTH_INT_BOOL_SETTER_NEXT_VA = 0x00897f50;

export function luaEngineFourthIntBoolSetterVa() {
  return LUA_FOURTH_INT_BOOL_SETTER_BODY_VA >>> 0;
}
export function luaEngineFourthIntBoolSetterBodyBytes() {
  return LUA_FOURTH_INT_BOOL_SETTER_BODY_BYTES >>> 0;
}
export function luaEngineFourthIntBoolSetterTobooleanIndex() {
  return LUA_FOURTH_INT_BOOL_SETTER_TOBOOLEAN_INDEX >>> 0;
}
export function luaEngineFourthIntBoolSetterCheckintegerIndex() {
  return LUA_FOURTH_INT_BOOL_SETTER_CHECKINTEGER_INDEX >>> 0;
}
export function luaEngineFourthIntBoolSetterStackClean() {
  return LUA_FOURTH_INT_BOOL_SETTER_STACK_CLEAN >>> 0;
}
export function luaEngineFourthIntBoolSetterStackAlignMask() {
  return LUA_FOURTH_INT_BOOL_SETTER_STACK_ALIGN_MASK >>> 0;
}
export function luaEngineFourthIntBoolSetterSkippedCtorVa() {
  return LUA_FOURTH_INT_BOOL_SETTER_SKIPPED_CTOR_VA >>> 0;
}
export function luaEngineFourthIntBoolSetterTouserdataIndex() {
  return luaEngineFourthGetterTouserdataIndex();
}
export function luaEngineFourthIntBoolSetterIatLuaTouserdata() {
  return luaEngineFourthGetterIatLuaTouserdata();
}
export function luaEngineFourthIntBoolSetterIatLuaToboolean() {
  return LUA_PROPERTY_CLOSURE_IAT_LUA_TOBOOLEAN >>> 0;
}
export function luaEngineFourthIntBoolSetterIatCheckinteger() {
  return LUA_BAND_C_SECONDARY_IAT_CHECKINTEGER >>> 0;
}
export function luaEngineFourthIntBoolSetterHasTypeGate() {
  return LUA_FOURTH_INT_BOOL_SETTER_HAS_TYPE_GATE | 0;
}
export function luaEngineFourthIntBoolSetterHasThisSelect() {
  return LUA_FOURTH_INT_BOOL_SETTER_HAS_THIS_SELECT | 0;
}
export function luaEngineFourthIntBoolSetterHasNullGate() {
  return LUA_FOURTH_INT_BOOL_SETTER_HAS_NULL_GATE | 0;
}
export function luaEngineFourthIntBoolSetterHasPush() {
  return LUA_FOURTH_INT_BOOL_SETTER_HAS_PUSH | 0;
}
export function luaEngineFourthIntBoolSetterHasCheckinteger() {
  return LUA_FOURTH_INT_BOOL_SETTER_HAS_CHECKINTEGER | 0;
}
export function luaEngineFourthIntBoolSetterSiblingCount() {
  return LUA_FOURTH_INT_BOOL_SETTER_SIBLING_COUNT | 0;
}
/* PE 0x897f25: test eax,eax / setne byte. Reuses v22 law. */
export function luaEngineFourthIntBoolSetterBooleanNormalize(v) {
  return luaEngineClosureBooleanNormalize(v);
}
export function luaEngineFourthIntBoolSetterReturnValue() {
  return LUA_FOURTH_INT_BOOL_SETTER_RETURN >>> 0;
}
export function luaEngineFourthIntBoolSetterNextVa() {
  return LUA_FOURTH_INT_BOOL_SETTER_NEXT_VA >>> 0;
}

/* ---- ABI v38: sequential indexed integer getter BODY 0x008984e0
 * (transcribed this unit from the PE; body stays host).
 * Skip SEH 0x00897f50. Skip wrap/ctor 0x00898140. Skip SEH
 * 0x008981b0..0x008983e0. Skip unref 0x00898490. Do not reopen
 * 0x008977f0 / 0x00897970.
 * touserdata(L, 0xfff0b9d7) IAT 0xb183b0 BY REFERENCE from v31;
 * luaL_checkinteger(L, 1) IAT 0xb183f4 BY REFERENCE from v32;
 * call [ud](integer); add esp,0x14; cdq lua_Integer BY REFERENCE
 * from v14; lua_pushinteger IAT 0xb183f8 BY REFERENCE from v22;
 * add esp,0xc; mov eax,1; ret 1. Always calls. Image-wide 1 site.
 * ---------------------------------------------------------------------- */
export const LUA_FOURTH_INT_GETTER_BODY_VA = 0x008984e0;
export const LUA_FOURTH_INT_GETTER_BODY_BYTES = 0x41;
export const LUA_FOURTH_INT_GETTER_CHECKINTEGER_INDEX = 1;
export const LUA_FOURTH_INT_GETTER_STACK_CLEAN = 0x14;
export const LUA_FOURTH_INT_GETTER_STACK_CLEAN_PUSH = 0x0c;
export const LUA_FOURTH_INT_GETTER_STACK_ALIGN_MASK = 0xfffffff8;
export const LUA_FOURTH_INT_GETTER_SKIPPED_SEH_VA = 0x00897f50;
export const LUA_FOURTH_INT_GETTER_SKIPPED_CTOR_VA = 0x00898140;
export const LUA_FOURTH_INT_GETTER_HAS_TYPE_GATE = 0;
export const LUA_FOURTH_INT_GETTER_HAS_THIS_SELECT = 0;
export const LUA_FOURTH_INT_GETTER_HAS_NULL_GATE = 0;
export const LUA_FOURTH_INT_GETTER_HAS_PUSH = 1;
export const LUA_FOURTH_INT_GETTER_HAS_CHECKINTEGER = 1;
export const LUA_FOURTH_INT_GETTER_SIBLING_COUNT = 1;
export const LUA_FOURTH_INT_GETTER_RETURN = 1;
export const LUA_FOURTH_INT_GETTER_NEXT_VA = 0x00898530;

export function luaEngineFourthIntGetterVa() {
  return LUA_FOURTH_INT_GETTER_BODY_VA >>> 0;
}
export function luaEngineFourthIntGetterBodyBytes() {
  return LUA_FOURTH_INT_GETTER_BODY_BYTES >>> 0;
}
export function luaEngineFourthIntGetterCheckintegerIndex() {
  return LUA_FOURTH_INT_GETTER_CHECKINTEGER_INDEX >>> 0;
}
export function luaEngineFourthIntGetterStackClean() {
  return LUA_FOURTH_INT_GETTER_STACK_CLEAN >>> 0;
}
export function luaEngineFourthIntGetterStackCleanPush() {
  return LUA_FOURTH_INT_GETTER_STACK_CLEAN_PUSH >>> 0;
}
export function luaEngineFourthIntGetterStackAlignMask() {
  return LUA_FOURTH_INT_GETTER_STACK_ALIGN_MASK >>> 0;
}
export function luaEngineFourthIntGetterSkippedSehVa() {
  return LUA_FOURTH_INT_GETTER_SKIPPED_SEH_VA >>> 0;
}
export function luaEngineFourthIntGetterSkippedCtorVa() {
  return LUA_FOURTH_INT_GETTER_SKIPPED_CTOR_VA >>> 0;
}
export function luaEngineFourthIntGetterTouserdataIndex() {
  return luaEngineFourthGetterTouserdataIndex();
}
export function luaEngineFourthIntGetterIatLuaTouserdata() {
  return luaEngineFourthGetterIatLuaTouserdata();
}
export function luaEngineFourthIntGetterIatCheckinteger() {
  return LUA_BAND_C_SECONDARY_IAT_CHECKINTEGER >>> 0;
}
export function luaEngineFourthIntGetterIatPushinteger() {
  return LUA_PROPERTY_CLOSURE_IAT_LUA_PUSHINTEGER >>> 0;
}
export function luaEngineFourthIntGetterHasTypeGate() {
  return LUA_FOURTH_INT_GETTER_HAS_TYPE_GATE | 0;
}
export function luaEngineFourthIntGetterHasThisSelect() {
  return LUA_FOURTH_INT_GETTER_HAS_THIS_SELECT | 0;
}
export function luaEngineFourthIntGetterHasNullGate() {
  return LUA_FOURTH_INT_GETTER_HAS_NULL_GATE | 0;
}
export function luaEngineFourthIntGetterHasPush() {
  return LUA_FOURTH_INT_GETTER_HAS_PUSH | 0;
}
export function luaEngineFourthIntGetterHasCheckinteger() {
  return LUA_FOURTH_INT_GETTER_HAS_CHECKINTEGER | 0;
}
export function luaEngineFourthIntGetterSiblingCount() {
  return LUA_FOURTH_INT_GETTER_SIBLING_COUNT | 0;
}
/* PE 0x89850a: cdq. Reuses v14 materialize law. Drive UNMASKED. */
export function luaEngineFourthIntGetterLuaIntegerHi(v) {
  return luaEngineMaterializeLuaIntegerHi(v);
}
export function luaEngineFourthIntGetterReturnValue() {
  return LUA_FOURTH_INT_GETTER_RETURN >>> 0;
}
export function luaEngineFourthIntGetterNextVa() {
  return LUA_FOURTH_INT_GETTER_NEXT_VA >>> 0;
}

/* ---- ABI v39: fourth-region i32 getter BODY 0x00898f50
 * (transcribed this unit from the PE; body stays host).
 * Skip host 0x00898530. Skip wrap/ctor 0x00898600. Skip
 * SEH 0x008986d0 / 0x00898890. Skip wrap 0x00898ae0 /
 * 0x00898c00. Skip SEH 0x00898cf0. Skip wrap 0x00898d90 /
 * 0x00898e00 / 0x00898e70 / 0x00898ee0. Do not reopen
 * 0x008977f0 / 0x00897970 / 0x00898140.
 * touserdata(L, 0xfff0b9d7) IAT 0xb183b0 BY REFERENCE from v31;
 * call [ud](); add esp,8; call 0x0085bff0 (band-C push-i32
 * BY REFERENCE from v24/v27). Always calls. Image-wide 1 site.
 * Census row 7; table of 10 unchanged.
 * ---------------------------------------------------------------------- */
export const LUA_FOURTH_I32_GETTER_BODY_VA = 0x00898f50;
export const LUA_FOURTH_I32_GETTER_BODY_BYTES = 0x29;
export const LUA_FOURTH_I32_GETTER_STACK_CLEAN = 0x08;
export const LUA_FOURTH_I32_GETTER_HOST_VA_PUSH = 0x0085bff0;
export const LUA_FOURTH_I32_GETTER_SKIPPED_HOST_VA = 0x00898530;
export const LUA_FOURTH_I32_GETTER_SKIPPED_CTOR_VA = 0x00898600;
export const LUA_FOURTH_I32_GETTER_SKIPPED_SEH_VA = 0x008986d0;
export const LUA_FOURTH_I32_GETTER_SKIP_COUNT = 11;
export const LUA_FOURTH_I32_GETTER_CENSUS_INDEX = 7;
export const LUA_FOURTH_I32_GETTER_HAS_TYPE_GATE = 0;
export const LUA_FOURTH_I32_GETTER_HAS_THIS_SELECT = 0;
export const LUA_FOURTH_I32_GETTER_HAS_NULL_GATE = 0;
export const LUA_FOURTH_I32_GETTER_HAS_PUSH = 1;
export const LUA_FOURTH_I32_GETTER_HAS_CHECKINTEGER = 0;
export const LUA_FOURTH_I32_GETTER_SIBLING_COUNT = 1;
export const LUA_FOURTH_I32_GETTER_RETURN = 1;
export const LUA_FOURTH_I32_GETTER_NEXT_VA = 0x00898f80;

export function luaEngineFourthI32GetterVa() {
  return LUA_FOURTH_I32_GETTER_BODY_VA >>> 0;
}
export function luaEngineFourthI32GetterBodyBytes() {
  return LUA_FOURTH_I32_GETTER_BODY_BYTES >>> 0;
}
export function luaEngineFourthI32GetterStackClean() {
  return LUA_FOURTH_I32_GETTER_STACK_CLEAN >>> 0;
}
export function luaEngineFourthI32GetterHostVaPush() {
  return LUA_BAND_C_PUSH_I32_VA >>> 0;
}
export function luaEngineFourthI32GetterSkippedHostVa() {
  return LUA_FOURTH_I32_GETTER_SKIPPED_HOST_VA >>> 0;
}
export function luaEngineFourthI32GetterSkippedCtorVa() {
  return LUA_FOURTH_I32_GETTER_SKIPPED_CTOR_VA >>> 0;
}
export function luaEngineFourthI32GetterSkippedSehVa() {
  return LUA_FOURTH_I32_GETTER_SKIPPED_SEH_VA >>> 0;
}
export function luaEngineFourthI32GetterSkipCount() {
  return LUA_FOURTH_I32_GETTER_SKIP_COUNT >>> 0;
}
export function luaEngineFourthI32GetterCensusIndex() {
  return LUA_FOURTH_I32_GETTER_CENSUS_INDEX >>> 0;
}
export function luaEngineFourthI32GetterTouserdataIndex() {
  return luaEngineFourthGetterTouserdataIndex();
}
export function luaEngineFourthI32GetterIatLuaTouserdata() {
  return luaEngineFourthGetterIatLuaTouserdata();
}
export function luaEngineFourthI32GetterHasTypeGate() {
  return LUA_FOURTH_I32_GETTER_HAS_TYPE_GATE | 0;
}
export function luaEngineFourthI32GetterHasThisSelect() {
  return LUA_FOURTH_I32_GETTER_HAS_THIS_SELECT | 0;
}
export function luaEngineFourthI32GetterHasNullGate() {
  return LUA_FOURTH_I32_GETTER_HAS_NULL_GATE | 0;
}
export function luaEngineFourthI32GetterHasPush() {
  return LUA_FOURTH_I32_GETTER_HAS_PUSH | 0;
}
export function luaEngineFourthI32GetterHasCheckinteger() {
  return LUA_FOURTH_I32_GETTER_HAS_CHECKINTEGER | 0;
}
export function luaEngineFourthI32GetterSiblingCount() {
  return LUA_FOURTH_I32_GETTER_SIBLING_COUNT | 0;
}
export function luaEngineFourthI32GetterReturnValue() {
  return LUA_FOURTH_I32_GETTER_RETURN >>> 0;
}
export function luaEngineFourthI32GetterNextVa() {
  return LUA_FOURTH_I32_GETTER_NEXT_VA >>> 0;
}

/* ---- ABI v40: fourth-region i32 sign-extend getter BODY 0x008991a0
 * (transcribed this unit from the PE; body stays host).
 * Skip host 0x00898f80. Skip wrap/ctor 0x00899030. Skip
 * host setter 0x008990d0. Skip host 0x00899140. Do not
 * reopen 0x00898530 / 0x00898f50 / 0x008977f0 / 0x00897970 /
 * 0x00897f50 / 0x008984e0.
 * touserdata(L, 0xfff0b9d7) IAT 0xb183b0 BY REFERENCE from v31;
 * call [ud](); add esp,8; call 0x0085bfd0 (closure push-i32-sext
 * BY REFERENCE from v22). Always calls. Image-wide 1 site.
 * Census row 8; table of 10 unchanged.
 * ---------------------------------------------------------------------- */
export const LUA_FOURTH_I32_SEXT_GETTER_BODY_VA = 0x008991a0;
export const LUA_FOURTH_I32_SEXT_GETTER_BODY_BYTES = 0x29;
export const LUA_FOURTH_I32_SEXT_GETTER_STACK_CLEAN = 0x08;
export const LUA_FOURTH_I32_SEXT_GETTER_HOST_VA_PUSH = 0x0085bfd0;
export const LUA_FOURTH_I32_SEXT_GETTER_SKIPPED_HOST_VA = 0x00898f80;
export const LUA_FOURTH_I32_SEXT_GETTER_SKIPPED_WRAP_VA = 0x00899030;
export const LUA_FOURTH_I32_SEXT_GETTER_SKIPPED_CHECK_VA = 0x008990d0;
export const LUA_FOURTH_I32_SEXT_GETTER_SKIPPED_TYPE_VA = 0x00899140;
export const LUA_FOURTH_I32_SEXT_GETTER_SKIP_COUNT = 4;
export const LUA_FOURTH_I32_SEXT_GETTER_CENSUS_INDEX = 8;
export const LUA_FOURTH_I32_SEXT_GETTER_HAS_TYPE_GATE = 0;
export const LUA_FOURTH_I32_SEXT_GETTER_HAS_THIS_SELECT = 0;
export const LUA_FOURTH_I32_SEXT_GETTER_HAS_NULL_GATE = 0;
export const LUA_FOURTH_I32_SEXT_GETTER_HAS_PUSH = 1;
export const LUA_FOURTH_I32_SEXT_GETTER_HAS_CHECKINTEGER = 0;
export const LUA_FOURTH_I32_SEXT_GETTER_SIBLING_COUNT = 1;
export const LUA_FOURTH_I32_SEXT_GETTER_RETURN = 1;
export const LUA_FOURTH_I32_SEXT_GETTER_NEXT_VA = 0x008991d0;

export function luaEngineFourthI32SextGetterVa() {
  return LUA_FOURTH_I32_SEXT_GETTER_BODY_VA >>> 0;
}
export function luaEngineFourthI32SextGetterBodyBytes() {
  return LUA_FOURTH_I32_SEXT_GETTER_BODY_BYTES >>> 0;
}
export function luaEngineFourthI32SextGetterStackClean() {
  return LUA_FOURTH_I32_SEXT_GETTER_STACK_CLEAN >>> 0;
}
export function luaEngineFourthI32SextGetterHostVaPush() {
  return LUA_PROPERTY_CLOSURE_PUSH_I32_SEXT_VA >>> 0;
}
export function luaEngineFourthI32SextGetterSkippedHostVa() {
  return LUA_FOURTH_I32_SEXT_GETTER_SKIPPED_HOST_VA >>> 0;
}
export function luaEngineFourthI32SextGetterSkippedWrapVa() {
  return LUA_FOURTH_I32_SEXT_GETTER_SKIPPED_WRAP_VA >>> 0;
}
export function luaEngineFourthI32SextGetterSkippedCheckVa() {
  return LUA_FOURTH_I32_SEXT_GETTER_SKIPPED_CHECK_VA >>> 0;
}
export function luaEngineFourthI32SextGetterSkippedTypeVa() {
  return LUA_FOURTH_I32_SEXT_GETTER_SKIPPED_TYPE_VA >>> 0;
}
export function luaEngineFourthI32SextGetterSkipCount() {
  return LUA_FOURTH_I32_SEXT_GETTER_SKIP_COUNT >>> 0;
}
export function luaEngineFourthI32SextGetterCensusIndex() {
  return LUA_FOURTH_I32_SEXT_GETTER_CENSUS_INDEX >>> 0;
}
export function luaEngineFourthI32SextGetterTouserdataIndex() {
  return luaEngineFourthGetterTouserdataIndex();
}
export function luaEngineFourthI32SextGetterIatLuaTouserdata() {
  return luaEngineFourthGetterIatLuaTouserdata();
}
export function luaEngineFourthI32SextGetterHasTypeGate() {
  return LUA_FOURTH_I32_SEXT_GETTER_HAS_TYPE_GATE | 0;
}
export function luaEngineFourthI32SextGetterHasThisSelect() {
  return LUA_FOURTH_I32_SEXT_GETTER_HAS_THIS_SELECT | 0;
}
export function luaEngineFourthI32SextGetterHasNullGate() {
  return LUA_FOURTH_I32_SEXT_GETTER_HAS_NULL_GATE | 0;
}
export function luaEngineFourthI32SextGetterHasPush() {
  return LUA_FOURTH_I32_SEXT_GETTER_HAS_PUSH | 0;
}
export function luaEngineFourthI32SextGetterHasCheckinteger() {
  return LUA_FOURTH_I32_SEXT_GETTER_HAS_CHECKINTEGER | 0;
}
export function luaEngineFourthI32SextGetterSiblingCount() {
  return LUA_FOURTH_I32_SEXT_GETTER_SIBLING_COUNT | 0;
}
/* PE 0x85bfd8: cdq. Reuses v22 closure push-i32-sext law. Drive UNMASKED. */
export function luaEngineFourthI32SextGetterLuaIntegerHi(v) {
  return luaEngineClosurePushI32Hi(v);
}
export function luaEngineFourthI32SextGetterReturnValue() {
  return LUA_FOURTH_I32_SEXT_GETTER_RETURN >>> 0;
}
export function luaEngineFourthI32SextGetterNextVa() {
  return LUA_FOURTH_I32_SEXT_GETTER_NEXT_VA >>> 0;
}

/* ---- ABI v41: sequential no-arg setter-shaped BODY 0x008991d0
 * (transcribed this unit from the PE; body stays host).
 * Skip count 0. Do not reopen 0x00898f50 / 0x008991a0 /
 * 0x00898530 / 0x00897970 / 0x008977f0 / 0x00898140.
 * touserdata(L, 0xfff0b9d7) IAT 0xb183b0 BY REFERENCE from v31;
 * call [ud](); add esp,8; xor eax,eax; ret 0. Always calls.
 * Image-wide 1 site. Installer 0x00893270 CODE_PTR 0x009e94e0.
 * Fourth census table of 10 unchanged.
 * ---------------------------------------------------------------------- */
export const LUA_FOURTH_NOARG_SETTER_BODY_VA = 0x008991d0;
export const LUA_FOURTH_NOARG_SETTER_BODY_BYTES = 0x1c;
export const LUA_FOURTH_NOARG_SETTER_STACK_CLEAN = 0x08;
export const LUA_FOURTH_NOARG_SETTER_SKIP_COUNT = 0;
export const LUA_FOURTH_NOARG_SETTER_CODE_UD_VA = 0x009e94e0;
export const LUA_FOURTH_NOARG_SETTER_INSTALLER_VA = 0x00893270;
export const LUA_FOURTH_NOARG_SETTER_HAS_TYPE_GATE = 0;
export const LUA_FOURTH_NOARG_SETTER_HAS_THIS_SELECT = 0;
export const LUA_FOURTH_NOARG_SETTER_HAS_NULL_GATE = 0;
export const LUA_FOURTH_NOARG_SETTER_HAS_PUSH = 0;
export const LUA_FOURTH_NOARG_SETTER_HAS_CHECKINTEGER = 0;
export const LUA_FOURTH_NOARG_SETTER_SIBLING_COUNT = 1;
export const LUA_FOURTH_NOARG_SETTER_RETURN = 0;
export const LUA_FOURTH_NOARG_SETTER_NEXT_VA = 0x008991f0;

export function luaEngineFourthNoargSetterVa() {
  return LUA_FOURTH_NOARG_SETTER_BODY_VA >>> 0;
}
export function luaEngineFourthNoargSetterBodyBytes() {
  return LUA_FOURTH_NOARG_SETTER_BODY_BYTES >>> 0;
}
export function luaEngineFourthNoargSetterStackClean() {
  return LUA_FOURTH_NOARG_SETTER_STACK_CLEAN >>> 0;
}
export function luaEngineFourthNoargSetterSkipCount() {
  return LUA_FOURTH_NOARG_SETTER_SKIP_COUNT >>> 0;
}
export function luaEngineFourthNoargSetterCodeUdVa() {
  return LUA_FOURTH_NOARG_SETTER_CODE_UD_VA >>> 0;
}
export function luaEngineFourthNoargSetterInstallerVa() {
  return LUA_FOURTH_NOARG_SETTER_INSTALLER_VA >>> 0;
}
export function luaEngineFourthNoargSetterTouserdataIndex() {
  return luaEngineFourthGetterTouserdataIndex();
}
export function luaEngineFourthNoargSetterIatLuaTouserdata() {
  return luaEngineFourthGetterIatLuaTouserdata();
}
export function luaEngineFourthNoargSetterHasTypeGate() {
  return LUA_FOURTH_NOARG_SETTER_HAS_TYPE_GATE | 0;
}
export function luaEngineFourthNoargSetterHasThisSelect() {
  return LUA_FOURTH_NOARG_SETTER_HAS_THIS_SELECT | 0;
}
export function luaEngineFourthNoargSetterHasNullGate() {
  return LUA_FOURTH_NOARG_SETTER_HAS_NULL_GATE | 0;
}
export function luaEngineFourthNoargSetterHasPush() {
  return LUA_FOURTH_NOARG_SETTER_HAS_PUSH | 0;
}
export function luaEngineFourthNoargSetterHasCheckinteger() {
  return LUA_FOURTH_NOARG_SETTER_HAS_CHECKINTEGER | 0;
}
export function luaEngineFourthNoargSetterSiblingCount() {
  return LUA_FOURTH_NOARG_SETTER_SIBLING_COUNT | 0;
}
export function luaEngineFourthNoargSetterReturnValue() {
  return LUA_FOURTH_NOARG_SETTER_RETURN >>> 0;
}
export function luaEngineFourthNoargSetterNextVa() {
  return LUA_FOURTH_NOARG_SETTER_NEXT_VA >>> 0;
}

/* ---- ABI v48: wrapper BODIES 0x8a8310..0x8a88f0 (9 closures) + helper
 * 0x8ba890 getArgVector.
 *
 * PE-truth (fresh dumps 008a8310.txt..008a88f0.txt, 008ba890.txt; lua-v51
 * notes). Shared arg conduct (all 9): L=[ebp+8]; lua_type(L,1) @0xb18400;
 * FULL-WORD gate; check 0x85c590 (flags vary); obj1=[eax+4]; touserdata
 * (L, upvalueindex(1) 0xfff0b9d7) @0xb183b0; fn=ud[0]; per-wrapper arg
 * conduct -> ud[0](obj1, ...); per-wrapper tail. Tails:
 *   BOX10 (Rotated/Clamped/__add/__mul): newuserdata(L,0x10) @0xb1839c;
 *     newud[0]=0xb73574; newud[4]=&newud[8]; rawgetp(L, 0xfff0b9d8,
 *     0xc82980) @0xb183bc; setmetatable(L,-2) @0xb18398; payload {lo,hi}
 *     = fn 8-byte ret -> newud[8]; ret 1.
 *   BOX8 (Lerp): fn ret POINTER; FULL-WORD test; je -> pushnil @0xb183e0
 *     ret 1; else newuserdata(L,8); newud[0]=0xb753c8; newud[4]=ret ptr;
 *     rawgetp key 0xc8297f; setmetatable -2; ret 1.
 *   FLOAT (GetAngleDegrees/Length): fn double in ST0 -> fstp dword [ebp-4]
 *     (f32); call 0x85c050 pushNumber; ret 1.
 *   VOID (Resize/Clamp): ret 0.
 *   PUSHSTRING (__tostring): fn str ptr; test FULL-WORD; je -> pushnil;
 *     else pushstring(L,str) @0xb18414; ret 1.
 * ---------------------------------------------------------------------- */
export const LUA_WRAPPER_COUNT = 9;
export const LUA_WRAPPER_VAS = Object.freeze([
  0x008a8310, 0x008a8430, 0x008a8510, 0x008a8580, 0x008a8610,
  0x008a8680, 0x008a8740, 0x008a8810, 0x008a88f0,
]);
export const LUA_WRAPPER_RET_VAS = Object.freeze([
  0x008a8412, 0x008a8508, 0x008a8578, 0x008a8601, 0x008a867f,
  0x008a873b, 0x008a880e, 0x008a88e2, 0x008a8951,
]);
export const LUA_WRAPPER_INSN_COUNTS = Object.freeze([
  87, 82, 50, 60, 51, 75, 78, 85, 42,
]);
export const LUA_WRAPPER_CHECK_FLAGS = Object.freeze([
  0x00, 0x01, 0x01, 0x00, 0x00, 0x01, 0x01, 0x01, 0x01,
]);
export const LUA_WRAPPER_RETURN_VALUES = Object.freeze([
  1, 1, 1, 0, 0, 1, 1, 1, 1,
]);
export const LUA_WRAPPER_ARG2_NONE = 0;
export const LUA_WRAPPER_ARG2_CHECKNUMBER_F32 = 1;
export const LUA_WRAPPER_ARG2_GET_ARG_OBJECT_VEC2 = 2;
export const LUA_WRAPPER_ARG2_GET_ARG_VECTOR = 3;
export const LUA_WRAPPER_ARG2_KINDS = Object.freeze([
  LUA_WRAPPER_ARG2_GET_ARG_OBJECT_VEC2, /* 0x8a8310 Lerp */
  LUA_WRAPPER_ARG2_CHECKNUMBER_F32,     /* 0x8a8430 Rotated */
  LUA_WRAPPER_ARG2_NONE,                /* 0x8a8510 GetAngle */
  LUA_WRAPPER_ARG2_CHECKNUMBER_F32,     /* 0x8a8580 Resize */
  LUA_WRAPPER_ARG2_GET_ARG_VECTOR,      /* 0x8a8610 Clamp */
  LUA_WRAPPER_ARG2_GET_ARG_VECTOR,      /* 0x8a8680 Clamped */
  LUA_WRAPPER_ARG2_GET_ARG_OBJECT_VEC2, /* 0x8a8740 __add */
  LUA_WRAPPER_ARG2_CHECKNUMBER_F32,     /* 0x8a8810 __mul */
  LUA_WRAPPER_ARG2_NONE,                /* 0x8a88f0 __tostring */
]);
export const LUA_WRAPPER_ARG2_INDICES = Object.freeze([2, 2, 0, 2, 2, 2, 2, 2, 0]);
export const LUA_WRAPPER_ARG3_NONE = 0;
export const LUA_WRAPPER_ARG3_CHECKNUMBER_F32 = 1;
export const LUA_WRAPPER_ARG3_KINDS = Object.freeze([
  LUA_WRAPPER_ARG3_CHECKNUMBER_F32, LUA_WRAPPER_ARG3_NONE,
  LUA_WRAPPER_ARG3_NONE, LUA_WRAPPER_ARG3_NONE, LUA_WRAPPER_ARG3_NONE,
  LUA_WRAPPER_ARG3_NONE, LUA_WRAPPER_ARG3_NONE, LUA_WRAPPER_ARG3_NONE,
  LUA_WRAPPER_ARG3_NONE,
]);
export const LUA_WRAPPER_ARG3_INDICES = Object.freeze([3, 0, 0, 0, 0, 0, 0, 0, 0]);
export const LUA_WRAPPER_ARG4_INDICES = Object.freeze([4, 0, 0, 0, 0, 0, 0, 0, 0]);
export const LUA_WRAPPER_TAIL_BOX10 = 0;
export const LUA_WRAPPER_TAIL_BOX8 = 1;
export const LUA_WRAPPER_TAIL_FLOAT = 2;
export const LUA_WRAPPER_TAIL_VOID = 3;
export const LUA_WRAPPER_TAIL_PUSHSTRING = 4;
export const LUA_WRAPPER_TAIL_KINDS = Object.freeze([
  LUA_WRAPPER_TAIL_BOX8, LUA_WRAPPER_TAIL_BOX10, LUA_WRAPPER_TAIL_FLOAT,
  LUA_WRAPPER_TAIL_VOID, LUA_WRAPPER_TAIL_VOID, LUA_WRAPPER_TAIL_BOX10,
  LUA_WRAPPER_TAIL_BOX10, LUA_WRAPPER_TAIL_BOX10, LUA_WRAPPER_TAIL_PUSHSTRING,
]);
export const LUA_WRAPPER_TYPE_INDEX = 0x01;
export const LUA_WRAPPER_CHECK_STACK_INDEX = 0x01;
export const LUA_WRAPPER_REGISTRY_KEY = 0x00c82980;
export const LUA_WRAPPER_OBJECT_FIELD_OFF = 0x04;
export const LUA_WRAPPER_TOUSERDATA_INDEX_U32 = 0xfff0b9d7;
export const LUA_WRAPPER_FN_OFF = 0x00;
export const LUA_WRAPPER_CHECK_HELPER_VA = 0x0085c590;
export const LUA_WRAPPER_GET_ARG_OBJECT_VA = 0x008baa50;
export const LUA_WRAPPER_PUSH_NUMBER_VA = 0x0085c050;
export const LUA_WRAPPER_IAT_LUA_TYPE = 0x00b18400;
export const LUA_WRAPPER_IAT_LUA_TOUSERDATA = 0x00b183b0;
export const LUA_WRAPPER_IAT_LUA_CHECKNUMBER = 0x00b18324;
export const LUA_WRAPPER_IAT_LUA_TOBOOLEAN = 0x00b183e8;
export const LUA_WRAPPER_BOX10_NEWUSERDATA_SIZE = 0x10;
export const LUA_WRAPPER_BOX10_VTABLE_TAG_VA = 0x00b73574;
export const LUA_WRAPPER_BOX10_PAYLOAD_SELF_OFF = 0x04;
export const LUA_WRAPPER_BOX10_PAYLOAD_OFF = 0x08;
export const LUA_WRAPPER_BOX10_METATABLE_RAWGETP_KEY = 0x00c82980;
export const LUA_WRAPPER_BOX10_REGISTRY_INDEX_U32 = 0xfff0b9d8;
export const LUA_WRAPPER_BOX10_SETMETA_INDEX_U32 = 0xfffffffe;
export const LUA_WRAPPER_BOX10_PAYLOAD_LO_OFF = 0x00;
export const LUA_WRAPPER_BOX10_PAYLOAD_HI_OFF = 0x04;
export const LUA_WRAPPER_BOX8_NEWUSERDATA_SIZE = 0x08;
export const LUA_WRAPPER_BOX8_VTABLE_TAG_VA = 0x00b753c8;
export const LUA_WRAPPER_BOX8_PAYLOAD_OFF = 0x04;
export const LUA_WRAPPER_BOX8_METATABLE_RAWGETP_KEY = 0x00c8297f;
export const LUA_WRAPPER_BOX8_REGISTRY_INDEX_U32 = 0xfff0b9d8;
export const LUA_WRAPPER_BOX8_SETMETA_INDEX_U32 = 0xfffffffe;
export const LUA_WRAPPER_FLOAT_SLOT_STACK_OFF = 0xfffffffc;
export const LUA_WRAPPER_PUSHSTRING_IAT_LUA_PUSHSTRING = 0x00b18414;
export const LUA_WRAPPER_PUSHSTRING_IAT_LUA_PUSHNIL = 0x00b183e0;
export const LUA_WRAPPER_GET_ARG_VECTOR_VA = 0x008ba890;
export const LUA_WRAPPER_GET_ARG_VECTOR_RET_VA = 0x008ba8f6;
export const LUA_WRAPPER_GET_ARG_VECTOR_INSNS = 51;
export const LUA_WRAPPER_GET_ARG_VECTOR_IAT_LUA_CHECKNUMBER = 0x00b18324;
export const LUA_WRAPPER_GET_ARG_VECTOR_CALL_ORDER = Object.freeze([5, 4, 3, 2]);
export const LUA_WRAPPER_GET_ARG_VECTOR_OUT_F32_COUNT = 4;
export const LUA_WRAPPER_GET_ARG_VECTOR_OUT_F32_STRIDE = 4;
export const LUA_WRAPPER_GET_ARG_VECTOR_OUT_L_PTR_OFF = 0x10;
export const LUA_WRAPPER_GET_ARG_VECTOR_RET_ARGS = 4;

function wrapperIndexOk(index) {
  return index >= 0 && index < LUA_WRAPPER_COUNT;
}

export function luaEngineWrapperCount() {
  return LUA_WRAPPER_COUNT;
}
export function luaEngineWrapperVa(index) {
  return wrapperIndexOk(index) ? LUA_WRAPPER_VAS[index] >>> 0 : 0;
}
export function luaEngineWrapperRetVa(index) {
  return wrapperIndexOk(index) ? LUA_WRAPPER_RET_VAS[index] >>> 0 : 0;
}
export function luaEngineWrapperBodyBytes(index) {
  if (!wrapperIndexOk(index)) return 0;
  return (LUA_WRAPPER_RET_VAS[index] - LUA_WRAPPER_VAS[index]) >>> 0;
}
export function luaEngineWrapperInsnCount(index) {
  return wrapperIndexOk(index) ? LUA_WRAPPER_INSN_COUNTS[index] : -1;
}
export function luaEngineWrapperCheckFlags(index) {
  return wrapperIndexOk(index) ? LUA_WRAPPER_CHECK_FLAGS[index] : -1;
}
export function luaEngineWrapperReturnValue(index) {
  return wrapperIndexOk(index) ? LUA_WRAPPER_RETURN_VALUES[index] : -1;
}
export function luaEngineWrapperArg2Kind(index) {
  return wrapperIndexOk(index) ? LUA_WRAPPER_ARG2_KINDS[index] : -1;
}
export function luaEngineWrapperArg2Index(index) {
  return wrapperIndexOk(index) ? LUA_WRAPPER_ARG2_INDICES[index] : -1;
}
export function luaEngineWrapperArg3Kind(index) {
  return wrapperIndexOk(index) ? LUA_WRAPPER_ARG3_KINDS[index] : -1;
}
export function luaEngineWrapperArg3Index(index) {
  return wrapperIndexOk(index) ? LUA_WRAPPER_ARG3_INDICES[index] : -1;
}
export function luaEngineWrapperArg4Index(index) {
  return wrapperIndexOk(index) ? LUA_WRAPPER_ARG4_INDICES[index] : -1;
}
export function luaEngineWrapperTailKind(index) {
  return wrapperIndexOk(index) ? LUA_WRAPPER_TAIL_KINDS[index] : -1;
}
export function luaEngineWrapperTypeIndex() {
  return LUA_WRAPPER_TYPE_INDEX >>> 0;
}
export function luaEngineWrapperCheckStackIndex() {
  return LUA_WRAPPER_CHECK_STACK_INDEX >>> 0;
}
export function luaEngineWrapperRegistryKey() {
  return LUA_WRAPPER_REGISTRY_KEY >>> 0;
}
export function luaEngineWrapperObjectFieldOff() {
  return LUA_WRAPPER_OBJECT_FIELD_OFF >>> 0;
}
export function luaEngineWrapperTouserdataIndex() {
  return LUA_WRAPPER_TOUSERDATA_INDEX_U32 >>> 0;
}
export function luaEngineWrapperFnOff() {
  return LUA_WRAPPER_FN_OFF >>> 0;
}
export function luaEngineWrapperCheckHelperVa() {
  return LUA_WRAPPER_CHECK_HELPER_VA >>> 0;
}
export function luaEngineWrapperGetArgObjectVa() {
  return LUA_WRAPPER_GET_ARG_OBJECT_VA >>> 0;
}
export function luaEngineWrapperPushNumberVa() {
  return LUA_WRAPPER_PUSH_NUMBER_VA >>> 0;
}
export function luaEngineWrapperIatLuaType() {
  return LUA_WRAPPER_IAT_LUA_TYPE >>> 0;
}
export function luaEngineWrapperIatLuaTouserdata() {
  return LUA_WRAPPER_IAT_LUA_TOUSERDATA >>> 0;
}
export function luaEngineWrapperIatLuaChecknumber() {
  return LUA_WRAPPER_IAT_LUA_CHECKNUMBER >>> 0;
}
export function luaEngineWrapperIatLuaToboolean() {
  return LUA_WRAPPER_IAT_LUA_TOBOOLEAN >>> 0;
}
export function luaEngineWrapperObjectResolve(typeResult, checkField) {
  /* FULL-WORD gate: `test eax,eax; je obj_zero` — only 0 short-circuits. */
  return (typeResult !== 0) ? (checkField >>> 0) : 0;
}
export function luaEngineWrapperArg2GetArgObject(typeResult, checkField) {
  /* getArgObject 0x8baa50 two-gate law (v45); both FULL-WORD. */
  if (typeResult === 0) return 0;
  if (checkField === 0) return 0;
  return checkField >>> 0;
}
export function luaEngineWrapperTobooleanFlag(tobooleanResult) {
  /* `test eax,eax; setne byte` — FULL-WORD test. */
  return tobooleanResult !== 0 ? 1 : 0;
}
export function luaEngineWrapperFloatF32Bits(hi, lo) {
  /* fstp dword [ebp-4]: double (64-bit bits) -> float32 bits, RN. */
  const buf = new ArrayBuffer(8);
  const dv = new DataView(buf);
  dv.setUint32(0, lo >>> 0, true);
  dv.setUint32(4, hi >>> 0, true);
  const d = dv.getFloat64(0, true);
  const out = new ArrayBuffer(4);
  const dv2 = new DataView(out);
  dv2.setFloat32(0, Math.fround(d), true);
  return dv2.getUint32(0, true);
}
export function luaEngineWrapperGetArgVectorVa() {
  return LUA_WRAPPER_GET_ARG_VECTOR_VA >>> 0;
}
export function luaEngineWrapperGetArgVectorRetVa() {
  return LUA_WRAPPER_GET_ARG_VECTOR_RET_VA >>> 0;
}
export function luaEngineWrapperGetArgVectorBodyBytes() {
  return (LUA_WRAPPER_GET_ARG_VECTOR_RET_VA - LUA_WRAPPER_GET_ARG_VECTOR_VA) >>> 0;
}
export function luaEngineWrapperGetArgVectorInsnCount() {
  return LUA_WRAPPER_GET_ARG_VECTOR_INSNS | 0;
}
export function luaEngineWrapperGetArgVectorCallOrderAt(position) {
  const p = position | 0;
  if (p < 0 || p >= LUA_WRAPPER_GET_ARG_VECTOR_CALL_ORDER.length) return 0;
  return LUA_WRAPPER_GET_ARG_VECTOR_CALL_ORDER[p] | 0;
}
export function luaEngineWrapperGetArgVectorIndexAt(position) {
  const p = position | 0;
  if (p < 0 || p >= LUA_WRAPPER_GET_ARG_VECTOR_OUT_F32_COUNT) return 0;
  return p + 2;
}
export function luaEngineWrapperGetArgVectorOutF32Count() {
  return LUA_WRAPPER_GET_ARG_VECTOR_OUT_F32_COUNT | 0;
}
export function luaEngineWrapperGetArgVectorOutStride() {
  return LUA_WRAPPER_GET_ARG_VECTOR_OUT_F32_STRIDE | 0;
}
export function luaEngineWrapperGetArgVectorOutLPtrOff() {
  return LUA_WRAPPER_GET_ARG_VECTOR_OUT_L_PTR_OFF | 0;
}
export function luaEngineWrapperGetArgVectorRetArgs() {
  return LUA_WRAPPER_GET_ARG_VECTOR_RET_ARGS | 0;
}
export function luaEngineWrapperBox10NewuserdataSize() {
  return LUA_WRAPPER_BOX10_NEWUSERDATA_SIZE >>> 0;
}
export function luaEngineWrapperBox10VtableTagVa() {
  return LUA_WRAPPER_BOX10_VTABLE_TAG_VA >>> 0;
}
export function luaEngineWrapperBox10PayloadSelfOff() {
  return LUA_WRAPPER_BOX10_PAYLOAD_SELF_OFF >>> 0;
}
export function luaEngineWrapperBox10PayloadOff() {
  return LUA_WRAPPER_BOX10_PAYLOAD_OFF >>> 0;
}
export function luaEngineWrapperBox10MetatableRawgetpKey() {
  return LUA_WRAPPER_BOX10_METATABLE_RAWGETP_KEY >>> 0;
}
export function luaEngineWrapperBox10RegistryIndex() {
  return LUA_WRAPPER_BOX10_REGISTRY_INDEX_U32 >>> 0;
}
export function luaEngineWrapperBox10SetmetaIndex() {
  return LUA_WRAPPER_BOX10_SETMETA_INDEX_U32 >>> 0;
}
export function luaEngineWrapperBox10PayloadLoOff() {
  return LUA_WRAPPER_BOX10_PAYLOAD_LO_OFF >>> 0;
}
export function luaEngineWrapperBox10PayloadHiOff() {
  return LUA_WRAPPER_BOX10_PAYLOAD_HI_OFF >>> 0;
}
export function luaEngineWrapperBox8NewuserdataSize() {
  return LUA_WRAPPER_BOX8_NEWUSERDATA_SIZE >>> 0;
}
export function luaEngineWrapperBox8VtableTagVa() {
  return LUA_WRAPPER_BOX8_VTABLE_TAG_VA >>> 0;
}
export function luaEngineWrapperBox8PayloadOff() {
  return LUA_WRAPPER_BOX8_PAYLOAD_OFF >>> 0;
}
export function luaEngineWrapperBox8MetatableRawgetpKey() {
  return LUA_WRAPPER_BOX8_METATABLE_RAWGETP_KEY >>> 0;
}
export function luaEngineWrapperBox8RegistryIndex() {
  return LUA_WRAPPER_BOX8_REGISTRY_INDEX_U32 >>> 0;
}
export function luaEngineWrapperBox8SetmetaIndex() {
  return LUA_WRAPPER_BOX8_SETMETA_INDEX_U32 >>> 0;
}
export function luaEngineWrapperFloatSlotStackOff() {
  return LUA_WRAPPER_FLOAT_SLOT_STACK_OFF >>> 0;
}
export function luaEngineWrapperPushstringIatLuaPushstring() {
  return LUA_WRAPPER_PUSHSTRING_IAT_LUA_PUSHSTRING >>> 0;
}
export function luaEngineWrapperPushstringIatLuaPushnil() {
  return LUA_WRAPPER_PUSHSTRING_IAT_LUA_PUSHNIL >>> 0;
}

/* ---- ABI v49: FontRenderSettings accessor wrapper BODIES 0x008a89e0
 * (GetAlignment) + 0x008a8a40 (SetMaxCharacters/EnableAutoWrap/
 * EnableTruncation).
 *
 * PE-truth (fresh dump 008a89e0.txt, 008a8a40 band; lua-v52 notes).
 * Shared arg conduct (both): L=[ebp+8]; lua_type(L,1) @0xb18400;
 * FULL-WORD gate (0 -> obj=0, skip check); else push CHKFLAGS;
 * push 0xc82986 (NEW registry key, +6 vs v48 Vector key 0xc82980);
 * edx=1; ecx=L; call 0x85c590; obj=[eax+4]; touserdata(L,
 * upvalueindex(1) 0xfff0b9d7) @0xb183b0; fn=ud[0]; per-wrapper
 * conduct/tail.
 *   GetAlignment (0x8a89e0, CHKFLAGS=1): ud[0](obj) -> i32 eax;
 *     cdq sign-extend; lua_pushinteger(L, {hi,lo}) @0xb183f8;
 *     cleanup 0xc; ret 1.
 *   Setter (0x8a8a40, CHKFLAGS=0): luaL_checkinteger(L,2) @0xb183f4
 *     (call order: touserdata first; combined cleanup 0x10);
 *     movzx edx, ax — LOW-WORD (16-bit) zero-extend; ud[0](obj, word);
 *     xor eax,eax; ret 0.
 * Reachability: each wrapper VA is the pushcclosure fn literal in the
 * install-helper body (0x8a89e0 @ 0x89fdf7 inside DUAL_IMM 0x89fde0;
 * 0x8a8a40 @ 0x89fd99 inside SINGLE 0x89fd80) — sole 32-bit LE
 * occurrences in the image. E8 sites 0x866dcc / 0x866de1 / 0x866e0b /
 * 0x866e35. All lua_* IAT + 0x85c590 + real_fn stay host.
 * ---------------------------------------------------------------------- */
export const LUA_FONTSETTINGS_WRAPPER_COUNT = 15;
export const LUA_FONTSETTINGS_WRAPPER_VAS = Object.freeze([
  /* v49: GetAlignment + setter. */
  0x008a89e0, /* GetAlignment */
  0x008a8a40, /* SetMaxCharacters-family setter */
  /* v51 band bodies (appended; VA-ascending among themselves; the
   * SetAlignment wrapper 0x8a8970 predates 0x8a89e0 in the PE). */
  0x008a8970, /* SetAlignment / SetMissingCharacterOverride */
  0x008a8ab0, /* GetMaxCharacters */
  0x008a8b10, /* IsAutoWrapEnabled / IsTruncationEnabled */
  0x008a8b80, /* SetLineHeightModifier */
  0x008a8c10, /* GetLineHeightModifier */
  0x008a8c80, /* GetMissingCharacterOverride */
  0x008a8ce0, /* Load */
  0x008a8d80, /* Unload */
  0x008a8dd0, /* IsLoaded */
  0x008a8e40, /* GetCharacterWidth */
  0x008a8ec0, /* GetStringWidth */
  0x008a8f60, /* GetLineHeight / GetBaselineHeight */
  0x008a9180, /* SetMissingCharacter */
]);
export const LUA_FONTSETTINGS_WRAPPER_RET_VAS = Object.freeze([
  0x008a8a3f, 0x008a8aa0,
  0x008a89db, 0x008a8b0b, 0x008a8b74, 0x008a8c01, 0x008a8c78,
  0x008a8cdb, 0x008a8d75, 0x008a8dcf, 0x008a8e34, 0x008a8eb5,
  0x008a8f51, 0x008a8fbb, 0x008a91eb,
]);
export const LUA_FONTSETTINGS_WRAPPER_FIRST_RET_VAS = Object.freeze([
  0x008a8a3f, 0x008a8aa0,
  0x008a89db, 0x008a8b0b, 0x008a8b74, 0x008a8c01, 0x008a8c78,
  0x008a8cdb, 0x008a8d53, /* Load MID-BODY RET TRAP (jne @0x8a8d3e) */
  0x008a8dcf, 0x008a8e34, 0x008a8eb5, 0x008a8f51, 0x008a8fbb,
  0x008a91eb,
]);
export const LUA_FONTSETTINGS_WRAPPER_INSN_COUNTS = Object.freeze([
  38, 55, 52, 46, 53, 60, 51, 45, 62, 40, 53, 60, 67, 44, 52,
]);
export const LUA_FONTSETTINGS_WRAPPER_CHECK_FLAGS = Object.freeze([
  0x01, 0x00, 0x00, 0x01, 0x01, 0x00, 0x01, 0x01, 0x00, 0x00,
  0x01, 0x01, 0x01, 0x01, 0x00,
]);
export const LUA_FONTSETTINGS_WRAPPER_RETURN_VALUES = Object.freeze([
  1, 0, 0, 1, 1, 0, 1, 1, 0, 0, 1, 1, 1, 1, 0,
]);
export const LUA_FONTSETTINGS_WRAPPER_ARG2_NONE = 0;
export const LUA_FONTSETTINGS_WRAPPER_ARG2_CHECKINTEGER_LOWW = 1;
export const LUA_FONTSETTINGS_WRAPPER_ARG2_CHECKINTEGER_FULLWORD = 2;
export const LUA_FONTSETTINGS_WRAPPER_ARG2_CHECKNUMBER_F32 = 3;
export const LUA_FONTSETTINGS_WRAPPER_ARG2_CHECKLSTRING_GATED = 4;
export const LUA_FONTSETTINGS_WRAPPER_ARG2_CHECKLSTRING_BYTE = 5;
export const LUA_FONTSETTINGS_WRAPPER_ARG2_KINDS = Object.freeze([
  LUA_FONTSETTINGS_WRAPPER_ARG2_NONE,            /* GetAlignment */
  LUA_FONTSETTINGS_WRAPPER_ARG2_CHECKINTEGER_LOWW, /* setter */
  LUA_FONTSETTINGS_WRAPPER_ARG2_CHECKINTEGER_FULLWORD, /* 0x8a8970 */
  LUA_FONTSETTINGS_WRAPPER_ARG2_NONE,
  LUA_FONTSETTINGS_WRAPPER_ARG2_NONE,
  LUA_FONTSETTINGS_WRAPPER_ARG2_CHECKNUMBER_F32, /* SetLineHeightModifier */
  LUA_FONTSETTINGS_WRAPPER_ARG2_NONE,
  LUA_FONTSETTINGS_WRAPPER_ARG2_NONE,
  LUA_FONTSETTINGS_WRAPPER_ARG2_CHECKLSTRING_GATED, /* Load */
  LUA_FONTSETTINGS_WRAPPER_ARG2_NONE,
  LUA_FONTSETTINGS_WRAPPER_ARG2_NONE,
  LUA_FONTSETTINGS_WRAPPER_ARG2_CHECKLSTRING_BYTE, /* GetCharacterWidth */
  LUA_FONTSETTINGS_WRAPPER_ARG2_CHECKLSTRING_GATED, /* GetStringWidth */
  LUA_FONTSETTINGS_WRAPPER_ARG2_NONE,
  LUA_FONTSETTINGS_WRAPPER_ARG2_CHECKINTEGER_FULLWORD, /* SetMissingCharacter */
]);
export const LUA_FONTSETTINGS_WRAPPER_ARG2_INDICES = Object.freeze([
  0, 2, 2, 0, 0, 2, 0, 0, 2, 0, 0, 2, 2, 0, 2,
]);
export const LUA_FONTSETTINGS_WRAPPER_TAIL_PUSHINTEGER = 0;
export const LUA_FONTSETTINGS_WRAPPER_TAIL_VOID = 1;
export const LUA_FONTSETTINGS_WRAPPER_TAIL_PUSHBOOLEAN = 2;
export const LUA_FONTSETTINGS_WRAPPER_TAIL_PUSHINT_HELPER = 3;
export const LUA_FONTSETTINGS_WRAPPER_TAIL_PUSHNUMBER_F32 = 4;
export const LUA_FONTSETTINGS_WRAPPER_TAIL_PUSHINTEGER_HI0 = 5;
export const LUA_FONTSETTINGS_WRAPPER_TAIL_KINDS = Object.freeze([
  LUA_FONTSETTINGS_WRAPPER_TAIL_PUSHINTEGER,
  LUA_FONTSETTINGS_WRAPPER_TAIL_VOID,
  LUA_FONTSETTINGS_WRAPPER_TAIL_VOID,
  LUA_FONTSETTINGS_WRAPPER_TAIL_PUSHINT_HELPER, /* GetMaxCharacters -> 0x85c010 */
  LUA_FONTSETTINGS_WRAPPER_TAIL_PUSHBOOLEAN,   /* IsAutoWrapEnabled */
  LUA_FONTSETTINGS_WRAPPER_TAIL_VOID,
  LUA_FONTSETTINGS_WRAPPER_TAIL_PUSHNUMBER_F32, /* GetLineHeightModifier */
  LUA_FONTSETTINGS_WRAPPER_TAIL_PUSHINT_HELPER, /* GetMissingCharacterOverride */
  LUA_FONTSETTINGS_WRAPPER_TAIL_VOID,           /* Load (both paths) */
  LUA_FONTSETTINGS_WRAPPER_TAIL_VOID,           /* Unload */
  LUA_FONTSETTINGS_WRAPPER_TAIL_PUSHBOOLEAN,    /* IsLoaded */
  LUA_FONTSETTINGS_WRAPPER_TAIL_PUSHINT_HELPER, /* GetCharacterWidth */
  LUA_FONTSETTINGS_WRAPPER_TAIL_PUSHINTEGER_HI0, /* GetStringWidth */
  LUA_FONTSETTINGS_WRAPPER_TAIL_PUSHINT_HELPER, /* GetLineHeight */
  LUA_FONTSETTINGS_WRAPPER_TAIL_VOID,           /* SetMissingCharacter */
]);
export const LUA_FONTSETTINGS_WRAPPER_TAIL_HELPER_VAS = Object.freeze([
  0x00b183f8, 0, 0,
  0x0085c010, /* push-u16-zext (GetMaxCharacters) */
  0x00b183ec, /* pushboolean IAT */
  0,
  0x0085c050, /* pushNumber (f64-widen) */
  0x0085bff0, /* push-u32-zext */
  0, 0,
  0x00b183ec, /* pushboolean IAT (IsLoaded) */
  0x0085bff0, /* push-u32-zext (GetCharacterWidth) */
  0x00b183f8, /* pushinteger IAT hi=0 (GetStringWidth) */
  0x0085bff0, /* push-u32-zext (GetLineHeight) */
  0,
]);
export const LUA_FONTSETTINGS_WRAPPER_REGISTRY_KEYS = Object.freeze([
  0x00c82986, 0x00c82986, 0x00c82986, 0x00c82986, 0x00c82986,
  0x00c82986, 0x00c82986, 0x00c82986,
  0x00c82989, 0x00c82989, 0x00c82989, 0x00c82989, 0x00c82989,
  0x00c82989, 0x00c82989,
]);
export const LUA_FONTSETTINGS_WRAPPER_TYPE_INDEX = 0x01;
export const LUA_FONTSETTINGS_WRAPPER_CHECK_STACK_INDEX = 0x01;
export const LUA_FONTSETTINGS_WRAPPER_REGISTRY_KEY = 0x00c82986;
export const LUA_FONTSETTINGS_WRAPPER_REGISTRY_KEY_ALPHA = 0x00c82986;
export const LUA_FONTSETTINGS_WRAPPER_REGISTRY_KEY_BETA = 0x00c82989;
export const LUA_FONTSETTINGS_WRAPPER_OBJECT_FIELD_OFF = 0x04;
export const LUA_FONTSETTINGS_WRAPPER_TOUSERDATA_INDEX_U32 = 0xfff0b9d7;
export const LUA_FONTSETTINGS_WRAPPER_FN_OFF = 0x00;
export const LUA_FONTSETTINGS_WRAPPER_CHECK_HELPER_VA = 0x0085c590;
export const LUA_FONTSETTINGS_WRAPPER_IAT_LUA_TYPE = 0x00b18400;
export const LUA_FONTSETTINGS_WRAPPER_IAT_LUA_TOUSERDATA = 0x00b183b0;
export const LUA_FONTSETTINGS_WRAPPER_IAT_LUA_CHECKINTEGER = 0x00b183f4;
export const LUA_FONTSETTINGS_WRAPPER_IAT_LUA_PUSHINTEGER = 0x00b183f8;
export const LUA_FONTSETTINGS_WRAPPER_IAT_LUA_CHECKLSTRING = 0x00b183e4;
export const LUA_FONTSETTINGS_WRAPPER_IAT_LUA_PUSHBOOLEAN = 0x00b183ec;
export const LUA_FONTSETTINGS_WRAPPER_ARG2_INDEX = 0x02;
export const LUA_FONTSETTINGS_WRAPPER_ARG2_LOW_WORD_MASK = 0xffff;
export const LUA_FONTSETTINGS_WRAPPER_SETTER_STACK_CLEAN = 0x10;
export const LUA_FONTSETTINGS_WRAPPER_GETTER_PUSH_CLEAN = 0x0c;
export const LUA_FONTSETTINGS_WRAPPER_SECOND_TYPE_CLEAN = 0x10;
export const LUA_FONTSETTINGS_WRAPPER_CHECKLSTRING_CLEAN = 0x0c;
export const LUA_FONTSETTINGS_WRAPPER_CHARBYTE_STACK_CLEAN = 0x14;
export const LUA_FONTSETTINGS_WRAPPER_PUSHINTEGER_HI0 = 0x00;
export const LUA_FONTSETTINGS_WRAPPER_PUSHINTEGER_HI0_CLEAN = 0x0c;
export const LUA_FONTSETTINGS_WRAPPER_INSTALL_VAS = Object.freeze([
  0x0089fde0, /* DUAL_IMM — GetAlignment */
  0x0089fd80, /* SINGLE — setter */
  0x0089fe80, /* SINGLE — SetAlignment (0x8a8970 also pushed by 0x89fae0) */
  0x0089fce0, /* DUAL_IMM — GetMaxCharacters */
  0x0089fc40, /* DUAL-reg — IsAutoWrapEnabled */
  0x0089fbe0, /* SINGLE — SetLineHeightModifier */
  0x0089fb40, /* DUAL_IMM — GetLineHeightModifier */
  0x0089fa40, /* DUAL_IMM — GetMissingCharacterOverride */
  0x0089f9e0, /* SINGLE — Load */
  0x0089f980, /* SINGLE — Unload */
  0x0089f8e0, /* DUAL_IMM — IsLoaded */
  0x0089f840, /* DUAL_IMM — GetCharacterWidth */
  0x0089f7a0, /* DUAL_IMM — GetStringWidth */
  0x0089f700, /* DUAL-reg — GetLineHeight */
  0x0089f600, /* SINGLE — SetMissingCharacter */
]);
export const LUA_FONTSETTINGS_WRAPPER_INSTALL_LITERAL_VAS = Object.freeze([
  0x0089fdf7, /* fn-literal dword value bytes (push opcode at -1) */
  0x0089fd99,
  0x0089fe8f, 0x0089fcf7, 0x0089fc62, 0x0089fbf0, 0x0089fb57,
  0x0089fa57, 0x0089f9f0, 0x0089f990, 0x0089f8f7, 0x0089f857,
  0x0089f7b7, 0x0089f722, 0x0089f60f,
]);
export const LUA_FONTSETTINGS_SITE_COUNT = 21;
export const LUA_FONTSETTINGS_SITES = Object.freeze([
  { call: 0x00866dcc, name: 0x00b702a0, realFn: 0x0040c3a0,
    helper: 0x0089fde0, wrapper: 0x008a89e0 }, /* GetAlignment */
  { call: 0x00866de1, name: 0x00b702b0, realFn: 0x00a1a5d0,
    helper: 0x0089fd80, wrapper: 0x008a8a40 }, /* SetMaxCharacters */
  { call: 0x00866e0b, name: 0x00b703a8, realFn: 0x0085e450,
    helper: 0x0089fd80, wrapper: 0x008a8a40 }, /* EnableAutoWrap */
  { call: 0x00866e35, name: 0x00b70380, realFn: 0x00a1a600,
    helper: 0x0089fd80, wrapper: 0x008a8a40 }, /* EnableTruncation */
  /* v51 sites 4..20 (append order; SetAlignment predates GetAlignment). */
  { call: 0x00866db7, name: 0x00b702d8, realFn: 0x00a1a5c0,
    helper: 0x0089fe80, wrapper: 0x008a8970 }, /* SetAlignment */
  { call: 0x00866df6, name: 0x00b70394, realFn: 0x00a1a5e0,
    helper: 0x0089fce0, wrapper: 0x008a8ab0 }, /* GetMaxCharacters */
  { call: 0x00866e20, name: 0x00b7036c, realFn: 0x00a1a5f0,
    helper: 0x0089fc40, wrapper: 0x008a8b10 }, /* IsAutoWrapEnabled */
  { call: 0x00866e4a, name: 0x00b70340, realFn: 0x00a1a620,
    helper: 0x0089fc40, wrapper: 0x008a8b10 }, /* IsTruncationEnabled */
  { call: 0x00866e5f, name: 0x00b70354, realFn: 0x00407280,
    helper: 0x0089fbe0, wrapper: 0x008a8b80 }, /* SetLineHeightModifier */
  { call: 0x00866e74, name: 0x00b7030c, realFn: 0x00407270,
    helper: 0x0089fb40, wrapper: 0x008a8c10 }, /* GetLineHeightModifier */
  { call: 0x00866e89, name: 0x00b70324, realFn: 0x00a1a630,
    helper: 0x0089fae0, wrapper: 0x008a8970 }, /* SetMissingCharacterOverride */
  { call: 0x00866e9e, name: 0x00b70408, realFn: 0x0040c2e0,
    helper: 0x0089fa40, wrapper: 0x008a8c80 }, /* GetMissingCharacterOverride */
  { call: 0x00866efc, name: 0x00b703f8, realFn: 0x0085e470,
    helper: 0x0089f9e0, wrapper: 0x008a8ce0 }, /* Load */
  { call: 0x00866f11, name: 0x00b70400, realFn: 0x00a1ad90,
    helper: 0x0089f980, wrapper: 0x008a8d80 }, /* Unload */
  { call: 0x00866f26, name: 0x00b703d8, realFn: 0x006b83d0,
    helper: 0x0089f8e0, wrapper: 0x008a8dd0 }, /* IsLoaded */
  { call: 0x00866f3b, name: 0x00b703e4, realFn: 0x00a1ae70,
    helper: 0x0089f840, wrapper: 0x008a8e40 }, /* GetCharacterWidth */
  { call: 0x00866f50, name: 0x00b703b8, realFn: 0x00a1ae80,
    helper: 0x0089f7a0, wrapper: 0x008a8ec0 }, /* GetStringWidth */
  { call: 0x00866f65, name: 0x00b703c8, realFn: 0x00a1aea0,
    helper: 0x0089f700, wrapper: 0x008a8f60 }, /* GetLineHeight */
  { call: 0x00866f7a, name: 0x00b70454, realFn: 0x00a1aeb0,
    helper: 0x0089f700, wrapper: 0x008a8f60 }, /* GetBaselineHeight */
  { call: 0x00866f8f, name: 0x00b70468, realFn: 0x00a1b140,
    helper: 0x0089f660, wrapper: 0x008a8fc0 }, /* DrawString */
  { call: 0x00866fa4, name: 0x00b7043c, realFn: 0x00a1b3b0,
    helper: 0x0089f600, wrapper: 0x008a9180 }, /* SetMissingCharacter */
]);

function fontsettingsWrapperIndexOk(index) {
  return index >= 0 && index < LUA_FONTSETTINGS_WRAPPER_COUNT;
}

export function luaEngineFontsettingsWrapperCount() {
  return LUA_FONTSETTINGS_WRAPPER_COUNT;
}
export function luaEngineFontsettingsWrapperVa(index) {
  return fontsettingsWrapperIndexOk(index) ? LUA_FONTSETTINGS_WRAPPER_VAS[index] >>> 0 : 0;
}
export function luaEngineFontsettingsWrapperRetVa(index) {
  return fontsettingsWrapperIndexOk(index) ? LUA_FONTSETTINGS_WRAPPER_RET_VAS[index] >>> 0 : 0;
}
export function luaEngineFontsettingsWrapperBodyBytes(index) {
  if (!fontsettingsWrapperIndexOk(index)) return 0;
  return (LUA_FONTSETTINGS_WRAPPER_RET_VAS[index] - LUA_FONTSETTINGS_WRAPPER_VAS[index]) >>> 0;
}
export function luaEngineFontsettingsWrapperInsnCount(index) {
  return fontsettingsWrapperIndexOk(index) ? LUA_FONTSETTINGS_WRAPPER_INSN_COUNTS[index] : -1;
}
export function luaEngineFontsettingsWrapperCheckFlags(index) {
  return fontsettingsWrapperIndexOk(index) ? LUA_FONTSETTINGS_WRAPPER_CHECK_FLAGS[index] : -1;
}
export function luaEngineFontsettingsWrapperReturnValue(index) {
  return fontsettingsWrapperIndexOk(index) ? LUA_FONTSETTINGS_WRAPPER_RETURN_VALUES[index] : -1;
}
export function luaEngineFontsettingsWrapperArg2Kind(index) {
  return fontsettingsWrapperIndexOk(index) ? LUA_FONTSETTINGS_WRAPPER_ARG2_KINDS[index] : -1;
}
export function luaEngineFontsettingsWrapperArg2Index(index) {
  return fontsettingsWrapperIndexOk(index) ? LUA_FONTSETTINGS_WRAPPER_ARG2_INDICES[index] : -1;
}
export function luaEngineFontsettingsWrapperTailKind(index) {
  return fontsettingsWrapperIndexOk(index) ? LUA_FONTSETTINGS_WRAPPER_TAIL_KINDS[index] : -1;
}
export function luaEngineFontsettingsWrapperTypeIndex() {
  return LUA_FONTSETTINGS_WRAPPER_TYPE_INDEX >>> 0;
}
export function luaEngineFontsettingsWrapperCheckStackIndex() {
  return LUA_FONTSETTINGS_WRAPPER_CHECK_STACK_INDEX >>> 0;
}
export function luaEngineFontsettingsWrapperRegistryKey() {
  return LUA_FONTSETTINGS_WRAPPER_REGISTRY_KEY >>> 0;
}
export function luaEngineFontsettingsWrapperObjectFieldOff() {
  return LUA_FONTSETTINGS_WRAPPER_OBJECT_FIELD_OFF >>> 0;
}
export function luaEngineFontsettingsWrapperTouserdataIndex() {
  return LUA_FONTSETTINGS_WRAPPER_TOUSERDATA_INDEX_U32 >>> 0;
}
export function luaEngineFontsettingsWrapperFnOff() {
  return LUA_FONTSETTINGS_WRAPPER_FN_OFF >>> 0;
}
export function luaEngineFontsettingsWrapperCheckHelperVa() {
  return LUA_FONTSETTINGS_WRAPPER_CHECK_HELPER_VA >>> 0;
}
export function luaEngineFontsettingsWrapperIatLuaType() {
  return LUA_FONTSETTINGS_WRAPPER_IAT_LUA_TYPE >>> 0;
}
export function luaEngineFontsettingsWrapperIatLuaTouserdata() {
  return LUA_FONTSETTINGS_WRAPPER_IAT_LUA_TOUSERDATA >>> 0;
}
export function luaEngineFontsettingsWrapperIatLuaCheckinteger() {
  return LUA_FONTSETTINGS_WRAPPER_IAT_LUA_CHECKINTEGER >>> 0;
}
export function luaEngineFontsettingsWrapperIatLuaPushinteger() {
  return LUA_FONTSETTINGS_WRAPPER_IAT_LUA_PUSHINTEGER >>> 0;
}
export function luaEngineFontsettingsWrapperObjectResolve(typeResult, checkField) {
  /* PE `test eax,eax; je obj_zero` — FULL-WORD gate, never byte-masked. */
  return (typeResult !== 0) ? (checkField >>> 0) : 0;
}
export function luaEngineFontsettingsWrapperArg2LowWord(value) {
  /* PE `movzx edx, ax` @ 0x8a8a90 — LOW-WORD (16-bit) zero-extend. */
  return (value & LUA_FONTSETTINGS_WRAPPER_ARG2_LOW_WORD_MASK) >>> 0;
}
export function luaEngineFontsettingsWrapperGetterLuaIntegerHi(value) {
  /* PE `cdq` @ 0x8a8a2a sign-extends the fn i32 return for pushinteger. */
  return (value & 0x80000000) !== 0 ? 0xffffffff : 0;
}
export function luaEngineFontsettingsWrapperGetterPushCleanup() {
  return LUA_FONTSETTINGS_WRAPPER_GETTER_PUSH_CLEAN >>> 0;
}
export function luaEngineFontsettingsWrapperSetterStackClean() {
  return LUA_FONTSETTINGS_WRAPPER_SETTER_STACK_CLEAN >>> 0;
}
export function luaEngineFontsettingsWrapperRegistryKeyAt(index) {
  return fontsettingsWrapperIndexOk(index)
    ? LUA_FONTSETTINGS_WRAPPER_REGISTRY_KEYS[index] >>> 0 : 0;
}
export function luaEngineFontsettingsWrapperFirstRetVa(index) {
  return fontsettingsWrapperIndexOk(index)
    ? LUA_FONTSETTINGS_WRAPPER_FIRST_RET_VAS[index] >>> 0 : 0;
}
export function luaEngineFontsettingsWrapperTailHelperVa(index) {
  return fontsettingsWrapperIndexOk(index)
    ? LUA_FONTSETTINGS_WRAPPER_TAIL_HELPER_VAS[index] >>> 0 : 0;
}
export function luaEngineFontsettingsWrapperArg2FullWord(value) {
  /* PE `push eax` @ 0x8a89cf (0x8a8970) / 0x8a91df (0x8a9180): the whole
   * checkinteger result crosses to ud[0] — NO movzx. A LOWW/byte fold
   * would kill 0x10000/0x100. */
  return value >>> 0;
}
export function luaEngineFontsettingsWrapperArg2Byte0(value) {
  /* PE `mov dl,[eax]` @ 0x8a8e95 (0x8a8e40): byte0 of the checklstring.
   * The pushed dword carries the [ebp-4] slot's garbage upper bytes; the
   * meaningful law is the low byte. */
  return (value & 0xff) >>> 0;
}
export function luaEngineFontsettingsWrapperChecklstringGate(typeResult, stringResult) {
  /* PE `call [0xb18400]` (second lua_type(L,2)) + FULL-WORD `test eax,eax`
   * @ 0x8a8d3c (Load) / 0x8a8f1c (GetStringWidth): nil -> NULL arg,
   * any non-zero type -> the checklstring(L,2,NULL) result. */
  return typeResult >>> 0 !== 0 ? stringResult >>> 0 : 0;
}
export function luaEngineFontsettingsWrapperBoolLowByte(value) {
  /* PE `xor ecx,ecx; test al,al; setne cl` @ 0x8a8b5a (0x8a8b10) /
   * 0x8a8e1a (0x8a8dd0): LOW-BYTE test of the fn's bool return. */
  return (value & 0xff) !== 0 ? 1 : 0;
}
export function luaEngineFontsettingsWrapperIatLuaChecklstring() {
  return LUA_FONTSETTINGS_WRAPPER_IAT_LUA_CHECKLSTRING >>> 0;
}
export function luaEngineFontsettingsWrapperIatLuaPushboolean() {
  return LUA_FONTSETTINGS_WRAPPER_IAT_LUA_PUSHBOOLEAN >>> 0;
}
export function luaEngineFontsettingsWrapperSecondTypeClean() {
  return LUA_FONTSETTINGS_WRAPPER_SECOND_TYPE_CLEAN >>> 0;
}
export function luaEngineFontsettingsWrapperChecklstringClean() {
  return LUA_FONTSETTINGS_WRAPPER_CHECKLSTRING_CLEAN >>> 0;
}
export function luaEngineFontsettingsWrapperCharbyteStackClean() {
  return LUA_FONTSETTINGS_WRAPPER_CHARBYTE_STACK_CLEAN >>> 0;
}
export function luaEngineFontsettingsWrapperPushintegerHi0() {
  return LUA_FONTSETTINGS_WRAPPER_PUSHINTEGER_HI0 >>> 0;
}
export function luaEngineFontsettingsWrapperPushintegerHi0Clean() {
  return LUA_FONTSETTINGS_WRAPPER_PUSHINTEGER_HI0_CLEAN >>> 0;
}
export function luaEngineFontsettingsWrapperInstallVa(index) {
  return fontsettingsWrapperIndexOk(index) ? LUA_FONTSETTINGS_WRAPPER_INSTALL_VAS[index] >>> 0 : 0;
}
export function luaEngineFontsettingsWrapperInstallLiteralVa(index) {
  return fontsettingsWrapperIndexOk(index)
    ? LUA_FONTSETTINGS_WRAPPER_INSTALL_LITERAL_VAS[index] >>> 0 : 0;
}
export function luaEngineFontsettingsSiteCount() {
  return LUA_FONTSETTINGS_SITE_COUNT;
}
export function luaEngineFontsettingsSiteCallVa(index) {
  const s = LUA_FONTSETTINGS_SITES[index];
  return s ? s.call >>> 0 : 0;
}
export function luaEngineFontsettingsSiteNameVa(index) {
  const s = LUA_FONTSETTINGS_SITES[index];
  return s ? s.name >>> 0 : 0;
}
export function luaEngineFontsettingsSiteRealFnVa(index) {
  const s = LUA_FONTSETTINGS_SITES[index];
  return s ? s.realFn >>> 0 : 0;
}
export function luaEngineFontsettingsSiteHelperVa(index) {
  const s = LUA_FONTSETTINGS_SITES[index];
  return s ? s.helper >>> 0 : 0;
}
export function luaEngineFontsettingsSiteWrapperVa(index) {
  const s = LUA_FONTSETTINGS_SITES[index];
  return s ? s.wrapper >>> 0 : 0;
}

/* ---- ABI v52: DrawString wrapper 0x008a8fc0 + vec-construction helper
 * 0x008baab0 + by-reference getter 0x008bb070.
 *
 * PE-truth (fresh dumps 008a8fc0.txt / 008baab0.txt / 008bb070.txt +
 * 008bb0a0 tail; lua-v52-drawstring-8fc0 notes). All three bodies were
 * absent from the family sources (DATA rows only) — CONFIRMED OPEN.
 * 0x85c590 (check/get, already pure since v11/v12) and all lua_* IAT
 * bodies stay host.
 * ---------------------------------------------------------------------- */
export const LUA_DRAWSTRING_WRAPPER_VA = 0x008a8fc0;
export const LUA_DRAWSTRING_WRAPPER_RET_VA = 0x008a917a;
export const LUA_DRAWSTRING_WRAPPER_INSNS = 127;
export const LUA_DRAWSTRING_SEH_HANDLER_VA = 0x00b053a8;
export const LUA_DRAWSTRING_GS_COOKIE_VA = 0x00bf93b4;
export const LUA_DRAWSTRING_CHECK_FLAGS = 1;
export const LUA_DRAWSTRING_REGISTRY_KEY = 0x00c82989;
export const LUA_DRAWSTRING_CHECK_EDX = 1;
export const LUA_DRAWSTRING_TYPE_INDEX = 0x01;
export const LUA_DRAWSTRING_OBJECT_FIELD_OFF = 0x04;
export const LUA_DRAWSTRING_TOUSERDATA_INDEX_U32 = 0xfff0b9d7;
export const LUA_DRAWSTRING_FN_OFF = 0x00;
export const LUA_DRAWSTRING_IAT_LUA_TYPE = 0x00b18400;
export const LUA_DRAWSTRING_IAT_LUA_TOUSERDATA = 0x00b183b0;
export const LUA_DRAWSTRING_IAT_LUA_CHECKLSTRING = 0x00b183e4;
export const LUA_DRAWSTRING_CHECKLSTRING_CLEAN = 0x0c;
export const LUA_DRAWSTRING_VEC_HELPER_VA = 0x008baab0;
export const LUA_DRAWSTRING_VEC_OUT_FRAME_OFF = 0xec;
export const LUA_DRAWSTRING_CALL_ARGS = 7;
export const LUA_DRAWSTRING_CALL_F32_COUNT = 4;
export const LUA_DRAWSTRING_CALL_STRUCT_COUNT = 2;
export const LUA_DRAWSTRING_RETURN_VALUE = 0;
export const LUA_DRAWSTRING_INSTALL_HELPER_VA = 0x0089f660;
export const LUA_DRAWSTRING_INSTALL_LITERAL_VA = 0x0089f677;

export const LUA_DRAWSTRING_VEC_RET_VA = 0x008babf6;
export const LUA_DRAWSTRING_VEC_INSNS = 100;
export const LUA_DRAWSTRING_VEC_RET_CLEAN = 4;
export const LUA_DRAWSTRING_VEC_OUT_ECX = 1;
export const LUA_DRAWSTRING_VEC_GATE_TYPE_INDEX = 0x08;
export const LUA_DRAWSTRING_VEC_GATE_CHECK_FLAGS = 1;
export const LUA_DRAWSTRING_VEC_GATE_REGISTRY_KEY = 0x00c82986;
export const LUA_DRAWSTRING_VEC_GATE_CHECK_EDX = 0x08;
export const LUA_DRAWSTRING_VEC_GATE_OBJECT_FIELD_OFF = 0x04;
export const LUA_DRAWSTRING_VEC_ERROR_MSG_VA = 0x00b7539c;
export const LUA_DRAWSTRING_VEC_IAT_LUA_ERROR = 0x00b18390;
export const LUA_DRAWSTRING_VEC_GETREF_EDX = 0x07;
export const LUA_DRAWSTRING_VEC_GETREF_HELPER_VA = 0x008bb070;
export const LUA_DRAWSTRING_VEC_IAT_LUA_CHECKNUMBER = 0x00b18324;
export const LUA_DRAWSTRING_VEC_CHECKNUMBER_COUNT = 4;
export const LUA_DRAWSTRING_VEC_U32_OUT_OFF = 0x20;
export const LUA_DRAWSTRING_VEC_U32_OBJ7_FIELD_OFF = 0x10;
export const LUA_DRAWSTRING_VEC_BLOCK16_A_OUT_OFF = 0x24;
export const LUA_DRAWSTRING_VEC_BLOCK16_A_SRC_OFF = 0x00;
export const LUA_DRAWSTRING_VEC_BLOCK16_B_OUT_OFF = 0x34;
export const LUA_DRAWSTRING_VEC_BLOCK16_B_SRC_OFF = 0x10;
export const LUA_DRAWSTRING_VEC_BLOCK16_B_SRC_DWORD_OFF = 0x18;
export const LUA_DRAWSTRING_VEC_BLOCK16_B_VALID_BYTES = 12;

export const LUA_DRAWSTRING_GETREF_VA = 0x008bb070;
export const LUA_DRAWSTRING_GETREF_RET_VA = 0x008bb0c8;
export const LUA_DRAWSTRING_GETREF_NIL_RET_VA = 0x008bb09a;
export const LUA_DRAWSTRING_GETREF_INSNS = 36;
export const LUA_DRAWSTRING_GETREF_CHECK_FLAGS = 1;
export const LUA_DRAWSTRING_GETREF_REGISTRY_KEY = 0x00c82983;
export const LUA_DRAWSTRING_GETREF_EDX_REGISTER = 1;
export const LUA_DRAWSTRING_GETREF_OBJECT_FIELD_OFF = 0x04;
export const LUA_DRAWSTRING_GETREF_IAT_LUA_TYPE = 0x00b18400;
export const LUA_DRAWSTRING_GETREF_IAT_LUA_ERROR = 0x00b18390;
export const LUA_DRAWSTRING_GETREF_ERROR_MSG_VA = 0x00b7539c;

export function luaEngineDrawstringWrapperVa() {
  return LUA_DRAWSTRING_WRAPPER_VA >>> 0;
}
export function luaEngineDrawstringWrapperRetVa() {
  return LUA_DRAWSTRING_WRAPPER_RET_VA >>> 0;
}
export function luaEngineDrawstringWrapperBodyBytes() {
  return (LUA_DRAWSTRING_WRAPPER_RET_VA - LUA_DRAWSTRING_WRAPPER_VA) >>> 0;
}
export function luaEngineDrawstringWrapperInsnCount() {
  return LUA_DRAWSTRING_WRAPPER_INSNS | 0;
}
export function luaEngineDrawstringSehHandlerVa() {
  return LUA_DRAWSTRING_SEH_HANDLER_VA >>> 0;
}
export function luaEngineDrawstringGsCookieVa() {
  return LUA_DRAWSTRING_GS_COOKIE_VA >>> 0;
}
export function luaEngineDrawstringCheckFlags() {
  return LUA_DRAWSTRING_CHECK_FLAGS | 0;
}
export function luaEngineDrawstringRegistryKey() {
  return LUA_DRAWSTRING_REGISTRY_KEY >>> 0;
}
export function luaEngineDrawstringCheckEdx() {
  return LUA_DRAWSTRING_CHECK_EDX | 0;
}
export function luaEngineDrawstringTypeIndex() {
  return LUA_DRAWSTRING_TYPE_INDEX >>> 0;
}
export function luaEngineDrawstringObjectFieldOff() {
  return LUA_DRAWSTRING_OBJECT_FIELD_OFF >>> 0;
}
export function luaEngineDrawstringTouserdataIndex() {
  return LUA_DRAWSTRING_TOUSERDATA_INDEX_U32 >>> 0;
}
export function luaEngineDrawstringFnOff() {
  return LUA_DRAWSTRING_FN_OFF >>> 0;
}
export function luaEngineDrawstringIatLuaType() {
  return LUA_DRAWSTRING_IAT_LUA_TYPE >>> 0;
}
export function luaEngineDrawstringIatLuaTouserdata() {
  return LUA_DRAWSTRING_IAT_LUA_TOUSERDATA >>> 0;
}
export function luaEngineDrawstringIatLuaChecklstring() {
  return LUA_DRAWSTRING_IAT_LUA_CHECKLSTRING >>> 0;
}
export function luaEngineDrawstringChecklstringClean() {
  return LUA_DRAWSTRING_CHECKLSTRING_CLEAN >>> 0;
}
export function luaEngineDrawstringVecHelperVa() {
  return LUA_DRAWSTRING_VEC_HELPER_VA >>> 0;
}
export function luaEngineDrawstringVecOutFrameOff() {
  return LUA_DRAWSTRING_VEC_OUT_FRAME_OFF >>> 0;
}
export function luaEngineDrawstringCallArgs() {
  return LUA_DRAWSTRING_CALL_ARGS | 0;
}
export function luaEngineDrawstringCallF32Count() {
  return LUA_DRAWSTRING_CALL_F32_COUNT | 0;
}
export function luaEngineDrawstringCallStructCount() {
  return LUA_DRAWSTRING_CALL_STRUCT_COUNT | 0;
}
export function luaEngineDrawstringReturnValue() {
  return LUA_DRAWSTRING_RETURN_VALUE | 0;
}
export function luaEngineDrawstringInstallHelperVa() {
  return LUA_DRAWSTRING_INSTALL_HELPER_VA >>> 0;
}
export function luaEngineDrawstringInstallLiteralVa() {
  return LUA_DRAWSTRING_INSTALL_LITERAL_VA >>> 0;
}
export function luaEngineDrawstringObjectResolve(typeResult, checkField) {
  /* PE `test eax,eax; je obj_zero` @ 0x8a8ff8 — FULL-WORD gate of the
   * lua_type(L,1) result; obj = (type != 0) ? [eax+4] : 0. */
  return typeResult >>> 0 !== 0 ? checkField >>> 0 : 0;
}
export function luaEngineDrawstringTextArg(typeResult, lstringResult) {
  /* PE second lua_type(L,2) + FULL-WORD `test eax,eax` @ 0x8a904a: nil ->
   * text=0 (no checklstring), any non-zero -> the checklstring(L,2,NULL)
   * result. Never byte-masked. */
  return typeResult >>> 0 !== 0 ? lstringResult >>> 0 : 0;
}

export function luaEngineDrawstringVecHelperRetVa() {
  return LUA_DRAWSTRING_VEC_RET_VA >>> 0;
}
export function luaEngineDrawstringVecHelperBodyBytes() {
  return (LUA_DRAWSTRING_VEC_RET_VA - LUA_DRAWSTRING_VEC_HELPER_VA) >>> 0;
}
export function luaEngineDrawstringVecHelperInsnCount() {
  return LUA_DRAWSTRING_VEC_INSNS | 0;
}
export function luaEngineDrawstringVecHelperRetClean() {
  return LUA_DRAWSTRING_VEC_RET_CLEAN | 0;
}
export function luaEngineDrawstringVecOutEcx() {
  return LUA_DRAWSTRING_VEC_OUT_ECX | 0;
}
export function luaEngineDrawstringVecGateTypeIndex() {
  return LUA_DRAWSTRING_VEC_GATE_TYPE_INDEX >>> 0;
}
export function luaEngineDrawstringVecGateCheckFlags() {
  return LUA_DRAWSTRING_VEC_GATE_CHECK_FLAGS | 0;
}
export function luaEngineDrawstringVecGateRegistryKey() {
  return LUA_DRAWSTRING_VEC_GATE_REGISTRY_KEY >>> 0;
}
export function luaEngineDrawstringVecGateCheckEdx() {
  return LUA_DRAWSTRING_VEC_GATE_CHECK_EDX | 0;
}
export function luaEngineDrawstringVecGateObjectFieldOff() {
  return LUA_DRAWSTRING_VEC_GATE_OBJECT_FIELD_OFF >>> 0;
}
export function luaEngineDrawstringVecErrorMsgVa() {
  return LUA_DRAWSTRING_VEC_ERROR_MSG_VA >>> 0;
}
export function luaEngineDrawstringVecIatLuaError() {
  return LUA_DRAWSTRING_VEC_IAT_LUA_ERROR >>> 0;
}
export function luaEngineDrawstringVecGetrefEdx() {
  return LUA_DRAWSTRING_VEC_GETREF_EDX | 0;
}
export function luaEngineDrawstringVecGetrefHelperVa() {
  return LUA_DRAWSTRING_VEC_GETREF_HELPER_VA >>> 0;
}
export function luaEngineDrawstringVecIatLuaChecknumber() {
  return LUA_DRAWSTRING_VEC_IAT_LUA_CHECKNUMBER >>> 0;
}
export function luaEngineDrawstringVecChecknumberCount() {
  return LUA_DRAWSTRING_VEC_CHECKNUMBER_COUNT | 0;
}
export function luaEngineDrawstringVecU32OutOff() {
  return LUA_DRAWSTRING_VEC_U32_OUT_OFF >>> 0;
}
export function luaEngineDrawstringVecU32Obj7FieldOff() {
  return LUA_DRAWSTRING_VEC_U32_OBJ7_FIELD_OFF >>> 0;
}
export function luaEngineDrawstringVecBlock16AOutOff() {
  return LUA_DRAWSTRING_VEC_BLOCK16_A_OUT_OFF >>> 0;
}
export function luaEngineDrawstringVecBlock16ASrcOff() {
  return LUA_DRAWSTRING_VEC_BLOCK16_A_SRC_OFF >>> 0;
}
export function luaEngineDrawstringVecBlock16BOutOff() {
  return LUA_DRAWSTRING_VEC_BLOCK16_B_OUT_OFF >>> 0;
}
export function luaEngineDrawstringVecBlock16BSrcOff() {
  return LUA_DRAWSTRING_VEC_BLOCK16_B_SRC_OFF >>> 0;
}
export function luaEngineDrawstringVecBlock16BSrcDwordOff() {
  return LUA_DRAWSTRING_VEC_BLOCK16_B_SRC_DWORD_OFF >>> 0;
}
export function luaEngineDrawstringVecBlock16BValidBytes() {
  return LUA_DRAWSTRING_VEC_BLOCK16_B_VALID_BYTES | 0;
}
export function luaEngineDrawstringVecOutF32OffAt(checknumberIndex) {
  /* PE fstp stores: checknumber(L,6) -> OUT+0xc, (L,5) -> OUT+0x08,
   * (L,4) -> OUT+0x04, (L,3) -> OUT+0x00 (`fstp [eax]` tail). */
  const idx = checknumberIndex | 0;
  if (idx < 3 || idx > 6) return 0;
  return (idx - 3) << 2;
}
export function luaEngineDrawstringVecObj7F32OffAt(lane) {
  /* OUT f32 lanes 4..7 read obj7 + {0,4,8,0xc}. */
  const l = lane | 0;
  if (l < 4 || l > 7) return 0;
  return (l - 4) << 2;
}
export function luaEngineDrawstringVecGate(typeResult, checkField) {
  /* FULL-WORD two-gate (arg8): lua_type(L,8) != 0 and obj8=[eax+4] != 0
   * both tested full-word; any 0 -> luaL_error (raises), law value 0. */
  return typeResult >>> 0 !== 0 && checkField >>> 0 !== 0
    ? checkField >>> 0 : 0;
}
export function luaEngineDrawstringGetrefResolve(typeResult, checkField) {
  /* getRef 0x8bb070: lua_type(L,idx) FULL-WORD gate; nil -> error (raise)
   * + ret 0; else obj=[eax+4]; obj==0 -> error; ret obj. */
  return typeResult >>> 0 !== 0 ? checkField >>> 0 : 0;
}
export function luaEngineDrawstringGetrefEdxIndex(index) {
  /* The idx REGISTER crosses unchanged to lua_type and 0x85c590's edx.
   * FULL-WORD passthrough (0x100/0x10000 must survive). */
  return index >>> 0;
}
export function luaEngineDrawstringGetrefVa() {
  return LUA_DRAWSTRING_GETREF_VA >>> 0;
}
export function luaEngineDrawstringGetrefRetVa() {
  return LUA_DRAWSTRING_GETREF_RET_VA >>> 0;
}
export function luaEngineDrawstringGetrefNilRetVa() {
  return LUA_DRAWSTRING_GETREF_NIL_RET_VA >>> 0;
}
export function luaEngineDrawstringGetrefBodyBytes() {
  return (LUA_DRAWSTRING_GETREF_RET_VA - LUA_DRAWSTRING_GETREF_VA) >>> 0;
}
export function luaEngineDrawstringGetrefInsnCount() {
  return LUA_DRAWSTRING_GETREF_INSNS | 0;
}
export function luaEngineDrawstringGetrefCheckFlags() {
  return LUA_DRAWSTRING_GETREF_CHECK_FLAGS | 0;
}
export function luaEngineDrawstringGetrefRegistryKey() {
  return LUA_DRAWSTRING_GETREF_REGISTRY_KEY >>> 0;
}
export function luaEngineDrawstringGetrefEdxRegister() {
  return LUA_DRAWSTRING_GETREF_EDX_REGISTER | 0;
}
export function luaEngineDrawstringGetrefObjectFieldOff() {
  return LUA_DRAWSTRING_GETREF_OBJECT_FIELD_OFF >>> 0;
}
export function luaEngineDrawstringGetrefIatLuaType() {
  return LUA_DRAWSTRING_GETREF_IAT_LUA_TYPE >>> 0;
}
export function luaEngineDrawstringGetrefIatLuaError() {
  return LUA_DRAWSTRING_GETREF_IAT_LUA_ERROR >>> 0;
}
export function luaEngineDrawstringGetrefErrorMsgVa() {
  return LUA_DRAWSTRING_GETREF_ERROR_MSG_VA >>> 0;
}


/* ---- ABI v53: pusher leaf stubs 0x85c050 / 0x85bff0 / 0x85c010 + the
 * 0x85c590 true-body bounds. The three pushers were only PINNED by
 * callers before (v36/v39/v45/v51 HOST_VA_PUSH / TAIL_HELPER_VA /
 * PUSH_*_ZEXT_VA constants); this band lands their BODY laws. Machine
 * truth: cpu-dump/0085c050.txt (13 insns, ret 0x85c072),
 * 0085bff0.txt (11 insns, ret 0x85c006), 0085c010.txt (13 insns, ret
 * 0x85c029) — see section-notes/lua-v53-pushers. 0x85c590's decision
 * islands were landed at v11/v12; the BODY BOUNDS (dual ret) are new:
 * census "first_ret 0x85c700 rets 1" records a MID-BODY TRAP RET
 * (identity-success path), TRUE final ret @0x85c7d0 (argerror tail).
 * ------------------------------------------------------------------ */
export const LUA_PUSHER_COUNT = 4;
export const LUA_PUSHER_KIND_PUSHNUMBER_F32 = 0;
export const LUA_PUSHER_KIND_PUSHINT_U32 = 1;
export const LUA_PUSHER_KIND_PUSHINT_U16 = 2;
export const LUA_PUSHER_KIND_PUSHINT_I32_SEXT = 3;
export const LUA_PUSHER_VAS = Object.freeze([
  0x0085c050, 0x0085bff0, 0x0085c010, 0x0085bfd0]);
export const LUA_PUSHER_RET_VAS = Object.freeze([
  0x0085c072, 0x0085c006, 0x0085c029, 0x0085bfe8]);
export const LUA_PUSHER_INSN_COUNTS = Object.freeze([13, 11, 13, 13]);
export const LUA_PUSHER_STACK_ALIGN_MASKS = Object.freeze([
  0xffffffc0, 0xfffffff8, 0xfffffff8, 0xfffffff8]);
export const LUA_PUSHER_F64_SLOT_BYTES = Object.freeze([8, 0, 0, 0]);
export const LUA_PUSHER_IAT_VAS = Object.freeze([
  0x00b183f0, 0x00b183f8, 0x00b183f8, 0x00b183f8]);
export const LUA_PUSHER_CALL_CLEANUPS = Object.freeze([0x0c, 0x0c, 0x0c, 0x0c]);
export const LUA_PUSHER_KINDS = Object.freeze([
  LUA_PUSHER_KIND_PUSHNUMBER_F32,
  LUA_PUSHER_KIND_PUSHINT_U32,
  LUA_PUSHER_KIND_PUSHINT_U16,
  LUA_PUSHER_KIND_PUSHINT_I32_SEXT]);

export const LUA_CHECK_GET_BODY_VA = 0x0085c590;
export const LUA_CHECK_GET_SUCCESS_RET_VA = 0x0085c700;
export const LUA_CHECK_GET_TRUE_RET_VA = 0x0085c7d0;
export const LUA_CHECK_GET_BODY_INSNS = 215;
export const LUA_CHECK_GET_SUCCESS_IAT_LUA_TOUSERDATA = 0x00b183b0;
export const LUA_CHECK_GET_SUCCESS_CLEANUP = 0x08;

function pusherOk(index) {
  return Number.isInteger(index) && index >= 0 && index < LUA_PUSHER_COUNT;
}

export function luaEnginePusherCount() {
  return LUA_PUSHER_COUNT | 0;
}
export function luaEnginePusherVa(index) {
  return pusherOk(index) ? LUA_PUSHER_VAS[index] >>> 0 : 0;
}
export function luaEnginePusherRetVa(index) {
  return pusherOk(index) ? LUA_PUSHER_RET_VAS[index] >>> 0 : 0;
}
export function luaEnginePusherBodyBytes(index) {
  if (!pusherOk(index)) return 0;
  return (LUA_PUSHER_RET_VAS[index] - LUA_PUSHER_VAS[index]) >>> 0;
}
export function luaEnginePusherInsnCount(index) {
  return pusherOk(index) ? LUA_PUSHER_INSN_COUNTS[index] | 0 : -1;
}
export function luaEnginePusherStackAlignMask(index) {
  return pusherOk(index) ? LUA_PUSHER_STACK_ALIGN_MASKS[index] >>> 0 : 0;
}
export function luaEnginePusherF64SlotBytes(index) {
  return pusherOk(index) ? LUA_PUSHER_F64_SLOT_BYTES[index] | 0 : -1;
}
export function luaEnginePusherIatVa(index) {
  return pusherOk(index) ? LUA_PUSHER_IAT_VAS[index] >>> 0 : 0;
}
export function luaEnginePusherCallCleanup(index) {
  return pusherOk(index) ? LUA_PUSHER_CALL_CLEANUPS[index] | 0 : -1;
}
export function luaEnginePusherKind(index) {
  return pusherOk(index) ? LUA_PUSHER_KINDS[index] | 0 : -1;
}

/* cvtss2sd EXACT f32 -> f64 widening, bit-exact via DataView:
 * replicate the IEEE-754 32->64 widening (fits exactly; no rounding). */
export function luaEnginePusherPushnumberF32WidenHi(f32Bits) {
  const dv = new DataView(new ArrayBuffer(8));
  dv.setUint32(0, f32Bits >>> 0, true);
  const f = dv.getFloat32(0, true);
  dv.setFloat64(0, f, true);
  return dv.getUint32(4, true) >>> 0;
}
export function luaEnginePusherPushnumberF32WidenLo(f32Bits) {
  const dv = new DataView(new ArrayBuffer(8));
  dv.setUint32(0, f32Bits >>> 0, true);
  const f = dv.getFloat32(0, true);
  dv.setFloat64(0, f, true);
  return dv.getUint32(0, true) >>> 0;
}

/* PUSHINT_U32: lo = edx FULL 32-bit word (no mask); hi = 0 (push 0). */
export function luaEnginePusherPushintU32Lo(value) {
  return value >>> 0;
}
export function luaEnginePusherPushintU32Hi(value) {
  return 0 >>> 0;
}
/* PUSHINT_U16: lo = u16 LOW WORD of edx (movzx eax,dx); hi = 0
 * (cdq after movzx: eax in [0,0xffff] is never sign-negative). */
export function luaEnginePusherPushintU16Lo(value) {
  return (value & 0xffff) >>> 0;
}
export function luaEnginePusherPushintU16Hi(value) {
  return 0 >>> 0;
}
/* PUSHINT_I32_SEXT (v55): lo = edx FULL 32-bit word (mov eax,edx
 * @0x85bfd6); hi = replicated sign of lo bit31 (cdq @0x85bfd8) —
 * 0x80000000 -> 0xffffffff, 0x100 -> 0; bit15 is IRRELEVANT. */
export function luaEnginePusherPushintI32SextLo(value) {
  return value >>> 0;
}
export function luaEnginePusherPushintI32SextHi(value) {
  return ((value >>> 0) & 0x80000000) !== 0 ? 0xffffffff >>> 0 : 0 >>> 0;
}

export function luaEngineCheckGetBodyVa() {
  return LUA_CHECK_GET_BODY_VA >>> 0;
}
export function luaEngineCheckGetSuccessRetVa() {
  return LUA_CHECK_GET_SUCCESS_RET_VA >>> 0;
}
export function luaEngineCheckGetTrueRetVa() {
  return LUA_CHECK_GET_TRUE_RET_VA >>> 0;
}
export function luaEngineCheckGetBodyBytes() {
  return (LUA_CHECK_GET_TRUE_RET_VA - LUA_CHECK_GET_BODY_VA) >>> 0;
}
export function luaEngineCheckGetInsnCount() {
  return LUA_CHECK_GET_BODY_INSNS | 0;
}
export function luaEngineCheckGetDualRet() {
  return (LUA_CHECK_GET_SUCCESS_RET_VA !== LUA_CHECK_GET_TRUE_RET_VA) ? 1 : 0;
}
export function luaEngineCheckGetSuccessIatLuaTouserdata() {
  return LUA_CHECK_GET_SUCCESS_IAT_LUA_TOUSERDATA >>> 0;
}
export function luaEngineCheckGetSuccessCleanup() {
  return LUA_CHECK_GET_SUCCESS_CLEANUP | 0;
}

/* ------------------------------------------------------------------
 * wave-16 · ABI v25h — getArgObject BODY 0x008baa50 (ecx=L, edx=idx ->
 * obj). Machine truth: cpu-dump/008baa50.txt + 008baa7b.txt (36 insns,
 * dual rets 0x8baa7a nil / 0x8baaa8 main, body 0x58);
 * section-notes/lua-v25h-8baa50/NOTES.md. Before this block the VA was
 * only PINNED (v45/v48 composed call-site law); the BODY laws (register
 * conduct, FULL-WORD gates, key/flags/cleanups, caller census, lane
 * laws) are new. lua_* IAT bodies + 0x85c590 stay host.
 * ------------------------------------------------------------------ */
export const LUA_GET_ARG_OBJECT_BODY_VA = 0x008baa50;
export const LUA_GET_ARG_OBJECT_NIL_RET_VA = 0x008baa7a;
export const LUA_GET_ARG_OBJECT_MAIN_RET_VA = 0x008baaa8;
export const LUA_GET_ARG_OBJECT_BODY_INSNS = 36;
export const LUA_GET_ARG_OBJECT_IAT_LUA_TYPE = 0x00b18400;
export const LUA_GET_ARG_OBJECT_TYPE_CALL_ARGS = 2;
export const LUA_GET_ARG_OBJECT_TYPE_CALL_CLEANUP = 0x08;
export const LUA_GET_ARG_OBJECT_ERROR_STRING_VA = 0x00b7539c;
export const LUA_GET_ARG_OBJECT_IAT_LUA_L_ERROR = 0x00b18390;
export const LUA_GET_ARG_OBJECT_ERROR_CALL_CLEANUP = 0x08;
export const LUA_GET_ARG_OBJECT_CHECK_FLAGS = 1;
export const LUA_GET_ARG_OBJECT_REGISTRY_KEY = 0x00c82980;
export const LUA_GET_ARG_OBJECT_CHECK_HELPER_VA = 0x0085c590;
export const LUA_GET_ARG_OBJECT_CHECK_CLEANUP = 0x08;
export const LUA_GET_ARG_OBJECT_CHECK_EDX_REGISTER = 1;
export const LUA_GET_ARG_OBJECT_OBJECT_FIELD_OFF = 0x04;
export const LUA_GET_ARG_OBJECT_LANE_COUNT = 2;
export const LUA_GET_ARG_OBJECT_LANE_STRIDE = 4;
export const LUA_GET_ARG_OBJECT_LANE_OFF_0 = 0x00;
export const LUA_GET_ARG_OBJECT_LANE_OFF_1 = 0x04;
export const LUA_GET_ARG_OBJECT_OUT_PTR_IS_RETURN = 1;
export const LUA_GET_ARG_OBJECT_CALLER_COUNT = 86;
export const LUA_GET_ARG_OBJECT_CALLERS = Object.freeze([
  0x00897990, 0x008985a8, 0x0089862c, 0x00898b23, 0x0089a928,
  0x0089a951, 0x0089a978, 0x0089b455, 0x0089bfc4, 0x0089e074,
  0x0089e934, 0x008a82c4, 0x008a8387, 0x008a8794, 0x008a97f7,
  0x008a9815, 0x008a9849, 0x008a9904, 0x008a9922, 0x008a9956,
  0x008aa93d, 0x008aa9f3, 0x008aab23, 0x008ab8d4, 0x008abc43,
  0x008ac9b4, 0x008ace04, 0x008acee7, 0x008acf05, 0x008ad463,
  0x008ad554, 0x008ae9b1, 0x008aeb13, 0x008aec67, 0x008aedea,
  0x008aee5b, 0x008af009, 0x008af034, 0x008af384, 0x008af5c4,
  0x008af6d3, 0x008af7ed, 0x008afc74, 0x008aff23, 0x008b0014,
  0x008b0134, 0x008b0152, 0x008b02a9, 0x008b03f3, 0x008b0504,
  0x008b0a00, 0x008b0b74, 0x008b0c04, 0x008b0ce3, 0x008b151a,
  0x008b1557, 0x008b16ca, 0x008b1ce0, 0x008b1d4d, 0x008b23d4,
  0x008b38b4, 0x008b3e73, 0x008b3eb0, 0x008b3fd7, 0x008b3ff5,
  0x008b41b4, 0x008b43b7, 0x008b44cd, 0x008b45cd, 0x008b5230,
  0x008b7368, 0x008b7393, 0x008b77e4, 0x008b7a70, 0x008b7c76,
  0x008b7e10, 0x008b7f5c, 0x008b8090, 0x008b821d, 0x008b85c4,
  0x008b869d, 0x008b9166, 0x008b9531, 0x008b9f26, 0x008b9f53,
  0x008baca2]);

function getArgObjectCallerOk(index) {
  return Number.isInteger(index) && index >= 0 &&
      index < LUA_GET_ARG_OBJECT_CALLER_COUNT;
}

export function luaEngineGetArgObjectBodyVa() {
  return LUA_GET_ARG_OBJECT_BODY_VA >>> 0;
}
export function luaEngineGetArgObjectNilRetVa() {
  return LUA_GET_ARG_OBJECT_NIL_RET_VA >>> 0;
}
export function luaEngineGetArgObjectMainRetVa() {
  return LUA_GET_ARG_OBJECT_MAIN_RET_VA >>> 0;
}
export function luaEngineGetArgObjectBodyBytes() {
  return (LUA_GET_ARG_OBJECT_MAIN_RET_VA - LUA_GET_ARG_OBJECT_BODY_VA) >>> 0;
}
export function luaEngineGetArgObjectInsnCount() {
  return LUA_GET_ARG_OBJECT_BODY_INSNS | 0;
}
export function luaEngineGetArgObjectDualRet() {
  return (LUA_GET_ARG_OBJECT_NIL_RET_VA !== LUA_GET_ARG_OBJECT_MAIN_RET_VA)
    ? 1 : 0;
}
/* idx FULL 32-bit register passthrough (mov esi,edx / mov edx,esi). */
export function luaEngineGetArgObjectIdxPassthrough(value) {
  return value >>> 0;
}
/* FULL-WORD gates: 1 when the error path is taken (v == 0). */
export function luaEngineGetArgObjectTypeGateTaken(value) {
  return value === 0 ? 1 : 0;
}
export function luaEngineGetArgObjectObjGateTaken(value) {
  return value === 0 ? 1 : 0;
}
export function luaEngineGetArgObjectCheckFlags() {
  return LUA_GET_ARG_OBJECT_CHECK_FLAGS | 0;
}
export function luaEngineGetArgObjectRegistryKey() {
  return LUA_GET_ARG_OBJECT_REGISTRY_KEY >>> 0;
}
export function luaEngineGetArgObjectCheckHelperVa() {
  return LUA_GET_ARG_OBJECT_CHECK_HELPER_VA >>> 0;
}
export function luaEngineGetArgObjectCheckCleanup() {
  return LUA_GET_ARG_OBJECT_CHECK_CLEANUP | 0;
}
export function luaEngineGetArgObjectCheckEdxRegister() {
  return LUA_GET_ARG_OBJECT_CHECK_EDX_REGISTER | 0;
}
export function luaEngineGetArgObjectObjectFieldOff() {
  return LUA_GET_ARG_OBJECT_OBJECT_FIELD_OFF >>> 0;
}
export function luaEngineGetArgObjectErrorStringVa() {
  return LUA_GET_ARG_OBJECT_ERROR_STRING_VA >>> 0;
}
export function luaEngineGetArgObjectIatLuaType() {
  return LUA_GET_ARG_OBJECT_IAT_LUA_TYPE >>> 0;
}
export function luaEngineGetArgObjectIatLuaLError() {
  return LUA_GET_ARG_OBJECT_IAT_LUA_L_ERROR >>> 0;
}
export function luaEngineGetArgObjectTypeCallCleanup() {
  return LUA_GET_ARG_OBJECT_TYPE_CALL_CLEANUP | 0;
}
/* Body-level two-gate result: type==0 -> 0; obj==0 -> 0; else obj. */
export function luaEngineGetArgObjectResolve(typeResult, checkField) {
  if (typeResult === 0) return 0;
  if (checkField === 0) return 0;
  return checkField >>> 0;
}
export function luaEngineGetArgObjectLaneCount() {
  return LUA_GET_ARG_OBJECT_LANE_COUNT | 0;
}
export function luaEngineGetArgObjectLaneStride() {
  return LUA_GET_ARG_OBJECT_LANE_STRIDE | 0;
}
export function luaEngineGetArgObjectLaneOff0() {
  return LUA_GET_ARG_OBJECT_LANE_OFF_0 >>> 0;
}
export function luaEngineGetArgObjectLaneOff1() {
  return LUA_GET_ARG_OBJECT_LANE_OFF_1 >>> 0;
}
export function luaEngineGetArgObjectOutPtrIsReturn() {
  return LUA_GET_ARG_OBJECT_OUT_PTR_IS_RETURN | 0;
}
export function luaEngineGetArgObjectCallerCount() {
  return LUA_GET_ARG_OBJECT_CALLER_COUNT | 0;
}
export function luaEngineGetArgObjectCallerVaAt(index) {
  return getArgObjectCallerOk(index) ? LUA_GET_ARG_OBJECT_CALLERS[index] >>> 0 : 0;
}

/* ---- v25g: PUSH_I64_PAIR 0x85c030 hi/lo pair laws (NO ABI bump; ABI 53).
 * Machine truth: section-notes/lua-v25g-85c030 (cpu-dump/0085c030.txt +
 * caller dumps 0089b690.txt / 008ae860.txt). 0x85c030 (11 insns, ret
 * 0x85c049, body 0x19 = 25):
 *   push ebp; mov ebp,esp; and esp,0xfffffff8; push [ebp+0xc] (HI);
 *   push [ebp+8] (LO); push ecx (L); call [0xb183f8] lua_pushinteger;
 *   add esp,0xc; mov esp,ebp; pop ebp; ret.
 * The 8-byte arg reaches lua_pushinteger as lo@[esp+4], hi@[esp+8]
 * (little-endian int64). The marshal is IDENTITY on both lanes — no mask,
 * no sign-extension; the int64 sign lives in hi bit 31 (lo bit 31 is
 * irrelevant). 5 true E8 callers (4 closure-band rows + out-of-band clone
 * 0x8ae89e); the v21/v53 census pins the 4 band rows as
 * LUA_PROPERTY_CLOSURE_PUSH_I64_PAIR_USES. */
export const LUA_PROPERTY_CLOSURE_PUSH_I64_PAIR_RET_VA = 0x0085c049;
export const LUA_PROPERTY_CLOSURE_PUSH_I64_PAIR_BODY_BYTES = 0x19;
export const LUA_PROPERTY_CLOSURE_PUSH_I64_PAIR_INSNS = 11;
export const LUA_PROPERTY_CLOSURE_PUSH_I64_PAIR_STACK_ALIGN_MASK = 0xfffffff8;
export const LUA_PROPERTY_CLOSURE_PUSH_I64_PAIR_IAT_VA = 0x00b183f8;
export const LUA_PROPERTY_CLOSURE_PUSH_I64_PAIR_CALL_CLEANUP = 0x0c;
export const LUA_PROPERTY_CLOSURE_PUSH_I64_PAIR_SIGN_MASK = 0x80000000;
export const LUA_PROPERTY_CLOSURE_PUSH_I64_PAIR_E8_CALLERS = 5;

export function luaEnginePusherPushI64PairRetVa() {
  return LUA_PROPERTY_CLOSURE_PUSH_I64_PAIR_RET_VA >>> 0;
}
export function luaEnginePusherPushI64PairBodyBytes() {
  return LUA_PROPERTY_CLOSURE_PUSH_I64_PAIR_BODY_BYTES >>> 0;
}
export function luaEnginePusherPushI64PairInsnCount() {
  return LUA_PROPERTY_CLOSURE_PUSH_I64_PAIR_INSNS | 0;
}
export function luaEnginePusherPushI64PairStackAlignMask() {
  return LUA_PROPERTY_CLOSURE_PUSH_I64_PAIR_STACK_ALIGN_MASK >>> 0;
}
export function luaEnginePusherPushI64PairIatVa() {
  return LUA_PROPERTY_CLOSURE_PUSH_I64_PAIR_IAT_VA >>> 0;
}
export function luaEnginePusherPushI64PairCallCleanup() {
  return LUA_PROPERTY_CLOSURE_PUSH_I64_PAIR_CALL_CLEANUP | 0;
}
export function luaEnginePusherPushI64PairE8Callers() {
  return LUA_PROPERTY_CLOSURE_PUSH_I64_PAIR_E8_CALLERS | 0;
}
/* lo = FULL 32-bit lane of [ebp+8] (@0x85c039 push dword ptr [ebp+8]) —
 * no mask: 0xffffffff / 0x10000 survive (a u16/byte mask is WRONG). */
export function luaEnginePusherPushI64PairLo(lo, hi) {
  return lo >>> 0;
}
/* hi = FULL 32-bit lane of [ebp+0xc] (@0x85c036) — no mask; a forced-0
 * fold is the PUSHINT_U32 'push 0; push edx' law, not this one. */
export function luaEnginePusherPushI64PairHi(lo, hi) {
  return hi >>> 0;
}
/* sign = int64(hi:lo) < 0 — bit 63, i.e. hi bit 31. lo bit 31 does NOT
 * decide the sign (a fold from lo bit 31 is WRONG). */
export function luaEnginePusherPushI64PairSign(lo, hi) {
  return (hi & 0x80000000) ? 1 : 0;
}
/* wrap composite (model-only JS-oracle law; no wasm twin): the full
 * signed int64 value, (uint64)hi<<32 | (uint64)lo interpreted as int64
 * with 64-bit wrap. */
export function luaEnginePusherPushI64PairSigned64(lo, hi) {
  const v = (BigInt(hi >>> 0) << 32n) | BigInt(lo >>> 0);
  return (v & 0x8000000000000000n) ? v - 0x10000000000000000n : v;
}

/* ---- v25i: pusher-band ROW consolidation + 0x85c590 tail islands (NO
 * ABI bump; ABI stays 53). Re-points the v36/v39 FOURTH_*_GETTER
 * host-push pins at the landed pusher ROWS (row 0 == PUSHNUMBER_F32
 * 0x85c050 == LUA_FOURTH_NUMBER_GETTER_HOST_VA_PUSH; row 1 == PUSHINT_U32
 * 0x85bff0 == LUA_FOURTH_I32_GETTER_HOST_VA_PUSH). Completes the band
 * 0x85bff0..0x85c590 with per-row WIDTH + row-dispatched lo/hi VALUE
 * laws (v53 had per-kind laws only). 0x85c590 tail facts (settop cache +
 * identity-fail direct IAT settop -3, typename IAT, pushfstring IAT +
 * arg order, argerror IAT + saved idx, const-fail reloop, got tolstring
 * prep + receivers). Machine truth: cpu-dump/0085c590.txt +
 * 0085c70f.txt (lua-v25i-85c590 notes). ---- */

export const LUA_FOURTH_NUMBER_GETTER_PUSH_ROW = 0;
export const LUA_FOURTH_I32_GETTER_PUSH_ROW = 1;
/* v55: the v40 sext getter host push 0x85bfd0 IS pusher ROW 3. */
export const LUA_FOURTH_I32_SEXT_GETTER_PUSH_ROW = 3;
export const LUA_PUSHER_WIDTH_BITS = Object.freeze([32, 32, 16, 32]);
export const LUA_CHECK_GET_SETTOP_EBX_CACHE_IAT_VA = 0x00b18328;
export const LUA_CHECK_GET_SETTOP_EBX_CACHE_SITE_VA = 0x0085c5ef;
export const LUA_CHECK_GET_SETTOP_EBX_CALL_SITES = 7;
export const LUA_CHECK_GET_IDENTITY_FAIL_SETTOP_INDEX_U32 = 0xfffffffd;
export const LUA_CHECK_GET_IDENTITY_FAIL_SETTOP_DIRECT_IAT = 1;
export const LUA_CHECK_GET_TYPENAME_IAT_VA = 0x00b183ac;
export const LUA_CHECK_GET_TYPENAME_TYPE_INDEX_SAVED = 1;
export const LUA_CHECK_GET_PUSHFSTRING_IAT_VA = 0x00b183a8;
export const LUA_CHECK_GET_MSG_GOT_A_FIRST = 1;
export const LUA_CHECK_GET_ARGERROR_IAT_VA = 0x00b183a4;
export const LUA_CHECK_GET_ARGERROR_INDEX_SAVED = 1;
export const LUA_CHECK_GET_ERROR_TAIL_CLEANUP = 0x1c;
export const LUA_CHECK_GET_CONST_FAIL_ARGERROR_CLEANUP = 0x0c;
export const LUA_CHECK_GET_CONST_FAIL_RELOOPS = 1;
export const LUA_CHECK_GET_GOT_TOLSTRING_IAT_VA = 0x00b183d0;
export const LUA_CHECK_GET_GOT_B_RECEIVER_EBX = 1;
export const LUA_CHECK_GET_GOT_A_SPILL_FRAME_SLOT = 1;

function pusherRowForVaOk(va) {
  for (let i = 0; i < LUA_PUSHER_COUNT; i++) {
    if ((LUA_PUSHER_VAS[i] >>> 0) === (va >>> 0)) return i;
  }
  return -1;
}

export function luaEnginePusherRowForVa(va) {
  return pusherRowForVaOk(va);
}

export function luaEnginePusherWidthBits(row) {
  return pusherOk(row) ? LUA_PUSHER_WIDTH_BITS[row] | 0 : -1;
}

/* Row-dispatched pushed lo dword: kind 0 -> cvtss2sd widen lo; kind 1 ->
 * FULL 32-bit word; kind 2 -> u16 LOW WORD; kind 3 -> FULL 32-bit word
 * (mov eax,edx). OOR row -> 0. */
export function luaEnginePusherValueLo(row, value) {
  if (!pusherOk(row)) return 0 >>> 0;
  switch (LUA_PUSHER_KINDS[row]) {
    case LUA_PUSHER_KIND_PUSHNUMBER_F32:
      return luaEnginePusherPushnumberF32WidenLo(value >>> 0);
    case LUA_PUSHER_KIND_PUSHINT_U32:
      return value >>> 0;
    case LUA_PUSHER_KIND_PUSHINT_I32_SEXT:
      return luaEnginePusherPushintI32SextLo(value);
    default:
      return (value & 0xffff) >>> 0;
  }
}

/* Row-dispatched pushed hi dword: kind 0 -> widen hi; kind 1/2 -> 0
 * (literal push 0 / cdq); kind 3 -> cdq sign replicate of bit31.
 * OOR row -> 0. */
export function luaEnginePusherValueHi(row, value) {
  if (!pusherOk(row)) return 0 >>> 0;
  switch (LUA_PUSHER_KINDS[row]) {
    case LUA_PUSHER_KIND_PUSHNUMBER_F32:
      return luaEnginePusherPushnumberF32WidenHi(value >>> 0);
    case LUA_PUSHER_KIND_PUSHINT_I32_SEXT:
      return luaEnginePusherPushintI32SextHi(value);
    default:
      return 0 >>> 0;
  }
}

export function luaEngineFourthNumberGetterPushRow() {
  return LUA_FOURTH_NUMBER_GETTER_PUSH_ROW | 0;
}
export function luaEngineFourthI32GetterPushRow() {
  return LUA_FOURTH_I32_GETTER_PUSH_ROW | 0;
}
export function luaEngineFourthI32SextGetterPushRow() {
  return LUA_FOURTH_I32_SEXT_GETTER_PUSH_ROW | 0;
}

export function luaEngineCheckGetSettopEbxCacheIatVa() {
  return LUA_CHECK_GET_SETTOP_EBX_CACHE_IAT_VA >>> 0;
}
export function luaEngineCheckGetSettopEbxCacheSiteVa() {
  return LUA_CHECK_GET_SETTOP_EBX_CACHE_SITE_VA >>> 0;
}
export function luaEngineCheckGetSettopEbxCallSites() {
  return LUA_CHECK_GET_SETTOP_EBX_CALL_SITES | 0;
}
export function luaEngineCheckGetIdentityFailSettopIndex() {
  return LUA_CHECK_GET_IDENTITY_FAIL_SETTOP_INDEX_U32 >>> 0;
}
export function luaEngineCheckGetIdentityFailSettopDirectIat() {
  return LUA_CHECK_GET_IDENTITY_FAIL_SETTOP_DIRECT_IAT | 0;
}
export function luaEngineCheckGetTypenameIatVa() {
  return LUA_CHECK_GET_TYPENAME_IAT_VA >>> 0;
}
export function luaEngineCheckGetTypenameTypeIndexSaved() {
  return LUA_CHECK_GET_TYPENAME_TYPE_INDEX_SAVED | 0;
}
export function luaEngineCheckGetPushfstringIatVa() {
  return LUA_CHECK_GET_PUSHFSTRING_IAT_VA >>> 0;
}
export function luaEngineCheckGetMsgGotAFirst() {
  return LUA_CHECK_GET_MSG_GOT_A_FIRST | 0;
}
export function luaEngineCheckGetArgErrorIatVa() {
  return LUA_CHECK_GET_ARGERROR_IAT_VA >>> 0;
}
export function luaEngineCheckGetArgErrorIndexSaved() {
  return LUA_CHECK_GET_ARGERROR_INDEX_SAVED | 0;
}
export function luaEngineCheckGetErrorTailCleanup() {
  return LUA_CHECK_GET_ERROR_TAIL_CLEANUP | 0;
}
export function luaEngineCheckGetConstFailArgErrorCleanup() {
  return LUA_CHECK_GET_CONST_FAIL_ARGERROR_CLEANUP | 0;
}
export function luaEngineCheckGetConstFailReloops() {
  return LUA_CHECK_GET_CONST_FAIL_RELOOPS | 0;
}
export function luaEngineCheckGetGotTolstringIatVa() {
  return LUA_CHECK_GET_GOT_TOLSTRING_IAT_VA >>> 0;
}
export function luaEngineCheckGetGotBReceiverEbx() {
  return LUA_CHECK_GET_GOT_B_RECEIVER_EBX | 0;
}
export function luaEngineCheckGetGotASpillFrameSlot() {
  return LUA_CHECK_GET_GOT_A_SPILL_FRAME_SLOT | 0;
}

/* ---- ABI v56: EntityRef vec-helper band (GetAmbush wrapper 0x8b91d0,
 * Fadein vec-A 0x8b9270, Fadeout vec-B 0x8b9380). See the lua-v56-vecband
 * notes + header ABI v56 block for the PE-truth transcription. ----
 * Wrapper: FULL-WORD lua_type(L,1) gate; CHKFLAGS 0; KEY 0xc82a13; edx 1;
 * obj=[eax+4]; touserdata upvalueindex(1) 0xfff0b9d7; real_fn=ud[0];
 * ecx=obj; result FULL-WORD gate; WRAP: newuserdata(L,8) + vtable tag
 * 0xb753c8 + [4]=result + rawgetp(L, LUA_REGISTRYINDEX 0xfff0b9d8, key
 * 0xc82a2b) + setmetatable(L,-2) + cleanup 0x1c -> ret 1; NIL: pushnil
 * -> ret 1. DUal rets 0x8b9257 (wrap) / 0x8b926a (nil).
 * VEC-A/B shared: obj1 resolve; touserdata (NO add esp after — frame
 * shift resolved: this=obj1 @ abs -64); getRef(L, edx=4) via 0x8bb070;
 * 4 f32 lanes obj4[0..0xc] -> out[0..0xc]; u32 obj4[0x10] -> out[0x10];
 * checknumber(L,2) f32; real_fn=ud[0]; ecx=obj1; args (f32, flag/int,
 * &out 5 dwords); ret 0.
 * VEC-A arg3 = lua_toboolean(L,3) FULL-WORD -> setne -> BYTE (0x100->1);
 * VEC-B arg3 = luaL_checkinteger(L,3) FULL WORD (0x100/0xffffffff keep).
 * ---------------------------------------------------------------------- */
export const LUA_VECBAND_WRAPPER_VA = 0x008b91d0;
export const LUA_VECBAND_WRAPPER_WRAP_RET_VA = 0x008b9257;
export const LUA_VECBAND_WRAPPER_NIL_RET_VA = 0x008b926a;
export const LUA_VECBAND_WRAPPER_BODY_BYTES = 0x009a;
export const LUA_VECBAND_WRAPPER_INSNS = 56;
export const LUA_VECBAND_CHECK_FLAGS = 0;
export const LUA_VECBAND_CHECK_KEY = 0x00c82a13;
export const LUA_VECBAND_CHECK_EDX = 1;
export const LUA_VECBAND_TYPE_INDEX = 0x01;
export const LUA_VECBAND_OBJECT_FIELD_OFF = 0x04;
export const LUA_VECBAND_TOUSERDATA_INDEX_U32 = 0xfff0b9d7;
export const LUA_VECBAND_FN_OFF = 0x00;
export const LUA_VECBAND_WRAP_UD_SIZE = 8;
export const LUA_VECBAND_WRAP_VTABLE_TAG_VA = 0x00b753c8;
export const LUA_VECBAND_WRAP_RESULT_OFF = 0x04;
export const LUA_VECBAND_WRAP_KEY = 0x00c82a2b;
export const LUA_VECBAND_REGISTRY_INDEX_U32 = 0xfff0b9d8;
export const LUA_VECBAND_SETMETA_INDEX_U32 = 0xfffffffe;
export const LUA_VECBAND_WRAP_CLEANUP = 0x1c;
export const LUA_VECBAND_WRAP_IAT_LUA_TYPE = 0x00b18400;
export const LUA_VECBAND_WRAP_IAT_LUA_TOUSERDATA = 0x00b183b0;
export const LUA_VECBAND_WRAP_IAT_LUA_NEWUSERDATA = 0x00b1839c;
export const LUA_VECBAND_WRAP_IAT_LUA_RAWGETP = 0x00b183bc;
export const LUA_VECBAND_WRAP_IAT_LUA_SETMETATABLE = 0x00b18398;
export const LUA_VECBAND_WRAP_IAT_LUA_PUSHNIL = 0x00b183e0;
export const LUA_VECBAND_WRAP_CHECK_HELPER_VA = 0x0085c590;

export const LUA_VECBAND_VEC_A_VA = 0x008b9270;
export const LUA_VECBAND_VEC_A_RET_VA = 0x008b937a;
export const LUA_VECBAND_VEC_A_BODY_BYTES = 0x010a;
export const LUA_VECBAND_VEC_A_INSNS = 87;
export const LUA_VECBAND_VEC_B_VA = 0x008b9380;
export const LUA_VECBAND_VEC_B_RET_VA = 0x008b9487;
export const LUA_VECBAND_VEC_B_BODY_BYTES = 0x0107;
export const LUA_VECBAND_VEC_B_INSNS = 88;
export const LUA_VECBAND_VEC_GETREF_EDX = 0x04;
export const LUA_VECBAND_VEC_GETREF_HELPER_VA = 0x008bb070;
export const LUA_VECBAND_VEC_CHECKNUMBER_IAT_VA = 0x00b18324;
export const LUA_VECBAND_VEC_TOBOOLEAN_IAT_VA = 0x00b183e8;
export const LUA_VECBAND_VEC_CHECKINTEGER_IAT_VA = 0x00b183f4;
export const LUA_VECBAND_VEC_ARG2_CHECKNUMBER_INDEX_U32 = 0x02;
export const LUA_VECBAND_VEC_ARG3_TOBOOLEAN_INDEX_U32 = 0x03;
export const LUA_VECBAND_VEC_ARG3_CHECKINTEGER_INDEX_U32 = 0x03;
export const LUA_VECBAND_VEC_OUT_DWORDS = 5;
export const LUA_VECBAND_VEC_LANE_COUNT = 4;
export const LUA_VECBAND_VEC_U32_OUT_OFF = 0x10;
export const LUA_VECBAND_VEC_U32_SRC_OFF = 0x10;
export const LUA_VECBAND_RETURN_VALUE = 0;

export const LUA_VECBAND_INSTALL_GETAMBUSH_VA = 0x00895130;
export const LUA_VECBAND_INSTALL_GETAMBUSH_LITERAL_VA = 0x00895143;
export const LUA_VECBAND_INSTALL_GETAMBUSH_NAME_VA = 0x00b74b58;
export const LUA_VECBAND_INSTALL_GETAMBUSH_REAL_FN_VA = 0x005b1860;
export const LUA_VECBAND_INSTALL_FADEIN_VA = 0x00895190;
export const LUA_VECBAND_INSTALL_FADEIN_LITERAL_VA = 0x008951a3;
export const LUA_VECBAND_INSTALL_FADEIN_NAME_VA = 0x00b74b30;
export const LUA_VECBAND_INSTALL_FADEIN_REAL_FN_VA = 0x006f5210;
export const LUA_VECBAND_INSTALL_FADEOUT_VA = 0x008951f0;
export const LUA_VECBAND_INSTALL_FADEOUT_LITERAL_VA = 0x00895203;
export const LUA_VECBAND_INSTALL_FADEOUT_NAME_VA = 0x00b74b38;
export const LUA_VECBAND_INSTALL_FADEOUT_REAL_FN_VA = 0x006f5290;

export function luaEngineVecbandObjectResolve(typeResult, checkField) {
  /* FULL-WORD lua_type gate (wrapper + both vec bodies). */
  return typeResult !== 0 ? checkField : 0;
}
export function luaEngineVecbandWrapperResultGate(result) {
  /* FULL-WORD result gate: wrap (1) vs nil (0) path. */
  return result !== 0 ? 1 : 0;
}
export function luaEngineVecbandVecAFlagByte(toboolResult) {
  /* lua_toboolean FULL-WORD test -> setne -> byte: 0x100 -> 1. */
  return (toboolResult !== 0 ? 1 : 0) & 0xff;
}
export function luaEngineVecbandVecBArgWord(checkintResult) {
  /* luaL_checkinteger FULL WORD passthrough, never masked. */
  return checkintResult >>> 0;
}
export function luaEngineVecbandVecGetrefEdx(index) {
  /* The edx=4 REGISTER index crosses to both lua_type and 0x85c590
     edx unchanged (FULL-WORD). */
  return index >>> 0;
}
export function luaEngineVecbandVecOutF32OffAt(lane) {
  /* 4 f32 lanes from obj4 at out + 4*lane. */
  return lane >= 0 && lane < 4 ? (lane << 2) >>> 0 : 0;
}
export function luaEngineVecbandVecU32OutOff() {
  return LUA_VECBAND_VEC_U32_OUT_OFF >>> 0;
}
export function luaEngineVecbandWrapperVa() { return LUA_VECBAND_WRAPPER_VA >>> 0; }
export function luaEngineVecbandWrapperWrapRetVa() { return LUA_VECBAND_WRAPPER_WRAP_RET_VA >>> 0; }
export function luaEngineVecbandWrapperNilRetVa() { return LUA_VECBAND_WRAPPER_NIL_RET_VA >>> 0; }
export function luaEngineVecbandWrapperBodyBytes() { return LUA_VECBAND_WRAPPER_BODY_BYTES >>> 0; }
export function luaEngineVecbandWrapperInsnCount() { return LUA_VECBAND_WRAPPER_INSNS | 0; }
export function luaEngineVecbandCheckFlags() { return LUA_VECBAND_CHECK_FLAGS | 0; }
export function luaEngineVecbandCheckKey() { return LUA_VECBAND_CHECK_KEY >>> 0; }
export function luaEngineVecbandCheckEdx() { return LUA_VECBAND_CHECK_EDX | 0; }
export function luaEngineVecbandTouserdataIndex() { return LUA_VECBAND_TOUSERDATA_INDEX_U32 >>> 0; }
export function luaEngineVecbandFnOff() { return LUA_VECBAND_FN_OFF >>> 0; }
export function luaEngineVecbandWrapUdSize() { return LUA_VECBAND_WRAP_UD_SIZE >>> 0; }
export function luaEngineVecbandWrapVtableTagVa() { return LUA_VECBAND_WRAP_VTABLE_TAG_VA >>> 0; }
export function luaEngineVecbandWrapResultOff() { return LUA_VECBAND_WRAP_RESULT_OFF >>> 0; }
export function luaEngineVecbandWrapKey() { return LUA_VECBAND_WRAP_KEY >>> 0; }
export function luaEngineVecbandRegistryIndex() { return LUA_VECBAND_REGISTRY_INDEX_U32 >>> 0; }
export function luaEngineVecbandSetmetaIndex() { return LUA_VECBAND_SETMETA_INDEX_U32 >>> 0; }
export function luaEngineVecbandWrapCleanup() { return LUA_VECBAND_WRAP_CLEANUP | 0; }
export function luaEngineVecbandVecAVa() { return LUA_VECBAND_VEC_A_VA >>> 0; }
export function luaEngineVecbandVecARetVa() { return LUA_VECBAND_VEC_A_RET_VA >>> 0; }
export function luaEngineVecbandVecABodyBytes() { return LUA_VECBAND_VEC_A_BODY_BYTES >>> 0; }
export function luaEngineVecbandVecAInsnCount() { return LUA_VECBAND_VEC_A_INSNS | 0; }
export function luaEngineVecbandVecBVa() { return LUA_VECBAND_VEC_B_VA >>> 0; }
export function luaEngineVecbandVecBRetVa() { return LUA_VECBAND_VEC_B_RET_VA >>> 0; }
export function luaEngineVecbandVecBBodyBytes() { return LUA_VECBAND_VEC_B_BODY_BYTES >>> 0; }
export function luaEngineVecbandVecBInsnCount() { return LUA_VECBAND_VEC_B_INSNS | 0; }
export function luaEngineVecbandVecGetrefHelperVa() { return LUA_VECBAND_VEC_GETREF_HELPER_VA >>> 0; }
export function luaEngineVecbandVecChecknumberIatVa() { return LUA_VECBAND_VEC_CHECKNUMBER_IAT_VA >>> 0; }
export function luaEngineVecbandVecTobooleanIatVa() { return LUA_VECBAND_VEC_TOBOOLEAN_IAT_VA >>> 0; }
export function luaEngineVecbandVecCheckintegerIatVa() { return LUA_VECBAND_VEC_CHECKINTEGER_IAT_VA >>> 0; }
export function luaEngineVecbandVecArg2ChecknumberIndex() { return LUA_VECBAND_VEC_ARG2_CHECKNUMBER_INDEX_U32 >>> 0; }
export function luaEngineVecbandVecArg3TobooleanIndex() { return LUA_VECBAND_VEC_ARG3_TOBOOLEAN_INDEX_U32 >>> 0; }
export function luaEngineVecbandVecArg3CheckintegerIndex() { return LUA_VECBAND_VEC_ARG3_CHECKINTEGER_INDEX_U32 >>> 0; }
export function luaEngineVecbandVecOutDwords() { return LUA_VECBAND_VEC_OUT_DWORDS | 0; }
export function luaEngineVecbandVecLaneCount() { return LUA_VECBAND_VEC_LANE_COUNT | 0; }
export function luaEngineVecbandReturnValue() { return LUA_VECBAND_RETURN_VALUE | 0; }
export function luaEngineVecbandInstallGetambushVa() { return LUA_VECBAND_INSTALL_GETAMBUSH_VA >>> 0; }
export function luaEngineVecbandInstallGetambushLiteralVa() { return LUA_VECBAND_INSTALL_GETAMBUSH_LITERAL_VA >>> 0; }
export function luaEngineVecbandInstallGetambushNameVa() { return LUA_VECBAND_INSTALL_GETAMBUSH_NAME_VA >>> 0; }
export function luaEngineVecbandInstallGetambushRealFnVa() { return LUA_VECBAND_INSTALL_GETAMBUSH_REAL_FN_VA >>> 0; }
export function luaEngineVecbandInstallFadeinVa() { return LUA_VECBAND_INSTALL_FADEIN_VA >>> 0; }
export function luaEngineVecbandInstallFadeinLiteralVa() { return LUA_VECBAND_INSTALL_FADEIN_LITERAL_VA >>> 0; }
export function luaEngineVecbandInstallFadeinNameVa() { return LUA_VECBAND_INSTALL_FADEIN_NAME_VA >>> 0; }
export function luaEngineVecbandInstallFadeinRealFnVa() { return LUA_VECBAND_INSTALL_FADEIN_REAL_FN_VA >>> 0; }
export function luaEngineVecbandInstallFadeoutVa() { return LUA_VECBAND_INSTALL_FADEOUT_VA >>> 0; }
export function luaEngineVecbandInstallFadeoutLiteralVa() { return LUA_VECBAND_INSTALL_FADEOUT_LITERAL_VA >>> 0; }
export function luaEngineVecbandInstallFadeoutNameVa() { return LUA_VECBAND_INSTALL_FADEOUT_NAME_VA >>> 0; }
export function luaEngineVecbandInstallFadeoutRealFnVa() { return LUA_VECBAND_INSTALL_FADEOUT_REAL_FN_VA >>> 0; }

/* ---- ABI v57: sibling band (MakeShockwave wrapper 0x8b9490, Play
 * wrapper 0x8b95a0). See the lua-v57-siblings notes + header ABI v57
 * block for the PE-truth transcription. ----
 * Shared: ebx-framed + aligned ebp subframe; L=[ebx+8]; obj1 =
 * lua_type(L,1) FULL-WORD gate -> 0x85c590 (flags 0, edx 1) ->
 * [eax+4]; touserdata upvalueindex(1) 0xfff0b9d7 (NO add esp,8 — locals
 * ebp-relative); real_fn = ud[0]; ecx = obj1 (this); ret 0.
 * SIB-A "MakeShockwave": KEY 0xc82a13; getArgObject(L, edx=2) ->
 * r0/r1 f32 lanes; arg1=checknumber(L,3) f32, arg2=checknumber(L,4)
 * f32, arg3=checkinteger(L,5) FULL WORD; out 6 dwords @&out =
 * [r0, r1, num3, num4, int5, ud]; stack args (&out, num3, num4, int5).
 * SIB-B "Play": KEY 0xc82a16 (next band above 0xc82a13); NO
 * getArgObject; arg0=checkinteger(L,2) FULL WORD, arg1=checknumber(L,3)
 * f32, arg2=checkinteger(L,4) FULL WORD, arg3=toboolean(L,5) FULL-WORD
 * test -> setne -> LOW BYTE ONLY (memory-reloaded dword: high 3 bytes
 * stale), arg4=checknumber(L,6) f32, arg5=checknumber(L,7) f32; the
 * leftover touserdata arg dwords become the arg4/arg5 slots (esp
 * lesson). Stack args (int2, num3, int4, bool5, num6, num7).
 * ---------------------------------------------------------------------- */
export const LUA_V57_SIB_A_VA = 0x008b9490;
export const LUA_V57_SIB_A_RET_VA = 0x008b959f;
export const LUA_V57_SIB_A_BODY_BYTES = 0x010f;
export const LUA_V57_SIB_A_INSNS = 89; /* capstone TRUE body, ret incl. */
export const LUA_V57_SIB_B_VA = 0x008b95a0;
export const LUA_V57_SIB_B_RET_VA = 0x008b96c8;
export const LUA_V57_SIB_B_BODY_BYTES = 0x0128;
export const LUA_V57_SIB_B_INSNS = 99;
export const LUA_V57_CHECK_FLAGS = 0;
export const LUA_V57_CHECK_EDX = 1;
export const LUA_V57_TYPE_INDEX = 0x01;
export const LUA_V57_OBJECT_FIELD_OFF = 0x04;
export const LUA_V57_KEY_A = 0x00c82a13;
export const LUA_V57_KEY_B = 0x00c82a16;
export const LUA_V57_TOUSERDATA_INDEX_U32 = 0xfff0b9d7;
export const LUA_V57_FN_OFF = 0x00;
export const LUA_V57_GET_ARG_OBJECT_VA = 0x008baa50;
export const LUA_V57_GET_ARG_EDX = 0x02;
export const LUA_V57_IAT_LUA_TYPE = 0x00b18400;
export const LUA_V57_IAT_LUA_TOUSERDATA = 0x00b183b0;
export const LUA_V57_IAT_LUA_CHECKINTEGER = 0x00b183f4;
export const LUA_V57_IAT_LUA_CHECKNUMBER = 0x00b18324;
export const LUA_V57_IAT_LUA_TOBOOLEAN = 0x00b183e8;
export const LUA_V57_SIB_A_ARG1_CHECKNUMBER_INDEX_U32 = 0x03;
export const LUA_V57_SIB_A_ARG2_CHECKNUMBER_INDEX_U32 = 0x04;
export const LUA_V57_SIB_A_ARG3_CHECKINTEGER_INDEX_U32 = 0x05;
export const LUA_V57_SIB_A_OUT_F32_COUNT = 4;
export const LUA_V57_SIB_A_OUT_DWORDS = 6;
export const LUA_V57_SIB_A_OUT_U32_OFF = 0x10;
export const LUA_V57_SIB_A_OUT_UD_OFF = 0x14;
export const LUA_V57_SIB_B_ARG0_CHECKINTEGER_INDEX_U32 = 0x02;
export const LUA_V57_SIB_B_ARG1_CHECKNUMBER_INDEX_U32 = 0x03;
export const LUA_V57_SIB_B_ARG2_CHECKINTEGER_INDEX_U32 = 0x04;
export const LUA_V57_SIB_B_ARG3_TOBOOLEAN_INDEX_U32 = 0x05;
export const LUA_V57_SIB_B_ARG4_CHECKNUMBER_INDEX_U32 = 0x06;
export const LUA_V57_SIB_B_ARG5_CHECKNUMBER_INDEX_U32 = 0x07;
export const LUA_V57_RETURN_VALUE = 0;

export const LUA_V57_INSTALL_A_VA = 0x00895250;
export const LUA_V57_INSTALL_A_LITERAL_VA = 0x00895263;
export const LUA_V57_INSTALL_A_NAME_VA = 0x00b74c00;
export const LUA_V57_INSTALL_A_REAL_FN_VA = 0x00703770;
export const LUA_V57_INSTALL_B_VA = 0x00895450;
export const LUA_V57_INSTALL_B_LITERAL_VA = 0x00895463;
export const LUA_V57_INSTALL_B_NAME_VA = 0x00b70498;
export const LUA_V57_INSTALL_B_REAL_FN_VA = 0x0092dc30;

export function luaEngineV57ObjectResolve(typeResult, checkField) {
  /* FULL-WORD lua_type gate (both siblings, `test eax,eax` @0x8b94ba /
     @0x8b95ca): nil -> 0, else check_field. Never byte-masked. */
  return typeResult !== 0 ? checkField : 0;
}
export function luaEngineV57BoolLowByte(toboolResult) {
  /* toboolean FULL-WORD test -> setne -> LOW BYTE ONLY: 0x100 -> 1.
     The pushed dword is a MEMORY reload (stale high bytes) — only the
     low byte is deterministic. Byte-gated law. */
  return (toboolResult !== 0 ? 1 : 0) & 0xff;
}
export function luaEngineV57IntWord(checkintResult) {
  /* checkinteger FULL WORD passthrough (mov esi,eax / mov edx,eax),
     never masked: 0x100/0x10000/0xffffffff all survive. */
  return checkintResult >>> 0;
}
export function luaEngineV57OutF32OffAt(lane) {
  /* Sibling-A out f32 lanes: out + 4*lane (0..3); r0/r1/num3/num4. */
  return lane >= 0 && lane < 4 ? (lane << 2) >>> 0 : 0;
}
export function luaEngineV57OutU32Off() {
  return LUA_V57_SIB_A_OUT_U32_OFF >>> 0;
}
export function luaEngineV57OutUdOff() {
  return LUA_V57_SIB_A_OUT_UD_OFF >>> 0;
}
export function luaEngineV57SibAVa() { return LUA_V57_SIB_A_VA >>> 0; }
export function luaEngineV57SibARetVa() { return LUA_V57_SIB_A_RET_VA >>> 0; }
export function luaEngineV57SibABodyBytes() { return LUA_V57_SIB_A_BODY_BYTES >>> 0; }
export function luaEngineV57SibAInsnCount() { return LUA_V57_SIB_A_INSNS | 0; }
export function luaEngineV57SibBVa() { return LUA_V57_SIB_B_VA >>> 0; }
export function luaEngineV57SibBRetVa() { return LUA_V57_SIB_B_RET_VA >>> 0; }
export function luaEngineV57SibBBodyBytes() { return LUA_V57_SIB_B_BODY_BYTES >>> 0; }
export function luaEngineV57SibBInsnCount() { return LUA_V57_SIB_B_INSNS | 0; }
export function luaEngineV57CheckFlags() { return LUA_V57_CHECK_FLAGS | 0; }
export function luaEngineV57CheckEdx() { return LUA_V57_CHECK_EDX | 0; }
export function luaEngineV57KeyA() { return LUA_V57_KEY_A >>> 0; }
export function luaEngineV57KeyB() { return LUA_V57_KEY_B >>> 0; }
export function luaEngineV57ObjectFieldOff() { return LUA_V57_OBJECT_FIELD_OFF >>> 0; }
export function luaEngineV57TypeIndex() { return LUA_V57_TYPE_INDEX >>> 0; }
export function luaEngineV57TouserdataIndex() { return LUA_V57_TOUSERDATA_INDEX_U32 >>> 0; }
export function luaEngineV57FnOff() { return LUA_V57_FN_OFF >>> 0; }
export function luaEngineV57GetArgObjectVa() { return LUA_V57_GET_ARG_OBJECT_VA >>> 0; }
export function luaEngineV57GetArgEdx() { return LUA_V57_GET_ARG_EDX >>> 0; }
export function luaEngineV57IatLuaType() { return LUA_V57_IAT_LUA_TYPE >>> 0; }
export function luaEngineV57IatLuaTouserdata() { return LUA_V57_IAT_LUA_TOUSERDATA >>> 0; }
export function luaEngineV57IatLuaCheckinteger() { return LUA_V57_IAT_LUA_CHECKINTEGER >>> 0; }
export function luaEngineV57IatLuaChecknumber() { return LUA_V57_IAT_LUA_CHECKNUMBER >>> 0; }
export function luaEngineV57IatLuaToboolean() { return LUA_V57_IAT_LUA_TOBOOLEAN >>> 0; }
export function luaEngineV57SibAArg1ChecknumberIndex() { return LUA_V57_SIB_A_ARG1_CHECKNUMBER_INDEX_U32 >>> 0; }
export function luaEngineV57SibAArg2ChecknumberIndex() { return LUA_V57_SIB_A_ARG2_CHECKNUMBER_INDEX_U32 >>> 0; }
export function luaEngineV57SibAArg3CheckintegerIndex() { return LUA_V57_SIB_A_ARG3_CHECKINTEGER_INDEX_U32 >>> 0; }
export function luaEngineV57SibAOutF32Count() { return LUA_V57_SIB_A_OUT_F32_COUNT | 0; }
export function luaEngineV57SibAOutDwords() { return LUA_V57_SIB_A_OUT_DWORDS | 0; }
export function luaEngineV57SibBArg0CheckintegerIndex() { return LUA_V57_SIB_B_ARG0_CHECKINTEGER_INDEX_U32 >>> 0; }
export function luaEngineV57SibBArg1ChecknumberIndex() { return LUA_V57_SIB_B_ARG1_CHECKNUMBER_INDEX_U32 >>> 0; }
export function luaEngineV57SibBArg2CheckintegerIndex() { return LUA_V57_SIB_B_ARG2_CHECKINTEGER_INDEX_U32 >>> 0; }
export function luaEngineV57SibBArg3TobooleanIndex() { return LUA_V57_SIB_B_ARG3_TOBOOLEAN_INDEX_U32 >>> 0; }
export function luaEngineV57SibBArg4ChecknumberIndex() { return LUA_V57_SIB_B_ARG4_CHECKNUMBER_INDEX_U32 >>> 0; }
export function luaEngineV57SibBArg5ChecknumberIndex() { return LUA_V57_SIB_B_ARG5_CHECKNUMBER_INDEX_U32 >>> 0; }
export function luaEngineV57ReturnValue() { return LUA_V57_RETURN_VALUE | 0; }
export function luaEngineV57InstallAVa() { return LUA_V57_INSTALL_A_VA >>> 0; }
export function luaEngineV57InstallALiteralVa() { return LUA_V57_INSTALL_A_LITERAL_VA >>> 0; }
export function luaEngineV57InstallANameVa() { return LUA_V57_INSTALL_A_NAME_VA >>> 0; }
export function luaEngineV57InstallARealFnVa() { return LUA_V57_INSTALL_A_REAL_FN_VA >>> 0; }
export function luaEngineV57InstallBVa() { return LUA_V57_INSTALL_B_VA >>> 0; }
export function luaEngineV57InstallBLiteralVa() { return LUA_V57_INSTALL_B_LITERAL_VA >>> 0; }
export function luaEngineV57InstallBNameVa() { return LUA_V57_INSTALL_B_NAME_VA >>> 0; }
export function luaEngineV57InstallBRealFnVa() { return LUA_V57_INSTALL_B_REAL_FN_VA >>> 0; }

/* ---- ABI v58: wrapper 0x8b96d0 ("AdjustVolume" 0xb74bf0 / 0x92df40,
 * "AdjustPitch" 0xb74bc4 / 0x92e050 — ONE closure body, TWO register-held
 * (name, real_fn) pairs via the ret-8 SINGLE-reg installer 0x8954b0).
 * See the lua-v58-net notes + header ABI v58 block for PE-truth
 * transcription. NET-AUDIT top open candidate: the first caller-bearing
 * UNLANDED body after Play; literal 0x8b96d0 @0x8954c9, zero E8 callers.
 *
 * SIMPLE ebp frame (`push ebp; mov ebp,esp; sub esp,0x10; push esi;
 * push edi`); L = esi = [ebp+8]; obj1 = lua_type(L,1) FULL-WORD gate ->
 * 0x85c590 (flags 0, KEY 0xc82a16, edx 1) -> [eax+4]; touserdata(L,
 * 0xfff0b9d7) NO add esp,8 + checknumber(L,3) + checkinteger(L,2) all
 * left pushed, ONE fused add esp,0x14; leftover upvidx dword = arg1 slot
 * (movss [esp] = num3 f32); arg0 = int2 FULL WORD (push eax); real_fn =
 * ud[0]; ecx = obj1; ret 0. Same key as v57 Play — the differentiator is
 * the SIMPLE ebp frame + TWO args (no bool, no getArgObject).
 * ---------------------------------------------------------------------- */
export const LUA_V58_VA = 0x008b96d0;
export const LUA_V58_RET_VA = 0x008b9751;
export const LUA_V58_BODY_BYTES = 0x0081;
export const LUA_V58_INSNS = 48; /* capstone TRUE body, ret incl. */
export const LUA_V58_CHECK_FLAGS = 0;
export const LUA_V58_CHECK_EDX = 1;
export const LUA_V58_TYPE_INDEX = 0x01;
export const LUA_V58_OBJECT_FIELD_OFF = 0x04;
export const LUA_V58_KEY = 0x00c82a16;
export const LUA_V58_TOUSERDATA_INDEX_U32 = 0xfff0b9d7;
export const LUA_V58_FN_OFF = 0x00;
export const LUA_V58_IAT_LUA_TYPE = 0x00b18400;
export const LUA_V58_IAT_LUA_TOUSERDATA = 0x00b183b0;
export const LUA_V58_IAT_LUA_CHECKNUMBER = 0x00b18324;
export const LUA_V58_IAT_LUA_CHECKINTEGER = 0x00b183f4;
export const LUA_V58_ARG0_CHECKINTEGER_INDEX_U32 = 0x02;
export const LUA_V58_ARG1_CHECKNUMBER_INDEX_U32 = 0x03;
export const LUA_V58_RETURN_VALUE = 0;

export const LUA_V58_INSTALL_VA = 0x008954b0;
export const LUA_V58_INSTALL_LITERAL_VA = 0x008954c9;
export const LUA_V58_INSTALL_REAL_FN_A_VA = 0x0092df40;
export const LUA_V58_INSTALL_NAME_A_VA = 0x00b74bf0;
export const LUA_V58_INSTALL_CALLER_A_VA = 0x0086da96;
export const LUA_V58_INSTALL_REAL_FN_B_VA = 0x0092e050;
export const LUA_V58_INSTALL_NAME_B_VA = 0x00b74bc4;
export const LUA_V58_INSTALL_CALLER_B_VA = 0x0086daa7;

export function luaEngineV58ObjectResolve(typeResult, checkField) {
  /* FULL-WORD lua_type(L,1) gate (`test eax,eax` @0x8b96e7): nil -> 0,
     else check_field. Never byte-masked (0x100 -> checkField). */
  return typeResult !== 0 ? checkField : 0;
}
export function luaEngineV58IntWord(checkintResult) {
  /* checkinteger FULL WORD passthrough (`push eax` @0x8b9745): 0x100 /
     0x10000 / 0xffffffff all survive. Never masked. */
  return checkintResult >>> 0;
}
export function luaEngineV58Va() { return LUA_V58_VA >>> 0; }
export function luaEngineV58RetVa() { return LUA_V58_RET_VA >>> 0; }
export function luaEngineV58BodyBytes() { return LUA_V58_BODY_BYTES >>> 0; }
export function luaEngineV58InsnCount() { return LUA_V58_INSNS | 0; }
export function luaEngineV58CheckFlags() { return LUA_V58_CHECK_FLAGS | 0; }
export function luaEngineV58CheckEdx() { return LUA_V58_CHECK_EDX | 0; }
export function luaEngineV58Key() { return LUA_V58_KEY >>> 0; }
export function luaEngineV58ObjectFieldOff() { return LUA_V58_OBJECT_FIELD_OFF >>> 0; }
export function luaEngineV58TypeIndex() { return LUA_V58_TYPE_INDEX >>> 0; }
export function luaEngineV58TouserdataIndex() { return LUA_V58_TOUSERDATA_INDEX_U32 >>> 0; }
export function luaEngineV58FnOff() { return LUA_V58_FN_OFF >>> 0; }
export function luaEngineV58IatLuaType() { return LUA_V58_IAT_LUA_TYPE >>> 0; }
export function luaEngineV58IatLuaTouserdata() { return LUA_V58_IAT_LUA_TOUSERDATA >>> 0; }
export function luaEngineV58IatLuaChecknumber() { return LUA_V58_IAT_LUA_CHECKNUMBER >>> 0; }
export function luaEngineV58IatLuaCheckinteger() { return LUA_V58_IAT_LUA_CHECKINTEGER >>> 0; }
export function luaEngineV58Arg0CheckintegerIndex() { return LUA_V58_ARG0_CHECKINTEGER_INDEX_U32 >>> 0; }
export function luaEngineV58Arg1ChecknumberIndex() { return LUA_V58_ARG1_CHECKNUMBER_INDEX_U32 >>> 0; }
export function luaEngineV58ReturnValue() { return LUA_V58_RETURN_VALUE | 0; }
export function luaEngineV58InstallVa() { return LUA_V58_INSTALL_VA >>> 0; }
export function luaEngineV58InstallLiteralVa() { return LUA_V58_INSTALL_LITERAL_VA >>> 0; }
export function luaEngineV58InstallRealFnAVa() { return LUA_V58_INSTALL_REAL_FN_A_VA >>> 0; }
export function luaEngineV58InstallNameAVa() { return LUA_V58_INSTALL_NAME_A_VA >>> 0; }
export function luaEngineV58InstallCallerAVa() { return LUA_V58_INSTALL_CALLER_A_VA >>> 0; }
export function luaEngineV58InstallRealFnBVa() { return LUA_V58_INSTALL_REAL_FN_B_VA >>> 0; }
export function luaEngineV58InstallNameBVa() { return LUA_V58_INSTALL_NAME_B_VA >>> 0; }
export function luaEngineV58InstallCallerBVa() { return LUA_V58_INSTALL_CALLER_B_VA >>> 0; }

/* ---- ABI v59: wrapper 0x8b9760 ("Stop" 0xb1d6f4 / 0x92e230,
 * "Preload" 0xb74bac / 0x92cf40 — ONE closure body, TWO
 * register-held (name, real_fn) pairs via the ret-8 SINGLE-reg installer
 * 0x895510). See the lua-v59-8b9760 notes + header ABI v59 block for
 * PE-truth transcription. NET-AUDIT next open candidate: the first
 * caller-bearing UNLANDED body of the 0x8b9760..0x8b9e80 band; literal
 * 0x8b9760 @0x895529, zero E8 callers.
 *
 * v59-B erratum (v60 unit): the pair pushed at @0x86dada is 0x92cf40 /
 * 0xb74bac "Preload" — the 0x92e300 / 0xb74bd0 "StopLoopingSounds" pair
 * belongs to the NEXT installer 0x895570 (landed as v60). B pins were
 * corrected here to match the PE (fresh capstone + cpu-dump + the
 * next-record-census 92e300 note agree).
 *
 * Aligned-ebp frame WITHOUT the ebx register frame (`push ebp; mov
 * ebp,esp; and esp,0xfffffff8; sub esp,8; push esi; push edi` — a new
 * shape vs v56/v57 ebx-framed + v58 SIMPLE); L = edi = [ebp+8]; obj1
 * local at [esp+0xc] (esp-relative, touched only at deterministic esp
 * points after each add esp,8 -> same [ebp-4] slot); obj1 = lua_type
 * (L,1) FULL-WORD gate -> 0x85c590 (flags 0, KEY 0xc82a16, edx 1) ->
 * [eax+4]; touserdata(L, 0xfff0b9d7) NO add esp,8 + checkinteger(L,2)
 * all left pushed, ONE fused add esp,0x10; ecx = obj1 loaded BEFORE
 * cleanup ([esp+0x1c]); arg0 = int2 FULL WORD (push eax); real_fn =
 * ud[0] (FN_OFF 0); ecx = obj1; ret 0. Same key as v57 Play / v58 —
 * the differentiator: aligned-ebp no-ebx frame + ONE int arg only (no
 * checknumber/toolean/getArgObject). No byte-gated lane.
 * ---------------------------------------------------------------------- */
export const LUA_V59_VA = 0x008b9760;
export const LUA_V59_RET_VA = 0x008b97cb;
export const LUA_V59_BODY_BYTES = 0x006b;
export const LUA_V59_INSNS = 41; /* capstone TRUE body, ret incl. */
export const LUA_V59_CHECK_FLAGS = 0;
export const LUA_V59_CHECK_EDX = 1;
export const LUA_V59_TYPE_INDEX = 0x01;
export const LUA_V59_OBJECT_FIELD_OFF = 0x04;
export const LUA_V59_KEY = 0x00c82a16;
export const LUA_V59_TOUSERDATA_INDEX_U32 = 0xfff0b9d7;
export const LUA_V59_FN_OFF = 0x00;
export const LUA_V59_IAT_LUA_TYPE = 0x00b18400;
export const LUA_V59_IAT_LUA_TOUSERDATA = 0x00b183b0;
export const LUA_V59_IAT_LUA_CHECKINTEGER = 0x00b183f4;
export const LUA_V59_ARG0_CHECKINTEGER_INDEX_U32 = 0x02;
export const LUA_V59_RETURN_VALUE = 0;

export const LUA_V59_INSTALL_VA = 0x00895510;
export const LUA_V59_INSTALL_LITERAL_VA = 0x00895529;
export const LUA_V59_INSTALL_REAL_FN_A_VA = 0x0092e230;
export const LUA_V59_INSTALL_NAME_A_VA = 0x00b1d6f4;
export const LUA_V59_INSTALL_CALLER_A_VA = 0x0086dab8;
export const LUA_V59_INSTALL_REAL_FN_B_VA = 0x0092cf40;
export const LUA_V59_INSTALL_NAME_B_VA = 0x00b74bac;
export const LUA_V59_INSTALL_CALLER_B_VA = 0x0086dada;

export function luaEngineV59ObjectResolve(typeResult, checkField) {
  /* FULL-WORD lua_type(L,1) gate (`test eax,eax` @0x8b977a): nil -> 0,
     else check_field. Never byte-masked (0x100 -> checkField). */
  return typeResult !== 0 ? checkField : 0;
}
export function luaEngineV59IntWord(checkintResult) {
  /* checkinteger FULL WORD passthrough (`push eax` @0x8b97bf): 0x100 /
     0x10000 / 0xffffffff all survive. Never masked. */
  return checkintResult >>> 0;
}
export function luaEngineV59Va() { return LUA_V59_VA >>> 0; }
export function luaEngineV59RetVa() { return LUA_V59_RET_VA >>> 0; }
export function luaEngineV59BodyBytes() { return LUA_V59_BODY_BYTES >>> 0; }
export function luaEngineV59InsnCount() { return LUA_V59_INSNS | 0; }
export function luaEngineV59CheckFlags() { return LUA_V59_CHECK_FLAGS | 0; }
export function luaEngineV59CheckEdx() { return LUA_V59_CHECK_EDX | 0; }
export function luaEngineV59Key() { return LUA_V59_KEY >>> 0; }
export function luaEngineV59ObjectFieldOff() { return LUA_V59_OBJECT_FIELD_OFF >>> 0; }
export function luaEngineV59TypeIndex() { return LUA_V59_TYPE_INDEX >>> 0; }
export function luaEngineV59TouserdataIndex() { return LUA_V59_TOUSERDATA_INDEX_U32 >>> 0; }
export function luaEngineV59FnOff() { return LUA_V59_FN_OFF >>> 0; }
export function luaEngineV59IatLuaType() { return LUA_V59_IAT_LUA_TYPE >>> 0; }
export function luaEngineV59IatLuaTouserdata() { return LUA_V59_IAT_LUA_TOUSERDATA >>> 0; }
export function luaEngineV59IatLuaCheckinteger() { return LUA_V59_IAT_LUA_CHECKINTEGER >>> 0; }
export function luaEngineV59Arg0CheckintegerIndex() { return LUA_V59_ARG0_CHECKINTEGER_INDEX_U32 >>> 0; }
export function luaEngineV59ReturnValue() { return LUA_V59_RETURN_VALUE | 0; }
export function luaEngineV59InstallVa() { return LUA_V59_INSTALL_VA >>> 0; }
export function luaEngineV59InstallLiteralVa() { return LUA_V59_INSTALL_LITERAL_VA >>> 0; }
export function luaEngineV59InstallRealFnAVa() { return LUA_V59_INSTALL_REAL_FN_A_VA >>> 0; }
export function luaEngineV59InstallNameAVa() { return LUA_V59_INSTALL_NAME_A_VA >>> 0; }
export function luaEngineV59InstallCallerAVa() { return LUA_V59_INSTALL_CALLER_A_VA >>> 0; }
export function luaEngineV59InstallRealFnBVa() { return LUA_V59_INSTALL_REAL_FN_B_VA >>> 0; }
export function luaEngineV59InstallNameBVa() { return LUA_V59_INSTALL_NAME_B_VA >>> 0; }
export function luaEngineV59InstallCallerBVa() { return LUA_V59_INSTALL_CALLER_B_VA >>> 0; }

/* ---- ABI v60: wrapper 0x8b97d0 "StopLoopingSounds" (the SECOND body of
 * the 0x8b9760..0x8b9e80 band; v59 NOTES next-frontier). See the
 * lua-v60-8b97d0 notes + header ABI v60 block for PE-truth
 * transcription. literal 0x8b97d0 @0x895583 inside the IMMEDIATE-held
 * ret-8 installer 0x895570; zero E8 callers.
 *
 * SIMPLE ebp frame (`push ebp; mov ebp,esp; push esi; mov esi,[ebp+8];
 * push edi` — v58-shaped, NOT the v59 aligned no-ebx frame); L = esi =
 * [ebp+8]; obj1 lives in EDI (REGISTER) — ZERO mem stores; obj1 =
 * lua_type(L,1) FULL-WORD gate -> 0x85c590 (flags 0, KEY 0xc82a16, edx
 * 1) -> [eax+4]; touserdata(L, 0xfff0b9d7) with add esp,8 cleanup
 * PRESENT; ecx = obj1 AFTER cleanup; eax = [eax] (ud[0], FN_OFF 0);
 * `call eax` with ZERO pushed args (no checkinteger/checknumber/
 * toboolean anywhere); ret 0. ZERO-ARG wrapper: no int_word law, no
 * arg0 index, no checkinteger IAT. Same key band as v57/v58/v59.
 * Installer 0x895570 = IMMEDIATE-held SINGLE (one rawset chain @ -3,
 * real_fn 0x92e300 + name 0xb74bd0 baked as body immediates, caller
 * @0x86dac9's pushed dwords DEAD), ret 8 @0x8955c6, cleanup 0x38.
 * ---------------------------------------------------------------------- */
export const LUA_V60_VA = 0x008b97d0;
export const LUA_V60_RET_VA = 0x008b981f;
export const LUA_V60_BODY_BYTES = 0x004f;
export const LUA_V60_INSNS = 32; /* capstone TRUE body, ret incl. */
export const LUA_V60_CHECK_FLAGS = 0;
export const LUA_V60_CHECK_EDX = 1;
export const LUA_V60_TYPE_INDEX = 0x01;
export const LUA_V60_OBJECT_FIELD_OFF = 0x04;
export const LUA_V60_KEY = 0x00c82a16;
export const LUA_V60_TOUSERDATA_INDEX_U32 = 0xfff0b9d7;
export const LUA_V60_FN_OFF = 0x00;
export const LUA_V60_IAT_LUA_TYPE = 0x00b18400;
export const LUA_V60_IAT_LUA_TOUSERDATA = 0x00b183b0;
export const LUA_V60_RETURN_VALUE = 0;

export const LUA_V60_INSTALL_VA = 0x00895570;
export const LUA_V60_INSTALL_LITERAL_VA = 0x00895583;
export const LUA_V60_INSTALL_REAL_FN_VA = 0x0092e300;
export const LUA_V60_INSTALL_NAME_VA = 0x00b74bd0;
export const LUA_V60_INSTALL_CALLER_VA = 0x0086dac9;

export function luaEngineV60ObjectResolve(typeResult, checkField) {
  /* FULL-WORD lua_type(L,1) gate (`test eax,eax` @0x8b97e4): nil -> 0,
     else check_field. Never byte-masked (0x100 -> checkField). */
  return typeResult !== 0 ? checkField : 0;
}
export function luaEngineV60Va() { return LUA_V60_VA >>> 0; }
export function luaEngineV60RetVa() { return LUA_V60_RET_VA >>> 0; }
export function luaEngineV60BodyBytes() { return LUA_V60_BODY_BYTES >>> 0; }
export function luaEngineV60InsnCount() { return LUA_V60_INSNS | 0; }
export function luaEngineV60CheckFlags() { return LUA_V60_CHECK_FLAGS | 0; }
export function luaEngineV60CheckEdx() { return LUA_V60_CHECK_EDX | 0; }
export function luaEngineV60Key() { return LUA_V60_KEY >>> 0; }
export function luaEngineV60ObjectFieldOff() { return LUA_V60_OBJECT_FIELD_OFF >>> 0; }
export function luaEngineV60TypeIndex() { return LUA_V60_TYPE_INDEX >>> 0; }
export function luaEngineV60TouserdataIndex() { return LUA_V60_TOUSERDATA_INDEX_U32 >>> 0; }
export function luaEngineV60FnOff() { return LUA_V60_FN_OFF >>> 0; }
export function luaEngineV60IatLuaType() { return LUA_V60_IAT_LUA_TYPE >>> 0; }
export function luaEngineV60IatLuaTouserdata() { return LUA_V60_IAT_LUA_TOUSERDATA >>> 0; }
export function luaEngineV60ReturnValue() { return LUA_V60_RETURN_VALUE | 0; }
export function luaEngineV60InstallVa() { return LUA_V60_INSTALL_VA >>> 0; }
export function luaEngineV60InstallLiteralVa() { return LUA_V60_INSTALL_LITERAL_VA >>> 0; }
export function luaEngineV60InstallRealFnVa() { return LUA_V60_INSTALL_REAL_FN_VA >>> 0; }
export function luaEngineV60InstallNameVa() { return LUA_V60_INSTALL_NAME_VA >>> 0; }
export function luaEngineV60InstallCallerVa() { return LUA_V60_INSTALL_CALLER_VA >>> 0; }

/* ---- ABI v61: wrapper 0x8b9820 "IsPlaying" (the THIRD body of the
 * 0x8b9760..0x8b9e80 band; v60 NOTES next-frontier). See the
 * lua-v61-8b9820 notes + header ABI v61 block for PE-truth
 * transcription. literal 0x8b9820 @0x8955e3 inside the IMMEDIATE-held
 * ret-8 installer 0x8955d0; zero E8 callers, one installer caller
 * @0x86daeb.
 *
 * ALIGNED-ebp frame WITHOUT the ebx register frame (`push ebp; mov
 * ebp,esp; and esp,0xfffffff8; sub esp,8; push esi; push edi` — the
 * v59 shape, NOT v60's SIMPLE ebp); L = edi = [ebp+8]; obj1 lives in
 * the [esp+0xc] SPILL SLOT (mem-stores 2, both @[esp+0xc]); obj1 =
 * lua_type(L,1) FULL-WORD gate -> 0x85c590 (flags 0, KEY 0xc82a16,
 * edx 1) -> [eax+4] -> [esp+0xc]; touserdata(L, 0xfff0b9d7) NO add
 * esp,8 + checkinteger(L,2), 4 dwords pushed; ESP-TRACKING: real_fn =
 * ud[0] (FN_OFF 0) loaded BEFORE cleanup, ONE fused add esp,0x10, obj1
 * = [esp+0xc] re-read AFTER the restore (write level == read level,
 * same [ebp-4] slot — contrast v59's read-before-cleanup @[esp+0x1c]);
 * arg0 = int2 FULL WORD (push eax); call edx = real_fn(obj1, int2);
 * BYTE-GATED RETURN: test al,al; setne cl ((eax & 0xff) != 0) ->
 * lua_pushboolean(L, res) @0xb183ec -> ret 1. ONE int arg + ONE
 * byte-gated bool return (the family's first pushboolean law in this
 * band; uint32_t & 0xff discipline, NO uint8_t). Same key 0xc82a16 as
 * v57..v60. Installer 0x8955d0 = IMMEDIATE-held SINGLE (one rawset
 * chain @ -3, real_fn 0x92e560 + name 0xb70584 baked as body
 * immediates, caller @0x86daeb's pushed dwords DEAD), ret 8 @0x895626,
 * cleanup 0x38.
 * ---------------------------------------------------------------------- */
export const LUA_V61_VA = 0x008b9820;
export const LUA_V61_RET_VA = 0x008b98a0;
export const LUA_V61_BODY_BYTES = 0x0080;
export const LUA_V61_INSNS = 48; /* capstone TRUE body, ret incl. */
export const LUA_V61_CHECK_FLAGS = 0;
export const LUA_V61_CHECK_EDX = 1;
export const LUA_V61_TYPE_INDEX = 0x01;
export const LUA_V61_OBJECT_FIELD_OFF = 0x04;
export const LUA_V61_KEY = 0x00c82a16;
export const LUA_V61_TOUSERDATA_INDEX_U32 = 0xfff0b9d7;
export const LUA_V61_FN_OFF = 0x00;
export const LUA_V61_ARG0_CHECKINTEGER_INDEX_U32 = 0x02;
export const LUA_V61_IAT_LUA_TYPE = 0x00b18400;
export const LUA_V61_IAT_LUA_TOUSERDATA = 0x00b183b0;
export const LUA_V61_IAT_LUA_CHECKINTEGER = 0x00b183f4;
export const LUA_V61_IAT_LUA_PUSHBOOLEAN = 0x00b183ec;
export const LUA_V61_RETURN_VALUE = 1;

export const LUA_V61_INSTALL_VA = 0x008955d0;
export const LUA_V61_INSTALL_LITERAL_VA = 0x008955e3;
export const LUA_V61_INSTALL_REAL_FN_VA = 0x0092e560;
export const LUA_V61_INSTALL_NAME_VA = 0x00b70584;
export const LUA_V61_INSTALL_CALLER_VA = 0x0086daeb;

export function luaEngineV61ObjectResolve(typeResult, checkField) {
  /* FULL-WORD lua_type(L,1) gate (`test eax,eax` @0x8b983a): nil -> 0,
     else check_field. Never byte-masked (0x100 -> checkField). */
  return typeResult !== 0 ? checkField : 0;
}
export function luaEngineV61IntWord(checkintResult) {
  /* checkinteger FULL WORD passthrough (`push eax` @0x8b9881): 0x100 /
     0x10000 / 0xffffffff all survive. Never masked. */
  return checkintResult >>> 0;
}
export function luaEngineV61ReturnGate(realFnResult) {
  /* BYTE-GATED return (`test al,al; setne cl` @0x8b9886/@0x8b9888 —
     the real_fn's cdecl bool in eax, low byte tested): only
     (result & 0xff) matters — 0x100/0xff00 behave like 0, 0x1ff/0xff
     like 1. uint32_t in/out, NO uint8_t. */
  return (realFnResult & 0xff) !== 0 ? 1 : 0;
}
export function luaEngineV61Va() { return LUA_V61_VA >>> 0; }
export function luaEngineV61RetVa() { return LUA_V61_RET_VA >>> 0; }
export function luaEngineV61BodyBytes() { return LUA_V61_BODY_BYTES >>> 0; }
export function luaEngineV61InsnCount() { return LUA_V61_INSNS | 0; }
export function luaEngineV61CheckFlags() { return LUA_V61_CHECK_FLAGS | 0; }
export function luaEngineV61CheckEdx() { return LUA_V61_CHECK_EDX | 0; }
export function luaEngineV61Key() { return LUA_V61_KEY >>> 0; }
export function luaEngineV61ObjectFieldOff() { return LUA_V61_OBJECT_FIELD_OFF >>> 0; }
export function luaEngineV61TypeIndex() { return LUA_V61_TYPE_INDEX >>> 0; }
export function luaEngineV61TouserdataIndex() { return LUA_V61_TOUSERDATA_INDEX_U32 >>> 0; }
export function luaEngineV61FnOff() { return LUA_V61_FN_OFF >>> 0; }
export function luaEngineV61Arg0CheckintegerIndex() { return LUA_V61_ARG0_CHECKINTEGER_INDEX_U32 >>> 0; }
export function luaEngineV61IatLuaType() { return LUA_V61_IAT_LUA_TYPE >>> 0; }
export function luaEngineV61IatLuaTouserdata() { return LUA_V61_IAT_LUA_TOUSERDATA >>> 0; }
export function luaEngineV61IatLuaCheckinteger() { return LUA_V61_IAT_LUA_CHECKINTEGER >>> 0; }
export function luaEngineV61IatLuaPushboolean() { return LUA_V61_IAT_LUA_PUSHBOOLEAN >>> 0; }
export function luaEngineV61ReturnValue() { return LUA_V61_RETURN_VALUE | 0; }
export function luaEngineV61InstallVa() { return LUA_V61_INSTALL_VA >>> 0; }
export function luaEngineV61InstallLiteralVa() { return LUA_V61_INSTALL_LITERAL_VA >>> 0; }
export function luaEngineV61InstallRealFnVa() { return LUA_V61_INSTALL_REAL_FN_VA >>> 0; }
export function luaEngineV61InstallNameVa() { return LUA_V61_INSTALL_NAME_VA >>> 0; }
export function luaEngineV61InstallCallerVa() { return LUA_V61_INSTALL_CALLER_VA >>> 0; }

/* ---- ABI v62: wrapper 0x8b98b0 "SetAmbientSound" (the FOURTH body of
 * the 0x8b9760..0x8b9e80 band; v61 NOTES next-frontier). See the
 * lua-v62-8b98b0 notes + header ABI v62 block for PE-truth
 * transcription. literal 0x8b98b0 @0x895643 inside the IMMEDIATE-held
 * ret-8 installer 0x895630; zero E8 callers, one installer caller
 * @0x86dafc.
 *
 * SIMPLE ebp frame (`push ebp; mov ebp,esp; sub esp,0x14; push esi;
 * push edi` — v60-shaped, NOT v61's ALIGNED-ebp); L = edi = [ebp+8];
 * obj1 lives in the [ebp-4] SPILL SLOT (mem-stores 2, both @[ebp-4];
 * ebp-relative -> esp-shift immune); obj1 = lua_type(L,1) FULL-WORD
 * gate -> 0x85c590 (flags 0, KEY 0xc82a16, edx 1) -> [eax+4] ->
 * [ebp-4]; touserdata(L, 0xfff0b9d7) NO add esp,8 (2 arg dwords stay
 * pushed) -> esi; arg2 = num4 = checknumber(L,4) @0xb18324 -> x87 ->
 * fstp dword [ebp-0x10]; arg1 = num3 = checknumber(L,3) @0xb18324 ->
 * fstp dword [ebp-8]; arg0 = int2 = checkinteger(L,2) @0xb183f4 ->
 * eax; SIX dwords pushed, ONE fused add esp,0x18 @0x8b9926;
 * ESP-TRACKING: movss [esp+4] (num4) + movss [esp] (num3) AFTER the
 * restore write into the DEAD SAVED-REGISTER slots ([esp+4]=[ebp-0x18]
 * saved esi, [esp]=[ebp-0x1c] saved edi — register copies stay live);
 * push eax = int2 FULL WORD; real_fn = ud[0] (FN_OFF 0) loaded AFTER
 * all pushes (register-held esi); call eax @0x8b993f. Final stack:
 * [esp+0]=int2, [esp+4]=B(num3), [esp+8]=A(num4), [esp+0xc]=junk
 * (real_fn ret 0xc consumes 3 dwords). this = obj1 in ECX (mov
 * ecx,[ebp-4] @0x8b9929 — after cleanup). xor eax,eax @0x8b9942 ->
 * ret 0 Lua values — NO byte-gated lane (v61's pushboolean body is
 * NOT this body). THREE-ARG wrapper (int, num, num) — the band's
 * first checknumber float lanes. All gates/words uint32_t.
 * Installer 0x895630 = IMMEDIATE-held SINGLE (one rawset chain @ -3,
 * real_fn 0x92e620 + name 0xb74bb4 baked as body immediates, caller
 * @0x86dafc's pushed dwords DEAD), ret 8 @0x895686, cleanup 0x38.
 * ---------------------------------------------------------------------- */
export const LUA_V62_VA = 0x008b98b0;
export const LUA_V62_RET_VA = 0x008b9948;
export const LUA_V62_BODY_BYTES = 0x0098;
export const LUA_V62_INSNS = 54; /* capstone TRUE body, ret incl. */
export const LUA_V62_CHECK_FLAGS = 0;
export const LUA_V62_CHECK_EDX = 1;
export const LUA_V62_TYPE_INDEX = 0x01;
export const LUA_V62_OBJECT_FIELD_OFF = 0x04;
export const LUA_V62_KEY = 0x00c82a16;
export const LUA_V62_TOUSERDATA_INDEX_U32 = 0xfff0b9d7;
export const LUA_V62_FN_OFF = 0x00;
export const LUA_V62_ARG0_CHECKINTEGER_INDEX_U32 = 0x02;
export const LUA_V62_ARG1_CHECKNUMBER_INDEX_U32 = 0x03;
export const LUA_V62_ARG2_CHECKNUMBER_INDEX_U32 = 0x04;
export const LUA_V62_IAT_LUA_TYPE = 0x00b18400;
export const LUA_V62_IAT_LUA_TOUSERDATA = 0x00b183b0;
export const LUA_V62_IAT_LUA_CHECKINTEGER = 0x00b183f4;
export const LUA_V62_IAT_LUA_CHECKNUMBER = 0x00b18324;
export const LUA_V62_RETURN_VALUE = 0;

export const LUA_V62_INSTALL_VA = 0x00895630;
export const LUA_V62_INSTALL_LITERAL_VA = 0x00895643;
export const LUA_V62_INSTALL_REAL_FN_VA = 0x0092e620;
export const LUA_V62_INSTALL_NAME_VA = 0x00b74bb4;
export const LUA_V62_INSTALL_CALLER_VA = 0x0086dafc;

export function luaEngineV62ObjectResolve(typeResult, checkField) {
  /* FULL-WORD lua_type(L,1) gate (`test eax,eax` @0x8b98c7): nil -> 0,
     else check_field. Never byte-masked (0x100 -> checkField). */
  return typeResult !== 0 ? checkField : 0;
}
export function luaEngineV62IntWord(checkintResult) {
  /* checkinteger FULL WORD passthrough (`push eax` @0x8b993c): 0x100 /
     0x10000 / 0xffffffff all survive. Never masked. */
  return checkintResult >>> 0;
}
export function luaEngineV62Va() { return LUA_V62_VA >>> 0; }
export function luaEngineV62RetVa() { return LUA_V62_RET_VA >>> 0; }
export function luaEngineV62BodyBytes() { return LUA_V62_BODY_BYTES >>> 0; }
export function luaEngineV62InsnCount() { return LUA_V62_INSNS | 0; }
export function luaEngineV62CheckFlags() { return LUA_V62_CHECK_FLAGS | 0; }
export function luaEngineV62CheckEdx() { return LUA_V62_CHECK_EDX | 0; }
export function luaEngineV62Key() { return LUA_V62_KEY >>> 0; }
export function luaEngineV62ObjectFieldOff() { return LUA_V62_OBJECT_FIELD_OFF >>> 0; }
export function luaEngineV62TypeIndex() { return LUA_V62_TYPE_INDEX >>> 0; }
export function luaEngineV62TouserdataIndex() { return LUA_V62_TOUSERDATA_INDEX_U32 >>> 0; }
export function luaEngineV62FnOff() { return LUA_V62_FN_OFF >>> 0; }
export function luaEngineV62Arg0CheckintegerIndex() { return LUA_V62_ARG0_CHECKINTEGER_INDEX_U32 >>> 0; }
export function luaEngineV62Arg1ChecknumberIndex() { return LUA_V62_ARG1_CHECKNUMBER_INDEX_U32 >>> 0; }
export function luaEngineV62Arg2ChecknumberIndex() { return LUA_V62_ARG2_CHECKNUMBER_INDEX_U32 >>> 0; }
export function luaEngineV62IatLuaType() { return LUA_V62_IAT_LUA_TYPE >>> 0; }
export function luaEngineV62IatLuaTouserdata() { return LUA_V62_IAT_LUA_TOUSERDATA >>> 0; }
export function luaEngineV62IatLuaCheckinteger() { return LUA_V62_IAT_LUA_CHECKINTEGER >>> 0; }
export function luaEngineV62IatLuaChecknumber() { return LUA_V62_IAT_LUA_CHECKNUMBER >>> 0; }
export function luaEngineV62ReturnValue() { return LUA_V62_RETURN_VALUE | 0; }
export function luaEngineV62InstallVa() { return LUA_V62_INSTALL_VA >>> 0; }
export function luaEngineV62InstallLiteralVa() { return LUA_V62_INSTALL_LITERAL_VA >>> 0; }
export function luaEngineV62InstallRealFnVa() { return LUA_V62_INSTALL_REAL_FN_VA >>> 0; }
export function luaEngineV62InstallNameVa() { return LUA_V62_INSTALL_NAME_VA >>> 0; }
export function luaEngineV62InstallCallerVa() { return LUA_V62_INSTALL_CALLER_VA >>> 0; }

/* ---- ABI v63: Lua-registered closure BODY laws 0x85e370
 * "GetNumEncounteredBosses" + 0x85e380 "GetScreenShakeCountdown" (PlayerHUD
 * band 0x85e330..0x85e38f; wave-24 F10 lease; playerhud-v39 census DECLINED
 * them as 0-caller accessors -> this lua-family unit lands the BODY laws).
 * Zero rel32 callers image-wide, zero data pointers, zero exports, zero
 * identify-zhl matches; reachability = the Lua closure registration only
 * (push immediates @0x86d81e / @0x86d8ab + installer fills @0x894bd8 /
 * @0x894e23). Bodies pure (sub wrap + sar 3 / lea identity); installer
 * bodies 0x894bc0 / 0x894e00 and closure trampolines 0x8b8e80 / 0x8b8f70
 * stay HOST. See header ABI v63 block + lua-v62-getters notes. ---------- */
export const LUA_V63_NUM_BOSSES_VA = 0x0085e370;
export const LUA_V63_NUM_BOSSES_RET_VA = 0x0085e37f;
export const LUA_V63_NUM_BOSSES_INSNS = 4; /* capstone TRUE body, ret incl. */
export const LUA_V63_NUM_BOSSES_HEAD_OFF = 0x269d8;
export const LUA_V63_NUM_BOSSES_BASE_OFF = 0x269d4;
export const LUA_V63_NUM_BOSSES_STRIDE_SHIFT = 3; /* sar imm */

export const LUA_V63_NUM_BOSSES_INSTALL_HELPER_VA = 0x00894bc0;
export const LUA_V63_NUM_BOSSES_INSTALL_FILL_VA = 0x00894bdb;
export const LUA_V63_NUM_BOSSES_INSTALL_LITERAL_VA = 0x0086d81f;
export const LUA_V63_NUM_BOSSES_INSTALL_REAL_FN_VA = 0x0085e370;
export const LUA_V63_NUM_BOSSES_INSTALL_NAME_VA = 0x00b74950;
export const LUA_V63_NUM_BOSSES_INSTALL_TRAMPOLINE_VA = 0x008b8e80;
export const LUA_V63_NUM_BOSSES_INSTALL_CALLER_VA = 0x0086d81e;
export const LUA_V63_NUM_BOSSES_INSTALL_CALL_VA = 0x0086d82a;

export const LUA_V63_SHAKE_COUNTDOWN_VA = 0x0085e380;
export const LUA_V63_SHAKE_COUNTDOWN_RET_VA = 0x0085e386;
export const LUA_V63_SHAKE_COUNTDOWN_INSNS = 2; /* capstone TRUE body */
export const LUA_V63_SHAKE_COUNTDOWN_FIELD_OFF = 0x26508;

export const LUA_V63_SHAKE_COUNTDOWN_INSTALL_HELPER_VA = 0x00894e00;
export const LUA_V63_SHAKE_COUNTDOWN_INSTALL_FILL_VA = 0x00894e26;
export const LUA_V63_SHAKE_COUNTDOWN_INSTALL_LITERAL_VA = 0x0086d8ac;
export const LUA_V63_SHAKE_COUNTDOWN_INSTALL_REAL_FN_VA = 0x0085e380;
export const LUA_V63_SHAKE_COUNTDOWN_INSTALL_NAME_VA = 0x00b74a04;
export const LUA_V63_SHAKE_COUNTDOWN_INSTALL_TRAMPOLINE_VA = 0x008b8f70;
export const LUA_V63_SHAKE_COUNTDOWN_INSTALL_CALLER_VA = 0x0086d8ab;
export const LUA_V63_SHAKE_COUNTDOWN_INSTALL_CALL_VA = 0x0086d8b7;

/* PE `sub eax,[ecx+0x269d4]; sar eax,3` @0x85e376/@0x85e37c — 32-bit wrap
 * delta then SIGNED arithmetic shift (floor /8): (0,9) -> 0xfffffffe (-2),
 * NOT C-truncation -1; 0x80000000 -> 0xf0000000, NOT shr_u 0x10000000.
 * uint32 in/out — no uint8_t scalar. */
export function luaEngineV63NumBossesCount(headField, baseField) {
  return ((headField - baseField) | 0) >> LUA_V63_NUM_BOSSES_STRIDE_SHIFT >>> 0;
}
/* PE `lea eax,[ecx+0x26508]` @0x85e380 — this + FIELD_OFF, u32 wrap. */
export function luaEngineV63ShakeCountdownPtr(thisPtr) {
  return ((thisPtr >>> 0) + LUA_V63_SHAKE_COUNTDOWN_FIELD_OFF) >>> 0;
}
export function luaEngineV63NumBossesVa() { return LUA_V63_NUM_BOSSES_VA >>> 0; }
export function luaEngineV63NumBossesRetVa() { return LUA_V63_NUM_BOSSES_RET_VA >>> 0; }
export function luaEngineV63NumBossesBodyBytes() { return (LUA_V63_NUM_BOSSES_RET_VA - LUA_V63_NUM_BOSSES_VA) >>> 0; }
export function luaEngineV63NumBossesInsnCount() { return LUA_V63_NUM_BOSSES_INSNS | 0; }
export function luaEngineV63NumBossesHeadOff() { return LUA_V63_NUM_BOSSES_HEAD_OFF >>> 0; }
export function luaEngineV63NumBossesBaseOff() { return LUA_V63_NUM_BOSSES_BASE_OFF >>> 0; }
export function luaEngineV63NumBossesStrideShift() { return LUA_V63_NUM_BOSSES_STRIDE_SHIFT | 0; }
export function luaEngineV63NumBossesInstallHelperVa() { return LUA_V63_NUM_BOSSES_INSTALL_HELPER_VA >>> 0; }
export function luaEngineV63NumBossesInstallFillVa() { return LUA_V63_NUM_BOSSES_INSTALL_FILL_VA >>> 0; }
export function luaEngineV63NumBossesInstallLiteralVa() { return LUA_V63_NUM_BOSSES_INSTALL_LITERAL_VA >>> 0; }
export function luaEngineV63NumBossesInstallRealFnVa() { return LUA_V63_NUM_BOSSES_INSTALL_REAL_FN_VA >>> 0; }
export function luaEngineV63NumBossesInstallNameVa() { return LUA_V63_NUM_BOSSES_INSTALL_NAME_VA >>> 0; }
export function luaEngineV63NumBossesInstallTrampolineVa() { return LUA_V63_NUM_BOSSES_INSTALL_TRAMPOLINE_VA >>> 0; }
export function luaEngineV63NumBossesInstallCallerVa() { return LUA_V63_NUM_BOSSES_INSTALL_CALLER_VA >>> 0; }
export function luaEngineV63NumBossesInstallCallVa() { return LUA_V63_NUM_BOSSES_INSTALL_CALL_VA >>> 0; }
export function luaEngineV63ShakeCountdownVa() { return LUA_V63_SHAKE_COUNTDOWN_VA >>> 0; }
export function luaEngineV63ShakeCountdownRetVa() { return LUA_V63_SHAKE_COUNTDOWN_RET_VA >>> 0; }
export function luaEngineV63ShakeCountdownBodyBytes() { return (LUA_V63_SHAKE_COUNTDOWN_RET_VA - LUA_V63_SHAKE_COUNTDOWN_VA) >>> 0; }
export function luaEngineV63ShakeCountdownInsnCount() { return LUA_V63_SHAKE_COUNTDOWN_INSNS | 0; }
export function luaEngineV63ShakeCountdownFieldOff() { return LUA_V63_SHAKE_COUNTDOWN_FIELD_OFF >>> 0; }
export function luaEngineV63ShakeCountdownInstallHelperVa() { return LUA_V63_SHAKE_COUNTDOWN_INSTALL_HELPER_VA >>> 0; }
export function luaEngineV63ShakeCountdownInstallFillVa() { return LUA_V63_SHAKE_COUNTDOWN_INSTALL_FILL_VA >>> 0; }
export function luaEngineV63ShakeCountdownInstallLiteralVa() { return LUA_V63_SHAKE_COUNTDOWN_INSTALL_LITERAL_VA >>> 0; }
export function luaEngineV63ShakeCountdownInstallRealFnVa() { return LUA_V63_SHAKE_COUNTDOWN_INSTALL_REAL_FN_VA >>> 0; }
export function luaEngineV63ShakeCountdownInstallNameVa() { return LUA_V63_SHAKE_COUNTDOWN_INSTALL_NAME_VA >>> 0; }
export function luaEngineV63ShakeCountdownInstallTrampolineVa() { return LUA_V63_SHAKE_COUNTDOWN_INSTALL_TRAMPOLINE_VA >>> 0; }
export function luaEngineV63ShakeCountdownInstallCallerVa() { return LUA_V63_SHAKE_COUNTDOWN_INSTALL_CALLER_VA >>> 0; }
export function luaEngineV63ShakeCountdownInstallCallVa() { return LUA_V63_SHAKE_COUNTDOWN_INSTALL_CALL_VA >>> 0; }

/* ---- ABI v64: wrapper 0x8b9950 "GetAmbientSoundVolume" (the FIFTH
 * body of the 0x8b9760..0x8b9e80 band; lua-v62-getters NEXT-FRONTIER).
 * See the lua-v64-8b9950 notes + header ABI v64 block for PE-truth
 * transcription. literal 0x8b9950 @0x8956a3 inside the IMMEDIATE-held
 * ret-8 installer 0x895690; zero E8 callers, one installer caller
 * @0x86db0d.
 *
 * ALIGNED ebp frame (`push ebp; mov ebp,esp; and esp,0xfffffff8; sub
 * esp,8; push esi; push edi` — the v61-shaped frame, NOT v62's SIMPLE
 * ebp); L = edi = [ebp+8]; obj1 spill at [esp+8] (= [ebp-0xc],
 * esp-relative constant-disp): lua_type(L,1) FULL-WORD gate @0x8b996a
 * -> 0x85c590 (flags 0, KEY 0xc82a16, edx 1) @0x8b9982 -> [eax+4]
 * (OBJ_FIELD_OFF 4) -> [esp+8]; touserdata(L, 0xfff0b9d7) NO add
 * esp,8 (2 arg dwords stay pushed) -> esi; arg0 = int2 =
 * checkinteger(L,2) @0xb183f4 -> eax; ESP-TRACKING: ecx=obj1 loaded
 * pre-cleanup (`mov ecx,[esp+0x18]` @0x8b99a8 = the [esp+8] slot with
 * 4 dwords pushed) then fused add esp,0x10 @0x8b99ac; `push eax`
 * @0x8b99af = int2 FULL WORD; real_fn = ud[0] (FN_OFF 0) @0x8b99b0 ->
 * temp `mov [esp+0x10],eax` @0x8b99b2 (dead [ebp-8] slot); `call
 * dword ptr [esp+0x10]` @0x8b99b6 (real_fn 0x92e6e0 ret 4 consumes
 * int2; this = obj1 in ECX). RETURN LANE: `fstp dword ptr [esp+0xc]`
 * @0x8b99ba truncates the x87 ST0 double return to float32 (RN) into
 * the dead obj1 slot; movss @0x8b99be; sub esp,8 @0x8b99c4;
 * `cvtps2pd` @0x8b99c7 = EXACT f32->f64 widen (v55 pusher 0x85c05c
 * cvtss2sd law precedent); movsd [esp] @0x8b99ca; push edi;
 * lua_pushnumber @0xb183f0 @0x8b99d0; add esp,0xc; `mov eax,1`
 * @0x8b99d9 -> ret 1 Lua value. NO byte gate (no pushboolean — v61's
 * byte-gated body is NOT this body). ONE-ARG wrapper (int only):
 * GetAmbientSoundVolume(obj1, soundIdx) -> Lua number. All
 * gates/words uint32_t.
 * Installer 0x895690 = IMMEDIATE-held SINGLE (one rawset chain @ -3,
 * real_fn 0x92e6e0 + name 0xb74c64 baked as body immediates @0x8956a8
 * / @0x8956bd, caller @0x86db0d's pushed dwords DEAD), ret 8
 * @0x8956e6, cleanup 0x38. real_fn 0x92e6e0 (HOST): double __thiscall
 * (Entity*, int idx), ret 4, fldz empty path.
 * ---------------------------------------------------------------------- */
export const LUA_V64_VA = 0x008b9950;
export const LUA_V64_RET_VA = 0x008b99e3;
export const LUA_V64_BODY_BYTES = 0x0093;
export const LUA_V64_INSNS = 50; /* capstone TRUE body, ret incl. */
export const LUA_V64_CHECK_FLAGS = 0;
export const LUA_V64_CHECK_EDX = 1;
export const LUA_V64_TYPE_INDEX = 0x01;
export const LUA_V64_OBJECT_FIELD_OFF = 0x04;
export const LUA_V64_KEY = 0x00c82a16;
export const LUA_V64_TOUSERDATA_INDEX_U32 = 0xfff0b9d7;
export const LUA_V64_FN_OFF = 0x00;
export const LUA_V64_ARG0_CHECKINTEGER_INDEX_U32 = 0x02;
export const LUA_V64_IAT_LUA_TYPE = 0x00b18400;
export const LUA_V64_IAT_LUA_TOUSERDATA = 0x00b183b0;
export const LUA_V64_IAT_LUA_CHECKINTEGER = 0x00b183f4;
export const LUA_V64_IAT_LUA_PUSHNUMBER = 0x00b183f0;
export const LUA_V64_RETURN_VALUE = 1;

export const LUA_V64_INSTALL_VA = 0x00895690;
export const LUA_V64_INSTALL_LITERAL_VA = 0x008956a3;
export const LUA_V64_INSTALL_REAL_FN_VA = 0x0092e6e0;
export const LUA_V64_INSTALL_NAME_VA = 0x00b74c64;
export const LUA_V64_INSTALL_CALLER_VA = 0x0086db0d;

export function luaEngineV64ObjectResolve(typeResult, checkField) {
  /* FULL-WORD lua_type(L,1) gate (`test eax,eax` @0x8b996a): nil -> 0,
     else check_field. Never byte-masked (0x100 -> checkField). */
  return typeResult !== 0 ? checkField : 0;
}
export function luaEngineV64IntWord(checkintResult) {
  /* checkinteger FULL WORD passthrough (`push eax` @0x8b99af): 0x100 /
     0x10000 / 0xffffffff all survive. Never masked. */
  return checkintResult >>> 0;
}
export function luaEngineV64F32TruncBits(retHi, retLo) {
  /* `fstp dword ptr [esp+0xc]` @0x8b99ba — the real_fn's x87 ST0 double
     return truncated to float32 (round-to-nearest-even), as the f32 bit
     pattern. The subsequent cvtps2pd @0x8b99c7 EXACTLY widens it to
     f64 (v55 pusher 0x85c05c cvtss2sd law precedent); the value
     lua_pushnumber receives is (double)(float)return. */
  const buf = new ArrayBuffer(8);
  const dv = new DataView(buf);
  dv.setUint32(0, retLo >>> 0, true);
  dv.setUint32(4, retHi >>> 0, true);
  const f = new Float32Array(1);
  f[0] = Math.fround(dv.getFloat64(0, true));
  return new Uint32Array(f.buffer)[0] >>> 0;
}
export function luaEngineV64Va() { return LUA_V64_VA >>> 0; }
export function luaEngineV64RetVa() { return LUA_V64_RET_VA >>> 0; }
export function luaEngineV64BodyBytes() { return LUA_V64_BODY_BYTES >>> 0; }
export function luaEngineV64InsnCount() { return LUA_V64_INSNS | 0; }
export function luaEngineV64CheckFlags() { return LUA_V64_CHECK_FLAGS | 0; }
export function luaEngineV64CheckEdx() { return LUA_V64_CHECK_EDX | 0; }
export function luaEngineV64Key() { return LUA_V64_KEY >>> 0; }
export function luaEngineV64ObjectFieldOff() { return LUA_V64_OBJECT_FIELD_OFF >>> 0; }
export function luaEngineV64TypeIndex() { return LUA_V64_TYPE_INDEX >>> 0; }
export function luaEngineV64TouserdataIndex() { return LUA_V64_TOUSERDATA_INDEX_U32 >>> 0; }
export function luaEngineV64FnOff() { return LUA_V64_FN_OFF >>> 0; }
export function luaEngineV64Arg0CheckintegerIndex() { return LUA_V64_ARG0_CHECKINTEGER_INDEX_U32 >>> 0; }
export function luaEngineV64IatLuaType() { return LUA_V64_IAT_LUA_TYPE >>> 0; }
export function luaEngineV64IatLuaTouserdata() { return LUA_V64_IAT_LUA_TOUSERDATA >>> 0; }
export function luaEngineV64IatLuaCheckinteger() { return LUA_V64_IAT_LUA_CHECKINTEGER >>> 0; }
export function luaEngineV64IatLuaPushnumber() { return LUA_V64_IAT_LUA_PUSHNUMBER >>> 0; }
export function luaEngineV64ReturnValue() { return LUA_V64_RETURN_VALUE | 0; }
export function luaEngineV64InstallVa() { return LUA_V64_INSTALL_VA >>> 0; }
export function luaEngineV64InstallLiteralVa() { return LUA_V64_INSTALL_LITERAL_VA >>> 0; }
export function luaEngineV64InstallRealFnVa() { return LUA_V64_INSTALL_REAL_FN_VA >>> 0; }
export function luaEngineV64InstallNameVa() { return LUA_V64_INSTALL_NAME_VA >>> 0; }
export function luaEngineV64InstallCallerVa() { return LUA_V64_INSTALL_CALLER_VA >>> 0; }


/* ---- ABI v65: wrapper 0x8b99f0 DOUBLE-literal installer ("Play" +
 * "Crossfade", MusicManager class key 0xc82a19; the v64 handoff's lit=2
 * frontier). See the lua-v65-lit2 notes + header ABI v65 block for
 * PE-truth transcription. literal dwords @0x895723 + @0x895783 — TWO
 * IMMEDIATE-held SINGLE ret-8 installers push the SAME wrapper:
 * 0x895710 (real_fn 0x7e1d50 + name 0xb70498 "Play", caller @0x86db80)
 * and 0x895770 (real_fn 0x7e1e70 + name 0xb74c50 "Crossfade", caller
 * @0x86dba2); zero E8 callers of the wrapper.
 *
 * SIMPLE ebp frame (`push ebp; mov ebp,esp; sub esp,0x10; push esi; mov
 * esi,[ebp+8]; push edi` — v60/v62-shaped); L = esi = [ebp+8] (v62's
 * edi is NOT this body); obj1 in the [ebp-4] SPILL SLOT; lua_type(L,1)
 * FULL-WORD gate @0x8b9a07 -> push 0 (flags) + KEY 0xc82a19 + edx=1 +
 * call 0x85c590; obj=[eax+4]. touserdata upvalueindex(1) @0x8b9a32 ->
 * edi (register-held, NO add esp,8 — v56/v57/v59); arg1 = num3
 * checknumber idx 3 -> fstp dword [ebp-0xc]; arg0 = int2 checkinteger
 * idx 2 -> eax; SIX dwords, ONE fused add esp,0x14 cleans FIVE; f32
 * lane round-trips [ebp-0xc] into movss [esp] (dead first-touserdata-arg
 * slot); this = obj1 = [ebp-4] -> ECX; push eax = int2 FULL WORD;
 * real_fn = [edi] (ud[0], FN_OFF 0) AFTER all pushes; final stack
 * [esp+0]=int2, [esp+4]=B(f32), [esp+8]=junk; real_fns ret 8. xor
 * eax,eax -> ret 0 (NO byte gate). All gates/words uint32_t.
 * ---------------------------------------------------------------------- */
export const LUA_V65_VA = 0x008b99f0;
export const LUA_V65_RET_VA = 0x008b9a71;
export const LUA_V65_BODY_BYTES = 0x0081;
export const LUA_V65_INSNS = 48; /* capstone TRUE body, ret incl. */
export const LUA_V65_CHECK_FLAGS = 0;
export const LUA_V65_CHECK_EDX = 1;
export const LUA_V65_TYPE_INDEX = 0x01;
export const LUA_V65_OBJECT_FIELD_OFF = 0x04;
export const LUA_V65_KEY = 0x00c82a19; /* MusicManager class key */
export const LUA_V65_TOUSERDATA_INDEX_U32 = 0xfff0b9d7;
export const LUA_V65_FN_OFF = 0x00;
export const LUA_V65_ARG0_CHECKINTEGER_INDEX_U32 = 0x02;
export const LUA_V65_ARG1_CHECKNUMBER_INDEX_U32 = 0x03;
export const LUA_V65_IAT_LUA_TYPE = 0x00b18400;
export const LUA_V65_IAT_LUA_TOUSERDATA = 0x00b183b0;
export const LUA_V65_IAT_LUA_CHECKINTEGER = 0x00b183f4;
export const LUA_V65_IAT_LUA_CHECKNUMBER = 0x00b18324;
export const LUA_V65_RETURN_VALUE = 0;
export const LUA_V65_INSTALL_COUNT = 2; /* lit=2: TWO name/real_fn pairs */

export const LUA_V65_INSTALL_A_VA = 0x00895710;
export const LUA_V65_INSTALL_A_RET_VA = 0x00895766;
export const LUA_V65_INSTALL_A_LITERAL_VA = 0x00895723;
export const LUA_V65_INSTALL_A_REAL_FN_VA = 0x007e1d50;
export const LUA_V65_INSTALL_A_NAME_VA = 0x00b70498; /* "Play" */
export const LUA_V65_INSTALL_A_CALLER_VA = 0x0086db80;

export const LUA_V65_INSTALL_B_VA = 0x00895770;
export const LUA_V65_INSTALL_B_RET_VA = 0x008957c6;
export const LUA_V65_INSTALL_B_LITERAL_VA = 0x00895783;
export const LUA_V65_INSTALL_B_REAL_FN_VA = 0x007e1e70;
export const LUA_V65_INSTALL_B_NAME_VA = 0x00b74c50; /* "Crossfade" */
export const LUA_V65_INSTALL_B_CALLER_VA = 0x0086dba2;

export function luaEngineV65ObjectResolve(typeResult, checkField) {
  /* FULL-WORD lua_type(L,1) gate (`test eax,eax` @0x8b9a07): nil -> 0,
     else check_field. Never byte-masked (0x100 -> checkField). */
  return typeResult !== 0 ? checkField : 0;
}
export function luaEngineV65IntWord(checkintResult) {
  /* checkinteger FULL WORD passthrough (`push eax` @0x8b9a65): 0x100 /
     0x10000 / 0xffffffff all survive. Never masked. */
  return checkintResult >>> 0;
}
export function luaEngineV65Va() { return LUA_V65_VA >>> 0; }
export function luaEngineV65RetVa() { return LUA_V65_RET_VA >>> 0; }
export function luaEngineV65BodyBytes() { return LUA_V65_BODY_BYTES >>> 0; }
export function luaEngineV65InsnCount() { return LUA_V65_INSNS | 0; }
export function luaEngineV65CheckFlags() { return LUA_V65_CHECK_FLAGS | 0; }
export function luaEngineV65CheckEdx() { return LUA_V65_CHECK_EDX | 0; }
export function luaEngineV65Key() { return LUA_V65_KEY >>> 0; }
export function luaEngineV65ObjectFieldOff() { return LUA_V65_OBJECT_FIELD_OFF >>> 0; }
export function luaEngineV65TypeIndex() { return LUA_V65_TYPE_INDEX >>> 0; }
export function luaEngineV65TouserdataIndex() { return LUA_V65_TOUSERDATA_INDEX_U32 >>> 0; }
export function luaEngineV65FnOff() { return LUA_V65_FN_OFF >>> 0; }
export function luaEngineV65Arg0CheckintegerIndex() { return LUA_V65_ARG0_CHECKINTEGER_INDEX_U32 >>> 0; }
export function luaEngineV65Arg1ChecknumberIndex() { return LUA_V65_ARG1_CHECKNUMBER_INDEX_U32 >>> 0; }
export function luaEngineV65IatLuaType() { return LUA_V65_IAT_LUA_TYPE >>> 0; }
export function luaEngineV65IatLuaTouserdata() { return LUA_V65_IAT_LUA_TOUSERDATA >>> 0; }
export function luaEngineV65IatLuaCheckinteger() { return LUA_V65_IAT_LUA_CHECKINTEGER >>> 0; }
export function luaEngineV65IatLuaChecknumber() { return LUA_V65_IAT_LUA_CHECKNUMBER >>> 0; }
export function luaEngineV65ReturnValue() { return LUA_V65_RETURN_VALUE | 0; }
export function luaEngineV65InstallCount() { return LUA_V65_INSTALL_COUNT | 0; }
export function luaEngineV65InstallAVa() { return LUA_V65_INSTALL_A_VA >>> 0; }
export function luaEngineV65InstallARetVa() { return LUA_V65_INSTALL_A_RET_VA >>> 0; }
export function luaEngineV65InstallALiteralVa() { return LUA_V65_INSTALL_A_LITERAL_VA >>> 0; }
export function luaEngineV65InstallARealFnVa() { return LUA_V65_INSTALL_A_REAL_FN_VA >>> 0; }
export function luaEngineV65InstallANameVa() { return LUA_V65_INSTALL_A_NAME_VA >>> 0; }
export function luaEngineV65InstallACallerVa() { return LUA_V65_INSTALL_A_CALLER_VA >>> 0; }
export function luaEngineV65InstallBVa() { return LUA_V65_INSTALL_B_VA >>> 0; }
export function luaEngineV65InstallBRetVa() { return LUA_V65_INSTALL_B_RET_VA >>> 0; }
export function luaEngineV65InstallBLiteralVa() { return LUA_V65_INSTALL_B_LITERAL_VA >>> 0; }
export function luaEngineV65InstallBRealFnVa() { return LUA_V65_INSTALL_B_REAL_FN_VA >>> 0; }
export function luaEngineV65InstallBNameVa() { return LUA_V65_INSTALL_B_NAME_VA >>> 0; }
export function luaEngineV65InstallBCallerVa() { return LUA_V65_INSTALL_B_CALLER_VA >>> 0; }

/* ---- ABI v66: wrapper 0x8b9a80 "Fadein" (MusicManager class key
 * 0xc82a19; the v65 handoff's lit=1 frontier, the THIRD wrapper of the
 * 0x8b99f0..0x8b9e80 run). See the lua-v66-8b9a80 notes + header ABI
 * v66 block for PE-truth transcription. literal dword @0x8957e3 — ONE
 * IMMEDIATE-held SINGLE ret-8 installer 0x8957d0 pushes the wrapper:
 * real_fn 0x7e2080 (= ZHL Music::Fadein(unsigned int, float, float),
 * host) + name 0xb74b30 "Fadein" (shared string, distinct site from the
 * v56 vec-band install @0x895190), caller @0x86db91; zero E8 callers of
 * the wrapper.
 *
 * SIMPLE ebp frame (`push ebp; mov ebp,esp; sub esp,0x14; push esi;
 * push edi; mov edi,[ebp+8]` — v62-shaped); L = edi = [ebp+8] (v65's
 * esi is NOT this body); obj1 in the [ebp-4] SPILL SLOT; lua_type(L,1)
 * FULL-WORD gate @0x8b9a97 -> push 0 (flags) + KEY 0xc82a19 + edx=1 +
 * call 0x85c590; obj=[eax+4]. touserdata upvalueindex(1) @0x8b9ac2 ->
 * esi (register-held, NO add esp,8 — v56/v57/v59); arg2 = num4
 * checknumber idx 4 -> fstp dword [ebp-0x10]; arg1 = num3 checknumber
 * idx 3 -> fstp dword [ebp-8]; arg0 = int2 checkinteger idx 2 -> eax;
 * EIGHT dwords, ONE fused add esp,0x18 cleans SIX; f32 lanes land via
 * movss [esp+4]/[esp] (dead 0xfff0b9d7 + dead edi-L slots); this =
 * obj1 = [ebp-4] -> ECX @0x8b9af9; push eax = int2 FULL WORD; real_fn
 * = [esi] (ud[0], FN_OFF 0) AFTER all pushes; final stack [esp+0]=int2,
 * [esp+4]=B(num3 f32), [esp+8]=A(num4 f32), [esp+0xc]=junk; real_fn
 * 0x7e2080 ret 0xc. xor eax,eax -> ret 0 (NO byte gate). All
 * gates/words uint32_t.
 * ---------------------------------------------------------------------- */
export const LUA_V66_VA = 0x008b9a80;
export const LUA_V66_RET_VA = 0x008b9b18;
export const LUA_V66_BODY_BYTES = 0x0098;
export const LUA_V66_INSNS = 54; /* capstone TRUE body, ret incl. */
export const LUA_V66_CHECK_FLAGS = 0;
export const LUA_V66_CHECK_EDX = 1;
export const LUA_V66_TYPE_INDEX = 0x01;
export const LUA_V66_OBJECT_FIELD_OFF = 0x04;
export const LUA_V66_KEY = 0x00c82a19; /* MusicManager class key */
export const LUA_V66_TOUSERDATA_INDEX_U32 = 0xfff0b9d7;
export const LUA_V66_FN_OFF = 0x00;
export const LUA_V66_ARG0_CHECKINTEGER_INDEX_U32 = 0x02;
export const LUA_V66_ARG1_CHECKNUMBER_INDEX_U32 = 0x03;
export const LUA_V66_ARG2_CHECKNUMBER_INDEX_U32 = 0x04;
export const LUA_V66_IAT_LUA_TYPE = 0x00b18400;
export const LUA_V66_IAT_LUA_TOUSERDATA = 0x00b183b0;
export const LUA_V66_IAT_LUA_CHECKINTEGER = 0x00b183f4;
export const LUA_V66_IAT_LUA_CHECKNUMBER = 0x00b18324;
export const LUA_V66_RETURN_VALUE = 0;
export const LUA_V66_INSTALL_COUNT = 1; /* lit=1: ONE name/real_fn pair */

export const LUA_V66_INSTALL_VA = 0x008957d0;
export const LUA_V66_INSTALL_RET_VA = 0x00895826;
export const LUA_V66_INSTALL_LITERAL_VA = 0x008957e3;
export const LUA_V66_INSTALL_REAL_FN_VA = 0x007e2080;
export const LUA_V66_INSTALL_NAME_VA = 0x00b74b30; /* "Fadein" */
export const LUA_V66_INSTALL_CALLER_VA = 0x0086db91;

export function luaEngineV66ObjectResolve(typeResult, checkField) {
  /* FULL-WORD lua_type(L,1) gate (`test eax,eax` @0x8b9a97): nil -> 0,
     else check_field. Never byte-masked (0x100 -> checkField). */
  return typeResult !== 0 ? checkField : 0;
}
export function luaEngineV66IntWord(checkintResult) {
  /* checkinteger FULL WORD passthrough (`push eax` @0x8b9b0c): 0x100 /
     0x10000 / 0xffffffff all survive. Never masked. */
  return checkintResult >>> 0;
}
export function luaEngineV66Va() { return LUA_V66_VA >>> 0; }
export function luaEngineV66RetVa() { return LUA_V66_RET_VA >>> 0; }
export function luaEngineV66BodyBytes() { return LUA_V66_BODY_BYTES >>> 0; }
export function luaEngineV66InsnCount() { return LUA_V66_INSNS | 0; }
export function luaEngineV66CheckFlags() { return LUA_V66_CHECK_FLAGS | 0; }
export function luaEngineV66CheckEdx() { return LUA_V66_CHECK_EDX | 0; }
export function luaEngineV66Key() { return LUA_V66_KEY >>> 0; }
export function luaEngineV66ObjectFieldOff() { return LUA_V66_OBJECT_FIELD_OFF >>> 0; }
export function luaEngineV66TypeIndex() { return LUA_V66_TYPE_INDEX >>> 0; }
export function luaEngineV66TouserdataIndex() { return LUA_V66_TOUSERDATA_INDEX_U32 >>> 0; }
export function luaEngineV66FnOff() { return LUA_V66_FN_OFF >>> 0; }
export function luaEngineV66Arg0CheckintegerIndex() { return LUA_V66_ARG0_CHECKINTEGER_INDEX_U32 >>> 0; }
export function luaEngineV66Arg1ChecknumberIndex() { return LUA_V66_ARG1_CHECKNUMBER_INDEX_U32 >>> 0; }
export function luaEngineV66Arg2ChecknumberIndex() { return LUA_V66_ARG2_CHECKNUMBER_INDEX_U32 >>> 0; }
export function luaEngineV66IatLuaType() { return LUA_V66_IAT_LUA_TYPE >>> 0; }
export function luaEngineV66IatLuaTouserdata() { return LUA_V66_IAT_LUA_TOUSERDATA >>> 0; }
export function luaEngineV66IatLuaCheckinteger() { return LUA_V66_IAT_LUA_CHECKINTEGER >>> 0; }
export function luaEngineV66IatLuaChecknumber() { return LUA_V66_IAT_LUA_CHECKNUMBER >>> 0; }
export function luaEngineV66ReturnValue() { return LUA_V66_RETURN_VALUE | 0; }
export function luaEngineV66InstallCount() { return LUA_V66_INSTALL_COUNT | 0; }
export function luaEngineV66InstallVa() { return LUA_V66_INSTALL_VA >>> 0; }
export function luaEngineV66InstallRetVa() { return LUA_V66_INSTALL_RET_VA >>> 0; }
export function luaEngineV66InstallLiteralVa() { return LUA_V66_INSTALL_LITERAL_VA >>> 0; }
export function luaEngineV66InstallRealFnVa() { return LUA_V66_INSTALL_REAL_FN_VA >>> 0; }
export function luaEngineV66InstallNameVa() { return LUA_V66_INSTALL_NAME_VA >>> 0; }
export function luaEngineV66InstallCallerVa() { return LUA_V66_INSTALL_CALLER_VA >>> 0; }
/* ---- ABI v67: EIGHT MusicManager wrappers 0x8b9b20..0x8b9e80 (key
 * 0xc82a19), landed together under ABI 67 (v63 precedent). See the
 * lua-v67-8b9b20 notes + header ABI v67 block for PE-truth. Shared
 * law: FULL-WORD lua_type(L,1) gate + 0x85c590 (CHKFLAGS/KEY/edx=1) +
 * touserdata 0xfff0b9d7 + this=obj1 + real_fn = ud[0] (FN_OFF 0).
 * All gates/words uint32_t. Install sites: ret-8 helpers (recorded
 * as sites, NOT table rows), primary pair pinned per wrapper.
 * ------------------------------------------------------------------ */
export const LUA_V67_QUEUE_VA = 0x008b9b20; /* "Queue" */
export const LUA_V67_QUEUE_RET_VA = 0x008b9b8b;
export const LUA_V67_QUEUE_INSNS = 41; /* capstone TRUE body, ret incl. */
export const LUA_V67_QUEUE_CHECK_FLAGS = 0;
export const LUA_V67_QUEUE_CHECK_EDX = 1;
export const LUA_V67_QUEUE_TYPE_INDEX = 0x01;
export const LUA_V67_QUEUE_OBJECT_FIELD_OFF = 0x04;
export const LUA_V67_QUEUE_KEY = 0x00c82a19; /* MusicManager class key */
export const LUA_V67_QUEUE_TOUSERDATA_INDEX_U32 = 0xfff0b9d7;
export const LUA_V67_QUEUE_FN_OFF = 0x00;
export const LUA_V67_QUEUE_ARG0_CHECKINTEGER_INDEX_U32 = 0x02;
export const LUA_V67_QUEUE_IAT_LUA_TYPE = 0x00b18400;
export const LUA_V67_QUEUE_IAT_LUA_TOUSERDATA = 0x00b183b0;
export const LUA_V67_QUEUE_IAT_LUA_CHECKINTEGER = 0x00b183f4;
export const LUA_V67_QUEUE_RETURN_VALUE = 0;
export const LUA_V67_QUEUE_INSTALL_COUNT = 1; /* lit=1: ONE primary pair */
export const LUA_V67_QUEUE_INSTALL_VA = 0x00895830;
export const LUA_V67_QUEUE_INSTALL_RET_VA = 0x00895887;
export const LUA_V67_QUEUE_INSTALL_LITERAL_VA = 0x00895849;
export const LUA_V67_QUEUE_INSTALL_REAL_FN_VA = 0x007e2480; /* Music::Queue, HOST */
export const LUA_V67_QUEUE_INSTALL_NAME_VA = 0x00b74c5c; /* "Queue" */
export const LUA_V67_QUEUE_INSTALL_CALLER_VA = 0x0086dbb3;

export const LUA_V67_FADEOUT_VA = 0x008b9b90; /* "Fadeout" */
export const LUA_V67_FADEOUT_RET_VA = 0x008b9c11;
export const LUA_V67_FADEOUT_INSNS = 45;
export const LUA_V67_FADEOUT_CHECK_FLAGS = 0;
export const LUA_V67_FADEOUT_CHECK_EDX = 1;
export const LUA_V67_FADEOUT_TYPE_INDEX = 0x01;
export const LUA_V67_FADEOUT_OBJECT_FIELD_OFF = 0x04;
export const LUA_V67_FADEOUT_KEY = 0x00c82a19;
export const LUA_V67_FADEOUT_TOUSERDATA_INDEX_U32 = 0xfff0b9d7;
export const LUA_V67_FADEOUT_FN_OFF = 0x00;
export const LUA_V67_FADEOUT_ARG1_CHECKNUMBER_INDEX_U32 = 0x02;
export const LUA_V67_FADEOUT_IAT_LUA_TYPE = 0x00b18400;
export const LUA_V67_FADEOUT_IAT_LUA_TOUSERDATA = 0x00b183b0;
export const LUA_V67_FADEOUT_IAT_LUA_CHECKNUMBER = 0x00b18324;
export const LUA_V67_FADEOUT_RETURN_VALUE = 0;
export const LUA_V67_FADEOUT_INSTALL_COUNT = 1;
export const LUA_V67_FADEOUT_INSTALL_VA = 0x00895890;
export const LUA_V67_FADEOUT_INSTALL_RET_VA = 0x008958e7;
export const LUA_V67_FADEOUT_INSTALL_LITERAL_VA = 0x008958a9;
export const LUA_V67_FADEOUT_INSTALL_REAL_FN_VA = 0x007e2100; /* Music::Fadeout, HOST */
export const LUA_V67_FADEOUT_INSTALL_NAME_VA = 0x00b74b38; /* "Fadeout" (string shared with v56 vec-band, site differs) */
export const LUA_V67_FADEOUT_INSTALL_CALLER_VA = 0x0086dbc4;

export const LUA_V67_PAUSE_VA = 0x008b9c20; /* "Pause" — six class-reg sites, generic body */
export const LUA_V67_PAUSE_RET_VA = 0x008b9c6f;
export const LUA_V67_PAUSE_INSNS = 32;
export const LUA_V67_PAUSE_CHECK_FLAGS = 0;
export const LUA_V67_PAUSE_CHECK_EDX = 1;
export const LUA_V67_PAUSE_TYPE_INDEX = 0x01;
export const LUA_V67_PAUSE_OBJECT_FIELD_OFF = 0x04;
export const LUA_V67_PAUSE_KEY = 0x00c82a19;
export const LUA_V67_PAUSE_TOUSERDATA_INDEX_U32 = 0xfff0b9d7;
export const LUA_V67_PAUSE_FN_OFF = 0x00;
export const LUA_V67_PAUSE_IAT_LUA_TYPE = 0x00b18400;
export const LUA_V67_PAUSE_IAT_LUA_TOUSERDATA = 0x00b183b0;
export const LUA_V67_PAUSE_RETURN_VALUE = 0;
export const LUA_V67_PAUSE_INSTALL_COUNT = 1;
export const LUA_V67_PAUSE_INSTALL_VA = 0x008958f0;
export const LUA_V67_PAUSE_INSTALL_RET_VA = 0x00895947;
export const LUA_V67_PAUSE_INSTALL_LITERAL_VA = 0x00895909;
export const LUA_V67_PAUSE_INSTALL_REAL_FN_VA = 0x007e2140; /* Music::Pause, HOST */
export const LUA_V67_PAUSE_INSTALL_NAME_VA = 0x00b6b02c; /* "Pause" */
export const LUA_V67_PAUSE_INSTALL_CALLER_VA = 0x0086dbd5;

export const LUA_V67_ENABLELAYER_VA = 0x008b9c70; /* "EnableLayer" */
export const LUA_V67_ENABLELAYER_RET_VA = 0x008b9cef;
export const LUA_V67_ENABLELAYER_INSNS = 47;
export const LUA_V67_ENABLELAYER_CHECK_FLAGS = 0;
export const LUA_V67_ENABLELAYER_CHECK_EDX = 1;
export const LUA_V67_ENABLELAYER_TYPE_INDEX = 0x01;
export const LUA_V67_ENABLELAYER_OBJECT_FIELD_OFF = 0x04;
export const LUA_V67_ENABLELAYER_KEY = 0x00c82a19;
export const LUA_V67_ENABLELAYER_TOUSERDATA_INDEX_U32 = 0xfff0b9d7;
export const LUA_V67_ENABLELAYER_FN_OFF = 0x00;
export const LUA_V67_ENABLELAYER_ARG0_CHECKINTEGER_INDEX_U32 = 0x02;
export const LUA_V67_ENABLELAYER_ARG1_TOBOOLEAN_INDEX_U32 = 0x03;
export const LUA_V67_ENABLELAYER_IAT_LUA_TYPE = 0x00b18400;
export const LUA_V67_ENABLELAYER_IAT_LUA_TOUSERDATA = 0x00b183b0;
export const LUA_V67_ENABLELAYER_IAT_LUA_TOBOOLEAN = 0x00b183e8; /* v22 BY REFERENCE */
export const LUA_V67_ENABLELAYER_IAT_LUA_CHECKINTEGER = 0x00b183f4;
export const LUA_V67_ENABLELAYER_RETURN_VALUE = 0;
export const LUA_V67_ENABLELAYER_INSTALL_COUNT = 1;
export const LUA_V67_ENABLELAYER_INSTALL_VA = 0x00895950;
export const LUA_V67_ENABLELAYER_INSTALL_RET_VA = 0x008959a6;
export const LUA_V67_ENABLELAYER_INSTALL_LITERAL_VA = 0x00895963;
export const LUA_V67_ENABLELAYER_INSTALL_REAL_FN_VA = 0x007e2280; /* Music::EnableLayer, HOST */
export const LUA_V67_ENABLELAYER_INSTALL_NAME_VA = 0x00b74c44; /* "EnableLayer" */
export const LUA_V67_ENABLELAYER_INSTALL_CALLER_VA = 0x0086dbf7;

export const LUA_V67_ISLAYERENABLED_VA = 0x008b9cf0; /* "IsLayerEnabled" */
export const LUA_V67_ISLAYERENABLED_RET_VA = 0x008b9d70;
export const LUA_V67_ISLAYERENABLED_INSNS = 48;
export const LUA_V67_ISLAYERENABLED_CHECK_FLAGS = 1;
export const LUA_V67_ISLAYERENABLED_CHECK_EDX = 1;
export const LUA_V67_ISLAYERENABLED_TYPE_INDEX = 0x01;
export const LUA_V67_ISLAYERENABLED_OBJECT_FIELD_OFF = 0x04;
export const LUA_V67_ISLAYERENABLED_KEY = 0x00c82a19;
export const LUA_V67_ISLAYERENABLED_TOUSERDATA_INDEX_U32 = 0xfff0b9d7;
export const LUA_V67_ISLAYERENABLED_FN_OFF = 0x00;
export const LUA_V67_ISLAYERENABLED_ARG0_CHECKINTEGER_INDEX_U32 = 0x02;
export const LUA_V67_ISLAYERENABLED_IAT_LUA_TYPE = 0x00b18400;
export const LUA_V67_ISLAYERENABLED_IAT_LUA_TOUSERDATA = 0x00b183b0;
export const LUA_V67_ISLAYERENABLED_IAT_LUA_CHECKINTEGER = 0x00b183f4;
export const LUA_V67_ISLAYERENABLED_IAT_LUA_PUSHBOOLEAN = 0x00b183ec; /* v22 BY REFERENCE */
export const LUA_V67_ISLAYERENABLED_RETURN_VALUE = 1;
export const LUA_V67_ISLAYERENABLED_INSTALL_COUNT = 1;
export const LUA_V67_ISLAYERENABLED_INSTALL_VA = 0x008959b0;
export const LUA_V67_ISLAYERENABLED_INSTALL_RET_VA = 0x00895a50;
export const LUA_V67_ISLAYERENABLED_INSTALL_LITERAL_VA = 0x008959ce;
export const LUA_V67_ISLAYERENABLED_INSTALL_REAL_FN_VA = 0x007e2440; /* Music::IsLayerEnabled, HOST */
export const LUA_V67_ISLAYERENABLED_INSTALL_NAME_VA = 0x00b74c2c; /* "IsLayerEnabled" */
export const LUA_V67_ISLAYERENABLED_INSTALL_CALLER_VA = 0x0086dc19;

export const LUA_V67_ISENABLED_VA = 0x008b9d80; /* "IsEnabled" */
export const LUA_V67_ISENABLED_RET_VA = 0x008b9de4;
export const LUA_V67_ISENABLED_INSNS = 39;
export const LUA_V67_ISENABLED_CHECK_FLAGS = 1;
export const LUA_V67_ISENABLED_CHECK_EDX = 1;
export const LUA_V67_ISENABLED_TYPE_INDEX = 0x01;
export const LUA_V67_ISENABLED_OBJECT_FIELD_OFF = 0x04;
export const LUA_V67_ISENABLED_KEY = 0x00c82a19;
export const LUA_V67_ISENABLED_TOUSERDATA_INDEX_U32 = 0xfff0b9d7;
export const LUA_V67_ISENABLED_FN_OFF = 0x00;
export const LUA_V67_ISENABLED_IAT_LUA_TYPE = 0x00b18400;
export const LUA_V67_ISENABLED_IAT_LUA_TOUSERDATA = 0x00b183b0;
export const LUA_V67_ISENABLED_IAT_LUA_PUSHBOOLEAN = 0x00b183ec; /* v22 BY REFERENCE */
export const LUA_V67_ISENABLED_RETURN_VALUE = 1;
export const LUA_V67_ISENABLED_INSTALL_COUNT = 1;
export const LUA_V67_ISENABLED_INSTALL_VA = 0x00895a60;
export const LUA_V67_ISENABLED_INSTALL_RET_VA = 0x00895b00;
export const LUA_V67_ISENABLED_INSTALL_LITERAL_VA = 0x00895a7e;
export const LUA_V67_ISENABLED_INSTALL_REAL_FN_VA = 0x0085e430; /* IsEnabled .text closure, HOST */
export const LUA_V67_ISENABLED_INSTALL_NAME_VA = 0x00b74cc8; /* "IsEnabled" */
export const LUA_V67_ISENABLED_INSTALL_CALLER_VA = 0x0086dc4c;

export const LUA_V67_VOLUMESLIDE_VA = 0x008b9df0; /* "VolumeSlide" */
export const LUA_V67_VOLUMESLIDE_RET_VA = 0x008b9e7e;
export const LUA_V67_VOLUMESLIDE_INSNS = 50;
export const LUA_V67_VOLUMESLIDE_CHECK_FLAGS = 0;
export const LUA_V67_VOLUMESLIDE_CHECK_EDX = 1;
export const LUA_V67_VOLUMESLIDE_TYPE_INDEX = 0x01;
export const LUA_V67_VOLUMESLIDE_OBJECT_FIELD_OFF = 0x04;
export const LUA_V67_VOLUMESLIDE_KEY = 0x00c82a19;
export const LUA_V67_VOLUMESLIDE_TOUSERDATA_INDEX_U32 = 0xfff0b9d7;
export const LUA_V67_VOLUMESLIDE_FN_OFF = 0x00;
export const LUA_V67_VOLUMESLIDE_ARG1_CHECKNUMBER_INDEX_U32 = 0x02;
export const LUA_V67_VOLUMESLIDE_ARG2_CHECKNUMBER_INDEX_U32 = 0x03;
export const LUA_V67_VOLUMESLIDE_IAT_LUA_TYPE = 0x00b18400;
export const LUA_V67_VOLUMESLIDE_IAT_LUA_TOUSERDATA = 0x00b183b0;
export const LUA_V67_VOLUMESLIDE_IAT_LUA_CHECKNUMBER = 0x00b18324;
export const LUA_V67_VOLUMESLIDE_RETURN_VALUE = 0;
export const LUA_V67_VOLUMESLIDE_INSTALL_COUNT = 1;
export const LUA_V67_VOLUMESLIDE_INSTALL_VA = 0x00895b10;
export const LUA_V67_VOLUMESLIDE_INSTALL_RET_VA = 0x00895b66;
export const LUA_V67_VOLUMESLIDE_INSTALL_LITERAL_VA = 0x00895b23;
export const LUA_V67_VOLUMESLIDE_INSTALL_REAL_FN_VA = 0x007e2510; /* Music::VolumeSlide, HOST */
export const LUA_V67_VOLUMESLIDE_INSTALL_NAME_VA = 0x00b74cbc; /* "VolumeSlide" */
export const LUA_V67_VOLUMESLIDE_INSTALL_CALLER_VA = 0x0086dc7f;

export const LUA_V67_GETCURRENTMUSICID_VA = 0x008b9e80; /* "GetCurrentMusicID" */
export const LUA_V67_GETCURRENTMUSICID_RET_VA = 0x008b9edb;
export const LUA_V67_GETCURRENTMUSICID_INSNS = 35;
export const LUA_V67_GETCURRENTMUSICID_CHECK_FLAGS = 1;
export const LUA_V67_GETCURRENTMUSICID_CHECK_EDX = 1;
export const LUA_V67_GETCURRENTMUSICID_TYPE_INDEX = 0x01;
export const LUA_V67_GETCURRENTMUSICID_OBJECT_FIELD_OFF = 0x04;
export const LUA_V67_GETCURRENTMUSICID_KEY = 0x00c82a19;
export const LUA_V67_GETCURRENTMUSICID_TOUSERDATA_INDEX_U32 = 0xfff0b9d7;
export const LUA_V67_GETCURRENTMUSICID_FN_OFF = 0x00;
export const LUA_V67_GETCURRENTMUSICID_SEXT_PUSH_VA = 0x0085bfd0; /* v55 pusher ROW 3 — its laws stay the v55 row */
export const LUA_V67_GETCURRENTMUSICID_IAT_LUA_TYPE = 0x00b18400;
export const LUA_V67_GETCURRENTMUSICID_IAT_LUA_TOUSERDATA = 0x00b183b0;
export const LUA_V67_GETCURRENTMUSICID_RETURN_VALUE = 1;
export const LUA_V67_GETCURRENTMUSICID_INSTALL_COUNT = 1;
export const LUA_V67_GETCURRENTMUSICID_INSTALL_VA = 0x00895b70;
export const LUA_V67_GETCURRENTMUSICID_INSTALL_RET_VA = 0x00895c0b;
export const LUA_V67_GETCURRENTMUSICID_INSTALL_LITERAL_VA = 0x00895b91;
export const LUA_V67_GETCURRENTMUSICID_INSTALL_REAL_FN_VA = 0x007e1780; /* Music::GetCurrentMusicID, HOST */
export const LUA_V67_GETCURRENTMUSICID_INSTALL_NAME_VA = 0x00b74c9c; /* "GetCurrentMusicID" */
export const LUA_V67_GETCURRENTMUSICID_INSTALL_CALLER_VA = 0x0086dca1;


export function luaEngineV67QueueObjectResolve(typeResult, checkField) {
  /* FULL-WORD lua_type(L,1) gate (`test eax,eax` @0x8b9b3a): nil -> 0,
     else check_field. Never byte-masked. */
  return typeResult !== 0 ? checkField : 0;
}
export function luaEngineV67QueueIntWord(checkintResult) {
  /* PE `push eax` @0x8b9b7f — checkinteger FULL WORD passthrough. */
  return checkintResult >>> 0;
}
export function luaEngineV67QueueVa() { return LUA_V67_QUEUE_VA >>> 0; }
export function luaEngineV67QueueRetVa() { return LUA_V67_QUEUE_RET_VA >>> 0; }
export function luaEngineV67QueueBodyBytes() { return LUA_V67_QUEUE_RET_VA - LUA_V67_QUEUE_VA; }
export function luaEngineV67QueueInsnCount() { return LUA_V67_QUEUE_INSNS | 0; }
export function luaEngineV67QueueCheckFlags() { return LUA_V67_QUEUE_CHECK_FLAGS | 0; }
export function luaEngineV67QueueCheckEdx() { return LUA_V67_QUEUE_CHECK_EDX | 0; }
export function luaEngineV67QueueKey() { return LUA_V67_QUEUE_KEY >>> 0; }
export function luaEngineV67QueueObjectFieldOff() { return LUA_V67_QUEUE_OBJECT_FIELD_OFF >>> 0; }
export function luaEngineV67QueueTypeIndex() { return LUA_V67_QUEUE_TYPE_INDEX >>> 0; }
export function luaEngineV67QueueTouserdataIndex() { return LUA_V67_QUEUE_TOUSERDATA_INDEX_U32 >>> 0; }
export function luaEngineV67QueueFnOff() { return LUA_V67_QUEUE_FN_OFF >>> 0; }
export function luaEngineV67QueueArg0CheckintegerIndex() { return LUA_V67_QUEUE_ARG0_CHECKINTEGER_INDEX_U32 >>> 0; }
export function luaEngineV67QueueIatLuaType() { return LUA_V67_QUEUE_IAT_LUA_TYPE >>> 0; }
export function luaEngineV67QueueIatLuaTouserdata() { return LUA_V67_QUEUE_IAT_LUA_TOUSERDATA >>> 0; }
export function luaEngineV67QueueIatLuaCheckinteger() { return LUA_V67_QUEUE_IAT_LUA_CHECKINTEGER >>> 0; }
export function luaEngineV67QueueReturnValue() { return LUA_V67_QUEUE_RETURN_VALUE | 0; }
export function luaEngineV67QueueInstallCount() { return LUA_V67_QUEUE_INSTALL_COUNT | 0; }
export function luaEngineV67QueueInstallVa() { return LUA_V67_QUEUE_INSTALL_VA >>> 0; }
export function luaEngineV67QueueInstallRetVa() { return LUA_V67_QUEUE_INSTALL_RET_VA >>> 0; }
export function luaEngineV67QueueInstallLiteralVa() { return LUA_V67_QUEUE_INSTALL_LITERAL_VA >>> 0; }
export function luaEngineV67QueueInstallRealFnVa() { return LUA_V67_QUEUE_INSTALL_REAL_FN_VA >>> 0; }
export function luaEngineV67QueueInstallNameVa() { return LUA_V67_QUEUE_INSTALL_NAME_VA >>> 0; }
export function luaEngineV67QueueInstallCallerVa() { return LUA_V67_QUEUE_INSTALL_CALLER_VA >>> 0; }

export function luaEngineV67FadeoutObjectResolve(typeResult, checkField) {
  /* FULL-WORD gate (`test eax,eax` @0x8b9baa). */
  return typeResult !== 0 ? checkField : 0;
}
export function luaEngineV67FadeoutVa() { return LUA_V67_FADEOUT_VA >>> 0; }
export function luaEngineV67FadeoutRetVa() { return LUA_V67_FADEOUT_RET_VA >>> 0; }
export function luaEngineV67FadeoutBodyBytes() { return LUA_V67_FADEOUT_RET_VA - LUA_V67_FADEOUT_VA; }
export function luaEngineV67FadeoutInsnCount() { return LUA_V67_FADEOUT_INSNS | 0; }
export function luaEngineV67FadeoutCheckFlags() { return LUA_V67_FADEOUT_CHECK_FLAGS | 0; }
export function luaEngineV67FadeoutCheckEdx() { return LUA_V67_FADEOUT_CHECK_EDX | 0; }
export function luaEngineV67FadeoutKey() { return LUA_V67_FADEOUT_KEY >>> 0; }
export function luaEngineV67FadeoutObjectFieldOff() { return LUA_V67_FADEOUT_OBJECT_FIELD_OFF >>> 0; }
export function luaEngineV67FadeoutTypeIndex() { return LUA_V67_FADEOUT_TYPE_INDEX >>> 0; }
export function luaEngineV67FadeoutTouserdataIndex() { return LUA_V67_FADEOUT_TOUSERDATA_INDEX_U32 >>> 0; }
export function luaEngineV67FadeoutFnOff() { return LUA_V67_FADEOUT_FN_OFF >>> 0; }
export function luaEngineV67FadeoutArg1ChecknumberIndex() { return LUA_V67_FADEOUT_ARG1_CHECKNUMBER_INDEX_U32 >>> 0; }
export function luaEngineV67FadeoutIatLuaType() { return LUA_V67_FADEOUT_IAT_LUA_TYPE >>> 0; }
export function luaEngineV67FadeoutIatLuaTouserdata() { return LUA_V67_FADEOUT_IAT_LUA_TOUSERDATA >>> 0; }
export function luaEngineV67FadeoutIatLuaChecknumber() { return LUA_V67_FADEOUT_IAT_LUA_CHECKNUMBER >>> 0; }
export function luaEngineV67FadeoutReturnValue() { return LUA_V67_FADEOUT_RETURN_VALUE | 0; }
export function luaEngineV67FadeoutInstallCount() { return LUA_V67_FADEOUT_INSTALL_COUNT | 0; }
export function luaEngineV67FadeoutInstallVa() { return LUA_V67_FADEOUT_INSTALL_VA >>> 0; }
export function luaEngineV67FadeoutInstallRetVa() { return LUA_V67_FADEOUT_INSTALL_RET_VA >>> 0; }
export function luaEngineV67FadeoutInstallLiteralVa() { return LUA_V67_FADEOUT_INSTALL_LITERAL_VA >>> 0; }
export function luaEngineV67FadeoutInstallRealFnVa() { return LUA_V67_FADEOUT_INSTALL_REAL_FN_VA >>> 0; }
export function luaEngineV67FadeoutInstallNameVa() { return LUA_V67_FADEOUT_INSTALL_NAME_VA >>> 0; }
export function luaEngineV67FadeoutInstallCallerVa() { return LUA_V67_FADEOUT_INSTALL_CALLER_VA >>> 0; }

export function luaEngineV67PauseObjectResolve(typeResult, checkField) {
  /* FULL-WORD gate (`test eax,eax` @0x8b9c34). */
  return typeResult !== 0 ? checkField : 0;
}
export function luaEngineV67PauseVa() { return LUA_V67_PAUSE_VA >>> 0; }
export function luaEngineV67PauseRetVa() { return LUA_V67_PAUSE_RET_VA >>> 0; }
export function luaEngineV67PauseBodyBytes() { return LUA_V67_PAUSE_RET_VA - LUA_V67_PAUSE_VA; }
export function luaEngineV67PauseInsnCount() { return LUA_V67_PAUSE_INSNS | 0; }
export function luaEngineV67PauseCheckFlags() { return LUA_V67_PAUSE_CHECK_FLAGS | 0; }
export function luaEngineV67PauseCheckEdx() { return LUA_V67_PAUSE_CHECK_EDX | 0; }
export function luaEngineV67PauseKey() { return LUA_V67_PAUSE_KEY >>> 0; }
export function luaEngineV67PauseObjectFieldOff() { return LUA_V67_PAUSE_OBJECT_FIELD_OFF >>> 0; }
export function luaEngineV67PauseTypeIndex() { return LUA_V67_PAUSE_TYPE_INDEX >>> 0; }
export function luaEngineV67PauseTouserdataIndex() { return LUA_V67_PAUSE_TOUSERDATA_INDEX_U32 >>> 0; }
export function luaEngineV67PauseFnOff() { return LUA_V67_PAUSE_FN_OFF >>> 0; }
export function luaEngineV67PauseIatLuaType() { return LUA_V67_PAUSE_IAT_LUA_TYPE >>> 0; }
export function luaEngineV67PauseIatLuaTouserdata() { return LUA_V67_PAUSE_IAT_LUA_TOUSERDATA >>> 0; }
export function luaEngineV67PauseReturnValue() { return LUA_V67_PAUSE_RETURN_VALUE | 0; }
export function luaEngineV67PauseInstallCount() { return LUA_V67_PAUSE_INSTALL_COUNT | 0; }
export function luaEngineV67PauseInstallVa() { return LUA_V67_PAUSE_INSTALL_VA >>> 0; }
export function luaEngineV67PauseInstallRetVa() { return LUA_V67_PAUSE_INSTALL_RET_VA >>> 0; }
export function luaEngineV67PauseInstallLiteralVa() { return LUA_V67_PAUSE_INSTALL_LITERAL_VA >>> 0; }
export function luaEngineV67PauseInstallRealFnVa() { return LUA_V67_PAUSE_INSTALL_REAL_FN_VA >>> 0; }
export function luaEngineV67PauseInstallNameVa() { return LUA_V67_PAUSE_INSTALL_NAME_VA >>> 0; }
export function luaEngineV67PauseInstallCallerVa() { return LUA_V67_PAUSE_INSTALL_CALLER_VA >>> 0; }

export function luaEngineV67EnableLayerObjectResolve(typeResult, checkField) {
  /* FULL-WORD gate (`test eax,eax` @0x8b9c8a). */
  return typeResult !== 0 ? checkField : 0;
}
export function luaEngineV67EnableLayerIntWord(checkintResult) {
  /* PE `push eax` @0x8b9ce3 — checkinteger FULL WORD passthrough. */
  return checkintResult >>> 0;
}
export function luaEngineV67EnableLayerBoolWord(tobooleanResult) {
  /* PE `test eax,eax; setne byte ptr [esp+0x24]` @0x8b9cc8/@0x8b9ccd —
     FULL-WORD test of lua_toboolean(L,3) (v22 boolean-normalize BY
     REFERENCE); the 0/1 low byte lands in the slot later pushed as a
     full dword arg. uint32 in/out — 0x100/0xffffffff -> 1. */
  return tobooleanResult !== 0 ? 1 : 0;
}
export function luaEngineV67EnableLayerVa() { return LUA_V67_ENABLELAYER_VA >>> 0; }
export function luaEngineV67EnableLayerRetVa() { return LUA_V67_ENABLELAYER_RET_VA >>> 0; }
export function luaEngineV67EnableLayerBodyBytes() { return LUA_V67_ENABLELAYER_RET_VA - LUA_V67_ENABLELAYER_VA; }
export function luaEngineV67EnableLayerInsnCount() { return LUA_V67_ENABLELAYER_INSNS | 0; }
export function luaEngineV67EnableLayerCheckFlags() { return LUA_V67_ENABLELAYER_CHECK_FLAGS | 0; }
export function luaEngineV67EnableLayerCheckEdx() { return LUA_V67_ENABLELAYER_CHECK_EDX | 0; }
export function luaEngineV67EnableLayerKey() { return LUA_V67_ENABLELAYER_KEY >>> 0; }
export function luaEngineV67EnableLayerObjectFieldOff() { return LUA_V67_ENABLELAYER_OBJECT_FIELD_OFF >>> 0; }
export function luaEngineV67EnableLayerTypeIndex() { return LUA_V67_ENABLELAYER_TYPE_INDEX >>> 0; }
export function luaEngineV67EnableLayerTouserdataIndex() { return LUA_V67_ENABLELAYER_TOUSERDATA_INDEX_U32 >>> 0; }
export function luaEngineV67EnableLayerFnOff() { return LUA_V67_ENABLELAYER_FN_OFF >>> 0; }
export function luaEngineV67EnableLayerArg0CheckintegerIndex() { return LUA_V67_ENABLELAYER_ARG0_CHECKINTEGER_INDEX_U32 >>> 0; }
export function luaEngineV67EnableLayerArg1TobooleanIndex() { return LUA_V67_ENABLELAYER_ARG1_TOBOOLEAN_INDEX_U32 >>> 0; }
export function luaEngineV67EnableLayerIatLuaType() { return LUA_V67_ENABLELAYER_IAT_LUA_TYPE >>> 0; }
export function luaEngineV67EnableLayerIatLuaTouserdata() { return LUA_V67_ENABLELAYER_IAT_LUA_TOUSERDATA >>> 0; }
export function luaEngineV67EnableLayerIatLuaToboolean() { return LUA_V67_ENABLELAYER_IAT_LUA_TOBOOLEAN >>> 0; }
export function luaEngineV67EnableLayerIatLuaCheckinteger() { return LUA_V67_ENABLELAYER_IAT_LUA_CHECKINTEGER >>> 0; }
export function luaEngineV67EnableLayerReturnValue() { return LUA_V67_ENABLELAYER_RETURN_VALUE | 0; }
export function luaEngineV67EnableLayerInstallCount() { return LUA_V67_ENABLELAYER_INSTALL_COUNT | 0; }
export function luaEngineV67EnableLayerInstallVa() { return LUA_V67_ENABLELAYER_INSTALL_VA >>> 0; }
export function luaEngineV67EnableLayerInstallRetVa() { return LUA_V67_ENABLELAYER_INSTALL_RET_VA >>> 0; }
export function luaEngineV67EnableLayerInstallLiteralVa() { return LUA_V67_ENABLELAYER_INSTALL_LITERAL_VA >>> 0; }
export function luaEngineV67EnableLayerInstallRealFnVa() { return LUA_V67_ENABLELAYER_INSTALL_REAL_FN_VA >>> 0; }
export function luaEngineV67EnableLayerInstallNameVa() { return LUA_V67_ENABLELAYER_INSTALL_NAME_VA >>> 0; }
export function luaEngineV67EnableLayerInstallCallerVa() { return LUA_V67_ENABLELAYER_INSTALL_CALLER_VA >>> 0; }

export function luaEngineV67IsLayerEnabledObjectResolve(typeResult, checkField) {
  /* FULL-WORD gate (`test eax,eax` @0x8b9d0a). */
  return typeResult !== 0 ? checkField : 0;
}
export function luaEngineV67IsLayerEnabledIntWord(checkintResult) {
  /* PE `push eax` @0x8b9d51 — checkinteger FULL WORD passthrough. */
  return checkintResult >>> 0;
}
export function luaEngineV67IsLayerEnabledReturnGate(realFnResult) {
  /* PE `test al,al; setne cl` @0x8b9d56/@0x8b9d58 — BYTE gate on the
     real_fn's AL return (v61 pushboolean body law shape) -> the
     lua_pushboolean arg. uint32 in/out, & 0xff. */
  return (realFnResult & 0xff) !== 0 ? 1 : 0;
}
export function luaEngineV67IsLayerEnabledVa() { return LUA_V67_ISLAYERENABLED_VA >>> 0; }
export function luaEngineV67IsLayerEnabledRetVa() { return LUA_V67_ISLAYERENABLED_RET_VA >>> 0; }
export function luaEngineV67IsLayerEnabledBodyBytes() { return LUA_V67_ISLAYERENABLED_RET_VA - LUA_V67_ISLAYERENABLED_VA; }
export function luaEngineV67IsLayerEnabledInsnCount() { return LUA_V67_ISLAYERENABLED_INSNS | 0; }
export function luaEngineV67IsLayerEnabledCheckFlags() { return LUA_V67_ISLAYERENABLED_CHECK_FLAGS | 0; }
export function luaEngineV67IsLayerEnabledCheckEdx() { return LUA_V67_ISLAYERENABLED_CHECK_EDX | 0; }
export function luaEngineV67IsLayerEnabledKey() { return LUA_V67_ISLAYERENABLED_KEY >>> 0; }
export function luaEngineV67IsLayerEnabledObjectFieldOff() { return LUA_V67_ISLAYERENABLED_OBJECT_FIELD_OFF >>> 0; }
export function luaEngineV67IsLayerEnabledTypeIndex() { return LUA_V67_ISLAYERENABLED_TYPE_INDEX >>> 0; }
export function luaEngineV67IsLayerEnabledTouserdataIndex() { return LUA_V67_ISLAYERENABLED_TOUSERDATA_INDEX_U32 >>> 0; }
export function luaEngineV67IsLayerEnabledFnOff() { return LUA_V67_ISLAYERENABLED_FN_OFF >>> 0; }
export function luaEngineV67IsLayerEnabledArg0CheckintegerIndex() { return LUA_V67_ISLAYERENABLED_ARG0_CHECKINTEGER_INDEX_U32 >>> 0; }
export function luaEngineV67IsLayerEnabledIatLuaType() { return LUA_V67_ISLAYERENABLED_IAT_LUA_TYPE >>> 0; }
export function luaEngineV67IsLayerEnabledIatLuaTouserdata() { return LUA_V67_ISLAYERENABLED_IAT_LUA_TOUSERDATA >>> 0; }
export function luaEngineV67IsLayerEnabledIatLuaCheckinteger() { return LUA_V67_ISLAYERENABLED_IAT_LUA_CHECKINTEGER >>> 0; }
export function luaEngineV67IsLayerEnabledIatLuaPushboolean() { return LUA_V67_ISLAYERENABLED_IAT_LUA_PUSHBOOLEAN >>> 0; }
export function luaEngineV67IsLayerEnabledReturnValue() { return LUA_V67_ISLAYERENABLED_RETURN_VALUE | 0; }
export function luaEngineV67IsLayerEnabledInstallCount() { return LUA_V67_ISLAYERENABLED_INSTALL_COUNT | 0; }
export function luaEngineV67IsLayerEnabledInstallVa() { return LUA_V67_ISLAYERENABLED_INSTALL_VA >>> 0; }
export function luaEngineV67IsLayerEnabledInstallRetVa() { return LUA_V67_ISLAYERENABLED_INSTALL_RET_VA >>> 0; }
export function luaEngineV67IsLayerEnabledInstallLiteralVa() { return LUA_V67_ISLAYERENABLED_INSTALL_LITERAL_VA >>> 0; }
export function luaEngineV67IsLayerEnabledInstallRealFnVa() { return LUA_V67_ISLAYERENABLED_INSTALL_REAL_FN_VA >>> 0; }
export function luaEngineV67IsLayerEnabledInstallNameVa() { return LUA_V67_ISLAYERENABLED_INSTALL_NAME_VA >>> 0; }
export function luaEngineV67IsLayerEnabledInstallCallerVa() { return LUA_V67_ISLAYERENABLED_INSTALL_CALLER_VA >>> 0; }

export function luaEngineV67IsEnabledObjectResolve(typeResult, checkField) {
  /* FULL-WORD gate (`test eax,eax` @0x8b9d94). */
  return typeResult !== 0 ? checkField : 0;
}
export function luaEngineV67IsEnabledReturnGate(realFnResult) {
  /* PE `test al,al; setne cl` @0x8b9dcc/@0x8b9dce — BYTE gate on the
     real_fn's AL return -> pushboolean. uint32 in/out, & 0xff. */
  return (realFnResult & 0xff) !== 0 ? 1 : 0;
}
export function luaEngineV67IsEnabledVa() { return LUA_V67_ISENABLED_VA >>> 0; }
export function luaEngineV67IsEnabledRetVa() { return LUA_V67_ISENABLED_RET_VA >>> 0; }
export function luaEngineV67IsEnabledBodyBytes() { return LUA_V67_ISENABLED_RET_VA - LUA_V67_ISENABLED_VA; }
export function luaEngineV67IsEnabledInsnCount() { return LUA_V67_ISENABLED_INSNS | 0; }
export function luaEngineV67IsEnabledCheckFlags() { return LUA_V67_ISENABLED_CHECK_FLAGS | 0; }
export function luaEngineV67IsEnabledCheckEdx() { return LUA_V67_ISENABLED_CHECK_EDX | 0; }
export function luaEngineV67IsEnabledKey() { return LUA_V67_ISENABLED_KEY >>> 0; }
export function luaEngineV67IsEnabledObjectFieldOff() { return LUA_V67_ISENABLED_OBJECT_FIELD_OFF >>> 0; }
export function luaEngineV67IsEnabledTypeIndex() { return LUA_V67_ISENABLED_TYPE_INDEX >>> 0; }
export function luaEngineV67IsEnabledTouserdataIndex() { return LUA_V67_ISENABLED_TOUSERDATA_INDEX_U32 >>> 0; }
export function luaEngineV67IsEnabledFnOff() { return LUA_V67_ISENABLED_FN_OFF >>> 0; }
export function luaEngineV67IsEnabledIatLuaType() { return LUA_V67_ISENABLED_IAT_LUA_TYPE >>> 0; }
export function luaEngineV67IsEnabledIatLuaTouserdata() { return LUA_V67_ISENABLED_IAT_LUA_TOUSERDATA >>> 0; }
export function luaEngineV67IsEnabledIatLuaPushboolean() { return LUA_V67_ISENABLED_IAT_LUA_PUSHBOOLEAN >>> 0; }
export function luaEngineV67IsEnabledReturnValue() { return LUA_V67_ISENABLED_RETURN_VALUE | 0; }
export function luaEngineV67IsEnabledInstallCount() { return LUA_V67_ISENABLED_INSTALL_COUNT | 0; }
export function luaEngineV67IsEnabledInstallVa() { return LUA_V67_ISENABLED_INSTALL_VA >>> 0; }
export function luaEngineV67IsEnabledInstallRetVa() { return LUA_V67_ISENABLED_INSTALL_RET_VA >>> 0; }
export function luaEngineV67IsEnabledInstallLiteralVa() { return LUA_V67_ISENABLED_INSTALL_LITERAL_VA >>> 0; }
export function luaEngineV67IsEnabledInstallRealFnVa() { return LUA_V67_ISENABLED_INSTALL_REAL_FN_VA >>> 0; }
export function luaEngineV67IsEnabledInstallNameVa() { return LUA_V67_ISENABLED_INSTALL_NAME_VA >>> 0; }
export function luaEngineV67IsEnabledInstallCallerVa() { return LUA_V67_ISENABLED_INSTALL_CALLER_VA >>> 0; }

export function luaEngineV67VolumeSlideObjectResolve(typeResult, checkField) {
  /* FULL-WORD gate (`test eax,eax` @0x8b9e07). */
  return typeResult !== 0 ? checkField : 0;
}
export function luaEngineV67VolumeSlideVa() { return LUA_V67_VOLUMESLIDE_VA >>> 0; }
export function luaEngineV67VolumeSlideRetVa() { return LUA_V67_VOLUMESLIDE_RET_VA >>> 0; }
export function luaEngineV67VolumeSlideBodyBytes() { return LUA_V67_VOLUMESLIDE_RET_VA - LUA_V67_VOLUMESLIDE_VA; }
export function luaEngineV67VolumeSlideInsnCount() { return LUA_V67_VOLUMESLIDE_INSNS | 0; }
export function luaEngineV67VolumeSlideCheckFlags() { return LUA_V67_VOLUMESLIDE_CHECK_FLAGS | 0; }
export function luaEngineV67VolumeSlideCheckEdx() { return LUA_V67_VOLUMESLIDE_CHECK_EDX | 0; }
export function luaEngineV67VolumeSlideKey() { return LUA_V67_VOLUMESLIDE_KEY >>> 0; }
export function luaEngineV67VolumeSlideObjectFieldOff() { return LUA_V67_VOLUMESLIDE_OBJECT_FIELD_OFF >>> 0; }
export function luaEngineV67VolumeSlideTypeIndex() { return LUA_V67_VOLUMESLIDE_TYPE_INDEX >>> 0; }
export function luaEngineV67VolumeSlideTouserdataIndex() { return LUA_V67_VOLUMESLIDE_TOUSERDATA_INDEX_U32 >>> 0; }
export function luaEngineV67VolumeSlideFnOff() { return LUA_V67_VOLUMESLIDE_FN_OFF >>> 0; }
export function luaEngineV67VolumeSlideArg1ChecknumberIndex() { return LUA_V67_VOLUMESLIDE_ARG1_CHECKNUMBER_INDEX_U32 >>> 0; }
export function luaEngineV67VolumeSlideArg2ChecknumberIndex() { return LUA_V67_VOLUMESLIDE_ARG2_CHECKNUMBER_INDEX_U32 >>> 0; }
export function luaEngineV67VolumeSlideIatLuaType() { return LUA_V67_VOLUMESLIDE_IAT_LUA_TYPE >>> 0; }
export function luaEngineV67VolumeSlideIatLuaTouserdata() { return LUA_V67_VOLUMESLIDE_IAT_LUA_TOUSERDATA >>> 0; }
export function luaEngineV67VolumeSlideIatLuaChecknumber() { return LUA_V67_VOLUMESLIDE_IAT_LUA_CHECKNUMBER >>> 0; }
export function luaEngineV67VolumeSlideReturnValue() { return LUA_V67_VOLUMESLIDE_RETURN_VALUE | 0; }
export function luaEngineV67VolumeSlideInstallCount() { return LUA_V67_VOLUMESLIDE_INSTALL_COUNT | 0; }
export function luaEngineV67VolumeSlideInstallVa() { return LUA_V67_VOLUMESLIDE_INSTALL_VA >>> 0; }
export function luaEngineV67VolumeSlideInstallRetVa() { return LUA_V67_VOLUMESLIDE_INSTALL_RET_VA >>> 0; }
export function luaEngineV67VolumeSlideInstallLiteralVa() { return LUA_V67_VOLUMESLIDE_INSTALL_LITERAL_VA >>> 0; }
export function luaEngineV67VolumeSlideInstallRealFnVa() { return LUA_V67_VOLUMESLIDE_INSTALL_REAL_FN_VA >>> 0; }
export function luaEngineV67VolumeSlideInstallNameVa() { return LUA_V67_VOLUMESLIDE_INSTALL_NAME_VA >>> 0; }
export function luaEngineV67VolumeSlideInstallCallerVa() { return LUA_V67_VOLUMESLIDE_INSTALL_CALLER_VA >>> 0; }

export function luaEngineV67GetCurrentMusicIdObjectResolve(typeResult, checkField) {
  /* FULL-WORD gate (`test eax,eax` @0x8b9e94). */
  return typeResult !== 0 ? checkField : 0;
}
export function luaEngineV67GetCurrentMusicIdResultWord(realFnResult) {
  /* PE `mov edx,eax` @0x8b9eca — the real_fn FULL DWORD result fed to
     the 0x85bfd0 sext pusher (v55 pusher ROW 3). Passthrough. */
  return realFnResult >>> 0;
}
export function luaEngineV67GetCurrentMusicIdVa() { return LUA_V67_GETCURRENTMUSICID_VA >>> 0; }
export function luaEngineV67GetCurrentMusicIdRetVa() { return LUA_V67_GETCURRENTMUSICID_RET_VA >>> 0; }
export function luaEngineV67GetCurrentMusicIdBodyBytes() { return LUA_V67_GETCURRENTMUSICID_RET_VA - LUA_V67_GETCURRENTMUSICID_VA; }
export function luaEngineV67GetCurrentMusicIdInsnCount() { return LUA_V67_GETCURRENTMUSICID_INSNS | 0; }
export function luaEngineV67GetCurrentMusicIdCheckFlags() { return LUA_V67_GETCURRENTMUSICID_CHECK_FLAGS | 0; }
export function luaEngineV67GetCurrentMusicIdCheckEdx() { return LUA_V67_GETCURRENTMUSICID_CHECK_EDX | 0; }
export function luaEngineV67GetCurrentMusicIdKey() { return LUA_V67_GETCURRENTMUSICID_KEY >>> 0; }
export function luaEngineV67GetCurrentMusicIdObjectFieldOff() { return LUA_V67_GETCURRENTMUSICID_OBJECT_FIELD_OFF >>> 0; }
export function luaEngineV67GetCurrentMusicIdTypeIndex() { return LUA_V67_GETCURRENTMUSICID_TYPE_INDEX >>> 0; }
export function luaEngineV67GetCurrentMusicIdTouserdataIndex() { return LUA_V67_GETCURRENTMUSICID_TOUSERDATA_INDEX_U32 >>> 0; }
export function luaEngineV67GetCurrentMusicIdFnOff() { return LUA_V67_GETCURRENTMUSICID_FN_OFF >>> 0; }
export function luaEngineV67GetCurrentMusicIdSextPushVa() { return LUA_V67_GETCURRENTMUSICID_SEXT_PUSH_VA >>> 0; }
export function luaEngineV67GetCurrentMusicIdIatLuaType() { return LUA_V67_GETCURRENTMUSICID_IAT_LUA_TYPE >>> 0; }
export function luaEngineV67GetCurrentMusicIdIatLuaTouserdata() { return LUA_V67_GETCURRENTMUSICID_IAT_LUA_TOUSERDATA >>> 0; }
export function luaEngineV67GetCurrentMusicIdReturnValue() { return LUA_V67_GETCURRENTMUSICID_RETURN_VALUE | 0; }
export function luaEngineV67GetCurrentMusicIdInstallCount() { return LUA_V67_GETCURRENTMUSICID_INSTALL_COUNT | 0; }
export function luaEngineV67GetCurrentMusicIdInstallVa() { return LUA_V67_GETCURRENTMUSICID_INSTALL_VA >>> 0; }
export function luaEngineV67GetCurrentMusicIdInstallRetVa() { return LUA_V67_GETCURRENTMUSICID_INSTALL_RET_VA >>> 0; }
export function luaEngineV67GetCurrentMusicIdInstallLiteralVa() { return LUA_V67_GETCURRENTMUSICID_INSTALL_LITERAL_VA >>> 0; }
export function luaEngineV67GetCurrentMusicIdInstallRealFnVa() { return LUA_V67_GETCURRENTMUSICID_INSTALL_REAL_FN_VA >>> 0; }
export function luaEngineV67GetCurrentMusicIdInstallNameVa() { return LUA_V67_GETCURRENTMUSICID_INSTALL_NAME_VA >>> 0; }
export function luaEngineV67GetCurrentMusicIdInstallCallerVa() { return LUA_V67_GETCURRENTMUSICID_INSTALL_CALLER_VA >>> 0; }

/* ---- ABI v68: EIGHT fourth-region Isaac-global wrappers 0x897870..
 * 0x898f4b (hosts C/D census; key-free direct-ud shape — NO lua_type
 * gate, NO 0x85c590 check helper), landed together under ABI 68 (v67
 * precedent). See the lua-v68-8b9b20 notes + header ABI v68 block for
 * PE-truth. Shared law: real_fn = ud[0] (FN_OFF 0) after
 * lua_touserdata(L, 0xfff0b9d7) IAT 0xb183b0. All gates/words
 * uint32_t. Install sites: ret-8 helpers (recorded as sites, primary
 * pair pinned per wrapper).
 * ------------------------------------------------------------------ */
export const LUA_V68_GETBUTTONVALUE_VA = 0x00897870; /* "GetButtonValue" */
export const LUA_V68_GETBUTTONVALUE_RET_VA = 0x008978c6;
export const LUA_V68_GETBUTTONVALUE_INSNS = 35; /* capstone TRUE body, ret incl. */
export const LUA_V68_GETBUTTONVALUE_TOUSERDATA_INDEX_U32 = 0xfff0b9d7;
export const LUA_V68_GETBUTTONVALUE_FN_OFF = 0x00;
export const LUA_V68_GETBUTTONVALUE_ARG0_CHECKINTEGER_INDEX_U32 = 0x01;
export const LUA_V68_GETBUTTONVALUE_ARG1_CHECKINTEGER_INDEX_U32 = 0x02;
export const LUA_V68_GETBUTTONVALUE_F32_SLOT_OFF_U32 = 0xffffffbc; /* ebp-4 */
export const LUA_V68_GETBUTTONVALUE_NUMBER_PUSH_VA = 0x0085c050; /* pusher ROW 0 */
export const LUA_V68_GETBUTTONVALUE_IAT_LUA_TOUSERDATA = 0x00b183b0;
export const LUA_V68_GETBUTTONVALUE_IAT_LUA_CHECKINTEGER = 0x00b183f4;
export const LUA_V68_GETBUTTONVALUE_RETURN_VALUE = 1;
export const LUA_V68_GETBUTTONVALUE_INSTALL_COUNT = 1;
export const LUA_V68_GETBUTTONVALUE_INSTALL_VA = 0x00896750;
export const LUA_V68_GETBUTTONVALUE_INSTALL_RET_VA = 0x008967a9;
export const LUA_V68_GETBUTTONVALUE_INSTALL_LITERAL_VA = 0x00896767;
export const LUA_V68_GETBUTTONVALUE_INSTALL_REAL_FN_VA = 0x0086fcd0; /* Isaac global, HOST */
export const LUA_V68_GETBUTTONVALUE_INSTALL_NAME_VA = 0x00b75074;
export const LUA_V68_GETBUTTONVALUE_INSTALL_CALLER_VA = 0x0086e137;

export const LUA_V68_ISBUTTONTRIGGERED_VA = 0x008978d0; /* "IsButtonTriggered" */
export const LUA_V68_ISBUTTONTRIGGERED_RET_VA = 0x00897923;
export const LUA_V68_ISBUTTONTRIGGERED_INSNS = 36;
export const LUA_V68_ISBUTTONTRIGGERED_TOUSERDATA_INDEX_U32 = 0xfff0b9d7;
export const LUA_V68_ISBUTTONTRIGGERED_FN_OFF = 0x00;
export const LUA_V68_ISBUTTONTRIGGERED_ARG0_CHECKINTEGER_INDEX_U32 = 0x01;
export const LUA_V68_ISBUTTONTRIGGERED_ARG1_CHECKINTEGER_INDEX_U32 = 0x02;
export const LUA_V68_ISBUTTONTRIGGERED_IAT_LUA_TOUSERDATA = 0x00b183b0;
export const LUA_V68_ISBUTTONTRIGGERED_IAT_LUA_CHECKINTEGER = 0x00b183f4;
export const LUA_V68_ISBUTTONTRIGGERED_IAT_LUA_PUSHBOOLEAN = 0x00b183ec;
export const LUA_V68_ISBUTTONTRIGGERED_RETURN_VALUE = 1;
export const LUA_V68_ISBUTTONTRIGGERED_INSTALL_COUNT = 1;
export const LUA_V68_ISBUTTONTRIGGERED_INSTALL_VA = 0x008966f0;
export const LUA_V68_ISBUTTONTRIGGERED_INSTALL_RET_VA = 0x00896749;
export const LUA_V68_ISBUTTONTRIGGERED_INSTALL_LITERAL_VA = 0x00896707;
export const LUA_V68_ISBUTTONTRIGGERED_INSTALL_REAL_FN_VA = 0x0086fc70;
export const LUA_V68_ISBUTTONTRIGGERED_INSTALL_NAME_VA = 0x00b75098;
export const LUA_V68_ISBUTTONTRIGGERED_INSTALL_CALLER_VA = 0x0086e115;

export const LUA_V68_GETBUILTINCALLBACKSTATE_VA = 0x0089e300; /* "GetBuiltInCallbackState" */
export const LUA_V68_GETBUILTINCALLBACKSTATE_RET_VA = 0x0089e343;
export const LUA_V68_GETBUILTINCALLBACKSTATE_INSNS = 29;
export const LUA_V68_GETBUILTINCALLBACKSTATE_STACK_ALIGN_MASK = 0xfffffff8;
export const LUA_V68_GETBUILTINCALLBACKSTATE_TOUSERDATA_INDEX_U32 = 0xfff0b9d7;
export const LUA_V68_GETBUILTINCALLBACKSTATE_FN_OFF = 0x00;
export const LUA_V68_GETBUILTINCALLBACKSTATE_ARG0_CHECKINTEGER_INDEX_U32 = 0x01;
export const LUA_V68_GETBUILTINCALLBACKSTATE_IAT_LUA_TOUSERDATA = 0x00b183b0;
export const LUA_V68_GETBUILTINCALLBACKSTATE_IAT_LUA_CHECKINTEGER = 0x00b183f4;
export const LUA_V68_GETBUILTINCALLBACKSTATE_IAT_LUA_PUSHBOOLEAN = 0x00b183ec;
export const LUA_V68_GETBUILTINCALLBACKSTATE_RETURN_VALUE = 1;
export const LUA_V68_GETBUILTINCALLBACKSTATE_INSTALL_COUNT = 1;
export const LUA_V68_GETBUILTINCALLBACKSTATE_INSTALL_VA = 0x00896450;
export const LUA_V68_GETBUILTINCALLBACKSTATE_INSTALL_RET_VA = 0x008964a9;
export const LUA_V68_GETBUILTINCALLBACKSTATE_INSTALL_LITERAL_VA = 0x00896467;
export const LUA_V68_GETBUILTINCALLBACKSTATE_INSTALL_REAL_FN_VA = 0x0086f4f0;
export const LUA_V68_GETBUILTINCALLBACKSTATE_INSTALL_NAME_VA = 0x00b74f20;
export const LUA_V68_GETBUILTINCALLBACKSTATE_INSTALL_CALLER_VA = 0x0086dfef;

export const LUA_V68_MUSICMANAGER_VA = 0x00898d90; /* "MusicManager" ctor closure */
export const LUA_V68_MUSICMANAGER_RET_VA = 0x00898de8;
export const LUA_V68_MUSICMANAGER_INSNS = 32;
export const LUA_V68_MUSICMANAGER_TOUSERDATA_INDEX_U32 = 0xfff0b9d7;
export const LUA_V68_MUSICMANAGER_FN_OFF = 0x00;
export const LUA_V68_MUSICMANAGER_NEWUSERDATA_SIZE = 0x08;
export const LUA_V68_MUSICMANAGER_UD_VTABLE_VA = 0x00b753c8;
export const LUA_V68_MUSICMANAGER_UD_OBJECT_OFF = 0x04;
export const LUA_V68_MUSICMANAGER_RAWGETP_KEY = 0x00c82a19;
export const LUA_V68_MUSICMANAGER_REGISTRY_INDEX_U32 = 0xfff0b9d8;
export const LUA_V68_MUSICMANAGER_SETMETA_INDEX_U32 = 0xfffffffe;
export const LUA_V68_MUSICMANAGER_IAT_LUA_TOUSERDATA = 0x00b183b0;
export const LUA_V68_MUSICMANAGER_IAT_LUA_NEWUSERDATA = 0x00b1839c;
export const LUA_V68_MUSICMANAGER_IAT_LUA_RAWGETP = 0x00b183bc;
export const LUA_V68_MUSICMANAGER_IAT_LUA_SETMETATABLE = 0x00b18398;
export const LUA_V68_MUSICMANAGER_RETURN_VALUE = 1;
export const LUA_V68_MUSICMANAGER_INSTALL_COUNT = 1;
export const LUA_V68_MUSICMANAGER_INSTALL_VA = 0x00895d90;
export const LUA_V68_MUSICMANAGER_INSTALL_RET_VA = 0x00895de8;
export const LUA_V68_MUSICMANAGER_INSTALL_LITERAL_VA = 0x00895da1;
export const LUA_V68_MUSICMANAGER_INSTALL_REAL_FN_VA = 0x00428cd0; /* game singleton accessor, HOST */
export const LUA_V68_MUSICMANAGER_INSTALL_NAME_VA = 0x00b74c7c;
export const LUA_V68_MUSICMANAGER_INSTALL_CALLER_VA = 0x0086dd52;

export const LUA_V68_SFXMANAGER_VA = 0x00898e00; /* "SFXManager" ctor closure */
export const LUA_V68_SFXMANAGER_RET_VA = 0x00898e58;
export const LUA_V68_SFXMANAGER_INSNS = 32;
export const LUA_V68_SFXMANAGER_TOUSERDATA_INDEX_U32 = 0xfff0b9d7;
export const LUA_V68_SFXMANAGER_FN_OFF = 0x00;
export const LUA_V68_SFXMANAGER_NEWUSERDATA_SIZE = 0x08;
export const LUA_V68_SFXMANAGER_UD_VTABLE_VA = 0x00b753c8;
export const LUA_V68_SFXMANAGER_UD_OBJECT_OFF = 0x04;
export const LUA_V68_SFXMANAGER_RAWGETP_KEY = 0x00c82a16;
export const LUA_V68_SFXMANAGER_REGISTRY_INDEX_U32 = 0xfff0b9d8;
export const LUA_V68_SFXMANAGER_SETMETA_INDEX_U32 = 0xfffffffe;
export const LUA_V68_SFXMANAGER_IAT_LUA_TOUSERDATA = 0x00b183b0;
export const LUA_V68_SFXMANAGER_IAT_LUA_NEWUSERDATA = 0x00b1839c;
export const LUA_V68_SFXMANAGER_IAT_LUA_RAWGETP = 0x00b183bc;
export const LUA_V68_SFXMANAGER_IAT_LUA_SETMETATABLE = 0x00b18398;
export const LUA_V68_SFXMANAGER_RETURN_VALUE = 1;
export const LUA_V68_SFXMANAGER_INSTALL_COUNT = 1;
export const LUA_V68_SFXMANAGER_INSTALL_VA = 0x00895d30;
export const LUA_V68_SFXMANAGER_INSTALL_RET_VA = 0x00895d88;
export const LUA_V68_SFXMANAGER_INSTALL_LITERAL_VA = 0x00895d41;
export const LUA_V68_SFXMANAGER_INSTALL_REAL_FN_VA = 0x00420af0;
export const LUA_V68_SFXMANAGER_INSTALL_NAME_VA = 0x00b74be4;
export const LUA_V68_SFXMANAGER_INSTALL_CALLER_VA = 0x0086dd41;

export const LUA_V68_GAME0_VA = 0x00898e70; /* "Game_0" ctor closure */
export const LUA_V68_GAME0_RET_VA = 0x00898ec8;
export const LUA_V68_GAME0_INSNS = 32;
export const LUA_V68_GAME0_TOUSERDATA_INDEX_U32 = 0xfff0b9d7;
export const LUA_V68_GAME0_FN_OFF = 0x00;
export const LUA_V68_GAME0_NEWUSERDATA_SIZE = 0x08;
export const LUA_V68_GAME0_UD_VTABLE_VA = 0x00b753c8;
export const LUA_V68_GAME0_UD_OBJECT_OFF = 0x04;
export const LUA_V68_GAME0_RAWGETP_KEY = 0x00c82a13;
export const LUA_V68_GAME0_REGISTRY_INDEX_U32 = 0xfff0b9d8;
export const LUA_V68_GAME0_SETMETA_INDEX_U32 = 0xfffffffe;
export const LUA_V68_GAME0_IAT_LUA_TOUSERDATA = 0x00b183b0;
export const LUA_V68_GAME0_IAT_LUA_NEWUSERDATA = 0x00b1839c;
export const LUA_V68_GAME0_IAT_LUA_RAWGETP = 0x00b183bc;
export const LUA_V68_GAME0_IAT_LUA_SETMETATABLE = 0x00b18398;
export const LUA_V68_GAME0_RETURN_VALUE = 1;
export const LUA_V68_GAME0_INSTALL_COUNT = 1;
export const LUA_V68_GAME0_INSTALL_VA = 0x00895cd0;
export const LUA_V68_GAME0_INSTALL_RET_VA = 0x00895d28;
export const LUA_V68_GAME0_INSTALL_LITERAL_VA = 0x00895ce1;
export const LUA_V68_GAME0_INSTALL_REAL_FN_VA = 0x0086fc60;
export const LUA_V68_GAME0_INSTALL_NAME_VA = 0x00b74d38;
export const LUA_V68_GAME0_INSTALL_CALLER_VA = 0x0086dd30;

export const LUA_V68_RANDOMVECTOR_VA = 0x00898ee0; /* "RandomVector" */
export const LUA_V68_RANDOMVECTOR_RET_VA = 0x00898f4b;
export const LUA_V68_RANDOMVECTOR_INSNS = 39;
export const LUA_V68_RANDOMVECTOR_TOUSERDATA_INDEX_U32 = 0xfff0b9d7;
export const LUA_V68_RANDOMVECTOR_FN_OFF = 0x00;
export const LUA_V68_RANDOMVECTOR_NEWUSERDATA_SIZE = 0x10;
export const LUA_V68_RANDOMVECTOR_UD_VTABLE_VA = 0x00b73574; /* the v45 Vector tag */
export const LUA_V68_RANDOMVECTOR_UD_PAYLOAD_OFF = 0x08;
export const LUA_V68_RANDOMVECTOR_RAWGETP_KEY = 0x00c82980; /* Vector class key (v45) */
export const LUA_V68_RANDOMVECTOR_REGISTRY_INDEX_U32 = 0xfff0b9d8;
export const LUA_V68_RANDOMVECTOR_SETMETA_INDEX_U32 = 0xfffffffe;
export const LUA_V68_RANDOMVECTOR_IAT_LUA_TOUSERDATA = 0x00b183b0;
export const LUA_V68_RANDOMVECTOR_IAT_LUA_NEWUSERDATA = 0x00b1839c;
export const LUA_V68_RANDOMVECTOR_IAT_LUA_RAWGETP = 0x00b183bc;
export const LUA_V68_RANDOMVECTOR_IAT_LUA_SETMETATABLE = 0x00b18398;
export const LUA_V68_RANDOMVECTOR_RETURN_VALUE = 1;
export const LUA_V68_RANDOMVECTOR_INSTALL_COUNT = 1;
export const LUA_V68_RANDOMVECTOR_INSTALL_VA = 0x00895c70;
export const LUA_V68_RANDOMVECTOR_INSTALL_RET_VA = 0x00895cc9;
export const LUA_V68_RANDOMVECTOR_INSTALL_LITERAL_VA = 0x00895c87;
export const LUA_V68_RANDOMVECTOR_INSTALL_REAL_FN_VA = 0x0067f070; /* game rng helper, HOST */
export const LUA_V68_RANDOMVECTOR_INSTALL_NAME_VA = 0x00b74d28;
export const LUA_V68_RANDOMVECTOR_INSTALL_CALLER_VA = 0x0086dd1f;

export const LUA_V68_GETROOMENTITIES_VA = 0x00898490; /* "GetRoomEntities" */
export const LUA_V68_GETROOMENTITIES_RET_VA = 0x008984d6;
export const LUA_V68_GETROOMENTITIES_INSNS = 23;
export const LUA_V68_GETROOMENTITIES_TOUSERDATA_INDEX_U32 = 0xfff0b9d7;
export const LUA_V68_GETROOMENTITIES_FN_OFF = 0x00;
export const LUA_V68_GETROOMENTITIES_RAWGETI_HELPER_VA = 0x006a80f0; /* shared 18-caller host helper (cdq -> lua_rawgeti 0xb18318); laws stay HOST */
export const LUA_V68_GETROOMENTITIES_REGISTRY_INDEX_U32 = 0xfff0b9d8;
export const LUA_V68_GETROOMENTITIES_VEC_OFF_LO_U32 = 0xfffffff8; /* ebp-8 */
export const LUA_V68_GETROOMENTITIES_VEC_OFF_REF_U32 = 0xfffffffc; /* ebp-4 */
export const LUA_V68_GETROOMENTITIES_IAT_LUA_TOUSERDATA = 0x00b183b0;
export const LUA_V68_GETROOMENTITIES_IAT_LUA_LUAL_UNREF = 0x00b1831c;
export const LUA_V68_GETROOMENTITIES_RETURN_VALUE = 1;
export const LUA_V68_GETROOMENTITIES_INSTALL_COUNT = 1;
export const LUA_V68_GETROOMENTITIES_INSTALL_VA = 0x008961b0;
export const LUA_V68_GETROOMENTITIES_INSTALL_RET_VA = 0x00896208;
export const LUA_V68_GETROOMENTITIES_INSTALL_LITERAL_VA = 0x008961c1;
export const LUA_V68_GETROOMENTITIES_INSTALL_REAL_FN_VA = 0x0086fb20; /* Isaac global, HOST */
export const LUA_V68_GETROOMENTITIES_INSTALL_NAME_VA = 0x00b74dbc;
export const LUA_V68_GETROOMENTITIES_INSTALL_CALLER_VA = 0x0086de46;

export function luaEngineV68IsButtonTriggeredReturnGate(realFnResult) {
  /* PE `test al,al; setne cl` @0x897907/@0x897909 — BYTE gate on the
     real_fn's AL return -> lua_pushboolean. uint32 in/out, & 0xff. */
  return (realFnResult & 0xff) !== 0 ? 1 : 0;
}
export function luaEngineV68GetBuiltInCallbackStateReturnGate(realFnResult) {
  /* PE `test al,al; setne cl` @0x89e329/@0x89e32b — BYTE gate. */
  return (realFnResult & 0xff) !== 0 ? 1 : 0;
}
export function luaEngineV68MusicManagerNullGate(realFnResult) {
  /* PE `test edi,edi; je` @0x898dad — FULL-WORD null gate: 0 -> skip
     the wrap path. Never masked (0x100 -> non-null). */
  return realFnResult !== 0 ? 1 : 0;
}
export function luaEngineV68SfxManagerNullGate(realFnResult) {
  /* PE `test edi,edi; je` @0x898e1d — FULL-WORD null gate. */
  return realFnResult !== 0 ? 1 : 0;
}
export function luaEngineV68Game0NullGate(realFnResult) {
  /* PE `test edi,edi; je` @0x898e8d — FULL-WORD null gate. */
  return realFnResult !== 0 ? 1 : 0;
}

export function luaEngineV68GetButtonValueVa() { return LUA_V68_GETBUTTONVALUE_VA >>> 0; }
export function luaEngineV68GetButtonValueRetVa() { return LUA_V68_GETBUTTONVALUE_RET_VA >>> 0; }
export function luaEngineV68GetButtonValueBodyBytes() { return LUA_V68_GETBUTTONVALUE_RET_VA - LUA_V68_GETBUTTONVALUE_VA; }
export function luaEngineV68GetButtonValueInsnCount() { return LUA_V68_GETBUTTONVALUE_INSNS | 0; }
export function luaEngineV68GetButtonValueTouserdataIndex() { return LUA_V68_GETBUTTONVALUE_TOUSERDATA_INDEX_U32 >>> 0; }
export function luaEngineV68GetButtonValueFnOff() { return LUA_V68_GETBUTTONVALUE_FN_OFF >>> 0; }
export function luaEngineV68GetButtonValueArg0CheckintegerIndex() { return LUA_V68_GETBUTTONVALUE_ARG0_CHECKINTEGER_INDEX_U32 >>> 0; }
export function luaEngineV68GetButtonValueArg1CheckintegerIndex() { return LUA_V68_GETBUTTONVALUE_ARG1_CHECKINTEGER_INDEX_U32 >>> 0; }
export function luaEngineV68GetButtonValueF32SlotOff() { return LUA_V68_GETBUTTONVALUE_F32_SLOT_OFF_U32 >>> 0; }
export function luaEngineV68GetButtonValueNumberPushVa() { return LUA_V68_GETBUTTONVALUE_NUMBER_PUSH_VA >>> 0; }
export function luaEngineV68GetButtonValueIatLuaTouserdata() { return LUA_V68_GETBUTTONVALUE_IAT_LUA_TOUSERDATA >>> 0; }
export function luaEngineV68GetButtonValueIatLuaCheckinteger() { return LUA_V68_GETBUTTONVALUE_IAT_LUA_CHECKINTEGER >>> 0; }
export function luaEngineV68GetButtonValueReturnValue() { return LUA_V68_GETBUTTONVALUE_RETURN_VALUE | 0; }
export function luaEngineV68GetButtonValueInstallCount() { return LUA_V68_GETBUTTONVALUE_INSTALL_COUNT | 0; }
export function luaEngineV68GetButtonValueInstallVa() { return LUA_V68_GETBUTTONVALUE_INSTALL_VA >>> 0; }
export function luaEngineV68GetButtonValueInstallRetVa() { return LUA_V68_GETBUTTONVALUE_INSTALL_RET_VA >>> 0; }
export function luaEngineV68GetButtonValueInstallLiteralVa() { return LUA_V68_GETBUTTONVALUE_INSTALL_LITERAL_VA >>> 0; }
export function luaEngineV68GetButtonValueInstallRealFnVa() { return LUA_V68_GETBUTTONVALUE_INSTALL_REAL_FN_VA >>> 0; }
export function luaEngineV68GetButtonValueInstallNameVa() { return LUA_V68_GETBUTTONVALUE_INSTALL_NAME_VA >>> 0; }
export function luaEngineV68GetButtonValueInstallCallerVa() { return LUA_V68_GETBUTTONVALUE_INSTALL_CALLER_VA >>> 0; }

export function luaEngineV68IsButtonTriggeredVa() { return LUA_V68_ISBUTTONTRIGGERED_VA >>> 0; }
export function luaEngineV68IsButtonTriggeredRetVa() { return LUA_V68_ISBUTTONTRIGGERED_RET_VA >>> 0; }
export function luaEngineV68IsButtonTriggeredBodyBytes() { return LUA_V68_ISBUTTONTRIGGERED_RET_VA - LUA_V68_ISBUTTONTRIGGERED_VA; }
export function luaEngineV68IsButtonTriggeredInsnCount() { return LUA_V68_ISBUTTONTRIGGERED_INSNS | 0; }
export function luaEngineV68IsButtonTriggeredTouserdataIndex() { return LUA_V68_ISBUTTONTRIGGERED_TOUSERDATA_INDEX_U32 >>> 0; }
export function luaEngineV68IsButtonTriggeredFnOff() { return LUA_V68_ISBUTTONTRIGGERED_FN_OFF >>> 0; }
export function luaEngineV68IsButtonTriggeredArg0CheckintegerIndex() { return LUA_V68_ISBUTTONTRIGGERED_ARG0_CHECKINTEGER_INDEX_U32 >>> 0; }
export function luaEngineV68IsButtonTriggeredArg1CheckintegerIndex() { return LUA_V68_ISBUTTONTRIGGERED_ARG1_CHECKINTEGER_INDEX_U32 >>> 0; }
export function luaEngineV68IsButtonTriggeredIatLuaTouserdata() { return LUA_V68_ISBUTTONTRIGGERED_IAT_LUA_TOUSERDATA >>> 0; }
export function luaEngineV68IsButtonTriggeredIatLuaCheckinteger() { return LUA_V68_ISBUTTONTRIGGERED_IAT_LUA_CHECKINTEGER >>> 0; }
export function luaEngineV68IsButtonTriggeredIatLuaPushboolean() { return LUA_V68_ISBUTTONTRIGGERED_IAT_LUA_PUSHBOOLEAN >>> 0; }
export function luaEngineV68IsButtonTriggeredReturnValue() { return LUA_V68_ISBUTTONTRIGGERED_RETURN_VALUE | 0; }
export function luaEngineV68IsButtonTriggeredInstallCount() { return LUA_V68_ISBUTTONTRIGGERED_INSTALL_COUNT | 0; }
export function luaEngineV68IsButtonTriggeredInstallVa() { return LUA_V68_ISBUTTONTRIGGERED_INSTALL_VA >>> 0; }
export function luaEngineV68IsButtonTriggeredInstallRetVa() { return LUA_V68_ISBUTTONTRIGGERED_INSTALL_RET_VA >>> 0; }
export function luaEngineV68IsButtonTriggeredInstallLiteralVa() { return LUA_V68_ISBUTTONTRIGGERED_INSTALL_LITERAL_VA >>> 0; }
export function luaEngineV68IsButtonTriggeredInstallRealFnVa() { return LUA_V68_ISBUTTONTRIGGERED_INSTALL_REAL_FN_VA >>> 0; }
export function luaEngineV68IsButtonTriggeredInstallNameVa() { return LUA_V68_ISBUTTONTRIGGERED_INSTALL_NAME_VA >>> 0; }
export function luaEngineV68IsButtonTriggeredInstallCallerVa() { return LUA_V68_ISBUTTONTRIGGERED_INSTALL_CALLER_VA >>> 0; }

export function luaEngineV68GetBuiltInCallbackStateVa() { return LUA_V68_GETBUILTINCALLBACKSTATE_VA >>> 0; }
export function luaEngineV68GetBuiltInCallbackStateRetVa() { return LUA_V68_GETBUILTINCALLBACKSTATE_RET_VA >>> 0; }
export function luaEngineV68GetBuiltInCallbackStateBodyBytes() { return LUA_V68_GETBUILTINCALLBACKSTATE_RET_VA - LUA_V68_GETBUILTINCALLBACKSTATE_VA; }
export function luaEngineV68GetBuiltInCallbackStateInsnCount() { return LUA_V68_GETBUILTINCALLBACKSTATE_INSNS | 0; }
export function luaEngineV68GetBuiltInCallbackStateStackAlignMask() { return LUA_V68_GETBUILTINCALLBACKSTATE_STACK_ALIGN_MASK >>> 0; }
export function luaEngineV68GetBuiltInCallbackStateTouserdataIndex() { return LUA_V68_GETBUILTINCALLBACKSTATE_TOUSERDATA_INDEX_U32 >>> 0; }
export function luaEngineV68GetBuiltInCallbackStateFnOff() { return LUA_V68_GETBUILTINCALLBACKSTATE_FN_OFF >>> 0; }
export function luaEngineV68GetBuiltInCallbackStateArg0CheckintegerIndex() { return LUA_V68_GETBUILTINCALLBACKSTATE_ARG0_CHECKINTEGER_INDEX_U32 >>> 0; }
export function luaEngineV68GetBuiltInCallbackStateIatLuaTouserdata() { return LUA_V68_GETBUILTINCALLBACKSTATE_IAT_LUA_TOUSERDATA >>> 0; }
export function luaEngineV68GetBuiltInCallbackStateIatLuaCheckinteger() { return LUA_V68_GETBUILTINCALLBACKSTATE_IAT_LUA_CHECKINTEGER >>> 0; }
export function luaEngineV68GetBuiltInCallbackStateIatLuaPushboolean() { return LUA_V68_GETBUILTINCALLBACKSTATE_IAT_LUA_PUSHBOOLEAN >>> 0; }
export function luaEngineV68GetBuiltInCallbackStateReturnValue() { return LUA_V68_GETBUILTINCALLBACKSTATE_RETURN_VALUE | 0; }
export function luaEngineV68GetBuiltInCallbackStateInstallCount() { return LUA_V68_GETBUILTINCALLBACKSTATE_INSTALL_COUNT | 0; }
export function luaEngineV68GetBuiltInCallbackStateInstallVa() { return LUA_V68_GETBUILTINCALLBACKSTATE_INSTALL_VA >>> 0; }
export function luaEngineV68GetBuiltInCallbackStateInstallRetVa() { return LUA_V68_GETBUILTINCALLBACKSTATE_INSTALL_RET_VA >>> 0; }
export function luaEngineV68GetBuiltInCallbackStateInstallLiteralVa() { return LUA_V68_GETBUILTINCALLBACKSTATE_INSTALL_LITERAL_VA >>> 0; }
export function luaEngineV68GetBuiltInCallbackStateInstallRealFnVa() { return LUA_V68_GETBUILTINCALLBACKSTATE_INSTALL_REAL_FN_VA >>> 0; }
export function luaEngineV68GetBuiltInCallbackStateInstallNameVa() { return LUA_V68_GETBUILTINCALLBACKSTATE_INSTALL_NAME_VA >>> 0; }
export function luaEngineV68GetBuiltInCallbackStateInstallCallerVa() { return LUA_V68_GETBUILTINCALLBACKSTATE_INSTALL_CALLER_VA >>> 0; }

export function luaEngineV68MusicManagerVa() { return LUA_V68_MUSICMANAGER_VA >>> 0; }
export function luaEngineV68MusicManagerRetVa() { return LUA_V68_MUSICMANAGER_RET_VA >>> 0; }
export function luaEngineV68MusicManagerBodyBytes() { return LUA_V68_MUSICMANAGER_RET_VA - LUA_V68_MUSICMANAGER_VA; }
export function luaEngineV68MusicManagerInsnCount() { return LUA_V68_MUSICMANAGER_INSNS | 0; }
export function luaEngineV68MusicManagerTouserdataIndex() { return LUA_V68_MUSICMANAGER_TOUSERDATA_INDEX_U32 >>> 0; }
export function luaEngineV68MusicManagerFnOff() { return LUA_V68_MUSICMANAGER_FN_OFF >>> 0; }
export function luaEngineV68MusicManagerNewuserdataSize() { return LUA_V68_MUSICMANAGER_NEWUSERDATA_SIZE >>> 0; }
export function luaEngineV68MusicManagerUdVtableVa() { return LUA_V68_MUSICMANAGER_UD_VTABLE_VA >>> 0; }
export function luaEngineV68MusicManagerUdObjectOff() { return LUA_V68_MUSICMANAGER_UD_OBJECT_OFF >>> 0; }
export function luaEngineV68MusicManagerRawgetpKey() { return LUA_V68_MUSICMANAGER_RAWGETP_KEY >>> 0; }
export function luaEngineV68MusicManagerRegistryIndex() { return LUA_V68_MUSICMANAGER_REGISTRY_INDEX_U32 >>> 0; }
export function luaEngineV68MusicManagerSetmetaIndex() { return LUA_V68_MUSICMANAGER_SETMETA_INDEX_U32 >>> 0; }
export function luaEngineV68MusicManagerIatLuaTouserdata() { return LUA_V68_MUSICMANAGER_IAT_LUA_TOUSERDATA >>> 0; }
export function luaEngineV68MusicManagerIatLuaNewuserdata() { return LUA_V68_MUSICMANAGER_IAT_LUA_NEWUSERDATA >>> 0; }
export function luaEngineV68MusicManagerIatLuaRawgetp() { return LUA_V68_MUSICMANAGER_IAT_LUA_RAWGETP >>> 0; }
export function luaEngineV68MusicManagerIatLuaSetmetatable() { return LUA_V68_MUSICMANAGER_IAT_LUA_SETMETATABLE >>> 0; }
export function luaEngineV68MusicManagerReturnValue() { return LUA_V68_MUSICMANAGER_RETURN_VALUE | 0; }
export function luaEngineV68MusicManagerInstallCount() { return LUA_V68_MUSICMANAGER_INSTALL_COUNT | 0; }
export function luaEngineV68MusicManagerInstallVa() { return LUA_V68_MUSICMANAGER_INSTALL_VA >>> 0; }
export function luaEngineV68MusicManagerInstallRetVa() { return LUA_V68_MUSICMANAGER_INSTALL_RET_VA >>> 0; }
export function luaEngineV68MusicManagerInstallLiteralVa() { return LUA_V68_MUSICMANAGER_INSTALL_LITERAL_VA >>> 0; }
export function luaEngineV68MusicManagerInstallRealFnVa() { return LUA_V68_MUSICMANAGER_INSTALL_REAL_FN_VA >>> 0; }
export function luaEngineV68MusicManagerInstallNameVa() { return LUA_V68_MUSICMANAGER_INSTALL_NAME_VA >>> 0; }
export function luaEngineV68MusicManagerInstallCallerVa() { return LUA_V68_MUSICMANAGER_INSTALL_CALLER_VA >>> 0; }

export function luaEngineV68SfxManagerVa() { return LUA_V68_SFXMANAGER_VA >>> 0; }
export function luaEngineV68SfxManagerRetVa() { return LUA_V68_SFXMANAGER_RET_VA >>> 0; }
export function luaEngineV68SfxManagerBodyBytes() { return LUA_V68_SFXMANAGER_RET_VA - LUA_V68_SFXMANAGER_VA; }
export function luaEngineV68SfxManagerInsnCount() { return LUA_V68_SFXMANAGER_INSNS | 0; }
export function luaEngineV68SfxManagerTouserdataIndex() { return LUA_V68_SFXMANAGER_TOUSERDATA_INDEX_U32 >>> 0; }
export function luaEngineV68SfxManagerFnOff() { return LUA_V68_SFXMANAGER_FN_OFF >>> 0; }
export function luaEngineV68SfxManagerNewuserdataSize() { return LUA_V68_SFXMANAGER_NEWUSERDATA_SIZE >>> 0; }
export function luaEngineV68SfxManagerUdVtableVa() { return LUA_V68_SFXMANAGER_UD_VTABLE_VA >>> 0; }
export function luaEngineV68SfxManagerUdObjectOff() { return LUA_V68_SFXMANAGER_UD_OBJECT_OFF >>> 0; }
export function luaEngineV68SfxManagerRawgetpKey() { return LUA_V68_SFXMANAGER_RAWGETP_KEY >>> 0; }
export function luaEngineV68SfxManagerRegistryIndex() { return LUA_V68_SFXMANAGER_REGISTRY_INDEX_U32 >>> 0; }
export function luaEngineV68SfxManagerSetmetaIndex() { return LUA_V68_SFXMANAGER_SETMETA_INDEX_U32 >>> 0; }
export function luaEngineV68SfxManagerIatLuaTouserdata() { return LUA_V68_SFXMANAGER_IAT_LUA_TOUSERDATA >>> 0; }
export function luaEngineV68SfxManagerIatLuaNewuserdata() { return LUA_V68_SFXMANAGER_IAT_LUA_NEWUSERDATA >>> 0; }
export function luaEngineV68SfxManagerIatLuaRawgetp() { return LUA_V68_SFXMANAGER_IAT_LUA_RAWGETP >>> 0; }
export function luaEngineV68SfxManagerIatLuaSetmetatable() { return LUA_V68_SFXMANAGER_IAT_LUA_SETMETATABLE >>> 0; }
export function luaEngineV68SfxManagerReturnValue() { return LUA_V68_SFXMANAGER_RETURN_VALUE | 0; }
export function luaEngineV68SfxManagerInstallCount() { return LUA_V68_SFXMANAGER_INSTALL_COUNT | 0; }
export function luaEngineV68SfxManagerInstallVa() { return LUA_V68_SFXMANAGER_INSTALL_VA >>> 0; }
export function luaEngineV68SfxManagerInstallRetVa() { return LUA_V68_SFXMANAGER_INSTALL_RET_VA >>> 0; }
export function luaEngineV68SfxManagerInstallLiteralVa() { return LUA_V68_SFXMANAGER_INSTALL_LITERAL_VA >>> 0; }
export function luaEngineV68SfxManagerInstallRealFnVa() { return LUA_V68_SFXMANAGER_INSTALL_REAL_FN_VA >>> 0; }
export function luaEngineV68SfxManagerInstallNameVa() { return LUA_V68_SFXMANAGER_INSTALL_NAME_VA >>> 0; }
export function luaEngineV68SfxManagerInstallCallerVa() { return LUA_V68_SFXMANAGER_INSTALL_CALLER_VA >>> 0; }

export function luaEngineV68Game0Va() { return LUA_V68_GAME0_VA >>> 0; }
export function luaEngineV68Game0RetVa() { return LUA_V68_GAME0_RET_VA >>> 0; }
export function luaEngineV68Game0BodyBytes() { return LUA_V68_GAME0_RET_VA - LUA_V68_GAME0_VA; }
export function luaEngineV68Game0InsnCount() { return LUA_V68_GAME0_INSNS | 0; }
export function luaEngineV68Game0TouserdataIndex() { return LUA_V68_GAME0_TOUSERDATA_INDEX_U32 >>> 0; }
export function luaEngineV68Game0FnOff() { return LUA_V68_GAME0_FN_OFF >>> 0; }
export function luaEngineV68Game0NewuserdataSize() { return LUA_V68_GAME0_NEWUSERDATA_SIZE >>> 0; }
export function luaEngineV68Game0UdVtableVa() { return LUA_V68_GAME0_UD_VTABLE_VA >>> 0; }
export function luaEngineV68Game0UdObjectOff() { return LUA_V68_GAME0_UD_OBJECT_OFF >>> 0; }
export function luaEngineV68Game0RawgetpKey() { return LUA_V68_GAME0_RAWGETP_KEY >>> 0; }
export function luaEngineV68Game0RegistryIndex() { return LUA_V68_GAME0_REGISTRY_INDEX_U32 >>> 0; }
export function luaEngineV68Game0SetmetaIndex() { return LUA_V68_GAME0_SETMETA_INDEX_U32 >>> 0; }
export function luaEngineV68Game0IatLuaTouserdata() { return LUA_V68_GAME0_IAT_LUA_TOUSERDATA >>> 0; }
export function luaEngineV68Game0IatLuaNewuserdata() { return LUA_V68_GAME0_IAT_LUA_NEWUSERDATA >>> 0; }
export function luaEngineV68Game0IatLuaRawgetp() { return LUA_V68_GAME0_IAT_LUA_RAWGETP >>> 0; }
export function luaEngineV68Game0IatLuaSetmetatable() { return LUA_V68_GAME0_IAT_LUA_SETMETATABLE >>> 0; }
export function luaEngineV68Game0ReturnValue() { return LUA_V68_GAME0_RETURN_VALUE | 0; }
export function luaEngineV68Game0InstallCount() { return LUA_V68_GAME0_INSTALL_COUNT | 0; }
export function luaEngineV68Game0InstallVa() { return LUA_V68_GAME0_INSTALL_VA >>> 0; }
export function luaEngineV68Game0InstallRetVa() { return LUA_V68_GAME0_INSTALL_RET_VA >>> 0; }
export function luaEngineV68Game0InstallLiteralVa() { return LUA_V68_GAME0_INSTALL_LITERAL_VA >>> 0; }
export function luaEngineV68Game0InstallRealFnVa() { return LUA_V68_GAME0_INSTALL_REAL_FN_VA >>> 0; }
export function luaEngineV68Game0InstallNameVa() { return LUA_V68_GAME0_INSTALL_NAME_VA >>> 0; }
export function luaEngineV68Game0InstallCallerVa() { return LUA_V68_GAME0_INSTALL_CALLER_VA >>> 0; }

export function luaEngineV68RandomVectorVa() { return LUA_V68_RANDOMVECTOR_VA >>> 0; }
export function luaEngineV68RandomVectorRetVa() { return LUA_V68_RANDOMVECTOR_RET_VA >>> 0; }
export function luaEngineV68RandomVectorBodyBytes() { return LUA_V68_RANDOMVECTOR_RET_VA - LUA_V68_RANDOMVECTOR_VA; }
export function luaEngineV68RandomVectorInsnCount() { return LUA_V68_RANDOMVECTOR_INSNS | 0; }
export function luaEngineV68RandomVectorTouserdataIndex() { return LUA_V68_RANDOMVECTOR_TOUSERDATA_INDEX_U32 >>> 0; }
export function luaEngineV68RandomVectorFnOff() { return LUA_V68_RANDOMVECTOR_FN_OFF >>> 0; }
export function luaEngineV68RandomVectorNewuserdataSize() { return LUA_V68_RANDOMVECTOR_NEWUSERDATA_SIZE >>> 0; }
export function luaEngineV68RandomVectorUdVtableVa() { return LUA_V68_RANDOMVECTOR_UD_VTABLE_VA >>> 0; }
export function luaEngineV68RandomVectorUdPayloadOff() { return LUA_V68_RANDOMVECTOR_UD_PAYLOAD_OFF >>> 0; }
export function luaEngineV68RandomVectorRawgetpKey() { return LUA_V68_RANDOMVECTOR_RAWGETP_KEY >>> 0; }
export function luaEngineV68RandomVectorRegistryIndex() { return LUA_V68_RANDOMVECTOR_REGISTRY_INDEX_U32 >>> 0; }
export function luaEngineV68RandomVectorSetmetaIndex() { return LUA_V68_RANDOMVECTOR_SETMETA_INDEX_U32 >>> 0; }
export function luaEngineV68RandomVectorIatLuaTouserdata() { return LUA_V68_RANDOMVECTOR_IAT_LUA_TOUSERDATA >>> 0; }
export function luaEngineV68RandomVectorIatLuaNewuserdata() { return LUA_V68_RANDOMVECTOR_IAT_LUA_NEWUSERDATA >>> 0; }
export function luaEngineV68RandomVectorIatLuaRawgetp() { return LUA_V68_RANDOMVECTOR_IAT_LUA_RAWGETP >>> 0; }
export function luaEngineV68RandomVectorIatLuaSetmetatable() { return LUA_V68_RANDOMVECTOR_IAT_LUA_SETMETATABLE >>> 0; }
export function luaEngineV68RandomVectorReturnValue() { return LUA_V68_RANDOMVECTOR_RETURN_VALUE | 0; }
export function luaEngineV68RandomVectorInstallCount() { return LUA_V68_RANDOMVECTOR_INSTALL_COUNT | 0; }
export function luaEngineV68RandomVectorInstallVa() { return LUA_V68_RANDOMVECTOR_INSTALL_VA >>> 0; }
export function luaEngineV68RandomVectorInstallRetVa() { return LUA_V68_RANDOMVECTOR_INSTALL_RET_VA >>> 0; }
export function luaEngineV68RandomVectorInstallLiteralVa() { return LUA_V68_RANDOMVECTOR_INSTALL_LITERAL_VA >>> 0; }
export function luaEngineV68RandomVectorInstallRealFnVa() { return LUA_V68_RANDOMVECTOR_INSTALL_REAL_FN_VA >>> 0; }
export function luaEngineV68RandomVectorInstallNameVa() { return LUA_V68_RANDOMVECTOR_INSTALL_NAME_VA >>> 0; }
export function luaEngineV68RandomVectorInstallCallerVa() { return LUA_V68_RANDOMVECTOR_INSTALL_CALLER_VA >>> 0; }

export function luaEngineV68GetRoomEntitiesVa() { return LUA_V68_GETROOMENTITIES_VA >>> 0; }
export function luaEngineV68GetRoomEntitiesRetVa() { return LUA_V68_GETROOMENTITIES_RET_VA >>> 0; }
export function luaEngineV68GetRoomEntitiesBodyBytes() { return LUA_V68_GETROOMENTITIES_RET_VA - LUA_V68_GETROOMENTITIES_VA; }
export function luaEngineV68GetRoomEntitiesInsnCount() { return LUA_V68_GETROOMENTITIES_INSNS | 0; }
export function luaEngineV68GetRoomEntitiesTouserdataIndex() { return LUA_V68_GETROOMENTITIES_TOUSERDATA_INDEX_U32 >>> 0; }
export function luaEngineV68GetRoomEntitiesFnOff() { return LUA_V68_GETROOMENTITIES_FN_OFF >>> 0; }
export function luaEngineV68GetRoomEntitiesRawgetiHelperVa() { return LUA_V68_GETROOMENTITIES_RAWGETI_HELPER_VA >>> 0; }
export function luaEngineV68GetRoomEntitiesRegistryIndex() { return LUA_V68_GETROOMENTITIES_REGISTRY_INDEX_U32 >>> 0; }
export function luaEngineV68GetRoomEntitiesVecOffLo() { return LUA_V68_GETROOMENTITIES_VEC_OFF_LO_U32 >>> 0; }
export function luaEngineV68GetRoomEntitiesVecOffRef() { return LUA_V68_GETROOMENTITIES_VEC_OFF_REF_U32 >>> 0; }
export function luaEngineV68GetRoomEntitiesIatLuaTouserdata() { return LUA_V68_GETROOMENTITIES_IAT_LUA_TOUSERDATA >>> 0; }
export function luaEngineV68GetRoomEntitiesIatLuaLualUnref() { return LUA_V68_GETROOMENTITIES_IAT_LUA_LUAL_UNREF >>> 0; }
export function luaEngineV68GetRoomEntitiesReturnValue() { return LUA_V68_GETROOMENTITIES_RETURN_VALUE | 0; }
export function luaEngineV68GetRoomEntitiesInstallCount() { return LUA_V68_GETROOMENTITIES_INSTALL_COUNT | 0; }
export function luaEngineV68GetRoomEntitiesInstallVa() { return LUA_V68_GETROOMENTITIES_INSTALL_VA >>> 0; }
export function luaEngineV68GetRoomEntitiesInstallRetVa() { return LUA_V68_GETROOMENTITIES_INSTALL_RET_VA >>> 0; }
export function luaEngineV68GetRoomEntitiesInstallLiteralVa() { return LUA_V68_GETROOMENTITIES_INSTALL_LITERAL_VA >>> 0; }
export function luaEngineV68GetRoomEntitiesInstallRealFnVa() { return LUA_V68_GETROOMENTITIES_INSTALL_REAL_FN_VA >>> 0; }
export function luaEngineV68GetRoomEntitiesInstallNameVa() { return LUA_V68_GETROOMENTITIES_INSTALL_NAME_VA >>> 0; }
export function luaEngineV68GetRoomEntitiesInstallCallerVa() { return LUA_V68_GETROOMENTITIES_INSTALL_CALLER_VA >>> 0; }
/* ---- ABI v69: the 13 remaining fourth-region wrapper bodies 0x897a10..
 * 0x8b91c0 (SEH string trio + Spawn/GridSpawn/RenderText/ExecuteCommand/
 * GetPlayerTypeByName + UpdateStrangeAttractor + mod-data band), landed
 * together under ABI 69. See header ABI v69 block + lua-v69-8b9b20 notes.
 * Shared: direct-ud shape (touserdata 0xfff0b9d7, FN_OFF 0, no type gate),
 * uint32 gates. SEH spines exported as glue. Installers: 0x60-stride ret-8
 * blocks. ------------------------------------------------------------------ */
export const LUA_V69_GETBYNAME_VA = 0x008983e0; /* Get*ByName x11 (GetEntityTypeByName .. GetMusicIdByName) */
export const LUA_V69_GETBYNAME_RET_VA = 0x00898483;
export const LUA_V69_GETBYNAME_INSNS = 56;
export const LUA_V69_GETBYNAME_TOUSERDATA_INDEX_U32 = 0xfff0b9d7;
export const LUA_V69_GETBYNAME_FN_OFF = 0x00;
export const LUA_V69_GETBYNAME_IAT_LUA_TOUSERDATA = 0x00b183b0;
export const LUA_V69_GETBYNAME_SEH_HANDLER_VA = 0x00b051e5;
export const LUA_V69_GETBYNAME_CHECK_STRING_BUILDER_VA = 0x008b9ff0; /* host pin */
export const LUA_V69_GETBYNAME_STRING_COPY_CTOR_VA = 0x0040cf50; /* host */
export const LUA_V69_GETBYNAME_STRING_DTOR_VA = 0x0040d040; /* host */
export const LUA_V69_GETBYNAME_REAL_FN_ARG_COUNT = 0x00000001;
export const LUA_V69_GETBYNAME_REAL_FN_CLEANUP = 0x00000004;
export const LUA_V69_GETBYNAME_PUSHER_VA = 0x0085bfd0; /* ROW 3 */
export const LUA_V69_GETBYNAME_PUSHER_ROW = 0x00000003;
export const LUA_V69_GETBYNAME_RETURN_VALUE = 1;
export const LUA_V69_GETBYNAME_INSTALL_COUNT = 11;
export const LUA_V69_GETBYNAME_INSTALL_VA = 0x00896210;
export const LUA_V69_GETBYNAME_INSTALL_RET_VA = 0x00896269;
export const LUA_V69_GETBYNAME_INSTALL_LITERAL_VA = 0x00896227;
export const LUA_V69_GETBYNAME_INSTALL_REAL_FN_VA = 0x0086f520; /* HOST */
export const LUA_V69_GETBYNAME_INSTALL_NAME_VA = 0x00b74d94;
export const LUA_V69_GETBYNAME_INSTALL_CALLER_VA = 0x0086de68;

export const LUA_V69_GETTEXTWIDTH_VA = 0x00899440; /* GetTextWidth/String2Seed (same template, pusher ROW 1) */
export const LUA_V69_GETTEXTWIDTH_RET_VA = 0x008994e3;
export const LUA_V69_GETTEXTWIDTH_INSNS = 55;
export const LUA_V69_GETTEXTWIDTH_TOUSERDATA_INDEX_U32 = 0xfff0b9d7;
export const LUA_V69_GETTEXTWIDTH_FN_OFF = 0x00;
export const LUA_V69_GETTEXTWIDTH_IAT_LUA_TOUSERDATA = 0x00b183b0;
export const LUA_V69_GETTEXTWIDTH_SEH_HANDLER_VA = 0x00b051e5;
export const LUA_V69_GETTEXTWIDTH_CHECK_STRING_BUILDER_VA = 0x008b9ff0; /* host pin */
export const LUA_V69_GETTEXTWIDTH_STRING_COPY_CTOR_VA = 0x0040cf50; /* host */
export const LUA_V69_GETTEXTWIDTH_STRING_DTOR_VA = 0x0040d040; /* host */
export const LUA_V69_GETTEXTWIDTH_REAL_FN_ARG_COUNT = 0x00000001;
export const LUA_V69_GETTEXTWIDTH_REAL_FN_CLEANUP = 0x00000004;
export const LUA_V69_GETTEXTWIDTH_PUSHER_VA = 0x0085bff0; /* ROW 1 */
export const LUA_V69_GETTEXTWIDTH_PUSHER_ROW = 0x00000001;
export const LUA_V69_GETTEXTWIDTH_RETURN_VALUE = 1;
export const LUA_V69_GETTEXTWIDTH_INSTALL_COUNT = 2;
export const LUA_V69_GETTEXTWIDTH_INSTALL_A_VA = 0x00896030;
export const LUA_V69_GETTEXTWIDTH_INSTALL_A_RET_VA = 0x00896088;
export const LUA_V69_GETTEXTWIDTH_INSTALL_A_LITERAL_VA = 0x00896041;
export const LUA_V69_GETTEXTWIDTH_INSTALL_A_REAL_FN_VA = 0x0086f370; /* HOST */
export const LUA_V69_GETTEXTWIDTH_INSTALL_A_NAME_VA = 0x00b74dcc;
export const LUA_V69_GETTEXTWIDTH_INSTALL_A_CALLER_VA = 0x0086ddf1;
export const LUA_V69_GETTEXTWIDTH_INSTALL_B_VA = 0x00892f80;
export const LUA_V69_GETTEXTWIDTH_INSTALL_B_RET_VA = 0x00892fd8;
export const LUA_V69_GETTEXTWIDTH_INSTALL_B_LITERAL_VA = 0x00892f91;
export const LUA_V69_GETTEXTWIDTH_INSTALL_B_REAL_FN_VA = 0x009eb6b0; /* HOST */
export const LUA_V69_GETTEXTWIDTH_INSTALL_B_NAME_VA = 0x00b74418;
export const LUA_V69_GETTEXTWIDTH_INSTALL_B_CALLER_VA = 0x0086d067;

export const LUA_V69_DEBUGSTRING_VA = 0x00898cf0; /* DebugString/ConsoleOutput (same template, NO pusher) */
export const LUA_V69_DEBUGSTRING_RET_VA = 0x00898d85;
export const LUA_V69_DEBUGSTRING_INSNS = 51;
export const LUA_V69_DEBUGSTRING_TOUSERDATA_INDEX_U32 = 0xfff0b9d7;
export const LUA_V69_DEBUGSTRING_FN_OFF = 0x00;
export const LUA_V69_DEBUGSTRING_IAT_LUA_TOUSERDATA = 0x00b183b0;
export const LUA_V69_DEBUGSTRING_SEH_HANDLER_VA = 0x00b051e5;
export const LUA_V69_DEBUGSTRING_CHECK_STRING_BUILDER_VA = 0x008b9ff0; /* host pin */
export const LUA_V69_DEBUGSTRING_STRING_COPY_CTOR_VA = 0x0040cf50; /* host */
export const LUA_V69_DEBUGSTRING_STRING_DTOR_VA = 0x0040d040; /* host */
export const LUA_V69_DEBUGSTRING_REAL_FN_ARG_COUNT = 0x00000001;
export const LUA_V69_DEBUGSTRING_REAL_FN_CLEANUP = 0x00000004;
export const LUA_V69_DEBUGSTRING_PUSHER_VA = 0x00000000; /* ROW 4294967295 */
export const LUA_V69_DEBUGSTRING_PUSHER_ROW = 0xffffffff;
export const LUA_V69_DEBUGSTRING_RETURN_VALUE = 0;
export const LUA_V69_DEBUGSTRING_INSTALL_COUNT = 2;
export const LUA_V69_DEBUGSTRING_INSTALL_A_VA = 0x00895df0;
export const LUA_V69_DEBUGSTRING_INSTALL_A_RET_VA = 0x00895e49;
export const LUA_V69_DEBUGSTRING_INSTALL_A_LITERAL_VA = 0x00895e07;
export const LUA_V69_DEBUGSTRING_INSTALL_A_REAL_FN_VA = 0x0086ef30; /* HOST */
export const LUA_V69_DEBUGSTRING_INSTALL_A_NAME_VA = 0x00b74d10;
export const LUA_V69_DEBUGSTRING_INSTALL_A_CALLER_VA = 0x0086dd7a;
export const LUA_V69_DEBUGSTRING_INSTALL_B_VA = 0x00895df0;
export const LUA_V69_DEBUGSTRING_INSTALL_B_RET_VA = 0x00895e49;
export const LUA_V69_DEBUGSTRING_INSTALL_B_LITERAL_VA = 0x00895e07;
export const LUA_V69_DEBUGSTRING_INSTALL_B_REAL_FN_VA = 0x00870130; /* HOST */
export const LUA_V69_DEBUGSTRING_INSTALL_B_NAME_VA = 0x00b74edc;
export const LUA_V69_DEBUGSTRING_INSTALL_B_CALLER_VA = 0x0086df56;

export const LUA_V69_EXECUTECOMMAND_VA = 0x008981b0; /* ExecuteCommand (pushlstring tail) */
export const LUA_V69_EXECUTECOMMAND_RET_VA = 0x0089829b;
export const LUA_V69_EXECUTECOMMAND_INSNS = 80;
export const LUA_V69_EXECUTECOMMAND_TOUSERDATA_INDEX_U32 = 0xfff0b9d7;
export const LUA_V69_EXECUTECOMMAND_FN_OFF = 0x00;
export const LUA_V69_EXECUTECOMMAND_IAT_LUA_TOUSERDATA = 0x00b183b0;
export const LUA_V69_EXECUTECOMMAND_SEH_HANDLER_VA = 0x00b05155;
export const LUA_V69_EXECUTECOMMAND_CHECK_STRING_BUILDER_VA = 0x008b9ff0; /* host pin */
export const LUA_V69_EXECUTECOMMAND_STRING_COPY_CTOR_VA = 0x0040cf50; /* host */
export const LUA_V69_EXECUTECOMMAND_STRING_DTOR_VA = 0x0040d040; /* host */
export const LUA_V69_EXECUTECOMMAND_REAL_FN_ARG_COUNT = 0x00000002;
export const LUA_V69_EXECUTECOMMAND_REAL_FN_CLEANUP = 0x00000008;
export const LUA_V69_EXECUTECOMMAND_IAT_LUA_PUSHLSTRING = 0x00b183dc; /* lua_pushlstring */
export const LUA_V69_EXECUTECOMMAND_SSO_CAP_U32 = 0x00000010;
export const LUA_V69_EXECUTECOMMAND_RETURN_VALUE = 1;
export const LUA_V69_EXECUTECOMMAND_INSTALL_COUNT = 1;
export const LUA_V69_EXECUTECOMMAND_INSTALL_VA = 0x008962d0;
export const LUA_V69_EXECUTECOMMAND_INSTALL_RET_VA = 0x00896328;
export const LUA_V69_EXECUTECOMMAND_INSTALL_LITERAL_VA = 0x008962e1;
export const LUA_V69_EXECUTECOMMAND_INSTALL_REAL_FN_VA = 0x00870020; /* HOST */
export const LUA_V69_EXECUTECOMMAND_INSTALL_NAME_VA = 0x00b74ecc;
export const LUA_V69_EXECUTECOMMAND_INSTALL_CALLER_VA = 0x0086df45;

export const LUA_V69_GETPLAYERTYPEBYNAME_VA = 0x008982a0; /* GetPlayerTypeByName (bool lane + ROW 3) */
export const LUA_V69_GETPLAYERTYPEBYNAME_RET_VA = 0x008983de;
export const LUA_V69_GETPLAYERTYPEBYNAME_INSNS = 100;
export const LUA_V69_GETPLAYERTYPEBYNAME_TOUSERDATA_INDEX_U32 = 0xfff0b9d7;
export const LUA_V69_GETPLAYERTYPEBYNAME_FN_OFF = 0x00;
export const LUA_V69_GETPLAYERTYPEBYNAME_IAT_LUA_TOUSERDATA = 0x00b183b0;
export const LUA_V69_GETPLAYERTYPEBYNAME_SEH_HANDLER_VA = 0x00b0519d;
export const LUA_V69_GETPLAYERTYPEBYNAME_CHECKLSTRING_IAT_VA = 0x00b183e4; /* luaL_checklstring */
export const LUA_V69_GETPLAYERTYPEBYNAME_CHECKLSTRING_INDEX_U32 = 0x00000001;
export const LUA_V69_GETPLAYERTYPEBYNAME_STRING_ASSIGN_VA = 0x0040ccd0; /* host */
export const LUA_V69_GETPLAYERTYPEBYNAME_TOBOOLEAN_IAT_VA = 0x00b183e8; /* lua_toboolean */
export const LUA_V69_GETPLAYERTYPEBYNAME_TOBOOLEAN_INDEX_U32 = 0x00000002;
export const LUA_V69_GETPLAYERTYPEBYNAME_BYTE_GATE_OFF_U32 = 0xffffffba; /* ebp-0x46 */
export const LUA_V69_GETPLAYERTYPEBYNAME_WORD_SLOT_OFF_U32 = 0xfffffff4; /* ebp-0x2c */
export const LUA_V69_GETPLAYERTYPEBYNAME_PUSHER_VA = 0x0085bfd0; /* ROW 3 */
export const LUA_V69_GETPLAYERTYPEBYNAME_PUSHER_ROW = 0x00000003;
export const LUA_V69_GETPLAYERTYPEBYNAME_COPY_CTOR_VA = 0x0040cf50; /* host */
export const LUA_V69_GETPLAYERTYPEBYNAME_DTOR_VA = 0x0040d040; /* host */
export const LUA_V69_GETPLAYERTYPEBYNAME_REAL_FN_ARG_COUNT = 0x00000002;
export const LUA_V69_GETPLAYERTYPEBYNAME_REAL_FN_CLEANUP = 0x00000008;
export const LUA_V69_GETPLAYERTYPEBYNAME_RETURN_VALUE = 1;
export const LUA_V69_GETPLAYERTYPEBYNAME_INSTALL_COUNT = 1;
export const LUA_V69_GETPLAYERTYPEBYNAME_INSTALL_VA = 0x00896270;
export const LUA_V69_GETPLAYERTYPEBYNAME_INSTALL_RET_VA = 0x008962c8;
export const LUA_V69_GETPLAYERTYPEBYNAME_INSTALL_LITERAL_VA = 0x00896281;
export const LUA_V69_GETPLAYERTYPEBYNAME_INSTALL_REAL_FN_VA = 0x0086f760; /* HOST */
export const LUA_V69_GETPLAYERTYPEBYNAME_INSTALL_NAME_VA = 0x00b74e6c;
export const LUA_V69_GETPLAYERTYPEBYNAME_INSTALL_CALLER_VA = 0x0086de9b;

export const LUA_V69_SPAWN_VA = 0x00898c00; /* Spawn (6-arg builder + entity wrap) */
export const LUA_V69_SPAWN_RET_VA = 0x00898cc8;
export const LUA_V69_SPAWN_INSNS = 82;
export const LUA_V69_SPAWN_TOUSERDATA_INDEX_U32 = 0xfff0b9d7;
export const LUA_V69_SPAWN_FN_OFF = 0x00;
export const LUA_V69_SPAWN_IAT_LUA_TOUSERDATA = 0x00b183b0;
export const LUA_V69_SPAWN_BUILDER_VA = 0x008b9ee0; /* host pin */
export const LUA_V69_SPAWN_REAL_FN_ARG_COUNT = 0x00000006;
export const LUA_V69_SPAWN_REAL_FN_CLEANUP = 0x00000018;
export const LUA_V69_SPAWN_NEWUSERDATA_SIZE = 0x00000008;
export const LUA_V69_SPAWN_UD_VTABLE_VA = 0x00b753c8;
export const LUA_V69_SPAWN_UD_OBJECT_OFF = 0x00000004;
export const LUA_V69_SPAWN_RAWGETP_KEY = 0x00c8297a;
export const LUA_V69_SPAWN_REGISTRY_INDEX_U32 = 0xfff0b9d8;
export const LUA_V69_SPAWN_SETMETA_INDEX_U32 = 0xfffffffe;
export const LUA_V69_SPAWN_IAT_LUA_NEWUSERDATA = 0x00b1839c;
export const LUA_V69_SPAWN_IAT_LUA_RAWGETP = 0x00b183bc;
export const LUA_V69_SPAWN_IAT_LUA_SETMETATABLE = 0x00b18398;
export const LUA_V69_SPAWN_IAT_LUA_PUSHNIL = 0x00b183e0; /* lua_pushnil */
export const LUA_V69_SPAWN_RETURN_VALUE = 1;
export const LUA_V69_SPAWN_INSTALL_COUNT = 1;
export const LUA_V69_SPAWN_INSTALL_VA = 0x00895eb0;
export const LUA_V69_SPAWN_INSTALL_RET_VA = 0x00895f08;
export const LUA_V69_SPAWN_INSTALL_LITERAL_VA = 0x00895ec1;
export const LUA_V69_SPAWN_INSTALL_REAL_FN_VA = 0x0086f0a0; /* HOST */
export const LUA_V69_SPAWN_INSTALL_NAME_VA = 0x00b1de50;
export const LUA_V69_SPAWN_INSTALL_CALLER_VA = 0x0086ddad;

export const LUA_V69_GRIDSPAWN_VA = 0x00898ae0; /* GridSpawn (bool+ints+vec2, key 0xc82a1e) */
export const LUA_V69_GRIDSPAWN_RET_VA = 0x00898be5;
export const LUA_V69_GRIDSPAWN_INSNS = 98;
export const LUA_V69_GRIDSPAWN_TOUSERDATA_INDEX_U32 = 0xfff0b9d7;
export const LUA_V69_GRIDSPAWN_FN_OFF = 0x00;
export const LUA_V69_GRIDSPAWN_IAT_LUA_TOUSERDATA = 0x00b183b0;
export const LUA_V69_GRIDSPAWN_TOBOOLEAN_IAT_VA = 0x00b183e8; /* lua_toboolean */
export const LUA_V69_GRIDSPAWN_TOBOOLEAN_INDEX_U32 = 0x00000004;
export const LUA_V69_GRIDSPAWN_CHECKINTEGER_IAT_VA = 0x00b183f4; /* luaL_checkinteger */
export const LUA_V69_GRIDSPAWN_ARG1_CHECKINTEGER_INDEX_U32 = 0x00000001;
export const LUA_V69_GRIDSPAWN_ARG2_CHECKINTEGER_INDEX_U32 = 0x00000002;
export const LUA_V69_GRIDSPAWN_GETARGOBJECT_VA = 0x008baa50; /* 0x8baa50 host */
export const LUA_V69_GRIDSPAWN_GETARGOBJECT_ARG_INDEX_U32 = 0x00000003;
export const LUA_V69_GRIDSPAWN_REAL_FN_ARG_COUNT = 0x00000004;
export const LUA_V69_GRIDSPAWN_REAL_FN_CLEANUP = 0x00000030;
export const LUA_V69_GRIDSPAWN_NEWUSERDATA_SIZE = 0x00000008;
export const LUA_V69_GRIDSPAWN_UD_VTABLE_VA = 0x00b753c8;
export const LUA_V69_GRIDSPAWN_UD_OBJECT_OFF = 0x00000004;
export const LUA_V69_GRIDSPAWN_RAWGETP_KEY = 0x00c82a1e;
export const LUA_V69_GRIDSPAWN_REGISTRY_INDEX_U32 = 0xfff0b9d8;
export const LUA_V69_GRIDSPAWN_SETMETA_INDEX_U32 = 0xfffffffe;
export const LUA_V69_GRIDSPAWN_IAT_LUA_NEWUSERDATA = 0x00b1839c;
export const LUA_V69_GRIDSPAWN_IAT_LUA_RAWGETP = 0x00b183bc;
export const LUA_V69_GRIDSPAWN_IAT_LUA_SETMETATABLE = 0x00b18398;
export const LUA_V69_GRIDSPAWN_IAT_LUA_PUSHNIL = 0x00b183e0; /* lua_pushnil */
export const LUA_V69_GRIDSPAWN_RETURN_VALUE = 1;
export const LUA_V69_GRIDSPAWN_INSTALL_COUNT = 1;
export const LUA_V69_GRIDSPAWN_INSTALL_VA = 0x00895f10;
export const LUA_V69_GRIDSPAWN_INSTALL_RET_VA = 0x00895f68;
export const LUA_V69_GRIDSPAWN_INSTALL_LITERAL_VA = 0x00895f21;
export const LUA_V69_GRIDSPAWN_INSTALL_REAL_FN_VA = 0x0086f0d0; /* HOST */
export const LUA_V69_GRIDSPAWN_INSTALL_NAME_VA = 0x00b74d1c;
export const LUA_V69_GRIDSPAWN_INSTALL_CALLER_VA = 0x0086ddbe;

export const LUA_V69_RENDERTEXT_VA = 0x00898890; /* RenderText (str + 6 float lanes, ret 0) */
export const LUA_V69_RENDERTEXT_RET_VA = 0x00898ad2;
export const LUA_V69_RENDERTEXT_INSNS = 155;
export const LUA_V69_RENDERTEXT_TOUSERDATA_INDEX_U32 = 0xfff0b9d7;
export const LUA_V69_RENDERTEXT_FN_OFF = 0x00;
export const LUA_V69_RENDERTEXT_IAT_LUA_TOUSERDATA = 0x00b183b0;
export const LUA_V69_RENDERTEXT_SEH_HANDLER_VA = 0x00b05280;
export const LUA_V69_RENDERTEXT_CHECKLSTRING_IAT_VA = 0x00b183e4; /* luaL_checklstring */
export const LUA_V69_RENDERTEXT_CHECKLSTRING_INDEX_U32 = 0x00000001;
export const LUA_V69_RENDERTEXT_STRING_ASSIGN_VA = 0x0040ccd0; /* host */
export const LUA_V69_RENDERTEXT_COPY_CTOR_VA = 0x0040cf50; /* host */
export const LUA_V69_RENDERTEXT_DTOR_VA = 0x0040d040; /* host */
export const LUA_V69_RENDERTEXT_REAL_FN_ARG_COUNT = 0x00000007;
export const LUA_V69_RENDERTEXT_REAL_FN_CLEANUP = 0x0000001c;
export const LUA_V69_RENDERTEXT_CHECKNUMBER_IAT_VA = 0x00b18324; /* luaL_checknumber float lane */
export const LUA_V69_RENDERTEXT_FLOAT_LANE_FIRST_INDEX_U32 = 0x00000002;
export const LUA_V69_RENDERTEXT_FLOAT_LANE_COUNT = 0x00000006;
export const LUA_V69_RENDERTEXT_RETURN_VALUE = 0;
export const LUA_V69_RENDERTEXT_INSTALL_COUNT = 1;
export const LUA_V69_RENDERTEXT_INSTALL_VA = 0x00895f70;
export const LUA_V69_RENDERTEXT_INSTALL_RET_VA = 0x00895fc8;
export const LUA_V69_RENDERTEXT_INSTALL_LITERAL_VA = 0x00895f81;
export const LUA_V69_RENDERTEXT_INSTALL_REAL_FN_VA = 0x0086f1b0; /* HOST */
export const LUA_V69_RENDERTEXT_INSTALL_NAME_VA = 0x00b74cf0;
export const LUA_V69_RENDERTEXT_INSTALL_CALLER_VA = 0x0086ddcf;

export const LUA_V69_UPDATESTRANGEATTRACTOR_VA = 0x008b90e0; /* UpdateStrangeAttractor (check helper + float lanes) */
export const LUA_V69_UPDATESTRANGEATTRACTOR_RET_VA = 0x008b91c0;
export const LUA_V69_UPDATESTRANGEATTRACTOR_INSNS = 74;
export const LUA_V69_UPDATESTRANGEATTRACTOR_TOUSERDATA_INDEX_U32 = 0xfff0b9d7;
export const LUA_V69_UPDATESTRANGEATTRACTOR_FN_OFF = 0x00;
export const LUA_V69_UPDATESTRANGEATTRACTOR_IAT_LUA_TOUSERDATA = 0x00b183b0;
export const LUA_V69_UPDATESTRANGEATTRACTOR_CHECK_HELPER_VA = 0x0085c590; /* 0x85c590 host */
export const LUA_V69_UPDATESTRANGEATTRACTOR_ARG1_CHECK_EDX_U32 = 0x00000001;
export const LUA_V69_UPDATESTRANGEATTRACTOR_ARG1_CHECK_KEY = 0x00c82a13; /* Game class key */
export const LUA_V69_UPDATESTRANGEATTRACTOR_GETARGOBJECT_VA = 0x008baa50; /* 0x8baa50 host */
export const LUA_V69_UPDATESTRANGEATTRACTOR_ARG2_GETARGOBJECT_ARG_INDEX_U32 = 0x00000002;
export const LUA_V69_UPDATESTRANGEATTRACTOR_CHECKNUMBER_IAT_VA = 0x00b18324; /* luaL_checknumber float lane */
export const LUA_V69_UPDATESTRANGEATTRACTOR_ARG3_LANE_INDEX_U32 = 0x00000003;
export const LUA_V69_UPDATESTRANGEATTRACTOR_ARG4_LANE_INDEX_U32 = 0x00000004;
export const LUA_V69_UPDATESTRANGEATTRACTOR_REAL_FN_ARG_COUNT = 0x00000003;
export const LUA_V69_UPDATESTRANGEATTRACTOR_REAL_FN_CLEANUP = 0x00000000; /* frame-reset discard */
export const LUA_V69_UPDATESTRANGEATTRACTOR_RETURN_VALUE = 0;
export const LUA_V69_UPDATESTRANGEATTRACTOR_INSTALL_COUNT = 1;
export const LUA_V69_UPDATESTRANGEATTRACTOR_INSTALL_VA = 0x008950d0;
export const LUA_V69_UPDATESTRANGEATTRACTOR_INSTALL_RET_VA = 0x00895126;
export const LUA_V69_UPDATESTRANGEATTRACTOR_INSTALL_LITERAL_VA = 0x008950e2;
export const LUA_V69_UPDATESTRANGEATTRACTOR_INSTALL_REAL_FN_VA = 0x0085e390; /* HOST */
export const LUA_V69_UPDATESTRANGEATTRACTOR_INSTALL_NAME_VA = 0x00b74b40;
export const LUA_V69_UPDATESTRANGEATTRACTOR_INSTALL_CALLER_VA = 0x0086d9bb;

export const LUA_V69_REMOVEMODDATA_VA = 0x00897a10; /* RemoveModData (ref-pair + unrefs, ret 0) */
export const LUA_V69_REMOVEMODDATA_RET_VA = 0x00897af2;
export const LUA_V69_REMOVEMODDATA_INSNS = 79;
export const LUA_V69_REMOVEMODDATA_TOUSERDATA_INDEX_U32 = 0xfff0b9d7;
export const LUA_V69_REMOVEMODDATA_FN_OFF = 0x00;
export const LUA_V69_REMOVEMODDATA_IAT_LUA_TOUSERDATA = 0x00b183b0;
export const LUA_V69_REMOVEMODDATA_SEH_HANDLER_VA = 0x00b04ff5;
export const LUA_V69_REMOVEMODDATA_BUILDER_VA = 0x008ba0c0; /* host pin */
export const LUA_V69_REMOVEMODDATA_RAWGETI_HELPER_VA = 0x006a80f0; /* shared 18-caller host helper */
export const LUA_V69_REMOVEMODDATA_LUAL_REF_IAT_VA = 0x00b18314; /* luaL_ref */
export const LUA_V69_REMOVEMODDATA_LUAL_UNREF_IAT_VA = 0x00b1831c; /* luaL_unref */
export const LUA_V69_REMOVEMODDATA_REGISTRY_INDEX_U32 = 0xfff0b9d8;
export const LUA_V69_REMOVEMODDATA_REFNIL_U32 = 0xffffffff; /* LUA_REFNIL */
export const LUA_V69_REMOVEMODDATA_REAL_FN_ARG_COUNT = 0x00000002;
export const LUA_V69_REMOVEMODDATA_REAL_FN_CLEANUP = 0x00000020; /* final stack cleanup */
export const LUA_V69_REMOVEMODDATA_RETURN_VALUE = 0;
export const LUA_V69_REMOVEMODDATA_INSTALL_COUNT = 1;
export const LUA_V69_REMOVEMODDATA_INSTALL_VA = 0x008965d0;
export const LUA_V69_REMOVEMODDATA_INSTALL_RET_VA = 0x00896628;
export const LUA_V69_REMOVEMODDATA_INSTALL_LITERAL_VA = 0x008965e1;
export const LUA_V69_REMOVEMODDATA_INSTALL_REAL_FN_VA = 0x00871c10; /* HOST */
export const LUA_V69_REMOVEMODDATA_INSTALL_NAME_VA = 0x00b74ffc;
export const LUA_V69_REMOVEMODDATA_INSTALL_CALLER_VA = 0x0086e033;

export const LUA_V69_HASHMODDATA_VA = 0x00897b00; /* HasModData (byte gate pushboolean) */
export const LUA_V69_HASHMODDATA_RET_VA = 0x00897bfe;
export const LUA_V69_HASHMODDATA_INSNS = 90;
export const LUA_V69_HASHMODDATA_TOUSERDATA_INDEX_U32 = 0xfff0b9d7;
export const LUA_V69_HASHMODDATA_FN_OFF = 0x00;
export const LUA_V69_HASHMODDATA_IAT_LUA_TOUSERDATA = 0x00b183b0;
export const LUA_V69_HASHMODDATA_SEH_HANDLER_VA = 0x00b04ff5;
export const LUA_V69_HASHMODDATA_BUILDER_VA = 0x008ba0c0; /* host pin */
export const LUA_V69_HASHMODDATA_RAWGETI_HELPER_VA = 0x006a80f0; /* shared 18-caller host helper */
export const LUA_V69_HASHMODDATA_LUAL_REF_IAT_VA = 0x00b18314; /* luaL_ref */
export const LUA_V69_HASHMODDATA_LUAL_UNREF_IAT_VA = 0x00b1831c; /* luaL_unref */
export const LUA_V69_HASHMODDATA_REGISTRY_INDEX_U32 = 0xfff0b9d8;
export const LUA_V69_HASHMODDATA_REFNIL_U32 = 0xffffffff; /* LUA_REFNIL */
export const LUA_V69_HASHMODDATA_REAL_FN_ARG_COUNT = 0x00000002;
export const LUA_V69_HASHMODDATA_REAL_FN_CLEANUP = 0x00000028; /* final stack cleanup */
export const LUA_V69_HASHMODDATA_IAT_LUA_PUSHBOOLEAN = 0x00b183ec; /* lua_pushboolean */
export const LUA_V69_HASHMODDATA_RETURN_VALUE = 1;
export const LUA_V69_HASHMODDATA_INSTALL_COUNT = 1;
export const LUA_V69_HASHMODDATA_INSTALL_VA = 0x00896570;
export const LUA_V69_HASHMODDATA_INSTALL_RET_VA = 0x008965c8;
export const LUA_V69_HASHMODDATA_INSTALL_LITERAL_VA = 0x00896581;
export const LUA_V69_HASHMODDATA_INSTALL_REAL_FN_VA = 0x00871980; /* HOST */
export const LUA_V69_HASHMODDATA_INSTALL_NAME_VA = 0x00b74f14;
export const LUA_V69_HASHMODDATA_INSTALL_CALLER_VA = 0x0086e022;

export const LUA_V69_LOADMODDATA_VA = 0x00897c00; /* LoadModData (pushlstring tail) */
export const LUA_V69_LOADMODDATA_RET_VA = 0x00897d4d;
export const LUA_V69_LOADMODDATA_INSNS = 115;
export const LUA_V69_LOADMODDATA_TOUSERDATA_INDEX_U32 = 0xfff0b9d7;
export const LUA_V69_LOADMODDATA_FN_OFF = 0x00;
export const LUA_V69_LOADMODDATA_IAT_LUA_TOUSERDATA = 0x00b183b0;
export const LUA_V69_LOADMODDATA_SEH_HANDLER_VA = 0x00b05035;
export const LUA_V69_LOADMODDATA_BUILDER_VA = 0x008ba0c0; /* host pin */
export const LUA_V69_LOADMODDATA_RAWGETI_HELPER_VA = 0x006a80f0; /* shared 18-caller host helper */
export const LUA_V69_LOADMODDATA_LUAL_REF_IAT_VA = 0x00b18314; /* luaL_ref */
export const LUA_V69_LOADMODDATA_LUAL_UNREF_IAT_VA = 0x00b1831c; /* luaL_unref */
export const LUA_V69_LOADMODDATA_REGISTRY_INDEX_U32 = 0xfff0b9d8;
export const LUA_V69_LOADMODDATA_REFNIL_U32 = 0xffffffff; /* LUA_REFNIL */
export const LUA_V69_LOADMODDATA_REAL_FN_ARG_COUNT = 0x00000003;
export const LUA_V69_LOADMODDATA_REAL_FN_CLEANUP = 0x00000024; /* final stack cleanup */
export const LUA_V69_LOADMODDATA_IAT_LUA_PUSHLSTRING = 0x00b183dc; /* lua_pushlstring */
export const LUA_V69_LOADMODDATA_SSO_CAP_U32 = 0x00000010;
export const LUA_V69_LOADMODDATA_RETURN_VALUE = 1;
export const LUA_V69_LOADMODDATA_INSTALL_COUNT = 1;
export const LUA_V69_LOADMODDATA_INSTALL_VA = 0x00896510;
export const LUA_V69_LOADMODDATA_INSTALL_RET_VA = 0x00896568;
export const LUA_V69_LOADMODDATA_INSTALL_LITERAL_VA = 0x00896521;
export const LUA_V69_LOADMODDATA_INSTALL_REAL_FN_VA = 0x00871550; /* HOST */
export const LUA_V69_LOADMODDATA_INSTALL_NAME_VA = 0x00b74f08;
export const LUA_V69_LOADMODDATA_INSTALL_CALLER_VA = 0x0086e011;

export const LUA_V69_SAVEMODDATA_VA = 0x00897d50; /* SaveModData (pushvalue+ref pair, ret 0) */
export const LUA_V69_SAVEMODDATA_RET_VA = 0x00897eff;
export const LUA_V69_SAVEMODDATA_INSNS = 136;
export const LUA_V69_SAVEMODDATA_TOUSERDATA_INDEX_U32 = 0xfff0b9d7;
export const LUA_V69_SAVEMODDATA_FN_OFF = 0x00;
export const LUA_V69_SAVEMODDATA_IAT_LUA_TOUSERDATA = 0x00b183b0;
export const LUA_V69_SAVEMODDATA_SEH_HANDLER_VA = 0x00b05098;
export const LUA_V69_SAVEMODDATA_BUILDER_VA = 0x008ba7c0; /* host pin */
export const LUA_V69_SAVEMODDATA_RAWGETI_HELPER_VA = 0x006a80f0; /* shared 18-caller host helper */
export const LUA_V69_SAVEMODDATA_LUAL_REF_IAT_VA = 0x00b18314; /* luaL_ref */
export const LUA_V69_SAVEMODDATA_LUAL_UNREF_IAT_VA = 0x00b1831c; /* luaL_unref */
export const LUA_V69_SAVEMODDATA_REGISTRY_INDEX_U32 = 0xfff0b9d8;
export const LUA_V69_SAVEMODDATA_REFNIL_U32 = 0xffffffff; /* LUA_REFNIL */
export const LUA_V69_SAVEMODDATA_REAL_FN_ARG_COUNT = 0x00000003;
export const LUA_V69_SAVEMODDATA_REAL_FN_CLEANUP = 0x0000000c; /* final stack cleanup */
export const LUA_V69_SAVEMODDATA_PUSHVALUE_IAT_VA = 0x00b183c8; /* lua_pushvalue */
export const LUA_V69_SAVEMODDATA_RETURN_VALUE = 0;
export const LUA_V69_SAVEMODDATA_INSTALL_COUNT = 1;
export const LUA_V69_SAVEMODDATA_INSTALL_VA = 0x008964b0;
export const LUA_V69_SAVEMODDATA_INSTALL_RET_VA = 0x00896508;
export const LUA_V69_SAVEMODDATA_INSTALL_LITERAL_VA = 0x008964c1;
export const LUA_V69_SAVEMODDATA_INSTALL_REAL_FN_VA = 0x008711f0; /* HOST */
export const LUA_V69_SAVEMODDATA_INSTALL_NAME_VA = 0x00b74f38;
export const LUA_V69_SAVEMODDATA_INSTALL_CALLER_VA = 0x0086e000;

export const LUA_V69_GETBYNAME_SITE_COUNT = 11;
export const LUA_V69_GETBYNAME_SITE_CALLER_VAS = [
  0x0086de68, 0x0086de79, 0x0086de8a, 0x0086deac, 0x0086debd, 0x0086dece, 0x0086dedf, 0x0086def0, 0x0086df01, 0x0086df12, 0x0086df23,
];
export const LUA_V69_GETBYNAME_SITE_REAL_FN_VAS = [
  0x0086f520, 0x0086f5b0, 0x0086f640, 0x0086f800, 0x0086f880, 0x0086f6e0, 0x0086f900, 0x0086f980, 0x0086f9f0, 0x0086fab0, 0x0086fa50,
];
export const LUA_V69_GETBYNAME_SITE_NAME_VAS = [
  0x00b74d94, 0x00b74d5c, 0x00b74d74, 0x00b74e80, 0x00b74e44, 0x00b74e58, 0x00b74e18, 0x00b74e30, 0x00b74df0, 0x00b74e04, 0x00b74eec,
];

export function luaEngineV69GetPlayerTypeByNameArg1Gate(tobooleanResult) {
  /* BYTE gate `test eax,eax; setne` @0x8982e4 */
  return (tobooleanResult & 0xff) !== 0 ? 1 : 0;
}

export function luaEngineV69GetPlayerTypeByNameArg1WordLane(gate, spill) {
  /* 16-bit copy law `mov ax,[ebp-0x46]` @0x898332: low byte = gate, high byte = [ebp-0x45] residue */
  return (((gate & 0xff) | ((spill & 0xff) << 8)) & 0xffff) >>> 0;
}

export function luaEngineV69SpawnNullGate(realFnResult) {
  /* FULL-WORD null gate `test esi,esi; je` @0x898c88 */
  return realFnResult !== 0 ? 1 : 0;
}

export function luaEngineV69GridSpawnNullGate(realFnResult) {
  /* FULL-WORD null gate `test edi,edi; je` @0x898ba2 */
  return realFnResult !== 0 ? 1 : 0;
}

export function luaEngineV69GridSpawnHasArg4Gate(tobooleanResult) {
  /* BYTE gate on lua_toboolean(L,4) `test/setne` @0x898b16 */
  return (tobooleanResult & 0xff) !== 0 ? 1 : 0;
}

export function luaEngineV69RenderTextF32LaneBits(doubleLo, doubleHi) {
  /* (float)luaL_checknumber lane `fstp dword` after IAT 0xb18324 */
  const dv = new DataView(new ArrayBuffer(8));
  dv.setUint32(0, doubleLo >>> 0, true);
  dv.setUint32(4, doubleHi >>> 0, true);
  const out = new DataView(new ArrayBuffer(4));
  out.setFloat32(0, Math.fround(dv.getFloat64(0, true)), true);
  return out.getUint32(0, true) >>> 0;
}

export function luaEngineV69UpdateStrangeAttractorF32LaneBits(doubleLo, doubleHi) {
  /* (float)luaL_checknumber lane `fstp dword` after IAT 0xb18324 */
  const dv = new DataView(new ArrayBuffer(8));
  dv.setUint32(0, doubleLo >>> 0, true);
  dv.setUint32(4, doubleHi >>> 0, true);
  const out = new DataView(new ArrayBuffer(4));
  out.setFloat32(0, Math.fround(dv.getFloat64(0, true)), true);
  return out.getUint32(0, true) >>> 0;
}

export function luaEngineV69RemoveModDataRefnilGate(ref) {
  /* LUA_REFNIL gate `cmp ref,-1; je` */
  return ref === -1 ? 1 : 0;
}

export function luaEngineV69HasModDataReturnGate(realFnResult) {
  /* BYTE gate `mov bl,al; test bl,bl; setne cl` @0x897bbf */
  return (realFnResult & 0xff) !== 0 ? 1 : 0;
}

export function luaEngineV69HasModDataRefnilGate(ref) {
  /* LUA_REFNIL gate `cmp ref,-1; je` */
  return ref === -1 ? 1 : 0;
}

export function luaEngineV69LoadModDataRefnilGate(ref) {
  /* LUA_REFNIL gate `cmp ref,-1; je` */
  return ref === -1 ? 1 : 0;
}

export function luaEngineV69SaveModDataRefnilGate(ref) {
  /* LUA_REFNIL gate `cmp ref,-1; je` */
  return ref === -1 ? 1 : 0;
}

export function luaEngineV69GetByNameVa() { return LUA_V69_GETBYNAME_VA >>> 0; }
export function luaEngineV69GetByNameRetVa() { return LUA_V69_GETBYNAME_RET_VA >>> 0; }
export function luaEngineV69GetByNameBodyBytes() { return LUA_V69_GETBYNAME_RET_VA - LUA_V69_GETBYNAME_VA; }
export function luaEngineV69GetByNameInsnCount() { return LUA_V69_GETBYNAME_INSNS | 0; }
export function luaEngineV69GetByNameTouserdataIndex() { return LUA_V69_GETBYNAME_TOUSERDATA_INDEX_U32 >>> 0; }
export function luaEngineV69GetByNameFnOff() { return LUA_V69_GETBYNAME_FN_OFF >>> 0; }
export function luaEngineV69GetByNameIatLuaTouserdata() { return LUA_V69_GETBYNAME_IAT_LUA_TOUSERDATA >>> 0; }
export function luaEngineV69GetByNameReturnValue() { return LUA_V69_GETBYNAME_RETURN_VALUE | 0; }
export function luaEngineV69GetByNameInstallCount() { return LUA_V69_GETBYNAME_INSTALL_COUNT | 0; }
export function luaEngineV69GetByNameSehHandlerVa() { return LUA_V69_GETBYNAME_SEH_HANDLER_VA >>> 0; }
export function luaEngineV69GetByNameCheckStringBuilderVa() { return LUA_V69_GETBYNAME_CHECK_STRING_BUILDER_VA >>> 0; }
export function luaEngineV69GetByNameStringCopyCtorVa() { return LUA_V69_GETBYNAME_STRING_COPY_CTOR_VA >>> 0; }
export function luaEngineV69GetByNameStringDtorVa() { return LUA_V69_GETBYNAME_STRING_DTOR_VA >>> 0; }
export function luaEngineV69GetByNameRealFnArgCount() { return LUA_V69_GETBYNAME_REAL_FN_ARG_COUNT >>> 0; }
export function luaEngineV69GetByNameRealFnCleanup() { return LUA_V69_GETBYNAME_REAL_FN_CLEANUP >>> 0; }
export function luaEngineV69GetByNamePusherVa() { return LUA_V69_GETBYNAME_PUSHER_VA >>> 0; }
export function luaEngineV69GetByNamePusherRow() { return LUA_V69_GETBYNAME_PUSHER_ROW >>> 0; }
export function luaEngineV69GetByNameInstallVa() { return LUA_V69_GETBYNAME_INSTALL_VA >>> 0; }
export function luaEngineV69GetByNameInstallRetVa() { return LUA_V69_GETBYNAME_INSTALL_RET_VA >>> 0; }
export function luaEngineV69GetByNameInstallLiteralVa() { return LUA_V69_GETBYNAME_INSTALL_LITERAL_VA >>> 0; }
export function luaEngineV69GetByNameInstallRealFnVa() { return LUA_V69_GETBYNAME_INSTALL_REAL_FN_VA >>> 0; }
export function luaEngineV69GetByNameInstallNameVa() { return LUA_V69_GETBYNAME_INSTALL_NAME_VA >>> 0; }
export function luaEngineV69GetByNameInstallCallerVa() { return LUA_V69_GETBYNAME_INSTALL_CALLER_VA >>> 0; }
export function luaEngineV69GetByNameSiteCount() { return LUA_V69_GETBYNAME_SITE_COUNT | 0; }
export function luaEngineV69GetByNameSiteCallerVaAt(index) { return index >= 0 && index < LUA_V69_GETBYNAME_SITE_COUNT ? LUA_V69_GETBYNAME_SITE_CALLER_VAS[index] >>> 0 : 0; }
export function luaEngineV69GetByNameSiteRealFnVaAt(index) { return index >= 0 && index < LUA_V69_GETBYNAME_SITE_COUNT ? LUA_V69_GETBYNAME_SITE_REAL_FN_VAS[index] >>> 0 : 0; }
export function luaEngineV69GetByNameSiteNameVaAt(index) { return index >= 0 && index < LUA_V69_GETBYNAME_SITE_COUNT ? LUA_V69_GETBYNAME_SITE_NAME_VAS[index] >>> 0 : 0; }

export function luaEngineV69GetTextWidthVa() { return LUA_V69_GETTEXTWIDTH_VA >>> 0; }
export function luaEngineV69GetTextWidthRetVa() { return LUA_V69_GETTEXTWIDTH_RET_VA >>> 0; }
export function luaEngineV69GetTextWidthBodyBytes() { return LUA_V69_GETTEXTWIDTH_RET_VA - LUA_V69_GETTEXTWIDTH_VA; }
export function luaEngineV69GetTextWidthInsnCount() { return LUA_V69_GETTEXTWIDTH_INSNS | 0; }
export function luaEngineV69GetTextWidthTouserdataIndex() { return LUA_V69_GETTEXTWIDTH_TOUSERDATA_INDEX_U32 >>> 0; }
export function luaEngineV69GetTextWidthFnOff() { return LUA_V69_GETTEXTWIDTH_FN_OFF >>> 0; }
export function luaEngineV69GetTextWidthIatLuaTouserdata() { return LUA_V69_GETTEXTWIDTH_IAT_LUA_TOUSERDATA >>> 0; }
export function luaEngineV69GetTextWidthReturnValue() { return LUA_V69_GETTEXTWIDTH_RETURN_VALUE | 0; }
export function luaEngineV69GetTextWidthInstallCount() { return LUA_V69_GETTEXTWIDTH_INSTALL_COUNT | 0; }
export function luaEngineV69GetTextWidthSehHandlerVa() { return LUA_V69_GETTEXTWIDTH_SEH_HANDLER_VA >>> 0; }
export function luaEngineV69GetTextWidthCheckStringBuilderVa() { return LUA_V69_GETTEXTWIDTH_CHECK_STRING_BUILDER_VA >>> 0; }
export function luaEngineV69GetTextWidthStringCopyCtorVa() { return LUA_V69_GETTEXTWIDTH_STRING_COPY_CTOR_VA >>> 0; }
export function luaEngineV69GetTextWidthStringDtorVa() { return LUA_V69_GETTEXTWIDTH_STRING_DTOR_VA >>> 0; }
export function luaEngineV69GetTextWidthRealFnArgCount() { return LUA_V69_GETTEXTWIDTH_REAL_FN_ARG_COUNT >>> 0; }
export function luaEngineV69GetTextWidthRealFnCleanup() { return LUA_V69_GETTEXTWIDTH_REAL_FN_CLEANUP >>> 0; }
export function luaEngineV69GetTextWidthPusherVa() { return LUA_V69_GETTEXTWIDTH_PUSHER_VA >>> 0; }
export function luaEngineV69GetTextWidthPusherRow() { return LUA_V69_GETTEXTWIDTH_PUSHER_ROW >>> 0; }
export function luaEngineV69GetTextWidthInstallAVa() { return LUA_V69_GETTEXTWIDTH_INSTALL_A_VA >>> 0; }
export function luaEngineV69GetTextWidthInstallARetVa() { return LUA_V69_GETTEXTWIDTH_INSTALL_A_RET_VA >>> 0; }
export function luaEngineV69GetTextWidthInstallALiteralVa() { return LUA_V69_GETTEXTWIDTH_INSTALL_A_LITERAL_VA >>> 0; }
export function luaEngineV69GetTextWidthInstallARealFnVa() { return LUA_V69_GETTEXTWIDTH_INSTALL_A_REAL_FN_VA >>> 0; }
export function luaEngineV69GetTextWidthInstallANameVa() { return LUA_V69_GETTEXTWIDTH_INSTALL_A_NAME_VA >>> 0; }
export function luaEngineV69GetTextWidthInstallACallerVa() { return LUA_V69_GETTEXTWIDTH_INSTALL_A_CALLER_VA >>> 0; }
export function luaEngineV69GetTextWidthInstallBVa() { return LUA_V69_GETTEXTWIDTH_INSTALL_B_VA >>> 0; }
export function luaEngineV69GetTextWidthInstallBRetVa() { return LUA_V69_GETTEXTWIDTH_INSTALL_B_RET_VA >>> 0; }
export function luaEngineV69GetTextWidthInstallBLiteralVa() { return LUA_V69_GETTEXTWIDTH_INSTALL_B_LITERAL_VA >>> 0; }
export function luaEngineV69GetTextWidthInstallBRealFnVa() { return LUA_V69_GETTEXTWIDTH_INSTALL_B_REAL_FN_VA >>> 0; }
export function luaEngineV69GetTextWidthInstallBNameVa() { return LUA_V69_GETTEXTWIDTH_INSTALL_B_NAME_VA >>> 0; }
export function luaEngineV69GetTextWidthInstallBCallerVa() { return LUA_V69_GETTEXTWIDTH_INSTALL_B_CALLER_VA >>> 0; }

export function luaEngineV69DebugStringVa() { return LUA_V69_DEBUGSTRING_VA >>> 0; }
export function luaEngineV69DebugStringRetVa() { return LUA_V69_DEBUGSTRING_RET_VA >>> 0; }
export function luaEngineV69DebugStringBodyBytes() { return LUA_V69_DEBUGSTRING_RET_VA - LUA_V69_DEBUGSTRING_VA; }
export function luaEngineV69DebugStringInsnCount() { return LUA_V69_DEBUGSTRING_INSNS | 0; }
export function luaEngineV69DebugStringTouserdataIndex() { return LUA_V69_DEBUGSTRING_TOUSERDATA_INDEX_U32 >>> 0; }
export function luaEngineV69DebugStringFnOff() { return LUA_V69_DEBUGSTRING_FN_OFF >>> 0; }
export function luaEngineV69DebugStringIatLuaTouserdata() { return LUA_V69_DEBUGSTRING_IAT_LUA_TOUSERDATA >>> 0; }
export function luaEngineV69DebugStringReturnValue() { return LUA_V69_DEBUGSTRING_RETURN_VALUE | 0; }
export function luaEngineV69DebugStringInstallCount() { return LUA_V69_DEBUGSTRING_INSTALL_COUNT | 0; }
export function luaEngineV69DebugStringSehHandlerVa() { return LUA_V69_DEBUGSTRING_SEH_HANDLER_VA >>> 0; }
export function luaEngineV69DebugStringCheckStringBuilderVa() { return LUA_V69_DEBUGSTRING_CHECK_STRING_BUILDER_VA >>> 0; }
export function luaEngineV69DebugStringStringCopyCtorVa() { return LUA_V69_DEBUGSTRING_STRING_COPY_CTOR_VA >>> 0; }
export function luaEngineV69DebugStringStringDtorVa() { return LUA_V69_DEBUGSTRING_STRING_DTOR_VA >>> 0; }
export function luaEngineV69DebugStringRealFnArgCount() { return LUA_V69_DEBUGSTRING_REAL_FN_ARG_COUNT >>> 0; }
export function luaEngineV69DebugStringRealFnCleanup() { return LUA_V69_DEBUGSTRING_REAL_FN_CLEANUP >>> 0; }
export function luaEngineV69DebugStringPusherVa() { return LUA_V69_DEBUGSTRING_PUSHER_VA >>> 0; }
export function luaEngineV69DebugStringPusherRow() { return LUA_V69_DEBUGSTRING_PUSHER_ROW >>> 0; }
export function luaEngineV69DebugStringInstallAVa() { return LUA_V69_DEBUGSTRING_INSTALL_A_VA >>> 0; }
export function luaEngineV69DebugStringInstallARetVa() { return LUA_V69_DEBUGSTRING_INSTALL_A_RET_VA >>> 0; }
export function luaEngineV69DebugStringInstallALiteralVa() { return LUA_V69_DEBUGSTRING_INSTALL_A_LITERAL_VA >>> 0; }
export function luaEngineV69DebugStringInstallARealFnVa() { return LUA_V69_DEBUGSTRING_INSTALL_A_REAL_FN_VA >>> 0; }
export function luaEngineV69DebugStringInstallANameVa() { return LUA_V69_DEBUGSTRING_INSTALL_A_NAME_VA >>> 0; }
export function luaEngineV69DebugStringInstallACallerVa() { return LUA_V69_DEBUGSTRING_INSTALL_A_CALLER_VA >>> 0; }
export function luaEngineV69DebugStringInstallBVa() { return LUA_V69_DEBUGSTRING_INSTALL_B_VA >>> 0; }
export function luaEngineV69DebugStringInstallBRetVa() { return LUA_V69_DEBUGSTRING_INSTALL_B_RET_VA >>> 0; }
export function luaEngineV69DebugStringInstallBLiteralVa() { return LUA_V69_DEBUGSTRING_INSTALL_B_LITERAL_VA >>> 0; }
export function luaEngineV69DebugStringInstallBRealFnVa() { return LUA_V69_DEBUGSTRING_INSTALL_B_REAL_FN_VA >>> 0; }
export function luaEngineV69DebugStringInstallBNameVa() { return LUA_V69_DEBUGSTRING_INSTALL_B_NAME_VA >>> 0; }
export function luaEngineV69DebugStringInstallBCallerVa() { return LUA_V69_DEBUGSTRING_INSTALL_B_CALLER_VA >>> 0; }

export function luaEngineV69ExecuteCommandVa() { return LUA_V69_EXECUTECOMMAND_VA >>> 0; }
export function luaEngineV69ExecuteCommandRetVa() { return LUA_V69_EXECUTECOMMAND_RET_VA >>> 0; }
export function luaEngineV69ExecuteCommandBodyBytes() { return LUA_V69_EXECUTECOMMAND_RET_VA - LUA_V69_EXECUTECOMMAND_VA; }
export function luaEngineV69ExecuteCommandInsnCount() { return LUA_V69_EXECUTECOMMAND_INSNS | 0; }
export function luaEngineV69ExecuteCommandTouserdataIndex() { return LUA_V69_EXECUTECOMMAND_TOUSERDATA_INDEX_U32 >>> 0; }
export function luaEngineV69ExecuteCommandFnOff() { return LUA_V69_EXECUTECOMMAND_FN_OFF >>> 0; }
export function luaEngineV69ExecuteCommandIatLuaTouserdata() { return LUA_V69_EXECUTECOMMAND_IAT_LUA_TOUSERDATA >>> 0; }
export function luaEngineV69ExecuteCommandReturnValue() { return LUA_V69_EXECUTECOMMAND_RETURN_VALUE | 0; }
export function luaEngineV69ExecuteCommandInstallCount() { return LUA_V69_EXECUTECOMMAND_INSTALL_COUNT | 0; }
export function luaEngineV69ExecuteCommandSehHandlerVa() { return LUA_V69_EXECUTECOMMAND_SEH_HANDLER_VA >>> 0; }
export function luaEngineV69ExecuteCommandCheckStringBuilderVa() { return LUA_V69_EXECUTECOMMAND_CHECK_STRING_BUILDER_VA >>> 0; }
export function luaEngineV69ExecuteCommandStringCopyCtorVa() { return LUA_V69_EXECUTECOMMAND_STRING_COPY_CTOR_VA >>> 0; }
export function luaEngineV69ExecuteCommandStringDtorVa() { return LUA_V69_EXECUTECOMMAND_STRING_DTOR_VA >>> 0; }
export function luaEngineV69ExecuteCommandRealFnArgCount() { return LUA_V69_EXECUTECOMMAND_REAL_FN_ARG_COUNT >>> 0; }
export function luaEngineV69ExecuteCommandRealFnCleanup() { return LUA_V69_EXECUTECOMMAND_REAL_FN_CLEANUP >>> 0; }
export function luaEngineV69ExecuteCommandIatLuaPushlstring() { return LUA_V69_EXECUTECOMMAND_IAT_LUA_PUSHLSTRING >>> 0; }
export function luaEngineV69ExecuteCommandSsoCapU32() { return LUA_V69_EXECUTECOMMAND_SSO_CAP_U32 >>> 0; }
export function luaEngineV69ExecuteCommandInstallVa() { return LUA_V69_EXECUTECOMMAND_INSTALL_VA >>> 0; }
export function luaEngineV69ExecuteCommandInstallRetVa() { return LUA_V69_EXECUTECOMMAND_INSTALL_RET_VA >>> 0; }
export function luaEngineV69ExecuteCommandInstallLiteralVa() { return LUA_V69_EXECUTECOMMAND_INSTALL_LITERAL_VA >>> 0; }
export function luaEngineV69ExecuteCommandInstallRealFnVa() { return LUA_V69_EXECUTECOMMAND_INSTALL_REAL_FN_VA >>> 0; }
export function luaEngineV69ExecuteCommandInstallNameVa() { return LUA_V69_EXECUTECOMMAND_INSTALL_NAME_VA >>> 0; }
export function luaEngineV69ExecuteCommandInstallCallerVa() { return LUA_V69_EXECUTECOMMAND_INSTALL_CALLER_VA >>> 0; }

export function luaEngineV69GetPlayerTypeByNameVa() { return LUA_V69_GETPLAYERTYPEBYNAME_VA >>> 0; }
export function luaEngineV69GetPlayerTypeByNameRetVa() { return LUA_V69_GETPLAYERTYPEBYNAME_RET_VA >>> 0; }
export function luaEngineV69GetPlayerTypeByNameBodyBytes() { return LUA_V69_GETPLAYERTYPEBYNAME_RET_VA - LUA_V69_GETPLAYERTYPEBYNAME_VA; }
export function luaEngineV69GetPlayerTypeByNameInsnCount() { return LUA_V69_GETPLAYERTYPEBYNAME_INSNS | 0; }
export function luaEngineV69GetPlayerTypeByNameTouserdataIndex() { return LUA_V69_GETPLAYERTYPEBYNAME_TOUSERDATA_INDEX_U32 >>> 0; }
export function luaEngineV69GetPlayerTypeByNameFnOff() { return LUA_V69_GETPLAYERTYPEBYNAME_FN_OFF >>> 0; }
export function luaEngineV69GetPlayerTypeByNameIatLuaTouserdata() { return LUA_V69_GETPLAYERTYPEBYNAME_IAT_LUA_TOUSERDATA >>> 0; }
export function luaEngineV69GetPlayerTypeByNameReturnValue() { return LUA_V69_GETPLAYERTYPEBYNAME_RETURN_VALUE | 0; }
export function luaEngineV69GetPlayerTypeByNameInstallCount() { return LUA_V69_GETPLAYERTYPEBYNAME_INSTALL_COUNT | 0; }
export function luaEngineV69GetPlayerTypeByNameSehHandlerVa() { return LUA_V69_GETPLAYERTYPEBYNAME_SEH_HANDLER_VA >>> 0; }
export function luaEngineV69GetPlayerTypeByNameChecklstringIatVa() { return LUA_V69_GETPLAYERTYPEBYNAME_CHECKLSTRING_IAT_VA >>> 0; }
export function luaEngineV69GetPlayerTypeByNameChecklstringIndexU32() { return LUA_V69_GETPLAYERTYPEBYNAME_CHECKLSTRING_INDEX_U32 >>> 0; }
export function luaEngineV69GetPlayerTypeByNameStringAssignVa() { return LUA_V69_GETPLAYERTYPEBYNAME_STRING_ASSIGN_VA >>> 0; }
export function luaEngineV69GetPlayerTypeByNameTobooleanIatVa() { return LUA_V69_GETPLAYERTYPEBYNAME_TOBOOLEAN_IAT_VA >>> 0; }
export function luaEngineV69GetPlayerTypeByNameTobooleanIndexU32() { return LUA_V69_GETPLAYERTYPEBYNAME_TOBOOLEAN_INDEX_U32 >>> 0; }
export function luaEngineV69GetPlayerTypeByNameByteGateOffU32() { return LUA_V69_GETPLAYERTYPEBYNAME_BYTE_GATE_OFF_U32 >>> 0; }
export function luaEngineV69GetPlayerTypeByNameWordSlotOffU32() { return LUA_V69_GETPLAYERTYPEBYNAME_WORD_SLOT_OFF_U32 >>> 0; }
export function luaEngineV69GetPlayerTypeByNamePusherVa() { return LUA_V69_GETPLAYERTYPEBYNAME_PUSHER_VA >>> 0; }
export function luaEngineV69GetPlayerTypeByNamePusherRow() { return LUA_V69_GETPLAYERTYPEBYNAME_PUSHER_ROW >>> 0; }
export function luaEngineV69GetPlayerTypeByNameCopyCtorVa() { return LUA_V69_GETPLAYERTYPEBYNAME_COPY_CTOR_VA >>> 0; }
export function luaEngineV69GetPlayerTypeByNameDtorVa() { return LUA_V69_GETPLAYERTYPEBYNAME_DTOR_VA >>> 0; }
export function luaEngineV69GetPlayerTypeByNameRealFnArgCount() { return LUA_V69_GETPLAYERTYPEBYNAME_REAL_FN_ARG_COUNT >>> 0; }
export function luaEngineV69GetPlayerTypeByNameRealFnCleanup() { return LUA_V69_GETPLAYERTYPEBYNAME_REAL_FN_CLEANUP >>> 0; }
export function luaEngineV69GetPlayerTypeByNameInstallVa() { return LUA_V69_GETPLAYERTYPEBYNAME_INSTALL_VA >>> 0; }
export function luaEngineV69GetPlayerTypeByNameInstallRetVa() { return LUA_V69_GETPLAYERTYPEBYNAME_INSTALL_RET_VA >>> 0; }
export function luaEngineV69GetPlayerTypeByNameInstallLiteralVa() { return LUA_V69_GETPLAYERTYPEBYNAME_INSTALL_LITERAL_VA >>> 0; }
export function luaEngineV69GetPlayerTypeByNameInstallRealFnVa() { return LUA_V69_GETPLAYERTYPEBYNAME_INSTALL_REAL_FN_VA >>> 0; }
export function luaEngineV69GetPlayerTypeByNameInstallNameVa() { return LUA_V69_GETPLAYERTYPEBYNAME_INSTALL_NAME_VA >>> 0; }
export function luaEngineV69GetPlayerTypeByNameInstallCallerVa() { return LUA_V69_GETPLAYERTYPEBYNAME_INSTALL_CALLER_VA >>> 0; }

export function luaEngineV69SpawnVa() { return LUA_V69_SPAWN_VA >>> 0; }
export function luaEngineV69SpawnRetVa() { return LUA_V69_SPAWN_RET_VA >>> 0; }
export function luaEngineV69SpawnBodyBytes() { return LUA_V69_SPAWN_RET_VA - LUA_V69_SPAWN_VA; }
export function luaEngineV69SpawnInsnCount() { return LUA_V69_SPAWN_INSNS | 0; }
export function luaEngineV69SpawnTouserdataIndex() { return LUA_V69_SPAWN_TOUSERDATA_INDEX_U32 >>> 0; }
export function luaEngineV69SpawnFnOff() { return LUA_V69_SPAWN_FN_OFF >>> 0; }
export function luaEngineV69SpawnIatLuaTouserdata() { return LUA_V69_SPAWN_IAT_LUA_TOUSERDATA >>> 0; }
export function luaEngineV69SpawnReturnValue() { return LUA_V69_SPAWN_RETURN_VALUE | 0; }
export function luaEngineV69SpawnInstallCount() { return LUA_V69_SPAWN_INSTALL_COUNT | 0; }
export function luaEngineV69SpawnBuilderVa() { return LUA_V69_SPAWN_BUILDER_VA >>> 0; }
export function luaEngineV69SpawnRealFnArgCount() { return LUA_V69_SPAWN_REAL_FN_ARG_COUNT >>> 0; }
export function luaEngineV69SpawnRealFnCleanup() { return LUA_V69_SPAWN_REAL_FN_CLEANUP >>> 0; }
export function luaEngineV69SpawnNewuserdataSize() { return LUA_V69_SPAWN_NEWUSERDATA_SIZE >>> 0; }
export function luaEngineV69SpawnUdVtableVa() { return LUA_V69_SPAWN_UD_VTABLE_VA >>> 0; }
export function luaEngineV69SpawnUdObjectOff() { return LUA_V69_SPAWN_UD_OBJECT_OFF >>> 0; }
export function luaEngineV69SpawnRawgetpKey() { return LUA_V69_SPAWN_RAWGETP_KEY >>> 0; }
export function luaEngineV69SpawnRegistryIndexU32() { return LUA_V69_SPAWN_REGISTRY_INDEX_U32 >>> 0; }
export function luaEngineV69SpawnSetmetaIndexU32() { return LUA_V69_SPAWN_SETMETA_INDEX_U32 >>> 0; }
export function luaEngineV69SpawnIatLuaNewuserdata() { return LUA_V69_SPAWN_IAT_LUA_NEWUSERDATA >>> 0; }
export function luaEngineV69SpawnIatLuaRawgetp() { return LUA_V69_SPAWN_IAT_LUA_RAWGETP >>> 0; }
export function luaEngineV69SpawnIatLuaSetmetatable() { return LUA_V69_SPAWN_IAT_LUA_SETMETATABLE >>> 0; }
export function luaEngineV69SpawnIatLuaPushnil() { return LUA_V69_SPAWN_IAT_LUA_PUSHNIL >>> 0; }
export function luaEngineV69SpawnInstallVa() { return LUA_V69_SPAWN_INSTALL_VA >>> 0; }
export function luaEngineV69SpawnInstallRetVa() { return LUA_V69_SPAWN_INSTALL_RET_VA >>> 0; }
export function luaEngineV69SpawnInstallLiteralVa() { return LUA_V69_SPAWN_INSTALL_LITERAL_VA >>> 0; }
export function luaEngineV69SpawnInstallRealFnVa() { return LUA_V69_SPAWN_INSTALL_REAL_FN_VA >>> 0; }
export function luaEngineV69SpawnInstallNameVa() { return LUA_V69_SPAWN_INSTALL_NAME_VA >>> 0; }
export function luaEngineV69SpawnInstallCallerVa() { return LUA_V69_SPAWN_INSTALL_CALLER_VA >>> 0; }

export function luaEngineV69GridSpawnVa() { return LUA_V69_GRIDSPAWN_VA >>> 0; }
export function luaEngineV69GridSpawnRetVa() { return LUA_V69_GRIDSPAWN_RET_VA >>> 0; }
export function luaEngineV69GridSpawnBodyBytes() { return LUA_V69_GRIDSPAWN_RET_VA - LUA_V69_GRIDSPAWN_VA; }
export function luaEngineV69GridSpawnInsnCount() { return LUA_V69_GRIDSPAWN_INSNS | 0; }
export function luaEngineV69GridSpawnTouserdataIndex() { return LUA_V69_GRIDSPAWN_TOUSERDATA_INDEX_U32 >>> 0; }
export function luaEngineV69GridSpawnFnOff() { return LUA_V69_GRIDSPAWN_FN_OFF >>> 0; }
export function luaEngineV69GridSpawnIatLuaTouserdata() { return LUA_V69_GRIDSPAWN_IAT_LUA_TOUSERDATA >>> 0; }
export function luaEngineV69GridSpawnReturnValue() { return LUA_V69_GRIDSPAWN_RETURN_VALUE | 0; }
export function luaEngineV69GridSpawnInstallCount() { return LUA_V69_GRIDSPAWN_INSTALL_COUNT | 0; }
export function luaEngineV69GridSpawnTobooleanIatVa() { return LUA_V69_GRIDSPAWN_TOBOOLEAN_IAT_VA >>> 0; }
export function luaEngineV69GridSpawnTobooleanIndexU32() { return LUA_V69_GRIDSPAWN_TOBOOLEAN_INDEX_U32 >>> 0; }
export function luaEngineV69GridSpawnCheckintegerIatVa() { return LUA_V69_GRIDSPAWN_CHECKINTEGER_IAT_VA >>> 0; }
export function luaEngineV69GridSpawnArg1CheckintegerIndexU32() { return LUA_V69_GRIDSPAWN_ARG1_CHECKINTEGER_INDEX_U32 >>> 0; }
export function luaEngineV69GridSpawnArg2CheckintegerIndexU32() { return LUA_V69_GRIDSPAWN_ARG2_CHECKINTEGER_INDEX_U32 >>> 0; }
export function luaEngineV69GridSpawnGetargobjectVa() { return LUA_V69_GRIDSPAWN_GETARGOBJECT_VA >>> 0; }
export function luaEngineV69GridSpawnGetargobjectArgIndexU32() { return LUA_V69_GRIDSPAWN_GETARGOBJECT_ARG_INDEX_U32 >>> 0; }
export function luaEngineV69GridSpawnRealFnArgCount() { return LUA_V69_GRIDSPAWN_REAL_FN_ARG_COUNT >>> 0; }
export function luaEngineV69GridSpawnRealFnCleanup() { return LUA_V69_GRIDSPAWN_REAL_FN_CLEANUP >>> 0; }
export function luaEngineV69GridSpawnNewuserdataSize() { return LUA_V69_GRIDSPAWN_NEWUSERDATA_SIZE >>> 0; }
export function luaEngineV69GridSpawnUdVtableVa() { return LUA_V69_GRIDSPAWN_UD_VTABLE_VA >>> 0; }
export function luaEngineV69GridSpawnUdObjectOff() { return LUA_V69_GRIDSPAWN_UD_OBJECT_OFF >>> 0; }
export function luaEngineV69GridSpawnRawgetpKey() { return LUA_V69_GRIDSPAWN_RAWGETP_KEY >>> 0; }
export function luaEngineV69GridSpawnRegistryIndexU32() { return LUA_V69_GRIDSPAWN_REGISTRY_INDEX_U32 >>> 0; }
export function luaEngineV69GridSpawnSetmetaIndexU32() { return LUA_V69_GRIDSPAWN_SETMETA_INDEX_U32 >>> 0; }
export function luaEngineV69GridSpawnIatLuaNewuserdata() { return LUA_V69_GRIDSPAWN_IAT_LUA_NEWUSERDATA >>> 0; }
export function luaEngineV69GridSpawnIatLuaRawgetp() { return LUA_V69_GRIDSPAWN_IAT_LUA_RAWGETP >>> 0; }
export function luaEngineV69GridSpawnIatLuaSetmetatable() { return LUA_V69_GRIDSPAWN_IAT_LUA_SETMETATABLE >>> 0; }
export function luaEngineV69GridSpawnIatLuaPushnil() { return LUA_V69_GRIDSPAWN_IAT_LUA_PUSHNIL >>> 0; }
export function luaEngineV69GridSpawnInstallVa() { return LUA_V69_GRIDSPAWN_INSTALL_VA >>> 0; }
export function luaEngineV69GridSpawnInstallRetVa() { return LUA_V69_GRIDSPAWN_INSTALL_RET_VA >>> 0; }
export function luaEngineV69GridSpawnInstallLiteralVa() { return LUA_V69_GRIDSPAWN_INSTALL_LITERAL_VA >>> 0; }
export function luaEngineV69GridSpawnInstallRealFnVa() { return LUA_V69_GRIDSPAWN_INSTALL_REAL_FN_VA >>> 0; }
export function luaEngineV69GridSpawnInstallNameVa() { return LUA_V69_GRIDSPAWN_INSTALL_NAME_VA >>> 0; }
export function luaEngineV69GridSpawnInstallCallerVa() { return LUA_V69_GRIDSPAWN_INSTALL_CALLER_VA >>> 0; }

export function luaEngineV69RenderTextVa() { return LUA_V69_RENDERTEXT_VA >>> 0; }
export function luaEngineV69RenderTextRetVa() { return LUA_V69_RENDERTEXT_RET_VA >>> 0; }
export function luaEngineV69RenderTextBodyBytes() { return LUA_V69_RENDERTEXT_RET_VA - LUA_V69_RENDERTEXT_VA; }
export function luaEngineV69RenderTextInsnCount() { return LUA_V69_RENDERTEXT_INSNS | 0; }
export function luaEngineV69RenderTextTouserdataIndex() { return LUA_V69_RENDERTEXT_TOUSERDATA_INDEX_U32 >>> 0; }
export function luaEngineV69RenderTextFnOff() { return LUA_V69_RENDERTEXT_FN_OFF >>> 0; }
export function luaEngineV69RenderTextIatLuaTouserdata() { return LUA_V69_RENDERTEXT_IAT_LUA_TOUSERDATA >>> 0; }
export function luaEngineV69RenderTextReturnValue() { return LUA_V69_RENDERTEXT_RETURN_VALUE | 0; }
export function luaEngineV69RenderTextInstallCount() { return LUA_V69_RENDERTEXT_INSTALL_COUNT | 0; }
export function luaEngineV69RenderTextSehHandlerVa() { return LUA_V69_RENDERTEXT_SEH_HANDLER_VA >>> 0; }
export function luaEngineV69RenderTextChecklstringIatVa() { return LUA_V69_RENDERTEXT_CHECKLSTRING_IAT_VA >>> 0; }
export function luaEngineV69RenderTextChecklstringIndexU32() { return LUA_V69_RENDERTEXT_CHECKLSTRING_INDEX_U32 >>> 0; }
export function luaEngineV69RenderTextStringAssignVa() { return LUA_V69_RENDERTEXT_STRING_ASSIGN_VA >>> 0; }
export function luaEngineV69RenderTextCopyCtorVa() { return LUA_V69_RENDERTEXT_COPY_CTOR_VA >>> 0; }
export function luaEngineV69RenderTextDtorVa() { return LUA_V69_RENDERTEXT_DTOR_VA >>> 0; }
export function luaEngineV69RenderTextRealFnArgCount() { return LUA_V69_RENDERTEXT_REAL_FN_ARG_COUNT >>> 0; }
export function luaEngineV69RenderTextRealFnCleanup() { return LUA_V69_RENDERTEXT_REAL_FN_CLEANUP >>> 0; }
export function luaEngineV69RenderTextChecknumberIatVa() { return LUA_V69_RENDERTEXT_CHECKNUMBER_IAT_VA >>> 0; }
export function luaEngineV69RenderTextFloatLaneFirstIndexU32() { return LUA_V69_RENDERTEXT_FLOAT_LANE_FIRST_INDEX_U32 >>> 0; }
export function luaEngineV69RenderTextFloatLaneCount() { return LUA_V69_RENDERTEXT_FLOAT_LANE_COUNT >>> 0; }
export function luaEngineV69RenderTextInstallVa() { return LUA_V69_RENDERTEXT_INSTALL_VA >>> 0; }
export function luaEngineV69RenderTextInstallRetVa() { return LUA_V69_RENDERTEXT_INSTALL_RET_VA >>> 0; }
export function luaEngineV69RenderTextInstallLiteralVa() { return LUA_V69_RENDERTEXT_INSTALL_LITERAL_VA >>> 0; }
export function luaEngineV69RenderTextInstallRealFnVa() { return LUA_V69_RENDERTEXT_INSTALL_REAL_FN_VA >>> 0; }
export function luaEngineV69RenderTextInstallNameVa() { return LUA_V69_RENDERTEXT_INSTALL_NAME_VA >>> 0; }
export function luaEngineV69RenderTextInstallCallerVa() { return LUA_V69_RENDERTEXT_INSTALL_CALLER_VA >>> 0; }

export function luaEngineV69UpdateStrangeAttractorVa() { return LUA_V69_UPDATESTRANGEATTRACTOR_VA >>> 0; }
export function luaEngineV69UpdateStrangeAttractorRetVa() { return LUA_V69_UPDATESTRANGEATTRACTOR_RET_VA >>> 0; }
export function luaEngineV69UpdateStrangeAttractorBodyBytes() { return LUA_V69_UPDATESTRANGEATTRACTOR_RET_VA - LUA_V69_UPDATESTRANGEATTRACTOR_VA; }
export function luaEngineV69UpdateStrangeAttractorInsnCount() { return LUA_V69_UPDATESTRANGEATTRACTOR_INSNS | 0; }
export function luaEngineV69UpdateStrangeAttractorTouserdataIndex() { return LUA_V69_UPDATESTRANGEATTRACTOR_TOUSERDATA_INDEX_U32 >>> 0; }
export function luaEngineV69UpdateStrangeAttractorFnOff() { return LUA_V69_UPDATESTRANGEATTRACTOR_FN_OFF >>> 0; }
export function luaEngineV69UpdateStrangeAttractorIatLuaTouserdata() { return LUA_V69_UPDATESTRANGEATTRACTOR_IAT_LUA_TOUSERDATA >>> 0; }
export function luaEngineV69UpdateStrangeAttractorReturnValue() { return LUA_V69_UPDATESTRANGEATTRACTOR_RETURN_VALUE | 0; }
export function luaEngineV69UpdateStrangeAttractorInstallCount() { return LUA_V69_UPDATESTRANGEATTRACTOR_INSTALL_COUNT | 0; }
export function luaEngineV69UpdateStrangeAttractorCheckHelperVa() { return LUA_V69_UPDATESTRANGEATTRACTOR_CHECK_HELPER_VA >>> 0; }
export function luaEngineV69UpdateStrangeAttractorArg1CheckEdxU32() { return LUA_V69_UPDATESTRANGEATTRACTOR_ARG1_CHECK_EDX_U32 >>> 0; }
export function luaEngineV69UpdateStrangeAttractorArg1CheckKey() { return LUA_V69_UPDATESTRANGEATTRACTOR_ARG1_CHECK_KEY >>> 0; }
export function luaEngineV69UpdateStrangeAttractorGetargobjectVa() { return LUA_V69_UPDATESTRANGEATTRACTOR_GETARGOBJECT_VA >>> 0; }
export function luaEngineV69UpdateStrangeAttractorArg2GetargobjectArgIndexU32() { return LUA_V69_UPDATESTRANGEATTRACTOR_ARG2_GETARGOBJECT_ARG_INDEX_U32 >>> 0; }
export function luaEngineV69UpdateStrangeAttractorChecknumberIatVa() { return LUA_V69_UPDATESTRANGEATTRACTOR_CHECKNUMBER_IAT_VA >>> 0; }
export function luaEngineV69UpdateStrangeAttractorArg3LaneIndexU32() { return LUA_V69_UPDATESTRANGEATTRACTOR_ARG3_LANE_INDEX_U32 >>> 0; }
export function luaEngineV69UpdateStrangeAttractorArg4LaneIndexU32() { return LUA_V69_UPDATESTRANGEATTRACTOR_ARG4_LANE_INDEX_U32 >>> 0; }
export function luaEngineV69UpdateStrangeAttractorRealFnArgCount() { return LUA_V69_UPDATESTRANGEATTRACTOR_REAL_FN_ARG_COUNT >>> 0; }
export function luaEngineV69UpdateStrangeAttractorRealFnCleanup() { return LUA_V69_UPDATESTRANGEATTRACTOR_REAL_FN_CLEANUP >>> 0; }
export function luaEngineV69UpdateStrangeAttractorInstallVa() { return LUA_V69_UPDATESTRANGEATTRACTOR_INSTALL_VA >>> 0; }
export function luaEngineV69UpdateStrangeAttractorInstallRetVa() { return LUA_V69_UPDATESTRANGEATTRACTOR_INSTALL_RET_VA >>> 0; }
export function luaEngineV69UpdateStrangeAttractorInstallLiteralVa() { return LUA_V69_UPDATESTRANGEATTRACTOR_INSTALL_LITERAL_VA >>> 0; }
export function luaEngineV69UpdateStrangeAttractorInstallRealFnVa() { return LUA_V69_UPDATESTRANGEATTRACTOR_INSTALL_REAL_FN_VA >>> 0; }
export function luaEngineV69UpdateStrangeAttractorInstallNameVa() { return LUA_V69_UPDATESTRANGEATTRACTOR_INSTALL_NAME_VA >>> 0; }
export function luaEngineV69UpdateStrangeAttractorInstallCallerVa() { return LUA_V69_UPDATESTRANGEATTRACTOR_INSTALL_CALLER_VA >>> 0; }

export function luaEngineV69RemoveModDataVa() { return LUA_V69_REMOVEMODDATA_VA >>> 0; }
export function luaEngineV69RemoveModDataRetVa() { return LUA_V69_REMOVEMODDATA_RET_VA >>> 0; }
export function luaEngineV69RemoveModDataBodyBytes() { return LUA_V69_REMOVEMODDATA_RET_VA - LUA_V69_REMOVEMODDATA_VA; }
export function luaEngineV69RemoveModDataInsnCount() { return LUA_V69_REMOVEMODDATA_INSNS | 0; }
export function luaEngineV69RemoveModDataTouserdataIndex() { return LUA_V69_REMOVEMODDATA_TOUSERDATA_INDEX_U32 >>> 0; }
export function luaEngineV69RemoveModDataFnOff() { return LUA_V69_REMOVEMODDATA_FN_OFF >>> 0; }
export function luaEngineV69RemoveModDataIatLuaTouserdata() { return LUA_V69_REMOVEMODDATA_IAT_LUA_TOUSERDATA >>> 0; }
export function luaEngineV69RemoveModDataReturnValue() { return LUA_V69_REMOVEMODDATA_RETURN_VALUE | 0; }
export function luaEngineV69RemoveModDataInstallCount() { return LUA_V69_REMOVEMODDATA_INSTALL_COUNT | 0; }
export function luaEngineV69RemoveModDataSehHandlerVa() { return LUA_V69_REMOVEMODDATA_SEH_HANDLER_VA >>> 0; }
export function luaEngineV69RemoveModDataBuilderVa() { return LUA_V69_REMOVEMODDATA_BUILDER_VA >>> 0; }
export function luaEngineV69RemoveModDataRawgetiHelperVa() { return LUA_V69_REMOVEMODDATA_RAWGETI_HELPER_VA >>> 0; }
export function luaEngineV69RemoveModDataLualRefIatVa() { return LUA_V69_REMOVEMODDATA_LUAL_REF_IAT_VA >>> 0; }
export function luaEngineV69RemoveModDataLualUnrefIatVa() { return LUA_V69_REMOVEMODDATA_LUAL_UNREF_IAT_VA >>> 0; }
export function luaEngineV69RemoveModDataRegistryIndexU32() { return LUA_V69_REMOVEMODDATA_REGISTRY_INDEX_U32 >>> 0; }
export function luaEngineV69RemoveModDataRefnilU32() { return LUA_V69_REMOVEMODDATA_REFNIL_U32 >>> 0; }
export function luaEngineV69RemoveModDataRealFnArgCount() { return LUA_V69_REMOVEMODDATA_REAL_FN_ARG_COUNT >>> 0; }
export function luaEngineV69RemoveModDataRealFnCleanup() { return LUA_V69_REMOVEMODDATA_REAL_FN_CLEANUP >>> 0; }
export function luaEngineV69RemoveModDataInstallVa() { return LUA_V69_REMOVEMODDATA_INSTALL_VA >>> 0; }
export function luaEngineV69RemoveModDataInstallRetVa() { return LUA_V69_REMOVEMODDATA_INSTALL_RET_VA >>> 0; }
export function luaEngineV69RemoveModDataInstallLiteralVa() { return LUA_V69_REMOVEMODDATA_INSTALL_LITERAL_VA >>> 0; }
export function luaEngineV69RemoveModDataInstallRealFnVa() { return LUA_V69_REMOVEMODDATA_INSTALL_REAL_FN_VA >>> 0; }
export function luaEngineV69RemoveModDataInstallNameVa() { return LUA_V69_REMOVEMODDATA_INSTALL_NAME_VA >>> 0; }
export function luaEngineV69RemoveModDataInstallCallerVa() { return LUA_V69_REMOVEMODDATA_INSTALL_CALLER_VA >>> 0; }

export function luaEngineV69HasModDataVa() { return LUA_V69_HASHMODDATA_VA >>> 0; }
export function luaEngineV69HasModDataRetVa() { return LUA_V69_HASHMODDATA_RET_VA >>> 0; }
export function luaEngineV69HasModDataBodyBytes() { return LUA_V69_HASHMODDATA_RET_VA - LUA_V69_HASHMODDATA_VA; }
export function luaEngineV69HasModDataInsnCount() { return LUA_V69_HASHMODDATA_INSNS | 0; }
export function luaEngineV69HasModDataTouserdataIndex() { return LUA_V69_HASHMODDATA_TOUSERDATA_INDEX_U32 >>> 0; }
export function luaEngineV69HasModDataFnOff() { return LUA_V69_HASHMODDATA_FN_OFF >>> 0; }
export function luaEngineV69HasModDataIatLuaTouserdata() { return LUA_V69_HASHMODDATA_IAT_LUA_TOUSERDATA >>> 0; }
export function luaEngineV69HasModDataReturnValue() { return LUA_V69_HASHMODDATA_RETURN_VALUE | 0; }
export function luaEngineV69HasModDataInstallCount() { return LUA_V69_HASHMODDATA_INSTALL_COUNT | 0; }
export function luaEngineV69HasModDataSehHandlerVa() { return LUA_V69_HASHMODDATA_SEH_HANDLER_VA >>> 0; }
export function luaEngineV69HasModDataBuilderVa() { return LUA_V69_HASHMODDATA_BUILDER_VA >>> 0; }
export function luaEngineV69HasModDataRawgetiHelperVa() { return LUA_V69_HASHMODDATA_RAWGETI_HELPER_VA >>> 0; }
export function luaEngineV69HasModDataLualRefIatVa() { return LUA_V69_HASHMODDATA_LUAL_REF_IAT_VA >>> 0; }
export function luaEngineV69HasModDataLualUnrefIatVa() { return LUA_V69_HASHMODDATA_LUAL_UNREF_IAT_VA >>> 0; }
export function luaEngineV69HasModDataRegistryIndexU32() { return LUA_V69_HASHMODDATA_REGISTRY_INDEX_U32 >>> 0; }
export function luaEngineV69HasModDataRefnilU32() { return LUA_V69_HASHMODDATA_REFNIL_U32 >>> 0; }
export function luaEngineV69HasModDataRealFnArgCount() { return LUA_V69_HASHMODDATA_REAL_FN_ARG_COUNT >>> 0; }
export function luaEngineV69HasModDataRealFnCleanup() { return LUA_V69_HASHMODDATA_REAL_FN_CLEANUP >>> 0; }
export function luaEngineV69HasModDataIatLuaPushboolean() { return LUA_V69_HASHMODDATA_IAT_LUA_PUSHBOOLEAN >>> 0; }
export function luaEngineV69HasModDataInstallVa() { return LUA_V69_HASHMODDATA_INSTALL_VA >>> 0; }
export function luaEngineV69HasModDataInstallRetVa() { return LUA_V69_HASHMODDATA_INSTALL_RET_VA >>> 0; }
export function luaEngineV69HasModDataInstallLiteralVa() { return LUA_V69_HASHMODDATA_INSTALL_LITERAL_VA >>> 0; }
export function luaEngineV69HasModDataInstallRealFnVa() { return LUA_V69_HASHMODDATA_INSTALL_REAL_FN_VA >>> 0; }
export function luaEngineV69HasModDataInstallNameVa() { return LUA_V69_HASHMODDATA_INSTALL_NAME_VA >>> 0; }
export function luaEngineV69HasModDataInstallCallerVa() { return LUA_V69_HASHMODDATA_INSTALL_CALLER_VA >>> 0; }

export function luaEngineV69LoadModDataVa() { return LUA_V69_LOADMODDATA_VA >>> 0; }
export function luaEngineV69LoadModDataRetVa() { return LUA_V69_LOADMODDATA_RET_VA >>> 0; }
export function luaEngineV69LoadModDataBodyBytes() { return LUA_V69_LOADMODDATA_RET_VA - LUA_V69_LOADMODDATA_VA; }
export function luaEngineV69LoadModDataInsnCount() { return LUA_V69_LOADMODDATA_INSNS | 0; }
export function luaEngineV69LoadModDataTouserdataIndex() { return LUA_V69_LOADMODDATA_TOUSERDATA_INDEX_U32 >>> 0; }
export function luaEngineV69LoadModDataFnOff() { return LUA_V69_LOADMODDATA_FN_OFF >>> 0; }
export function luaEngineV69LoadModDataIatLuaTouserdata() { return LUA_V69_LOADMODDATA_IAT_LUA_TOUSERDATA >>> 0; }
export function luaEngineV69LoadModDataReturnValue() { return LUA_V69_LOADMODDATA_RETURN_VALUE | 0; }
export function luaEngineV69LoadModDataInstallCount() { return LUA_V69_LOADMODDATA_INSTALL_COUNT | 0; }
export function luaEngineV69LoadModDataSehHandlerVa() { return LUA_V69_LOADMODDATA_SEH_HANDLER_VA >>> 0; }
export function luaEngineV69LoadModDataBuilderVa() { return LUA_V69_LOADMODDATA_BUILDER_VA >>> 0; }
export function luaEngineV69LoadModDataRawgetiHelperVa() { return LUA_V69_LOADMODDATA_RAWGETI_HELPER_VA >>> 0; }
export function luaEngineV69LoadModDataLualRefIatVa() { return LUA_V69_LOADMODDATA_LUAL_REF_IAT_VA >>> 0; }
export function luaEngineV69LoadModDataLualUnrefIatVa() { return LUA_V69_LOADMODDATA_LUAL_UNREF_IAT_VA >>> 0; }
export function luaEngineV69LoadModDataRegistryIndexU32() { return LUA_V69_LOADMODDATA_REGISTRY_INDEX_U32 >>> 0; }
export function luaEngineV69LoadModDataRefnilU32() { return LUA_V69_LOADMODDATA_REFNIL_U32 >>> 0; }
export function luaEngineV69LoadModDataRealFnArgCount() { return LUA_V69_LOADMODDATA_REAL_FN_ARG_COUNT >>> 0; }
export function luaEngineV69LoadModDataRealFnCleanup() { return LUA_V69_LOADMODDATA_REAL_FN_CLEANUP >>> 0; }
export function luaEngineV69LoadModDataIatLuaPushlstring() { return LUA_V69_LOADMODDATA_IAT_LUA_PUSHLSTRING >>> 0; }
export function luaEngineV69LoadModDataSsoCapU32() { return LUA_V69_LOADMODDATA_SSO_CAP_U32 >>> 0; }
export function luaEngineV69LoadModDataInstallVa() { return LUA_V69_LOADMODDATA_INSTALL_VA >>> 0; }
export function luaEngineV69LoadModDataInstallRetVa() { return LUA_V69_LOADMODDATA_INSTALL_RET_VA >>> 0; }
export function luaEngineV69LoadModDataInstallLiteralVa() { return LUA_V69_LOADMODDATA_INSTALL_LITERAL_VA >>> 0; }
export function luaEngineV69LoadModDataInstallRealFnVa() { return LUA_V69_LOADMODDATA_INSTALL_REAL_FN_VA >>> 0; }
export function luaEngineV69LoadModDataInstallNameVa() { return LUA_V69_LOADMODDATA_INSTALL_NAME_VA >>> 0; }
export function luaEngineV69LoadModDataInstallCallerVa() { return LUA_V69_LOADMODDATA_INSTALL_CALLER_VA >>> 0; }

export function luaEngineV69SaveModDataVa() { return LUA_V69_SAVEMODDATA_VA >>> 0; }
export function luaEngineV69SaveModDataRetVa() { return LUA_V69_SAVEMODDATA_RET_VA >>> 0; }
export function luaEngineV69SaveModDataBodyBytes() { return LUA_V69_SAVEMODDATA_RET_VA - LUA_V69_SAVEMODDATA_VA; }
export function luaEngineV69SaveModDataInsnCount() { return LUA_V69_SAVEMODDATA_INSNS | 0; }
export function luaEngineV69SaveModDataTouserdataIndex() { return LUA_V69_SAVEMODDATA_TOUSERDATA_INDEX_U32 >>> 0; }
export function luaEngineV69SaveModDataFnOff() { return LUA_V69_SAVEMODDATA_FN_OFF >>> 0; }
export function luaEngineV69SaveModDataIatLuaTouserdata() { return LUA_V69_SAVEMODDATA_IAT_LUA_TOUSERDATA >>> 0; }
export function luaEngineV69SaveModDataReturnValue() { return LUA_V69_SAVEMODDATA_RETURN_VALUE | 0; }
export function luaEngineV69SaveModDataInstallCount() { return LUA_V69_SAVEMODDATA_INSTALL_COUNT | 0; }
export function luaEngineV69SaveModDataSehHandlerVa() { return LUA_V69_SAVEMODDATA_SEH_HANDLER_VA >>> 0; }
export function luaEngineV69SaveModDataBuilderVa() { return LUA_V69_SAVEMODDATA_BUILDER_VA >>> 0; }
export function luaEngineV69SaveModDataRawgetiHelperVa() { return LUA_V69_SAVEMODDATA_RAWGETI_HELPER_VA >>> 0; }
export function luaEngineV69SaveModDataLualRefIatVa() { return LUA_V69_SAVEMODDATA_LUAL_REF_IAT_VA >>> 0; }
export function luaEngineV69SaveModDataLualUnrefIatVa() { return LUA_V69_SAVEMODDATA_LUAL_UNREF_IAT_VA >>> 0; }
export function luaEngineV69SaveModDataRegistryIndexU32() { return LUA_V69_SAVEMODDATA_REGISTRY_INDEX_U32 >>> 0; }
export function luaEngineV69SaveModDataRefnilU32() { return LUA_V69_SAVEMODDATA_REFNIL_U32 >>> 0; }
export function luaEngineV69SaveModDataRealFnArgCount() { return LUA_V69_SAVEMODDATA_REAL_FN_ARG_COUNT >>> 0; }
export function luaEngineV69SaveModDataRealFnCleanup() { return LUA_V69_SAVEMODDATA_REAL_FN_CLEANUP >>> 0; }
export function luaEngineV69SaveModDataPushvalueIatVa() { return LUA_V69_SAVEMODDATA_PUSHVALUE_IAT_VA >>> 0; }
export function luaEngineV69SaveModDataInstallVa() { return LUA_V69_SAVEMODDATA_INSTALL_VA >>> 0; }
export function luaEngineV69SaveModDataInstallRetVa() { return LUA_V69_SAVEMODDATA_INSTALL_RET_VA >>> 0; }
export function luaEngineV69SaveModDataInstallLiteralVa() { return LUA_V69_SAVEMODDATA_INSTALL_LITERAL_VA >>> 0; }
export function luaEngineV69SaveModDataInstallRealFnVa() { return LUA_V69_SAVEMODDATA_INSTALL_REAL_FN_VA >>> 0; }
export function luaEngineV69SaveModDataInstallNameVa() { return LUA_V69_SAVEMODDATA_INSTALL_NAME_VA >>> 0; }
export function luaEngineV69SaveModDataInstallCallerVa() { return LUA_V69_SAVEMODDATA_INSTALL_CALLER_VA >>> 0; }

/* ---- ABI v70: the 39-band 17-byte-record wrapper closure ----
 * SIX wrappers (GetMousePosition / ScreenToWorld-family x5 /
 * RegisterMod / GetItemConfig / GetFreeNearPosition /
 * RenderScaledText), direct-ud shape, uint32 gates.
 * See section-notes/lua-v70-8b9b20/NOTES.md. ---- */
export const LUA_V70_GETFREENEARPOSITION_ARG2_CHECKNUMBER_INDEX_U32 = 2;
export const LUA_V70_GETFREENEARPOSITION_CHECKNUMBER_IAT_VA = 11633444;
export const LUA_V70_GETFREENEARPOSITION_FN_OFF = 0;
export const LUA_V70_GETFREENEARPOSITION_GETARGOBJECT_ARG_INDEX_U32 = 1;
export const LUA_V70_GETFREENEARPOSITION_GETARGOBJECT_VA = 9153104;
export const LUA_V70_GETFREENEARPOSITION_IAT_LUA_NEWUSERDATA = 11633564;
export const LUA_V70_GETFREENEARPOSITION_IAT_LUA_RAWGETP = 11633596;
export const LUA_V70_GETFREENEARPOSITION_IAT_LUA_SETMETATABLE = 11633560;
export const LUA_V70_GETFREENEARPOSITION_IAT_LUA_TOUSERDATA = 11633584;
export const LUA_V70_GETFREENEARPOSITION_INSNS = 64;
export const LUA_V70_GETFREENEARPOSITION_INSTALL_CALLER_VA = 8838675;
export const LUA_V70_GETFREENEARPOSITION_INSTALL_COUNT = 1;
export const LUA_V70_GETFREENEARPOSITION_INSTALL_LITERAL_VA = 9003169;
export const LUA_V70_GETFREENEARPOSITION_INSTALL_NAME_VA = 12013020;
export const LUA_V70_GETFREENEARPOSITION_INSTALL_REAL_FN_VA = 8844240;
export const LUA_V70_GETFREENEARPOSITION_INSTALL_RET_VA = 9003240;
export const LUA_V70_GETFREENEARPOSITION_INSTALL_VA = 9003152;
export const LUA_V70_GETFREENEARPOSITION_NEWUSERDATA_SIZE = 16;
export const LUA_V70_GETFREENEARPOSITION_RAWGETP_KEY = 13117824;
export const LUA_V70_GETFREENEARPOSITION_REAL_FN_ARG_COUNT = 2;
export const LUA_V70_GETFREENEARPOSITION_REAL_FN_CLEANUP = 40;
export const LUA_V70_GETFREENEARPOSITION_REGISTRY_INDEX_U32 = 4293966296;
export const LUA_V70_GETFREENEARPOSITION_RETURN_VALUE = 1;
export const LUA_V70_GETFREENEARPOSITION_RET_VA = 9012935;
export const LUA_V70_GETFREENEARPOSITION_SETMETA_INDEX_U32 = 4294967294;
export const LUA_V70_GETFREENEARPOSITION_TOUSERDATA_INDEX_U32 = 4293966295;
export const LUA_V70_GETFREENEARPOSITION_UD_OBJECT_OFF = 8;
export const LUA_V70_GETFREENEARPOSITION_UD_VTABLE_VA = 12006772;
export const LUA_V70_GETFREENEARPOSITION_VA = 9012736;
export const LUA_V70_GETITEMCONFIG_FN_OFF = 0;
export const LUA_V70_GETITEMCONFIG_IAT_LUA_NEWUSERDATA = 11633564;
export const LUA_V70_GETITEMCONFIG_IAT_LUA_PUSHNIL = 11633632;
export const LUA_V70_GETITEMCONFIG_IAT_LUA_RAWGETP = 11633596;
export const LUA_V70_GETITEMCONFIG_IAT_LUA_SETMETATABLE = 11633560;
export const LUA_V70_GETITEMCONFIG_IAT_LUA_TOUSERDATA = 11633584;
export const LUA_V70_GETITEMCONFIG_INSNS = 44;
export const LUA_V70_GETITEMCONFIG_INSTALL_CALLER_VA = 8839015;
export const LUA_V70_GETITEMCONFIG_INSTALL_COUNT = 1;
export const LUA_V70_GETITEMCONFIG_INSTALL_LITERAL_VA = 9003841;
export const LUA_V70_GETITEMCONFIG_INSTALL_NAME_VA = 12013228;
export const LUA_V70_GETITEMCONFIG_INSTALL_REAL_FN_VA = 4377088;
export const LUA_V70_GETITEMCONFIG_INSTALL_RET_VA = 9003912;
export const LUA_V70_GETITEMCONFIG_INSTALL_VA = 9003824;
export const LUA_V70_GETITEMCONFIG_NEWUSERDATA_SIZE = 8;
export const LUA_V70_GETITEMCONFIG_NIL_RET_VA = 9011627;
export const LUA_V70_GETITEMCONFIG_NULL_GATE_VA = 9011549;
export const LUA_V70_GETITEMCONFIG_RAWGETP_KEY = 13117869;
export const LUA_V70_GETITEMCONFIG_REAL_FN_ARG_COUNT = 0;
export const LUA_V70_GETITEMCONFIG_REAL_FN_CLEANUP = 28;
export const LUA_V70_GETITEMCONFIG_REGISTRY_INDEX_U32 = 4293966296;
export const LUA_V70_GETITEMCONFIG_RETURN_VALUE = 1;
export const LUA_V70_GETITEMCONFIG_RET_VA = 9011608;
export const LUA_V70_GETITEMCONFIG_SETMETA_INDEX_U32 = 4294967294;
export const LUA_V70_GETITEMCONFIG_TOUSERDATA_INDEX_U32 = 4293966295;
export const LUA_V70_GETITEMCONFIG_UD_OBJECT_OFF = 4;
export const LUA_V70_GETITEMCONFIG_UD_VTABLE_VA = 12014536;
export const LUA_V70_GETITEMCONFIG_VA = 9011520;
export const LUA_V70_GETMOUSEPOSITION_FN_OFF = 0;
export const LUA_V70_GETMOUSEPOSITION_IAT_LUA_NEWUSERDATA = 11633564;
export const LUA_V70_GETMOUSEPOSITION_IAT_LUA_RAWGETP = 11633596;
export const LUA_V70_GETMOUSEPOSITION_IAT_LUA_SETMETATABLE = 11633560;
export const LUA_V70_GETMOUSEPOSITION_IAT_LUA_TOBOOLEAN = 11633640;
export const LUA_V70_GETMOUSEPOSITION_IAT_LUA_TOUSERDATA = 11633584;
export const LUA_V70_GETMOUSEPOSITION_INSNS = 54;
export const LUA_V70_GETMOUSEPOSITION_INSTALL_CALLER_VA = 8839564;
export const LUA_V70_GETMOUSEPOSITION_INSTALL_COUNT = 1;
export const LUA_V70_GETMOUSEPOSITION_INSTALL_LITERAL_VA = 9004993;
export const LUA_V70_GETMOUSEPOSITION_INSTALL_NAME_VA = 12013820;
export const LUA_V70_GETMOUSEPOSITION_INSTALL_REAL_FN_VA = 8846928;
export const LUA_V70_GETMOUSEPOSITION_INSTALL_RET_VA = 9005064;
export const LUA_V70_GETMOUSEPOSITION_INSTALL_VA = 9004976;
export const LUA_V70_GETMOUSEPOSITION_NEWUSERDATA_SIZE = 16;
export const LUA_V70_GETMOUSEPOSITION_RAWGETP_KEY = 13117824;
export const LUA_V70_GETMOUSEPOSITION_REAL_FN_ARG_COUNT = 2;
export const LUA_V70_GETMOUSEPOSITION_REAL_FN_CLEANUP = 52;
export const LUA_V70_GETMOUSEPOSITION_REGISTRY_INDEX_U32 = 4293966296;
export const LUA_V70_GETMOUSEPOSITION_RETURN_VALUE = 1;
export const LUA_V70_GETMOUSEPOSITION_RET_VA = 9009263;
export const LUA_V70_GETMOUSEPOSITION_SETMETA_INDEX_U32 = 4294967294;
export const LUA_V70_GETMOUSEPOSITION_TOBOOLEAN_GATE_VA = 9009170;
export const LUA_V70_GETMOUSEPOSITION_TOBOOLEAN_INDEX_U32 = 1;
export const LUA_V70_GETMOUSEPOSITION_TOUSERDATA_INDEX_U32 = 4293966295;
export const LUA_V70_GETMOUSEPOSITION_UD_OBJECT_OFF = 8;
export const LUA_V70_GETMOUSEPOSITION_UD_VTABLE_VA = 12006772;
export const LUA_V70_GETMOUSEPOSITION_VA = 9009136;
export const LUA_V70_REGISTERMOD_BUILDER_VA = 9151968;
export const LUA_V70_REGISTERMOD_FN_OFF = 0;
export const LUA_V70_REGISTERMOD_IAT_LUA_TOUSERDATA = 11633584;
export const LUA_V70_REGISTERMOD_INSNS = 146;
export const LUA_V70_REGISTERMOD_INSTALL_CALLER_VA = 8839117;
export const LUA_V70_REGISTERMOD_INSTALL_COUNT = 1;
export const LUA_V70_REGISTERMOD_INSTALL_LITERAL_VA = 9003937;
export const LUA_V70_REGISTERMOD_INSTALL_NAME_VA = 12013380;
export const LUA_V70_REGISTERMOD_INSTALL_REAL_FN_VA = 8851264;
export const LUA_V70_REGISTERMOD_INSTALL_RET_VA = 9004008;
export const LUA_V70_REGISTERMOD_INSTALL_VA = 9003920;
export const LUA_V70_REGISTERMOD_LUAL_REF_IAT_VA = 11633428;
export const LUA_V70_REGISTERMOD_LUAL_UNREF_IAT_VA = 11633436;
export const LUA_V70_REGISTERMOD_PUSHVALUE_IAT_VA = 11633608;
export const LUA_V70_REGISTERMOD_RAWGETI_HELPER_VA = 6979824;
export const LUA_V70_REGISTERMOD_REAL_FN_ARG_COUNT = 4;
export const LUA_V70_REGISTERMOD_REAL_FN_CLEANUP = 16;
export const LUA_V70_REGISTERMOD_REFNIL_U32 = 4294967295;
export const LUA_V70_REGISTERMOD_REGISTRY_INDEX_U32 = 4293966296;
export const LUA_V70_REGISTERMOD_RETURN_VALUE = 0;
export const LUA_V70_REGISTERMOD_RET_VA = 9011504;
export const LUA_V70_REGISTERMOD_SEH_HANDLER_VA = 11555080;
export const LUA_V70_REGISTERMOD_STRING_COPY_CTOR_VA = 4247376;
export const LUA_V70_REGISTERMOD_STRING_DTOR_VA = 4247616;
export const LUA_V70_REGISTERMOD_TOUSERDATA_INDEX_U32 = 4293966295;
export const LUA_V70_REGISTERMOD_VA = 9011024;
export const LUA_V70_RENDERSCALEDTEXT_BUILDER_VA = 9150944;
export const LUA_V70_RENDERSCALEDTEXT_CHECKLSTRING_IAT_VA = 11633636;
export const LUA_V70_RENDERSCALEDTEXT_CHECKLSTRING_INDEX_U32 = 1;
export const LUA_V70_RENDERSCALEDTEXT_FLOAT_LANE_COUNT = 8;
export const LUA_V70_RENDERSCALEDTEXT_FN_OFF = 0;
export const LUA_V70_RENDERSCALEDTEXT_IAT_LUA_TOUSERDATA = 11633584;
export const LUA_V70_RENDERSCALEDTEXT_INSNS = 125;
export const LUA_V70_RENDERSCALEDTEXT_INSTALL_CALLER_VA = 8838624;
export const LUA_V70_RENDERSCALEDTEXT_INSTALL_COUNT = 1;
export const LUA_V70_RENDERSCALEDTEXT_INSTALL_LITERAL_VA = 9002977;
export const LUA_V70_RENDERSCALEDTEXT_INSTALL_NAME_VA = 12012796;
export const LUA_V70_RENDERSCALEDTEXT_INSTALL_REAL_FN_VA = 8843904;
export const LUA_V70_RENDERSCALEDTEXT_INSTALL_RET_VA = 9003048;
export const LUA_V70_RENDERSCALEDTEXT_INSTALL_VA = 9002960;
export const LUA_V70_RENDERSCALEDTEXT_REAL_FN_ARG_COUNT = 9;
export const LUA_V70_RENDERSCALEDTEXT_REAL_FN_CLEANUP = 36;
export const LUA_V70_RENDERSCALEDTEXT_RETURN_VALUE = 0;
export const LUA_V70_RENDERSCALEDTEXT_RET_VA = 9013385;
export const LUA_V70_RENDERSCALEDTEXT_SEH_HANDLER_VA = 11555376;
export const LUA_V70_RENDERSCALEDTEXT_SSO_CAP_U32 = 16;
export const LUA_V70_RENDERSCALEDTEXT_STRING_ASSIGN_VA = 4246736;
export const LUA_V70_RENDERSCALEDTEXT_STRING_COPY_CTOR_VA = 4247376;
export const LUA_V70_RENDERSCALEDTEXT_STRING_DTOR_VA = 4247616;
export const LUA_V70_RENDERSCALEDTEXT_TOUSERDATA_INDEX_U32 = 4293966295;
export const LUA_V70_RENDERSCALEDTEXT_VA = 9012944;
export const LUA_V70_SCREENTOWORLD_FN_OFF = 0;
export const LUA_V70_SCREENTOWORLD_GETARGOBJECT_ARG_INDEX_U32 = 1;
export const LUA_V70_SCREENTOWORLD_GETARGOBJECT_VA = 9153104;
export const LUA_V70_SCREENTOWORLD_IAT_LUA_NEWUSERDATA = 11633564;
export const LUA_V70_SCREENTOWORLD_IAT_LUA_RAWGETP = 11633596;
export const LUA_V70_SCREENTOWORLD_IAT_LUA_SETMETATABLE = 11633560;
export const LUA_V70_SCREENTOWORLD_IAT_LUA_TOUSERDATA = 11633584;
export const LUA_V70_SCREENTOWORLD_INSNS = 60;
export const LUA_V70_SCREENTOWORLD_INSTALL_CALLER_VA = 8839236;
export const LUA_V70_SCREENTOWORLD_INSTALL_COUNT = 5;
export const LUA_V70_SCREENTOWORLD_INSTALL_LITERAL_VA = 9004615;
export const LUA_V70_SCREENTOWORLD_INSTALL_NAME_VA = 12013580;
export const LUA_V70_SCREENTOWORLD_INSTALL_REAL_FN_VA = 8847712;
export const LUA_V70_SCREENTOWORLD_INSTALL_RET_VA = 9004681;
export const LUA_V70_SCREENTOWORLD_INSTALL_VA = 9004592;
export const LUA_V70_SCREENTOWORLD_NEWUSERDATA_SIZE = 16;
export const LUA_V70_SCREENTOWORLD_RAWGETP_KEY = 13117824;
export const LUA_V70_SCREENTOWORLD_REAL_FN_ARG_COUNT = 2;
export const LUA_V70_SCREENTOWORLD_REAL_FN_CLEANUP = 44;
export const LUA_V70_SCREENTOWORLD_REGISTRY_INDEX_U32 = 4293966296;
export const LUA_V70_SCREENTOWORLD_RETURN_VALUE = 1;
export const LUA_V70_SCREENTOWORLD_RET_VA = 9009671;
export const LUA_V70_SCREENTOWORLD_SETMETA_INDEX_U32 = 4294967294;
export const LUA_V70_SCREENTOWORLD_SITE_0_CALLER_VA = 8839236;
export const LUA_V70_SCREENTOWORLD_SITE_0_NAME_VA = 12013580;
export const LUA_V70_SCREENTOWORLD_SITE_0_REAL_FN_VA = 8847712;
export const LUA_V70_SCREENTOWORLD_SITE_1_CALLER_VA = 8839253;
export const LUA_V70_SCREENTOWORLD_SITE_1_NAME_VA = 12013524;
export const LUA_V70_SCREENTOWORLD_SITE_1_REAL_FN_VA = 8847904;
export const LUA_V70_SCREENTOWORLD_SITE_2_CALLER_VA = 8839270;
export const LUA_V70_SCREENTOWORLD_SITE_2_NAME_VA = 12013540;
export const LUA_V70_SCREENTOWORLD_SITE_2_REAL_FN_VA = 8848272;
export const LUA_V70_SCREENTOWORLD_SITE_3_CALLER_VA = 8839287;
export const LUA_V70_SCREENTOWORLD_SITE_3_NAME_VA = 12013476;
export const LUA_V70_SCREENTOWORLD_SITE_3_REAL_FN_VA = 8848320;
export const LUA_V70_SCREENTOWORLD_SITE_4_CALLER_VA = 8839304;
export const LUA_V70_SCREENTOWORLD_SITE_4_NAME_VA = 12013500;
export const LUA_V70_SCREENTOWORLD_SITE_4_REAL_FN_VA = 8848576;
export const LUA_V70_SCREENTOWORLD_SITE_COUNT = 5;
export const LUA_V70_SCREENTOWORLD_TOUSERDATA_INDEX_U32 = 4293966295;
export const LUA_V70_SCREENTOWORLD_UD_OBJECT_OFF = 8;
export const LUA_V70_SCREENTOWORLD_UD_VTABLE_VA = 12006772;
export const LUA_V70_SCREENTOWORLD_VA = 9009520;

export const LUA_V70_SCREENTOWORLD_SITE_CALLER_VAS = [
  0x0086e044, 0x0086e055, 0x0086e066, 0x0086e077, 0x0086e088,
].map(Object.freeze);
export const LUA_V70_SCREENTOWORLD_SITE_REAL_FN_VAS = [
  0x00870160, 0x00870220, 0x00870390, 0x008703c0, 0x008704c0,
].map(Object.freeze);
export const LUA_V70_SCREENTOWORLD_SITE_NAME_VAS = [
  0x00b7500c, 0x00b74fd4, 0x00b74fe4, 0x00b74fa4, 0x00b74fbc,
].map(Object.freeze);

export function luaEngineV70GetMousePositionBoolGate(tobooleanResult) {
  /* BYTE gate `test eax,eax; setne` @0x897812/0x897817. */
  return (tobooleanResult & 0xff) !== 0 ? 1 : 0;
}
export function luaEngineV70GetItemConfigNullGate(realFnResult) {
  /* FULL-WORD null gate `test edi,edi; je` @0x89815d. */
  return realFnResult !== 0 ? 1 : 0;
}
export function luaEngineV70RegisterModRefnilGate(ref) {
  /* LUA_REFNIL gate `cmp ref,-1; je` (3 sites). */
  return ref === -1 ? 1 : 0;
}
export function luaEngineV70GetMousePositionVa() {
  return LUA_V70_GETMOUSEPOSITION_VA >>> 0;
}
export function luaEngineV70GetMousePositionRetVa() {
  return LUA_V70_GETMOUSEPOSITION_RET_VA >>> 0;
}
export function luaEngineV70GetMousePositionBodyBytes() {
  return (LUA_V70_GETMOUSEPOSITION_RET_VA - LUA_V70_GETMOUSEPOSITION_VA) >>> 0;
}
export function luaEngineV70GetMousePositionInsnCount() {
  return LUA_V70_GETMOUSEPOSITION_INSNS | 0;
}
export function luaEngineV70GetMousePositionTouserdataIndex() {
  return LUA_V70_GETMOUSEPOSITION_TOUSERDATA_INDEX_U32 >>> 0;
}
export function luaEngineV70GetMousePositionFnOff() {
  return LUA_V70_GETMOUSEPOSITION_FN_OFF >>> 0;
}
export function luaEngineV70GetMousePositionIatLuaTouserdata() {
  return LUA_V70_GETMOUSEPOSITION_IAT_LUA_TOUSERDATA >>> 0;
}
export function luaEngineV70GetMousePositionIatLuaToboolean() {
  return LUA_V70_GETMOUSEPOSITION_IAT_LUA_TOBOOLEAN >>> 0;
}
export function luaEngineV70GetMousePositionTobooleanIndexU32() {
  return LUA_V70_GETMOUSEPOSITION_TOBOOLEAN_INDEX_U32 >>> 0;
}
export function luaEngineV70GetMousePositionTobooleanGateVa() {
  return LUA_V70_GETMOUSEPOSITION_TOBOOLEAN_GATE_VA >>> 0;
}
export function luaEngineV70GetMousePositionRealFnArgCount() {
  return LUA_V70_GETMOUSEPOSITION_REAL_FN_ARG_COUNT >>> 0;
}
export function luaEngineV70GetMousePositionRealFnCleanup() {
  return LUA_V70_GETMOUSEPOSITION_REAL_FN_CLEANUP >>> 0;
}
export function luaEngineV70GetMousePositionNewuserdataSize() {
  return LUA_V70_GETMOUSEPOSITION_NEWUSERDATA_SIZE >>> 0;
}
export function luaEngineV70GetMousePositionUdVtableVa() {
  return LUA_V70_GETMOUSEPOSITION_UD_VTABLE_VA >>> 0;
}
export function luaEngineV70GetMousePositionUdObjectOff() {
  return LUA_V70_GETMOUSEPOSITION_UD_OBJECT_OFF >>> 0;
}
export function luaEngineV70GetMousePositionRawgetpKey() {
  return LUA_V70_GETMOUSEPOSITION_RAWGETP_KEY >>> 0;
}
export function luaEngineV70GetMousePositionRegistryIndexU32() {
  return LUA_V70_GETMOUSEPOSITION_REGISTRY_INDEX_U32 >>> 0;
}
export function luaEngineV70GetMousePositionSetmetaIndexU32() {
  return LUA_V70_GETMOUSEPOSITION_SETMETA_INDEX_U32 >>> 0;
}
export function luaEngineV70GetMousePositionIatLuaNewuserdata() {
  return LUA_V70_GETMOUSEPOSITION_IAT_LUA_NEWUSERDATA >>> 0;
}
export function luaEngineV70GetMousePositionIatLuaRawgetp() {
  return LUA_V70_GETMOUSEPOSITION_IAT_LUA_RAWGETP >>> 0;
}
export function luaEngineV70GetMousePositionIatLuaSetmetatable() {
  return LUA_V70_GETMOUSEPOSITION_IAT_LUA_SETMETATABLE >>> 0;
}
export function luaEngineV70GetMousePositionReturnValue() {
  return LUA_V70_GETMOUSEPOSITION_RETURN_VALUE >>> 0;
}
export function luaEngineV70GetMousePositionInstallCount() {
  return LUA_V70_GETMOUSEPOSITION_INSTALL_COUNT >>> 0;
}
export function luaEngineV70GetMousePositionInstallVa() {
  return LUA_V70_GETMOUSEPOSITION_INSTALL_VA >>> 0;
}
export function luaEngineV70GetMousePositionInstallRetVa() {
  return LUA_V70_GETMOUSEPOSITION_INSTALL_RET_VA >>> 0;
}
export function luaEngineV70GetMousePositionInstallLiteralVa() {
  return LUA_V70_GETMOUSEPOSITION_INSTALL_LITERAL_VA >>> 0;
}
export function luaEngineV70GetMousePositionInstallRealFnVa() {
  return LUA_V70_GETMOUSEPOSITION_INSTALL_REAL_FN_VA >>> 0;
}
export function luaEngineV70GetMousePositionInstallNameVa() {
  return LUA_V70_GETMOUSEPOSITION_INSTALL_NAME_VA >>> 0;
}
export function luaEngineV70GetMousePositionInstallCallerVa() {
  return LUA_V70_GETMOUSEPOSITION_INSTALL_CALLER_VA >>> 0;
}
export function luaEngineV70ScreenToWorldVa() {
  return LUA_V70_SCREENTOWORLD_VA >>> 0;
}
export function luaEngineV70ScreenToWorldRetVa() {
  return LUA_V70_SCREENTOWORLD_RET_VA >>> 0;
}
export function luaEngineV70ScreenToWorldBodyBytes() {
  return (LUA_V70_SCREENTOWORLD_RET_VA - LUA_V70_SCREENTOWORLD_VA) >>> 0;
}
export function luaEngineV70ScreenToWorldInsnCount() {
  return LUA_V70_SCREENTOWORLD_INSNS | 0;
}
export function luaEngineV70ScreenToWorldTouserdataIndex() {
  return LUA_V70_SCREENTOWORLD_TOUSERDATA_INDEX_U32 >>> 0;
}
export function luaEngineV70ScreenToWorldFnOff() {
  return LUA_V70_SCREENTOWORLD_FN_OFF >>> 0;
}
export function luaEngineV70ScreenToWorldIatLuaTouserdata() {
  return LUA_V70_SCREENTOWORLD_IAT_LUA_TOUSERDATA >>> 0;
}
export function luaEngineV70ScreenToWorldGetargobjectVa() {
  return LUA_V70_SCREENTOWORLD_GETARGOBJECT_VA >>> 0;
}
export function luaEngineV70ScreenToWorldGetargobjectArgIndexU32() {
  return LUA_V70_SCREENTOWORLD_GETARGOBJECT_ARG_INDEX_U32 >>> 0;
}
export function luaEngineV70ScreenToWorldRealFnArgCount() {
  return LUA_V70_SCREENTOWORLD_REAL_FN_ARG_COUNT >>> 0;
}
export function luaEngineV70ScreenToWorldRealFnCleanup() {
  return LUA_V70_SCREENTOWORLD_REAL_FN_CLEANUP >>> 0;
}
export function luaEngineV70ScreenToWorldNewuserdataSize() {
  return LUA_V70_SCREENTOWORLD_NEWUSERDATA_SIZE >>> 0;
}
export function luaEngineV70ScreenToWorldUdVtableVa() {
  return LUA_V70_SCREENTOWORLD_UD_VTABLE_VA >>> 0;
}
export function luaEngineV70ScreenToWorldUdObjectOff() {
  return LUA_V70_SCREENTOWORLD_UD_OBJECT_OFF >>> 0;
}
export function luaEngineV70ScreenToWorldRawgetpKey() {
  return LUA_V70_SCREENTOWORLD_RAWGETP_KEY >>> 0;
}
export function luaEngineV70ScreenToWorldRegistryIndexU32() {
  return LUA_V70_SCREENTOWORLD_REGISTRY_INDEX_U32 >>> 0;
}
export function luaEngineV70ScreenToWorldSetmetaIndexU32() {
  return LUA_V70_SCREENTOWORLD_SETMETA_INDEX_U32 >>> 0;
}
export function luaEngineV70ScreenToWorldIatLuaNewuserdata() {
  return LUA_V70_SCREENTOWORLD_IAT_LUA_NEWUSERDATA >>> 0;
}
export function luaEngineV70ScreenToWorldIatLuaRawgetp() {
  return LUA_V70_SCREENTOWORLD_IAT_LUA_RAWGETP >>> 0;
}
export function luaEngineV70ScreenToWorldIatLuaSetmetatable() {
  return LUA_V70_SCREENTOWORLD_IAT_LUA_SETMETATABLE >>> 0;
}
export function luaEngineV70ScreenToWorldReturnValue() {
  return LUA_V70_SCREENTOWORLD_RETURN_VALUE >>> 0;
}
export function luaEngineV70ScreenToWorldInstallCount() {
  return LUA_V70_SCREENTOWORLD_INSTALL_COUNT >>> 0;
}
export function luaEngineV70ScreenToWorldInstallVa() {
  return LUA_V70_SCREENTOWORLD_INSTALL_VA >>> 0;
}
export function luaEngineV70ScreenToWorldInstallRetVa() {
  return LUA_V70_SCREENTOWORLD_INSTALL_RET_VA >>> 0;
}
export function luaEngineV70ScreenToWorldInstallLiteralVa() {
  return LUA_V70_SCREENTOWORLD_INSTALL_LITERAL_VA >>> 0;
}
export function luaEngineV70ScreenToWorldInstallRealFnVa() {
  return LUA_V70_SCREENTOWORLD_INSTALL_REAL_FN_VA >>> 0;
}
export function luaEngineV70ScreenToWorldInstallNameVa() {
  return LUA_V70_SCREENTOWORLD_INSTALL_NAME_VA >>> 0;
}
export function luaEngineV70ScreenToWorldInstallCallerVa() {
  return LUA_V70_SCREENTOWORLD_INSTALL_CALLER_VA >>> 0;
}
export function luaEngineV70ScreenToWorldSiteCount() {
  return LUA_V70_SCREENTOWORLD_SITE_COUNT >>> 0;
}
export function luaEngineV70ScreenToWorldSiteCallerVaAt(index) {
  const rows = LUA_V70_SCREENTOWORLD_SITE_CALLER_VAS;
  if (index < 0 || index >= rows.length) return 0;
  return rows[index] >>> 0;
}
export function luaEngineV70ScreenToWorldSiteRealFnVaAt(index) {
  const rows = LUA_V70_SCREENTOWORLD_SITE_REAL_FN_VAS;
  if (index < 0 || index >= rows.length) return 0;
  return rows[index] >>> 0;
}
export function luaEngineV70ScreenToWorldSiteNameVaAt(index) {
  const rows = LUA_V70_SCREENTOWORLD_SITE_NAME_VAS;
  if (index < 0 || index >= rows.length) return 0;
  return rows[index] >>> 0;
}
export function luaEngineV70RegisterModVa() {
  return LUA_V70_REGISTERMOD_VA >>> 0;
}
export function luaEngineV70RegisterModRetVa() {
  return LUA_V70_REGISTERMOD_RET_VA >>> 0;
}
export function luaEngineV70RegisterModBodyBytes() {
  return (LUA_V70_REGISTERMOD_RET_VA - LUA_V70_REGISTERMOD_VA) >>> 0;
}
export function luaEngineV70RegisterModInsnCount() {
  return LUA_V70_REGISTERMOD_INSNS | 0;
}
export function luaEngineV70RegisterModTouserdataIndex() {
  return LUA_V70_REGISTERMOD_TOUSERDATA_INDEX_U32 >>> 0;
}
export function luaEngineV70RegisterModFnOff() {
  return LUA_V70_REGISTERMOD_FN_OFF >>> 0;
}
export function luaEngineV70RegisterModIatLuaTouserdata() {
  return LUA_V70_REGISTERMOD_IAT_LUA_TOUSERDATA >>> 0;
}
export function luaEngineV70RegisterModSehHandlerVa() {
  return LUA_V70_REGISTERMOD_SEH_HANDLER_VA >>> 0;
}
export function luaEngineV70RegisterModBuilderVa() {
  return LUA_V70_REGISTERMOD_BUILDER_VA >>> 0;
}
export function luaEngineV70RegisterModRawgetiHelperVa() {
  return LUA_V70_REGISTERMOD_RAWGETI_HELPER_VA >>> 0;
}
export function luaEngineV70RegisterModLualRefIatVa() {
  return LUA_V70_REGISTERMOD_LUAL_REF_IAT_VA >>> 0;
}
export function luaEngineV70RegisterModLualUnrefIatVa() {
  return LUA_V70_REGISTERMOD_LUAL_UNREF_IAT_VA >>> 0;
}
export function luaEngineV70RegisterModPushvalueIatVa() {
  return LUA_V70_REGISTERMOD_PUSHVALUE_IAT_VA >>> 0;
}
export function luaEngineV70RegisterModStringCopyCtorVa() {
  return LUA_V70_REGISTERMOD_STRING_COPY_CTOR_VA >>> 0;
}
export function luaEngineV70RegisterModStringDtorVa() {
  return LUA_V70_REGISTERMOD_STRING_DTOR_VA >>> 0;
}
export function luaEngineV70RegisterModRegistryIndexU32() {
  return LUA_V70_REGISTERMOD_REGISTRY_INDEX_U32 >>> 0;
}
export function luaEngineV70RegisterModRefnilU32() {
  return LUA_V70_REGISTERMOD_REFNIL_U32 >>> 0;
}
export function luaEngineV70RegisterModRealFnArgCount() {
  return LUA_V70_REGISTERMOD_REAL_FN_ARG_COUNT >>> 0;
}
export function luaEngineV70RegisterModRealFnCleanup() {
  return LUA_V70_REGISTERMOD_REAL_FN_CLEANUP >>> 0;
}
export function luaEngineV70RegisterModReturnValue() {
  return LUA_V70_REGISTERMOD_RETURN_VALUE >>> 0;
}
export function luaEngineV70RegisterModInstallCount() {
  return LUA_V70_REGISTERMOD_INSTALL_COUNT >>> 0;
}
export function luaEngineV70RegisterModInstallVa() {
  return LUA_V70_REGISTERMOD_INSTALL_VA >>> 0;
}
export function luaEngineV70RegisterModInstallRetVa() {
  return LUA_V70_REGISTERMOD_INSTALL_RET_VA >>> 0;
}
export function luaEngineV70RegisterModInstallLiteralVa() {
  return LUA_V70_REGISTERMOD_INSTALL_LITERAL_VA >>> 0;
}
export function luaEngineV70RegisterModInstallRealFnVa() {
  return LUA_V70_REGISTERMOD_INSTALL_REAL_FN_VA >>> 0;
}
export function luaEngineV70RegisterModInstallNameVa() {
  return LUA_V70_REGISTERMOD_INSTALL_NAME_VA >>> 0;
}
export function luaEngineV70RegisterModInstallCallerVa() {
  return LUA_V70_REGISTERMOD_INSTALL_CALLER_VA >>> 0;
}
export function luaEngineV70GetItemConfigVa() {
  return LUA_V70_GETITEMCONFIG_VA >>> 0;
}
export function luaEngineV70GetItemConfigRetVa() {
  return LUA_V70_GETITEMCONFIG_RET_VA >>> 0;
}
export function luaEngineV70GetItemConfigNilRetVa() {
  return LUA_V70_GETITEMCONFIG_NIL_RET_VA >>> 0;
}
export function luaEngineV70GetItemConfigBodyBytes() {
  return (LUA_V70_GETITEMCONFIG_RET_VA - LUA_V70_GETITEMCONFIG_VA) >>> 0;
}
export function luaEngineV70GetItemConfigInsnCount() {
  return LUA_V70_GETITEMCONFIG_INSNS | 0;
}
export function luaEngineV70GetItemConfigTouserdataIndex() {
  return LUA_V70_GETITEMCONFIG_TOUSERDATA_INDEX_U32 >>> 0;
}
export function luaEngineV70GetItemConfigFnOff() {
  return LUA_V70_GETITEMCONFIG_FN_OFF >>> 0;
}
export function luaEngineV70GetItemConfigIatLuaTouserdata() {
  return LUA_V70_GETITEMCONFIG_IAT_LUA_TOUSERDATA >>> 0;
}
export function luaEngineV70GetItemConfigNullGateVa() {
  return LUA_V70_GETITEMCONFIG_NULL_GATE_VA >>> 0;
}
export function luaEngineV70GetItemConfigNewuserdataSize() {
  return LUA_V70_GETITEMCONFIG_NEWUSERDATA_SIZE >>> 0;
}
export function luaEngineV70GetItemConfigUdVtableVa() {
  return LUA_V70_GETITEMCONFIG_UD_VTABLE_VA >>> 0;
}
export function luaEngineV70GetItemConfigUdObjectOff() {
  return LUA_V70_GETITEMCONFIG_UD_OBJECT_OFF >>> 0;
}
export function luaEngineV70GetItemConfigRawgetpKey() {
  return LUA_V70_GETITEMCONFIG_RAWGETP_KEY >>> 0;
}
export function luaEngineV70GetItemConfigRegistryIndexU32() {
  return LUA_V70_GETITEMCONFIG_REGISTRY_INDEX_U32 >>> 0;
}
export function luaEngineV70GetItemConfigSetmetaIndexU32() {
  return LUA_V70_GETITEMCONFIG_SETMETA_INDEX_U32 >>> 0;
}
export function luaEngineV70GetItemConfigIatLuaNewuserdata() {
  return LUA_V70_GETITEMCONFIG_IAT_LUA_NEWUSERDATA >>> 0;
}
export function luaEngineV70GetItemConfigIatLuaRawgetp() {
  return LUA_V70_GETITEMCONFIG_IAT_LUA_RAWGETP >>> 0;
}
export function luaEngineV70GetItemConfigIatLuaSetmetatable() {
  return LUA_V70_GETITEMCONFIG_IAT_LUA_SETMETATABLE >>> 0;
}
export function luaEngineV70GetItemConfigIatLuaPushnil() {
  return LUA_V70_GETITEMCONFIG_IAT_LUA_PUSHNIL >>> 0;
}
export function luaEngineV70GetItemConfigRealFnArgCount() {
  return LUA_V70_GETITEMCONFIG_REAL_FN_ARG_COUNT >>> 0;
}
export function luaEngineV70GetItemConfigRealFnCleanup() {
  return LUA_V70_GETITEMCONFIG_REAL_FN_CLEANUP >>> 0;
}
export function luaEngineV70GetItemConfigReturnValue() {
  return LUA_V70_GETITEMCONFIG_RETURN_VALUE >>> 0;
}
export function luaEngineV70GetItemConfigInstallCount() {
  return LUA_V70_GETITEMCONFIG_INSTALL_COUNT >>> 0;
}
export function luaEngineV70GetItemConfigInstallVa() {
  return LUA_V70_GETITEMCONFIG_INSTALL_VA >>> 0;
}
export function luaEngineV70GetItemConfigInstallRetVa() {
  return LUA_V70_GETITEMCONFIG_INSTALL_RET_VA >>> 0;
}
export function luaEngineV70GetItemConfigInstallLiteralVa() {
  return LUA_V70_GETITEMCONFIG_INSTALL_LITERAL_VA >>> 0;
}
export function luaEngineV70GetItemConfigInstallRealFnVa() {
  return LUA_V70_GETITEMCONFIG_INSTALL_REAL_FN_VA >>> 0;
}
export function luaEngineV70GetItemConfigInstallNameVa() {
  return LUA_V70_GETITEMCONFIG_INSTALL_NAME_VA >>> 0;
}
export function luaEngineV70GetItemConfigInstallCallerVa() {
  return LUA_V70_GETITEMCONFIG_INSTALL_CALLER_VA >>> 0;
}
export function luaEngineV70GetFreeNearPositionVa() {
  return LUA_V70_GETFREENEARPOSITION_VA >>> 0;
}
export function luaEngineV70GetFreeNearPositionRetVa() {
  return LUA_V70_GETFREENEARPOSITION_RET_VA >>> 0;
}
export function luaEngineV70GetFreeNearPositionBodyBytes() {
  return (LUA_V70_GETFREENEARPOSITION_RET_VA - LUA_V70_GETFREENEARPOSITION_VA) >>> 0;
}
export function luaEngineV70GetFreeNearPositionInsnCount() {
  return LUA_V70_GETFREENEARPOSITION_INSNS | 0;
}
export function luaEngineV70GetFreeNearPositionTouserdataIndex() {
  return LUA_V70_GETFREENEARPOSITION_TOUSERDATA_INDEX_U32 >>> 0;
}
export function luaEngineV70GetFreeNearPositionFnOff() {
  return LUA_V70_GETFREENEARPOSITION_FN_OFF >>> 0;
}
export function luaEngineV70GetFreeNearPositionIatLuaTouserdata() {
  return LUA_V70_GETFREENEARPOSITION_IAT_LUA_TOUSERDATA >>> 0;
}
export function luaEngineV70GetFreeNearPositionChecknumberIatVa() {
  return LUA_V70_GETFREENEARPOSITION_CHECKNUMBER_IAT_VA >>> 0;
}
export function luaEngineV70GetFreeNearPositionArg2ChecknumberIndexU32() {
  return LUA_V70_GETFREENEARPOSITION_ARG2_CHECKNUMBER_INDEX_U32 >>> 0;
}
export function luaEngineV70GetFreeNearPositionGetargobjectVa() {
  return LUA_V70_GETFREENEARPOSITION_GETARGOBJECT_VA >>> 0;
}
export function luaEngineV70GetFreeNearPositionGetargobjectArgIndexU32() {
  return LUA_V70_GETFREENEARPOSITION_GETARGOBJECT_ARG_INDEX_U32 >>> 0;
}
export function luaEngineV70GetFreeNearPositionRealFnArgCount() {
  return LUA_V70_GETFREENEARPOSITION_REAL_FN_ARG_COUNT >>> 0;
}
export function luaEngineV70GetFreeNearPositionRealFnCleanup() {
  return LUA_V70_GETFREENEARPOSITION_REAL_FN_CLEANUP >>> 0;
}
export function luaEngineV70GetFreeNearPositionNewuserdataSize() {
  return LUA_V70_GETFREENEARPOSITION_NEWUSERDATA_SIZE >>> 0;
}
export function luaEngineV70GetFreeNearPositionUdVtableVa() {
  return LUA_V70_GETFREENEARPOSITION_UD_VTABLE_VA >>> 0;
}
export function luaEngineV70GetFreeNearPositionUdObjectOff() {
  return LUA_V70_GETFREENEARPOSITION_UD_OBJECT_OFF >>> 0;
}
export function luaEngineV70GetFreeNearPositionRawgetpKey() {
  return LUA_V70_GETFREENEARPOSITION_RAWGETP_KEY >>> 0;
}
export function luaEngineV70GetFreeNearPositionRegistryIndexU32() {
  return LUA_V70_GETFREENEARPOSITION_REGISTRY_INDEX_U32 >>> 0;
}
export function luaEngineV70GetFreeNearPositionSetmetaIndexU32() {
  return LUA_V70_GETFREENEARPOSITION_SETMETA_INDEX_U32 >>> 0;
}
export function luaEngineV70GetFreeNearPositionIatLuaNewuserdata() {
  return LUA_V70_GETFREENEARPOSITION_IAT_LUA_NEWUSERDATA >>> 0;
}
export function luaEngineV70GetFreeNearPositionIatLuaRawgetp() {
  return LUA_V70_GETFREENEARPOSITION_IAT_LUA_RAWGETP >>> 0;
}
export function luaEngineV70GetFreeNearPositionIatLuaSetmetatable() {
  return LUA_V70_GETFREENEARPOSITION_IAT_LUA_SETMETATABLE >>> 0;
}
export function luaEngineV70GetFreeNearPositionReturnValue() {
  return LUA_V70_GETFREENEARPOSITION_RETURN_VALUE >>> 0;
}
export function luaEngineV70GetFreeNearPositionInstallCount() {
  return LUA_V70_GETFREENEARPOSITION_INSTALL_COUNT >>> 0;
}
export function luaEngineV70GetFreeNearPositionInstallVa() {
  return LUA_V70_GETFREENEARPOSITION_INSTALL_VA >>> 0;
}
export function luaEngineV70GetFreeNearPositionInstallRetVa() {
  return LUA_V70_GETFREENEARPOSITION_INSTALL_RET_VA >>> 0;
}
export function luaEngineV70GetFreeNearPositionInstallLiteralVa() {
  return LUA_V70_GETFREENEARPOSITION_INSTALL_LITERAL_VA >>> 0;
}
export function luaEngineV70GetFreeNearPositionInstallRealFnVa() {
  return LUA_V70_GETFREENEARPOSITION_INSTALL_REAL_FN_VA >>> 0;
}
export function luaEngineV70GetFreeNearPositionInstallNameVa() {
  return LUA_V70_GETFREENEARPOSITION_INSTALL_NAME_VA >>> 0;
}
export function luaEngineV70GetFreeNearPositionInstallCallerVa() {
  return LUA_V70_GETFREENEARPOSITION_INSTALL_CALLER_VA >>> 0;
}
export function luaEngineV70RenderScaledTextVa() {
  return LUA_V70_RENDERSCALEDTEXT_VA >>> 0;
}
export function luaEngineV70RenderScaledTextRetVa() {
  return LUA_V70_RENDERSCALEDTEXT_RET_VA >>> 0;
}
export function luaEngineV70RenderScaledTextBodyBytes() {
  return (LUA_V70_RENDERSCALEDTEXT_RET_VA - LUA_V70_RENDERSCALEDTEXT_VA) >>> 0;
}
export function luaEngineV70RenderScaledTextInsnCount() {
  return LUA_V70_RENDERSCALEDTEXT_INSNS | 0;
}
export function luaEngineV70RenderScaledTextTouserdataIndex() {
  return LUA_V70_RENDERSCALEDTEXT_TOUSERDATA_INDEX_U32 >>> 0;
}
export function luaEngineV70RenderScaledTextFnOff() {
  return LUA_V70_RENDERSCALEDTEXT_FN_OFF >>> 0;
}
export function luaEngineV70RenderScaledTextIatLuaTouserdata() {
  return LUA_V70_RENDERSCALEDTEXT_IAT_LUA_TOUSERDATA >>> 0;
}
export function luaEngineV70RenderScaledTextSehHandlerVa() {
  return LUA_V70_RENDERSCALEDTEXT_SEH_HANDLER_VA >>> 0;
}
export function luaEngineV70RenderScaledTextBuilderVa() {
  return LUA_V70_RENDERSCALEDTEXT_BUILDER_VA >>> 0;
}
export function luaEngineV70RenderScaledTextChecklstringIatVa() {
  return LUA_V70_RENDERSCALEDTEXT_CHECKLSTRING_IAT_VA >>> 0;
}
export function luaEngineV70RenderScaledTextChecklstringIndexU32() {
  return LUA_V70_RENDERSCALEDTEXT_CHECKLSTRING_INDEX_U32 >>> 0;
}
export function luaEngineV70RenderScaledTextStringAssignVa() {
  return LUA_V70_RENDERSCALEDTEXT_STRING_ASSIGN_VA >>> 0;
}
export function luaEngineV70RenderScaledTextStringCopyCtorVa() {
  return LUA_V70_RENDERSCALEDTEXT_STRING_COPY_CTOR_VA >>> 0;
}
export function luaEngineV70RenderScaledTextStringDtorVa() {
  return LUA_V70_RENDERSCALEDTEXT_STRING_DTOR_VA >>> 0;
}
export function luaEngineV70RenderScaledTextSsoCapU32() {
  return LUA_V70_RENDERSCALEDTEXT_SSO_CAP_U32 >>> 0;
}
export function luaEngineV70RenderScaledTextFloatLaneCount() {
  return LUA_V70_RENDERSCALEDTEXT_FLOAT_LANE_COUNT >>> 0;
}
export function luaEngineV70RenderScaledTextRealFnArgCount() {
  return LUA_V70_RENDERSCALEDTEXT_REAL_FN_ARG_COUNT >>> 0;
}
export function luaEngineV70RenderScaledTextRealFnCleanup() {
  return LUA_V70_RENDERSCALEDTEXT_REAL_FN_CLEANUP >>> 0;
}
export function luaEngineV70RenderScaledTextReturnValue() {
  return LUA_V70_RENDERSCALEDTEXT_RETURN_VALUE >>> 0;
}
export function luaEngineV70RenderScaledTextInstallCount() {
  return LUA_V70_RENDERSCALEDTEXT_INSTALL_COUNT >>> 0;
}
export function luaEngineV70RenderScaledTextInstallVa() {
  return LUA_V70_RENDERSCALEDTEXT_INSTALL_VA >>> 0;
}
export function luaEngineV70RenderScaledTextInstallRetVa() {
  return LUA_V70_RENDERSCALEDTEXT_INSTALL_RET_VA >>> 0;
}
export function luaEngineV70RenderScaledTextInstallLiteralVa() {
  return LUA_V70_RENDERSCALEDTEXT_INSTALL_LITERAL_VA >>> 0;
}
export function luaEngineV70RenderScaledTextInstallRealFnVa() {
  return LUA_V70_RENDERSCALEDTEXT_INSTALL_REAL_FN_VA >>> 0;
}
export function luaEngineV70RenderScaledTextInstallNameVa() {
  return LUA_V70_RENDERSCALEDTEXT_INSTALL_NAME_VA >>> 0;
}
export function luaEngineV70RenderScaledTextInstallCallerVa() {
  return LUA_V70_RENDERSCALEDTEXT_INSTALL_CALLER_VA >>> 0;
}
/* ---- ABI v71: the 0x8991f0..0x8995c0 band (5 wrappers) ----
 * IsStringValidSeed/IsSpecialSeed 0x8992e0 (SEH bounded-peel,
 * BYTE bool gate + pushboolean), Seed2String 0x899390,
 * RemoveCurses 0x8994f0, GetDungeonPlacementSeed 0x899560,
 * DungeonReturnPosition setter 0x8995c0. LEA-corrected caller
 * census; Explode 0x898530 re-verified census row (no pure
 * decision prefix before first host call).
 * See section-notes/lua-v71-8992e0/NOTES.md. ---- */
export const LUA_V71_DUNGEONRETURNPOSITIONSETTER_CHECK_1_ARG_INDEX_U32 = 1;
export const LUA_V71_DUNGEONRETURNPOSITIONSETTER_CHECK_1_FLAGS_U32 = 0;
export const LUA_V71_DUNGEONRETURNPOSITIONSETTER_CHECK_1_KEY_VA = 13117962;
export const LUA_V71_DUNGEONRETURNPOSITIONSETTER_CHECK_2_ARG_INDEX_U32 = 2;
export const LUA_V71_DUNGEONRETURNPOSITIONSETTER_CHECK_2_FLAGS_U32 = 1;
export const LUA_V71_DUNGEONRETURNPOSITIONSETTER_CHECK_2_KEY_VA = 13117824;
export const LUA_V71_DUNGEONRETURNPOSITIONSETTER_CHECK_HELPER_VA = 8766864;
export const LUA_V71_DUNGEONRETURNPOSITIONSETTER_FN_OFF = 0;
export const LUA_V71_DUNGEONRETURNPOSITIONSETTER_GATE_1_VA = 9016793;
export const LUA_V71_DUNGEONRETURNPOSITIONSETTER_GATE_2_VA = 9016860;
export const LUA_V71_DUNGEONRETURNPOSITIONSETTER_IAT_LUA_TOUSERDATA = 11633584;
export const LUA_V71_DUNGEONRETURNPOSITIONSETTER_INSNS = 56;
export const LUA_V71_DUNGEONRETURNPOSITIONSETTER_INSTALL_CALLER_VA = 8834217;
export const LUA_V71_DUNGEONRETURNPOSITIONSETTER_INSTALL_COUNT = 1;
export const LUA_V71_DUNGEONRETURNPOSITIONSETTER_INSTALL_LITERAL_VA = 8987641;
export const LUA_V71_DUNGEONRETURNPOSITIONSETTER_INSTALL_NAME_VA = 12009628;
export const LUA_V71_DUNGEONRETURNPOSITIONSETTER_INSTALL_REAL_FN_VA = 5750368;
export const LUA_V71_DUNGEONRETURNPOSITIONSETTER_INSTALL_RET_VA = 8987727;
export const LUA_V71_DUNGEONRETURNPOSITIONSETTER_INSTALL_VA = 8987360;
export const LUA_V71_DUNGEONRETURNPOSITIONSETTER_LUA_TYPE_IAT_VA = 11633664;
export const LUA_V71_DUNGEONRETURNPOSITIONSETTER_REAL_FN_ARG_COUNT = 2;
export const LUA_V71_DUNGEONRETURNPOSITIONSETTER_REAL_FN_CLEANUP = 0;
export const LUA_V71_DUNGEONRETURNPOSITIONSETTER_RETURN_VALUE = 0;
export const LUA_V71_DUNGEONRETURNPOSITIONSETTER_RET_VA = 9016940;
export const LUA_V71_DUNGEONRETURNPOSITIONSETTER_TOUSERDATA_INDEX_U32 = 4293966295;
export const LUA_V71_DUNGEONRETURNPOSITIONSETTER_TYPE_1_INDEX_U32 = 1;
export const LUA_V71_DUNGEONRETURNPOSITIONSETTER_TYPE_2_INDEX_U32 = 2;
export const LUA_V71_DUNGEONRETURNPOSITIONSETTER_VA = 9016768;
export const LUA_V71_GETDUNGEONPLACEMENTSEED_CHECK_ARG_INDEX_U32 = 1;
export const LUA_V71_GETDUNGEONPLACEMENTSEED_CHECK_FLAGS_U32 = 1;
export const LUA_V71_GETDUNGEONPLACEMENTSEED_CHECK_HELPER_VA = 8766864;
export const LUA_V71_GETDUNGEONPLACEMENTSEED_CHECK_KEY_VA = 13117962;
export const LUA_V71_GETDUNGEONPLACEMENTSEED_FN_OFF = 0;
export const LUA_V71_GETDUNGEONPLACEMENTSEED_IAT_LUA_TOUSERDATA = 11633584;
export const LUA_V71_GETDUNGEONPLACEMENTSEED_INSNS = 35;
export const LUA_V71_GETDUNGEONPLACEMENTSEED_INSTALL_CALLER_VA = 8834613;
export const LUA_V71_GETDUNGEONPLACEMENTSEED_INSTALL_COUNT = 1;
export const LUA_V71_GETDUNGEONPLACEMENTSEED_INSTALL_LITERAL_VA = 8988221;
export const LUA_V71_GETDUNGEONPLACEMENTSEED_INSTALL_NAME_VA = 12010120;
export const LUA_V71_GETDUNGEONPLACEMENTSEED_INSTALL_REAL_FN_VA = 6344704;
export const LUA_V71_GETDUNGEONPLACEMENTSEED_INSTALL_RET_VA = 8988352;
export const LUA_V71_GETDUNGEONPLACEMENTSEED_INSTALL_VA = 8988192;
export const LUA_V71_GETDUNGEONPLACEMENTSEED_LUA_TYPE_IAT_VA = 11633664;
export const LUA_V71_GETDUNGEONPLACEMENTSEED_PUSHER_ROW = 1;
export const LUA_V71_GETDUNGEONPLACEMENTSEED_PUSHER_VA = 8765424;
export const LUA_V71_GETDUNGEONPLACEMENTSEED_REAL_FN_ARG_COUNT = 0;
export const LUA_V71_GETDUNGEONPLACEMENTSEED_REAL_FN_CLEANUP = 8;
export const LUA_V71_GETDUNGEONPLACEMENTSEED_RETURN_VALUE = 1;
export const LUA_V71_GETDUNGEONPLACEMENTSEED_RET_VA = 9016763;
export const LUA_V71_GETDUNGEONPLACEMENTSEED_TOUSERDATA_INDEX_U32 = 4293966295;
export const LUA_V71_GETDUNGEONPLACEMENTSEED_TYPE_GATE_VA = 9016692;
export const LUA_V71_GETDUNGEONPLACEMENTSEED_TYPE_INDEX_U32 = 1;
export const LUA_V71_GETDUNGEONPLACEMENTSEED_VA = 9016672;
export const LUA_V71_ISSTRINGVALIDSEED_BYTE_GATE_VA = 9016141;
export const LUA_V71_ISSTRINGVALIDSEED_CHECK_STRING_BUILDER_VA = 9150448;
export const LUA_V71_ISSTRINGVALIDSEED_FN_OFF = 0;
export const LUA_V71_ISSTRINGVALIDSEED_IAT_LUA_PUSHBOOLEAN = 11633644;
export const LUA_V71_ISSTRINGVALIDSEED_IAT_LUA_TOUSERDATA = 11633584;
export const LUA_V71_ISSTRINGVALIDSEED_INSNS = 61;
export const LUA_V71_ISSTRINGVALIDSEED_INSTALL_B_CALLER_VA = 8835328;
export const LUA_V71_ISSTRINGVALIDSEED_INSTALL_B_LITERAL_VA = 8990807;
export const LUA_V71_ISSTRINGVALIDSEED_INSTALL_B_NAME_VA = 12010608;
export const LUA_V71_ISSTRINGVALIDSEED_INSTALL_B_REAL_FN_VA = 6839968;
export const LUA_V71_ISSTRINGVALIDSEED_INSTALL_B_RET_VA = 8990873;
export const LUA_V71_ISSTRINGVALIDSEED_INSTALL_B_VA = 8990784;
export const LUA_V71_ISSTRINGVALIDSEED_INSTALL_CALLER_VA = 8835209;
export const LUA_V71_ISSTRINGVALIDSEED_INSTALL_COUNT = 2;
export const LUA_V71_ISSTRINGVALIDSEED_INSTALL_LITERAL_VA = 8990807;
export const LUA_V71_ISSTRINGVALIDSEED_INSTALL_NAME_VA = 12010484;
export const LUA_V71_ISSTRINGVALIDSEED_INSTALL_REAL_FN_VA = 10401168;
export const LUA_V71_ISSTRINGVALIDSEED_INSTALL_RET_VA = 8990873;
export const LUA_V71_ISSTRINGVALIDSEED_INSTALL_VA = 8990784;
export const LUA_V71_ISSTRINGVALIDSEED_REAL_FN_ARG_COUNT = 1;
export const LUA_V71_ISSTRINGVALIDSEED_REAL_FN_CLEANUP = 4;
export const LUA_V71_ISSTRINGVALIDSEED_RETURN_VALUE = 1;
export const LUA_V71_ISSTRINGVALIDSEED_RET_VA = 9016206;
export const LUA_V71_ISSTRINGVALIDSEED_SEH_HANDLER_VA = 11555589;
export const LUA_V71_ISSTRINGVALIDSEED_STRING_COPY_CTOR_VA = 4247376;
export const LUA_V71_ISSTRINGVALIDSEED_STRING_DTOR_VA = 4247616;
export const LUA_V71_ISSTRINGVALIDSEED_TOUSERDATA_INDEX_U32 = 4293966295;
export const LUA_V71_ISSTRINGVALIDSEED_VA = 9016032;
export const LUA_V71_REMOVECURSES_CHECKINTEGER_IAT_VA = 11633652;
export const LUA_V71_REMOVECURSES_CHECKINTEGER_INDEX_U32 = 2;
export const LUA_V71_REMOVECURSES_CHECK_ARG_INDEX_U32 = 1;
export const LUA_V71_REMOVECURSES_CHECK_FLAGS_U32 = 0;
export const LUA_V71_REMOVECURSES_CHECK_HELPER_VA = 8766864;
export const LUA_V71_REMOVECURSES_CHECK_KEY_VA = 13117962;
export const LUA_V71_REMOVECURSES_FN_OFF = 0;
export const LUA_V71_REMOVECURSES_IAT_LUA_TOUSERDATA = 11633584;
export const LUA_V71_REMOVECURSES_INSNS = 41;
export const LUA_V71_REMOVECURSES_INSTALL_CALLER_VA = 8834596;
export const LUA_V71_REMOVECURSES_INSTALL_COUNT = 1;
export const LUA_V71_REMOVECURSES_INSTALL_LITERAL_VA = 8988114;
export const LUA_V71_REMOVECURSES_INSTALL_NAME_VA = 12010104;
export const LUA_V71_REMOVECURSES_INSTALL_REAL_FN_VA = 7637952;
export const LUA_V71_REMOVECURSES_INSTALL_RET_VA = 8988182;
export const LUA_V71_REMOVECURSES_INSTALL_VA = 8988096;
export const LUA_V71_REMOVECURSES_LUA_TYPE_IAT_VA = 11633664;
export const LUA_V71_REMOVECURSES_REAL_FN_ARG_COUNT = 1;
export const LUA_V71_REMOVECURSES_REAL_FN_CLEANUP = 16;
export const LUA_V71_REMOVECURSES_RETURN_VALUE = 0;
export const LUA_V71_REMOVECURSES_RET_VA = 9016667;
export const LUA_V71_REMOVECURSES_TOUSERDATA_INDEX_U32 = 4293966295;
export const LUA_V71_REMOVECURSES_TYPE_GATE_VA = 9016586;
export const LUA_V71_REMOVECURSES_TYPE_INDEX_U32 = 1;
export const LUA_V71_REMOVECURSES_VA = 9016560;
export const LUA_V71_SEED2STRING_ALIGN_SLACK_U32 = 31;
export const LUA_V71_SEED2STRING_CHECKINTEGER_IAT_VA = 11633652;
export const LUA_V71_SEED2STRING_CHECKINTEGER_INDEX_U32 = 1;
export const LUA_V71_SEED2STRING_COOKIE_DAT_VA = 12555188;
export const LUA_V71_SEED2STRING_FN_OFF = 0;
export const LUA_V71_SEED2STRING_FREE_TAIL_VA = 11465052;
export const LUA_V71_SEED2STRING_HEAP_THRESHOLD_U32 = 4096;
export const LUA_V71_SEED2STRING_IAT_LUA_PUSHLSTRING = 11633628;
export const LUA_V71_SEED2STRING_IAT_LUA_TOUSERDATA = 11633584;
export const LUA_V71_SEED2STRING_INSNS = 58;
export const LUA_V71_SEED2STRING_INSTALL_CALLER_VA = 8835192;
export const LUA_V71_SEED2STRING_INSTALL_COUNT = 1;
export const LUA_V71_SEED2STRING_INSTALL_LITERAL_VA = 8990705;
export const LUA_V71_SEED2STRING_INSTALL_NAME_VA = 12010472;
export const LUA_V71_SEED2STRING_INSTALL_REAL_FN_VA = 10401200;
export const LUA_V71_SEED2STRING_INSTALL_RET_VA = 8990776;
export const LUA_V71_SEED2STRING_INSTALL_VA = 8990688;
export const LUA_V71_SEED2STRING_REAL_FN_ARG_COUNT = 2;
export const LUA_V71_SEED2STRING_REAL_FN_CLEANUP = 36;
export const LUA_V71_SEED2STRING_RETURN_VALUE = 1;
export const LUA_V71_SEED2STRING_RET_VA = 9016372;
export const LUA_V71_SEED2STRING_SECURITY_CHECK_VA = 11465003;
export const LUA_V71_SEED2STRING_SSO_CAP_U32 = 16;
export const LUA_V71_SEED2STRING_TOUSERDATA_INDEX_U32 = 4293966295;
export const LUA_V71_SEED2STRING_VA = 9016208;

export function luaEngineV71IsStringValidSeedByteGate(realFnResult) {
  /* BYTE gate mov bl,al; test bl,bl; setne cl @0x89934d..0x899358. */
  return (realFnResult & 0xff) !== 0 ? 1 : 0;
}
export function luaEngineV71IsStringValidSeedVa() {
  return LUA_V71_ISSTRINGVALIDSEED_VA >>> 0;
}
export function luaEngineV71IsStringValidSeedRetVa() {
  return LUA_V71_ISSTRINGVALIDSEED_RET_VA >>> 0;
}
export function luaEngineV71IsStringValidSeedBodyBytes() {
  return (LUA_V71_ISSTRINGVALIDSEED_RET_VA - LUA_V71_ISSTRINGVALIDSEED_VA) >>> 0;
}
export function luaEngineV71IsStringValidSeedInsnCount() {
  return LUA_V71_ISSTRINGVALIDSEED_INSNS >>> 0;
}
export function luaEngineV71IsStringValidSeedTouserdataIndex() {
  return LUA_V71_ISSTRINGVALIDSEED_TOUSERDATA_INDEX_U32 >>> 0;
}
export function luaEngineV71IsStringValidSeedFnOff() {
  return LUA_V71_ISSTRINGVALIDSEED_FN_OFF >>> 0;
}
export function luaEngineV71IsStringValidSeedIatLuaTouserdata() {
  return LUA_V71_ISSTRINGVALIDSEED_IAT_LUA_TOUSERDATA >>> 0;
}
export function luaEngineV71IsStringValidSeedSehHandlerVa() {
  return LUA_V71_ISSTRINGVALIDSEED_SEH_HANDLER_VA >>> 0;
}
export function luaEngineV71IsStringValidSeedCheckStringBuilderVa() {
  return LUA_V71_ISSTRINGVALIDSEED_CHECK_STRING_BUILDER_VA >>> 0;
}
export function luaEngineV71IsStringValidSeedStringCopyCtorVa() {
  return LUA_V71_ISSTRINGVALIDSEED_STRING_COPY_CTOR_VA >>> 0;
}
export function luaEngineV71IsStringValidSeedStringDtorVa() {
  return LUA_V71_ISSTRINGVALIDSEED_STRING_DTOR_VA >>> 0;
}
export function luaEngineV71IsStringValidSeedRealFnArgCount() {
  return LUA_V71_ISSTRINGVALIDSEED_REAL_FN_ARG_COUNT >>> 0;
}
export function luaEngineV71IsStringValidSeedRealFnCleanup() {
  return LUA_V71_ISSTRINGVALIDSEED_REAL_FN_CLEANUP >>> 0;
}
export function luaEngineV71IsStringValidSeedByteGateVa() {
  return LUA_V71_ISSTRINGVALIDSEED_BYTE_GATE_VA >>> 0;
}
export function luaEngineV71IsStringValidSeedIatLuaPushboolean() {
  return LUA_V71_ISSTRINGVALIDSEED_IAT_LUA_PUSHBOOLEAN >>> 0;
}
export function luaEngineV71IsStringValidSeedReturnValue() {
  return LUA_V71_ISSTRINGVALIDSEED_RETURN_VALUE >>> 0;
}
export function luaEngineV71IsStringValidSeedInstallCount() {
  return LUA_V71_ISSTRINGVALIDSEED_INSTALL_COUNT >>> 0;
}
export function luaEngineV71IsStringValidSeedInstallVa() {
  return LUA_V71_ISSTRINGVALIDSEED_INSTALL_VA >>> 0;
}
export function luaEngineV71IsStringValidSeedInstallRetVa() {
  return LUA_V71_ISSTRINGVALIDSEED_INSTALL_RET_VA >>> 0;
}
export function luaEngineV71IsStringValidSeedInstallLiteralVa() {
  return LUA_V71_ISSTRINGVALIDSEED_INSTALL_LITERAL_VA >>> 0;
}
export function luaEngineV71IsStringValidSeedInstallRealFnVa() {
  return LUA_V71_ISSTRINGVALIDSEED_INSTALL_REAL_FN_VA >>> 0;
}
export function luaEngineV71IsStringValidSeedInstallNameVa() {
  return LUA_V71_ISSTRINGVALIDSEED_INSTALL_NAME_VA >>> 0;
}
export function luaEngineV71IsStringValidSeedInstallCallerVa() {
  return LUA_V71_ISSTRINGVALIDSEED_INSTALL_CALLER_VA >>> 0;
}
export function luaEngineV71IsStringValidSeedInstallBVa() {
  return LUA_V71_ISSTRINGVALIDSEED_INSTALL_B_VA >>> 0;
}
export function luaEngineV71IsStringValidSeedInstallBRetVa() {
  return LUA_V71_ISSTRINGVALIDSEED_INSTALL_B_RET_VA >>> 0;
}
export function luaEngineV71IsStringValidSeedInstallBLiteralVa() {
  return LUA_V71_ISSTRINGVALIDSEED_INSTALL_B_LITERAL_VA >>> 0;
}
export function luaEngineV71IsStringValidSeedInstallBRealFnVa() {
  return LUA_V71_ISSTRINGVALIDSEED_INSTALL_B_REAL_FN_VA >>> 0;
}
export function luaEngineV71IsStringValidSeedInstallBNameVa() {
  return LUA_V71_ISSTRINGVALIDSEED_INSTALL_B_NAME_VA >>> 0;
}
export function luaEngineV71IsStringValidSeedInstallBCallerVa() {
  return LUA_V71_ISSTRINGVALIDSEED_INSTALL_B_CALLER_VA >>> 0;
}
export function luaEngineV71Seed2StringVa() {
  return LUA_V71_SEED2STRING_VA >>> 0;
}
export function luaEngineV71Seed2StringRetVa() {
  return LUA_V71_SEED2STRING_RET_VA >>> 0;
}
export function luaEngineV71Seed2StringBodyBytes() {
  return (LUA_V71_SEED2STRING_RET_VA - LUA_V71_SEED2STRING_VA) >>> 0;
}
export function luaEngineV71Seed2StringInsnCount() {
  return LUA_V71_SEED2STRING_INSNS >>> 0;
}
export function luaEngineV71Seed2StringTouserdataIndex() {
  return LUA_V71_SEED2STRING_TOUSERDATA_INDEX_U32 >>> 0;
}
export function luaEngineV71Seed2StringFnOff() {
  return LUA_V71_SEED2STRING_FN_OFF >>> 0;
}
export function luaEngineV71Seed2StringIatLuaTouserdata() {
  return LUA_V71_SEED2STRING_IAT_LUA_TOUSERDATA >>> 0;
}
export function luaEngineV71Seed2StringCheckintegerIatVa() {
  return LUA_V71_SEED2STRING_CHECKINTEGER_IAT_VA >>> 0;
}
export function luaEngineV71Seed2StringCheckintegerIndexU32() {
  return LUA_V71_SEED2STRING_CHECKINTEGER_INDEX_U32 >>> 0;
}
export function luaEngineV71Seed2StringRealFnArgCount() {
  return LUA_V71_SEED2STRING_REAL_FN_ARG_COUNT >>> 0;
}
export function luaEngineV71Seed2StringRealFnCleanup() {
  return LUA_V71_SEED2STRING_REAL_FN_CLEANUP >>> 0;
}
export function luaEngineV71Seed2StringIatLuaPushlstring() {
  return LUA_V71_SEED2STRING_IAT_LUA_PUSHLSTRING >>> 0;
}
export function luaEngineV71Seed2StringSsoCapU32() {
  return LUA_V71_SEED2STRING_SSO_CAP_U32 >>> 0;
}
export function luaEngineV71Seed2StringHeapThresholdU32() {
  return LUA_V71_SEED2STRING_HEAP_THRESHOLD_U32 >>> 0;
}
export function luaEngineV71Seed2StringAlignSlackU32() {
  return LUA_V71_SEED2STRING_ALIGN_SLACK_U32 >>> 0;
}
export function luaEngineV71Seed2StringFreeTailVa() {
  return LUA_V71_SEED2STRING_FREE_TAIL_VA >>> 0;
}
export function luaEngineV71Seed2StringCookieDatVa() {
  return LUA_V71_SEED2STRING_COOKIE_DAT_VA >>> 0;
}
export function luaEngineV71Seed2StringSecurityCheckVa() {
  return LUA_V71_SEED2STRING_SECURITY_CHECK_VA >>> 0;
}
export function luaEngineV71Seed2StringReturnValue() {
  return LUA_V71_SEED2STRING_RETURN_VALUE >>> 0;
}
export function luaEngineV71Seed2StringInstallCount() {
  return LUA_V71_SEED2STRING_INSTALL_COUNT >>> 0;
}
export function luaEngineV71Seed2StringInstallVa() {
  return LUA_V71_SEED2STRING_INSTALL_VA >>> 0;
}
export function luaEngineV71Seed2StringInstallRetVa() {
  return LUA_V71_SEED2STRING_INSTALL_RET_VA >>> 0;
}
export function luaEngineV71Seed2StringInstallLiteralVa() {
  return LUA_V71_SEED2STRING_INSTALL_LITERAL_VA >>> 0;
}
export function luaEngineV71Seed2StringInstallRealFnVa() {
  return LUA_V71_SEED2STRING_INSTALL_REAL_FN_VA >>> 0;
}
export function luaEngineV71Seed2StringInstallNameVa() {
  return LUA_V71_SEED2STRING_INSTALL_NAME_VA >>> 0;
}
export function luaEngineV71Seed2StringInstallCallerVa() {
  return LUA_V71_SEED2STRING_INSTALL_CALLER_VA >>> 0;
}
export function luaEngineV71RemoveCursesVa() {
  return LUA_V71_REMOVECURSES_VA >>> 0;
}
export function luaEngineV71RemoveCursesRetVa() {
  return LUA_V71_REMOVECURSES_RET_VA >>> 0;
}
export function luaEngineV71RemoveCursesBodyBytes() {
  return (LUA_V71_REMOVECURSES_RET_VA - LUA_V71_REMOVECURSES_VA) >>> 0;
}
export function luaEngineV71RemoveCursesInsnCount() {
  return LUA_V71_REMOVECURSES_INSNS >>> 0;
}
export function luaEngineV71RemoveCursesTouserdataIndex() {
  return LUA_V71_REMOVECURSES_TOUSERDATA_INDEX_U32 >>> 0;
}
export function luaEngineV71RemoveCursesFnOff() {
  return LUA_V71_REMOVECURSES_FN_OFF >>> 0;
}
export function luaEngineV71RemoveCursesIatLuaTouserdata() {
  return LUA_V71_REMOVECURSES_IAT_LUA_TOUSERDATA >>> 0;
}
export function luaEngineV71RemoveCursesLuaTypeIatVa() {
  return LUA_V71_REMOVECURSES_LUA_TYPE_IAT_VA >>> 0;
}
export function luaEngineV71RemoveCursesTypeIndexU32() {
  return LUA_V71_REMOVECURSES_TYPE_INDEX_U32 >>> 0;
}
export function luaEngineV71RemoveCursesTypeGateVa() {
  return LUA_V71_REMOVECURSES_TYPE_GATE_VA >>> 0;
}
export function luaEngineV71RemoveCursesCheckHelperVa() {
  return LUA_V71_REMOVECURSES_CHECK_HELPER_VA >>> 0;
}
export function luaEngineV71RemoveCursesCheckFlagsU32() {
  return LUA_V71_REMOVECURSES_CHECK_FLAGS_U32 >>> 0;
}
export function luaEngineV71RemoveCursesCheckKeyVa() {
  return LUA_V71_REMOVECURSES_CHECK_KEY_VA >>> 0;
}
export function luaEngineV71RemoveCursesCheckArgIndexU32() {
  return LUA_V71_REMOVECURSES_CHECK_ARG_INDEX_U32 >>> 0;
}
export function luaEngineV71RemoveCursesCheckintegerIatVa() {
  return LUA_V71_REMOVECURSES_CHECKINTEGER_IAT_VA >>> 0;
}
export function luaEngineV71RemoveCursesCheckintegerIndexU32() {
  return LUA_V71_REMOVECURSES_CHECKINTEGER_INDEX_U32 >>> 0;
}
export function luaEngineV71RemoveCursesRealFnArgCount() {
  return LUA_V71_REMOVECURSES_REAL_FN_ARG_COUNT >>> 0;
}
export function luaEngineV71RemoveCursesRealFnCleanup() {
  return LUA_V71_REMOVECURSES_REAL_FN_CLEANUP >>> 0;
}
export function luaEngineV71RemoveCursesReturnValue() {
  return LUA_V71_REMOVECURSES_RETURN_VALUE >>> 0;
}
export function luaEngineV71RemoveCursesInstallCount() {
  return LUA_V71_REMOVECURSES_INSTALL_COUNT >>> 0;
}
export function luaEngineV71RemoveCursesInstallVa() {
  return LUA_V71_REMOVECURSES_INSTALL_VA >>> 0;
}
export function luaEngineV71RemoveCursesInstallRetVa() {
  return LUA_V71_REMOVECURSES_INSTALL_RET_VA >>> 0;
}
export function luaEngineV71RemoveCursesInstallLiteralVa() {
  return LUA_V71_REMOVECURSES_INSTALL_LITERAL_VA >>> 0;
}
export function luaEngineV71RemoveCursesInstallRealFnVa() {
  return LUA_V71_REMOVECURSES_INSTALL_REAL_FN_VA >>> 0;
}
export function luaEngineV71RemoveCursesInstallNameVa() {
  return LUA_V71_REMOVECURSES_INSTALL_NAME_VA >>> 0;
}
export function luaEngineV71RemoveCursesInstallCallerVa() {
  return LUA_V71_REMOVECURSES_INSTALL_CALLER_VA >>> 0;
}
export function luaEngineV71GetDungeonPlacementSeedVa() {
  return LUA_V71_GETDUNGEONPLACEMENTSEED_VA >>> 0;
}
export function luaEngineV71GetDungeonPlacementSeedRetVa() {
  return LUA_V71_GETDUNGEONPLACEMENTSEED_RET_VA >>> 0;
}
export function luaEngineV71GetDungeonPlacementSeedBodyBytes() {
  return (LUA_V71_GETDUNGEONPLACEMENTSEED_RET_VA - LUA_V71_GETDUNGEONPLACEMENTSEED_VA) >>> 0;
}
export function luaEngineV71GetDungeonPlacementSeedInsnCount() {
  return LUA_V71_GETDUNGEONPLACEMENTSEED_INSNS >>> 0;
}
export function luaEngineV71GetDungeonPlacementSeedTouserdataIndex() {
  return LUA_V71_GETDUNGEONPLACEMENTSEED_TOUSERDATA_INDEX_U32 >>> 0;
}
export function luaEngineV71GetDungeonPlacementSeedFnOff() {
  return LUA_V71_GETDUNGEONPLACEMENTSEED_FN_OFF >>> 0;
}
export function luaEngineV71GetDungeonPlacementSeedIatLuaTouserdata() {
  return LUA_V71_GETDUNGEONPLACEMENTSEED_IAT_LUA_TOUSERDATA >>> 0;
}
export function luaEngineV71GetDungeonPlacementSeedLuaTypeIatVa() {
  return LUA_V71_GETDUNGEONPLACEMENTSEED_LUA_TYPE_IAT_VA >>> 0;
}
export function luaEngineV71GetDungeonPlacementSeedTypeIndexU32() {
  return LUA_V71_GETDUNGEONPLACEMENTSEED_TYPE_INDEX_U32 >>> 0;
}
export function luaEngineV71GetDungeonPlacementSeedTypeGateVa() {
  return LUA_V71_GETDUNGEONPLACEMENTSEED_TYPE_GATE_VA >>> 0;
}
export function luaEngineV71GetDungeonPlacementSeedCheckHelperVa() {
  return LUA_V71_GETDUNGEONPLACEMENTSEED_CHECK_HELPER_VA >>> 0;
}
export function luaEngineV71GetDungeonPlacementSeedCheckFlagsU32() {
  return LUA_V71_GETDUNGEONPLACEMENTSEED_CHECK_FLAGS_U32 >>> 0;
}
export function luaEngineV71GetDungeonPlacementSeedCheckKeyVa() {
  return LUA_V71_GETDUNGEONPLACEMENTSEED_CHECK_KEY_VA >>> 0;
}
export function luaEngineV71GetDungeonPlacementSeedCheckArgIndexU32() {
  return LUA_V71_GETDUNGEONPLACEMENTSEED_CHECK_ARG_INDEX_U32 >>> 0;
}
export function luaEngineV71GetDungeonPlacementSeedPusherVa() {
  return LUA_V71_GETDUNGEONPLACEMENTSEED_PUSHER_VA >>> 0;
}
export function luaEngineV71GetDungeonPlacementSeedPusherRow() {
  return LUA_V71_GETDUNGEONPLACEMENTSEED_PUSHER_ROW >>> 0;
}
export function luaEngineV71GetDungeonPlacementSeedRealFnArgCount() {
  return LUA_V71_GETDUNGEONPLACEMENTSEED_REAL_FN_ARG_COUNT >>> 0;
}
export function luaEngineV71GetDungeonPlacementSeedRealFnCleanup() {
  return LUA_V71_GETDUNGEONPLACEMENTSEED_REAL_FN_CLEANUP >>> 0;
}
export function luaEngineV71GetDungeonPlacementSeedReturnValue() {
  return LUA_V71_GETDUNGEONPLACEMENTSEED_RETURN_VALUE >>> 0;
}
export function luaEngineV71GetDungeonPlacementSeedInstallCount() {
  return LUA_V71_GETDUNGEONPLACEMENTSEED_INSTALL_COUNT >>> 0;
}
export function luaEngineV71GetDungeonPlacementSeedInstallVa() {
  return LUA_V71_GETDUNGEONPLACEMENTSEED_INSTALL_VA >>> 0;
}
export function luaEngineV71GetDungeonPlacementSeedInstallRetVa() {
  return LUA_V71_GETDUNGEONPLACEMENTSEED_INSTALL_RET_VA >>> 0;
}
export function luaEngineV71GetDungeonPlacementSeedInstallLiteralVa() {
  return LUA_V71_GETDUNGEONPLACEMENTSEED_INSTALL_LITERAL_VA >>> 0;
}
export function luaEngineV71GetDungeonPlacementSeedInstallRealFnVa() {
  return LUA_V71_GETDUNGEONPLACEMENTSEED_INSTALL_REAL_FN_VA >>> 0;
}
export function luaEngineV71GetDungeonPlacementSeedInstallNameVa() {
  return LUA_V71_GETDUNGEONPLACEMENTSEED_INSTALL_NAME_VA >>> 0;
}
export function luaEngineV71GetDungeonPlacementSeedInstallCallerVa() {
  return LUA_V71_GETDUNGEONPLACEMENTSEED_INSTALL_CALLER_VA >>> 0;
}
export function luaEngineV71DungeonReturnPositionSetterVa() {
  return LUA_V71_DUNGEONRETURNPOSITIONSETTER_VA >>> 0;
}
export function luaEngineV71DungeonReturnPositionSetterRetVa() {
  return LUA_V71_DUNGEONRETURNPOSITIONSETTER_RET_VA >>> 0;
}
export function luaEngineV71DungeonReturnPositionSetterBodyBytes() {
  return (LUA_V71_DUNGEONRETURNPOSITIONSETTER_RET_VA - LUA_V71_DUNGEONRETURNPOSITIONSETTER_VA) >>> 0;
}
export function luaEngineV71DungeonReturnPositionSetterInsnCount() {
  return LUA_V71_DUNGEONRETURNPOSITIONSETTER_INSNS >>> 0;
}
export function luaEngineV71DungeonReturnPositionSetterTouserdataIndex() {
  return LUA_V71_DUNGEONRETURNPOSITIONSETTER_TOUSERDATA_INDEX_U32 >>> 0;
}
export function luaEngineV71DungeonReturnPositionSetterFnOff() {
  return LUA_V71_DUNGEONRETURNPOSITIONSETTER_FN_OFF >>> 0;
}
export function luaEngineV71DungeonReturnPositionSetterIatLuaTouserdata() {
  return LUA_V71_DUNGEONRETURNPOSITIONSETTER_IAT_LUA_TOUSERDATA >>> 0;
}
export function luaEngineV71DungeonReturnPositionSetterLuaTypeIatVa() {
  return LUA_V71_DUNGEONRETURNPOSITIONSETTER_LUA_TYPE_IAT_VA >>> 0;
}
export function luaEngineV71DungeonReturnPositionSetterType1IndexU32() {
  return LUA_V71_DUNGEONRETURNPOSITIONSETTER_TYPE_1_INDEX_U32 >>> 0;
}
export function luaEngineV71DungeonReturnPositionSetterType2IndexU32() {
  return LUA_V71_DUNGEONRETURNPOSITIONSETTER_TYPE_2_INDEX_U32 >>> 0;
}
export function luaEngineV71DungeonReturnPositionSetterGate1Va() {
  return LUA_V71_DUNGEONRETURNPOSITIONSETTER_GATE_1_VA >>> 0;
}
export function luaEngineV71DungeonReturnPositionSetterGate2Va() {
  return LUA_V71_DUNGEONRETURNPOSITIONSETTER_GATE_2_VA >>> 0;
}
export function luaEngineV71DungeonReturnPositionSetterCheckHelperVa() {
  return LUA_V71_DUNGEONRETURNPOSITIONSETTER_CHECK_HELPER_VA >>> 0;
}
export function luaEngineV71DungeonReturnPositionSetterCheck1FlagsU32() {
  return LUA_V71_DUNGEONRETURNPOSITIONSETTER_CHECK_1_FLAGS_U32 >>> 0;
}
export function luaEngineV71DungeonReturnPositionSetterCheck1KeyVa() {
  return LUA_V71_DUNGEONRETURNPOSITIONSETTER_CHECK_1_KEY_VA >>> 0;
}
export function luaEngineV71DungeonReturnPositionSetterCheck1ArgIndexU32() {
  return LUA_V71_DUNGEONRETURNPOSITIONSETTER_CHECK_1_ARG_INDEX_U32 >>> 0;
}
export function luaEngineV71DungeonReturnPositionSetterCheck2FlagsU32() {
  return LUA_V71_DUNGEONRETURNPOSITIONSETTER_CHECK_2_FLAGS_U32 >>> 0;
}
export function luaEngineV71DungeonReturnPositionSetterCheck2KeyVa() {
  return LUA_V71_DUNGEONRETURNPOSITIONSETTER_CHECK_2_KEY_VA >>> 0;
}
export function luaEngineV71DungeonReturnPositionSetterCheck2ArgIndexU32() {
  return LUA_V71_DUNGEONRETURNPOSITIONSETTER_CHECK_2_ARG_INDEX_U32 >>> 0;
}
export function luaEngineV71DungeonReturnPositionSetterRealFnArgCount() {
  return LUA_V71_DUNGEONRETURNPOSITIONSETTER_REAL_FN_ARG_COUNT >>> 0;
}
export function luaEngineV71DungeonReturnPositionSetterRealFnCleanup() {
  return LUA_V71_DUNGEONRETURNPOSITIONSETTER_REAL_FN_CLEANUP >>> 0;
}
export function luaEngineV71DungeonReturnPositionSetterReturnValue() {
  return LUA_V71_DUNGEONRETURNPOSITIONSETTER_RETURN_VALUE >>> 0;
}
export function luaEngineV71DungeonReturnPositionSetterInstallCount() {
  return LUA_V71_DUNGEONRETURNPOSITIONSETTER_INSTALL_COUNT >>> 0;
}
export function luaEngineV71DungeonReturnPositionSetterInstallVa() {
  return LUA_V71_DUNGEONRETURNPOSITIONSETTER_INSTALL_VA >>> 0;
}
export function luaEngineV71DungeonReturnPositionSetterInstallRetVa() {
  return LUA_V71_DUNGEONRETURNPOSITIONSETTER_INSTALL_RET_VA >>> 0;
}
export function luaEngineV71DungeonReturnPositionSetterInstallLiteralVa() {
  return LUA_V71_DUNGEONRETURNPOSITIONSETTER_INSTALL_LITERAL_VA >>> 0;
}
export function luaEngineV71DungeonReturnPositionSetterInstallRealFnVa() {
  return LUA_V71_DUNGEONRETURNPOSITIONSETTER_INSTALL_REAL_FN_VA >>> 0;
}
export function luaEngineV71DungeonReturnPositionSetterInstallNameVa() {
  return LUA_V71_DUNGEONRETURNPOSITIONSETTER_INSTALL_NAME_VA >>> 0;
}
export function luaEngineV71DungeonReturnPositionSetterInstallCallerVa() {
  return LUA_V71_DUNGEONRETURNPOSITIONSETTER_INSTALL_CALLER_VA >>> 0;
}

/* ==== ABI v72: fourth-region wrapper real-fn twins 0x00899770 /
 * 0x00899790 — bounds-gated element-address getters (census
 * CORRECTION vs the family-frontier-survey note: NOT cmp predicates;
 * full PE decode shows a NULL-on-OOB indexer, strides 4 / 0xb8).
 * Evidence section-notes/lua-v72-899770/NOTES.md. ==== */
export const LUA_ENGINE_899770_VA = 0x00899770;
export const LUA_ENGINE_899770_END_VA = 0x0089978a;
export const LUA_ENGINE_899770_NEXT_VA = 0x00899790;
export const LUA_ENGINE_899770_BOUND_OFF = 0x0;
export const LUA_ENGINE_899770_BASE_OFF = 0x4;
export const LUA_ENGINE_899770_STRIDE = 0x4;
export const LUA_ENGINE_899770_STACK_ARGS = 0x1;
export const LUA_ENGINE_899770_THISCALL = 0x1;
export const LUA_ENGINE_899770_WRAPPER_ROW_VA = 0x008c59d0;
export const LUA_ENGINE_899770_CLASS_KEY = 0x00c82a30;
export const LUA_ENGINE_899770_HELPER_VA = 0x00891750;
export const LUA_ENGINE_899770_SLOT_STORE_VA = 0x00891946;
export const LUA_ENGINE_899790_VA = 0x00899790;
export const LUA_ENGINE_899790_END_VA = 0x008997ad;
export const LUA_ENGINE_899790_NEXT_VA = 0x008997b0;
export const LUA_ENGINE_899790_BOUND_OFF = 0x0;
export const LUA_ENGINE_899790_BASE_OFF = 0x4;
export const LUA_ENGINE_899790_STRIDE = 0xb8;
export const LUA_ENGINE_899790_STACK_ARGS = 0x1;
export const LUA_ENGINE_899790_THISCALL = 0x1;
export const LUA_ENGINE_899790_WRAPPER_ROW_VA = 0x008c5910;
export const LUA_ENGINE_899790_CLASS_KEY = 0x00c82a3c;
export const LUA_ENGINE_899790_HELPER_VA = 0x00891490;
export const LUA_ENGINE_899790_SLOT_STORE_VA = 0x00891686;

/** 0x899770 law: UNSIGNED bound gate; in-bounds -> &base[arg] stride 4
 * (`lea eax,[eax+edx*4]`), OOB -> 0. u32 wrap on the address math. */
export function luaEngine899770Index4(bound, base, arg) {
  const b = bound >>> 0;
  const a = arg >>> 0;
  return a < b ? ((base >>> 0) + a * 4) >>> 0 : 0;
}

/** 0x899790 law: same gate; stride 0xb8 (`imul eax,eax,0xb8`). */
export function luaEngine899790IndexB8(bound, base, arg) {
  const b = bound >>> 0;
  const a = arg >>> 0;
  return a < b ? ((base >>> 0) + a * 0xb8) >>> 0 : 0;
}

/* ==== ABI v73: wrapper-band continuation past the v72 twins —
 * 0x008997b0 (straight-line HOST wrapper, imms lawed) and 0x00899850
 * (pure islands: full-word type gate + check/get args + setne bool
 * word). Evidence section-notes/lua-v73-8997b0/NOTES.md. ==== */
export const LUA_ENGINE_8997B0_VA = 0x008997b0;
export const LUA_ENGINE_8997B0_END_VA = 0x00899847;
export const LUA_ENGINE_8997B0_NEXT_VA = 0x00899850;
export const LUA_ENGINE_8997B0_STACK_ARGS = 0x1;
export const LUA_ENGINE_8997B0_ECX_ARG = 0x1;
export const LUA_ENGINE_8997B0_CALLEE_POPS_STACK_ARGS = 0x0;
export const LUA_ENGINE_8997B0_UD_PAYLOAD_OFF = 0x0;
export const LUA_ENGINE_8997B0_NEWUSERDATA_SIZE = 0x4;
export const LUA_ENGINE_8997B0_CLOSURE_FN_VA = 0x008b3440;
export const LUA_ENGINE_8997B0_CLOSURE_NUPS = 0x1;
export const LUA_ENGINE_8997B0_PUSHVALUE_INDEX_U32 = 0xffffffff;
export const LUA_ENGINE_8997B0_TABLE_A_ABSINDEX_INDEX_U32 = 0xfffffffb;
export const LUA_ENGINE_8997B0_TABLE_B_ABSINDEX_INDEX_U32 = 0xfffffffd;
export const LUA_ENGINE_8997B0_ROTATE_INDEX_U32 = 0xfffffffe;
export const LUA_ENGINE_8997B0_ROTATE_N = 0x1;
export const LUA_ENGINE_8997B0_RAWSET_COUNT = 0x2;
export const LUA_ENGINE_8997B0_IAT_LUA_NEWUSERDATA = 0x00b1839c;
export const LUA_ENGINE_8997B0_IAT_LUA_PUSHCCLOSURE = 0x00b183fc;
export const LUA_ENGINE_8997B0_IAT_LUA_PUSHVALUE = 0x00b183c8;
export const LUA_ENGINE_8997B0_IAT_LUA_ABSINDEX = 0x00b18418;
export const LUA_ENGINE_8997B0_IAT_LUA_PUSHSTRING = 0x00b18414;
export const LUA_ENGINE_8997B0_IAT_LUA_ROTATE = 0x00b1840c;
export const LUA_ENGINE_8997B0_IAT_LUA_RAWSET = 0x00b18408;
export const LUA_ENGINE_899850_VA = 0x00899850;
export const LUA_ENGINE_899850_END_VA = 0x008998b9;
export const LUA_ENGINE_899850_NEXT_VA = 0x008998c0;
export const LUA_ENGINE_899850_STACK_ARGS = 0x1;
export const LUA_ENGINE_899850_ECX_ARG = 0x0;
export const LUA_ENGINE_899850_CALLEE_POPS_STACK_ARGS = 0x0;
export const LUA_ENGINE_899850_IAT_LUA_TYPE = 0x00b18400;
export const LUA_ENGINE_899850_CHECKGET_KEY = 0x00c82a04;
export const LUA_ENGINE_899850_CHECKGET_INDEX = 0x1;
export const LUA_ENGINE_899850_CHECKGET_DEF_ARG = 0x0;
export const LUA_ENGINE_899850_CHECKGET_FIELD_OFF = 0x4;
export const LUA_ENGINE_899850_CHECKGET_HELPER_VA = 0x0085c590;
export const LUA_ENGINE_899850_TOUSERDATA_INDEX_U32 = 0xfff0b9d7;
export const LUA_ENGINE_899850_IAT_LUA_TOUSERDATA = 0x00b183b0;
export const LUA_ENGINE_899850_TOBOOLEAN_INDEX = 0x2;
export const LUA_ENGINE_899850_IAT_LUA_TOBOOLEAN = 0x00b183e8;
export const LUA_ENGINE_899850_METHOD_VTABLE_FIELD_OFF = 0x0;

const a8997b0 = (c) => c >>> 0;

/** 0x8997b0 imm oracles (HOST wrapper: zero pure decisions; every
 * value below is an address-stable immediate in the PE decode). */
export function luaEngine8997B0Va() { return a8997b0(LUA_ENGINE_8997B0_VA); }
export function luaEngine8997B0EndVa() { return a8997b0(LUA_ENGINE_8997B0_END_VA); }
export function luaEngine8997B0NextVa() { return a8997b0(LUA_ENGINE_8997B0_NEXT_VA); }
export function luaEngine8997B0StackArgs() { return LUA_ENGINE_8997B0_STACK_ARGS | 0; }
export function luaEngine8997B0EcxArg() { return LUA_ENGINE_8997B0_ECX_ARG | 0; }
export function luaEngine8997B0CalleePopsStackArgs() { return LUA_ENGINE_8997B0_CALLEE_POPS_STACK_ARGS | 0; }
export function luaEngine8997B0UdPayloadOff() { return a8997b0(LUA_ENGINE_8997B0_UD_PAYLOAD_OFF); }
export function luaEngine8997B0NewuserdataSize() { return a8997b0(LUA_ENGINE_8997B0_NEWUSERDATA_SIZE); }
export function luaEngine8997B0ClosureFnVa() { return a8997b0(LUA_ENGINE_8997B0_CLOSURE_FN_VA); }
export function luaEngine8997B0ClosureNups() { return a8997b0(LUA_ENGINE_8997B0_CLOSURE_NUPS); }
export function luaEngine8997B0PushvalueIndex() { return a8997b0(LUA_ENGINE_8997B0_PUSHVALUE_INDEX_U32); }
export function luaEngine8997B0TableAAbsindexIndex() { return a8997b0(LUA_ENGINE_8997B0_TABLE_A_ABSINDEX_INDEX_U32); }
export function luaEngine8997B0TableBAbsindexIndex() { return a8997b0(LUA_ENGINE_8997B0_TABLE_B_ABSINDEX_INDEX_U32); }
export function luaEngine8997B0RotateIndex() { return a8997b0(LUA_ENGINE_8997B0_ROTATE_INDEX_U32); }
export function luaEngine8997B0RotateN() { return a8997b0(LUA_ENGINE_8997B0_ROTATE_N); }
export function luaEngine8997B0RawsetCount() { return a8997b0(LUA_ENGINE_8997B0_RAWSET_COUNT); }
export function luaEngine8997B0IatLuaNewuserdata() { return a8997b0(LUA_ENGINE_8997B0_IAT_LUA_NEWUSERDATA); }
export function luaEngine8997B0IatLuaPushcclosure() { return a8997b0(LUA_ENGINE_8997B0_IAT_LUA_PUSHCCLOSURE); }
export function luaEngine8997B0IatLuaPushvalue() { return a8997b0(LUA_ENGINE_8997B0_IAT_LUA_PUSHVALUE); }
export function luaEngine8997B0IatLuaAbsindex() { return a8997b0(LUA_ENGINE_8997B0_IAT_LUA_ABSINDEX); }
export function luaEngine8997B0IatLuaPushstring() { return a8997b0(LUA_ENGINE_8997B0_IAT_LUA_PUSHSTRING); }
export function luaEngine8997B0IatLuaRotate() { return a8997b0(LUA_ENGINE_8997B0_IAT_LUA_ROTATE); }
export function luaEngine8997B0IatLuaRawset() { return a8997b0(LUA_ENGINE_8997B0_IAT_LUA_RAWSET); }

/** 0x899850 imm oracles. */
export function luaEngine899850Va() { return LUA_ENGINE_899850_VA >>> 0; }
export function luaEngine899850EndVa() { return LUA_ENGINE_899850_END_VA >>> 0; }
export function luaEngine899850NextVa() { return LUA_ENGINE_899850_NEXT_VA >>> 0; }
export function luaEngine899850StackArgs() { return LUA_ENGINE_899850_STACK_ARGS | 0; }
export function luaEngine899850EcxArg() { return LUA_ENGINE_899850_ECX_ARG | 0; }
export function luaEngine899850CalleePopsStackArgs() { return LUA_ENGINE_899850_CALLEE_POPS_STACK_ARGS | 0; }
export function luaEngine899850IatLuaType() { return LUA_ENGINE_899850_IAT_LUA_TYPE >>> 0; }
export function luaEngine899850CheckgetKey() { return LUA_ENGINE_899850_CHECKGET_KEY >>> 0; }
export function luaEngine899850CheckgetIndex() { return LUA_ENGINE_899850_CHECKGET_INDEX >>> 0; }
export function luaEngine899850CheckgetDefArg() { return LUA_ENGINE_899850_CHECKGET_DEF_ARG >>> 0; }
export function luaEngine899850CheckgetFieldOff() { return LUA_ENGINE_899850_CHECKGET_FIELD_OFF >>> 0; }
export function luaEngine899850CheckgetHelperVa() { return LUA_ENGINE_899850_CHECKGET_HELPER_VA >>> 0; }
export function luaEngine899850TouserdataIndex() { return LUA_ENGINE_899850_TOUSERDATA_INDEX_U32 >>> 0; }
export function luaEngine899850IatLuaTouserdata() { return LUA_ENGINE_899850_IAT_LUA_TOUSERDATA >>> 0; }
export function luaEngine899850TobooleanIndex() { return LUA_ENGINE_899850_TOBOOLEAN_INDEX >>> 0; }
export function luaEngine899850IatLuaToboolean() { return LUA_ENGINE_899850_IAT_LUA_TOBOOLEAN >>> 0; }
export function luaEngine899850MethodVtableFieldOff() { return LUA_ENGINE_899850_METHOD_VTABLE_FIELD_OFF >>> 0; }

/** 0x899850 law 1: FULL-WORD lua_type(L,1) gate (`test eax,eax; jne
 * 0x89986e` @0x899866/68): nil -> null-object path, else check/get
 * path. Never byte-masked (0x100 -> check path). */
export function luaEngine899850Type1GateTaken(typeResult) {
  return typeResult !== 0 ? 1 : 0;
}

/** 0x899850 law 2: FULL-WORD lua_toboolean(L,2) normalize
 * (`test eax,eax; setne byte ptr [ebp-4]` @0x8998a3/a7): 0/1 word,
 * 0x100 -> 1, 0xffffffff -> 1. The method call arg is this byte. */
export function luaEngine899850BoolWord(tobooleanResult) {
  return tobooleanResult !== 0 ? 1 : 0;
}

/* ==== ABI v74: wrapper-band continuation — 0x008998c0 (boolean
 * getter: full-word type gate + check/get + BYTE al gate + pushboolean)
 * and 0x00899930 (box constructor: check/get 0xc82a01 + method out-pair
 * + 16-byte userdata box {vtable 0xb73538, self-ptr, payload} +
 * rawgetp/setmetatable metatable attach). Evidence
 * section-notes/lua-v74-8998c0/NOTES.md. ==== */
export const LUA_ENGINE_8998C0_VA = 0x008998c0;
export const LUA_ENGINE_8998C0_END_VA = 0x00899925;
export const LUA_ENGINE_8998C0_NEXT_VA = 0x00899930;
export const LUA_ENGINE_8998C0_STACK_ARGS = 0x1;
export const LUA_ENGINE_8998C0_ECX_ARG = 0x0;
export const LUA_ENGINE_8998C0_CALLEE_POPS_STACK_ARGS = 0x0;
export const LUA_ENGINE_8998C0_IAT_LUA_TYPE = 0x00b18400;
export const LUA_ENGINE_8998C0_CHECKGET_KEY = 0x00c82a04;
export const LUA_ENGINE_8998C0_CHECKGET_INDEX = 0x1;
export const LUA_ENGINE_8998C0_CHECKGET_DEF_ARG = 0x1;
export const LUA_ENGINE_8998C0_CHECKGET_FIELD_OFF = 0x4;
export const LUA_ENGINE_8998C0_CHECKGET_HELPER_VA = 0x0085c590;
export const LUA_ENGINE_8998C0_TOUSERDATA_INDEX_U32 = 0xfff0b9d7;
export const LUA_ENGINE_8998C0_IAT_LUA_TOUSERDATA = 0x00b183b0;
export const LUA_ENGINE_8998C0_METHOD_VTABLE_FIELD_OFF = 0x0;
export const LUA_ENGINE_8998C0_IAT_LUA_PUSHBOOLEAN = 0x00b183ec;
export const LUA_ENGINE_8998C0_RETURN_VALUE = 0x1;
export const LUA_ENGINE_899930_VA = 0x00899930;
export const LUA_ENGINE_899930_END_VA = 0x008999d2;
export const LUA_ENGINE_899930_NEXT_VA = 0x008999e0;
export const LUA_ENGINE_899930_STACK_ARGS = 0x1;
export const LUA_ENGINE_899930_ECX_ARG = 0x0;
export const LUA_ENGINE_899930_CALLEE_POPS_STACK_ARGS = 0x0;
export const LUA_ENGINE_899930_ALIGNED_PROLOGUE = 0x1;
export const LUA_ENGINE_899930_IAT_LUA_TOUSERDATA = 0x00b183b0;
export const LUA_ENGINE_899930_TOUSERDATA_INDEX_U32 = 0xfff0b9d7;
export const LUA_ENGINE_899930_IAT_LUA_TYPE = 0x00b18400;
export const LUA_ENGINE_899930_CHECKGET_KEY = 0x00c82a01;
export const LUA_ENGINE_899930_CHECKGET_INDEX = 0x1;
export const LUA_ENGINE_899930_CHECKGET_DEF_ARG = 0x1;
export const LUA_ENGINE_899930_CHECKGET_FIELD_OFF = 0x4;
export const LUA_ENGINE_899930_CHECKGET_HELPER_VA = 0x0085c590;
export const LUA_ENGINE_899930_METHOD_VTABLE_FIELD_OFF = 0x0;
export const LUA_ENGINE_899930_NEWUSERDATA_SIZE = 0x10;
export const LUA_ENGINE_899930_UD_VTABLE_VA = 0x00b73538;
export const LUA_ENGINE_899930_UD_PAYLOAD_PTR_OFF = 0x4;
export const LUA_ENGINE_899930_UD_PAYLOAD_OFF = 0x8;
export const LUA_ENGINE_899930_REGISTRY_INDEX_U32 = 0xfff0b9d8;
export const LUA_ENGINE_899930_METATABLE_RAWGETP_KEY = 0x00c82a33;
export const LUA_ENGINE_899930_IAT_LUA_RAWGETP = 0x00b183bc;
export const LUA_ENGINE_899930_IAT_LUA_SETMETATABLE = 0x00b18398;
export const LUA_ENGINE_899930_SETMETATABLE_INDEX_U32 = 0xfffffffe;
export const LUA_ENGINE_899930_RETURN_VALUE = 0x1;

/** 0x8998c0 imm oracles. */
export function luaEngine8998C0Va() { return LUA_ENGINE_8998C0_VA >>> 0; }
export function luaEngine8998C0EndVa() { return LUA_ENGINE_8998C0_END_VA >>> 0; }
export function luaEngine8998C0NextVa() { return LUA_ENGINE_8998C0_NEXT_VA >>> 0; }
export function luaEngine8998C0StackArgs() { return LUA_ENGINE_8998C0_STACK_ARGS | 0; }
export function luaEngine8998C0EcxArg() { return LUA_ENGINE_8998C0_ECX_ARG | 0; }
export function luaEngine8998C0CalleePopsStackArgs() { return LUA_ENGINE_8998C0_CALLEE_POPS_STACK_ARGS | 0; }
export function luaEngine8998C0IatLuaType() { return LUA_ENGINE_8998C0_IAT_LUA_TYPE >>> 0; }
export function luaEngine8998C0CheckgetKey() { return LUA_ENGINE_8998C0_CHECKGET_KEY >>> 0; }
export function luaEngine8998C0CheckgetIndex() { return LUA_ENGINE_8998C0_CHECKGET_INDEX >>> 0; }
export function luaEngine8998C0CheckgetDefArg() { return LUA_ENGINE_8998C0_CHECKGET_DEF_ARG >>> 0; }
export function luaEngine8998C0CheckgetFieldOff() { return LUA_ENGINE_8998C0_CHECKGET_FIELD_OFF >>> 0; }
export function luaEngine8998C0CheckgetHelperVa() { return LUA_ENGINE_8998C0_CHECKGET_HELPER_VA >>> 0; }
export function luaEngine8998C0TouserdataIndex() { return LUA_ENGINE_8998C0_TOUSERDATA_INDEX_U32 >>> 0; }
export function luaEngine8998C0IatLuaTouserdata() { return LUA_ENGINE_8998C0_IAT_LUA_TOUSERDATA >>> 0; }
export function luaEngine8998C0MethodVtableFieldOff() { return LUA_ENGINE_8998C0_METHOD_VTABLE_FIELD_OFF >>> 0; }
export function luaEngine8998C0IatLuaPushboolean() { return LUA_ENGINE_8998C0_IAT_LUA_PUSHBOOLEAN >>> 0; }
export function luaEngine8998C0ReturnValue() { return LUA_ENGINE_8998C0_RETURN_VALUE >>> 0; }

/** 0x899930 imm oracles. */
export function luaEngine899930Va() { return LUA_ENGINE_899930_VA >>> 0; }
export function luaEngine899930EndVa() { return LUA_ENGINE_899930_END_VA >>> 0; }
export function luaEngine899930NextVa() { return LUA_ENGINE_899930_NEXT_VA >>> 0; }
export function luaEngine899930StackArgs() { return LUA_ENGINE_899930_STACK_ARGS | 0; }
export function luaEngine899930EcxArg() { return LUA_ENGINE_899930_ECX_ARG | 0; }
export function luaEngine899930CalleePopsStackArgs() { return LUA_ENGINE_899930_CALLEE_POPS_STACK_ARGS | 0; }
export function luaEngine899930AlignedPrologue() { return LUA_ENGINE_899930_ALIGNED_PROLOGUE | 0; }
export function luaEngine899930IatLuaTouserdata() { return LUA_ENGINE_899930_IAT_LUA_TOUSERDATA >>> 0; }
export function luaEngine899930TouserdataIndex() { return LUA_ENGINE_899930_TOUSERDATA_INDEX_U32 >>> 0; }
export function luaEngine899930IatLuaType() { return LUA_ENGINE_899930_IAT_LUA_TYPE >>> 0; }
export function luaEngine899930CheckgetKey() { return LUA_ENGINE_899930_CHECKGET_KEY >>> 0; }
export function luaEngine899930CheckgetIndex() { return LUA_ENGINE_899930_CHECKGET_INDEX >>> 0; }
export function luaEngine899930CheckgetDefArg() { return LUA_ENGINE_899930_CHECKGET_DEF_ARG >>> 0; }
export function luaEngine899930CheckgetFieldOff() { return LUA_ENGINE_899930_CHECKGET_FIELD_OFF >>> 0; }
export function luaEngine899930CheckgetHelperVa() { return LUA_ENGINE_899930_CHECKGET_HELPER_VA >>> 0; }
export function luaEngine899930MethodVtableFieldOff() { return LUA_ENGINE_899930_METHOD_VTABLE_FIELD_OFF >>> 0; }
export function luaEngine899930NewuserdataSize() { return LUA_ENGINE_899930_NEWUSERDATA_SIZE >>> 0; }
export function luaEngine899930UdVtableVa() { return LUA_ENGINE_899930_UD_VTABLE_VA >>> 0; }
export function luaEngine899930UdPayloadPtrOff() { return LUA_ENGINE_899930_UD_PAYLOAD_PTR_OFF >>> 0; }
export function luaEngine899930UdPayloadOff() { return LUA_ENGINE_899930_UD_PAYLOAD_OFF >>> 0; }
export function luaEngine899930RegistryIndex() { return LUA_ENGINE_899930_REGISTRY_INDEX_U32 >>> 0; }
export function luaEngine899930MetatableRawgetpKey() { return LUA_ENGINE_899930_METATABLE_RAWGETP_KEY >>> 0; }
export function luaEngine899930IatLuaRawgetp() { return LUA_ENGINE_899930_IAT_LUA_RAWGETP >>> 0; }
export function luaEngine899930IatLuaSetmetatable() { return LUA_ENGINE_899930_IAT_LUA_SETMETATABLE >>> 0; }
export function luaEngine899930SetmetatableIndex() { return LUA_ENGINE_899930_SETMETATABLE_INDEX_U32 >>> 0; }
export function luaEngine899930ReturnValue() { return LUA_ENGINE_899930_RETURN_VALUE >>> 0; }

/** 0x8998c0 law 1: FULL-WORD lua_type(L,1) gate (`test eax,eax; jne
 * 0x8998dc` @0x8998d4/d6): nil -> null-object path, else check/get.
 * Never byte-masked (0x100 -> taken). Same shape as the 0x899850 gate. */
export function luaEngine8998C0Type1GateTaken(typeResult) {
  return typeResult !== 0 ? 1 : 0;
}

/** 0x8998c0 law 2: METHOD RETURN BYTE GATE (`test al,al; setne cl`
 * @0x89990c/0e) — only the method bool return's LOW BYTE matters:
 * 0x100/0xff00 behave like 0, 0x1ff/0xff like 1 (v61_return_gate
 * shape; NOT the full-word 0x899850 bool word). */
export function luaEngine8998C0MethodReturnByteGate(methodResult) {
  return (methodResult & 0xff) !== 0 ? 1 : 0;
}

/** 0x899930 law: FULL-WORD lua_type(L,1) gate (`test eax,eax; jne
 * 0x899960` @0x899958/5a): nil -> null object (ecx=0), else check/get
 * 0xc82a01. Never byte-masked. */
export function luaEngine899930Type1GateTaken(typeResult) {
  return typeResult !== 0 ? 1 : 0;
}

/* ==== ABI v75: wrapper-band continuation — 0x008999e0 (integer
 * getter: full-word type gate + check/get 0xc82a01 + method(obj) with
 * zero-extended dword result -> lua_pushinteger) and 0x00899a50 (box
 * constructor clone of 0x899930: key 0xc829fe, vtable 0xb7354c,
 * metatable rawgetp key 0xc82a36). Evidence
 * section-notes/lua-v75-8999e0/NOTES.md. ==== */
export const LUA_ENGINE_8999E0_VA = 0x008999e0;
export const LUA_ENGINE_8999E0_END_VA = 0x00899a46;
export const LUA_ENGINE_8999E0_NEXT_VA = 0x00899a50;
export const LUA_ENGINE_8999E0_STACK_ARGS = 0x1;
export const LUA_ENGINE_8999E0_ECX_ARG = 0x0;
export const LUA_ENGINE_8999E0_CALLEE_POPS_STACK_ARGS = 0x0;
export const LUA_ENGINE_8999E0_ALIGNED_PROLOGUE = 0x1;
export const LUA_ENGINE_8999E0_IAT_LUA_TOUSERDATA = 0x00b183b0;
export const LUA_ENGINE_8999E0_TOUSERDATA_INDEX_U32 = 0xfff0b9d7;
export const LUA_ENGINE_8999E0_IAT_LUA_TYPE = 0x00b18400;
export const LUA_ENGINE_8999E0_CHECKGET_KEY = 0x00c82a01;
export const LUA_ENGINE_8999E0_CHECKGET_INDEX = 0x1;
export const LUA_ENGINE_8999E0_CHECKGET_DEF_ARG = 0x1;
export const LUA_ENGINE_8999E0_CHECKGET_FIELD_OFF = 0x4;
export const LUA_ENGINE_8999E0_CHECKGET_HELPER_VA = 0x0085c590;
export const LUA_ENGINE_8999E0_METHOD_VTABLE_FIELD_OFF = 0x0;
export const LUA_ENGINE_8999E0_METHOD_STACK_ARGS = 0x1;
export const LUA_ENGINE_8999E0_IAT_LUA_PUSHINTEGER = 0x00b183f8;
export const LUA_ENGINE_8999E0_PUSHINTEGER_HI_WORD = 0x0;
export const LUA_ENGINE_8999E0_RETURN_VALUE = 0x1;
export const LUA_ENGINE_899A50_VA = 0x00899a50;
export const LUA_ENGINE_899A50_END_VA = 0x00899af2;
export const LUA_ENGINE_899A50_NEXT_VA = 0x00899b00;
export const LUA_ENGINE_899A50_STACK_ARGS = 0x1;
export const LUA_ENGINE_899A50_ECX_ARG = 0x0;
export const LUA_ENGINE_899A50_CALLEE_POPS_STACK_ARGS = 0x0;
export const LUA_ENGINE_899A50_ALIGNED_PROLOGUE = 0x1;
export const LUA_ENGINE_899A50_IAT_LUA_TOUSERDATA = 0x00b183b0;
export const LUA_ENGINE_899A50_TOUSERDATA_INDEX_U32 = 0xfff0b9d7;
export const LUA_ENGINE_899A50_IAT_LUA_TYPE = 0x00b18400;
export const LUA_ENGINE_899A50_CHECKGET_KEY = 0x00c829fe;
export const LUA_ENGINE_899A50_CHECKGET_INDEX = 0x1;
export const LUA_ENGINE_899A50_CHECKGET_DEF_ARG = 0x1;
export const LUA_ENGINE_899A50_CHECKGET_FIELD_OFF = 0x4;
export const LUA_ENGINE_899A50_CHECKGET_HELPER_VA = 0x0085c590;
export const LUA_ENGINE_899A50_METHOD_VTABLE_FIELD_OFF = 0x0;
export const LUA_ENGINE_899A50_METHOD_STACK_ARGS = 0x2;
export const LUA_ENGINE_899A50_NEWUSERDATA_SIZE = 0x10;
export const LUA_ENGINE_899A50_UD_VTABLE_VA = 0x00b7354c;
export const LUA_ENGINE_899A50_UD_PAYLOAD_PTR_OFF = 0x4;
export const LUA_ENGINE_899A50_UD_PAYLOAD_OFF = 0x8;
export const LUA_ENGINE_899A50_REGISTRY_INDEX_U32 = 0xfff0b9d8;
export const LUA_ENGINE_899A50_METATABLE_RAWGETP_KEY = 0x00c82a36;
export const LUA_ENGINE_899A50_IAT_LUA_RAWGETP = 0x00b183bc;
export const LUA_ENGINE_899A50_IAT_LUA_SETMETATABLE = 0x00b18398;
export const LUA_ENGINE_899A50_SETMETATABLE_INDEX_U32 = 0xfffffffe;
export const LUA_ENGINE_899A50_RETURN_VALUE = 0x1;

/** 0x8999e0 imm oracles. */
export function luaEngine8999E0Va() { return LUA_ENGINE_8999E0_VA >>> 0; }
export function luaEngine8999E0EndVa() { return LUA_ENGINE_8999E0_END_VA >>> 0; }
export function luaEngine8999E0NextVa() { return LUA_ENGINE_8999E0_NEXT_VA >>> 0; }
export function luaEngine8999E0StackArgs() { return LUA_ENGINE_8999E0_STACK_ARGS | 0; }
export function luaEngine8999E0EcxArg() { return LUA_ENGINE_8999E0_ECX_ARG | 0; }
export function luaEngine8999E0CalleePopsStackArgs() { return LUA_ENGINE_8999E0_CALLEE_POPS_STACK_ARGS | 0; }
export function luaEngine8999E0AlignedPrologue() { return LUA_ENGINE_8999E0_ALIGNED_PROLOGUE | 0; }
export function luaEngine8999E0IatLuaTouserdata() { return LUA_ENGINE_8999E0_IAT_LUA_TOUSERDATA >>> 0; }
export function luaEngine8999E0TouserdataIndex() { return LUA_ENGINE_8999E0_TOUSERDATA_INDEX_U32 >>> 0; }
export function luaEngine8999E0IatLuaType() { return LUA_ENGINE_8999E0_IAT_LUA_TYPE >>> 0; }
export function luaEngine8999E0CheckgetKey() { return LUA_ENGINE_8999E0_CHECKGET_KEY >>> 0; }
export function luaEngine8999E0CheckgetIndex() { return LUA_ENGINE_8999E0_CHECKGET_INDEX >>> 0; }
export function luaEngine8999E0CheckgetDefArg() { return LUA_ENGINE_8999E0_CHECKGET_DEF_ARG >>> 0; }
export function luaEngine8999E0CheckgetFieldOff() { return LUA_ENGINE_8999E0_CHECKGET_FIELD_OFF >>> 0; }
export function luaEngine8999E0CheckgetHelperVa() { return LUA_ENGINE_8999E0_CHECKGET_HELPER_VA >>> 0; }
export function luaEngine8999E0MethodVtableFieldOff() { return LUA_ENGINE_8999E0_METHOD_VTABLE_FIELD_OFF >>> 0; }
export function luaEngine8999E0MethodStackArgs() { return LUA_ENGINE_8999E0_METHOD_STACK_ARGS >>> 0; }
export function luaEngine8999E0IatLuaPushinteger() { return LUA_ENGINE_8999E0_IAT_LUA_PUSHINTEGER >>> 0; }
export function luaEngine8999E0PushintegerHiWord() { return LUA_ENGINE_8999E0_PUSHINTEGER_HI_WORD >>> 0; }
export function luaEngine8999E0ReturnValue() { return LUA_ENGINE_8999E0_RETURN_VALUE >>> 0; }

/** 0x899a50 imm oracles. */
export function luaEngine899A50Va() { return LUA_ENGINE_899A50_VA >>> 0; }
export function luaEngine899A50EndVa() { return LUA_ENGINE_899A50_END_VA >>> 0; }
export function luaEngine899A50NextVa() { return LUA_ENGINE_899A50_NEXT_VA >>> 0; }
export function luaEngine899A50StackArgs() { return LUA_ENGINE_899A50_STACK_ARGS | 0; }
export function luaEngine899A50EcxArg() { return LUA_ENGINE_899A50_ECX_ARG | 0; }
export function luaEngine899A50CalleePopsStackArgs() { return LUA_ENGINE_899A50_CALLEE_POPS_STACK_ARGS | 0; }
export function luaEngine899A50AlignedPrologue() { return LUA_ENGINE_899A50_ALIGNED_PROLOGUE | 0; }
export function luaEngine899A50IatLuaTouserdata() { return LUA_ENGINE_899A50_IAT_LUA_TOUSERDATA >>> 0; }
export function luaEngine899A50TouserdataIndex() { return LUA_ENGINE_899A50_TOUSERDATA_INDEX_U32 >>> 0; }
export function luaEngine899A50IatLuaType() { return LUA_ENGINE_899A50_IAT_LUA_TYPE >>> 0; }
export function luaEngine899A50CheckgetKey() { return LUA_ENGINE_899A50_CHECKGET_KEY >>> 0; }
export function luaEngine899A50CheckgetIndex() { return LUA_ENGINE_899A50_CHECKGET_INDEX >>> 0; }
export function luaEngine899A50CheckgetDefArg() { return LUA_ENGINE_899A50_CHECKGET_DEF_ARG >>> 0; }
export function luaEngine899A50CheckgetFieldOff() { return LUA_ENGINE_899A50_CHECKGET_FIELD_OFF >>> 0; }
export function luaEngine899A50CheckgetHelperVa() { return LUA_ENGINE_899A50_CHECKGET_HELPER_VA >>> 0; }
export function luaEngine899A50MethodVtableFieldOff() { return LUA_ENGINE_899A50_METHOD_VTABLE_FIELD_OFF >>> 0; }
export function luaEngine899A50MethodStackArgs() { return LUA_ENGINE_899A50_METHOD_STACK_ARGS >>> 0; }
export function luaEngine899A50NewuserdataSize() { return LUA_ENGINE_899A50_NEWUSERDATA_SIZE >>> 0; }
export function luaEngine899A50UdVtableVa() { return LUA_ENGINE_899A50_UD_VTABLE_VA >>> 0; }
export function luaEngine899A50UdPayloadPtrOff() { return LUA_ENGINE_899A50_UD_PAYLOAD_PTR_OFF >>> 0; }
export function luaEngine899A50UdPayloadOff() { return LUA_ENGINE_899A50_UD_PAYLOAD_OFF >>> 0; }
export function luaEngine899A50RegistryIndex() { return LUA_ENGINE_899A50_REGISTRY_INDEX_U32 >>> 0; }
export function luaEngine899A50MetatableRawgetpKey() { return LUA_ENGINE_899A50_METATABLE_RAWGETP_KEY >>> 0; }
export function luaEngine899A50IatLuaRawgetp() { return LUA_ENGINE_899A50_IAT_LUA_RAWGETP >>> 0; }
export function luaEngine899A50IatLuaSetmetatable() { return LUA_ENGINE_899A50_IAT_LUA_SETMETATABLE >>> 0; }
export function luaEngine899A50SetmetatableIndex() { return LUA_ENGINE_899A50_SETMETATABLE_INDEX_U32 >>> 0; }
export function luaEngine899A50ReturnValue() { return LUA_ENGINE_899A50_RETURN_VALUE >>> 0; }

/** 0x8999e0 law: FULL-WORD lua_type(L,1) gate (`test eax,eax; jne
 * 0x899a0d` @0x899a05/07): nil -> null object (edx=0), else check/get
 * 0xc82a01. Never byte-masked. */
export function luaEngine8999E0Type1GateTaken(typeResult) {
  return typeResult !== 0 ? 1 : 0;
}

/** 0x899a50 law: FULL-WORD lua_type(L,1) gate (`test eax,eax; jne
 * 0x899a80` @0x899a78/7a): nil -> null object (ecx=0), else check/get
 * 0xc829fe. Never byte-masked. */
export function luaEngine899A50Type1GateTaken(typeResult) {
  return typeResult !== 0 ? 1 : 0;
}

/* ==== ABI v76: wrapper-band continuation — 0x00899b00 (integer-arg
 * method call: full-word type gate + check/get 0xc829e6 def 0 +
 * lua_checkinteger(L,2) + method(arg, obj) stack-arg call, ret 0) and
 * 0x00899b70 (sext-pusher band: check/get 0xc82a01-twin key 0xc829e6
 * def 1 + method(obj) no-arg call + result -> 0x85bfd0 sext pusher,
 * ret 1). Evidence section-notes/lua-v76-899b00/NOTES.md. ==== */
export const LUA_ENGINE_899B00_VA = 0x00899b00;
export const LUA_ENGINE_899B00_END_VA = 0x00899b6c;
export const LUA_ENGINE_899B00_NEXT_VA = 0x00899b70;
export const LUA_ENGINE_899B00_STACK_ARGS = 0x1;
export const LUA_ENGINE_899B00_ECX_ARG = 0x0;
export const LUA_ENGINE_899B00_CALLEE_POPS_STACK_ARGS = 0x0;
export const LUA_ENGINE_899B00_ALIGNED_PROLOGUE = 0x1;
export const LUA_ENGINE_899B00_IAT_LUA_TYPE = 0x00b18400;
export const LUA_ENGINE_899B00_CHECKGET_KEY = 0x00c829e6;
export const LUA_ENGINE_899B00_CHECKGET_INDEX = 0x1;
export const LUA_ENGINE_899B00_CHECKGET_DEF_ARG = 0x0;
export const LUA_ENGINE_899B00_CHECKGET_FIELD_OFF = 0x4;
export const LUA_ENGINE_899B00_CHECKGET_HELPER_VA = 0x0085c590;
export const LUA_ENGINE_899B00_IAT_LUA_TOUSERDATA = 0x00b183b0;
export const LUA_ENGINE_899B00_TOUSERDATA_INDEX_U32 = 0xfff0b9d7;
export const LUA_ENGINE_899B00_METHOD_VTABLE_FIELD_OFF = 0x0;
export const LUA_ENGINE_899B00_IAT_LUA_CHECKINTEGER = 0x00b183f4;
export const LUA_ENGINE_899B00_CHECKINTEGER_INDEX = 0x2;
export const LUA_ENGINE_899B00_METHOD_STACK_ARGS = 0x1;
export const LUA_ENGINE_899B00_RETURN_VALUE = 0x0;
export const LUA_ENGINE_899B70_VA = 0x00899b70;
export const LUA_ENGINE_899B70_END_VA = 0x00899bcc;
export const LUA_ENGINE_899B70_NEXT_VA = 0x00899bd0;
export const LUA_ENGINE_899B70_STACK_ARGS = 0x1;
export const LUA_ENGINE_899B70_ECX_ARG = 0x0;
export const LUA_ENGINE_899B70_CALLEE_POPS_STACK_ARGS = 0x0;
export const LUA_ENGINE_899B70_ALIGNED_PROLOGUE = 0x0;
export const LUA_ENGINE_899B70_IAT_LUA_TYPE = 0x00b18400;
export const LUA_ENGINE_899B70_CHECKGET_KEY = 0x00c829e6;
export const LUA_ENGINE_899B70_CHECKGET_INDEX = 0x1;
export const LUA_ENGINE_899B70_CHECKGET_DEF_ARG = 0x1;
export const LUA_ENGINE_899B70_CHECKGET_FIELD_OFF = 0x4;
export const LUA_ENGINE_899B70_CHECKGET_HELPER_VA = 0x0085c590;
export const LUA_ENGINE_899B70_IAT_LUA_TOUSERDATA = 0x00b183b0;
export const LUA_ENGINE_899B70_TOUSERDATA_INDEX_U32 = 0xfff0b9d7;
export const LUA_ENGINE_899B70_METHOD_VTABLE_FIELD_OFF = 0x0;
export const LUA_ENGINE_899B70_METHOD_STACK_ARGS = 0x0;
export const LUA_ENGINE_899B70_PUSHER_HELPER_VA = 0x0085bfd0;
export const LUA_ENGINE_899B70_RETURN_VALUE = 0x1;

/** 0x899b00 imm oracles. */
export function luaEngine899B00Va() { return LUA_ENGINE_899B00_VA >>> 0; }
export function luaEngine899B00EndVa() { return LUA_ENGINE_899B00_END_VA >>> 0; }
export function luaEngine899B00NextVa() { return LUA_ENGINE_899B00_NEXT_VA >>> 0; }
export function luaEngine899B00StackArgs() { return LUA_ENGINE_899B00_STACK_ARGS | 0; }
export function luaEngine899B00EcxArg() { return LUA_ENGINE_899B00_ECX_ARG | 0; }
export function luaEngine899B00CalleePopsStackArgs() { return LUA_ENGINE_899B00_CALLEE_POPS_STACK_ARGS | 0; }
export function luaEngine899B00AlignedPrologue() { return LUA_ENGINE_899B00_ALIGNED_PROLOGUE | 0; }
export function luaEngine899B00IatLuaType() { return LUA_ENGINE_899B00_IAT_LUA_TYPE >>> 0; }
export function luaEngine899B00CheckgetKey() { return LUA_ENGINE_899B00_CHECKGET_KEY >>> 0; }
export function luaEngine899B00CheckgetIndex() { return LUA_ENGINE_899B00_CHECKGET_INDEX >>> 0; }
export function luaEngine899B00CheckgetDefArg() { return LUA_ENGINE_899B00_CHECKGET_DEF_ARG >>> 0; }
export function luaEngine899B00CheckgetFieldOff() { return LUA_ENGINE_899B00_CHECKGET_FIELD_OFF >>> 0; }
export function luaEngine899B00CheckgetHelperVa() { return LUA_ENGINE_899B00_CHECKGET_HELPER_VA >>> 0; }
export function luaEngine899B00IatLuaTouserdata() { return LUA_ENGINE_899B00_IAT_LUA_TOUSERDATA >>> 0; }
export function luaEngine899B00TouserdataIndex() { return LUA_ENGINE_899B00_TOUSERDATA_INDEX_U32 >>> 0; }
export function luaEngine899B00MethodVtableFieldOff() { return LUA_ENGINE_899B00_METHOD_VTABLE_FIELD_OFF >>> 0; }
export function luaEngine899B00IatLuaCheckinteger() { return LUA_ENGINE_899B00_IAT_LUA_CHECKINTEGER >>> 0; }
export function luaEngine899B00CheckintegerIndex() { return LUA_ENGINE_899B00_CHECKINTEGER_INDEX >>> 0; }
export function luaEngine899B00MethodStackArgs() { return LUA_ENGINE_899B00_METHOD_STACK_ARGS >>> 0; }
export function luaEngine899B00ReturnValue() { return LUA_ENGINE_899B00_RETURN_VALUE >>> 0; }

/** 0x899b70 imm oracles. */
export function luaEngine899B70Va() { return LUA_ENGINE_899B70_VA >>> 0; }
export function luaEngine899B70EndVa() { return LUA_ENGINE_899B70_END_VA >>> 0; }
export function luaEngine899B70NextVa() { return LUA_ENGINE_899B70_NEXT_VA >>> 0; }
export function luaEngine899B70StackArgs() { return LUA_ENGINE_899B70_STACK_ARGS | 0; }
export function luaEngine899B70EcxArg() { return LUA_ENGINE_899B70_ECX_ARG | 0; }
export function luaEngine899B70CalleePopsStackArgs() { return LUA_ENGINE_899B70_CALLEE_POPS_STACK_ARGS | 0; }
export function luaEngine899B70AlignedPrologue() { return LUA_ENGINE_899B70_ALIGNED_PROLOGUE | 0; }
export function luaEngine899B70IatLuaType() { return LUA_ENGINE_899B70_IAT_LUA_TYPE >>> 0; }
export function luaEngine899B70CheckgetKey() { return LUA_ENGINE_899B70_CHECKGET_KEY >>> 0; }
export function luaEngine899B70CheckgetIndex() { return LUA_ENGINE_899B70_CHECKGET_INDEX >>> 0; }
export function luaEngine899B70CheckgetDefArg() { return LUA_ENGINE_899B70_CHECKGET_DEF_ARG >>> 0; }
export function luaEngine899B70CheckgetFieldOff() { return LUA_ENGINE_899B70_CHECKGET_FIELD_OFF >>> 0; }
export function luaEngine899B70CheckgetHelperVa() { return LUA_ENGINE_899B70_CHECKGET_HELPER_VA >>> 0; }
export function luaEngine899B70IatLuaTouserdata() { return LUA_ENGINE_899B70_IAT_LUA_TOUSERDATA >>> 0; }
export function luaEngine899B70TouserdataIndex() { return LUA_ENGINE_899B70_TOUSERDATA_INDEX_U32 >>> 0; }
export function luaEngine899B70MethodVtableFieldOff() { return LUA_ENGINE_899B70_METHOD_VTABLE_FIELD_OFF >>> 0; }
export function luaEngine899B70MethodStackArgs() { return LUA_ENGINE_899B70_METHOD_STACK_ARGS >>> 0; }
export function luaEngine899B70PusherHelperVa() { return LUA_ENGINE_899B70_PUSHER_HELPER_VA >>> 0; }
export function luaEngine899B70ReturnValue() { return LUA_ENGINE_899B70_RETURN_VALUE >>> 0; }

/** 0x899b00 law: FULL-WORD lua_type(L,1) gate (`test eax,eax; jne
 * 0x899b24` @0x899b1a/1c): nil -> null object ([esp+0xc]=0), else
 * check/get 0xc829e6. Never byte-masked. */
export function luaEngine899B00Type1GateTaken(typeResult) {
  return typeResult !== 0 ? 1 : 0;
}

/** 0x899b70 law: FULL-WORD lua_type(L,1) gate (`test eax,eax; jne
 * 0x899b8c` @0x899b84/86): nil -> null object (edi=0), else check/get
 * 0xc829e6. Never byte-masked. */
export function luaEngine899B70Type1GateTaken(typeResult) {
  return typeResult !== 0 ? 1 : 0;
}
export const LUA_ENGINE_899BD0_VA = 0x00899bd0;
export const LUA_ENGINE_899BD0_END_VA = 0x00899c69;
export const LUA_ENGINE_899BD0_NEXT_VA = 0x00899c70;
export const LUA_ENGINE_899BD0_STACK_ARGS = 0x00000001;
export const LUA_ENGINE_899BD0_ECX_ARG = 0x00000000;
export const LUA_ENGINE_899BD0_CALLEE_POPS_STACK_ARGS = 0x00000000;
export const LUA_ENGINE_899BD0_ALIGNED_PROLOGUE = 0x00000000;
export const LUA_ENGINE_899BD0_GATE_INVERTED_ENCODING = 0x1;
export const LUA_ENGINE_899BD0_IAT_LUA_TYPE = 0x00b18400;
export const LUA_ENGINE_899BD0_CHECKGET_KEY = 0x00c82a1e;
export const LUA_ENGINE_899BD0_CHECKGET_INDEX = 0x1;
export const LUA_ENGINE_899BD0_CHECKGET_DEF_ARG = 0x00000001;
export const LUA_ENGINE_899BD0_CHECKGET_FIELD_OFF = 0x4;
export const LUA_ENGINE_899BD0_CHECKGET_HELPER_VA = 0x0085c590;
export const LUA_ENGINE_899BD0_CAST_HELPER_VA = 0x00af08b1;
export const LUA_ENGINE_899BD0_CAST_VF_DELTA = 0x0;
export const LUA_ENGINE_899BD0_CAST_SRC_TYPE_VA = 0x00c5d7a4;
export const LUA_ENGINE_899BD0_CAST_DST_TYPE_VA = 0x00c5e8ec;
export const LUA_ENGINE_899BD0_CAST_IS_REFERENCE = 0x0;
export const LUA_ENGINE_899BD0_IAT_LUA_PUSHNIL = 0x00b183e0;
export const LUA_ENGINE_899BD0_NEWUSERDATA_SIZE = 0x00000008;
export const LUA_ENGINE_899BD0_UD_VTABLE_VA = 0x00b753c8;
export const LUA_ENGINE_899BD0_UD_PTR_FIELD_OFF = 0x00000004;
export const LUA_ENGINE_899BD0_REGISTRY_INDEX_U32 = 0xfff0b9d8;
export const LUA_ENGINE_899BD0_METATABLE_RAWGETP_KEY = 0x00c829f1;
export const LUA_ENGINE_899BD0_IAT_LUA_RAWGETP = 0x00b183bc;
export const LUA_ENGINE_899BD0_IAT_LUA_SETMETATABLE = 0x00b18398;
export const LUA_ENGINE_899BD0_SETMETATABLE_INDEX_U32 = 0xfffffffe;
export const LUA_ENGINE_899BD0_RETURN_VALUE = 0x1;
/** 0x899bd0 imm oracles. */
export function luaEngine899bd0HostVa() { return LUA_ENGINE_899BD0_VA >>> 0; }
export function luaEngine899bd0EndVa() { return LUA_ENGINE_899BD0_END_VA >>> 0; }
export function luaEngine899bd0NextVa() { return LUA_ENGINE_899BD0_NEXT_VA >>> 0; }
export function luaEngine899bd0StackArgs() { return LUA_ENGINE_899BD0_STACK_ARGS >>> 0; }
export function luaEngine899bd0EcxArg() { return LUA_ENGINE_899BD0_ECX_ARG >>> 0; }
export function luaEngine899bd0CalleePopsStackArgs() { return LUA_ENGINE_899BD0_CALLEE_POPS_STACK_ARGS >>> 0; }
export function luaEngine899bd0AlignedPrologue() { return LUA_ENGINE_899BD0_ALIGNED_PROLOGUE >>> 0; }
export function luaEngine899bd0IatLuaType() { return LUA_ENGINE_899BD0_IAT_LUA_TYPE >>> 0; }
export function luaEngine899bd0GateInvertedEncoding() { return LUA_ENGINE_899BD0_GATE_INVERTED_ENCODING >>> 0; }
export function luaEngine899bd0CheckgetKey() { return LUA_ENGINE_899BD0_CHECKGET_KEY >>> 0; }
export function luaEngine899bd0CheckgetIndex() { return LUA_ENGINE_899BD0_CHECKGET_INDEX >>> 0; }
export function luaEngine899bd0CheckgetDefArg() { return LUA_ENGINE_899BD0_CHECKGET_DEF_ARG >>> 0; }
export function luaEngine899bd0CheckgetFieldOff() { return LUA_ENGINE_899BD0_CHECKGET_FIELD_OFF >>> 0; }
export function luaEngine899bd0CheckgetHelperVa() { return LUA_ENGINE_899BD0_CHECKGET_HELPER_VA >>> 0; }
export function luaEngine899bd0CastHelperVa() { return LUA_ENGINE_899BD0_CAST_HELPER_VA >>> 0; }
export function luaEngine899bd0CastVfDelta() { return LUA_ENGINE_899BD0_CAST_VF_DELTA >>> 0; }
export function luaEngine899bd0CastSrcTypeVa() { return LUA_ENGINE_899BD0_CAST_SRC_TYPE_VA >>> 0; }
export function luaEngine899bd0CastDstTypeVa() { return LUA_ENGINE_899BD0_CAST_DST_TYPE_VA >>> 0; }
export function luaEngine899bd0CastIsReference() { return LUA_ENGINE_899BD0_CAST_IS_REFERENCE >>> 0; }
export function luaEngine899bd0IatLuaPushnil() { return LUA_ENGINE_899BD0_IAT_LUA_PUSHNIL >>> 0; }
export function luaEngine899bd0NewuserdataSize() { return LUA_ENGINE_899BD0_NEWUSERDATA_SIZE >>> 0; }
export function luaEngine899bd0UdVtableVa() { return LUA_ENGINE_899BD0_UD_VTABLE_VA >>> 0; }
export function luaEngine899bd0UdPtrFieldOff() { return LUA_ENGINE_899BD0_UD_PTR_FIELD_OFF >>> 0; }
export function luaEngine899bd0RegistryIndex() { return LUA_ENGINE_899BD0_REGISTRY_INDEX_U32 >>> 0; }
export function luaEngine899bd0MetatableRawgetpKey() { return LUA_ENGINE_899BD0_METATABLE_RAWGETP_KEY >>> 0; }
export function luaEngine899bd0IatLuaRawgetp() { return LUA_ENGINE_899BD0_IAT_LUA_RAWGETP >>> 0; }
export function luaEngine899bd0IatLuaSetmetatable() { return LUA_ENGINE_899BD0_IAT_LUA_SETMETATABLE >>> 0; }
export function luaEngine899bd0SetmetatableIndex() { return LUA_ENGINE_899BD0_SETMETATABLE_INDEX_U32 >>> 0; }
export function luaEngine899bd0ReturnValue() { return LUA_ENGINE_899BD0_RETURN_VALUE >>> 0; }
/** 0x899bd0 law: FULL-WORD lua_type(L,1) gate (je encoding,
 * nil skips check/get). taken <=> typeResult !== 0. */
export function luaEngine899bd0Type1GateTaken(typeResult) {
  return typeResult !== 0 ? 1 : 0;
}
export const LUA_ENGINE_899C70_VA = 0x00899c70;
export const LUA_ENGINE_899C70_END_VA = 0x00899d09;
export const LUA_ENGINE_899C70_NEXT_VA = 0x00899d10;
export const LUA_ENGINE_899C70_STACK_ARGS = 0x00000001;
export const LUA_ENGINE_899C70_ECX_ARG = 0x00000000;
export const LUA_ENGINE_899C70_CALLEE_POPS_STACK_ARGS = 0x00000000;
export const LUA_ENGINE_899C70_ALIGNED_PROLOGUE = 0x00000000;
export const LUA_ENGINE_899C70_GATE_INVERTED_ENCODING = 0x1;
export const LUA_ENGINE_899C70_IAT_LUA_TYPE = 0x00b18400;
export const LUA_ENGINE_899C70_CHECKGET_KEY = 0x00c82a1e;
export const LUA_ENGINE_899C70_CHECKGET_INDEX = 0x1;
export const LUA_ENGINE_899C70_CHECKGET_DEF_ARG = 0x00000000;
export const LUA_ENGINE_899C70_CHECKGET_FIELD_OFF = 0x4;
export const LUA_ENGINE_899C70_CHECKGET_HELPER_VA = 0x0085c590;
export const LUA_ENGINE_899C70_CAST_HELPER_VA = 0x00af08b1;
export const LUA_ENGINE_899C70_CAST_VF_DELTA = 0x0;
export const LUA_ENGINE_899C70_CAST_SRC_TYPE_VA = 0x00c5d7a4;
export const LUA_ENGINE_899C70_CAST_DST_TYPE_VA = 0x00c5e8ec;
export const LUA_ENGINE_899C70_CAST_IS_REFERENCE = 0x0;
export const LUA_ENGINE_899C70_IAT_LUA_PUSHNIL = 0x00b183e0;
export const LUA_ENGINE_899C70_NEWUSERDATA_SIZE = 0x00000008;
export const LUA_ENGINE_899C70_UD_VTABLE_VA = 0x00b753c8;
export const LUA_ENGINE_899C70_UD_PTR_FIELD_OFF = 0x00000004;
export const LUA_ENGINE_899C70_REGISTRY_INDEX_U32 = 0xfff0b9d8;
export const LUA_ENGINE_899C70_METATABLE_RAWGETP_KEY = 0x00c829f2;
export const LUA_ENGINE_899C70_IAT_LUA_RAWGETP = 0x00b183bc;
export const LUA_ENGINE_899C70_IAT_LUA_SETMETATABLE = 0x00b18398;
export const LUA_ENGINE_899C70_SETMETATABLE_INDEX_U32 = 0xfffffffe;
export const LUA_ENGINE_899C70_RETURN_VALUE = 0x1;
/** 0x899c70 imm oracles. */
export function luaEngine899c70HostVa() { return LUA_ENGINE_899C70_VA >>> 0; }
export function luaEngine899c70EndVa() { return LUA_ENGINE_899C70_END_VA >>> 0; }
export function luaEngine899c70NextVa() { return LUA_ENGINE_899C70_NEXT_VA >>> 0; }
export function luaEngine899c70StackArgs() { return LUA_ENGINE_899C70_STACK_ARGS >>> 0; }
export function luaEngine899c70EcxArg() { return LUA_ENGINE_899C70_ECX_ARG >>> 0; }
export function luaEngine899c70CalleePopsStackArgs() { return LUA_ENGINE_899C70_CALLEE_POPS_STACK_ARGS >>> 0; }
export function luaEngine899c70AlignedPrologue() { return LUA_ENGINE_899C70_ALIGNED_PROLOGUE >>> 0; }
export function luaEngine899c70IatLuaType() { return LUA_ENGINE_899C70_IAT_LUA_TYPE >>> 0; }
export function luaEngine899c70GateInvertedEncoding() { return LUA_ENGINE_899C70_GATE_INVERTED_ENCODING >>> 0; }
export function luaEngine899c70CheckgetKey() { return LUA_ENGINE_899C70_CHECKGET_KEY >>> 0; }
export function luaEngine899c70CheckgetIndex() { return LUA_ENGINE_899C70_CHECKGET_INDEX >>> 0; }
export function luaEngine899c70CheckgetDefArg() { return LUA_ENGINE_899C70_CHECKGET_DEF_ARG >>> 0; }
export function luaEngine899c70CheckgetFieldOff() { return LUA_ENGINE_899C70_CHECKGET_FIELD_OFF >>> 0; }
export function luaEngine899c70CheckgetHelperVa() { return LUA_ENGINE_899C70_CHECKGET_HELPER_VA >>> 0; }
export function luaEngine899c70CastHelperVa() { return LUA_ENGINE_899C70_CAST_HELPER_VA >>> 0; }
export function luaEngine899c70CastVfDelta() { return LUA_ENGINE_899C70_CAST_VF_DELTA >>> 0; }
export function luaEngine899c70CastSrcTypeVa() { return LUA_ENGINE_899C70_CAST_SRC_TYPE_VA >>> 0; }
export function luaEngine899c70CastDstTypeVa() { return LUA_ENGINE_899C70_CAST_DST_TYPE_VA >>> 0; }
export function luaEngine899c70CastIsReference() { return LUA_ENGINE_899C70_CAST_IS_REFERENCE >>> 0; }
export function luaEngine899c70IatLuaPushnil() { return LUA_ENGINE_899C70_IAT_LUA_PUSHNIL >>> 0; }
export function luaEngine899c70NewuserdataSize() { return LUA_ENGINE_899C70_NEWUSERDATA_SIZE >>> 0; }
export function luaEngine899c70UdVtableVa() { return LUA_ENGINE_899C70_UD_VTABLE_VA >>> 0; }
export function luaEngine899c70UdPtrFieldOff() { return LUA_ENGINE_899C70_UD_PTR_FIELD_OFF >>> 0; }
export function luaEngine899c70RegistryIndex() { return LUA_ENGINE_899C70_REGISTRY_INDEX_U32 >>> 0; }
export function luaEngine899c70MetatableRawgetpKey() { return LUA_ENGINE_899C70_METATABLE_RAWGETP_KEY >>> 0; }
export function luaEngine899c70IatLuaRawgetp() { return LUA_ENGINE_899C70_IAT_LUA_RAWGETP >>> 0; }
export function luaEngine899c70IatLuaSetmetatable() { return LUA_ENGINE_899C70_IAT_LUA_SETMETATABLE >>> 0; }
export function luaEngine899c70SetmetatableIndex() { return LUA_ENGINE_899C70_SETMETATABLE_INDEX_U32 >>> 0; }
export function luaEngine899c70ReturnValue() { return LUA_ENGINE_899C70_RETURN_VALUE >>> 0; }
/** 0x899c70 law: FULL-WORD lua_type(L,1) gate (je encoding,
 * nil skips check/get). taken <=> typeResult !== 0. */
export function luaEngine899c70Type1GateTaken(typeResult) {
  return typeResult !== 0 ? 1 : 0;
}
export const LUA_ENGINE_899D10_VA = 0x00899d10;
export const LUA_ENGINE_899D10_END_VA = 0x00899da9;
export const LUA_ENGINE_899D10_NEXT_VA = 0x00899db0;
export const LUA_ENGINE_899D10_STACK_ARGS = 0x00000001;
export const LUA_ENGINE_899D10_ECX_ARG = 0x00000000;
export const LUA_ENGINE_899D10_CALLEE_POPS_STACK_ARGS = 0x00000000;
export const LUA_ENGINE_899D10_ALIGNED_PROLOGUE = 0x00000000;
export const LUA_ENGINE_899D10_GATE_INVERTED_ENCODING = 0x1;
export const LUA_ENGINE_899D10_IAT_LUA_TYPE = 0x00b18400;
export const LUA_ENGINE_899D10_CHECKGET_KEY = 0x00c82a1e;
export const LUA_ENGINE_899D10_CHECKGET_INDEX = 0x1;
export const LUA_ENGINE_899D10_CHECKGET_DEF_ARG = 0x00000001;
export const LUA_ENGINE_899D10_CHECKGET_FIELD_OFF = 0x4;
export const LUA_ENGINE_899D10_CHECKGET_HELPER_VA = 0x0085c590;
export const LUA_ENGINE_899D10_CAST_HELPER_VA = 0x00af08b1;
export const LUA_ENGINE_899D10_CAST_VF_DELTA = 0x0;
export const LUA_ENGINE_899D10_CAST_SRC_TYPE_VA = 0x00c5d7a4;
export const LUA_ENGINE_899D10_CAST_DST_TYPE_VA = 0x00c5d804;
export const LUA_ENGINE_899D10_CAST_IS_REFERENCE = 0x0;
export const LUA_ENGINE_899D10_IAT_LUA_PUSHNIL = 0x00b183e0;
export const LUA_ENGINE_899D10_NEWUSERDATA_SIZE = 0x00000008;
export const LUA_ENGINE_899D10_UD_VTABLE_VA = 0x00b753c8;
export const LUA_ENGINE_899D10_UD_PTR_FIELD_OFF = 0x00000004;
export const LUA_ENGINE_899D10_REGISTRY_INDEX_U32 = 0xfff0b9d8;
export const LUA_ENGINE_899D10_METATABLE_RAWGETP_KEY = 0x00c829f7;
export const LUA_ENGINE_899D10_IAT_LUA_RAWGETP = 0x00b183bc;
export const LUA_ENGINE_899D10_IAT_LUA_SETMETATABLE = 0x00b18398;
export const LUA_ENGINE_899D10_SETMETATABLE_INDEX_U32 = 0xfffffffe;
export const LUA_ENGINE_899D10_RETURN_VALUE = 0x1;
/** 0x899d10 imm oracles. */
export function luaEngine899d10HostVa() { return LUA_ENGINE_899D10_VA >>> 0; }
export function luaEngine899d10EndVa() { return LUA_ENGINE_899D10_END_VA >>> 0; }
export function luaEngine899d10NextVa() { return LUA_ENGINE_899D10_NEXT_VA >>> 0; }
export function luaEngine899d10StackArgs() { return LUA_ENGINE_899D10_STACK_ARGS >>> 0; }
export function luaEngine899d10EcxArg() { return LUA_ENGINE_899D10_ECX_ARG >>> 0; }
export function luaEngine899d10CalleePopsStackArgs() { return LUA_ENGINE_899D10_CALLEE_POPS_STACK_ARGS >>> 0; }
export function luaEngine899d10AlignedPrologue() { return LUA_ENGINE_899D10_ALIGNED_PROLOGUE >>> 0; }
export function luaEngine899d10IatLuaType() { return LUA_ENGINE_899D10_IAT_LUA_TYPE >>> 0; }
export function luaEngine899d10GateInvertedEncoding() { return LUA_ENGINE_899D10_GATE_INVERTED_ENCODING >>> 0; }
export function luaEngine899d10CheckgetKey() { return LUA_ENGINE_899D10_CHECKGET_KEY >>> 0; }
export function luaEngine899d10CheckgetIndex() { return LUA_ENGINE_899D10_CHECKGET_INDEX >>> 0; }
export function luaEngine899d10CheckgetDefArg() { return LUA_ENGINE_899D10_CHECKGET_DEF_ARG >>> 0; }
export function luaEngine899d10CheckgetFieldOff() { return LUA_ENGINE_899D10_CHECKGET_FIELD_OFF >>> 0; }
export function luaEngine899d10CheckgetHelperVa() { return LUA_ENGINE_899D10_CHECKGET_HELPER_VA >>> 0; }
export function luaEngine899d10CastHelperVa() { return LUA_ENGINE_899D10_CAST_HELPER_VA >>> 0; }
export function luaEngine899d10CastVfDelta() { return LUA_ENGINE_899D10_CAST_VF_DELTA >>> 0; }
export function luaEngine899d10CastSrcTypeVa() { return LUA_ENGINE_899D10_CAST_SRC_TYPE_VA >>> 0; }
export function luaEngine899d10CastDstTypeVa() { return LUA_ENGINE_899D10_CAST_DST_TYPE_VA >>> 0; }
export function luaEngine899d10CastIsReference() { return LUA_ENGINE_899D10_CAST_IS_REFERENCE >>> 0; }
export function luaEngine899d10IatLuaPushnil() { return LUA_ENGINE_899D10_IAT_LUA_PUSHNIL >>> 0; }
export function luaEngine899d10NewuserdataSize() { return LUA_ENGINE_899D10_NEWUSERDATA_SIZE >>> 0; }
export function luaEngine899d10UdVtableVa() { return LUA_ENGINE_899D10_UD_VTABLE_VA >>> 0; }
export function luaEngine899d10UdPtrFieldOff() { return LUA_ENGINE_899D10_UD_PTR_FIELD_OFF >>> 0; }
export function luaEngine899d10RegistryIndex() { return LUA_ENGINE_899D10_REGISTRY_INDEX_U32 >>> 0; }
export function luaEngine899d10MetatableRawgetpKey() { return LUA_ENGINE_899D10_METATABLE_RAWGETP_KEY >>> 0; }
export function luaEngine899d10IatLuaRawgetp() { return LUA_ENGINE_899D10_IAT_LUA_RAWGETP >>> 0; }
export function luaEngine899d10IatLuaSetmetatable() { return LUA_ENGINE_899D10_IAT_LUA_SETMETATABLE >>> 0; }
export function luaEngine899d10SetmetatableIndex() { return LUA_ENGINE_899D10_SETMETATABLE_INDEX_U32 >>> 0; }
export function luaEngine899d10ReturnValue() { return LUA_ENGINE_899D10_RETURN_VALUE >>> 0; }
/** 0x899d10 law: FULL-WORD lua_type(L,1) gate (je encoding,
 * nil skips check/get). taken <=> typeResult !== 0. */
export function luaEngine899d10Type1GateTaken(typeResult) {
  return typeResult !== 0 ? 1 : 0;
}
export const LUA_ENGINE_899DB0_VA = 0x00899db0;
export const LUA_ENGINE_899DB0_END_VA = 0x00899e49;
export const LUA_ENGINE_899DB0_NEXT_VA = 0x00899e50;
export const LUA_ENGINE_899DB0_STACK_ARGS = 0x00000001;
export const LUA_ENGINE_899DB0_ECX_ARG = 0x00000000;
export const LUA_ENGINE_899DB0_CALLEE_POPS_STACK_ARGS = 0x00000000;
export const LUA_ENGINE_899DB0_ALIGNED_PROLOGUE = 0x00000000;
export const LUA_ENGINE_899DB0_GATE_INVERTED_ENCODING = 0x1;
export const LUA_ENGINE_899DB0_IAT_LUA_TYPE = 0x00b18400;
export const LUA_ENGINE_899DB0_CHECKGET_KEY = 0x00c82a1e;
export const LUA_ENGINE_899DB0_CHECKGET_INDEX = 0x1;
export const LUA_ENGINE_899DB0_CHECKGET_DEF_ARG = 0x00000000;
export const LUA_ENGINE_899DB0_CHECKGET_FIELD_OFF = 0x4;
export const LUA_ENGINE_899DB0_CHECKGET_HELPER_VA = 0x0085c590;
export const LUA_ENGINE_899DB0_CAST_HELPER_VA = 0x00af08b1;
export const LUA_ENGINE_899DB0_CAST_VF_DELTA = 0x0;
export const LUA_ENGINE_899DB0_CAST_SRC_TYPE_VA = 0x00c5d7a4;
export const LUA_ENGINE_899DB0_CAST_DST_TYPE_VA = 0x00c5d804;
export const LUA_ENGINE_899DB0_CAST_IS_REFERENCE = 0x0;
export const LUA_ENGINE_899DB0_IAT_LUA_PUSHNIL = 0x00b183e0;
export const LUA_ENGINE_899DB0_NEWUSERDATA_SIZE = 0x00000008;
export const LUA_ENGINE_899DB0_UD_VTABLE_VA = 0x00b753c8;
export const LUA_ENGINE_899DB0_UD_PTR_FIELD_OFF = 0x00000004;
export const LUA_ENGINE_899DB0_REGISTRY_INDEX_U32 = 0xfff0b9d8;
export const LUA_ENGINE_899DB0_METATABLE_RAWGETP_KEY = 0x00c829f8;
export const LUA_ENGINE_899DB0_IAT_LUA_RAWGETP = 0x00b183bc;
export const LUA_ENGINE_899DB0_IAT_LUA_SETMETATABLE = 0x00b18398;
export const LUA_ENGINE_899DB0_SETMETATABLE_INDEX_U32 = 0xfffffffe;
export const LUA_ENGINE_899DB0_RETURN_VALUE = 0x1;
/** 0x899db0 imm oracles. */
export function luaEngine899db0HostVa() { return LUA_ENGINE_899DB0_VA >>> 0; }
export function luaEngine899db0EndVa() { return LUA_ENGINE_899DB0_END_VA >>> 0; }
export function luaEngine899db0NextVa() { return LUA_ENGINE_899DB0_NEXT_VA >>> 0; }
export function luaEngine899db0StackArgs() { return LUA_ENGINE_899DB0_STACK_ARGS >>> 0; }
export function luaEngine899db0EcxArg() { return LUA_ENGINE_899DB0_ECX_ARG >>> 0; }
export function luaEngine899db0CalleePopsStackArgs() { return LUA_ENGINE_899DB0_CALLEE_POPS_STACK_ARGS >>> 0; }
export function luaEngine899db0AlignedPrologue() { return LUA_ENGINE_899DB0_ALIGNED_PROLOGUE >>> 0; }
export function luaEngine899db0IatLuaType() { return LUA_ENGINE_899DB0_IAT_LUA_TYPE >>> 0; }
export function luaEngine899db0GateInvertedEncoding() { return LUA_ENGINE_899DB0_GATE_INVERTED_ENCODING >>> 0; }
export function luaEngine899db0CheckgetKey() { return LUA_ENGINE_899DB0_CHECKGET_KEY >>> 0; }
export function luaEngine899db0CheckgetIndex() { return LUA_ENGINE_899DB0_CHECKGET_INDEX >>> 0; }
export function luaEngine899db0CheckgetDefArg() { return LUA_ENGINE_899DB0_CHECKGET_DEF_ARG >>> 0; }
export function luaEngine899db0CheckgetFieldOff() { return LUA_ENGINE_899DB0_CHECKGET_FIELD_OFF >>> 0; }
export function luaEngine899db0CheckgetHelperVa() { return LUA_ENGINE_899DB0_CHECKGET_HELPER_VA >>> 0; }
export function luaEngine899db0CastHelperVa() { return LUA_ENGINE_899DB0_CAST_HELPER_VA >>> 0; }
export function luaEngine899db0CastVfDelta() { return LUA_ENGINE_899DB0_CAST_VF_DELTA >>> 0; }
export function luaEngine899db0CastSrcTypeVa() { return LUA_ENGINE_899DB0_CAST_SRC_TYPE_VA >>> 0; }
export function luaEngine899db0CastDstTypeVa() { return LUA_ENGINE_899DB0_CAST_DST_TYPE_VA >>> 0; }
export function luaEngine899db0CastIsReference() { return LUA_ENGINE_899DB0_CAST_IS_REFERENCE >>> 0; }
export function luaEngine899db0IatLuaPushnil() { return LUA_ENGINE_899DB0_IAT_LUA_PUSHNIL >>> 0; }
export function luaEngine899db0NewuserdataSize() { return LUA_ENGINE_899DB0_NEWUSERDATA_SIZE >>> 0; }
export function luaEngine899db0UdVtableVa() { return LUA_ENGINE_899DB0_UD_VTABLE_VA >>> 0; }
export function luaEngine899db0UdPtrFieldOff() { return LUA_ENGINE_899DB0_UD_PTR_FIELD_OFF >>> 0; }
export function luaEngine899db0RegistryIndex() { return LUA_ENGINE_899DB0_REGISTRY_INDEX_U32 >>> 0; }
export function luaEngine899db0MetatableRawgetpKey() { return LUA_ENGINE_899DB0_METATABLE_RAWGETP_KEY >>> 0; }
export function luaEngine899db0IatLuaRawgetp() { return LUA_ENGINE_899DB0_IAT_LUA_RAWGETP >>> 0; }
export function luaEngine899db0IatLuaSetmetatable() { return LUA_ENGINE_899DB0_IAT_LUA_SETMETATABLE >>> 0; }
export function luaEngine899db0SetmetatableIndex() { return LUA_ENGINE_899DB0_SETMETATABLE_INDEX_U32 >>> 0; }
export function luaEngine899db0ReturnValue() { return LUA_ENGINE_899DB0_RETURN_VALUE >>> 0; }
/** 0x899db0 law: FULL-WORD lua_type(L,1) gate (je encoding,
 * nil skips check/get). taken <=> typeResult !== 0. */
export function luaEngine899db0Type1GateTaken(typeResult) {
  return typeResult !== 0 ? 1 : 0;
}
export const LUA_ENGINE_899E50_STACK_ARGS = 0x00000001;
export const LUA_ENGINE_899E50_ECX_ARG = 0x00000000;
export const LUA_ENGINE_899E50_CALLEE_POPS_STACK_ARGS = 0x00000000;
export const LUA_ENGINE_899E50_ALIGNED_PROLOGUE = 0x00000000;
export const LUA_ENGINE_899E50_GATE_INVERTED_ENCODING = 0x00000001;
export const LUA_ENGINE_899E50_IAT_LUA_TYPE = 0x00b18400;
export const LUA_ENGINE_899E50_CHECKGET_KEY = 0x00c82a1e;
export const LUA_ENGINE_899E50_CHECKGET_INDEX = 0x00000001;
export const LUA_ENGINE_899E50_CHECKGET_FIELD_OFF = 0x00000004;
export const LUA_ENGINE_899E50_CHECKGET_HELPER_VA = 0x0085c590;
export const LUA_ENGINE_899E50_CAST_HELPER_VA = 0x00af08b1;
export const LUA_ENGINE_899E50_CAST_VF_DELTA = 0x00000000;
export const LUA_ENGINE_899E50_CAST_SRC_TYPE_VA = 0x00c5d7a4;
export const LUA_ENGINE_899E50_CAST_IS_REFERENCE = 0x00000000;
export const LUA_ENGINE_899E50_IAT_LUA_PUSHNIL = 0x00b183e0;
export const LUA_ENGINE_899E50_NEWUSERDATA_SIZE = 0x00000008;
export const LUA_ENGINE_899E50_UD_VTABLE_VA = 0x00b753c8;
export const LUA_ENGINE_899E50_UD_PTR_FIELD_OFF = 0x00000004;
export const LUA_ENGINE_899E50_REGISTRY_INDEX_U32 = 0xfff0b9d8;
export const LUA_ENGINE_899E50_IAT_LUA_RAWGETP = 0x00b183bc;
export const LUA_ENGINE_899E50_IAT_LUA_SETMETATABLE = 0x00b18398;
export const LUA_ENGINE_899E50_SETMETATABLE_INDEX_U32 = 0xfffffffe;
export const LUA_ENGINE_899E50_RETURN_VALUE = 0x00000001;
export const LUA_ENGINE_899E50_VA = 0x00899e50;
export const LUA_ENGINE_899E50_END_VA = 0x00899ee9;
export const LUA_ENGINE_899E50_NEXT_VA = 0x00899ef0;
export const LUA_ENGINE_899E50_CHECKGET_DEF_ARG = 0x00000001;
export const LUA_ENGINE_899E50_CAST_DST_TYPE_VA = 0x00c5e814;
export const LUA_ENGINE_899E50_METATABLE_RAWGETP_KEY = 0x00c829f4;
export function luaEngine899e50HostVa() { return LUA_ENGINE_899E50_VA >>> 0; }
export function luaEngine899e50EndVa() { return LUA_ENGINE_899E50_END_VA >>> 0; }
export function luaEngine899e50NextVa() { return LUA_ENGINE_899E50_NEXT_VA >>> 0; }
export function luaEngine899e50StackArgs() { return LUA_ENGINE_899E50_STACK_ARGS >>> 0; }
export function luaEngine899e50EcxArg() { return LUA_ENGINE_899E50_ECX_ARG >>> 0; }
export function luaEngine899e50CalleePopsStackArgs() { return LUA_ENGINE_899E50_CALLEE_POPS_STACK_ARGS >>> 0; }
export function luaEngine899e50AlignedPrologue() { return LUA_ENGINE_899E50_ALIGNED_PROLOGUE >>> 0; }
export function luaEngine899e50IatLuaType() { return LUA_ENGINE_899E50_IAT_LUA_TYPE >>> 0; }
export function luaEngine899e50GateInvertedEncoding() { return LUA_ENGINE_899E50_GATE_INVERTED_ENCODING >>> 0; }
export function luaEngine899e50CheckgetKey() { return LUA_ENGINE_899E50_CHECKGET_KEY >>> 0; }
export function luaEngine899e50CheckgetIndex() { return LUA_ENGINE_899E50_CHECKGET_INDEX >>> 0; }
export function luaEngine899e50CheckgetDefArg() { return LUA_ENGINE_899E50_CHECKGET_DEF_ARG >>> 0; }
export function luaEngine899e50CheckgetFieldOff() { return LUA_ENGINE_899E50_CHECKGET_FIELD_OFF >>> 0; }
export function luaEngine899e50CheckgetHelperVa() { return LUA_ENGINE_899E50_CHECKGET_HELPER_VA >>> 0; }
export function luaEngine899e50CastHelperVa() { return LUA_ENGINE_899E50_CAST_HELPER_VA >>> 0; }
export function luaEngine899e50CastVfDelta() { return LUA_ENGINE_899E50_CAST_VF_DELTA >>> 0; }
export function luaEngine899e50CastSrcTypeVa() { return LUA_ENGINE_899E50_CAST_SRC_TYPE_VA >>> 0; }
export function luaEngine899e50CastDstTypeVa() { return LUA_ENGINE_899E50_CAST_DST_TYPE_VA >>> 0; }
export function luaEngine899e50CastIsReference() { return LUA_ENGINE_899E50_CAST_IS_REFERENCE >>> 0; }
export function luaEngine899e50IatLuaPushnil() { return LUA_ENGINE_899E50_IAT_LUA_PUSHNIL >>> 0; }
export function luaEngine899e50NewuserdataSize() { return LUA_ENGINE_899E50_NEWUSERDATA_SIZE >>> 0; }
export function luaEngine899e50UdVtableVa() { return LUA_ENGINE_899E50_UD_VTABLE_VA >>> 0; }
export function luaEngine899e50UdPtrFieldOff() { return LUA_ENGINE_899E50_UD_PTR_FIELD_OFF >>> 0; }
export function luaEngine899e50RegistryIndex() { return LUA_ENGINE_899E50_REGISTRY_INDEX_U32 >>> 0; }
export function luaEngine899e50MetatableRawgetpKey() { return LUA_ENGINE_899E50_METATABLE_RAWGETP_KEY >>> 0; }
export function luaEngine899e50IatLuaRawgetp() { return LUA_ENGINE_899E50_IAT_LUA_RAWGETP >>> 0; }
export function luaEngine899e50IatLuaSetmetatable() { return LUA_ENGINE_899E50_IAT_LUA_SETMETATABLE >>> 0; }
export function luaEngine899e50SetmetatableIndex() { return LUA_ENGINE_899E50_SETMETATABLE_INDEX_U32 >>> 0; }
export function luaEngine899e50ReturnValue() { return LUA_ENGINE_899E50_RETURN_VALUE >>> 0; }
/** 0x899e50 law: FULL-WORD lua_type(L,1) gate (inverted je
 * encoding; nil skips check/get). taken <=> typeResult !== 0. */
export function luaEngine899e50Type1GateTaken(typeResult) {
  return typeResult !== 0 ? 1 : 0;
}
export const LUA_ENGINE_899EF0_STACK_ARGS = 0x00000001;
export const LUA_ENGINE_899EF0_ECX_ARG = 0x00000000;
export const LUA_ENGINE_899EF0_CALLEE_POPS_STACK_ARGS = 0x00000000;
export const LUA_ENGINE_899EF0_ALIGNED_PROLOGUE = 0x00000000;
export const LUA_ENGINE_899EF0_GATE_INVERTED_ENCODING = 0x00000001;
export const LUA_ENGINE_899EF0_IAT_LUA_TYPE = 0x00b18400;
export const LUA_ENGINE_899EF0_CHECKGET_KEY = 0x00c82a1e;
export const LUA_ENGINE_899EF0_CHECKGET_INDEX = 0x00000001;
export const LUA_ENGINE_899EF0_CHECKGET_FIELD_OFF = 0x00000004;
export const LUA_ENGINE_899EF0_CHECKGET_HELPER_VA = 0x0085c590;
export const LUA_ENGINE_899EF0_CAST_HELPER_VA = 0x00af08b1;
export const LUA_ENGINE_899EF0_CAST_VF_DELTA = 0x00000000;
export const LUA_ENGINE_899EF0_CAST_SRC_TYPE_VA = 0x00c5d7a4;
export const LUA_ENGINE_899EF0_CAST_IS_REFERENCE = 0x00000000;
export const LUA_ENGINE_899EF0_IAT_LUA_PUSHNIL = 0x00b183e0;
export const LUA_ENGINE_899EF0_NEWUSERDATA_SIZE = 0x00000008;
export const LUA_ENGINE_899EF0_UD_VTABLE_VA = 0x00b753c8;
export const LUA_ENGINE_899EF0_UD_PTR_FIELD_OFF = 0x00000004;
export const LUA_ENGINE_899EF0_REGISTRY_INDEX_U32 = 0xfff0b9d8;
export const LUA_ENGINE_899EF0_IAT_LUA_RAWGETP = 0x00b183bc;
export const LUA_ENGINE_899EF0_IAT_LUA_SETMETATABLE = 0x00b18398;
export const LUA_ENGINE_899EF0_SETMETATABLE_INDEX_U32 = 0xfffffffe;
export const LUA_ENGINE_899EF0_RETURN_VALUE = 0x00000001;
export const LUA_ENGINE_899EF0_VA = 0x00899ef0;
export const LUA_ENGINE_899EF0_END_VA = 0x00899f89;
export const LUA_ENGINE_899EF0_NEXT_VA = 0x00899fa0;
export const LUA_ENGINE_899EF0_CHECKGET_DEF_ARG = 0x00000000;
export const LUA_ENGINE_899EF0_CAST_DST_TYPE_VA = 0x00c5e814;
export const LUA_ENGINE_899EF0_METATABLE_RAWGETP_KEY = 0x00c829f5;
export function luaEngine899ef0HostVa() { return LUA_ENGINE_899EF0_VA >>> 0; }
export function luaEngine899ef0EndVa() { return LUA_ENGINE_899EF0_END_VA >>> 0; }
export function luaEngine899ef0NextVa() { return LUA_ENGINE_899EF0_NEXT_VA >>> 0; }
export function luaEngine899ef0StackArgs() { return LUA_ENGINE_899EF0_STACK_ARGS >>> 0; }
export function luaEngine899ef0EcxArg() { return LUA_ENGINE_899EF0_ECX_ARG >>> 0; }
export function luaEngine899ef0CalleePopsStackArgs() { return LUA_ENGINE_899EF0_CALLEE_POPS_STACK_ARGS >>> 0; }
export function luaEngine899ef0AlignedPrologue() { return LUA_ENGINE_899EF0_ALIGNED_PROLOGUE >>> 0; }
export function luaEngine899ef0IatLuaType() { return LUA_ENGINE_899EF0_IAT_LUA_TYPE >>> 0; }
export function luaEngine899ef0GateInvertedEncoding() { return LUA_ENGINE_899EF0_GATE_INVERTED_ENCODING >>> 0; }
export function luaEngine899ef0CheckgetKey() { return LUA_ENGINE_899EF0_CHECKGET_KEY >>> 0; }
export function luaEngine899ef0CheckgetIndex() { return LUA_ENGINE_899EF0_CHECKGET_INDEX >>> 0; }
export function luaEngine899ef0CheckgetDefArg() { return LUA_ENGINE_899EF0_CHECKGET_DEF_ARG >>> 0; }
export function luaEngine899ef0CheckgetFieldOff() { return LUA_ENGINE_899EF0_CHECKGET_FIELD_OFF >>> 0; }
export function luaEngine899ef0CheckgetHelperVa() { return LUA_ENGINE_899EF0_CHECKGET_HELPER_VA >>> 0; }
export function luaEngine899ef0CastHelperVa() { return LUA_ENGINE_899EF0_CAST_HELPER_VA >>> 0; }
export function luaEngine899ef0CastVfDelta() { return LUA_ENGINE_899EF0_CAST_VF_DELTA >>> 0; }
export function luaEngine899ef0CastSrcTypeVa() { return LUA_ENGINE_899EF0_CAST_SRC_TYPE_VA >>> 0; }
export function luaEngine899ef0CastDstTypeVa() { return LUA_ENGINE_899EF0_CAST_DST_TYPE_VA >>> 0; }
export function luaEngine899ef0CastIsReference() { return LUA_ENGINE_899EF0_CAST_IS_REFERENCE >>> 0; }
export function luaEngine899ef0IatLuaPushnil() { return LUA_ENGINE_899EF0_IAT_LUA_PUSHNIL >>> 0; }
export function luaEngine899ef0NewuserdataSize() { return LUA_ENGINE_899EF0_NEWUSERDATA_SIZE >>> 0; }
export function luaEngine899ef0UdVtableVa() { return LUA_ENGINE_899EF0_UD_VTABLE_VA >>> 0; }
export function luaEngine899ef0UdPtrFieldOff() { return LUA_ENGINE_899EF0_UD_PTR_FIELD_OFF >>> 0; }
export function luaEngine899ef0RegistryIndex() { return LUA_ENGINE_899EF0_REGISTRY_INDEX_U32 >>> 0; }
export function luaEngine899ef0MetatableRawgetpKey() { return LUA_ENGINE_899EF0_METATABLE_RAWGETP_KEY >>> 0; }
export function luaEngine899ef0IatLuaRawgetp() { return LUA_ENGINE_899EF0_IAT_LUA_RAWGETP >>> 0; }
export function luaEngine899ef0IatLuaSetmetatable() { return LUA_ENGINE_899EF0_IAT_LUA_SETMETATABLE >>> 0; }
export function luaEngine899ef0SetmetatableIndex() { return LUA_ENGINE_899EF0_SETMETATABLE_INDEX_U32 >>> 0; }
export function luaEngine899ef0ReturnValue() { return LUA_ENGINE_899EF0_RETURN_VALUE >>> 0; }
/** 0x899ef0 law: FULL-WORD lua_type(L,1) gate (inverted je
 * encoding; nil skips check/get). taken <=> typeResult !== 0. */
export function luaEngine899ef0Type1GateTaken(typeResult) {
  return typeResult !== 0 ? 1 : 0;
}
export const LUA_ENGINE_899FA0_STACK_ARGS = 0x1;
export const LUA_ENGINE_899FA0_ECX_ARG = 0x0;
export const LUA_ENGINE_899FA0_CALLEE_POPS_STACK_ARGS = 0x0;
export const LUA_ENGINE_899FA0_ALIGNED_PROLOGUE = 0x0;
export const LUA_ENGINE_899FA0_GATE_INVERTED_ENCODING = 0x1;
export const LUA_ENGINE_899FA0_IAT_LUA_TYPE = 0xb18400;
export const LUA_ENGINE_899FA0_CHECKGET_KEY = 0xc82a1e;
export const LUA_ENGINE_899FA0_CHECKGET_INDEX = 0x1;
export const LUA_ENGINE_899FA0_CHECKGET_FIELD_OFF = 0x4;
export const LUA_ENGINE_899FA0_CHECKGET_HELPER_VA = 0x85c590;
export const LUA_ENGINE_899FA0_CAST_HELPER_VA = 0xaf08b1;
export const LUA_ENGINE_899FA0_CAST_VF_DELTA = 0x0;
export const LUA_ENGINE_899FA0_CAST_SRC_TYPE_VA = 0xc5d7a4;
export const LUA_ENGINE_899FA0_CAST_IS_REFERENCE = 0x0;
export const LUA_ENGINE_899FA0_IAT_LUA_PUSHNIL = 0xb183e0;
export const LUA_ENGINE_899FA0_NEWUSERDATA_SIZE = 0x8;
export const LUA_ENGINE_899FA0_UD_VTABLE_VA = 0xb753c8;
export const LUA_ENGINE_899FA0_UD_PTR_FIELD_OFF = 0x4;
export const LUA_ENGINE_899FA0_REGISTRY_INDEX_U32 = 0xfff0b9d8;
export const LUA_ENGINE_899FA0_IAT_LUA_RAWGETP = 0xb183bc;
export const LUA_ENGINE_899FA0_IAT_LUA_SETMETATABLE = 0xb18398;
export const LUA_ENGINE_899FA0_SETMETATABLE_INDEX_U32 = 0xfffffffe;
export const LUA_ENGINE_899FA0_RETURN_VALUE = 0x1;
export const LUA_ENGINE_899FA0_VA = 0x899fa0;
export const LUA_ENGINE_899FA0_END_VA = 0x89a039;
export const LUA_ENGINE_899FA0_NEXT_VA = 0x89a040;
export const LUA_ENGINE_899FA0_CHECKGET_DEF_ARG = 0x1;
export const LUA_ENGINE_899FA0_CAST_DST_TYPE_VA = 0xc5d8cc;
export const LUA_ENGINE_899FA0_METATABLE_RAWGETP_KEY = 0xc829ee;
export function luaEngine899fa0HostVa() { return LUA_ENGINE_899FA0_VA >>> 0; }
export function luaEngine899fa0EndVa() { return LUA_ENGINE_899FA0_END_VA >>> 0; }
export function luaEngine899fa0NextVa() { return LUA_ENGINE_899FA0_NEXT_VA >>> 0; }
export function luaEngine899fa0StackArgs() { return LUA_ENGINE_899FA0_STACK_ARGS >>> 0; }
export function luaEngine899fa0EcxArg() { return LUA_ENGINE_899FA0_ECX_ARG >>> 0; }
export function luaEngine899fa0CalleePopsStackArgs() { return LUA_ENGINE_899FA0_CALLEE_POPS_STACK_ARGS >>> 0; }
export function luaEngine899fa0AlignedPrologue() { return LUA_ENGINE_899FA0_ALIGNED_PROLOGUE >>> 0; }
export function luaEngine899fa0IatLuaType() { return LUA_ENGINE_899FA0_IAT_LUA_TYPE >>> 0; }
export function luaEngine899fa0GateInvertedEncoding() { return LUA_ENGINE_899FA0_GATE_INVERTED_ENCODING >>> 0; }
export function luaEngine899fa0CheckgetKey() { return LUA_ENGINE_899FA0_CHECKGET_KEY >>> 0; }
export function luaEngine899fa0CheckgetIndex() { return LUA_ENGINE_899FA0_CHECKGET_INDEX >>> 0; }
export function luaEngine899fa0CheckgetDefArg() { return LUA_ENGINE_899FA0_CHECKGET_DEF_ARG >>> 0; }
export function luaEngine899fa0CheckgetFieldOff() { return LUA_ENGINE_899FA0_CHECKGET_FIELD_OFF >>> 0; }
export function luaEngine899fa0CheckgetHelperVa() { return LUA_ENGINE_899FA0_CHECKGET_HELPER_VA >>> 0; }
export function luaEngine899fa0CastHelperVa() { return LUA_ENGINE_899FA0_CAST_HELPER_VA >>> 0; }
export function luaEngine899fa0CastVfDelta() { return LUA_ENGINE_899FA0_CAST_VF_DELTA >>> 0; }
export function luaEngine899fa0CastSrcTypeVa() { return LUA_ENGINE_899FA0_CAST_SRC_TYPE_VA >>> 0; }
export function luaEngine899fa0CastDstTypeVa() { return LUA_ENGINE_899FA0_CAST_DST_TYPE_VA >>> 0; }
export function luaEngine899fa0CastIsReference() { return LUA_ENGINE_899FA0_CAST_IS_REFERENCE >>> 0; }
export function luaEngine899fa0IatLuaPushnil() { return LUA_ENGINE_899FA0_IAT_LUA_PUSHNIL >>> 0; }
export function luaEngine899fa0NewuserdataSize() { return LUA_ENGINE_899FA0_NEWUSERDATA_SIZE >>> 0; }
export function luaEngine899fa0UdVtableVa() { return LUA_ENGINE_899FA0_UD_VTABLE_VA >>> 0; }
export function luaEngine899fa0UdPtrFieldOff() { return LUA_ENGINE_899FA0_UD_PTR_FIELD_OFF >>> 0; }
export function luaEngine899fa0RegistryIndex() { return LUA_ENGINE_899FA0_REGISTRY_INDEX_U32 >>> 0; }
export function luaEngine899fa0MetatableRawgetpKey() { return LUA_ENGINE_899FA0_METATABLE_RAWGETP_KEY >>> 0; }
export function luaEngine899fa0IatLuaRawgetp() { return LUA_ENGINE_899FA0_IAT_LUA_RAWGETP >>> 0; }
export function luaEngine899fa0IatLuaSetmetatable() { return LUA_ENGINE_899FA0_IAT_LUA_SETMETATABLE >>> 0; }
export function luaEngine899fa0SetmetatableIndex() { return LUA_ENGINE_899FA0_SETMETATABLE_INDEX_U32 >>> 0; }
export function luaEngine899fa0ReturnValue() { return LUA_ENGINE_899FA0_RETURN_VALUE >>> 0; }
/** 0x899fa0 law: FULL-WORD lua_type(L,1) gate (inverted je
 * encoding; nil skips check/get). taken <=> typeResult !== 0. */
export function luaEngine899fa0Type1GateTaken(typeResult) {
  return typeResult !== 0 ? 1 : 0;
}
export const LUA_ENGINE_899A040_STACK_ARGS = 0x1;
export const LUA_ENGINE_899A040_ECX_ARG = 0x0;
export const LUA_ENGINE_899A040_CALLEE_POPS_STACK_ARGS = 0x0;
export const LUA_ENGINE_899A040_ALIGNED_PROLOGUE = 0x0;
export const LUA_ENGINE_899A040_GATE_INVERTED_ENCODING = 0x1;
export const LUA_ENGINE_899A040_IAT_LUA_TYPE = 0xb18400;
export const LUA_ENGINE_899A040_CHECKGET_KEY = 0xc82a1e;
export const LUA_ENGINE_899A040_CHECKGET_INDEX = 0x1;
export const LUA_ENGINE_899A040_CHECKGET_FIELD_OFF = 0x4;
export const LUA_ENGINE_899A040_CHECKGET_HELPER_VA = 0x85c590;
export const LUA_ENGINE_899A040_CAST_HELPER_VA = 0xaf08b1;
export const LUA_ENGINE_899A040_CAST_VF_DELTA = 0x0;
export const LUA_ENGINE_899A040_CAST_SRC_TYPE_VA = 0xc5d7a4;
export const LUA_ENGINE_899A040_CAST_IS_REFERENCE = 0x0;
export const LUA_ENGINE_899A040_IAT_LUA_PUSHNIL = 0xb183e0;
export const LUA_ENGINE_899A040_NEWUSERDATA_SIZE = 0x8;
export const LUA_ENGINE_899A040_UD_VTABLE_VA = 0xb753c8;
export const LUA_ENGINE_899A040_UD_PTR_FIELD_OFF = 0x4;
export const LUA_ENGINE_899A040_REGISTRY_INDEX_U32 = 0xfff0b9d8;
export const LUA_ENGINE_899A040_IAT_LUA_RAWGETP = 0xb183bc;
export const LUA_ENGINE_899A040_IAT_LUA_SETMETATABLE = 0xb18398;
export const LUA_ENGINE_899A040_SETMETATABLE_INDEX_U32 = 0xfffffffe;
export const LUA_ENGINE_899A040_RETURN_VALUE = 0x1;
export const LUA_ENGINE_899A040_VA = 0x89a040;
export const LUA_ENGINE_899A040_END_VA = 0x89a0d9;
export const LUA_ENGINE_899A040_NEXT_VA = 0x89a0e0;
export const LUA_ENGINE_899A040_CHECKGET_DEF_ARG = 0x0;
export const LUA_ENGINE_899A040_CAST_DST_TYPE_VA = 0xc5d8cc;
export const LUA_ENGINE_899A040_METATABLE_RAWGETP_KEY = 0xc829ef;
export function luaEngine899a040HostVa() { return LUA_ENGINE_899A040_VA >>> 0; }
export function luaEngine899a040EndVa() { return LUA_ENGINE_899A040_END_VA >>> 0; }
export function luaEngine899a040NextVa() { return LUA_ENGINE_899A040_NEXT_VA >>> 0; }
export function luaEngine899a040StackArgs() { return LUA_ENGINE_899A040_STACK_ARGS >>> 0; }
export function luaEngine899a040EcxArg() { return LUA_ENGINE_899A040_ECX_ARG >>> 0; }
export function luaEngine899a040CalleePopsStackArgs() { return LUA_ENGINE_899A040_CALLEE_POPS_STACK_ARGS >>> 0; }
export function luaEngine899a040AlignedPrologue() { return LUA_ENGINE_899A040_ALIGNED_PROLOGUE >>> 0; }
export function luaEngine899a040IatLuaType() { return LUA_ENGINE_899A040_IAT_LUA_TYPE >>> 0; }
export function luaEngine899a040GateInvertedEncoding() { return LUA_ENGINE_899A040_GATE_INVERTED_ENCODING >>> 0; }
export function luaEngine899a040CheckgetKey() { return LUA_ENGINE_899A040_CHECKGET_KEY >>> 0; }
export function luaEngine899a040CheckgetIndex() { return LUA_ENGINE_899A040_CHECKGET_INDEX >>> 0; }
export function luaEngine899a040CheckgetDefArg() { return LUA_ENGINE_899A040_CHECKGET_DEF_ARG >>> 0; }
export function luaEngine899a040CheckgetFieldOff() { return LUA_ENGINE_899A040_CHECKGET_FIELD_OFF >>> 0; }
export function luaEngine899a040CheckgetHelperVa() { return LUA_ENGINE_899A040_CHECKGET_HELPER_VA >>> 0; }
export function luaEngine899a040CastHelperVa() { return LUA_ENGINE_899A040_CAST_HELPER_VA >>> 0; }
export function luaEngine899a040CastVfDelta() { return LUA_ENGINE_899A040_CAST_VF_DELTA >>> 0; }
export function luaEngine899a040CastSrcTypeVa() { return LUA_ENGINE_899A040_CAST_SRC_TYPE_VA >>> 0; }
export function luaEngine899a040CastDstTypeVa() { return LUA_ENGINE_899A040_CAST_DST_TYPE_VA >>> 0; }
export function luaEngine899a040CastIsReference() { return LUA_ENGINE_899A040_CAST_IS_REFERENCE >>> 0; }
export function luaEngine899a040IatLuaPushnil() { return LUA_ENGINE_899A040_IAT_LUA_PUSHNIL >>> 0; }
export function luaEngine899a040NewuserdataSize() { return LUA_ENGINE_899A040_NEWUSERDATA_SIZE >>> 0; }
export function luaEngine899a040UdVtableVa() { return LUA_ENGINE_899A040_UD_VTABLE_VA >>> 0; }
export function luaEngine899a040UdPtrFieldOff() { return LUA_ENGINE_899A040_UD_PTR_FIELD_OFF >>> 0; }
export function luaEngine899a040RegistryIndex() { return LUA_ENGINE_899A040_REGISTRY_INDEX_U32 >>> 0; }
export function luaEngine899a040MetatableRawgetpKey() { return LUA_ENGINE_899A040_METATABLE_RAWGETP_KEY >>> 0; }
export function luaEngine899a040IatLuaRawgetp() { return LUA_ENGINE_899A040_IAT_LUA_RAWGETP >>> 0; }
export function luaEngine899a040IatLuaSetmetatable() { return LUA_ENGINE_899A040_IAT_LUA_SETMETATABLE >>> 0; }
export function luaEngine899a040SetmetatableIndex() { return LUA_ENGINE_899A040_SETMETATABLE_INDEX_U32 >>> 0; }
export function luaEngine899a040ReturnValue() { return LUA_ENGINE_899A040_RETURN_VALUE >>> 0; }
/** 0x89a040 law: FULL-WORD lua_type(L,1) gate (inverted je
 * encoding; nil skips check/get). taken <=> typeResult !== 0. */
export function luaEngine899a040Type1GateTaken(typeResult) {
  return typeResult !== 0 ? 1 : 0;
}
export const LUA_ENGINE_899A0E0_STACK_ARGS = 0x1;
export const LUA_ENGINE_899A0E0_ECX_ARG = 0x0;
export const LUA_ENGINE_899A0E0_CALLEE_POPS_STACK_ARGS = 0x0;
export const LUA_ENGINE_899A0E0_ALIGNED_PROLOGUE = 0x0;
export const LUA_ENGINE_899A0E0_GATE_INVERTED_ENCODING = 0x1;
export const LUA_ENGINE_899A0E0_IAT_LUA_TYPE = 0xb18400;
export const LUA_ENGINE_899A0E0_CHECKGET_KEY = 0xc82a1e;
export const LUA_ENGINE_899A0E0_CHECKGET_INDEX = 0x1;
export const LUA_ENGINE_899A0E0_CHECKGET_FIELD_OFF = 0x4;
export const LUA_ENGINE_899A0E0_CHECKGET_HELPER_VA = 0x85c590;
export const LUA_ENGINE_899A0E0_CAST_HELPER_VA = 0xaf08b1;
export const LUA_ENGINE_899A0E0_CAST_VF_DELTA = 0x0;
export const LUA_ENGINE_899A0E0_CAST_SRC_TYPE_VA = 0xc5d7a4;
export const LUA_ENGINE_899A0E0_CAST_IS_REFERENCE = 0x0;
export const LUA_ENGINE_899A0E0_IAT_LUA_PUSHNIL = 0xb183e0;
export const LUA_ENGINE_899A0E0_NEWUSERDATA_SIZE = 0x8;
export const LUA_ENGINE_899A0E0_UD_VTABLE_VA = 0xb753c8;
export const LUA_ENGINE_899A0E0_UD_PTR_FIELD_OFF = 0x4;
export const LUA_ENGINE_899A0E0_REGISTRY_INDEX_U32 = 0xfff0b9d8;
export const LUA_ENGINE_899A0E0_IAT_LUA_RAWGETP = 0xb183bc;
export const LUA_ENGINE_899A0E0_IAT_LUA_SETMETATABLE = 0xb18398;
export const LUA_ENGINE_899A0E0_SETMETATABLE_INDEX_U32 = 0xfffffffe;
export const LUA_ENGINE_899A0E0_RETURN_VALUE = 0x1;
export const LUA_ENGINE_899A0E0_VA = 0x89a0e0;
export const LUA_ENGINE_899A0E0_END_VA = 0x89a179;
export const LUA_ENGINE_899A0E0_NEXT_VA = 0x89a180;
export const LUA_ENGINE_899A0E0_CHECKGET_DEF_ARG = 0x1;
export const LUA_ENGINE_899A0E0_CAST_DST_TYPE_VA = 0xc5d770;
export const LUA_ENGINE_899A0E0_METATABLE_RAWGETP_KEY = 0xc829e8;
export function luaEngine899a0e0HostVa() { return LUA_ENGINE_899A0E0_VA >>> 0; }
export function luaEngine899a0e0EndVa() { return LUA_ENGINE_899A0E0_END_VA >>> 0; }
export function luaEngine899a0e0NextVa() { return LUA_ENGINE_899A0E0_NEXT_VA >>> 0; }
export function luaEngine899a0e0StackArgs() { return LUA_ENGINE_899A0E0_STACK_ARGS >>> 0; }
export function luaEngine899a0e0EcxArg() { return LUA_ENGINE_899A0E0_ECX_ARG >>> 0; }
export function luaEngine899a0e0CalleePopsStackArgs() { return LUA_ENGINE_899A0E0_CALLEE_POPS_STACK_ARGS >>> 0; }
export function luaEngine899a0e0AlignedPrologue() { return LUA_ENGINE_899A0E0_ALIGNED_PROLOGUE >>> 0; }
export function luaEngine899a0e0IatLuaType() { return LUA_ENGINE_899A0E0_IAT_LUA_TYPE >>> 0; }
export function luaEngine899a0e0GateInvertedEncoding() { return LUA_ENGINE_899A0E0_GATE_INVERTED_ENCODING >>> 0; }
export function luaEngine899a0e0CheckgetKey() { return LUA_ENGINE_899A0E0_CHECKGET_KEY >>> 0; }
export function luaEngine899a0e0CheckgetIndex() { return LUA_ENGINE_899A0E0_CHECKGET_INDEX >>> 0; }
export function luaEngine899a0e0CheckgetDefArg() { return LUA_ENGINE_899A0E0_CHECKGET_DEF_ARG >>> 0; }
export function luaEngine899a0e0CheckgetFieldOff() { return LUA_ENGINE_899A0E0_CHECKGET_FIELD_OFF >>> 0; }
export function luaEngine899a0e0CheckgetHelperVa() { return LUA_ENGINE_899A0E0_CHECKGET_HELPER_VA >>> 0; }
export function luaEngine899a0e0CastHelperVa() { return LUA_ENGINE_899A0E0_CAST_HELPER_VA >>> 0; }
export function luaEngine899a0e0CastVfDelta() { return LUA_ENGINE_899A0E0_CAST_VF_DELTA >>> 0; }
export function luaEngine899a0e0CastSrcTypeVa() { return LUA_ENGINE_899A0E0_CAST_SRC_TYPE_VA >>> 0; }
export function luaEngine899a0e0CastDstTypeVa() { return LUA_ENGINE_899A0E0_CAST_DST_TYPE_VA >>> 0; }
export function luaEngine899a0e0CastIsReference() { return LUA_ENGINE_899A0E0_CAST_IS_REFERENCE >>> 0; }
export function luaEngine899a0e0IatLuaPushnil() { return LUA_ENGINE_899A0E0_IAT_LUA_PUSHNIL >>> 0; }
export function luaEngine899a0e0NewuserdataSize() { return LUA_ENGINE_899A0E0_NEWUSERDATA_SIZE >>> 0; }
export function luaEngine899a0e0UdVtableVa() { return LUA_ENGINE_899A0E0_UD_VTABLE_VA >>> 0; }
export function luaEngine899a0e0UdPtrFieldOff() { return LUA_ENGINE_899A0E0_UD_PTR_FIELD_OFF >>> 0; }
export function luaEngine899a0e0RegistryIndex() { return LUA_ENGINE_899A0E0_REGISTRY_INDEX_U32 >>> 0; }
export function luaEngine899a0e0MetatableRawgetpKey() { return LUA_ENGINE_899A0E0_METATABLE_RAWGETP_KEY >>> 0; }
export function luaEngine899a0e0IatLuaRawgetp() { return LUA_ENGINE_899A0E0_IAT_LUA_RAWGETP >>> 0; }
export function luaEngine899a0e0IatLuaSetmetatable() { return LUA_ENGINE_899A0E0_IAT_LUA_SETMETATABLE >>> 0; }
export function luaEngine899a0e0SetmetatableIndex() { return LUA_ENGINE_899A0E0_SETMETATABLE_INDEX_U32 >>> 0; }
export function luaEngine899a0e0ReturnValue() { return LUA_ENGINE_899A0E0_RETURN_VALUE >>> 0; }
/** 0x89a0e0 law: FULL-WORD lua_type(L,1) gate (inverted je
 * encoding; nil skips check/get). taken <=> typeResult !== 0. */
export function luaEngine899a0e0Type1GateTaken(typeResult) {
  return typeResult !== 0 ? 1 : 0;
}
export const LUA_ENGINE_899A180_STACK_ARGS = 0x1;
export const LUA_ENGINE_899A180_ECX_ARG = 0x0;
export const LUA_ENGINE_899A180_CALLEE_POPS_STACK_ARGS = 0x0;
export const LUA_ENGINE_899A180_ALIGNED_PROLOGUE = 0x0;
export const LUA_ENGINE_899A180_GATE_INVERTED_ENCODING = 0x1;
export const LUA_ENGINE_899A180_IAT_LUA_TYPE = 0xb18400;
export const LUA_ENGINE_899A180_CHECKGET_KEY = 0xc82a1e;
export const LUA_ENGINE_899A180_CHECKGET_INDEX = 0x1;
export const LUA_ENGINE_899A180_CHECKGET_FIELD_OFF = 0x4;
export const LUA_ENGINE_899A180_CHECKGET_HELPER_VA = 0x85c590;
export const LUA_ENGINE_899A180_CAST_HELPER_VA = 0xaf08b1;
export const LUA_ENGINE_899A180_CAST_VF_DELTA = 0x0;
export const LUA_ENGINE_899A180_CAST_SRC_TYPE_VA = 0xc5d7a4;
export const LUA_ENGINE_899A180_CAST_IS_REFERENCE = 0x0;
export const LUA_ENGINE_899A180_IAT_LUA_PUSHNIL = 0xb183e0;
export const LUA_ENGINE_899A180_NEWUSERDATA_SIZE = 0x8;
export const LUA_ENGINE_899A180_UD_VTABLE_VA = 0xb753c8;
export const LUA_ENGINE_899A180_UD_PTR_FIELD_OFF = 0x4;
export const LUA_ENGINE_899A180_REGISTRY_INDEX_U32 = 0xfff0b9d8;
export const LUA_ENGINE_899A180_IAT_LUA_RAWGETP = 0xb183bc;
export const LUA_ENGINE_899A180_IAT_LUA_SETMETATABLE = 0xb18398;
export const LUA_ENGINE_899A180_SETMETATABLE_INDEX_U32 = 0xfffffffe;
export const LUA_ENGINE_899A180_RETURN_VALUE = 0x1;
export const LUA_ENGINE_899A180_VA = 0x89a180;
export const LUA_ENGINE_899A180_END_VA = 0x89a219;
export const LUA_ENGINE_899A180_NEXT_VA = 0x89a220;
export const LUA_ENGINE_899A180_CHECKGET_DEF_ARG = 0x0;
export const LUA_ENGINE_899A180_CAST_DST_TYPE_VA = 0xc5d770;
export const LUA_ENGINE_899A180_METATABLE_RAWGETP_KEY = 0xc829e9;
export function luaEngine899a180HostVa() { return LUA_ENGINE_899A180_VA >>> 0; }
export function luaEngine899a180EndVa() { return LUA_ENGINE_899A180_END_VA >>> 0; }
export function luaEngine899a180NextVa() { return LUA_ENGINE_899A180_NEXT_VA >>> 0; }
export function luaEngine899a180StackArgs() { return LUA_ENGINE_899A180_STACK_ARGS >>> 0; }
export function luaEngine899a180EcxArg() { return LUA_ENGINE_899A180_ECX_ARG >>> 0; }
export function luaEngine899a180CalleePopsStackArgs() { return LUA_ENGINE_899A180_CALLEE_POPS_STACK_ARGS >>> 0; }
export function luaEngine899a180AlignedPrologue() { return LUA_ENGINE_899A180_ALIGNED_PROLOGUE >>> 0; }
export function luaEngine899a180IatLuaType() { return LUA_ENGINE_899A180_IAT_LUA_TYPE >>> 0; }
export function luaEngine899a180GateInvertedEncoding() { return LUA_ENGINE_899A180_GATE_INVERTED_ENCODING >>> 0; }
export function luaEngine899a180CheckgetKey() { return LUA_ENGINE_899A180_CHECKGET_KEY >>> 0; }
export function luaEngine899a180CheckgetIndex() { return LUA_ENGINE_899A180_CHECKGET_INDEX >>> 0; }
export function luaEngine899a180CheckgetDefArg() { return LUA_ENGINE_899A180_CHECKGET_DEF_ARG >>> 0; }
export function luaEngine899a180CheckgetFieldOff() { return LUA_ENGINE_899A180_CHECKGET_FIELD_OFF >>> 0; }
export function luaEngine899a180CheckgetHelperVa() { return LUA_ENGINE_899A180_CHECKGET_HELPER_VA >>> 0; }
export function luaEngine899a180CastHelperVa() { return LUA_ENGINE_899A180_CAST_HELPER_VA >>> 0; }
export function luaEngine899a180CastVfDelta() { return LUA_ENGINE_899A180_CAST_VF_DELTA >>> 0; }
export function luaEngine899a180CastSrcTypeVa() { return LUA_ENGINE_899A180_CAST_SRC_TYPE_VA >>> 0; }
export function luaEngine899a180CastDstTypeVa() { return LUA_ENGINE_899A180_CAST_DST_TYPE_VA >>> 0; }
export function luaEngine899a180CastIsReference() { return LUA_ENGINE_899A180_CAST_IS_REFERENCE >>> 0; }
export function luaEngine899a180IatLuaPushnil() { return LUA_ENGINE_899A180_IAT_LUA_PUSHNIL >>> 0; }
export function luaEngine899a180NewuserdataSize() { return LUA_ENGINE_899A180_NEWUSERDATA_SIZE >>> 0; }
export function luaEngine899a180UdVtableVa() { return LUA_ENGINE_899A180_UD_VTABLE_VA >>> 0; }
export function luaEngine899a180UdPtrFieldOff() { return LUA_ENGINE_899A180_UD_PTR_FIELD_OFF >>> 0; }
export function luaEngine899a180RegistryIndex() { return LUA_ENGINE_899A180_REGISTRY_INDEX_U32 >>> 0; }
export function luaEngine899a180MetatableRawgetpKey() { return LUA_ENGINE_899A180_METATABLE_RAWGETP_KEY >>> 0; }
export function luaEngine899a180IatLuaRawgetp() { return LUA_ENGINE_899A180_IAT_LUA_RAWGETP >>> 0; }
export function luaEngine899a180IatLuaSetmetatable() { return LUA_ENGINE_899A180_IAT_LUA_SETMETATABLE >>> 0; }
export function luaEngine899a180SetmetatableIndex() { return LUA_ENGINE_899A180_SETMETATABLE_INDEX_U32 >>> 0; }
export function luaEngine899a180ReturnValue() { return LUA_ENGINE_899A180_RETURN_VALUE >>> 0; }
/** 0x89a180 law: FULL-WORD lua_type(L,1) gate (inverted je
 * encoding; nil skips check/get). taken <=> typeResult !== 0. */
export function luaEngine899a180Type1GateTaken(typeResult) {
  return typeResult !== 0 ? 1 : 0;
}
export const LUA_ENGINE_899A220_STACK_ARGS = 0x1;
export const LUA_ENGINE_899A220_ECX_ARG = 0x0;
export const LUA_ENGINE_899A220_CALLEE_POPS_STACK_ARGS = 0x0;
export const LUA_ENGINE_899A220_ALIGNED_PROLOGUE = 0x0;
export const LUA_ENGINE_899A220_GATE_INVERTED_ENCODING = 0x1;
export const LUA_ENGINE_899A220_IAT_LUA_TYPE = 0xb18400;
export const LUA_ENGINE_899A220_CHECKGET_KEY = 0xc82a1e;
export const LUA_ENGINE_899A220_CHECKGET_INDEX = 0x1;
export const LUA_ENGINE_899A220_CHECKGET_FIELD_OFF = 0x4;
export const LUA_ENGINE_899A220_CHECKGET_HELPER_VA = 0x85c590;
export const LUA_ENGINE_899A220_CAST_HELPER_VA = 0xaf08b1;
export const LUA_ENGINE_899A220_CAST_VF_DELTA = 0x0;
export const LUA_ENGINE_899A220_CAST_SRC_TYPE_VA = 0xc5d7a4;
export const LUA_ENGINE_899A220_CAST_IS_REFERENCE = 0x0;
export const LUA_ENGINE_899A220_IAT_LUA_PUSHNIL = 0xb183e0;
export const LUA_ENGINE_899A220_NEWUSERDATA_SIZE = 0x8;
export const LUA_ENGINE_899A220_UD_VTABLE_VA = 0xb753c8;
export const LUA_ENGINE_899A220_UD_PTR_FIELD_OFF = 0x4;
export const LUA_ENGINE_899A220_REGISTRY_INDEX_U32 = 0xfff0b9d8;
export const LUA_ENGINE_899A220_IAT_LUA_RAWGETP = 0xb183bc;
export const LUA_ENGINE_899A220_IAT_LUA_SETMETATABLE = 0xb18398;
export const LUA_ENGINE_899A220_SETMETATABLE_INDEX_U32 = 0xfffffffe;
export const LUA_ENGINE_899A220_RETURN_VALUE = 0x1;
export const LUA_ENGINE_899A220_VA = 0x89a220;
export const LUA_ENGINE_899A220_END_VA = 0x89a2b9;
export const LUA_ENGINE_899A220_NEXT_VA = 0x89a2c0;
export const LUA_ENGINE_899A220_CHECKGET_DEF_ARG = 0x1;
export const LUA_ENGINE_899A220_CAST_DST_TYPE_VA = 0xc5e8b8;
export const LUA_ENGINE_899A220_METATABLE_RAWGETP_KEY = 0xc829eb;
export function luaEngine899a220HostVa() { return LUA_ENGINE_899A220_VA >>> 0; }
export function luaEngine899a220EndVa() { return LUA_ENGINE_899A220_END_VA >>> 0; }
export function luaEngine899a220NextVa() { return LUA_ENGINE_899A220_NEXT_VA >>> 0; }
export function luaEngine899a220StackArgs() { return LUA_ENGINE_899A220_STACK_ARGS >>> 0; }
export function luaEngine899a220EcxArg() { return LUA_ENGINE_899A220_ECX_ARG >>> 0; }
export function luaEngine899a220CalleePopsStackArgs() { return LUA_ENGINE_899A220_CALLEE_POPS_STACK_ARGS >>> 0; }
export function luaEngine899a220AlignedPrologue() { return LUA_ENGINE_899A220_ALIGNED_PROLOGUE >>> 0; }
export function luaEngine899a220IatLuaType() { return LUA_ENGINE_899A220_IAT_LUA_TYPE >>> 0; }
export function luaEngine899a220GateInvertedEncoding() { return LUA_ENGINE_899A220_GATE_INVERTED_ENCODING >>> 0; }
export function luaEngine899a220CheckgetKey() { return LUA_ENGINE_899A220_CHECKGET_KEY >>> 0; }
export function luaEngine899a220CheckgetIndex() { return LUA_ENGINE_899A220_CHECKGET_INDEX >>> 0; }
export function luaEngine899a220CheckgetDefArg() { return LUA_ENGINE_899A220_CHECKGET_DEF_ARG >>> 0; }
export function luaEngine899a220CheckgetFieldOff() { return LUA_ENGINE_899A220_CHECKGET_FIELD_OFF >>> 0; }
export function luaEngine899a220CheckgetHelperVa() { return LUA_ENGINE_899A220_CHECKGET_HELPER_VA >>> 0; }
export function luaEngine899a220CastHelperVa() { return LUA_ENGINE_899A220_CAST_HELPER_VA >>> 0; }
export function luaEngine899a220CastVfDelta() { return LUA_ENGINE_899A220_CAST_VF_DELTA >>> 0; }
export function luaEngine899a220CastSrcTypeVa() { return LUA_ENGINE_899A220_CAST_SRC_TYPE_VA >>> 0; }
export function luaEngine899a220CastDstTypeVa() { return LUA_ENGINE_899A220_CAST_DST_TYPE_VA >>> 0; }
export function luaEngine899a220CastIsReference() { return LUA_ENGINE_899A220_CAST_IS_REFERENCE >>> 0; }
export function luaEngine899a220IatLuaPushnil() { return LUA_ENGINE_899A220_IAT_LUA_PUSHNIL >>> 0; }
export function luaEngine899a220NewuserdataSize() { return LUA_ENGINE_899A220_NEWUSERDATA_SIZE >>> 0; }
export function luaEngine899a220UdVtableVa() { return LUA_ENGINE_899A220_UD_VTABLE_VA >>> 0; }
export function luaEngine899a220UdPtrFieldOff() { return LUA_ENGINE_899A220_UD_PTR_FIELD_OFF >>> 0; }
export function luaEngine899a220RegistryIndex() { return LUA_ENGINE_899A220_REGISTRY_INDEX_U32 >>> 0; }
export function luaEngine899a220MetatableRawgetpKey() { return LUA_ENGINE_899A220_METATABLE_RAWGETP_KEY >>> 0; }
export function luaEngine899a220IatLuaRawgetp() { return LUA_ENGINE_899A220_IAT_LUA_RAWGETP >>> 0; }
export function luaEngine899a220IatLuaSetmetatable() { return LUA_ENGINE_899A220_IAT_LUA_SETMETATABLE >>> 0; }
export function luaEngine899a220SetmetatableIndex() { return LUA_ENGINE_899A220_SETMETATABLE_INDEX_U32 >>> 0; }
export function luaEngine899a220ReturnValue() { return LUA_ENGINE_899A220_RETURN_VALUE >>> 0; }
/** 0x89a220 law: FULL-WORD lua_type(L,1) gate (inverted je
 * encoding; nil skips check/get). taken <=> typeResult !== 0. */
export function luaEngine899a220Type1GateTaken(typeResult) {
  return typeResult !== 0 ? 1 : 0;
}
export const LUA_ENGINE_899A2C0_STACK_ARGS = 0x1;
export const LUA_ENGINE_899A2C0_ECX_ARG = 0x0;
export const LUA_ENGINE_899A2C0_CALLEE_POPS_STACK_ARGS = 0x0;
export const LUA_ENGINE_899A2C0_ALIGNED_PROLOGUE = 0x0;
export const LUA_ENGINE_899A2C0_GATE_INVERTED_ENCODING = 0x1;
export const LUA_ENGINE_899A2C0_IAT_LUA_TYPE = 0xb18400;
export const LUA_ENGINE_899A2C0_CHECKGET_KEY = 0xc82a1e;
export const LUA_ENGINE_899A2C0_CHECKGET_INDEX = 0x1;
export const LUA_ENGINE_899A2C0_CHECKGET_FIELD_OFF = 0x4;
export const LUA_ENGINE_899A2C0_CHECKGET_HELPER_VA = 0x85c590;
export const LUA_ENGINE_899A2C0_CAST_HELPER_VA = 0xaf08b1;
export const LUA_ENGINE_899A2C0_CAST_VF_DELTA = 0x0;
export const LUA_ENGINE_899A2C0_CAST_SRC_TYPE_VA = 0xc5d7a4;
export const LUA_ENGINE_899A2C0_CAST_IS_REFERENCE = 0x0;
export const LUA_ENGINE_899A2C0_IAT_LUA_PUSHNIL = 0xb183e0;
export const LUA_ENGINE_899A2C0_NEWUSERDATA_SIZE = 0x8;
export const LUA_ENGINE_899A2C0_UD_VTABLE_VA = 0xb753c8;
export const LUA_ENGINE_899A2C0_UD_PTR_FIELD_OFF = 0x4;
export const LUA_ENGINE_899A2C0_REGISTRY_INDEX_U32 = 0xfff0b9d8;
export const LUA_ENGINE_899A2C0_IAT_LUA_RAWGETP = 0xb183bc;
export const LUA_ENGINE_899A2C0_IAT_LUA_SETMETATABLE = 0xb18398;
export const LUA_ENGINE_899A2C0_SETMETATABLE_INDEX_U32 = 0xfffffffe;
export const LUA_ENGINE_899A2C0_RETURN_VALUE = 0x1;
export const LUA_ENGINE_899A2C0_VA = 0x89a2c0;
export const LUA_ENGINE_899A2C0_END_VA = 0x89a359;
export const LUA_ENGINE_899A2C0_NEXT_VA = 0x89a360;
export const LUA_ENGINE_899A2C0_CHECKGET_DEF_ARG = 0x0;
export const LUA_ENGINE_899A2C0_CAST_DST_TYPE_VA = 0xc5e8b8;
export const LUA_ENGINE_899A2C0_METATABLE_RAWGETP_KEY = 0xc829ec;
export function luaEngine899a2c0HostVa() { return LUA_ENGINE_899A2C0_VA >>> 0; }
export function luaEngine899a2c0EndVa() { return LUA_ENGINE_899A2C0_END_VA >>> 0; }
export function luaEngine899a2c0NextVa() { return LUA_ENGINE_899A2C0_NEXT_VA >>> 0; }
export function luaEngine899a2c0StackArgs() { return LUA_ENGINE_899A2C0_STACK_ARGS >>> 0; }
export function luaEngine899a2c0EcxArg() { return LUA_ENGINE_899A2C0_ECX_ARG >>> 0; }
export function luaEngine899a2c0CalleePopsStackArgs() { return LUA_ENGINE_899A2C0_CALLEE_POPS_STACK_ARGS >>> 0; }
export function luaEngine899a2c0AlignedPrologue() { return LUA_ENGINE_899A2C0_ALIGNED_PROLOGUE >>> 0; }
export function luaEngine899a2c0IatLuaType() { return LUA_ENGINE_899A2C0_IAT_LUA_TYPE >>> 0; }
export function luaEngine899a2c0GateInvertedEncoding() { return LUA_ENGINE_899A2C0_GATE_INVERTED_ENCODING >>> 0; }
export function luaEngine899a2c0CheckgetKey() { return LUA_ENGINE_899A2C0_CHECKGET_KEY >>> 0; }
export function luaEngine899a2c0CheckgetIndex() { return LUA_ENGINE_899A2C0_CHECKGET_INDEX >>> 0; }
export function luaEngine899a2c0CheckgetDefArg() { return LUA_ENGINE_899A2C0_CHECKGET_DEF_ARG >>> 0; }
export function luaEngine899a2c0CheckgetFieldOff() { return LUA_ENGINE_899A2C0_CHECKGET_FIELD_OFF >>> 0; }
export function luaEngine899a2c0CheckgetHelperVa() { return LUA_ENGINE_899A2C0_CHECKGET_HELPER_VA >>> 0; }
export function luaEngine899a2c0CastHelperVa() { return LUA_ENGINE_899A2C0_CAST_HELPER_VA >>> 0; }
export function luaEngine899a2c0CastVfDelta() { return LUA_ENGINE_899A2C0_CAST_VF_DELTA >>> 0; }
export function luaEngine899a2c0CastSrcTypeVa() { return LUA_ENGINE_899A2C0_CAST_SRC_TYPE_VA >>> 0; }
export function luaEngine899a2c0CastDstTypeVa() { return LUA_ENGINE_899A2C0_CAST_DST_TYPE_VA >>> 0; }
export function luaEngine899a2c0CastIsReference() { return LUA_ENGINE_899A2C0_CAST_IS_REFERENCE >>> 0; }
export function luaEngine899a2c0IatLuaPushnil() { return LUA_ENGINE_899A2C0_IAT_LUA_PUSHNIL >>> 0; }
export function luaEngine899a2c0NewuserdataSize() { return LUA_ENGINE_899A2C0_NEWUSERDATA_SIZE >>> 0; }
export function luaEngine899a2c0UdVtableVa() { return LUA_ENGINE_899A2C0_UD_VTABLE_VA >>> 0; }
export function luaEngine899a2c0UdPtrFieldOff() { return LUA_ENGINE_899A2C0_UD_PTR_FIELD_OFF >>> 0; }
export function luaEngine899a2c0RegistryIndex() { return LUA_ENGINE_899A2C0_REGISTRY_INDEX_U32 >>> 0; }
export function luaEngine899a2c0MetatableRawgetpKey() { return LUA_ENGINE_899A2C0_METATABLE_RAWGETP_KEY >>> 0; }
export function luaEngine899a2c0IatLuaRawgetp() { return LUA_ENGINE_899A2C0_IAT_LUA_RAWGETP >>> 0; }
export function luaEngine899a2c0IatLuaSetmetatable() { return LUA_ENGINE_899A2C0_IAT_LUA_SETMETATABLE >>> 0; }
export function luaEngine899a2c0SetmetatableIndex() { return LUA_ENGINE_899A2C0_SETMETATABLE_INDEX_U32 >>> 0; }
export function luaEngine899a2c0ReturnValue() { return LUA_ENGINE_899A2C0_RETURN_VALUE >>> 0; }
/** 0x89a2c0 law: FULL-WORD lua_type(L,1) gate (inverted je
 * encoding; nil skips check/get). taken <=> typeResult !== 0. */
export function luaEngine899a2c0Type1GateTaken(typeResult) {
  return typeResult !== 0 ? 1 : 0;
}
export const LUA_ENGINE_899A360_STACK_ARGS = 0x1;
export const LUA_ENGINE_899A360_ECX_ARG = 0x0;
export const LUA_ENGINE_899A360_CALLEE_POPS_STACK_ARGS = 0x0;
export const LUA_ENGINE_899A360_ALIGNED_PROLOGUE = 0x0;
export const LUA_ENGINE_899A360_GATE_INVERTED_ENCODING = 0x1;
export const LUA_ENGINE_899A360_IAT_LUA_TYPE = 0xb18400;
export const LUA_ENGINE_899A360_CHECKGET_KEY = 0xc82a1e;
export const LUA_ENGINE_899A360_CHECKGET_INDEX = 0x1;
export const LUA_ENGINE_899A360_CHECKGET_FIELD_OFF = 0x4;
export const LUA_ENGINE_899A360_CHECKGET_HELPER_VA = 0x85c590;
export const LUA_ENGINE_899A360_CAST_HELPER_VA = 0xaf08b1;
export const LUA_ENGINE_899A360_CAST_VF_DELTA = 0x0;
export const LUA_ENGINE_899A360_CAST_SRC_TYPE_VA = 0xc5d7a4;
export const LUA_ENGINE_899A360_CAST_IS_REFERENCE = 0x0;
export const LUA_ENGINE_899A360_IAT_LUA_PUSHNIL = 0xb183e0;
export const LUA_ENGINE_899A360_NEWUSERDATA_SIZE = 0x8;
export const LUA_ENGINE_899A360_UD_VTABLE_VA = 0xb753c8;
export const LUA_ENGINE_899A360_UD_PTR_FIELD_OFF = 0x4;
export const LUA_ENGINE_899A360_REGISTRY_INDEX_U32 = 0xfff0b9d8;
export const LUA_ENGINE_899A360_IAT_LUA_RAWGETP = 0xb183bc;
export const LUA_ENGINE_899A360_IAT_LUA_SETMETATABLE = 0xb18398;
export const LUA_ENGINE_899A360_SETMETATABLE_INDEX_U32 = 0xfffffffe;
export const LUA_ENGINE_899A360_RETURN_VALUE = 0x1;
export const LUA_ENGINE_899A360_VA = 0x89a360;
export const LUA_ENGINE_899A360_END_VA = 0x89a3f9;
export const LUA_ENGINE_899A360_NEXT_VA = 0x89a400;
export const LUA_ENGINE_899A360_CHECKGET_DEF_ARG = 0x1;
export const LUA_ENGINE_899A360_CAST_DST_TYPE_VA = 0xc5d964;
export const LUA_ENGINE_899A360_METATABLE_RAWGETP_KEY = 0xc829e5;
export function luaEngine899a360HostVa() { return LUA_ENGINE_899A360_VA >>> 0; }
export function luaEngine899a360EndVa() { return LUA_ENGINE_899A360_END_VA >>> 0; }
export function luaEngine899a360NextVa() { return LUA_ENGINE_899A360_NEXT_VA >>> 0; }
export function luaEngine899a360StackArgs() { return LUA_ENGINE_899A360_STACK_ARGS >>> 0; }
export function luaEngine899a360EcxArg() { return LUA_ENGINE_899A360_ECX_ARG >>> 0; }
export function luaEngine899a360CalleePopsStackArgs() { return LUA_ENGINE_899A360_CALLEE_POPS_STACK_ARGS >>> 0; }
export function luaEngine899a360AlignedPrologue() { return LUA_ENGINE_899A360_ALIGNED_PROLOGUE >>> 0; }
export function luaEngine899a360IatLuaType() { return LUA_ENGINE_899A360_IAT_LUA_TYPE >>> 0; }
export function luaEngine899a360GateInvertedEncoding() { return LUA_ENGINE_899A360_GATE_INVERTED_ENCODING >>> 0; }
export function luaEngine899a360CheckgetKey() { return LUA_ENGINE_899A360_CHECKGET_KEY >>> 0; }
export function luaEngine899a360CheckgetIndex() { return LUA_ENGINE_899A360_CHECKGET_INDEX >>> 0; }
export function luaEngine899a360CheckgetDefArg() { return LUA_ENGINE_899A360_CHECKGET_DEF_ARG >>> 0; }
export function luaEngine899a360CheckgetFieldOff() { return LUA_ENGINE_899A360_CHECKGET_FIELD_OFF >>> 0; }
export function luaEngine899a360CheckgetHelperVa() { return LUA_ENGINE_899A360_CHECKGET_HELPER_VA >>> 0; }
export function luaEngine899a360CastHelperVa() { return LUA_ENGINE_899A360_CAST_HELPER_VA >>> 0; }
export function luaEngine899a360CastVfDelta() { return LUA_ENGINE_899A360_CAST_VF_DELTA >>> 0; }
export function luaEngine899a360CastSrcTypeVa() { return LUA_ENGINE_899A360_CAST_SRC_TYPE_VA >>> 0; }
export function luaEngine899a360CastDstTypeVa() { return LUA_ENGINE_899A360_CAST_DST_TYPE_VA >>> 0; }
export function luaEngine899a360CastIsReference() { return LUA_ENGINE_899A360_CAST_IS_REFERENCE >>> 0; }
export function luaEngine899a360IatLuaPushnil() { return LUA_ENGINE_899A360_IAT_LUA_PUSHNIL >>> 0; }
export function luaEngine899a360NewuserdataSize() { return LUA_ENGINE_899A360_NEWUSERDATA_SIZE >>> 0; }
export function luaEngine899a360UdVtableVa() { return LUA_ENGINE_899A360_UD_VTABLE_VA >>> 0; }
export function luaEngine899a360UdPtrFieldOff() { return LUA_ENGINE_899A360_UD_PTR_FIELD_OFF >>> 0; }
export function luaEngine899a360RegistryIndex() { return LUA_ENGINE_899A360_REGISTRY_INDEX_U32 >>> 0; }
export function luaEngine899a360MetatableRawgetpKey() { return LUA_ENGINE_899A360_METATABLE_RAWGETP_KEY >>> 0; }
export function luaEngine899a360IatLuaRawgetp() { return LUA_ENGINE_899A360_IAT_LUA_RAWGETP >>> 0; }
export function luaEngine899a360IatLuaSetmetatable() { return LUA_ENGINE_899A360_IAT_LUA_SETMETATABLE >>> 0; }
export function luaEngine899a360SetmetatableIndex() { return LUA_ENGINE_899A360_SETMETATABLE_INDEX_U32 >>> 0; }
export function luaEngine899a360ReturnValue() { return LUA_ENGINE_899A360_RETURN_VALUE >>> 0; }
/** 0x89a360 law: FULL-WORD lua_type(L,1) gate (inverted je
 * encoding; nil skips check/get). taken <=> typeResult !== 0. */
export function luaEngine899a360Type1GateTaken(typeResult) {
  return typeResult !== 0 ? 1 : 0;
}
export const LUA_ENGINE_899A400_STACK_ARGS = 0x1;
export const LUA_ENGINE_899A400_ECX_ARG = 0x0;
export const LUA_ENGINE_899A400_CALLEE_POPS_STACK_ARGS = 0x0;
export const LUA_ENGINE_899A400_ALIGNED_PROLOGUE = 0x0;
export const LUA_ENGINE_899A400_GATE_INVERTED_ENCODING = 0x1;
export const LUA_ENGINE_899A400_IAT_LUA_TYPE = 0xb18400;
export const LUA_ENGINE_899A400_CHECKGET_KEY = 0xc82a1e;
export const LUA_ENGINE_899A400_CHECKGET_INDEX = 0x1;
export const LUA_ENGINE_899A400_CHECKGET_FIELD_OFF = 0x4;
export const LUA_ENGINE_899A400_CHECKGET_HELPER_VA = 0x85c590;
export const LUA_ENGINE_899A400_CAST_HELPER_VA = 0xaf08b1;
export const LUA_ENGINE_899A400_CAST_VF_DELTA = 0x0;
export const LUA_ENGINE_899A400_CAST_SRC_TYPE_VA = 0xc5d7a4;
export const LUA_ENGINE_899A400_CAST_IS_REFERENCE = 0x0;
export const LUA_ENGINE_899A400_IAT_LUA_PUSHNIL = 0xb183e0;
export const LUA_ENGINE_899A400_NEWUSERDATA_SIZE = 0x8;
export const LUA_ENGINE_899A400_UD_VTABLE_VA = 0xb753c8;
export const LUA_ENGINE_899A400_UD_PTR_FIELD_OFF = 0x4;
export const LUA_ENGINE_899A400_REGISTRY_INDEX_U32 = 0xfff0b9d8;
export const LUA_ENGINE_899A400_IAT_LUA_RAWGETP = 0xb183bc;
export const LUA_ENGINE_899A400_IAT_LUA_SETMETATABLE = 0xb18398;
export const LUA_ENGINE_899A400_SETMETATABLE_INDEX_U32 = 0xfffffffe;
export const LUA_ENGINE_899A400_RETURN_VALUE = 0x1;
export const LUA_ENGINE_899A400_VA = 0x89a400;
export const LUA_ENGINE_899A400_END_VA = 0x89a499;
export const LUA_ENGINE_899A400_NEXT_VA = 0x89a4a0;
export const LUA_ENGINE_899A400_CHECKGET_DEF_ARG = 0x0;
export const LUA_ENGINE_899A400_CAST_DST_TYPE_VA = 0xc5d964;
export const LUA_ENGINE_899A400_METATABLE_RAWGETP_KEY = 0xc829e6;
export function luaEngine899a400HostVa() { return LUA_ENGINE_899A400_VA >>> 0; }
export function luaEngine899a400EndVa() { return LUA_ENGINE_899A400_END_VA >>> 0; }
export function luaEngine899a400NextVa() { return LUA_ENGINE_899A400_NEXT_VA >>> 0; }
export function luaEngine899a400StackArgs() { return LUA_ENGINE_899A400_STACK_ARGS >>> 0; }
export function luaEngine899a400EcxArg() { return LUA_ENGINE_899A400_ECX_ARG >>> 0; }
export function luaEngine899a400CalleePopsStackArgs() { return LUA_ENGINE_899A400_CALLEE_POPS_STACK_ARGS >>> 0; }
export function luaEngine899a400AlignedPrologue() { return LUA_ENGINE_899A400_ALIGNED_PROLOGUE >>> 0; }
export function luaEngine899a400IatLuaType() { return LUA_ENGINE_899A400_IAT_LUA_TYPE >>> 0; }
export function luaEngine899a400GateInvertedEncoding() { return LUA_ENGINE_899A400_GATE_INVERTED_ENCODING >>> 0; }
export function luaEngine899a400CheckgetKey() { return LUA_ENGINE_899A400_CHECKGET_KEY >>> 0; }
export function luaEngine899a400CheckgetIndex() { return LUA_ENGINE_899A400_CHECKGET_INDEX >>> 0; }
export function luaEngine899a400CheckgetDefArg() { return LUA_ENGINE_899A400_CHECKGET_DEF_ARG >>> 0; }
export function luaEngine899a400CheckgetFieldOff() { return LUA_ENGINE_899A400_CHECKGET_FIELD_OFF >>> 0; }
export function luaEngine899a400CheckgetHelperVa() { return LUA_ENGINE_899A400_CHECKGET_HELPER_VA >>> 0; }
export function luaEngine899a400CastHelperVa() { return LUA_ENGINE_899A400_CAST_HELPER_VA >>> 0; }
export function luaEngine899a400CastVfDelta() { return LUA_ENGINE_899A400_CAST_VF_DELTA >>> 0; }
export function luaEngine899a400CastSrcTypeVa() { return LUA_ENGINE_899A400_CAST_SRC_TYPE_VA >>> 0; }
export function luaEngine899a400CastDstTypeVa() { return LUA_ENGINE_899A400_CAST_DST_TYPE_VA >>> 0; }
export function luaEngine899a400CastIsReference() { return LUA_ENGINE_899A400_CAST_IS_REFERENCE >>> 0; }
export function luaEngine899a400IatLuaPushnil() { return LUA_ENGINE_899A400_IAT_LUA_PUSHNIL >>> 0; }
export function luaEngine899a400NewuserdataSize() { return LUA_ENGINE_899A400_NEWUSERDATA_SIZE >>> 0; }
export function luaEngine899a400UdVtableVa() { return LUA_ENGINE_899A400_UD_VTABLE_VA >>> 0; }
export function luaEngine899a400UdPtrFieldOff() { return LUA_ENGINE_899A400_UD_PTR_FIELD_OFF >>> 0; }
export function luaEngine899a400RegistryIndex() { return LUA_ENGINE_899A400_REGISTRY_INDEX_U32 >>> 0; }
export function luaEngine899a400MetatableRawgetpKey() { return LUA_ENGINE_899A400_METATABLE_RAWGETP_KEY >>> 0; }
export function luaEngine899a400IatLuaRawgetp() { return LUA_ENGINE_899A400_IAT_LUA_RAWGETP >>> 0; }
export function luaEngine899a400IatLuaSetmetatable() { return LUA_ENGINE_899A400_IAT_LUA_SETMETATABLE >>> 0; }
export function luaEngine899a400SetmetatableIndex() { return LUA_ENGINE_899A400_SETMETATABLE_INDEX_U32 >>> 0; }
export function luaEngine899a400ReturnValue() { return LUA_ENGINE_899A400_RETURN_VALUE >>> 0; }
/** 0x89a400 law: FULL-WORD lua_type(L,1) gate (inverted je
 * encoding; nil skips check/get). taken <=> typeResult !== 0. */
export function luaEngine899a400Type1GateTaken(typeResult) {
  return typeResult !== 0 ? 1 : 0;
}
export const LUA_ENGINE_899A4A0_VA = 0x89a4a0;
export const LUA_ENGINE_899A4A0_END_VA = 0x89a50c;
export const LUA_ENGINE_899A4A0_NEXT_VA = 0x89a510;
export const LUA_ENGINE_899A4A0_STACK_ARGS = 0x1;
export const LUA_ENGINE_899A4A0_ECX_ARG = 0x0;
export const LUA_ENGINE_899A4A0_CALLEE_POPS_STACK_ARGS = 0x0;
export const LUA_ENGINE_899A4A0_ALIGNED_PROLOGUE = 0x1;
export const LUA_ENGINE_899A4A0_GATE_INVERTED_ENCODING = 0x0;
export const LUA_ENGINE_899A4A0_IAT_LUA_TYPE = 0xb18400;
export const LUA_ENGINE_899A4A0_CHECKGET_KEY = 0xc82a1e;
export const LUA_ENGINE_899A4A0_CHECKGET_INDEX = 0x1;
export const LUA_ENGINE_899A4A0_CHECKGET_DEF_ARG = 0x0;
export const LUA_ENGINE_899A4A0_CHECKGET_FIELD_OFF = 0x4;
export const LUA_ENGINE_899A4A0_CHECKGET_HELPER_VA = 0x85c590;
export const LUA_ENGINE_899A4A0_IAT_LUA_TOUSERDATA = 0xb183b0;
export const LUA_ENGINE_899A4A0_TOUSERDATA_INDEX_U32 = 0xfff0b9d7;
export const LUA_ENGINE_899A4A0_METHOD_VTABLE_FIELD_OFF = 0x0;
export const LUA_ENGINE_899A4A0_IAT_LUA_CHECKINTEGER = 0xb183f4;
export const LUA_ENGINE_899A4A0_CHECKINTEGER_INDEX = 0x2;
export const LUA_ENGINE_899A4A0_METHOD_STACK_ARGS = 0x1;
export const LUA_ENGINE_899A4A0_RETURN_VALUE = 0x0;
export function luaEngine899a4a0HostVa() { return LUA_ENGINE_899A4A0_VA >>> 0; }
export function luaEngine899a4a0EndVa() { return LUA_ENGINE_899A4A0_END_VA >>> 0; }
export function luaEngine899a4a0NextVa() { return LUA_ENGINE_899A4A0_NEXT_VA >>> 0; }
export function luaEngine899a4a0StackArgs() { return LUA_ENGINE_899A4A0_STACK_ARGS >>> 0; }
export function luaEngine899a4a0EcxArg() { return LUA_ENGINE_899A4A0_ECX_ARG >>> 0; }
export function luaEngine899a4a0CalleePopsStackArgs() { return LUA_ENGINE_899A4A0_CALLEE_POPS_STACK_ARGS >>> 0; }
export function luaEngine899a4a0AlignedPrologue() { return LUA_ENGINE_899A4A0_ALIGNED_PROLOGUE >>> 0; }
export function luaEngine899a4a0GateInvertedEncoding() { return LUA_ENGINE_899A4A0_GATE_INVERTED_ENCODING >>> 0; }
export function luaEngine899a4a0IatLuaType() { return LUA_ENGINE_899A4A0_IAT_LUA_TYPE >>> 0; }
export function luaEngine899a4a0CheckgetKey() { return LUA_ENGINE_899A4A0_CHECKGET_KEY >>> 0; }
export function luaEngine899a4a0CheckgetIndex() { return LUA_ENGINE_899A4A0_CHECKGET_INDEX >>> 0; }
export function luaEngine899a4a0CheckgetDefArg() { return LUA_ENGINE_899A4A0_CHECKGET_DEF_ARG >>> 0; }
export function luaEngine899a4a0CheckgetFieldOff() { return LUA_ENGINE_899A4A0_CHECKGET_FIELD_OFF >>> 0; }
export function luaEngine899a4a0CheckgetHelperVa() { return LUA_ENGINE_899A4A0_CHECKGET_HELPER_VA >>> 0; }
export function luaEngine899a4a0IatLuaTouserdata() { return LUA_ENGINE_899A4A0_IAT_LUA_TOUSERDATA >>> 0; }
export function luaEngine899a4a0TouserdataIndex() { return LUA_ENGINE_899A4A0_TOUSERDATA_INDEX_U32 >>> 0; }
export function luaEngine899a4a0MethodVtableFieldOff() { return LUA_ENGINE_899A4A0_METHOD_VTABLE_FIELD_OFF >>> 0; }
export function luaEngine899a4a0IatLuaCheckinteger() { return LUA_ENGINE_899A4A0_IAT_LUA_CHECKINTEGER >>> 0; }
export function luaEngine899a4a0CheckintegerIndex() { return LUA_ENGINE_899A4A0_CHECKINTEGER_INDEX >>> 0; }
export function luaEngine899a4a0MethodStackArgs() { return LUA_ENGINE_899A4A0_METHOD_STACK_ARGS >>> 0; }
export function luaEngine899a4a0ReturnValue() { return LUA_ENGINE_899A4A0_RETURN_VALUE >>> 0; }
/** 0x89a4a0 law: FULL-WORD lua_type(L,1) gate (`jne`).
 * taken <=> typeResult !== 0. */
export function luaEngine899a4a0Type1GateTaken(typeResult) {
  return typeResult !== 0 ? 1 : 0;
}
export const LUA_ENGINE_899A510_VA = 0x89a510;
export const LUA_ENGINE_899A510_END_VA = 0x89a56c;
export const LUA_ENGINE_899A510_NEXT_VA = 0x89a570;
export const LUA_ENGINE_899A510_STACK_ARGS = 0x1;
export const LUA_ENGINE_899A510_ECX_ARG = 0x0;
export const LUA_ENGINE_899A510_CALLEE_POPS_STACK_ARGS = 0x0;
export const LUA_ENGINE_899A510_ALIGNED_PROLOGUE = 0x0;
export const LUA_ENGINE_899A510_GATE_INVERTED_ENCODING = 0x0;
export const LUA_ENGINE_899A510_IAT_LUA_TYPE = 0xb18400;
export const LUA_ENGINE_899A510_CHECKGET_KEY = 0xc82a1e;
export const LUA_ENGINE_899A510_CHECKGET_INDEX = 0x1;
export const LUA_ENGINE_899A510_CHECKGET_DEF_ARG = 0x1;
export const LUA_ENGINE_899A510_CHECKGET_FIELD_OFF = 0x4;
export const LUA_ENGINE_899A510_CHECKGET_HELPER_VA = 0x85c590;
export const LUA_ENGINE_899A510_IAT_LUA_TOUSERDATA = 0xb183b0;
export const LUA_ENGINE_899A510_TOUSERDATA_INDEX_U32 = 0xfff0b9d7;
export const LUA_ENGINE_899A510_METHOD_VTABLE_FIELD_OFF = 0x0;
export const LUA_ENGINE_899A510_METHOD_STACK_ARGS = 0x0;
export const LUA_ENGINE_899A510_RETURN_VALUE = 0x1;
export const LUA_ENGINE_899A510_PUSHER_HELPER_VA = 0x85bfd0;
export function luaEngine899a510HostVa() { return LUA_ENGINE_899A510_VA >>> 0; }
export function luaEngine899a510EndVa() { return LUA_ENGINE_899A510_END_VA >>> 0; }
export function luaEngine899a510NextVa() { return LUA_ENGINE_899A510_NEXT_VA >>> 0; }
export function luaEngine899a510StackArgs() { return LUA_ENGINE_899A510_STACK_ARGS >>> 0; }
export function luaEngine899a510EcxArg() { return LUA_ENGINE_899A510_ECX_ARG >>> 0; }
export function luaEngine899a510CalleePopsStackArgs() { return LUA_ENGINE_899A510_CALLEE_POPS_STACK_ARGS >>> 0; }
export function luaEngine899a510AlignedPrologue() { return LUA_ENGINE_899A510_ALIGNED_PROLOGUE >>> 0; }
export function luaEngine899a510GateInvertedEncoding() { return LUA_ENGINE_899A510_GATE_INVERTED_ENCODING >>> 0; }
export function luaEngine899a510IatLuaType() { return LUA_ENGINE_899A510_IAT_LUA_TYPE >>> 0; }
export function luaEngine899a510CheckgetKey() { return LUA_ENGINE_899A510_CHECKGET_KEY >>> 0; }
export function luaEngine899a510CheckgetIndex() { return LUA_ENGINE_899A510_CHECKGET_INDEX >>> 0; }
export function luaEngine899a510CheckgetDefArg() { return LUA_ENGINE_899A510_CHECKGET_DEF_ARG >>> 0; }
export function luaEngine899a510CheckgetFieldOff() { return LUA_ENGINE_899A510_CHECKGET_FIELD_OFF >>> 0; }
export function luaEngine899a510CheckgetHelperVa() { return LUA_ENGINE_899A510_CHECKGET_HELPER_VA >>> 0; }
export function luaEngine899a510IatLuaTouserdata() { return LUA_ENGINE_899A510_IAT_LUA_TOUSERDATA >>> 0; }
export function luaEngine899a510TouserdataIndex() { return LUA_ENGINE_899A510_TOUSERDATA_INDEX_U32 >>> 0; }
export function luaEngine899a510MethodVtableFieldOff() { return LUA_ENGINE_899A510_METHOD_VTABLE_FIELD_OFF >>> 0; }
export function luaEngine899a510MethodStackArgs() { return LUA_ENGINE_899A510_METHOD_STACK_ARGS >>> 0; }
export function luaEngine899a510PusherHelperVa() { return LUA_ENGINE_899A510_PUSHER_HELPER_VA >>> 0; }
export function luaEngine899a510ReturnValue() { return LUA_ENGINE_899A510_RETURN_VALUE >>> 0; }
/** 0x89a510 law: FULL-WORD lua_type(L,1) gate (`jne`).
 * taken <=> typeResult !== 0. */
export function luaEngine899a510Type1GateTaken(typeResult) {
  return typeResult !== 0 ? 1 : 0;
}
export const LUA_ENGINE_899A570_VA = 0x89a570;
export const LUA_ENGINE_899A570_END_VA = 0x89a5cc;
export const LUA_ENGINE_899A570_NEXT_VA = 0x89a5d0;
export const LUA_ENGINE_899A570_STACK_ARGS = 0x1;
export const LUA_ENGINE_899A570_ECX_ARG = 0x0;
export const LUA_ENGINE_899A570_CALLEE_POPS_STACK_ARGS = 0x0;
export const LUA_ENGINE_899A570_ALIGNED_PROLOGUE = 0x0;
export const LUA_ENGINE_899A570_GATE_INVERTED_ENCODING = 0x0;
export const LUA_ENGINE_899A570_IAT_LUA_TYPE = 0xb18400;
export const LUA_ENGINE_899A570_CHECKGET_KEY = 0xc82a1e;
export const LUA_ENGINE_899A570_CHECKGET_INDEX = 0x1;
export const LUA_ENGINE_899A570_CHECKGET_DEF_ARG = 0x1;
export const LUA_ENGINE_899A570_CHECKGET_FIELD_OFF = 0x4;
export const LUA_ENGINE_899A570_CHECKGET_HELPER_VA = 0x85c590;
export const LUA_ENGINE_899A570_IAT_LUA_TOUSERDATA = 0xb183b0;
export const LUA_ENGINE_899A570_TOUSERDATA_INDEX_U32 = 0xfff0b9d7;
export const LUA_ENGINE_899A570_METHOD_VTABLE_FIELD_OFF = 0x0;
export const LUA_ENGINE_899A570_METHOD_STACK_ARGS = 0x0;
export const LUA_ENGINE_899A570_RETURN_VALUE = 0x1;
export const LUA_ENGINE_899A570_PUSHER_HELPER_VA = 0x85bff0;
export function luaEngine899a570HostVa() { return LUA_ENGINE_899A570_VA >>> 0; }
export function luaEngine899a570EndVa() { return LUA_ENGINE_899A570_END_VA >>> 0; }
export function luaEngine899a570NextVa() { return LUA_ENGINE_899A570_NEXT_VA >>> 0; }
export function luaEngine899a570StackArgs() { return LUA_ENGINE_899A570_STACK_ARGS >>> 0; }
export function luaEngine899a570EcxArg() { return LUA_ENGINE_899A570_ECX_ARG >>> 0; }
export function luaEngine899a570CalleePopsStackArgs() { return LUA_ENGINE_899A570_CALLEE_POPS_STACK_ARGS >>> 0; }
export function luaEngine899a570AlignedPrologue() { return LUA_ENGINE_899A570_ALIGNED_PROLOGUE >>> 0; }
export function luaEngine899a570GateInvertedEncoding() { return LUA_ENGINE_899A570_GATE_INVERTED_ENCODING >>> 0; }
export function luaEngine899a570IatLuaType() { return LUA_ENGINE_899A570_IAT_LUA_TYPE >>> 0; }
export function luaEngine899a570CheckgetKey() { return LUA_ENGINE_899A570_CHECKGET_KEY >>> 0; }
export function luaEngine899a570CheckgetIndex() { return LUA_ENGINE_899A570_CHECKGET_INDEX >>> 0; }
export function luaEngine899a570CheckgetDefArg() { return LUA_ENGINE_899A570_CHECKGET_DEF_ARG >>> 0; }
export function luaEngine899a570CheckgetFieldOff() { return LUA_ENGINE_899A570_CHECKGET_FIELD_OFF >>> 0; }
export function luaEngine899a570CheckgetHelperVa() { return LUA_ENGINE_899A570_CHECKGET_HELPER_VA >>> 0; }
export function luaEngine899a570IatLuaTouserdata() { return LUA_ENGINE_899A570_IAT_LUA_TOUSERDATA >>> 0; }
export function luaEngine899a570TouserdataIndex() { return LUA_ENGINE_899A570_TOUSERDATA_INDEX_U32 >>> 0; }
export function luaEngine899a570MethodVtableFieldOff() { return LUA_ENGINE_899A570_METHOD_VTABLE_FIELD_OFF >>> 0; }
export function luaEngine899a570MethodStackArgs() { return LUA_ENGINE_899A570_METHOD_STACK_ARGS >>> 0; }
export function luaEngine899a570PusherHelperVa() { return LUA_ENGINE_899A570_PUSHER_HELPER_VA >>> 0; }
export function luaEngine899a570ReturnValue() { return LUA_ENGINE_899A570_RETURN_VALUE >>> 0; }
/** 0x89a570 law: FULL-WORD lua_type(L,1) gate (`jne`).
 * taken <=> typeResult !== 0. */
export function luaEngine899a570Type1GateTaken(typeResult) {
  return typeResult !== 0 ? 1 : 0;
}
export const LUA_ENGINE_899A5D0_VA = 0x89a5d0;
export const LUA_ENGINE_899A5D0_END_VA = 0x89a66e;
export const LUA_ENGINE_899A5D0_NEXT_VA = 0x89a670;
export const LUA_ENGINE_899A5D0_STACK_ARGS = 0x1;
export const LUA_ENGINE_899A5D0_ECX_ARG = 0x0;
export const LUA_ENGINE_899A5D0_CALLEE_POPS_STACK_ARGS = 0x0;
export const LUA_ENGINE_899A5D0_ALIGNED_PROLOGUE = 0x0;
export const LUA_ENGINE_899A5D0_GATE_INVERTED_ENCODING = 0x0;
export const LUA_ENGINE_899A5D0_IAT_LUA_TYPE = 0xb18400;
export const LUA_ENGINE_899A5D0_CHECKGET_KEY = 0xc82a1e;
export const LUA_ENGINE_899A5D0_CHECKGET_INDEX = 0x1;
export const LUA_ENGINE_899A5D0_CHECKGET_DEF_ARG = 0x1;
export const LUA_ENGINE_899A5D0_CHECKGET_FIELD_OFF = 0x4;
export const LUA_ENGINE_899A5D0_CHECKGET_HELPER_VA = 0x85c590;
export const LUA_ENGINE_899A5D0_IAT_LUA_TOUSERDATA = 0xb183b0;
export const LUA_ENGINE_899A5D0_TOUSERDATA_INDEX_U32 = 0xfff0b9d7;
export const LUA_ENGINE_899A5D0_METHOD_VTABLE_FIELD_OFF = 0x0;
export const LUA_ENGINE_899A5D0_METHOD_STACK_ARGS = 0x1;
export const LUA_ENGINE_899A5D0_RETURN_VALUE = 0x1;
export const LUA_ENGINE_899A5D0_NEWUSERDATA_SIZE = 0x10;
export const LUA_ENGINE_899A5D0_UD_VTABLE_VA = 0xb73574;
export const LUA_ENGINE_899A5D0_UD_PAYLOAD_PTR_OFF = 0x4;
export const LUA_ENGINE_899A5D0_UD_PAYLOAD_OFF = 0x8;
export const LUA_ENGINE_899A5D0_REGISTRY_INDEX_U32 = 0xfff0b9d8;
export const LUA_ENGINE_899A5D0_METATABLE_RAWGETP_KEY = 0xc82980;
export function luaEngine899a5d0HostVa() { return LUA_ENGINE_899A5D0_VA >>> 0; }
export function luaEngine899a5d0EndVa() { return LUA_ENGINE_899A5D0_END_VA >>> 0; }
export function luaEngine899a5d0NextVa() { return LUA_ENGINE_899A5D0_NEXT_VA >>> 0; }
export function luaEngine899a5d0StackArgs() { return LUA_ENGINE_899A5D0_STACK_ARGS >>> 0; }
export function luaEngine899a5d0EcxArg() { return LUA_ENGINE_899A5D0_ECX_ARG >>> 0; }
export function luaEngine899a5d0CalleePopsStackArgs() { return LUA_ENGINE_899A5D0_CALLEE_POPS_STACK_ARGS >>> 0; }
export function luaEngine899a5d0AlignedPrologue() { return LUA_ENGINE_899A5D0_ALIGNED_PROLOGUE >>> 0; }
export function luaEngine899a5d0GateInvertedEncoding() { return LUA_ENGINE_899A5D0_GATE_INVERTED_ENCODING >>> 0; }
export function luaEngine899a5d0IatLuaType() { return LUA_ENGINE_899A5D0_IAT_LUA_TYPE >>> 0; }
export function luaEngine899a5d0CheckgetKey() { return LUA_ENGINE_899A5D0_CHECKGET_KEY >>> 0; }
export function luaEngine899a5d0CheckgetIndex() { return LUA_ENGINE_899A5D0_CHECKGET_INDEX >>> 0; }
export function luaEngine899a5d0CheckgetDefArg() { return LUA_ENGINE_899A5D0_CHECKGET_DEF_ARG >>> 0; }
export function luaEngine899a5d0CheckgetFieldOff() { return LUA_ENGINE_899A5D0_CHECKGET_FIELD_OFF >>> 0; }
export function luaEngine899a5d0CheckgetHelperVa() { return LUA_ENGINE_899A5D0_CHECKGET_HELPER_VA >>> 0; }
export function luaEngine899a5d0IatLuaTouserdata() { return LUA_ENGINE_899A5D0_IAT_LUA_TOUSERDATA >>> 0; }
export function luaEngine899a5d0TouserdataIndex() { return LUA_ENGINE_899A5D0_TOUSERDATA_INDEX_U32 >>> 0; }
export function luaEngine899a5d0MethodVtableFieldOff() { return LUA_ENGINE_899A5D0_METHOD_VTABLE_FIELD_OFF >>> 0; }
export function luaEngine899a5d0MethodStackArgs() { return LUA_ENGINE_899A5D0_METHOD_STACK_ARGS >>> 0; }
export function luaEngine899a5d0NewuserdataSize() { return LUA_ENGINE_899A5D0_NEWUSERDATA_SIZE >>> 0; }
export function luaEngine899a5d0UdVtableVa() { return LUA_ENGINE_899A5D0_UD_VTABLE_VA >>> 0; }
export function luaEngine899a5d0UdPayloadPtrOff() { return LUA_ENGINE_899A5D0_UD_PAYLOAD_PTR_OFF >>> 0; }
export function luaEngine899a5d0UdPayloadOff() { return LUA_ENGINE_899A5D0_UD_PAYLOAD_OFF >>> 0; }
export function luaEngine899a5d0RegistryIndex() { return LUA_ENGINE_899A5D0_REGISTRY_INDEX_U32 >>> 0; }
export function luaEngine899a5d0MetatableRawgetpKey() { return LUA_ENGINE_899A5D0_METATABLE_RAWGETP_KEY >>> 0; }
export function luaEngine899a5d0ReturnValue() { return LUA_ENGINE_899A5D0_RETURN_VALUE >>> 0; }
/** 0x89a5d0 law: FULL-WORD lua_type(L,1) gate (`jne`).
 * taken <=> typeResult !== 0. */
export function luaEngine899a5d0Type1GateTaken(typeResult) {
  return typeResult !== 0 ? 1 : 0;
}
export const LUA_ENGINE_899A670_VA = 0x89a670;
export const LUA_ENGINE_899A670_END_VA = 0x89a6f2;
export const LUA_ENGINE_899A670_NEXT_VA = 0x89a700;
export const LUA_ENGINE_899A670_STACK_ARGS = 0x1;
export const LUA_ENGINE_899A670_ECX_ARG = 0x0;
export const LUA_ENGINE_899A670_CALLEE_POPS_STACK_ARGS = 0x0;
export const LUA_ENGINE_899A670_ALIGNED_PROLOGUE = 0x1;
export const LUA_ENGINE_899A670_GATE_INVERTED_ENCODING = 0x0;
export const LUA_ENGINE_899A670_IAT_LUA_TYPE = 0xb18400;
export const LUA_ENGINE_899A670_CHECKGET_KEY = 0xc82a1e;
export const LUA_ENGINE_899A670_CHECKGET_INDEX = 0x1;
export const LUA_ENGINE_899A670_CHECKGET_DEF_ARG = 0x0;
export const LUA_ENGINE_899A670_CHECKGET_FIELD_OFF = 0x4;
export const LUA_ENGINE_899A670_CHECKGET_HELPER_VA = 0x85c590;
export const LUA_ENGINE_899A670_IAT_LUA_TOUSERDATA = 0xb183b0;
export const LUA_ENGINE_899A670_TOUSERDATA_INDEX_U32 = 0xfff0b9d7;
export const LUA_ENGINE_899A670_METHOD_VTABLE_FIELD_OFF = 0x0;
export const LUA_ENGINE_899A670_METHOD_STACK_ARGS = 0x1;
export const LUA_ENGINE_899A670_RETURN_VALUE = 0x0;
export const LUA_ENGINE_899A670_FLOAT_LANE = 0x1;
export const LUA_ENGINE_899A670_IAT_LUA_CHECKNUMBER = 0xb18324;
export const LUA_ENGINE_899A670_CHECKNUMBER_INDEX = 0x2;
export function luaEngine899a670HostVa() { return LUA_ENGINE_899A670_VA >>> 0; }
export function luaEngine899a670EndVa() { return LUA_ENGINE_899A670_END_VA >>> 0; }
export function luaEngine899a670NextVa() { return LUA_ENGINE_899A670_NEXT_VA >>> 0; }
export function luaEngine899a670StackArgs() { return LUA_ENGINE_899A670_STACK_ARGS >>> 0; }
export function luaEngine899a670EcxArg() { return LUA_ENGINE_899A670_ECX_ARG >>> 0; }
export function luaEngine899a670CalleePopsStackArgs() { return LUA_ENGINE_899A670_CALLEE_POPS_STACK_ARGS >>> 0; }
export function luaEngine899a670AlignedPrologue() { return LUA_ENGINE_899A670_ALIGNED_PROLOGUE >>> 0; }
export function luaEngine899a670GateInvertedEncoding() { return LUA_ENGINE_899A670_GATE_INVERTED_ENCODING >>> 0; }
export function luaEngine899a670IatLuaType() { return LUA_ENGINE_899A670_IAT_LUA_TYPE >>> 0; }
export function luaEngine899a670CheckgetKey() { return LUA_ENGINE_899A670_CHECKGET_KEY >>> 0; }
export function luaEngine899a670CheckgetIndex() { return LUA_ENGINE_899A670_CHECKGET_INDEX >>> 0; }
export function luaEngine899a670CheckgetDefArg() { return LUA_ENGINE_899A670_CHECKGET_DEF_ARG >>> 0; }
export function luaEngine899a670CheckgetFieldOff() { return LUA_ENGINE_899A670_CHECKGET_FIELD_OFF >>> 0; }
export function luaEngine899a670CheckgetHelperVa() { return LUA_ENGINE_899A670_CHECKGET_HELPER_VA >>> 0; }
export function luaEngine899a670IatLuaTouserdata() { return LUA_ENGINE_899A670_IAT_LUA_TOUSERDATA >>> 0; }
export function luaEngine899a670TouserdataIndex() { return LUA_ENGINE_899A670_TOUSERDATA_INDEX_U32 >>> 0; }
export function luaEngine899a670MethodVtableFieldOff() { return LUA_ENGINE_899A670_METHOD_VTABLE_FIELD_OFF >>> 0; }
export function luaEngine899a670MethodStackArgs() { return LUA_ENGINE_899A670_METHOD_STACK_ARGS >>> 0; }
export function luaEngine899a670FloatLane() { return LUA_ENGINE_899A670_FLOAT_LANE >>> 0; }
export function luaEngine899a670IatLuaChecknumber() { return LUA_ENGINE_899A670_IAT_LUA_CHECKNUMBER >>> 0; }
export function luaEngine899a670ChecknumberIndex() { return LUA_ENGINE_899A670_CHECKNUMBER_INDEX >>> 0; }
export function luaEngine899a670ReturnValue() { return LUA_ENGINE_899A670_RETURN_VALUE >>> 0; }
/** 0x89a670 law: FULL-WORD lua_type(L,1) gate (`jne`).
 * taken <=> typeResult !== 0. */
export function luaEngine899a670Type1GateTaken(typeResult) {
  return typeResult !== 0 ? 1 : 0;
}
export const LUA_ENGINE_899A700_VA = 0x89a700;
export const LUA_ENGINE_899A700_END_VA = 0x89a769;
export const LUA_ENGINE_899A700_NEXT_VA = 0x89a770;
export const LUA_ENGINE_899A700_STACK_ARGS = 0x1;
export const LUA_ENGINE_899A700_ECX_ARG = 0x0;
export const LUA_ENGINE_899A700_CALLEE_POPS_STACK_ARGS = 0x0;
export const LUA_ENGINE_899A700_ALIGNED_PROLOGUE = 0x0;
export const LUA_ENGINE_899A700_GATE_INVERTED_ENCODING = 0x0;
export const LUA_ENGINE_899A700_IAT_LUA_TYPE = 0xb18400;
export const LUA_ENGINE_899A700_CHECKGET_KEY = 0xc82a1e;
export const LUA_ENGINE_899A700_CHECKGET_INDEX = 0x1;
export const LUA_ENGINE_899A700_CHECKGET_DEF_ARG = 0x1;
export const LUA_ENGINE_899A700_CHECKGET_FIELD_OFF = 0x4;
export const LUA_ENGINE_899A700_CHECKGET_HELPER_VA = 0x85c590;
export const LUA_ENGINE_899A700_IAT_LUA_TOUSERDATA = 0xb183b0;
export const LUA_ENGINE_899A700_TOUSERDATA_INDEX_U32 = 0xfff0b9d7;
export const LUA_ENGINE_899A700_METHOD_VTABLE_FIELD_OFF = 0x0;
export const LUA_ENGINE_899A700_METHOD_STACK_ARGS = 0x0;
export const LUA_ENGINE_899A700_RETURN_VALUE = 0x1;
export const LUA_ENGINE_899A700_FLOAT_PUSHER_HELPER_VA = 0x85c050;
export const LUA_ENGINE_899A700_FLOAT_LANE = 0x1;
export function luaEngine899a700HostVa() { return LUA_ENGINE_899A700_VA >>> 0; }
export function luaEngine899a700EndVa() { return LUA_ENGINE_899A700_END_VA >>> 0; }
export function luaEngine899a700NextVa() { return LUA_ENGINE_899A700_NEXT_VA >>> 0; }
export function luaEngine899a700StackArgs() { return LUA_ENGINE_899A700_STACK_ARGS >>> 0; }
export function luaEngine899a700EcxArg() { return LUA_ENGINE_899A700_ECX_ARG >>> 0; }
export function luaEngine899a700CalleePopsStackArgs() { return LUA_ENGINE_899A700_CALLEE_POPS_STACK_ARGS >>> 0; }
export function luaEngine899a700AlignedPrologue() { return LUA_ENGINE_899A700_ALIGNED_PROLOGUE >>> 0; }
export function luaEngine899a700GateInvertedEncoding() { return LUA_ENGINE_899A700_GATE_INVERTED_ENCODING >>> 0; }
export function luaEngine899a700IatLuaType() { return LUA_ENGINE_899A700_IAT_LUA_TYPE >>> 0; }
export function luaEngine899a700CheckgetKey() { return LUA_ENGINE_899A700_CHECKGET_KEY >>> 0; }
export function luaEngine899a700CheckgetIndex() { return LUA_ENGINE_899A700_CHECKGET_INDEX >>> 0; }
export function luaEngine899a700CheckgetDefArg() { return LUA_ENGINE_899A700_CHECKGET_DEF_ARG >>> 0; }
export function luaEngine899a700CheckgetFieldOff() { return LUA_ENGINE_899A700_CHECKGET_FIELD_OFF >>> 0; }
export function luaEngine899a700CheckgetHelperVa() { return LUA_ENGINE_899A700_CHECKGET_HELPER_VA >>> 0; }
export function luaEngine899a700IatLuaTouserdata() { return LUA_ENGINE_899A700_IAT_LUA_TOUSERDATA >>> 0; }
export function luaEngine899a700TouserdataIndex() { return LUA_ENGINE_899A700_TOUSERDATA_INDEX_U32 >>> 0; }
export function luaEngine899a700MethodVtableFieldOff() { return LUA_ENGINE_899A700_METHOD_VTABLE_FIELD_OFF >>> 0; }
export function luaEngine899a700MethodStackArgs() { return LUA_ENGINE_899A700_METHOD_STACK_ARGS >>> 0; }
export function luaEngine899a700FloatLane() { return LUA_ENGINE_899A700_FLOAT_LANE >>> 0; }
export function luaEngine899a700FloatPusherHelperVa() { return LUA_ENGINE_899A700_FLOAT_PUSHER_HELPER_VA >>> 0; }
export function luaEngine899a700ReturnValue() { return LUA_ENGINE_899A700_RETURN_VALUE >>> 0; }
/** 0x89a700 law: FULL-WORD lua_type(L,1) gate (`jne`).
 * taken <=> typeResult !== 0. */
export function luaEngine899a700Type1GateTaken(typeResult) {
  return typeResult !== 0 ? 1 : 0;
}
export const LUA_ENGINE_899A770_VA = 0x89a770;
export const LUA_ENGINE_899A770_END_VA = 0x89a803;
export const LUA_ENGINE_899A770_NEXT_VA = 0x89a810;
export const LUA_ENGINE_899A770_STACK_ARGS = 0x1;
export const LUA_ENGINE_899A770_ECX_ARG = 0x0;
export const LUA_ENGINE_899A770_CALLEE_POPS_STACK_ARGS = 0x0;
export const LUA_ENGINE_899A770_ALIGNED_PROLOGUE = 0x0;
export const LUA_ENGINE_899A770_GATE_INVERTED_ENCODING = 0x0;
export const LUA_ENGINE_899A770_IAT_LUA_TYPE = 0xb18400;
export const LUA_ENGINE_899A770_CHECKGET_KEY = 0xc829e0;
export const LUA_ENGINE_899A770_CHECKGET_INDEX = 0x1;
export const LUA_ENGINE_899A770_CHECKGET_DEF_ARG = 0x0;
export const LUA_ENGINE_899A770_CHECKGET_FIELD_OFF = 0x4;
export const LUA_ENGINE_899A770_CHECKGET_HELPER_VA = 0x85c590;
export const LUA_ENGINE_899A770_IAT_LUA_TOUSERDATA = 0xb183b0;
export const LUA_ENGINE_899A770_TOUSERDATA_INDEX_U32 = 0xfff0b9d7;
export const LUA_ENGINE_899A770_METHOD_VTABLE_FIELD_OFF = 0x0;
export const LUA_ENGINE_899A770_METHOD_STACK_ARGS = 0x1;
export const LUA_ENGINE_899A770_RETURN_VALUE = 0x0;
export const LUA_ENGINE_899A770_SECOND_CHECKGET_KEY = 0xc8299b;
export const LUA_ENGINE_899A770_SECOND_CHECKGET_INDEX = 0x2;
export const LUA_ENGINE_899A770_SECOND_CHECKGET_DEF_ARG = 0x0;
export const LUA_ENGINE_899A770_SECOND_CHECKGET_FIELD_OFF = 0x4;
export const LUA_ENGINE_899A770_METHOD_STRUCT_ARG_BYTES = 0x10;
export function luaEngine899a770HostVa() { return LUA_ENGINE_899A770_VA >>> 0; }
export function luaEngine899a770EndVa() { return LUA_ENGINE_899A770_END_VA >>> 0; }
export function luaEngine899a770NextVa() { return LUA_ENGINE_899A770_NEXT_VA >>> 0; }
export function luaEngine899a770StackArgs() { return LUA_ENGINE_899A770_STACK_ARGS >>> 0; }
export function luaEngine899a770EcxArg() { return LUA_ENGINE_899A770_ECX_ARG >>> 0; }
export function luaEngine899a770CalleePopsStackArgs() { return LUA_ENGINE_899A770_CALLEE_POPS_STACK_ARGS >>> 0; }
export function luaEngine899a770AlignedPrologue() { return LUA_ENGINE_899A770_ALIGNED_PROLOGUE >>> 0; }
export function luaEngine899a770GateInvertedEncoding() { return LUA_ENGINE_899A770_GATE_INVERTED_ENCODING >>> 0; }
export function luaEngine899a770IatLuaType() { return LUA_ENGINE_899A770_IAT_LUA_TYPE >>> 0; }
export function luaEngine899a770CheckgetKey() { return LUA_ENGINE_899A770_CHECKGET_KEY >>> 0; }
export function luaEngine899a770CheckgetIndex() { return LUA_ENGINE_899A770_CHECKGET_INDEX >>> 0; }
export function luaEngine899a770CheckgetDefArg() { return LUA_ENGINE_899A770_CHECKGET_DEF_ARG >>> 0; }
export function luaEngine899a770CheckgetFieldOff() { return LUA_ENGINE_899A770_CHECKGET_FIELD_OFF >>> 0; }
export function luaEngine899a770CheckgetHelperVa() { return LUA_ENGINE_899A770_CHECKGET_HELPER_VA >>> 0; }
export function luaEngine899a770SecondCheckgetKey() { return LUA_ENGINE_899A770_SECOND_CHECKGET_KEY >>> 0; }
export function luaEngine899a770SecondCheckgetIndex() { return LUA_ENGINE_899A770_SECOND_CHECKGET_INDEX >>> 0; }
export function luaEngine899a770SecondCheckgetDefArg() { return LUA_ENGINE_899A770_SECOND_CHECKGET_DEF_ARG >>> 0; }
export function luaEngine899a770SecondCheckgetFieldOff() { return LUA_ENGINE_899A770_SECOND_CHECKGET_FIELD_OFF >>> 0; }
export function luaEngine899a770IatLuaTouserdata() { return LUA_ENGINE_899A770_IAT_LUA_TOUSERDATA >>> 0; }
export function luaEngine899a770TouserdataIndex() { return LUA_ENGINE_899A770_TOUSERDATA_INDEX_U32 >>> 0; }
export function luaEngine899a770MethodVtableFieldOff() { return LUA_ENGINE_899A770_METHOD_VTABLE_FIELD_OFF >>> 0; }
export function luaEngine899a770MethodStructArgBytes() { return LUA_ENGINE_899A770_METHOD_STRUCT_ARG_BYTES >>> 0; }
export function luaEngine899a770MethodStackArgs() { return LUA_ENGINE_899A770_METHOD_STACK_ARGS >>> 0; }
export function luaEngine899a770ReturnValue() { return LUA_ENGINE_899A770_RETURN_VALUE >>> 0; }
/** 0x89a770 law: FULL-WORD lua_type(L,1) gate (`jne`).
 * taken <=> typeResult !== 0. */
export function luaEngine899a770Type1GateTaken(typeResult) {
  return typeResult !== 0 ? 1 : 0;
}
export const LUA_ENGINE_899A810_VA = 0x89a810;
export const LUA_ENGINE_899A810_END_VA = 0x89a8aa;
export const LUA_ENGINE_899A810_NEXT_VA = 0x89a8b0;
export const LUA_ENGINE_899A810_STACK_ARGS = 0x1;
export const LUA_ENGINE_899A810_ECX_ARG = 0x0;
export const LUA_ENGINE_899A810_CALLEE_POPS_STACK_ARGS = 0x0;
export const LUA_ENGINE_899A810_ALIGNED_PROLOGUE = 0x0;
export const LUA_ENGINE_899A810_GATE_INVERTED_ENCODING = 0x0;
export const LUA_ENGINE_899A810_IAT_LUA_TYPE = 0xb18400;
export const LUA_ENGINE_899A810_CHECKGET_KEY = 0xc829e0;
export const LUA_ENGINE_899A810_CHECKGET_INDEX = 0x1;
export const LUA_ENGINE_899A810_CHECKGET_DEF_ARG = 0x1;
export const LUA_ENGINE_899A810_CHECKGET_FIELD_OFF = 0x4;
export const LUA_ENGINE_899A810_CHECKGET_HELPER_VA = 0x85c590;
export const LUA_ENGINE_899A810_IAT_LUA_TOUSERDATA = 0xb183b0;
export const LUA_ENGINE_899A810_TOUSERDATA_INDEX_U32 = 0xfff0b9d7;
export const LUA_ENGINE_899A810_METHOD_VTABLE_FIELD_OFF = 0x0;
export const LUA_ENGINE_899A810_METHOD_STACK_ARGS = 0x1;
export const LUA_ENGINE_899A810_RETURN_VALUE = 0x1;
export const LUA_ENGINE_899A810_NEWUSERDATA_SIZE = 0x18;
export const LUA_ENGINE_899A810_UD_VTABLE_VA = 0xb7364c;
export const LUA_ENGINE_899A810_UD_PAYLOAD_PTR_OFF = 0x4;
export const LUA_ENGINE_899A810_UD_PAYLOAD_OFF = 0x8;
export const LUA_ENGINE_899A810_UD_PAYLOAD_BYTES = 0x10;
export const LUA_ENGINE_899A810_REGISTRY_INDEX_U32 = 0xfff0b9d8;
export const LUA_ENGINE_899A810_METATABLE_RAWGETP_KEY = 0xc8299b;
export function luaEngine899a810HostVa() { return LUA_ENGINE_899A810_VA >>> 0; }
export function luaEngine899a810EndVa() { return LUA_ENGINE_899A810_END_VA >>> 0; }
export function luaEngine899a810NextVa() { return LUA_ENGINE_899A810_NEXT_VA >>> 0; }
export function luaEngine899a810StackArgs() { return LUA_ENGINE_899A810_STACK_ARGS >>> 0; }
export function luaEngine899a810EcxArg() { return LUA_ENGINE_899A810_ECX_ARG >>> 0; }
export function luaEngine899a810CalleePopsStackArgs() { return LUA_ENGINE_899A810_CALLEE_POPS_STACK_ARGS >>> 0; }
export function luaEngine899a810AlignedPrologue() { return LUA_ENGINE_899A810_ALIGNED_PROLOGUE >>> 0; }
export function luaEngine899a810GateInvertedEncoding() { return LUA_ENGINE_899A810_GATE_INVERTED_ENCODING >>> 0; }
export function luaEngine899a810IatLuaType() { return LUA_ENGINE_899A810_IAT_LUA_TYPE >>> 0; }
export function luaEngine899a810CheckgetKey() { return LUA_ENGINE_899A810_CHECKGET_KEY >>> 0; }
export function luaEngine899a810CheckgetIndex() { return LUA_ENGINE_899A810_CHECKGET_INDEX >>> 0; }
export function luaEngine899a810CheckgetDefArg() { return LUA_ENGINE_899A810_CHECKGET_DEF_ARG >>> 0; }
export function luaEngine899a810CheckgetFieldOff() { return LUA_ENGINE_899A810_CHECKGET_FIELD_OFF >>> 0; }
export function luaEngine899a810CheckgetHelperVa() { return LUA_ENGINE_899A810_CHECKGET_HELPER_VA >>> 0; }
export function luaEngine899a810IatLuaTouserdata() { return LUA_ENGINE_899A810_IAT_LUA_TOUSERDATA >>> 0; }
export function luaEngine899a810TouserdataIndex() { return LUA_ENGINE_899A810_TOUSERDATA_INDEX_U32 >>> 0; }
export function luaEngine899a810MethodVtableFieldOff() { return LUA_ENGINE_899A810_METHOD_VTABLE_FIELD_OFF >>> 0; }
export function luaEngine899a810MethodStackArgs() { return LUA_ENGINE_899A810_METHOD_STACK_ARGS >>> 0; }
export function luaEngine899a810NewuserdataSize() { return LUA_ENGINE_899A810_NEWUSERDATA_SIZE >>> 0; }
export function luaEngine899a810UdVtableVa() { return LUA_ENGINE_899A810_UD_VTABLE_VA >>> 0; }
export function luaEngine899a810UdPayloadPtrOff() { return LUA_ENGINE_899A810_UD_PAYLOAD_PTR_OFF >>> 0; }
export function luaEngine899a810UdPayloadOff() { return LUA_ENGINE_899A810_UD_PAYLOAD_OFF >>> 0; }
export function luaEngine899a810UdPayloadBytes() { return LUA_ENGINE_899A810_UD_PAYLOAD_BYTES >>> 0; }
export function luaEngine899a810RegistryIndex() { return LUA_ENGINE_899A810_REGISTRY_INDEX_U32 >>> 0; }
export function luaEngine899a810MetatableRawgetpKey() { return LUA_ENGINE_899A810_METATABLE_RAWGETP_KEY >>> 0; }
export function luaEngine899a810ReturnValue() { return LUA_ENGINE_899A810_RETURN_VALUE >>> 0; }
/** 0x89a810 law: FULL-WORD lua_type(L,1) gate (`jne`).
 * taken <=> typeResult !== 0. */
export function luaEngine899a810Type1GateTaken(typeResult) {
  return typeResult !== 0 ? 1 : 0;
}
export const LUA_ENGINE_899A8B0_VA = 0x89a8b0;
export const LUA_ENGINE_899A8B0_END_VA = 0x89aa4e;
export const LUA_ENGINE_899A8B0_NEXT_VA = 0x89aa50;
export const LUA_ENGINE_899A8B0_STACK_ARGS = 0x1;
export const LUA_ENGINE_899A8B0_ECX_ARG = 0x0;
export const LUA_ENGINE_899A8B0_CALLEE_POPS_STACK_ARGS = 0x0;
export const LUA_ENGINE_899A8B0_ALIGNED_PROLOGUE = 0x0;
export const LUA_ENGINE_899A8B0_GATE_INVERTED_ENCODING = 0x1;
export const LUA_ENGINE_899A8B0_IAT_LUA_TYPE = 0xb18400;
export const LUA_ENGINE_899A8B0_CHECKGET_KEY = 0xc8297a;
export const LUA_ENGINE_899A8B0_CHECKGET_INDEX = 0x4;
export const LUA_ENGINE_899A8B0_CHECKGET_DEF_ARG = 0x1;
export const LUA_ENGINE_899A8B0_CHECKGET_FIELD_OFF = 0x4;
export const LUA_ENGINE_899A8B0_CHECKGET_HELPER_VA = 0x85c590;
export const LUA_ENGINE_899A8B0_IAT_LUA_TOUSERDATA = 0xb183b0;
export const LUA_ENGINE_899A8B0_TOUSERDATA_INDEX_U32 = 0xfff0b9d7;
export const LUA_ENGINE_899A8B0_METHOD_VTABLE_FIELD_OFF = 0x0;
export const LUA_ENGINE_899A8B0_METHOD_STACK_ARGS = 0x6;
export const LUA_ENGINE_899A8B0_RETURN_VALUE = 0x1;
export const LUA_ENGINE_899A8B0_FRAME_REALIGNMENT = 0x1;
export const LUA_ENGINE_899A8B0_PRE_GATE_TOUSERDATA = 0x1;
export const LUA_ENGINE_899A8B0_CHECKNUMBER_INDEX = 0x5;
export const LUA_ENGINE_899A8B0_VECTOR_HELPER_VA = 0x8baa50;
export const LUA_ENGINE_899A8B0_VECTOR_CALL_COUNT = 0x3;
export const LUA_ENGINE_899A8B0_NEWUSERDATA_SIZE = 0x10;
export const LUA_ENGINE_899A8B0_UD_VTABLE_VA = 0xb73574;
export const LUA_ENGINE_899A8B0_UD_PAYLOAD_PTR_OFF = 0x4;
export const LUA_ENGINE_899A8B0_UD_PAYLOAD_OFF = 0x8;
export const LUA_ENGINE_899A8B0_UD_PAYLOAD_BYTES = 0x8;
export const LUA_ENGINE_899A8B0_REGISTRY_INDEX_U32 = 0xfff0b9d8;
export const LUA_ENGINE_899A8B0_METATABLE_RAWGETP_KEY = 0xc82980;
export function luaEngine899a8b0HostVa() { return LUA_ENGINE_899A8B0_VA >>> 0; }
export function luaEngine899a8b0EndVa() { return LUA_ENGINE_899A8B0_END_VA >>> 0; }
export function luaEngine899a8b0NextVa() { return LUA_ENGINE_899A8B0_NEXT_VA >>> 0; }
export function luaEngine899a8b0StackArgs() { return LUA_ENGINE_899A8B0_STACK_ARGS >>> 0; }
export function luaEngine899a8b0EcxArg() { return LUA_ENGINE_899A8B0_ECX_ARG >>> 0; }
export function luaEngine899a8b0CalleePopsStackArgs() { return LUA_ENGINE_899A8B0_CALLEE_POPS_STACK_ARGS >>> 0; }
export function luaEngine899a8b0FrameRealignment() { return LUA_ENGINE_899A8B0_FRAME_REALIGNMENT >>> 0; }
export function luaEngine899a8b0AlignedPrologue() { return LUA_ENGINE_899A8B0_ALIGNED_PROLOGUE >>> 0; }
export function luaEngine899a8b0GateInvertedEncoding() { return LUA_ENGINE_899A8B0_GATE_INVERTED_ENCODING >>> 0; }
export function luaEngine899a8b0PreGateTouserdata() { return LUA_ENGINE_899A8B0_PRE_GATE_TOUSERDATA >>> 0; }
export function luaEngine899a8b0IatLuaType() { return LUA_ENGINE_899A8B0_IAT_LUA_TYPE >>> 0; }
export function luaEngine899a8b0CheckgetKey() { return LUA_ENGINE_899A8B0_CHECKGET_KEY >>> 0; }
export function luaEngine899a8b0CheckgetIndex() { return LUA_ENGINE_899A8B0_CHECKGET_INDEX >>> 0; }
export function luaEngine899a8b0CheckgetDefArg() { return LUA_ENGINE_899A8B0_CHECKGET_DEF_ARG >>> 0; }
export function luaEngine899a8b0CheckgetFieldOff() { return LUA_ENGINE_899A8B0_CHECKGET_FIELD_OFF >>> 0; }
export function luaEngine899a8b0CheckgetHelperVa() { return LUA_ENGINE_899A8B0_CHECKGET_HELPER_VA >>> 0; }
export function luaEngine899a8b0ChecknumberIndex() { return LUA_ENGINE_899A8B0_CHECKNUMBER_INDEX >>> 0; }
export function luaEngine899a8b0VectorHelperVa() { return LUA_ENGINE_899A8B0_VECTOR_HELPER_VA >>> 0; }
export function luaEngine899a8b0VectorCallCount() { return LUA_ENGINE_899A8B0_VECTOR_CALL_COUNT >>> 0; }
export function luaEngine899a8b0IatLuaTouserdata() { return LUA_ENGINE_899A8B0_IAT_LUA_TOUSERDATA >>> 0; }
export function luaEngine899a8b0TouserdataIndex() { return LUA_ENGINE_899A8B0_TOUSERDATA_INDEX_U32 >>> 0; }
export function luaEngine899a8b0MethodVtableFieldOff() { return LUA_ENGINE_899A8B0_METHOD_VTABLE_FIELD_OFF >>> 0; }
export function luaEngine899a8b0MethodStackArgs() { return LUA_ENGINE_899A8B0_METHOD_STACK_ARGS >>> 0; }
export function luaEngine899a8b0NewuserdataSize() { return LUA_ENGINE_899A8B0_NEWUSERDATA_SIZE >>> 0; }
export function luaEngine899a8b0UdVtableVa() { return LUA_ENGINE_899A8B0_UD_VTABLE_VA >>> 0; }
export function luaEngine899a8b0UdPayloadPtrOff() { return LUA_ENGINE_899A8B0_UD_PAYLOAD_PTR_OFF >>> 0; }
export function luaEngine899a8b0UdPayloadOff() { return LUA_ENGINE_899A8B0_UD_PAYLOAD_OFF >>> 0; }
export function luaEngine899a8b0UdPayloadBytes() { return LUA_ENGINE_899A8B0_UD_PAYLOAD_BYTES >>> 0; }
export function luaEngine899a8b0RegistryIndex() { return LUA_ENGINE_899A8B0_REGISTRY_INDEX_U32 >>> 0; }
export function luaEngine899a8b0MetatableRawgetpKey() { return LUA_ENGINE_899A8B0_METATABLE_RAWGETP_KEY >>> 0; }
export function luaEngine899a8b0ReturnValue() { return LUA_ENGINE_899A8B0_RETURN_VALUE >>> 0; }
/** 0x89a8b0 law: FULL-WORD lua_type(L,1) gate
 * (je encoding). taken <=> typeResult !== 0. */
export function luaEngine899a8b0Type1GateTaken(typeResult) {
  return typeResult !== 0 ? 1 : 0;
}
export const LUA_ENGINE_899AA50_VA = 0x89aa50;
export const LUA_ENGINE_899AA50_END_VA = 0x89aad2;
export const LUA_ENGINE_899AA50_NEXT_VA = 0x89aae0;
export const LUA_ENGINE_899AA50_STACK_ARGS = 0x1;
export const LUA_ENGINE_899AA50_ECX_ARG = 0x0;
export const LUA_ENGINE_899AA50_CALLEE_POPS_STACK_ARGS = 0x0;
export const LUA_ENGINE_899AA50_ALIGNED_PROLOGUE = 0x1;
export const LUA_ENGINE_899AA50_GATE_INVERTED_ENCODING = 0x0;
export const LUA_ENGINE_899AA50_IAT_LUA_TYPE = 0xb18400;
export const LUA_ENGINE_899AA50_CHECKGET_KEY = 0xc829dd;
export const LUA_ENGINE_899AA50_CHECKGET_INDEX = 0x1;
export const LUA_ENGINE_899AA50_CHECKGET_DEF_ARG = 0x0;
export const LUA_ENGINE_899AA50_CHECKGET_FIELD_OFF = 0x4;
export const LUA_ENGINE_899AA50_CHECKGET_HELPER_VA = 0x85c590;
export const LUA_ENGINE_899AA50_IAT_LUA_TOUSERDATA = 0xb183b0;
export const LUA_ENGINE_899AA50_TOUSERDATA_INDEX_U32 = 0xfff0b9d7;
export const LUA_ENGINE_899AA50_METHOD_VTABLE_FIELD_OFF = 0x0;
export const LUA_ENGINE_899AA50_METHOD_STACK_ARGS = 0x1;
export const LUA_ENGINE_899AA50_RETURN_VALUE = 0x0;
export const LUA_ENGINE_899AA50_CHECKNUMBER_INDEX = 0x2;
export function luaEngine899aa50HostVa() { return LUA_ENGINE_899AA50_VA >>> 0; }
export function luaEngine899aa50EndVa() { return LUA_ENGINE_899AA50_END_VA >>> 0; }
export function luaEngine899aa50NextVa() { return LUA_ENGINE_899AA50_NEXT_VA >>> 0; }
export function luaEngine899aa50StackArgs() { return LUA_ENGINE_899AA50_STACK_ARGS >>> 0; }
export function luaEngine899aa50EcxArg() { return LUA_ENGINE_899AA50_ECX_ARG >>> 0; }
export function luaEngine899aa50CalleePopsStackArgs() { return LUA_ENGINE_899AA50_CALLEE_POPS_STACK_ARGS >>> 0; }
export function luaEngine899aa50AlignedPrologue() { return LUA_ENGINE_899AA50_ALIGNED_PROLOGUE >>> 0; }
export function luaEngine899aa50GateInvertedEncoding() { return LUA_ENGINE_899AA50_GATE_INVERTED_ENCODING >>> 0; }
export function luaEngine899aa50IatLuaType() { return LUA_ENGINE_899AA50_IAT_LUA_TYPE >>> 0; }
export function luaEngine899aa50CheckgetKey() { return LUA_ENGINE_899AA50_CHECKGET_KEY >>> 0; }
export function luaEngine899aa50CheckgetIndex() { return LUA_ENGINE_899AA50_CHECKGET_INDEX >>> 0; }
export function luaEngine899aa50CheckgetDefArg() { return LUA_ENGINE_899AA50_CHECKGET_DEF_ARG >>> 0; }
export function luaEngine899aa50CheckgetFieldOff() { return LUA_ENGINE_899AA50_CHECKGET_FIELD_OFF >>> 0; }
export function luaEngine899aa50CheckgetHelperVa() { return LUA_ENGINE_899AA50_CHECKGET_HELPER_VA >>> 0; }
export function luaEngine899aa50ChecknumberIndex() { return LUA_ENGINE_899AA50_CHECKNUMBER_INDEX >>> 0; }
export function luaEngine899aa50IatLuaTouserdata() { return LUA_ENGINE_899AA50_IAT_LUA_TOUSERDATA >>> 0; }
export function luaEngine899aa50TouserdataIndex() { return LUA_ENGINE_899AA50_TOUSERDATA_INDEX_U32 >>> 0; }
export function luaEngine899aa50MethodVtableFieldOff() { return LUA_ENGINE_899AA50_METHOD_VTABLE_FIELD_OFF >>> 0; }
export function luaEngine899aa50MethodStackArgs() { return LUA_ENGINE_899AA50_METHOD_STACK_ARGS >>> 0; }
export function luaEngine899aa50ReturnValue() { return LUA_ENGINE_899AA50_RETURN_VALUE >>> 0; }
/** 0x89aa50 law: FULL-WORD lua_type(L,1) gate
 * (jne encoding). taken <=> typeResult !== 0. */
export function luaEngine899aa50Type1GateTaken(typeResult) {
  return typeResult !== 0 ? 1 : 0;
}
export const LUA_ENGINE_899AAE0_VA = 0x89aae0;
export const LUA_ENGINE_899AAE0_END_VA = 0x89ab49;
export const LUA_ENGINE_899AAE0_NEXT_VA = 0x89ab50;
export const LUA_ENGINE_899AAE0_STACK_ARGS = 0x1;
export const LUA_ENGINE_899AAE0_ECX_ARG = 0x0;
export const LUA_ENGINE_899AAE0_CALLEE_POPS_STACK_ARGS = 0x0;
export const LUA_ENGINE_899AAE0_GATE_INVERTED_ENCODING = 0x0;
export const LUA_ENGINE_899AAE0_IAT_LUA_TYPE = 0xb18400;
export const LUA_ENGINE_899AAE0_CHECKGET_KEY = 0xc829dd;
export const LUA_ENGINE_899AAE0_CHECKGET_INDEX = 0x1;
export const LUA_ENGINE_899AAE0_CHECKGET_DEF_ARG = 0x1;
export const LUA_ENGINE_899AAE0_CHECKGET_FIELD_OFF = 0x4;
export const LUA_ENGINE_899AAE0_CHECKGET_HELPER_VA = 0x85c590;
export const LUA_ENGINE_899AAE0_IAT_LUA_TOUSERDATA = 0xb183b0;
export const LUA_ENGINE_899AAE0_TOUSERDATA_INDEX_U32 = 0xfff0b9d7;
export const LUA_ENGINE_899AAE0_METHOD_VTABLE_FIELD_OFF = 0x0;
export const LUA_ENGINE_899AAE0_METHOD_STACK_ARGS = 0x0;
export const LUA_ENGINE_899AAE0_RETURN_VALUE = 0x1;
export const LUA_ENGINE_899AAE0_PUSHER_HELPER_VA = 0x85c050;
export function luaEngine899aae0HostVa() { return LUA_ENGINE_899AAE0_VA >>> 0; }
export function luaEngine899aae0EndVa() { return LUA_ENGINE_899AAE0_END_VA >>> 0; }
export function luaEngine899aae0NextVa() { return LUA_ENGINE_899AAE0_NEXT_VA >>> 0; }
export function luaEngine899aae0StackArgs() { return LUA_ENGINE_899AAE0_STACK_ARGS >>> 0; }
export function luaEngine899aae0EcxArg() { return LUA_ENGINE_899AAE0_ECX_ARG >>> 0; }
export function luaEngine899aae0CalleePopsStackArgs() { return LUA_ENGINE_899AAE0_CALLEE_POPS_STACK_ARGS >>> 0; }
export function luaEngine899aae0GateInvertedEncoding() { return LUA_ENGINE_899AAE0_GATE_INVERTED_ENCODING >>> 0; }
export function luaEngine899aae0IatLuaType() { return LUA_ENGINE_899AAE0_IAT_LUA_TYPE >>> 0; }
export function luaEngine899aae0CheckgetKey() { return LUA_ENGINE_899AAE0_CHECKGET_KEY >>> 0; }
export function luaEngine899aae0CheckgetIndex() { return LUA_ENGINE_899AAE0_CHECKGET_INDEX >>> 0; }
export function luaEngine899aae0CheckgetDefArg() { return LUA_ENGINE_899AAE0_CHECKGET_DEF_ARG >>> 0; }
export function luaEngine899aae0CheckgetFieldOff() { return LUA_ENGINE_899AAE0_CHECKGET_FIELD_OFF >>> 0; }
export function luaEngine899aae0CheckgetHelperVa() { return LUA_ENGINE_899AAE0_CHECKGET_HELPER_VA >>> 0; }
export function luaEngine899aae0IatLuaTouserdata() { return LUA_ENGINE_899AAE0_IAT_LUA_TOUSERDATA >>> 0; }
export function luaEngine899aae0TouserdataIndex() { return LUA_ENGINE_899AAE0_TOUSERDATA_INDEX_U32 >>> 0; }
export function luaEngine899aae0MethodVtableFieldOff() { return LUA_ENGINE_899AAE0_METHOD_VTABLE_FIELD_OFF >>> 0; }
export function luaEngine899aae0MethodStackArgs() { return LUA_ENGINE_899AAE0_METHOD_STACK_ARGS >>> 0; }
export function luaEngine899aae0PusherHelperVa() { return LUA_ENGINE_899AAE0_PUSHER_HELPER_VA >>> 0; }
export function luaEngine899aae0ReturnValue() { return LUA_ENGINE_899AAE0_RETURN_VALUE >>> 0; }
/** 0x89aae0 law: FULL-WORD lua_type(L,1) gate (`jne`).
 * taken <=> typeResult !== 0. */
export function luaEngine899aae0Type1GateTaken(typeResult) {
  return typeResult !== 0 ? 1 : 0;
}
export const LUA_ENGINE_899AB50_VA = 0x89ab50;
export const LUA_ENGINE_899AB50_END_VA = 0x89abe3;
export const LUA_ENGINE_899AB50_NEXT_VA = 0x89abf0;
export const LUA_ENGINE_899AB50_STACK_ARGS = 0x1;
export const LUA_ENGINE_899AB50_ECX_ARG = 0x0;
export const LUA_ENGINE_899AB50_CALLEE_POPS_STACK_ARGS = 0x0;
export const LUA_ENGINE_899AB50_GATE_INVERTED_ENCODING = 0x0;
export const LUA_ENGINE_899AB50_IAT_LUA_TYPE = 0xb18400;
export const LUA_ENGINE_899AB50_CHECKGET_KEY = 0xc829dd;
export const LUA_ENGINE_899AB50_CHECKGET_INDEX = 0x1;
export const LUA_ENGINE_899AB50_CHECKGET_DEF_ARG = 0x0;
export const LUA_ENGINE_899AB50_CHECKGET_FIELD_OFF = 0x4;
export const LUA_ENGINE_899AB50_CHECKGET_HELPER_VA = 0x85c590;
export const LUA_ENGINE_899AB50_IAT_LUA_TOUSERDATA = 0xb183b0;
export const LUA_ENGINE_899AB50_TOUSERDATA_INDEX_U32 = 0xfff0b9d7;
export const LUA_ENGINE_899AB50_METHOD_VTABLE_FIELD_OFF = 0x0;
export const LUA_ENGINE_899AB50_METHOD_STACK_ARGS = 0x1;
export const LUA_ENGINE_899AB50_RETURN_VALUE = 0x0;
export const LUA_ENGINE_899AB50_SECOND_CHECKGET_KEY = 0xc8299b;
export const LUA_ENGINE_899AB50_SECOND_CHECKGET_INDEX = 0x2;
export const LUA_ENGINE_899AB50_SECOND_CHECKGET_DEF_ARG = 0x0;
export const LUA_ENGINE_899AB50_SECOND_CHECKGET_FIELD_OFF = 0x4;
export const LUA_ENGINE_899AB50_METHOD_STRUCT_ARG_BYTES = 0x10;
export function luaEngine899ab50HostVa() { return LUA_ENGINE_899AB50_VA >>> 0; }
export function luaEngine899ab50EndVa() { return LUA_ENGINE_899AB50_END_VA >>> 0; }
export function luaEngine899ab50NextVa() { return LUA_ENGINE_899AB50_NEXT_VA >>> 0; }
export function luaEngine899ab50StackArgs() { return LUA_ENGINE_899AB50_STACK_ARGS >>> 0; }
export function luaEngine899ab50EcxArg() { return LUA_ENGINE_899AB50_ECX_ARG >>> 0; }
export function luaEngine899ab50CalleePopsStackArgs() { return LUA_ENGINE_899AB50_CALLEE_POPS_STACK_ARGS >>> 0; }
export function luaEngine899ab50GateInvertedEncoding() { return LUA_ENGINE_899AB50_GATE_INVERTED_ENCODING >>> 0; }
export function luaEngine899ab50IatLuaType() { return LUA_ENGINE_899AB50_IAT_LUA_TYPE >>> 0; }
export function luaEngine899ab50CheckgetKey() { return LUA_ENGINE_899AB50_CHECKGET_KEY >>> 0; }
export function luaEngine899ab50CheckgetIndex() { return LUA_ENGINE_899AB50_CHECKGET_INDEX >>> 0; }
export function luaEngine899ab50CheckgetDefArg() { return LUA_ENGINE_899AB50_CHECKGET_DEF_ARG >>> 0; }
export function luaEngine899ab50CheckgetFieldOff() { return LUA_ENGINE_899AB50_CHECKGET_FIELD_OFF >>> 0; }
export function luaEngine899ab50CheckgetHelperVa() { return LUA_ENGINE_899AB50_CHECKGET_HELPER_VA >>> 0; }
export function luaEngine899ab50SecondCheckgetKey() { return LUA_ENGINE_899AB50_SECOND_CHECKGET_KEY >>> 0; }
export function luaEngine899ab50SecondCheckgetIndex() { return LUA_ENGINE_899AB50_SECOND_CHECKGET_INDEX >>> 0; }
export function luaEngine899ab50SecondCheckgetDefArg() { return LUA_ENGINE_899AB50_SECOND_CHECKGET_DEF_ARG >>> 0; }
export function luaEngine899ab50SecondCheckgetFieldOff() { return LUA_ENGINE_899AB50_SECOND_CHECKGET_FIELD_OFF >>> 0; }
export function luaEngine899ab50IatLuaTouserdata() { return LUA_ENGINE_899AB50_IAT_LUA_TOUSERDATA >>> 0; }
export function luaEngine899ab50TouserdataIndex() { return LUA_ENGINE_899AB50_TOUSERDATA_INDEX_U32 >>> 0; }
export function luaEngine899ab50MethodVtableFieldOff() { return LUA_ENGINE_899AB50_METHOD_VTABLE_FIELD_OFF >>> 0; }
export function luaEngine899ab50MethodStructArgBytes() { return LUA_ENGINE_899AB50_METHOD_STRUCT_ARG_BYTES >>> 0; }
export function luaEngine899ab50MethodStackArgs() { return LUA_ENGINE_899AB50_METHOD_STACK_ARGS >>> 0; }
export function luaEngine899ab50ReturnValue() { return LUA_ENGINE_899AB50_RETURN_VALUE >>> 0; }
/** 0x89ab50 law: FULL-WORD lua_type(L,1) gate (`jne`).
 * taken <=> typeResult !== 0. */
export function luaEngine899ab50Type1GateTaken(typeResult) {
  return typeResult !== 0 ? 1 : 0;
}
/** 0x89abf0 law: FULL-WORD lua_type(L,1) gate (`jne`).
 * taken <=> typeResult !== 0. */
export function luaEngine899abf0Type1GateTaken(typeResult) {
  return typeResult !== 0 ? 1 : 0;
}
export const LUA_ENGINE_899ABF0_VA = 0x89abf0;
export const LUA_ENGINE_899ABF0_END_VA = 0x89ac8a;
export const LUA_ENGINE_899ABF0_NEXT_VA = 0x89ac90;
export const LUA_ENGINE_899ABF0_STACK_ARGS = 0x1;
export const LUA_ENGINE_899ABF0_ECX_ARG = 0x0;
export const LUA_ENGINE_899ABF0_CALLEE_POPS_STACK_ARGS = 0x0;
export const LUA_ENGINE_899ABF0_IAT_LUA_TOUSERDATA = 0xb183b0;
export const LUA_ENGINE_899ABF0_TOUSERDATA_INDEX_U32 = 0xfff0b9d7;
export const LUA_ENGINE_899ABF0_METHOD_VTABLE_FIELD_OFF = 0x0;
export const LUA_ENGINE_899ABF0_GATE_INVERTED_ENCODING = 0x0;
export const LUA_ENGINE_899ABF0_IAT_LUA_TYPE = 0xb18400;
export const LUA_ENGINE_899ABF0_CHECKGET_KEY = 0xc829dd;
export const LUA_ENGINE_899ABF0_CHECKGET_INDEX = 0x1;
export const LUA_ENGINE_899ABF0_CHECKGET_DEF_ARG = 0x1;
export const LUA_ENGINE_899ABF0_CHECKGET_FIELD_OFF = 0x4;
export const LUA_ENGINE_899ABF0_CHECKGET_HELPER_VA = 0x85c590;
export const LUA_ENGINE_899ABF0_METHOD_STACK_ARGS = 0x1;
export const LUA_ENGINE_899ABF0_RETURN_VALUE = 0x1;
export const LUA_ENGINE_899ABF0_NEWUSERDATA_SIZE = 0x18;
export const LUA_ENGINE_899ABF0_UD_VTABLE_VA = 0xb7364c;
export const LUA_ENGINE_899ABF0_UD_PTR_FIELD_OFF = 0x4;
export const LUA_ENGINE_899ABF0_UD_PAYLOAD_BYTES = 0x10;
export const LUA_ENGINE_899ABF0_REGISTRY_INDEX_U32 = 0xfff0b9d8;
export const LUA_ENGINE_899ABF0_METATABLE_RAWGETP_KEY = 0xc8299b;
export function luaEngine899abf0HostVa() { return LUA_ENGINE_899ABF0_VA >>> 0; }
export function luaEngine899abf0EndVa() { return LUA_ENGINE_899ABF0_END_VA >>> 0; }
export function luaEngine899abf0NextVa() { return LUA_ENGINE_899ABF0_NEXT_VA >>> 0; }
export function luaEngine899abf0StackArgs() { return LUA_ENGINE_899ABF0_STACK_ARGS >>> 0; }
export function luaEngine899abf0EcxArg() { return LUA_ENGINE_899ABF0_ECX_ARG >>> 0; }
export function luaEngine899abf0CalleePopsStackArgs() { return LUA_ENGINE_899ABF0_CALLEE_POPS_STACK_ARGS >>> 0; }
export function luaEngine899abf0GateInvertedEncoding() { return LUA_ENGINE_899ABF0_GATE_INVERTED_ENCODING >>> 0; }
export function luaEngine899abf0IatLuaType() { return LUA_ENGINE_899ABF0_IAT_LUA_TYPE >>> 0; }
export function luaEngine899abf0CheckgetKey() { return LUA_ENGINE_899ABF0_CHECKGET_KEY >>> 0; }
export function luaEngine899abf0CheckgetIndex() { return LUA_ENGINE_899ABF0_CHECKGET_INDEX >>> 0; }
export function luaEngine899abf0CheckgetDefArg() { return LUA_ENGINE_899ABF0_CHECKGET_DEF_ARG >>> 0; }
export function luaEngine899abf0CheckgetFieldOff() { return LUA_ENGINE_899ABF0_CHECKGET_FIELD_OFF >>> 0; }
export function luaEngine899abf0CheckgetHelperVa() { return LUA_ENGINE_899ABF0_CHECKGET_HELPER_VA >>> 0; }
export function luaEngine899abf0IatLuaTouserdata() { return LUA_ENGINE_899ABF0_IAT_LUA_TOUSERDATA >>> 0; }
export function luaEngine899abf0TouserdataIndex() { return LUA_ENGINE_899ABF0_TOUSERDATA_INDEX_U32 >>> 0; }
export function luaEngine899abf0MethodVtableFieldOff() { return LUA_ENGINE_899ABF0_METHOD_VTABLE_FIELD_OFF >>> 0; }
export function luaEngine899abf0MethodStackArgs() { return LUA_ENGINE_899ABF0_METHOD_STACK_ARGS >>> 0; }
export function luaEngine899abf0NewuserdataSize() { return LUA_ENGINE_899ABF0_NEWUSERDATA_SIZE >>> 0; }
export function luaEngine899abf0UdVtableVa() { return LUA_ENGINE_899ABF0_UD_VTABLE_VA >>> 0; }
export function luaEngine899abf0UdPtrFieldOff() { return LUA_ENGINE_899ABF0_UD_PTR_FIELD_OFF >>> 0; }
export function luaEngine899abf0UdPayloadBytes() { return LUA_ENGINE_899ABF0_UD_PAYLOAD_BYTES >>> 0; }
export function luaEngine899abf0RegistryIndex() { return LUA_ENGINE_899ABF0_REGISTRY_INDEX_U32 >>> 0; }
export function luaEngine899abf0MetatableRawgetpKey() { return LUA_ENGINE_899ABF0_METATABLE_RAWGETP_KEY >>> 0; }
export function luaEngine899abf0ReturnValue() { return LUA_ENGINE_899ABF0_RETURN_VALUE >>> 0; }
export const LUA_ENGINE_899AC90_VA = 0x89ac90;
export const LUA_ENGINE_899AC90_END_VA = 0x89ad6d;
export const LUA_ENGINE_899AC90_NEXT_VA = 0x89ad70;
export const LUA_ENGINE_899AC90_STACK_ARGS = 0x1;
export const LUA_ENGINE_899AC90_ECX_ARG = 0x0;
export const LUA_ENGINE_899AC90_CALLEE_POPS_STACK_ARGS = 0x0;
export const LUA_ENGINE_899AC90_IAT_LUA_TOUSERDATA = 0xb183b0;
export const LUA_ENGINE_899AC90_TOUSERDATA_INDEX_U32 = 0xfff0b9d7;
export const LUA_ENGINE_899AC90_METHOD_VTABLE_FIELD_OFF = 0x0;
export const LUA_ENGINE_899AC90_METHOD_STACK_ARGS = 0x7;
export const LUA_ENGINE_899AC90_RETURN_VALUE = 0x1;
export const LUA_ENGINE_899AC90_FRAME_REALIGNMENT = 0x1;
export const LUA_ENGINE_899AC90_PRE_GATE_TOUSERDATA = 0x1;
export const LUA_ENGINE_899AC90_STRUCT_HELPER_VA = 0x8b1c80;
export const LUA_ENGINE_899AC90_NULL_RESULT_IAT_LUA_PUSHNIL = 0xb183e0;
export const LUA_ENGINE_899AC90_NEWUSERDATA_SIZE = 0x8;
export const LUA_ENGINE_899AC90_UD_VTABLE_VA = 0xb753c8;
export const LUA_ENGINE_899AC90_UD_PTR_FIELD_OFF = 0x4;
export const LUA_ENGINE_899AC90_UD_PAYLOAD_BYTES = 0x8;
export const LUA_ENGINE_899AC90_REGISTRY_INDEX_U32 = 0xfff0b9d8;
export const LUA_ENGINE_899AC90_METATABLE_RAWGETP_KEY = 0xc829dd;
export function luaEngine899ac90HostVa() { return LUA_ENGINE_899AC90_VA >>> 0; }
export function luaEngine899ac90EndVa() { return LUA_ENGINE_899AC90_END_VA >>> 0; }
export function luaEngine899ac90NextVa() { return LUA_ENGINE_899AC90_NEXT_VA >>> 0; }
export function luaEngine899ac90StackArgs() { return LUA_ENGINE_899AC90_STACK_ARGS >>> 0; }
export function luaEngine899ac90EcxArg() { return LUA_ENGINE_899AC90_ECX_ARG >>> 0; }
export function luaEngine899ac90CalleePopsStackArgs() { return LUA_ENGINE_899AC90_CALLEE_POPS_STACK_ARGS >>> 0; }
export function luaEngine899ac90FrameRealignment() { return LUA_ENGINE_899AC90_FRAME_REALIGNMENT >>> 0; }
export function luaEngine899ac90PreGateTouserdata() { return LUA_ENGINE_899AC90_PRE_GATE_TOUSERDATA >>> 0; }
export function luaEngine899ac90StructHelperVa() { return LUA_ENGINE_899AC90_STRUCT_HELPER_VA >>> 0; }
export function luaEngine899ac90NullResultIatLuaPushnil() { return LUA_ENGINE_899AC90_NULL_RESULT_IAT_LUA_PUSHNIL >>> 0; }
export function luaEngine899ac90IatLuaTouserdata() { return LUA_ENGINE_899AC90_IAT_LUA_TOUSERDATA >>> 0; }
export function luaEngine899ac90TouserdataIndex() { return LUA_ENGINE_899AC90_TOUSERDATA_INDEX_U32 >>> 0; }
export function luaEngine899ac90MethodVtableFieldOff() { return LUA_ENGINE_899AC90_METHOD_VTABLE_FIELD_OFF >>> 0; }
export function luaEngine899ac90MethodStackArgs() { return LUA_ENGINE_899AC90_METHOD_STACK_ARGS >>> 0; }
export function luaEngine899ac90NewuserdataSize() { return LUA_ENGINE_899AC90_NEWUSERDATA_SIZE >>> 0; }
export function luaEngine899ac90UdVtableVa() { return LUA_ENGINE_899AC90_UD_VTABLE_VA >>> 0; }
export function luaEngine899ac90UdPtrFieldOff() { return LUA_ENGINE_899AC90_UD_PTR_FIELD_OFF >>> 0; }
export function luaEngine899ac90UdPayloadBytes() { return LUA_ENGINE_899AC90_UD_PAYLOAD_BYTES >>> 0; }
export function luaEngine899ac90RegistryIndex() { return LUA_ENGINE_899AC90_REGISTRY_INDEX_U32 >>> 0; }
export function luaEngine899ac90MetatableRawgetpKey() { return LUA_ENGINE_899AC90_METATABLE_RAWGETP_KEY >>> 0; }
export function luaEngine899ac90ReturnValue() { return LUA_ENGINE_899AC90_RETURN_VALUE >>> 0; }
export const LUA_ENGINE_899AD70_VA = 0x89ad70;
export const LUA_ENGINE_899AD70_END_VA = 0x89adf2;
export const LUA_ENGINE_899AD70_NEXT_VA = 0x89ae00;
export const LUA_ENGINE_899AD70_STACK_ARGS = 0x1;
export const LUA_ENGINE_899AD70_ECX_ARG = 0x0;
export const LUA_ENGINE_899AD70_CALLEE_POPS_STACK_ARGS = 0x0;
export const LUA_ENGINE_899AD70_ALIGNED_PROLOGUE = 0x1;
export const LUA_ENGINE_899AD70_GATE_INVERTED_ENCODING = 0x0;
export const LUA_ENGINE_899AD70_IAT_LUA_TYPE = 0xb18400;
export const LUA_ENGINE_899AD70_CHECKGET_KEY = 0xc829da;
export const LUA_ENGINE_899AD70_CHECKGET_INDEX = 0x1;
export const LUA_ENGINE_899AD70_CHECKGET_DEF_ARG = 0x0;
export const LUA_ENGINE_899AD70_CHECKGET_FIELD_OFF = 0x4;
export const LUA_ENGINE_899AD70_CHECKGET_HELPER_VA = 0x85c590;
export const LUA_ENGINE_899AD70_IAT_LUA_TOUSERDATA = 0xb183b0;
export const LUA_ENGINE_899AD70_TOUSERDATA_INDEX_U32 = 0xfff0b9d7;
export const LUA_ENGINE_899AD70_METHOD_VTABLE_FIELD_OFF = 0x0;
export const LUA_ENGINE_899AD70_METHOD_STACK_ARGS = 0x1;
export const LUA_ENGINE_899AD70_RETURN_VALUE = 0x0;
export const LUA_ENGINE_899AD70_CHECKNUMBER_INDEX = 0x2;
export function luaEngine899ad70HostVa() { return LUA_ENGINE_899AD70_VA >>> 0; }
export function luaEngine899ad70EndVa() { return LUA_ENGINE_899AD70_END_VA >>> 0; }
export function luaEngine899ad70NextVa() { return LUA_ENGINE_899AD70_NEXT_VA >>> 0; }
export function luaEngine899ad70StackArgs() { return LUA_ENGINE_899AD70_STACK_ARGS >>> 0; }
export function luaEngine899ad70EcxArg() { return LUA_ENGINE_899AD70_ECX_ARG >>> 0; }
export function luaEngine899ad70CalleePopsStackArgs() { return LUA_ENGINE_899AD70_CALLEE_POPS_STACK_ARGS >>> 0; }
export function luaEngine899ad70AlignedPrologue() { return LUA_ENGINE_899AD70_ALIGNED_PROLOGUE >>> 0; }
export function luaEngine899ad70GateInvertedEncoding() { return LUA_ENGINE_899AD70_GATE_INVERTED_ENCODING >>> 0; }
export function luaEngine899ad70IatLuaType() { return LUA_ENGINE_899AD70_IAT_LUA_TYPE >>> 0; }
export function luaEngine899ad70CheckgetKey() { return LUA_ENGINE_899AD70_CHECKGET_KEY >>> 0; }
export function luaEngine899ad70CheckgetIndex() { return LUA_ENGINE_899AD70_CHECKGET_INDEX >>> 0; }
export function luaEngine899ad70CheckgetDefArg() { return LUA_ENGINE_899AD70_CHECKGET_DEF_ARG >>> 0; }
export function luaEngine899ad70CheckgetFieldOff() { return LUA_ENGINE_899AD70_CHECKGET_FIELD_OFF >>> 0; }
export function luaEngine899ad70CheckgetHelperVa() { return LUA_ENGINE_899AD70_CHECKGET_HELPER_VA >>> 0; }
export function luaEngine899ad70IatLuaTouserdata() { return LUA_ENGINE_899AD70_IAT_LUA_TOUSERDATA >>> 0; }
export function luaEngine899ad70TouserdataIndex() { return LUA_ENGINE_899AD70_TOUSERDATA_INDEX_U32 >>> 0; }
export function luaEngine899ad70MethodVtableFieldOff() { return LUA_ENGINE_899AD70_METHOD_VTABLE_FIELD_OFF >>> 0; }
export function luaEngine899ad70MethodStackArgs() { return LUA_ENGINE_899AD70_METHOD_STACK_ARGS >>> 0; }
export function luaEngine899ad70ChecknumberIndex() { return LUA_ENGINE_899AD70_CHECKNUMBER_INDEX >>> 0; }
export function luaEngine899ad70ReturnValue() { return LUA_ENGINE_899AD70_RETURN_VALUE >>> 0; }
/** 0x89ad70 law: FULL-WORD lua_type(L,1) gate (`jne`).
 * taken <=> typeResult !== 0. */
export function luaEngine899ad70Type1GateTaken(typeResult) {
  return typeResult !== 0 ? 1 : 0;
}
export const LUA_ENGINE_899AE00_VA = 0x89ae00;
export const LUA_ENGINE_899AE00_END_VA = 0x89ae69;
export const LUA_ENGINE_899AE00_NEXT_VA = 0x89ae70;
export const LUA_ENGINE_899AE00_STACK_ARGS = 0x1;
export const LUA_ENGINE_899AE00_ECX_ARG = 0x0;
export const LUA_ENGINE_899AE00_CALLEE_POPS_STACK_ARGS = 0x0;
export const LUA_ENGINE_899AE00_ALIGNED_PROLOGUE = 0x0;
export const LUA_ENGINE_899AE00_GATE_INVERTED_ENCODING = 0x0;
export const LUA_ENGINE_899AE00_IAT_LUA_TYPE = 0xb18400;
export const LUA_ENGINE_899AE00_CHECKGET_KEY = 0xc829da;
export const LUA_ENGINE_899AE00_CHECKGET_INDEX = 0x1;
export const LUA_ENGINE_899AE00_CHECKGET_DEF_ARG = 0x1;
export const LUA_ENGINE_899AE00_CHECKGET_FIELD_OFF = 0x4;
export const LUA_ENGINE_899AE00_CHECKGET_HELPER_VA = 0x85c590;
export const LUA_ENGINE_899AE00_IAT_LUA_TOUSERDATA = 0xb183b0;
export const LUA_ENGINE_899AE00_TOUSERDATA_INDEX_U32 = 0xfff0b9d7;
export const LUA_ENGINE_899AE00_METHOD_VTABLE_FIELD_OFF = 0x0;
export const LUA_ENGINE_899AE00_METHOD_STACK_ARGS = 0x0;
export const LUA_ENGINE_899AE00_RETURN_VALUE = 0x1;
export const LUA_ENGINE_899AE00_PUSHER_HELPER_VA = 0x85c050;
export function luaEngine899ae00HostVa() { return LUA_ENGINE_899AE00_VA >>> 0; }
export function luaEngine899ae00EndVa() { return LUA_ENGINE_899AE00_END_VA >>> 0; }
export function luaEngine899ae00NextVa() { return LUA_ENGINE_899AE00_NEXT_VA >>> 0; }
export function luaEngine899ae00StackArgs() { return LUA_ENGINE_899AE00_STACK_ARGS >>> 0; }
export function luaEngine899ae00EcxArg() { return LUA_ENGINE_899AE00_ECX_ARG >>> 0; }
export function luaEngine899ae00CalleePopsStackArgs() { return LUA_ENGINE_899AE00_CALLEE_POPS_STACK_ARGS >>> 0; }
export function luaEngine899ae00AlignedPrologue() { return LUA_ENGINE_899AE00_ALIGNED_PROLOGUE >>> 0; }
export function luaEngine899ae00GateInvertedEncoding() { return LUA_ENGINE_899AE00_GATE_INVERTED_ENCODING >>> 0; }
export function luaEngine899ae00IatLuaType() { return LUA_ENGINE_899AE00_IAT_LUA_TYPE >>> 0; }
export function luaEngine899ae00CheckgetKey() { return LUA_ENGINE_899AE00_CHECKGET_KEY >>> 0; }
export function luaEngine899ae00CheckgetIndex() { return LUA_ENGINE_899AE00_CHECKGET_INDEX >>> 0; }
export function luaEngine899ae00CheckgetDefArg() { return LUA_ENGINE_899AE00_CHECKGET_DEF_ARG >>> 0; }
export function luaEngine899ae00CheckgetFieldOff() { return LUA_ENGINE_899AE00_CHECKGET_FIELD_OFF >>> 0; }
export function luaEngine899ae00CheckgetHelperVa() { return LUA_ENGINE_899AE00_CHECKGET_HELPER_VA >>> 0; }
export function luaEngine899ae00IatLuaTouserdata() { return LUA_ENGINE_899AE00_IAT_LUA_TOUSERDATA >>> 0; }
export function luaEngine899ae00TouserdataIndex() { return LUA_ENGINE_899AE00_TOUSERDATA_INDEX_U32 >>> 0; }
export function luaEngine899ae00MethodVtableFieldOff() { return LUA_ENGINE_899AE00_METHOD_VTABLE_FIELD_OFF >>> 0; }
export function luaEngine899ae00MethodStackArgs() { return LUA_ENGINE_899AE00_METHOD_STACK_ARGS >>> 0; }
export function luaEngine899ae00PusherHelperVa() { return LUA_ENGINE_899AE00_PUSHER_HELPER_VA >>> 0; }
export function luaEngine899ae00ReturnValue() { return LUA_ENGINE_899AE00_RETURN_VALUE >>> 0; }
/** 0x89ae00 law: FULL-WORD lua_type(L,1) gate (`jne`).
 * taken <=> typeResult !== 0. */
export function luaEngine899ae00Type1GateTaken(typeResult) {
  return typeResult !== 0 ? 1 : 0;
}
export const LUA_ENGINE_899AE70_VA = 0x89ae70;
export const LUA_ENGINE_899AE70_END_VA = 0x89aed9;
export const LUA_ENGINE_899AE70_NEXT_VA = 0x89aee0;
export const LUA_ENGINE_899AE70_STACK_ARGS = 0x1;
export const LUA_ENGINE_899AE70_ECX_ARG = 0x0;
export const LUA_ENGINE_899AE70_CALLEE_POPS_STACK_ARGS = 0x0;
export const LUA_ENGINE_899AE70_GATE_INVERTED_ENCODING = 0x0;
export const LUA_ENGINE_899AE70_IAT_LUA_TYPE = 0xb18400;
export const LUA_ENGINE_899AE70_CHECKGET_KEY = 0xc829da;
export const LUA_ENGINE_899AE70_CHECKGET_INDEX = 0x1;
export const LUA_ENGINE_899AE70_CHECKGET_DEF_ARG = 0x1;
export const LUA_ENGINE_899AE70_CHECKGET_FIELD_OFF = 0x4;
export const LUA_ENGINE_899AE70_CHECKGET_HELPER_VA = 0x85c590;
export const LUA_ENGINE_899AE70_IAT_LUA_TOUSERDATA = 0xb183b0;
export const LUA_ENGINE_899AE70_TOUSERDATA_INDEX_U32 = 0xfff0b9d7;
export const LUA_ENGINE_899AE70_METHOD_VTABLE_FIELD_OFF = 0x0;
export const LUA_ENGINE_899AE70_METHOD_STACK_ARGS = 0x1;
export const LUA_ENGINE_899AE70_RETURN_VALUE = 0x0;
export const LUA_ENGINE_899AE70_IAT_LUA_TOBOOLEAN = 0xb183e8;
export const LUA_ENGINE_899AE70_TOBOOLEAN_INDEX = 0x2;
export function luaEngine899ae70HostVa() { return LUA_ENGINE_899AE70_VA >>> 0; }
export function luaEngine899ae70EndVa() { return LUA_ENGINE_899AE70_END_VA >>> 0; }
export function luaEngine899ae70NextVa() { return LUA_ENGINE_899AE70_NEXT_VA >>> 0; }
export function luaEngine899ae70StackArgs() { return LUA_ENGINE_899AE70_STACK_ARGS >>> 0; }
export function luaEngine899ae70EcxArg() { return LUA_ENGINE_899AE70_ECX_ARG >>> 0; }
export function luaEngine899ae70CalleePopsStackArgs() { return LUA_ENGINE_899AE70_CALLEE_POPS_STACK_ARGS >>> 0; }
export function luaEngine899ae70GateInvertedEncoding() { return LUA_ENGINE_899AE70_GATE_INVERTED_ENCODING >>> 0; }
export function luaEngine899ae70IatLuaType() { return LUA_ENGINE_899AE70_IAT_LUA_TYPE >>> 0; }
export function luaEngine899ae70CheckgetKey() { return LUA_ENGINE_899AE70_CHECKGET_KEY >>> 0; }
export function luaEngine899ae70CheckgetIndex() { return LUA_ENGINE_899AE70_CHECKGET_INDEX >>> 0; }
export function luaEngine899ae70CheckgetDefArg() { return LUA_ENGINE_899AE70_CHECKGET_DEF_ARG >>> 0; }
export function luaEngine899ae70CheckgetFieldOff() { return LUA_ENGINE_899AE70_CHECKGET_FIELD_OFF >>> 0; }
export function luaEngine899ae70CheckgetHelperVa() { return LUA_ENGINE_899AE70_CHECKGET_HELPER_VA >>> 0; }
export function luaEngine899ae70IatLuaTouserdata() { return LUA_ENGINE_899AE70_IAT_LUA_TOUSERDATA >>> 0; }
export function luaEngine899ae70TouserdataIndex() { return LUA_ENGINE_899AE70_TOUSERDATA_INDEX_U32 >>> 0; }
export function luaEngine899ae70MethodVtableFieldOff() { return LUA_ENGINE_899AE70_METHOD_VTABLE_FIELD_OFF >>> 0; }
export function luaEngine899ae70IatLuaToboolean() { return LUA_ENGINE_899AE70_IAT_LUA_TOBOOLEAN >>> 0; }
export function luaEngine899ae70TobooleanIndex() { return LUA_ENGINE_899AE70_TOBOOLEAN_INDEX >>> 0; }
export function luaEngine899ae70MethodStackArgs() { return LUA_ENGINE_899AE70_METHOD_STACK_ARGS >>> 0; }
export function luaEngine899ae70ReturnValue() { return LUA_ENGINE_899AE70_RETURN_VALUE >>> 0; }
/** 0x89ae70 law: FULL-WORD lua_type(L,1) gate (`jne`).
 * taken <=> typeResult !== 0. */
export function luaEngine899ae70Type1GateTaken(typeResult) {
  return typeResult !== 0 ? 1 : 0;
}
export const LUA_ENGINE_899AEE0_VA = 0x89aee0;
export const LUA_ENGINE_899AEE0_END_VA = 0x89af45;
export const LUA_ENGINE_899AEE0_NEXT_VA = 0x89af50;
export const LUA_ENGINE_899AEE0_STACK_ARGS = 0x1;
export const LUA_ENGINE_899AEE0_ECX_ARG = 0x0;
export const LUA_ENGINE_899AEE0_CALLEE_POPS_STACK_ARGS = 0x0;
export const LUA_ENGINE_899AEE0_GATE_INVERTED_ENCODING = 0x0;
export const LUA_ENGINE_899AEE0_IAT_LUA_TYPE = 0xb18400;
export const LUA_ENGINE_899AEE0_CHECKGET_KEY = 0xc829da;
export const LUA_ENGINE_899AEE0_CHECKGET_INDEX = 0x1;
export const LUA_ENGINE_899AEE0_CHECKGET_DEF_ARG = 0x1;
export const LUA_ENGINE_899AEE0_CHECKGET_FIELD_OFF = 0x4;
export const LUA_ENGINE_899AEE0_CHECKGET_HELPER_VA = 0x85c590;
export const LUA_ENGINE_899AEE0_IAT_LUA_TOUSERDATA = 0xb183b0;
export const LUA_ENGINE_899AEE0_TOUSERDATA_INDEX_U32 = 0xfff0b9d7;
export const LUA_ENGINE_899AEE0_METHOD_VTABLE_FIELD_OFF = 0x0;
export const LUA_ENGINE_899AEE0_METHOD_STACK_ARGS = 0x0;
export const LUA_ENGINE_899AEE0_RETURN_VALUE = 0x1;
export const LUA_ENGINE_899AEE0_IAT_LUA_PUSHBOOLEAN = 0xb183ec;
export function luaEngine899aee0HostVa() { return LUA_ENGINE_899AEE0_VA >>> 0; }
export function luaEngine899aee0EndVa() { return LUA_ENGINE_899AEE0_END_VA >>> 0; }
export function luaEngine899aee0NextVa() { return LUA_ENGINE_899AEE0_NEXT_VA >>> 0; }
export function luaEngine899aee0StackArgs() { return LUA_ENGINE_899AEE0_STACK_ARGS >>> 0; }
export function luaEngine899aee0EcxArg() { return LUA_ENGINE_899AEE0_ECX_ARG >>> 0; }
export function luaEngine899aee0CalleePopsStackArgs() { return LUA_ENGINE_899AEE0_CALLEE_POPS_STACK_ARGS >>> 0; }
export function luaEngine899aee0GateInvertedEncoding() { return LUA_ENGINE_899AEE0_GATE_INVERTED_ENCODING >>> 0; }
export function luaEngine899aee0IatLuaType() { return LUA_ENGINE_899AEE0_IAT_LUA_TYPE >>> 0; }
export function luaEngine899aee0CheckgetKey() { return LUA_ENGINE_899AEE0_CHECKGET_KEY >>> 0; }
export function luaEngine899aee0CheckgetIndex() { return LUA_ENGINE_899AEE0_CHECKGET_INDEX >>> 0; }
export function luaEngine899aee0CheckgetDefArg() { return LUA_ENGINE_899AEE0_CHECKGET_DEF_ARG >>> 0; }
export function luaEngine899aee0CheckgetFieldOff() { return LUA_ENGINE_899AEE0_CHECKGET_FIELD_OFF >>> 0; }
export function luaEngine899aee0CheckgetHelperVa() { return LUA_ENGINE_899AEE0_CHECKGET_HELPER_VA >>> 0; }
export function luaEngine899aee0IatLuaTouserdata() { return LUA_ENGINE_899AEE0_IAT_LUA_TOUSERDATA >>> 0; }
export function luaEngine899aee0TouserdataIndex() { return LUA_ENGINE_899AEE0_TOUSERDATA_INDEX_U32 >>> 0; }
export function luaEngine899aee0MethodVtableFieldOff() { return LUA_ENGINE_899AEE0_METHOD_VTABLE_FIELD_OFF >>> 0; }
export function luaEngine899aee0MethodStackArgs() { return LUA_ENGINE_899AEE0_METHOD_STACK_ARGS >>> 0; }
export function luaEngine899aee0IatLuaPushboolean() { return LUA_ENGINE_899AEE0_IAT_LUA_PUSHBOOLEAN >>> 0; }
export function luaEngine899aee0ReturnValue() { return LUA_ENGINE_899AEE0_RETURN_VALUE >>> 0; }
/** 0x89aee0 law: FULL-WORD lua_type(L,1) gate (`jne`).
 * taken <=> typeResult !== 0. */
export function luaEngine899aee0Type1GateTaken(typeResult) {
  return typeResult !== 0 ? 1 : 0;
}
/** 0x89ae70 law: FULL-WORD lua_toboolean(L,2) normalize (`test
 * eax,eax; setne`) — 0x100 -> 1. */
export function luaEngine899ae70BoolWord(tobooleanResult) {
  return tobooleanResult !== 0 ? 1 : 0;
}
/** 0x89aee0 law: METHOD RETURN BYTE GATE (`test al,al; setne cl`) —
 * only the low byte matters: 0x100/0xff00 behave like 0. */
export function luaEngine899aee0MethodReturnByteGate(methodResult) {
  return (methodResult & 0xff) !== 0 ? 1 : 0;
}
/** 0x89af50 law: FULL-WORD lua_type(L,1) gate (`jne`).
 * taken <=> typeResult !== 0. */
export function luaEngine899af50Type1GateTaken(typeResult) {
  return typeResult !== 0 ? 1 : 0;
}
export const LUA_ENGINE_899AF50_VA = 0x89af50;
export const LUA_ENGINE_899AF50_END_VA = 0x89afe3;
export const LUA_ENGINE_899AF50_NEXT_VA = 0x89aff0;
export const LUA_ENGINE_899AF50_STACK_ARGS = 0x1;
export const LUA_ENGINE_899AF50_ECX_ARG = 0x0;
export const LUA_ENGINE_899AF50_CALLEE_POPS_STACK_ARGS = 0x0;
export const LUA_ENGINE_899AF50_IAT_LUA_TOUSERDATA = 0xb183b0;
export const LUA_ENGINE_899AF50_TOUSERDATA_INDEX_U32 = 0xfff0b9d7;
export const LUA_ENGINE_899AF50_METHOD_VTABLE_FIELD_OFF = 0x0;
export const LUA_ENGINE_899AF50_GATE_INVERTED_ENCODING = 0x0;
export const LUA_ENGINE_899AF50_IAT_LUA_TYPE = 0xb18400;
export const LUA_ENGINE_899AF50_CHECKGET_KEY = 0xc829dd;
export const LUA_ENGINE_899AF50_CHECKGET_INDEX = 0x1;
export const LUA_ENGINE_899AF50_CHECKGET_DEF_ARG = 0x0;
export const LUA_ENGINE_899AF50_CHECKGET_FIELD_OFF = 0x4;
export const LUA_ENGINE_899AF50_CHECKGET_HELPER_VA = 0x85c590;
export const LUA_ENGINE_899AF50_METHOD_STACK_ARGS = 0x1;
export const LUA_ENGINE_899AF50_RETURN_VALUE = 0x0;
export function luaEngine899af50HostVa() { return LUA_ENGINE_899AF50_VA >>> 0; }
export function luaEngine899af50EndVa() { return LUA_ENGINE_899AF50_END_VA >>> 0; }
export function luaEngine899af50NextVa() { return LUA_ENGINE_899AF50_NEXT_VA >>> 0; }
export function luaEngine899af50StackArgs() { return LUA_ENGINE_899AF50_STACK_ARGS >>> 0; }
export function luaEngine899af50EcxArg() { return LUA_ENGINE_899AF50_ECX_ARG >>> 0; }
export function luaEngine899af50CalleePopsStackArgs() { return LUA_ENGINE_899AF50_CALLEE_POPS_STACK_ARGS >>> 0; }
export function luaEngine899af50GateInvertedEncoding() { return LUA_ENGINE_899AF50_GATE_INVERTED_ENCODING >>> 0; }
export function luaEngine899af50IatLuaType() { return LUA_ENGINE_899AF50_IAT_LUA_TYPE >>> 0; }
export function luaEngine899af50CheckgetKey() { return LUA_ENGINE_899AF50_CHECKGET_KEY >>> 0; }
export function luaEngine899af50CheckgetIndex() { return LUA_ENGINE_899AF50_CHECKGET_INDEX >>> 0; }
export function luaEngine899af50CheckgetDefArg() { return LUA_ENGINE_899AF50_CHECKGET_DEF_ARG >>> 0; }
export function luaEngine899af50CheckgetFieldOff() { return LUA_ENGINE_899AF50_CHECKGET_FIELD_OFF >>> 0; }
export function luaEngine899af50CheckgetHelperVa() { return LUA_ENGINE_899AF50_CHECKGET_HELPER_VA >>> 0; }
export function luaEngine899af50IatLuaTouserdata() { return LUA_ENGINE_899AF50_IAT_LUA_TOUSERDATA >>> 0; }
export function luaEngine899af50TouserdataIndex() { return LUA_ENGINE_899AF50_TOUSERDATA_INDEX_U32 >>> 0; }
export function luaEngine899af50MethodVtableFieldOff() { return LUA_ENGINE_899AF50_METHOD_VTABLE_FIELD_OFF >>> 0; }
export function luaEngine899af50MethodStackArgs() { return LUA_ENGINE_899AF50_METHOD_STACK_ARGS >>> 0; }
export function luaEngine899af50ReturnValue() { return LUA_ENGINE_899AF50_RETURN_VALUE >>> 0; }
/** 0x89aff0 law: FULL-WORD lua_type(L,1) gate (`jne`).
 * taken <=> typeResult !== 0. */
export function luaEngine899aff0Type1GateTaken(typeResult) {
  return typeResult !== 0 ? 1 : 0;
}
export const LUA_ENGINE_899AFF0_VA = 0x89aff0;
export const LUA_ENGINE_899AFF0_END_VA = 0x89b08a;
export const LUA_ENGINE_899AFF0_NEXT_VA = 0x89b090;
export const LUA_ENGINE_899AFF0_STACK_ARGS = 0x1;
export const LUA_ENGINE_899AFF0_ECX_ARG = 0x0;
export const LUA_ENGINE_899AFF0_CALLEE_POPS_STACK_ARGS = 0x0;
export const LUA_ENGINE_899AFF0_IAT_LUA_TOUSERDATA = 0xb183b0;
export const LUA_ENGINE_899AFF0_TOUSERDATA_INDEX_U32 = 0xfff0b9d7;
export const LUA_ENGINE_899AFF0_METHOD_VTABLE_FIELD_OFF = 0x0;
export const LUA_ENGINE_899AFF0_GATE_INVERTED_ENCODING = 0x0;
export const LUA_ENGINE_899AFF0_IAT_LUA_TYPE = 0xb18400;
export const LUA_ENGINE_899AFF0_CHECKGET_KEY = 0xc829dd;
export const LUA_ENGINE_899AFF0_CHECKGET_INDEX = 0x1;
export const LUA_ENGINE_899AFF0_CHECKGET_DEF_ARG = 0x1;
export const LUA_ENGINE_899AFF0_CHECKGET_FIELD_OFF = 0x4;
export const LUA_ENGINE_899AFF0_CHECKGET_HELPER_VA = 0x85c590;
export const LUA_ENGINE_899AFF0_METHOD_STACK_ARGS = 0x1;
export const LUA_ENGINE_899AFF0_RETURN_VALUE = 0x1;
export const LUA_ENGINE_899AFF0_NEWUSERDATA_SIZE = 0x18;
export const LUA_ENGINE_899AFF0_UD_VTABLE_VA = 0xb7364c;
export const LUA_ENGINE_899AFF0_UD_PTR_FIELD_OFF = 0x4;
export const LUA_ENGINE_899AFF0_UD_PAYLOAD_BYTES = 0x10;
export const LUA_ENGINE_899AFF0_REGISTRY_INDEX_U32 = 0xfff0b9d8;
export const LUA_ENGINE_899AFF0_METATABLE_RAWGETP_KEY = 0xc8299b;
export function luaEngine899aff0HostVa() { return LUA_ENGINE_899AFF0_VA >>> 0; }
export function luaEngine899aff0EndVa() { return LUA_ENGINE_899AFF0_END_VA >>> 0; }
export function luaEngine899aff0NextVa() { return LUA_ENGINE_899AFF0_NEXT_VA >>> 0; }
export function luaEngine899aff0StackArgs() { return LUA_ENGINE_899AFF0_STACK_ARGS >>> 0; }
export function luaEngine899aff0EcxArg() { return LUA_ENGINE_899AFF0_ECX_ARG >>> 0; }
export function luaEngine899aff0CalleePopsStackArgs() { return LUA_ENGINE_899AFF0_CALLEE_POPS_STACK_ARGS >>> 0; }
export function luaEngine899aff0GateInvertedEncoding() { return LUA_ENGINE_899AFF0_GATE_INVERTED_ENCODING >>> 0; }
export function luaEngine899aff0IatLuaType() { return LUA_ENGINE_899AFF0_IAT_LUA_TYPE >>> 0; }
export function luaEngine899aff0CheckgetKey() { return LUA_ENGINE_899AFF0_CHECKGET_KEY >>> 0; }
export function luaEngine899aff0CheckgetIndex() { return LUA_ENGINE_899AFF0_CHECKGET_INDEX >>> 0; }
export function luaEngine899aff0CheckgetDefArg() { return LUA_ENGINE_899AFF0_CHECKGET_DEF_ARG >>> 0; }
export function luaEngine899aff0CheckgetFieldOff() { return LUA_ENGINE_899AFF0_CHECKGET_FIELD_OFF >>> 0; }
export function luaEngine899aff0CheckgetHelperVa() { return LUA_ENGINE_899AFF0_CHECKGET_HELPER_VA >>> 0; }
export function luaEngine899aff0IatLuaTouserdata() { return LUA_ENGINE_899AFF0_IAT_LUA_TOUSERDATA >>> 0; }
export function luaEngine899aff0TouserdataIndex() { return LUA_ENGINE_899AFF0_TOUSERDATA_INDEX_U32 >>> 0; }
export function luaEngine899aff0MethodVtableFieldOff() { return LUA_ENGINE_899AFF0_METHOD_VTABLE_FIELD_OFF >>> 0; }
export function luaEngine899aff0MethodStackArgs() { return LUA_ENGINE_899AFF0_METHOD_STACK_ARGS >>> 0; }
export function luaEngine899aff0NewuserdataSize() { return LUA_ENGINE_899AFF0_NEWUSERDATA_SIZE >>> 0; }
export function luaEngine899aff0UdVtableVa() { return LUA_ENGINE_899AFF0_UD_VTABLE_VA >>> 0; }
export function luaEngine899aff0UdPtrFieldOff() { return LUA_ENGINE_899AFF0_UD_PTR_FIELD_OFF >>> 0; }
export function luaEngine899aff0UdPayloadBytes() { return LUA_ENGINE_899AFF0_UD_PAYLOAD_BYTES >>> 0; }
export function luaEngine899aff0RegistryIndex() { return LUA_ENGINE_899AFF0_REGISTRY_INDEX_U32 >>> 0; }
export function luaEngine899aff0MetatableRawgetpKey() { return LUA_ENGINE_899AFF0_METATABLE_RAWGETP_KEY >>> 0; }
export function luaEngine899aff0ReturnValue() { return LUA_ENGINE_899AFF0_RETURN_VALUE >>> 0; }
/** ==== ABI v94: wrapper-band continuation — 0x0089b090 (two-gate
 * wrap setter, census ordinal 29) + 0x0089b140 (vcall-boxing getter,
 * census ordinal 9). Key 0xc829d7 band. NEXT frontier 0x89b1e0
 * (unlisted twin of 0x89b140 — box key 0xc829d7; census gap). ====
 *
 * 0x89b090..0x89b132 (pad to 0x89b140) — TWO-GATE WRAP SETTER:
 * aligned prologue (`and esp,-8`), full-word lua_type(L,1) gate
 * (`jne`; nil -> val slot 0), check/get 0x85c590(key 0xc829d7,
 * idx 1, def 0) -> val = [obj+4], touserdata(upvalueindex 1),
 * full-word lua_type(L,2) gate (`jne`): NIL -> method(0) through
 * [ud+0] with this=val; else wrap check/get(key 0xc8297a, idx 2,
 * def 0) -> arg = [wrap+4], same vcall with this=val;
 * xor eax,eax; ret 0.
 *
 * 0x89b140..0x89b1da (pad to 0x89b1e0) — VCALL-BOXING GETTER:
 * plain prologue (no realignment), full-word lua_type(L,1) gate
 * (`jne`; nil -> obj 0), check/get(key 0xc829d7, idx 1, DEF 1)
 * -> obj = [obj+4], touserdata(upvalueindex 1), method() thiscall
 * this=obj through [ud+0] (0 stack args); null result ->
 * lua_pushnil, ret 1; else 8-byte box {vtable 0xb753c8, result
 * ptr +4} + rawgetp(registry, 0xc8297a) + setmetatable(-2),
 * ret 1.
 *
 * The unlisted body at 0x89b1e0 is byte-identical to 0x89b140
 * except its box metatable rawgetp key is 0xc829d7 (vs 0xc8297a);
 * it has no wrapper-band census row — documented as a census gap
 * for the next unit, not landed here.
 */
/** 0x89b090 law: FULL-WORD lua_type(L,1) gate (`jne`).
 * taken <=> typeResult !== 0. */
export function luaEngine899b090Type1GateTaken(typeResult) {
  return typeResult !== 0 ? 1 : 0;
}
/** 0x89b090 law: FULL-WORD lua_type(L,2) gate (`jne`) selects the
 * wrap path. taken <=> typeResult !== 0. */
export function luaEngine899b090Type2GateTaken(typeResult) {
  return typeResult !== 0 ? 1 : 0;
}
export const LUA_ENGINE_899B090_VA = 0x89b090;
export const LUA_ENGINE_899B090_END_VA = 0x89b133;
export const LUA_ENGINE_899B090_NEXT_VA = 0x89b140;
export const LUA_ENGINE_899B090_STACK_ARGS = 0x1;
export const LUA_ENGINE_899B090_ECX_ARG = 0x0;
export const LUA_ENGINE_899B090_CALLEE_POPS_STACK_ARGS = 0x0;
export const LUA_ENGINE_899B090_ALIGNED_PROLOGUE = 0x1;
export const LUA_ENGINE_899B090_GATE_INVERTED_ENCODING = 0x0;
export const LUA_ENGINE_899B090_TYPE_GATES = 0x2;
export const LUA_ENGINE_899B090_IAT_LUA_TYPE = 0xb18400;
export const LUA_ENGINE_899B090_CHECKGET_KEY = 0xc829d7;
export const LUA_ENGINE_899B090_CHECKGET_INDEX = 0x1;
export const LUA_ENGINE_899B090_CHECKGET_DEF_ARG = 0x0;
export const LUA_ENGINE_899B090_CHECKGET_FIELD_OFF = 0x4;
export const LUA_ENGINE_899B090_CHECKGET_HELPER_VA = 0x85c590;
export const LUA_ENGINE_899B090_IAT_LUA_TOUSERDATA = 0xb183b0;
export const LUA_ENGINE_899B090_TOUSERDATA_INDEX_U32 = 0xfff0b9d7;
export const LUA_ENGINE_899B090_METHOD_VTABLE_FIELD_OFF = 0x0;
export const LUA_ENGINE_899B090_METHOD_STACK_ARGS = 0x1;
export const LUA_ENGINE_899B090_NIL_PATH_METHOD_ARG = 0x0;
export const LUA_ENGINE_899B090_WRAP_CHECKGET_KEY = 0xc8297a;
export const LUA_ENGINE_899B090_WRAP_CHECKGET_INDEX = 0x2;
export const LUA_ENGINE_899B090_WRAP_CHECKGET_DEF_ARG = 0x0;
export const LUA_ENGINE_899B090_RETURN_VALUE = 0x0;
export function luaEngine899b090HostVa() { return LUA_ENGINE_899B090_VA >>> 0; }
export function luaEngine899b090EndVa() { return LUA_ENGINE_899B090_END_VA >>> 0; }
export function luaEngine899b090NextVa() { return LUA_ENGINE_899B090_NEXT_VA >>> 0; }
export function luaEngine899b090StackArgs() { return LUA_ENGINE_899B090_STACK_ARGS >>> 0; }
export function luaEngine899b090EcxArg() { return LUA_ENGINE_899B090_ECX_ARG >>> 0; }
export function luaEngine899b090CalleePopsStackArgs() { return LUA_ENGINE_899B090_CALLEE_POPS_STACK_ARGS >>> 0; }
export function luaEngine899b090AlignedPrologue() { return LUA_ENGINE_899B090_ALIGNED_PROLOGUE >>> 0; }
export function luaEngine899b090GateInvertedEncoding() { return LUA_ENGINE_899B090_GATE_INVERTED_ENCODING >>> 0; }
export function luaEngine899b090TypeGates() { return LUA_ENGINE_899B090_TYPE_GATES >>> 0; }
export function luaEngine899b090IatLuaType() { return LUA_ENGINE_899B090_IAT_LUA_TYPE >>> 0; }
export function luaEngine899b090CheckgetKey() { return LUA_ENGINE_899B090_CHECKGET_KEY >>> 0; }
export function luaEngine899b090CheckgetIndex() { return LUA_ENGINE_899B090_CHECKGET_INDEX >>> 0; }
export function luaEngine899b090CheckgetDefArg() { return LUA_ENGINE_899B090_CHECKGET_DEF_ARG >>> 0; }
export function luaEngine899b090CheckgetFieldOff() { return LUA_ENGINE_899B090_CHECKGET_FIELD_OFF >>> 0; }
export function luaEngine899b090CheckgetHelperVa() { return LUA_ENGINE_899B090_CHECKGET_HELPER_VA >>> 0; }
export function luaEngine899b090IatLuaTouserdata() { return LUA_ENGINE_899B090_IAT_LUA_TOUSERDATA >>> 0; }
export function luaEngine899b090TouserdataIndex() { return LUA_ENGINE_899B090_TOUSERDATA_INDEX_U32 >>> 0; }
export function luaEngine899b090MethodVtableFieldOff() { return LUA_ENGINE_899B090_METHOD_VTABLE_FIELD_OFF >>> 0; }
export function luaEngine899b090MethodStackArgs() { return LUA_ENGINE_899B090_METHOD_STACK_ARGS >>> 0; }
export function luaEngine899b090NilPathMethodArg() { return LUA_ENGINE_899B090_NIL_PATH_METHOD_ARG >>> 0; }
export function luaEngine899b090WrapCheckgetKey() { return LUA_ENGINE_899B090_WRAP_CHECKGET_KEY >>> 0; }
export function luaEngine899b090WrapCheckgetIndex() { return LUA_ENGINE_899B090_WRAP_CHECKGET_INDEX >>> 0; }
export function luaEngine899b090WrapCheckgetDefArg() { return LUA_ENGINE_899B090_WRAP_CHECKGET_DEF_ARG >>> 0; }
export function luaEngine899b090ReturnValue() { return LUA_ENGINE_899B090_RETURN_VALUE >>> 0; }
/** 0x89b140 law: FULL-WORD lua_type(L,1) gate (`jne`).
 * taken <=> typeResult !== 0. */
export function luaEngine899b140Type1GateTaken(typeResult) {
  return typeResult !== 0 ? 1 : 0;
}
export const LUA_ENGINE_899B140_VA = 0x89b140;
export const LUA_ENGINE_899B140_END_VA = 0x89b1db;
export const LUA_ENGINE_899B140_NEXT_VA = 0x89b1e0;
export const LUA_ENGINE_899B140_STACK_ARGS = 0x1;
export const LUA_ENGINE_899B140_ECX_ARG = 0x0;
export const LUA_ENGINE_899B140_CALLEE_POPS_STACK_ARGS = 0x0;
export const LUA_ENGINE_899B140_ALIGNED_PROLOGUE = 0x0;
export const LUA_ENGINE_899B140_GATE_INVERTED_ENCODING = 0x0;
export const LUA_ENGINE_899B140_TYPE_GATES = 0x1;
export const LUA_ENGINE_899B140_IAT_LUA_TYPE = 0xb18400;
export const LUA_ENGINE_899B140_CHECKGET_KEY = 0xc829d7;
export const LUA_ENGINE_899B140_CHECKGET_INDEX = 0x1;
export const LUA_ENGINE_899B140_CHECKGET_DEF_ARG = 0x1;
export const LUA_ENGINE_899B140_CHECKGET_FIELD_OFF = 0x4;
export const LUA_ENGINE_899B140_CHECKGET_HELPER_VA = 0x85c590;
export const LUA_ENGINE_899B140_IAT_LUA_TOUSERDATA = 0xb183b0;
export const LUA_ENGINE_899B140_TOUSERDATA_INDEX_U32 = 0xfff0b9d7;
export const LUA_ENGINE_899B140_METHOD_VTABLE_FIELD_OFF = 0x0;
export const LUA_ENGINE_899B140_METHOD_STACK_ARGS = 0x0;
export const LUA_ENGINE_899B140_IAT_LUA_PUSHNIL = 0xb183e0;
export const LUA_ENGINE_899B140_NEWUSERDATA_SIZE = 0x8;
export const LUA_ENGINE_899B140_UD_VTABLE_VA = 0xb753c8;
export const LUA_ENGINE_899B140_UD_PTR_FIELD_OFF = 0x4;
export const LUA_ENGINE_899B140_REGISTRY_INDEX_U32 = 0xfff0b9d8;
export const LUA_ENGINE_899B140_METATABLE_RAWGETP_KEY = 0xc8297a;
export const LUA_ENGINE_899B140_IAT_LUA_RAWGETP = 0xb183bc;
export const LUA_ENGINE_899B140_IAT_LUA_SETMETATABLE = 0xb18398;
export const LUA_ENGINE_899B140_SETMETATABLE_INDEX_U32 = 0xfffffffe;
export const LUA_ENGINE_899B140_RETURN_VALUE = 0x1;
export function luaEngine899b140HostVa() { return LUA_ENGINE_899B140_VA >>> 0; }
export function luaEngine899b140EndVa() { return LUA_ENGINE_899B140_END_VA >>> 0; }
export function luaEngine899b140NextVa() { return LUA_ENGINE_899B140_NEXT_VA >>> 0; }
export function luaEngine899b140StackArgs() { return LUA_ENGINE_899B140_STACK_ARGS >>> 0; }
export function luaEngine899b140EcxArg() { return LUA_ENGINE_899B140_ECX_ARG >>> 0; }
export function luaEngine899b140CalleePopsStackArgs() { return LUA_ENGINE_899B140_CALLEE_POPS_STACK_ARGS >>> 0; }
export function luaEngine899b140AlignedPrologue() { return LUA_ENGINE_899B140_ALIGNED_PROLOGUE >>> 0; }
export function luaEngine899b140GateInvertedEncoding() { return LUA_ENGINE_899B140_GATE_INVERTED_ENCODING >>> 0; }
export function luaEngine899b140TypeGates() { return LUA_ENGINE_899B140_TYPE_GATES >>> 0; }
export function luaEngine899b140IatLuaType() { return LUA_ENGINE_899B140_IAT_LUA_TYPE >>> 0; }
export function luaEngine899b140CheckgetKey() { return LUA_ENGINE_899B140_CHECKGET_KEY >>> 0; }
export function luaEngine899b140CheckgetIndex() { return LUA_ENGINE_899B140_CHECKGET_INDEX >>> 0; }
export function luaEngine899b140CheckgetDefArg() { return LUA_ENGINE_899B140_CHECKGET_DEF_ARG >>> 0; }
export function luaEngine899b140CheckgetFieldOff() { return LUA_ENGINE_899B140_CHECKGET_FIELD_OFF >>> 0; }
export function luaEngine899b140CheckgetHelperVa() { return LUA_ENGINE_899B140_CHECKGET_HELPER_VA >>> 0; }
export function luaEngine899b140IatLuaTouserdata() { return LUA_ENGINE_899B140_IAT_LUA_TOUSERDATA >>> 0; }
export function luaEngine899b140TouserdataIndex() { return LUA_ENGINE_899B140_TOUSERDATA_INDEX_U32 >>> 0; }
export function luaEngine899b140MethodVtableFieldOff() { return LUA_ENGINE_899B140_METHOD_VTABLE_FIELD_OFF >>> 0; }
export function luaEngine899b140MethodStackArgs() { return LUA_ENGINE_899B140_METHOD_STACK_ARGS >>> 0; }
export function luaEngine899b140IatLuaPushnil() { return LUA_ENGINE_899B140_IAT_LUA_PUSHNIL >>> 0; }
export function luaEngine899b140NewuserdataSize() { return LUA_ENGINE_899B140_NEWUSERDATA_SIZE >>> 0; }
export function luaEngine899b140UdVtableVa() { return LUA_ENGINE_899B140_UD_VTABLE_VA >>> 0; }
export function luaEngine899b140UdPtrFieldOff() { return LUA_ENGINE_899B140_UD_PTR_FIELD_OFF >>> 0; }
export function luaEngine899b140RegistryIndex() { return LUA_ENGINE_899B140_REGISTRY_INDEX_U32 >>> 0; }
export function luaEngine899b140MetatableRawgetpKey() { return LUA_ENGINE_899B140_METATABLE_RAWGETP_KEY >>> 0; }
export function luaEngine899b140IatLuaRawgetp() { return LUA_ENGINE_899B140_IAT_LUA_RAWGETP >>> 0; }
export function luaEngine899b140IatLuaSetmetatable() { return LUA_ENGINE_899B140_IAT_LUA_SETMETABLE >>> 0; }
export function luaEngine899b140SetmetatableIndex() { return LUA_ENGINE_899B140_SETMETATABLE_INDEX_U32 >>> 0; }
export function luaEngine899b140ReturnValue() { return LUA_ENGINE_899B140_RETURN_VALUE >>> 0; }
/** ==== ABI v95: wrapper-band continuation — 0x0089b1e0 (vcall-boxing
 * getter twin, CENSUS GAP) + 0x0089b280 (float-lane setter). ====
 *
 * 0x89b1e0..0x89b27a (pad to 0x89b280) — BYTE-TWIN of 0x89b140
 * (ABI v94) except ONLY its box metatable rawgetp key is 0xc829d7
 * (@0x89b239 vs 0x89b199's 0xc8297a). It has NO LUA_PROPERTY_CLOSURES
 * row (table walks 0x89b140 -> 0x89b280): cluster/member attribution
 * would have to be re-derived from the v19 builder trampoline walk;
 * absence is RECORDED here, not fabricated. Same pure-law profile.
 *
 * 0x89b280..0x89b301 (pad to 0x89b310) — FLOAT-LANE SETTER (v86
 * 0x89a670 shape, key band 0xc829d7): aligned prologue, full-word
 * lua_type(L,1) `jne` (nil -> val slot 0), check/get(key 0xc829d7,
 * idx 1, def 0) -> val=[obj+4], touserdata(upvalueindex 1),
 * luaL_checknumber(L, 2) IAT 0xb18324 (float result in ST0), method
 * through [ud+0] with this=val and ONE float stack arg spilled via
 * fstp/movss; xor eax,eax; ret 0. NEXT frontier 0x89b310.
 */
/** 0x89b1e0 law: FULL-WORD lua_type(L,1) gate (`jne`).
 * taken <=> typeResult !== 0. */
export function luaEngine899b1e0Type1GateTaken(typeResult) {
  return typeResult !== 0 ? 1 : 0;
}
export const LUA_ENGINE_899B1E0_VA = 0x89b1e0;
export const LUA_ENGINE_899B1E0_END_VA = 0x89b27b;
export const LUA_ENGINE_899B1E0_NEXT_VA = 0x89b280;
export const LUA_ENGINE_899B1E0_STACK_ARGS = 0x1;
export const LUA_ENGINE_899B1E0_ECX_ARG = 0x0;
export const LUA_ENGINE_899B1E0_CALLEE_POPS_STACK_ARGS = 0x0;
export const LUA_ENGINE_899B1E0_ALIGNED_PROLOGUE = 0x0;
export const LUA_ENGINE_899B1E0_GATE_INVERTED_ENCODING = 0x0;
export const LUA_ENGINE_899B1E0_TYPE_GATES = 0x1;
export const LUA_ENGINE_899B1E0_IAT_LUA_TYPE = 0xb18400;
export const LUA_ENGINE_899B1E0_CHECKGET_KEY = 0xc829d7;
export const LUA_ENGINE_899B1E0_CHECKGET_INDEX = 0x1;
export const LUA_ENGINE_899B1E0_CHECKGET_DEF_ARG = 0x1;
export const LUA_ENGINE_899B1E0_CHECKGET_FIELD_OFF = 0x4;
export const LUA_ENGINE_899B1E0_CHECKGET_HELPER_VA = 0x85c590;
export const LUA_ENGINE_899B1E0_IAT_LUA_TOUSERDATA = 0xb183b0;
export const LUA_ENGINE_899B1E0_TOUSERDATA_INDEX_U32 = 0xfff0b9d7;
export const LUA_ENGINE_899B1E0_METHOD_VTABLE_FIELD_OFF = 0x0;
export const LUA_ENGINE_899B1E0_METHOD_STACK_ARGS = 0x0;
export const LUA_ENGINE_899B1E0_IAT_LUA_PUSHNIL = 0xb183e0;
export const LUA_ENGINE_899B1E0_NEWUSERDATA_SIZE = 0x8;
export const LUA_ENGINE_899B1E0_UD_VTABLE_VA = 0xb753c8;
export const LUA_ENGINE_899B1E0_UD_PTR_FIELD_OFF = 0x4;
export const LUA_ENGINE_899B1E0_REGISTRY_INDEX_U32 = 0xfff0b9d8;
export const LUA_ENGINE_899B1E0_METATABLE_RAWGETP_KEY = 0xc829d7;
export const LUA_ENGINE_899B1E0_IAT_LUA_RAWGETP = 0xb183bc;
export const LUA_ENGINE_899B1E0_IAT_LUA_SETMETATABLE = 0xb18398;
export const LUA_ENGINE_899B1E0_SETMETATABLE_INDEX_U32 = 0xfffffffe;
export const LUA_ENGINE_899B1E0_RETURN_VALUE = 0x1;
export function luaEngine899b1e0HostVa() { return LUA_ENGINE_899B1E0_VA >>> 0; }
export function luaEngine899b1e0EndVa() { return LUA_ENGINE_899B1E0_END_VA >>> 0; }
export function luaEngine899b1e0NextVa() { return LUA_ENGINE_899B1E0_NEXT_VA >>> 0; }
export function luaEngine899b1e0StackArgs() { return LUA_ENGINE_899B1E0_STACK_ARGS >>> 0; }
export function luaEngine899b1e0EcxArg() { return LUA_ENGINE_899B1E0_ECX_ARG >>> 0; }
export function luaEngine899b1e0CalleePopsStackArgs() { return LUA_ENGINE_899B1E0_CALLEE_POPS_STACK_ARGS >>> 0; }
export function luaEngine899b1e0AlignedPrologue() { return LUA_ENGINE_899B1E0_ALIGNED_PROLOGUE >>> 0; }
export function luaEngine899b1e0GateInvertedEncoding() { return LUA_ENGINE_899B1E0_GATE_INVERTED_ENCODING >>> 0; }
export function luaEngine899b1e0TypeGates() { return LUA_ENGINE_899B1E0_TYPE_GATES >>> 0; }
export function luaEngine899b1e0IatLuaType() { return LUA_ENGINE_899B1E0_IAT_LUA_TYPE >>> 0; }
export function luaEngine899b1e0CheckgetKey() { return LUA_ENGINE_899B1E0_CHECKGET_KEY >>> 0; }
export function luaEngine899b1e0CheckgetIndex() { return LUA_ENGINE_899B1E0_CHECKGET_INDEX >>> 0; }
export function luaEngine899b1e0CheckgetDefArg() { return LUA_ENGINE_899B1E0_CHECKGET_DEF_ARG >>> 0; }
export function luaEngine899b1e0CheckgetFieldOff() { return LUA_ENGINE_899B1E0_CHECKGET_FIELD_OFF >>> 0; }
export function luaEngine899b1e0CheckgetHelperVa() { return LUA_ENGINE_899B1E0_CHECKGET_HELPER_VA >>> 0; }
export function luaEngine899b1e0IatLuaTouserdata() { return LUA_ENGINE_899B1E0_IAT_LUA_TOUSERDATA >>> 0; }
export function luaEngine899b1e0TouserdataIndex() { return LUA_ENGINE_899B1E0_TOUSERDATA_INDEX_U32 >>> 0; }
export function luaEngine899b1e0MethodVtableFieldOff() { return LUA_ENGINE_899B1E0_METHOD_VTABLE_FIELD_OFF >>> 0; }
export function luaEngine899b1e0MethodStackArgs() { return LUA_ENGINE_899B1E0_METHOD_STACK_ARGS >>> 0; }
export function luaEngine899b1e0IatLuaPushnil() { return LUA_ENGINE_899B1E0_IAT_LUA_PUSHNIL >>> 0; }
export function luaEngine899b1e0NewuserdataSize() { return LUA_ENGINE_899B1E0_NEWUSERDATA_SIZE >>> 0; }
export function luaEngine899b1e0UdVtableVa() { return LUA_ENGINE_899B1E0_UD_VTABLE_VA >>> 0; }
export function luaEngine899b1e0UdPtrFieldOff() { return LUA_ENGINE_899B1E0_UD_PTR_FIELD_OFF >>> 0; }
export function luaEngine899b1e0RegistryIndex() { return LUA_ENGINE_899B1E0_REGISTRY_INDEX_U32 >>> 0; }
export function luaEngine899b1e0MetatableRawgetpKey() { return LUA_ENGINE_899B1E0_METATABLE_RAWGETP_KEY >>> 0; }
export function luaEngine899b1e0IatLuaRawgetp() { return LUA_ENGINE_899B1E0_IAT_LUA_RAWGETP >>> 0; }
export function luaEngine899b1e0IatLuaSetmetatable() { return LUA_ENGINE_899B1E0_IAT_LUA_SETMETABLE >>> 0; }
export function luaEngine899b1e0SetmetatableIndex() { return LUA_ENGINE_899B1E0_SETMETATABLE_INDEX_U32 >>> 0; }
export function luaEngine899b1e0ReturnValue() { return LUA_ENGINE_899B1E0_RETURN_VALUE >>> 0; }
/** 0x89b280 law: FULL-WORD lua_type(L,1) gate (`jne`).
 * taken <=> typeResult !== 0. */
export function luaEngine899b280Type1GateTaken(typeResult) {
  return typeResult !== 0 ? 1 : 0;
}
export const LUA_ENGINE_899B280_VA = 0x89b280;
export const LUA_ENGINE_899B280_END_VA = 0x89b302;
export const LUA_ENGINE_899B280_NEXT_VA = 0x89b310;
export const LUA_ENGINE_899B280_STACK_ARGS = 0x1;
export const LUA_ENGINE_899B280_ECX_ARG = 0x0;
export const LUA_ENGINE_899B280_CALLEE_POPS_STACK_ARGS = 0x0;
export const LUA_ENGINE_899B280_ALIGNED_PROLOGUE = 0x1;
export const LUA_ENGINE_899B280_GATE_INVERTED_ENCODING = 0x0;
export const LUA_ENGINE_899B280_TYPE_GATES = 0x1;
export const LUA_ENGINE_899B280_IAT_LUA_TYPE = 0xb18400;
export const LUA_ENGINE_899B280_CHECKGET_KEY = 0xc829d7;
export const LUA_ENGINE_899B280_CHECKGET_INDEX = 0x1;
export const LUA_ENGINE_899B280_CHECKGET_DEF_ARG = 0x0;
export const LUA_ENGINE_899B280_CHECKGET_FIELD_OFF = 0x4;
export const LUA_ENGINE_899B280_CHECKGET_HELPER_VA = 0x85c590;
export const LUA_ENGINE_899B280_IAT_LUA_TOUSERDATA = 0xb183b0;
export const LUA_ENGINE_899B280_TOUSERDATA_INDEX_U32 = 0xfff0b9d7;
export const LUA_ENGINE_899B280_METHOD_VTABLE_FIELD_OFF = 0x0;
export const LUA_ENGINE_899B280_METHOD_STACK_ARGS = 0x1;
export const LUA_ENGINE_899B280_FLOAT_LANE = 0x1;
export const LUA_ENGINE_899B280_IAT_LUA_CHECKNUMBER = 0xb18324;
export const LUA_ENGINE_899B280_CHECKNUMBER_INDEX = 0x2;
export const LUA_ENGINE_899B280_RETURN_VALUE = 0x0;
export function luaEngine899b280HostVa() { return LUA_ENGINE_899B280_VA >>> 0; }
export function luaEngine899b280EndVa() { return LUA_ENGINE_899B280_END_VA >>> 0; }
export function luaEngine899b280NextVa() { return LUA_ENGINE_899B280_NEXT_VA >>> 0; }
export function luaEngine899b280StackArgs() { return LUA_ENGINE_899B280_STACK_ARGS >>> 0; }
export function luaEngine899b280EcxArg() { return LUA_ENGINE_899B280_ECX_ARG >>> 0; }
export function luaEngine899b280CalleePopsStackArgs() { return LUA_ENGINE_899B280_CALLEE_POPS_STACK_ARGS >>> 0; }
export function luaEngine899b280AlignedPrologue() { return LUA_ENGINE_899B280_ALIGNED_PROLOGUE >>> 0; }
export function luaEngine899b280GateInvertedEncoding() { return LUA_ENGINE_899B280_GATE_INVERTED_ENCODING >>> 0; }
export function luaEngine899b280TypeGates() { return LUA_ENGINE_899B280_TYPE_GATES >>> 0; }
export function luaEngine899b280IatLuaType() { return LUA_ENGINE_899B280_IAT_LUA_TYPE >>> 0; }
export function luaEngine899b280CheckgetKey() { return LUA_ENGINE_899B280_CHECKGET_KEY >>> 0; }
export function luaEngine899b280CheckgetIndex() { return LUA_ENGINE_899B280_CHECKGET_INDEX >>> 0; }
export function luaEngine899b280CheckgetDefArg() { return LUA_ENGINE_899B280_CHECKGET_DEF_ARG >>> 0; }
export function luaEngine899b280CheckgetFieldOff() { return LUA_ENGINE_899B280_CHECKGET_FIELD_OFF >>> 0; }
export function luaEngine899b280CheckgetHelperVa() { return LUA_ENGINE_899B280_CHECKGET_HELPER_VA >>> 0; }
export function luaEngine899b280IatLuaTouserdata() { return LUA_ENGINE_899B280_IAT_LUA_TOUSERDATA >>> 0; }
export function luaEngine899b280TouserdataIndex() { return LUA_ENGINE_899B280_TOUSERDATA_INDEX_U32 >>> 0; }
export function luaEngine899b280MethodVtableFieldOff() { return LUA_ENGINE_899B280_METHOD_VTABLE_FIELD_OFF >>> 0; }
export function luaEngine899b280MethodStackArgs() { return LUA_ENGINE_899B280_METHOD_STACK_ARGS >>> 0; }
export function luaEngine899b280FloatLane() { return LUA_ENGINE_899B280_FLOAT_LANE >>> 0; }
export function luaEngine899b280IatLuaChecknumber() { return LUA_ENGINE_899B280_IAT_LUA_CHECKNUMBER >>> 0; }
export function luaEngine899b280ChecknumberIndex() { return LUA_ENGINE_899B280_CHECKNUMBER_INDEX >>> 0; }
export function luaEngine899b280ReturnValue() { return LUA_ENGINE_899B280_RETURN_VALUE >>> 0; }
/** ==== ABI v96: wrapper-band continuation — 0x0089b310
 * (float-pusher getter; completes the census slot-105 pair with the
 * v95 0x89b280 setter). ====
 *
 * 0x89b310..0x89b378 (pad to 0x89b380) — FLOAT-PUSHER GETTER (v86
 * 0x89a700 shape, key band 0xc829d7 slot 105): plain ebp prologue
 * with a `push ecx` 4-byte local slot, full-word lua_type(L,1)
 * `jne` (nil -> obj 0), check/get(key 0xc829d7, idx 1, DEF 1) ->
 * obj=[obj+4], touserdata(upvalueindex 1), vtable spilled through
 * [ebp-4] and called thiscall this=obj (0 stack args); f32 result
 * fstp -> [ebp-4] -> movss xmm1; host pushNumber 0x85c050(ecx=L,
 * xmm1); ret 1. Zero-resync on exact span (39 insns).
 *
 * NEXT frontier 0x89b380: UNLANDED multi-vector math body (aligned
 * `and esp,-0x10` / sub esp,0x78 frame, PRE-GATE touserdata,
 * checknumber(L,5), IAT 0xb183e8 name unresolved, Vector key
 * 0xc82980 idx-3 + wrap-key 0xc8297a idx-2 gates, wrap ctor
 * 0x8baa50, sret method with float-component pushes, box key
 * 0xc829d7). Deferred: needs its own unit for exact pin modeling —
 * rushing it is the v93 corruption failure mode.
 */
/** 0x89b310 law: FULL-WORD lua_type(L,1) gate (`jne`).
 * taken <=> typeResult !== 0. */
export function luaEngine899b310Type1GateTaken(typeResult) {
  return typeResult !== 0 ? 1 : 0;
}
export const LUA_ENGINE_899B310_VA = 0x89b310;
export const LUA_ENGINE_899B310_END_VA = 0x89b379;
export const LUA_ENGINE_899B310_NEXT_VA = 0x89b380;
export const LUA_ENGINE_899B310_STACK_ARGS = 0x1;
export const LUA_ENGINE_899B310_ECX_ARG = 0x0;
export const LUA_ENGINE_899B310_CALLEE_POPS_STACK_ARGS = 0x0;
export const LUA_ENGINE_899B310_ALIGNED_PROLOGUE = 0x0;
export const LUA_ENGINE_899B310_GATE_INVERTED_ENCODING = 0x0;
export const LUA_ENGINE_899B310_TYPE_GATES = 0x1;
export const LUA_ENGINE_899B310_IAT_LUA_TYPE = 0xb18400;
export const LUA_ENGINE_899B310_CHECKGET_KEY = 0xc829d7;
export const LUA_ENGINE_899B310_CHECKGET_INDEX = 0x1;
export const LUA_ENGINE_899B310_CHECKGET_DEF_ARG = 0x1;
export const LUA_ENGINE_899B310_CHECKGET_FIELD_OFF = 0x4;
export const LUA_ENGINE_899B310_CHECKGET_HELPER_VA = 0x85c590;
export const LUA_ENGINE_899B310_IAT_LUA_TOUSERDATA = 0xb183b0;
export const LUA_ENGINE_899B310_TOUSERDATA_INDEX_U32 = 0xfff0b9d7;
export const LUA_ENGINE_899B310_METHOD_VTABLE_FIELD_OFF = 0x0;
export const LUA_ENGINE_899B310_METHOD_STACK_ARGS = 0x0;
export const LUA_ENGINE_899B310_FLOAT_LANE = 0x1;
export const LUA_ENGINE_899B310_FLOAT_PUSHER_HELPER_VA = 0x85c050;
export const LUA_ENGINE_899B310_RETURN_VALUE = 0x1;
export function luaEngine899b310HostVa() { return LUA_ENGINE_899B310_VA >>> 0; }
export function luaEngine899b310EndVa() { return LUA_ENGINE_899B310_END_VA >>> 0; }
export function luaEngine899b310NextVa() { return LUA_ENGINE_899B310_NEXT_VA >>> 0; }
export function luaEngine899b310StackArgs() { return LUA_ENGINE_899B310_STACK_ARGS >>> 0; }
export function luaEngine899b310EcxArg() { return LUA_ENGINE_899B310_ECX_ARG >>> 0; }
export function luaEngine899b310CalleePopsStackArgs() { return LUA_ENGINE_899B310_CALLEE_POPS_STACK_ARGS >>> 0; }
export function luaEngine899b310AlignedPrologue() { return LUA_ENGINE_899B310_ALIGNED_PROLOGUE >>> 0; }
export function luaEngine899b310GateInvertedEncoding() { return LUA_ENGINE_899B310_GATE_INVERTED_ENCODING >>> 0; }
export function luaEngine899b310TypeGates() { return LUA_ENGINE_899B310_TYPE_GATES >>> 0; }
export function luaEngine899b310IatLuaType() { return LUA_ENGINE_899B310_IAT_LUA_TYPE >>> 0; }
export function luaEngine899b310CheckgetKey() { return LUA_ENGINE_899B310_CHECKGET_KEY >>> 0; }
export function luaEngine899b310CheckgetIndex() { return LUA_ENGINE_899B310_CHECKGET_INDEX >>> 0; }
export function luaEngine899b310CheckgetDefArg() { return LUA_ENGINE_899B310_CHECKGET_DEF_ARG >>> 0; }
export function luaEngine899b310CheckgetFieldOff() { return LUA_ENGINE_899B310_CHECKGET_FIELD_OFF >>> 0; }
export function luaEngine899b310CheckgetHelperVa() { return LUA_ENGINE_899B310_CHECKGET_HELPER_VA >>> 0; }
export function luaEngine899b310IatLuaTouserdata() { return LUA_ENGINE_899B310_IAT_LUA_TOUSERDATA >>> 0; }
export function luaEngine899b310TouserdataIndex() { return LUA_ENGINE_899B310_TOUSERDATA_INDEX_U32 >>> 0; }
export function luaEngine899b310MethodVtableFieldOff() { return LUA_ENGINE_899B310_METHOD_VTABLE_FIELD_OFF >>> 0; }
export function luaEngine899b310MethodStackArgs() { return LUA_ENGINE_899B310_METHOD_STACK_ARGS >>> 0; }
export function luaEngine899b310FloatLane() { return LUA_ENGINE_899B310_FLOAT_LANE >>> 0; }
export function luaEngine899b310FloatPusherHelperVa() { return LUA_ENGINE_899B310_FLOAT_PUSHER_HELPER_VA >>> 0; }
export function luaEngine899b310ReturnValue() { return LUA_ENGINE_899B310_RETURN_VALUE >>> 0; }
/** ==== ABI v97: wrapper-band continuation — 0x0089b380
 * (multi-vector math body, full pin set). ====
 *
 * 0x89b380..0x89b532 (pad to 0x89b540; census walk gap row like the
 * 0x89b1e0 twin) — VECTOR-MATH SETTER-BOX:
 * aligned prologue (`and esp,-0x10` — 0xf0, not the band's usual
 * -8; sub esp,0x78), PRE-GATE touserdata(upvalueindex 1) (ud payload
 * +0 is a FN POINTER here, not a vtable), luaL_checknumber(L,5)
 * IAT 0xb18324 -> f32 arg5, lua_toboolean(L,4) IAT 0xb183e8 ->
 * `setne` byte bool(arg4); lua_type IAT pointer 0xb18400 loaded ONCE
 * into edi and called twice.
 * Gate A: lua_type(L,3) `test/je` INVERTED encoding (nil skips
 * fetch): check/get(key 0xc82980 Vector slot, idx 3, DEF 1) ->
 * vec2 = {[obj],[obj+4]}.
 * Gate B: lua_type(L,2) `test/jne` non-inverted: check/get(key
 * 0xc8297a wrap key, idx 2, def 0) -> obj2=[obj+4].
 * Stack struct {obj2, vec2, bool4, f32-arg5} -> wrap ctor 0x8baa50
 * (known v39 host helper) -> packed floats re-read.
 * Method dispatch: fnptr = [ud+0] loaded to ecx, CALLED DIRECTLY
 * (`call ecx`) — NOT a vtable slot. Caller-cleanup 0x18 = 6 stack
 * args: sret out-ptr, obj2, and 4 float components split from xmm1
 * (movups pack {vec2.x, vec2.y, bool-bits, f32} via shufps ff /
 * psrldq 8 / psrldq 4 / movd pushes).
 * Null sret result -> lua_pushnil(IAT 0xb183e0), ret 1; else box
 * newuserdata(8) {vtable 0xb753c8, ptr +4} + rawgetp(registry
 * 0xfff0b9d8, key 0xc829d7) IAT 0xb183bc + setmetatable(-2)
 * IAT 0xb18398, ret 1.
 * Zero-resync on exact span 0x1b3 bytes (131 insns). IAT names
 * resolved from PE import directory (Lua5.3.3r.dll):
 * 0xb183e8=lua_toboolean.
 */
/** 0x89b380 law: gate A truth table — lua_type(L,3) result != 0
 * takes the fetch path regardless of je encoding. */
export function luaEngine899b380Type3GateTaken(typeResult) {
  return typeResult !== 0 ? 1 : 0;
}
/** 0x89b380 law: gate B truth table — lua_type(L,2) result != 0
 * takes the wrap-fetch path (`jne`). */
export function luaEngine899b380Type2GateTaken(typeResult) {
  return typeResult !== 0 ? 1 : 0;
}
export const LUA_ENGINE_899B380_VA = 0x89b380;
export const LUA_ENGINE_899B380_END_VA = 0x89b533;
export const LUA_ENGINE_899B380_NEXT_VA = 0x89b540;
export const LUA_ENGINE_899B380_STACK_ARGS = 0x1;
export const LUA_ENGINE_899B380_ECX_ARG = 0x0;
export const LUA_ENGINE_899B380_CALLEE_POPS_STACK_ARGS = 0x0;
export const LUA_ENGINE_899B380_ALIGNED_PROLOGUE = 0x1;
export const LUA_ENGINE_899B380_ALIGN_MASK = 0xfffffff0;
export const LUA_ENGINE_899B380_PRE_GATE_TOUSERDATA = 0x1;
export const LUA_ENGINE_899B380_IAT_LUA_TOUSERDATA = 0xb183b0;
export const LUA_ENGINE_899B380_TOUSERDATA_INDEX_U32 = 0xfff0b9d7;
export const LUA_ENGINE_899B380_UD_FN_POINTER_CALL = 0x1;
export const LUA_ENGINE_899B380_TYPE_GATES = 0x2;
export const LUA_ENGINE_899B380_IAT_LUA_TYPE = 0xb18400;
export const LUA_ENGINE_899B380_TYPE_IAT_VIA_REGISTER = 0x1;
export const LUA_ENGINE_899B380_ARG3_GATE_INVERTED_ENCODING = 0x1;
export const LUA_ENGINE_899B380_ARG2_GATE_INVERTED_ENCODING = 0x0;
export const LUA_ENGINE_899B380_IAT_LUA_CHECKNUMBER = 0xb18324;
export const LUA_ENGINE_899B380_CHECKNUMBER_INDEX = 0x5;
export const LUA_ENGINE_899B380_IAT_LUA_TOBOOLEAN = 0xb183e8;
export const LUA_ENGINE_899B380_TOBOOLEAN_INDEX = 0x4;
export const LUA_ENGINE_899B380_VECTOR_CHECKGET_KEY = 0xc82980;
export const LUA_ENGINE_899B380_VECTOR_CHECKGET_INDEX = 0x3;
export const LUA_ENGINE_899B380_VECTOR_CHECKGET_DEF_ARG = 0x1;
export const LUA_ENGINE_899B380_WRAP_CHECKGET_KEY = 0xc8297a;
export const LUA_ENGINE_899B380_WRAP_CHECKGET_INDEX = 0x2;
export const LUA_ENGINE_899B380_WRAP_CHECKGET_DEF_ARG = 0x0;
export const LUA_ENGINE_899B380_CHECKGET_FIELD_OFF = 0x4;
export const LUA_ENGINE_899B380_CHECKGET_HELPER_VA = 0x85c590;
export const LUA_ENGINE_899B380_WRAP_CTOR_VA = 0x8baa50;
export const LUA_ENGINE_899B380_METHOD_STACK_ARGS = 0x6;
export const LUA_ENGINE_899B380_METHOD_SRET_OUT = 0x1;
export const LUA_ENGINE_899B380_METHOD_FLOAT_COMPONENTS = 0x4;
export const LUA_ENGINE_899B380_METHOD_CALLER_CLEANUP = 0x18;
export const LUA_ENGINE_899B380_IAT_LUA_PUSHNIL = 0xb183e0;
export const LUA_ENGINE_899B380_NEWUSERDATA_SIZE = 0x8;
export const LUA_ENGINE_899B380_UD_VTABLE_VA = 0xb753c8;
export const LUA_ENGINE_899B380_UD_PTR_FIELD_OFF = 0x4;
export const LUA_ENGINE_899B380_REGISTRY_INDEX_U32 = 0xfff0b9d8;
export const LUA_ENGINE_899B380_METATABLE_RAWGETP_KEY = 0xc829d7;
export const LUA_ENGINE_899B380_IAT_LUA_RAWGETP = 0xb183bc;
export const LUA_ENGINE_899B380_IAT_LUA_SETMETATABLE = 0xb18398;
export const LUA_ENGINE_899B380_SETMETATABLE_INDEX_U32 = 0xfffffffe;
export const LUA_ENGINE_899B380_RETURN_VALUE = 0x1;
export function luaEngine899b380HostVa() { return LUA_ENGINE_899B380_VA >>> 0; }
export function luaEngine899b380EndVa() { return LUA_ENGINE_899B380_END_VA >>> 0; }
export function luaEngine899b380NextVa() { return LUA_ENGINE_899B380_NEXT_VA >>> 0; }
export function luaEngine899b380StackArgs() { return LUA_ENGINE_899B380_STACK_ARGS >>> 0; }
export function luaEngine899b380EcxArg() { return LUA_ENGINE_899B380_ECX_ARG >>> 0; }
export function luaEngine899b380CalleePopsStackArgs() { return LUA_ENGINE_899B380_CALLEE_POPS_STACK_ARGS >>> 0; }
export function luaEngine899b380AlignedPrologue() { return LUA_ENGINE_899B380_ALIGNED_PROLOGUE >>> 0; }
export function luaEngine899b380AlignMask() { return LUA_ENGINE_899B380_ALIGN_MASK >>> 0; }
export function luaEngine899b380PreGateTouserdata() { return LUA_ENGINE_899B380_PRE_GATE_TOUSERDATA >>> 0; }
export function luaEngine899b380IatLuaTouserdata() { return LUA_ENGINE_899B380_IAT_LUA_TOUSERDATA >>> 0; }
export function luaEngine899b380TouserdataIndex() { return LUA_ENGINE_899B380_TOUSERDATA_INDEX_U32 >>> 0; }
export function luaEngine899b380UdFnPointerCall() { return LUA_ENGINE_899B380_UD_FN_POINTER_CALL >>> 0; }
export function luaEngine899b380TypeGates() { return LUA_ENGINE_899B380_TYPE_GATES >>> 0; }
export function luaEngine899b380IatLuaType() { return LUA_ENGINE_899B380_IAT_LUA_TYPE >>> 0; }
export function luaEngine899b380TypeIatViaRegister() { return LUA_ENGINE_899B380_TYPE_IAT_VIA_REGISTER >>> 0; }
export function luaEngine899b380Arg3GateInvertedEncoding() { return LUA_ENGINE_899B380_ARG3_GATE_INVERTED_ENCODING >>> 0; }
export function luaEngine899b380Arg2GateInvertedEncoding() { return LUA_ENGINE_899B380_ARG2_GATE_INVERTED_ENCODING >>> 0; }
export function luaEngine899b380IatLuaChecknumber() { return LUA_ENGINE_899B380_IAT_LUA_CHECKNUMBER >>> 0; }
export function luaEngine899b380ChecknumberIndex() { return LUA_ENGINE_899B380_CHECKNUMBER_INDEX >>> 0; }
export function luaEngine899b380IatLuaToboolean() { return LUA_ENGINE_899B380_IAT_LUA_TOBOOLEAN >>> 0; }
export function luaEngine899b380TobooleanIndex() { return LUA_ENGINE_899B380_TOBOOLEAN_INDEX >>> 0; }
export function luaEngine899b380VectorCheckgetKey() { return LUA_ENGINE_899B380_VECTOR_CHECKGET_KEY >>> 0; }
export function luaEngine899b380VectorCheckgetIndex() { return LUA_ENGINE_899B380_VECTOR_CHECKGET_INDEX >>> 0; }
export function luaEngine899b380VectorCheckgetDefArg() { return LUA_ENGINE_899B380_VECTOR_CHECKGET_DEF_ARG >>> 0; }
export function luaEngine899b380WrapCheckgetKey() { return LUA_ENGINE_899B380_WRAP_CHECKGET_KEY >>> 0; }
export function luaEngine899b380WrapCheckgetIndex() { return LUA_ENGINE_899B380_WRAP_CHECKGET_INDEX >>> 0; }
export function luaEngine899b380WrapCheckgetDefArg() { return LUA_ENGINE_899B380_WRAP_CHECKGET_DEF_ARG >>> 0; }
export function luaEngine899b380CheckgetFieldOff() { return LUA_ENGINE_899B380_CHECKGET_FIELD_OFF >>> 0; }
export function luaEngine899b380CheckgetHelperVa() { return LUA_ENGINE_899B380_CHECKGET_HELPER_VA >>> 0; }
export function luaEngine899b380WrapCtorVa() { return LUA_ENGINE_899B380_WRAP_CTOR_VA >>> 0; }
export function luaEngine899b380MethodStackArgs() { return LUA_ENGINE_899B380_METHOD_STACK_ARGS >>> 0; }
export function luaEngine899b380MethodSretOut() { return LUA_ENGINE_899B380_METHOD_SRET_OUT >>> 0; }
export function luaEngine899b380MethodFloatComponents() { return LUA_ENGINE_899B380_METHOD_FLOAT_COMPONENTS >>> 0; }
export function luaEngine899b380MethodCallerCleanup() { return LUA_ENGINE_899B380_METHOD_CALLER_CLEANUP >>> 0; }
export function luaEngine899b380IatLuaPushnil() { return LUA_ENGINE_899B380_IAT_LUA_PUSHNIL >>> 0; }
export function luaEngine899b380NewuserdataSize() { return LUA_ENGINE_899B380_NEWUSERDATA_SIZE >>> 0; }
export function luaEngine899b380UdVtableVa() { return LUA_ENGINE_899B380_UD_VTABLE_VA >>> 0; }
export function luaEngine899b380UdPtrFieldOff() { return LUA_ENGINE_899B380_UD_PTR_FIELD_OFF >>> 0; }
export function luaEngine899b380RegistryIndex() { return LUA_ENGINE_899B380_REGISTRY_INDEX_U32 >>> 0; }
export function luaEngine899b380MetatableRawgetpKey() { return LUA_ENGINE_899B380_METATABLE_RAWGETP_KEY >>> 0; }
export function luaEngine899b380IatLuaRawgetp() { return LUA_ENGINE_899B380_IAT_LUA_RAWGETP >>> 0; }
export function luaEngine899b380IatLuaSetmetatable() { return LUA_ENGINE_899B380_IAT_LUA_SETMETATABLE >>> 0; }
export function luaEngine899b380SetmetatableIndex() { return LUA_ENGINE_899B380_SETMETATABLE_INDEX_U32 >>> 0; }
export function luaEngine899b380ReturnValue() { return LUA_ENGINE_899B380_RETURN_VALUE >>> 0; }
/** ==== ABI v98: wrapper-band continuation — 0x0089b540 /
 * 0x0089b5b0 (census rows resume: key 0xc829d7 slot 104 pair,
 * ordinals 11/12 — boolean setter + pushboolean getter). ====
 *
 * 0x89b540..0x89b5a8 (pad to 0x89b5b0) — BOOLEAN SETTER: plain ebp
 * prologue with `push ecx` local slot ([ebp-4]); full-word
 * lua_type(L,1) `jne` (nil -> obj 0); check/get(key 0xc829d7,
 * idx 1, def 0) -> obj=[obj+4]; touserdata(upvalueindex 1);
 * lua_toboolean(L,2) IAT 0xb183e8 -> `setne byte [ebp-4]` bool;
 * method FN PTR [ud+0] called directly with this=obj and ONE stack
 * arg (the pushed bool byte); xor eax,eax; ret 0. Zero-resync exact
 * span (43 insns).
 *
 * 0x89b5b0..0x89b614 (pad to 0x89b620) — PUSHBOOLEAN GETTER: plain
 * prologue; same full-word gate (nil -> obj 0); check/get(key
 * 0xc829d7, idx 1, DEF 1) -> obj=[obj+4]; touserdata(upvalueindex
 * 1); method fn ptr [ud+0] called directly this=obj (0 stack args);
 * result gated on the LOW BYTE (`test al,al; setne cl`);
 * lua_pushboolean(L, bool) IAT 0xb183ec (name resolved from PE
 * import directory, Lua5.3.3r.dll); ret 1. Zero-resync exact span
 * (39 insns).
 *
 * NEXT frontier 0x89b620.
 */
/** 0x89b540 law: FULL-WORD lua_type(L,1) gate (`jne`).
 * taken <=> typeResult !== 0. */
export function luaEngine899b540Type1GateTaken(typeResult) {
  return typeResult !== 0 ? 1 : 0;
}
export const LUA_ENGINE_899B540_VA = 0x89b540;
export const LUA_ENGINE_899B540_END_VA = 0x89b5a9;
export const LUA_ENGINE_899B540_NEXT_VA = 0x89b5b0;
export const LUA_ENGINE_899B540_STACK_ARGS = 0x1;
export const LUA_ENGINE_899B540_ECX_ARG = 0x0;
export const LUA_ENGINE_899B540_CALLEE_POPS_STACK_ARGS = 0x0;
export const LUA_ENGINE_899B540_ALIGNED_PROLOGUE = 0x0;
export const LUA_ENGINE_899B540_GATE_INVERTED_ENCODING = 0x0;
export const LUA_ENGINE_899B540_TYPE_GATES = 0x1;
export const LUA_ENGINE_899B540_IAT_LUA_TYPE = 0xb18400;
export const LUA_ENGINE_899B540_CHECKGET_KEY = 0xc829d7;
export const LUA_ENGINE_899B540_CHECKGET_INDEX = 0x1;
export const LUA_ENGINE_899B540_CHECKGET_DEF_ARG = 0x0;
export const LUA_ENGINE_899B540_CHECKGET_FIELD_OFF = 0x4;
export const LUA_ENGINE_899B540_CHECKGET_HELPER_VA = 0x85c590;
export const LUA_ENGINE_899B540_IAT_LUA_TOUSERDATA = 0xb183b0;
export const LUA_ENGINE_899B540_TOUSERDATA_INDEX_U32 = 0xfff0b9d7;
export const LUA_ENGINE_899B540_UD_FN_POINTER_CALL = 0x1;
export const LUA_ENGINE_899B540_METHOD_STACK_ARGS = 0x1;
export const LUA_ENGINE_899B540_IAT_LUA_TOBOOLEAN = 0xb183e8;
export const LUA_ENGINE_899B540_TOBOOLEAN_INDEX = 0x2;
export const LUA_ENGINE_899B540_BOOL_ARG_SETNE = 0x1;
export const LUA_ENGINE_899B540_RETURN_VALUE = 0x0;
export function luaEngine899b540HostVa() { return LUA_ENGINE_899B540_VA >>> 0; }
export function luaEngine899b540EndVa() { return LUA_ENGINE_899B540_END_VA >>> 0; }
export function luaEngine899b540NextVa() { return LUA_ENGINE_899B540_NEXT_VA >>> 0; }
export function luaEngine899b540StackArgs() { return LUA_ENGINE_899B540_STACK_ARGS >>> 0; }
export function luaEngine899b540EcxArg() { return LUA_ENGINE_899B540_ECX_ARG >>> 0; }
export function luaEngine899b540CalleePopsStackArgs() { return LUA_ENGINE_899B540_CALLEE_POPS_STACK_ARGS >>> 0; }
export function luaEngine899b540AlignedPrologue() { return LUA_ENGINE_899B540_ALIGNED_PROLOGUE >>> 0; }
export function luaEngine899b540GateInvertedEncoding() { return LUA_ENGINE_899B540_GATE_INVERTED_ENCODING >>> 0; }
export function luaEngine899b540TypeGates() { return LUA_ENGINE_899B540_TYPE_GATES >>> 0; }
export function luaEngine899b540IatLuaType() { return LUA_ENGINE_899B540_IAT_LUA_TYPE >>> 0; }
export function luaEngine899b540CheckgetKey() { return LUA_ENGINE_899B540_CHECKGET_KEY >>> 0; }
export function luaEngine899b540CheckgetIndex() { return LUA_ENGINE_899B540_CHECKGET_INDEX >>> 0; }
export function luaEngine899b540CheckgetDefArg() { return LUA_ENGINE_899B540_CHECKGET_DEF_ARG >>> 0; }
export function luaEngine899b540CheckgetFieldOff() { return LUA_ENGINE_899B540_CHECKGET_FIELD_OFF >>> 0; }
export function luaEngine899b540CheckgetHelperVa() { return LUA_ENGINE_899B540_CHECKGET_HELPER_VA >>> 0; }
export function luaEngine899b540IatLuaTouserdata() { return LUA_ENGINE_899B540_IAT_LUA_TOUSERDATA >>> 0; }
export function luaEngine899b540TouserdataIndex() { return LUA_ENGINE_899B540_TOUSERDATA_INDEX_U32 >>> 0; }
export function luaEngine899b540UdFnPointerCall() { return LUA_ENGINE_899B540_UD_FN_POINTER_CALL >>> 0; }
export function luaEngine899b540MethodStackArgs() { return LUA_ENGINE_899B540_METHOD_STACK_ARGS >>> 0; }
export function luaEngine899b540IatLuaToboolean() { return LUA_ENGINE_899B540_IAT_LUA_TOBOOLEAN >>> 0; }
export function luaEngine899b540TobooleanIndex() { return LUA_ENGINE_899B540_TOBOOLEAN_INDEX >>> 0; }
export function luaEngine899b540BoolArgSetne() { return LUA_ENGINE_899B540_BOOL_ARG_SETNE >>> 0; }
export function luaEngine899b540ReturnValue() { return LUA_ENGINE_899B540_RETURN_VALUE >>> 0; }
/** 0x89b5b0 law: FULL-WORD lua_type(L,1) gate (`jne`).
 * taken <=> typeResult !== 0. */
export function luaEngine899b5b0Type1GateTaken(typeResult) {
  return typeResult !== 0 ? 1 : 0;
}
export const LUA_ENGINE_899B5B0_VA = 0x89b5b0;
export const LUA_ENGINE_899B5B0_END_VA = 0x89b615;
export const LUA_ENGINE_899B5B0_NEXT_VA = 0x89b620;
export const LUA_ENGINE_899B5B0_STACK_ARGS = 0x1;
export const LUA_ENGINE_899B5B0_ECX_ARG = 0x0;
export const LUA_ENGINE_899B5B0_CALLEE_POPS_STACK_ARGS = 0x0;
export const LUA_ENGINE_899B5B0_ALIGNED_PROLOGUE = 0x0;
export const LUA_ENGINE_899B5B0_GATE_INVERTED_ENCODING = 0x0;
export const LUA_ENGINE_899B5B0_TYPE_GATES = 0x1;
export const LUA_ENGINE_899B5B0_IAT_LUA_TYPE = 0xb18400;
export const LUA_ENGINE_899B5B0_CHECKGET_KEY = 0xc829d7;
export const LUA_ENGINE_899B5B0_CHECKGET_INDEX = 0x1;
export const LUA_ENGINE_899B5B0_CHECKGET_DEF_ARG = 0x1;
export const LUA_ENGINE_899B5B0_CHECKGET_FIELD_OFF = 0x4;
export const LUA_ENGINE_899B5B0_CHECKGET_HELPER_VA = 0x85c590;
export const LUA_ENGINE_899B5B0_IAT_LUA_TOUSERDATA = 0xb183b0;
export const LUA_ENGINE_899B5B0_TOUSERDATA_INDEX_U32 = 0xfff0b9d7;
export const LUA_ENGINE_899B5B0_UD_FN_POINTER_CALL = 0x1;
export const LUA_ENGINE_899B5B0_METHOD_STACK_ARGS = 0x0;
export const LUA_ENGINE_899B5B0_METHOD_RESULT_LOW_BYTE_GATE = 0x1;
export const LUA_ENGINE_899B5B0_IAT_LUA_PUSHBOOLEAN = 0xb183ec;
export const LUA_ENGINE_899B5B0_RETURN_VALUE = 0x1;
export function luaEngine899b5b0HostVa() { return LUA_ENGINE_899B5B0_VA >>> 0; }
export function luaEngine899b5b0EndVa() { return LUA_ENGINE_899B5B0_END_VA >>> 0; }
export function luaEngine899b5b0NextVa() { return LUA_ENGINE_899B5B0_NEXT_VA >>> 0; }
export function luaEngine899b5b0StackArgs() { return LUA_ENGINE_899B5B0_STACK_ARGS >>> 0; }
export function luaEngine899b5b0EcxArg() { return LUA_ENGINE_899B5B0_ECX_ARG >>> 0; }
export function luaEngine899b5b0CalleePopsStackArgs() { return LUA_ENGINE_899B5B0_CALLEE_POPS_STACK_ARGS >>> 0; }
export function luaEngine899b5b0AlignedPrologue() { return LUA_ENGINE_899B5B0_ALIGNED_PROLOGUE >>> 0; }
export function luaEngine899b5b0GateInvertedEncoding() { return LUA_ENGINE_899B5B0_GATE_INVERTED_ENCODING >>> 0; }
export function luaEngine899b5b0TypeGates() { return LUA_ENGINE_899B5B0_TYPE_GATES >>> 0; }
export function luaEngine899b5b0IatLuaType() { return LUA_ENGINE_899B5B0_IAT_LUA_TYPE >>> 0; }
export function luaEngine899b5b0CheckgetKey() { return LUA_ENGINE_899B5B0_CHECKGET_KEY >>> 0; }
export function luaEngine899b5b0CheckgetIndex() { return LUA_ENGINE_899B5B0_CHECKGET_INDEX >>> 0; }
export function luaEngine899b5b0CheckgetDefArg() { return LUA_ENGINE_899B5B0_CHECKGET_DEF_ARG >>> 0; }
export function luaEngine899b5b0CheckgetFieldOff() { return LUA_ENGINE_899B5B0_CHECKGET_FIELD_OFF >>> 0; }
export function luaEngine899b5b0CheckgetHelperVa() { return LUA_ENGINE_899B5B0_CHECKGET_HELPER_VA >>> 0; }
export function luaEngine899b5b0IatLuaTouserdata() { return LUA_ENGINE_899B5B0_IAT_LUA_TOUSERDATA >>> 0; }
export function luaEngine899b5b0TouserdataIndex() { return LUA_ENGINE_899B5B0_TOUSERDATA_INDEX_U32 >>> 0; }
export function luaEngine899b5b0UdFnPointerCall() { return LUA_ENGINE_899B5B0_UD_FN_POINTER_CALL >>> 0; }
export function luaEngine899b5b0MethodStackArgs() { return LUA_ENGINE_899B5B0_METHOD_STACK_ARGS >>> 0; }
export function luaEngine899b5b0MethodResultLowByteGate() { return LUA_ENGINE_899B5B0_METHOD_RESULT_LOW_BYTE_GATE >>> 0; }
export function luaEngine899b5b0IatLuaPushboolean() { return LUA_ENGINE_899B5B0_IAT_LUA_PUSHBOOLEAN >>> 0; }
export function luaEngine899b5b0ReturnValue() { return LUA_ENGINE_899B5B0_RETURN_VALUE >>> 0; }
/** ==== ABI v99: wrapper-band continuation — 0x0089b620 /
 * 0x0089b690 (census key band moves to 0xc829d4, slot 103 pair,
 * ordinals 42/43 — int64 setter + int64 getter). ====
 *
 * 0x89b620..0x89b68c (pad to 0x89b690) — INT64 SETTER: aligned
 * prologue (`and esp,-8`, sub esp,8); full-word lua_type(L,1)
 * `jne` (nil -> val slot 0); check/get(key 0xc829d4, idx 1,
 * def 0) -> val=[obj+4]; touserdata(upvalueindex 1);
 * luaL_checkinteger(L,2) IAT 0xb183f4 -> int64 edx:eax;
 * method FN PTR [ud+0] called directly with this=val and a TWO-dword
 * stack arg pair {lo=eax, hi=edx}; xor eax,eax; ret 0. Zero-resync
 * exact span (42 insns).
 *
 * 0x89b690..0x89b6ee (pad to 0x89b6f0) — INT64 GETTER: plain
 * prologue; same full-word gate (nil -> obj 0); check/get(key
 * 0xc829d4, idx 1, DEF 1) -> obj=[obj+4]; touserdata(upvalueindex
 * 1); method fn ptr [ud+0] called directly this=obj (0 stack args),
 * int64 return in edx:eax; host i64 pusher 0x85c030(ecx=L, pushes
 * lo/hi as one lua_Integer); ret 1. Zero-resync exact span (38
 * insns). IAT names resolved from PE import directory:
 * 0xb183f4=luaL_checkinteger.
 *
 * NEXT frontier 0x89b6f0.
 */
/** 0x89b620 law: FULL-WORD lua_type(L,1) gate (`jne`).
 * taken <=> typeResult !== 0. */
export function luaEngine899b620Type1GateTaken(typeResult) {
  return typeResult !== 0 ? 1 : 0;
}
export const LUA_ENGINE_899B620_VA = 0x89b620;
export const LUA_ENGINE_899B620_END_VA = 0x89b68d;
export const LUA_ENGINE_899B620_NEXT_VA = 0x89b690;
export const LUA_ENGINE_899B620_STACK_ARGS = 0x1;
export const LUA_ENGINE_899B620_ECX_ARG = 0x0;
export const LUA_ENGINE_899B620_CALLEE_POPS_STACK_ARGS = 0x0;
export const LUA_ENGINE_899B620_ALIGNED_PROLOGUE = 0x1;
export const LUA_ENGINE_899B620_GATE_INVERTED_ENCODING = 0x0;
export const LUA_ENGINE_899B620_TYPE_GATES = 0x1;
export const LUA_ENGINE_899B620_IAT_LUA_TYPE = 0xb18400;
export const LUA_ENGINE_899B620_CHECKGET_KEY = 0xc829d4;
export const LUA_ENGINE_899B620_CHECKGET_INDEX = 0x1;
export const LUA_ENGINE_899B620_CHECKGET_DEF_ARG = 0x0;
export const LUA_ENGINE_899B620_CHECKGET_FIELD_OFF = 0x4;
export const LUA_ENGINE_899B620_CHECKGET_HELPER_VA = 0x85c590;
export const LUA_ENGINE_899B620_IAT_LUA_TOUSERDATA = 0xb183b0;
export const LUA_ENGINE_899B620_TOUSERDATA_INDEX_U32 = 0xfff0b9d7;
export const LUA_ENGINE_899B620_UD_FN_POINTER_CALL = 0x1;
export const LUA_ENGINE_899B620_METHOD_STACK_ARGS = 0x2;
export const LUA_ENGINE_899B620_METHOD_I64_ARG = 0x1;
export const LUA_ENGINE_899B620_IAT_LUAL_CHECKINTEGER = 0xb183f4;
export const LUA_ENGINE_899B620_CHECKINTEGER_INDEX = 0x2;
export const LUA_ENGINE_899B620_RETURN_VALUE = 0x0;
export function luaEngine899b620HostVa() { return LUA_ENGINE_899B620_VA >>> 0; }
export function luaEngine899b620EndVa() { return LUA_ENGINE_899B620_END_VA >>> 0; }
export function luaEngine899b620NextVa() { return LUA_ENGINE_899B620_NEXT_VA >>> 0; }
export function luaEngine899b620StackArgs() { return LUA_ENGINE_899B620_STACK_ARGS >>> 0; }
export function luaEngine899b620EcxArg() { return LUA_ENGINE_899B620_ECX_ARG >>> 0; }
export function luaEngine899b620CalleePopsStackArgs() { return LUA_ENGINE_899B620_CALLEE_POPS_STACK_ARGS >>> 0; }
export function luaEngine899b620AlignedPrologue() { return LUA_ENGINE_899B620_ALIGNED_PROLOGUE >>> 0; }
export function luaEngine899b620GateInvertedEncoding() { return LUA_ENGINE_899B620_GATE_INVERTED_ENCODING >>> 0; }
export function luaEngine899b620TypeGates() { return LUA_ENGINE_899B620_TYPE_GATES >>> 0; }
export function luaEngine899b620IatLuaType() { return LUA_ENGINE_899B620_IAT_LUA_TYPE >>> 0; }
export function luaEngine899b620CheckgetKey() { return LUA_ENGINE_899B620_CHECKGET_KEY >>> 0; }
export function luaEngine899b620CheckgetIndex() { return LUA_ENGINE_899B620_CHECKGET_INDEX >>> 0; }
export function luaEngine899b620CheckgetDefArg() { return LUA_ENGINE_899B620_CHECKGET_DEF_ARG >>> 0; }
export function luaEngine899b620CheckgetFieldOff() { return LUA_ENGINE_899B620_CHECKGET_FIELD_OFF >>> 0; }
export function luaEngine899b620CheckgetHelperVa() { return LUA_ENGINE_899B620_CHECKGET_HELPER_VA >>> 0; }
export function luaEngine899b620IatLuaTouserdata() { return LUA_ENGINE_899B620_IAT_LUA_TOUSERDATA >>> 0; }
export function luaEngine899b620TouserdataIndex() { return LUA_ENGINE_899B620_TOUSERDATA_INDEX_U32 >>> 0; }
export function luaEngine899b620UdFnPointerCall() { return LUA_ENGINE_899B620_UD_FN_POINTER_CALL >>> 0; }
export function luaEngine899b620MethodStackArgs() { return LUA_ENGINE_899B620_METHOD_STACK_ARGS >>> 0; }
export function luaEngine899b620MethodI64Arg() { return LUA_ENGINE_899B620_METHOD_I64_ARG >>> 0; }
export function luaEngine899b620IatLualCheckinteger() { return LUA_ENGINE_899B620_IAT_LUAL_CHECKINTEGER >>> 0; }
export function luaEngine899b620CheckintegerIndex() { return LUA_ENGINE_899B620_CHECKINTEGER_INDEX >>> 0; }
export function luaEngine899b620ReturnValue() { return LUA_ENGINE_899B620_RETURN_VALUE >>> 0; }
/** 0x89b690 law: FULL-WORD lua_type(L,1) gate (`jne`).
 * taken <=> typeResult !== 0. */
export function luaEngine899b690Type1GateTaken(typeResult) {
  return typeResult !== 0 ? 1 : 0;
}
export const LUA_ENGINE_899B690_VA = 0x89b690;
export const LUA_ENGINE_899B690_END_VA = 0x89b6ef;
export const LUA_ENGINE_899B690_NEXT_VA = 0x89b6f0;
export const LUA_ENGINE_899B690_STACK_ARGS = 0x1;
export const LUA_ENGINE_899B690_ECX_ARG = 0x0;
export const LUA_ENGINE_899B690_CALLEE_POPS_STACK_ARGS = 0x0;
export const LUA_ENGINE_899B690_ALIGNED_PROLOGUE = 0x0;
export const LUA_ENGINE_899B690_GATE_INVERTED_ENCODING = 0x0;
export const LUA_ENGINE_899B690_TYPE_GATES = 0x1;
export const LUA_ENGINE_899B690_IAT_LUA_TYPE = 0xb18400;
export const LUA_ENGINE_899B690_CHECKGET_KEY = 0xc829d4;
export const LUA_ENGINE_899B690_CHECKGET_INDEX = 0x1;
export const LUA_ENGINE_899B690_CHECKGET_DEF_ARG = 0x1;
export const LUA_ENGINE_899B690_CHECKGET_FIELD_OFF = 0x4;
export const LUA_ENGINE_899B690_CHECKGET_HELPER_VA = 0x85c590;
export const LUA_ENGINE_899B690_IAT_LUA_TOUSERDATA = 0xb183b0;
export const LUA_ENGINE_899B690_TOUSERDATA_INDEX_U32 = 0xfff0b9d7;
export const LUA_ENGINE_899B690_UD_FN_POINTER_CALL = 0x1;
export const LUA_ENGINE_899B690_METHOD_STACK_ARGS = 0x0;
export const LUA_ENGINE_899B690_METHOD_I64_RETURN = 0x1;
export const LUA_ENGINE_899B690_I64_PUSHER_HELPER_VA = 0x85c030;
export const LUA_ENGINE_899B690_RETURN_VALUE = 0x1;
export function luaEngine899b690HostVa() { return LUA_ENGINE_899B690_VA >>> 0; }
export function luaEngine899b690EndVa() { return LUA_ENGINE_899B690_END_VA >>> 0; }
export function luaEngine899b690NextVa() { return LUA_ENGINE_899B690_NEXT_VA >>> 0; }
export function luaEngine899b690StackArgs() { return LUA_ENGINE_899B690_STACK_ARGS >>> 0; }
export function luaEngine899b690EcxArg() { return LUA_ENGINE_899B690_ECX_ARG >>> 0; }
export function luaEngine899b690CalleePopsStackArgs() { return LUA_ENGINE_899B690_CALLEE_POPS_STACK_ARGS >>> 0; }
export function luaEngine899b690AlignedPrologue() { return LUA_ENGINE_899B690_ALIGNED_PROLOGUE >>> 0; }
export function luaEngine899b690GateInvertedEncoding() { return LUA_ENGINE_899B690_GATE_INVERTED_ENCODING >>> 0; }
export function luaEngine899b690TypeGates() { return LUA_ENGINE_899B690_TYPE_GATES >>> 0; }
export function luaEngine899b690IatLuaType() { return LUA_ENGINE_899B690_IAT_LUA_TYPE >>> 0; }
export function luaEngine899b690CheckgetKey() { return LUA_ENGINE_899B690_CHECKGET_KEY >>> 0; }
export function luaEngine899b690CheckgetIndex() { return LUA_ENGINE_899B690_CHECKGET_INDEX >>> 0; }
export function luaEngine899b690CheckgetDefArg() { return LUA_ENGINE_899B690_CHECKGET_DEF_ARG >>> 0; }
export function luaEngine899b690CheckgetFieldOff() { return LUA_ENGINE_899B690_CHECKGET_FIELD_OFF >>> 0; }
export function luaEngine899b690CheckgetHelperVa() { return LUA_ENGINE_899B690_CHECKGET_HELPER_VA >>> 0; }
export function luaEngine899b690IatLuaTouserdata() { return LUA_ENGINE_899B690_IAT_LUA_TOUSERDATA >>> 0; }
export function luaEngine899b690TouserdataIndex() { return LUA_ENGINE_899B690_TOUSERDATA_INDEX_U32 >>> 0; }
export function luaEngine899b690UdFnPointerCall() { return LUA_ENGINE_899B690_UD_FN_POINTER_CALL >>> 0; }
export function luaEngine899b690MethodStackArgs() { return LUA_ENGINE_899B690_METHOD_STACK_ARGS >>> 0; }
export function luaEngine899b690MethodI64Return() { return LUA_ENGINE_899B690_METHOD_I64_RETURN >>> 0; }
export function luaEngine899b690I64PusherHelperVa() { return LUA_ENGINE_899B690_I64_PUSHER_HELPER_VA >>> 0; }
export function luaEngine899b690ReturnValue() { return LUA_ENGINE_899B690_RETURN_VALUE >>> 0; }
/** ==== ABI v100: wrapper-band continuation — 0x0089b6f0 /
 * 0x0089b760 (census key 0xc829d4 slot 102 pair, ordinals 10/6 —
 * i32 setter + i32 sext getter). ====
 *
 * 0x89b6f0..0x89b75b (pad to 0x89b760) — I32 SETTER: aligned
 * prologue (`and esp,-8`, sub esp,8); full-word lua_type(L,1)
 * `jne` (nil -> val slot 0); check/get(key 0xc829d4, idx 1,
 * def 0) -> val=[obj+4]; touserdata(upvalueindex 1);
 * luaL_checkinteger(L,2) IAT 0xb183f4 -> int32 eax; method FN PTR
 * [ud+0] called directly with this=val and ONE stack arg;
 * xor eax,eax; ret 0. Zero-resync exact span (45 insns).
 *
 * 0x89b760..0x89b7bb (pad to 0x89b7c0) — I32 SEXT GETTER: plain
 * prologue; same full-word gate (nil -> obj 0); check/get(key
 * 0xc829d4, idx 1, DEF 1) -> obj=[obj+4]; touserdata(upvalueindex
 * 1); method fn ptr [ud+0] called directly this=obj (0 stack args),
 * int32 return in eax -> edx; host i32-sext pusher 0x85bfd0(ecx=L,
 * edx=v; `mov eax,edx; cdq` sign-extend, prior art
 * LUA_PROPERTY_CLOSURE_PUSH_I32_SEXT_VA); ret 1. Zero-resync exact
 * span (47 insns).
 *
 * NEXT frontier 0x89b7c0.
 */
/** 0x89b6f0 law: FULL-WORD lua_type(L,1) gate (`jne`).
 * taken <=> typeResult !== 0. */
export function luaEngine899b6f0Type1GateTaken(typeResult) {
  return typeResult !== 0 ? 1 : 0;
}
export const LUA_ENGINE_899B6F0_VA = 0x89b6f0;
export const LUA_ENGINE_899B6F0_END_VA = 0x89b75c;
export const LUA_ENGINE_899B6F0_NEXT_VA = 0x89b760;
export const LUA_ENGINE_899B6F0_STACK_ARGS = 0x1;
export const LUA_ENGINE_899B6F0_ECX_ARG = 0x0;
export const LUA_ENGINE_899B6F0_CALLEE_POPS_STACK_ARGS = 0x0;
export const LUA_ENGINE_899B6F0_ALIGNED_PROLOGUE = 0x1;
export const LUA_ENGINE_899B6F0_GATE_INVERTED_ENCODING = 0x0;
export const LUA_ENGINE_899B6F0_TYPE_GATES = 0x1;
export const LUA_ENGINE_899B6F0_IAT_LUA_TYPE = 0xb18400;
export const LUA_ENGINE_899B6F0_CHECKGET_KEY = 0xc829d4;
export const LUA_ENGINE_899B6F0_CHECKGET_INDEX = 0x1;
export const LUA_ENGINE_899B6F0_CHECKGET_DEF_ARG = 0x0;
export const LUA_ENGINE_899B6F0_CHECKGET_FIELD_OFF = 0x4;
export const LUA_ENGINE_899B6F0_CHECKGET_HELPER_VA = 0x85c590;
export const LUA_ENGINE_899B6F0_IAT_LUA_TOUSERDATA = 0xb183b0;
export const LUA_ENGINE_899B6F0_TOUSERDATA_INDEX_U32 = 0xfff0b9d7;
export const LUA_ENGINE_899B6F0_UD_FN_POINTER_CALL = 0x1;
export const LUA_ENGINE_899B6F0_METHOD_STACK_ARGS = 0x1;
export const LUA_ENGINE_899B6F0_METHOD_I32_ARG = 0x1;
export const LUA_ENGINE_899B6F0_IAT_LUAL_CHECKINTEGER = 0xb183f4;
export const LUA_ENGINE_899B6F0_CHECKINTEGER_INDEX = 0x2;
export const LUA_ENGINE_899B6F0_RETURN_VALUE = 0x0;
export function luaEngine899b6f0HostVa() { return LUA_ENGINE_899B6F0_VA >>> 0; }
export function luaEngine899b6f0EndVa() { return LUA_ENGINE_899B6F0_END_VA >>> 0; }
export function luaEngine899b6f0NextVa() { return LUA_ENGINE_899B6F0_NEXT_VA >>> 0; }
export function luaEngine899b6f0StackArgs() { return LUA_ENGINE_899B6F0_STACK_ARGS >>> 0; }
export function luaEngine899b6f0EcxArg() { return LUA_ENGINE_899B6F0_ECX_ARG >>> 0; }
export function luaEngine899b6f0CalleePopsStackArgs() { return LUA_ENGINE_899B6F0_CALLEE_POPS_STACK_ARGS >>> 0; }
export function luaEngine899b6f0AlignedPrologue() { return LUA_ENGINE_899B6F0_ALIGNED_PROLOGUE >>> 0; }
export function luaEngine899b6f0GateInvertedEncoding() { return LUA_ENGINE_899B6F0_GATE_INVERTED_ENCODING >>> 0; }
export function luaEngine899b6f0TypeGates() { return LUA_ENGINE_899B6F0_TYPE_GATES >>> 0; }
export function luaEngine899b6f0IatLuaType() { return LUA_ENGINE_899B6F0_IAT_LUA_TYPE >>> 0; }
export function luaEngine899b6f0CheckgetKey() { return LUA_ENGINE_899B6F0_CHECKGET_KEY >>> 0; }
export function luaEngine899b6f0CheckgetIndex() { return LUA_ENGINE_899B6F0_CHECKGET_INDEX >>> 0; }
export function luaEngine899b6f0CheckgetDefArg() { return LUA_ENGINE_899B6F0_CHECKGET_DEF_ARG >>> 0; }
export function luaEngine899b6f0CheckgetFieldOff() { return LUA_ENGINE_899B6F0_CHECKGET_FIELD_OFF >>> 0; }
export function luaEngine899b6f0CheckgetHelperVa() { return LUA_ENGINE_899B6F0_CHECKGET_HELPER_VA >>> 0; }
export function luaEngine899b6f0IatLuaTouserdata() { return LUA_ENGINE_899B6F0_IAT_LUA_TOUSERDATA >>> 0; }
export function luaEngine899b6f0TouserdataIndex() { return LUA_ENGINE_899B6F0_TOUSERDATA_INDEX_U32 >>> 0; }
export function luaEngine899b6f0UdFnPointerCall() { return LUA_ENGINE_899B6F0_UD_FN_POINTER_CALL >>> 0; }
export function luaEngine899b6f0MethodStackArgs() { return LUA_ENGINE_899B6F0_METHOD_STACK_ARGS >>> 0; }
export function luaEngine899b6f0MethodI32Arg() { return LUA_ENGINE_899B6F0_METHOD_I32_ARG >>> 0; }
export function luaEngine899b6f0IatLualCheckinteger() { return LUA_ENGINE_899B6F0_IAT_LUAL_CHECKINTEGER >>> 0; }
export function luaEngine899b6f0CheckintegerIndex() { return LUA_ENGINE_899B6F0_CHECKINTEGER_INDEX >>> 0; }
export function luaEngine899b6f0ReturnValue() { return LUA_ENGINE_899B6F0_RETURN_VALUE >>> 0; }
/** 0x89b760 law: FULL-WORD lua_type(L,1) gate (`jne`).
 * taken <=> typeResult !== 0. */
export function luaEngine899b760Type1GateTaken(typeResult) {
  return typeResult !== 0 ? 1 : 0;
}
export const LUA_ENGINE_899B760_VA = 0x89b760;
export const LUA_ENGINE_899B760_END_VA = 0x89b7bc;
export const LUA_ENGINE_899B760_NEXT_VA = 0x89b7c0;
export const LUA_ENGINE_899B760_STACK_ARGS = 0x1;
export const LUA_ENGINE_899B760_ECX_ARG = 0x0;
export const LUA_ENGINE_899B760_CALLEE_POPS_STACK_ARGS = 0x0;
export const LUA_ENGINE_899B760_ALIGNED_PROLOGUE = 0x0;
export const LUA_ENGINE_899B760_GATE_INVERTED_ENCODING = 0x0;
export const LUA_ENGINE_899B760_TYPE_GATES = 0x1;
export const LUA_ENGINE_899B760_IAT_LUA_TYPE = 0xb18400;
export const LUA_ENGINE_899B760_CHECKGET_KEY = 0xc829d4;
export const LUA_ENGINE_899B760_CHECKGET_INDEX = 0x1;
export const LUA_ENGINE_899B760_CHECKGET_DEF_ARG = 0x1;
export const LUA_ENGINE_899B760_CHECKGET_FIELD_OFF = 0x4;
export const LUA_ENGINE_899B760_CHECKGET_HELPER_VA = 0x85c590;
export const LUA_ENGINE_899B760_IAT_LUA_TOUSERDATA = 0xb183b0;
export const LUA_ENGINE_899B760_TOUSERDATA_INDEX_U32 = 0xfff0b9d7;
export const LUA_ENGINE_899B760_UD_FN_POINTER_CALL = 0x1;
export const LUA_ENGINE_899B760_METHOD_STACK_ARGS = 0x0;
export const LUA_ENGINE_899B760_METHOD_I32_RETURN = 0x1;
export const LUA_ENGINE_899B760_I32_SEXT_PUSHER_HELPER_VA = 0x85bfd0;
export const LUA_ENGINE_899B760_RETURN_VALUE = 0x1;
export function luaEngine899b760HostVa() { return LUA_ENGINE_899B760_VA >>> 0; }
export function luaEngine899b760EndVa() { return LUA_ENGINE_899B760_END_VA >>> 0; }
export function luaEngine899b760NextVa() { return LUA_ENGINE_899B760_NEXT_VA >>> 0; }
export function luaEngine899b760StackArgs() { return LUA_ENGINE_899B760_STACK_ARGS >>> 0; }
export function luaEngine899b760EcxArg() { return LUA_ENGINE_899B760_ECX_ARG >>> 0; }
export function luaEngine899b760CalleePopsStackArgs() { return LUA_ENGINE_899B760_CALLEE_POPS_STACK_ARGS >>> 0; }
export function luaEngine899b760AlignedPrologue() { return LUA_ENGINE_899B760_ALIGNED_PROLOGUE >>> 0; }
export function luaEngine899b760GateInvertedEncoding() { return LUA_ENGINE_899B760_GATE_INVERTED_ENCODING >>> 0; }
export function luaEngine899b760TypeGates() { return LUA_ENGINE_899B760_TYPE_GATES >>> 0; }
export function luaEngine899b760IatLuaType() { return LUA_ENGINE_899B760_IAT_LUA_TYPE >>> 0; }
export function luaEngine899b760CheckgetKey() { return LUA_ENGINE_899B760_CHECKGET_KEY >>> 0; }
export function luaEngine899b760CheckgetIndex() { return LUA_ENGINE_899B760_CHECKGET_INDEX >>> 0; }
export function luaEngine899b760CheckgetDefArg() { return LUA_ENGINE_899B760_CHECKGET_DEF_ARG >>> 0; }
export function luaEngine899b760CheckgetFieldOff() { return LUA_ENGINE_899B760_CHECKGET_FIELD_OFF >>> 0; }
export function luaEngine899b760CheckgetHelperVa() { return LUA_ENGINE_899B760_CHECKGET_HELPER_VA >>> 0; }
export function luaEngine899b760IatLuaTouserdata() { return LUA_ENGINE_899B760_IAT_LUA_TOUSERDATA >>> 0; }
export function luaEngine899b760TouserdataIndex() { return LUA_ENGINE_899B760_TOUSERDATA_INDEX_U32 >>> 0; }
export function luaEngine899b760UdFnPointerCall() { return LUA_ENGINE_899B760_UD_FN_POINTER_CALL >>> 0; }
export function luaEngine899b760MethodStackArgs() { return LUA_ENGINE_899B760_METHOD_STACK_ARGS >>> 0; }
export function luaEngine899b760MethodI32Return() { return LUA_ENGINE_899B760_METHOD_I32_RETURN >>> 0; }
export function luaEngine899b760I32SextPusherHelperVa() { return LUA_ENGINE_899B760_I32_SEXT_PUSHER_HELPER_VA >>> 0; }
export function luaEngine899b760ReturnValue() { return LUA_ENGINE_899B760_RETURN_VALUE >>> 0; }
/** ==== ABI v101: wrapper-band continuation — 0x0089b7c0 /
 * 0x0089b850 (census key 0xc829d4 slot 101 pair, ordinals 7/8 —
 * float-lane setter + float-pusher getter). ====
 *
 * 0x89b7c0..0x89b841 (pad to 0x89b850) — FLOAT-LANE SETTER (v95
 * 0x89b280 shape): aligned prologue (`and esp,-8`, sub esp,0x10);
 * full-word lua_type(L,1) `jne` (nil -> val slot 0); check/get(key
 * 0xc829d4, idx 1, def 0) -> val=[obj+4]; touserdata(upvalueindex
 * 1); luaL_checknumber(L,2) IAT 0xb18324 -> ST0; method FN PTR
 * [ud+0] called directly with this=val and ONE float stack arg
 * spilled fstp/movss; xor eax,eax; ret 0. Zero-resync exact span
 * (59 insns).
 *
 * 0x89b850..0x89b8b8 (pad to 0x89b8c0) — FLOAT-PUSHER GETTER (v96
 * 0x89b310 shape): plain prologue with `push ecx` local slot;
 * same full-word gate (nil -> obj 0); check/get(key 0xc829d4,
 * idx 1, DEF 1) -> obj=[obj+4]; touserdata(upvalueindex 1); method
 * fn ptr spilled through [ebp-4] and called directly this=obj (0
 * stack args); f32 result fstp -> [ebp-4] -> movss xmm1; host
 * pushNumber 0x85c050(ecx=L, xmm1); ret 1. Zero-resync exact span
 * (39 insns).
 *
 * NEXT frontier 0x89b8c0 (uncensused gap body — aligned prologue,
 * like the 0x89b380 walk-gap situation; census resumes at 0x89b940
 * on key 0xc829d1).
 */
/** 0x89b7c0 law: FULL-WORD lua_type(L,1) gate (`jne`).
 * taken <=> typeResult !== 0. */
export function luaEngine899b7c0Type1GateTaken(typeResult) {
  return typeResult !== 0 ? 1 : 0;
}
export const LUA_ENGINE_899B7C0_VA = 0x89b7c0;
export const LUA_ENGINE_899B7C0_END_VA = 0x89b842;
export const LUA_ENGINE_899B7C0_NEXT_VA = 0x89b850;
export const LUA_ENGINE_899B7C0_STACK_ARGS = 0x1;
export const LUA_ENGINE_899B7C0_ECX_ARG = 0x0;
export const LUA_ENGINE_899B7C0_CALLEE_POPS_STACK_ARGS = 0x0;
export const LUA_ENGINE_899B7C0_ALIGNED_PROLOGUE = 0x1;
export const LUA_ENGINE_899B7C0_GATE_INVERTED_ENCODING = 0x0;
export const LUA_ENGINE_899B7C0_TYPE_GATES = 0x1;
export const LUA_ENGINE_899B7C0_IAT_LUA_TYPE = 0xb18400;
export const LUA_ENGINE_899B7C0_CHECKGET_KEY = 0xc829d4;
export const LUA_ENGINE_899B7C0_CHECKGET_INDEX = 0x1;
export const LUA_ENGINE_899B7C0_CHECKGET_DEF_ARG = 0x0;
export const LUA_ENGINE_899B7C0_CHECKGET_FIELD_OFF = 0x4;
export const LUA_ENGINE_899B7C0_CHECKGET_HELPER_VA = 0x85c590;
export const LUA_ENGINE_899B7C0_IAT_LUA_TOUSERDATA = 0xb183b0;
export const LUA_ENGINE_899B7C0_TOUSERDATA_INDEX_U32 = 0xfff0b9d7;
export const LUA_ENGINE_899B7C0_UD_FN_POINTER_CALL = 0x1;
export const LUA_ENGINE_899B7C0_METHOD_STACK_ARGS = 0x1;
export const LUA_ENGINE_899B7C0_FLOAT_LANE = 0x1;
export const LUA_ENGINE_899B7C0_IAT_LUA_CHECKNUMBER = 0xb18324;
export const LUA_ENGINE_899B7C0_CHECKNUMBER_INDEX = 0x2;
export const LUA_ENGINE_899B7C0_RETURN_VALUE = 0x0;
export function luaEngine899b7c0HostVa() { return LUA_ENGINE_899B7C0_VA >>> 0; }
export function luaEngine899b7c0EndVa() { return LUA_ENGINE_899B7C0_END_VA >>> 0; }
export function luaEngine899b7c0NextVa() { return LUA_ENGINE_899B7C0_NEXT_VA >>> 0; }
export function luaEngine899b7c0StackArgs() { return LUA_ENGINE_899B7C0_STACK_ARGS >>> 0; }
export function luaEngine899b7c0EcxArg() { return LUA_ENGINE_899B7C0_ECX_ARG >>> 0; }
export function luaEngine899b7c0CalleePopsStackArgs() { return LUA_ENGINE_899B7C0_CALLEE_POPS_STACK_ARGS >>> 0; }
export function luaEngine899b7c0AlignedPrologue() { return LUA_ENGINE_899B7C0_ALIGNED_PROLOGUE >>> 0; }
export function luaEngine899b7c0GateInvertedEncoding() { return LUA_ENGINE_899B7C0_GATE_INVERTED_ENCODING >>> 0; }
export function luaEngine899b7c0TypeGates() { return LUA_ENGINE_899B7C0_TYPE_GATES >>> 0; }
export function luaEngine899b7c0IatLuaType() { return LUA_ENGINE_899B7C0_IAT_LUA_TYPE >>> 0; }
export function luaEngine899b7c0CheckgetKey() { return LUA_ENGINE_899B7C0_CHECKGET_KEY >>> 0; }
export function luaEngine899b7c0CheckgetIndex() { return LUA_ENGINE_899B7C0_CHECKGET_INDEX >>> 0; }
export function luaEngine899b7c0CheckgetDefArg() { return LUA_ENGINE_899B7C0_CHECKGET_DEF_ARG >>> 0; }
export function luaEngine899b7c0CheckgetFieldOff() { return LUA_ENGINE_899B7C0_CHECKGET_FIELD_OFF >>> 0; }
export function luaEngine899b7c0CheckgetHelperVa() { return LUA_ENGINE_899B7C0_CHECKGET_HELPER_VA >>> 0; }
export function luaEngine899b7c0IatLuaTouserdata() { return LUA_ENGINE_899B7C0_IAT_LUA_TOUSERDATA >>> 0; }
export function luaEngine899b7c0TouserdataIndex() { return LUA_ENGINE_899B7C0_TOUSERDATA_INDEX_U32 >>> 0; }
export function luaEngine899b7c0UdFnPointerCall() { return LUA_ENGINE_899B7C0_UD_FN_POINTER_CALL >>> 0; }
export function luaEngine899b7c0MethodStackArgs() { return LUA_ENGINE_899B7C0_METHOD_STACK_ARGS >>> 0; }
export function luaEngine899b7c0FloatLane() { return LUA_ENGINE_899B7C0_FLOAT_LANE >>> 0; }
export function luaEngine899b7c0IatLuaChecknumber() { return LUA_ENGINE_899B7C0_IAT_LUA_CHECKNUMBER >>> 0; }
export function luaEngine899b7c0ChecknumberIndex() { return LUA_ENGINE_899B7C0_CHECKNUMBER_INDEX >>> 0; }
export function luaEngine899b7c0ReturnValue() { return LUA_ENGINE_899B7C0_RETURN_VALUE >>> 0; }
/** 0x89b850 law: FULL-WORD lua_type(L,1) gate (`jne`).
 * taken <=> typeResult !== 0. */
export function luaEngine899b850Type1GateTaken(typeResult) {
  return typeResult !== 0 ? 1 : 0;
}
export const LUA_ENGINE_899B850_VA = 0x89b850;
export const LUA_ENGINE_899B850_END_VA = 0x89b8b9;
export const LUA_ENGINE_899B850_NEXT_VA = 0x89b8c0;
export const LUA_ENGINE_899B850_STACK_ARGS = 0x1;
export const LUA_ENGINE_899B850_ECX_ARG = 0x0;
export const LUA_ENGINE_899B850_CALLEE_POPS_STACK_ARGS = 0x0;
export const LUA_ENGINE_899B850_ALIGNED_PROLOGUE = 0x0;
export const LUA_ENGINE_899B850_GATE_INVERTED_ENCODING = 0x0;
export const LUA_ENGINE_899B850_TYPE_GATES = 0x1;
export const LUA_ENGINE_899B850_IAT_LUA_TYPE = 0xb18400;
export const LUA_ENGINE_899B850_CHECKGET_KEY = 0xc829d4;
export const LUA_ENGINE_899B850_CHECKGET_INDEX = 0x1;
export const LUA_ENGINE_899B850_CHECKGET_DEF_ARG = 0x1;
export const LUA_ENGINE_899B850_CHECKGET_FIELD_OFF = 0x4;
export const LUA_ENGINE_899B850_CHECKGET_HELPER_VA = 0x85c590;
export const LUA_ENGINE_899B850_IAT_LUA_TOUSERDATA = 0xb183b0;
export const LUA_ENGINE_899B850_TOUSERDATA_INDEX_U32 = 0xfff0b9d7;
export const LUA_ENGINE_899B850_UD_FN_POINTER_CALL = 0x1;
export const LUA_ENGINE_899B850_METHOD_STACK_ARGS = 0x0;
export const LUA_ENGINE_899B850_FLOAT_LANE = 0x1;
export const LUA_ENGINE_899B850_FLOAT_PUSHER_HELPER_VA = 0x85c050;
export const LUA_ENGINE_899B850_RETURN_VALUE = 0x1;
export function luaEngine899b850HostVa() { return LUA_ENGINE_899B850_VA >>> 0; }
export function luaEngine899b850EndVa() { return LUA_ENGINE_899B850_END_VA >>> 0; }
export function luaEngine899b850NextVa() { return LUA_ENGINE_899B850_NEXT_VA >>> 0; }
export function luaEngine899b850StackArgs() { return LUA_ENGINE_899B850_STACK_ARGS >>> 0; }
export function luaEngine899b850EcxArg() { return LUA_ENGINE_899B850_ECX_ARG >>> 0; }
export function luaEngine899b850CalleePopsStackArgs() { return LUA_ENGINE_899B850_CALLEE_POPS_STACK_ARGS >>> 0; }
export function luaEngine899b850AlignedPrologue() { return LUA_ENGINE_899B850_ALIGNED_PROLOGUE >>> 0; }
export function luaEngine899b850GateInvertedEncoding() { return LUA_ENGINE_899B850_GATE_INVERTED_ENCODING >>> 0; }
export function luaEngine899b850TypeGates() { return LUA_ENGINE_899B850_TYPE_GATES >>> 0; }
export function luaEngine899b850IatLuaType() { return LUA_ENGINE_899B850_IAT_LUA_TYPE >>> 0; }
export function luaEngine899b850CheckgetKey() { return LUA_ENGINE_899B850_CHECKGET_KEY >>> 0; }
export function luaEngine899b850CheckgetIndex() { return LUA_ENGINE_899B850_CHECKGET_INDEX >>> 0; }
export function luaEngine899b850CheckgetDefArg() { return LUA_ENGINE_899B850_CHECKGET_DEF_ARG >>> 0; }
export function luaEngine899b850CheckgetFieldOff() { return LUA_ENGINE_899B850_CHECKGET_FIELD_OFF >>> 0; }
export function luaEngine899b850CheckgetHelperVa() { return LUA_ENGINE_899B850_CHECKGET_HELPER_VA >>> 0; }
export function luaEngine899b850IatLuaTouserdata() { return LUA_ENGINE_899B850_IAT_LUA_TOUSERDATA >>> 0; }
export function luaEngine899b850TouserdataIndex() { return LUA_ENGINE_899B850_TOUSERDATA_INDEX_U32 >>> 0; }
export function luaEngine899b850UdFnPointerCall() { return LUA_ENGINE_899B850_UD_FN_POINTER_CALL >>> 0; }
export function luaEngine899b850MethodStackArgs() { return LUA_ENGINE_899B850_METHOD_STACK_ARGS >>> 0; }
export function luaEngine899b850FloatLane() { return LUA_ENGINE_899B850_FLOAT_LANE >>> 0; }
export function luaEngine899b850FloatPusherHelperVa() { return LUA_ENGINE_899B850_FLOAT_PUSHER_HELPER_VA >>> 0; }
export function luaEngine899b850ReturnValue() { return LUA_ENGINE_899B850_RETURN_VALUE >>> 0; }
/** ==== ABI v102: wrapper-band continuation — 0x0089b8c0
 * (UNCENSUSED gap CONSTRUCTOR, walk-gap like 0x89b380) +
 * 0x0089b940 (i32 setter, census resumes on key 0xc829d1 slot 96,
 * ordinal 10). ====
 *
 * 0x89b8c0..0x89b93d (pad to 0x89b940) — SRET-BOX CONSTRUCTOR:
 * aligned prologue (`and esp,-8`, sub esp,8); NO type gate
 * (TYPE_GATES=0), NO check/get; PRE-GATE touserdata(upvalueindex 1)
 * -> ud payload +0 is a FN POINTER; luaL_checkinteger(L,1) IAT
 * 0xb183f4 -> eax; fn(sret out-buf, i32 arg) called DIRECTLY
 * through [ud+0] (caller cleanup folded into the epilogue add);
 * newuserdata(L,0x10) IAT 0xb1839c -> box {vtable 0xb73574 (NEW),
 * self-ptr +4 (=ud+8), payload +8}; rawgetp(registry 0xfff0b9d8,
 * key 0xc82980 Vector slot) IAT 0xb183bc + setmetatable(-2)
 * IAT 0xb18398; the callee-written 8 sret bytes are reloaded from
 * the stack buffer and copied into the box payload; ret 1.
 * Zero-resync exact span 45 insns. E8=0 — the only body in the
 * band with no direct call at all.
 *
 * 0x89b940..0x89b9ab (pad to 0x89b9b0) — I32 SETTER (v100 0x89b6f0
 * shape): aligned prologue (`and esp,-8`, sub esp,8); full-word
 * lua_type(L,1) `jne`; check/get(key 0xc829d1 NEW BAND, idx 1,
 * def 0) -> val=[obj+4]; touserdata(upvalueindex 1);
 * luaL_checkinteger(L,2) IAT 0xb183f4; method FN PTR [ud+0] called
 * directly with this=val and ONE stack arg; ret 0. Zero-resync
 * exact span 41 insns.
 *
 * NEXT frontier 0x89b9b0.
 */
export const LUA_ENGINE_899B8C0_VA = 0x89b8c0;
export const LUA_ENGINE_899B8C0_END_VA = 0x89b93e;
export const LUA_ENGINE_899B8C0_NEXT_VA = 0x89b940;
export const LUA_ENGINE_899B8C0_STACK_ARGS = 0x1;
export const LUA_ENGINE_899B8C0_ECX_ARG = 0x0;
export const LUA_ENGINE_899B8C0_CALLEE_POPS_STACK_ARGS = 0x0;
export const LUA_ENGINE_899B8C0_ALIGNED_PROLOGUE = 0x1;
export const LUA_ENGINE_899B8C0_TYPE_GATES = 0x0;
export const LUA_ENGINE_899B8C0_PRE_GATE_TOUSERDATA = 0x1;
export const LUA_ENGINE_899B8C0_IAT_LUA_TOUSERDATA = 0xb183b0;
export const LUA_ENGINE_899B8C0_TOUSERDATA_INDEX_U32 = 0xfff0b9d7;
export const LUA_ENGINE_899B8C0_UD_FN_POINTER_CALL = 0x1;
export const LUA_ENGINE_899B8C0_METHOD_STACK_ARGS = 0x2;
export const LUA_ENGINE_899B8C0_METHOD_SRET_OUT = 0x1;
export const LUA_ENGINE_899B8C0_SRET_COPY_BYTES = 0x8;
export const LUA_ENGINE_899B8C0_IAT_LUAL_CHECKINTEGER = 0xb183f4;
export const LUA_ENGINE_899B8C0_CHECKINTEGER_INDEX = 0x1;
export const LUA_ENGINE_899B8C0_NEWUSERDATA_SIZE = 0x10;
export const LUA_ENGINE_899B8C0_UD_VTABLE_VA = 0xb73574;
export const LUA_ENGINE_899B8C0_UD_SELF_PTR_FIELD_OFF = 0x4;
export const LUA_ENGINE_899B8C0_PAYLOAD_FIELD_OFF = 0x8;
export const LUA_ENGINE_899B8C0_REGISTRY_INDEX_U32 = 0xfff0b9d8;
export const LUA_ENGINE_899B8C0_METATABLE_RAWGETP_KEY = 0xc82980;
export const LUA_ENGINE_899B8C0_IAT_LUA_RAWGETP = 0xb183bc;
export const LUA_ENGINE_899B8C0_IAT_LUA_SETMETATABLE = 0xb18398;
export const LUA_ENGINE_899B8C0_SETMETATABLE_INDEX_U32 = 0xfffffffe;
export const LUA_ENGINE_899B8C0_RETURN_VALUE = 0x1;
export function luaEngine899b8c0HostVa() { return LUA_ENGINE_899B8C0_VA >>> 0; }
export function luaEngine899b8c0EndVa() { return LUA_ENGINE_899B8C0_END_VA >>> 0; }
export function luaEngine899b8c0NextVa() { return LUA_ENGINE_899B8C0_NEXT_VA >>> 0; }
export function luaEngine899b8c0StackArgs() { return LUA_ENGINE_899B8C0_STACK_ARGS >>> 0; }
export function luaEngine899b8c0EcxArg() { return LUA_ENGINE_899B8C0_ECX_ARG >>> 0; }
export function luaEngine899b8c0CalleePopsStackArgs() { return LUA_ENGINE_899B8C0_CALLEE_POPS_STACK_ARGS >>> 0; }
export function luaEngine899b8c0AlignedPrologue() { return LUA_ENGINE_899B8C0_ALIGNED_PROLOGUE >>> 0; }
export function luaEngine899b8c0TypeGates() { return LUA_ENGINE_899B8C0_TYPE_GATES >>> 0; }
export function luaEngine899b8c0PreGateTouserdata() { return LUA_ENGINE_899B8C0_PRE_GATE_TOUSERDATA >>> 0; }
export function luaEngine899b8c0IatLuaTouserdata() { return LUA_ENGINE_899B8C0_IAT_LUA_TOUSERDATA >>> 0; }
export function luaEngine899b8c0TouserdataIndex() { return LUA_ENGINE_899B8C0_TOUSERDATA_INDEX_U32 >>> 0; }
export function luaEngine899b8c0UdFnPointerCall() { return LUA_ENGINE_899B8C0_UD_FN_POINTER_CALL >>> 0; }
export function luaEngine899b8c0MethodStackArgs() { return LUA_ENGINE_899B8C0_METHOD_STACK_ARGS >>> 0; }
export function luaEngine899b8c0MethodSretOut() { return LUA_ENGINE_899B8C0_METHOD_SRET_OUT >>> 0; }
export function luaEngine899b8c0SretCopyBytes() { return LUA_ENGINE_899B8C0_SRET_COPY_BYTES >>> 0; }
export function luaEngine899b8c0IatLualCheckinteger() { return LUA_ENGINE_899B8C0_IAT_LUAL_CHECKINTEGER >>> 0; }
export function luaEngine899b8c0CheckintegerIndex() { return LUA_ENGINE_899B8C0_CHECKINTEGER_INDEX >>> 0; }
export function luaEngine899b8c0NewuserdataSize() { return LUA_ENGINE_899B8C0_NEWUSERDATA_SIZE >>> 0; }
export function luaEngine899b8c0UdVtableVa() { return LUA_ENGINE_899B8C0_UD_VTABLE_VA >>> 0; }
export function luaEngine899b8c0UdSelfPtrFieldOff() { return LUA_ENGINE_899B8C0_UD_SELF_PTR_FIELD_OFF >>> 0; }
export function luaEngine899b8c0PayloadFieldOff() { return LUA_ENGINE_899B8C0_PAYLOAD_FIELD_OFF >>> 0; }
export function luaEngine899b8c0RegistryIndex() { return LUA_ENGINE_899B8C0_REGISTRY_INDEX_U32 >>> 0; }
export function luaEngine899b8c0MetatableRawgetpKey() { return LUA_ENGINE_899B8C0_METATABLE_RAWGETP_KEY >>> 0; }
export function luaEngine899b8c0IatLuaRawgetp() { return LUA_ENGINE_899B8C0_IAT_LUA_RAWGETP >>> 0; }
export function luaEngine899b8c0IatLuaSetmetatable() { return LUA_ENGINE_899B8C0_IAT_LUA_SETMETATABLE >>> 0; }
export function luaEngine899b8c0SetmetatableIndex() { return LUA_ENGINE_899B8C0_SETMETATABLE_INDEX_U32 >>> 0; }
export function luaEngine899b8c0ReturnValue() { return LUA_ENGINE_899B8C0_RETURN_VALUE >>> 0; }
/** 0x89b940 law: FULL-WORD lua_type(L,1) gate (`jne`).
 * taken <=> typeResult !== 0. */
export function luaEngine899b940Type1GateTaken(typeResult) {
  return typeResult !== 0 ? 1 : 0;
}
export const LUA_ENGINE_899B940_VA = 0x89b940;
export const LUA_ENGINE_899B940_END_VA = 0x89b9ac;
export const LUA_ENGINE_899B940_NEXT_VA = 0x89b9b0;
export const LUA_ENGINE_899B940_STACK_ARGS = 0x1;
export const LUA_ENGINE_899B940_ECX_ARG = 0x0;
export const LUA_ENGINE_899B940_CALLEE_POPS_STACK_ARGS = 0x0;
export const LUA_ENGINE_899B940_ALIGNED_PROLOGUE = 0x1;
export const LUA_ENGINE_899B940_GATE_INVERTED_ENCODING = 0x0;
export const LUA_ENGINE_899B940_TYPE_GATES = 0x1;
export const LUA_ENGINE_899B940_IAT_LUA_TYPE = 0xb18400;
export const LUA_ENGINE_899B940_CHECKGET_KEY = 0xc829d1;
export const LUA_ENGINE_899B940_CHECKGET_INDEX = 0x1;
export const LUA_ENGINE_899B940_CHECKGET_DEF_ARG = 0x0;
export const LUA_ENGINE_899B940_CHECKGET_FIELD_OFF = 0x4;
export const LUA_ENGINE_899B940_CHECKGET_HELPER_VA = 0x85c590;
export const LUA_ENGINE_899B940_IAT_LUA_TOUSERDATA = 0xb183b0;
export const LUA_ENGINE_899B940_TOUSERDATA_INDEX_U32 = 0xfff0b9d7;
export const LUA_ENGINE_899B940_UD_FN_POINTER_CALL = 0x1;
export const LUA_ENGINE_899B940_METHOD_STACK_ARGS = 0x1;
export const LUA_ENGINE_899B940_METHOD_I32_ARG = 0x1;
export const LUA_ENGINE_899B940_IAT_LUAL_CHECKINTEGER = 0xb183f4;
export const LUA_ENGINE_899B940_CHECKINTEGER_INDEX = 0x2;
export const LUA_ENGINE_899B940_RETURN_VALUE = 0x0;
export function luaEngine899b940HostVa() { return LUA_ENGINE_899B940_VA >>> 0; }
export function luaEngine899b940EndVa() { return LUA_ENGINE_899B940_END_VA >>> 0; }
export function luaEngine899b940NextVa() { return LUA_ENGINE_899B940_NEXT_VA >>> 0; }
export function luaEngine899b940StackArgs() { return LUA_ENGINE_899B940_STACK_ARGS >>> 0; }
export function luaEngine899b940EcxArg() { return LUA_ENGINE_899B940_ECX_ARG >>> 0; }
export function luaEngine899b940CalleePopsStackArgs() { return LUA_ENGINE_899B940_CALLEE_POPS_STACK_ARGS >>> 0; }
export function luaEngine899b940AlignedPrologue() { return LUA_ENGINE_899B940_ALIGNED_PROLOGUE >>> 0; }
export function luaEngine899b940GateInvertedEncoding() { return LUA_ENGINE_899B940_GATE_INVERTED_ENCODING >>> 0; }
export function luaEngine899b940TypeGates() { return LUA_ENGINE_899B940_TYPE_GATES >>> 0; }
export function luaEngine899b940IatLuaType() { return LUA_ENGINE_899B940_IAT_LUA_TYPE >>> 0; }
export function luaEngine899b940CheckgetKey() { return LUA_ENGINE_899B940_CHECKGET_KEY >>> 0; }
export function luaEngine899b940CheckgetIndex() { return LUA_ENGINE_899B940_CHECKGET_INDEX >>> 0; }
export function luaEngine899b940CheckgetDefArg() { return LUA_ENGINE_899B940_CHECKGET_DEF_ARG >>> 0; }
export function luaEngine899b940CheckgetFieldOff() { return LUA_ENGINE_899B940_CHECKGET_FIELD_OFF >>> 0; }
export function luaEngine899b940CheckgetHelperVa() { return LUA_ENGINE_899B940_CHECKGET_HELPER_VA >>> 0; }
export function luaEngine899b940IatLuaTouserdata() { return LUA_ENGINE_899B940_IAT_LUA_TOUSERDATA >>> 0; }
export function luaEngine899b940TouserdataIndex() { return LUA_ENGINE_899B940_TOUSERDATA_INDEX_U32 >>> 0; }
export function luaEngine899b940UdFnPointerCall() { return LUA_ENGINE_899B940_UD_FN_POINTER_CALL >>> 0; }
export function luaEngine899b940MethodStackArgs() { return LUA_ENGINE_899B940_METHOD_STACK_ARGS >>> 0; }
export function luaEngine899b940MethodI32Arg() { return LUA_ENGINE_899B940_METHOD_I32_ARG >>> 0; }
export function luaEngine899b940IatLualCheckinteger() { return LUA_ENGINE_899B940_IAT_LUAL_CHECKINTEGER >>> 0; }
export function luaEngine899b940CheckintegerIndex() { return LUA_ENGINE_899B940_CHECKINTEGER_INDEX >>> 0; }
export function luaEngine899b940ReturnValue() { return LUA_ENGINE_899B940_RETURN_VALUE >>> 0; }
/** ==== ABI v103: wrapper-band continuation — 0x0089b9b0
 * (i32 sext getter, completes census key 0xc829d1 slot-96 pair) +
 * 0x0089ba10 (TWO-GATE WRAP SETTER, v94 0x89b090 shape, census
 * ordinal 29 on the new band). ====
 *
 * 0x89b9b0..0x89ba0b (pad to 0x89ba10) — I32 SEXT GETTER (v100
 * 0x89b760 shape): plain prologue; full-word lua_type(L,1) `jne`
 * (nil -> obj 0); check/get(key 0xc829d1, idx 1, DEF 1) ->
 * obj=[obj+4]; touserdata(upvalueindex 1); method fn ptr [ud+0]
 * called directly this=obj (0 stack args), int32 return eax ->
 * edx; host i32-sext pusher 0x85bfd0(ecx=L, edx=v); ret 1.
 * Zero-resync exact span (36 insns).
 *
 * 0x89ba10..0x89bab2 (pad to 0x89bac0) — TWO-GATE WRAP SETTER (v94
 * 0x89b090 shape): aligned prologue (`and esp,-8`, sub esp,0xc);
 * full-word lua_type(L,1) `jne` (nil -> val slot 0); check/get(key
 * 0xc829d1, idx 1, def 0) -> val=[obj+4]; touserdata(upvalueindex
 * 1); full-word lua_type(L,2) `jne`: NIL -> method(0) through
 * [ud+0] fn ptr with this=val; else wrap check/get(key 0xc829c8,
 * idx 2, def 0) -> method([wrap+4]) this=val; xor eax,eax; ret 0.
 * Zero-resync exact span (61 insns).
 *
 * NEXT frontier 0x89bac0 (uncensused gap body — plain prologue type
 * gate; census resumes at 0x89bb60 on key 0xc829ce slot 90).
 */
/** 0x89b9b0 law: FULL-WORD lua_type(L,1) gate (`jne`).
 * taken <=> typeResult !== 0. */
export function luaEngine899b9b0Type1GateTaken(typeResult) {
  return typeResult !== 0 ? 1 : 0;
}
export const LUA_ENGINE_899B9B0_VA = 0x89b9b0;
export const LUA_ENGINE_899B9B0_END_VA = 0x89ba0c;
export const LUA_ENGINE_899B9B0_NEXT_VA = 0x89ba10;
export const LUA_ENGINE_899B9B0_STACK_ARGS = 0x1;
export const LUA_ENGINE_899B9B0_ECX_ARG = 0x0;
export const LUA_ENGINE_899B9B0_CALLEE_POPS_STACK_ARGS = 0x0;
export const LUA_ENGINE_899B9B0_ALIGNED_PROLOGUE = 0x0;
export const LUA_ENGINE_899B9B0_GATE_INVERTED_ENCODING = 0x0;
export const LUA_ENGINE_899B9B0_TYPE_GATES = 0x1;
export const LUA_ENGINE_899B9B0_IAT_LUA_TYPE = 0xb18400;
export const LUA_ENGINE_899B9B0_CHECKGET_KEY = 0xc829d1;
export const LUA_ENGINE_899B9B0_CHECKGET_INDEX = 0x1;
export const LUA_ENGINE_899B9B0_CHECKGET_DEF_ARG = 0x1;
export const LUA_ENGINE_899B9B0_CHECKGET_FIELD_OFF = 0x4;
export const LUA_ENGINE_899B9B0_CHECKGET_HELPER_VA = 0x85c590;
export const LUA_ENGINE_899B9B0_IAT_LUA_TOUSERDATA = 0xb183b0;
export const LUA_ENGINE_899B9B0_TOUSERDATA_INDEX_U32 = 0xfff0b9d7;
export const LUA_ENGINE_899B9B0_UD_FN_POINTER_CALL = 0x1;
export const LUA_ENGINE_899B9B0_METHOD_STACK_ARGS = 0x0;
export const LUA_ENGINE_899B9B0_METHOD_I32_RETURN = 0x1;
export const LUA_ENGINE_899B9B0_I32_SEXT_PUSHER_HELPER_VA = 0x85bfd0;
export const LUA_ENGINE_899B9B0_RETURN_VALUE = 0x1;
export function luaEngine899b9b0HostVa() { return LUA_ENGINE_899B9B0_VA >>> 0; }
export function luaEngine899b9b0EndVa() { return LUA_ENGINE_899B9B0_END_VA >>> 0; }
export function luaEngine899b9b0NextVa() { return LUA_ENGINE_899B9B0_NEXT_VA >>> 0; }
export function luaEngine899b9b0StackArgs() { return LUA_ENGINE_899B9B0_STACK_ARGS >>> 0; }
export function luaEngine899b9b0EcxArg() { return LUA_ENGINE_899B9B0_ECX_ARG >>> 0; }
export function luaEngine899b9b0CalleePopsStackArgs() { return LUA_ENGINE_899B9B0_CALLEE_POPS_STACK_ARGS >>> 0; }
export function luaEngine899b9b0AlignedPrologue() { return LUA_ENGINE_899B9B0_ALIGNED_PROLOGUE >>> 0; }
export function luaEngine899b9b0GateInvertedEncoding() { return LUA_ENGINE_899B9B0_GATE_INVERTED_ENCODING >>> 0; }
export function luaEngine899b9b0TypeGates() { return LUA_ENGINE_899B9B0_TYPE_GATES >>> 0; }
export function luaEngine899b9b0IatLuaType() { return LUA_ENGINE_899B9B0_IAT_LUA_TYPE >>> 0; }
export function luaEngine899b9b0CheckgetKey() { return LUA_ENGINE_899B9B0_CHECKGET_KEY >>> 0; }
export function luaEngine899b9b0CheckgetIndex() { return LUA_ENGINE_899B9B0_CHECKGET_INDEX >>> 0; }
export function luaEngine899b9b0CheckgetDefArg() { return LUA_ENGINE_899B9B0_CHECKGET_DEF_ARG >>> 0; }
export function luaEngine899b9b0CheckgetFieldOff() { return LUA_ENGINE_899B9B0_CHECKGET_FIELD_OFF >>> 0; }
export function luaEngine899b9b0CheckgetHelperVa() { return LUA_ENGINE_899B9B0_CHECKGET_HELPER_VA >>> 0; }
export function luaEngine899b9b0IatLuaTouserdata() { return LUA_ENGINE_899B9B0_IAT_LUA_TOUSERDATA >>> 0; }
export function luaEngine899b9b0TouserdataIndex() { return LUA_ENGINE_899B9B0_TOUSERDATA_INDEX_U32 >>> 0; }
export function luaEngine899b9b0UdFnPointerCall() { return LUA_ENGINE_899B9B0_UD_FN_POINTER_CALL >>> 0; }
export function luaEngine899b9b0MethodStackArgs() { return LUA_ENGINE_899B9B0_METHOD_STACK_ARGS >>> 0; }
export function luaEngine899b9b0MethodI32Return() { return LUA_ENGINE_899B9B0_METHOD_I32_RETURN >>> 0; }
export function luaEngine899b9b0I32SextPusherHelperVa() { return LUA_ENGINE_899B9B0_I32_SEXT_PUSHER_HELPER_VA >>> 0; }
export function luaEngine899b9b0ReturnValue() { return LUA_ENGINE_899B9B0_RETURN_VALUE >>> 0; }
/** 0x89ba10 law: FULL-WORD lua_type(L,1) gate (`jne`).
 * taken <=> typeResult !== 0. */
export function luaEngine899ba10Type1GateTaken(typeResult) {
  return typeResult !== 0 ? 1 : 0;
}
/** 0x89ba10 law: FULL-WORD lua_type(L,2) gate (`jne`) selects the
 * wrap path. taken <=> typeResult !== 0. */
export function luaEngine899ba10Type2GateTaken(typeResult) {
  return typeResult !== 0 ? 1 : 0;
}
export const LUA_ENGINE_899BA10_VA = 0x89ba10;
export const LUA_ENGINE_899BA10_END_VA = 0x89bab3;
export const LUA_ENGINE_899BA10_NEXT_VA = 0x89bac0;
export const LUA_ENGINE_899BA10_STACK_ARGS = 0x1;
export const LUA_ENGINE_899BA10_ECX_ARG = 0x0;
export const LUA_ENGINE_899BA10_CALLEE_POPS_STACK_ARGS = 0x0;
export const LUA_ENGINE_899BA10_ALIGNED_PROLOGUE = 0x1;
export const LUA_ENGINE_899BA10_GATE_INVERTED_ENCODING = 0x0;
export const LUA_ENGINE_899BA10_TYPE_GATES = 0x2;
export const LUA_ENGINE_899BA10_IAT_LUA_TYPE = 0xb18400;
export const LUA_ENGINE_899BA10_CHECKGET_KEY = 0xc829d1;
export const LUA_ENGINE_899BA10_CHECKGET_INDEX = 0x1;
export const LUA_ENGINE_899BA10_CHECKGET_DEF_ARG = 0x0;
export const LUA_ENGINE_899BA10_CHECKGET_FIELD_OFF = 0x4;
export const LUA_ENGINE_899BA10_CHECKGET_HELPER_VA = 0x85c590;
export const LUA_ENGINE_899BA10_IAT_LUA_TOUSERDATA = 0xb183b0;
export const LUA_ENGINE_899BA10_TOUSERDATA_INDEX_U32 = 0xfff0b9d7;
export const LUA_ENGINE_899BA10_UD_FN_POINTER_CALL = 0x1;
export const LUA_ENGINE_899BA10_METHOD_STACK_ARGS = 0x1;
export const LUA_ENGINE_899BA10_NIL_PATH_METHOD_ARG = 0x0;
export const LUA_ENGINE_899BA10_WRAP_CHECKGET_KEY = 0xc829c8;
export const LUA_ENGINE_899BA10_WRAP_CHECKGET_INDEX = 0x2;
export const LUA_ENGINE_899BA10_WRAP_CHECKGET_DEF_ARG = 0x0;
export const LUA_ENGINE_899BA10_RETURN_VALUE = 0x0;
export function luaEngine899ba10HostVa() { return LUA_ENGINE_899BA10_VA >>> 0; }
export function luaEngine899ba10EndVa() { return LUA_ENGINE_899BA10_END_VA >>> 0; }
export function luaEngine899ba10NextVa() { return LUA_ENGINE_899BA10_NEXT_VA >>> 0; }
export function luaEngine899ba10StackArgs() { return LUA_ENGINE_899BA10_STACK_ARGS >>> 0; }
export function luaEngine899ba10EcxArg() { return LUA_ENGINE_899BA10_ECX_ARG >>> 0; }
export function luaEngine899ba10CalleePopsStackArgs() { return LUA_ENGINE_899BA10_CALLEE_POPS_STACK_ARGS >>> 0; }
export function luaEngine899ba10AlignedPrologue() { return LUA_ENGINE_899BA10_ALIGNED_PROLOGUE >>> 0; }
export function luaEngine899ba10GateInvertedEncoding() { return LUA_ENGINE_899BA10_GATE_INVERTED_ENCODING >>> 0; }
export function luaEngine899ba10TypeGates() { return LUA_ENGINE_899BA10_TYPE_GATES >>> 0; }
export function luaEngine899ba10IatLuaType() { return LUA_ENGINE_899BA10_IAT_LUA_TYPE >>> 0; }
export function luaEngine899ba10CheckgetKey() { return LUA_ENGINE_899BA10_CHECKGET_KEY >>> 0; }
export function luaEngine899ba10CheckgetIndex() { return LUA_ENGINE_899BA10_CHECKGET_INDEX >>> 0; }
export function luaEngine899ba10CheckgetDefArg() { return LUA_ENGINE_899BA10_CHECKGET_DEF_ARG >>> 0; }
export function luaEngine899ba10CheckgetFieldOff() { return LUA_ENGINE_899BA10_CHECKGET_FIELD_OFF >>> 0; }
export function luaEngine899ba10CheckgetHelperVa() { return LUA_ENGINE_899BA10_CHECKGET_HELPER_VA >>> 0; }
export function luaEngine899ba10IatLuaTouserdata() { return LUA_ENGINE_899BA10_IAT_LUA_TOUSERDATA >>> 0; }
export function luaEngine899ba10TouserdataIndex() { return LUA_ENGINE_899BA10_TOUSERDATA_INDEX_U32 >>> 0; }
export function luaEngine899ba10UdFnPointerCall() { return LUA_ENGINE_899BA10_UD_FN_POINTER_CALL >>> 0; }
export function luaEngine899ba10MethodStackArgs() { return LUA_ENGINE_899BA10_METHOD_STACK_ARGS >>> 0; }
export function luaEngine899ba10NilPathMethodArg() { return LUA_ENGINE_899BA10_NIL_PATH_METHOD_ARG >>> 0; }
export function luaEngine899ba10WrapCheckgetKey() { return LUA_ENGINE_899BA10_WRAP_CHECKGET_KEY >>> 0; }
export function luaEngine899ba10WrapCheckgetIndex() { return LUA_ENGINE_899BA10_WRAP_CHECKGET_INDEX >>> 0; }
export function luaEngine899ba10WrapCheckgetDefArg() { return LUA_ENGINE_899BA10_WRAP_CHECKGET_DEF_ARG >>> 0; }
export function luaEngine899ba10ReturnValue() { return LUA_ENGINE_899BA10_RETURN_VALUE >>> 0; }
