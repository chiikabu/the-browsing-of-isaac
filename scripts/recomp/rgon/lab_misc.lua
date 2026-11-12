-- lab_misc.lua (development only; ISAAC_RGON_LAB=lab_misc.lua, and start a run)
-- Player fields that need the game to do something before they hold a
-- telling value: each is read before and after the game's own mechanic.
local T = ...
local B = T.B
local r32, ri32, rf32, r8 = B.r32, B.ri32, B.rf32, B.r8
local mod = RegisterMod("rgon lab misc", 1)
local frames, done = 0, false

local function probe()
  local p = Isaac.GetPlayer(0)
  local a = B.ptr(p)
  local function words(from, to)
    local t = {}
    for off = from, to - 4, 4 do t[#t + 1] = r32(a + off) end
    return t
  end
  local function diff(label, from, to, act)
    local before = words(from, to)
    act()
    local after = words(from, to)
    local out = {}
    for i = 1, #before do
      if before[i] ~= after[i] then out[#out + 1] = string.format("0x%04x: %08x -> %08x", from + 4 * (i - 1), before[i], after[i]) end
    end
    B.log("lab_misc: " .. label .. ": " .. (#out > 0 and table.concat(out, ", ") or "nothing changed in 0x" .. string.format("%04x..0x%04x", from, to)))
  end
  -- REPENTOGON: _speedModifier 0x1518, _fireDelayModifier 0x151c, _damageModifier 0x1520, _tearRangeModifier 0x1524,
  -- _shotSpeedModifier 0x1528, _luckModifier 0x152c (pills move them by one each)
  diff("Speed Up pill", 0x1500, 0x1560, function() p:UsePill(PillEffect.PILLEFFECT_SPEED_UP, PillColor.PILL_NULL, UseFlag.USE_NOANIM) end)
  diff("Tears Up pill", 0x1500, 0x1560, function() p:UsePill(PillEffect.PILLEFFECT_TEARS_UP, PillColor.PILL_NULL, UseFlag.USE_NOANIM) end)
  diff("Range Up pill", 0x1500, 0x1560, function() p:UsePill(PillEffect.PILLEFFECT_RANGE_UP, PillColor.PILL_NULL, UseFlag.USE_NOANIM) end)
  diff("Shot Speed Up pill", 0x1500, 0x1560, function() p:UsePill(PillEffect.PILLEFFECT_SHOT_SPEED_UP, PillColor.PILL_NULL, UseFlag.USE_NOANIM) end)
  diff("Luck Up pill", 0x1500, 0x1560, function() p:UsePill(PillEffect.PILLEFFECT_LUCK_UP, PillColor.PILL_NULL, UseFlag.USE_NOANIM) end)
  -- _deadEyeCharges 0x189c, _megaBlastDuration 0x18e0
  diff("AddDeadEyeCharge x2", 0x1880, 0x1920, function() p:AddDeadEyeCharge() p:AddDeadEyeCharge() end)
  diff("ClearDeadEyeCharge", 0x1880, 0x1920, function() p:ClearDeadEyeCharge() end)
  diff("Mega Blast used", 0x1880, 0x1920, function() p:UseActiveItem(CollectibleType.COLLECTIBLE_MEGA_BLAST, false, false, true, false, -1) end)
  -- _urnSouls 0x1cf8 (Tainted Forgotten's Urn of Souls counts them; the item's own function adds)
  diff("AddUrnSouls(7)", 0x1cc0, 0x1d80, function() p:AddUrnSouls(7) end)
  -- _itemStateCooldown 0x15f8, _bombPlaceDelay 0x1604: a bomb placed
  diff("SetItemState via the layer / nothing", 0x15f0, 0x1640, function() end)
  B.log("lab_misc: done")
end

mod:AddCallback(ModCallbacks.MC_POST_UPDATE, function()
  if done then return end
  frames = frames + 1
  if frames < 20 then return end
  done = true
  local ok, err = pcall(probe)
  if not ok then B.log("lab_misc: stopped: " .. tostring(err)) end
end)
