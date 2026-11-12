-- rgon.lua -- a REPENTOGON-compatible layer for the browser port (round 102).
--
-- REPENTOGON itself cannot run on this engine (it is built for another version
-- of the game and patches machine code at run time; see host_rgon.c). This
-- file rebuilds its Lua surface against the game the port runs, v1.9.7.17,
-- one function and one callback at a time. Nothing here is REPENTOGON's code:
-- its documentation and source say what each name does, and each one is
-- written again for this executable. Only its enum tables are taken as they
-- are (enums_ex.lua, shipped beside this file under its own licence), because
-- a mod and this layer have to agree on the numbers.
--
-- The engine runs this file once per Lua state, before the first mod's own
-- chunk, and passes it the bridge (`...`). The bridge never becomes a global.
--
-- Addresses and offsets below are this executable's. Where one came from is
-- noted beside it: "reg" is the game's own Lua registration at 0x00866960
-- (`push <method>; push <"Name">`), "sig" a REPENTOGON signature that matches
-- this build exactly once, "asm" read off the disassembly.

local B = ...
if type(B) ~= "table" or B.API ~= 1 then error("rgon: no bridge (API 1) from the engine") end
local ptr, ud, r8, r32, ri32, rf32, w8, w32, wf32 = B.ptr, B.ud, B.r8, B.r32, B.ri32, B.rf32, B.w8, B.w32, B.wf32
local call, cfn, obj, hook, f2i, i2f, log = B.call, B.cfn, B.obj, B.hook, B.f2i, B.i2f, B.log
-- ISAAC_RGON_HOOKS=0: the layer with no hook armed (its functions stay; its hooked callbacks never
-- fire). ISAAC_RGON_HOOKS=<a>-<b>[,<c>-<d>]: only the slots in those ranges. For telling a fault of
-- a hook from a fault of anything else, and then which hook.
do
  local only = B.env("ISAAC_RGON_HOOKS")
  if only == "0" then
    hook = function() end
    log("ISAAC_RGON_HOOKS=0: no hook is armed; the callbacks that need one will not fire")
  elseif only then
    local ranges, arm_slot = {}, B.hook
    for a, b in only:gmatch("(%d+)%-(%d+)") do ranges[#ranges + 1] = { tonumber(a), tonumber(b) } end
    hook = function(slot, before, after)
      for _, r in ipairs(ranges) do
        if slot >= r[1] and slot <= r[2] then return arm_slot(slot, before, after) end
      end
    end
    log("ISAAC_RGON_HOOKS=" .. only .. ": only those hook slots are armed")
  end
end
local rawget, rawset, type, pairs, ipairs, getmetatable, tostring, select = rawget, rawset, type, pairs, ipairs, getmetatable, tostring, select
local mathtype = math.type

-- The REPENTOGON release whose API this follows. A mod asks with
-- REPENTOGON.MeetsVersion("1.0.12") and the like.
local VERSION = "1.1.2"

local R = {
  Real = true,                 -- a mod reads this to tell a working API from a stub of its own
  Name = "REPENTOGON",
  Version = VERSION,
  Extras = { Misc = {} },
  Browser = true,              -- this layer, not the native REPENTOGON
  Implemented = {},            -- name -> true for what the layer provides (Class.Method, MC_X)
}
function R.MeetsVersion(target)
  local want, have = {}, {}
  for n in tostring(target):gmatch("%d+") do want[#want + 1] = tonumber(n) end
  for n in VERSION:gmatch("%d+") do have[#have + 1] = tonumber(n) end
  for i = 1, math.max(#want, #have) do
    local w, h = want[i] or 0, have[i] or 0
    if h ~= w then return h > w end
  end
  return true
end

------------------------------------------------------------------------------
-- enums: REPENTOGON's own table of names and numbers, unchanged
------------------------------------------------------------------------------
do
  local chunk, why = B.load("enums_ex.lua")
  if chunk then
    local ok, err = pcall(chunk)
    if not ok then log("enums_ex.lua stopped: " .. tostring(err)) end
  else
    log("enums_ex.lua is missing (" .. tostring(why) .. "): the new callbacks have no names")
  end
end

------------------------------------------------------------------------------
-- classes
------------------------------------------------------------------------------
-- A luabridge class is a global static table whose metatable holds the class
-- table (__class) objects carry and the one const objects carry (__const).
-- A class the game gives no static table (Game is a function that answers the
-- one Game object) is reached through an object of it: an object's metatable
-- is its class table, or the const one, and each names the other.
local SAMPLE = { Game = function() return Game() end, ItemConfig = function() return Isaac.GetItemConfig() end }
-- and a class the game registers inside a namespace table has its static table there
local INSIDE = { ActiveItemDesc = "PlayerTypes" }
local function class_tables(name)
  local static = rawget(_G, name)
  if static == nil and INSIDE[name] then
    local ns = rawget(_G, INSIDE[name])
    static = type(ns) == "table" and rawget(ns, name) or nil
  end
  local mt = type(static) == "table" and getmetatable(static)
  if mt then return rawget(mt, "__class"), rawget(mt, "__const") end
  local make = SAMPLE[name]
  local sample = make and make()
  local omt = sample and getmetatable(sample)
  if type(omt) ~= "table" then return nil end
  return rawget(omt, "__class") or omt, rawget(omt, "__const") or omt
end
local CLASS = setmetatable({}, { __index = function(t, name)
  local c = class_tables(name)
  if not c then error("rgon: the game has no class " .. tostring(name), 2) end
  t[name] = c
  return c
end })

-- method("EntityPlayer", "GetHealthType", function(self) ... end)
-- luabridge's __index only hands out C functions, so the Lua body goes in
-- wrapped (bridge.cfn). Never over a name the game already has.
local function method(cls, name, f)
  local c, const = class_tables(cls)
  if not c then log("no class " .. cls .. " for " .. name) return end
  if rawget(c, name) ~= nil then log(cls .. "." .. name .. " already exists; left alone") return end
  local wrapped = cfn(f)
  rawset(c, name, wrapped)
  if const and rawget(const, name) == nil then rawset(const, name, wrapped) end
  R.Implemented[cls .. "." .. name] = true
end
-- property("ProjectileParams", "Damage", get, set): a field read and written
-- as object.Name. luabridge keeps a class's properties in two tables of its
-- class table, __propget and __propset, each name a C function there: the
-- getter is called with the object, the setter with the object and the value.
local function property(cls, name, get, set)
  local c, const = class_tables(cls)
  local pg, ps = c and rawget(c, "__propget"), c and rawget(c, "__propset")
  if type(pg) ~= "table" or type(ps) ~= "table" then log("no property tables on " .. cls .. " for " .. name) return end
  if rawget(pg, name) ~= nil then log(cls .. "." .. name .. " already exists; left alone") return end
  local g = cfn(get)
  rawset(pg, name, g)
  if set then rawset(ps, name, cfn(set)) end
  local cpg = const and const ~= c and rawget(const, "__propget")
  if type(cpg) == "table" and rawget(cpg, name) == nil then rawset(cpg, name, g) end
  R.Implemented[cls .. "." .. name] = true
end
-- a function of a namespace table (Isaac.Foo) or of a class's static table
local function static(tbl, tname, name, f)
  if rawget(tbl, name) ~= nil then log(tname .. "." .. name .. " already exists; left alone") return end
  rawset(tbl, name, f)
  R.Implemented[tname .. "." .. name] = true
end

-- the vtable of luabridge::UserdataPtr, off a userdata the game made itself
local VT_PTR
local function vt_ptr()
  if not VT_PTR then
    local g = Game()
    VT_PTR = r32(ud(g))
  end
  return VT_PTR
end
-- a Lua object for a game object at `address`
local function wrap(cls, address)
  if address == 0 then return nil end
  return obj(CLASS[cls], address, vt_ptr())
end

local function this(self, what)
  local p = ptr(self)
  if p == 0 then error("rgon: " .. what .. " called without its object (use ':')", 3) end
  return p
end

------------------------------------------------------------------------------
-- addresses in v1.9.7.17
------------------------------------------------------------------------------
local VA = {
  Player_GetHealthType = 0x007cafe0,      -- sig  __thiscall int Entity_Player::GetHealthType()
  CoopBabiesOnly       = 0x009ba980,      -- sig  static bool PlayerManager::CoopBabiesOnly()
}

------------------------------------------------------------------------------
-- callbacks
------------------------------------------------------------------------------
-- The game's own main.lua keeps every callback list in Lua and tells the
-- engine which built-in ones are in use. A number from 1000 up is one of this
-- layer's: the engine's switch has no slot for it (and must not be asked), and
-- the layer wants to know instead, to arm the hook behind it only while a mod
-- listens.
local listening = {}            -- callback id -> true while a mod has a function on it
local arm                       -- (set below) re-arm the hooks after a change
do
  local engine_state = Isaac.SetBuiltInCallbackState
  rawset(Isaac, "SetBuiltInCallbackState", function(id, on)
    if type(id) == "number" and id >= 1000 then
      listening[id] = on and true or nil
      if arm then arm(id) end
      return
    end
    return engine_state(id, on)
  end)
end

-- A mod listening on a callback the layer does not fire yet would wait for
-- ever, in silence. It is said once per mod and callback, in the game's own
-- log, where the mod's author and drive_stress.mjs both read it.
do
  local add, told = Isaac.AddPriorityCallback, {}
  rawset(Isaac, "AddPriorityCallback", function(mod, id, ...)
    if type(id) == "number" and id >= 1000 and not R.Implemented[id] then
      local who = type(mod) == "table" and tostring(mod.Name) or "?"
      if not told[who .. id] then
        told[who .. id] = true
        local name = "?"
        for k, v in pairs(ModCallbacks) do if v == id then name = k break end end
        Isaac.DebugString("[REPENTOGON] not implemented: callback " .. name .. " (" .. id .. "), asked for by " .. who)
      end
    end
    return add(mod, id, ...)
  end)
end

-- How a hook fires its callback. api_callbacks.lua replaces the runner with one
-- that follows REPENTOGON's rules (run_by_rule); without that part, the game's.
local RunWithParam = Isaac.RunCallbackWithParam
local run_by_rule
local function run(id, param, ...)
  return (run_by_rule or RunWithParam)(id, param, ...)
end

-- hook slots (lift_patches.py RGON_HOOKS): slot -> the callbacks that need it
local SLOT = {
  AddCollectible = 0, AddTrinket = 1, PickupMorph = 2, HudRender = 3, HudUpdate = 4, HudPostUpdate = 5,
  LevelSetStage = 6, MusicPlay = 7, MusicCrossfade = 8, SfxPlay = 9, GameEnd = 10,
}
local HOOKS = {}                -- slot -> { ids = {...}, before = f, after = f }
local function define(slot, ids, before, after)
  HOOKS[slot] = { ids = ids, before = before, after = after }
  for _, id in ipairs(ids) do R.Implemented[id] = true end
end
arm = function(changed)
  for slot, h in pairs(HOOKS) do
    local hit = changed == nil
    local on = false
    for _, id in ipairs(h.ids) do
      if id == changed then hit = true end
      if listening[id] then on = true end
    end
    if hit then
      if on then hook(slot, h.before, h.after) else hook(slot, nil, nil) end
    end
  end
end

local function bool_at(a) return r8(a) ~= 0 end

-- MC_PRE_ADD_COLLECTIBLE (1004) / MC_POST_ADD_COLLECTIBLE (1005)
-- Entity_Player::AddCollectible(type, charge, firstTime, slot, varData, pool), thiscall, ret 0x18
--   0x0075f0e0 (reg); its tail at 0x00762d49 is `ret 0x18` (asm)
-- before: (type, charge, firstTime, slot, varData, player), param = type
--   -> false: the item is not added; an integer: that item instead;
--      a table {type, charge, firstTime, slot, varData}: those instead
-- after:  the same six, with what was actually added
define(SLOT.AddCollectible, { 1004, 1005 }, function(self, esp)
  local t, charge, first, slot, var = ri32(esp + 4), ri32(esp + 8), bool_at(esp + 12), ri32(esp + 16), ri32(esp + 20)
  local player = wrap("EntityPlayer", self)
  if listening[1004] then
    local res = run(1004, t, t, charge, first, slot, var, player)
    if res == false then return true, 0, 0x18 end
    if mathtype(res) == "integer" then
      t = res
    elseif type(res) == "table" then
      if mathtype(res[1]) == "integer" then t = res[1] end
      if mathtype(res[2]) == "integer" then charge = res[2] end
      if type(res[3]) == "boolean" then first = res[3] end
      if mathtype(res[4]) == "integer" then slot = res[4] end
      if mathtype(res[5]) == "integer" then var = res[5] end
    end
    w32(esp + 4, t) w32(esp + 8, charge) w32(esp + 12, first and 1 or 0) w32(esp + 16, slot) w32(esp + 20, var)
  end
  return { t, charge, first, slot, var, player }
end, function(self, esp, eax, a)
  if a and listening[1005] then run(1005, a[1], a[1], a[2], a[3], a[4], a[5], a[6]) end
end)

-- MC_PRE_ADD_TRINKET (1014)
-- Entity_Player::AddTrinket(trinket, firstTime), thiscall, ret 8 -- 0x00771d30 (reg, asm)
-- (player, trinket, firstTime), param = trinket
--   -> false: not added; an integer: that trinket; a table {trinket, firstTime}
define(SLOT.AddTrinket, { 1014 }, function(self, esp)
  local t, first = ri32(esp + 4), bool_at(esp + 8)
  if t <= 0 then return end
  local res = run(1014, t, wrap("EntityPlayer", self), t, first)
  if res == false then return true, 0, 8 end
  if mathtype(res) == "integer" then
    w32(esp + 4, res)
  elseif type(res) == "table" then
    if mathtype(res[1]) == "integer" then w32(esp + 4, res[1]) end
    if type(res[2]) == "boolean" then w32(esp + 8, res[2] and 1 or 0) end
  end
end, nil)

-- MC_PRE_PICKUP_MORPH (1213) / MC_POST_PICKUP_MORPH (1215)
-- Entity_Pickup::Morph(type, variant, subType, keepPrice, keepSeed, ignoreModifiers), thiscall,
--   ret 0x18 -- 0x006e30a0 (reg), `ret 0x18` at 0x006e37f6 (asm)
-- before: (pickup, type, variant, subType, keepPrice, keepSeed, ignoreModifiers), no param
--   -> false: no morph; a table of 3 {type, variant, subType} or of all 6
-- after:  (pickup, the type, variant and subType it had BEFORE, keepPrice, keepSeed, ignoreModifiers)
define(SLOT.PickupMorph, { 1213, 1215 }, function(self, esp)
  local pickup = wrap("EntityPickup", self)
  local keep = { bool_at(esp + 16), bool_at(esp + 20), bool_at(esp + 24) }
  local was = { pickup.Type, pickup.Variant, pickup.SubType }
  if listening[1213] then
    local res = run(1213, nil, pickup, ri32(esp + 4), ri32(esp + 8), ri32(esp + 12), keep[1], keep[2], keep[3])
    if res == false then return true, 0, 0x18 end
    if type(res) == "table" and (#res == 3 or #res == 6) then
      for i = 1, 3 do if mathtype(res[i]) == "integer" then w32(esp + 4 * i, res[i]) end end
      if #res == 6 then
        for i = 4, 6 do if type(res[i]) == "boolean" then w32(esp + 4 * i, res[i] and 1 or 0) end end
      end
    end
  end
  return { pickup, was[1], was[2], was[3], keep[1], keep[2], keep[3] }
end, function(self, esp, eax, a)
  if a and listening[1215] then run(1215, nil, a[1], a[2], a[3], a[4], a[5], a[6], a[7]) end
end)

-- MC_HUD_RENDER (1022) before the HUD is drawn, MC_POST_HUD_RENDER (1024) after
-- HUD::Render(), thiscall, plain ret -- 0x009a3eb0 (reg, asm)
define(SLOT.HudRender, { 1022, 1024 },
  function() if listening[1022] then run(1022, nil) end end,
  function() if listening[1024] then run(1024, nil) end end)
-- MC_HUD_UPDATE (1020), MC_POST_HUD_UPDATE (1021): both BEFORE the function they are named for
-- HUD::Update() 0x009a2990, HUD::PostUpdate() 0x009a2b30 (reg)
define(SLOT.HudUpdate, { 1020 }, function() run(1020, nil) end, nil)
define(SLOT.HudPostUpdate, { 1021 }, function() run(1021, nil) end, nil)

-- MC_PRE_SFX_PLAY (1030) / MC_POST_SFX_PLAY (1031)
-- SFXManager::Play(id, volume, frameDelay, loop, pitch, pan), thiscall, ret 0x18 -- 0x0092dc30 (reg, asm)
-- (id, volume, frameDelay, loop, pitch, pan), param = id
--   before -> false: silence; a table of all six: those instead
define(SLOT.SfxPlay, { 1030, 1031 }, function(self, esp)
  local id, vol, delay, loop, pitch, pan = ri32(esp + 4), rf32(esp + 8), ri32(esp + 12), bool_at(esp + 16), rf32(esp + 20), rf32(esp + 24)
  if listening[1030] then
    local res = run(1030, id, id, vol, delay, loop, pitch, pan)
    if res == false then return true, 0, 0x18 end
    if type(res) == "table" and #res == 6 then
      id, vol, delay, loop, pitch, pan = res[1] // 1, res[2] + 0.0, res[3] // 1, res[4] and true or false, res[5] + 0.0, res[6] + 0.0
      w32(esp + 4, id) wf32(esp + 8, vol) w32(esp + 12, delay) w32(esp + 16, loop and 1 or 0) wf32(esp + 20, pitch) wf32(esp + 24, pan)
    end
  end
  return { id, vol, delay, loop, pitch, pan }
end, function(self, esp, eax, a)
  if a and listening[1031] then run(1031, a[1], a[1], a[2], a[3], a[4], a[5], a[6]) end
end)

-- MC_PRE_MUSIC_PLAY (1034)
-- MusicManager::Play(id, volume) 0x007e1d50, ::Crossfade(id, fadeRate) 0x007e1e70, thiscall, ret 8 (reg, asm)
-- (id, volume or fadeRate, isFade), param = id
--   -> false: nothing plays; an integer: that track; a table {id, volume or fadeRate}
local function music(is_fade)
  return function(self, esp)
    local id, v = ri32(esp + 4), rf32(esp + 8)
    local res = run(1034, id, id, v, is_fade)
    if res == false then return true, 0, 8 end
    if mathtype(res) == "integer" then
      w32(esp + 4, res)
    elseif type(res) == "table" and #res == 2 then
      w32(esp + 4, res[1] // 1) wf32(esp + 8, res[2] + 0.0)
    end
  end
end
define(SLOT.MusicPlay, { 1034 }, music(false), nil)
define(SLOT.MusicCrossfade, { 1034 }, music(true), nil)

arm(nil)

------------------------------------------------------------------------------
-- functions
------------------------------------------------------------------------------

-- Level:GetDimension() -> Dimension. The level does not say which dimension
-- the current room is in; its room list does: the current room's descriptor
-- is the one GetRoomByIdx returns for exactly one dimension.
method("Level", "GetDimension", function(self)
  local idx = self:GetCurrentRoomIndex()
  local here = GetPtrHash(self:GetRoomByIdx(idx, -1))
  for dim = 0, 2 do
    if GetPtrHash(self:GetRoomByIdx(idx, dim)) == here then return dim end
  end
  return 0
end)

-- EntityPlayer:GetHealthType() -> HealthType (red, soul, lost, coin, bone, keeper...)
method("EntityPlayer", "GetHealthType", function(self)
  return (call(VA.Player_GetHealthType, this(self, "GetHealthType")))
end)

-- Isaac.CanStartTrueCoop(): a second player can still join as a full character
-- (the game says so itself; a bool comes back in AL, so only the low byte counts)
static(Isaac, "Isaac", "CanStartTrueCoop", function()
  return (call(VA.CoopBabiesOnly, nil) & 0xff) == 0
end)

-- Sprite:GetLayer(id or name) / Sprite:GetAllLayers() -> LayerState
-- A sprite (ANM2) holds an array of layer states. The offsets are checked
-- against this build through the game's own Sprite property getters, which
-- read the same object: Offset 0x94, Scale 0x9c, Rotation 0xa4, Color 0xa8,
-- FlipX 0x100, FlipY 0x101, PlaybackSpeed 0x104 (asm, getters at 0x0049cb40,
-- 0x00417200, 0x00417210, 0x00407410, 0x00407420, 0x00407430, 0x00456360) --
-- all where REPENTOGON has them, so the layer array is taken to be where it
-- has it too (0x7c, count at 0x80), and that is checked on every call: each
-- layer state points back at its sprite (+4) and at a layer record whose id
-- is its index.
do
  local ANM2_LAYERS, ANM2_LAYER_COUNT = 0x7c, 0x80
  local LS = { size = 0xa0, data = 0x00, anm2 = 0x04, path = 0x08, wrapS = 0x28, wrapT = 0x2c, flipX = 0x32, flipY = 0x33,
               sz = 0x34, rot = 0x3c, pos = 0x40, color = 0x48, visible = 0x74, flags = 0x8c, crop = 0x90 }
  local LD = { id = 0x00, name = 0x08, default_path = 0x20 }
  local stdstr = B.stdstr

  local function layers_of(sprite, what)
    local a = this(sprite, what)
    local n, base = r32(a + ANM2_LAYER_COUNT), r32(a + ANM2_LAYERS)
    if n == 0 or base == 0 then return a, 0, 0 end
    if n > 64 or r32(base + LS.anm2) ~= a or r32(r32(base + LS.data) + LD.id) ~= 0 then
      error("rgon: this sprite's layers are not laid out as expected (" .. what .. ")", 3)
    end
    return a, n, base
  end

  local L = {}                                   -- LayerState's methods
  local function at(self) local p = ptr(self) if p == 0 then error("rgon: LayerState method called without its object", 3) end return p end
  local function vec(a) return Vector(rf32(a), rf32(a + 4)) end
  local function setvec(a, v) wf32(a, v.X) wf32(a + 4, v.Y) end
  function L:GetLayerID() return r32(r32(at(self) + LS.data) + LD.id) end
  function L:GetName() return stdstr(r32(at(self) + LS.data) + LD.name) end
  function L:GetSpritesheetPath() return stdstr(at(self) + LS.path) end
  function L:GetDefaultSpritesheetPath() return stdstr(r32(at(self) + LS.data) + LD.default_path) end
  function L:IsVisible() return r8(at(self) + LS.visible) ~= 0 end
  function L:SetVisible(v) w8(at(self) + LS.visible, v and 1 or 0) end
  function L:GetSize() return vec(at(self) + LS.sz) end
  function L:SetSize(v) setvec(at(self) + LS.sz, v) end
  function L:GetRotation() return rf32(at(self) + LS.rot) end
  function L:SetRotation(r) wf32(at(self) + LS.rot, r) end
  function L:GetPos() return vec(at(self) + LS.pos) end
  function L:SetPos(v) setvec(at(self) + LS.pos, v) end
  function L:GetCropOffset() return vec(at(self) + LS.crop) end
  function L:SetCropOffset(v) setvec(at(self) + LS.crop, v) end
  function L:GetRenderFlags() return r32(at(self) + LS.flags) end
  function L:SetRenderFlags(f) w32(at(self) + LS.flags, f) end
  function L:GetWrapSMode() return r32(at(self) + LS.wrapS) end
  function L:SetWrapSMode(m) w32(at(self) + LS.wrapS, m) end
  function L:GetWrapTMode() return r32(at(self) + LS.wrapT) end
  function L:SetWrapTMode(m) w32(at(self) + LS.wrapT, m) end
  function L:GetFlipX() return r8(at(self) + LS.flipX) ~= 0 end
  function L:SetFlipX(v) w8(at(self) + LS.flipX, v and 1 or 0) end
  function L:GetFlipY() return r8(at(self) + LS.flipY) ~= 0 end
  function L:SetFlipY(v) w8(at(self) + LS.flipY, v and 1 or 0) end
  -- a Color is the game's ColorMod, eleven floats; the value object holds its own copy
  function L:GetColor()
    local c, from = Color(1, 1, 1, 1), at(self) + LS.color
    local to = ptr(c)
    for i = 0, 40, 4 do w32(to + i, r32(from + i)) end
    return c
  end
  function L:SetColor(c)
    local from, to = ptr(c), at(self) + LS.color
    if from == 0 then error("rgon: LayerState:SetColor wants a Color", 2) end
    for i = 0, 40, 4 do w32(to + i, r32(from + i)) end
  end
  local LAYER_MT = { __index = L, __type = "LayerState", __name = "LayerState",
    __eq = function(a, b) return ptr(a) == ptr(b) end,
    __tostring = function(self) return "LayerState(" .. tostring(L.GetLayerID(self)) .. ")" end }
  local function layer(address) return obj(LAYER_MT, address, vt_ptr()) end
  for k in pairs(L) do R.Implemented["LayerState." .. k] = true end

  method("Sprite", "GetLayer", function(self, which)
    local _, n, base = layers_of(self, "GetLayer")
    if type(which) == "string" then
      for i = 0, n - 1 do
        local l = base + i * LS.size
        if stdstr(r32(l + LS.data) + LD.name) == which then return layer(l) end
      end
      return nil
    end
    if mathtype(which) ~= "integer" then error("bad argument #2 to 'GetLayer' (a layer id or name expected)", 2) end
    if which < 0 or which >= n then return nil end
    return layer(base + which * LS.size)
  end)
  method("Sprite", "GetAllLayers", function(self)
    local _, n, base = layers_of(self, "GetAllLayers")
    local out = {}
    for i = 0, n - 1 do out[i + 1] = layer(base + i * LS.size) end
    return out
  end)
end

-- EntityPickup:IsBlind(forcedOnly = true), :GetCollectibleCycle()
-- The pickup's fields around these are where REPENTOGON has them: the game's
-- own getters in this build read Charge 0x524, OptionsPickupIndex 0x528,
-- Touched 0x52c, Price 0x534, AutoUpdatePrice 0x538, ShopItemId 0x53c,
-- Timeout 0x540, Wait 0x544 (asm; 0x007e9390, 0x005b1980, 0x007e93b0,
-- 0x00431740, 0x007e93a0, 0x007e93c0, 0x005b1940, 0x0085e440), and Price and
-- Timeout are the two it names. So the forced-blind flag is taken at 0x52e,
-- between Touched and Price, and the cycle list at 0x5a0 with its count at
-- 0x5c0 (test_layer.lua checks the list against a Glitched Crown pedestal).
do
  local FORCE_BLIND, CYCLE, CYCLE_COUNT = 0x52e, 0x5a0, 0x5c0
  local QUESTION = "gfx/items/collectibles/questionmark.png"
  method("EntityPickup", "IsBlind", function(self, forcedOnly)
    local a = this(self, "IsBlind")
    if self.Variant ~= PickupVariant.PICKUP_COLLECTIBLE then return false end
    if r8(a + FORCE_BLIND) ~= 0 then return true end
    if forcedOnly == false then
      -- the pedestal is drawn as a question mark (Curse of the Blind and the like)
      local l = self:GetSprite():GetLayer(1)
      return l ~= nil and l:GetSpritesheetPath():lower() == QUESTION
    end
    return false
  end)
  method("EntityPickup", "GetCollectibleCycle", function(self)
    local a = this(self, "GetCollectibleCycle")
    local n, out = r32(a + CYCLE_COUNT), {}
    if n > 8 then error("rgon: this pickup's item cycle is not laid out as expected", 2) end
    for i = 0, n - 1 do out[i + 1] = r32(a + CYCLE + 4 * i) end
    return out
  end)
end

-- PlayerManager: the players of the run, as REPENTOGON's static table
do
  local PM = {}
  local function players()
    local out, g = {}, Game()
    for i = 0, g:GetNumPlayers() - 1 do out[#out + 1] = g:GetPlayer(i) end
    return out
  end
  PM.GetPlayers = players
  function PM.GetNumPlayers() return Game():GetNumPlayers() end
  function PM.GetPlayer(i) return Game():GetPlayer(i or 0) end
  function PM.FirstCollectibleOwner(id, rng, lazarusShared)
    for _, p in ipairs(players()) do if p:HasCollectible(id, true) then return p end end
    return nil
  end
  function PM.AnyoneHasCollectible(id)
    for _, p in ipairs(players()) do if p:HasCollectible(id) then return true end end
    return false
  end
  function PM.FirstTrinketOwner(id, rng, lazarusShared)
    for _, p in ipairs(players()) do if p:HasTrinket(id, true) then return p end end
    return nil
  end
  function PM.AnyoneHasTrinket(id)
    for _, p in ipairs(players()) do if p:HasTrinket(id) then return true end end
    return false
  end
  function PM.GetNumCollectibles(id)
    local n = 0
    for _, p in ipairs(players()) do n = n + p:GetCollectibleNum(id) end
    return n
  end
  function PM.GetTotalTrinketMultiplier(id)
    local n = 0
    for _, p in ipairs(players()) do n = n + p:GetTrinketMultiplier(id) end
    return n
  end
  function PM.FirstPlayerByType(playerType)
    for _, p in ipairs(players()) do if p:GetPlayerType() == playerType then return p end end
    return nil
  end
  function PM.AnyoneIsPlayerType(playerType) return PM.FirstPlayerByType(playerType) ~= nil end
  function PM.AnyPlayerTypeHasBirthright(playerType)
    for _, p in ipairs(players()) do
      if p:GetPlayerType() == playerType and p:HasCollectible(CollectibleType.COLLECTIBLE_BIRTHRIGHT) then return true end
    end
    return false
  end
  function PM.IsCoopPlay()
    local seen = {}
    local n = 0
    for _, p in ipairs(players()) do
      local c = p.ControllerIndex
      if p.Parent == nil and not seen[c] then seen[c] = true n = n + 1 end
    end
    return n > 1
  end
  if rawget(_G, "PlayerManager") == nil then
    rawset(_G, "PlayerManager", PM)
    for k in pairs(PM) do R.Implemented["PlayerManager." .. k] = true end
  end
end

------------------------------------------------------------------------------
-- the rest of the layer, in parts
------------------------------------------------------------------------------
-- Each part is a sibling file run with this table: the bridge and the helpers
-- above. A part that stops is logged and the others still load.
local T = {
  B = B, R = R, VA = VA, CLASS = CLASS, SLOT = SLOT, HOOKS = HOOKS, listening = listening,
  method = method, static = static, property = property, wrap = wrap, this = this, vt_ptr = vt_ptr,
  define = define, run = run, class_tables = class_tables, bool_at = bool_at,
  rearm = function() arm(nil) end,
}
for _, part in ipairs({ "api_callbacks.lua", "api_lua.lua", "api_data.lua", "api_objects.lua", "api_game.lua", "api_player.lua", "api_sprite.lua", "api_misc.lua", "api_hooks.lua" }) do
  local chunk, why = B.load(part)
  if chunk then
    local ok, err = pcall(chunk, T)
    if not ok then log(part .. " stopped: " .. tostring(err)) end
  elseif not tostring(why):find("^no file") then
    log(part .. " did not load: " .. tostring(why))
  end
  if T.run ~= run then run_by_rule = T.run end
end
arm(nil)

-- ISAAC_RGON_LAB=<file>: a development script run with the same table, for
-- reading the game's memory while working out an offset (dev_dist.py copies
-- lab_*.lua; the published archive has none).
do
  local lab = B.env("ISAAC_RGON_LAB")
  if lab and lab:match("^lab_[%w_]+%.lua$") then
    local chunk, why = B.load(lab)
    if chunk then
      local ok, err = pcall(chunk, T)
      if not ok then log(lab .. " stopped: " .. tostring(err)) end
    else
      log(lab .. ": " .. tostring(why))
    end
  end
end

------------------------------------------------------------------------------
-- probe mode (ISAAC_RGON_PROBE=1): what does a mod reach that is not here?
------------------------------------------------------------------------------
-- A missing name normally ends whatever was running (a nil is called), so a
-- run names one gap and stops. With the probe on, a name the layer does not
-- have answers with a stand-in that can be called, indexed, compared and added
-- to, and is written once to the game's log ("[REPENTOGON] not implemented:
-- EntityPlayer:GetFoo"). The mod then does nonsense, but it keeps going, and
-- one run lists what it reaches. For measuring only: never for playing.
if B.env("ISAAC_RGON_PROBE") == "1" then
  local said = {}
  local function miss(name)
    if not said[name] then
      said[name] = true
      Isaac.DebugString("[REPENTOGON] not implemented: " .. name)
    end
  end
  local standin_mt = {}
  local function standin(name) return setmetatable({ __n = name }, standin_mt) end
  standin_mt.__index = function(t, k)
    local n = rawget(t, "__n") .. "." .. tostring(k)
    miss(n)
    return standin(n)
  end
  standin_mt.__call = function(t) return standin(rawget(t, "__n") .. "()") end
  standin_mt.__newindex = function() end
  standin_mt.__len = function() return 0 end
  standin_mt.__concat = function(a, b) return (type(a) == "table" and "" or tostring(a)) .. (type(b) == "table" and "" or tostring(b)) end
  standin_mt.__tostring = function(t) return "<rgon probe " .. rawget(t, "__n") .. ">" end
  standin_mt.__pairs = function() return function() return nil end end
  standin_mt.__eq = function() return false end
  standin_mt.__lt = function() return false end
  standin_mt.__le = function() return false end
  for _, op in ipairs({ "__add", "__sub", "__mul", "__div", "__mod", "__pow", "__idiv", "__band", "__bor", "__bxor", "__shl", "__shr" }) do
    standin_mt[op] = function() return 0 end
  end
  standin_mt.__unm = function() return 0 end
  standin_mt.__bnot = function() return 0 end

  -- classes: a key no class in the chain knows
  local function wrap_class(c, cname)
    local old = rawget(c, "__index")
    if type(old) ~= "function" then return end
    local function known(k)
      local at = c
      for _ = 1, 8 do
        if rawget(at, k) ~= nil then return true end
        local pg = rawget(at, "__propget")
        if type(pg) == "table" and rawget(pg, k) ~= nil then return true end
        at = rawget(at, "__parent")
        if type(at) ~= "table" then return false end
      end
      return false
    end
    rawset(c, "__index", function(self, k)
      local v = old(self, k)
      if v ~= nil or type(k) ~= "string" or known(k) then return v end
      local n = cname .. ":" .. k
      miss(n)
      return function() return standin(n .. "()") end
    end)
  end
  local names = {}
  for name, st in pairs(_G) do if type(name) == "string" and type(st) == "table" then names[#names + 1] = name end end
  for _, name in ipairs(names) do
    local st = rawget(_G, name)
    local mt = getmetatable(st)
    if type(mt) == "table" then
      local c, const = rawget(mt, "__class"), rawget(mt, "__const")
      if type(c) == "table" then wrap_class(c, name) end
      if type(const) == "table" and const ~= c then wrap_class(const, name) end
      -- the static side (Isaac.Foo, Options.Foo, Vector.Foo): a key nothing answers
      local sold = rawget(mt, "__index")
      if type(sold) == "function" and name ~= "_G" then
        rawset(mt, "__index", function(t, k)
          local v = sold(t, k)
          if v ~= nil or type(k) ~= "string" then return v end
          local pg = rawget(mt, "__propget")
          if type(pg) == "table" and rawget(pg, k) ~= nil then return v end
          local n = name .. "." .. k
          miss(n)
          return standin(n)
        end)
        local snew = rawget(mt, "__newindex")
        if type(snew) == "function" then
          rawset(mt, "__newindex", function(t, k, v)
            local ok = pcall(snew, t, k, v)
            if not ok then miss(name .. "." .. tostring(k) .. " =") end
          end)
        end
      end
    end
  end
  -- globals REPENTOGON defines and the layer does not
  local GLOBALS = {}
  for name in ([[ImGui XMLData EntityConfig RoomConfig RoomConfigHolder PersistentGameData MenuManager MainMenu CharacterMenu
    StatsMenu TitleMenu SaveMenu OptionsMenu ModsMenu SpecialSeedsMenu PauseMenu Console DebugRenderer ProceduralItemManager
    BossPoolManager ItemOverlay RoomTransition NightmareScene StageTransition Minimap Ambush ScoreSheet DailyChallenge Debug
    BlendMode Beam Capsule Image GenericPrompt LootList WeightedOutcomePicker CompletionWidget HistoryHUD LevelGenerator
    EntitySaveStateManager ColorParams FXParams SourceQuad DestinationQuad BestiaryMenu ChallengeMenu CollectionMenu
    ControllerSelectMenu CustomChallengeMenu CutscenesMenu DailyChallengeMenu KeyConfigMenu JoinGameMenu BonusRoundMenu
    OnlineLobbyMenu OnlineMenu Renderer RailManager NullFrame Backdrop Camera]]):gmatch("%a[%w_]*") do
    if rawget(_G, name) == nil then GLOBALS[name] = true end
  end
  local gmt = getmetatable(_G)
  if not gmt then gmt = {} setmetatable(_G, gmt) end
  local gold = rawget(gmt, "__index")
  rawset(gmt, "__index", function(t, k)
    if GLOBALS[k] then miss(k) return standin(k) end
    if type(gold) == "function" then return gold(t, k) end
    if type(gold) == "table" then return gold[k] end
    return nil
  end)
  log("PROBE MODE: missing names answer with stand-ins and are written to the log; this is not a playable game")
end

------------------------------------------------------------------------------
-- the gate
------------------------------------------------------------------------------
-- `REPENTOGON` is a global only for the mods named here: the ones whose use of
-- it the layer covers, checked by running them (drive_stress.mjs phases=tour
-- with the layer installed and no Lua error from the mod). Every other mod
-- reads nil, as it does without the layer, and keeps its own fallback code.
-- ISAAC_RGON_ALLOW=<folder>,<folder> adds mods for a test; =* lets every mod in.
local ALLOW = {
  ["repentogon"] = true,
  -- Each of these was read for every use it makes of REPENTOGON, has all of
  -- them here, and ran clean with the layer (round 102):
  ["aarons-door-overhaul"] = true,        -- Sprite:GetLayer(0):GetSpritesheetPath()
  ["enhanced-boss-bars"] = true,          -- MC_HUD_RENDER
  ["fireworks-for-good-items"] = true,    -- EntityPickup:IsBlind()
  ["reactionapi"] = true,                 -- PlayerManager, Level:GetDimension, IsBlind, GetCollectibleCycle,
                                          -- MC_POST_PICKUP_MORPH, Isaac.CanStartTrueCoop, the enums
  -- Looked at and left out on purpose: mantle-rework and moderrorcontainer
  -- switch themselves off under REPENTOGON because it does their job natively,
  -- which this layer does not; giant_props, andromeda, doki-doki-repentance and
  -- auri want its achievement data; planetarium-chance and
  -- live_planetarium_chance its options and ImGui.
}
do
  local extra = B.env("ISAAC_RGON_ALLOW")
  if extra == "*" then
    ALLOW = true
  elseif extra then
    for name in extra:gmatch("[^,]+") do ALLOW[name:lower()] = true end
  end
end
R.Allowed = ALLOW
B.gate(R, ALLOW)

do
  local n = 0
  for _ in pairs(R.Implemented) do n = n + 1 end
  log(string.format("API %s for game v1.9.7.17: %d name(s) implemented", VERSION, n))
end
