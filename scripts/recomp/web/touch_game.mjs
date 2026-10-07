// touch_game.mjs -- what the touch layer reads out of the running game.
//
// Read-only views over guest memory (window.isaacGuest: u8/u32 at a guest VA).
// Every offset is bound to tools/isaac-ng.unpacked.exe, SHA-256
// 5129DF723E645DAAEA59514394195F3EA1DCE1671BB0433D724648A845017200, and was
// taken from the instruction that reads it (cited per field). Nothing here
// writes the guest; nothing here decides input. touch_controls.mjs consumes it.

export const GAME_W = 480, GAME_H = 270;

const MANAGER_PTR = 0x00c7169c;   // Manager*: 0x0070367b reads it before the rumble gate
const GAME_PTR = 0x00c71678;      // Game*: ItemConfig::GetCollectible 0x0072fd13
const MENU_PTR = 0x00c72a20;      // MenuManager*: play.mjs readMenuId (cmp [ecx+0x40])

// Manager + options block (options loader 0x00924440 stores into Manager+0x2a33c).
const OPT_HUD_OFFSET = 0x2a388;   // float, 0x009248f0 movss [edi+0x4c]
const OPT_RUMBLE = 0x2a38e;       // byte, 0x0092494f; Game::ShakeScreen tests it at 0x00703689
const OPT_TWIN_BETTER = 0x2a3d4;  // dword, 0x009249a9 (JacobEsauControls)
const ITEM_CONFIG = 0x2a404;      // ItemConfig, lea ecx,[esi+0x2a404] before GetCollectible (0x004362d0)
const ITEM_MAX_CHARGES = 0x74;    // Lua "MaxCharges" property registration 0x00867fcd
const ITEM_CHARGE_TYPE = 0xac;    // Lua "ChargeType" property registration 0x00868034

// Game.
const GAME_PLAYERS = 0x1baa8;     // vector<Player*> begin/end, ShakeScreen 0x00703696
const GAME_SHAKE = 0x26508;       // ShakeScreen 0x00703683 stores its timeout; Update counts it down
const GAME_PAUSE = 0x23a74;       // pause state (play.mjs readTouchState)
const GAME_FRAME = 0x264f8;       // logic frames, 30 a second (play.mjs readReadyState)

// Player.
const P_GOLDEN_BOMB = 0x1361;     // HasGoldenBomb 0x0065cf50
const P_BOMBS = 0x1364;           // GetNumBombs 0x0065cf30
const P_DAMAGE_COOLDOWN = 0x13bc; // GetDamageCooldown 0x0060d080
const P_TYPE = 0x13c0;            // GetPlayerType 0x004253b0
const P_ACTIVES = 0x1580;         // ActiveItemDesc[4], 0x20 each: GetActiveItem 0x0042a2f0
const A_CHARGE = 0x8, A_BATTERY = 0xc, A_SUBCHARGE = 0x10; // 0x00505c80, 0x006dad40, 0x00841cb0
const P_TRINKETS = 0x16c0;        // GetTrinket 0x007a6430
const P_COLLECTIBLES = 0x16c8;    // vector<int>, GetCollectibleCount 0x0075eff0 sums it
const P_POCKETS = 0x17a0;         // PocketItem[4] {id, type}: GetCard 0x007a3c50, GetPill 0x007a3c80

export const POCKET_PILL = 0, POCKET_CARD = 1, POCKET_ACTIVE = 2;
export const PLAYER_JACOB = 19, PLAYER_ESAU = 20, PLAYER_FORGOTTEN = 16, PLAYER_SOUL = 17;

// MenuManager screens (MenuManager+0x40) and the cursors measured against them.
export const MENU = { TITLE: 1, SAVES: 2, GAME: 3, CHARACTER: 5, CHALLENGES: 7, STATS: 9, OPTIONS: 10, MODS: 16, ONLINE: 19 };
const MENU_SCREEN = 0x40;
const MENU_VIEW_Y = 0x48;         // the menu camera; the options list scrolls it 20 px per row
const MENU_SAVE_CURSOR = 0x2f8;   // 0..2 files, 3 the EDIT FILE strip
const MENU_GAME_CURSOR = 0xb94;   // 0 NEW RUN .. 5 OPTIONS, disabled rows skipped
const MENU_OPTIONS_CURSOR = 0xced4;

const f32 = (u) => { const v = new DataView(new ArrayBuffer(4)); v.setUint32(0, u >>> 0, true); return v.getFloat32(0, true); };
const s32 = (u) => u | 0;

function guard(G, fn, fallback) {
  if (!G) return fallback;
  try { return fn(); } catch { return fallback; }
}

export function readOptions(G) {
  return guard(G, () => {
    const mgr = G.u32(MANAGER_PTR);
    if (!mgr) return null;
    const offset = f32(G.u32(mgr + OPT_HUD_OFFSET));
    return {
      rumble: G.u8(mgr + OPT_RUMBLE) !== 0,
      hudOffset: Number.isFinite(offset) ? Math.max(0, Math.min(1, offset)) : 0,
      betterTwins: G.u32(mgr + OPT_TWIN_BETTER) === 1,
    };
  }, null);
}

// The collectible's charge rules, from the game's own ItemConfig.
function itemInfo(G, mgr, id) {
  if (id <= 0) return null;
  const config = mgr + ITEM_CONFIG, begin = G.u32(config), end = G.u32(config + 4);
  if (!begin || end <= begin || id >= (end - begin) / 4) return null;
  const item = G.u32(begin + id * 4);
  if (!item) return null;
  return { max: s32(G.u32(item + ITEM_MAX_CHARGES)), timed: G.u32(item + ITEM_CHARGE_TYPE) === 1, special: G.u32(item + ITEM_CHARGE_TYPE) === 2 };
}

function readActive(G, mgr, player, slot) {
  const desc = player + P_ACTIVES + slot * 0x20, id = s32(G.u32(desc));
  if (id <= 0) return null;
  const info = itemInfo(G, mgr, id) || { max: 0, timed: false, special: false };
  return { id, charge: s32(G.u32(desc + A_CHARGE)), battery: s32(G.u32(desc + A_BATTERY)),
    subcharge: s32(G.u32(desc + A_SUBCHARGE)), ...info };
}

function collectibleTotal(G, player) {
  const begin = G.u32(player + P_COLLECTIBLES), end = G.u32(player + P_COLLECTIBLES + 4);
  if (!begin || end <= begin || end - begin > 0x4000) return 0;
  let total = 0;
  for (let at = begin; at < end; at += 4) total += s32(G.u32(at));
  return total;
}

export function readPlayer(G, mgr, player) {
  const pockets = [];
  for (let i = 0; i < 4; i++) {
    const id = s32(G.u32(player + P_POCKETS + i * 8)), kind = s32(G.u32(player + P_POCKETS + i * 8 + 4));
    pockets.push(id > 0 || kind === POCKET_ACTIVE ? { id, kind } : null);
  }
  return {
    ptr: player,
    type: s32(G.u32(player + P_TYPE)),
    bombs: s32(G.u32(player + P_BOMBS)),
    goldenBomb: G.u8(player + P_GOLDEN_BOMB) !== 0,
    damageCooldown: s32(G.u32(player + P_DAMAGE_COOLDOWN)),
    actives: [0, 1, 2, 3].map((slot) => readActive(G, mgr, player, slot)),
    pockets,
    trinkets: [s32(G.u32(player + P_TRINKETS)), s32(G.u32(player + P_TRINKETS + 4))],
    collectibles: collectibleTotal(G, player),
  };
}

// The run: every player the game lists (co-op babies and twins included),
// the screen-shake timer and the pause state.
export function readRun(G) {
  return guard(G, () => {
    const mgr = G.u32(MANAGER_PTR), game = G.u32(GAME_PTR);
    if (!mgr || !game) return null;
    const begin = G.u32(game + GAME_PLAYERS), end = G.u32(game + GAME_PLAYERS + 4);
    if (!begin || end <= begin || end - begin > 64) return null;
    const players = [];
    for (let at = begin; at < end; at += 4) {
      const player = G.u32(at);
      if (player) players.push(readPlayer(G, mgr, player));
    }
    return { game, players, frame: G.u32(game + GAME_FRAME), shake: s32(G.u32(game + GAME_SHAKE)), pause: G.u32(game + GAME_PAUSE) };
  }, null);
}

export function readMenu(G) {
  return guard(G, () => {
    const menu = G.u32(MENU_PTR);
    if (!menu) return { screen: -1 };
    const screen = s32(G.u32(menu + MENU_SCREEN));
    const out = { screen, viewY: f32(G.u32(menu + MENU_VIEW_Y)) };
    if (screen === MENU.SAVES) out.cursor = s32(G.u32(menu + MENU_SAVE_CURSOR));
    else if (screen === MENU.GAME) out.cursor = s32(G.u32(menu + MENU_GAME_CURSOR));
    else if (screen === MENU.OPTIONS) out.cursor = s32(G.u32(menu + MENU_OPTIONS_CURSOR));
    return out;
  }, { screen: -1 });
}

// ---- haptics --------------------------------------------------------------
// The game's own rumble: Game::ShakeScreen (0x00703670, 223 call sites --
// explosions, stomps, slams) stores its timeout at Game+0x26508 BEFORE testing
// the RUMBLE option, and Player::TakeDamage rumbles each hit; the damage
// cooldown it starts is the visible trace. A rise in either is an event. The
// options' RUMBLE row gates all of it, as it gates the game's controller rumble.
export function createHapticDetector() {
  let last = null;
  return {
    reset() { last = null; },
    // sample: { rumble, shake, players: [{ ptr, damageCooldown, collectibles }] } -> [{ kind, strength }]
    update(sample) {
      const events = [];
      if (!sample) { last = null; return events; }
      if (last) {
        if (sample.shake > last.shake && sample.shake > 0) events.push({ kind: 'shake', strength: sample.shake });
        for (const player of sample.players) {
          const before = last.players.get(player.ptr);
          if (!before) continue;
          if (player.damageCooldown > before.damageCooldown) events.push({ kind: 'damage', strength: player.damageCooldown });
          if (player.collectibles > before.collectibles) events.push({ kind: 'item', strength: player.collectibles - before.collectibles });
        }
      }
      last = { shake: sample.shake, players: new Map(sample.players.map((p) => [p.ptr, p])) };
      return sample.rumble ? events : [];
    },
  };
}

// One vibration pattern for a frame's events: the strongest wins, and a buzz
// already running is not restarted by a weaker one.
export function hapticPattern(events) {
  let ms = 0;
  for (const event of events) {
    if (event.kind === 'damage') ms = Math.max(ms, 90);
    else if (event.kind === 'shake') ms = Math.max(ms, Math.min(160, Math.max(25, event.strength * 6)));
    else if (event.kind === 'item') ms = Math.max(ms, 35);
    else if (event.kind === 'tap') ms = Math.max(ms, 12);
  }
  return ms;
}
