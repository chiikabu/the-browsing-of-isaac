-- lab_pause.lua (development only; ISAAC_RGON_LAB=lab_pause.lua, start a run and press Escape many times)
-- How often the game's own pause menu opened and closed, read off
-- Game():IsPaused() on every render (MC_POST_RENDER runs while paused), with
-- the frame numbers of each change. Round 111: a press the engine saw twice
-- would open and close the menu in one press (two changes for one key).
local T = ...
local B = T.B
local say = function(s) B.log("lab_pause: " .. s) end
local mod = RegisterMod("rgon lab pause", 1)
local game = Game()
local was, opens, closes, f, last = nil, 0, 0, 0, 0
local esc = 0
local escdown = false
mod:AddCallback(ModCallbacks.MC_POST_RENDER, function()
  f = f + 1
  local p = game:IsPaused()
  if was ~= nil and p ~= was then
    if p then opens = opens + 1 else closes = closes + 1 end
    say(string.format("%s at render %d (%d since the last change): opens %d closes %d, Escape presses seen held %d",
      p and "OPEN" or "CLOSE", f, f - last, opens, closes, esc))
    last = f
  end
  was = p
  local d = Input.IsButtonPressed(Keyboard.KEY_ESCAPE, 0)
  if d and not escdown then esc = esc + 1 end
  escdown = d
  if f % 300 == 0 then say(string.format("render %d: opens %d closes %d, Escape presses seen held %d, paused %s", f, opens, closes, esc, tostring(p))) end
end)
