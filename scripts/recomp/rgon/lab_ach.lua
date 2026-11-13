-- lab_ach.lua (development only; ISAAC_RGON_LAB=lab_ach.lua, round 112)
-- Where the game keeps the `achievement` attribute it parsed from players.xml,
-- items.xml and pocketitems.xml: each config entry's field, set beside what the
-- XML says, for the game's own entries (numbers) and a mod's (names).
local T = ...
local B = T.B
local r8, r32, ri32, log = B.r8, B.r32, B.ri32, B.log
local mod = RegisterMod("rgon lab ach", 1)
local XN = XMLNode

local function players()
  local man = r32(0x00c7169c)
  local first, last = r32(man + 0x2a678), r32(man + 0x2a67c)
  local out = {}
  for at = first, last - 0x148, 0x148 do out[#out + 1] = at end
  return out
end

local function dump(when)
  log("lab_ach: ---- " .. when)
  do
    local id = Isaac.GetAchievementIdByName("FF_FIENDISH_FOES")
    local text = T.store and T.store.get("achievements") or "(no store)"
    local n = 0
    for _ in pairs(T.modded_achievements or {}) do n = n + 1 end
    log(string.format("lab_ach: FF_FIENDISH_FOES %d unlocked=%s; %d unlocked in the layer; saved: %s", id, tostring(Isaac.GetPersistentGameData():Unlocked(id)), n, (tostring(text):sub(1, 200):gsub("%c", " | "))))
  end
  -- players: the game's entries against players.xml
  local px = T.xml_entries(XN.PLAYER)
  for i, at in ipairs(players()) do
    local id = ri32(at)
    local x = px and px.by_id[id]
    log(string.format("lab_ach: player #%d id=%d name=%s ach(+0xe8)=%d hidden(+0x128)=%d bskin(+0x11c)=%d tainted(+0x124)=%d custom(+0x130)=%d bg(+0x134)=0x%x portrait(+0x138)=0x%x xml.achievement=%s xml.hideachievement=%s",
      i - 1, id, B.stdstr(at + 4), ri32(at + 0xe8), r8(at + 0x128), r32(at + 0x11c), ri32(at + 0x124), r8(at + 0x130), r32(at + 0x134), r32(at + 0x138),
      tostring(x and x.achievement), tostring(x and x.hideachievement)))
  end
  -- the modded character map (vector of {normal, tainted} at 0x00c79884)
  local m0, m1 = r32(0x00c79884), r32(0x00c79888)
  local row = {}
  for at = m0, m1 - 8, 8 do row[#row + 1] = ri32(at) .. "/" .. ri32(at + 4) end
  log("lab_ach: mod character map: " .. table.concat(row, " "))
  -- items and trinkets: +0x50 against items.xml
  local cfg = Isaac.GetItemConfig()
  local n = 0
  for _, kind in ipairs({ "ITEM", "TRINKET" }) do
    local set = T.xml_entries(XN[kind])
    for _, e in ipairs(set and set.list or {}) do
      local id = tonumber(e.id)
      if id and e.achievement and n < 400 then
        local it = kind == "ITEM" and cfg:GetCollectible(id) or cfg:GetTrinket(id)
        if it then
          n = n + 1
          if not e.sourceid or n % 9 == 0 then
            log(string.format("lab_ach: %s %d (%s) %s: +0x50=%d xml=%s", kind, id, tostring(e.name), e.sourceid or "game", ri32(B.ptr(it) + 0x50), e.achievement))
          end
        end
      end
    end
  end
  -- trinkets on their own (the item loop above stops at 400)
  do
    local set, k = T.xml_entries(XN.TRINKET), 0
    for _, e in ipairs(set and set.list or {}) do
      local id = tonumber(e.id)
      if id and e.achievement and k < 40 then
        local it = cfg:GetTrinket(id)
        if it then
          k = k + 1
          log(string.format("lab_ach: TRINKET2 %d (%s) %s: +0x50=%d xml=%s", id, tostring(e.name), e.sourceid or "game", ri32(B.ptr(it) + 0x50), e.achievement))
        end
      end
    end
  end
  -- challenges: g_Manager+0x2a664 vector of 0xa4-byte entries (Manager::GetChallengeParams 0x009569a0);
  -- the list of achievements a challenge needs, a vector<int> at +0x48 (REPENTOGON's layout, checked here)
  do
    local man = r32(0x00c7169c)
    local c0, c1 = r32(man + 0x2a664), r32(man + 0x2a668)
    local set = T.xml_entries(XN.CHALLENGE)
    log(string.format("lab_ach: challenges %d entries", (c1 - c0) // 0xa4))
    for _, e in ipairs(set and set.list or {}) do
      local id = tonumber(e.id)
      if id and e.achievements then
        local at = c0 + id * 0xa4
        local v0, v1 = r32(at + 0x48), r32(at + 0x4c)
        local vals = {}
        for p = v0, v1 - 4, 4 do vals[#vals + 1] = ri32(p) end
        log(string.format("lab_ach: CHALLENGE %d (%s) %s: name=%s +0x48=[%s] xml=%s", id, tostring(e.name), e.sourceid or "game",
          B.stdstr(at), table.concat(vals, ","), e.achievements))
      end
    end
  end
  -- cards and pills: +0x4 against pocketitems.xml
  for _, kind in ipairs({ "CARD", "PILL" }) do
    local set = T.xml_entries(XN[kind])
    local k = 0
    for _, e in ipairs(set and set.list or {}) do
      local id = tonumber(e.id)
      if id and e.achievement and k < 60 then
        local it = kind == "CARD" and cfg:GetCard(id) or cfg:GetPillEffect(id)
        if it then
          k = k + 1
          log(string.format("lab_ach: %s %d (%s) %s: +0x4=%d +0x8=%d xml=%s", kind, id, tostring(e.name), e.sourceid or "game", ri32(B.ptr(it) + 4), ri32(B.ptr(it) + 8), e.achievement))
        end
      end
    end
  end
  log("lab_ach: ---- end " .. when)
end

mod:AddCallback(ModCallbacks.MC_POST_MODS_LOADED, function() dump("mods loaded") end)
mod:AddCallback(ModCallbacks.MC_POST_SAVESLOT_LOAD, function(_, slot) dump("save slot " .. tostring(slot)) end)
mod:AddCallback(ModCallbacks.MC_POST_GAME_STARTED, function()
  dump("game started")
  local lm = T.store and T.store.mod()
  if lm then
    local has0 = Isaac.HasModData(lm)
    local ok0, text0 = pcall(Isaac.LoadModData, lm)
    log(string.format("lab_ach: the layer's mod %s: HasModData=%s LoadModData=%s %s", tostring(lm.Name), tostring(has0), tostring(ok0), tostring(text0):sub(1, 120):gsub("%c", " | ")))
    local ok1, e1 = pcall(Isaac.SaveModData, lm, "rgon-save 1\n== lab\nhello")
    log(string.format("lab_ach: SaveModData -> %s %s; HasModData=%s; LoadModData=%s", tostring(ok1), tostring(e1), tostring(Isaac.HasModData(lm)), tostring(Isaac.LoadModData(lm)):gsub("%c", " | ")))
  end
end)
log("lab_ach: listening")
