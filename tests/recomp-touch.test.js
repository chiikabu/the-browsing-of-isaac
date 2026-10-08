import test from 'node:test';
import assert from 'node:assert/strict';
import { createTouchInput, stickKeys, twinAction } from '../scripts/recomp/web/touch_input.mjs';
import { touchMode } from '../scripts/recomp/web/touch_controls.mjs';

// The native poll drains every queued edge before sampling key state. A down/up
// pair in one poll therefore cannot stand in for a usable game button press.
function nativeConsumer(consume = () => {}) {
  let frame = 0;
  const pending = [], keys = new Set(), received = [];
  const input = createTouchInput({
    emit: (key, down) => pending.push([key, down]),
    readFrame: () => frame,
  });
  function poll(update = true) {
    if (update) input.update();
    frame++;
    for (const [key, down] of pending.splice(0)) {
      if (down) keys.add(key); else keys.delete(key);
      received.push([frame, key, down]);
    }
    consume(keys);
    return [...keys].sort();
  }
  return { input, poll, received };
}

// Independent slice of SHA256 5129df723e64's native twin consumer:
// 0x791a9a..0x791bd8 gates active Action9/10 by Classic/Better and Action11.
// 0x7a3d86..0x7a3e88 gates pocket Action9/10; 0x6f0040/0x753bf0 select twins.
// PlayerUpdate 0x785bd2/0x785bd9 performs item/pocket use BEFORE 0x785be7 swap.
// Pocket 0x7a3f2b/0x7a3f49 reads the front, 0x7a3f9e..0x7a3ff2 shifts it out.
// A new Ctrl edge then rotates nonempty pocket pairs at 0x7a4331..0x7a4383,
// including the other twin's cards. That ordering is original game behavior.
// Yum Heart45: 0x5b5393..0x5b53d2 heals user+2/other+1; card26: 0x7b2546..99
// doubles only its user's hearts. Two complete charges and a reserve expose
// double use, wrong recipient, and modifier-only pre-action pocket rotation.
function nativeTwinConsumer(better) {
  const players = [19, 20].map((character, index) => ({
    character, hearts: 2 + index, maxHearts: 8, charge: 8, cards: [26, 2, 0, 0],
  })), uses = [];
  let previous = new Set();
  const h = nativeConsumer(keys => {
    const triggered = key => keys.has(key) && !previous.has(key);
    const control = keys.has('ctrl');
    for (const [index, player] of players.entries()) {
      const itemKey = better || index === 0 ? 'space' : 'q';
      const itemControl = better && index === 1;
      if (triggered(itemKey) && control === itemControl && player.charge >= 4) {
        player.charge -= 4;
        uses.push({ character: player.character, kind: 'item', item: 45 });
        for (const recipient of players) recipient.hearts = Math.min(recipient.maxHearts, recipient.hearts + (recipient === player ? 2 : 1));
      }
      const pocketKey = !better && index === 0 ? 'space' : 'q';
      const pocketControl = !better || index === 1;
      if (triggered(pocketKey) && control === pocketControl && player.cards[0]) {
        const card = player.cards.shift();
        player.cards.push(0);
        uses.push({ character: player.character, kind: 'pocket', card });
        if (card === 26) player.hearts = Math.min(player.maxHearts, player.hearts * 2);
      }
      if (triggered('ctrl')) for (let slot = 1; slot < 4; slot++) {
        if (player.cards[slot]) [player.cards[slot - 1], player.cards[slot]] = [player.cards[slot], player.cards[slot - 1]];
      }
    }
    previous = new Set(keys);
  });
  return { ...h, players, uses };
}

function assertTwinUse(h, action, before) {
  const character = action.startsWith('jacob-') ? 19 : 20, item = action.endsWith('-item');
  const used = h.players.find(player => player.character === character), old = before.find(player => player.character === character);
  const other = h.players.find(player => player.character !== character), untouched = before.find(player => player.character !== character);
  assert.deepEqual(h.uses, [item ? { character, kind: 'item', item: 45 } : { character, kind: 'pocket', card: 26 }]);
  assert.equal(used.charge, old.charge - (item ? 4 : 0));
  assert.equal(used.hearts, item ? old.hearts + 2 : old.hearts * 2);
  assert.equal(other.charge, untouched.charge);
  assert.equal(other.hearts, untouched.hearts + (item ? 1 : 0));
  assert.deepEqual([...other.cards].sort((a, b) => a - b), [...untouched.cards].sort((a, b) => a - b));
  if (item) assert.deepEqual([...used.cards].sort((a, b) => a - b), [...old.cards].sort((a, b) => a - b));
  else assert.deepEqual(used.cards, [2, 0, 0, 0]);
}

function samples(consumer, count, updatesPerFrame = 1) {
  return Array.from({ length: count }, () => {
    for (let i = 1; i < updatesPerFrame; i++) consumer.input.update();
    return consumer.poll();
  });
}

test('touch sticks select all eight movement and firing directions', () => {
  const d = Math.SQRT1_2;
  for (const [x, y, movement, firing] of [
    [0, -1, ['w'], ['up']],
    [d, -d, ['d', 'w'], ['right', 'up']],
    [1, 0, ['d'], ['right']],
    [d, d, ['d', 's'], ['down', 'right']],
    [0, 1, ['s'], ['down']],
    [-d, d, ['a', 's'], ['down', 'left']],
    [-1, 0, ['a'], ['left']],
    [-d, -d, ['a', 'w'], ['left', 'up']],
  ]) {
    assert.deepEqual(stickKeys(x, y).sort(), movement);
    assert.deepEqual(stickKeys(x, y, true).sort(), firing);
  }
});

test('touch stick deadzone is radial and cardinal sectors reject minor axis drift', () => {
  assert.deepEqual(stickKeys(0, 0), []);
  assert.deepEqual(stickKeys(0.18, 0), []);
  assert.deepEqual(stickKeys(-0.12, 0.12), []);
  assert.deepEqual(stickKeys(0.181, 0), ['d']);
  assert.deepEqual(stickKeys(0.13, -0.13).sort(), ['d', 'w']);
  assert.deepEqual(stickKeys(0.8, -0.32), ['d']);
  assert.deepEqual(stickKeys(0.8, -0.34).sort(), ['d', 'w']);
  assert.deepEqual(stickKeys(0.32, -0.8, true), ['up']);
});

test('held touch keys stay down until every independent owner releases', () => {
  const h = nativeConsumer(), { input } = h;
  input.setKeys('move', ['w', 'd', 'w']);
  input.setKeys('extra', ['d']);
  input.setKeys('extra', ['d']);
  assert.deepEqual(h.poll(), ['d', 'w']);
  input.release('move');
  assert.deepEqual(h.poll(), ['d']);
  input.release('unknown');
  input.setKeys('extra', ['d', 's']);
  assert.deepEqual(h.poll(), ['d', 's']);
  input.setKeys('extra', ['s']);
  assert.deepEqual(h.poll(), ['s']);
  input.release('extra');
  assert.deepEqual(h.poll(), []);
  assert.deepEqual(h.received.filter(([, key]) => key === 'd'), [[1, 'd', true], [4, 'd', false]]);
  assert.deepEqual(h.received.filter(([, key]) => key === 'w'), [[1, 'w', true], [2, 'w', false]]);
});

test('quick touch taps survive finger release for two native polls', () => {
  const h = nativeConsumer();
  h.input.tap('bomb', 'e');
  h.input.release('bomb');
  assert.deepEqual(samples(h, 4), [['e'], ['e'], [], []]);
});

test('browser updates without native frames never advance a tap', () => {
  const h = nativeConsumer();
  h.input.tap('pause', 'escape');
  for (let i = 0; i < 64; i++) h.input.update();
  assert.deepEqual(h.poll(), ['escape']);
  for (let i = 0; i < 64; i++) h.input.update();
  assert.deepEqual(h.poll(), ['escape']);
  for (let i = 0; i < 64; i++) h.input.update();
  assert.deepEqual(h.poll(), []);
  assert.deepEqual(h.received, [[1, 'escape', true], [3, 'escape', false]]);
});

test('queued repeated characters retain a native release frame', () => {
  const h = nativeConsumer();
  h.input.tap('seed', 'a');
  h.input.tap('seed', 'a');
  assert.deepEqual(samples(h, 7, 16), [['a'], ['a'], [], ['a'], ['a'], [], []]);
});

test('Classic and Better twin actions consume front inventory once on the intended actor', () => {
  for (const better of [false, true]) for (const aligning of [false, true]) for (const action of ['jacob-item', 'esau-item', 'jacob-pocket', 'esau-pocket']) {
    const h = nativeTwinConsumer(better), binding = twinAction(action, better);
    if (aligning) {
      h.input.setKeys('jacob-only', ['ctrl']);
      h.poll();
      for (const player of h.players) player.cards = [26, 2, 0, 0];
    }
    const before = structuredClone(h.players);
    h.input.tap(action, binding.key, binding.control);
    samples(h, 8, 16);
    assertTwinUse(h, action, before);
    assert.deepEqual(h.poll(), aligning ? ['ctrl'] : []);
    h.input.release('jacob-only');
    assert.deepEqual(h.poll(), []);
  }
});

test('queued conflicting twin taps preserve FIFO actor and front-card semantics', () => {
  for (const better of [false, true]) {
    const h = nativeTwinConsumer(better);
    for (const action of ['jacob-pocket', 'jacob-item', 'esau-pocket']) {
      const binding = twinAction(action, better);
      h.input.tap(action, binding.key, binding.control);
    }
    samples(h, 14, 16);
    assert.deepEqual(h.uses, [
      { character: 19, kind: 'pocket', card: 26 },
      { character: 19, kind: 'item', item: 45 },
      // Classic Ctrl+Space legitimately rotates Esau's pocket after Jacob uses
      // his front card. Esau must later use that current front, not skip it.
      { character: 20, kind: 'pocket', card: better ? 26 : 2 },
    ]);
    assert.equal(h.players[0].hearts, 6);
    assert.equal(h.players[1].hearts, better ? 8 : 4);
    assert.deepEqual(h.players.map(player => player.charge), [4, 8]);
    assert.deepEqual(h.players[0].cards, [2, 0, 0, 0]);
    assert.deepEqual(h.players[1].cards, [better ? 2 : 26, 0, 0, 0]);
    assert.deepEqual(h.poll(), []);
  }
});

test('unmodified twin items suppress Jacob-only holds and restore remaining owners without action overlap', () => {
  for (const better of [false, true]) {
    const h = nativeTwinConsumer(better), { input } = h;
    input.setKeys('move', ['w']);
    input.setKeys('align-a', ['ctrl']);
    input.setKeys('align-b', ['ctrl']);
    assert.deepEqual(h.poll(), ['ctrl', 'w']);
    // Inventory is granted after the original Jacob-only Ctrl swap, as in a
    // running game. Restoring that owner may swap cards, never use them.
    for (const player of h.players) player.cards = [26, 2, 0, 0];
    const before = structuredClone(h.players);
    input.tap('item', 'space', false);
    input.release('align-a');
    const states = samples(h, 6);
    assert(states.filter(keys => keys.includes('space')).length >= 2);
    assert(states.filter(keys => keys.includes('space')).every(keys => !keys.includes('ctrl')));
    assertTwinUse(h, 'jacob-item', before);
    assert.deepEqual(states.at(-1), ['ctrl', 'w']);
    input.release('align-b');
    assert.deepEqual(h.poll(), ['w']);
    input.release('move');
    assert.deepEqual(h.poll(), []);
  }
});

test('modifier restoration tracks holds added and removed during an action', () => {
  const h = nativeConsumer(), { input } = h;
  input.setKeys('old-align', ['ctrl']);
  assert.deepEqual(h.poll(), ['ctrl']);
  input.tap('esau', 'q', true);
  assert.deepEqual(h.poll(), ['ctrl', 'q']);
  input.release('old-align');
  const esau = samples(h, 5);
  assert(esau.filter(keys => keys.includes('q')).every(keys => keys.includes('ctrl')));
  assert.deepEqual(esau.at(-1), []);
  input.tap('jacob', 'space', false);
  assert.deepEqual(h.poll(), ['space']);
  input.setKeys('new-align', ['ctrl']);
  const jacob = samples(h, 5);
  assert(jacob.filter(keys => keys.includes('space')).every(keys => !keys.includes('ctrl')));
  assert.deepEqual(jacob.at(-1), ['ctrl']);
  const actionUp = h.received.find(([frame, key, down]) => key === 'space' && !down)[0];
  const restored = h.received.find(([frame, key, down]) => frame > actionUp && key === 'ctrl' && down)[0];
  assert(restored > actionUp, 'Ctrl restoration must wait for an observed action release');
  input.release('new-align');
  assert.deepEqual(h.poll(), []);
});

test('reset cancels held keys and every queued action before and after native boundaries', () => {
  for (const waiting of [false, true]) for (const pollsBeforeRelease of [0, 1, 2, 4]) {
    const h = nativeConsumer(), { input } = h;
    input.setKeys('sticks', ['w', 'left']);
    if (waiting) {
      input.setKeys('previous-item', ['space']);
      h.poll();
      input.release('previous-item');
    }
    input.press('item', 'space', true);
    input.tap('queued-tap', 'q', false);
    input.press('queued-press', 'e');
    samples(h, pollsBeforeRelease);
    input.release('item');
    input.reset();
    input.reset();
    assert.deepEqual(samples(h, 10), Array.from({ length: 10 }, () => []));
    input.press('fresh', 'e');
    input.release('fresh');
    assert.deepEqual(samples(h, 4), [['e'], ['e'], [], []]);
  }
});

test('held item presses support dice selection while quick presses still span two polls', () => {
  const h = nativeConsumer(), { input } = h;
  input.press('dice', 'space', false);
  assert.deepEqual(samples(h, 9), Array.from({ length: 9 }, () => ['space']));
  input.release('dice');
  assert.deepEqual(samples(h, 2), [[], []]);
  input.press('quick-item', 'space', false);
  input.release('quick-item');
  const quick = samples(h, 5);
  assert.equal(quick.filter(keys => keys.includes('space')).length, 2);
  assert.deepEqual(quick.at(-1), []);
});

test('held twin pockets keep the reserve and modifier until finger release', () => {
  const h = nativeTwinConsumer(false), before = structuredClone(h.players);
  h.input.press('jacob-pocket', 'space', true);
  assert.deepEqual(samples(h, 10, 16), Array.from({ length: 10 }, () => ['ctrl', 'space']));
  assertTwinUse(h, 'jacob-pocket', before);
  h.input.release('jacob-pocket');
  const released = samples(h, 4, 16);
  assert(released.every(keys => !keys.includes('space')));
  assert.deepEqual(released.at(-1), []);
  assertTwinUse(h, 'jacob-pocket', before);
});

test('a twin pocket released before its first native poll still consumes the front once', () => {
  const h = nativeTwinConsumer(false), before = structuredClone(h.players);
  h.input.press('jacob-pocket', 'space', true);
  h.input.release('jacob-pocket');
  const states = samples(h, 8, 16);
  assert.equal(states.filter(keys => keys.includes('space')).length, 2);
  assertTwinUse(h, 'jacob-pocket', before);
  assert.deepEqual(h.poll(), []);
});

test('released queued presses still deliver once after the preceding item hold', () => {
  const h = nativeTwinConsumer(false), { input } = h;
  input.press('dice', 'space', false);
  samples(h, 2);
  input.press('pocket', 'q', true);
  input.release('pocket');
  samples(h, 5);
  assert.deepEqual(h.uses, [{ character: 19, kind: 'item', item: 45 }]);
  input.release('dice');
  samples(h, 8);
  assert.deepEqual(h.uses, [
    { character: 19, kind: 'item', item: 45 },
    { character: 20, kind: 'pocket', card: 26 },
  ]);
  assert.deepEqual(h.players.map(player => player.charge), [4, 8]);
  assert.equal(h.players[1].hearts, 8);
  assert.deepEqual(h.players[1].cards, [2, 0, 0, 0]);
  assert.deepEqual(h.poll(), []);
});

test('late browser updates never catch up through newly emitted release boundaries', () => {
  const h = nativeConsumer();
  h.input.tap('pocket', 'space', true);
  for (let i = 0; i < 20; i++) assert.deepEqual(h.poll(false), ['ctrl', 'space']);
  h.input.update();
  for (let i = 0; i < 16; i++) h.input.update();
  assert.deepEqual(h.poll(false), ['ctrl']);
  h.input.tap('next', 'q', false);
  for (let i = 0; i < 20; i++) assert.deepEqual(h.poll(false), ['q']);
  h.input.update();
  for (let i = 0; i < 16; i++) h.input.update();
  assert.deepEqual(h.poll(false), []);
  assert.deepEqual(h.poll(), []);
});

test('queued Ctrl taps wait for a held owner and an observed release', () => {
  const h = nativeConsumer();
  h.input.setKeys('drop', ['ctrl']);
  assert.deepEqual(h.poll(), ['ctrl']);
  h.input.tap('swap', 'ctrl');
  assert.deepEqual(h.poll(), ['ctrl']);
  h.input.release('drop');
  assert.deepEqual(samples(h, 5), [[], ['ctrl'], ['ctrl'], [], []]);
});

test('held keys joining a chord postpone restoration until their release is observed', () => {
  const h = nativeConsumer();
  h.input.tap('pocket', 'space', true);
  h.input.setKeys('other-finger', ['space']);
  assert.deepEqual(samples(h, 5, 16), Array.from({ length: 5 }, () => ['ctrl', 'space']));
  h.input.release('other-finger');
  assert.deepEqual(samples(h, 2, 16), [['ctrl'], []]);
});

test('a pending action release defers the whole chord without rotating the front card', () => {
  const h = nativeTwinConsumer(false), { input } = h;
  input.setKeys('previous-item', ['space']);
  h.poll();
  // Reset fixture after that independently held item was used.
  h.uses.length = 0;
  Object.assign(h.players[0], { hearts: 2, charge: 8, cards: [26, 2, 0, 0] });
  Object.assign(h.players[1], { hearts: 3, charge: 8, cards: [26, 2, 0, 0] });
  const before = structuredClone(h.players);
  input.release('previous-item');
  input.tap('jacob-pocket', 'space', true);
  // Another key owner must not force the waiting action down under old Ctrl.
  input.setKeys('joining-owner', ['space']);
  assert.deepEqual(h.poll(), []);
  assert.deepEqual(h.players, before);
  samples(h, 5, 16);
  assertTwinUse(h, 'jacob-pocket', before);
  input.release('joining-owner');
  samples(h, 3, 16);
  assert.deepEqual(h.poll(), []);
});

test('queued Ctrl swap after a twin chord rotates the remaining front pocket', () => {
  const h = nativeTwinConsumer(false);
  h.players[0].cards = [26, 2, 3, 0];
  h.input.tap('jacob-pocket', 'space', true);
  h.input.tap('swap', 'ctrl');
  samples(h, 10, 16);
  // Pocket use shifts to [2,3], then the chord's initial Ctrl rotates [3,2].
  // A separate SWAP needs a fresh native Action11 trigger to rotate [2,3].
  assert.deepEqual(h.uses, [{ character: 19, kind: 'pocket', card: 26 }]);
  assert.deepEqual(h.players[0].cards, [2, 3, 0, 0]);
  assert.deepEqual(h.players[1].cards, [26, 2, 0, 0]);
  assert.deepEqual(h.players.map(player => player.hearts), [4, 3]);
  assert.deepEqual(h.players.map(player => player.charge), [8, 8]);
  assert.deepEqual(h.poll(), []);
});

test('a room transition keeps a played run in game mode, and only a played one', () => {
  const live = { available: true, running: true, transit: false, paused: false, dead: false };
  const crossing = { ...live, running: false, transit: true };
  assert.equal(touchMode('menu', live), 'game');
  assert.equal(touchMode('game', crossing), 'game', 'thumbs held through a door keep working');
  assert.equal(touchMode('menu', crossing), 'menu', 'a transition does not start game mode from a menu');
  assert.equal(touchMode('off', crossing), 'menu');
  assert.equal(touchMode('game', { ...crossing, paused: true }), 'menu', 'the pause paper is a menu');
  assert.equal(touchMode('game', { ...crossing, dead: true }), 'menu', 'the death paper is a menu');
  assert.equal(touchMode('game', { ...crossing, transit: false }), 'menu', 'no run and no transition is a menu');
  assert.equal(touchMode('game', { ...live, available: false }), 'off');
});
