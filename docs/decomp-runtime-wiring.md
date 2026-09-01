# Live frame-path wiring: Input → Update → Render → paint

How the browser frame loop drives the native slices, what each seam is allowed
to claim, and how to verify the whole thing end to end. Companion to
`docs/decomp-port.md` (translation state) and
`section-notes/hybrid-render-input-plan/` (the investigation this implements).

**Scope discipline.** This document describes *wiring*, not translation. No
boundary was removed and no opaque count changed by anything described here.
Two of the seams below are explicitly host-side models standing in for guest
memory the port cannot yet supply; they are labelled as such in-source and must
never be reported as recovered PE behaviour.

## Frame order

`web/js/app.js` rAF callback, PE order Input → Update → Render:

```js
extraRuntime = inputBridge.toRuntimeInputs();   // 1. input  -> runtime inputs
statePatch   = inputBridge.toStatePatch();      //            -> sparse deltas
nativeBridge.tick(time, extraRuntime, statePatch);  // 2. native Game::Update
inputBridge.consumeEdges();                     // 2a. drain this tick's edges
/* phase from menuState23a74, not from having painted */
glHost.beginFrame({ gameObject });              // 3. native Game::Render
nativeBridge.renderTick(time);                  //    -> typed host events -> GL
menuScene.update(state); glHost.submit(menuScene.commands());
painted = !!result && glHost.endFrame() > 0;
if (!painted) Module._isaac_tick(time);         // 4. host paint stub fallback
```

`usesX86Emulation` stays `false` throughout; no seam here can re-enter the PE.

**The GL frame must be opened before step 2, not before step 3.** The bridge
drives the render tick from *inside* `tick()` (`web/js/native-update-bridge.js`:
"tick() drives it so app.js gets per-frame rendering for free; an explicit
`renderTick(time)` from the same frame returns the cached result"). So the render
host events are emitted during the Update step. Opening the GL frame afterwards
resets the command list and silently discards them: the host still counts its
clears, `endFrame()` returns 0 on a freshly-opened empty frame, `painted` stays
false, and the paint stub clears over a frame the native path had already drawn.

The symptom is diagnostic-worthy because nothing throws and no log line appears:
`stats.frames` runs at exactly **2×** the rAF frame count (the handler auto-opens
a frame at the first event, then `beginFrame` opens a second), `clears` climbs
while `drawCalls` stays 0. If those three counters ever disagree that way again,
the frame lifecycle is inverted.

## The five seams

| Seam | File | What it is |
|------|------|------------|
| Update tick | `web/js/native-update-bridge.js` | Loads the Update slice (ABI 67), owns a `Uint8Array(0x68d70)` Game buffer, hybrid capture → step → residual hosts → apply |
| Render tick | same bridge + `scripts/decomp/frame-render-root.mjs` | Loads the Render root slice (ABI 4) and drives its 28 continuations on its **own** `0x3bb20` buffer — the render root is `*(Game+0x18300)`, a different object (see below) |
| Game state | `scripts/decomp/game-state-snapshot.mjs` | Seeds both buffers from a capture taken out of a live run of the original binary |
| Input | `scripts/decomp/frame-input-bridge.mjs` | **Host-side input bridge.** Key edges → menu-lane runtime inputs + sparse state deltas |
| Render host bodies | `web/js/render-host-gl.js` | The render slice's 31 typed host kinds → real WebGL2 draws |
| Menu presentation | `web/js/menu-scene.js` | Real mounted `titlemenu.anm2` + BMFont pages composed from native menu state |

### `session.tick(extraRuntime, statePatch)`

`createNativeUpdateSession` re-stamps every sparse field from its own
`sparseState` at the *top* of each tick, so writing sparse bytes into the live
Game buffer is overwritten before the slice ever captures them — a silent
no-op. `statePatch` is merged **before** that write and rejects unknown field
names loudly. Pinned by `tests/decomp-frame-path-state-patch.test.js`; the
ordering mutant (merge after the write) kills 4 of its 6 assertions.

### Room-side state is host-owned (Update ABI v67)

35 of the Update slice's 127 state members have no Game-object offset — they
live in the **Room** object (`Room+0x8`, `Room+0x11ec`, `*(Room+4)+0x44`, …),
which the hybrid path does not model. Before v67, `capture` left those members
carrying the previous tick's struct values, so `createNativeUpdateSession`
silently DISCARDED caller-supplied Room state (33 of 36 sentinels came back
zero) and the 7-event room trigger-clear chain fired once per **Wasm module
instance** rather than per RoomDescriptor. The PE keys it to `[desc+0x44]`,
re-tested live every frame (VA `0x00804113` / `0x0080427f`).

Since v67, capture assigns every member — Game-homed from the buffer,
host-owned pinned to 0 — and the session threads its own sparse state through
`overlayHostOwnedState` before the state write. Room state therefore persists
per **session**: tick N's outputs feed tick N+1, and a room change arrives as a
`statePatch`. The frozen contract (name, PE address, size, direction, mid-tick
recapture point for all 35) is `HOST_OWNED_STATE_CONTRACT` in
`scripts/decomp/game-update-model.mjs`.

Default all-zero boot tick 1 is byte-identical to pre-v67 — that is PE truth
for a zeroed descriptor — so the shipped boot's visible events did not change.
What changed: warm reloads are deterministic, and a seeded capture now drives
the trigger gates from real state.

Related, same version: the F4 Pass A → Pass B gate now derives its list count
from `Game+0x1bbe0`/`+0x1bbe4` (**read together, one instant** — the append can
reallocate and move both) through the PE's **signed** magic division, and
recaptures **only** on the path where the Pass A host actually ran. Before this,
the driver supplied the pre-Pass-A count and the port DROPPED a Pass B the
original runs — wrong-state, and live in the browser.

### The render root is NOT the Game object

Both PE callers of the render shell do:

```
mov edi,[0xc71678]        ; g_Game
mov ecx,[edi+0x18300]     ; <- the render receiver
call 0x0080ea80           ; VA 0x00831630 and 0x00831e37
```

So `gridW@0x0c`, `gridH@0x10`, `camera@0x1204`, `entityArray@0x125c` and
`entityCount@0x1264` belong to `*(Game+0x18300)` — a distinct object that
merely happens to be smaller (`0x3bb20`) than the Game object (`0x68d70`).

An earlier version of this wiring passed the Update session's Game buffer to
the render session on the reasoning that "the smaller min-size means one buffer
serves both". That reads every render field as zero and is **byte-for-byte
indistinguishable from an empty scene**, so it looked like a correctly-rendered
empty room rather than a bug. Three assertions across the wiring tests pinned
that behaviour and had to be inverted. The same mistake is easy to repeat in
`glHost.beginFrame({ gameObject })` — the GL host reads render-root offsets too.

`g_Game` itself is at VA `0x00c71678`: `FUN_00753cf0` is three instructions
(`mov eax,[0xc71678]` / `add eax,0x23a74` / `ret`) returning the tracked
`menuState23a74`, and the constructor site does `push 0x68e88` → `operator new`
→ `Game::Game` → `mov [0xc71678],eax`.

### Real game state comes from a live capture

`output/decomp/gamestate/<sha12>/` holds `game-object-{inrun,menu}.bin`
(`0x68d70`) and `render-root-{inrun,menu}.bin` (`0x3bb20`), dumped with
ReadProcessMemory from a live run (`scripts/decomp/capture-game-state.py`).
Binary-derived, gitignored, never committed. The page boots to the zero-buffer
behaviour when the capture is absent; `?state=menu` selects the other label.

Seeding the raw bytes is not sufficient on the Update side: `session.tick()`
stamps sparse fields from its own state *before* the hybrid capture, so the
seed must also arrive as a first-tick `statePatch` (filtered to the session's
own keys — `readSparseFieldsFromGameObject` returns a superset and an unknown
key throws).

The entity and grid loops need per-iteration arrays that live *outside* the
captured object, so the driver closes both loops when none are supplied.
`createSnapshotRenderRecapture()` rebuilds them from the capture:
`entityBaseSeq[i]` = `[renderRoot+0x125c]` re-read per iteration (the slice adds
`i*4` itself, yielding the pushed slot address — never fold one base across the
loop), `entityCountSeq[i]` = `[renderRoot+0x1264]`, and `gridSlots` = the inline
dword array at `renderRoot+0x24`.

Measured, one frame, in-run capture (Basement start room):

| buffer | recapture | steps | host events | ENTITY | GRID |
|---|---|---|---|---|---|
| zeros | default | 14 | 9 | 0 | — |
| real render root | default | 14 | 9 | 0 | — |
| real render root | snapshot | 14 | **13** | **3** | **repeat 44** |

In the browser that is 135 grid cells and 44 drawn slots per frame (15×9 room),
3 entity draws per frame, and the captured fade colour — versus a black frame
on zeros.

Note: the ASLR bit must be cleared to reproduce a capture. The unpacked binary
carries a bogus `.reloc` HIGHLOW at RVA `0x00531148` that lands on code; when
the image is actually relocated it rewrites `xor eax,eax` at VA `0x0093114a`
into a faulting instruction and the process dies at startup.

### Render runtime inputs are a host-side guest-memory model

The render slice reads 62 absolute guest addresses (manager option bytes, DAT
globals, RT stack). There is no live PE memory on this path, so the browser
supplies them via `setRenderInputs`. Measured on a browser-identical zeroed
buffer:

| `option2a3c3` | steps | host events | kinds |
|---|---|---|---|
| `0` (all-zero default) | 1 | 1 | `21` (epilog only — nothing to draw) |
| `1` (browser sets this) | 14 | 9 | `24, 25, 1, 2, 3, 27, 28, 8, 21` |

With the gate closed the render path can never paint, and the frame silently
falls back to the host stub forever. This is a **model, not recovered
behaviour** — the honest fix is a live PE sparse bridge.

### The menu-open gate has a non-keyboard conjunct

`native/decomp/game_update_slice.cpp:1754` — the menu-open gate is
`guard == 0 && enable != 0 && global_range_byte_length == 0`. The third
conjunct is a real `uint32(end - begin)` read of
`*0x00c7169c + [0x4b3d8, 0x4b3dc)` and is **not keyboard-derived**. With the
browser default of `8`, driving guard/enable alone produces a tick whose entire
`events` and `state` are deep-equal to the no-key baseline. The input bridge
therefore also drives that field to 0 while the menu is latched open, marked as
a bridge convention replacing another synthetic default (the `8` is itself not
captured from the PE). `describeMenuOpenGate()` reports per-conjunct
`ownedByBridge` so this stays visible.

### Entity draw hosts are a count, not an emission

`isaac_game_render_slice_resume_entity` runs the whole PE entity loop *inside*
the resume and reports it in `events.entity_render_calls`;
`HOST_ENTITY_806C20` is emitted **only** on sample exhaustion
(`native/decomp/game_render_slice.cpp:526-528`, `545-547`) as a *request* for
more iterations, not a completed call. A driver that only forwards
`events.host_kind` therefore drops every `Game::Render` call silently. The
driver expands the count into one event per call, carrying the per-iteration
slot address re-read at `VA 0x0080eebc` (a folded base gives `0x1004` where the
PE gives `0x2004` — pinned by test).

The loop bound is the **re-read** count (`VA 0x0080eecb`,
`index + 1 < count_after`), not the entry count.

## Phase reporting

`isaac_host.cpp` warns against faking playable phases from host paint. Phase is
therefore derived from the Update slice's own sparse `menuState23a74`
(`!= 0` → phase 2 `main_menu`), never from the fact that a frame painted.

## What is NOT claimed

- The menu's *UI bodies* (`0x009b7680`, `0x009b6840`, `0x0098dba0`) are still
  host actions. Only the menu decision gates, continuations and menu-Aux
  `_Tree::_Erase` are native.
- `menu-scene.js` is a presentation layer. The selection column geometry, the
  prompt panel layout and the anm2→internal-pixel scale are labelled
  presentation conventions; only the *decision* to show them is native. No game
  menu copy is reproduced or invented — its text is a diagnostic of native
  state rendered in the real font.
- Several render host kinds draw documented placeholder quads because the event
  carries no geometry (entity position, anim position, vtable pair targets).
  The draw *count* and ordering are real; the pixels are not claimed to match.
- No FPS claim. No boundary was removed.

## Verify

```bash
node scripts/verify-native-frame-path.mjs
```

Real Chromium against the live page (`npm run serve` first). Reports each check
independently and writes `output/decomp/frame-path-verification/verification.json`
plus before/after screenshots. Checks: native-wasm selected, no PE, both slices
loaded at model ABI, Update ticking, GL draws issued, canvas filled by pixel
readback, Escape opening the native menu lane, phase following menu state.

The page mounts only the file set the native frame path reads — the PE plus
fonts and UI art, 407 of 11245 files — so boot is seconds rather than minutes.
`?fullmount=1` mounts everything; nothing on the native path needs it today.

Last run: **16/16 required checks passed** — native-wasm selected, `pe=0`,
Update ABI 67 ticking, Render ABI 4 loaded, 42 GL draws over 42 frames, Escape
moving `menuState23a74` 0 → 1, phase 1 → 2, 12 menu draw commands from the real
assets (4 textures, 0 missing), 384 submitted draws, `~56 fps`.

One informational check reports the canvas as black with the menu **closed**.
That is correct native output, not a regression: the JS-owned Game buffer is
zeroed, so the fade colour is black. The colourful frame it replaced was the
host paint stub. Required pixel-fill is asserted with the menu open, where the
real title art must be visible.

Unit suites for the seams:

```bash
node --test tests/decomp-frame-path-state-patch.test.js tests/decomp-frame-path-render-wiring.test.js tests/decomp-frame-render-root.test.js tests/decomp-frame-input-bridge.test.js tests/render-host-gl.test.js tests/menu-scene.test.js
```
