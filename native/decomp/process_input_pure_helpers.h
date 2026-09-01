#pragma once

#include <stdint.h>

#ifdef __cplusplus
extern "C" {
#endif

/* Pure peels of input-adjacent residual inventory helpers used across the
   frame path. Game::ProcessInput itself is NOT pinned on this PE (inventory
   missing; ZHL static void pattern has 0 exact hits). These helpers translate
   complete pure islands from address-stable FUN_006f9400 / FUN_006f95a0 after
   host map lower_bound (0x004288a0) results are known, pure peels of exact
   InputManager::GetDeviceType (0x00a6f620), Manager shell / FUN_006f9730, and
   pure entry gates of the Manager device-poll host FUN_00a6de60.

   Binary: tools/isaac-ng.unpacked.exe
   SHA-256: 5129DF723E645DAAEA59514394195F3EA1DCE1671BB0433D724648A845017200

   Evidence (hash-bound PE / decompile; do not promote guesses to ProcessInput):
     decompiled/00954cd0_FUN_00954cd0.c (Manager::Update-class shell)
     PE body of FUN_00a6de60 @ 0x00a6de60 … ret @ 0x00a6eedf
     PE body of GetDeviceType @ 0x00a6f620 (exact ZHL)
     ambient-always-host/FUN_006f9400-full.txt / FUN_006f95a0-full.txt

   Not a ProcessInput slice ABI and not wired into the Update frame path.
   Do not promote these VAs to Game::ProcessInput.

   ---------------------------------------------------------------------------
   Manager poll host chain (from shell VA 0x00954cd0 when param_1 != 0)
   ---------------------------------------------------------------------------
   PE order (address-stable names; no ProcessInput pin):

     if (param_1 != 0) {                         // pure: poll_prefix_needed
       if (DAT_00c73680 == 0)                     // pure: platform_uses_a69f60
         host FUN_00a69f60(0x10001, 0);           // no exact ZHL
       else
         host (*DAT_00c7378c)();                  // platform/Steam path
       host FUN_00a6de60();                       // device vector poll (below)
       host FUN_00a1fc00();                       // pattern collides
                                                 // Entity_Familiar::Shoot —
                                                 // NOT that symbol here
     }
     // always continues into shell body:
     host FUN_0095b310();                         // pattern collides
                                                 // LuaEngine::RegisterClasses —
                                                 // disproven by every-frame
                                                 // Manager caller
     host FUN_009c34f0();
     pure 2-slot float approach @ Manager+0x4a950+0x114 (step DAT_00baa7a4)
       + host FUN_00424130 when slot+0x10 dword != 1
     … remainder of Manager shell (state machine / Game_Update) residual

   FUN_00a6de60 pure entry (VA 0x00a6de8e … loop) then host residual body:

     if (byte DAT_00c7e300 == 0) goto epilog;     // pure: body_needed fails
     if (byte DAT_00c9ba98 != 0) goto epilog;     // re-entrancy; body_needed
     DAT_00c9ba98 = 1;
     count = SAR32(DAT_00c79bf0 - DAT_00c79bec, 2);  // pure: vector_count
     if (count == 0) { DAT_00c9ba98 = 0; epilog; }   // pure: loop_needed
     // host residual: walk device vector, IAT/query callees
     //   0x00a6da10, 0x00a6dd30, 0x00a648b0, IAT @ 0x00c7e2dc /
     //   0x00b18234 / 0x00b18238, CRT 0x00aefe80, …
     DAT_00c9ba98 = 0; epilog;                    // ret @ 0x00a6eedf

   ABI v2:
     - InputManager::GetDeviceType pure list-range membership (host lock/unlock
       residual at this+0x10 remains outside)
     - FUN_006f9730 complete pure Game predicate (Manager state-2 early gate)
     - Manager::Update-class shell early skip decision (VA 0x00954cd0 head)
     - Manager float approach step used in the post-poll 2-slot loop

   ABI v3:
     - Manager poll-prefix gate (param_1) + platform branch (DAT_00c73680)
     - FUN_00a6de60 pure entry: enable/reenter body_needed, signed SAR vector
       count, loop_needed; device walk remains host residual

   ABI v4 (device walk pure islands after loop_needed @ 0x00a6ded0):
     - device enabled byte [dev+0] / query status==0
     - button bit extract + edge callback decision (press/release slots)
     - axis normalize i16 (+0x8000 / 65535 * 2 - 1) and u8 (/127.5 - 1)
     - float change (ucomiss ordered-equal) + axis callback needed
     - DIERR reacquire HRESULT set {INPUTLOST, NOTACQUIRED}
     - unsigned index continue + axis type dispatch (type<=0x2c && type%4==0)

   ABI v5 (pure islands on residual IAT/query path + freestanding callees):
     - query hook select: DAT_00c7e29c != 0 @ 0x00a6dee5
     - QPC frequency init needed: (DAT_00c9ba90 | DAT_00c9ba94) == 0
     - CRT 0x00aefe80 u64 halves → f64 (legacy portable path)
     - QPC seconds: counter/freq then f32 round-trip (cvtpd2ps/cvtps2pd)
     - COM HRESULT jns success (SF=0 / signed >= 0)
     - disabled-device buffered mode byte [state+0x18]
     - DIDOD buffer byte size: count*0x14 with mul overflow → 0xffffffff
     - buffered timestamp u32 → seconds f64 (/ DAT_00baa770 = 1000)
     - FUN_00a6dd30 pure POV/hat → dual axis floats (callbacks remain host)
     Host residual still owns: IAT/query CALLs @ 0x00a6def6 / 0x00a6df35,
       QPC IAT, COM vtable walks, callbacks, 0x00a6da10 / 0x00a648b0,
       a6dd30 float store+callback body

   ABI v6 (pure islands after residual query CALLs + freestanding callees):
     - hook buffer → compact state repack @ 0x00a6def8…0x00a6df2e (post hook CALL)
     - DIDOD event ofs match (event.dwOfs == map[i]) @ 0x00a6e81b / axis map @ 0x00a6e8ab
     - axis map entry is POV: byte [entry+4] != 0 @ 0x00a6e8c2
     - query-fail: device table clear value 0 + index after a6da10 (edi--)
     - FUN_00a6da10 pure: disconnect-cb needed, remove memmove byte count,
       vector end-4, index-1 after remove
     - FUN_00a648b0 pure: CL mode dispatch (0 alloc / 1 free / 2 account / other),
       alloc malloc size = (hi!=0 ? 0 : lo) + 4 (32-bit wrap)
     Host residual still owns: hook/IAT CALLs, QPC IAT, COM vtable, callbacks,
       CRT free/memmove bodies, a648b0 malloc/free IAT, a6dd30 store+callback

   ABI v7 (Manager poll sibling FUN_00a1fc00 @ 0x00a1fc00 + residual callee
     FUN_00a1f280 @ 0x00a1f280):
     - Manager callsite 0x00954f78: mov ecx, 0x00c57b18; call 0x00a1fc00
       (this = static object at 0xc57b18; NOT Entity_Familiar::Shoot despite
       exact ZHL pattern collision — retain address-stable name)
     - lock obj present: this+0x14 != 0 (else host FUN_00a112c0)
     - 8-byte queue loop: begin this+8 vs end this+0xc; count SAR32(end-begin,3)
     - entry flags bit0 already-active; mark active = flags|1
     - free-slot scan on this+0x20 table vs DAT_00c799f4 count (stride 8 keys)
     - queue erase end-8; iter +8 / continue; pending grow end==cap; push end+8
     - pending free size (cap-begin)&~7; heap header when size>=0x1000 (+0x23)
     - FUN_00a1f280 @ 0x00a1f280 pure: buffer clear size SAR32(end-begin,4)<<2;
       axis deadzone dir bits (strict |value|>thresh → neg/pos; NaN no bit)
     Host residual: lock/unlock vcalls, a1f280 body CRT/vcalls, shared_ptr
       copy/notify DAT_00c7e814, a21570 erase, a21630 grow, free IAT 0xaef15c

   ABI v8 (deeper FUN_00a1f280 pure islands + freestanding FUN_00a1eed0 @
     0x00a1eed0 remap + sibling FUN_00a20020 @ 0x00a20020 pure body =
     queue_count):
     - buffer elem count SAR32(end-begin,4) (capacity cmp @ 0x00a1f4fa)
     - a1eed0 pure deadzone remap after host vcall+0x7c (thresh at this+0xd0)
     - post-remap axis split: neg_part / pos_part (maxss vs 0) @ 0x00a1f398…
     - action push gates: mode_cc==4 skip; id!=-1; index < count (unsigned)
     - buffer store slot byte offset (cc + index*4)*4 @ 0x00a1f521
     - rumble: !(flags&8); timer>0; clamp timer to non-neg @ 0x00a1f53b…
     - sibling a20020 pure return = a1fc00_queue_count (lock/unlock host)
     Host residual still: a1f280 CRT 0xaf05df/0xaf05e5, vcalls +0x78/+0x80/
       +0x7c/+0x3c/+0x84, a1eed0 vcall, a112c0, a68490, aefe20, stores

   ABI v9 (FUN_00a68490 pure islands + post-tick rumble scale @ 0x00a1f56c):
     - a68490 pure: (counter_f64/freq_f64)*DAT_00baa8b0 (1e9) after host
       QPC IAT + aefe80; host still owns aefd70 f64→u64 truncate
     - post-tick: seed*(0x431bde82d7b634db)>>82 (≈seed/1e6; same mul magic as
       Update scaleMonotonicCounter); 64-bit sub vs device+0xe0/+0xe4;
       nonzero gate
     - after host aefe20(delta): cvtsd2ss * DAT_00baa020 (0.001f) → seconds;
       timer -= delta_sec; intensity keep when 0<timer (or NaN unordered)
     Host residual still: a68490 QPC IAT [0xb18238]/[0xb18234], aefe80,
       aefd70, aefe20, device vcall+0x84, CRT 0xaf05df/0xaf05e5, other vcalls

   ABI v10 (pure arg prep / stores around host device vcall+0x84 @ 0x00a1f65a):
     - intensity/timer select for stack args before call [vtbl+0x84]
       (VA 0x00a1f62b…0x00a1f655): active → (timer, saved_intensity);
       else → (0, 0) and force-store timer+0xd8 ← 0
     - alternate neg-timer path @ 0x00a1f6f2: ordered timer < 0 → same vcall
       with (timer, intensity@+0xdc) (no post-tick scale on that path)
     - post-vcall pure: second a68490 host → scale_tick (v9) → store scaled
       to device+0xe0/+0xe4; success AL = 1
     Device vcall body + a68490 / aefe20 remain host residual

   ABI v11 (pure CF around shared info-logger FUN_00a112c0 @ 0x00a112c0):
     - FUN_00a112c0 is NOT pure-fatal: it formats/logs and returns (no int3).
       Body remains host residual (init a15770, lock/unlock 0xc37958,
       sprintf-class 0x420a80 / 0x709bc0, OutputDebugStringA, sink vcall).
     - Pure gates: reenter (DAT_00c7de48==1), sink_active
       (DAT_00c79bd8!=0 && (DAT_00c79bdc & level)!=0), body_needed
       (low-byte level!=0 || sink_active, not reenter), init_needed (state==0),
       prefix_enabled (DAT_00c33911), ODS low-byte, sink write recheck,
       buf remaining (0x2800 - prefix_len), trail newline → flag store value
     - Pure message ptrs: level→prefix VA table (INFO/NET/WARN/ERROR/ASSERT/
       empty), fmt VA 0xb62fdc, ProcessInput callsite msg VAs
       0xb9fda8 (invalid mutex @ a1fc00/a20020) / 0xb82e78 (ActionId OOR @
       a1f280) with level ASSERT=0x10
     - a1f280 OOR log gate: !buffer_index_in_range (log then continues store)

   ABI v12 (pure arg/gate CF around host device vcall+0x3c @ 0x00a1f4db):
     - Gate: mode_cc != 4 → action-query vcall needed (inverse of v8 idle)
     - Arg: push imm 0 (slot index / controller index for vcall)
     - Vtable slot constant 0x3c; call site VA 0x00a1f4db
     - Post-store pure field values after successful action push:
         device+0xc8 ← 0xffffffff (index cleared)
         device+0xcc ← 4 (mode idle / committed)
     - Host residual: device vcall body [this→vtbl+0x3c](0) and buffer store

   ABI v13 (pure arg/gate CF around host device vcall+0x80 @ 0x00a1f3f8):
     - Pair1 fill-present query: thiscall [this→vtbl+0x80]() → AL
     - Post-gate: AL != 0 → pair1 axis fill body (else skip to action query)
     - Pure args after ok: push 1 for host [vtbl+0x7c](out, pair) and a1eed0
     - Vtable slot 0x80; call site VA 0x00a1f3f8 (sibling pair0 @ 0x00a1f320
       shares slot; pair arg 0; not the primary residual of this unit)
     - Pure field bases for pair1 post-a1eed0 stores: axis @ +0x50, dir bit
       base 4 (0x10/0x20/0x40/0x80) reusing v7/v8 axis math
     - Host residual: device vcall body [this→vtbl+0x80] and [vtbl+0x7c] fill

   ABI v14 (pure out-buffer / field CF around host device vcall+0x7c @
     0x00a1f40d — pair1 axis float fill after fill_ok):
     - Call-site VA pair1 0x00a1f40d / sibling pair0 0x00a1f335
     - Out buffer layout: 2 × f32 (x @ +0, y @ +4) written by host fill
     - Dir-bit thresh field +0xd4 (post-fill digital deadzone; PE movss)
     - Dir-bits OR field +0x30; pure merge prior | axis_pair_bits(...)
     - Remap thresh field +0xd0 (a1eed0 pure remap; distinct from +0xd4)
     - a1eed0 leading host +0x7c call site 0x00a1eee0 (same method)
     - Host residual: device [this→vtbl+0x7c](out, pair) body at all three
       call sites (pair0/pair1 fill + a1eed0 lead)

   ABI v15 (pure arg/gate CF around host device ready-gate vcall+0x78 @
     0x00a1f30a — leading ready query inside FUN_00a1f280 after CRT clear):
     - Call-site VA 0x00a1f30a: thiscall [this→vtbl+0x78]() → AL; no stack args
     - Post-gate: test al / jne body @ 0x00a1f316; AL==0 → early epilog ret
     - Pure: ready_vcall_ok (low-byte AL != 0), ready_early_return (inverse)
     - Vtable slot constant 0x78
     - Host residual: device [this→vtbl+0x78]() body (receiver-dependent)

   ABI v16 (pure islands inside the a6de60 walk's host residual callees —
     FUN_00a648b0 tracked heap CF, FUN_00a6da10 teardown plan, FUN_00a6dd30
     store/callback CF):
     - FUN_00a648b0 @ 0x00a648b0 … ret 0x00a64960 is a **tracked heap routine**.
       Proven by IAT identity (import table of this PE):
         [0x00b187e0] = malloc  (api-ms-win-crt-heap-l1-1-0.dll)
         [0x00b187dc] = free    (api-ms-win-crt-heap-l1-1-0.dll)
       Fastcall CL = mode, EDX = payload ptr (free), stack [ebp+8]/[ebp+0xc] =
       64-bit size (caller-cleaned; walk sites `add esp,8` @ 0x00a6e7b5 /
       0x00a6e992). No exact ZHL → keep address-stable.
       * tracker base select @ 0x00a648b5…0x00a648c2:
           ctx = DAT_00c7de78; base = ctx != 0 ? ctx+0x30 : 0x00c7f618
       * account mode 2 @ 0x00a648d9 writes [ctx+0x30]/[ctx+0x34] **directly**
         (EDI, not the selected ESI base) — fallback base is never used there
       * alloc @ 0x00a6490f…0x00a64960: `cmp edi,-1 / jbe` is always taken, so
         the clamp is exactly `size_hi != 0` → both halves stored 0 (movlpd);
         malloc_size_lo = clamped_lo + 4 (wrap), malloc_size_hi = carry only
       * malloc == 0 → host OOM broadcast 0x00a23200(0x7fcb9dd6), return 0
       * commit: tracker += 64-bit malloc size; [block] = malloc_size_lo;
         return block + 4
       * free @ 0x00a648ef: ptr == 0 → nop; else header = [ptr-4],
         tracker -= header with `sbb …,0` (low dword only), free(ptr-4)
       * PE asymmetry: alloc adds a carry high dword that free never subtracts
     - FUN_00a6da10 teardown plan (ECX = device index; walk sites 0x00a6e6f7 /
       0x00a6e788 / 0x00a6e7e1 / 0x00a6e9e5, sibling 0x00a6dd02):
       ordered PE steps after the optional disconnect callback —
         enable byte [state+0]==0 → COM Release [state+0x14] vtbl slot 8,
           free [state+0x24], free [state+0x28], free [dev+4]
         always → free state, free [dev+0x18], free [dev+0x1c], free dev
       then memmove(slot, slot+4, end-(slot+4)) and end -= 4
     - FUN_00a6dd30 store/callback CF after the POV head (0x00a6dda1…0x00a6de34):
       axis float array base [device+0x18]; x slot index*4, y slot (index+1)*4;
       both stores are unconditional (the ucomiss only gates the callback);
       callback DAT_00c78d70 frame is 0x1c bytes:
         [esp+0]=device [esp+4]=index [esp+8]=new f32 [esp+0xc]=old f32
         [esp+0x10]=timestamp f64 [esp+0x18]=DAT_00c75dac user
     - **Corrected v5 peel:** pov_axis1 at pov == 0x6978 (WEST/270°) is 0.0f,
       not +1.0f. PE @ 0x00a6de45 `cmp eax,0x6978 / jb 0xa6dda1` falls through
       to 0xa6de50 (`xorps xmm0` → y = 0) on equality. Raw bytes verified:
       `3d 78 69 00 00 0f 82 51 ff ff ff 0f 57 c0`.
     Host residual still owns: malloc/free IAT bodies, OOM broadcast 0x00a23200,
       CRT memmove 0x00af08bd, COM Release vtable body, disconnect/axis
       callbacks, and all live device/vector memory.

   ABI v17 (sibling device scan/connect FUN_00a6dab0 @ 0x00a6dab0 … ret
     0x00a6dd2e; shares the DAT_00c7e300 enable gate with FUN_00a6de60 and
     calls FUN_00a6da10 @ 0x00a6dd02). No exact ZHL → address-stable.
     Callers: 0x00a220d7 and 0x00a6d140 (both no exact ZHL).
     * Outer structure (all pure gates; bodies host):
         0x00a6dad3 enable DAT_00c7e300 == 0 → epilog
         0x00a6dae7 window DAT_00c7e2d4 == 0 → skip message pump
         0x00a6daeb…0x00a6db4c host Win32 pump (USER32 IAT: PeekMessageA
           0x00b185e4, GetMessageA 0x00b185e0, TranslateMessage 0x00b18650,
           DispatchMessageA 0x00b185dc) — address-stable host, not modelled
         0x00a6db4e refresh flag DAT_00c7ac6b != 0 → host COM EnumDevices
           ([vtbl+0x10](this, 4, 0x00a6d560, 0, 0)); flag then stored 0
         0x00a6db89 scan flag DAT_00c7e301 == 0 → epilog
         0x00a6db98…0x00a6dd16 4-slot loop (`inc esi / cmp esi,4 / jb`)
     * Per-slot decision after the host state query CALL [DAT_00c7e2f4]:
         status == 0 && slot record == 0            → connect (build record)
         status != 0 && slot record != 0            → disconnect (search+a6da10)
         otherwise                                   → next slot
       Capability read only when DAT_00c7e304 == 2 and hook DAT_00c7e2f8 != 0;
       on success vid/pid are u16 at caps+0x14 / caps+0x16, else both 0.
     * Record init 0x00a6dc3b…0x00a6dc96 (record 0x24 bytes, state 0x30 bytes):
         state+0    = 1 (enable)      state+0x2c = slot index
         rec+0      = DAT_00c7e298 (pre-increment); DAT_00c7e298 += 1
         rec+4      = name table [0x00b468b0 + slot*4]
         rec+8      = byte state+0 (= 1)
         rec+0xa    = (u16)vid        rec+0xc    = (u16)pid
         rec+0x10   = 6 (axis count)  rec+0x14   = 0xf (button count)
         rec+0x18   = calloc(4, rec+0x10)   rec+0x1c = calloc(1, rec+0x14)
         rec+0x20   = state
       calloc IAT 0x00b187e8 stays host; only the pushed arg pair is pure.
     * Vector push 0x00a6dc99: end == capacity (DAT_00c79bf4) → host grow
       FUN_00a6ef50 (address-stable, not modelled); else store + end += 4.
     * Device-id search 0x00a6dce0…0x00a6dd00: count = SAR32(end-begin,2);
       `test eax,eax / je` skips; linear scan with a post-increment UNSIGNED
       `cmp ecx,eax / jb`, so a negative count would loop as if huge. First
       match passes its index to FUN_00a6da10 in ECX. Found or not, the slot
       table entry DAT_00c7e2e0[slot] is cleared to 0.
     * String evidence recorded, NOT promoted to a symbol name (AGENTS rule):
         0x00ba1a18 "Warning: IDirectInput_EnumDevices returned 0x%X"
         0x00ba1a4c "Using XInput to initalize new device"
         0x00ba1ae8 "XInputGetCapabilitiesEx_proc() returned error %d, …"
         0x00b468b0 → "XInput Controller 1".."4" (4 entries; matches the bound)
       The routine keeps the address-stable name FUN_00a6dab0.
     Host residual still owns: the USER32 message pump, the COM EnumDevices
       vtable call and its 0x00a6d560 callback, the state/caps hook CALLs
       through DAT_00c7e2f4 / DAT_00c7e2f8, calloc, FUN_00a6ef50 grow,
       FUN_00a112c0 logging, the connect callback DAT_00c75da8, and all live
       guest memory.

   ABI v18 (the two callers of FUN_00a6dab0 — what actually drives the scan):
     * FUN_00a220c0 @ 0x00a220c0 … ret 0x00a220ed is a **hot-plug poll thread
       procedure**, not a frame-path function. It has ZERO direct E8 callers;
       it is referenced only as a function-pointer immediate at 0x00a21b40 and
       0x0092487e, both feeding a thread-spawn vcall [obj+0x4c → vtbl+8] with
       args (0x00a220c0, 2, 0x1000, this). Body:
         test byte [0x00c57b1c], 2 / je ret     ; run flag bit1
         loop: FUN_00a6dab0(); Sleep(0x64);     ; IAT 0x00b182d8 = Sleep
               test byte [0x00c57b1c], 2 / jne loop
       0x00c57b18 is the same static object used as `this` at the Manager
       callsite 0x00954f78 (FUN_00a1fc00, ABI v7); 0x00c57b1c is obj+4.
       The spawn sites set bit1 (`bts eax,1`) and the stop site clears it
       (`btr edx,1` @ 0x00924891). Everything except FUN_00a6dab0 and Sleep is
       pure, so this function's control flow is fully translated.
     * FUN_00a6cf80 @ 0x00a6cf80 … ret 0x00a6d266 is a **one-time init**,
       guarded by `cmp byte [0x00c7e300],0 / jne epilog` (inverse use of the
       same byte FUN_00a6dab0 tests). It is called once from 0x00a21b27, which
       first installs the disconnect callback DAT_00c78d7c = 0x00a21f40 (the
       callback FUN_00a6da10 invokes) and then spawns the poll thread.
       Probe ladder (LoadLibraryA, IAT 0x00b182b4), first success wins:
         0 "XInput1_4.dll"      0x00ba1750  -> mode 2
         1 "bin\\XInput1_4.dll"  0x00ba1760  -> mode 2
         2 "XInput1_3.dll"      0x00ba1974  -> mode 1
         3 "bin\\XInput1_3.dll"  0x00ba18f4  -> mode 1
         none                               -> mode 0
       mode -> (a112c0 level, message VA): 2 -> (1, 0x00ba1960),
       1 -> (4, 0x00ba1908), 0 -> (8, 0x00ba19b0). DAT_00c7e304 = mode,
       DAT_00c7e301 = (mode != 0). GetProcAddress (IAT 0x00b182b0) table:
         ord 0x64                        -> DAT_00c7e29c   (v5 query hook)
         "XInputGetState"     0x00ba1a08 -> DAT_00c7e2dc   (v5 fallback)
         "XInputSetState"     0x00ba1984 -> DAT_00c7e2f0
         "XInputGetCapabilities" 0x00ba1994 -> DAT_00c7e2f4 (v17 slot probe)
         ord 0x6c (mode 2 only)          -> DAT_00c7e2f8   (v17 caps hook)
       This resolves the v17 hook globals by construction. It also corroborates
       the v17 caps field offsets: XINPUT_CAPABILITIES is 0x14 bytes, so
       caps+0x14 / caps+0x16 are the trailing VendorId / ProductId u16 pair of
       the Ex structure. `DAT_00c7e2f4` is the capabilities entry point used as
       a presence probe (the v17 enum name STATE_HOOK is kept for ABI
       stability; this is the resolved identity).
       Tail: CoInitializeEx(NULL, 2) with an `0x80010106` (RPC_E_CHANGED_MODE)
       retry as CoInitializeEx(NULL, 0); memset(0x00c7e2a0, 0, 0x3c);
       filter cbSize 0x30; RegisterClassExA / CreateWindowExA with class name
       0x00ba1710 "Message", wndproc 0x00a6cef0, parent HWND_MESSAGE (-3);
       RegisterDeviceNotificationA; then DAT_00c7e300 = 1, DAT_00c7ac6b = 1 and
       the first FUN_00a6dab0 scan at 0x00a6d140.
     * Root-pin evaluation (see NOTES): the ZHL pattern for
       `static void Game::ProcessInput()` still has **0 exact hits**, verified
       by brute-force scanning the whole image, not just candidate VAs. The
       sibling `Console::ProcessInput` pattern also has 0 hits, so the catalog
       is cut against a different build. The 9-byte prefix common to both has 5
       hits (0x004f76f0 / 0x008dce10 / 0x009282e0 / 0x00a88bb0 / 0x00ac3bb0)
       and every one of them continues with `mov reg, ecx` — all __thiscall,
       while the target symbol is declared static, so all 5 are disqualified on
       calling convention. The caller chain mapped here is init-once plus a
       Sleep-driven worker thread, i.e. off the frame path entirely. **Root
       remains unpinned; do not promote.**
     * String evidence recorded, NOT promoted (AGENTS rule 3): two format
       strings inside FUN_00a6cf80 self-identify as "Gamepad_init"
       (0x00ba17e4, 0x00ba19b0). identify-zhl-address returns no exact match,
       so the address-stable name is kept.
     Host residual still owns: LoadLibraryA / GetProcAddress / CoInitializeEx /
       RegisterClassExA / CreateWindowExA / RegisterDeviceNotificationA /
       GetModuleHandleA / Sleep, the DirectInput8Create call, the thread-spawn
       vcall, FUN_00a112c0 logging, FUN_00a6cf30, the wndproc FUN_00a6cef0,
       and all live guest memory.

   ABI v19 (Manager shell body after the poll prefix — VA 0x00954f82 onward
     inside FUN_00954cd0; this is the actual per-frame entry, unlike the v18
     init/thread branch). No exact ZHL for FUN_00954cd0.
     * Post-prefix receivers: host FUN_0095b310 on the Manager itself, then
       host FUN_009c34f0 on Manager+0x4d070, then host FUN_00424220 with the
       approach block base Manager+0x4a950 latched to a stack slot.
       FUN_0095b310 pattern-collides `LuaEngine::RegisterClasses` (it is an
       EXACT ZHL match, 24 pattern bytes) and is still NOT that symbol here —
       the every-frame Manager caller disproves it. Retain the address-stable
       name. This is a useful reminder that an exact match is necessary but not
       sufficient; short patterns can match the wrong function.
     * 2-slot float approach loop @ 0x00954fa3…0x00955026 (base
       Manager+0x4a950+0x114, stride 0x130, count 2, step DAT_00baa7a4 = 6.0f).
       **Two corrections to the ABI v2 description of this loop:**
         (a) the host gate is `cmp dword [slot+0x10], 0x20 / je skip`, so
             FUN_00424130 runs when the mode dword is **!= 0x20**. The v2 text
             said "!= 1"; the offset and sense were right, the constant was not.
             Raw bytes at 0x00954fff: `83 7e 10 20`.
         (b) the PE branch is `comiss current,target / jbe add_path`, and both
             selects are `cmovbe`. comiss sets CF=ZF=1 when unordered, so a
             NaN on either side takes the add path AND keeps `next`. The v2
             C++/JS used `<=` / `>=`, which is false on NaN and therefore chose
             the opposite branch and clamped to `target`. Ordered behavior is
             unchanged; only NaN differed.
     * Post-loop: byte Manager+0x4abc5 is stored 0, then a probe block runs
       only when dword Manager+0x4c610 == 0 AND dword Manager+0x4c658 <= 0
       (the second test is a SIGNED `jg` skip).
     * State dispatch @ 0x0095518f…0x0095519c: `eax = [Manager+8] - 1;
       cmp eax,4; ja default(0x009553ef); jmp [eax*4 + 0x0095559c]`. The `ja`
       is unsigned, so state 0 wraps to 0xffffffff and takes the default.
       Table (index = state-1): 1→0x009553a6, 2→0x009551a3, 3→0x009553d7,
       4→0x009553ef, 5→0x009553e4.
     * The state-2/5 g_Game branch @ 0x009550a5…0x00955118 runs only when host
       FUN_0090b150 (on Manager+0x4b3d8) returns 0, then requires
       [Manager+8] ∈ {2,5} and g_Game (DAT_00c71678) non-null. It ends by
       calling the already-pure FUN_006f9730 quiet gate (ABI v2); a 0 result is
       a full early return at 0x00955586.
     * Frame-path cross-confirmation: the state-2 arm reaches `FUN_006fadc0`
       at 0x00955231 — the address this project ports as the Update root
       (`LAB_006fbbaa` lies inside its body) — and calls the exact-ZHL
       `Game::IsPaused` (0x006fd350) at 0x0095526a. So this shell is the
       per-frame driver of Game::Update, which is why it, and not the v18
       init/thread branch, is where frame-path work belongs.
     Host residual still owns: FUN_0095b310, FUN_009c34f0, FUN_00424220,
       FUN_00424130, FUN_0090b150, FUN_009548d0, FUN_0068b260, FUN_0068bba0,
       FUN_009b5d20, FUN_009b6840, FUN_009e6eb0, the 0x00c57b18 vtbl+0x74
       vcall, CreateDirectoryA, the state-machine arms themselves, and all live
       guest memory.

   ABI v20 (stale-state audit fixes F8/F10/F11 — all three CONFIRMED from the
     instruction stream, including the two the audit filed as SUSPECTED — plus
     the state-2 frame-path arm at 0x009551a3):
     * **F8 CONFIRMED, corrected.** `timer_clamp_nonneg` @ 0x00a1f628:
         0x00a1f62b  comiss xmm0(0), xmm1(timer)
         0x00a1f62e  jb 0xa1f642            ; CF=1 on unordered -> TAKEN
         0x00a1f633  mov dword [esi+0xd8],0 ; skipped when the jb is taken
       So a NaN timer is **kept**, not zeroed. The v8 helper returned 0.0f for
       NaN. Worse, it models the *same* instruction range as the v10 helper
       `rumble_vcall_timer`, which already had it right — and the v10 header
       comment rationalised the divergence as "distinct from timer_clamp_nonneg
       which zeros NaN". They are the same PE code; the v8 form was simply
       wrong. Both now agree, and the correct idiom already existed in this file
       as `pe_comiss_zero_below_or_unordered`.
     * **F10 CONFIRMED (audit said SUSPECTED), modelled.** FUN_00a6dd30
       recaptures BOTH the axis array base and the callback pointer after the
       x-lane callback returns:
         0x00a6dda1  edx = [edi+0x18]   ; base, pre-call
         0x00a6dda4  ecx = [0xc78d70]   ; callback, pre-call
         0x00a6dddd  call ecx           ; x-lane callback (opaque)
         0x00a6dddf  edx = [edi+0x18]   ; base RE-READ
         0x00a6dde5  ecx = [0xc78d70]   ; callback RE-READ
         0x00a6ddf0  y lane uses the reloaded edx / ecx
       The recapture happens **only on the path where the callback ran**; when
       the x gate skips (jnp 0x00a6ddbb / je 0x00a6ddbf) control reaches
       0x00a6ddf0 with the original edx/ecx. The v16 helpers never named a
       post-call recapture, so a driver could feed pre-call state to the y lane.
       xmm3 is also reloaded from the [ebp-0xc] spill at 0x00a6ddeb, so both
       lanes see the same timestamp value even though the callback clobbers it.
     * **F11 CONFIRMED (audit said SUSPECTED), modelled — and the real shape is
       sharper than "which snapshot the driver feeds".** In the a1f280 action
       push the PE straddles two opaque calls and refreshes exactly one field
       across each:
         0x00a1f4c9  mode_cc read #1 -> the idle gate
         0x00a1f4db  call [vtbl+0x3c]                      ; opaque
         0x00a1f4e4  mode_cc RE-READ #2 -> feeds the slot offset
         0x00a1f4ea  begin read #1 -> feeds the count/range check
         0x00a1f4f3  mode_cc spilled to [esp+0x10]
         0x00a1f4fc  index spilled to [esp+8]
         0x00a1f50e  call 0xa112c0 (OOR log)               ; opaque
         0x00a1f513  begin RE-READ (log path only)
         0x00a1f519  index restored from the SPILL, not re-read
         0x00a1f51d  mode_cc restored from the SPILL, not re-read
         0x00a1f524  store to [begin + (mode_cc + index*4)*4]
       So: the offset uses the POST-vcall mode_cc; the range check uses the
       PRE-log count; the store base is the post-log begin only when the log
       ran; and index/mode_cc are deliberately frozen across the log.
     * State-2 arm @ 0x009551a3 (the only table entry the frame path takes into
       Game::Update): gate byte Manager+0x4b130, the Manager+0x4abbc bit0 parity
       split, and the self-contained Game+0x18300 entity sweep at 0x009551f0.
       That sweep re-derives BOTH its array base ([container+0x125c]) and its
       bound ([container+0x1264]) every iteration, so it is modelled with a
       re-derived-bound step helper rather than a folded count.

   ABI v21 (the shell state table is now complete: the state-1 arm at
     0x009553a6, the state-2 arm head at 0x009551a3, the state-3/5 receivers,
     the pre-dispatch ladder that decides whether the table is consulted at all,
     and a COMPLETE translation of the leaf predicate FUN_009505e0 both arms
     gate on):
     * **FUN_009505e0 @ 0x009505e0…0x00950609 is fully translated.** It is a
       leaf: no calls, `int3` padding at 0x0095060a, next function 0x00950610.
         0x009505e0  cmp dword [ecx+0x1918],0 / je  0x9505f2
         0x009505e9  cmp byte  [ecx+0x1928],0 / jne 0x950604 -> al = 1
         0x009505f2  cmp dword [ecx+0x1b6c],0 / je  0x950607 -> al = 0
         0x009505fb  cmp byte  [ecx+0x1b7c],0 / je  0x950607 -> al = 0
         0x00950604  mov al,1 / ret          0x00950607 xor al,al / ret
       So the result is `(A && B) || (C && D)`, and the widths are MIXED on
       purpose: 0x1918 / 0x1b6c are dword tests, 0x1928 / 0x1b7c are byte tests.
       A field holding 0x100 is true as a dword and false as a byte. The B pair
       is not read at all when the A pair already succeeded (short circuit).
       Receiver is Manager+0x4b3d8 at both callsites, so the Manager-relative
       offsets are 0x4ccf0 / 0x4cd00 / 0x4cf44 / 0x4cf54.
       Whole-.text rel32 census: **exactly 2 callers**, 0x009551b4 (state-2 arm)
       and 0x009553c7 (state-1 arm). Translating it removes a host edge that
       exists only to gate these two arms.
     * **State-1 arm @ 0x009553a6…0x009553d5.**
         0x009553a6  lea ecx,[edi+0x4d070] / call 0x9c3990   ; host probe
         0x009553b1  test al,al
         0x009553b3  mov eax,[0xc72a20]        ; flags NOT touched by mov
         0x009553b8  sete cl                   ; cl = (probe_al == 0)
         0x009553bb  cmp dword [eax+0x40],0x11 ; raw bytes `83 78 40 11`
         0x009553bf  je 0x9553c5               ; mode match forces entry
         0x009553c1  test cl,cl / je 0x9553ef  ; else require probe_al == 0
         0x009553c5  mov ecx,esi / call 0x9505e0
         0x009553cc  test al,al / jne 0x9553ef ; a set predicate SKIPS the call
         0x009553d0  call 0x9897d0             ; single-callsite terminal
       Two details a plausible reading gets wrong: the `[0xc72a20]` load and the
       `[eax+0x40]` dereference are UNCONDITIONAL — they happen on every state-1
       entry, including the ones that immediately leave for the default arm —
       and the gate is a DISJUNCTION (`mode == 0x11` OR `probe_al == 0`), not
       the conjunction the sibling arm's single `jne` suggests.
     * **State-2 arm head @ 0x009551a3…0x009551c2** (the gap v20 left below its
       own `state2_blocked` helper): the same probe call, then plain
       `test al,al / jne` — no mode disjunct — then the same FUN_009505e0 gate,
       then the single-callsite terminal FUN_006fa540. Byte-diffing the two
       ladders gives only **7 identical leading bytes** (the receiver `lea` plus
       the `e8` opcode): they are siblings in shape, NOT a byte template, so
       they are modelled as two helpers with an asserted agreement law — they
       agree on every input EXCEPT when the state-1 mode dword equals 0x11.
     * **State-3 / state-5 arms** are one receiver `lea` plus one single-callsite
       host call each (Manager+0x20dd0 -> 0x0095df20, Manager+0x21628 ->
       0x00920510). State 4 has no arm body at all; its table slot is the
       default VA. Every table entry now has a modelled entry point.
     * **Pre-dispatch ladder @ 0x0095514a…0x00955189** — a textbook conditional
       recapture:
         0x0095514a  eax = [Manager+0x21c38]        ; read #1
         0x00955150  ecx = Manager+0x21c1c          ; receiver, computed always
         0x00955156  test eax,eax / je  0x95518f    ; null -> dispatch
         0x0095515a  cmp byte [Manager+0x29fb8],0
         0x00955161  jne 0x95516e                   ; skips the call AND the reload
         0x00955163  call 0x931ba0                  ; opaque
         0x00955168  eax = [Manager+0x21c38]        ; RE-READ, call path only
         0x0095516e  test eax,eax / je  0x95518f
         0x00955172  cmp byte [Manager+0x29fb8],0 / jne 0x95518f   ; byte re-read
         0x0095517b  cmp dword [Manager+0x2a378],1 / jne 0x95518f  ; dword vs 1
         0x00955184  eax = [esi] / cmp eax,[esi+4] / je 0x9553ef
       The last gate is the only one that goes to the DEFAULT arm rather than to
       the dispatch, and `esi` is Manager+0x4b3d8 (every path into 0x00955134
       has already set it), so it compares two adjacent dwords of the same block
       FUN_009505e0 reads. "Always after" the call is as wrong as "always
       before": both skip paths keep read #1.
     * FUN_009c3990 (the probe both arms open with) gets its pure islands only.
       It locks via `call [[this+8]+0xc]` with a pushed `-1`, walks the circular
       list at [this] using the head as sentinel, sets its result from
       `test byte [[node+8]+0x24],4` at the FIRST match, then always unlocks via
       `call [[this+8]+0x10]` on both exits. The two vcalls and the guest list
       memory stay host; the match bit, the sentinel walk and the first-match
       stop are pure. 5 rel32 callers, 2 of them these arms.
     * Reachability defect recorded, not corrected: if g_Game (DAT_00c71678) is
       null and the shell still reaches the state-2 arm, 0x009551d8/0x00955246
       dereference it with no null test and the PE faults. The null check at
       0x009550c9 only diverts to 0x0095512e, which falls into the same
       dispatch. Do not add a guard the original does not have.

   ABI v21 also closes a CLASS-WIDE toolchain defect in this family (no PE
     reinterpretation; the translations were right, the shipped module was not):
     * **Narrow scalar parameters ship an unmasked comparison.** The Wasm ABI
       does not narrow an i32 argument, and -O2 deletes an in-body mask it can
       prove redundant for a `uint8_t` / `uint16_t` parameter. Every byte gate
       declared with a narrow parameter therefore compared the caller's full 32
       bits where the PE compares one byte. Direct probe of the built module:
       **53 of the 61** former `uint8_t` scalar parameters were divergent
       (`f(x) != f(x & 0xff)`), plus **6** sites in the 16-bit class
       (`uint16_t` / `int16_t`). The differential could not see any of it,
       because every Wasm-side argument was pre-masked before the call.
       Fix: every scalar byte/word parameter is now `uint32_t` / `int32_t` with
       an explicit narrowing in the body (`(v & 0xffu)`, `(v & 0xffffu)`, or an
       explicit `<<16 >>16` sign extension), the shared idiom lives in one
       place (`nonzero_u8`), and the section test scans the header so the class
       cannot come back one declaration at a time.
       Newly pinned PE facts found while doing this:
         - `isaac_manager_poll_prefix_needed` models `80 7d 08 00` at
           0x00954f4d = `cmp BYTE ptr [ebp+8],0`. The shell's stack argument is
           four bytes wide but only its low byte is tested.
         - the `present_*` inputs of FUN_006f9400/FUN_006f95a0 are produced by
           `setne bl` (0x006f9461), not re-read from memory, so they are 0/1 by
           construction and the narrowing is provably equivalent there;
         - `_nz` parameters (`press_cb_nz`, `release_cb_nz`, `cb_nz`) are
           pre-reduced presence flags. The PE's own test is `test ecx,ecx` on a
           POINTER, so a driver must reduce to 0/1 before calling; passing a raw
           pointer is a contract violation, not something the helper narrows for.
         - `isaac_manager_poll_a1fc00_entry_mark_active` returns `uint16_t`, and
           that return narrowing subsumes its parameter mask — recorded as an
           equivalence, with the 16-bit result range pinned instead.
       Manager+0x4b3d8 note: `edi` in the shell is `[0xc7169c]`, loaded at
       0x00954cec — a different global from g_Game (`[0xc71678]`) and from the
       state-1 mode global (`[0xc72a20]`). Three distinct globals; keep separate.
   */

enum { ISAAC_PROCESS_INPUT_PURE_HELPERS_ABI_VERSION = 52 };


/* Action IDs looked up on Game+0x1bbd8 map (host 0x004288a0). */
enum {
  ISAAC_INPUT_MASK_A_ID_38 = 0x38,
  ISAAC_INPUT_MASK_A_ID_39 = 0x39,
  ISAAC_INPUT_MASK_A_ID_3A = 0x3a,
  ISAAC_INPUT_MASK_A_ID_3B = 0x3b,
  ISAAC_INPUT_MASK_A_ID_3C = 0x3c,
  ISAAC_INPUT_MASK_A_ID_3D = 0x3d,
  ISAAC_INPUT_MASK_A_ID_3E = 0x3e,
  ISAAC_INPUT_MASK_B_ID_3F = 0x3f,
  ISAAC_INPUT_MASK_B_ID_40 = 0x40,
  ISAAC_INPUT_MASK_B_ID_41 = 0x41,
  ISAAC_INPUT_MASK_B_ID_42 = 0x42,
  ISAAC_INPUT_MASK_B_ID_43 = 0x43,
  ISAAC_INPUT_MASK_B_ID_44 = 0x44,
  ISAAC_INPUT_MASK_B_ID_46 = 0x46,
  ISAAC_INPUT_MASK_B_ID_4F = 0x4f
};

/* Bit values OR'd into the returned mask (PE immediates). */
enum {
  ISAAC_INPUT_MASK_BIT0 = 0x01,
  ISAAC_INPUT_MASK_BIT1 = 0x02,
  ISAAC_INPUT_MASK_BIT2 = 0x04,
  ISAAC_INPUT_MASK_BIT3 = 0x08,
  ISAAC_INPUT_MASK_BIT4 = 0x10,
  ISAAC_INPUT_MASK_BIT5 = 0x20,
  ISAAC_INPUT_MASK_BIT6 = 0x40,
  /* 0x46 present path: cmovne ebx, 0x7f */
  ISAAC_INPUT_MASK_B_ID_46_FORCE = 0x7f
};

/* Mode excluded from 6f9400 bit1 (action 0x39) — Game+0x26584 == 0x2c. */
enum { ISAAC_INPUT_MASK_A_GATE39_MODE_EXCLUDE = 0x2c };

/* Stage upper bound exclusive for gate39 — cmp edx, 8 / jge skip. */
enum { ISAAC_INPUT_MASK_A_GATE39_STAGE_MAX = 8 };

/* v109 dedupe: the FUN_006f9400 / FUN_006f95a0 law bodies (gate39 / mask /
   mask_full / 6f95a0) are OWNED by the render-shell family
   (isaac_render_shell_6f9400_* / isaac_render_shell_6f95a0_mask, ABI v31;
   the render-slice build links render_shell_pure_helpers.cpp and consumes
   them by name). This family keeps the INPUT_MASK_* constants + host VAs
   below and pins the RShell export semantics BY REFERENCE in the suite;
   NO duplicate law exports. See section-notes/update-v109-dupva-dedupe/. */
enum {
  ISAAC_INPUT_MASK_6F9400_HOST_VA = 0x006f9400u,
  ISAAC_INPUT_MASK_6F95A0_HOST_VA = 0x006f95a0u
};

/* Manager shell early-skip outcomes (VA 0x00954cd0 head, peSignedMod2 path). */
enum {
  ISAAC_MANAGER_EARLY_CONTINUE = 0,     /* fall through into shell body */
  ISAAC_MANAGER_EARLY_RETURN_SILENT = 1, /* 4abc4!=0 && 4abc5==0 full return */
  ISAAC_MANAGER_EARLY_RETURN_INC = 2    /* counter_4abbc++ then return */
};

/* DAT_00baa7a4 — Manager 2-slot float approach step (bits). */
enum { ISAAC_MANAGER_FLOAT_APPROACH_STEP_BITS = 0x40c00000u }; /* 6.0f */

/* ---------------------------------------------------------------------------
 * Map-node present predicate (shared by both masks)
 *   PE after lower_bound result in eax:
 *     cmp byte ptr [eax+0xd], 0     ; _Isnil
 *     jne  not_present
 *     cmp dword ptr [eax+0x10], id  ; key
 *     jg   not_present
 *     ; present
 * isnil_0d: byte at node+0xd (0 = live node).
 * key_10:   dword at node+0x10.
 * action_id: search key just pushed.
 * Returns 1 when the PE present branch is taken.
 * --------------------------------------------------------------------------- */
int32_t isaac_input_map_node_present(uint32_t isnil_0d, int32_t key_10,
                                     int32_t action_id);

/* v109 dedupe: the FUN_006f9400 / FUN_006f95a0 law DECLS were REMOVED here
   (gate39 / mask / mask_full / 6f95a0) — OWNED by the render-shell family
   (isaac_render_shell_6f9400_* / isaac_render_shell_6f95a0_mask, ABI v31;
   the render-slice build links render_shell_pure_helpers.cpp and consumes
   them by name). ISAAC_INPUT_MASK_6F9400_HOST_VA / _6F95A0_HOST_VA + the
   INPUT_MASK_* constants remain. See section-notes/update-v109-dupva-dedupe/. */

/* Consumer pure combine used by render shell / H7 (already in render_shell as
   fade_poll_selects_one for bit0). Full mask form:
     (~mask_b & (mask_a | mgr_or))
 * Returns the combined dword (not just bit0). */
uint32_t isaac_input_mask_combine(uint32_t mask_a, uint32_t mask_b,
                                  uint32_t mgr_or);

/* ---------------------------------------------------------------------------
 * InputManager::GetDeviceType pure range membership (VA 0x00a6f620).
 * Exact ZHL at this VA. Host residual (not peeled):
 *   lock  vcall [this+0x10].vtbl+0x0c(-1)
 *   unlock vcall [this+0x10].vtbl+0x10()
 * Pure island after lock, before unlock:
 *   circular list at this+0x1c; each node+8 → {start u32, count u32 at +8}
 *   unsigned: controlleridx >= start && controlleridx < start+count (wrap add)
 *   first match → return 1; exhaust → return 0
 * PE returns AL 0/1 (int-compatible).
 * --------------------------------------------------------------------------- */
int32_t isaac_input_device_range_contains(uint32_t controlleridx, uint32_t start,
                                         uint32_t count);

/* Walk n pre-captured ranges in list order (starts[i], counts[i]).
 * Returns 1 on first containing range, else 0. n==0 → 0.
 * starts/counts may be null only when n==0. */
int32_t isaac_input_get_device_type_ranges(uint32_t controlleridx,
                                          const uint32_t* starts,
                                          const uint32_t* counts, uint32_t n);

/* ---------------------------------------------------------------------------
 * FUN_006f9730 complete pure (VA 0x006f9730 … ret). No CALLs.
 * thiscall on g_Game (Manager sets ecx = DAT_00c71678 before call).
 *   xorps xmm0,xmm0
 *   comiss xmm0, [Game+0x26598]   ; timed transition progress
 *   jb  → 0                      ; CF if 0 < f32 OR unordered (NaN)
 *   [Game+0x1ba78] == 0
 *   [Game+0x1d520] == 0
 *   [Game+0x25954] == 0          ; byte
 *   [Game+0x1d654] == 0
 *   → return 1 else 0
 * Manager uses: if (result==0) early-return that branch.
 * --------------------------------------------------------------------------- */
int32_t isaac_manager_gate_6f9730(float game_26598, int32_t game_1ba78,
                                  int32_t game_1d520, uint32_t game_25954,
                                  int32_t game_1d654);

/* ---------------------------------------------------------------------------
 * Manager shell early skip (VA 0x00954cd0 head after cookie/g_Manager load).
 *   pe_signed_mod2(counter_4abbc) == 1  &&  flag_2a3c0 == 0:
 *     if flag_4abc4 != 0 && flag_4abc5 == 0 → EARLY_RETURN_SILENT
 *     else → EARLY_RETURN_INC  (caller stores counter+1)
 *   else → EARLY_CONTINUE
 * Does not mutate; pair with isaac_manager_early_counter_next on INC.
 * --------------------------------------------------------------------------- */
int32_t isaac_manager_update_early_skip(int32_t counter_4abbc,
                                        uint32_t flag_2a3c0, uint32_t flag_4abc4,
                                        uint32_t flag_4abc5);

/* PE: counter_4abbc + 1 (dword wrap). */
int32_t isaac_manager_early_counter_next(int32_t counter_4abbc);

/* ---------------------------------------------------------------------------
 * Manager post-poll float approach (VA 0x00954fc0…0x00955007 loop body).
 *   add_path = !(current > target)            ; comiss + jbe (unordered too)
 *   next     = add_path ? current + step : current - step
 *   keep     = add_path ? !(next > target) : !(target > next)   ; cmovbe
 *   result   = keep ? next : target
 * For ordered values this is the min/max clamp the ABI v2 text described; a
 * NaN on either side takes the add path and keeps `next` (ABI v19 correction).
 * step default = 6.0f (DAT_00baa7a4). The host FUN_00424130 call is gated on
 * the slot mode dword at +0x10 being != 0x20 (see approach helpers below).
 * --------------------------------------------------------------------------- */
float isaac_manager_float_approach(float current, float target, float step);

/* ---------------------------------------------------------------------------
 * Manager poll-prefix gate (VA 0x00954e?? inside 0x00954cd0).
 *   PE: if (param_1 != 0) { platform poll pair; FUN_00a6de60; FUN_00a1fc00; }
 * Returns 1 when the host poll prefix runs.
 * --------------------------------------------------------------------------- */
int32_t isaac_manager_poll_prefix_needed(uint32_t param1);

/* ---------------------------------------------------------------------------
 * Platform branch inside poll prefix (VA 0x00954cd0).
 *   PE: if (DAT_00c73680 == 0) FUN_00a69f60(0x10001,0); else (*DAT_00c7378c)();
 * Returns 1 when the a69f60 path is taken (flag == 0).
 * --------------------------------------------------------------------------- */
int32_t isaac_manager_poll_platform_uses_a69f60(uint32_t flag_c73680);

/* ---------------------------------------------------------------------------
 * FUN_00a6de60 pure body entry (VA 0x00a6de8e … 0x00a6deba).
 *   enabled_c7e300: byte DAT_00c7e300 (0 → skip entire function body)
 *   reenter_c9ba98: byte DAT_00c9ba98 (nonzero → skip; already in poll)
 * Returns 1 when PE falls through to set reenter=1 and compute the vector.
 * Does not mutate; host applies reenter store when body runs.
 * --------------------------------------------------------------------------- */
int32_t isaac_manager_poll_a6de60_body_needed(uint32_t enabled_c7e300,
                                             uint32_t reenter_c9ba98);

/* ---------------------------------------------------------------------------
 * FUN_00a6de60 device-vector length (VA 0x00a6dea8 … 0x00a6deb9).
 *   PE: mov eax, end; sub eax, begin; sar eax, 2
 * end/begin are the raw dwords at DAT_00c79bf0 / DAT_00c79bec (pointers as
 * int32 bit patterns). Uses 32-bit wrap then arithmetic right shift.
 * --------------------------------------------------------------------------- */
int32_t isaac_manager_poll_a6de60_vector_count(int32_t end_c79bf0,
                                              int32_t begin_c79bec);

/* ---------------------------------------------------------------------------
 * FUN_00a6de60 loop entry after reenter=1 (VA 0x00a6dec7).
 *   PE: test eax,eax / je clear-reenter-epilog
 * Returns 1 when the host device walk runs (count != 0).
 * --------------------------------------------------------------------------- */
int32_t isaac_manager_poll_a6de60_loop_needed(int32_t vector_count);

/* ---------------------------------------------------------------------------
 * ABI v4 — pure islands inside residual device walk (VA 0x00a6ded0 …).
 * Host still owns IAT/query, QPC, callbacks, COM, 0x00a6da10 / 0x00a6dd30.
 * --------------------------------------------------------------------------- */

/* Device object enable flag at [device_state+0] (ebx from device+0x20).
 * PE VA 0x00a6dedc: cmp byte [ebx],0 / je alternate path.
 * Returns 1 when the primary poll path runs (byte != 0). */
int32_t isaac_manager_poll_a6de60_device_enabled(uint32_t flag_byte);

/* Query/status return (edx after IAT/query). PE VA 0x00a6df3d:
 *   test edx,edx / jne error (0x00a6e6e7).
 * Returns 1 when status == 0 (success → button/axis pure body). */
int32_t isaac_manager_poll_a6de60_query_ok(int32_t status);

/* Button state bit: (state_word >> shift) & 1. PE unrolled for slots 0..0xe
 * with slot→shift map (see button_slot_shift). Low byte of result. */
uint8_t isaac_manager_poll_a6de60_button_bit(uint32_t state_word,
                                             uint32_t shift);

/* Slot 0..0xe → PE shift imm for the unrolled first-path button block.
 * Unknown slot → 0xffffffff. Map (PE):
 *   0..9 → self; 0xa→0xc; 0xb→0xd; 0xc→0xe; 0xd→0xf; 0xe→0xa */
uint32_t isaac_manager_poll_a6de60_button_slot_shift(uint32_t slot);

/* Button edge decision after comparing new_bit vs old_bit (bytes 0/1).
 * PE: if equal → skip; else store then:
 *   new!=0 → press cb (DAT_00c78d78) if nonnull
 *   new==0 → release cb (DAT_00c78d74) if nonnull
 * press_cb_nz / release_cb_nz are 0/nonzero presence flags (not pointers). */
enum {
  ISAAC_A6DE60_EDGE_NONE = 0,    /* no change */
  ISAAC_A6DE60_EDGE_PRESS = 1,   /* host call press callback */
  ISAAC_A6DE60_EDGE_RELEASE = 2, /* host call release callback */
  ISAAC_A6DE60_EDGE_SILENT = 3   /* store only; callback null */
};
int32_t isaac_manager_poll_a6de60_button_edge(uint32_t new_bit, uint32_t old_bit,
                                              uint32_t press_cb_nz,
                                              uint32_t release_cb_nz);

/* Axis normalize from signed 16-bit sample (PE movsx word + 0x8000 path).
 *   f = (float)(raw + 0x8000); f /= 65535.0f; f = f+f; f -= 1.0f
 * Constants: DAT_00baac6c=65535.0f, DAT_00baa454=1.0f. */
float isaac_manager_poll_a6de60_axis_normalize_i16(int32_t raw);

/* Axis normalize from unsigned 8-bit sample (POV/slider-style path).
 *   f = (float)raw; f /= 127.5f; f -= 1.0f
 * Constant: DAT_00baaa10=127.5f. */
float isaac_manager_poll_a6de60_axis_normalize_u8(uint32_t raw);

/* PE ucomiss new, old; lahf; test ah,0x44; jnp skip.
 * Returns 1 when NOT ordered-equal (inequality or NaN) — callback candidate. */
int32_t isaac_manager_poll_a6de60_float_changed(float new_v, float old_v);

/* Axis/button float callback runs when float_changed && cb_nz. */
int32_t isaac_manager_poll_a6de60_float_callback_needed(float new_v,
                                                        float old_v,
                                                        uint32_t cb_nz);

/* DirectInput HRESULT reacquire set (disabled-device path VA 0x00a6e70b):
 *   0x8007001e (DIERR_INPUTLOST) or 0x8007000c (DIERR_NOTACQUIRED). */
/* Stored as uint32 immediates (HRESULT high bit set). */
enum {
  ISAAC_A6DE60_DIERR_INPUTLOST = (int32_t)0x8007001e,
  ISAAC_A6DE60_DIERR_NOTACQUIRED = (int32_t)0x8007000c
};
int32_t isaac_manager_poll_a6de60_dierr_reacquire(uint32_t hresult);

/* Unsigned loop continue: after index++, PE cmp index, count / jb body.
 * Returns 1 when (index + 1) < count (32-bit wrap on add). */
int32_t isaac_manager_poll_a6de60_index_continue(uint32_t index,
                                                 uint32_t count);

/* Axis type dispatch (VA 0x00a6ead6 … jump table 0x00a6eee0).
 * PE: cmp type, 0x2c / ja skip; movzx table[type]; jmp [jtable+al*4]
 * Byte table: type%4==0 → type/4 (0..11); else 12 (default/skip).
 * Returns 0..11 for axis handlers, 12 for default, 13 for type > 0x2c. */
enum {
  ISAAC_A6DE60_AXIS_TYPE_MAX = 0x2c,
  ISAAC_A6DE60_AXIS_DISPATCH_DEFAULT = 12,
  ISAAC_A6DE60_AXIS_DISPATCH_OOR = 13
};
int32_t isaac_manager_poll_a6de60_axis_type_dispatch(uint32_t type);

/* Outer device-vector continue after one device (VA 0x00a6eea3 … 0x00a6eeb7):
 *   edi' = edi+1; recount = SAR(end-begin,2); continue if edi' < recount.
 * Uses same SAR32 vector_count as the entry helper. */
int32_t isaac_manager_poll_a6de60_device_continue(uint32_t device_index,
                                                  int32_t end_c79bf0,
                                                  int32_t begin_c79bec);

/* ---------------------------------------------------------------------------
 * ABI v5 — pure islands on residual IAT/query path (VA 0x00a6dee5+) and
 * freestanding pure math of CRT 0x00aefe80 / FUN_00a6dd30 POV head.
 * Host still owns the actual IAT/query CALLs, QPC IAT, COM, callbacks.
 * --------------------------------------------------------------------------- */

/* VA 0x00a6dee5: DAT_00c7e29c != 0 → call hook; else IAT [0xc7e2dc].
 * Returns 1 when the hook path is taken. */
int32_t isaac_manager_poll_a6de60_query_uses_hook(uint32_t hook_fn_c7e29c);

/* VA 0x00a6df45 / 0x00a6e9f0: (freq_lo | freq_hi) == 0 → QueryPerformanceFrequency.
 * Returns 1 when the host frequency init CALL runs. */
int32_t isaac_manager_poll_a6de60_qpc_freq_init_needed(uint32_t freq_lo_c9ba90,
                                                      uint32_t freq_hi_c9ba94);

/* CRT VA 0x00aefe80 legacy portable path (CPU feature < 6 branch):
 *   lo/hi are ECX/EDX bit patterns of a 64-bit counter (signed i64 halves).
 *   f64 = (i32)lo + (lo>>31 ? 2^32 : 0) + (i32)hi * 2^32
 * AVX vcvtqq2pd path is host/CPU-feature residual; this helper matches the
 * always-correct portable sequence used when feature level < 6 and for
 * practical QPC ranges where signed/unsigned 64-bit agree (< 2^63). */
double isaac_manager_poll_a6de60_u64_to_f64(uint32_t lo, uint32_t hi);

/* Post-QPC pure: seconds = f32_roundtrip(counter_f64 / freq_f64).
 * PE: divsd; cvtpd2ps; cvtps2pd → store f64 with f32 precision. */
double isaac_manager_poll_a6de60_qpc_seconds_f64(uint32_t counter_lo,
                                                 uint32_t counter_hi,
                                                 uint32_t freq_lo,
                                                 uint32_t freq_hi);

/* COM/DI path: test eax,eax / jns success (signed hr >= 0).
 * Distinct from query_ok (==0 only). */
int32_t isaac_manager_poll_a6de60_com_succeeded(int32_t hresult);

/* Disabled-device path VA 0x00a6e72b: byte [state+0x18] != 0 → buffered DIDOD
 * path; else GetDeviceState-style path @ 0x00a6e9a1. */
int32_t isaac_manager_poll_a6de60_buffered_mode(uint32_t flag_18);

/* DIDOD alloc size VA 0x00a6e793…0x00a6e7ab:
 *   size = count * 0x14; on unsigned 32-bit mul overflow → 0xffffffff. */
enum { ISAAC_A6DE60_DIDOD_STRIDE = 0x14 };
uint32_t isaac_manager_poll_a6de60_didod_alloc_size(uint32_t count);

/* Buffered-event timestamp → seconds f64 (VA 0x00a6e820…0x00a6e842):
 *   u32→f64 via signed cvtdq2pd + DAT_00bacb00 bias; / DAT_00baa770 (1000.0). */
double isaac_manager_poll_a6de60_timestamp_to_seconds_f64(uint32_t timestamp);

/* Buffered button: test reg / setne → 0/1 (VA 0x00a6e83d / 0x00a6ea6b). */
uint8_t isaac_manager_poll_a6de60_nonzero_bit(uint32_t value);

/* FUN_00a6dd30 pure head (VA 0x00a6dd30 … before float store @ 0x00a6dda1):
 * DirectInput POV/hat dword → two quantized axis floats in {-1,0,+1}.
 * Low word 0xffff → centered (0,0) (`cmp ax,cx` — 16-bit compare; the later
 * threshold compares use the full 32-bit dword). Thresholds: 0x2328 / 0x4650 /
 * 0x6978 (9000 / 18000 / 27000 hundredths of degrees). Callbacks remain host;
 * the store offsets/gates are ABI v16 helpers below.
 * v16 correction: axis1 at pov == 0x6978 is 0.0f (PE `cmp eax,0x6978 / jb`
 * falls through to `xorps xmm0` @ 0x00a6de50), not +1.0f. */
enum {
  ISAAC_A6DE60_POV_CENTER_LO16 = 0xffff,
  ISAAC_A6DE60_POV_EAST = 0x2328,   /* 9000 */
  ISAAC_A6DE60_POV_SOUTH = 0x4650,  /* 18000 */
  ISAAC_A6DE60_POV_WEST = 0x6978    /* 27000 */
};
float isaac_manager_poll_a6de60_pov_axis0(uint32_t pov);
float isaac_manager_poll_a6de60_pov_axis1(uint32_t pov);

/* ---------------------------------------------------------------------------
 * ABI v6 — pure islands after residual query CALLs (0x00a6def6 / 0x00a6df35)
 * and freestanding pure math of FUN_00a6da10 / FUN_00a648b0.
 * Host still owns the IAT/hook CALLs, CRT free/memmove, malloc IAT, callbacks.
 * --------------------------------------------------------------------------- */

/* Compact state size written by hook repack (and consumed by button/axis path). */
enum { ISAAC_A6DE60_HOOK_COMPACT_DWORDS = 3 }; /* 12 bytes */

/* PE 0x00a6def8…0x00a6df2e after hook CALL @ 0x00a6def6.
 * Hook buffer (base lea [ebp-0x34]) fields → three little-endian dwords of the
 * compact state at [ebp-0x1c] (IAT path fills the same layout in place at
 * buffer+4 without this repack):
 *   dw0 = u16(src+4) | (u8(src+6)<<16) | (u8(src+7)<<24)
 *   dw1 = u16(src+8) | (u16(src+0xa)<<16)
 *   dw2 = u16(src+0xc) | (u16(src+0xe)<<16)
 * out_dwords may be null (no-op). Writes exactly 3 dwords when non-null. */
void isaac_manager_poll_a6de60_hook_repack(uint32_t src_u16_4, uint32_t src_u8_6,
                                          uint32_t src_u8_7, uint32_t src_u16_8,
                                          uint32_t src_u16_a, uint32_t src_u16_c,
                                          uint32_t src_u16_e,
                                          uint32_t* out_dwords);

/* Scalar forms of the three compact dwords (same PE pack). */
uint32_t isaac_manager_poll_a6de60_hook_repack_dw0(uint32_t src_u16_4,
                                                   uint32_t src_u8_6,
                                                   uint32_t src_u8_7);
uint32_t isaac_manager_poll_a6de60_hook_repack_dw1(uint32_t src_u16_8,
                                                   uint32_t src_u16_a);
uint32_t isaac_manager_poll_a6de60_hook_repack_dw2(uint32_t src_u16_c,
                                                   uint32_t src_u16_e);

/* DIDOD / axis-map ofs match: event.dwOfs == mapped_ofs (unsigned).
 * PE cmp/jne @ 0x00a6e81b (button map [ecx+edi*4]) and 0x00a6e8ab
 * (axis map [ecx+edi*8]). Returns 1 on match. */
int32_t isaac_manager_poll_a6de60_didod_ofs_match(uint32_t event_ofs,
                                                  uint32_t mapped_ofs);

/* Axis map entry type byte at [entry+4]: nonzero → POV path (FUN_00a6dd30);
 * zero → i16 axis normalize path. PE @ 0x00a6e8c2. */
int32_t isaac_manager_poll_a6de60_axis_map_is_pov(uint32_t type_byte_4);

/* Query-fail path @ 0x00a6e6ec: table slot store value is always 0 (pure
 * immediate). Host owns DAT_00c7e2e0[device_id] write. Returns 0. */
int32_t isaac_manager_poll_a6de60_query_fail_clear_value(void);

/* After a6da10 remove in fail/disabled paths: edi' = edi - 1 (32-bit wrap).
 * PE dec edi @ 0x00a6e6fc / 0x00a6e78d / 0x00a6e7e6 / 0x00a6e9ea. */
int32_t isaac_manager_poll_a6da10_index_after_remove(int32_t index);

/* FUN_00a6da10: disconnect callback runs when DAT_00c78d7c != 0. */
int32_t isaac_manager_poll_a6da10_disconnect_cb_needed(uint32_t cb_c78d7c);

/* FUN_00a6da10: free COM maps / extra heap when device enable byte == 0
 * (same sense as !device_enabled). PE cmp byte [edi],0 / jne skip @ 0x00a6da51. */
int32_t isaac_manager_poll_a6da10_free_com_maps(uint32_t enable_byte);

/* FUN_00a6da10 memmove byte count before CRT 0x00af08bd:
 *   slot = begin + index*4; size = end - (slot + 4)  (32-bit wrap both ops).
 * PE @ 0x00a6da84…0x00a6da94. */
uint32_t isaac_manager_poll_a6da10_remove_move_bytes(uint32_t end_c79bf0,
                                                    uint32_t begin_c79bec,
                                                    uint32_t index);

/* FUN_00a6da10: DAT_00c79bf0' = end - 4 (32-bit wrap). PE @ 0x00a6da9f. */
uint32_t isaac_manager_poll_a6da10_end_after_remove(uint32_t end_c79bf0);

/* FUN_00a648b0 CL mode (PE movzx/sub cascade @ 0x00a648c7…):
 *   0 → alloc, 1 → free, 2 → account add, else → nop return 0. */
enum {
  ISAAC_A648B0_MODE_ALLOC = 0,
  ISAAC_A648B0_MODE_FREE = 1,
  ISAAC_A648B0_MODE_ACCOUNT = 2,
  ISAAC_A648B0_MODE_NOP = 3
};
int32_t isaac_manager_poll_a648b0_mode(uint32_t cl);

/* FUN_00a648b0 alloc pure size for malloc IAT (PE @ 0x00a6490f…0x00a64934):
 *   if size_hi != 0 → treat size_lo as 0; then malloc_size = size_lo + 4
 *   (32-bit wrap; only low dword is pushed). Host owns malloc IAT + header
 *   store + tracker add. */
uint32_t isaac_manager_poll_a648b0_alloc_malloc_size(uint32_t size_lo,
                                                    uint32_t size_hi);

/* 64-bit tracker subtract size (PE free path @ 0x00a648f9 / sbb):
 *   lo' = lo - size; hi' = hi - borrow. Writes *out_lo / *out_hi when non-null. */
void isaac_manager_poll_a648b0_tracker_sub_size(uint32_t tracker_lo,
                                                uint32_t tracker_hi,
                                                uint32_t size,
                                                uint32_t* out_lo,
                                                uint32_t* out_hi);

/* 64-bit tracker add of (add_lo, add_hi) (PE account path @ 0x00a648d9 / adc). */
void isaac_manager_poll_a648b0_tracker_add(uint32_t tracker_lo,
                                           uint32_t tracker_hi,
                                           uint32_t add_lo, uint32_t add_hi,
                                           uint32_t* out_lo, uint32_t* out_hi);

/* ---------------------------------------------------------------------------
 * ABI v7 — pure islands inside Manager poll sibling FUN_00a1fc00 (VA 0x00a1fc00
 * … ret 0x00a20018) and freestanding pure math of residual callee FUN_00a1f280.
 * this = 0x00c57b18 at Manager callsite 0x00954f78. No ProcessInput pin.
 * Host still owns lock/unlock vcalls, a1f280 CRT/vcall body, shared_ptr
 * copy/notify, erase/grow helpers, free IAT.
 * --------------------------------------------------------------------------- */

/* Element stride of the this+8..this+0xc queue (pair of dwords / shared_ptr). */
enum { ISAAC_A1FC00_QUEUE_STRIDE = 8 };

/* Free-slot table entry stride at this+0x20 (key dword @ +0, payload @ +4). */
enum { ISAAC_A1FC00_SLOT_STRIDE = 8 };

/* Pending-buffer free uses MSVC heap header when size >= 0x1000. */
enum {
  ISAAC_A1FC00_FREE_HEADER_THRESHOLD = 0x1000,
  ISAAC_A1FC00_FREE_HEADER_ADD = 0x23,
  ISAAC_A1FC00_FREE_HEADER_OFFSET_MAX = 0x1f
};

/* Slot-find result when no free key (PE falls through to skip-alive). */
enum { ISAAC_A1FC00_SLOT_FULL = 0xffffffffu };

/* Axis deadzone direction bits OR'd into device+0x30 (FUN_00a1f280).
 * Pair0 (vcall arg 0): bit0 neg-x, bit1 pos-x, bit2 neg-y, bit3 pos-y.
 * Pair1 (vcall arg 1): same layout shifted +4 (0x10/0x20/0x40/0x80). */
enum {
  ISAAC_A1F280_DIR_NEG_X = 0x1,
  ISAAC_A1F280_DIR_POS_X = 0x2,
  ISAAC_A1F280_DIR_NEG_Y = 0x4,
  ISAAC_A1F280_DIR_POS_Y = 0x8
};

/* VA 0x00a1fc55…0x00a1fc64: lock object at this+0x14.
 * Returns 1 when PE takes the vcall lock path (ptr != 0). */
int32_t isaac_manager_poll_a1fc00_lock_obj_present(uint32_t lock_ptr);

/* VA 0x00a1fc87…0x00a1fc8d: queue walk runs when begin != end. */
int32_t isaac_manager_poll_a1fc00_queue_loop_needed(uint32_t begin_8,
                                                    uint32_t end_c);

/* Queue element count: SAR32(end - begin, 3) with 32-bit wrap (sibling body
 * at 0x00a2006b on the same this layout). */
int32_t isaac_manager_poll_a1fc00_queue_count(int32_t end_c, int32_t begin_8);

/* VA 0x00a1fdd5: test byte [entry+8], 1 / jne skip — already active. */
int32_t isaac_manager_poll_a1fc00_entry_already_active(uint32_t flags_byte_8);

/* VA 0x00a1fe86: or word [entry+8], 1 — return new flags word. */
uint16_t isaac_manager_poll_a1fc00_entry_mark_active(uint32_t flags_word_8);

/* VA 0x00a1fdee…0x00a1fdfb: DAT_00c799f4 != 0 → free-slot scan runs. */
int32_t isaac_manager_poll_a1fc00_slot_table_usable(uint32_t count_c799f4);

/* VA 0x00a1fe07: dword key at table[index*8] == 0 → free. */
int32_t isaac_manager_poll_a1fc00_slot_is_free(uint32_t key_dword);

/* Unsigned index continue after inc in free-slot scan (cmp/jb). */
int32_t isaac_manager_poll_a1fc00_slot_index_continue(uint32_t index,
                                                     uint32_t count);

/* Walk pre-captured key dwords (one per slot, in index order). Returns first
 * free index, or ISAAC_A1FC00_SLOT_FULL when none / count==0.
 * keys may be null only when count==0. */
uint32_t isaac_manager_poll_a1fc00_slot_find_free(const uint32_t* keys,
                                                 uint32_t count);

/* VA 0x00a1fd99 / 0x00a1fdca: end' = end - 8 (32-bit wrap). */
uint32_t isaac_manager_poll_a1fc00_queue_end_after_erase(uint32_t end_c);

/* VA 0x00a1fea9: iter' = iter + 8 (32-bit wrap). */
uint32_t isaac_manager_poll_a1fc00_iter_advance(uint32_t iter);

/* VA 0x00a1feac…0x00a1feb1: continue while iter != end. */
int32_t isaac_manager_poll_a1fc00_iter_continue(uint32_t iter, uint32_t end_c);

/* VA 0x00a1fe8e…0x00a1fe91: pending push needs grow when end == capacity. */
int32_t isaac_manager_poll_a1fc00_pending_needs_grow(uint32_t end,
                                                    uint32_t capacity_end);

/* VA 0x00a1fe9a: end' = end + 8 after in-place construct. */
uint32_t isaac_manager_poll_a1fc00_pending_end_after_push(uint32_t end);

/* VA 0x00a1ffd8…0x00a1ffda: capacity bytes = (cap_end - begin) & ~7. */
uint32_t isaac_manager_poll_a1fc00_pending_capacity_bytes(uint32_t cap_end,
                                                         uint32_t begin);

/* VA 0x00a1ffdd: size >= 0x1000 → heap-header free path. */
int32_t isaac_manager_poll_a1fc00_free_uses_heap_header(uint32_t size);

/* VA 0x00a1ffe8: size' = size + 0x23 (32-bit wrap). */
uint32_t isaac_manager_poll_a1fc00_free_header_size(uint32_t size);

/* VA 0x00a1ffeb…0x00a1fff3: (begin - header - 4) <= 0x1f (unsigned jbe).
 * Returns 1 when PE continues to free (valid header); 0 → host abort IAT. */
int32_t isaac_manager_poll_a1fc00_free_header_offset_ok(uint32_t begin,
                                                       uint32_t header);

/* DAT_00c7e814 != 0 → host notify callback (shared_ptr path, several sites). */
int32_t isaac_manager_poll_a1fc00_notify_cb_needed(uint32_t cb_c7e814);

/* ---------------------------------------------------------------------------
 * FUN_00a1f280 pure islands (host residual callee of a1fc00 @ 0x00a1fc97).
 * No exact ZHL. CRT memset/memmove + vcalls remain host.
 * --------------------------------------------------------------------------- */

/* VA 0x00a1f2a9…0x00a1f2b2 (and repeat 0x00a1f2e6…):
 *   size = SAR32(end_14 - begin_10, 4) << 2   (16-byte elem count * 4). */
int32_t isaac_manager_poll_a1f280_buffer_bytes(int32_t end_14, int32_t begin_10);

/* Single-axis strict deadzone: value < -thresh → 1 (neg); value > thresh → 2
 * (pos); else 0. NaN / equal → 0. Matches comiss+jbe pairs @ 0x00a1f350…. */
int32_t isaac_manager_poll_a1f280_axis_dir(float value, float threshold);

/* Dual-axis OR of dir bits: (dir_x) | (dir_y << 2), each dir in {0,1,2}.
 * bit_base shifts the nibble (0 for pair0, 4 for pair1). */
uint32_t isaac_manager_poll_a1f280_axis_pair_bits(float x, float y,
                                                  float threshold,
                                                  uint32_t bit_base);

/* ---------------------------------------------------------------------------
 * ABI v8 — deeper FUN_00a1f280 pure islands + freestanding FUN_00a1eed0 remap.
 * Sibling FUN_00a20020 pure body is queue_count (reuse a1fc00 helpers).
 * --------------------------------------------------------------------------- */

/* Action mode "idle/committed" value at device+0xcc (skip push when == 4). */
enum { ISAAC_A1F280_ACTION_MODE_IDLE = 4 };

/* Device flags byte at +8 bit3: set → skip rumble block (test/jne). */
enum { ISAAC_A1F280_RUMBLE_SUPPRESS_FLAG = 0x8 };

/* 16-byte buffer element count: SAR32(end_14 - begin_10, 4). Capacity path. */
int32_t isaac_manager_poll_a1f280_buffer_count(int32_t end_14, int32_t begin_10);

/* FUN_00a1eed0 pure axis deadzone remap (VA 0x00a1eee3… after host vcall+0x7c).
 * thresh = this+0xd0; one = DAT_00baa454 (1.0f):
 *   v < -thresh → (v + thresh) / (1 - thresh)
 *   v >  thresh → (v - thresh) / (1 - thresh)
 *   else / NaN  → 0
 * Applied independently to x then y; host owns the leading vcall fill. */
float isaac_manager_poll_a1eed0_deadzone_remap(float value, float threshold);

/* Post-a1eed0 axis split @ 0x00a1f398… (stores to this+0x40..+0x4c / +0x50..):
 *   neg_part: v < 0 ordered → -v else 0 (NaN → 0)
 *   pos_part: maxss(v, 0)   (NaN → 0 second operand) */
float isaac_manager_poll_a1f280_axis_neg_part(float value);
float isaac_manager_poll_a1f280_axis_pos_part(float value);

/* VA 0x00a1f4c9: device+0xcc == 4 → skip action-buffer push. Returns 1 idle. */
int32_t isaac_manager_poll_a1f280_action_mode_idle(uint32_t mode_cc);

/* VA 0x00a1f4df: vcall+0x3c result != -1 → valid action id. */
int32_t isaac_manager_poll_a1f280_action_id_valid(int32_t action_id);

/* VA 0x00a1f503: unsigned index (device+0xc8) < buffer_count → in range. */
int32_t isaac_manager_poll_a1f280_buffer_index_in_range(uint32_t index,
                                                       int32_t buffer_count);

/* VA 0x00a1f521: store offset bytes from begin = (mode_cc + index*4) * 4. */
uint32_t isaac_manager_poll_a1f280_buffer_slot_offset(uint32_t mode_cc,
                                                     uint32_t index);

/* VA 0x00a1f53b: (flags_byte8 & 8) == 0 → rumble path may run. */
int32_t isaac_manager_poll_a1f280_rumble_path_needed(uint32_t flags_byte_8);

/* VA 0x00a1f550: timer_d8 > 0 ordered (comiss timer,0 / jbe skip). */
int32_t isaac_manager_poll_a1f280_timer_positive(float timer);

/* VA 0x00a1f628…0x00a1f642: `comiss 0,timer / jb` skips the zero-store, and
 * comiss sets CF on unordered, so a NaN timer is KEPT (ABI v20 correction; the
 * v8 form returned 0.0f). This is the same instruction range as
 * rumble_vcall_timer and the two now agree exactly. */
float isaac_manager_poll_a1f280_timer_clamp_nonneg(float timer);

/* ---------------------------------------------------------------------------
 * ABI v9 — FUN_00a68490 pure islands + a1f280 post-tick rumble scale.
 * FUN_00a68490 (VA 0x00a68490 … ret 0x00a684e8): no exact ZHL.
 *   host: IAT QPC counter [0xb18238], IAT QPC freq [0xb18234],
 *         CRT aefe80 twice (u64→f64), CRT aefd70 (f64→u64 truncate)
 *   pure: divsd counter/freq; mulsd * DAT_00baa8b0 (1e9 ns)
 * Post-return scale @ 0x00a1f56c…0x00a1f6e4 (and second store site 0x00a1f665):
 *   scaled = (seed * 0x431bde82d7b634db) >> 82   ; ns → us
 *   delta  = scaled - qword[device+0xe0]
 *   if delta != 0: host aefe20(delta) → f64; *0.001f; timer -= that
 *   store scaled back to +0xe0/+0xe4 after rumble vcall
 * --------------------------------------------------------------------------- */

/* DAT_00baa8b0 — seconds → nanoseconds scale (f64). */
/* Not an enum: use double literal 1e9 in implementations. */

/* DAT_00baa020 — microsecond delta → seconds (f32 bits). */
enum { ISAAC_A1F280_TICK_DELTA_TO_SEC_BITS = 0x3a83126fu }; /* 0.001f */

/* 64-bit mul immediates for (seed * C) >> 82 (PE mov edx/edi @ 0x00a1f572). */
enum {
  ISAAC_A1F280_TICK_SCALE_MUL_LO = 0xd7b634dbu,
  ISAAC_A1F280_TICK_SCALE_MUL_HI = 0x431bde82u
};

/* Logical right-shift of the 128-bit product (PE shrd 0x12 on high 64 = >>82). */
enum { ISAAC_A1F280_TICK_SCALE_SHIFT = 82 };

/* FUN_00a68490 pure body after host aefe80 on counter and freq:
 *   ns_f64 = (counter_f64 / freq_f64) * 1e9
 * Host residual: QPC IAT, aefe80, aefd70 truncate of the returned f64.
 * Division by zero / inf / NaN follow IEEE divsd/mulsd (no PE special-case). */
double isaac_manager_poll_a68490_ns_f64(double counter_f64, double freq_f64);

/* VA 0x00a1f56c…0x00a1f5f0 pure: (seed * 0x431bde82d7b634db) >> 82.
 * seed_lo = EAX, seed_hi = EDX after host FUN_00a68490 (ns tick).
 * ≈ floor(seed / 1e6) for the a68490 ns domain (ms-scale baseline).
 * Returns the low or high 32 bits of the scaled 64-bit tick. */
uint32_t isaac_manager_poll_a1f280_scale_tick_lo(uint32_t seed_lo,
                                                 uint32_t seed_hi);
uint32_t isaac_manager_poll_a1f280_scale_tick_hi(uint32_t seed_lo,
                                                 uint32_t seed_hi);

/* Optional combined write (null out pointers ignored). */
void isaac_manager_poll_a1f280_scale_tick(uint32_t seed_lo, uint32_t seed_hi,
                                          uint32_t* out_lo, uint32_t* out_hi);

/* VA 0x00a1f5f3…0x00a1f5f9: sub/sbb scaled - baseline (device+0xe0/+0xe4). */
uint32_t isaac_manager_poll_a1f280_tick_delta_lo(uint32_t scaled_lo,
                                                 uint32_t scaled_hi,
                                                 uint32_t base_lo,
                                                 uint32_t base_hi);
uint32_t isaac_manager_poll_a1f280_tick_delta_hi(uint32_t scaled_lo,
                                                 uint32_t scaled_hi,
                                                 uint32_t base_lo,
                                                 uint32_t base_hi);

void isaac_manager_poll_a1f280_tick_delta(uint32_t scaled_lo, uint32_t scaled_hi,
                                          uint32_t base_lo, uint32_t base_hi,
                                          uint32_t* out_lo, uint32_t* out_hi);

/* VA 0x00a1f5ff…0x00a1f603: jne / test ecx / je — delta != 0. */
int32_t isaac_manager_poll_a1f280_tick_delta_nonzero(uint32_t delta_lo,
                                                     uint32_t delta_hi);

/* VA 0x00a1f60a…0x00a1f61c after host aefe20(delta → f64 in xmm0):
 *   cvtsd2ss; mulss * DAT_00baa020 (0.001f) → seconds f32. */
float isaac_manager_poll_a1f280_tick_delta_seconds_f32(double delta_f64);

/* VA 0x00a1f61c: subss timer, delta_sec. float32. */
float isaac_manager_poll_a1f280_timer_sub_delta(float timer, float delta_sec);

/* VA 0x00a1f62b…0x00a1f62e: comiss 0, timer / jb → use saved intensity.
 * Returns 1 when PE keeps device+0xdc intensity (0 < timer OR unordered/NaN). */
int32_t isaac_manager_poll_a1f280_rumble_intensity_active(float timer);

/* ---------------------------------------------------------------------------
 * ABI v10 — pure arg prep / stores around host device vcall+0x84 @ 0x00a1f65a.
 * Device thiscall: [this→vtbl+0x84](timer_f32, intensity_f32). Host owns the
 * vcall body (rumble apply). Second FUN_00a68490 + CRT aefe20 remain host;
 * scale_tick (v9) is pure; baseline store of scaled tick is pure field write.
 * --------------------------------------------------------------------------- */

/* Device field offsets used by the rumble block (FUN_00a1f280 this). */
enum {
  ISAAC_A1F280_OFF_TIMER = 0xd8,       /* rumble timer f32 */
  ISAAC_A1F280_OFF_INTENSITY = 0xdc,   /* saved intensity f32 */
  ISAAC_A1F280_OFF_BASELINE_LO = 0xe0, /* last scaled tick lo */
  ISAAC_A1F280_OFF_BASELINE_HI = 0xe4  /* last scaled tick hi */
};

/* Vtable slot for rumble apply (call dword ptr [eax+0x84]). */
enum { ISAAC_A1F280_VTBL_RUMBLE = 0x84 };

/* FUN_00a1f280 success AL after rumble block (mov al,1 @ 0x00a1f6ea / 0x00a1f718). */
enum { ISAAC_A1F280_SUCCESS_AL = 1 };

/* VA 0x00a1f62b…0x00a1f63d: stack arg0 (timer) for vcall+0x84.
 * Active (intensity_active) → keep timer (NaN preserved); else → 0.0f.
 * Same instruction range as timer_clamp_nonneg; since ABI v20 the two agree
 * (the earlier "distinct because it zeros NaN" note was rationalising a bug). */
float isaac_manager_poll_a1f280_rumble_vcall_timer(float timer);

/* VA 0x00a1f62b…0x00a1f642: stack arg1 (intensity) for vcall+0x84.
 * Active → saved_intensity (from +0xdc / [esp+0x28]); else → 0.0f. */
float isaac_manager_poll_a1f280_rumble_vcall_intensity(float timer,
                                                       float saved_intensity);

/* Combined arg prep: writes *out_timer / *out_intensity when non-null.
 * Matches PE stack layout before call @ 0x00a1f65a: [esp]=timer, [esp+4]=intensity. */
void isaac_manager_poll_a1f280_rumble_vcall_args(float timer,
                                                 float saved_intensity,
                                                 float* out_timer,
                                                 float* out_intensity);

/* Value stored to device+0xd8 at the intensity gate:
 *   active → timer (no rewrite after the pre-gate store at 0x00a1f620)
 *   inactive → 0  (force-store @ 0x00a1f633)
 * Same numeric result as rumble_vcall_timer. */
float isaac_manager_poll_a1f280_rumble_timer_after_gate(float timer);

/* VA 0x00a1f6f2…0x00a1f6f5 (alternate path when initial timer was not >0):
 *   comiss 0, timer / jbe skip → host vcall only when ordered timer < 0.
 * Returns 1 when the neg-timer rumble apply runs (intensity from +0xdc). */
int32_t isaac_manager_poll_a1f280_rumble_neg_timer_path(float timer);

/* Post-vcall @ 0x00a1f6de…0x00a1f6e4 after host a68490 + pure scale_tick:
 * baseline_lo/hi are the scaled seed halves to write at +0xe0/+0xe4.
 * This helper is a pure pass-through documenting the store (null outs ignored). */
void isaac_manager_poll_a1f280_baseline_store(uint32_t scaled_lo,
                                              uint32_t scaled_hi,
                                              uint32_t* out_lo,
                                              uint32_t* out_hi);

/* PE mov al, 1 after rumble complete (both main and skip paths). */
int32_t isaac_manager_poll_a1f280_success_return(void);

/* Vtable slot constant 0x84 (documentation / HostHandler wiring). */
uint32_t isaac_manager_poll_a1f280_rumble_vtbl_slot(void);

/* ---------------------------------------------------------------------------
 * ABI v11 — pure CF / message-ptr islands around host FUN_00a112c0
 * (VA 0x00a112c0 … ret 0x00a114a1). No exact ZHL. Shared info logger used by
 * a1fc00 / a20020 (null lock) and a1f280 (ActionId OOR) plus many roots.
 * Body (init / lock / format / ODS / sink / unlock) stays host residual.
 * --------------------------------------------------------------------------- */

/* Level bitmask / switch discriminants (param_1). */
enum {
  ISAAC_A112C0_LEVEL_INFO = 0x1,
  ISAAC_A112C0_LEVEL_NET = 0x2,
  ISAAC_A112C0_LEVEL_WARN = 0x4,
  ISAAC_A112C0_LEVEL_ERROR = 0x8,
  ISAAC_A112C0_LEVEL_ASSERT = 0x10
};

/* DAT_00c7de48 reenter / lifecycle values. */
enum {
  ISAAC_A112C0_STATE_IDLE = 0,  /* may run init host FUN_00a15770 */
  ISAAC_A112C0_STATE_INIT = 1,  /* reenter → early return */
  ISAAC_A112C0_STATE_READY = 2  /* after successful init */
};

/* Scratch format buffer at DAT_00c7b648; capacity imm for remaining-len. */
enum { ISAAC_A112C0_BUF_CAP = 0x2800 };

/* Prefix / format / ProcessInput callsite message VAs (pointer constants). */
enum {
  ISAAC_A112C0_PREFIX_VA_INFO = 0x00b81818u,   /* "[INFO] - " */
  ISAAC_A112C0_PREFIX_VA_NET = 0x00b8180cu,    /* "[NET] - " */
  ISAAC_A112C0_PREFIX_VA_WARN = 0x00b81830u,   /* "[WARN] - " */
  ISAAC_A112C0_PREFIX_VA_ERROR = 0x00b81824u,  /* "[ERROR] - " */
  ISAAC_A112C0_PREFIX_VA_ASSERT = 0x00b8183cu, /* "[ASSERT] - " */
  ISAAC_A112C0_PREFIX_VA_EMPTY = 0x00b1a4ecu,  /* "" */
  ISAAC_A112C0_FMT_VA = 0x00b62fdcu,           /* "%s" for FUN_00420a80 */
  ISAAC_A112C0_MSG_VA_INVALID_MUTEX = 0x00b9fda8u, /* a1fc00/a20020 */
  ISAAC_A112C0_MSG_VA_ACTION_ID_OOR = 0x00b82e78u, /* a1f280 */
  ISAAC_A112C0_HOST_VA = 0x00a112c0u
};

/* VA 0x00a112e8…0x00a112f0: DAT_00c7de48 == 1 → early return (reenter). */
int32_t isaac_a112c0_reenter_skip(int32_t state_c7de48);

/* VA 0x00a112f6…0x00a11310: sink_ptr!=0 && (sink_mask & level)!=0. */
int32_t isaac_a112c0_sink_active(uint32_t sink_ptr_c79bd8,
                                 uint32_t sink_mask_c79bdc, uint32_t level);

/* VA 0x00a112e8…0x00a11319: body runs when not reenter AND
 * (low-byte(level)!=0 OR sink_active). Returns 1 when host continues into
 * init/lock/format residual. */
int32_t isaac_a112c0_body_needed(int32_t state_c7de48,
                                 uint32_t sink_ptr_c79bd8,
                                 uint32_t sink_mask_c79bdc, uint32_t level);

/* VA 0x00a1131f: state==0 → host FUN_00a15770 init path (when body runs). */
int32_t isaac_a112c0_init_needed(int32_t state_c7de48);

/* Pure store value for DAT_00c7de48 after host init AL:
 *   AL!=0 → READY(2); AL==0 → IDLE(0) (init failed early return). */
int32_t isaac_a112c0_state_after_init(uint32_t init_ok_al);

/* VA 0x00a11362: DAT_00c33911 != 0 → prefix sprintf path. */
int32_t isaac_a112c0_prefix_enabled(uint32_t flag_c33911);

/* VA 0x00a1136b…0x00a113c0 pure switch: level → prefix string VA.
 * Uses PE byte table @ 0x00a114bc + jtable @ 0x00a114a4 (cases 1/2/4/8/0x10
 * → INFO/NET/WARN/ERROR/ASSERT; else empty). */
uint32_t isaac_a112c0_prefix_va(uint32_t level);

/* VA 0x00a11405: test bl,bl — OutputDebugStringA when low-byte(level)!=0. */
int32_t isaac_a112c0_ods_needed(uint32_t level);

/* VA 0x00a11414…0x00a1142a: sink write recheck (same predicate as sink_active). */
int32_t isaac_a112c0_sink_write_needed(uint32_t sink_ptr_c79bd8,
                                       uint32_t sink_mask_c79bdc,
                                       uint32_t level);

/* VA 0x00a113f0…0x00a113f5: remaining = BUF_CAP - prefix_len (32-bit wrap). */
uint32_t isaac_a112c0_buf_remaining(uint32_t prefix_len);

/* VA 0x00a11469…0x00a11475: last message char == '\\n' → store 1 to c33911. */
int32_t isaac_a112c0_trail_newline(uint32_t last_char);

/* Constant accessors (message ptrs / host VA / fmt / cap / ASSERT level). */
uint32_t isaac_a112c0_host_va(void);
uint32_t isaac_a112c0_fmt_va(void);
uint32_t isaac_a112c0_buf_cap(void);
uint32_t isaac_a112c0_level_assert(void);
uint32_t isaac_a112c0_msg_va_invalid_mutex(void);
uint32_t isaac_a112c0_msg_va_action_id_oor(void);

/* a1f280 @ 0x00a1f503…0x00a1f50e: log ActionId OOR when index not in range.
 * PE still falls through to the store after host a112c0 (non-fatal log). */
int32_t isaac_manager_poll_a1f280_action_id_oor_log_needed(uint32_t index,
                                                            int32_t buffer_count);

/* ---------------------------------------------------------------------------
 * ABI v12 — pure arg / gate CF around host device vcall+0x3c @ 0x00a1f4db
 * (action-id query inside FUN_00a1f280). No exact ZHL. Device thiscall:
 *   [this→vtbl+0x3c](arg0=0) → EAX action id; cmp -1 / je skip.
 * Vcall body stays host residual. Pre-gate mode_cc idle (v8) and post-vcall
 * id_valid / buffer_index / slot_offset / OOR log remain as earlier peels.
 * --------------------------------------------------------------------------- */

/* Device field offsets for the action-buffer push block. */
enum {
  ISAAC_A1F280_OFF_ACTION_INDEX = 0xc8, /* dword index into buffer */
  ISAAC_A1F280_OFF_ACTION_MODE = 0xcc    /* dword mode_cc; 4 = idle */
};

/* Vtable slot for action-id query (call dword ptr [eax+0x3c] @ 0x00a1f4db). */
enum { ISAAC_A1F280_VTBL_ACTION_QUERY = 0x3c };

/* Stack arg pushed before the vcall (push 0 @ 0x00a1f4d6). */
enum { ISAAC_A1F280_ACTION_QUERY_ARG = 0 };

/* Call-site VA of the residual host vcall (mid-body of FUN_00a1f280). */
enum { ISAAC_A1F280_ACTION_QUERY_CALL_VA = 0x00a1f4dbu };

/* Pure store values after buffer write @ 0x00a1f527…0x00a1f531. */
enum {
  ISAAC_A1F280_ACTION_INDEX_CLEARED = 0xffffffffu, /* mov [+0xc8], -1 */
  ISAAC_A1F280_ACTION_MODE_AFTER_PUSH = 4          /* mov [+0xcc], 4 (=IDLE) */
};

/* VA 0x00a1f4c9…0x00a1f4d0: mode_cc != 4 → fall through to host vcall+0x3c.
 * Inverse of action_mode_idle. Returns 1 when the query vcall runs. */
int32_t isaac_manager_poll_a1f280_action_query_vcall_needed(uint32_t mode_cc);

/* PE push 0 @ 0x00a1f4d6 — stack arg0 for host [vtbl+0x3c]. */
int32_t isaac_manager_poll_a1f280_action_query_vcall_arg(void);

/* Vtable slot constant 0x3c (documentation / HostHandler wiring). */
uint32_t isaac_manager_poll_a1f280_action_query_vtbl_slot(void);

/* Call-site VA 0x00a1f4db of residual host action-query vcall. */
uint32_t isaac_manager_poll_a1f280_action_query_call_va(void);

/* Post-push pure store to device+0xc8 after successful buffer write. */
uint32_t isaac_manager_poll_a1f280_action_index_after_push(void);

/* Post-push pure store to device+0xcc after successful buffer write (= idle). */
uint32_t isaac_manager_poll_a1f280_action_mode_after_push(void);

/* ---------------------------------------------------------------------------
 * ABI v13 — pure arg / gate CF around host device vcall+0x80 @ 0x00a1f3f8
 * (pair1 fill-present query inside FUN_00a1f280). No exact ZHL. Device thiscall:
 *   [this→vtbl+0x80]() → AL; test al / je skip to action-query @ 0x00a1f4c9.
 * Vcall body stays host residual. On AL!=0 PE pushes pair index 1 then host
 * [vtbl+0x7c](stack_out, 1) axis fill + a1eed0(1); axis split/dir bits reuse
 * v7/v8 pure math with store base +0x50 and bit_base 4.
 * Sibling pair0 site @ 0x00a1f320 uses the same vtbl+0x80 with following pair 0.
 * --------------------------------------------------------------------------- */

/* Vtable slot for fill-present query (call dword ptr [eax+0x80] @ 0x00a1f3f8). */
enum { ISAAC_A1F280_VTBL_FILL = 0x80 };

/* Vtable slot for axis float fill after fill-ok (call [eax+0x7c]). */
enum { ISAAC_A1F280_VTBL_AXIS_FILL = 0x7c };

/* Call-site VAs of residual host fill-present vcalls. */
enum {
  ISAAC_A1F280_FILL_PAIR0_CALL_VA = 0x00a1f320u, /* sibling; pair arg 0 */
  ISAAC_A1F280_FILL_PAIR1_CALL_VA = 0x00a1f3f8u  /* primary residual this unit */
};

/* Stack pair-index imm pushed before host [vtbl+0x7c] / a1eed0 after fill-ok. */
enum {
  ISAAC_A1F280_FILL_PAIR0_ARG = 0,
  ISAAC_A1F280_FILL_PAIR1_ARG = 1
};

/* Post-a1eed0 axis store bases (neg_x/pos_x/neg_y/pos_y as 4 floats). */
enum {
  ISAAC_A1F280_OFF_AXIS_PAIR0 = 0x40, /* stores @ 0x00a1f3c9…0x00a1f3e9 */
  ISAAC_A1F280_OFF_AXIS_PAIR1 = 0x50  /* stores @ 0x00a1f4a4…0x00a1f4c4 */
};

/* Dir-bit nibble shift into device+0x30 (pair0 base 0 → bits 0..3; pair1 → 4). */
enum {
  ISAAC_A1F280_DIR_BIT_BASE_PAIR0 = 0,
  ISAAC_A1F280_DIR_BIT_BASE_PAIR1 = 4
};

/* VA 0x00a1f3fa…0x00a1f3fc: test al,al / je skip — pair1 fill body runs.
 * Uses low byte only (PE test al); upper bits ignored. */
int32_t isaac_manager_poll_a1f280_fill_vcall_ok(uint32_t al);

/* PE push 1 @ 0x00a1f408 / 0x00a1f465 — pair index for host +0x7c / a1eed0. */
int32_t isaac_manager_poll_a1f280_fill_pair1_arg(void);

/* Sibling PE push 0 @ 0x00a1f330 / 0x00a1f38a (pair0 after fill @ 0x00a1f320). */
int32_t isaac_manager_poll_a1f280_fill_pair0_arg(void);

/* Vtable slot constant 0x80 (documentation / HostHandler wiring). */
uint32_t isaac_manager_poll_a1f280_fill_vtbl_slot(void);

/* Call-site VA 0x00a1f3f8 of residual host pair1 fill-present vcall. */
uint32_t isaac_manager_poll_a1f280_fill_call_va(void);

/* Sibling call-site VA 0x00a1f320 (same slot; pair0). */
uint32_t isaac_manager_poll_a1f280_fill_pair0_call_va(void);

/* Vtable slot constant 0x7c for host axis fill after fill_ok. */
uint32_t isaac_manager_poll_a1f280_axis_fill_vtbl_slot(void);

/* Pure field base for pair1 axis split stores (device+0x50). */
uint32_t isaac_manager_poll_a1f280_fill_axis_store_base_pair1(void);

/* Pure dir-bit base for pair1 (4 → OR masks 0x10/0x20/0x40/0x80). */
uint32_t isaac_manager_poll_a1f280_fill_dir_bit_base_pair1(void);

/* ---------------------------------------------------------------------------
 * ABI v14 — pure out-buffer / field CF around host device vcall+0x7c @
 * 0x00a1f40d (pair1 axis float fill inside FUN_00a1f280 after fill_ok).
 * No exact ZHL. Device thiscall:
 *   [this→vtbl+0x7c](float* out_xy, int pair_index)  // out_xy: two f32
 * Stack args (right-to-left): push pair; push out; mov ecx,this; call.
 * Callee cleans 8 (ret 8 inside a1eed0; direct sites share the same slot).
 * Vcall body stays host residual. Post-call pure CF:
 *   thresh = [this+0xd4]; x=out[0]; y=out[4];
 *   [this+0x30] |= axis_pair_bits(x,y,thresh,bit_base);
 * then host a1eed0(out', pair) which itself re-calls [vtbl+0x7c] @ 0x00a1eee0
 * then pure remaps with thresh [this+0xd0] (v8).
 * Sibling pair0 site @ 0x00a1f335 uses pair arg 0 / bit_base 0.
 * --------------------------------------------------------------------------- */

/* Call-site VAs of residual host axis-fill vcalls (vtbl+0x7c). */
enum {
  ISAAC_A1F280_AXIS_FILL_PAIR0_CALL_VA = 0x00a1f335u, /* sibling; pair arg 0 */
  ISAAC_A1F280_AXIS_FILL_PAIR1_CALL_VA = 0x00a1f40du, /* primary residual */
  ISAAC_A1EED0_AXIS_FILL_CALL_VA = 0x00a1eee0u       /* leading inside a1eed0 */
};

/* Host fill writes two float32s into the out buffer (x then y). */
enum {
  ISAAC_A1F280_AXIS_FILL_OUT_FLOAT_COUNT = 2,
  ISAAC_A1F280_AXIS_FILL_OUT_X_OFS = 0,
  ISAAC_A1F280_AXIS_FILL_OUT_Y_OFS = 4
};

/* Device field offsets for post-fill dir-bit path + a1eed0 remap thresh. */
enum {
  ISAAC_A1F280_OFF_DIR_BITS = 0x30,     /* dword OR target for dir nibble */
  ISAAC_A1F280_OFF_DIR_THRESH = 0xd4,   /* f32 digital deadzone (post +0x7c) */
  ISAAC_A1F280_OFF_REMAP_THRESH = 0xd0  /* f32 a1eed0 remap deadzone */
};

/* Call-site VA 0x00a1f40d of residual host pair1 axis-fill vcall. */
uint32_t isaac_manager_poll_a1f280_axis_fill_call_va(void);

/* Sibling call-site VA 0x00a1f335 (same slot; pair0). */
uint32_t isaac_manager_poll_a1f280_axis_fill_pair0_call_va(void);

/* Leading host +0x7c inside FUN_00a1eed0 @ 0x00a1eee0 (same method). */
uint32_t isaac_manager_poll_a1eed0_axis_fill_call_va(void);

/* Host out-buffer float count (always 2 for the dual-axis fill). */
uint32_t isaac_manager_poll_a1f280_axis_fill_out_float_count(void);

/* Byte offset of x float inside out buffer (0). */
uint32_t isaac_manager_poll_a1f280_axis_fill_out_x_ofs(void);

/* Byte offset of y float inside out buffer (4). */
uint32_t isaac_manager_poll_a1f280_axis_fill_out_y_ofs(void);

/* Device field +0xd4 — dir-bit deadzone thresh after host axis fill. */
uint32_t isaac_manager_poll_a1f280_dir_thresh_ofs(void);

/* Device field +0xd0 — a1eed0 remap deadzone thresh (distinct from +0xd4). */
uint32_t isaac_manager_poll_a1f280_remap_thresh_ofs(void);

/* Device field +0x30 — dword OR target for dir bits. */
uint32_t isaac_manager_poll_a1f280_dir_bits_ofs(void);

/* Pure field base for pair0 axis split stores (device+0x40). */
uint32_t isaac_manager_poll_a1f280_fill_axis_store_base_pair0(void);

/* Pure dir-bit base for pair0 (0 → OR masks 0x1/0x2/0x4/0x8). */
uint32_t isaac_manager_poll_a1f280_fill_dir_bit_base_pair0(void);

/* VA 0x00a1f42d… / pair0 0x00a1f355…: OR new pair bits into prior dword.
 * prior is the current device+0x30 value; returns prior | pair_bits.
 * Reuses v7 axis_pair_bits (strict deadzone; NaN → no bits). */
uint32_t isaac_manager_poll_a1f280_dir_bits_merge(uint32_t prior, float x,
                                                  float y, float threshold,
                                                  uint32_t bit_base);

/* ---------------------------------------------------------------------------
 * ABI v15 — pure arg / gate CF around host device ready-gate vcall+0x78 @
 * 0x00a1f30a (leading ready query inside FUN_00a1f280 after CRT buffer clear).
 * No exact ZHL. Device thiscall:
 *   [this→vtbl+0x78]() → AL   // no stack args
 * PE @ 0x00a1f300…0x00a1f315:
 *   mov eax,[esi]; mov ecx,esi; mov eax,[eax+0x78]; call eax
 *   test al,al / jne 0xa1f316  // body (pair0 fill present path)
 *   else epilog ret            // early return when not ready
 * Vcall body stays host residual (receiver-dependent device method).
 * Low-byte AL test matches fill_vcall_ok polarity for "ok", but branch sense
 * is inverted (jne continue vs je skip) — same pure predicate.
 * --------------------------------------------------------------------------- */

/* Vtable slot for ready-gate query (call [eax+0x78] @ 0x00a1f30a). */
enum { ISAAC_A1F280_VTBL_READY = 0x78 };

/* Call-site VA of residual host ready-gate vcall (mid-body of FUN_00a1f280). */
enum { ISAAC_A1F280_READY_CALL_VA = 0x00a1f30au };

/* VA 0x00a1f30c…0x00a1f30e: test al,al / jne body — ready when AL low != 0.
 * Uses low byte only (PE test al); upper bits ignored. */
int32_t isaac_manager_poll_a1f280_ready_vcall_ok(uint32_t al);

/* Inverse: AL low == 0 → PE early epilog ret @ 0x00a1f310…0x00a1f315. */
int32_t isaac_manager_poll_a1f280_ready_early_return(uint32_t al);

/* Vtable slot constant 0x78 (documentation / HostHandler wiring). */
uint32_t isaac_manager_poll_a1f280_ready_vtbl_slot(void);

/* Call-site VA 0x00a1f30a of residual host ready-gate vcall. */
uint32_t isaac_manager_poll_a1f280_ready_call_va(void);

/* ---------------------------------------------------------------------------
 * ABI v16 — pure islands inside the a6de60 walk's host residual callees.
 * FUN_00a648b0 tracked-heap control flow, FUN_00a6da10 teardown plan,
 * FUN_00a6dd30 axis store / callback frame. All three keep address-stable
 * names (identify-zhl-address: 0 exact matches for each).
 * --------------------------------------------------------------------------- */

/* --- FUN_00a648b0 tracked heap (mode enum + tracker_add/sub already in v6) --- */

/* Size header stored immediately below every tracked payload. */
enum { ISAAC_A648B0_HEADER_BYTES = 4 };

/* Tracker context pointer / counter offsets and the no-context fallback pair. */
enum {
  ISAAC_A648B0_TRACKER_CTX_VA = 0x00c7de78u,       /* DAT_00c7de78 */
  ISAAC_A648B0_TRACKER_CTX_OFS = 0x30,             /* lea esi,[edi+0x30] */
  ISAAC_A648B0_TRACKER_FALLBACK_VA = 0x00c7f618u   /* mov esi,0xc7f618 */
};

/* CRT heap IAT slots proven from this PE's import table. */
enum {
  ISAAC_A648B0_MALLOC_IAT_VA = 0x00b187e0u, /* malloc */
  ISAAC_A648B0_FREE_IAT_VA = 0x00b187dcu    /* free */
};

/* Out-of-memory broadcast on malloc failure (push imm; stdcall ret 4). */
enum {
  ISAAC_A648B0_OOM_HOST_VA = 0x00a23200u,
  ISAAC_A648B0_OOM_CODE = 0x7fcb9dd6u
};

/* VA 0x00a648b5…0x00a648c2: tracker counter base used by alloc/free.
 *   ctx != 0 → ctx + 0x30 (32-bit wrap); ctx == 0 → 0x00c7f618. */
uint32_t isaac_manager_poll_a648b0_tracker_base(uint32_t ctx_c7de78);

/* VA 0x00a648de…0x00a648e6: the ACCOUNT (mode 2) path adds into [ctx+0x30] via
 * EDI directly; it does not consult the fallback base. Returns ctx + 0x30. */
uint32_t isaac_manager_poll_a648b0_account_target(uint32_t ctx_c7de78);

/* VA 0x00a64913…0x00a6492a: `test ebx,ebx / jne clamp` plus an always-taken
 * `cmp edi,-1 / jbe` — clamp runs exactly when size_hi != 0. */
int32_t isaac_manager_poll_a648b0_alloc_clamp_needed(uint32_t size_hi);

/* Low half of the request after the clamp store (movlpd zeroes both halves). */
uint32_t isaac_manager_poll_a648b0_alloc_size_clamped_lo(uint32_t size_lo,
                                                        uint32_t size_hi);

/* VA 0x00a64931 `adc ebx,0`: high dword of the 64-bit accounted malloc size.
 * Clamped high is always 0, so this is the carry out of (clamped_lo + 4). */
uint32_t isaac_manager_poll_a648b0_alloc_malloc_size_hi(uint32_t size_lo,
                                                       uint32_t size_hi);

/* VA 0x00a6493d `test eax,eax / jne commit`: malloc result non-null. */
int32_t isaac_manager_poll_a648b0_alloc_ok(uint32_t block_ptr);

/* VA 0x00a64954 `mov [eax],edi`: header dword written at block+0 (the padded
 * malloc size low dword that the free path later subtracts). */
uint32_t isaac_manager_poll_a648b0_alloc_header_value(uint32_t size_lo,
                                                     uint32_t size_hi);

/* VA 0x00a64959 `add eax,4`: payload returned to the caller (32-bit wrap).
 * Only reached when alloc_ok. */
uint32_t isaac_manager_poll_a648b0_alloc_payload_ptr(uint32_t block_ptr);

/* Full EAX at the alloc ret: block == 0 → 0 (after host OOM broadcast),
 * else block + 4. */
uint32_t isaac_manager_poll_a648b0_alloc_return(uint32_t block_ptr);

/* VA 0x00a648ef `test edx,edx / je nop`: free body runs when ptr != 0. */
int32_t isaac_manager_poll_a648b0_free_needed(uint32_t payload_ptr);

/* VA 0x00a648f3/0x00a648f6 `lea ecx,[edx-4]`: header address and the pointer
 * handed to the free IAT (32-bit wrap). */
uint32_t isaac_manager_poll_a648b0_free_block_ptr(uint32_t payload_ptr);

/* Constant accessors (documentation / HostHandler wiring). */
uint32_t isaac_manager_poll_a648b0_header_bytes(void);
uint32_t isaac_manager_poll_a648b0_oom_code(void);
uint32_t isaac_manager_poll_a648b0_oom_host_va(void);
uint32_t isaac_manager_poll_a648b0_malloc_iat_va(void);
uint32_t isaac_manager_poll_a648b0_free_iat_va(void);

/* --- FUN_00a6da10 teardown plan (device index in ECX) --- */

/* Device-vector element stride (dword slots at DAT_00c79bec). */
enum { ISAAC_A6DA10_SLOT_STRIDE = 4 };

/* COM Release slot used on the disabled-device path (`call [vtbl+8]`). */
enum { ISAAC_A6DA10_COM_RELEASE_VTBL = 8 };

/* Field offsets touched by the teardown (device object / device state). */
enum {
  ISAAC_A6DA10_OFF_DEV_STATE = 0x20,  /* state = [dev+0x20] */
  ISAAC_A6DA10_OFF_DEV_NAME = 0x04,   /* freed only when state[0] == 0 */
  ISAAC_A6DA10_OFF_DEV_BUF_A = 0x18,
  ISAAC_A6DA10_OFF_DEV_BUF_B = 0x1c,
  ISAAC_A6DA10_OFF_STATE_COM = 0x14,  /* COM object released via vtbl+8 */
  ISAAC_A6DA10_OFF_STATE_MAP_A = 0x24,
  ISAAC_A6DA10_OFF_STATE_MAP_B = 0x28
};

/* Disconnect callback globals + cdecl arg order (cb(device, user)). */
enum {
  ISAAC_A6DA10_DISCONNECT_CB_VA = 0x00c78d7cu,
  ISAAC_A6DA10_DISCONNECT_USER_VA = 0x00c78d88u
};

/* Ordered teardown steps emitted by the PE (see teardown_plan). */
enum {
  ISAAC_A6DA10_STEP_COM_RELEASE = 0,  /* [vtbl+8]([state+0x14]) */
  ISAAC_A6DA10_STEP_FREE_STATE_MAP_A = 1,
  ISAAC_A6DA10_STEP_FREE_STATE_MAP_B = 2,
  ISAAC_A6DA10_STEP_FREE_DEV_NAME = 3,
  ISAAC_A6DA10_STEP_FREE_STATE = 4,
  ISAAC_A6DA10_STEP_FREE_DEV_BUF_A = 5,
  ISAAC_A6DA10_STEP_FREE_DEV_BUF_B = 6,
  ISAAC_A6DA10_STEP_FREE_DEV = 7
};

/* Step counts: enable byte 0 → 8 steps; non-zero → 4 (tail only). */
enum {
  ISAAC_A6DA10_TEARDOWN_STEPS_FULL = 8,
  ISAAC_A6DA10_TEARDOWN_STEPS_TAIL = 4
};

/* VA 0x00a6da3b `lea ecx,[esi*4]`: byte offset of the device slot. */
uint32_t isaac_manager_poll_a6da10_slot_byte_offset(uint32_t index);

/* VA 0x00a6da4b / 0x00a6da84: slot address = begin + index*4 (32-bit wrap). */
uint32_t isaac_manager_poll_a6da10_slot_addr(uint32_t begin_c79bec,
                                             uint32_t index);

/* CRT memmove args @ 0x00a6da8f…0x00a6da97: dst = slot, src = slot + 4.
 * Byte count is the existing v6 remove_move_bytes. */
uint32_t isaac_manager_poll_a6da10_memmove_dst(uint32_t begin_c79bec,
                                               uint32_t index);
uint32_t isaac_manager_poll_a6da10_memmove_src(uint32_t begin_c79bec,
                                               uint32_t index);

/* Number of teardown steps for the given device-state enable byte. */
int32_t isaac_manager_poll_a6da10_teardown_step_count(uint32_t enable_byte);

/* Writes the PE-ordered teardown step ids into out_steps (up to max_steps) and
 * returns the full step count (even when truncated). out_steps may be null. */
int32_t isaac_manager_poll_a6da10_teardown_plan(uint32_t enable_byte,
                                                int32_t* out_steps,
                                                int32_t max_steps);

/* COM Release vtable slot constant (8). */
uint32_t isaac_manager_poll_a6da10_com_release_vtbl_slot(void);

/* --- FUN_00a6dd30 axis store / callback frame (after the POV head) --- */

/* Device field holding the axis float array base (`mov edx,[edi+0x18]`). */
enum { ISAAC_A6DD30_OFF_AXIS_BASE = 0x18 };

/* Axis-change callback globals (cdecl frame below). */
enum {
  ISAAC_A6DD30_CB_VA = 0x00c78d70u,
  ISAAC_A6DD30_CB_USER_VA = 0x00c75dacu
};

/* Callback stack frame @ 0x00a6ddc1…0x00a6dde2 (and the y twin at 0x00a6de0e).
 * Total 0x1c bytes popped by the caller. */
enum {
  ISAAC_A6DD30_CB_FRAME_BYTES = 0x1c,
  ISAAC_A6DD30_CB_ARG_DEVICE = 0,
  ISAAC_A6DD30_CB_ARG_INDEX = 1,
  ISAAC_A6DD30_CB_ARG_NEW = 2,
  ISAAC_A6DD30_CB_ARG_OLD = 3,
  ISAAC_A6DD30_CB_ARG_TIME = 4,
  ISAAC_A6DD30_CB_ARG_USER = 5,
  ISAAC_A6DD30_CB_ARG_COUNT = 6
};

/* Device field offset of the axis float array base (0x18). */
uint32_t isaac_manager_poll_a6dd30_axis_base_ofs(void);

/* VA 0x00a6ddaa: x float slot byte offset from the array base = index*4. */
uint32_t isaac_manager_poll_a6dd30_axis_slot_offset(uint32_t index);

/* VA 0x00a6ddf0 (`[edx+esi*4+4]` read) / 0x00a6ddff (store after `inc esi`):
 * y float slot byte offset = (index + 1) * 4 (32-bit wrap). */
uint32_t isaac_manager_poll_a6dd30_axis_slot_offset_y(uint32_t index);

/* VA 0x00a6ddf6 `inc esi`: index passed to the y callback is index + 1. */
uint32_t isaac_manager_poll_a6dd30_index_after_x(uint32_t index);

/* Callback gate for either lane: PE stores unconditionally, then runs the
 * callback only when ucomiss(new, old) is NOT ordered-equal AND the callback
 * pointer DAT_00c78d70 is non-null. NaN on either side → callback runs. */
int32_t isaac_manager_poll_a6dd30_cb_needed(float new_v, float old_v,
                                            uint32_t cb_c78d70);

/* Byte size of the callback frame the caller pops (0x1c). */
uint32_t isaac_manager_poll_a6dd30_cb_frame_bytes(void);

/* Byte offset of a callback argument inside the frame, or 0xffffffff for an
 * unknown arg id. Layout: device 0, index 4, new 8, old 0xc, time 0x10 (f64),
 * user 0x18. */
uint32_t isaac_manager_poll_a6dd30_cb_arg_ofs(int32_t arg_id);

/* ---------------------------------------------------------------------------
 * ABI v17 — sibling device scan/connect FUN_00a6dab0 (0x00a6dab0 … 0x00a6dd2e).
 * Address-stable (identify-zhl-address: 0 exact matches). Host still owns the
 * Win32 message pump, COM EnumDevices, the state/caps hook CALLs, calloc, the
 * FUN_00a6ef50 grow, FUN_00a112c0 logging, and the connect callback.
 * --------------------------------------------------------------------------- */

/* Outer 4-slot loop bound (`cmp esi,4 / jb` @ 0x00a6dd13); the name table at
 * 0x00b468b0 has exactly 4 entries. */
enum { ISAAC_A6DAB0_SLOT_COUNT = 4 };

/* Per-slot tables indexed by slot*4. */
enum {
  ISAAC_A6DAB0_SLOT_TABLE_VA = 0x00c7e2e0u, /* device record per slot */
  ISAAC_A6DAB0_NAME_TABLE_VA = 0x00b468b0u  /* const name pointer per slot */
};

/* Globals read/written by the scan (documentation constants). */
enum {
  ISAAC_A6DAB0_ENABLE_VA = 0x00c7e300u,       /* shared with FUN_00a6de60 */
  ISAAC_A6DAB0_WINDOW_VA = 0x00c7e2d4u,       /* HWND for the message pump */
  ISAAC_A6DAB0_ENUM_FLAG_VA = 0x00c7ac6bu,    /* one-shot EnumDevices refresh */
  ISAAC_A6DAB0_SCAN_FLAG_VA = 0x00c7e301u,    /* gates the 4-slot loop */
  ISAAC_A6DAB0_STATE_HOOK_VA = 0x00c7e2f4u,   /* host slot state query */
  ISAAC_A6DAB0_CAPS_HOOK_VA = 0x00c7e2f8u,    /* host capability query */
  ISAAC_A6DAB0_CAPS_MODE_VA = 0x00c7e304u,    /* caps path runs when == 2 */
  ISAAC_A6DAB0_ID_COUNTER_VA = 0x00c7e298u,   /* monotonic device id */
  ISAAC_A6DAB0_CONNECT_CB_VA = 0x00c75da8u,
  ISAAC_A6DAB0_CONNECT_USER_VA = 0x00c78d8cu
};

/* COM EnumDevices refresh @ 0x00a6db6b: [vtbl+0x10](this, 4, cb, 0, 0). */
enum {
  ISAAC_A6DAB0_ENUM_VTBL = 0x10,
  ISAAC_A6DAB0_ENUM_DEVCLASS = 4,
  ISAAC_A6DAB0_ENUM_CALLBACK_VA = 0x00a6d560u
};

/* Capability mode discriminant (`cmp dword [0xc7e304],2` @ 0x00a6dbd2). */
enum { ISAAC_A6DAB0_CAPS_MODE_MATCH = 2 };

/* Capability buffer field offsets read on success (u16 each). */
enum {
  ISAAC_A6DAB0_CAPS_OFS_VID = 0x14,
  ISAAC_A6DAB0_CAPS_OFS_PID = 0x16
};

/* Allocation sizes and element counts written into the new record. */
enum {
  ISAAC_A6DAB0_RECORD_BYTES = 0x24,
  ISAAC_A6DAB0_STATE_BYTES = 0x30,
  ISAAC_A6DAB0_AXIS_COUNT = 6,
  ISAAC_A6DAB0_BUTTON_COUNT = 0xf,
  ISAAC_A6DAB0_AXIS_ELEM_BYTES = 4,
  ISAAC_A6DAB0_BUTTON_ELEM_BYTES = 1
};

/* Record field ids for record_field_ofs (layout of the 0x24-byte record). */
enum {
  ISAAC_A6DAB0_REC_ID = 0,           /* +0x00 dword monotonic id */
  ISAAC_A6DAB0_REC_NAME = 1,         /* +0x04 const char* from name table */
  ISAAC_A6DAB0_REC_ENABLED = 2,      /* +0x08 byte copied from state+0 */
  ISAAC_A6DAB0_REC_VID = 3,          /* +0x0a word */
  ISAAC_A6DAB0_REC_PID = 4,          /* +0x0c word */
  ISAAC_A6DAB0_REC_AXIS_COUNT = 5,   /* +0x10 dword = 6 */
  ISAAC_A6DAB0_REC_BUTTON_COUNT = 6, /* +0x14 dword = 0xf */
  ISAAC_A6DAB0_REC_AXIS_ARRAY = 7,   /* +0x18 calloc(4, axis_count) */
  ISAAC_A6DAB0_REC_BUTTON_ARRAY = 8, /* +0x1c calloc(1, button_count) */
  ISAAC_A6DAB0_REC_STATE = 9,        /* +0x20 dword state pointer */
  ISAAC_A6DAB0_REC_FIELD_COUNT = 10
};

/* State field ids for state_field_ofs (0x30-byte state object). */
enum {
  ISAAC_A6DAB0_ST_ENABLE = 0, /* +0x00 byte = 1 */
  ISAAC_A6DAB0_ST_SLOT = 1,   /* +0x2c dword slot index */
  ISAAC_A6DAB0_ST_FIELD_COUNT = 2
};

/* Value stored to state+0 (and copied to record+8) on connect. */
enum { ISAAC_A6DAB0_STATE_ENABLE_VALUE = 1 };

/* Sentinel returned by vector_find when the device id is absent. */
enum { ISAAC_A6DAB0_SEARCH_NOT_FOUND = 0xffffffffu };

/* Log message VAs (evidence only; do not promote to a symbol name). */
enum {
  ISAAC_A6DAB0_MSG_VA_ENUM_FAIL = 0x00ba1a18u,  /* level 8 */
  ISAAC_A6DAB0_MSG_VA_CONNECT = 0x00ba1a4cu,    /* level 1 */
  ISAAC_A6DAB0_MSG_VA_CAPS_FAIL = 0x00ba1ae8u   /* level 8 */
};

/* VA 0x00a6dad3: byte DAT_00c7e300 != 0 → body runs (same global as the
 * FUN_00a6de60 entry gate, different call site). */
int32_t isaac_manager_poll_a6dab0_scan_enabled(uint32_t enable_c7e300);

/* VA 0x00a6dae7: DAT_00c7e2d4 != 0 → host Win32 message pump runs. */
int32_t isaac_manager_poll_a6dab0_pump_needed(uint32_t window_c7e2d4);

/* VA 0x00a6db4e: byte DAT_00c7ac6b != 0 → host COM EnumDevices refresh. */
int32_t isaac_manager_poll_a6dab0_enum_needed(uint32_t flag_c7ac6b);

/* VA 0x00a6db82: the refresh flag is stored 0 after the attempt (whether or
 * not the COM call reported an error). */
int32_t isaac_manager_poll_a6dab0_enum_flag_after(void);

/* VA 0x00a6db89: byte DAT_00c7e301 != 0 → the 4-slot loop runs. */
int32_t isaac_manager_poll_a6dab0_slot_scan_needed(uint32_t flag_c7e301);

/* VA 0x00a6dd12…0x00a6dd16: `inc esi / cmp esi,4 / jb` (32-bit wrap on inc). */
int32_t isaac_manager_poll_a6dab0_slot_continue(uint32_t slot);

/* Per-slot table addresses (`[esi*4 + table]`, 32-bit wrap). */
uint32_t isaac_manager_poll_a6dab0_slot_table_addr(uint32_t slot);
uint32_t isaac_manager_poll_a6dab0_name_table_addr(uint32_t slot);

/* VA 0x00a6dd07: the slot table entry is cleared to 0 on the disconnect path
 * whether or not the device id was found in the vector. */
uint32_t isaac_manager_poll_a6dab0_slot_clear_value(void);

/* VA 0x00a6dbac: `test eax,eax / jne` — status 0 means the slot is present. */
int32_t isaac_manager_poll_a6dab0_query_ok(int32_t status);

/* VA 0x00a6dbb4 / 0x00a6dcdc: slot record pointer non-null. */
int32_t isaac_manager_poll_a6dab0_record_present(uint32_t record_ptr);

/* Combined per-slot decisions (both PE branch pairs):
 *   connect    when status == 0 and no record yet
 *   disconnect when status != 0 and a record exists
 * Any other combination falls through to the next slot. */
int32_t isaac_manager_poll_a6dab0_connect_needed(int32_t status,
                                                 uint32_t record_ptr);
int32_t isaac_manager_poll_a6dab0_disconnect_needed(int32_t status,
                                                    uint32_t record_ptr);

/* VA 0x00a6dbd2: DAT_00c7e304 == 2 → capability branch considered. */
int32_t isaac_manager_poll_a6dab0_caps_mode_ok(uint32_t mode_c7e304);

/* VA 0x00a6dbd2 + 0x00a6dbe7: mode matches AND the hook pointer is non-null. */
int32_t isaac_manager_poll_a6dab0_caps_call_needed(uint32_t mode_c7e304,
                                                   uint32_t hook_c7e2f8);

/* VA 0x00a6dbf6: `test eax,eax / jne error` — 0 means vid/pid were filled. */
int32_t isaac_manager_poll_a6dab0_caps_ok(int32_t caps_status);

/* VA 0x00a6dbfa / 0x00a6dc61: the caps values are read with movzx from u16 and
 * stored back with `mov word`, so only the low 16 bits survive. Defaults are 0
 * when the caps branch is skipped or fails. */
uint32_t isaac_manager_poll_a6dab0_id_word(uint32_t raw);

/* VA 0x00a6dc41 / 0x00a6dc49: the record takes the pre-increment counter and
 * DAT_00c7e298 becomes counter + 1 (32-bit wrap). */
uint32_t isaac_manager_poll_a6dab0_next_device_id(uint32_t counter_c7e298);

/* VA 0x00a6dc3b: byte stored to state+0 and copied to record+8. */
uint32_t isaac_manager_poll_a6dab0_state_enable_value(void);

/* Byte offsets of the record / state fields listed in the id enums above.
 * Unknown ids return 0xffffffff. */
uint32_t isaac_manager_poll_a6dab0_record_field_ofs(int32_t field_id);
uint32_t isaac_manager_poll_a6dab0_state_field_ofs(int32_t field_id);

/* Pure argument pairs pushed before the host calloc IAT (0x00b187e8):
 *   axis   @ 0x00a6dc7a…0x00a6dc7f → (4, record+0x10)
 *   button @ 0x00a6dc88…0x00a6dc8d → (1, record+0x14)
 * Arg order is cdecl (num, size) at increasing stack addresses. calloc itself
 * stays a host action; only the argument computation is pure. Null outs are
 * ignored. */
void isaac_manager_poll_a6dab0_axis_calloc_args(uint32_t axis_count,
                                                uint32_t* out_num,
                                                uint32_t* out_size);
void isaac_manager_poll_a6dab0_button_calloc_args(uint32_t button_count,
                                                  uint32_t* out_num,
                                                  uint32_t* out_size);

/* VA 0x00a6dc9e: end == capacity (DAT_00c79bf4) → host grow FUN_00a6ef50. */
int32_t isaac_manager_poll_a6dab0_push_needs_grow(uint32_t end_c79bf0,
                                                  uint32_t capacity_c79bf4);

/* VA 0x00a6dca8: in-place push advances the end pointer by one slot. */
uint32_t isaac_manager_poll_a6dab0_end_after_push(uint32_t end_c79bf0);

/* VA 0x00a6dcca: DAT_00c75da8 != 0 → host connect callback
 * cb(record, DAT_00c78d8c). */
int32_t isaac_manager_poll_a6dab0_connect_cb_needed(uint32_t cb_c75da8);

/* VA 0x00a6dcf2: `test eax,eax / je` on the SIGNED SAR32 count — the scan is
 * skipped only for exactly 0 (a negative count would enter the loop). */
int32_t isaac_manager_poll_a6dab0_search_loop_needed(int32_t count);

/* VA 0x00a6dcfb…0x00a6dcfe: `inc ecx / cmp ecx,eax / jb` — the continue test
 * is UNSIGNED against the signed count. */
int32_t isaac_manager_poll_a6dab0_search_index_continue(uint32_t index,
                                                        int32_t count);

/* VA 0x00a6dce0…0x00a6dd00: first entry equal to target_id wins; its index is
 * passed to FUN_00a6da10 in ECX. Returns ISAAC_A6DAB0_SEARCH_NOT_FOUND when no
 * entry matches or count == 0. entries may be null only when count == 0. */
uint32_t isaac_manager_poll_a6dab0_vector_find(const uint32_t* entries,
                                               uint32_t count,
                                               uint32_t target_id);

/* Constant accessors (documentation / HostHandler wiring). */
uint32_t isaac_manager_poll_a6dab0_slot_count(void);
uint32_t isaac_manager_poll_a6dab0_enum_vtbl_slot(void);
uint32_t isaac_manager_poll_a6dab0_enum_callback_va(void);
uint32_t isaac_manager_poll_a6dab0_msg_va_enum_fail(void);
uint32_t isaac_manager_poll_a6dab0_msg_va_connect(void);
uint32_t isaac_manager_poll_a6dab0_msg_va_caps_fail(void);

/* ---------------------------------------------------------------------------
 * ABI v18 — the two callers of FUN_00a6dab0.
 * FUN_00a220c0 (hot-plug poll thread proc) and FUN_00a6cf80 (one-time init).
 * Both address-stable (identify-zhl-address: 0 exact matches). Neither is on
 * the frame path, and the ProcessInput root stays unpinned.
 * --------------------------------------------------------------------------- */

/* --- FUN_00a220c0 hot-plug poll thread (0x00a220c0 … 0x00a220ed) --- */

/* Static object and its flag dword; 0x00c57b18 is also the `this` used at the
 * Manager callsite 0x00954f78 for FUN_00a1fc00 (ABI v7). */
enum {
  ISAAC_A220C0_OBJ_VA = 0x00c57b18u,
  ISAAC_A220C0_FLAGS_VA = 0x00c57b1cu /* obj + 4 */
};

/* Run flag tested with `test byte [0x00c57b1c], 2`. */
enum { ISAAC_A220C0_RUN_BIT = 2 };

/* Sleep argument between scans (IAT 0x00b182d8 = Sleep). */
enum { ISAAC_A220C0_SLEEP_MS = 0x64 };

/* Thread spawn: [obj+0x4c → vtbl+8](proc, priority, stack, this). */
enum {
  ISAAC_A220C0_THREAD_PROC_VA = 0x00a220c0u,
  ISAAC_A220C0_SPAWN_VTBL = 8,
  ISAAC_A220C0_SPAWN_PRIORITY = 2,
  ISAAC_A220C0_SPAWN_STACK = 0x1000
};

/* VA 0x00a220c7: entry test — the loop body runs while the run bit is set.
 * Byte-wide test, so only the low byte of the flag dword participates. */
int32_t isaac_manager_poll_a220c0_thread_run(uint32_t flags_c57b1c);

/* VA 0x00a220e0: the same predicate re-read after Sleep (`jne` back-edge). */
int32_t isaac_manager_poll_a220c0_thread_continue(uint32_t flags_c57b1c);

/* VA 0x00a21b2c: the spawn sites only start the thread when the bit is clear. */
int32_t isaac_manager_poll_a220c0_spawn_needed(uint32_t flags_c57b1c);

/* VA 0x00a21b4b / 0x00a21b4f: `bts eax,1` after a successful spawn. */
uint32_t isaac_manager_poll_a220c0_flag_after_start(uint32_t flags_c57b1c);

/* VA 0x00924891: `btr edx,1` — the stop path clears the run bit. */
uint32_t isaac_manager_poll_a220c0_flag_after_stop(uint32_t flags_c57b1c);

/* Number of FUN_00a6dab0 scans the loop performs for a sequence of flag
 * observations (one per test: entry test, then one per post-Sleep re-test).
 * Models the whole do-while: 0 when the entry test fails. run_seq may be null
 * only when n == 0; a sequence that never clears the bit stops at n. */
uint32_t isaac_manager_poll_a220c0_scan_iterations(const uint32_t* run_seq,
                                                   uint32_t n);

/* Constant accessors. */
uint32_t isaac_manager_poll_a220c0_sleep_ms(void);
uint32_t isaac_manager_poll_a220c0_thread_proc_va(void);
uint32_t isaac_manager_poll_a220c0_spawn_vtbl_slot(void);

/* --- FUN_00a6cf80 one-time init (0x00a6cf80 … 0x00a6d266) --- */

/* Library probe order; the first successful LoadLibraryA wins. */
enum {
  ISAAC_A6CF80_PROBE_COUNT = 4,
  ISAAC_A6CF80_PROBE_NOT_FOUND = 0xffffffffu
};

/* Resulting mode stored to DAT_00c7e304. */
enum {
  ISAAC_A6CF80_MODE_NONE = 0,
  ISAAC_A6CF80_MODE_LEGACY = 1, /* the 1_3 pair */
  ISAAC_A6CF80_MODE_MODERN = 2  /* the 1_4 pair; enables the caps hook */
};

/* GetProcAddress destination slots (see hook_slot_* accessors). */
enum {
  ISAAC_A6CF80_HOOK_ORD_PRIMARY = 0, /* ordinal 0x64 -> DAT_00c7e29c */
  ISAAC_A6CF80_HOOK_GET_STATE = 1,   /* -> DAT_00c7e2dc */
  ISAAC_A6CF80_HOOK_SET_STATE = 2,   /* -> DAT_00c7e2f0 */
  ISAAC_A6CF80_HOOK_GET_CAPS = 3,    /* -> DAT_00c7e2f4 (v17 slot probe) */
  ISAAC_A6CF80_HOOK_CAPS_EX = 4,     /* ordinal 0x6c -> DAT_00c7e2f8, mode 2 */
  ISAAC_A6CF80_HOOK_SLOT_COUNT = 5
};

enum {
  ISAAC_A6CF80_PROC_ORD_PRIMARY = 0x64,
  ISAAC_A6CF80_PROC_ORD_CAPS_EX = 0x6c
};

/* CoInitializeEx retry (RPC_E_CHANGED_MODE) and the two flag arguments. */
enum {
  ISAAC_A6CF80_COINIT_CHANGED_MODE = 0x80010106u,
  ISAAC_A6CF80_COINIT_FLAGS_FIRST = 2,
  ISAAC_A6CF80_COINIT_FLAGS_RETRY = 0
};

/* Device-notification filter block at DAT_00c7e2a0. */
enum {
  ISAAC_A6CF80_NOTIFY_FILTER_BYTES = 0x3c, /* memset size @ 0x00a6d145 */
  ISAAC_A6CF80_NOTIFY_FILTER_CBSIZE = 0x30 /* stored to +4 @ 0x00a6d19b */
};

/* Message-only window constants. */
enum {
  ISAAC_A6CF80_WNDCLASS_NAME_VA = 0x00ba1710u, /* "Message" */
  ISAAC_A6CF80_WNDPROC_VA = 0x00a6cef0u,
  ISAAC_A6CF80_HWND_MESSAGE = -3
};

/* VA 0x00a6cf94: `cmp byte [0x00c7e300],0 / jne epilog` — already initialised.
 * Numerically identical to a6dab0_scan_enabled; the branch sense is inverted
 * (this skips the body, the scan runs it). */
int32_t isaac_manager_poll_a6cf80_init_skip(uint32_t enable_c7e300);

/* Probe name string VAs in PE order; out-of-range returns 0xffffffff. */
uint32_t isaac_manager_poll_a6cf80_probe_name_va(int32_t probe);

/* Mode a successful probe selects: 0,1 -> MODERN; 2,3 -> LEGACY; else NONE. */
uint32_t isaac_manager_poll_a6cf80_mode_for_probe(int32_t probe);

/* First probe whose LoadLibraryA returned non-null, else PROBE_NOT_FOUND.
 * loaded[] holds one 0/non-zero flag per probe, in PE order. */
uint32_t isaac_manager_poll_a6cf80_select_probe(const uint8_t* loaded,
                                                uint32_t n);

/* Mode after the whole ladder (NONE when every probe failed). */
uint32_t isaac_manager_poll_a6cf80_mode_after_probes(const uint8_t* loaded,
                                                     uint32_t n);

/* a112c0 level and message VA chosen for the resulting mode. Levels reuse the
 * ABI v11 enum: MODERN -> INFO(1), LEGACY -> WARN(4), NONE -> ERROR(8). */
uint32_t isaac_manager_poll_a6cf80_log_level_for_mode(uint32_t mode);
uint32_t isaac_manager_poll_a6cf80_log_msg_va_for_mode(uint32_t mode);

/* Value stored to DAT_00c7e301 (the v17 slot-scan gate): mode != NONE. */
uint32_t isaac_manager_poll_a6cf80_scan_flag_after(uint32_t mode);

/* VA 0x00a6d0b2: only MODERN probes the capabilities-Ex entry point.
 * Same predicate as a6dab0_caps_mode_ok. */
int32_t isaac_manager_poll_a6cf80_caps_hook_probe_needed(uint32_t mode);

/* Destination global, name string VA, and ordinal for each hook slot.
 * Name VA is 0xffffffff for ordinal slots; ordinal is 0xffffffff for named
 * slots. Unknown slot ids return 0xffffffff from all three. */
uint32_t isaac_manager_poll_a6cf80_hook_slot_target_va(int32_t slot);
uint32_t isaac_manager_poll_a6cf80_hook_slot_name_va(int32_t slot);
uint32_t isaac_manager_poll_a6cf80_hook_slot_ordinal(int32_t slot);

/* VA 0x00a6d167: CoInitializeEx returned RPC_E_CHANGED_MODE -> retry. */
int32_t isaac_manager_poll_a6cf80_coinit_retry_needed(uint32_t hr);

/* Values stored right before the first scan at 0x00a6d140: these arm the two
 * gates FUN_00a6dab0 reads (DAT_00c7e300 and DAT_00c7ac6b). */
uint32_t isaac_manager_poll_a6cf80_enable_after_init(void);
uint32_t isaac_manager_poll_a6cf80_enum_flag_after_init(void);

/* Constant accessors. */
uint32_t isaac_manager_poll_a6cf80_probe_count(void);
uint32_t isaac_manager_poll_a6cf80_coinit_flags_first(void);
uint32_t isaac_manager_poll_a6cf80_coinit_flags_retry(void);
uint32_t isaac_manager_poll_a6cf80_notify_filter_bytes(void);
uint32_t isaac_manager_poll_a6cf80_notify_filter_cbsize(void);

/* ---------------------------------------------------------------------------
 * ABI v19 — Manager shell body after the poll prefix (inside FUN_00954cd0).
 * The per-frame entry into this subsystem. All callees below stay host.
 * --------------------------------------------------------------------------- */

/* Manager field offsets used by the shell body. */
enum {
  ISAAC_MANAGER_SHELL_OFF_STATE = 0x8,          /* state machine discriminant */
  ISAAC_MANAGER_SHELL_OFF_COUNTER = 0x4abbc,    /* v2 early-skip counter */
  ISAAC_MANAGER_SHELL_OFF_FLAG_A = 0x4abc4,
  ISAAC_MANAGER_SHELL_OFF_FLAG_B = 0x4abc5,
  ISAAC_MANAGER_SHELL_OFF_PAUSE_FLAG = 0x2a3c0,
  ISAAC_MANAGER_SHELL_OFF_SUB_9C34F0 = 0x4d070, /* receiver for host 9c34f0 */
  ISAAC_MANAGER_SHELL_OFF_APPROACH = 0x4a950,   /* approach block base */
  ISAAC_MANAGER_SHELL_OFF_SUB_90B150 = 0x4b3d8, /* receiver for host 90b150 */
  ISAAC_MANAGER_SHELL_OFF_PROBE_A = 0x4c610,
  ISAAC_MANAGER_SHELL_OFF_PROBE_B = 0x4c658
};

/* Receiver ids for receiver_ofs / receiver_addr. */
enum {
  ISAAC_MANAGER_SHELL_RECV_SELF = 0,      /* host 0095b310 (this = Manager) */
  ISAAC_MANAGER_SHELL_RECV_9C34F0 = 1,    /* Manager + 0x4d070 */
  ISAAC_MANAGER_SHELL_RECV_APPROACH = 2,  /* Manager + 0x4a950 */
  ISAAC_MANAGER_SHELL_RECV_90B150 = 3,    /* Manager + 0x4b3d8 */
  ISAAC_MANAGER_SHELL_RECV_COUNT = 4
};

/* Approach block geometry (2 slots of 0x130 bytes starting at base+0x114). */
enum {
  ISAAC_MANAGER_APPROACH_SLOT_COUNT = 2,
  ISAAC_MANAGER_APPROACH_SLOT_STRIDE = 0x130,
  ISAAC_MANAGER_APPROACH_FIRST_OFS = 0x114,
  ISAAC_MANAGER_APPROACH_OFF_CURRENT = 0x0,
  ISAAC_MANAGER_APPROACH_OFF_TARGET = 0x4,
  ISAAC_MANAGER_APPROACH_OFF_MODE = 0x10,
  /* `cmp dword [slot+0x10],0x20 / je skip` — host runs when NOT equal.
     ABI v2 recorded this constant as 1; the PE immediate is 0x20. */
  ISAAC_MANAGER_APPROACH_MODE_SKIP_HOST = 0x20
};

/* State machine: index = state - 1, unsigned bound 4, table at 0x0095559c. */
enum {
  ISAAC_MANAGER_SHELL_STATE_MIN = 1,
  ISAAC_MANAGER_SHELL_STATE_MAX = 5,
  ISAAC_MANAGER_SHELL_STATE_TABLE_VA = 0x0095559cu,
  ISAAC_MANAGER_SHELL_STATE_DEFAULT_VA = 0x009553efu
};

/* Byte offset of a shell receiver, or 0xffffffff for an unknown id. */
uint32_t isaac_manager_shell_receiver_ofs(int32_t recv_id);

/* Absolute receiver address = manager + receiver_ofs (32-bit wrap).
 * Returns 0xffffffff for an unknown id. */
uint32_t isaac_manager_shell_receiver_addr(uint32_t manager, int32_t recv_id);

/* Address of an approach slot: base + 0x114 + slot * 0x130 (32-bit wrap). */
uint32_t isaac_manager_approach_slot_addr(uint32_t approach_base,
                                          uint32_t slot);

/* VA 0x00955023: `inc edi / cmp edi,2 / jb` — unsigned, `inc` wraps. */
int32_t isaac_manager_approach_slot_continue(uint32_t slot);

/* VA 0x00954fcd…0x00954fd6: `comiss current,target / jbe add_path`.
 * Returns 1 for the add path, which includes the unordered (NaN) case. */
int32_t isaac_manager_approach_uses_add_path(float current, float target);

/* VA 0x00954fff…0x0095500b: host FUN_00424130 runs when mode != 0x20. */
int32_t isaac_manager_approach_host_call_needed(uint32_t mode_10);

/* PE `push edi` before the host call — the loop index is arg1 (cdecl arg0 is
 * the stack buffer pointer). */
uint32_t isaac_manager_approach_host_arg_slot(uint32_t slot);

/* VA 0x0095502c: byte Manager+0x4abc5 is stored 0 after the approach loop. */
uint32_t isaac_manager_shell_flag_b_after_loop(void);

/* VA 0x00955033…0x00955043: probe block runs when probe_a == 0 AND
 * probe_b <= 0. The second test is a SIGNED `jg` skip. */
int32_t isaac_manager_shell_probe_needed(uint32_t probe_a_4c610,
                                         int32_t probe_b_4c658);

/* VA 0x009550b2: host FUN_0090b150 returned non-zero -> skip the game branch
 * and fall through to the state machine. Low-byte AL test. */
int32_t isaac_manager_shell_sub_90b150_blocks(uint32_t al);

/* VA 0x009550b9…0x009550c1: the game branch needs state 2 or state 5. */
int32_t isaac_manager_shell_state_uses_game(int32_t state_8);

/* VA 0x009550c9: g_Game (DAT_00c71678) non-null. */
int32_t isaac_manager_shell_game_present(uint32_t game_c71678);

/* VA 0x00955134…0x00955144 (second site of the ABI v2 flag pair):
 * flag_a != 0 AND flag_b == 0 -> full early return at 0x00955586. */
int32_t isaac_manager_shell_silent_return(uint32_t flag_a_4abc4,
                                          uint32_t flag_b_4abc5);

/* VA 0x00955192: `dec eax` — the jump-table index is state - 1 (wraps). */
uint32_t isaac_manager_shell_state_index(int32_t state_8);

/* VA 0x00955193…0x00955196: `cmp eax,4 / ja default` — UNSIGNED, so state 0
 * wraps to 0xffffffff and takes the default arm. */
int32_t isaac_manager_shell_state_in_table(int32_t state_8);

/* Jump-table target for a state, or the default arm VA when out of range. */
uint32_t isaac_manager_shell_state_target_va(int32_t state_8);

/* Constant accessors. */
uint32_t isaac_manager_shell_state_table_va(void);
uint32_t isaac_manager_shell_state_default_va(void);
uint32_t isaac_manager_approach_slot_count(void);
uint32_t isaac_manager_approach_slot_stride(void);

/* ---------------------------------------------------------------------------
 * ABI v20 — post-opaque-call recapture discipline (audit F10 / F11) and the
 * state-2 frame-path arm at 0x009551a3.
 * --------------------------------------------------------------------------- */

/* --- F10: FUN_00a6dd30 x/y lane recapture --- */

/* Did the x-lane callback actually execute? Both the change gate and the
 * callback pointer must pass, using the PRE-call callback value. */
int32_t isaac_manager_poll_a6dd30_x_cb_ran(float new_x, float old_x,
                                           uint32_t cb_before);

/* Axis array base the y lane stores through. The PE re-reads [device+0x18] at
 * 0x00a6dddf only when the x callback ran; otherwise edx still holds the
 * pre-call value. */
uint32_t isaac_manager_poll_a6dd30_y_axis_base(int32_t x_cb_ran,
                                               uint32_t base_before,
                                               uint32_t base_after);

/* Callback pointer the y lane gates on. Re-read from DAT_00c78d70 at
 * 0x00a6dde5 under the same condition. A callback that unregisters itself
 * therefore suppresses the y-lane call. */
uint32_t isaac_manager_poll_a6dd30_y_cb_ptr(int32_t x_cb_ran,
                                            uint32_t cb_before,
                                            uint32_t cb_after);

/* Full y-lane gate using the recaptured pointer. */
int32_t isaac_manager_poll_a6dd30_y_cb_needed(float new_y, float old_y,
                                              int32_t x_cb_ran,
                                              uint32_t cb_before,
                                              uint32_t cb_after);

/* Both lanes report the same timestamp: xmm3 is spilled at 0x00a6dd3d and
 * reloaded from [ebp-0xc] at 0x00a6ddeb after the callback clobbers it.
 * Returns 1 (documentation of an invariant the driver must preserve). */
int32_t isaac_manager_poll_a6dd30_timestamp_is_stable(void);

/* --- F11: FUN_00a1f280 action push snapshot discipline --- */

/* The slot offset uses the mode_cc re-read at 0x00a1f4e4, NOT the one the idle
 * gate read at 0x00a1f4c9. Returns the value that reaches the offset. */
uint32_t isaac_manager_poll_a1f280_action_slot_mode_cc(
    uint32_t mode_cc_after_vcall);

/* Store base: the PE re-reads [device+0x10] at 0x00a1f513 only on the OOR-log
 * path; the in-range path keeps the read from 0x00a1f4ea. */
uint32_t isaac_manager_poll_a1f280_action_store_base(int32_t oor_log_ran,
                                                     uint32_t begin_before,
                                                     uint32_t begin_after);

/* Full store address = base + slot_offset(mode_cc, index) (32-bit wrap).
 * `index` and `mode_cc` come from the stack spills, so they are frozen across
 * the log call even when the base is refreshed. */
uint32_t isaac_manager_poll_a1f280_action_store_addr(uint32_t store_base,
                                                     uint32_t mode_cc,
                                                     uint32_t index);

/* The range check at 0x00a1f503 uses the count derived from the PRE-log
 * begin/end pair, even when the store base is later refreshed. Returns 1. */
int32_t isaac_manager_poll_a1f280_action_count_is_prelog(void);

/* --- State-2 arm @ 0x009551a3 (frame path into Game::Update) --- */

/* Manager / container / entity field offsets used by the arm. */
enum {
  ISAAC_MANAGER_STATE2_OFF_BLOCK_FLAG = 0x4b130, /* byte; non-zero -> default */
  ISAAC_MANAGER_STATE2_OFF_PARITY = 0x4abbc,     /* counter; bit0 splits */
  ISAAC_GAME_STATE2_OFF_CONTAINER = 0x18300,     /* g_Game -> entity container */
  ISAAC_STATE2_OFF_ENTITY_COUNT = 0x1264,
  ISAAC_STATE2_OFF_ENTITY_ARRAY = 0x125c,
  ISAAC_STATE2_OFF_ENTITY_FLAG = 0x175,
  ISAAC_STATE2_OFF_ENTITY_SRC_A = 0x344,
  ISAAC_STATE2_OFF_ENTITY_SRC_B = 0x348,
  ISAAC_STATE2_OFF_ENTITY_DST_A = 0x33c,
  ISAAC_STATE2_OFF_ENTITY_DST_B = 0x340
};

/* Entity fixup copy pair ids. */
enum {
  ISAAC_STATE2_FIXUP_A = 0,
  ISAAC_STATE2_FIXUP_B = 1,
  ISAAC_STATE2_FIXUP_COUNT = 2
};

/* VA 0x009551c2: byte Manager+0x4b130 != 0 -> jump straight to the default
 * arm, skipping the sweep and the Game::Update call. */
int32_t isaac_manager_state2_blocked(uint32_t flag_4b130);

/* VA 0x009551cf: `test byte [Manager+0x4abbc],1 / jne` — bit0 of the shell
 * counter selects the alternate arm instead of the sweep. */
int32_t isaac_manager_state2_parity_alt(uint32_t counter_low_4abbc);

/* VA 0x009551e5…0x009551eb: `cmp [container+0x1264],0 / jbe skip` with the
 * index register still zero, so the sweep runs only for a non-zero count. */
int32_t isaac_manager_state2_sweep_needed(uint32_t entity_count);

/* VA 0x00955222…0x00955228: `inc esi / cmp esi,[container+0x1264] / jb`.
 * The bound is RE-DERIVED from the container every iteration, so the caller
 * must pass the reloaded count, not a folded one. Unsigned. */
int32_t isaac_manager_state2_sweep_step(uint32_t index,
                                        uint32_t entity_count_reloaded);

/* Address of the entity pointer for one iteration. The array base is also
 * re-read from [container+0x125c] every iteration (VA 0x009551f0). */
uint32_t isaac_manager_state2_entity_slot_addr(uint32_t array_base_reloaded,
                                               uint32_t index);

/* VA 0x009551f9: byte [entity+0x175] != 0 -> perform the copy pair. */
int32_t isaac_manager_state2_entity_needs_fixup(uint32_t flag_175);

/* Source / destination offsets of the two dword copies (VA 0x00955202…
 * 0x00955214). Unknown ids return 0xffffffff. */
uint32_t isaac_manager_state2_fixup_src_ofs(int32_t pair_id);
uint32_t isaac_manager_state2_fixup_dst_ofs(int32_t pair_id);

/* VA 0x0095521a: the flag byte is cleared after a fixup. */
uint32_t isaac_manager_state2_entity_flag_after_fixup(void);

/* ---------------------------------------------------------------------------
 * ABI v21 — the complete Manager shell state table (state-1 arm @ 0x009553a6,
 * state-2 arm head @ 0x009551a3, state-3/5 receivers), the pre-dispatch ladder
 * @ 0x0095514a, and a full translation of the leaf FUN_009505e0.
 * --------------------------------------------------------------------------- */

/* --- FUN_009505e0: complete leaf predicate, receiver Manager+0x4b3d8 --- */

/* Field ids for the two AND-pairs. The dword/byte split is load-bearing. */
enum {
  ISAAC_9505E0_FIELD_A_DWORD = 0, /* 0x1918, `cmp dword …,0` */
  ISAAC_9505E0_FIELD_A_BYTE = 1,  /* 0x1928, `cmp byte  …,0` */
  ISAAC_9505E0_FIELD_B_DWORD = 2, /* 0x1b6c, `cmp dword …,0` */
  ISAAC_9505E0_FIELD_B_BYTE = 3,  /* 0x1b7c, `cmp byte  …,0` */
  ISAAC_9505E0_FIELD_COUNT = 4
};

enum {
  ISAAC_9505E0_OFF_A_DWORD = 0x1918,
  ISAAC_9505E0_OFF_A_BYTE = 0x1928,
  ISAAC_9505E0_OFF_B_DWORD = 0x1b6c,
  ISAAC_9505E0_OFF_B_BYTE = 0x1b7c,
  /* Receiver is Manager+0x4b3d8 at both callsites (v19 RECV_90B150). */
  ISAAC_9505E0_RECV_OFS = 0x4b3d8
};

/* Complete body: `(A_dword && A_byte) || (B_dword && B_byte)`, returned in AL.
 * The byte parameters are deliberately wider than the PE field so the mask is
 * exercised rather than optimised away; 0x100 must read as clear. */
int32_t isaac_manager_9505e0_gate(uint32_t dword_1918, uint32_t byte_1928,
                                  uint32_t dword_1b6c, uint32_t byte_1b7c);

/* The B pair is only reached when the A pair fails (`je 0x9505f2` /
 * fallthrough), so a capture model must not record 4 unconditional reads. */
int32_t isaac_manager_9505e0_reads_b_pair(uint32_t dword_1918,
                                          uint32_t byte_1928);

/* Offset of a field relative to the receiver, or 0xffffffff for unknown ids. */
uint32_t isaac_manager_9505e0_field_ofs(int32_t field_id);

/* Same field relative to the Manager base (receiver_ofs + field_ofs). */
uint32_t isaac_manager_9505e0_manager_ofs(int32_t field_id);

/* --- FUN_009c3990 pure islands (the probe both arms open with) --- */

enum {
  ISAAC_9C3990_OFF_NODE_OBJ = 0x8,    /* [node+8] -> flags owner */
  ISAAC_9C3990_OFF_OBJ_FLAGS = 0x24,  /* `test byte [obj+0x24],4` */
  ISAAC_9C3990_MATCH_BIT = 0x4,
  ISAAC_9C3990_OFF_LOCK_SUBOBJ = 0x8, /* this+8 is the lock receiver */
  ISAAC_9C3990_LOCK_VTBL = 0xc,
  ISAAC_9C3990_UNLOCK_VTBL = 0x10,
  ISAAC_9C3990_LOCK_ARG = -1          /* `push -1` before the lock vcall */
};

/* VA 0x009c39b3: low-byte test of bit 2 of the flags byte. */
int32_t isaac_manager_9c3990_node_matches(uint32_t flags_byte_24);

/* VA 0x009c39a6 (entry) and 0x009c39bb (back edge) use the SAME comparison:
 * the circular list ends when the walk returns to the head. */
int32_t isaac_manager_9c3990_walk_continue(uint32_t node, uint32_t head);

/* Result byte for a list whose node flag bytes are `flag_bytes[0..n)`. */
int32_t isaac_manager_9c3990_result(const uint8_t* flag_bytes, uint32_t n);

/* Nodes actually examined: the walk stops at the FIRST match. */
uint32_t isaac_manager_9c3990_scanned(const uint8_t* flag_bytes, uint32_t n);

/* Both exits (match at 0x009c39ce, exhausted at 0x009c39bf) unlock. */
int32_t isaac_manager_9c3990_unlock_always(void);

/* Constant accessors. */
int32_t isaac_manager_9c3990_lock_arg(void);
uint32_t isaac_manager_9c3990_lock_vtbl_slot(void);
uint32_t isaac_manager_9c3990_unlock_vtbl_slot(void);

/* --- State arms --- */

enum {
  ISAAC_STATE_ARM_PROBE_RECV_OFS = 0x4d070, /* states 1 and 2 */
  ISAAC_STATE3_RECV_OFS = 0x20dd0,
  ISAAC_STATE5_RECV_OFS = 0x21628,
  ISAAC_STATE1_MODE_GLOBAL = 0x00c72a20,
  ISAAC_STATE1_MODE_OFS = 0x40,
  ISAAC_STATE1_MODE_MATCH = 0x11,   /* raw bytes `83 78 40 11` */
  ISAAC_STATE1_TERMINAL_VA = 0x009897d0,
  ISAAC_STATE2_TERMINAL_VA = 0x006fa540,
  ISAAC_STATE_ARM_PROBE_VA = 0x009c3990,
  ISAAC_STATE3_CALL_VA = 0x0095df20,
  ISAAC_STATE5_CALL_VA = 0x00920510
};

/* VA 0x009553b1…0x009553c3. DISJUNCTION: the mode match forces entry even when
 * the probe returned non-zero. `sete cl` reads the ZF of `test al,al`; the
 * intervening `mov eax,[0xc72a20]` does not touch flags. */
int32_t isaac_manager_state1_second_gate_needed(uint32_t probe_al,
                                                uint32_t mode_40);

/* The `[0xc72a20]` load and the `[eax+0x40]` dereference are issued before the
 * `cl` test, so they happen on every state-1 entry. Returns 1. */
int32_t isaac_manager_state1_mode_read_unconditional(void);

/* VA 0x009553cc…0x009553d0: a non-zero FUN_009505e0 result SKIPS the terminal
 * call, so the terminal runs on the "predicate clear" path. */
int32_t isaac_manager_state1_terminal_needed(uint32_t probe_al,
                                             uint32_t mode_40,
                                             uint32_t gate_al);

/* Same decision straight from the FUN_009505e0 fields — the cascade collapse
 * the leaf translation buys. */
int32_t isaac_manager_state1_terminal_needed_from_fields(
    uint32_t probe_al, uint32_t mode_40, uint32_t dword_1918,
    uint32_t byte_1928, uint32_t dword_1b6c, uint32_t byte_1b7c);

/* VA 0x009551ae…0x009551b0: no mode disjunct on the state-2 arm. */
int32_t isaac_manager_state2_head_gate_needed(uint32_t probe_al);

/* VA 0x009551b9…0x009551bd, mirror of the state-1 terminal decision. */
int32_t isaac_manager_state2_head_terminal_needed(uint32_t probe_al,
                                                  uint32_t gate_al);

int32_t isaac_manager_state2_head_terminal_needed_from_fields(
    uint32_t probe_al, uint32_t dword_1918, uint32_t byte_1928,
    uint32_t dword_1b6c, uint32_t byte_1b7c);

/* Receiver offset / callee VA for a state arm; 0xffffffff for state 4 (whose
 * table slot is the default VA) and for states outside 1…5. */
uint32_t isaac_manager_shell_arm_recv_ofs(int32_t state_8);
uint32_t isaac_manager_shell_arm_call_va(int32_t state_8);

/* Terminal-call VAs (each has exactly one rel32 callsite in .text). */
uint32_t isaac_manager_state1_terminal_va(void);
uint32_t isaac_manager_state2_head_terminal_va(void);

/* --- Pre-dispatch ladder @ 0x0095514a…0x00955189 --- */

enum {
  ISAAC_PREDISPATCH_FIELD_OBJ = 0,      /* 0x21c38, dword */
  ISAAC_PREDISPATCH_FIELD_RECV = 1,     /* 0x21c1c, receiver base */
  ISAAC_PREDISPATCH_FIELD_SUPPRESS = 2, /* 0x29fb8, byte */
  ISAAC_PREDISPATCH_FIELD_MODE = 3,     /* 0x2a378, dword vs 1 */
  ISAAC_PREDISPATCH_FIELD_COUNT = 4
};

enum {
  ISAAC_PREDISPATCH_OFF_OBJ = 0x21c38,
  ISAAC_PREDISPATCH_OFF_RECV = 0x21c1c,
  ISAAC_PREDISPATCH_OFF_SUPPRESS = 0x29fb8,
  ISAAC_PREDISPATCH_OFF_MODE = 0x2a378,
  ISAAC_PREDISPATCH_MODE_MATCH = 1,
  /* Queue dwords read through esi = Manager+0x4b3d8. */
  ISAAC_PREDISPATCH_QUEUE_BEGIN_OFS = 0x0,
  ISAAC_PREDISPATCH_QUEUE_END_OFS = 0x4,
  ISAAC_PREDISPATCH_CALL_VA = 0x00931ba0
};

/* VA 0x00955156…0x00955161: the opaque call runs only when the object pointer
 * is non-null AND the suppress byte is clear. */
int32_t isaac_manager_predispatch_call_needed(uint32_t obj_21c38,
                                              uint32_t suppress_29fb8);

/* VA 0x00955168: CONDITIONAL recapture. Both skip paths keep read #1, so a
 * model that always takes the post-call value is as wrong as one that always
 * takes the pre-call value. */
uint32_t isaac_manager_predispatch_obj_after(int32_t call_ran,
                                             uint32_t obj_before,
                                             uint32_t obj_after);

/* VA 0x00955172: the suppress byte is read a SECOND time. With no call in
 * between the two reads observe the same memory, so this is only a genuine
 * recapture on the call path. */
uint32_t isaac_manager_predispatch_suppress_after(int32_t call_ran,
                                                  uint32_t suppress_before,
                                                  uint32_t suppress_after);

/* VA 0x0095516e…0x00955182: all three post-call gates must pass to reach the
 * queue comparison; any failure jumps to the dispatch at 0x0095518f. */
int32_t isaac_manager_predispatch_queue_gate_reached(
    uint32_t obj_before, uint32_t suppress_before, uint32_t obj_after,
    uint32_t suppress_after, uint32_t mode_2a378);

/* VA 0x00955184…0x00955189: equal dwords send control to the DEFAULT arm and
 * the jump table is never consulted. */
int32_t isaac_manager_predispatch_forces_default(uint32_t queue_begin,
                                                 uint32_t queue_end);

/* Whole ladder: 1 = fall into the jump-table dispatch, 0 = default arm. */
int32_t isaac_manager_predispatch_dispatches(
    uint32_t obj_before, uint32_t suppress_before, uint32_t obj_after,
    uint32_t suppress_after, uint32_t mode_2a378, uint32_t queue_begin,
    uint32_t queue_end);

/* Byte offset of a ladder field, or 0xffffffff for unknown ids. */
uint32_t isaac_manager_predispatch_field_ofs(int32_t field_id);

/* Recorded reachability defect: the state-2 arm dereferences g_Game with no
 * null test (0x009551d8 / 0x00955246). Returns 0 — the port must not add a
 * guard the original lacks. */
int32_t isaac_manager_state2_game_null_guarded(void);

/* ---------------------------------------------------------------------------
 * ABI v22 — state-2 arm remainder (0x00955238…0x009552bd), the 4-slot
 * angle-wrap loop (0x009552cf…0x009553a4), and the dispatch-common tail's
 * float approach (0x009553ef…0x0095545e). All VAs inside
 * FUN_00954cd0 (Manager shell). No Update ABI change.
 * ------------------------------------------------------------------------- */

enum {
  /* Parity-alt entry gate byte (the v19 early-skip field, same Manager byte). */
  ISAAC_STATE2_MID_OFF_2A3C0 = 0x2a3c0,
  /* g_Game dwords read AFTER the IsPaused call (recaptured, never pre-call). */
  ISAAC_STATE2_MID_OFF_GAME_A = 0x1b83c,
  ISAAC_STATE2_MID_OFF_GAME_B = 0x1b858,
  ISAAC_STATE2_MID_GAME_B_MATCH = 0x13,
  /* Mode dword on the Manager global [0xc7169c]. */
  ISAAC_STATE2_MID_OFF_MODE = 0x2a380,
  ISAAC_STATE2_MID_MODE_V2 = 2,
  /* The parity byte [Manager+0x4abbc] & 1, read and spilled before the calls. */
  ISAAC_STATE2_MID_OFF_PARITY = 0x4abbc,
  /* Receiver: obj = [[g_Game + 0x18300] + 0x11f8] (container 0x18300 is the
   * v20 GAME_STATE2_OFF_CONTAINER; the inner deref is 0x11f8). */
  ISAAC_STATE2_MID_OFF_OBJ_INNER = 0x11f8,
  /* Always-on write on the parity path: byte [obj + 0x8c] = 0. */
  ISAAC_STATE2_MID_OFF_OBJ_BYTE = 0x8c,
  /* The three opaque calls (address-stable; no exact ZHL match). */
  ISAAC_STATE2_MID_CALL_A_VA = 0x009446e0, /* v == 2, this = obj */
  ISAAC_STATE2_MID_CALL_B_VA = 0x009439d0, /* v != 2, this = obj, 1 dword arg */
  ISAAC_STATE2_MID_PARITY_CALL_VA = 0x006fd3f0, /* 0x2a3c0 gate */
  ISAAC_STATE2_MID_IS_PAUSED_VA = 0x006fd350
};

/* VA 0x00955238…0x00955245: set byte → opaque call 0x6fd3f0, clear → fall
 * straight into 0x00955246. The same byte field the v19 early-skip reads. */
int32_t isaac_manager_state2_mid_parity_gate_needed(uint32_t flag_2a3c0);

/* VA 0x00955271…0x00955283: paused==0 always dispatches; when paused, both
 * post-call g_Game dwords must pass (`!= 0` and `== 0x13`, full dword). */
int32_t isaac_manager_state2_mid_dispatch_needed(uint32_t paused_al,
                                                 uint32_t dword_1b83c,
                                                 uint32_t dword_1b858);

/* VA 0x00955290…0x00955298: the sub/je + sub/jne ladder is `mode == 2`, NOT a
 * 1-then-2 dispatch — mode 1 and every mode != 2 take the parity call. */
int32_t isaac_manager_state2_mid_mode_is_two(uint32_t mode_2a380);

/* VA 0x0095525e…0x00955266: `mov al, byte [edi+0x4abbc]; and al,1`. */
uint32_t isaac_manager_state2_mid_parity_bit(uint32_t counter_4abbc);

/* VA 0x009552a5 / 0x009552bd: byte [obj+0x8c] = 0 runs on the v==2 path only
 * when the spilled parity byte is set, and ALWAYS on the other path.
 * `parity_byte` is the reduced 0/1 spill; the body still narrows (byte test). */
int32_t isaac_manager_state2_mid_write_byte_needed(uint32_t mode_2a380,
                                                   uint32_t parity_byte);

uint32_t isaac_manager_state2_mid_call_a_va(void);
uint32_t isaac_manager_state2_mid_call_b_va(void);
uint32_t isaac_manager_state2_mid_parity_call_va(void);
uint32_t isaac_manager_state2_mid_is_paused_va(void);
uint32_t isaac_manager_state2_mid_obj_inner_ofs(void);
uint32_t isaac_manager_state2_mid_obj_byte_ofs(void);
uint32_t isaac_manager_state2_mid_mode_ofs(void);

/* --- 4-slot angle-wrap loop @ 0x009552cf…0x009553a4 (pure, no calls) --- */

enum {
  /* Slot array on g_Game (reloaded at 0x009552c4). */
  ISAAC_SHELL_ANGLE_BASE_OFS = 0x1bab4,
  ISAAC_SHELL_ANGLE_SLOT_STRIDE = 0x14,
  ISAAC_SHELL_ANGLE_SLOT_COUNT = 4,
  /* Count pair re-read INSIDE the loop body on every iteration. */
  ISAAC_SHELL_ANGLE_COUNT_END_OFS = 0x1bb1c,
  ISAAC_SHELL_ANGLE_COUNT_BEGIN_OFS = 0x1bb18,
  /* .rdata constants (section-aware reads, see v21 §6b): */
  ISAAC_SHELL_ANGLE_HALF_MUL_BITS = 0x3f000000u,  /* 0.5f   @ 0x00baa2d0 */
  ISAAC_SHELL_ANGLE_EPS_BITS = 0x3e800000u,       /* 0.25f  @ 0x00baa1d4 */
  ISAAC_SHELL_ANGLE_NEG_EPS_BITS = 0xbe800000u,   /* -0.25f @ 0x00baad10 */
  ISAAC_SHELL_ANGLE_ABS_MASK_VA = 0x00bacb40u,    /* 0x7fffffff x4 */
  ISAAC_SHELL_ANGLE_SIGN_MASK_VA = 0x00bacb70u,   /* 0x80000000 x4 */
  ISAAC_SHELL_ANGLE_FIXUP_VA = 0x00bacb00u        /* [0.0, 2^32] pair */
};

/* SAR32(end - begin, 2) with 32-bit wrap on the subtract (0x009552f9…).
 * Re-derivation per iteration is the caller's contract — the pair is read
 * from memory inside the loop, so a folded count is wrong. */
int32_t isaac_manager_shell_angle_wrap_count(uint32_t end_1bb1c,
                                             uint32_t begin_1bb18);

/* Slot gate: signed dword [ecx] < 0 skips the slot (no store). */
int32_t isaac_manager_shell_angle_wrap_active(int32_t dword_0);

/* One slot body: wrap `w = float(dword_8) - value` into [-count/2, count/2)
 * (cvtdq2pd + unsigned fixup + cvtpd2ps count), snap to the index when
 * |w| < 0.25, else step the ORIGINAL value by ±0.25 (NaN → -0.25 arm).
 * Exact comiss/NaN rules: jb/jbe take the unordered branch, ja/jae never do.
 * Returns the value that lands in [slot+0xc] (== input when the slot skips). */
float isaac_manager_shell_angle_wrap_slot(int32_t dword_0, int32_t dword_8,
                                          float value, uint32_t end_1bb1c,
                                          uint32_t begin_1bb18);

/* --- dispatch-common tail float approach @ 0x009553ef…0x0095545e --- */

enum {
  ISAAC_SHELL_APPROACH_RECV_OFS = 0x2a324,   /* ecx for the host call */
  ISAAC_SHELL_APPROACH_VALUE_OFS = 0x2a334,  /* recv + 0x10 */
  ISAAC_SHELL_APPROACH_STEP_OFS = 0x2a338,   /* recv + 0x14 */
  ISAAC_SHELL_APPROACH_TARGET_BITS = 0x3f800000u, /* 1.0f @ 0x00baa454 */
  ISAAC_SHELL_APPROACH_HOST_VA = 0x0092e430u /* opaque; ZHL name not promoted */
};

/* VA 0x009553f5/0x00955400: g_Game non-null AND IsPaused() == 0. */
int32_t isaac_manager_shell_approach_tail_needed(uint32_t game_c71678,
                                                 uint32_t paused_al);

/* VA 0x00955421/0x00955432: ucomiss+lahf+test ah,0x44+jnp skips EXACTLY on
 * ordered equality — value == 1.0f or step == 0.0f (NaN falls through; -0.0
 * compares equal). Skip means: no store AND no host call. */
int32_t isaac_manager_shell_approach_tail_store_needed(float value_2a334,
                                                       float step_2a338);

/* VA 0x00955434…0x00955459: step toward 1.0 by |1.0 - value| — land exactly
 * on 1.0 when step >= |value - 1.0| (jae, ordered), else value ± step
 * (jbe → subtract arm). Returns the stored float for [recv+0x10]. */
float isaac_manager_shell_approach_tail_next(float value_2a334,
                                             float step_2a338);

uint32_t isaac_manager_shell_approach_tail_host_va(void);
uint32_t isaac_manager_shell_approach_tail_recv_ofs(void);
uint32_t isaac_manager_shell_approach_tail_value_ofs(void);
uint32_t isaac_manager_shell_approach_tail_step_ofs(void);

/* ---------------------------------------------------------------------------
 * ABI v23 — state-2 arm tail call sites (0x00955463…0x009554a0,
 * FUN_00954cd0). Two typed host events with the exact PE argument order:
 *
 *   0x00955463 lea ecx,[edi+0x29fbc]      receiver A = Manager+0x29fbc
 *   0x00955469 call 0x7e17b0              HOST opaque (no exact ZHL match;
 *                                         caller census: only 0x955469).
 *                                         UNCONDITIONAL here: every skip
 *                                         branch of the approach tail
 *                                         (0x009553f7 / 0x00955402 /
 *                                         0x00955421 / 0x00955432) lands at
 *                                         0x00955463.
 *   0x0095546e cmp byte [edi+0x2a3a6],0   gate: set → host B + ANM2::Play
 *   0x00955475 je 0x955580                clear → straight to the parity
 *                                         counter inc at 0x00955580
 *   0x0095547b mov ecx,[0xc7999c]         receiver B = dword [0xc7999c]
 *   0x00955481 xor edx,edx                edx arg = 0
 *   0x00955483 call 0xa264f0              HOST opaque (no exact ZHL match;
 *                                         caller census: 0x7ba00a, 0x955483)
 *   0x00955488 test eax,eax               ZF = (result == 0)
 *   0x0095548a mov ecx,0xb1bc54           "Idle"
 *   0x0095548f mov edx,0xb7c444           "Clicked"
 *   0x00955494 cmove edx,ecx              edx = result==0 ? Idle : Clicked
 *   0x00955497 lea ecx,[edi+0x4b2a8]      ANM2 receiver = Manager+0x4b2a8
 *   0x0095549d push 0                     arg1 reset = 0 (pushed FIRST →
 *                                         LAST cdecl arg)
 *   0x0095549f push edx                   arg0 anim = selected name
 *   0x009554a0 call 0x40a380              HOST ANM2::Play (EXACT ZHL,
 *                                         __thiscall void Play(const char*
 *                                         anim, bool reset), 129 pattern
 *                                         bytes). Cross-family fact from
 *                                         anm2_pure_helpers.h v5: the callee
 *                                         gate (skip = !reset && data =
 *                                         [this+0x34] && strcmp(...) == 0 &&
 *                                         (byte[data+0x34]==0 ||
 *                                         byte[this+0x44]!=0); call = !skip
 *                                         → HOST 0x0040a5d0(this, name, 1);
 *                                         if AL != 0 then Rewind(this+0x30)
 *                                         and byte[this+0x44] = 1) is the
 *                                         ANM2 family's translated surface —
 *                                         this slice emits the typed host
 *                                         edge with exact args only:
 *                                         this=Manager+0x4b2a8,
 *                                         anim=selected name, reset=0.
 *
 * This tail is on the frame path when the state-2 arm dispatches through the
 * common tail. The post-Play [0xc7999c] null assert (0x009554a5…0x009554c4)
 * and the poll-tail float block (0x009554c7…) remain host residual — that is
 * the next VA.
 * ------------------------------------------------------------------------- */

enum {
  /* receiver A: `lea ecx,[edi+0x29fbc]` @ 0x00955463 */
  ISAAC_STATE2_TAIL_OFF_CALL_A_RECV = 0x29fbc,
  ISAAC_STATE2_TAIL_CALL_A_VA = 0x007e17b0, /* opaque; caller 0x955469 only */
  /* gate B: `cmp byte ptr [edi+0x2a3a6],0` @ 0x0095546e */
  ISAAC_STATE2_TAIL_OFF_GATE_B = 0x2a3a6,
  ISAAC_STATE2_TAIL_CALL_B_VA = 0x00a264f0, /* opaque; callers 0x7ba00a,
                                                0x955483 */
  /* receiver B: `mov ecx,[0xc7999c]` — direct global deref, no null test */
  ISAAC_STATE2_TAIL_CALL_B_RECV_GLOBAL_VA = 0x00c7999c,
  ISAAC_STATE2_TAIL_CALL_B_EDX_ARG = 0, /* `xor edx,edx` @ 0x00955481 */
  /* name select: `mov ecx,0xb1bc54 / mov edx,0xb7c444 / cmove edx,ecx` */
  ISAAC_STATE2_TAIL_ANIM_IDLE_VA = 0x00b1bc54,    /* "Idle"    @ .rdata */
  ISAAC_STATE2_TAIL_ANIM_CLICKED_VA = 0x00b7c444, /* "Clicked" @ .rdata */
  /* ANM2::Play: `lea ecx,[edi+0x4b2a8]; push 0; push edx; call 0x40a380` */
  ISAAC_STATE2_TAIL_PLAY_VA = 0x0040a380, /* EXACT ZHL (129 pattern bytes) */
  ISAAC_STATE2_TAIL_OFF_PLAY_RECV = 0x4b2a8,
  ISAAC_STATE2_TAIL_PLAY_RESET_ARG = 0 /* `push 0` @ 0x0095549d */
};

/* VA 0x00955463…0x00955469: `lea ecx,[edi+0x29fbc]; call 0x7e17b0` — the
 * first typed host event of the tail. Runs on EVERY path through the common
 * tail (the four approach-tail skip branches all land at 0x00955463). */
uint32_t isaac_manager_state2_tail_call_a_va(void);
uint32_t isaac_manager_state2_tail_call_a_recv_ofs(void);

/* VA 0x0095546e…0x00955475: BYTE gate on [Manager+0x2a3a6]; set → host B
 * (0xa264f0) and the ANM2::Play edge run, clear → skip to 0x00955580. */
int32_t isaac_manager_state2_tail_call_b_needed(uint32_t byte_2a3a6);

/* VA 0x0095547b…0x00955483: host B — this = dword [0xc7999c] (runtime read,
 * NO null test in the PE), edx = 0. Exact argument order: (ecx, edx). */
uint32_t isaac_manager_state2_tail_call_b_va(void);
uint32_t isaac_manager_state2_tail_call_b_recv_global_va(void);
uint32_t isaac_manager_state2_tail_call_b_arg_edx(void);

/* VA 0x00955488…0x00955494: `test eax,eax / cmove` — the FULL dword is
 * tested; ZF=1 exactly when result == 0 → "Idle" (0xb1bc54), otherwise
 * "Clicked" (0xb7c444). */
uint32_t isaac_manager_state2_tail_anim_va(uint32_t result);

/* VA 0x00955497…0x009554a0: ANM2::Play host edge with exact args:
 * this = Manager+0x4b2a8, anim = isaac_manager_state2_tail_anim_va(result),
 * reset = 0. The callee-internal gate is the ANM2 family's surface (see the
 * cross-family fact above); this slice records the edge, not the body. */
uint32_t isaac_manager_state2_tail_play_va(void);
uint32_t isaac_manager_state2_tail_play_recv_ofs(void);
uint32_t isaac_manager_state2_tail_play_anim_idle_va(void);
uint32_t isaac_manager_state2_tail_play_anim_clicked_va(void);
uint32_t isaac_manager_state2_tail_play_reset_arg(void);

/* ---------------------------------------------------------------------------
 * ABI v24 -- Manager shell GLFW window tail (0x009554a5…0x00955580,
 * FUN_00954cd0). The LAST instruction block of the shell: ret @ 0x00955599
 * (FUN_00954cd0's epilogue, then the v21 state-dispatch jump table). The
 * complete PE body, with every pure gate derived from the instruction stream:
 *
 *   0x009554a5 mov esi,[0xc7999c]        window = DAT_00c7999c
 *   0x009554ab test esi,esi / jne          window!=NULL -> skip assert
 *   0x009554af push 0x310                  _wassert(msg=0xb9bbcc
 *   0x009554b4 push 0xb9bbf0                L"window != NULL",
 *   0x009554b9 push 0xb9bbcc                file=0xb9bbf0 (input.c), 784)
 *   0x009554be call dword ptr [0xb18884]    HOST CRT _wassert (IAT slide,
 *                                          api-ms-win-crt-runtime). No
 *                                          exact ZHL; address-stable.
 *   0x009554c7 cmp dword [0xc73680],0       DAT_00c73680 (SAME flag as the
 *                                          v3 poll prefix) -- set ->
 *                                          0x009554f0
 *   0x009554ce xorps xmm0,xmm0 / movsd      [esp+0x28]/[esp+0x20] = 0.0
 *                                          (both double locals pre-zeroed)
 *   0x009554df push 0; push 0x10001         HOST FUN_00a69f60(0x10001, 0)
 *   0x009554e6 call 0xa69f60                (same host call + args as v3)
 *   0x009554f0 cmp [esi+0x70],0x34003       win kind == 0x34003 (GLFW 3.4.3)
 *                                          -> DIRECT double copy from +0x1e0
 *                                          / +0x1e8 -- pure memory reads
 *   0x00955511 lea eax,[esp+0x20] …         else HOST (*DAT_00c736a0)
 *   0x0095551c call [0xc736a0]               (win, &d0, &d1) platform query
 *   0x00955531 cvtpd2ps xmm1,xmm1           f0 = (float) d0 round-half-even
 *   0x00955535 cvtpd2ps xmm0,xmm0           f1 = (float) d1
 *   0x00955539 ucomiss xmm1,[edi+0x4b3bc]   compare f0 vs stored0
 *   0x00955546 ucomiss xmm0,[edi+0x4b3c0]   compare f1 vs stored1
 *      both: lahf / test ah,0x44 / jp  -- jp is taken EXACTLY when the lane
 *      is NOT ordered-equal (mismatch or NaN) -> timer RESET. Fall-through =
 *      ordered equal (same idiom as the v20 a1f_280 clamp audit; NaN ->
 *      unordered -> jp -> reset).
 *   0x00955553 mov eax,[edi+0x4b3c4]        timer = read [edi+0x4b3c4]
 *   0x00955559 test eax,eax / jle 0x955570  signed: skip dec when <= 0
 *   0x0095555d dec eax / mov [edi+0x4b3c4]  timer--
 *   0x00955566 mov dword [edi+0x4b3c4],0x12c  timer = 300 (RESET)
 *   0x00955570 movss [edi+0x4b3bc],xmm1     store new f0
 *   0x00955578 movss [edi+0x4b3c0],xmm0     store new f1
 *   0x00955580 inc dword [edi+0x4abbc]      parity counter ++ (SAME field
 *                                           as MANAGER_SHELL_OFF_COUNTER,
 *                                           the counter the state-2 parity
 *                                           arm reads at 0x4abbc -- cross-
 *                                           field law). Unconditional.
 *
 * Host edges that remain: _wassert (IAT 0xb18884), FUN_00a69f60, and the
 * platform query (*DAT_00c736a0) -- all address-stable, args pinned. The
 * pure surface: win-assert gate, platform-dispatch gate, kind/direct-copy
 * gate, double->float narrowing, ordered-equality compare, timer decay/reset,
 * and the parity counter increment.
 * ------------------------------------------------------------------------- */

/* window = DAT_00c7999c; assert when NULL (0x009554ab) */
enum {
  ISAAC_SHELL_TAIL_WIN_GLOBAL_VA = 0x00c7999c,
  ISAAC_SHELL_TAIL_WASSERT_MSG_VA = 0x00b9bbcc, /* L"window != NULL" */
  ISAAC_SHELL_TAIL_WASSERT_FILE_VA = 0x00b9bbf0, /* GL input.c path */
  ISAAC_SHELL_TAIL_WASSERT_LINE = 0x310,          /* 784 */
  ISAAC_SHELL_TAIL_WASSERT_IAT_VA = 0x00b18884,   /* api-ms _wassert */
  /* win kind @ +0x70: == 0x34003 -> direct double copy from +0x1e0 / +0x1e8 */
  ISAAC_SHELL_TAIL_WIN_KIND_OFS = 0x70,
  ISAAC_SHELL_TAIL_WIN_KIND_DIRECT_COPY = 0x34003,
  ISAAC_SHELL_TAIL_WIN_D0_OFS = 0x1e0,
  ISAAC_SHELL_TAIL_WIN_D1_OFS = 0x1e8,
  /* platform branch: DAT_00c73680 == 0 -> FUN_00a69f60(0x10001, 0) */
  ISAAC_SHELL_TAIL_PLATFORM_FLAG_VA = 0x00c73680,
  ISAAC_SHELL_TAIL_PLATFORM_POLL_VA = 0x00a69f60,
  ISAAC_SHELL_TAIL_PLATFORM_POLL_ARG0 = 0x10001,
  ISAAC_SHELL_TAIL_PLATFORM_POLL_ARG1 = 0,
  /* host query when kind mismatch: (*DAT_00c736a0)(win, &d0, &d1) */
  ISAAC_SHELL_TAIL_PLATFORM_QUERY_VA = 0x00c736a0,
  /* stored floats/timer/parity on the Manager (edi): */
  ISAAC_SHELL_TAIL_STORE_F0_OFS = 0x4b3bc,
  ISAAC_SHELL_TAIL_STORE_F1_OFS = 0x4b3c0,
  ISAAC_SHELL_TAIL_TIMER_OFS = 0x4b3c4,
  ISAAC_SHELL_TAIL_TIMER_RESET = 0x12c, /* 300 */
  ISAAC_SHELL_TAIL_PARITY_OFS = 0x4abbc /* SAME field as MANAGER_SHELL_OFF_COUNTER */
};

/* window == NULL -> host _wassert(…, line 0x310) */
int32_t isaac_manager_shell_tail_win_assert_needed(uint32_t win);
uint32_t isaac_manager_shell_tail_wassert_msg_va(void);
uint32_t isaac_manager_shell_tail_wassert_file_va(void);
uint32_t isaac_manager_shell_tail_wassert_line(void);
uint32_t isaac_manager_shell_tail_wassert_iat_va(void);
uint32_t isaac_manager_shell_tail_win_global_va(void);

/* 0x009554c7: DAT_00c73680 == 0 -> host poll (same as v3 platform branch) */
int32_t isaac_manager_shell_tail_uses_platform_poll(uint32_t flag);
uint32_t isaac_manager_shell_tail_platform_poll_va(void);
uint32_t isaac_manager_shell_tail_platform_poll_arg0(void);
uint32_t isaac_manager_shell_tail_platform_poll_arg1(void);
uint32_t isaac_manager_shell_tail_platform_flag_va(void);

/* 0x009554f0: [win+0x70] == 0x34003 -> direct f64 copy from win+0x1e0/0x1e8 */
int32_t isaac_manager_shell_tail_direct_copy_needed(uint32_t kind);
uint32_t isaac_manager_shell_tail_kind_ofs(void);
uint32_t isaac_manager_shell_tail_kind_magic(void);
uint32_t isaac_manager_shell_tail_d0_ofs(void);
uint32_t isaac_manager_shell_tail_d1_ofs(void);
uint32_t isaac_manager_shell_tail_platform_query_va(void);

/* 0x00955531/…35 cvtpd2ps, 0x00955539/…51 ucomiss ordered-equality */
float isaac_manager_shell_tail_float_of_f64(double d);
int32_t isaac_manager_shell_tail_lane_ordered_equal(float a, float b);
int32_t isaac_manager_shell_tail_both_lanes_equal(float f0, float s0,
                                                  float f1, float s1);

/* timer decay / reset + parity counter (0x00955553…0x00955580) */
int32_t isaac_manager_shell_tail_timer_next(int32_t timer, int32_t both_equal);
uint32_t isaac_manager_shell_tail_timer_ofs(void);
uint32_t isaac_manager_shell_tail_timer_reset_value(void);
uint32_t isaac_manager_shell_tail_store_f0_ofs(void);
uint32_t isaac_manager_shell_tail_store_f1_ofs(void);
int32_t isaac_manager_shell_tail_parity_next(int32_t counter);
uint32_t isaac_manager_shell_tail_parity_ofs(void);

/* ===========================================================================
 * ABI v25 -- pre-poll state-machine block FUN_00954cd0 @ 0x00954d4d..0x00954f46
 * (the fragment between the v2 early-return `ret 4` at 0x00954d4a and the v3
 * poll gate at 0x00954f4d).  All byte gates take the RAW field value and
 * narrow to the low byte in the body (uint8_t-parameter defect class: the
 * Wasm ABI never narrows i32 arguments, so callers must pass unmasked values
 * such as 0x100/0xffffffff).
 *
 * Host edges (all still opaque; none side-effect-free, so no drops):
 *   A 0x00959720  this=Manager            unconditional after state-4 gate
 *   B 0x00959d00  this=Manager            unconditional + re-run in copy block
 *   C 0x00959670  this=Manager            G1 && G2 (exact ZHL
 *                                          Manager::cleanup_current_state, 9b)
 *   D 0x0095e7c0  recv Manager+0x20dd0,   G1 (exact ZHL Cutscene::Show(int),
 *                arg dword [Manager+0x2161c]   15b)
 *   E 0x00921ce0  recv Manager+0x21628,   G3 (exact ZHL NightmareScene::Show(
 *                arg byte [Manager+0x4b2a5]    bool), 75b)
 *   F 0x00954b40  this=Manager            G4
 *   G 0x00a0f550  recv = stack scratch,   G4; writes f0/f1/f2 at recv+0/+4/+8
 *                arg 0xff000000
 *   log 0x00a112c0 (1, 0xb7d234 "Cutscene End")  history == 1 (logger split:
 *                gate pure, emit host)
 *   H 0x007e1e70  recv Manager+0x29fbc,   history == 1 (exact ZHL
 *                args 0x3f, 0.08f               Music::Crossfade(int,float))
 *
 * Pure store block on G4 (recorded defect class, reproduced not corrected):
 *   g_Game = [0xc71678] is dereferenced with NO null test (0x00954e9c),
 *   then [g+0x265a4..0x265ac] = f0/f1/f2 from host G,
 *   [g+0x265b0] = f32(oldB0 + 1.0f) (oldB0 read before the movups),
 *   [g+0x265b4] = 0, [g+0x265b8] = 0x3f800000, [g+0x265bc] = 8.
 *
 * Cross-site laws (asserted in tests): 0x29fb8 == v21
 * ISAAC_PREDISPATCH_OFF_SUPPRESS; 0x20dd0 == ISAAC_STATE3_RECV_OFS;
 * 0x21628 == ISAAC_STATE5_RECV_OFS.
 * =========================================================================== */
enum {
  ISAAC_PREPOLL_STATE_OFS = 0x8,
  ISAAC_PREPOLL_HISTORY_OFS = 0xc,
  ISAAC_PREPOLL_G1_OFS = 0x21618,
  ISAAC_PREPOLL_CUTSCENE_ID_OFS = 0x2161c,
  ISAAC_PREPOLL_G2_OFS = 0x21620,
  ISAAC_PREPOLL_COPY_SLOT_INDEX_OFS = 0x215d8,
  ISAAC_PREPOLL_COPY_SRC_BASE = 0x20e00,
  ISAAC_PREPOLL_COPY_SRC_DW = 0x20e10,
  ISAAC_PREPOLL_COPY_STRIDE = 0x4c,
  ISAAC_PREPOLL_COPY_DST_CORE = 0x4b290,
  ISAAC_PREPOLL_COPY_DST_DW = 0x4b2a0,
  ISAAC_PREPOLL_COPY_DST_EXT = 0x4b28c,
  ISAAC_PREPOLL_COPY_EXT_FROM_OFS = 0x21624,
  ISAAC_PREPOLL_COPY_FLAG_OFS = 0x4b288,
  ISAAC_PREPOLL_COPY_FLAG_VALUE = 1,
  ISAAC_PREPOLL_G3_OFS = 0x4b2a4,
  ISAAC_PREPOLL_NIGHTMARE_ARG_OFS = 0x4b2a5,
  ISAAC_PREPOLL_G4_OFS = 0x4b428,
  ISAAC_PREPOLL_STATE3ARM_BYTE_OFS = 0x29fb8, /* SAME as v21 PREDISPATCH_OFF_SUPPRESS */
  ISAAC_PREPOLL_PREDISPATCH_RECV_OFS = 0x20dd0, /* SAME as v21 STATE3_RECV_OFS */
  ISAAC_PREPOLL_STATE5_RECV_OFS = 0x21628, /* SAME as v21 STATE5_RECV_OFS */
  ISAAC_PREPOLL_GAME_STORE_BASE_OFS = 0x265a4,
  ISAAC_PREPOLL_GAME_STORE_B4_OFS = 0x265b4,
  ISAAC_PREPOLL_GAME_STORE_B8_OFS = 0x265b8,
  ISAAC_PREPOLL_GAME_STORE_BC_OFS = 0x265bc,
  ISAAC_PREPOLL_GAME_STORE_B8_BITS = 0x3f800000, /* 1.0f */
  ISAAC_PREPOLL_GAME_STORE_BC_VALUE = 8,
  ISAAC_PREPOLL_CROSSFADE_RECV_OFS = 0x29fbc,
  ISAAC_PREPOLL_CROSSFADE_MUSIC_ID = 0x3f,
  ISAAC_PREPOLL_CROSSFADE_RATE_BITS = 0x3da3d70a, /* 0.08f */
  ISAAC_PREPOLL_HOST_A_VA = 0x00959720,
  ISAAC_PREPOLL_HOST_B_VA = 0x00959d00,
  ISAAC_PREPOLL_HOST_C_VA = 0x00959670,
  ISAAC_PREPOLL_HOST_D_VA = 0x0095e7c0,
  ISAAC_PREPOLL_HOST_E_VA = 0x00921ce0,
  ISAAC_PREPOLL_HOST_F_VA = 0x00954b40,
  ISAAC_PREPOLL_HOST_G_VA = 0x00a0f550,
  ISAAC_PREPOLL_HOST_G_ARG = 0xff000000,
  ISAAC_PREPOLL_LOG_VA = 0x00a112c0,
  ISAAC_PREPOLL_LOG_LEVEL = 1,
  ISAAC_PREPOLL_LOG_MSG_VA = 0x00b7d234, /* "Cutscene End" */
  ISAAC_PREPOLL_HOST_H_VA = 0x007e1e70,
  ISAAC_PREPOLL_STATE4_VALUE = 4,
  ISAAC_PREPOLL_STATE3_VALUE = 3,
  ISAAC_PREPOLL_STATE5_VALUE = 5,
  ISAAC_PREPOLL_ARM_POLL = 0,
  ISAAC_PREPOLL_ARM_STATE3 = 3,
  ISAAC_PREPOLL_ARM_STATE5 = 5
};

/* 0x00954d4d: byte [Manager+0x0] != 0 -> store state=4 + byte0=0 */
int32_t isaac_manager_prepoll_state4_store_needed(uint32_t byte0);
int32_t isaac_manager_prepoll_g1_needed(uint32_t byte21618);
int32_t isaac_manager_prepoll_g2_needed(uint32_t byte21620);
int32_t isaac_manager_prepoll_host_c_needed(uint32_t g1, uint32_t g2);
int32_t isaac_manager_prepoll_state3_transition_needed(uint32_t g1);
int32_t isaac_manager_prepoll_g3_needed(uint32_t byte4b2a4);
int32_t isaac_manager_prepoll_state5_transition_needed(uint32_t g3);
int32_t isaac_manager_prepoll_arm_select(int32_t state, uint32_t g3,
                                         int32_t dword21628,
                                         int32_t dword20dd0);
int32_t isaac_manager_prepoll_copy_block_needed(uint32_t arm_eax,
                                                uint32_t byte21620);
int32_t isaac_manager_prepoll_g4_needed(uint32_t byte4b428);
float isaac_manager_prepoll_game_b0_next(float old_b0);
int32_t isaac_manager_prepoll_log_needed(int32_t history);
uint32_t isaac_manager_prepoll_nightmare_arg(uint32_t byte4b2a5);
uint32_t isaac_manager_prepoll_copy_src_ofs(uint32_t slot_index);
uint32_t isaac_manager_prepoll_copy_src_dword_ofs(uint32_t slot_index);
uint32_t isaac_manager_prepoll_state_ofs(void);
uint32_t isaac_manager_prepoll_history_ofs(void);
uint32_t isaac_manager_prepoll_g1_ofs(void);
uint32_t isaac_manager_prepoll_cutscene_id_ofs(void);
uint32_t isaac_manager_prepoll_g2_ofs(void);
uint32_t isaac_manager_prepoll_copy_slot_index_ofs(void);
uint32_t isaac_manager_prepoll_copy_src_base(void);
uint32_t isaac_manager_prepoll_copy_src_dword(void);
uint32_t isaac_manager_prepoll_copy_stride(void);
uint32_t isaac_manager_prepoll_copy_dst_core_ofs(void);
uint32_t isaac_manager_prepoll_copy_dst_dword_ofs(void);
uint32_t isaac_manager_prepoll_copy_dst_ext_ofs(void);
uint32_t isaac_manager_prepoll_copy_ext_from_ofs(void);
uint32_t isaac_manager_prepoll_copy_flag_ofs(void);
uint32_t isaac_manager_prepoll_copy_flag_value(void);
uint32_t isaac_manager_prepoll_g3_ofs(void);
uint32_t isaac_manager_prepoll_nightmare_arg_ofs(void);
uint32_t isaac_manager_prepoll_g4_ofs(void);
uint32_t isaac_manager_prepoll_state3arm_byte_ofs(void);
uint32_t isaac_manager_prepoll_predispatch_recv_ofs(void);
uint32_t isaac_manager_prepoll_state5_recv_ofs(void);
uint32_t isaac_manager_prepoll_game_store_base_ofs(void);
uint32_t isaac_manager_prepoll_game_store_b4_ofs(void);
uint32_t isaac_manager_prepoll_game_store_b8_ofs(void);
uint32_t isaac_manager_prepoll_game_store_bc_ofs(void);
uint32_t isaac_manager_prepoll_game_store_b8_bits(void);
uint32_t isaac_manager_prepoll_game_store_bc_value(void);
uint32_t isaac_manager_prepoll_crossfade_recv_ofs(void);
uint32_t isaac_manager_prepoll_crossfade_music_id(void);
uint32_t isaac_manager_prepoll_crossfade_rate_bits(void);
uint32_t isaac_manager_prepoll_host_a_va(void);
uint32_t isaac_manager_prepoll_host_b_va(void);
uint32_t isaac_manager_prepoll_host_c_va(void);
uint32_t isaac_manager_prepoll_host_d_va(void);
uint32_t isaac_manager_prepoll_host_e_va(void);
uint32_t isaac_manager_prepoll_host_f_va(void);
uint32_t isaac_manager_prepoll_host_g_va(void);
uint32_t isaac_manager_prepoll_host_g_arg(void);
uint32_t isaac_manager_prepoll_log_va(void);
uint32_t isaac_manager_prepoll_log_level(void);
uint32_t isaac_manager_prepoll_log_msg_va(void);
uint32_t isaac_manager_prepoll_host_h_va(void);
uint32_t isaac_manager_prepoll_state4_value(void);

/* ===========================================================================
 * ABI v26 -- depth: FUN_00954b40 (host F of the v25 G4 arm; 398 B,
 * 0x00954b40..0x00954cce, ret @ 0x954cba/0x954cce, int3 @ 0x954ccf; 6 rel32
 * callsites image-wide; this=Manager in the shell but the body NEVER reads
 * this -- it uses the [0xc7169c] Manager global).  The v25 log text at
 * 0xb7e6bc ("PlayerManager::GetPlayer() : There are no players!") identifies
 * the scan; the symbol has NO exact ZHL, so all names are address-stable.
 *
 * PE flow (linear decode from the int3 run at 0x954b3a; verbatim transcript
 * in section-notes/process-input-v26/disasm-00954b40-00954cd0.txt):
 *   loop i in 0..count-1, count = SAR32([0xc57b24]-[0xc57b20])>>3 (8-byte
 *     refcounted {ptr,ctrl} elements of the global vector at 0xc57b18):
 *     pair = host accessor 0xa20240(0xc57b18, &pair, i)  (SEH + lock vcall +
 *       pair copy + unlock vcall; its PURE core is begin+i*8 when i<count)
 *     if pair.ptr == 0                  -> release, continue
 *     r = pair.ptr->vcall+0x3c(0)       (host vcall)
 *     if r == -1                        -> release, continue   (cmp eax,-1)
 *     [0xc7169c]+0x4abd4 = pair.ptr[0xc]
 *     if [0xc7169c]+8 == 2  (state==2, full dword):
 *       n = SAR32([g_Game+0x1baac]-[g_Game+0x1baa8])>>2,
 *           g_Game = [0xc71678], NO null test (recorded defect class,
 *           reproduced not corrected)
 *       if n == 0: host log 0xa112c0(0x10, 0xb7e6bc)
 *       host 0x7a6450(*[g_Game+0x1baa8], pair.ptr[0xc], 1)
 *           (exact ZHL Entity_Player::SetControllerIndex(int,bool), 44 bytes)
 *       [0xbf9444] = pair.ptr[0xc]
 *     release; return 1
 *   release (per iteration); return 0
 *   release = if pair.ctrl != 0: al = pair.ctrl->vcall+0xc();
 *              if al != 0 && [0xc7e814] != 0: host [0xc7e814](&pair)
 *
 * Byte gates narrow in the body; dword gates (state==2, count==0, ctrl!=0,
 * callback!=0, match != -1) are FULL 32-bit compares -- no masking.
 * =========================================================================== */
enum {
  ISAAC_PLAYERSCAN_ELEMENT_CTRL_OFS = 0xc,   /* dword at ptr+0xc */
  ISAAC_PLAYERSCAN_MANAGER_STORE_OFS = 0x4abd4,
  ISAAC_PLAYERSCAN_PLAYER_LIST_BEGIN_OFS = 0x1baa8,
  ISAAC_PLAYERSCAN_PLAYER_LIST_END_OFS = 0x1baac,
  ISAAC_PLAYERSCAN_VECTOR_THIS_VA = 0x00c57b18,
  ISAAC_PLAYERSCAN_VECTOR_BEGIN_VA = 0x00c57b20,
  ISAAC_PLAYERSCAN_VECTOR_END_VA = 0x00c57b24,
  ISAAC_PLAYERSCAN_VECTOR_LOCK_VA = 0x00c57b2c,
  ISAAC_PLAYERSCAN_VECTOR_STRIDE = 8,
  ISAAC_PLAYERSCAN_PLAYER_LIST_STRIDE = 4,
  ISAAC_PLAYERSCAN_LAST_INDEX_GLOBAL_VA = 0x00bf9444,
  ISAAC_PLAYERSCAN_RELEASE_CALLBACK_GLOBAL_VA = 0x00c7e814,
  ISAAC_PLAYERSCAN_MANAGER_GLOBAL_VA = 0x00c7169c,
  ISAAC_PLAYERSCAN_GAME_GLOBAL_VA = 0x00c71678,
  ISAAC_PLAYERSCAN_ACCESSOR_VA = 0x00a20240,
  ISAAC_PLAYERSCAN_SET_CONTROLLER_VA = 0x007a6450,
  ISAAC_PLAYERSCAN_SET_CONTROLLER_ARG = 1,
  ISAAC_PLAYERSCAN_MATCH_VCALL_SLOT = 0x3c,
  ISAAC_PLAYERSCAN_MATCH_VCALL_ARG = 0,
  ISAAC_PLAYERSCAN_MATCH_SENTINEL = 0xffffffff, /* -1: no match */
  ISAAC_PLAYERSCAN_RELEASE_VCALL_SLOT = 0xc,
  ISAAC_PLAYERSCAN_LOG_LEVEL = 0x10,
  ISAAC_PLAYERSCAN_LOG_MSG_VA = 0x00b7e6bc, /* "PlayerManager::GetPlayer() ..." */
  ISAAC_PLAYERSCAN_STATE2_VALUE = 2
};

/* 0x00954b85/8b: count = SAR32([0xc57b24]-[0xc57b20]) >> 3 (8-byte pairs) */
int32_t isaac_manager_playerscan_count_from_bounds(int32_t end,
                                                   int32_t begin);
/* 0x00a202ae lea eax,[ecx+edx*8]: slot address of element index (wrap) */
uint32_t isaac_manager_playerscan_element_ptr(uint32_t begin,
                                              uint32_t index);
/* 0x00954bde cmp eax,-1 / jne: vcall+0x3c(0) != -1 matches */
int32_t isaac_manager_playerscan_match_needed(int32_t vcall_result);
/* 0x00954c2c cmp dword [0xc7169c+8],2 (full dword) */
int32_t isaac_manager_playerscan_state2_gate(int32_t state);
/* 0x00954c44: n = SAR32([g+0x1baac]-[g+0x1baa8]) >> 2 (player ptrs) */
int32_t isaac_manager_playerscan_player_count_from_bounds(int32_t end,
                                                          int32_t begin);
/* 0x00954c49 test eax,eax / jne: log when n == 0 */
int32_t isaac_manager_playerscan_log_needed(int32_t player_count);
/* 0x00954bea test ecx,ecx / je: release vcall runs only when ctrl != 0 */
int32_t isaac_manager_playerscan_release_gate(uint32_t ctrl);
/* 0x00954bf8 test al,al (BYTE) && 0x00954c01 test eax,eax (dword) */
int32_t isaac_manager_playerscan_callback_needed(uint32_t vcall_al,
                                                 uint32_t callback);
uint32_t isaac_manager_playerscan_element_ctrl_ofs(void);
uint32_t isaac_manager_playerscan_manager_store_ofs(void);
uint32_t isaac_manager_playerscan_player_list_begin_ofs(void);
uint32_t isaac_manager_playerscan_player_list_end_ofs(void);
uint32_t isaac_manager_playerscan_vector_this_va(void);
uint32_t isaac_manager_playerscan_vector_begin_va(void);
uint32_t isaac_manager_playerscan_vector_end_va(void);
uint32_t isaac_manager_playerscan_vector_lock_va(void);
uint32_t isaac_manager_playerscan_vector_stride(void);
uint32_t isaac_manager_playerscan_player_list_stride(void);
uint32_t isaac_manager_playerscan_last_index_global_va(void);
uint32_t isaac_manager_playerscan_release_callback_global_va(void);
uint32_t isaac_manager_playerscan_manager_global_va(void);
uint32_t isaac_manager_playerscan_game_global_va(void);
uint32_t isaac_manager_playerscan_accessor_va(void);
uint32_t isaac_manager_playerscan_set_controller_va(void);
uint32_t isaac_manager_playerscan_set_controller_arg(void);
uint32_t isaac_manager_playerscan_match_vcall_slot(void);
uint32_t isaac_manager_playerscan_match_vcall_arg(void);
uint32_t isaac_manager_playerscan_match_sentinel(void);
uint32_t isaac_manager_playerscan_release_vcall_slot(void);
uint32_t isaac_manager_playerscan_log_level(void);
uint32_t isaac_manager_playerscan_log_msg_va(void);
uint32_t isaac_manager_playerscan_state2_value(void);

/* ===========================================================================
 * ABI v27 -- complete body of host G FUN_00a0f550 (v25 G4 arm colour
 * helper; 177 B, 0x00a0f550..ret 4 @ 0x00a0f601, int3 @ 0x00a0f604;
 * 483 rel32 callsites; no exact ZHL).  Consume render-shell P40 by
 * reference: packed ARGB bytes / DAT_00baaae4 (255.0f) -> float RGBA at
 * recv+0/+4/+8/+0xc, dword 0 at recv+0x10.  The v25 G4 arm pushes
 * 0xff000000 on a stack-scratch recv and consumes only f0/f1/f2.
 *
 * PE (linear decode, hash-bound; movzx path so the 0xbacb00 signed
 * i32->f64 table add is always slot 0 = 0.0):
 *   edx = packed; [ecx+0x10] = 0;
 *   [ecx+0]   = float((packed>>16)&0xff) / 255.0f   // R
 *   [ecx+4]   = float((packed>> 8)&0xff) / 255.0f   // G
 *   [ecx+8]   = float( packed      &0xff) / 255.0f   // B
 *   [ecx+0xc] = float((packed>>24)&0xff) / 255.0f   // A
 * Byte extracts take the RAW packed dword and narrow in the body
 * (uint8_t-parameter defect class).  Not Update-wired.
 *
 * Next exact VA after v27: 0x00959d00 (host B).  ABI v28 landed that
 * peel; host A 0x00959720 is the remaining this=Manager non-ZHL
 * sibling.  Hosts C/D/E/H stay stateful.  FUN_00a0f550 itself is now
 * a translated complete body; the G4 arm still lists it as host G
 * (no frame-path edit).
 * =========================================================================== */
enum {
  ISAAC_A0F550_F0_OFS = 0x0,            /* R */
  ISAAC_A0F550_F1_OFS = 0x4,            /* G */
  ISAAC_A0F550_F2_OFS = 0x8,            /* B -- last lane G4 consumes */
  ISAAC_A0F550_F3_OFS = 0xc,            /* A */
  ISAAC_A0F550_TAIL_OFS = 0x10,
  ISAAC_A0F550_TAIL_STORE = 0,
  ISAAC_A0F550_DENOM_BITS = 0x437f0000, /* DAT_00baaae4 = 255.0f */
  ISAAC_A0F550_DENOM_VA = 0x00baaae4,
  ISAAC_A0F550_SIGNED_TABLE_VA = 0x00bacb00,
  ISAAC_A0F550_VA = 0x00a0f550,
  ISAAC_A0F550_RET_VA = 0x00a0f601,
  ISAAC_A0F550_BODY_BYTES = 0xb1,       /* 177 */
  ISAAC_A0F550_NEXT_VA = 0x00959d00     /* host B */
};

/* 0x00a0f558/0x55b: movzx eax, byte (packed>>16) -- R */
uint32_t isaac_manager_a0f550_r(uint32_t packed);
/* 0x00a0f583/0x586: movzx eax, byte (packed>>8) -- G */
uint32_t isaac_manager_a0f550_g(uint32_t packed);
/* 0x00a0f5a9: movzx eax, dl -- B */
uint32_t isaac_manager_a0f550_b(uint32_t packed);
/* 0x00a0f5ac: shr edx, 0x18 -- A (edx already the packed dword) */
uint32_t isaac_manager_a0f550_a(uint32_t packed);
/* cvtdq2pd + cvtpd2ps + divss DAT_00baaae4; byte gate narrows in body */
float isaac_manager_a0f550_channel_f32(uint32_t byte);
float isaac_manager_a0f550_f0(uint32_t packed);
float isaac_manager_a0f550_f1(uint32_t packed);
float isaac_manager_a0f550_f2(uint32_t packed);
float isaac_manager_a0f550_f3(uint32_t packed);
uint32_t isaac_manager_a0f550_tail_store(void);
uint32_t isaac_manager_a0f550_f0_ofs(void);
uint32_t isaac_manager_a0f550_f1_ofs(void);
uint32_t isaac_manager_a0f550_f2_ofs(void);
uint32_t isaac_manager_a0f550_f3_ofs(void);
uint32_t isaac_manager_a0f550_tail_ofs(void);
uint32_t isaac_manager_a0f550_denom_bits(void);
uint32_t isaac_manager_a0f550_denom_va(void);
uint32_t isaac_manager_a0f550_signed_table_va(void);
uint32_t isaac_manager_a0f550_va(void);
uint32_t isaac_manager_a0f550_ret_va(void);
uint32_t isaac_manager_a0f550_body_bytes(void);
uint32_t isaac_manager_a0f550_next_va(void);

/* ===========================================================================
 * ABI v28 -- depth: FUN_00959d00 (host B of the v25 pre-poll block;
 * 358 B, 0x00959d00..ret @ 0x00959e66, int3 @ 0x00959e67; 2 rel32
 * E8 sites 0x954d65 + 0x954e6c; this=Manager; no exact ZHL).
 * Linear decode via section table (.text VA 0x401000 raw 0x400 →
 * function raw 0x559100). identify-zhl: empty.  Decision table is
 * pure; every CALL is a typed host leaf.
 *
 * PE (hash-bound):
 *   if byte [this+0x4b288] == 0          -> epilog        // copy-flag
 *   if dword [this+8] == 2 &&
 *      [Manager+0x4b3d8] != [Manager+0x4b3dc]:            // state-2 island
 *        quiet = (g_Game+0x26584 == 0 &&
 *                 g_Game+0x26630 UNSIGNED <= 0)           // jbe, only ==0
 *        host 0x90cd10(this+0x4b3d8, 0, quiet)
 *        host 0x90a8a0(this+0x4b3d8, 1)
 *        if dword [this+0x4b28c] != 0x11
 *          host 0x907690(this+0x4b3d8, 8B stack)
 *   host 0x959670(this)                                   // cleanup
 *   host 0x91c770()
 *   state = 1
 *   if [0xc72a20] == 0:
 *     p = host 0xa0f4c0(0xf930)                           // tracked malloc
 *     if p: host 0x986450(p)                              // MenuManager ctor
 *     [0xc72a20] = p
 *     host 0x987450(p)                                    // MenuManager::Init
 *   host 0x98aa30([0xc72a20], [this+0x4b28c], 1)
 *   copy [this+0x4b290..0x4b2a0] -> menu+0x1c..+0x2c
 *   byte [menu+0x14] = 1
 *   byte [this+0x4b288] = 0
 *
 * Byte gate takes RAW uint32_t and narrows in the body.  The 0x26630
 * compare is UNSIGNED jbe vs 0 (equivalent to == 0; 0xffffffff /)
 * 0x80000000 fail).  g_Game [0xc71678] is dereferenced with NO null
 * test on the state-2 island (same defect class as v25/v26) — stays
 * host.  Not Update-wired.
 *
 * Next exact VA after v28: 0x00959720 (host A).  ABI v29 landed
 * that peel's entry/join islands; remaining body stays host.
 * =========================================================================== */
enum {
  ISAAC_959D00_FLAG_OFS = 0x4b288,           /* SAME as PREPOLL_COPY_FLAG */
  ISAAC_959D00_STATE_OFS = 0x8,              /* SAME as PREPOLL_STATE */
  ISAAC_959D00_STATE2_VALUE = 2,             /* SAME as PLAYERSCAN_STATE2 */
  ISAAC_959D00_QUEUE_BEGIN_OFS = 0x4b3d8,    /* SAME as SHELL_OFF_SUB_90B150 */
  ISAAC_959D00_QUEUE_END_OFS = 0x4b3dc,
  ISAAC_959D00_GAME_MODE_OFS = 0x26584,
  ISAAC_959D00_GAME_26630_OFS = 0x26630,
  ISAAC_959D00_EXT_OFS = 0x4b28c,            /* SAME as PREPOLL_COPY_DST_EXT */
  ISAAC_959D00_EXT_SKIP = 0x11,              /* SAME as STATE1_MODE_MATCH */
  ISAAC_959D00_CORE_OFS = 0x4b290,           /* SAME as PREPOLL_COPY_DST_CORE */
  ISAAC_959D00_F0_OFS = 0x4b294,
  ISAAC_959D00_F1_OFS = 0x4b298,
  ISAAC_959D00_F2_OFS = 0x4b29c,
  ISAAC_959D00_DW_OFS = 0x4b2a0,             /* SAME as PREPOLL_COPY_DST_DW */
  ISAAC_959D00_MENU_GLOBAL_VA = 0x00c72a20,  /* SAME as STATE1_MODE_GLOBAL */
  ISAAC_959D00_MENU_ALLOC_SIZE = 0xf930,
  ISAAC_959D00_MENU_STORE_CORE_OFS = 0x1c,
  ISAAC_959D00_MENU_STORE_F0_OFS = 0x20,
  ISAAC_959D00_MENU_STORE_F1_OFS = 0x24,
  ISAAC_959D00_MENU_STORE_F2_OFS = 0x28,
  ISAAC_959D00_MENU_STORE_DW_OFS = 0x2c,
  ISAAC_959D00_MENU_STORE_FLAG_OFS = 0x14,
  ISAAC_959D00_MENU_STORE_FLAG_VALUE = 1,
  ISAAC_959D00_STATE_AFTER = 1,
  ISAAC_959D00_FLAG_CLEAR = 0,
  ISAAC_959D00_MANAGER_GLOBAL_VA = 0x00c7169c,
  ISAAC_959D00_GAME_GLOBAL_VA = 0x00c71678,
  ISAAC_959D00_HOST_90CD10_VA = 0x0090cd10,
  ISAAC_959D00_HOST_90A8A0_VA = 0x0090a8a0,
  ISAAC_959D00_HOST_907690_VA = 0x00907690,
  ISAAC_959D00_HOST_959670_VA = 0x00959670,  /* SAME as PREPOLL_HOST_C */
  ISAAC_959D00_HOST_91C770_VA = 0x0091c770,
  ISAAC_959D00_HOST_A0F4C0_VA = 0x00a0f4c0,
  ISAAC_959D00_HOST_986450_VA = 0x00986450,  /* exact ZHL MenuManager::ctor */
  ISAAC_959D00_HOST_987450_VA = 0x00987450,  /* exact ZHL MenuManager::Init */
  ISAAC_959D00_HOST_98AA30_VA = 0x0098aa30,
  ISAAC_959D00_VA = 0x00959d00,
  ISAAC_959D00_RET_VA = 0x00959e66,
  ISAAC_959D00_BODY_BYTES = 0x166,           /* 358 */
  ISAAC_959D00_SITES = 2,
  ISAAC_959D00_NEXT_VA = 0x00959720          /* host A */
};

/* 0x00959d29: cmp byte [this+0x4b288], 0 / je epilog.  RAW uint32. */
int32_t isaac_manager_959d00_body_needed(uint32_t flag_byte);
/* 0x00959d36: cmp dword [this+8], 2 / jne skip island.  FULL dword. */
int32_t isaac_manager_959d00_state2_needed(int32_t state);
/* 0x00959d42/48: [Manager+0x4b3d8] != [Manager+0x4b3dc].  FULL dword. */
int32_t isaac_manager_959d00_queue_nonempty(uint32_t begin, uint32_t end);
/* flag && state==2 && queue nonempty — the state-2 island predicate. */
int32_t isaac_manager_959d00_state2_island_needed(uint32_t flag_byte,
                                                  int32_t state,
                                                  uint32_t begin,
                                                  uint32_t end);
/* 0x00959d55..0x6b: quiet stack byte.  UNSIGNED jbe vs 0 on +0x26630. */
int32_t isaac_manager_959d00_quiet_arg(uint32_t mode_26584,
                                       uint32_t dword_26630);
/* 0x00959d8c: cmp dword [this+0x4b28c], 0x11 / je skip.  FULL dword. */
int32_t isaac_manager_959d00_host_907690_needed(uint32_t ext);
/* 0x00959dbc: test ecx,ecx / jne skip alloc.  FULL dword. */
int32_t isaac_manager_959d00_menu_alloc_needed(uint32_t menu_ptr);
/* 0x00959dd7: test eax,eax / je skip ctor.  FULL dword. */
int32_t isaac_manager_959d00_menu_ctor_needed(uint32_t alloc);
uint32_t isaac_manager_959d00_flag_ofs(void);
uint32_t isaac_manager_959d00_state_ofs(void);
uint32_t isaac_manager_959d00_state2_value(void);
uint32_t isaac_manager_959d00_queue_begin_ofs(void);
uint32_t isaac_manager_959d00_queue_end_ofs(void);
uint32_t isaac_manager_959d00_game_mode_ofs(void);
uint32_t isaac_manager_959d00_game_26630_ofs(void);
uint32_t isaac_manager_959d00_ext_ofs(void);
uint32_t isaac_manager_959d00_ext_skip(void);
uint32_t isaac_manager_959d00_core_ofs(void);
uint32_t isaac_manager_959d00_f0_ofs(void);
uint32_t isaac_manager_959d00_f1_ofs(void);
uint32_t isaac_manager_959d00_f2_ofs(void);
uint32_t isaac_manager_959d00_dw_ofs(void);
uint32_t isaac_manager_959d00_menu_global_va(void);
uint32_t isaac_manager_959d00_menu_alloc_size(void);
uint32_t isaac_manager_959d00_menu_store_core_ofs(void);
uint32_t isaac_manager_959d00_menu_store_f0_ofs(void);
uint32_t isaac_manager_959d00_menu_store_f1_ofs(void);
uint32_t isaac_manager_959d00_menu_store_f2_ofs(void);
uint32_t isaac_manager_959d00_menu_store_dw_ofs(void);
uint32_t isaac_manager_959d00_menu_store_flag_ofs(void);
uint32_t isaac_manager_959d00_menu_store_flag_value(void);
uint32_t isaac_manager_959d00_state_after(void);
uint32_t isaac_manager_959d00_flag_clear(void);
uint32_t isaac_manager_959d00_manager_global_va(void);
uint32_t isaac_manager_959d00_game_global_va(void);
uint32_t isaac_manager_959d00_host_90cd10_va(void);
uint32_t isaac_manager_959d00_host_90a8a0_va(void);
uint32_t isaac_manager_959d00_host_907690_va(void);
uint32_t isaac_manager_959d00_host_959670_va(void);
uint32_t isaac_manager_959d00_host_91c770_va(void);
uint32_t isaac_manager_959d00_host_a0f4c0_va(void);
uint32_t isaac_manager_959d00_host_986450_va(void);
uint32_t isaac_manager_959d00_host_987450_va(void);
uint32_t isaac_manager_959d00_host_98aa30_va(void);
uint32_t isaac_manager_959d00_va(void);
uint32_t isaac_manager_959d00_ret_va(void);
uint32_t isaac_manager_959d00_body_bytes(void);
uint32_t isaac_manager_959d00_sites(void);
uint32_t isaac_manager_959d00_next_va(void);

/* ===========================================================================
 * ABI v29 -- depth: FUN_00959720 (host A of the v25 pre-poll block;
 * 1496 B, 0x00959720..ret @ 0x00959cf8, int3 @ 0x00959cf9; 1 rel32
 * E8 site 0x954d5e; this=Manager; identify-zhl empty).  Linear
 * decode via section table (.text VA 0x401000 raw 0x400 → function
 * raw 0x558b20).  Parent dump 0x400 window: 244 insn / 27 E8 / no
 * ret (body spans 0x5d8).  Full first-ret: 360 insn, 45 body E8 +
 * stack-cookie 0xaef12b.  Entry/join decision table is pure; every
 * CALL is a typed host leaf.  Mid-body list walk / seed copy /
 * Game::Start* stay host.
 *
 * PE (hash-bound):
 *   if byte [this+0x4b130] == 0          -> epilog
 *   if byte [this+0x4b274] != 0:
 *     al = host 0x90c400(this+0x4b3d8)
 *     if al == 0                         -> epilog
 *   if bit0 [this+0x4abbc]: ++[this+0x4abbc]   // test al,1; FULL inc
 *   host 0x959670(this)                            // cleanup
 *   if [0xc71678] == 0:
 *     p = host 0xa0f4c0(0x68e88)
 *     if p: host 0x6f1020(p)                       // Game::ctor
 *     [0xc71678] = p
 *     host 0x6f4740()
 *   if [this+0x4b3d8] != [this+0x4b3dc]:
 *     host 0x90a8a0([0xc7169c]+0x4b3d8, 0)
 *   … mid-body host residual (list walk / seed map) …
 *   if byte [this+0x4b274] && [this+0x4b140] &&
 *      dword [this+0x4b3e4] == 0:
 *     host 0x6eef20([this+0x4b140]); host 0x91c770()
 *   state = 2
 *   if !(byte [this+0x4b274] && byte [this+0x4b131]):
 *     host 0x923450(this+0x21628)
 *   join arm (bytes 4b274/4b131/4b132, UNSIGNED 4b1c0, byte 4b19c)
 *     -> host seed/start leaves
 *   if peSignedMod2Eq1([this+0x4abbc]): ++[this+0x4abbc]
 *   byte [this+0x4b130] = 0
 *   word [this+0x4b284] = 1
 *
 * Byte gates take RAW uint32_t and narrow in the body.  Entry
 * parity is `test al,1` (bit0 of the loaded dword).  Join parity
 * is the full peSignedMod2Eq1 sequence — two different laws on
 * the SAME 0x4abbc field.  0x4b1c0 compare is UNSIGNED jbe vs 0
 * (0xffffffff / 0x80000000 take the daily arm).  g_Game [0xc71678]
 * is stored then later dereferenced with NO null test on the
 * 4b274&&4b131 arm (same defect class as v25/v26/v28) — stays
 * host.  Not Update-wired.
 *
 * Next exact VA: 0x00959670 (host C; exact ZHL
 * Manager::cleanup_current_state, 9b).  ABI v30 lands that peel's
 * state/empty/flag islands.  First-ret ~1672 B is a trap: the
 * function has no ret (jmp 0x40e910); 1672 B swallows already-landed
 * FUN_00959720.
 * =========================================================================== */
enum {
  ISAAC_959720_FLAG_OFS = 0x4b130,           /* SAME as STATE2_OFF_BLOCK_FLAG */
  ISAAC_959720_PROBE_OFS = 0x4b274,
  ISAAC_959720_PARITY_OFS = 0x4abbc,         /* SAME as SHELL_OFF_COUNTER */
  ISAAC_959720_QUEUE_BEGIN_OFS = 0x4b3d8,    /* SAME as 959D00 / SHELL */
  ISAAC_959720_QUEUE_END_OFS = 0x4b3dc,
  ISAAC_959720_STATE_OFS = 0x8,
  ISAAC_959720_STATE_AFTER = 2,
  ISAAC_959720_FLAG_4B131_OFS = 0x4b131,
  ISAAC_959720_FLAG_4B132_OFS = 0x4b132,
  ISAAC_959720_PTR_4B140_OFS = 0x4b140,
  ISAAC_959720_DWORD_4B3E4_OFS = 0x4b3e4,
  ISAAC_959720_RECV_923450_OFS = 0x21628,    /* SAME as PREPOLL_STATE5_RECV */
  ISAAC_959720_DWORD_4B1C0_OFS = 0x4b1c0,
  ISAAC_959720_FLAG_4B19C_OFS = 0x4b19c,
  ISAAC_959720_WORD_4B284_OFS = 0x4b284,
  ISAAC_959720_WORD_4B284_VALUE = 1,
  ISAAC_959720_FLAG_CLEAR = 0,
  ISAAC_959720_GAME_ALLOC_SIZE = 0x68e88,
  ISAAC_959720_MANAGER_GLOBAL_VA = 0x00c7169c,
  ISAAC_959720_GAME_GLOBAL_VA = 0x00c71678,
  ISAAC_959720_HOST_90C400_VA = 0x0090c400,
  ISAAC_959720_HOST_959670_VA = 0x00959670,  /* SAME as PREPOLL_HOST_C */
  ISAAC_959720_HOST_A0F4C0_VA = 0x00a0f4c0,
  ISAAC_959720_HOST_6F1020_VA = 0x006f1020,  /* exact ZHL Game::constructor */
  ISAAC_959720_HOST_6F4740_VA = 0x006f4740,
  ISAAC_959720_HOST_90A8A0_VA = 0x0090a8a0,
  ISAAC_959720_HOST_6EEF20_VA = 0x006eef20,
  ISAAC_959720_HOST_91C770_VA = 0x0091c770,
  ISAAC_959720_HOST_923450_VA = 0x00923450,
  ISAAC_959720_HOST_6F6DD0_VA = 0x006f6dd0,  /* exact ZHL StartDailyChallenge */
  ISAAC_959720_HOST_6F7750_VA = 0x006f7750,  /* exact ZHL StartDebug */
  ISAAC_959720_HOST_6F5320_VA = 0x006f5320,  /* exact ZHL Game::Start */
  ISAAC_959720_ARM_SEED_THEN = 1,            /* 4b274 && 4b131 */
  ISAAC_959720_ARM_HOST_6F5850 = 2,          /* 4b274 && !4b131 */
  ISAAC_959720_ARM_SEED_ELSE = 3,            /* !4b274 && 4b131 */
  ISAAC_959720_ARM_4B132 = 4,                /* neither + 4b132 */
  ISAAC_959720_ARM_DAILY = 5,                /* UNSIGNED 4b1c0 > 0 */
  ISAAC_959720_ARM_DEBUG = 6,                /* byte 4b19c */
  ISAAC_959720_ARM_START = 7,                /* else Game::Start */
  ISAAC_959720_VA = 0x00959720,
  ISAAC_959720_RET_VA = 0x00959cf8,
  ISAAC_959720_BODY_BYTES = 0x5d8,           /* 1496 */
  ISAAC_959720_SITES = 1,
  ISAAC_959720_SITE_VA = 0x00954d5e,
  ISAAC_959720_NEXT_VA = 0x00959670          /* host C */
};

/* 0x00959756: cmp byte [this+0x4b130], 0 / je epilog.  RAW uint32. */
int32_t isaac_manager_959720_body_needed(uint32_t flag_4b130);
/* 0x00959763: cmp byte [this+0x4b274], 0 / je skip probe.  RAW uint32. */
int32_t isaac_manager_959720_probe_needed(uint32_t flag_4b274);
/* 0x00959777: test al,al / je epilog.  RAW uint32, low-byte. */
int32_t isaac_manager_959720_probe_ok(uint32_t probe_al);
/* body_needed && (!probe_needed || probe_ok). */
int32_t isaac_manager_959720_body_continue(uint32_t flag_4b130,
                                           uint32_t flag_4b274,
                                           uint32_t probe_al);
/* 0x00959785: test al,1 after dword load — bit0 of FULL dword. */
int32_t isaac_manager_959720_parity_inc_needed(uint32_t counter);
/* 0x00959789: inc eax — 32-bit wrap. */
uint32_t isaac_manager_959720_parity_next(uint32_t counter);
/* 0x00959797: cmp dword [0xc71678], 0 / jne skip.  FULL dword. */
int32_t isaac_manager_959720_game_alloc_needed(uint32_t game_ptr);
/* 0x009597ba: test eax,eax / je skip ctor.  FULL dword. */
int32_t isaac_manager_959720_game_ctor_needed(uint32_t alloc);
/* 0x009597da/e6: [this+0x4b3d8] != [this+0x4b3dc].  FULL dword. */
int32_t isaac_manager_959720_queue_nonempty(uint32_t begin, uint32_t end);
/* 0x00959984..0xa4: flag274 && ptr4b140 && dword4b3e4==0. */
int32_t isaac_manager_959720_host_6eef20_needed(uint32_t flag_4b274,
                                                uint32_t ptr_4b140,
                                                uint32_t dword_4b3e4);
/* 0x009599bd..0xc9: !(flag274 && flag131).  RAW uint32 bytes. */
int32_t isaac_manager_959720_host_923450_needed(uint32_t flag_4b274,
                                                uint32_t flag_4b131);
/* Join arm after state=2.  4b1c0 is UNSIGNED > 0. */
int32_t isaac_manager_959720_join_arm(uint32_t flag_4b274,
                                      uint32_t flag_4b131,
                                      uint32_t flag_4b132,
                                      uint32_t dword_4b1c0,
                                      uint32_t flag_4b19c);
/* 0x00959cab..0xc2: peSignedMod2Eq1 on 0x4abbc (NOT test al,1). */
int32_t isaac_manager_959720_join_parity_inc_needed(int32_t counter);
uint32_t isaac_manager_959720_flag_ofs(void);
uint32_t isaac_manager_959720_probe_ofs(void);
uint32_t isaac_manager_959720_parity_ofs(void);
uint32_t isaac_manager_959720_queue_begin_ofs(void);
uint32_t isaac_manager_959720_queue_end_ofs(void);
uint32_t isaac_manager_959720_state_ofs(void);
uint32_t isaac_manager_959720_state_after(void);
uint32_t isaac_manager_959720_flag_4b131_ofs(void);
uint32_t isaac_manager_959720_flag_4b132_ofs(void);
uint32_t isaac_manager_959720_ptr_4b140_ofs(void);
uint32_t isaac_manager_959720_dword_4b3e4_ofs(void);
uint32_t isaac_manager_959720_recv_923450_ofs(void);
uint32_t isaac_manager_959720_dword_4b1c0_ofs(void);
uint32_t isaac_manager_959720_flag_4b19c_ofs(void);
uint32_t isaac_manager_959720_word_4b284_ofs(void);
uint32_t isaac_manager_959720_word_4b284_value(void);
uint32_t isaac_manager_959720_flag_clear(void);
uint32_t isaac_manager_959720_game_alloc_size(void);
uint32_t isaac_manager_959720_manager_global_va(void);
uint32_t isaac_manager_959720_game_global_va(void);
uint32_t isaac_manager_959720_host_90c400_va(void);
uint32_t isaac_manager_959720_host_959670_va(void);
uint32_t isaac_manager_959720_host_a0f4c0_va(void);
uint32_t isaac_manager_959720_host_6f1020_va(void);
uint32_t isaac_manager_959720_host_6f4740_va(void);
uint32_t isaac_manager_959720_host_90a8a0_va(void);
uint32_t isaac_manager_959720_host_6eef20_va(void);
uint32_t isaac_manager_959720_host_91c770_va(void);
uint32_t isaac_manager_959720_host_923450_va(void);
uint32_t isaac_manager_959720_host_6f6dd0_va(void);
uint32_t isaac_manager_959720_host_6f7750_va(void);
uint32_t isaac_manager_959720_host_6f5320_va(void);
uint32_t isaac_manager_959720_arm_seed_then(void);
uint32_t isaac_manager_959720_arm_host_6f5850(void);
uint32_t isaac_manager_959720_arm_seed_else(void);
uint32_t isaac_manager_959720_arm_4b132(void);
uint32_t isaac_manager_959720_arm_daily(void);
uint32_t isaac_manager_959720_arm_debug(void);
uint32_t isaac_manager_959720_arm_start(void);
uint32_t isaac_manager_959720_va(void);
uint32_t isaac_manager_959720_ret_va(void);
uint32_t isaac_manager_959720_body_bytes(void);
uint32_t isaac_manager_959720_sites(void);
uint32_t isaac_manager_959720_site_va(void);
uint32_t isaac_manager_959720_next_va(void);


/* ===========================================================================
 * ABI v30 -- depth: Manager::cleanup_current_state @ 0x00959670 (host C
 * of the v25 pre-poll block; exact ZHL 9b).  Exact body 172 B
 * (0x00959670..int3 @ 0x0095971c); NO ret — both exits `jmp 0x0040e910`.
 * First-ret dump is 1672 B (0x688) because decode walks into already-
 * landed FUN_00959720 (ret @ 0x00959cf8).  Do NOT translate that span.
 *
 * identify-zhl 0x00959670: exact `__thiscall void
 * Manager::cleanup_current_state();` (9b, Manager.zhl).  Address-stable
 * ABI names (isaac_manager_959670_*).  Rel32 E8 sites (3): 0x00954d85
 * (pre-poll G1&&G2), 0x00959792 (host A body), 0x00959da5 (host B body).
 *
 * PE (hash-bound, section table, --bytes 0xb0 --no-stop-at-ret):
 *   eax = dword [this+8]
 *   eax -= 1 / je state1                 // original == 1
 *   eax -= 1 / jne epilog                // original != 2
 *   // state == 2:
 *     ecx = [0xc71678]                   // g_Game
 *     if ecx != 0:
 *       push movzx byte [this+0x4b284]   // ShouldSave, BYTE
 *       host 0x6fa0c0                    // exact ZHL Game::Exit
 *       byte [this+0x4b285] = 0
 *       ucomiss [this+0x2a334], [0xbaa454=1.0f]
 *       lahf / test ah,0x44 / jnp skip   // skip ONLY ordered-equal
 *         [this+0x2a334] = 0x3f800000    // 1.0f
 *         host 0x92e430(this+0x2a324)    // exact ZHL
 *                                        // SoundEffects::ClearVolumeModifier
 *                                        // (already SHELL_APPROACH_HOST)
 *       ecx = [0xc71678]                 // reload
 *       [this+0x2a338] = 0x3ba3d70a      // 0.005f
 *     ecx += 0x26614                     // even when g_Game was 0
 *     host 0x429170(ecx)                 // no exact ZHL
 *     jmp 0x40e910
 *   // state == 1:
 *     esi = [0xc72a20]                   // menu global
 *     if esi == 0: jmp epilog            // empty
 *     host 0x986f30(esi)                 // no exact ZHL
 *     host 0xaef15c(esi, 0xf930)         // CRT free
 *     [0xc72a20] = 0
 *   epilog: pop esi / jmp 0x40e910
 *
 * Pure islands: state id, empty-menu (the empty check; this function has
 * NO 0x4b3d8/0x4b3dc queue), flag tests (4b284 byte Exit arg, 4b285
 * clear, g_Game/menu present, ucomiss vs 1.0f).  Host cleanup/IO/alloc
 * stay host.  Recorded defect: g_Game==0 still calls 0x429170(0x26614)
 * (same class as v25/v26/v28).  Byte gates take RAW uint32_t and narrow
 * in the body.  Not Update-wired.  Do not reopen 0x00a0f550 /
 * 0x00959d00 / 0x00959720.
 *
 * Next exact VA: 0x0095e7c0 (host D; exact ZHL Cutscene::Show(int), 15b).
 * =========================================================================== */
enum {
  ISAAC_959670_STATE_OFS = 0x8,              /* SAME as PREPOLL_STATE */
  ISAAC_959670_STATE_OTHER = 0,
  ISAAC_959670_STATE_MENU = 1,
  ISAAC_959670_STATE_GAME = 2,
  ISAAC_959670_FLAG_4B284_OFS = 0x4b284,     /* SAME as 959720 word ofs; here BYTE */
  ISAAC_959670_FLAG_4B285_OFS = 0x4b285,
  ISAAC_959670_FLAG_4B285_CLEAR = 0,
  ISAAC_959670_RECV_OFS = 0x2a324,           /* SAME as SHELL_APPROACH_RECV */
  ISAAC_959670_VALUE_OFS = 0x2a334,          /* SAME as SHELL_APPROACH_VALUE */
  ISAAC_959670_STEP_OFS = 0x2a338,           /* SAME as SHELL_APPROACH_STEP */
  ISAAC_959670_VALUE_STORE_BITS = 0x3f800000, /* 1.0f immediate */
  ISAAC_959670_STEP_STORE_BITS = 0x3ba3d70a,  /* 0.005f */
  ISAAC_959670_TARGET_VA = 0x00baa454,        /* DAT 1.0f; SAME as approach target */
  ISAAC_959670_GAME_GLOBAL_VA = 0x00c71678,
  ISAAC_959670_MENU_GLOBAL_VA = 0x00c72a20,   /* SAME as 959D00_MENU_GLOBAL */
  ISAAC_959670_MENU_FREE_SIZE = 0xf930,       /* SAME as 959D00_MENU_ALLOC_SIZE */
  ISAAC_959670_MENU_CLEAR = 0,
  ISAAC_959670_HOST_429170_OFS = 0x26614,
  ISAAC_959670_HOST_6FA0C0_VA = 0x006fa0c0,   /* exact ZHL Game::Exit */
  ISAAC_959670_HOST_92E430_VA = 0x0092e430,   /* SAME as SHELL_APPROACH_HOST */
  ISAAC_959670_HOST_429170_VA = 0x00429170,
  ISAAC_959670_HOST_986F30_VA = 0x00986f30,
  ISAAC_959670_HOST_AEF15C_VA = 0x00aef15c,   /* CRT free */
  ISAAC_959670_EPILOG_VA = 0x0040e910,
  ISAAC_959670_MANAGER_GLOBAL_VA = 0x00c7169c,
  ISAAC_959670_VA = 0x00959670,
  ISAAC_959670_INT3_VA = 0x0095971c,
  ISAAC_959670_BODY_BYTES = 0xac,             /* 172; not the 1672 B first-ret trap */
  ISAAC_959670_FIRST_RET_TRAP_BYTES = 0x688,  /* 1672 */
  ISAAC_959670_SITES = 3,
  ISAAC_959670_SITE0_VA = 0x00954d85,         /* pre-poll G1&&G2 */
  ISAAC_959670_SITE1_VA = 0x00959792,         /* host A */
  ISAAC_959670_SITE2_VA = 0x00959da5,         /* host B */
  ISAAC_959670_NEXT_VA = 0x0095e7c0           /* host D Cutscene::Show */
};

/* 0x00959673..0x7e: sub/sub cascade on dword [this+8].  FULL dword asI32. */
int32_t isaac_manager_959670_state_id(int32_t state);
int32_t isaac_manager_959670_state1_needed(int32_t state);
int32_t isaac_manager_959670_state2_needed(int32_t state);
/* 0x0095968a: test ecx,ecx on [0xc71678].  FULL dword. */
int32_t isaac_manager_959670_game_present(uint32_t game_ptr);
int32_t isaac_manager_959670_game_body_needed(int32_t state, uint32_t game_ptr);
/* 0x009596f3: test esi,esi on [0xc72a20] — empty-menu, not a 0x4b3d8 queue. */
int32_t isaac_manager_959670_menu_present(uint32_t menu_ptr);
int32_t isaac_manager_959670_menu_body_needed(int32_t state, uint32_t menu_ptr);
/* 0x0095968e: movzx byte [this+0x4b284].  RAW uint32, low byte. */
uint32_t isaac_manager_959670_exit_save_arg(uint32_t flag_4b284);
uint32_t isaac_manager_959670_flag_4b285_clear(void);
/* 0x009596aa..0xb5: ucomiss vs 1.0f; skip ONLY ordered-equal (NaN stores). */
int32_t isaac_manager_959670_value_store_needed(float value_2a334);
/* 0x009596dc: ecx += 0x26614, including the game==0 path.  32-bit wrap. */
uint32_t isaac_manager_959670_host_429170_recv(uint32_t game_ptr);
uint32_t isaac_manager_959670_state_ofs(void);
uint32_t isaac_manager_959670_state_other(void);
uint32_t isaac_manager_959670_state_menu(void);
uint32_t isaac_manager_959670_state_game(void);
uint32_t isaac_manager_959670_flag_4b284_ofs(void);
uint32_t isaac_manager_959670_flag_4b285_ofs(void);
uint32_t isaac_manager_959670_recv_ofs(void);
uint32_t isaac_manager_959670_value_ofs(void);
uint32_t isaac_manager_959670_step_ofs(void);
uint32_t isaac_manager_959670_value_store_bits(void);
uint32_t isaac_manager_959670_step_store_bits(void);
uint32_t isaac_manager_959670_target_va(void);
uint32_t isaac_manager_959670_game_global_va(void);
uint32_t isaac_manager_959670_menu_global_va(void);
uint32_t isaac_manager_959670_menu_free_size(void);
uint32_t isaac_manager_959670_menu_clear(void);
uint32_t isaac_manager_959670_host_429170_ofs(void);
uint32_t isaac_manager_959670_host_6fa0c0_va(void);
uint32_t isaac_manager_959670_host_92e430_va(void);
uint32_t isaac_manager_959670_host_429170_va(void);
uint32_t isaac_manager_959670_host_986f30_va(void);
uint32_t isaac_manager_959670_host_aef15c_va(void);
uint32_t isaac_manager_959670_epilog_va(void);
uint32_t isaac_manager_959670_manager_global_va(void);
uint32_t isaac_manager_959670_va(void);
uint32_t isaac_manager_959670_int3_va(void);
uint32_t isaac_manager_959670_body_bytes(void);
uint32_t isaac_manager_959670_first_ret_trap_bytes(void);
uint32_t isaac_manager_959670_sites(void);
uint32_t isaac_manager_959670_site0_va(void);
uint32_t isaac_manager_959670_site1_va(void);
uint32_t isaac_manager_959670_site2_va(void);
uint32_t isaac_manager_959670_next_va(void);

/* ===========================================================================
 * ABI v31 -- depth: Cutscene::Show @ 0x0095e7c0 (host D of the v25 pre-poll
 * block; exact ZHL 15b, Cutscene.zhl).  Exact body 0x305 (773 B) through
 * int3 @ 0x0095eac5.  Two `ret 4`: in-range epilog @ 0x0095eaa9, OOB log
 * path @ 0x0095eac2.  A 0x800 dump window is a trap: it swallows
 * FUN_0095ead0 (queue>1 helper), FUN_0095eb00 / FUN_0095eb60 (callbacks),
 * and already-landed 0x00a0f550 call sites.  Do NOT translate that span.
 *
 * identify-zhl 0x0095e7c0: exact `__thiscall void Cutscene::Show(int
 * cutsceneid);` (15b).  Address-stable ABI names (isaac_cutscene_95e7c0_*).
 * Rel32 E8 sites (1): 0x00954d96 (pre-poll G1; recv Manager+0x20dd0, arg
 * dword [Manager+0x2161c]).
 *
 * PE prefix (hash-bound, section table; islands only):
 *   ebx = cutsceneid
 *   cmp ebx, 0x1a / ja OOB          // UNSIGNED; 0..26 in range (27 entries)
 *   ecx = [0xc7169c]                // g_Manager; NO null test (recorded)
 *   music slot stores (host-adjacent; constants pinned, stores stay host)
 *   if dword [this+0] != 0:         // Cutscene._state
 *     host CutsceneEntry::Unload(this+4 + queued*0x4c)
 *     host 0x40e910
 *   [this+0x808] = id; [this+0x828] = 0
 *   test ebx,ebx / je epilog        // id==0 empty
 *   ... SSO name cap, host log 0xa112c0, host 0x95ead0 queue>1 ...
 *   cmp [ebp+8], 2 / jne epilog     // id==2 special; Random stays host
 *   test [0xc71678]; [game+0x1bb88]
 *   cmp byte [this+0xe5], 0 / jne epilog
 *   SAR vector [this+0xb8/0xbc] empty skip
 *
 * Pure islands: id range, state/unload, empty-id, empty-queue (SAR
 * unsigned > 1 via 0x95ead0), SSO cap, id==2, g_Game / 1bb88, byte e5,
 * vector empty.  Host Unload / log / Random / IO / alloc / 0xa0f550 stay
 * host.  Byte gates take RAW uint32_t and narrow in the body.  Not
 * Update-wired.  Do not reopen 0x00a0f550 / 0x00959d00 / 0x00959720 /
 * 0x00959670.
 *
 * Next exact VA: 0x00921ce0 (host E; exact ZHL NightmareScene::Show(bool)).
 * =========================================================================== */
enum {
  ISAAC_95E7C0_ID_MAX = 0x1a,              /* unsigned ja vs 26 */
  ISAAC_95E7C0_ENTRY_COUNT = 0x1b,         /* 27; ZHL _cutscenes[27] */
  ISAAC_95E7C0_ENTRY_STRIDE = 0x4c,        /* sizeof CutsceneEntry */
  ISAAC_95E7C0_ENTRIES_OFS = 0x4,
  ISAAC_95E7C0_STATE_OFS = 0x0,            /* Cutscene._state */
  ISAAC_95E7C0_QUEUED_OFS = 0x808,         /* _queuedCutscene */
  ISAAC_95E7C0_SSO_CAP = 0x10,             /* std::string cap jb 0x10 */
  ISAAC_95E7C0_ID_SPECIAL = 2,
  ISAAC_95E7C0_FLAG_E5_OFS = 0xe5,
  ISAAC_95E7C0_VEC_BEGIN_OFS = 0xb8,
  ISAAC_95E7C0_VEC_END_OFS = 0xbc,
  ISAAC_95E7C0_GAME_1BB88_OFS = 0x1bb88,
  ISAAC_95E7C0_QUEUE_BEGIN_OFS = 0x4b3d8,  /* SAME as 959720_QUEUE_BEGIN */
  ISAAC_95E7C0_QUEUE_END_OFS = 0x4b3dc,    /* SAME as 959720_QUEUE_END */
  ISAAC_95E7C0_QUEUE_HELPER_VA = 0x0095ead0,
  ISAAC_95E7C0_RECV_OFS = 0x20dd0,         /* SAME as PREPOLL_PREDISPATCH */
  ISAAC_95E7C0_ARG_OFS = 0x2161c,          /* SAME as PREPOLL_CUTSCENE_ID */
  ISAAC_95E7C0_MUSIC_INDEX_OFS = 0x29fbc,  /* SAME as PREPOLL_CROSSFADE_RECV */
  ISAAC_95E7C0_MUSIC_STRIDE = 0x184,
  ISAAC_95E7C0_MUSIC_VOL_OFS = 0x2a138,
  ISAAC_95E7C0_MUSIC_RATE_OFS = 0x2a13c,
  ISAAC_95E7C0_MUSIC_RATE_BITS = 0x3da3d70a, /* 0.08f; SAME as CROSSFADE_RATE */
  ISAAC_95E7C0_MUSIC_2A2CC_OFS = 0x2a2cc,
  ISAAC_95E7C0_STORE_828_OFS = 0x828,
  ISAAC_95E7C0_STORE_838_OFS = 0x838,
  ISAAC_95E7C0_STORE_838_VALUE = 0xffffffff,
  ISAAC_95E7C0_STATE_AFTER = 1,
  ISAAC_95E7C0_MANAGER_GLOBAL_VA = 0x00c7169c,
  ISAAC_95E7C0_GAME_GLOBAL_VA = 0x00c71678,
  ISAAC_95E7C0_HOST_960840_VA = 0x00960840, /* exact ZHL CutsceneEntry::Unload */
  ISAAC_95E7C0_HOST_40E910_VA = 0x0040e910,
  ISAAC_95E7C0_HOST_A112C0_VA = 0x00a112c0,
  ISAAC_95E7C0_HOST_95EAD0_VA = 0x0095ead0,
  ISAAC_95E7C0_HOST_91C7E0_VA = 0x0091c7e0,
  ISAAC_95E7C0_HOST_8FD750_VA = 0x008fd750,
  ISAAC_95E7C0_HOST_4239B0_VA = 0x004239b0,
  ISAAC_95E7C0_HOST_6EEF60_VA = 0x006eef60, /* exact ZHL Isaac::genrand_int32 */
  ISAAC_95E7C0_VA = 0x0095e7c0,
  ISAAC_95E7C0_RET_VA = 0x0095eaa9,
  ISAAC_95E7C0_OOB_RET_VA = 0x0095eac2,
  ISAAC_95E7C0_INT3_VA = 0x0095eac5,
  ISAAC_95E7C0_BODY_BYTES = 0x305,         /* 773; through int3 */
  ISAAC_95E7C0_FIRST_RET_TRAP_BYTES = 0x800, /* swallows 95ead0+ / a0f550 */
  ISAAC_95E7C0_SITES = 1,
  ISAAC_95E7C0_SITE_VA = 0x00954d96,
  ISAAC_95E7C0_NEXT_VA = 0x00921ce0         /* host E NightmareScene::Show */
};

/* 0x0095e7d1: cmp ebx, 0x1a / ja OOB.  UNSIGNED; 0..26 inclusive. */
int32_t isaac_cutscene_95e7c0_id_in_range(uint32_t id);
/* 0x0095e814: cmp dword [this], 0 / je skip Unload.  FULL dword. */
int32_t isaac_cutscene_95e7c0_unload_needed(uint32_t state);
/* 0x0095e83f: test ebx,ebx / je epilog.  FULL dword. */
int32_t isaac_cutscene_95e7c0_id_nonzero(uint32_t id);
/* in_range && id != 0 — log/load body after the queued store. */
int32_t isaac_cutscene_95e7c0_show_body_needed(uint32_t id);
/* 0x0095e819 / 0x0095e847: 4 + index*0x4c.  32-bit wrap. */
uint32_t isaac_cutscene_95e7c0_entry_ofs(uint32_t index);
/* 0x0095ead0: SAR32(end-begin,2); unsigned > 1.  Manager 0x4b3d8 queue. */
int32_t isaac_cutscene_95e7c0_queue_gt1(uint32_t begin, uint32_t end);
/* 0x0095e84f: cmp dword [name+0x14], 0x10 / jb inline.  UNSIGNED. */
int32_t isaac_cutscene_95e7c0_sso_inline(uint32_t capacity);
/* 0x0095e933: cmp dword [ebp+8], 2 / jne.  FULL dword equality. */
int32_t isaac_cutscene_95e7c0_id_is_2(uint32_t id);
/* 0x0095e97c: test ecx,ecx on [0xc71678].  FULL dword. */
int32_t isaac_cutscene_95e7c0_game_present(uint32_t game_ptr);
/* present && dword [game+0x1bb88] != 0.  FULL dwords. */
int32_t isaac_cutscene_95e7c0_game_1bb88_needed(uint32_t game_ptr,
                                               uint32_t dword_1bb88);
/* 0x0095e9ab: cmp byte [this+0xe5], 0 / jne skip.  RAW uint32, low byte. */
int32_t isaac_cutscene_95e7c0_flag_e5_continue(uint32_t flag_e5);
/* 0x0095e9c6: SAR32(end-begin,2). */
int32_t isaac_cutscene_95e7c0_vec_count(uint32_t begin, uint32_t end);
/* test eax,eax after SAR — skip only exact 0. */
int32_t isaac_cutscene_95e7c0_vec_loop_needed(uint32_t begin, uint32_t end);
uint32_t isaac_cutscene_95e7c0_id_max(void);
uint32_t isaac_cutscene_95e7c0_entry_count(void);
uint32_t isaac_cutscene_95e7c0_entry_stride(void);
uint32_t isaac_cutscene_95e7c0_entries_ofs(void);
uint32_t isaac_cutscene_95e7c0_state_ofs(void);
uint32_t isaac_cutscene_95e7c0_queued_ofs(void);
uint32_t isaac_cutscene_95e7c0_sso_cap(void);
uint32_t isaac_cutscene_95e7c0_id_special(void);
uint32_t isaac_cutscene_95e7c0_flag_e5_ofs(void);
uint32_t isaac_cutscene_95e7c0_vec_begin_ofs(void);
uint32_t isaac_cutscene_95e7c0_vec_end_ofs(void);
uint32_t isaac_cutscene_95e7c0_game_1bb88_ofs(void);
uint32_t isaac_cutscene_95e7c0_queue_begin_ofs(void);
uint32_t isaac_cutscene_95e7c0_queue_end_ofs(void);
uint32_t isaac_cutscene_95e7c0_queue_helper_va(void);
uint32_t isaac_cutscene_95e7c0_recv_ofs(void);
uint32_t isaac_cutscene_95e7c0_arg_ofs(void);
uint32_t isaac_cutscene_95e7c0_music_index_ofs(void);
uint32_t isaac_cutscene_95e7c0_music_stride(void);
uint32_t isaac_cutscene_95e7c0_music_vol_ofs(void);
uint32_t isaac_cutscene_95e7c0_music_rate_ofs(void);
uint32_t isaac_cutscene_95e7c0_music_rate_bits(void);
uint32_t isaac_cutscene_95e7c0_music_2a2cc_ofs(void);
uint32_t isaac_cutscene_95e7c0_store_828_ofs(void);
uint32_t isaac_cutscene_95e7c0_store_838_ofs(void);
uint32_t isaac_cutscene_95e7c0_store_838_value(void);
uint32_t isaac_cutscene_95e7c0_state_after(void);
uint32_t isaac_cutscene_95e7c0_manager_global_va(void);
uint32_t isaac_cutscene_95e7c0_game_global_va(void);
uint32_t isaac_cutscene_95e7c0_host_960840_va(void);
uint32_t isaac_cutscene_95e7c0_host_40e910_va(void);
uint32_t isaac_cutscene_95e7c0_host_a112c0_va(void);
uint32_t isaac_cutscene_95e7c0_host_95ead0_va(void);
uint32_t isaac_cutscene_95e7c0_host_91c7e0_va(void);
uint32_t isaac_cutscene_95e7c0_host_8fd750_va(void);
uint32_t isaac_cutscene_95e7c0_host_4239b0_va(void);
uint32_t isaac_cutscene_95e7c0_host_6eef60_va(void);
uint32_t isaac_cutscene_95e7c0_va(void);
uint32_t isaac_cutscene_95e7c0_ret_va(void);
uint32_t isaac_cutscene_95e7c0_oob_ret_va(void);
uint32_t isaac_cutscene_95e7c0_int3_va(void);
uint32_t isaac_cutscene_95e7c0_body_bytes(void);
uint32_t isaac_cutscene_95e7c0_first_ret_trap_bytes(void);
uint32_t isaac_cutscene_95e7c0_sites(void);
uint32_t isaac_cutscene_95e7c0_site_va(void);
uint32_t isaac_cutscene_95e7c0_next_va(void);

/* ===========================================================================
 * ABI v32 -- depth: NightmareScene::Show @ 0x00921ce0 (host E of the v25
 * pre-poll block; exact ZHL 75b, NightmareScene.zhl).  Exact body 0x1630
 * (5680 B) through int3 @ 0x0092330f.  One `ret 4` @ 0x0092330c.  A 0x800
 * dump window is a trap: linear decode resyncs, first_ret NONE, and never
 * reaches the epilog.  Dumping past int3 swallows EH `jmp 0x00923600` and
 * sibling 0x00923320.  Do NOT translate that span.
 *
 * identify-zhl 0x00921ce0: exact `__thiscall void NightmareScene::Show(bool
 * unk);` (75b).  Address-stable ABI names (isaac_nightmare_921ce0_*).
 * Rel32 E8 sites (1): 0x00954dd0 (pre-poll G3; recv Manager+0x21628, arg
 * movzx byte [Manager+0x4b2a5]).
 *
 * PE prefix (hash-bound, section table; islands only):
 *   edi = this
 *   esi = [0xc71678]                // g_Game; NO null test (recorded)
 *   count = SAR32([game+0x1baac]-[game+0x1baa8], 2)
 *   test eax,eax / jne skip_log     // empty -> host log 0xa112c0
 *   host 0x4288a0 lower_bound(key=0x4f) on game+0x1bbd8
 *   cmp byte [node+0xd], 0 / jne miss   // isnil BYTE
 *   cmp dword [node+0x10], 0x4f / jle hit  // SIGNED
 *   miss: node = end; cmp node,end / je skip_gfx
 *   SSO cap 0x10 UNSIGNED; host strncmp IAT 0xb18934 n=0x16
 *   test eax,eax / jne skip_gfx
 *   ... host ANM2 ctor/Load/Reset, free 0xaef15c ...
 *   cmp byte [this+0x5e8], 0        // IsDogmaNightmare BYTE
 *     nz -> dogma gfx path
 *     z  -> host FirstCollectibleOwner 0x9be080
 *   cmp byte [this+0x4b1], 0 / jne
 *   ... host residual ...
 *   mov al, byte [ebx+8]            // bool unk; store [this+0x368]
 *   cmovne music id 0x41/0x60; host Music::Play 0x7e1d50
 *   cmp dword [g_Game], 0xc
 *   ret 4; int3
 *
 * Pure islands: players empty-log (SAME SAR as v26), map present (BYTE
 * isnil + SIGNED key<=0x4f), map found, strncmp==0, SSO, dogma / 4b1
 * bytes, bool arg, music id cmov, stage==0xc/0xd, sprite*24 wrap.
 * Host Unload / log / Random / 0xa0f550 / ANM2 / Music::Play /
 * FirstCollectibleOwner / free / strncmp stay host.  Byte gates take RAW
 * uint32_t and narrow in the body.  Not Update-wired.  Do not reopen
 * 0x00a0f550 / 0x00959d00 / 0x00959720 / 0x00959670 / 0x0095e7c0.
 *
 * Next exact VA: 0x009be080 (PlayerManager::FirstCollectibleOwner; exact
 * ZHL 19b; dogma==0 path after the 0x5e8 gate).
 * =========================================================================== */
enum {
  ISAAC_921CE0_MAP_KEY = 0x4f,             /* SAME as INPUT_MASK_B_ID_4F */
  ISAAC_921CE0_MAP_ISNIL_OFS = 0xd,
  ISAAC_921CE0_MAP_KEY_OFS = 0x10,
  ISAAC_921CE0_MAP_OFS = 0x1bbd8,          /* Game+0x1bbd8; host 0x4288a0 */
  ISAAC_921CE0_PLAYERS_BEGIN_OFS = 0x1baa8, /* SAME as PLAYERSCAN_PLAYER_LIST_BEGIN */
  ISAAC_921CE0_PLAYERS_END_OFS = 0x1baac,   /* SAME as PLAYERSCAN_PLAYER_LIST_END */
  ISAAC_921CE0_SSO_CAP = 0x10,
  ISAAC_921CE0_STRNCMP_N = 0x16,
  ISAAC_921CE0_SPRITE_STRIDE = 0x18,       /* lea [eax+eax*2] then *8 */
  ISAAC_921CE0_INDEX_OFS = 0x360,
  ISAAC_921CE0_TABLE_OFS = 0x14,
  ISAAC_921CE0_BASE_OFS = 0x8,
  ISAAC_921CE0_DOGMA_OFS = 0x5e8,          /* ZHL IsDogmaNightmare */
  ISAAC_921CE0_BOOL_STORE_OFS = 0x368,
  ISAAC_921CE0_FLAG_4B1_OFS = 0x4b1,
  ISAAC_921CE0_FLAG_4BC_OFS = 0x4bc,
  ISAAC_921CE0_FLAG_4BC_CLEAR = 0,
  ISAAC_921CE0_FLAG_4BC_SET = 1,
  ISAAC_921CE0_MUSIC_ID_NORMAL = 0x60,
  ISAAC_921CE0_MUSIC_ID_DOGMA = 0x41,
  ISAAC_921CE0_MUSIC_RECV_OFS = 0x29fbc,   /* SAME as PREPOLL_CROSSFADE_RECV */
  ISAAC_921CE0_MUSIC_VOL_OFS = 0x2a354,
  ISAAC_921CE0_STAGE_C = 0xc,
  ISAAC_921CE0_STAGE_D = 0xd,
  ISAAC_921CE0_COLLECTIBLE_ID = 0x236,
  ISAAC_921CE0_LAZ_TAG = 1,
  ISAAC_921CE0_ANM2_LOAD_GRAPHICS = 1,
  ISAAC_921CE0_STORE_3A4_OFS = 0x3a4,
  ISAAC_921CE0_STORE_3A4_VALUE = 0x28,
  ISAAC_921CE0_LOG_LEVEL = 0x10,           /* SAME as PLAYERSCAN_LOG_LEVEL */
  ISAAC_921CE0_LOG_MSG_VA = 0x00b7e6bc,    /* SAME as PLAYERSCAN_LOG_MSG */
  ISAAC_921CE0_PATH_VA = 0x00b79fa0,       /* "gfx/ui/stage/nightmare" */
  ISAAC_921CE0_IAT_STRNCMP_VA = 0x00b18934,
  ISAAC_921CE0_GAME_GLOBAL_VA = 0x00c71678,
  ISAAC_921CE0_MANAGER_GLOBAL_VA = 0x00c7169c,
  ISAAC_921CE0_RECV_OFS = 0x21628,         /* SAME as PREPOLL_STATE5_RECV */
  ISAAC_921CE0_ARG_OFS = 0x4b2a5,          /* SAME as PREPOLL_NIGHTMARE_ARG */
  ISAAC_921CE0_G3_OFS = 0x4b2a4,           /* SAME as PREPOLL_G3 */
  ISAAC_921CE0_HOST_A112C0_VA = 0x00a112c0,
  ISAAC_921CE0_HOST_4288A0_VA = 0x004288a0,
  ISAAC_921CE0_HOST_4074C0_VA = 0x004074c0, /* exact ZHL ANM2::constructor */
  ISAAC_921CE0_HOST_40BD50_VA = 0x0040bd50, /* exact ZHL ANM2::Load */
  ISAAC_921CE0_HOST_407F10_VA = 0x00407f10, /* exact ZHL ANM2::Reset */
  ISAAC_921CE0_HOST_9BE080_VA = 0x009be080, /* exact ZHL FirstCollectibleOwner */
  ISAAC_921CE0_HOST_7E1D50_VA = 0x007e1d50, /* exact ZHL Music::Play */
  ISAAC_921CE0_HOST_AEF15C_VA = 0x00aef15c,
  ISAAC_921CE0_HOST_A0F4C0_VA = 0x00a0f4c0,
  ISAAC_921CE0_VA = 0x00921ce0,
  ISAAC_921CE0_RET_VA = 0x0092330c,
  ISAAC_921CE0_INT3_VA = 0x0092330f,
  ISAAC_921CE0_BODY_BYTES = 0x1630,        /* 5680; through int3 */
  ISAAC_921CE0_FIRST_RET_TRAP_BYTES = 0x800, /* resyncs; first_ret NONE */
  ISAAC_921CE0_SITES = 1,
  ISAAC_921CE0_SITE_VA = 0x00954dd0,
  ISAAC_921CE0_SIBLING_VA = 0x00923320,
  ISAAC_921CE0_NEXT_VA = 0x009be080        /* FirstCollectibleOwner */
};

/* 0x00921d3d: SAR32(end-begin, 2).  SAME math as v26 player-list count. */
int32_t isaac_nightmare_921ce0_players_count(uint32_t begin, uint32_t end);
/* 0x00921d40: test eax,eax / jne skip_log.  Log only on exact 0. */
int32_t isaac_nightmare_921ce0_players_log_needed(uint32_t begin, uint32_t end);
/* 0x00921db8 / 0x00921dbe: BYTE isnil==0 && SIGNED key<=0x4f. */
int32_t isaac_nightmare_921ce0_map_present(uint32_t isnil_0d, uint32_t key_10);
/* 0x00921dca: cmp node, end / je skip_gfx.  FULL dword. */
int32_t isaac_nightmare_921ce0_map_found(uint32_t node, uint32_t end);
/* 0x00921df8: test eax,eax / jne skip_gfx after host strncmp.  FULL dword. */
int32_t isaac_nightmare_921ce0_strncmp_ok(uint32_t result);
/* present && found && strncmp==0 -- gfx/ANM2 body after the map hit. */
int32_t isaac_nightmare_921ce0_gfx_needed(uint32_t isnil_0d, uint32_t key_10,
                                          uint32_t node, uint32_t end,
                                          uint32_t strncmp_result);
/* 0x00921dd6: cmp cap, 0x10 / cmovae.  UNSIGNED < 16. */
int32_t isaac_nightmare_921ce0_sso_inline(uint32_t capacity);
/* 0x00921d6d: index*24.  32-bit wrap. */
uint32_t isaac_nightmare_921ce0_sprite_ofs(uint32_t index);
/* 0x0092207f: cmp byte [this+0x5e8], 0.  RAW uint32, low byte != 0. */
int32_t isaac_nightmare_921ce0_dogma(uint32_t flag_5e8);
/* dogma==0 -> host FirstCollectibleOwner.  RAW uint32, low byte. */
int32_t isaac_nightmare_921ce0_collectible_path_needed(uint32_t flag_5e8);
/* 0x009220c4: cmp byte [this+0x4b1], 0 / jne skip.  RAW uint32, low byte==0. */
int32_t isaac_nightmare_921ce0_flag_4b1_continue(uint32_t flag_4b1);
/* 0x00923288: mov al, byte [ebx+8].  RAW uint32, low byte. */
uint32_t isaac_nightmare_921ce0_bool_arg(uint32_t unk);
/* 0x00923290 / 0x009232a9: cmovne 0x41 (dogma) else 0x60.  RAW uint32, low byte. */
uint32_t isaac_nightmare_921ce0_music_id(uint32_t flag_5e8);
/* 0x009232ca: cmp dword [g_Game], 0xc.  FULL dword. */
int32_t isaac_nightmare_921ce0_stage_is_c(uint32_t stage);
/* 0x009220bb: cmp dword [g_Game], 0xd.  FULL dword. */
int32_t isaac_nightmare_921ce0_stage_is_d(uint32_t stage);
/* 0x009220ad: test eax,eax after FirstCollectibleOwner.  FULL dword. */
int32_t isaac_nightmare_921ce0_owner_present(uint32_t eax);
uint32_t isaac_nightmare_921ce0_map_key(void);
uint32_t isaac_nightmare_921ce0_map_isnil_ofs(void);
uint32_t isaac_nightmare_921ce0_map_key_ofs(void);
uint32_t isaac_nightmare_921ce0_map_ofs(void);
uint32_t isaac_nightmare_921ce0_players_begin_ofs(void);
uint32_t isaac_nightmare_921ce0_players_end_ofs(void);
uint32_t isaac_nightmare_921ce0_sso_cap(void);
uint32_t isaac_nightmare_921ce0_strncmp_n(void);
uint32_t isaac_nightmare_921ce0_sprite_stride(void);
uint32_t isaac_nightmare_921ce0_index_ofs(void);
uint32_t isaac_nightmare_921ce0_table_ofs(void);
uint32_t isaac_nightmare_921ce0_base_ofs(void);
uint32_t isaac_nightmare_921ce0_dogma_ofs(void);
uint32_t isaac_nightmare_921ce0_bool_store_ofs(void);
uint32_t isaac_nightmare_921ce0_flag_4b1_ofs(void);
uint32_t isaac_nightmare_921ce0_flag_4bc_ofs(void);
uint32_t isaac_nightmare_921ce0_flag_4bc_clear(void);
uint32_t isaac_nightmare_921ce0_flag_4bc_set(void);
uint32_t isaac_nightmare_921ce0_music_id_normal(void);
uint32_t isaac_nightmare_921ce0_music_id_dogma(void);
uint32_t isaac_nightmare_921ce0_music_recv_ofs(void);
uint32_t isaac_nightmare_921ce0_music_vol_ofs(void);
uint32_t isaac_nightmare_921ce0_stage_c(void);
uint32_t isaac_nightmare_921ce0_stage_d(void);
uint32_t isaac_nightmare_921ce0_collectible_id(void);
uint32_t isaac_nightmare_921ce0_laz_tag(void);
uint32_t isaac_nightmare_921ce0_anm2_load_graphics(void);
uint32_t isaac_nightmare_921ce0_store_3a4_ofs(void);
uint32_t isaac_nightmare_921ce0_store_3a4_value(void);
uint32_t isaac_nightmare_921ce0_log_level(void);
uint32_t isaac_nightmare_921ce0_log_msg_va(void);
uint32_t isaac_nightmare_921ce0_path_va(void);
uint32_t isaac_nightmare_921ce0_iat_strncmp_va(void);
uint32_t isaac_nightmare_921ce0_game_global_va(void);
uint32_t isaac_nightmare_921ce0_manager_global_va(void);
uint32_t isaac_nightmare_921ce0_recv_ofs(void);
uint32_t isaac_nightmare_921ce0_arg_ofs(void);
uint32_t isaac_nightmare_921ce0_g3_ofs(void);
uint32_t isaac_nightmare_921ce0_host_a112c0_va(void);
uint32_t isaac_nightmare_921ce0_host_4288a0_va(void);
uint32_t isaac_nightmare_921ce0_host_4074c0_va(void);
uint32_t isaac_nightmare_921ce0_host_40bd50_va(void);
uint32_t isaac_nightmare_921ce0_host_407f10_va(void);
uint32_t isaac_nightmare_921ce0_host_9be080_va(void);
uint32_t isaac_nightmare_921ce0_host_7e1d50_va(void);
uint32_t isaac_nightmare_921ce0_host_aef15c_va(void);
uint32_t isaac_nightmare_921ce0_host_a0f4c0_va(void);
uint32_t isaac_nightmare_921ce0_va(void);
uint32_t isaac_nightmare_921ce0_ret_va(void);
uint32_t isaac_nightmare_921ce0_int3_va(void);
uint32_t isaac_nightmare_921ce0_body_bytes(void);
uint32_t isaac_nightmare_921ce0_first_ret_trap_bytes(void);
uint32_t isaac_nightmare_921ce0_sites(void);
uint32_t isaac_nightmare_921ce0_site_va(void);
uint32_t isaac_nightmare_921ce0_sibling_va(void);
uint32_t isaac_nightmare_921ce0_next_va(void);

/* ===========================================================================
 * ABI v33 -- PlayerManager::FirstCollectibleOwner (0x009be080) pure islands.
 * arg2 RNG** is UNUSED by this PE body (never read).  Walk: host
 * GetCollectible (0x72fd10; HUD-owned island, stays host) -> laz shared-
 * global byte -> player pointer-vector walk (stride 4; [player+0x2c]==0
 * gate) with primary + shared-twin HasCollectible-shaped host leaves
 * (0x007706e0, stays host); result = player / twin / 0.
 * Cross-family: HUD v13 + Room keep FCO host/CF under their own names; this
 * peels the same PE facts per the PI contract (separate wasm, no symbol
 * overlap).  Siblings: RandomCollectibleOwner 0x009be140 (exact ZHL 10b),
 * address-stable 0x009be2a0 (RNG** variant; 1 caller).  RNG** arg used by
 * RandomCollectibleOwner, not here.
 * =========================================================================== */
enum {
  ISAAC_FCO9BE080_ITEM_CONFIG_OFS = 0x2a404,   /* Manager+0x2a404; host 0x72fd10 */
  ISAAC_FCO9BE080_ITEM_FLAGS_OFS = 0xb8,
  ISAAC_FCO9BE080_TWIN_BIT = 0x80000000,       /* laz shared-global tag bit31 */
  ISAAC_FCO9BE080_LIST_BEGIN_OFS = 0,          /* players vector begin off */
  ISAAC_FCO9BE080_LIST_END_OFS = 4,            /* players vector end off */
  ISAAC_FCO9BE080_LIST_STRIDE = 4,
  ISAAC_FCO9BE080_SLOT_FLAG_OFS = 0x2c,
  ISAAC_FCO9BE080_TWIN_PTR_OFS = 0x1e6c,
  ISAAC_FCO9BE080_LAZ_ARG_OFS = 0x10,          /* stack arg3 byte */
  ISAAC_FCO9BE080_MANAGER_GLOBAL_VA = 0x00c7169c,
  ISAAC_FCO9BE080_HOST_GET_COLLECTIBLE_VA = 0x0072fd10, /* exact ZHL ItemConfig::GetCollectible */
  ISAAC_FCO9BE080_HOST_HAS_COLLECTIBLE_VA = 0x007706e0, /* address-stable leaf */
  ISAAC_FCO9BE080_VA = 0x009be080,
  ISAAC_FCO9BE080_FIRST_RET_VA = 0x009be11d,   /* not-found epilogue */
  ISAAC_FCO9BE080_RET_VA = 0x009be137,         /* terminal ret 0xc */
  ISAAC_FCO9BE080_INT3_VA = 0x009be13a,
  ISAAC_FCO9BE080_BODY_BYTES = 0xb8,           /* 184; through ret */
  ISAAC_FCO9BE080_SITES = 175,                 /* full rel32 E8 census */
  ISAAC_FCO9BE080_SITE_VA = 0x009220a8,        /* NightmareScene::Show dogma==0 */
  ISAAC_FCO9BE080_SITE2_VA = 0x0092225f,       /* NightmareScene::Show netplay arm */
  ISAAC_FCO9BE080_NEXT_VA = 0x009be140         /* RandomCollectibleOwner */
};

/* 0x009be0a7..0x009be0c6: laz byte && item && (item+0xb8 & 0x80000000). */
int32_t isaac_fco_9be080_twin_walk_flag(uint32_t laz_byte, uint32_t item_ptr,
                                        uint32_t item_flags_b8);
/* 0x009be0ce: mov esi,[this]; cmp esi,[this+4] / je not_found.  FULL dword. */
int32_t isaac_fco_9be080_list_empty(uint32_t list_begin, uint32_t list_end);
/* 0x009be0d9: cmp dword [player+0x2c], 0 / jne step.  FULL dword. */
int32_t isaac_fco_9be080_slot_checkable(uint32_t player_field_2c);
/* 0x009be0e9 / 0x009be105: test al,al after host 0x7706e0.  RAW uint32, low byte. */
int32_t isaac_fco_9be080_has_collectible_hit(uint32_t al_byte);
/* 0x009be0f3/0x009be0f9: mov ecx,[player+0x1e6c]; test ecx,ecx.  FULL dword. */
int32_t isaac_fco_9be080_twin_present(uint32_t twin_ptr);
/* 0x009be0ed/0x009be0f9: shared byte first, then twin pointer. */
int32_t isaac_fco_9be080_twin_check_needed(uint32_t shared_flag,
                                           uint32_t twin_ptr);
/* 0x009be10d: add esi, 4.  32-bit wrap. */
uint32_t isaac_fco_9be080_walk_next(uint32_t iter);
/* 0x009be110: cmp esi,[this+4] / jne loop.  FULL dword. */
int32_t isaac_fco_9be080_walk_continue(uint32_t next_iter, uint32_t list_end);
/* 0x009be12f: mov eax, edi -- primary hit returns the player ptr. */
uint32_t isaac_fco_9be080_result_player(uint32_t player_ptr);
/* 0x009be120: mov eax,[edi+0x1e6c] -- twin hit returns the shared holder. */
uint32_t isaac_fco_9be080_result_twin(uint32_t twin_ptr);
/* 0x009be115: xor eax,eax -- no owner. */
uint32_t isaac_fco_9be080_result_not_found(void);
uint32_t isaac_fco_9be080_item_config_ofs(void);
uint32_t isaac_fco_9be080_get_collectible_va(void);
uint32_t isaac_fco_9be080_has_collectible_va(void);
uint32_t isaac_fco_9be080_item_flags_ofs(void);
uint32_t isaac_fco_9be080_twin_bit(void);
uint32_t isaac_fco_9be080_list_begin_ofs(void);
uint32_t isaac_fco_9be080_list_end_ofs(void);
uint32_t isaac_fco_9be080_list_stride(void);
uint32_t isaac_fco_9be080_slot_flag_ofs(void);
uint32_t isaac_fco_9be080_twin_ptr_ofs(void);
uint32_t isaac_fco_9be080_laz_arg_ofs(void);
uint32_t isaac_fco_9be080_manager_global_va(void);
uint32_t isaac_fco_9be080_va(void);
uint32_t isaac_fco_9be080_ret_va(void);
uint32_t isaac_fco_9be080_first_ret_va(void);
uint32_t isaac_fco_9be080_int3_va(void);
uint32_t isaac_fco_9be080_body_bytes(void);
uint32_t isaac_fco_9be080_sites(void);
uint32_t isaac_fco_9be080_site_va(void);
uint32_t isaac_fco_9be080_site2_va(void);
uint32_t isaac_fco_9be080_next_va(void);

/* ===========================================================================
 * ABI v34 -- PlayerManager::RandomCollectibleOwner (0x009be140) pure islands.
 * Exact ZHL 10 B: `__thiscall Entity_Player*
 * PlayerManager::RandomCollectibleOwner(CollectibleType collectibleID,
 * unsigned int seed, RNG** returnRNG)`.  All 17 rel32 E8 callers pass
 * this = g_Game + 0x1baa8 (the player-list container); arg2 is a BY-VALUE
 * 32-bit seed (not a pointer — the ZHL spelling notwithstanding), arg3 an
 * optional out pointer (16 of 17 callers push 0; 0x7171bd / 0x717a10, both
 * id 0xec, pass a stack slot).
 *
 * PE draw (0x009be140 … ret 0xc @ 0x009be295, int3 @ 0x009be298):
 *   walk players [this+0..this+4) stride 4; slot gate [player+0x2c]==0;
 *   host HasCollectible leaf 0x007706e0 -> AL gate (RAW low byte);
 *   seed==0 -> host log a112c0(0x10, 0xb6bf54 "RNG Seed is zero!\n") then
 *     int3 trap @ 0x009be1b1 (fatal; the 0x009be1b2 reload is dead code);
 *   else xorshift32 with shift table dwords [0xb1f5d0]=3, [0xb1f5d4]=5,
 *     [0xb1f5d8]=20 (cl & 31 each; result stored to the LOCAL arg copy
 *     [ebp+0xc] only — never written back to the caller);
 *   candidate f32 = (float)((double)u32(state)) * 2^-32f via the
 *     cvtdq2pd/addsd 0.0|2^32 sign-correction table @ 0xbacb00, cvtpd2ps,
 *     mulss @ 0xba9ff0; best init -1.0f @ 0xbaad50;
 *   comiss candidate,best / jbe keeps OLD best (unordered or <=) — update
 *     iff ordered && candidate > best; best player kept in the local.
 *   Tail: out==NULL -> return best; best==0 -> *out=0, return 0;
 *     id<0 (SIGNED jns) -> *out = [player+0x1770] (vector begin);
 *     id>=0 -> count = SAR32([p+0x1774]-[p+0x1770],4) (16-byte stride),
 *     id>=count (SIGNED jl) -> host log a112c0(0x10, 0xb62a7c
 *     "Collectible ID out of bounds!\n") then CONTINUE (no trap) with end
 *     re-read @ 0x009be25b; index = UNSIGNED min(id, count-1) via
 *     `cmp eax,edi / cmovb edi,eax` @ 0x009be272; *out = begin + index*16
 *     (begin ALWAYS re-read @ 0x009be264).  Return value = best player.
 *   The out slot receives the winning collectible ENTRY pointer (16-byte
 *   stride), never an RNG state — the ZHL name `returnRNG` is retained for
 *   catalog identity only; the PE proves the out is collectible-shaped.
 *
 * Cross-family: the shared walk gates (list_empty / slot_checkable /
 * has_collectible_hit) are the SAME PE code as FCO 0x009be080; HUD v13 /
 * Room own those facts under their own names.  This peel re-derives them
 * per the PI contract (separate wasm modules, no symbol overlap, no import)
 * and asserts the FCO<->RCO agreement laws in the family tests.  The draw
 * surface (xorshift32 + next-float + best-select + out tail) is exclusive
 * to this body; no other family references 0x009be140.
 * =========================================================================== */
enum {
  ISAAC_RCO9BE140_LIST_BEGIN_OFS = 0,       /* players vector begin off */
  ISAAC_RCO9BE140_LIST_END_OFS = 4,         /* players vector end off */
  ISAAC_RCO9BE140_LIST_STRIDE = 4,
  ISAAC_RCO9BE140_SLOT_FLAG_OFS = 0x2c,
  ISAAC_RCO9BE140_COLLECT_BEGIN_OFS = 0x1770, /* player collectible vector */
  ISAAC_RCO9BE140_COLLECT_END_OFS = 0x1774,
  ISAAC_RCO9BE140_COLLECT_STRIDE = 0x10,    /* 16-byte collectible entries */
  ISAAC_RCO9BE140_SEED_ASSERT_MSG_VA = 0x00b6bf54, /* "RNG Seed is zero!\n" */
  ISAAC_RCO9BE140_OOB_ASSERT_MSG_VA = 0x00b62a7c,  /* "Collectible ID out of bounds!\n" */
  ISAAC_RCO9BE140_LOG_LEVEL = 0x10,         /* ASSERT (== A112C0_LEVEL_ASSERT) */
  ISAAC_RCO9BE140_ASSERT_TRAP_VA = 0x009be1b1, /* int3 after the seed assert */
  ISAAC_RCO9BE140_HOST_HAS_COLLECTIBLE_VA = 0x007706e0, /* address-stable leaf */
  ISAAC_RCO9BE140_HOST_LOG_VA = 0x00a112c0,
  ISAAC_RCO9BE140_GAME_GLOBAL_VA = 0x00c71678, /* all 17 callers: g_Game */
  ISAAC_RCO9BE140_RECEIVER_OFS = 0x1baa8,   /* this = g_Game + 0x1baa8 */
  ISAAC_RCO9BE140_RNG_SHIFT_TABLE_VA = 0x00b1f5d0, /* dwords 3 / 5; 20 @ +8 */
  ISAAC_RCO9BE140_RNG_SHIFT1 = 3,
  ISAAC_RCO9BE140_RNG_SHIFT2 = 5,
  ISAAC_RCO9BE140_RNG_SHIFT3 = 20,
  ISAAC_RCO9BE140_BEST_INIT_BITS = 0xbf800000, /* -1.0f @ 0xbaad50 (verified) */
  ISAAC_RCO9BE140_SCALE_BITS = 0x2f7ffffe,  /* @ 0xba9ff0 — VERIFIED dword;
                                               NOT the handy 2^-32f 0x2f800000 */
  ISAAC_RCO9BE140_SIGN_CORR_TABLE_VA = 0x00bacb00, /* f64 0.0 / 4294967296.0 */
  ISAAC_RCO9BE140_VA = 0x009be140,
  ISAAC_RCO9BE140_FIRST_RET_VA = 0x009be237, /* id<0 out epilogue */
  ISAAC_RCO9BE140_RET_VA = 0x009be295,      /* terminal ret 0xc */
  ISAAC_RCO9BE140_INT3_VA = 0x009be298,
  ISAAC_RCO9BE140_BODY_BYTES = 0x158,       /* 344; through int3 */
  ISAAC_RCO9BE140_SITES = 17,               /* full rel32 E8 census */
  ISAAC_RCO9BE140_NEXT_VA = 0x009be2a0      /* address-stable RNG** variant */
};

/* 0x009be16f: cmp esi,[this+4] / je tail.  FULL dword. */
int32_t isaac_rco_9be140_list_empty(uint32_t list_begin, uint32_t list_end);
/* 0x009be187: cmp dword [player+0x2c],0 / jne skip.  FULL dword. */
int32_t isaac_rco_9be140_slot_checkable(uint32_t player_field_2c);
/* 0x009be197: test al,al after host 0x7706e0.  RAW uint32, low byte. */
int32_t isaac_rco_9be140_has_collectible_hit(uint32_t al_byte);
/* 0x009be19e: test edx,edx / jne advance.  FULL dword; seed==0 -> assert+trap. */
int32_t isaac_rco_9be140_seed_assert_needed(uint32_t seed);
/* 0x009be1b5..0x009be1ce: xorshift32.  Each shift dword: low byte, &31 (cl). */
uint32_t isaac_rco_9be140_xorshift_state(uint32_t seed, uint32_t shift1,
                                         uint32_t shift2, uint32_t shift3);
/* 0x009be1d3..0x009be1ea: cvtdq2pd + sign-correction addsd == (double)u32. */
double isaac_rco_9be140_state_as_f64(uint32_t state);
/* 0x009be1ea cvtpd2ps then 0x009be1ee mulss 2^-32f: [0,1) candidate. */
float isaac_rco_9be140_next_float(uint32_t state);
/* 0x009be1f6 comiss / 0x009be1fa jbe keeps old: update iff ordered && >. */
int32_t isaac_rco_9be140_best_update_needed(float candidate, float best);
/* 0x009be20c: add esi,4.  32-bit wrap. */
uint32_t isaac_rco_9be140_walk_next(uint32_t iter);
/* 0x009be20f: cmp esi,[this+4] / jne loop.  Bound re-read each iteration. */
int32_t isaac_rco_9be140_walk_continue(uint32_t next_iter, uint32_t list_end);
/* 0x009be21b: test esi,esi -- arg3 out ptr.  FULL dword. */
int32_t isaac_rco_9be140_out_present(uint32_t out_ptr);
/* 0x009be21f: test ebx,ebx -- best player so far.  FULL dword. */
int32_t isaac_rco_9be140_winner_present(uint32_t best_player);
/* 0x009be223: test edi,edi / jns indexed.  SIGNED: id<0 -> fixed-out path. */
int32_t isaac_rco_9be140_id_negative(int32_t collectible_id);
/* 0x009be242: sub eax,[p+0x1770]; sar eax,4.  32-bit wrap, arithmetic shift. */
int32_t isaac_rco_9be140_collectible_count(int32_t end, int32_t begin);
/* 0x009be24b: cmp edi,eax / jl ok.  SIGNED: assert when id >= count. */
int32_t isaac_rco_9be140_collectible_id_oob(int32_t id, int32_t count);
/* 0x009be26f: lea eax,[edx-1] -- count-1 for the unsigned clamp. */
uint32_t isaac_rco_9be140_collectible_count_minus1(int32_t count);
/* 0x009be272: cmp eax,edi / cmovb edi,eax.  UNSIGNED min(id, count-1). */
uint32_t isaac_rco_9be140_collectible_index_clamp(uint32_t id,
                                                  uint32_t count_minus1);
/* 0x009be279: shl edi,4; add edi,ecx.  base + index*16, 32-bit wrap. */
uint32_t isaac_rco_9be140_collectible_entry_ptr(uint32_t base,
                                                uint32_t index);
/* 0x009be22d / 0x009be277 / 0x009be28d: mov eax,ebx -- return best player. */
uint32_t isaac_rco_9be140_result_player(uint32_t best_player);
uint32_t isaac_rco_9be140_list_begin_ofs(void);
uint32_t isaac_rco_9be140_list_end_ofs(void);
uint32_t isaac_rco_9be140_list_stride(void);
uint32_t isaac_rco_9be140_slot_flag_ofs(void);
uint32_t isaac_rco_9be140_collect_begin_ofs(void);
uint32_t isaac_rco_9be140_collect_end_ofs(void);
uint32_t isaac_rco_9be140_collect_stride(void);
uint32_t isaac_rco_9be140_seed_assert_msg_va(void);
uint32_t isaac_rco_9be140_oob_assert_msg_va(void);
uint32_t isaac_rco_9be140_log_level(void);
uint32_t isaac_rco_9be140_assert_trap_va(void);
uint32_t isaac_rco_9be140_has_collectible_va(void);
uint32_t isaac_rco_9be140_host_log_va(void);
uint32_t isaac_rco_9be140_game_global_va(void);
uint32_t isaac_rco_9be140_receiver_ofs(void);
uint32_t isaac_rco_9be140_rng_shift_table_va(void);
uint32_t isaac_rco_9be140_rng_shift1(void);
uint32_t isaac_rco_9be140_rng_shift2(void);
uint32_t isaac_rco_9be140_rng_shift3(void);
uint32_t isaac_rco_9be140_best_init_bits(void);
uint32_t isaac_rco_9be140_scale_bits(void);
uint32_t isaac_rco_9be140_sign_corr_table_va(void);
float isaac_rco_9be140_best_init_value(void);
float isaac_rco_9be140_scale_value(void);
uint32_t isaac_rco_9be140_va(void);
uint32_t isaac_rco_9be140_ret_va(void);
uint32_t isaac_rco_9be140_first_ret_va(void);
uint32_t isaac_rco_9be140_int3_va(void);
uint32_t isaac_rco_9be140_body_bytes(void);
uint32_t isaac_rco_9be140_sites(void);
uint32_t isaac_rco_9be140_next_va(void);

/* ===========================================================================
 * ABI v35 -- address-stable RNG**-variant sibling 0x009be2a0 pure islands.
 * Single documented rel32 E8 caller: 0x006eca9d (enclosing handler start
 * ~0x006e8ae0, no ZHL; this = g_Game + 0x1baa8).  No exact ZHL -> keep the
 * address-stable name.  Head: direct index into the Manager player list
 * ([0xc7169c]+0x2a410/+0x2a414, stride 4) with id & 0x7fff (15-bit) and a
 * SIGNED range check (jge -> player=0); then the FCO/RCO twin-aware walk
 * against [this+0..this+4) with host HasCollectible leaf 0x00771550 and the
 * twin flag decided at 0x009be2da..0x009be2f8 (arg3 byte && player && bit31
 * of [player+0xb8]).  Not-found tail stores *out=0 and returns 0; twin-hit
 * arm returns [player+0x1e6c] and stores the host 0x0065cf80 result;
 * player-hit arm logs 0xa112c0(0x10, 0xb64a88) when SIGNED id<0 or
 * id>=count (flow continues), then clamps the index via the sbb/and idiom
 * (= UNSIGNED min(id, count-1)) and stores cbegin + index*16 with the
 * collect vector at player+0x177c/+0x1780.  Return value = player.
 * =========================================================================== */
enum {
  ISAAC_A9BE2A0_PLAYERS_BEGIN_OFS = 0x2a410, /* Manager+0x2a410 */
  ISAAC_A9BE2A0_PLAYERS_END_OFS = 0x2a414,
  ISAAC_A9BE2A0_LIST_BEGIN_OFS = 0,          /* this+0 walk begin */
  ISAAC_A9BE2A0_LIST_END_OFS = 4,            /* this+4 walk end */
  ISAAC_A9BE2A0_LIST_STRIDE = 4,
  ISAAC_A9BE2A0_SLOT_FLAG_OFS = 0x2c,
  ISAAC_A9BE2A0_ITEM_FLAGS_OFS = 0xb8,
  ISAAC_A9BE2A0_TWIN_BIT = 0x80000000,
  ISAAC_A9BE2A0_TWIN_PTR_OFS = 0x1e6c,
  ISAAC_A9BE2A0_COLLECT_BEGIN_OFS = 0x177c,
  ISAAC_A9BE2A0_COLLECT_END_OFS = 0x1780,
  ISAAC_A9BE2A0_COLLECT_STRIDE = 0x10,
  ISAAC_A9BE2A0_ID_MASK = 0x7fff,            /* 15-bit collectible id mask */
  ISAAC_A9BE2A0_MANAGER_GLOBAL_VA = 0x00c7169c,
  ISAAC_A9BE2A0_GAME_GLOBAL_VA = 0x00c71678,
  ISAAC_A9BE2A0_RECEIVER_OFS = 0x1baa8,      /* this = g_Game + 0x1baa8 */
  ISAAC_A9BE2A0_HOST_HAS_COLLECTIBLE_VA = 0x00771550, /* address-stable */
  ISAAC_A9BE2A0_HOST_TWIN_GET_VA = 0x0065cf80,        /* *out twin-get */
  ISAAC_A9BE2A0_HOST_LOG_VA = 0x00a112c0,
  ISAAC_A9BE2A0_OOB_MSG_VA = 0x00b64a88,     /* "Trinket ID out of bounds!\n" */
  ISAAC_A9BE2A0_LOG_LEVEL = 0x10,            /* ASSERT (== A112C0_LEVEL_ASSERT) */
  ISAAC_A9BE2A0_VA = 0x009be2a0,
  ISAAC_A9BE2A0_FIRST_RET_VA = 0x009be356,   /* not-found epilogue ret */
  ISAAC_A9BE2A0_RET_VA = 0x009be3d8,         /* player-hit arm ret 0xc */
  ISAAC_A9BE2A0_INT3_VA = 0x009be3db,
  ISAAC_A9BE2A0_BODY_BYTES = 0x13b,          /* 315; through int3 */
  ISAAC_A9BE2A0_SITES = 1,                   /* full rel32 E8 census */
  ISAAC_A9BE2A0_SITE_VA = 0x006eca9d,
  ISAAC_A9BE2A0_NEXT_VA = 0x009be3e0         /* RNG-returning RCO sibling */
};

/* 0x009be2bf..0x009be2c3: count = SAR32(end-begin,2).  Signed, wrap. */
int32_t isaac_a9be2a0_players_count(uint32_t end, uint32_t begin);
/* 0x009be2c6: and ecx,0x7fff -- 15-bit mask on the collectible id. */
uint32_t isaac_a9be2a0_id_mask15(uint32_t id);
/* 0x009be2cf..0x009be2d1: SIGNED jge -> direct player slot = 0 (OOR). */
int32_t isaac_a9be2a0_direct_index_oor(int32_t masked_id, int32_t count);
/* 0x009be2d3: mov eax,[edx+ecx*4].  begin + masked_id*4, 32-bit wrap. */
uint32_t isaac_a9be2a0_direct_player_ptr(uint32_t begin, uint32_t masked_id);
/* 0x009be2da..0x009be2f8: arg3 byte && player && bit31([player+0xb8]). */
int32_t isaac_a9be2a0_twin_flag(uint32_t arg3_byte, uint32_t player_present,
                                uint32_t flags_b8);
/* 0x009be2fc..0x009be301: cmp esi,[edi+4] / je not-found.  FULL dword. */
int32_t isaac_a9be2a0_list_empty(uint32_t list_begin, uint32_t list_end);
/* 0x009be307: cmp dword [player+0x2c],0 / jne skip.  FULL dword. */
int32_t isaac_a9be2a0_slot_checkable(uint32_t player_field_2c);
/* 0x009be317: test al,al after host 0x771550.  RAW uint32, low byte. */
int32_t isaac_a9be2a0_has_collectible_hit(uint32_t al_byte);
/* 0x009be31b..0x009be328: flag byte != 0 AND twin ptr != 0. */
int32_t isaac_a9be2a0_twin_check_needed(uint32_t twin_flag,
                                        uint32_t twin_ptr);
/* 0x009be339: add esi,4.  32-bit wrap. */
uint32_t isaac_a9be2a0_walk_next(uint32_t iter);
/* 0x009be33c: cmp esi,[eax+4] / jne loop.  End re-read each iteration. */
int32_t isaac_a9be2a0_walk_continue(uint32_t next_iter, uint32_t list_end);
/* 0x009be341 / 0x009be35c / 0x009be380: out ptr test.  FULL dword. */
int32_t isaac_a9be2a0_out_present(uint32_t out_ptr);
/* 0x009be384..0x009be386: test ebx,ebx / js log.  SIGNED id<0. */
int32_t isaac_a9be2a0_id_negative(int32_t collectible_id);
/* 0x009be38e..0x009be394: count = SAR32(end-begin,4).  Signed. */
int32_t isaac_a9be2a0_collect_count(int32_t end, int32_t begin);
/* 0x009be397..0x009be399: SIGNED id >= count -> assert log (then clamp). */
int32_t isaac_a9be2a0_id_oob(int32_t id, int32_t count);
/* 0x009be386 js OR 0x009be399 jl-not-taken: combined OOB log gate. */
int32_t isaac_a9be2a0_log_needed(int32_t id, int32_t count);
/* 0x009be3bd: dec edx.  Wrap-safe count-1. */
uint32_t isaac_a9be2a0_collect_count_minus1(int32_t count);
/* 0x009be3be..0x009be3c6: sbb/and + cmovb == UNSIGNED min(id, count-1). */
uint32_t isaac_a9be2a0_collect_index_clamp(uint32_t id,
                                           uint32_t count_minus1);
/* 0x009be3c9..0x009be3cc: base + index*16, 32-bit wrap. */
uint32_t isaac_a9be2a0_collect_entry_ptr(uint32_t base, uint32_t index);
/* 0x009be36e: mov eax,[edi+0x1e6c] -- twin-hit return value. */
uint32_t isaac_a9be2a0_twin_result(uint32_t twin_ptr);
/* 0x009be34e: xor eax,eax -- not-found return 0. */
uint32_t isaac_a9be2a0_result_not_found(void);
/* 0x009be3d0: mov eax,edi -- player-hit return value. */
uint32_t isaac_a9be2a0_result_player(uint32_t player);
/* 0x009be348: mov dword [eax],0 -- not-found *out store value. */
uint32_t isaac_a9be2a0_store_zero_value(void);
uint32_t isaac_a9be2a0_players_begin_ofs(void);
uint32_t isaac_a9be2a0_players_end_ofs(void);
uint32_t isaac_a9be2a0_list_begin_ofs(void);
uint32_t isaac_a9be2a0_list_end_ofs(void);
uint32_t isaac_a9be2a0_list_stride(void);
uint32_t isaac_a9be2a0_slot_flag_ofs(void);
uint32_t isaac_a9be2a0_item_flags_ofs(void);
uint32_t isaac_a9be2a0_twin_bit(void);
uint32_t isaac_a9be2a0_twin_ptr_ofs(void);
uint32_t isaac_a9be2a0_collect_begin_ofs(void);
uint32_t isaac_a9be2a0_collect_end_ofs(void);
uint32_t isaac_a9be2a0_collect_stride(void);
uint32_t isaac_a9be2a0_id_mask(void);
uint32_t isaac_a9be2a0_manager_global_va(void);
uint32_t isaac_a9be2a0_game_global_va(void);
uint32_t isaac_a9be2a0_receiver_ofs(void);
uint32_t isaac_a9be2a0_has_collectible_va(void);
uint32_t isaac_a9be2a0_twin_get_va(void);
uint32_t isaac_a9be2a0_host_log_va(void);
uint32_t isaac_a9be2a0_oob_msg_va(void);
uint32_t isaac_a9be2a0_log_level(void);
uint32_t isaac_a9be2a0_va(void);
uint32_t isaac_a9be2a0_ret_va(void);
uint32_t isaac_a9be2a0_first_ret_va(void);
uint32_t isaac_a9be2a0_int3_va(void);
uint32_t isaac_a9be2a0_body_bytes(void);
uint32_t isaac_a9be2a0_sites(void);
uint32_t isaac_a9be2a0_site_va(void);
uint32_t isaac_a9be2a0_next_va(void);

/* ===========================================================================
 * ABI v36 -- PlayerManager::RandomTrinketOwner (0x009be3e0) pure islands.
 * Exact ZHL 10 B: `__thiscall Entity_Player*
 * PlayerManager::RandomTrinketOwner(TrinketType trinketType,
 * unsigned int seed, RNG** returnRNG)`.  Full rel32 E8 census = 10 sites
 * (0x5348fc / 0x663ada / 0x6641b1 / 0x6bccdc / 0x71711d / 0x71716a /
 * 0x717969 / 0x7179bb / 0x71d1b4 / 0x71d53c; this = g_Game + 0x1baa8;
 * arg2 BY-VALUE seed, arg3 optional out ptr — the ZHL `returnRNG` spelling
 * notwithstanding, *out receives a collectible ENTRY pointer as in RCO).
 *
 * PE draw (0x009be3e0 … ret 0xc @ 0x009be52a, int3 @ 0x009be52d):
 *   walk players [this+0..this+4) stride 4; slot gate [player+0x2c]==0;
 *   host HasCollectible leaf 0x00771550 -> AL gate (RAW low byte);
 *   seed==0 -> host log a112c0(0x10, 0xb6bf54 "RNG Seed is zero!\n") then
 *     int3 trap @ 0x009be451 (the 0x009be452 reload is dead code);
 *   else xorshift32 with the SAME shift table dwords as RCO ([0xb1f5d0]=3,
 *     [0xb1f5d4]=5, [0xb1f5d8]=20; cl & 31 each; result stored to the LOCAL
 *     arg copy [ebp+0xc] only — never written back to the caller);
 *   candidate f32 = (float)((double)u32(state)) * scale @ 0xba9ff0 with the
 *     cvtdq2pd/addsd 0.0|2^32 sign-correction table @ 0xbacb00 (verified
 *     dwords: scale = 0x2f7ffffe, best init = -1.0f @ 0xbaad50);
 *   comiss candidate,best / jbe keeps OLD best — update iff ordered &&
 *     candidate > best; best player kept in the local.
 *   Tail (v35-shaped, NOT the v34 fixed-out arm): out==NULL -> return best;
 *     best==0 -> *out=0, return 0; id<0 (SIGNED js 0x009be4c7) -> OOB log
 *     then CONTINUE into the clamp; id>=count (SIGNED jl 0x009be4da) -> host
 *     log a112c0(0x10, 0xb64a88 "Trinket ID out of bounds!\n") then
 *     CONTINUE; index = UNSIGNED min(id, count-1) via the sbb/and/cmovb
 *     idiom @ 0x009be4ff..0x009be509 (count = SAR32([p+0x1780]-[p+0x177c],4),
 *     16-byte entries, end re-read); *out = begin + index*16 @ 0x009be511.
 *     Return value = best player.
 * Constants on this unit verified from raw PE dwords, NOT inferred: shifts
 * 3/5/20 @ 0xb1f5d0, best init 0xbf800000, scale 0x2f7ffffe, sign-corr
 * f64 0.0/4294967296.0 @ 0xbacb00, seed msg 0xb6bf54, OOB msg 0xb64a88.
 * =========================================================================== */
enum {
  ISAAC_RTO9BE3E0_LIST_BEGIN_OFS = 0,       /* players vector begin off */
  ISAAC_RTO9BE3E0_LIST_END_OFS = 4,         /* players vector end off */
  ISAAC_RTO9BE3E0_LIST_STRIDE = 4,
  ISAAC_RTO9BE3E0_SLOT_FLAG_OFS = 0x2c,
  ISAAC_RTO9BE3E0_COLLECT_BEGIN_OFS = 0x177c, /* player collectible vector */
  ISAAC_RTO9BE3E0_COLLECT_END_OFS = 0x1780,
  ISAAC_RTO9BE3E0_COLLECT_STRIDE = 0x10,    /* 16-byte collectible entries */
  ISAAC_RTO9BE3E0_SEED_ASSERT_MSG_VA = 0x00b6bf54, /* "RNG Seed is zero!\n" */
  ISAAC_RTO9BE3E0_OOB_ASSERT_MSG_VA = 0x00b64a88,  /* "Trinket ID out of bounds!\n" */
  ISAAC_RTO9BE3E0_LOG_LEVEL = 0x10,         /* ASSERT (== A112C0_LEVEL_ASSERT) */
  ISAAC_RTO9BE3E0_ASSERT_TRAP_VA = 0x009be451, /* int3 after the seed assert */
  ISAAC_RTO9BE3E0_HOST_HAS_COLLECTIBLE_VA = 0x00771550, /* address-stable leaf */
  ISAAC_RTO9BE3E0_HOST_LOG_VA = 0x00a112c0,
  ISAAC_RTO9BE3E0_GAME_GLOBAL_VA = 0x00c71678, /* all 10 callers: g_Game */
  ISAAC_RTO9BE3E0_RECEIVER_OFS = 0x1baa8,   /* this = g_Game + 0x1baa8 */
  ISAAC_RTO9BE3E0_RNG_SHIFT_TABLE_VA = 0x00b1f5d0, /* dwords 3 / 5; 20 @ +8 */
  ISAAC_RTO9BE3E0_RNG_SHIFT1 = 3,
  ISAAC_RTO9BE3E0_RNG_SHIFT2 = 5,
  ISAAC_RTO9BE3E0_RNG_SHIFT3 = 20,
  ISAAC_RTO9BE3E0_BEST_INIT_BITS = 0xbf800000, /* -1.0f @ 0xbaad50 (verified) */
  ISAAC_RTO9BE3E0_SCALE_BITS = 0x2f7ffffe,  /* @ 0xba9ff0 (verified dword) */
  ISAAC_RTO9BE3E0_SIGN_CORR_TABLE_VA = 0x00bacb00, /* f64 0.0 / 4294967296.0 */
  ISAAC_RTO9BE3E0_VA = 0x009be3e0,
  ISAAC_RTO9BE3E0_FIRST_RET_VA = 0x009be51b, /* best==0/out==0 epilogue ret */
  ISAAC_RTO9BE3E0_RET_VA = 0x009be52a,      /* terminal ret 0xc */
  ISAAC_RTO9BE3E0_INT3_VA = 0x009be52d,
  ISAAC_RTO9BE3E0_BODY_BYTES = 0x14d,       /* 333; through int3 */
  ISAAC_RTO9BE3E0_SITES = 10,               /* full rel32 E8 census */
  ISAAC_RTO9BE3E0_NEXT_VA = 0x009be530      /* next RCO-family sibling */
};

/* 0x009be3f9: cmp esi,[this+4] / je tail.  FULL dword. */
int32_t isaac_rto_9be3e0_list_empty(uint32_t list_begin, uint32_t list_end);
/* 0x009be423: cmp dword [player+0x2c],0 / jne skip.  FULL dword. */
int32_t isaac_rto_9be3e0_slot_checkable(uint32_t player_field_2c);
/* 0x009be437: test al,al after host 0x771550.  RAW uint32, low byte. */
int32_t isaac_rto_9be3e0_has_collectible_hit(uint32_t al_byte);
/* 0x009be43e: test edx,edx / jne draw.  FULL dword; seed==0 -> assert+trap. */
int32_t isaac_rto_9be3e0_seed_assert_needed(uint32_t seed);
/* 0x009be455..0x009be46e: xorshift32, same table as RCO (3/5/20). */
uint32_t isaac_rto_9be3e0_xorshift_state(uint32_t seed, uint32_t shift1,
                                         uint32_t shift2, uint32_t shift3);
/* 0x009be476..0x009be481: cvtdq2pd + sign-correction == (double)u32. */
double isaac_rto_9be3e0_state_as_f64(uint32_t state);
/* 0x009be48d cvtpd2ps then 0x009be491 mulss scale: [0,1) candidate. */
float isaac_rto_9be3e0_next_float(uint32_t state);
/* 0x009be499 comiss / 0x009be49d jbe keeps old: update iff ordered && >. */
int32_t isaac_rto_9be3e0_best_update_needed(float candidate, float best);
/* 0x009be4ae: add esi,4.  32-bit wrap. */
uint32_t isaac_rto_9be3e0_walk_next(uint32_t iter);
/* 0x009be4b1: cmp esi,[eax+4] / jne loop.  Bound re-read each iteration. */
int32_t isaac_rto_9be3e0_walk_continue(uint32_t next_iter, uint32_t list_end);
/* 0x009be4bd: test edi,edi -- arg3 out ptr.  FULL dword. */
int32_t isaac_rto_9be3e0_out_present(uint32_t out_ptr);
/* 0x009be4c1: test ebx,ebx -- best player so far.  FULL dword. */
int32_t isaac_rto_9be3e0_winner_present(uint32_t best_player);
/* 0x009be4c5: test ecx,ecx / js log.  SIGNED: id<0 -> OOB log, then clamp. */
int32_t isaac_rto_9be3e0_id_negative(int32_t trinket_id);
/* 0x009be4cf..0x009be4d5: count = SAR32(end-begin,4).  Signed, wrap. */
int32_t isaac_rto_9be3e0_collectible_count(int32_t end, int32_t begin);
/* 0x009be4d8: cmp ecx,eax / jl ok.  SIGNED: assert when id >= count. */
int32_t isaac_rto_9be3e0_collectible_id_oob(int32_t id, int32_t count);
/* 0x009be4c7 js OR 0x009be4da jl-not-taken: combined OOB log gate. */
int32_t isaac_rto_9be3e0_log_needed(int32_t id, int32_t count);
/* 0x009be4fb sar / 0x009be4fe dec: wrap-safe count-1. */
uint32_t isaac_rto_9be3e0_collectible_count_minus1(int32_t count);
/* 0x009be4ff..0x009be509: sbb/and + cmovb == UNSIGNED min(id, count-1). */
uint32_t isaac_rto_9be3e0_collectible_index_clamp(uint32_t id,
                                                  uint32_t count_minus1);
/* 0x009be50e shl edx,4; 0x009be511 add edx,ecx.  base + index*16, wrap. */
uint32_t isaac_rto_9be3e0_collectible_entry_ptr(uint32_t base,
                                                uint32_t index);
/* 0x009be50c / 0x009be524: mov eax,ebx — return best player. */
uint32_t isaac_rto_9be3e0_result_player(uint32_t best_player);
/* 0x009be51e..0x009be520: xor edx,edx / mov [edi],edx — best==0 store. */
uint32_t isaac_rto_9be3e0_store_zero_value(void);
uint32_t isaac_rto_9be3e0_list_begin_ofs(void);
uint32_t isaac_rto_9be3e0_list_end_ofs(void);
uint32_t isaac_rto_9be3e0_list_stride(void);
uint32_t isaac_rto_9be3e0_slot_flag_ofs(void);
uint32_t isaac_rto_9be3e0_collect_begin_ofs(void);
uint32_t isaac_rto_9be3e0_collect_end_ofs(void);
uint32_t isaac_rto_9be3e0_collect_stride(void);
uint32_t isaac_rto_9be3e0_seed_assert_msg_va(void);
uint32_t isaac_rto_9be3e0_oob_assert_msg_va(void);
uint32_t isaac_rto_9be3e0_log_level(void);
uint32_t isaac_rto_9be3e0_assert_trap_va(void);
uint32_t isaac_rto_9be3e0_has_collectible_va(void);
uint32_t isaac_rto_9be3e0_host_log_va(void);
uint32_t isaac_rto_9be3e0_game_global_va(void);
uint32_t isaac_rto_9be3e0_receiver_ofs(void);
uint32_t isaac_rto_9be3e0_rng_shift_table_va(void);
uint32_t isaac_rto_9be3e0_rng_shift1(void);
uint32_t isaac_rto_9be3e0_rng_shift2(void);
uint32_t isaac_rto_9be3e0_rng_shift3(void);
uint32_t isaac_rto_9be3e0_best_init_bits(void);
uint32_t isaac_rto_9be3e0_scale_bits(void);
uint32_t isaac_rto_9be3e0_sign_corr_table_va(void);
float isaac_rto_9be3e0_best_init_value(void);
float isaac_rto_9be3e0_scale_value(void);
uint32_t isaac_rto_9be3e0_va(void);
uint32_t isaac_rto_9be3e0_ret_va(void);
uint32_t isaac_rto_9be3e0_first_ret_va(void);
uint32_t isaac_rto_9be3e0_int3_va(void);
uint32_t isaac_rto_9be3e0_body_bytes(void);
uint32_t isaac_rto_9be3e0_sites(void);
uint32_t isaac_rto_9be3e0_next_va(void);

/* ===========================================================================
 * ABI v37 -- 0x009be530, address-stable RCO/RTO-family sibling (NO exact
 * ZHL; 7-site rel32 E8 census 0x506e07 / 0x50f3ce / 0x53bb1d / 0x5400f0 /
 * 0x54101a / 0x54ae57 / 0x54bce3, all `add ecx,0x1baa8 / push ecx / call`
 * -> this = g_Game + 0x1baa8; arg2 BY-VALUE seed; arg1 pushed receiver
 * UNUSED in the body; ret 8, single epilogue).
 *
 * PE draw (0x009be530 … ret 8 @ 0x009be62d, int3 @ 0x009be5be):
 *   walk players [this+0..this+4) stride 4; candidate gates (ALL pass or
 *     skip): slot dword [player+0x2c]==0; low byte [player+0x202c]==0;
 *     low byte [player+0x20a9]==0; SIGNED [player+0x17e0]>=3.
 *   seed==0 (state==0) INSIDE the loop, per passing candidate -> host log
 *     a112c0(0x10, 0xb6bf54 "RNG Seed is zero!\n") then int3 trap @
 *     0x009be5be (the 0x009be5bf reload is dead code).
 *   else xorshift32 with the SAME shift table as RCO/RTO ([0xb1f5d0]=3,
 *     [0xb1f5d4]=5, [0xb1f5d8]=20; cl & 31 each); the state advances in
 *     ebx ACROSS candidates (one draw per passing candidate, in list
 *     order) and is NEVER written back to the caller.
 *   candidate f32 = (float)((double)u32(state)) * scale @ 0xba9ff0 with
 *     the cvtdq2pd/addsd sign-correction table @ 0xbacb00 (same verified
 *     dwords as v36: scale 0x2f7ffffe, best init -1.0f @ 0xbaad50).
 *   comiss candidate,best / jbe keeps OLD best — update iff ordered &&
 *     candidate > best; best/winner locals [ebp-8]/[ebp-0xc].
 *   Bound re-read: ecx = this @ 0x009be5df feeds `cmp esi,[ecx+4]` every
 *     iteration (FULL dword).  Return value = winner player (0 if none);
 *     NO out pointer, NO *out store, NO collect/id arm at all (arg1 is
 *     never read — v37 tail is the RTO draw WITHOUT the collect tail;
 *     every gate checked from the instruction stream, not copied).
 * Constants verified this unit from raw PE dwords / instruction stream:
 * shifts 3/5/20 @ 0xb1f5d0, best init 0xbf800000, scale 0x2f7ffffe,
 * sign-corr table 0xbacb00, seed msg 0xb6bf54, int3 @ 0x009be5be.
 * =========================================================================== */
enum {
  ISAAC_A9BE530_LIST_BEGIN_OFS = 0,        /* players vector begin off */
  ISAAC_A9BE530_LIST_END_OFS = 4,          /* players vector end off */
  ISAAC_A9BE530_LIST_STRIDE = 4,
  ISAAC_A9BE530_SLOT_FLAG_OFS = 0x2c,      /* dword == 0 gate */
  ISAAC_A9BE530_FLAG_202C_OFS = 0x202c,    /* LOW byte == 0 gate */
  ISAAC_A9BE530_FLAG_20A9_OFS = 0x20a9,    /* LOW byte == 0 gate */
  ISAAC_A9BE530_CHARGE_OFS = 0x17e0,       /* SIGNED >= 3 gate */
  ISAAC_A9BE530_CHARGE_MIN = 3,
  ISAAC_A9BE530_SEED_ASSERT_MSG_VA = 0x00b6bf54, /* "RNG Seed is zero!\n" */
  ISAAC_A9BE530_LOG_LEVEL = 0x10,          /* ASSERT (== A112C0_LEVEL_ASSERT) */
  ISAAC_A9BE530_ASSERT_TRAP_VA = 0x009be5be, /* int3 after the seed assert */
  ISAAC_A9BE530_HOST_LOG_VA = 0x00a112c0,
  ISAAC_A9BE530_RNG_SHIFT_TABLE_VA = 0x00b1f5d0, /* dwords 3 / 5; 20 @ +8 */
  ISAAC_A9BE530_RNG_SHIFT1 = 3,
  ISAAC_A9BE530_RNG_SHIFT2 = 5,
  ISAAC_A9BE530_RNG_SHIFT3 = 20,
  ISAAC_A9BE530_BEST_INIT_BITS = 0xbf800000, /* -1.0f @ 0xbaad50 (verified) */
  ISAAC_A9BE530_SCALE_BITS = 0x2f7ffffe,   /* @ 0xba9ff0 (verified dword) */
  ISAAC_A9BE530_SIGN_CORR_TABLE_VA = 0x00bacb00, /* f64 0.0 / 4294967296.0 */
  ISAAC_A9BE530_VA = 0x009be530,
  ISAAC_A9BE530_FIRST_RET_VA = 0x009be62d, /* single ret (no early arms) */
  ISAAC_A9BE530_RET_VA = 0x009be62d,       /* terminal ret 8 */
  ISAAC_A9BE530_INT3_VA = 0x009be5be,
  ISAAC_A9BE530_BODY_BYTES = 0x8e,         /* 142; through int3 */
  ISAAC_A9BE530_SITES = 7,                 /* full rel32 E8 census (verified) */
  ISAAC_A9BE530_NEXT_VA = 0x009be630       /* next RCO-family sibling (23 E8s) */
};

/* ===========================================================================
 * ABI v38 -- 0x009be630, address-stable slot-match sibling (NO exact ZHL;
 * 23-site rel32 E8 census 0x60d1c6 0x65105b 0x6de9d5 0x6deaee 0x6deaff
 * 0x6e0cdc 0x6e13fb 0x7113ec 0x7304a1 0x7304ae 0x73050f 0x730ad1 0x73adbe
 * 0x73add3 0x74a67f 0x7fb3b4 0x815285 0x815297 0x815547 0x8166ab 0x9a448a
 * 0x9a4499 0x9a44b3, all `add esi,0x1baa8 / push <slot> / mov ecx,esi /
 * call` -> this = g_Game + 0x1baa8 (same container as v36/v37); arg1
 * BY-VALUE needle slot; ret 4, TWO epilogues (not-found @ 0x009be664,
 * found @ 0x009be66b), int3 pad @ 0x009be66e).
 *
 * PE walk (0x009be630 … ret 4 @ 0x009be66b): PURE linear search over
 * players [this+0..this+4) stride 4 -- NO xorshift / float / seed assert
 * at all (the v37 draw laws do NOT carry over; re-derived here).
 *   eax = [this+0] begin; ecx = [this+4] end; BOTH captured ONCE before
 *     the loop (0x009be633 / 0x009be635) -- the walk bound is NOT re-read
 *     per iteration (unlike v37 which re-read [this+4] each iteration).
 *   cmp eax,ecx / je not-found (0x009be639/63b): begin==end -> return 0,
 *     and arg1 is NEVER read on the empty path (esi loaded @ 0x009be63d
 *     AFTER the je).
 *   per candidate (edx = *iter = player ptr, 0x009be640):
 *     cmp dword [p+0x2c],0 / jne skip        -- FULL dword == 0
 *     cmp byte  [p+0x20a9],0 / jne skip      -- LOW byte == 0
 *     cmp dword [p+0x13c0],esi / je found    -- FULL dword == arg1
 *     (NOTE: only TWO gates + the slot match; the v37 0x202c byte gate
 *     and the charge gate are NOT present in this sibling.)
 *   add eax,4 (0x009be659); cmp eax,ecx / jne loop (0x009be65c/65e).
 *   found -> mov eax,edx (0x009be667) return player ptr; else xor eax,eax
 *     (0x009be660) return 0.  No out pointer, no stores.
 * Offsets from THIS instruction stream (0x2c / 0x20a9 / 0x13c0); caller
 * 0x009a4460 cmp [p+0x13c0],0x13 confirms 0x13c0 is a per-player slot id
 * (searched with needle values 0x12 / 0x24 / 0x19 there).  No new
 * .rdata/.data dwords needed (no float/draw machinery in this body).
 * =========================================================================== */
enum {
  ISAAC_A9BE630_LIST_BEGIN_OFS = 0,        /* players vector begin off */
  ISAAC_A9BE630_LIST_END_OFS = 4,          /* players vector end off */
  ISAAC_A9BE630_LIST_STRIDE = 4,
  ISAAC_A9BE630_SLOT_FLAG_OFS = 0x2c,      /* dword == 0 gate */
  ISAAC_A9BE630_FLAG_20A9_OFS = 0x20a9,    /* LOW byte == 0 gate */
  ISAAC_A9BE630_SLOT_VALUE_OFS = 0x13c0,   /* dword == needle gate */
  ISAAC_A9BE630_VA = 0x009be630,
  ISAAC_A9BE630_FIRST_RET_VA = 0x009be664, /* not-found epilogue */
  ISAAC_A9BE630_RET_VA = 0x009be66b,       /* terminal ret 4 (found arm) */
  ISAAC_A9BE630_INT3_VA = 0x009be66e,      /* int3 pad after the body */
  ISAAC_A9BE630_BODY_BYTES = 0x3e,         /* 62; through int3 pad */
  ISAAC_A9BE630_SITES = 23,                /* full rel32 E8 census (verified) */
  ISAAC_A9BE630_NEXT_VA = 0x009be670       /* next sibling (3 E8s, LIVE) */
};

/* ===========================================================================
 * ABI v39 -- 0x009be670, address-stable PURE slot-0x19 predicate (no exact
 * ZHL expected; 3-site rel32 E8 census 0x6df8ba 0x6e07c4 0x9a44a7, all
 * `push ecx (dummy) / mov ecx,esi / call` -> this = g_Game + 0x1baa8;
 * body NEVER reads arg1 (no ebp frame; ret 4 pops the caller's dummy);
 * ret 4, TWO epilogues @ 0x009be6a3 (TRUE arm) / 0x009be6a8 (FALSE arm),
 * int3 pad @ 0x009be6ab).
 *
 * PE walk (0x009be670 … ret 4 @ 0x009be6a8): PURE predicate over players
 * [this+0..this+4) stride 4 -- return 0 iff a CHECKABLE candidate's slot
 * dword [player+0x13c0] != 0x19; else return 1.  The EMPTY list returns 1
 * (je @ 0x009be677 -> mov al,1) -- the TRUE arm, inverse of the v38
 * not-found 0.  The needle 0x19 is an IMMEDIATE in the instruction stream
 * (cmp dword [edx+0x13c0],0x19 @ 0x009be691), NOT a stack arg.
 *   eax = [this+0] begin; ecx = [this+4] end; BOTH captured ONCE pre-loop
 *     (0x009be670 / 0x009be672) -- bound NOT re-read per iteration
 *     (differs from v37/v39's 0x9be6b0 which re-reads [this+4]).
 *   cmp eax,ecx / je TRUE-arm (0x009be675/677): begin==end -> return 1.
 *   per candidate (edx = *iter = player ptr, 0x009be680):
 *     cmp dword [p+0x2c],0 / jne skip        -- FULL dword == 0
 *     cmp byte  [p+0x20a9],0 / jne skip      -- LOW byte == 0
 *     cmp dword [p+0x13c0],0x19 / jne FALSE  -- FULL dword == 0x19
 *       (== 0x19 falls through and CONTINUES; != 0x19 returns 0)
 *   add eax,4 (0x009be69a); cmp eax,ecx / jne loop (0x009be69d/69f).
 *   TRUE -> mov al,1 (0x009be6a1); FALSE -> xor al,al (0x009be6a6).
 * Offsets from THIS instruction stream (0x2c / 0x20a9 / 0x13c0): the SAME
 * slot-flag + flag20a9 gates and slot-value field as v38's 0x9be630, but
 * the slot compare is against the IMMEDIATE 0x19 (no needle arg).  No new
 * .rdata/.data dwords needed (no float/draw machinery in this body).
 * =========================================================================== */
enum {
  ISAAC_A9BE670_LIST_BEGIN_OFS = 0,        /* players vector begin off */
  ISAAC_A9BE670_LIST_END_OFS = 4,          /* players vector end off */
  ISAAC_A9BE670_LIST_STRIDE = 4,
  ISAAC_A9BE670_SLOT_FLAG_OFS = 0x2c,      /* dword == 0 gate */
  ISAAC_A9BE670_FLAG_20A9_OFS = 0x20a9,    /* LOW byte == 0 gate */
  ISAAC_A9BE670_SLOT_VALUE_OFS = 0x13c0,   /* dword == 0x19 gate */
  ISAAC_A9BE670_SLOT_NEEDLE = 0x19,        /* IMMEDIATE needle (not an arg) */
  ISAAC_A9BE670_VA = 0x009be670,
  ISAAC_A9BE670_FIRST_RET_VA = 0x009be6a3, /* TRUE arm (empty OR exhausted) */
  ISAAC_A9BE670_RET_VA = 0x009be6a8,       /* terminal ret 4 (FALSE arm) */
  ISAAC_A9BE670_INT3_VA = 0x009be6ab,      /* int3 pad after the body */
  ISAAC_A9BE670_BODY_BYTES = 0x3b,         /* 59; through int3 pad */
  ISAAC_A9BE670_SITES = 3,                 /* full rel32 E8 census (verified) */
  ISAAC_A9BE670_NEXT_VA = 0x009be6b0       /* next sibling (41 E8s, LIVE) */
};

/* ===========================================================================
 * ABI v39 -- 0x009be6b0, address-stable owner/quality player select (no
 * exact ZHL; 41-site rel32 E8 census verified this unit; caller 0x004e7b7d
 * `mov ecx,[0xc71678] / push 0x97 / lea ecx,[ecx+0x1baa8] / call` -> this =
 * g_Game + 0x1baa8, arg1 BY-VALUE needle; result used as player ptr;
 * ret 4, TWO epilogues @ 0x009be73c (early accept) / 0x009be747 (winner),
 * int3 pad @ 0x009be74a).
 *
 * PE walk (0x009be6b0 … ret 4 @ 0x009be747): NARROWED — pure walk +
 * path-selection + arg values + accept/winner CF AROUND two host calls:
 *   0x7cb6e0 (status; thiscall ecx=player, arg1=needle BY VALUE) and
 *   0x7706e0 (query; ecx=player, cdecl args 0x1b7 / 0; HUD-family, body
 *   stays host residual — do-not-reopen list).
 *   Winner edi init 0 (xor @ 0x009be6c0); esi = [this+0] begin @ 0x6c2;
 *   loop @ 0x009be6c4 top: cmp esi,[this+4] / je epilogue-A — the bound
 *     is RE-READ each iteration (eax = this RELOADED from the local
 *     [esp+0xc] @ 0x009be72b; differs from v38's captured bound, matches
 *     v37's re-read).
 *   per candidate (ecx = *iter = player, edx = [ebp+8] = needle):
 *     eax = [p+0x2ef8] (dword); test eax,eax / je pathC; cmp eax,edx /
 *     jne pathC  ->  path C iff field==0 OR field!=needle.
 *     else byte [p+0x2ef0] (LOW byte) != 0 ? path A : path B.
 *     path A (0x9be6e5): bl FORCED 1 (mov bl,1 @ 0x6ec); al = query
 *       (0x7706e0(player, 0x1b7, 0)); jmp merge_accept (skip setg).
 *     path B (0x9be6f5): status = 0x7cb6e0(player, needle); flags from
 *       cmp eax,1; merge: setg bl -> bl = (int32)status > 1 (SIGNED).
 *     path C (0x9be700): status = 0x7cb6e0(player, needle); flags from
 *       test eax,eax; merge: setg bl -> bl = (int32)status > 0 (SIGNED).
 *     merge (0x9be708): ecx = player RELOADED (callee-clobbered), setg bl,
 *       then al = query (0x7706e0(player, 0x1b7, 0)).
 *     merge_accept (0x9be719): test bl,bl / je skip-store; then test
 *       al,al / jne epilogue-B: bl != 0 && LOW byte(query result) != 0
 *       -> RETURN player immediately (mov eax,[esi] @ 0x9be734).
 *     else winner store (0x9be721..29): if winner==0 && bl!=0 ->
 *       winner = player (FIRST bl-set candidate).
 *     walk: this reloaded @ 0x9be72b; add esi,4 @ 0x9be72f; jmp top.
 *   epilogue A (0x9be73f): return winner (0 if none was stored).
 * Offsets/consts (this instruction stream): field 0x2ef8, flag byte
 * 0x2ef0, list begin/end/stride 0/4/4, query args 0x1b7 / 0, host
 * status 0x7cb6e0 / query 0x7706e0, needle = arg1.  No new .rdata/.data
 * dwords.  The only store is the LOCAL [esp+0xc] save of this.
 * =========================================================================== */
enum {
  ISAAC_A9BE6B0_LIST_BEGIN_OFS = 0,        /* players vector begin off */
  ISAAC_A9BE6B0_LIST_END_OFS = 4,          /* players vector end off */
  ISAAC_A9BE6B0_LIST_STRIDE = 4,
  ISAAC_A9BE6B0_FIELD_2EF8_OFS = 0x2ef8,   /* dword owner field (needle match) */
  ISAAC_A9BE6B0_FLAG_2EF0_OFS = 0x2ef0,    /* LOW byte flag (path A select) */
  ISAAC_A9BE6B0_QUERY_ARG1 = 0x1b7,        /* host 0x7706e0 cdecl arg1 */
  ISAAC_A9BE6B0_QUERY_ARG2 = 0x0,          /* host 0x7706e0 cdecl arg2 */
  ISAAC_A9BE6B0_STATUS_CALL_VA = 0x007cb6e0, /* host status thiscall */
  ISAAC_A9BE6B0_QUERY_CALL_VA = 0x007706e0,  /* host query thiscall+cdecl */
  ISAAC_A9BE6B0_VA = 0x009be6b0,
  ISAAC_A9BE6B0_FIRST_RET_VA = 0x009be73c, /* early accept epilogue */
  ISAAC_A9BE6B0_RET_VA = 0x009be747,       /* terminal ret 4 (winner) */
  ISAAC_A9BE6B0_INT3_VA = 0x009be74a,      /* int3 pad after the body */
  ISAAC_A9BE6B0_BODY_BYTES = 0x9a,         /* 154; through int3 pad */
  ISAAC_A9BE6B0_SITES = 41,                /* full rel32 E8 census (verified) */
  ISAAC_A9BE6B0_NEXT_VA = 0x009be750       /* next sibling (3 E8s, LIVE) */
};

/* ===========================================================================
 * ABI v40 -- 0x009be750, GetNumCollectibles (EXACT ZHL 19 B:
 * `__thiscall int PlayerManager::GetNumCollectibles(CollectibleType type);`).
 * this = g_Game + 0x1baa8, arg1 = type needle, ret 4.  NARROWED: pure walk +
 * twin gate + 32-bit wrap sum around TWO host leaves -- 0x0072fd10
 * (ItemConfig::GetCollectible, exact ZHL 13 B -- HUD do-not-reopen) twin-get
 * once pre-walk, and 0x00770ca0 (Entity_Player::GetCollectibleNum, exact
 * ZHL 16 B) per player + per twin.
 *
 * PE walk (0x009be750 .. ret 4 @ 0x009be7e7, int3 @ 0x009be7ea):
 *   flag13 = (twin = 0x72fd10([0xc7169c]+0x2a404, type)) != 0
 *            && bit31([twin+0xb8])            (0x009be778..0x009be790)
 *   per candidate (player = *iter, 0x009be7a0):
 *     slot dword [p+0x2c] == 0                (0x009be7a2, FULL dword)
 *     sum += 0x770ca0(player, type, 0)        (0x009be7af..0x009be7b4,
 *                                              add ebx,eax -- 32-bit wrap)
 *     if flag13 != 0 && [p+0x1e6c] != 0:      (0x009be7b6..0x009be7c5)
 *       sum += 0x770ca0([p+0x1e6c], type, 0)  (0x009be7c7..0x009be7d1)
 *     iter += 4; this re-read -> [this+4] cmp (0x009be7d3..0x009be7dd)
 *   return sum (mov eax,ebx @ 0x009be7e1).
 * =========================================================================== */
enum {
  ISAAC_GNC9BE750_LIST_BEGIN_OFS = 0,       /* players vector begin off */
  ISAAC_GNC9BE750_LIST_END_OFS = 4,         /* players vector end off */
  ISAAC_GNC9BE750_LIST_STRIDE = 4,
  ISAAC_GNC9BE750_SLOT_FLAG_OFS = 0x2c,     /* dword == 0 gate */
  ISAAC_GNC9BE750_TWIN_PTR_OFS = 0x1e6c,    /* twin player ptr per candidate */
  ISAAC_GNC9BE750_TWIN_FLAGS_OFS = 0xb8,    /* item flags; bit31 = twin tag */
  ISAAC_GNC9BE750_TWIN_BIT = 0x80000000,    /* twin tag bit */
  ISAAC_GNC9BE750_MANAGER_GLOBAL_VA = 0x00c7169c, /* twin container base */
  ISAAC_GNC9BE750_GAME_GLOBAL_VA = 0x00c71678,    /* g_Game */
  ISAAC_GNC9BE750_RECEIVER_OFS = 0x1baa8,   /* this = g_Game + 0x1baa8 */
  ISAAC_GNC9BE750_TWIN_CONTAINER_OFS = 0x2a404, /* this for host 0x72fd10 */
  ISAAC_GNC9BE750_HOST_TWIN_GET_VA = 0x0072fd10, /* ItemConfig::GetCollectible */
  ISAAC_GNC9BE750_HOST_COUNT_VA = 0x00770ca0,    /* Entity_Player::GetCollectibleNum */
  ISAAC_GNC9BE750_VA = 0x009be750,
  ISAAC_GNC9BE750_RET_VA = 0x009be7e7,      /* terminal ret 4 */
  ISAAC_GNC9BE750_INT3_VA = 0x009be7ea,     /* int3 pad after the body */
  ISAAC_GNC9BE750_BODY_BYTES = 0x9a,        /* 154; through int3 pad */
  ISAAC_GNC9BE750_SITES = 3,                /* full rel32 E8 census (verified) */
  ISAAC_GNC9BE750_SITE_VA = 0x007f9332,     /* verified caller (needle 0x33) */
  ISAAC_GNC9BE750_NEXT_VA = 0x009be7f0      /* next sibling (2 E8s, LIVE, PURE) */
};

/* ===========================================================================
 * ABI v41 -- 0x009be7f0, HasTemporaryEffect (EXACT ZHL 8-B prologue pattern
 * `558bec8b11568b71`:
 * `__thiscall bool PlayerManager::HasTemporaryEffect(ItemConfig_Item *item);`).
 * this = PlayerManager container (g_Game + 0x1baa8 at callers), arg1 = item
 * needle, ret 4.  PURE: 0 E8 / 0 stores / 0 indirect in the body.  Per
 * candidate: slot dword [p+0x2c]==0 AND byte [p+0x1519]==0, then the
 * temp-effect vector [p+0x150c .. p+0x1510) (stride 0x10) is scanned for
 * [entry]==needle (FULL dword); the first hit returns 1 immediately.
 * Empty list -> NOT-FOUND 0 (the needle is never read).  List end CAPTURED
 * ONCE (esi @ 0x009be7f6); vec end captured per candidate.  Two epilogues.
 *
 * PE walk (0x009be7f0 .. ret 4 @ 0x009be841, int3 @ 0x009be844):
 *   edx = [this+0] begin; esi = [this+4] end (captured)
 *   begin == end -> 0x9be834 not-found (xor al,al, ret @ 0x009be839)
 *   edi = arg1 needle (read once, only if non-empty)
 *   per candidate (player = *edx, 0x009be801):
 *     dword [p+0x2c] == 0 else skip       (0x009be803)
 *     byte  [p+0x1519] == 0 else skip     (0x009be809)
 *     eax = [p+0x150c] vec begin; ecx = [p+0x1510] vec end
 *     begin == end -> skip                (0x009be81e)
 *     while eax != vec end:               (0x009be822)
 *       [eax] == needle -> 0x9be83c found (mov al,1, ret @ 0x009be841)
 *       eax += 0x10
 *     edx += 4; edx != esi -> next player (0x009be82d)
 * ---- */
enum {
  ISAAC_HTE9BE7F0_LIST_BEGIN_OFS = 0,       /* players vector begin off */
  ISAAC_HTE9BE7F0_LIST_END_OFS = 4,         /* players vector end off */
  ISAAC_HTE9BE7F0_LIST_STRIDE = 4,
  ISAAC_HTE9BE7F0_SLOT_FLAG_OFS = 0x2c,     /* dword == 0 gate */
  ISAAC_HTE9BE7F0_FLAG1519_OFS = 0x1519,    /* LOW byte == 0 gate */
  ISAAC_HTE9BE7F0_VEC_BEGIN_OFS = 0x150c,   /* temp-effect vector begin */
  ISAAC_HTE9BE7F0_VEC_END_OFS = 0x1510,     /* temp-effect vector end */
  ISAAC_HTE9BE7F0_VEC_STRIDE = 0x10,        /* entry stride 16 */
  ISAAC_HTE9BE7F0_VA = 0x009be7f0,
  ISAAC_HTE9BE7F0_FIRST_RET_VA = 0x009be839, /* first epilogue ret 4 (not-found) */
  ISAAC_HTE9BE7F0_RET_VA = 0x009be841,      /* last epilogue ret 4 (found) */
  ISAAC_HTE9BE7F0_INT3_VA = 0x009be844,     /* int3 pad after the body */
  ISAAC_HTE9BE7F0_BODY_BYTES = 0x54,        /* 84; through int3 pad */
  ISAAC_HTE9BE7F0_SITES = 2,                /* full rel32 E8 census (verified) */
  ISAAC_HTE9BE7F0_SITE_VA = 0x006bdcb5,     /* verified caller */
  ISAAC_HTE9BE7F0_SITE2_VA = 0x007fe7ee,    /* verified caller */
  ISAAC_HTE9BE7F0_NEXT_VA = 0x009be850      /* next sibling (2 E8s, NARROWED) */
};

/* ===========================================================================
 * ABI v42 -- 0x009be850, address-stable slot-accumulator walk (NO exact ZHL;
 * family precedent for no-ZHL siblings: a9be530/a9be630/a9be670/a9be6b0).
 * __thiscall ret 4; arg1 = 0x70 pushed by the caller but NEVER read in the
 * body (dead arg, same class as v39 9be670).  this = PlayerManager container
 * (g_Game + 0x1baa8 at the sole caller 0x00772bcf).  NARROWED: 2 host calls
 * to 0x930220 (thiscall find-or-append accumulator, ret 0xc) stay host; ALL
 * gates + full arg-prep (both 16-byte buf constructions, arg pair (1,1),
 * both host receivers) are pure.  Per outer candidate (player = [begin+idx*4],
 * stride 4):  host1 gate = SIGNED ((vecA_end - vecA_begin) & ~3) > 0x1c0 &&
 * slot = [vecA_begin+0x1c0] != 0  (vecA = [[0xc7169c]+0x2a41c ..
 * +0x2a420]) -> host 0x930220(player+0x1508, &buf16{slot,0,[slot+0x78],0},
 * 1, 1); twin = [player+0x1e6c]; if twin != 0 -> if byte [twin+0x1519]==0
 * AND [twin+0x150c..+0x1510) non-empty -> scan stride 0x10 for marker
 * [entry+0]==0 && [entry+4]==0x70 -> SKIP host2; else host2 gate (same
 * predicate, vecA re-read) -> host 0x930220(twin+0x1508, &buf16, 1, 1).
 * Count RE-DERIVED per iteration (end/begin re-read @ 0x009be966/96a);
 * UNSIGNED index compare (jb @ 0x009be973).  Single ret 4 epilogue (void).
 *
 * PE walk (0x009be850 .. ret 4 @ 0x009be97f, int3 @ 0x009be982):
 *   eax = [this+4] end; edx = [this+0] begin; count = SAR32(end-begin,2)
 *   count == 0 -> epilogue (je @ 0x009be86c)
 *   per candidate (ecx = player = [edx+esi*4], esi = index from 0):
 *     vecA_b = [[0xc7169c]+0x2a41c]; vecA_e = [[0xc7169c]+0x2a420]
 *     ((vecA_e - vecA_b) & ~3) > 0x1c0 SIGNED (jle skip)      (0x009be88c..896)
 *       slot = [vecA_b + 0x1c0]; slot != 0 (je skip)          (0x009be898..8a0)
 *       buf16 @ loc+0x10 = {slot, 0, [slot+0x78], 0}; arg2=1, arg3=1
 *       HOST 0x930220(player+0x1508, &buf16, 1, 1)            (0x009be8c6)
 *     edx = [this+0] RE-READ; player RE-FETCHED               (0x009be8cb/cd)
 *     twin = [player + 0x1e6c]; twin == 0 -> loop tail        (0x009be8d0..d8)
 *     ebx = twin + 0x1508 (host2 this, loaded unconditionally)
 *     byte [twin+0x1519] != 0 -> skip scan to host2 gate      (0x009be8de..eb)
 *     tvec_b = [twin+0x150c]; tvec_e = [twin+0x1510];
 *       begin == end -> skip scan to host2 gate               (0x009be8f9..fb)
 *       scan stride 0x10: entry = [iter]; [entry+0]==0 &&
 *         [entry+4]==0x70 -> loop TAIL (skip host2)           (0x009be900..90b)
 *         iter += 0x10; iter != tvec_e -> scan                 (0x009be90d..912)
 *     host2 gate: IDENTICAL predicate + slot on vecA re-read  (0x009be914..939)
 *       buf2 16B @ loc+0x20 = {slot, 0, [slot+0x78], 0}
 *       HOST 0x930220(twin+0x1508, &buf2, 1, 1)               (0x009be961)
 *     end RE-READ; esi++; begin RE-READ; count RE-DERIVED; esi < count
 *       UNSIGNED (jb @ 0x009be973) -> next candidate           (0x009be966..973)
 * ---- */
enum {
  ISAAC_A9BE850_LIST_BEGIN_OFS = 0,        /* players vector begin off */
  ISAAC_A9BE850_LIST_END_OFS = 4,          /* players vector end off */
  ISAAC_A9BE850_LIST_STRIDE = 4,
  ISAAC_A9BE850_MANAGER_GLOBAL_VA = 0x00c7169c, /* ptr -> vec A base obj */
  ISAAC_A9BE850_VEC_A_BEGIN_OFS = 0x2a41c, /* vec A begin (accumulator vec) */
  ISAAC_A9BE850_VEC_A_END_OFS = 0x2a420,   /* vec A end */
  ISAAC_A9BE850_VEC_A_SLOT_OFS = 0x1c0,    /* slot = [vecA_begin+0x1c0] */
  ISAAC_A9BE850_HOST_GATE_THRESHOLD = 0x1c0, /* SIGNED ((e-b)&~3) > 0x1c0 */
  ISAAC_A9BE850_HOST_GATE_MASK = 0xfffffffc, /* & ~3 */
  ISAAC_A9BE850_SLOT_FIELD_OFS = 0x78,     /* buf16[2] = [slot+0x78] */
  ISAAC_A9BE850_HOST_RECEIVER_OFS = 0x1508, /* host this = X + 0x1508 */
  ISAAC_A9BE850_TWIN_FIELD_OFS = 0x1e6c,   /* twin = [player+0x1e6c] */
  ISAAC_A9BE850_FLAG1519_OFS = 0x1519,     /* byte gate (scan allowed) */
  ISAAC_A9BE850_TWIN_VEC_BEGIN_OFS = 0x150c, /* twin marker vector begin */
  ISAAC_A9BE850_TWIN_VEC_END_OFS = 0x1510, /* twin marker vector end */
  ISAAC_A9BE850_TWIN_VEC_STRIDE = 0x10,    /* marker entry stride 16 */
  ISAAC_A9BE850_MARKER_FIELD0_VALUE = 0,   /* [entry+0] == 0 */
  ISAAC_A9BE850_MARKER_FIELD4_VALUE = 0x70, /* [entry+4] == 0x70 */
  ISAAC_A9BE850_HOST_VA = 0x00930220,      /* host accumulator (ret 0xc) */
  ISAAC_A9BE850_HOST_ARG2 = 1,             /* arg2 pushed imm */
  ISAAC_A9BE850_HOST_ARG3 = 1,             /* arg3 pushed imm */
  ISAAC_A9BE850_GAME_GLOBAL_VA = 0x00c71678, /* caller receiver base */
  ISAAC_A9BE850_RECEIVER_OFS = 0x1baa8,    /* this = g_Game + 0x1baa8 */
  ISAAC_A9BE850_CALLER_ARG1 = 0x70,        /* pushed by caller; DEAD */
  ISAAC_A9BE850_VA = 0x009be850,
  ISAAC_A9BE850_RET_VA = 0x009be97f,       /* single epilogue ret 4 (void) */
  ISAAC_A9BE850_INT3_VA = 0x009be982,      /* int3 pad after the body */
  ISAAC_A9BE850_BODY_BYTES = 0x132,        /* 306; through int3 pad */
  ISAAC_A9BE850_SITES = 1,                 /* full rel32 E8 census (verified) */
  ISAAC_A9BE850_SITE_VA = 0x00772bcf,      /* verified caller */
  ISAAC_A9BE850_NEXT_VA = 0x009be990       /* next sibling (0 E8s, PURE) */
};

/* ===========================================================================
 * ABI v43 -- 0x009be990, address-stable PURE bool scan (NO exact ZHL; family
 * precedent for no-ZHL siblings: a9be530/a9be630/a9be670/a9be6b0/a9be850).
 * __thiscall ret 0; NO stack args.  this = PlayerManager container
 * (g_Game + 0x1baa8 at BOTH live callers 0x004531b6 / 0x0049118a — verified
 * `add ecx,0x1baa8` / `lea ecx,[ecx+0x1baa8]` immediately before the call).
 * PURE-complete: 0 E8 / 0 indirect / 0 mem-stores.  Returns bool in AL:
 * FOUND al=1 / NOT-FOUND al=0; both consumers test only AL
 * (0x004531b6 stores [ebp-0x91],al; 0x0049118a test al,al / jne found).
 *
 * PE walk (0x009be990 .. 2 rets 0x009be9ba/0x009be9bd, int3 @ 0x009be9be):
 *   eax = [this+0] begin; ecx = [this+4] end (BOTH captured ONCE at entry)
 *   begin == end -> NOT-FOUND (je @ 0x009be997 -> xor al,al; ret)
 *   per candidate (edx = player = [iter], iter stride 4 from begin):
 *     code = [player + 0x3fc] FULL dword (mov edx,[edx+0x3fc] @ 0x009be9a2)
 *     code == 0  -> ADVANCE (test edx,edx / je @ 0x009be9a8..aa)
 *     code == 3  -> ADVANCE (cmp edx,3 / jne-not-taken @ 0x009be9ac..af)
 *     otherwise  -> FOUND (jne -> mov al,1; ret @ 0x009be9bb..bd)
 *     iter += 4 (32-bit wrap); iter != end -> loop (jne @ 0x009be9b6;
 *     end held in ecx, NEVER re-read — NOT the a9be850 re-derive style)
 * Loop-exhausted -> NOT-FOUND al=0.
 * ---- */
enum {
  ISAAC_A9BE990_LIST_BEGIN_OFS = 0,        /* players vector begin off */
  ISAAC_A9BE990_LIST_END_OFS = 4,          /* players vector end off */
  ISAAC_A9BE990_LIST_STRIDE = 4,           /* slot dword; add eax,4 */
  ISAAC_A9BE990_SLOT_FIELD_OFS = 0x3fc,    /* code = [player+0x3fc] FULL dword */
  ISAAC_A9BE990_SKIP_CODE_ZERO = 0,        /* test/je advance */
  ISAAC_A9BE990_SKIP_CODE_THREE = 3,       /* cmp/jne-not-taken advance */
  ISAAC_A9BE990_MANAGER_GLOBAL_VA = 0x00c71678, /* g_Game (caller base) */
  ISAAC_A9BE990_RECEIVER_OFS = 0x1baa8,    /* this = g_Game + 0x1baa8 */
  ISAAC_A9BE990_VA = 0x009be990,
  ISAAC_A9BE990_FIRST_RET_VA = 0x009be9ba, /* NOT-FOUND epilogue ret */
  ISAAC_A9BE990_RET_VA = 0x009be9bd,       /* FOUND epilogue ret */
  ISAAC_A9BE990_INT3_VA = 0x009be9be,      /* int3 pad after the body */
  ISAAC_A9BE990_BODY_BYTES = 0x2e,         /* 46; through int3 pad */
  ISAAC_A9BE990_SITES = 2,                 /* full rel32 E8 census (verified) */
  ISAAC_A9BE990_SITE_VA = 0x004531b6,      /* verified caller */
  ISAAC_A9BE990_SITE2_VA = 0x0049118a,     /* verified caller */
  ISAAC_A9BE990_NEXT_VA = 0x009be9c0       /* next sibling (0 E8s, PURE) */
};

/* ===========================================================================
 * ABI v44 -- 0x009be9c0, address-stable PURE bool scan (NO exact ZHL; family
 * precedent a9be530/a9be630/a9be670/a9be6b0/a9be850/a9be990).
 * __thiscall ret 0; NO stack args.  this = PlayerManager container
 * (g_Game + 0x1baa8 — verified at the SOLE live caller 0x006c83b3:
 * `mov ecx,[0xc71678]` / `call 0x417860` (getter = `lea eax,[ecx+0x1baa8];
 * ret`) / `mov ecx,eax` / `call 0x9be9c0` / `test al,al` / `jne 0x6c8453`).
 * PURE-complete: 0 E8 / 0 indirect / 0 mem-stores.  Returns bool in AL:
 * FOUND al=1 (ret 0x009bea00) / NOT-FOUND al=0 (ret 0x009be9fd); the sole
 * consumer tests only AL (test al,al / jne @ 0x006c83b8..ba).
 *
 * PE walk (0x009be9c0 .. 2 rets 0x009be9fd/0x009bea00, int3 @ 0x009bea01):
 *   eax = [this+0] begin; ecx = [this+4] end (BOTH captured ONCE at entry,
 *   end NEVER re-read per iteration — matches a9be990, not a9be850)
 *   begin == end -> NOT-FOUND (je @ 0x009be9c7 -> xor al,al; ret)
 *   per candidate (edx = player = [iter], iter stride 4 from begin):
 *     byte [player + 0x20a9] != 0 -> ADVANCE (cmp byte / jne @
 *       0x009be9d2..d9)
 *     code = [player + 0x184] FULL dword (mov edx,[edx+0x184] @ 0x009be9db)
 *     code == 0 -> FOUND (test/je @ 0x009be9e1..e3)
 *     code == 3 -> FOUND (cmp/je @ 0x009be9e5..e8)
 *     code == 1 -> FOUND (cmp/je @ 0x009be9ea..ed)
 *     code == 2 -> FOUND (cmp/je @ 0x009be9ef..f2)
 *     i.e. FOUND iff FULL dword code IN {0,1,2,3} (every arm je-to-FOUND;
 *     the test order 0,3,1,2 is irrelevant to the outcome); any other
 *     value -> ADVANCE
 *     iter += 4 (32-bit wrap); iter != end -> loop (jne @ 0x009be9f9; end
 *     held in ecx, NEVER re-read)
 *   Loop-exhausted -> NOT-FOUND al=0.
 * ---- */
enum {
  ISAAC_A9BE9C0_LIST_BEGIN_OFS = 0,        /* players vector begin off */
  ISAAC_A9BE9C0_LIST_END_OFS = 4,          /* players vector end off */
  ISAAC_A9BE9C0_LIST_STRIDE = 4,           /* slot dword; add eax,4 */
  ISAAC_A9BE9C0_FLAG20A9_OFS = 0x20a9,     /* byte gate [player+0x20a9] */
  ISAAC_A9BE9C0_FIELD184_OFS = 0x184,      /* code = [player+0x184] FULL dword */
  ISAAC_A9BE9C0_FOUND_CODE_ZERO = 0,       /* test/je FOUND */
  ISAAC_A9BE9C0_FOUND_CODE_ONE = 1,        /* cmp/je FOUND */
  ISAAC_A9BE9C0_FOUND_CODE_TWO = 2,        /* cmp/je FOUND */
  ISAAC_A9BE9C0_FOUND_CODE_THREE = 3,      /* cmp/je FOUND */
  ISAAC_A9BE9C0_MANAGER_GLOBAL_VA = 0x00c71678, /* g_Game (caller base) */
  ISAAC_A9BE9C0_RECEIVER_OFS = 0x1baa8,    /* this = g_Game + 0x1baa8 */
  ISAAC_A9BE9C0_RECEIVER_GETTER_VA = 0x00417860, /* lea eax,[ecx+0x1baa8]; ret */
  ISAAC_A9BE9C0_VA = 0x009be9c0,
  ISAAC_A9BE9C0_FIRST_RET_VA = 0x009be9fd, /* NOT-FOUND epilogue ret */
  ISAAC_A9BE9C0_RET_VA = 0x009bea00,       /* FOUND epilogue ret */
  ISAAC_A9BE9C0_INT3_VA = 0x009bea01,      /* int3 pad after the body */
  ISAAC_A9BE9C0_BODY_BYTES = 0x41,         /* 65; through int3 pad */
  ISAAC_A9BE9C0_SITES = 1,                 /* full rel32 E8 census (verified) */
  ISAAC_A9BE9C0_SITE_VA = 0x006c83b3,      /* verified caller */
  ISAAC_A9BE9C0_NEXT_VA = 0x009bea10       /* next sibling (0 E8s, 1 store) */
};

/* ===========================================================================
 * ABI v45 -- 0x009bea40, address-stable PURE f32-sum walk (NO exact ZHL;
 * family precedent a9be530/a9be630/a9be670/a9be6b0/a9be850/a9be990/
 * a9be9c0).  NOTE: the v44-recorded next frontier 0x009bea10 was landed by
 * the game-update-slice family (ABI v50 (a) `player_flag_410_broadcast`,
 * event `opaque_call_009bea10`); its NARROWED write-loop body is NOT
 * re-opened here — this is the first body after that int3 pad.
 * __thiscall ret 0; NO stack args.  this = g_Game + 0x1baa8 (verified at
 * the 3 live rel32 callers 0x0065ab45 / 0x006c8fdd / 0x007fb912; the first
 * two go through getter 0x00417860 = `lea eax,[ecx+0x1baa8]; ret`, the
 * third does `lea ecx,[esi+0x1baa8]` with esi = g_Game).
 * PURE-complete: 0 E8 / 0 indirect / 0 mem-stores.  Returns f32 in xmm0
 * (single epilogue ret 0x009bea70; consumers cvttss2si / mulss on it).
 *
 * PE walk (0x009bea40 .. ret 0x009bea70, int3 pad @ 0x009bea71):
 *   eax = [this+0] begin; ecx = [this+4] end (BOTH captured ONCE at entry,
 *   end NEVER re-read per iteration — matches a9be990/a9be9c0)
 *   xorps xmm0,xmm0: sum = +0.0f
 *   begin == end -> ret (je @ 0x009bea4a; sum untouched, +0.0f)
 *   per candidate (edx = player = [iter], iter stride 4 from begin):
 *     FULL dword [player+0x2c] != 0 -> ADVANCE (cmp/jne @ 0x009bea52..56)
 *     byte [player+0x20a9] != 0 -> ADVANCE (cmp byte/jne @ 0x009bea58..5f)
 *     sum = addss(sum, f32 [player+0x156c])  (f32 round-to-nearest-even)
 *     iter += 4 (32-bit wrap); iter != end -> loop (jne @ 0x009bea6e; end
 *     held in ecx, NEVER re-read)
 *   Loop-exhausted -> ret sum (xmm0).
 * ---- */
enum {
  ISAAC_A9BEA40_LIST_BEGIN_OFS = 0,        /* players vector begin off */
  ISAAC_A9BEA40_LIST_END_OFS = 4,          /* players vector end off */
  ISAAC_A9BEA40_LIST_STRIDE = 4,           /* slot dword; add eax,4 */
  ISAAC_A9BEA40_SLOT_FLAG_OFS = 0x2c,      /* FULL dword gate [player+0x2c] */
  ISAAC_A9BEA40_FLAG20A9_OFS = 0x20a9,     /* byte gate [player+0x20a9] */
  ISAAC_A9BEA40_FIELD156C_OFS = 0x156c,    /* f32 addend [player+0x156c] */
  ISAAC_A9BEA40_MANAGER_GLOBAL_VA = 0x00c71678, /* g_Game (caller base) */
  ISAAC_A9BEA40_RECEIVER_OFS = 0x1baa8,    /* this = g_Game + 0x1baa8 */
  ISAAC_A9BEA40_RECEIVER_GETTER_VA = 0x00417860, /* lea eax,[ecx+0x1baa8]; ret */
  ISAAC_A9BEA40_VA = 0x009bea40,
  ISAAC_A9BEA40_FIRST_RET_VA = 0x009bea70, /* single epilogue ret */
  ISAAC_A9BEA40_RET_VA = 0x009bea70,       /* single epilogue ret */
  ISAAC_A9BEA40_INT3_VA = 0x009bea71,      /* int3 pad after the body */
  ISAAC_A9BEA40_BODY_BYTES = 0x31,         /* 49; through int3 pad */
  ISAAC_A9BEA40_SITES = 3,                 /* full rel32 E8 census (verified) */
  ISAAC_A9BEA40_SITE0_VA = 0x0065ab45,     /* verified caller */
  ISAAC_A9BEA40_SITE1_VA = 0x006c8fdd,     /* verified caller */
  ISAAC_A9BEA40_SITE2_VA = 0x007fb912,     /* verified caller */
  ISAAC_A9BEA40_NEXT_VA = 0x009bea80       /* next sibling (2 E8s, LIVE; landed ABI v46) */
};

/* ===========================================================================
 * ABI v46 -- 0x009bea80, GetTrinketMultiplier (EXACT ZHL 18 B:
 * `__thiscall int PlayerManager::GetTrinketMultiplier(int TrinketID);`).
 * this = g_Game + 0x1baa8, arg1 = TrinketID BY VALUE (raw, unmasked),
 * ret 4 @ 0x009beb27 (FIRST_RET_VA == RET_VA, single epilogue).  NARROWED:
 * pure walk + slot-flag gates + 32-bit wrap sum around TWO host leaves --
 * 0x007cb6e0 (the HUD-family count resolver, helpers ABI v19
 * `ISAAC_HUD_COUNT_7CB6E0_*`; NOT exact-ZHL; body owned by the
 * hud-post-update family, also pinned by player-manager-update as
 * PM_TD_HOST_VA_COLLECTIBLE_COUNT — stays a typed HOST event, never
 * re-opened here).  0 indirect; 3 mem-stores ALL [esp+N] LOCALS (save
 * this @ [esp+0x10], slot-flag byte @ [esp+0x13] x2) — zero observable
 * stores.  Return = 32-bit sum in eax; consumers convert SIGNED int32
 * (caller 0x007fb905..90f: `movd xmm1,eax; cvtdq2ps xmm1,xmm1`).
 *
 * PE body (0x009bea80 .. ret 4 @ 0x009beb27, int3 pad @ 0x009beb2a):
 *   g = [0xc7169c] (manager global, same as v42 a9be850)
 *   slotArray begin = [g+0x2a410]; end = [g+0x2a414]
 *   idm = arg1 & 0x7fff (and edx,0x7fff @ 0x009beaa3)
 *   count = SAR32(end - begin, 2)         (sub/sar @ 0x009beaa9..af)
 *   flag byte [esp+0x13] = 0; if (int32)idm < (int32)count (SIGNED jge @
 *   0x009beab5) -> slot = slotArray[idm]; if slot != 0 (test/je @
 *   0x009beabc) -> if bit31([slot+0xb8]) (and 0x80000000 / or eax,0 /
 *   jne @ 0x009beac4..d1) flag = 1 (mov byte 1 @ 0x009beac9, else
 *   mov byte 0 @ 0x009bead3)
 *   WALK [this+0..this+4) stride 4 (mov esi,[ebx] / cmp esi,[ebx+4] /
 *   je ret-0 @ 0x009bead8..df); per player = [iter]:
 *     FULL dword [player+0x2c] != 0 -> ADVANCE (cmp/jne @ 0x009beae5..e9)
 *     HOST1 0x7cb6e0(player, RAW id)   (push ecx, ecx=[ebp+8] @ 0x009beaeb)
 *     sum = sum + eax (32-bit wrap, add edi,eax @ 0x009beaf3)
 *     flag LOW byte != 0 AND [player+0x1e6c] != 0 -> HOST2
 *       0x7cb6e0(twin, RAW id) (push [ebp+8] @ 0x009beb06), sum += eax
 *       (cmp byte [esp+0x13],0 / je skip @ 0x009beaf5..fa; mov ecx,
 *       [ebx+0x1e6c] / test ecx,ecx / je skip @ 0x009beafc..04)
 *     iter += 4; iter != [this+4] -> loop  (add esi,4 @ 0x009beb17;
 *       cmp esi,[eax+4] / jne @ 0x009beb1a..1d — END RE-READ per
 *       iteration, this reloaded from local [esp+0x14] @ 0x009beb13;
 *       matches 9be6b0/9be750 re-read style, DIFFERS from a9bea40/
 *       9be9c0/9be990 captured-once)
 *   Loop-exhausted -> ret sum (mov eax,edi @ 0x009beb1f).
 *   Both host calls take the UNMASKED raw arg1 (never the 0x7fff-masked
 *   copy; the mask feeds ONLY the slot-array index + range gate).
 * ---- */
enum {
  ISAAC_GTM9BEA80_LIST_BEGIN_OFS = 0,      /* players vector begin off */
  ISAAC_GTM9BEA80_LIST_END_OFS = 4,        /* players vector end off */
  ISAAC_GTM9BEA80_LIST_STRIDE = 4,         /* slot dword; add esi,4 */
  ISAAC_GTM9BEA80_SLOT_FLAG_OFS = 0x2c,    /* FULL dword gate [player+0x2c] */
  ISAAC_GTM9BEA80_TWIN_PTR_OFS = 0x1e6c,   /* twin = [player+0x1e6c] */
  ISAAC_GTM9BEA80_SLOT_ARRAY_BEGIN_OFS = 0x2a410, /* [g]+0x2a410 begin */
  ISAAC_GTM9BEA80_SLOT_ARRAY_END_OFS = 0x2a414,   /* [g]+0x2a414 end */
  ISAAC_GTM9BEA80_ID_MASK = 0x7fff,        /* 15-bit trinket id mask */
  ISAAC_GTM9BEA80_TWIN_FLAGS_OFS = 0xb8,   /* flags = [slot+0xb8] */
  ISAAC_GTM9BEA80_TWIN_FLAG_BIT = 0x80000000u, /* bit31 test */
  ISAAC_GTM9BEA80_MANAGER_GLOBAL_VA = 0x00c7169c, /* ptr -> slot array base */
  ISAAC_GTM9BEA80_GAME_GLOBAL_VA = 0x00c71678, /* g_Game (caller base) */
  ISAAC_GTM9BEA80_RECEIVER_OFS = 0x1baa8,  /* this = g_Game + 0x1baa8 */
  ISAAC_GTM9BEA80_HOST_STATUS_VA = 0x007cb6e0, /* host status thiscall (x2) */
  ISAAC_GTM9BEA80_VA = 0x009bea80,
  ISAAC_GTM9BEA80_FIRST_RET_VA = 0x009beb27, /* single epilogue ret 4 */
  ISAAC_GTM9BEA80_RET_VA = 0x009beb27,     /* single epilogue ret 4 */
  ISAAC_GTM9BEA80_INT3_VA = 0x009beb2a,    /* int3 pad after the body */
  ISAAC_GTM9BEA80_BODY_BYTES = 0xaa,       /* 170; through int3 pad */
  ISAAC_GTM9BEA80_SITES = 43,              /* full rel32 E8 census (verified) */
  ISAAC_GTM9BEA80_NEXT_VA = 0x009beb30     /* next sibling (landed ABI v47; then v48 body @ 0x009beba0) */
};

/* ===========================================================================
 * ABI v47 -- 0x009beb30, address-stable all/any instant-death-curse walk
 * (NO exact ZHL; identify-zhl-address.mjs 0x009beb30 -> exactMatches 0,
 * verified this unit; family precedent a9be530/a9be630/a9be670/a9be6b0/
 * a9be850/a9be990/a9be9c0/a9bea40).  __thiscall ret 4 @ 0x009beb9b
 * (FIRST_RET_VA == RET_VA, single epilogue; int3 pad @ 0x009beb9e).
 * NARROWED: pure walk + byte/full-word gates + 32-bit wrap charge
 * arithmetic + AND/OR byte combine around ONE host leaf -- 0x007db6b0
 * (EXACT ZHL 14 B `__thiscall bool Entity_Player::HasInstantDeathCurse();`,
 * PURE body 36 insns 0 E8 / 0 indirect / 0 stores; stays a typed HOST
 * event this unit per the ONE-BODY mandate -- candidate for a future pure
 * peel, do NOT reopen here).  0 indirect; 0 mem-stores (ZERO observable
 * stores).  this = g_Game + 0x1baa8 (all 3 rel32 callers do
 * `lea ecx,[..+0x1baa8]`); arg1 = uint32 mode BY VALUE (only LOW byte
 * observed: `mov bh,byte [ebp+8]`); return = byte in al (consumers
 * `test al,al` -> BOOL at all 3 sites).
 *
 * PE body (0x009beb30 .. ret 4 @ 0x009beb9b, int3 pad @ 0x009beb9e):
 *   bh = arg1 LOW byte (mode/seed); bl = bh (mov bl,bh @ 0x009beb3a)
 *   esi = [this+0] begin; edi = [this+4] end (BOTH captured ONCE at
 *   entry, end NEVER re-read — matches a9bea40/9be9c0/9be990
 *   captured-once style, DIFFERS from 9bea80/9be6b0/9be750 re-read)
 *   begin == end -> ret bl (= arg & 0xff ECHO, NOT 0/1; cmp/je @
 *   0x009beb40..42); consumers test al,al (nonzero -> true)
 *   per candidate (player = [iter], stride 4):
 *     FULL dword [p+0x2c] == 0 (cmp/jne @ 0x009beb46..4a) AND byte
 *       [p+0x20a9] == 0 (cmp byte/jne @ 0x009beb4c..53) -> candidate;
 *       else ADVANCE with bl unchanged (NO candidate passes -> ret
 *       arg&0xff echo)
 *     a = [p+0x134c] + [p+0x1344] (32-bit wrap, mov/add @ 0x009beb55..5b)
 *     SIGNED (int32)a >= (int32)[p+0x1340] (cmp/jge @ 0x009beb61..67)
 *       -> al = 1 WITHOUT host; else HOST 0x7db6b0(player) (thiscall,
 *       ecx = player, NO stack args) -> al = (host_al & 0xff) != 0
 *       (test al,al / je / mov al,1 @ 0x009beb6e..72)
 *     COMBINE (0x009beb74..8c): mode = bh (arg low byte); mode != 0 ->
 *       AND bl = (bl != 0 && al != 0) ? 1 : 0; mode == 0 -> OR
 *       bl = (bl != 0 || al != 0) ? 1 : 0; bl/al tested as LOW BYTES
 *     iter += 4 (wrap); next != end (CAPTURED ONCE edi) -> loop
 *       (cmp/jne @ 0x009beb91..93)
 *   Loop-exhausted -> ret bl (mov al,bl @ 0x009beb97; byte result).
 * ---- */
enum {
  ISAAC_A9BEB30_LIST_BEGIN_OFS = 0,        /* players vector begin off */
  ISAAC_A9BEB30_LIST_END_OFS = 4,          /* players vector end off */
  ISAAC_A9BEB30_LIST_STRIDE = 4,           /* slot dword; add esi,4 */
  ISAAC_A9BEB30_SLOT_FLAG_OFS = 0x2c,      /* FULL dword gate [p+0x2c] */
  ISAAC_A9BEB30_FLAG20A9_OFS = 0x20a9,     /* byte gate [p+0x20a9] */
  ISAAC_A9BEB30_CHARGE_OFS = 0x134c,       /* a = [p+0x134c] */
  ISAAC_A9BEB30_CHARGE_ADDEND_OFS = 0x1344, /* a += [p+0x1344] (wrap) */
  ISAAC_A9BEB30_CHARGE_MAX_OFS = 0x1340,   /* SIGNED a >= [p+0x1340] */
  ISAAC_A9BEB30_MANAGER_GLOBAL_VA = 0x00c71678, /* g_Game (caller base) */
  ISAAC_A9BEB30_RECEIVER_OFS = 0x1baa8,    /* this = g_Game + 0x1baa8 */
  ISAAC_A9BEB30_HOST_CURSE_VA = 0x007db6b0, /* host HasInstantDeathCurse */
  ISAAC_A9BEB30_VA = 0x009beb30,
  ISAAC_A9BEB30_FIRST_RET_VA = 0x009beb9b, /* single epilogue ret 4 */
  ISAAC_A9BEB30_RET_VA = 0x009beb9b,       /* single epilogue ret 4 */
  ISAAC_A9BEB30_INT3_VA = 0x009beb9e,      /* int3 pad after the body */
  ISAAC_A9BEB30_BODY_BYTES = 0x6e,         /* 110; through int3 pad */
  ISAAC_A9BEB30_SITES = 3,                 /* full rel32 E8 census (verified) */
  ISAAC_A9BEB30_SITE0_VA = 0x0073ada9,     /* verified caller */
  ISAAC_A9BEB30_SITE1_VA = 0x0073bd21,     /* verified caller */
  ISAAC_A9BEB30_SITE2_VA = 0x00748819,     /* verified caller */
  ISAAC_A9BEB30_NEXT_VA = 0x009beba0       /* next sibling (landed ABI v48) */
};

/* ---------------- ABI v48: 0x009beba0 avg-player-position walk --------
 * NARROWED (NOT PURE-removed): pure walk + slot/watch/flag20a9 gates +
 * gobj scan + f32 accumulate + average math; 2 INDIRECT host predicates
 * (vtable slot [[gitem+0x370]+0x14](gitem+0x370), result byte) + 2 E8
 * assert calls 0x00a112c0 ("Gamestate corrupted or has new data!") stay
 * typed host events; observable stores (*out float2, cache floats
 * 0xc9436c/0xc94370, cacheTs 0xc5c4d4) are POST events — the laws
 * compute the VALUES, the slice applies the stores.  arg1 = uint32 out
 * ptr, arg2 = uint32 mode (LOW byte only); __thiscall ret 8; fast path
 * (mode&0xff != 0 && ts==cacheTs) returns the cached float2.  ---- */
enum {
  ISAAC_A9BEBA0_LIST_BEGIN_OFS = 0,      /* players vector begin off */
  ISAAC_A9BEBA0_LIST_END_OFS = 4,        /* players vector end off */
  ISAAC_A9BEBA0_LIST_STRIDE = 4,         /* slot dword */
  ISAAC_A9BEBA0_SECOND_LIST_BEGIN_OFS = 0xd0, /* second walk list begin */
  ISAAC_A9BEBA0_SECOND_LIST_END_OFS = 0xd4,   /* second walk list end */
  ISAAC_A9BEBA0_SLOT_FLAG_OFS = 0x2c,    /* FULL dword gate [p+0x2c] */
  ISAAC_A9BEBA0_WATCH_OFS = 0x13c0,      /* FULL dword [p+0x13c0] vs 0x23 */
  ISAAC_A9BEBA0_WATCH_VALUE = 0x23,      /* 35: watch type blocks */
  ISAAC_A9BEBA0_FLAG20A9_OFS = 0x20a9,   /* LOW byte gate [p+0x20a9] */
  ISAAC_A9BEBA0_LOOKUP_KEY_OFS = 0x1618, /* gobj scan key [p+0x1618] */
  ISAAC_A9BEBA0_LOOKUP_TAG_OFS = 0xc,    /* gobj item tag [gitem+0xc] */
  ISAAC_A9BEBA0_POS_X_OFS = 0x33c,       /* f32 x [elem+0x33c] */
  ISAAC_A9BEBA0_POS_Y_OFS = 0x340,       /* f32 y [elem+0x340] */
  ISAAC_A9BEBA0_PRED_OBJ_OFS = 0x370,    /* predicate object ptr */
  ISAAC_A9BEBA0_PRED_SLOT_OFS = 0x14,    /* vtable slot [[o]+0x14] */
  ISAAC_A9BEBA0_GOBJ_TS_OFS = 0x4abbc,   /* gobj timestamp field */
  ISAAC_A9BEBA0_GOBJ_LIST_BEGIN_OFS = 0x4b3d8, /* gobj scan list begin */
  ISAAC_A9BEBA0_GOBJ_LIST_END_OFS = 0x4b3dc,   /* gobj scan list end */
  ISAAC_A9BEBA0_CACHE_TS_VA = 0x00c5c4d4, /* timestamp cache (store+read) */
  ISAAC_A9BEBA0_CACHE_X_VA = 0x00c9436c,  /* cached f32 x (past .data raw
                                            end -> 0.0f at load) */
  ISAAC_A9BEBA0_CACHE_Y_VA = 0x00c94370,  /* cached f32 y (same) */
  ISAAC_A9BEBA0_GOBJ_GLOBAL_VA = 0x00c7169c, /* gobj global pointer */
  ISAAC_A9BEBA0_MANAGER_GLOBAL_VA = 0x00c71678, /* g_Game (caller base) */
  ISAAC_A9BEBA0_RECEIVER_OFS = 0x1baa8,  /* this = g_Game + 0x1baa8 */
  ISAAC_A9BEBA0_ASSERT_VA = 0x00a112c0,  /* host assert routine */
  ISAAC_A9BEBA0_ASSERT_MSG_VA = 0x00b7e6bc, /* "Gamestate corrupted..." */
  ISAAC_A9BEBA0_ASSERT_CODE = 0x10,      /* 16 = assert code */
  ISAAC_A9BEBA0_VA = 0x009beba0,
  ISAAC_A9BEBA0_FIRST_RET_VA = 0x009bebe9, /* fast-path epilogue ret 8 */
  ISAAC_A9BEBA0_RET_VA = 0x009bee74,     /* main epilogue ret 8 */
  ISAAC_A9BEBA0_INT3_VA = 0x009bee77,    /* int3 pad after the body */
  ISAAC_A9BEBA0_BODY_BYTES = 0x2d7,      /* 727; through int3 pad */
  ISAAC_A9BEBA0_SITES = 9,               /* full rel32 E8 census (verified) */
  ISAAC_A9BEBA0_SITE0_VA = 0x004ac128,   /* verified caller */
  ISAAC_A9BEBA0_SITE1_VA = 0x00800524,   /* verified caller */
  ISAAC_A9BEBA0_SITE2_VA = 0x00943032,   /* verified caller */
  ISAAC_A9BEBA0_SITE3_VA = 0x00943850,   /* verified caller */
  ISAAC_A9BEBA0_SITE4_VA = 0x00943a4d,   /* verified caller */
  ISAAC_A9BEBA0_SITE5_VA = 0x00943e6d,   /* verified caller */
  ISAAC_A9BEBA0_SITE6_VA = 0x009446fd,   /* verified caller */
  ISAAC_A9BEBA0_SITE7_VA = 0x009940a5,   /* verified caller */
  ISAAC_A9BEBA0_SITE8_VA = 0x009940fc,   /* verified caller */
  ISAAC_A9BEBA0_NEXT_VA = 0x009bee80     /* 0x009bee80 HOST-classified ABI
                                            v49 (MSVC EH entity swap/relink,
                                            no pure surface); the family's
                                            next law unit was 0x009bfa70
                                            (landed ABI v49) */
};

/* ---------------- ABI v49: 0x009bfa70 PURE bool-walk counter --------
 * PURE (0 E8 / 0 indirect / 0 observable stores — the single [ebp-4]
 * store is a local save).  this = g_Game + 0x1baa8 (players vector
 * container); NO stack args; __thiscall ret plain.  Count of slots p
 * where [p+0x2c]==0 && [p+0x3bc]==0 && (link==0 || linkIdx==-1 ||
 * SIGNED(linkIdx) >= SIGNED(ownIdx) || link==p) && byte[p+0x20a9]!=0
 * (link = [p+0x1e68], linkIdx = [link+0x161c], ownIdx = [p+0x161c]).
 * begin/end captured ONCE at entry (begin re-read from a local each
 * iteration — value-identical).  Byte gate: [p+0x20a9] LOW byte only
 * (uint32_t params + explicit & 0xff; NO uint8_t params).  ---- */
enum {
  ISAAC_A9BFA70_LIST_BEGIN_OFS = 0,    /* players vector begin off */
  ISAAC_A9BFA70_LIST_END_OFS = 4,      /* players vector end off */
  ISAAC_A9BFA70_LIST_STRIDE = 4,       /* slot dword */
  ISAAC_A9BFA70_SLOT_FLAG_OFS = 0x2c,  /* FULL dword gate [p+0x2c] */
  ISAAC_A9BFA70_STATE_OFS = 0x3bc,     /* FULL dword gate [p+0x3bc] */
  ISAAC_A9BFA70_LINK_OFS = 0x1e68,     /* link ptr [p+0x1e68] */
  ISAAC_A9BFA70_INDEX_OFS = 0x161c,    /* index field (own + link obj) */
  ISAAC_A9BFA70_FLAG20A9_OFS = 0x20a9, /* LOW byte flag [p+0x20a9] */
  ISAAC_A9BFA70_MANAGER_GLOBAL_VA = 0x00c71678, /* g_Game (caller base) */
  ISAAC_A9BFA70_RECEIVER_OFS = 0x1baa8, /* this = g_Game + 0x1baa8 */
  ISAAC_A9BFA70_VA = 0x009bfa70,
  ISAAC_A9BFA70_FIRST_RET_VA = 0x009bfadd, /* single epilogue ret */
  ISAAC_A9BFA70_RET_VA = 0x009bfadd,   /* ret plain */
  ISAAC_A9BFA70_INT3_VA = 0x009bfade,  /* int3 pad after the body */
  ISAAC_A9BFA70_BODY_BYTES = 0x70,     /* 112; through int3 pad */
  ISAAC_A9BFA70_SITES = 4,             /* full rel32 E8 census (verified) */
  ISAAC_A9BFA70_SITE0_VA = 0x006622bf, /* verified caller (via 0x417860) */
  ISAAC_A9BFA70_SITE1_VA = 0x0066233d, /* verified caller (via 0x417860) */
  ISAAC_A9BFA70_SITE2_VA = 0x008ef9c2, /* verified caller (add +0x1baa8) */
  ISAAC_A9BFA70_SITE3_VA = 0x008efe49, /* verified caller (lea +0x1baa8) */
  ISAAC_A9BFA70_NEXT_VA = 0x009bfae0   /* next sibling (game-update greed
                                          helper FUN_009bfae0 — claimed
                                          lane; do-not-reopen for PI) */
};

/* ===========================================================================
 * ABI v50 -- PlayerManager::CoopBabiesOnly (0x009ba980) PURE bit-0x10
 * getter.  EXACT ZHL 14 B `static bool PlayerManager::CoopBabiesOnly();`
 * (third_party/REPENTOGON/libzhl/functions/PlayerManager.zhl:44; also
 * consumed at LuaIsaac.cpp:442 `!PlayerManager::CoopBabiesOnly()`).
 * 7 insns / 2 rets (0x009ba980..0x009ba998), int3 pad 0x009ba999, next
 * sibling 0x009ba9a0 (SEH EH fn — HOST, classify-not-land).  3-site
 * rel32 E8 census 0x009bae7e / 0x009bb081 / 0x009bb288, all inside the
 * unclaimed HOST state machine 0x9bac40, each `test al,al` right after
 * the call.  Body ignores ecx (static; no receiver — the field read is
 * g_Game [0xc71678] + 0x26548, the challenge BITSET — bit 4 (0x10) =
 * Coop Babies; field cross-confirmed frame-opaque/render-shell/room/
 * exit families as ISAAC_*_26548_*).
 *   mov eax,[0xc71678]; mov eax,[eax+0x26548]; and eax,0x10; or eax,0;
 *   je 0x9ba996; mov al,1; ret; xor al,al; ret.
 * PURE: 0 E8 / 0 indirect / 0 stores.  Mask gate FULL dword & 0x10
 * (byte-gate law takes uint32_t; WIDE drives prove the mask).
 * =========================================================================== */
enum {
  ISAAC_CBO9BA980_BITSET_OFS = 0x26548, /* Game challenge bitset field */
  ISAAC_CBO9BA980_BITSET_MASK = 0x10,   /* bit 4 = Coop Babies challenge */
  ISAAC_CBO9BA980_MANAGER_GLOBAL_VA = 0x00c71678, /* g_Game */
  ISAAC_CBO9BA980_VA = 0x009ba980,
  ISAAC_CBO9BA980_FIRST_RET_VA = 0x009ba995, /* true-arm ret */
  ISAAC_CBO9BA980_RET_VA = 0x009ba998,       /* false-arm ret */
  ISAAC_CBO9BA980_INT3_VA = 0x009ba999,      /* int3 pad after the body */
  ISAAC_CBO9BA980_BODY_BYTES = 0x19,         /* 25; through int3 pad */
  ISAAC_CBO9BA980_SITES = 3,                 /* full rel32 E8 census */
  ISAAC_CBO9BA980_SITE0_VA = 0x009bae7e,     /* inside 0x9bac40 state machine */
  ISAAC_CBO9BA980_SITE1_VA = 0x009bb081,     /* inside 0x9bac40 */
  ISAAC_CBO9BA980_SITE2_VA = 0x009bb288,     /* inside 0x9bac40 */
  ISAAC_CBO9BA980_NEXT_VA = 0x009ba9a0       /* SEH EH sibling (HOST) */
};

/* 0x009bea48..0x009bea4a: cmp eax,ecx / je ret.  FULL dword
   begin==end -> loop never runs, sum stays +0.0f. */
int32_t isaac_a9bea40_list_empty(uint32_t list_begin, uint32_t list_end);
/* 0x009be56b: cmp esi,[this+4] / je tail.  FULL dword. */
int32_t isaac_a9be530_list_empty(uint32_t list_begin, uint32_t list_end);
/* 0x009be582: cmp dword [player+0x2c],0 / jne skip.  FULL dword. */
int32_t isaac_a9be530_slot_checkable(uint32_t player_field_2c);
/* 0x009be58c: cmp byte [player+0x202c],0 / jne skip.  RAW uint32, low byte. */
int32_t isaac_a9be530_flag202c_checkable(uint32_t player_field_202c);
/* 0x009be599: cmp byte [player+0x20a9],0 / jne skip.  RAW uint32, low byte. */
int32_t isaac_a9be530_flag20a9_checkable(uint32_t player_field_20a9);
/* 0x009be5a2: cmp dword [player+0x17e0],3 / jl skip.  SIGNED >= 3. */
int32_t isaac_a9be530_charge_ok(uint32_t player_field_17e0);
/* 0x009be5ab: test ebx,ebx / jne draw.  FULL dword; seed==0 -> assert+trap. */
int32_t isaac_a9be530_seed_assert_needed(uint32_t seed);
/* 0x009be5c4..0x009be5dd: xorshift32, same table as RCO/RTO (3/5/20). */
uint32_t isaac_a9be530_xorshift_state(uint32_t seed, uint32_t shift1,
                                      uint32_t shift2, uint32_t shift3);
/* 0x009be5e7..0x009be5ef: cvtdq2pd + sign-correction == (double)u32. */
double isaac_a9be530_state_as_f64(uint32_t state);
/* 0x009be5f8 cvtpd2ps then 0x009be5fc mulss scale: [0,1) candidate. */
float isaac_a9be530_next_float(uint32_t state);
/* 0x009be604 comiss / 0x009be607 jbe keeps old: update iff ordered && >. */
int32_t isaac_a9be530_best_update_needed(float candidate, float best);
/* 0x009be61b: add esi,4.  32-bit wrap. */
uint32_t isaac_a9be530_walk_next(uint32_t iter);
/* 0x009be61e: cmp esi,[ecx+4] / jne loop.  Bound re-read each iteration. */
int32_t isaac_a9be530_walk_continue(uint32_t next_iter, uint32_t list_end);
/* 0x009be60c / 0x009be618: eax = winner local (init 0). */
uint32_t isaac_a9be530_result_player(uint32_t best_player);
uint32_t isaac_a9be530_list_begin_ofs(void);
uint32_t isaac_a9be530_list_end_ofs(void);
uint32_t isaac_a9be530_list_stride(void);
uint32_t isaac_a9be530_slot_flag_ofs(void);
uint32_t isaac_a9be530_flag202c_ofs(void);
uint32_t isaac_a9be530_flag20a9_ofs(void);
uint32_t isaac_a9be530_charge_ofs(void);
uint32_t isaac_a9be530_charge_min(void);
uint32_t isaac_a9be530_seed_assert_msg_va(void);
uint32_t isaac_a9be530_log_level(void);
uint32_t isaac_a9be530_assert_trap_va(void);
uint32_t isaac_a9be530_host_log_va(void);
uint32_t isaac_a9be530_rng_shift_table_va(void);
uint32_t isaac_a9be530_rng_shift1(void);
uint32_t isaac_a9be530_rng_shift2(void);
uint32_t isaac_a9be530_rng_shift3(void);
uint32_t isaac_a9be530_best_init_bits(void);
uint32_t isaac_a9be530_scale_bits(void);
uint32_t isaac_a9be530_sign_corr_table_va(void);
float isaac_a9be530_best_init_value(void);
float isaac_a9be530_scale_value(void);
uint32_t isaac_a9be530_va(void);
uint32_t isaac_a9be530_ret_va(void);
uint32_t isaac_a9be530_first_ret_va(void);
uint32_t isaac_a9be530_int3_va(void);
uint32_t isaac_a9be530_body_bytes(void);
uint32_t isaac_a9be530_sites(void);
uint32_t isaac_a9be530_next_va(void);

/* 0x009be639: cmp eax,ecx / je not-found.  FULL dword begin==end. */
int32_t isaac_a9be630_list_empty(uint32_t list_begin, uint32_t list_end);
/* 0x009be642: cmp dword [player+0x2c],0 / jne skip.  FULL dword. */
int32_t isaac_a9be630_slot_checkable(uint32_t player_field_2c);
/* 0x009be648: cmp byte [player+0x20a9],0 / jne skip.  RAW uint32, low byte. */
int32_t isaac_a9be630_flag20a9_checkable(uint32_t player_field_20a9);
/* 0x009be651: cmp dword [player+0x13c0],esi / je found.  FULL dword == needle. */
int32_t isaac_a9be630_slot_matches(uint32_t player_slot_value,
                                   uint32_t needle_slot);
/* 0x009be659: add eax,4.  32-bit wrap; bound captured ONCE pre-loop. */
uint32_t isaac_a9be630_walk_next(uint32_t iter);
/* 0x009be65c: cmp eax,ecx / jne loop.  End held in ecx (loaded @ 0x009be635). */
int32_t isaac_a9be630_walk_continue(uint32_t next_iter, uint32_t list_end);
/* 0x009be660: xor eax,eax.  Not-found result 0. */
uint32_t isaac_a9be630_result_notfound(void);
/* 0x009be667: mov eax,edx.  Found result = player ptr. */
uint32_t isaac_a9be630_result_found(uint32_t player_ptr);
uint32_t isaac_a9be630_list_begin_ofs(void);
uint32_t isaac_a9be630_list_end_ofs(void);
uint32_t isaac_a9be630_list_stride(void);
uint32_t isaac_a9be630_slot_flag_ofs(void);
uint32_t isaac_a9be630_flag20a9_ofs(void);
uint32_t isaac_a9be630_slot_value_ofs(void);
uint32_t isaac_a9be630_va(void);
uint32_t isaac_a9be630_ret_va(void);
uint32_t isaac_a9be630_first_ret_va(void);
uint32_t isaac_a9be630_int3_va(void);
uint32_t isaac_a9be630_body_bytes(void);
uint32_t isaac_a9be630_sites(void);
uint32_t isaac_a9be630_next_va(void);

/* 0x009be675: cmp eax,ecx / je TRUE arm.  FULL dword begin==end -> 1. */
int32_t isaac_a9be670_list_empty(uint32_t list_begin, uint32_t list_end);
/* 0x009be682: cmp dword [player+0x2c],0 / jne skip.  FULL dword. */
int32_t isaac_a9be670_slot_checkable(uint32_t player_field_2c);
/* 0x009be688: cmp byte [player+0x20a9],0 / jne skip.  RAW uint32, low byte. */
int32_t isaac_a9be670_flag20a9_checkable(uint32_t player_field_20a9);
/* 0x009be691: cmp dword [player+0x13c0],0x19 / jne FALSE.  FULL dword == 0x19
   (IMMEDIATE needle, NOT a stack arg; body never reads arg1). */
int32_t isaac_a9be670_slot_equals_needle(uint32_t player_slot_value);
/* 0x009be69a: add eax,4.  32-bit wrap; bound captured ONCE pre-loop. */
uint32_t isaac_a9be670_walk_next(uint32_t iter);
/* 0x009be69d: cmp eax,ecx / jne loop.  End held in ecx (loaded @ 0x009be672). */
int32_t isaac_a9be670_walk_continue(uint32_t next_iter, uint32_t list_end);
/* 0x009be6a1: mov al,1.  TRUE result 1 (empty OR all checkable == 0x19). */
uint32_t isaac_a9be670_result_true(void);
/* 0x009be6a6: xor al,al.  FALSE result 0 (checkable slot != 0x19). */
uint32_t isaac_a9be670_result_false(void);
uint32_t isaac_a9be670_list_begin_ofs(void);
uint32_t isaac_a9be670_list_end_ofs(void);
uint32_t isaac_a9be670_list_stride(void);
uint32_t isaac_a9be670_slot_flag_ofs(void);
uint32_t isaac_a9be670_flag20a9_ofs(void);
uint32_t isaac_a9be670_slot_value_ofs(void);
uint32_t isaac_a9be670_slot_needle(void);
uint32_t isaac_a9be670_va(void);
uint32_t isaac_a9be670_ret_va(void);
uint32_t isaac_a9be670_first_ret_va(void);
uint32_t isaac_a9be670_int3_va(void);
uint32_t isaac_a9be670_body_bytes(void);
uint32_t isaac_a9be670_sites(void);
uint32_t isaac_a9be670_next_va(void);

/* 0x009be6c4: cmp esi,[this+4] / je epilogue A.  FULL dword; bound re-read. */
int32_t isaac_a9be6b0_list_empty(uint32_t list_begin, uint32_t list_end);
/* 0x009be6ce: test eax,eax / je path C.  FULL dword [p+0x2ef8] != 0. */
int32_t isaac_a9be6b0_field_nonzero(uint32_t player_field_2ef8);
/* 0x009be6d8: cmp eax,edx / jne path C.  FULL dword field == needle arg1. */
int32_t isaac_a9be6b0_field_eq_needle(uint32_t player_field_2ef8,
                                      uint32_t needle);
/* 0x009be6dc: cmp byte [p+0x2ef0],0 / je path B.  RAW uint32, low byte. */
int32_t isaac_a9be6b0_flag2ef0_set(uint32_t player_flag_2ef0);
/* 0x009be6f5/0x9be6fb: path B status; cmp eax,1 / setg.  SIGNED > 1. */
int32_t isaac_a9be6b0_status_gt1(uint32_t status_result);
/* 0x009be700/0x9be706: path C status; test eax,eax / setg.  SIGNED > 0. */
int32_t isaac_a9be6b0_status_gt0(uint32_t status_result);
/* 0x009be6ec: mov bl,1 (path A accept bit FORCED 1). */
uint32_t isaac_a9be6b0_bl_forced(void);
/* 0x009be719..0x9be71f: test bl / je skip; test al / jne return.  bl != 0
   && LOW byte(query result) != 0 -> early accept (return player). */
int32_t isaac_a9be6b0_accept_needed(uint32_t bl, uint32_t query_result);
/* 0x009be721..0x9be729: winner==0 && bl!=0 -> winner = player. */
int32_t isaac_a9be6b0_winner_store_needed(uint32_t winner,
                                          uint32_t bl);
/* 0x009be72f: add esi,4.  32-bit wrap; bound re-read each iteration. */
uint32_t isaac_a9be6b0_walk_next(uint32_t iter);
/* 0x009be6c4: cmp esi,[this+4] / je epilogue A.  End RE-READ per iteration
   (this reloaded @ 0x009be72b) — matches v37, differs from v38. */
int32_t isaac_a9be6b0_walk_continue(uint32_t next_iter, uint32_t list_end);
/* 0x009be734: mov eax,[esi].  Early-accept result = player ptr. */
uint32_t isaac_a9be6b0_result_player(uint32_t player_ptr);
/* 0x009be73f: mov eax,edi.  Loop-exhausted result = winner (0 if none). */
uint32_t isaac_a9be6b0_result_winner(uint32_t winner);
uint32_t isaac_a9be6b0_list_begin_ofs(void);
uint32_t isaac_a9be6b0_list_end_ofs(void);
uint32_t isaac_a9be6b0_list_stride(void);
uint32_t isaac_a9be6b0_field_2ef8_ofs(void);
uint32_t isaac_a9be6b0_flag_2ef0_ofs(void);
uint32_t isaac_a9be6b0_query_arg1(void);
uint32_t isaac_a9be6b0_query_arg2(void);
uint32_t isaac_a9be6b0_status_call_va(void);
uint32_t isaac_a9be6b0_query_call_va(void);
uint32_t isaac_a9be6b0_va(void);
uint32_t isaac_a9be6b0_ret_va(void);
uint32_t isaac_a9be6b0_first_ret_va(void);
uint32_t isaac_a9be6b0_int3_va(void);
uint32_t isaac_a9be6b0_body_bytes(void);
uint32_t isaac_a9be6b0_sites(void);
uint32_t isaac_a9be6b0_next_va(void);

/* 0x009be778..0x009be790: flag = twin != 0 && bit31([twin+0xb8]).  The byte
   [esp+0x13] store: mov 1 @ 0x009be787, or eax,ebx / jne keeps it, else
   mov bl @ 0x009be790.  FULL dword bit test. */
int32_t isaac_gnc_9be750_twin_flag(uint32_t twin_present, uint32_t flags_b8);
/* 0x009be796..0x009be799: cmp esi,[edi+4] / je tail.  FULL dword. */
int32_t isaac_gnc_9be750_list_empty(uint32_t list_begin, uint32_t list_end);
/* 0x009be7a2..0x009be7a6: cmp dword [player+0x2c],0 / jne skip.  FULL dword. */
int32_t isaac_gnc_9be750_slot_checkable(uint32_t player_field_2c);
/* 0x009be7b4 / 0x009be7d1: add ebx,eax after host 0x770ca0.  32-bit wrap. */
uint32_t isaac_gnc_9be750_count_add(uint32_t acc, uint32_t host_count);
/* 0x009be7b6..0x009be7c5: flag LOW byte != 0 AND twin ptr != 0. */
int32_t isaac_gnc_9be750_twin_call_needed(uint32_t flag, uint32_t twin_ptr);
/* 0x009be7d7: add esi,4.  32-bit wrap. */
uint32_t isaac_gnc_9be750_walk_next(uint32_t iter);
/* 0x009be7da..0x009be7dd: cmp esi,[eax+4] / jne loop.  this re-read each
   iteration from the local save ([esp+0x14] @ 0x009be7d3).  FULL dword. */
int32_t isaac_gnc_9be750_walk_continue(uint32_t next_iter, uint32_t list_end);
/* 0x009be7e1: mov eax,ebx -- return the accumulated sum. */
uint32_t isaac_gnc_9be750_result_sum(uint32_t sum);
uint32_t isaac_gnc_9be750_list_begin_ofs(void);
uint32_t isaac_gnc_9be750_list_end_ofs(void);
uint32_t isaac_gnc_9be750_list_stride(void);
uint32_t isaac_gnc_9be750_slot_flag_ofs(void);
uint32_t isaac_gnc_9be750_twin_ptr_ofs(void);
uint32_t isaac_gnc_9be750_twin_flags_ofs(void);
uint32_t isaac_gnc_9be750_twin_bit(void);
uint32_t isaac_gnc_9be750_manager_global_va(void);
uint32_t isaac_gnc_9be750_game_global_va(void);
uint32_t isaac_gnc_9be750_receiver_ofs(void);
uint32_t isaac_gnc_9be750_twin_container_ofs(void);
uint32_t isaac_gnc_9be750_host_twin_get_va(void);
uint32_t isaac_gnc_9be750_host_count_va(void);
uint32_t isaac_gnc_9be750_va(void);
uint32_t isaac_gnc_9be750_ret_va(void);
uint32_t isaac_gnc_9be750_int3_va(void);
uint32_t isaac_gnc_9be750_body_bytes(void);
uint32_t isaac_gnc_9be750_sites(void);
uint32_t isaac_gnc_9be750_site_va(void);
uint32_t isaac_gnc_9be750_next_va(void);

/* ---------------- ABI v41: 0x009be7f0 HasTemporaryEffect ---------------- */
/* 0x009be7fa..0x009be7fc: cmp edx,esi / je 0x9be834.  FULL dword
   begin==end -> NOT-FOUND arm (needle never read; 0 like v38, NOT v39). */
int32_t isaac_hte_9be7f0_list_empty(uint32_t list_begin, uint32_t list_end);
/* 0x009be803..0x009be807: cmp dword [player+0x2c],0 / jne skip.  FULL dword. */
int32_t isaac_hte_9be7f0_slot_checkable(uint32_t player_field_2c);
/* 0x009be809..0x009be810: cmp byte [player+0x1519],0 / jne skip.  RAW
   uint32, LOW byte == 0. */
int32_t isaac_hte_9be7f0_flag1519_checkable(uint32_t flag_1519);
/* 0x009be81e..0x009be820: cmp eax,ecx / je skip.  FULL dword vec begin !=
   vec end is REQUIRED to scan. */
int32_t isaac_hte_9be7f0_vec_not_empty(uint32_t vec_begin, uint32_t vec_end);
/* 0x009be822..0x009be824: cmp dword [entry],edi / je 0x9be83c.  FULL dword
   [entry] == needle -> FOUND. */
int32_t isaac_hte_9be7f0_entry_hit(uint32_t entry_value, uint32_t needle);
/* 0x009be826: add eax,0x10.  32-bit wrap, stride 16. */
uint32_t isaac_hte_9be7f0_vec_walk_next(uint32_t iter);
/* 0x009be829..0x009be82b: cmp eax,ecx / jne 0x9be822.  FULL dword next !=
   vec end (end captured per candidate @ 0x009be818). */
int32_t isaac_hte_9be7f0_vec_walk_continue(uint32_t next_iter,
                                           uint32_t vec_end);
/* 0x009be82d: add edx,4.  32-bit wrap. */
uint32_t isaac_hte_9be7f0_walk_next(uint32_t iter);
/* 0x009be830..0x009be832: cmp edx,esi / jne 0x9be801.  FULL dword next !=
   end; END CAPTURED ONCE (esi @ 0x009be7f6 — differs from 9be6b0/9be750). */
int32_t isaac_hte_9be7f0_walk_continue(uint32_t next_iter, uint32_t list_end);
/* 0x009be83d: mov al,1 -- the FOUND epilogue (ret 4 @ 0x009be841). */
int32_t isaac_hte_9be7f0_result_found(void);
/* 0x009be835: xor al,al -- the NOT-FOUND epilogue (ret 4 @ 0x009be839). */
int32_t isaac_hte_9be7f0_result_not_found(void);
uint32_t isaac_hte_9be7f0_list_begin_ofs(void);
uint32_t isaac_hte_9be7f0_list_end_ofs(void);
uint32_t isaac_hte_9be7f0_list_stride(void);
uint32_t isaac_hte_9be7f0_slot_flag_ofs(void);
uint32_t isaac_hte_9be7f0_flag1519_ofs(void);
uint32_t isaac_hte_9be7f0_vec_begin_ofs(void);
uint32_t isaac_hte_9be7f0_vec_end_ofs(void);
uint32_t isaac_hte_9be7f0_vec_stride(void);
uint32_t isaac_hte_9be7f0_va(void);
uint32_t isaac_hte_9be7f0_first_ret_va(void);
uint32_t isaac_hte_9be7f0_ret_va(void);
uint32_t isaac_hte_9be7f0_int3_va(void);
uint32_t isaac_hte_9be7f0_body_bytes(void);
uint32_t isaac_hte_9be7f0_sites(void);
uint32_t isaac_hte_9be7f0_site_va(void);
uint32_t isaac_hte_9be7f0_site2_va(void);
uint32_t isaac_hte_9be7f0_next_va(void);

/* ---------------- ABI v42: 0x009be850 slot-accumulator gates ---------------- */
/* 0x009be865..0x009be867: sub eax,edx / sar eax,2.  SIGNED arithmetic shift
   (32-bit wrap): count = (end - begin) >> 2. */
int32_t isaac_a9be850_list_count(uint32_t list_end, uint32_t list_begin);
/* 0x009be86a..0x009be86c: test eax,eax / je epilogue.  FULL dword count !=
   0 -> body runs (early return when the player list is empty). */
int32_t isaac_a9be850_loop_needed(int32_t count);
/* 0x009be88c..0x009be896: sub eax,ebx / and eax,0xfffffffc /
   cmp eax,0x1c0 / jle skip.  SIGNED ((vec_end - vec_begin) & ~3) > 0x1c0.
   IDENTICAL predicate gates both host calls (0x009be88c for host1,
   0x009be925 for host2); the jle is SIGNED (a negative masked delta never
   fires). */
int32_t isaac_a9be850_host_gate_needed(uint32_t vec_end, uint32_t vec_begin);
/* 0x009be898..0x009be8a0: mov eax,[vec_begin+0x1c0] / test eax,eax / je
   skip.  FULL dword slot != 0 (both host gates). */
int32_t isaac_a9be850_slot_present(uint32_t slot);
/* 0x009be8d0..0x009be8d8: mov ecx,[player+0x1e6c] / test ecx,ecx / je tail.
   FULL dword twin ptr != 0 (host2 path requires it). */
int32_t isaac_a9be850_twin_present(uint32_t twin);
/* 0x009be8de..0x009be8eb: cmp byte [twin+0x1519],0 / jne host2-gate.  RAW
   uint32, LOW byte == 0 -> marker scan allowed (host2 still runs). */
int32_t isaac_a9be850_flag1519_clear(uint32_t flag_1519);
/* 0x009be8f9..0x009be8fb: cmp eax,ecx / je host2-gate.  FULL dword twin vec
   begin != end is REQUIRED to scan markers (host2 still runs when empty). */
int32_t isaac_a9be850_twin_vec_not_empty(uint32_t vec_begin,
                                         uint32_t vec_end);
/* 0x009be902..0x009be90b: cmp dword [entry+0],0 / cmp dword [entry+4],0x70
   / je loop-tail.  FULL dwords: marker found -> SKIP host2 (jump to the
   loop tail, next candidate). */
int32_t isaac_a9be850_marker_hit(uint32_t entry_field0,
                                 uint32_t entry_field4);
/* 0x009be90d: add eax,0x10.  32-bit wrap, stride 16. */
uint32_t isaac_a9be850_vec_walk_next(uint32_t iter);
/* 0x009be910..0x009be912: cmp eax,ecx / jne 0x009be900.  FULL dword next !=
   twin vec end (end captured per candidate @ 0x009be8f3). */
int32_t isaac_a9be850_vec_walk_continue(uint32_t next_iter,
                                        uint32_t vec_end);
/* 0x009be969: inc esi.  32-bit wrap, index += 1. */
uint32_t isaac_a9be850_walk_next(uint32_t index);
/* 0x009be966..0x009be973: end/begin RE-READ + sar + cmp esi,eax / jb.
   UNSIGNED next_index < count; count RE-DERIVED per iteration (differs
   from HTE 9be7f0 captured-once; matches 9be6b0/9be750 re-read style). */
int32_t isaac_a9be850_walk_continue(uint32_t next_index, int32_t count);
uint32_t isaac_a9be850_list_begin_ofs(void);
uint32_t isaac_a9be850_list_end_ofs(void);
uint32_t isaac_a9be850_list_stride(void);
uint32_t isaac_a9be850_manager_global_va(void);
uint32_t isaac_a9be850_vec_a_begin_ofs(void);
uint32_t isaac_a9be850_vec_a_end_ofs(void);
uint32_t isaac_a9be850_vec_a_slot_ofs(void);
uint32_t isaac_a9be850_host_gate_threshold(void);
uint32_t isaac_a9be850_host_gate_mask(void);
uint32_t isaac_a9be850_slot_field_ofs(void);
uint32_t isaac_a9be850_host_receiver_ofs(void);
uint32_t isaac_a9be850_twin_field_ofs(void);
uint32_t isaac_a9be850_flag1519_ofs(void);
uint32_t isaac_a9be850_twin_vec_begin_ofs(void);
uint32_t isaac_a9be850_twin_vec_end_ofs(void);
uint32_t isaac_a9be850_twin_vec_stride(void);
uint32_t isaac_a9be850_marker_field0_value(void);
uint32_t isaac_a9be850_marker_field4_value(void);
uint32_t isaac_a9be850_host_va(void);
uint32_t isaac_a9be850_host_arg2(void);
uint32_t isaac_a9be850_host_arg3(void);
uint32_t isaac_a9be850_game_global_va(void);
uint32_t isaac_a9be850_receiver_ofs(void);
uint32_t isaac_a9be850_caller_arg1(void);
uint32_t isaac_a9be850_va(void);
uint32_t isaac_a9be850_ret_va(void);
uint32_t isaac_a9be850_int3_va(void);
uint32_t isaac_a9be850_body_bytes(void);
uint32_t isaac_a9be850_sites(void);
uint32_t isaac_a9be850_site_va(void);
uint32_t isaac_a9be850_next_va(void);

/* ---------------- ABI v43: 0x009be990 PURE bool scan ---------------- */
/* 0x009be9a2..0x009be9af: code = [player+0x3fc] FULL dword; test/je ==0
   advance; cmp/jne !=3 advance; else FOUND.  RAW uint32, FULL dword. */
int32_t isaac_a9be990_hit(uint32_t code);
/* 0x009be995..0x009be997: cmp eax,ecx / je not-found.  FULL dword
   begin==end -> NOT-FOUND (al=0), loop never runs. */
int32_t isaac_a9be990_list_empty(uint32_t list_begin, uint32_t list_end);
/* 0x009be9b1: add eax,4.  32-bit wrap, stride 4. */
uint32_t isaac_a9be990_walk_next(uint32_t iter);
/* 0x009be9b4..0x009be9b6: cmp eax,ecx / jne loop.  FULL dword next != end;
   END CAPTURED ONCE pre-loop (ecx @ 0x009be992) — NEVER re-read. */
int32_t isaac_a9be990_walk_continue(uint32_t next_iter, uint32_t list_end);
uint32_t isaac_a9be990_list_begin_ofs(void);
uint32_t isaac_a9be990_list_end_ofs(void);
uint32_t isaac_a9be990_list_stride(void);
uint32_t isaac_a9be990_slot_field_ofs(void);
uint32_t isaac_a9be990_skip_code_zero(void);
uint32_t isaac_a9be990_skip_code_three(void);
uint32_t isaac_a9be990_manager_global_va(void);
uint32_t isaac_a9be990_receiver_ofs(void);
uint32_t isaac_a9be990_va(void);
uint32_t isaac_a9be990_first_ret_va(void);
uint32_t isaac_a9be990_ret_va(void);
uint32_t isaac_a9be990_int3_va(void);
uint32_t isaac_a9be990_body_bytes(void);
uint32_t isaac_a9be990_sites(void);
uint32_t isaac_a9be990_site_va(void);
uint32_t isaac_a9be990_site2_va(void);
uint32_t isaac_a9be990_next_va(void);

/* ===========================================================================
 * ABI v44 -- 0x009be9c0 PURE bool scan laws (see the A9BE9C0 enum block).
 * NO uint8_t scalar params: the byte gate takes uint32_t and re-narrows.
 * ------------------------------------------------------------------------- */
/* 0x009be9c5..0x009be9c7: cmp eax,ecx / je not-found.  FULL dword
   begin==end -> NOT-FOUND (al=0), loop never runs. */
int32_t isaac_a9be9c0_list_empty(uint32_t list_begin, uint32_t list_end);
/* 0x009be9d2..0x009be9d9: cmp byte [edx+0x20a9],0 / jne advance.  RAW
   uint32, LOW byte: flag==0 -> candidate examined; !=0 -> ADVANCE. */
int32_t isaac_a9be9c0_flag20a9_checkable(uint32_t player_flag_20a9);
/* 0x009be9db..0x009be9f2: FULL dword [player+0x184]; test/je ==0 FOUND;
   cmp/je ==3 FOUND; cmp/je ==1 FOUND; cmp/je ==2 FOUND.  FOUND iff code
   IN {0,1,2,3} (test order 0,3,1,2 irrelevant: every arm je-to-FOUND). */
int32_t isaac_a9be9c0_field184_found(uint32_t player_field_184);
/* 0x009be9f4: add eax,4.  32-bit wrap, stride 4. */
uint32_t isaac_a9be9c0_walk_next(uint32_t iter);
/* 0x009be9f7..0x009be9f9: cmp eax,ecx / jne loop.  FULL dword next != end;
   END CAPTURED ONCE pre-loop (ecx @ 0x009be9c2) — NEVER re-read. */
int32_t isaac_a9be9c0_walk_continue(uint32_t next_iter, uint32_t list_end);
uint32_t isaac_a9be9c0_list_begin_ofs(void);
uint32_t isaac_a9be9c0_list_end_ofs(void);
uint32_t isaac_a9be9c0_list_stride(void);
uint32_t isaac_a9be9c0_flag20a9_ofs(void);
uint32_t isaac_a9be9c0_field184_ofs(void);
uint32_t isaac_a9be9c0_found_code_zero(void);
uint32_t isaac_a9be9c0_found_code_one(void);
uint32_t isaac_a9be9c0_found_code_two(void);
uint32_t isaac_a9be9c0_found_code_three(void);
uint32_t isaac_a9be9c0_manager_global_va(void);
uint32_t isaac_a9be9c0_receiver_ofs(void);
uint32_t isaac_a9be9c0_receiver_getter_va(void);
uint32_t isaac_a9be9c0_va(void);
uint32_t isaac_a9be9c0_first_ret_va(void);
uint32_t isaac_a9be9c0_ret_va(void);
uint32_t isaac_a9be9c0_int3_va(void);
uint32_t isaac_a9be9c0_body_bytes(void);
uint32_t isaac_a9be9c0_sites(void);
uint32_t isaac_a9be9c0_site_va(void);
uint32_t isaac_a9be9c0_next_va(void);

/* ===========================================================================
 * ABI v45 -- 0x009bea40 PURE f32-sum walk laws (see the A9BEA40 enum block).
 * NO uint8_t scalar params: the byte gate takes uint32_t and re-narrows;
 * the f32 addend law takes f32 args (Wasm f32 params, no narrowing).
 * ------------------------------------------------------------------------- */
/* 0x009bea52..0x009bea56: cmp dword [player+0x2c],0 / jne advance.  FULL
   dword: == 0 -> candidate may add. */
int32_t isaac_a9bea40_slot_checkable(uint32_t player_field_2c);
/* 0x009bea58..0x009bea5f: cmp byte [player+0x20a9],0 / jne advance.  RAW
   uint32, LOW byte: == 0 -> candidate may add. */
int32_t isaac_a9bea40_flag20a9_checkable(uint32_t player_flag_20a9);
/* 0x009bea61: addss xmm0,[player+0x156c].  f32 round-to-nearest-even per
   add; NaN propagates.  sum is the running f32 accumulator (xmm0). */
float isaac_a9bea40_field156c_add_ss(float sum, float field_156c);
/* 0x009bea69: add eax,4.  32-bit wrap, stride 4. */
uint32_t isaac_a9bea40_walk_next(uint32_t iter);
/* 0x009bea6c..0x009bea6e: cmp eax,ecx / jne loop.  FULL dword next != end;
   END CAPTURED ONCE pre-loop (ecx @ 0x009bea45) — NEVER re-read. */
int32_t isaac_a9bea40_walk_continue(uint32_t next_iter, uint32_t list_end);
uint32_t isaac_a9bea40_list_begin_ofs(void);
uint32_t isaac_a9bea40_list_end_ofs(void);
uint32_t isaac_a9bea40_list_stride(void);
uint32_t isaac_a9bea40_slot_flag_ofs(void);
uint32_t isaac_a9bea40_flag20a9_ofs(void);
uint32_t isaac_a9bea40_field156c_ofs(void);
uint32_t isaac_a9bea40_manager_global_va(void);
uint32_t isaac_a9bea40_receiver_ofs(void);
uint32_t isaac_a9bea40_receiver_getter_va(void);
uint32_t isaac_a9bea40_va(void);
uint32_t isaac_a9bea40_first_ret_va(void);
uint32_t isaac_a9bea40_ret_va(void);
uint32_t isaac_a9bea40_int3_va(void);
uint32_t isaac_a9bea40_body_bytes(void);
uint32_t isaac_a9bea40_sites(void);
uint32_t isaac_a9bea40_site0_va(void);
uint32_t isaac_a9bea40_site1_va(void);
uint32_t isaac_a9bea40_site2_va(void);
uint32_t isaac_a9bea40_next_va(void);

/* ---------------- ABI v46: 0x009bea80 GetTrinketMultiplier ----------------
 * NARROWED: pure slot-flag gates + walk + 32-bit wrap sum around TWO host
 * calls to 0x007cb6e0 (HUD-family count resolver; typed host event).
 * EXACT ZHL: `__thiscall int PlayerManager::GetTrinketMultiplier(int
 * TrinketID);`.  NO uint8_t scalar params: the byte gate takes uint32_t
 * and re-narrows.  Byte-gate laws driven WIDE (0x100/0x1ff/0xffffffff).
 * ------------------------------------------------------------------------- */
/* 0x009beaa3: and edx,0x7fff.  RAW id & 0x7fff (15-bit trinket id). */
uint32_t isaac_gtm_9bea80_id_mask(uint32_t id);
/* 0x009beaa9..0x009beaaf: sub eax,esi / sar eax,2.  SIGNED arithmetic shift
   of the 32-bit-wrapped difference: count = (end - begin) >> 2. */
int32_t isaac_gtm_9bea80_list_count(uint32_t slot_end, uint32_t slot_begin);
/* 0x009beab3..0x009beab5: cmp edx,eax / jge skip.  SIGNED (int32)id_masked
   < (int32)count -> slot lookup may run. */
int32_t isaac_gtm_9bea80_range_gate(uint32_t id_masked, uint32_t count);
/* 0x009beaba..0x009beabc: test eax,eax / je skip.  FULL dword slot != 0. */
int32_t isaac_gtm_9bea80_slot_present(uint32_t slot);
/* 0x009beac4..0x009bead1: and eax,0x80000000 / or eax,0 / jne keep.  FULL
   dword bit31([slot+0xb8]) set -> flag 1 (else 0). */
int32_t isaac_gtm_9bea80_slot_flag(uint32_t flags_b8);
/* 0x009beadc..0x009beadf: cmp esi,[ebx+4] / je tail.  FULL dword
   begin==end -> sum stays 0, loop never runs. */
int32_t isaac_gtm_9bea80_list_empty(uint32_t list_begin, uint32_t list_end);
/* 0x009beae5..0x009beae9: cmp dword [ebx+0x2c],0 / jne advance.  FULL
   dword == 0 -> candidate may call host1. */
int32_t isaac_gtm_9bea80_slot_checkable(uint32_t player_field_2c);
/* 0x009beaf3 / 0x009beb0e: add edi,eax after host 0x7cb6e0.  32-bit wrap. */
uint32_t isaac_gtm_9bea80_sum_add(uint32_t acc, uint32_t host_status);
/* 0x009beaf5..0x009beb04: flag LOW byte != 0 AND twin ptr != 0 (FULL
   dword) -> host2 0x7cb6e0(twin, id) runs. */
int32_t isaac_gtm_9bea80_twin_call_needed(uint32_t flag, uint32_t twin_ptr);
/* 0x009beb17: add esi,4.  32-bit wrap, stride 4. */
uint32_t isaac_gtm_9bea80_walk_next(uint32_t iter);
/* 0x009beb1a..0x009beb1d: cmp esi,[eax+4] / jne loop.  FULL dword next !=
   end; END RE-READ per iteration (this reloaded from the local save
   [esp+0x14] @ 0x009beb13) — matches 9be6b0/9be750, differs from
   a9bea40/9be9c0/9be990 captured-once. */
int32_t isaac_gtm_9bea80_walk_continue(uint32_t next_iter, uint32_t list_end);
/* 0x009beb1f: mov eax,edi -- return the accumulated sum (SIGNED int32
   consumer: cvtdq2ps @ caller 0x007fb90f). */
uint32_t isaac_gtm_9bea80_result_sum(uint32_t sum);
uint32_t isaac_gtm_9bea80_list_begin_ofs(void);
uint32_t isaac_gtm_9bea80_list_end_ofs(void);
uint32_t isaac_gtm_9bea80_list_stride(void);
uint32_t isaac_gtm_9bea80_slot_flag_ofs(void);
uint32_t isaac_gtm_9bea80_twin_ptr_ofs(void);
uint32_t isaac_gtm_9bea80_slot_array_begin_ofs(void);
uint32_t isaac_gtm_9bea80_slot_array_end_ofs(void);
uint32_t isaac_gtm_9bea80_mask(void);
uint32_t isaac_gtm_9bea80_twin_flags_ofs(void);
uint32_t isaac_gtm_9bea80_twin_flag_bit(void);
uint32_t isaac_gtm_9bea80_manager_global_va(void);
uint32_t isaac_gtm_9bea80_game_global_va(void);
uint32_t isaac_gtm_9bea80_receiver_ofs(void);
uint32_t isaac_gtm_9bea80_host_status_va(void);
uint32_t isaac_gtm_9bea80_va(void);
uint32_t isaac_gtm_9bea80_first_ret_va(void);
uint32_t isaac_gtm_9bea80_ret_va(void);
uint32_t isaac_gtm_9bea80_int3_va(void);
uint32_t isaac_gtm_9bea80_body_bytes(void);
uint32_t isaac_gtm_9bea80_sites(void);
uint32_t isaac_gtm_9bea80_next_va(void);

/* ---------------- ABI v47: 0x009beb30 all/any instant-death walk --------
 * NARROWED: pure walk + gates + charge arithmetic + AND/OR byte combine
 * around ONE host leaf 0x007db6b0 (exact-ZHL HasInstantDeathCurse; typed
 * host event this unit).  arg1 = uint32 mode (LOW byte only); return =
 * byte (0/1, or arg&0xff ECHO when no candidate processed); consumers
 * test al,al (BOOL).  No uint8_t scalar params — byte gates take
 * uint32_t and re-narrow in the body. ---- */
/* 0x009beb34: mov bh,byte [ebp+8].  RAW arg & 0xff (LOW byte mode/seed). */
uint32_t isaac_a9beb30_arg_byte(uint32_t arg);
/* 0x009beb74..76: test bh,bh / je OR path.  (arg & 0xff) != 0 -> AND. */
int32_t isaac_a9beb30_mode_and(uint32_t arg);
/* 0x009beb40..42: cmp esi,edi / je ret.  FULL dword begin==end -> ret
   bl (= arg&0xff ECHO, NOT 0/1); consumers test al,al. */
int32_t isaac_a9beb30_list_empty(uint32_t list_begin, uint32_t list_end);
/* 0x009beb46..4a: cmp dword [ecx+0x2c],0 / jne advance.  FULL dword
   [p+0x2c]==0 -> candidate may run the charge/host path. */
int32_t isaac_a9beb30_slot_checkable(uint32_t player_field_2c);
/* 0x009beb4c..53: cmp byte [ecx+0x20a9],0 / jne advance.  RAW uint32,
   LOW byte == 0 -> candidate. */
int32_t isaac_a9beb30_flag20a9_checkable(uint32_t player_field_20a9);
/* 0x009beb55..5b: mov eax,[+0x134c] / add eax,[+0x1344].  32-bit wrap. */
uint32_t isaac_a9beb30_charge_sum(uint32_t field_134c, uint32_t field_1344);
/* 0x009beb61..67: cmp eax,[+0x1340] / jge 0x9beb72.  SIGNED (int32)a >=
   (int32)[p+0x1340] -> al=1 WITHOUT calling the host. */
int32_t isaac_a9beb30_charge_gate(uint32_t charge, uint32_t charge_max);
/* 0x009beb6e..72: test al,al / je skip / mov al,1.  (host_al & 0xff)
   != 0 ? 1 : 0. */
int32_t isaac_a9beb30_host_match(uint32_t host_al);
/* 0x009beb74..8c: mode (LOW byte) != 0 -> AND bl=(bl!=0 && al!=0)?1:0;
   mode == 0 -> OR bl=(bl!=0 || al!=0)?1:0.  bl/al tested LOW bytes. */
int32_t isaac_a9beb30_combine(uint32_t mode, uint32_t bl, uint32_t al);
/* 0x009beb8e: add esi,4.  32-bit wrap, stride 4. */
uint32_t isaac_a9beb30_walk_next(uint32_t iter);
/* 0x009beb91..93: cmp esi,edi / jne loop.  FULL dword next != end; END
   CAPTURED ONCE at entry (edi) — matches a9bea40/9be9c0/9be990, DIFFERS
   from 9bea80/9be6b0/9be750 re-read style. */
int32_t isaac_a9beb30_walk_continue(uint32_t next_iter, uint32_t list_end);
/* 0x009beb97: mov al,bl — return the byte result (0/1, or arg&0xff echo
   when no candidate was processed). */
uint32_t isaac_a9beb30_result_byte(uint32_t bl);
uint32_t isaac_a9beb30_list_begin_ofs(void);
uint32_t isaac_a9beb30_list_end_ofs(void);
uint32_t isaac_a9beb30_list_stride(void);
uint32_t isaac_a9beb30_slot_flag_ofs(void);
uint32_t isaac_a9beb30_flag20a9_ofs(void);
uint32_t isaac_a9beb30_charge_ofs(void);
uint32_t isaac_a9beb30_charge_addend_ofs(void);
uint32_t isaac_a9beb30_charge_max_ofs(void);
uint32_t isaac_a9beb30_manager_global_va(void);
uint32_t isaac_a9beb30_receiver_ofs(void);
uint32_t isaac_a9beb30_host_curse_va(void);
uint32_t isaac_a9beb30_va(void);
uint32_t isaac_a9beb30_first_ret_va(void);
uint32_t isaac_a9beb30_ret_va(void);
uint32_t isaac_a9beb30_int3_va(void);
uint32_t isaac_a9beb30_body_bytes(void);
uint32_t isaac_a9beb30_sites(void);
uint32_t isaac_a9beb30_site0_va(void);
uint32_t isaac_a9beb30_site1_va(void);
uint32_t isaac_a9beb30_site2_va(void);
uint32_t isaac_a9beb30_next_va(void);

/* ---------------- ABI v48: 0x009beba0 avg-player-position walk --------
 * NARROWED (NOT PURE-removed): pure walk + slot/watch/flag20a9 gates +
 * gobj scan + f32 accumulate/average math; the 2 INDIRECT host
 * predicates (vtable slot [[gitem+0x370]+0x14], result byte) and the 2
 * E8 assert calls 0x00a112c0 stay typed host events; the observable
 * stores (*out float2 + cache 0xc9436c/0xc94370 + cacheTs 0xc5c4d4)
 * are POST events — the laws compute the VALUES, the slice applies the
 * stores.  arg1 = uint32 out ptr, arg2 = uint32 mode (LOW byte gate);
 * __thiscall ret 8; no uint8_t scalar params (byte gates take uint32_t
 * and re-narrow in the body). ---- */
/* 0x009beba6: cmp byte [ebp+0xc],0 / 0x009bebb2 je slow.  (arg&0xff)
   != 0 -> fast path (cache eligible). */
int32_t isaac_a9beba0_mode_fast(uint32_t arg);
/* 0x009bebbf..c5: cmp eax,[0xc5c4d4] / jne slow.  FULL dword ts==cacheTs
   -> use cached float2. */
int32_t isaac_a9beba0_cache_fresh(uint32_t gobj_ts, uint32_t cache_ts);
/* 0x009bec12..14 (also 0x009bece8, 0x009bed07..09, 0x009bee22..24):
   sub eax,[esi] / sar eax,2.  SIGNED SAR32(end-begin,2). */
int32_t isaac_a9beba0_list_count(uint32_t list_begin, uint32_t list_end);
/* 0x009bec53..55: cmp ebx,ecx / jae guard.  FULL dword idx < count. */
int32_t isaac_a9beba0_idx_in_range(uint32_t idx, uint32_t count);
/* 0x009bec5c..60: cmp dword [edi+0x2c],0 / jne advance.  FULL dword
   [p+0x2c]==0 -> candidate eligible. */
int32_t isaac_a9beba0_slot_eligible(uint32_t player_field_2c);
/* 0x009bec62..69: cmp dword [edi+0x13c0],0x23 / jne scan.  FULL dword
   != 0x23 -> candidate passes the watch gate. */
int32_t isaac_a9beba0_watch_gate(uint32_t player_field_13c0);
/* 0x009bec6b..72: cmp byte [edi+0x20a9],0 / je advance.  LOW byte
   [p+0x20a9] != 0 -> candidate passes. */
int32_t isaac_a9beba0_flag20a9_gate(uint32_t player_field_20a9);
/* composed eligibility: [p+0x2c]==0 && ([p+0x13c0]!=0x23 ||
   byte[p+0x20a9]!=0) -> gobj scan + accumulate allowed. */
int32_t isaac_a9beba0_player_candidate(uint32_t field_2c,
                                       uint32_t field_13c0,
                                       uint32_t field_20a9);
/* 0x009beca2 / 0x009bed42: cmp [item+0xc],want / je found.  FULL dword
   [gitem+0xc] == want -> scan hit. */
int32_t isaac_a9beba0_lookup_match(uint32_t item_tag_c, uint32_t want);
/* 0x009bec85..87 / 0x009bed27..29: cmp ecx,edx / je accumulate.  FULL
   dword gobj begin==end -> accumulate WITHOUT predicate. */
int32_t isaac_a9beba0_scan_empty(uint32_t list_begin, uint32_t list_end);
/* 0x009becaf..b1 / 0x009bed4f..51: cmp eax,edx / jb loop.  FULL dword
   index < count -> keep scanning. */
int32_t isaac_a9beba0_scan_continue(uint32_t index, uint32_t count);
/* found && !pred -> skip; else accumulate.  found/pred: FULL dword
   nonzero = set. */
int32_t isaac_a9beba0_accum_gate(uint32_t found, uint32_t pred_ok);
/* 0x009bedd5 / 0x009bee00: test al,al.  (host_al & 0xff) != 0 -> pred ok
   (2 INDIRECT host predicates, same vtable slot, byte result). */
int32_t isaac_a9beba0_pred_match(uint32_t host_al);
/* 0x009becbe / 0x009bed61: addss xmm2,[elem+0x33c].  f32 x accumulate. */
float isaac_a9beba0_accum_x(float sum_x, float pos_x);
/* 0x009becb6 / 0x009bed59: addss xmm1,[elem+0x340].  f32 y accumulate. */
float isaac_a9beba0_accum_y(float sum_y, float pos_y);
/* 0x009becc6 / 0x009bed69: inc dword [ebp-8].  count + 1 (32-bit wrap). */
uint32_t isaac_a9beba0_count_inc(uint32_t count);
/* 0x009bed9f..a1: test edx,edx / jle fallback.  SIGNED count > 0 ->
   use average; else fallback to first player pos. */
int32_t isaac_a9beba0_has_avg(uint32_t count);
/* 0x009bedae: divss xmm2,(float)count.  f32 x average. */
float isaac_a9beba0_avg_x(float sum_x, float count);
/* 0x009bedaa: divss xmm1,(float)count.  f32 y average. */
float isaac_a9beba0_avg_y(float sum_y, float count);
/* 0x009bee42: movss xmm2,[player0+0x33c].  f32 fallback x. */
float isaac_a9beba0_fallback_x(float pos_x);
/* 0x009bee4a: movss xmm1,[player0+0x340].  f32 fallback y. */
float isaac_a9beba0_fallback_y(float pos_y);
/* 0x009bec2c..2e / 0x009bee27..29: test eax,eax / jne ok.  FULL dword
   count==0 -> HOST assert 0x00a112c0 ("Gamestate corrupted..."). */
int32_t isaac_a9beba0_assert_needed(uint32_t count);
uint32_t isaac_a9beba0_list_begin_ofs(void);
uint32_t isaac_a9beba0_list_end_ofs(void);
uint32_t isaac_a9beba0_list_stride(void);
uint32_t isaac_a9beba0_second_list_begin_ofs(void);
uint32_t isaac_a9beba0_second_list_end_ofs(void);
uint32_t isaac_a9beba0_slot_flag_ofs(void);
uint32_t isaac_a9beba0_watch_ofs(void);
uint32_t isaac_a9beba0_watch_value(void);
uint32_t isaac_a9beba0_flag20a9_ofs(void);
uint32_t isaac_a9beba0_lookup_key_ofs(void);
uint32_t isaac_a9beba0_lookup_tag_ofs(void);
uint32_t isaac_a9beba0_pos_x_ofs(void);
uint32_t isaac_a9beba0_pos_y_ofs(void);
uint32_t isaac_a9beba0_pred_obj_ofs(void);
uint32_t isaac_a9beba0_pred_slot_ofs(void);
uint32_t isaac_a9beba0_gobj_ts_ofs(void);
uint32_t isaac_a9beba0_gobj_list_begin_ofs(void);
uint32_t isaac_a9beba0_gobj_list_end_ofs(void);
uint32_t isaac_a9beba0_cache_ts_va(void);
uint32_t isaac_a9beba0_cache_x_va(void);
uint32_t isaac_a9beba0_cache_y_va(void);
uint32_t isaac_a9beba0_gobj_global_va(void);
uint32_t isaac_a9beba0_manager_global_va(void);
uint32_t isaac_a9beba0_receiver_ofs(void);
uint32_t isaac_a9beba0_assert_va(void);
uint32_t isaac_a9beba0_assert_msg_va(void);
uint32_t isaac_a9beba0_assert_code(void);
uint32_t isaac_a9beba0_va(void);
uint32_t isaac_a9beba0_first_ret_va(void);
uint32_t isaac_a9beba0_ret_va(void);
uint32_t isaac_a9beba0_int3_va(void);
uint32_t isaac_a9beba0_body_bytes(void);
uint32_t isaac_a9beba0_sites(void);
uint32_t isaac_a9beba0_site0_va(void);
uint32_t isaac_a9beba0_site1_va(void);
uint32_t isaac_a9beba0_site2_va(void);
uint32_t isaac_a9beba0_site3_va(void);
uint32_t isaac_a9beba0_site4_va(void);
uint32_t isaac_a9beba0_site5_va(void);
uint32_t isaac_a9beba0_site6_va(void);
uint32_t isaac_a9beba0_site7_va(void);
uint32_t isaac_a9beba0_site8_va(void);
uint32_t isaac_a9beba0_next_va(void);

/* 0x009bfa82: sar ebx,2.  SIGNED SAR32(end-begin,2); begin/end
   captured once at entry. */
int32_t isaac_a9bfa70_list_count(uint32_t list_begin, uint32_t list_end);
/* 0x009bfad1..d3: cmp ecx,ebx / jb loop.  FULL dword idx < count. */
int32_t isaac_a9bfa70_idx_continue(uint32_t idx, uint32_t count);
/* 0x009bfa93..97: cmp dword [eax+0x2c],0 / jne skip.  FULL dword
   [p+0x2c]==0 -> slot free. */
int32_t isaac_a9bfa70_slot_free(uint32_t player_field_2c);
/* 0x009bfa99..a0: cmp dword [eax+0x3bc],0 / jne skip.  FULL dword
   [p+0x3bc]==0 -> state idle. */
int32_t isaac_a9bfa70_state_idle(uint32_t player_field_3bc);
/* 0x009bfaa2..aa: mov edx,[eax+0x1e68] / test edx,edx / je flagcheck.
   FULL dword link==0 -> flag check (count-eligible). */
int32_t isaac_a9bfa70_link_null(uint32_t link);
/* 0x009bfaac..b5: mov edi,[edx+0x161c] / cmp edi,-1 / je flagcheck.
   FULL dword linkIdx == 0xffffffff -> flag check. */
int32_t isaac_a9bfa70_link_index_neg1(uint32_t link_index);
/* 0x009bfab7..bd: cmp edi,[eax+0x161c] / jge flagcheck.  SIGNED int32
   linkIdx >= ownIdx -> flag check (jge). */
int32_t isaac_a9bfa70_index_ge(uint32_t link_index, uint32_t own_index);
/* 0x009bfabf..c1: cmp edx,eax / jne skip.  FULL dword link == player
   ptr -> flag check. */
int32_t isaac_a9bfa70_link_is_self(uint32_t link, uint32_t player);
/* 0x009bfac3..ca: cmp byte [eax+0x20a9],0 / je skip.  LOW byte
   [p+0x20a9] != 0 -> counted. */
int32_t isaac_a9bfa70_flag20a9_set(uint32_t player_field_20a9);
/* composed `inc esi` gate (0x009bfacc): slot_free && state_idle &&
   (link_null || link_index_neg1 || index_ge || link_is_self) &&
   flag20a9_set — each param is the corresponding LAW VALUE (0/1). */
int32_t isaac_a9bfa70_count_gate(uint32_t slot_free, uint32_t state_idle,
                                 uint32_t link_null,
                                 uint32_t link_index_neg1,
                                 uint32_t index_ge, uint32_t link_is_self,
                                 uint32_t flag20a9_set);
/* 0x009bfacc: inc esi.  res + (gate ? 1 : 0), 32-bit wrap. */
uint32_t isaac_a9bfa70_count_result(uint32_t res, uint32_t gate);
uint32_t isaac_a9bfa70_list_begin_ofs(void);
uint32_t isaac_a9bfa70_list_end_ofs(void);
uint32_t isaac_a9bfa70_list_stride(void);
uint32_t isaac_a9bfa70_slot_flag_ofs(void);
uint32_t isaac_a9bfa70_state_ofs(void);
uint32_t isaac_a9bfa70_link_ofs(void);
uint32_t isaac_a9bfa70_index_ofs(void);
uint32_t isaac_a9bfa70_flag20a9_ofs(void);
uint32_t isaac_a9bfa70_manager_global_va(void);
uint32_t isaac_a9bfa70_receiver_ofs(void);
uint32_t isaac_a9bfa70_va(void);
uint32_t isaac_a9bfa70_first_ret_va(void);
uint32_t isaac_a9bfa70_ret_va(void);
uint32_t isaac_a9bfa70_int3_va(void);
uint32_t isaac_a9bfa70_body_bytes(void);
uint32_t isaac_a9bfa70_sites(void);
uint32_t isaac_a9bfa70_site0_va(void);
uint32_t isaac_a9bfa70_site1_va(void);
uint32_t isaac_a9bfa70_site2_va(void);
uint32_t isaac_a9bfa70_site3_va(void);
uint32_t isaac_a9bfa70_next_va(void);

/* ABI v50 -- PlayerManager::CoopBabiesOnly (0x009ba980): bit-0x10
   challenge-bitset getter.  FULL dword & 0x10 mask; no uint8_t params. */
/* 0x009ba98b: and eax,0x10 / 0x009ba98e: or eax,0 / 0x009ba991: je.
   bit 4 of Game+0x26548 set -> true. */
int32_t isaac_cbo9ba980_flag_bit4_set(uint32_t field_26548);
/* 0x009ba993: mov al,1.  TRUE result 1. */
uint32_t isaac_cbo9ba980_result_true(void);
/* 0x009ba996: xor al,al.  FALSE result 0. */
uint32_t isaac_cbo9ba980_result_false(void);
uint32_t isaac_cbo9ba980_bitset_ofs(void);
uint32_t isaac_cbo9ba980_bitset_mask(void);
uint32_t isaac_cbo9ba980_manager_global_va(void);
uint32_t isaac_cbo9ba980_va(void);
uint32_t isaac_cbo9ba980_first_ret_va(void);
uint32_t isaac_cbo9ba980_ret_va(void);
uint32_t isaac_cbo9ba980_int3_va(void);
uint32_t isaac_cbo9ba980_body_bytes(void);
uint32_t isaac_cbo9ba980_sites(void);
uint32_t isaac_cbo9ba980_site0_va(void);
uint32_t isaac_cbo9ba980_site1_va(void);
uint32_t isaac_cbo9ba980_site2_va(void);
uint32_t isaac_cbo9ba980_next_va(void);

/* ===========================================================================
 * ABI v52 -- 0x009c6110, address-stable PURE out-state decision island
 * (NO exact ZHL; family-named a9c6110).  Band: the 0x9c6000..0x9c7000
 * residual below the GameState band edge 0x9c7000 (PI frontier
 * 0x9c0000..0x9c7000 — W32-F14 residual census).  cdecl, TWO stack args
 * (arg1 = [ebp+8] in-state ptr, arg2 = [ebp+0xc] out-state ptr), plain
 * ret width 0.  0x009c6110..0x009c612e (ret @0x009c612e, SINGLE ret both
 * arms; int3 pad 0x009c612f).  PURE-class: 0 E8 / 0 indirect / 1
 * observable store @0x009c612b (dword [arg2] — out-param write).  ZERO
 * direct rel32 callers (whole-.text E8 channel full census); reachable
 * ONLY as an address-taken function pointer: `push 0x9c6110` @0x009c60c4
 * (inside the callback-picker body 0x009c60a0..0x009c60d8) — passed as
 * the mid arg (a per-element visitor) to the HOST walk 0x00a51c60
 * (0x9c60d1 call), same slot as 0x9c60e0 from the 0x9c6070 twin picker.
 * The walk + picker stay HOST (0xa51c60 E8 + the 0x9c60e0 twin has a host
 * arm 0x9c5f90); the island itself is fully pure.
 *
 * PE law (disasm-009c6110.txt):
 *   ecx = arg2; cmp dword [ecx],1 ; jne 0x9c612d   FULL-DWORD eq gate
 *     arg2[0] != 1 -> RET, NO store (state unchanged)
 *   eax = arg1; xor edx,edx; cmp edx,[eax+8]        flags of 0 - arg1[8]
 *   sbb eax,eax                                     eax = -CF
 *   and eax,0xfffffffe ; add eax,4                  2 (CF=1) or 4 (CF=0)
 *   mov [ecx],eax                                   arg2[0] = 2 or 4
 *   CF = borrow of (0 - arg1[8]) unsigned = (arg1[8] != 0u)
 *   => gate(state) = (state == 1u); value(field8) = (field8 != 0u) ? 2u : 4u;
 *      next_state(state,field8) = gate ? value : state (unchanged).
 *   Both gates FULL-DWORD (zero uint8_t params, zero in-body byte masks).
 *   class: NARROWED (1 out-param store; store VALUE + OCCURRENCE decided
 *   by law; walk/picker host envelopes never re-opened).
 * ---- */
enum {
  ISAAC_A9C6110_VA = 0x009c6110,
  ISAAC_A9C6110_RET_VA = 0x009c612e,        /* SINGLE ret (both arms) */
  ISAAC_A9C6110_FIRST_RET_VA = 0x009c612e,  /* same (no early ret) */
  ISAAC_A9C6110_INT3_VA = 0x009c612f,       /* first int3 pad byte */
  ISAAC_A9C6110_BODY_BYTES = 0x1f,          /* 31; through int3 pad */
  ISAAC_A9C6110_SITES = 0,                  /* direct rel32 E8 census: ZERO */
  ISAAC_A9C6110_POINTER_REF_VA = 0x009c60c4,  /* push imm address-take */
  ISAAC_A9C6110_HOST_WALK_VA = 0x00a51c60,    /* host walk (E8 @0x9c60d1) */
  ISAAC_A9C6110_WALK_OWNER_VA = 0x009c60a0,   /* callback-picker body */
  ISAAC_A9C6110_STATE_OFS = 0,              /* out-param dword (arg2+0) */
  ISAAC_A9C6110_FIELD8_OFS = 8,             /* in-param dword (arg1+8) */
  ISAAC_A9C6110_MATCH_STATE = 1,            /* cmp [ecx],1 FULL-DWORD */
  ISAAC_A9C6110_VALUE_TWO = 2,              /* CF=1 (field8 != 0) arm */
  ISAAC_A9C6110_VALUE_FOUR = 4,             /* CF=0 (field8 == 0) arm */
  ISAAC_A9C6110_NEXT_VA = 0x009c6130        /* SEH ctor (HOST) */
};

/* LANDED 0x9c6110 (v52) laws: FULL-DWORD state==1 gate, the sbb/and/add
 * field8-nonzero value chain (2/4), and the whole-body next_state
 * composition.  All scalar params uint32_t — zero uint8_t, zero byte
 * masks (both gates FULL-DWORD). */
int32_t isaac_a9c6110_gate(uint32_t state);
uint32_t isaac_a9c6110_value(uint32_t field8);
uint32_t isaac_a9c6110_next_state(uint32_t state, uint32_t field8);
uint32_t isaac_a9c6110_field8_ofs(void);
uint32_t isaac_a9c6110_state_ofs(void);
uint32_t isaac_a9c6110_match_state(void);
uint32_t isaac_a9c6110_value_two(void);
uint32_t isaac_a9c6110_value_four(void);
uint32_t isaac_a9c6110_va(void);
uint32_t isaac_a9c6110_first_ret_va(void);
uint32_t isaac_a9c6110_ret_va(void);
uint32_t isaac_a9c6110_int3_va(void);
uint32_t isaac_a9c6110_body_bytes(void);
uint32_t isaac_a9c6110_sites(void);
uint32_t isaac_a9c6110_pointer_ref_va(void);
uint32_t isaac_a9c6110_host_walk_va(void);
uint32_t isaac_a9c6110_walk_owner_va(void);
uint32_t isaac_a9c6110_next_va(void);

uint32_t isaac_process_input_pure_helpers_abi_version(void);



#ifdef __cplusplus
}
#endif
