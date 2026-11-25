-- mother.lua -- Mother's fight the way a player has it, for drive_stress.mjs phases=custom:
-- Corpse II (the console's `stage 8c`), the level's own boss room, and Mother left to
-- attack -- her knife in phase 1, the spin in phase 2 -- while the player moves and
-- shoots and is kept alive. Her health is taken down in steps, so both phases come,
-- and what she is doing is said every second (her animation), so a stop is placed on
-- the attack that caused it.
--
--   node scripts/recomp/web/drive_stress.mjs <url>/play.html <out> phases=custom \
--        lua=scripts/recomp/web/mother.lua retries=1 maxsec=900
--
--   set=phase1:<frames>   how long she fights at full health (default 1800)
--   set=phase2:<frames>   how long she fights in her second phase (default 1800)
--   set=rounds:<n>        how many times the whole fight is fought (default 1)
--   set=items:<id>+<id>+...  collectibles given first (a late run's build: the player's
--                         own weapons are in the fight)
--   set=own:1             no health taken by the walk: the player's weapons do it all
--   set=stage:<s>         the floor (default 8c, Corpse II); set=boss:<type> the boss to
--                         watch (default 912, Mother; 412 is Delirium on stage 12, The Void)
--   set=floors:<n>        first, n floors of a run, each one's boss killed (a long run's heap)
local function num(v, d) v = tonumber(v) return v or d end
local PHASE1, PHASE2, ROUNDS = num(CFG.phase1, 1800), num(CFG.phase2, 1800), num(CFG.rounds, 1)
local ITEMS = CFG.items == nil and {} or (type(CFG.items) == "table" and CFG.items or { CFG.items })
local OWN = tostring(CFG.own) == "1"
local MOTHER = num(CFG.boss, 912)
local STAGE = CFG.stage and tostring(CFG.stage) or "8c"
local FLOORS = num(CFG.floors, 0)
local function lvl() return game:GetLevel() end
local function boss_index()
  local rooms = lvl():GetRooms()
  for i = 0, rooms.Size - 1 do
    local d = rooms:Get(i)
    if d and d.Data and d.Data.Type == RoomType.ROOM_BOSS then return d.SafeGridIndex end
  end
end
local function mothers()
  local out = {}
  for _, e in ipairs(Isaac.GetRoomEntities()) do
    if e.Type == MOTHER then out[#out + 1] = e end
  end
  return out
end
local function doing()
  local parts = {}
  for _, e in ipairs(mothers()) do
    local s = e:GetSprite()
    parts[#parts + 1] = string.format("%d.%d hp %.0f/%.0f state %d anim %s frame %d", e.Type, e.Variant, e.HitPoints, e.MaxHitPoints,
      e:ToNPC() and e:ToNPC().State or -1, s:GetAnimation(), s:GetFrame())
  end
  return #parts > 0 and table.concat(parts, "; ") or "no Mother"
end
local last = ""
local function fight(frames, label)
  local seen = false
  for f = 1, frames do
    if #mothers() > 0 then seen = true end
    if f % 30 == 0 then
      local now = doing()
      local key = now:gsub("frame %d+", "")
      if key ~= last or f % 600 == 0 then say("MOTHER " .. label .. " f" .. f .. ": " .. now) last = key end
      heal()
    end
    -- the player keeps moving and shooting, as a player does
    if f % 50 == 0 then press(f % 100 == 0 and ButtonAction.ACTION_LEFT or ButtonAction.ACTION_RIGHT, 25) end
    if f % 40 == 0 then press(ButtonAction.ACTION_SHOOTUP, 15) end
    if f % 160 == 0 then press(ButtonAction.ACTION_DOWN, 15) end
    wait(1)
    if seen and #mothers() == 0 then say("MOTHER " .. label .. ": she is gone at f" .. f) return false end
  end
  return true
end
local function bite(fraction)
  for _, e in ipairs(mothers()) do
    if e.MaxHitPoints > 0 then e.HitPoints = math.max(1, e.HitPoints - e.MaxHitPoints * fraction) end
  end
end

-- a long run first: floors, each boss room entered and its boss killed
-- (no 6, 6c or 8: killing Mom or Mom's Heart plays an ending, and the walk waits for no video)
local RUN = { "1", "1a", "2", "2a", "3", "3a", "4", "4a", "5", "5a", "7", "7a", "1c", "2c", "3c", "4c", "5c", "7c" }
for i = 1, FLOORS do
  local st = RUN[(i - 1) % #RUN + 1]
  Isaac.ExecuteCommand("stage " .. st) wait(90)
  local bi = boss_index()
  if bi then game:StartRoomTransition(bi, Direction.NO_DIRECTION, RoomTransitionAnim.WALK) wait(150) end
  for f = 1, 600 do
    if f % 20 == 0 then
      for _, x in ipairs(Isaac.GetRoomEntities()) do
        if x:IsActiveEnemy(false) and x.MaxHitPoints > 0 then x:TakeDamage(x.MaxHitPoints * 0.3 + 5, 0, EntityRef(P()), 0) end
      end
      heal()
    end
    if f > 90 and game:GetRoom():IsClear() then break end
    wait(1)
  end
  say("MOTHER floor " .. i .. " (" .. st .. ") done, frame " .. game:GetFrameCount())
end
for round = 1, ROUNDS do
  say("MOTHER round " .. round .. ": stage " .. STAGE)
  Isaac.ExecuteCommand("stage " .. STAGE) wait(150)
  P():AddCollectible(CollectibleType.COLLECTIBLE_SAD_ONION, 0, false)
  for _, id in ipairs(ITEMS) do
    id = tonumber(id)
    if id then P():AddCollectible(id, 0, false) end
  end
  if #ITEMS > 0 then say("MOTHER items given: " .. table.concat(ITEMS, " ")) wait(30) end
  local bi = boss_index()
  say("MOTHER boss room " .. tostring(bi) .. ", stage " .. lvl():GetStage() .. "." .. lvl():GetStageType())
  if bi then game:StartRoomTransition(bi, Direction.NO_DIRECTION, RoomTransitionAnim.WALK) end
  wait(240)
  local d = lvl():GetCurrentRoomDesc()
  say("MOTHER in room " .. lvl():GetCurrentRoomIndex() .. " type " .. game:GetRoom():GetType() .. " variant "
    .. tostring(d and d.Data and d.Data.Variant) .. ": " .. doing())
  -- the intro: she rises; the fight begins when she has
  -- she rises some seconds in (a player walking in sees the same); the player walks up meanwhile
  for f = 1, 900 do
    if #mothers() > 0 then break end
    if f == 30 then P().Position = centre() P().Velocity = Vector(0, 0) end
    if f % 60 == 0 then press(f % 120 == 0 and ButtonAction.ACTION_LEFT or ButtonAction.ACTION_RIGHT, 20) press(ButtonAction.ACTION_SHOOTUP, 15) end
    if f % 120 == 0 then say("MOTHER waiting for her: f" .. f .. " " .. doing()) end
    wait(1)
  end
  if #mothers() == 0 then
    -- she has not risen: she is brought in where she rises, so the fight is fought all the same
    say("MOTHER she did not rise in 900 frames: spawned")
    Isaac.Spawn(MOTHER, 0, 0, centre() + Vector(0, -120), Vector(0, 0), nil)
  end
  wait(200)
  say("MOTHER phase 1 begins: " .. doing())
  if OWN then
    -- the player's weapons alone: both phases come as they come
    fight(PHASE1 + PHASE2, "own")
  elseif fight(PHASE1, "phase1") then
    -- down to the second phase: her health in steps, as damage takes it
    for _ = 1, 12 do
      bite(0.08) wait(45)
      local m = mothers()[1]
      if not m or m.Variant ~= 0 then break end
    end
    say("MOTHER after the bites: " .. doing())
    fight(PHASE2, "phase2")
    for _ = 1, 30 do bite(0.2) wait(30) if #mothers() == 0 then break end end
  end
  say("MOTHER round " .. round .. " over: " .. doing())
  wait(120)
end
