import test from 'node:test';
import assert from 'node:assert/strict';
import { xinputState, createPads, XI } from '../scripts/recomp/web/gamepad.mjs';

const pad = (index, { buttons = {}, axes = [0, 0, 0, 0], connected = true } = {}) => ({
  index, connected, mapping: 'standard', axes,
  buttons: Array.from({ length: 17 }, (_, i) => (i in buttons ? { pressed: buttons[i] > 0.5, value: buttons[i] } : { pressed: false, value: 0 })),
});

test('a standard-mapped pad becomes XInput buttons', () => {
  const each = [[0, XI.A], [1, XI.B], [2, XI.X], [3, XI.Y], [4, XI.LB], [5, XI.RB], [8, XI.BACK], [9, XI.START],
    [10, XI.LTHUMB], [11, XI.RTHUMB], [12, XI.UP], [13, XI.DOWN], [14, XI.LEFT], [15, XI.RIGHT]];
  for (const [i, bit] of each) assert.equal(xinputState(pad(0, { buttons: { [i]: 1 } })).buttons, bit, `button ${i}`);
  assert.equal(xinputState(pad(0, { buttons: { 0: 1, 9: 1, 13: 1 } })).buttons, XI.A | XI.START | XI.DOWN);
  assert.equal(xinputState(pad(0, { buttons: { 16: 1 } })).buttons, 0, 'the home button is the browser\'s, not the game\'s');
});

test('triggers are 0..255, thumbs are signed 16 bits with up positive', () => {
  const st = xinputState(pad(0, { buttons: { 6: 0.5, 7: 1 }, axes: [1, -1, -1, 1] }));
  assert.equal(st.lt, 128);
  assert.equal(st.rt, 255);
  assert.equal(st.lx, 32767);
  assert.equal(st.ly, 32767, 'the browser\'s up is -1; XInput\'s is +');
  assert.equal(st.rx, -32768);
  assert.equal(st.ry, -32768);
  const mid = xinputState(pad(0, { axes: [0, 0, 0.5, -0.5] }));
  assert.deepEqual([mid.lx, mid.ly, mid.rx, mid.ry], [0, 0, 16384, 16384]);
  assert.equal(xinputState(pad(0, { axes: [3, -9, NaN, undefined] })).lx, 32767, 'out of range clamps');
});

test('slots follow the browser\'s order, skip the gaps, and count packets on change', () => {
  let list = [null, pad(2, { buttons: { 0: 1 } }), pad(1)];
  const pads = createPads(() => list);
  assert.equal(pads.count(), 2);
  const a = pads.state(0), b = pads.state(1);
  assert.equal(a.buttons, 0, 'slot 0 is the lowest index (1)');
  assert.equal(b.buttons, XI.A, 'slot 1 is index 2');
  assert.equal(pads.state(2), null, 'no third pad: not connected');
  const p0 = pads.state(1).packet;
  assert.equal(pads.state(1).packet, p0, 'unchanged state, unchanged packet');
  list = [null, pad(2, { buttons: { 1: 1 } }), pad(1)];
  assert.equal(pads.state(1).packet, p0 + 1, 'a change moves the packet on');
  list = [pad(1, { connected: false })];
  assert.equal(pads.state(0), null, 'a disconnected pad is no pad');
  assert.equal(createPads(() => { throw new Error('no API'); }).state(0), null, 'no Gamepad API: nothing connected');
});

test('the game\'s rumble plays on the pad, and both motors off stops it', async () => {
  const { rumble } = await import('../scripts/recomp/web/gamepad.mjs');
  const calls = [];
  const act = { playEffect: (type, p) => { calls.push(['play', type, p.strongMagnitude, p.weakMagnitude]); return Promise.resolve(); },
    reset: () => { calls.push(['reset']); return Promise.resolve(); } };
  assert.equal(rumble({ vibrationActuator: act }, 65535, 32768), true);
  assert.equal(rumble({ vibrationActuator: act }, 0, 0), true);
  assert.equal(rumble({}, 65535, 65535), false, 'a pad with no motors');
  assert.equal(rumble(null, 1, 1), false);
  assert.deepEqual(calls, [['play', 'dual-rumble', 1, 32768 / 65535], ['reset']]);
});

test('a page menu with the pad shows the game a resting pad, and the press that closed it stays hidden', async () => {
  const { createPadGate } = await import('../scripts/recomp/web/gamepad.mjs');
  const gate = createPadGate();
  const st = (buttons, lx = 0) => ({ packet: 1, buttons, lt: 0, rt: 9, lx, ly: 0, rx: 0, ry: 0 });
  assert.deepEqual(gate(st(XI.A, 500), false), st(XI.A, 500), 'no menu: the pad as it is');
  const held = gate(st(XI.A | XI.B, 900), true);
  assert.deepEqual([held.buttons, held.lx, held.rt], [0, 0, 0], 'a menu has it: at rest, and connected');
  assert.ok(held, 'still connected (a null would remove the device)');
  assert.equal(gate(st(XI.A | XI.B), false).buttons, 0, 'the menu closed under held A and B: both hidden');
  assert.equal(gate(st(XI.A | XI.X), false).buttons, XI.X, 'A still held since the menu: hidden; X pressed since: the game\'s');
  assert.equal(gate(st(XI.X), false).buttons, XI.X, 'A let go');
  assert.equal(gate(st(XI.A | XI.X), false).buttons, XI.A | XI.X, 'and a new A is the game\'s again');
  assert.equal(gate(null, false), null, 'no pad stays no pad');
});

test('the menu keys: edges of A, B, Y, Start, directions with a held repeat, and settle', async () => {
  const { createPadKeys } = await import('../scripts/recomp/web/gamepad.mjs');
  const keys = createPadKeys({ delay: 300, every: 100 });
  const st = (buttons, lx = 0, ly = 0) => ({ buttons, lx, ly, rx: 0, ry: 0, lt: 0, rt: 0 });
  assert.deepEqual(keys.read(st(0), 0), []);
  assert.deepEqual(keys.read(st(XI.A), 10), ['a']);
  assert.deepEqual(keys.read(st(XI.A), 20), [], 'held: one press');
  assert.deepEqual(keys.read(st(XI.DOWN), 30), ['down']);
  assert.deepEqual(keys.read(st(XI.DOWN), 200), [], 'not yet repeating');
  assert.deepEqual(keys.read(st(XI.DOWN), 331), ['down'], 'repeats after the delay');
  assert.deepEqual(keys.read(st(XI.DOWN), 440), ['down'], 'then every interval');
  assert.deepEqual(keys.read(st(0, 0, 30000), 450), ['up'], 'the left stick counts, up positive');
  assert.deepEqual(keys.read(st(0, -30000, 0), 460), ['left']);
  assert.deepEqual(keys.read(st(0, 10000, 0), 470), [], 'under half way: nothing');
  keys.settle(st(XI.A | XI.Y, 0, 0), 480);
  assert.deepEqual(keys.read(st(XI.A | XI.Y), 490), [], 'what was held when a menu opened is not its press');
  assert.deepEqual(keys.read(st(XI.Y | XI.B | XI.START), 500), ['b', 'start']);
  assert.deepEqual(keys.read(null, 510), []);
});
