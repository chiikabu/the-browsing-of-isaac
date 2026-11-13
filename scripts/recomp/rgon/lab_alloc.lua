-- lab_alloc.lua (development only; ISAAC_RGON_LAB=lab_alloc.lua, start a run;
-- best with ISAAC_LUA_GC=400 so that collections are rare and the sums clean)
-- Who makes Lua's garbage: the KB the heap grows by inside each of the
-- engine's callbacks, measured around the layer's runner with
-- collectgarbage("count"). A call in which the heap shrank (a collection ran
-- inside it) is counted apart and adds nothing. Every 300 updates: the heap,
-- the KB per update made inside callbacks, and the callbacks that made most.
local T = ...
local B = T.B
local say = function(s) B.log("lab_alloc: " .. s) end
local mod = RegisterMod("rgon lab alloc", 1)

local names = {}
for k, v in pairs(ModCallbacks) do names[v] = k end

local calls, kb, shrank = {}, {}, 0
local depth = 0
local count = function() return collectgarbage("count") end
do
  local r32 = B.r32
  local engine = r32(0x00c71690)
  local holder = engine ~= 0 and r32(engine + 0x10) or 0
  if B.registry and holder ~= 0 then
    local key = B.ri32(holder + 4)
    local inner = B.registry(key)
    if type(inner) == "function" then
      B.registry(key, function(id, ...)
        if depth > 0 then return inner(id, ...) end      -- a callback fired inside another is the outer one's
        depth = 1
        local k0 = count()
        local r = table.pack(pcall(inner, id, ...))
        local d = count() - k0
        depth = 0
        calls[id] = (calls[id] or 0) + 1
        if d >= 0 then kb[id] = (kb[id] or 0) + d else shrank = shrank + 1 end
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

local function top(t, n)
  local keys = {}
  for k in pairs(t) do keys[#keys + 1] = k end
  table.sort(keys, function(a, b) return t[a] > t[b] end)
  local out = {}
  for i = 1, math.min(n, #keys) do out[i] = keys[i] end
  return out
end

local frames, window = 0, 0
mod:AddCallback(ModCallbacks.MC_POST_UPDATE, function()
  frames = frames + 1
  if frames < 300 then return end
  window = window + 1
  local total = 0
  for _, v in pairs(kb) do total = total + v end
  say(string.format("REPORT %d: heap %.0f KB; %.0f KB made inside callbacks in %d updates (%.1f KB an update); %d call(s) with a collection inside",
    window, count(), total, frames, total / frames, shrank))
  for _, id in ipairs(top(kb, 12)) do
    say(string.format("CB %8.0f KB %7d calls %7.2f KB a call  %s", kb[id], calls[id], kb[id] / calls[id], tostring(names[id] or id)))
  end
  calls, kb, shrank, frames = {}, {}, 0, 0
end)
