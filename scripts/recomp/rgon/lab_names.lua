-- lab_names.lua (development only; ISAAC_RGON_LAB=lab_names.lua)
-- Every name the layer says it implements, one log line each ("lab_names: I <name>"),
-- and every callback id it fires ("lab_names: C <id>"): what a census of mods is
-- measured against (tools/gate_census.py). Logged as the layer loads.
local T = ...
local B = T.B
local R = T.R or REPENTOGON
local names, ids = {}, {}
for k in pairs(R.Implemented) do
  if type(k) == "number" then ids[#ids + 1] = k else names[#names + 1] = tostring(k) end
end
table.sort(names)
table.sort(ids)
for _, n in ipairs(names) do B.log("lab_names: I " .. n) end
for _, id in ipairs(ids) do B.log("lab_names: C " .. id) end
B.log("lab_names: END " .. #names .. " names, " .. #ids .. " callbacks")
