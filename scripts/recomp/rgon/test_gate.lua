-- test_gate.lua -- the layer installed, and a mod it does NOT name: that mod
-- must read REPENTOGON as nil, exactly as without the layer, while the names
-- the layer adds to shared tables are simply there.
--   node scripts/recomp/web/drive_stress.mjs http://127.0.0.1:8200/play.html <out> \
--        phases=custom lua=scripts/recomp/rgon/test_gate.lua zips=.scratch/rgon/repentogon.zip
local checks, failed = 0, 0
local function T(name, cond, detail)
  checks = checks + 1
  if not cond then failed = failed + 1 end
  say("RGON " .. (cond and "ok   " or "FAIL ") .. name .. (detail ~= nil and (" -- " .. tostring(detail)) or ""))
end
T("REPENTOGON is nil for a mod the layer does not name", REPENTOGON == nil, type(REPENTOGON))
T("also through _G and through a function defined here", _G.REPENTOGON == nil and (function() return REPENTOGON end)() == nil)
T("its presence cannot be seen with rawget either", rawget(_G, "REPENTOGON") == nil)
T("an undefined global is still nil", SomeGlobalNobodyDefined == nil)
T("a global this mod sets is still its own", (function() RgonGateProbe = 5 return RgonGateProbe end)() == 5)
T("the layer is loaded all the same (its enums are there)", ModCallbacks.MC_POST_ADD_COLLECTIBLE == 1005)
local p = P()
p:AddCollectible(CollectibleType.COLLECTIBLE_SAD_ONION, 0, false)
p:AddTrinket(TrinketType.TRINKET_SWALLOWED_PENNY)
SFXManager():Play(SoundEffect.SOUND_THUMBSUP, 1, 0, false, 1)
wait(20)
T("the hooked functions run as they did with nobody listening", p:HasCollectible(1) and p:HasTrinket(TrinketType.TRINKET_SWALLOWED_PENNY))
say("RGON END " .. checks .. " " .. failed)
