-- api_more.lua -- round 104: functions over what the game already offers, the
-- first Fiend Folio asked for once its callbacks stopped starving each other.

local T = ...
local B, R, method, static = T.B, T.R, T.method, T.static
local log = B.log
local type, rawget, rawset, pairs = type, rawget, rawset, pairs
local mathtype = math.type
local unsupported = T.unsupported or function() end

local function int_arg(v, n, what)
  if mathtype(v) == "float" and v == math.floor(v) then v = math.tointeger(v) end
  if mathtype(v) ~= "integer" then error("bad argument #" .. n .. " to '" .. what .. "' (integer expected, got " .. type(v) .. ")", 3) end
  return v
end

------------------------------------------------------------------------------
-- RNG:SetSeed(seed, shiftIdx = 35)
------------------------------------------------------------------------------
-- The game's own takes both; REPENTOGON makes the second optional, and mods
-- written for it leave it out (`rng:SetSeed(room:GetDecorationSeed())`). The
-- game's function is kept and called with 35 when none is given.
do
  local c = T.class_tables("RNG")
  local game_set = c and rawget(c, "SetSeed")
  if type(game_set) == "function" then
    rawset(c, "SetSeed", B.cfn(function(self, seed, shift)
      if shift == nil then shift = 35 end
      return game_set(self, seed, shift)
    end))
    R.Implemented["RNG.SetSeed"] = true
  else
    log("api_more: no RNG.SetSeed to give a default shift to")
  end
end

------------------------------------------------------------------------------
-- RoomDescriptor:GetDimension() -> Dimension
------------------------------------------------------------------------------
-- A descriptor does not hold its dimension; the level's list does: it is the
-- one GetRoomByIdx returns for this room's index in exactly one dimension.
-- The global RoomDescriptor is not the table a descriptor object looks its
-- methods up in (a method put there is not found: test_layer3 said so), so
-- the method goes on the tables of a real descriptor, the first time a run
-- has one: at the first player's init, before any mod's own function for it.
do
  local function get_dimension(self)
    local level = Game():GetLevel()
    local me, idx = GetPtrHash(self), self.SafeGridIndex
    for dim = 0, 2 do
      local d = level:GetRoomByIdx(idx, dim)
      if d ~= nil and GetPtrHash(d) == me then return dim end
    end
    return 0
  end
  local wrapped, done = B.cfn(get_dimension), false
  local function put(obj)
    local mt = obj ~= nil and getmetatable(obj)
    if type(mt) ~= "table" then return false end
    for _, t in pairs({ mt, rawget(mt, "__class"), rawget(mt, "__const") }) do
      if type(t) == "table" and rawget(t, "GetDimension") == nil then rawset(t, "GetDimension", wrapped) end
    end
    return true
  end
  local function install()
    if done then return end
    local level = Game():GetLevel()
    local a = put(level:GetCurrentRoomDesc())
    local b = put(level:GetRoomByIdx(level:GetCurrentRoomIndex(), -1))
    done = a and b
    if done then R.Implemented["RoomDescriptor.GetDimension"] = true end
  end
  if T.listen then
    T.listen(ModCallbacks.MC_POST_PLAYER_INIT, install, -math.huge)
    T.listen(ModCallbacks.MC_POST_NEW_LEVEL, install, -math.huge)
    T.listen(ModCallbacks.MC_POST_NEW_ROOM, install, -math.huge)
  end
end

------------------------------------------------------------------------------
-- EntityPlayer:GetActiveItemSlot(collectible) -> ActiveSlot, or -1
------------------------------------------------------------------------------
method("EntityPlayer", "GetActiveItemSlot", function(self, item)
  item = int_arg(item, 1, "GetActiveItemSlot")
  if item <= 0 then return -1 end
  for slot = 0, 3 do
    if self:GetActiveItem(slot) == item then return slot end
  end
  return -1
end)

------------------------------------------------------------------------------
-- EntityPlayer:GetMaxCoins() / GetMaxKeys() / GetMaxBombs()
------------------------------------------------------------------------------
-- What the game stops counting at: 99, and 999 coins while any player holds
-- Deep Pockets (checked in test_layer3 by adding more than that and reading
-- the count back). REPENTOGON lets a mod move these caps (the "maxcoins",
-- "maxkeys" and "maxbombs" custom caches); the game here keeps its own, so
-- these answer with the cap that is really in force.
local function deep_pockets()
  local n = Game():GetNumPlayers()
  for i = 0, n - 1 do
    if Isaac.GetPlayer(i):HasCollectible(CollectibleType.COLLECTIBLE_DEEP_POCKETS, true) then return true end
  end
  return false
end
method("EntityPlayer", "GetMaxCoins", function() return deep_pockets() and 999 or 99 end)
method("EntityPlayer", "GetMaxKeys", function() return 99 end)
method("EntityPlayer", "GetMaxBombs", function() return 99 end)

------------------------------------------------------------------------------
-- Sprite:HasCustomShader / SetCustomShader / ClearCustomShader (and the champion pair)
------------------------------------------------------------------------------
-- A mod's own shader on one sprite is REPENTOGON's renderer; the layer does
-- not draw with it. No sprite has one, setting one is accepted and said once.
method("Sprite", "HasCustomShader", function() return false end)
method("Sprite", "HasCustomChampionShader", function() return false end)
method("Sprite", "SetCustomShader", function(_, path) unsupported("Sprite:SetCustomShader", "a mod's shader on a sprite (" .. tostring(path) .. ")") end)
method("Sprite", "SetCustomChampionShader", function(_, path) unsupported("Sprite:SetCustomChampionShader", "a mod's shader on a sprite (" .. tostring(path) .. ")") end)
method("Sprite", "ClearCustomShader", function() end)
method("Sprite", "ClearCustomChampionShader", function() end)
for _, n in pairs({ "HasCustomShader", "HasCustomChampionShader", "SetCustomShader", "SetCustomChampionShader", "ClearCustomShader", "ClearCustomChampionShader" }) do
  R.Implemented["Sprite." .. n] = nil
  R.Unsupported = R.Unsupported or {}
  R.Unsupported["Sprite:" .. n] = R.Unsupported["Sprite:" .. n] or "a mod's shader on a sprite"
end
