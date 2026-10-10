// gamepad.mjs -- controllers, from the browser's Gamepad API to the XInput state
// the game polls.
//
// The game asks XInputGetState for a slot each frame (host_shims_xinput.c);
// the host asks the page, and the page answers from navigator.getGamepads():
// the first four pads the browser reports, in the order it numbers them, are
// slots 0..3. A pad in the "standard" mapping (every common controller in
// Chromium) lays its buttons out the way XInput names them; one without a
// mapping is read the same way, best effort.

// XINPUT_GAMEPAD.wButtons
export const XI = {
  UP: 0x0001, DOWN: 0x0002, LEFT: 0x0004, RIGHT: 0x0008, START: 0x0010, BACK: 0x0020,
  LTHUMB: 0x0040, RTHUMB: 0x0080, LB: 0x0100, RB: 0x0200, A: 0x1000, B: 0x2000, X: 0x4000, Y: 0x8000,
};
// the standard mapping's buttons, in order (6 and 7 are the triggers, read as values)
const STANDARD = [XI.A, XI.B, XI.X, XI.Y, XI.LB, XI.RB, 0, 0, XI.BACK, XI.START, XI.LTHUMB, XI.RTHUMB,
  XI.UP, XI.DOWN, XI.LEFT, XI.RIGHT];

const pressed = (b) => !!b && (typeof b === 'object' ? (b.pressed || b.value > 0.5) : b > 0.5);
const value = (b) => (!b ? 0 : typeof b === 'object' ? Number(b.value) || (b.pressed ? 1 : 0) : Number(b) || 0);
// an axis in [-1, 1] -> a thumb in XInput's signed 16 bits
const thumb = (v) => { const x = Math.max(-1, Math.min(1, Number(v) || 0)); return x < 0 ? Math.round(x * 32768) : Math.round(x * 32767); };

// One Gamepad -> { buttons, lt, rt, lx, ly, rx, ry }: XInput's own fields and
// ranges (triggers 0..255, thumbs -32768..32767 with up positive, the browser's
// axes have down positive).
export function xinputState(gp) {
  if (!gp || gp.connected === false) return null;
  const b = gp.buttons || [], a = gp.axes || [];
  let buttons = 0;
  for (let i = 0; i < STANDARD.length; i++) if (STANDARD[i] && pressed(b[i])) buttons |= STANDARD[i];
  return {
    buttons,
    lt: Math.round(Math.max(0, Math.min(1, value(b[6]))) * 255),
    rt: Math.round(Math.max(0, Math.min(1, value(b[7]))) * 255),
    lx: thumb(a[0]), ly: thumb(-(Number(a[1]) || 0)), rx: thumb(a[2]), ry: thumb(-(Number(a[3]) || 0)),
  };
}

// The slots: the browser's pads in its own order, four at most, each with the
// packet number XInput keeps (it goes up when the state changes).
// memoMs (round 93): the game asks for each of its four slots, every frame, and each
// ask was a navigator.getGamepads() -- 0.5% of a busy frame at CPU x4. Asks within
// memoMs of the last real read share it; the page's menus see a pad at most that old.
export function createPads(getGamepads, { memoMs = 0, now = () => performance.now() } = {}) {
  const packets = [0, 0, 0, 0], last = ['', '', '', ''];
  let memo = null, memoAt = -Infinity;
  const list = () => {
    if (memo && memoMs > 0 && now() - memoAt < memoMs) return memo;
    let raw = [];
    try { raw = Array.from((getGamepads && getGamepads()) || []); } catch { raw = []; }
    memo = raw.filter((gp) => gp && gp.connected !== false).sort((p, q) => p.index - q.index).slice(0, 4);
    memoAt = memoMs > 0 ? now() : -Infinity;
    return memo;
  };
  return {
    // slot -> { packet, buttons, lt, rt, lx, ly, rx, ry } or null (not connected)
    state(slot) {
      const gp = list()[slot | 0];
      const st = gp ? xinputState(gp) : null;
      if (!st) { last[slot | 0] = ''; return null; }
      const key = `${st.buttons}|${st.lt}|${st.rt}|${st.lx}|${st.ly}|${st.rx}|${st.ry}`;
      if (key !== last[slot]) { last[slot] = key; packets[slot] = (packets[slot] + 1) >>> 0; }
      return { packet: packets[slot], ...st };
    },
    count: () => list().length,
    // the Gamepad behind a slot (for its vibrationActuator), or null
    pad: (slot) => list()[slot | 0] || null,
  };
}

// While a page menu has the pad (window.isaacPadCaptured), the game sees it
// connected and at rest; a button held when the menu let go stays hidden from
// the game until it is released, so the press that closed a menu does not
// also land on the screen behind it.
export function createPadGate() {
  let masked = 0;
  return (st, captured) => {
    if (!st) { masked = 0; return st; }
    if (captured) { masked |= st.buttons; return { ...st, buttons: 0, lt: 0, rt: 0, lx: 0, ly: 0, rx: 0, ry: 0 }; }
    masked &= st.buttons;                       // released buttons are the game's again
    return masked ? { ...st, buttons: st.buttons & ~masked } : st;
  };
}

// The pad as the page's menus read it: edges of A, B, X, Y and Start and of the
// four directions (the d-pad or the left stick past half way), a held
// direction repeating the way a held key does. read() -> ['up', 'a', ...] for
// this poll; settle() takes whatever is held now as already seen (a menu that
// just opened under a held A must not take that A as its own).
export function createPadKeys({ delay = 380, every = 120 } = {}) {
  let prev = 0, dir = null, next = 0;
  const T = 16384;
  const direction = (st) => ((st.buttons & XI.UP) || st.ly > T ? 'up' : (st.buttons & XI.DOWN) || st.ly < -T ? 'down'
    : (st.buttons & XI.LEFT) || st.lx < -T ? 'left' : (st.buttons & XI.RIGHT) || st.lx > T ? 'right' : null);
  return {
    read(st, now) {
      const out = [];
      if (!st) { prev = 0; dir = null; return out; }
      const b = st.buttons;
      for (const [bit, name] of [[XI.A, 'a'], [XI.B, 'b'], [XI.X, 'x'], [XI.Y, 'y'], [XI.START, 'start']]) if ((b & bit) && !(prev & bit)) out.push(name);
      prev = b;
      const d = direction(st);
      if (d !== dir) { dir = d; if (d) { out.push(d); next = now + delay; } }
      else if (d && now >= next) { out.push(d); next = now + every; }
      return out;
    },
    settle(st, now = 0) { prev = st ? st.buttons : 0; dir = st ? direction(st) : null; next = now + delay; },
  };
}

// XInput's motor words -> one Gamepad API effect: both motors off resets the
// actuator; anything else plays for a while, and the game's next call (on or
// off) replaces it.
export function rumble(gp, left, right) {
  const act = gp && gp.vibrationActuator;
  if (!act) return false;
  if (!left && !right) { if (typeof act.reset === 'function') act.reset().catch(() => {}); return true; }
  if (typeof act.playEffect !== 'function') return false;
  act.playEffect('dual-rumble', { startDelay: 0, duration: 400,
    strongMagnitude: Math.min(1, left / 65535), weakMagnitude: Math.min(1, right / 65535) }).catch(() => {});
  return true;
}
