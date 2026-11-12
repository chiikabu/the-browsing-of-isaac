-- lab_innate.lua (development only; ISAAC_RGON_LAB=lab_innate.lua, and start a run)
-- Measurements behind api_innate.lua (round 1 of this lab found: an item wisp
-- spawned with Isaac.Spawn is counted in the player's wisp map +0x1f80 at once
-- and its item's effect applies; Entity:Remove() does not recount, so the map
-- keeps the item until the game's recount 0x007d7740 runs; the game sets the
-- familiar Visible again every frame; a smelted-trinket counter written
-- directly plus TriggerTrinketAdded gives HasTrinket, the multiplier and, after
-- EvaluateItems, the effect).
-- This round:
--   * Visible = false from MC_FAMILIAR_UPDATE: is the wisp still drawn (MC_POST_FAMILIAR_RENDER)?
--   * Remove() followed by the recount 0x007d7740(player, 0) (thiscall, ret 4): is the item gone?
--   * Game():Spawn with a chosen seed: is that the wisp's InitSeed? Can the room's entity list
--     (Room +0x124c, count +0x1254, read by 0x007d7740) find it although FLAG_NO_QUERY hides it?
--   * exit and continue (driven from outside): is a wisp restored, with what seed, flags,
--     player; is a smelted counter written in MC_PRE_GAME_EXIT in the saved run?
--
-- ISAAC_INNATE_LAB=continue: innate items added through the layer's own API
-- (api_innate.lua), then exit and continue driven from outside: which groups
-- come back, do the game's answers and the hidden wisps follow.
local T = ...
if T.B.env("ISAAC_INNATE_LAB") == "continue" then
  local B = T.B
  local mod = RegisterMod("rgon lab innate", 1)
  local f = 0
  local say = function(s) B.log("lab_innate: " .. s) end
  local C = CollectibleType
  local SAD, SPOON, INNER = C.COLLECTIBLE_SAD_ONION, C.COLLECTIBLE_SPOON_BENDER, C.COLLECTIBLE_INNER_EYE
  local CANCER, PENNY = TrinketType.TRINKET_CANCER, TrinketType.TRINKET_SWALLOWED_PENNY

  local function room_wisps()
    local room = B.r32(B.r32(0x00c71678) + 0x18300)
    local n, base = B.r32(room + 0x1254), B.r32(room + 0x124c)
    local out = {}
    for i = 0, n - 1 do
      local e = B.r32(base + 4 * i)
      if e ~= 0 and B.r32(e + 0x28) == 3 and B.r32(e + 0x2c) == 237 and B.r8(e + 0x172) ~= 0 then
        local fam = T.wrap("EntityFamiliar", e)
        out[#out + 1] = string.format("[sub=%d seed=%x flags=%x vis=%s ecc=%d layer=%d]", fam.SubType, fam.InitSeed, fam:GetEntityFlags(),
          tostring(fam.Visible), fam.EntityCollisionClass, fam.OrbitLayer)
      end
    end
    return #out .. " wisp(s) " .. table.concat(out, " ")
  end
  local function state(tag)
    local p = Isaac.GetPlayer(0)
    local sm = p:GetSmeltedTrinkets()
    say(string.format("%s: KEEP sad=%d inner=%d cancer=%d | '' spoon=%d penny=%d | game: Has sad=%s spoon=%s inner=%s; Num sad=%d; HasTrinket cancer=%s penny=%s mult cancer=%d penny=%d; smelted(listed) cancer=%s; MaxFireDelay=%.3f query=%d | %s",
      tag, p:GetInnateCollectibleCount(SAD, "KEEP"), p:GetInnateCollectibleCount(INNER, "KEEP"), p:GetInnateTrinketCount(CANCER, "KEEP"),
      p:GetInnateCollectibleCount(SPOON), p:GetInnateTrinketCount(PENNY),
      tostring(p:HasCollectible(SAD)), tostring(p:HasCollectible(SPOON)), tostring(p:HasCollectible(INNER)), p:GetCollectibleNum(SAD),
      tostring(p:HasTrinket(CANCER)), tostring(p:HasTrinket(PENNY)), p:GetTrinketMultiplier(CANCER), p:GetTrinketMultiplier(PENNY),
      tostring(sm[CANCER] and sm[CANCER].trinketAmount), p.MaxFireDelay, #Isaac.FindByType(3, 237), room_wisps()))
  end

  mod:AddCallback(ModCallbacks.MC_POST_UPDATE, function()
    f = f + 1
    local p = Isaac.GetPlayer(0)
    if f == 30 then
      state("before")
      p:AddInnateCollectible(SAD, 1, "KEEP")
      p:AddInnateCollectible(INNER, 1, "KEEP", 300)
      p:AddInnateCollectible(SPOON)
      p:AddInnateTrinket(CANCER, 1, "KEEP")
      p:AddInnateTrinket(PENNY)
      state("added")
    elseif f == 60 then
      state("f60")
    elseif f == 1010 or f == 1100 or f == 1300 or f == 1500 then
      state("f" .. f .. " (after continue)")
    end
  end)
  mod:AddCallback(ModCallbacks.MC_POST_GAME_STARTED, function(_, cont)
    if cont then
      f = 1000
      state("POST_GAME_STARTED continued")
      local lm = T.innate and T.innate.layer_mod()
      local saved = lm and Isaac.HasModData(lm) and Isaac.LoadModData(lm) or ""
      say("the layer's save file: mod " .. tostring(lm ~= nil) .. ", " .. #saved .. " bytes: " .. (saved:gsub("\n", " | ")))
    end
  end)
  mod:AddCallback(ModCallbacks.MC_PRE_GAME_EXIT, function(_, save) say("PRE_GAME_EXIT save=" .. tostring(save)) end)
  say("listening")
  return
end
local B = T.B
local mod = RegisterMod("rgon lab innate", 1)
local f = 0
local say = function(s) B.log("lab_innate: " .. s) end
local SAD = CollectibleType.COLLECTIBLE_SAD_ONION
local SEED = 0x13572468
local W, rendered, hide = nil, 0, false

local function room_wisps()
  local room = B.r32(B.r32(0x00c71678) + 0x18300)
  local n, base = B.r32(room + 0x1254), B.r32(room + 0x124c)
  local out = {}
  for i = 0, n - 1 do
    local e = B.r32(base + 4 * i)
    if e ~= 0 and B.r32(e + 0x28) == 3 and B.r32(e + 0x2c) == 237 then
      local fam = T.wrap("EntityFamiliar", e)
      out[#out + 1] = string.format("[sub=%d seed=%x flags=%x vis=%s ecc=%d layer=%d exists=%s mine=%s]", B.r32(e + 0x30), fam.InitSeed, fam:GetEntityFlags(),
        tostring(fam.Visible), fam.EntityCollisionClass, fam.OrbitLayer, tostring(fam:Exists()), tostring(B.r32(e + 0x410) == B.ptr(Isaac.GetPlayer(0))))
    end
  end
  return #out .. " wisp(s) in the room list " .. table.concat(out, " ")
end

local function state(tag)
  local p = Isaac.GetPlayer(0)
  say(string.format("%s: Has=%s Num=%d NumReal=%d MaxFireDelay=%.3f query=%d rendered=%d | %s", tag, tostring(p:HasCollectible(SAD)), p:GetCollectibleNum(SAD),
    p:GetCollectibleNum(SAD, true), p.MaxFireDelay, #Isaac.FindByType(3, 237), rendered, room_wisps()))
end
local function smelted(id)
  local first = B.r32(B.ptr(Isaac.GetPlayer(0)) + 0x1748)
  return B.r16(first + 4 * id)
end

mod:AddCallback(ModCallbacks.MC_FAMILIAR_UPDATE, function(_, fam)
  if hide and W and GetPtrHash(fam) == GetPtrHash(W) then fam.Visible = false end
end, 237)
mod:AddCallback(ModCallbacks.MC_POST_FAMILIAR_RENDER, function(_, fam)
  if W and GetPtrHash(fam) == GetPtrHash(W) then rendered = rendered + 1 end
end, 237)

mod:AddCallback(ModCallbacks.MC_POST_UPDATE, function()
  f = f + 1
  local p = Isaac.GetPlayer(0)
  if f == 30 then
    state("before")
    W = Game():Spawn(EntityType.ENTITY_FAMILIAR, 237, p.Position, Vector.Zero, p, SAD, SEED):ToFamiliar()
    W.Visible = false
    W.EntityCollisionClass = EntityCollisionClass.ENTCOLL_NONE
    W.GridCollisionClass = EntityGridCollisionClass.GRIDCOLL_NONE
    W:AddEntityFlags(EntityFlag.FLAG_NO_QUERY | EntityFlag.FLAG_NO_TARGET)
    W:RemoveFromOrbit()
    W.Position = Game():GetRoom():GetCenterPos()
    W.Color = Color(1, 1, 1, 0)
    Isaac.Spawn(EntityType.ENTITY_FAMILIAR, 237, CollectibleType.COLLECTIBLE_BREAKFAST, p.Position, Vector.Zero, p)
    say(string.format("spawned with seed %x: InitSeed %x", SEED, W.InitSeed))
    state("spawned, hidden")
  elseif f == 31 then
    rendered = 0
  elseif f == 40 then
    state("10 frames, Visible set only once")
    rendered = 0
    hide = true
  elseif f == 50 then
    state("10 frames with Visible = false from MC_FAMILIAR_UPDATE")
  elseif f == 60 then
    local w2 = Game():Spawn(EntityType.ENTITY_FAMILIAR, 237, p.Position, Vector.Zero, p, SAD, 77):ToFamiliar()
    state("a second Sad Onion wisp")
    w2:Remove()
    state("second removed, no recount")
    local r = B.call(0x007d7740, B.ptr(p), 0)
    state("after the recount 0x007d7740(player, 0) -> " .. tostring(r))
  elseif f == 70 then
    -- the trinket counter is left at +1 for the exit test
    say("smelted Swallowed Penny before: " .. smelted(TrinketType.TRINKET_SWALLOWED_PENNY))
    local id = TrinketType.TRINKET_SWALLOWED_PENNY
    local first = B.r32(B.ptr(p) + 0x1748)
    B.w16(first + 4 * id, B.r16(first + 4 * id) + 1)
    say("smelted Swallowed Penny set to " .. smelted(id) .. " in the run (one more is added in MC_PRE_GAME_EXIT)")
  elseif f == 1010 then
    state("10 frames after continue")
  elseif f % 60 == 0 then
    state("f" .. f)
  end
end)
mod:AddCallback(ModCallbacks.MC_POST_GAME_STARTED, function(_, cont)
  say("POST_GAME_STARTED continued=" .. tostring(cont) .. " smelted Swallowed Penny=" .. smelted(TrinketType.TRINKET_SWALLOWED_PENNY)
    .. " Has(SAD)=" .. tostring(Isaac.GetPlayer(0):HasCollectible(SAD)) .. " | " .. room_wisps())
  if cont then f = 1000 end
end)
mod:AddCallback(ModCallbacks.MC_PRE_GAME_EXIT, function(_, save)
  local id = TrinketType.TRINKET_SWALLOWED_PENNY
  local first = B.r32(B.ptr(Isaac.GetPlayer(0)) + 0x1748)
  B.w16(first + 4 * id, B.r16(first + 4 * id) + 1)
  say("PRE_GAME_EXIT save=" .. tostring(save) .. "; smelted Swallowed Penny now " .. smelted(id) .. " | " .. room_wisps())
  W = nil
end)
mod:AddCallback(ModCallbacks.MC_POST_PLAYER_INIT, function(_, pl) if f >= 1000 then say("POST_PLAYER_INIT after continue | " .. room_wisps()) end end)
say("listening")
