-- test_layer4.lua -- innate items (api_innate.lua), checked from inside a running game:
--
--   node scripts/recomp/rgon/pack.mjs <layer.zip>
--   node scripts/recomp/web/drive_stress.mjs "http://127.0.0.1:8200/play.html?ISAAC_RGON_ALLOW=zz-port-stress" <out> \
--        phases=custom lua=scripts/recomp/rgon/test_layer4.lua zips=<layer.zip>
--
-- Same harness as test_layer.lua (say, wait, P are the walk's helpers). The
-- checks are on what the game itself then does: its HasCollectible,
-- GetCollectibleNum, HasTrinket, GetTrinketMultiplier and the player's stats.
local checks, failed = 0, 0
local function T(name, cond, detail)
  checks = checks + 1
  if not cond then failed = failed + 1 end
  say("RGON " .. (cond and "ok   " or "FAIL ") .. name .. (detail ~= nil and (" -- " .. tostring(detail)) or ""))
end
if type(REPENTOGON) ~= "table" then say("RGON FAIL no REPENTOGON for this mod") say("RGON END 1 1") return end

local p = P()
local m = RegisterMod("rgon layer test 4", 1)
local M = ModCallbacks
local C, Tr = CollectibleType, TrinketType
local SAD, SPOON, INNER = C.COLLECTIBLE_SAD_ONION, C.COLLECTIBLE_SPOON_BENDER, C.COLLECTIBLE_INNER_EYE
local CANCER, GOLDEN = Tr.TRINKET_CANCER, TrinketType.TRINKET_GOLDEN_FLAG or 0x8000
local function eval() p:AddCacheFlags(CacheFlag.CACHE_ALL) p:EvaluateItems() end

T("the innate functions are there", type(p.AddInnateCollectible) == "function" and type(p.RemoveInnateTrinket) == "function"
  and type(p.ClearInnateItemGroup) == "function" and type(p.GetInnateTrinketGroup) == "function")

-- a collectible: the game's own answers and the real effect, not the inventory
local fd0, num0, real0 = p.MaxFireDelay, p:GetCollectibleNum(SAD), p:GetCollectibleNum(SAD, true)
local wisps0 = #Isaac.FindByType(EntityType.ENTITY_FAMILIAR, FamiliarVariant.ITEM_WISP)
T("before: no Sad Onion", not p:HasCollectible(SAD) and num0 == 0, num0)
p:AddInnateCollectible(SAD)
wait(2)
T("AddInnateCollectible(Sad Onion): GetInnateCollectibleCount is 1", p:GetInnateCollectibleCount(SAD) == 1, p:GetInnateCollectibleCount(SAD))
T("the game's HasCollectible says yes", p:HasCollectible(SAD) == true)
T("the game's GetCollectibleNum counts it", p:GetCollectibleNum(SAD) == num0 + 1, p:GetCollectibleNum(SAD))
T("not in the inventory (onlyReal / ignoreModifiers)", p:GetCollectibleNum(SAD, true) == real0 and p:HasCollectible(SAD, true) == false,
  p:GetCollectibleNum(SAD, true))
T("its effect is real: the fire delay went down", p.MaxFireDelay < fd0 - 0.5, string.format("%.3f -> %.3f", fd0, p.MaxFireDelay))
T("GetCollectiblesList leaves it out", (p:GetCollectiblesList()[SAD] or 0) == real0)
T("nothing shows in Isaac.FindByType (the wisp is hidden)", #Isaac.FindByType(EntityType.ENTITY_FAMILIAR, FamiliarVariant.ITEM_WISP) == wisps0)
local fd1 = p.MaxFireDelay

-- groups stay apart
p:AddInnateCollectible(SAD, 2, "RGON_A")
wait(1)
T("a second group: 2 there, still 1 in the default group", p:GetInnateCollectibleCount(SAD, "RGON_A") == 2 and p:GetInnateCollectibleCount(SAD) == 1,
  p:GetInnateCollectibleCount(SAD, "RGON_A") .. "/" .. p:GetInnateCollectibleCount(SAD))
local ga, g0 = p:GetInnateCollectibleGroup("RGON_A"), p:GetInnateCollectibleGroup("")
T("GetInnateCollectibleGroup per group", ga[SAD] == 2 and g0[SAD] == 1 and next(p:GetInnateCollectibleGroup("RGON_NONE")) == nil,
  tostring(ga[SAD]) .. "/" .. tostring(g0[SAD]))
T("the game counts all three", p:GetCollectibleNum(SAD) == num0 + 3, p:GetCollectibleNum(SAD))
eval()
T("three Sad Onions fire faster than one", p.MaxFireDelay < fd1 - 0.1, string.format("%.3f -> %.3f", fd1, p.MaxFireDelay))

-- Remove answers with what it really removed
T("RemoveInnateCollectible(5) from a group of 2 removes 2", p:RemoveInnateCollectible(SAD, 5, "RGON_A") == 2)
T("RemoveInnateCollectible from a group that has none removes 0", p:RemoveInnateCollectible(SAD, 1, "RGON_B") == 0)
wait(1)
T("the other group is untouched", p:GetInnateCollectibleCount(SAD) == 1 and p:GetCollectibleNum(SAD) == num0 + 1, p:GetCollectibleNum(SAD))
T("RemoveInnateCollectible(1) from the default group removes 1", p:RemoveInnateCollectible(SAD) == 1)
wait(1)
T("gone from the game too: HasCollectible is false", p:HasCollectible(SAD) == false and p:GetCollectibleNum(SAD) == num0, p:GetCollectibleNum(SAD))
eval()
T("and the fire delay is back", math.abs(p.MaxFireDelay - fd0) < 0.01, string.format("%.3f", p.MaxFireDelay))

-- the callbacks, with a group key as the parameter
local added, removed = {}, {}
m:AddCallback(M.MC_POST_ADD_INNATE_COLLECTIBLE, function(_, pl, id, key, amount, duration) added[#added + 1] = { id, key, amount, duration } end, "RGON_T")
m:AddCallback(M.MC_POST_REMOVE_INNATE_COLLECTIBLE, function(_, pl, id, key, amount, expired) removed[#removed + 1] = { id, key, amount, expired } end, "RGON_T")
m:AddCallback(M.MC_POST_ADD_INNATE_COLLECTIBLE, function() added.other = true end, "RGON_NOT_THIS")

-- a duration ends the item by itself
p:AddInnateCollectible(SAD, 1, "RGON_T", 30)
wait(2)
T("a timed copy (30 frames) is there", p:GetInnateCollectibleCount(SAD, "RGON_T") == 1 and p:HasCollectible(SAD))
T("MC_POST_ADD_INNATE_COLLECTIBLE ran for its group only, with (id, key, amount, duration)", #added == 1 and added[1][1] == SAD and added[1][2] == "RGON_T"
  and added[1][3] == 1 and added[1][4] == 30 and not added.other, #added)
wait(45)
T("after 45 frames it has removed itself", p:GetInnateCollectibleCount(SAD, "RGON_T") == 0 and not p:HasCollectible(SAD), p:GetInnateCollectibleCount(SAD, "RGON_T"))
T("MC_POST_REMOVE_INNATE_COLLECTIBLE said it expired", #removed == 1 and removed[1][3] == 1 and removed[1][4] == true, #removed)

-- a trinket: the game's own answers and the real effect
local fdt = p.MaxFireDelay
T("before: no Cancer", not p:HasTrinket(CANCER) and p:GetTrinketMultiplier(CANCER) == 0)
p:AddInnateTrinket(CANCER, 1, "RGON_G")
T("AddInnateTrinket(Cancer): the game's HasTrinket says yes, multiplier 1", p:HasTrinket(CANCER) and p:GetTrinketMultiplier(CANCER) == 1,
  p:GetTrinketMultiplier(CANCER))
T("its effect is real: the fire delay went down", p.MaxFireDelay < fdt - 0.3, string.format("%.3f -> %.3f", fdt, p.MaxFireDelay))
say("RGON info: HasTrinket(Cancer, ignoreModifiers = true) with only an innate Cancer: " .. tostring(p:HasTrinket(CANCER, true)))
T("not in the held trinkets", p:GetTrinket(0) ~= CANCER and p:GetTrinket(1) ~= CANCER)
local sm = p:GetSmeltedTrinkets()[CANCER]
T("GetSmeltedTrinkets does not list it", sm == nil or (sm.trinketAmount == 0 and sm.goldenTrinketAmount == 0), sm and sm.trinketAmount)
p:AddInnateTrinket(CANCER | GOLDEN, 1, "RGON_G")
T("a golden copy is counted apart", p:GetInnateTrinketCount(CANCER, "RGON_G") == 1 and p:GetInnateTrinketCount(CANCER | GOLDEN, "RGON_G") == 1
  and p:GetInnateTrinketGroup("RGON_G")[CANCER | GOLDEN] == 1)
T("and the game's multiplier counts it (golden doubles)", p:GetTrinketMultiplier(CANCER) >= 3, p:GetTrinketMultiplier(CANCER))
T("RemoveInnateTrinket(golden, 3) removes the 1 there is", p:RemoveInnateTrinket(CANCER | GOLDEN, 3, "RGON_G") == 1 and p:GetTrinketMultiplier(CANCER) == 1,
  p:GetTrinketMultiplier(CANCER))

-- ClearInnateItemGroup: collectibles and trinkets of that group, no other
p:AddInnateCollectible(SPOON, 1, "RGON_G")
p:AddInnateCollectible(INNER, 1, "RGON_H")
p:AddInnateTrinket(CANCER, 1, "RGON_H")
wait(1)
T("before the clear: both groups there", p:HasCollectible(SPOON) and p:HasCollectible(INNER) and p:GetTrinketMultiplier(CANCER) == 2,
  p:GetTrinketMultiplier(CANCER))
p:ClearInnateItemGroup("RGON_G")
wait(1)
T("ClearInnateItemGroup(G): its collectible is gone", not p:HasCollectible(SPOON) and p:GetInnateCollectibleCount(SPOON, "RGON_G") == 0)
T("ClearInnateItemGroup(G): its trinket is gone", p:GetInnateTrinketCount(CANCER, "RGON_G") == 0 and p:GetTrinketMultiplier(CANCER) == 1,
  p:GetTrinketMultiplier(CANCER))
T("group H is untouched", p:HasCollectible(INNER) and p:GetInnateCollectibleCount(INNER, "RGON_H") == 1 and p:GetInnateTrinketCount(CANCER, "RGON_H") == 1)
p:ClearInnateItemGroup("RGON_H")
wait(1)
T("ClearInnateItemGroup(H) empties the rest", not p:HasCollectible(INNER) and not p:HasTrinket(CANCER))

-- Set: counts and whole groups
T("SetInnateCollectibleCount 0 -> 3 answers 3", p:SetInnateCollectibleCount(SAD, 3, "RGON_S") == 3)
T("SetInnateCollectibleCount 3 -> 1 answers -2", p:SetInnateCollectibleCount(SAD, 1, "RGON_S") == -2 and p:GetCollectibleNum(SAD) == num0 + 1)
p:SetInnateCollectibleGroup("RGON_S", { [SPOON] = 2 })
wait(1)
T("SetInnateCollectibleGroup replaces the group", p:GetInnateCollectibleCount(SAD, "RGON_S") == 0 and p:GetInnateCollectibleCount(SPOON, "RGON_S") == 2
  and p:GetCollectibleNum(SPOON) == 2 and not p:HasCollectible(SAD))
p:SetInnateTrinketGroup("RGON_S", { [CANCER] = 1 })
T("SetInnateTrinketGroup", p:GetTrinketMultiplier(CANCER) == 1)
p:ClearInnateItemGroup("RGON_S")
wait(1)
T("cleared again", p:GetCollectibleNum(SPOON) == 0 and not p:HasTrinket(CANCER))

-- arguments
T("an invalid collectible is an error", not pcall(p.AddInnateCollectible, p, 999999))
T("an invalid trinket is an error", not pcall(p.GetInnateTrinketCount, p, 999999))
p:AddInnateCollectible(SAD, 2)
p:AddInnateCollectible(SAD, -1)
T("the old negative Amount still removes from the default group", p:GetInnateCollectibleCount(SAD) == 1)
T("... and is refused with a group key", not pcall(p.AddInnateCollectible, p, SAD, -1, "RGON_A"))
p:RemoveInnateCollectible(SAD)

-- what is accepted and not done is listed
T("REPENTOGON.Unsupported lists Glowing Hourglass and IgnoreSpoof", type(REPENTOGON.Unsupported) == "table"
  and REPENTOGON.Unsupported["EntityPlayer:AddInnateCollectible with Glowing Hourglass"] ~= nil
  and REPENTOGON.Unsupported["EntityPlayer:HasCollectible IgnoreSpoof"] ~= nil)
T("the innate callbacks count as implemented", REPENTOGON.Implemented[M.MC_POST_ADD_INNATE_TRINKET] == true
  and REPENTOGON.Implemented["EntityPlayer.AddInnateCollectible"] == true)

-- a new run starts with none (the player's pointer is the same object's again)
p:AddInnateCollectible(SAD, 1, "RGON_RUN")
p:AddInnateTrinket(CANCER, 1, "RGON_RUN")
wait(1)
Isaac.ExecuteCommand("restart")
wait(60)
p = P()
T("after restart: no innate items carried over", p:GetInnateCollectibleCount(SAD, "RGON_RUN") == 0 and next(p:GetInnateTrinketGroup("RGON_RUN")) == nil)
T("after restart: the game has neither", not p:HasCollectible(SAD) and not p:HasTrinket(CANCER) and p:GetTrinketMultiplier(CANCER) == 0)

say("RGON END " .. checks .. " " .. failed)
