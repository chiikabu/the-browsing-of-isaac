// Touch input stays in the native keyboard path. Presented frames pace presses
// and releases; a chord's modifier and action reach the same native poll.

export function stickKeys(x, y, shooting = false) {
  if (x * x + y * y <= 0.18 * 0.18) return [];
  const keys = [], diagonal = Math.SQRT2 - 1;
  if (Math.abs(x) >= Math.abs(y) * diagonal) keys.push(x < 0 ? (shooting ? 'left' : 'a') : (shooting ? 'right' : 'd'));
  if (Math.abs(y) >= Math.abs(x) * diagonal) keys.push(y < 0 ? (shooting ? 'up' : 'w') : (shooting ? 'down' : 's'));
  return keys;
}

// Any-angle movement through eight keyboard directions. The game samples input
// once per logic frame (30 a second, Game+0x264f8) and eases the player's
// velocity toward it, so alternating between the two nearest directions in the
// right proportion moves along the angle in between. A first-order sigma-delta
// keeps the running error under half a frame; call step() once per logic frame.
const MOVE_KEYS = [['d'], ['d', 's'], ['s'], ['a', 's'], ['a'], ['a', 'w'], ['w'], ['d', 'w']];
export function createAnalogMove({ deadzone = 0.18, snap = 0.06 } = {}) {
  let error = 0, last = -1;
  return {
    reset() { error = 0; last = -1; },
    // x right, y down, |(x, y)| <= 1 -> the movement keys for this logic frame
    step(x, y) {
      if (x * x + y * y <= deadzone * deadzone) { error = 0; last = -1; return []; }
      let sector = Math.atan2(y, x) / (Math.PI / 4);
      if (sector < 0) sector += 8;
      const low = Math.floor(sector) % 8, high = (low + 1) % 8;
      let frac = sector - Math.floor(sector);
      if (frac < snap) frac = 0;
      else if (frac > 1 - snap) frac = 1;
      // A new sector pair keeps no debt from the old one.
      if (last !== low) { error = 0; last = low; }
      error += frac;
      const pick = error >= 0.5 ? high : low;
      if (pick === high) error -= 1;
      return MOVE_KEYS[pick].slice();
    },
  };
}

export function twinAction(action, better) {
  switch (action) {
    case 'jacob-item': return { key: 'space', control: false };
    case 'esau-item': return better ? { key: 'space', control: true } : { key: 'q', control: false };
    case 'jacob-pocket': return better ? { key: 'q', control: false } : { key: 'space', control: true };
    case 'esau-pocket': return { key: 'q', control: true };
  }
}

export function createTouchInput({ emit, readFrame }) {
  const owners = new Map(), held = new Map(), down = new Set(), changed = new Map(), queue = [];
  let active = null;

  function wanted(key) {
    if (key === 'ctrl' && active && active.phase !== 'wait' && active.control !== null) return active.control;
    if (active && active.key === key && active.phase === 'wait') return false;
    return held.has(key) || !!(active && active.phase === 'down' && active.key === key);
  }

  function edge(key, pressed, frame) {
    if (down.has(key) === pressed) return;
    if (pressed) down.add(key); else down.delete(key);
    changed.set(key, frame);
    emit(key, pressed);
  }

  function sync(frame) {
    for (const key of down) if (!wanted(key)) edge(key, false, frame);
    if (active && active.phase !== 'wait' && active.control === true) edge('ctrl', true, frame);
    for (const key of held.keys()) if (wanted(key)) edge(key, true, frame);
    if (active && active.phase === 'down' && wanted(active.key)) edge(active.key, true, frame);
  }

  function setKeys(owner, keys) {
    const previous = owners.get(owner), next = new Set(keys);
    if (previous) for (const key of previous) {
      if (next.has(key)) continue;
      const count = held.get(key) - 1;
      if (count) held.set(key, count); else held.delete(key);
    }
    for (const key of next) if (!previous || !previous.has(key)) held.set(key, (held.get(key) || 0) + 1);
    if (next.size) owners.set(owner, next); else owners.delete(owner);
    sync(readFrame());
  }

  function start(frame) {
    // A held source must not lose its key just to manufacture a second press.
    if (!queue.length || held.has(queue[0].key)) { sync(frame); return; }
    active = queue.shift();
    // PE 0x785bd9 uses the front pocket before 0x785be7 handles Ctrl's swap.
    // A modifier-only poll would rotate the reserve into that front slot.
    // If a previous key-up still needs a poll, defer the entire chord. This
    // also releases a preceding chord's Ctrl before a queued standalone swap.
    active.phase = down.has(active.key) || changed.get(active.key) === frame || (active.control === null && changed.get('ctrl') === frame) ? 'wait' : 'down';
    active.at = frame;
    sync(frame);
  }

  function update() {
    const frame = readFrame();
    if (!active) { start(frame); return; }
    if (active.phase === 'wait') {
      if (frame - active.at >= 1) {
        active.phase = 'down';
        active.at = frame;
        sync(frame);
      }
      return;
    }
    if (active.phase === 'down') {
      if (!active.hold && frame - active.at >= 2) {
        active.phase = 'release';
        active.at = frame;
        sync(frame);
      }
      return;
    }
    // Even if another owner prolonged this key, do not restore Ctrl until the
    // native consumer has seen the action released. Otherwise one twin press
    // can also trigger its other modifier meaning (BOIOS-84).
    if (down.has(active.key) || frame - (changed.get(active.key) ?? active.at) < 1) return;
    active = null;
    start(frame);
  }

  function enqueue(owner, key, control, hold) {
    queue.push({ owner, key, control, hold });
    update();
  }

  function tap(owner, key, control = null) { enqueue(owner, key, control, false); }
  function press(owner, key, control = null) { enqueue(owner, key, control, true); }

  function release(owner) {
    setKeys(owner, []);
    if (active && active.owner === owner) active.hold = false;
    for (const action of queue) if (action.owner === owner) action.hold = false;
    update();
  }

  function reset() {
    queue.length = 0;
    active = null;
    owners.clear();
    held.clear();
    changed.clear();
    sync(readFrame());
  }

  return { setKeys, release, tap, press, update, reset };
}
