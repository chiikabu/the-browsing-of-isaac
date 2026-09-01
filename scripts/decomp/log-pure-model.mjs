/** Independent JS oracle for the logger 0x00a112c0 pure level-gate.
 *  Reasoned branch-by-branch from the instruction stream (gate flow
 *  0x00a112e8..0x00a1148d, jump table 0x00a114a4, index table 0x00a114bc).
 *  NOT transliterated from native/decomp/log_pure_helpers.cpp.
 *
 *  D-LOG-1 is REPRODUCED, never corrected: a len==0 append reads the
 *  never-written pre-buffer byte 0x00c7b647 (constant 0), so the newline
 *  compare fails and atLineStart is CLEARED by an empty emit.
 *  D-LOG-2 is pinned: 0x00a15770 ends `mov al, 1` on every path, so the
 *  init-fail drop arm (`test al,al ; je 0x00a11381`) is structurally dead
 *  in this binary; it is translated anyway.
 *
 *  test bl, bl — the LOW BYTE of the wide level argument.
 *  cmp eax, 1 ; je — FULL 32-bit equality.
 *  lea eax,[ebx-1] ; cmp eax,0xf ; ja default — UNSIGNED STRICT ABOVE.
 *
 *  D-LOG-7: the timed success branch jumps OVER the owned-byte store.
 *  D-LOG-8: the INFINITE spin holds the critsec and never leaves.
 *  D-LOG-9: destroy frees the critsec THEN clears the ready bit (dangling window).
 *  D-LOG-10: variants that restore the base vtable re-point lock at _purecall.
 *  D-LOG-11: failed fopen still PUBLISHES the sink; FILE* is NEVER null-tested.
 *
 *  v8 sibling fread 0x00a52820: `cmp dword [ecx+4], 0` — FULL 32-bit equality
 *  with 0, opposite of the v7 write's `cmp ..., 1`. Math.imul for the byte count.
 */

export const LOG_PURE_ABI_VERSION = 25;

/* ---------- PE constants (hash-bound) ---------- */

export const LOG_VA_LOGGER = 0x00a112c0;
export const LOG_VA_MUTEX_INIT = 0x00a15770;
export const LOG_VA_MUTEX_LOCK = 0x00a157f0;
export const LOG_VA_MUTEX_UNLOCK = 0x00a159a0;
export const LOG_VA_SPRINTF_SHIM = 0x00420a80;
export const LOG_VA_VSNPRINTF_SHIM = 0x00709bc0;
export const LOG_VA_STDIO_OPTIONS = 0x0041d4c0;
export const LOG_VA_LISTENER_INSTALLER = 0x00a5f3a0;
export const LOG_VA_LISTENER_WRITE = 0x00a83fd0;
export const LOG_VA_SHUTDOWN_GUARD_STORE = 0x00a71bec;
export const LOG_VA_STATIC_DTOR = 0x00b16b20;
export const LOG_VA_JUMP_TABLE = 0x00a114a4;
export const LOG_VA_INDEX_TABLE = 0x00a114bc;
export const LOG_VA_SEH_HANDLER = 0x00b1093d;
export const LOG_SECURITY_COOKIE_VA = 0x00bf93b4;
export const LOG_IAT_OUTPUT_DEBUG_STRING_A = 0x00b1827c;
export const LOG_IAT_INIT_CRITICAL_SECTION = 0x00b18278;
export const LOG_IAT_DELETE_CRITICAL_SECTION = 0x00b18274;
export const LOG_IAT_ENTER_CRITICAL_SECTION = 0x00b18270;
export const LOG_IAT_LEAVE_CRITICAL_SECTION = 0x00b18268;
export const LOG_IAT_SLEEP = 0x00b182d8;
export const LOG_IAT_STDIO_COMMON_VSPRINTF = 0x00b18904;
export const LOG_IAT_FOPEN = 0x00b188fc;
export const LOG_IAT_FWRITE = 0x00b188cc;
export const LOG_IAT_FFLUSH = 0x00b1891c;
export const LOG_IAT_FCLOSE = 0x00b1890c; /* dtor inner 0xa52443 calls it */
export const LOG_IAT_EOS_LOBBYDETAILS_RELEASE = 0x00b180a4;
/* eossdk-win32-shipping ! _EOS_LobbyDetails_Release@4; the neighbor
   dtor inner 0xa840b2 calls it */
export const LOG_GUARD_VA = 0x00c7de48;
export const LOG_LISTENER_PTR_VA = 0x00c79bd8;
export const LOG_LISTENER_MASK_VA = 0x00c79bdc;
export const LOG_AT_LINE_START_VA = 0x00c33911;
export const LOG_BUFFER_VA = 0x00c7b648;
export const LOG_PRE_BUFFER_BYTE_VA = 0x00c7b647;
export const LOG_MUTEX_HOLDER_VA = 0x00c37958;
export const LOG_MUTEX_VTABLE_VA = 0x00b81c0c;
export const LOG_SINK_VTABLE_VA = 0x00ba5184;
export const LOG_STDIO_OPTIONS_VA = 0x00c71648;
export const LOG_GUARD_UNINIT = 0;
export const LOG_GUARD_BUSY = 1;
export const LOG_GUARD_READY = 2;
export const LOG_BUFFER_CAPACITY = 0x2800;
export const LOG_NEWLINE_BYTE = 0x0a;
export const LOG_INSTALLER_MASK = 0xff;
export const LOG_VA_START_STACK_DISP = 0x10;
export const LOG_PREFIX_INDEX_BOUND = 0xf;
export const LOG_PREFIX_CASE_INFO = 0;
export const LOG_PREFIX_CASE_NET = 1;
export const LOG_PREFIX_CASE_WARN = 2;
export const LOG_PREFIX_CASE_ERROR = 3;
export const LOG_PREFIX_CASE_ASSERT = 4;
export const LOG_PREFIX_CASE_DEFAULT = 5;
export const LOG_PREFIX_VA_INFO = 0x00b81818;
export const LOG_PREFIX_VA_NET = 0x00b8180c;
export const LOG_PREFIX_VA_WARN = 0x00b81830;
export const LOG_PREFIX_VA_ERROR = 0x00b81824;
export const LOG_PREFIX_VA_ASSERT = 0x00b8183c;
export const LOG_PREFIX_VA_DEFAULT = 0x00b1a4ec;
export const LOG_FMT_S_VA = 0x00b62fdc;
export const LOG_CALLSITES = 3286;
export const LOG_ADDRESS_ESCAPES = 0;
export const LOG_RETURN_VALUE_DEPENDENT_SITES = 0;
export const LOG_SITES_LEVEL_INFO = 709;
export const LOG_SITES_LEVEL_NET = 0;
export const LOG_SITES_LEVEL_WARN = 137;
export const LOG_SITES_LEVEL_ERROR = 216;
export const LOG_SITES_LEVEL_ASSERT = 2219;
export const LOG_SITES_LEVEL_REGISTER = 5;
export const LOG_MAX_VARARG_DWORDS = 14;
export const LOG_TEXT_INSN_COUNT = 2094686;
export const LOG_VA_TEARDOWN = 0x00a71770;
export const LOG_VA_TEARDOWN_END = 0x00a71c0d;
export const LOG_VA_ISAAC_MAIN = 0x00931050;
export const LOG_VA_INSTALLER_CALLSITE = 0x00931135;
export const LOG_VA_TEARDOWN_CALLSITE = 0x0093140e;
export const LOG_VA_CRT_MAIN_SEH = 0x00aef9bc;
export const LOG_VA_CRT_MAIN_CALLSITE = 0x00aefbb9;
export const LOG_VA_TEARDOWN_PTR_READ_PRE = 0x00a71823;
export const LOG_VA_TEARDOWN_FLUSH_VCALL = 0x00a7182f;
export const LOG_VA_TEARDOWN_PTR_READ_POST = 0x00a71832;
export const LOG_VA_TEARDOWN_DESTROY_VCALL = 0x00a71840;
export const LOG_VA_TEARDOWN_PTR_STORE = 0x00a71842;
export const LOG_VA_TEARDOWN_JOIN = 0x00a7184c;
export const LOG_VA_TEARDOWN_MASK_STORE = 0x00a71852;
export const LOG_VA_TEARDOWN_SECOND_FLUSH = 0x00a71a19;
export const LOG_VA_TEARDOWN_GUARD_TEST = 0x00a71bac;
export const LOG_VA_TEARDOWN_GUARD_BRANCH = 0x00a71bbd;
export const LOG_VA_TEARDOWN_CRITSEC_READ = 0x00a71bbf;
export const LOG_VA_TEARDOWN_CRITSEC_DELETE = 0x00a71bca;
export const LOG_VA_TEARDOWN_CRITSEC_FREE = 0x00a71bd3;
export const LOG_VA_TEARDOWN_CRITSEC_STORE = 0x00a71bdb;
export const LOG_VA_TEARDOWN_FLAGS_STORE = 0x00a71be5;
export const LOG_VA_TEARDOWN_BYTE_STORE = 0x00a71bf6;
export const LOG_VA_OPERATOR_DELETE = 0x00aef15c;
export const LOG_VA_INSTALLER_PREV_READ = 0x00a5f3c5;
export const LOG_VA_INSTALLER_ALLOC = 0x00a5f3e1;
export const LOG_VA_INSTALLER_ALLOC_TEST = 0x00a5f3f5;
export const LOG_VA_INSTALLER_VTABLE_STORE = 0x00a5f419;
export const LOG_VA_INSTALLER_FOPEN = 0x00a5f436;
export const LOG_VA_INSTALLER_STATE_OK = 0x00a5f44c;
export const LOG_VA_INSTALLER_PTR_STORE = 0x00a5f478;
export const LOG_VA_INSTALLER_PTR_FAIL_STORE = 0x00a5f480;
export const LOG_VA_INSTALLER_MASK_STORE = 0x00a5f48a;
export const LOG_VA_GUEST_ALLOC = 0x00a0f4c0;
export const LOG_VA_LOCK_ASSERT_TEST = 0x00a157fe;
export const LOG_VA_LOCK_ASSERT_SITE = 0x00a1580f;
export const LOG_LOCK_ASSERT_STRING_VA = 0x00b81c58;
export const LOG_HOLDER_FLAGS_VA = 0x00c3795c;
export const LOG_CRITSEC_PTR_VA = 0x00c37960;
export const LOG_TEARDOWN_BYTE_VA = 0x00c78aad;
export const LOG_IAT_CO_UNINITIALIZE = 0x00b189ec;
export const LOG_TEARDOWN_ENGAGE_VALUE = 2;
export const LOG_CRITSEC_SIZE = 0x1c;
export const LOG_HOLDER_INIT_BIT = 1;
export const LOG_HOLDER_FLAGS_CLEAR_MASK = 0xfe;
export const LOG_SINK_ALLOC_SIZE = 0x10;
export const LOG_SINK_STATE_NO_FILE = 2;
export const LOG_SINK_STATE_OPEN = 1;
export const LOG_SINK_STATE_NONE = -1;
export const LOG_LOCK_ASSERT_LEVEL = 0x10;
export const LOG_TEARDOWN_CALLSITES = 1;
export const LOG_TEARDOWN_ADDRESS_ESCAPES = 0;
export const LOG_INSTALLER_CALLSITES = 1;
export const LOG_INSTALLER_ADDRESS_ESCAPES = 0;
export const LOG_ISAAC_MAIN_CALLSITES = 1;
export const LOG_TEARDOWN_INTERNAL_LOG_SITES = 0;
export const LOG_GUARD_READERS = 2;
export const LOG_GUARD_WRITERS = 4;
export const LOG_LISTENER_PTR_READERS = 19;
export const LOG_LISTENER_PTR_WRITERS = 6;
export const LOG_LISTENER_PTR_NONZERO_WRITERS = 1;
export const LOG_LISTENER_MASK_READERS = 2;
export const LOG_LISTENER_MASK_WRITERS = 4;
export const LOG_LISTENER_MASK_NONZERO_WRITERS = 1;
export const LOG_CRITSEC_PTR_WRITERS = 2;
export const LOG_HOLDER_FLAGS_WRITERS = 2;
export const LOG_HOLDER_FLAGS_READERS = 0;
export const LOG_POST_TEARDOWN_FUNCTIONS = 154;
export const LOG_POST_TEARDOWN_LOG_SITES = 15;
export const LOG_POST_TEARDOWN_LOG_FUNCTIONS = 8;
export const LOG_POST_TEARDOWN_FAMILY_GAME_LOGIC_EDGES = 0;
export const LOG_POST_TEARDOWN_UNRESOLVED_IAT_CALLS = 149;
export const LOG_POST_TEARDOWN_UNRESOLVED_REG_CALLS = 152;
export const LOG_TEXT_INSN_COUNT_V2 = 2094319;
export const LOG_TEXT_UNDECODABLE_BYTES_V2 = 469;
export const LOG_VA_INIT = 0x00a710a0;
export const LOG_VA_INIT_RET_OK = 0x00a714c8;
export const LOG_VA_INIT_RET_FAIL = 0x00a714db;
export const LOG_VA_INIT_FAIL_LABEL = 0x00a714c9;
export const LOG_VA_INIT_CALLER = 0x00a5f0e0;
export const LOG_VA_INIT_CALLSITE = 0x00a5f18c;
export const LOG_VA_INIT_SEH_HANDLER = 0x00b13685;
export const LOG_VA_INIT_ARG0_STORE = 0x00a710e5;
export const LOG_VA_INIT_ARG1_STORE = 0x00a710eb;
export const LOG_INIT_ARG0_VA = 0x00c78d98;
export const LOG_INIT_ARG1_VA = 0x00c78d94;
export const LOG_VA_INIT_LIFECYCLE_TEST = 0x00a710cb;
export const LOG_VA_INIT_LIFECYCLE_BRANCH = 0x00a710d2;
export const LOG_VA_INIT_WARN_SITE = 0x00a710db;
export const LOG_VA_INIT_WARN_CLEANUP = 0x00a710e0;
export const LOG_INIT_WARN_STRING_VA = 0x00ba21f0;
export const LOG_INIT_WARN_STRING_LEN = 34;
export const LOG_VA_INIT_LIFECYCLE_STORE = 0x00a714af;
export const LOG_VA_LIFECYCLE_OTHER_READER = 0x00430c3b;
export const LOG_VA_LIFECYCLE_OTHER_LOG_SITE = 0x00430c4b;
export const LOG_LIFECYCLE_OTHER_STRING_VA = 0x00b82ee8;
export const LOG_VA_INIT_OBJECT_ALLOC = 0x00a710f1;
export const LOG_VA_INIT_OBJECT_ALLOC_TEST = 0x00a71105;
export const LOG_VA_INIT_OBJECT_FAIL_LABEL = 0x00a711e2;
export const LOG_VA_INIT_OBJECT_PUBLISH = 0x00a711da;
export const LOG_INIT_OBJECT_VA = 0x00c7de78;
export const LOG_INIT_OBJECT_SIZE = 0x40;
export const LOG_VA_INIT_OBJECT_MAGIC_STORE = 0x00a71113;
export const LOG_INIT_OBJECT_MAGIC = 0x7fcb9dd6;
export const LOG_VA_INIT_MUTEX_VTABLE_STORE = 0x00a71122;
export const LOG_INIT_HOLDER_OFFSET = 0x10;
export const LOG_VA_INIT_DEVIRT_TEST = 0x00a711a5;
export const LOG_VA_INIT_DEVIRT_DIRECT = 0x00a711ac;
export const LOG_VA_INIT_DEVIRT_INDIRECT = 0x00a711b3;
export const LOG_VA_INIT_CRITSEC_TEST = 0x00a7139a;
export const LOG_VA_INIT_CRITSEC_BRANCH = 0x00a713a1;
export const LOG_VA_INIT_CRITSEC_ALLOC = 0x00a713a5;
export const LOG_VA_INIT_CRITSEC_ALLOC_TEST = 0x00a713b2;
export const LOG_VA_INIT_CRITSEC_FAIL_LABEL = 0x00a713c3;
export const LOG_VA_INIT_CRITSEC_TAIL = 0x00a713c5;
export const LOG_VA_INIT_CRITSEC_BTS = 0x00a713cc;
export const LOG_VA_INIT_CRITSEC_PTR_STORE = 0x00a713d0;
export const LOG_VA_INIT_CRITSEC_FLAGS_STORE = 0x00a713d6;
export const LOG_INIT_CRITSEC_FLAGS_VA = 0x00c5ab48;
export const LOG_INIT_CRITSEC_PTR_VA = 0x00c5ab4c;
export const LOG_INIT_CRITSEC_READY_BIT = 1;
export const LOG_INIT_CRITSEC_ZERO_OFFSET = 0x18;
export const LOG_VA_INIT_CMD_THREAD_TEST = 0x00a713f8;
export const LOG_VA_INIT_CMD_THREAD_BRANCH = 0x00a713ff;
export const LOG_VA_INIT_CMD_THREAD_WARN_SITE = 0x00a71408;
export const LOG_VA_INIT_CMD_THREAD_WARN_CLEANUP = 0x00a7140d;
export const LOG_VA_INIT_CMD_THREAD_SKIP = 0x00a71410;
export const LOG_VA_INIT_CMD_THREAD_BTS = 0x00a71456;
export const LOG_VA_INIT_CMD_THREAD_FLAGS_STORE = 0x00a7145a;
export const LOG_VA_INIT_CMD_THREAD_JOIN = 0x00a7145f;
export const LOG_INIT_CMD_THREAD_FLAGS_VA = 0x00c79a7c;
export const LOG_INIT_CMD_THREAD_STRING_VA = 0x00ba82b0;
export const LOG_INIT_CMD_THREAD_STRING_LEN = 38;
export const LOG_INIT_CMD_THREAD_READY_BIT = 1;
export const LOG_VA_INIT_FAIL_BRANCH_0 = 0x00a7128b;
export const LOG_VA_INIT_FAIL_BRANCH_1 = 0x00a71357;
export const LOG_VA_INIT_FAIL_BRANCH_2 = 0x00a71369;
export const LOG_INIT_FAIL_PREDECESSORS = 3;
export const LOG_INIT_WARN_LEVEL = 0x10;
export const LOG_INIT_WARN_CLEANUP_IMM = 8;
export const LOG_INIT_LOG_SITES = 2;
export const LOG_INIT_CALLSITES = 1;
export const LOG_INIT_ADDRESS_ESCAPES = 0;
export const LOG_INIT_INBOUND_TRANSFERS = 0;
export const LOG_INIT_INSN_COUNT = 271;
export const LOG_INIT_UNDECODABLE_BYTES = 0;
export const LOG_INIT_ORPHAN_BLOCKS = 0;
export const LOG_LIFECYCLE_BYTE_READERS = 2;
export const LOG_LIFECYCLE_BYTE_WRITERS = 2;
export const LOG_INIT_ARG0_WRITERS = 1;
export const LOG_INIT_ARG1_WRITERS = 1;
export const LOG_VA_BOOT_LOG_SITE = 0x00931172;
export const LOG_VA_BOOT_LOG_LEVEL_PUSH = 0x00931170;
export const LOG_BOOT_LOG_LEVEL = 1;
export const LOG_BOOT_LOG_STRING_VA = 0x00b7b3f8;
export const LOG_BOOT_LOG_STRING_LEN = 15;
export const LOG_VA_ISAAC_MAIN_SCOPE_TABLE = 0x00bcc178;
export const LOG_VA_ISAAC_MAIN_UNWIND_FUNCLET = 0x00931458;
export const LOG_VA_ISAAC_MAIN_EXCEPT_HANDLER = 0x00931461;
export const LOG_ISAAC_MAIN_SCOPE_ENTRIES = 1;
export const LOG_ISAAC_MAIN_INSN_COUNT = 259;
export const LOG_ISAAC_MAIN_UNDECODABLE_BYTES = 0;
export const LOG_ISAAC_MAIN_ORPHAN_BLOCKS = 1;
export const LOG_GUARD_ADDRESS_ESCAPES = 0;
export const LOG_GUARD_DISTINCT_VALUES = 3;
export const LOG_TEARDOWN_CALLSITES_V3 = 1;
export const LOG_TEXT_INSN_COUNT_V3 = 2094319;
export const LOG_TEXT_UNDECODABLE_BYTES_V3 = 469;
export const LOG_VA_LOCK = 0x00a157f0;
export const LOG_VA_UNLOCK = 0x00a159a0;
export const LOG_VA_LOCK_RET_TRUE = 0x00a15850;
export const LOG_VA_LOCK_RET_FALSE = 0x00a15996;
export const LOG_VA_UNLOCK_RET = 0x00a159c7;
export const LOG_VA_MUTEX_DTOR = 0x00a156e0;
export const LOG_VA_MUTEX_DESTROY = 0x00a157c0;
export const LOG_MUTEX_VTBL_SLOT_INIT = 0x04;
export const LOG_MUTEX_VTBL_SLOT_DESTROY = 0x08;
export const LOG_MUTEX_VTBL_SLOT_LOCK = 0x0c;
export const LOG_MUTEX_VTBL_SLOT_UNLOCK = 0x10;
export const LOG_VA_VTBL_LOCK_ENTRY = 0x00b81c18;
export const LOG_VA_VTBL_UNLOCK_ENTRY = 0x00b81c1c;
export const LOG_MUTEX_VTABLE_SLOTS = 5;
export const LOG_HOLDER_VTABLE_OFFSET = 0x00;
export const LOG_HOLDER_FLAGS_OFFSET = 0x04;
export const LOG_HOLDER_CRITSEC_OFFSET = 0x08;
export const LOG_HOLDER_LOAD_TIME_FLAGS = 0;
export const LOG_HOLDER_LOAD_TIME_CRITSEC = 0;
export const LOG_VA_LOCK_ASSERT_TEST_V4 = 0x00a157fe;
export const LOG_VA_LOCK_ASSERT_BRANCH = 0x00a15806;
export const LOG_VA_LOCK_ASSERT_SKIP = 0x00a1581b;
export const LOG_VA_LOCK_ASSERT_CLEANUP = 0x00a15818;
export const LOG_VA_UNLOCK_ASSERT_TEST = 0x00a159a3;
export const LOG_VA_UNLOCK_ASSERT_BRANCH = 0x00a159a7;
export const LOG_VA_UNLOCK_ASSERT_SITE = 0x00a159b0;
export const LOG_VA_UNLOCK_ASSERT_SKIP = 0x00a159b8;
export const LOG_VA_UNLOCK_ASSERT_CLEANUP = 0x00a159b5;
export const LOG_UNLOCK_ASSERT_STRING_VA = 0x00b81c20;
export const LOG_LOCK_ASSERT_STRING_LEN = 50;
export const LOG_UNLOCK_ASSERT_STRING_LEN = 52;
export const LOG_LOCK_ASSERT_CLEANUP_IMM = 8;
export const LOG_LOCK_READY_BIT = 1;
export const LOG_VA_LOCK_THIS_SPILL = 0x00a15802;
export const LOG_VA_LOCK_THIS_RELOAD = 0x00a15814;
export const LOG_VA_LOCK_TIMEOUT_TEST = 0x00a1581b;
export const LOG_VA_LOCK_TIMEOUT_BRANCH = 0x00a1581f;
export const LOG_VA_LOCK_TIMED_ENTRY = 0x00a15853;
export const LOG_VA_LOCK_ZERO_TEST = 0x00a158bf;
export const LOG_VA_LOCK_ZERO_BRANCH = 0x00a158cb;
export const LOG_LOCK_TIMEOUT_INFINITE = 0xffffffff;
export const LOG_LOCK_ARM_INFINITE = 0;
export const LOG_LOCK_ARM_ZERO_TIMEOUT = 1;
export const LOG_LOCK_ARM_TIMED = 2;
export const LOG_VA_LOCK_CRITSEC_READ = 0x00a15821;
export const LOG_VA_LOCK_ENTER_CALL = 0x00a15825;
export const LOG_VA_LOCK_OWNED_TEST = 0x00a1582b;
export const LOG_VA_LOCK_SLEEP_PTR_LOAD = 0x00a15831;
export const LOG_VA_LOCK_SPIN_HEAD = 0x00a15837;
export const LOG_VA_LOCK_SPIN_SLEEP = 0x00a1583c;
export const LOG_VA_LOCK_SPIN_RETEST = 0x00a1583e;
export const LOG_VA_LOCK_SPIN_BACK_EDGE = 0x00a15842;
export const LOG_VA_LOCK_OWNED_STORE = 0x00a15844;
export const LOG_VA_LOCK_SUCCESS = 0x00a15848;
export const LOG_LOCK_SPIN_SLEEP_MS = 0x3e8;
export const LOG_LOCK_OWNED_VALUE = 1;
export const LOG_LOCK_SPIN_NEVER_RETURNS = 0xffffffff;
export const LOG_VA_LOCK_RETRY_HEAD = 0x00a158d1;
export const LOG_VA_LOCK_TIMED_CRITSEC_READ = 0x00a158d5;
export const LOG_VA_LOCK_TRY_CALL = 0x00a158d9;
export const LOG_VA_LOCK_TRY_TEST = 0x00a158df;
export const LOG_VA_LOCK_TRY_OWNED_TEST = 0x00a158e8;
export const LOG_VA_LOCK_GIVEBACK_LEAVE = 0x00a158ef;
export const LOG_VA_LOCK_TRY_JOIN = 0x00a158f7;
export const LOG_VA_LOCK_TIMED_SUCCESS_BRANCH = 0x00a158f9;
export const LOG_VA_LOCK_RETRY_SLEEP = 0x00a158ff;
export const LOG_VA_LOCK_NOW_READ = 0x00a15907;
export const LOG_VA_LOCK_ELAPSED_SUB = 0x00a15973;
export const LOG_VA_LOCK_ELAPSED_HI_TEST = 0x00a1597b;
export const LOG_VA_LOCK_ELAPSED_DEAD_JB = 0x00a1597d;
export const LOG_VA_LOCK_ELAPSED_HI_JA = 0x00a15983;
export const LOG_VA_LOCK_ELAPSED_LO_CMP = 0x00a15985;
export const LOG_VA_LOCK_ELAPSED_LO_JB = 0x00a15988;
export const LOG_VA_LOCK_FAIL = 0x00a1598e;
export const LOG_LOCK_RETRY_SLEEP_MS = 0xa;
export const LOG_LOCK_TRY_ARM_SUCCESS = 0;
export const LOG_LOCK_TRY_ARM_LEAVE_AND_SLEEP = 1;
export const LOG_LOCK_TRY_ARM_SLEEP = 2;
export const LOG_VA_LOCK_CLOCK = 0x00a68490;
export const LOG_IAT_QPC = 0x00b18238;
export const LOG_IAT_QPF = 0x00b18234;
export const LOG_IAT_TRY_ENTER_CRITICAL_SECTION = 0x00b1826c;
export const LOG_VA_CLOCK_NS_SCALE = 0x00baa8b0;
export const LOG_LOCK_MS_DIVISOR = 1000000;
export const LOG_LOCK_MS_MAGIC_LO = 0xd7b634db;
export const LOG_LOCK_MS_MAGIC_HI = 0x431bde82;
export const LOG_LOCK_MS_SHIFT = 0x12;
export const LOG_VA_UNLOCK_CRITSEC_READ = 0x00a159b8;
export const LOG_VA_UNLOCK_OWNED_STORE = 0x00a159bc;
export const LOG_VA_UNLOCK_LEAVE_CALL = 0x00a159c0;
export const LOG_LOCK_DIRECT_CALLSITES = 0;
export const LOG_UNLOCK_DIRECT_CALLSITES = 0;
export const LOG_LOCK_TAIL_JUMPS = 0;
export const LOG_UNLOCK_TAIL_JUMPS = 0;
export const LOG_LOCK_IMMEDIATE_SITES = 0;
export const LOG_UNLOCK_IMMEDIATE_SITES = 0;
export const LOG_LOCK_RAW_OCCURRENCES = 1;
export const LOG_UNLOCK_RAW_OCCURRENCES = 1;
export const LOG_MUTEX_VTABLE_RAW_OCCURRENCES = 41;
export const LOG_MUTEX_VTABLE_TEXT_STORES = 37;
export const LOG_MUTEX_VTABLE_DATA_INSTANCES = 4;
export const LOG_MUTEX_GLOBAL_DISPATCH_SITES = 32;
export const LOG_MUTEX_GLOBAL_LOCK_SITES = 16;
export const LOG_MUTEX_GLOBAL_INFINITE_SITES = 16;
export const LOG_MUTEX_GLOBAL_FINITE_SITES = 0;
export const LOG_HOLDER_FLAGS_INDIRECT_READERS = 2;
export const LOG_TEXT_INSN_COUNT_V4 = 2094319;
export const LOG_TEXT_UNDECODABLE_BYTES_V4 = 469;
export const LOG_V4_BATCHED_VAS = 27;
export const LOG_V4_EXACT_ZHL_MATCHES = 1;
export const LOG_READY_BIT_PREDICATE_SITES = 5;
export const LOG_LAZY_INIT_TEMPLATE_INSTANCES = 2;
export const LOG_LAZY_INIT_TEMPLATE_INSNS = 18;
export const LOG_ASSERT_GUARD_TEMPLATE_INSTANCES = 2;
export const LOG_VA_MUTEX_UNWIND_DESTROY = 0x00a15730;
export const LOG_VA_MUTEX_DESTROY_END = 0x00a157eb;
export const LOG_VA_MUTEX_UNWIND_DESTROY_END = 0x00a15767;
export const LOG_VA_MUTEX_DTOR_END = 0x00a15730;
export const LOG_VA_VTBL_DTOR_ENTRY = 0x00b81c0c;
export const LOG_VA_VTBL_DESTROY_ENTRY = 0x00b81c14;
export const LOG_MUTEX_VTBL_SLOT_DTOR = 0x00;
export const LOG_VA_MUTEX_BASE_VTABLE = 0x00ba04b4;
export const LOG_VA_MUTEX_BASE_PURECALL = 0x00af05d3;
export const LOG_VA_DESTROY_CRITSEC_READ = 0x00a157c4;
export const LOG_VA_DESTROY_CRITSEC_TEST = 0x00a157c7;
export const LOG_VA_DESTROY_CRITSEC_BRANCH = 0x00a157c9;
export const LOG_VA_DESTROY_DELETE_CALL = 0x00a157cc;
export const LOG_VA_DESTROY_FREE_CALL = 0x00a157d5;
export const LOG_VA_DESTROY_NULL_STORE = 0x00a157dd;
export const LOG_VA_DESTROY_CLEAR = 0x00a157e4;
export const LOG_VA_DESTROY_RET = 0x00a157ea;
export const LOG_VA_DTOR_ENTRY_VTABLE_STORE = 0x00a156ea;
export const LOG_VA_DTOR_CLEAR = 0x00a1570d;
export const LOG_VA_DTOR_DELETE_FLAG_TEST = 0x00a15711;
export const LOG_VA_DTOR_EXIT_VTABLE_STORE = 0x00a15715;
export const LOG_VA_DTOR_DELETE_FLAG_BRANCH = 0x00a1571b;
export const LOG_VA_DTOR_OBJECT_FREE_CALL = 0x00a15720;
export const LOG_VA_DTOR_RET = 0x00a1572d;
export const LOG_VA_UNWIND_ENTRY_VTABLE_STORE = 0x00a15737;
export const LOG_VA_UNWIND_CLEAR = 0x00a1575a;
export const LOG_VA_UNWIND_EXIT_VTABLE_STORE = 0x00a1575f;
export const LOG_VA_UNWIND_RET = 0x00a15766;
export const LOG_VA_TEARDOWN_INLINE_DESTROY = 0x00a71bbf;
export const LOG_VA_TEARDOWN_DELETE_CALL = 0x00a71bca;
export const LOG_VA_TEARDOWN_CLEAR = 0x00a71be5;
export const LOG_VA_STATIC_DTOR_DELETE_CALL = 0x00b16b36;
export const LOG_VA_STATIC_DTOR_CLEAR = 0x00b16b51;
export const LOG_VA_STATIC_DTOR_ATEXIT_SITE = 0x00402080;
export const LOG_VA_ATEXIT = 0x00aef5af;
export const LOG_VA_RAW_FREE = 0x00a0f500;
export const LOG_VA_SHARED_ALLOCATOR = 0x00a648b0;
export const LOG_MUTEX_CRITSEC_SIZE = 0x1c;
export const LOG_MUTEX_OBJECT_SIZE = 0x0c;
export const LOG_MUTEX_OWNED_OFFSET = 0x18;
export const LOG_MUTEX_DTOR_DELETE_BIT = 1;
export const LOG_DESTROY_VARIANT_DESTROY = 0;
export const LOG_DESTROY_VARIANT_UNWIND = 1;
export const LOG_DESTROY_VARIANT_DTOR = 2;
export const LOG_DESTROY_VARIANT_TEARDOWN = 3;
export const LOG_DESTROY_VARIANT_STATIC = 4;
export const LOG_DESTROY_VARIANTS = 5;
export const LOG_DESTROY_ACTION_NONE = 0;
export const LOG_DESTROY_ACTION_STORE_ENTRY_VTABLE = 1;
export const LOG_DESTROY_ACTION_DELETE_CRITICAL_SECTION = 2;
export const LOG_DESTROY_ACTION_FREE_CRITSEC = 3;
export const LOG_DESTROY_ACTION_STORE_NULL_CRITSEC = 4;
export const LOG_DESTROY_ACTION_CLEAR_READY_BIT = 5;
export const LOG_DESTROY_ACTION_STORE_EXIT_VTABLE = 6;
export const LOG_DESTROY_ACTION_FREE_OBJECT = 7;
export const LOG_DESTROY_ACTION_MAX = 7;
export const LOG_DESTROY_ACTIONS_MAX = 7;
export const LOG_READY_STATE_DOWN = 0;
export const LOG_READY_STATE_LIVE = 1;
export const LOG_READY_STATE_FAILED = 2;
export const LOG_READY_STATE_IMPOSSIBLE = 3;
export const LOG_READY_STATES_REACHABLE = 3;
export const LOG_DESTROY_BODY_BYTES = 43;
export const LOG_UNWIND_DESTROY_BODY_BYTES = 55;
export const LOG_DTOR_BODY_BYTES = 80;
export const LOG_DESTROY_SHARED_BYTES_0_1 = 41;
export const LOG_DESTROY_SHARED_BYTES_1_2 = 52;
export const LOG_DESTROY_SHARED_BYTES_0_2 = 40;
export const LOG_DESTROY_VTABLE_STORE_BYTES = 6;
export const LOG_DESTROY_FORCED_REL32_DELTA_BYTES = 2;
export const LOG_REACH_CHANNEL_DIRECT_CALL = 0;
export const LOG_REACH_CHANNEL_TAIL_JUMP = 1;
export const LOG_REACH_CHANNEL_JCC = 2;
export const LOG_REACH_CHANNEL_PUSH_IMM = 3;
export const LOG_REACH_CHANNEL_MOV_IMM = 4;
export const LOG_REACH_CHANNEL_RAW_DWORD = 5;
export const LOG_REACH_CHANNEL_INBOUND_INTERIOR = 6;
export const LOG_REACH_CHANNELS = 7;
export const LOG_DESTROY_DIRECT_CALLSITES = 0;
export const LOG_DESTROY_TAIL_JUMPS = 0;
export const LOG_DESTROY_RAW_OCCURRENCES = 1;
export const LOG_DTOR_DIRECT_CALLSITES = 0;
export const LOG_DTOR_TAIL_JUMPS = 0;
export const LOG_DTOR_RAW_OCCURRENCES = 1;
export const LOG_UNWIND_DESTROY_DIRECT_CALLSITES = 0;
export const LOG_UNWIND_DESTROY_TAIL_JUMPS = 10;
export const LOG_UNWIND_DESTROY_RAW_OCCURRENCES = 0;
export const LOG_UNWIND_DESTROY_FRAME_FUNCLETS = 8;
export const LOG_UNWIND_DESTROY_ABSOLUTE_THUNKS = 2;
export const LOG_UNWIND_DESTROY_REACH_V4_REPORTED = 0;
export const LOG_BASE_RELOCATIONS_HIGHLOW = 180939;
export const LOG_DELETE_CRITICAL_SECTION_SITES = 37;
export const LOG_DESTROY_TEMPLATE_INSTANCES = 27;
export const LOG_DESTROY_TEMPLATE_OUT_OF_LINE = 3;
export const LOG_DESTROY_TEMPLATE_INLINED = 24;
export const LOG_HOLDER_DESTROY_SITES = 2;
export const LOG_HOLDER_READY_BIT_SETTERS = 1;
export const LOG_HOLDER_READY_BIT_CLEARERS = 2;
export const LOG_HOLDER_READY_BIT_ABSOLUTE_SETTERS = 0;
export const LOG_VA_HOLDER_READY_BIT_SET = 0x00a157ad;
export const LOG_DESTROY_DANGLING_WINDOW_INSNS = 6;
export const LOG_TEXT_INSN_COUNT_V5 = 2094319;
export const LOG_TEXT_UNDECODABLE_BYTES_V5 = 469;
export const LOG_V5_BATCHED_VAS = 8;
export const LOG_V5_EXACT_ZHL_MATCHES = 0;
export const LOG_VA_WRITE = 0x00a83fd0;
export const LOG_VA_WRITE_END = 0x00a84022;
export const LOG_VA_WRITE_STATE_TEST = 0x00a83fd7;
export const LOG_VA_WRITE_STATE_BRANCH = 0x00a83fdb;
export const LOG_VA_WRITE_SKIP_FFLUSH = 0x00a83fe2;
export const LOG_VA_WRITE_SKIP_RET = 0x00a83ff0;
export const LOG_VA_WRITE_FWRITE = 0x00a83fff;
export const LOG_VA_WRITE_IMUL = 0x00a8400a;
export const LOG_VA_WRITE_OK_FFLUSH = 0x00a84011;
export const LOG_VA_WRITE_OK_RET = 0x00a8401f;
export const LOG_VA_WRITE_LOGGER_SLOT_LOAD = 0x00a11433;
export const LOG_VA_WRITE_LOGGER_CALL = 0x00a11451;
export const LOG_VA_WRITE_LOGGER_SIZE_PUSH = 0x00a1144a;
/* v17: the logger mid-body dispatch/tail passes (D-LOG-15/16/17). */
export const LOG_VA_DISPATCH_STRLEN_PASS = 0x00a11440;
export const LOG_VA_DISPATCH_NMEMB_PUSH = 0x00a11449;
export const LOG_VA_TAIL_STRLEN_PASS = 0x00a11453;
export const LOG_VA_TAIL_NEWLINE_CMP = 0x00a11469;
export const LOG_VA_SINK_DTOR = 0x00a83fa0;
export const LOG_VA_SINK_FLUSH = 0x0040c200;
export const LOG_VA_WRITE_SIBLING = 0x00a52850;
export const LOG_VA_VTBL_WRITE_ENTRY = 0x00ba51a0;
export const LOG_VA_VTBL_FLUSH_ENTRY = 0x00ba51a4;
export const LOG_SINK_VTBL_SLOT_DTOR = 0x00;
export const LOG_SINK_VTBL_SLOT_WRITE = 0x1c;
export const LOG_SINK_VTBL_SLOT_FLUSH = 0x20;
export const LOG_SINK_STATE_OFFSET = 0x04;
export const LOG_SINK_PATH_OFFSET = 0x08;
export const LOG_SINK_FILE_OFFSET = 0x0c;
export const LOG_WRITE_STACK_BYTES = 0x0c;
export const LOG_WRITE_ARG_COUNT = 3;
export const LOG_WRITE_BODY_BYTES = 0x52;
export const LOG_WRITE_INSN_COUNT = 32;
export const LOG_WRITE_SIBLING_BODY_BYTES = 0x2c;
export const LOG_LOGGER_WRITE_SIZE_IMM = 1;
export const LOG_FOPEN_MODE_VA = 0x00b9e938;
export const LOG_WRITE_DIRECT_CALLSITES = 0;
export const LOG_WRITE_TAIL_JUMPS = 0;
export const LOG_WRITE_RAW_OCCURRENCES = 1;
export const LOG_WRITE_LOGGER_DISPATCH_SITES = 1;
export const LOG_WRITE_INBOUND_EXTERIOR = 0;
export const LOG_FWRITE_SITES = 5;
export const LOG_FFLUSH_SITES = 5;
export const LOG_FOPEN_SITES = 5;
export const LOG_WRITE_FWRITE_SITES_IN_BODY = 1;
export const LOG_WRITE_FFLUSH_SITES_IN_BODY = 2;
export const LOG_SINK_VTABLE_TEXT_STORES = 2;
export const LOG_WRITE_ACTION_NONE = 0;
export const LOG_WRITE_ACTION_FWRITE = 1;
export const LOG_WRITE_ACTION_FFLUSH = 2;
export const LOG_WRITE_ACTIONS_MAX = 2;
export const LOG_TEXT_INSN_COUNT_V6 = 2094319;
export const LOG_TEXT_UNDECODABLE_BYTES_V6 = 469;
export const LOG_V6_BATCHED_VAS = 10;
export const LOG_V6_EXACT_ZHL_MATCHES = 0;
export const LOG_VA_SIBLING_WRITE = 0x00a52850;
export const LOG_VA_SIBLING_WRITE_END = 0x00a5287c;
export const LOG_VA_SIBLING_WRITE_STATE_TEST = 0x00a52853;
export const LOG_VA_SIBLING_WRITE_STATE_BRANCH = 0x00a52857;
export const LOG_VA_SIBLING_WRITE_SKIP_RET = 0x00a5285c;
export const LOG_VA_SIBLING_WRITE_FWRITE = 0x00a5286b;
export const LOG_VA_SIBLING_WRITE_IMUL = 0x00a52874;
export const LOG_VA_SIBLING_WRITE_OK_RET = 0x00a52879;
export const LOG_VA_SIBLING_FLUSH = 0x00a52880;
export const LOG_VA_SIBLING_FLUSH_END = 0x00a5288b;
export const LOG_VA_SIBLING_FREAD = 0x00a52820;
export const LOG_VA_SIBLING_OPEN_WRITE = 0x00a52610;
export const LOG_VA_SIBLING_OPEN_READ = 0x00a52540;
export const LOG_VA_NEXT_ISLAND = 0x00a84030;
export const LOG_SIBLING_VTABLE_VA = 0x00b9e940;
export const LOG_VA_SIBLING_VTBL_WRITE_ENTRY = 0x00b9e95c;
export const LOG_VA_SIBLING_VTBL_FLUSH_ENTRY = 0x00b9e960;
export const LOG_VA_SIBLING_VTBL_FREAD_ENTRY = 0x00b9e954;
export const LOG_IAT_FREAD = 0x00b188c8;
export const LOG_FOPEN_MODE_AB_VA = 0x00b6d104;
export const LOG_FOPEN_MODE_RB_VA = 0x00b6d108;
export const LOG_SIBLING_WRITE_BODY_BYTES = 0x2c;
export const LOG_SIBLING_WRITE_INSN_COUNT = 16;
export const LOG_SIBLING_FLUSH_BODY_BYTES = 0x0b;
export const LOG_SIBLING_SHARED_PREFIX_BYTES = 3;
export const LOG_SIBLING_FREAD_SHARED_BYTES = 42;
export const LOG_SIBLING_FREAD_DIFF_BYTES = 2;
export const LOG_SIBLING_WRITE_DIRECT_CALLSITES = 0;
export const LOG_SIBLING_WRITE_TAIL_JUMPS = 0;
export const LOG_SIBLING_WRITE_RAW_OCCURRENCES = 1;
export const LOG_SIBLING_FLUSH_RAW_OCCURRENCES = 1;
export const LOG_SIBLING_FREAD_RAW_OCCURRENCES = 2;
export const LOG_SIBLING_WRITE_INBOUND_EXTERIOR = 0;
export const LOG_SIBLING_VTABLE_TEXT_STORES = 14;
export const LOG_SIBLING_WRITE_FWRITE_SITES_IN_BODY = 1;
export const LOG_SIBLING_WRITE_FFLUSH_SITES_IN_BODY = 0;
export const LOG_SIBLING_FLUSH_FFLUSH_SITES_IN_BODY = 1;
export const LOG_FREAD_SITES = 1;
export const LOG_SIBLING_WRITE_ACTION_NONE = 0;
export const LOG_SIBLING_WRITE_ACTION_FWRITE = 1;
export const LOG_SIBLING_WRITE_ACTIONS_MAX = 1;
export const LOG_TEXT_INSN_COUNT_V7 = 2094319;
export const LOG_TEXT_UNDECODABLE_BYTES_V7 = 469;
export const LOG_V7_BATCHED_VAS = 12;
export const LOG_V7_EXACT_ZHL_MATCHES = 0;
export const LOG_VA_SIBLING_FREAD_END = 0x00a5284c;
export const LOG_VA_SIBLING_FREAD_STATE_TEST = 0x00a52823;
export const LOG_VA_SIBLING_FREAD_STATE_BRANCH = 0x00a52827;
export const LOG_VA_SIBLING_FREAD_SKIP_RET = 0x00a5282c;
export const LOG_VA_SIBLING_FREAD_FREAD = 0x00a5283b;
export const LOG_VA_SIBLING_FREAD_IMUL = 0x00a52844;
export const LOG_VA_SIBLING_FREAD_OK_RET = 0x00a52849;
export const LOG_VA_SINK_VTBL_FREAD_ENTRY = 0x00ba5198;
export const LOG_SINK_VTBL_SLOT_FREAD = 0x14;
export const LOG_SINK_STATE_OPEN_READ = 0;
export const LOG_SIBLING_FREAD_BODY_BYTES = 0x2c;
export const LOG_SIBLING_FREAD_INSN_COUNT = 16;
export const LOG_SIBLING_FREAD_DIRECT_CALLSITES = 0;
export const LOG_SIBLING_FREAD_TAIL_JUMPS = 0;
export const LOG_SIBLING_FREAD_INBOUND_EXTERIOR = 0;
export const LOG_SIBLING_FREAD_FREAD_SITES_IN_BODY = 1;
export const LOG_SIBLING_FREAD_FFLUSH_SITES_IN_BODY = 0;
export const LOG_SIBLING_FREAD_ACTION_NONE = 0;
export const LOG_SIBLING_FREAD_ACTION_FREAD = 1;
export const LOG_SIBLING_FREAD_ACTIONS_MAX = 1;
export const LOG_TEXT_INSN_COUNT_V8 = 2094319;
export const LOG_TEXT_UNDECODABLE_BYTES_V8 = 469;
export const LOG_V8_BATCHED_VAS = 7;
export const LOG_V8_EXACT_ZHL_MATCHES = 0;
export const LOG_PREFIX_LEN_INFO = 9;
export const LOG_PREFIX_LEN_NET = 8;
export const LOG_PREFIX_LEN_WARN = 9;
export const LOG_PREFIX_LEN_ERROR = 10;
export const LOG_PREFIX_LEN_ASSERT = 11;
export const LOG_PREFIX_LEN_DEFAULT = 0;

function u32(v) {
  return v >>> 0;
}

function i32(v) {
  return v | 0;
}

/* Prefix strings pinned from .rdata (raw offsets via the section table). */
export const LOG_PREFIX_TEXT = Object.freeze({
  [LOG_PREFIX_CASE_INFO]: "[INFO] - ",
  [LOG_PREFIX_CASE_NET]: "[NET] - ",
  [LOG_PREFIX_CASE_WARN]: "[WARN] - ",
  [LOG_PREFIX_CASE_ERROR]: "[ERROR] - ",
  [LOG_PREFIX_CASE_ASSERT]: "[ASSERT] - ",
  [LOG_PREFIX_CASE_DEFAULT]: "",
});

/* Cleanup `add esp, N` histogram over all 3286 callsites (N . sites).
   The 8 "split" sites take a first `add esp, 4` with the rest folded later;
   85 sites fold the whole cleanup into a later combined add. */
export const LOG_CLEANUP_HISTOGRAM = Object.freeze({
  0x8: 2336,
  0xc: 562,
  0x10: 173,
  0x14: 48,
  0x18: 27,
  0x1c: 25,
  0x20: 13,
  0x24: 4,
  0x2c: 1,
  0x30: 2,
  0x34: 1,
  0x40: 1,
  split: 8,
  folded: 85,
});

export const LOG_LOCK_ASSERT_STRING =
  "Trying to lock mutex that has not been initialized";
export const LOG_UNLOCK_ASSERT_STRING =
  "Trying to unlock mutex that has not been initialized";
export const LOG_INIT_WARN_STRING = "KAGE has already been initialized\n";
export const LOG_INIT_CMD_THREAD_STRING = "Command thread is already initialized\n";
export const LOG_BOOT_LOG_STRING = "Command Line: \n";
export const LOG_LIFECYCLE_OTHER_STRING =
  "SetEngineParameters must be called before calling KAGE::Initialize\n";

/* Every writer of the guard, enumerated — 4 total. */
export const LOG_GUARD_WRITER_SITES = Object.freeze({
  [0x00a11328]: 1,
  [0x00a1133b]: 2,
  [0x00a11381]: 0,
  [LOG_VA_SHUTDOWN_GUARD_STORE]: 1,
});

/* The 8 functions holding the 15 post-teardown logger sites. */
export const LOG_POST_TEARDOWN_LOG_FUNCTION_VAS = Object.freeze([
  0x00a12d50,
  0x00a157f0,
  0x00a159a0,
  0x00a230b0,
  0x00a23160,
  0x00a648b0,
  0x00a66a20,
  0x00a6f270,
]);

export const LOG_UNWIND_DESTROY_TAIL_JUMP_SITES = Object.freeze([
  0x00af0d76, 0x00b0bd2a, 0x00b11739, 0x00b118e5, 0x00b12134,
  0x00b123f9, 0x00b13655, 0x00b14071, 0x00b14087, 0x00b1409d,
]);

export const LOG_READY_BIT_PREDICATE_VAS = Object.freeze([
  0x00a1577a, 0x00a7139a, 0x00a713f8, 0x00a157fe, 0x00a159a3,
]);
export const LOG_LAZY_INIT_TEMPLATE_VAS = Object.freeze([0x00a1577a, 0x00a7139a]);
export const LOG_ASSERT_GUARD_TEMPLATE_VAS = Object.freeze([0x00a157fe, 0x00a159a3]);

/* The 16-byte index table at 0x00a114bc maps (level - 1) to a jump-table
   case; read from the raw image this unit:
   00 01 05 02 05 05 05 03 05 05 05 05 05 05 05 04. */
const PREFIX_INDEX = Object.freeze([
  0, 1, 5, 2, 5, 5, 5, 3, 5, 5, 5, 5, 5, 5, 5, 4,
]);


function ticksToMsImpl(nsHi, nsLo) {
  const ns = (BigInt(u32(nsHi)) << 32n) | BigInt(u32(nsLo));
  const magic =
    (BigInt(LOG_LOCK_MS_MAGIC_HI) << 32n) | BigInt(LOG_LOCK_MS_MAGIC_LO);
  const prod = ns * magic;
  const sh = 64n + BigInt(LOG_LOCK_MS_SHIFT);
  const ms = prod >> sh;
  return { lo: Number(ms & 0xffffffffn) >>> 0, hi: Number(ms >> 32n) >>> 0 };
}

export function logLockTicksToMs(hi, lo) {
  const ns = (BigInt(u32(hi)) << 32n) | BigInt(u32(lo));
  return ns / BigInt(LOG_LOCK_MS_DIVISOR);
}

/* ================== v5 destroy: DELIBERATELY A DIFFERENT SHAPE FROM THE C++
 *  Trace interpreter over the recorded per-variant instruction list.
 *  DESTROY_TRACES is the single source every v5 oracle scalar can read. */
const DESTROY_TRACES = Object.freeze({
  0: {
    bodyVa: 0x00a157c0,
    entryVtbl: 0,
    exitVtbl: 0,
    clearVa: 0x00a157e4,
    retPops: 0,
    returnsThis: 0,
    deleteFlagGate: 0,
    logger: 0,
    storesVtable: 0,
  },
  1: {
    bodyVa: 0x00a15730,
    entryVtbl: 0x00b81c0c,
    exitVtbl: 0x00ba04b4,
    clearVa: 0x00a1575a,
    retPops: 0,
    returnsThis: 0,
    deleteFlagGate: 0,
    logger: 0,
    storesVtable: 1,
  },
  2: {
    bodyVa: 0x00a156e0,
    entryVtbl: 0x00b81c0c,
    exitVtbl: 0x00ba04b4,
    clearVa: 0x00a1570d,
    retPops: 4,
    returnsThis: 1,
    deleteFlagGate: 1,
    logger: 0,
    storesVtable: 1,
  },
  3: {
    bodyVa: 0x00a71bbf,
    entryVtbl: 0,
    exitVtbl: 0,
    clearVa: 0x00a71be5,
    retPops: 0,
    returnsThis: 0,
    deleteFlagGate: 0,
    logger: 1,
    storesVtable: 0,
  },
  4: {
    bodyVa: 0x00b16b20,
    entryVtbl: 0x00b81c0c,
    exitVtbl: 0x00ba04b4,
    clearVa: 0x00b16b51,
    retPops: 0,
    returnsThis: 0,
    deleteFlagGate: 0,
    logger: 1,
    storesVtable: 1,
  },
});

function knownVariant(variant) {
  return DESTROY_TRACES[u32(variant)] !== undefined;
}

function runDestroy(variant, holderFlags, critsecPtr, deleteFlag) {
  const tr = DESTROY_TRACES[u32(variant)];
  if (!tr) {
    return { state: { flags: u32(holderFlags), critsec: u32(critsecPtr) }, actions: [] };
  }
  const actions = [];
  let flags = u32(holderFlags);
  let critsec = u32(critsecPtr);
  if (tr.storesVtable) {
    actions.push(LOG_DESTROY_ACTION_STORE_ENTRY_VTABLE);
  }
  if (critsec !== 0) {
    actions.push(LOG_DESTROY_ACTION_DELETE_CRITICAL_SECTION);
    actions.push(LOG_DESTROY_ACTION_FREE_CRITSEC);
    actions.push(LOG_DESTROY_ACTION_STORE_NULL_CRITSEC);
    critsec = 0;
  }
  actions.push(LOG_DESTROY_ACTION_CLEAR_READY_BIT);
  flags = ((flags & 0xffffff00) | ((flags & 0xff) & LOG_HOLDER_FLAGS_CLEAR_MASK)) >>> 0;
  if (tr.storesVtable) {
    actions.push(LOG_DESTROY_ACTION_STORE_EXIT_VTABLE);
  }
  if (tr.deleteFlagGate && ((u32(deleteFlag) & 0xff) & 1) !== 0) {
    actions.push(LOG_DESTROY_ACTION_FREE_OBJECT);
  }
  return { state: { flags, critsec }, actions, trace: tr };
}

function requireRun(variant, holderFlags, critsecPtr, deleteFlag) {
  return runDestroy(variant, holderFlags, critsecPtr, deleteFlag);
}

function levelLowByteImpl(level) {
  return level & 0xff;
}

function listenerHitImpl(ptr, mask, level) {
  if (ptr == 0) {
    return 0;
  }
  return (mask & level) != 0 ? 1 : 0;
}

function emitGateImpl(level, ptr, mask) {
  if (levelLowByteImpl(level) != 0) {
    return 1;
  }
  return listenerHitImpl(ptr, mask, level);
}

function guardBlocksImpl(guard) {
  return guard == 1 ? 1 : 0;
}

function guardAfterInitImpl(initOk) {
  const init_ok = initOk;
  return (init_ok & 0xff) != 0 ? 2 : 0;
}

function prefixCaseImpl(level) {
  const idx = (level >>> 0) - 1 >>> 0;  
  if (idx > (LOG_PREFIX_INDEX_BOUND)) {
    return LOG_PREFIX_CASE_DEFAULT;
  }

  const kIndex = [0, 1, 5, 2, 5, 5, 5, 3,
                                     5, 5, 5, 5, 5, 5, 5, 4];
  return (kIndex[idx]);
}

function prefixVaImpl(level) {
  switch (prefixCaseImpl(level)) {
    case LOG_PREFIX_CASE_INFO:
      return (LOG_PREFIX_VA_INFO);
    case LOG_PREFIX_CASE_NET:
      return (LOG_PREFIX_VA_NET);
    case LOG_PREFIX_CASE_WARN:
      return (LOG_PREFIX_VA_WARN);
    case LOG_PREFIX_CASE_ERROR:
      return (LOG_PREFIX_VA_ERROR);
    case LOG_PREFIX_CASE_ASSERT:
      return (LOG_PREFIX_VA_ASSERT);
    default:
      return (LOG_PREFIX_VA_DEFAULT);
  }
}

function prefixLenImpl(level) {
  switch (prefixCaseImpl(level)) {
    case LOG_PREFIX_CASE_INFO:
      return LOG_PREFIX_LEN_INFO;
    case LOG_PREFIX_CASE_NET:
      return LOG_PREFIX_LEN_NET;
    case LOG_PREFIX_CASE_WARN:
      return LOG_PREFIX_LEN_WARN;
    case LOG_PREFIX_CASE_ERROR:
      return LOG_PREFIX_LEN_ERROR;
    case LOG_PREFIX_CASE_ASSERT:
      return LOG_PREFIX_LEN_ASSERT;
    default:
      return LOG_PREFIX_LEN_DEFAULT;
  }
}

export function logGuardBlocks(guard) {
  return guardBlocksImpl(guard);
}

export function logListenerHitPre(listenerPtr, listenerMask, level) {
  const listener_ptr = listenerPtr;
  const listener_mask = listenerMask;
  return listenerHitImpl(listener_ptr, listener_mask, level);
}

export function logLevelLowByte(level) {
  return levelLowByteImpl(level);
}

export function logEmitGate(level, listenerPtr, listenerMask) {
  const listener_ptr = listenerPtr;
  const listener_mask = listenerMask;
  return emitGateImpl(level, listener_ptr, listener_mask);
}

export function logMessageDropped(guard, level, listenerPtr, listenerMask, initOk) {
  const listener_ptr = listenerPtr;
  const listener_mask = listenerMask;
  const init_ok = initOk;
  if (guardBlocksImpl(guard) != 0) {
    return 1;
  }
  if (emitGateImpl(level, listener_ptr, listener_mask) == 0) {
    return 1;
  }

  if (guard == 0 && (init_ok & 0xff) == 0) {
    return 1;
  }
  return 0;
}

export function logInitNeeded(guard, level, listenerPtr, listenerMask) {
  const listener_ptr = listenerPtr;
  const listener_mask = listenerMask;
  if (guardBlocksImpl(guard) != 0) {
    return 0;
  }
  if (emitGateImpl(level, listener_ptr, listener_mask) == 0) {
    return 0;
  }

  return guard == 0 ? 1 : 0;
}

export function logGuardAfterInit(initOk) {
  const init_ok = initOk;
  return guardAfterInitImpl(init_ok);
}

export function logGuardAfter(guard, level, listenerPtr, listenerMask, initOk) {
  const listener_ptr = listenerPtr;
  const listener_mask = listenerMask;
  const init_ok = initOk;
  if (guardBlocksImpl(guard) != 0) {
    return guard;  
  }
  if (emitGateImpl(level, listener_ptr, listener_mask) == 0) {
    return guard;  
  }
  if (guard == 0) {

    return guardAfterInitImpl(init_ok);
  }
  return guard;  
}

export function logInitAlwaysSucceeds() {

  return 1;
}

export function logPrefixCase(level) {
  return prefixCaseImpl(level);
}

export function logPrefixVa(level) {
  return prefixVaImpl(level);
}

export function logPrefixLen(level) {
  return prefixLenImpl(level);
}

export function logPrefixWritten(atLineStartByte) {
  const at_line_start_byte = atLineStartByte;

  return (at_line_start_byte & 0xff) != 0 ? 1 : 0;
}

export function logAppendDestOff(len) {

  return len;
}

export function logAppendCapacity(len) {

  return ((LOG_BUFFER_CAPACITY) - (len >>> 0)) >>> 0;
}

export function logConsoleGate(level) {

  return levelLowByteImpl(level) != 0 ? 1 : 0;
}

export function logListenerGatePost(preFlagByte, listenerPtrPost, listenerMaskPost, level) {
  const pre_flag_byte = preFlagByte;
  const listener_ptr_post = listenerPtrPost;
  const listener_mask_post = listenerMaskPost;

  if ((pre_flag_byte & 0xff) == 0) {
    return 0;
  }

  return listenerHitImpl(listener_ptr_post, listener_mask_post, level);
}

export function logNextAtLineStart(appendedLen, lastByte) {
  const appended_len = appendedLen;
  const last_byte = lastByte;
  if (appended_len == 0) {

    return 0;
  }
  return (last_byte & 0xff) ==
                 (LOG_NEWLINE_BYTE)
             ? 1
             : 0;
}

export function logEmptyAppendClearsLineStart() {
  return 1;  
}

export function logBufferResetByte() {

  return 0;
}

export function logInitialAtLineStart() {

  return 1;
}

/* v17: the mid-body dispatch + tail length laws (D-LOG-15/16/17).
 * Independent PE-truth: the listener write pushes the SECOND strlen pass
 * (0xa11440, after the vsnprintf), the newline cmp reads the THIRD pass
 * (0xa11453, after the vcall), and the dispatch return is dead. NOT
 * transliterated from the C++: transcribed from the instruction stream in
 * the v17 notes. */
export function logDispatchNmembLen(appendLen, dispatchLen) {
  void appendLen; /* the machine re-derives; the snapshot is not pushed */
  return u32(dispatchLen);
}

export function logTailLenAfterDispatch(dispatchLen, tailLen) {
  void dispatchLen; /* the machine recaptures after the vcall */
  return u32(tailLen);
}

export function logDispatchReturnDropped() {
  return 1; /* eax after call esi 0xa11451 is never consumed (D-LOG-17) */
}

export function logDispatchStrlenPassVa() {
  return LOG_VA_DISPATCH_STRLEN_PASS;
}
export function logDispatchNmembPushVa() {
  return LOG_VA_DISPATCH_NMEMB_PUSH;
}
export function logTailStrlenPassVa() {
  return LOG_VA_TAIL_STRLEN_PASS;
}
export function logTailNewlineCmpVa() {
  return LOG_VA_TAIL_NEWLINE_CMP;
}

export function logVarargDwordCount(addEspImm) {
  const add_esp_imm = addEspImm;

  return (add_esp_imm - 8) >>> 2;
}

export function logVaStartStackDisp() {

  return (LOG_VA_START_STACK_DISP);
}

export function logEmitPlan(input = {}) {
  const s = input || {};
  const level = u32(s.level);
  const guard = u32(s.guard);
  const listener_ptr = u32(s.listenerPtr);
  const listener_mask = u32(s.listenerMask);
  const at_line_start_byte = u32(s.atLineStartByte);
  const init_ok = u32(s.initOk);
  const out = {};


  const blocked = guardBlocksImpl(guard);
  const pre = listenerHitImpl(listener_ptr, listener_mask, level);
  const gate = emitGateImpl(level, listener_ptr, listener_mask);

  out.droppedGuard = blocked;
  out.listenerPre = 0;
  out.emitGate = 0;
  out.droppedGate = 0;
  out.initNeeded = 0;
  out.initFailDrops = 0;
  out.guardAfter = guard;
  out.lockNeeded = 0;
  out.prefixWritten = 0;
  out.prefixCase = -1;
  out.prefixVa = 0;
  out.prefixLen = 0;
  out.consoleNeeded = 0;
  out.unlockNeeded = 0;
  if (blocked != 0) {
    return out;  
  }


  out.listenerPre = pre;
  out.emitGate = gate;
  if (gate == 0) {
    out.droppedGate = 1;
    return out;  
  }
  if (guard == 0) {
    out.initNeeded = 1;
    if ((init_ok & 0xff) == 0) {

      out.initFailDrops = 1;
      out.guardAfter = 0;
      return out;
    }
    out.guardAfter = 2;
  }
  out.lockNeeded = 1;
  out.unlockNeeded = 1;  
  if ((at_line_start_byte & 0xff) != 0) {
    out.prefixWritten = 1;
    out.prefixCase = prefixCaseImpl(level);
    out.prefixVa = prefixVaImpl(level);
    out.prefixLen = prefixLenImpl(level);
  }
  out.consoleNeeded = levelLowByteImpl(level) != 0 ? 1 : 0;
  return out;
}

export function logTeardownFlushNeeded(listenerPtrPre) {
  const listener_ptr_pre = listenerPtrPre;

  return listener_ptr_pre != 0 ? 1 : 0;
}

export function logTeardownDestroyNeeded(listenerPtrPre, listenerPtrPost) {
  const listener_ptr_pre = listenerPtrPre;
  const listener_ptr_post = listenerPtrPost;

  if (listener_ptr_pre == 0) {
    return 0;
  }
  return listener_ptr_post != 0 ? 1 : 0;
}

export function logTeardownListenerPtrAfter(listenerPtrPre, listenerPtrPost) {
  const listener_ptr_pre = listenerPtrPre;
  const listener_ptr_post = listenerPtrPost;
  if (logTeardownDestroyNeeded(listener_ptr_pre, listener_ptr_post) !=
      0) {
    return 0;  
  }
  if (listener_ptr_pre == 0) {

    return listener_ptr_pre;
  }

  return listener_ptr_post;
}

export function logTeardownListenerMaskAfter(listenerMaskBefore) {
  const listener_mask_before = listenerMaskBefore;


  return 0;
}

export function logTeardownMaskClearUnconditional() {
  return 1;
}

export function logTeardownSecondFlushReached(listenerPtrPre, listenerPtrPost) {
  const listener_ptr_pre = listenerPtrPre;
  const listener_ptr_post = listenerPtrPost;

  return logTeardownListenerPtrAfter(listener_ptr_pre,
                                               listener_ptr_post) != 0
             ? 1
             : 0;
}

export function logTeardownEngaged(guard) {

  return guard == (LOG_TEARDOWN_ENGAGE_VALUE) ? 1
                                                                         : 0;
}

export function logTeardownCritsecDeleteNeeded(guard, critsecPtr) {
  const critsec_ptr = critsecPtr;
  if (logTeardownEngaged(guard) == 0) {
    return 0;
  }

  return critsec_ptr != 0 ? 1 : 0;
}

export function logTeardownCritsecPtrAfter(guard, critsecPtr) {
  const critsec_ptr = critsecPtr;
  if (logTeardownCritsecDeleteNeeded(guard, critsec_ptr) != 0) {
    return 0;  
  }
  return critsec_ptr;
}

export function logTeardownHolderFlagsAfter(guard, holderFlags) {
  const holder_flags = holderFlags;

  const cell = holder_flags & 0xff;
  if (logTeardownEngaged(guard) == 0) {
    return cell;  
  }

  return cell & (LOG_HOLDER_FLAGS_CLEAR_MASK);
}

export function logTeardownGuardAfter(guard) {
  if (logTeardownEngaged(guard) == 0) {

    return guard;
  }
  return 1;  
}

export function logTeardownByteAfter(guard) {


  return 0;
}

export function logPostTeardownBlocksAll(guardBefore) {
  const guard_before = guardBefore;

  return logGuardBlocks(logTeardownGuardAfter(guard_before));
}

export function logTeardownLeavesLoggerLive(guardBefore) {
  const guard_before = guardBefore;
  return logPostTeardownBlocksAll(guard_before) != 0 ? 0 : 1;
}

export function logTeardownCritsecFreeSize() {

  return (LOG_CRITSEC_SIZE);
}

export function logInstallerPrevDestroyNeeded(prevListenerPtr) {
  const prev_listener_ptr = prevListenerPtr;

  return prev_listener_ptr != 0 ? 1 : 0;
}

export function logInstallerListenerPtrAfter(sinkPtr) {
  const sink_ptr = sinkPtr;

  return sink_ptr;
}

export function logInstallerListenerMaskAfter(sinkPtr) {
  const sink_ptr = sinkPtr;


  return (LOG_INSTALLER_MASK);
}

export function logInstallerMaskUnconditional() {
  return 1;
}

export function logInstallerMaskSetWithoutSink() {
  return 1;  
}

export function logInstallerSinkState(sinkPtr, fileHandle) {
  const sink_ptr = sinkPtr;
  const file_handle = fileHandle;
  if (sink_ptr == 0) {
    return LOG_SINK_STATE_NONE;
  }

  return file_handle != 0 ? LOG_SINK_STATE_OPEN
                           : LOG_SINK_STATE_NO_FILE;
}

export function logListenerHitAfterInstall(sinkPtr, level) {
  const sink_ptr = sinkPtr;
  return logListenerHitPre(
      logInstallerListenerPtrAfter(sink_ptr),
      logInstallerListenerMaskAfter(sink_ptr), level);
}

export function logTeardownPlan(input = {}) {
  const s = input || {};
  const guard = u32(s.guard);
  const listener_ptr_pre = u32(s.listenerPtrPre);
  const listener_ptr_post = u32(s.listenerPtrPost);
  const listener_mask = u32(s.listenerMask);
  const critsec_ptr = u32(s.critsecPtr);
  const holder_flags = u32(s.holderFlags);
  const out = {};



  out.flushNeeded = logTeardownFlushNeeded(listener_ptr_pre);
  out.destroyNeeded =
      logTeardownDestroyNeeded(listener_ptr_pre, listener_ptr_post);
  out.listenerPtrAfter =
      logTeardownListenerPtrAfter(listener_ptr_pre, listener_ptr_post);
  out.listenerMaskAfter =
      logTeardownListenerMaskAfter(listener_mask);
  out.secondFlushReached =
      logTeardownSecondFlushReached(listener_ptr_pre,
                                              listener_ptr_post);

  out.engaged = logTeardownEngaged(guard);
  out.critsecDeleteNeeded =
      logTeardownCritsecDeleteNeeded(guard, critsec_ptr);
  out.critsecPtrAfter =
      logTeardownCritsecPtrAfter(guard, critsec_ptr);
  out.holderFlagsAfter =
      logTeardownHolderFlagsAfter(guard, holder_flags);
  out.guardAfter = logTeardownGuardAfter(guard);
  out.loggerLiveAfter = logTeardownLeavesLoggerLive(guard);
  out.teardownByteAfter = logTeardownByteAfter(guard);
  return out;
}

export function logInitAlreadyInitialized(lifecycleByte) {
  const lifecycle_byte = lifecycleByte;

  return (lifecycle_byte & 0xff) != 0 ? 1 : 0;
}

export function logInitWarnLevel() {

  return (LOG_INIT_WARN_LEVEL);
}

export function logInitWarnVarargCount() {

  return logVarargDwordCount(
      (LOG_INIT_WARN_CLEANUP_IMM));
}

export function logInitArgsPublished() {

  return 1;
}

export function logInitObjectAllocated(allocResult) {
  const alloc_result = allocResult;

  return alloc_result != 0 ? 1 : 0;
}

export function logInitObjectAfter(objectBefore, allocResult) {
  const object_before = objectBefore;
  const alloc_result = allocResult;
  if (logInitObjectAllocated(alloc_result) == 0) {

    return object_before;
  }
  return alloc_result;
}

export function logInitCritsecInitRuns(critsecFlags) {
  const critsec_flags = critsecFlags;

  return ((critsec_flags & 0xff) &
          (LOG_INIT_CRITSEC_READY_BIT)) != 0
             ? 0
             : 1;
}

export function logInitCritsecFlagsAfter(critsecFlags) {
  const critsec_flags = critsecFlags;
  const cell = critsec_flags & 0xff;
  if (logInitCritsecInitRuns(critsec_flags) == 0) {
    return cell;  
  }

  return cell | (LOG_INIT_CRITSEC_READY_BIT);
}

export function logInitCritsecPtrAfter(critsecFlags, critsecPtrBefore, allocResult) {
  const critsec_flags = critsecFlags;
  const critsec_ptr_before = critsecPtrBefore;
  const alloc_result = allocResult;
  if (logInitCritsecInitRuns(critsec_flags) == 0) {
    return critsec_ptr_before;
  }

  return alloc_result;
}

export function logInitCritsecMarkedWithoutCritsec() {
  return 1;  
}

export function logInitCmdThreadWarns(cmdThreadFlags) {
  const cmd_thread_flags = cmdThreadFlags;

  return ((cmd_thread_flags & 0xff) &
          (LOG_INIT_CMD_THREAD_READY_BIT)) != 0
             ? 1
             : 0;
}

export function logInitCmdThreadCreates(cmdThreadFlags) {
  const cmd_thread_flags = cmdThreadFlags;
  return logInitCmdThreadWarns(cmd_thread_flags) != 0 ? 0 : 1;
}

export function logInitCmdThreadFlagsAfter(cmdThreadFlags) {
  const cmd_thread_flags = cmdThreadFlags;
  const cell = cmd_thread_flags & 0xff;
  if (logInitCmdThreadCreates(cmd_thread_flags) == 0) {

    return cell;
  }

  return cell |
         (LOG_INIT_CMD_THREAD_READY_BIT);
}

export function logInitLifecycleByteAfter(lifecycleBefore, initOk) {
  const lifecycle_before = lifecycleBefore;
  const init_ok = initOk;
  const cell = lifecycle_before & 0xff;
  if ((init_ok & 0xff) == 0) {

    return cell;
  }
  return 1;  
}

export function logInitDevirtualizesToMutexInit() {

  return 1;
}

export function logInitGuardAfter(guard, lifecycleByte, cmdThreadFlags) {
  const lifecycle_byte = lifecycleByte;
  const cmd_thread_flags = cmdThreadFlags;
  let g = guard;
  const level = logInitWarnLevel();

  const init_ok =
      (logInitAlwaysSucceeds());
  if (logInitAlreadyInitialized(lifecycle_byte) != 0) {
    g = logGuardAfter(g, level, 0, 0, init_ok);
  }
  if (logInitCmdThreadWarns(cmd_thread_flags) != 0) {
    g = logGuardAfter(g, level, 0, 0, init_ok);
  }
  return g;
}

export function logBootLogLevel() {

  return (LOG_BOOT_LOG_LEVEL);
}

export function logBootSiteDominatesTeardown() {

  return 1;
}

export function logGuardAfterBootSite(guardBefore) {
  const guard_before = guardBefore;
  return logGuardAfter(
      guard_before, logBootLogLevel(), 0, 0,
      (logInitAlwaysSucceeds()));
}

export function logShippedGuardAtTeardown(guardAtBootSite) {
  const guard_at_boot_site = guardAtBootSite;

  return logGuardAfterBootSite(guard_at_boot_site);
}

export function logGuardZeroAtTeardownReachable() {
  return 0;  
}

export function logShippedTeardownLeavesLoggerLive() {

  return logTeardownLeavesLoggerLive(
      logShippedGuardAtTeardown(
          (LOG_GUARD_UNINIT)));
}

export function logShippedPostTeardownBlocksAll(guardAtBootSite) {
  const guard_at_boot_site = guardAtBootSite;
  return logPostTeardownBlocksAll(
      logShippedGuardAtTeardown(guard_at_boot_site));
}

export function logGuardValueReachable(guard) {

  return (guard == (LOG_GUARD_UNINIT) ||
          guard == (LOG_GUARD_BUSY) ||
          guard == (LOG_GUARD_READY))
             ? 1
             : 0;
}

export function logLifecycleByteAfterInitThenTeardown(lifecycleBefore, initOk) {
  const lifecycle_before = lifecycleBefore;
  const init_ok = initOk;

  const after_init =
      logInitLifecycleByteAfter(lifecycle_before, init_ok);
  return logTeardownByteAfter(after_init);
}

export function logInitPlan(input = {}) {
  const s = input || {};
  const lifecycle_byte = u32(s.lifecycleByte);
  const guard = u32(s.guard);
  const object_before = u32(s.objectBefore);
  const object_alloc = u32(s.objectAlloc);
  const critsec_flags = u32(s.critsecFlags);
  const critsec_ptr_before = u32(s.critsecPtrBefore);
  const critsec_alloc = u32(s.critsecAlloc);
  const cmd_thread_flags = u32(s.cmdThreadFlags);
  const init_ok = u32(s.initOk);
  const out = {};


  const already = logInitAlreadyInitialized(lifecycle_byte);
  const warns = logInitCmdThreadWarns(cmd_thread_flags);

  out.alreadyInitialized = already;
  out.warnEmitted = already;
  out.argsPublished = logInitArgsPublished();
  out.objectAllocated = logInitObjectAllocated(object_alloc);
  out.objectAfter = logInitObjectAfter(object_before, object_alloc);
  out.critsecInitRuns = logInitCritsecInitRuns(critsec_flags);
  out.critsecFlagsAfter = logInitCritsecFlagsAfter(critsec_flags);
  out.critsecPtrAfter = logInitCritsecPtrAfter(
      critsec_flags, critsec_ptr_before, critsec_alloc);
  out.cmdThreadWarns = warns;
  out.cmdThreadCreates = logInitCmdThreadCreates(cmd_thread_flags);
  out.cmdThreadFlagsAfter =
      logInitCmdThreadFlagsAfter(cmd_thread_flags);
  out.logSitesTaken = already + warns;
  out.guardAfter =
      logInitGuardAfter(guard, lifecycle_byte, cmd_thread_flags);
  out.returnsOk = (init_ok & 0xff) != 0 ? 1 : 0;
  out.lifecycleByteAfter =
      logInitLifecycleByteAfter(lifecycle_byte, init_ok);
  return out;
}

function readyBitSetImpl(holderFlags) {
  const holder_flags = holderFlags;
  return ((holder_flags & 0xff) &
          (LOG_LOCK_READY_BIT)) != 0
             ? 1
             : 0;
}

function ownedLowByteSetImpl(ownedByte) {
  const owned_byte = ownedByte;
  return (owned_byte & 0xff) != 0 ? 1 : 0;
}

export function logLockAssertFires(holderFlags) {
  const holder_flags = holderFlags;

  return readyBitSetImpl(holder_flags) != 0 ? 0 : 1;
}

export function logUnlockAssertFires(holderFlags) {
  const holder_flags = holderFlags;

  return ((holder_flags & 0xff) &
          (LOG_LOCK_READY_BIT)) == 0
             ? 1
             : 0;
}

export function logLockAssertStringVa(isUnlock, holderFlags) {
  const is_unlock = isUnlock;
  const holder_flags = holderFlags;
  if (is_unlock != 0) {
    return logUnlockAssertFires(holder_flags) != 0
               ? (LOG_UNLOCK_ASSERT_STRING_VA)
               : 0;
  }
  return logLockAssertFires(holder_flags) != 0
             ? (LOG_LOCK_ASSERT_STRING_VA)
             : 0;
}

export function logLockAssertVarargCount() {

  return logVarargDwordCount(
      (LOG_LOCK_ASSERT_CLEANUP_IMM));
}

export function logLockAssertSetsReadyBit() {

  return 0;
}

export function logLockAssertIsLazyInitTemplate() {

  return 0;
}

export function logLockHolderFlagsAfter(holderFlags) {
  const holder_flags = holderFlags;
  return holder_flags & 0xff;
}

export function logLockAssertReachableFromLogger() {
  return 0;
}

export function logLockTimeoutInfinite(timeout) {

  return timeout == (LOG_LOCK_TIMEOUT_INFINITE)
             ? 1
             : 0;
}

export function logLockTimeoutArm(timeout) {
  if (logLockTimeoutInfinite(timeout) != 0) {
    return LOG_LOCK_ARM_INFINITE;
  }

  if (timeout == 0) {
    return LOG_LOCK_ARM_ZERO_TIMEOUT;
  }
  return LOG_LOCK_ARM_TIMED;
}

export function logLockZeroTimeoutTries() {

  return 0;
}

export function logLockSpinEntered(ownedByte) {
  const owned_byte = ownedByte;

  return ownedLowByteSetImpl(owned_byte);
}

export function logLockSpinContinues(ownedByte) {
  const owned_byte = ownedByte;

  return ownedLowByteSetImpl(owned_byte);
}

export function logLockSpinSleepMs() {
  return LOG_LOCK_SPIN_SLEEP_MS;
}

export function logLockSpinReloadsCritsec() {

  return 0;
}

export function logLockTimedReloadsCritsec() {

  return 1;
}

export function logLockSpinBounded() {
  return 0;
}

export function logLockSpinReadsSleepPointerPerIteration() {

  return 0;
}

export function logLockSpinHoldsCritsec() {

  return 1;
}

export function logUnlockEntersCritsec() {

  return 0;
}

export function logLockSelfReentrantSpinsForever() {
  return 1;
}

export function logLockSpinIterations(ownedByte, clearAfter, everClears) {
  const owned_byte = ownedByte;
  const clear_after = clearAfter;
  const ever_clears = everClears;
  if (logLockSpinEntered(owned_byte) == 0) {
    return 0;  
  }
  if (ever_clears == 0) {
    return LOG_LOCK_SPIN_NEVER_RETURNS;
  }

  return clear_after == 0 ? 1 : clear_after;
}

export function logLockTryEntered(tryResult) {
  const try_result = tryResult;

  return try_result != 0 ? 1 : 0;
}

export function logLockTryArm(tryResult, ownedByte) {
  const try_result = tryResult;
  const owned_byte = ownedByte;
  if (logLockTryEntered(try_result) == 0) {

    return LOG_LOCK_TRY_ARM_SLEEP;
  }
  if (ownedLowByteSetImpl(owned_byte) != 0) {

    return LOG_LOCK_TRY_ARM_LEAVE_AND_SLEEP;
  }

  return LOG_LOCK_TRY_ARM_SUCCESS;
}

export function logLockTryLeaves(tryResult, ownedByte) {
  const try_result = tryResult;
  const owned_byte = ownedByte;
  return logLockTryArm(try_result, owned_byte) ==
                 LOG_LOCK_TRY_ARM_LEAVE_AND_SLEEP
             ? 1
             : 0;
}

export function logLockRetrySleepMs() {
  return LOG_LOCK_RETRY_SLEEP_MS;
}

export function logLockTicksToMsLo(nsHi, nsLo) {
  return ticksToMsImpl(nsHi, nsLo).lo;
}

export function logLockTicksToMsHi(nsHi, nsLo) {
  return ticksToMsImpl(nsHi, nsLo).hi;
}

export function logLockElapsedExpired(elapsedHi, elapsedLo, timeout) {
  const elapsed_hi = elapsedHi;
  const elapsed_lo = elapsedLo;

  if (elapsed_hi != 0) {
    return 1;
  }

  return elapsed_lo < timeout ? 0 : 1;
}

export function logLockUnderflowBranchDead() {
  return 1;
}

export function logLockStartRefetched() {

  return 0;
}

export function logLockNowRefetched() {

  return 1;
}

export function logLockMarksOwned(timeout, tryResult, ownedByte) {
  const try_result = tryResult;
  const owned_byte = ownedByte;
  const arm = logLockTimeoutArm(timeout);
  if (arm == LOG_LOCK_ARM_INFINITE) {

    return 1;
  }
  if (arm == LOG_LOCK_ARM_ZERO_TIMEOUT) {
    return 0;
  }



  return 0;
}

export function logLockOwnedByteAfter(timeout, tryResult, ownedByte) {
  const try_result = tryResult;
  const owned_byte = ownedByte;
  if (logLockMarksOwned(timeout, try_result, owned_byte) != 0) {
    return LOG_LOCK_OWNED_VALUE;
  }
  return owned_byte & 0xff;
}

export function logTimedSuccessSkipsOwnedStore() {
  return 1;
}

export function logLockAcquired(timeout, tryResult, ownedByte, elapsedHi, elapsedLo) {
  const try_result = tryResult;
  const owned_byte = ownedByte;
  const elapsed_hi = elapsedHi;
  const elapsed_lo = elapsedLo;
  const arm = logLockTimeoutArm(timeout);
  if (arm == LOG_LOCK_ARM_INFINITE) {
    return 1;  
  }
  if (arm == LOG_LOCK_ARM_ZERO_TIMEOUT) {
    return 0;  
  }
  if (logLockTryArm(try_result, owned_byte) ==
      LOG_LOCK_TRY_ARM_SUCCESS) {
    return 1;
  }

  return logLockElapsedExpired(elapsed_hi, elapsed_lo, timeout) != 0
             ? 0
             : -1;  
}

export function logUnlockOwnedByteAfter(ownedBefore) {
  const owned_before = ownedBefore;


  return 0;
}

export function logUnlockClearsBeforeLeave() {

  return 1;
}

export function logUnlockTakesTimeout() {

  return 0;
}

export function logLockNullCritsecReached(holderFlags, critsecPtr) {
  const holder_flags = holderFlags;
  const critsec_ptr = critsecPtr;

  if (critsec_ptr != 0) {
    return 0;
  }
  return readyBitSetImpl(holder_flags);
}

export function logLockAssertsOnFailedInit() {
  return 0;
}

export function logLockFirstNullAccessVa(isUnlock, timeout) {
  const is_unlock = isUnlock;
  if (is_unlock != 0) {

    return LOG_VA_UNLOCK_OWNED_STORE;
  }
  return logLockTimeoutArm(timeout) == LOG_LOCK_ARM_INFINITE
             ? (LOG_VA_LOCK_ENTER_CALL)
             : (LOG_VA_LOCK_TRY_CALL);
}

export function logLockPlan(input = {}) {
  const s = input || {};
  const holder_flags = u32(s.holderFlags);
  const critsec_ptr = u32(s.critsecPtr);
  const timeout = u32(s.timeout);
  const owned_byte = u32(s.ownedByte);
  const try_result = u32(s.tryResult);
  const spin_ever_clears = u32(s.spinEverClears);
  const elapsed_hi = u32(s.elapsedHi);
  const elapsed_lo = u32(s.elapsedLo);
  const out = {};


  const arm = logLockTimeoutArm(timeout);
  const fires = logLockAssertFires(holder_flags);
  out.assertFires = fires;
  out.assertStringVa = logLockAssertStringVa(0, holder_flags);
  out.arm = arm;
  out.enterCall = arm == LOG_LOCK_ARM_INFINITE ? 1 : 0;
  out.tryCall = arm == LOG_LOCK_ARM_TIMED ? 1 : 0;
  out.leaveCall = arm == LOG_LOCK_ARM_TIMED
                        ? logLockTryLeaves(try_result, owned_byte)
                        : 0;
  out.spinEntered = arm == LOG_LOCK_ARM_INFINITE
                          ? logLockSpinEntered(owned_byte)
                          : 0;
  if (arm == LOG_LOCK_ARM_INFINITE) {
    out.sleepMs = out.spinEntered != 0 ? logLockSpinSleepMs()
                                           : 0;
  } else if (arm == LOG_LOCK_ARM_TIMED) {
    out.sleepMs = logLockTryArm(try_result, owned_byte) ==
                            LOG_LOCK_TRY_ARM_SUCCESS
                        ? 0
                        : logLockRetrySleepMs();
  } else {
    out.sleepMs = 0;
  }
  const spins_forever =
      arm == LOG_LOCK_ARM_INFINITE && out.spinEntered != 0 &&
      spin_ever_clears == 0;
  out.returns = spins_forever ? 0 : 1;
  const al =
      logLockAcquired(timeout, try_result, owned_byte, elapsed_hi,
                              elapsed_lo);
  out.acquired = spins_forever ? 0 : al;
  const marks =
      logLockMarksOwned(timeout, try_result, owned_byte);
  out.marksOwned = spins_forever ? 0 : marks;
  out.ownedByteAfter =
      spins_forever
          ? (owned_byte & 0xff)
          : logLockOwnedByteAfter(timeout, try_result, owned_byte);
  out.critsecPtr = critsec_ptr;
  out.nullCritsecFault =
      logLockNullCritsecReached(holder_flags, critsec_ptr);
  out.faultVa = out.nullCritsecFault != 0
                      ? logLockFirstNullAccessVa(0, timeout)
                      : 0;
  return out;
}

export function logUnlockPlan(input = {}) {
  const s = input || {};
  const holder_flags = u32(s.holderFlags);
  const critsec_ptr = u32(s.critsecPtr);
  const owned_byte = u32(s.ownedByte);
  const out = {};


  out.assertFires = logUnlockAssertFires(holder_flags);
  out.assertStringVa = logLockAssertStringVa(1, holder_flags);
  out.arm = -1;       
  out.enterCall = logUnlockEntersCritsec();
  out.tryCall = 0;
  out.leaveCall = 1;  
  out.spinEntered = 0;
  out.sleepMs = 0;
  out.returns = 1;
  out.acquired = 0;
  out.marksOwned = 0;
  out.ownedByteAfter = logUnlockOwnedByteAfter(owned_byte);
  out.critsecPtr = critsec_ptr;
  out.nullCritsecFault =
      logLockNullCritsecReached(holder_flags, critsec_ptr);
  out.faultVa =
      out.nullCritsecFault != 0
          ? logLockFirstNullAccessVa(1, 0)
          : 0;
  return out;
}

function destroyBodyVaImpl(variant) {
  switch (variant) {
    case LOG_DESTROY_VARIANT_DESTROY:
      return LOG_VA_MUTEX_DESTROY;
    case LOG_DESTROY_VARIANT_UNWIND:
      return LOG_VA_MUTEX_UNWIND_DESTROY;
    case LOG_DESTROY_VARIANT_DTOR:
      return LOG_VA_MUTEX_DTOR;
    case LOG_DESTROY_VARIANT_TEARDOWN:
      return LOG_VA_TEARDOWN_INLINE_DESTROY;
    case LOG_DESTROY_VARIANT_STATIC:
      return LOG_VA_STATIC_DTOR;
    default:
      return 0;
  }
}

function destroyStoresVtableImpl(variant) {
  return (variant == LOG_DESTROY_VARIANT_UNWIND ||
          variant == LOG_DESTROY_VARIANT_DTOR ||
          variant == LOG_DESTROY_VARIANT_STATIC)
             ? 1
             : 0;
}

function destroyVariantKnownImpl(variant) {
  return variant < (LOG_DESTROY_VARIANTS) ? 1 : 0;
}

export function logDestroyFreesCritsec(critsecPtr) {
  const critsec_ptr = critsecPtr;

  return critsec_ptr != 0 ? 1 : 0;
}

export function logDestroyStoresNullCritsec(critsecPtr) {
  const critsec_ptr = critsecPtr;

  return logDestroyFreesCritsec(critsec_ptr);
}

export function logDestroyCritsecPtrAfter(critsecPtr) {
  const critsec_ptr = critsecPtr;

  return logDestroyStoresNullCritsec(critsec_ptr) != 0 ? 0
                                                                 : critsec_ptr;
}

export function logDestroyCritsecFreeSize() {
  return (LOG_MUTEX_CRITSEC_SIZE);
}

export function logDestroySizedDeleteIgnoresSize() {

  return 1;
}

export function logDestroyFlagsAfter(holderFlags) {
  const holder_flags = holderFlags;

  const low = holder_flags & 0xff;
  const cleared =
      low & (LOG_HOLDER_FLAGS_CLEAR_MASK);
  return ((holder_flags & 0xffffff00) | cleared) >>> 0;
}

export function logDestroyClearsReadyBit() {
  return 1;
}

export function logDestroyClearUnconditional() {

  return 1;
}

export function logDestroyIsIdempotent() {

  return 1;
}

export function logDestroyVariants() {
  return (LOG_DESTROY_VARIANTS);
}

export function logDestroyBodyVa(variant) {
  return destroyBodyVaImpl(variant);
}

export function logDestroyEntryVtableVa(variant) {
  return destroyStoresVtableImpl(variant) != 0
             ? (LOG_MUTEX_VTABLE_VA)
             : 0;
}

export function logDestroyExitVtableVa(variant) {
  return destroyStoresVtableImpl(variant) != 0
             ? (LOG_VA_MUTEX_BASE_VTABLE)
             : 0;
}

export function logDestroyClearVa(variant) {
  switch (variant) {
    case LOG_DESTROY_VARIANT_DESTROY:
      return LOG_VA_DESTROY_CLEAR;
    case LOG_DESTROY_VARIANT_UNWIND:
      return LOG_VA_UNWIND_CLEAR;
    case LOG_DESTROY_VARIANT_DTOR:
      return LOG_VA_DTOR_CLEAR;
    case LOG_DESTROY_VARIANT_TEARDOWN:
      return LOG_VA_TEARDOWN_CLEAR;
    case LOG_DESTROY_VARIANT_STATIC:
      return LOG_VA_STATIC_DTOR_CLEAR;
    default:
      return 0;
  }
}

export function logDestroyStackBytesPopped(variant) {

  return variant == LOG_DESTROY_VARIANT_DTOR ? 4 : 0;
}

export function logDestroyReturnsThis(variant) {

  return variant == LOG_DESTROY_VARIANT_DTOR ? 1 : 0;
}

export function logDestroyHasDeleteFlagGate(variant) {
  return variant == LOG_DESTROY_VARIANT_DTOR ? 1 : 0;
}

export function logDestroyOperatesOnLoggerHolder(variant) {

  return (variant == LOG_DESTROY_VARIANT_TEARDOWN ||
          variant == LOG_DESTROY_VARIANT_STATIC)
             ? 1
             : 0;
}

export function logDestroyBodyBytes(variant) {
  switch (variant) {
    case LOG_DESTROY_VARIANT_DESTROY:
      return (LOG_DESTROY_BODY_BYTES);
    case LOG_DESTROY_VARIANT_UNWIND:
      return (LOG_UNWIND_DESTROY_BODY_BYTES);
    case LOG_DESTROY_VARIANT_DTOR:
      return (LOG_DTOR_BODY_BYTES);
    default:
      return 0;  
  }
}

export function logDestroySharedBytes(variantA, variantB) {
  const variant_a = variantA;
  const variant_b = variantB;
  const lo = variant_a < variant_b ? variant_a : variant_b;
  const hi = variant_a < variant_b ? variant_b : variant_a;
  if (lo == hi) {
    return logDestroyBodyBytes(lo);
  }
  if (lo == LOG_DESTROY_VARIANT_DESTROY &&
      hi == LOG_DESTROY_VARIANT_UNWIND) {
    return (LOG_DESTROY_SHARED_BYTES_0_1);
  }
  if (lo == LOG_DESTROY_VARIANT_UNWIND &&
      hi == LOG_DESTROY_VARIANT_DTOR) {
    return (LOG_DESTROY_SHARED_BYTES_1_2);
  }
  if (lo == LOG_DESTROY_VARIANT_DESTROY &&
      hi == LOG_DESTROY_VARIANT_DTOR) {
    return (LOG_DESTROY_SHARED_BYTES_0_2);
  }
  return 0;
}

export function logDestroyIsOneTemplate() {

  return 1;
}

export function logDtorFreesObject(deleteFlag) {
  const delete_flag = deleteFlag;

  return ((delete_flag & 0xff) &
          (LOG_MUTEX_DTOR_DELETE_BIT)) != 0
             ? 1
             : 0;
}

export function logDtorObjectFreeSize() {
  return (LOG_MUTEX_OBJECT_SIZE);
}

export function logDtorRestoresBaseVtableUnconditionally() {

  return 1;
}

export function logDtorVtableStorePreservesFlags() {

  return 1;
}

export function logReadyState(holderFlags, critsecPtr) {
  const holder_flags = holderFlags;
  const critsec_ptr = critsecPtr;
  const ready = readyBitSetImpl(holder_flags);
  if (ready != 0) {
    return critsec_ptr != 0 ? LOG_READY_STATE_LIVE
                             : LOG_READY_STATE_FAILED;
  }
  return critsec_ptr != 0 ? LOG_READY_STATE_IMPOSSIBLE
                           : LOG_READY_STATE_DOWN;
}

export function logReadyStateReachable(state) {

  return state == (LOG_READY_STATE_IMPOSSIBLE) ? 0
         : state <= (LOG_READY_STATE_FAILED) ? 1
                                                                        : 0;
}

export function logReadyStateAfterInit(holderFlags, critsecPtr, allocResult) {
  const holder_flags = holderFlags;
  const critsec_ptr = critsecPtr;
  const alloc_result = allocResult;

  if (readyBitSetImpl(holder_flags) != 0) {
    return logReadyState(holder_flags, critsec_ptr);
  }

  return alloc_result != 0 ? LOG_READY_STATE_LIVE
                            : LOG_READY_STATE_FAILED;
}

export function logReadyStateAfterDestroy(holderFlags, critsecPtr) {
  const holder_flags = holderFlags;
  const critsec_ptr = critsecPtr;
  return logReadyState(
      logDestroyFlagsAfter(holder_flags),
      logDestroyCritsecPtrAfter(critsec_ptr));
}

export function logHolderReadyBitSetters() {
  return (LOG_HOLDER_READY_BIT_SETTERS);
}

export function logHolderReadyBitClearers() {
  return (LOG_HOLDER_READY_BIT_CLEARERS);
}

export function logHolderReadyBitClearVa(index) {
  if (index == 0) {
    return (LOG_VA_TEARDOWN_CLEAR);
  }
  if (index == 1) {
    return (LOG_VA_STATIC_DTOR_CLEAR);
  }
  return 0;
}

export function logHolderReadyBitSetVa() {
  return (LOG_VA_HOLDER_READY_BIT_SET);
}

export function logLockNullDerefReached(holderFlags, critsecPtr) {
  const holder_flags = holderFlags;
  const critsec_ptr = critsecPtr;


  return critsec_ptr == 0 ? 1 : 0;
}

export function logDestroyThenLockAsserts(holderFlags, critsecPtr) {
  const holder_flags = holderFlags;
  const critsec_ptr = critsecPtr;


  return logLockAssertFires(
      logDestroyFlagsAfter(holder_flags));
}

export function logDestroyThenLockFaults(holderFlags, critsecPtr) {
  const holder_flags = holderFlags;
  const critsec_ptr = critsecPtr;
  return logLockNullDerefReached(
      logDestroyFlagsAfter(holder_flags),
      logDestroyCritsecPtrAfter(critsec_ptr));
}

export function logDestroyThenLockFaultVa(holderFlags, critsecPtr, timeout) {
  const holder_flags = holderFlags;
  const critsec_ptr = critsecPtr;
  return logDestroyThenLockFaults(holder_flags, critsec_ptr) != 0
             ? logLockFirstNullAccessVa(0, timeout)
             : 0;
}

export function logPostDestroyLockDispatchVa(variant) {

  if (destroyVariantKnownImpl(variant) == 0) {
    return 0;
  }
  return destroyStoresVtableImpl(variant) != 0
             ? (LOG_VA_MUTEX_BASE_PURECALL)
             : (LOG_VA_LOCK);
}

export function logDestroyHoldsLock() {

  return 0;
}

export function logDestroyClearsBeforeFree() {

  return 0;
}

export function logDestroyDanglingWindowStartVa(variant) {
  switch (variant) {
    case LOG_DESTROY_VARIANT_DESTROY:
      return LOG_VA_DESTROY_DELETE_CALL;
    case LOG_DESTROY_VARIANT_UNWIND:
      return 0x00a15742;
    case LOG_DESTROY_VARIANT_DTOR:
      return 0x00a156f5;
    case LOG_DESTROY_VARIANT_TEARDOWN:
      return LOG_VA_TEARDOWN_DELETE_CALL;
    case LOG_DESTROY_VARIANT_STATIC:
      return LOG_VA_STATIC_DTOR_DELETE_CALL;
    default:
      return 0;
  }
}

export function logDestroyDanglingWindowEndVa(variant) {
  return logDestroyClearVa(variant);
}

export function logDestroyDanglingWindowInsns(variant) {

  return destroyVariantKnownImpl(variant) != 0
             ? (LOG_DESTROY_DANGLING_WINDOW_INSNS)
             : 0;
}

export function logDestroyReachSites(variant, channel) {
  if (channel >= (LOG_REACH_CHANNELS)) {
    return 0;
  }
  switch (variant) {
    case LOG_DESTROY_VARIANT_DESTROY:
      return channel == (LOG_REACH_CHANNEL_RAW_DWORD)
                 ? (LOG_DESTROY_RAW_OCCURRENCES)
                 : 0;
    case LOG_DESTROY_VARIANT_DTOR:
      return channel == (LOG_REACH_CHANNEL_RAW_DWORD)
                 ? (LOG_DTOR_RAW_OCCURRENCES)
                 : 0;
    case LOG_DESTROY_VARIANT_UNWIND:

      return channel == (LOG_REACH_CHANNEL_TAIL_JUMP)
                 ? (LOG_UNWIND_DESTROY_TAIL_JUMPS)
                 : 0;
    default:
      return 0;  
  }
}

export function logDestroyTotalReach(variant) {
  let total = 0;
  for (let c = 0; c < (LOG_REACH_CHANNELS);
       c++) {
    total += logDestroyReachSites(variant, c);
  }
  return total;
}

export function logUnwindDestroyReachMeasured() {
  return (LOG_UNWIND_DESTROY_TAIL_JUMPS);
}

export function logUnwindDestroyReachV4Reported() {
  return (LOG_UNWIND_DESTROY_REACH_V4_REPORTED);
}

export function logUnwindDestroyIsDeadCode() {
  return logUnwindDestroyReachMeasured() == 0 ? 1 : 0;
}

export function logDestroyActionCount(variant, critsecPtr, deleteFlag) {
  const critsec_ptr = critsecPtr;
  const delete_flag = deleteFlag;
  if (destroyVariantKnownImpl(variant) == 0) {
    return 0;
  }
  let n = 1;  
  n += (destroyStoresVtableImpl(variant)) * 2;
  if (logDestroyFreesCritsec(critsec_ptr) != 0) {
    n += 3;  
  }
  if (logDestroyHasDeleteFlagGate(variant) != 0 &&
      logDtorFreesObject(delete_flag) != 0) {
    n += 1;
  }
  return n;
}

export function logDestroyActionAt(variant, critsecPtr, deleteFlag, index) {
  const critsec_ptr = critsecPtr;
  const delete_flag = deleteFlag;
  const seq = [];
  let n = 0;
  if (destroyVariantKnownImpl(variant) == 0) {
    return (LOG_DESTROY_ACTION_NONE);
  }
  if (destroyStoresVtableImpl(variant) != 0) {
    seq[n++] = LOG_DESTROY_ACTION_STORE_ENTRY_VTABLE;
  }
  if (logDestroyFreesCritsec(critsec_ptr) != 0) {
    seq[n++] = LOG_DESTROY_ACTION_DELETE_CRITICAL_SECTION;
    seq[n++] = LOG_DESTROY_ACTION_FREE_CRITSEC;
    seq[n++] = LOG_DESTROY_ACTION_STORE_NULL_CRITSEC;
  }
  seq[n++] = LOG_DESTROY_ACTION_CLEAR_READY_BIT;
  if (destroyStoresVtableImpl(variant) != 0) {
    seq[n++] = LOG_DESTROY_ACTION_STORE_EXIT_VTABLE;
  }
  if (logDestroyHasDeleteFlagGate(variant) != 0 &&
      logDtorFreesObject(delete_flag) != 0) {
    seq[n++] = LOG_DESTROY_ACTION_FREE_OBJECT;
  }
  return index < n ? seq[index]
                   : (LOG_DESTROY_ACTION_NONE);
}

export function logDestroyActionIsPlatform(action) {
  return (action ==
              (
                  LOG_DESTROY_ACTION_DELETE_CRITICAL_SECTION) ||
          action == (LOG_DESTROY_ACTION_FREE_CRITSEC) ||
          action == (LOG_DESTROY_ACTION_FREE_OBJECT))
             ? 1
             : 0;
}

export function logDestroyPlan(input = {}) {
  const s = input || {};
  const variant = u32(s.variant);
  const holder_flags = u32(s.holderFlags);
  const critsec_ptr = u32(s.critsecPtr);
  const delete_flag = u32(s.deleteFlag);
  const out = {};


  const known = destroyVariantKnownImpl(variant);
  if (known == 0) {
    out.variant = -1;
    out.bodyVa = 0;
    out.entryVtableVa = 0;
    out.deleteCriticalSection = 0;
    out.freeCritsec = 0;
    out.critsecFreeSize = 0;
    out.storesNullCritsec = 0;
    out.critsecPtrAfter = critsec_ptr;
    out.flagsAfter = holder_flags;
    out.clearsReadyBit = 0;
    out.exitVtableVa = 0;
    out.freesObject = 0;
    out.objectFreeSize = 0;
    out.returnsThis = 0;
    out.stackBytesPopped = 0;
    out.readyStateBefore = logReadyState(holder_flags, critsec_ptr);
    out.readyStateAfter = out.readyStateBefore;
    out.danglingWindowStartVa = 0;
    out.danglingWindowEndVa = 0;
    out.actionCount = 0;
    return out;
  }
  const frees = logDestroyFreesCritsec(critsec_ptr);
  out.variant = (variant);
  out.bodyVa = destroyBodyVaImpl(variant);
  out.entryVtableVa = logDestroyEntryVtableVa(variant);
  out.deleteCriticalSection = frees;
  out.freeCritsec = frees;
  out.critsecFreeSize =
      frees != 0 ? logDestroyCritsecFreeSize() : 0;
  out.storesNullCritsec = logDestroyStoresNullCritsec(critsec_ptr);
  out.critsecPtrAfter = logDestroyCritsecPtrAfter(critsec_ptr);
  out.flagsAfter = logDestroyFlagsAfter(holder_flags);
  out.clearsReadyBit = logDestroyClearsReadyBit();
  out.exitVtableVa = logDestroyExitVtableVa(variant);
  out.freesObject =
      logDestroyHasDeleteFlagGate(variant) != 0
          ? logDtorFreesObject(delete_flag)
          : 0;
  out.objectFreeSize =
      out.freesObject != 0 ? logDtorObjectFreeSize() : 0;
  out.returnsThis = logDestroyReturnsThis(variant);
  out.stackBytesPopped = logDestroyStackBytesPopped(variant);
  out.readyStateBefore = logReadyState(holder_flags, critsec_ptr);
  out.readyStateAfter =
      logReadyStateAfterDestroy(holder_flags, critsec_ptr);
  out.danglingWindowStartVa =
      frees != 0 ? logDestroyDanglingWindowStartVa(variant) : 0;
  out.danglingWindowEndVa =
      frees != 0 ? logDestroyDanglingWindowEndVa(variant) : 0;
  out.actionCount =
      logDestroyActionCount(variant, critsec_ptr, delete_flag);
  return out;
}

function writeStateIsOpenImpl(state) {

  return state == (LOG_SINK_STATE_OPEN) ? 1 : 0;
}

function writeByteCountImpl(fwriteCount, size) {
  const fwrite_count = fwriteCount;

  return Math.imul(fwrite_count, size) >>> 0;
}

export function logWriteStateIsOpen(state) {
  return writeStateIsOpenImpl(state);
}

export function logWriteFwriteNeeded(state) {
  return writeStateIsOpenImpl(state);
}

export function logWriteFflushNeeded(state) {


  return 1;
}

export function logWriteTestsFileNull(filePtr) {
  const file_ptr = filePtr;


  return 0;
}

export function logWriteFopenFailPublishesSink() {

  return 1;
}

export function logWriteFlushVcallIsNop() {

  return 1;
}

export function logWriteByteCount(fwriteCount, size) {
  const fwrite_count = fwriteCount;
  return writeByteCountImpl(fwrite_count, size);
}

export function logWriteBytesReturned(state, fwriteCount, size) {
  const fwrite_count = fwriteCount;
  if (writeStateIsOpenImpl(state) == 0) {

    return 0;
  }
  return writeByteCountImpl(fwrite_count, size);
}

export function logWriteStackBytesPopped() {
  return (LOG_WRITE_STACK_BYTES);
}

export function logWriteVtblSlot() {
  return (LOG_SINK_VTBL_SLOT_WRITE);
}

export function logWriteBodyVa() {
  return (LOG_VA_WRITE);
}

export function logWriteBodyBytes() {
  return (LOG_WRITE_BODY_BYTES);
}

export function logWriteLoggerSizeImm() {
  return (LOG_LOGGER_WRITE_SIZE_IMM);
}

export function logWriteDirectCallsites() {
  return (LOG_WRITE_DIRECT_CALLSITES);
}

export function logWriteRawOccurrences() {
  return (LOG_WRITE_RAW_OCCURRENCES);
}

export function logWriteLoggerDispatchSites() {
  return (LOG_WRITE_LOGGER_DISPATCH_SITES);
}

export function logWriteActionCount(state) {
  return writeStateIsOpenImpl(state) != 0 ? 2 : 1;
}

export function logWriteActionAt(state, index) {
  if (writeStateIsOpenImpl(state) != 0) {
    if (index == 0) {
      return (LOG_WRITE_ACTION_FWRITE);
    }
    if (index == 1) {
      return (LOG_WRITE_ACTION_FFLUSH);
    }
    return (LOG_WRITE_ACTION_NONE);
  }
  if (index == 0) {
    return (LOG_WRITE_ACTION_FFLUSH);
  }
  return (LOG_WRITE_ACTION_NONE);
}

export function logWriteActionIsPlatform(action) {
  return action == (LOG_WRITE_ACTION_FWRITE) ||
                 action == (LOG_WRITE_ACTION_FFLUSH)
             ? 1
             : 0;
}

export function logWritePlan(input = {}) {
  const s = input || {};
  const state = u32(s.state);
  const file_ptr = u32(s.filePtr);
  const fwrite_count = u32(s.fwriteCount);
  const size = u32(s.size);
  const out = {};


  const open = writeStateIsOpenImpl(state);
  out.stateIsOpen = open;
  out.fwrite = open;
  out.fflush = logWriteFflushNeeded(state);
  out.testsFileNull = logWriteTestsFileNull(file_ptr);
  out.bytesReturned =
      logWriteBytesReturned(state, fwrite_count, size);
  out.stackBytesPopped = logWriteStackBytesPopped();
  out.vtblSlot = logWriteVtblSlot();
  out.bodyVa = logWriteBodyVa();
  out.fwriteIat = (LOG_IAT_FWRITE);
  out.fflushIat = (LOG_IAT_FFLUSH);
  out.actionCount = logWriteActionCount(state);
  return out;
}

/* ======================= v9: sink/neighbor deleting-dtor island ======================= */

/* Three instances of ONE template. All wrappers:
     [wrapper-specific prologue]
     call <inner dtor body>                ; HOST (SEH+GS body)
     test byte ptr [ebp + 8], 1 ; je skip  ; delete-flag gate: LOW BYTE bit 0
     push <size> ; push esi ; call 0xaef15c; HOST sized-delete shim (drops size)
     mov eax, esi ; pop esi ; pop ebp ; ret 4
   Instance A (sink, 0x00a83fa0): stores the base vtable 0x00ba5184 IN the
     wrapper (0x00a83fa6, before the inner call); inner body 0x00a52410;
     sized-delete 0x10. Body 0x00a83fa0..0x00a83fc6 = 0x26 bytes.
   Instance B (neighbor, 0x00a84030): does NOT store a vtable in the wrapper
     (the inner body 0x00a84060 stores 0x00ba5520 at 0x00a84089); inner body
     0x00a84060; sized-delete 0x30. Body 0x00a84030..0x00a84050 = 0x20 bytes.
   Instance C (sibling, 0x00a523e0, v16): does NOT store a vtable in the
     wrapper (the inner body 0x00a52410 — the SAME inner as the sink —
     stores the sibling vtable 0x00b9e940 at 0x00a52438); sized-delete 0x10
     (the sink's). Body 0x00a523e0..0x00a52400 = 0x20 bytes.
   All are reached through vtable slot 0 (`mov eax,[ecx]; push 1; call [eax]`
   dispatch, the teardown 0x00a7183c for the sink; 13 constructor sites for
   the sibling vtable 0x00b9e940) — not dead code. */

export const LOG_DTOR_ISLAND_VARIANTS = 3;
export const LOG_DTOR_ISLAND_VARIANT_SINK = 0;
export const LOG_DTOR_ISLAND_VARIANT_NEIGHBOR = 1;
export const LOG_DTOR_ISLAND_VARIANT_SIBLING = 2;
export const LOG_VA_NEIGHBOR_DTOR = 0x00a84030;
export const LOG_VA_SIBLING_DTOR = 0x00a523e0;   /* == LOG_VA_SIBLING_DTOR_BODY */
export const LOG_SINK_DTOR_BODY_BYTES = 0x26;    /* a83fa0..a83fc6 */
export const LOG_NEIGHBOR_DTOR_BODY_BYTES = 0x20; /* a84030..a84050 */
export const LOG_SIBLING_DTOR_BODY_BYTES = 0x20;  /* a523e0..a52400 */
export const LOG_VA_SINK_DTOR_INNER = 0x00a52410;
export const LOG_VA_NEIGHBOR_DTOR_INNER = 0x00a84060;
export const LOG_VA_SIBLING_DTOR_INNER = 0x00a52410; /* == SINK's inner */
export const LOG_SINK_DTOR_FREE_SIZE = 0x10;
export const LOG_NEIGHBOR_DTOR_FREE_SIZE = 0x30;
export const LOG_SIBLING_DTOR_FREE_SIZE = 0x10;    /* == SINK's */
export const LOG_VA_SINK_DTOR_VTABLE_STORE = 0x00a83fa6; /* wrapper store */
export const LOG_VA_SINK_DTOR_GATE = 0x00a83fb1;         /* test byte */
export const LOG_VA_NEIGHBOR_DTOR_GATE = 0x00a8403b;
export const LOG_VA_SIBLING_DTOR_GATE = 0x00a523eb;
export const LOG_NEIGHBOR_DTOR_VTABLE = 0x00ba5520;
export const LOG_SIBLING_DTOR_VTABLE = 0x00b9e940; /* == LOG_SIBLING_VTABLE_VA */
export const LOG_SIBLING_DTOR_INNER_CALL = 0x00a523e6;
export const LOG_SIBLING_DTOR_DELETE_CALL = 0x00a523f4;
export const LOG_SIBLING_DTOR_RET_VA = 0x00a52400;
export const LOG_SINK_DTOR_RET_VA = 0x00a83fc6;
export const LOG_NEIGHBOR_DTOR_RET_VA = 0x00a84050;
export const LOG_DTOR_ISLAND_SIZED_DELETE_VA = 0x00aef15c;
export const LOG_DTOR_ISLAND_RET_ARGS = 4;   /* ret 4 — one stack dword */
export const LOG_DTOR_ISLAND_FLAG_BIT = 1;   /* test byte [ebp+8], 1 */

/* Call-site VAs (v15 unit, cpu-dump): the inner E8 fires BEFORE the gate
   for ALL wrappers; the sized-delete E8 fires only past the gate. */
export const LOG_VA_SINK_DTOR_INNER_CALL = 0x00a83fac;      /* call 0xa52410 */
export const LOG_VA_NEIGHBOR_DTOR_INNER_CALL = 0x00a84036;  /* call 0xa84060 */
export const LOG_VA_SINK_DTOR_DELETE_CALL = 0x00a83fba;     /* call 0xaef15c */
export const LOG_VA_NEIGHBOR_DTOR_DELETE_CALL = 0x00a84044; /* call 0xaef15c */
export const LOG_DTOR_ISLAND_PLAN_FIELDS = 8; /* IsaacLogDtorIslandPlan */

/** Deterministic variant select: 1 -> NEIGHBOR, 2 -> SIBLING, everything
 *  else -> SINK (variant 0 is the canonical default; pinned in tests). */
function dtorIslandSelect(variant) {
  const v = u32(variant);
  if (v === LOG_DTOR_ISLAND_VARIANT_NEIGHBOR) {
    return LOG_DTOR_ISLAND_VARIANT_NEIGHBOR;
  }
  if (v === LOG_DTOR_ISLAND_VARIANT_SIBLING) {
    return LOG_DTOR_ISLAND_VARIANT_SIBLING;
  }
  return LOG_DTOR_ISLAND_VARIANT_SINK;
}

/** The 3-way per-variant wrapper tables (PE truth, this unit). */
const DTOR_ISLAND_VARIANTS_TAB = {
  [LOG_DTOR_ISLAND_VARIANT_SINK]: {
    bodyVa: LOG_VA_SINK_DTOR,
    bodyBytes: LOG_SINK_DTOR_BODY_BYTES,
    inner: LOG_VA_SINK_DTOR_INNER,
    innerCall: LOG_VA_SINK_DTOR_INNER_CALL,
    gate: LOG_VA_SINK_DTOR_GATE,
    freeSize: LOG_SINK_DTOR_FREE_SIZE,
    deleteCall: LOG_VA_SINK_DTOR_DELETE_CALL,
    ret: LOG_SINK_DTOR_RET_VA,
    vtable: LOG_SINK_VTABLE_VA,
    vtableEntry: LOG_SINK_VTABLE_VA,
    stores: 1,
  },
  [LOG_DTOR_ISLAND_VARIANT_NEIGHBOR]: {
    bodyVa: LOG_VA_NEIGHBOR_DTOR,
    bodyBytes: LOG_NEIGHBOR_DTOR_BODY_BYTES,
    inner: LOG_VA_NEIGHBOR_DTOR_INNER,
    innerCall: LOG_VA_NEIGHBOR_DTOR_INNER_CALL,
    gate: LOG_VA_NEIGHBOR_DTOR_GATE,
    freeSize: LOG_NEIGHBOR_DTOR_FREE_SIZE,
    deleteCall: LOG_VA_NEIGHBOR_DTOR_DELETE_CALL,
    ret: LOG_NEIGHBOR_DTOR_RET_VA,
    vtable: LOG_NEIGHBOR_DTOR_VTABLE,
    vtableEntry: LOG_SINK_VTABLE_VA, /* no own entry; inner-stored vtable */
    stores: 0,
  },
  [LOG_DTOR_ISLAND_VARIANT_SIBLING]: {
    bodyVa: LOG_VA_SIBLING_DTOR,
    bodyBytes: LOG_SIBLING_DTOR_BODY_BYTES,
    inner: LOG_VA_SIBLING_DTOR_INNER,
    innerCall: LOG_SIBLING_DTOR_INNER_CALL,
    gate: LOG_VA_SIBLING_DTOR_GATE,
    freeSize: LOG_SIBLING_DTOR_FREE_SIZE,
    deleteCall: LOG_SIBLING_DTOR_DELETE_CALL,
    ret: LOG_SIBLING_DTOR_RET_VA,
    vtable: LOG_SIBLING_DTOR_VTABLE,
    vtableEntry: LOG_SIBLING_DTOR_VTABLE, /* slot +0, file 0x79cf40 */
    stores: 0,
  },
};

export function logDtorIslandVariants() {
  return LOG_DTOR_ISLAND_VARIANTS;
}

export function logDtorIslandBodyVa(variant) {
  return DTOR_ISLAND_VARIANTS_TAB[dtorIslandSelect(variant)].bodyVa;
}

export function logDtorIslandBodyBytes(variant) {
  return DTOR_ISLAND_VARIANTS_TAB[dtorIslandSelect(variant)].bodyBytes;
}

export function logDtorIslandInnerBodyVa(variant) {
  return DTOR_ISLAND_VARIANTS_TAB[dtorIslandSelect(variant)].inner;
}

export function logDtorIslandFreeSize(variant) {
  return DTOR_ISLAND_VARIANTS_TAB[dtorIslandSelect(variant)].freeSize;
}

export function logDtorIslandVtableVa(variant) {
  return DTOR_ISLAND_VARIANTS_TAB[dtorIslandSelect(variant)].vtable;
}

/** 1 ONLY for the sink (store at 0x00a83fa6, in the wrapper); 0 for the
 *  neighbor (0x00a84089) and the sibling (0x00a52438 — the inner stores the
 *  sibling vtable). */
export function logDtorIslandWrapperStoresVtable(variant) {
  return DTOR_ISLAND_VARIANTS_TAB[dtorIslandSelect(variant)].stores;
}

/** v16: the per-variant call-site/return VAs. */
export function logDtorIslandInnerCallVa(variant) {
  return DTOR_ISLAND_VARIANTS_TAB[dtorIslandSelect(variant)].innerCall;
}

export function logDtorIslandGateVa(variant) {
  return DTOR_ISLAND_VARIANTS_TAB[dtorIslandSelect(variant)].gate;
}

export function logDtorIslandDeleteCallVa(variant) {
  return DTOR_ISLAND_VARIANTS_TAB[dtorIslandSelect(variant)].deleteCall;
}

export function logDtorIslandRetVa(variant) {
  return DTOR_ISLAND_VARIANTS_TAB[dtorIslandSelect(variant)].ret;
}

export function logDtorIslandVtableEntryVa(variant) {
  return DTOR_ISLAND_VARIANTS_TAB[dtorIslandSelect(variant)].vtableEntry;
}

/** ret 4 — the deleting dtor cleans its one stack argument itself. */
export function logDtorIslandRetArgs() {
  return LOG_DTOR_ISLAND_RET_ARGS;
}

/** mov eax, esi — all wrappers return `this`. */
export function logDtorIslandReturnsThis() {
  return 1;
}

/** test byte ptr [ebp + 8], 1 ; je — the delete flag is bit 0 of the LOW
 *  BYTE (0x100 / 0x2 / 0xfffffffe do NOT delete; 0x101 / 0x1ff do). */
export function logDtorIslandDeleteNeeded(deleteFlag) {
  return u32(deleteFlag) & LOG_DTOR_ISLAND_FLAG_BIT ? 1 : 0;
}

/* ======================= v15: the deleting-dtor WRAPPER bodies ========== */

/* Call-site VAs (v15 unit, cpu-dump): the inner E8 fires BEFORE the gate
   for ALL wrappers; the sized-delete E8 fires only past the gate.
   (Declared above the variant table — see the v16 block.) */

/** W1 — the inner body fires FIRST and UNCONDITIONALLY (0x00a83fac /
 *  0x00a84036 / 0x00a523e6), BEFORE the delete gate, for EVERY flag value. */
export function logDtorIslandInnerFires(deleteFlag, variant) {
  void deleteFlag;
  dtorIslandSelect(variant); /* all variants share the constant law */
  return 1;
}

/** W3 — sized-delete fires ONLY when the gate passes; the pushed size
 *  immediate is the variant free size (0x10 sink / 0x30 neighbor / 0x10
 *  sibling). The shim 0xaef15c drops the size — the LAW is the gate + size
 *  pair. */
export function logDtorIslandSizedDeleteSize(deleteFlag, variant) {
  if (!logDtorIslandDeleteNeeded(deleteFlag)) {
    return 0;
  }
  return logDtorIslandFreeSize(variant);
}

/** The full wrapper observable (W1..W5 composed). */
export function logDtorIslandWrapperPlan(deleteFlag, variant) {
  const tab = DTOR_ISLAND_VARIANTS_TAB[dtorIslandSelect(variant)];
  return {
    innerVa: tab.inner,
    innerFires: 1,
    gateVa: tab.gate,
    deleteFires: logDtorIslandDeleteNeeded(deleteFlag),
    deleteSize: logDtorIslandSizedDeleteSize(deleteFlag, variant),
    deleteVa: LOG_DTOR_ISLAND_SIZED_DELETE_VA,
    returnsThis: 1,
    retArgs: LOG_DTOR_ISLAND_RET_ARGS,
  };
}

export function logAbiVersion() {
  return LOG_PURE_ABI_VERSION;
}

/* ======================= v10: the open helpers (vtbl +0x24/+0x28) =======================
 *
 * Two fopen leaves of the sink/sibling class, transcribed branch-by-branch
 * from the PE instruction stream this unit (see header LAV/LAW):
 *
 *   0x00a52540 open "rb"   __thiscall, ret 4, 1 stack arg (path)
 *   0x00a52610 open "wb"/"ab" __thiscall, ret 8, 2 stack args (path, flag)
 *
 * Shared law shape: the FILE* store ([this+0xc]) is UNCONDITIONAL — even
 * when fopen returned NULL; state ([this+4]) and path ([this+8]) stores
 * are SUCCESS-ONLY. The read gates fopen and its return on the HOST
 * combine result; the write does NOT gate fopen and its return is
 * fopen_ok ALONE. Mode select reads the append flag's LOW BYTE only.
 * The fopen IAT call, 0x00a5a7a0 (combine) and 0x00a648b0 (accounting)
 * stay host; only the pure laws are modelled here.
 */

export const LOG_VA_OPEN_READ = 0x00a52540;
export const LOG_VA_OPEN_READ_END = 0x00a525ff;
export const LOG_VA_OPEN_WRITE = 0x00a52610;
export const LOG_VA_OPEN_WRITE_END = 0x00a526bc;
export const LOG_OPEN_READ_BODY_BYTES = 0xc0;
export const LOG_OPEN_WRITE_BODY_BYTES = 0xac;
export const LOG_OPEN_READ_INSN_COUNT = 68;
export const LOG_OPEN_WRITE_INSN_COUNT = 61;
export const LOG_OPEN_READ_RET_ARGS = 4;
export const LOG_OPEN_WRITE_RET_ARGS = 8;
export const LOG_OPEN_MODE_WB_VA = 0x00b9e938;   /* "wb\x00" */
export const LOG_OPEN_MODE_AB_VA = 0x00b6d104;   /* "ab\x00" */
export const LOG_OPEN_MODE_RB_VA = 0x00b6d108;   /* "rb\x00" */
export const LOG_OPEN_MODE_LEN = 2;
export const LOG_OPEN_READ_STATE = 0;            /* mov [edi+4], 0 */
export const LOG_OPEN_WRITE_STATE = 1;           /* mov [edi+4], 1 */
export const LOG_VA_OPEN_READ_PATH_GATE = 0x00a52579;
export const LOG_VA_OPEN_READ_FOPEN = 0x00a52583;
export const LOG_VA_OPEN_READ_FILE_STORE = 0x00a5258c;
export const LOG_VA_OPEN_READ_STATE_STORE = 0x00a52599;
export const LOG_VA_OPEN_READ_COMBINE1 = 0x00a5256f;
export const LOG_VA_OPEN_READ_COMBINE2 = 0x00a525a2;
export const LOG_VA_OPEN_READ_RET_OK = 0x00a525c1;
export const LOG_VA_OPEN_READ_RET_FAIL = 0x00a525ed;
export const LOG_VA_OPEN_READ_ACCOUNTING_OK_SITE = 0x00a525b9;
export const LOG_VA_OPEN_READ_ACCOUNTING_FAIL_SITE = 0x00a525e5;
export const LOG_VA_OPEN_WRITE_MODE_TEST = 0x00a52649;
export const LOG_VA_OPEN_WRITE_MODE_SELECT = 0x00a52659;
export const LOG_VA_OPEN_WRITE_FOPEN = 0x00a5265e;
export const LOG_VA_OPEN_WRITE_FILE_STORE = 0x00a52667;
export const LOG_VA_OPEN_WRITE_STATE_STORE = 0x00a52678;
export const LOG_VA_OPEN_WRITE_COMBINE1 = 0x00a52644;
export const LOG_VA_OPEN_WRITE_COMBINE2 = 0x00a52681;
export const LOG_VA_OPEN_WRITE_ACCOUNTING_GATE = 0x00a5268e;
export const LOG_VA_OPEN_WRITE_ACCOUNTING_SITE = 0x00a526a1;
export const LOG_VA_OPEN_WRITE_RET = 0x00a526a9;
export const LOG_OPEN_READ_ACCOUNTING_SITES = 2;
export const LOG_OPEN_WRITE_ACCOUNTING_SITES = 1;
export const LOG_OPEN_READ_COMBINE_BASE = 0;
export const LOG_OPEN_WRITE_COMBINE_BASE_VA = 0x00c5aa98;
export const LOG_OPEN_READ_SEH_HANDLER = 0x00af0b60;
export const LOG_OPEN_WRITE_SEH_HANDLER = 0x00af12f0;
export const LOG_OPEN_VTABLE_SLOT_READ = 0x24;
export const LOG_OPEN_VTABLE_SLOT_WRITE = 0x28;
export const LOG_VA_SIBLING_VTBL_OPEN_READ_ENTRY = 0x00b9e964;
export const LOG_VA_SIBLING_VTBL_OPEN_WRITE_ENTRY = 0x00b9e968;
export const LOG_VA_SINK_VTBL_OPEN_READ_ENTRY = 0x00ba51a8;
export const LOG_VA_SINK_VTBL_OPEN_WRITE_ENTRY = 0x00ba51ac;
export const LOG_OPEN_READ_DIRECT_CALLSITES = 9;
export const LOG_OPEN_WRITE_DIRECT_CALLSITES = 1;
export const LOG_OPEN_READ_RAW_OCCURRENCES = 11; /* 2 vtbl slots + 9 cmp imm */
export const LOG_OPEN_WRITE_RAW_OCCURRENCES = 3;  /* 2 vtbl slots + 1 cmp imm */
export const LOG_VA_OPEN_READ_DEVIRT_COMPARE = 0x00a25053;
export const LOG_VA_OPEN_READ_DEVIRT_CALL = 0x00a2505a;
export const LOG_VA_OPEN_WRITE_DEVIRT_COMPARE = 0x00a25100;
export const LOG_VA_OPEN_WRITE_DEVIRT_CALL = 0x00a25107;
export const LOG_OPEN_ACTION_NONE = 0;
export const LOG_OPEN_ACTION_FOPEN = 1;
export const LOG_OPEN_ACTIONS_MAX = 1;
export const LOG_TEXT_INSN_COUNT_V10 = 2094319;
export const LOG_TEXT_UNDECODABLE_BYTES_V10 = 469;
export const LOG_V10_BATCHED_VAS = 2;
export const LOG_V10_EXACT_ZHL_MATCHES = 0;

/* test esi, esi ; je 0xa525ed — the read's PATH GATE: NULL combine blocks
   everything (no stores at all) and returns 0. */
function openReadPathGateImpl(pathCombineOk) {
  return u32(pathCombineOk) !== 0 ? 1 : 0;
}

/* cmp byte [ebp+0xc], 0 ; cmove — LOW BYTE ONLY:
   (flag & 0xff) == 0 -> "wb", else -> "ab". 0x100 selects "wb". */
function openWriteModeVaImpl(appendFlag) {
  return (appendFlag & 0xff) === 0 ? LOG_OPEN_MODE_WB_VA : LOG_OPEN_MODE_AB_VA;
}

/* mov [edi+0xc], eax — UNCONDITIONAL overwrite: the cell takes the raw
   fopen result even when fopen returned NULL (a previous non-NULL handle
   is clobbered by a failed re-open). fileBefore is deliberately unused. */
function openFileAfterImpl(fileBefore, fopenResult) {
  return u32(fopenResult);
}

function openReadStateAfterImpl(stateBefore, fopenOk) {
  return u32(fopenOk) !== 0 ? LOG_OPEN_READ_STATE : u32(stateBefore);
}

function openWriteStateAfterImpl(stateBefore, fopenOk) {
  return u32(fopenOk) !== 0 ? LOG_OPEN_WRITE_STATE : u32(stateBefore);
}

/* mov [edi+8], eax — the second combine result, success arm only. */
function openPathAfterImpl(pathBefore, fopenOk, combine2Result) {
  return u32(fopenOk) !== 0 ? u32(combine2Result) : u32(pathBefore);
}

function openReadReturnsImpl(pathCombineOk, fopenOk) {
  return u32(pathCombineOk) !== 0 && u32(fopenOk) !== 0 ? 1 : 0;
}

/* mov al, bl — bl is set ONLY from the fopen test; the combine result is
   never consulted (contrast with the read's &&). */
function openWriteReturnsImpl(fopenOk) {
  return u32(fopenOk) !== 0 ? 1 : 0;
}

function openReadAccountingImpl(pathCombineOk) {
  return u32(pathCombineOk) !== 0 ? 1 : 0;
}

function openWriteAccountingImpl(pathCombineOk) {
  return u32(pathCombineOk) !== 0 ? 1 : 0;
}

export function logOpenReadPathGate(pathCombineOk) {
  return openReadPathGateImpl(pathCombineOk);
}

export function logOpenReadModeVa() {
  return LOG_OPEN_MODE_RB_VA;
}

export function logOpenReadModeLen() {
  return LOG_OPEN_MODE_LEN;
}

export function logOpenReadFileAfter(fileBefore, fopenResult) {
  return openFileAfterImpl(fileBefore, fopenResult);
}

export function logOpenReadStateAfter(stateBefore, fopenOk) {
  return openReadStateAfterImpl(stateBefore, fopenOk);
}

export function logOpenReadPathAfter(pathBefore, fopenOk, combine2Result) {
  return openPathAfterImpl(pathBefore, fopenOk, combine2Result);
}

export function logOpenReadReturns(pathCombineOk, fopenOk) {
  return openReadReturnsImpl(pathCombineOk, fopenOk);
}

export function logOpenReadAccountingReached(pathCombineOk) {
  return openReadAccountingImpl(pathCombineOk);
}

export function logOpenReadAccountingSites() {
  return LOG_OPEN_READ_ACCOUNTING_SITES;
}

export function logOpenWriteModeVa(appendFlag) {
  return openWriteModeVaImpl(appendFlag);
}

export function logOpenWriteModeLen(appendFlag) {
  /* both mode strings are 2 chars; the flag is deliberately unused */
  return LOG_OPEN_MODE_LEN;
}

export function logOpenWriteFopenGated(pathCombineOk) {
  /* the write body never gates fopen; the param is deliberately unused */
  return 0;
}

export function logOpenWriteFileAfter(fileBefore, fopenResult) {
  return openFileAfterImpl(fileBefore, fopenResult);
}

export function logOpenWriteStateAfter(stateBefore, fopenOk) {
  return openWriteStateAfterImpl(stateBefore, fopenOk);
}

export function logOpenWritePathAfter(pathBefore, fopenOk, combine2Result) {
  return openPathAfterImpl(pathBefore, fopenOk, combine2Result);
}

export function logOpenWriteReturns(fopenOk) {
  return openWriteReturnsImpl(fopenOk);
}

export function logOpenWriteAccountingReached(pathCombineOk) {
  return openWriteAccountingImpl(pathCombineOk);
}

export function logOpenWriteAccountingSites() {
  return LOG_OPEN_WRITE_ACCOUNTING_SITES;
}

export function logOpenReadBodyVa() {
  return LOG_VA_OPEN_READ;
}

export function logOpenReadBodyBytes() {
  return LOG_OPEN_READ_BODY_BYTES;
}

export function logOpenReadInsnCount() {
  return LOG_OPEN_READ_INSN_COUNT;
}

export function logOpenReadRetArgs() {
  return LOG_OPEN_READ_RET_ARGS;
}

export function logOpenReadVtblSlot() {
  return LOG_OPEN_VTABLE_SLOT_READ;
}

export function logOpenReadDirectCallsites() {
  return LOG_OPEN_READ_DIRECT_CALLSITES;
}

export function logOpenReadRawOccurrences() {
  return LOG_OPEN_READ_RAW_OCCURRENCES;
}

export function logOpenWriteBodyVa() {
  return LOG_VA_OPEN_WRITE;
}

export function logOpenWriteBodyBytes() {
  return LOG_OPEN_WRITE_BODY_BYTES;
}

export function logOpenWriteInsnCount() {
  return LOG_OPEN_WRITE_INSN_COUNT;
}

export function logOpenWriteRetArgs() {
  return LOG_OPEN_WRITE_RET_ARGS;
}

export function logOpenWriteVtblSlot() {
  return LOG_OPEN_VTABLE_SLOT_WRITE;
}

export function logOpenWriteDirectCallsites() {
  return LOG_OPEN_WRITE_DIRECT_CALLSITES;
}

export function logOpenWriteRawOccurrences() {
  return LOG_OPEN_WRITE_RAW_OCCURRENCES;
}

export function logOpenReadDevirtCallVa() {
  return LOG_VA_OPEN_READ_DEVIRT_CALL;
}

export function logOpenWriteDevirtCallVa() {
  return LOG_VA_OPEN_WRITE_DEVIRT_CALL;
}

export function logOpenReadActionCount(pathCombineOk) {
  return openReadPathGateImpl(pathCombineOk) !== 0 ? 1 : 0;
}

export function logOpenReadActionAt(pathCombineOk, index) {
  if (openReadPathGateImpl(pathCombineOk) !== 0 && index == 0) {
    return LOG_OPEN_ACTION_FOPEN;
  }
  return LOG_OPEN_ACTION_NONE;
}

export function logOpenReadActionIsPlatform(action) {
  return action === LOG_OPEN_ACTION_FOPEN ? 1 : 0;
}

export function logOpenReadPlan(input = {}) {
  const s = input || {};
  const path_combine_ok = u32(s.pathCombineOk);
  const fopen_ok = u32(s.fopenOk);
  const file_before = u32(s.fileBefore);
  const fopen_result = u32(s.fopenResult);
  const state_before = u32(s.stateBefore);
  const path_before = u32(s.pathBefore);
  const combine2_result = u32(s.combine2Result);
  const out = {};
  const path_ok = openReadPathGateImpl(path_combine_ok);
  out.pathOk = path_ok;
  out.modeVa = logOpenReadModeVa();
  out.fopen = path_ok;
  out.fileAfter = openFileAfterImpl(file_before, fopen_result);
  out.stateAfter = openReadStateAfterImpl(state_before, fopen_ok);
  out.pathStored = fopen_ok !== 0 ? 1 : 0;
  out.pathAfter = openPathAfterImpl(path_before, fopen_ok, combine2_result);
  out.result = openReadReturnsImpl(path_combine_ok, fopen_ok);
  out.accountingReached = openReadAccountingImpl(path_combine_ok);
  out.accountingSites = logOpenReadAccountingSites();
  out.retArgs = logOpenReadRetArgs();
  out.bodyVa = logOpenReadBodyVa();
  out.actionCount = logOpenReadActionCount(path_combine_ok);
  return out;
}

export function logOpenWriteActionCount() {
  return 1;
}

export function logOpenWriteActionAt(index) {
  if (index == 0) {
    return LOG_OPEN_ACTION_FOPEN;
  }
  return LOG_OPEN_ACTION_NONE;
}

export function logOpenWriteActionIsPlatform(action) {
  return action === LOG_OPEN_ACTION_FOPEN ? 1 : 0;
}

export function logOpenWritePlan(input = {}) {
  const s = input || {};
  const append_flag = u32(s.appendFlag);
  const path_combine_ok = u32(s.pathCombineOk);
  const fopen_ok = u32(s.fopenOk);
  const file_before = u32(s.fileBefore);
  const fopen_result = u32(s.fopenResult);
  const state_before = u32(s.stateBefore);
  const path_before = u32(s.pathBefore);
  const combine2_result = u32(s.combine2Result);
  const out = {};
  out.modeVa = openWriteModeVaImpl(append_flag);
  out.fopen = 1;
  out.fileAfter = openFileAfterImpl(file_before, fopen_result);
  out.stateAfter = openWriteStateAfterImpl(state_before, fopen_ok);
  out.pathStored = fopen_ok !== 0 ? 1 : 0;
  out.pathAfter = openPathAfterImpl(path_before, fopen_ok, combine2_result);
  out.result = openWriteReturnsImpl(fopen_ok);
  out.accountingReached = openWriteAccountingImpl(path_combine_ok);
  out.accountingSites = logOpenWriteAccountingSites();
  out.retArgs = logOpenWriteRetArgs();
  out.bodyVa = logOpenWriteBodyVa();
  out.actionCount = logOpenWriteActionCount();
  return out;
}

/* ======================= v11: the dtor inner body 0x00a52410 ======================= */

/* The sink dtor's shared inner body (SEH+GS frame, host). this = ecx, 0
   stack args, plain `ret`. Called by BOTH deleting-dtor wrappers and one
   SEH funclet tail-jump (3 inbound transfers, 0 raw dword references).

   Body (58 insns, 0x92 bytes, ret at 0x00a524a1):
     vtable #1 0xb9e940 (== SIBLING_VTABLE_VA) ALWAYS
     test eax,eax            ; FCLOSE gate — FULL 32-bit FILE* cell +0xc
     je 0xa52453
     call [0xb1890c] fclose  ; HOST
     mov [esi+0xc], 0        ; FILE* cell := NULL (fclose arm only)
     mov [esi+4], 2          ; state := 2  (ALWAYS — before the free gate)
     test edx,edx            ; GUEST-FREE gate — FULL 32-bit path cell +8
     je 0xa52486
     call 0xa648b0           ; HOST shared allocator (guest free)
     mov [esi+8], 0          ; path cell := NULL (free arm only)
     mov [esi+4], 2          ; state := 2 (free arm re-store)
     jmp 0xa5248c
     mov [esi], 0xb833d8     ; vtable #2 — IFF path == 0 (no-free arm)
     mov [esi], 0xb9c15c     ; vtable #3 — ALWAYS (both arms)
     ret

   Laws: fclose gate and guest-free gate are FULL-DWORD (0x100/0x1ff/
   0xffffffff fire; a low-byte reading misfires on 0x100); the FILE* cell
   and the path cell NULLed ONLY on their fire arm; BOTH state stores
   write the SAME polar value 2 (== SINK_STATE_NO_FILE) and the skip arm
   still gets the store because 0xa52456 precedes the free gate; final
   vtable is ALWAYS 0xb9c15c, mid 0xb833d8 stored IFF path == 0. fclose
   and guest free stay host; the SEH/GS frame (handler 0xb12420, cookie
   0xbf93b4) stays host — the normal-path epilogue pops the cookie
   without checking it, matching every other body in this family. */

export const LOG_VA_DTOR_INNER = 0x00a52410;         /* == SINK_DTOR_INNER */
export const LOG_VA_DTOR_INNER_END = 0x00a524a2;    /* first int3 */
export const LOG_DTOR_INNER_BODY_BYTES = 0x92;
export const LOG_DTOR_INNER_INSN_COUNT = 58;
export const LOG_DTOR_INNER_RET_ARGS = 0;           /* plain `ret` */
export const LOG_DTOR_INNER_SEH_HANDLER = 0x00b12420;
export const LOG_DTOR_INNER_VTABLE_BASE = 0x00b9e940; /* == SIBLING_VTABLE_VA */
export const LOG_DTOR_INNER_VTABLE_MID = 0x00b833d8;
export const LOG_DTOR_INNER_VTABLE_FINAL = 0x00b9c15c;
export const LOG_DTOR_INNER_STATE_VALUE = 2;        /* == SINK_STATE_NO_FILE */
export const LOG_DTOR_INNER_STATE_STORES = 2;       /* 0xa52456 + 0xa5247d */
export const LOG_VA_DTOR_INNER_FCLOSE_GATE = 0x00a5243e;
export const LOG_VA_DTOR_INNER_FCLOSE_CALL = 0x00a52443;
export const LOG_VA_DTOR_INNER_FILE_NULL = 0x00a5244c;
export const LOG_VA_DTOR_INNER_FREE_GATE = 0x00a5245d;
export const LOG_VA_DTOR_INNER_FREE_CALL = 0x00a5246e;
export const LOG_VA_DTOR_INNER_PATH_NULL = 0x00a52476;
export const LOG_VA_DTOR_INNER_STATE_STORE1 = 0x00a52456;
export const LOG_VA_DTOR_INNER_STATE_STORE2 = 0x00a5247d;
export const LOG_VA_DTOR_INNER_VTABLE_STORE1 = 0x00a52438;
export const LOG_VA_DTOR_INNER_VTABLE_STORE2 = 0x00a52486;
export const LOG_VA_DTOR_INNER_VTABLE_STORE3 = 0x00a5248c;
export const LOG_DTOR_INNER_INBOUND_CALLSITES = 3;
export const LOG_DTOR_INNER_RAW_OCCURRENCES = 0;
export const LOG_DTOR_INNER_FCLOSE_IAT_SITES = 8;
export const LOG_DTOR_INNER_ACTION_NONE = 0;
export const LOG_DTOR_INNER_ACTION_FCLOSE = 1;      /* platform */
export const LOG_DTOR_INNER_ACTION_FREE = 2;        /* platform (allocator) */
export const LOG_DTOR_INNER_ACTIONS_MAX = 2;
export const LOG_TEXT_INSN_COUNT_V11 = 2094319;
export const LOG_TEXT_UNDECODABLE_BYTES_V11 = 469;
export const LOG_V11_BATCHED_VAS = 4;
export const LOG_V11_EXACT_ZHL_MATCHES = 0;

/* test eax, eax — FULL 32-bit FILE* cell. 0x100 / 0x1ff / 0xffffffff
   fire fclose; 0 does not. Low-byte reading would misfire on 0x100. */
function dtorInnerFcloseGateImpl(filePtr) {
  return u32(filePtr) !== 0 ? 1 : 0;
}

/* mov [esi+0xc], 0 — NULL store lives on the fclose arm ONLY. */
function dtorInnerFileAfterImpl(fileBefore, fcloseFired) {
  return u32(fcloseFired) !== 0 ? 0 : u32(fileBefore);
}

/* test edx, edx — FULL 32-bit path cell. Same width as the fclose gate. */
function dtorInnerFreeGateImpl(pathPtr) {
  return u32(pathPtr) !== 0 ? 1 : 0;
}

/* mov [esi+8], 0 — NULL store lives on the free arm ONLY. */
function dtorInnerPathAfterImpl(pathBefore, freeFired) {
  return u32(freeFired) !== 0 ? 0 : u32(pathBefore);
}

/* mov [esi+4], 2 — the state cell takes the polar value 2 on BOTH arms;
   stateBefore is deliberately a parameter (skip-arm store visibility). */
function dtorInnerStateAfterImpl(stateBefore) {
  return LOG_DTOR_INNER_STATE_VALUE;
}

/* mov [esi], 0xb833d8 — mid vtable store IFF path == 0 (no free). */
function dtorInnerMidStoredImpl(pathPtr) {
  return u32(pathPtr) === 0 ? 1 : 0;
}

function dtorInnerVtableAfterImpl(pathPtr) {
  return LOG_DTOR_INNER_VTABLE_FINAL;
}

export function logDtorInnerFcloseGate(filePtr) {
  return dtorInnerFcloseGateImpl(filePtr);
}

export function logDtorInnerFcloseIatVa() {
  return LOG_IAT_FCLOSE;
}

export function logDtorInnerFileAfter(fileBefore, fcloseFired) {
  return dtorInnerFileAfterImpl(fileBefore, fcloseFired);
}

export function logDtorInnerFreeGate(pathPtr) {
  return dtorInnerFreeGateImpl(pathPtr);
}

export function logDtorInnerFreeHelperVa() {
  return LOG_VA_SHARED_ALLOCATOR;
}

export function logDtorInnerPathAfter(pathBefore, freeFired) {
  return dtorInnerPathAfterImpl(pathBefore, freeFired);
}

export function logDtorInnerStateAfter(stateBefore) {
  return dtorInnerStateAfterImpl(stateBefore);
}

export function logDtorInnerStateValue() {
  return LOG_DTOR_INNER_STATE_VALUE;
}

export function logDtorInnerStateStoreCount() {
  return LOG_DTOR_INNER_STATE_STORES;
}

export function logDtorInnerVtableBase() {
  return LOG_DTOR_INNER_VTABLE_BASE;
}

export function logDtorInnerVtableMid() {
  return LOG_DTOR_INNER_VTABLE_MID;
}

export function logDtorInnerVtableFinal() {
  return LOG_DTOR_INNER_VTABLE_FINAL;
}

export function logDtorInnerVtableMidStored(pathPtr) {
  return dtorInnerMidStoredImpl(pathPtr);
}

export function logDtorInnerVtableAfter(pathPtr) {
  return dtorInnerVtableAfterImpl(pathPtr);
}

export function logDtorInnerBodyVa() {
  return LOG_VA_DTOR_INNER;
}

export function logDtorInnerBodyBytes() {
  return LOG_DTOR_INNER_BODY_BYTES;
}

export function logDtorInnerInsnCount() {
  return LOG_DTOR_INNER_INSN_COUNT;
}

export function logDtorInnerRetArgs() {
  return LOG_DTOR_INNER_RET_ARGS;
}

export function logDtorInnerSehHandler() {
  return LOG_DTOR_INNER_SEH_HANDLER;
}

export function logDtorInnerInboundCallsites() {
  return LOG_DTOR_INNER_INBOUND_CALLSITES;
}

export function logDtorInnerRawOccurrences() {
  return LOG_DTOR_INNER_RAW_OCCURRENCES;
}

export function logDtorInnerFcloseIatSites() {
  return LOG_DTOR_INNER_FCLOSE_IAT_SITES;
}

export function logDtorInnerActionCount(filePtr, pathPtr) {
  return dtorInnerFcloseGateImpl(filePtr) + dtorInnerFreeGateImpl(pathPtr);
}

export function logDtorInnerActionAt(filePtr, pathPtr, index) {
  if (index == 0) {
    return dtorInnerFcloseGateImpl(filePtr) !== 0
      ? LOG_DTOR_INNER_ACTION_FCLOSE
      : LOG_DTOR_INNER_ACTION_NONE;
  }
  if (index == 1) {
    return dtorInnerFreeGateImpl(pathPtr) !== 0
      ? LOG_DTOR_INNER_ACTION_FREE
      : LOG_DTOR_INNER_ACTION_NONE;
  }
  return LOG_DTOR_INNER_ACTION_NONE;
}

export function logDtorInnerActionIsPlatform(action) {
  return action === LOG_DTOR_INNER_ACTION_FCLOSE ||
         action === LOG_DTOR_INNER_ACTION_FREE
    ? 1
    : 0;
}

/* ======================= v12: the neighbor dtor inner body 0x00a84060 ======================= */

/* The neighbor deleting-dtor's inner body (SEH+GS frame, host). this =
   ecx, 0 stack args, plain `ret`. Called by the v9 wrapper 0x00a84030
   (0x00a84036) and one SEH funclet tail-jump 0x00b14783 (2 inbound
   transfers, 0 raw dword references).

   Body (53 insns, 0x7d bytes, ret at 0x00a840dc):
     mov edx,[esi+0x20]      ; path cell (+0x20)
     mov [esi],0xba5520      ; vtable #1 — ALWAYS (BEFORE the free gate)
     test edx,edx ; je join  ; GUEST-FREE gate — FULL 32-bit path cell
     call 0xa648b0           ; HOST shared allocator (guest free)
     mov [esi+0x20],0        ; path cell := NULL (free arm ONLY)
     push [esi+0x28]         ; EOS LobbyDetails cell (+0x28) — NO GATE
     call [0xb180a4]         ; HOST _EOS_LobbyDetails_Release@4
     lea ecx,[esi+0x10]      ; sub-object at +0x10
     mov [esi+0x28],0        ; lobby cell := NULL (ALWAYS, AFTER the call)
     mov [esi],0xba2218      ; vtable #2 — ALWAYS (the FINAL vtable)
     call 0x426980           ; HOST sub-object dtor (always, LAST)
     ret

   Laws (deltas vs the v11 sink inner 0x00a52410 pinned, never
   homogenised): guest-free gate FULL-DWORD (0x100/0x1ff/0xffffffff fire,
   0 skips); path cell NULLed ONLY on the free arm; the EOS release is
   UNCONDITIONAL (fires even when the lobby cell is 0) and receives the
   PRE-null cell value (NULL store AFTER the call); lobby cell NULLed
   ALWAYS; BOTH vtable stores unconditional (0xba5520 -> 0xba2218 — NO
   conditional mid-store arm; the sink's 3-store chain is different);
   sub-object dtor 0x426980 at +0x10 ALWAYS and LAST; no state-cell store
   in this body. Host: guest free 0x00a648b0, _EOS_LobbyDetails_Release@4
   [0x00b180a4], sub-object dtor 0x00426980, the SEH/GS frame (handler
   0x00af09f0 — DIFFERENT from the sink's 0xb12420, cookie 0xbf93b4). */

export const LOG_VA_NEIGHBOR_DTOR_INNER_END = 0x00a840dd; /* first int3 */
export const LOG_NEIGHBOR_DTOR_INNER_BODY_BYTES = 0x7d;
export const LOG_NEIGHBOR_DTOR_INNER_INSN_COUNT = 53;
export const LOG_NEIGHBOR_DTOR_INNER_RET_ARGS = 0;       /* plain `ret` */
export const LOG_NEIGHBOR_DTOR_INNER_SEH_HANDLER = 0x00af09f0;
export const LOG_NEIGHBOR_DTOR_INNER_VTABLE_BASE = 0x00ba5520;
export const LOG_NEIGHBOR_DTOR_INNER_VTABLE_FINAL = 0x00ba2218;
export const LOG_NEIGHBOR_DTOR_INNER_PATH_OFFSET = 0x20;
export const LOG_NEIGHBOR_DTOR_INNER_LOBBY_OFFSET = 0x28;
export const LOG_NEIGHBOR_DTOR_INNER_SUB_OFFSET = 0x10;
export const LOG_VA_NEIGHBOR_DTOR_INNER_FREE_GATE = 0x00a8408f;
export const LOG_VA_NEIGHBOR_DTOR_INNER_FREE_CALL = 0x00a840a0;
export const LOG_VA_NEIGHBOR_DTOR_INNER_PATH_NULL = 0x00a840a8;
export const LOG_VA_NEIGHBOR_DTOR_INNER_RELEASE_CALL = 0x00a840b2;
export const LOG_VA_NEIGHBOR_DTOR_INNER_LOBBY_NULL = 0x00a840bb;
export const LOG_VA_NEIGHBOR_DTOR_INNER_VTABLE_STORE1 = 0x00a84089;
export const LOG_VA_NEIGHBOR_DTOR_INNER_VTABLE_STORE2 = 0x00a840c2;
export const LOG_VA_NEIGHBOR_DTOR_INNER_SUB_DTOR_CALL = 0x00a840c8;
export const LOG_NEIGHBOR_DTOR_INNER_SUB_DTOR_VA = 0x00426980;
export const LOG_NEIGHBOR_DTOR_INNER_INBOUND_CALLSITES = 2;
export const LOG_NEIGHBOR_DTOR_INNER_RAW_OCCURRENCES = 0;
export const LOG_NEIGHBOR_DTOR_INNER_RELEASE_IAT_SITES = 8;
export const LOG_NEIGHBOR_DTOR_INNER_ACTION_NONE = 0;
export const LOG_NEIGHBOR_DTOR_INNER_ACTION_FREE = 1;   /* allocator */
export const LOG_NEIGHBOR_DTOR_INNER_ACTION_RELEASE = 2; /* EOS SDK */
export const LOG_NEIGHBOR_DTOR_INNER_ACTIONS_MAX = 2;
export const LOG_TEXT_INSN_COUNT_V12 = 2094319;
export const LOG_TEXT_UNDECODABLE_BYTES_V12 = 469;
export const LOG_V12_BATCHED_VAS = 4;
export const LOG_V12_EXACT_ZHL_MATCHES = 0;

/* ================= v13: the sibling vtbl+0x20 flush slot 0x00a52880 =====
   Body (4 insns, 0xb bytes, plain `ret` @ 0x00a5288a):
     push dword ptr [ecx + 0xc]  ; FILE* field at this+0xc
     call dword ptr [0xb1891c]   ; HOST fflush (IAT, UNCONDITIONAL)
     pop ecx                     ; self-clean 4 bytes (balanced)
     ret
   The ONLY reach is the sibling vtable 0x00b9e940 slot +0x20 (entry
   0x00b9e960, .rdata raw 0x79cf60): zero direct .text refs, 1 raw dword.
   fflush IAT identity from the PE import directory this unit. */

export const LOG_VA_FLUSH_SLOT = 0x00a52880;
export const LOG_VA_FLUSH_SLOT_END = 0x00a5288b; /* first int3 */
export const LOG_FLUSH_SLOT_BODY_BYTES = 0x0b;
export const LOG_FLUSH_SLOT_INSN_COUNT = 4;
export const LOG_FLUSH_SLOT_FIRST_RET_VA = 0x00a5288a;
export const LOG_FLUSH_SLOT_RET_ARGS = 0;
export const LOG_FLUSH_SLOT_STACK_BYTES_POPPED = 0;
export const LOG_FLUSH_SLOT_FILE_OFFSET = 0x0c;
export const LOG_FLUSH_SLOT_IAT_VA = 0x00b1891c; /* == LOG_IAT_FFLUSH */
export const LOG_FLUSH_SLOT_VTBL_SLOT = 0x20;
export const LOG_FLUSH_SLOT_VTBL_VA = 0x00b9e940;
export const LOG_FLUSH_SLOT_VTBL_ENTRY_VA = 0x00b9e960;
export const LOG_FLUSH_SLOT_PUSH_VA = 0x00a52880;
export const LOG_FLUSH_SLOT_CALL_VA = 0x00a52883;
export const LOG_FLUSH_SLOT_POP_VA = 0x00a52889;
export const LOG_FLUSH_SLOT_RET_VA = 0x00a5288a;
export const LOG_FLUSH_SLOT_INDIRECT_CALLS = 1;
export const LOG_FLUSH_SLOT_DIRECT_CALLSITES = 0;
export const LOG_FLUSH_SLOT_INBOUND = 0;
export const LOG_FLUSH_SLOT_RAW_OCCURRENCES = 1;
export const LOG_FLUSH_SLOT_FFLUSH_IAT_SITES = 6; /* whole-.text */
export const LOG_FLUSH_SLOT_VTBL_IS_NOP = 0;
export const LOG_TEXT_INSN_COUNT_V13 = 2094319;
export const LOG_TEXT_UNDECODABLE_BYTES_V13 = 469;
export const LOG_V13_BATCHED_VAS = 4;
export const LOG_V13_EXACT_ZHL_MATCHES = 0;

/* ================= v14: the fd lock/unlock helper 0x00a52890 ===========
   Register-arg helper: ecx = fd, edx = mode (the pushed ecx is the
   _get_osfhandle argument; NOT thiscall). 26 direct callers — every one
   is `push [obj+0xc] ; call [0xb18920] (_fileno) ; mov edx, MODE ;
   mov ecx, eax ; call 0xa52890`. Modes shipped: 1 (x8), 2 (x5), 8 (x13);
   NO caller sets bit 2. Body 0x00a52890..0x00a52931 (0xa2 bytes, 60
   insns, first ret 0x00a52902 EINVAL arm), plain `ret`, 4 indirect IAT
   calls. Flow (raw bytes re-aligned this unit at the case-1/case-2 join):
     edi = _get_osfhandle(fd)      ALWAYS first
     5 zero dwords [ebp-0x14..-4]  (20-byte OVERLAPPED)
     UnlockFileEx(edi, 0, 1, 0, &ovl)   ALWAYS, BEFORE the dispatch,
                                        result NEVER tested
     eax = mode & 0xfffffffb (bit 2 ONLY; 0x100/0x1ff/0xffffffff EINVAL)
       ==1 -> lock, flags = (mode>>2)&1
       ==2 -> lock, flags = ((mode>>2)&1) + 2
       ==8 -> return 0 (unlock only)
       else -> errno arm: *errno = 0x16, return -1
     LockFileEx(edi, flags, 0, 1, NULL)  (6 dwords pushed; the 6th &ovl
       is a stray the 5-arg stdcall never reads — epilogue rebalances)
       test eax,eax ; je errno arm; else return 0
   IAT identities (import dir, this unit): [0xb18250] LockFileEx,
   [0xb18254] UnlockFileEx, [0xb188f0] _get_osfhandle, [0xb18898] _errno. */

export const LOG_VA_FDLOCK = 0x00a52890;
export const LOG_VA_FDLOCK_END = 0x00a52932; /* first int3 after ret */
export const LOG_FDLOCK_BODY_BYTES = 0xa2;
export const LOG_FDLOCK_INSN_COUNT = 60;
export const LOG_FDLOCK_FIRST_RET_VA = 0x00a52902;
export const LOG_FDLOCK_RET_ARGS = 0;
export const LOG_FDLOCK_INDIRECT_CALLS = 4;
export const LOG_FDLOCK_DIRECT_CALLSITES = 26;
export const LOG_FDLOCK_IAT_OSFHANDLE = 0x00b188f0;
export const LOG_FDLOCK_IAT_UNLOCK = 0x00b18254;
export const LOG_FDLOCK_IAT_LOCK = 0x00b18250;
export const LOG_FDLOCK_IAT_ERRNO = 0x00b18898;
export const LOG_FDLOCK_OVERLAPPED_ZERO_DWORDS = 5;
export const LOG_FDLOCK_OVERLAPPED_BYTES = 20;
export const LOG_FDLOCK_UNLOCK_RESERVED = 0;
export const LOG_FDLOCK_UNLOCK_LENGTH_LOW = 1;
export const LOG_FDLOCK_UNLOCK_LENGTH_HIGH = 0;
export const LOG_FDLOCK_LOCK_LENGTH_LOW = 0;
export const LOG_FDLOCK_LOCK_LENGTH_HIGH = 1;
export const LOG_FDLOCK_LOCK_OVERLAPPED_NULL = 1;
export const LOG_FDLOCK_ERRNO_EINVAL = 0x16;
export const LOG_FDLOCK_FAIL_RETURN = 0xffffffff;
export const LOG_FDLOCK_DISPATCH_NONE = 0;
export const LOG_FDLOCK_DISPATCH_LOCK_FLAGS_BIT = 1;
export const LOG_FDLOCK_DISPATCH_LOCK_EXCLUSIVE = 2;
export const LOG_FDLOCK_DISPATCH_UNLOCK_ONLY = 8;
export const LOG_FDLOCK_MODE_MASK = 0xfffffffb;
export const LOG_TEXT_INSN_COUNT_V14 = 2094319;
export const LOG_TEXT_UNDECODABLE_BYTES_V14 = 469;
export const LOG_V14_BATCHED_VAS = 4;
export const LOG_V14_EXACT_ZHL_MATCHES = 0;

/* push [ecx+0xc] ; call [0xb1891c] — NO gate of any kind: no FILE* null
   test, no state read, no guard read. Fires for EVERY input, fflush(NULL)
   included (D-LOG-11's CRT flush-all; body not in image). file_ptr is a
   parameter so a mutant that gates the call is visible. */
function flushSlotCallUnconditionalImpl(filePtr) {
  const file_ptr = filePtr;
  /* the machine NEVER tests it — see the disasm */

  return 1;
}

export function logFlushSlotFileOffset() {
  return LOG_FLUSH_SLOT_FILE_OFFSET;
}

export function logFlushSlotIatVa() {
  return LOG_FLUSH_SLOT_IAT_VA;
}

export function logFlushSlotCallUnconditional(filePtr) {
  return flushSlotCallUnconditionalImpl(filePtr);
}

export function logFlushSlotRetArgs() {
  return LOG_FLUSH_SLOT_RET_ARGS;
}

export function logFlushSlotStackBytesPopped() {
  return LOG_FLUSH_SLOT_STACK_BYTES_POPPED;
}

export function logFlushSlotRetIsFflush() {
  /* EAX untouched between the call and the plain ret. */
  return 1;
}

export function logFlushSlotBodyVa() {
  return LOG_VA_FLUSH_SLOT;
}

export function logFlushSlotBodyBytes() {
  return LOG_FLUSH_SLOT_BODY_BYTES;
}

export function logFlushSlotInsnCount() {
  return LOG_FLUSH_SLOT_INSN_COUNT;
}

export function logFlushSlotFirstRetVa() {
  return LOG_FLUSH_SLOT_FIRST_RET_VA;
}

export function logFlushSlotVtblSlot() {
  return LOG_FLUSH_SLOT_VTBL_SLOT;
}

export function logFlushSlotVtblVa() {
  return LOG_FLUSH_SLOT_VTBL_VA;
}

export function logFlushSlotVtblEntryVa() {
  return LOG_FLUSH_SLOT_VTBL_ENTRY_VA;
}

export function logFlushSlotPushVa() {
  return LOG_FLUSH_SLOT_PUSH_VA;
}

export function logFlushSlotCallVa() {
  return LOG_FLUSH_SLOT_CALL_VA;
}

export function logFlushSlotPopVa() {
  return LOG_FLUSH_SLOT_POP_VA;
}

export function logFlushSlotRetVa() {
  return LOG_FLUSH_SLOT_RET_VA;
}

export function logFlushSlotIndirectCalls() {
  return LOG_FLUSH_SLOT_INDIRECT_CALLS;
}

export function logFlushSlotDirectCallsites() {
  return LOG_FLUSH_SLOT_DIRECT_CALLSITES;
}

export function logFlushSlotInbound() {
  return LOG_FLUSH_SLOT_INBOUND;
}

export function logFlushSlotRawOccurrences() {
  return LOG_FLUSH_SLOT_RAW_OCCURRENCES;
}

export function logFlushSlotFflushIatSites() {
  return LOG_FLUSH_SLOT_FFLUSH_IAT_SITES;
}

export function logFlushSlotVtblIsNop() {
  return LOG_FLUSH_SLOT_VTBL_IS_NOP;
}

/* mov edx,[esi+0x20] ; test edx,edx — FULL 32-bit path cell. 0x100 /
   0x1ff / 0xffffffff fire the guest free; 0 skips. Low-byte reading
   would misfire on 0x100. Same width law as v11, offset +0x20. */
function ndtorFreeGateImpl(pathPtr) {
  return u32(pathPtr) !== 0 ? 1 : 0;
}

/* mov [esi+0x20], 0 — NULL store lives on the free arm ONLY. */
function ndtorPathAfterImpl(pathBefore, freeFired) {
  return u32(freeFired) !== 0 ? 0 : u32(pathBefore);
}

/* push [esi+0x28] ; call [0xb180a4] — NO gate on the release. */
function ndtorReleaseUnconditionalImpl() {
  return 1;
}

/* The release reads the PRE-null cell value (store AFTER the call). */
function ndtorReleaseArgImpl(lobbyBefore) {
  return u32(lobbyBefore);
}

/* mov [esi+0x28], 0 — lobby cell NULLed ALWAYS (both arms). */
function ndtorLobbyAfterImpl(lobbyBefore) {
  return 0;
}

/* BOTH vtable stores unconditional (#1 0xba5520 before the free gate,
   #2 0xba2218 after). No conditional mid-store arm — sink law differs. */
function ndtorBaseStoredImpl(pathPtr) {
  return 1;
}

function ndtorVtableFinalAfterImpl(pathPtr) {
  return LOG_NEIGHBOR_DTOR_INNER_VTABLE_FINAL;
}

export function logNeighborDtorInnerFreeGate(pathPtr) {
  return ndtorFreeGateImpl(pathPtr);
}

export function logNeighborDtorInnerFreeHelperVa() {
  return LOG_VA_SHARED_ALLOCATOR;
}

export function logNeighborDtorInnerPathAfter(pathBefore, freeFired) {
  return ndtorPathAfterImpl(pathBefore, freeFired);
}

export function logNeighborDtorInnerVtableBase() {
  return LOG_NEIGHBOR_DTOR_INNER_VTABLE_BASE;
}

export function logNeighborDtorInnerVtableFinal() {
  return LOG_NEIGHBOR_DTOR_INNER_VTABLE_FINAL;
}

export function logNeighborDtorInnerVtableBaseStored(pathPtr) {
  return ndtorBaseStoredImpl(pathPtr);
}

export function logNeighborDtorInnerVtableFinalAfter(pathPtr) {
  return ndtorVtableFinalAfterImpl(pathPtr);
}

export function logNeighborDtorInnerReleaseUnconditional() {
  return ndtorReleaseUnconditionalImpl();
}

export function logNeighborDtorInnerReleaseArg(lobbyBefore) {
  return ndtorReleaseArgImpl(lobbyBefore);
}

export function logNeighborDtorInnerLobbyAfter(lobbyBefore) {
  return ndtorLobbyAfterImpl(lobbyBefore);
}

export function logNeighborDtorInnerReleaseIatVa() {
  return LOG_IAT_EOS_LOBBYDETAILS_RELEASE;
}

export function logNeighborDtorInnerSubDtorVa() {
  return LOG_NEIGHBOR_DTOR_INNER_SUB_DTOR_VA;
}

export function logNeighborDtorInnerSubDtorOffset() {
  return LOG_NEIGHBOR_DTOR_INNER_SUB_OFFSET;
}

export function logNeighborDtorInnerBodyVa() {
  return LOG_VA_NEIGHBOR_DTOR_INNER;
}

export function logNeighborDtorInnerBodyBytes() {
  return LOG_NEIGHBOR_DTOR_INNER_BODY_BYTES;
}

export function logNeighborDtorInnerInsnCount() {
  return LOG_NEIGHBOR_DTOR_INNER_INSN_COUNT;
}

export function logNeighborDtorInnerRetArgs() {
  return LOG_NEIGHBOR_DTOR_INNER_RET_ARGS;
}

export function logNeighborDtorInnerSehHandler() {
  return LOG_NEIGHBOR_DTOR_INNER_SEH_HANDLER;
}

export function logNeighborDtorInnerInboundCallsites() {
  return LOG_NEIGHBOR_DTOR_INNER_INBOUND_CALLSITES;
}

export function logNeighborDtorInnerRawOccurrences() {
  return LOG_NEIGHBOR_DTOR_INNER_RAW_OCCURRENCES;
}

export function logNeighborDtorInnerReleaseIatSites() {
  return LOG_NEIGHBOR_DTOR_INNER_RELEASE_IAT_SITES;
}

export function logNeighborDtorInnerActionCount(pathPtr) {
  /* [FREE, RELEASE]: free is gated, the EOS release ALWAYS fires. */
  return ndtorFreeGateImpl(pathPtr) + 1;
}

export function logNeighborDtorInnerActionAt(pathPtr, index) {
  if (index == 0) {
    return ndtorFreeGateImpl(pathPtr) !== 0
      ? LOG_NEIGHBOR_DTOR_INNER_ACTION_FREE
      : LOG_NEIGHBOR_DTOR_INNER_ACTION_NONE;
  }
  if (index == 1) {
    return LOG_NEIGHBOR_DTOR_INNER_ACTION_RELEASE;
  }
  return LOG_NEIGHBOR_DTOR_INNER_ACTION_NONE;
}

export function logNeighborDtorInnerActionIsPlatform(action) {
  return action === LOG_NEIGHBOR_DTOR_INNER_ACTION_FREE ||
         action === LOG_NEIGHBOR_DTOR_INNER_ACTION_RELEASE
    ? 1
    : 0;
}

function siblingWriteStateIsOpenImpl(state) {

  return state == (LOG_SINK_STATE_OPEN) ? 1 : 0;
}

function siblingWriteByteCountImpl(fwriteCount, size) {
  const fwrite_count = fwriteCount;

  return Math.imul(fwrite_count, size) >>> 0;
}

export function logSiblingWriteStateIsOpen(state) {
  return siblingWriteStateIsOpenImpl(state);
}

export function logSiblingWriteFwriteNeeded(state) {
  return siblingWriteStateIsOpenImpl(state);
}

export function logSiblingWriteFflushNeeded(state) {


  return 0;
}

export function logSiblingWriteTestsFileNull(filePtr) {
  const file_ptr = filePtr;

  return 0;
}

export function logSiblingFlushTestsFileNull(filePtr) {
  const file_ptr = filePtr;


  return 0;
}

export function logSiblingFlushVcallIsNop() {

  return 0;
}

export function logSiblingWriteByteCount(fwriteCount, size) {
  const fwrite_count = fwriteCount;
  return siblingWriteByteCountImpl(fwrite_count, size);
}

export function logSiblingWriteBytesReturned(state, fwriteCount, size) {
  const fwrite_count = fwriteCount;
  if (siblingWriteStateIsOpenImpl(state) == 0) {

    return 0;
  }
  return siblingWriteByteCountImpl(fwrite_count, size);
}

export function logSiblingWriteStackBytesPopped() {
  return (LOG_WRITE_STACK_BYTES);
}

export function logSiblingWriteVtblSlot() {
  return (LOG_SINK_VTBL_SLOT_WRITE);
}

export function logSiblingWriteBodyVa() {
  return (LOG_VA_SIBLING_WRITE);
}

export function logSiblingWriteBodyBytes() {
  return (LOG_SIBLING_WRITE_BODY_BYTES);
}

export function logSiblingWriteDirectCallsites() {
  return (LOG_SIBLING_WRITE_DIRECT_CALLSITES);
}

export function logSiblingWriteRawOccurrences() {
  return (LOG_SIBLING_WRITE_RAW_OCCURRENCES);
}

export function logSiblingFlushBodyVa() {
  return (LOG_VA_SIBLING_FLUSH);
}

export function logSiblingFlushBodyBytes() {
  return (LOG_SIBLING_FLUSH_BODY_BYTES);
}

export function logSiblingWriteIsOneTemplateWithV6() {
  return 0;
}

export function logSiblingWriteSharedPrefixBytes() {
  return (LOG_SIBLING_SHARED_PREFIX_BYTES);
}

export function logSiblingFreadIsOneTemplate() {
  return 1;
}

export function logSiblingFreadSharedBytes() {
  return (LOG_SIBLING_FREAD_SHARED_BYTES);
}

export function logSiblingWriteActionCount(state) {
  return siblingWriteStateIsOpenImpl(state) != 0 ? 1 : 0;
}

export function logSiblingWriteActionAt(state, index) {
  if (siblingWriteStateIsOpenImpl(state) != 0 && index == 0) {
    return (LOG_SIBLING_WRITE_ACTION_FWRITE);
  }
  return (LOG_SIBLING_WRITE_ACTION_NONE);
}

export function logSiblingWriteActionIsPlatform(action) {
  return action == (LOG_SIBLING_WRITE_ACTION_FWRITE)
             ? 1
             : 0;
}

export function logSiblingWritePlan(input = {}) {
  const s = input || {};
  const state = u32(s.state);
  const file_ptr = u32(s.filePtr);
  const fwrite_count = u32(s.fwriteCount);
  const size = u32(s.size);
  const out = {};


  const open = siblingWriteStateIsOpenImpl(state);
  out.stateIsOpen = open;
  out.fwrite = open;
  out.fflush = logSiblingWriteFflushNeeded(state);
  out.testsFileNull = logSiblingWriteTestsFileNull(file_ptr);
  out.bytesReturned =
      logSiblingWriteBytesReturned(state, fwrite_count, size);
  out.stackBytesPopped = logSiblingWriteStackBytesPopped();
  out.vtblSlot = logSiblingWriteVtblSlot();
  out.bodyVa = logSiblingWriteBodyVa();
  out.fwriteIat = (LOG_IAT_FWRITE);
  out.flushBodyVa = logSiblingFlushBodyVa();
  out.actionCount = logSiblingWriteActionCount(state);
  return out;
}

function siblingFreadStateIsReadableImpl(state) {

  return state == (LOG_SINK_STATE_OPEN_READ) ? 1
                                                                        : 0;
}

function siblingFreadByteCountImpl(freadCount, size) {
  const fread_count = freadCount;

  return Math.imul(fread_count, size) >>> 0;
}

export function logSiblingFreadStateIsReadable(state) {
  return siblingFreadStateIsReadableImpl(state);
}

export function logSiblingFreadNeeded(state) {
  return siblingFreadStateIsReadableImpl(state);
}

export function logSiblingFreadFflushNeeded(state) {


  return 0;
}

export function logSiblingFreadTestsFileNull(filePtr) {
  const file_ptr = filePtr;

  return 0;
}

export function logSiblingFreadByteCount(freadCount, size) {
  const fread_count = freadCount;
  return siblingFreadByteCountImpl(fread_count, size);
}

export function logSiblingFreadBytesReturned(state, freadCount, size) {
  const fread_count = freadCount;
  if (siblingFreadStateIsReadableImpl(state) == 0) {

    return 0;
  }
  return siblingFreadByteCountImpl(fread_count, size);
}

export function logSiblingFreadStackBytesPopped() {
  return (LOG_WRITE_STACK_BYTES);
}

export function logSiblingFreadVtblSlot() {
  return (LOG_SINK_VTBL_SLOT_FREAD);
}

export function logSiblingFreadBodyVa() {
  return (LOG_VA_SIBLING_FREAD);
}

export function logSiblingFreadBodyBytes() {
  return (LOG_SIBLING_FREAD_BODY_BYTES);
}

export function logSiblingFreadDirectCallsites() {
  return (LOG_SIBLING_FREAD_DIRECT_CALLSITES);
}

export function logSiblingFreadRawOccurrences() {
  return (LOG_SIBLING_FREAD_RAW_OCCURRENCES);
}

export function logSiblingFreadWriteSiblingVa() {

  return (LOG_VA_SIBLING_WRITE);
}

export function logSiblingFreadIsFoldedIntoV7() {
  return 0;
}

export function logSiblingFreadActionCount(state) {
  return siblingFreadStateIsReadableImpl(state) != 0 ? 1 : 0;
}

export function logSiblingFreadActionAt(state, index) {
  if (siblingFreadStateIsReadableImpl(state) != 0 && index == 0) {
    return (LOG_SIBLING_FREAD_ACTION_FREAD);
  }
  return (LOG_SIBLING_FREAD_ACTION_NONE);
}

export function logSiblingFreadActionIsPlatform(action) {
  return action == (LOG_SIBLING_FREAD_ACTION_FREAD)
             ? 1
             : 0;
}

export function logSiblingFreadPlan(input = {}) {
  const s = input || {};
  const state = u32(s.state);
  const file_ptr = u32(s.filePtr);
  const fread_count = u32(s.freadCount);
  const size = u32(s.size);
  const out = {};


  const readable = siblingFreadStateIsReadableImpl(state);
  out.stateIsReadable = readable;
  out.fread = readable;
  out.fflush = logSiblingFreadFflushNeeded(state);
  out.testsFileNull = logSiblingFreadTestsFileNull(file_ptr);
  out.bytesReturned =
      logSiblingFreadBytesReturned(state, fread_count, size);
  out.stackBytesPopped = logSiblingFreadStackBytesPopped();
  out.vtblSlot = logSiblingFreadVtblSlot();
  out.bodyVa = logSiblingFreadBodyVa();
  out.freadIat = (LOG_IAT_FREAD);
  out.writeSiblingVa = logSiblingFreadWriteSiblingVa();
  out.actionCount = logSiblingFreadActionCount(state);
  return out;
}

export const LOG_LIFECYCLE_BYTE_WRITER_SITES = Object.freeze({
  [0x00a714af]: 1,
  [0x00a71bf6]: 0,
});

export const LOG_GUARD_REACHABLE_VALUES = Object.freeze([0, 1, 2]);

/* Ready-bit predicate encodings: F6 /0 ib, four ModRM forms.
   0x00a157fe is the 4-byte lock test with the jcc split off by a spill. */
export const LOG_READY_BIT_PREDICATE_BYTES = Object.freeze({
  [0x00a1577a]: "f6 47 04 01 75",
  [0x00a7139a]: "f6 05 48 ab c5 00 01 75",
  [0x00a713f8]: "f6 05 7c 9a c7 00 01 74",
  [0x00a157fe]: "f6 40 04 01",
  [0x00a159a3]: "f6 46 04 01 75",
});

/* ======================= v14: the fd lock/unlock oracle =================
   The PE-truth reference, transcribed branch-by-branch from the machine:
     push ecx; mov esi,edx            ; (fd in ecx -> _get_osfhandle arg)
     call [0xb188f0]                  ; _get_osfhandle ALWAYS
     <zero 5 dwords at ebp-0x14..-4>  ; 20-byte OVERLAPPED
     call [0xb18254]                  ; UnlockFileEx ALWAYS (result ignored)
     mov eax, esi; and eax, ~4        ; 32-bit mask, bit 2 only
     sub eax,1; je case1  sub eax,1; je case2  sub eax,6; je case8
     default: _errno; *errno=0x16; or eax,-1; ret   ; -1
     case1: esi=(esi>>2)&1; fall into the lock block
     case2: esi=((esi>>2)&1)+2; jmp the lock block
     lock block: call [0xb18250]      ; LockFileEx(hFile, esi, 0, 1, NULL)
       test eax,eax; je default-arm   ; lock fail -> SAME EINVAL arm
       xor eax,eax; ret               ; 0
     case8: xor eax,eax; ret          ; 0 (no lock call)
   The dispatch here is a subtraction chain, NOT a switch — reproduce the
   exact 32-bit wrap arithmetic (0x100000001&~4 would pass the first je on
   32-bit eax). */

function fdlockDispatchImpl(mode) {
  const m = (mode & LOG_FDLOCK_MODE_MASK) | 0; /* 32-bit and eax,~4 */
  let x = (m - 1) | 0; /* sub eax, 1 */
  if (x === 0) {
    return LOG_FDLOCK_DISPATCH_LOCK_FLAGS_BIT;
  }
  x = (x - 1) | 0; /* sub eax, 1 */
  if (x === 0) {
    return LOG_FDLOCK_DISPATCH_LOCK_EXCLUSIVE;
  }
  x = (x - 6) | 0; /* sub eax, 6 */
  if (x === 0) {
    return LOG_FDLOCK_DISPATCH_UNLOCK_ONLY;
  }
  return LOG_FDLOCK_DISPATCH_NONE;
}

function fdlockLockFiresImpl(mode) {
  const d = fdlockDispatchImpl(mode);
  return d === LOG_FDLOCK_DISPATCH_LOCK_FLAGS_BIT ||
          d === LOG_FDLOCK_DISPATCH_LOCK_EXCLUSIVE
      ? 1
      : 0;
}

/* shr esi,2 ; and esi,1 — bit 2 of the ORIGINAL (unmasked) mode — then
   case 2 adds 2. Flags are never computed on cases 8/default (export 0). */
function fdlockLockFlagsImpl(mode) {
  const d = fdlockDispatchImpl(mode);
  const bit2 = (mode >>> 2) & 1;
  if (d === LOG_FDLOCK_DISPATCH_LOCK_FLAGS_BIT) {
    return bit2 >>> 0;
  }
  if (d === LOG_FDLOCK_DISPATCH_LOCK_EXCLUSIVE) {
    return (bit2 + 2) >>> 0;
  }
  return 0;
}

/* The shared errno arm: reachable from the default dispatch AND from a
   failed LockFileEx. lock_ok = the LockFileEx result (nonzero=success);
   NOT consulted on case 8 (no lock) or the default (already failing). */
function fdlockErrnoAfterImpl(mode, lockOk) {
  const d = fdlockDispatchImpl(mode);
  const lockFails =
      fdlockLockFiresImpl(mode) !== 0 && lockOk === 0 ? 1 : 0;
  return d === LOG_FDLOCK_DISPATCH_NONE || lockFails !== 0
      ? LOG_FDLOCK_ERRNO_EINVAL
      : 0;
}

function fdlockReturnsImpl(mode, lockOk) {
  /* or eax, 0xffffffff — the errno arm RETURNS -1 (int32). */
  return fdlockErrnoAfterImpl(mode, lockOk) !== 0 ? -1 : 0;
}

/* ---- identities ---- */
export function logFdlockBodyVa() {
  return LOG_VA_FDLOCK;
}
export function logFdlockBodyBytes() {
  return LOG_FDLOCK_BODY_BYTES;
}
export function logFdlockInsnCount() {
  return LOG_FDLOCK_INSN_COUNT;
}
export function logFdlockFirstRetVa() {
  return LOG_FDLOCK_FIRST_RET_VA;
}
export function logFdlockRetArgs() {
  return LOG_FDLOCK_RET_ARGS;
}
export function logFdlockDirectCallsites() {
  return LOG_FDLOCK_DIRECT_CALLSITES;
}
export function logFdlockIndirectCalls() {
  return LOG_FDLOCK_INDIRECT_CALLS;
}
export function logFdlockOverlappedZeroDwords() {
  return LOG_FDLOCK_OVERLAPPED_ZERO_DWORDS;
}
export function logFdlockOverlappedBytes() {
  return LOG_FDLOCK_OVERLAPPED_BYTES;
}

/* ---- IAT identities ---- */
export function logFdlockOsfhandleIatVa() {
  return LOG_FDLOCK_IAT_OSFHANDLE;
}
export function logFdlockUnlockIatVa() {
  return LOG_FDLOCK_IAT_UNLOCK;
}
export function logFdlockLockIatVa() {
  return LOG_FDLOCK_IAT_LOCK;
}
export function logFdlockErrnoIatVa() {
  return LOG_FDLOCK_IAT_ERRNO;
}

/* ---- host-action laws ---- */
export function logFdlockOsfhandleUnconditional(fd, mode) {
  /* call [0xb188f0] is the first instruction effect of the body — no
     branch precedes it; neither param is ever tested. */
  void fd;
  void mode;
  return 1;
}

export function logFdlockUnlockUnconditional(mode) {
  /* call [0xb18254] sits BEFORE the dispatch chain: even a mode that then
     fails with EINVAL has already unlocked (D-LOG-12). */
  void mode;
  return 1;
}

export function logFdlockUnlockResultIgnored() {
  /* eax after the call is immediately overwritten by `mov eax, esi` —
     the unlock result is NEVER tested (D-LOG-14). */
  return 1;
}
export function logFdlockUnlockReserved() {
  return LOG_FDLOCK_UNLOCK_RESERVED;
}
export function logFdlockUnlockLengthLow() {
  return LOG_FDLOCK_UNLOCK_LENGTH_LOW;
}
export function logFdlockUnlockLengthHigh() {
  return LOG_FDLOCK_UNLOCK_LENGTH_HIGH;
}
export function logFdlockUnlockUsesOverlapped() {
  /* push eax(&ovl) is arg5 of the 5-arg unlock — the 20 zeroed bytes. */
  return 1;
}

export function logFdlockDispatch(mode) {
  return fdlockDispatchImpl(mode);
}

export function logFdlockLockFires(mode) {
  return fdlockLockFiresImpl(mode);
}
export function logFdlockLockFlags(mode) {
  return fdlockLockFlagsImpl(mode);
}
export function logFdlockLockLengthLow() {
  return LOG_FDLOCK_LOCK_LENGTH_LOW;
}
export function logFdlockLockLengthHigh() {
  return LOG_FDLOCK_LOCK_LENGTH_HIGH;
}
export function logFdlockLockOverlappedNull() {
  /* arg5 of the lock call is 0 (NULL); the pushed &ovl is the 6th STRAY
     dword a 5-arg stdcall never reads (D-LOG-13). */
  return LOG_FDLOCK_LOCK_OVERLAPPED_NULL;
}

export function logFdlockErrnoValue() {
  return LOG_FDLOCK_ERRNO_EINVAL;
}
export function logFdlockFailReturn() {
  return LOG_FDLOCK_FAIL_RETURN;
}
export function logFdlockErrnoAfter(mode, lockOk) {
  return fdlockErrnoAfterImpl(mode, lockOk);
}
export function logFdlockReturns(mode, lockOk) {
  return fdlockReturnsImpl(mode, lockOk);
}

/* ======================= v18: the shared sub-object VECTOR dtor 0x00426980 ======================= */

/* The dtor-island chain's LAST host leaf: the neighbor inner calls
   0x00426980 ALWAYS and LAST (0x00a840c8 lea ecx,[esi+0x10] ; call), and
   the Update tail / exit / hud families reuse it for every destroyed
   std::vector (cross-object). MSVC vector _Tidy_deallocate, NO SEH/GS
   frame:
     mov eax,[esi]            ; begin (+0)
     test eax,eax ; je ret    ; BEGIN GATE FULL 32-bit
     mov ecx,[esi+8]          ; end-of-storage (+8)
     sub ecx,eax              ; byte count = end - begin     (wrap)
     and ecx,0xfffffff8       ; count &= ~7
     cmp ecx,0x1000 ; jb smal ; UNSIGNED: count < 0x1000 -> SMALL
     mov edx,[eax-4]          ; header = *(begin - 4)
     add ecx,0x23             ; size_arg = count + 0x23 (large arm)
     sub eax,edx ; add eax,-4 ; delta = begin - header - 4  (wrap)
     cmp eax,0x1f ; ja inval  ; (u32)delta > 0x1f -> HOST abort
     mov eax,edx              ; ptr = header
     push ecx ; push eax ; call 0xaef15c   ; HOST sized delete
     mov [esi],0 ; mov [esi+4],0 ; mov [esi+8],0  ; 3 nulls AFTER the free
     ret
     0x4269cb call [0xb18894] ; _invalid_parameter_noinfo (noreturn)
   Args: SMALL (begin, count); LARGE (header, count + 0x23). Host leaves:
   the sized-delete shim 0xaef15c and _invalid_parameter IAT 0xb18894.
   Census (this unit): 86 E8 rel32 call sites whole-.text (incl. neighbor
   inner 0xa840c8 + Update tail 0x6fbb6e), verified tail-jmp thunks
   0x4269e0/0x8fd8ef/0x909113/0x90a893/0xb16a45/0xb0a0e3, 0 raw dwords. */

export const LOG_VA_SUB_DTOR = 0x00426980;
export const LOG_SUB_DTOR_END = 0x004269d1;       /* first int3 */
export const LOG_SUB_DTOR_BODY_BYTES = 0x51;
export const LOG_SUB_DTOR_INSN_COUNT = 36;
export const LOG_SUB_DTOR_FIRST_RET_VA = 0x004269ca;
export const LOG_SUB_DTOR_RET_ARGS = 0;
export const LOG_SUB_DTOR_BEGIN_OFFSET = 0;
export const LOG_SUB_DTOR_MYLAST_OFFSET = 4;
export const LOG_SUB_DTOR_MYEND_OFFSET = 8;
export const LOG_SUB_DTOR_COUNT_MASK = 0xfffffff8;
export const LOG_SUB_DTOR_SMALL_BOUND = 0x1000;
export const LOG_SUB_DTOR_LARGE_SIZE_BIAS = 0x23;
export const LOG_SUB_DTOR_HEADER_DELTA_MAX = 0x1f;
export const LOG_SUB_DTOR_DELETE_VA = 0x00aef15c;
export const LOG_SUB_DTOR_INVALID_IAT = 0x00b18894;
export const LOG_SUB_DTOR_INVALID_CALL_VA = 0x004269cb;
export const LOG_SUB_DTOR_FREE_CALL_VA = 0x004269ad;
export const LOG_SUB_DTOR_NULL1_VA = 0x004269b2;
export const LOG_SUB_DTOR_NULL2_VA = 0x004269bb;
export const LOG_SUB_DTOR_NULL3_VA = 0x004269c2;
export const LOG_SUB_DTOR_E8_CALLSITES = 86;
export const LOG_SUB_DTOR_RAW_OCCURRENCES = 0;
export const LOG_SUB_DTOR_PLAN_NONE = 0;
export const LOG_SUB_DTOR_PLAN_SMALL = 1;
export const LOG_SUB_DTOR_PLAN_LARGE = 2;
export const LOG_SUB_DTOR_PLAN_INVALID = 3;
export const LOG_TEXT_INSN_COUNT_V18 = 2094319;
export const LOG_TEXT_UNDECODABLE_BYTES_V18 = 469;
export const LOG_V18_BATCHED_VAS = 3;
export const LOG_V18_EXACT_ZHL_MATCHES = 0;

/* test eax,eax ; je — FULL 32-bit begin gate: only 0 skips the free. */
function subDtorNeededImpl(begin) {
  return u32(begin) !== 0 ? 1 : 0;
}

/* sub ecx,eax ; and ecx,0xfffffff8 — wrap BEFORE the mask. The JS &
   operator yields a SIGNED Int32, so the result is forced back to
   unsigned 32-bit exactly like the machine's dword arithmetic. */
function subDtorByteCountImpl(begin, end) {
  return ((u32(end) - u32(begin)) & LOG_SUB_DTOR_COUNT_MASK) >>> 0;
}

/* cmp ecx,0x1000 ; jb — UNSIGNED. */
function subDtorLargeImpl(begin, end) {
  return subDtorByteCountImpl(begin, end) >= LOG_SUB_DTOR_SMALL_BOUND ? 1 : 0;
}

/* sub eax,edx ; add eax,-4 ; cmp eax,0x1f ; ja — (u32)(begin-header-4). */
function subDtorHeaderSaneImpl(begin, header) {
  const delta = (u32(begin) - u32(header) - 4) >>> 0;
  return delta <= LOG_SUB_DTOR_HEADER_DELTA_MAX ? 1 : 0;
}

function subDtorFreePlanImpl(begin, end, header) {
  if (u32(begin) === 0) return LOG_SUB_DTOR_PLAN_NONE;
  if (!subDtorLargeImpl(begin, end)) return LOG_SUB_DTOR_PLAN_SMALL;
  return subDtorHeaderSaneImpl(begin, header)
    ? LOG_SUB_DTOR_PLAN_LARGE
    : LOG_SUB_DTOR_PLAN_INVALID;
}

export function logSubDtorNeeded(begin) {
  return subDtorNeededImpl(begin);
}
export function logSubDtorByteCount(begin, end) {
  return subDtorByteCountImpl(begin, end);
}
export function logSubDtorLarge(begin, end) {
  return subDtorLargeImpl(begin, end);
}
export function logSubDtorHeaderSane(begin, header) {
  return subDtorHeaderSaneImpl(begin, header);
}
export function logSubDtorFreePlan(begin, end, header) {
  return subDtorFreePlanImpl(begin, end, header);
}
export function logSubDtorFreePtr(begin, end, header) {
  const plan = subDtorFreePlanImpl(begin, end, header);
  if (plan === LOG_SUB_DTOR_PLAN_SMALL) return u32(begin);
  if (plan === LOG_SUB_DTOR_PLAN_LARGE) return u32(header);
  return 0;
}
export function logSubDtorFreeSize(begin, end, header) {
  const plan = subDtorFreePlanImpl(begin, end, header);
  const count = subDtorByteCountImpl(begin, end);
  if (plan === LOG_SUB_DTOR_PLAN_SMALL) return count;
  if (plan === LOG_SUB_DTOR_PLAN_LARGE) {
    return (count + LOG_SUB_DTOR_LARGE_SIZE_BIAS) >>> 0;
  }
  return 0;
}
export function logSubDtorInvalidNeeded(begin, end, header) {
  return subDtorFreePlanImpl(begin, end, header) === LOG_SUB_DTOR_PLAN_INVALID
    ? 1
    : 0;
}
export function logSubDtorNullAfter(begin, end, header) {
  return subDtorFreePlanImpl(begin, end, header) === LOG_SUB_DTOR_PLAN_NONE ? 0 : 1;
}
export function logSubDtorBodyVa() {
  return LOG_VA_SUB_DTOR;
}
export function logSubDtorBodyBytes() {
  return LOG_SUB_DTOR_BODY_BYTES;
}
export function logSubDtorInsnCount() {
  return LOG_SUB_DTOR_INSN_COUNT;
}
export function logSubDtorFirstRetVa() {
  return LOG_SUB_DTOR_FIRST_RET_VA;
}
export function logSubDtorRetArgs() {
  return LOG_SUB_DTOR_RET_ARGS;
}
export function logSubDtorBeginOffset() {
  return LOG_SUB_DTOR_BEGIN_OFFSET;
}
export function logSubDtorMylastOffset() {
  return LOG_SUB_DTOR_MYLAST_OFFSET;
}
export function logSubDtorMyendOffset() {
  return LOG_SUB_DTOR_MYEND_OFFSET;
}
export function logSubDtorDeleteVa() {
  return LOG_SUB_DTOR_DELETE_VA;
}
export function logSubDtorInvalidIatVa() {
  return LOG_SUB_DTOR_INVALID_IAT;
}
export function logSubDtorInvalidCallVa() {
  return LOG_SUB_DTOR_INVALID_CALL_VA;
}
export function logSubDtorE8Callsites() {
  return LOG_SUB_DTOR_E8_CALLSITES;
}
export function logSubDtorRawOccurrences() {
  return LOG_SUB_DTOR_RAW_OCCURRENCES;
}

/* ======================= v19: the open-helper path-combine 0x00a5a7a0 ======================= */

/* The shared open-helper path COMBINE (flipped HOST -> PURE this unit).
   combine(ecx=path, edx=base, [ebp+8]=lowercase flag, [ebp+0xc]=trailing-
   slash flag): inline strlen lens (NULL -> 0), has-sep detect (base tail
   in {'/','\\'}), both-empty counted-empty arm (malloc(5), header dword
   5, payload "" at +4, 64-bit counter += 5 at init+0x30 or 0xc7f618;
   fail -> broadcast 0x7fcb9dd6 + directed null-write crash, no value),
   size law (byte)flag4 + 2 + len_base + len_path, tracked alloc mode 0
   via 0xa648b0 (host), mode selection (copy-path / copy-base / join),
   join fmt = has_sep ? "%s%s" (0xb60c28) : "%s/%s" (0xb9ee70) via the
   vsprintf_s shim 0x652a30, per-char lowercase gate (gated + 8-bit
   (ch-0x41)<=0x19) + UNCONDITIONAL backslash->slash, trailing "/" append
   decision (flag && last != '/'), return out.
   Host leaves: malloc [0xb187e0], strncpy_s [0xb18938], strcat_s
   [0xb18930], __stdio_common_vsprintf_s [0xb188e4] via shim 0x652a30
   (options u64 0xc71648 via getter 0x41d4c0), tracked allocator
   0xa648b0, fail broadcast 0xa23200 (list head 0xc37974).
   Census (this unit, whole-.text): 46 direct callsites (7 log-family +
   39 cross-family), ZERO escapes, zero jcc/push/mov-imm forms, zero raw
   dwords, no mid-body inbound. Body 0xa5a7a0..0xa5a938 (0x199 bytes,
   166 insns, 3 rets), 7 int3 pad, next function 0xa5a940. */

export const LOG_VA_OPEN_COMBINE = 0x00a5a7a0;
export const LOG_OPEN_COMBINE_END = 0x00a5a939; /* first int3 */
export const LOG_OPEN_COMBINE_BODY_BYTES = 0x199;
export const LOG_OPEN_COMBINE_INSN_COUNT = 166;
export const LOG_OPEN_COMBINE_FIRST_RET_VA = 0x00a5a83a;
export const LOG_OPEN_COMBINE_RET_ARGS = 0;      /* plain ret */
export const LOG_OPEN_COMBINE_RETS = 3;          /* 83a/854/938 */
export const LOG_OPEN_COMBINE_INBOUND_CALLSITES = 46;
export const LOG_OPEN_COMBINE_RAW_OCCURRENCES = 0;
export const LOG_OPEN_COMBINE_SEP_SLASH = 0x2f;
export const LOG_OPEN_COMBINE_SEP_BACKSLASH = 0x5c;
export const LOG_OPEN_COMBINE_JOIN_SEP_VA = 0x00b60c28;   /* "%s%s" */
export const LOG_OPEN_COMBINE_JOIN_NOSEP_VA = 0x00b9ee70; /* "%s/%s" */
export const LOG_OPEN_COMBINE_SLASH_STR_VA = 0x00b6db28;  /* "/" */
export const LOG_OPEN_COMBINE_FAIL_CODE = 0x7fcb9dd6;
export const LOG_OPEN_COMBINE_FAIL_BROADCAST_VA = 0x00a23200;
export const LOG_OPEN_COMBINE_FAIL_LIST_HEAD_VA = 0x00c37974;
export const LOG_OPEN_COMBINE_ALLOC_VA = 0x00a648b0;
export const LOG_OPEN_COMBINE_VSPRINTF_S_VA = 0x00652a30;
export const LOG_OPEN_COMBINE_OPTIONS_GETTER = 0x0041d4c0;
export const LOG_OPEN_COMBINE_OPTIONS_VA = 0x00c71648;
export const LOG_OPEN_COMBINE_MALLOC_IAT = 0x00b187e0;
export const LOG_OPEN_COMBINE_STRNCPY_S_IAT = 0x00b18938;
export const LOG_OPEN_COMBINE_STRCAT_S_IAT = 0x00b18930;
export const LOG_OPEN_COMBINE_VSPRINTF_S_IAT = 0x00b188e4;
export const LOG_OPEN_COMBINE_COUNTER_DEFAULT_VA = 0x00c7f618;
export const LOG_OPEN_COMBINE_COUNTER_INIT_OFFSET = 0x30;
export const LOG_OPEN_COMBINE_INIT_OBJECT_VA = 0x00c7de78;
export const LOG_OPEN_COMBINE_BASE_GLOBAL_VA = 0x00c5aa98;
export const LOG_OPEN_COMBINE_BOTH_EMPTY_HEADER = 5;
export const LOG_OPEN_COMBINE_BOTH_EMPTY_DELTA = 5;
export const LOG_OPEN_COMBINE_SIZE_SLACK = 2;
export const LOG_OPEN_COMBINE_MODE_COPY_PATH = 0;
export const LOG_OPEN_COMBINE_MODE_COPY_BASE = 1;
export const LOG_OPEN_COMBINE_MODE_JOIN = 2;
export const LOG_TEXT_INSN_COUNT_V19 = 2094319; /* same deterministic decode */
export const LOG_TEXT_UNDECODABLE_BYTES_V19 = 469;
export const LOG_V19_BATCHED_VAS = 7;
export const LOG_V19_EXACT_ZHL_MATCHES = 0;

function combineLastByteImpl(lastByte) {
  /* cmp al,0x2f / cmp al,0x5c — 8-bit compares, WIDE input. */
  return u32(lastByte) & 0xff;
}

/* len_base > 0 AND base[len-1] in {'/','\\'}; len_base == 0 -> 0 without
   reading base[-1] (0xa5a7df je clears the flag byte). */
export function logCombineHasTrailingSep(lenBase, lastByte) {
  if (u32(lenBase) === 0) return 0;
  const b = combineLastByteImpl(lastByte);
  return b === LOG_OPEN_COMBINE_SEP_SLASH ||
         b === LOG_OPEN_COMBINE_SEP_BACKSLASH
    ? 1
    : 0;
}

export function logCombineBothEmpty(lenPath, lenBase) {
  return u32(lenPath) === 0 && u32(lenBase) === 0 ? 1 : 0;
}

/* mov esi,[0xc7de78]; test; je default; add esi,0x30. */
export function logCombineCounterVa(initPtr) {
  return u32(initPtr) !== 0
    ? (u32(initPtr) + LOG_OPEN_COMBINE_COUNTER_INIT_OFFSET) >>> 0
    : LOG_OPEN_COMBINE_COUNTER_DEFAULT_VA;
}

export function logCombineBothEmptyHeader() {
  return LOG_OPEN_COMBINE_BOTH_EMPTY_HEADER;
}

export function logCombineBothEmptyDelta() {
  return LOG_OPEN_COMBINE_BOTH_EMPTY_DELTA;
}

/* movzx eax, byte [ebp+0xc]; add eax,2; add eax,edi; add eax,esi — the
   flag is BYTE-zero-extended; the adds wrap 32-bit. */
export function logCombineAllocSize(lenPath, lenBase, trailingFlag) {
  return (
    (u32(lenPath) + u32(lenBase) + (trailingFlag & 0xff) +
      LOG_OPEN_COMBINE_SIZE_SLACK) >>>
    0
  );
}

/* lea ecx,[esi+1] — count = src_len + 1, 32-bit wrap. */
export function logCombineCopyCount(srcLen) {
  return (u32(srcLen) + 1) >>> 0;
}

/* len_base==0 -> COPY_PATH; else len_path==0 -> COPY_BASE; else JOIN.
   (The combine arm is reached only when len_path+len_base > 0.) */
export function logCombineMode(lenPath, lenBase) {
  if (u32(lenBase) === 0) return LOG_OPEN_COMBINE_MODE_COPY_PATH;
  if (u32(lenPath) === 0) return LOG_OPEN_COMBINE_MODE_COPY_BASE;
  return LOG_OPEN_COMBINE_MODE_JOIN;
}

/* has_sep == 0 -> insert "/" (fmt "%s/%s"); has_sep != 0 -> direct join. */
export function logCombineJoinUsesSep(hasTrailingSep) {
  return combineLastByteImpl(hasTrailingSep) !== 0 ? 0 : 1;
}

/* Byte-gate EXACT: lowercase gated by flag AND 8-bit (ch-0x41) <= 0x19
   (unsigned; only 0x41..0x5A qualify); backslash -> slash ALWAYS. */
export function logCombineNormalizeChar(ch, lowercaseFlag) {
  let b = combineLastByteImpl(ch);
  if (combineLastByteImpl(lowercaseFlag) !== 0) {
    const d = (b - 0x41) & 0xff;
    if (d <= 0x19) b = (b + 0x20) & 0xff;
  }
  if (b === LOG_OPEN_COMBINE_SEP_BACKSLASH) {
    b = LOG_OPEN_COMBINE_SEP_SLASH;
  }
  return b;
}

/* flag && last_byte != '/' — the len==0 read is the pre-buffer byte
   out[-1] (caller passes it as last_byte; never corrected). */
export function logCombineTrailingNeeded(trailingFlag, lastByte) {
  if (combineLastByteImpl(trailingFlag) === 0) return 0;
  return combineLastByteImpl(lastByte) === LOG_OPEN_COMBINE_SEP_SLASH ? 0 : 1;
}

export function logCombineFailCrashes() {
  /* push 0x7fcb9dd6; call 0xa23200; xor eax,eax; mov [eax],al — the
     directed write-to-VA-0 crash; no value ever returns. */
  return 1;
}

export function logCombineFailCode() {
  return LOG_OPEN_COMBINE_FAIL_CODE;
}

export function logCombineBodyVa() {
  return LOG_VA_OPEN_COMBINE;
}
export function logCombineEndVa() {
  return LOG_OPEN_COMBINE_END;
}
export function logCombineBodyBytes() {
  return LOG_OPEN_COMBINE_BODY_BYTES;
}
export function logCombineInsnCount() {
  return LOG_OPEN_COMBINE_INSN_COUNT;
}
export function logCombineFirstRetVa() {
  return LOG_OPEN_COMBINE_FIRST_RET_VA;
}
export function logCombineRetArgs() {
  return LOG_OPEN_COMBINE_RET_ARGS;
}
export function logCombineRets() {
  return LOG_OPEN_COMBINE_RETS;
}
export function logCombineInboundCallsites() {
  return LOG_OPEN_COMBINE_INBOUND_CALLSITES;
}
export function logCombineRawOccurrences() {
  return LOG_OPEN_COMBINE_RAW_OCCURRENCES;
}
export function logCombineJoinSepVa() {
  return LOG_OPEN_COMBINE_JOIN_SEP_VA;
}
export function logCombineJoinNosepVa() {
  return LOG_OPEN_COMBINE_JOIN_NOSEP_VA;
}
export function logCombineSlashStrVa() {
  return LOG_OPEN_COMBINE_SLASH_STR_VA;
}
export function logCombineFailBroadcastVa() {
  return LOG_OPEN_COMBINE_FAIL_BROADCAST_VA;
}
export function logCombineAllocVa() {
  return LOG_OPEN_COMBINE_ALLOC_VA;
}
export function logCombineMallocIatVa() {
  return LOG_OPEN_COMBINE_MALLOC_IAT;
}
export function logCombineStrncpySIatVa() {
  return LOG_OPEN_COMBINE_STRNCPY_S_IAT;
}
export function logCombineStrcatSIatVa() {
  return LOG_OPEN_COMBINE_STRCAT_S_IAT;
}

/* ======================= v20: the fail-broadcast list walk 0x00a23200 ======================= */

/* The shared fail-broadcast walk — PURE decisions land this unit. The
   callback dispatch (call eax at 0xa2321a) stays TYPED-HOST (MSVC
   node-list callbacks = platform); the walk's own: entry gate on the
   SNAPSHOT head, loop gate on the LIVE head, fail-code passthrough,
   the 44-constant / 1-dynamic site census, the registration gate
   (dynamic initializer 0x406740 + CRT init table 0xb18ba4) and the
   atexit teardown (0xb16c80, pinned dangling head). */

export const LOG_VA_FAIL_BROADCAST = 0x00a23200;
export const LOG_FAIL_BROADCAST_END = 0x00a2322f;       /* first int3 */
export const LOG_FAIL_BROADCAST_BODY_BYTES = 0x2f;
export const LOG_FAIL_BROADCAST_INSN_COUNT = 21;
export const LOG_FAIL_BROADCAST_FIRST_RET_VA = 0x00a2322c;
export const LOG_FAIL_BROADCAST_RET_ARGS = 4;           /* ret 4 */
export const LOG_FAIL_BROADCAST_RETS = 1;
export const LOG_FAIL_BROADCAST_INDIRECT_CALLS = 1;     /* dispatch */
export const LOG_FAIL_BROADCAST_E8_CALLS = 0;
export const LOG_FAIL_BROADCAST_DIRECT_CALLSITES = 45;
export const LOG_FAIL_BROADCAST_INLINED_COPIES = 6;
export const LOG_FAIL_BROADCAST_RAW_OCCURRENCES = 0;
export const LOG_FAIL_BROADCAST_LIST_HEAD_VA = 0x00c37974;
export const LOG_FAIL_BROADCAST_FAIL_CODE = 0x7fcb9dd6;
export const LOG_FAIL_BROADCAST_CONSTANT_CODE_SITES = 44;
export const LOG_FAIL_BROADCAST_DYNAMIC_CODE_SITE_VA = 0x00a23129;
export const LOG_FAIL_BROADCAST_DYNAMIC_CODE_SOURCE_VA = 0x00a23260;
export const LOG_FAIL_BROADCAST_NODE_NEXT_OFFSET = 0x00;
export const LOG_FAIL_BROADCAST_NODE_PREV_OFFSET = 0x04;
export const LOG_FAIL_BROADCAST_NODE_FN_OFFSET = 0x08;
export const LOG_FAIL_BROADCAST_NODE_CTX_OFFSET = 0x0c;
export const LOG_FAIL_BROADCAST_CALLBACK_ARGS = 2;
export const LOG_FAIL_BROADCAST_CALLBACK_STACK_BYTES = 8;
export const LOG_FAIL_BROADCAST_HEAD_WRITERS = 2;
export const LOG_FAIL_BROADCAST_HEAD_ZERO_WRITE_VA = 0x0040678a;
export const LOG_FAIL_BROADCAST_HEAD_SENTINEL_WRITE_VA = 0x004067ad;
export const LOG_FAIL_BROADCAST_HEAD_READER_SITES = 18;
export const LOG_FAIL_BROADCAST_HEAD_LOAD_VALUE = 0;
export const LOG_FAIL_BROADCAST_HEAD_WRITES_AFTER_INIT = 0;
export const LOG_FAIL_BROADCAST_SENTINEL_SELF_LINKS = 1;
export const LOG_FAIL_BROADCAST_INIT_THUNK_VA = 0x00406740;
export const LOG_FAIL_BROADCAST_INIT_TABLE_SLOT_VA = 0x00b18ba4;
export const LOG_FAIL_BROADCAST_INIT_SEH_VA = 0x00b11949;
export const LOG_FAIL_BROADCAST_OBJECT_VA = 0x00c37964;
export const LOG_FAIL_BROADCAST_OBJECT_VTABLE_VA = 0x00ba2120;
export const LOG_FAIL_BROADCAST_ACTIVE_LIST_HEAD_VA = 0x00c3796c;
export const LOG_FAIL_BROADCAST_SENTINEL_A_SIZE = 0x18;
export const LOG_FAIL_BROADCAST_SENTINEL_B_SIZE = 0x10;
export const LOG_FAIL_BROADCAST_SENTINEL_TAG = 0x101;
export const LOG_FAIL_BROADCAST_DTOR_VA = 0x00b16c80;
export const LOG_FAIL_BROADCAST_DTOR_BODY_BYTES = 0x5e;
export const LOG_FAIL_BROADCAST_DTOR_FIRST_RET_VA = 0x00b16cdd;
export const LOG_FAIL_BROADCAST_DTOR_RET_ARGS = 0;
export const LOG_FAIL_BROADCAST_DTOR_HEAD_DELETE_SIZE = 0x10;
export const LOG_FAIL_BROADCAST_DTOR_CLEARS_HEAD = 0;
export const LOG_FAIL_BROADCAST_DTOR_VTABLE_SWAP_1 = 0x00b82d40;
export const LOG_FAIL_BROADCAST_DTOR_VTABLE_SWAP_2 = 0x00b9fdcc;
export const LOG_FAIL_BROADCAST_ATEXIT_VA = 0x00aef5af;
export const LOG_TEXT_INSN_COUNT_V20 = 2094319;
export const LOG_TEXT_UNDECODABLE_BYTES_V20 = 469;
export const LOG_V20_BATCHED_VAS = 4;
export const LOG_V20_EXACT_ZHL_MATCHES = 0;

/* cmp esi,eax ; je — FULL dword equality vs the SNAPSHOT head (read
   once at 0xa23203). Empty -> 1: zero callbacks, sentinel never fires. */
function broadcastWalkEmptyImpl(headSnapshot, firstNext) {
  return u32(firstNext) === u32(headSnapshot) ? 1 : 0;
}

/* cmp esi,[0xc37974] ; jne — FULL dword inequality vs the LIVE head,
   re-read from memory every iteration (never the snapshot). */
function broadcastWalkContinuesImpl(nodeNext, headLive) {
  return u32(nodeNext) !== u32(headLive) ? 1 : 0;
}

/* The ONLY termination: the empty gate, or a node whose next returns to
   the LIVE head. No cap, no NULL check, no callback result consulted. */
function broadcastWalkTerminatesImpl(headSnapshot, headLive, firstNext,
                                     nexts) {
  if (broadcastWalkEmptyImpl(headSnapshot, firstNext) !== 0) return 1;
  const chain = nexts || [];
  for (let i = 0; i < chain.length; ++i) {
    if (u32(chain[i]) === u32(headLive)) return 1;
  }
  return 0;
}

/* Fired callbacks = (index of the FIRST nexts entry == headLive) + 1;
   0 for the empty gate; 0 when non-terminating. */
function broadcastVisitedCountImpl(headSnapshot, headLive, firstNext,
                                   nexts) {
  if (broadcastWalkEmptyImpl(headSnapshot, firstNext) !== 0) return 0;
  const chain = nexts || [];
  for (let i = 0; i < chain.length; ++i) {
    if (u32(chain[i]) === u32(headLive)) return (i + 1) >>> 0;
  }
  return 0;
}

/* mov edi,[ebp+8]; push edi — the code reaches every callback as arg1
   UNMODIFIED: no mask, no byte narrowing. */
function broadcastCodePassthroughImpl(code) {
  return u32(code);
}

/* The 0xa23129 dynamic-site gate chain (function 0xa230b0). Byte-gate:
   flag_byte is narrowed with & 0xff. The broadcast code at this site is
   the DYNAMIC rank (esi), NOT the constant. */
function broadcastDynamicSiteFiresImpl(flagByte, rank, nodeRank,
                                       nodeIsSentinel, payloadResult) {
  if ((u32(flagByte) & 0xff) !== 0) return 0;
  if (u32(rank) < u32(nodeRank)) return 0; /* unsigned 32-bit compare */
  if (u32(nodeIsSentinel) !== 0) return 0;
  return u32(payloadResult) === 0 ? 1 : 0;
}

/* ---- laws ---- */
export function logBroadcastWalkEmpty(headSnapshot, firstNext) {
  return broadcastWalkEmptyImpl(headSnapshot, firstNext);
}
export function logBroadcastWalkContinues(nodeNext, headLive) {
  return broadcastWalkContinuesImpl(nodeNext, headLive);
}
export function logBroadcastWalkTerminates(headSnapshot, headLive,
                                           firstNext, nexts) {
  return broadcastWalkTerminatesImpl(headSnapshot, headLive, firstNext,
                                     nexts);
}
export function logBroadcastVisitedCount(headSnapshot, headLive,
                                         firstNext, nexts) {
  return broadcastVisitedCountImpl(headSnapshot, headLive, firstNext,
                                   nexts);
}
export function logBroadcastCodePassthrough(code) {
  return broadcastCodePassthroughImpl(code);
}
export function logBroadcastCallbackArgs() {
  return LOG_FAIL_BROADCAST_CALLBACK_ARGS;
}
export function logBroadcastCallbackStackBytes() {
  return LOG_FAIL_BROADCAST_CALLBACK_STACK_BYTES;
}
export function logBroadcastCallbackDispatchIsPlatform() {
  return 1;
}
export function logBroadcastFailCode() {
  return LOG_FAIL_BROADCAST_FAIL_CODE;
}
export function logBroadcastFailCodeMatchesInitMagic() {
  return LOG_FAIL_BROADCAST_FAIL_CODE === LOG_INIT_OBJECT_MAGIC ? 1 : 0;
}
export function logBroadcastConstantCodeSites() {
  return LOG_FAIL_BROADCAST_CONSTANT_CODE_SITES;
}
export function logBroadcastDynamicCodeSiteVa() {
  return LOG_FAIL_BROADCAST_DYNAMIC_CODE_SITE_VA;
}
export function logBroadcastDynamicCodeSourceVa() {
  return LOG_FAIL_BROADCAST_DYNAMIC_CODE_SOURCE_VA;
}
export function logBroadcastDynamicSiteFires(flagByte, rank, nodeRank,
                                             nodeIsSentinel,
                                             payloadResult) {
  return broadcastDynamicSiteFiresImpl(flagByte, rank, nodeRank,
                                       nodeIsSentinel, payloadResult);
}
export function logBroadcastSentinelTag() {
  return LOG_FAIL_BROADCAST_SENTINEL_TAG;
}
export function logBroadcastSentinelTagLowByte() {
  return (LOG_FAIL_BROADCAST_SENTINEL_TAG & 0xff) >>> 0;
}

/* ---- identities ---- */
export function logBroadcastBodyVa() { return LOG_VA_FAIL_BROADCAST; }
export function logBroadcastEndVa() { return LOG_FAIL_BROADCAST_END; }
export function logBroadcastBodyBytes() { return LOG_FAIL_BROADCAST_BODY_BYTES; }
export function logBroadcastInsnCount() { return LOG_FAIL_BROADCAST_INSN_COUNT; }
export function logBroadcastFirstRetVa() { return LOG_FAIL_BROADCAST_FIRST_RET_VA; }
export function logBroadcastRetArgs() { return LOG_FAIL_BROADCAST_RET_ARGS; }
export function logBroadcastRets() { return LOG_FAIL_BROADCAST_RETS; }
export function logBroadcastIndirectCalls() { return LOG_FAIL_BROADCAST_INDIRECT_CALLS; }
export function logBroadcastE8Calls() { return LOG_FAIL_BROADCAST_E8_CALLS; }
export function logBroadcastDirectCallsites() { return LOG_FAIL_BROADCAST_DIRECT_CALLSITES; }
export function logBroadcastInlinedCopies() { return LOG_FAIL_BROADCAST_INLINED_COPIES; }
export function logBroadcastRawOccurrences() { return LOG_FAIL_BROADCAST_RAW_OCCURRENCES; }
export function logBroadcastListHeadVa() { return LOG_FAIL_BROADCAST_LIST_HEAD_VA; }
export function logBroadcastNodeNextOffset() { return LOG_FAIL_BROADCAST_NODE_NEXT_OFFSET; }
export function logBroadcastNodePrevOffset() { return LOG_FAIL_BROADCAST_NODE_PREV_OFFSET; }
export function logBroadcastNodeFnOffset() { return LOG_FAIL_BROADCAST_NODE_FN_OFFSET; }
export function logBroadcastNodeCtxOffset() { return LOG_FAIL_BROADCAST_NODE_CTX_OFFSET; }
export function logBroadcastHeadWriters() { return LOG_FAIL_BROADCAST_HEAD_WRITERS; }
export function logBroadcastHeadZeroWriteVa() { return LOG_FAIL_BROADCAST_HEAD_ZERO_WRITE_VA; }
export function logBroadcastHeadSentinelWriteVa() { return LOG_FAIL_BROADCAST_HEAD_SENTINEL_WRITE_VA; }
export function logBroadcastHeadReaderSites() { return LOG_FAIL_BROADCAST_HEAD_READER_SITES; }
export function logBroadcastHeadLoadValue() { return LOG_FAIL_BROADCAST_HEAD_LOAD_VALUE; }
export function logBroadcastHeadWritesAfterInit() { return LOG_FAIL_BROADCAST_HEAD_WRITES_AFTER_INIT; }
export function logBroadcastSentinelSelfLinks() { return LOG_FAIL_BROADCAST_SENTINEL_SELF_LINKS; }
export function logBroadcastInitThunkVa() { return LOG_FAIL_BROADCAST_INIT_THUNK_VA; }
export function logBroadcastInitTableSlotVa() { return LOG_FAIL_BROADCAST_INIT_TABLE_SLOT_VA; }
export function logBroadcastInitSehVa() { return LOG_FAIL_BROADCAST_INIT_SEH_VA; }
export function logBroadcastObjectVa() { return LOG_FAIL_BROADCAST_OBJECT_VA; }
export function logBroadcastObjectVtableVa() { return LOG_FAIL_BROADCAST_OBJECT_VTABLE_VA; }
export function logBroadcastActiveListHeadVa() { return LOG_FAIL_BROADCAST_ACTIVE_LIST_HEAD_VA; }
export function logBroadcastSentinelASize() { return LOG_FAIL_BROADCAST_SENTINEL_A_SIZE; }
export function logBroadcastSentinelBSize() { return LOG_FAIL_BROADCAST_SENTINEL_B_SIZE; }
export function logBroadcastDtorVa() { return LOG_FAIL_BROADCAST_DTOR_VA; }
export function logBroadcastDtorBodyBytes() { return LOG_FAIL_BROADCAST_DTOR_BODY_BYTES; }
export function logBroadcastDtorFirstRetVa() { return LOG_FAIL_BROADCAST_DTOR_FIRST_RET_VA; }
export function logBroadcastDtorRetArgs() { return LOG_FAIL_BROADCAST_DTOR_RET_ARGS; }
export function logBroadcastDtorHeadDeleteSize() { return LOG_FAIL_BROADCAST_DTOR_HEAD_DELETE_SIZE; }
export function logBroadcastDtorClearsHead() { return LOG_FAIL_BROADCAST_DTOR_CLEARS_HEAD; }
export function logBroadcastDtorVtableSwap1() { return LOG_FAIL_BROADCAST_DTOR_VTABLE_SWAP_1; }
export function logBroadcastDtorVtableSwap2() { return LOG_FAIL_BROADCAST_DTOR_VTABLE_SWAP_2; }
export function logBroadcastAtexitVa() { return LOG_FAIL_BROADCAST_ATEXIT_VA; }
/* ======================= v21: the sink Close member 0x00a526f0 (vtbl+0x34) ======================= */

/* The sink-object Close member — PURE decisions land this unit (ABI
   20 -> 21). The body dispatches vtbl+0x2c (the fclose leaf 0xa526d0,
   typed-host) UNCONDITIONALLY and FIRST, stores state := 2 (FULL
   dword, ONE store, before the free gate), then frees the path cell
   via the shared tracked allocator (mode 1) iff the FULL 32-bit path
   cell is nonzero, NULLing it after the call. The FILE* presence gate
   lives in the dispatched leaf: FULL dword on cell +0xc, fclose
   [0xb1890c] + conditional null. NO vtable store in this body (delta
   vs the v11 dtor's 3-store chain). SEH 0xaf0a10, GS cookie
   0xbf93b4, the family frame shape (cookie popped, NOT checked).

   Census-close (same unit, no laws): 0xa25450 — the base-class Close
   twin (vtable 0xb833d8 slot +0x34), SAME SEH handler 0xaf0a10 + GS;
   identical structure MINUS the dispatch (no FILE* cell in the base
   class); covered by the Close gates, 0 direct refs, 1 slot. */

export const LOG_VA_SINK_CLOSE = 0x00a526f0;
export const LOG_SINK_CLOSE_END = 0x00a52754;       /* first int3 */
export const LOG_SINK_CLOSE_BODY_BYTES = 0x64;
export const LOG_SINK_CLOSE_INSN_COUNT = 32;
export const LOG_SINK_CLOSE_FIRST_RET_VA = 0x00a52753;
export const LOG_SINK_CLOSE_RET_ARGS = 0;           /* plain `ret` */
export const LOG_SINK_CLOSE_RETS = 1;
export const LOG_SINK_CLOSE_E8_CALLS = 1;           /* 0xa648b0 */
export const LOG_SINK_CLOSE_INDIRECT_CALLS = 1;     /* call [eax+0x2c] */
export const LOG_SINK_CLOSE_MEM_STORES = 5;         /* fs x2 + state + trylevel + path-null */
export const LOG_SINK_CLOSE_DISPATCH_VA = 0x00a52717;
export const LOG_SINK_CLOSE_DISPATCH_SLOT = 0x2c;   /* vtbl+0x2c */
export const LOG_SINK_CLOSE_FCLOSE_LEAF_VA = 0x00a526d0;
export const LOG_SINK_CLOSE_STATE_STORE_VA = 0x00a5271d;
export const LOG_SINK_CLOSE_STATE_VALUE = 2;        /* == SINK_STATE_NO_FILE */
export const LOG_SINK_CLOSE_STATE_STORES = 1;       /* ONE store (v11 dtor: 2) */
export const LOG_SINK_CLOSE_VTABLE_STORES = 0;      /* delta vs the dtor chain */
export const LOG_SINK_CLOSE_STATE_OFFSET = 4;
export const LOG_SINK_CLOSE_PATH_OFFSET = 8;
export const LOG_SINK_CLOSE_FILE_OFFSET = 0xc;      /* the leaf's FILE* cell */
export const LOG_SINK_CLOSE_FREE_GATE_VA = 0x00a52724;
export const LOG_SINK_CLOSE_FREE_BRANCH_VA = 0x00a52726;
export const LOG_SINK_CLOSE_FREE_CALL_VA = 0x00a52735;
export const LOG_SINK_CLOSE_FREE_MODE = 1;          /* cl=1 (guest free) */
export const LOG_SINK_CLOSE_PATH_NULL_VA = 0x00a5273d;
export const LOG_SINK_CLOSE_FREE_HELPER_VA = 0x00a648b0; /* == VA_SHARED_ALLOCATOR */
export const LOG_SINK_CLOSE_SEH_HANDLER = 0x00af0a10;
export const LOG_SINK_CLOSE_STATE_GETTER_VA = 0x00a25440; /* +0x30 slots */
export const LOG_SINK_CLOSE_SINK_SLOT_VA = 0x00ba51b8;   /* 0xba5184 + 0x34 */
export const LOG_SINK_CLOSE_SIBLING_SLOT_VA = 0x00b9e974; /* 0xb9e940 + 0x34 */
export const LOG_SINK_CLOSE_VTABLE_SLOTS = 2;
export const LOG_SINK_CLOSE_RAW_OCCURRENCES = 2;    /* the two slots only */
export const LOG_SINK_CLOSE_DIRECT_CALLSITES = 0;
export const LOG_SINK_CLOSE_DISPATCH_UNCONDITIONAL = 1;
export const LOG_SINK_CLOSE_FCLOSE_GATE_VA = 0x00a526d3; /* leaf: mov eax,[esi+0xc] */
export const LOG_SINK_CLOSE_FCLOSE_TEST_VA = 0x00a526d6; /* leaf: test eax,eax */
export const LOG_SINK_CLOSE_FCLOSE_BRANCH_VA = 0x00a526d8; /* je skip (no store) */
export const LOG_SINK_CLOSE_FCLOSE_CALL_VA = 0x00a526db; /* call [0xb1890c] */
export const LOG_SINK_CLOSE_FCLOSE_NULL_VA = 0x00a526e4; /* mov [esi+0xc],0 */
export const LOG_TEXT_INSN_COUNT_V21 = 2094319;
export const LOG_TEXT_UNDECODABLE_BYTES_V21 = 469;
export const LOG_V21_BATCHED_VAS = 6;
export const LOG_V21_EXACT_ZHL_MATCHES = 0;

/* call [eax+0x2c] at 0xa52717 — the dispatch is UNCONDITIONAL: it is
   the FIRST action, with NO file/path/state read gating it. The FILE*
   presence gate lives in the dispatched leaf (typed-host). */
function sinkCloseDispatchFiresImpl() {
  return 1;
}

/* Leaf gate on the FULL 32-bit FILE* cell (+0xc): 0x100 / 0x1ff /
   0xffffffff close; 0 skips. A low-byte reading misfires on 0x100. */
function sinkCloseFileGateImpl(filePtr) {
  return u32(filePtr) !== 0 ? 1 : 0;
}

/* mov [esi+0xc],0 — the leaf NULLs the FILE* cell ONLY on the fclose
   arm; the skip arm leaves the cell untouched. */
function sinkCloseFileAfterImpl(fileBefore, fcloseFired) {
  return u32(fcloseFired) !== 0 ? 0 : u32(fileBefore);
}

/* mov [esi+4],2 — state := 2 UNCONDITIONAL, ONE store, positioned
   after the dispatch and before the free gate: BOTH arms end with
   state 2. stateBefore is a parameter so a mutant that keeps it on
   the skip arm is visible. */
function sinkCloseStateAfterImpl(stateBefore) {
  return LOG_SINK_CLOSE_STATE_VALUE;
}

/* test edx,edx ; je — the FREE GATE on the FULL 32-bit path cell (+8):
   0x100 / 0x1ff / 0xffffffff fire; 0 skips. */
function sinkCloseFreeGateImpl(pathPtr) {
  return u32(pathPtr) !== 0 ? 1 : 0;
}

/* mov [esi+8],0 — the path cell is NULLed ONLY on the free arm, AFTER
   the 0xa648b0 call; the skip arm leaves the cell untouched. */
function sinkClosePathAfterImpl(pathBefore, freeFired) {
  return u32(freeFired) !== 0 ? 0 : u32(pathBefore);
}

export function logSinkCloseDispatchFires() { return sinkCloseDispatchFiresImpl(); }
export function logSinkCloseDispatchVa() { return LOG_SINK_CLOSE_DISPATCH_VA; }
export function logSinkCloseDispatchSlot() { return LOG_SINK_CLOSE_DISPATCH_SLOT; }
export function logSinkCloseFcloseLeafVa() { return LOG_SINK_CLOSE_FCLOSE_LEAF_VA; }
export function logSinkCloseFileGate(filePtr) { return sinkCloseFileGateImpl(filePtr); }
export function logSinkCloseFileAfter(fileBefore, fcloseFired) { return sinkCloseFileAfterImpl(fileBefore, fcloseFired); }
export function logSinkCloseStateAfter(stateBefore) { return sinkCloseStateAfterImpl(stateBefore); }
export function logSinkCloseStateValue() { return LOG_SINK_CLOSE_STATE_VALUE; }
export function logSinkCloseStateStoreCount() { return LOG_SINK_CLOSE_STATE_STORES; }
export function logSinkCloseStateStoreVa() { return LOG_SINK_CLOSE_STATE_STORE_VA; }
export function logSinkCloseStateGetterVa() { return LOG_SINK_CLOSE_STATE_GETTER_VA; }
export function logSinkCloseFreeGate(pathPtr) { return sinkCloseFreeGateImpl(pathPtr); }
export function logSinkCloseFreeBranchVa() { return LOG_SINK_CLOSE_FREE_BRANCH_VA; }
export function logSinkCloseFreeCallVa() { return LOG_SINK_CLOSE_FREE_CALL_VA; }
export function logSinkCloseFreeMode() { return LOG_SINK_CLOSE_FREE_MODE; }
export function logSinkCloseFreeHelperVa() { return LOG_SINK_CLOSE_FREE_HELPER_VA; }
export function logSinkClosePathNullVa() { return LOG_SINK_CLOSE_PATH_NULL_VA; }
export function logSinkClosePathAfter(pathBefore, freeFired) { return sinkClosePathAfterImpl(pathBefore, freeFired); }
export function logSinkCloseFileOffset() { return LOG_SINK_CLOSE_FILE_OFFSET; }
export function logSinkClosePathOffset() { return LOG_SINK_CLOSE_PATH_OFFSET; }
export function logSinkCloseStateOffset() { return LOG_SINK_CLOSE_STATE_OFFSET; }
export function logSinkCloseVtableStoreCount() { return LOG_SINK_CLOSE_VTABLE_STORES; }
export function logSinkCloseBodyVa() { return LOG_VA_SINK_CLOSE; }
export function logSinkCloseEndVa() { return LOG_SINK_CLOSE_END; }
export function logSinkCloseBodyBytes() { return LOG_SINK_CLOSE_BODY_BYTES; }
export function logSinkCloseInsnCount() { return LOG_SINK_CLOSE_INSN_COUNT; }
export function logSinkCloseFirstRetVa() { return LOG_SINK_CLOSE_FIRST_RET_VA; }
export function logSinkCloseRetArgs() { return LOG_SINK_CLOSE_RET_ARGS; }
export function logSinkCloseRets() { return LOG_SINK_CLOSE_RETS; }
export function logSinkCloseE8Calls() { return LOG_SINK_CLOSE_E8_CALLS; }
export function logSinkCloseIndirectCalls() { return LOG_SINK_CLOSE_INDIRECT_CALLS; }
export function logSinkCloseMemStores() { return LOG_SINK_CLOSE_MEM_STORES; }
export function logSinkCloseSehHandler() { return LOG_SINK_CLOSE_SEH_HANDLER; }
export function logSinkCloseSinkSlotVa() { return LOG_SINK_CLOSE_SINK_SLOT_VA; }
export function logSinkCloseSiblingSlotVa() { return LOG_SINK_CLOSE_SIBLING_SLOT_VA; }
export function logSinkCloseVtableSlots() { return LOG_SINK_CLOSE_VTABLE_SLOTS; }
export function logSinkCloseRawOccurrences() { return LOG_SINK_CLOSE_RAW_OCCURRENCES; }
export function logSinkCloseDirectCallsites() { return LOG_SINK_CLOSE_DIRECT_CALLSITES; }
export function logSinkCloseDispatchUnconditional() { return LOG_SINK_CLOSE_DISPATCH_UNCONDITIONAL; }
export function logSinkCloseFcloseGateVa() { return LOG_SINK_CLOSE_FCLOSE_GATE_VA; }
export function logSinkCloseFcloseTestVa() { return LOG_SINK_CLOSE_FCLOSE_TEST_VA; }
export function logSinkCloseFcloseBranchVa() { return LOG_SINK_CLOSE_FCLOSE_BRANCH_VA; }
export function logSinkCloseFcloseCallVa() { return LOG_SINK_CLOSE_FCLOSE_CALL_VA; }
export function logSinkCloseFcloseNullVa() { return LOG_SINK_CLOSE_FCLOSE_NULL_VA; }

/* ======================= v22: the state!=2 getter 0x00a25440 (vtbl+0x30) ======================= */

/* The state!=2 getter — PURE decisions land this unit (ABI 21 -> 22).
   Body (3 insns, 8 bytes, plain ret): `cmp dword ptr [ecx+4], 2 ;
   setne al ; ret` — the FULL-dword read of the state cell at +4 is the
   byte-gate law (0x102/0x302/0xff02 compare as full dwords; a low-byte
   read misfires), the observable is the 0/1 boolean (state != 2) with
   2 == the Close law's SINK_STATE_NO_FILE. No SEH/GS, no store, no
   call. Reach: 0 direct callers; 3 devirt-cmp sites (0x92be28/0x92c008/
   0x92c1e8) inline the identical body; carriers are the +0x30 slots of
   0xb833d8/0xba5184/0xb9e940 plus the 13-slot function table 0xb65724
   (0xb9c15c corrected: 10-slot table, string data at +0x30). */

export const LOG_VA_STATE_GETTER = 0x00a25440;
export const LOG_STATE_GETTER_END = 0x00a25448;         /* first int3 */
export const LOG_STATE_GETTER_BODY_BYTES = 0x08;
export const LOG_STATE_GETTER_INSN_COUNT = 3;
export const LOG_STATE_GETTER_FIRST_RET_VA = 0x00a25447;
export const LOG_STATE_GETTER_RET_ARGS = 0;             /* plain `ret` */
export const LOG_STATE_GETTER_RETS = 1;
export const LOG_STATE_GETTER_E8_CALLS = 0;
export const LOG_STATE_GETTER_INDIRECT_CALLS = 0;
export const LOG_STATE_GETTER_MEM_STORES = 0;           /* no writes */
export const LOG_STATE_GETTER_STATE_OFFSET = 4;
export const LOG_STATE_GETTER_READ_WIDTH = 4;           /* FULL-dword cmp */
export const LOG_STATE_GETTER_COMPARE_VALUE = 2;        /* == NO_FILE */
export const LOG_STATE_GETTER_VTABLE_SLOTS = 3; /* 0xb83408/0xba51b4/0xb9e970 */
export const LOG_STATE_GETTER_EXTRA_SLOT_VA = 0x00b65754; /* 0xb65724+0x30 */
export const LOG_STATE_GETTER_RAW_OCCURRENCES = 7;      /* .rdata 4 + .text 3 */
export const LOG_STATE_GETTER_DIRECT_CALLSITES = 0;
export const LOG_STATE_GETTER_INLINED_COPIES = 3;       /* devirt-cmp sites */
export const LOG_STATE_GETTER_DEVIRT_CMP_1 = 0x0092be28;
export const LOG_STATE_GETTER_DEVIRT_CMP_2 = 0x0092c008;
export const LOG_STATE_GETTER_DEVIRT_CMP_3 = 0x0092c1e8;
export const LOG_STATE_GETTER_SLOT_DTOR_BASE_VA = 0x00b83408; /* 0xb833d8+0x30 */
export const LOG_STATE_GETTER_SLOT_SINK_VA = 0x00ba51b4;      /* 0xba5184+0x30 */
export const LOG_STATE_GETTER_SLOT_SIBLING_VA = 0x00b9e970;   /* 0xb9e940+0x30 */
export const LOG_TEXT_INSN_COUNT_V22 = 2094319;
export const LOG_TEXT_UNDECODABLE_BYTES_V22 = 469;

/* cmp dword ptr [ecx+4], 2 ; setne al ; ret — (state != 2) ? 1 : 0 on
   the FULL 32-bit state cell (missing high bytes would misfire). */
function stateGetterNeqImpl(state) {
  return u32(state) !== LOG_STATE_GETTER_COMPARE_VALUE ? 1 : 0;
}

export function logStateGetterNeq(state) { return stateGetterNeqImpl(state); }
export function logStateGetterBodyVa() { return LOG_VA_STATE_GETTER; }
export function logStateGetterEndVa() { return LOG_STATE_GETTER_END; }
export function logStateGetterBodyBytes() { return LOG_STATE_GETTER_BODY_BYTES; }
export function logStateGetterInsnCount() { return LOG_STATE_GETTER_INSN_COUNT; }
export function logStateGetterFirstRetVa() { return LOG_STATE_GETTER_FIRST_RET_VA; }
export function logStateGetterRetArgs() { return LOG_STATE_GETTER_RET_ARGS; }
export function logStateGetterRets() { return LOG_STATE_GETTER_RETS; }
export function logStateGetterE8Calls() { return LOG_STATE_GETTER_E8_CALLS; }
export function logStateGetterIndirectCalls() { return LOG_STATE_GETTER_INDIRECT_CALLS; }
export function logStateGetterMemStores() { return LOG_STATE_GETTER_MEM_STORES; }
export function logStateGetterStateOffset() { return LOG_STATE_GETTER_STATE_OFFSET; }
export function logStateGetterReadWidth() { return LOG_STATE_GETTER_READ_WIDTH; }
export function logStateGetterCompareValue() { return LOG_STATE_GETTER_COMPARE_VALUE; }
export function logStateGetterVtableSlots() { return LOG_STATE_GETTER_VTABLE_SLOTS; }
export function logStateGetterExtraSlotVa() { return LOG_STATE_GETTER_EXTRA_SLOT_VA; }
export function logStateGetterRawOccurrences() { return LOG_STATE_GETTER_RAW_OCCURRENCES; }
export function logStateGetterDirectCallsites() { return LOG_STATE_GETTER_DIRECT_CALLSITES; }
export function logStateGetterInlinedCopies() { return LOG_STATE_GETTER_INLINED_COPIES; }
export function logStateGetterDevirtCmp1() { return LOG_STATE_GETTER_DEVIRT_CMP_1; }
export function logStateGetterDevirtCmp2() { return LOG_STATE_GETTER_DEVIRT_CMP_2; }
export function logStateGetterDevirtCmp3() { return LOG_STATE_GETTER_DEVIRT_CMP_3; }
export function logStateGetterSlotDtorBaseVa() { return LOG_STATE_GETTER_SLOT_DTOR_BASE_VA; }
export function logStateGetterSlotSinkVa() { return LOG_STATE_GETTER_SLOT_SINK_VA; }
export function logStateGetterSlotSiblingVa() { return LOG_STATE_GETTER_SLOT_SIBLING_VA; }

/* ======================= v25: base-class tables 0xb83418 / 0xb833d8 ======================= */

/* L1 — 0xa649b0: `or dword ptr [ecx+4],1 ; mov al,1 ; ret`. The stored
   cell is flags | 1 (FULL-dword op; the width itself is an ENCODING law
   because a byte-or writes the same low byte). */
function baseFlagsAfterSet1Impl(flags) {
  return u32(flags) | 1;
}
export function logBaseFlagsAfterSet1(flags) { return u32(baseFlagsAfterSet1Impl(flags)); }
export function logBaseFlagsSet1ReturnsOne() { return 1; }
export function logBaseFlagsSet1BodyVa() { return LOG_VA_BASE_FLAGS_SET1; }
export function logBaseFlagsSet1EndVa() { return LOG_BASE_FLAGS_SET1_END; }
export function logBaseFlagsSet1BodyBytes() { return LOG_BASE_FLAGS_SET1_BODY_BYTES; }
export function logBaseFlagsSet1InsnCount() { return LOG_BASE_FLAGS_SET1_INSN_COUNT; }
export function logBaseFlagsSet1FirstRetVa() { return LOG_BASE_FLAGS_SET1_FIRST_RET_VA; }
export function logBaseFlagsSet1RetArgs() { return LOG_BASE_FLAGS_SET1_RET_ARGS; }
export function logBaseFlagsSet1Rets() { return LOG_BASE_FLAGS_SET1_RETS; }
export function logBaseFlagsSet1E8Calls() { return LOG_BASE_FLAGS_SET1_E8_CALLS; }
export function logBaseFlagsSet1IndirectCalls() { return LOG_BASE_FLAGS_SET1_INDIRECT_CALLS; }
export function logBaseFlagsSet1MemStores() { return LOG_BASE_FLAGS_SET1_MEM_STORES; }
export function logBaseFlagsSet1StateOffset() { return LOG_BASE_FLAGS_SET1_STATE_OFFSET; }
export function logBaseFlagsSet1ReadWidth() { return LOG_BASE_FLAGS_SET1_READ_WIDTH; }
export function logBaseFlagsSet1VtableSlots() { return LOG_BASE_FLAGS_SET1_VTABLE_SLOTS; }
export function logBaseFlagsSet1Slot1Va() { return LOG_BASE_FLAGS_SET1_SLOT_1_VA; }
export function logBaseFlagsSet1Slot2Va() { return LOG_BASE_FLAGS_SET1_SLOT_2_VA; }
export function logBaseFlagsSet1Slot3Va() { return LOG_BASE_FLAGS_SET1_SLOT_3_VA; }
export function logBaseFlagsSet1Slot4Va() { return LOG_BASE_FLAGS_SET1_SLOT_4_VA; }
export function logBaseFlagsSet1Slot5Va() { return LOG_BASE_FLAGS_SET1_SLOT_5_VA; }
export function logBaseFlagsSet1RawOccurrences() { return LOG_BASE_FLAGS_SET1_RAW_OCCURRENCES; }
export function logBaseFlagsSet1DirectCallsites() { return LOG_BASE_FLAGS_SET1_DIRECT_CALLSITES; }
export function logBaseFlagsSet1SiblingClearVa() { return LOG_BASE_FLAGS_SET1_SIBLING_CLEAR_VA; }

/* L7 — 0xa649c0: `and dword ptr [ecx+4],0xfffffffe ; ret` — bit 0
   of the flags cell cleared, all other bits preserved, no return
   value, unconditional. FULL-dword encoding law. */
function baseFlagsAfterClear1Impl(flags) {
  return u32(flags) & 0xfffffffe;
}
export function logBaseFlagsAfterClear1(flags) { return u32(baseFlagsAfterClear1Impl(flags)); }
export function logBaseFlagsClear1Unconditional() { return 1; }
export function logBaseFlagsClear1BodyVa() { return LOG_VA_BASE_FLAGS_CLEAR1; }
export function logBaseFlagsClear1EndVa() { return LOG_BASE_FLAGS_CLEAR1_END; }
export function logBaseFlagsClear1BodyBytes() { return LOG_BASE_FLAGS_CLEAR1_BODY_BYTES; }
export function logBaseFlagsClear1InsnCount() { return LOG_BASE_FLAGS_CLEAR1_INSN_COUNT; }
export function logBaseFlagsClear1FirstRetVa() { return LOG_BASE_FLAGS_CLEAR1_FIRST_RET_VA; }
export function logBaseFlagsClear1RetArgs() { return LOG_BASE_FLAGS_CLEAR1_RET_ARGS; }
export function logBaseFlagsClear1Rets() { return LOG_BASE_FLAGS_CLEAR1_RETS; }
export function logBaseFlagsClear1E8Calls() { return LOG_BASE_FLAGS_CLEAR1_E8_CALLS; }
export function logBaseFlagsClear1IndirectCalls() { return LOG_BASE_FLAGS_CLEAR1_INDIRECT_CALLS; }
export function logBaseFlagsClear1MemStores() { return LOG_BASE_FLAGS_CLEAR1_MEM_STORES; }
export function logBaseFlagsClear1StateOffset() { return LOG_BASE_FLAGS_CLEAR1_STATE_OFFSET; }
export function logBaseFlagsClear1ClearMask() { return LOG_BASE_FLAGS_CLEAR1_CLEAR_MASK; }
export function logBaseFlagsClear1ByteMask() { return LOG_BASE_FLAGS_CLEAR1_BYTE_MASK; }
export function logBaseFlagsClear1ReadWidth() { return LOG_BASE_FLAGS_CLEAR1_READ_WIDTH; }
export function logBaseFlagsClear1VtableSlots() { return LOG_BASE_FLAGS_CLEAR1_VTABLE_SLOTS; }
export function logBaseFlagsClear1Slot1Va() { return LOG_BASE_FLAGS_CLEAR1_SLOT_1_VA; }
export function logBaseFlagsClear1Slot2Va() { return LOG_BASE_FLAGS_CLEAR1_SLOT_2_VA; }
export function logBaseFlagsClear1Slot3Va() { return LOG_BASE_FLAGS_CLEAR1_SLOT_3_VA; }
export function logBaseFlagsClear1Slot4Va() { return LOG_BASE_FLAGS_CLEAR1_SLOT_4_VA; }
export function logBaseFlagsClear1Slot5Va() { return LOG_BASE_FLAGS_CLEAR1_SLOT_5_VA; }
export function logBaseFlagsClear1Slot6Va() { return LOG_BASE_FLAGS_CLEAR1_SLOT_6_VA; }
export function logBaseFlagsClear1RawOccurrences() { return LOG_BASE_FLAGS_CLEAR1_RAW_OCCURRENCES; }
export function logBaseFlagsClear1DirectCallsites() { return LOG_BASE_FLAGS_CLEAR1_DIRECT_CALLSITES; }
export function logBaseFlagsClear1SiblingSetVa() { return LOG_BASE_FLAGS_CLEAR1_SIBLING_SET_VA; }
export function logBaseFlagsSet1ToClear1PadBytes() { return LOG_BASE_FLAGS_SET1_TO_CLEAR1_PAD_BYTES; }

/* L2 — 0xa24ea0: flush the LISTENER (vtbl+0x20 vcall — HOST) iff the
   FULL-dword listener ptr is nonzero, then clear bit 0 UNCONDITIONALLY
   (the clear also runs on the null-skip arm). */
function baseFlushNeededImpl(listenerPtr) {
  return listenerPtr !== 0 ? 1 : 0;
}
function baseFlushClearsBit0Impl(flags) {
  return u32(flags) & 0xfffffffe;
}
export function logBaseFlushNeeded(listenerPtr) { return baseFlushNeededImpl(listenerPtr >>> 0); }
export function logBaseFlushClearsBit0(flags) { return u32(baseFlushClearsBit0Impl(flags)); }
export function logBaseFlushClearUnconditional() { return 1; }
export function logBaseFlushClearBodyVa() { return LOG_VA_BASE_FLUSH_CLEAR; }
export function logBaseFlushClearEndVa() { return LOG_BASE_FLUSH_CLEAR_END; }
export function logBaseFlushClearBodyBytes() { return LOG_BASE_FLUSH_CLEAR_BODY_BYTES; }
export function logBaseFlushClearInsnCount() { return LOG_BASE_FLUSH_CLEAR_INSN_COUNT; }
export function logBaseFlushClearFirstRetVa() { return LOG_BASE_FLUSH_CLEAR_FIRST_RET_VA; }
export function logBaseFlushClearRetArgs() { return LOG_BASE_FLUSH_CLEAR_RET_ARGS; }
export function logBaseFlushClearRets() { return LOG_BASE_FLUSH_CLEAR_RETS; }
export function logBaseFlushClearE8Calls() { return LOG_BASE_FLUSH_CLEAR_E8_CALLS; }
export function logBaseFlushClearIndirectCalls() { return LOG_BASE_FLUSH_CLEAR_INDIRECT_CALLS; }
export function logBaseFlushClearMemStores() { return LOG_BASE_FLUSH_CLEAR_MEM_STORES; }
export function logBaseFlushClearListenerGlobalVa() { return LOG_BASE_FLUSH_CLEAR_LISTENER_GLOBAL_VA; }
export function logBaseFlushClearFlushSlot() { return LOG_BASE_FLUSH_CLEAR_FLUSH_SLOT; }
export function logBaseFlushClearClearMask() { return LOG_BASE_FLUSH_CLEAR_CLEAR_MASK; }
export function logBaseFlushClearReadWidth() { return LOG_BASE_FLUSH_CLEAR_READ_WIDTH; }
export function logBaseFlushClearFlushCallVa() { return LOG_BASE_FLUSH_CLEAR_FLUSH_CALL_VA; }
export function logBaseFlushClearClearVa() { return LOG_BASE_FLUSH_CLEAR_CLEAR_VA; }
export function logBaseFlushClearRawOccurrences() { return LOG_BASE_FLUSH_CLEAR_RAW_OCCURRENCES; }
export function logBaseFlushClearDirectCallsites() { return LOG_BASE_FLUSH_CLEAR_DIRECT_CALLSITES; }

/* L3/L4 — the base-class open twins. state := N (ONE FULL-dword store,
   BEFORE the combine call); path := OPEN_COMBINE(path, NULL, 0, 0) — the
   v19 COPY_PATH arm; return 1. open1's second stack arg is dead. */
function baseOpen0StateAfterImpl(stateBefore) {
  void stateBefore;
  return LOG_BASE_OPEN0_STATE_VALUE;
}
function baseOpen1StateAfterImpl(stateBefore) {
  void stateBefore;
  return LOG_BASE_OPEN1_STATE_VALUE;
}
export function logBaseOpen0StateAfter(stateBefore) { return u32(baseOpen0StateAfterImpl(stateBefore >>> 0)); }
export function logBaseOpen1StateAfter(stateBefore) { return u32(baseOpen1StateAfterImpl(stateBefore >>> 0)); }
export function logBaseOpenCombineBaseNull() { return LOG_BASE_OPEN_COMBINE_BASE_NULL; }
export function logBaseOpenCombineFlagsZero() { return LOG_BASE_OPEN_COMBINE_FLAGS_ZERO; }
export function logBaseOpenCombineMode() { return LOG_BASE_OPEN_COMBINE_MODE; }
export function logBaseOpenReturnsOne() { return 1; }
export function logBaseOpen0RetArgs() { return LOG_BASE_OPEN0_RET_ARGS; }
export function logBaseOpen1RetArgs() { return LOG_BASE_OPEN1_RET_ARGS; }
export function logBaseOpen1Arg2Dead() { return LOG_BASE_OPEN1_ARG2_DEAD; }
export function logBaseOpen0CombineCallVa() { return LOG_BASE_OPEN0_COMBINE_CALL_VA; }
export function logBaseOpen1CombineCallVa() { return LOG_BASE_OPEN1_COMBINE_CALL_VA; }
export function logBaseOpen0CleanupVa() { return LOG_BASE_OPEN0_CLEANUP_VA; }
export function logBaseOpen1CleanupVa() { return LOG_BASE_OPEN1_CLEANUP_VA; }
export function logBaseOpen0StateStoreVa() { return LOG_BASE_OPEN0_STATE_STORE_VA; }
export function logBaseOpen1StateStoreVa() { return LOG_BASE_OPEN1_STATE_STORE_VA; }
export function logBaseOpen0BodyVa() { return LOG_VA_BASE_OPEN0; }
export function logBaseOpen0EndVa() { return LOG_BASE_OPEN0_END; }
export function logBaseOpen0BodyBytes() { return LOG_BASE_OPEN0_BODY_BYTES; }
export function logBaseOpen0InsnCount() { return LOG_BASE_OPEN0_INSN_COUNT; }
export function logBaseOpen0FirstRetVa() { return LOG_BASE_OPEN0_FIRST_RET_VA; }
export function logBaseOpen0Rets() { return LOG_BASE_OPEN0_RETS; }
export function logBaseOpen0E8Calls() { return LOG_BASE_OPEN0_E8_CALLS; }
export function logBaseOpen0IndirectCalls() { return LOG_BASE_OPEN0_INDIRECT_CALLS; }
export function logBaseOpen0MemStores() { return LOG_BASE_OPEN0_MEM_STORES; }
export function logBaseOpen0StateValue() { return LOG_BASE_OPEN0_STATE_VALUE; }
export function logBaseOpen0RawOccurrences() { return LOG_BASE_OPEN0_RAW_OCCURRENCES; }
export function logBaseOpen0DirectCallsites() { return LOG_BASE_OPEN0_DIRECT_CALLSITES; }
export function logBaseOpen1BodyVa() { return LOG_VA_BASE_OPEN1; }
export function logBaseOpen1EndVa() { return LOG_BASE_OPEN1_END; }
export function logBaseOpen1BodyBytes() { return LOG_BASE_OPEN1_BODY_BYTES; }
export function logBaseOpen1InsnCount() { return LOG_BASE_OPEN1_INSN_COUNT; }
export function logBaseOpen1FirstRetVa() { return LOG_BASE_OPEN1_FIRST_RET_VA; }
export function logBaseOpen1Rets() { return LOG_BASE_OPEN1_RETS; }
export function logBaseOpen1E8Calls() { return LOG_BASE_OPEN1_E8_CALLS; }
export function logBaseOpen1IndirectCalls() { return LOG_BASE_OPEN1_INDIRECT_CALLS; }
export function logBaseOpen1MemStores() { return LOG_BASE_OPEN1_MEM_STORES; }
export function logBaseOpen1StateValue() { return LOG_BASE_OPEN1_STATE_VALUE; }
export function logBaseOpen1RawOccurrences() { return LOG_BASE_OPEN1_RAW_OCCURRENCES; }
export function logBaseOpen1DirectCallsites() { return LOG_BASE_OPEN1_DIRECT_CALLSITES; }

/* v25 closure evidence pins. */
export function logBaseDtorWrapperVa() { return LOG_VA_BASE_DTOR_WRAPPER; }
export function logBaseDtorWrapperEndVa() { return LOG_BASE_DTOR_WRAPPER_END; }
export function logBaseDtorWrapperBodyBytes() { return LOG_BASE_DTOR_WRAPPER_BODY_BYTES; }
export function logBaseDtorWrapperSeh() { return LOG_BASE_DTOR_WRAPPER_SEH; }
export function logBaseAccessLeafDirectCallsites() { return LOG_BASE_ACCESS_LEAF_DIRECT_CALLSITES; }
export function logBaseAccessLeafCallsiteVa() { return LOG_BASE_ACCESS_LEAF_CALLSITE_VA; }
export function logBaseGetter18EndVa() { return LOG_BASE_GETTER_18_END; }
export function logTextInsnCountV25() { return LOG_TEXT_INSN_COUNT_V25; }
export function logTextUndecodableBytesV25() { return LOG_TEXT_UNDECODABLE_BYTES_V25; }

/* ======================= v23: engine-binding census final + cluster closure ======================= */

/* ZERO laws this unit (ABI stays 22): the 0x43eec0 path getter
   (`mov eax,[ecx+8]; ret`, 2 insns, 4 bytes, plain ret) is a typed-host
   LEASE row — v23: NO family owns the engine binding (22 direct calls +
   2 registration pushes 0x86b72b/0x86c361 in the 0x86b7/0x86c3 register
   megablocks; carriers = the +0x38 slots of 0xb833d8/0xba5184/0xb9e940
   plus the steamworks-shim 0xb6575c; the lua_engine property table
   records sibling rows of the same megablock only; v24 IDENTIFIED the
   owner: the megablock IS LuaEngine::RegisterClasses 0x866960..0x86e4c9
   — lease transfer PROPOSED, log keeps the host pins). The sink/sibling
   15-slot vtable maps 0xba5184/0xb9e940 are identical except
   +0x00/+0x1c/+0x20 (12 shared slots); every reachable body is
   classified (PURE laws landed or HOST evidence). */

export const LOG_VA_PATH_GETTER = 0x0043eec0;
export const LOG_PATH_GETTER_END = 0x0043eec4;         /* first int3 */
export const LOG_PATH_GETTER_BODY_BYTES = 0x04;
export const LOG_PATH_GETTER_INSN_COUNT = 2;
export const LOG_PATH_GETTER_FIRST_RET_VA = 0x0043eec3;
export const LOG_PATH_GETTER_RET_ARGS = 0;             /* plain `ret` */
export const LOG_PATH_GETTER_RETS = 1;
export const LOG_PATH_GETTER_E8_CALLS = 0;
export const LOG_PATH_GETTER_INDIRECT_CALLS = 0;
export const LOG_PATH_GETTER_MEM_STORES = 0;
export const LOG_PATH_GETTER_PATH_OFFSET = 8;
export const LOG_PATH_GETTER_DIRECT_CALLSITES = 22;    /* engine callsites */
export const LOG_PATH_GETTER_REGISTRATION_PUSHES = 2;
export const LOG_PATH_GETTER_REG_PUSH_VA_1 = 0x0086b72b;
export const LOG_PATH_GETTER_REG_PUSH_VA_2 = 0x0086c361;
export const LOG_PATH_GETTER_RAW_OCCURRENCES = 6;      /* .rdata 4 + .text 2 */
export const LOG_PATH_GETTER_VTABLE_SLOTS = 4;         /* +0x38 x4 carriers */
export const LOG_PATH_GETTER_SLOT_DTOR_BASE_VA = 0x00b83410; /* 0xb833d8+0x38 */
export const LOG_PATH_GETTER_SLOT_SINK_VA = 0x00ba51bc;      /* 0xba5184+0x38 */
export const LOG_PATH_GETTER_SLOT_SIBLING_VA = 0x00b9e978;   /* 0xb9e940+0x38 */
export const LOG_PATH_GETTER_SLOT_EXTRA_VA = 0x00b6575c;     /* 0xb65724+0x38 */
/* LOG_SINK_VTABLE_VA / LOG_SIBLING_VTABLE_VA already exported (v4/v9); */
/* the cluster pins below are the +0x00/+0x1c/+0x20 slot deltas. */
export const LOG_SINK_DTOR_WRAPPER_VA = 0x00a83fa0;    /* +0x00 (v15) */
export const LOG_SIBLING_DTOR_WRAPPER_VA = 0x00a523e0; /* +0x00 (v16) */
export const LOG_SINK_WRITE_VA = 0x00a83fd0;           /* +0x1c (v6) */
export const LOG_SIBLING_WRITE_VA = 0x00a52850;        /* +0x1c (v7) */
export const LOG_SINK_FLUSH_VA = 0x0040c200;           /* +0x20 (nop, v6) */
export const LOG_SIBLING_FLUSH_VA = 0x00a52880;        /* +0x20 (v13) */
export const LOG_SINK_SIBLING_SHARED_SLOTS = 12;       /* 15 - 3 differing */
export const LOG_TEXT_INSN_COUNT_V23 = 2094319;
export const LOG_TEXT_UNDECODABLE_BYTES_V23 = 469;

/* ======================= v24: engine owner IDENTIFIED + lease transfer PROPOSED ======================= */

/* ZERO laws this unit (ABI stays 22): the two 0x43eec0 registration rows
   (0x86b72b "GetVariant" binder 0x88ab60 @call 0x86b737; 0x86c361
   "GetType" binder 0x88fd10 @call 0x86c36d) live inside the lua family's
   OWN body LuaEngine::RegisterClasses (0x866960..0x86e4c9, 0x7b6a bytes)
   — the lua property-family census spans the whole body (callsite
   0x866c86..0x86da12) and the un-recorded binder bodies sit in the lua
   band 0x875230..0x8952b0. The Lua family owns the megablock pattern;
   v24 PROPOSES the lease transfer: the log family keeps the host pins
   (this block + v23 block), the lua family gains the registration rows. */

export const LOG_PATH_GETTER_ROW1_CALL_VA = 0x0086b737;   /* call 0x88ab60 */
export const LOG_PATH_GETTER_ROW1_BINDER_VA = 0x0088ab60; /* single-fn binder */
export const LOG_PATH_GETTER_ROW1_NAME_VA = 0x00b730ec;   /* "GetVariant" */
export const LOG_PATH_GETTER_ROW2_CALL_VA = 0x0086c36d;   /* call 0x88fd10 */
export const LOG_PATH_GETTER_ROW2_BINDER_VA = 0x0088fd10; /* single-fn binder */
export const LOG_PATH_GETTER_ROW2_NAME_VA = 0x00b7306c;   /* "GetType" */
export const LOG_ENGINE_REGISTER_CLASSES_VA = 0x00866960; /* lua owner body */
export const LOG_ENGINE_REGISTER_CLASSES_END_VA = 0x0086e4c9; /* ret */
export const LOG_ENGINE_REGISTER_CLASSES_BODY_BYTES = 0x7b6a;
export const LOG_MEGABLOCK_A_GAP_ROWS = 6;          /* 0x86b704..0x86b76f bin */
export const LOG_MEGABLOCK_A_GAP_FIRST_CALL_VA = 0x0086b704;
export const LOG_MEGABLOCK_A_GAP_LAST_CALL_VA = 0x0086b759;

/* ======================= v25: base-class table closure (ABI 22 -> 23) ======================= */

/* FOUR laws land this unit (the only ABI bump since v21/v22): the base
   tables of the sink object graph were dumped (v22) but never closed —
   0xb83418 (12 live slots +0x00..+0x2c) and 0xb833d8 (15-slot
   dtor-phase table). Every member body is decoded this unit
   (census-base-tables.py) and the four complete small helpers land:
   flags-set1 0xa649b0 (`or dword [ecx+4],1 ; mov al,1 ; ret`),
   flush-clear 0xa24ea0 (listener vtbl+0x20 vcall THEN unconditional
   `and dword [esi+4],0xfffffffe`), open twins 0xa253e0 (state := 0) /
   0xa25410 (state := 1) (state store BEFORE the v19 OPEN_COMBINE call,
   base=NULL + flags 0 = COPY_PATH arm, path := result, return 1).
   The other members: EVIDENCE / typed-host (0xa25350 dtor wrapper,
   0xa24ec0, 0xa24fd0, 0xa25130, 0xa25560, 0xa25200) or PLATFORM
   (0xa25090 exit-owned HOST — Rule 12; 0xa25510 _access leaf — the v21
   "0 direct refs" claim CORRECTED: 1 caller 0x91a3d0; 0xa25530
   GetFileAttributesW leaf; 0x67efc0 generic cell+0x18 leaf —
   LUA-REGISTERED in the megablock gap bin, push @ 0x86b763 — the v24
   lease transfer is live). v22's "+0x28 of 0xb65724 = v11 dtor inner"
   is CORRECTED: it is the open-1 twin 0xa25410. */

export const LOG_VA_BASE_FLAGS_SET1 = 0x00a649b0;
export const LOG_BASE_FLAGS_SET1_END = 0x00a649b7;          /* first int3 */
export const LOG_BASE_FLAGS_SET1_BODY_BYTES = 0x07;
export const LOG_BASE_FLAGS_SET1_INSN_COUNT = 3;
export const LOG_BASE_FLAGS_SET1_FIRST_RET_VA = 0x00a649b6;
export const LOG_BASE_FLAGS_SET1_RET_ARGS = 0;
export const LOG_BASE_FLAGS_SET1_RETS = 1;
export const LOG_BASE_FLAGS_SET1_E8_CALLS = 0;
export const LOG_BASE_FLAGS_SET1_INDIRECT_CALLS = 0;
export const LOG_BASE_FLAGS_SET1_MEM_STORES = 1;
export const LOG_BASE_FLAGS_SET1_STATE_OFFSET = 0x04;
export const LOG_BASE_FLAGS_SET1_READ_WIDTH = 4;  /* ENCODING law: 83 49 04 01 */
export const LOG_BASE_FLAGS_SET1_VTABLE_SLOTS = 5;
export const LOG_BASE_FLAGS_SET1_SLOT_1_VA = 0x00b81ae0;
export const LOG_BASE_FLAGS_SET1_SLOT_2_VA = 0x00b8341c;
export const LOG_BASE_FLAGS_SET1_SLOT_3_VA = 0x00b9ebe8;
export const LOG_BASE_FLAGS_SET1_SLOT_4_VA = 0x00b9fdd0;
export const LOG_BASE_FLAGS_SET1_SLOT_5_VA = 0x00ba918c;
export const LOG_BASE_FLAGS_SET1_RAW_OCCURRENCES = 5;
export const LOG_BASE_FLAGS_SET1_DIRECT_CALLSITES = 0;
export const LOG_BASE_FLAGS_SET1_SIBLING_CLEAR_VA = 0x00a649c0;

/* ---------- v27: the base-class flags-CLEAR twin 0xa649c0 ----------
   `and dword ptr [ecx+4],0xfffffffe ; ret` — FULL-dword encoding
   (READ_WIDTH=4, `83 61 04 fe`), the width-contrast twin of the
   mutexbase byte-clear 0xa68480 (READ_WIDTH=1). */

export const LOG_VA_BASE_FLAGS_CLEAR1 = 0x00a649c0;
export const LOG_BASE_FLAGS_CLEAR1_END = 0x00a649c5;          /* first int3 */
export const LOG_BASE_FLAGS_CLEAR1_BODY_BYTES = 0x05;
export const LOG_BASE_FLAGS_CLEAR1_INSN_COUNT = 2;
export const LOG_BASE_FLAGS_CLEAR1_FIRST_RET_VA = 0x00a649c4;
export const LOG_BASE_FLAGS_CLEAR1_RET_ARGS = 0;
export const LOG_BASE_FLAGS_CLEAR1_RETS = 1;
export const LOG_BASE_FLAGS_CLEAR1_E8_CALLS = 0;
export const LOG_BASE_FLAGS_CLEAR1_INDIRECT_CALLS = 0;
export const LOG_BASE_FLAGS_CLEAR1_MEM_STORES = 1;
export const LOG_BASE_FLAGS_CLEAR1_STATE_OFFSET = 0x04;
export const LOG_BASE_FLAGS_CLEAR1_CLEAR_MASK = 0xfffffffe;
export const LOG_BASE_FLAGS_CLEAR1_BYTE_MASK = 0xfe;
export const LOG_BASE_FLAGS_CLEAR1_READ_WIDTH = 4;  /* ENCODING law: 83 61 04 fe */
export const LOG_BASE_FLAGS_CLEAR1_VTABLE_SLOTS = 6;
export const LOG_BASE_FLAGS_CLEAR1_SLOT_1_VA = 0x00b9e924;
export const LOG_BASE_FLAGS_CLEAR1_SLOT_2_VA = 0x00b9ebec;  /* set1 slot +4 */
export const LOG_BASE_FLAGS_CLEAR1_SLOT_3_VA = 0x00b9fa8c;
export const LOG_BASE_FLAGS_CLEAR1_SLOT_4_VA = 0x00b9fdd4;  /* set1 slot +4 */
export const LOG_BASE_FLAGS_CLEAR1_SLOT_5_VA = 0x00ba315c;
export const LOG_BASE_FLAGS_CLEAR1_SLOT_6_VA = 0x00ba9190;  /* set1 slot +4 */
export const LOG_BASE_FLAGS_CLEAR1_RAW_OCCURRENCES = 6;
export const LOG_BASE_FLAGS_CLEAR1_DIRECT_CALLSITES = 0;
export const LOG_BASE_FLAGS_CLEAR1_SIBLING_SET_VA = 0x00a649b0;
export const LOG_BASE_FLAGS_SET1_TO_CLEAR1_PAD_BYTES = 9;

export const LOG_VA_BASE_FLUSH_CLEAR = 0x00a24ea0;
export const LOG_BASE_FLUSH_CLEAR_END = 0x00a24eb8;         /* first int3 */
export const LOG_BASE_FLUSH_CLEAR_BODY_BYTES = 0x18;
export const LOG_BASE_FLUSH_CLEAR_INSN_COUNT = 8;
export const LOG_BASE_FLUSH_CLEAR_FIRST_RET_VA = 0x00a24eb7;
export const LOG_BASE_FLUSH_CLEAR_RET_ARGS = 0;
export const LOG_BASE_FLUSH_CLEAR_RETS = 1;
export const LOG_BASE_FLUSH_CLEAR_E8_CALLS = 0;
export const LOG_BASE_FLUSH_CLEAR_INDIRECT_CALLS = 1;
export const LOG_BASE_FLUSH_CLEAR_MEM_STORES = 1;
export const LOG_BASE_FLUSH_CLEAR_LISTENER_GLOBAL_VA = 0x00c79bd8;
export const LOG_BASE_FLUSH_CLEAR_FLUSH_SLOT = 0x20;
export const LOG_BASE_FLUSH_CLEAR_CLEAR_MASK = 0xfffffffe;
export const LOG_BASE_FLUSH_CLEAR_READ_WIDTH = 4;  /* ENCODING law: 83 66 04 fe */
export const LOG_BASE_FLUSH_CLEAR_FLUSH_CALL_VA = 0x00a24eaf;
export const LOG_BASE_FLUSH_CLEAR_CLEAR_VA = 0x00a24eb2;
export const LOG_BASE_FLUSH_CLEAR_RAW_OCCURRENCES = 1;
export const LOG_BASE_FLUSH_CLEAR_DIRECT_CALLSITES = 0;

export const LOG_VA_BASE_OPEN0 = 0x00a253e0;
export const LOG_BASE_OPEN0_END = 0x00a25408;              /* first int3 */
export const LOG_BASE_OPEN0_BODY_BYTES = 0x28;
export const LOG_BASE_OPEN0_INSN_COUNT = 16;
export const LOG_BASE_OPEN0_FIRST_RET_VA = 0x00a25405;
export const LOG_BASE_OPEN0_RET_ARGS = 4;
export const LOG_BASE_OPEN0_RETS = 1;
export const LOG_BASE_OPEN0_E8_CALLS = 1;
export const LOG_BASE_OPEN0_INDIRECT_CALLS = 0;
export const LOG_BASE_OPEN0_MEM_STORES = 2;
export const LOG_BASE_OPEN0_STATE_VALUE = 0;              /* == OPEN_READ */
export const LOG_BASE_OPEN0_STATE_OFFSET = 0x04;
export const LOG_BASE_OPEN0_PATH_OFFSET = 0x08;
export const LOG_BASE_OPEN0_STATE_STORE_VA = 0x00a253ef;
export const LOG_BASE_OPEN0_COMBINE_CALL_VA = 0x00a253f6;
export const LOG_BASE_OPEN0_CLEANUP_VA = 0x00a253fb;
export const LOG_BASE_OPEN0_RAW_OCCURRENCES = 1;
export const LOG_BASE_OPEN0_DIRECT_CALLSITES = 0;

export const LOG_VA_BASE_OPEN1 = 0x00a25410;
export const LOG_BASE_OPEN1_END = 0x00a2543a;              /* first int3 */
export const LOG_BASE_OPEN1_BODY_BYTES = 0x2a;
export const LOG_BASE_OPEN1_INSN_COUNT = 19;
export const LOG_BASE_OPEN1_FIRST_RET_VA = 0x00a25437;
export const LOG_BASE_OPEN1_RET_ARGS = 8;
export const LOG_BASE_OPEN1_RETS = 1;
export const LOG_BASE_OPEN1_E8_CALLS = 1;
export const LOG_BASE_OPEN1_INDIRECT_CALLS = 0;
export const LOG_BASE_OPEN1_MEM_STORES = 2;
export const LOG_BASE_OPEN1_STATE_VALUE = 1;              /* == OPEN */
export const LOG_BASE_OPEN1_STATE_OFFSET = 0x04;
export const LOG_BASE_OPEN1_PATH_OFFSET = 0x08;
export const LOG_BASE_OPEN1_STATE_STORE_VA = 0x00a25420;
export const LOG_BASE_OPEN1_COMBINE_CALL_VA = 0x00a25427;
export const LOG_BASE_OPEN1_CLEANUP_VA = 0x00a2542c;
export const LOG_BASE_OPEN1_ARG2_DEAD = 1;
export const LOG_BASE_OPEN1_RAW_OCCURRENCES = 2;  /* 0xb6574c + 0xb83400 */
export const LOG_BASE_OPEN1_DIRECT_CALLSITES = 0;
export const LOG_BASE_OPEN_COMBINE_BASE_NULL = 1;
export const LOG_BASE_OPEN_COMBINE_FLAGS_ZERO = 1;
export const LOG_BASE_OPEN_COMBINE_MODE = 0;      /* == COMBINE_MODE_COPY_PATH */

/* closure census pins (evidence) */
export const LOG_BASE_DTOR_TABLE_VA = 0x00b833d8;
export const LOG_BASE_TABLE_VA = 0x00b83418;
export const LOG_BASE_TABLE_SLOTS = 12;
export const LOG_BASE_TABLE_NULL_SLOT = 0x00000000;
export const LOG_VA_BASE_DTOR_WRAPPER = 0x00a25350;
export const LOG_BASE_DTOR_WRAPPER_END = 0x00a253d0;
export const LOG_BASE_DTOR_WRAPPER_BODY_BYTES = 0x80;
export const LOG_BASE_DTOR_WRAPPER_SEH = 0x00af12a0;
export const LOG_VA_BASE_TIMED_WINDOW = 0x00a24ec0;
export const LOG_VA_BASE_OPEN_GATED = 0x00a24fd0;
export const LOG_VA_BASE_FACTORY = 0x00a25090;
export const LOG_VA_BASE_SEH_WRAPPER = 0x00a25130;
export const LOG_VA_BASE_ACCESS_LEAF = 0x00a25510;
export const LOG_BASE_ACCESS_LEAF_END = 0x00a25529;
export const LOG_BASE_ACCESS_LEAF_DIRECT_CALLSITES = 1;  /* 0x91a3d0 */
export const LOG_BASE_ACCESS_LEAF_CALLSITE_VA = 0x0091a3d0;
export const LOG_VA_BASE_GFA_LEAF = 0x00a25530;
export const LOG_BASE_GFA_LEAF_END = 0x00a2555c;
export const LOG_VA_BASE_STATS_WRITER = 0x00a25560;
export const LOG_VA_BASE_GETTER_18 = 0x0067efc0;
export const LOG_BASE_GETTER_18_END = 0x0067efc4;
export const LOG_BASE_GETTER_18_REG_PUSH_VA = 0x0086b763;
export const LOG_VA_BASE_COMBINE_WRAPPER = 0x00a25200;
export const LOG_TEXT_INSN_COUNT_V25 = 2094319;
export const LOG_TEXT_UNDECODABLE_BYTES_V25 = 469;
export const LOG_V25_BATCHED_VAS = 16;
export const LOG_V25_EXACT_ZHL_MATCHES = 0;

/* ---------- v26: the KAGE::MutexBase same-template trio ----------
   Interface vtable .rdata 0xba04b4/+0x04/+0x08; ZERO direct
   callers (pure virtual dispatch).  BYTE-width encoding laws on
   the +4 cell — the contrast to the v25 FULL-dword base twins. */

export const LOG_MUTEXBASE_SDTOR_VA = 0x00a68440;
export const LOG_MUTEXBASE_SDTOR_FREE_SIZE = 8;
export const LOG_MUTEXBASE_SDTOR_VTABLE = 0x00ba04b4;
export const LOG_MUTEXBASE_OBJECT_SIZE = 8;
export const LOG_MUTEXBASE_LOCK_CLOCK_RECHECK = 0x00a68490;
export const LOG_VA_MUTEXBASE_SET1 = 0x00a68470;
export const LOG_MUTEXBASE_SET1_END = 0x00a6847e;
export const LOG_MUTEXBASE_SET1_BODY_BYTES = 0x0e;
export const LOG_MUTEXBASE_SET1_INSN_COUNT = 5;
export const LOG_MUTEXBASE_SET1_FIRST_RET_VA = 0x00a6847d;
export const LOG_MUTEXBASE_SET1_RETS = 1;
export const LOG_MUTEXBASE_SET1_MEM_STORES = 1;
export const LOG_MUTEXBASE_SET1_CELL_OFFSET = 0x04;
export const LOG_MUTEXBASE_SET1_READ_WIDTH = 1;
export const LOG_MUTEXBASE_SET1_BIT = 0;
export const LOG_MUTEXBASE_SET1_VTABLE_REF_RDATA = 0x00ba04b8;
export const LOG_VA_MUTEXBASE_CLEAR1 = 0x00a68480;
export const LOG_MUTEXBASE_CLEAR1_END = 0x00a68485;
export const LOG_MUTEXBASE_CLEAR1_BODY_BYTES = 0x05;
export const LOG_MUTEXBASE_CLEAR1_INSN_COUNT = 2;
export const LOG_MUTEXBASE_CLEAR1_BYTE_MASK = 0xfe;
export const LOG_MUTEXBASE_CLEAR1_READ_WIDTH = 1;
export const LOG_MUTEXBASE_CLEAR1_CELL_OFFSET = 0x04;
export const LOG_MUTEXBASE_CLEAR1_VTABLE_REF_RDATA = 0x00ba04bc;

/** L5 — 0xa68470: movzx/bts/mov-byte — the LOW byte |= 1, the
    upper 3 dword bytes preserved, al = 1 returned. */
export function logMutexbaseSet1After(cell) {
  const c = cell >>> 0;
  const low = (c & 0xff) | 0x01;
  return ((c & 0xffffff00) | low) >>> 0;
}

export function logMutexbaseSet1ReturnsOne() { return 1; }

/** L6 — 0xa68480: and-byte 0xfe — the LOW byte bit 0 cleared,
    upper 3 dword bytes preserved. */
export function logMutexbaseClear1After(cell) {
  const c = cell >>> 0;
  const low = (c & 0xff) & 0xfe;
  return ((c & 0xffffff00) | low) >>> 0;
}

export function logMutexbaseClear1Unconditional() { return 1; }

/* v26 census pins. */
export function logMutexbaseSdtorVa() { return LOG_MUTEXBASE_SDTOR_VA; }
export function logMutexbaseSdtorFreeSize() { return LOG_MUTEXBASE_SDTOR_FREE_SIZE; }
export function logMutexbaseSdtorVtable() { return LOG_MUTEXBASE_SDTOR_VTABLE; }
export function logMutexbaseObjectSize() { return LOG_MUTEXBASE_OBJECT_SIZE; }
export function logMutexbaseLockClockRecheck() { return LOG_MUTEXBASE_LOCK_CLOCK_RECHECK; }
export function logMutexbaseSet1BodyVa() { return LOG_VA_MUTEXBASE_SET1; }
export function logMutexbaseSet1EndVa() { return LOG_MUTEXBASE_SET1_END; }
export function logMutexbaseSet1BodyBytes() { return LOG_MUTEXBASE_SET1_BODY_BYTES; }
export function logMutexbaseSet1InsnCount() { return LOG_MUTEXBASE_SET1_INSN_COUNT; }
export function logMutexbaseSet1FirstRetVa() { return LOG_MUTEXBASE_SET1_FIRST_RET_VA; }
export function logMutexbaseSet1Rets() { return LOG_MUTEXBASE_SET1_RETS; }
export function logMutexbaseSet1MemStores() { return LOG_MUTEXBASE_SET1_MEM_STORES; }
export function logMutexbaseSet1CellOffset() { return LOG_MUTEXBASE_SET1_CELL_OFFSET; }
export function logMutexbaseSet1ReadWidth() { return LOG_MUTEXBASE_SET1_READ_WIDTH; }
export function logMutexbaseSet1Bit() { return LOG_MUTEXBASE_SET1_BIT; }
export function logMutexbaseSet1VtableRefRdata() { return LOG_MUTEXBASE_SET1_VTABLE_REF_RDATA; }
export function logMutexbaseSet1DirectCallsites() { return 0; }
export function logMutexbaseClear1BodyVa() { return LOG_VA_MUTEXBASE_CLEAR1; }
export function logMutexbaseClear1EndVa() { return LOG_MUTEXBASE_CLEAR1_END; }
export function logMutexbaseClear1BodyBytes() { return LOG_MUTEXBASE_CLEAR1_BODY_BYTES; }
export function logMutexbaseClear1InsnCount() { return LOG_MUTEXBASE_CLEAR1_INSN_COUNT; }
export function logMutexbaseClear1ByteMask() { return LOG_MUTEXBASE_CLEAR1_BYTE_MASK; }
export function logMutexbaseClear1ReadWidth() { return LOG_MUTEXBASE_CLEAR1_READ_WIDTH; }
export function logMutexbaseClear1CellOffset() { return LOG_MUTEXBASE_CLEAR1_CELL_OFFSET; }
export function logMutexbaseClear1VtableRefRdata() { return LOG_MUTEXBASE_CLEAR1_VTABLE_REF_RDATA; }
