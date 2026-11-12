-- api_extra.lua -- round 109: names Fiend Folio calls that the layer did not have.
--
-- Each address is this executable's and says beside it how it was found
-- (asm: read off `pequery.py body`). REPENTOGON's documentation says what each
-- name takes and answers; the code is this layer's.

local T = ...
local B, R, method, wrap, this = T.B, T.R, T.method, T.wrap, T.this
local r32, ri32, call, log, ptr = B.r32, B.ri32, B.call, B.log, B.ptr
local type, tostring, pairs, ipairs, getmetatable, setmetatable = type, tostring, pairs, ipairs, getmetatable, setmetatable
local mathtype = math.type

local function signed(v) return v >= 0x80000000 and v - 0x100000000 or v end

-- An ActiveSlot argument as REPENTOGON takes it: optional (the primary slot), an
-- integer from 0 to 3, anything else an error naming the slot.
local function slot_arg(v, n, what)
  if v == nil then return 0 end
  if mathtype(v) == "float" and v == math.floor(v) then v = math.tointeger(v) end
  if mathtype(v) ~= "integer" then error("bad argument #" .. n .. " to '" .. what .. "' (number expected, got " .. type(v) .. ")", 3) end
  if v < 0 or v > 3 then error("bad argument #" .. n .. " to '" .. what .. "' (Invalid ActiveSlot " .. v .. ")", 3) end
  return v
end

------------------------------------------------------------------------------
-- EntityPlayer:GetActiveMaxCharge(slot = 0) / GetActiveMinUsableCharge(slot = 0) -> int
------------------------------------------------------------------------------
-- The game's own functions of a slot (asm, both thiscall, one stack word, `ret 4` on every path):
--   0x00791320 GetActiveMaxCharge(slot): 0 for slot 3 (the pocket active is not charged here) and for
--     slot 2 holding item 0x244 while game+0x26584 is 0x2c; otherwise it calls 0x007911f0 (slot 87's
--     GetActiveMaxCharge(item, varData, unused), ret 0xc) with the slot's item [player+0x1580+slot*0x20]
--     and its varData [player+0x159c+slot*0x20] -- the ActiveItemDesc layout api_player.lua uses. 24
--     callers, among them PlayerHUD::RenderActiveItem (0x008454c7).
--   0x00791380 GetActiveMinUsableCharge(slot): slot 88, the same two early exits; then 1 for four items
--     (0x263, 0x2d0, 0x93, and 0x23 under a condition), else the max charge.
-- Both go through slot 87, so MC_PLAYER_GET_ACTIVE_MAX_CHARGE answers here too, as in REPENTOGON, whose
-- Lua functions call the same two game functions.
do
  local MAX_OF_SLOT, MIN_OF_SLOT = 0x00791320, 0x00791380
  method("EntityPlayer", "GetActiveMaxCharge", function(self, slot)
    slot = slot_arg(slot, 1, "GetActiveMaxCharge")
    return signed(call(MAX_OF_SLOT, this(self, "GetActiveMaxCharge"), slot))
  end)
  method("EntityPlayer", "GetActiveMinUsableCharge", function(self, slot)
    slot = slot_arg(slot, 1, "GetActiveMinUsableCharge")
    return signed(call(MIN_OF_SLOT, this(self, "GetActiveMinUsableCharge"), slot))
  end)
end

------------------------------------------------------------------------------
-- RoomTransition: GetVersusScreenSprite, IsRenderingBossIntro, GetTransitionMode
------------------------------------------------------------------------------
-- REPENTOGON makes these a global table over the game's own room transition.
-- Here (asm): the game object's pointer is at 0x00c71678 and its RoomTransition at +0x1b83c -- the
-- callers of StartBossIntro (slot 24, 0x0082f1c0) do `mov ecx, [0xc71678]; lea ecx, [ecx + 0x1b83c]`
-- (0x004ac076), and the game's render calls RoomTransition's render (0x00832850) with
-- `lea ecx, [edi + 0x1b83c]` (0x006fc09b). In it:
--   +0x000 the mode: StartBossIntro compares it (0x0082f21d), the render draws only for 2 and 3
--          (0x00832860..0x0083286a);
--   +0x038 the versus screen's sprite: StartBossIntro replaces its spritesheets (lea ecx, [edi + 0x38];
--          call 0x0040bf30, from 0x00830261 on) and versusscreen.anm2 is loaded by 0x0082ee40/0x0082f1c0;
--   +0x238 the first boss of the intro: StartBossIntro stores its first argument there (0x0082f217), and
--          the render draws the versus screen when it is not 0 and the mode is 2 (0x00832870..0x00832880).
-- So IsRenderingBossIntro is "mode 2 and a boss", as the render itself decides.
-- Not here: StartBossIntro and GetPlayerExtraPortraitSprite (nothing that uses the layer calls them yet).
if rawget(_G, "RoomTransition") == nil then
  local GAME_PTR, RT = 0x00c71678, 0x1b83c
  local function rt()
    local g = r32(GAME_PTR)
    if g == 0 then error("rgon: RoomTransition used with no game", 3) end
    return g + RT
  end
  local RTT = {}
  function RTT.GetTransitionMode() return ri32(rt()) end
  function RTT.IsRenderingBossIntro()
    local a = rt()
    return ri32(a) == 2 and r32(a + 0x238) ~= 0
  end
  function RTT.GetVersusScreenSprite()
    local a = rt() + 0x38
    -- a sprite points at itself at +0x30 and +0x50 (api_game.lua's inner_sprite check)
    if r32(a + 0x30) ~= a or r32(a + 0x50) ~= a then error("rgon: no sprite where RoomTransition.GetVersusScreenSprite expects one", 2) end
    return wrap("Sprite", a)
  end
  rawset(_G, "RoomTransition", RTT)
  for _, n in ipairs({ "GetTransitionMode", "IsRenderingBossIntro", "GetVersusScreenSprite" }) do R.Implemented["RoomTransition." .. n] = true end
end

------------------------------------------------------------------------------
-- EntityLaser:SetInitSound(sound)
------------------------------------------------------------------------------
-- The laser's start sound is played by 0x0096f880 (REPENTOGON's PlayInitSound signature matches it once;
-- its one caller is 0x009704a0, the laser's first update), which begins `cmp byte [esi + 0x518], 0;
-- jne <the end>`: with that byte set no sound is played. The game sets it itself in several places
-- (0x00975970, 0x009f3738, ...). So SOUND_NULL is that byte. Another sound needs the sound chosen inside
-- that function replaced: accepted, the laser keeps its own sound, said once.
do
  local unsupported = T.unsupported or function() end
  method("EntityLaser", "SetInitSound", function(self, sound)
    if mathtype(sound) == "float" and sound == math.floor(sound) then sound = math.tointeger(sound) end
    if mathtype(sound) ~= "integer" or sound < 0 then error("bad argument #1 to 'SetInitSound' (Invalid SoundEffect)", 2) end
    local a = this(self, "SetInitSound")
    if sound == 0 then
      B.w8(a + 0x518, 1)
    else
      unsupported("EntityLaser:SetInitSound", "a laser's start sound other than SOUND_NULL (it keeps its own)")
    end
  end)
end

------------------------------------------------------------------------------
-- MultiShotParams, and EntityPlayer:GetMultiShotParams(weaponType = WEAPON_TEARS)
------------------------------------------------------------------------------
-- The game's own Lua hands out a MultiShotParams nobody can read (indexing it is an error: measured,
-- test_hooks3.lua's first run). REPENTOGON replaces GetMultiShotParams with one whose answer has getters
-- and setters. The struct, from Entity_Player::GetMultiShotParams 0x00781b90 (slot 71, asm), which fills
-- the one it is handed (the hidden first argument) and answers it: it clears +0x20 (word), +4, +8, +0xc,
-- +0x18, +0x10 (dwords), +0x1c (word, two bytes) and +0x1e (byte), writes 1 to +0 (dword: the word count of
-- tears 1 and lanes 0) and 1 to +0x14, then counts tears in the word at +0 (`add word ptr [ebx], ...`),
-- eyes in the dword at +0x14, writes floats to +0x18, +0x10, +0xc (90.0 at 0x00781fc9) and the bytes at
-- +0x1c, +0x1d, +0x1e, and the word at +0x20 -- REPENTOGON's layout of Weapon_MultiShotParams, 0x24 bytes:
--   +0 numTears i16, +2 numLanesPerEye i16, +4 spread (tears, bombs), +8 (brimstone, laser), +0xc (tech X,
--   C section), +0x10 (knife; bone and axe x3) floats, +0x14 numEyesActive i32, +0x18 multiEyeAngle f32,
--   +0x1c crossEyed, +0x1d backwards, +0x1e sideways (bytes), +0x20 numRandomDirTears i16.
-- Here a MultiShotParams is a Lua object over 0x24 bytes of guest memory of its own (freed with it). The
-- game function is called into that memory, so slot 71's MC_EVALUATE_MULTI_SHOT_PARAMS answers here too.
-- GetMultiShotPositionVelocity, the game's own, takes the game's object: one is made from the game and its
-- bytes overwritten, so it also takes this layer's.
do
  local MSP_SIZE, GET_MSP = 0x24, 0x00781b90
  local alloc, free, r8, r16, w8, w16, rf32, wf32 = B.alloc, B.free, B.r8, B.r16, B.w8, B.w16, B.rf32, B.wf32
  local function s16(v) v = v & 0xffff return v >= 0x8000 and v - 0x10000 or v end
  local MSP = {}
  local MSP_MT = { __index = MSP, __name = "MultiShotParams", __type = "MultiShotParams" }
  MSP_MT.__gc = function(o) local a = rawget(o, "_a") if a and a ~= 0 then free(a) rawset(o, "_a", 0) end end
  local function new(from)
    local a = alloc(MSP_SIZE)
    if a == 0 then error("rgon: no memory for a MultiShotParams", 2) end
    if from then for o = 0, MSP_SIZE - 4, 4 do B.w32(a + o, r32(from + o)) end end
    return setmetatable({ _a = a }, MSP_MT)
  end
  local function at(o)
    local a = type(o) == "table" and getmetatable(o) == MSP_MT and rawget(o, "_a")
    if not a or a == 0 then error("rgon: a MultiShotParams method called without its object (use ':')", 3) end
    return a
  end
  local function int(v, n, what)
    if mathtype(v) == "float" and v == math.floor(v) then v = math.tointeger(v) end
    if mathtype(v) ~= "integer" then error("bad argument #" .. n .. " to '" .. what .. "' (number expected, got " .. type(v) .. ")", 3) end
    return v
  end
  local function num(v, n, what)
    if type(v) ~= "number" then error("bad argument #" .. n .. " to '" .. what .. "' (number expected, got " .. type(v) .. ")", 3) end
    return v
  end
  -- the spread angle's field by weapon type, and the factor REPENTOGON applies (bone and axe: the knife's x3)
  local SPREAD = { [1] = { 4, 1 }, [5] = { 4, 1 }, [2] = { 8, 1 }, [3] = { 8, 1 }, [4] = { 0x10, 1 }, [9] = { 0xc, 1 }, [14] = { 0xc, 1 },
                   [10] = { 0x10, 3 }, [11] = { 0x10, 3 } }
  local NO_SPREAD = { [6] = true, [7] = true, [8] = true, [12] = true, [13] = true, [15] = true }
  function MSP.GetNumTears(o) return s16(r16(at(o))) end
  function MSP.SetNumTears(o, v) w16(at(o), int(v, 1, "SetNumTears") & 0xffff) end
  function MSP.GetNumLanesPerEye(o) return s16(r16(at(o) + 2)) end
  function MSP.SetNumLanesPerEye(o, v) w16(at(o) + 2, int(v, 1, "SetNumLanesPerEye") & 0xffff) end
  function MSP.GetNumEyesActive(o) return ri32(at(o) + 0x14) end
  function MSP.SetNumEyesActive(o, v) B.w32(at(o) + 0x14, int(v, 1, "SetNumEyesActive") & 0xffffffff) end
  function MSP.GetMultiEyeAngle(o) return rf32(at(o) + 0x18) end
  function MSP.SetMultiEyeAngle(o, v) wf32(at(o) + 0x18, num(v, 1, "SetMultiEyeAngle")) end
  function MSP.IsCrossEyed(o) return r8(at(o) + 0x1c) ~= 0 end
  function MSP.SetIsCrossEyed(o, v) w8(at(o) + 0x1c, v and 1 or 0) end
  function MSP.IsShootingBackwards(o) return r8(at(o) + 0x1d) ~= 0 end
  function MSP.SetIsShootingBackwards(o, v) w8(at(o) + 0x1d, v and 1 or 0) end
  function MSP.IsShootingSideways(o) return r8(at(o) + 0x1e) ~= 0 end
  function MSP.SetIsShootingSideways(o, v) w8(at(o) + 0x1e, v and 1 or 0) end
  function MSP.GetNumRandomDirTears(o) return s16(r16(at(o) + 0x20)) end
  function MSP.SetNumRandomDirTears(o, v) w16(at(o) + 0x20, int(v, 1, "SetNumRandomDirTears") & 0xffff) end
  function MSP.GetSpreadAngle(o, w)
    local a = at(o)
    w = int(w, 1, "GetSpreadAngle")
    local s = SPREAD[w]
    if s then return rf32(a + s[1]) * s[2] end
    if NO_SPREAD[w] then return 0 end
    error("WeaponTypes bigger 15 are not supported!", 2)
  end
  function MSP.SetSpreadAngle(o, w, v)
    local a = at(o)
    w = int(w, 1, "SetSpreadAngle")
    v = num(v, 2, "SetSpreadAngle")
    local s = SPREAD[w]
    if s then wf32(a + s[1], v / s[2]) return end
    if NO_SPREAD[w] then error("The given WeaponType cant change its spread angle!", 2) end
    error("A WeaponType bigger 15 is not supported!", 2)
  end
  local function is(v) return type(v) == "table" and getmetatable(v) == MSP_MT end
  T.msp = { new = new, is = is, addr = function(o) return rawget(o, "_a") end, size = MSP_SIZE }

  local c, const = T.class_tables("EntityPlayer")
  -- the static table's metatable names no const table, but an object's lookup reads the one its class
  -- names (measured: with only the class table's entry replaced, p:GetMultiShotParams() was still the game's)
  if c and not const then const = rawget(c, "__const") end
  local game_get = c and rawget(c, "GetMultiShotParams")
  if type(game_get) == "function" then
    T.msp.game_get = game_get
    local function get(self, w)
      if w == nil then w = 1 end
      w = int(w, 1, "GetMultiShotParams")
      local o = new()
      call(GET_MSP, this(self, "GetMultiShotParams"), o._a, w & 0xffffffff)
      return o
    end
    local f = B.cfn(get)
    rawset(c, "GetMultiShotParams", f)
    if const and const ~= c then rawset(const, "GetMultiShotParams", f) end
    -- The game's own resources/scripts/main.lua puts a Lua __index in front of EntityPlayer's class
    -- ("Compatibility wrappers", EndClass) that answers from a table of its own first, and its
    -- GetMultiShotParams (the one that defaults the weapon type to 1) is in that table: measured, the
    -- class table's entry alone is never reached. So the class's __index is put in front of once more,
    -- for this name only.
    local prev = rawget(c, "__index")
    if type(prev) == "function" then
      rawset(c, "__index", function(self, k)
        if k == "GetMultiShotParams" then return f end
        return prev(self, k)
      end)
    end
    R.Implemented["EntityPlayer.GetMultiShotParams"] = true
    for n in pairs(MSP) do R.Implemented["MultiShotParams." .. n] = true end
    -- EntityPlayer:GetMultiShotPositionVelocity(loopIndex, weaponType, shotDirection, shotSpeed, params) -> PosVel.
    -- The game registers it as a static function (its Lua thunk 0x00882f90 binds 0x00782160, which pops nothing),
    -- so `player:GetMultiShotPositionVelocity` is nil (measured; REPENTOGON's notes say it "vanished" from the
    -- API). 0x00782160 is cdecl, PosVel returned through a hidden first argument, the rest by value (asm, its
    -- reads): +0xc loopIndex, +0x10 weaponType, +0x14/+0x18 the direction, +0x1c the speed, +0x20 the 0x24
    -- bytes of the params (numTears word at +0x20, eyes at +0x34, crossEyed byte at +0x3c). The answer is a
    -- table with Position and Velocity, as a PosVel reads. As REPENTOGON's, a loop index above the params'
    -- tear count is an error.
    if rawget(c, "GetMultiShotPositionVelocity") == nil then
      local POSVEL, f2i = 0x00782160, B.f2i
      local PV_MT = { __name = "PosVel", __type = "PosVel" }
      local pv = B.cfn(function(self, i, w, dir, speed, params)
        this(self, "GetMultiShotPositionVelocity")
        i = int(i, 1, "GetMultiShotPositionVelocity")
        w = int(w, 2, "GetMultiShotPositionVelocity")
        if type(dir) ~= "userdata" then error("bad argument #3 to 'GetMultiShotPositionVelocity' (Vector expected)", 2) end
        speed = num(speed, 4, "GetMultiShotPositionVelocity")
        if not is(params) then error("bad argument #5 to 'GetMultiShotPositionVelocity' (MultiShotParams expected)", 2) end
        if i > MSP.GetNumTears(params) then error("bad argument #1 to 'GetMultiShotPositionVelocity' (LoopIndex cannot be higher than MultiShotParams.NumTears)", 2) end
        local out = alloc(16)
        local words = { out, i & 0xffffffff, w & 0xffffffff, f2i(dir.X), f2i(dir.Y), f2i(speed) }
        for o = 0, MSP_SIZE - 4, 4 do words[#words + 1] = r32(params._a + o) end
        local ok, err = pcall(call, POSVEL, nil, table.unpack(words))
        local res
        if ok then res = setmetatable({ Position = Vector(rf32(out), rf32(out + 4)), Velocity = Vector(rf32(out + 8), rf32(out + 12)) }, PV_MT) end
        free(out)
        if not ok then error(err, 2) end
        return res
      end)
      rawset(c, "GetMultiShotPositionVelocity", pv)
      if const and const ~= c then rawset(const, "GetMultiShotPositionVelocity", pv) end
      R.Implemented["EntityPlayer.GetMultiShotPositionVelocity"] = true
    end
  else
    log("api_extra: the game's EntityPlayer has no GetMultiShotParams; MultiShotParams is not here")
  end
end

T.slot_arg = slot_arg
