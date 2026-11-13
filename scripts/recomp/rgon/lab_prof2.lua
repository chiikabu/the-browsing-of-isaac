-- lab_prof2.lua (development only; ISAAC_RGON_LAB=lab_prof2.lua, and start a run)
-- Which registered functions the callback time of lab_prof.lua goes to. A few
-- updates into the run every function registered for a game callback
-- (Isaac.GetCallbacks) and for a StageAPI callback (StageAPI.Callbacks) is
-- wrapped with a timer; a report every 900 updates names the 45 with the most
-- milliseconds by the file and line they are defined at, read out of
-- string.dump (there is no debug library here). The times are inclusive: a
-- function that fires other callbacks carries theirs.
local T = ...
local B = T.B
local say = function(s) B.log("lab_prof2: " .. s) end
local mod = RegisterMod("rgon lab prof2", 1)
local now = Isaac.GetTime

local function where(fn)
  local ok, d = pcall(string.dump, fn)
  if not ok or type(d) ~= "string" then return "?" end
  local n, at = d:byte(35), 36
  if n == 0xFF then n = string.unpack("<I4", d, 36) at = 40 end
  if not n or n < 2 then return (d:match("@[^%z]+%.lua") or "?") end
  local src = d:sub(at, at + n - 2)
  local ok2, line = pcall(string.unpack, "<i4", d, at + n - 1)
  return src:gsub("^@", ""):gsub("^.*/mods/", "") .. ":" .. tostring(ok2 and line or "?")
end

local ms, calls, label = {}, {}, {}
local function wrap(fn, group)
  local key = #label + 1
  label[key] = group .. " " .. where(fn)
  ms[key], calls[key] = 0, 0
  return function(...)
    local t0 = now()
    local r = table.pack(fn(...))
    ms[key] = ms[key] + (now() - t0)
    calls[key] = calls[key] + 1
    return table.unpack(r, 1, r.n)
  end
end

local names = {}
for k, v in pairs(ModCallbacks) do names[v] = k end

local armed, frames, t_window = false, 0, now()
local function arm()
  local n = 0
  for name, id in pairs(ModCallbacks) do
    local ok, list = pcall(Isaac.GetCallbacks, id)
    if ok and type(list) == "table" then
      for _, e in ipairs(list) do
        if type(e.Function) == "function" and e.Mod ~= mod then
          e.Function = wrap(e.Function, name)
          n = n + 1
        end
      end
    end
  end
  local s = 0
  if type(StageAPI) == "table" and type(StageAPI.Callbacks) == "table" then
    for id, list in pairs(StageAPI.Callbacks) do
      for _, e in ipairs(list) do
        if type(e.Function) == "function" then
          e.Function = wrap(e.Function, "StageAPI." .. tostring(id))
          s = s + 1
        end
      end
    end
  end
  say(string.format("wrapped %d game callback functions and %d StageAPI ones", n, s))
end

mod:AddCallback(ModCallbacks.MC_POST_UPDATE, function()
  frames = frames + 1
  if not armed then
    if frames >= 5 then armed = true frames = 0 t_window = now() arm() end
    return
  end
  if frames < 900 then return end
  local keys = {}
  for k in pairs(ms) do if ms[k] > 0 then keys[#keys + 1] = k end end
  table.sort(keys, function(a, b) return ms[a] > ms[b] end)
  say(string.format("REPORT %d updates in %d ms", frames, now() - t_window))
  for i = 1, math.min(45, #keys) do
    local k = keys[i]
    say(string.format("FN %6d ms %7d calls  %s", ms[k], calls[k], label[k]))
  end
  say("REPORT END")
  for k in pairs(ms) do ms[k], calls[k] = 0, 0 end
  frames, t_window = 0, now()
end)
