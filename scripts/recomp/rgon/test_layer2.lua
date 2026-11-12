-- test_layer2.lua -- round 103's part of the layer, checked from inside a running game:
--
--   node scripts/recomp/rgon/pack.mjs .scratch/rgon/repentogon.zip
--   node scripts/recomp/web/drive_stress.mjs "http://127.0.0.1:8200/play.html?ISAAC_RGON_ALLOW=zz-port-stress" <out> \
--        phases=custom lua=scripts/recomp/rgon/test_layer2.lua zips=.scratch/rgon/repentogon.zip
--
-- Same harness as test_layer.lua (say, wait, P, centre are the walk's helpers).
-- The checks on entity fields are what turns an offset taken on structural
-- evidence into one seen to work: each sets a value through the game's own
-- API and reads it back through the layer, or the other way round.
local checks, failed = 0, 0
local function T(name, cond, detail)
  checks = checks + 1
  if not cond then failed = failed + 1 end
  say("RGON " .. (cond and "ok   " or "FAIL ") .. name .. (detail ~= nil and (" -- " .. tostring(detail)) or ""))
end
local function near(a, b, eps) return type(a) == "number" and math.abs(a - b) < (eps or 1e-4) end
if type(REPENTOGON) ~= "table" then say("RGON FAIL no REPENTOGON for this mod") say("RGON END 1 1") return end

local p = P()
local m = RegisterMod("rgon layer test 2", 1)
local M = ModCallbacks
local seen = {}
local room = Game():GetRoom()

-- Color
do
  local c = Color(0.5, 0.25, 0.125, 1, 0.1, 0.2, 0.3)
  c:SetColorize(1, 2, 3, 4)
  local t, z, o = c:GetTint(), c:GetColorize(), c:GetOffset()
  T("Color:GetTint/GetColorize/GetOffset read the colour back", near(t.R, 0.5) and near(t.G, 0.25) and near(t.B, 0.125) and near(t.A, 1)
    and z.R == 1 and z.G == 2 and z.B == 3 and z.A == 4 and near(o.R, 0.1) and near(o.G, 0.2) and near(o.B, 0.3))
  local choc = Color.TearChocolate
  T("Color.TearChocolate is a Color with the game's tint", choc ~= nil and near(choc.R, 0.33) and near(choc.G, 0.18) and near(choc.RO, 66 / 255), choc and choc.R)
  T("Color.LaserIpecac is colorized", Color.LaserIpecac ~= nil and near(Color.LaserIpecac:GetColorize().G, 3))
  T("the game's own Color.Default is still there", Color.Default ~= nil and near(Color.Default.R, 1))
end

-- WeightedOutcomePicker: the same roll as the arithmetic says, and the RNG moves once
do
  local picker = WeightedOutcomePicker()
  picker:AddOutcomeWeight(10, 1)
  picker:AddOutcomeWeight(20, 3)
  picker:AddOutcomeFloat(30, 0.5, 10)
  T("a picker counts its outcomes", picker:GetNumOutcomes() == 3 and #picker:GetOutcomes() == 3 and picker:GetOutcomes()[3].Weight == 5)
  local rng = RNG()
  rng:SetSeed(123456, 35)
  local twin = RNG()
  twin:SetSeed(123456, 35)
  local counts = { [10] = 0, [20] = 0, [30] = 0 }
  local in_step = true
  for _ = 1, 900 do
    local expect = twin:Next() % 9             -- the next seed, modulo the total weight
    local got = picker:PickOutcome(rng)
    local want = expect < 1 and 10 or expect < 4 and 20 or 30
    if got ~= want or rng:GetSeed() ~= twin:GetSeed() then in_step = false end
    counts[got] = (counts[got] or 0) + 1
  end
  T("PickOutcome is the seed's next value modulo the total, first outcome whose running sum is above it", in_step,
    counts[10] .. "/" .. counts[20] .. "/" .. counts[30])
  T("the weights show in the counts", counts[10] > 50 and counts[20] > 220 and counts[30] > 400)
  picker:RemoveOutcome(20)
  T("RemoveOutcome and ClearOutcomes", picker:GetNumOutcomes() == 2 and (picker:ClearOutcomes() or picker:GetNumOutcomes() == 0))
end

-- lookups and data
T("Isaac.GetNullItemIdByName finds a null item by its name", (function()
  local config = Isaac.GetItemConfig()
  for id = 1, config:GetNullItems().Size - 1 do
    local item = config:GetNullItem(id)
    if item and #item.Name > 0 then
      local got = Isaac.GetNullItemIdByName(item.Name)
      -- two null items may share a name; the first of them is the answer
      return config:GetNullItem(got).Name == item.Name and got <= id and Isaac.GetNullItemIdByName("no such null item") == -1
    end
  end
  return false
end)())
do
  local sad = XMLData.GetEntryById(XMLNode.ITEM, CollectibleType.COLLECTIBLE_SAD_ONION)
  T("XMLData.GetEntryById(ITEM, 1) is the Sad Onion's node", sad ~= nil and sad.id == "1" and sad.gfx ~= nil and sad.type == "passive", sad and sad.gfx)
  local isaac = XMLData.GetEntryById(XMLNode.PLAYER, PlayerType.PLAYER_ISAAC)
  T("XMLData.GetEntryById(PLAYER, 0) is Isaac (named by its string-table key)", isaac ~= nil and isaac.name == "#ISAAC_NAME" and isaac.id == "0", isaac and isaac.name)
  T("XMLData.GetNumEntries and GetEntryByName", XMLData.GetNumEntries(XMLNode.TRINKET) > 150 and XMLData.GetEntryByName(XMLNode.PLAYER, "#CAIN_NAME") ~= nil,
    XMLData.GetNumEntries(XMLNode.TRINKET))
  local fly = XMLData.GetEntityByTypeVarSub(EntityType.ENTITY_FLY, 0, 0)
  T("XMLData.GetEntityByTypeVarSub(13.0.0) is the fly", fly ~= nil and fly.id == "13" and fly.basehp ~= nil, fly and fly.name)
  T("EntityConfig.GetPlayer", EntityConfig.GetPlayer(0):GetName() == "#ISAAC_NAME" and not EntityConfig.GetPlayer(0):IsTainted()
    and EntityConfig.GetPlayer(PlayerType.PLAYER_ISAAC_B):IsTainted() and EntityConfig.GetPlayer(99999) == nil)
  local ec = EntityConfig.GetEntity(EntityType.ENTITY_FLY, 0, 0)
  T("EntityConfig.GetEntity reads entities2.xml", ec ~= nil and ec:GetType() == 13 and ec:GetBaseHP() > 0 and ec:GetAnm2Path():lower():find("%.anm2$") ~= nil,
    ec and ec:GetAnm2Path())
  T("Isaac.GetEntitySubTypeByName", Isaac.GetEntitySubTypeByName("#FLY") == 0 and Isaac.GetEntitySubTypeByName("no such entity") == -1)
  T("Isaac.GetAchievementIdByName answers -1 for a name nobody defined", Isaac.GetAchievementIdByName("RGON_TEST_NO_SUCH") == -1)
  local pgd = Isaac.GetPersistentGameData()
  T("PersistentGameData:Unlocked answers for the game's achievements", type(pgd:Unlocked(1)) == "boolean")
  m:AddCallback(M.MC_POST_ACHIEVEMENT_UNLOCK, function(_, id) seen.ach = id end)
  T("a mod's achievement is kept by the layer: TryUnlock, Unlocked, POST_ACHIEVEMENT_UNLOCK, lockachievement",
    pgd:Unlocked(5000) == false and pgd:TryUnlock(5000, true) == true and pgd:Unlocked(5000) == true and seen.ach == 5000
    and pgd:TryUnlock(5000, true) == false and Isaac.ExecuteCommand("lockachievement 5000") == "" and pgd:Unlocked(5000) == false)
end

-- Sprite flags
do
  local spr = Sprite()
  spr:Load("gfx/001.000_player.anm2", true)
  T("Sprite:GetRenderFlags starts at 0 and SetRenderFlags is read back", spr:GetRenderFlags() == 0 and (spr:SetRenderFlags(5) or spr:GetRenderFlags() == 5))
end

-- a sprite's animation data
do
  local spr = Sprite()
  spr:Load("gfx/001.000_player.anm2", true)
  spr:Play("Death", true)
  local ad = spr:GetCurrentAnimationData()
  T("GetCurrentAnimationData is the animation playing", ad ~= nil and ad:GetName() == "Death" and ad:GetLength() > 1 and ad:IsLoopingAnimation() == false,
    ad and (ad:GetName() .. " " .. ad:GetLength()))
  local n, k = ad:GetLength(), 0
  while not spr:IsFinished("Death") and k < 2000 do spr:Update() k = k + 1 end
  T("its length is where the game ends the animation", k >= n - 1 and k <= n, k .. " updates for a length of " .. n)
  local walk = spr:GetAnimationData("WalkDown")
  T("GetAnimationData by name; a walk loops; no such animation is nil", walk ~= nil and walk:GetName() == "WalkDown" and walk:IsLoopingAnimation() == true
    and spr:GetAnimationData("no such animation") == nil)
  T("GetAllAnimationData has every animation, each with a name", #spr:GetAllAnimationData() > 20 and #spr:GetAllAnimationData()[1]:GetName() > 0, #spr:GetAllAnimationData())
  local l0 = ad:GetLayer(0)
  T("an animation's layers: one per sprite layer, found by id", l0 ~= nil and l0:GetLayerID() == 0 and #ad:GetAllLayers() == spr:GetLayerCount() and ad:GetLayer(63) == nil)
  -- not every layer has frames in every animation: take the first that does
  spr:Play("WalkDown", true)
  local walking, with_frames = spr:GetCurrentAnimationData(), nil
  for _, l in ipairs(walking:GetAllLayers()) do
    if l:GetFrame(0) ~= nil then with_frames = l break end
  end
  local f = with_frames and with_frames:GetFrame(0)
  T("a layer's frame at 0 starts at 0 and is as large as the player's sheet cells (32 by 32)", f ~= nil and f:GetStartFrame() == 0 and f:GetEndFrame() >= 1
    and f:GetWidth() == 32 and f:GetHeight() == 32 and near(f:GetScale().X, 1) and near(f:GetColor().R, 1) and f:IsVisible() == true,
    f and (f:GetWidth() .. "x" .. f:GetHeight() .. " until " .. f:GetEndFrame()))
  T("the frame after its end is the next one", f ~= nil and with_frames:GetFrame(f:GetEndFrame()) ~= f and with_frames:GetFrame(f:GetEndFrame()):GetStartFrame() == f:GetEndFrame())
  T("GetLayerFrameData is the layer's frame now; a layer with no frames, or no such layer, is nil",
    spr:GetLayerFrameData(with_frames:GetLayerID()) == f and spr:GetLayerFrameData(63) == nil)
  T("no overlay playing: no overlay animation data", spr:GetOverlayAnimationData() == nil)
  T("GetNullFrame of a null layer the sprite does not have is nil", spr:GetNullFrame("no such null layer") == nil)
end

-- entity fields: set through the game, read through the layer
do
  local fly = Isaac.Spawn(EntityType.ENTITY_FLY, 0, 0, centre() + Vector(120, 0), Vector(0, 0), nil)
  wait(2)
  local ref = EntityRef(p)
  T("a new enemy has no countdowns", fly:GetFreezeCountdown() == 0 and fly:GetPoisonCountdown() == 0 and fly:GetBossStatusEffectCooldown() == 0)
  fly:AddFreeze(ref, 77)
  T("AddFreeze(77) shows in GetFreezeCountdown", fly:GetFreezeCountdown() == 77, fly:GetFreezeCountdown())
  fly:SetFreezeCountdown(0)
  fly:AddPoison(ref, 61, 1.5)
  T("AddPoison(61) shows in GetPoisonCountdown, and its damage in GetPoisonDamage", fly:GetPoisonCountdown() == 61 and fly:GetPoisonDamage() >= 1.5 and fly:GetPoisonDamage() < 10
    and (fly:SetPoisonDamage(3.25) or near(fly:GetPoisonDamage(), 3.25)),
    fly:GetPoisonCountdown() .. " " .. tostring(fly:GetPoisonDamage()))
  fly:AddFear(ref, 43)
  T("AddFear(43) shows in GetFearCountdown", fly:GetFearCountdown() == 43, fly:GetFearCountdown())
  fly:AddBurn(ref, 52, 2.5)
  T("AddBurn(52) shows in GetBurnCountdown", fly:GetBurnCountdown() == 52, fly:GetBurnCountdown())
  fly:AddConfusion(ref, 38, false)
  T("AddConfusion(38) shows in GetConfusionCountdown", fly:GetConfusionCountdown() == 38, fly:GetConfusionCountdown())
  fly:SetPoisonCountdown(0) fly:SetFearCountdown(0) fly:SetBurnCountdown(0) fly:SetConfusionCountdown(0)
  T("the setters clear them (the status flags follow on the next update)", fly:GetPoisonCountdown() == 0 and fly:GetFearCountdown() == 0)
  fly:SetBossStatusEffectCooldown(9)
  T("SetBossStatusEffectCooldown is read back", fly:GetBossStatusEffectCooldown() == 9)
  fly:SetBossStatusEffectCooldown(0)
  fly:AddBleeding(ref, 55)
  T("AddBleeding(55), a call into the game, shows in GetBleedingCountdown", fly:GetBleedingCountdown() == 55, fly:GetBleedingCountdown())
  fly:AddWeakness(ref, 44)
  T("AddWeakness shows in GetWeaknessCountdown, and SetWeaknessCountdown is read back", fly:GetWeaknessCountdown() > 0
    and (fly:SetWeaknessCountdown(44) or fly:GetWeaknessCountdown() == 44), fly:GetWeaknessCountdown())
  fly:SetWeaknessCountdown(0)
  T("GetShadowSize is a small positive number and SetShadowSize is read back", fly:GetShadowSize() > 0 and fly:GetShadowSize() < 1
    and (fly:SetShadowSize(0.25) or near(fly:GetShadowSize(), 0.25)), fly:GetShadowSize())
  fly:SetInvincible(true)
  T("SetInvincible(true) is what the game's own IsInvincible answers", fly:IsInvincible() == true)
  fly:SetInvincible(false)
  T("and back", fly:IsInvincible() == false)
  T("GetSpeedMultiplier of a new enemy is 1", near(fly:GetSpeedMultiplier(), 1), fly:GetSpeedMultiplier())
  T("GetPauseTime / SetPauseTime", fly:GetPauseTime() == 0 and (fly:SetPauseTime(3) or fly:GetPauseTime() == 3))
  fly:SetPauseTime(0)
  T("CanDevolve and GetHitListIndex answer", type(fly:CanDevolve()) == "boolean" and math.type(fly:GetHitListIndex()) == "integer")
  T("Entity:ToSlot() of an enemy is nil; GetMinecart() of one on foot is nil", fly:ToSlot() == nil and fly:GetMinecart() == nil)
  local poof = fly:MakeBloodPoof()
  T("MakeBloodPoof gives the effect it made", poof ~= nil and poof.Type == EntityType.ENTITY_EFFECT, poof and poof.Variant)
  local off = p:GetNullOffset("no such null layer")
  T("GetNullOffset answers a Vector", off ~= nil and type(off.X) == "number")

  -- callbacks on it
  m:AddCallback(M.MC_PRE_STATUS_EFFECT_APPLY, function(_, status, ent, source, duration)
    seen.status = { status, ent and ent.Type, source and source.Type, duration }
    if duration == 13 then return false end
  end)
  m:AddCallback(M.MC_POST_STATUS_EFFECT_APPLY, function(_, status, ent, source, duration) seen.status_post = { status, duration } end)
  fly:AddCharmed(ref, 21)
  T("PRE/POST_STATUS_EFFECT_APPLY get (status, entity, source, duration)", seen.status and seen.status[1] == StatusEffect.CHARMED and seen.status[2] == EntityType.ENTITY_FLY
    and seen.status[3] == EntityType.ENTITY_PLAYER and seen.status[4] == 21 and seen.status_post and seen.status_post[2] == 21 and fly:GetCharmedCountdown() == 21,
    seen.status and (seen.status[1] .. " " .. tostring(seen.status[4])))
  fly:SetCharmedCountdown(0)
  seen.status_post = nil
  fly:AddFreeze(ref, 13)
  T("false from PRE_STATUS_EFFECT_APPLY: not applied, and POST does not run", fly:GetFreezeCountdown() == 0 and seen.status_post == nil, fly:GetFreezeCountdown())

  m:AddCallback(M.MC_POST_ENTITY_TAKE_DMG, function(_, ent, dmg, flags, source, countdown)
    seen.dmg = { ent and ent.Type, dmg, flags, source and source.Type, countdown }
    seen.dmg_n = (seen.dmg_n or 0) + 1
  end, EntityType.ENTITY_FLY)
  fly:Remove()
  fly = Isaac.Spawn(EntityType.ENTITY_FLY, 0, 0, centre() + Vector(120, 40), Vector(0, 0), nil)      -- one no status has touched
  local hp = fly.HitPoints
  local landed = fly:TakeDamage(1.5, 0, ref, 0)
  T("POST_ENTITY_TAKE_DMG gets (entity, damage, flags, source, countdown) after damage that landed",
    seen.dmg and seen.dmg[1] == EntityType.ENTITY_FLY and near(seen.dmg[2], 1.5) and seen.dmg[4] == EntityType.ENTITY_PLAYER and landed == true
    and seen.dmg_n == 1,
    seen.dmg and (tostring(seen.dmg[1]) .. " " .. tostring(seen.dmg[2]) .. " " .. tostring(seen.dmg[4]) .. " hp " .. hp .. "->" .. fly.HitPoints .. " fired " .. tostring(seen.dmg_n)) or "not fired")
  fly:Remove()
end

-- bombs
do
  local bomb = Isaac.Spawn(EntityType.ENTITY_BOMB, BombVariant.BOMB_NORMAL, 0, centre() + Vector(0, 120), Vector(0, 0), p):ToBomb()
  T("a new bomb: scale 1, a countdown, no fall", near(bomb:GetScale(), 1) and bomb:GetExplosionCountdown() > 20 and bomb:GetExplosionCountdown() < 120
    and near(bomb:GetFallSpeed(), 0), bomb:GetExplosionCountdown())
  bomb:SetExplosionCountdown(200)
  T("the game's own SetExplosionCountdown(200) is what GetExplosionCountdown reads", bomb:GetExplosionCountdown() == 200, bomb:GetExplosionCountdown())
  bomb:SetScale(1.5) bomb:SetRocketAngle(90) bomb:SetRocketSpeed(4) bomb:SetFallSpeed(-2) bomb:SetFallAcceleration(0.5)
  T("the bomb's setters are read back", near(bomb:GetScale(), 1.5) and near(bomb:GetRocketAngle(), 90) and near(bomb:GetRocketSpeed(), 4)
    and near(bomb:GetFallSpeed(), -2) and near(bomb:GetFallAcceleration(), 0.5))
  T("IsPrismTouched / SetPrismTouched", bomb:IsPrismTouched() == false and (bomb:SetPrismTouched(true) or bomb:IsPrismTouched() == true))
  m:AddCallback(M.MC_PRE_BOMB_UPDATE, function(_, b) seen.bomb_update = (seen.bomb_update or 0) + 1 end)
  wait(6)
  T("PRE_BOMB_UPDATE runs with the bomb", (seen.bomb_update or 0) >= 3, seen.bomb_update)
  bomb:Remove()
end

-- tears
do
  local tear = p:FireTear(p.Position, Vector(6, 0), false, true, false)
  T("a new tear: nothing hit, no prism, sprites to hand", #tear:GetHitList() == 0 and tear:IsPrismTouched() == false and tear:IsMultidimensionalTouched() == false
    and tear:GetTearEffectSprite() ~= nil and tear:GetTearHaloSprite() ~= nil and tear:GetDeadEyeSprite() ~= nil and near(tear:GetDeadEyeIntensity(), 0))
  m:AddCallback(M.MC_PRE_TEAR_UPDATE, function(_, t) seen.tear_update = (seen.tear_update or 0) + 1 end)
  m:AddCallback(M.MC_PRE_TEAR_RENDER, function(_, t, offset) seen.tear_render = offset and type(offset.X) == "number" end)
  wait(6)
  T("PRE_TEAR_UPDATE and PRE_TEAR_RENDER (with the render offset) run with the tear", (seen.tear_update or 0) >= 3 and seen.tear_render == true, seen.tear_update)
  tear:Remove()
end

-- lasers
do
  m:AddCallback(M.MC_POST_FIRE_TECH_LASER, function(_, l) seen.fired_laser = l and l.Type end)
  local laser = p:FireTechLaser(p.Position, LaserOffset.LASER_TECH1_OFFSET, Vector(1, 0), false, false)
  T("POST_FIRE_TECH_LASER gets the laser the player fired", seen.fired_laser == EntityType.ENTITY_LASER and laser ~= nil, seen.fired_laser)
  T("a new laser: a scale near 1, damage multiplier 1, nothing hit, no prism, no chain", laser ~= nil and laser:GetScale() > 0.5 and laser:GetScale() < 2 and near(laser:GetDamageMultiplier(), 1)
    and #laser:GetHitList() == 0 and laser:IsPrismTouched() == false and laser:GetNumChainedLasers() == 0, laser and laser:GetScale())
  laser:SetDamageMultiplier(2.5)
  laser:SetPrismTouched(true)
  T("the laser's setters are read back, and leave its neighbour OneHit alone", near(laser:GetDamageMultiplier(), 2.5) and laser:IsPrismTouched() == true and laser.OneHit == false)
  laser:Remove()
end

-- slots
do
  m:AddCallback(M.MC_POST_SLOT_INIT, function(_, s) seen.slot_init = s and s:GetState() end)
  m:AddCallback(M.MC_POST_SLOT_UPDATE, function(_, s) seen.slot_update = (seen.slot_update or 0) + 1 seen.slot_type = getmetatable(s).__type end)
  local e = Isaac.Spawn(EntityType.ENTITY_SLOT, 1, 0, centre() + Vector(-120, 0), Vector(0, 0), nil)
  local slot = e:ToSlot()
  T("Entity:ToSlot() on a slot machine is an EntitySlot in the idle state", slot ~= nil and slot:GetState() == SlotState.IDLE and getmetatable(slot).__type == "EntitySlot",
    slot and slot:GetState())
  T("an EntitySlot is still an Entity: the game's own fields and functions work on it", slot.Type == EntityType.ENTITY_SLOT and slot.Variant == 1
    and GetPtrHash(slot) == GetPtrHash(e) and slot:GetSprite() ~= nil and EntityRef(slot).Type == EntityType.ENTITY_SLOT)
  T("POST_SLOT_INIT ran with the slot", seen.slot_init == SlotState.IDLE, seen.slot_init)
  slot:SetState(SlotState.DESTROYED)
  T("SetState is read back", slot:GetState() == SlotState.DESTROYED)
  slot:SetState(SlotState.IDLE)
  T("its other fields answer", slot:GetDonationValue() == 0 and slot:GetTriggerTimerNum() == 0 and slot:GetPrizeSprite() ~= nil and slot:GetTouch() >= 0)
  wait(6)
  T("POST_SLOT_UPDATE runs with it, handing an EntitySlot", (seen.slot_update or 0) >= 3 and seen.slot_type == "EntitySlot", seen.slot_update)
  e:Remove()
end

-- the player
do
  m:AddCallback(M.MC_PRE_PLAYER_TAKE_DMG, function(_, pl, dmg, flags, source, countdown)
    seen.pdmg = { dmg, source and source.Type, countdown }
    return false
  end)
  local hearts = p:GetHearts() + p:GetSoulHearts()
  p:TakeDamage(1, 0, EntityRef(nil), 0)
  T("PRE_PLAYER_TAKE_DMG gets the damage and can refuse it", seen.pdmg and near(seen.pdmg[1], 1) and p:GetHearts() + p:GetSoulHearts() == hearts,
    seen.pdmg and tostring(seen.pdmg[1]))
  m:RemoveCallback(M.MC_PRE_PLAYER_TAKE_DMG, Isaac.GetCallbacks(M.MC_PRE_PLAYER_TAKE_DMG)[1].Function)

  m:AddCallback(M.MC_PRE_PLAYER_ADD_HEARTS, function(_, pl, amount, kind, flag)
    seen.pre_hearts = { amount, kind, flag }
    if kind == AddHealthType.SOUL and amount == 4 then return 2 end
  end)
  m:AddCallback(M.MC_POST_PLAYER_ADD_HEARTS, function(_, pl, amount, kind) seen.post_hearts = { amount, kind } end)
  local soul = p:GetSoulHearts()
  p:AddSoulHearts(4)
  T("PRE_PLAYER_ADD_HEARTS can change the amount; POST gets what was added", seen.pre_hearts and seen.pre_hearts[1] == 4 and seen.pre_hearts[2] == AddHealthType.SOUL
    and p:GetSoulHearts() == soul + 2 and seen.post_hearts and seen.post_hearts[1] == 2, p:GetSoulHearts() - soul)

  m:AddCallback(M.MC_PLAYER_GET_HEART_LIMIT, function(_, pl, limit, keeper) seen.limit = limit return limit + 2 end)
  local limit = p:GetHeartLimit()
  T("PLAYER_GET_HEART_LIMIT gets the limit and can raise it", seen.limit ~= nil and limit == seen.limit + 2, limit)

  m:AddCallback(M.MC_PRE_PLAYER_UPDATE, function() seen.pupd = (seen.pupd or 0) + 1 end)
  m:AddCallback(M.MC_PRE_PLAYER_RENDER, function(_, pl, offset) seen.prender = (seen.prender or 0) + 1 end)
  m:AddCallback(M.MC_PRE_UPDATE, function() seen.pre_update = (seen.pre_update or 0) + 1 end)
  m:AddCallback(M.MC_PRE_RENDER_PLAYER_HEAD, function(_, pl, pos) seen.head = pos and type(pos.X) == "number" end)
  wait(8)
  T("PRE_PLAYER_UPDATE, PRE_PLAYER_RENDER, PRE_UPDATE and PRE_RENDER_PLAYER_HEAD run every frame",
    (seen.pupd or 0) >= 4 and (seen.prender or 0) >= 4 and (seen.pre_update or 0) >= 4 and seen.head == true,
    (seen.pupd or 0) .. "/" .. (seen.prender or 0) .. "/" .. (seen.pre_update or 0))

  m:AddCallback(M.MC_POST_TRIGGER_TRINKET_ADDED, function(_, pl, trinket, first) seen.tr_add = { trinket, first } end)
  m:AddCallback(M.MC_POST_TRIGGER_TRINKET_REMOVED, function(_, pl, trinket) seen.tr_rem = trinket end)
  p:AddTrinket(TrinketType.TRINKET_SWALLOWED_PENNY)
  T("POST_TRIGGER_TRINKET_ADDED", seen.tr_add and seen.tr_add[1] == TrinketType.TRINKET_SWALLOWED_PENNY, seen.tr_add and seen.tr_add[1])
  p:TryRemoveTrinket(TrinketType.TRINKET_SWALLOWED_PENNY)
  T("POST_TRIGGER_TRINKET_REMOVED", seen.tr_rem == TrinketType.TRINKET_SWALLOWED_PENNY, seen.tr_rem)

  -- the player's own fields, each against the game's own API
  local fish = TrinketType.TRINKET_FISH_HEAD
  local before = p:GetSmeltedTrinkets({ fish })[fish]
  T("AddSmeltedTrinket: the game's HasTrinket and multiplier see it, and GetSmeltedTrinkets counts it",
    before ~= nil and before.trinketAmount == 0 and p:AddSmeltedTrinket(fish) == true and p:HasTrinket(fish) and p:GetTrinketMultiplier(fish) == 1
    and p:GetSmeltedTrinkets()[fish].trinketAmount == 1 and p:GetTrinket(0) ~= fish, p:GetTrinketMultiplier(fish))
  p:TryRemoveSmeltedTrinket(fish)
  T("TryRemoveSmeltedTrinket takes it away again", not p:HasTrinket(fish) and p:GetSmeltedTrinkets()[fish].trinketAmount == 0)
  T("AddSmeltedTrinket of a trinket that does not exist is false", p:AddSmeltedTrinket(30000) == false)
  T("the D8 multipliers of a fresh player are 1", near(p:GetD8DamageModifier(), 1) and near(p:GetD8SpeedModifier(), 1) and near(p:GetD8RangeModifier(), 1)
    and near(p:GetD8FireDelayModifier(), 1), p:GetD8DamageModifier())
  p:SetCanShoot(false)
  T("SetCanShoot(false) is what the game's CanShoot answers", p:CanShoot() == false)
  p:SetCanShoot(true)
  T("and back", p:CanShoot() == true)
  p:AddCollectible(CollectibleType.COLLECTIBLE_BOOK_OF_BELIAL, 2, false)
  local d = p:GetActiveItemDesc(0)
  T("GetActiveItemDesc(0) is the active item and its charge", d ~= nil and d.Item == CollectibleType.COLLECTIBLE_BOOK_OF_BELIAL and d.Charge == p:GetActiveCharge(0)
    and p:GetActiveItemDesc(1).Item == 0, d and (d.Item .. " " .. d.Charge))
  local list = p:GetCollectiblesList()
  T("GetCollectiblesList has the game's own counts", list[CollectibleType.COLLECTIBLE_BOOK_OF_BELIAL] == p:GetCollectibleNum(CollectibleType.COLLECTIBLE_BOOK_OF_BELIAL)
    and list[CollectibleType.COLLECTIBLE_MOMS_KNIFE] == 0 and #list > 700, #list)
  local luck = p:GetDonateLuck()
  p:DonateLuck(2)
  T("the game's DonateLuck(2) shows in GetDonateLuck", p:GetDonateLuck() == luck + 2, p:GetDonateLuck())
  T("GetBloodGushSprite is the blood gush sprite; the body and held sprites are sprites too", p:GetBloodGushSprite():GetFilename():lower():find("blood gush", 1, true) ~= nil
    and p:GetBodySprite() ~= nil and p:GetHeldSprite() ~= nil, p:GetBloodGushSprite():GetFilename())
  T("no Mega Blast running on a fresh Isaac; IsPostLevelInitFinished", p:GetMegaBlastDuration() == 0 and p:IsPostLevelInitFinished() == true)
  p:UseActiveItem(CollectibleType.COLLECTIBLE_MEGA_BLAST, false, false, true, false, -1)
  T("the game's Mega Blast sets GetMegaBlastDuration to its fifteen seconds", p:GetMegaBlastDuration() > 400 and p:GetMegaBlastDuration() <= 450, p:GetMegaBlastDuration())
  p:SetMegaBlastDuration(1)
  wait(4)
  T("SetMegaBlastDuration(1) ends it", p:GetMegaBlastDuration() == 0, p:GetMegaBlastDuration())
  T("GetPlayerIndex of the first player is 0", p:GetPlayerIndex() == 0)

  T("calls into the game on the player answer", type(p:CanCrushRocks()) == "boolean" and p:IsHologram() == false and math.type(p:GetGreedsGulletHearts()) == "integer"
    and #p:GetGlyphOfBalanceDrop() == 2 and p:HasInstantDeathCurse() == false)
  T("Game():AchievementUnlocksDisallowed() and IsGreedBoss() answer", type(Game():AchievementUnlocksDisallowed()) == "boolean" and Game():IsGreedBoss() == false)
  T("Level:HasAbandonedMineshaft() is false in the Basement", Game():GetLevel():HasAbandonedMineshaft() == false)
  T("Room:GetGridIndexByTile(row, column) and ({row, column}) agree", room:GetGridIndexByTile(1, 1) == room:GetGridIndexByTile({ 1, 1 }) and room:GetGridIndexByTile(1, 1) > 0,
    room:GetGridIndexByTile(1, 1))
end

-- a pickup collision
do
  m:AddCallback(M.MC_POST_PICKUP_COLLISION, function(_, pickup, collider, low) seen.pcol = { pickup and pickup.Variant, collider and collider.Type, low } end)
  local coins = p:GetNumCoins()
  local coin = Isaac.Spawn(EntityType.ENTITY_PICKUP, PickupVariant.PICKUP_COIN, 1, p.Position + Vector(4, 0), Vector(0, 0), nil)
  for _ = 1, 90 do
    if seen.pcol or p:GetNumCoins() > coins then break end
    wait(1)
  end
  T("POST_PICKUP_COLLISION ran when the player touched a coin (and took it)", seen.pcol and seen.pcol[1] == PickupVariant.PICKUP_COIN and seen.pcol[2] == EntityType.ENTITY_PLAYER,
    (seen.pcol and tostring(seen.pcol[2]) or "not fired") .. ", coins " .. coins .. "->" .. p:GetNumCoins())
end

-- the mods have loaded, and the layer said so once
T("MC_POST_MODS_LOADED is a callback the layer fires", REPENTOGON.Implemented[M.MC_POST_MODS_LOADED] == true)

-- an error in a callback run by the layer's rules is logged, and the rest still run
do
  local ran = 0
  m:AddCallback(M.MC_POST_ROOM_TRIGGER_CLEAR, function() error("rgon test 2: an error in a layer callback") end)
  m:AddCallback(M.MC_POST_ROOM_TRIGGER_CLEAR, function() ran = ran + 1 end)
  room:TriggerClear(true)
  T("after an error in one function the next one of the same callback still runs", ran == 1, ran)
end

local impl, unsup = 0, 0
for _ in pairs(REPENTOGON.Implemented) do impl = impl + 1 end
for _ in pairs(REPENTOGON.Unsupported or {}) do unsup = unsup + 1 end
say("RGON implemented " .. impl .. ", accepted but unsupported " .. unsup)
say("RGON END " .. checks .. " " .. failed)
