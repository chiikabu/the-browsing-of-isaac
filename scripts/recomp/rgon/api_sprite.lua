-- api_sprite.lua -- a sprite's animation data: its animations, their layers
-- and frames, and the null layers' position this frame.
--
-- A Sprite is the game's ANM2. Its fields the game exposes sit where
-- REPENTOGON has them (rgon.lua, GetLayer), and so, by this build's sprite
-- reset (0x00407f10) and constructor, do the ones around them. The animation
-- structures themselves are checked on every sprite before they are read:
-- the animation the sprite says it is playing (the game's own GetAnimation)
-- must be the name at the head of the record the sprite points at, that
-- record must be one of the sprite's own array of 0x13c-byte records, and
-- its layer count must be the sprite's (the game's own GetLayerCount).
-- test_layer2.lua goes further and compares every animation's length and
-- loop flag with the .anm2 file the sprite was loaded from.
--
--   ANM2:           state +0x30, overlay state +0x50, animations +0x74 (count +0x78)
--   AnimationState: +0x04 the animation, +0x08 each layer's current frame index
--   AnimationData:  +0x00 name, +0x18 layers, +0x1c layer count, +0x30 length, +0x34 loops,
--                   +0x38 layer id -> its place in the layer array (64 ints); 0x13c bytes
--   AnimationLayer: +0x00 id, +0x04 frames, +0x08 frame count, +0x0c visible; 0x10 bytes
--   AnimationFrame: crop 0x00, width 0x08, height 0x0c, pos 0x10, scale 0x18, pivot 0x20,
--                   visible 0x2c, colour 0x30, rotation 0x5c, interpolated 0x60,
--                   start 0x64, end 0x68; 0x6c bytes
--   NullFrame:      pos 0x00, visible 0x0c, scale 0x10, colour 0x18, rotation 0x44

local T = ...
local B, R, method, this = T.B, T.R, T.method, T.this
local ptr, r8, r32, ri32, rf32, w8, w32, log, call, obj = B.ptr, B.r8, B.r32, B.ri32, B.rf32, B.w8, B.w32, B.log, B.call, B.obj
local stdstr, vt_ptr = B.stdstr, T.vt_ptr
local type, pairs, tostring = type, pairs, tostring
local mathtype = math.type

local STATE, OVERLAY, ANIMS, ANIM_COUNT = 0x30, 0x50, 0x74, 0x78
local AD_SIZE, AL_SIZE, AF_SIZE = 0x13c, 0x10, 0x6c

local function vec(a) return Vector(rf32(a), rf32(a + 4)) end
local function color_at(from)
  local c = Color(1, 1, 1, 1)
  local to = ptr(c)
  for i = 0, 40, 4 do w32(to + i, r32(from + i)) end
  return c
end

-- one Lua class per structure: a userdata holding the record's address
local function class(name, methods)
  local mt = { __index = methods, __type = name, __name = name,
    __eq = function(a, b) return ptr(a) == ptr(b) end,
    __tostring = function(self) return name .. string.format("(%08x)", ptr(self)) end }
  for k in pairs(methods) do R.Implemented[name .. "." .. k] = true end
  return function(address)
    if address == 0 then return nil end
    return obj(mt, address, vt_ptr())
  end
end
local function at(self, what)
  local p = type(self) == "userdata" and ptr(self) or 0
  if p == 0 then error("rgon: " .. what .. " called without its object (use ':')", 3) end
  return p
end

local AF = {}
function AF:GetCrop() return vec(at(self, "AnimationFrame:GetCrop")) end
function AF:GetWidth() return rf32(at(self, "AnimationFrame:GetWidth") + 0x08) end
function AF:GetHeight() return rf32(at(self, "AnimationFrame:GetHeight") + 0x0c) end
function AF:GetPos() return vec(at(self, "AnimationFrame:GetPos") + 0x10) end
function AF:GetScale() return vec(at(self, "AnimationFrame:GetScale") + 0x18) end
function AF:GetPivot() return vec(at(self, "AnimationFrame:GetPivot") + 0x20) end
function AF:IsVisible() return r8(at(self, "AnimationFrame:IsVisible") + 0x2c) ~= 0 end
function AF:GetColor() return color_at(at(self, "AnimationFrame:GetColor") + 0x30) end
function AF:GetRotation() return rf32(at(self, "AnimationFrame:GetRotation") + 0x5c) end
function AF:IsInterpolated() return r8(at(self, "AnimationFrame:IsInterpolated") + 0x60) ~= 0 end
function AF:GetStartFrame() return ri32(at(self, "AnimationFrame:GetStartFrame") + 0x64) end
function AF:GetEndFrame() return ri32(at(self, "AnimationFrame:GetEndFrame") + 0x68) end
local frame = class("AnimationFrame", AF)

local AL = {}
function AL:GetLayerID() return ri32(at(self, "AnimationLayer:GetLayerID")) end
function AL:IsVisible() return r8(at(self, "AnimationLayer:IsVisible") + 0x0c) ~= 0 end
-- the frame shown at animation frame n: the one whose [start, end) holds n, else the last
function AL:GetFrame(n)
  local a = at(self, "AnimationLayer:GetFrame")
  local frames, count = r32(a + 4), ri32(a + 8)
  if count <= 0 or frames == 0 then return nil end
  if mathtype(n) ~= "integer" then error("bad argument #1 to 'GetFrame' (integer expected, got " .. type(n) .. ")", 2) end
  if n < 0 then n = 0 end
  for i = 0, count - 1 do
    local f = frames + i * AF_SIZE
    if n >= ri32(f + 0x64) and n < ri32(f + 0x68) then return frame(f) end
  end
  return frame(frames + (count - 1) * AF_SIZE)
end
local layer = class("AnimationLayer", AL)

local AD = {}
local function layer_of(a, id)
  if id < 0 or id >= 64 then return 0, -1 end
  local order = ri32(a + 0x38 + 4 * id)
  local layers, count = r32(a + 0x18), ri32(a + 0x1c)
  if layers == 0 or order < 0 or order >= count then return 0, -1 end
  return layers + order * AL_SIZE, order
end
function AD:GetName() return stdstr(at(self, "AnimationData:GetName")) end
function AD:GetLength() return ri32(at(self, "AnimationData:GetLength") + 0x30) end
function AD:IsLoopingAnimation() return r8(at(self, "AnimationData:IsLoopingAnimation") + 0x34) ~= 0 end
function AD:GetLayer(id)
  if mathtype(id) ~= "integer" then error("bad argument #1 to 'GetLayer' (integer expected, got " .. type(id) .. ")", 2) end
  return layer((layer_of(at(self, "AnimationData:GetLayer"), id)))
end
function AD:GetAllLayers()
  local a = at(self, "AnimationData:GetAllLayers")
  local layers, count, out = r32(a + 0x18), ri32(a + 0x1c), {}
  if layers ~= 0 and count > 0 and count <= 64 then
    for i = 0, count - 1 do out[i + 1] = layer(layers + i * AL_SIZE) end
  end
  return out
end
local animation = class("AnimationData", AD)

local NF = {}
function NF:GetPos() return vec(at(self, "NullFrame:GetPos")) end
function NF:IsVisible() return r8(at(self, "NullFrame:IsVisible") + 0x0c) ~= 0 end
function NF:GetScale() return vec(at(self, "NullFrame:GetScale") + 0x10) end
function NF:GetColor() return color_at(at(self, "NullFrame:GetColor") + 0x18) end
function NF:GetRotation() return rf32(at(self, "NullFrame:GetRotation") + 0x44) end
local null_frame = class("NullFrame", NF)

-- the checks every read starts with
local function sprite(self, what)
  local a = this(self, what)
  local anims, count = r32(a + ANIMS), r32(a + ANIM_COUNT)
  if count > 4096 or (count > 0 and anims == 0) then error("rgon: this sprite's animations are not laid out as expected (" .. what .. ")", 3) end
  return a, anims, count
end
local function one_of(anims, count, record) return record >= anims and record < anims + count * AD_SIZE and (record - anims) % AD_SIZE == 0 end
local function current(self, what, state)
  local a, anims, count = sprite(self, what)
  local record = r32(a + state + 4)
  if record == 0 then return a, 0 end
  if not one_of(anims, count, record) or ri32(record + 0x1c) ~= self:GetLayerCount()
     or (state == STATE and stdstr(record) ~= self:GetAnimation()) then
    error("rgon: this sprite's animation data is not laid out as expected (" .. what .. ")", 3)
  end
  return a, record
end

method("Sprite", "GetCurrentAnimationData", function(self)
  local _, record = current(self, "GetCurrentAnimationData", STATE)
  return animation(record)
end)
method("Sprite", "GetOverlayAnimationData", function(self)
  local _, record = current(self, "GetOverlayAnimationData", OVERLAY)
  return animation(record)
end)
method("Sprite", "GetAnimationData", function(self, name)
  if type(name) ~= "string" then error("bad argument #1 to 'GetAnimationData' (string expected, got " .. type(name) .. ")", 2) end
  local _, anims, count = sprite(self, "GetAnimationData")
  for i = 0, count - 1 do
    if stdstr(anims + i * AD_SIZE) == name then return animation(anims + i * AD_SIZE) end
  end
  return nil
end)
method("Sprite", "GetAllAnimationData", function(self)
  local _, anims, count = sprite(self, "GetAllAnimationData")
  local out = {}
  for i = 0, count - 1 do out[i + 1] = animation(anims + i * AD_SIZE) end
  return out
end)

-- Sprite:GetLayerFrameData(layerId) / :GetOverlayLayerFrameData(layerId) -> the frame that layer shows now
local function frame_data(name, state)
  method("Sprite", name, function(self, id)
    if mathtype(id) ~= "integer" then error("bad argument #1 to '" .. name .. "' (integer expected, got " .. type(id) .. ")", 2) end
    local a, record = current(self, name, state)
    if record == 0 then return nil end
    local l, order = layer_of(record, id)
    if l == 0 then return nil end
    local frames, count = r32(l + 4), ri32(l + 8)
    local indices = r32(a + state + 8)
    if count <= 0 or frames == 0 or indices == 0 then return nil end
    local i = ri32(indices + 4 * order)
    if i < 0 then i = 0 elseif i > count - 1 then i = count - 1 end
    return frame(frames + i * AF_SIZE)
  end)
end
frame_data("GetLayerFrameData", STATE)
frame_data("GetOverlayLayerFrameData", OVERLAY)

-- Sprite:GetNullFrame(nullLayerName) / :GetOverlayNullFrame(name) -> where that null layer is this frame
--   NullFrame* AnimationState::GetNullFrame(const char*), 0x0040ace0 (a REPENTOGON signature that matches once here)
local function null(name, state)
  method("Sprite", name, function(self, layer_name)
    if type(layer_name) ~= "string" then error("bad argument #1 to '" .. name .. "' (string expected, got " .. type(layer_name) .. ")", 2) end
    local a = current(self, name, state)
    local s = B.alloc(#layer_name + 1)
    for i = 1, #layer_name do w8(s + i - 1, layer_name:byte(i)) end
    w8(s + #layer_name, 0)
    local found = call(0x0040ace0, a + state, s)
    B.free(s)
    return null_frame(found)
  end)
end
null("GetNullFrame", STATE)
null("GetOverlayNullFrame", OVERLAY)
