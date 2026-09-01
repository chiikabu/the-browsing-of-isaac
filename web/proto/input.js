/**
 * Keyboard → runtime input lanes for the wasm hybrid demo.
 *
 * The demo has no real InputManager in guest memory, so keyboard state is
 * published as HOST-side input lanes (moveX/moveY + the raw key set). The
 * update session consumes them through the capture-apply pattern: each tick
 * publishes a player-walk residual event (opaqueCall0098dba0PlayerWalk) and
 * demo.js's residual body applies the lanes to the player entity in linear
 * memory — exactly the seam where the real game would run Player::Walk.
 */

/** @type {Set<string>} currently held keys (e.g. "ArrowLeft", "KeyW"). */
const held = new Set();

const MOVE_KEYS = {
  ArrowLeft: "left", KeyA: "left",
  ArrowRight: "right", KeyD: "right",
  ArrowUp: "up", KeyW: "up",
  ArrowDown: "down", KeyS: "down",
};

/**
 * Install listeners. Returns the lane reader; call `.dispose()` to detach.
 * @param {Window|HTMLElement} [target]
 */
export function initInput(target = window) {
  const onKeyDown = (ev) => {
    if (MOVE_KEYS[ev.code]) {
      ev.preventDefault(); // stop page scroll on arrows/space-held
      held.add(ev.code);
    }
  };
  const onKeyUp = (ev) => { held.delete(ev.code); };
  const onBlur = () => { held.clear(); };

  target.addEventListener("keydown", onKeyDown);
  target.addEventListener("keyup", onKeyUp);
  window.addEventListener("blur", onBlur);

  return {
    /** Normalized movement axes: x/y ∈ {-1,0,1}, diagonal-safe. */
    getMove() {
      let x = 0;
      let y = 0;
      if (held.has("ArrowLeft") || held.has("KeyA")) x -= 1;
      if (held.has("ArrowRight") || held.has("KeyD")) x += 1;
      if (held.has("ArrowUp") || held.has("KeyW")) y -= 1;
      if (held.has("ArrowDown") || held.has("KeyS")) y += 1;
      return { x, y };
    },
    /** True while any movement key is held (drives the walk-residual gate). */
    get moving() { return held.size > 0; },
    dispose() {
      target.removeEventListener("keydown", onKeyDown);
      target.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
      held.clear();
    },
  };
}
