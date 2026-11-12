-- api_innate.lua -- REPENTOGON's innate items on EntityPlayer: a collectible or
-- a trinket whose effect the player has without holding it, kept in named
-- groups, optionally for a number of frames.
--
-- REPENTOGON makes the game's HasCollectible / GetCollectibleNum / HasTrinket /
-- GetTrinketMultiplier answer for items that are not there (it patches those
-- functions). The layer cannot patch the game, so it gives the player the item
-- the ways the game itself already has of giving an effect without an
-- inventory entry, and keeps the books (groups, durations) in Lua:
--
-- * a collectible: a hidden item wisp. The player keeps a count of item wisps
--   per collectible, a std::map<int,int> at +0x1f80 (asm: HasCollectible
--   0x007706e0 looks the item up there at 0x00770b70..0x00770b9b and answers
--   true for a count > 0; GetCollectibleNum 0x00770ca0 reads it at
--   0x00770ffd..0x0077100f; the constructor 0x00753da0 makes it at 0x00754721).
--   The game never adds to that map by hand: 0x007d7740 (thiscall, ecx = the
--   player, one stack word = an item wisp to count beside the room's or 0,
--   `ret 4`) counts the room's familiars of variant 237 (ITEM_WISP) whose
--   player (+0x410) is this one, that exist (+0x172, the byte Entity:Exists
--   reads at 0x00417460) and are not flagged at +0x173, then for each id that
--   appeared or changed ORs its cache flags in, adds the costume of a new id
--   (AddCostume 0x0075d1d0, when ItemConfig +0xb2 AddCostumeOnPickup is set),
--   calls TriggerCollectibleRemoved 0x0078ff90 and RemoveCostume 0x0075d850 for
--   one that went, runs EvaluateItems 0x00763570 and swaps the new map in. The
--   game runs it when a wisp is spawned (0x00436d15) and when one dies
--   (0x00612156), not when an entity is merely Remove()d -- so the layer runs
--   it itself after removing one. Measured (lab_innate.lua): a wisp from
--   Game():Spawn(3, 237, ..., spawner = the player, subtype = the item) is in
--   the map at once, HasCollectible / GetCollectibleNum count it and Sad
--   Onion's tears apply (MaxFireDelay 10 -> 7.708); with the onlyReal /
--   ignoreModifiers argument the game does not count it; Remove() and the
--   recount take it out again (7.708 back to the earlier value); kept out of
--   orbit (RemoveFromOrbit, OrbitLayer -1 -- AddItemWisp's ring cap counts
--   layers 7..9 only, so the player's own wisps are never pushed out), with no
--   collision, FLAG_NO_QUERY (Isaac.FindByType does not list it; the recount,
--   which walks the room's list, still does) and invisible, it stays where it
--   was put and follows the player to the next room.
-- * a trinket: the player's smelted-trinket counters (api_player.lua: +0x1748,
--   { short count, short golden count } per trinket id), counted up and down
--   by what the layer added, with the game's TriggerTrinketAdded 0x007ad860 /
--   TriggerTrinketRemoved 0x007adb30 (the calls AddSmeltedTrinket and
--   TryRemoveSmeltedTrinket make) and an EvaluateItems. Measured: HasTrinket
--   and GetTrinketMultiplier answer, and Cancer's tears apply.
--
-- What a mod can see that REPENTOGON would not show it: the wisps are real
-- familiars (Isaac.FindByType / GetRoomEntities do not list them --
-- FLAG_NO_QUERY -- but anything that walks the room's entities natively does);
-- MC_POST_TRIGGER_COLLECTIBLE_ADDED/REMOVED and the costume follow the game's
-- wisp rules; the IgnoreSpoof argument of HasCollectible and the like is not
-- read; a smelted-trinket counter is shared with the player's own smelted
-- trinkets (GetSmeltedTrinkets is wrapped below to leave the innate ones out;
-- TryRemoveSmeltedTrinket can still take one); Glowing Hourglass does not
-- rewind the books. As in REPENTOGON, the onlyReal / ignoreModifiers argument
-- of HasCollectible / GetCollectibleNum leaves innate collectibles out.
--
-- Quit and continue (measured with lab_innate.lua, exit through the pause
-- menu): the game puts the wisps back with their InitSeed, subtype and
-- player but not their flags or visibility; a count written on a smelted
-- counter, during the run or in MC_PRE_GAME_EXIT, is not in the continued run.

local T = ...
local B, R, method = T.B, T.R, T.method
local ptr, r8, r16, w16, r32, call, log = B.ptr, B.r8, B.r16, B.w16, B.r32, B.call, B.log
local type, pairs, ipairs, next, tostring, pcall, rawget, rawset = type, pairs, ipairs, next, tostring, pcall, rawget, rawset
local mathtype, floor = math.type, math.floor
local unsupported = T.unsupported or function() end
local listen = T.listen
if not listen then log("api_innate: api_misc.lua did not load (no T.listen); innate items left out") return end

local WISP_RECOUNT = 0x007d7740        -- asm, see above: thiscall(player, extra wisp or 0), ret 4
local TRINKET_ADDED = 0x007ad860       -- thiscall(player, trinket, firstTime), as api_player.lua's AddSmeltedTrinket
local TRINKET_REMOVED = 0x007adb30     -- thiscall(player, trinket), as api_player.lua's TryRemoveSmeltedTrinket
local SMELTED = 0x1738 + 16            -- api_player.lua (lab_player.lua measured it)
local GAME = 0x00c71678                -- g_Game (asm: 0x007d7805)
local ROOM, LIST, LIST_COUNT = 0x18300, 0x124c, 0x1254   -- Game -> Room*; the room's entity list (asm: 0x007d780c..0x007d7827)
local E_TYPE, E_VARIANT, E_SUBTYPE, F_PLAYER = 0x28, 0x2c, 0x30, 0x410   -- asm: 0x007d782e..0x007d7857
local ITEM_WISP = 237
-- the low half of the InitSeed of every wisp the layer spawns: on continue, a wisp
-- with it that no book claims is one of the layer's whose books were lost
local SEED_MARK, SEED_MASK = 0x1a7e, 0xffff
local GOLDEN, MASK = 0x8000, 0x7fff
local HIDE_FLAGS = EntityFlag.FLAG_NO_QUERY | EntityFlag.FLAG_NO_TARGET

local M = ModCallbacks
local CB = { c = { add = M.MC_POST_ADD_INNATE_COLLECTIBLE, remove = M.MC_POST_REMOVE_INNATE_COLLECTIBLE },
             t = { add = M.MC_POST_ADD_INNATE_TRINKET, remove = M.MC_POST_REMOVE_INNATE_TRINKET } }
-- every function of these runs; nothing comes back (REPENTOGON: void)
for _, k in pairs(CB) do
  for _, id in pairs(k) do
    if T.RULE and T.rules then T.RULE[id] = T.rules.no_return end
    R.Implemented[id] = true
  end
end

------------------------------------------------------------------------------
-- arguments
------------------------------------------------------------------------------
local function int(v, default, n, what)
  if v == nil then return default end
  if mathtype(v) == "float" and v == floor(v) then v = math.tointeger(v) end
  if mathtype(v) ~= "integer" then error("bad argument #" .. n .. " to '" .. what .. "' (number expected, got " .. type(v) .. ")", 3) end
  return v
end
local function key_arg(v, n, what)
  if v == nil then return "" end
  if type(v) == "number" then return tostring(v) end
  if type(v) ~= "string" then error("bad argument #" .. n .. " to '" .. what .. "' (string expected, got " .. type(v) .. ")", 3) end
  return v
end
local function bool_arg(v, default)
  if v == nil then return default end
  return v and true or false
end
local config = Isaac.GetItemConfig()
-- kind "c": a collectible id; kind "t": a trinket id, golden flag kept (golden copies are counted apart)
local function valid(kind, id)
  if kind == "c" then return id > 0 and config:GetCollectible(id) ~= nil end
  local base = id & MASK
  return base > 0 and (id & ~(MASK | GOLDEN)) == 0 and config:GetTrinket(base) ~= nil
end
local function item_of(kind, id)
  if kind == "c" then return config:GetCollectible(id) end
  return config:GetTrinket(id & MASK)
end
local function check_id(kind, v, what)
  local id = int(v, nil, 1, what)
  if id == nil then error("bad argument #1 to '" .. what .. "' (number expected, got no value)", 3) end
  if kind == "t" then id = id & 0xffffffff end
  if not valid(kind, id) then error((kind == "c" and "Invalid CollectibleType " or "Invalid TrinketType ") .. id, 3) end
  return id
end

------------------------------------------------------------------------------
-- the books: per player, per kind, per group
------------------------------------------------------------------------------
-- recs[GetPtrHash(player)] = { ref = EntityPtr(player), seed = the run's start seed,
--   c = { groups = { [key] = { perm = { [id] = n }, temp = { { id, n, left } ... oldest first } } },
--         wisps = { [id] = { { ref = EntityPtr, seed = InitSeed } ... } } },
--   t = { groups = ..., added = { [id] = what the layer put on the smelted counter } } }
-- A player's pointer hash is reused by the next run, so a record is only taken
-- while its EntityPtr still answers with that player and the run is the same.
local recs = {}
local live_wisps = {}                  -- GetPtrHash(wisp) -> true, for the per-frame hiding
local n_wisps, n_temp = 0, 0           -- quick "anything to do" counts

local function run_seed() return Game():GetSeeds():GetStartSeed() end
-- the counts above, after a record was dropped
local function recompute()
  n_wisps, n_temp = 0, 0
  local keep = {}
  for _, r in pairs(recs) do
    for _, list in pairs(r.c.wisps) do
      for _, e in ipairs(list) do
        n_wisps = n_wisps + 1
        local w = e.ref.Ref
        if w then keep[GetPtrHash(w)] = true end
      end
    end
    for _, kind in ipairs({ "c", "t" }) do
      for _, g in pairs(r[kind].groups) do n_temp = n_temp + #g.temp end
    end
  end
  live_wisps = keep
end
local function new_rec(player)
  return { ref = EntityPtr(player), seed = run_seed(),
           c = { groups = {}, wisps = {} }, t = { groups = {}, added = {} } }
end
local function rec_of(player, make)
  local h = GetPtrHash(player)
  local r = recs[h]
  if r then
    local e = r.ref.Ref
    if e == nil or GetPtrHash(e) ~= h or r.seed ~= run_seed() then
      recs[h], r = nil, nil
      recompute()
    end
  end
  if not r and make then r = new_rec(player) recs[h] = r end
  return r
end

local function group_count(g, id)
  if not g then return 0 end
  local n = g.perm[id] or 0
  for _, e in ipairs(g.temp) do if e[1] == id then n = n + e[2] end end
  return n
end
local function total(K, id)
  local n = 0
  for _, g in pairs(K.groups) do n = n + group_count(g, id) end
  return n
end
local function group(K, key, make)
  local g = K.groups[key]
  if not g and make then g = { perm = {}, temp = {} } K.groups[key] = g end
  return g
end
local function drop_if_empty(K, key)
  local g = K.groups[key]
  if g and next(g.perm) == nil and #g.temp == 0 then K.groups[key] = nil end
end
-- the timed copies first, oldest first, then the lasting ones
local function take(K, key, id, amount)
  local g = K.groups[key]
  if not g or amount <= 0 then return 0 end
  local removed, i = 0, 1
  while i <= #g.temp and removed < amount do
    local e = g.temp[i]
    if e[1] == id then
      local k = math.min(e[2], amount - removed)
      e[2] = e[2] - k
      removed = removed + k
      if e[2] == 0 then table.remove(g.temp, i) n_temp = n_temp - 1 else i = i + 1 end
    else
      i = i + 1
    end
  end
  if removed < amount and g.perm[id] then
    local k = math.min(g.perm[id], amount - removed)
    g.perm[id] = g.perm[id] - k
    if g.perm[id] == 0 then g.perm[id] = nil end
    removed = removed + k
  end
  drop_if_empty(K, key)
  return removed
end
local function counts_of(g)
  local out = {}
  if g then
    for id, n in pairs(g.perm) do out[id] = n end
    for _, e in ipairs(g.temp) do out[e[1]] = (out[e[1]] or 0) + e[2] end
  end
  return out
end

------------------------------------------------------------------------------
-- the effect: hidden item wisps, smelted-trinket counters
------------------------------------------------------------------------------
local function hide(w)
  w.Visible = false
  w.Color = Color(1, 1, 1, 0)
  w.EntityCollisionClass = EntityCollisionClass.ENTCOLL_NONE
  w.GridCollisionClass = EntityGridCollisionClass.GRIDCOLL_NONE
  w:AddEntityFlags(HIDE_FLAGS)
  w:RemoveFromOrbit()
  live_wisps[GetPtrHash(w)] = true
end

local function alive(list)
  local i = 1
  while i <= #list do
    local e = list[i].ref.Ref
    if e == nil or not e:Exists() then
      table.remove(list, i)
      n_wisps = n_wisps - 1
    else
      i = i + 1
    end
  end
  return list
end

-- Bring the player's wisps of `id` to the count the books say. Returns true
-- when one was removed (the caller runs the recount once).
local function sync_collectible(player, r, id, add_costume)
  local list = r.c.wisps[id]
  if not list then list = {} r.c.wisps[id] = list end
  alive(list)
  local want, removed = total(r.c, id), false
  if #list < want then
    local real = player:HasCollectible(id, true)
    local had = player:GetCollectibleNum(id) > 0
    while #list < want do
      local seed = (Random() & 0xffff0000) | SEED_MARK
      local w = Game():Spawn(EntityType.ENTITY_FAMILIAR, ITEM_WISP, player.Position, Vector.Zero, player, id, seed):ToFamiliar()
      if not w then break end
      hide(w)
      list[#list + 1] = { ref = EntityPtr(w), seed = w.InitSeed }
      n_wisps = n_wisps + 1
    end
    -- the game's recount put the item's costume on when the id first appeared
    local item = item_of("c", id)
    if add_costume == false and not had and not real and item and item.AddCostumeOnPickup then player:RemoveCostume(item) end
  end
  while #list > want do
    local e = table.remove(list)
    n_wisps = n_wisps - 1
    local w = e.ref.Ref
    if w then live_wisps[GetPtrHash(w)] = nil w:Remove() end
    removed = true
  end
  if #list == 0 then r.c.wisps[id] = nil end
  return removed
end
local function recount(player) call(WISP_RECOUNT, ptr(player), 0) end

local function smelted_at(player, id)
  local a = ptr(player) + SMELTED
  local first, last = r32(a), r32(a + 4)
  local base = id & MASK
  if last < first or (last - first) % 4 ~= 0 or base >= (last - first) // 4 then return nil end
  return first + 4 * base + ((id & GOLDEN) ~= 0 and 2 or 0)
end
local function sync_trinket(player, r, id, add_costume)
  local want, have = total(r.t, id), r.t.added[id] or 0
  if want == have then return end
  local at = smelted_at(player, id)
  if not at then return end
  local item = item_of("t", id)
  if want > have then
    w16(at, math.min(r16(at) + (want - have), 0x7fff))
    call(TRINKET_ADDED, ptr(player), id, 0)
    if add_costume ~= false and item and item.AddCostumeOnPickup then player:AddCostume(item, false) end
  else
    local n = r16(at)
    w16(at, math.max(n - (have - want), 0))
    call(TRINKET_REMOVED, ptr(player), id)
    if item and item.AddCostumeOnPickup and not player:HasTrinket(id & MASK) then player:RemoveCostume(item) end
  end
  if want == 0 then r.t.added[id] = nil else r.t.added[id] = want end
  if item then player:AddCacheFlags(item.CacheFlags) end
  player:EvaluateItems()
end

local function sync(player, r, kind, ids, add_costume)
  if kind == "c" then
    local removed = false
    for id in pairs(ids) do removed = sync_collectible(player, r, id, add_costume) or removed end
    if removed then recount(player) end
  else
    for id in pairs(ids) do sync_trinket(player, r, id, add_costume) end
  end
end

-- MC_POST_ADD_INNATE_* (player, id, key, amount, duration) / MC_POST_REMOVE_INNATE_* (player, id, key,
-- amount, expired), param: the id or the group's key
local function fire(kind, what, player, id, key, amount, extra)
  local cb = CB[kind][what]
  if cb and T.listening[cb] and T.run2 then T.run2(cb, id, key, player, id, key, amount, extra) end
end

------------------------------------------------------------------------------
-- the operations, shared by both kinds
------------------------------------------------------------------------------
local function add(player, kind, id, amount, key, duration, add_costume)
  if amount <= 0 then return end
  local r = rec_of(player, true)
  local K = r[kind]
  local g = group(K, key, true)
  if duration > 0 then
    g.temp[#g.temp + 1] = { id, amount, duration }
    n_temp = n_temp + 1
  else
    g.perm[id] = (g.perm[id] or 0) + amount
  end
  sync(player, r, kind, { [id] = true }, add_costume)
  -- MC_POST_TRIGGER_COLLECTIBLE_ADDED (player, id, false, true): REPENTOGON's innate items run it when one is
  -- added (round 109)
  local TCA = M.MC_POST_TRIGGER_COLLECTIBLE_ADDED
  if kind == "c" and TCA and T.listening[TCA] then T.run(TCA, id, player, id, false, true) end
  fire(kind, "add", player, id, key, amount, duration)
end
local function remove(player, kind, id, amount, key)
  local r = rec_of(player, false)
  if not r or amount <= 0 then return 0 end
  local removed = take(r[kind], key, id, amount)
  if removed > 0 then
    sync(player, r, kind, { [id] = true })
    fire(kind, "remove", player, id, key, removed, false)
  end
  return removed
end
local function count(player, kind, id, key)
  local r = rec_of(player, false)
  return r and group_count(r[kind].groups[key], id) or 0
end
local function set_count(player, kind, id, n, key, add_costume)
  if n < 0 then n = 0 end
  local diff = n - count(player, kind, id, key)
  if diff > 0 then add(player, kind, id, diff, key, -1, add_costume) return diff end
  if diff < 0 then return -remove(player, kind, id, -diff, key) end
  return 0
end
local function clear(player, kind, key)
  local r = rec_of(player, false)
  if not r then return end
  local K = r[kind]
  local g = K.groups[key]
  if not g then return end
  local gone = counts_of(g)
  n_temp = n_temp - #g.temp
  K.groups[key] = nil
  sync(player, r, kind, gone)
  local ids = {}
  for id in pairs(gone) do ids[#ids + 1] = id end
  table.sort(ids)
  for _, id in ipairs(ids) do fire(kind, "remove", player, id, key, gone[id], false) end
end

------------------------------------------------------------------------------
-- EntityPlayer methods
------------------------------------------------------------------------------
local P = "EntityPlayer"
local said_negative = false
method(P, "AddInnateCollectible", function(self, id, amount, key, duration, add_costume)
  T.this(self, "AddInnateCollectible")
  id = check_id("c", id, "AddInnateCollectible")
  amount = int(amount, 1, 2, "AddInnateCollectible")
  -- an undocumented boolean once went here; REPENTOGON still ignores one
  if type(key) == "boolean" then key = nil end
  key = key_arg(key, 3, "AddInnateCollectible")
  duration = int(duration, -1, 4, "AddInnateCollectible")
  add_costume = bool_arg(add_costume, true)
  if amount < 0 then
    -- REPENTOGON's deprecated removal: from the "" group, refused when the new arguments are used
    if key ~= "" or duration ~= -1 then
      error("bad argument #2 to 'AddInnateCollectible' (Removing innate collectibles with AddInnateCollectible via a negative `Amount` is deprecated. Please use RemoveInnateCollectible instead.)", 2)
    end
    if not said_negative then
      said_negative = true
      Isaac.DebugString("[REPENTOGON] [WARN] Removing innate collectibles with AddInnateCollectible via a negative `Amount` is deprecated. Please use RemoveInnateCollectible instead.")
    end
    remove(self, "c", id, -amount, "")
    return
  end
  add(self, "c", id, amount, key, duration, add_costume)
end)
method(P, "AddInnateTrinket", function(self, id, amount, key, duration, add_costume)
  T.this(self, "AddInnateTrinket")
  id = check_id("t", id, "AddInnateTrinket")
  add(self, "t", id, int(amount, 1, 2, "AddInnateTrinket"), key_arg(key, 3, "AddInnateTrinket"),
      int(duration, -1, 4, "AddInnateTrinket"), bool_arg(add_costume, true))
end)
for kind, name in pairs({ c = "Collectible", t = "Trinket" }) do
  method(P, "RemoveInnate" .. name, function(self, id, amount, key)
    local what = "RemoveInnate" .. name
    T.this(self, what)
    id = check_id(kind, id, what)
    return remove(self, kind, id, int(amount, 1, 2, what), key_arg(key, 3, what))
  end)
  method(P, "GetInnate" .. name .. "Count", function(self, id, key)
    local what = "GetInnate" .. name .. "Count"
    T.this(self, what)
    id = check_id(kind, id, what)
    return count(self, kind, id, key_arg(key, 2, what))
  end)
  method(P, "GetInnate" .. name .. "Group", function(self, key)
    local what = "GetInnate" .. name .. "Group"
    T.this(self, what)
    local r = rec_of(self, false)
    return counts_of(r and r[kind].groups[key_arg(key, 1, what)])
  end)
  method(P, "SetInnate" .. name .. "Count", function(self, id, n, key, add_costume)
    local what = "SetInnate" .. name .. "Count"
    T.this(self, what)
    id = check_id(kind, id, what)
    return set_count(self, kind, id, int(n, 1, 2, what), key_arg(key, 3, what), bool_arg(add_costume, true))
  end)
  method(P, "SetInnate" .. name .. "Group", function(self, key, counts, add_costume)
    local what = "SetInnate" .. name .. "Group"
    T.this(self, what)
    key = key_arg(key, 1, what)
    if type(counts) ~= "table" then error("bad argument #2 to '" .. what .. "' (table expected, got " .. type(counts) .. ")", 2) end
    add_costume = bool_arg(add_costume, true)
    local want = {}
    local r = rec_of(self, false)
    for id in pairs(counts_of(r and r[kind].groups[key])) do want[id] = 0 end
    for id, n in pairs(counts) do
      id = int(id, nil, 2, what)
      if kind == "t" then id = id & (MASK | GOLDEN) end
      want[id] = int(n, 0, 2, what)
    end
    local ids = {}
    for id in pairs(want) do ids[#ids + 1] = id end
    table.sort(ids)
    for _, id in ipairs(ids) do
      if valid(kind, id) then set_count(self, kind, id, want[id], key, add_costume) end
    end
  end)
end
method(P, "ClearInnateItemGroup", function(self, key)
  T.this(self, "ClearInnateItemGroup")
  key = key_arg(key, 1, "ClearInnateItemGroup")
  clear(self, "c", key)
  clear(self, "t", key)
end)

-- GetSmeltedTrinkets (api_player.lua) leaves out what this file put on the counters,
-- as REPENTOGON's lists only the trinkets really smelted
do
  local c, const = T.class_tables(P)
  local game_list = c and rawget(c, "GetSmeltedTrinkets")
  if type(game_list) == "function" then
    local wrapped = B.cfn(function(self, ids)
      local out = game_list(self, ids)
      local r = rec_of(self, false)
      if r and type(out) == "table" then
        for id, n in pairs(r.t.added) do
          local d = out[id & MASK]
          if d then
            if (id & GOLDEN) ~= 0 then d.goldenTrinketAmount = math.max(0, d.goldenTrinketAmount - n)
            else d.trinketAmount = math.max(0, d.trinketAmount - n) end
          end
        end
      end
      return out
    end)
    rawset(c, "GetSmeltedTrinkets", wrapped)
    if const and const ~= c then rawset(const, "GetSmeltedTrinkets", wrapped) end
  end
end

------------------------------------------------------------------------------
-- every frame: durations, hiding, a wisp something else removed
------------------------------------------------------------------------------
local function players()
  local out, g = {}, Game()
  for i = 0, g:GetNumPlayers() - 1 do out[#out + 1] = g:GetPlayer(i) end
  return out
end

-- 30 frames a second, counted on the player's own update as REPENTOGON does
listen(M.MC_POST_PEFFECT_UPDATE, function(_, player)
  if n_temp <= 0 then return end
  local r = rec_of(player, false)
  if not r then return end
  for _, kind in ipairs({ "c", "t" }) do
    local K = r[kind]
    local expired = {}                      -- { key, id, n }
    for key, g in pairs(K.groups) do
      local i = 1
      while i <= #g.temp do
        local e = g.temp[i]
        e[3] = e[3] - 1
        if e[3] <= 0 then
          table.remove(g.temp, i)
          n_temp = n_temp - 1
          expired[#expired + 1] = { key, e[1], e[2] }
        else
          i = i + 1
        end
      end
    end
    if #expired > 0 then
      local ids = {}
      for _, x in ipairs(expired) do ids[x[2]] = true drop_if_empty(K, x[1]) end
      sync(player, r, kind, ids)
      for _, x in ipairs(expired) do fire(kind, "remove", player, x[2], x[1], x[3], true) end
    end
  end
end, CallbackPriority.IMPORTANT)

-- the game shows a familiar again on every update
listen(M.MC_FAMILIAR_UPDATE, function(_, fam)
  if live_wisps[GetPtrHash(fam)] then fam.Visible = false end
end, CallbackPriority.IMPORTANT)
-- nothing hurts a hidden wisp (it has no collision; an explosion does not ask)
listen(M.MC_ENTITY_TAKE_DMG, function(_, ent)
  if ent.Type == EntityType.ENTITY_FAMILIAR and ent.Variant == ITEM_WISP and live_wisps[GetPtrHash(ent)] then return false end
end, CallbackPriority.IMPORTANT)

-- a wisp gone without the books saying so (something killed or removed it): put it back
local check_at = 0
listen(M.MC_POST_UPDATE, function()
  if n_wisps <= 0 then return end
  check_at = check_at + 1
  if check_at < 15 then return end
  check_at = 0
  for _, p in ipairs(players()) do
    local r = rec_of(p, false)
    if r and next(r.c.wisps) then
      local ids = {}
      for id, list in pairs(r.c.wisps) do
        local before = #list
        if #alive(list) < before then ids[id] = true end
      end
      if next(ids) then
        recount(p)
        sync(p, r, "c", ids)
      end
    end
  end
end)

------------------------------------------------------------------------------
-- runs: a new run starts empty; quit and continue keeps the named groups
------------------------------------------------------------------------------
-- REPENTOGON keeps the groups with a non-empty key across quit and continue
-- and drops the "" group. The game puts the wisps back on continue (not the
-- layer's smelted counts); the books are kept here (in memory, and in the
-- layer's own save file for a reload of the page) with the InitSeed of each
-- wisp, so that on continue the layer finds its wisps again, hides them, puts
-- the kept trinkets back on and takes the "" group's items away. Measured
-- (lab_innate.lua, exit through the pause menu, continue in the same page and
-- after a reload of the page): the named groups come back with what was left of
-- a duration, the "" group does not. A wisp of the layer's (SEED_MARK in its
-- InitSeed) that no book claims is removed on continue; a player's own item
-- wisp has a 1 in 65536 chance of carrying the same mark.
local layer_mod                            -- the layer's own mod (main.lua registers it), for its save file
do
  -- the game's RegisterMod (its main.lua) hands the new mod table to Isaac.RegisterMod
  local register = Isaac.RegisterMod
  if type(register) == "function" then
    rawset(Isaac, "RegisterMod", function(m, name, ...)
      if name == "REPENTOGON (browser)" and layer_mod == nil and type(m) == "table" then
        layer_mod = m
        log("api_innate: innate items of a quit run are kept in the save data of the mod '" .. name .. "'")
      end
      return register(m, name, ...)
    end)
  end
end

local function esc(s) return (s:gsub("[^%w_%-]", function(c) return string.format("%%%02x", c:byte()) end)) end
local function unesc(s) return (s:gsub("%%(%x%x)", function(h) return string.char(tonumber(h, 16)) end)) end

-- one line per entry: "<player> <c|t> g <key> <id> <n> <left>" (left -1 for a lasting copy),
-- "<player> c w <id> <seed>" for a wisp, "<player> t a <id> <n>" for a counter
local function snapshot()
  local lines = { "rgon-innate 1" }
  for i, p in ipairs(players()) do
    local r = rec_of(p, false)
    if r then
      for _, kind in ipairs({ "c", "t" }) do
        for key, g in pairs(r[kind].groups) do
          for id, n in pairs(g.perm) do lines[#lines + 1] = table.concat({ i, kind, "g", "=" .. esc(key), id, n, -1 }, " ") end
          for _, e in ipairs(g.temp) do lines[#lines + 1] = table.concat({ i, kind, "g", "=" .. esc(key), e[1], e[2], e[3] }, " ") end
        end
      end
      for id, list in pairs(r.c.wisps) do
        for _, e in ipairs(list) do lines[#lines + 1] = table.concat({ i, "c", "w", id, e.seed }, " ") end
      end
      for id, n in pairs(r.t.added) do lines[#lines + 1] = table.concat({ i, "t", "a", id, n }, " ") end
    end
  end
  return table.concat(lines, "\n")
end

local function room_wisps_of(player)
  local out = {}
  local game = r32(GAME)
  local room = game ~= 0 and r32(game + ROOM) or 0
  if room == 0 then return out end
  local n, base, me = r32(room + LIST_COUNT), r32(room + LIST), ptr(player)
  if n > 0x4000 then return out end
  for i = 0, n - 1 do
    local e = r32(base + 4 * i)
    if e ~= 0 and r32(e + E_TYPE) == EntityType.ENTITY_FAMILIAR and r32(e + E_VARIANT) == ITEM_WISP and r32(e + F_PLAYER) == me and r8(e + 0x172) ~= 0 then
      local w = T.wrap("EntityFamiliar", e)
      if w then out[#out + 1] = w end
    end
  end
  return out
end

local function restore(text)
  if type(text) ~= "string" or not text:find("^rgon%-innate 1") then return end
  local ps = players()
  local by = {}
  for line in text:gmatch("[^\n]+") do
    local f = {}
    for w in line:gmatch("%S+") do f[#f + 1] = w end
    local i = tonumber(f[1])
    if i and ps[i] then
      local b = by[i] or { groups = { c = {}, t = {} }, seeds = {}, added = {} }
      by[i] = b
      if f[3] == "g" and #f == 7 then
        local key, id, n, left = unesc(f[4]:sub(2)), tonumber(f[5]), tonumber(f[6]), tonumber(f[7])
        local K = b.groups[f[2]]
        if K and id and n and left then
          local g = K[key] or { perm = {}, temp = {} }
          K[key] = g
          if left > 0 then g.temp[#g.temp + 1] = { id, n, left } else g.perm[id] = (g.perm[id] or 0) + n end
        end
      elseif f[3] == "w" then
        b.seeds[tonumber(f[5]) or -1] = tonumber(f[4])
      elseif f[3] == "a" then
        b.added[tonumber(f[4])] = tonumber(f[5])
      end
    end
  end
  for i, b in pairs(by) do
    local p = ps[i]
    local r = new_rec(p)
    recs[GetPtrHash(p)] = r
    -- the wisps the game put back: the ones whose seeds are the layer's
    for _, w in ipairs(room_wisps_of(p)) do
      local id = b.seeds[w.InitSeed]
      if id and id == w.SubType then
        b.seeds[w.InitSeed] = nil
        hide(w)
        local list = r.c.wisps[id] or {}
        r.c.wisps[id] = list
        list[#list + 1] = { ref = EntityPtr(w), seed = w.InitSeed }
        n_wisps = n_wisps + 1
      end
    end
    -- A count the layer wrote on a smelted counter is not in the continued run
    -- (lab_innate.lua: written 1 during the run, 0 after continue), so every
    -- innate trinket of a kept group is put on again.
    r.t.added = {}
    local ids = { c = {}, t = {} }
    for kind, groups in pairs(b.groups) do
      for key, g in pairs(groups) do
        for id in pairs(counts_of(g)) do ids[kind][id] = true end
        if key ~= "" then
          r[kind].groups[key] = g
          n_temp = n_temp + #g.temp
        end
      end
    end
    for id in pairs(r.c.wisps) do ids.c[id] = true end
    for id in pairs(r.t.added) do ids.t[id] = true end
    -- the "" group is not kept: its wisps and counters go now
    sync(p, r, "c", ids.c, true)
    sync(p, r, "t", ids.t, true)
  end
end

-- for lab_innate.lua
T.innate = { layer_mod = function() return layer_mod end, snapshot = snapshot }

local kept                                  -- the books of the run that was left, for its continue
listen(M.MC_PRE_GAME_EXIT, function(_, should_save)
  if should_save then
    kept = snapshot()
    if layer_mod then pcall(Isaac.SaveModData, layer_mod, kept) end
  else
    kept = nil
    if layer_mod then pcall(Isaac.RemoveModData, layer_mod) end
  end
  recs, live_wisps, n_wisps, n_temp = {}, {}, 0, 0
end, CallbackPriority.IMPORTANT)

listen(M.MC_POST_GAME_STARTED, function(_, continued)
  -- whatever a previous run left is not this run's (a mod's MC_POST_PLAYER_INIT additions
  -- for this run are: their records carry this run's players and seed)
  for h, r in pairs(recs) do
    local e = r.ref.Ref
    if e == nil or GetPtrHash(e) ~= h or r.seed ~= run_seed() then recs[h] = nil end
  end
  recompute()
  if continued then
    local text = kept
    if not text and layer_mod then
      local ok, saved = pcall(Isaac.LoadModData, layer_mod)
      if ok then text = saved end
    end
    restore(text)
    -- a wisp of the layer's that no book claims (the save data was lost): it goes,
    -- rather than staying as a plain item wisp with the item for good
    for _, p in ipairs(players()) do
      local swept = false
      for _, w in ipairs(room_wisps_of(p)) do
        if (w.InitSeed & SEED_MASK) == SEED_MARK and not live_wisps[GetPtrHash(w)] then w:Remove() swept = true end
      end
      if swept then recount(p) log("api_innate: removed innate-item wisps whose books were lost") end
    end
  end
  kept = nil
end, -math.huge)

-- Accepted, not done (listed from the start, said once when it happens):
-- Glowing Hourglass puts the player back as it was a room ago; the books are not
-- put back with it (REPENTOGON's are). The IgnoreSpoof argument REPENTOGON adds
-- to the game's HasCollectible / GetCollectibleNum / HasTrinket is not read.
local HOURGLASS = "EntityPlayer:AddInnateCollectible with Glowing Hourglass"
R.Unsupported = R.Unsupported or {}
R.Unsupported[HOURGLASS] = R.Unsupported[HOURGLASS] or "a rewind does not rewind the innate items"
R.Unsupported["EntityPlayer:HasCollectible IgnoreSpoof"] = R.Unsupported["EntityPlayer:HasCollectible IgnoreSpoof"]
  or "the argument is not read: innate items count unless ignoreModifiers is true"
listen(M.MC_USE_ITEM, function(_, item)
  if item ~= CollectibleType.COLLECTIBLE_GLOWING_HOUR_GLASS then return end
  if n_wisps > 0 or n_temp > 0 or next(recs) then
    unsupported(HOURGLASS, R.Unsupported[HOURGLASS])
  end
end, CallbackPriority.IMPORTANT)
