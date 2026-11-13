-- lab_trig.lua (development only; ISAAC_RGON_LAB=lab_trig.lua, start a run, press F2 and F3 many times)
-- How many key presses a mod sees as "triggered" from a render callback and
-- from an update callback, against how many it sees as "pressed" at all. A
-- press whose one triggered pass falls on a pass that is not rendered is a
-- press a mod's menu never gets.
local T = ...
local B = T.B
local say = function(s) B.log("lab_trig: " .. s) end
local mod = RegisterMod("rgon lab trig", 1)
local KEYS = { Keyboard.KEY_F2, Keyboard.KEY_F3 }
local trig_r, trig_u, presses, down = 0, 0, 0, {}
local renders, updates = 0, 0
mod:AddCallback(ModCallbacks.MC_POST_RENDER, function()
  renders = renders + 1
  for _, k in ipairs(KEYS) do
    if Input.IsButtonTriggered(k, 0) then trig_r = trig_r + 1 end
    local p = Input.IsButtonPressed(k, 0)
    if p and not down[k] then presses = presses + 1 end
    down[k] = p
  end
  if renders % 120 == 0 then
    say(string.format("renders %d updates %d: presses seen held %d, triggered in render %d, triggered in update %d", renders, updates, presses, trig_r, trig_u))
  end
end)
mod:AddCallback(ModCallbacks.MC_POST_UPDATE, function()
  updates = updates + 1
  for _, k in ipairs(KEYS) do
    if Input.IsButtonTriggered(k, 0) then trig_u = trig_u + 1 end
  end
end)
