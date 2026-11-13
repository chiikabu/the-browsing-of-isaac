-- test_ach.lua -- a mod's named achievements on the game's content (round 112),
-- checked from inside a running game, with the content mod tools/test_ach_mod.mjs
-- makes installed beside the layer:
--
--   node scripts/recomp/rgon/pack.mjs <layer.zip>
--   node scripts/recomp/rgon/tools/test_ach_mod.mjs <achmod.zip>
--   node scripts/recomp/web/drive_stress.mjs "http://127.0.0.1:8200/play.html?ISAAC_RGON_ALLOW=zz-port-stress" <out> \
--        phases=custom lua=scripts/recomp/rgon/test_ach.lua zips=<layer.zip>,<achmod.zip> retries=1
--
-- A fresh browser profile: nothing unlocked. Part 1 checks what the game finds
-- in each entry while the achievements are locked (the game's own Lua members
-- AchievementID read the fields it tests), that the treasure pool does not hand
-- out the locked collectible, unlocks and locks, and restarts the run to see the
-- unlocked collectible in the pool. It then reloads the page (KEYS reload); part 2
-- checks what the layer's save file brought back. The walk's own save data says
-- which part it is in.
local checks, failed = 0, 0
local function T(name, cond, detail)
  checks = checks + 1
  if not cond then failed = failed + 1 end
  say("RGON " .. (cond and "ok   " or "FAIL ") .. name .. (detail ~= nil and (" -- " .. tostring(detail)) or ""))
end
if type(REPENTOGON) ~= "table" then say("RGON FAIL no REPENTOGON for this mod") say("RGON END 1 1") return end

local pgd = Isaac.GetPersistentGameData()
local cfg = Isaac.GetItemConfig()
local CHAR, ITEM, CARD, HIDE = Isaac.GetAchievementIdByName("R112_CHAR"), Isaac.GetAchievementIdByName("R112_ITEM"),
  Isaac.GetAchievementIdByName("R112_CARD"), Isaac.GetAchievementIdByName("R112_HIDE")
local item, trinket = Isaac.GetItemIdByName("R112 Item"), Isaac.GetTrinketIdByName("R112 Trinket")
local card, pill = Isaac.GetCardIdByName("R112 Card"), Isaac.GetPillEffectByName("R112 Pill")
local pchar, phid = Isaac.GetPlayerTypeByName("R112Char"), Isaac.GetPlayerTypeByName("R112Hidden")
local function ach_of(kind)
  if kind == "item" then return cfg:GetCollectible(item).AchievementID end
  if kind == "trinket" then return cfg:GetTrinket(trinket).AchievementID end
  if kind == "card" then return cfg:GetCard(card).AchievementID end
  if kind == "pill" then return cfg:GetPillEffect(pill).AchievementID end
  if kind == "char" then return EntityConfig.GetPlayer(pchar):GetAchievementID() end
end
local function hidden() return EntityConfig.GetPlayer(phid):IsHidden() end
local function fields() return string.format("item %s trinket %s card %s pill %s char %s hidden %s", tostring(ach_of("item")), tostring(ach_of("trinket")),
  tostring(ach_of("card")), tostring(ach_of("pill")), tostring(ach_of("char")), tostring(hidden())) end

-- the treasure pool with every other collectible taken out: what it hands out (the game's own draw)
local function treasure_draws()
  local pool = game:GetItemPool()
  local max = cfg:GetCollectibles().Size - 1
  for id = 1, max do if id ~= item then pool:RemoveCollectible(id) end end
  local got = {}
  for i = 1, 12 do
    local c = pool:GetCollectible(ItemPoolType.POOL_TREASURE, false, 0x1234567 + i * 7919, CollectibleType.COLLECTIBLE_NULL)
    got[#got + 1] = c
  end
  local n = 0
  for _, c in ipairs(got) do if c == item then n = n + 1 end end
  return n, table.concat(got, ",")
end

local resume = Isaac.HasModData(M) and Isaac.LoadModData(M) or ""
local c1, f1 = resume:match("^r112 part 2 (%d+) (%d+)$")
if not c1 then
  ---------------------------------------------------------------- part 1
  T("the test content is there", item > 0 and trinket > 0 and card > 0 and pill > 0 and pchar > 0 and phid > 0,
    string.format("item %d trinket %d card %d pill %d char %d hidden %d", item, trinket, card, pill, pchar, phid))
  T("each achievement has a mod's number (0x282 up), one each", CHAR >= 0x282 and ITEM >= 0x282 and CARD >= 0x282 and HIDE >= 0x282
    and CHAR ~= ITEM and ITEM ~= CARD and CARD ~= HIDE and CHAR ~= HIDE, string.format("%d %d %d %d", CHAR, ITEM, CARD, HIDE))
  T("a fresh profile: none of them unlocked", not pgd:Unlocked(CHAR) and not pgd:Unlocked(ITEM) and not pgd:Unlocked(CARD) and not pgd:Unlocked(HIDE))
  T("locked: each entry holds its achievement's number (the game's own test then says locked)",
    ach_of("item") == ITEM and ach_of("trinket") == ITEM and ach_of("card") == CARD and ach_of("pill") == CARD and ach_of("char") == CHAR, fields())
  T("locked: the character with hideachievement is hidden", hidden() == true)
  T("a game's character keeps its own number (Magdalene: 1, Isaac: -1)", EntityConfig.GetPlayer(1):GetAchievementID() == 1
    and EntityConfig.GetPlayer(0):GetAchievementID() == -1, EntityConfig.GetPlayer(1):GetAchievementID())
  T("a game's collectible keeps its own number (Dr. Fetus: 11)", cfg:GetCollectible(52).AchievementID == 11, cfg:GetCollectible(52).AchievementID)

  local n, list = treasure_draws()
  T("locked: the treasure pool, every other collectible out, never hands it out", n == 0, list)

  local fired = {}
  local cb = function(_, a) fired[#fired + 1] = a end
  M:AddCallback(ModCallbacks.MC_POST_ACHIEVEMENT_UNLOCK, cb)
  T("TryUnlock(R112_ITEM) unlocks it", pgd:TryUnlock(ITEM, true) == true and pgd:Unlocked(ITEM) == true)
  T("... and fires MC_POST_ACHIEVEMENT_UNLOCK once with it", #fired == 1 and fired[1] == ITEM, table.concat(fired, ","))
  T("... a second TryUnlock answers false", pgd:TryUnlock(ITEM, true) == false and #fired == 1)
  T("unlocked: the collectible and the trinket hold -1 (the game's test says unlocked), the rest unchanged",
    ach_of("item") == -1 and ach_of("trinket") == -1 and ach_of("card") == CARD and ach_of("char") == CHAR, fields())
  M:RemoveCallback(ModCallbacks.MC_POST_ACHIEVEMENT_UNLOCK, cb)

  T("TryUnlock(R112_HIDE): the hidden character is shown", pgd:TryUnlock(HIDE, true) == true and hidden() == false)
  Isaac.ExecuteCommand("lockachievement " .. HIDE)
  T("lockachievement: hidden again, and locked", hidden() == true and pgd:Unlocked(HIDE) == false)
  T("Unlock(R112_CARD), then lockachievement: the card and the pill follow", pgd:Unlock(CARD, true) == true and ach_of("card") == -1
    and ach_of("pill") == -1, fields())
  Isaac.ExecuteCommand("lockachievement " .. CARD)
  T("... locked again", ach_of("card") == CARD and ach_of("pill") == CARD and not pgd:Unlocked(CARD), fields())
  Isaac.ExecuteCommand("achievement " .. CHAR)
  T("the console's achievement <id> unlocks the character", pgd:Unlocked(CHAR) and ach_of("char") == -1, fields())
  Isaac.ExecuteCommand("lockachievement " .. CHAR)
  T("... lockachievement locks it again", not pgd:Unlocked(CHAR) and ach_of("char") == CHAR, fields())

  -- the item pools are set up when a run starts (REPENTOGON writes these fields in its ItemPool::Init hook)
  Isaac.ExecuteCommand("restart")
  wait(90)
  n, list = treasure_draws()
  T("unlocked, in a new run: the treasure pool hands it out", n > 0, list)

  Isaac.SaveModData(M, "r112 part 2 " .. checks .. " " .. failed)
  say("RGON info: part 1 done, " .. checks .. " checks, " .. failed .. " failed; reloading")
  wait(30)
  say("KEYS reload")
  wait(100000)
else
  ---------------------------------------------------------------- part 2
  Isaac.RemoveModData(M)
  checks, failed = tonumber(c1), tonumber(f1)                -- part 1's, carried over the reload
  T("after a reload: R112_ITEM is still unlocked", pgd:Unlocked(ITEM) == true)
  T("after a reload: R112_CHAR, R112_CARD and R112_HIDE are still locked", not pgd:Unlocked(CHAR) and not pgd:Unlocked(CARD) and not pgd:Unlocked(HIDE))
  T("after a reload: the fields say so", ach_of("item") == -1 and ach_of("trinket") == -1 and ach_of("card") == CARD and ach_of("pill") == CARD
    and ach_of("char") == CHAR and hidden() == true, fields())
  local n, list = treasure_draws()
  T("after a reload (the continued run): the treasure pool hands it out", n > 0, list)
  -- leave the profile as it was found
  Isaac.ExecuteCommand("lockachievement " .. ITEM)
  T("lockachievement R112_ITEM: locked again", not pgd:Unlocked(ITEM) and ach_of("item") == ITEM, fields())
  say("RGON END " .. checks .. " " .. failed)
end
