import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createStickDirection } from '../scripts/recomp/web/touch_input.mjs';
import {
  readOptions, readRun, readMenu, readPause, createHapticDetector, hapticPattern, MENU, POCKET_CARD, POCKET_PILL, POCKET_ACTIVE,
} from '../scripts/recomp/web/touch_game.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

// ---- sticks: eight directions that hold steady ----------------------------------
const at = (degrees, length = 1) => [Math.cos(degrees * Math.PI / 180) * length, Math.sin(degrees * Math.PI / 180) * length];

test('the move stick gives the eight keyboard directions', () => {
  const expected = [['d'], ['d', 's'], ['s'], ['a', 's'], ['a'], ['a', 'w'], ['w'], ['d', 'w']];
  for (let i = 0; i < 8; i++) assert.deepEqual(createStickDirection().keys(...at(i * 45)), expected[i]);
});

test('the fire stick gives four directions, one key each, split on the diagonals', () => {
  const fire = [['right'], ['down'], ['left'], ['up']];
  for (let i = 0; i < 4; i++) assert.deepEqual(createStickDirection({ shooting: true }).keys(...at(i * 90)), fire[i]);
  // never two fire keys at once, wherever the thumb is
  for (let degrees = 0; degrees < 360; degrees += 3) {
    assert.equal(createStickDirection({ shooting: true }).keys(...at(degrees)).length, 1, `${degrees} deg`);
  }
  // a fresh push takes the nearer axis on either side of a diagonal
  assert.deepEqual(createStickDirection({ shooting: true }).keys(...at(40)), ['right']);
  assert.deepEqual(createStickDirection({ shooting: true }).keys(...at(50)), ['down']);
  assert.deepEqual(createStickDirection({ shooting: true }).keys(...at(-50)), ['up']);
});

test('the fire stick holds its direction across a diagonal until the thumb is clearly past it', () => {
  const stick = createStickDirection({ shooting: true });
  assert.deepEqual(stick.keys(...at(0)), ['right']);
  // 45 is the edge; 15 degrees of give on top
  for (const degrees of [44, 50, 58, -50, -58, 30]) assert.deepEqual(stick.keys(...at(degrees)), ['right'], `${degrees} deg`);
  assert.deepEqual(stick.keys(...at(62)), ['down']);
  assert.deepEqual(stick.keys(...at(35)), ['down']);
  assert.deepEqual(stick.keys(...at(28)), ['right']);
});

test('the fire stick answers a short push', () => {
  const stick = createStickDirection({ shooting: true });
  assert.deepEqual(stick.keys(...at(270, 0.11)), []);
  assert.deepEqual(stick.keys(...at(270, 0.13)), ['up']);
  assert.deepEqual(stick.keys(...at(270, 0.1)), ['up']);
  assert.deepEqual(stick.keys(...at(270, 0.08)), []);
});

test('a walking thumb brought back to rest near the middle stops Isaac', () => {
  // a 52 px stick, the thumb out 40 px, then back to 6.4 px off centre without lifting
  const stick = createStickDirection();
  assert.deepEqual(stick.keys(...at(90, 40 / 52)), ['s']);
  assert.deepEqual(stick.keys(...at(39, 6.4 / 52)), [], 'a thumb at rest is a stop');
  assert.deepEqual(stick.keys(...at(90, 10 / 52)), [], 'and stays one until the thumb pushes out again');
  assert.deepEqual(stick.keys(...at(90, 14 / 52)), ['s']);
});

test('a thumb wobbling across a sector edge keeps its direction: no diagonal jitter', () => {
  // Resting on the up-right diagonal and drifting either side of its sector edges.
  const stick = createStickDirection();
  assert.deepEqual(stick.keys(...at(315)), ['d', 'w']);
  for (const degrees of [292, 338, 289, 341, 300, 330, 291]) assert.deepEqual(stick.keys(...at(degrees)), ['d', 'w'], `${degrees} deg`);
  // Clearly past the edge, the neighbour takes over, and holds the same way.
  assert.deepEqual(stick.keys(...at(275)), ['w']);
  assert.deepEqual(stick.keys(...at(300)), ['w']);
  assert.deepEqual(stick.keys(...at(312)), ['d', 'w']);
});

test('the dead zone lets go later than it catches', () => {
  const stick = createStickDirection();
  assert.deepEqual(stick.keys(0, 0), []);
  assert.deepEqual(stick.keys(...at(0, 0.24)), []);
  assert.deepEqual(stick.keys(...at(0, 0.26)), ['d']);
  assert.deepEqual(stick.keys(...at(0, 0.21)), ['d']);
  assert.deepEqual(stick.keys(...at(0, 0.19)), []);
  // held, 120 degrees stays down; released, a fresh push takes the nearest sector
  assert.deepEqual(stick.keys(...at(100)), ['s']);
  assert.deepEqual(stick.keys(...at(120)), ['s']);
  stick.reset();
  assert.deepEqual(stick.keys(...at(120)), ['a', 's']);
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
  assert.equal(p.dead, false);
});

test('a dead player is reported, so the touch layer treats the death paper as a menu', () => {
  const { G, putByte, player } = fixtureRun();
  putByte(player + 0x173, 1);
  assert.equal(readRun(G).players[0].dead, true);
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
  m.put(menu + 0x1534, 1); m.put(menu + 0x153c, 2); m.put(menu + 0x1544, 9);
  assert.deepEqual(readMenu(m.G), { screen: MENU.CHARACTER, viewY: -1180, cursor: 9, difficulty: 2, seedEntry: true });
  m.put(menu + 0x1534, 4);                         // turning to the tainted side is not the seed paper
  assert.equal(readMenu(m.G).seedEntry, false);
  m.put(menu + 0x40, MENU.STATS);
  assert.deepEqual(readMenu(m.G), { screen: MENU.STATS, viewY: -1180 });
});

test('the pause reader reports the paper, its options cursor and the eased scroll', () => {
  const { G, put, putFloat, game } = fixtureRun();
  put(game + 0x23a74, 2); put(game + 0x23a7c, 3); put(game + 0x2402c, 6); putFloat(game + 0x2403c, -44.5);
  assert.deepEqual(readPause(G), { state: 2, cursor: 3, optionsCursor: 6, optionsScroll: -44.5 });
  put(game + 0x2403c, 0x7fc00000);                 // a NaN scroll is no scroll
  assert.equal(readPause(G).optionsScroll, 0);
  assert.equal(readPause(memory().G), null);
});

// ---- haptics --------------------------------------------------------------------------
test('rumble events follow the game: screen shakes, hits and new items, behind the RUMBLE option', () => {
  const detector = createHapticDetector();
  const sample = (shake, cooldown, collectibles, rumble = true) => ({ rumble, shake, players: [{ ptr: 1, damageCooldown: cooldown, collectibles }] });
  assert.deepEqual(detector.update(sample(10, 0, 3)), []);              // the first look sets the baseline
  assert.deepEqual(detector.update(sample(9, 0, 3)), []);               // a shake counting down
  assert.deepEqual(detector.update(sample(20, 0, 3)), [{ kind: 'shake', strength: 20 }]);
  // Two presented frames read one logic frame: the same sample is not a second event.
  assert.deepEqual(detector.update(sample(20, 0, 3)), []);
  assert.deepEqual(detector.update(sample(19, 60, 3)), [{ kind: 'damage', strength: 60 }]);
  assert.deepEqual(detector.update(sample(19, 60, 3)), []);
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

test('a held card shows the face the game\'s HUD shows, found by name; runes keep their stone', () => {
  const anim = (name, x, y) => `<Animation Name="${name}" FrameNum="1"><RootAnimation/><LayerAnimations><LayerAnimation LayerId="0"><Frame XCrop="${x}" YCrop="${y}" Width="16" Height="24" XPivot="8" YPivot="12" Visible="true"/></LayerAnimation></LayerAnimations></Animation>`;
  const anm2 = `<AnimatedActor><Content><Spritesheets><Spritesheet Id="0" Path="ui_CardFronts.png"/></Spritesheets></Content><Animations>
    ${anim('00_TheFool', 0, 0)}${anim('25_TwoOfClubs', 64, 48)}${anim('22_TheJoker', 64, 96)}${anim('33_MysteryCard', 80, 120)}
    ${anim('31_CardAgainstHumanity', 80, 96)}${anim('53_AncientRecall', 112, 24)}${anim('Outline', 240, 120)}</Animations></AnimatedActor>`;
  const card = (id, name, type = 'tarot') => `<card type="${type}" pickup="1" id="${id}" name="#${name}_NAME" />`;
  const xml = `<pocketitems><card id="0" name="NULL" />${card(1, 'THE_FOOL')}${card(23, 'TWO_OF_CLUBS', 'suit')}${card(31, 'JOKER', 'suit')}
    ${card(48, 'Q_CARD', 'special')}${card(45, 'A_CARD_AGAINST_HUMANITY', 'special')}${card(53, 'ANCIENT_RECALL', 'special')}
    ${card(56, 'THE_FOOL_R', 'tarot_reverse')}${card(79, 'QUEEN_OF_HEARTS', 'suit')}<rune type="rune" pickup="18" id="81" name="#SOUL_OF_ISAAC_NAME" /></pocketitems>`;
  const script = [
    'import sys, json',
    'sys.path.insert(0, sys.argv[1])',
    'import page_assets as P',
    'a, x = sys.stdin.read().split("\\0")',
    'print(json.dumps(P.card_fronts(a.encode(), x.encode())))',
  ].join('\n');
  const r = spawnSync('python', ['-c', script, join(root, 'scripts', 'recomp', 'assets')], { input: `${anm2}\0${xml}`, encoding: 'utf8' });
  assert.equal(r.status, 0, r.stderr);
  assert.deepEqual(JSON.parse(r.stdout), {
    1: [0, 0, 16, 24], 23: [64, 48, 16, 24], 31: [64, 96, 16, 24],
    48: [80, 120, 16, 24],           // the ? card is the Mystery Card's face
    45: [80, 96, 16, 24],            // "A Card Against Humanity"
    53: [112, 24, 16, 24],           // Ancient Recall keeps its R
    56: [0, 0, 16, 24],              // a reversed card shows its upright face
  });                                // no face: Queen of Hearts, and the rune keeps its stone
});

test('the BACK sticker is backselectwidget\'s Back crop, trimmed to its paper', () => {
  // a 256x256 sheet: the Back paper opaque at 12..91 x 8..83, the Select paper
  // right of the 96 px crop, where the sticker must not reach
  const script = [
    'import sys, io, json',
    'sys.path.insert(0, sys.argv[1])',
    'import page_assets as P',
    'from PIL import Image',
    'im = Image.new("RGBA", (256, 256), (0, 0, 0, 0))',
    'im.paste((230, 200, 190, 255), (12, 8, 92, 84))',
    'im.paste((10, 10, 10, 255), (100, 0, 200, 120))',
    'out = io.BytesIO(); im.save(out, format="PNG")',
    'b = P._back_mark(out.getvalue())',
    'empty = io.BytesIO(); Image.new("RGBA", (256, 256), (0, 0, 0, 0)).save(empty, format="PNG")',
    'print(json.dumps([b.width, b.height, list(b.getpixel((0, 0))), P._back_mark(empty.getvalue()) is None]))',
  ].join('\n');
  const r = spawnSync('python', ['-c', script, join(root, 'scripts', 'recomp', 'assets')], { encoding: 'utf8' });
  assert.equal(r.status, 0, r.stderr);
  assert.deepEqual(JSON.parse(r.stdout), [80, 76, [230, 200, 190, 255], true]);
});

test('browser_layout cuts the MODS paper the way modsmenu.anm2 does', () => {
  const frame = (x, y, w, h) => `<Frame XCrop="${x}" YCrop="${y}" Width="${w}" Height="${h}" XPivot="0" YPivot="0" Visible="true"/>`;
  const anim = (name, layer, f) => `<Animation Name="${name}"><LayerAnimations><LayerAnimation LayerId="${layer}">${f}</LayerAnimation></LayerAnimations></Animation>`;
  const anm2 = `<AnimatedActor><Content><Spritesheets><Spritesheet Path="ModsMenu.png" Id="0"/><Spritesheet Path="SeedWidget.png" Id="1"/></Spritesheets>
    <Layers><Layer Name="Main" Id="0" SpritesheetId="0"/><Layer Name="Widget" Id="1" SpritesheetId="1"/></Layers></Content><Animations>
    ${anim('Piece1', 1, frame(1, 1, 9, 9))}${anim('Piece1', 0, frame(0, 48, 256, 32))}
    ${anim('Piece2', 0, frame(0, 80, 256, 32))}${anim('Piece3', 0, frame(0, 112, 256, 32))}${anim('Piece4', 0, frame(0, 144, 256, 32))}
    ${anim('Piece5', 0, frame(0, 176, 256, 32))}${anim('Bottom', 0, frame(0, 208, 256, 48))}${anim('Cursor', 0, frame(272, 0, 16, 16))}
    </Animations></AnimatedActor>`;
  const script = 'import sys,json; sys.path.insert(0, sys.argv[1]); import page_assets as P; print(json.dumps(P.browser_layout(sys.stdin.read().encode())))';
  const r = spawnSync('python', ['-c', script, join(root, 'scripts', 'recomp', 'assets')], { input: anm2, encoding: 'utf8' });
  assert.equal(r.status, 0, r.stderr);
  const m = JSON.parse(r.stdout);
  assert.deepEqual(m.top, [0, 0, 256, 48], 'the top is the sheet above Piece1');
  assert.deepEqual(m.pieces, [[0, 48, 256, 32], [0, 80, 256, 32], [0, 112, 256, 32], [0, 144, 256, 32], [0, 176, 256, 32]]);
  assert.deepEqual(m.bottom, [0, 208, 256, 48]);
  assert.deepEqual(m.cursor, [272, 0, 16, 16]);
  assert.equal(m.fonts.small.fnt, 'teammeatfont10.fnt');
});
