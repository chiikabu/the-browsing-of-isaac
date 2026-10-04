/** Independent JS oracle for Game::Exit pure field teardown helpers
 *  (VA 0x006fa0c0). Do not derive mechanically from the C++ implementation.
 *  ABI v2: PE-ordered islands, post-log pack, nested 0x006f43b0 / 0x006f4520.
 *  ABI v3: residual after ItemOverlay clear — 0x18990 entity copy nest,
 *  0x00421260 mode/float peels, map value +0x28 clear.
 *  ABI v4: pure prefix of residual host 0x009b5cb0 (this = Game+0x23a74).
 *  ABI v5: pure islands inside nested residual 0x008d3250
 *  (this = Game+0x23a74+0x838).
 *  ABI v6: pure islands inside residual 0x009b9150
 *  (this = Game+0x1baa8; PlayerManager layout hint).
 *  ABI v7: pure islands inside residual 0x009a27d0
 *  (this = Game+0x1da04; near HUD).
 *  ABI v8: pure islands inside residual 0x009a19a0
 *  (this = Game+0x1da04; same receiver).
 *  ABI v9: pure islands / CF inside residual 0x0040e910
 *  (global tree walk / COM release) + freestanding tree iterator++.
 *  ABI v10: map walk Game+0x1a738 + residual 0x0069d690 pure islands
 *  (SSO + pure string compare 0x00423480 + post-lower_bound hit select).
 *  ABI v11: pure islands + pure-complete lower_bound 0x00685bc0 and
 *  pure-complete find 0x0069d690 (linear-memory tree + string compare).
 *  ABI v12: pure islands / CF inside residual host 0x0040c7f0 + nested
 *  ctor 0x0040cc10 pure field pack (alloc/virtual/callback residual).
 *  ABI v13: pure islands / CF inside residual host 0x00408830
 *  (entry store, free gates, alloc size/fill, terminal pack; free/alloc
 *  0xa648b0 + memset 0xaf05e5 residual).
 *  ABI v14: pure islands / CF inside residual host 0x009b4810
 *  (vector end reset, mode gates, id tables, push-0x1c CF, terminal pack;
 *  grow 0x428590 + ANM2/string hosts residual).
 *  ABI v15: pure size/cap CF inside residual grow 0x00428590
 *  (SAR32 size/cap/insert, 1.5x geo new_cap, alloc bytes, free CF;
 *  alloc/memmove/free/throw remain host).
 *  ABI v16: pure islands / CF from freestanding ANM2 residual hosts
 *  ANM2::GetLayer(int) 0x40b220, ANM2::Load 0x40bd50, nested alloc
 *  0x40cf00 pure size (header/align); string/parse/alloc bodies residual.
 *  ABI v17: pure islands / CF from exact ANM2::ReplaceSpritesheet 0x40bf30
 *  (range, sized equality 0x40cae0, assign gate, flag30 clear) and
 *  Play-by-name residual 0x40a5d0 (anim table scan + reset host gate;
 *  no exact ZHL Play match).
 *  ABI v18: pure islands / CF from exact AnimationState::Rewind 0x40a1b0
 *  (entry zeros +0x10/+0x18/+0x1c; nested 0x408c90 event-mask pure body;
 *  post-call layer/null dword zero loops; null-anim log residual).
 *  ABI v19: pure islands / CF from residual MSVC string assign 0x40ccd0
 *  (fits-capacity, length-error, new_cap |0xf / 1.5x MAX clamp, alloc
 *  size new_cap+1, old free CF, pure size/cap/ptr/null stores; copy/alloc
 *  body/free/throw residual).
 *  ABI v20: pure islands / CF from freestanding keep-set residual
 *  0x00408970 (null-safe counts, signed resize gates, alloc/fill/copy
 *  size CF, heap-stats free base, pure field stores; free/alloc/memset/
 *  memcpy/IAT free residual).
 *  ABI v21: pure islands / CF from freestanding Load nested residual
 *  0x0040db90 (path-size early return, QPC timing high-mul>>18, cache
 *  list space/walk CF, post-lower_bound hit select, insert gate, layer
 *  alloc/loop/field pack, name self-assign skip; QPC/IAT/tree/file/
 *  free/alloc/layer-copy/string/log residual).
 *  ABI v22: pure islands / CF from freestanding Load sibling residual
 *  0x0040e110 (cache space test mask, walk CF, grow-install gate,
 *  grow-result triple zero, path SSO data, post-lower_bound hit select,
 *  pure refcount++ at node+0x50 on hit; IAT/hash/tree/log residual).
 *  ABI v23: pure islands / CF from freestanding ANM2 graphics walk
 *  residual 0x0040c000 (layer count loop, stride 0xa0, flag+0x30 skip,
 *  PNG SSO path, shared/virtual → graphics flag, pair zero/assign,
 *  callback gate, pure +0x30/+0x31 stores; pure-complete 0x40c1e0;
 *  LoadImage/SP/graphics/sprite/COM residual).
 *  ABI v24: pure islands / CF from freestanding layer-attach residual
 *  0x00408640 (source-present gate, 4-dword field copy src+0x30→layer+0x20,
 *  pair slot layer+0x98, ctrl/virtual/callback COM gates; host exact
 *  KAGE_SmartPointer_ImageBase::swap 0x40c3b0 + virtual release residual).
 *  ABI v25: residual bodies reached from 0x009a19a0 / 0x009a27d0 —
 *  per-slot 0x00841cf0 (P0 0x18-element pack, head zero bytes, P1/P2
 *  pre-stores + pair host gates, vector walk + recaptured end←begin,
 *  word +0x6ac, terminal dword), 0x0083abb0 (two blocks: walk, recaptured
 *  end←begin, flag/field zeros, terminal byte), shared range COM destroy
 *  CF for 0x00709380 / 0x00709300, and pure-complete tail-jmp 0x0084bfd0
 *  (two 0xcc blocks, 0x14-byte elements, 0.1f slots, terminal byte).
 *  ABI v26: last two non-ANM2 hosts of the 0x009a27d0 slot triple —
 *  0x00840f70 (two owned buffers, heap-accounting base select, 64-bit
 *  borrow subtract of the ptr-4 header size, IAT free host, slot clear)
 *  and 0x00709150 (0x18 alloc host, post-ctor vtable 0xb67f98 + field
 *  0x14 clear, old-object COM release gated on DAT_00c71644, terminal
 *  pair store *this=0 / this+4=new). Allocator and IAT free stay host.
 *  ABI v27: teardown residual 0x00a1ad90 — block A pointer free gate at
 *  +0x28 (host 0x00a648b0 takes the pointer in EDX), block B counted
 *  array at +0x3c whose free size uses the count RE-READ after the dtor
 *  iterator, block C MSVC tree clear at +0x40 using the PRE-call head,
 *  and a terminal pack whose first store is a BYTE. Also the recovered
 *  call shape of host 0x00a648b0 (mode from the CL low byte only).
 *  ABI v28: pair CONSTRUCTOR 0x0040c4a0 (entry pair zero before the
 *  allocator, recaptured old-object gate that is NOT folded, terminal
 *  stores object-first, returns this) and recursive tree _Erase
 *  0x00415800 (byte _Isnil test, node size 0x1c, COM control at +0x18,
 *  callback arg +0x14, reverse in-order free enumeration).
 *  ABI v29: correctness-only bump. Every byte-wide scalar parameter of the
 *  C++ family was widened uint8_t -> uint32_t and re-narrowed in the body,
 *  because the Wasm ABI does not narrow i32 arguments and -O2 deleted the
 *  redundant-looking mask on a uint8_t parameter. The oracle side below was
 *  ALREADY correct (every byte gate here masks with & 0xff), which is
 *  precisely why the differential stayed green: the Wasm-side draws were
 *  masked before the call, so the divergent input class (> 0xff) was never
 *  presented. Do not remove the masks in this file — they are the reference
 *  the C++ is now checked against at 0x100 / 0x1ff / 0xffffffff.
 *  ABI v30: keyed registry store/release 0x0040e520 (one by-value
 *  {value, ctrl} pair, NOT two args; the control word is re-read after the
 *  host calls; the entry gate is a full-dword test while the release gate is
 *  a low-byte test) plus its key derivation 0x00a159d0, a djb2 hash that
 *  lower-cases ASCII A-Z only and normalises '\\' to '/'.
 *  ABI v36: complete body of 0x007df690 (7-slot volume setter) — slot
 *  address math, plan-time object-presence census, float store at +0x14;
 *  the two vtable leaves (+0x28 gate / +0x58 set) stay host.
 *  ABI v37: Exit-root prologue 0x008650a0 — FULL-dword 0x20000
 *  gate, engine+0x10 holder math, pack stores {0x11, -1, holder};
 *  0x874a10 / luaL_unref IAT 0xb1831c / logger / 0x693180 / SEH stay host.
 *  ABI v38: Exit nest 0x00686950 — UNSIGNED dword [this]>1 gate, pack
 *  stores {4, 0, byte Manager+0x4abc7=1} before I/O gates; sprintf /
 *  remove IAT / fopen / virtuals stay host. 1075 B window is 3 funcs.
 *  ABI v39: GameState write 0x00958ed0 — FULL-dword [Manager+8]==2,
 *  UNSIGNED [Game+0x26630]==0, vec empty, LOW-BYTE player+0x173 then
 *  SIGNED GetExtraLives>=1; pack byte 0x20dcc=1; GetPlayer / SaveState /
 *  fopen / write / PGD 0x9292c0 / Steam stay host. Sibling 0x00959130
 *  not folded (distinct IAT/CF).
 *  ABI v40: GameState delete 0x00959130 — UNSIGNED [Game+0x26630]==0 +
 *  FULL-dword vec-empty prefix (shared with v39 write, NOT folded:
 *  distinct CF: single host GameState::Delete @ 0x9c8350, this=Manager+
 *  0xfa4; distinct stores), pure stores dword [0xf98]=0 / byte [0x14]=1
 *  / byte [0x4b284]=0; no IAT, no PGD, no Steam.
 *  ABI v41: 0x0040e910 decision laws — per-iteration walk-continue
 *  (sentinel RE-READ from DAT_00c78ee8), COM release arg laws (this =
 *  obj+8, stack arg -1) and state law (16-bit movzx word at obj+4);
 *  COM vtable calls, virtual dtor, callback, erase/free stay typed-host.
 *  ABI v43: the remaining decision surface of the host 0x00a648b0 body —
 *  full mode dispatch (low byte of CL; 0 empty / 1 free / 2 stats-add /
 *  >= 3 empty), the mode-2 stats-add path (base = DAT_00c7de78 + 0x30
 *  DIRECTLY with NO fallback — the mode-1 esi select/fallback does not
 *  apply here; addends from DAT_00c7f618 / DAT_00c7f61c; 64-bit add with
 *  carry), and a packed mode plan. Mode-1's 64-bit borrow subtract is the
 *  v26 0x00840f70 arithmetic (referenced, not duplicated); IAT free
 *  0x00b187dc stays host.
 *  ABI v44: fully pure thiscall predicate 0x006f0040 (the exit band-scan
 *  find: corrected capstone caller census over the Game-method band
 *  0x006f0000..0x006fadb3 — 0x006f0040 is the only caller-bearing,
 *  fully-pure, unclaimed body; 0x006f8120/0x006f8100 are exact ZHL
 *  Game::IsGreedMode/IsHardMode held host by frame-effect+room,
 *  0x006f5210 is the Lua "Fadein" real_fn, 0x006f9730 is process-input,
 *  0x006f0090 a frame-effect host leaf). 0 E8 / 0 indirect / 0 stores;
 *  four FULL-dword gates in machine order (ptr null, -1 sentinel, SIGNED
 *  jge, self-alias), AL 0/1 return.
 *  ABI v45: fully pure static membership predicate 0x0071df80 (the band
 *  RE-scan find: corrected census over the full coordinator extent
 *  0x006f0000..0x007c0000 — the only remaining caller-bearing unlanded
 *  pure body; 2 callers 0x0071ead7/0x0071ebda; the census store counter
 *  was also fixed this unit so add/inc/dec/or/and/xor/sub MEM writes
 *  count as stores, removing the 0x704b30/40/50 trio from the pure
 *  class). Game global DAT_00c71678 -> Game+0x18300 (Game::_room) ->
 *  room+0x1d18 (room state id); eight FULL-dword cmp eax, imm member
 *  gates {0xa,0xb,0xc,0xd,0x22,0x2b,0x2c,0x30}, AL 0/1 return. */

export const EXIT_PURE_ABI_VERSION = 48;

export const EXIT_VECTOR_25EBC_STRIDE = 0x38;
export const EXIT_VECTOR_25EBC_DTOR_THIS_DELTA = 8;
export const EXIT_SFX_STOP_COUNT = 5;
export const EXIT_6F4520_EFFECT_SLOT_COUNT = 7;

export const EXIT_RESIDUAL_BASE_OFF = 0x18990;
export const EXIT_RESIDUAL_OUTER_COUNT = 0x25;
export const EXIT_RESIDUAL_OUTER_STRIDE = 0xc4;
export const EXIT_RESIDUAL_MID_COUNT = 2;
export const EXIT_RESIDUAL_MID_STRIDE = 0x2c;
export const EXIT_RESIDUAL_SLOT_FLAG_OFF = 0xc;
export const EXIT_RESIDUAL_ENTITY_STRIDE = 0x5c;
export const EXIT_RESIDUAL_ENTITY_SRC_OFF = 0x30;
export const EXIT_RESIDUAL_ENTITY_DST_OFF = 0x34;

export const EXIT_POSTLOG_F32_1BA90_BITS = 0x3760371c;
export const EXIT_POSTLOG_F32_1BA94_BITS = 0x37873770;
export const EXIT_POSTLOG_I32_1BA80 = 0x32;
export const EXIT_6F4520_I32_2652C = 0x1e;
export const EXIT_6F4520_F32_26530_BITS = 0x3f800000;
export const EXIT_6F4520_I32_26574 = 0x0a;
export const EXIT_6F4520_I32_676AC = 0xffffffff;
export const EXIT_6F43B0_F32_67740_BITS = 0x3a83126f;
export const EXIT_F32_ONE_BITS = 0x3f800000;
export const EXIT_MANAGER_2A338_BITS = 0x3ba3d70a;
export const EXIT_9B5CB0_THIS_OFF = 0x23a74;
export const EXIT_9B5CB0_FIELD_8_VALUE = 2;
export const EXIT_9B5CB0_HOST_7C_OFF = 0x7c;
export const EXIT_9B5CB0_HOST_190_OFF = 0x190;
export const EXIT_9B5CB0_HOST_5B0_OFF = 0x5b0;
export const EXIT_9B5CB0_HOST_838_OFF = 0x838;
export const EXIT_9B5CB0_HOST_47C_OFF = 0x47c;

export const EXIT_8D3250_THIS_FROM_9B5CB0 = 0x838;
export const EXIT_8D3250_THIS_FROM_GAME = 0x242ac;
export const EXIT_8D3250_FIELD_178_VALUE = 0xffffffff;
export const EXIT_8D3250_HOST_3C_OFF = 0x3c;
export const EXIT_8D3250_HOST_50_OFF = 0x50;
export const EXIT_8D3250_HOST_64_OFF = 0x64;
export const EXIT_8D3250_HOST_304_OFF = 0x304;
export const EXIT_8D3250_LIST_OBJ_OFF = 0x1e8;
export const EXIT_8D3250_LIST_HEADER_OFF = 0x120;
/* ABI v42: GetLayer/list-destroy decision constants (PE 0x008d32f6 /
   0x008d3306 / 0x008d333d; "Cursor" @ .rdata raw 0x76d734). */
export const EXIT_8D3250_CURSOR_VA = 0xb75734;
export const EXIT_8D3250_LAYER_CLEAR_OFF = 0x74;
export const EXIT_8D3250_LIST_ARG1_OFF = 4;

export const EXIT_9B9150_THIS_FROM_GAME = 0x1baa8;
export const EXIT_9B9150_ESAU_SLOT_COUNT = 4;
export const EXIT_9B9150_TAIL_COUNT = 4;
export const EXIT_9B9150_TAIL_VALUE = 0xffffffff;
export const EXIT_9B9150_FIELD_5C_VALUE = 1;
export const EXIT_9B9150_PLAYER_LIST_BEGIN_OFF = 0x0;
export const EXIT_9B9150_PLAYER_LIST_END_OFF = 0x4;
export const EXIT_9B9150_ESAU_SLOTS_OFF = 0x80;
export const EXIT_9B9150_FIELD_5C_OFF = 0x5c;
export const EXIT_9B9150_TAIL_OFF = 0x60;
export const EXIT_9B9150_FIELD_7C_OFF = 0x7c;
export const EXIT_9B9150_FIELD_C8_OFF = 0xc8;
export const EXIT_9B9150_FIELD_CC_OFF = 0xcc;
export const EXIT_9B9150_EXTRA_LIST_BEGIN_OFF = 0xd0;
export const EXIT_9B9150_EXTRA_LIST_END_OFF = 0xd4;

export const EXIT_9A27D0_THIS_FROM_GAME = 0x1da04;
export const EXIT_9A27D0_SLOT_FLAG_COUNT = 11;
export const EXIT_9A27D0_SLOT_FLAG_STRIDE = 0x1f4;
export const EXIT_9A27D0_SLOT_FLAG_BASE_OFF = 0x3ce4;
export const EXIT_9A27D0_FIELD_54CD_OFF = 0x54cd;
export const EXIT_9A27D0_SLOT_HOST_840F70_OFF = 0x3cdc;
export const EXIT_9A27D0_SLOT_FLAG_FROM_840F70 = 8;
export const EXIT_9A27D0_SLOT_HOST_709150_FROM_840F70 = 0x18;
export const EXIT_9A27D0_SLOT_HOST_RESET_FROM_840F70 = 0x20;
export const EXIT_9A27D0_PLAYERHUD_LOOP_COUNT = 8;
export const EXIT_9A27D0_PLAYERHUD_STRIDE = 0x6dc;
export const EXIT_9A27D0_HOST_536C_OFF = 0x536c;
export const EXIT_9A27D0_HOST_592C_OFF = 0x592c;
export const EXIT_9A27D0_HOST_5C54_OFF = 0x5c54;
export const EXIT_9A27D0_HOST_59A4_OFF = 0x59a4;

export const EXIT_9A19A0_THIS_FROM_GAME = 0x1da04;
export const EXIT_9A19A0_F32_5490_BITS = 0xbf800000;
export const EXIT_9A19A0_I32_M1 = 0xffffffff;
export const EXIT_9A19A0_FIELD_54D0_VALUE = 2;
export const EXIT_9A19A0_FIELD_54D8_VALUE = 2;
export const EXIT_9A19A0_FIELD_54CC_VALUE = 1;
export const EXIT_9A19A0_PLAYERHUD_LOOP_COUNT = 8;
export const EXIT_9A19A0_PLAYERHUD_STRIDE = 0x6dc;
export const EXIT_9A19A0_FIELD_5490_OFF = 0x5490;
export const EXIT_9A19A0_FIELD_5494_OFF = 0x5494;
export const EXIT_9A19A0_FIELD_5498_OFF = 0x5498;
export const EXIT_9A19A0_FIELD_549C_OFF = 0x549c;
export const EXIT_9A19A0_FIELD_54D0_OFF = 0x54d0;
export const EXIT_9A19A0_FIELD_54D4_OFF = 0x54d4;
export const EXIT_9A19A0_FIELD_54D8_OFF = 0x54d8;
export const EXIT_9A19A0_FIELD_54CC_OFF = 0x54cc;
export const EXIT_9A19A0_SLOT_BACKPTR_OFF = 4;
export const EXIT_9A19A0_SLOT_INDEX_OFF = 8;
export const EXIT_9A19A0_HOST_5C54_OFF = 0x5c54;
export const EXIT_9A19A0_HOST_59A4_OFF = 0x59a4;

export const EXIT_40E910_NODE_SIZE = 0x1c;
export const EXIT_40E910_NODE_OBJ_OFF = 0x18;
export const EXIT_40E910_NODE_HOST14_OFF = 0x14;
export const EXIT_40E910_OBJ_WORD_OFF = 4;
export const EXIT_40E910_OBJ_COM_OFF = 8;
export const EXIT_40E910_COM_FREE_WORD_MAX = 2;
export const EXIT_40E910_COM_RELEASE_ARG = 0xffffffff; /* push -1 */
export const EXIT_TREE_LEFT_OFF = 0;
export const EXIT_TREE_PARENT_OFF = 4;
export const EXIT_TREE_RIGHT_OFF = 8;
export const EXIT_TREE_ISNIL_OFF = 0xd;

export const EXIT_MAP_1A738_OFF = 0x1a738;
export const EXIT_MAP_NODE_KEY_OFF = 0x10;
export const EXIT_MAP_NODE_FLAG_OFF = 0x28;
export const EXIT_MAP_NODE_BEGIN_OFF = 0x44;
export const EXIT_MAP_NODE_END_OFF = 0x48;
export const EXIT_MAP_ELEM_STRIDE = 0x20;
export const EXIT_MAP_ELEM_HOST_OFF = 0x18;
export const EXIT_MSVC_STRING_SIZE_OFF = 0x10;
export const EXIT_MSVC_STRING_CAP_OFF = 0x14;
export const EXIT_MSVC_STRING_SSO_CAP = 0x10;
export const EXIT_LOWER_BOUND_TRIPLE_SIZE = 12;
export const EXIT_LOWER_BOUND_WALK_OFF = 0;
export const EXIT_LOWER_BOUND_BOUND_OFF = 4;
export const EXIT_LOWER_BOUND_BEST_OFF = 8;
export const EXIT_MAP_ROOT_FROM_SENTINEL_OFF = 4;

export const EXIT_40C7F0_ALLOC_SIZE = 0x18;
export const EXIT_40C7F0_VTABLE = 0x00b1a6e0;
export const EXIT_40C7F0_ARG_OFF = 0x14;
export const EXIT_40C7F0_PAIR_VALUE_OFF = 0;
export const EXIT_40C7F0_PAIR_OBJ_OFF = 4;
export const EXIT_40CC10_VTABLE = 0x00b1a6fc;
export const EXIT_40CC10_FIELD4 = 0x00010001;
export const EXIT_40CC10_SUB_VTABLE = 0x00b81c0c;
export const EXIT_40CC10_DEFAULT_INIT = 0x00a15770;

export const EXIT_408830_FIELD_4_OFF = 4;
export const EXIT_408830_FIELD_8_OFF = 8;
export const EXIT_408830_FIELD_C_OFF = 0xc;
export const EXIT_408830_FIELD_10_OFF = 0x10;
export const EXIT_408830_FIELD_14_OFF = 0x14;
export const EXIT_408830_FIELD_18_OFF = 0x18;
export const EXIT_408830_FIELD_1C_OFF = 0x1c;
export const EXIT_408830_ARG_COUNT_A_OFF = 0x1c;
export const EXIT_408830_ARG_COUNT_B_OFF = 0x24;
export const EXIT_408830_ELEM_SIZE = 4;
export const EXIT_408830_F32_10_BITS = 0xbf800000;
export const EXIT_408830_FILL_BYTE = 0xff;

/* ABI v20: residual keep-set host 0x00408970 */
export const EXIT_408970_FIELD_4_OFF = 4;
export const EXIT_408970_FIELD_8_OFF = 8;
export const EXIT_408970_FIELD_C_OFF = 0xc;
export const EXIT_408970_ARG_COUNT_A_OFF = 0x1c;
export const EXIT_408970_ARG_COUNT_B_OFF = 0x24;
export const EXIT_408970_ELEM_SIZE = 4;
export const EXIT_408970_FILL_BYTE = 0xff;
export const EXIT_408970_HEAP_STATS_GLOBAL = 0x00c7de78;
export const EXIT_408970_HEAP_STATS_DELTA = 0x30;
export const EXIT_408970_HEAP_STATS_FALLBACK = 0x00c7f618;

/* ABI v21: residual Load nested host 0x0040db90 */
export const EXIT_40DB90_PATH_SIZE_OFF = 0x10;
export const EXIT_40DB90_TIMING_MUL_LO = 0xd7b634db;
export const EXIT_40DB90_TIMING_MUL_HI = 0x431bde82;
export const EXIT_40DB90_TIMING_SHIFT = 0x12;
export const EXIT_40DB90_CACHE_MIN_SPACE = 4;
export const EXIT_40DB90_CACHE_PTR_STRIDE = 4;
export const EXIT_40DB90_NODE_ISNIL_OFF = 0xd;
export const EXIT_40DB90_NODE_KEY_OFF = 0x10;
export const EXIT_40DB90_NODE_FLAG14_OFF = 0x14;
export const EXIT_40DB90_NODE_LAYERS_OFF = 0x18;
export const EXIT_40DB90_NODE_COUNT_OFF = 0x1c;
export const EXIT_40DB90_NODE_FIELD20_OFF = 0x20;
export const EXIT_40DB90_NODE_FIELD24_OFF = 0x24;
export const EXIT_40DB90_NODE_FIELD28_OFF = 0x28;
export const EXIT_40DB90_NODE_FIELD2C_OFF = 0x2c;
export const EXIT_40DB90_NODE_FIELD30_OFF = 0x30;
export const EXIT_40DB90_NODE_FIELD34_OFF = 0x34;
export const EXIT_40DB90_NODE_NAME_OFF = 0x38;
export const EXIT_40DB90_ANM2_NAME_OFF = 0x18;
export const EXIT_40DB90_ANM2_LAYER_BASE_OFF = 0x7c;
export const EXIT_40DB90_ANM2_LAYER_COUNT_OFF = 0x80;
export const EXIT_40DB90_ANM2_FIELD74_OFF = 0x74;
export const EXIT_40DB90_ANM2_FIELD78_OFF = 0x78;
export const EXIT_40DB90_ANM2_FIELD84_OFF = 0x84;
export const EXIT_40DB90_ANM2_FIELD88_OFF = 0x88;
export const EXIT_40DB90_ANM2_FIELD8C_OFF = 0x8c;
export const EXIT_40DB90_ANM2_FIELD90_OFF = 0x90;
export const EXIT_40DB90_LAYER_STRIDE = 0xa0;
export const EXIT_40DB90_SRC_LAYER_STRIDE = 0x38;
export const EXIT_40DB90_LAYER_BACKPTR_OFF = 4;
export const EXIT_40DB90_HEADER_SIZE = 4;
export const EXIT_40DB90_HEAP_STATS_GLOBAL = 0x00c7de78;
export const EXIT_40DB90_HEAP_STATS_DELTA = 0x30;
export const EXIT_40DB90_HEAP_STATS_FALLBACK = 0x00c7f618;

/* ABI v22: residual Load sibling host 0x0040e110 */
export const EXIT_40E110_CACHE_BEGIN_ADDR = 0x00c798b8;
export const EXIT_40E110_CACHE_END_ADDR = 0x00c798bc;
export const EXIT_40E110_CACHE_CAP_ADDR = 0x00c798c0;
export const EXIT_40E110_TREE_SENTINEL_ADDR = 0x00c78ee0;
export const EXIT_40E110_CACHE_SPACE_MASK = 0xfffffffc;
export const EXIT_40E110_CACHE_PTR_STRIDE = 4;
export const EXIT_40E110_PATH_BUF_SIZE = 0x100;
export const EXIT_40E110_PATH_CAP_OFF = 0x14;
export const EXIT_40E110_PATH_SSO_CAP = 0x10;
export const EXIT_40E110_NODE_ISNIL_OFF = 0xd;
export const EXIT_40E110_NODE_KEY_OFF = 0x10;
export const EXIT_40E110_NODE_REFCOUNT_OFF = 0x50;
export const EXIT_40E110_GROW_TRIPLE_DWORDS = 3;

/* ABI v23: residual ANM2 graphics walk host 0x0040c000 */
export const EXIT_40C000_ANM2_LAYER_BASE_OFF = 0x7c;
export const EXIT_40C000_ANM2_LAYER_COUNT_OFF = 0x80;
export const EXIT_40C000_LAYER_STRIDE = 0xa0;
export const EXIT_40C000_LAYER_PNG_STR_OFF = 0x8;
export const EXIT_40C000_LAYER_FLAG30_OFF = 0x30;
export const EXIT_40C000_LAYER_FLAG31_OFF = 0x31;
export const EXIT_40C000_PATH_CAP_OFF = 0x14;
export const EXIT_40C000_PATH_SSO_CAP = 0x10;
export const EXIT_40C000_CALLBACK_GLOBAL = 0x00c7163c;
export const EXIT_40C000_SPRITE_FIELD_44_OFF = 0x44;
export const EXIT_40C1E0_FIELD0_VALUE = 0xffffffff;
export const EXIT_40C1E0_FIELD_C_VALUE = 1;

/* ABI v24: residual layer-attach host 0x00408640 */
export const EXIT_408640_DST_FIELD_OFF = 0x20;
export const EXIT_408640_SRC_FIELD_OFF = 0x30;
export const EXIT_408640_FIELD_DWORDS = 4;
export const EXIT_408640_PAIR_SLOT_OFF = 0x98;
export const EXIT_408640_CALLBACK_GLOBAL = 0x00c7163c;
export const EXIT_408640_VTBL_RELEASE_OFF = 0xc;

/* ABI v25: per-slot HUD residual 0x00841cf0 (this = 9a19a0 + i*0x6dc) */
export const EXIT_841CF0_HEAD_DWORD_OFF = 0xa;
export const EXIT_841CF0_HEAD_BYTE_OFF = 0xe;
export const EXIT_841CF0_HEAD_ZERO_BYTES = 5;
export const EXIT_841CF0_P0_BASE_OFF = 0x10;
export const EXIT_841CF0_P0_COUNT = 0x18;
export const EXIT_841CF0_P0_STRIDE = 0x10;
export const EXIT_841CF0_P0_VALUE_OFF = 0;
export const EXIT_841CF0_P0_FLAG_OFF = 4;
export const EXIT_841CF0_P0_PTR_A_OFF = 8;
export const EXIT_841CF0_P0_PTR_B_OFF = 0xc;
export const EXIT_841CF0_P0_PTR_VALUE = 0x00b1a4ec;
export const EXIT_841CF0_P1_BASE_OFF = 0x200;
export const EXIT_841CF0_P1_COUNT = 2;
export const EXIT_841CF0_P1_STRIDE = 0x18;
export const EXIT_841CF0_P1_HOST_OFF = 8;
export const EXIT_841CF0_P2_BASE_OFF = 0x190;
export const EXIT_841CF0_P2_COUNT = 4;
export const EXIT_841CF0_P2_STRIDE = 0x1c;
export const EXIT_841CF0_P2_HOST_A_OFF = 8;
export const EXIT_841CF0_P2_HOST_B_OFF = 0x10;
export const EXIT_841CF0_P2_TAIL_OFF = 0x18;
export const EXIT_841CF0_VEC_BEGIN_OFF = 0x6a0;
export const EXIT_841CF0_VEC_END_OFF = 0x6a4;
export const EXIT_841CF0_VEC_ELEM_STRIDE = 0xc;
export const EXIT_841CF0_VEC_ELEM_HOST_OFF = 4;
export const EXIT_841CF0_WORD_6AC_OFF = 0x6ac;
export const EXIT_841CF0_HOST_6B0_OFF = 0x6b0;
export const EXIT_841CF0_HOST_6CC_OFF = 0x6cc;
export const EXIT_841CF0_TERMINAL_OFF = 0;

/* ABI v25: residual 0x0083abb0 (this = 9a19a0 + 0x5c54) */
export const EXIT_83ABB0_BLOCK_COUNT = 2;
export const EXIT_83ABB0_BLOCK_STRIDE = 0x14;
export const EXIT_83ABB0_FIELD0_OFF = 0;
export const EXIT_83ABB0_FLAG4_OFF = 4;
export const EXIT_83ABB0_VEC_BEGIN_OFF = 8;
export const EXIT_83ABB0_VEC_END_OFF = 0xc;
export const EXIT_83ABB0_ELEM_STRIDE = 0x28;
export const EXIT_83ABB0_ELEM_HOST_OFF = 4;
export const EXIT_83ABB0_TERMINAL_OFF = 0x28;

/* ABI v25: shared range COM destroy hosts 0x00709380 / 0x00709300 */
export const EXIT_RANGE_DESTROY_CTRL_OFF = 8;
export const EXIT_RANGE_DESTROY_CB_ARG_OFF = 4;
export const EXIT_RANGE_DESTROY_VTBL_RELEASE_OFF = 0xc;
export const EXIT_RANGE_DESTROY_CALLBACK_GLOBAL = 0x00c7163c;
export const EXIT_709380_ELEM_STRIDE = 0xc;
export const EXIT_709300_ELEM_STRIDE = 0x28;

/* ABI v25: pure-complete tail-jmp 0x0084bfd0 (this = 9a19a0 + 0x59a4) */
export const EXIT_84BFD0_THIS_FROM_9A19A0 = 0x59a4;
export const EXIT_84BFD0_THIS_FROM_GAME = 0x233a8;
export const EXIT_84BFD0_BLOCK_COUNT = 2;
export const EXIT_84BFD0_BLOCK_STRIDE = 0xcc;
export const EXIT_84BFD0_BASE_OFF = 0x114;
export const EXIT_84BFD0_BLOCK_DWORDS = 51;
export const EXIT_84BFD0_ELEM_DWORDS = 5;
export const EXIT_84BFD0_ELEM_COUNT = 10;
export const EXIT_84BFD0_FLOAT_ELEM_FIRST = 6;
export const EXIT_84BFD0_F32_BITS = 0x3dcccccd;
export const EXIT_84BFD0_TERMINAL_OFF = 0x2ac;
export const EXIT_84BFD0_SLOT_ZERO = 0;
export const EXIT_84BFD0_SLOT_SKIP = 1;
export const EXIT_84BFD0_SLOT_FLOAT = 2;

/* ABI v26: 0x009a27d0 slot triple + its last two non-ANM2 hosts */
export const EXIT_9A27D0_SLOT_TRIPLE_STRIDE = 0x1f4;
/* ABI v41: per-slot decision laws around the slot triples (this-relative
   receivers, slot i in [0, 11): base 0x3cdc+i*0x1f4 (0x00840f70), flag
   +8, 0x00709150 +0x18, ANM2::Reset +0x20; push ecx before 0x00709150 =
   ANM2::Reset receiver of the same slot). Loop segmentation: slot 0
   direct, slots 1..6 6-loop (esi from +0x3ee8), slots 7..10 4-loop
   (esi from +0x4aa0). */
export const EXIT_9A27D0_SLOT_709150_BASE_OFF = 0x3cf4;
export const EXIT_9A27D0_SLOT_RESET_BASE_OFF = 0x3cfc;
export const EXIT_9A27D0_SLOT_LOOP1_COUNT = 6;
export const EXIT_9A27D0_SLOT_LOOP2_COUNT = 4;
export const EXIT_9A27D0_SLOT_LOOP1_START_ESI = 0x3ee8;
export const EXIT_9A27D0_SLOT_LOOP2_START_ESI = 0x4aa0;
export const EXIT_840F70_SLOT_COUNT = 2;
export const EXIT_840F70_SLOT_STRIDE = 4;
export const EXIT_840F70_HEADER_DELTA = 4;
export const EXIT_840F70_HEAP_STATS_GLOBAL = 0x00c7de78;
export const EXIT_840F70_HEAP_STATS_DELTA = 0x30;
export const EXIT_840F70_HEAP_STATS_FALLBACK = 0x00c7f618;
export const EXIT_840F70_STATS_LO_OFF = 0;
export const EXIT_840F70_STATS_HI_OFF = 4;
export const EXIT_840F70_FREE_IAT_SLOT = 0x00b187dc;
export const EXIT_709150_ALLOC_SIZE = 0x18;
export const EXIT_709150_VTABLE = 0x00b67f98;
export const EXIT_709150_FIELD_14_OFF = 0x14;
export const EXIT_709150_PAIR_VALUE_OFF = 0;
export const EXIT_709150_PAIR_OBJ_OFF = 4;
export const EXIT_709150_CALLBACK_GLOBAL = 0x00c71644;
export const EXIT_709150_VTBL_RELEASE_OFF = 0xc;
export const EXIT_709150_STACK_ARG_BYTES = 4;

/* ABI v27: teardown residual 0x00a1ad90 + host 0x00a648b0 call shape */
export const EXIT_A1AD90_BLOCK_A_OFF = 0x28;
export const EXIT_A1AD90_BLOCK_B_OFF = 0x3c;
export const EXIT_A1AD90_HEADER_DELTA = 4;
export const EXIT_A1AD90_ELEM_SIZE = 8;
export const EXIT_A1AD90_ELEM_DTOR = 0x0040c440;
export const EXIT_A1AD90_FREE_SIZE_ADD = 4;
export const EXIT_A1AD90_TREE_OFF = 0x40;
export const EXIT_A1AD90_TREE_SIZE_OFF = 0x44;
export const EXIT_A1AD90_TERMINAL_BYTE_OFF = 0;
export const EXIT_A1AD90_TERMINAL_24_OFF = 0x24;
export const EXIT_A1AD90_TERMINAL_38_OFF = 0x38;
export const EXIT_A1AD90_HOST_A_NEEDED_BIT = 1;
export const EXIT_A1AD90_HOST_B_NEEDED_BIT = 2;
export const EXIT_A648B0_MODE_MASK = 0xff;
export const EXIT_A648B0_MODE_FREE = 1;
export const EXIT_A648B0_HEADER_DELTA = 4;
export const EXIT_A648B0_HEAP_STATS_GLOBAL = 0x00c7de78;
export const EXIT_A648B0_HEAP_STATS_DELTA = 0x30;
export const EXIT_A648B0_HEAP_STATS_FALLBACK = 0x00c7f618;
export const EXIT_A648B0_FREE_IAT_SLOT = 0x00b187dc;
export const EXIT_A648B0_MODE_STATS = 2;
export const EXIT_A648B0_MODE2_BASE_OFF = 0x30;
export const EXIT_A648B0_MODE2_ADDEND_LO_VA = 0x00c7f618;
export const EXIT_A648B0_MODE2_ADDEND_HI_VA = 0x00c7f61c;

/* ABI v44: fully pure thiscall predicate 0x006f0040 (band-scan find).
   Body 0x006f0040..0x006f0066 (39 B), 4 direct rel32 callers (corrected
   capstone census), identify-zhl empty. */
export const EXIT_6F0040_VA = 0x006f0040;
export const EXIT_6F0040_BODY_BYTES = 0x27;
export const EXIT_6F0040_PTR_OFF = 0x1e68;
export const EXIT_6F0040_COUNT_OFF = 0x161c;
export const EXIT_6F0040_INVALID_COUNT = 0xffffffff;
export const EXIT_6F0040_CALLERS = 4;

/* ABI v46 (host-leaf ledger close): 0x40e910 decision surface complete
   (v9+v41 — 7/7 branches exported); 0x40ed50 = MSVC string-tree cache
   insert, pure islands are SSO/strcmp/tree links on runtime host
   strings (no scalar laws); SFX 0x92e230/0x92e300 and PGD
   0x9292c0/0x9294f0/0x928ee0 leases are held by their own families.
   v46 lands the last two capture-driven gates of write 0x00958ed0:
   local filename SIZE (0x1fdbc, FULL-dword == 0) and existing
   GameStateIO dtor presence (0x1fe24, FULL-dword). */

/* ABI v45: fully pure static membership predicate 0x0071df80 (band
   re-scan find). Body 0x0071df80..0x0071dfbf (64 B), 2 direct rel32
   callers, identify-zhl empty. Game global -> Game::_room (+0x18300)
   -> room state id (+0x1d18); eight FULL-dword member gates. */
export const EXIT_71DF80_VA = 0x0071df80;
export const EXIT_71DF80_BODY_BYTES = 0x40;
export const EXIT_71DF80_GAME_DAT = 0x00c71678;
export const EXIT_71DF80_ROOM_OFF = 0x18300;
export const EXIT_71DF80_STATE_OFF = 0x1d18;
export const EXIT_71DF80_STATE_0A = 0x0a;
export const EXIT_71DF80_STATE_0B = 0x0b;
export const EXIT_71DF80_STATE_0C = 0x0c;
export const EXIT_71DF80_STATE_0D = 0x0d;
export const EXIT_71DF80_STATE_22 = 0x22;
export const EXIT_71DF80_STATE_2B = 0x2b;
export const EXIT_71DF80_STATE_2C = 0x2c;
export const EXIT_71DF80_STATE_30 = 0x30;
export const EXIT_71DF80_CALLERS = 2;

/* ABI v28: pair ctor 0x0040c4a0 + recursive tree _Erase 0x00415800 */
export const EXIT_40C4A0_ALLOC_SIZE = 0x18;
export const EXIT_40C4A0_VTABLE = 0x00b1a6e0;
export const EXIT_40C4A0_ARG_OFF = 0x14;
export const EXIT_40C4A0_PAIR_VALUE_OFF = 0;
export const EXIT_40C4A0_PAIR_OBJ_OFF = 4;
export const EXIT_40C4A0_CALLBACK_GLOBAL = 0x00c7163c;
export const EXIT_40C4A0_VTBL_RELEASE_OFF = 0xc;
export const EXIT_40C4A0_STACK_ARG_BYTES = 4;
export const EXIT_415800_NODE_SIZE = 0x1c;
export const EXIT_415800_COM_SLOT_OFF = 0x14;
export const EXIT_415800_CTRL_OFF = 0x18;
export const EXIT_415800_CALLBACK_GLOBAL = 0x00c7163c;
export const EXIT_415800_VTBL_RELEASE_OFF = 0xc;
export const EXIT_415800_STACK_ARG_BYTES = 8;
export const EXIT_415800_MAX_DEPTH = 64;
export const EXIT_415800_ORDER_OVERFLOW = 0xffffffff;

export const EXIT_40DB90_CACHE_BEGIN_ADDR = 0x00c798b8;
export const EXIT_40DB90_CACHE_END_ADDR = 0x00c798bc;
export const EXIT_40DB90_TREE_SENTINEL_ADDR = 0x00c78ee0;
export const EXIT_40DB90_TIMING_ACCUM_ADDR = 0x00c79c40;

/* ABI v14: residual 0x009b4810 */
export const EXIT_9B4810_THIS_FROM_9B5CB0 = 0x5b0;
export const EXIT_9B4810_THIS_FROM_GAME = 0x24024;
export const EXIT_9B4810_MODE_OFF = 0;
export const EXIT_9B4810_FIELD_4_OFF = 4;
export const EXIT_9B4810_FIELD_8_OFF = 8;
export const EXIT_9B4810_FIELD_C_OFF = 0xc;
export const EXIT_9B4810_FIELD_10_OFF = 0x10;
export const EXIT_9B4810_FIELD_14_OFF = 0x14;
export const EXIT_9B4810_FIELD_18_OFF = 0x18;
export const EXIT_9B4810_FIELD_1C_OFF = 0x1c;
export const EXIT_9B4810_FIELD_20_OFF = 0x20;
export const EXIT_9B4810_ANM2_24_OFF = 0x24;
export const EXIT_9B4810_LAYER_COUNT_OFF = 0xa4;
export const EXIT_9B4810_ANM2_138_OFF = 0x138;
export const EXIT_9B4810_STR_16C_OFF = 0x16c;
export const EXIT_9B4810_BYTE_17C_OFF = 0x17c;
export const EXIT_9B4810_FIELD_24C_OFF = 0x24c;
export const EXIT_9B4810_FIELD_250_OFF = 0x250;
export const EXIT_9B4810_FIELD_254_OFF = 0x254;
export const EXIT_9B4810_VEC_BEGIN_OFF = 0x27c;
export const EXIT_9B4810_VEC_END_OFF = 0x280;
export const EXIT_9B4810_VEC_CAP_OFF = 0x284;
export const EXIT_9B4810_ELEM_SIZE = 4;
export const EXIT_F32_GLOBAL_C7B640_ADDR = 0x00c7b640;
export const EXIT_F32_GLOBAL_C7B644_ADDR = 0x00c7b644;
export const EXIT_9B4810_PLAY_FLAG_OFF = 0x44;
export const EXIT_9B4810_PLAY_FLAG_VALUE = 1;
export const EXIT_9B4810_BLOCK_A = Object.freeze([2, 3, 4, 6, 7, 8, 0xf]);
export const EXIT_9B4810_BLOCK_B = Object.freeze([9, 0xb, 0xc]);
export const EXIT_9B4810_BLOCK_C = Object.freeze([0xd]);
export const EXIT_9B4810_BLOCK_D = Object.freeze([0xe]);
export const EXIT_9B4810_BLOCK_E = Object.freeze([0x10, 0x11, 0x14]);
export const EXIT_9B4810_BLOCK_F = Object.freeze([
  0x15, 0x16, 0x17, 0x18, 0x19, 0x1a, 0x1b,
]);
export const EXIT_9B4810_VALUE_1C = 0x1c;

/* ABI v15: residual vector grow 0x00428590 */
export const EXIT_428590_ELEM_SIZE = 4;
export const EXIT_428590_MAX_ELEMS = 0x3fffffff;
export const EXIT_428590_FREE_HEADER_THRESHOLD = 0x1000;
export const EXIT_428590_FREE_HEADER_ADD = 0x23;
export const EXIT_428590_FREE_HEADER_OFFSET_MAX = 0x1f;

/* ABI v16: ANM2::GetLayer(int) / ANM2::Load / alloc 0x40cf00 */
export const EXIT_ANM2_LAYER_BASE_OFF = 0x7c;
export const EXIT_ANM2_LAYER_COUNT_OFF = 0x80;
export const EXIT_ANM2_LAYER_STRIDE = 0xa0;
export const EXIT_ANM2_NAME_CAP_OFF = 0x14;
export const EXIT_ANM2_PATH_SIZE_OFF = 0x10;
export const EXIT_ANM2_LOAD_408830_A_OFF = 0x30;
export const EXIT_ANM2_LOAD_408830_B_OFF = 0x50;
export const EXIT_ANM2_LOAD_FLAG_109_OFF = 0x109;
export const EXIT_ANM2_LOAD_FLAG_109_VALUE = 1;
export const EXIT_ANM2_SHADOW_INDEX_OFF = 0x10c;
export const EXIT_ANM2_SHADOW_INDEX_INIT = 0xffffffff;
export const EXIT_ANM2_FLAGS_110_OFF = 0x110;
export const EXIT_ANM2_LAYER_NAME_HOLDER_OFF = 0;
export const EXIT_ANM2_LAYER_NAME_STR_DELTA = 8;
export const EXIT_ANM2_LAYER_STAR_FLAGS_OFF = 0x8c;
export const EXIT_ANM2_LAYER_STAR_OR = 5;
export const EXIT_ANM2_STAR_GLOBAL_OR_400 = 0x400;
export const EXIT_ANM2_STAR_GLOBAL_OR_800 = 0x800;
export const EXIT_ANM2_SHEET_BASE_OFF = 0x84;
export const EXIT_ANM2_SHEET_COUNT_OFF = 0x88;
export const EXIT_ANM2_SHEET_STRIDE = 0x18;
export const EXIT_ANM2_STAR_BYTE = 0x2a;
export const EXIT_ANM2_SHADOW_NAME = "shadow";
export const EXIT_40CF00_HEADER_THRESHOLD = 0x1000;
export const EXIT_40CF00_HEADER_ADD = 0x23;
export const EXIT_40CF00_ALIGN_MASK = 0xffffffe0;

/* ABI v17: ANM2::ReplaceSpritesheet / Play path 0x40a5d0 */
export const EXIT_ANM2_LAYER_PNG_STR_OFF = 8;
export const EXIT_ANM2_LAYER_FLAG30_OFF = 0x30;
export const EXIT_ANM2_ANIM_BASE_OFF = 0x74;
export const EXIT_ANM2_ANIM_COUNT_OFF = 0x78;
export const EXIT_ANM2_ANIM_STRIDE = 0x13c;
export const EXIT_ANM2_PLAY_STATE_OFF = 0x30;

/* ABI v18: exact AnimationState::Rewind 0x40a1b0 + nested 0x408c90 */
export const EXIT_ANIMSTATE_ANIM_OFF = 4;
export const EXIT_ANIMSTATE_LAYER_ARR_OFF = 8;
export const EXIT_ANIMSTATE_NULL_ARR_OFF = 0xc;
export const EXIT_ANIMSTATE_FRAME_OFF = 0x10;
export const EXIT_ANIMSTATE_MASK18_OFF = 0x18;
export const EXIT_ANIMSTATE_MASK1C_OFF = 0x1c;
export const EXIT_ANIMDATA_LAYER_COUNT_OFF = 0x1c;
export const EXIT_ANIMDATA_NULL_COUNT_OFF = 0x24;
export const EXIT_ANIMDATA_EVENT_BASE_OFF = 0x28;
export const EXIT_ANIMDATA_EVENT_COUNT_OFF = 0x2c;
export const EXIT_ANIM_EVENT_STRIDE = 8;
export const EXIT_ANIM_EVENT_BIT_OFF = 0;
export const EXIT_ANIM_EVENT_FRAME_OFF = 4;

/* ABI v19: residual MSVC string assign 0x0040ccd0 */
export const EXIT_40CCD0_MAX_SIZE = 0x7fffffff;
export const EXIT_40CCD0_ALIGN_OR = 0xf;
export const EXIT_40CCD0_FREE_HEADER_THRESHOLD = 0x1000;
export const EXIT_40CCD0_FREE_HEADER_ADD = 0x23;
export const EXIT_40CCD0_FREE_HEADER_OFFSET_MAX = 0x1f;

const SFX_STOP_IDS = [0x256, 599, 600, 0x259, 0x3f0];

function f32Bits(bits) {
  const buf = new ArrayBuffer(4);
  new DataView(buf).setUint32(0, bits >>> 0, true);
  return new DataView(buf).getFloat32(0, true);
}

/** Exit body runs only when Game+0x2658a != 0. */
export function exitSessionActive(sessionFlag2658a) {
  return ((sessionFlag2658a | 0) & 0xff) !== 0;
}

/** ItemOverlay force-close host when Game+0x1c034 == 2 (ACTIVE). */
export function exitItemOverlayForceNeeded(itemOverlayState1c034) {
  return (itemOverlayState1c034 | 0) === 2;
}

/** Manager+0x2a2d0 / +0x2a2d4 ← float32 1.0. */
export function exitManagerFloatsReset(f2a2d0, f2a2d4) {
  return {
    f2a2d0: Math.fround(1),
    f2a2d4: Math.fround(1),
    prior2a2d0: Math.fround(f2a2d0),
    prior2a2d4: Math.fround(f2a2d4),
  };
}

/**
 * PGD flush pure prelude.
 * @returns {{ flush: boolean, changesmade: number }}
 */
export function exitPgdFlushPrepare(changesmade, fileLoaded) {
  let cm = (changesmade | 0) & 0xff;
  const loaded = (fileLoaded | 0) & 0xff;
  if (cm !== 0 && loaded !== 0) {
    return { flush: true, changesmade: 0 };
  }
  return { flush: false, changesmade: cm };
}

export function exitPgdFlushNeeded(changesmade, fileLoaded) {
  return (((changesmade | 0) & 0xff) !== 0) && (((fileLoaded | 0) & 0xff) !== 0);
}

/** 1 → cloud save host, 0 → local save host. */
export function exitPgdSaveUsesCloud(steamCtxWord, cloudEnable2a3a4) {
  // PE @ 0x006fa1f0: cmp dword ptr [eax],0 — the FIRST DWORD of the Steam
  // context returned by SteamInternal_ContextInit is tested FULL-WORD (the
  // re-narrowed v29-era byte mask was WRONG; 0x100 with cloud on selects the
  // cloud host). Then cmp byte [edi+0x2a3a4],0 — a real byte gate.
  const nullIface = (steamCtxWord >>> 0) === 0;
  const cloud = ((cloudEnable2a3a4 | 0) & 0xff) !== 0;
  if (nullIface || !cloud) return false;
  return true;
}

/** Continue GameState write/delete host when Game+0x2658b == 0. */
export function exitGamestateIoNeeded(skipFlag2658b) {
  return ((skipFlag2658b | 0) & 0xff) === 0;
}

/** ShouldSave low byte: nonzero → write, zero → delete. */
export function exitGamestateShouldWrite(shouldSave) {
  return ((shouldSave | 0) & 0xff) !== 0;
}

/** Pure in-memory field zero pack (early teardown convenience). */
export function exitPureFieldTeardown(state) {
  return {
    field2510c: 0,
    field2593c: 0,
    field25948: 0,
    field2590c: 0,
    gate1d520: 0,
    gate1d654: 0,
    skipTimedTransition25954: 0,
    prior: { ...state },
  };
}

export function exitTeardownT0(field2510c, field2593c) {
  return { field2510c: 0, field2593c: 0, prior: { field2510c, field2593c } };
}

export function exitTeardownT1(field25948, field2590c, gate1d520) {
  return {
    field25948: 0,
    field2590c: 0,
    gate1d520: 0,
    prior: { field25948, field2590c, gate1d520 },
  };
}

export function exitTeardownT2(gate1d654) {
  return { gate1d654: 0, prior: gate1d654 | 0 };
}

export function exitTeardownT4(skipTimed) {
  return { skipTimedTransition25954: 0, prior: (skipTimed | 0) & 0xff };
}

/** After host dtors: end pointer becomes begin. */
export function exitVector25ebcClearEnd(end25ec0, begin25ebc) {
  return begin25ebc >>> 0;
}

export function exitVector25ebcDtorNeeded(begin25ebc, end25ec0) {
  return (begin25ebc >>> 0) !== (end25ec0 >>> 0);
}

export function exitVector25ebcElementCount(begin25ebc, end25ec0) {
  const b = begin25ebc >>> 0;
  const e = end25ec0 >>> 0;
  if (e < b) return 0;
  const span = (e - b) >>> 0;
  if (span % EXIT_VECTOR_25EBC_STRIDE !== 0) return 0;
  return (span / EXIT_VECTOR_25EBC_STRIDE) >>> 0;
}

export function exitSfxStopIdAt(index) {
  const i = index >>> 0;
  if (i >= EXIT_SFX_STOP_COUNT) return 0;
  return SFX_STOP_IDS[i] >>> 0;
}

export function exitPgdReadonlyClear(readonly15) {
  return { readonly15: 0, prior: (readonly15 | 0) & 0xff };
}

export function exitPostlogPureFields(state, gC7b640 = 0, gC7b644 = 0) {
  return {
    field1bb70: 0,
    gate1ba78: 0,
    field1ba7c: 0,
    field1ba84: 0,
    field1ba88: 0,
    field1ba90: f32Bits(gC7b640 >>> 0),
    field1ba94: f32Bits(gC7b644 >>> 0),
    field1ba80: EXIT_POSTLOG_I32_1BA80,
    field1b840: 0,
    field1b848: 0,
    gate1b83c: 0,
    field1b84c: 0,
    field1b858: 0,
    field1b85c: 0,
    field1b860: 0,
    field1bb74: 0,
    field26548: 0,
    field2654c: 0,
    prior: { ...state },
  };
}

export function exitItemOverlayStateClear(state1c034, field1c038) {
  return {
    state1c034: 0,
    field1c038: 0,
    prior: { state1c034: state1c034 | 0, field1c038: field1c038 | 0 },
  };
}

export function exitCounter265c0Clear(counter) {
  return { counter265c0: 0, prior: counter | 0 };
}

export function exitSessionPairClear(sessionPair) {
  return { sessionPair2658a: 0, prior: (sessionPair | 0) & 0xffff };
}

export function exit6f43b0Prefix(state) {
  return {
    field26588: 0,
    field264f8: 0,
    field264fc: 0,
    field26508: 0,
    prior: { ...state },
  };
}

export function exit6f4520Apply(state) {
  const slots = [];
  for (let i = 0; i < EXIT_6F4520_EFFECT_SLOT_COUNT; i++) {
    slots.push({ fieldA: 0, fieldB: 0, flag: 0 });
  }
  const src269d4 = state?.field269d4 | 0;
  return {
    field26554: 0,
    field26558: 0,
    field2655c: 0,
    field26560: 0,
    field26564: 0,
    field26568: 0,
    field2656c: 0,
    field26570: 0,
    field269c0: 0,
    field26540: 0,
    field2657c: 0,
    field26528: 0,
    field2652c: EXIT_6F4520_I32_2652C,
    field26530: f32Bits(EXIT_6F4520_F32_26530_BITS),
    field2653c: 0,
    field26538: 0,
    counter265c0: 0,
    field26548: 0,
    field2654c: 0,
    counter67788: 0,
    effectSlots: slots,
    field68d6c: 0,
    fade26514: 0,
    fade26518: 0,
    field2651c: 0,
    field269c4: 1,
    field26774: 0,
    field269cc: 0,
    field269d4: src269d4,
    field269d8: src269d4,
    field269ea: 0,
    field676ac: EXIT_6F4520_I32_676AC | 0,
    field676b0: 0,
    field269ec: 0,
    field4704c: 0,
    field68d70: 0,
    field26578: 0,
    field26574: EXIT_6F4520_I32_26574,
    prior: { ...state },
  };
}

export function exit6f43b0Mid(state) {
  return {
    field264f4: 0,
    zero16_2658c: [0, 0, 0, 0],
    field26544: 0,
    zero16_265a4: [0, 0, 0, 0],
    field26550: 0,
    field2659c: 0,
    field265b4: 0,
    field265bc: 0,
    field265c4: 0,
    counter265c0: 0,
    field26630: 0,
    field26634: 0,
    field2663c: 0,
    field26638: 0,
    prior: { ...state },
  };
}

export function exit6f43b0Tail(state) {
  const src6774c = state?.field6774c | 0;
  return {
    pack676b8: [Math.fround(1), Math.fround(1), Math.fround(1), Math.fround(0)],
    field269e4: 0,
    field269e0: 0,
    field269e9: 0,
    field676b4: 0,
    field676c8: Math.fround(0),
    field676cc: Math.fround(1),
    field6774c: src6774c,
    field67734: 0,
    field67738: 0,
    field6773c: 0,
    field67740: f32Bits(EXIT_6F43B0_F32_67740_BITS),
    field67744: 0,
    field67748: 0,
    field67750: src6774c,
    field68d70: 0,
    prior: { ...state },
  };
}

/** Pure mode pair clear inside residual host 0x00421260. */
export function exitFrameModePairClear(mode1d2ec, secondary1d2f0) {
  return {
    mode1d2ec: 0,
    secondary1d2f0: 0,
    prior: { mode1d2ec: mode1d2ec | 0, secondary1d2f0: secondary1d2f0 | 0 },
  };
}

/** Manager+0x2a334 != 1.0f (incl. NaN) → host ClearVolumeModifier path. */
export function exitVolumeModifierClearNeeded(manager2a334) {
  return Math.fround(manager2a334) !== Math.fround(1);
}

export function exitManager2a334SetOne(prior) {
  return { manager2a334: Math.fround(1), prior: Math.fround(prior) };
}

export function exitManager2a338Set(prior) {
  return {
    manager2a338: f32Bits(EXIT_MANAGER_2A338_BITS),
    prior: Math.fround(prior),
  };
}

export function exitResidualSlotCopyNeeded(flag0c, count) {
  return ((flag0c | 0) & 0xff) !== 0 && (count >>> 0) > 0;
}

/**
 * One residual entity: dword at +0x30 → +0x34.
 * @param {DataView} view
 * @param {number} entityOff linear offset
 */
export function exitResidualEntityCopy30To34(view, entityOff) {
  const src = view.getUint32(entityOff + EXIT_RESIDUAL_ENTITY_SRC_OFF, true);
  view.setUint32(entityOff + EXIT_RESIDUAL_ENTITY_DST_OFF, src, true);
  return src >>> 0;
}

export function exitResidualEntityBatchCopy30To34(view, entityBase, count) {
  const n = count >>> 0;
  for (let i = 0; i < n; i++) {
    exitResidualEntityCopy30To34(
      view,
      (entityBase + i * EXIT_RESIDUAL_ENTITY_STRIDE) >>> 0,
    );
  }
}

/**
 * Full pure nest over a Game image in a DataView (Wasm linear memory mirror).
 * Slot entity pointers are stored as uint32 linear offsets into the same view.
 */
export function exitResidual18990Apply(view, gameBase) {
  let outer = (gameBase + EXIT_RESIDUAL_BASE_OFF) >>> 0;
  for (let o = 0; o < EXIT_RESIDUAL_OUTER_COUNT; o++) {
    let edi = outer;
    for (let m = 0; m < EXIT_RESIDUAL_MID_COUNT; m++) {
      const flag = view.getUint8(edi + EXIT_RESIDUAL_SLOT_FLAG_OFF);
      const count = view.getUint32(edi, true) >>> 0;
      if (flag !== 0 && count > 0) {
        const entityBase = view.getUint32(edi - 4, true) >>> 0;
        exitResidualEntityBatchCopy30To34(view, entityBase, count);
      }
      edi = (edi + EXIT_RESIDUAL_MID_STRIDE) >>> 0;
    }
    outer = (outer + EXIT_RESIDUAL_OUTER_STRIDE) >>> 0;
  }
}

export function exitMapValueFlag28Clear(prior) {
  return { flag28: 0, prior: (prior | 0) & 0xff };
}

/**
 * Pure field prefix of residual host 0x009b5cb0 (thiscall Game+0x23a74).
 * menu_state_0 is Update sparse menuState23a74; field_8 is set to 2.
 */
export function exit9b5cb0Prefix(state) {
  return {
    menuState0: 0,
    field8: EXIT_9B5CB0_FIELD_8_VALUE,
    field24: 0,
    field28: 0,
    field1454: 0,
    prior: {
      menuState0: state?.menuState0 | 0,
      field8: state?.field8 | 0,
      field24: state?.field24 | 0,
      field28: state?.field28 | 0,
      field1454: (state?.field1454 | 0) & 0xff,
    },
  };
}

/** Pointer-form pure stores; omitted (undefined) slots are not returned. */
export function exit9b5cb0PrefixPtrs(menuState0, field8, field24, field28, field1454) {
  return {
    menuState0: 0,
    field8: EXIT_9B5CB0_FIELD_8_VALUE,
    field24: 0,
    field28: 0,
    field1454: 0,
    prior: {
      menuState0: menuState0 | 0,
      field8: field8 | 0,
      field24: field24 | 0,
      field28: field28 | 0,
      field1454: (field1454 | 0) & 0xff,
    },
  };
}

/* --- ABI v5: pure islands inside residual host 0x008d3250 --- */

/** P0 before first host 0x0040c7f0. */
export function exit8d3250P0(state) {
  return {
    field10: 0,
    field14: 0,
    field30: 0,
    field34: 0,
    field38: 0,
    prior: {
      field10: (state?.field10 | 0) & 0xff,
      field14: state?.field14 | 0,
      field30: state?.field30 | 0,
      field34: state?.field34 | 0,
      field38: state?.field38 | 0,
    },
  };
}

/** P1 after first 0x0040c7f0. */
export function exit8d3250P1(field44, field48, field4c) {
  return {
    field44: 0,
    field48: 0,
    field4c: 0,
    prior: {
      field44: field44 | 0,
      field48: field48 | 0,
      field4c: field4c | 0,
    },
  };
}

/** P2 after second 0x0040c7f0, before ANM2::Reset. */
export function exit8d3250P2(field58, field5c, field60) {
  return {
    field58: 0,
    field5c: 0,
    field60: 0,
    prior: {
      field58: field58 | 0,
      field5c: field5c | 0,
      field60: field60 | 0,
    },
  };
}

/** P3 after ANM2::Reset: +0x178 ← -1, four zero dwords. */
export function exit8d3250P3(state) {
  return {
    field178: EXIT_8D3250_FIELD_178_VALUE | 0,
    field17c: 0,
    field180: 0,
    field648: 0,
    field64c: 0,
    prior: {
      field178: state?.field178 | 0,
      field17c: state?.field17c | 0,
      field180: state?.field180 | 0,
      field648: state?.field648 | 0,
      field64c: state?.field64c | 0,
    },
  };
}

/** Host ANM2::GetLayer("Cursor") needed when this+0x40d != 0. */
export function exit8d3250CursorLayerHostNeeded(field40d) {
  return ((field40d | 0) & 0xff) !== 0;
}

/**
 * P4: copy +0x18 → +0x1c; clear +0x24/+0x28/+0x2c.
 * field18 is preserved as input.
 */
export function exit8d3250P4(state) {
  const field18 = state?.field18 | 0;
  return {
    field18,
    field1c: field18,
    field24: 0,
    field28: 0,
    field2c: 0,
    prior: {
      field18,
      field1c: state?.field1c | 0,
      field24: state?.field24 | 0,
      field28: state?.field28 | 0,
      field2c: state?.field2c | 0,
    },
  };
}

/** List-reset host path when this+0x1e8 != 0. */
export function exit8d3250ListHostNeeded(ptr1e8) {
  return (ptr1e8 >>> 0) !== 0;
}

/**
 * After host list destroy: circular empty sentinel + count 0.
 * @param {DataView} view
 * @param {number} linksOff linear offset of 3 dwords
 * @param {number} selfAddr value written into each link (usually linksOff)
 * @param {number} countOff linear offset of count dword
 */
export function exit8d3250ListEmpty(view, linksOff, selfAddr, countOff) {
  const base = linksOff >>> 0;
  const self = selfAddr >>> 0;
  view.setUint32(base, self, true);
  view.setUint32(base + 4, self, true);
  view.setUint32(base + 8, self, true);
  view.setUint32(countOff >>> 0, 0, true);
  return { linksOff: base, selfAddr: self, count: 0 };
}

/* --- ABI v42: 0x008d3250 ordered host-event decision laws ---
   Mirror of the C++ laws; see the header block for PE refs. The five
   ordered typed-host events: H1/H2 0x0040c7f0(0) this+0x3c/+0x50,
   H3 ANM2::Reset this+0x64, H4 ANM2::GetLayer("Cursor") this+0x304 with
   byte [layer+0x74] <- 0 (gate byte +0x40d), H5 0x00415800 this=header
   args [sentinel+4]/header (gate ptr +0x1e8). */

/** "Cursor" literal VA pushed before host ANM2::GetLayer. */
export function exit8d3250CursorVa() {
  return EXIT_8D3250_CURSOR_VA >>> 0;
}

/** H4 ANM2::GetLayer receiver offset (this+0x304). */
export function exit8d3250GetLayerReceiverOff() {
  return EXIT_8D3250_HOST_304_OFF >>> 0;
}

/** Byte offset on the GetLayer RETURN value cleared after H4 (0x74). */
export function exit8d3250LayerClearOff() {
  return EXIT_8D3250_LAYER_CLEAR_OFF >>> 0;
}

/** H3 exact ANM2::Reset receiver offset (this+0x64). */
export function exit8d3250ResetReceiverOff() {
  return EXIT_8D3250_HOST_64_OFF >>> 0;
}

/** H5 sentinel offset within the list object (0x120). */
export function exit8d3250ListSentinelOff() {
  return EXIT_8D3250_LIST_HEADER_OFF >>> 0;
}

/** H5 header offset within the list object (0x120; H5 this / arg2). */
export function exit8d3250ListHeaderOff() {
  return EXIT_8D3250_LIST_HEADER_OFF >>> 0;
}

/** H5 first stack arg source address: sentinel+4 (u32 wrap). */
export function exit8d3250ListDestroyArg1Ptr(sentinel) {
  return (sentinel >>> 0) + EXIT_8D3250_LIST_ARG1_OFF >>> 0;
}

/** H5 second stack arg value (== header == H5 this): obj+0x120 (wrap). */
export function exit8d3250ListDestroyArg2(obj) {
  return (obj >>> 0) + EXIT_8D3250_LIST_HEADER_OFF >>> 0;
}

/**
 * Packed ordered host plan. Gates re-derived from the raw fields:
 * cursor_gate = (field40d & 0xff) !== 0 (LOW BYTE, PE cmp byte +0x40d);
 * list_gate = ptr1e8 !== 0 (FULL dword pointer, PE test edi,edi).
 */
export function exit8d3250HostPlan(field40d, ptr1e8) {
  return {
    cursorVa: EXIT_8D3250_CURSOR_VA >>> 0,
    getLayerReceiverOff: EXIT_8D3250_HOST_304_OFF >>> 0,
    layerClearOff: EXIT_8D3250_LAYER_CLEAR_OFF >>> 0,
    resetReceiverOff: EXIT_8D3250_HOST_64_OFF >>> 0,
    listObjOff: EXIT_8D3250_LIST_OBJ_OFF >>> 0,
    listSentinelOff: EXIT_8D3250_LIST_HEADER_OFF >>> 0,
    listHeaderOff: EXIT_8D3250_LIST_HEADER_OFF >>> 0,
    cursorGate: ((field40d | 0) & 0xff) !== 0 ? 1 : 0,
    listGate: (ptr1e8 >>> 0) !== 0 ? 1 : 0,
  };
}

/* --- ABI v6: pure islands inside residual host 0x009b9150 --- */

/** P0: this+0xc8 / +0xcc ← 0 before player-list host walk. */
export function exit9b9150P0(state) {
  return {
    fieldC8: 0,
    fieldCc: 0,
    prior: {
      fieldC8: state?.fieldC8 | 0,
      fieldCc: state?.fieldCc | 0,
    },
  };
}

/** Player-list host walk when ((end-begin) & 0xfffffffc) != 0. */
export function exit9b9150PlayerListHostNeeded(begin, end) {
  const span = ((end >>> 0) - (begin >>> 0)) >>> 0;
  return (span & 0xfffffffc) !== 0;
}

/** After host (or empty): end ← begin. */
export function exit9b9150PlayerListClearEnd(endSlot, begin) {
  return { end: begin >>> 0, priorEnd: endSlot >>> 0, begin: begin >>> 0 };
}

/** Signed element count: sar((end-begin), 2). */
export function exit9b9150ExtraListCount(begin, end) {
  const span = ((end >>> 0) - (begin >>> 0)) | 0;
  return span >> 2;
}

export function exit9b9150ExtraListHostNeeded(begin, end) {
  return exit9b9150ExtraListCount(begin, end) !== 0;
}

export function exit9b9150ExtraListClearEnd(endSlot, begin) {
  return { end: begin >>> 0, priorEnd: endSlot >>> 0, begin: begin >>> 0 };
}

/** Non-null pointer → host vtable delete. */
export function exit9b9150PtrHostNeeded(ptr) {
  return (ptr >>> 0) !== 0;
}

export function exit9b9150SlotClear(prior) {
  return { slot: 0, prior: prior >>> 0 };
}

/** Clear four esau slots at this+0x80. */
export function exit9b9150EsauSlotsClear(slots) {
  const prior = Array.isArray(slots)
    ? slots.slice(0, EXIT_9B9150_ESAU_SLOT_COUNT).map((x) => x >>> 0)
    : [0, 0, 0, 0];
  while (prior.length < EXIT_9B9150_ESAU_SLOT_COUNT) prior.push(0);
  return {
    slots: new Array(EXIT_9B9150_ESAU_SLOT_COUNT).fill(0),
    prior,
  };
}

/** Mid: +0x7c ← 0; byte +0x5c ← 1. */
export function exit9b9150Mid(state) {
  return {
    field7c: 0,
    field5c: EXIT_9B9150_FIELD_5C_VALUE,
    prior: {
      field7c: state?.field7c | 0,
      field5c: (state?.field5c | 0) & 0xff,
    },
  };
}

/** Tail: four dwords at +0x60 ← -1. */
export function exit9b9150Tail(state) {
  const prior = Array.isArray(state?.fields)
    ? state.fields.slice(0, EXIT_9B9150_TAIL_COUNT).map((x) => x | 0)
    : [0, 0, 0, 0];
  while (prior.length < EXIT_9B9150_TAIL_COUNT) prior.push(0);
  return {
    fields: new Array(EXIT_9B9150_TAIL_COUNT).fill(EXIT_9B9150_TAIL_VALUE | 0),
    prior: { fields: prior },
  };
}

/* --- ABI v7: pure islands inside residual host 0x009a27d0 --- */

/** After one slot host triple: pure flag byte ← 0. */
export function exit9a27d0SlotFlagClear(prior) {
  return { flag: 0, prior: (prior | 0) & 0xff };
}

/** Packed freestanding: 11 consecutive flag bytes ← 0. */
export function exit9a27d0SlotFlagsClearPacked(flags) {
  const prior = Array.isArray(flags)
    ? flags.slice(0, EXIT_9A27D0_SLOT_FLAG_COUNT).map((x) => (x | 0) & 0xff)
    : [];
  while (prior.length < EXIT_9A27D0_SLOT_FLAG_COUNT) prior.push(0);
  return {
    flags: new Array(EXIT_9A27D0_SLOT_FLAG_COUNT).fill(0),
    prior,
  };
}

/**
 * Strided apply on a 0x009a27d0 this image (DataView + base offset).
 * Writes this+0x3ce4 + i*0x1f4 ← 0 for i in [0, 11).
 */
export function exit9a27d0SlotFlagsApply(view, thisOff) {
  const base = thisOff >>> 0;
  for (let i = 0; i < EXIT_9A27D0_SLOT_FLAG_COUNT; i++) {
    const off =
      (base +
        EXIT_9A27D0_SLOT_FLAG_BASE_OFF +
        i * EXIT_9A27D0_SLOT_FLAG_STRIDE) >>>
      0;
    view.setUint8(off, 0);
  }
  return { thisOff: base, count: EXIT_9A27D0_SLOT_FLAG_COUNT };
}

/** This-relative offset of slot flag i, or 0xffffffff if out of range. */
export function exit9a27d0SlotFlagOff(index) {
  const i = index >>> 0;
  if (i >= EXIT_9A27D0_SLOT_FLAG_COUNT) return 0xffffffff;
  return (EXIT_9A27D0_SLOT_FLAG_BASE_OFF + i * EXIT_9A27D0_SLOT_FLAG_STRIDE) >>> 0;
}

/** Tail pure: byte this+0x54cd ← 0. */
export function exit9a27d0Field54cdClear(prior) {
  return { field54cd: 0, prior: (prior | 0) & 0xff };
}

/* --- ABI v41: per-slot decision laws inside residual host 0x009a27d0 ---
   Slot i in [0, 11): base = this+0x3cdc + i*0x1f4 (0x00840f70 receiver),
   flag = base+8 (0x3ce4+i*0x1f4), 0x00709150 = base+0x18 (0x3cf4+i*0x1f4),
   ANM2::Reset = base+0x20 (0x3cfc+i*0x1f4). The push ecx before
   0x00709150 carries the ANM2::Reset receiver of the same slot.
   Loop segmentation: slot 0 direct; slots 1..6 6-loop (esi from
   this+0x3ee8); slots 7..10 4-loop (esi from this+0x4aa0). */

function exit9a27d0SlotScaledBase(index) {
  const i = index >>> 0;
  return (EXIT_9A27D0_SLOT_HOST_840F70_OFF + i * EXIT_9A27D0_SLOT_TRIPLE_STRIDE) >>> 0;
}

/** Slot triple base (0x00840f70 receiver) offset; 0xffffffff when OOB. */
export function exit9a27d0SlotTripleBaseOff(index) {
  const i = index >>> 0;
  if (i >= EXIT_9A27D0_SLOT_FLAG_COUNT) return 0xffffffff;
  return exit9a27d0SlotScaledBase(i);
}

/** ANM2::Reset receiver offset (typed-host; only the offset law is pure). */
export function exit9a27d0SlotResetOff(index) {
  const i = index >>> 0;
  if (i >= EXIT_9A27D0_SLOT_FLAG_COUNT) return 0xffffffff;
  return (exit9a27d0SlotScaledBase(i) + EXIT_9A27D0_SLOT_HOST_RESET_FROM_840F70) >>> 0;
}

/** 0x00709150 receiver offset. */
export function exit9a27d0Slot709150Off(index) {
  const i = index >>> 0;
  if (i >= EXIT_9A27D0_SLOT_FLAG_COUNT) return 0xffffffff;
  return (exit9a27d0SlotScaledBase(i) + EXIT_9A27D0_SLOT_HOST_709150_FROM_840F70) >>> 0;
}

/** Value pushed before 0x00709150 (== the slot's ANM2::Reset receiver). */
export function exit9a27d0Slot709150Arg(index) {
  return exit9a27d0SlotResetOff(index);
}

/** Loop segment of slot i: 0 direct, 1 (6-loop), 2 (4-loop), -1 OOB. */
export function exit9a27d0SlotLoopSegment(index) {
  const i = index >>> 0;
  if (i >= EXIT_9A27D0_SLOT_FLAG_COUNT) return -1;
  if (i === 0) return 0;
  if (i < EXIT_9A27D0_SLOT_LOOP1_COUNT + 1) return 1;
  return 2;
}

export function exit9a27d0SlotLoop1Count() {
  return EXIT_9A27D0_SLOT_LOOP1_COUNT;
}
export function exit9a27d0SlotLoop2Count() {
  return EXIT_9A27D0_SLOT_LOOP2_COUNT;
}
export function exit9a27d0SlotLoop1StartOff() {
  return EXIT_9A27D0_SLOT_LOOP1_START_ESI >>> 0;
}
export function exit9a27d0SlotLoop2StartOff() {
  return EXIT_9A27D0_SLOT_LOOP2_START_ESI >>> 0;
}

/** Packed per-slot decision law; valid=0 when index >= 11. */
export function exit9a27d0SlotPlan(index) {
  const i = index >>> 0;
  if (i >= EXIT_9A27D0_SLOT_FLAG_COUNT) {
    return {
      valid: 0,
      baseOff: 0,
      flagOff: 0,
      resetOff: 0,
      receiver709150Off: 0,
      arg709150: 0,
      loopSegment: -1,
    };
  }
  const base = exit9a27d0SlotScaledBase(i);
  return {
    valid: 1,
    baseOff: base,
    flagOff: (base + EXIT_9A27D0_SLOT_FLAG_FROM_840F70) >>> 0,
    resetOff: (base + EXIT_9A27D0_SLOT_HOST_RESET_FROM_840F70) >>> 0,
    receiver709150Off: (base + EXIT_9A27D0_SLOT_HOST_709150_FROM_840F70) >>> 0,
    arg709150: (base + EXIT_9A27D0_SLOT_HOST_RESET_FROM_840F70) >>> 0,
    loopSegment: exit9a27d0SlotLoopSegment(i),
  };
}

/* --- ABI v8: pure islands inside residual host 0x009a19a0 --- */

/** P0 pure prefix before the 8× host 0x00841cf0 walk. */
export function exit9a19a0Prefix(state) {
  const prior = state && typeof state === "object" ? { ...state } : {};
  return {
    field5490: f32Bits(EXIT_9A19A0_F32_5490_BITS),
    field5494: EXIT_9A19A0_I32_M1 | 0,
    field5498: EXIT_9A19A0_I32_M1 | 0,
    field549c: 0,
    field54d0: EXIT_9A19A0_FIELD_54D0_VALUE | 0,
    field54d4: 0,
    field54d8: EXIT_9A19A0_FIELD_54D8_VALUE | 0,
    prior,
  };
}

/**
 * Per-slot pure before host 0x00841cf0: dword +4 ← thisAddr, word +8 ← index.
 * @returns {{ field4: number, field8: number, thisAddr: number, index: number }}
 */
export function exit9a19a0SlotSetup(thisAddr, index) {
  const i = index & 0xffff;
  return {
    field4: thisAddr >>> 0,
    field8: i,
    thisAddr: thisAddr >>> 0,
    index: i,
  };
}

/**
 * Strided apply on a 0x009a19a0 this image (DataView + base offset).
 * For i in [0, 8): dword this+i*0x6dc+4 ← thisAddr; word +8 ← i.
 */
export function exit9a19a0SlotsApply(view, thisOff, thisAddr) {
  const base = thisOff >>> 0;
  const addr = thisAddr >>> 0;
  for (let i = 0; i < EXIT_9A19A0_PLAYERHUD_LOOP_COUNT; i++) {
    const slot = (base + i * EXIT_9A19A0_PLAYERHUD_STRIDE) >>> 0;
    view.setUint32(slot + EXIT_9A19A0_SLOT_BACKPTR_OFF, addr, true);
    view.setUint16(slot + EXIT_9A19A0_SLOT_INDEX_OFF, i & 0xffff, true);
  }
  return {
    thisOff: base,
    thisAddr: addr,
    count: EXIT_9A19A0_PLAYERHUD_LOOP_COUNT,
  };
}

/** This-relative base offset of slot i, or 0xffffffff if out of range. */
export function exit9a19a0SlotBaseOff(index) {
  const i = index >>> 0;
  if (i >= EXIT_9A19A0_PLAYERHUD_LOOP_COUNT) return 0xffffffff;
  return (i * EXIT_9A19A0_PLAYERHUD_STRIDE) >>> 0;
}

/** Tail pure: byte this+0x54cc ← 1. */
export function exit9a19a0Field54ccSet(prior) {
  return {
    field54cc: EXIT_9A19A0_FIELD_54CC_VALUE,
    prior: (prior | 0) & 0xff,
  };
}

/* --- ABI v9: pure islands / CF inside residual host 0x0040e910 --- */

/** Outer walk needed when first != sentinel. */
export function exit40e910ListHostNeeded(sentinel, first) {
  return (first >>> 0) !== (sentinel >>> 0);
}

/** Node object at +0x18 non-null → COM path. */
export function exit40e910NodeObjectPresent(objPtr) {
  return (objPtr >>> 0) !== 0;
}

/**
 * After COM hosts: free when zero-extended word(obj+4) <= 2.
 * Accepts full 32-bit; only low 16 bits matter (PE movzx).
 */
export function exit40e910FreeAfterComNeeded(objWord4) {
  return ((objWord4 >>> 0) & 0xffff) <= EXIT_40E910_COM_FREE_WORD_MAX;
}

/** Post-erase dtor object non-null. */
export function exit40e910PostEraseDtorNeeded(objPtr) {
  return (objPtr >>> 0) !== 0;
}

/**
 * After host virtual AL: callback when AL != 0 and global_fn != 0.
 */
export function exit40e910PostEraseCallbackNeeded(virtualAl, globalFn) {
  if (((virtualAl | 0) & 0xff) === 0) return false;
  return (globalFn >>> 0) !== 0;
}

/** Free size imm 0x1c. */
export function exit40e910FreeSize() {
  return EXIT_40E910_NODE_SIZE >>> 0;
}

/* --- ABI v41: 0x0040e910 decision laws (list walk + COM release) --- */

/**
 * Loop-continue law (PE @ 0x0040e9de: cmp esi, dword [DAT_00c78ee8];
 * jne loop). cur is the node after host tree++ (keep path) or the erase
 * return (free path); sentinel is RE-READ from DAT_00c78ee8 every
 * iteration — the caller must pass the fresh read, not the entry head.
 */
export function exit40e910WalkContinue(cur, sentinel) {
  return (cur >>> 0) !== (sentinel >>> 0);
}

/** COM release this = obj+8 (PE lea ebx, [edi+8] @ 0x0040e952); u32 wrap. */
export function exit40e910ComIfaceAddr(objPtr) {
  return ((objPtr >>> 0) + EXIT_40E910_OBJ_COM_OFF) >>> 0;
}

/** First COM method stack arg = -1 (PE push -1 @ 0x0040e955). */
export function exit40e910ComReleaseArg() {
  return EXIT_40E910_COM_RELEASE_ARG >>> 0;
}

/**
 * COM state word: zero-extended 16-bit word at obj+4 (PE movzx edi,
 * word ptr [edi+4] @ 0x0040e960) — feeds free_after_com_needed.
 */
export function exit40e910ComStateWord(objWord4) {
  return (objWord4 >>> 0) & 0xffff;
}

/**
 * Pure freestanding MSVC tree iterator++ (PE 0x00414a80).
 * @param {DataView} view linear memory
 * @param {number} itOff offset of the iterator dword (current node addr)
 * @returns {number} new node address written to itOff
 */
export function exitTreeIteratorNext(view, itOff) {
  const base = itOff >>> 0;
  let node = view.getUint32(base, true) >>> 0;
  if (node === 0) return 0;

  const loadU32 = (addr) => view.getUint32(addr >>> 0, true) >>> 0;
  const isNil = (addr) => view.getUint8(((addr >>> 0) + EXIT_TREE_ISNIL_OFF) >>> 0);

  const right = loadU32(node + EXIT_TREE_RIGHT_OFF);
  if (isNil(right) !== 0) {
    let cur = node;
    let parent = loadU32(cur + EXIT_TREE_PARENT_OFF);
    if (isNil(parent) === 0) {
      while (cur === loadU32(parent + EXIT_TREE_RIGHT_OFF)) {
        view.setUint32(base, parent >>> 0, true);
        cur = parent;
        parent = loadU32(cur + EXIT_TREE_PARENT_OFF);
        if (isNil(parent) !== 0) break;
      }
    }
    view.setUint32(base, parent >>> 0, true);
    return parent >>> 0;
  }

  let walk = right;
  let left = loadU32(walk + EXIT_TREE_LEFT_OFF);
  if (isNil(left) === 0) {
    do {
      walk = left;
      left = loadU32(walk + EXIT_TREE_LEFT_OFF);
    } while (isNil(left) === 0);
  }
  view.setUint32(base, walk >>> 0, true);
  return walk >>> 0;
}

/* --- ABI v10: map walk Game+0x1a738 + residual 0x0069d690 pure islands --- */

/** Outer walk needed when first != sentinel. */
export function exitMap1a738WalkNeeded(sentinel, first) {
  return (first >>> 0) !== (sentinel >>> 0);
}

/** Post-find hit when found != sentinel. */
export function exitMap1a738LookupHit(sentinel, found) {
  return (found >>> 0) !== (sentinel >>> 0);
}

/** Element-host path when flag@node+0x28 != 0. */
export function exitMap1a738FlagActive(flag28) {
  return ((flag28 | 0) & 0xff) !== 0;
}

/** Element range non-empty when begin != end. */
export function exitMap1a738ElemRangeNonempty(begin, end) {
  return (begin >>> 0) !== (end >>> 0);
}

/**
 * Combined host 0x0040c7f0×N gate: hit && flag && nonempty.
 */
export function exitMap1a738ElemWalkNeeded(sentinel, found, flag28, begin, end) {
  if ((found >>> 0) === (sentinel >>> 0)) return false;
  if (((flag28 | 0) & 0xff) === 0) return false;
  return (begin >>> 0) !== (end >>> 0);
}

/** PE imm: elem stride 0x20. */
export function exitMap1a738ElemStride() {
  return EXIT_MAP_ELEM_STRIDE >>> 0;
}

/** PE imm: host this = elem+0x18. */
export function exitMap1a738ElemHostOff() {
  return EXIT_MAP_ELEM_HOST_OFF >>> 0;
}

/** MSVC SSO: capacity < 0x10 → inline. */
export function exitMsvcStringSsoInline(capacity) {
  return (capacity >>> 0) < EXIT_MSVC_STRING_SSO_CAP;
}

/**
 * MSVC basic_string data address: SSO → str_addr; else dword0 (*str).
 */
export function exitMsvcStringDataAddr(strAddr, capacity, dword0) {
  if ((capacity >>> 0) < EXIT_MSVC_STRING_SSO_CAP) return strAddr >>> 0;
  return dword0 >>> 0;
}

/**
 * Pure-complete string compare (PE 0x00423480).
 * @param {Uint8Array|number[]} s1
 * @param {Uint8Array|number[]} s2
 * @returns {number} <0 / 0 / >0
 */
export function exitStringCompare(s1, len1, s2, len2) {
  const n1 = len1 >>> 0;
  const n2 = len2 >>> 0;
  const n = n1 < n2 ? n1 : n2;
  for (let i = 0; i < n; i++) {
    const a = (s1[i] | 0) & 0xff;
    const b = (s2[i] | 0) & 0xff;
    if (a !== b) return a < b ? -1 : 1;
  }
  if (n2 > n1) return -1;
  if (n1 > n2) return 1;
  return 0;
}

/** 0x0069d690: isnil(candidate) → miss path. */
export function exit69d690CandidateIsnil(isnilByte) {
  return ((isnilByte | 0) & 0xff) !== 0;
}

/** 0x0069d690: hit when strcmp result >= 0. */
export function exit69d690CmpIsHit(cmpResult) {
  return (cmpResult | 0) >= 0;
}

/**
 * Select find result: isnil or cmp < 0 → sentinel; else candidate.
 */
export function exit69d690SelectResult(sentinel, candidate, isnilByte, cmpResult) {
  if (((isnilByte | 0) & 0xff) !== 0) return sentinel >>> 0;
  if ((cmpResult | 0) < 0) return sentinel >>> 0;
  return candidate >>> 0;
}

/* --- ABI v11: pure islands + pure-complete lower_bound 0x00685bc0 --- */

/**
 * Init lower_bound triple: walk=root, bound=0, best=sentinel.
 * @returns {{ walk: number, bound: number, best: number }}
 */
export function exit685bc0InitTriple(sentinel, root) {
  return {
    walk: root >>> 0,
    bound: 0,
    best: sentinel >>> 0,
  };
}

/** Empty tree when root isnil != 0. */
export function exit685bc0RootIsEmpty(rootIsnil) {
  return ((rootIsnil | 0) & 0xff) !== 0;
}

/** After strcmp(node, key): go right when cmp < 0. */
export function exit685bc0CmpGoRight(cmpResult) {
  return (cmpResult | 0) < 0;
}

/**
 * One loop step after strcmp(node, key).
 * @returns {{ walk: number, bound: number, best: number }}
 */
export function exit685bc0Step(triple, node, left, right, cmpResult) {
  const best0 = triple && triple.best !== undefined ? triple.best >>> 0 : 0;
  if ((cmpResult | 0) < 0) {
    return { walk: right >>> 0, bound: 0, best: best0 };
  }
  return { walk: left >>> 0, bound: 1, best: node >>> 0 };
}

/** Continue loop when next isnil == 0. */
export function exit685bc0LoopContinue(nextIsnil) {
  return ((nextIsnil | 0) & 0xff) === 0;
}

function loadU32View(view, addr) {
  return view.getUint32(addr >>> 0, true) >>> 0;
}

function storeU32View(view, addr, value) {
  view.setUint32(addr >>> 0, value >>> 0, true);
}

function loadIsnilView(view, nodeAddr) {
  return view.getUint8(((nodeAddr >>> 0) + EXIT_TREE_ISNIL_OFF) >>> 0);
}

function msvcStringSizeView(view, strAddr) {
  return loadU32View(view, (strAddr >>> 0) + EXIT_MSVC_STRING_SIZE_OFF);
}

function msvcStringDataAddrView(view, strAddr) {
  const cap = loadU32View(view, (strAddr >>> 0) + EXIT_MSVC_STRING_CAP_OFF);
  if (cap < EXIT_MSVC_STRING_SSO_CAP) return strAddr >>> 0;
  return loadU32View(view, strAddr);
}

function stringCompareAddrsView(view, s1, len1, s2, len2) {
  const n1 = len1 >>> 0;
  const n2 = len2 >>> 0;
  const n = n1 < n2 ? n1 : n2;
  for (let i = 0; i < n; i++) {
    const a = view.getUint8(((s1 >>> 0) + i) >>> 0);
    const b = view.getUint8(((s2 >>> 0) + i) >>> 0);
    if (a !== b) return a < b ? -1 : 1;
  }
  if (n2 > n1) return -1;
  if (n1 > n2) return 1;
  return 0;
}

/**
 * Pure-complete map lower_bound (PE 0x00685bc0).
 * @param {DataView} view
 * @param {number} mapAddr [map]=sentinel; root=[sentinel+4]
 * @param {number} outAddr 12-byte triple
 * @param {number} keyAddr MSVC basic_string
 * @returns {number} outAddr
 */
export function exitMapLowerBound(view, mapAddr, outAddr, keyAddr) {
  if ((mapAddr >>> 0) === 0 || (outAddr >>> 0) === 0) return 0;
  const sentinel = loadU32View(view, mapAddr);
  const root = loadU32View(view, (sentinel >>> 0) + EXIT_MAP_ROOT_FROM_SENTINEL_OFF);
  storeU32View(view, (outAddr >>> 0) + EXIT_LOWER_BOUND_WALK_OFF, root);
  storeU32View(view, (outAddr >>> 0) + EXIT_LOWER_BOUND_BOUND_OFF, 0);
  storeU32View(view, (outAddr >>> 0) + EXIT_LOWER_BOUND_BEST_OFF, sentinel);
  if (loadIsnilView(view, root) !== 0) return outAddr >>> 0;

  const keySize = msvcStringSizeView(view, keyAddr);
  const keyData = msvcStringDataAddrView(view, keyAddr);
  let walk = root >>> 0;
  let best = sentinel >>> 0;
  for (;;) {
    storeU32View(view, (outAddr >>> 0) + EXIT_LOWER_BOUND_WALK_OFF, walk);
    const nodeKey = (walk + EXIT_MAP_NODE_KEY_OFF) >>> 0;
    const nodeSize = msvcStringSizeView(view, nodeKey);
    const nodeData = msvcStringDataAddrView(view, nodeKey);
    const cmp = stringCompareAddrsView(view, nodeData, nodeSize, keyData, keySize);
    let bound = 0;
    if ((cmp | 0) < 0) {
      walk = loadU32View(view, walk + EXIT_TREE_RIGHT_OFF);
      bound = 0;
    } else {
      best = walk;
      storeU32View(view, (outAddr >>> 0) + EXIT_LOWER_BOUND_BEST_OFF, best);
      bound = 1;
      walk = loadU32View(view, walk + EXIT_TREE_LEFT_OFF);
    }
    storeU32View(view, (outAddr >>> 0) + EXIT_LOWER_BOUND_BOUND_OFF, bound);
    if (loadIsnilView(view, walk) !== 0) {
      // The PE writes [edi] only at init (0x00685bcd) and at the loop head
      // (0x00685bf0). A nil child falls out at 0x00685c36 without touching
      // it, so walk keeps the last non-nil node. (stale-state audit F7)
      break;
    }
  }
  return outAddr >>> 0;
}

/**
 * Pure-complete map find (PE 0x0069d690).
 * @param {DataView} view
 * @param {number} mapAddr
 * @param {number} outNodeAddr dword receiving found node or sentinel
 * @param {number} keyAddr
 * @returns {number} outNodeAddr
 */
export function exitMapFind69d690(view, mapAddr, outNodeAddr, keyAddr) {
  if ((mapAddr >>> 0) === 0 || (outNodeAddr >>> 0) === 0) return 0;
  const sentinel = loadU32View(view, mapAddr);
  const root = loadU32View(view, (sentinel >>> 0) + EXIT_MAP_ROOT_FROM_SENTINEL_OFF);
  let walk = root >>> 0;
  let best = sentinel >>> 0;
  if (loadIsnilView(view, root) === 0) {
    const keySize = msvcStringSizeView(view, keyAddr);
    const keyData = msvcStringDataAddrView(view, keyAddr);
    for (;;) {
      const nodeKey = (walk + EXIT_MAP_NODE_KEY_OFF) >>> 0;
      const nodeSize = msvcStringSizeView(view, nodeKey);
      const nodeData = msvcStringDataAddrView(view, nodeKey);
      const cmp = stringCompareAddrsView(view, nodeData, nodeSize, keyData, keySize);
      if ((cmp | 0) < 0) {
        walk = loadU32View(view, walk + EXIT_TREE_RIGHT_OFF);
      } else {
        best = walk;
        walk = loadU32View(view, walk + EXIT_TREE_LEFT_OFF);
      }
      if (loadIsnilView(view, walk) !== 0) break;
    }
  }
  if (loadIsnilView(view, best) !== 0) {
    storeU32View(view, outNodeAddr, sentinel);
    return outNodeAddr >>> 0;
  }
  const nodeKey = (best + EXIT_MAP_NODE_KEY_OFF) >>> 0;
  const nodeSize = msvcStringSizeView(view, nodeKey);
  const nodeData = msvcStringDataAddrView(view, nodeKey);
  const keySize = msvcStringSizeView(view, keyAddr);
  const keyData = msvcStringDataAddrView(view, keyAddr);
  const cmp = stringCompareAddrsView(view, keyData, keySize, nodeData, nodeSize);
  if ((cmp | 0) < 0) {
    storeU32View(view, outNodeAddr, sentinel);
  } else {
    storeU32View(view, outNodeAddr, best);
  }
  return outNodeAddr >>> 0;
}

/* --- ABI v12: pure islands / CF inside residual host 0x0040c7f0 --- */

/** Alloc size imm 0x18 before host 0x00a0f4c0. */
export function exit40c7f0AllocSize() {
  return EXIT_40C7F0_ALLOC_SIZE >>> 0;
}

/** Host ctor path when alloc ptr != 0. */
export function exit40c7f0AllocOk(allocPtr) {
  return (allocPtr >>> 0) !== 0;
}

/** Old holder at this+4 non-null → virtual release. */
export function exit40c7f0OldObjectPresent(oldObjPtr) {
  return (oldObjPtr >>> 0) !== 0;
}

/**
 * After host virtual AL: callback when AL != 0 and global_fn != 0.
 * Same CF as exit40e910PostEraseCallbackNeeded.
 */
export function exit40c7f0CallbackNeeded(virtualAl, globalFn) {
  if (((virtualAl | 0) & 0xff) === 0) return false;
  return (globalFn >>> 0) !== 0;
}

/**
 * Post-ctor pure on new object: vtable ← 0xb1a6e0, arg@+0x14 ← arg.
 * @returns {{ vtable: number, arg: number }}
 */
export function exit40c7f0ObjectFinish(arg) {
  return {
    vtable: EXIT_40C7F0_VTABLE >>> 0,
    arg: arg >>> 0,
  };
}

/**
 * Linear-memory form of object finish.
 * @param {DataView} view
 * @param {number} objOff
 * @param {number} arg
 */
export function exit40c7f0ObjectFinishApply(view, objOff, arg) {
  if ((objOff >>> 0) === 0) return;
  storeU32View(view, objOff, EXIT_40C7F0_VTABLE);
  storeU32View(view, (objOff >>> 0) + EXIT_40C7F0_ARG_OFF, arg >>> 0);
}

/**
 * Pure tail pair: *this ← arg; this+4 ← newObj.
 * @returns {{ value: number, obj: number }}
 */
export function exit40c7f0PairApply(arg, newObj) {
  return {
    value: arg >>> 0,
    obj: newObj >>> 0,
  };
}

/**
 * Linear-memory pair apply on 8-byte pair at pairOff.
 * @param {DataView} view
 * @param {number} pairOff
 * @param {number} arg
 * @param {number} newObj
 */
export function exit40c7f0PairApplyBase(view, pairOff, arg, newObj) {
  if ((pairOff >>> 0) === 0) return;
  storeU32View(view, (pairOff >>> 0) + EXIT_40C7F0_PAIR_VALUE_OFF, arg >>> 0);
  storeU32View(view, (pairOff >>> 0) + EXIT_40C7F0_PAIR_OBJ_OFF, newObj >>> 0);
}

/**
 * Nested 0x0040cc10 pure field pack (always; before DAT_00b81c10 host).
 * @returns {{ vtable: number, field4: number, subVtable: number, fieldC: number, field10: number }}
 */
export function exit40cc10PureFields() {
  return {
    vtable: EXIT_40CC10_VTABLE >>> 0,
    field4: EXIT_40CC10_FIELD4 >>> 0,
    subVtable: EXIT_40CC10_SUB_VTABLE >>> 0,
    fieldC: 0,
    field10: 0,
  };
}

/**
 * Linear-memory apply of 40cc10 pure stores.
 * @param {DataView} view
 * @param {number} objOff
 */
export function exit40cc10Apply(view, objOff) {
  if ((objOff >>> 0) === 0) return;
  const pack = exit40cc10PureFields();
  storeU32View(view, objOff, pack.vtable);
  storeU32View(view, (objOff >>> 0) + 4, pack.field4);
  storeU32View(view, (objOff >>> 0) + 8, pack.subVtable);
  view.setUint8(((objOff >>> 0) + 0xc) >>> 0, pack.fieldC);
  storeU32View(view, (objOff >>> 0) + 0x10, pack.field10);
}

/** DAT_00b81c10 == 0xa15770 → direct call path. */
export function exit40cc10DefaultInitIsDirect(datB81c10) {
  return (datB81c10 >>> 0) === (EXIT_40CC10_DEFAULT_INIT >>> 0);
}

/** Immediate default-init VA. */
export function exit40cc10DefaultInitVa() {
  return EXIT_40CC10_DEFAULT_INIT >>> 0;
}

/** Post-ctor derived vtable immediate. */
export function exit40c7f0Vtable() {
  return EXIT_40C7F0_VTABLE >>> 0;
}

/* --- ABI v13: pure islands / CF inside residual host 0x00408830 --- */

/** Entry store value for this+4 ← stack arg. */
export function exit408830StoreArg(arg) {
  return arg >>> 0;
}

/**
 * Linear-memory entry store at thisOff+4.
 * @param {DataView} view
 * @param {number} thisOff
 * @param {number} arg
 */
export function exit408830StoreArgApply(view, thisOff, arg) {
  if ((thisOff >>> 0) === 0) return;
  storeU32View(view, (thisOff >>> 0) + EXIT_408830_FIELD_4_OFF, arg >>> 0);
}

/** Free host path when buffer ptr != 0. */
export function exit408830PtrFreeNeeded(ptr) {
  return (ptr >>> 0) !== 0;
}

/** Post-free pure zero of a buffer slot. */
export function exit408830PtrClear() {
  return 0;
}

/** Alloc cluster when this+4 / arg != 0. */
export function exit408830ArgPresent(arg) {
  return (arg >>> 0) !== 0;
}

/** Per-count alloc gate: count != 0. */
export function exit408830CountNonzero(count) {
  return (count >>> 0) !== 0;
}

/**
 * Overflow-safe alloc byte size: count * 4 with seto → 0xffffffff.
 * @param {number} count
 */
export function exit408830AllocSize(count) {
  const c = count >>> 0;
  const prod = c * EXIT_408830_ELEM_SIZE;
  // JS number is fine for u32*4; clamp when product exceeds u32.
  if (prod > 0xffffffff) return 0xffffffff;
  return prod >>> 0;
}

/** Memset byte count: count << 2 (no overflow check). */
export function exit408830FillSize(count) {
  return ((count >>> 0) << 2) >>> 0;
}

/** Memset fill immediate 0xff. */
export function exit408830FillByte() {
  return EXIT_408830_FILL_BYTE & 0xff;
}

/** Terminal float bits at this+0x10. */
export function exit408830Field10Bits() {
  return EXIT_408830_F32_10_BITS >>> 0;
}

/**
 * Terminal pure pack after free/alloc hosts.
 * @returns {{ field10: number, field14: number, field18: number, field1c: number }}
 */
export function exit408830Tail() {
  return {
    field10: EXIT_408830_F32_10_BITS >>> 0,
    field14: 0,
    field18: 0,
    field1c: 0,
  };
}

/**
 * Linear-memory terminal pack on thisOff (+0x10..+0x1c).
 * @param {DataView} view
 * @param {number} thisOff
 */
export function exit408830TailApply(view, thisOff) {
  if ((thisOff >>> 0) === 0) return;
  const base = thisOff >>> 0;
  const t = exit408830Tail();
  storeU32View(view, base + EXIT_408830_FIELD_10_OFF, t.field10);
  view.setUint8((base + EXIT_408830_FIELD_14_OFF) >>> 0, t.field14);
  storeU32View(view, base + EXIT_408830_FIELD_18_OFF, t.field18);
  storeU32View(view, base + EXIT_408830_FIELD_1C_OFF, t.field1c);
}

/* --- ABI v14: pure islands / CF inside residual host 0x009b4810 --- */

/** Vector end ← begin. */
export function exit9b4810VecResetEnd(begin) {
  return begin >>> 0;
}

/**
 * Linear-memory end reset: thisOff+0x280 ← thisOff+0x27c.
 * @param {DataView} view
 * @param {number} thisOff
 */
export function exit9b4810VecResetEndApply(view, thisOff) {
  if ((thisOff >>> 0) === 0) return;
  const base = thisOff >>> 0;
  const begin = view.getUint32((base + EXIT_9B4810_VEC_BEGIN_OFF) >>> 0, true);
  storeU32View(view, base + EXIT_9B4810_VEC_END_OFF, begin);
}

/** First push value from mode@+0. */
export function exit9b4810FirstPushValue(mode) {
  const m = mode >>> 0;
  return m === 0 || m === 3 ? 0 : 1;
}

export function exit9b4810ModeIs3(mode) {
  return (mode >>> 0) === 3;
}

export function exit9b4810ModeIs1(mode) {
  return (mode >>> 0) === 1;
}

export function exit9b4810ModeLayerPath(mode) {
  const m = mode >>> 0;
  return m === 1 || m === 2;
}

export function exit9b4810ModeBlockANeeded(mode) {
  return (mode >>> 0) !== 3;
}

export function exit9b4810ModeBlockCNeeded(mode) {
  return (mode >>> 0) !== 3;
}

export function exit9b4810ModeBlockENeeded(mode) {
  return (mode >>> 0) !== 3;
}

export function exit9b4810ModeBlockFNeeded(mode) {
  return (mode >>> 0) !== 1;
}

/** Vector pure-push gate: end != cap. */
export function exit9b4810VecSpace(end, cap) {
  return (end >>> 0) !== (cap >>> 0);
}

/** Pure end advance after dword push. */
export function exit9b4810VecEndAfterPush(end) {
  return ((end >>> 0) + EXIT_9B4810_ELEM_SIZE) >>> 0;
}

/** Pure store of push value (returns the value written). */
export function exit9b4810VecStore(value) {
  return value >>> 0;
}

/**
 * Pure push: store value, return { value, newEnd }.
 * @param {number} end
 * @param {number} value
 */
export function exit9b4810VecPushPure(end, value) {
  return {
    value: value >>> 0,
    newEnd: exit9b4810VecEndAfterPush(end),
  };
}

/**
 * Linear-memory pure push. begin/end/cap are byte offsets into arenaBase.
 * @param {DataView} view
 * @param {number} thisOff
 * @param {number} arenaBase
 * @param {number} value
 * @returns {boolean} true if pure push ran
 */
export function exit9b4810VecPushApply(view, thisOff, arenaBase, value) {
  if ((thisOff >>> 0) === 0) return false;
  const base = thisOff >>> 0;
  const end = view.getUint32((base + EXIT_9B4810_VEC_END_OFF) >>> 0, true);
  const cap = view.getUint32((base + EXIT_9B4810_VEC_CAP_OFF) >>> 0, true);
  if (end === cap) return false;
  storeU32View(view, ((arenaBase >>> 0) + end) >>> 0, value >>> 0);
  storeU32View(view, base + EXIT_9B4810_VEC_END_OFF, exit9b4810VecEndAfterPush(end));
  return true;
}

function blockAt(table, index) {
  const i = index >>> 0;
  if (i >= table.length) return 0;
  return table[i] >>> 0;
}

export function exit9b4810BlockACount() {
  return EXIT_9B4810_BLOCK_A.length;
}
export function exit9b4810BlockAAt(index) {
  return blockAt(EXIT_9B4810_BLOCK_A, index);
}
export function exit9b4810BlockBCount() {
  return EXIT_9B4810_BLOCK_B.length;
}
export function exit9b4810BlockBAt(index) {
  return blockAt(EXIT_9B4810_BLOCK_B, index);
}
export function exit9b4810BlockCCount() {
  return EXIT_9B4810_BLOCK_C.length;
}
export function exit9b4810BlockCAt(index) {
  return blockAt(EXIT_9B4810_BLOCK_C, index);
}
export function exit9b4810BlockDCount() {
  return EXIT_9B4810_BLOCK_D.length;
}
export function exit9b4810BlockDAt(index) {
  return blockAt(EXIT_9B4810_BLOCK_D, index);
}
export function exit9b4810BlockECount() {
  return EXIT_9B4810_BLOCK_E.length;
}
export function exit9b4810BlockEAt(index) {
  return blockAt(EXIT_9B4810_BLOCK_E, index);
}
export function exit9b4810BlockFCount() {
  return EXIT_9B4810_BLOCK_F.length;
}
export function exit9b4810BlockFAt(index) {
  return blockAt(EXIT_9B4810_BLOCK_F, index);
}
export function exit9b4810Value1c() {
  return EXIT_9B4810_VALUE_1C >>> 0;
}

/**
 * Optional push 0x1c CF.
 * @param {number} selectedFlag2b9
 * @param {number} managerField8
 * @param {number} gamePtrNull
 * @param {number} game26630
 * @param {number} game26589
 */
export function exit9b4810Push1cNeeded(
  selectedFlag2b9,
  managerField8,
  gamePtrNull,
  game26630,
  game26589,
) {
  if ((selectedFlag2b9 & 0xff) !== 0) return true;
  if ((managerField8 >>> 0) !== 2) return false;
  if ((gamePtrNull & 0xff) !== 0) return false;
  if ((game26630 >>> 0) > 0) return true;
  return (game26589 & 0xff) !== 0;
}

/** Layer loop when signed count > 0. */
export function exit9b4810LayerLoopNeeded(layerCount) {
  return (layerCount | 0) > 0;
}

/**
 * Counter play-skip CF.
 * @param {number} strNull
 * @param {number} strcmpEq
 * @param {number} animFlag34
 * @param {number} this17c
 */
export function exit9b4810CounterPlayNeeded(strNull, strcmpEq, animFlag34, this17c) {
  if ((strNull & 0xff) !== 0) return true;
  if ((strcmpEq & 0xff) === 0) return true;
  if ((animFlag34 & 0xff) === 0) return false;
  if ((this17c & 0xff) !== 0) return false;
  return true;
}

/** Post-Rewind play flag value. */
export function exit9b4810PlayFlagSet() {
  return EXIT_9B4810_PLAY_FLAG_VALUE & 0xff;
}

/**
 * Linear-memory play flag at thisOff+0x17c.
 * @param {DataView} view
 * @param {number} thisOff
 */
export function exit9b4810PlayFlagApply(view, thisOff) {
  if ((thisOff >>> 0) === 0) return;
  view.setUint8(
    ((thisOff >>> 0) + EXIT_9B4810_ANM2_138_OFF + EXIT_9B4810_PLAY_FLAG_OFF) >>> 0,
    EXIT_9B4810_PLAY_FLAG_VALUE & 0xff,
  );
}

/**
 * Terminal pure pack. gC7b640 / gC7b644 are the RUNTIME values of the two
 * globals the PE loads at 0x009b4fc0 / 0x009b4fcd (movss [0xc7b640]/[0xc7b644]).
 * @param {number} fieldC
 * @param {number} field10
 */
export function exit9b4810Tail(fieldC, field10, gC7b640 = 0, gC7b644 = 0) {
  return {
    field4: 0,
    field8: 0,
    field14: fieldC >>> 0,
    field18: field10 >>> 0,
    field1c: gC7b640 >>> 0,
    field20: gC7b644 >>> 0,
    field24c: 0,
    field250: 0,
    field254: 0,
  };
}

/**
 * Linear-memory terminal pack.
 * @param {DataView} view
 * @param {number} thisOff
 */
export function exit9b4810TailApply(view, thisOff, gC7b640 = 0, gC7b644 = 0) {
  if ((thisOff >>> 0) === 0) return;
  const base = thisOff >>> 0;
  const fieldC = view.getUint32((base + EXIT_9B4810_FIELD_C_OFF) >>> 0, true);
  const field10 = view.getUint32((base + EXIT_9B4810_FIELD_10_OFF) >>> 0, true);
  const t = exit9b4810Tail(fieldC, field10, gC7b640, gC7b644);
  view.setUint8((base + EXIT_9B4810_FIELD_4_OFF) >>> 0, t.field4);
  storeU32View(view, base + EXIT_9B4810_FIELD_8_OFF, t.field8);
  storeU32View(view, base + EXIT_9B4810_FIELD_14_OFF, t.field14);
  storeU32View(view, base + EXIT_9B4810_FIELD_18_OFF, t.field18);
  storeU32View(view, base + EXIT_9B4810_FIELD_1C_OFF, t.field1c);
  storeU32View(view, base + EXIT_9B4810_FIELD_20_OFF, t.field20);
  storeU32View(view, base + EXIT_9B4810_FIELD_24C_OFF, t.field24c);
  storeU32View(view, base + EXIT_9B4810_FIELD_250_OFF, t.field250);
  storeU32View(view, base + EXIT_9B4810_FIELD_254_OFF, t.field254);
}

export function exitF32GlobalC7b640Addr() {
  return EXIT_F32_GLOBAL_C7B640_ADDR >>> 0;
}

export function exitF32GlobalC7b644Addr() {
  return EXIT_F32_GLOBAL_C7B644_ADDR >>> 0;
}

/* --- ABI v15: pure size/cap CF inside residual grow 0x00428590 --- */

/** SAR32((hi - lo) as i32, 2) — PE dword element count. */
function sar32Div4(hi, lo) {
  return ((hi - lo) | 0) >> 2 >>> 0;
}

/** Element count: SAR32(end - begin, 2). */
export function exit428590ElemCount(begin, end) {
  return sar32Div4(end >>> 0, begin >>> 0);
}

/** Capacity elems: SAR32(cap - begin, 2). */
export function exit428590CapacityElems(begin, cap) {
  return sar32Div4(cap >>> 0, begin >>> 0);
}

/** Insert index: SAR32(insert_pos - begin, 2). */
export function exit428590InsertIndex(begin, insertPos) {
  return sar32Div4(insertPos >>> 0, begin >>> 0);
}

export function exit428590MaxElems() {
  return EXIT_428590_MAX_ELEMS >>> 0;
}

/** Length throw when size == MAX. */
export function exit428590LengthErrorNeeded(size) {
  return (size >>> 0) === (EXIT_428590_MAX_ELEMS >>> 0);
}

/** needed = size + 1 (wrap). */
export function exit428590NeededSize(size) {
  return ((size >>> 0) + 1) >>> 0;
}

/** capacity > MAX - (capacity>>1). */
export function exit428590GeoWouldOverflow(capacity) {
  const c = capacity >>> 0;
  const half = c >>> 1;
  const limit = (EXIT_428590_MAX_ELEMS - half) >>> 0;
  return c > limit;
}

/** geometric = capacity + (capacity>>1). */
export function exit428590GeometricCapacity(capacity) {
  const c = capacity >>> 0;
  return (c + (c >>> 1)) >>> 0;
}

/**
 * Select new_cap when !length_error:
 * geo overflow → MAX; else max(geometric, needed).
 */
export function exit428590NewCapacity(capacity, needed) {
  if (exit428590GeoWouldOverflow(capacity)) {
    return EXIT_428590_MAX_ELEMS >>> 0;
  }
  const geo = exit428590GeometricCapacity(capacity);
  const n = needed >>> 0;
  return geo >= n ? geo : n;
}

/** Capacity throw when new_cap > MAX. */
export function exit428590CapacityErrorNeeded(newCapacity) {
  return (newCapacity >>> 0) > (EXIT_428590_MAX_ELEMS >>> 0);
}

/** Alloc bytes for host 0x40cf00: new_cap * 4. */
export function exit428590AllocBytes(newCapacity) {
  return ((newCapacity >>> 0) * EXIT_428590_ELEM_SIZE) >>> 0;
}

export function exit428590InsertSlot(newBegin, insertIndex) {
  return (
    ((newBegin >>> 0) + (insertIndex >>> 0) * EXIT_428590_ELEM_SIZE) >>> 0
  );
}

export function exit428590NewEnd(newBegin, needed) {
  return (((newBegin >>> 0) + (needed >>> 0) * EXIT_428590_ELEM_SIZE) >>> 0);
}

export function exit428590NewCapPtr(newBegin, allocBytes) {
  return (((newBegin >>> 0) + (allocBytes >>> 0)) >>> 0);
}

export function exit428590InsertAtEnd(insertPos, end) {
  return (insertPos >>> 0) === (end >>> 0);
}

export function exit428590CopyPrefixBytes(begin, insertPos) {
  return ((insertPos >>> 0) - (begin >>> 0)) >>> 0;
}

export function exit428590CopySuffixBytes(end, insertPos) {
  return ((end >>> 0) - (insertPos >>> 0)) >>> 0;
}

export function exit428590CopyAllBytes(begin, end) {
  return ((end >>> 0) - (begin >>> 0)) >>> 0;
}

export function exit428590OldFreeNeeded(begin) {
  return (begin >>> 0) !== 0;
}

/** (cap - begin) & ~3. */
export function exit428590OldCapacityBytes(begin, cap) {
  return (((cap >>> 0) - (begin >>> 0)) & 0xfffffffc) >>> 0;
}

export function exit428590FreeUsesHeapHeader(capacityBytes) {
  return (capacityBytes >>> 0) >= EXIT_428590_FREE_HEADER_THRESHOLD;
}

export function exit428590FreeHeaderSize(capacityBytes) {
  return ((capacityBytes >>> 0) + EXIT_428590_FREE_HEADER_ADD) >>> 0;
}

/** (begin - header - 4) <= 0x1f. */
export function exit428590FreeHeaderOffsetOk(begin, header) {
  const off = (((begin >>> 0) - (header >>> 0)) - 4) >>> 0;
  return off <= EXIT_428590_FREE_HEADER_OFFSET_MAX;
}

/**
 * Combined pure plan from vector pointers + insert_pos.
 * @returns {{
 *   size: number, capacity: number, insertIndex: number, needed: number,
 *   newCapacity: number, allocBytes: number, lengthError: boolean,
 *   capacityError: boolean, geoOverflow: boolean, insertAtEnd: boolean
 * }}
 */
export function exit428590Plan(begin, end, cap, insertPos) {
  const size = exit428590ElemCount(begin, end);
  const capacity = exit428590CapacityElems(begin, cap);
  const insertIndex = exit428590InsertIndex(begin, insertPos);
  const lengthError = exit428590LengthErrorNeeded(size);
  const needed = exit428590NeededSize(size);
  const geoOverflow = exit428590GeoWouldOverflow(capacity);
  let newCapacity = 0;
  let capacityError = false;
  if (!lengthError) {
    newCapacity = exit428590NewCapacity(capacity, needed);
    capacityError = exit428590CapacityErrorNeeded(newCapacity);
  }
  return {
    size,
    capacity,
    insertIndex,
    needed,
    newCapacity,
    allocBytes:
      !lengthError && !capacityError ? exit428590AllocBytes(newCapacity) : 0,
    lengthError,
    capacityError,
    geoOverflow,
    insertAtEnd: exit428590InsertAtEnd(insertPos, end),
  };
}

/**
 * Post-alloc pure pointer pack.
 * @returns {{ end: number, cap: number, insertSlot: number }}
 */
export function exit428590PostAllocPtrs(
  newBegin,
  needed,
  allocBytes,
  insertIndex,
) {
  return {
    end: exit428590NewEnd(newBegin, needed),
    cap: exit428590NewCapPtr(newBegin, allocBytes),
    insertSlot: exit428590InsertSlot(newBegin, insertIndex),
  };
}

/* --- ABI v16: ANM2::GetLayer(int) / ANM2::Load / alloc 0x40cf00 pure CF --- */

export function exitAnm2LayerStride() {
  return EXIT_ANM2_LAYER_STRIDE >>> 0;
}

/** Signed in-range: layerId >= 0 && layerId < count. */
export function exitAnm2GetlayerInRange(layerId, count) {
  return ((layerId | 0) >= 0 && (layerId | 0) < (count | 0));
}

export function exitAnm2LayerPtr(layerBase, layerId) {
  return (
    ((layerBase >>> 0) +
      ((layerId | 0) >>> 0) * EXIT_ANM2_LAYER_STRIDE) >>>
    0
  );
}

/**
 * @returns {{ ok: boolean, layer: number }}
 */
export function exitAnm2GetlayerTry(layerBase, layerId, count) {
  if (!exitAnm2GetlayerInRange(layerId, count)) {
    return { ok: false, layer: 0 };
  }
  return { ok: true, layer: exitAnm2LayerPtr(layerBase, layerId) };
}

/**
 * Read count@+0x80 / base@+0x7c from a DataView-like buffer.
 * @param {DataView} view
 * @param {number} anm2Base
 * @param {number} layerId
 * @returns {number} guest layer ptr or 0
 */
export function exitAnm2GetlayerApply(view, anm2Base, layerId) {
  if (view == null) return 0;
  const base = anm2Base >>> 0;
  const count = view.getInt32(base + EXIT_ANM2_LAYER_COUNT_OFF, true);
  if (!exitAnm2GetlayerInRange(layerId, count)) return 0;
  const layerBase = view.getUint32(base + EXIT_ANM2_LAYER_BASE_OFF, true);
  return exitAnm2LayerPtr(layerBase, layerId);
}

export function exitAnm2LoadPathPresent(pathSize10) {
  return (pathSize10 >>> 0) !== 0;
}

export function exitAnm2LoadPathIsSelf(thisAddr, pathAddr) {
  return (thisAddr >>> 0) === (pathAddr >>> 0);
}

export function exitAnm2LoadGraphicsNeeded(loadgraphics) {
  return ((loadgraphics | 0) & 0xff) !== 0;
}

/** @returns {{ flag109: number, shadowIndex10c: number }} */
export function exitAnm2LoadPrefix() {
  return {
    flag109: EXIT_ANM2_LOAD_FLAG_109_VALUE,
    shadowIndex10c: EXIT_ANM2_SHADOW_INDEX_INIT >>> 0,
  };
}

export function exitAnm2LoadPrefixApply(view, anm2Base) {
  if (view == null) return;
  const b = anm2Base >>> 0;
  view.setUint8(b + EXIT_ANM2_LOAD_FLAG_109_OFF, EXIT_ANM2_LOAD_FLAG_109_VALUE);
  view.setUint32(
    b + EXIT_ANM2_SHADOW_INDEX_OFF,
    EXIT_ANM2_SHADOW_INDEX_INIT >>> 0,
    true,
  );
}

export function exitAnm2LayerLoopNeeded(layerCount) {
  return (layerCount >>> 0) !== 0;
}

export function exitAnm2LayerByteOff(index) {
  return ((index >>> 0) * EXIT_ANM2_LAYER_STRIDE) >>> 0;
}

export function exitAnm2LayerNameHolderNull(holderPtr) {
  return (holderPtr >>> 0) === 0;
}

export function exitAnm2LayerNameStrAddr(holderPtr) {
  return ((holderPtr >>> 0) + EXIT_ANM2_LAYER_NAME_STR_DELTA) >>> 0;
}

/**
 * PE-inline null-terminated equality (2-byte steps).
 * @param {string|Uint8Array|number[]|null} a
 * @param {string|Uint8Array|number[]|null} b
 */
export function exitAnm2CstrEqual(a, b) {
  const toBytes = (x) => {
    if (x == null) return null;
    if (typeof x === "string") {
      const out = new Uint8Array(x.length + 1);
      for (let i = 0; i < x.length; i++) out[i] = x.charCodeAt(i) & 0xff;
      out[x.length] = 0;
      return out;
    }
    const arr = x instanceof Uint8Array ? x : Uint8Array.from(x);
    // ensure we can read past end as 0 for safety in tests
    return arr;
  };
  const pa = toBytes(a);
  const pb = toBytes(b);
  if (pa == null || pb == null) return pa === pb;
  let i = 0;
  for (;;) {
    const d0 = pa[i] ?? 0;
    const e0 = pb[i] ?? 0;
    if (d0 !== e0) return false;
    if (d0 === 0) return true;
    const d1 = pa[i + 1] ?? 0;
    const e1 = pb[i + 1] ?? 0;
    if (d1 !== e1) return false;
    i += 2;
    if (d1 === 0) return true;
  }
}

export function exitAnm2NameIsShadow(name) {
  return exitAnm2CstrEqual(name, EXIT_ANM2_SHADOW_NAME);
}

export function exitAnm2NameIsStar(firstByte) {
  return ((firstByte | 0) & 0xff) === EXIT_ANM2_STAR_BYTE;
}

export function exitAnm2LayerStarFlagsValue(flags) {
  return ((flags >>> 0) | EXIT_ANM2_LAYER_STAR_OR) >>> 0;
}

export function exitAnm2Flags110Or400Value(flags) {
  return ((flags >>> 0) | EXIT_ANM2_STAR_GLOBAL_OR_400) >>> 0;
}

export function exitAnm2Flags110Or800Value(flags) {
  return ((flags >>> 0) | EXIT_ANM2_STAR_GLOBAL_OR_800) >>> 0;
}

/**
 * One Load layer-loop pure step with host-supplied C-string name.
 * @returns {{ isShadow: boolean, shadowIndex: number|null, layerStarFlags: number|null, flags110: number|null }}
 */
export function exitAnm2LoadLayerStep(name, index, shadowIndex, layerStarFlags, flags110) {
  const n = name == null || name === "" ? "\0" : name;
  const nameForCmp = typeof n === "string" && n.endsWith("\0") ? n.slice(0, -1) : n;
  if (exitAnm2NameIsShadow(nameForCmp === "\0" ? "" : nameForCmp)) {
    return {
      isShadow: true,
      shadowIndex: index >>> 0,
      layerStarFlags: layerStarFlags == null ? null : layerStarFlags >>> 0,
      flags110: flags110 == null ? null : flags110 >>> 0,
    };
  }
  const first =
    typeof nameForCmp === "string"
      ? nameForCmp.length > 0
        ? nameForCmp.charCodeAt(0)
        : 0
      : nameForCmp[0] ?? 0;
  let star = layerStarFlags == null ? null : layerStarFlags >>> 0;
  let g = flags110 == null ? null : flags110 >>> 0;
  if (exitAnm2NameIsStar(first)) {
    if (star != null) star = exitAnm2LayerStarFlagsValue(star);
    if (g != null) g = exitAnm2Flags110Or400Value(g);
  }
  return {
    isShadow: false,
    shadowIndex: shadowIndex == null ? null : shadowIndex >>> 0,
    layerStarFlags: star,
    flags110: g,
  };
}

export function exitAnm2SheetLoopNeeded(sheetCount) {
  return (sheetCount >>> 0) !== 0;
}

export function exitAnm2SheetStride() {
  return EXIT_ANM2_SHEET_STRIDE >>> 0;
}

export function exitAnm2SheetPtr(sheetBase, index) {
  return (
    ((sheetBase >>> 0) + (index >>> 0) * EXIT_ANM2_SHEET_STRIDE) >>> 0
  );
}

/**
 * One sheet-loop pure step.
 * @returns {number|null} updated flags110
 */
export function exitAnm2LoadSheetStep(name, flags110) {
  if (flags110 == null) return null;
  const first =
    name == null || name === ""
      ? 0
      : typeof name === "string"
        ? name.charCodeAt(0)
        : name[0] ?? 0;
  if (exitAnm2NameIsStar(first)) {
    return exitAnm2Flags110Or800Value(flags110);
  }
  return flags110 >>> 0;
}

export function exit40cf00UsesHeapHeader(size) {
  return (size >>> 0) >= EXIT_40CF00_HEADER_THRESHOLD;
}

export function exit40cf00SizeIsZero(size) {
  return (size >>> 0) === 0;
}

export function exit40cf00HeaderRequestSize(size) {
  return ((size >>> 0) + EXIT_40CF00_HEADER_ADD) >>> 0;
}

export function exit40cf00HeaderOverflow(size) {
  const req = exit40cf00HeaderRequestSize(size);
  return req <= (size >>> 0);
}

export function exit40cf00AllocRequestSize(size) {
  if (exit40cf00UsesHeapHeader(size)) {
    if (exit40cf00HeaderOverflow(size)) return 0;
    return exit40cf00HeaderRequestSize(size);
  }
  return size >>> 0;
}

export function exit40cf00AlignUserPtr(rawPtr) {
  return (
    (((rawPtr >>> 0) + EXIT_40CF00_HEADER_ADD) & EXIT_40CF00_ALIGN_MASK) >>> 0
  );
}

export function exit40cf00HeaderSlot(alignedUserPtr) {
  return ((alignedUserPtr >>> 0) - 4) >>> 0;
}

/**
 * @returns {{
 *   size: number, requestSize: number, usesHeader: boolean,
 *   sizeZero: boolean, overflow: boolean, skipAlloc: boolean
 * }}
 */
export function exit40cf00Plan(size) {
  const s = size >>> 0;
  const usesHeader = exit40cf00UsesHeapHeader(s);
  const sizeZero = exit40cf00SizeIsZero(s);
  const overflow = usesHeader ? exit40cf00HeaderOverflow(s) : false;
  const skipAlloc = sizeZero || overflow;
  return {
    size: s,
    requestSize: skipAlloc ? 0 : exit40cf00AllocRequestSize(s),
    usesHeader,
    sizeZero,
    overflow,
    skipAlloc,
  };
}

/**
 * Finish large-path header: return aligned user ptr; optionally store raw.
 * @param {{ setUint32?: Function }|null} slotWriter object with setUint32(0, raw)
 *   or pass null for pure math only. For DataView tests use a wrapper.
 * @param {number} rawPtr
 * @returns {number} aligned user ptr
 */
export function exit40cf00FinishHeader(slotWriter, rawPtr) {
  const raw = rawPtr >>> 0;
  if (raw === 0) return 0;
  const aligned = exit40cf00AlignUserPtr(raw);
  if (slotWriter != null && typeof slotWriter.setUint32 === "function") {
    slotWriter.setUint32(0, raw, true);
  } else if (slotWriter != null && typeof slotWriter === "object" && "value" in slotWriter) {
    slotWriter.value = raw;
  }
  return aligned;
}

/**
 * Convenience: write raw into DataView at header slot for aligned user ptr.
 * @param {DataView} view
 * @param {number} rawPtr
 * @returns {number} aligned
 */
export function exit40cf00FinishHeaderApply(view, rawPtr) {
  const raw = rawPtr >>> 0;
  if (raw === 0) return 0;
  const aligned = exit40cf00AlignUserPtr(raw);
  if (view != null) {
    view.setUint32(exit40cf00HeaderSlot(aligned), raw, true);
  }
  return aligned;
}

/* --- ABI v17: ANM2::ReplaceSpritesheet / Play path 0x40a5d0 pure CF --- */

export function exitAnm2LayerPngStrOff() {
  return EXIT_ANM2_LAYER_PNG_STR_OFF >>> 0;
}

export function exitAnm2LayerFlag30Off() {
  return EXIT_ANM2_LAYER_FLAG30_OFF >>> 0;
}

export function exitAnm2LayerPngStrPtr(layerPtr) {
  return ((layerPtr >>> 0) + EXIT_ANM2_LAYER_PNG_STR_OFF) >>> 0;
}

/**
 * Sized equality (PE 0x0040cae0): lengths match then content equal.
 * @param {string|Uint8Array|number[]|null} a
 * @param {string|Uint8Array|number[]|null} b
 */
export function exitAnm2SizedEqual(a, lenA, b, lenB) {
  const la = lenA >>> 0;
  const lb = lenB >>> 0;
  if (la !== lb) return false;
  if (la === 0) return true;
  const toBytes = (x) => {
    if (x == null) return null;
    if (typeof x === "string") {
      const out = new Uint8Array(x.length);
      for (let i = 0; i < x.length; i++) out[i] = x.charCodeAt(i) & 0xff;
      return out;
    }
    return x instanceof Uint8Array ? x : Uint8Array.from(x);
  };
  const pa = toBytes(a);
  const pb = toBytes(b);
  if (pa == null || pb == null) return pa === pb;
  for (let i = 0; i < la; i++) {
    if (((pa[i] ?? 0) & 0xff) !== ((pb[i] ?? 0) & 0xff)) return false;
  }
  return true;
}

export function exitAnm2ReplaceAssignNeeded(pngStrAddr, pathAddr) {
  return (pngStrAddr >>> 0) !== (pathAddr >>> 0);
}

/**
 * @returns {{
 *   inRange: boolean, alreadyEqual: boolean, assignNeeded: boolean,
 *   willSucceed: boolean, returnBool: boolean, layerPtr: number,
 *   pngStrPtr: number
 * }}
 */
export function exitAnm2ReplacePlan(
  layerId,
  count,
  layerBase,
  pathAddr,
  layerData,
  layerSize,
  pathData,
  pathSize,
) {
  const inRange = exitAnm2GetlayerInRange(layerId, count);
  let layerPtr = 0;
  let pngStrPtr = 0;
  let alreadyEqual = false;
  let assignNeeded = false;
  let willSucceed = false;
  let returnBool = false;
  if (inRange) {
    layerPtr = exitAnm2LayerPtr(layerBase, layerId);
    pngStrPtr = exitAnm2LayerPngStrPtr(layerPtr);
    alreadyEqual = exitAnm2SizedEqual(pathData, pathSize, layerData, layerSize);
    if (!alreadyEqual) {
      willSucceed = true;
      returnBool = true;
      assignNeeded = exitAnm2ReplaceAssignNeeded(pngStrPtr, pathAddr);
    }
  }
  return {
    inRange,
    alreadyEqual,
    assignNeeded,
    willSucceed,
    returnBool,
    layerPtr,
    pngStrPtr,
  };
}

/** Success finish: clear flag30 when willSucceed; return PE bool. */
export function exitAnm2ReplaceFinish(layerBytes, willSucceed) {
  if (!willSucceed) return false;
  if (layerBytes != null) {
    if (layerBytes instanceof Uint8Array) {
      layerBytes[EXIT_ANM2_LAYER_FLAG30_OFF] = 0;
    } else if (typeof layerBytes === "object" && "setUint8" in layerBytes) {
      layerBytes.setUint8(EXIT_ANM2_LAYER_FLAG30_OFF, 0);
    }
  }
  return true;
}

export function exitAnm2AnimStride() {
  return EXIT_ANM2_ANIM_STRIDE >>> 0;
}

export function exitAnm2AnimBaseOff() {
  return EXIT_ANM2_ANIM_BASE_OFF >>> 0;
}

export function exitAnm2AnimCountOff() {
  return EXIT_ANM2_ANIM_COUNT_OFF >>> 0;
}

export function exitAnm2PlayStateOff() {
  return EXIT_ANM2_PLAY_STATE_OFF >>> 0;
}

export function exitAnm2AnimLoopNeeded(animCount) {
  return (animCount >>> 0) !== 0;
}

export function exitAnm2AnimEntryPtr(animBase, index) {
  return (
    ((animBase >>> 0) + (index >>> 0) * EXIT_ANM2_ANIM_STRIDE) >>> 0
  );
}

export function exitAnm2PlayStatePtr(anm2Addr) {
  return ((anm2Addr >>> 0) + EXIT_ANM2_PLAY_STATE_OFF) >>> 0;
}

export function exitAnm2PlayResetNeeded(reset) {
  return ((reset | 0) & 0xff) !== 0;
}

export function exitAnm2PlayNameMatch(entryName, animName) {
  return exitAnm2CstrEqual(entryName, animName);
}

/**
 * @returns {{
 *   loopNeeded: boolean, found: boolean, missLogNeeded: boolean,
 *   resetNeeded: boolean, returnBool: boolean, entryPtr: number,
 *   statePtr: number
 * }}
 */
export function exitAnm2PlayPlan(
  anm2Addr,
  animBase,
  animCount,
  foundIndex,
  reset,
) {
  const loopNeeded = exitAnm2AnimLoopNeeded(animCount);
  const fi = foundIndex | 0;
  const found =
    loopNeeded && fi >= 0 && fi < (animCount >>> 0);
  return {
    loopNeeded,
    found,
    missLogNeeded: !found,
    resetNeeded: found ? exitAnm2PlayResetNeeded(reset) : false,
    returnBool: !!found,
    entryPtr: found
      ? exitAnm2AnimEntryPtr(animBase, fi >>> 0)
      : 0,
    statePtr: found ? exitAnm2PlayStatePtr(anm2Addr) : 0,
  };
}

/**
 * Scan host-visible anim table in a DataView (MSVC SSO strings at entries).
 * @param {DataView} view
 * @param {number} animBase
 * @param {number} animCount
 * @param {string} animName
 * @returns {{ found: boolean, index: number }}
 */
export function exitAnm2PlayFind(view, animBase, animCount, animName) {
  const count = animCount >>> 0;
  if (view == null || count === 0 || animName == null) {
    return { found: false, index: -1 };
  }
  for (let i = 0; i < count; i++) {
    const entry = exitAnm2AnimEntryPtr(animBase, i);
    const cap = view.getUint32(entry + EXIT_MSVC_STRING_CAP_OFF, true);
    const dataAddr = exitMsvcStringDataAddr(
      entry,
      cap,
      view.getUint32(entry, true),
    );
    // Read null-terminated name from view at dataAddr
    let name = "";
    for (let j = 0; j < 256; j++) {
      const c = view.getUint8(dataAddr + j);
      if (c === 0) break;
      name += String.fromCharCode(c);
    }
    if (exitAnm2CstrEqual(name, animName)) {
      return { found: true, index: i };
    }
  }
  return { found: false, index: -1 };
}

/* --- ABI v18: exact AnimationState::Rewind 0x40a1b0 pure CF --- */

export function exitAnimstateAnimOff() {
  return EXIT_ANIMSTATE_ANIM_OFF >>> 0;
}
export function exitAnimstateLayerArrOff() {
  return EXIT_ANIMSTATE_LAYER_ARR_OFF >>> 0;
}
export function exitAnimstateNullArrOff() {
  return EXIT_ANIMSTATE_NULL_ARR_OFF >>> 0;
}
export function exitAnimstateFrameOff() {
  return EXIT_ANIMSTATE_FRAME_OFF >>> 0;
}
export function exitAnimstateMask18Off() {
  return EXIT_ANIMSTATE_MASK18_OFF >>> 0;
}
export function exitAnimstateMask1cOff() {
  return EXIT_ANIMSTATE_MASK1C_OFF >>> 0;
}
export function exitAnimdataLayerCountOff() {
  return EXIT_ANIMDATA_LAYER_COUNT_OFF >>> 0;
}
export function exitAnimdataNullCountOff() {
  return EXIT_ANIMDATA_NULL_COUNT_OFF >>> 0;
}
export function exitAnimdataEventBaseOff() {
  return EXIT_ANIMDATA_EVENT_BASE_OFF >>> 0;
}
export function exitAnimdataEventCountOff() {
  return EXIT_ANIMDATA_EVENT_COUNT_OFF >>> 0;
}
export function exitAnimEventStride() {
  return EXIT_ANIM_EVENT_STRIDE >>> 0;
}

/** Entry pure stores: frame + masks ← 0. */
export function exitAnimstateRewindPrefix() {
  return { frame: Math.fround(0), mask18: 0, mask1c: 0 };
}

/**
 * @param {DataView} view
 * @param {number} stateOff
 */
export function exitAnimstateRewindPrefixApply(view, stateOff) {
  if (view == null) return;
  const base = stateOff >>> 0;
  view.setFloat32(base + EXIT_ANIMSTATE_FRAME_OFF, Math.fround(0), true);
  view.setUint32(base + EXIT_ANIMSTATE_MASK18_OFF, 0, true);
  view.setUint32(base + EXIT_ANIMSTATE_MASK1C_OFF, 0, true);
}

export function exitAnimstate408c90AnimPresent(animPtr) {
  return (animPtr >>> 0) !== 0;
}

export function exitAnimstate408c90LogNeeded(animPtr) {
  return (animPtr >>> 0) === 0;
}

export function exitAnimstate408c90EventLoopNeeded(eventCount) {
  return (eventCount >>> 0) !== 0;
}

/**
 * PE cvtdq2ps + ucomiss ordered equal (NaN → false).
 * @param {number} stateFrame float32
 * @param {number} eventFrameI32 signed int32
 */
export function exitAnimstate408c90EventFrameEq(stateFrame, eventFrameI32) {
  const eventF = Math.fround(eventFrameI32 | 0);
  const stateF = Math.fround(stateFrame);
  return eventF === stateF;
}

/** PE bts r32: bit index modulo 32. */
export function exitAnimstate408c90MaskBts(mask, bitIndex) {
  return ((mask >>> 0) | (1 << ((bitIndex >>> 0) & 31))) >>> 0;
}

/**
 * One event step: on ordered-equal frames, bts both masks.
 * @returns {{ mask18: number, mask1c: number }}
 */
export function exitAnimstate408c90EventStep(
  mask18,
  mask1c,
  stateFrame,
  bitIndex,
  eventFrameI32,
) {
  let m18 = mask18 >>> 0;
  let m1c = mask1c >>> 0;
  if (exitAnimstate408c90EventFrameEq(stateFrame, eventFrameI32)) {
    m18 = exitAnimstate408c90MaskBts(m18, bitIndex);
    m1c = exitAnimstate408c90MaskBts(m1c, bitIndex);
  }
  return { mask18: m18, mask1c: m1c };
}

/**
 * Pure 0x408c90 body. Events at view[eventBase + i*8].
 * @param {DataView} view
 * @param {number} stateOff
 * @param {number} animOff host anim object offset in view
 */
export function exitAnimstate408c90Apply(view, stateOff, animOff) {
  if (view == null) return;
  const s = stateOff >>> 0;
  const a = animOff >>> 0;
  const frame = view.getFloat32(s + EXIT_ANIMSTATE_FRAME_OFF, true);
  let mask18 = view.getUint32(s + EXIT_ANIMSTATE_MASK18_OFF, true);
  let mask1c = view.getUint32(s + EXIT_ANIMSTATE_MASK1C_OFF, true);
  const eventCount = view.getUint32(a + EXIT_ANIMDATA_EVENT_COUNT_OFF, true);
  const eventBase = view.getUint32(a + EXIT_ANIMDATA_EVENT_BASE_OFF, true);
  for (let i = 0; i < eventCount; i++) {
    const ev = (eventBase + i * EXIT_ANIM_EVENT_STRIDE) >>> 0;
    const bit = view.getInt32(ev + EXIT_ANIM_EVENT_BIT_OFF, true);
    const eframe = view.getInt32(ev + EXIT_ANIM_EVENT_FRAME_OFF, true);
    const next = exitAnimstate408c90EventStep(
      mask18,
      mask1c,
      frame,
      bit,
      eframe,
    );
    mask18 = next.mask18;
    mask1c = next.mask1c;
  }
  view.setUint32(s + EXIT_ANIMSTATE_MASK18_OFF, mask18, true);
  view.setUint32(s + EXIT_ANIMSTATE_MASK1C_OFF, mask1c, true);
}

export function exitAnimstateRewindLayerLoopNeeded(layerCount) {
  return (layerCount >>> 0) !== 0;
}

export function exitAnimstateRewindNullLoopNeeded(nullCount) {
  return (nullCount >>> 0) !== 0;
}

export function exitAnimstateRewindZeroU32N(arr, count) {
  const n = count >>> 0;
  if (arr == null || n === 0) return arr;
  if (arr instanceof Uint32Array) {
    for (let i = 0; i < n && i < arr.length; i++) arr[i] = 0;
    return arr;
  }
  if (typeof arr === "object" && "setUint32" in arr && "base" in arr) {
    for (let i = 0; i < n; i++) arr.setUint32(arr.base + i * 4, 0, true);
  }
  return arr;
}

/**
 * @param {DataView} view
 * @param {number} stateOff
 * @param {number} animOff
 */
export function exitAnimstateRewindZeroArrays(view, stateOff, animOff) {
  if (view == null) return;
  const s = stateOff >>> 0;
  const a = animOff >>> 0;
  const layerCount = view.getUint32(a + EXIT_ANIMDATA_LAYER_COUNT_OFF, true);
  const nullCount = view.getUint32(a + EXIT_ANIMDATA_NULL_COUNT_OFF, true);
  const layerArr = view.getUint32(s + EXIT_ANIMSTATE_LAYER_ARR_OFF, true);
  const nullArr = view.getUint32(s + EXIT_ANIMSTATE_NULL_ARR_OFF, true);
  for (let i = 0; i < layerCount; i++) {
    view.setUint32((layerArr + i * 4) >>> 0, 0, true);
  }
  for (let i = 0; i < nullCount; i++) {
    view.setUint32((nullArr + i * 4) >>> 0, 0, true);
  }
}

/**
 * @returns {{
 *   animPresent: boolean, logNeeded: boolean, eventLoopNeeded: boolean,
 *   layerLoopNeeded: boolean, nullLoopNeeded: boolean,
 *   pureCompleteOk: boolean, animPtr: number, eventCount: number,
 *   layerCount: number, nullCount: number
 * }}
 */
export function exitAnimstateRewindPlan(
  animPtr,
  eventCount,
  layerCount,
  nullCount,
) {
  const present = exitAnimstate408c90AnimPresent(animPtr);
  return {
    animPresent: present,
    logNeeded: exitAnimstate408c90LogNeeded(animPtr),
    eventLoopNeeded: present
      ? exitAnimstate408c90EventLoopNeeded(eventCount)
      : false,
    layerLoopNeeded: present
      ? exitAnimstateRewindLayerLoopNeeded(layerCount)
      : false,
    nullLoopNeeded: present
      ? exitAnimstateRewindNullLoopNeeded(nullCount)
      : false,
    pureCompleteOk: present,
    animPtr: animPtr >>> 0,
    eventCount: present ? eventCount >>> 0 : 0,
    layerCount: present ? layerCount >>> 0 : 0,
    nullCount: present ? nullCount >>> 0 : 0,
  };
}

/**
 * Full pure-complete Rewind over DataView buffers.
 * @param {DataView} view
 * @param {number} stateOff
 * @param {number} animOff
 */
export function exitAnimstateRewindApply(view, stateOff, animOff) {
  if (view == null) return;
  exitAnimstateRewindPrefixApply(view, stateOff);
  exitAnimstate408c90Apply(view, stateOff, animOff);
  exitAnimstateRewindZeroArrays(view, stateOff, animOff);
}

/**
 * Linear-memory pure-complete Rewind. Returns false when anim null
 * (prefix still applied; log residual).
 * @param {DataView} view
 * @param {number} stateOff
 */
export function exitAnimstateRewindApplyAddr(view, stateOff) {
  if (view == null) return false;
  const s = stateOff >>> 0;
  const animPtr = view.getUint32(s + EXIT_ANIMSTATE_ANIM_OFF, true);
  if (animPtr === 0) {
    exitAnimstateRewindPrefixApply(view, s);
    return false;
  }
  exitAnimstateRewindApply(view, s, animPtr);
  return true;
}

/* --- ABI v19: residual MSVC string assign 0x40ccd0 pure CF --- */

export function exit40ccd0MaxSize() {
  return EXIT_40CCD0_MAX_SIZE >>> 0;
}

/** count <= capacity (unsigned). */
export function exit40ccd0FitsCapacity(count, capacity) {
  return (count >>> 0) <= (capacity >>> 0);
}

/** count > MAX → host throw 0x40ccc0. */
export function exit40ccd0LengthErrorNeeded(count) {
  return (count >>> 0) > EXIT_40CCD0_MAX_SIZE;
}

/** Dest data: SSO inline or heap dword0. */
export function exit40ccd0DestDataAddr(strAddr, capacity, dword0) {
  return exitMsvcStringDataAddr(strAddr, capacity, dword0);
}

/** count | 0xf. */
export function exit40ccd0RoundedCapacity(count) {
  return ((count >>> 0) | EXIT_40CCD0_ALIGN_OR) >>> 0;
}

/** (count|0xf) > MAX. */
export function exit40ccd0RoundedOverflow(count) {
  return exit40ccd0RoundedCapacity(count) > EXIT_40CCD0_MAX_SIZE;
}

/** capacity > MAX - (capacity>>1). */
export function exit40ccd0GeoWouldOverflow(capacity) {
  const c = capacity >>> 0;
  const half = c >>> 1;
  const limit = (EXIT_40CCD0_MAX_SIZE - half) >>> 0;
  return c > limit;
}

/** capacity + (capacity>>1). */
export function exit40ccd0GeometricCapacity(capacity) {
  const c = capacity >>> 0;
  return (c + (c >>> 1)) >>> 0;
}

/**
 * PE new_cap select when !length_error.
 * @param {number} capacity old capacity
 * @param {number} count
 */
export function exit40ccd0NewCapacity(capacity, count) {
  const rounded = exit40ccd0RoundedCapacity(count);
  if (rounded > EXIT_40CCD0_MAX_SIZE) return EXIT_40CCD0_MAX_SIZE >>> 0;
  if (exit40ccd0GeoWouldOverflow(capacity)) return EXIT_40CCD0_MAX_SIZE >>> 0;
  const geo = exit40ccd0GeometricCapacity(capacity);
  return rounded < geo ? geo : rounded;
}

/** new_cap + 1 for host 0x40cf00. */
export function exit40ccd0AllocSize(newCapacity) {
  return ((newCapacity >>> 0) + 1) >>> 0;
}

/** old capacity >= 0x10 → free heap buffer. */
export function exit40ccd0OldFreeNeeded(oldCapacity) {
  return (oldCapacity >>> 0) >= EXIT_MSVC_STRING_SSO_CAP;
}

/** old_cap + 1. */
export function exit40ccd0FreeSize(oldCapacity) {
  return ((oldCapacity >>> 0) + 1) >>> 0;
}

export function exit40ccd0FreeUsesHeapHeader(freeSize) {
  return (freeSize >>> 0) >= EXIT_40CCD0_FREE_HEADER_THRESHOLD;
}

export function exit40ccd0FreeHeaderSize(freeSize) {
  return ((freeSize >>> 0) + EXIT_40CCD0_FREE_HEADER_ADD) >>> 0;
}

/** (old_ptr - header - 4) <= 0x1f. */
export function exit40ccd0FreeHeaderOffsetOk(oldPtr, header) {
  const off = (((oldPtr >>> 0) - (header >>> 0)) - 4) >>> 0;
  return off <= EXIT_40CCD0_FREE_HEADER_OFFSET_MAX;
}

/**
 * @param {DataView} view
 * @param {number} sizeOff
 * @param {number} count
 */
export function exit40ccd0StoreSize(view, sizeOff, count) {
  if (view == null) return;
  view.setUint32(sizeOff >>> 0, count >>> 0, true);
}

/**
 * @param {DataView} view
 * @param {number} capOff
 * @param {number} newCap
 */
export function exit40ccd0StoreCapacity(view, capOff, newCap) {
  if (view == null) return;
  view.setUint32(capOff >>> 0, newCap >>> 0, true);
}

/**
 * @param {DataView} view
 * @param {number} dword0Off
 * @param {number} newPtr
 */
export function exit40ccd0StorePtr(view, dword0Off, newPtr) {
  if (view == null) return;
  view.setUint32(dword0Off >>> 0, newPtr >>> 0, true);
}

/**
 * @param {DataView} view
 * @param {number} destOff
 * @param {number} count
 */
export function exit40ccd0NullTerm(view, destOff, count) {
  if (view == null) return;
  view.setUint8(((destOff >>> 0) + (count >>> 0)) >>> 0, 0);
}

/**
 * Pure copy count bytes then null-term.
 * @param {DataView} view
 * @param {number} destOff
 * @param {number} srcOff
 * @param {number} count
 */
export function exit40ccd0CopyAndTerm(view, destOff, srcOff, count) {
  if (view == null) return;
  const n = count >>> 0;
  const d = destOff >>> 0;
  const s = srcOff >>> 0;
  for (let i = 0; i < n; i++) {
    view.setUint8(d + i, view.getUint8(s + i));
  }
  exit40ccd0NullTerm(view, d, n);
}

/**
 * No-grow pure-complete: size store + copy + null-term.
 * @param {DataView} view
 * @param {number} destOff
 * @param {number} sizeOff
 * @param {number} srcOff
 * @param {number} count
 */
export function exit40ccd0NongrowFinish(view, destOff, sizeOff, srcOff, count) {
  if (view == null) return;
  exit40ccd0StoreSize(view, sizeOff, count);
  exit40ccd0CopyAndTerm(view, destOff, srcOff, count);
}

/**
 * Grow pre-copy pure fields: size + capacity.
 * @param {DataView} view
 * @param {number} sizeOff
 * @param {number} capOff
 * @param {number} count
 * @param {number} newCap
 */
export function exit40ccd0GrowPreCopy(view, sizeOff, capOff, count, newCap) {
  if (view == null) return;
  exit40ccd0StoreSize(view, sizeOff, count);
  exit40ccd0StoreCapacity(view, capOff, newCap);
}

/**
 * Grow post-free pure ptr store.
 * @param {DataView} view
 * @param {number} dword0Off
 * @param {number} newPtr
 */
export function exit40ccd0GrowPostFree(view, dword0Off, newPtr) {
  exit40ccd0StorePtr(view, dword0Off, newPtr);
}

/**
 * Combined pure plan (no alloc/copy).
 * @returns {{
 *   count: number, capacity: number, destData: number, newCapacity: number,
 *   allocSize: number, freeSize: number, fits: boolean, lengthError: boolean,
 *   growNeeded: boolean, roundedOverflow: boolean, geoOverflow: boolean,
 *   oldFreeNeeded: boolean, freeUsesHeader: boolean, ssoInline: boolean
 * }}
 */
export function exit40ccd0Plan(strAddr, capacity, dword0, count) {
  const c = count >>> 0;
  const cap = capacity >>> 0;
  const fits = exit40ccd0FitsCapacity(c, cap);
  const lengthError = exit40ccd0LengthErrorNeeded(c);
  const ssoInline = exitMsvcStringSsoInline(cap);
  const growNeeded = !fits && !lengthError;
  let destData = 0;
  let newCapacity = 0;
  let allocSize = 0;
  let freeSize = 0;
  let roundedOverflow = false;
  let geoOverflow = false;
  let oldFreeNeeded = false;
  let freeUsesHeader = false;
  if (fits) {
    destData = exit40ccd0DestDataAddr(strAddr, cap, dword0);
    newCapacity = cap;
  } else if (!lengthError) {
    roundedOverflow = exit40ccd0RoundedOverflow(c);
    if (!roundedOverflow) {
      geoOverflow = exit40ccd0GeoWouldOverflow(cap);
    }
    newCapacity = exit40ccd0NewCapacity(cap, c);
    allocSize = exit40ccd0AllocSize(newCapacity);
    oldFreeNeeded = exit40ccd0OldFreeNeeded(cap);
    if (oldFreeNeeded) {
      freeSize = exit40ccd0FreeSize(cap);
      freeUsesHeader = exit40ccd0FreeUsesHeapHeader(freeSize);
    }
  }
  return {
    count: c,
    capacity: cap,
    destData: destData >>> 0,
    newCapacity: newCapacity >>> 0,
    allocSize: allocSize >>> 0,
    freeSize: freeSize >>> 0,
    fits,
    lengthError,
    growNeeded,
    roundedOverflow,
    geoOverflow,
    oldFreeNeeded,
    freeUsesHeader,
    ssoInline,
  };
}

/* --- ABI v20: residual keep-set host 0x00408970 pure CF --- */

/** Null-safe count: obj==0 → 0; else host-loaded count. */
export function exit408970CountSelect(objAddr, loadedCount) {
  if ((objAddr >>> 0) === 0) return 0;
  return loadedCount >>> 0;
}

export function exit408970CountsEqual(oldCount, newCount) {
  return (oldCount >>> 0) === (newCount >>> 0);
}

export function exit408970CountsDiffer(oldCount, newCount) {
  return (oldCount >>> 0) !== (newCount >>> 0);
}

/** Signed new-count > 0 (PE jg). */
export function exit408970NewCountPositive(newCount) {
  return (newCount | 0) > 0;
}

/** Signed old-count > 0 (PE !jle → copy). */
export function exit408970CopyNeeded(oldCount) {
  return (oldCount | 0) > 0;
}

export function exit408970PtrNonzero(ptr) {
  return (ptr >>> 0) !== 0;
}

/** count*4 with seto overflow → 0xffffffff. */
export function exit408970AllocSize(count) {
  const c = count >>> 0;
  const prod = c * EXIT_408970_ELEM_SIZE;
  if (prod > 0xffffffff) return 0xffffffff;
  return prod >>> 0;
}

/** lea [count*4] / wrap u32. */
export function exit408970FillSize(count) {
  return ((count >>> 0) * EXIT_408970_ELEM_SIZE) >>> 0;
}

/** old_count << 2. */
export function exit408970CopySize(oldCount) {
  return ((oldCount >>> 0) << 2) >>> 0;
}

export function exit408970FillByte() {
  return EXIT_408970_FILL_BYTE & 0xff;
}

/** global!=0 → global+0x30 else 0xc7f618. */
export function exit408970HeapStatsBase(heapStatsGlobal) {
  const g = heapStatsGlobal >>> 0;
  if (g !== 0) return (g + EXIT_408970_HEAP_STATS_DELTA) >>> 0;
  return EXIT_408970_HEAP_STATS_FALLBACK >>> 0;
}

/** buf_ptr - 4. */
export function exit408970FreeBlockPtr(bufPtr) {
  return ((bufPtr >>> 0) - 4) >>> 0;
}

export function exit408970StoreArg(arg) {
  return arg >>> 0;
}

/**
 * @param {DataView} view
 * @param {number} thisOff
 * @param {number} arg
 */
export function exit408970StoreArgApply(view, thisOff, arg) {
  if ((thisOff >>> 0) === 0) return;
  storeU32View(view, (thisOff >>> 0) + EXIT_408970_FIELD_4_OFF, arg >>> 0);
}

/**
 * @param {DataView} view
 * @param {number} thisOff
 * @param {number} ptr
 */
export function exit408970StoreBufAApply(view, thisOff, ptr) {
  if ((thisOff >>> 0) === 0) return;
  storeU32View(view, (thisOff >>> 0) + EXIT_408970_FIELD_8_OFF, ptr >>> 0);
}

/**
 * @param {DataView} view
 * @param {number} thisOff
 * @param {number} ptr
 */
export function exit408970StoreBufBApply(view, thisOff, ptr) {
  if ((thisOff >>> 0) === 0) return;
  storeU32View(view, (thisOff >>> 0) + EXIT_408970_FIELD_C_OFF, ptr >>> 0);
}

/**
 * @param {DataView} view
 * @param {number} thisOff
 */
export function exit408970ClearBufAApply(view, thisOff) {
  exit408970StoreBufAApply(view, thisOff, 0);
}

/**
 * @param {DataView} view
 * @param {number} thisOff
 */
export function exit408970ClearBufBApply(view, thisOff) {
  exit408970StoreBufBApply(view, thisOff, 0);
}

export function exit408970PtrClear() {
  return 0;
}

/**
 * One buffer pure plan.
 * @returns {{
 *   oldCount: number, newCount: number, allocSize: number, fillSize: number,
 *   copySize: number, freeBlockPtr: number, countsDiffer: boolean,
 *   newPositive: boolean, freeNonpositive: boolean, a648b0FreeNeeded: boolean,
 *   reallocNeeded: boolean, copyNeeded: boolean, heapFreeNeeded: boolean
 * }}
 */
export function exit408970BufferPlan(oldCount, newCount, oldBufPtr) {
  const oc = oldCount >>> 0;
  const nc = newCount >>> 0;
  const buf = oldBufPtr >>> 0;
  const countsDiffer = exit408970CountsDiffer(oc, nc);
  const newPositive = exit408970NewCountPositive(nc);
  const freeNonpositive = countsDiffer && !newPositive;
  const reallocNeeded = countsDiffer && newPositive;
  const copyNeeded = reallocNeeded && exit408970CopyNeeded(oc);
  const heapFreeNeeded = reallocNeeded && exit408970PtrNonzero(buf);
  const a648b0FreeNeeded = freeNonpositive && exit408970PtrNonzero(buf);
  return {
    oldCount: oc,
    newCount: nc,
    allocSize: reallocNeeded ? exit408970AllocSize(nc) : 0,
    fillSize: reallocNeeded ? exit408970FillSize(nc) : 0,
    copySize: copyNeeded ? exit408970CopySize(oc) : 0,
    freeBlockPtr: heapFreeNeeded ? exit408970FreeBlockPtr(buf) : 0,
    countsDiffer,
    newPositive,
    freeNonpositive,
    a648b0FreeNeeded,
    reallocNeeded,
    copyNeeded,
    heapFreeNeeded,
  };
}

/**
 * Combined pure plan (no alloc/free/copy bodies).
 * @returns {object}
 */
export function exit408970Plan(
  oldCountA,
  newCountA,
  oldCountB,
  newCountB,
  bufAPtr,
  bufBPtr,
  newArgAddr,
) {
  const a = exit408970BufferPlan(oldCountA, newCountA, bufAPtr);
  const b = exit408970BufferPlan(oldCountB, newCountB, bufBPtr);
  return {
    oldCountA: oldCountA >>> 0,
    newCountA: newCountA >>> 0,
    oldCountB: oldCountB >>> 0,
    newCountB: newCountB >>> 0,
    terminalArg: newArgAddr >>> 0,
    aAllocSize: a.allocSize,
    aFillSize: a.fillSize,
    aCopySize: a.copySize,
    aFreeBlockPtr: a.freeBlockPtr,
    aCountsDiffer: a.countsDiffer,
    aNewPositive: a.newPositive,
    aFreeNonpositive: a.freeNonpositive,
    aA648b0FreeNeeded: a.a648b0FreeNeeded,
    aReallocNeeded: a.reallocNeeded,
    aCopyNeeded: a.copyNeeded,
    aHeapFreeNeeded: a.heapFreeNeeded,
    bAllocSize: b.allocSize,
    bFillSize: b.fillSize,
    bCopySize: b.copySize,
    bFreeBlockPtr: b.freeBlockPtr,
    bCountsDiffer: b.countsDiffer,
    bNewPositive: b.newPositive,
    bFreeNonpositive: b.freeNonpositive,
    bA648b0FreeNeeded: b.a648b0FreeNeeded,
    bReallocNeeded: b.reallocNeeded,
    bCopyNeeded: b.copyNeeded,
    bHeapFreeNeeded: b.heapFreeNeeded,
    bStoreNewAtASlot: b.reallocNeeded,
  };
}

/* --- ABI v21: residual Load nested host 0x0040db90 pure CF --- */

/** Path size@+0x10 != 0. */
export function exit40db90PathSizePresent(pathSize10) {
  return (pathSize10 >>> 0) !== 0;
}

export function exit40db90EarlyReturn(pathSize10) {
  return (pathSize10 >>> 0) === 0;
}

/**
 * High 64 bits of 64×64 unsigned mul (PE limb order @ 0x40dbfa–0x40dc8e).
 * @param {bigint} a
 * @param {bigint} b
 * @returns {bigint}
 */
function mulhu64(a, b) {
  const mask = 0xffffffffn;
  const a0 = a & mask;
  const a1 = a >> 32n;
  const b0 = b & mask;
  const b1 = b >> 32n;
  const pLl = a0 * b0;
  const pLh = a0 * b1;
  const pHl = a1 * b0;
  const pHh = a1 * b1;

  const pLlHi = (pLl >> 32n) & mask;
  const pLhLo = pLh & mask;
  const pLhHi = (pLh >> 32n) & mask;
  const pHlLo = pHl & mask;
  const pHlHi = (pHl >> 32n) & mask;
  const pHhLo = pHh & mask;
  const pHhHi = (pHh >> 32n) & mask;

  let ecx = (pHlLo + pLlHi) & mask;
  const cf1 = pHlLo + pLlHi > mask ? 1n : 0n;
  let edx = (pHlHi + cf1) & mask;
  const edi = (pLhLo + ecx) & mask;
  const cf2 = pLhLo + ecx > mask ? 1n : 0n;
  ecx = (pLhHi + cf2) & mask;
  void edi;
  const sum = (edx + ecx) & mask;
  const cf3 = edx + ecx > mask ? 1n : 0n;
  let esi = (pHhLo + sum) & mask;
  const cf4 = pHhLo + sum > mask ? 1n : 0n;
  ecx = (pHhHi + cf3 + cf4) & mask;
  return (ecx << 32n) | esi;
}

/**
 * QPC host pair → high64(qpc * magic) >> 18.
 * @returns {{ lo: number, hi: number }}
 */
export function exit40db90TimingScale(qpcLo, qpcHi) {
  const qpc = (BigInt(qpcHi >>> 0) << 32n) | BigInt(qpcLo >>> 0);
  const magic =
    (BigInt(EXIT_40DB90_TIMING_MUL_HI >>> 0) << 32n) |
    BigInt(EXIT_40DB90_TIMING_MUL_LO >>> 0);
  const hi = mulhu64(qpc, magic);
  const scaled = hi >> BigInt(EXIT_40DB90_TIMING_SHIFT);
  return {
    lo: Number(scaled & 0xffffffffn) >>> 0,
    hi: Number((scaled >> 32n) & 0xffffffffn) >>> 0,
  };
}

/**
 * 64-bit end - start.
 * @returns {{ lo: number, hi: number }}
 */
export function exit40db90TimingDelta(endLo, endHi, startLo, startHi) {
  const end = (BigInt(endHi >>> 0) << 32n) | BigInt(endLo >>> 0);
  const start = (BigInt(startHi >>> 0) << 32n) | BigInt(startLo >>> 0);
  const d = (end - start) & 0xffffffffffffffffn;
  return {
    lo: Number(d & 0xffffffffn) >>> 0,
    hi: Number((d >> 32n) & 0xffffffffn) >>> 0,
  };
}

export function exit40db90CacheSpaceOk(begin, end) {
  return ((end >>> 0) - (begin >>> 0)) >>> 0 >= EXIT_40DB90_CACHE_MIN_SPACE;
}

export function exit40db90CacheWalkDone(walk, end) {
  return (walk >>> 0) === (end >>> 0);
}

export function exit40db90CacheWalkNext(walk) {
  return ((walk >>> 0) + EXIT_40DB90_CACHE_PTR_STRIDE) >>> 0;
}

/** !isnil && key >= nodeKey → node else sentinel. */
export function exit40db90TreeHitSelect(
  nodeAddr,
  isnilByte,
  nodeKey,
  key,
  sentinelAddr,
) {
  if ((isnilByte & 0xff) !== 0) return sentinelAddr >>> 0;
  if ((key >>> 0) < (nodeKey >>> 0)) return sentinelAddr >>> 0;
  return nodeAddr >>> 0;
}

export function exit40db90NodeIsSentinel(nodeAddr, sentinelAddr) {
  return (nodeAddr >>> 0) === (sentinelAddr >>> 0);
}

export function exit40db90CacheMiss(nodeAddr, sentinelAddr) {
  return exit40db90NodeIsSentinel(nodeAddr, sentinelAddr);
}

export function exit40db90InsertNeeded(nodeAddr, sentinelAddr, flag14, filePtr) {
  if ((nodeAddr >>> 0) === (sentinelAddr >>> 0)) return true;
  if ((flag14 & 0xff) === 0) return false;
  if ((filePtr >>> 0) === 0) return false;
  return true;
}

export function exit40db90HeapStatsBase(heapStatsGlobal) {
  const g = heapStatsGlobal >>> 0;
  if (g !== 0) return (g + EXIT_40DB90_HEAP_STATS_DELTA) >>> 0;
  return EXIT_40DB90_HEAP_STATS_FALLBACK >>> 0;
}

export function exit40db90TempFreeNeeded(ptr) {
  return (ptr >>> 0) !== 0;
}

export function exit40db90FreeBlockPtr(bufPtr) {
  return ((bufPtr >>> 0) - 4) >>> 0;
}

export function exit40db90LayerArrayPresent(layerBasePtr) {
  return (layerBasePtr >>> 0) !== 0;
}

/** count*0xa0 + 4 wrap. */
export function exit40db90OldLayerFreeSize(headerCount) {
  return (
    ((headerCount >>> 0) * EXIT_40DB90_LAYER_STRIDE + EXIT_40DB90_HEADER_SIZE) >>>
    0
  );
}

export function exit40db90LayerCountNonzero(count) {
  return (count >>> 0) !== 0;
}

/** count*0xa0 (OF→-1) then +4 (CF→-1). */
export function exit40db90LayerAllocSize(count) {
  const c = count >>> 0;
  const prod = c * EXIT_40DB90_LAYER_STRIDE;
  let s = prod > 0xffffffff ? 0xffffffff : prod >>> 0;
  const sum = (s + EXIT_40DB90_HEADER_SIZE) >>> 0;
  if (sum < s) return 0xffffffff;
  return sum >>> 0;
}

export function exit40db90AllocOk(rawPtr) {
  return (rawPtr >>> 0) !== 0;
}

export function exit40db90UserPtrAfterHeader(rawPtr) {
  return ((rawPtr >>> 0) + EXIT_40DB90_HEADER_SIZE) >>> 0;
}

export function exit40db90LayerLoopNeeded(index, count) {
  return (index >>> 0) < (count >>> 0);
}

export function exit40db90SrcLayerStride() {
  return EXIT_40DB90_SRC_LAYER_STRIDE;
}

export function exit40db90DstLayerStride() {
  return EXIT_40DB90_LAYER_STRIDE;
}

export function exit40db90SrcLayerPtr(srcBase, index) {
  return ((srcBase >>> 0) + (index >>> 0) * EXIT_40DB90_SRC_LAYER_STRIDE) >>> 0;
}

export function exit40db90DstLayerPtr(dstBase, index) {
  return ((dstBase >>> 0) + (index >>> 0) * EXIT_40DB90_LAYER_STRIDE) >>> 0;
}

/**
 * @param {DataView} view
 * @param {number} dstLayerOff
 * @param {number} anm2Addr
 */
export function exit40db90StoreLayerBackptrAt(view, dstLayerOff, anm2Addr) {
  if ((dstLayerOff >>> 0) === 0) return;
  storeU32View(
    view,
    (dstLayerOff >>> 0) + EXIT_40DB90_LAYER_BACKPTR_OFF,
    anm2Addr >>> 0,
  );
}

export function exit40db90NameAssignNeeded(anm2NameAddr, nodeNameAddr) {
  return (anm2NameAddr >>> 0) !== (nodeNameAddr >>> 0);
}

/**
 * @returns {{
 *   layerCount: number, field74: number, field78: number, field84: number,
 *   field88: number, field8c: number, field90: number
 * }}
 */
export function exit40db90FieldPack(layerCount, f20, f24, f28, f2c, f30, f34) {
  return {
    layerCount: layerCount >>> 0,
    field74: f20 >>> 0,
    field78: f24 >>> 0,
    field84: f28 >>> 0,
    field88: f2c >>> 0,
    field8c: f30 >>> 0,
    field90: f34 >>> 0,
  };
}

/**
 * @param {DataView} view
 * @param {number} anm2Off
 * @param {ReturnType<typeof exit40db90FieldPack>} pack
 */
export function exit40db90FieldPackApply(view, anm2Off, pack) {
  if ((anm2Off >>> 0) === 0 || !pack) return;
  const base = anm2Off >>> 0;
  storeU32View(view, base + EXIT_40DB90_ANM2_LAYER_COUNT_OFF, pack.layerCount);
  storeU32View(view, base + EXIT_40DB90_ANM2_FIELD74_OFF, pack.field74);
  storeU32View(view, base + EXIT_40DB90_ANM2_FIELD78_OFF, pack.field78);
  storeU32View(view, base + EXIT_40DB90_ANM2_FIELD84_OFF, pack.field84);
  storeU32View(view, base + EXIT_40DB90_ANM2_FIELD88_OFF, pack.field88);
  storeU32View(view, base + EXIT_40DB90_ANM2_FIELD8C_OFF, pack.field8c);
  storeU32View(view, base + EXIT_40DB90_ANM2_FIELD90_OFF, pack.field90);
}

/**
 * Combined pure plan (no host bodies).
 * @returns {object}
 */
export function exit40db90Plan(
  pathSize,
  qpcLo,
  qpcHi,
  cacheBegin,
  cacheEnd,
  nodeAddr,
  isnilByte,
  nodeKey,
  key,
  sentinelAddr,
  flag14,
  filePtr,
  layerBasePtr,
  layerCount,
  headerCount,
  anm2NameAddr,
  nodeNameAddr,
) {
  const timing = exit40db90TimingScale(qpcLo, qpcHi);
  const selected = exit40db90TreeHitSelect(
    nodeAddr,
    isnilByte,
    nodeKey,
    key,
    sentinelAddr,
  );
  const pathPresent = exit40db90PathSizePresent(pathSize);
  const earlyReturn = exit40db90EarlyReturn(pathSize);
  const cacheSpaceOk = exit40db90CacheSpaceOk(cacheBegin, cacheEnd);
  const cacheWalkDone = exit40db90CacheWalkDone(cacheBegin, cacheEnd);
  const cacheMiss = exit40db90CacheMiss(selected, sentinelAddr);
  const insertNeeded = exit40db90InsertNeeded(
    selected,
    sentinelAddr,
    flag14,
    filePtr,
  );
  const tempFreeNeeded = exit40db90TempFreeNeeded(filePtr);
  const layerArrayPresent = exit40db90LayerArrayPresent(layerBasePtr);
  const layerCountNonzero = exit40db90LayerCountNonzero(layerCount);
  const nameAssignNeeded = !cacheMiss
    ? exit40db90NameAssignNeeded(anm2NameAddr, nodeNameAddr)
    : false;
  return {
    pathSize: pathSize >>> 0,
    timingLo: timing.lo,
    timingHi: timing.hi,
    cacheBegin: cacheBegin >>> 0,
    cacheEnd: cacheEnd >>> 0,
    nodeAddr: selected >>> 0,
    sentinelAddr: sentinelAddr >>> 0,
    layerBasePtr: layerBasePtr >>> 0,
    layerCount: layerCount >>> 0,
    layerAllocSize: layerCountNonzero
      ? exit40db90LayerAllocSize(layerCount)
      : 0,
    oldFreeSize: layerArrayPresent
      ? exit40db90OldLayerFreeSize(headerCount)
      : 0,
    freeBlockPtr: tempFreeNeeded ? exit40db90FreeBlockPtr(filePtr) : 0,
    pathPresent,
    earlyReturn,
    cacheSpaceOk,
    cacheWalkDone,
    cacheMiss,
    insertNeeded,
    tempFreeNeeded,
    layerArrayPresent,
    layerCountNonzero,
    layerLoopNeeded: layerCountNonzero,
    nameAssignNeeded,
  };
}

/* --- ABI v22: residual Load sibling host 0x0040e110 pure CF --- */

/** PE test (end-begin), 0xfffffffc; jne skip grow. */
export function exit40e110CacheSpaceOk(begin, end) {
  const size = ((end >>> 0) - (begin >>> 0)) >>> 0;
  return (size & EXIT_40E110_CACHE_SPACE_MASK) !== 0;
}

export function exit40e110CacheWalkDone(walk, end) {
  return (walk >>> 0) === (end >>> 0);
}

export function exit40e110CacheWalkNext(walk) {
  return ((walk >>> 0) + EXIT_40E110_CACHE_PTR_STRIDE) >>> 0;
}

/** Path SSO data select (same as MSVC string data addr). */
export function exit40e110PathDataAddr(strAddr, capacity, dword0) {
  return exitMsvcStringDataAddr(strAddr, capacity, dword0);
}

export function exit40e110PathBufSize() {
  return EXIT_40E110_PATH_BUF_SIZE;
}

/** !isnil && key >= nodeKey → node else sentinel. */
export function exit40e110TreeHitSelect(
  nodeAddr,
  isnilByte,
  nodeKey,
  key,
  sentinelAddr,
) {
  if ((isnilByte & 0xff) !== 0) return sentinelAddr >>> 0;
  if ((key >>> 0) < (nodeKey >>> 0)) return sentinelAddr >>> 0;
  return nodeAddr >>> 0;
}

export function exit40e110NodeIsSentinel(nodeAddr, sentinelAddr) {
  return (nodeAddr >>> 0) === (sentinelAddr >>> 0);
}

export function exit40e110CacheHit(nodeAddr, sentinelAddr) {
  return (nodeAddr >>> 0) !== (sentinelAddr >>> 0);
}

export function exit40e110CacheMiss(nodeAddr, sentinelAddr) {
  return exit40e110NodeIsSentinel(nodeAddr, sentinelAddr);
}

export function exit40e110LogNeeded(nodeAddr, sentinelAddr) {
  return exit40e110CacheMiss(nodeAddr, sentinelAddr);
}

/** prior+1 wrap. */
export function exit40e110RefcountInc(prior) {
  return ((prior >>> 0) + 1) >>> 0;
}

/**
 * @param {DataView} view
 * @param {number} nodeOff
 */
export function exit40e110RefcountIncApply(view, nodeOff) {
  if ((nodeOff >>> 0) === 0) return;
  const off = (nodeOff >>> 0) + EXIT_40E110_NODE_REFCOUNT_OFF;
  const prior = loadU32View(view, off);
  storeU32View(view, off, exit40e110RefcountInc(prior));
}

/** grow_result != DAT_00c798b8 → install triple into globals. */
export function exit40e110GrowInstallNeeded(growResult) {
  return (growResult >>> 0) !== (EXIT_40E110_CACHE_BEGIN_ADDR >>> 0);
}

/**
 * Zero three dwords at grow result after global install.
 * @param {DataView} view
 * @param {number} growOff
 */
export function exit40e110GrowResultClearAt(view, growOff) {
  if ((growOff >>> 0) === 0) return;
  const base = growOff >>> 0;
  storeU32View(view, base, 0);
  storeU32View(view, base + 4, 0);
  storeU32View(view, base + 8, 0);
}

/**
 * Combined pure plan (no host bodies).
 * @returns {object}
 */
export function exit40e110Plan(
  cacheBegin,
  cacheEnd,
  nodeAddr,
  isnilByte,
  nodeKey,
  key,
  sentinelAddr,
  pathStrAddr,
  pathCapacity,
  pathDword0,
  growResult,
  refcountPrior,
) {
  const selected = exit40e110TreeHitSelect(
    nodeAddr,
    isnilByte,
    nodeKey,
    key,
    sentinelAddr,
  );
  const cacheSpaceOk = exit40e110CacheSpaceOk(cacheBegin, cacheEnd);
  const cacheWalkDone = exit40e110CacheWalkDone(cacheBegin, cacheEnd);
  const cacheHit = exit40e110CacheHit(selected, sentinelAddr);
  const cacheMiss = exit40e110CacheMiss(selected, sentinelAddr);
  const growInstallNeeded = exit40e110GrowInstallNeeded(growResult);
  return {
    cacheBegin: cacheBegin >>> 0,
    cacheEnd: cacheEnd >>> 0,
    nodeAddr: selected >>> 0,
    sentinelAddr: sentinelAddr >>> 0,
    pathDataAddr: exit40e110PathDataAddr(pathStrAddr, pathCapacity, pathDword0),
    pathBufSize: exit40e110PathBufSize(),
    refcountNext: cacheHit ? exit40e110RefcountInc(refcountPrior) : 0,
    cacheSpaceOk,
    cacheWalkDone,
    growInstallNeeded,
    cacheHit,
    cacheMiss,
    logNeeded: cacheMiss,
    refcountIncNeeded: cacheHit,
  };
}

/* --- ABI v23: residual ANM2 graphics walk host 0x0040c000 pure CF --- */

export function exit40c000LayerCountNonzero(count) {
  return (count >>> 0) !== 0;
}

export function exit40c000LoopNeeded(index, count) {
  return (index >>> 0) < (count >>> 0);
}

export function exit40c000LayerStride() {
  return EXIT_40C000_LAYER_STRIDE;
}

export function exit40c000LayerByteOff(index) {
  return ((index >>> 0) * EXIT_40C000_LAYER_STRIDE) >>> 0;
}

export function exit40c000LayerPtr(layerBase, index) {
  return ((layerBase >>> 0) + exit40c000LayerByteOff(index)) >>> 0;
}

export function exit40c000LayerSkip(flag30) {
  return (flag30 & 0xff) !== 0;
}

export function exit40c000LayerBodyNeeded(flag30) {
  return (flag30 & 0xff) === 0;
}

export function exit40c000PngStrPtr(layerPtr) {
  return ((layerPtr >>> 0) + EXIT_40C000_LAYER_PNG_STR_OFF) >>> 0;
}

export function exit40c000PathDataAddr(strAddr, capacity, dword0) {
  return exitMsvcStringDataAddr(strAddr, capacity, dword0);
}

export function exit40c000SharedPresent(sharedPtr) {
  return (sharedPtr >>> 0) !== 0;
}

export function exit40c000VirtualOk(virtualAl) {
  return (virtualAl & 0xff) !== 0;
}

/** Graphics flag byte: shared non-null && virtual AL → 1 else 0. */
export function exit40c000GraphicsFlag(sharedPtr, virtualAl) {
  if ((sharedPtr >>> 0) === 0) return 0;
  if ((virtualAl & 0xff) === 0) return 0;
  return 1;
}

export function exit40c000SpritePresent(spritePtr) {
  return (spritePtr >>> 0) !== 0;
}

export function exit40c000ObjectPresent(objPtr) {
  return (objPtr >>> 0) !== 0;
}

export function exit40c000CallbackNeeded(virtualAl, globalFn) {
  return (virtualAl & 0xff) !== 0 && (globalFn >>> 0) !== 0;
}

/**
 * @param {DataView} view
 * @param {number} pairOff
 */
export function exit40c000PairZeroAt(view, pairOff) {
  if ((pairOff >>> 0) === 0) return;
  const base = pairOff >>> 0;
  storeU32View(view, base, 0);
  storeU32View(view, base + 4, 0);
}

/**
 * @param {DataView} view
 * @param {number} pairOff
 * @param {number} value
 * @param {number} ctrl
 */
export function exit40c000PairAssignAt(view, pairOff, value, ctrl) {
  if ((pairOff >>> 0) === 0) return;
  const base = pairOff >>> 0;
  storeU32View(view, base, value >>> 0);
  storeU32View(view, base + 4, ctrl >>> 0);
}

/**
 * Pure flag stores: [layer+0x30]=flag; [layer+0x31]=0.
 * @param {DataView} view
 * @param {number} layerOff
 * @param {number} flag
 */
export function exit40c000StoreLayerFlagsAt(view, layerOff, flag) {
  if ((layerOff >>> 0) === 0) return;
  const base = layerOff >>> 0;
  view.setUint8(base + EXIT_40C000_LAYER_FLAG30_OFF, flag & 0xff);
  view.setUint8(base + EXIT_40C000_LAYER_FLAG31_OFF, 0);
}

export function exit40c000LoopNextIndex(index) {
  return ((index >>> 0) + 1) >>> 0;
}

export function exit40c000LoopNextOff(byteOff) {
  return ((byteOff >>> 0) + EXIT_40C000_LAYER_STRIDE) >>> 0;
}

/**
 * Pure-complete freestanding 0x0040c1e0.
 * @returns {{ field0: number, field4: number, field8: number, fieldC: number }}
 */
export function exit40c1e0Init() {
  return {
    field0: EXIT_40C1E0_FIELD0_VALUE >>> 0,
    field4: 0,
    field8: 0,
    fieldC: EXIT_40C1E0_FIELD_C_VALUE & 0xff,
  };
}

/**
 * @param {DataView} view
 * @param {number} objOff
 */
export function exit40c1e0Apply(view, objOff) {
  if ((objOff >>> 0) === 0) return;
  const base = objOff >>> 0;
  storeU32View(view, base, EXIT_40C1E0_FIELD0_VALUE);
  storeU32View(view, base + 4, 0);
  storeU32View(view, base + 8, 0);
  view.setUint8(base + 0xc, EXIT_40C1E0_FIELD_C_VALUE & 0xff);
}

/**
 * Combined pure plan for one layer step (no host bodies).
 * @returns {object}
 */
export function exit40c000Plan(
  layerCount,
  layerBasePtr,
  index,
  flag30,
  pathCapacity,
  pathDword0,
  sharedPtr,
  sharedVirtualAl,
  spritePtr,
  callbackVirtualAl,
  callbackGlobalFn,
) {
  const layerPtr = exit40c000LayerPtr(layerBasePtr, index);
  const pngStrPtr = exit40c000PngStrPtr(layerPtr);
  const countNonzero = exit40c000LayerCountNonzero(layerCount);
  const loopNeeded = exit40c000LoopNeeded(index, layerCount);
  const layerSkip = exit40c000LayerSkip(flag30);
  const layerBodyNeeded = exit40c000LayerBodyNeeded(flag30);
  const sharedPresent = exit40c000SharedPresent(sharedPtr);
  const virtualOk = exit40c000VirtualOk(sharedVirtualAl);
  const graphicsFlag = exit40c000GraphicsFlag(sharedPtr, sharedVirtualAl);
  const spritePresent = exit40c000SpritePresent(spritePtr);
  const callbackNeeded = exit40c000CallbackNeeded(
    callbackVirtualAl,
    callbackGlobalFn,
  );
  return {
    layerCount: layerCount >>> 0,
    layerBasePtr: layerBasePtr >>> 0,
    index: index >>> 0,
    layerPtr: layerPtr >>> 0,
    layerByteOff: exit40c000LayerByteOff(index),
    pngStrPtr: pngStrPtr >>> 0,
    pathDataAddr: exit40c000PathDataAddr(pngStrPtr, pathCapacity, pathDword0),
    graphicsFlag: graphicsFlag >>> 0,
    countNonzero,
    loopNeeded,
    layerSkip,
    layerBodyNeeded,
    sharedPresent,
    virtualOk,
    spritePresent,
    storeFlagsNeeded: layerBodyNeeded,
    callbackNeeded,
  };
}

/* --- ABI v24: residual layer-attach host 0x00408640 pure CF --- */

export function exit408640SourcePresent(srcPtr) {
  return (srcPtr >>> 0) !== 0;
}

export function exit408640CtrlPresent(ctrlPtr) {
  return (ctrlPtr >>> 0) !== 0;
}

export function exit408640VirtualOk(virtualAl) {
  return (virtualAl & 0xff) !== 0;
}

export function exit408640CallbackNeeded(virtualAl, globalFn) {
  return (virtualAl & 0xff) !== 0 && (globalFn >>> 0) !== 0;
}

export function exit408640DstFieldPtr(layerPtr) {
  return ((layerPtr >>> 0) + EXIT_408640_DST_FIELD_OFF) >>> 0;
}

export function exit408640SrcFieldPtr(srcPtr) {
  return ((srcPtr >>> 0) + EXIT_408640_SRC_FIELD_OFF) >>> 0;
}

export function exit408640PairSlotPtr(layerPtr) {
  return ((layerPtr >>> 0) + EXIT_408640_PAIR_SLOT_OFF) >>> 0;
}

export function exit408640DstFieldOff() {
  return EXIT_408640_DST_FIELD_OFF;
}

export function exit408640SrcFieldOff() {
  return EXIT_408640_SRC_FIELD_OFF;
}

export function exit408640PairSlotOff() {
  return EXIT_408640_PAIR_SLOT_OFF;
}

export function exit408640FieldDwords() {
  return EXIT_408640_FIELD_DWORDS;
}

/**
 * Pure 4-dword pack: [layer+0x20..0x2c] ← [src+0x30..0x3c].
 * @param {DataView} view
 * @param {number} layerOff
 * @param {number} srcOff object base (not field base)
 */
export function exit408640FieldCopyAt(view, layerOff, srcOff) {
  if ((layerOff >>> 0) === 0 || (srcOff >>> 0) === 0) return;
  const dst = ((layerOff >>> 0) + EXIT_408640_DST_FIELD_OFF) >>> 0;
  const src = ((srcOff >>> 0) + EXIT_408640_SRC_FIELD_OFF) >>> 0;
  for (let i = 0; i < EXIT_408640_FIELD_DWORDS; i++) {
    storeU32View(view, dst + i * 4, view.getUint32(src + i * 4, true));
  }
}

/**
 * Gate + copy: only when src non-null (PE test edx; je skip).
 * @param {DataView} view
 * @param {number} layerOff
 * @param {number} srcOff 0 skips
 */
export function exit408640FieldCopyIfPresentAt(view, layerOff, srcOff) {
  if ((srcOff >>> 0) === 0) return;
  exit408640FieldCopyAt(view, layerOff, srcOff);
}

/**
 * Combined pure plan for layer-attach (no host bodies).
 * @returns {object}
 */
export function exit408640Plan(
  layerPtr,
  srcPtr,
  ctrlPtr,
  virtualAl,
  callbackGlobalFn,
) {
  const sourcePresent = exit408640SourcePresent(srcPtr);
  const ctrlPresent = exit408640CtrlPresent(ctrlPtr);
  const virtualOk = exit408640VirtualOk(virtualAl);
  const callbackNeeded = exit408640CallbackNeeded(
    virtualAl,
    callbackGlobalFn,
  );
  return {
    layerPtr: layerPtr >>> 0,
    srcPtr: srcPtr >>> 0,
    ctrlPtr: ctrlPtr >>> 0,
    dstFieldPtr: exit408640DstFieldPtr(layerPtr),
    srcFieldPtr: sourcePresent ? exit408640SrcFieldPtr(srcPtr) : 0,
    pairSlotPtr: exit408640PairSlotPtr(layerPtr),
    sourcePresent,
    fieldCopyNeeded: sourcePresent,
    ctrlPresent,
    virtualOk,
    callbackNeeded,
    pairSwapHostNeeded: true, // PE always calls 0x40c3b0
  };
}

/* --- ABI v25: per-slot HUD residual 0x00841cf0 pure islands / CF --- */

/** This-relative offset of P0 element `index`, 0xffffffff out of range. */
export function exit841cf0P0ElemOff(index) {
  const i = index >>> 0;
  if (i >= EXIT_841CF0_P0_COUNT) return 0xffffffff;
  return (EXIT_841CF0_P0_BASE_OFF + i * EXIT_841CF0_P0_STRIDE) >>> 0;
}

/**
 * One P0 element in PE store order.
 * @param {DataView} view
 * @param {number} elemOff absolute element offset in the view
 */
export function exit841cf0P0Elem(view, elemOff) {
  const e = elemOff >>> 0;
  view.setUint32(e + EXIT_841CF0_P0_VALUE_OFF, 0, true);
  view.setUint32(e + EXIT_841CF0_P0_PTR_A_OFF, EXIT_841CF0_P0_PTR_VALUE, true);
  view.setUint32(e + EXIT_841CF0_P0_PTR_B_OFF, EXIT_841CF0_P0_PTR_VALUE, true);
  view.setUint8(e + EXIT_841CF0_P0_FLAG_OFF, 0);
}

/** All 0x18 P0 elements over the residual `this` image. */
export function exit841cf0P0Apply(view, thisOff) {
  const base = thisOff >>> 0;
  for (let i = 0; i < EXIT_841CF0_P0_COUNT; i++) {
    exit841cf0P0Elem(view, (base + exit841cf0P0ElemOff(i)) >>> 0);
  }
  return { thisOff: base, count: EXIT_841CF0_P0_COUNT };
}

/** Head zero bytes +0xa..+0xe (unaligned dword store then byte store). */
export function exit841cf0HeadClear(view, thisOff) {
  const base = thisOff >>> 0;
  for (let i = 0; i < EXIT_841CF0_HEAD_ZERO_BYTES; i++) {
    view.setUint8((base + EXIT_841CF0_HEAD_DWORD_OFF + i) >>> 0, 0);
  }
  return {
    first: EXIT_841CF0_HEAD_DWORD_OFF,
    last: EXIT_841CF0_HEAD_BYTE_OFF,
  };
}

export function exit841cf0P1ElemOff(index) {
  const i = index >>> 0;
  if (i >= EXIT_841CF0_P1_COUNT) return 0xffffffff;
  return (EXIT_841CF0_P1_BASE_OFF + i * EXIT_841CF0_P1_STRIDE) >>> 0;
}

export function exit841cf0P1HostPtr(thisAddr, index) {
  const off = exit841cf0P1ElemOff(index);
  if (off === 0xffffffff) return 0;
  return ((thisAddr >>> 0) + off + EXIT_841CF0_P1_HOST_OFF) >>> 0;
}

/** Pure dwords +0 / +4 to 0 before host 0x0040c7f0(0) on elem+8. */
export function exit841cf0P1Pre(view, elemOff) {
  const e = elemOff >>> 0;
  view.setUint32(e + 0, 0, true);
  view.setUint32(e + 4, 0, true);
}

export function exit841cf0P1Apply(view, thisOff) {
  const base = thisOff >>> 0;
  for (let i = 0; i < EXIT_841CF0_P1_COUNT; i++) {
    exit841cf0P1Pre(view, (base + exit841cf0P1ElemOff(i)) >>> 0);
  }
  return { thisOff: base, count: EXIT_841CF0_P1_COUNT };
}

export function exit841cf0P2ElemOff(index) {
  const i = index >>> 0;
  if (i >= EXIT_841CF0_P2_COUNT) return 0xffffffff;
  return (EXIT_841CF0_P2_BASE_OFF + i * EXIT_841CF0_P2_STRIDE) >>> 0;
}

export function exit841cf0P2HostAPtr(thisAddr, index) {
  const off = exit841cf0P2ElemOff(index);
  if (off === 0xffffffff) return 0;
  return ((thisAddr >>> 0) + off + EXIT_841CF0_P2_HOST_A_OFF) >>> 0;
}

export function exit841cf0P2HostBPtr(thisAddr, index) {
  const off = exit841cf0P2ElemOff(index);
  if (off === 0xffffffff) return 0;
  return ((thisAddr >>> 0) + off + EXIT_841CF0_P2_HOST_B_OFF) >>> 0;
}

/** Pure dwords +0 / +4 / +0x18 to 0 before the two pair host gates. */
export function exit841cf0P2Pre(view, elemOff) {
  const e = elemOff >>> 0;
  view.setUint32(e + 0, 0, true);
  view.setUint32(e + 4, 0, true);
  view.setUint32(e + EXIT_841CF0_P2_TAIL_OFF, 0, true);
}

export function exit841cf0P2Apply(view, thisOff) {
  const base = thisOff >>> 0;
  for (let i = 0; i < EXIT_841CF0_P2_COUNT; i++) {
    exit841cf0P2Pre(view, (base + exit841cf0P2ElemOff(i)) >>> 0);
  }
  return { thisOff: base, count: EXIT_841CF0_P2_COUNT };
}

/** Host 0x0040c7f0(0) runs iff the pair value dword is non-zero. */
export function exit841cf0P2HostNeeded(pairValue) {
  return (pairValue >>> 0) !== 0;
}

export function exit841cf0VecElemHostPtr(elemPtr) {
  return ((elemPtr >>> 0) + EXIT_841CF0_VEC_ELEM_HOST_OFF) >>> 0;
}

export function exit841cf0VecNext(elemPtr) {
  return ((elemPtr >>> 0) + EXIT_841CF0_VEC_ELEM_STRIDE) >>> 0;
}

export function exit841cf0VecWalkNeeded(begin, end) {
  return (begin >>> 0) !== (end >>> 0);
}

export function exit841cf0VecWalkContinue(next, end) {
  return (next >>> 0) !== (end >>> 0);
}

export function exit841cf0VecElemCount(begin, end) {
  const b = begin >>> 0;
  const e = end >>> 0;
  if (e < b) return 0;
  const span = (e - b) >>> 0;
  if (span % EXIT_841CF0_VEC_ELEM_STRIDE !== 0) return 0;
  return (span / EXIT_841CF0_VEC_ELEM_STRIDE) >>> 0;
}

/** [this+0x6a4] takes the begin value recaptured after host 0x00709380. */
export function exit841cf0VecClearEnd(view, thisOff, beginAfterHost) {
  view.setUint32(
    ((thisOff >>> 0) + EXIT_841CF0_VEC_END_OFF) >>> 0,
    beginAfterHost >>> 0,
    true,
  );
  return beginAfterHost >>> 0;
}

export function exit841cf0Word6acClear(view, thisOff) {
  view.setUint16(((thisOff >>> 0) + EXIT_841CF0_WORD_6AC_OFF) >>> 0, 0, true);
}

export function exit841cf0TerminalClear(view, thisOff) {
  view.setUint32(((thisOff >>> 0) + EXIT_841CF0_TERMINAL_OFF) >>> 0, 0, true);
}

/** Every pure store of 0x00841cf0 in PE order (hosts omitted). */
export function exit841cf0PureApply(view, thisOff, vecBeginAfterHost) {
  const base = thisOff >>> 0;
  exit841cf0P0Apply(view, base);
  exit841cf0HeadClear(view, base);
  exit841cf0P1Apply(view, base);
  exit841cf0P2Apply(view, base);
  exit841cf0VecClearEnd(view, base, vecBeginAfterHost);
  exit841cf0Word6acClear(view, base);
  exit841cf0TerminalClear(view, base);
  return {
    thisOff: base,
    vecEnd: vecBeginAfterHost >>> 0,
    p0: EXIT_841CF0_P0_COUNT,
    p1: EXIT_841CF0_P1_COUNT,
    p2: EXIT_841CF0_P2_COUNT,
  };
}

/* --- ABI v25: residual 0x0083abb0 pure islands / CF --- */

export function exit83abb0BlockBaseOff(block) {
  const b = block >>> 0;
  if (b >= EXIT_83ABB0_BLOCK_COUNT) return 0xffffffff;
  return (b * EXIT_83ABB0_BLOCK_STRIDE) >>> 0;
}

export function exit83abb0WalkNeeded(begin, end) {
  return (begin >>> 0) !== (end >>> 0);
}

export function exit83abb0WalkContinue(next, end) {
  return (next >>> 0) !== (end >>> 0);
}

export function exit83abb0ElemHostPtr(elemPtr) {
  return ((elemPtr >>> 0) + EXIT_83ABB0_ELEM_HOST_OFF) >>> 0;
}

export function exit83abb0ElemNext(elemPtr) {
  return ((elemPtr >>> 0) + EXIT_83ABB0_ELEM_STRIDE) >>> 0;
}

export function exit83abb0ElemCount(begin, end) {
  const b = begin >>> 0;
  const e = end >>> 0;
  if (e < b) return 0;
  const span = (e - b) >>> 0;
  if (span % EXIT_83ABB0_ELEM_STRIDE !== 0) return 0;
  return (span / EXIT_83ABB0_ELEM_STRIDE) >>> 0;
}

/** end takes recaptured begin, byte +4 to 0, dword +0 to 0 (PE order). */
export function exit83abb0BlockPost(view, blockOff, beginAfterHost) {
  const b = blockOff >>> 0;
  view.setUint32(b + EXIT_83ABB0_VEC_END_OFF, beginAfterHost >>> 0, true);
  view.setUint8(b + EXIT_83ABB0_FLAG4_OFF, 0);
  view.setUint32(b + EXIT_83ABB0_FIELD0_OFF, 0, true);
}

export function exit83abb0TerminalClear(view, thisOff) {
  view.setUint8(((thisOff >>> 0) + EXIT_83ABB0_TERMINAL_OFF) >>> 0, 0);
}

export function exit83abb0Apply(view, thisOff, beginAfterHost) {
  const base = thisOff >>> 0;
  for (let b = 0; b < EXIT_83ABB0_BLOCK_COUNT; b++) {
    exit83abb0BlockPost(
      view,
      (base + exit83abb0BlockBaseOff(b)) >>> 0,
      beginAfterHost[b] >>> 0,
    );
  }
  exit83abb0TerminalClear(view, base);
  return { thisOff: base, blocks: EXIT_83ABB0_BLOCK_COUNT };
}

/* --- ABI v25: shared range COM destroy CF (0x00709380 / 0x00709300) --- */

export function exitRangeDestroyStride709380() {
  return EXIT_709380_ELEM_STRIDE;
}

export function exitRangeDestroyStride709300() {
  return EXIT_709300_ELEM_STRIDE;
}

export function exitRangeDestroyLoopNeeded(begin, end) {
  return (begin >>> 0) !== (end >>> 0);
}

export function exitRangeDestroyContinue(next, end) {
  return (next >>> 0) !== (end >>> 0);
}

export function exitRangeDestroyCtrlPtr(elemPtr) {
  return ((elemPtr >>> 0) + EXIT_RANGE_DESTROY_CTRL_OFF) >>> 0;
}

export function exitRangeDestroyCbArgPtr(elemPtr) {
  return ((elemPtr >>> 0) + EXIT_RANGE_DESTROY_CB_ARG_OFF) >>> 0;
}

export function exitRangeDestroyNext(elemPtr, stride) {
  return ((elemPtr >>> 0) + (stride >>> 0)) >>> 0;
}

export function exitRangeDestroyCtrlPresent(ctrlPtr) {
  return (ctrlPtr >>> 0) !== 0;
}

export function exitRangeDestroyVirtualOk(virtualAl) {
  return (virtualAl & 0xff) !== 0;
}

export function exitRangeDestroyCallbackNeeded(ctrlPtr, virtualAl, globalFn) {
  if ((ctrlPtr >>> 0) === 0) return false;
  if ((virtualAl & 0xff) === 0) return false;
  return (globalFn >>> 0) !== 0;
}

/* --- ABI v25: pure-complete tail-jmp 0x0084bfd0 --- */

/* Literal PE store table for one block, block-base relative, in the exact
   emitted order (0x0084bfe0 .. 0x0084c153). Read off the listing, not
   derived from the C++ modular form. */
const EXIT_84BFD0_ZERO_OFFSETS = [
  0x00, 0x04, 0x18, 0x08, 0x14, 0x0c, 0x1c, 0x28, 0x20, 0x2c, 0x30, 0x3c,
  0x34, 0x40, 0x44, 0x50, 0x48, 0x54, 0x58, 0x64, 0x5c, 0x68, 0x6c, 0x78,
  0x70, 0x7c, 0x80, 0x8c, 0x84, 0x90, 0x94, 0xa0, 0x98, 0xa4, 0xa8, 0xb4,
  0xac, 0xb8, 0xbc, 0xc8, 0xc0,
];
const EXIT_84BFD0_FLOAT_OFFSETS = [0x88, 0x9c, 0xb0, 0xc4];

/** ZERO / SKIP / FLOAT for a block dword index; 0xffffffff out of range. */
export function exit84bfd0SlotKind(dwordIndex) {
  const i = dwordIndex >>> 0;
  if (i >= EXIT_84BFD0_BLOCK_DWORDS) return 0xffffffff;
  const off = i * 4;
  if (EXIT_84BFD0_FLOAT_OFFSETS.includes(off)) return EXIT_84BFD0_SLOT_FLOAT;
  if (EXIT_84BFD0_ZERO_OFFSETS.includes(off)) return EXIT_84BFD0_SLOT_ZERO;
  return EXIT_84BFD0_SLOT_SKIP;
}

export function exit84bfd0BlockBaseOff(block) {
  const b = block >>> 0;
  if (b >= EXIT_84BFD0_BLOCK_COUNT) return 0xffffffff;
  return (EXIT_84BFD0_BASE_OFF + b * EXIT_84BFD0_BLOCK_STRIDE) >>> 0;
}

export function exit84bfd0SlotOff(block, dwordIndex) {
  const base = exit84bfd0BlockBaseOff(block);
  if (base === 0xffffffff) return 0xffffffff;
  const i = dwordIndex >>> 0;
  if (i >= EXIT_84BFD0_BLOCK_DWORDS) return 0xffffffff;
  return (base + i * 4) >>> 0;
}

export function exit84bfd0F32Bits() {
  return EXIT_84BFD0_F32_BITS >>> 0;
}

/** One block in PE store order (zeros first, then the four 0.1f slots). */
export function exit84bfd0ApplyBlock(view, blockOff) {
  const b = blockOff >>> 0;
  for (const off of EXIT_84BFD0_ZERO_OFFSETS) {
    view.setUint32((b + off) >>> 0, 0, true);
  }
  for (const off of EXIT_84BFD0_FLOAT_OFFSETS) {
    view.setUint32((b + off) >>> 0, EXIT_84BFD0_F32_BITS >>> 0, true);
  }
}

/** Pure-complete body: two blocks then the terminal byte at +0x2ac. */
export function exit84bfd0Apply(view, thisOff) {
  const base = thisOff >>> 0;
  for (let b = 0; b < EXIT_84BFD0_BLOCK_COUNT; b++) {
    exit84bfd0ApplyBlock(view, (base + exit84bfd0BlockBaseOff(b)) >>> 0);
  }
  view.setUint8((base + EXIT_84BFD0_TERMINAL_OFF) >>> 0, 0);
  return {
    thisOff: base,
    blocks: EXIT_84BFD0_BLOCK_COUNT,
    dwordsPerBlock: EXIT_84BFD0_BLOCK_DWORDS,
  };
}

/* --- ABI v26: buffer-free residual 0x00840f70 pure islands / CF --- */

export function exit840f70SlotOff(index) {
  const i = index >>> 0;
  if (i >= EXIT_840F70_SLOT_COUNT) return 0xffffffff;
  return (i * EXIT_840F70_SLOT_STRIDE) >>> 0;
}

export function exit840f70SlotPtr(thisAddr, index) {
  const off = exit840f70SlotOff(index);
  if (off === 0xffffffff) return 0;
  return ((thisAddr >>> 0) + off) >>> 0;
}

export function exit840f70FreeNeeded(slotValue) {
  return (slotValue >>> 0) !== 0;
}

export function exit840f70HeapStatsBase(heapStatsGlobal) {
  const g = heapStatsGlobal >>> 0;
  return g === 0
    ? EXIT_840F70_HEAP_STATS_FALLBACK >>> 0
    : ((g + EXIT_840F70_HEAP_STATS_DELTA) >>> 0);
}

export function exit840f70FreeBasePtr(slotValue) {
  return ((slotValue >>> 0) - EXIT_840F70_HEADER_DELTA) >>> 0;
}

export function exit840f70HeaderSizePtr(slotValue) {
  return ((slotValue >>> 0) - EXIT_840F70_HEADER_DELTA) >>> 0;
}

/*
 * `sub [base],size` + `sbb [base+4],0` is one 64-bit unsigned subtract of a
 * zero-extended 32-bit operand. Modelled as such with BigInt rather than as
 * a hand-written borrow, so a borrow bug in the C++ form cannot hide.
 */
function exit840f70Sub64(lo, hi, size) {
  const cur = ((BigInt(hi >>> 0) << 32n) | BigInt(lo >>> 0)) & 0xffffffffffffffffn;
  const next = (cur - BigInt(size >>> 0)) & 0xffffffffffffffffn;
  return {
    lo: Number(next & 0xffffffffn) >>> 0,
    hi: Number((next >> 32n) & 0xffffffffn) >>> 0,
  };
}

export function exit840f70StatsSubLo(lo, size) {
  return exit840f70Sub64(lo, 0, size).lo;
}

export function exit840f70StatsSubBorrow(lo, size) {
  return exit840f70Sub64(lo, 1, size).hi === 1 ? 0 : 1;
}

export function exit840f70StatsSubHi(lo, hi, size) {
  return exit840f70Sub64(lo, hi, size).hi;
}

/**
 * Apply the 64-bit accounting subtract in place.
 * @param {DataView} view
 * @param {number} statsBase
 * @param {number} size
 */
export function exit840f70StatsSubAt(view, statsBase, size) {
  const b = statsBase >>> 0;
  const lo = view.getUint32(b + EXIT_840F70_STATS_LO_OFF, true) >>> 0;
  const hi = view.getUint32(b + EXIT_840F70_STATS_HI_OFF, true) >>> 0;
  const out = exit840f70Sub64(lo, hi, size);
  view.setUint32(b + EXIT_840F70_STATS_LO_OFF, out.lo, true);
  view.setUint32(b + EXIT_840F70_STATS_HI_OFF, out.hi, true);
  return out;
}

export function exit840f70SlotClear(view, slotOff) {
  view.setUint32(slotOff >>> 0, 0, true);
}

/** Net pure effect on `this`; returns how many host frees the PE issues. */
export function exit840f70Apply(view, thisOff) {
  const base = thisOff >>> 0;
  let frees = 0;
  for (let i = 0; i < EXIT_840F70_SLOT_COUNT; i++) {
    const off = (base + exit840f70SlotOff(i)) >>> 0;
    if (exit840f70FreeNeeded(view.getUint32(off, true))) {
      frees++;
      exit840f70SlotClear(view, off);
    }
  }
  return frees;
}

export function exit840f70SlotPlan(
  thisAddr,
  index,
  slotValue,
  heapStatsGlobal,
  headerSize,
  statsLo,
  statsHi,
) {
  const freeNeeded = exit840f70FreeNeeded(slotValue);
  const statsBase = freeNeeded ? exit840f70HeapStatsBase(heapStatsGlobal) : 0;
  const after = freeNeeded
    ? exit840f70Sub64(statsLo, statsHi, headerSize)
    : { lo: 0, hi: 0 };
  return {
    index: index >>> 0,
    slotPtr: exit840f70SlotPtr(thisAddr, index),
    slotValue: slotValue >>> 0,
    freeNeeded,
    freeBasePtr: freeNeeded ? exit840f70FreeBasePtr(slotValue) : 0,
    statsBase,
    statsLoPtr: freeNeeded
      ? ((statsBase + EXIT_840F70_STATS_LO_OFF) >>> 0)
      : 0,
    statsHiPtr: freeNeeded
      ? ((statsBase + EXIT_840F70_STATS_HI_OFF) >>> 0)
      : 0,
    headerSize: freeNeeded ? headerSize >>> 0 : 0,
    statsLoAfter: after.lo,
    statsHiAfter: after.hi,
  };
}

/* --- ABI v26: pair-replace residual 0x00709150 pure islands / CF --- */

export function exit709150AllocSize() {
  return EXIT_709150_ALLOC_SIZE;
}

export function exit709150AllocOk(allocPtr) {
  return (allocPtr >>> 0) !== 0;
}

export function exit709150NewObjectValue(allocPtr) {
  return exit709150AllocOk(allocPtr) ? allocPtr >>> 0 : 0;
}

/** Post-ctor overwrite: [obj] = 0xb67f98, [obj+0x14] = 0. */
export function exit709150ObjectFinishApply(view, objOff) {
  const o = objOff >>> 0;
  view.setUint32(o, EXIT_709150_VTABLE >>> 0, true);
  view.setUint32(o + EXIT_709150_FIELD_14_OFF, 0, true);
}

export function exit709150OldObjectPresent(oldObj) {
  return (oldObj >>> 0) !== 0;
}

export function exit709150VirtualOk(virtualAl) {
  return (virtualAl & 0xff) !== 0;
}

export function exit709150CallbackNeeded(oldObj, virtualAl, globalFn) {
  if ((oldObj >>> 0) === 0) return false;
  if ((virtualAl & 0xff) === 0) return false;
  return (globalFn >>> 0) !== 0;
}

/** Terminal pair store: *this = 0 (immediate), this+4 = new object. */
export function exit709150PairApplyBase(view, pairOff, newObj) {
  const p = pairOff >>> 0;
  view.setUint32(p + EXIT_709150_PAIR_VALUE_OFF, 0, true);
  view.setUint32(p + EXIT_709150_PAIR_OBJ_OFF, newObj >>> 0, true);
}

export function exit709150Plan(
  thisAddr,
  allocPtr,
  oldObject,
  virtualAl,
  callbackGlobalFn,
) {
  const allocOk = exit709150AllocOk(allocPtr);
  const newObject = exit709150NewObjectValue(allocPtr);
  return {
    thisAddr: thisAddr >>> 0,
    allocSize: EXIT_709150_ALLOC_SIZE,
    allocPtr: allocPtr >>> 0,
    allocOk,
    newObject,
    ctorHostNeeded: allocOk,
    finishNeeded: allocOk,
    vtableValue: EXIT_709150_VTABLE >>> 0,
    oldObject: oldObject >>> 0,
    oldObjectPresent: exit709150OldObjectPresent(oldObject),
    virtualOk: exit709150VirtualOk(virtualAl),
    callbackNeeded: exit709150CallbackNeeded(
      oldObject,
      virtualAl,
      callbackGlobalFn,
    ),
    valueSlotPtr: ((thisAddr >>> 0) + EXIT_709150_PAIR_VALUE_OFF) >>> 0,
    objSlotPtr: ((thisAddr >>> 0) + EXIT_709150_PAIR_OBJ_OFF) >>> 0,
    valueSlotAfter: 0, // PE stores an immediate 0, not the stack arg
    objSlotAfter: newObject,
  };
}

/* --- ABI v27: teardown residual 0x00a1ad90 pure islands / CF --- */

export function exitA1ad90BlockANeeded(ptr28) {
  return (ptr28 >>> 0) !== 0;
}

export function exitA1ad90BlockBNeeded(arr3c) {
  return (arr3c >>> 0) !== 0;
}

export function exitA1ad90HeaderPtr(arr3c) {
  return ((arr3c >>> 0) - EXIT_A1AD90_HEADER_DELTA) >>> 0;
}

export function exitA1ad90ElemSize() {
  return EXIT_A1AD90_ELEM_SIZE;
}

export function exitA1ad90ElemDtor() {
  return EXIT_A1AD90_ELEM_DTOR >>> 0;
}

/** Count argument pushed to the dtor iterator: the value read BEFORE it. */
export function exitA1ad90DtorCountArg(countBefore) {
  return countBefore >>> 0;
}

/*
 * Free size. The PE re-reads the count from arr-4 *after* the dtor iterator
 * and scales it by the element size, plus the 4-byte header. Written as
 * "one header plus count elements" rather than as a transcription of
 * `lea eax,[eax*8+4]`, so an arithmetic slip cannot match on both sides.
 */
export function exitA1ad90FreeSize(countAfter) {
  const bytes =
    BigInt(countAfter >>> 0) * BigInt(EXIT_A1AD90_ELEM_SIZE) +
    BigInt(EXIT_A1AD90_FREE_SIZE_ADD);
  return Number(bytes & 0xffffffffn) >>> 0;
}

export function exitA1ad90TreeObjPtr(thisAddr) {
  return ((thisAddr >>> 0) + EXIT_A1AD90_TREE_OFF) >>> 0;
}

export function exitA1ad90TreeHeadPtr(thisAddr) {
  return ((thisAddr >>> 0) + EXIT_A1AD90_TREE_OFF) >>> 0;
}

export function exitA1ad90TreeSizePtr(thisAddr) {
  return ((thisAddr >>> 0) + EXIT_A1AD90_TREE_SIZE_OFF) >>> 0;
}

export function exitA1ad90TreeRootPtr(headAddr) {
  return ((headAddr >>> 0) + EXIT_TREE_PARENT_OFF) >>> 0;
}

/**
 * Post-erase sentinel reset (PE order +4, +0, +8) using the PRE-call head.
 * @param {DataView} view
 * @param {number} headOff node location in the view
 * @param {number} headAddr value stored back into all three slots
 */
export function exitA1ad90TreeResetAt(view, headOff, headAddr) {
  const h = headOff >>> 0;
  view.setUint32(h + EXIT_TREE_PARENT_OFF, headAddr >>> 0, true);
  view.setUint32(h + EXIT_TREE_LEFT_OFF, headAddr >>> 0, true);
  view.setUint32(h + EXIT_TREE_RIGHT_OFF, headAddr >>> 0, true);
}

/** Terminal pack: one BYTE at +0, then dwords at +0x24 and +0x38. */
export function exitA1ad90Terminal(view, thisOff) {
  const b = thisOff >>> 0;
  view.setUint8(b + EXIT_A1AD90_TERMINAL_BYTE_OFF, 0);
  view.setUint32(b + EXIT_A1AD90_TERMINAL_24_OFF, 0, true);
  view.setUint32(b + EXIT_A1AD90_TERMINAL_38_OFF, 0, true);
}

/** Pure stores that land on `this`; returns the host-block bitmask. */
export function exitA1ad90ApplyThis(view, thisOff) {
  const b = thisOff >>> 0;
  let hosts = 0;
  if (exitA1ad90BlockANeeded(view.getUint32(b + EXIT_A1AD90_BLOCK_A_OFF, true))) {
    hosts |= EXIT_A1AD90_HOST_A_NEEDED_BIT;
    view.setUint32(b + EXIT_A1AD90_BLOCK_A_OFF, 0, true);
  }
  if (exitA1ad90BlockBNeeded(view.getUint32(b + EXIT_A1AD90_BLOCK_B_OFF, true))) {
    hosts |= EXIT_A1AD90_HOST_B_NEEDED_BIT;
    view.setUint32(b + EXIT_A1AD90_BLOCK_B_OFF, 0, true);
  }
  view.setUint32(b + EXIT_A1AD90_TREE_SIZE_OFF, 0, true);
  exitA1ad90Terminal(view, b);
  return hosts >>> 0;
}

export function exitA1ad90Plan(
  thisAddr,
  ptr28,
  arr3c,
  countBefore,
  countAfter,
  treeHead,
) {
  const a = exitA1ad90BlockANeeded(ptr28);
  const b = exitA1ad90BlockBNeeded(arr3c);
  const hdr = b ? exitA1ad90HeaderPtr(arr3c) : 0;
  return {
    thisAddr: thisAddr >>> 0,
    ptr28: ptr28 >>> 0,
    blockANeeded: a,
    arr3c: arr3c >>> 0,
    blockBNeeded: b,
    headerPtr: hdr,
    dtorBase: b ? arr3c >>> 0 : 0,
    dtorElemSize: EXIT_A1AD90_ELEM_SIZE,
    dtorCount: b ? exitA1ad90DtorCountArg(countBefore) : 0,
    dtorFn: EXIT_A1AD90_ELEM_DTOR >>> 0,
    freeBasePtr: hdr,
    freeSize: b ? exitA1ad90FreeSize(countAfter) : 0,
    treeObjPtr: exitA1ad90TreeObjPtr(thisAddr),
    treeHead: treeHead >>> 0,
    treeRootPtr: exitA1ad90TreeRootPtr(treeHead),
    treeSizePtr: exitA1ad90TreeSizePtr(thisAddr),
  };
}

/* --- ABI v27: recovered call shape of host 0x00a648b0 --- */

/** movzx eax, cl — only the low byte of ECX selects the mode. */
export function exitA648b0ModeFromCl(ecx) {
  return (ecx >>> 0) % 256;
}

export function exitA648b0ModeFree() {
  return EXIT_A648B0_MODE_FREE;
}

export function exitA648b0Mode1FreeNeeded(edxPtr) {
  return (edxPtr >>> 0) !== 0;
}

export function exitA648b0Mode1HeaderSizePtr(edxPtr) {
  return ((edxPtr >>> 0) - EXIT_A648B0_HEADER_DELTA) >>> 0;
}

export function exitA648b0Mode1FreeBasePtr(edxPtr) {
  return ((edxPtr >>> 0) - EXIT_A648B0_HEADER_DELTA) >>> 0;
}

export function exitA648b0HeapStatsBase(heapStatsGlobal) {
  const g = heapStatsGlobal >>> 0;
  return g === 0
    ? EXIT_A648B0_HEAP_STATS_FALLBACK >>> 0
    : ((g + EXIT_A648B0_HEAP_STATS_DELTA) >>> 0);
}

/* --- ABI v43: decision laws of the host body (mode dispatch + mode 2) --- */

/** Full dispatch: movzx eax,cl / sub 0 / je done / sub 1 / je free /
 *  sub 1 / jne done — 0 empty, 1 free, 2 stats-add, >= 3 empty. */
export function exitA648b0ModePath(mode) {
  const m = (mode >>> 0) & 0xff;
  if (m === EXIT_A648B0_MODE_FREE) return 1;
  if (m === EXIT_A648B0_MODE_STATS) return 2;
  return 0;
}

export function exitA648b0ModeStats() {
  return EXIT_A648B0_MODE_STATS;
}

/** Mode-2 base: [0xc7de78] + 0x30 DIRECTLY — no null fallback (the PE
 *  uses edi, unlike the mode-1 esi select). 32-bit wrap. */
export function exitA648b0Mode2StatsBasePtr(heapStatsGlobal) {
  return ((heapStatsGlobal >>> 0) + EXIT_A648B0_MODE2_BASE_OFF) >>> 0;
}

export function exitA648b0Mode2AddendLoVa() {
  return EXIT_A648B0_MODE2_ADDEND_LO_VA >>> 0;
}

export function exitA648b0Mode2AddendHiVa() {
  return EXIT_A648B0_MODE2_ADDEND_HI_VA >>> 0;
}

/**
 * 64-bit add-with-carry reference. The PE does `add [lo], add_lo;
 * adc [hi], add_hi`; modelled over the full 64-bit value with BigInt so
 * a carry bug in the C++ form cannot hide (same discipline as the v26
 * exit840f70Sub64).
 */
function exitA648b0Add64(lo, hi, addLo, addHi) {
  const cur =
    ((BigInt(hi >>> 0) << 32n) | BigInt(lo >>> 0)) & 0xffffffffffffffffn;
  const add =
    ((BigInt(addHi >>> 0) << 32n) | BigInt(addLo >>> 0)) & 0xffffffffffffffffn;
  const next = (cur + add) & 0xffffffffffffffffn;
  return {
    lo: Number(next & 0xffffffffn) >>> 0,
    hi: Number(next >> 32n) >>> 0,
  };
}

export function exitA648b0StatsAddLo(lo, addLo) {
  return exitA648b0Add64(lo, 0, addLo, 0).lo;
}

export function exitA648b0StatsAddCarry(lo, addLo) {
  return exitA648b0Add64(lo, 0, addLo, 0).hi;
}

export function exitA648b0StatsAddHi(lo, hi, addLo, addHi) {
  return exitA648b0Add64(lo, hi, addLo, addHi).hi;
}

export function exitA648b0StatsAddPair(lo, hi, addLo, addHi) {
  return exitA648b0Add64(lo, hi, addLo, addHi);
}

/** Packed body decision plan (mirror of IsaacExitA648b0ModePlan). */
export function exitA648b0ModePlan(
  mode,
  edxPtr,
  heapStatsGlobal,
  statsLo,
  statsHi,
  headerSize,
  addLo,
  addHi,
) {
  const path = exitA648b0ModePath(mode);
  const freeNeeded = path === 1 && (edxPtr >>> 0) !== 0;
  let statsBase = 0;
  let loAfter = statsLo >>> 0;
  let hiAfter = statsHi >>> 0;
  let freePtr = 0;
  if (path === 1 && freeNeeded) {
    // Mode-1 borrow subtract is the v26 0x00840f70 arithmetic.
    statsBase = exitA648b0HeapStatsBase(heapStatsGlobal);
    freePtr = exitA648b0Mode1FreeBasePtr(edxPtr);
    const after = exit840f70Sub64(statsLo, statsHi, headerSize);
    loAfter = after.lo;
    hiAfter = after.hi;
  } else if (path === 2) {
    // Mode-2 stores are unconditional once dispatched.
    statsBase = exitA648b0Mode2StatsBasePtr(heapStatsGlobal);
    const after = exitA648b0Add64(statsLo, statsHi, addLo, addHi);
    loAfter = after.lo;
    hiAfter = after.hi;
  }
  return {
    path,
    freeNeeded,
    statsBase,
    loAfter,
    hiAfter,
    freePtr,
  };
}

/* --- ABI v44: fully pure thiscall predicate 0x006f0040 (band-scan find) ---
   PE 0x006f0040..0x006f0066, 0 E8 / 0 indirect / 0 stores, 4 direct
   rel32 callers. Gates run in machine order and are FULL-dword; the
   `jge` is SIGNED; the self-alias test compares the loaded pointer
   against the receiver address. The return is the AL byte flag. */

export function exit6f0040Va() {
  return EXIT_6F0040_VA >>> 0;
}

export function exit6f0040BodyBytes() {
  return EXIT_6F0040_BODY_BYTES >>> 0;
}

export function exit6f0040PtrOff() {
  return EXIT_6F0040_PTR_OFF >>> 0;
}

export function exit6f0040CountOff() {
  return EXIT_6F0040_COUNT_OFF >>> 0;
}

/** PE order: null ptr; -1 sentinel; SIGNED obj >= own; self-alias. */
export function exit6f0040Predicate(receiver, ptr1e68, own161c, obj161c) {
  if ((ptr1e68 >>> 0) === 0) return 0;
  if ((obj161c >>> 0) === EXIT_6F0040_INVALID_COUNT) return 0;
  if ((obj161c | 0) >= (own161c | 0)) return 0;
  if ((ptr1e68 >>> 0) === (receiver >>> 0)) return 0;
  return 1;
}

/* --- ABI v45: fully pure static membership predicate 0x0071df80 (band
   re-scan find) ---
   PE 0x0071df80..0x0071dfbf, 0 E8 / 0 indirect / 0 stores, 2 direct
   rel32 callers. Eight FULL-dword cmp eax, imm member gates in PE
   order; the return is the AL byte flag. Takes the FINAL captured dword
   [Game::_room + 0x1d18] (the three dereferences are capture-side). */

export function exit71df80Va() {
  return EXIT_71DF80_VA >>> 0;
}

export function exit71df80BodyBytes() {
  return EXIT_71DF80_BODY_BYTES >>> 0;
}

export function exit71df80GameDat() {
  return EXIT_71DF80_GAME_DAT >>> 0;
}

export function exit71df80RoomOff() {
  return EXIT_71DF80_ROOM_OFF >>> 0;
}

export function exit71df80StateOff() {
  return EXIT_71DF80_STATE_OFF >>> 0;
}

/** PE order membership: S ∈ {0xa, 0xb, 0xc, 0xd, 0x22, 0x2b, 0x2c, 0x30}. */
export function exit71df80StateOpen(state1d18) {
  const s = state1d18 >>> 0;
  if (s === EXIT_71DF80_STATE_0A) return 1;
  if (s === EXIT_71DF80_STATE_0B) return 1;
  if (s === EXIT_71DF80_STATE_0C) return 1;
  if (s === EXIT_71DF80_STATE_0D) return 1;
  if (s === EXIT_71DF80_STATE_22) return 1;
  if (s === EXIT_71DF80_STATE_2B) return 1;
  if (s === EXIT_71DF80_STATE_2C) return 1;
  if (s === EXIT_71DF80_STATE_30) return 1;
  return 0;
}

/* --- ABI v28: pair constructor 0x0040c4a0 pure islands / CF --- */

/** Entry zero BEFORE the allocator — the store 0x0040c7f0 does not have. */
export function exit40c4a0EntryZeroAt(view, pairOff) {
  const p = pairOff >>> 0;
  view.setUint32(p + EXIT_40C4A0_PAIR_VALUE_OFF, 0, true);
  view.setUint32(p + EXIT_40C4A0_PAIR_OBJ_OFF, 0, true);
}

export function exit40c4a0AllocSize() {
  return EXIT_40C4A0_ALLOC_SIZE;
}

export function exit40c4a0AllocOk(allocPtr) {
  return (allocPtr >>> 0) !== 0;
}

export function exit40c4a0NewObjectValue(allocPtr) {
  return exit40c4a0AllocOk(allocPtr) ? allocPtr >>> 0 : 0;
}

/** Post-ctor overwrite: [obj] = 0xb1a6e0, [obj+0x14] = stack arg. */
export function exit40c4a0ObjectFinishApply(view, objOff, arg) {
  const o = objOff >>> 0;
  view.setUint32(o, EXIT_40C4A0_VTABLE >>> 0, true);
  view.setUint32(o + EXIT_40C4A0_ARG_OFF, arg >>> 0, true);
}

/** Gate on the RECAPTURED [this+4], never on the entry-zeroed snapshot. */
export function exit40c4a0OldObjectPresent(oldObjAfterHosts) {
  return (oldObjAfterHosts >>> 0) !== 0;
}

export function exit40c4a0VirtualOk(virtualAl) {
  return (virtualAl & 0xff) !== 0;
}

export function exit40c4a0CallbackNeeded(oldObjAfterHosts, virtualAl, globalFn) {
  if ((oldObjAfterHosts >>> 0) === 0) return false;
  if ((virtualAl & 0xff) === 0) return false;
  return (globalFn >>> 0) !== 0;
}

/** Terminal stores: object slot first, then the value slot. */
export function exit40c4a0PairApplyBase(view, pairOff, newObj, arg) {
  const p = pairOff >>> 0;
  view.setUint32(p + EXIT_40C4A0_PAIR_OBJ_OFF, newObj >>> 0, true);
  view.setUint32(p + EXIT_40C4A0_PAIR_VALUE_OFF, arg >>> 0, true);
}

export function exit40c4a0ReturnValue(thisAddr) {
  return thisAddr >>> 0;
}

export function exit40c4a0Plan(
  thisAddr,
  arg,
  allocPtr,
  oldObjAfterHosts,
  virtualAl,
  callbackGlobalFn,
) {
  const allocOk = exit40c4a0AllocOk(allocPtr);
  const newObject = exit40c4a0NewObjectValue(allocPtr);
  return {
    thisAddr: thisAddr >>> 0,
    arg: arg >>> 0,
    allocSize: EXIT_40C4A0_ALLOC_SIZE,
    allocPtr: allocPtr >>> 0,
    allocOk,
    newObject,
    ctorHostNeeded: allocOk,
    finishNeeded: allocOk,
    vtableValue: EXIT_40C4A0_VTABLE >>> 0,
    argSlotPtr: allocOk ? ((newObject + EXIT_40C4A0_ARG_OFF) >>> 0) : 0,
    oldObject: oldObjAfterHosts >>> 0,
    oldObjectPresent: exit40c4a0OldObjectPresent(oldObjAfterHosts),
    virtualOk: exit40c4a0VirtualOk(virtualAl),
    callbackNeeded: exit40c4a0CallbackNeeded(
      oldObjAfterHosts,
      virtualAl,
      callbackGlobalFn,
    ),
    valueSlotPtr: ((thisAddr >>> 0) + EXIT_40C4A0_PAIR_VALUE_OFF) >>> 0,
    objSlotPtr: ((thisAddr >>> 0) + EXIT_40C4A0_PAIR_OBJ_OFF) >>> 0,
    valueSlotAfter: arg >>> 0,
    objSlotAfter: newObject,
    returnValue: exit40c4a0ReturnValue(thisAddr),
  };
}

/* --- ABI v28: recursive tree _Erase 0x00415800 pure islands / CF --- */

export function exit415800WalkContinue(isnilByte) {
  return (isnilByte & 0xff) === 0;
}

export function exit415800RecurseNodePtr(node) {
  return ((node >>> 0) + EXIT_TREE_RIGHT_OFF) >>> 0;
}

export function exit415800NextNodePtr(node) {
  return ((node >>> 0) + EXIT_TREE_LEFT_OFF) >>> 0;
}

export function exit415800ComSlotPtr(node) {
  return ((node >>> 0) + EXIT_415800_COM_SLOT_OFF) >>> 0;
}

export function exit415800CtrlPtr(node) {
  return ((node >>> 0) + EXIT_415800_CTRL_OFF) >>> 0;
}

export function exit415800CtrlPresent(ctrl) {
  return (ctrl >>> 0) !== 0;
}

export function exit415800VirtualOk(virtualAl) {
  return (virtualAl & 0xff) !== 0;
}

export function exit415800CallbackNeeded(ctrl, virtualAl, globalFn) {
  if ((ctrl >>> 0) === 0) return false;
  if ((virtualAl & 0xff) === 0) return false;
  return (globalFn >>> 0) !== 0;
}

export function exit415800FreeSize() {
  return EXIT_415800_NODE_SIZE;
}

/*
 * Free-order enumerator. Written as the literal recursion the PE performs
 * — erase(right); emit(self); erase(left) — rather than as the explicit
 * stack the C++ uses, so a traversal-order slip cannot match on both sides.
 */
export function exit415800FreeOrder(view, root, maxOut) {
  const out = [];
  let overflow = false;
  const isnil = (n) => view.getUint8(((n >>> 0) + EXIT_TREE_ISNIL_OFF) >>> 0);
  const left = (n) =>
    view.getUint32(((n >>> 0) + EXIT_TREE_LEFT_OFF) >>> 0, true) >>> 0;
  const right = (n) =>
    view.getUint32(((n >>> 0) + EXIT_TREE_RIGHT_OFF) >>> 0, true) >>> 0;
  // `depth` mirrors the right-spine stack the PE builds: descending to a
  // right child consumes a slot, moving to a left child reuses the slot
  // the emitted node just freed.
  const erase = (n, depth) => {
    if (overflow) return;
    if (!exit415800WalkContinue(isnil(n))) return;
    if (depth >= EXIT_415800_MAX_DEPTH) {
      overflow = true;
      return;
    }
    erase(right(n), depth + 1);
    if (overflow) return;
    if (out.length >= (maxOut >>> 0)) {
      overflow = true;
      return;
    }
    out.push(n >>> 0);
    erase(left(n), depth);
  };
  erase(root >>> 0, 0);
  return overflow ? { overflow: true, nodes: [] } : { overflow: false, nodes: out };
}

// ---------------------------------------------------------------------------
// ABI v30 — key hash 0x00a159d0 and keyed registry store/release 0x0040e520.
//
// Derived from the instruction stream, not from the C++ translation.
//
// 0x00a159d0 is a djb2 variant. Reading the loop at 0x00a159f0 register by
// register:
//   dl = ch; dl -= 0x41           (BYTE subtract, wraps)
//   cl = ch; cl += 0x20           (BYTE add, wraps)
//   cmp dl, 0x19 / cmova ebx, ch  -> cmova is UNSIGNED "above", so the
//                                    lower-cased byte survives only while
//                                    (uint8)(ch-0x41) <= 0x19, i.e. 'A'..'Z'
//   cmp bl, 0x5c / cmove edx, 0x2f-> a backslash becomes a forward slash
//   mov ecx,eax / shl eax,5 / add eax,ecx / add eax,c  -> hash*33 + c
// v30 removed: 0x00a159d0 key hash laws (fold_char/step/hash) are OWNED by
// the render-shell family (isaac_render_shell_a159d0_norm_char/hash_step/
// hash, landed at RShell ABI v7; render-slice's a14050 chain consumes the
// hash by name). Exit keeps the PE constants as host-VA documentation and
// BY REFERENCE pins to the render-shell export semantics (v109 dedupe).
// ---------------------------------------------------------------------------

export const EXIT_A159D0_HOST_VA = 0x00a159d0;
export const EXIT_A159D0_HASH_INIT = 0x1505;
export const EXIT_A159D0_NULL_HASH = 0;
export const EXIT_A159D0_MAX_LEN = 0x1000;

export const EXIT_40E520_PAIR_VALUE_OFF = 0;
export const EXIT_40E520_PAIR_CTRL_OFF = 4;
export const EXIT_40E520_NAME_PRIMARY_OFF = 0x44;
export const EXIT_40E520_NAME_FALLBACK_OFF = 0x40;
export const EXIT_40E520_RELEASE_VTABLE_OFF = 0xc;
export const EXIT_40E520_DEFAULT_NAME_ADDR = 0x00b65788;
export const EXIT_40E520_MAP_GLOBAL = 0x00c78ee8;
export const EXIT_40E520_CALLBACK_GLOBAL = 0x00c7163c;

export function exit40e520MapStoreNeeded(pairValue) {
  // 0x0040e54f: test eax,eax — the whole dword decides.
  return (pairValue >>> 0) !== 0;
}

export function exit40e520NamePtr(field44, field40) {
  // 0x0040e558 jne skips the fallback load entirely, so +0x40 is not even
  // read when +0x44 is set.
  if ((field44 >>> 0) !== 0) return field44 >>> 0;
  return (field40 >>> 0) !== 0 ? field40 >>> 0 : EXIT_40E520_DEFAULT_NAME_ADDR;
}

export function exit40e520PairValuePtr(pairBase) {
  return ((pairBase >>> 0) + EXIT_40E520_PAIR_VALUE_OFF) >>> 0;
}

export function exit40e520PairCtrlPtr(pairBase) {
  return ((pairBase >>> 0) + EXIT_40E520_PAIR_CTRL_OFF) >>> 0;
}

export function exit40e520ReleaseCtrlPresent(ctrlAfterHosts) {
  // 0x0040e58f re-reads [ebp+0xc] AFTER the three host calls.
  return (ctrlAfterHosts >>> 0) !== 0;
}

export function exit40e520VirtualOk(virtualAl) {
  // 0x0040e59d: test al,al.
  return (virtualAl & 0xff) !== 0;
}

export function exit40e520CallbackNeeded(ctrlAfterHosts, virtualAl, globalFn) {
  return (
    exit40e520ReleaseCtrlPresent(ctrlAfterHosts) &&
    exit40e520VirtualOk(virtualAl) &&
    (globalFn >>> 0) !== 0
  );
}

export function exit40e520CallbackArgPtr(pairBase) {
  // lea ecx,[ebp+8] — the address of the pair, not its value.
  return pairBase >>> 0;
}

export function exit40e520Plan(
  pairBase,
  pairValue,
  field44,
  field40,
  ctrlAfterHosts,
  virtualAl,
  callbackGlobalFn,
) {
  const mapStoreNeeded = exit40e520MapStoreNeeded(pairValue);
  return {
    pairBase: pairBase >>> 0,
    pairValue: pairValue >>> 0,
    mapStoreNeeded,
    // The ladder lives past the 0x0040e551 branch, so a skipped store means
    // no name is produced at all.
    namePtr: mapStoreNeeded ? exit40e520NamePtr(field44, field40) : 0,
    mapGlobal: EXIT_40E520_MAP_GLOBAL,
    ctrlAfterHosts: ctrlAfterHosts >>> 0,
    releaseCtrlPresent: exit40e520ReleaseCtrlPresent(ctrlAfterHosts),
    virtualOk: exit40e520VirtualOk(virtualAl),
    callbackNeeded: exit40e520CallbackNeeded(
      ctrlAfterHosts,
      virtualAl,
      callbackGlobalFn,
    ),
    callbackArgPtr: exit40e520CallbackArgPtr(pairBase),
  };
}

// ABI v32 — object realloc/fill 0x007384d0 and MSVC string field setter
// 0x00408310. Derived from the instruction stream, not from the C++.
//
// 0x007384d0 (PE 0x007384d0..0x007385be):
//   edi = [this+0x18300]; if edi: host dtor 0x7e9ba0 + host CRT sized free
//   0xaef15c(edi, 0x7898); the free-slot zero is host-visible but overwritten
//   before the pure apply. eax = host alloc 0xa0f4c0(0x7898); if eax: host
//   ctor 0x7e9400 -> STORE ITS RETURN, not the alloc ptr. Then eleven pure
//   stores straddling a zero fill (VCRUNTIME memset 0xaf05e5):
//   pack1 {0x18300, 0x182d0=0xffffffff, 0x182cc, +0x0, +0x4, +0xc, 0x18334}
//   memset 0x30 @ +0x18338, then pack2 {0x18368, 0x1836c, byte 0x188f8}.
//   [this+8] is deliberately never written.
// 0x00408310 (PE 0x00408310..0x00408586, ret 4):
//   [this] = arg0; flag = arg0?1:2 (1 = host copy-ctor 0x40cf50 from
//   arg0+0x20, 2 = pure empty SSO); dst = this+8; self-assign guard
//   (full word); src decode: cap<0x10 ? base : [base], count=[base+0x10];
//   host assign 0x40ccd0(dst, data, count); then two LOW-BYTE free arms
//   (test bl,2 @0x4083ba / test bl,1 @0x4083f8) using the v19 0x40ccd0 free
//   geometry; after host 0x40c7f0(0)@this+0x98 a pure tail where field_7c =
//   (g_c798e4 & 4) == 0 ? 6 : 1 and the f32 fields read g_c7b640/g_c7b644
//   (runtime globals; 1.0f is file-backed .data).
// ---------------------------------------------------------------------------

export const EXIT_7384D0_OBJ_OFF = 0x18300;
export const EXIT_7384D0_ALLOC_SIZE = 0x7898;
export const EXIT_7384D0_182D0_OFF = 0x182d0;
export const EXIT_7384D0_182CC_OFF = 0x182cc;
export const EXIT_7384D0_18334_OFF = 0x18334;
export const EXIT_7384D0_MEMSET_BASE_OFF = 0x18338;
export const EXIT_7384D0_MEMSET_SIZE = 0x30;
export const EXIT_7384D0_18368_OFF = 0x18368;
export const EXIT_7384D0_1836C_OFF = 0x1836c;
export const EXIT_7384D0_188F8_OFF = 0x188f8;
export const EXIT_7384D0_182D0_VALUE = 0xffffffff;

export function exit7384d0OldObjectPresent(oldPtr) {
  return (oldPtr >>> 0) !== 0;
}

export function exit7384d0AllocSize() {
  return EXIT_7384D0_ALLOC_SIZE;
}

export function exit7384d0AllocOk(allocPtr) {
  return (allocPtr >>> 0) !== 0;
}

export function exit7384d0NewObjectValue(allocPtr, ctorReturn) {
  return (allocPtr >>> 0) !== 0 ? ctorReturn >>> 0 : 0;
}

export function exit7384d0Apply(view, thisBase, newObjValue) {
  const w = (o, v) =>
    view.setUint32(((thisBase >>> 0) + o) >>> 0, v >>> 0, true);
  // pack A1 (before the memset) in PE order: 0x0073854a..0x00738581
  w(EXIT_7384D0_OBJ_OFF, newObjValue);
  w(EXIT_7384D0_182D0_OFF, EXIT_7384D0_182D0_VALUE);
  w(EXIT_7384D0_182CC_OFF, 0);
  w(0x0, 0);
  w(0x4, 0);
  w(0xc, 0); // [this+8] is deliberately NOT cleared by the PE
  w(EXIT_7384D0_18334_OFF, 0);
  // memset @ 0x0073858b: 0x30 zero bytes at +0x18338
  const ms = ((thisBase >>> 0) + EXIT_7384D0_MEMSET_BASE_OFF) >>> 0;
  for (let i = 0; i < EXIT_7384D0_MEMSET_SIZE; i++) {
    view.setUint8(ms + i, 0);
  }
  // pack A2 (after the memset): 0x00738593..0x007385a7
  w(EXIT_7384D0_18368_OFF, 0);
  w(EXIT_7384D0_1836C_OFF, 0);
  view.setUint8(((thisBase >>> 0) + EXIT_7384D0_188F8_OFF) >>> 0, 0);
}

export const EXIT_408310_ARG0_OFF = 0;
export const EXIT_408310_STR_OFF = 8;
export const EXIT_408310_STR_SIZE_OFF = 0x10;
export const EXIT_408310_STR_CAP_OFF = 0x14;
export const EXIT_408310_EMPTY_CAP = 0xf;
export const EXIT_408310_TEMP_CTOR_FLAG = 1;
export const EXIT_408310_TEMP_EMPTY_FLAG = 2;
export const EXIT_408310_HOST_98_OFF = 0x98;
export const EXIT_408310_INVALID_PARAM_IAT = 0x00b18894;
export const EXIT_408310_GATE_C798E4_ADDR = 0x00c798e4;
export const EXIT_408310_FIELD_7C_CLEAR_VALUE = 6;
export const EXIT_408310_FIELD_7C_BITSET_VALUE = 1;
export const EXIT_408310_F32_ONE_BITS = 0x3f800000;
export const EXIT_408310_F30_OFF = 0x30;
export const EXIT_408310_F34_OFF = 0x34;
export const EXIT_408310_F38_OFF = 0x38;
export const EXIT_408310_F3C_OFF = 0x3c;
export const EXIT_408310_F40_OFF = 0x40;
export const EXIT_408310_F44_OFF = 0x44;
export const EXIT_408310_F48_OFF = 0x48;
export const EXIT_408310_F4C_OFF = 0x4c;
export const EXIT_408310_F50_OFF = 0x50;
export const EXIT_408310_F54_OFF = 0x54;
export const EXIT_408310_F58_OFF = 0x58;
export const EXIT_408310_F5C_OFF = 0x5c;
export const EXIT_408310_F60_OFF = 0x60;
export const EXIT_408310_F64_OFF = 0x64;
export const EXIT_408310_F68_OFF = 0x68;
export const EXIT_408310_F6C_OFF = 0x6c;
export const EXIT_408310_F70_OFF = 0x70;
export const EXIT_408310_F74_OFF = 0x74;
export const EXIT_408310_F78_OFF = 0x78;
export const EXIT_408310_F7C_OFF = 0x7c;
export const EXIT_408310_F80_OFF = 0x80;
export const EXIT_408310_F84_OFF = 0x84;
export const EXIT_408310_F88_OFF = 0x88;
export const EXIT_408310_F8C_OFF = 0x8c;
export const EXIT_408310_F90_OFF = 0x90;
export const EXIT_408310_F94_OFF = 0x94;

export function exit408310Flag(arg0) {
  return (arg0 >>> 0) !== 0 ? EXIT_408310_TEMP_CTOR_FLAG : EXIT_408310_TEMP_EMPTY_FLAG;
}

export function exit408310SetArg0(view, thisBase, arg0) {
  view.setUint32((thisBase >>> 0) + EXIT_408310_ARG0_OFF, arg0 >>> 0, true);
}

export function exit408310EmptyTemp(view, tempBase) {
  const t = tempBase >>> 0;
  view.setUint32(t + 0, 0, true);
  view.setUint32(t + EXIT_408310_STR_SIZE_OFF, 0, true);
  view.setUint32(t + EXIT_408310_STR_CAP_OFF, EXIT_408310_EMPTY_CAP, true);
}

export function exit408310TempReset(view, tempBase) {
  const t = tempBase >>> 0;
  view.setUint32(t + EXIT_408310_STR_SIZE_OFF, 0, true);
  view.setUint32(t + EXIT_408310_STR_CAP_OFF, EXIT_408310_EMPTY_CAP, true);
  view.setUint8(t + 0, 0);
}

export function exit408310AssignNeeded(dstAddr, srcBase) {
  return (dstAddr >>> 0) !== (srcBase >>> 0);
}

export function exit408310SrcDataAddr(srcBase, srcCap, srcDword0) {
  return (srcCap >>> 0) < 0x10 ? srcBase >>> 0 : srcDword0 >>> 0;
}

export function exit408310ArmFreeNeeded(flag, armMask, cap) {
  return ((flag & 0xff) & (armMask & 0xff)) !== 0 && (cap >>> 0) >= 0x10;
}

export function exit408310FreePtr(ptr, usesHeader, header) {
  return usesHeader ? header >>> 0 : ptr >>> 0;
}

export function exit408310FreeCount(cap, usesHeader) {
  const size = (cap + 1) >>> 0;
  return usesHeader ? (size + 0x23) >>> 0 : size;
}

export function exit408310AbortNeeded(usesHeader, offsetOk) {
  return usesHeader && !offsetOk;
}

export function exit408310Field7c(gC798e4) {
  return ((gC798e4 >>> 0) & 4) === 0
    ? EXIT_408310_FIELD_7C_CLEAR_VALUE
    : EXIT_408310_FIELD_7C_BITSET_VALUE;
}

export function exit408310GateC798e4Addr() {
  return EXIT_408310_GATE_C798E4_ADDR;
}

export function exit408310TailApply(view, thisBase, gC7b640, gC7b644, gC798e4) {
  const w = (o, v) => view.setUint32(((thisBase >>> 0) + o) >>> 0, v >>> 0, true);
  w(EXIT_408310_F30_OFF, 0);
  w(EXIT_408310_F34_OFF, EXIT_408310_F32_ONE_BITS);
  w(EXIT_408310_F38_OFF, EXIT_408310_F32_ONE_BITS);
  w(EXIT_408310_F3C_OFF, 0);
  w(EXIT_408310_F40_OFF, gC7b640);
  w(EXIT_408310_F44_OFF, gC7b644);
  w(EXIT_408310_F48_OFF, EXIT_408310_F32_ONE_BITS);
  w(EXIT_408310_F4C_OFF, EXIT_408310_F32_ONE_BITS);
  w(EXIT_408310_F50_OFF, EXIT_408310_F32_ONE_BITS);
  w(EXIT_408310_F54_OFF, EXIT_408310_F32_ONE_BITS);
  w(EXIT_408310_F58_OFF, 0);
  w(EXIT_408310_F5C_OFF, 0);
  w(EXIT_408310_F60_OFF, 0);
  w(EXIT_408310_F64_OFF, 0);
  w(EXIT_408310_F68_OFF, 0);
  w(EXIT_408310_F6C_OFF, 0);
  w(EXIT_408310_F70_OFF, 0);
  view.setUint8(((thisBase >>> 0) + EXIT_408310_F74_OFF) >>> 0, 1);
  w(EXIT_408310_F78_OFF, 0);
  w(EXIT_408310_F80_OFF, 7);
  w(EXIT_408310_F84_OFF, 1);
  w(EXIT_408310_F7C_OFF, exit408310Field7c(gC798e4));
  w(EXIT_408310_F88_OFF, 7);
  w(0x20, 0);
  w(0x24, 0);
  w(0x28, 0);
  w(0x2c, 0);
  w(EXIT_408310_F8C_OFF, 0);
  w(EXIT_408310_F90_OFF, gC7b640);
  w(EXIT_408310_F94_OFF, gC7b644);
}

export function exit408310Plan(
  arg0,
  dstAddr,
  tempBase,
  tempPtr,
  tempSize,
  tempCap,
  header,
) {
  const flag = exit408310Flag(arg0);
  const assignNeeded = exit408310AssignNeeded(dstAddr, tempBase);
  const srcData = exit408310SrcDataAddr(tempBase, tempCap, tempPtr);
  const freeSize = (tempCap + 1) >>> 0;
  const usesHeader = freeSize >= 0x1000;
  const offsetOk = ((tempPtr - header - 4) >>> 0) <= 0x1f;
  const arm1Gate = exit408310ArmFreeNeeded(flag, EXIT_408310_TEMP_EMPTY_FLAG, tempCap);
  const arm2Gate = exit408310ArmFreeNeeded(flag, EXIT_408310_TEMP_CTOR_FLAG, tempCap);
  return {
    arg0: arg0 >>> 0,
    dstAddr: dstAddr >>> 0,
    tempBase: tempBase >>> 0,
    flag,
    tempPtr: tempPtr >>> 0,
    tempSize: tempSize >>> 0,
    tempCap: tempCap >>> 0,
    assignNeeded,
    assignSrcData: srcData,
    assignCount: tempSize >>> 0,
    arm1FreeNeeded: arm1Gate,
    arm1FreePtr: arm1Gate ? exit408310FreePtr(tempPtr, usesHeader, header) : 0,
    arm1FreeCount: arm1Gate ? exit408310FreeCount(tempCap, usesHeader) : 0,
    arm1AbortNeeded: arm1Gate ? exit408310AbortNeeded(usesHeader, offsetOk) : false,
    arm2FreeNeeded: arm2Gate,
    arm2FreePtr: arm2Gate ? exit408310FreePtr(tempPtr, usesHeader, header) : 0,
    arm2FreeCount: arm2Gate ? exit408310FreeCount(tempCap, usesHeader) : 0,
    arm2AbortNeeded: arm2Gate ? exit408310AbortNeeded(usesHeader, offsetOk) : false,
    host98Addr: ((dstAddr >>> 0) + (EXIT_408310_HOST_98_OFF - EXIT_408310_STR_OFF)) >>> 0,
    invalidParamIat: EXIT_408310_INVALID_PARAM_IAT,
  };
}

// ===========================================================================
// ABI v33 — Game::Exit root typed continuation plan (PE 0x006fa0c0..0x006fa537)
// ===========================================================================
// The whole root body is PE-mapped; this section models its PURE control
// flow: every gate (byte vs full-dword exact), every ordered host event and
// every pure segment, as one typed plan. Derived from the instruction
// stream (section-notes/exit-v33/disasm-6fa0c0-root.txt), not from the C++.
//
// Entry:
//   0x006fa0d2 cmp byte [ebx+0x2658a],0 ; je ret4 @ 0x006fa531  (LOW-BYTE)
//   0x006fa0df push dword [ebp+8]       ; ShouldSave pushed RAW
//   0x006fa0e2 call 0x008650a0          ; prologue host
// SFX (this = Manager+0x2a324):
//   0x006fa0ed lea ecx,[ecx+0x2a324] ; 0x006fa0f3 call 0x0092e300
//   0x006fa109..0x006fa161 call 0x0092e230 x5, ids 0x256,0x257,0x258,0x259,0x3f0
// ItemOverlay force gate (FULL-dword state == 2):
//   0x006fa166 mov eax,[ebx+0x1c034] ; test eax,eax; je; cmp eax,2; jne
//   0x006fa17d call 0x009aca90 (exact ItemOverlay::Update, arg 1)
// Manager floats: 0x006fa19a/0x006fa1a4 [mgr+0x2a2d0/0x2a2d4] <- 0x3f800000
// 0x007df690 receiver: 0x006fa190 imul eax,[mgr+0x29fbc],0x184; 0x006fa1ae
//   add ecx,0x29fc0; 0x006fa1b4 add ecx,eax  -> mgr+0x29fc0+count*0x184 (wrap)
// PGD flush (0x006fa1c4): byte [mgr+0x14] != 0 && byte [+0x14+0xf8c] != 0
//   -> clear BYTE [mgr+0x14]=0; host 0x009292c0; SteamInternal_ContextInit
//   via IAT [0x00b18a1c] (arg 0x00c5c3a4); gate: FULL-dword [eax] != 0
//   (0x006fa1f0) && byte [mgr+0x2a3a4] != 0 -> host 0x00928ee0 (exact
//   SaveToSteamCloud) else host 0x009294f0.
// GameState IO (0x006fa20e): byte [game+0x2658b] == 0 -> byte ShouldSave
//   != 0 ? host 0x00958ed0 : host 0x00959130.
// Pure teardown T0 (0x2510c/0x2593c) -> host 0x008d26c0 (this=+0x25108,0,0)
//   -> T1 (0x25948/0x2590c/0x1d520) -> ANM2::Reset#1 (this=+0x1d528)
//   -> T2 (0x1d654) -> vector dtor loop (host 0x0040d040, this=elem+8,
//   stride 0x38, count=(end-begin)/0x38) -> pure end<-begin (re-read)
//   -> byte [0x25954]=0 -> host 0x006f43b0 -> host 0x00a112c0 (log)
//   -> byte [mgr+0x15]=0 -> post-log pure pack -> ANM2::Reset#2 (this=
//   +0x1c03c) -> ANM2::Reset#3 (this=+0x1d1d8) -> overlay state clear
//   (0x1c034/0x1c038) -> host 0x00421260 (this=+0x1d2ec) -> 18990 nest
//   -> hosts 0x00686950/0x007384d0/0x009b9150/0x009a27d0/0x009a19a0/
//   0x0040e910 -> map walk @ Game+0x1a738 -> host 0x009b5cb0 (this=
//   +0x23a74) -> terminal dword [0x265c0]=0 + word [0x2658a]=0.
// ---------------------------------------------------------------------------

export const EXIT_ROOT_SESSION_ACTIVE_OFF = 0x2658a;
export const EXIT_ROOT_TERMINAL_CTR_OFF = 0x265c0;
export const EXIT_ROOT_MGR_F_2A2D0_OFF = 0x2a2d0;
export const EXIT_ROOT_MGR_F_2A2D4_OFF = 0x2a2d4;
export const EXIT_ROOT_SFX_RECEIVER_OFF = 0x2a324;
export const EXIT_ROOT_SFX_STOP_IDS = [0x256, 0x257, 0x258, 0x259, 0x3f0];
export const EXIT_ROOT_7DF690_BASE_OFF = 0x29fc0;
export const EXIT_ROOT_7DF690_INDEX_OFF = 0x29fbc;
export const EXIT_ROOT_7DF690_STRIDE = 0x184;
export const EXIT_ROOT_PGD_CHANGES_OFF = 0x14;
export const EXIT_ROOT_PGD_FILE_LOADED_DELTA = 0xf8c;
export const EXIT_ROOT_PGD_READONLY_OFF = 0x15;
export const EXIT_ROOT_MGR_CLOUD_2A3A4_OFF = 0x2a3a4;
export const EXIT_ROOT_STEAM_CTX_IAT = 0x00b18a1c;
export const EXIT_ROOT_STEAM_CTX_ARG = 0x00c5c3a4;
export const EXIT_ROOT_GAMESTATE_SKIP_OFF = 0x2658b;
export const EXIT_ROOT_ANM2_RESET_THIS_OFFS = [0x1d528, 0x1c03c, 0x1d1d8];
export const EXIT_ROOT_VECTOR_BEGIN_OFF = 0x25ebc;
export const EXIT_ROOT_VECTOR_END_OFF = 0x25ec0;
export const EXIT_ROOT_8D26C0_THIS_OFF = 0x25108;
export const EXIT_ROOT_MAP_BASE_OFF = 0x1a738;
export const EXIT_ROOT_EVENT_HOST = 1;
export const EXIT_ROOT_EVENT_PURE = 2;
export const EXIT_ROOT_EVENT_VECTOR_DTOR_LOOP = 3;
export const EXIT_ROOT_EVENT_MAP_WALK = 4;
export const EXIT_ROOT_SEG_MANAGER_FLOATS = 1;
export const EXIT_ROOT_SEG_PGD_CHANGES_CLEAR = 2;
export const EXIT_ROOT_SEG_TEARDOWN_T0 = 3;
export const EXIT_ROOT_SEG_TEARDOWN_T1 = 4;
export const EXIT_ROOT_SEG_TEARDOWN_T2 = 5;
export const EXIT_ROOT_SEG_VECTOR_CLEAR_END = 6;
export const EXIT_ROOT_SEG_BYTE_25954 = 7;
export const EXIT_ROOT_SEG_PGD_READONLY = 8;
export const EXIT_ROOT_SEG_POSTLOG_PACK = 9;
export const EXIT_ROOT_SEG_OVERLAY_STATE = 10;
export const EXIT_ROOT_SEG_RESIDUAL_18990 = 11;
export const EXIT_ROOT_SEG_MAP_FLAG_28 = 12;
export const EXIT_ROOT_SEG_TERMINAL = 13;
export const EXIT_ROOT_EVENT_CAP = 48;

const evWord = (kind, payload) => ((kind << 24) | ((payload >>> 0) & 0xffffff)) >>> 0;
const evHost = (va) => evWord(EXIT_ROOT_EVENT_HOST, va);
const evPure = (seg) => evWord(EXIT_ROOT_EVENT_PURE, seg);

/** Host 0x007df690 receiver: mgr + 0x29fc0 + count*0x184 (32-bit wrap). */
export function exitRoot7df690Receiver(managerBase, count29fbc) {
  return (
    ((managerBase >>> 0) + EXIT_ROOT_7DF690_BASE_OFF +
      ((count29fbc >>> 0) * EXIT_ROOT_7DF690_STRIDE)) >>>
    0
  );
}

/** ANM2::Reset this offsets: [0x1d528, 0x1c03c, 0x1d1d8], OOB -> 0. */
export function exitRootAnm2ResetThisOffAt(index) {
  const i = index >>> 0;
  if (i >= EXIT_ROOT_ANM2_RESET_THIS_OFFS.length) return 0;
  return EXIT_ROOT_ANM2_RESET_THIS_OFFS[i] >>> 0;
}
export function exitRootAnm2ResetCount() {
  return EXIT_ROOT_ANM2_RESET_THIS_OFFS.length;
}

/** Fallback SFX stop id table (shared with exitSfxStopIdAt). */
export function exitRootSfxStopCount() {
  return EXIT_SFX_STOP_COUNT;
}

/**
 * Pure root control flow — the typed continuation plan for the whole
 * Game::Exit body. Returns the same scalar layout as the Wasm struct plus
 * the ordered event word array; entry-inactive yields an empty plan.
 */
export function exitRootPlan(
  shouldSave,
  sessionActive2658a,
  overlayState1c034,
  mgrChangesmade14,
  mgrFileLoadedf8c,
  steamCtxWord,
  mgrCloud2a3a4,
  skipGamestateIo2658b,
  mgrCount29fbc,
  vectorBegin,
  vectorEnd,
  setIndex7d8,
) {
  const events = [];
  const push = (w) => {
    if (events.length < EXIT_ROOT_EVENT_CAP) events.push(w >>> 0);
  };

  const entryActive = ((sessionActive2658a | 0) & 0xff) !== 0;
  if (!entryActive) {
    return {
      entryActive: false,
      shouldSave: shouldSave >>> 0,
      overlayForceNeeded: false,
      sfxStopCount: 0,
      sfxReceiverOff: EXIT_ROOT_SFX_RECEIVER_OFF,
      mgrHost7df690Receiver: exitRoot7df690Receiver(0, mgrCount29fbc),
      pgdFlushNeeded: false,
      pgdSaveCloud: false,
      gamestateIoNeeded: false,
      gamestateShouldWrite: false,
      anm2ResetCount: 0,
      anm2ResetThisOff: [EXIT_ROOT_ANM2_RESET_THIS_OFFS[0], EXIT_ROOT_ANM2_RESET_THIS_OFFS[1], EXIT_ROOT_ANM2_RESET_THIS_OFFS[2]],
      vectorDtorCount: 0,
      host8d26c0Needed: 0,
      eventCount: 0,
      events: new Array(EXIT_ROOT_EVENT_CAP).fill(0),
    };
  }

  // Fixed ordered plan (all gate-independent events and pure segments).
  push(evHost(0x008650a0));                      // 1 prologue
  push(evHost(0x0092e300));                      // 2 SFX walk
  for (let i = 0; i < EXIT_SFX_STOP_COUNT; i++) push(evHost(0x0092e230)); // 3-7 stops
  if ((overlayState1c034 >>> 0) === 2) push(evHost(0x009aca90)); // 8 overlay
  push(evPure(EXIT_ROOT_SEG_MANAGER_FLOATS));   // floats
  push(evHost(0x007df690));                      // mgr host
  if (exitPgdFlushNeeded(mgrChangesmade14, mgrFileLoadedf8c)) {
    push(evPure(EXIT_ROOT_SEG_PGD_CHANGES_CLEAR));
    push(evHost(0x009292c0));
    push(evHost(EXIT_ROOT_STEAM_CTX_IAT));
    const cloud = exitPgdSaveUsesCloud(steamCtxWord, mgrCloud2a3a4);
    push(evHost(cloud ? 0x00928ee0 : 0x009294f0));
  }
  if (exitGamestateIoNeeded(skipGamestateIo2658b)) {
    push(evHost(exitGamestateShouldWrite(shouldSave) ? 0x00958ed0 : 0x00959130));
  }
  push(evPure(EXIT_ROOT_SEG_TEARDOWN_T0));
  // v34: the Exit site pushes index 0 (0x006fa22b) and force 0
  // (0x006fa229). The callee is then a censused complete no-op -- zero
  // stores, zero calls -- exactly when the receiver's current set index is
  // already 0, so the host event is dropped on that arm only.
  const host8d26c0Needed = exitRoot8d26c0HostNeeded(setIndex7d8);
  if (host8d26c0Needed) push(evHost(0x008d26c0));
  push(evPure(EXIT_ROOT_SEG_TEARDOWN_T1));
  push(evHost(0x00407f10));
  push(evPure(EXIT_ROOT_SEG_TEARDOWN_T2));
  const dtorCount = exitVector25ebcElementCount(vectorBegin, vectorEnd);
  if (dtorCount > 0) push(evWord(EXIT_ROOT_EVENT_VECTOR_DTOR_LOOP, dtorCount));
  push(evPure(EXIT_ROOT_SEG_VECTOR_CLEAR_END));
  push(evPure(EXIT_ROOT_SEG_BYTE_25954));
  push(evHost(0x006f43b0));
  push(evHost(0x00a112c0));
  push(evPure(EXIT_ROOT_SEG_PGD_READONLY));
  push(evPure(EXIT_ROOT_SEG_POSTLOG_PACK));
  push(evHost(0x00407f10)); // ANM2::Reset #2 (+0x1c03c)
  push(evHost(0x00407f10)); // ANM2::Reset #3 (+0x1d1d8)
  push(evPure(EXIT_ROOT_SEG_OVERLAY_STATE));
  push(evHost(0x00421260));
  push(evPure(EXIT_ROOT_SEG_RESIDUAL_18990));
  push(evHost(0x00686950));
  push(evHost(0x007384d0));
  push(evHost(0x009b9150));
  push(evHost(0x009a27d0));
  push(evHost(0x009a19a0));
  push(evHost(0x0040e910));
  push(evWord(EXIT_ROOT_EVENT_MAP_WALK, 0));
  push(evHost(0x009b5cb0));
  push(evPure(EXIT_ROOT_SEG_TERMINAL));

  const eventsArr = new Array(EXIT_ROOT_EVENT_CAP).fill(0);
  for (let i = 0; i < events.length; i++) eventsArr[i] = events[i];

  return {
    entryActive: true,
    shouldSave: shouldSave >>> 0,
    overlayForceNeeded: (overlayState1c034 >>> 0) === 2,
    sfxStopCount: EXIT_SFX_STOP_COUNT,
    sfxReceiverOff: EXIT_ROOT_SFX_RECEIVER_OFF,
    mgrHost7df690Receiver: exitRoot7df690Receiver(0, mgrCount29fbc),
    // C++ semantics: pgd_save_cloud / gamestate_should_write are only
    // populated when their gates are open (the C++ zero-fills the plan and
    // sets them inside the flush / IO branches); likewise pgd_flush_needed
    // and gamestate_io_needed are 1 only when the gate opens.
    pgdFlushNeeded: exitPgdFlushNeeded(mgrChangesmade14, mgrFileLoadedf8c) ? 1 : 0,
    pgdSaveCloud: exitPgdFlushNeeded(mgrChangesmade14, mgrFileLoadedf8c)
      ? (exitPgdSaveUsesCloud(steamCtxWord, mgrCloud2a3a4) ? 1 : 0)
      : 0,
    gamestateIoNeeded: exitGamestateIoNeeded(skipGamestateIo2658b) ? 1 : 0,
    gamestateShouldWrite: exitGamestateIoNeeded(skipGamestateIo2658b)
      ? (exitGamestateShouldWrite(shouldSave) ? 1 : 0)
      : 0,
    anm2ResetCount: EXIT_ROOT_ANM2_RESET_THIS_OFFS.length,
    anm2ResetThisOff: [...EXIT_ROOT_ANM2_RESET_THIS_OFFS],
    vectorDtorCount: dtorCount,
    host8d26c0Needed: host8d26c0Needed ? 1 : 0,
    eventCount: events.length,
    events: eventsArr,
  };
}

/* =====================================================================
   ABI v34 -- 0x008d26c0, the set-index step rescaler.

   Deliberately NOT shaped like the C++. The C++ is a branch cascade; this
   is a PC-walk trace interpreter over a transcribed instruction table.
   Each entry is (va, effect) where the effect mutates a tiny machine
   {regs, flags, mem, calls, stores} and returns the next PC (or null to
   fall through to the following entry). The answer is then DERIVED from
   the ordered effect census, not from a mirrored if/else -- so a wrong
   branch in one implementation cannot be reproduced by the other.
   ===================================================================== */

export const EXIT_8D26C0_VEC_BEGIN_OFF = 0x7cc;
export const EXIT_8D26C0_VEC_END_OFF = 0x7d0;
export const EXIT_8D26C0_SET_INDEX_OFF = 0x7d8;
export const EXIT_8D26C0_FRAME_OFF = 0x834;
export const EXIT_8D26C0_STEP_OFF = 0x838;
export const EXIT_8D26C0_ELEM_STRIDE = 0xc;
export const EXIT_8D26C0_ELEM_LO_OFF = 0;
export const EXIT_8D26C0_ELEM_HI_OFF = 4;
export const EXIT_8D26C0_SUB_SHIFT = 2;
export const EXIT_8D26C0_DIV_MAGIC = 0x2aaaaaab;
export const EXIT_8D26C0_F32_360_BITS = 0x43b40000;
export const EXIT_8D26C0_F32_HALF_BITS = 0x3f000000;
export const EXIT_8D26C0_U32_FIXUP_ADDR = 0x00bacb00;
export const EXIT_8D26C0_LOG_VA = 0x00a112c0;
export const EXIT_8D26C0_LOG_LEVEL = 8;
export const EXIT_8D26C0_LOG_FMT_ADDR = 0x00b758b8;
export const EXIT_8D26C0_CVTTSS2SI_INDEFINITE = 0x80000000;
export const EXIT_8D26C0_STACK_ARG_BYTES = 8;
export const EXIT_8D26C0_ARM_NOOP = 0;
export const EXIT_8D26C0_ARM_INVALID = 1;
export const EXIT_8D26C0_ARM_APPLY = 2;
export const EXIT_8D26C0_APPLY_STORE_COUNT = 3;

const F32_SCRATCH = new DataView(new ArrayBuffer(8));

function f32FromBits(bits) {
  F32_SCRATCH.setUint32(0, bits >>> 0, true);
  return F32_SCRATCH.getFloat32(0, true);
}

function bitsFromF32(value) {
  F32_SCRATCH.setFloat32(0, value, true);
  return F32_SCRATCH.getUint32(0, true);
}

/** x86 CVTTSS2SI: integer indefinite on NaN / inf / out of int32 range. */
function cvttss2si(value) {
  if (Number.isNaN(value)) return EXIT_8D26C0_CVTTSS2SI_INDEFINITE | 0;
  if (!(value >= -2147483648) || !(value < 2147483648)) {
    return EXIT_8D26C0_CVTTSS2SI_INDEFINITE | 0;
  }
  return Math.trunc(value) | 0;
}

/**
 * Transcribed instruction table for 0x008d26c0. Every entry carries the
 * real VA so a reader can diff it against the listing line by line.
 * `m` is the machine; a handler returns the next PC or undefined.
 */
const TRACE_8D26C0 = [
  // 0x008d26c5  mov esi, [ebp+8]        (index)
  [0x008d26c5, (m) => { m.esi = m.argIndex >>> 0; }],
  // 0x008d26c9  mov edi, ecx            (this)
  [0x008d26c9, (m) => { m.edi = 1; }],
  // 0x008d26cb  cmp esi, [edi+0x7d8]    FULL dword
  [0x008d26cb, (m) => { m.zf = (m.esi >>> 0) === (m.curIndex >>> 0); }],
  // 0x008d26d1  jne 0x8d26dd
  [0x008d26d1, (m) => (m.zf ? undefined : 0x008d26dd)],
  // 0x008d26d3  cmp byte ptr [ebp+0xc], 0   LOW BYTE ONLY
  [0x008d26d3, (m) => { m.zf = ((m.argForce >>> 0) & 0xff) === 0; }],
  // 0x008d26d7  je 0x8d277e   -> epilogue, nothing else runs
  [0x008d26d7, (m) => (m.zf ? 0x008d277e : undefined)],
  // 0x008d26dd  mov ecx,[edi+0x7d0] / mov ebx,[edi+0x7cc] / sub ecx,ebx
  [0x008d26dd, (m) => { m.ebx = m.vecBegin >>> 0; m.ecx = (m.vecEnd - m.vecBegin) | 0; }],
  // 0x008d26e3..0x008d26f9  MSVC SIGNED magic division by 0xc
  [0x008d26f0, (m) => {
    const product = BigInt(EXIT_8D26C0_DIV_MAGIC) * BigInt(m.ecx | 0);
    const high = Number(BigInt.asIntN(32, product >> 32n)) | 0; // edx
    const shifted = high >> 1;                                  // sar edx,1
    m.eax = ((shifted + (shifted >>> 31)) | 0);                 // shr/add
  }],
  // 0x008d26fb cmp esi,eax / 0x008d26fd jae -> UNSIGNED
  [0x008d26fd, (m) => ((m.esi >>> 0) >= (m.eax >>> 0) ? 0x008d276e : undefined)],
  // 0x008d2702  mov [edi+0x7d8], esi          STORE 1
  [0x008d2702, (m) => { m.stores.push([EXIT_8D26C0_SET_INDEX_OFF, m.esi >>> 0]); }],
  // 0x008d2708/0x008d270c/0x008d2717  ecx = ([elem+4]-[elem]) sar 2
  [0x008d2708, (m) => { m.ecx = ((m.elemHi - m.elemLo) | 0) >> EXIT_8D26C0_SUB_SHIFT; }],
  // 0x008d271a..0x008d2745  the float chain; OLD step read before STORE 2
  [0x008d271a, (m) => {
    let widened = m.ecx | 0;                            // cvtdq2pd (signed)
    if ((m.ecx >>> 31) !== 0) widened += 4294967296;    // addsd fixup table
    const denominator = Math.fround(widened);           // cvtpd2ps
    m.newStepBits = bitsFromF32(
      Math.fround(f32FromBits(EXIT_8D26C0_F32_360_BITS) / denominator));
    let scaled = Math.fround(m.oldFrame | 0);           // cvtdq2ps
    scaled = Math.fround(scaled * f32FromBits(m.oldStepBits));       // mulss
    scaled = Math.fround(scaled / f32FromBits(m.newStepBits));       // divss
    scaled = Math.fround(scaled + f32FromBits(EXIT_8D26C0_F32_HALF_BITS));
    m.newFrame = cvttss2si(scaled);                     // cvttss2si
  }],
  // 0x008d274d  movss [edi+0x838], xmm1       STORE 2
  [0x008d274d, (m) => { m.stores.push([EXIT_8D26C0_STEP_OFF, m.newStepBits >>> 0]); }],
  // 0x008d2761  mov [edi+0x834], eax          STORE 3
  [0x008d2761, (m) => { m.stores.push([EXIT_8D26C0_FRAME_OFF, m.newFrame >>> 0]); }],
  // 0x008d276b  ret 8
  [0x008d276b, () => 0x7fffffff],
  // 0x008d276e  push esi / push 0xb758b8 / push 8 / call 0xa112c0
  [0x008d276e, (m) => {
    m.calls.push({ va: EXIT_8D26C0_LOG_VA, level: EXIT_8D26C0_LOG_LEVEL,
      fmt: EXIT_8D26C0_LOG_FMT_ADDR, arg: m.esi >>> 0 });
  }],
  // 0x008d277e  pop edi/esi/ebx/ebp ; ret 8
  [0x008d277e, () => 0x7fffffff],
];

/** Walk the transcribed table; return the ordered effect census. */
function trace8d26c0(input) {
  const m = {
    argIndex: input.index >>> 0, argForce: input.force >>> 0,
    curIndex: input.curIndex >>> 0, vecBegin: input.vecBegin >>> 0,
    vecEnd: input.vecEnd >>> 0, elemLo: input.elemLo >>> 0,
    elemHi: input.elemHi >>> 0, oldFrame: input.oldFrame | 0,
    oldStepBits: input.oldStepBits >>> 0,
    eax: 0, ebx: 0, ecx: 0, esi: 0, edi: 0, zf: false,
    newStepBits: 0, newFrame: 0, stores: [], calls: [],
  };
  let i = 0;
  let guard = 0;
  while (i < TRACE_8D26C0.length) {
    if (++guard > 64) throw new Error("trace8d26c0 did not terminate");
    const [, handler] = TRACE_8D26C0[i];
    const next = handler(m);
    if (next === undefined) { i += 1; continue; }
    if (next === 0x7fffffff) break;
    const target = TRACE_8D26C0.findIndex(([va]) => va === next);
    if (target < 0) throw new Error(`trace8d26c0 bad jump target 0x${next.toString(16)}`);
    i = target;
  }
  return m;
}

export function exit8d26c0IsNoop(index, curIndex, force) {
  return (index >>> 0) === (curIndex >>> 0) && ((force >>> 0) & 0xff) === 0;
}

export function exit8d26c0ElementCount(begin, end) {
  const delta = (end - begin) | 0;
  const product = BigInt(EXIT_8D26C0_DIV_MAGIC) * BigInt(delta);
  const high = Number(BigInt.asIntN(32, product >> 32n)) | 0;
  const shifted = high >> 1;
  return (shifted + (shifted >>> 31)) | 0;
}

export function exit8d26c0IndexValid(index, count) {
  return (index >>> 0) < (count >>> 0);
}

export function exit8d26c0ElementAddr(begin, index) {
  return ((begin >>> 0) + Math.imul(index >>> 0, EXIT_8D26C0_ELEM_STRIDE)) >>> 0;
}

export function exit8d26c0SubCount(elemLo, elemHi) {
  return ((elemHi - elemLo) | 0) >> EXIT_8D26C0_SUB_SHIFT;
}

export function exit8d26c0StepBits(subCount) {
  let widened = subCount | 0;
  if ((subCount >>> 31) !== 0) widened += 4294967296;
  const denominator = Math.fround(widened);
  return bitsFromF32(
    Math.fround(f32FromBits(EXIT_8D26C0_F32_360_BITS) / denominator));
}

export function exit8d26c0FrameFrom(oldFrame, oldStepBits, newStepBits) {
  let scaled = Math.fround(oldFrame | 0);
  scaled = Math.fround(scaled * f32FromBits(oldStepBits));
  scaled = Math.fround(scaled / f32FromBits(newStepBits));
  scaled = Math.fround(scaled + f32FromBits(EXIT_8D26C0_F32_HALF_BITS));
  return cvttss2si(scaled);
}

/**
 * The plan, DERIVED from the trace's effect census rather than restated.
 * arm comes from what the walk actually did: a logger call means INVALID,
 * three stores mean APPLY, neither means the body was a complete no-op.
 */
export function exit8d26c0Plan(
  index, force, curIndex, vecBegin, vecEnd, elemLo, elemHi, oldFrame,
  oldStepBits,
) {
  const m = trace8d26c0({ index, force, curIndex, vecBegin, vecEnd, elemLo,
    elemHi, oldFrame, oldStepBits });
  const logged = m.calls.find((c) => c.va === EXIT_8D26C0_LOG_VA);
  const storeMap = new Map(m.stores);
  let arm = EXIT_8D26C0_ARM_NOOP;
  if (logged) arm = EXIT_8D26C0_ARM_INVALID;
  else if (m.stores.length > 0) arm = EXIT_8D26C0_ARM_APPLY;
  const reached = arm !== EXIT_8D26C0_ARM_NOOP;
  return {
    arm,
    elementCount: reached ? (m.eax | 0) : 0,
    indexValid: arm === EXIT_8D26C0_ARM_APPLY ? 1 : 0,
    elementAddr: arm === EXIT_8D26C0_ARM_APPLY
      ? exit8d26c0ElementAddr(vecBegin, index) : 0,
    subCount: arm === EXIT_8D26C0_ARM_APPLY ? (m.ecx | 0) : 0,
    newStepBits: arm === EXIT_8D26C0_ARM_APPLY
      ? (storeMap.get(EXIT_8D26C0_STEP_OFF) >>> 0) : 0,
    newFrame: arm === EXIT_8D26C0_ARM_APPLY
      ? (storeMap.get(EXIT_8D26C0_FRAME_OFF) | 0) : 0,
    storeCount: m.stores.length,
    logNeeded: logged ? 1 : 0,
    logLevel: logged ? logged.level : 0,
    logFmtAddr: logged ? logged.fmt : 0,
    logArg: logged ? logged.arg >>> 0 : 0,
    // Ordered store census, for a test that wants PE order not just values.
    storeOrder: m.stores.map(([off]) => off),
  };
}

/** Linear-memory apply over the receiver; writes only on the APPLY arm. */
export function exit8d26c0Apply(view, thisOff, index, force, elemLo, elemHi) {
  const base = thisOff >>> 0;
  const plan = exit8d26c0Plan(
    index, force,
    view.getUint32(base + EXIT_8D26C0_SET_INDEX_OFF, true),
    view.getUint32(base + EXIT_8D26C0_VEC_BEGIN_OFF, true),
    view.getUint32(base + EXIT_8D26C0_VEC_END_OFF, true),
    elemLo, elemHi,
    view.getInt32(base + EXIT_8D26C0_FRAME_OFF, true),
    view.getUint32(base + EXIT_8D26C0_STEP_OFF, true),
  );
  if (plan.arm !== EXIT_8D26C0_ARM_APPLY) return plan.arm;
  view.setUint32(base + EXIT_8D26C0_SET_INDEX_OFF, index >>> 0, true);
  view.setUint32(base + EXIT_8D26C0_STEP_OFF, plan.newStepBits >>> 0, true);
  view.setUint32(base + EXIT_8D26C0_FRAME_OFF, plan.newFrame >>> 0, true);
  return plan.arm;
}

/** Root drop gate: the Exit site's index and force are both 0. */
export function exitRoot8d26c0HostNeeded(curIndex) {
  return exit8d26c0IsNoop(0, curIndex, 0) ? 0 : 1;
}

/* ===========================================================================
   ABI v35 -- Game::Exit map walk continuation (PE 0x006fa457-0x006fa50a).

   This is INLINE code in Game::Exit (not a callee), so the oracle is a
   PC-walk trace interpreter over a transcribed instruction table, exactly
   like TRACE_8D26C0: every entry carries its real VA, effects mutate a tiny
   machine {regs, mem, events, calls, stores}, and the plan is DERIVED from
   the effect census. The C++ is a straight branch loop; a wrong branch in
   one implementation cannot be reproduced by the other.

   The find call at 0x006fa47c dispatches to the v11 pure-complete find
   oracle (exitMapFind69d690) -- its own instruction range was transcribed
   and verified at ABI v11; this section only governs the WALK around it.
   The inline iterator++ at 0x006fa4c1-0x006fa504 is transcribed here too,
   and a separate function form (exitRootMapWalkNext) is cross-asserted
   against the freestanding 0x00414a80 (exitTreeIteratorNext).
   =========================================================================== */

export const EXIT_ROOT_MAP_WALK_EVENT_CAP = 64;
export const EXIT_ROOT_MAP_WALK_NODE_CAP = 64;
export const EXIT_ROOT_MAP_WALK_KIND_ELEM_HOST = 5;
export const EXIT_ROOT_MAP_WALK_KIND_GLOBAL_HOST = 6;
export const EXIT_ROOT_MAP_WALK_KIND_FLAG_CLEAR = 8;
export const EXIT_ROOT_MAP_WALK_ELEM_HOST_VA = 0x0040c7f0;
export const EXIT_ROOT_MAP_WALK_GLOBAL_VA = 0x0040e910;
export const EXIT_ROOT_MAP_WALK_FIND_VA = 0x0069d690;

const evWalkWord = (kind, payload) =>
  ((kind << 24) | ((payload >>> 0) & 0xffffff)) >>> 0;

/** PE @ 0x006fa488: cmp byte ptr [eax+0x28],0 -- LOW-BYTE test. */
export function exitRootMapWalkFlagActive(flag28) {
  return ((flag28 | 0) & 0xff) !== 0;
}

/** PE @ 0x006fa4a2: lea ecx,[edi+0x18] -- 0x0040c7f0 receiver (wrap). */
export function exitRootMapWalkElemHostThis(elemAddr) {
  return ((elemAddr >>> 0) + EXIT_MAP_ELEM_HOST_OFF) >>> 0;
}

/** PE @ 0x006fa4b8: mov byte [eax+0x28],0 -- flag address (wrap). */
export function exitRootMapWalkFlagAddr(foundAddr) {
  return ((foundAddr >>> 0) + EXIT_MAP_NODE_FLAG_OFF) >>> 0;
}

export function exitRootMapWalkElemHostVa() {
  return EXIT_ROOT_MAP_WALK_ELEM_HOST_VA >>> 0;
}
export function exitRootMapWalkGlobalVa() {
  return EXIT_ROOT_MAP_WALK_GLOBAL_VA >>> 0;
}
export function exitRootMapWalkFindVa() {
  return EXIT_ROOT_MAP_WALK_FIND_VA >>> 0;
}

/**
 * Function form of the INLINE iterator++ (PE 0x006fa4c1-0x006fa504).
 * Same algorithm as 0x00414a80; the tests cross-assert the two agree.
 */
export function exitRootMapWalkNext(view, nodeAddr) {
  const node = nodeAddr >>> 0;
  if (node === 0) return 0;
  const right = loadU32View(view, node + EXIT_TREE_RIGHT_OFF);
  if (loadIsnilView(view, right) !== 0) {
    let cur = node;
    let parent = loadU32View(view, cur + EXIT_TREE_PARENT_OFF);
    if (loadIsnilView(view, parent) === 0) {
      while ((cur >>> 0) === (loadU32View(view, parent + EXIT_TREE_RIGHT_OFF) >>> 0)) {
        cur = parent;
        parent = loadU32View(view, cur + EXIT_TREE_PARENT_OFF);
        if (loadIsnilView(view, parent) !== 0) break;
      }
    }
    return parent >>> 0;
  }
  let walk = right;
  let left = loadU32View(view, walk + EXIT_TREE_LEFT_OFF);
  while (loadIsnilView(view, left) === 0) {
    walk = left;
    left = loadU32View(view, walk + EXIT_TREE_LEFT_OFF);
  }
  return walk >>> 0;
}

/**
 * Transcribed instruction table for the walk. `m` is the machine; a
 * handler returns the next PC or undefined to fall through. 0x7fffffff is
 * the end sentinel (matches TRACE_8D26C0).
 */
const TRACE_MAP_WALK = [
  // 0x006fa457 mov edi,[map]            (sentinel, read once)
  [0x006fa457, (m) => { m.edi = m.sentinel0; }],
  // 0x006fa463 mov esi,[edi]            (first node)
  [0x006fa463, (m) => { m.esi = loadU32View(m.view, m.edi); }],
  // 0x006fa465 mov [ebp+8],esi          (saved node)
  [0x006fa465, (m) => { m.frame8 = m.esi; }],
  // 0x006fa468 cmp esi,edi / 0x006fa46a je -> walk skipped
  [0x006fa468, (m) => { m.zf = (m.esi >>> 0) === (m.edi >>> 0); }],
  [0x006fa46a, (m) => (m.zf ? 0x7fffffff : undefined)],
  // 0x006fa470 mov ebx,eax              (map ptr; runs ONCE per walk --
  // the loop-back at 0x006fa50a targets 0x006fa472, so the iteration
  // census lives at the loop head, matching the C++ outer-iteration count)
  [0x006fa470, (m) => { m.ebx = m.mapAddr; }],
  // 0x006fa472 lea eax,[esi+0x10]       (key)
  [0x006fa472, (m) => { m.nodeCount += 1; m.eax = (m.esi + EXIT_MAP_NODE_KEY_OFF) >>> 0; }],
  // 0x006fa475 mov ecx,ebx
  [0x006fa475, (m) => { m.ecx = m.ebx; }],
  // 0x006fa477 push eax / 0x006fa47b push [ebp-4] slot
  [0x006fa47b, (m) => { m.outArg = m.outSlot; }],
  // 0x006fa47c call 0x69d690  (pure find; writes out slot)
  [0x006fa47c, (m) => {
    exitMapFind69d690(m.view, m.mapAddr, m.outSlot, m.eax);
    m.calls.push({ va: EXIT_ROOT_MAP_WALK_FIND_VA, thisPtr: m.mapAddr });
  }],
  // 0x006fa481 mov eax,[ebp-4]          (found)
  [0x006fa481, (m) => { m.eax = loadU32View(m.view, m.outSlot); }],
  // 0x006fa484 cmp eax,edi (sentinel0) / 0x006fa486 je 0x6fa4bc
  [0x006fa484, (m) => { m.zf = (m.eax >>> 0) === (m.edi >>> 0); }],
  [0x006fa486, (m) => (m.zf ? 0x006fa4bc : undefined)],
  // 0x006fa488 cmp byte [eax+0x28],0 / 0x006fa48c je 0x6fa4bc
  [0x006fa488, (m) => { m.zf = (m.view.getUint8((m.eax + EXIT_MAP_NODE_FLAG_OFF) >>> 0)) === 0; }],
  [0x006fa48c, (m) => (m.zf ? 0x006fa4bc : undefined)],
  // 0x006fa48e mov edi,[eax+0x44] (elem begin) / 0x006fa491 cmp edi,[eax+0x48]
  [0x006fa48e, (m) => { m.edi = loadU32View(m.view, (m.eax + EXIT_MAP_NODE_BEGIN_OFF) >>> 0); }],
  [0x006fa491, (m) => { m.zf = (m.edi >>> 0) === loadU32View(m.view, (m.eax + EXIT_MAP_NODE_END_OFF) >>> 0); }],
  // 0x006fa494 je 0x6fa4b8
  [0x006fa494, (m) => (m.zf ? 0x006fa4b8 : undefined)],
  // 0x006fa496 mov esi,eax              (esi = found)
  [0x006fa496, (m) => { m.esi = m.eax; }],
  // 0x006fa4a0 push 0 / 0x006fa4a2 lea ecx,[edi+0x18]
  [0x006fa4a2, (m) => { m.ecx = (m.edi + EXIT_MAP_ELEM_HOST_OFF) >>> 0; }],
  // 0x006fa4a5 call 0x40c7f0            (host event; this = elem+0x18)
  [0x006fa4a5, (m) => {
    m.pushEvent(EXIT_ROOT_MAP_WALK_KIND_ELEM_HOST, m.ecx);
    m.elemHostCount += 1;
    m.calls.push({ va: EXIT_ROOT_MAP_WALK_ELEM_HOST_VA, thisPtr: m.ecx, arg: 0 });
  }],
  // 0x006fa4aa add edi,0x20
  [0x006fa4aa, (m) => { m.edi = (m.edi + EXIT_MAP_ELEM_STRIDE) >>> 0; }],
  // 0x006fa4ad cmp edi,[esi+0x48]      (end RE-READ per iteration)
  [0x006fa4ad, (m) => { m.zf = (m.edi >>> 0) === loadU32View(m.view, (m.esi + EXIT_MAP_NODE_END_OFF) >>> 0); }],
  // 0x006fa4b0 jne 0x6fa4a0 -- the PE loops to `push 0` (state-free;
  // arg 0 is hardcoded in the call handler), so the transcribed loop head
  // is 0x006fa4a2.
  [0x006fa4b0, (m) => (m.zf ? undefined : 0x006fa4a2)],
  // 0x006fa4b2 mov esi,[ebp+8]         (restore outer node)
  [0x006fa4b2, (m) => { m.esi = m.frame8; }],
  // 0x006fa4b5 mov eax,[ebp-4]         (found RE-READ after hosts)
  [0x006fa4b5, (m) => { m.eax = loadU32View(m.view, m.outSlot); }],
  // 0x006fa4b8 mov byte [eax+0x28],0   (flag clear: event + applied store)
  [0x006fa4b8, (m) => {
    const flagAddr = (m.eax + EXIT_MAP_NODE_FLAG_OFF) >>> 0;
    m.pushEvent(EXIT_ROOT_MAP_WALK_KIND_FLAG_CLEAR, flagAddr);
    m.flagClearCount += 1;
    m.stores.push([flagAddr, 0]);
    m.view.setUint8(flagAddr, 0);
  }],
  // 0x006fa4bc call 0x40e910           (per-iteration global walk host)
  [0x006fa4bc, (m) => {
    m.pushEvent(EXIT_ROOT_MAP_WALK_KIND_GLOBAL_HOST, 0);
    m.globalHostCount += 1;
    m.calls.push({ va: EXIT_ROOT_MAP_WALK_GLOBAL_VA });
  }],
  // ---- inline iterator++ (0x006fa4c1-0x006fa504) ----
  // 0x006fa4c1 mov eax,[esi+8] (right)
  [0x006fa4c1, (m) => { m.eax = loadU32View(m.view, (m.esi + EXIT_TREE_RIGHT_OFF) >>> 0); }],
  // 0x006fa4c4 cmp byte [eax+0xd],0 / 0x006fa4c8 je 0x6fa4ea (right REAL)
  [0x006fa4c4, (m) => { m.zf = m.view.getUint8((m.eax + EXIT_TREE_ISNIL_OFF) >>> 0) === 0; }],
  [0x006fa4c8, (m) => (m.zf ? 0x006fa4ea : undefined)],
  // 0x006fa4ca mov eax,[esi+4] (parent)
  [0x006fa4ca, (m) => { m.eax = loadU32View(m.view, (m.esi + EXIT_TREE_PARENT_OFF) >>> 0); }],
  // 0x006fa4cd cmp byte [eax+0xd],0 / 0x006fa4d1 jne 0x6fa4e3 (parent sentinel)
  [0x006fa4cd, (m) => { m.zf = m.view.getUint8((m.eax + EXIT_TREE_ISNIL_OFF) >>> 0) === 0; }],
  [0x006fa4d1, (m) => (m.zf ? undefined : 0x006fa4e3)],
  // 0x006fa4d3 cmp esi,[eax+8] (node == parent->right) / 0x006fa4d6 jne 0x6fa4e3
  [0x006fa4d3, (m) => { m.zf = (m.esi >>> 0) === loadU32View(m.view, (m.eax + EXIT_TREE_RIGHT_OFF) >>> 0); }],
  [0x006fa4d6, (m) => (m.zf ? undefined : 0x006fa4e3)],
  // 0x006fa4d8 mov esi,eax / 0x006fa4da mov eax,[eax+4]
  [0x006fa4d8, (m) => { m.esi = m.eax; }],
  [0x006fa4da, (m) => { m.eax = loadU32View(m.view, (m.eax + EXIT_TREE_PARENT_OFF) >>> 0); }],
  // 0x006fa4dd cmp byte [eax+0xd],0 / 0x006fa4e1 je 0x6fa4d3 (climb loop)
  [0x006fa4dd, (m) => { m.zf = m.view.getUint8((m.eax + EXIT_TREE_ISNIL_OFF) >>> 0) === 0; }],
  [0x006fa4e1, (m) => (m.zf ? 0x006fa4d3 : undefined)],
  // 0x006fa4e3 mov esi,eax / 0x006fa4e5 mov [ebp+8],esi / 0x006fa4e8 jmp 0x6fa506
  [0x006fa4e3, (m) => { m.esi = m.eax; }],
  [0x006fa4e5, (m) => { m.frame8 = m.esi; }],
  [0x006fa4e8, (m) => 0x006fa506],
  // 0x006fa4ea mov esi,eax (esi=right) / 0x006fa4ec mov [ebp+8],esi
  [0x006fa4ea, (m) => { m.esi = m.eax; }],
  [0x006fa4ec, (m) => { m.frame8 = m.esi; }],
  // 0x006fa4ef mov ecx,[esi] (right->left)
  [0x006fa4ef, (m) => { m.ecx = loadU32View(m.view, m.esi); }],
  // 0x006fa4f1 cmp byte [ecx+0xd],0 / 0x006fa4f5 jne 0x6fa506 (left sentinel)
  [0x006fa4f1, (m) => { m.zf = m.view.getUint8((m.ecx + EXIT_TREE_ISNIL_OFF) >>> 0) === 0; }],
  [0x006fa4f5, (m) => (m.zf ? undefined : 0x006fa506)],
  // 0x006fa4f7 mov eax,[ecx] / 0x006fa4f9 mov esi,ecx / 0x006fa4fb mov [ebp+8],esi
  [0x006fa4f7, (m) => { m.eax = loadU32View(m.view, m.ecx); }],
  [0x006fa4f9, (m) => { m.esi = m.ecx; }],
  [0x006fa4fb, (m) => { m.frame8 = m.esi; }],
  // 0x006fa4fe mov ecx,eax / 0x006fa500 cmp byte [eax+0xd],0 / 0x006fa504 je 0x6fa4f7
  [0x006fa4fe, (m) => { m.ecx = m.eax; }],
  [0x006fa500, (m) => { m.zf = m.view.getUint8((m.eax + EXIT_TREE_ISNIL_OFF) >>> 0) === 0; }],
  [0x006fa504, (m) => (m.zf ? 0x006fa4f7 : undefined)],
  // 0x006fa506 mov edi,[ebx] (sentinel RE-READ) / 0x006fa508 cmp esi,edi
  [0x006fa506, (m) => { m.edi = loadU32View(m.view, m.mapAddr); }],
  [0x006fa508, (m) => { m.zf = (m.esi >>> 0) === (m.edi >>> 0); }],
  // 0x006fa50a jne 0x6fa472
  [0x006fa50a, (m) => (m.zf ? 0x7fffffff : 0x006fa472)],
];

const WALK_END = 0x7fffffff;

function traceMapWalk(view, mapAddr, outSlot) {
  const m = {
    view,
    mapAddr: mapAddr >>> 0,
    outSlot: outSlot >>> 0,
    sentinel0: loadU32View(view, mapAddr),
    esi: 0, edi: 0, eax: 0, ecx: 0, ebx: mapAddr >>> 0,
    zf: false, frame8: 0, outArg: 0,
    events: [], calls: [], stores: [],
    nodeCount: 0, elemHostCount: 0, flagClearCount: 0, globalHostCount: 0,
    truncated: false,
  };
  // The PE pushes event words with no cap; the plan caps like the root.
  m.pushEvent = (kind, payload) => {
    if (m.events.length < EXIT_ROOT_MAP_WALK_EVENT_CAP) {
      m.events.push(evWalkWord(kind, payload));
    } else {
      m.truncated = true;
    }
  };

  let i = 0;
  let guard = 0;
  while (i < TRACE_MAP_WALK.length) {
    if (++guard > 4096) throw new Error("traceMapWalk did not terminate");
    const [va, handler] = TRACE_MAP_WALK[i];
    if (va === 0x006fa472) {
      if (m.nodeCount >= EXIT_ROOT_MAP_WALK_NODE_CAP) {
        m.truncated = true;
        break;
      }
    }
    const next = handler(m);
    if (next === undefined) { i += 1; continue; }
    if (next === WALK_END) break;
    const target = TRACE_MAP_WALK.findIndex(([tva]) => tva === next);
    if (target < 0) throw new Error(`traceMapWalk bad jump target 0x${next.toString(16)}`);
    i = target;
  }
  return m;
}
/**
 * The walk plan, derived from the trace's effect census. `events` are the
 * ordered kind<<24|payload words; `flagClearCount`/`elemHostCount`/
 * `globalHostCount`/`nodeCount` mirror the C++ struct fields. The flag
 * clear store is APPLIED to `view` (the trace runs it like the PE).
 */
export function exitRootMapWalkPlan(view, mapAddr, outSlot) {
  const m = traceMapWalk(view, mapAddr, outSlot);
  return {
    walkActive: m.nodeCount > 0 ? 1 : 0,
    nodeCount: m.nodeCount,
    elemHostCount: m.elemHostCount,
    flagClearCount: m.flagClearCount,
    globalHostCount: m.globalHostCount,
    eventCount: m.events.length,
    truncated: m.truncated ? 1 : 0,
    events: m.events.slice(),
  };
}

/* =====================================================================
   ABI v36 -- complete body of 0x007df690 (7-slot volume setter).

   PE body (123 bytes, ret @ 0x007df70a), transcribed 2026-08-10 from the
   instruction stream (raw bytes in section-notes/exit-v36/):
     0x007df690 push ebp / mov ebp,esp / push ecx / push esi / mov esi,ecx
     0x007df697 movss [ebp-4],xmm1         ; float argument (saved)
     0x007df69c push edi
     slot 0 (inline): 0x007df69d mov ecx,[esi]          ; obj = [s]
       0x007df69f test ecx,ecx / je 0x7df6c9            ; FULL-dword
       0x007df6a3 mov eax,[ecx]; mov eax,[eax+0x28]
       0x007df6a8 call eax                  ; HOST vtbl[+0x28](obj) -> al
       0x007df6aa test al,al / je 0x7df6c9   ; gate closed -> skip slot
       0x007df6ae movss xmm0,[ebp-4]
       0x007df6b3 mov ecx,[esi]              ; obj RE-READ after host call
       0x007df6b5 movss [esi+0x14],xmm0      ; STORE [s+0x14] = float
       0x007df6ba test ecx,ecx / je 0x7df6c9  ; re-read obj (FULL-dword)
       0x007df6be mov eax,[ecx]              ; vtbl RE-READ
       0x007df6c0 push ecx; movss [esp],xmm0
       0x007df6c6 call [eax+0x58]            ; HOST vtbl[+0x58](obj, float)
     loop head (slots 1..6):
       0x007df6c9 add esi,0x34               ; s += 0x34 (stride)
       0x007df6cc mov edi,6                  ; 6 more slots -> 7 total
       0x007df6d1 mov ecx,[esi] ... (same block)
       0x007df6fd add esi,0x34
       0x007df700 sub edi,1 / jne 0x7df6d1
       0x007df705 pop edi; pop esi; mov esp,ebp; pop ebp; ret

   Callers (direct rel32 census): 0x006fa1b6 (Game::Exit, xmm1 = 1.0f from
   0x00baa454), 0x007e1c4a (2 receivers spaced 0x184, float [esi+0x314]),
   0x00803fd2 and 0x0080407a (Game::Update, genrand-derived float) — so the
   body is on the live frame path, not only on Exit.

   Per-slot semantics: s = this + i*0x34, i = 0..6. obj0 = [s]; skip slot
   when obj0 == 0; HOST gate vtbl[obj0]+0x28(); when open: obj1 = [s]
   RE-READ (post-host recapture), STORE [s+0x14] = float, and when obj1 !=
   0 HOST set vtbl[obj1]+0x58(float). The pure surface below is: slot
   address math (32-bit wrap), the plan-time object-presence census, the
   float store address/apply, and the two published vtable offsets the
   driver needs for the host leaves. The gate outcomes and the [s]
   recapture are only knowable after the host call, so they stay driver
   state, exactly like the PE.
   ===================================================================== */

export const EXIT_7DF690_SLOT_COUNT = 7;
export const EXIT_7DF690_SLOT_STRIDE = 0x34;
export const EXIT_7DF690_FLOAT_OFF = 0x14;
export const EXIT_7DF690_GATE_VTBL_OFF = 0x28;
export const EXIT_7DF690_SET_VTBL_OFF = 0x58;

/** PE 0x007df6cc: mov edi,6 — plus the inline slot 0 → 7 slots. */
export function exit7df690SlotCount() {
  return EXIT_7DF690_SLOT_COUNT;
}

/** s = this + i*0x34 with 32-bit wrap (PE 0x007df6c9 add esi,0x34).
    Out-of-range index -> 0 (the PE loop is fixed at 7 iterations). */
export function exit7df690SlotAddr(receiver, index) {
  const i = index >>> 0;
  if (i >= EXIT_7DF690_SLOT_COUNT) return 0;
  return ((receiver >>> 0) + i * EXIT_7DF690_SLOT_STRIDE) >>> 0;
}

/** PE 0x007df6b5: movss [esi+0x14],xmm0 — float store offset. */
export function exit7df690FloatOff() {
  return EXIT_7DF690_FLOAT_OFF;
}

/** PE 0x007df6a5: mov eax,[eax+0x28] / call eax — gate leaf. */
export function exit7df690GateVtblOff() {
  return EXIT_7DF690_GATE_VTBL_OFF;
}

/** PE 0x007df6c6: call [eax+0x58] — set leaf. */
export function exit7df690SetVtblOff() {
  return EXIT_7DF690_SET_VTBL_OFF;
}

/** PE 0x007df69f: test ecx,ecx — FULL-dword object-presence test. A
    pointer whose low byte is 0 (e.g. 0x100) IS present. */
export function exit7df690SlotObjPresent(view, slotAddr) {
  return loadU32View(view, slotAddr) !== 0 ? 1 : 0;
}

/** PE 0x007df6b5: movss [esi+0x14],xmm0 — the only pure store of the
    body, on the gate-open path. `floatBits` is stored as raw u32. */
export function exit7df690Apply(view, slotBase, floatBits) {
  const addr = ((slotBase >>> 0) + EXIT_7DF690_FLOAT_OFF) >>> 0;
  storeU32View(view, addr, floatBits >>> 0);
  return addr >>> 0;
}

/** Plan-time census over linear memory: 7 slot addresses + how many of
    them currently hold a nonzero object pointer. The gate outcomes and
    the post-gate [s] recapture are driver-side (host), so the plan stops
    exactly where the host calls start. */
export function exit7df690Plan(view, receiver) {
  const slotAddr = new Array(EXIT_7DF690_SLOT_COUNT).fill(0);
  let objPresentCount = 0;
  for (let i = 0; i < EXIT_7DF690_SLOT_COUNT; i++) {
    const s = ((receiver >>> 0) + i * EXIT_7DF690_SLOT_STRIDE) >>> 0;
    slotAddr[i] = s;
    if (loadU32View(view, s) !== 0) objPresentCount += 1;
  }
  return {
    slotCount: EXIT_7DF690_SLOT_COUNT,
    objPresentCount,
    slotAddr,
  };
}

/* =====================================================================
   ABI v37 -- Exit-root prologue 0x008650a0 (217 B).

   PE body (happy-path ret 4 @ 0x0086512b; SEH filter ret @ 0x00865178),
   transcribed from dump-pe-span.py --bytes 0xD9 --no-stop-at-ret (the
   first ret is the happy epilogue, not the end of the body):
     0x008650cb mov ecx, [0xc71690]          ; engine = DAT_00c71690
     0x008650d1 mov [ebp-0x28], 0x11         ; pack+4
     0x008650d8 mov [ebp-0x24], 0xffffffff   ; pack+8
     0x008650df mov eax, [ecx+0x10]          ; holder = [engine+0x10]
     0x008650e2 mov [ebp-0x2c], eax          ; pack+0  (LAST of the three)
     0x008650e5 mov eax, [ecx]
     0x008650e7 test dword [eax], 0x20000    ; FULL-dword
     0x008650ed je 0x86511a                  ; skip hosts
     0x008650ef push [ebp+8]                 ; ShouldSave RAW
     0x00865101 call 0x874a10                ; HOST (frame-opaque v23)
     0x00865111 call [0xb1831c]              ; HOST luaL_unref
     0x0086512b ret 4
   SEH unwinder @ 0x0086512e: virtual +4, logger 0xa112c0, optional
   0x693180 when [0xc71678] != 0. identify-zhl empty on every call/IAT.
   IAT 0xb1831c = Lua5.3.3r.dll!luaL_unref (import directory).

   Sibling confusion to pin: 0x00864c30 uses DWORD 0x2000 and pack
   arg1=0xd; 0x008607a0 uses BYTE 2 and pack arg1=1. This body is
   0x20000 / 0x11. A mask of 0x2000 would open the sibling's bit and
   close 0x20000.
   ===================================================================== */

export const EXIT_8650A0_VA = 0x008650a0;
export const EXIT_8650A0_BODY_BYTES = 217;
export const EXIT_8650A0_RET_BYTES = 4;
export const EXIT_8650A0_ENGINE_GLOBAL_DAT = 0x00c71690;
export const EXIT_8650A0_HOLDER_OFF = 0x10;
export const EXIT_8650A0_FLAG_MASK = 0x20000;
export const EXIT_8650A0_PACK_ARG1 = 0x11;
export const EXIT_8650A0_PACK_ARG2 = 0xffffffff;
export const EXIT_8650A0_TRY_LEVEL = 0;
export const EXIT_8650A0_REGISTRY_INDEX = 0xfff0b9d8;
export const EXIT_8650A0_UNREF_IAT = 0x00b1831c;
export const EXIT_8650A0_HOST_874A10_VA = 0x00874a10;
export const EXIT_8650A0_HOST_LOGGER_VA = 0x00a112c0;
export const EXIT_8650A0_HOST_693180_VA = 0x00693180;

/** PE 0x008650e7: test dword ptr [eax], 0x20000 -- FULL-dword. */
export function exit8650a0FlagOpen(flagDword) {
  return ((flagDword >>> 0) & EXIT_8650A0_FLAG_MASK) !== 0 ? 1 : 0;
}

/** Both 0x874a10 and luaL_unref sit on the open arm. */
export function exit8650a0HostNeeded(flagDword) {
  return exit8650a0FlagOpen(flagDword);
}

export function exit8650a0FlagMask() {
  return EXIT_8650A0_FLAG_MASK;
}

export function exit8650a0HolderOff() {
  return EXIT_8650A0_HOLDER_OFF;
}

/** PE 0x008650df: engine+0x10 with 32-bit wrap. */
export function exit8650a0HolderAddr(engine) {
  return ((engine >>> 0) + EXIT_8650A0_HOLDER_OFF) >>> 0;
}

export function exit8650a0PackArg1() {
  return EXIT_8650A0_PACK_ARG1;
}

export function exit8650a0PackArg2() {
  return EXIT_8650A0_PACK_ARG2 >>> 0;
}

export function exit8650a0RegistryIndex() {
  return EXIT_8650A0_REGISTRY_INDEX >>> 0;
}

export function exit8650a0UnrefIat() {
  return EXIT_8650A0_UNREF_IAT;
}

export function exit8650a0Host874a10Va() {
  return EXIT_8650A0_HOST_874A10_VA;
}

/** PE 0x008650d1 / 0x008650d8 / 0x008650e2: arg1, arg2, holder LAST. */
export function exit8650a0PackApply(view, packBase, holder) {
  const base = packBase >>> 0;
  const a1 = (base + 4) >>> 0;
  const a2 = (base + 8) >>> 0;
  storeU32View(view, a1, EXIT_8650A0_PACK_ARG1);
  storeU32View(view, a2, EXIT_8650A0_PACK_ARG2 >>> 0);
  storeU32View(view, base, holder >>> 0);
  return base;
}

/** Plan-time census. Gate sample is caller-supplied (double-indirect
    through a runtime object, like 0x00864c30's flag_dword). ShouldSave
    is the RAW stack dword -- 8650a0 does not mask it. */
export function exit8650a0Plan(flagDword, engine, shouldSave) {
  const open = exit8650a0FlagOpen(flagDword);
  return {
    flagOpen: open,
    host874a10Needed: open,
    hostUnrefNeeded: open,
    holderAddr: exit8650a0HolderAddr(engine),
    packArg1: EXIT_8650A0_PACK_ARG1,
    packArg2: EXIT_8650A0_PACK_ARG2 >>> 0,
    shouldSave: shouldSave >>> 0,
  };
}

/* =====================================================================
   ABI v38 -- Exit nest 0x00686950 (384 B; 1075 B window is 3 funcs).

   Transcribed from dump-pe-span.py --bytes 0x433 --no-stop-at-ret
   (first_ret 0x00686a1f is the remove-path epilogue, not the end).
   Terminal ret @ 0x00686acf. The rest of the 1075 B window is sibling
   0x00686ad0 then sibling 0x00686b70 (SEH + 0x40cf50 x2) — Exit does
   not call those; 0x40cf50 stays frame-opaque.

     0x00686968 cmp dword [esi], 1 ; jbe 0x686abf     UNSIGNED
     0x00686971 mov ecx, [0xc7169c]
     0x00686977 mov [esi], 4
     0x0068697d mov [esi+4], 0
     0x00686984 mov byte [ecx+0x4abc7], 1
     0x0068698b cmp [ecx+0x4b3d8],[ecx+0x4b3dc]; jne epilogue
     0x0068699d game=[0xc71678]; test; je 2a398
                cmp dword [game+0x26630],0 ; jbe 2a398
                cmp byte [game+0x26638],0 ; je epilogue
     0x006869bc cmp byte [ecx+0x2a398],0 ; je epilogue
     0x006869c9 cmp byte [ecx+0x2a3a1],0 ; je epilogue
     HOST 0x41e420 / IAT remove / 0xa25090 / virtuals

   Sibling confusion to pin: a SIGNED jle on [this] vs 1 would close
   0xffffffff; a byte-narrowed test would close 0x100. The 26630 jbe
   is unsigned ==0 — 0x80000000 must still take the 26638 byte test.
   ===================================================================== */

export const EXIT_686950_VA = 0x00686950;
export const EXIT_686950_BODY_BYTES = 384;
export const EXIT_686950_WINDOW_BYTES = 1075;
export const EXIT_686950_THIS_FROM_GAME = 0x68d78;
export const EXIT_686950_STATE_VALUE = 4;
export const EXIT_686950_FIELD4_VALUE = 0;
export const EXIT_686950_MGR_FLAG_OFF = 0x4abc7;
export const EXIT_686950_MGR_FLAG_VALUE = 1;
export const EXIT_686950_VEC_BEGIN_OFF = 0x4b3d8;
export const EXIT_686950_VEC_END_OFF = 0x4b3dc;
export const EXIT_686950_GAME_COUNT_OFF = 0x26630;
export const EXIT_686950_GAME_FLAG_OFF = 0x26638;
export const EXIT_686950_MGR_2A398_OFF = 0x2a398;
export const EXIT_686950_MGR_2A3A1_OFF = 0x2a3a1;
export const EXIT_686950_COUNT64_OFF = 0x64;
export const EXIT_686950_MGR_GLOBAL_DAT = 0x00c7169c;
export const EXIT_686950_GAME_GLOBAL_DAT = 0x00c71678;
export const EXIT_686950_FMT_ADDR = 0x00b60c28;
export const EXIT_686950_NAME_ADDR = 0x00b65834;
export const EXIT_686950_SPRINTF_VA = 0x0041e420;
export const EXIT_686950_OPEN_VA = 0x00a25090;
export const EXIT_686950_REMOVE_IAT = 0x00b187cc;

/** PE 0x00686968: cmp dword ptr [esi], 1 ; jbe -- UNSIGNED. */
export function exit686950EntryOpen(stateDword) {
  return (stateDword >>> 0) > 1 ? 1 : 0;
}

/**
 * I/O gates after the pack. Vec compare is FULL-dword equality.
 * Game+0x26638 is a LOW-BYTE fail-gate that is SKIPPED when game is
 * null or unsigned [game+0x26630] == 0 (jbe 0). Manager bytes are
 * LOW-BYTE. Independently reasoned from the listing, not the C++.
 */
export function exit686950IoOpen(
  vecBegin, vecEnd, gamePtr, game26630, game26638In, mgr2a398In, mgr2a3a1In,
) {
  if ((vecBegin >>> 0) !== (vecEnd >>> 0)) return 0;
  const game = gamePtr >>> 0;
  const count = game26630 >>> 0;
  if (game !== 0 && count !== 0) {
    if ((game26638In & 0xff) === 0) return 0;
  }
  if ((mgr2a398In & 0xff) === 0) return 0;
  if ((mgr2a3a1In & 0xff) === 0) return 0;
  return 1;
}

export function exit686950HostNeeded(
  stateDword, vecBegin, vecEnd, gamePtr, game26630, game26638In, mgr2a398In,
  mgr2a3a1In,
) {
  if (exit686950EntryOpen(stateDword) === 0) return 0;
  return exit686950IoOpen(
    vecBegin, vecEnd, gamePtr, game26630, game26638In, mgr2a398In, mgr2a3a1In,
  );
}

/** PE 0x006869ff: cmp dword [esi+0x64], 0 -- FULL-dword. */
export function exit686950RemoveNeeded(count64) {
  return (count64 >>> 0) === 0 ? 1 : 0;
}

export function exit686950Va() {
  return EXIT_686950_VA;
}
export function exit686950BodyBytes() {
  return EXIT_686950_BODY_BYTES;
}
export function exit686950ThisFromGame() {
  return EXIT_686950_THIS_FROM_GAME;
}
export function exit686950StateValue() {
  return EXIT_686950_STATE_VALUE;
}
export function exit686950MgrFlagOff() {
  return EXIT_686950_MGR_FLAG_OFF;
}
export function exit686950SprintfVa() {
  return EXIT_686950_SPRINTF_VA;
}
export function exit686950RemoveIat() {
  return EXIT_686950_REMOVE_IAT;
}

/** PE 0x00686984: manager+0x4abc7 with 32-bit wrap. */
export function exit686950MgrFlagAddr(manager) {
  return ((manager >>> 0) + EXIT_686950_MGR_FLAG_OFF) >>> 0;
}

/** PE 0x00686977 / 0x0068697d / 0x00686984: this, this+4, flag LAST. */
export function exit686950PackApply(view, thisAddr, manager) {
  const t = thisAddr >>> 0;
  const field4 = (t + 4) >>> 0;
  const flag = exit686950MgrFlagAddr(manager);
  storeU32View(view, t, EXIT_686950_STATE_VALUE);
  storeU32View(view, field4, EXIT_686950_FIELD4_VALUE);
  view.setUint8(flag, EXIT_686950_MGR_FLAG_VALUE);
  return t;
}

export function exit686950Plan(
  stateDword, manager, vecBegin, vecEnd, gamePtr, game26630, game26638In,
  mgr2a398In, mgr2a3a1In, count64, thisAddr,
) {
  const entry = exit686950EntryOpen(stateDword);
  const io = exit686950IoOpen(
    vecBegin, vecEnd, gamePtr, game26630, game26638In, mgr2a398In, mgr2a3a1In,
  );
  const hostIo = entry !== 0 && io !== 0 ? 1 : 0;
  const remove = exit686950RemoveNeeded(count64);
  return {
    entryOpen: entry,
    packNeeded: entry,
    hostIoNeeded: hostIo,
    hostRemoveNeeded: hostIo !== 0 && remove !== 0 ? 1 : 0,
    hostWriteNeeded: hostIo !== 0 && remove === 0 ? 1 : 0,
    mgrFlagAddr: exit686950MgrFlagAddr(manager),
    thisAddr: thisAddr >>> 0,
  };
}

/* =====================================================================
   ABI v39 -- GameState write 0x00958ed0 (600 B).

   Transcribed from dump-pe-span.py --bytes 0x258 --no-stop-at-ret
   (166 insns, 0 resyncs). first_ret 0x00958efa is the not-in-game log
   epilogue, not the end. Terminal ret @ 0x00959127, int3 pad, then
   sibling 0x00959130 (GameState::Delete) -- Exit does not share that
   body's IAT or CF with the write arm.

     0x00958edf cmp dword [esi+8], 2 ; je body          FULL-dword
     0x00958f01 cmp dword [game+0x26630], 0 ; ja epi    UNSIGNED
     0x00958f14 cmp vec begin, end ; jne epi            FULL-dword
     HOST Game::GetPlayer(0) @ 0x417870
     0x00958f27 cmp byte [eax+0x173], 0 ; je pack       LOW-BYTE
     HOST GetExtraLives @ 0x7bf670
     0x00958f44 cmp eax, 1 ; jl epi                     SIGNED
     0x00958f5a mov byte [esi+0x20dcc], 1
     HOST SaveState / 0x8f8cd0 / Steam / fopen / write
     post [0xf98]<-[0x20d48], byte [0x14]=1
     optional PGD 0x9292c0 (SKIP reopen) + cloud/local
     tail byte [0x20dcc]=0

   Sibling confusion to pin: a BYTE test on [esi+8] would open 0x102;
   a SIGNED jle on 26630 would open 0x80000000; an UNSIGNED jb on the
   lives compare would open 0xffffffff.
   ===================================================================== */

export const EXIT_958ED0_VA = 0x00958ed0;
export const EXIT_958ED0_BODY_BYTES = 600;
export const EXIT_958ED0_STATE8_OFF = 8;
export const EXIT_958ED0_STATE8_VALUE = 2;
export const EXIT_958ED0_GAME_COUNT_OFF = 0x26630;
export const EXIT_958ED0_VEC_BEGIN_OFF = 0x4b3d8;
export const EXIT_958ED0_VEC_END_OFF = 0x4b3dc;
export const EXIT_958ED0_PLAYER_FLAG_OFF = 0x173;
export const EXIT_958ED0_LIVES_MIN = 1;
export const EXIT_958ED0_FLAG_20DCC_OFF = 0x20dcc;
export const EXIT_958ED0_FLAG_20DCC_VALUE = 1;
export const EXIT_958ED0_COPY_SRC_OFF = 0x4b134;
export const EXIT_958ED0_COPY_DST_OFF = 0x1ad14;
export const EXIT_958ED0_AL_OFF = 0x1ad18;
export const EXIT_958ED0_POST_SRC_OFF = 0x20d48;
export const EXIT_958ED0_POST_DST_OFF = 0xf98;
export const EXIT_958ED0_CHANGES_OFF = 0x14;
export const EXIT_958ED0_PGD_FLAG_OFF = 0xfa0;
export const EXIT_958ED0_CLOUD_OFF = 0x2a3a4;
export const EXIT_958ED0_STEAM_IAT = 0x00b18a1c;
export const EXIT_958ED0_FILENO_IAT = 0x00b18920;

/** PE 0x00958edf: cmp dword ptr [esi+8], 2 -- FULL-dword. */
export function exit958ed0EntryOpen(state8) {
  return (state8 >>> 0) === EXIT_958ED0_STATE8_VALUE ? 1 : 0;
}

/** PE 0x00958f01: cmp dword, 0 ; ja -- UNSIGNED == 0 continues. */
export function exit958ed0CountOk(count26630) {
  return (count26630 >>> 0) === 0 ? 1 : 0;
}

/** PE 0x00958f14: cmp begin, end -- FULL-dword. */
export function exit958ed0VecEmpty(vecBegin, vecEnd) {
  return (vecBegin >>> 0) === (vecEnd >>> 0) ? 1 : 0;
}

export function exit958ed0PrefixOpen(state8, count26630, vecBegin, vecEnd) {
  if (exit958ed0EntryOpen(state8) === 0) return 0;
  if (exit958ed0CountOk(count26630) === 0) return 0;
  return exit958ed0VecEmpty(vecBegin, vecEnd);
}

/** PE 0x00958f27: cmp byte [player+0x173], 0 -- LOW-BYTE. */
export function exit958ed0ChallengeNeeded(byte173In) {
  return (byte173In & 0xff) !== 0 ? 1 : 0;
}

/**
 * byte173==0 skips GetExtraLives and is OK. Else SIGNED extraLives >= 1
 * (cmp eax,1 / jl). Independently reasoned from the listing, not the C++.
 */
export function exit958ed0ChallengeOk(byte173In, extraLives) {
  if ((byte173In & 0xff) === 0) return 1;
  return (extraLives | 0) >= EXIT_958ED0_LIVES_MIN ? 1 : 0;
}

export function exit958ed0HostNeeded(
  state8, count26630, vecBegin, vecEnd, byte173In, extraLives,
) {
  if (exit958ed0PrefixOpen(state8, count26630, vecBegin, vecEnd) === 0) return 0;
  return exit958ed0ChallengeOk(byte173In, extraLives);
}

/** PE 0x009590c5: cmp byte [esi+0xfa0], 0 -- LOW-BYTE. */
export function exit958ed0PgdNeeded(fa0In) {
  return (fa0In & 0xff) !== 0 ? 1 : 0;
}

/* ABI v46: the last two capture-driven decision gates in the write body
   (verify-open ledger close). EDI = Manager+0xfa4 (GameState). */

export const EXIT_958ED0_FILENAME_SIZE_OFF = 0x1fdbc;
export const EXIT_958ED0_IO_PTR_OFF = 0x1fe24;

/**
 * PE 0x00958fab: cmp dword [gs+0x1fdbc], 0 ; jne 0x958fc8 -- FULL-dword.
 * MSVC basic_string SIZE of the local-save filename. Nonzero -> the
 * fopen/write arm (host 0xa25090 + virtuals); zero -> the no-filename
 * logger (0xa112c0). 0x100 IS present (byte-narrow would flip).
 */
export function exit958ed0LocalFilenamePresent(size1fdbc) {
  return (size1fdbc >>> 0) !== 0 ? 1 : 0;
}

/**
 * PE 0x00958fd5: test ecx, ecx ; je -- FULL-dword presence of the
 * existing GameStateIO* at [gs+0x1fe24]; nonzero -> virtual dtor host
 * call ([ecx]+0). 0x100 IS a valid pointer.
 */
export function exit958ed0IoDtorNeeded(ioPtr1fe24) {
  return (ioPtr1fe24 >>> 0) !== 0 ? 1 : 0;
}

export function exit958ed0Va() {
  return EXIT_958ED0_VA;
}
export function exit958ed0BodyBytes() {
  return EXIT_958ED0_BODY_BYTES;
}
export function exit958ed0Flag20dccOff() {
  return EXIT_958ED0_FLAG_20DCC_OFF;
}
export function exit958ed0SteamIat() {
  return EXIT_958ED0_STEAM_IAT;
}
export function exit958ed0FilenoIat() {
  return EXIT_958ED0_FILENO_IAT;
}

/** PE 0x00958f5a: manager+0x20dcc with 32-bit wrap. */
export function exit958ed0Flag20dccAddr(manager) {
  return ((manager >>> 0) + EXIT_958ED0_FLAG_20DCC_OFF) >>> 0;
}

/** PE 0x009590ce: lea ecx,[esi+0x14] with 32-bit wrap. */
export function exit958ed0PgdThisAddr(manager) {
  return ((manager >>> 0) + EXIT_958ED0_CHANGES_OFF) >>> 0;
}

/** PE 0x00958f5a: byte [manager+0x20dcc] <- 1. */
export function exit958ed0PrefixApply(view, manager) {
  const m = manager >>> 0;
  view.setUint8(exit958ed0Flag20dccAddr(m), EXIT_958ED0_FLAG_20DCC_VALUE);
  return m;
}

/** PE 0x00958f72: dest <- recaptured src. */
export function exit958ed0Copy1ad14Apply(view, manager) {
  const m = manager >>> 0;
  const src = (m + EXIT_958ED0_COPY_SRC_OFF) >>> 0;
  const dst = (m + EXIT_958ED0_COPY_DST_OFF) >>> 0;
  storeU32View(view, dst, loadU32View(view, src));
  return dst;
}

/** PE 0x00958f82: byte [manager+0x1ad18] <- AL. */
export function exit958ed0Store1ad18Apply(view, manager, alIn) {
  const addr = ((manager >>> 0) + EXIT_958ED0_AL_OFF) >>> 0;
  view.setUint8(addr, alIn & 0xff);
  return addr;
}

/** PE 0x009590bb / 0x009590c1: [0xf98] <- [0x20d48], byte [0x14] <- 1. */
export function exit958ed0PostApply(view, manager) {
  const m = manager >>> 0;
  const src = (m + EXIT_958ED0_POST_SRC_OFF) >>> 0;
  const dst = (m + EXIT_958ED0_POST_DST_OFF) >>> 0;
  storeU32View(view, dst, loadU32View(view, src));
  view.setUint8(exit958ed0PgdThisAddr(m), 1);
  return m;
}

/** PE 0x009590d1: byte [0x14] <- 0. Returns PGD this. */
export function exit958ed0PgdClearApply(view, manager) {
  const changes = exit958ed0PgdThisAddr(manager);
  view.setUint8(changes, 0);
  return changes;
}

/** PE 0x00959104 / 0x0095911a: byte [0x20dcc] <- 0. */
export function exit958ed0TailApply(view, manager) {
  const m = manager >>> 0;
  view.setUint8(exit958ed0Flag20dccAddr(m), 0);
  return m;
}

export function exit958ed0Plan(
  state8, count26630, vecBegin, vecEnd, byte173In, extraLives,
  steamCtxWord, cloud2a3a4In, fa0In, manager,
) {
  const entry = exit958ed0EntryOpen(state8);
  const prefix = exit958ed0PrefixOpen(state8, count26630, vecBegin, vecEnd);
  const challenge = exit958ed0ChallengeOk(byte173In, extraLives);
  const pack = prefix !== 0 && challenge !== 0 ? 1 : 0;
  const cloud = exitPgdSaveUsesCloud(steamCtxWord, cloud2a3a4In) ? 1 : 0;
  const pgd = exit958ed0PgdNeeded(fa0In);
  return {
    entryOpen: entry,
    prefixOpen: prefix,
    packNeeded: pack,
    hostCloudNeeded: pack !== 0 && cloud !== 0 ? 1 : 0,
    hostLocalNeeded: pack !== 0 && cloud === 0 ? 1 : 0,
    hostPgdNeeded: pack !== 0 && pgd !== 0 ? 1 : 0,
    flag20dccAddr: exit958ed0Flag20dccAddr(manager),
    thisAddr: manager >>> 0,
  };
}

/* =====================================================================
   ABI v40 -- GameState delete 0x00959130 (75 B).

   PE 0x00959130..0x0095917b (30 insns, 1 E8, 0 indirect, 3 stores).
   UNSIGNED [Game+0x26630]==0 (ja skip), FULL-dword vec begin==end
   (jne skip), host GameState::Delete @ 0x9c8350 (exact ZHL; __thiscall,
   this = Manager+0xfa4 via lea ecx,[esi+0xfa4]), then three immediate
   stores: dword [0xf98]=0, byte [0x14]=1, byte [0x4b284]=0. No IAT, no
   PGD, no Steam. Sibling of v39 write; prefix shared but NOT folded
   (distinct CF/stores). Exit-root caller 0x006fa224 (ShouldSave low
   byte == 0); the root plan keeps evHost(0x00959130) — narrowed, not
   removed.
   ===================================================================== */

export const EXIT_959130_VA = 0x00959130;
export const EXIT_959130_BODY_BYTES = 75;
export const EXIT_959130_GAME_COUNT_OFF = 0x26630;
export const EXIT_959130_VEC_BEGIN_OFF = 0x4b3d8;
export const EXIT_959130_VEC_END_OFF = 0x4b3dc;
export const EXIT_959130_GAMESTATE_OFF = 0xfa4;
export const EXIT_959130_F98_OFF = 0xf98;
export const EXIT_959130_CHANGES_OFF = 0x14;
export const EXIT_959130_FLAG_4B284_OFF = 0x4b284;
export const EXIT_959130_DELETE_VA = 0x009c8350;

/** PE 0x00959140: cmp dword, 0 ; ja -- UNSIGNED == 0 continues. */
export function exit959130EntryOpen(count26630) {
  return (count26630 >>> 0) === 0 ? 1 : 0;
}

/** PE 0x0095914f: cmp begin, end -- FULL-dword. */
export function exit959130VecEmpty(vecBegin, vecEnd) {
  return (vecBegin >>> 0) === (vecEnd >>> 0) ? 1 : 0;
}

export function exit959130PrefixOpen(count26630, vecBegin, vecEnd) {
  if (exit959130EntryOpen(count26630) === 0) return 0;
  return exit959130VecEmpty(vecBegin, vecEnd);
}

export function exit959130HostNeeded(count26630, vecBegin, vecEnd) {
  return exit959130PrefixOpen(count26630, vecBegin, vecEnd);
}

export function exit959130Va() {
  return EXIT_959130_VA;
}
export function exit959130BodyBytes() {
  return EXIT_959130_BODY_BYTES;
}
export function exit959130DeleteVa() {
  return EXIT_959130_DELETE_VA;
}

/** PE 0x00959157: lea ecx,[esi+0xfa4] with 32-bit wrap. */
export function exit959130GamestateAddr(manager) {
  return ((manager >>> 0) + EXIT_959130_GAMESTATE_OFF) >>> 0;
}

/** PE 0x00959162 / 0x0095916c / 0x00959170: dword [0xf98] <- 0, byte
    [0x14] <- 1, byte [0x4b284] <- 0, in PE order. Returns manager. */
export function exit959130DeleteApply(view, manager) {
  const m = manager >>> 0;
  storeU32View(view, (m + EXIT_959130_F98_OFF) >>> 0, 0);
  view.setUint8((m + EXIT_959130_CHANGES_OFF) >>> 0, 1);
  view.setUint8((m + EXIT_959130_FLAG_4B284_OFF) >>> 0, 0);
  return m;
}

export function exit959130Plan(count26630, vecBegin, vecEnd, manager) {
  const entry = exit959130EntryOpen(count26630);
  const vecEmpty = exit959130VecEmpty(vecBegin, vecEnd);
  return {
    entryOpen: entry,
    vecEmpty: vecEmpty,
    hostNeeded: entry !== 0 && vecEmpty !== 0 ? 1 : 0,
    gamestateAddr: exit959130GamestateAddr(manager),
    thisAddr: manager >>> 0,
  };
}

// ===========================================================================
// ABI v48 — reconciliation + consumption of the FROZEN alloc string-tidy
// contract (alloc v3 AL, 0x0040d040) at the Exit root's single reach site.
//
// RECONCILIATION VERDICT: docs/decomp-continuation.md's Exit row listed
// 0x0040d040 "string tidy/deallocate" as open frontier (~1321 reach sites),
// but the template is already translated and frozen in the ALLOC family:
// exports isaac_alloc_str_tidy_release_needed / _size_arg / _plan with the
// census pin ALLOC_CALLERS_STRING_TIDY = 1288. The Exit-side work is
// therefore CONSUMING that frozen contract where Exit callers reach it,
// NOT re-deriving it.
//
// Census (this unit; whole-.text linear decode WITH resync past undecodable
// bytes, rule 10 — back-scans undercount):
//   direct E8 rel32 calls -> 1288  (== ALLOC_CALLERS_STRING_TIDY)
//   E9 rel32 jmp tails    ->   33
//   register-held calls   ->    0  (push imm32 addr-taken: 0;
//                                   mov reg, imm32 addr-taken: 0)
//   TOTAL                 -> 1321
// Exactly ONE of those sites lies inside an exit-owned extent:
//   0x006fa293 = the Game::Exit root vector dtor loop call.
//   Loop head 0x006fa27f: edi <- [ebx+0x25ec0] (end), esi <- [ebx+0x25ebc]
//   (begin), cmp esi,edi ; je 0x006fa2a5. Body 0x006fa290 lea ecx,[esi+8];
//   0x006fa293 call 0x0040d040; add esi,0x38; cmp; jne 0x006fa290.
//   After: begin re-read from [ebx+0x25ebc], then end<-begin store at
//   0x006fa2a5 (the plan's VECTOR_DTOR_LOOP event + pure clear-end seg).
// All other sites sit outside every landed exit extent (spot-verified per
// host: 0x686950 nest ends 0x686acf — no census sites inside; residual
// 0x9a27d0 ends before next function start 0x9a2d10, so sites 0x9a2fb2+
// belong to later functions; 0x8650a0 body ends ~0x865178; 0x8d26c0 ends
// 0x8d2782; residual 0x8d3250 ends 0x8d3358; 0x958ed0/0x959130/0x7384d0/
// 0xa159d0/0x40e910 have no census sites within their extents).
// ===========================================================================

export const EXIT_TIDY_VA = 0x0040d040;
export const EXIT_TIDY_REACH_E8 = 1288;
export const EXIT_TIDY_REACH_JMP_TAILS = 33;
export const EXIT_TIDY_REACH_REGISTER_HELD = 0;
export const EXIT_TIDY_REACH_TOTAL = 1321;
export const EXIT_TIDY_ROOT_SITE_VA = 0x006fa293;
export const EXIT_TIDY_ROOT_LOOP_HEAD_VA = 0x006fa27f;
export const EXIT_TIDY_ROOT_END_STORE_VA = 0x006fa2a5;

/** Frozen AL release gate consumed by reference: PE cmp ecx,0x10 ; jb —
 *  UNSIGNED full-dword compare; cap >= 0x10 frees, SSO cap < 0x10 skips
 *  the allocator entirely. Never re-narrowed to a byte. */
export function exitTidyReleaseNeeded(cap) {
  return (cap >>> 0) >= 0x10 ? 1 : 0;
}

/** inc ecx — the pushed release-size dword is cap + 1 with FULL u32 wrap
 *  (0xffffffff -> 0); the frozen law pins that 0xaef15c forwards and drops
 *  it. */
export function exitTidySizeArg(cap) {
  return ((cap >>> 0) + 1) >>> 0;
}
