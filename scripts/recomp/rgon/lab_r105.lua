-- lab_r105.lua (development only; ISAAC_RGON_LAB=lab_r105.lua, and start a run)
-- Two player fields REPENTOGON reads that the layer had no evidence for:
--   * the hallowed-ground countdown (REPENTOGON: 0x1d7c in v1.9.7.12): the
--     ints around it are printed before, while and after the player stands by
--     a holy poop;
--   * the flipped form of Tainted Lazarus (REPENTOGON: 0x1e50): after the
--     player becomes Tainted Lazarus, every word of the object that points at
--     another object with the player's virtual table is printed, with that
--     object's player type and whether it points back.
local T = ...
local B = T.B
local mod = RegisterMod("rgon lab r105", 1)
local f = 0
local say = function(s) B.log("lab_r105: " .. s) end

local function ints(p, a, b)
  local s = {}
  for o = a, b, 4 do s[#s + 1] = string.format("%x=%d", o, B.ri32(p + o)) end
  return table.concat(s, " ")
end

local function scan(tag)
  local pl = Isaac.GetPlayer(0)
  local p = B.ptr(pl)
  local vt = B.r32(p)
  local found = 0
  for o = 0x400, 0x3000, 4 do
    local ok, v = pcall(B.r32, p + o)
    if ok and v ~= p and v > 0x10000 and v % 4 == 0 then
      local ok2, w = pcall(B.r32, v)
      if ok2 and w == vt then
        found = found + 1
        local okb, back = pcall(B.r32, v + o)
        local okt, typ = pcall(function() return T.wrap("EntityPlayer", v):GetPlayerType() end)
        say(string.format("%s: +0x%x -> 0x%08x  type=%s  back=%s  (self type %d)", tag, o, v, tostring(okt and typ), tostring(okb and back == p), pl:GetPlayerType()))
      end
    end
  end
  say(tag .. ": " .. found .. " pointer(s) to another player object")
end

local A, Z = 0x1d60, 0x1dc0
mod:AddCallback(ModCallbacks.MC_POST_UPDATE, function()
  f = f + 1
  local pl = Isaac.GetPlayer(0)
  local p = B.ptr(pl)
  local room = Game():GetRoom()
  if f == 30 then
    say("f30 before: " .. ints(p, A, Z))
    scan("isaac")
  elseif f == 31 then
    local idx = room:GetGridIndex(pl.Position)
    local ok, e = pcall(function() return Isaac.GridSpawn(GridEntityType.GRID_POOP, 6, room:GetGridPosition(idx + 1), true) end)
    say("holy poop spawned beside the player: " .. tostring(ok) .. " " .. tostring(e))
  elseif f == 36 or f == 50 or f == 64 then
    say("f" .. f .. " beside the poop: " .. ints(p, A, Z))
  elseif f == 65 then
    pl.Position = room:GetGridPosition(16)
    say("moved to the far corner")
  elseif f == 66 or f == 70 or f == 80 or f == 100 or f == 140 or f == 200 then
    say("f" .. f .. " away from it: " .. ints(p, A, Z))
  elseif f == 220 then
    pl:ChangePlayerType(PlayerType.PLAYER_LAZARUS_B)
    say("changed to Tainted Lazarus")
  elseif f == 240 then
    scan("after ChangePlayerType")
  elseif f == 250 then
    Isaac.ExecuteCommand("restart " .. PlayerType.PLAYER_LAZARUS_B)
    say("restarted as Tainted Lazarus")
  elseif f == 320 then
    scan("after restart")
    local fl = pl.GetFlippedForm and pl:GetFlippedForm()
    say("GetFlippedForm: " .. tostring(fl and fl:GetPlayerType()))
    say("hallowed now: " .. tostring(pl.GetHallowedGroundCountdown and pl:GetHallowedGroundCountdown()))
  end
end)
say("listening")
