-- lab_ff.lua (development only; ISAAC_RGON_LAB=lab_ff.lua with Fiend Folio installed, and start a run)
-- When a player is initialised, which callbacks fire, in what order, and what
-- Fiend Folio's per-player save table holds after each.
local T = ...
local B = T.B
local mod = RegisterMod("rgon lab ff", 1)
local n = 0

local function shape(player)
  local ok, d = pcall(function() return player:GetData() end)
  if not ok or type(d) ~= "table" then return "GetData: " .. tostring(d) end
  local s = d.ffsavedata
  if s == nil then return "ffsavedata=nil" end
  local keys = 0
  for _ in pairs(s) do keys = keys + 1 end
  return string.format("ffsavedata{%d keys, pillstotake=%s, RunEffects=%s} data=%s", keys, tostring(s.pillstotake), type(s.RunEffects), tostring(d):sub(-8))
end

local function say(what, player)
  n = n + 1
  if n > 60 then return end
  local frame = Game and Game():GetFrameCount() or -1
  B.log(string.format("lab_ff: #%d f%d %s hash=%s type=%s %s", n, frame, what, tostring(GetPtrHash(player)), tostring(player:GetPlayerType()), shape(player)))
end

local late = math.huge
if ModCallbacks.MC_PLAYER_INIT_PRE_LEVEL_INIT_STATS then
  mod:AddPriorityCallback(ModCallbacks.MC_PLAYER_INIT_PRE_LEVEL_INIT_STATS, late, function(_, p) say("PRE_LEVEL_INIT_STATS", p) end)
end
if ModCallbacks.MC_PLAYER_INIT_POST_LEVEL_INIT_STATS then
  mod:AddPriorityCallback(ModCallbacks.MC_PLAYER_INIT_POST_LEVEL_INIT_STATS, late, function(_, p) say("POST_LEVEL_INIT_STATS", p) end)
end
mod:AddPriorityCallback(ModCallbacks.MC_POST_PLAYER_INIT, late, function(_, p) say("POST_PLAYER_INIT", p) end)
mod:AddPriorityCallback(ModCallbacks.MC_POST_GAME_STARTED, late, function(_, cont) say("POST_GAME_STARTED cont=" .. tostring(cont), Isaac.GetPlayer(0)) end)
mod:AddPriorityCallback(ModCallbacks.MC_POST_NEW_LEVEL, late, function() say("POST_NEW_LEVEL", Isaac.GetPlayer(0)) end)
mod:AddPriorityCallback(ModCallbacks.MC_POST_NEW_ROOM, late, function() say("POST_NEW_ROOM", Isaac.GetPlayer(0)) end)
local ticks = 0
mod:AddPriorityCallback(ModCallbacks.MC_POST_PEFFECT_UPDATE, late, function(_, p)
  ticks = ticks + 1
  if ticks == 1 or ticks == 2 or ticks == 30 then say("PEFFECT_UPDATE " .. ticks, p) end
end)
B.log("lab_ff: listening")
