-- lab_trig2.lua (development only; ISAAC_RGON_LAB=lab_trig2.lua, start a run, press F2 several times)
-- The order of update and render callbacks around a key press, with what
-- Input.IsButtonTriggered / IsButtonPressed answer in each: U = MC_POST_UPDATE,
-- R = MC_POST_RENDER, I = MC_INPUT_ACTION (first of a burst), then t (triggered)
-- and p (pressed) as 0/1, and the milliseconds since the previous callback.
local T = ...
local B = T.B
local say = function(s) B.log("lab_trig2: " .. s) end
local mod = RegisterMod("rgon lab trig2", 1)
local KEY = Keyboard.KEY_F2
local ring, n = {}, 0
local follow, line, reports = 0, nil, 0
local last = Isaac.GetTime()
local was = false
local function note(kind)
  local t, p = Input.IsButtonTriggered(KEY, 0), Input.IsButtonPressed(KEY, 0)
  local now = Isaac.GetTime()
  local e = string.format("%s t%d p%d +%d", kind, t and 1 or 0, p and 1 or 0, now - last)
  last = now
  n = n + 1
  ring[n % 6] = e
  if follow > 0 then
    line[#line + 1] = e
    follow = follow - 1
    if follow == 0 and reports < 30 then
      reports = reports + 1
      say(table.concat(line, " | "))
    end
  elseif (p or t) and not was then
    line = {}
    for i = n - 4, n do if ring[i % 6] then line[#line + 1] = ring[i % 6] end end
    line[#line] = ">> " .. line[#line]
    follow = 9
  end
  was = p or t
end
mod:AddCallback(ModCallbacks.MC_POST_UPDATE, function() note("U") end)
mod:AddCallback(ModCallbacks.MC_POST_RENDER, function() note("R") end)
