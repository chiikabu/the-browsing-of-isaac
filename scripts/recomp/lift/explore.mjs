// explore.mjs -- a door-aware explorer for the node profile (round 27).
//
// The scripted ISAAC_INPUT timeline is blind: a held D walks the player into
// the east wall at whatever row it started on and never touches a door. This
// brain reads the game's own state out of guest memory every frame (the
// guest arena is identity-mapped into the wasm heap, so a guest VA is a heap
// index) and decides the keys: Enter through the menus until a run exists,
// then, room by room, line up with an open door and walk into it, firing
// while it goes, preferring doors whose target room has not been visited.
// Everything it reads is what the door-touch probe in host_shims_gl.c reads
// (round 26): Game at [0x00c71678]; the current room at Game+0x18300 (width
// +0xc, height +0x10, room index Game+0x18304); RoomTransition at
// Game+0x1b83c (state +0, idle == 0); the player vector at Game+0x1baa8..
// +0x1baac (Entity_Player*, position +0x33c/+0x340); eight door slots at
// room+0x724 (state +0xc, open == 2; grid index +0x24; target room +0x394);
// a door's trigger point is its grid cell centre plus 18 px outward, and the
// check fires within 25 px. Slot & 3 is the wall: 0 west, 1 north, 2 east,
// 3 south.
//
// Nothing here writes guest memory; the only outputs are the Win32 key
// events the host's PeekMessageW polls through Module.isaacInputPoll.

export const GAME_PTR = 0x00c71678;
export const OFF = {
  frame: 0x264f8, room: 0x18300, roomIdx: 0x18304, rt: 0x1b83c,
  playersBegin: 0x1baa8, playersEnd: 0x1baac,
  roomW: 0xc, roomH: 0x10, doors: 0x724,
  doorState: 0xc, doorGrid: 0x24, doorTarget: 0x394,
  posX: 0x33c, posY: 0x340,
};
const OFFX = [-18, 0, 18, 0], OFFY = [0, -18, 0, 18];
// Class vtables (the first dword of every object; from the constructors
// 0x006b8590 and 0x00665cf0): the pooled NPC and tear objects are found in
// the heap by these. Entity fields: type +0x28 (NPC types are 10..0x3ed,
// player 1, tear 2), variant +0x2c, position +0x33c/+0x340.
export const VT_NPC = 0x00b67468, VT_TEAR = 0x00b64eac;
export const ENT = { type: 0x28, variant: 0x2c, posX: 0x33c, posY: 0x340, dead: 0x173 };
// key -> [vk, scancode, extended]; the same table as the node driver's
const KEYS = {
  enter: [0x0D, 0x1C, 0],
  up: [0x26, 0x48, 1], down: [0x28, 0x50, 1], left: [0x25, 0x4B, 1], right: [0x27, 0x4D, 1],
  a: [0x41, 0x1E, 0], d: [0x44, 0x20, 0], s: [0x53, 0x1F, 0], w: [0x57, 0x11, 0],
};
const WALK = ['a', 'w', 'd', 's'];          // by wall: west, north, east, south
const FIRE = ['left', 'up', 'right', 'down'];

function keyEvent(name, down) {
  const [vk, sc, ext] = KEYS[name];
  return [1, vk, sc | (ext << 8), down ? 1 : 0];
}

// mem: { u32(va) -> number, f32(va) -> number, ok(va) -> boolean }
export function makeExplorer(mem, opts = {}) {
  const log = opts.log || (() => {});
  const menuEvery = opts.menuEvery || 40;       // frames between Enters in the menus
  const menuHold = opts.menuHold || 12;          // frames an Enter stays down
  const doorTimeout = opts.doorTimeout || 600;   // frames on one door before giving up on it
  const stuckFrames = opts.stuckFrames || 150;   // no movement while walking -> give up on the door
  const settle = opts.settle || 20;              // frames to wait after a transition
  const align = opts.align || 6;                 // px tolerance when lining up with a door
  const sidestepAfter = opts.sidestepAfter || 30; // frames without movement before stepping aside
  const sidestepFor = opts.sidestepFor || 25;     // frames of each sidestep

  const queue = [];
  const held = new Set();
  let lastFrame = -1;
  let lastEnter = -1e9;
  const visited = new Set();
  const stats = { menuFrames: 0, playFrames: 0, huntFrames: 0, transitions: 0, doorAttempts: 0, doorTimeouts: 0, stuck: 0, firstRunFrame: -1, runs: 0, deaths: 0, sidesteps: 0 };
  let dead = false;
  let cur = null;         // { roomIdx, roomPtr, tried:Set<slot>, door:{slot, tx, ty, target} | null, since, lastPos, lastMove, fireAt }
  let transitionSeen = false;
  let settleUntil = -1;

  const rd = (va) => (mem.ok(va) ? mem.u32(va) : 0);
  const rf = (va) => (mem.ok(va) ? mem.f32(va) : 0);
  const rb = (va) => (mem.ok(va) ? (mem.u8 ? mem.u8(va) : mem.u32(va & ~3) >>> ((va & 3) * 8) & 0xff) : 0);
  // The NPC pool: found once by vtable, re-found when a room turns up none.
  let npcPool = null;
  function liveEnemies(st) {
    if (!mem.findAll) return [];
    if (!npcPool) { npcPool = mem.findAll(VT_NPC, 4096); log(`[explore] NPC pool: ${npcPool.length} object(s) by vtable`); }
    const out = [];
    for (const e of npcPool) {
      const t = rd(e + ENT.type);
      if (t < 10 || t > 1100) continue;
      const x = rf(e + ENT.posX), y = rf(e + ENT.posY);
      if (!(x > 0 && x < 40 + st.w * 40 + 40 && y > 0 && y < 120 + st.h * 40 + 80)) continue;
      if (rb(e + ENT.dead)) continue;
      out.push({ e, t, v: rd(e + ENT.variant), x, y, d: Math.abs(x - st.px) + Math.abs(y - st.py) });
    }
    out.sort((a, b) => a.d - b.d);
    return out;
  }
  function npcCensus(st, frame) {
    if (!npcPool) return;
    const rows = [];
    for (const e of npcPool) {
      const t = rd(e + ENT.type);
      if (t < 10 || t > 1100) continue;
      rows.push(`${e.toString(16)}:t${t}.${rd(e + ENT.variant)} (${rf(e + ENT.posX).toFixed(0)},${rf(e + ENT.posY).toFixed(0)}) dead=${rb(e + ENT.dead)} f170=${rd(e + 0x170).toString(16)} f10=${rd(e + 0x10).toString(16)}`);
      if (rows.length >= 24) break;
    }
    log(`[explore] frame ${frame}: NPC census in room ${st.roomIdx} (${rows.length} typed of ${npcPool.length}): ${rows.join(' | ')}`);
  }

  function press(name) { if (!held.has(name)) { held.add(name); queue.push(keyEvent(name, true)); } }
  function release(name) { if (held.has(name)) { held.delete(name); queue.push(keyEvent(name, false)); } }
  function releaseAll() { for (const k of [...held]) release(k); }
  function tap(name, frame, hold) { press(name); pending.push({ frame: frame + hold, name }); }
  const pending = [];     // timed releases

  function readState() {
    const game = rd(GAME_PTR);
    if (!game) return null;
    const room = rd(game + OFF.room);
    const pb = rd(game + OFF.playersBegin), pe = rd(game + OFF.playersEnd);
    const player = (pb && pe > pb) ? rd(pb) : 0;
    if (!room || !player) return { game, inGame: false };
    const w = rd(room + OFF.roomW), h = rd(room + OFF.roomH);
    const doors = [];
    for (let slot = 0; slot < 8; slot++) {
      const d = rd(room + OFF.doors + 4 * slot);
      if (!d) continue;
      const gi = rd(d + OFF.doorGrid);
      doors.push({
        slot, state: rd(d + OFF.doorState), target: rd(d + OFF.doorTarget) | 0,
        tx: (gi % w) * 40 + 40 + OFFX[slot & 3], ty: Math.floor(gi / w) * 40 + 120 + OFFY[slot & 3],
      });
    }
    return {
      game, inGame: w > 0 && w < 64 && h > 0 && h < 64,
      roomIdx: rd(game + OFF.roomIdx) | 0, roomPtr: room, w, h, doors,
      rtState: rd(game + OFF.rt), px: rf(player + OFF.posX), py: rf(player + OFF.posY),
      playerDead: rb(player + ENT.dead),
    };
  }

  // Debug aid (opts.scanEntityList): look for the room's entity list inside
  // the Game object -- an (array, capacity, count) triple at +0x24/+0x28/+0x2c
  // of some base whose elements carry an entity type at +0x28 and a
  // position at +0x33c/+0x340 -- and print every candidate with a census of
  // the element types. Read-only.
  function scanEntityList(game) {
    const el = game + 0x1baa8;   // the ESI EntityList::Reset is called with (sub_0090d3f0)
    const fields = [];
    for (let off = 0; off <= 0xa0; off += 4) fields.push(`+${off.toString(16)}=${rd(el + off).toString(16)}`);
    log(`[explore] EntityList at Game+0x1baa8: ${fields.join(' ')}`);
    for (const off of [0x24, 0x34, 0x44, 0x54, 0x64, 0x74, 0x84, 0x94]) {
      const arr = rd(el + off), cnt = rd(el + off + 8);
      if (!mem.ok(arr) || cnt > 4096) continue;
      const types = {};
      for (let i = 0; i < Math.min(cnt, 512); i++) {
        const e = rd(arr + 4 * i);
        const t = mem.ok(e) && mem.ok(e + 0x400) ? rd(e + 0x28) : -1;
        types[t] = (types[t] || 0) + 1;
      }
      log(`[explore]   list +0x${off.toString(16)}: array 0x${arr.toString(16)} cap ${rd(el + off + 4)} count ${cnt} types ${JSON.stringify(types)}`);
    }
    for (let base = game; base < game + 0x27000; base += 4) {
      const arr = rd(base + 0x24), cap = rd(base + 0x28), cnt = rd(base + 0x2c);
      if (!mem.ok(arr) || cap < 8 || cap > 8192 || cnt > cap || cnt < 1) continue;
      const types = {};
      let good = 0;
      const n = Math.min(cnt, 64);
      for (let i = 0; i < n; i++) {
        const e = rd(arr + 4 * i);
        if (!mem.ok(e) || !mem.ok(e + 0x400)) continue;
        const t = rd(e + 0x28), x = rf(e + 0x33c), y = rf(e + 0x340);
        if (t < 1 || t > 1100 || !(x > -100 && x < 3000 && y > -100 && y < 3000)) continue;
        types[t] = (types[t] || 0) + 1; good++;
      }
      if (good * 2 >= n && good >= 1) log(`[explore] entity-list candidate: Game+0x${(base - game).toString(16)} array 0x${arr.toString(16)} cap ${cap} count ${cnt} valid ${good}/${n} types ${JSON.stringify(types)}`);
    }
  }

  function chooseDoor(st) {
    const open = st.doors.filter((d) => d.state === 2 && !cur.tried.has(d.slot));
    if (!open.length) return null;
    const fresh = open.filter((d) => !visited.has(d.target));
    const pick = (fresh.length ? fresh : open)[0];
    stats.doorAttempts++;
    return pick;
  }

  function tick(frame, st) {
    // timed releases (menu taps)
    for (let i = pending.length - 1; i >= 0; i--) {
      if (pending[i].frame <= frame) { release(pending[i].name); pending.splice(i, 1); }
    }
    if (!st || !st.inGame || st.playerDead) {
      // menus, or the game-over screen after a death: Enter through it; the
      // next run starts a fresh room census
      if (st && st.inGame && st.playerDead && !dead) {
        dead = true; stats.deaths++; releaseAll();
        log(`[explore] frame ${frame}: the player died in room ${st.roomIdx} (run ${stats.runs}); pressing on`);
      }
      stats.menuFrames++;
      if (frame - lastEnter >= menuEvery) { tap('enter', frame, menuHold); lastEnter = frame; }
      return;
    }
    if (dead) { dead = false; cur = null; stats.runs++; log(`[explore] frame ${frame}: run ${stats.runs} started (room ${st.roomIdx}, ${st.w}x${st.h})`); }
    if (stats.firstRunFrame < 0) {
      stats.firstRunFrame = frame; stats.runs = 1; log(`[explore] run started at frame ${frame} (room ${st.roomIdx}, ${st.w}x${st.h})`);
      if (opts.scanEntityList) scanEntityList(st.game);
    }
    stats.playFrames++;
    if (st.rtState !== 0) {                 // a transition is running: hands off
      if (!transitionSeen) { transitionSeen = true; stats.transitions++; releaseAll(); }
      return;
    }
    if (transitionSeen) { transitionSeen = false; settleUntil = frame + settle; }
    if (!cur || cur.roomPtr !== st.roomPtr || cur.roomIdx !== st.roomIdx) {
      if (cur) log(`[explore] frame ${frame}: room ${cur.roomIdx} -> ${st.roomIdx} (${st.w}x${st.h}), doors open ${st.doors.filter((d) => d.state === 2).length}/${st.doors.length}`);
      visited.add(st.roomIdx);
      cur = { roomIdx: st.roomIdx, roomPtr: st.roomPtr, tried: new Set(), door: null, since: frame, idleSince: -1, lastPos: [st.px, st.py], lastMove: frame, fireAt: frame, aim: -1 };
      releaseAll();
    }
    if (frame < settleUntil) return;
    if (!cur.door) {
      cur.door = chooseDoor(st);
      if (cur.door) {
        cur.since = frame; cur.lastMove = frame; cur.lastPos = [st.px, st.py]; cur.idleSince = -1;
        log(`[explore] frame ${frame}: room ${st.roomIdx} -> door slot ${cur.door.slot} at (${cur.door.tx}, ${cur.door.ty}) target ${cur.door.target}${visited.has(cur.door.target) ? ' (seen)' : ''}`);
      } else {
        if (cur.idleSince < 0) {
          cur.idleSince = frame;
          log(`[explore] frame ${frame}: room ${st.roomIdx} has no untried open door (${st.doors.map((d) => d.slot + ':' + d.state).join(' ')}); patrolling and firing`);
        }
      }
    }
    // hunting (doors closed): the nearest live NPC sets the aim before the
    // fire tap below and the chase after it
    const enemies = cur.door ? [] : liveEnemies(st);
    if (enemies.length) {
      const n = enemies[0], dx = n.x - st.px, dy = n.y - st.py;
      cur.aim = Math.abs(dx) >= Math.abs(dy) ? (dx > 0 ? 2 : 0) : (dy > 0 ? 3 : 1);
    } else cur.aim = -1;
    // fire: an arrow tap every 10 frames; toward the door while walking, at
    // the hunted enemy when there is one, rotating otherwise
    if (frame >= cur.fireAt) {
      const dir = cur.door ? (cur.door.slot & 3) : (cur.aim >= 0 ? cur.aim : (Math.floor(frame / 10) & 3));
      tap(FIRE[dir], frame, 4);
      cur.fireAt = frame + 10;
    }
    if (!cur.door) {
      // Closed doors mean enemies. Hunt: chase the nearest live NPC and fire
      // along the axis it is farther on; when none is known, patrol (a new
      // walk direction every 45 frames) so the tears reach something. Doors
      // that reopen are picked up on the next frame; tried doors are
      // forgotten periodically.
      const idle = frame - cur.idleSince;
      if (idle === 1 || (idle > 0 && idle % 600 === 0)) {
        log(`[explore] frame ${frame}: room ${st.roomIdx} idle ${idle} frames, player at (${st.px.toFixed(0)}, ${st.py.toFixed(0)}) dead=${st.playerDead}, doors ${st.doors.map((d) => d.slot + ':' + d.state).join(' ')}, enemies ${enemies.length}${enemies.length ? ' nearest t' + enemies[0].t + ' at (' + enemies[0].x.toFixed(0) + ',' + enemies[0].y.toFixed(0) + ')' : ''}`);
        if (opts.census) npcCensus(st, frame);
      }
      let want;
      if (enemies.length) {
        const n = enemies[0], dx = n.x - st.px, dy = n.y - st.py;
        const horiz = Math.abs(dx) >= Math.abs(dy);
        // walk along the other axis to line up, alternating when the lined-up
        // axis is blocked (rocks): every 60 frames swap the roles
        const swap = Math.floor(idle / 60) & 1;
        const lineUp = horiz !== !!swap;
        if (lineUp) want = Math.abs(dy) > 12 ? (dy > 0 ? 's' : 'w') : (dx > 0 ? 'd' : 'a');
        else want = Math.abs(dx) > 12 ? (dx > 0 ? 'd' : 'a') : (dy > 0 ? 's' : 'w');
        stats.huntFrames++;
      } else {
        want = WALK[Math.floor(idle / 45) & 3];
      }
      for (const k of WALK) if (k !== want) release(k);
      press(want);
      if (idle > 0 && idle % doorTimeout === 0) cur.tried.clear();
      return;
    }
    const d = cur.door, side = d.slot & 3;
    const moved = Math.abs(st.px - cur.lastPos[0]) + Math.abs(st.py - cur.lastPos[1]) > 0.5;
    if (moved) { cur.lastMove = frame; cur.lastPos = [st.px, st.py]; }
    const giveUp = (frame - cur.since > doorTimeout) || (frame - cur.lastMove > stuckFrames);
    if (giveUp) {
      if (frame - cur.since > doorTimeout) stats.doorTimeouts++; else stats.stuck++;
      log(`[explore] frame ${frame}: giving up on door ${d.slot} (${frame - cur.since} frames, player at ${st.px.toFixed(0)},${st.py.toFixed(0)})`);
      cur.tried.add(d.slot); cur.door = null; releaseAll();
      return;
    }
    // line up on the axis along the wall, then walk through
    let want;
    if (side === 0 || side === 2) {          // west / east door: match y, then walk x
      if (st.py > d.ty + align) want = 'w'; else if (st.py < d.ty - align) want = 's'; else want = WALK[side];
    } else {                                 // north / south door: match x, then walk y
      if (st.px > d.tx + align) want = 'a'; else if (st.px < d.tx - align) want = 'd'; else want = WALK[side];
    }
    // an obstacle (a rock) in the way: after `sidestepAfter` frames without
    // movement, step sideways for `sidestepFor` frames, alternating sides
    const stalled = frame - cur.lastMove;
    if (stalled >= sidestepAfter) {
      const n = Math.floor((stalled - sidestepAfter) / sidestepFor);
      if ((stalled - sidestepAfter) % sidestepFor < sidestepFor) {
        const perp = (want === 'a' || want === 'd') ? ['w', 's'] : ['a', 'd'];
        want = perp[n & 1];
        if ((stalled - sidestepAfter) % sidestepFor === 0) stats.sidesteps++;
      }
    }
    for (const k of WALK) if (k !== want) release(k);
    press(want);
  }

  return {
    // Module.isaacInputPoll contract: fill out[0..3] with one event, return 1; or 0.
    poll(frame, out, heap32) {
      if (frame !== lastFrame) { lastFrame = frame; tick(frame, readState()); }
      if (!queue.length) return 0;
      heap32.set(queue.shift(), out >> 2);
      return 1;
    },
    report() {
      return { ...stats, roomsVisited: visited.size, rooms: [...visited] };
    },
  };
}
