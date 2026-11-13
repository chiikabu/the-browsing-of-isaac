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
local function game_unlocked(id) return (call(0x00929aa0, pgd(), id & 0xffffffff) & 0xff) ~= 0 end

------------------------------------------------------------------------------
-- the layer's own save file (round 112)
------------------------------------------------------------------------------
-- What has to outlive the page (a mod's achievements, the innate items of a
-- quit run) is kept in the save data of the layer's own mod, main.lua's
-- RegisterMod("REPENTOGON (browser)"), through the game's Isaac.SaveModData /
-- LoadModData: per save slot, and kept over a reload as any mod's data is (the
-- game's writes persist, round 31). One file in sections:
--   rgon-save 1
--   == <section>
--   <its lines>
-- A file written before this round ("rgon-innate 1" ...) is the innate section.
local layer_mod
local on_layer_mod = {}
do
  local register = Isaac.RegisterMod
  if type(register) == "function" then
    rawset(Isaac, "RegisterMod", function(m, name, ...)
      local r = table.pack(register(m, name, ...))
      if name == "REPENTOGON (browser)" and layer_mod == nil and type(m) == "table" then
        layer_mod = m
        log("the layer keeps a mod's achievements and the innate items of a quit run in the save data of the mod '" .. name .. "'")
        for _, f in ipairs(on_layer_mod) do
          local ok, err = pcall(f)
          if not ok then log("api_data: " .. tostring(err)) end
        end
      end
      return table.unpack(r, 1, r.n)
    end)
  end
end
local function parse_save(text)
  local sec = {}
  if type(text) ~= "string" or text == "" then return sec end
  if text:sub(1, 13) == "rgon-innate 1" then sec.innate = text return sec end
  if text:sub(1, 11) ~= "rgon-save 1" then return sec end
  local name, buf
  for line in (text .. "\n"):gmatch("([^\n]*)\n") do
    local n = line:match("^== (.+)$")
    if n then
      if name then sec[name] = table.concat(buf, "\n") end
      name, buf = n, {}
    elseif name then
      buf[#buf + 1] = line
    end
  end
  if name then sec[name] = table.concat(buf, "\n") end
  return sec
end
local function read_save()
  if not layer_mod then return {} end
  -- LoadModData alone (an empty string when there is no file): measured in a dist
  -- whose mods are its instance tree (dev_dist.py), HasModData answered false for a
  -- file SaveModData had written and LoadModData read back (lab_ach.lua, round 112)
  local ok2, text = pcall(Isaac.LoadModData, layer_mod)
  return parse_save(ok2 and text or nil)
end
local function write_save(sec)
  if not layer_mod then return false end
  local names = {}
  for k in pairs(sec) do names[#names + 1] = k end
  table.sort(names)
  local out = { "rgon-save 1" }
  for _, k in ipairs(names) do
    out[#out + 1] = "== " .. k
    out[#out + 1] = sec[k]
  end
  local ok, err = pcall(Isaac.SaveModData, layer_mod, table.concat(out, "\n"))
  if not ok then log("api_data: the layer's save file was not written: " .. tostring(err)) end
  return ok
end
local store = {}
function store.mod() return layer_mod end
function store.get(name) return read_save()[name] end
function store.set(name, text)
  local sec = read_save()
  if sec[name] == text then return true end
  sec[name] = text
  return write_save(sec)
end
function store.on_mod(f) on_layer_mod[#on_layer_mod + 1] = f end
store.parse = parse_save
T.store = store

------------------------------------------------------------------------------
-- a mod's named achievements on the game's own content (round 112)
------------------------------------------------------------------------------
-- The game reads `achievement="..."` of players.xml, items.xml (collectibles and
-- trinkets), pocketitems.xml (cards, runes, pill effects) and the
-- `achievements="a,b"` of challenges.xml with atoi (the call at 0x0069a827 for a
-- player, 0x0072620d for an item, 0x0072d308 / 0x0072d35e for a card and a pill),
-- so a name gives 0, which its checks read as unlocked (Unlocked(0), 0x00929abe).
-- REPENTOGON turns a name into the mod achievement's id before the game parses
-- the file, and for collectibles, trinkets, cards and pills writes -1 into the
-- entry when the achievement is unlocked and its id when not, each time an item
-- pool is set up (its ItemPool::Init hook). Here the same values are written
-- into the same fields, and again whenever one of those achievements changes:
-- the game's own test then gives the answer (Unlocked answers true for any
-- negative id, 0x00929aad, and false from 0x282 up, 0x00929aba, as do the
-- inlined copies of that test, e.g. Menu_Character::UpdateRotations 0x0094d585),
-- so nothing is asked of Lua when the game tests an entry.
--   a player's config: EntityConfig = g_Manager+0x2a670, its vector at +8/+0xc
--     (0x00946cdf), 0x148 bytes each, the achievement at +0xe8 (read by
--     Menu_Character_Entry::IsCharacterAvailable at 0x00946d10; lab_ach.lua: each
--     of the game's characters holds its players.xml number, -1 without one), the
--     hidden flag at +0x128 (Menu_Character::Reset leaves a character with it set
--     off the wheel, 0x009491a7)
--   a collectible's or trinket's ItemConfig_Item: +0x50 (stored at 0x00726216;
--     read by the item pools' set-up at 0x0073635f; lab_ach.lua: every one of the
--     game's with an achievement matches items.xml)
--   a card's or pill effect's entry: +0x4 (lab_ach.lua: likewise, pocketitems.xml)
--   a challenge: g_Manager+0x2a664, 0xa4 bytes each (Manager::GetChallengeParams
--     0x009569a0), the achievements it needs a vector<int> at +0x48 (lab_ach.lua:
--     every one of the game's matches challenges.xml)
-- A player's `hideachievement` (REPENTOGON: off the menus until it is unlocked;
-- its LoadPlayers hook clears the hidden flag of such a player first): the
-- hidden flag follows it. An entry is written only while it holds 0 (the atoi
-- of a name), -1 or the achievement's id, so a field that is not what this
-- expects is left alone and said in the log.
local ADDR = { players = 0x2a678, challenges = 0x2a664 }
local PLAYER_SIZE, CHALLENGE_SIZE = 0x148, 0xa4
local P_ACH, P_HIDDEN, ITEM_ACH, POCKET_ACH, C_ACH = 0xe8, 0x128, 0x50, 0x4, 0x48

-- REPENTOGON's reading of such an attribute (IsAchievementUnlockedByXmlString):
-- a number (strtol, base 0) is that achievement, anything else a name
local function xml_achievement(text)
  if type(text) ~= "string" or text == "" then return nil end
  local sign, rest = text:match("^%s*([+-]?)(.*)$")
  local n
  local hex = rest:match("^0[xX](%x+)")
  if hex then
    n = tonumber(hex, 16)
  elseif rest:match("^0[0-7]") then
    n = tonumber(rest:match("^0([0-7]+)"), 8)
  elseif rest:match("^%d") then
    n = tonumber(rest:match("^%d+"))
  end
  if n then return sign == "-" and -n or n, true end
  local set = XN.ACHIEVEMENT and entries(XN.ACHIEVEMENT)
  local e = set and set.by_name[text]
  return e and math.tointeger(tonumber(e.id)) or -1, false
end
T.xml_achievement = xml_achievement

-- is an achievement given in an XML attribute unlocked (an unknown name: the game's
-- Unlocked(-1), true)
local function achieved(text)
  local id = xml_achievement(text)
  if id == nil then return true end
  if id >= GAME_ACHIEVEMENTS then return unlocked[id] == true end
  return game_unlocked(id)
end

local function players_base()
  local man = r32(0x00c7169c)
  if man == 0 then return 0, 0 end
  local first, last = r32(man + ADDR.players), r32(man + ADDR.players + 4)
  if last < first then return 0, 0 end
  return first, (last - first) // PLAYER_SIZE
end
local function player_config(pt)
  local first, n = players_base()
  if first == 0 or mathtype(pt) ~= "integer" or pt < 0 or pt >= n then return nil end
  local at = first + pt * PLAYER_SIZE
  if ri32(at) ~= pt then return nil end
  return at
end
T.player_config = player_config

-- what players.xml says of a character's lock: REPENTOGON's IsCharacterUnlockedRgon
-- (`achievement`, or `hideachievement` when it has no `achievement`)
local player_rows               -- player type -> its players.xml entry, found again once every mod is loaded
local function player_xml(pt)
  if player_rows then return player_rows[pt] end
  local set = XN.PLAYER and entries(XN.PLAYER)
  return set and set.by_id[pt] or nil
end
local function character_unlocked(pt)
  local x = player_xml(pt)
  if not x then return true end
  local a = x.achievement or x.hideachievement
  if a == nil or a == "" then return true end
  return achieved(a)
end
T.character_unlocked = character_unlocked

local gates                   -- achievement id -> { { at = address, kind = name } } (the value fields)
local hides                   -- achievement id -> { player config address } (hidden flags)
local gate_count = 0
local said_odd = {}
local function want(id) return mathtype(id) == "integer" and id >= 0 end
local function add_gate(id, at, kind)
  if not want(id) or at == 0 then return end
  local v = ri32(at)
  if v ~= 0 and v ~= -1 and v ~= id then
    local k = kind .. at
    if not said_odd[k] then said_odd[k] = true log(string.format("api_data: %s at 0x%08x holds %d, not 0, -1 or %d: left alone", kind, at, v, id)) end
    return
  end
  gates[id] = gates[id] or {}
  local g = gates[id]
  g[#g + 1] = { at = at, kind = kind }
  gate_count = gate_count + 1
end
-- the id the game gave a mod's entry, asked again now (an entries() list may have
-- been read before every mod's content was loaded)
local function lookup(f, ...)
  local ok, id = pcall(f, ...)
  if ok and mathtype(id) == "integer" and id >= 0 then return id end
  return nil
end
local function build_gates()
  gates, hides, gate_count = {}, {}, 0
  player_rows = {}
  local cfg = Isaac.GetItemConfig()
  local function named(text)
    local id, number = xml_achievement(text)
    if id == nil or number then return nil end       -- a number is the game's own, and the game read it
    return id
  end
  -- players
  local pset = XN.PLAYER and entries(XN.PLAYER)
  for _, e in ipairs(pset and pset.list or {}) do
    if e.sourceid and e.name then
      local pt = lookup(Isaac.GetPlayerTypeByName, e.name, e.bskinparent ~= nil)
      local at = pt and player_config(pt)
      if at and player_rows[pt] == nil then player_rows[pt] = e end
      if at then
        local id = named(e.achievement or e.hideachievement)
        if id then add_gate(id, at + P_ACH, "a player's achievement") end
        if e.hideachievement and e.hideachievement ~= "" then
          local hid = xml_achievement(e.hideachievement)
          if hid then
            hides[hid] = hides[hid] or {}
            hides[hid][#hides[hid] + 1] = at
          end
        end
      end
    end
  end
  -- collectibles and trinkets, cards and runes, pill effects
  local function items(kind, find, get, key, field, what)
    local set = XN[kind] and entries(XN[kind])
    for _, e in ipairs(set and set.list or {}) do
      local id = e.sourceid and named(e.achievement)
      local name = e[key or "name"]
      if id and name then
        local n = lookup(find, name)
        local it = n and get(n)
        local at = it and ptr(it) or 0
        if at ~= 0 then add_gate(id, at + field, what) end
      end
    end
  end
  if cfg then
    items("ITEM", Isaac.GetItemIdByName, function(n) return cfg:GetCollectible(n) end, nil, ITEM_ACH, "a collectible's achievement")
    items("TRINKET", Isaac.GetTrinketIdByName, function(n) return cfg:GetTrinket(n) end, nil, ITEM_ACH, "a trinket's achievement")
    items("CARD", Isaac.GetCardIdByName, function(n) return cfg:GetCard(n) end, "hud", POCKET_ACH, "a card's achievement")
    items("PILL", Isaac.GetPillEffectByName, function(n) return cfg:GetPillEffect(n) end, nil, POCKET_ACH, "a pill effect's achievement")
  end
  -- challenges: each name of `achievements`, in the place the game put its atoi
  local cset = XN.CHALLENGE and entries(XN.CHALLENGE)
  local man = r32(0x00c7169c)
  local c0, c1 = r32(man + ADDR.challenges), r32(man + ADDR.challenges + 4)
  for _, e in ipairs(cset and cset.list or {}) do
    local list = e.sourceid and e.name and e.achievements
    local cid = list and lookup(Isaac.GetChallengeIdByName, e.name)
    if cid and c0 + (cid + 1) * CHALLENGE_SIZE <= c1 then
      local at = c0 + cid * CHALLENGE_SIZE
      local v0, v1 = r32(at + C_ACH), r32(at + C_ACH + 4)
      local i = 0
      for piece in (list .. ","):gmatch("([^,]*),") do
        if v0 + i * 4 < v1 then
          local id = named(piece)
          if id then add_gate(id, v0 + i * 4, "a challenge's achievement") end
        end
        i = i + 1
      end
    end
  end
end

-- the value the game is to find for achievement `id`
local function gate_value(id)
  if id < GAME_ACHIEVEMENTS then return id end
  return unlocked[id] and -1 or id
end
local function apply(id)
  if not gates then return end
  local g = gates[id]
  if g then
    local v = gate_value(id)
    for i = 1, #g do B.w32(g[i].at, v & 0xffffffff) end
  end
  local h = hides[id]
  if h then
    local hidden = not (id >= GAME_ACHIEVEMENTS and unlocked[id] == true or id < GAME_ACHIEVEMENTS and game_unlocked(id))
    for i = 1, #h do w8(h[i] + P_HIDDEN, hidden and 1 or 0) end
  end
end
local function apply_all()
  if not gates then return end
  for id in pairs(gates) do apply(id) end
  for id in pairs(hides) do if not gates[id] then apply(id) end end
end
-- every mod's content is loaded (ModManager::LoadConfigs has returned): find the fields
-- Called when ModManager::LoadConfigs returns (a reload of the mods) and, the
-- first time, from the first save-slot choice or menu frame: the layer itself is
-- started inside the first LoadConfigs, whose hook was not armed when it began.
function T.achievements_ready()
  build_gates()
  apply_all()
  local n = 0
  for _ in pairs(hides) do n = n + 1 end
  log(string.format("named achievements: %d field(s) of the game's content follow a mod's achievement, %d hidden flag(s)", gate_count, n))
end
T.achievement_gates = function() return gates, hides end
T.achievements_built = function() return gates ~= nil end
T.achievement_apply = function(id) if mathtype(id) == "integer" then apply(id) end end

-- what is unlocked is kept in the layer's save file, by mod and name (a mod's
-- achievement's number changes with what else is installed): one line each,
-- "<mod folder> <name>", both %-escaped
local function esc(s) return (s:gsub("[^%w_%-%.]", function(c) return string.format("%%%02x", c:byte()) end)) end
local function unesc(s) return (s:gsub("%%(%x%x)", function(h) return string.char(tonumber(h, 16)) end)) end
local function ach_key(e) return e.name or e.text or e.steam_name end
local batch, dirty = 0, false
local function save_unlocked()
  if batch > 0 then dirty = true return end
  dirty = false
  local set = XN.ACHIEVEMENT and entries(XN.ACHIEVEMENT)
  local lines = {}
  for _, e in ipairs(set and set.list or {}) do
    local id = math.tointeger(tonumber(e.id))
    if e.sourceid and id and unlocked[id] and ach_key(e) then lines[#lines + 1] = esc(e.sourceid) .. " " .. esc(ach_key(e)) end
  end
  table.sort(lines)
  store.set("achievements", #lines > 0 and table.concat(lines, "\n") or nil)
end
-- run f with the saves of every change it makes written once, at the end
function T.achievements_batch(f, ...)
  batch = batch + 1
  local ok, err = pcall(f, ...)
  batch = batch - 1
  if batch == 0 and dirty then save_unlocked() end
  if not ok then error(err, 0) end
end
-- the save slot was chosen (or the layer's mod registered with one chosen): what
-- that slot's file says is unlocked, as REPENTOGON reads its achievements<slot>.json
function T.achievements_load(no_build)
  if not gates and not no_build then T.achievements_ready() end
  for id in pairs(unlocked) do unlocked[id] = nil end
  local text = store.get("achievements")
  local n = 0
  if text and text ~= "" then
    local set = XN.ACHIEVEMENT and entries(XN.ACHIEVEMENT)
    local by = {}
    for _, e in ipairs(set and set.list or {}) do
      if e.sourceid and ach_key(e) then by[e.sourceid .. " " .. ach_key(e)] = math.tointeger(tonumber(e.id)) end
    end
    for line in (text .. "\n"):gmatch("([^\n]*)\n") do
      local a, b = line:match("^(%S+) (%S+)$")
      local id = a and by[unesc(a) .. " " .. unesc(b)]
      if id then unlocked[id] = true n = n + 1 end
    end
  end
  apply_all()
  log(string.format("named achievements: save slot %d, %d of a mod's unlocked in the layer's save file", r32(r32(0x00c7169c) + 0x10), n))
  return n
end
store.on_mod(function()
  if r32(r32(0x00c7169c) + 0x10) ~= 0 then T.achievements_load(true) end
end)

local function changed(id)
  apply(id)
  save_unlocked()
end
local function unlock_modded(id)
  if unlocked[id] then return false end
  unlocked[id] = true
  changed(id)
  local M = ModCallbacks
  if M.MC_POST_ACHIEVEMENT_UNLOCK then T.run(M.MC_POST_ACHIEVEMENT_UNLOCK, id, id) end
  return true
end
local function lock_modded(id)
  if not unlocked[id] then return false end
  unlocked[id] = nil
  changed(id)
  return true
end
T.unlock_modded, T.GAME_ACHIEVEMENTS = unlock_modded, GAME_ACHIEVEMENTS
local P = {}
P.__index = P
P.__type = "PersistentGameData"
function P:Unlocked(id)
  id = achievement_id(id, "Unlocked")
  if id >= GAME_ACHIEVEMENTS then return unlocked[id] == true end
  return game_unlocked(id)
end
-- REPENTOGON's TryUnlock does nothing for a mod's achievement while the game's
-- data is read-only (the byte at +1, which the game's own TryUnlock tests first,
-- 0x00929a2a: set in a run where the debug console was used, for one); the
-- layer's unlocks it all the same, as it did before round 112 (test_layer2.lua
-- checks it in such a run). Unlock is REPENTOGON's forced unlock.
function P:TryUnlock(id, blockPaperPopup)
  id = achievement_id(id, "TryUnlock")
  if id >= GAME_ACHIEVEMENTS then return unlock_modded(id) end
  return (call(0x00929a20, pgd(), id & 0xffffffff) & 0xff) ~= 0
end
function P:Unlock(id, blockPaperPopup)
  id = achievement_id(id, "Unlock")
  if id >= GAME_ACHIEVEMENTS then return unlock_modded(id) end
  return (call(0x00929a20, pgd(), id & 0xffffffff) & 0xff) ~= 0
end
function P:IncreaseEventCounter(counter, amount)
  call(0x00929b40, pgd(), achievement_id(counter, "IncreaseEventCounter") & 0xffffffff, achievement_id(amount, "IncreaseEventCounter") & 0xffffffff)
end
function P:GetBestiaryKillCount(etype, variant) return call(0x0092b100, pgd(), etype, variant or 0) end
function P:GetBestiaryDeathCount(etype, variant) return call(0x0092b070, pgd(), etype, variant or 0) end
function P:GetBestiaryEncounterCount(etype, variant) return call(0x0092b190, pgd(), etype, variant or 0) end
-- the counters are an array of ints at +0x2bc (asm: IncreaseEventCounter reads
-- its counter with `mov edi, [esi + ebx*4 + 0x2bc]` at 0x00929b68 and stores the
-- sum back with `mov [esi + ebx*4 + 0x2bc], eax` at 0x00929b7d; it does neither
-- while the byte at +1, saved data being read-only, is set)
local COUNTER_MAX = 0
for _, v in pairs(rawget(_G, "EventCounter") or {}) do
  if math.type(v) == "integer" and v > COUNTER_MAX then COUNTER_MAX = v end
end
function P:GetEventCounter(counter)
  local n = achievement_id(counter, "GetEventCounter")
  if n < 0 or n > COUNTER_MAX then error("bad argument #2 to 'GetEventCounter' (EventCounter cannot be higher than " .. COUNTER_MAX .. ")", 2) end
  return B.ri32(pgd() + 0x2bc + 4 * n)
end
local the_pgd = setmetatable({}, P)
static(Isaac, "Isaac", "GetPersistentGameData", function() return the_pgd end)
for name in pairs(P) do if name:sub(1, 2) ~= "__" then R.Implemented["PersistentGameData." .. name] = true end end
T.modded_achievements = unlocked

-- "lockachievement <id>" in the console locks one again, "achievement <id>"
-- unlocks one; for a mod's achievement that is the layer's to do
do
  local execute = Isaac.ExecuteCommand
  rawset(Isaac, "ExecuteCommand", function(command, ...)
    if type(command) == "string" then
      local id = tonumber(command:match("^%s*lockachievement%s+(%d+)%s*$"))
      if id and id >= GAME_ACHIEVEMENTS then
        lock_modded(id)
        return ""
      end
      -- "achievement <id>" unlocks one (REPENTOGON's console command)
      id = tonumber(command:match("^%s*achievement%s+(%d+)%s*$"))
      if id and id >= GAME_ACHIEVEMENTS then
        unlock_modded(id)
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
  -- round 112: the config's own fields (players[type] +0xe8 and +0x128, see the
  -- achievements above). For a mod's character with a named achievement the field
  -- holds -1 or that achievement's id here (REPENTOGON leaves it 0 and reads the XML).
  function PC:GetAchievementID()
    local at = player_config(self._id)
    return at and ri32(at + P_ACH) or -1
  end
  -- hidden from the menus: its flag, or one of the game's second halves (REPENTOGON's
  -- list: Lazarus risen, Dark Judas, the Soul, Esau and their tainted forms)
  local HIDDEN_GAME = { [11] = true, [12] = true, [17] = true, [20] = true, [38] = true, [39] = true, [40] = true }
  function PC:IsHidden()
    local at = player_config(self._id)
    return HIDDEN_GAME[self._id] == true or (at ~= nil and r8(at + P_HIDDEN) ~= 0)
  end
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
