-- api_lua.lua -- the names that need nothing of the engine beyond what the
-- game's own Lua API and a few bytes of an object give: colours, the weighted
-- picker, name lookups over the item configuration, sprite flags.

local T = ...
local B, R, method, static, this = T.B, T.R, T.method, T.static, T.this
local ptr, r8, r32, rf32, w32, wf32, log = B.ptr, B.r8, B.r32, B.rf32, B.w32, B.wf32, B.log
local type, rawget, rawset, getmetatable, setmetatable, ipairs, pairs, tostring = type, rawget, rawset, getmetatable, setmetatable, ipairs, pairs, tostring
local mathtype = math.type

------------------------------------------------------------------------------
-- Color
------------------------------------------------------------------------------
-- A Color is the game's ColorMod: eleven floats, tint (4), colorize (4),
-- offset (3). The sprite constructor in this build writes exactly that shape
-- (0x004074c0: four 1.0 then seven 0.0, twice), and the layout is checked
-- again here, at every start, through the game's own setters: a colour is
-- given eleven different values and each must be found where expected.
do
  local probe = Color(0.5, 0.25, 0.125, 0.0625, 2, 3, 4)
  probe:SetColorize(5, 6, 7, 8)
  local a = ptr(probe)
  local want = { 0.5, 0.25, 0.125, 0.0625, 5, 6, 7, 8, 2, 3, 4 }
  local ok = a ~= 0
  if ok then
    for i = 1, 11 do if rf32(a + (i - 1) * 4) ~= want[i] then ok = false end end
  end
  if ok then
    local function four(self, at)
      local p = this(self, "Color") + at
      return { R = rf32(p), G = rf32(p + 4), B = rf32(p + 8), A = rf32(p + 12) }
    end
    method("Color", "GetTint", function(self) return four(self, 0) end)
    method("Color", "GetColorize", function(self) return four(self, 16) end)
    method("Color", "GetOffset", function(self)
      local p = this(self, "Color:GetOffset") + 32
      return { R = rf32(p), G = rf32(p + 4), B = rf32(p + 8) }
    end)
  else
    log("api_lua: a Color is not laid out as expected; GetTint, GetColorize and GetOffset are left out")
  end

  -- The named colours REPENTOGON gives the Color table: the game's own tear,
  -- projectile and laser tints. The numbers are the API's constants.
  --   name = { R, G, B, A, offset R, G, B, colorize R, G, B, A }
  local PRESETS = {
    TearIpecac = { 0.5, 0.9, 0.4 },
    TearHoming = { 0.4, 0.15, 0.38, 1, 71 / 255, 0, 116 / 255 },
    TearTar = { 0.95, 0.8, 0.6, 1, -150 / 255, -150 / 255, -150 / 255 },
    TearSoy = { 1.5, 2, 2 },
    TearChocolate = { 0.33, 0.18, 0.18, 1, 66 / 255, 40 / 255, 40 / 255 },
    TearAlmond = { 1.8, 1.7, 1 },
    TearScorpio = { 50 / 255, 1, 50 / 255 },
    TearSerpentsKiss = { 0.5, 0.97, 0.5 },
    TearCommonCold = { 0.4, 0.97, 0.5 },
    TearCoal = { 0.2, 0.09, 0.065 },
    TearNumberOne = { 1, 1, 0, 1, 45 / 255, 15 / 255, 0 },
    ProjectileIpecac = { 1, 1, 1, 1, 0, 0, 0, 0.4, 2, 0.5, 1 },
    ProjectileHoming = { 1, 1, 1, 1, 0.26, 0.05, 0.4, 0.8, 0.15, 1, 1 },
    ProjectileTar = { 1, 1, 1, 1, 0, 0, 0, 0.5, 0.5, 0.5, 1 },
    ProjectileSoy = { 1, 1, 1, 1, 0.8, 0.7, 0.5, 1, 1, 1, 1 },
    ProjectileFireWave = { 1, 1, 1, 1, 1, 0.3, 0 },
    ProjectileCageBlue = { 1, 1, 1, 1, 0, 0, 0, 0.8, 1, 0.85, 1 },
    ProjectileMegaSatanBlack = { 1, 1, 1, 1, 0, 0, 0, 0.6, 0.6, 0.6, 1 },
    ProjectileMegaSatanWhite = { 1, 1, 1, 1, 0, 0, 0, 2, 2, 2, 1 },
    ProjectileHushBlue = { 1, 1, 1, 1, 0, 0.2, 0.4 },
    ProjectileHushYellow = { 1, 1, 1, 1, 0.4, 0.2, 0 },
    ProjectileHushGreen = { 1, 1, 1, 1, 0.2, 0.2, 0 },
    LaserIpecac = { 1, 1, 1, 1, 0, 0, 0, 1.8, 3, 1, 1 },
    LaserHoming = { 1, 1, 1, 1, 0, 0, 0, 3, 1, 3.5, 1 },
    LaserSoy = { 1, 1, 1, 1, 0, 0, 0, 5.6, 5, 4.2, 1 },
    LaserChocolate = { 1, 1, 1, 1, 0, 0, 0, 3, 1.7, 1.7, 1 },
    LaserAlmond = { 1, 1, 1, 1, 0, 0, 0, 5.6, 5.2, 3.8, 1 },
    LaserPoison = { 1, 1, 1, 1, 0, 0, 0, 1.8, 4, 1, 1 },
    LaserCoal = { 3, 3, 3, 1, -0.5, -0.5, -0.5, 1.3, 1.2, 1.2, 1 },
    LaserFireMind = { 1, 1, 1, 1, 0, 0, 0, 5, 3, 1, 1 },
    LaserNumberOne = { 1, 1, 1, 1, 0, 0, 0, 5, 4.9, 1, 1 },
    LaserMother = { 1, 1, 1, 1, 0, 0, 0, 2, 2.2, 1, 1 },
    ProjectileCorpsePink = { 1, 1, 1, 1, 0, 0, 0, 4, 3.5, 3.2, 1 },
    ProjectileCorpseWhite = { 1, 1, 1, 1, 0, 0, 0, 2.7, 3, 2, 1 },
    ProjectileCorpseGreen = { 1, 1, 1, 1, 0, 0, 0, 1.5, 2, 1, 1 },
    ProjectileCorpseYellow = { 1, 1, 1, 1, 0, 0, 0, 3.5, 2.5, 1, 1 },
    ProjectileCorpseClusterLight = { 4, 4, 4, 1, 0, 0, 0, 0.63, 0.85, 0.32, 1 },
    ProjectileCorpseClusterDark = { 1, 1, 1, 1, 0, 0, 0, 0.63, 0.85, 0.32, 1 },
  }
  -- A class's static table answers a name it finds in its metatable; that is
  -- where the game's own Color.Default lives.
  local smt = getmetatable(Color)
  if type(smt) == "table" then
    local function preset(name, v)
      if rawget(smt, name) ~= nil then return end
      local c = Color(v[1], v[2], v[3], v[4] or 1, v[5] or 0, v[6] or 0, v[7] or 0)
      c:SetColorize(v[8] or 0, v[9] or 0, v[10] or 0, v[11] or 0)
      rawset(smt, name, c)
      R.Implemented["Color." .. name] = true
    end
    for name, v in pairs(PRESETS) do preset(name, v) end
    if rawget(smt, "EmberFade") == nil then
      local c = Color(1, 1, 1, 1, 1, 0.514, 0.004)
      c:SetTint(0, 0, 0, 1.1)
      rawset(smt, "EmberFade", c)
      R.Implemented["Color.EmberFade"] = true
    end
  end
end

------------------------------------------------------------------------------
-- WeightedOutcomePicker
------------------------------------------------------------------------------
-- The game has this class for its own tables (0x0049cbf0 is its PickOutcome,
-- by signature and by reading it). REPENTOGON hands it to Lua; here the same
-- arithmetic is done in Lua, so no object of the game's is built:
--   total = the sum of the weights; x = the RNG's seed after one xorshift
--   step with its three shifts (on a copy: the RNG itself does not move);
--   roll = x mod total; the outcome is the first whose running sum is above
--   the roll. REPENTOGON's binding then advances the RNG once, and so does this.
-- An RNG is { seed, shift1, shift2, shift3 }, checked below through the game's
-- own RNG:Next() before the class is offered.
do
  local function step(p)
    local x, s1, s2, s3 = r32(p), r32(p + 4) & 31, r32(p + 8) & 31, r32(p + 12) & 31
    x = x ~ (x >> s1)
    x = (x ~ (x << s2)) & 0xffffffff
    x = x ~ (x >> s3)
    return x
  end
  local ok = false
  do
    local rng = RNG()
    rng:SetSeed(0x1234567, 35)
    local p = ptr(rng)
    if p ~= 0 and r32(p) == 0x1234567 then
      local want = step(p)
      rng:Next()
      ok = r32(p) == want and rng:GetSeed() == want
    end
  end
  if not ok then
    log("api_lua: an RNG is not laid out as expected; WeightedOutcomePicker is left out")
  elseif rawget(_G, "WeightedOutcomePicker") == nil then
    local P = {}
    P.__index = P
    P.__type = "WeightedOutcomePicker"
    local function int(v, n, what)
      if mathtype(v) == "float" and v == math.floor(v) then v = math.tointeger(v) end
      if mathtype(v) ~= "integer" then error("bad argument #" .. n .. " to '" .. what .. "' (integer expected, got " .. type(v) .. ")", 3) end
      return v & 0xffffffff
    end
    function P:AddOutcomeWeight(value, weight)
      local list = self._list
      list[#list + 1] = { Value = int(value, 1, "AddOutcomeWeight"), Weight = int(weight, 2, "AddOutcomeWeight") }
    end
    function P:AddOutcomeFloat(value, weight, scale)
      if type(weight) ~= "number" then error("bad argument #2 to 'AddOutcomeFloat' (number expected, got " .. type(weight) .. ")", 2) end
      scale = scale == nil and 100 or int(scale, 3, "AddOutcomeFloat")
      local list = self._list
      list[#list + 1] = { Value = int(value, 1, "AddOutcomeFloat"), Weight = (weight * scale) // 1 & 0xffffffff }
    end
    function P:RemoveOutcome(value)
      local list = self._list
      for i = 1, #list do
        if list[i].Value == value then table.remove(list, i) return end
      end
    end
    function P:ClearOutcomes() self._list = {} end
    function P:GetNumOutcomes() return #self._list end
    function P:GetOutcomes()
      local out = {}
      for i, o in ipairs(self._list) do out[i] = { Value = o.Value, Weight = o.Weight } end
      return out
    end
    function P:PickOutcome(rng)
      local p = ptr(rng)
      if p == 0 then error("bad argument #1 to 'PickOutcome' (RNG expected, got " .. type(rng) .. ")", 2) end
      local list, total = self._list, 0
      for i = 1, #list do total = (total + list[i].Weight) & 0xffffffff end
      local roll = total ~= 0 and step(p) % total or 0
      if roll >= 0x80000000 then roll = roll - 0x100000000 end     -- the game compares signed
      local acc, picked = 0, 0
      for i = 1, #list do
        acc = (acc + list[i].Weight) & 0xffffffff
        local sacc = acc >= 0x80000000 and acc - 0x100000000 or acc
        if roll < sacc then picked = list[i].Value break end
      end
      rng:Next()
      return picked
    end
    rawset(_G, "WeightedOutcomePicker", setmetatable({}, { __call = function() return setmetatable({ _list = {} }, P) end }))
    for k in pairs(P) do if k:sub(1, 2) ~= "__" then R.Implemented["WeightedOutcomePicker." .. k] = true end end
  end
end

------------------------------------------------------------------------------
-- name lookups
------------------------------------------------------------------------------
-- Isaac.GetNullItemIdByName(name) -> the id of a null item (costumes and
-- effects with no pedestal), or -1. The item configuration lists them.
static(Isaac, "Isaac", "GetNullItemIdByName", function(name)
  if type(name) ~= "string" then error("bad argument #1 to 'GetNullItemIdByName' (string expected, got " .. type(name) .. ")", 2) end
  local config = Isaac.GetItemConfig()
  for id = 0, config:GetNullItems().Size - 1 do
    local item = config:GetNullItem(id)
    if item and item.Name == name then return item.ID end
  end
  return -1
end)

------------------------------------------------------------------------------
-- Sprite
------------------------------------------------------------------------------
-- Sprite:GetRenderFlags() / :SetRenderFlags(flags) -- AnimRenderFlags
-- The flags are the sprite's last field, 0x110: the sprite's reset in this
-- build ends `mov [edi+0x10c], -1; mov [edi+0x110], 0` (asm, 0x00408145), and
-- every field before it that the game exposes sits where REPENTOGON has it
-- (see GetLayer in rgon.lua).
do
  local FLAGS = 0x110
  method("Sprite", "GetRenderFlags", function(self) return r32(this(self, "GetRenderFlags") + FLAGS) end)
  method("Sprite", "SetRenderFlags", function(self, flags)
    if mathtype(flags) ~= "integer" then error("bad argument #1 to 'SetRenderFlags' (integer expected, got " .. type(flags) .. ")", 2) end
    w32(this(self, "SetRenderFlags") + FLAGS, flags & 0xffffffff)
  end)
end
