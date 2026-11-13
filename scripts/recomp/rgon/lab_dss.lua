-- lab_dss.lua (development only; ISAAC_RGON_LAB=lab_dss.lua, start a run with a mod that has
-- a Dead Sea Scrolls menu and press its keys)
-- The state of the open Dead Sea Scrolls menu, once a second and on each key
-- the menu listens to, to see why a press does not close it.
local T = ...
local B = T.B
local say = function(s) B.log("lab_dss: " .. s) end
local mod = RegisterMod("rgon lab dss", 1)
local game = Game()
local f = 0
local function state(tag)
  local d = rawget(_G, "DeadSeaScrollsMenu")
  if type(d) ~= "table" then say(tag .. ": no DeadSeaScrollsMenu") return end
  local m = d.OpenedMenu
  local key = m and m.DirectoryKey
  local item = key and key.Item
  say(string.format("%s: frame %d open %s menu %s exiting %s path %s preventClosing %s item %s paused %s keybind %s queued %s exitingMenu %s",
    tag, f, tostring(d.IsOpen and d.IsOpen()), tostring(m and m.Name), tostring(m and m.Exiting), tostring(key and key.Path and #key.Path),
    tostring(key and key.PreventClosing), tostring(item and (item.title or item.format or "?")), tostring(game:IsPaused()),
    tostring(d.GetMenuKeybindSetting and d.GetMenuKeybindSetting()), tostring(d.QueuedMenus and #d.QueuedMenus), tostring(d.ExitingMenu)))
  if item and f < 400 then
    local keys = {}
    for k, v in pairs(item) do keys[#keys + 1] = tostring(k) .. "=" .. type(v) end
    table.sort(keys)
    say("  item fields: " .. table.concat(keys, " "))
  end
end
local WATCH = { C = Keyboard.KEY_C, F1 = Keyboard.KEY_F1, Q = Keyboard.KEY_Q, BACKSPACE = Keyboard.KEY_BACKSPACE, ENTER = Keyboard.KEY_ENTER, E = Keyboard.KEY_E }
mod:AddPriorityCallback(ModCallbacks.MC_POST_RENDER, CallbackPriority.IMPORTANT, function()
  f = f + 1
  if f % 60 == 1 then state("tick") end
  for name, key in pairs(WATCH) do
    if Input.IsButtonTriggered(key, 0) then state("key " .. name .. " (first in POST_RENDER)") end
  end
end)
mod:AddPriorityCallback(ModCallbacks.MC_POST_RENDER, CallbackPriority.LATE, function()
  for name, key in pairs(WATCH) do
    if Input.IsButtonTriggered(key, 0) then state("key " .. name .. " (last in POST_RENDER)") end
  end
end)
