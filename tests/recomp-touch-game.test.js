import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createAnalogMove } from '../scripts/recomp/web/touch_input.mjs';
import {
  readOptions, readRun, readMenu, createHapticDetector, hapticPattern, MENU, POCKET_CARD, POCKET_PILL, POCKET_ACTIVE,
} from '../scripts/recomp/web/touch_game.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

// ---- any-angle movement through eight keys ------------------------------------
const VEC = { d: [1, 0], a: [-1, 0], s: [0, 1], w: [0, -1] };
function direction(keys) {
  let x = 0, y = 0;
  for (const key of keys) { x += VEC[key][0]; y += VEC[key][1]; }
  const n = Math.hypot(x, y);
  return n ? [x / n, y / n] : [0, 0];
}

test('analog movement holds the eight exact directions without alternating', () => {
  const move = createAnalogMove();
  for (let i = 0; i < 8; i++) {
    const angle = i * Math.PI / 4, first = move.step(Math.cos(angle), Math.sin(angle)).sort();
    for (let frame = 0; frame < 20; frame++) assert.deepEqual(move.step(Math.cos(angle), Math.sin(angle)).sort(), first);
    assert.equal(first.length, i % 2 ? 2 : 1);
  }
});

test('analog movement splits frames between neighbouring directions in proportion to the angle', () => {
  for (const degrees of [10, 22.5, 30, 100, 200, 341]) {
    const move = createAnalogMove(), angle = degrees * Math.PI / 180;
    const sector = Math.floor(degrees / 45), frac = degrees / 45 - sector;
    let high = 0;
    const frames = 360;
    for (let frame = 0; frame < frames; frame++) {
      const keys = move.step(Math.cos(angle), Math.sin(angle));
      const [x, y] = direction(keys), got = (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
      if (Math.abs(got - ((sector + 1) * 45) % 360) < 1) high++;
      else assert.ok(Math.abs(got - sector * 45) < 1, `${degrees} deg chose ${keys}`);
    }
    // The running error stays under one frame: the split is exact to a frame.
    assert.ok(Math.abs(high - frac * frames) <= 1, `${degrees} deg: ${high} of ${frames} high frames`);
  }
});

test('analog movement eases a damped body onto the stick angle', () => {
  // The player's velocity eases toward the sampled direction every logic frame.
  for (const degrees of [15, 22.5, 37, 120, 290]) {
    const move = createAnalogMove(), angle = degrees * Math.PI / 180;
    let vx = 0, vy = 0;
    const angles = [];
    for (let frame = 0; frame < 120; frame++) {
      const [x, y] = direction(move.step(Math.cos(angle), Math.sin(angle)));
      vx = vx * 0.7 + x * 0.3; vy = vy * 0.7 + y * 0.3;
      if (frame >= 30) angles.push(Math.atan2(vy, vx));
    }
    const mean = Math.atan2(angles.reduce((s, a) => s + Math.sin(a), 0), angles.reduce((s, a) => s + Math.cos(a), 0));
    const error = Math.abs(((mean - angle) * 180 / Math.PI + 540) % 360 - 180);
    assert.ok(error < 1.5, `${degrees} deg drifted ${error.toFixed(2)} deg`);
    // An 8-way snap would sit up to 22.5 degrees off; the wobble stays small.
    const wobble = Math.max(...angles.map((a) => Math.abs(((a - angle) * 180 / Math.PI + 540) % 360 - 180)));
    assert.ok(wobble < 12, `${degrees} deg wobbled ${wobble.toFixed(2)} deg`);
  }
});

test('analog movement has a radial dead zone and snaps near-exact angles', () => {
  const move = createAnalogMove();
  assert.deepEqual(move.step(0, 0), []);
  assert.deepEqual(move.step(0.12, -0.12), []);
  assert.deepEqual(move.step(0.19, 0), ['d']);
  const nearly = 2 * Math.PI / 180;
  for (let frame = 0; frame < 90; frame++) assert.deepEqual(move.step(Math.cos(nearly), Math.sin(nearly)), ['d']);
});

// ---- guest memory -----------------------------------------------------------------
function memory() {
  const bytes = new Map();
  const G = {
    u8: (va) => bytes.get(va >>> 0) || 0,
    u32: (va) => ((G.u8(va) | (G.u8(va + 1) << 8) | (G.u8(va + 2) << 16) | (G.u8(va + 3) << 24)) >>> 0),
  };
  const put = (va, value) => { for (let i = 0; i < 4; i++) bytes.set(va + i, (value >>> (8 * i)) & 0xff); };
  const putByte = (va, value) => bytes.set(va, value & 0xff);
  const putFloat = (va, value) => { const v = new DataView(new ArrayBuffer(4)); v.setFloat32(0, value, true); put(va, v.getUint32(0, true)); };
  return { G, put, putByte, putFloat };
}

function fixtureRun() {
  const m = memory();
  const manager = 0x100000, game = 0x200000, player = 0x300000, items = 0x400000, counts = 0x500000, list = 0x600000;
  m.put(0x00c7169c, manager);
  m.put(0x00c71678, game);
  m.putFloat(manager + 0x2a388, 0.5);
  m.putByte(manager + 0x2a38e, 1);
  m.put(manager + 0x2a3d4, 1);
  // ItemConfig collectibles: ids 0..200, item 105 has 6 charges, 42 two, 45 timed
  m.put(manager + 0x2a404, items); m.put(manager + 0x2a404 + 4, items + 201 * 4);
  for (const [id, max, type] of [[105, 6, 0], [42, 2, 0], [45, 450, 1]]) {
    const item = 0x700000 + id * 0x100;
    m.put(items + id * 4, item); m.put(item + 0x74, max); m.put(item + 0xac, type);
  }
  m.put(game + 0x1baa8, list); m.put(game + 0x1baac, list + 4); m.put(list, player);
  m.put(game + 0x26508, 12); m.put(game + 0x264f8, 345); m.put(game + 0x23a74, 0);
  m.put(player + 0x13c0, 19); m.put(player + 0x1364, 7); m.putByte(player + 0x1361, 1); m.put(player + 0x13bc, 0);
  m.put(player + 0x1580, 42); m.put(player + 0x1588, 1); m.put(player + 0x158c, 2); m.put(player + 0x1590, 3);
  m.put(player + 0x1580 + 0x20, 105); m.put(player + 0x1588 + 0x20, 6);
  m.put(player + 0x1580 + 0x40, 45); m.put(player + 0x1588 + 0x40, 200);
  m.put(player + 0x16c0, 2); m.put(player + 0x16c4, 0);
  m.put(player + 0x17a0, 26); m.put(player + 0x17a4, POCKET_CARD);
  m.put(player + 0x17a8, 2051); m.put(player + 0x17ac, POCKET_PILL);
  m.put(player + 0x17b0, 0); m.put(player + 0x17b4, POCKET_ACTIVE);
  m.put(player + 0x16c8, counts); m.put(player + 0x16cc, counts + 4 * 4);
  [1, 0, 2, 1].forEach((n, i) => m.put(counts + i * 4, n));
  return { ...m, manager, game, player };
}

test('the run reader returns the HUD the item bar draws', () => {
  const { G } = fixtureRun();
  assert.deepEqual(readOptions(G), { rumble: true, hudOffset: 0.5, betterTwins: true });
  const run = readRun(G);
  assert.equal(run.shake, 12);
  assert.equal(run.frame, 345);
  assert.equal(run.players.length, 1);
  const [p] = run.players;
  assert.equal(p.type, 19);
  assert.equal(p.bombs, 7);
  assert.equal(p.goldenBomb, true);
  assert.deepEqual(p.actives[0], { id: 42, charge: 1, battery: 2, subcharge: 3, max: 2, timed: false, special: false });
  assert.deepEqual(p.actives[1], { id: 105, charge: 6, battery: 0, subcharge: 0, max: 6, timed: false, special: false });
  assert.equal(p.actives[2].timed, true);
  assert.equal(p.actives[3], null);
  assert.deepEqual(p.pockets, [{ id: 26, kind: POCKET_CARD }, { id: 2051, kind: POCKET_PILL }, { id: 0, kind: POCKET_ACTIVE }, null]);
  assert.deepEqual(p.trinkets, [2, 0]);
  assert.equal(p.collectibles, 4);
});

test('the readers survive a missing game, a hostile vector and a faulting accessor', () => {
  const { G, put, game } = fixtureRun();
  put(game + 0x1baac, game + 0x1baa8);             // end before begin
  assert.equal(readRun(G), null);
  assert.equal(readRun(null), null);
  assert.equal(readOptions({ u8() { throw new Error('gone'); }, u32() { throw new Error('gone'); } }), null);
  const empty = memory();
  assert.equal(readRun(empty.G), null);
  assert.deepEqual(readMenu(empty.G), { screen: -1 });
  // an option byte other than zero is on; a HUD offset outside 0..1 is clamped
  const { G: g2, putByte, putFloat, manager } = fixtureRun();
  putByte(manager + 0x2a38e, 0x80); putFloat(manager + 0x2a388, 3);
  assert.deepEqual(readOptions(g2), { rumble: true, hudOffset: 1, betterTwins: true });
  putByte(manager + 0x2a38e, 0);
  assert.equal(readOptions(g2).rumble, false);
});

test('the menu reader reports each screen with the cursor measured for it', () => {
  const m = memory(), menu = 0x800000;
  m.put(0x00c72a20, menu);
  m.putFloat(menu + 0x48, -1180);
  m.put(menu + 0x2f8, 2); m.put(menu + 0xb94, 5); m.put(menu + 0xced4, 7);
  for (const [screen, cursor] of [[MENU.SAVES, 2], [MENU.GAME, 5], [MENU.OPTIONS, 7]]) {
    m.put(menu + 0x40, screen);
    assert.deepEqual(readMenu(m.G), { screen, viewY: -1180, cursor });
  }
  m.put(menu + 0x40, MENU.CHARACTER);
  assert.deepEqual(readMenu(m.G), { screen: MENU.CHARACTER, viewY: -1180 });
});

// ---- haptics --------------------------------------------------------------------------
test('rumble events follow the game: screen shakes, hits and new items, behind the RUMBLE option', () => {
  const detector = createHapticDetector();
  const sample = (shake, cooldown, collectibles, rumble = true) => ({ rumble, shake, players: [{ ptr: 1, damageCooldown: cooldown, collectibles }] });
  assert.deepEqual(detector.update(sample(10, 0, 3)), []);              // the first look sets the baseline
  assert.deepEqual(detector.update(sample(9, 0, 3)), []);               // a shake counting down
  assert.deepEqual(detector.update(sample(20, 0, 3)), [{ kind: 'shake', strength: 20 }]);
  assert.deepEqual(detector.update(sample(19, 60, 3)), [{ kind: 'damage', strength: 60 }]);
  assert.deepEqual(detector.update(sample(18, 59, 4)), [{ kind: 'item', strength: 1 }]);
  assert.deepEqual(detector.update(sample(30, 90, 5, false)), []);      // RUMBLE off: nothing
  assert.deepEqual(detector.update(sample(29, 89, 5)), []);             // and no replay when it comes back on
  assert.deepEqual(detector.update(null), []);
  assert.deepEqual(detector.update(sample(40, 90, 5)), []);             // a new run starts from its own baseline
});

test('one vibration per frame: the strongest event decides', () => {
  assert.equal(hapticPattern([]), 0);
  assert.equal(hapticPattern([{ kind: 'tap' }]), 12);
  assert.equal(hapticPattern([{ kind: 'shake', strength: 1 }]), 25);
  assert.equal(hapticPattern([{ kind: 'shake', strength: 10 }]), 60);
  assert.equal(hapticPattern([{ kind: 'shake', strength: 100 }]), 160);
  assert.equal(hapticPattern([{ kind: 'item', strength: 1 }, { kind: 'damage', strength: 30 }, { kind: 'tap' }]), 90);
});

// ---- the item bar's art, resolved at build time ---------------------------------------------
test('build_hud takes the HUD frame from the layer that draws ui_cardspills', () => {
  const anm2 = `<AnimatedActor><Content><Spritesheets>
    <Spritesheet Path="items/pick ups/pickup_017_card.png" Id="0"/><Spritesheet Path="ui\\\\UI_CardsPills.png" Id="1"/></Spritesheets>
    <Layers><Layer Name="body" Id="0" SpritesheetId="0"/><Layer Name="ui" Id="1" SpritesheetId="1"/></Layers></Content>
    <Animations><Animation Name="Idle"><LayerAnimations><LayerAnimation LayerId="1"><Frame XCrop="1" YCrop="1" Width="2" Height="2" XPivot="0" YPivot="0" Visible="true"/></LayerAnimation></LayerAnimations></Animation>
    <Animation Name="HUD"><LayerAnimations>
      <LayerAnimation LayerId="0"><Frame XCrop="9" YCrop="9" Width="9" Height="9" XPivot="0" YPivot="0" Visible="true"/></LayerAnimation>
      <LayerAnimation LayerId="1"><Frame XCrop="0" YCrop="0" Width="32" Height="32" XPivot="16" YPivot="16" Visible="false"/>
        <Frame XCrop="32" YCrop="96" Width="32" Height="32" XPivot="16" YPivot="16" Visible="true"/></LayerAnimation>
    </LayerAnimations></Animation></Animations></AnimatedActor>`;
  const script = 'import sys,json; sys.path.insert(0, sys.argv[1]); import page_assets as P; print(json.dumps(P._anm2_hud_frame(sys.stdin.read().encode())))';
  const r = spawnSync('python', ['-c', script, join(root, 'scripts', 'recomp', 'assets')], { input: anm2, encoding: 'utf8' });
  assert.equal(r.status, 0, r.stderr);
  assert.deepEqual(JSON.parse(r.stdout), [32, 96, 32, 32, 16, 16]);
});
