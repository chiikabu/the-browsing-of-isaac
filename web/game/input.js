/**
 * Keyboard input for the Isaac-style prototype.
 * Arrows + WASD -> movement vector; Space -> bomb placement (edge-triggered).
 */

const MOVE_KEYS = {
  ArrowLeft: "left", KeyA: "left",
  ArrowRight: "right", KeyD: "right",
  ArrowUp: "up", KeyW: "up",
  ArrowDown: "down", KeyS: "down",
};

export function initInput(target = window) {
  const held = new Set();
  let bombQueued = false;

  const onKeyDown = (ev) => {
    if (MOVE_KEYS[ev.code] || ev.code === "Space") ev.preventDefault();
    if (ev.repeat) return;
    if (MOVE_KEYS[ev.code]) held.add(MOVE_KEYS[ev.code]);
    if (ev.code === "Space") bombQueued = true;
  };
  const onKeyUp = (ev) => {
    const dir = MOVE_KEYS[ev.code];
    if (dir) held.delete(dir);
  };
  const onBlur = () => held.clear();

  target.addEventListener("keydown", onKeyDown);
  target.addEventListener("keyup", onKeyUp);
  window.addEventListener("blur", onBlur);

  return {
    /** Normalized movement axes: x/y in {-1,0,1}. */
    getMove() {
      let x = 0, y = 0;
      if (held.has("left")) x -= 1;
      if (held.has("right")) x += 1;
      if (held.has("up")) y -= 1;
      if (held.has("down")) y += 1;
      return { x, y };
    },
    /** True once per Space press; consumes the edge. */
    consumeBomb() {
      const q = bombQueued;
      bombQueued = false;
      return q;
    },
    dispose() {
      target.removeEventListener("keydown", onKeyDown);
      target.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
      held.clear();
    },
  };
}
