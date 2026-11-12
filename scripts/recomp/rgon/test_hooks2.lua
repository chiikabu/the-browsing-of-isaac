-- test_hooks2.lua -- round h2's hooked callbacks, checked from inside a running game:
--
--   node scripts/recomp/web/drive_stress.mjs "http://127.0.0.1:8321/play.html?ISAAC_RGON_ALLOW=zz-port-stress" <out> \
--        phases=custom lua=scripts/recomp/rgon/test_hooks2.lua zips=<layer.zip>
--
-- Same harness as test_layer.lua (say, wait, P, centre, press are the walk's
-- helpers). Each callback: the event is made to happen, the callback must fire
-- for it with the arguments REPENTOGON's documentation gives, and a "pre" one's
-- answer must do what the documentation says. The floor and the run are changed
-- last.
local checks, failed = 0, 0
local function T(name, cond, detail)
  checks = checks + 1
  if not cond then failed = failed + 1 end
  say("RGON " .. (cond and "ok   " or "FAIL ") .. name .. (detail ~= nil and (" -- " .. tostring(detail)) or ""))
end
if type(REPENTOGON) ~= "table" then say("RGON FAIL no REPENTOGON for this mod") say("RGON END 1 1") return end

local p = P()
local m = RegisterMod("rgon hooks test 2", 1)
local M, C = ModCallbacks, CollectibleType
local game = Game()
local config = Isaac.GetItemConfig()
local function same(a, b) return a ~= nil and b ~= nil and GetPtrHash(a) == GetPtrHash(b) end
local function on(id, f, param) if param == nil then m:AddCallback(id, f) else m:AddCallback(id, f, param) end return f end
local function off(id, f) m:RemoveCallback(id, f) end
local function near(a, b) return math.abs(a - b) < 0.01 end

-- MC_POST_TRIGGER_COLLECTIBLE_REMOVED: (player, item, removeFromPlayerForm, wispOrInnate), param = item
do
  local got, other = {}, 0
  local f = on(M.MC_POST_TRIGGER_COLLECTIBLE_REMOVED, function(_, pl, item, form, wisp) got[#got + 1] = { pl, item, form, wisp } end, C.COLLECTIBLE_SAD_ONION)
  local g = on(M.MC_POST_TRIGGER_COLLECTIBLE_REMOVED, function() other = other + 1 end, C.COLLECTIBLE_INNER_EYE)
  p:AddCollectible(C.COLLECTIBLE_SAD_ONION, 0, false)
  T("POST_TRIGGER_COLLECTIBLE_REMOVED: not fired by adding the item", #got == 0, #got)
  p:RemoveCollectible(C.COLLECTIBLE_SAD_ONION)
  local a = got[1] or {}
  T("POST_TRIGGER_COLLECTIBLE_REMOVED: RemoveCollectible fires it once with (player, item, true, false)",
    #got == 1 and same(a[1], p) and a[2] == C.COLLECTIBLE_SAD_ONION and a[3] == true and a[4] == false,
    #got .. " " .. tostring(a[2]) .. " " .. tostring(a[3]) .. " " .. tostring(a[4]))
  p:AddCollectible(C.COLLECTIBLE_SAD_ONION, 0, false)
  p:RemoveCollectible(C.COLLECTIBLE_SAD_ONION, false, ActiveSlot.SLOT_PRIMARY, false)
  T("POST_TRIGGER_COLLECTIBLE_REMOVED: RemoveCollectible's removeFromPlayerForm = false is passed on", #got == 2 and got[2][3] == false, #got)
  T("POST_TRIGGER_COLLECTIBLE_REMOVED: the parameter selects (the Inner Eye function did not run)", other == 0, other)
  off(M.MC_POST_TRIGGER_COLLECTIBLE_REMOVED, f) off(M.MC_POST_TRIGGER_COLLECTIBLE_REMOVED, g)
end

-- MC_POST_PLAYER_ADD_EFFECT (player, item, addCostume, count) / MC_POST_PLAYER_TRIGGER_EFFECT_REMOVED (player,
-- item, count), param = the ItemConfig item, matched by the item it stands for
do
  local onion, eye = config:GetCollectible(C.COLLECTIBLE_SAD_ONION), config:GetCollectible(C.COLLECTIBLE_INNER_EYE)
  local add, rem, other = {}, {}, 0
  local f1 = on(M.MC_POST_PLAYER_ADD_EFFECT, function(_, pl, it, cost, n) add[#add + 1] = { pl, it, cost, n } end, onion)
  local f2 = on(M.MC_POST_PLAYER_ADD_EFFECT, function() other = other + 1 end, eye)
  local f3 = on(M.MC_POST_PLAYER_TRIGGER_EFFECT_REMOVED, function(_, pl, it, n) rem[#rem + 1] = { pl, it, n } end, config:GetCollectible(C.COLLECTIBLE_SAD_ONION))
  local fx = p:GetEffects()
  fx:AddCollectibleEffect(C.COLLECTIBLE_SAD_ONION, false, 2)
  local a = add[1] or {}
  T("POST_PLAYER_ADD_EFFECT: (player, item, addCostume, count) for AddCollectibleEffect(onion, false, 2)",
    #add == 1 and same(a[1], p) and a[2] ~= nil and a[2].ID == C.COLLECTIBLE_SAD_ONION and a[3] == false and a[4] == 2,
    #add .. " " .. tostring(a[2] and a[2].ID) .. " " .. tostring(a[3]) .. " " .. tostring(a[4]))
  T("POST_PLAYER_ADD_EFFECT: an item parameter selects by the item (the Inner Eye function did not run)", other == 0, other)
  fx:RemoveCollectibleEffect(C.COLLECTIBLE_SAD_ONION, 1)
  local r = rem[1] or {}
  T("POST_PLAYER_TRIGGER_EFFECT_REMOVED: (player, item, 1) for RemoveCollectibleEffect(onion, 1)",
    #rem == 1 and same(r[1], p) and r[2] ~= nil and r[2].ID == C.COLLECTIBLE_SAD_ONION and r[3] == 1, #rem .. " " .. tostring(r[3]))
  fx:RemoveCollectibleEffect(C.COLLECTIBLE_SAD_ONION, -1)
  off(M.MC_POST_PLAYER_ADD_EFFECT, f1) off(M.MC_POST_PLAYER_ADD_EFFECT, f2) off(M.MC_POST_PLAYER_TRIGGER_EFFECT_REMOVED, f3)
end

-- MC_PRE/POST_PLAYER_ADD_COSTUME (item, player, itemStateOnly), MC_POST_PLAYER_REMOVE_COSTUME (item, player)
do
  local onion, eye = config:GetCollectible(C.COLLECTIBLE_SAD_ONION), config:GetCollectible(C.COLLECTIBLE_INNER_EYE)
  local pre, post, post_eye, removed, mode = {}, {}, 0, {}, nil
  local f1 = on(M.MC_PRE_PLAYER_ADD_COSTUME, function(_, it, pl, state)
    pre[#pre + 1] = { it, pl, state }
    if mode == "cancel" then return true elseif mode == "swap" then return eye end
  end, onion)
  local f2 = on(M.MC_POST_PLAYER_ADD_COSTUME, function(_, it, pl, state) post[#post + 1] = { it, pl, state } end, onion)
  local f3 = on(M.MC_POST_PLAYER_ADD_COSTUME, function() post_eye = post_eye + 1 end, eye)
  local f4 = on(M.MC_POST_PLAYER_REMOVE_COSTUME, function(_, it, pl) removed[#removed + 1] = { it, pl } end, onion)
  p:AddCostume(onion, false)
  local a, b = pre[1] or {}, post[1] or {}
  T("PRE/POST_PLAYER_ADD_COSTUME: both fire with (item, player, itemStateOnly)", #pre == 1 and #post == 1 and a[1].ID == C.COLLECTIBLE_SAD_ONION
    and same(a[2], p) and a[3] == false and b[1].ID == C.COLLECTIBLE_SAD_ONION and same(b[2], p), #pre .. " " .. #post)
  p:RemoveCostume(onion)
  T("POST_PLAYER_REMOVE_COSTUME: (item, player)", #removed == 1 and removed[1][1].ID == C.COLLECTIBLE_SAD_ONION and same(removed[1][2], p), #removed)
  mode = "cancel"
  p:AddCostume(onion, false)
  T("PRE_PLAYER_ADD_COSTUME -> true: no costume, so no POST", #pre == 2 and #post == 1, #pre .. " " .. #post)
  mode = "swap"
  local function shown(item)
    local n = 0
    for layer = 0, p:GetSprite():GetLayerCount() - 1 do if p:IsCollectibleCostumeVisible(item, layer) then n = n + 1 end end
    return n
  end
  local before_eye, before_onion = shown(C.COLLECTIBLE_INNER_EYE), shown(C.COLLECTIBLE_SAD_ONION)
  p:AddCostume(onion, false)
  local eye_n, onion_n = shown(C.COLLECTIBLE_INNER_EYE), shown(C.COLLECTIBLE_SAD_ONION)
  T("PRE_PLAYER_ADD_COSTUME -> another item: that costume is put on instead (and POST runs for it)", #pre == 3 and #post == 1 and post_eye == 1
    and before_eye == 0 and before_onion == 0 and eye_n >= 1 and onion_n == 0, post_eye .. " eye " .. before_eye .. "->" .. eye_n .. " onion " .. before_onion .. "->" .. onion_n)
  mode = nil
  p:RemoveCostume(eye)
  for _, f in ipairs({ f1, f2, f3 }) do off(M.MC_PRE_PLAYER_ADD_COSTUME, f) off(M.MC_POST_PLAYER_ADD_COSTUME, f) end
  off(M.MC_POST_PLAYER_REMOVE_COSTUME, f4)
end

-- an active item for what follows: Yum Heart, 4 charges
p:AddCollectible(C.COLLECTIBLE_YUM_HEART, 0, false, ActiveSlot.SLOT_PRIMARY)

-- MC_PLAYER_GET_ACTIVE_MAX_CHARGE (item, player, varData, current) -> an integer: the item's max charge
do
  local seen
  local f = on(M.MC_PLAYER_GET_ACTIVE_MAX_CHARGE, function(_, item, pl, var, cur) seen = { item, pl, var, cur } return 2 end, C.COLLECTIBLE_YUM_HEART)
  p:SetActiveCharge(0, ActiveSlot.SLOT_PRIMARY)
  p:FullCharge(ActiveSlot.SLOT_PRIMARY, true)
  T("PLAYER_GET_ACTIVE_MAX_CHARGE: (item, player, varData, 4) and FullCharge fills to the 2 it answered",
    seen ~= nil and seen[1] == C.COLLECTIBLE_YUM_HEART and same(seen[2], p) and seen[4] == 4 and p:GetActiveCharge(ActiveSlot.SLOT_PRIMARY) == 2,
    tostring(seen and seen[4]) .. " -> " .. p:GetActiveCharge(ActiveSlot.SLOT_PRIMARY))
  off(M.MC_PLAYER_GET_ACTIVE_MAX_CHARGE, f)
  p:FullCharge(ActiveSlot.SLOT_PRIMARY, true)
  T("without it FullCharge fills to 4 again", p:GetActiveCharge(ActiveSlot.SLOT_PRIMARY) == 4, p:GetActiveCharge(ActiveSlot.SLOT_PRIMARY))
end

-- MC_POST_DISCHARGE_ACTIVE_ITEM (item, collectibleRemoved, player, slot), param = item
do
  local got
  local f = on(M.MC_POST_DISCHARGE_ACTIVE_ITEM, function(_, item, removed, pl, slot) got = { item, removed, pl, slot } end, C.COLLECTIBLE_YUM_HEART)
  p:DischargeActiveItem(ActiveSlot.SLOT_PRIMARY)
  T("POST_DISCHARGE_ACTIVE_ITEM: (item, false, player, slot 0), and the charge is gone",
    got ~= nil and got[1] == C.COLLECTIBLE_YUM_HEART and got[2] == false and same(got[3], p) and got[4] == 0 and p:GetActiveCharge(0) == 0,
    got and (tostring(got[1]) .. " " .. tostring(got[2]) .. " " .. tostring(got[4])))
  off(M.MC_POST_DISCHARGE_ACTIVE_ITEM, f)
end

-- MC_PLAYER_GET_ACTIVE_MIN_USABLE_CHARGE (slot, player, current) -> an integer: usable from that charge
do
  local seen, used = nil, 0
  local fu = on(M.MC_USE_ITEM, function() used = used + 1 end, C.COLLECTIBLE_YUM_HEART)
  p:SetActiveCharge(1, ActiveSlot.SLOT_PRIMARY)
  wait(2)
  press(ButtonAction.ACTION_ITEM, 6) wait(10)
  T("with 1 of 4 charges Yum Heart cannot be used", used == 0, used)
  local f = on(M.MC_PLAYER_GET_ACTIVE_MIN_USABLE_CHARGE, function(_, slot, pl, cur) seen = { slot, pl, cur } return 1 end, C.COLLECTIBLE_YUM_HEART)
  wait(2)
  press(ButtonAction.ACTION_ITEM, 6) wait(10)
  T("PLAYER_GET_ACTIVE_MIN_USABLE_CHARGE: (slot 0, player, 4), and answering 1 makes it usable with 1 charge",
    seen ~= nil and seen[1] == 0 and same(seen[2], p) and seen[3] == 4 and used == 1, tostring(seen and seen[3]) .. " used " .. used)
  off(M.MC_PLAYER_GET_ACTIVE_MIN_USABLE_CHARGE, f) off(M.MC_USE_ITEM, fu)
end

-- MC_PRE/POST_PLAYERHUD_RENDER_ACTIVE_ITEM (player, slot, offset, alpha, scale, chargeBarOffset), param = item
do
  p:FullCharge(ActiveSlot.SLOT_PRIMARY, true)
  local pre, post, cancel = 0, {}, false
  local f1 = on(M.MC_PRE_PLAYERHUD_RENDER_ACTIVE_ITEM, function(_, pl, slot)
    if same(pl, p) and slot == 0 then pre = pre + 1 end
    if cancel then return true end
  end, C.COLLECTIBLE_YUM_HEART)
  local f2 = on(M.MC_POST_PLAYERHUD_RENDER_ACTIVE_ITEM, function(_, pl, slot, offset, alpha, scale, bar) post[#post + 1] = { pl, slot, offset, alpha, scale, bar } end, C.COLLECTIBLE_YUM_HEART)
  wait(6)
  local a = post[#post] or {}
  T("PRE/POST_PLAYERHUD_RENDER_ACTIVE_ITEM fire every frame for the primary slot", pre >= 3 and #post >= 3, pre .. " " .. #post)
  T("POST_PLAYERHUD_RENDER_ACTIVE_ITEM: (player, 0, offset, alpha, scale 1, the charge bar 34 right and 17 down)",
    same(a[1], p) and a[2] == 0 and type(a[3]) == "userdata" and type(a[4]) == "number" and a[5] == 1
    and near(a[6].X - a[3].X, 34) and near(a[6].Y - a[3].Y, 17), a[3] and (a[3].X .. "," .. a[3].Y .. " bar " .. a[6].X .. "," .. a[6].Y .. " scale " .. tostring(a[5])))
  cancel = true
  local n = #post
  wait(6)
  T("PRE_PLAYERHUD_RENDER_ACTIVE_ITEM -> true: not drawn (no POST)", #post == n, #post - n)
  off(M.MC_PRE_PLAYERHUD_RENDER_ACTIVE_ITEM, f1) off(M.MC_POST_PLAYERHUD_RENDER_ACTIVE_ITEM, f2)
end

-- MC_PRE_RENDER: once per frame drawn
do
  local n = 0
  local f = on(M.MC_PRE_RENDER, function() n = n + 1 end)
  wait(10)
  T("PRE_RENDER fires every frame", n >= 10, n)
  off(M.MC_PRE_RENDER, f)
end

-- MC_PRE_USE_PILL (effect, color, player, flags), param = effect -> true: not used
do
  local seen, used, cancel = nil, 0, false
  local E = PillEffect.PILLEFFECT_BALLS_OF_STEEL
  local f1 = on(M.MC_PRE_USE_PILL, function(_, e, color, pl, flags) seen = { e, color, pl, flags } if cancel then return true end end, E)
  local f2 = on(M.MC_USE_PILL, function() used = used + 1 end, E)
  p:UsePill(E, PillColor.PILL_BLUE_BLUE, UseFlag.USE_NOANIM)
  T("PRE_USE_PILL: (effect, color, player, flags), then the pill is used", seen ~= nil and seen[1] == E and seen[2] == PillColor.PILL_BLUE_BLUE
    and same(seen[3], p) and seen[4] == UseFlag.USE_NOANIM and used == 1, used)
  cancel = true
  p:UsePill(E, PillColor.PILL_BLUE_BLUE, UseFlag.USE_NOANIM)
  T("PRE_USE_PILL -> true: the pill is not used", used == 1, used)
  off(M.MC_PRE_USE_PILL, f1) off(M.MC_USE_PILL, f2)
end

-- MC_POST_FAMILIAR_FIRE_PROJECTILE (tear), param = familiar variant
do
  local got = {}
  local f = on(M.MC_POST_FAMILIAR_FIRE_PROJECTILE, function(_, tear) got[#got + 1] = tear end, FamiliarVariant.BROTHER_BOBBY)
  local fam = Isaac.Spawn(EntityType.ENTITY_FAMILIAR, FamiliarVariant.BROTHER_BOBBY, 0, p.Position, Vector(0, 0), p):ToFamiliar()
  wait(2)
  local tear = fam:FireProjectile(Vector(1, 0))
  T("POST_FAMILIAR_FIRE_PROJECTILE: once, with the tear FireProjectile answered", #got == 1 and tear ~= nil and same(got[1], tear)
    and got[1].Type == EntityType.ENTITY_TEAR, #got)
  off(M.MC_POST_FAMILIAR_FIRE_PROJECTILE, f)
  fam:Remove()
  if tear then tear:Remove() end
end

-- MC_POST_PLAYER_DROP_TRINKET (trinket, dropPos, player, isGolden, replaceTick, pickup), param = trinket
do
  local got
  local tr = TrinketType.TRINKET_SWALLOWED_PENNY
  local f = on(M.MC_POST_PLAYER_DROP_TRINKET, function(_, t, pos, pl, golden, tick, pick) got = { t, pos, pl, golden, tick, pick } end, tr)
  p:AddTrinket(tr | 0x8000, false)
  local at = centre() + Vector(-40, 40)
  p:DropTrinket(at, false)
  T("POST_PLAYER_DROP_TRINKET: (trinket, the position, player, golden, false, the pickup)", got ~= nil and got[1] == tr and got[2]:Distance(at) < 1
    and same(got[3], p) and got[4] == true and got[5] == false and got[6] ~= nil and got[6].Variant == PickupVariant.PICKUP_TRINKET, got and tostring(got[4]))
  off(M.MC_POST_PLAYER_DROP_TRINKET, f)
  if got and got[6] then got[6]:Remove() end
end

-- explosions: MC_PRE/POST_BOMB_DAMAGE, MC_PRE/POST_APPLY_TEARFLAG_EFFECTS (BombDamage applies the
-- flags to each enemy it hurts when there are flags and a source: 0x006ffbce..0x006ffbe7; spectral
-- tears' flag is the one used, as it does nothing to an enemy), MC_PRE/POST_BOMB_TEARFLAG_EFFECTS
do
  local g = Isaac.Spawn(EntityType.ENTITY_GAPER, 0, 0, centre() + Vector(0, 80), Vector(0, 0), nil):ToNPC()
  g.MaxHitPoints, g.HitPoints = 1000, 1000
  local spot = g.Position
  local function hold() g.Position, g.Velocity = spot, Vector(0, 0) end     -- the gaper walks; each explosion is where it was spawned
  for _ = 1, 600 do if g.FrameCount >= 40 then break end wait(1) end     -- past its appearing
  local pre, post, apre, apost = {}, {}, {}, {}
  local mode, amode = nil, nil
  local f1 = on(M.MC_PRE_BOMB_DAMAGE, function(_, pos, dmg, radius, line, src, flags, dflags, dsrc)
    pre[#pre + 1] = { pos, dmg, radius, line, src, flags, dflags, dsrc }
    if mode == "cancel" then return false elseif mode == "zero" then return { Damage = 0 } end
  end, EntityType.ENTITY_PLAYER)
  local f2 = on(M.MC_POST_BOMB_DAMAGE, function(_, pos, dmg, radius, line, src, flags, dflags, dsrc) post[#post + 1] = { pos, dmg, radius, line, src, flags, dflags, dsrc } end)
  local f3 = on(M.MC_PRE_APPLY_TEARFLAG_EFFECTS, function(_, npc, pos, flags, src, dmg)
    apre[#apre + 1] = { npc, pos, flags, src, dmg }
    if amode == "cancel" then return false elseif amode == "slow" then return { TearFlags = TearFlags.TEAR_SLOW } end
  end, EntityType.ENTITY_PLAYER)
  local f4 = on(M.MC_POST_APPLY_TEARFLAG_EFFECTS, function(_, npc, pos, flags, src, dmg) apost[#apost + 1] = { npc, pos, flags, src, dmg } end)
  hold()
  local hp, at = g.HitPoints, g.Position
  game:BombDamage(at, 5, 40, false, p, TearFlags.TEAR_SPECTRAL, DamageFlag.DAMAGE_EXPLOSION, false)
  wait(2)
  local a, b = pre[1] or {}, post[1] or {}
  T("PRE/POST_BOMB_DAMAGE: once each with (position, 5, 40, false, player, flags, DAMAGE_EXPLOSION, false)",
    #pre == 1 and #post == 1 and a[1] ~= nil and a[1]:Distance(at) < 1 and a[2] == 5 and a[3] == 40 and a[4] == false
    and same(a[5], p) and type(a[6]) == "userdata" and a[7] == DamageFlag.DAMAGE_EXPLOSION and a[8] == false and same(b[5], p) and b[2] == 5,
    #pre .. " " .. #post .. " " .. tostring(a[2]) .. " " .. tostring(a[7]))
  T("the gaper took the explosion's damage", g.HitPoints < hp, hp .. " -> " .. g.HitPoints)
  local c = apre[1] or {}
  T("PRE/POST_APPLY_TEARFLAG_EFFECTS: (the gaper, a position, a BitSet128, the player, damage) as the explosion hurt it",
    #apre >= 1 and #apost == #apre and same(c[1], g) and type(c[2]) == "userdata" and type(c[3]) == "userdata" and same(c[4], p) and type(c[5]) == "number",
    #apre .. " " .. #apost)
  mode = "cancel"
  wait(20)
  hp = g.HitPoints
  local np, na = #post, #apre
  hold()
  game:BombDamage(g.Position, 5, 40, false, p, TearFlags.TEAR_SPECTRAL, DamageFlag.DAMAGE_EXPLOSION, false)
  wait(2)
  T("PRE_BOMB_DAMAGE -> false: no damage, no POST, no tear flag effects", g.HitPoints == hp and #post == np and #apre == na, hp .. " " .. g.HitPoints)
  mode = "zero"
  wait(20)
  hold()
  game:BombDamage(g.Position, 5, 40, false, p, TearFlags.TEAR_SPECTRAL, DamageFlag.DAMAGE_EXPLOSION, false)
  wait(2)
  T("PRE_BOMB_DAMAGE -> {Damage = 0}: the gaper is not hurt and POST sees 0", g.HitPoints == hp and #post == np + 1 and post[#post][2] == 0,
    g.HitPoints .. " " .. tostring(post[#post] and post[#post][2]))
  mode = nil
  -- an enemy just hurt ignores the next hit for a few frames, and the flags are applied only to a hit that
  -- lands: each explosion below waits that out, and each check also asks that PRE did run for the gaper
  -- Round 109: these two used to wait a fixed 20 frames and read the counters 2 frames after one
  -- explosion. Now and then that explosion applied no tear flags to the gaper at all ("0 0 hp 995.0":
  -- PRE had not run): flags are applied (slot 91) only to an enemy the explosion takes, and an enemy just
  -- hit, or still appearing, is skipped. The gaper's hit points are no sign of it (a 1-damage explosion that
  -- applied its flags left them at 995.0, measured), and after the explosions above the gaper can go on
  -- being skipped for long (measured: 0 of 12 explosions 12 frames apart, in one run of three). So each of
  -- the two checks has a gaper of its own, out of its appearing, and waits on the event itself: one
  -- explosion at a time, 12 frames apart, until PRE has run for that gaper (at most 12), then reads the
  -- counters.
  local function fresh_gaper(at)
    local t = Isaac.Spawn(EntityType.ENTITY_GAPER, 0, 0, at, Vector(0, 0), nil):ToNPC()
    t.MaxHitPoints, t.HitPoints = 1000, 1000
    for _ = 1, 600 do if t.FrameCount >= 40 then break end wait(1) end
    return t
  end
  local function count_for(list, t)
    local n = 0
    for _, e in ipairs(list) do if same(e[1], t) then n = n + 1 end end
    return n
  end
  local function pre_for(t) return count_for(apre, t) end
  local function land_one(t, at)
    for try = 1, 12 do
      local n0 = pre_for(t)
      t.Position, t.Velocity = at, Vector(0, 0)
      game:BombDamage(at, 1, 40, false, p, TearFlags.TEAR_SPECTRAL, DamageFlag.DAMAGE_EXPLOSION, false)
      wait(2)
      if pre_for(t) > n0 then return try end
      wait(10)
    end
    return 0
  end
  local at2 = centre() + Vector(-100, 80)
  amode = "cancel"
  local g2 = fresh_gaper(at2)
  local tries = land_one(g2, at2)
  T("PRE_APPLY_TEARFLAG_EFFECTS -> false: PRE ran, no POST", tries > 0 and pre_for(g2) == 1 and count_for(apost, g2) == 0,
    pre_for(g2) .. " " .. count_for(apost, g2) .. " hp " .. g2.HitPoints .. " tries " .. tries)
  g2:Remove()
  amode = "slow"
  local g3 = fresh_gaper(at2)
  T("the gaper is not slowed before", not g3:HasEntityFlags(EntityFlag.FLAG_SLOW))
  tries = land_one(g3, at2)
  T("PRE_APPLY_TEARFLAG_EFFECTS -> {TearFlags = TEAR_SLOW}: the gaper is slowed", tries > 0 and pre_for(g3) == 1 and g3:HasEntityFlags(EntityFlag.FLAG_SLOW),
    pre_for(g3) .. " tries " .. tries)
  g3:Remove()
  amode = nil
  off(M.MC_PRE_BOMB_DAMAGE, f1) off(M.MC_POST_BOMB_DAMAGE, f2) off(M.MC_PRE_APPLY_TEARFLAG_EFFECTS, f3) off(M.MC_POST_APPLY_TEARFLAG_EFFECTS, f4)

  local tpre, tpost, tcancel = {}, {}, false
  local f5 = on(M.MC_PRE_BOMB_TEARFLAG_EFFECTS, function(_, pos, radius, flags, src, mult)
    tpre[#tpre + 1] = { pos, radius, flags, src, mult }
    if tcancel then return false end
  end)
  local f6 = on(M.MC_POST_BOMB_TEARFLAG_EFFECTS, function(_, pos, radius, flags, src, mult) tpost[#tpost + 1] = { pos, radius, flags, src, mult } end)
  game:BombTearflagEffects(g.Position, 40, TearFlags.TEAR_NORMAL, p, 1.5)
  local d = tpre[1] or {}
  T("PRE/POST_BOMB_TEARFLAG_EFFECTS: once each with (position, 40, flags, player, 1.5)", #tpre == 1 and #tpost == 1 and d[2] == 40
    and type(d[3]) == "userdata" and same(d[4], p) and d[5] == 1.5 and tpost[1][5] == 1.5, #tpre .. " " .. #tpost)
  tcancel = true
  game:BombTearflagEffects(g.Position, 40, TearFlags.TEAR_NORMAL, p, 1.5)
  T("PRE_BOMB_TEARFLAG_EFFECTS -> false: no POST", #tpre == 2 and #tpost == 1, #tpre .. " " .. #tpost)
  off(M.MC_PRE_BOMB_TEARFLAG_EFFECTS, f5) off(M.MC_POST_BOMB_TEARFLAG_EFFECTS, f6)
  g:Remove()
  wait(2)
end

-- MC_PRE/POST_OPEN_CHEST (pickup, player), param = pickup variant
do
  local pre, post, cancel = 0, {}, false
  local f1 = on(M.MC_PRE_OPEN_CHEST, function() pre = pre + 1 if cancel then return false end end, PickupVariant.PICKUP_CHEST)
  local f2 = on(M.MC_POST_OPEN_CHEST, function(_, pick, pl) post[#post + 1] = { pick, pl } end, PickupVariant.PICKUP_CHEST)
  local chest = Isaac.Spawn(EntityType.ENTITY_PICKUP, PickupVariant.PICKUP_CHEST, ChestSubType.CHEST_CLOSED, centre() + Vector(-80, 0), Vector(0, 0), nil):ToPickup()
  wait(2)
  local opened = chest:TryOpenChest(p)
  T("PRE/POST_OPEN_CHEST: the chest opens and POST has (that chest, player)", opened == true and pre == 1 and #post == 1 and same(post[1][1], chest)
    and same(post[1][2], p), tostring(opened) .. " " .. pre .. " " .. #post)
  cancel = true
  local other = Isaac.Spawn(EntityType.ENTITY_PICKUP, PickupVariant.PICKUP_CHEST, ChestSubType.CHEST_CLOSED, centre() + Vector(80, 0), Vector(0, 0), nil):ToPickup()
  wait(2)
  local opened2 = other:TryOpenChest(p)
  T("PRE_OPEN_CHEST -> false: TryOpenChest answers false, the chest stays closed, no POST", opened2 == false and other.SubType == ChestSubType.CHEST_CLOSED
    and #post == 1, tostring(opened2) .. " " .. other.SubType .. " " .. #post)
  off(M.MC_PRE_OPEN_CHEST, f1) off(M.MC_POST_OPEN_CHEST, f2)
  other:Remove()
  wait(2)
end

-- MC_PRE/POST_PLAYER_TRIGGER_ROOM_CLEAR (player), param = player variant
do
  local pre, post, cancel = {}, {}, false
  local f1 = on(M.MC_PRE_PLAYER_TRIGGER_ROOM_CLEAR, function(_, pl) pre[#pre + 1] = pl if cancel then return false end end)
  local f2 = on(M.MC_POST_PLAYER_TRIGGER_ROOM_CLEAR, function(_, pl) post[#post + 1] = pl end, PlayerVariant.PLAYER)
  game:GetRoom():TriggerClear(true)
  wait(2)
  T("PRE/POST_PLAYER_TRIGGER_ROOM_CLEAR: Room:TriggerClear fires both for the player", #pre == 1 and #post == 1 and same(pre[1], p) and same(post[1], p),
    #pre .. " " .. #post)
  cancel = true
  game:GetRoom():TriggerClear(true)
  wait(2)
  T("PRE_PLAYER_TRIGGER_ROOM_CLEAR -> false: no POST", #pre == 2 and #post == 1, #pre .. " " .. #post)
  off(M.MC_PRE_PLAYER_TRIGGER_ROOM_CLEAR, f1) off(M.MC_POST_PLAYER_TRIGGER_ROOM_CLEAR, f2)
end

-- leaving and entering rooms: MC_PRE_ROOM_EXIT (player, newLevel), MC_PRE_NEW_ROOM (room, descriptor),
-- MC_POST_PLAYER_NEW_ROOM_TEMP_EFFECTS (player)
do
  local level = game:GetLevel()
  local start = level:GetCurrentRoomIndex()
  local exits, news, temps = {}, {}, {}
  local f1 = on(M.MC_PRE_ROOM_EXIT, function(_, pl, newLevel) exits[#exits + 1] = { pl, newLevel, game:GetLevel():GetCurrentRoomIndex() } end)
  local f2 = on(M.MC_PRE_NEW_ROOM, function(_, room, desc) news[#news + 1] = { room, desc, desc and desc.SafeGridIndex, room:GetFrameCount() } end)
  local f3 = on(M.MC_POST_PLAYER_NEW_ROOM_TEMP_EFFECTS, function(_, pl) temps[#temps + 1] = pl end)
  Isaac.ExecuteCommand("goto s.treasure.0")
  wait(40)
  local a = exits[1] or {}
  T("PRE_ROOM_EXIT: once on leaving the room, with (player, false), while the room is still the old one",
    #exits == 1 and same(a[1], p) and a[2] == false and a[3] == start, #exits .. " " .. tostring(a[2]) .. " " .. tostring(a[3]) .. "/" .. start)
  T("PRE_NEW_ROOM: once, with the room", #news == 1 and news[1][1] ~= nil and news[1][1].GetRoomShape ~= nil, #news)
  T("POST_PLAYER_NEW_ROOM_TEMP_EFFECTS: once for the player in the new room", #temps == 1 and same(temps[1], p), #temps)
  game:StartRoomTransition(start, Direction.NO_DIRECTION, RoomTransitionAnim.FADE)
  wait(60)
  T("back in the start room: each fired once more", #exits == 2 and #news == 2 and #temps == 2, #exits .. " " .. #news .. " " .. #temps)
  local d = news[2] or {}
  T("PRE_NEW_ROOM: the descriptor is the start room's", d[2] ~= nil and d[3] == start and level:GetCurrentRoomIndex() == start, tostring(d[3]) .. "/" .. start)
  off(M.MC_PRE_ROOM_EXIT, f1) off(M.MC_PRE_NEW_ROOM, f2) off(M.MC_POST_PLAYER_NEW_ROOM_TEMP_EFFECTS, f3)
  p = P()
end

-- MC_PRE_LEVEL_SELECT (stage, type) -> {stage, type}: that one instead
do
  local level = game:GetLevel()
  local stage, kind = level:GetStage(), level:GetStageType()
  local seen, answer = nil, { 3, 0 }
  local f = on(M.MC_PRE_LEVEL_SELECT, function(_, s, t) seen = { s, t } return answer end)
  level:SetStage(2, 0)
  T("PRE_LEVEL_SELECT: (2, 0) for SetStage(2, 0), and the answer {3, 0} is the stage set", seen ~= nil and seen[1] == 2 and seen[2] == 0 and level:GetStage() == 3,
    tostring(seen and seen[1]) .. " -> " .. level:GetStage())
  answer = { 99, 0 }
  level:SetStage(2, 0)
  T("PRE_LEVEL_SELECT: an answer out of range is ignored", level:GetStage() == 2, level:GetStage())
  off(M.MC_PRE_LEVEL_SELECT, f)
  level:SetStage(stage, kind)
  T("SetStage back to where it was", level:GetStage() == stage and level:GetStageType() == kind)
end

-- MC_PRE_LEVEL_INIT: a new floor
do
  local n, exits = 0, {}
  local f = on(M.MC_PRE_LEVEL_INIT, function() n = n + 1 end)
  local news = {}
  local g = on(M.MC_PRE_ROOM_EXIT, function(_, pl, newLevel) exits[#exits + 1] = newLevel end)
  local h = on(M.MC_POST_PLAYER_NEW_LEVEL, function(_, pl, upd, done) news[#news + 1] = { pl, upd, done } end, p:GetPlayerType())
  Isaac.ExecuteCommand("stage 2")
  wait(30)
  T("PRE_LEVEL_INIT: once for `stage 2`", n == 1, n)
  local a = news[1] or {}
  T("POST_PLAYER_NEW_LEVEL: once for `stage 2`, (player, false, true)", #news == 1 and same(a[1], P()) and a[2] == false and a[3] == true,
    #news .. " " .. tostring(a[2]) .. " " .. tostring(a[3]))
  off(M.MC_PRE_LEVEL_INIT, f) off(M.MC_PRE_ROOM_EXIT, g) off(M.MC_POST_PLAYER_NEW_LEVEL, h)
  p = P()
end

-- MC_PLAYER_INIT_POST_LEVEL_INIT_STATS (player), param = player type: a new run's player got its starting items
do
  local got = {}
  local f = on(M.MC_PLAYER_INIT_POST_LEVEL_INIT_STATS, function(_, pl) got[#got + 1] = { pl, pl:GetPlayerType(), pl:GetActiveItem(0) } end)
  Isaac.ExecuteCommand("restart")
  wait(90)
  p = P()
  local a = got[1] or {}
  T("PLAYER_INIT_POST_LEVEL_INIT_STATS: once on restart, for the new run's player, its starting items given",
    #got == 1 and same(a[1], p) and a[2] == p:GetPlayerType() and a[3] == p:GetActiveItem(0), #got .. " " .. tostring(a[2]) .. " " .. tostring(a[3]))
  off(M.MC_PLAYER_INIT_POST_LEVEL_INIT_STATS, f)
end

say("RGON END " .. checks .. " " .. failed)
