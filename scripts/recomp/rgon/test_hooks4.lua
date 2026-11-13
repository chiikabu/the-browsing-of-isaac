-- test_hooks4.lua -- round 110's callbacks, fired by instruction hooks, checked from inside a running game:
--
--   node scripts/recomp/web/drive_stress.mjs "http://127.0.0.1:8345/play.html?ISAAC_RGON_ALLOW=zz-port-stress" <out> \
--        phases=custom lua=scripts/recomp/rgon/test_hooks4.lua zips=<layer.zip>
--
-- Same harness as test_hooks3.lua (say, wait, P, centre, press are the walk's helpers). Each callback's
-- answer must be what the player then has: a stat answered at one point is the value the game goes on
-- from (a wrong slot, register or address is a different number), a cancelled bomb is not placed, and
-- POST is handed the bomb that was.
local checks, failed = 0, 0
local function T(name, cond, detail)
  checks = checks + 1
  if not cond then failed = failed + 1 end
  say("RGON " .. (cond and "ok   " or "FAIL ") .. name .. (detail ~= nil and (" -- " .. tostring(detail)) or ""))
end
if type(REPENTOGON) ~= "table" then say("RGON FAIL no REPENTOGON for this mod") say("RGON END 1 1") return end

local p = P()
local m = RegisterMod("rgon hooks test 4", 1)
local M = ModCallbacks
local game = Game()
local function same(a, b) return a ~= nil and b ~= nil and GetPtrHash(a) == GetPtrHash(b) end
local function on(id, f, param) if param == nil then m:AddCallback(id, f) else m:AddCallback(id, f, param) end return f end
local function off(id, f) m:RemoveCallback(id, f) end
local function near(a, b, eps) return type(a) == "number" and type(b) == "number" and math.abs(a - b) <= (eps or 1e-3) end
local function f3(x) return type(x) == "number" and string.format("%.4f", x) or tostring(x) end

------------------------------------------------------------------------------
-- MC_EVALUATE_STAT
------------------------------------------------------------------------------
local S = EvaluateStatStage
if M.MC_EVALUATE_STAT and S and REPENTOGON.Implemented and REPENTOGON.Implemented[M.MC_EVALUATE_STAT] then
  local function eval() p:AddCacheFlags(CacheFlag.CACHE_ALL) p:EvaluateItems() end
  -- one evaluation, every point recorded; `answer` maps a stat to what the callback answers
  local function run_eval(answer)
    local seen = {}
    local f = on(M.MC_EVALUATE_STAT, function(_, pl, stat, value)
      if not same(pl, p) then return end
      seen[#seen + 1] = { stat, value }
      if answer and answer[stat] ~= nil then
        local a = answer[stat]
        if type(a) == "function" then return a(value) end
        return a
      end
    end)
    eval()
    off(M.MC_EVALUATE_STAT, f)
    local by = {}
    for _, s in ipairs(seen) do if by[s[1]] == nil then by[s[1]] = s[2] end end
    return seen, by
  end
  eval()
  local base_damage, base_delay = p.Damage, p.MaxFireDelay
  local seen, v0 = run_eval(nil)
  local order = {}
  for _, s in ipairs(seen) do order[#order + 1] = tostring(s[1]) end
  T("EVALUATE_STAT: one evaluation of every cache fires TEARS_UP, FLAT_TEARS, DAMAGE_UP, FLAT_DAMAGE once each, in that order",
    table.concat(order, ",") == "0,1,2,3", table.concat(order, ","))
  T("EVALUATE_STAT with no answer changes nothing", near(p.Damage, base_damage) and near(p.MaxFireDelay, base_delay),
    f3(p.Damage) .. " " .. f3(p.MaxFireDelay))
  -- FLAT_DAMAGE is the damage itself at that point: the value handed over is what the player ends with
  -- when nothing after it multiplies (the ratio covers a character that does)
  local ratio = (v0[S.FLAT_DAMAGE] or 0) > 0 and base_damage / v0[S.FLAT_DAMAGE] or nil
  T("FLAT_DAMAGE is handed the damage the game has there (> 0, and the player's Damage over it is the character's multiplier, 1 for Isaac)",
    ratio ~= nil and ratio > 0.4 and ratio < 3, f3(v0[S.FLAT_DAMAGE]) .. " -> " .. f3(base_damage))
  run_eval({ [S.FLAT_DAMAGE] = 7.25 })
  T("FLAT_DAMAGE answering 7.25: the player's Damage is 7.25 times that multiplier",
    ratio ~= nil and near(p.Damage, 7.25 * ratio, 1e-3), f3(p.Damage) .. " want " .. f3(ratio and 7.25 * ratio))
  -- DAMAGE_UP: the damage-up sum, before the game's square root; one more damage up raises the flat damage
  -- (Isaac: 3.5 * sqrt(1 + 1.2 * x))
  local _, vd = run_eval({ [S.DAMAGE_UP] = function(v) return v + 1.0 end })
  local fd0, fd1 = v0[S.FLAT_DAMAGE], vd[S.FLAT_DAMAGE]
  T("DAMAGE_UP answering one more: FLAT_DAMAGE of the same evaluation is handed more damage, by the game's formula",
    v0[S.DAMAGE_UP] ~= nil and fd0 and fd1 and fd1 > fd0 + 0.5 and near(vd[S.DAMAGE_UP], v0[S.DAMAGE_UP], 1e-6),
    "up " .. f3(v0[S.DAMAGE_UP]) .. ", flat " .. f3(fd0) .. " -> " .. f3(fd1) .. ", Damage " .. f3(p.Damage))
  T("DAMAGE_UP answering one more: the player's Damage follows", p.Damage > base_damage + 0.5, f3(base_damage) .. " -> " .. f3(p.Damage))
  if near(v0[S.DAMAGE_UP], 0, 1e-6) and near(fd0, 3.5, 1e-4) then
    T("DAMAGE_UP 1 on a plain Isaac: FLAT_DAMAGE is handed 3.5 * sqrt(1 + 1.2)", near(fd1, 3.5 * math.sqrt(2.2), 2e-3),
      f3(fd1) .. " want " .. f3(3.5 * math.sqrt(2.2)))
  end
  -- FLAT_TEARS: shots per second before the multipliers; MaxFireDelay = 30 / (tears * k) - 1
  local ft0 = v0[S.FLAT_TEARS]
  local k = ft0 and ft0 > 0 and 30 / ((base_delay + 1) * ft0) or nil
  run_eval({ [S.FLAT_TEARS] = 3.0 })
  local want = k and 30 / (3.0 * k) - 1
  T("FLAT_TEARS answering 3.0: MaxFireDelay is 30 / (3 * the multiplier) - 1",
    want ~= nil and near(p.MaxFireDelay, want, 1e-3), f3(ft0) .. " k " .. f3(k) .. ": " .. f3(p.MaxFireDelay) .. " want " .. f3(want))
  run_eval({ [S.FLAT_TEARS] = 0 })
  local d_zero = p.MaxFireDelay
  run_eval({ [S.FLAT_TEARS] = -2.5 })
  T("FLAT_TEARS answering 0 or -2.5 is ignored (REPENTOGON takes only a positive answer there)",
    near(d_zero, base_delay) and near(p.MaxFireDelay, base_delay), f3(d_zero) .. " " .. f3(p.MaxFireDelay) .. " base " .. f3(base_delay))
  -- TEARS_UP: the tears-up sum before the game's 1.3 and square root; it is both a stack slot and xmm1,
  -- and the game multiplies xmm1 next
  local _, vt = run_eval({ [S.TEARS_UP] = function(v) return v + 0.5 end })
  T("TEARS_UP answering half a tears up more: FLAT_TEARS of the same evaluation is handed more shots per second, and MaxFireDelay drops",
    ft0 and vt[S.FLAT_TEARS] and vt[S.FLAT_TEARS] > ft0 + 0.2 and p.MaxFireDelay < base_delay - 0.5,
    "up " .. f3(v0[S.TEARS_UP]) .. ", flat " .. f3(ft0) .. " -> " .. f3(vt[S.FLAT_TEARS]) .. ", delay " .. f3(p.MaxFireDelay))
  -- Isaac with no tears up: 16 - 6 * sqrt(1.3 * x + 1) frames, so 30 / (that + 1) shots per second
  if near(v0[S.TEARS_UP], 0, 1e-6) and near(ft0, 30 / 11, 1e-3) then
    local d = 16 - 6 * math.sqrt(1.3 * 0.5 + 1)
    T("TEARS_UP 0.5 on a plain Isaac: FLAT_TEARS is handed 30 / (16 - 6 * sqrt(1.3 * 0.5 + 1) + 1)",
      near(vt[S.FLAT_TEARS], 30 / (d + 1), 2e-3), f3(vt[S.FLAT_TEARS]) .. " want " .. f3(30 / (d + 1)))
  end
  -- the optional parameter is the stat
  local stats = {}
  local f = on(M.MC_EVALUATE_STAT, function(_, pl, stat, value) stats[#stats + 1] = stat end, S.DAMAGE_UP)
  eval()
  off(M.MC_EVALUATE_STAT, f)
  T("EVALUATE_STAT with the parameter DAMAGE_UP fires for that stat only", #stats == 1 and stats[1] == S.DAMAGE_UP, table.concat(stats, ","))
  -- two functions: the second is handed what the first answered (additive), the last answer stands
  local got
  local f1 = on(M.MC_EVALUATE_STAT, function(_, pl, stat, value) if stat == S.FLAT_DAMAGE then return value + 1 end end)
  local f2 = on(M.MC_EVALUATE_STAT, function(_, pl, stat, value) if stat == S.FLAT_DAMAGE then got = value return value * 2 end end)
  eval()
  off(M.MC_EVALUATE_STAT, f1) off(M.MC_EVALUATE_STAT, f2)
  T("EVALUATE_STAT is additive: the second function is handed the first one's answer, and the last answer is the damage",
    got ~= nil and near(got, v0[S.FLAT_DAMAGE] + 1) and ratio and near(p.Damage, (v0[S.FLAT_DAMAGE] + 1) * 2 * ratio, 1e-3),
    f3(got) .. " " .. f3(p.Damage))
  -- the sums are the items': a wrong stack slot or register reads something else
  local C = CollectibleType
  p:AddCollectible(C.COLLECTIBLE_SAD_ONION, 0, false)
  p:AddCollectible(C.COLLECTIBLE_PENTAGRAM, 0, false)
  local _, vi = run_eval(nil)
  local dmg_items = p.Damage
  p:RemoveCollectible(C.COLLECTIBLE_SAD_ONION)
  p:RemoveCollectible(C.COLLECTIBLE_PENTAGRAM)
  T("with Sad Onion and Pentagram: TEARS_UP is handed 0.7 and DAMAGE_UP 1 (the items' ups), FLAT_DAMAGE the damage the player ends with",
    near(vi[S.TEARS_UP], 0.7, 1e-4) and near(vi[S.DAMAGE_UP], 1.0, 1e-4) and ratio and near(dmg_items, vi[S.FLAT_DAMAGE] * ratio, 1e-3),
    f3(vi[S.TEARS_UP]) .. " " .. f3(vi[S.DAMAGE_UP]) .. " " .. f3(vi[S.FLAT_DAMAGE]) .. " -> " .. f3(dmg_items))
  eval()
  T("with every function removed the stats are back", near(p.Damage, base_damage) and near(p.MaxFireDelay, base_delay),
    f3(p.Damage) .. " " .. f3(p.MaxFireDelay))
else
  T("MC_EVALUATE_STAT (not in this layer or engine)", false)
end

------------------------------------------------------------------------------
-- MC_PRE_PLAYER_USE_BOMB / MC_POST_PLAYER_USE_BOMB
------------------------------------------------------------------------------
local function bombs_in_room()
  local list = {}
  for _, e in ipairs(Isaac.GetRoomEntities()) do
    if e.Type == EntityType.ENTITY_BOMB then list[#list + 1] = e end
  end
  return list
end
local function clear_bombs()
  for _, e in ipairs(bombs_in_room()) do e:Remove() end
  wait(2)
end
if M.MC_PRE_PLAYER_USE_BOMB and REPENTOGON.Implemented and REPENTOGON.Implemented[M.MC_PRE_PLAYER_USE_BOMB] then
  p = P()
  p:AddBombs(10)
  p:SetMinDamageCooldown(600)
  clear_bombs()
  wait(40)                               -- the placing cooldown of anything before
  local pre, post, order = 0, {}, {}
  local fpre = on(M.MC_PRE_PLAYER_USE_BOMB, function(_, pl)
    if same(pl, p) then pre = pre + 1 order[#order + 1] = "pre" return false end
  end)
  local fpost = on(M.MC_POST_PLAYER_USE_BOMB, function(_, pl, b) post[#post + 1] = b order[#order + 1] = "post" end)
  local n0 = p:GetNumBombs()
  press(ButtonAction.ACTION_BOMB, 2)
  wait(15)
  local placed = bombs_in_room()
  T("PRE_PLAYER_USE_BOMB answering false: it ran for the player, no bomb is placed and none is spent, POST does not run",
    pre >= 1 and #placed == 0 and p:GetNumBombs() == n0 and #post == 0, pre .. " " .. #placed .. " " .. n0 .. "->" .. p:GetNumBombs() .. " post " .. #post)
  off(M.MC_PRE_PLAYER_USE_BOMB, fpre)
  -- now let it through: PRE answers true, POST is handed the bomb that is placed
  pre, order = 0, {}
  local pv
  fpre = on(M.MC_PRE_PLAYER_USE_BOMB, function(_, pl) if same(pl, p) then pre = pre + 1 order[#order + 1] = "pre" pv = pl.Variant return true end end)
  wait(40)
  press(ButtonAction.ACTION_BOMB, 2)
  wait(15)
  placed = bombs_in_room()
  local b = post[1]
  T("PRE answering true: a bomb is placed and one is spent", #placed == 1 and p:GetNumBombs() == n0 - 1, #placed .. " " .. n0 .. "->" .. p:GetNumBombs())
  T("POST_PLAYER_USE_BOMB: once, after PRE, handed the player and the bomb that was placed (the one in the room, an EntityBomb)",
    pre == 1 and #post == 1 and table.concat(order, ",") == "pre,post" and b ~= nil and #placed == 1 and same(b, placed[1]) and b.Type == EntityType.ENTITY_BOMB
      and b:ToBomb() ~= nil,
    pre .. " " .. #post .. " " .. table.concat(order, ",") .. " " .. tostring(b and b.Type) .. " " .. tostring(placed[1] and GetPtrHash(placed[1])) .. "/" .. tostring(b and GetPtrHash(b)))
  T("POST: the bomb is the player's (its SpawnerEntity) and its variant a normal bomb; the parameter is the player's variant",
    b ~= nil and same(b.SpawnerEntity, p) and pv == p.Variant, tostring(b and b.SpawnerEntity and b.SpawnerEntity.Type) .. " " .. tostring(b and b.Variant))
  off(M.MC_PRE_PLAYER_USE_BOMB, fpre) off(M.MC_POST_PLAYER_USE_BOMB, fpost)
  clear_bombs()
  -- a PRE for another variant is not asked
  local asked = 0
  fpre = on(M.MC_PRE_PLAYER_USE_BOMB, function() asked = asked + 1 return false end, p.Variant + 1)
  wait(40)
  local before, nb = #bombs_in_room(), p:GetNumBombs()
  press(ButtonAction.ACTION_BOMB, 2)
  wait(15)
  T("PRE_PLAYER_USE_BOMB with another variant as its parameter is not asked, and the bomb is placed", asked == 0 and p:GetNumBombs() == nb - 1,
    asked .. " bombs in the room " .. before .. "->" .. #bombs_in_room() .. ", held " .. nb .. "->" .. p:GetNumBombs())
  off(M.MC_PRE_PLAYER_USE_BOMB, fpre)
  clear_bombs()
else
  T("MC_PRE/POST_PLAYER_USE_BOMB (not in this layer or engine)", false)
end

------------------------------------------------------------------------------
-- MC_POST_FIRE_SPLIT_TEAR
------------------------------------------------------------------------------
local function tears_in_room()
  local set = {}
  for _, e in ipairs(Isaac.GetRoomEntities()) do
    if e.Type == EntityType.ENTITY_TEAR then set[GetPtrHash(e)] = e end
  end
  return set
end
if M.MC_POST_FIRE_SPLIT_TEAR and SplitTearType and REPENTOGON.Implemented[M.MC_POST_FIRE_SPLIT_TEAR] then
  local ST = SplitTearType
  p = P()
  p:SetMinDamageCooldown(900)
  local got = {}
  local f = on(M.MC_POST_FIRE_SPLIT_TEAR, function(_, t, src, kind)
    got[#got + 1] = { h = GetPtrHash(t), src = src and GetPtrHash(src), kind = kind, frame = t.FrameCount, tear = t:ToTear() ~= nil }
  end)
  local only_quad = 0
  local fq = on(M.MC_POST_FIRE_SPLIT_TEAR, function() only_quad = only_quad + 1 end, ST.QUAD)
  -- shoot one tear with flags and see what came of it: it falls where it is, or flies right (into the
  -- gaper when there is one, else the wall)
  local function shoot(variant, flag, fly, at)
    got = {}
    only_quad = 0
    local before = tears_in_room()
    local from = at or (centre() + Vector(-140, 0))
    local t = Isaac.Spawn(EntityType.ENTITY_TEAR, variant, 0, from, fly and Vector(9, 0) or Vector(2, 0), p):ToTear()
    t:AddTearFlags(flag)
    if fly then t.FallingAcceleration, t.FallingSpeed, t.Height = -0.05, 0, -12 else t.FallingAcceleration = 1.5 end
    local h = GetPtrHash(t)
    local seen = {}                        -- every tear that showed up while this one flew, and just after
    for i = 1, 160 do
      for k in pairs(tears_in_room()) do if not before[k] and k ~= h then seen[k] = true end end
      if not t:Exists() and i > 1 then break end
      wait(1)
    end
    wait(1)
    for k in pairs(tears_in_room()) do if not before[k] and k ~= h then seen[k] = true end end
    local new = 0
    for _ in pairs(seen) do new = new + 1 end
    local all_src, all_new, kinds, frames = true, true, {}, {}
    for _, g in ipairs(got) do
      if g.src ~= h then all_src = false end
      if not g.tear or g.h == h or before[g.h] or not seen[g.h] then all_new = false end
      kinds[#kinds + 1] = tostring(g.kind)
      frames[#frames + 1] = tostring(g.frame)
    end
    return { n = #got, new = new, src = all_src, fresh = all_new, kinds = table.concat(kinds, ","), frames = table.concat(frames, ","), quad = only_quad }
  end
  local function said(r) return r.n .. " fired, " .. r.new .. " new tears, kinds " .. r.kinds .. ", frames " .. r.frames .. ", the QUAD-only function " .. r.quad end
  -- Cricket's Body: a quad-split tear that falls becomes four
  local r = shoot(TearVariant.BLUE, TearFlags.TEAR_QUADSPLIT, nil)
  T("POST_FIRE_SPLIT_TEAR, Cricket's Body: four times as the tear lands, each a new tear from it, split type QUAD, and the QUAD-only function ran too",
    r.n == 4 and r.new >= 4 and r.src and r.fresh and r.kinds == "1,1,1,1" and r.quad == 4, said(r))
  local function tries(...)
    local res
    for _ = 1, 3 do res = shoot(...) if res.n > 0 then break end wait(10) end
    return res
  end
  -- Parasite: a tear that hits an enemy splits in two
  local g = Isaac.Spawn(EntityType.ENTITY_GAPER, 0, 0, centre() + Vector(60, 0), Vector(0, 0), nil):ToNPC()
  g.MaxHitPoints, g.HitPoints = 5000, 5000
  g:AddEntityFlags(EntityFlag.FLAG_FREEZE)
  wait(20)
  r = tries(TearVariant.BLUE, TearFlags.TEAR_SPLIT, true, g.Position + Vector(-50, 0))
  T("POST_FIRE_SPLIT_TEAR, Parasite: twice as the tear hits, each a new tear from it, split type PARASITE, the QUAD-only function not",
    r.n == 2 and r.new >= 2 and r.src and r.fresh and r.kinds == "2,2" and r.quad == 0, said(r))
  -- Compound Fracture: a bone that hits an enemy breaks (one that hits the wall does not go through here)
  wait(10)
  r = tries(TearVariant.BONE, TearFlags.TEAR_BONE, true, g.Position + Vector(-50, 0))
  T("POST_FIRE_SPLIT_TEAR, Compound Fracture: once per bone the hit breaks off, each a new tear from it, split type BONE",
    r.n >= 1 and r.new >= r.n and r.src and r.fresh and r.kinds:gsub("3", ""):gsub(",", "") == "" and r.quad == 0, said(r))
  g:Remove()
  off(M.MC_POST_FIRE_SPLIT_TEAR, f) off(M.MC_POST_FIRE_SPLIT_TEAR, fq)
  wait(3)
else
  T("MC_POST_FIRE_SPLIT_TEAR (not in this layer or engine)", false)
end

say("RGON END " .. checks .. " " .. failed)
