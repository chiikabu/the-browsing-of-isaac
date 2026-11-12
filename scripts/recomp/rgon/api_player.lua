-- api_player.lua -- the player's own fields.
--
-- Entity_Player is the one entity class that grew between the game version
-- REPENTOGON describes (v1.9.7.12) and this one: fields were added along it,
-- so a field's offset here is REPENTOGON's plus an amount that depends on
-- where the field is. The amounts are measured, not assumed
-- (lab_player.lua: a value set through the game's own Lua API, then found in
-- the object; and tools/prop_offsets.py for the fields the game exposes):
--
--   REPENTOGON's offset      moved by   measured at
--   0x0410 .. 0x1368          +0        ControlsEnabled 0x410, max/red/eternal/soul hearts, keys, bombs, coins
--   0x145c .. 0x147c          +4        MaxFireDelay, ShotSpeed, Damage, TearHeight, TearRange
--   0x14bc .. 0x1530          +8        LaserColor, the luck given by donating
--   0x155c .. 0x161c          +12       MoveSpeed, Luck, CanFly, the first active item and its charge, head direction
--   0x16b0 .. 0x16b8          +16       the held trinkets, the collectible counts
--   0x1811 .. 0x1dc0          +20       CanShoot, the D8 multipliers, golden hearts, BabySkin, bone hearts, giga bombs
--
-- The table says where a field would be; it is not the reason a field is
-- offered. REPENTOGON's own names for some offsets do not hold in this build
-- (its place for the urn's souls, moved by 20, holds a float that is 1.0 on a
-- fresh player), so each field below has been seen to work: set through the
-- game's own API and read back here, or the other way round (test_layer2.lua),
-- or watched changing when the game's own mechanic runs (lab_misc.lua: Mega
-- Blast sets 0x18f4 to 450, its fifteen seconds). Still to be shown, and left
-- out until then: the stat modifiers, the item-state and bomb-place cooldowns,
-- the bladder, urethra and conception states, the charges of Dead Eye,
-- Epiphora, the Pony and Maw of the Void, the urn's souls, hallowed ground.

local T = ...
local B, R, method, wrap, this, field = T.B, T.R, T.method, T.wrap, T.this, T.field
local ptr, r8, r32, ri32, rf32, w8, w32, wf32, log = B.ptr, B.r8, B.r32, B.ri32, B.rf32, B.w8, B.w32, B.wf32, B.log
local type, mathtype, ipairs = type, math.type, ipairs
if not field then log("api_player: api_objects.lua did not load; nothing here either") return end

local P = "EntityPlayer"
-- +0
-- The sprites a player carries inside it (lab_misc.lua finds them: a sprite's
-- animation state points back at the sprite). After the entity's own sprite at
-- 0x48 come the body sprite at 0x41c (not loaded for most characters), two
-- crowns, seven charge bars, "blood gush.anm2" at 0xee4 and the held item's
-- sprite at 0xff8 -- where REPENTOGON has them.
if T.inner_sprite then
  T.inner_sprite(P, "GetBodySprite", 0x41c)
  T.inner_sprite(P, "GetBloodGushSprite", 0xee4)
  T.inner_sprite(P, "GetHeldSprite", 0xff8)
end
-- +8
field(P, "GetDonateLuck", "SetDonateLuck", 0x1530 + 8, "i32")
-- +12
-- EntityPlayer:GetActiveItemDesc(slot = primary) -> the ActiveItemDesc of that slot.
-- Four of them in a row, 0x20 bytes each by the game's own accessors
-- (Item 0x00 .. VarData 0x1c); the first is where the game's GetActiveItem(0) reads.
do
  local DESCS, SIZE = 0x1574 + 12, 0x20
  method(P, "GetActiveItemDesc", function(self, slot)
    slot = slot == nil and 0 or slot
    if mathtype(slot) ~= "integer" or slot < 0 or slot > 3 then error("bad argument #1 to 'GetActiveItemDesc' (invalid ActiveSlot)", 2) end
    return wrap("ActiveItemDesc", this(self, "GetActiveItemDesc") + DESCS + SIZE * slot)
  end)
end
-- +16
-- EntityPlayer:GetCollectiblesList() -> { [item id] = how many the player has }, for every id the game knows
do
  local COUNTS = 0x16b8 + 16
  method(P, "GetCollectiblesList", function(self)
    local a = this(self, "GetCollectiblesList") + COUNTS
    local first, last = r32(a), r32(a + 4)
    if last < first or last - first > 0x10000 or (last - first) % 4 ~= 0 then error("rgon: this player's collectible counts are not laid out as expected", 2) end
    local out = {}
    for i = 0, (last - first) // 4 - 1 do out[i] = ri32(first + 4 * i) end
    return out
  end)
end
-- +20
field(P, "IsPostLevelInitFinished", nil, 0x1810 + 20, "bool")
field(P, nil, "SetCanShoot", 0x1811 + 20, "bool")
field(P, "GetMegaBlastDuration", "SetMegaBlastDuration", 0x18e0 + 20, "i32")
field(P, "GetD8DamageModifier", "SetD8DamageModifier", 0x1928 + 20, "f32")
field(P, "GetD8SpeedModifier", "SetD8SpeedModifier", 0x192c + 20, "f32")
field(P, "GetD8RangeModifier", "SetD8RangeModifier", 0x1930 + 20, "f32")
field(P, "GetD8FireDelayModifier", "SetD8FireDelayModifier", 0x1934 + 20, "f32")

------------------------------------------------------------------------------
-- smelted trinkets
------------------------------------------------------------------------------
-- A vector indexed by trinket id of { short count, short golden count },
-- REPENTOGON's 0x1738 moved by 16 (lab_player.lua: empty before, {1, 0} after
-- the Smelter took a Purple Heart, {1, 1} after it took a golden one, and the
-- game's own GetTrinketMultiplier answered 3).
do
  local SMELTED = 0x1738 + 16
  local GOLDEN, MASK = 0x8000, 0x7fff
  local r16, w16, call = B.r16, B.w16, B.call
  local function vector(self, what)
    local a = this(self, what) + SMELTED
    local first, last = r32(a), r32(a + 4)
    if last < first or last - first > 0x8000 or (last - first) % 4 ~= 0 then error("rgon: this player's smelted trinkets are not laid out as expected", 3) end
    return first, (last - first) // 4
  end
  local function int(v, n, what)
    if mathtype(v) == "float" and v == math.floor(v) then v = math.tointeger(v) end
    if mathtype(v) ~= "integer" then error("bad argument #" .. n .. " to '" .. what .. "' (integer expected, got " .. type(v) .. ")", 3) end
    return v
  end
  local function desc(first, id) return { trinketAmount = r16(first + 4 * id), goldenTrinketAmount = r16(first + 4 * id + 2) } end

  -- EntityPlayer:GetSmeltedTrinkets([ids]) -> { [trinket id] = { trinketAmount, goldenTrinketAmount } }
  method(P, "GetSmeltedTrinkets", function(self, ids)
    local first, count = vector(self, "GetSmeltedTrinkets")
    local out = {}
    if type(ids) == "table" then
      for _, id in ipairs(ids) do
        id = int(id, 1, "GetSmeltedTrinkets") & MASK
        if id > 0 and id < count then out[id] = desc(first, id) end
      end
    else
      for id = 1, count - 1 do out[id] = desc(first, id) end
    end
    return out
  end)

  -- EntityPlayer:AddSmeltedTrinket(trinket, firstTime = true) -> boolean
  -- As REPENTOGON: MC_PRE_ADD_TRINKET may refuse or replace it, the count goes
  -- up, the game's own TriggerTrinketAdded runs (0x007ad860) and the trinket's
  -- costume is put on. Not done here: the entry in the item history HUD.
  method(P, "AddSmeltedTrinket", function(self, trinket, first_time)
    trinket = int(trinket, 1, "AddSmeltedTrinket")
    if first_time == nil then first_time = true end
    local config = Isaac.GetItemConfig()
    if trinket <= 0 or config:GetTrinket(trinket & MASK) == nil then return false end
    local M = ModCallbacks
    if T.listening[M.MC_PRE_ADD_TRINKET] then
      local res = T.run(M.MC_PRE_ADD_TRINKET, trinket, self, trinket, first_time)
      if res == false then return false end
      if type(res) == "table" then
        if mathtype(res[1]) == "integer" then trinket = res[1] end
        if type(res[2]) == "boolean" then first_time = res[2] end
      end
    end
    local first, count = vector(self, "AddSmeltedTrinket")
    local id = trinket & MASK
    if id <= 0 or id >= count then return false end
    local at = first + 4 * id + ((trinket & GOLDEN) ~= 0 and 2 or 0)
    w16(at, (r16(at) + 1) & 0xffff)
    call(0x007ad860, ptr(self), trinket & 0xffffffff, first_time and 1 or 0)
    local item = config:GetTrinket(id)
    if item and item.AddCostumeOnPickup then self:AddCostume(item, false) end
    return true
  end)

  -- EntityPlayer:TryRemoveSmeltedTrinket(trinket): one fewer of it, when there is one; the game's own
  -- TriggerTrinketRemoved (0x007adb30) follows
  method(P, "TryRemoveSmeltedTrinket", function(self, trinket)
    trinket = int(trinket, 1, "TryRemoveSmeltedTrinket")
    local first, count = vector(self, "TryRemoveSmeltedTrinket")
    local id = trinket & MASK
    if id <= 0 or id >= count then return end
    local at = first + 4 * id + ((trinket & GOLDEN) ~= 0 and 2 or 0)
    local n = r16(at)
    if n == 0 then return end
    w16(at, n - 1)
    call(0x007adb30, ptr(self), trinket & 0xffffffff)
  end)
end

-- EntityPlayer:HasGoldenTrinket(trinket) -> boolean (0x00771620, a signature that matches once; ret 4)
if T.gcall then T.gcall(P, "HasGoldenTrinket", 0x00771620, "i", "bool") end
