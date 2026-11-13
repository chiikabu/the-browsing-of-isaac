-- lab_gc.lua (development only; ISAAC_RGON_LAB=lab_gc.lua, start a run)
-- What the game asks of Lua's collector. Once per pass of its main loop the
-- game (0x008657c0, the Lua engine at [0x00c71690]) reads the heap's size,
-- keeps its growth over the last ten passes, and steps the collector by n
-- ([engine+0x24], never below 50, at most 10,000; [engine+0x54] is a hold of
-- 600 passes after n was raised). This prints, every 120 renders: the heap in
-- KB now and its lowest and highest since the last line, n now and its lowest
-- and highest, the hold, and the number of collector cycles that ended (the
-- heap fell by more than a tenth between two renders).
-- A render that comes 50 ms or more after the one before it is logged with the
-- heap's size and its change (the first 60 of them).
-- ISAAC_RGON_LAB_GC=<n> writes n into [engine+0x24] on every render (an
-- experiment: the game then steps by that much, plus whatever it adds itself).
local T = ...
local B = T.B
local say = function(s) B.log("lab_gc: " .. s) end
local mod = RegisterMod("rgon lab gc", 1)
local ENGINE = 0x00c71690
local f, lo, hi, nlo, nhi, cycles, last = 0, math.huge, 0, math.huge, 0, 0, nil
local force = tonumber(B.env("ISAAC_RGON_LAB_GC"))
local tlast, kprev, spikes = nil, nil, 0
mod:AddCallback(ModCallbacks.MC_POST_RENDER, function()
  f = f + 1
  local e = B.r32(ENGINE)
  if e == 0 then return end
  local kb = collectgarbage("count")
  local n = B.r32(e + 0x24)
  if force then B.w32(e + 0x24, force) end
  if kb < lo then lo = kb end
  if kb > hi then hi = kb end
  if n < nlo then nlo = n end
  if n > nhi then nhi = n end
  if last and kb < last * 0.9 then cycles = cycles + 1 end
  last = kb
  local now = Isaac.GetTime()
  if tlast and now - tlast >= 50 and spikes < 60 then
    spikes = spikes + 1
    say(string.format("spike %d ms at render %d: heap %.0f KB (%+.0f since the last render), n %d", now - tlast, f, kb, kb - (kprev or kb), n))
  end
  tlast, kprev = now, kb
  if f % 120 == 0 then
    say(string.format("render %d: heap %.0f KB (%.0f..%.0f), n %d (%d..%d), hold %d, big drops %d",
      f, kb, lo, hi, n, nlo, nhi, B.r32(e + 0x54), cycles))
    lo, hi, nlo, nhi = math.huge, 0, math.huge, 0
  end
end)
