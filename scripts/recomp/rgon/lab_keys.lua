-- lab_keys.lua (development only; ISAAC_RGON_LAB=lab_keys.lua, start a run and press keys)
-- What Input.IsButtonTriggered / IsButtonPressed answer for keyboard keys, per
-- controller index, as a mod's menu reads them (Dead Sea Scrolls tests
-- `IsButtonTriggered(key, i) and not IsButtonTriggered(key % 32, i)`).
local T = ...
local B = T.B
local say = function(s) B.log("lab_keys: " .. s) end
local mod = RegisterMod("rgon lab keys", 1)
local KEYS = { C = Keyboard.KEY_C, F1 = Keyboard.KEY_F1, Q = Keyboard.KEY_Q, BACKSPACE = Keyboard.KEY_BACKSPACE,
               ENTER = Keyboard.KEY_ENTER, SPACE = Keyboard.KEY_SPACE, E = Keyboard.KEY_E }
local said = 0
local first = true
mod:AddCallback(ModCallbacks.MC_POST_RENDER, function()
  if first then
    first = false
    local p = Isaac.GetPlayer(0)
    say("player 0 ControllerIndex " .. tostring(p and p.ControllerIndex))
    for name, key in pairs(KEYS) do say(name .. " = " .. tostring(key) .. ", % 32 = " .. tostring(key % 32)) end
  end
  if said > 200 then return end
  for name, key in pairs(KEYS) do
    for i = 0, 4 do
      local trig, pressed = Input.IsButtonTriggered(key, i), Input.IsButtonPressed(key, i)
      local trig32, pressed32 = Input.IsButtonTriggered(key % 32, i), Input.IsButtonPressed(key % 32, i)
      if trig or trig32 or ((pressed or pressed32) and said < 60) then
        said = said + 1
        say(string.format("%s index %d: triggered %s pressed %s; button %d triggered %s pressed %s", name, i, tostring(trig), tostring(pressed),
          key % 32, tostring(trig32), tostring(pressed32)))
      end
    end
  end
end)
