-- api_misc.lua -- Isaac.* functions that are neither a field nor a lookup:
-- timers, the state of the game, completion marks of a mod's characters.

local T = ...
local B, R, static = T.B, T.R, T.static
local r32, log = B.r32, B.log
local type, pairs, ipairs, tostring, pcall, rawget, rawset, setmetatable = type, pairs, ipairs, tostring, pcall, rawget, rawset, setmetatable
local mathtype = math.type
local unsupported = T.unsupported or function() end

local function int_arg(v, n, what)
  if mathtype(v) == "float" and v == math.floor(v) then v = math.tointeger(v) end
  if mathtype(v) ~= "integer" then error("bad argument #" .. n .. " to '" .. what .. "' (integer expected, got " .. type(v) .. ")", 3) end
  return v
end

-- the layer's own listener on a callback of the game's (it is not a mod and has no save data)
local LAYER = { Name = "REPENTOGON" }
local function listen(id, f, priority) Isaac.AddPriorityCallback(LAYER, id, priority or CallbackPriority.DEFAULT, f) end
T.listen = listen

------------------------------------------------------------------------------
-- Isaac.IsInGame() -> a run is on (not the menus)
------------------------------------------------------------------------------
-- The manager's state is 2 while a game is running: g_Manager = [0x00c7169c],
-- state at +0x8 (the fields before PersistentGameData at +0x14, which is where
-- this build has it too).
static(Isaac, "Isaac", "IsInGame", function()
  local manager = r32(0x00c7169c)
  return manager ~= 0 and r32(manager + 8) == 2
end)

------------------------------------------------------------------------------
-- Isaac.CreateTimer(function, interval, times = 0, persistent = true) -> the timer
------------------------------------------------------------------------------
-- REPENTOGON spawns the game's own timer effect and hands it a native
-- function. Here the timers are the layer's: counted on the game's update
-- (30 a second, not while paused), the function called after every
-- `interval` updates, `times` times (0: until removed); one that is not
-- persistent ends when the room is left. What comes back is not an
-- EntityEffect but an object with the two things a mod does with a timer:
-- Remove() and Exists().
do
  local timers, hooked = {}, false
  local Timer = {}
  Timer.__index = Timer
  Timer.__type = "Timer"
  function Timer:Remove() self.dead = true end
  function Timer:Exists() return not self.dead end
  function Timer:IsDead() return self.dead == true end
  local function tick()
    local n = #timers
    for i = 1, n do
      local t = timers[i]
      if not t.dead then
        t.left = t.left - 1
        if t.left <= 0 then
          t.left = t.interval
          if t.times > 0 then
            t.times = t.times - 1
            if t.times == 0 then t.dead = true end
          end
          local ok, err = pcall(t.fn)
          if not ok then
            t.dead = true
            Isaac.DebugString("[REPENTOGON] a timer's function failed and the timer was removed: " .. tostring(err))
          end
        end
      end
    end
    for i = #timers, 1, -1 do if timers[i].dead then table.remove(timers, i) end end
  end
  static(Isaac, "Isaac", "CreateTimer", function(fn, interval, times, persistent)
    if type(fn) ~= "function" then error("Expected function, got " .. type(fn), 2) end
    interval = int_arg(interval, 2, "CreateTimer")
    if interval <= 0 then interval = 1 end
    times = times == nil and 0 or int_arg(times, 3, "CreateTimer")
    if times < 0 then times = 1 end
    if not hooked then
      hooked = true
      listen(ModCallbacks.MC_POST_UPDATE, tick)
      listen(ModCallbacks.MC_POST_NEW_ROOM, function()
        for _, t in ipairs(timers) do if not t.persistent then t.dead = true end end
      end)
      listen(ModCallbacks.MC_PRE_GAME_EXIT, function() for _, t in ipairs(timers) do t.dead = true end end)
    end
    local t = setmetatable({ fn = fn, interval = interval, left = interval, times = times, persistent = persistent ~= false }, Timer)
    timers[#timers + 1] = t
    return t
  end)
end

------------------------------------------------------------------------------
-- Isaac.GetAxisAlignedUnitVectorFromDir(direction) -> Vector
------------------------------------------------------------------------------
do
  local UNIT = { [Direction.LEFT] = { -1, 0 }, [Direction.UP] = { 0, -1 }, [Direction.RIGHT] = { 1, 0 }, [Direction.DOWN] = { 0, 1 } }
  static(Isaac, "Isaac", "GetAxisAlignedUnitVectorFromDir", function(dir)
    local u = UNIT[dir == nil and -1 or dir]
    return u and Vector(u[1], u[2]) or Vector(0, 0)
  end)
end

------------------------------------------------------------------------------
-- completion marks
------------------------------------------------------------------------------
-- Isaac.GetCompletionMark(playerType, CompletionType) -> 0 (not done), 1 (normal), 2 (hard)
-- Isaac.SetCompletionMark(playerType, CompletionType, value)
-- Isaac.GetCompletionMarks(playerType) -> { PlayerType, MomsHeart, Isaac, ... }
-- Isaac.SetCompletionMarks(table), Isaac.ClearCompletionMarks(playerType)
-- The game keeps completion marks for its own characters in its save file and
-- has no place for a mod's. REPENTOGON keeps those; so does the layer, by the
-- character's name (a mod's player type changes with what else is installed).
-- The game's own characters' marks are in its save data, which the layer
-- does not read yet: for them the answer is 0 and a Set is not taken.
local CT = rawget(_G, "CompletionType")
if type(CT) == "table" then
  local FIELDS = { MomsHeart = CT.MOMS_HEART, Isaac = CT.ISAAC, Satan = CT.SATAN, BossRush = CT.BOSS_RUSH, BlueBaby = CT.BLUE_BABY, Lamb = CT.LAMB,
                   MegaSatan = CT.MEGA_SATAN, UltraGreed = CT.ULTRA_GREED, Hush = CT.HUSH, UltraGreedier = CT.ULTRA_GREEDIER, Delirium = CT.DELIRIUM,
                   Mother = CT.MOTHER, Beast = CT.BEAST }
  local marks = {}                 -- "<name>" or "<name>.b" -> { [CompletionType] = 0..2 }
  T.completion_marks = marks
  local LAST_GAME_PLAYER = 40
  local function key(playerType, what)
    playerType = int_arg(playerType, 1, what)
    if playerType <= LAST_GAME_PLAYER then
      unsupported("completion marks of the game's own characters (Isaac." .. what .. ")", "they answer 0")
      return nil
    end
    local conf = EntityConfig and EntityConfig.GetPlayer(playerType)
    if not conf then return nil end
    return conf:GetName() .. (conf:IsTainted() and ".b" or "")
  end
  local function changed() if T.marks_changed then T.marks_changed(marks) end end
  static(Isaac, "Isaac", "GetCompletionMark", function(playerType, mark)
    local k = key(playerType, "GetCompletionMark")
    local m = k and marks[k]
    return m and m[int_arg(mark, 2, "GetCompletionMark")] or 0
  end)
  static(Isaac, "Isaac", "SetCompletionMark", function(playerType, mark, value)
    local k = key(playerType, "SetCompletionMark")
    if not k then return end
    mark, value = int_arg(mark, 2, "SetCompletionMark"), int_arg(value, 3, "SetCompletionMark")
    if value < 0 then value = 0 elseif value > 2 then value = 2 end
    marks[k] = marks[k] or {}
    if marks[k][mark] ~= value then
      marks[k][mark] = value
      changed()
    end
  end)
  static(Isaac, "Isaac", "GetCompletionMarks", function(playerType)
    local k = key(playerType, "GetCompletionMarks")
    local m, out = k and marks[k] or {}, { PlayerType = playerType }
    for name, id in pairs(FIELDS) do out[name] = m[id] or 0 end
    return out
  end)
  static(Isaac, "Isaac", "SetCompletionMarks", function(t)
    if type(t) ~= "table" then error("bad argument #1 to 'SetCompletionMarks' (table expected, got " .. type(t) .. ")", 2) end
    local k = key(t.PlayerType, "SetCompletionMarks")
    if not k then return end
    marks[k] = marks[k] or {}
    for name, id in pairs(FIELDS) do
      local v = t[name]
      if mathtype(v) == "integer" then marks[k][id] = v < 0 and 0 or v > 2 and 2 or v end
    end
    changed()
  end)
  static(Isaac, "Isaac", "ClearCompletionMarks", function(playerType)
    local k = key(playerType, "ClearCompletionMarks")
    if k and marks[k] then
      marks[k] = nil
      changed()
    end
  end)
end

------------------------------------------------------------------------------
-- Console
------------------------------------------------------------------------------
-- Console.PrintError(text), Console.PrintWarning(text): a line in the game's console and its log.
-- Console.RegisterCommand(name, description, helpText, showOnMenu, autocompleteType): REPENTOGON lists the
-- command in its console's autocomplete and help. The command itself is the mod's (MC_EXECUTE_CMD) and
-- works without that; the browser's console has no such list, so the registration is kept and not shown.
if rawget(_G, "Console") == nil then
  local C = {}
  local commands = {}
  local function line(prefix)
    return function(text)
      text = tostring(text)
      pcall(Isaac.ConsoleOutput, prefix .. text .. "\n")
      Isaac.DebugString(prefix .. text)
    end
  end
  C.PrintError = line("[ERROR] ")
  C.PrintWarning = line("[WARN] ")
  function C.RegisterCommand(name, description, help, show_on_menu, autocomplete)
    if type(name) ~= "string" then error("bad argument #1 to 'RegisterCommand' (string expected, got " .. type(name) .. ")", 2) end
    commands[name] = { Name = name, Description = description, HelpText = help, ShowOnMenu = show_on_menu, AutocompleteType = autocomplete }
    unsupported("Console.RegisterCommand", "the command works; it is not listed for autocomplete")
  end
  function C.GetCommandHistory() return {} end
  function C.GetHistory() return {} end
  rawset(_G, "Console", C)
  R.Implemented["Console.PrintError"] = true
  R.Implemented["Console.PrintWarning"] = true
end

------------------------------------------------------------------------------
-- os
------------------------------------------------------------------------------
-- The game opens seven of Lua's libraries and os is not one, so a mod has no
-- `os` on a PC without REPENTOGON. With it a mod has four functions of the
-- library: date, time, clock and difftime. The same four are given here.
if rawget(_G, "os") == nil and type(B.os) == "table" then
  rawset(_G, "os", { date = B.os.date, time = B.os.time, clock = B.os.clock, difftime = B.os.difftime })
  R.Implemented["os.date"], R.Implemented["os.time"], R.Implemented["os.clock"], R.Implemented["os.difftime"] = true, true, true, true
end

------------------------------------------------------------------------------
-- DestinationQuad, SourceQuad
------------------------------------------------------------------------------
-- The four corners of where something is drawn, and of what part of an image
-- is drawn there: value types of REPENTOGON's renderer. The renderer itself
-- (Renderer, Image, shaders) is not in the layer; the quads are, because a
-- mod builds them while it loads. Their arithmetic is the plain one: scale
-- and rotate (degrees, the screen's y pointing down) about an anchor, shear
-- each axis by the other, a 2x3 matrix applied about an anchor.
do
  local function vec_arg(v, n, what)
    if type(v) ~= "userdata" or v.X == nil then error("bad argument #" .. n .. " to '" .. what .. "' (Vector expected, got " .. type(v) .. ")", 3) end
    return Vector(v.X, v.Y)
  end
  local function quad(name, extra)
    local Q = {}
    Q.__index = Q
    Q.__type = name
    Q.__tostring = function(q)
      return string.format("%s[(%g, %g) (%g, %g) (%g, %g) (%g, %g)]", name, q._tl.X, q._tl.Y, q._tr.X, q._tr.Y, q._bl.X, q._bl.Y, q._br.X, q._br.Y)
    end
    local function new(tl, tr, bl, br) return setmetatable({ _tl = tl, _tr = tr, _bl = bl, _br = br }, Q) end
    function Q:GetTopLeft() return Vector(self._tl.X, self._tl.Y) end
    function Q:GetTopRight() return Vector(self._tr.X, self._tr.Y) end
    function Q:GetBottomLeft() return Vector(self._bl.X, self._bl.Y) end
    function Q:GetBottomRight() return Vector(self._br.X, self._br.Y) end
    function Q:SetTopLeft(v) self._tl = vec_arg(v, 1, "SetTopLeft") end
    function Q:SetTopRight(v) self._tr = vec_arg(v, 1, "SetTopRight") end
    function Q:SetBottomLeft(v) self._bl = vec_arg(v, 1, "SetBottomLeft") end
    function Q:SetBottomRight(v) self._br = vec_arg(v, 1, "SetBottomRight") end
    function Q:Copy() return new(self:GetTopLeft(), self:GetTopRight(), self:GetBottomLeft(), self:GetBottomRight()) end
    local function each(self, f)
      self._tl, self._tr, self._bl, self._br = f(self._tl), f(self._tr), f(self._bl), f(self._br)
    end
    function Q:Translate(offset)
      offset = vec_arg(offset, 1, "Translate")
      each(self, function(p) return Vector(p.X + offset.X, p.Y + offset.Y) end)
    end
    function Q:Scale(scale, anchor)
      scale = vec_arg(scale, 1, "Scale")
      local a = anchor == nil and Vector(0, 0) or vec_arg(anchor, 2, "Scale")
      each(self, function(p) return Vector(a.X + (p.X - a.X) * scale.X, a.Y + (p.Y - a.Y) * scale.Y) end)
    end
    function Q:Rotate(rotation, anchor)
      if type(rotation) ~= "number" then error("bad argument #1 to 'Rotate' (number expected, got " .. type(rotation) .. ")", 2) end
      local a = anchor == nil and Vector(0, 0) or vec_arg(anchor, 2, "Rotate")
      local c, s = math.cos(math.rad(rotation)), math.sin(math.rad(rotation))
      each(self, function(p)
        local x, y = p.X - a.X, p.Y - a.Y
        return Vector(a.X + x * c - y * s, a.Y + x * s + y * c)
      end)
    end
    function Q:Shear(shear, anchor)
      shear = vec_arg(shear, 1, "Shear")
      local a = anchor == nil and Vector(0, 0) or vec_arg(anchor, 2, "Shear")
      each(self, function(p)
        local x, y = p.X - a.X, p.Y - a.Y
        return Vector(a.X + x + shear.X * y, a.Y + y + shear.Y * x)
      end)
    end
    function Q:ApplyMatrix(m, anchor)
      if type(m) ~= "table" or type(m[1]) ~= "table" or type(m[2]) ~= "table" or #m[1] < 3 or #m[2] < 3 then
        error("bad argument #1 to 'ApplyMatrix' (a table of 2 rows of 3 numbers expected)", 2)
      end
      local a = anchor == nil and Vector(0, 0) or vec_arg(anchor, 2, "ApplyMatrix")
      each(self, function(p)
        local x, y = p.X - a.X, p.Y - a.Y
        return Vector(a.X + m[1][1] * x + m[1][2] * y + m[1][3], a.Y + m[2][1] * x + m[2][2] * y + m[2][3])
      end)
    end
    function Q:Flip(flip_x, flip_y)
      if flip_x then self._tl, self._tr, self._bl, self._br = self._tr, self._tl, self._br, self._bl end
      if flip_y then self._tl, self._tr, self._bl, self._br = self._bl, self._br, self._tl, self._tr end
    end
    if extra then extra(Q) end
    local static_side = {}
    function static_side.NewFromBounds(top_left, bottom_right)
      local tl, br = vec_arg(top_left, 1, "NewFromBounds"), vec_arg(bottom_right, 2, "NewFromBounds")
      return new(tl, Vector(br.X, tl.Y), Vector(tl.X, br.Y), br)
    end
    function static_side.NewFromRectangle(top_left, width, height)
      local tl = vec_arg(top_left, 1, "NewFromRectangle")
      return new(tl, Vector(tl.X + width, tl.Y), Vector(tl.X, tl.Y + height), Vector(tl.X + width, tl.Y + height))
    end
    if rawget(_G, name) == nil then
      rawset(_G, name, setmetatable(static_side, { __call = function(_, tl, tr, bl, br)
        return new(vec_arg(tl, 1, name), vec_arg(tr, 2, name), vec_arg(bl, 3, name), vec_arg(br, 4, name))
      end }))
      R.Implemented[name] = true
    end
  end
  quad("DestinationQuad")
  quad("SourceQuad", function(Q)
    -- a source quad is in pixels unless it was converted to the 0..1 space of the image
    function Q:IsUVSpace() return self._uv == true end
  end)
end

------------------------------------------------------------------------------
-- Renderer (accepted, not supported)
------------------------------------------------------------------------------
-- REPENTOGON lets a mod make images, draw into them and draw them with
-- shaders of its own. None of that is in the layer: it needs render targets
-- and shader programs of the mod's inside the engine. A mod that asks for an
-- image or a shader while it loads gets an object that holds what was asked
-- and draws nothing, so the rest of the mod can load; what the mod would have
-- drawn with it is missing from the screen.
if rawget(_G, "Renderer") == nil then
  local note = "a mod's own images and shaders are not drawn"
  local Image = {}
  Image.__index = Image
  Image.__type = "Image"
  function Image:GetWidth() return self._w end
  function Image:GetHeight() return self._h end
  function Image:GetPaddedWidth() return self._w end
  function Image:GetPaddedHeight() return self._h end
  function Image:GetName() return self._name end
  function Image:Render() unsupported("Image:Render", note) end
  function Image:RenderWithShader() unsupported("Image:RenderWithShader", note) end
  local Shader = {}
  Shader.__index = Shader
  Shader.__type = "Shader"
  function Shader:GetName() return self._name end
  local Rn = {}
  Rn.VertexAttributeFormat = { FLOAT = 1, VEC2 = 2, VEC3 = 3, VEC4 = 4, POSITION = 5, COLOR = 6, TEX_COORD = 7 }
  function Rn.CreateImage(width, height, name)
    unsupported("Renderer.CreateImage", note)
    return setmetatable({ _w = width or 0, _h = height or 0, _name = tostring(name or "") }, Image)
  end
  function Rn.LoadImage(path)
    unsupported("Renderer.LoadImage", note)
    return setmetatable({ _w = 0, _h = 0, _name = tostring(path or "") }, Image)
  end
  function Rn.RenderToImage() unsupported("Renderer.RenderToImage", note) end
  function Rn.LoadShader(name)
    unsupported("Renderer.LoadShader", note)
    return setmetatable({ _name = tostring(name or "") }, Shader)
  end
  function Rn.GetShaderByType(kind)
    unsupported("Renderer.GetShaderByType", note)
    return setmetatable({ _name = "type " .. tostring(kind) }, Shader)
  end
  function Rn.GetClipPaneNormal() return Vector(0, 0) end
  function Rn.GetClipPaneThreshold() return 0.0 end
  rawset(_G, "Renderer", Rn)
end

------------------------------------------------------------------------------
-- Beam (accepted, not supported)
------------------------------------------------------------------------------
-- Beam(sprite, layer, useOverlay, unkBool): a strip of a sprite's layer drawn
-- along a line of points (cords, chains, ropes), by the game's own beam
-- renderer. The object is here with everything a mod sets on it and reads
-- back; Render() draws nothing yet.
if rawget(_G, "Beam") == nil then
  local Bm = {}
  Bm.__index = Bm
  Bm.__type = "Beam"
  local function layer_of(sprite, layer)
    if type(layer) == "string" then
      local l = sprite.GetLayer and sprite:GetLayer(layer)
      return l and l:GetLayerID() or 0
    end
    return layer or 0
  end
  function Bm:Add(position, coordinate, width, color)
    self._points[#self._points + 1] = { Position = position, SpritesheetCoordinate = coordinate, Width = width or 1.0, Color = color }
  end
  function Bm:GetPoints() return self._points end
  function Bm:SetPoints(points) self._points = type(points) == "table" and points or {} end
  function Bm:GetSprite() return self._sprite end
  function Bm:SetSprite(sprite, layer, overlay)
    self._sprite = sprite
    if layer ~= nil then self._layer = layer_of(sprite, layer) end
    if overlay ~= nil then self._overlay = overlay and true or false end
  end
  function Bm:GetLayer() return self._layer end
  function Bm:SetLayer(layer) self._layer = layer_of(self._sprite, layer) end
  function Bm:GetUseOverlay() return self._overlay end
  function Bm:SetUseOverlay(v) self._overlay = v and true or false end
  function Bm:GetUnkBool() return self._unk end
  function Bm:SetUnkBool(v) self._unk = v and true or false end
  function Bm:Render(clear)
    unsupported("Beam:Render", "a beam is not drawn")
    if clear ~= false then self._points = {} end
  end
  rawset(_G, "Beam", setmetatable({}, { __call = function(_, sprite, layer, overlay, unk)
    if type(sprite) ~= "userdata" then error("bad argument #1 to 'Beam' (Sprite expected, got " .. type(sprite) .. ")", 2) end
    return setmetatable({ _sprite = sprite, _layer = layer_of(sprite, layer), _overlay = overlay and true or false, _unk = unk and true or false, _points = {} }, Bm)
  end }))
end
