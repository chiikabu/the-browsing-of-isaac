-- lab_cbsize.lua (development only; ISAAC_RGON_LAB=lab_cbsize.lua, start a run)
-- How long the callback lists are, and how much of one a single firing uses:
-- for each callback with 20 or more functions, the list's length, how many
-- entries have no parameter (or -1) and so run for every firing, how many
-- distinct parameters the rest have, and whether the list brings its own
-- matching rule (__matchParams). Logged once, 60 updates into the first run.
local T = ...
local B = T.B
local say = function(s) B.log("lab_cbsize: " .. s) end
local mod = RegisterMod("rgon lab cbsize", 1)
local names = {}
for k, v in pairs(ModCallbacks) do names[v] = k end
local n, done = 0, false
mod:AddCallback(ModCallbacks.MC_POST_UPDATE, function()
  n = n + 1
  if done or n < 60 then return end
  done = true
  local rows = {}
  for name, id in pairs(ModCallbacks) do
    local ok, list = pcall(Isaac.GetCallbacks, id)
    if ok and type(list) == "table" and #list >= 20 then
      local wild, params, kinds = 0, {}, 0
      for _, e in ipairs(list) do
        local p = e.Param
        if p == nil or p == -1 then wild = wild + 1
        elseif not params[p] then params[p] = true kinds = kinds + 1 end
      end
      local mt = getmetatable(list)
      rows[#rows + 1] = { #list, string.format("%5d functions, %4d for every firing, %4d distinct parameters%s  %s",
        #list, wild, kinds, (mt and mt.__matchParams) and ", OWN RULE" or "", name) }
    end
  end
  table.sort(rows, function(a, b) return a[1] > b[1] end)
  for i = 1, math.min(40, #rows) do say(rows[i][2]) end
  say("END " .. #rows .. " lists of 20 or more")
end)
