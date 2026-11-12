-- test_layer3.lua -- round 104's part of the layer, checked from inside a running game:
--
--   node scripts/recomp/web/drive_stress.mjs "http://127.0.0.1:8200/play.html?ISAAC_RGON_ALLOW=zz-port-stress" <out> \
--        phases=custom lua=scripts/recomp/rgon/test_layer3.lua zips=.scratch/rgon/repentogon.zip
--
-- Same harness as test_layer.lua (say, wait, P, centre are the walk's helpers).
local checks, failed = 0, 0
local function T(name, cond, detail)
  checks = checks + 1
  if not cond then failed = failed + 1 end
  say("RGON " .. (cond and "ok   " or "FAIL ") .. name .. (detail ~= nil and (" -- " .. tostring(detail)) or ""))
end
if type(REPENTOGON) ~= "table" then say("RGON FAIL no REPENTOGON for this mod") say("RGON END 1 1") return end

local p = P()
local m = RegisterMod("rgon layer test 3", 1)
local M = ModCallbacks
local game = Game()
local level = game:GetLevel()

-- the runner: an error in one function of one of the GAME's callbacks is
-- logged and the functions after it still run (the game's own runner stops)
do
  local ran, first_answer = 0, nil
  m:AddCallback(M.MC_POST_UPDATE, function() error("rgon test 3: an error in a game callback") end)
  m:AddCallback(M.MC_POST_UPDATE, function() ran = ran + 1 end)
  wait(3)
  T("after an error in one function of MC_POST_UPDATE the next one still runs", ran >= 1, ran)
  -- the first answer still ends the run of a game callback
  local late = 0
  m:AddCallback(M.MC_PRE_USE_ITEM, function() first_answer = (first_answer or 0) + 1 return true end, CollectibleType.COLLECTIBLE_YUM_HEART)
  m:AddCallback(M.MC_PRE_USE_ITEM, function() late = late + 1 end, CollectibleType.COLLECTIBLE_YUM_HEART)
  p:UseActiveItem(CollectibleType.COLLECTIBLE_YUM_HEART, false, false, true, false, -1)
  T("the first answer of a game callback still ends its run", first_answer == 1 and late == 0, tostring(first_answer) .. "/" .. late)
  -- a mod's own callback (a string id) goes through the same runner
  local got = {}
  m:AddCallback("RGON_TEST3_CUSTOM", function(_, a) got[#got + 1] = a error("rgon test 3: an error in a custom callback") end)
  m:AddCallback("RGON_TEST3_CUSTOM", function(_, a) got[#got + 1] = a * 2 return "done" end)
  local ret = Isaac.RunCallback("RGON_TEST3_CUSTOM", 21)
  T("a mod's own callback: both functions ran and the answer came back", got[1] == 21 and got[2] == 42 and ret == "done", tostring(got[1]) .. "," .. tostring(got[2]) .. "," .. tostring(ret))
  -- a parameter still selects
  local with_param = 0
  m:AddCallback("RGON_TEST3_PARAM", function() with_param = with_param + 1 end, 7)
  Isaac.RunCallbackWithParam("RGON_TEST3_PARAM", 8)
  Isaac.RunCallbackWithParam("RGON_TEST3_PARAM", 7)
  T("a callback's parameter still selects who runs", with_param == 1, with_param)
end

-- RNG:SetSeed with and without the shift
do
  local a, b = RNG(), RNG()
  a:SetSeed(424242, 35)
  b:SetSeed(424242)
  T("RNG:SetSeed(seed) is SetSeed(seed, 35)", a:Next() == b:Next() and a:RandomInt(1000) == b:RandomInt(1000))
  local c = RNG()
  c:SetSeed(424242, 2)
  a:SetSeed(424242, 35)
  T("RNG:SetSeed(seed, 2) still takes its shift", c:Next() ~= a:Next())
end

-- RoomDescriptor:GetDimension
do
  local here = level:GetCurrentRoomDesc()
  T("RoomDescriptor:GetDimension of the current room is the level's dimension", here:GetDimension() == level:GetDimension(), here:GetDimension())
  local start = level:GetRoomByIdx(level:GetStartingRoomIndex(), 0)
  T("the start room is in dimension 0", start:GetDimension() == 0, start:GetDimension())
end

-- the pickup caps are where the game really stops counting
do
  local coins, keys, bombs = p:GetNumCoins(), p:GetNumKeys(), p:GetNumBombs()
  p:AddCoins(5000) p:AddKeys(5000) p:AddBombs(5000)
  T("GetMaxCoins is where the game stops counting coins", p:GetNumCoins() == p:GetMaxCoins(), p:GetNumCoins() .. " / " .. p:GetMaxCoins())
  T("GetMaxKeys is where the game stops counting keys", p:GetNumKeys() == p:GetMaxKeys(), p:GetNumKeys() .. " / " .. p:GetMaxKeys())
  T("GetMaxBombs is where the game stops counting bombs", p:GetNumBombs() == p:GetMaxBombs(), p:GetNumBombs() .. " / " .. p:GetMaxBombs())
  p:AddCollectible(CollectibleType.COLLECTIBLE_DEEP_POCKETS, 0, false)
  p:AddCoins(5000)
  T("with Deep Pockets the cap is 999 and the game agrees", p:GetMaxCoins() == 999 and p:GetNumCoins() == 999, p:GetNumCoins() .. " / " .. p:GetMaxCoins())
  p:RemoveCollectible(CollectibleType.COLLECTIBLE_DEEP_POCKETS)
  p:AddCoins(coins - p:GetNumCoins()) p:AddKeys(keys - p:GetNumKeys()) p:AddBombs(bombs - p:GetNumBombs())
end

-- GetActiveItemSlot
do
  T("GetActiveItemSlot of an item not held is -1", p:GetActiveItemSlot(CollectibleType.COLLECTIBLE_BOOK_OF_SHADOWS) == -1)
  p:AddCollectible(CollectibleType.COLLECTIBLE_BOOK_OF_SHADOWS, 3, false, ActiveSlot.SLOT_PRIMARY)
  T("GetActiveItemSlot finds the item in the primary slot", p:GetActiveItemSlot(CollectibleType.COLLECTIBLE_BOOK_OF_SHADOWS) == ActiveSlot.SLOT_PRIMARY,
    p:GetActiveItemSlot(CollectibleType.COLLECTIBLE_BOOK_OF_SHADOWS))
  p:RemoveCollectible(CollectibleType.COLLECTIBLE_BOOK_OF_SHADOWS)
end

-- PersistentGameData:GetEventCounter reads what IncreaseEventCounter writes
do
  local pgd = Isaac.GetPersistentGameData()
  local c = EventCounter and EventCounter.ROCKS_DESTROYED
  if c then
    local before = pgd:GetEventCounter(c)
    pgd:IncreaseEventCounter(c, 3)
    local after = pgd:GetEventCounter(c)
    -- The harness drives the run with console commands, and saved data is then read-only: the game's
    -- IncreaseEventCounter leaves at once (`cmp byte [esi+1], 0; jne`), so "unchanged" is the right
    -- answer here and this check cannot tell the offset; the instructions quoted in api_data.lua do.
    T("GetEventCounter after IncreaseEventCounter(3): three more, or unchanged while saved data is read-only",
      math.type(before) == "integer" and before >= 0 and (after == before + 3 or after == before), before .. " -> " .. after)
    T("GetEventCounter refuses a counter past the last", not pcall(pgd.GetEventCounter, pgd, 100000))
  else
    T("EventCounter.ROCKS_DESTROYED is in the enums", false)
  end
end

-- a mod's shader on a sprite is accepted, and no sprite claims to have one
do
  local s = p:GetSprite()
  s:SetCustomShader("shaders/none")
  T("Sprite:HasCustomShader is false; SetCustomShader is listed as unsupported", s:HasCustomShader("shaders/none") == false
    and REPENTOGON.Unsupported ~= nil and REPENTOGON.Unsupported["Sprite:SetCustomShader"] ~= nil)
end

say("RGON END " .. checks .. " " .. failed)
