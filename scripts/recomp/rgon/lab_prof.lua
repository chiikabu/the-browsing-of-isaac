-- lab_prof.lua (development only; ISAAC_RGON_LAB=lab_prof.lua, and start a run)
-- Where the Lua time of a frame goes with mods loaded, two ways:
--   * the engine's callbacks: calls and milliseconds per callback id, measured
--     around the layer's runner (Isaac.GetTime is whole milliseconds, so one
--     call's time is noise and the sum over a window is what counts);
--   * the Lua functions running, sampled every 1000 VM instructions through
--     debug.sethook when the debug library is there (VM work only: the time a
--     function spends inside the game's C functions is not in it).
-- A report is logged every 900 updates and the counters start again.
local T = ...
local B = T.B
local say = function(s) B.log("lab_prof: " .. s) end
local mod = RegisterMod("rgon lab prof", 1)

local names = {}
for k, v in pairs(ModCallbacks) do names[v] = k end

local calls, ms = {}, {}
local depth = 0
local now = Isaac.GetTime
do
  local r32 = B.r32
  local engine = r32(0x00c71690)
  local holder = engine ~= 0 and r32(engine + 0x10) or 0
  if B.registry and holder ~= 0 then
    local key = B.ri32(holder + 4)
    local inner = B.registry(key)
    if type(inner) == "function" then
      B.registry(key, function(id, ...)
        if depth > 0 then return inner(id, ...) end      -- a callback fired inside another is the outer one's time
        depth = 1
        local t0 = now()
        local r = table.pack(pcall(inner, id, ...))
        local dt = now() - t0
        depth = 0
        calls[id] = (calls[id] or 0) + 1
        ms[id] = (ms[id] or 0) + dt
        if not r[1] then error(r[2], 0) end
        return table.unpack(r, 2, r.n)
      end)
      say("the runner is watched")
    else
      say("no runner at the registry key")
    end
  else
    say("the engine's runner reference was not found")
  end
end

local samples, nsamples = {}, 0
local hooked = false
local function hook()
  local i = debug.getinfo(2, "S")
  if i then
    local k = i.short_src .. ":" .. i.linedefined
    samples[k] = (samples[k] or 0) + 1
    nsamples = nsamples + 1
  end
end

local function top(t, n)
  local keys = {}
  for k in pairs(t) do keys[#keys + 1] = k end
  table.sort(keys, function(a, b) return t[a] > t[b] end)
  local out = {}
  for i = 1, math.min(n, #keys) do out[i] = keys[i] end
  return out
end

local frames, t_window = 0, now()
mod:AddCallback(ModCallbacks.MC_POST_UPDATE, function()
  if not hooked then
    hooked = true
    if type(debug) == "table" and type(debug.sethook) == "function" then
      debug.sethook(hook, "", 1000)
      say("sampling Lua functions every 1000 instructions")
    else
      say("no debug.sethook here: callbacks only")
    end
  end
  frames = frames + 1
  if frames < 900 then return end
  local wall = now() - t_window
  local total = 0
  for _, v in pairs(ms) do total = total + v end
  say(string.format("REPORT %d updates in %d ms; callbacks took %d ms (%.1f%% of the window)", frames, wall, total, 100 * total / math.max(1, wall)))
  for _, id in ipairs(top(ms, 18)) do
    say(string.format("CB %6d ms %7d calls  %s", ms[id], calls[id], tostring(names[id] or id)))
  end
  for _, k in ipairs(top(samples, 40)) do
    say(string.format("FN %5.1f%% %6d  %s", 100 * samples[k] / math.max(1, nsamples), samples[k], k))
  end
  say("REPORT END " .. nsamples .. " samples")
  calls, ms, samples, nsamples, frames, t_window = {}, {}, {}, 0, 0, now()
end)
