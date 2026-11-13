-- lab_index.lua (development only; ISAAC_RGON_LAB=lab_index.lua with ?ISAAC_LUA_NATIVE=2, start a run)
-- Round 111: every kind of lookup luabridge's __index (0x0085cd40) answers,
-- asked every render for 600 renders, so the verify mode compares the native
-- lookup with the lifted one on each: a method of the class itself, a getter,
-- a member of a base class (method and getter, through __parent), a name no
-- class has, a number key, a method and a getter the layer added (its C
-- closures), and a static table's member.
local T = ...
local B = T.B
local say = function(s) B.log("lab_index: " .. s) end
local mod = RegisterMod("rgon lab index", 1)
local n, bad = 0, 0
local function check(what, ok)
  if not ok then
    bad = bad + 1
    if bad <= 20 then say("UNEXPECTED " .. what) end
  end
end
mod:AddCallback(ModCallbacks.MC_POST_RENDER, function()
  if n >= 600 then return end
  local p = Isaac.GetPlayer(0)
  if not p then return end
  n = n + 1
  check("method", type(p.GetName) == "function" and type(p:GetName()) == "string")
  check("getter", p.MaxFireDelay ~= nil)
  check("base getter", p.Position ~= nil and p.Position.X ~= nil)
  check("base method", type(p.IsDead) == "function" and p:IsDead() == false)
  check("base base getter", p.Velocity ~= nil)
  check("missing", p.NoSuchMemberAtAll == nil)
  check("number key", p[7] == nil)
  check("layer method", type(p.GetActiveMaxCharge) == "function" and type(p:GetActiveMaxCharge(0)) == "number")
  check("vector getter", Vector(1, 2).X == 1)
  check("room method", type(Game():GetRoom():GetFrameCount()) == "number")
  check("static", type(Isaac.GetFrameCount) == "function")
  if n % 100 == 0 then say(string.format("%d renders asked, %d unexpected", n, bad)) end
end)
