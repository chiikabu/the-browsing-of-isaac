-- api_game.lua -- more of the entities' fields, and the methods that are a
-- call into the game itself.

local T = ...
local B, R, method, wrap, this, field = T.B, T.R, T.method, T.wrap, T.this, T.field
local ptr, r8, r32, ri32, rf32, w8, w32, wf32, log, call = B.ptr, B.r8, B.r32, B.ri32, B.rf32, B.w8, B.w32, B.wf32, B.log, B.call
local type, tostring, tonumber, select, ipairs = type, tostring, tonumber, select, ipairs
local mathtype = math.type
if not field then log("api_game: api_objects.lua did not load; nothing here either") return end

local function int_arg(v, n, what)
  if mathtype(v) == "float" and v == math.floor(v) then v = math.tointeger(v) end
  if mathtype(v) ~= "integer" then error("bad argument #" .. n .. " to '" .. what .. "' (integer expected, got " .. type(v) .. ")", 3) end
  return v
end
local function bool_arg(v, n, what)
  if type(v) ~= "boolean" then error("bad argument #" .. n .. " to '" .. what .. "' (boolean expected, got " .. type(v) .. ")", 3) end
  return v
end

------------------------------------------------------------------------------
-- bombs, tears, lasers
------------------------------------------------------------------------------
-- Entity_Bomb, against this build's Entity_Bomb::Init (0x006a2050, vtable slot
-- 1): it sets the explosion countdown at 0x410 (45, 87 or 94), the explosion
-- damage at 0x418 (20, 100 or 300 -- the game's own ExplosionDamage getter
-- reads 0x418 too), the fall speed at 0x41c (0 or -8), 0x420, 0x428 and 0x42c
-- to 0, the scale at 0x434 to 1.0 and tests the costume flag at 0x463:
-- REPENTOGON's offsets.
field("EntityBomb", "GetExplosionCountdown", nil, 0x410, "i32")
field("EntityBomb", "GetFallSpeed", "SetFallSpeed", 0x41c, "f32")
field("EntityBomb", "GetFallAcceleration", "SetFallAcceleration", 0x420, "f32")
field("EntityBomb", "GetRocketAngle", "SetRocketAngle", 0x428, "f32")
field("EntityBomb", "GetRocketSpeed", "SetRocketSpeed", 0x42c, "f32")
field("EntityBomb", "GetScale", "SetScale", 0x434, "f32")
field("EntityBomb", "IsPrismTouched", "SetPrismTouched", 0x45c, "bool")
method("EntityBomb", "SetLoadCostumes", function(self, on)
  w8(this(self, "SetLoadCostumes") + 0x463, on == false and 0 or 1)
end)

-- Entity_Tear, against this build's Entity_Tear::Init (0x006660a0, vtable slot
-- 1): it reads the hit list's vector at 0x444, sets the base damage at 0x454
-- to 3.5, the knockback multiplier at 0x460 to 1.7 (the game's own getter
-- reads it there), the dead-eye intensity at 0x464 to 0 and the two flag
-- bytes at 0x468 and 0x469 to 0. Its three sprites (halo 0x4ac, effect 0x5c0,
-- dead eye 0x6d4, a sprite being 0x114 bytes) end at 0x7e8, which is where
-- this build has the field that follows them (CanTriggerStreakEnd, in the Lua
-- registration); each is checked to be a sprite when it is asked for.
field("EntityTear", "GetDeadEyeIntensity", nil, 0x464, "f32")
field("EntityTear", "IsMultidimensionalTouched", nil, 0x468, "bool")
field("EntityTear", "IsPrismTouched", "SetPrismTouched", 0x469, "bool")
-- a sprite held inside another object: its two animation states (+0x30, +0x50) point back at it
local function inner_sprite(cls, name, offset)
  method(cls, name, function(self)
    local a = this(self, name) + offset
    if r32(a + 0x30) ~= a or r32(a + 0x50) ~= a then error("rgon: no sprite where " .. cls .. ":" .. name .. " expects one", 2) end
    return wrap("Sprite", a)
  end)
end
T.inner_sprite = inner_sprite
inner_sprite("EntityTear", "GetTearHaloSprite", 0x4ac)
inner_sprite("EntityTear", "GetTearEffectSprite", 0x5c0)
inner_sprite("EntityTear", "GetDeadEyeSprite", 0x6d4)
-- the entities a tear has already hit: a vector of entity indices at 0x444
-- (between ContinueVelocity 0x43c and Rotation 0x458, both checked)
do
  local HITS = 0x444
  local function hits(self, what)
    local a = this(self, what) + HITS
    local first, last = r32(a), r32(a + 4)
    if last < first or last - first > 0x4000 then error("rgon: this tear's hit list is not laid out as expected", 3) end
    return a, first, last
  end
  method("EntityTear", "GetHitList", function(self)
    local _, first, last = hits(self, "GetHitList")
    local out = {}
    for at = first, last - 4, 4 do out[#out + 1] = r32(at) end
    return out
  end)
  method("EntityTear", "ClearHitList", function(self)
    local a, first = hits(self, "ClearHitList")
    w32(a + 4, first)
  end)
end

-- Entity_Laser, against this build's Entity_Laser::Init (0x0096f590, vtable slot 1): it sets the
-- scale at 0x4e0 and the damage multiplier at 0x51c to 1.0, clears the bytes at 0x500 and 0x514
-- (with OneHit, 0x515, which the game's own getter reads there) and the chained-laser count at
-- 0x560, and its hit list is the vector at 0x520: REPENTOGON's offsets.
field("EntityLaser", "GetScale", nil, 0x4e0, "f32")
field("EntityLaser", "IsMultidimensionalTouched", nil, 0x500, "bool")
field("EntityLaser", "IsPrismTouched", "SetPrismTouched", 0x514, "bool")
field("EntityLaser", "GetDamageMultiplier", "SetDamageMultiplier", 0x51c, "f32")
field("EntityLaser", "GetNumChainedLasers", "SetNumChainedLasers", 0x560, "i32")
method("EntityLaser", "GetHitList", function(self)
  local a = this(self, "GetHitList") + 0x520
  local first, last = r32(a), r32(a + 4)
  if last < first or last - first > 0x4000 then error("rgon: this laser's hit list is not laid out as expected", 2) end
  local out = {}
  for at = first, last - 4, 4 do out[#out + 1] = r32(at) end
  return out
end)

------------------------------------------------------------------------------
-- methods that are a call into the game
------------------------------------------------------------------------------
-- Each address is a REPENTOGON signature that matches this executable exactly
-- once, and each function's own `ret` pops what its signature says it takes
-- (checked for every one of them). Arguments, in order:
--   i  integer     b  boolean     E  an Entity (or a child class)     V  Vector     R  EntityRef
-- a default after "=" makes the argument optional. Result: "void", "int", "uint", "bool",
-- or a class name (the pointer the function returns, nil when it is null).
local function words(spec, what, ...)
  local out, n = {}, 0
  local i = 0
  for kind, default in spec:gmatch("(%a)=?([%w%-]*);?") do
    i = i + 1
    local v = (select(i, ...))
    if v == nil and default ~= "" then
      if default == "true" then v = true elseif default == "false" then v = false else v = math.tointeger(tonumber(default)) end
    end
    n = n + 1
    if kind == "i" then
      out[n] = int_arg(v, i, what) & 0xffffffff
    elseif kind == "b" then
      out[n] = bool_arg(v, i, what) and 1 or 0
    else
      local p = type(v) == "userdata" and ptr(v) or 0
      if p == 0 then error("bad argument #" .. i .. " to '" .. what .. "' (" .. (kind == "E" and "Entity" or kind == "V" and "Vector" or "EntityRef") .. " expected, got " .. type(v) .. ")", 3) end
      out[n] = p
    end
  end
  return out, n
end
local function result(kind, eax)
  if kind == "void" then return end
  if kind == "bool" then return (eax & 0xff) ~= 0 end
  if kind == "uint" then return eax end
  if kind == "int" then return eax >= 0x80000000 and eax - 0x100000000 or eax end
  return wrap(kind, eax)
end
local function gcall(cls, name, va, spec, ret, tail)
  method(cls, name, function(self, ...)
    local w, n = words(spec, name, ...)
    if tail then for i = 1, #tail do n = n + 1 w[n] = tail[i] end end
    return result(ret, (call(va, this(self, name), table.unpack(w, 1, n))))
  end)
end
T.gcall = gcall

gcall("Entity", "AddBleeding", 0x006ae420, "R;i", "void", { 0 })
gcall("Entity", "AddBaited", 0x006b7560, "R;i", "void", { 0 })
gcall("Entity", "AddBrimstoneMark", 0x006b78d0, "R;i", "void")
gcall("Entity", "AddIce", 0x006b79d0, "R;i", "void")
gcall("Entity", "AddWeakness", 0x006b77d0, "R;i", "void")
gcall("Entity", "AddKnockback", 0x006b7a80, "R;V;i;b", "void")
gcall("Entity", "CanDevolve", 0x006a8f80, "", "bool")
gcall("Entity", "GetHitListIndex", 0x006b62b0, "", "uint")
gcall("EntityNPC", "UpdateDirtColor", 0x006c04b0, "b", "void")
gcall("EntityNPC", "TryForceTarget", 0x006b9910, "E;i", "bool")
gcall("EntityTear", "MakeMultidimensionalCopy", 0x0067a190, "", "EntityTear", { 0 })
gcall("Game", "AchievementUnlocksDisallowed", 0x00705080, "", "bool")
gcall("GridEntity", "IsBreakableRock", 0x0070b2a0, "", "bool")
gcall("GridEntityRock", "UpdateNeighbors", 0x0071aaf0, "", "void")
gcall("Level", "HasAbandonedMineshaft", 0x0074efd0, "", "bool")
gcall("Level", "CanSpawnDoorOutline", 0x0074cd70, "i;i", "bool")
gcall("Room", "TriggerRestock", 0x00815800, "i;i", "void")
gcall("Room", "SetPauseTimer", 0x007ea260, "i", "void")
gcall("EntityPlayer", "AddActiveCharge", 0x007915a0, "i;i=0;b=true;b=false;b=false", "int")
gcall("EntityPlayer", "EnableWeaponType", 0x00753980, "i;b", "void")
gcall("EntityPlayer", "SetItemState", 0x0075ea20, "i", "void")
gcall("EntityPlayer", "CanCrushRocks", 0x007c3380, "", "bool")
gcall("EntityPlayer", "IsHologram", 0x007db700, "", "bool")
gcall("EntityPlayer", "AddUrnSouls", 0x007d3480, "i", "void")
gcall("EntityPlayer", "ClearQueueItem", 0x0075e190, "", "void")
gcall("EntityPlayer", "GetGreedsGulletHearts", 0x007ce390, "", "int")
gcall("EntityPlayer", "HasInstantDeathCurse", 0x007db6b0, "", "bool")

-- the two static ones take no object
method("Game", "IsGreedBoss", function() return (call(0x00983970, nil) & 0xff) ~= 0 end)
method("Game", "IsGreedFinalBoss", function() return (call(0x009839b0, nil) & 0xff) ~= 0 end)

-- Room:RemoveGridEntityImmediate(gridIndex, pathTrail, keepDecoration)
method("Room", "RemoveGridEntityImmediate", function(self, index, trail, keep)
  call(0x0081e980, this(self, "RemoveGridEntityImmediate"), int_arg(index, 1, "RemoveGridEntityImmediate") & 0xffffffff,
       int_arg(trail, 2, "RemoveGridEntityImmediate") & 0xffffffff, keep and 1 or 0)
end)
-- Room:GetGridIndexByTile(row, column) or ({row, column})
method("Room", "GetGridIndexByTile", function(self, row, column)
  if type(row) == "table" then
    if #row ~= 2 then error("bad argument #1 to 'GetGridIndexByTile' (expected table length of 2!)", 2) end
    row, column = row[1], row[2]
  end
  return result("int", (call(0x00812e60, this(self, "GetGridIndexByTile"), int_arg(row, 1, "GetGridIndexByTile") & 0xffffffff,
                             int_arg(column, 2, "GetGridIndexByTile") & 0xffffffff)))
end)
-- EntityPlayer:RemovePocketItem(slot 0..3)
method("EntityPlayer", "RemovePocketItem", function(self, slot)
  slot = int_arg(slot, 1, "RemovePocketItem")
  if slot < 0 or slot > 3 then error("bad argument #1 to 'RemovePocketItem' (Invalid slot ID " .. slot .. ")", 2) end
  call(0x007a4850, this(self, "RemovePocketItem"), slot)
end)
-- EntityPlayer:GetGlyphOfBalanceDrop(variant = -1, subType = -1) -> { variant, subType }
method("EntityPlayer", "GetGlyphOfBalanceDrop", function(self, variant, subtype)
  local buf = B.alloc(8)
  w32(buf, (variant == nil and -1 or int_arg(variant, 1, "GetGlyphOfBalanceDrop")) & 0xffffffff)
  w32(buf + 4, (subtype == nil and -1 or int_arg(subtype, 2, "GetGlyphOfBalanceDrop")) & 0xffffffff)
  call(0x007d12c0, this(self, "GetGlyphOfBalanceDrop"), buf, buf + 4)
  local out = { ri32(buf), ri32(buf + 4) }
  B.free(buf)
  return out
end)
-- EntityPlayer:ShootBlueCandle(direction) -> the flame
method("EntityPlayer", "ShootBlueCandle", function(self, dir)
  local p = type(dir) == "userdata" and ptr(dir) or 0
  if p == 0 then error("bad argument #1 to 'ShootBlueCandle' (Vector expected, got " .. type(dir) .. ")", 2) end
  local e = wrap("Entity", (call(0x007c9350, this(self, "ShootBlueCandle"), p)))
  return e and e:ToEffect()
end)

-- Entity:GetNullOffset(nullLayerName) -> Vector: where a null layer of the entity's sprite is, this frame
--   Vector Entity::GetNullOffset(const char*): the vector comes back through a hidden first argument
method("Entity", "GetNullOffset", function(self, name)
  if type(name) ~= "string" then error("bad argument #1 to 'GetNullOffset' (string expected, got " .. type(name) .. ")", 2) end
  local buf = B.alloc(#name + 1 + 8)
  for i = 1, #name do w8(buf + 8 + i - 1, name:byte(i)) end
  w8(buf + 8 + #name, 0)
  call(0x006b6af0, this(self, "GetNullOffset"), buf, buf + 8)
  local v = Vector(rf32(buf), rf32(buf + 4))
  B.free(buf)
  return v
end)

-- Entity:MakeBloodPoof(position = its own, color = default, scale = 1) / :MakeGroundPoof(...) -> the effect
--   Entity_Effect* Entity::Make...Poof(Vector* pos, ColorMod* color, float scale in xmm2)
local function poof(name, va)
  method("Entity", name, function(self, pos, color, scale)
    local a = this(self, name)
    if type(pos) ~= "userdata" then pos = self.Position end
    if type(color) ~= "userdata" then color = Color(1, 1, 1, 1) end
    return wrap("EntityEffect", (call(va, { ecx = a, xmm2 = type(scale) == "number" and scale or 1.0 }, ptr(pos), ptr(color))))
  end)
end
poof("MakeBloodPoof", 0x006b66c0)
poof("MakeGroundPoof", 0x006b6550)

-- Entity:ForceCollide(other, low) -> boolean: run the collision of the two now
--   static bool Entity::ForceCollide(Entity* in ecx, Entity* in edx, bool low), the caller's stack (asm: plain ret)
method("Entity", "ForceCollide", function(self, other, low)
  local a, b = this(self, "ForceCollide"), type(other) == "userdata" and ptr(other) or 0
  if b == 0 then error("bad argument #1 to 'ForceCollide' (Entity expected, got " .. type(other) .. ")", 2) end
  return (call(0x006b2f50, { ecx = a, edx = b }, bool_arg(low, 2, "ForceCollide") and 1 or 0) & 0xff) ~= 0
end)

------------------------------------------------------------------------------
-- written over the game's own Lua API
------------------------------------------------------------------------------
-- EntityNPC:FireProjectilesEx(position, velocity, mode, params) -> the projectiles it fired
-- EntityNPC:FireBossProjectilesEx(count, target, trajectoryModifier, params) -> the same
-- The game's FireProjectiles returns nothing. The projectiles in the room are
-- listed before and after, and the new ones are what the call fired.
local function fired_by(name, plain)
  method("EntityNPC", name, function(self, ...)
    local before = {}
    for _, e in ipairs(Isaac.FindByType(EntityType.ENTITY_PROJECTILE, -1, -1, false, false)) do before[GetPtrHash(e)] = true end
    self[plain](self, ...)
    local out = {}
    for _, e in ipairs(Isaac.FindByType(EntityType.ENTITY_PROJECTILE, -1, -1, false, false)) do
      if not before[GetPtrHash(e)] then out[#out + 1] = e:ToProjectile() end
    end
    return out
  end)
end
fired_by("FireProjectilesEx", "FireProjectiles")
fired_by("FireBossProjectilesEx", "FireBossProjectiles")

-- EntityPlayer:GetPlayerIndex() -> the player's place in the game's list of players (0 for the first)
method("EntityPlayer", "GetPlayerIndex", function(self)
  local me, g = GetPtrHash(self), Game()
  for i = 0, g:GetNumPlayers() - 1 do
    if GetPtrHash(g:GetPlayer(i)) == me then return i end
  end
  return 0
end)

-- Isaac.GetCursorSprite() -> the mouse cursor's Sprite, the game's own
--   Manager + 0x4b2a8: the sprite the game loads "gfx/ui/cursor.anm2" into at start-up
--   (asm, 0x009528e4: lea ecx, [manager + 0x4b2a8]; call ANM2::Load)
T.static(Isaac, "Isaac", "GetCursorSprite", function()
  local manager = r32(0x00c7169c)
  if manager == 0 then return nil end
  return wrap("Sprite", manager + 0x4b2a8)
end)

-- ProjectileParams.Damage: the damage of the projectiles fired with these parameters.
-- The game has the field and never gave it to Lua: 0x9c, a float, which this build's
-- Entity_NPC::FireProjectiles reads (asm, 0x006ccb64: movss xmm0, [params + 0x9c]); every
-- field before it that the game does expose is where REPENTOGON has it.
if T.property then
  T.property("ProjectileParams", "Damage",
    function(self) return rf32(ptr(self) + 0x9c) end,
    function(self, v)
      if type(v) ~= "number" then error("bad value for 'Damage' (number expected, got " .. type(v) .. ")", 2) end
      wf32(ptr(self) + 0x9c, v)
    end)
end
