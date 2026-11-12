-- api_data.lua -- the game's data as REPENTOGON hands it to Lua: the XML the
-- game and its mods are configured with (XMLData), achievements a mod
-- defines, the persistent game data, entity and player configuration, and
-- the lookups by name.
--
-- REPENTOGON keeps the XML nodes it sees the game parse. Here the same files
-- are read again, through the game's own file layer (so a file inside a
-- packed archive and a file a mod replaced are found as the game finds
-- them), and parsed in Lua the first time a kind of node is asked for.

local T = ...
local B, R, static, method, wrap, this = T.B, T.R, T.static, T.method, T.wrap, T.this
local ptr, r8, r32, ri32, w8, w32, log, call = B.ptr, B.r8, B.r32, B.ri32, B.w8, B.w32, B.log, B.call
local type, pairs, ipairs, tostring, tonumber, rawget, rawset, setmetatable = type, pairs, ipairs, tostring, tonumber, rawget, rawset, setmetatable
local mathtype = math.type

-- A name the layer takes and cannot act on yet. A mod that calls it keeps
-- loading; the game's log says once what was asked for and that nothing was
-- done. Such a name is never counted as implemented.
local said = {}
local function unsupported(name, why)
  if said[name] then return end
  said[name] = true
  R.Unsupported = R.Unsupported or {}
  R.Unsupported[name] = why or true
  Isaac.DebugString("[REPENTOGON] accepted, not supported in the browser: " .. name .. (why and (" (" .. why .. ")") or ""))
end
T.unsupported = unsupported

------------------------------------------------------------------------------
-- files, through the game's file layer
------------------------------------------------------------------------------
-- 0x00a178d0 (this = the file manager at 0x00c37a10; path, 0) opens a file of
-- the mounted tree and answers a stream; its vtable has close at +0, size at
-- +4 and read(buffer, 1, size) at +0x14 -- the calls ModManager::ListMods
-- makes to read a mod's metadata.xml (0x008f6381..0x008f6415).
local function read_file(path)
  local p = B.alloc(#path + 1)
  for i = 1, #path do w8(p + i - 1, path:byte(i)) end
  w8(p + #path, 0)
  local stream = call(0x00a178d0, 0x00c37a10, p, 0)
  B.free(p)
  if stream == 0 then return nil end
  local vt = r32(stream)
  local size = call(r32(vt + 4), stream)
  local text
  if size > 0 and size < 64 * 1024 * 1024 then
    local buf = B.alloc(size + 1)
    if buf ~= 0 then
      call(r32(vt + 0x14), stream, buf, 1, size)
      local parts, CHUNK = {}, 0x80000
      for off = 0, size - 1, CHUNK do parts[#parts + 1] = B.str(buf + off, math.min(CHUNK, size - off)) end
      text = table.concat(parts)
      B.free(buf)
    end
  else
    text = ""
  end
  call(r32(vt), stream, 1)
  return text
end
T.read_file = read_file

------------------------------------------------------------------------------
-- the mods, as the game lists them
------------------------------------------------------------------------------
-- g_Manager = [0x00c7169c]; its ModManager is at +0x2a6c0 (asm, 0x009b2474)
-- and starts with a vector of ModEntry*: directory +0x00, name +0x18,
-- enabled +0xfc. The list is in load order.
local function mods()
  local out = {}
  local man = r32(0x00c7169c)
  if man == 0 then return out end
  local first, last = r32(man + 0x2a6c0), r32(man + 0x2a6c4)
  if last < first or last - first > 4 * 4096 then return out end
  for at = first, last - 4, 4 do
    local e = r32(at)
    local on = r8(e + 0xfc)
    if on <= 1 then
      out[#out + 1] = { dir = B.stdstr(e), name = B.stdstr(e + 0x18), enabled = on == 1, address = e }
    end
  end
  return out
end
T.mods = mods

------------------------------------------------------------------------------
-- XML
------------------------------------------------------------------------------
local ENT = { amp = "&", lt = "<", gt = ">", quot = '"', apos = "'" }
local function unescape(s)
  if not s:find("&", 1, true) then return s end
  return (s:gsub("&(#?x?)(%w+);", function(kind, body)
    if kind == "" then return ENT[body] end
    local n = kind == "#x" and tonumber(body, 16) or tonumber(body)
    return n and n < 128 and string.char(n) or nil
  end))
end
-- parse(text) -> the document's root node: { tag, attr = { lower-case name = value }, [1..n] = children }
local function parse(text)
  local doc = { tag = "#document", attr = {} }
  local stack, top = { doc }, doc
  local pos, len = 1, #text
  local find, sub = string.find, string.sub
  while true do
    local lt = find(text, "<", pos, true)
    if not lt then break end
    local c = sub(text, lt + 1, lt + 1)
    if c == "!" then
      if sub(text, lt, lt + 3) == "<!--" then
        local e = find(text, "-->", lt + 4, true)
        pos = e and e + 3 or len + 1
      else
        local e = find(text, ">", lt, true)
        pos = e and e + 1 or len + 1
      end
    elseif c == "?" then
      local e = find(text, "?>", lt, true)
      pos = e and e + 2 or len + 1
    elseif c == "/" then
      local e = find(text, ">", lt, true)
      if #stack > 1 then stack[#stack] = nil top = stack[#stack] end
      pos = e and e + 1 or len + 1
    else
      local s, e, tag = find(text, "^<([%w_:%.%-]+)", lt)
      if not s then
        pos = lt + 1
      else
        local node = { tag = tag, attr = {} }
        local at = e + 1
        while true do
          local as, ae, name, quote = find(text, "^%s*([%w_:%.%-]+)%s*=%s*([\"'])", at)
          if not as then break end
          local close = find(text, quote, ae + 1, true)
          if not close then at = len + 1 break end
          node.attr[name:lower()] = unescape(sub(text, ae + 1, close - 1))
          at = close + 1
        end
        local gs, ge, slash = find(text, "^%s*(/?)>", at)
        top[#top + 1] = node
        if gs then
          pos = ge + 1
          if slash == "" then stack[#stack + 1] = node top = node end
        else
          local ge2 = find(text, ">", at, true)
          pos = ge2 and ge2 + 1 or len + 1
        end
      end
    end
  end
  return doc
end
T.parse_xml = parse

-- Every node of the given tags in a file: the game's own copy first, then
-- each enabled mod's, in load order. REPENTOGON reads a mod's
-- content-repentogon folder in place of its content folder when it has one.
local function nodes_of(file, tags)
  local want = {}
  for _, t in ipairs(tags) do want[t] = true end
  local out = {}
  local function take(text, source)
    if not text or text == "" then return end
    local function walk(node)
      for i = 1, #node do
        local k = node[i]
        if want[k.tag] then
          k.source = source
          k.parent = node
          out[#out + 1] = k
        else
          walk(k)
        end
      end
    end
    walk(parse(text))
  end
  take(read_file("resources/" .. file), nil)
  for _, m in ipairs(mods()) do
    if m.enabled then
      take(read_file("mods/" .. m.dir .. "/content-repentogon/" .. file) or read_file("mods/" .. m.dir .. "/content/" .. file), m)
    end
  end
  return out
end

-- A kind of node: where it is, and how an entry of a mod's (which has no id
-- of its own in the file) gets the id the game gave it.
local function by_name(f, key)
  return function(node)
    local n = node.attr[key or "name"]
    if not n then return nil end
    local ok, id = pcall(f, n)
    if ok and mathtype(id) == "integer" and id > 0 then return id end
    return nil
  end
end
local KIND = {}                                   -- XMLNode value -> { file, tags, id = function(node) }
local function kind(name, file, tags, id)
  local X = rawget(_G, "XMLNode")
  if type(X) == "table" and X[name] then KIND[X[name]] = { name = name, file = file, tags = tags, id = id } end
end
kind("ITEM", "items.xml", { "passive", "active", "familiar" }, by_name(Isaac.GetItemIdByName))
kind("TRINKET", "items.xml", { "trinket" }, by_name(Isaac.GetTrinketIdByName))
kind("NULLITEM", "items.xml", { "null" }, by_name(function(n) return Isaac.GetNullItemIdByName(n) end))
kind("CARD", "pocketitems.xml", { "card", "rune" }, by_name(Isaac.GetCardIdByName, "hud"))
kind("PILL", "pocketitems.xml", { "pilleffect" }, by_name(Isaac.GetPillEffectByName))
kind("PLAYER", "players.xml", { "player" }, function(node)
  local n = node.attr.name
  if not n then return nil end
  local ok, id = pcall(Isaac.GetPlayerTypeByName, n, node.attr.bskinparent ~= nil)
  if ok and mathtype(id) == "integer" and id >= 0 then return id end
  return nil
end)
kind("CHALLENGE", "challenges.xml", { "challenge" }, by_name(Isaac.GetChallengeIdByName))
kind("MUSIC", "music.xml", { "track" }, by_name(Isaac.GetMusicIdByName))
kind("SOUND", "sounds.xml", { "sound" }, by_name(Isaac.GetSoundIdByName))
kind("CURSE", "curses.xml", { "curse" }, by_name(Isaac.GetCurseIdByName))
kind("COSTUME", "costumes2.xml", { "costume" }, nil)
kind("BACKDROP", "backdrops.xml", { "backdrop" }, nil)
kind("ACHIEVEMENT", "achievements.xml", { "achievement" }, nil)     -- ids: see the achievements below
kind("ENTITY", "entities2.xml", { "entity" }, nil)
kind("ITEMPOOL", "itempools.xml", { "Pool", "pool" }, nil)
kind("BOSSCOLOR", "bosscolors.xml", { "color" }, nil)
kind("NIGHTMARE", "nightmares.xml", { "nightmare" }, nil)
kind("WISP", "wisps.xml", { "wisp" }, nil)
kind("LOCUST", "locusts.xml", { "locust" }, nil)
kind("BOMBCOSTUME", "bombcostumes.xml", { "bomb" }, nil)
kind("STAGE", "stages.xml", { "stage" }, nil)
kind("GIANTBOOK", "giantbook.xml", { "entry" }, nil)
kind("CUTSCENE", "cutscenes.xml", { "cutscene" }, nil)

local loaded = {}                                 -- XMLNode value -> { list = {entry}, by_id = {}, by_name = {} }
local function entries(k)
  local set = loaded[k]
  if set then return set end
  local spec = KIND[k]
  if not spec then return nil end
  set = { list = {}, by_id = {}, by_name = {} }
  loaded[k] = set
  local next_free = 0
  local nodes = nodes_of(spec.file, spec.tags)
  for _, node in ipairs(nodes) do
    local a = node.attr
    local id = tonumber(a.id)
    if not node.source then
      if id and id > next_free then next_free = id end
    elseif spec.id then
      id = spec.id(node)                     -- the id the game gave a mod's item, card, character ...
    elseif spec.name == "ACHIEVEMENT" then
      next_free = next_free + 1              -- a mod's achievements follow the game's, in load order
      id = next_free
    end                                      -- any other kind keeps the id its own file states (an entity's type)
    local entry = {}
    for name, value in pairs(a) do entry[name] = value end
    entry.type = entry.type or node.tag
    entry._root = node.parent and node.parent.attr or nil       -- the file's root attributes (anm2root, gfxroot)
    if node.source then
      entry.sourceid = node.source.dir
      if spec.id or spec.name == "ACHIEVEMENT" then entry.id = id and tostring(id) or nil end
    end
    set.list[#set.list + 1] = entry
    if id and set.by_id[id] == nil then set.by_id[id] = entry end
    if a.name and set.by_name[a.name] == nil then set.by_name[a.name] = entry end
  end
  set.first_free = next_free + 1
  return set
end
T.xml_entries = entries

if rawget(_G, "XMLData") == nil and next(KIND) then
  local X = {}
  local function kind_arg(k, what)
    if mathtype(k) ~= "integer" then error("bad argument #1 to '" .. what .. "' (XMLNode expected, got " .. type(k) .. ")", 3) end
    return entries(k)
  end
  function X.GetEntryById(k, id)
    local set = kind_arg(k, "GetEntryById")
    return set and set.by_id[tonumber(id)] or nil
  end
  function X.GetEntryByName(k, name)
    local set = kind_arg(k, "GetEntryByName")
    return set and set.by_name[name] or nil
  end
  function X.GetNumEntries(k)
    local set = kind_arg(k, "GetNumEntries")
    return set and #set.list or 0
  end
  function X.GetEntryByOrder(k, index)
    local set = kind_arg(k, "GetEntryByOrder")
    return set and set.list[index] or nil
  end
  -- an entity's node by type, variant and subtype; without `strict`, the nearest less specific one
  function X.GetEntityByTypeVarSub(etype, variant, subtype, strict)
    local set = entries(rawget(_G, "XMLNode").ENTITY)
    if not set then return nil end
    if not set.tvs then
      set.tvs = {}
      for _, e in ipairs(set.list) do
        local key = (tonumber(e.id) or 0) .. "." .. (tonumber(e.variant) or 0) .. "." .. (tonumber(e.subtype) or 0)
        if set.tvs[key] == nil then set.tvs[key] = e end
      end
    end
    variant, subtype = variant or 0, subtype or 0
    local e = set.tvs[etype .. "." .. variant .. "." .. subtype]
    if e or strict then return e end
    return set.tvs[etype .. "." .. variant .. ".0"] or set.tvs[etype .. ".0.0"]
  end
  function X.GetEntryFromEntity(entity, _, strict)
    return X.GetEntityByTypeVarSub(entity.Type, entity.Variant, entity.SubType, strict)
  end
  function X.GetModById(dir)
    for _, m in ipairs(mods()) do
      if m.dir == dir then return { id = m.dir, directory = m.dir, name = m.name, enabled = tostring(m.enabled) } end
    end
    return nil
  end
  rawset(_G, "XMLData", X)
  for name in pairs(X) do R.Implemented["XMLData." .. name] = true end
end

------------------------------------------------------------------------------
-- lookups by name
------------------------------------------------------------------------------
local function string_arg(v, what)
  if type(v) ~= "string" then error("bad argument #1 to '" .. what .. "' (string expected, got " .. type(v) .. ")", 3) end
  return v
end
local XN = rawget(_G, "XMLNode") or {}

-- Isaac.GetEntitySubTypeByName(name) -> the subtype entities2.xml gives the entity of that name (0 when it gives none), or -1
static(Isaac, "Isaac", "GetEntitySubTypeByName", function(name)
  local set = XN.ENTITY and entries(XN.ENTITY)
  local e = set and set.by_name[string_arg(name, "GetEntitySubTypeByName")]
  if not e then return -1 end
  return math.tointeger(tonumber(e.subtype) or 0) or 0
end)

-- Isaac.GetAchievementIdByName(name) -> the achievement's id, or -1
static(Isaac, "Isaac", "GetAchievementIdByName", function(name)
  local set = XN.ACHIEVEMENT and entries(XN.ACHIEVEMENT)
  local e = set and set.by_name[string_arg(name, "GetAchievementIdByName")]
  return e and math.tointeger(tonumber(e.id)) or -1
end)

-- Isaac.GetBackdropIdByName(name) -> the backdrop's id, or -1. A backdrop a
-- mod defines has no id here: the game's backdrop table is not extended yet.
static(Isaac, "Isaac", "GetBackdropIdByName", function(name)
  local set = XN.BACKDROP and entries(XN.BACKDROP)
  local e = set and set.by_name[string_arg(name, "GetBackdropIdByName")]
  if e and not e.sourceid then return math.tointeger(tonumber(e.id)) or -1 end
  if e then unsupported("a backdrop defined by a mod (Isaac.GetBackdropIdByName answers -1)") end
  return -1
end)

-- Isaac.GetBossColorIdxByName(name): a mod's own boss colours are not loaded by this game; -1
static(Isaac, "Isaac", "GetBossColorIdxByName", function(name)
  string_arg(name, "GetBossColorIdxByName")
  unsupported("a boss colour defined by a mod (Isaac.GetBossColorIdxByName answers -1)")
  return -1
end)

------------------------------------------------------------------------------
-- achievements and the persistent game data
------------------------------------------------------------------------------
-- The game's own achievements are numbers below 0x282 here (PersistentGameData
-- ::Unlocked, 0x00929aa0, answers false from there up). A mod's achievements
-- (achievements.xml in its content) get the numbers after them, in load
-- order, and their state is kept by the layer: the game's save file has no
-- room for them. PersistentGameData itself is at g_Manager + 0x14 (asm: every
-- caller of Unlocked passes `lea ecx, [manager + 0x14]`).
local GAME_ACHIEVEMENTS = 0x282
local unlocked = {}                 -- a mod's achievement id -> true
local function pgd() return r32(0x00c7169c) + 0x14 end
local function achievement_id(v, what)
  if mathtype(v) == "float" and v == math.floor(v) then v = math.tointeger(v) end
  if mathtype(v) ~= "integer" then error("bad argument #1 to '" .. what .. "' (integer expected, got " .. type(v) .. ")", 3) end
  return v
end
local function unlock_modded(id)
  if unlocked[id] then return false end
  unlocked[id] = true
  if T.achievements_changed then T.achievements_changed(unlocked) end
  local M = ModCallbacks
  if M.MC_POST_ACHIEVEMENT_UNLOCK then T.run(M.MC_POST_ACHIEVEMENT_UNLOCK, id, id) end
  return true
end
local P = {}
P.__index = P
P.__type = "PersistentGameData"
function P:Unlocked(id)
  id = achievement_id(id, "Unlocked")
  if id >= GAME_ACHIEVEMENTS then return unlocked[id] == true end
  return (call(0x00929aa0, pgd(), id & 0xffffffff) & 0xff) ~= 0
end
function P:TryUnlock(id, blockPaperPopup)
  id = achievement_id(id, "TryUnlock")
  if id >= GAME_ACHIEVEMENTS then return unlock_modded(id) end
  return (call(0x00929a20, pgd(), id & 0xffffffff) & 0xff) ~= 0
end
P.Unlock = P.TryUnlock
function P:IncreaseEventCounter(counter, amount)
  call(0x00929b40, pgd(), achievement_id(counter, "IncreaseEventCounter") & 0xffffffff, achievement_id(amount, "IncreaseEventCounter") & 0xffffffff)
end
function P:GetBestiaryKillCount(etype, variant) return call(0x0092b100, pgd(), etype, variant or 0) end
function P:GetBestiaryDeathCount(etype, variant) return call(0x0092b070, pgd(), etype, variant or 0) end
function P:GetBestiaryEncounterCount(etype, variant) return call(0x0092b190, pgd(), etype, variant or 0) end
local the_pgd = setmetatable({}, P)
static(Isaac, "Isaac", "GetPersistentGameData", function() return the_pgd end)
for name in pairs(P) do if name:sub(1, 2) ~= "__" then R.Implemented["PersistentGameData." .. name] = true end end
T.modded_achievements = unlocked

-- "lockachievement <id>" in the console locks one again; for a mod's achievement that is the layer's to do
do
  local execute = Isaac.ExecuteCommand
  rawset(Isaac, "ExecuteCommand", function(command, ...)
    if type(command) == "string" then
      local id = tonumber(command:match("^%s*lockachievement%s+(%d+)%s*$"))
      if id and id >= GAME_ACHIEVEMENTS then
        if unlocked[id] then
          unlocked[id] = nil
          if T.achievements_changed then T.achievements_changed(unlocked) end
        end
        return ""
      end
    end
    return execute(command, ...)
  end)
end

------------------------------------------------------------------------------
-- EntityConfig
------------------------------------------------------------------------------
-- What players.xml and entities2.xml say about a character or an entity.
if rawget(_G, "EntityConfig") == nil and XN.PLAYER and XN.ENTITY then
  local PC = {}
  PC.__index = PC
  PC.__type = "EntityConfigPlayer"
  function PC:GetPlayerType() return self._id end
  function PC:GetName() return self._x.name or "" end
  function PC:GetSkinPath() return self._x.skin and ("gfx/characters/costumes/" .. self._x.skin) or "" end
  function PC:GetCostumeSuffix() return self._x.costumesuffix or "" end
  -- the tainted characters are 21 to 40 and every modded one that names the character it is the other side of
  function PC:IsTainted() return (self._id >= 21 and self._id <= 40) or (self._x.bskinparent ~= nil and self._x.bskinparent ~= "") end
  local players = {}
  local EC = {}
  function EC.GetPlayer(playerType)
    if mathtype(playerType) ~= "integer" then error("bad argument #1 to 'GetPlayer' (integer expected, got " .. type(playerType) .. ")", 2) end
    local p = players[playerType]
    if p == nil then
      local x = entries(XN.PLAYER).by_id[playerType]
      p = x and setmetatable({ _id = playerType, _x = x }, PC) or false
      players[playerType] = p
    end
    return p or nil
  end
  function EC.GetMaxPlayerType()
    local max = 0
    for id in pairs(entries(XN.PLAYER).by_id) do if id > max then max = id end end
    return max
  end

  local EE = {}
  EE.__index = EE
  EE.__type = "EntityConfigEntity"
  local function num(v, d) return tonumber(v) or d end
  function EE:GetType() return math.tointeger(num(self._x.id, 0)) or 0 end
  function EE:GetVariant() return math.tointeger(num(self._x.variant, 0)) or 0 end
  function EE:GetSubType() return math.tointeger(num(self._x.subtype, 0)) or 0 end
  function EE:GetName() return self._x.name or "" end
  function EE:GetAnm2Path() return ((self._x._root and self._x._root.anm2root) or "") .. (self._x.anm2path or "") end
  function EE:GetBaseHP() return num(self._x.basehp, 0) + 0.0 end
  function EE:GetStageHP() return num(self._x.stagehp, 0) + 0.0 end
  function EE:GetCollisionDamage() return num(self._x.collisiondamage, 0) + 0.0 end
  function EE:GetCollisionRadius() return num(self._x.collisionradius, 0) + 0.0 end
  function EE:GetShieldStrength() return num(self._x.shieldstrength, 0) + 0.0 end
  function EE:IsBoss() return self._x.boss == "1" or self._x.boss == "true" end
  function EE:CanBeChampion() return self._x.champion == "1" or self._x.champion == "true" end
  function EE:HasCustomTag(tag)
    local tags = self._tags
    if not tags then
      tags = {}
      for t in (self._x.customtags or ""):gmatch("%S+") do tags[t:lower()] = true end
      self._tags = tags
    end
    return tags[tostring(tag):lower()] == true
  end
  local ents = {}
  function EC.GetEntity(etype, variant, subtype)
    if mathtype(etype) ~= "integer" then error("bad argument #1 to 'GetEntity' (integer expected, got " .. type(etype) .. ")", 2) end
    local key = etype .. "." .. (variant or -1) .. "." .. (subtype or -1)
    local e = ents[key]
    if e == nil then
      local x = XMLData.GetEntityByTypeVarSub(etype, variant or 0, subtype or 0, false)
      e = x and setmetatable({ _x = x }, EE) or false
      ents[key] = e
    end
    return e or nil
  end
  rawset(_G, "EntityConfig", EC)
  static(Isaac, "Isaac", "GetEntityConfig", function() return EC end)
  for name in pairs(EC) do R.Implemented["EntityConfig." .. name] = true end
  for name in pairs(PC) do if name:sub(1, 2) ~= "__" then R.Implemented["EntityConfigPlayer." .. name] = true end end
  for name in pairs(EE) do if name:sub(1, 2) ~= "__" then R.Implemented["EntityConfigEntity." .. name] = true end end
end

------------------------------------------------------------------------------
-- accepted, not supported yet
------------------------------------------------------------------------------
-- Isaac.ReworkCollectible / ReworkTrinket / ReworkBirthright tell REPENTOGON to
-- stop the game's own logic for an item so a mod can replace it. That is a
-- change inside the game's item code which this layer does not make: the
-- game's logic keeps running beside the mod's.
for _, name in ipairs({ "ReworkCollectible", "ReworkTrinket", "ReworkBirthright" }) do
  if rawget(Isaac, name) == nil then
    rawset(Isaac, name, function() unsupported("Isaac." .. name, "the game's own logic for the item still runs") end)
  end
end

------------------------------------------------------------------------------
-- ItemConfig
------------------------------------------------------------------------------
-- ItemConfigCard:SetAvailabilityCondition(f) / :ClearAvailabilityCondition()
-- A card whose condition answers false is not handed out by the item pool.
-- The game asks its mods for a card through MC_GET_CARD; the layer listens
-- there and, when the card picked has a condition that fails, draws again
-- from the pool with the same flags (at most 32 times, then lets it be).
do
  local sample = Isaac.GetItemConfig():GetCard(1)
  local mt = sample and getmetatable(sample)
  local class = mt and (rawget(mt, "__class") or mt)
  local const = mt and (rawget(mt, "__const") or mt)
  if type(class) ~= "table" then
    log("api_data: no class table for a card's configuration; SetAvailabilityCondition is left out")
  else
    local condition = {}                    -- card id -> function
    local function add(name, f)
      if rawget(class, name) ~= nil then return end
      local c = B.cfn(f)
      rawset(class, name, c)
      if const ~= class and rawget(const, name) == nil then rawset(const, name, c) end
      R.Implemented["ItemConfigCard." .. name] = true
    end
    local listen                              -- (below) starts listening on MC_GET_CARD, once a card has a condition
    add("SetAvailabilityCondition", function(self, f)
      if type(f) ~= "function" then error("bad argument #1 to 'SetAvailabilityCondition' (function expected, got " .. type(f) .. ")", 2) end
      condition[self.ID] = f
      listen()
    end)
    add("ClearAvailabilityCondition", function(self) condition[self.ID] = nil end)
    add("IsAvailable", function(self)
      local f = condition[self.ID]
      if not f then return true end
      local ok, res = pcall(f)
      return not ok or res ~= false
    end)
    local function available(card)
      local f = condition[card]
      if not f then return true end
      local ok, res = pcall(f)
      return not ok or res ~= false
    end
    local drawing, listening_for_cards = false, false
    listen = function()
      if listening_for_cards then return end
      listening_for_cards = true
      Isaac.AddPriorityCallback({ Name = "REPENTOGON" }, ModCallbacks.MC_GET_CARD, CallbackPriority.LATE, function(_, rng, card, playing, runes, only_runes)
      if drawing or available(card) then return nil end
      drawing = true
      local pool, pick = Game():GetItemPool(), card
      for _ = 1, 32 do
        pick = pool:GetCard(rng:Next(), playing, runes, only_runes)
        if available(pick) then break end
      end
      drawing = false
      if pick ~= card and available(pick) then return pick end
      return nil
      end)
    end
  end
end

-- ItemConfigItem:AddCustomTag(tag), :HasCustomTag(tag), :GetCustomTags()
-- (also :AddCustomCacheTag, :HasCustomCacheTag, :GetCustomCacheTags)
-- Tags a mod gives an item, a trinket or a null item: in items.xml
-- (customtags="a b", customcache="x y") or from Lua. They are the layer's to
-- keep; the game knows nothing of them. Compared without regard to case.
do
  local config = Isaac.GetItemConfig()
  local sample = config:GetCollectible(1)
  local mt = sample and getmetatable(sample)
  local class = mt and (rawget(mt, "__class") or mt)
  local const = mt and (rawget(mt, "__const") or mt)
  if type(class) ~= "table" then
    log("api_data: no class table for an item's configuration; custom tags are left out")
  else
    local tags, cache = {}, {}              -- "<kind>:<id>" -> { tag = true }
    local seeded = false
    local function key(item)
      return (item:IsTrinket() and "t:" or item:IsNull() and "n:" or "c:") .. item.ID
    end
    -- what the XML says, read the first time anything asks
    local function seed()
      if seeded then return end
      seeded = true
      for kind, prefix in pairs({ ITEM = "c:", TRINKET = "t:", NULLITEM = "n:" }) do
        local set = XN[kind] and entries(XN[kind])
        for _, e in ipairs(set and set.list or {}) do
          local id = tonumber(e.id)
          if id then
            for attr, into in pairs({ customtags = tags, customcache = cache }) do
              if e[attr] then
                local k = prefix .. math.tointeger(id)
                into[k] = into[k] or {}
                for t in e[attr]:gmatch("%S+") do into[k][t:lower()] = true end
              end
            end
          end
        end
      end
    end
    local function add(name, f)
      if rawget(class, name) ~= nil then return end
      local c = B.cfn(f)
      rawset(class, name, c)
      if const ~= class and rawget(const, name) == nil then rawset(const, name, c) end
      R.Implemented["ItemConfigItem." .. name] = true
    end
    local function tag_arg(v, what)
      if type(v) ~= "string" then error("bad argument #1 to '" .. what .. "' (string expected, got " .. type(v) .. ")", 3) end
      return v:lower()
    end
    local function family(store, add_name, has_name, list_name)
      add(add_name, function(self, tag)
        seed()
        local k = key(self)
        store[k] = store[k] or {}
        store[k][tag_arg(tag, add_name)] = true
      end)
      add(has_name, function(self, tag)
        seed()
        local set = store[key(self)]
        return set ~= nil and set[tag_arg(tag, has_name)] == true
      end)
      add(list_name, function(self)
        seed()
        local out = {}
        for t in pairs(store[key(self)] or {}) do out[#out + 1] = t end
        table.sort(out)
        return out
      end)
    end
    family(tags, "AddCustomTag", "HasCustomTag", "GetCustomTags")
    family(cache, "AddCustomCacheTag", "HasCustomCacheTag", "GetCustomCacheTags")
    -- ItemConfig:GetTaggedItems(tag) -> every item with that custom tag
    method("ItemConfig", "GetTaggedItems", function(self, tag)
      seed()
      tag = tag_arg(tag, "GetTaggedItems")
      local out = {}
      for k, set in pairs(tags) do
        if set[tag] then
          local kind, id = k:sub(1, 1), math.tointeger(tonumber(k:sub(3)))
          local item = kind == "c" and config:GetCollectible(id) or kind == "t" and config:GetTrinket(id) or config:GetNullItem(id)
          if item then out[#out + 1] = item end
        end
      end
      return out
    end)
  end
end
