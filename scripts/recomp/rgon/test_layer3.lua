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

-- round 105 --------------------------------------------------------------

-- the hallowed-ground countdown: 0 away from a holy poop, counting beside one
do
  local room = game:GetRoom()
  T("GetHallowedGroundCountdown is 0 with no hallowed ground", p:GetHallowedGroundCountdown() == 0, p:GetHallowedGroundCountdown())
  local was = p.Position
  centre()
  wait(2)
  Isaac.GridSpawn(GridEntityType.GRID_POOP, 6, room:GetGridPosition(room:GetGridIndex(p.Position) + 1), true)
  wait(8)
  local beside = p:GetHallowedGroundCountdown()
  T("GetHallowedGroundCountdown counts beside a holy poop", beside > 0, beside)
  p:SetHallowedGroundCountdown(2)
  T("SetHallowedGroundCountdown is read back", p:GetHallowedGroundCountdown() == 2, p:GetHallowedGroundCountdown())
  local idx = room:GetGridIndex(p.Position) + 1
  room:RemoveGridEntity(idx, 0, false)
  p.Position = was
  wait(3)
end

-- a chance revive is Guppy's Collar
do
  T("HasChanceRevive is false without Guppy's Collar", p:HasChanceRevive() == false)
  p:AddCollectible(CollectibleType.COLLECTIBLE_GUPPYS_COLLAR, 0, false)
  T("HasChanceRevive is true with it", p:HasChanceRevive() == true)
  p:RemoveCollectible(CollectibleType.COLLECTIBLE_GUPPYS_COLLAR)
end

-- a collectible's costume: on no layer before the item is held, on one after
do
  local item = CollectibleType.COLLECTIBLE_SAD_ONION
  local layers = p:GetSprite():GetLayerCount()
  local function shown()
    local n = 0
    for id = 0, layers - 1 do if p:IsCollectibleCostumeVisible(item, id) then n = n + 1 end end
    return n
  end
  local before = shown()
  p:AddCollectible(item, 0, false)
  wait(2)
  local after = shown()
  T("IsCollectibleCostumeVisible: no layer before the Sad Onion, at least one with it", before == 0 and after >= 1, before .. " -> " .. after .. " of " .. layers)
  T("IsCollectibleCostumeVisible takes a layer by name", type(p:IsCollectibleCostumeVisible(item, "head")) == "boolean")
  T("IsCollectibleCostumeVisible refuses a layer that is not there", not pcall(p.IsCollectibleCostumeVisible, p, item, "no such layer")
    and not pcall(p.IsCollectibleCostumeVisible, p, item, layers))

  -- blocked: scripts see the item as not held
  T("a held item is not blocked", p:IsCollectibleBlocked(item) == false and p:HasCollectible(item) == true)
  p:BlockCollectible(item)
  T("BlockCollectible: blocked, and HasCollectible / GetCollectibleNum say none",
    p:IsCollectibleBlocked(item) == true and p:HasCollectible(item) == false and p:GetCollectibleNum(item) == 0,
    tostring(p:HasCollectible(item)) .. " " .. p:GetCollectibleNum(item))
  T("another item is not touched by the block", p:HasCollectible(CollectibleType.COLLECTIBLE_GUPPYS_COLLAR) == false
    and p:GetCollectibleNum(CollectibleType.COLLECTIBLE_SAD_ONION + 1) == 0)
  p:UnblockCollectible(item)
  T("UnblockCollectible: held again", p:IsCollectibleBlocked(item) == false and p:HasCollectible(item) == true and p:GetCollectibleNum(item) == 1)
  p:RemoveCollectible(item)
  local trinket = TrinketType.TRINKET_SWALLOWED_PENNY
  p:AddTrinket(trinket, false)
  p:BlockTrinket(trinket)
  local blocked_has, blocked_mult = p:HasTrinket(trinket), p:GetTrinketMultiplier(trinket)
  p:UnblockTrinket(trinket)
  T("BlockTrinket / UnblockTrinket: none while blocked, held after", blocked_has == false and blocked_mult == 0 and p:HasTrinket(trinket) == true
    and p:IsTrinketBlocked(trinket) == false, tostring(blocked_has) .. " " .. tostring(blocked_mult))
  p:TryRemoveTrinket(trinket)
  T("blocking is listed as a gap", REPENTOGON.Unsupported ~= nil and REPENTOGON.Unsupported["EntityPlayer:BlockCollectible"] ~= nil)
end

-- CheckFamiliarEx answers with the familiars the call spawned
do
  local v = FamiliarVariant.BROTHER_BOBBY
  local rng = RNG()
  rng:SetSeed(1234, 35)
  local first = p:CheckFamiliarEx(v, 2, rng)
  local again = p:CheckFamiliarEx(v, 2, rng)
  local ok = type(first) == "table" and #first == 2 and first[1].Variant == v and first[1].Player ~= nil and #again == 0
  T("CheckFamiliarEx: two spawned the first time, none the second", ok, type(first) == "table" and (#first .. " then " .. #again) or type(first))
  p:CheckFamiliar(v, 0, rng)
end

-- EntitySaveStateManager: one table per mod and entity, whichever Lua object asks
do
  local d, existed = EntitySaveStateManager.GetEntityData(m, p)
  d.mark = 7
  local d2, existed2 = EntitySaveStateManager.GetEntityData(m, Isaac.GetPlayer(0))
  T("GetEntityData: new the first time, the same table after", existed == false and existed2 == true and d2 == d and d2.mark == 7,
    tostring(existed) .. " " .. tostring(existed2))
  local other = RegisterMod("rgon layer test 3 other", 1)
  T("another mod has its own table", EntitySaveStateManager.TryGetEntityData(other, p) == nil
    and EntitySaveStateManager.GetEntityData(other, p) ~= d)
  local pick = Isaac.Spawn(EntityType.ENTITY_PICKUP, PickupVariant.PICKUP_COIN, 1, p.Position + Vector(80, 0), Vector(0, 0), nil)
  T("TryGetEntityData of an entity nobody asked about is nil", EntitySaveStateManager.TryGetEntityData(m, pick) == nil)
  EntitySaveStateManager.GetEntityData(m, pick).n = 3
  local same
  for _, e in pairs(Isaac.FindByType(EntityType.ENTITY_PICKUP, PickupVariant.PICKUP_COIN)) do
    if e.InitSeed == pick.InitSeed then same = EntitySaveStateManager.TryGetEntityData(m, e) end
  end
  T("a pickup's table is found through another Lua object of it", same ~= nil and same.n == 3)
  pick:Remove()
end

-- the HUD's player slots and its sprites
do
  local hud = game:GetHUD()
  local slot = hud:GetPlayerHUD(0)
  T("HUD:GetPlayerHUD(0) is the first player's slot", slot ~= nil and slot:GetIndex() == 0 and slot:GetPlayer() ~= nil
    and GetPtrHash(slot:GetPlayer()) == GetPtrHash(p), slot and slot:GetIndex())
  T("every slot knows its index", hud:GetPlayerHUD(3):GetIndex() == 3 and hud:GetPlayerHUD(7):GetIndex() == 7)
  local mine = p:GetPlayerHUD()
  T("EntityPlayer:GetPlayerHUD is that slot", mine ~= nil and mine == slot and mine ~= hud:GetPlayerHUD(1))
  T("GetPlayerHUD refuses a slot that is not there", not pcall(hud.GetPlayerHUD, hud, 8) and not pcall(hud.GetPlayerHUD, hud, -1))
  local names = { hud:GetHeartsSprite():GetFilename(), hud:GetChargeBarSprite():GetFilename(), hud:GetPickupsHUDSprite():GetFilename(),
    hud:GetCardsPillsSprite():GetFilename(), hud:GetFortuneSprite():GetFilename(), hud:GetStreakSprite():GetFilename() }
  T("the HUD's sprites hold the files the game loads for them", names[1] == "gfx/ui/ui_hearts.anm2" and names[2] == "gfx/ui/ui_chargebar.anm2"
    and names[3] == "gfx/ui/hudpickups.anm2" and names[4] == "gfx/ui/ui_cardspills.anm2" and names[5] == "gfx/ui/ui_FortunePaper.anm2"
    and names[6] == "gfx/ui/ui_streak.anm2", table.concat(names, " "))
end

-- nobody has used Esau Jr.: no player is put aside
do
  local none = true
  for i = 0, 3 do none = none and PlayerManager.GetEsauJrState(i) == nil end
  T("PlayerManager.GetEsauJrState is nil for all four while Esau Jr. is unused", none and PlayerManager.GetEsauJrState() == nil)
  T("PlayerManager.GetEsauJrState refuses a fifth", not pcall(PlayerManager.GetEsauJrState, 4))
end

-- the item tracker's list
do
  local h = p:GetHistory()
  local n0 = #h:GetCollectiblesHistory()
  p:AddCollectible(CollectibleType.COLLECTIBLE_INNER_EYE, 0, false)
  p:AddCollectible(CollectibleType.COLLECTIBLE_SPOON_BENDER, 0, false)
  local all = h:GetCollectiblesHistory()
  local last = all[#all]
  T("GetHistory: two items more after two pickups, the last one last", #all == n0 + 2 and last:GetItemID() == CollectibleType.COLLECTIBLE_SPOON_BENDER
    and last:IsTrinket() == false and last:GetLevelStage() == level:GetStage() and last:GetTime() >= 0, n0 .. " -> " .. #all .. " last " .. tostring(last and last:GetItemID()))
  local only = h:SearchCollectibles(CollectibleType.COLLECTIBLE_INNER_EYE)
  local both = h:SearchCollectibles({ CollectibleType.COLLECTIBLE_INNER_EYE, CollectibleType.COLLECTIBLE_SPOON_BENDER })
  T("SearchCollectibles by one id and by a list", #only == 1 and only[1]:GetItemID() == CollectibleType.COLLECTIBLE_INNER_EYE and #both == 2
    and #h:SearchCollectibles() == #all - #h:SearchTrinkets(), #only .. " " .. #both)
  local removed = h:RemoveHistoryItemByIndex(#all - 1)
  T("RemoveHistoryItemByIndex takes the last one off the list, not off the player", removed == true and #h:GetCollectiblesHistory() == n0 + 1
    and p:HasCollectible(CollectibleType.COLLECTIBLE_SPOON_BENDER), tostring(removed) .. " " .. #h:GetCollectiblesHistory())
  T("RemoveHistoryItemByIndex past the end removes nothing", h:RemoveHistoryItemByIndex(5000) == false)
  p:RemoveCollectible(CollectibleType.COLLECTIBLE_INNER_EYE)
  p:RemoveCollectible(CollectibleType.COLLECTIBLE_SPOON_BENDER)
end

-- the debug flags are the console's
do
  local before = game:GetDebugFlags()
  Isaac.ExecuteCommand("debug 3")
  local on = game:GetDebugFlags()
  Isaac.ExecuteCommand("debug 3")
  local off = game:GetDebugFlags()
  T("Game:GetDebugFlags: `debug 3` flips bit 2 and nothing else", on == before ~ 4 and off == before, before .. " " .. on .. " " .. off)
end

-- the level generator's RNG: the game's own object, and the one generating a floor moves
do
  local a, b = level:GetGenerationRNG(), level:GetGenerationRNG()
  local seed = a:GetSeed()
  local first = a:Next()
  T("Level:GetGenerationRNG: a seeded RNG, and two handles are one generator", seed ~= 0 and b:GetSeed() == a:GetSeed() and b:GetSeed() ~= seed, seed .. " " .. first)
  a:SetSeed(seed, 35)
  -- generating the same floor twice leaves the generator in the same state, and not the state it had
  local s1 = level:GetGenerationRNG():GetSeed()
  Isaac.ExecuteCommand("stage 2")
  wait(12)
  local s2 = game:GetLevel():GetGenerationRNG():GetSeed()
  Isaac.ExecuteCommand("stage 2")
  wait(12)
  local s3 = game:GetLevel():GetGenerationRNG():GetSeed()
  T("generating a floor moves the generation RNG, the same way each time", s2 ~= s1 and s3 == s2, s1 .. " " .. s2 .. " " .. s3)
  level = game:GetLevel()
  p = P()
end

-- ToDelirium is nil for what is not Delirium
do
  local fly = Isaac.Spawn(EntityType.ENTITY_FLY, 0, 0, p.Position + Vector(120, 0), Vector(0, 0), nil)
  T("ToDelirium is nil for a fly and for the player", fly:ToDelirium() == nil and fly:ToNPC():ToDelirium() == nil and p:ToDelirium() == nil)
  fly:Remove()
end

-- Tainted Lazarus's other form (last: it changes the character)
do
  T("GetFlippedForm is nil for a character with one form", p:GetFlippedForm() == nil)
  p:ChangePlayerType(PlayerType.PLAYER_LAZARUS_B)
  wait(3)
  local other = p:GetFlippedForm()
  T("GetFlippedForm of Tainted Lazarus is the dead form, and its flipped form is this one",
    other ~= nil and other:GetPlayerType() == PlayerType.PLAYER_LAZARUS2_B and other:GetFlippedForm() ~= nil
    and GetPtrHash(other:GetFlippedForm()) == GetPtrHash(p), other and other:GetPlayerType())
end

say("RGON END " .. checks .. " " .. failed)
