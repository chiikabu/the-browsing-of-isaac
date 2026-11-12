-- test_layer.lua -- the layer checked from inside a running game:
--
--   node scripts/recomp/rgon/pack.mjs .scratch/rgon/repentogon.zip
--   node scripts/recomp/web/drive_stress.mjs "http://127.0.0.1:8200/play.html?ISAAC_RGON_ALLOW=zz-port-stress" <out> \
--        phases=custom lua=scripts/recomp/rgon/test_layer.lua zips=.scratch/rgon/repentogon.zip
--
-- It is pasted into drive_stress.mjs's own mod as one operation, so the walk's
-- helpers are in scope (say, wait, P, centre). Every line it says starts with
-- "RGON ok" or "RGON FAIL"; "RGON END <n> <failed>" closes it.
local checks, failed = 0, 0
local function T(name, cond, detail)
  checks = checks + 1
  if not cond then failed = failed + 1 end
  say("RGON " .. (cond and "ok   " or "FAIL ") .. name .. (detail ~= nil and (" -- " .. tostring(detail)) or ""))
end
local function near(a, b) return type(a) == "number" and math.abs(a - b) < 1e-5 end

T("REPENTOGON is there for a mod the layer lets in", type(REPENTOGON) == "table", type(REPENTOGON))
if type(REPENTOGON) ~= "table" then say("RGON END " .. checks .. " " .. failed) return end
T("it says what it is", REPENTOGON.Real == true and REPENTOGON.Browser == true and REPENTOGON.Name == "REPENTOGON", REPENTOGON.Version)
T("MeetsVersion", REPENTOGON.MeetsVersion("1.0.0") and REPENTOGON.MeetsVersion(REPENTOGON.Version) and not REPENTOGON.MeetsVersion("9.0"))
T("rawget does not see it (it is not a plain global)", rawget(_G, "REPENTOGON") == nil)
T("the enums are REPENTOGON's", ModCallbacks.MC_PRE_ADD_COLLECTIBLE == 1004 and ModCallbacks.MC_POST_ADD_COLLECTIBLE == 1005
  and ModCallbacks.MC_POST_HUD_RENDER == 1024 and type(Dimension) == "table" and type(HealthType) == "table")

local p = P()
local m = RegisterMod("rgon layer test", 1)
local seen = {}

-- functions
T("Level:GetDimension() in an ordinary room", Game():GetLevel():GetDimension() == 0, Game():GetLevel():GetDimension())
T("EntityPlayer:GetHealthType() for Isaac", p:GetHealthType() == HealthType.RED, p:GetHealthType())
T("a method called with '.' and no object is a Lua error, not a stop",
  not pcall(function() return p.GetHealthType() end))
T("Isaac.CanStartTrueCoop() in the first room of a run", Isaac.CanStartTrueCoop() == true, tostring(Isaac.CanStartTrueCoop()))
T("PlayerManager", PlayerManager.GetNumPlayers() == 1 and #PlayerManager.GetPlayers() == 1
  and PlayerManager.FirstPlayerByType(p:GetPlayerType()) ~= nil and PlayerManager.IsCoopPlay() == false)

-- Sprite layers
do
  local spr = p:GetSprite()
  local n = spr:GetLayerCount()
  local l0 = spr:GetLayer(0)
  T("Sprite:GetLayer(0) on the player's sprite", l0 ~= nil and l0:GetLayerID() == 0 and type(l0:GetName()) == "string" and #l0:GetName() > 0,
    l0 and (l0:GetName() .. " of " .. n))
  T("GetAllLayers has one per layer, in order", #spr:GetAllLayers() == n and spr:GetAllLayers()[n]:GetLayerID() == n - 1, n)
  T("a layer by name is the same layer", l0 and spr:GetLayer(l0:GetName()) == l0)
  T("no such layer is nil", spr:GetLayer(n) == nil and spr:GetLayer(-1) == nil and spr:GetLayer("no such layer") == nil)
  T("the spritesheet path is the character's", l0 and l0:GetSpritesheetPath():lower():find("gfx/characters", 1, true) ~= nil, l0 and l0:GetSpritesheetPath())
  T("the default path is the anm2's own", l0 and #l0:GetDefaultSpritesheetPath() > 4, l0 and l0:GetDefaultSpritesheetPath())
  local was = l0:IsVisible()
  l0:SetVisible(not was)
  T("SetVisible is read back", l0:IsVisible() == (not was))
  l0:SetVisible(was)
  local pos = l0:GetPos()
  l0:SetPos(Vector(3, 4))
  T("SetPos is read back as a Vector", l0:GetPos().X == 3 and l0:GetPos().Y == 4)
  l0:SetPos(pos)
  local c = l0:GetColor()
  T("GetColor is a Color with the layer's values", near(c.R, 1) and near(c.A, 1), c.R)
  c.R = 0.5
  T("and a copy: changing it leaves the layer alone", near(l0:GetColor().R, 1))
  l0:SetColor(c)
  T("SetColor writes it", near(l0:GetColor().R, 0.5))
  c.R = 1
  l0:SetColor(c)
  local s = Sprite()
  s:Load("gfx/001.000_player.anm2", true)
  T("a sprite loaded here has its layers too", s:GetLayerCount() > 0 and #s:GetAllLayers() == s:GetLayerCount()
    and s:GetLayer(0):GetDefaultSpritesheetPath() ~= "", s:GetLayerCount())
  local e = Sprite()
  T("an empty sprite has none", e:GetLayer(0) == nil and #e:GetAllLayers() == 0)
  T("a LayerState method without its object is a Lua error", not pcall(function() return l0.GetName() end))
end

-- pickups
do
  local ped = Isaac.Spawn(EntityType.ENTITY_PICKUP, PickupVariant.PICKUP_COLLECTIBLE, CollectibleType.COLLECTIBLE_SAD_ONION, centre() + Vector(-120, 80), Vector(0, 0), nil):ToPickup()
  local heart = Isaac.Spawn(EntityType.ENTITY_PICKUP, PickupVariant.PICKUP_HEART, 1, centre() + Vector(-160, 80), Vector(0, 0), nil):ToPickup()
  wait(3)
  T("EntityPickup:IsBlind() is false for a plain pedestal and for a heart", ped:IsBlind() == false and ped:IsBlind(false) == false and heart:IsBlind() == false)
  T("a plain pedestal has no item cycle", #ped:GetCollectibleCycle() == 0, #ped:GetCollectibleCycle())
  Game():GetLevel():AddCurse(LevelCurse.CURSE_OF_BLIND, false)
  local blind = Isaac.Spawn(EntityType.ENTITY_PICKUP, PickupVariant.PICKUP_COLLECTIBLE, CollectibleType.COLLECTIBLE_INNER_EYE, centre() + Vector(-120, 120), Vector(0, 0), nil):ToPickup()
  wait(3)
  T("under Curse of the Blind a pedestal is blind to IsBlind(false), not to the forced-only question", blind:IsBlind(false) == true and blind:IsBlind() == false,
    tostring(blind:IsBlind(false)) .. "/" .. tostring(blind:IsBlind()))
  Game():GetLevel():RemoveCurses(LevelCurse.CURSE_OF_BLIND)
  p:AddCollectible(CollectibleType.COLLECTIBLE_GLITCHED_CROWN, 0, false)
  local crown = Isaac.Spawn(EntityType.ENTITY_PICKUP, PickupVariant.PICKUP_COLLECTIBLE, CollectibleType.COLLECTIBLE_BREAKFAST, centre() + Vector(120, 80), Vector(0, 0), nil):ToPickup()
  wait(6)
  local cyc = crown:GetCollectibleCycle()
  local sane = #cyc >= 2
  for _, id in ipairs(cyc) do if math.type(id) ~= "integer" or id <= 0 or id >= CollectibleType.NUM_COLLECTIBLES + 200 then sane = false end end
  T("with Glitched Crown a pedestal cycles through several real items", sane, #cyc .. ": " .. table.concat(cyc, ","))
  p:RemoveCollectible(CollectibleType.COLLECTIBLE_GLITCHED_CROWN)
  ped:Remove() heart:Remove() blind:Remove() crown:Remove()
end

-- a callback the layer does not fire is said so, once, in the game's log
m:AddCallback(ModCallbacks.MC_POST_SAVESLOT_LOAD, function() end)

-- MC_PRE/POST_ADD_COLLECTIBLE
local pre = function(_, t, charge, first, slot, var, player)
  seen.pre = { t, charge, first, slot, var, player and player:GetPlayerType() }
  if t == CollectibleType.COLLECTIBLE_INNER_EYE then return CollectibleType.COLLECTIBLE_SPOON_BENDER end
  if t == CollectibleType.COLLECTIBLE_CRICKETS_HEAD then return false end
end
local post = function(_, t, charge, first, slot, var, player) seen.post = { t, player and player:GetPlayerType() } end
m:AddCallback(ModCallbacks.MC_PRE_ADD_COLLECTIBLE, pre)
m:AddCallback(ModCallbacks.MC_POST_ADD_COLLECTIBLE, post)
p:AddCollectible(CollectibleType.COLLECTIBLE_SAD_ONION, 0, false)
T("PRE_ADD_COLLECTIBLE gets (type, charge, firstTime, slot, varData, player)",
  seen.pre and seen.pre[1] == 1 and seen.pre[2] == 0 and seen.pre[3] == false and seen.pre[6] == p:GetPlayerType(),
  seen.pre and table.concat({ tostring(seen.pre[1]), tostring(seen.pre[2]), tostring(seen.pre[3]), tostring(seen.pre[4]), tostring(seen.pre[5]), tostring(seen.pre[6]) }, ","))
T("POST_ADD_COLLECTIBLE follows, and the item is there", seen.post and seen.post[1] == 1 and p:HasCollectible(1))
seen = {}
p:AddCollectible(CollectibleType.COLLECTIBLE_INNER_EYE, 0, false)
T("an integer from PRE_ADD_COLLECTIBLE adds that item instead",
  p:HasCollectible(CollectibleType.COLLECTIBLE_SPOON_BENDER) and not p:HasCollectible(CollectibleType.COLLECTIBLE_INNER_EYE)
  and seen.post and seen.post[1] == CollectibleType.COLLECTIBLE_SPOON_BENDER)
seen = {}
p:AddCollectible(CollectibleType.COLLECTIBLE_CRICKETS_HEAD, 0, false)
T("false from PRE_ADD_COLLECTIBLE adds nothing, and POST does not run",
  not p:HasCollectible(CollectibleType.COLLECTIBLE_CRICKETS_HEAD) and seen.post == nil and seen.pre ~= nil)
-- a callback with a param only runs for that item
local only5 = 0
m:AddCallback(ModCallbacks.MC_POST_ADD_COLLECTIBLE, function() only5 = only5 + 1 end, CollectibleType.COLLECTIBLE_MY_REFLECTION)
p:AddCollectible(CollectibleType.COLLECTIBLE_BROTHER_BOBBY, 0, false)
p:AddCollectible(CollectibleType.COLLECTIBLE_MY_REFLECTION, 0, false)
T("a callback registered for one item runs for that item only", only5 == 1, only5)
m:RemoveCallback(ModCallbacks.MC_PRE_ADD_COLLECTIBLE, pre)
seen = {}
p:AddCollectible(CollectibleType.COLLECTIBLE_CRICKETS_HEAD, 0, false)
T("a removed callback no longer runs", seen.pre == nil and p:HasCollectible(CollectibleType.COLLECTIBLE_CRICKETS_HEAD))

-- MC_PRE_ADD_TRINKET
m:AddCallback(ModCallbacks.MC_PRE_ADD_TRINKET, function(_, player, t, first)
  seen.trinket = { t, first, player and player:GetPlayerType() }
  if t == TrinketType.TRINKET_PETRIFIED_POOP then return false end
end)
p:AddTrinket(TrinketType.TRINKET_PETRIFIED_POOP)
T("false from PRE_ADD_TRINKET adds no trinket", not p:HasTrinket(TrinketType.TRINKET_PETRIFIED_POOP) and seen.trinket and seen.trinket[1] == TrinketType.TRINKET_PETRIFIED_POOP)
p:AddTrinket(TrinketType.TRINKET_SWALLOWED_PENNY)
T("another trinket is added as usual", p:HasTrinket(TrinketType.TRINKET_SWALLOWED_PENNY) and seen.trinket[1] == TrinketType.TRINKET_SWALLOWED_PENNY)

-- MC_PRE/POST_SFX_PLAY: floats come off the stack as floats
m:AddCallback(ModCallbacks.MC_PRE_SFX_PLAY, function(_, id, vol, delay, loop, pitch, pan)
  seen.sfx = { id, vol, delay, loop, pitch, pan }
  if id == SoundEffect.SOUND_THUMBSUP then return false end
  if id == SoundEffect.SOUND_THUMBS_DOWN then return { SoundEffect.SOUND_POWERUP1, 0.25, 0, false, 2.0, 0.0 } end
end)
m:AddCallback(ModCallbacks.MC_POST_SFX_PLAY, function(_, id, vol, delay, loop, pitch, pan) seen.sfxpost = { id, vol, pitch } end)
local sfx = SFXManager()
sfx:Play(SoundEffect.SOUND_BOSS1_EXPLOSIONS, 0.5, 2, false, 1.5)
T("PRE_SFX_PLAY gets (id, volume, frameDelay, loop, pitch, pan)",
  seen.sfx and seen.sfx[1] == SoundEffect.SOUND_BOSS1_EXPLOSIONS and near(seen.sfx[2], 0.5) and seen.sfx[3] == 2 and seen.sfx[4] == false and near(seen.sfx[5], 1.5),
  seen.sfx and (tostring(seen.sfx[1]) .. "," .. tostring(seen.sfx[2]) .. "," .. tostring(seen.sfx[3]) .. "," .. tostring(seen.sfx[5])))
T("POST_SFX_PLAY follows with the same", seen.sfxpost and seen.sfxpost[1] == SoundEffect.SOUND_BOSS1_EXPLOSIONS and near(seen.sfxpost[2], 0.5))
seen.sfxpost = nil
sfx:Play(SoundEffect.SOUND_THUMBSUP, 1, 0, false, 1)
T("false from PRE_SFX_PLAY plays nothing", seen.sfxpost == nil and not sfx:IsPlaying(SoundEffect.SOUND_THUMBSUP))
sfx:Play(SoundEffect.SOUND_THUMBS_DOWN, 1, 0, false, 1)
T("a table of six plays that sound instead", seen.sfxpost and seen.sfxpost[1] == SoundEffect.SOUND_POWERUP1 and near(seen.sfxpost[2], 0.25) and near(seen.sfxpost[3], 2.0),
  seen.sfxpost and (tostring(seen.sfxpost[1]) .. "," .. tostring(seen.sfxpost[2]) .. "," .. tostring(seen.sfxpost[3])))

-- MC_PRE_MUSIC_PLAY
m:AddCallback(ModCallbacks.MC_PRE_MUSIC_PLAY, function(_, id, v, fade) seen.music = { id, v, fade } end)
MusicManager():Play(Music.MUSIC_CAVES, 0.25)
T("PRE_MUSIC_PLAY from Play gets (id, volume, false)", seen.music and seen.music[1] == Music.MUSIC_CAVES and near(seen.music[2], 0.25) and seen.music[3] == false,
  seen.music and (tostring(seen.music[1]) .. "," .. tostring(seen.music[2]) .. "," .. tostring(seen.music[3])))
MusicManager():Crossfade(Music.MUSIC_BASEMENT, 0.5)
T("and from Crossfade (id, fadeRate, true)", seen.music and seen.music[1] == Music.MUSIC_BASEMENT and near(seen.music[2], 0.5) and seen.music[3] == true)

-- the HUD callbacks, once a frame
local n = { hr = 0, phr = 0, hu = 0, phu = 0 }
m:AddCallback(ModCallbacks.MC_HUD_RENDER, function() n.hr = n.hr + 1 end)
m:AddCallback(ModCallbacks.MC_POST_HUD_RENDER, function() n.phr = n.phr + 1 end)
m:AddCallback(ModCallbacks.MC_HUD_UPDATE, function() n.hu = n.hu + 1 end)
m:AddCallback(ModCallbacks.MC_POST_HUD_UPDATE, function() n.phu = n.phu + 1 end)
wait(40)
T("HUD_RENDER and POST_HUD_RENDER run with the HUD", n.hr > 10 and n.phr == n.hr, n.hr .. "/" .. n.phr)
T("HUD_UPDATE and POST_HUD_UPDATE run with the HUD", n.hu > 10 and n.phu > 10, n.hu .. "/" .. n.phu)

-- MC_PRE/POST_PICKUP_MORPH
local pk = Isaac.Spawn(EntityType.ENTITY_PICKUP, PickupVariant.PICKUP_HEART, 1, centre() + Vector(0, 80), Vector(0, 0), nil):ToPickup()
wait(2)
m:AddCallback(ModCallbacks.MC_PRE_PICKUP_MORPH, function(_, pickup, t, v, s, keepPrice, keepSeed, ignoreModifiers)
  seen.morph = { t, v, s, keepPrice, pickup and pickup.Variant }
  if v == PickupVariant.PICKUP_KEY then return { EntityType.ENTITY_PICKUP, PickupVariant.PICKUP_BOMB, 1 } end
  if v == PickupVariant.PICKUP_PILL then return false end
end)
m:AddCallback(ModCallbacks.MC_POST_PICKUP_MORPH, function(_, pickup, t, v, s) seen.morphed = { t, v, s, pickup and pickup.Variant } end)
pk:Morph(EntityType.ENTITY_PICKUP, PickupVariant.PICKUP_COIN, 1, true)
T("PRE_PICKUP_MORPH gets (pickup, type, variant, subType, keepPrice, ...)",
  seen.morph and seen.morph[2] == PickupVariant.PICKUP_COIN and seen.morph[4] == true and seen.morph[5] == PickupVariant.PICKUP_HEART)
T("POST_PICKUP_MORPH gets what the pickup WAS, on the morphed pickup",
  seen.morphed and seen.morphed[2] == PickupVariant.PICKUP_HEART and seen.morphed[4] == PickupVariant.PICKUP_COIN and pk.Variant == PickupVariant.PICKUP_COIN)
pk:Morph(EntityType.ENTITY_PICKUP, PickupVariant.PICKUP_KEY, 1, true)
T("a table of three from PRE_PICKUP_MORPH morphs into that instead", pk.Variant == PickupVariant.PICKUP_BOMB, pk.Variant)
seen.morphed = nil
pk:Morph(EntityType.ENTITY_PICKUP, PickupVariant.PICKUP_PILL, 1, true)
T("false cancels the morph", pk.Variant == PickupVariant.PICKUP_BOMB and seen.morphed == nil, pk.Variant)

-- an error in one of the layer's callbacks is logged and survived
m:AddCallback(ModCallbacks.MC_POST_ADD_COLLECTIBLE, function() error("rgon test: an error in a layer callback") end, CollectibleType.COLLECTIBLE_BLOOD_OF_THE_MARTYR)
p:AddCollectible(CollectibleType.COLLECTIBLE_BLOOD_OF_THE_MARTYR, 0, false)
T("a Lua error in a layer callback does not stop the game or the item", p:HasCollectible(CollectibleType.COLLECTIBLE_BLOOD_OF_THE_MARTYR))

local impl = 0
for _ in pairs(REPENTOGON.Implemented) do impl = impl + 1 end
say("RGON implemented " .. impl)
say("RGON END " .. checks .. " " .. failed)
