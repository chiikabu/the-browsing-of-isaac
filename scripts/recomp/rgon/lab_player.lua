-- lab_player.lua (development only; ISAAC_RGON_LAB=lab_player.lua, and start a run)
-- Entity_Player grew between the game version REPENTOGON describes and this
-- one, so its fields have moved by different amounts along the structure.
-- This measures by how much, field by field: a value is set through the
-- game's own Lua API, and the structure is searched around where REPENTOGON
-- has the field for the word that now holds that value.
local T = ...
local B = T.B
local r32, rf32, r8 = B.r32, B.rf32, B.r8
local mod = RegisterMod("rgon lab player", 1)
local frames, done = 0, false
local function f32bits(x) return B.f2i(x + 0.0) end

local function probe(p)
  local a = B.ptr(p)
  B.log(string.format("lab_player: player at %08x, type %d", a, p:GetPlayerType()))
  p:AddCoins(37 - p:GetNumCoins()) p:AddBombs(13 - p:GetNumBombs()) p:AddKeys(7 - p:GetNumKeys())
  p:AddMaxHearts(4, true) p:AddSoulHearts(5) p:AddGoldenHearts(1) p:AddBoneHearts(2) p:AddBrokenHearts(1) p:AddRottenHearts(2)
  p:AddGigaBombs(3) p:AddEternalHearts(1)
  p:AddCollectible(CollectibleType.COLLECTIBLE_BOOK_OF_BELIAL, 3, false)
  p:AddCollectible(CollectibleType.COLLECTIBLE_SAD_ONION, 0, false)
  p:AddCollectible(CollectibleType.COLLECTIBLE_SAD_ONION, 0, false)
  p:AddCollectible(CollectibleType.COLLECTIBLE_SAD_ONION, 0, false)
  p:AddTrinket(TrinketType.TRINKET_PURPLE_HEART)
  p:DonateLuck(3)
  p:AddCacheFlags(CacheFlag.CACHE_ALL)
  p:EvaluateItems()
  local list = {
    -- name, REPENTOGON's offset, the 32-bit value expected there now
    { "_maxHearts", 0x1340, p:GetMaxHearts() },
    { "_redHearts", 0x1344, p:GetHearts() },
    { "_eternalHearts", 0x1348, p:GetEternalHearts() },
    { "_soulHearts", 0x134c, p:GetSoulHearts() },
    { "_blackHearts", 0x1350, p:GetBlackHearts() },
    { "_numKeys", 0x135c, p:GetNumKeys() },
    { "_numBombs", 0x1364, p:GetNumBombs() },
    { "_numCoins", 0x1368, p:GetNumCoins() },
    { "_maxfiredelay", 0x145c, f32bits(p.MaxFireDelay) },
    { "_damage", 0x146c, f32bits(p.Damage) },
    { "_tearrange", 0x147c, f32bits(p.TearRange) },
    { "_donateLuck", 0x1530, 3 },
    { "_movespeed", 0x155c, f32bits(p.MoveSpeed) },
    { "_luck", 0x1560, f32bits(p.Luck) },
    { "_activeDesc[0].Item", 0x1574, CollectibleType.COLLECTIBLE_BOOK_OF_BELIAL },
    { "_activeDesc[0].Charge", 0x157c, p:GetActiveCharge(0) },
    { "_controllerIndex", 0x160c, p.ControllerIndex },
    { "_trinketsID[0]", 0x16b0, TrinketType.TRINKET_PURPLE_HEART },
    { "_goldenHearts", 0x1938, p:GetGoldenHearts() },
    { "_babySkin", 0x1ad8, p.BabySkin },
    { "_boneHearts", 0x1d74, p:GetBoneHearts() },
    { "_brokenHearts", 0x1d8c, p:GetBrokenHearts() },
    { "_rottenHearts", 0x1d90, p:GetRottenHearts() },
    { "_numGigaBombs", 0x1dc0, p:GetNumGigaBombs() },
    { "_megaBlastDuration", 0x18e0, 0 },
    { "_playerType", 0x13bc, p:GetPlayerType() },
    { "_bombPlaceDelay", 0x1604, 0 },
    { "_headDirection", 0x161c, p:GetHeadDirection() },
    { "_moveDirection", 0x1618, p:GetMovementDirection() },
    { "_d8DamageModifier(1.0)", 0x1928, f32bits(1.0) },
    { "_d8RangeModifier(1.0)", 0x1930, f32bits(1.0) },
    { "_playerHUD(ptr)", 0x20a8, -1 },
  }
  -- raw words around the regions that still need placing
  for _, r in ipairs({ { 0x15f0, 0x1640 }, { 0x1900, 0x1960 }, { 0x1d70, 0x1de0 }, { 0x1810, 0x1830 }, { 0x20a0, 0x20e0 } }) do
    local line = {}
    for at = r[1], r[2] - 4, 4 do line[#line + 1] = string.format("%08x", r32(a + at)) end
    B.log(string.format("lab_player: raw %04x..%04x: %s", r[1], r[2], table.concat(line, " ")))
  end
  for _, e in ipairs(list) do
    if math.type(e[3]) ~= "integer" then e[3] = math.tointeger(tonumber(e[3]) or -12345) or -12345 end
    local hits = {}
    for d = -16, 64, 4 do
      if r32(a + e[2] + d) == (e[3] & 0xffffffff) then hits[#hits + 1] = string.format("%+d", d) end
    end
    B.log(string.format("lab_player: %-22s was 0x%04x, value %08x: found at %s", e[1], e[2], e[3] & 0xffffffff, #hits > 0 and table.concat(hits, " ") or "nowhere near"))
  end
  -- the collectible counts: a vector<int> indexed by item id (REPENTOGON 0x16b8)
  for d = 0, 40, 4 do
    local first, last = r32(a + 0x16b8 + d), r32(a + 0x16b8 + d + 4)
    if first > 0x10000 and last > first and last - first < 0x4000 and (last - first) % 4 == 0 and B.r32(first + 4) == 3 then
      B.log(string.format("lab_player: _collectibleCounts  was 0x16b8: a vector with [1] == 3 at %+d (%d entries)", d, (last - first) // 4))
    end
  end
  -- the smelted trinkets: a vector of { short count, short golden count } indexed by trinket id (REPENTOGON 0x1738)
  local t = TrinketType.TRINKET_PURPLE_HEART
  local function scan(label)
    for d = 0, 48, 4 do
      local first, last = r32(a + 0x1738 + d), r32(a + 0x1738 + d + 4)
      if first > 0x10000 and last > first and last - first < 0x4000 and (last - first) % 4 == 0 and first + 4 * t + 4 <= last then
        B.log(string.format("lab_player: %s: vector at 0x1738%+d, %d entries of 4 bytes, [purple heart] = %04x %04x, [golden-capable next] = %08x",
          label, d, (last - first) // 4, B.r16(first + 4 * t), B.r16(first + 4 * t + 2), r32(first + 4 * t + 4)))
      end
    end
  end
  scan("before smelting")
  p:UseActiveItem(CollectibleType.COLLECTIBLE_SMELTER, false, false, true, false, -1)
  scan("after smelting one")
  p:AddTrinket(t | TrinketType.TRINKET_GOLDEN_FLAG)
  p:UseActiveItem(CollectibleType.COLLECTIBLE_SMELTER, false, false, true, false, -1)
  scan("after smelting a golden one too")
  B.log("lab_player: held trinket now " .. p:GetTrinket(0) .. ", multiplier " .. p:GetTrinketMultiplier(t))
  B.log("lab_player: the smelted purple heart shows in the game's own API: " .. tostring(p:HasTrinket(TrinketType.TRINKET_PURPLE_HEART)))
  -- single bytes: _canShoot (REPENTOGON 0x1811), the game's CanShoot()
  local hits = {}
  for d = 0, 40 do if r8(a + 0x1811 + d) == (p:CanShoot() and 1 or 0) then hits[#hits + 1] = d end end
  B.log("lab_player: _canShoot was 0x1811, CanShoot() " .. tostring(p:CanShoot()) .. ": bytes equal at +" .. table.concat(hits, " +"))
  B.log("lab_player: done")
end

mod:AddCallback(ModCallbacks.MC_POST_UPDATE, function()
  if done then return end
  frames = frames + 1
  if frames < 20 then return end
  done = true
  local ok, err = pcall(probe, Isaac.GetPlayer(0))
  if not ok then B.log("lab_player: stopped: " .. tostring(err)) end
end)
