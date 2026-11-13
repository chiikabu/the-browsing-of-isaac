-- lab_trigpad.lua (development only; ISAAC_RGON_LAB=lab_trigpad.lua, start a run with a controller and press a button many times)
-- lab_trig.lua for a controller: how many presses a mod sees as "triggered"
-- from a render callback, against how many it sees held at all. Every
-- button id 0..31 of controller indices 1..4 is asked, and a render counts
-- once if any of them is triggered (pressed: once per change from none held
-- to some held), so no button numbering is assumed.
local T = ...
local B = T.B
local say = function(s) B.log("lab_trigpad: " .. s) end
local mod = RegisterMod("rgon lab trigpad", 1)
local trig_r, trig_u, presses, held = 0, 0, 0, false
local renders, updates = 0, 0
local function any(f)
  for c = 1, 4 do
    for b = 0, 31 do
      if f(b, c) then return true end
    end
  end
  return false
end
mod:AddCallback(ModCallbacks.MC_POST_RENDER, function()
  renders = renders + 1
  if any(Input.IsButtonTriggered) then trig_r = trig_r + 1 end
  local p = any(Input.IsButtonPressed)
  if p and not held then presses = presses + 1 end
  held = p
  if renders % 120 == 0 then
    say(string.format("renders %d updates %d: presses seen held %d, triggered in render %d, triggered in update %d", renders, updates, presses, trig_r, trig_u))
  end
end)
mod:AddCallback(ModCallbacks.MC_POST_UPDATE, function()
  updates = updates + 1
  if any(Input.IsButtonTriggered) then trig_u = trig_u + 1 end
end)
