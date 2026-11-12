-- altpath.lua -- the alternate path the way a player takes it (GitHub issue 16:
-- "Game crashes when taking alt path"): on each floor, the level's own boss
-- room, the boss killed by damage, the secret exit door the game opens, walked
-- through, a few seconds in the "Secret Exit" room, its trapdoor, and a little
-- of the floor below. A walk for drive_stress.mjs phases=custom:
--
--   node scripts/recomp/web/drive_stress.mjs <url>/play.html <out> phases=custom \
--        lua=scripts/recomp/web/altpath.lua catalogue=<catalogue-dir> mods=<the issue's 19> \
--        save=<an unlocked persistentgamedata1.dat> set=stages:new1b,reload:floor retries=1
--
-- The issue's mods make angels-drop-items raise in MC_PRE_ENTITY_SPAWN for every
-- spawn in a Secret Exit room (its room table has no ROOM_SECRET_EXIT, so its
-- roomState is nil there); the game catches each one, logs `Error in
-- "PreEntitySpawn" call` and plays on. Release 18 stopped at the first one with
-- `Program terminated with exit(1)`; the walk passes from release 20 on.
-- Without save= the profile is fresh: no Cellar or Burning Basement (new1a and
-- new1b never come) and the secret exit door is forced with TrySpawnSecretExit.
--
--   set=stages:a+b+...   the floors, each one of
--                        1b, 2a, ...  the console's `stage` (not a saved floor)
--                        new1b        `restart` until a run starts on Burning Basement I
--                                     (new1 Basement, new1a Cellar); the game saves the run
--                        down         the boss room's ordinary trapdoor from the floor the
--                                     walk is on (a saved floor, as a player gets there)
--                        a ! at the end: arrive, but no alternate path on that floor
--                        (default 1, 1a, 1b, 2, 2a, 2b)
--   set=quit:<point>     quit through the pause menu and continue at <point>
--   set=reload:<point>   reload the page without leaving the run (a stopped module,
--                        a closed tab) and continue the run the game saved; once
--   set=stay:<frames>    how long in the Secret Exit room (300); set=shoot:1 fires all the while
--   set=at:<n>           quit or reload on the n-th floor of the list only
--   points: floor (on arrival), boss (boss dead, door there), exit (in the
--   Secret Exit room), below (on the floor below)
local function list(v, d) if v == nil then return d end if type(v) == "table" then return v end return { tostring(v) } end
local STAGES = list(CFG.stages, { "1", "1a", "1b", "2", "2a", "2b" })
local DIRBTN = { [0] = ButtonAction.ACTION_LEFT, [1] = ButtonAction.ACTION_UP, [2] = ButtonAction.ACTION_RIGHT, [3] = ButtonAction.ACTION_DOWN }
local DIRVEC = { [0] = Vector(-1, 0), [1] = Vector(0, -1), [2] = Vector(1, 0), [3] = Vector(0, 1) }
local EXIT = GridRooms.ROOM_SECRET_EXIT_IDX
local function lvl() return game:GetLevel() end
local function where()
  local l = lvl()
  local d = l:GetCurrentRoomDesc()
  return string.format("stage %d.%d room %d type %d variant %d frame %d seed %d", l:GetStage(), l:GetStageType(), l:GetCurrentRoomIndex(),
    game:GetRoom():GetType(), d and d.Data and d.Data.Variant or -1, game:GetFrameCount(), game:GetSeeds():GetStartSeed())
end
local function boss_index()
  local rooms = lvl():GetRooms()
  for i = 0, rooms.Size - 1 do
    local d = rooms:Get(i)
    if d and d.Data and d.Data.Type == RoomType.ROOM_BOSS then return d.SafeGridIndex end
  end
end
local function exit_door()
  local room = game:GetRoom()
  for s = 0, DoorSlot.NUM_DOOR_SLOTS - 1 do
    local d = room:GetDoor(s)
    if d and d.TargetRoomIndex == EXIT then return d, s end
  end
end
local function in_exit() return lvl():GetCurrentRoomIndex() == EXIT end
local function walk_into(door, frames)
  local p, dir = P(), door.Direction                 -- the door object is gone once the room changes
  p.Position = door.Position - DIRVEC[dir] * 50
  p.Velocity = Vector(0, 0)
  press(DIRBTN[dir], frames)
  for _ = 1, frames + 40 do wait(1) if in_exit() then break end end
  force[DIRBTN[dir]] = 0                             -- or the walk goes on into the trapdoor
  return in_exit()
end
local function find_grid(t)
  local room = game:GetRoom()
  for i = 0, room:GetGridSize() - 1 do
    local g = room:GetGridEntity(i)
    if g and g:GetType() == t then return g end
  end
end
local function drop_through(td)
  local s0, t0 = lvl():GetStage(), lvl():GetStageType()
  local pos = td.Position                            -- the grid entity is gone once the floor changes
  local function moved() return lvl():GetStage() ~= s0 or lvl():GetStageType() ~= t0 end
  for try = 1, 3 do
    -- a trapdoor stays shut while the player stands on it from the start: step off, then on
    P().Position = pos + Vector(0, 80) P().Velocity = Vector(0, 0) wait(40)
    P().Position = pos P().Velocity = Vector(0, 0)
    for _ = 1, 200 do wait(1) if moved() then break end end
    if moved() then break end
    say("ALT the trapdoor did not take the player (try " .. try .. ")")
  end
  wait(60)
end
local function play(frames)
  for f = 1, frames do
    if f % 60 == 0 then press(ButtonAction.ACTION_SHOOTRIGHT, 20) press(f % 120 == 0 and ButtonAction.ACTION_LEFT or ButtonAction.ACTION_RIGHT, 20) heal() end
    wait(1)
  end
end

-- after a reload the walk's mod boots again: where it was is in its save data
local resume = Isaac.HasModData(M) and Isaac.LoadModData(M) or ""
if resume ~= "" then Isaac.RemoveModData(M) end
local rs, rpoint = resume:match("^resume (%d+) (%a+)$")
rs = tonumber(rs)
local reloaded = rs ~= nil
local function point(si, name)
  if CFG.at and CFG.at ~= si then return end          -- set=at:<n>: only on the n-th floor of the list
  if CFG.quit == name then
    say("ALT quit at " .. name .. ": " .. where())
    say("KEYS quit") wait(60)
    say("ALT continued after quit at " .. name .. ": " .. where())
  elseif CFG.reload == name and not reloaded then
    say("ALT reload at " .. name .. ": " .. where())
    Isaac.SaveModData(M, "resume " .. si .. " " .. name)
    wait(10)
    say("KEYS reload")
    wait(1000000)
  end
end

local function kill_boss()
  for f = 1, 900 do
    if f % 20 == 0 then
      for _, x in ipairs(Isaac.GetRoomEntities()) do
        if x:IsActiveEnemy(false) and x.MaxHitPoints > 0 then x:TakeDamage(x.MaxHitPoints * 0.25 + 5, 0, EntityRef(P()), 0) end
      end
      heal()
    end
    if f % 40 == 0 then press(ButtonAction.ACTION_SHOOTUP, 10) end
    if f > 60 and game:GetRoom():IsClear() then break end
    wait(1)
  end
  say("ALT boss room clear: " .. tostring(game:GetRoom():IsClear()))
  wait(90)
end
local function to_boss()
  local bi = boss_index()
  say("ALT boss room " .. tostring(bi))
  if not bi then return false end
  if lvl():GetCurrentRoomIndex() ~= bi then
    game:StartRoomTransition(bi, Direction.NO_DIRECTION, RoomTransitionAnim.WALK) wait(120)
  end
  say("ALT in " .. where())
  kill_boss()
  return true
end

local function boss_and_door(si)
  if in_exit() then return true end
  if not to_boss() then return false end
  local door, slot = exit_door()
  say("ALT secret exit door by the game: " .. tostring(door ~= nil))
  if not door then
    game:GetRoom():TrySpawnSecretExit(true, true) wait(60)
    door, slot = exit_door()
    say("ALT secret exit door forced: " .. tostring(door ~= nil))
  end
  if not door then return false end
  P():AddKeys(3) P():AddBombs(3) P():AddMaxHearts(4, true) P():AddHearts(8)
  point(si, "boss")
  door, slot = exit_door()
  if not door then say("ALT no door after the continue") return false end
  say(string.format("ALT door slot %d dir %d locked %s open %s state %d", slot, door.Direction, tostring(door:IsLocked()), tostring(door:IsOpen()), door.State))
  local how = "walked"
  local inside = walk_into(door, 60)
  if not inside then
    say(string.format("ALT not in yet (locked %s open %s), TryUnlock", tostring(door:IsLocked()), tostring(door:IsOpen())))
    door:TryUnlock(P(), true) wait(40)
    how = "unlocked, walked"
    inside = walk_into(door, 60)
  end
  if not inside then
    how = "transition"
    game:StartRoomTransition(EXIT, door.Direction, RoomTransitionAnim.WALK)
    for _ = 1, 120 do wait(1) if in_exit() then break end end
    inside = in_exit()
  end
  say("ALT entered (" .. how .. "): " .. tostring(inside) .. " " .. where())
  return inside
end

local function arrive(st)
  st = st:gsub("!$", "")
  local nt = st:match("^new(.*)$")
  if nt then
    local want = ({ [""] = 0, a = 1, b = 2 })[nt:sub(2)] or 0
    for i = 1, 40 do
      if lvl():GetStage() == 1 and lvl():GetStageType() == want then break end
      Isaac.ExecuteCommand("restart") wait(45)
    end
    say("ALT new run: " .. where())
  elseif st == "down" then
    if to_boss() then
      local td = find_grid(GridEntityType.GRID_TRAPDOOR)
      say("ALT ordinary trapdoor: " .. tostring(td ~= nil))
      if td then drop_through(td) end
    end
    say("ALT down to: " .. where())
  else
    Isaac.ExecuteCommand("stage " .. st) wait(90)
    say("ALT stage " .. st .. ": " .. where())
  end
end

for si, st in ipairs(STAGES) do
  if not rs or si >= rs then
    if rs and si == rs then
      say("ALT resumed after reload at " .. rpoint .. ": " .. where())
      rs = nil
    else
      arrive(st)
      point(si, "floor")
    end
    if st:sub(-1) == "!" then
      say("ALT passing " .. st .. " by: " .. where())
    elseif rpoint == "below" then
      rpoint = nil
      play(600)
      say("ALT played below after the reload: " .. where())
    elseif boss_and_door(si) then
      for f = 1, CFG.stay or 300 do
        if f % 50 == 0 then press(CFG.shoot and ({ ButtonAction.ACTION_SHOOTLEFT, ButtonAction.ACTION_SHOOTUP, ButtonAction.ACTION_SHOOTRIGHT })[f // 50 % 3 + 1] or ButtonAction.ACTION_SHOOTLEFT, CFG.shoot and 50 or 10) end
        if f % 10 == 0 then P().Velocity = Vector(0, 0) end
        if f % 900 == 0 then say("ALT staying, frame " .. f .. ": " .. where()) end
        wait(1)
      end
      say("ALT stayed: " .. where())
      point(si, "exit")
      local td = in_exit() and find_grid(GridEntityType.GRID_TRAPDOOR)
      say("ALT trapdoor: " .. tostring(td ~= nil and td ~= false))
      if td then
        drop_through(td)
        say("ALT below: " .. where())
        point(si, "below")
        play(600)
        say("ALT played below: " .. where())
      end
    end
  end
end
say("ALT END")
