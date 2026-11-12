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

-- MC_PRE_ROOM_EXIT (1043): the address its signature matched once (0x00832850,
-- slot 12) is not Entity_Player::TriggerRoomExit: it pops nothing although the
-- declaration takes a bool, it lies outside the player's code, and its `this`
-- begins with a state number (`mov eax, [ecx]; cmp eax, 2`), not a virtual
-- table. A handler that took ECX for a player stopped the module the first time
-- Fiend Folio listened. Slot 12 is retired; the real function is slot 81 (below,
-- "round h2").

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

------------------------------------------------------------------------------
-- round h2: more of what Fiend Folio listens on
------------------------------------------------------------------------------
-- Every `this` or argument these hooks take for a game object is checked first:
-- an entity by its class's virtual table (this build's, through RTTI:
-- tools/vtables.py, the "vt" rows of tools/hook_table.py), anything else by a
-- field that points back. A wrong one is said once per function, in the game's
-- log, and the call goes on as if nobody listened.
local r16, call, alloc, free = B.r16, B.call, B.alloc, B.free
local VTABLE = {
  Entity = 0x00b6730c, EntityPlayer = 0x00b6bdd0, EntityNPC = 0x00b67468, EntityPickup = 0x00b67f24,
  EntityTear = 0x00b64eac, EntityFamiliar = 0x00b6491c, EntityEffect = 0x00b63bdc, EntityBomb = 0x00b670f4,
  EntityLaser = 0x00b7cd40, EntityKnife = 0x00b7cb4c, EntityProjectile = 0x00b64990, Slot = 0x00b64c50,
}
local ANY_ENTITY = {}
for _, v in pairs(VTABLE) do ANY_ENTITY[v] = true end
T.VTABLE = VTABLE
local told = {}
local function wrong(what, a)
  if told[what] then return end
  told[what] = true
  log(string.format("api_hooks: %s was handed 0x%08x, which is not what it should be; the call goes on unwatched", what, a))
end
local function vt_of(a)
  if mathtype(a) ~= "integer" or a < 0x1000 then return nil end
  local ok, v = pcall(r32, a)
  return ok and v or nil
end
-- a Lua object of class `cls` for the entity at `a` (nil for 0), or false when it is not one
local function as(cls, a, what)
  if a == 0 then return nil end
  if vt_of(a) == VTABLE[cls] then return wrap(cls, a) end
  wrong(what, a)
  return false
end
local function any_entity(a, what)
  if a == 0 then return nil end
  if ANY_ENTITY[vt_of(a)] then return entity(a) end
  wrong(what, a)
  return false
end
local function signed(v) return v >= 0x80000000 and v - 0x100000000 or v end

-- An ItemConfig item handed over by address: the game's own object for it, found
-- by its ID (+4, the Lua registration's data member) among the collectibles, the
-- trinkets and the null items, and taken only when it is that very address.
local CONFIG = Isaac.GetItemConfig()
local GETTERS = { "GetCollectible", "GetTrinket", "GetNullItem" }
local function item_at(a, what)
  if a == 0 then return nil end
  local ok, id = pcall(ri32, a + 4)
  if ok then
    for _, g in ipairs(GETTERS) do
      local ok2, it = pcall(function() return CONFIG[g](CONFIG, id) end)
      if ok2 and it ~= nil and ptr(it) == a then return it end
    end
  end
  wrong(what, a)
  return false
end

-- REPENTOGON matches an ItemConfig item given as a callback's parameter by the
-- object it stands for (main_ex.lua turns both into GetPtrHash), so a mod's
-- `AddCallback(MC_POST_PLAYER_ADD_EFFECT, f, itemConfig:GetCollectible(x))`
-- runs for that item. The same here, by address. The first answer ends the run.
local call_one = T.rules and T.rules.call or function(id, cb, ...)
  local ok, ret = pcall(cb.Function, cb.Mod, ...)
  if ok then return ret end
end
local function run_item(id, item, ...)
  if not listening[id] then return nil end
  local want = item and ptr(item)
  for _, cb in ipairs(GetCallbacks(id)) do
    local p = cb.Param
    local hit = p == nil or p == -1 or p == false
    if not hit and type(p) == "userdata" and want then
      local ok, pp = pcall(ptr, p)
      hit = ok and pp == want
    end
    if hit then
      local ret = call_one(id, cb, ...)
      if ret ~= nil then return ret end
    end
  end
  return nil
end
local function ids(...)                         -- the callbacks' numbers, those enums_ex.lua has
  local out = {}
  for _, id in ipairs({ ... }) do if id then out[#out + 1] = id end end
  return out
end
local function bitset_at(a) return BitSet128(r32(a) | (r32(a + 4) << 32), r32(a + 8) | (r32(a + 12) << 32)) end
local function put_bitset(a, bs)
  local l, h = bs.l, bs.h
  w32(a, l & 0xffffffff) w32(a + 4, (l >> 32) & 0xffffffff) w32(a + 8, h & 0xffffffff) w32(a + 12, (h >> 32) & 0xffffffff)
end
local function is_vector(v) return type(v) == "userdata" and pcall(function() return v.X + v.Y end) end
local function is_bitset(v) return type(v) == "userdata" and pcall(function() return v.l | v.h end) end

-- MC_POST_TRIGGER_COLLECTIBLE_REMOVED (1095): (player, item, removeFromPlayerForm, wispOrInnate), param = item
--   Entity_Player::TriggerCollectibleRemoved(item) 0x0078ff90, ret 4 (slot 80), after it.
--   Who called tells the two flags, as REPENTOGON's two patches do: from RemoveCollectible (return address
--   0x0078fc45) removeFromPlayerForm is RemoveCollectible's fourth argument, kept while it runs (slot 60,
--   ret 0x10); from RecomputeWispCollectibles (0x007d7b5f) it is a wisp's item; from anywhere else neither.
do
  local FROM_REMOVE, FROM_WISPS = 0x0078fc45, 0x007d7b5f
  local removing = {}
  local id = M.MC_POST_TRIGGER_COLLECTIBLE_REMOVED
  if id then
    on("Entity_Player::RemoveCollectible", { id }, function(self, esp)
      removing[#removing + 1] = bool_at(esp + 16)
      return { #removing }
    end, function(self, esp, eax, k)
      if k then for i = #removing, k[1], -1 do removing[i] = nil end end
    end)
    on("Entity_Player::TriggerCollectibleRemoved", { id }, function(self, esp)
      local p = as("EntityPlayer", self, "Entity_Player::TriggerCollectibleRemoved")
      if not p then return end
      local back, form, wisp = r32(esp), false, false
      if back == FROM_REMOVE then form = removing[#removing] or false elseif back == FROM_WISPS then wisp = true end
      return { p, ri32(esp + 4), form, wisp }
    end, function(self, esp, eax, k)
      if k then run(id, k[2], k[1], k[2], k[3], k[4]) end
    end)
  end
end

-- MC_PRE_ROOM_EXIT (1043): (player, newLevel), before Entity_Player::TriggerRoomExit(bool) 0x007a6680, ret 4
--   (slot 81). Game::ChangeRoom calls it for each player with 0; 0x009bd150 with 1.
if M.MC_PRE_ROOM_EXIT then
  on("Entity_Player::TriggerRoomExit", { M.MC_PRE_ROOM_EXIT }, function(self, esp)
    local p = as("EntityPlayer", self, "Entity_Player::TriggerRoomExit")
    if p then run(M.MC_PRE_ROOM_EXIT, nil, p, bool_at(esp + 4)) end
  end, nil)
end

-- MC_PLAYER_INIT_POST_LEVEL_INIT_STATS (1042): (player), param = player type, after
--   Entity_Player::InitPostLevelInitStats() 0x007bc740 (slot 82): the character's starting cards, pills,
--   trinkets and pocket item have been given.
if M.MC_PLAYER_INIT_POST_LEVEL_INIT_STATS then
  on("Entity_Player::InitPostLevelInitStats", { M.MC_PLAYER_INIT_POST_LEVEL_INIT_STATS }, nil, function(self)
    local p = as("EntityPlayer", self, "Entity_Player::InitPostLevelInitStats")
    if p then run(M.MC_PLAYER_INIT_POST_LEVEL_INIT_STATS, p:GetPlayerType(), p) end
  end)
end

-- MC_PRE_PLAYERHUD_RENDER_ACTIVE_ITEM (1119) / MC_POST_ (1079):
--   (player, slot, offset, alpha, scale, chargeBarOffset), param = the item in that slot
--   PlayerHUD::RenderActiveItem(slot, const Vector& pos, layout, float size, float alpha, bool) 0x008453c0,
--   ret 0x18 (slot 83). `this` is one of the HUD's eight 0x6dc-byte player slots (api_more.lua): it must
--   lie on that grid and hold the HUD (+4), its own index (+8) and a player (+0).
--   PRE -> true: not drawn. A table (HideItem, HideOutline, HideChargeBar, CropOffset) changes the drawing
--   inside the function in REPENTOGON; here it is accepted and does nothing (said once).
--   The offsets are REPENTOGON's: the schoolbag slot (1) is drawn at half size; the charge bar is 34 to the
--   right (-2 for the schoolbag, 38 for the first player's Esau) and 17 down, times the size. REPENTOGON
--   also moves both by a few pixels when a book is drawn under the item; that is not done here.
do
  local PRE, POST = M.MC_PRE_PLAYERHUD_RENDER_ACTIVE_ITEM, M.MC_POST_PLAYERHUD_RENDER_ACTIVE_ITEM
  local SLOT_SIZE, said_table = 0x6dc, false
  if PRE and POST then
    on("PlayerHUD::RenderActiveItem", { PRE, POST }, function(self, esp)
      local hud = ptr(Game():GetHUD())
      local off = self - hud
      local index = off // SLOT_SIZE
      if hud == 0 or off < 0 or off % SLOT_SIZE ~= 0 or index > 7 or r32(self + 4) ~= hud or r16(self + 8) ~= index then
        wrong("PlayerHUD::RenderActiveItem", self)
        return
      end
      local p = as("EntityPlayer", r32(self), "PlayerHUD::RenderActiveItem (its player)")
      if not p then return end
      local okg, ghost = pcall(p.IsCoopGhost, p)
      if okg and ghost then return end
      local slot, layout, size, alpha = ri32(esp + 4), ri32(esp + 12), rf32(esp + 16), rf32(esp + 20)
      local pos = vec_at(r32(esp + 8))
      local scale = slot == 1 and size * 0.5 or size
      local bar = Vector(pos.X, pos.Y + 17 * scale)
      if not (index == 4 and layout == 1) then
        bar.X = bar.X + (slot == 1 and -2 or 34) * scale
      elseif slot == 1 then
        bar.X = bar.X + 38 * scale
      end
      local item = (slot >= 0 and slot <= 3) and p:GetActiveItem(slot) or 0
      if listening[PRE] then
        local res = run(PRE, item, p, slot, Vector(pos.X, pos.Y), alpha, scale, Vector(bar.X, bar.Y))
        if res == true then return true, 0 end
        if type(res) == "table" and not said_table then
          said_table = true
          log("accepted, not supported in the browser: a table returned from MC_PRE_PLAYERHUD_RENDER_ACTIVE_ITEM (the item is drawn as usual)")
        end
      end
      return { item, p, slot, pos, alpha, scale, bar }
    end, function(self, esp, eax, k)
      if k and listening[POST] then run(POST, k[1], k[2], k[3], k[4], k[5], k[6], k[7]) end
    end)
  end
end

-- MC_PRE_RENDER (1135): (), before Manager::Render() 0x009555c0 (slot 84), once per frame drawn
if M.MC_PRE_RENDER then
  on("Manager::Render", { M.MC_PRE_RENDER }, function() run(M.MC_PRE_RENDER, nil) end, nil)
end

-- MC_POST_PLAYER_ADD_EFFECT (1273): (player, item, addCostume, count), param = item
-- MC_POST_ROOM_ADD_EFFECT (1274): (item), param = item
--   after TemporaryEffects::AddEffect(TemporaryEffect* effect, bool addCostume, int count) 0x00930220,
--   ret 0xc (slot 85), when it did something: not disabled (+0x11), a count, an item (effect+0).
--   Whose effects: a player's are at player+0x1508 (GetEffects, reg 0x004361c0: `lea eax, [ecx+0x1508]`)
--   and point back at it (+0x14); the room's are at room+0x7310 (Room::Init clears them there).
do
  local PL, RM = M.MC_POST_PLAYER_ADD_EFFECT, M.MC_POST_ROOM_ADD_EFFECT
  local list = ids(PL, RM)
  if #list > 0 then
    on("TemporaryEffects::AddEffect", list, function(self, esp)
      if r8(self + 0x11) ~= 0 then return end
      local count = ri32(esp + 12)
      local effect = r32(esp + 4)
      if count == 0 or effect == 0 or r32(effect) == 0 then return end
      local owner = r32(self + 0x14)
      if owner ~= 0 then
        if not (PL and listening[PL]) then return end
        if owner + 0x1508 ~= self then wrong("TemporaryEffects::AddEffect (its player)", self) return end
        local p = as("EntityPlayer", owner, "TemporaryEffects::AddEffect (its player)")
        local it = p and item_at(r32(effect), "TemporaryEffects::AddEffect (the item)")
        if not it then return end
        return { p, it, bool_at(esp + 8), count }
      end
      if RM and listening[RM] and self == ptr(Game():GetRoom()) + 0x7310 then
        local it = item_at(r32(effect), "TemporaryEffects::AddEffect (the item)")
        if it then return { false, it } end
      end
    end, function(self, esp, eax, k)
      if not k then return end
      if k[1] then run_item(PL, k[2], k[1], k[2], k[3], k[4]) else run_item(RM, k[2], k[2]) end
    end)
  end
end

-- MC_POST_PLAYER_TRIGGER_EFFECT_REMOVED (1268): (player, item, count), param = item
--   after Entity_Player::TriggerEffectRemoved(item, count) 0x00793970, ret 8 (slot 86): the player's
--   effects lost `count` of that item's (TemporaryEffects' removal 0x009303f0 calls it on its _player).
if M.MC_POST_PLAYER_TRIGGER_EFFECT_REMOVED then
  local id = M.MC_POST_PLAYER_TRIGGER_EFFECT_REMOVED
  on("Entity_Player::TriggerEffectRemoved", { id }, function(self, esp)
    local p = as("EntityPlayer", self, "Entity_Player::TriggerEffectRemoved")
    local it = p and item_at(r32(esp + 4), "Entity_Player::TriggerEffectRemoved (the item)")
    if it then return { p, it, ri32(esp + 8) } end
  end, function(self, esp, eax, k)
    if k then run_item(id, k[2], k[1], k[2], k[3]) end
  end)
end

-- MC_PLAYER_GET_ACTIVE_MAX_CHARGE (1072): (item, player, varData, currentMax), param = item -> an integer
--   Entity_Player::GetActiveMaxCharge(item, varData, a word nobody reads) 0x007911f0, ret 0xc (slot 87)
-- MC_PLAYER_GET_ACTIVE_MIN_USABLE_CHARGE (1073): (slot, player, currentMin), param = the slot's item
--   Entity_Player::GetActiveMinUsableCharge(slot) 0x00791380, ret 4 (slot 88)
-- Both answer a value the game has just worked out; an integer from the callbacks replaces it (not below 0).
if M.MC_PLAYER_GET_ACTIVE_MAX_CHARGE then
  local id = M.MC_PLAYER_GET_ACTIVE_MAX_CHARGE
  on("Entity_Player::GetActiveMaxCharge", { id }, function(self, esp)
    local item = ri32(esp + 4)
    if item == 0 then return end
    local p = as("EntityPlayer", self, "Entity_Player::GetActiveMaxCharge")
    if p then return { p, item, ri32(esp + 8) } end
  end, function(self, esp, eax, k)
    if not k then return end
    local cur = signed(eax)
    local res = run(id, k[2], k[2], k[1], k[3], cur)
    if mathtype(res) == "integer" and res ~= cur then return math.max(res, 0) end
  end)
end
if M.MC_PLAYER_GET_ACTIVE_MIN_USABLE_CHARGE then
  local id = M.MC_PLAYER_GET_ACTIVE_MIN_USABLE_CHARGE
  on("Entity_Player::GetActiveMinUsableCharge", { id }, function(self, esp)
    local slot = ri32(esp + 4)
    if slot < 0 or slot > 3 then return end
    local p = as("EntityPlayer", self, "Entity_Player::GetActiveMinUsableCharge")
    if p then return { p, slot } end
  end, function(self, esp, eax, k)
    if not k then return end
    local item = k[1]:GetActiveItem(k[2])
    if item == 0 then return end
    local cur = signed(eax)
    local res = run(id, item, k[2], k[1], cur)
    if mathtype(res) == "integer" and res ~= cur then return math.max(res, 0) end
  end)
end

-- MC_PRE_NEW_ROOM (1200): (room, descriptor), before Room::Init(int, RoomDescriptor*) 0x007f2800, ret 8
--   (slot 89). `this` must be the game's room; the descriptor must be the level's own for that room
--   (GetRoomByIdx of its grid index answers the same address) or it is not handed over.
if M.MC_PRE_NEW_ROOM then
  on("Room::Init", { M.MC_PRE_NEW_ROOM }, function(self, esp)
    local room = Game():GetRoom()
    if ptr(room) ~= self then wrong("Room::Init", self) return end
    local a = r32(esp + 8)
    local desc
    if a ~= 0 then
      local d = wrap("RoomDescriptor", a)
      local ok, same = pcall(function() return ptr(Game():GetLevel():GetRoomByIdx(d.SafeGridIndex, -1)) == a end)
      if ok and same then desc = d else wrong("Room::Init (the descriptor)", a) end
    end
    run(M.MC_PRE_NEW_ROOM, nil, room, desc)
  end, nil)
end

-- MC_PRE_LEVEL_INIT (1060): (), before Level::Init(bool) 0x00744940, ret 4 (slot 90); `this` is the level
if M.MC_PRE_LEVEL_INIT then
  on("Level::Init", { M.MC_PRE_LEVEL_INIT }, function(self)
    if ptr(Game():GetLevel()) ~= self then wrong("Level::Init", self) return end
    run(M.MC_PRE_LEVEL_INIT, nil)
  end, nil)
end

-- MC_PRE_APPLY_TEARFLAG_EFFECTS (1277) / MC_POST_ (1278): (npc, position, tearFlags, source, damage),
--   param = the source's type. Entity_Tear::ApplyTearFlagEffects 0x0067af60 (slot 91) is static with the
--   entity in ECX, &position in EDX, then the flags (16 bytes), the source and the damage on the stack;
--   its caller cleans up. As in REPENTOGON: nothing for an entity that is not an NPC, nor when the game's
--   own first test says the NPC ignores this source (IgnoreEffectFromFriendly 0x006acd10, ret 4, which
--   the function calls at 0x0067afbb). PRE -> false: no effect; a table: Position, TearFlags, Damage.
--   A new position is written where EDX points and put back afterwards.
do
  local PRE, POST = M.MC_PRE_APPLY_TEARFLAG_EFFECTS, M.MC_POST_APPLY_TEARFLAG_EFFECTS
  local IGNORES = 0x006acd10
  local list = ids(PRE, POST)
  if #list > 0 then
    on("Entity_Tear::ApplyTearFlagEffects", list, function(self, esp, edx)
      if vt_of(self) ~= VTABLE.EntityNPC or edx == 0 then return end
      local src = r32(esp + 20)
      local source = any_entity(src, "Entity_Tear::ApplyTearFlagEffects (the source)")
      if source == false then return end
      local ref = source and EntityRef(source)
      if ref and (call(IGNORES, self, ptr(ref)) & 0xff) ~= 0 then return end
      local npc = wrap("EntityNPC", self)
      local param = source and r32(src + E_TYPE) or nil
      local pos, flags, damage = vec_at(edx), bitset_at(esp + 4), rf32(esp + 24)
      local keep
      if PRE and listening[PRE] then
        local res = run(PRE, param, npc, pos, flags, source, damage)
        if res == false then return true, 0 end
        if type(res) == "table" then
          if type(res.Damage) == "number" then damage = math.max(res.Damage, 0.0) wf32(esp + 24, damage) end
          if is_bitset(res.TearFlags) then flags = res.TearFlags put_bitset(esp + 4, flags) end
          if is_vector(res.Position) then
            keep = { edx, r32(edx), r32(edx + 4) }
            pos = Vector(res.Position.X, res.Position.Y)
            wf32(edx, pos.X) wf32(edx + 4, pos.Y)
          end
        end
      end
      return { npc, pos, flags, source, damage, param, keep }
    end, function(self, esp, eax, k)
      if not k then return end
      if k[7] then w32(k[7][1], k[7][2]) w32(k[7][1] + 4, k[7][3]) end
      if POST and listening[POST] then run(POST, k[6], k[1], k[2], k[3], k[4], k[5]) end
    end)
  end
end

-- MC_PRE_PLAYER_TRIGGER_ROOM_CLEAR (1069) -> false: the player's room-clear effects are skipped;
-- MC_POST_PLAYER_TRIGGER_ROOM_CLEAR (1138): (player), param = player variant.
--   Entity_Player::TriggerRoomClear() 0x007a8fd0 (slot 92), called per player when the room is cleared.
do
  local PRE, POST = M.MC_PRE_PLAYER_TRIGGER_ROOM_CLEAR, M.MC_POST_PLAYER_TRIGGER_ROOM_CLEAR
  local list = ids(PRE, POST)
  if #list > 0 then
    on("Entity_Player::TriggerRoomClear", list, function(self)
      local p = as("EntityPlayer", self, "Entity_Player::TriggerRoomClear")
      if not p then return end
      local v = r32(self + E_VARIANT)
      if PRE and listening[PRE] and run(PRE, v, p) == false then return true, 0 end
      return { p, v }
    end, function(self, esp, eax, k)
      if k and POST and listening[POST] then run(POST, k[2], k[1]) end
    end)
  end
end

-- MC_POST_PLAYER_NEW_ROOM_TEMP_EFFECTS (1077): (player), param = player type, after
--   Entity_Player::TriggerNewRoom_TemporaryEffects() 0x007a8350 (slot 93)
if M.MC_POST_PLAYER_NEW_ROOM_TEMP_EFFECTS then
  local id = M.MC_POST_PLAYER_NEW_ROOM_TEMP_EFFECTS
  on("Entity_Player::TriggerNewRoom_TemporaryEffects", { id }, nil, function(self)
    local p = as("EntityPlayer", self, "Entity_Player::TriggerNewRoom_TemporaryEffects")
    if p then run(id, p:GetPlayerType(), p) end
  end)
end

-- MC_POST_PLAYER_NEW_LEVEL (1078): (player, fromPlayerUpdate, postLevelInitFinished), param = player type,
--   after Entity_Player::TriggerNewStage(bool) 0x007a4ba0, ret 4 (slot 94). postLevelInitFinished is the
--   player's byte at +0x1824: InitPostLevelInitStats sets it to 1 as it ends (0x007bea6e), Entity_Player::
--   Update runs InitPostLevelInitStats while it is 0 (0x00782d5b), and TriggerNewStage reads it (0x007a4fdc)
--   (REPENTOGON has it at 0x1810: this stretch of the player has moved by 20, api_player.lua).
if M.MC_POST_PLAYER_NEW_LEVEL then
  local id = M.MC_POST_PLAYER_NEW_LEVEL
  on("Entity_Player::TriggerNewStage", { id }, function(self, esp)
    local p = as("EntityPlayer", self, "Entity_Player::TriggerNewStage")
    if p then return { p, bool_at(esp + 4) } end
  end, function(self, esp, eax, k)
    if k then run(id, k[1]:GetPlayerType(), k[1], k[2], r8(self + 0x1824) ~= 0) end
  end)
end

-- MC_PRE_PLAYER_ADD_COSTUME (1281) -> an ItemConfig item: that costume instead; true: none.
-- MC_POST_PLAYER_ADD_COSTUME (1283): (item, player, itemStateOnly), param = item
--   Entity_Player::AddCostume(item, itemStateOnly) 0x0075d1d0, ret 8 (slot 19, reg)
-- MC_PRE_PLAYER_REMOVE_COSTUME (1282) -> true: kept. MC_POST_PLAYER_REMOVE_COSTUME (1284): (item, player)
--   Entity_Player::RemoveCostume(item) 0x0075d850, ret 4 (slot 20, reg)
-- No callback for a co-op baby, as in REPENTOGON (which also leaves a baby without the costume; the
-- game's own behaviour is kept here).
do
  local PRE, POST = M.MC_PRE_PLAYER_ADD_COSTUME, M.MC_POST_PLAYER_ADD_COSTUME
  local list = ids(PRE, POST)
  if #list > 0 then
    on("Entity_Player::AddCostume", list, function(self, esp)
      local p = as("EntityPlayer", self, "Entity_Player::AddCostume")
      if not p or p.Variant == 1 then return end
      local it = item_at(r32(esp + 4), "Entity_Player::AddCostume (the item)")
      if not it then return end
      local state = bool_at(esp + 8)
      if PRE and listening[PRE] then
        local res = run_item(PRE, it, it, p, state)
        if res == true then return true, 0 end
        if type(res) == "userdata" then
          local ok, a = pcall(ptr, res)
          if ok and a ~= 0 and item_at(a, "MC_PRE_PLAYER_ADD_COSTUME's answer") then
            w32(esp + 4, a)
            it = res
          end
        end
      end
      return { it, p, state }
    end, function(self, esp, eax, k)
      if k and POST and listening[POST] then run_item(POST, k[1], k[1], k[2], k[3]) end
    end)
  end
end
do
  local PRE, POST = M.MC_PRE_PLAYER_REMOVE_COSTUME, M.MC_POST_PLAYER_REMOVE_COSTUME
  local list = ids(PRE, POST)
  if #list > 0 then
    on("Entity_Player::RemoveCostume", list, function(self, esp)
      local p = as("EntityPlayer", self, "Entity_Player::RemoveCostume")
      if not p or p.Variant == 1 then return end
      local it = item_at(r32(esp + 4), "Entity_Player::RemoveCostume (the item)")
      if not it then return end
      if PRE and listening[PRE] and run_item(PRE, it, it, p) == true then return true, 0 end
      return { it, p }
    end, function(self, esp, eax, k)
      if k and POST and listening[POST] then run_item(POST, k[1], k[1], k[2]) end
    end)
  end
end

-- MC_POST_DISCHARGE_ACTIVE_ITEM (1140): (item, collectibleRemoved, player, slot), param = item, after
--   Entity_Player::DischargeActiveItem(slot, bool) 0x007ac7e0, ret 8 (slot 53, reg); the item is the
--   slot's after the call, as REPENTOGON reads it
if M.MC_POST_DISCHARGE_ACTIVE_ITEM then
  local id = M.MC_POST_DISCHARGE_ACTIVE_ITEM
  on("Entity_Player::DischargeActiveItem", { id }, function(self, esp)
    local slot = ri32(esp + 4)
    if slot < 0 or slot > 3 then return end
    local p = as("EntityPlayer", self, "Entity_Player::DischargeActiveItem")
    if p then return { p, slot, bool_at(esp + 8) } end
  end, function(self, esp, eax, k)
    if not k then return end
    local item = k[1]:GetActiveItem(k[2])
    run(id, item, item, k[3], k[1], k[2])
  end)
end

-- MC_PRE_OPEN_CHEST (1491) -> false: not opened (the function answers false). MC_POST_OPEN_CHEST (1492):
--   (pickup, player), param = pickup variant. Entity_Pickup::TryOpenChest(player) 0x006e6e40, ret 4
--   (slot 55, reg). The player may be absent (nil).
do
  local PRE, POST = M.MC_PRE_OPEN_CHEST, M.MC_POST_OPEN_CHEST
  local list = ids(PRE, POST)
  if #list > 0 then
    on("Entity_Pickup::TryOpenChest", list, function(self, esp)
      local pickup = as("EntityPickup", self, "Entity_Pickup::TryOpenChest")
      if not pickup then return end
      local pl = as("EntityPlayer", r32(esp + 4), "Entity_Pickup::TryOpenChest (the player)")
      if pl == false then return end
      local v = r32(self + E_VARIANT)
      if PRE and listening[PRE] and run(PRE, v, pickup, pl) == false then return true, 0 end
      return { pickup, pl, v }
    end, function(self, esp, eax, k)
      if k and POST and listening[POST] then run(POST, k[3], k[1], k[2]) end
    end)
  end
end

-- MC_PRE_BOMB_DAMAGE (1291) / MC_POST_ (1275):
--   (position, damage, radius, lineCheck, source, tearFlags, damageFlags, damageSource), param = source type
--   Game::BombDamage(Vector* pos, float damage, float radius, bool lineCheck, Entity* source,
--   BitSet128 flags, u64 damageFlags, bool damageSource) 0x006ff2a0, ret 0x30 (slot 56, reg): the twelve
--   words add up to the 0x30 its `ret` pops, and the body takes [ebx+0x1c] as the flags (0x006ffc23).
--   PRE -> false: no explosion damage; a table: Position, Damage, Radius, TearFlags, DamageFlags.
-- MC_PRE_BOMB_TEARFLAG_EFFECTS (1292) / MC_POST_ (1276): (position, radius, tearFlags, source, radiusMult)
--   Game::BombTearflagEffects(Vector* pos, float radius, BitSet128 flags, Entity* source, float mult)
--   0x007009a0, ret 0x20 (slot 57, reg). PRE -> false; a table: Position, Radius, TearFlags, RadiusMult.
-- A new position goes into a vector of the layer's own for the call (the caller's stays as it was).
do
  local function new_pos(esp, v, hold)
    local a = alloc(8)
    if a == 0 then return end
    wf32(a, v.X) wf32(a + 4, v.Y)
    w32(esp + 4, a)
    hold[#hold + 1] = a
  end
  local PRE, POST = M.MC_PRE_BOMB_DAMAGE, M.MC_POST_BOMB_DAMAGE
  local list = ids(PRE, POST)
  if #list > 0 then
    on("Game::BombDamage", list, function(self, esp)
      local src = r32(esp + 20)
      local source = any_entity(src, "Game::BombDamage (the source)")
      if source == false then return end
      local param = source and r32(src + E_TYPE) or nil
      local a = { vec_at(r32(esp + 4)), rf32(esp + 8), rf32(esp + 12), bool_at(esp + 16), source, bitset_at(esp + 24),
                  r32(esp + 40) | (r32(esp + 44) << 32), bool_at(esp + 48) }
      local hold = {}
      if PRE and listening[PRE] then
        local res = run(PRE, param, a[1], a[2], a[3], a[4], a[5], a[6], a[7], a[8])
        if res == false then return true, 0 end
        if type(res) == "table" then
          if is_vector(res.Position) then a[1] = Vector(res.Position.X, res.Position.Y) new_pos(esp, a[1], hold) end
          if type(res.Damage) == "number" then a[2] = math.max(res.Damage, 0.0) wf32(esp + 8, a[2]) end
          if type(res.Radius) == "number" then a[3] = math.max(res.Radius, 0.0) wf32(esp + 12, a[3]) end
          if is_bitset(res.TearFlags) then a[6] = res.TearFlags put_bitset(esp + 24, a[6]) end
          if mathtype(res.DamageFlags) == "integer" then
            a[7] = res.DamageFlags
            w32(esp + 40, a[7] & 0xffffffff) w32(esp + 44, (a[7] >> 32) & 0xffffffff)
          end
        end
      end
      return { a, param, hold }
    end, function(self, esp, eax, k)
      if not k then return end
      for _, h in ipairs(k[3]) do free(h) end
      local a = k[1]
      if POST and listening[POST] then run(POST, k[2], a[1], a[2], a[3], a[4], a[5], a[6], a[7], a[8]) end
    end)
  end
end
do
  local function new_pos(esp, v, hold)
    local a = alloc(8)
    if a == 0 then return end
    wf32(a, v.X) wf32(a + 4, v.Y)
    w32(esp + 4, a)
    hold[#hold + 1] = a
  end
  local PRE, POST = M.MC_PRE_BOMB_TEARFLAG_EFFECTS, M.MC_POST_BOMB_TEARFLAG_EFFECTS
  local list = ids(PRE, POST)
  if #list > 0 then
    on("Game::BombTearflagEffects", list, function(self, esp)
      local src = r32(esp + 28)
      local source = any_entity(src, "Game::BombTearflagEffects (the source)")
      if source == false then return end
      local param = source and r32(src + E_TYPE) or nil
      local a = { vec_at(r32(esp + 4)), rf32(esp + 8), bitset_at(esp + 12), source, rf32(esp + 32) }
      local hold = {}
      if PRE and listening[PRE] then
        local res = run(PRE, param, a[1], a[2], a[3], a[4], a[5])
        if res == false then return true, 0 end
        if type(res) == "table" then
          if is_vector(res.Position) then a[1] = Vector(res.Position.X, res.Position.Y) new_pos(esp, a[1], hold) end
          if type(res.Radius) == "number" then a[2] = math.max(res.Radius, 0.0) wf32(esp + 8, a[2]) end
          if is_bitset(res.TearFlags) then a[3] = res.TearFlags put_bitset(esp + 12, a[3]) end
          if type(res.RadiusMult) == "number" then a[5] = math.max(res.RadiusMult, 0.0) wf32(esp + 32, a[5]) end
        end
      end
      return { a, param, hold }
    end, function(self, esp, eax, k)
      if not k then return end
      for _, h in ipairs(k[3]) do free(h) end
      local a = k[1]
      if POST and listening[POST] then run(POST, k[2], a[1], a[2], a[3], a[4], a[5]) end
    end)
  end
end

-- MC_PRE_LEVEL_SELECT (1104): (stage, stageType) -> a table {stage, stageType}: that one instead.
--   Level::SetStage(stage, type) 0x007466d0, ret 8 (slot 6, reg). The answer is checked as REPENTOGON does:
--   a stage of 1..14 (1..7 in greed mode), a type of 0, 1, 2, 4 or 5; anything else is said and ignored.
if M.MC_PRE_LEVEL_SELECT then
  local id = M.MC_PRE_LEVEL_SELECT
  on("Level::SetStage", { id }, function(self, esp)
    local res = run(id, nil, ri32(esp + 4), ri32(esp + 8))
    if type(res) ~= "table" then return end
    local stage, kind = res[1], res[2]
    local top = Game():IsGreedMode() and 7 or 14
    if #res ~= 2 or mathtype(stage) ~= "integer" or mathtype(kind) ~= "integer" or stage < 1 or stage > top
      or kind < 0 or kind == 3 or kind > 5 then
      Isaac.DebugString("MC_PRE_LEVEL_SELECT: invalid answer, ignored")
      return
    end
    w32(esp + 4, stage) w32(esp + 8, kind)
  end, nil)
end

-- MC_POST_FAMILIAR_FIRE_PROJECTILE (1252): (tear), param = familiar variant, after
--   Entity_Familiar::FireProjectile(const Vector& dir, bool) 0x00639750, ret 8 (slot 77, reg), which
--   answers the tear it fired (or nothing)
if M.MC_POST_FAMILIAR_FIRE_PROJECTILE then
  local id = M.MC_POST_FAMILIAR_FIRE_PROJECTILE
  on("Entity_Familiar::FireProjectile", { id }, nil, function(self, esp, eax)
    if eax == 0 or vt_of(self) ~= VTABLE.EntityFamiliar then return end
    local tear = as("EntityTear", eax, "Entity_Familiar::FireProjectile (what it answered)")
    if tear then run(id, r32(self + E_VARIANT), tear) end
  end)
end

-- MC_POST_PLAYER_DROP_TRINKET (1144): (trinket, dropPos, player, isGolden, replaceTick, pickup),
--   param = the trinket without its golden bit, after Entity_Player::DropTrinket(Vector* pos, bool
--   replaceTick) 0x00771800, ret 8 (slot 54, reg), when it answered a pickup
if M.MC_POST_PLAYER_DROP_TRINKET then
  local id, GOLDEN = M.MC_POST_PLAYER_DROP_TRINKET, 0x8000
  on("Entity_Player::DropTrinket", { id }, function(self, esp)
    local p = as("EntityPlayer", self, "Entity_Player::DropTrinket")
    local at = r32(esp + 4)
    if p and at ~= 0 then return { p, vec_at(at), bool_at(esp + 8) } end
  end, function(self, esp, eax, k)
    if not k or eax == 0 then return end
    local pick = as("EntityPickup", eax, "Entity_Player::DropTrinket (what it answered)")
    if not pick then return end
    local t = pick.SubType
    run(id, t & (GOLDEN - 1), t & (GOLDEN - 1), k[2], k[1], (t & GOLDEN) ~= 0, k[3], pick)
  end)
end

-- MC_PRE_USE_PILL (1065): (pillEffect, pillColor, player, useFlags), param = pill effect -> true: not used.
--   Entity_Player::UsePill(effect, color, flags) 0x007c4180, ret 0xc (slot 33, reg)
if M.MC_PRE_USE_PILL then
  local id = M.MC_PRE_USE_PILL
  on("Entity_Player::UsePill", { id }, function(self, esp)
    local p = as("EntityPlayer", self, "Entity_Player::UsePill")
    if not p then return end
    local effect = ri32(esp + 4)
    if run(id, effect, effect, ri32(esp + 8), p, r32(esp + 12)) == true then return true, 0 end
  end, nil)
end

------------------------------------------------------------------------------
-- round 109
------------------------------------------------------------------------------
local GAME_PTR = 0x00c71678                          -- the game object (asm: read by every caller below)

-- MC_PRE_ITEM_OVERLAY_SHOW (1076): (overlayID, delay, player), param = overlayID -> true: not shown;
--   an integer: that overlay instead.  MC_POST_ITEM_OVERLAY_SHOW (1134): the same, after.
--   ItemOverlay::Show(id, delay, player) 0x009ad210, ret 0xc (slot 28; every ret reached pops 0xc,
--   .scratch/rgon/h2/rets.py). `this` is the game's overlay, game+0x1c034 (Game::GetItemOverlay 0x00456860 is
--   `lea eax, [ecx + 0x1c034]; ret`, and the callers pass what it answers: 0x005be6f3..0x005be700 push
--   (0x27, 0, 0)). It refuses an id above 0x2f (0x009ad221) and stores it at +4 (0x009ad27a). The player
--   may be 0.
do
  local PRE, POST = M.MC_PRE_ITEM_OVERLAY_SHOW, M.MC_POST_ITEM_OVERLAY_SHOW
  local list = ids(PRE, POST)
  if #list > 0 then
    on("ItemOverlay::Show", list, function(self, esp)
      if self ~= r32(GAME_PTR) + 0x1c034 then wrong("ItemOverlay::Show", self) return end
      local pl = r32(esp + 12)
      local p = pl ~= 0 and as("EntityPlayer", pl, "ItemOverlay::Show (its player)") or nil
      if p == false then return end
      local id, delay = ri32(esp + 4), ri32(esp + 8)
      if PRE and listening[PRE] then
        local res = run(PRE, id, id, delay, p)
        if res == true then return true, 0 end
        if mathtype(res) == "integer" then id = res w32(esp + 4, id) end
      end
      return { id, delay, p }
    end, function(self, esp, eax, k)
      -- the id the game took is the one it stored at +4 (0x009ad27a); an id it refused leaves +4 as it was
      if k and POST and listening[POST] then
        local shown = k[1] >= 0 and k[1] <= 0x2f and ri32(self + 4) or k[1]
        run(POST, shown, shown, k[2], k[3])
      end
    end)
  end
end

-- MC_PRE_GRID_ENTITY_SPAWN (1100): (type, variant, varData, gridIndex, seed, desc), param = type
--   -> false: not spawned (the function answers false); a table {type, variant, varData, seed}: those.
--   Room::SpawnGridEntity(gridIndex, type, variant, seed, varData) 0x007ebca0, ret 0x14 (slot 22, reg: the
--   game's Lua Room:SpawnGridEntity is this function, its arguments in that order); desc is nil there, and a
--   GridEntityDesc answered there is accepted and not supported (said once).
--   Room::SpawnGridEntityDesc(gridIndex, GridEntityDesc*) 0x007ebd50, ret 8 (slot 97, round 109; REPENTOGON's
--   signature matches it once): the room's own spawns from a descriptor (its callers 0x004feaba, 0x00820baa).
--   desc is the game's GridEntityDesc (Type +0, Variant +4, SpawnSeed +0x10, VarData +0x14: the Lua
--   registration's data members). A table answered there spawns those through SpawnGridEntity instead, and a
--   GridEntityDesc answered is spawned from in its place, as REPENTOGON does; the callback does not run a
--   second time for the spawn it caused.
--   `this` must be the game's room (game+0x18300, Room::Init's `this`, api_hooks slot 89).
do
  local PRE = M.MC_PRE_GRID_ENTITY_SPAWN
  local SPAWN = 0x007ebca0
  local said_desc, inner = false, false
  if PRE then
    on("Room::SpawnGridEntityDesc", { PRE }, function(self, esp)
      if inner then return end
      if self ~= ptr(Game():GetRoom()) then wrong("Room::SpawnGridEntityDesc", self) return end
      local idx, d = ri32(esp + 4), r32(esp + 8)
      if d == 0 then return end
      local res = run(PRE, ri32(d), ri32(d), ri32(d + 4), ri32(d + 0x14), idx, r32(d + 0x10), wrap("GridEntityDesc", d))
      if res == false then return true, 0 end
      if type(res) == "table" then
        local function pick(i, cur) return mathtype(res[i]) == "integer" and res[i] or cur end
        inner = true
        local ok, eax = pcall(B.call, SPAWN, self, idx & 0xffffffff, pick(1, ri32(d)) & 0xffffffff, pick(2, ri32(d + 4)) & 0xffffffff,
          pick(4, r32(d + 0x10)) & 0xffffffff, pick(3, ri32(d + 0x14)) & 0xffffffff)
        inner = false
        if ok then return true, eax & 0xff end
        log("api_hooks: MC_PRE_GRID_ENTITY_SPAWN's spawn in place of a descriptor stopped: " .. tostring(eax))
      elseif type(res) == "userdata" then
        local nd = ptr(res)
        if nd ~= 0 then w32(esp + 8, nd) end
      end
    end, nil)
    on("Room::SpawnGridEntity", { PRE }, function(self, esp)
      if inner then return end
      if self ~= ptr(Game():GetRoom()) then wrong("Room::SpawnGridEntity", self) return end
      local idx, gtype, var, seed, vard = ri32(esp + 4), ri32(esp + 8), ri32(esp + 12), r32(esp + 16), ri32(esp + 20)
      local res = run(PRE, gtype, gtype, var, vard, idx, seed, nil)
      if res == false then return true, 0 end
      if type(res) == "table" then
        if mathtype(res[1]) == "integer" then w32(esp + 8, res[1]) end
        if mathtype(res[2]) == "integer" then w32(esp + 12, res[2]) end
        if mathtype(res[3]) == "integer" then w32(esp + 20, res[3]) end
        if mathtype(res[4]) == "integer" then w32(esp + 16, res[4]) end
      elseif type(res) == "userdata" and not said_desc then
        said_desc = true
        log("accepted, not supported in the browser: a GridEntityDesc returned from MC_PRE_GRID_ENTITY_SPAWN for Room:SpawnGridEntity (the grid entity is spawned as asked)")
      end
    end, nil)
  end
end

-- MC_POST_TEAR_DEATH (1033): (tear), param = tear variant.  MC_POST_PROJECTILE_DEATH (1032): (projectile),
--   param = projectile variant. Before Entity::Remove 0x006acb00 (slot 95; vtable slot 10 of every entity
--   class, ret 0) when it is called from the place in each Update where REPENTOGON's patch replaces the call:
--   Entity_Tear::Update's `mov eax, [eax + 0x28]; call eax` at 0x0066a366 (return address 0x0066a36b;
--   REPENTOGON's signature goes on with the code after the jmp that follows, which here begins with
--   `lea esi, [edi + 0x428]` before the same `push; mov edx, esi; lea ecx, [ebp - ..]`), and
--   Entity_Projectile::Update's `mov ecx, edi; call [eax + 0x28]` at 0x006580b3 (return address 0x006580b8;
--   REPENTOGON's signature `8bcfff50??837f??02` matches there once).
do
  local TD, PD = M.MC_POST_TEAR_DEATH, M.MC_POST_PROJECTILE_DEATH
  local list = ids(TD, PD)
  local TEAR_DIES, PROJ_DIES = 0x0066a36b, 0x006580b8
  T.death_sites = { tear = TEAR_DIES, projectile = PROJ_DIES }
  if #list > 0 then
    on("Entity::Remove", list, function(self, esp)
      local back = r32(esp)
      if back == TEAR_DIES then
        if TD and wants(TD, r32(self + E_VARIANT)) then
          local t = as("EntityTear", self, "Entity::Remove (a tear's death)")
          if t then run(TD, r32(self + E_VARIANT), t) end
        end
      elseif back == PROJ_DIES then
        if PD and wants(PD, r32(self + E_VARIANT)) then
          local pr = as("EntityProjectile", self, "Entity::Remove (a projectile's death)")
          if pr then run(PD, r32(self + E_VARIANT), pr) end
        end
      end
    end, nil)
  end
end

-- MC_POST_ROOM_RENDER_ENTITIES (1044): (), after the room's entities are drawn. REPENTOGON patches Room::Render
--   (reg 0x0080f200) at the loop that follows them (`xor esi, esi; lea eax, [edi + 0x1218]; cmp [eax + 0xa0],
--   esi`, here at 0x00810c97). The instruction before it is the last of three calls of 0x004199d0 (slot 98,
--   ret 8) with ecx = room+0x1218, so the callback runs after that call, when it returns to 0x00810c97.
if M.MC_POST_ROOM_RENDER_ENTITIES then
  local id, SITE = M.MC_POST_ROOM_RENDER_ENTITIES, 0x00810c97
  on("Room::RenderEntityPass_004199d0", { id }, function(self, esp)
    if r32(esp) == SITE then return { true } end
  end, function(self, esp, eax, k)
    if k then run(id, nil) end
  end)
end

-- MC_PRE_PLAYERHUD_TRINKET_RENDER (1264): (slot, position, scale, player, cropOffset), param = slot
--   -> true: not drawn; a table: its Position (Vector) and Scale (number) are drawn with. CropOffset changes the
--   drawing inside the function in REPENTOGON: accepted here, not supported (said once); the cropOffset handed
--   over is always (0, 0) (REPENTOGON computes Monkey Paw's from a player field this layer has not measured).
--   PlayerHUD::RenderTrinket(slot, const Vector* pos, float, float scale, bool) 0x00846ff0, ret 0x14 (slot 96):
--   `this` is one of the HUD's eight 0x6dc-byte player slots (as for RenderActiveItem); the function draws
--   nothing when the slot's trinket (+0x200 + slot*0x18) or its image (+8 from there) is 0 (0x0084700e,
--   0x0084701b), and then the callback does not run either, as in REPENTOGON.
do
  local PRE = M.MC_PRE_PLAYERHUD_TRINKET_RENDER
  local SLOT_SIZE, said_crop = 0x6dc, false
  if PRE then
    on("PlayerHUD::RenderTrinket", { PRE }, function(self, esp)
      local hud = ptr(Game():GetHUD())
      local off = self - hud
      local index = off // SLOT_SIZE
      if hud == 0 or off < 0 or off % SLOT_SIZE ~= 0 or index > 7 or r32(self + 4) ~= hud or r16(self + 8) ~= index then
        wrong("PlayerHUD::RenderTrinket", self)
        return
      end
      local slot = ri32(esp + 4)
      if slot < 0 or slot > 1 then return end
      local e = self + 0x200 + slot * 0x18
      if r32(e) == 0 or r32(e + 8) == 0 then return end
      local p = as("EntityPlayer", r32(self), "PlayerHUD::RenderTrinket (its player)")
      if not p then return end
      local at = r32(esp + 8)
      local pos = vec_at(at)
      local res = run(PRE, slot, slot, Vector(pos.X, pos.Y), rf32(esp + 16), p, Vector(0, 0))
      if res == true then return true, 0 end
      if type(res) == "table" then
        if type(res.Scale) == "number" then wf32(esp + 16, res.Scale) end
        if res.CropOffset ~= nil and not said_crop then
          said_crop = true
          log("accepted, not supported in the browser: CropOffset returned from MC_PRE_PLAYERHUD_TRINKET_RENDER")
        end
        if is_vector(res.Position) then
          -- the function reads the position through the caller's pointer: written, and put back after
          local keep = { at, r32(at), r32(at + 4) }
          wf32(at, res.Position.X) wf32(at + 4, res.Position.Y)
          return keep
        end
      end
    end, function(self, esp, eax, keep)
      if keep then w32(keep[1], keep[2]) w32(keep[1] + 4, keep[3]) end
    end)
  end
end

-- MC_GET_SHOP_ITEM_PRICE (1066): (variant, subtype, shopItemID, price), param = variant -> an integer: the price.
--   Room::GetShopItemPrice 0x008151e0 (slot 99), ecx = the game's room, (variant, subtype, shopItemId, a word its
--   7 callers pass as 0), ret 0x10: one word more than REPENTOGON's declaration. Its callers store what it
--   answers as the pickup's Price (+0x534) and then hand it to 0x00816250 (ecx the room), which may adjust it
--   further; REPENTOGON's callback answers for the first function, and so does this one.
if M.MC_GET_SHOP_ITEM_PRICE then
  local id = M.MC_GET_SHOP_ITEM_PRICE
  on("Room::GetShopItemPrice", { id }, function(self, esp)
    if self ~= ptr(Game():GetRoom()) then wrong("Room::GetShopItemPrice", self) return end
    return { ri32(esp + 4), ri32(esp + 8), ri32(esp + 12) }
  end, function(self, esp, eax, k)
    if not k then return end
    local cur = signed(eax)
    local res = run(id, k[1], k[1], k[2], k[3], cur)
    if mathtype(res) == "integer" and res ~= cur then return res & 0xffffffff end
  end)
end

-- MC_EVALUATE_MULTI_SHOT_PARAMS (1289): (player, params, weaponType), param = player type -> a MultiShotParams:
--   that one for the functions after it and for the game. The deprecated MC_POST_PLAYER_GET_MULTI_SHOT_PARAMS
--   (1251, (player) -> a MultiShotParams) runs first, as REPENTOGON's main_ex.lua does.
--   Entity_Player::GetMultiShotParams(MultiShotParams* out, weaponType) 0x00781b90, ret 8 (slot 71, reg): the
--   struct is returned through the hidden first argument and EAX (api_extra.lua has its layout). The
--   callbacks are handed a copy (api_extra.lua's MultiShotParams); what they answer is copied over `out`.
--   While the callbacks run for a player and weapon type the function answers for them unwatched, as
--   REPENTOGON's recursion guard does, so a callback may call GetMultiShotParams itself.
do
  local EV, LEG = M.MC_EVALUATE_MULTI_SHOT_PARAMS, M.MC_POST_PLAYER_GET_MULTI_SHOT_PARAMS
  local list = ids(EV, LEG)
  local MSP = T.msp
  local busy = {}
  if EV and T.RULE and MSP then
    -- each function may answer a MultiShotParams; it is what the functions after it are handed
    T.RULE[EV] = function(id, it, player, params, ...)
      for cb in it do
        local ret = T.rules.call(id, cb, player, params, ...)
        if MSP.is(ret) then params = ret end
      end
      return params
    end
  end
  if #list > 0 and MSP then
    on("Entity_Player::GetMultiShotParams", list, function(self, esp)
      local p = as("EntityPlayer", self, "Entity_Player::GetMultiShotParams")
      if not p then return end
      local weapon = ri32(esp + 8)
      local key = self * 64 + (weapon & 63)
      if busy[key] then return end
      return { p, r32(esp + 4), weapon, key }
    end, function(self, esp, eax, k)
      if not k or eax ~= k[2] then return end
      local p, out, weapon, key = k[1], k[2], k[3], k[4]
      busy[key] = true
      local ok, err = pcall(function()
        local params = MSP.new(out)
        local ptype = p:GetPlayerType()
        if LEG and listening[LEG] then
          local old = run(LEG, ptype, p)
          if MSP.is(old) then params = old end
        end
        local res = params
        if EV and listening[EV] then res = run(EV, ptype, p, params, weapon) end
        if MSP.is(res) then
          local from = MSP.addr(res)
          for o = 0, MSP.size - 4, 4 do w32(out + o, r32(from + o)) end
        end
      end)
      busy[key] = nil
      if not ok then log("api_hooks: MC_EVALUATE_MULTI_SHOT_PARAMS stopped: " .. tostring(err)) end
    end)
  end
end

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
