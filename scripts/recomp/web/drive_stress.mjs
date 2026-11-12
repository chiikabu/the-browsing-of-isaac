// drive_stress.mjs -- everything a player or a mod can make the game do, one
// thing at a time, until something stops the module:
//
//   node scripts/recomp/web/drive_stress.mjs <url> <out-dir> phases=qcards,cards,...
//        [catalogue=DIR] [mods=id,id] [zips=a.zip,b.zip] [maxsec=900] [gap=12]
//        [from=<n>] [to=<n>] [gl=hw] [retries=40]
//
// Players reported `TRAP in main @ 0x00931050: Program terminated with exit(1)`
// right after "Action PillCard Triggered", and mods that stop the game. Booting
// a mod and walking in the first room (drive_modpack.mjs) reaches none of that:
// the code behind a card, a pill, an active item, an entity or a floor only
// runs when that thing is used. So this installs a small mod of its own (after
// the mods under test) that walks a list -- every card, every pill, every
// collectible, every entity, every floor, every character -- through the Lua
// API and through the game's own input actions (MC_INPUT_ACTION answers "the
// button is down", so the real use path runs, not only Player:UseCard).
//
// The mod says what it is about to do (Isaac.DebugString "STRESS OP ...") before
// it does it, so the engine's own log names the operation that stopped it. The
// driver then starts again past that operation and carries on, and the result
// is a census: every operation that stops the module, each with the lines that
// led up to it.
//
// Phases:
//   qcards   AddCard(id), then the PILLCARD action        (the reported path)
//   qpills   AddPill(color), then the PILLCARD action
//   cards    Player:UseCard(id)
//   pills    Player:UsePill(effect, color)
//   actives  Player:UseActiveItem(id) for every active collectible
//   qactives AddCollectible(active), then the ITEM action
//   passives Player:AddCollectible(id) for every other collectible, firing
//   trinkets Player:AddTrinket(id), then the DROP action
//   entities Isaac.Spawn(type, variant) over EntityType, then Kill
//   stages   the console's `stage N[a-d]`
//   players  the console's `restart <type>`
//   rooms    the console's `goto s.<type>.0`
//   misc     bombs, damage, pickups, grid entities, console commands
import { chromium } from 'playwright';
import { mkdirSync, readFileSync, writeFileSync, appendFileSync } from 'node:fs';
import { join } from 'node:path';
import { zipStore } from './zip.mjs';
import { requiredChain } from './mods.mjs';

const [URL, OUT, ...rest] = process.argv.slice(2);
if (!URL || !OUT) {
  console.log('usage: node drive_stress.mjs <url> <out-dir> phases=a,b [catalogue=DIR] [mods=id,id] [zips=a.zip] [maxsec=900] [gap=12]');
  process.exit(2);
}
const opt = Object.fromEntries(rest.map((a) => [a.slice(0, a.indexOf('=')), a.slice(a.indexOf('=') + 1)]));
const PHASES = (opt.phases || 'qcards').split(',').filter(Boolean);
const MODS = (opt.mods || '').split(',').filter(Boolean);
const ZIPS = (opt.zips || '').split(',').filter(Boolean);
const MAX_MS = Number(opt.maxsec || 900) * 1000;
const GAP = Number(opt.gap || 12);
const RETRIES = Number(opt.retries || 40);
const FROM = Number(opt.from || 0), TO = Number(opt.to || 1e9);
const TAG = opt.tag || PHASES.join('+');
mkdirSync(OUT, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const cat = opt.catalogue ? JSON.parse(readFileSync(join(opt.catalogue, 'catalogue.json'), 'utf8')) : null;
const allMods = cat ? (cat.mods || cat) : [];
const zipOf = (m) => Buffer.concat(Array.from({ length: m.parts || 1 }, (_, i) => readFileSync(join(opt.catalogue, 'm', `${m.id}.${i}.bin`))));

// ---- the mod. Lua 5.3, the game's own API only.
const LUA = String.raw`
local M = RegisterMod("zz port stress", 1)
local CFG = __CFG__
local game = Game()
local function say(s) Isaac.DebugString("STRESS " .. s) end
local function P() return Isaac.GetPlayer(0) end
local force = {}          -- ButtonAction -> frames left to answer "triggered"
local function press(action, frames) force[action] = frames or 2 end

M:AddCallback(ModCallbacks.MC_INPUT_ACTION, function(_, ent, hook, action)
  local n = force[action]
  if n and n > 0 and ent and ent:ToPlayer() then
    if hook == InputHook.IS_ACTION_TRIGGERED then force[action] = n - 1 return true end
    if hook == InputHook.IS_ACTION_PRESSED then return true end
    if hook == InputHook.GET_ACTION_VALUE then return 1.0 end
  end
end)

local function wait(n) for _ = 1, n do coroutine.yield() end end
local function clear_room()
  for _, e in ipairs(Isaac.GetRoomEntities()) do
    if e.Type ~= EntityType.ENTITY_PLAYER then e:Remove() end
  end
end
local function heal()
  local p = P()
  if p:IsDead() then p:Revive() end
  p:AddMaxHearts(2, true) p:AddHearts(24) p:AddSoulHearts(4)
  p:SetMinDamageCooldown(120)
end
local function centre() return game:GetRoom():GetCenterPos() end
local function is_active(id)
  local c = Isaac.GetItemConfig():GetCollectible(id)
  return c ~= nil and c.Type == ItemType.ITEM_ACTIVE, c ~= nil
end
local function drop_cards()
  local p = P()
  for s = 0, 3 do p:SetCard(s, 0) p:SetPill(s, 0) end
end

local PH = {}
PH.qcards = { n = function() return Card.NUM_CARDS - 1 end, op = function(i)
  drop_cards() P():AddCard(i) wait(3) press(ButtonAction.ACTION_PILLCARD) wait(CFG.gap) end }
PH.qpills = { n = function() return 2 * (PillColor.NUM_PILLS - 1) + 1 end, op = function(i)
  local color = i < PillColor.NUM_PILLS and i or ((i - PillColor.NUM_PILLS + 1) | 2048)
  if i == 2 * (PillColor.NUM_PILLS - 1) + 1 then color = 14 end
  drop_cards() P():AddPill(color) wait(3) press(ButtonAction.ACTION_PILLCARD) wait(CFG.gap) end }
PH.cards = { n = function() return Card.NUM_CARDS - 1 end, op = function(i)
  P():UseCard(i, 0) wait(CFG.gap) end }
PH.pills = { n = function() return PillEffect.NUM_PILL_EFFECTS end, op = function(i)
  P():UsePill(i - 1, 1 + (i % 13), 0) wait(CFG.gap) end }
PH.actives = { n = function() return CollectibleType.NUM_COLLECTIBLES - 1 end, op = function(i)
  local a, known = is_active(i)
  if not a then return "skip" end
  P():UseActiveItem(i, 0, 0) wait(CFG.gap) end }
PH.qactives = { n = function() return CollectibleType.NUM_COLLECTIBLES - 1 end, op = function(i)
  local a = is_active(i)
  if not a then return "skip" end
  local p = P()
  p:AddCollectible(i, 12, false, 0) p:FullCharge(0, true) wait(3)
  press(ButtonAction.ACTION_ITEM) wait(CFG.gap)
  p:RemoveCollectible(i) end }
PH.passives = { n = function() return CollectibleType.NUM_COLLECTIBLES - 1 end, op = function(i)
  local a, known = is_active(i)
  if a or not known then return "skip" end
  P():AddCollectible(i, 0, false)
  press(ButtonAction.ACTION_SHOOTRIGHT, 6) wait(CFG.gap)
  -- one at a time: every passive at once is not a run anybody plays, and the
  -- first version of this walk only measured that pile
  if not CFG.pile then P():RemoveCollectible(i) wait(2) end end }
PH.trinkets = { n = function() return TrinketType.NUM_TRINKETS - 1 end, op = function(i)
  local p = P()
  p:AddTrinket(i, false) wait(4)
  press(ButtonAction.ACTION_SHOOTLEFT, 4) wait(CFG.gap)
  p:TryRemoveTrinket(i) end }
local ENT
PH.entities = { n = function()
  if not ENT then
    ENT = {}
    local seen = {}
    for _, v in pairs(EntityType) do
      if type(v) == "number" and v >= 2 and v < 1000 and not seen[v] then seen[v] = true ENT[#ENT + 1] = v end
    end
    table.sort(ENT)
  end
  return #ENT * 4 end, op = function(i)
  local t, v = ENT[(i - 1) // 4 + 1], (i - 1) % 4
  say("ENT " .. t .. "." .. v)
  Isaac.Spawn(t, v, 0, centre() + Vector(80, 0), Vector(0, 0), nil) wait(CFG.gap)
  for _, e in ipairs(Isaac.GetRoomEntities()) do
    if e.Type ~= EntityType.ENTITY_PLAYER then e:Kill() end
  end
  wait(6) clear_room() end }
-- A fight, not a spawn: the entity lives for CFG.fight frames and loses a slice
-- of its health every half second, so a boss walks through its phases and its
-- attacks run (a reported stop was Mother's knife, which she only throws in her
-- second phase).
local function ent_list()
  if not ENT and CFG.ents then ENT = CFG.ents end
  if not ENT then
    ENT = {}
    local seen = {}
    for _, v in pairs(EntityType) do
      if type(v) == "number" and v >= 2 and v < 1000 and not seen[v] then seen[v] = true ENT[#ENT + 1] = v end
    end
    table.sort(ENT)
  end
  return ENT
end
PH.fights = { n = function() return #ent_list() * 2 end, op = function(i)
  local t, v = ent_list()[(i - 1) // 2 + 1], (i - 1) % 2
  if t < 10 or t == EntityType.ENTITY_EFFECT or t == EntityType.ENTITY_TEXT then return "skip" end
  say("FIGHT " .. t .. "." .. v)
  local e = Isaac.Spawn(t, v, 0, centre() + Vector(0, -40), Vector(0, 0), nil)
  if not e or not e:IsEnemy() then wait(4) clear_room() return "skip" end
  for f = 1, CFG.fight do
    if f % 30 == 0 then
      local alive = false
      for _, x in ipairs(Isaac.GetRoomEntities()) do
        if x:IsActiveEnemy(false) and x.MaxHitPoints > 0 then
          alive = true
          x.HitPoints = math.max(1, x.HitPoints - x.MaxHitPoints * CFG.bite)
        end
      end
      if not alive and f > 120 then break end
      heal()
    end
    if f % 45 == 0 then press(ButtonAction.ACTION_SHOOTUP, 10) end
    wait(1)
  end
  for _, x in ipairs(Isaac.GetRoomEntities()) do if x.Type ~= EntityType.ENTITY_PLAYER then x:Kill() end end
  wait(20) clear_room() end }

local STAGES
PH.stages = { n = function()
  if not STAGES then
    STAGES = {}
    -- the floors that exist: 1-8 with the two older alternates and the two Repentance
    -- paths (no Mortis: 7d and 8d are not in the game), then the endings
    for s = 1, 8 do for _, t in ipairs({ "", "a", "b", "c", "d" }) do
      if not (t == "d" and s >= 7) then STAGES[#STAGES + 1] = s .. t end
    end end
    for _, x in ipairs({ "9", "10", "10a", "11", "11a", "12", "13" }) do STAGES[#STAGES + 1] = x end
  end
  return #STAGES end, op = function(i)
  say("STAGE " .. STAGES[i])
  Isaac.ExecuteCommand("stage " .. STAGES[i]) wait(CFG.gap * 4) end }
PH.players = { n = function() return PlayerType.NUM_PLAYER_TYPES end, op = function(i)
  Isaac.ExecuteCommand("restart " .. (i - 1)) wait(CFG.gap * 4)
  press(ButtonAction.ACTION_SHOOTDOWN, 8) press(ButtonAction.ACTION_BOMB) wait(CFG.gap) end }
local ROOMS = { "default", "shop", "error", "treasure", "boss", "miniboss", "secret", "supersecret", "arcade",
  "curse", "challenge", "library", "sacrifice", "devil", "angel", "itemdungeon", "bossrush", "isaacs",
  "barren", "chest", "dice", "blackmarket", "greedexit", "planetarium", "teleporter", "teleporterexit",
  "secretexit", "blue", "ultrasecret" }
PH.rooms = { n = function() return #ROOMS * 3 end, op = function(i)
  local r = ROOMS[(i - 1) // 3 + 1] .. "." .. ((i - 1) % 3)
  say("ROOM " .. r)
  Isaac.ExecuteCommand("goto s." .. r) wait(CFG.gap * 3) end }
local MISC = {
  function() P():AddBombs(5) press(ButtonAction.ACTION_BOMB) end,
  function() P():TakeDamage(1, 0, EntityRef(P()), 0) end,
  function() for v = 10, 110, 10 do Isaac.Spawn(EntityType.ENTITY_PICKUP, v, 0, centre(), Vector(1, 0), nil) end end,
  function() for v = 20, 100, 10 do Isaac.Spawn(EntityType.ENTITY_PICKUP, v, 1, P().Position, Vector(0, 0), nil) end end,
  function() for g = 1, 27 do Isaac.GridSpawn(g, 0, centre() + Vector(40 * (g % 7) - 120, 40 * (g // 7) - 80), true) end end,
  function() game:GetRoom():MamaMegaExplosion(centre()) end,
  function() Isaac.ExecuteCommand("debug 4") Isaac.ExecuteCommand("debug 4") end,
  function() Isaac.ExecuteCommand("giveitem c1") Isaac.ExecuteCommand("giveitem t1") Isaac.ExecuteCommand("giveitem k1") Isaac.ExecuteCommand("giveitem p1") end,
  function() Isaac.ExecuteCommand("spawn 13") Isaac.ExecuteCommand("spawn 5.100.1") end,
  function() Isaac.ExecuteCommand("costumetest 3") end,
  function() Isaac.ExecuteCommand("curse 255") end,
  function() Isaac.ExecuteCommand("gridspawn 1000") end,
  function() Isaac.ExecuteCommand("shake 10") game:ShakeScreen(10) game:Darken(1, 30) end,
  function() game:Fart(centre(), 80, P(), 1, 0) game:ButterBeanFart(centre(), 80, P(), true, false) game:BombExplosionEffects(centre(), 10, 0, Color(1,1,1,1), P(), 1, true, false) end,
  function() game:GetHUD():ShowItemText("stress", "test") game:GetHUD():ShowFortuneText("a", "b", "c") game:ShowFortune() game:ShowRule() end,
  function() P():AddCoins(99) P():AddKeys(99) P():AddGoldenKey() P():AddGoldenBomb() P():AddGigaBombs(1) P():AddBlueFlies(5, P().Position, nil) P():AddBlueSpider(P().Position) end,
  function() P():AddBlackHearts(2) P():AddBoneHearts(1) P():AddEternalHearts(2) P():AddGoldenHearts(1) P():AddRottenHearts(2) P():AddBrokenHearts(1) end,
  function() P():AnimateHappy() P():AnimateSad() P():AnimateTeleport(true) P():AnimateCard(1, "UseItem") P():AnimatePill(1, "UseItem") P():AnimateCollectible(1, "UseItem", "PlayerPickup") end,
  function() P():UseActiveItem(CollectibleType.COLLECTIBLE_D6, 0, 0) P():AddCollectible(CollectibleType.COLLECTIBLE_BRIMSTONE) press(ButtonAction.ACTION_SHOOTUP, 40) end,
  function() P():AddCollectible(CollectibleType.COLLECTIBLE_MOMS_KNIFE) press(ButtonAction.ACTION_SHOOTUP, 20) end,
  function() P():AddCollectible(CollectibleType.COLLECTIBLE_DR_FETUS) press(ButtonAction.ACTION_SHOOTUP, 20) end,
  function() P():AddCollectible(CollectibleType.COLLECTIBLE_TECH_X) press(ButtonAction.ACTION_SHOOTUP, 20) end,
  function() P():AddCollectible(CollectibleType.COLLECTIBLE_EPIC_FETUS) press(ButtonAction.ACTION_SHOOTUP, 20) end,
  function() press(ButtonAction.ACTION_MAP, 30) press(ButtonAction.ACTION_DROP, 130) end,
  function() press(ButtonAction.ACTION_PAUSE) wait(20) press(ButtonAction.ACTION_PAUSE) end,
  function() local it = game:GetItemPool() for p = 0, 30 do it:GetCollectible(p, true, 1) it:GetCard(1, true, true, true) it:GetPill(1) it:GetTrinket() end end,
  function() local l = game:GetLevel() l:ShowMap() l:ApplyBlueMapEffect() l:ApplyCompassEffect(true) l:ApplyMapEffect() l:RemoveCurses(255) l:AddCurse(1, true) l:UpdateVisibility() end,
  function() local s = SFXManager() for i = 1, 60 do s:Play(i, 0.1, 0, false, 1) end local m = MusicManager() m:Play(1, 0.1) m:Crossfade(2, 0.1) m:Queue(3) m:UpdateVolume() end,
  function() local s = Sprite() s:Load("gfx/001.000_player.anm2", true) s:Play("WalkDown", true) s:Update() s:Render(Vector(100, 100), Vector(0, 0), Vector(0, 0)) local f = Font() f:Load("font/terminus.fnt") f:DrawString("stress", 60, 50, KColor(1, 1, 1, 1), 0, true) end,
  function() Isaac.SaveModData(M, "stress") say("data " .. tostring(Isaac.LoadModData(M)) .. " " .. tostring(Isaac.HasModData(M))) Isaac.RemoveModData(M) end,
  function() game:GetSeeds():AddSeedEffect(1) game:GetSeeds():ClearSeedEffects() say("seed " .. game:GetSeeds():GetStartSeedString()) end,
  function() Isaac.ExecuteCommand("rewind") end,
  function() Isaac.ExecuteCommand("reseed") end,
  function() game:StartRoomTransition(game:GetLevel():GetStartingRoomIndex(), Direction.NO_DIRECTION, 3) end,
  function() game:GetLevel():SetStage(1, 0) game:StartStageTransition(false, 0, P()) end,
  function() game:SetStateFlag(1, true) game:GetLevel():SetStateFlag(1, true) game:AddPixelation(20) game:SpawnParticles(centre(), 5, 20, 3) game:MakeShockwave(centre(), 0.02, 0.02, 20) end,
  function() error("stress: a Lua error out of a callback") end,
  function() pcall(function() P():AddCollectible("not a number") end) pcall(function() Isaac.Spawn(nil) end) pcall(function() game:GetRoom():GetGridEntity(99999):Destroy() end) end,
  function() Isaac.ExecuteCommand("lua error('stress: a Lua error out of the console')") end,
  function() Isaac.ExecuteCommand("luamod zz port stress") end,
}
PH.misc = { n = function() return #MISC end, op = function(i) MISC[i]() wait(CFG.gap * 2) end }

-- Every callback the game has, raising a Lua error (luaerrs) or answering with
-- a value of the wrong kind (badrets) the next time it runs. The engine catches
-- a callback's error in C++ (72 dispatchers, each with its own catch), so each
-- callback is its own path through the port's exception handling.
local CB, armed, CBNAME = {}, {}, {}
-- the game's own callbacks only: with a REPENTOGON layer installed ModCallbacks
-- also holds ids from 1000 up, which are that layer's to test (scripts/recomp/rgon)
for k, v in pairs(ModCallbacks) do if type(v) == "number" and v < 1000 then CB[#CB + 1] = v CBNAME[v] = k end end
table.sort(CB)
local BAD = { "a string", 12345.5, true, {}, function() end, false }
for _, id in ipairs(CB) do
  if id ~= ModCallbacks.MC_POST_UPDATE and id ~= ModCallbacks.MC_INPUT_ACTION then
    M:AddCallback(id, function()
      local a = armed[id]
      if a then
        armed[id] = nil
        say("FIRE " .. CBNAME[id] .. " " .. tostring(a))
        if a == "error" then error("stress: error in " .. CBNAME[id]) end
        return BAD[a]
      end
    end)
  end
end
local function provoke()
  local p = P()
  Isaac.Spawn(EntityType.ENTITY_ATTACKFLY, 0, 0, centre() + Vector(60, 0), Vector(0, 0), nil)
  Isaac.Spawn(EntityType.ENTITY_PICKUP, 0, 0, centre() + Vector(0, 60), Vector(0, 0), nil)
  Isaac.Spawn(EntityType.ENTITY_PICKUP, PickupVariant.PICKUP_COLLECTIBLE, 0, centre() + Vector(-80, 0), Vector(0, 0), nil)
  Isaac.Spawn(EntityType.ENTITY_SLOT, 1, 0, centre() + Vector(-80, 80), Vector(0, 0), nil)
  wait(2)
  p:UseCard(Card.CARD_HIEROPHANT, 0) p:UsePill(PillEffect.PILLEFFECT_BAD_GAS, 1, 0)
  p:UseActiveItem(CollectibleType.COLLECTIBLE_YUM_HEART, 0, 0)
  p:AddCollectible(CollectibleType.COLLECTIBLE_SAD_ONION, 0, false) p:AddTrinket(TrinketType.TRINKET_SWALLOWED_PENNY, false)
  p:AddCard(Card.CARD_FOOL) p:AddPill(1) p:AddBombs(3) p:AddCacheFlags(CacheFlag.CACHE_ALL) p:EvaluateItems()
  p:AddCollectible(CollectibleType.COLLECTIBLE_BROTHER_BOBBY, 0, false) p:AddCollectible(CollectibleType.COLLECTIBLE_BRIMSTONE, 0, false)
  press(ButtonAction.ACTION_SHOOTRIGHT, 30) press(ButtonAction.ACTION_BOMB) wait(6)
  press(ButtonAction.ACTION_PILLCARD) wait(4)
  p:TakeDamage(1, 0, EntityRef(p), 0)
  game:GetItemPool():GetCollectible(0, true, 1) game:GetItemPool():GetCard(1, true, true, true) game:GetItemPool():GetPill(1) game:GetItemPool():GetTrinket()
  game:GetItemPool():GetPillEffect(1, p)
  wait(10)
  for _, e in ipairs(Isaac.GetRoomEntities()) do if e:IsEnemy() then e:Kill() end end
  wait(6)
  Isaac.GridSpawn(GridEntityType.GRID_POOP, 0, centre() + Vector(120, 0), true)
  p:UseActiveItem(CollectibleType.COLLECTIBLE_D20, 0, 0) p:UseActiveItem(CollectibleType.COLLECTIBLE_BOX_OF_FRIENDS, 0, 0)
  wait(4)
  game:StartRoomTransition(game:GetLevel():GetStartingRoomIndex(), Direction.NO_DIRECTION, 3) wait(24)
  Isaac.ExecuteCommand("stage 2") wait(40)
  Isaac.ExecuteCommand("goto s.boss.0") wait(40)
  for _, e in ipairs(Isaac.GetRoomEntities()) do if e:IsEnemy() then e:Kill() end end
  wait(40)
  Isaac.ExecuteCommand("stage 1") wait(40)
  pcall(clear_room)
end
-- The callbacks the first pass does not reach: tears, lasers, knives, enemy
-- shots, collisions, damage, a devolve, a room's clear award, a console command
-- and a new run. Only run while the armed callback has still not fired.
local function provoke2()
  local p = P()
  local function shoot(item)
    if item then p:AddCollectible(item, 0, false) end
    press(ButtonAction.ACTION_SHOOTLEFT, 24) wait(40)
    if item then p:RemoveCollectible(item) end
  end
  p:RemoveCollectible(CollectibleType.COLLECTIBLE_BRIMSTONE)
  shoot(nil) shoot(CollectibleType.COLLECTIBLE_TECHNOLOGY) shoot(CollectibleType.COLLECTIBLE_MOMS_KNIFE)
  Isaac.Spawn(EntityType.ENTITY_HORF, 0, 0, p.Position + Vector(120, 0), Vector(0, 0), nil)
  local g = Isaac.Spawn(EntityType.ENTITY_GAPER, 0, 0, p.Position + Vector(30, 0), Vector(0, 0), nil)
  Isaac.Spawn(EntityType.ENTITY_GAPER, 0, 0, p.Position + Vector(36, 0), Vector(0, 0), nil)
  wait(2)
  g:TakeDamage(1, 0, EntityRef(p), 0)
  p:ResetDamageCooldown() p:TakeDamage(1, 0, EntityRef(g), 0)
  wait(90)
  p:UseActiveItem(CollectibleType.COLLECTIBLE_D10, 0, 0) wait(10)
  for _, e in ipairs(Isaac.GetRoomEntities()) do if e:IsEnemy() then e:Kill() end end
  wait(10)
  Isaac.ExecuteCommand("goto d.10") wait(50)
  for _, e in ipairs(Isaac.GetRoomEntities()) do if e:IsEnemy() then e:Kill() end end
  wait(70)
  Isaac.ExecuteCommand("stresscmd 1 2") wait(4)
  Isaac.ExecuteCommand("restart") wait(80)
  pcall(clear_room)
end
PH.luaerrs = { n = function() return #CB end, op = function(i)
  local id = CB[i]
  if id == ModCallbacks.MC_POST_UPDATE or id == ModCallbacks.MC_INPUT_ACTION then return "skip" end
  if CFG.cb and CBNAME[id] ~= CFG.cb then return "skip" end
  say("ARM " .. CBNAME[id] .. " error")
  armed[id] = "error" provoke()
  if armed[id] then provoke2() end
  if armed[id] then say("UNFIRED " .. CBNAME[id]) end
  armed[id] = nil end }
PH.badrets = { n = function() return #CB * #BAD end, op = function(i)
  local id, b = CB[(i - 1) // #BAD + 1], (i - 1) % #BAD + 1
  if id == ModCallbacks.MC_POST_UPDATE or id == ModCallbacks.MC_INPUT_ACTION then return "skip" end
  say("ARM " .. CBNAME[id] .. " " .. type(BAD[b]))
  armed[id] = b provoke()
  if armed[id] then provoke2() end
  armed[id] = nil end }

-- A short run for one mod under test: a bit of everything a player does in a
-- few floors, so the mod's own callbacks (and whatever they call) get to run.
local TOUR = {
  function() provoke() end,
  function()
    local p = P()
    for _, c in ipairs({ 1, 2, 5, 10, 16, 20, 32, 42, 55, 78 }) do drop_cards() p:AddCard(c) wait(3) press(ButtonAction.ACTION_PILLCARD) wait(CFG.gap) end
    for c = 1, 5 do drop_cards() p:AddPill(c) wait(3) press(ButtonAction.ACTION_PILLCARD) wait(CFG.gap) end
    for _, a in ipairs({ 105, 34, 36, 38, 40, 58, 93, 133, 283, 478 }) do
      p:AddCollectible(a, 12, false, 0) p:FullCharge(0, true) wait(3) press(ButtonAction.ACTION_ITEM) wait(CFG.gap) p:RemoveCollectible(a)
    end
    for _, t in ipairs({ 1, 10, 33, 80, 120 }) do p:AddTrinket(t, false) wait(4) p:TryRemoveTrinket(t) end
  end,
  function()
    local p = P()
    Isaac.Spawn(EntityType.ENTITY_MONSTRO, 0, 0, centre() + Vector(0, -60), Vector(0, 0), nil)
    for f = 1, 300 do
      if f % 30 == 0 then
        for _, x in ipairs(Isaac.GetRoomEntities()) do
          if x:IsActiveEnemy(false) and x.MaxHitPoints > 0 then x.HitPoints = math.max(1, x.HitPoints - x.MaxHitPoints * 0.12) end
        end
        heal() press(ButtonAction.ACTION_SHOOTUP, 12)
      end
      if f == 150 then p:AddBombs(2) press(ButtonAction.ACTION_BOMB) end
      wait(1)
    end
    for _, x in ipairs(Isaac.GetRoomEntities()) do if x:IsEnemy() then x:Kill() end end
    wait(40)
    for v = 10, 100, 10 do Isaac.Spawn(EntityType.ENTITY_PICKUP, v, 0, p.Position + Vector(30, 0), Vector(0, 0), nil) end
    wait(30) pcall(clear_room)
  end,
  function()
    for _, r in ipairs({ "treasure.0", "shop.0", "secret.0", "devil.0", "angel.0", "curse.0", "arcade.0", "boss.1" }) do
      Isaac.ExecuteCommand("goto s." .. r) wait(CFG.gap * 3)
      for _, x in ipairs(Isaac.GetRoomEntities()) do if x:IsEnemy() then x:Kill() end end
      wait(CFG.gap)
    end
  end,
  function() for _, st in ipairs({ "2", "3a", "5c", "8", "10", "11a" }) do Isaac.ExecuteCommand("stage " .. st) wait(CFG.gap * 4) end end,
  function() Isaac.ExecuteCommand("restart 2") wait(CFG.gap * 5) provoke() end,
  function() P():TakeDamage(1, 0, EntityRef(P()), 0) press(ButtonAction.ACTION_MAP, 20) press(ButtonAction.ACTION_DROP, 20) wait(30)
    press(ButtonAction.ACTION_PAUSE) wait(30) press(ButtonAction.ACTION_PAUSE) wait(30) end,
}
PH.tour = { n = function() return #TOUR end, op = function(i) TOUR[i]() wait(CFG.gap) end }

-- lua=<file>: one operation written for the occasion (a reported fight, a room).
-- The game's Lua has no load(), so the file is pasted in here as a function body,
-- with the walk's helpers in scope: wait, press, P, say, centre, heal, clear_room, game.
PH.custom = { n = function() return 1 end, op = function()
--CUSTOM--
end }

local co = coroutine.create(function()
  wait(30)
  Isaac.ExecuteCommand("debug 3")
  for _, name in ipairs(CFG.phases) do
    local ph = PH[name]
    local n = ph.n()
    say("BEGIN " .. name .. " " .. n)
    for i = math.max(1, CFG.from[name] or 1), math.min(n, CFG.to) do
      if not CFG.skip[name .. ":" .. i] then
        say("OP " .. name .. " " .. i)
        local ok, err = pcall(ph.op, i)
        if not ok then say("LUAERR " .. name .. " " .. i .. " " .. tostring(err)) wait(2) end
        if err ~= "skip" then
          local okh, errh = pcall(heal)
          if not okh then say("HEALERR " .. tostring(errh)) end
        end
      end
    end
    say("DONE " .. name)
    pcall(clear_room)
  end
  say("ALLDONE")
end)
M:AddCallback(ModCallbacks.MC_POST_UPDATE, function()
  if coroutine.status(co) == "suspended" then
    local ok, err = coroutine.resume(co)
    if not ok then say("FATAL " .. tostring(err)) end
  end
end)
say("LOADED")
`;
const METADATA = `<?xml version="1.0" encoding="UTF-8"?>
<metadata>
  <name>zz port stress</name>
  <directory>zz port stress</directory>
  <description>The port's own stress walk.</description>
  <version>1</version>
</metadata>
`;
const luaTable = (o) => {
  if (Array.isArray(o)) return '{' + o.map(luaTable).join(',') + '}';
  if (o && typeof o === 'object') return '{' + Object.entries(o).map(([k, v]) => `[${JSON.stringify(k)}]=${luaTable(v)}`).join(',') + '}';
  return o === undefined ? 'nil' : JSON.stringify(o);
};
// shader=1: the walk's mod carries a shader of its own (a pass-through), so the
// game compiles a mod's GLSL and asks MC_GET_SHADER_PARAMS every frame.
const SHADERS = `<shaders>
  <shader name="PortStress">
    <parameters>
      <param name="Amount" type="float"/>
    </parameters>
    <vertex><![CDATA[
      attribute vec3 Position;
      attribute vec4 Color;
      attribute vec2 TexCoord;
      attribute vec4 RenderData;
      attribute float Scale;
      attribute float Amount;
      varying vec4 Color0;
      varying vec2 TexCoord0;
      varying vec4 RenderDataOut;
      varying float ScaleOut;
      varying float AmountOut;
      uniform mat4 Transform;
      void main(void)
      {
        RenderDataOut = RenderData;
        ScaleOut = Scale;
        Color0 = Color;
        TexCoord0 = TexCoord;
        AmountOut = Amount;
        gl_Position = Transform * vec4(Position.xyz, 1.0);
      }
    ]]></vertex>
    <fragment><![CDATA[
      varying lowp vec4 Color0;
      varying mediump vec2 TexCoord0;
      varying lowp vec4 RenderDataOut;
      varying lowp float ScaleOut;
      varying lowp float AmountOut;
      uniform sampler2D Texture0;
      void main(void)
      {
        vec4 Color = Color0 * texture2D(Texture0, TexCoord0);
        Color.r = Color.r + AmountOut * 0.0;
        gl_FragColor = Color;
      }
    ]]></fragment>
  </shader>
</shaders>
`;
async function stressZip(cfg) {
  const enc = new TextEncoder();
  const blob = zipStore([
    ...(opt.shader === '1' ? [{ name: 'zz port stress/content/shaders.xml', bytes: enc.encode(SHADERS) }] : []),
    { name: 'zz port stress/metadata.xml', bytes: enc.encode(METADATA) },
    { name: 'zz port stress/main.lua', bytes: enc.encode(LUA.replace('__CFG__', () => luaTable({ ...cfg, lua: undefined })).replace('--CUSTOM--', () => cfg.lua || '')) },
  ]);
  return Buffer.from(await blob.arrayBuffer());
}

const glArgs = (opt.gl || 'hw') === 'hw' ? ['--use-angle=default', '--ignore-gpu-blocklist'] : ['--use-gl=angle', '--use-angle=swiftshader'];
const browser = await chromium.launch({
  headless: true,
  args: [...glArgs, '--autoplay-policy=no-user-gesture-required', '--disable-gpu-vsync', '--mute-audio'],
});

const STOP = /\[isaac\]\[TRAP\]|\[isaac\]\[c\+\+\] (?:throw of \S+ from \S+: no catch|_CxxThrowException|the catch at)|\[isaac\]\[crt\] (?:_?exit\(|abort\(|std::terminate|ASSERTION|_invalid_parameter)|\[isaac\]\[k32\] (?:UnhandledExceptionFilter|TerminateProcess)|\[isaac\] =+ STOPPING|\[isaac\] reason:|^\s*TRAP in |RESULT: aborted|Aborted\(|RuntimeError|lazy (?:read|pread) FAILED|\[heap\] double free|\[heap\] OUT OF MEMORY/;

// ---- one boot: install, start a run, follow the mod until it finishes or the module stops
async function attempt(cfg, n) {
  const context = await browser.newContext({ viewport: { width: 960, height: 540 } });
  const page = await context.newPage();
  const con = [];
  const conFile = join(OUT, `${TAG}.${n}.console.log`), gameFile = join(OUT, `${TAG}.${n}.game.log`);
  writeFileSync(conFile, ''); writeFileSync(gameFile, '');
  const t0 = Date.now();
  const stamp = () => ((Date.now() - t0) / 1000).toFixed(1).padStart(7);
  let booted = false;
  await context.addInitScript(() => {
    let hooks;
    Object.defineProperty(window, 'isaacPageHooks', {
      configurable: true,
      get() { return hooks; },
      set(h) {
        hooks = h;
        if (!h || h.__stress) return;
        const own = h.onLog;
        h.onLog = (line) => { if (/STRESS|TRAP|STOPPING|reason:|\[isaac\]\[(crt|c\+\+|k32|heap|lua)\]/.test(line)) console.log('G| ' + line); if (own) own(line); };
        h.__stress = true;
      },
    });
  });
  const out = { ops: 0, last: null, phase: null, done: [], alldone: false, stop: null, why: null, luaerrs: [], modErrors: [], excerpt: [] };
  let lastOp = Date.now(), started = false;
  // The walk is followed on the console, not by reading window.isaacLog back: a
  // page stuck inside wasm still delivers the lines it printed before it stuck,
  // and the operation that hung it is the last of them.
  page.on('console', (m) => {
    const t = m.text(); con.push(t);
    if (booted || /^\[mods\]/.test(t)) appendFileSync(conFile, `${stamp()} ${t}\n`);
    const s = /^G\| .*STRESS (\w+)(?: (\w+))?(?: (\d+))?/.exec(t);
    if (!s) return;
    lastOp = Date.now();                                   // anything the walk says is the walk moving
    if (s[1] === 'OP') { out.ops += 1; out.last = `${s[2]}:${s[3]}`; out.phase = s[2]; lastOp = Date.now(); }
    else if (s[1] === 'BEGIN') { out.phase = s[2]; lastOp = Date.now(); }
    else if (s[1] === 'DONE') { out.done.push(s[2]); lastOp = Date.now(); }
    else if (s[1] === 'ALLDONE') out.alldone = true;
    else if (s[1] === 'LUAERR' || s[1] === 'FATAL' || s[1] === 'HEALERR') out.luaerrs.push(t.replace(/^.*STRESS /, '').slice(0, 300));
    else if (s[1] === 'LOADED') started = false;
  });
  page.on('pageerror', (e) => { con.push('PAGEERROR ' + e); appendFileSync(conFile, `${stamp()} PAGEERROR ${e}\n`); });
  try {
    const base = URL.split('?')[0];
    await page.goto(base + (base.includes('?') ? '&' : '?') + 'autoplay=0&persist=1', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#mods-file', { state: 'attached', timeout: 120000 });
    const importOne = async (name, buffer) => {
      const before = con.filter((l) => /^\[mods\] .*: \d+ file\(s\)$/.test(l)).length;
      await page.setInputFiles('#mods-file', { name, mimeType: 'application/zip', buffer });
      const deadline = Date.now() + 240000;
      for (;;) {
        if (con.filter((l) => /^\[mods\] .*: \d+ file\(s\)$/.test(l)).length > before) return;
        const bad = con.find((l) => /^\[mods\] import failed:/.test(l));
        if (bad) throw new Error(`${name}: ${bad}`);
        if (Date.now() > deadline) throw new Error(`${name} never finished importing`);
        await sleep(250);
      }
    };
    const order = [];
    for (const id of MODS) {
      const chain = requiredChain(allMods, id);
      if (chain.missing.length) throw new Error(`${id} requires ${chain.missing.join(', ')}, not in the catalogue`);
      for (const e of chain.order) if (!order.includes(e)) order.push(e);
    }
    for (const m of order) await importOne(`${m.id}.zip`, zipOf(m));
    for (const z of ZIPS) await importOne(z.split(/[\\/]/).pop(), readFileSync(z));
    await importOne('zz-port-stress.zip', await stressZip(cfg));
    booted = true;
    await page.goto(URL, { waitUntil: 'domcontentloaded' });

    let seen = 0, lastAnswer = Date.now(), enters = 0, lastFrame = 0, lastFrameT = Date.now();
    lastOp = Date.now();
    const deadline = Date.now() + MAX_MS;
    const tail = [];
    while (Date.now() < deadline) {
      const got = await Promise.race([
        page.evaluate((from) => { const l = window.isaacLog || []; return { lines: l.slice(from).map(String), n: l.length, f: window.isaacFrame || 0, done: window.isaacDone || null }; }, seen),
        sleep(5000).then(() => null),
      ]).catch(() => null);
      if (!got) {
        // a boot with a large mod scans thousands of files inside one call into wasm:
        // the page is silent for that long without being stuck, so the walk has to have started
        if (Date.now() - lastAnswer > (out.ops > 0 ? 40000 : 180000)) { out.stop = 'hang'; out.why = 'the page stopped answering'; break; }
        continue;
      }
      lastAnswer = Date.now();
      if (got.lines.length) {
        appendFileSync(gameFile, got.lines.map((l) => `${stamp()} ${l}`).join('\n') + '\n');
        for (const l of got.lines) {
          tail.push(l); if (tail.length > 400) tail.shift();
          // a Lua error out of a mod under test (not the walk's own, which it raises on purpose)
          if (/\[odsa\].*(?:Error in "[^"]*" call|\.lua:\d+: |failed:|\[REPENTOGON\] not implemented)/.test(l) && !/zz[- ]port[- ]stress|STRESS/.test(l)) {
            const e = l.replace(/^.*?\] - /, '').slice(0, 240);
            if (out.modErrors.length < 4000 && !out.modErrors.includes(e)) out.modErrors.push(e);
          }
          if (/Room 1\.2\(Start Room\)|Starting room transition/.test(l)) started = true;
        }
      }
      seen = got.n;
      if (got.f !== lastFrame) { lastFrame = got.f; lastFrameT = Date.now(); }
      const stopLine = tail.find((l) => STOP.test(l)) || con.find((l) => /TRAP in |RuntimeError|Aborted\(/.test(l));
      if (got.done || stopLine) {
        await sleep(1500);
        const restLines = await page.evaluate((from) => (window.isaacLog || []).slice(from).map(String), seen).catch(() => []);
        if (restLines.length) appendFileSync(gameFile, restLines.map((l) => `${stamp()} ${l}`).join('\n') + '\n');
        for (const l of restLines) tail.push(l);
        out.stop = 'trap';
        out.why = (tail.find((l) => /\[isaac\]\[TRAP\]|\[isaac\] reason:|OUT OF MEMORY|double free/.test(l)) || stopLine
          || (got.done && (got.done.error || `main returned ${got.done.mainRc}`)) || 'the module ended').trim().slice(0, 400);
        break;
      }
      if (out.alldone) break;
      // heap=<s>: the guest heap's report every <s> seconds, into the console log
      if (opt.heap && out.ops > 0 && Date.now() - (out.heapT || 0) > Number(opt.heap) * 1000) {
        out.heapT = Date.now();
        appendFileSync(conFile, `${stamp()} HEAP at ${out.last}\n`);
        await page.evaluate(() => window.isaacHeapReport && window.isaacHeapReport()).catch(() => {});
      }
      if (!started && got.f > 0 && enters < 150 && out.ops === 0) {
        await page.keyboard.down('Enter'); await sleep(120); await page.keyboard.up('Enter'); enters += 1; lastOp = Date.now();
        await sleep(1200);
        continue;
      }
      if (got.f > 0 && Date.now() - lastFrameT > 45000) { out.stop = 'freeze'; out.why = `no frame for 45 s at frame ${got.f}`; break; }
      if (out.ops > 0 && Date.now() - lastOp > 75000 + cfg.fight * 40) { out.stop = 'stall'; out.why = 'the walk stopped moving while the game kept running'; break; }
      if (out.ops === 0 && Date.now() - t0 > 480000) { out.stop = 'nostart'; out.why = 'the walk never started'; break; }
      await sleep(400);
    }
    if (!out.stop && !out.alldone) { out.stop = 'timeout'; out.why = `not finished after ${MAX_MS / 1000} s`; }
    if (out.stop) {
      const i = tail.findIndex((l) => STOP.test(l));
      const cut = i < 0 ? tail.slice(-40) : tail.slice(Math.max(0, i - 25), i + 30);
      out.excerpt = cut.filter((l) => l.trim() && !/^\[isaac\]\[(dispatch|fastpath|audio|audio-web|threads|input|web-gl|profile|stub|mod)\]|^\s+\d+ x sub_/.test(l)).map((l) => l.slice(0, 300));
      await page.screenshot({ path: join(OUT, `${TAG}.${n}.png`) }).catch(() => {});
    }
  } catch (e) {
    out.stop = 'driver'; out.why = String(e && e.message || e).slice(0, 300);
  }
  await context.close().catch(() => {});
  return out;
}

const census = { url: URL, mods: MODS, zips: ZIPS, phases: PHASES, gap: GAP, stops: [], luaerrs: [], modErrors: [], done: [], finished: false, attempts: 0 };
const cfg = { phases: [...PHASES], skip: {}, from: {}, to: TO, gap: GAP, pile: opt.pile === "1", fight: Number(opt.fight || 600), bite: Number(opt.bite || 0.04) };
if (opt.cb) cfg.cb = opt.cb;   // cb=MC_GET_SHADER_PARAMS: only this callback (luaerrs)
if (opt.lua) cfg.lua = readFileSync(opt.lua, 'utf8');
if (opt.ents) cfg.ents = opt.ents.split(",").map(Number);   // ents=912,407: only these entity types (fights)
if (FROM) for (const p of PHASES) cfg.from[p] = FROM;
let sameSpot = 0, lastSpot = null;
for (let n = 0; n < RETRIES; n++) {
  census.attempts = n + 1;
  const r = await attempt(cfg, n);
  for (const e of r.luaerrs) if (!census.luaerrs.includes(e)) census.luaerrs.push(e);
  for (const e of r.modErrors) if (!census.modErrors.includes(e)) census.modErrors.push(e);
  for (const d of r.done) if (!census.done.includes(d)) census.done.push(d);
  console.log(`[stress ${TAG}] attempt ${n}: ${r.ops} op(s), last ${r.last}, ${r.alldone ? 'ALL DONE' : `${r.stop}: ${r.why}`}`);
  if (r.alldone) { census.finished = true; break; }
  census.stops.push({ attempt: n, at: r.last, kind: r.stop, why: r.why, excerpt: r.excerpt });
  writeFileSync(join(OUT, `${TAG}.census.json`), JSON.stringify(census, null, 1));
  if (!r.last) { if (++sameSpot >= 2) break; continue; }
  if (r.last === lastSpot) { if (++sameSpot >= 2) break; } else sameSpot = 0;
  lastSpot = r.last;
  // carry on past the operation that stopped it
  const [ph, idx] = r.last.split(':');
  cfg.skip[r.last] = true;
  cfg.phases = cfg.phases.slice(cfg.phases.indexOf(ph));
  cfg.from = { [ph]: Number(idx) + 1 };
}
writeFileSync(join(OUT, `${TAG}.census.json`), JSON.stringify(census, null, 1));
await browser.close();
console.log(`[stress ${TAG}] ${census.finished ? 'finished' : 'NOT finished'}: ${census.stops.length} stop(s), ${census.luaerrs.length} Lua error line(s) in ${census.attempts} attempt(s)`);
for (const s of census.stops) console.log(`  ${s.kind} at ${s.at}: ${s.why}`);
process.exit(census.stops.length ? 1 : 0);
