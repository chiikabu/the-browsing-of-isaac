-- api_hooks.lua -- the callbacks that are a handler before or after a game
-- function (hook_slots.lua lists the functions; tools/hook_table.py checks
-- every address against the executable and writes that list).
--
-- A handler reads the hooked call's arguments off the guest stack: [esp] is
-- the return address, [esp+4] the first stack argument, `self` (ECX) the
-- object. What each callback passes and accepts follows REPENTOGON's
-- documentation of it; the code is this layer's.

local T = ...
local B, R, wrap, listening, bool_at = T.B, T.R, T.wrap, T.listening, T.bool_at
local r8, r32, ri32, rf32, w32, wf32, ptr, log = B.r8, B.r32, B.ri32, B.rf32, B.w32, B.wf32, B.ptr, B.log
local type, ipairs, pairs, rawget, rawset, tostring = type, ipairs, pairs, rawget, rawset, tostring
local mathtype = math.type
local GetCallbacks = Isaac.GetCallbacks
local M = ModCallbacks
local function run(...) return T.run(...) end

local SLOTS
do
  local chunk, why = B.load("hook_slots.lua")
  if not chunk then log("api_hooks: no hook_slots.lua (" .. tostring(why) .. "): no hooked callbacks") return end
  SLOTS = chunk()
end
if B.HOOKS < 192 then log("api_hooks: this engine has " .. B.HOOKS .. " hook slots; the callbacks here need a newer one") return end

-- Entity fields (the base class has not moved since REPENTOGON's version:
-- Variant 0x2c and SubType 0x30 are this build's own getters, Type sits before them)
local E_TYPE, E_VARIANT, E_SUBTYPE = 0x28, 0x2c, 0x30

------------------------------------------------------------------------------
-- several callbacks on one function
------------------------------------------------------------------------------
-- on("Entity_Player::TakeDamage", { ids }, before, after): handlers of one
-- function run in the order given. A `before` that answers for the function
-- (returns true, eax) ends the chain; the `after` handlers of those that ran
-- still do not run, as the function did not. What a `before` returns
-- otherwise is handed to its own `after`.
local chains = {}               -- slot -> { ids = {}, list = { {ids, before, after} }, pops }
local function on(fname, ids, before, after)
  local s = SLOTS[fname]
  if type(s) == "string" then s = SLOTS[s] end
  if not s then log("api_hooks: no hook slot for " .. fname) return end
  for _, id in ipairs(ids) do
    if type(id) ~= "number" then log("api_hooks: a callback of " .. fname .. " has no number (enums_ex.lua is older?)") return end
  end
  local slot, pops = s[1], s[2]
  local c = chains[slot]
  if not c then
    c = { ids = {}, list = {}, pops = pops }
    chains[slot] = c
  end
  for _, id in ipairs(ids) do c.ids[#c.ids + 1] = id end
  c.list[#c.list + 1] = { ids = ids, before = before, after = after }
  return pops
end
local function any_listening(ids)
  for i = 1, #ids do if listening[ids[i]] then return true end end
  return false
end
local function install()
  for slot, c in pairs(chains) do
    local list, pops = c.list, c.pops
    local before, after
    if #list == 1 then
      before, after = list[1].before, list[1].after
    else
      before = function(self, esp, edx)
        local kept
        for i = 1, #list do
          local h = list[i]
          if h.before and any_listening(h.ids) then
            local a, eax = h.before(self, esp, edx)
            if a == true then return true, eax, pops end
            if a ~= nil then kept = kept or {} kept[i] = a end
          end
        end
        return kept or false
      end
      after = function(self, esp, eax, kept)
        local out
        for i = 1, #list do
          local h = list[i]
          if h.after and any_listening(h.ids) then
            local v = h.after(self, esp, out or eax, kept and kept[i] or nil)
            if v ~= nil then out = v end
          end
        end
        return out
      end
    end
    -- a single handler says `return true, eax` too; the pop count is the function's
    local b1 = before
    if #list == 1 and before then
      b1 = function(self, esp, edx)
        local a, eax = before(self, esp, edx)
        if a == true then
          if not pops then log("api_hooks: slot " .. slot .. " cannot be answered for (its return is not known)") return nil end
          return true, eax or 0, pops
        end
        return a
      end
    end
    T.define(slot, c.ids, b1, after)
  end
end

------------------------------------------------------------------------------
-- who is listening for what
------------------------------------------------------------------------------
-- The update and render hooks run for every entity of a class every frame, so
-- before any Lua object is made the handler asks whether a function is
-- registered for this entity's variant at all. The answer is cached until a
-- callback is added or removed.
local version = 0
do
  local add, remove = Isaac.AddPriorityCallback, Isaac.RemoveCallback
  rawset(Isaac, "AddPriorityCallback", function(...) version = version + 1 return add(...) end)
  rawset(Isaac, "RemoveCallback", function(...) version = version + 1 return remove(...) end)
  local unload = rawget(_G, "_UnloadMod")
  if type(unload) == "function" then
    rawset(_G, "_UnloadMod", function(...) version = version + 1 return unload(...) end)
  end
end
local interest = {}
local function wants(id, param)
  if not listening[id] then return false end
  local c = interest[id]
  if not c or c.v ~= version then
    c = { v = version, any = false, set = {} }
    for _, cb in ipairs(GetCallbacks(id)) do
      local p = cb.Param
      if p == nil or p == -1 or p == false then c.any = true else c.set[p] = true end
    end
    interest[id] = c
  end
  return c.any or c.set[param] == true
end
T.wants = wants

local function entity(a) return wrap("Entity", a) end
local function vec_at(a) return Vector(rf32(a), rf32(a + 4)) end

------------------------------------------------------------------------------
-- MC_POST_MODS_LOADED (1210): every mod's main.lua has run
------------------------------------------------------------------------------
-- ModManager::LoadConfigs 0x008f30d0 runs them (asm: it calls the script runner
-- 0x0086e6c0 once per mod, at 0x008f4654)
on("ModManager::LoadConfigs", { M.MC_POST_MODS_LOADED }, nil, function()
  run(M.MC_POST_MODS_LOADED, nil)
end)

------------------------------------------------------------------------------
-- the entity classes: before Update, before Render, after HandleCollision
------------------------------------------------------------------------------
-- Update():  PRE_x_UPDATE(entity), param = variant -> true: the game's own update is skipped
-- Render(Vector* offset), ret 4:  PRE_x_RENDER(entity, offset) -> false: not drawn; a Vector: added to the offset
-- HandleCollision(Entity* collider, bool low), ret 8:  POST_x_COLLISION(entity, collider, low), after the game's own
local CLASSES = {
  -- zhl class,         Lua class,          update, render, collision, the param: offset of what callbacks filter on
  { "Entity_Player",     "EntityPlayer",     M.MC_PRE_PLAYER_UPDATE,     M.MC_PRE_PLAYER_RENDER,     M.MC_POST_PLAYER_COLLISION,     E_VARIANT },
  { "Entity_Tear",       "EntityTear",       M.MC_PRE_TEAR_UPDATE,       M.MC_PRE_TEAR_RENDER,       M.MC_POST_TEAR_COLLISION,       E_VARIANT },
  { "Entity_Familiar",   "EntityFamiliar",   M.MC_PRE_FAMILIAR_UPDATE,   M.MC_PRE_FAMILIAR_RENDER,   M.MC_POST_FAMILIAR_COLLISION,   E_VARIANT },
  { "Entity_Bomb",       "EntityBomb",       M.MC_PRE_BOMB_UPDATE,       M.MC_PRE_BOMB_RENDER,       M.MC_POST_BOMB_COLLISION,       E_VARIANT },
  { "Entity_Pickup",     "EntityPickup",     M.MC_PRE_PICKUP_UPDATE,     M.MC_PRE_PICKUP_RENDER,     M.MC_POST_PICKUP_COLLISION,     E_VARIANT },
  { "Entity_Knife",      "EntityKnife",      M.MC_PRE_KNIFE_UPDATE,      M.MC_PRE_KNIFE_RENDER,      M.MC_POST_KNIFE_COLLISION,      E_VARIANT, update_param = E_SUBTYPE },
  { "Entity_Projectile", "EntityProjectile", M.MC_PRE_PROJECTILE_UPDATE, M.MC_PRE_PROJECTILE_RENDER, M.MC_POST_PROJECTILE_COLLISION, E_VARIANT },
  { "Entity_Laser",      "EntityLaser",      M.MC_PRE_LASER_UPDATE,      nil,                        nil,                            E_VARIANT },
  { "Entity_Effect",     "EntityEffect",     M.MC_PRE_EFFECT_UPDATE,     M.MC_PRE_EFFECT_RENDER,     nil,                            E_VARIANT },
  { "Entity_NPC",        "EntityNPC",        nil,                        M.MC_PRE_NPC_RENDER,        M.MC_POST_NPC_COLLISION,        E_TYPE },
}
-- The game's own PRE_x_COLLISION callbacks can skip the collision; POST must
-- then not run. What the last one answered is noted at the end of this file.
local pre_collision_answered = false
local PRE_COLLISION = {}
for _, name in ipairs({ "MC_PRE_PLAYER_COLLISION", "MC_PRE_TEAR_COLLISION", "MC_PRE_FAMILIAR_COLLISION", "MC_PRE_BOMB_COLLISION",
                        "MC_PRE_PICKUP_COLLISION", "MC_PRE_KNIFE_COLLISION", "MC_PRE_PROJECTILE_COLLISION", "MC_PRE_NPC_COLLISION" }) do
  if M[name] then PRE_COLLISION[M[name]] = true end
end

for _, c in ipairs(CLASSES) do
  local zhl, cls, up, rd, col, pat = c[1], c[2], c[3], c[4], c[5], c[6]
  local upat = c.update_param or pat
  if up then
    on(zhl .. "::Update", { up }, function(self)
      if not wants(up, r32(self + upat)) then return end
      if run(up, r32(self + upat), wrap(cls, self)) == true then return true, 0 end
    end, nil)
  end
  if rd then
    on(zhl .. "::Render", { rd }, function(self, esp)
      local param = r32(self + pat)
      if not wants(rd, param) then return end
      local at = r32(esp + 4)
      local offset = vec_at(at)
      local res = run(rd, param, wrap(cls, self), offset)
      if res == false then return true, 0 end
      if type(res) == "userdata" and (res.X ~= offset.X or res.Y ~= offset.Y) then
        -- the game reads the offset through the pointer it was given; the caller's vector is put back afterwards
        local keep = { at, r32(at), r32(at + 4) }
        wf32(at, res.X) wf32(at + 4, res.Y)
        return keep
      end
    end, function(self, esp, eax, keep)
      if keep then w32(keep[1], keep[2]) w32(keep[1] + 4, keep[3]) end
    end)
  end
  if col then
    on(zhl .. "::HandleCollision", { col }, function(self, esp)
      pre_collision_answered = false
      if not wants(col, r32(self + pat)) then return end
      return { r32(esp + 4), bool_at(esp + 8) }
    end, function(self, esp, eax, a)
      if not a or pre_collision_answered then return end
      local collider = entity(a[1])
      if collider then run(col, r32(self + pat), wrap(cls, self), collider, a[2]) end
    end)
  end
end

------------------------------------------------------------------------------
-- damage
------------------------------------------------------------------------------
-- TakeDamage(float damage, u64 flags, EntityRef* source, int countdown) -> bool, ret 0x14
--   [esp+4] damage, [esp+8] flags low, [esp+12] flags high, [esp+16] source, [esp+20] countdown
-- An EntityRef handed to Lua is a copy the Lua value owns (0x28 bytes), never
-- the game's own, which lives on a stack frame that is gone after the call.
local function ref_copy(at)
  local ref = EntityRef(nil)
  if at ~= 0 then
    local to = ptr(ref)
    for i = 0, 0x24, 4 do w32(to + i, r32(at + i)) end
  end
  return ref
end
local function damage_args(esp)
  return rf32(esp + 4), r32(esp + 8) | (r32(esp + 12) << 32), ref_copy(r32(esp + 16)), ri32(esp + 20)
end
-- MC_PRE_PLAYER_TAKE_DMG (1008): (player, damage, flags, source, countdown), param = player variant
--   -> false: no damage (the function answers false)
on("Entity_Player::TakeDamage", { M.MC_PRE_PLAYER_TAKE_DMG }, function(self, esp)
  if not wants(M.MC_PRE_PLAYER_TAKE_DMG, r32(self + E_VARIANT)) then return end
  local dmg, flags, source, countdown = damage_args(esp)
  if run(M.MC_PRE_PLAYER_TAKE_DMG, r32(self + E_VARIANT), wrap("EntityPlayer", self), dmg, flags, source, countdown) == false then
    return true, 0
  end
end, nil)
-- MC_POST_ENTITY_TAKE_DMG (1006): (entity, damage, flags, source, countdown), param = entity type,
--   after damage that was taken (the function answered true).
-- A class's TakeDamage may hand over to its base class's (Entity_NPC::TakeDamage calls
-- Entity::TakeDamage, asm 0x006d60c1..), and both are hooked: the callback is fired once, by the
-- outermost of the calls in progress for that entity.
local taking = {}               -- entity address -> how many of its TakeDamage calls are in progress
for _, fname in ipairs({ "Entity::TakeDamage", "Entity_Player::TakeDamage", "Entity_NPC::TakeDamage", "Entity_Pickup::TakeDamage",
                         "Entity_Familiar::TakeDamage", "Entity_Slot::TakeDamage" }) do
  on(fname, { M.MC_POST_ENTITY_TAKE_DMG }, function(self, esp)
    if not wants(M.MC_POST_ENTITY_TAKE_DMG, r32(self + E_TYPE)) then return end
    local depth = (taking[self] or 0) + 1
    taking[self] = depth
    if depth > 1 then return { false } end
    return { true, damage_args(esp) }
  end, function(self, esp, eax, a)
    if not a then return end
    local depth = (taking[self] or 1) - 1
    taking[self] = depth > 0 and depth or nil
    if not a[1] or (eax & 0xff) == 0 then return end
    local e = entity(self)
    if e then run(M.MC_POST_ENTITY_TAKE_DMG, r32(self + E_TYPE), e, a[2], a[3], a[4], a[5]) end
  end)
end

------------------------------------------------------------------------------
-- the player
------------------------------------------------------------------------------
local function player(a) return wrap("EntityPlayer", a) end
local function player_type(a) return wrap("EntityPlayer", a):GetPlayerType() end

-- MC_PRE_ROOM_EXIT (1043) is NOT fired. The address its signature matched once
-- (0x00832850, slot 12) is not Entity_Player::TriggerRoomExit: it pops nothing
-- although the declaration takes a bool, it lies outside the player's code, and
-- its `this` begins with a state number (`mov eax, [ecx]; cmp eax, 2`), not a
-- virtual table. A handler that took ECX for a player stopped the module the
-- first time Fiend Folio listened. The slot stays in the engine's table with
-- no handler, so nothing arms it, until the real function is found.

-- MC_POST_TRIGGER_TRINKET_ADDED (1096): (player, trinket, firstTime), param = trinket
--   Entity_Player::TriggerTrinketAdded(trinket, firstTime), ret 8
on("Entity_Player::TriggerTrinketAdded", { M.MC_POST_TRIGGER_TRINKET_ADDED }, function(self, esp)
  return { r32(esp + 4), bool_at(esp + 8) }
end, function(self, esp, eax, a)
  if a then run(M.MC_POST_TRIGGER_TRINKET_ADDED, a[1], player(self), a[1], a[2], false) end
end)
-- MC_POST_TRIGGER_TRINKET_REMOVED (1097): (player, trinket), param = trinket
--   Entity_Player::TriggerTrinketRemoved(trinket), ret 4
on("Entity_Player::TriggerTrinketRemoved", { M.MC_POST_TRIGGER_TRINKET_REMOVED }, function(self, esp)
  return { r32(esp + 4) }
end, function(self, esp, eax, a)
  if a then run(M.MC_POST_TRIGGER_TRINKET_REMOVED, a[1], player(self), a[1], false) end
end)

-- MC_PLAYER_INIT_PRE_LEVEL_INIT_STATS (1127): (player), param = player type
on("Entity_Player::InitPreLevelInitStats", { M.MC_PLAYER_INIT_PRE_LEVEL_INIT_STATS }, function(self)
  local p = player(self)
  run(M.MC_PLAYER_INIT_PRE_LEVEL_INIT_STATS, p:GetPlayerType(), p)
end, nil)

-- MC_PLAYER_GET_HEART_LIMIT (1074): (player, limit, isKeeper), param = player type -> an integer: the limit
--   Entity_Player::GetHeartLimit(bool keeper) -> int, ret 4
on("Entity_Player::GetHeartLimit", { M.MC_PLAYER_GET_HEART_LIMIT }, function(self, esp)
  return { bool_at(esp + 4) }
end, function(self, esp, eax, a)
  if not a then return end
  local p = player(self)
  local limit = eax
  if limit >= 0x80000000 then limit = limit - 0x100000000 end
  local res = run(M.MC_PLAYER_GET_HEART_LIMIT, p:GetPlayerType(), p, limit, a[1])
  if mathtype(res) == "integer" and res ~= limit then return res & 0xffffffff end
end)

-- MC_PLAYER_GET_HEALTH_TYPE (1067): (player, healthType), param = player type -> a HealthType
on("Entity_Player::GetHealthType", { M.MC_PLAYER_GET_HEALTH_TYPE }, nil, function(self, esp, eax)
  local p = player(self)
  local res = run(M.MC_PLAYER_GET_HEALTH_TYPE, p:GetPlayerType(), p, eax)
  if mathtype(res) == "integer" and res >= 0 and res ~= eax then return res end
end)

-- MC_PRE_PLAYER_ADD_HEARTS (1009) / MC_POST_PLAYER_ADD_HEARTS (1010)
--   (player, amount, AddHealthType, optionalArg), param = AddHealthType
--   before -> an integer: that amount instead
local ADD = {
  --  function,                         AddHealthType, the optional bool's stack offset
  { "Entity_Player::AddHearts",        "RED",     8 },
  { "Entity_Player::AddMaxHearts",     "MAX",     8 },
  { "Entity_Player::AddSoulHearts",    "SOUL",    8 },
  { "Entity_Player::AddBlackHearts",   "BLACK"      },
  { "Entity_Player::AddEternalHearts", "ETERNAL"    },
  { "Entity_Player::AddGoldenHearts",  "GOLDEN"     },
  { "Entity_Player::AddBoneHearts",    "BONE"       },
  { "Entity_Player::AddRottenHearts",  "ROTTEN",  8 },
  { "Entity_Player::AddBrokenHearts",  "BROKEN"     },
}
local AHT = rawget(_G, "AddHealthType")
if type(AHT) == "table" and M.MC_PRE_PLAYER_ADD_HEARTS and M.MC_POST_PLAYER_ADD_HEARTS then
  for _, a in ipairs(ADD) do
    local kind = AHT[a[2]]
    if kind then
      on(a[1], { M.MC_PRE_PLAYER_ADD_HEARTS, M.MC_POST_PLAYER_ADD_HEARTS }, function(self, esp)
        local amount = ri32(esp + 4)
        local flag = a[3] and bool_at(esp + a[3]) or nil
        local p = player(self)
        if listening[M.MC_PRE_PLAYER_ADD_HEARTS] then
          local res = run(M.MC_PRE_PLAYER_ADD_HEARTS, kind, p, amount, kind, flag)
          if mathtype(res) == "integer" then
            amount = res
            w32(esp + 4, amount & 0xffffffff)
          end
        end
        return { p, amount, flag }
      end, function(self, esp, eax, k)
        if k and listening[M.MC_POST_PLAYER_ADD_HEARTS] then run(M.MC_POST_PLAYER_ADD_HEARTS, kind, k[1], k[2], kind, k[3]) end
      end)
    end
  end
end

-- MC_PRE_USE_CARD (1064): (card, player, useFlags) -> true: not used.  Entity_Player::UseCard(card, flags), ret 8
on("Entity_Player::UseCard", { M.MC_PRE_USE_CARD }, function(self, esp)
  if run(M.MC_PRE_USE_CARD, r32(esp + 4), ri32(esp + 4), player(self), r32(esp + 8)) == true then return true, 0 end
end, nil)

-- MC_POST_PLAYER_REVIVE (1482): (player), param = player type
on("Entity_Player::Revive", { M.MC_POST_PLAYER_REVIVE }, nil, function(self)
  local p = player(self)
  run(M.MC_POST_PLAYER_REVIVE, p:GetPlayerType(), p)
end)

-- MC_PRE_RENDER_PLAYER_HEAD (1038) / BODY (1039): (player, renderPos), param = player type
--   -> false: not drawn; a Vector: drawn there.  RenderHead/RenderBody(Vector* pos), ret 4
-- MC_POST_RENDER_PLAYER_HEAD (1045) / BODY (1046): (player, renderPos)
local function head_body(fname, pre, post)
  if not pre then return end
  on(fname, { pre, post }, function(self, esp)
    local at = r32(esp + 4)
    local pos = vec_at(at)
    local p = player(self)
    local keep
    if listening[pre] then
      local res = run(pre, p:GetPlayerType(), p, pos)
      if res == false then return true, 0 end
      if type(res) == "userdata" then
        keep = { at, r32(at), r32(at + 4) }
        wf32(at, res.X) wf32(at + 4, res.Y)
        pos = res
      end
    end
    return { p, pos, keep }
  end, function(self, esp, eax, k)
    if not k then return end
    if k[3] then w32(k[3][1], k[3][2]) w32(k[3][1] + 4, k[3][3]) end
    if post and listening[post] then run(post, k[1]:GetPlayerType(), k[1], k[2]) end
  end)
end
head_body("Entity_Player::RenderHead", M.MC_PRE_RENDER_PLAYER_HEAD, M.MC_POST_RENDER_PLAYER_HEAD)
head_body("Entity_Player::RenderBody", M.MC_PRE_RENDER_PLAYER_BODY, M.MC_POST_RENDER_PLAYER_BODY)

-- MC_POST_FIRE_BOMB (1253), _BRIMSTONE (1255), _TECH_LASER (1259), _TECH_X_LASER (1260),
-- _BRIMSTONE_BALL (1256): (what was fired), after the player's Fire function returned it
local function fired(fname, id, cls)
  if not id then return end
  on(fname, { id }, nil, function(self, esp, eax)
    local e = wrap(cls, eax)
    if e then run(id, nil, e) end
  end)
end
fired("Entity_Player::FireBomb", M.MC_POST_FIRE_BOMB, "EntityBomb")
fired("Entity_Player::FireBrimstone", M.MC_POST_FIRE_BRIMSTONE, "EntityLaser")
fired("Entity_Player::FireTechLaser", M.MC_POST_FIRE_TECH_LASER, "EntityLaser")
fired("Entity_Player::FireTechXLaser", M.MC_POST_FIRE_TECH_X_LASER, "EntityLaser")
fired("Entity_Player::FireBrimstoneBall", M.MC_POST_FIRE_BRIMSTONE_BALL, "EntityEffect")

------------------------------------------------------------------------------
-- familiars, slots, pickups
------------------------------------------------------------------------------
-- MC_GET_FOLLOWER_PRIORITY (1063): (familiar), param = variant -> an integer: the priority
on("Entity_Familiar::GetFollowerPriority", { M.MC_GET_FOLLOWER_PRIORITY }, function(self)
  local v = r32(self + E_VARIANT)
  if not wants(M.MC_GET_FOLLOWER_PRIORITY, v) then return end
  local res = run(M.MC_GET_FOLLOWER_PRIORITY, v, wrap("EntityFamiliar", self))
  if mathtype(res) == "integer" then return true, res & 0xffffffff end
end, nil)

-- the slot machine callbacks need the EntitySlot class (api_objects.lua)
local slot_obj = T.slot_obj
if slot_obj then
  -- MC_POST_SLOT_INIT (1121): (slot), param = variant.  Init(type, variant, subtype, seed), ret 0x10
  on("Entity_Slot::Init", { M.MC_POST_SLOT_INIT }, nil, function(self)
    local v = r32(self + E_VARIANT)
    if wants(M.MC_POST_SLOT_INIT, v) then run(M.MC_POST_SLOT_INIT, v, slot_obj(self)) end
  end)
  -- MC_PRE_SLOT_UPDATE (1169): (slot) -> true: the game's update is skipped; MC_POST_SLOT_UPDATE (1122): (slot)
  on("Entity_Slot::Update", { M.MC_PRE_SLOT_UPDATE, M.MC_POST_SLOT_UPDATE }, function(self)
    local v = r32(self + E_VARIANT)
    if wants(M.MC_PRE_SLOT_UPDATE, v) and run(M.MC_PRE_SLOT_UPDATE, v, slot_obj(self)) == true then return true, 0 end
  end, function(self)
    local v = r32(self + E_VARIANT)
    if wants(M.MC_POST_SLOT_UPDATE, v) then run(M.MC_POST_SLOT_UPDATE, v, slot_obj(self)) end
  end)
  -- MC_PRE_SLOT_RENDER (1089) / MC_POST_SLOT_RENDER (1090): (slot, offset)
  on("Entity_Slot::Render", { M.MC_PRE_SLOT_RENDER, M.MC_POST_SLOT_RENDER }, function(self, esp)
    local v = r32(self + E_VARIANT)
    local offset = vec_at(r32(esp + 4))
    if wants(M.MC_PRE_SLOT_RENDER, v) then
      local res = run(M.MC_PRE_SLOT_RENDER, v, slot_obj(self), offset)
      if res == false then return true, 0 end
    end
    return { offset }
  end, function(self, esp, eax, k)
    local v = r32(self + E_VARIANT)
    if k and wants(M.MC_POST_SLOT_RENDER, v) then run(M.MC_POST_SLOT_RENDER, v, slot_obj(self), k[1]) end
  end)
  -- MC_PRE_SLOT_COLLISION (1240): (slot, collider, low) -> true: no collision; false: collide, the slot's own
  --   reaction is skipped (the function is answered for either way: true ignores, false collides)
  -- MC_POST_SLOT_COLLISION (1241): (slot, collider, low)
  on("Entity_Slot::HandleCollision", { M.MC_PRE_SLOT_COLLISION, M.MC_POST_SLOT_COLLISION }, function(self, esp)
    local v = r32(self + E_VARIANT)
    local collider, low = entity(r32(esp + 4)), bool_at(esp + 8)
    if not collider then return end
    if wants(M.MC_PRE_SLOT_COLLISION, v) then
      local res = run(M.MC_PRE_SLOT_COLLISION, v, slot_obj(self), collider, low)
      if res == true then return true, 1 end
      if res == false then return true, 0 end
    end
    return { collider, low }
  end, function(self, esp, eax, k)
    local v = r32(self + E_VARIANT)
    if k and wants(M.MC_POST_SLOT_COLLISION, v) then run(M.MC_POST_SLOT_COLLISION, v, slot_obj(self), k[1], k[2]) end
  end)
end

------------------------------------------------------------------------------
-- level, room, game
------------------------------------------------------------------------------
-- MC_PRE_CHANGE_ROOM (1061): (targetRoomIdx, dimension) -> a table {roomIdx, dimension}: there instead
--   Level::ChangeRoom(roomIdx, dimension), ret 8
on("Level::ChangeRoom", { M.MC_PRE_CHANGE_ROOM }, function(self, esp)
  local res = run(M.MC_PRE_CHANGE_ROOM, nil, ri32(esp + 4), ri32(esp + 8))
  if type(res) == "table" then
    if mathtype(res[1]) == "integer" then w32(esp + 4, res[1] & 0xffffffff) end
    if mathtype(res[2]) == "integer" then w32(esp + 8, res[2] & 0xffffffff) end
  end
end, nil)

-- MC_POST_ROOM_TRIGGER_CLEAR (1143): (playSound).  Room::TriggerClear(bool), ret 4
on("Room::TriggerClear", { M.MC_POST_ROOM_TRIGGER_CLEAR }, function(self, esp)
  return { bool_at(esp + 4) }
end, function(self, esp, eax, k)
  if k then run(M.MC_POST_ROOM_TRIGGER_CLEAR, nil, k[1]) end
end)

-- MC_PRE_UPDATE (1026): () -> true: the game does not update this frame.  Game::Update()
on("Game::Update", { M.MC_PRE_UPDATE }, function()
  if run(M.MC_PRE_UPDATE, nil) == true then return true, 0 end
end, nil)

-- MC_POST_BOSS_INTRO_SHOW (1270): (bossId1, bossId2).  RoomTransition::StartBossIntro(boss1, boss2), ret 8
on("RoomTransition::StartBossIntro", { M.MC_POST_BOSS_INTRO_SHOW }, function(self, esp)
  return { ri32(esp + 4), ri32(esp + 8) }
end, function(self, esp, eax, k)
  if k then run(M.MC_POST_BOSS_INTRO_SHOW, nil, k[1], k[2]) end
end)

-- MC_POST_SAVESLOT_LOAD (1470): (saveSlot, isSlotSelected, rawSlot)
--   Manager::SetSaveSlot(slot), ret 4 -- the game selects a save slot (1..3; 0 stands for the first)
on("Manager::SetSaveSlot", { M.MC_POST_SAVESLOT_LOAD }, function(self, esp)
  return { r32(esp + 4) }
end, function(self, esp, eax, k)
  if not k then return end
  local raw = k[1]
  T.save_slot = raw == 0 and 1 or raw
  run(M.MC_POST_SAVESLOT_LOAD, nil, T.save_slot, true, raw)
end)

-- MC_POST_NPC_MORPH (1214): (npc, the type, variant and subtype it had before)
--   Entity_NPC::Morph(type, variant, subtype, championColor), ret 0x10
on("Entity_NPC::Morph", { M.MC_POST_NPC_MORPH }, function(self)
  return { r32(self + E_TYPE), r32(self + E_VARIANT), r32(self + E_SUBTYPE) }
end, function(self, esp, eax, k)
  if k then run(M.MC_POST_NPC_MORPH, nil, wrap("EntityNPC", self), k[1], k[2], k[3]) end
end)

-- MC_POST_GRID_ENTITY_SPAWN (1101): (grid entity), param = its type.  GridEntity::Init(seed), ret 4
on("GridEntity::Init", { M.MC_POST_GRID_ENTITY_SPAWN }, nil, function(self)
  local g = wrap("GridEntity", self)
  if g then run(M.MC_POST_GRID_ENTITY_SPAWN, g:GetType(), g) end
end)

------------------------------------------------------------------------------
-- status effects
------------------------------------------------------------------------------
-- MC_PRE_STATUS_EFFECT_APPLY (1465): (status, entity, source, duration), param = status -> false: not applied
-- MC_POST_STATUS_EFFECT_APPLY (1466): the same, after it was applied
-- Every Entity::Add<Status> takes (const EntityRef& source, int duration, ...): [esp+4] the source, [esp+8]
-- the duration; AddKnockback has the push direction second and the duration third.
local SE = rawget(_G, "StatusEffect")
if type(SE) == "table" and M.MC_PRE_STATUS_EFFECT_APPLY and M.MC_POST_STATUS_EFFECT_APPLY then
  local PRE, POST = M.MC_PRE_STATUS_EFFECT_APPLY, M.MC_POST_STATUS_EFFECT_APPLY
  local function status(fname, id, duration_at)
    if id == nil then return end
    on(fname, { PRE, POST }, function(self, esp)
      if not (wants(PRE, id) or wants(POST, id)) then return end
      local e = entity(self)
      local source, duration = ref_copy(r32(esp + 4)), ri32(esp + duration_at)
      if wants(PRE, id) and run(PRE, id, id, e, source, duration) == false then return true, 0 end
      return { e, source, duration }
    end, function(self, esp, eax, k)
      if k and wants(POST, id) then run(POST, id, id, k[1], k[2], k[3]) end
    end)
  end
  status("Entity::AddPoison", SE.POISON, 8)
  status("Entity::AddFreeze", SE.FREEZE, 8)
  status("Entity::AddBurn", SE.BURN, 8)
  status("Entity::AddCharmed", SE.CHARMED, 8)
  status("Entity::AddConfusion", SE.CONFUSION, 8)
  status("Entity::AddFear", SE.FEAR, 8)
  status("Entity::AddMidasFreeze", SE.MIDAS_FREEZE, 8)
  status("Entity::AddShrink", SE.SHRINK, 8)
  status("Entity::AddSlowing", SE.SLOWING, 8)
  status("Entity::AddKnockback", SE.KNOCKBACK, 12)
end

-- MC_EVALUATE_TEAR_HIT_PARAMS (1490): (player, tearParams, weaponType, damageScale, tearDisplacement, source),
--   param = player type. The TearParams is the one the game is about to use; a function changes it in place.
--   TearParams Entity_Player::GetTearHitParams(weaponType, damageScale, tearDisplacement, source): the result
--   comes back through a hidden first argument, and EAX points at it.
on("Entity_Player::GetTearHitParams", { M.MC_EVALUATE_TEAR_HIT_PARAMS }, function(self, esp)
  return { ri32(esp + 8), rf32(esp + 12), ri32(esp + 16), r32(esp + 20) }
end, function(self, esp, eax, k)
  if not k or eax == 0 then return end
  local p = player(self)
  run(M.MC_EVALUATE_TEAR_HIT_PARAMS, p:GetPlayerType(), p, wrap("TearParams", eax), k[1], k[2], k[3], entity(k[4]))
end)

-- MC_POST_ACHIEVEMENT_UNLOCK (1476): (achievement), param = achievement -- one of the game's own, when
--   PersistentGameData::TryUnlock(id) answers that it was locked until now. A mod's achievements are the
--   layer's own (api_data.lua), which fires the callback itself.
on("PersistentGameData::TryUnlock", { M.MC_POST_ACHIEVEMENT_UNLOCK }, function(self, esp)
  return { ri32(esp + 4) }
end, function(self, esp, eax, k)
  if k and (eax & 0xff) ~= 0 then run(M.MC_POST_ACHIEVEMENT_UNLOCK, k[1], k[1]) end
end)

install()
T.rearm()

------------------------------------------------------------------------------
-- what the game's own PRE_x_COLLISION callbacks answered
------------------------------------------------------------------------------
-- An answer from one of them (true or false) means the game skips its
-- collision code, and the POST handlers above must then stay quiet. The
-- engine's runner is watched for those eight callbacks (api_callbacks.lua).
if T.engine_callback then
  local function note(game_run, id, ...)
    local res = game_run(id, ...)
    if res ~= nil then pre_collision_answered = true end
    return res
  end
  for id in pairs(PRE_COLLISION) do T.engine_callback[id] = note end
else
  log("api_hooks: the engine's callback runner is out of reach; POST_x_COLLISION also runs after a skipped collision")
end
