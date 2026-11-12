-- lab_xml.lua (development only; ISAAC_RGON_LAB=lab_xml.lua)
-- What the layer's XML reader sees: the mods and whether each is on, and how
-- many nodes of a few kinds came from the game and from each mod.
local T = ...
local B = T.B
for i, m in ipairs(T.mods()) do
  B.log(string.format("lab_xml: mod #%d dir=%q name=%q enabled=%s (bytes at +0xf8..0xff: %02x %02x %02x %02x %02x %02x %02x %02x)", i, m.dir, m.name, tostring(m.enabled),
    B.r8(m.address + 0xf8), B.r8(m.address + 0xf9), B.r8(m.address + 0xfa), B.r8(m.address + 0xfb), B.r8(m.address + 0xfc), B.r8(m.address + 0xfd), B.r8(m.address + 0xfe), B.r8(m.address + 0xff)))
end
for _, path in ipairs({ "resources/entities2.xml", "resources/items.xml", "resources/players.xml", "resources/achievements.xml", "resources/backdrops.xml",
                        "mods/fiendfolio-reloaded/content/entities2.xml", "mods/fiendfolio-reloaded/content-repentogon/entities2.xml" }) do
  local text = T.read_file(path)
  B.log(string.format("lab_xml: %-58s %s", path, text and (#text .. " bytes, starts " .. string.format("%q", text:sub(1, 40))) or "not found"))
end
local X = XMLNode
for _, k in ipairs({ "ENTITY", "ITEM", "TRINKET", "PLAYER", "ACHIEVEMENT", "BACKDROP", "CARD" }) do
  local set = T.xml_entries(X[k])
  local by = {}
  for _, e in ipairs(set and set.list or {}) do by[e.sourceid or "(game)"] = (by[e.sourceid or "(game)"] or 0) + 1 end
  local parts = {}
  for who, n in pairs(by) do parts[#parts + 1] = who .. "=" .. n end
  B.log("lab_xml: " .. k .. ": " .. table.concat(parts, ", "))
end
local e = XMLData.GetEntryByName(X.ENTITY, "Elephant")
B.log("lab_xml: entity named Elephant: " .. (e and ("id=" .. tostring(e.id) .. " variant=" .. tostring(e.variant) .. " subtype=" .. tostring(e.subtype) .. " from " .. tostring(e.sourceid)) or "none"))
B.log("lab_xml: achievement FF_FIEND -> " .. tostring(Isaac.GetAchievementIdByName("FF_FIEND")))
