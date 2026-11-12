-- api_callbacks.lua -- how the layer's callbacks are run.
--
-- The game's own main.lua runs a callback list until a function returns
-- something. REPENTOGON's callbacks do not all work that way: some hand each
-- function the value the one before returned ("additive"), some stop only on
-- false, some ignore what is returned, and an error in one function is logged
-- and the rest still run. A mod written for REPENTOGON counts on that, so the
-- callbacks this layer fires (ids from 1000 up) are run by the rules here.
-- The game's own callbacks (ids below 1000) and mods' private ones are left to
-- the game's runner, exactly as without the layer.
--
-- The lists themselves stay the game's (Isaac.GetCallbacks): entries of
-- { Mod, Function, Priority, Param }, already in priority order.

local T = ...
local B, R = T.B, T.R
local type, ipairs, pcall, tostring, rawset, select = type, ipairs, pcall, tostring, rawset, select
local GetCallbacks = Isaac.GetCallbacks

local names = {}                      -- id -> "MC_X", for messages
for k, v in pairs(ModCallbacks) do if type(v) == "number" then names[v] = k end end
T.callback_name = function(id) return names[id] or tostring(id) end

local function matches(a, b)          -- the game's own rule for an optional parameter
  return not a or not b or a == -1 or b == -1 or a == b
end

-- Isaac.GetCallbackIterator(id, param): the functions that would run, in order,
-- as a function that returns the next entry (nil at the end).
local function iterator(id, param, param2)
  local list, i = GetCallbacks(id), 0
  local mt = getmetatable(list)                       -- a list may bring its own rule (the game's runner asks the same)
  local match = mt and mt.__matchParams or matches
  return function()
    while true do
      i = i + 1
      local cb = list[i]
      if cb == nil then return nil end
      if match(param, cb.Param) or (param2 ~= nil and match(param2, cb.Param)) then return cb end
    end
  end
end

-- One function of a list. An error is written to the game's log and the
-- console with the callback's and the mod's names, and counts as no answer.
local function call(id, cb, ...)
  local ok, ret = pcall(cb.Function, cb.Mod, ...)
  if ok then return ret end
  local who = type(cb.Mod) == "table" and tostring(cb.Mod.Name) or "?"
  local msg = '"' .. (names[id] or tostring(id)) .. '" from "' .. who .. '" failed: ' .. tostring(ret)
  Isaac.DebugString(msg)
  pcall(Isaac.ConsoleOutput, msg .. "\n")
  return nil
end

-- the rules
local function first(id, it, ...)                 -- the first answer ends the run
  for cb in it do
    local ret = call(id, cb, ...)
    if ret ~= nil then return ret end
  end
end
local function no_return(id, it, ...)             -- every function runs; nothing comes back
  for cb in it do call(id, cb, ...) end
end
local function false_break(id, it, ...)           -- only false ends the run
  for cb in it do
    if call(id, cb, ...) == false then return false end
  end
end
-- fold(n): what a function returns replaces argument n for the ones after it,
-- and the last value comes back. With stop_on_false, false ends the run.
local function fold(n, stop_on_false)
  return function(id, it, ...)
    local args, count = { ... }, select("#", ...)
    for cb in it do
      local ret = call(id, cb, table.unpack(args, 1, count))
      if stop_on_false and ret == false then return false end
      if ret ~= nil and not (stop_on_false and type(ret) == "boolean") then args[n] = ret end
    end
    return args[n]
  end
end
-- a boolean ends the run; tables are merged, later keys over earlier ones
local function merge_tables(id, it, ...)
  local out
  for cb in it do
    local ret = call(id, cb, ...)
    if type(ret) == "boolean" then return ret end
    if type(ret) == "table" then
      if out then for k, v in pairs(ret) do out[k] = v end else out = ret end
    end
  end
  return out
end
-- (entity, offset, ...): false ends the run; a Vector is added to the offset
local function pre_render(id, it, ent, offset, ...)
  for cb in it do
    local ret = call(id, cb, ent, offset, ...)
    if ret == false then return false end
    if type(ret) == "userdata" and ret.X and ret.Y then offset = offset + ret end
  end
  return offset
end

local RULE = {}
T.RULE = RULE
T.rules = { first = first, no_return = no_return, false_break = false_break, fold = fold, merge_tables = merge_tables, pre_render = pre_render, call = call }
local M = ModCallbacks
-- by name, so a name the enum table does not have is said rather than cutting the list short
local function rule(list, f)
  for name in list:gmatch("[%w_]+") do
    local id = M[name]
    if id then RULE[id] = f else B.log("api_callbacks: no ModCallbacks." .. name) end
  end
end
rule("MC_POST_ADD_COLLECTIBLE MC_POST_APPLY_TEARFLAG_EFFECTS MC_PLAYER_HEALTH_TYPE_CHANGE MC_POST_BOMB_DAMAGE MC_POST_BOMB_TEARFLAG_EFFECTS MC_POST_HISTORYHUD_RENDER MC_POST_HISTORYHUD_RECOMPUTE MC_POST_GRID_HURT MC_POST_RENDER_CHARACTER_SELECT_PORTRAIT MC_POST_RENDER_CHARACTER_SELECT_PAGE", no_return)
rule("MC_PRE_RENDER_CHARACTER_SELECT_PAGE MC_CAN_SELECT_CHARACTER", false_break)
rule("MC_PRE_PLAYER_APPLY_INNATE_COLLECTIBLE_NUM MC_PRE_DEVIL_APPLY_ITEMS MC_PRE_DEVIL_APPLY_SPECIAL_ITEMS MC_POST_DEVIL_CALCULATE MC_PRE_PLANETARIUM_APPLY_ITEMS MC_PRE_PLANETARIUM_APPLY_TELESCOPE_LENS MC_POST_PLANETARIUM_CALCULATE", fold(1))
rule("MC_EVALUATE_FAMILIAR_MULTIPLIER MC_EVALUATE_TEAR_HIT_PARAMS MC_PLAYER_GET_HEART_LIMIT", fold(2))
rule("MC_PRE_GRID_HURT", fold(2, true))
rule("MC_EVALUATE_CUSTOM_CACHE MC_PLAYER_GET_ACTIVE_MIN_USABLE_CHARGE MC_EVALUATE_STAT", fold(3))
rule("MC_PRE_RENDER_CHARACTER_SELECT_PORTRAIT", fold(3, true))
rule("MC_PLAYER_GET_ACTIVE_MAX_CHARGE", fold(4))
rule("MC_PRE_PLAYERHUD_RENDER_ACTIVE_ITEM", merge_tables)
rule("MC_PRE_FAMILIAR_RENDER MC_PRE_NPC_RENDER MC_PRE_PLAYER_RENDER MC_PRE_PICKUP_RENDER MC_PRE_TEAR_RENDER MC_PRE_PROJECTILE_RENDER MC_PRE_KNIFE_RENDER MC_PRE_EFFECT_RENDER MC_PRE_BOMB_RENDER MC_PRE_SLOT_RENDER", pre_render)
-- (collectible, charge, firstTime, slot, varData, player): false ends it; an
-- integer is the item for the functions after; a table replaces what it names
RULE[M.MC_PRE_ADD_COLLECTIBLE] = function(id, it, item, charge, first_time, slot, var, ...)
  local changed = false
  for cb in it do
    local ret = call(id, cb, item, charge, first_time, slot, var, ...)
    if ret == false then return false end
    if math.type(ret) == "integer" then
      item, changed = ret, true
    elseif type(ret) == "table" then
      if math.type(ret[1]) == "integer" then item = ret[1] end
      if math.type(ret[2]) == "integer" then charge = ret[2] end
      if type(ret[3]) == "boolean" then first_time = ret[3] end
      if math.type(ret[4]) == "integer" then slot = ret[4] end
      if math.type(ret[5]) == "integer" then var = ret[5] end
      changed = true
    end
  end
  if changed then return { item, charge, first_time, slot, var } end
end
-- (player, trinket, firstTime): the same, for a trinket
RULE[M.MC_PRE_ADD_TRINKET] = function(id, it, player, trinket, first_time, ...)
  local changed = false
  for cb in it do
    local ret = call(id, cb, player, trinket, first_time, ...)
    if ret == false then return false end
    if math.type(ret) == "integer" then
      trinket, changed = ret, true
    elseif type(ret) == "table" then
      if math.type(ret[1]) == "integer" then trinket = ret[1] end
      if type(ret[2]) == "boolean" then first_time = ret[2] end
      changed = true
    end
  end
  if changed then return { trinket, first_time } end
end
-- (player, card or pill, ...): false ends it; a positive number replaces the card or pill
local function add_card_pill(id, it, player, what, ...)
  for cb in it do
    local ret = call(id, cb, player, what, ...)
    if ret == false then return false end
    if type(ret) == "number" and ret > 0 then what = ret end
  end
  return what
end
rule("MC_PRE_PLAYER_ADD_CARD MC_PRE_PLAYER_ADD_PILL", add_card_pill)
-- false ends the run; tables are merged into one answer, and the values a table
-- names are what the functions after it are handed (`keys`: name -> argument)
local function merge_or_false(keys)
  return function(id, it, ...)
    local args, count = { ... }, select("#", ...)
    local out
    for cb in it do
      local ret = call(id, cb, table.unpack(args, 1, count))
      if ret == false then return false end
      if type(ret) == "table" then
        for k, n in pairs(keys) do if ret[k] ~= nil then args[n] = ret[k] end end
        if out then for k, v in pairs(ret) do out[k] = v end else out = ret end
      end
    end
    return out
  end
end
if M.MC_PRE_APPLY_TEARFLAG_EFFECTS then RULE[M.MC_PRE_APPLY_TEARFLAG_EFFECTS] = merge_or_false({ Position = 2, TearFlags = 3, Damage = 5 }) end
if M.MC_PRE_BOMB_DAMAGE then RULE[M.MC_PRE_BOMB_DAMAGE] = merge_or_false({ Position = 1, Damage = 2, Radius = 3, TearFlags = 6, DamageFlags = 7 }) end
if M.MC_PRE_BOMB_TEARFLAG_EFFECTS then RULE[M.MC_PRE_BOMB_TEARFLAG_EFFECTS] = merge_or_false({ Position = 1, Radius = 2, TearFlags = 3, RadiusMult = 5 }) end

-- The game's own callbacks whose rule REPENTOGON changes. Every other one of
-- the game's keeps "the first answer ends the run", with one difference that
-- mods written for REPENTOGON count on: an error in one function is logged and
-- the functions after it still run (the game's runner stops the whole list).
rule("MC_POST_ENTITY_REMOVE", no_return)
rule("MC_POST_CURSE_EVAL", fold(1))
-- only false ends the run; true does not (and is not handed on). A table
-- ({ Damage, DamageFlags, DamageCountdown }) is shown to the functions after
-- it and merged. The engine of this build reads a boolean only, so the merged
-- table changes nothing in the game yet: said once.
local said_dmg_table = false
RULE[M.MC_ENTITY_TAKE_DMG] = function(id, it, entity, damage, flags, source, countdown, ...)
  local out
  for cb in it do
    local ret = call(id, cb, entity, damage, flags, source, countdown, ...)
    if ret == false then return false end
    if type(ret) == "table" then
      if type(ret.Damage) == "number" then damage = ret.Damage end
      if math.type(ret.DamageFlags) == "integer" then flags = ret.DamageFlags end
      if type(ret.DamageCountdown) == "number" then countdown = ret.DamageCountdown end
      if out then for k, v in pairs(ret) do out[k] = v end else out = ret end
      if not said_dmg_table then
        said_dmg_table = true
        B.log("accepted, not supported in the browser: a table returned from MC_ENTITY_TAKE_DMG (the damage is not changed)")
      end
    end
  end
  return out
end
-- { variant, subtype, keep going }: without the third entry the answer ends the run
RULE[M.MC_POST_PICKUP_SELECTION] = function(id, it, pickup, variant, subtype, ...)
  local last
  for cb in it do
    local ret = call(id, cb, pickup, variant, subtype, ...)
    if type(ret) == "table" then
      if not ret[3] then return ret end
      if math.type(ret[1]) == "integer" and math.type(ret[2]) == "integer" then
        last, variant, subtype = { ret[1], ret[2] }, ret[1], ret[2]
      end
    end
  end
  return last
end

local function over(id, it, ...)
  return (RULE[id] or first)(id, it, ...)
end
local function run(id, param, ...)
  return over(id, iterator(id, param), ...)
end
T.run = run                                   -- the hooks' way to fire a callback
T.run2 = function(id, p1, p2, ...) return over(id, iterator(id, p1, p2), ...) end

rawset(Isaac, "GetCallbackIterator", function(id, param) return iterator(id, param) end)
rawset(Isaac, "RunCallbackOverIterator", over)
rawset(Isaac, "RunCallbackWithTwoParams", T.run2)
R.Implemented["Isaac.GetCallbackIterator"] = true
R.Implemented["Isaac.RunCallbackOverIterator"] = true
R.Implemented["Isaac.RunCallbackWithTwoParams"] = true

-- A mod firing a callback itself (Isaac.RunCallback(id, ...)) gets the same
-- rules as the engine does below, for the game's callbacks, the layer's and a
-- mod's own (a string id).
rawset(Isaac, "RunCallbackWithParam", run)
rawset(Isaac, "RunCallback", function(id, ...) return run(id, nil, ...) end)

------------------------------------------------------------------------------
-- between the engine and its callbacks
------------------------------------------------------------------------------
-- The engine does not look its runner up by name: LuaEngine::Init
-- (0x008604c0) takes a registry reference to main.lua's _RunCallback, keeps it
-- in a small object { lua_State*, key } it points at from +0x10 (the state
-- itself is at +0x18), and clears the global. The reference is pointed at the
-- layer's runner (the rules above, one function's error not stopping the
-- rest), as REPENTOGON replaces _RunCallback. T.engine_callback[id] = f puts
-- f(run, id, param, ...) in front of one callback of the engine's.
do
  local r32 = B.r32
  local engine = r32(0x00c71690)                       -- g_LuaEngine (asm: ModManager::Reset reads it at 0x008f8c02)
  local holder = engine ~= 0 and r32(engine + 0x10) or 0
  if B.registry and holder ~= 0 and r32(holder) ~= 0 and r32(holder) == r32(engine + 0x18) then
    local key = B.ri32(holder + 4)
    local game_run = B.registry(key)
    if type(game_run) == "function" then
      local special = {}
      B.registry(key, function(id, param, ...)
        local f = special[id]
        if f then return f(run, id, param, ...) end
        return run(id, param, ...)
      end)
      T.engine_callback = special
      T.game_run = game_run
    else
      B.log("api_callbacks: the engine's runner reference (key " .. tostring(key) .. ") holds no function")
    end
  else
    B.log("api_callbacks: the engine's runner reference was not found where expected; its callbacks are not watched")
  end
end
