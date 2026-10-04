/**
 * Browser input mapping to Isaac / Win32-style virtual key codes.
 * Pure module — no DOM (callers pass KeyboardEvent-like objects).
 */

/** Common Isaac action names used by the glue layer. */
export const Actions = Object.freeze({
  LEFT: 'left',
  RIGHT: 'right',
  UP: 'up',
  DOWN: 'down',
  SHOOT_LEFT: 'shoot_left',
  SHOOT_RIGHT: 'shoot_right',
  SHOOT_UP: 'shoot_up',
  SHOOT_DOWN: 'shoot_down',
  BOMB: 'bomb',
  ITEM: 'item',
  PILL: 'pill',
  CARD: 'card',
  DROP: 'drop',
  MAP: 'map',
  PAUSE: 'pause',
  FULLSCREEN: 'fullscreen',
  RESTART: 'restart',
  MUTE: 'mute',
  CONSOLE: 'console',
});

/** Windows VK codes used by USER32 GetKeyState / message path. */
export const VK = Object.freeze({
  BACK: 0x08,
  TAB: 0x09,
  RETURN: 0x0d,
  SHIFT: 0x10,
  CONTROL: 0x11,
  MENU: 0x12, // Alt
  ESCAPE: 0x1b,
  SPACE: 0x20,
  LEFT: 0x25,
  UP: 0x26,
  RIGHT: 0x27,
  DOWN: 0x28,
  A: 0x41,
  B: 0x42,
  C: 0x43,
  D: 0x44,
  E: 0x45,
  F: 0x46,
  G: 0x47,
  H: 0x48,
  I: 0x49,
  J: 0x4a,
  K: 0x4b,
  L: 0x4c,
  M: 0x4d,
  N: 0x4e,
  O: 0x4f,
  P: 0x50,
  Q: 0x51,
  R: 0x52,
  S: 0x53,
  T: 0x54,
  U: 0x55,
  V: 0x56,
  W: 0x57,
  X: 0x58,
  Y: 0x59,
  Z: 0x5a,
  F1: 0x70,
  F2: 0x71,
  F3: 0x72,
  F4: 0x73,
  F5: 0x74,
  F6: 0x75,
  F10: 0x79,
  F11: 0x7a,
});

/** Default Binding of Isaac keyboard layout (WASD move, arrows shoot). */
export const DEFAULT_KEYMAP = Object.freeze({
  KeyA: Actions.LEFT,
  KeyD: Actions.RIGHT,
  KeyW: Actions.UP,
  KeyS: Actions.DOWN,
  ArrowLeft: Actions.SHOOT_LEFT,
  ArrowRight: Actions.SHOOT_RIGHT,
  ArrowUp: Actions.SHOOT_UP,
  ArrowDown: Actions.SHOOT_DOWN,
  KeyE: Actions.BOMB,
  Space: Actions.ITEM,
  KeyQ: Actions.PILL,
  KeyF: Actions.CARD,
  KeyC: Actions.DROP,
  Tab: Actions.MAP,
  Escape: Actions.PAUSE,
  KeyP: Actions.PAUSE,
  KeyR: Actions.RESTART,
  KeyM: Actions.MUTE,
  Backquote: Actions.CONSOLE,
  F11: Actions.FULLSCREEN,
});

/** Map KeyboardEvent.code / key to VK. */
export function codeToVk(code, key) {
  const byCode = {
    Backspace: VK.BACK,
    Tab: VK.TAB,
    Enter: VK.RETURN,
    ShiftLeft: VK.SHIFT,
    ShiftRight: VK.SHIFT,
    ControlLeft: VK.CONTROL,
    ControlRight: VK.CONTROL,
    AltLeft: VK.MENU,
    AltRight: VK.MENU,
    Escape: VK.ESCAPE,
    Space: VK.SPACE,
    ArrowLeft: VK.LEFT,
    ArrowUp: VK.UP,
    ArrowRight: VK.RIGHT,
    ArrowDown: VK.DOWN,
    F1: VK.F1,
    F2: VK.F2,
    F3: VK.F3,
    F4: VK.F4,
    F5: VK.F5,
    F10: VK.F10,
    F11: VK.F11,
  };
  if (byCode[code] != null) return byCode[code];
  if (code && code.startsWith('Key') && code.length === 4) {
    return VK[code[3]] ?? 0;
  }
  if (key && key.length === 1) {
    const c = key.toUpperCase().charCodeAt(0);
    if (c >= 0x41 && c <= 0x5a) return c;
  }
  return 0;
}

export function eventToAction(eventLike, keymap = DEFAULT_KEYMAP) {
  if (!eventLike) return null;
  const code = eventLike.code || '';
  if (keymap[code]) return keymap[code];
  // fallback by key text
  const key = eventLike.key || '';
  for (const [c, action] of Object.entries(keymap)) {
    if (c === key) return action;
  }
  return null;
}

/**
 * Stateful keyboard tracker for the frame loop.
 */
export function createInputState(keymap = DEFAULT_KEYMAP) {
  const down = new Set();
  const actions = new Set();
  const vkDown = new Set();

  function onKeyDown(e) {
    const code = e.code || e.key;
    down.add(code);
    const action = eventToAction(e, keymap);
    if (action) actions.add(action);
    const vk = codeToVk(e.code, e.key);
    if (vk) vkDown.add(vk);
    return { code, action, vk, type: 'down' };
  }

  function onKeyUp(e) {
    const code = e.code || e.key;
    down.delete(code);
    const action = eventToAction(e, keymap);
    if (action) actions.delete(action);
    const vk = codeToVk(e.code, e.key);
    if (vk) vkDown.delete(vk);
    return { code, action, vk, type: 'up' };
  }

  function isActionDown(action) {
    return actions.has(action);
  }

  function isVkDown(vk) {
    return vkDown.has(vk);
  }

  function snapshot() {
    return {
      codes: [...down],
      actions: [...actions],
      vks: [...vkDown],
    };
  }

  function reset() {
    down.clear();
    actions.clear();
    vkDown.clear();
  }

  return { onKeyDown, onKeyUp, isActionDown, isVkDown, snapshot, reset, keymap };
}

export default {
  Actions,
  VK,
  DEFAULT_KEYMAP,
  codeToVk,
  eventToAction,
  createInputState,
};
