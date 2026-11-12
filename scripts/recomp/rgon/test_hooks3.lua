-- test_hooks3.lua -- round 109's functions and callbacks, checked from inside a running game:
--
--   node scripts/recomp/web/drive_stress.mjs "http://127.0.0.1:8332/play.html?ISAAC_RGON_ALLOW=zz-port-stress" <out> \
--        phases=custom lua=scripts/recomp/rgon/test_hooks3.lua zips=<layer.zip>
--
-- Same harness as test_hooks2.lua (say, wait, P, centre, press are the walk's helpers). Each name: the
-- event is made to happen, and the answer or the callback's arguments must be what REPENTOGON's
-- documentation gives; a callback's answer must change what the game does.
local checks, failed = 0, 0
local function T(name, cond, detail)
  checks = checks + 1
  if not cond then failed = failed + 1 end
  say("RGON " .. (cond and "ok   " or "FAIL ") .. name .. (detail ~= nil and (" -- " .. tostring(detail)) or ""))
end
if type(REPENTOGON) ~= "table" then say("RGON FAIL no REPENTOGON for this mod") say("RGON END 1 1") return end

local p = P()
local m = RegisterMod("rgon hooks test 3", 1)
local M, C = ModCallbacks, CollectibleType
local game = Game()
local config = Isaac.GetItemConfig()
local sfx = SFXManager()
local function same(a, b) return a ~= nil and b ~= nil and GetPtrHash(a) == GetPtrHash(b) end
local function on(id, f, param) if param == nil then m:AddCallback(id, f) else m:AddCallback(id, f, param) end return f end
local function off(id, f) m:RemoveCallback(id, f) end
local function skipped(name) T(name .. " (not in this layer)", false) end

-- EntityPlayer:GetActiveMaxCharge(slot) / GetActiveMinUsableCharge(slot)
if p.GetActiveMaxCharge and p.GetActiveMinUsableCharge then
  p:AddCollectible(C.COLLECTIBLE_YUM_HEART, 0, false, ActiveSlot.SLOT_PRIMARY)
  T("GetActiveMaxCharge(primary): Yum Heart's 4", p:GetActiveMaxCharge(ActiveSlot.SLOT_PRIMARY) == 4, p:GetActiveMaxCharge(ActiveSlot.SLOT_PRIMARY))
  T("GetActiveMaxCharge(): the slot defaults to the primary", p:GetActiveMaxCharge() == 4, p:GetActiveMaxCharge())
  T("GetActiveMaxCharge(secondary) of an empty slot: 0", p:GetActiveMaxCharge(ActiveSlot.SLOT_SECONDARY) == 0, p:GetActiveMaxCharge(ActiveSlot.SLOT_SECONDARY))
  T("GetActiveMaxCharge(4): an error (invalid ActiveSlot)", not pcall(p.GetActiveMaxCharge, p, 4))
  local f = on(M.MC_PLAYER_GET_ACTIVE_MAX_CHARGE, function(_, item, pl, var, cur) if same(pl, p) then return 2 end end, C.COLLECTIBLE_YUM_HEART)
  T("GetActiveMaxCharge goes through the game's function: MC_PLAYER_GET_ACTIVE_MAX_CHARGE answering 2 is what it says",
    p:GetActiveMaxCharge(ActiveSlot.SLOT_PRIMARY) == 2, p:GetActiveMaxCharge(ActiveSlot.SLOT_PRIMARY))
  off(M.MC_PLAYER_GET_ACTIVE_MAX_CHARGE, f)
  T("GetActiveMinUsableCharge(primary): Yum Heart needs all 4", p:GetActiveMinUsableCharge(ActiveSlot.SLOT_PRIMARY) == 4, p:GetActiveMinUsableCharge(0))
  p:RemoveCollectible(C.COLLECTIBLE_YUM_HEART)
  local LARYNX = C.COLLECTIBLE_LARYNX
  local want = config:GetCollectible(LARYNX).MaxCharges
  p:AddCollectible(LARYNX, 0, false, ActiveSlot.SLOT_PRIMARY)
  T("Larynx: GetActiveMaxCharge is its MaxCharges and GetActiveMinUsableCharge is 1 (the game's own rule for it)",
    want > 1 and p:GetActiveMaxCharge(0) == want and p:GetActiveMinUsableCharge(0) == 1, want .. " " .. p:GetActiveMaxCharge(0) .. " " .. p:GetActiveMinUsableCharge(0))
  p:RemoveCollectible(LARYNX)
else
  skipped("GetActiveMaxCharge")
end

-- RoomTransition
if type(RoomTransition) == "table" then
  T("RoomTransition: not in a transition, mode 0 and no boss intro", RoomTransition.GetTransitionMode() == 0 and RoomTransition.IsRenderingBossIntro() == false,
    RoomTransition.GetTransitionMode())
  local level = game:GetLevel()
  local start = level:GetCurrentRoomIndex()
  -- the game does not update while a room transition plays, so what it shows is sampled where FF reads it,
  -- in a render callback
  local modes, intro, shown, during = {}, 0, 0, 0
  local fb = on(M.MC_POST_BOSS_INTRO_SHOW, function() shown = shown + 1 end)
  local fr = on(M.MC_POST_RENDER, function()
    modes[RoomTransition.GetTransitionMode()] = true
    if RoomTransition.IsRenderingBossIntro() then intro = intro + 1 end
    if shown > 0 then during = during + 1 end
  end)
  local boss = level:QueryRoomTypeIndex(RoomType.ROOM_BOSS, false, RNG())
  game:StartRoomTransition(boss, Direction.UP, RoomTransitionAnim.WALK)
  wait(30)
  for _ = 1, 600 do if RoomTransition.GetTransitionMode() == 0 then break end wait(1) end
  local list = {}
  for k in pairs(modes) do list[#list + 1] = k end
  table.sort(list)
  T("RoomTransition.GetTransitionMode(): not 0 while the game changes rooms", #list >= 2, table.concat(list, ","))
  T("RoomTransition.IsRenderingBossIntro(): true while the boss's versus screen shows (POST_BOSS_INTRO_SHOW fired), and only then",
    shown >= 1 and intro >= 10 and intro <= during and not RoomTransition.IsRenderingBossIntro(), shown .. " " .. intro .. "/" .. during .. " modes " .. table.concat(list, ","))
  local oks, s = pcall(RoomTransition.GetVersusScreenSprite)
  if not oks then s = nil end
  T("RoomTransition.GetVersusScreenSprite(): the versus screen's sprite (versusscreen.anm2) after a boss intro",
    s ~= nil and tostring(s:GetFilename()):lower():find("versusscreen") ~= nil, s and s:GetFilename())
  off(M.MC_POST_BOSS_INTRO_SHOW, fb) off(M.MC_POST_RENDER, fr)
  for _, e in ipairs(Isaac.GetRoomEntities()) do if e:IsActiveEnemy(false) then e:Remove() end end
  wait(5)
  game:StartRoomTransition(start, Direction.DOWN, RoomTransitionAnim.FADE)
  wait(60)
  p = P()
else
  skipped("RoomTransition")
end

-- EntityLaser:SetInitSound(SOUND_NULL): the laser's start sound is not played
if EntityLaser and EntityLaser.ShootAngle then
  local function playing()
    local set = {}
    for id = 1, 900 do if sfx:IsPlaying(id) then set[#set + 1] = id end end
    return set
  end
  local function laser(silent)
    for _, id in ipairs(playing()) do sfx:Stop(id) end
    wait(2)
    local f
    if silent then f = on(M.MC_POST_LASER_INIT, function(_, l) l:SetInitSound(SoundEffect.SOUND_NULL) end) end
    local l = EntityLaser.ShootAngle(LaserVariant.THICK_RED, centre() + Vector(0, -60), 90, 8, Vector(0, 0), p)
    wait(2)
    local got = playing()
    if f then off(M.MC_POST_LASER_INIT, f) end
    wait(12)
    if l and l:Exists() then l:Remove() end
    return got
  end
  local loud = laser(false)
  local quiet = laser(true)
  T("EntityLaser:SetInitSound(SOUND_NULL) at MC_POST_LASER_INIT: a brimstone laser starts with no sound (it does without)",
    #loud >= 1 and #quiet == 0, table.concat(loud, ",") .. " / " .. table.concat(quiet, ","))
end

-- MC_POST_TRIGGER_COLLECTIBLE_ADDED (player, item, firstTime, wispOrInnate), param = item
do
  local got, order, other = {}, {}, 0
  local f = on(M.MC_POST_TRIGGER_COLLECTIBLE_ADDED, function(_, pl, item, first, wisp) got[#got + 1] = { pl, item, first, wisp } order[#order + 1] = "trigger" end, C.COLLECTIBLE_SAD_ONION)
  local g = on(M.MC_POST_TRIGGER_COLLECTIBLE_ADDED, function() other = other + 1 end, C.COLLECTIBLE_INNER_EYE)
  local h = on(M.MC_POST_ADD_COLLECTIBLE, function() order[#order + 1] = "post" end, C.COLLECTIBLE_SAD_ONION)
  p:AddCollectible(C.COLLECTIBLE_SAD_ONION, 0, true)
  local a = got[1] or {}
  T("POST_TRIGGER_COLLECTIBLE_ADDED: AddCollectible fires it once with (player, item, true, false)",
    #got == 1 and same(a[1], p) and a[2] == C.COLLECTIBLE_SAD_ONION and a[3] == true and a[4] == false, #got .. " " .. tostring(a[3]) .. " " .. tostring(a[4]))
  T("POST_TRIGGER_COLLECTIBLE_ADDED runs before POST_ADD_COLLECTIBLE", table.concat(order, ",") == "trigger,post", table.concat(order, ","))
  p:AddCollectible(C.COLLECTIBLE_SAD_ONION, 0, false)
  T("POST_TRIGGER_COLLECTIBLE_ADDED: firstTime false is passed on", #got == 2 and got[2][3] == false, #got)
  T("POST_TRIGGER_COLLECTIBLE_ADDED: the parameter selects (the Inner Eye function did not run)", other == 0, other)
  if p.AddInnateCollectible then
    p:AddInnateCollectible(C.COLLECTIBLE_SAD_ONION, 1, "rgon test 3")
    local b = got[3] or {}
    T("POST_TRIGGER_COLLECTIBLE_ADDED: an innate item fires it with (player, item, false, true)",
      #got == 3 and same(b[1], p) and b[2] == C.COLLECTIBLE_SAD_ONION and b[3] == false and b[4] == true, #got .. " " .. tostring(b[4]))
    p:RemoveInnateCollectible(C.COLLECTIBLE_SAD_ONION, 1, "rgon test 3")
  end
  off(M.MC_POST_TRIGGER_COLLECTIBLE_ADDED, f) off(M.MC_POST_TRIGGER_COLLECTIBLE_ADDED, g) off(M.MC_POST_ADD_COLLECTIBLE, h)
  p:RemoveCollectible(C.COLLECTIBLE_SAD_ONION) p:RemoveCollectible(C.COLLECTIBLE_SAD_ONION)
end

-- MC_PRE/POST_ITEM_OVERLAY_SHOW (overlayID, delay, player), param = overlayID
do
  local pre, post, mode = {}, {}, nil
  local f1 = on(M.MC_PRE_ITEM_OVERLAY_SHOW, function(_, id, delay, pl)
    pre[#pre + 1] = { id, delay, pl }
    if mode == "cancel" then return true elseif mode == "swap" then return Giantbook and Giantbook.SLEEP or 6 end
  end)
  local f2 = on(M.MC_POST_ITEM_OVERLAY_SHOW, function(_, id, delay, pl) post[#post + 1] = { id, delay, pl } end)
  -- The Empress shows overlay 3 (delay 3, no player) when the player has not the effect it gives (UseCard,
  -- 0x007b2c52..0x007b2c75: HasCollectibleEffect(0x7a) on the player's effects, else ItemOverlay::Show(3, 3, 0)),
  -- so the effect is taken away before each use
  local function use()
    p:GetEffects():RemoveCollectibleEffect(C.COLLECTIBLE_WHORE_OF_BABYLON, -1)
    p:UseCard(Card.CARD_EMPRESS, 0)
  end
  use()
  wait(2)
  local a, b = pre[1] or {}, post[1] or {}
  T("PRE/POST_ITEM_OVERLAY_SHOW: the Empress's overlay fires both, once, with (3, 3, nil)",
    #pre == 1 and #post == 1 and a[1] == 3 and a[2] == 3 and a[3] == nil and b[1] == 3 and b[2] == 3, #pre .. " " .. #post .. " id " .. tostring(a[1]) .. " " .. tostring(a[2]))
  wait(60)
  mode = "cancel"
  use()
  wait(2)
  T("PRE_ITEM_OVERLAY_SHOW -> true: not shown (no POST)", #pre == 2 and #post == 1, #pre .. " " .. #post)
  wait(30)
  mode = "swap"
  use()
  wait(2)
  local want = Giantbook and Giantbook.SLEEP or 6
  T("PRE_ITEM_OVERLAY_SHOW -> an id: that overlay is shown (POST has it)", #pre == 3 and #post == 2 and post[2][1] == want, #post .. " " .. tostring(post[2] and post[2][1]))
  mode = nil
  off(M.MC_PRE_ITEM_OVERLAY_SHOW, f1) off(M.MC_POST_ITEM_OVERLAY_SHOW, f2)
  p:GetEffects():RemoveCollectibleEffect(C.COLLECTIBLE_WHORE_OF_BABYLON, -1)
  wait(90)
  p = P()
end

-- MC_PRE_GRID_ENTITY_SPAWN (type, variant, varData, gridIndex, seed, desc), param = type
do
  local room = game:GetRoom()
  local seen, answer = {}, nil
  local f = on(M.MC_PRE_GRID_ENTITY_SPAWN, function(_, t, v, vd, idx, seed, desc) seen[#seen + 1] = { t, v, vd, idx, seed, desc } return answer end, GridEntityType.GRID_ROCK)
  local idx = room:GetGridIndex(centre() + Vector(80, 80))
  local function clear_at(i) if room:GetGridEntity(i) then room:RemoveGridEntity(i, 0, false) room:Update() end wait(2) end
  clear_at(idx)
  answer = false
  local ok = room:SpawnGridEntity(idx, GridEntityType.GRID_ROCK, 0, 1234, 0)
  local a = seen[1] or {}
  T("PRE_GRID_ENTITY_SPAWN: (type, variant, varData, index, seed, nil) for Room:SpawnGridEntity",
    #seen == 1 and a[1] == GridEntityType.GRID_ROCK and a[2] == 0 and a[3] == 0 and a[4] == idx and a[5] == 1234 and a[6] == nil, #seen .. " " .. tostring(a[4]) .. " " .. tostring(a[5]))
  T("PRE_GRID_ENTITY_SPAWN -> false: not spawned, SpawnGridEntity answers false", ok == false and room:GetGridEntity(idx) == nil, tostring(ok))
  answer = { GridEntityType.GRID_POOP, 0, 0, 1234 }
  ok = room:SpawnGridEntity(idx, GridEntityType.GRID_ROCK, 0, 1234, 0)
  local g = room:GetGridEntity(idx)
  T("PRE_GRID_ENTITY_SPAWN -> {POOP, 0, 0, seed}: a poop is spawned instead of the rock", ok == true and g ~= nil and g:GetType() == GridEntityType.GRID_POOP,
    tostring(ok) .. " " .. tostring(g and g:GetType()))
  answer = nil
  off(M.MC_PRE_GRID_ENTITY_SPAWN, f)
  clear_at(idx)
end

-- MC_EVALUATE_MULTI_SHOT_PARAMS (player, params, weaponType), param = player type -> a MultiShotParams
do
  local W = WeaponType.WEAPON_TEARS
  local base = p:GetMultiShotParams(W):GetNumTears()
  local seen
  local f = on(M.MC_EVALUATE_MULTI_SHOT_PARAMS, function(_, pl, params, w)
    seen = { pl, params:GetNumTears(), w }
    params:SetNumTears(params:GetNumTears() + 2)
  end)
  local n = p:GetMultiShotParams(W):GetNumTears()
  T("EVALUATE_MULTI_SHOT_PARAMS: (player, the game's params, weapon type), and a change to them is what the game answers",
    seen ~= nil and same(seen[1], p) and seen[2] == base and seen[3] == W and n == base + 2, base .. " -> " .. n)
  local f2 = on(M.MC_EVALUATE_MULTI_SHOT_PARAMS, function(_, pl, params, w)
    local fresh = pl:GetMultiShotParams(w)
    fresh:SetNumTears(7)
    return fresh
  end)
  n = p:GetMultiShotParams(W):GetNumTears()
  T("EVALUATE_MULTI_SHOT_PARAMS: a MultiShotParams answered replaces them (GetMultiShotParams inside the callback is not re-entered)",
    n == 7, n)
  off(M.MC_EVALUATE_MULTI_SHOT_PARAMS, f) off(M.MC_EVALUATE_MULTI_SHOT_PARAMS, f2)
  n = p:GetMultiShotParams(W):GetNumTears()
  T("without them the game's own count again", n == base, n)
end

-- MultiShotParams' own methods, and GetMultiShotPositionVelocity taking one
do
  local W = WeaponType.WEAPON_TEARS
  local ms = p:GetMultiShotParams(W)
  ms:SetSpreadAngle(WeaponType.WEAPON_BONE, 30)
  T("MultiShotParams: the bone's spread angle is the knife's times 3 (REPENTOGON's rule), set and read back",
    math.abs(ms:GetSpreadAngle(WeaponType.WEAPON_BONE) - 30) < 0.01 and math.abs(ms:GetSpreadAngle(WeaponType.WEAPON_KNIFE) - 10) < 0.01,
    ms:GetSpreadAngle(WeaponType.WEAPON_BONE) .. " " .. ms:GetSpreadAngle(WeaponType.WEAPON_KNIFE))
  T("MultiShotParams: one eye and no random tears for a plain Isaac", ms:GetNumEyesActive() == 1 and ms:GetNumRandomDirTears() == 0 and not ms:IsCrossEyed(),
    ms:GetNumEyesActive() .. " " .. ms:GetNumRandomDirTears())
  ms:SetNumTears(3) ms:SetNumLanesPerEye(3) ms:SetSpreadAngle(W, 30)
  local oka, a = pcall(p.GetMultiShotPositionVelocity, p, 0, W, Vector(1, 0), 10, ms)
  local okb, b = pcall(p.GetMultiShotPositionVelocity, p, 2, W, Vector(1, 0), 10, ms)
  local why = (not oka and tostring(a)) or (not okb and tostring(b)) or ""
  if not oka or a == nil or a.Velocity == nil then a = nil end
  if not okb or b == nil or b.Velocity == nil then b = nil end
  T("GetMultiShotPositionVelocity takes the layer's MultiShotParams: three lanes 30 degrees apart fan out",
    a ~= nil and b ~= nil and math.abs(a.Velocity.Y - b.Velocity.Y) > 1, tostring(a and a.Velocity.Y) .. " " .. tostring(b and b.Velocity.Y) .. " " .. why)
end

-- MC_POST_TEAR_DEATH (tear), param = variant: a tear that falls dies; one removed by a script does not
do
  local died = {}
  local f = on(M.MC_POST_TEAR_DEATH, function(_, t) died[#died + 1] = { GetPtrHash(t), t.Variant } end)
  local g = on(M.MC_POST_TEAR_DEATH, function() died.blue = (died.blue or 0) + 1 end, TearVariant.BLOOD)
  local function tear(vel)
    local t = Isaac.Spawn(EntityType.ENTITY_TEAR, TearVariant.BLUE, 0, centre(), vel, p):ToTear()
    t.FallingAcceleration = 1.5
    return t
  end
  local t1 = tear(Vector(0, 0))
  wait(1)
  t1:Remove()
  wait(3)
  T("POST_TEAR_DEATH: not for a tear a script removes", #died == 0, #died)
  local t2 = tear(Vector(2, 0))
  local h2 = GetPtrHash(t2)
  for _ = 1, 120 do if not t2:Exists() then break end wait(1) end
  wait(2)
  T("POST_TEAR_DEATH: once for a tear that falls, with that tear (variant BLUE)", #died == 1 and died[1][1] == h2 and died[1][2] == TearVariant.BLUE,
    #died .. " " .. tostring(died[1] and died[1][2]))
  local t3 = tear(Vector(25, 0))
  t3.FallingAcceleration, t3.FallingSpeed = -0.1, 0
  local h3 = GetPtrHash(t3)
  for _ = 1, 120 do if not t3:Exists() then break end wait(1) end
  wait(2)
  T("POST_TEAR_DEATH: once for a tear that hits the wall, with that tear", #died == 2 and died[2][1] == h3, #died)
  T("POST_TEAR_DEATH: the parameter selects (the BLOOD function did not run)", died.blue == nil, died.blue)
  off(M.MC_POST_TEAR_DEATH, f) off(M.MC_POST_TEAR_DEATH, g)
end

-- MC_POST_PROJECTILE_DEATH (projectile), param = variant
do
  local died = {}
  local f = on(M.MC_POST_PROJECTILE_DEATH, function(_, pr) died[#died + 1] = { GetPtrHash(pr), pr.Variant } end, ProjectileVariant.PROJECTILE_NORMAL)
  local function proj()
    local pr = Isaac.Spawn(EntityType.ENTITY_PROJECTILE, ProjectileVariant.PROJECTILE_NORMAL, 0, centre() + Vector(-120, -60), Vector(1, 0), nil):ToProjectile()
    pr.FallingAccel = 1.5
    return pr
  end
  local p1 = proj()
  wait(1)
  p1:Remove()
  wait(3)
  T("POST_PROJECTILE_DEATH: not for a projectile a script removes", #died == 0, #died)
  local p2 = proj()
  local h = GetPtrHash(p2)
  for _ = 1, 120 do if not p2:Exists() then break end wait(1) end
  wait(2)
  T("POST_PROJECTILE_DEATH: once for a projectile that falls, with it", #died == 1 and died[1][1] == h, #died)
  off(M.MC_POST_PROJECTILE_DEATH, f)
end

-- MC_POST_ROOM_RENDER_ENTITIES (): once per frame drawn, inside the room's render (before MC_POST_RENDER)
do
  local n, post, order = 0, 0, {}
  local f = on(M.MC_POST_ROOM_RENDER_ENTITIES, function() n = n + 1 if #order < 6 then order[#order + 1] = "e" end end)
  local g = on(M.MC_POST_RENDER, function() post = post + 1 if #order < 6 then order[#order + 1] = "r" end end)
  wait(10)
  off(M.MC_POST_ROOM_RENDER_ENTITIES, f) off(M.MC_POST_RENDER, g)
  local o = table.concat(order)
  T("POST_ROOM_RENDER_ENTITIES: as often as MC_POST_RENDER, and before it", n >= 8 and math.abs(n - post) <= 1 and (o:sub(1, 2) == "er" or o:sub(1, 2) == "re") and not o:find("ee"),
    n .. " " .. post .. " " .. o)
  -- after the entities: the player's own render callback comes first in each frame
  local seq = {}
  local h1 = on(M.MC_POST_PLAYER_RENDER, function() if #seq < 12 then seq[#seq + 1] = "p" end end)
  local h2 = on(M.MC_POST_ROOM_RENDER_ENTITIES, function() if #seq < 12 then seq[#seq + 1] = "e" end end)
  wait(8)
  off(M.MC_POST_PLAYER_RENDER, h1) off(M.MC_POST_ROOM_RENDER_ENTITIES, h2)
  local q = table.concat(seq):gsub("^e", "")
  T("POST_ROOM_RENDER_ENTITIES: after the entities are drawn (each frame's player render comes before it)", #q >= 6 and q:find("ee") == nil and q:find("pp") == nil and q:sub(1, 1) == "p", q)
end

-- MC_PRE_PLAYERHUD_TRINKET_RENDER (slot, position, scale, player, cropOffset), param = slot
do
  local got = {}
  local f = on(M.MC_PRE_PLAYERHUD_TRINKET_RENDER, function(_, slot, pos, scale, pl, crop) got[#got + 1] = { slot, pos, scale, pl, crop } end)
  wait(4)
  local before = #got
  p:AddTrinket(TrinketType.TRINKET_SWALLOWED_PENNY, false)
  wait(6)
  local a = got[#got] or {}
  T("PRE_PLAYERHUD_TRINKET_RENDER: not without a trinket; every frame with one, (0, a Vector, a scale, player, a Vector)",
    before == 0 and #got >= 4 and a[1] == 0 and type(a[2]) == "userdata" and type(a[3]) == "number" and same(a[4], p) and type(a[5]) == "userdata",
    before .. " " .. #got .. " " .. tostring(a[1]) .. " " .. tostring(a[3]))
  off(M.MC_PRE_PLAYERHUD_TRINKET_RENDER, f)
  p:TryRemoveTrinket(TrinketType.TRINKET_SWALLOWED_PENNY)
end

-- MC_GET_SHOP_ITEM_PRICE (variant, subtype, shopItemID, price), param = variant -> the price
do
  local level = game:GetLevel()
  local start = level:GetCurrentRoomIndex()
  Isaac.ExecuteCommand("goto s.shop.0")
  wait(40)
  local function priced()
    for _, e in ipairs(Isaac.FindByType(EntityType.ENTITY_PICKUP)) do
      local pk = e:ToPickup()
      if pk and pk.Price > 0 then return pk end
    end
  end
  local pk = priced()
  local p0 = pk and pk.Price
  local seen, answer = {}, 30
  local f = on(M.MC_GET_SHOP_ITEM_PRICE, function(_, v, s, id, price) seen[#seen + 1] = { v, s, id, price } return answer end)
  wait(4)
  local high = pk and pk.Price
  answer = 1
  wait(4)
  local low = pk and pk.Price
  local mine
  for _, e in ipairs(seen) do if pk and e[1] == pk.Variant and e[2] == pk.SubType and e[3] == pk.ShopItemId then mine = e end end
  -- the game hands what the function answers to 0x00816250, which applies the player's discounts, so the
  -- check is that the answer moves the price, not that it is the price
  T("GET_SHOP_ITEM_PRICE: (variant, subtype, shopItemId, price) for a shop item, and the price follows its answer (30 -> more than 1 -> 1 or less)",
    pk ~= nil and mine ~= nil and type(mine[4]) == "number" and high > low and low <= 1,
    tostring(p0) .. " " .. tostring(high) .. " " .. tostring(low) .. " " .. #seen)
  off(M.MC_GET_SHOP_ITEM_PRICE, f)
  wait(4)
  T("without it the shop item's own price again", pk ~= nil and pk.Price == p0, tostring(pk and pk.Price) .. " " .. tostring(p0))
  game:StartRoomTransition(start, Direction.NO_DIRECTION, RoomTransitionAnim.FADE)
  wait(60)
  p = P()
end

-- MC_PRE_GRID_ENTITY_SPAWN from a descriptor: Room:TurnGold (0x00820ac0, the Lua registration's) respawns each poop
-- that is not golden from a copy of its GridEntityDesc with variant 3 (0x00820b7e..0x00820baa). SpawnGridEntityDesc
-- refuses an index whose grid path is above 900 (0x007ebd90), which a poop's is, so the path is cleared first.
do
  local room = game:GetRoom()
  local idx = room:GetGridIndex(centre() + Vector(-80, 80))
  local function fresh_poop()
    if room:GetGridEntity(idx) then room:RemoveGridEntity(idx, 0, false) room:Update() wait(2) end
    room:SpawnGridEntity(idx, GridEntityType.GRID_POOP, 0, 4321, 0)
    wait(2)
    room:SetGridPath(idx, 0)
  end
  fresh_poop()
  room:TurnGold()
  wait(2)
  local g = room:GetGridEntity(idx)
  T("Room:TurnGold makes the poop golden (variant 3)", g ~= nil and g:GetVariant() == 3, tostring(g and g:GetVariant()))
  fresh_poop()
  local seen = {}
  local f = on(M.MC_PRE_GRID_ENTITY_SPAWN, function(_, t, v, vd, i, seed, desc)
    if i == idx then seen[#seen + 1] = { t, v, desc, desc and desc.Type, desc and desc.Variant } return false end
  end)
  room:TurnGold()
  wait(2)
  off(M.MC_PRE_GRID_ENTITY_SPAWN, f)
  g = room:GetGridEntity(idx)
  local a = seen[1] or {}
  T("PRE_GRID_ENTITY_SPAWN from a GridEntityDesc: (POOP, 3, ..., index, seed, the desc) for Room:TurnGold, and false keeps the poop as it was",
    #seen == 1 and a[1] == GridEntityType.GRID_POOP and a[2] == 3 and a[3] ~= nil and a[4] == a[1] and a[5] == 3 and g ~= nil and g:GetVariant() == 0,
    #seen .. " " .. tostring(a[1]) .. "/" .. tostring(a[2]) .. " desc " .. tostring(a[4]) .. "/" .. tostring(a[5]) .. " -> " .. tostring(g and g:GetVariant()))
  if room:GetGridEntity(idx) then room:RemoveGridEntity(idx, 0, false) room:Update() end
  wait(2)
end

say("RGON END " .. checks .. " " .. failed)
