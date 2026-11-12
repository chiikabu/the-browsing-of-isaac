-- api_objects.lua -- fields of the game's entities that REPENTOGON hands to Lua.
--
-- Where an offset comes from. The base Entity (0x000..0x410) has not moved
-- between the game version REPENTOGON describes and this one: every field the
-- game itself exposes (tools/prop_offsets.py reads the offset out of its
-- getter) sits where REPENTOGON has the field of the same name
-- (tools/struct_deltas.py: Variant 0x2c, Visible 0x171, EntityCollisionClass
-- 0x188, PositionOffset 0x34c, CollisionDamage 0x388, Parent 0x3bc ...
-- SpawnerEntity 0x3c8), and every derived class still starts at 0x410. The
-- status countdowns are checked one by one against this build's own
-- Entity::Add* functions: each writes its countdown at the offset used here
-- (AddFreeze 0x218, AddPoison 0x21c, AddSlowing 0x220, AddCharmed 0x224,
-- AddConfusion 0x228, AddMidasFreeze 0x22c, AddFear 0x230, AddBurn 0x234,
-- AddShrink 0x23c) and all of them test the boss cooldown at 0x238; so do the
-- ones REPENTOGON adds (AddBleeding 0x2e8, AddBaited 0x2f4, AddKnockback 0x2f8
-- and its direction 0x308, AddWeakness 0x2fc, AddIce 0x300, AddBrimstoneMark
-- 0x304), and Entity::TakeDamage reads the two damage cooldowns at 0x210 and
-- 0x214.
-- Lying between two checked fields is NOT taken as evidence: REPENTOGON's own
-- table has the poison and burn damage at offsets this build does not use
-- (below). A field is here because this build's code or a test says so.

local T = ...
local B, R, method, static, wrap, this = T.B, T.R, T.method, T.static, T.wrap, T.this
local ptr, r8, r16, r32, ri32, rf32, w8, w16, w32, wf32, log = B.ptr, B.r8, B.r16, B.r32, B.ri32, B.rf32, B.w8, B.w16, B.w32, B.wf32, B.log
local type, rawget, rawset, pairs, ipairs, tostring = type, rawget, rawset, pairs, ipairs, tostring
local mathtype = math.type

local function int_arg(v, n, what)
  if mathtype(v) == "float" and v == math.floor(v) then v = math.tointeger(v) end
  if mathtype(v) ~= "integer" then error("bad argument #" .. n .. " to '" .. what .. "' (integer expected, got " .. type(v) .. ")", 3) end
  return v
end
local function num_arg(v, n, what)
  if type(v) ~= "number" then error("bad argument #" .. n .. " to '" .. what .. "' (number expected, got " .. type(v) .. ")", 3) end
  return v
end
local function bool_arg(v, n, what)
  if type(v) ~= "boolean" then error("bad argument #" .. n .. " to '" .. what .. "' (boolean expected, got " .. type(v) .. ")", 3) end
  return v
end

-- accessors by kind, for a class: field(cls, "GetX", "SetX", offset, kind)
local READ = {
  i32 = function(a) return ri32(a) end,
  u32 = function(a) return r32(a) end,
  f32 = function(a) return rf32(a) end,
  bool = function(a) return r8(a) ~= 0 end,
  i16 = function(a) local v = r16(a) if v >= 0x8000 then v = v - 0x10000 end return v end,
  u16 = function(a) return r16(a) end,
}
local WRITE = {
  i32 = function(a, v, what) w32(a, int_arg(v, 1, what) & 0xffffffff) end,
  u32 = function(a, v, what) w32(a, int_arg(v, 1, what) & 0xffffffff) end,
  f32 = function(a, v, what) wf32(a, num_arg(v, 1, what)) end,
  bool = function(a, v, what) w8(a, bool_arg(v, 1, what) and 1 or 0) end,
  i16 = function(a, v, what) w16(a, int_arg(v, 1, what) & 0xffff) end,
  u16 = function(a, v, what) w16(a, int_arg(v, 1, what) & 0xffff) end,
}
local function field(cls, get, set, offset, kind)
  local rd, wr = READ[kind], WRITE[kind]
  if get then method(cls, get, function(self) return rd(this(self, get) + offset) end) end
  if set then method(cls, set, function(self, v) wr(this(self, set) + offset, v, set) end) end
end
T.field = field

------------------------------------------------------------------------------
-- Entity
------------------------------------------------------------------------------
field("Entity", "GetShadowSize", "SetShadowSize", 0x15c, "f32")
field("Entity", nil, "SetDead", 0x173, "bool")
field("Entity", "GetFireDamageCooldown", "SetFireDamageCooldown", 0x210, "i32")
field("Entity", "GetDamageCountdown", "SetDamageCountdown", 0x214, "i32")
field("Entity", "GetFreezeCountdown", "SetFreezeCountdown", 0x218, "i32")
field("Entity", "GetPoisonCountdown", "SetPoisonCountdown", 0x21c, "i32")
field("Entity", "GetSlowingCountdown", "SetSlowingCountdown", 0x220, "i32")
field("Entity", "GetCharmedCountdown", "SetCharmedCountdown", 0x224, "i32")
field("Entity", "GetConfusionCountdown", "SetConfusionCountdown", 0x228, "i32")
field("Entity", "GetMidasFreezeCountdown", "SetMidasFreezeCountdown", 0x22c, "i32")
field("Entity", "GetFearCountdown", "SetFearCountdown", 0x230, "i32")
field("Entity", "GetBurnCountdown", "SetBurnCountdown", 0x234, "i32")
field("Entity", "GetBossStatusEffectCooldown", "SetBossStatusEffectCooldown", 0x238, "i32")
field("Entity", "GetShrinkCountdown", "SetShrinkCountdown", 0x23c, "i32")
field("Entity", "GetPoisonDamageTimer", "SetPoisonDamageTimer", 0x2e0, "i32")
field("Entity", "GetBurnDamageTimer", "SetBurnDamageTimer", 0x2e4, "i32")
field("Entity", "GetBleedingCountdown", "SetBleedingCountdown", 0x2e8, "i32")
field("Entity", "GetBaitedCountdown", "SetBaitedCountdown", 0x2f4, "i32")
field("Entity", "GetKnockbackCountdown", "SetKnockbackCountdown", 0x2f8, "i32")
field("Entity", "GetWeaknessCountdown", "SetWeaknessCountdown", 0x2fc, "i32")
field("Entity", "GetIceCountdown", "SetIceCountdown", 0x300, "i32")
field("Entity", "GetBrimstoneMarkCountdown", "SetBrimstoneMarkCountdown", 0x304, "i32")
field("Entity", "GetPauseTime", "SetPauseTime", 0x31c, "i32")
field("Entity", "GetSpeedMultiplier", "SetSpeedMultiplier", 0x39c, "f32")
field("Entity", nil, "SetInvincible", 0x3b0, "bool")        -- the game has IsInvincible() itself
-- The damage a poison or a burn deals each time. REPENTOGON has these at 0x278 and
-- 0x27c, which is not where this build keeps them: Entity::AddPoison (0x006ad500) stores
-- its damage argument with `movss [esi+0x320], xmm0` and AddBurn (0x006ae280) at 0x324,
-- and test_layer2.lua reads back what the game's own AddPoison was given.
field("Entity", "GetPoisonDamage", "SetPoisonDamage", 0x320, "f32")
field("Entity", "GetBurnDamage", "SetBurnDamage", 0x324, "f32")

-- Entity:GetMinecart() -> the minecart an entity rides, as an EntityNPC when it is one
method("Entity", "GetMinecart", function(self)
  local e = wrap("Entity", r32(this(self, "GetMinecart") + 0x3d4))
  if not e then return nil end
  return e:ToNPC() or e
end)

------------------------------------------------------------------------------
-- EntitySlot
------------------------------------------------------------------------------
-- The game has slot machines and beggars as a class of their own
-- (Entity_Slot, RTTI) and never gave it to Lua. REPENTOGON does, as
-- EntitySlot, a child of Entity. It is built here the way luabridge builds a
-- class, so a slot can be passed wherever the game's functions take an
-- Entity: a metatable that carries luabridge's identity mark and names Entity
-- as its parent, and whose lookups fall through to Entity's.
--
-- Entity_Slot's own fields, checked against this build's Entity_Slot::Init
-- (0x0065d200, vtable slot 1), which writes state 0x410 := 1 (idle), donation
-- value 0x420 := 0, trigger timer 0x424 := 0, the prize sprite at 0x42c and
-- the prize collectible 0x540 := 0 -- REPENTOGON's offsets, all of them.
do
  local entity_class = T.CLASS.Entity
  local entity_index, entity_newindex = rawget(entity_class, "__index"), rawget(entity_class, "__newindex")
  local mark                                   -- luabridge's identity key: a light userdata key whose value is true
  for k, v in pairs(entity_class) do
    if type(k) == "userdata" and v == true then mark = k break end
  end
  if type(entity_index) ~= "function" or not mark then
    log("api_objects: Entity's class table is not what luabridge makes; EntitySlot is left out")
  else
    local S = {}
    local function at(self, what)
      local p = ptr(self)
      if p == 0 then error("rgon: EntitySlot:" .. what .. " called without its object (use ':')", 3) end
      return p
    end
    local function sfield(get, set, offset, kind)
      local rd, wr = READ[kind], WRITE[kind]
      S[get] = function(self) return rd(at(self, get) + offset) end
      if set then S[set] = function(self, v) wr(at(self, set) + offset, v, set) end end
    end
    sfield("GetState", "SetState", 0x410, "i32")
    sfield("GetPrizeType", "SetPrizeType", 0x414, "i32")
    sfield("GetShellGameAnimationIndex", "SetShellGameAnimationIndex", 0x41a, "i16")
    sfield("GetTimeout", "SetTimeout", 0x41c, "i16")
    sfield("GetDonationValue", "SetDonationValue", 0x420, "i32")
    sfield("GetTriggerTimerNum", "SetTriggerTimerNum", 0x424, "u32")
    sfield("GetTouch", "SetTouch", 0x42a, "u16")
    sfield("GetPrizeCollectible", nil, 0x540, "i32")
    function S:GetPrizeSprite() return wrap("Sprite", at(self, "GetPrizeSprite") + 0x42c) end
    function S:ToSlot() return self end

    local SLOT = {
      __index = function(self, k)
        local m = S[k]
        if m ~= nil then return m end
        return entity_index(self, k)
      end,
      __newindex = entity_newindex,
      __parent = entity_class,
      __propget = {}, __propset = {},
      __type = "EntitySlot", __name = "EntitySlot",
      __eq = rawget(entity_class, "__eq"),
      -- no __gc: the userdata is a vtable word and a pointer and owns nothing. Entity's own
      -- finaliser must not be borrowed: it insists on an object of exactly Entity's class and
      -- raises a Lua error on anything else, and an error from a finaliser surfaces wherever
      -- the collector happens to run -- outside any protected call, that ends the game.
      [mark] = true,
    }
    SLOT.__class = SLOT
    SLOT.__const = SLOT
    local obj, vt_ptr = B.obj, T.vt_ptr
    local function slot_obj(address)
      if address == 0 then return nil end
      return obj(SLOT, address, vt_ptr())
    end
    T.slot_obj = slot_obj
    for k in pairs(S) do R.Implemented["EntitySlot." .. k] = true end

    -- Entity:ToSlot() -> the entity as an EntitySlot, or nil when it is not one (EntityType.ENTITY_SLOT is 6)
    method("Entity", "ToSlot", function(self)
      local a = this(self, "ToSlot")
      if r32(a + 0x28) ~= 6 then return nil end
      return slot_obj(a)
    end)
  end
end

------------------------------------------------------------------------------
-- bombs, tears, lasers, knives, familiars
------------------------------------------------------------------------------
-- Each class below keeps REPENTOGON's offsets only where this build's own
-- getters around the field agree with it (tools/struct_deltas.py):
--   Entity_Tear   0x410..0x460 (Height, FallingSpeed, HomingFriction, WaitFrames, Rotation, KnockbackMultiplier)
--   Entity_Laser  0x458..0x515 (Timeout, SampleLaser, Shrink, HomingLaser, MaxDistance, HomingType, OneHit)
--   Entity_Familiar 0x410, 0xd74..0xd88 (Player, IsFollower, IsDelayed, State)
--   Entity_Effect 0x450..0x460 (State, Timeout, LifeSpan)
-- A REPENTOGON field outside such a stretch is not offered until it has
-- evidence of its own.
