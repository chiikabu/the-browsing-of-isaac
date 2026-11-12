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

------------------------------------------------------------------------------
-- round 105: what Fiend Folio still raised on once a run was going
------------------------------------------------------------------------------
local this, wrap, field, listen = T.this, T.wrap, T.field, T.listen
local call, r32 = B.call, B.r32
local P = "EntityPlayer"

-- EntityPlayer:GetHallowedGroundCountdown() / SetHallowedGroundCountdown(n)
-- REPENTOGON's 0x1d7c moved by 20, measured (lab_r105.lua): of the 25 words
-- from 0x1d60 it is the one that changes, 0 away from a holy poop and 3 while
-- the player stands beside one.
if field then field(P, "GetHallowedGroundCountdown", "SetHallowedGroundCountdown", 0x1d90, "i32") end

-- EntityPlayer:GetFlippedForm() -> Tainted Lazarus's other form, or nil
-- 0x1e6c (REPENTOGON's 0x1e50 moved by 28), measured (lab_r105.lua): after
-- the player becomes Tainted Lazarus, by ChangePlayerType or by a restart, it
-- is the one word of the object that points at another player object; that
-- object's type is 38 (the dead form) and its own 0x1e6c points back. It is 0
-- for Isaac.
method(P, "GetFlippedForm", function(self)
  local other = r32(this(self, "GetFlippedForm") + 0x1e6c)
  if other == 0 then return nil end
  return wrap(P, other)
end)

-- EntityPlayer:IsCollectibleCostumeVisible(collectible, layer id or name) -> boolean
-- 0x0075d9c0, the one match of REPENTOGON's signature, and its body is the
-- declaration: `push [ebp+0xc]` (the layer), `push [ebp+8]` and a call on
-- the item config at [0x00c7169c]+0x2a404 (the collectible's entry), then
-- `push eax; mov ecx, esi; call 0x0075d900` (the item form), `ret 8`.
method(P, "IsCollectibleCostumeVisible", function(self, item, layer)
  item = int_arg(item, 1, "IsCollectibleCostumeVisible")
  local sprite = self:GetSprite()
  local id
  if type(layer) == "string" then
    local l = sprite:GetLayer(layer)
    if l == nil then error("Invalid layer name " .. layer, 2) end
    id = l:GetLayerID()
  else
    id = int_arg(layer, 2, "IsCollectibleCostumeVisible")
    if id < 0 or id >= sprite:GetLayerCount() then error("Invalid layer ID " .. id, 2) end
  end
  return (call(0x0075d9c0, this(self, "IsCollectibleCostumeVisible"), item & 0xffffffff, id) & 0xff) ~= 0
end)

-- EntityPlayer:HasChanceRevive() -> the extra-lives count would end in "?"
-- Guppy's Collar. (REPENTOGON also asks its own table of mods' revive items
-- tagged "chancerevive"; the layer has no such items.)
method(P, "HasChanceRevive", function(self)
  return self:HasCollectible(CollectibleType.COLLECTIBLE_GUPPYS_COLLAR, false)
end)

-- EntityPlayer:CheckFamiliarEx(variant, count, rng, item = nil, subtype = -1) -> { EntityFamiliar }
-- The game's CheckFamiliar, and the familiars it spawned: those of the
-- variant that were not there before the call.
method(P, "CheckFamiliarEx", function(self, variant, count, rng, item, subtype)
  variant = int_arg(variant, 1, "CheckFamiliarEx")
  count = int_arg(count, 2, "CheckFamiliarEx")
  subtype = subtype == nil and -1 or int_arg(subtype, 5, "CheckFamiliarEx")
  local FAMILIAR = EntityType.ENTITY_FAMILIAR
  local before = {}
  for _, e in pairs(Isaac.FindByType(FAMILIAR, variant, subtype, false, false)) do before[GetPtrHash(e)] = true end
  self:CheckFamiliar(variant, count, rng, item, subtype)
  local out, n = {}, 0
  for _, e in pairs(Isaac.FindByType(FAMILIAR, variant, subtype, false, false)) do
    if not before[GetPtrHash(e)] then
      local f = e:ToFamiliar()
      if f then n = n + 1 out[n] = f end
    end
  end
  return out
end)

------------------------------------------------------------------------------
-- EntitySaveStateManager.GetEntityData(mod, entity) -> table, existed
------------------------------------------------------------------------------
-- A table per mod and entity that outlives the entity's Lua object: a pickup
-- left in a room is the same pickup when the room is entered again, and
-- GetData() is not. A player is told by its object (players stay for the
-- run, and Tainted Lazarus's two forms share an InitSeed); anything else by
-- its type and InitSeed, which the game keeps for an entity it stores with a
-- room. Kept for the run in memory: REPENTOGON also writes these tables with
-- the save, and follows the game's save states (Glowing Hourglass); the layer
-- does neither, and says so the first time a mod asks.
do
  local PLAYER = EntityType.ENTITY_PLAYER
  local by_mod = setmetatable({}, { __mode = "k" })
  local told = false
  local function key_of(entity)
    if entity.Type == PLAYER then return "p" .. GetPtrHash(entity) end
    return entity.Type .. ":" .. entity.InitSeed
  end
  local function get(mod, entity, create, what)
    if type(mod) ~= "table" then error("bad argument #1 to '" .. what .. "' (ModReference expected, got " .. type(mod) .. ")", 3) end
    if type(entity) ~= "userdata" then error("bad argument #2 to '" .. what .. "' (Entity expected, got " .. type(entity) .. ")", 3) end
    if not told then
      told = true
      unsupported("EntitySaveStateManager", "its tables are kept for the run, not written with the save or rewound with it")
    end
    local store = by_mod[mod]
    if not store then
      if not create then return nil end
      store = {}
      by_mod[mod] = store
    end
    local k = key_of(entity)
    local d = store[k]
    if d ~= nil then return d, true end
    if not create then return nil end
    d = {}
    store[k] = d
    return d, false
  end
  local ESM = {
    GetEntityData = function(mod, entity) return get(mod, entity, true, "GetEntityData") end,
    TryGetEntityData = function(mod, entity) return (get(mod, entity, false, "TryGetEntityData")) end,
  }
  if rawget(_G, "EntitySaveStateManager") == nil then
    rawset(_G, "EntitySaveStateManager", ESM)
    R.Implemented["EntitySaveStateManager.GetEntityData"] = true
    R.Implemented["EntitySaveStateManager.TryGetEntityData"] = true
  end
  -- a run is over: the next one's players reuse these objects' addresses
  if listen then
    listen(ModCallbacks.MC_PRE_GAME_EXIT, function()
      for m in pairs(by_mod) do by_mod[m] = nil end
    end, math.huge)
  end
end

------------------------------------------------------------------------------
-- EntityPlayer:BlockCollectible / UnblockCollectible / IsCollectibleBlocked (and the trinket three)
------------------------------------------------------------------------------
-- REPENTOGON makes the game itself believe a blocked item is not held. The
-- layer makes scripts believe it: HasCollectible, GetCollectibleNum,
-- HasTrinket and GetTrinketMultiplier answer "none" for a blocked item to
-- every mod, and the game's own code still sees the item. That is a gap (a
-- mod that blocks an item to replace its effect gets both effects), said
-- once and listed.
--
-- The four are wrapped here, when the layer loads, and not when something is
-- first blocked: a mod that hooks HasCollectible itself (Fiend Folio's
-- health library does, to unblock, ask and block again) keeps what it found
-- as "the game's", and a wrapper put in later would replace the mod's hook
-- and be skipped by it. While nothing is blocked the wrapper is one test of
-- a flag. What the player really holds is asked of the game's own functions,
-- never through the player's methods, which a mod may have hooked to call
-- back in here.
do
  local c = T.class_tables(P)
  local blocked = { [false] = {}, [true] = {} }     -- [is a trinket][player] = { [id] = true }
  local any, told = false, false
  local GAME = {}
  local function is_blocked(self, trinket, id)
    local s = blocked[trinket][GetPtrHash(self)]
    return s ~= nil and s[id] == true
  end
  local function over(name, trinket, none)
    local game_fn = c and rawget(c, name)
    if type(game_fn) ~= "function" then log("api_more: no EntityPlayer." .. name .. " to teach about blocked items") return end
    GAME[name] = game_fn
    rawset(c, name, B.cfn(function(self, id, ...)
      if any and mathtype(id) == "integer" and is_blocked(self, trinket, trinket and (id & 0x7fff) or id) then return none end
      return game_fn(self, id, ...)
    end))
  end
  over("HasCollectible", false, false)
  over("GetCollectibleNum", false, 0)
  over("HasTrinket", true, false)
  over("GetTrinketMultiplier", true, 0)
  local function really_has(self, trinket, id)
    local f = GAME[trinket and "HasTrinket" or "HasCollectible"]
    return f ~= nil and f(self, id) == true
  end
  -- as REPENTOGON does when the answer changes: the item's own cache flags, evaluated now
  local function refresh(self, trinket, id)
    local config = Isaac.GetItemConfig()
    local item = trinket and config:GetTrinket(id) or (not trinket and config:GetCollectible(id))
    local flags = item and item.CacheFlags or 0
    if flags ~= 0 then
      self:AddCacheFlags(flags)
      self:EvaluateItems()
    end
  end
  local function setter(name, trinket, value)
    method(P, name, function(self, id)
      id = int_arg(id, 1, name)
      if trinket then id = id & 0x7fff end
      local h = GetPtrHash(self)
      local s = blocked[trinket][h]
      if value then
        if not told then
          told = true
          unsupported("EntityPlayer:BlockCollectible", "scripts see a blocked item as not held; the game's own code still sees it")
        end
        if not s then s = {} blocked[trinket][h] = s end
        if s[id] then return end
        s[id] = true
        any = true
      else
        if not (s and s[id]) then return end
        s[id] = nil
      end
      if really_has(self, trinket, id) then refresh(self, trinket, id) end
    end)
  end
  setter("BlockCollectible", false, true)
  setter("UnblockCollectible", false, false)
  setter("BlockTrinket", true, true)
  setter("UnblockTrinket", true, false)
  method(P, "IsCollectibleBlocked", function(self, id) return is_blocked(self, false, int_arg(id, 1, "IsCollectibleBlocked")) end)
  method(P, "IsTrinketBlocked", function(self, id) return is_blocked(self, true, int_arg(id, 1, "IsTrinketBlocked") & 0x7fff) end)
  for _, n in pairs({ "BlockCollectible", "UnblockCollectible", "BlockTrinket", "UnblockTrinket" }) do
    R.Unsupported = R.Unsupported or {}
    R.Unsupported["EntityPlayer:" .. n] = R.Unsupported["EntityPlayer:" .. n] or "scripts see a blocked item as not held; the game's own code still sees it"
  end
  if listen then
    listen(ModCallbacks.MC_PRE_GAME_EXIT, function()
      blocked[false], blocked[true] = {}, {}
      any = false
    end, math.huge)
  end
end

------------------------------------------------------------------------------
-- the HUD: its sprites, and its eight player slots
------------------------------------------------------------------------------
-- Measured in a run (lab_hud.lua). A player slot is 0x6dc bytes here
-- (REPENTOGON: 0x6e0), the eight of them from the HUD's start: each begins
-- with its player (0 when free), the HUD (+4) and its own index (+8), and
-- that is checked each time a slot is handed out. The sprites follow, each
-- 0x20 lower than REPENTOGON has it, told by the file each has loaded
-- (ui_chargebar, ui_hearts, hudpickups, ui_cardspills, ui_streak,
-- ui_FortunePaper, "coop menu", ui_inventory, ui_crafting, ui_poops); a
-- sprite is checked to be one when it is asked for.
do
  local SLOT, SLOTS = 0x6dc, 8
  if T.inner_sprite then
    T.inner_sprite("HUD", "GetChargeBarSprite", 0x3778)
    T.inner_sprite("HUD", "GetHeartsSprite", 0x39a0)
    T.inner_sprite("HUD", "GetPickupsHUDSprite", 0x3ab4)
    T.inner_sprite("HUD", "GetCardsPillsSprite", 0x3bc8)
    T.inner_sprite("HUD", "GetStreakSprite", 0x3cfc)
    T.inner_sprite("HUD", "GetFortuneSprite", 0x5258)
    T.inner_sprite("HUD", "GetCoopMenuSprite", 0x54dc)
    T.inner_sprite("HUD", "GetInventorySprite", 0x55f0)
    T.inner_sprite("HUD", "GetCraftingSprite", 0x5704)
    T.inner_sprite("HUD", "GetPoopSpellSprite", 0x5818)
  end

  local H = {}                                   -- PlayerHUD's methods
  local function at(self)
    local p = B.ptr(self)
    if p == 0 then error("rgon: PlayerHUD method called without its object", 3) end
    return p
  end
  function H:GetPlayer()
    local pl = r32(at(self))
    if pl == 0 then return nil end
    return wrap(P, pl)
  end
  function H:GetHUD() return Game():GetHUD() end
  function H:GetIndex() return B.r16(at(self) + 8) end
  local HUD_MT = { __index = H, __type = "PlayerHUD", __name = "PlayerHUD",
    __eq = function(a, b) return B.ptr(a) == B.ptr(b) end,
    __tostring = function(self) return "PlayerHUD(" .. tostring(H.GetIndex(self)) .. ")" end }
  for k in pairs(H) do R.Implemented["PlayerHUD." .. k] = true end

  local function slot(hud, i)
    local s = hud + SLOT * i
    if r32(s + 4) ~= hud or B.r16(s + 8) ~= i then error("rgon: the HUD's player slots are not laid out as expected", 3) end
    return s
  end
  method("HUD", "GetPlayerHUD", function(self, index)
    index = index == nil and 0 or int_arg(index, 1, "GetPlayerHUD")
    if index < 0 or index >= SLOTS then error("bad argument #1 to 'GetPlayerHUD' (invalid index " .. index .. ")", 2) end
    return B.obj(HUD_MT, slot(this(self, "GetPlayerHUD"), index), T.vt_ptr())
  end)
  -- EntityPlayer:GetPlayerHUD() -> the slot showing this player, or nil
  method(P, "GetPlayerHUD", function(self)
    local me = this(self, "GetPlayerHUD")
    local hud = B.ptr(Game():GetHUD())
    if hud == 0 then return nil end
    for i = 0, SLOTS - 1 do
      local s = slot(hud, i)
      if r32(s) == me then return B.obj(HUD_MT, s, T.vt_ptr()) end
    end
    return nil
  end)
end

------------------------------------------------------------------------------
-- PlayerManager.GetEsauJrState(index = 0) -> the player Esau Jr. put aside, or nil
------------------------------------------------------------------------------
-- Four pointers at game+0x1bb28, 0x80 after the player list (game+0x1baa8,
-- found in a run by lab_hud.lua) as in REPENTOGON. From the instructions:
-- the game's reset clears the four at once (`movups [edi+0x1bb28], xmm0` at
-- 0x006f16ec), and 0x007ac7e0 allocates 0x2f00 bytes, constructs them
-- (0x00753da0) and stores the result at `[ecx+esi*4+0x1bb28]` (0x007acac0),
-- then reads it back by the same index (0x007acc3a). Using Esau Jr. from a
-- script did not make the game take that path in the lab, so the non-empty
-- case is checked when it is read: what is there must be a player object.
do
  local PM = rawget(_G, "PlayerManager")
  if type(PM) == "table" then
    static(PM, "PlayerManager", "GetEsauJrState", function(index)
      index = index == nil and 0 or int_arg(index, 1, "GetEsauJrState")
      if index < 0 or index > 3 then error("Invalid index " .. index, 2) end
      local game = r32(0x00c71678)
      local v = game ~= 0 and r32(game + 0x1bb28 + 4 * index) or 0
      if v == 0 then return nil end
      if r32(v) ~= r32(B.ptr(Isaac.GetPlayer(0))) then error("rgon: no player where PlayerManager.GetEsauJrState expects one", 2) end
      return wrap(P, v)
    end)
  end
end

------------------------------------------------------------------------------
-- round 105, second batch: what Fiend Folio raised on in a full tour
------------------------------------------------------------------------------

-- EntityPlayer:GetHistory() -> History (the item tracker's list)
-- The list is at 0x1dec in the player: Entity_Player::AddCollectible
-- (0x0075f0e0) builds an item on its stack and calls 0x00721a70 with
-- `lea ecx, [edi+0x1dec]` (0x0075f63f). 0x00721a70 is REPENTOGON's
-- History::AddHistoryItem by its one signature match, `ret 4`, and its body
-- gives the layout used here: a vector at +0 (begin) and +4 (end) of 0x1c-byte
-- items, compared by the byte at +4 (a trinket) and the word at +8 (the id),
-- ordered by the word at +0 (the time). 0x00721c00 (RemoveHistoryItemByIndex,
-- one match, `ret 4`) is the game's own removal.
-- A HistoryItem handed to a mod is a copy: the vector moves when it grows.
do
  local ITEM = 0x1c
  local I = {}
  function I:GetTime() return self[1] end
  function I:IsTrinket() return self[2] end
  function I:GetItemID() return self[3] end
  function I:GetLevelStage() return self[4] end
  function I:GetStageType() return self[5] end
  function I:GetRoomType() return self[6] end
  function I:GetItemPoolType() return self[7] end
  local ITEM_MT = { __index = I, __name = "HistoryItem", __type = "HistoryItem",
    __tostring = function(self) return "HistoryItem(" .. tostring(self[3]) .. ")" end }
  for k in pairs(I) do R.Implemented["HistoryItem." .. k] = true end

  local H = {}
  local function at(self)
    local p = B.ptr(self)
    if p == 0 then error("rgon: History method called without its object", 3) end
    return p
  end
  -- every item, or only trinkets / only collectibles, or only those ids
  local function list(self, trinkets, ids)
    local h = at(self)
    local b, e = r32(h), r32(h + 4)
    local bytes = e - b
    if bytes < 0 or bytes % ITEM ~= 0 or bytes > ITEM * 65536 or (bytes > 0 and b == 0) then
      error("rgon: the player's history is not laid out as expected", 3)
    end
    local want
    if ids ~= nil then
      want = {}
      if type(ids) == "table" then
        for _, id in pairs(ids) do want[id] = true end
      else
        want[int_arg(ids, 1, trinkets and "SearchTrinkets" or "SearchCollectibles")] = true
      end
      if next(want) == nil then want = nil end
    end
    local out, n = {}, 0
    for a = b, e - ITEM, ITEM do
      local is_trinket, id = B.r8(a + 4) ~= 0, B.ri32(a + 8)
      if (trinkets == nil or trinkets == is_trinket) and (want == nil or want[id] or (is_trinket and want[id & 0x7fff])) then
        n = n + 1
        out[n] = setmetatable({ B.ri32(a), is_trinket, id, B.ri32(a + 0xc), B.ri32(a + 0x10), B.ri32(a + 0x14), B.ri32(a + 0x18) }, ITEM_MT)
      end
    end
    return out
  end
  function H:GetCollectiblesHistory() return list(self, nil, nil) end
  function H:SearchCollectibles(ids) return list(self, false, ids) end
  function H:SearchTrinkets(ids) return list(self, true, ids) end
  function H:RemoveHistoryItemByIndex(index)
    index = int_arg(index, 1, "RemoveHistoryItemByIndex")
    return (call(0x00721c00, at(self), index & 0xffffffff) & 0xff) ~= 0
  end
  local HISTORY_MT = { __index = H, __name = "History", __type = "History",
    __eq = function(a, b) return B.ptr(a) == B.ptr(b) end }
  for k in pairs(H) do R.Implemented["History." .. k] = true end
  method(P, "GetHistory", function(self)
    return B.obj(HISTORY_MT, this(self, "GetHistory") + 0x1dec, T.vt_ptr())
  end)
end

-- Game:GetDebugFlags() -> the bits the console's `debug N` toggles (bit N-1)
-- REPENTOGON's 0x25abc moved by 0xa88, the amount its frame counter moved
-- (0x25a70 there; here AddCollectible stamps a history item with
-- [game+0x264f8]). 25 instructions read or write [reg+0x26544], and
-- test_layer3 sees `debug 3` flip bit 2 of it and nothing else.
if field then field("Game", "GetDebugFlags", nil, 0x26544, "i32") end

-- Level:GetGenerationRNG() -> the RNG the level generator draws from
-- game+0x182d4, where REPENTOGON has it: the game's reset stores the RNG
-- default seed there (`mov [edi+0x182d4], 0xaa17414f` at 0x006f109f) and the
-- level code around 0x00739700 reads and writes it. The object is the game's
-- own, not a copy: drawing from it moves the generator on.
method("Level", "GetGenerationRNG", function()
  local game = r32(0x00c71678)
  if game == 0 then return nil end
  return wrap("RNG", game + 0x182d4)
end)

-- Entity:ToDelirium() -> the entity if it is Delirium, else nil
-- Mods ask this as a question ("is this Delirium, or spawned by it?"). The
-- answer for Delirium is its NPC object; REPENTOGON's EntityDelirium has
-- functions of its own on top (its boss form, its timers) that are not here.
method("Entity", "ToDelirium", function(self)
  if self.Type ~= EntityType.ENTITY_DELIRIUM then return nil end
  return self:ToNPC()
end)
R.Unsupported = R.Unsupported or {}
R.Unsupported["Entity:ToDelirium"] = "answers with the NPC; Delirium's own functions are not there"
