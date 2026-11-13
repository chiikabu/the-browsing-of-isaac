-- test_cb.lua -- round 115: a callback list walked through an index hands out what the plain walk does,
-- in the same order, checked from inside a running game:
--
--   node scripts/recomp/web/drive_stress.mjs "http://127.0.0.1:8368/play.html?ISAAC_RGON_ALLOW=zz-port-stress" <out> \
--        phases=custom lua=scripts/recomp/rgon/test_cb.lua zips=<layer.zip>
--
-- The reference is written here from the game's own runner (main.lua _RunCallback): walk the live list
-- with a rising index, and run an entry when `not a or not b or a == -1 or b == -1 or a == b` holds
-- for the firing's parameter a and the entry's b. Every trial builds the same registrations on two
-- callbacks of its own (string ids), fires one through the layer (Isaac.RunCallbackWithParam) and
-- walks the other by the reference, and compares which functions ran, in what order, with what
-- arguments. The functions change their own list while it is being walked (remove themselves, remove
-- another, add another), which is where an index kept across the walk would go wrong.
local checks, failed = 0, 0
local function T(name, cond, detail)
  checks = checks + 1
  if not cond then failed = failed + 1 end
  say("RGON " .. (cond and "ok   " or "FAIL ") .. name .. (detail ~= nil and (" -- " .. tostring(detail)) or ""))
end
if type(REPENTOGON) ~= "table" then say("RGON FAIL no REPENTOGON for this mod") say("RGON END 1 1") return end
local stats = REPENTOGON.Extras and REPENTOGON.Extras.Misc and REPENTOGON.Extras.Misc.CallbackIndex
if type(stats) ~= "table" then say("RGON FAIL this layer has no callback index") say("RGON END 1 1") return end

local m = RegisterMod("rgon cb test", 1)

-- a small generator of its own (the high bits of an LCG), so a failure can be run again
local seed = 0x2545F491
local function rnd(n)
  seed = (seed * 1103515245 + 12345) & 0x7fffffff
  return ((seed >> 16) % n) + 1
end

local PARAMS = { false, -1, 1, 2, 3, 4, 5, "s" }             -- false stands for "no parameter" when registering
local FIRE = { false, -1, 1, 2, 3, 4, 5, 6, "s", "t", 2.0, 0 }   -- false stands for nil when firing
local PRIOS = { CallbackPriority.IMPORTANT, CallbackPriority.EARLY, CallbackPriority.DEFAULT, CallbackPriority.DEFAULT,
                CallbackPriority.DEFAULT, CallbackPriority.LATE }

local function rule(a, b) return not a or not b or a == -1 or b == -1 or a == b end
-- the reference walk: main.lua's, over the live list
local function reference(id, param, ...)
  local list = Isaac.GetCallbacks(id)
  local i = 0
  while true do
    i = i + 1
    local cb = list[i]
    if cb == nil then return nil end
    if rule(param, cb.Param) then
      local r = cb.Function(cb.Mod, ...)
      if r ~= nil then return r end
    end
  end
end

-- One side of a trial: `plan` says what each function is and does; the functions are made here so
-- that the two sides do the same things to their own lists.
local function side(id, plan, log)
  local fns = {}
  local function make(k)
    local spec = plan[k]
    local runs = 0
    local f
    f = function(_, a, b)
      runs = runs + 1
      log[#log + 1] = k .. ":" .. tostring(a) .. ":" .. tostring(b)
      local act = spec.act
      if act and runs == spec.at then
        if act == "self" then m:RemoveCallback(id, f)
        elseif act == "other" then if fns[spec.who] then m:RemoveCallback(id, fns[spec.who]) end
        elseif act == "add" then
          local nk = spec.new
          if not fns[nk] then
            fns[nk] = make(nk)
            if plan[nk].param == false then Isaac.AddPriorityCallback(m, id, plan[nk].prio, fns[nk])
            else Isaac.AddPriorityCallback(m, id, plan[nk].prio, fns[nk], plan[nk].param) end
          end
        elseif act == "swap" then                         -- one out, one in: the list keeps its length
          if fns[spec.who] then m:RemoveCallback(id, fns[spec.who]) fns[spec.who] = nil end
          local nk = spec.new
          if not fns[nk] then
            fns[nk] = make(nk)
            if plan[nk].param == false then Isaac.AddPriorityCallback(m, id, plan[nk].prio, fns[nk])
            else Isaac.AddPriorityCallback(m, id, plan[nk].prio, fns[nk], plan[nk].param) end
          end
        end
      end
      if spec.answer and runs >= spec.answer then return k end
    end
    return f
  end
  for k = 1, plan.first do
    fns[k] = make(k)
    if plan[k].param == false then Isaac.AddPriorityCallback(m, id, plan[k].prio, fns[k])
    else Isaac.AddPriorityCallback(m, id, plan[k].prio, fns[k], plan[k].param) end
  end
  return fns
end

local function new_plan(n, quiet)
  local plan = { first = n }
  for k = 1, n + 6 do                                       -- the last six exist only once something adds them
    local spec = { param = PARAMS[rnd(#PARAMS)], prio = PRIOS[rnd(#PRIOS)] }
    if not quiet and k <= n then
      local r = rnd(12)
      if r == 1 then spec.act, spec.at = "self", rnd(3)
      elseif r == 2 then spec.act, spec.at, spec.who = "other", rnd(3), rnd(n)
      elseif r == 3 then spec.act, spec.at, spec.new = "add", rnd(3), n + rnd(6)
      elseif r == 4 then spec.act, spec.at, spec.who, spec.new = "swap", rnd(3), rnd(n), n + rnd(6)
      elseif r == 5 then spec.answer = rnd(4) end
    end
    plan[k] = spec
  end
  return plan
end

local trial_no = 0
local function trial(n, fires, quiet)
  trial_no = trial_no + 1
  local ida, idb = "R115_A_" .. trial_no, "R115_B_" .. trial_no
  local plan = new_plan(n, quiet)
  local la, lb = {}, {}
  side(ida, plan, la)
  side(idb, plan, lb)
  local answers_a, answers_b = {}, {}
  for f = 1, fires do
    local p = FIRE[rnd(#FIRE)]
    if p == false then p = nil end
    la[#la + 1] = "fire " .. tostring(p)
    lb[#lb + 1] = "fire " .. tostring(p)
    answers_a[f] = tostring((Isaac.RunCallbackWithParam(ida, p, f, p)))     -- (no answer is no value at all)
    answers_b[f] = tostring((reference(idb, p, f, p)))
  end
  local same = #la == #lb
  local at
  for i = 1, math.max(#la, #lb) do
    if la[i] ~= lb[i] then same = false at = at or i end
  end
  local ans = table.concat(answers_a, ",") == table.concat(answers_b, ",")
  return same and ans, same and (ans and "" or "answers differ") or
    ("entry " .. tostring(at) .. ": layer " .. tostring(la[at]) .. ", reference " .. tostring(lb[at]) .. " (of " .. #la .. "/" .. #lb .. ")"), #la
end

------------------------------------------------------------------------------
T("the index is on, and the game's lists have the one rule it is built for", stats.on == true)

-- fixed cases first
do
  local log = {}
  local id = "R115_FIXED"
  local function reg(tag, param, prio)
    local f = function(_, x) log[#log + 1] = tag end
    if param == nil then Isaac.AddPriorityCallback(m, id, prio or CallbackPriority.DEFAULT, f)
    else Isaac.AddPriorityCallback(m, id, prio or CallbackPriority.DEFAULT, f, param) end
    return f
  end
  reg("any"); reg("p1", 1); reg("p2", 2); reg("minus", -1); reg("late1", 1, CallbackPriority.LATE); reg("early2", 2, CallbackPriority.EARLY)
  reg("str", "s"); reg("p1b", 1)
  local function fire(p) log = {} Isaac.RunCallbackWithParam(id, p) return table.concat(log, " ") end
  local f0, b0, p0 = stats.fast, stats.built, stats.plain
  local a = fire(1)
  T("a firing with a parameter runs the functions without one, with -1 and with that one, in list order",
    a == "any p1 minus p1b late1", a)
  T("... through an index built for it", stats.fast == f0 + 1 and stats.built == b0 + 1 and stats.plain == p0,
    string.format("fast %d built %d plain %d", stats.fast - f0, stats.built - b0, stats.plain - p0))
  local a2 = fire(1)
  T("the second firing uses the same index", a2 == a and stats.fast == f0 + 2 and stats.built == b0 + 1)
  T("another parameter gets its own", fire(2) == "early2 any p2 minus" and stats.built == b0 + 2, fire(2))
  T("a string parameter too", fire("s") == "any minus str", fire("s"))
  T("a parameter nothing is registered for runs the ones for every firing", fire(77) == "any minus", fire(77))
  T("2.0 is 2", fire(2.0) == "early2 any p2 minus", fire(2.0))
  local p1 = stats.plain
  T("no parameter, and -1, run every function, walked plainly",
    fire(nil) == "early2 any p1 p2 minus str p1b late1" and fire(-1) == "early2 any p1 p2 minus str p1b late1" and stats.plain == p1 + 2, fire(nil))
  local b1 = stats.built
  local extra = reg("new1", 1)
  T("a function added afterwards is in the next firing, from a new index", fire(1) == "any p1 minus p1b new1 late1" and stats.built == b1 + 1, fire(1))
  m:RemoveCallback(id, extra)
  T("and gone again once removed", fire(1) == "any p1 minus p1b late1", fire(1))
  -- put into the list by hand, the way a mod that skips Isaac.AddCallback does
  local list = Isaac.GetCallbacks(id)
  list[#list + 1] = { Mod = m, Function = function() log[#log + 1] = "hand" end, Priority = 999, Param = 1 }
  T("an entry a mod stores at the end of the list itself is in the next firing", fire(1) == "any p1 minus p1b late1 hand", fire(1))
  table.remove(list)
  T("and gone once it takes it out again", fire(1) == "any p1 minus p1b late1", fire(1))
end

-- a function that removes itself, one that removes the next, one that appends: the walk's own behaviour
do
  local id = "R115_WALK"
  local log = {}
  local f2, f3
  local f1 = function() log[#log + 1] = "1" end
  f2 = function() log[#log + 1] = "2" m:RemoveCallback(id, f2) end
  f3 = function() log[#log + 1] = "3" end
  local f4 = function() log[#log + 1] = "4" end
  m:AddCallback(id, f1, 5) m:AddCallback(id, f2, 5) m:AddCallback(id, f3, 5) m:AddCallback(id, f4, 5)
  local l0 = stats.left
  Isaac.RunCallbackWithParam(id, 5)
  T("a function that removes itself: the one after it is passed over in that firing, as the game's own walk does",
    table.concat(log, "") == "124" and stats.left == l0 + 1, table.concat(log, ""))
  log = {}
  Isaac.RunCallbackWithParam(id, 5)
  T("and the next firing runs the three that are left", table.concat(log, "") == "134", table.concat(log, ""))
  local added = false
  local id2 = "R115_APPEND"
  local g2 = function() log[#log + 1] = "n" end
  local g1 = function() log[#log + 1] = "a" if not added then added = true m:AddCallback(id2, g2, 9) end end
  m:AddCallback(id2, g1, 9)
  log = {}
  Isaac.RunCallbackWithParam(id2, 9)
  T("a function that adds another for the same parameter: the new one runs in the same firing", table.concat(log, "") == "an", table.concat(log, ""))
end

-- two parameters, a hand-made change under the walk, and a change no length shows
do
  local id = "R115_TWO"
  local log = {}
  local function reg(tag, param) local f = function() log[#log + 1] = tag end m:AddCallback(id, f, param) return f end
  reg("a1", 1) reg("b2", 2) reg("c3", 3) reg("d1", 1)
  Isaac.RunCallbackWithTwoParams(id, 1, 2)
  T("RunCallbackWithTwoParams runs the functions of either parameter, in list order", table.concat(log, " ") == "a1 b2 d1", table.concat(log, " "))

  local id2 = "R115_HAND"
  log = {}
  local list
  local late = { Mod = m, Function = function() log[#log + 1] = "hand" end, Priority = 0, Param = 4 }
  m:AddCallback(id2, function() log[#log + 1] = "x" list[#list + 1] = late end, 4)
  m:AddCallback(id2, function() log[#log + 1] = "y" end, 4)
  list = Isaac.GetCallbacks(id2)
  Isaac.RunCallbackWithParam(id2, 4)
  T("an entry a function stores at the end of its own list by hand runs in the same firing", table.concat(log, " ") == "x y hand", table.concat(log, " "))

  local id3 = "R115_INPLACE"
  log = {}
  local function reg3(tag, param) local f = function() log[#log + 1] = tag end m:AddCallback(id3, f, param) return f end
  reg3("p", 7) reg3("q", 8) reg3("r", 7) reg3("s", 8)
  local l3 = Isaac.GetCallbacks(id3)
  local function fire3(p) log = {} Isaac.RunCallbackWithParam(id3, p) return table.concat(log, " ") end
  T("(four functions, two parameters)", fire3(7) == "p r" and fire3(8) == "q s")
  -- an entry for 8 stored over an entry for 7: the place the index kept no longer holds its entry
  local kept = l3[3]
  l3[3] = { Mod = m, Function = function() log[#log + 1] = "t" end, Priority = 0, Param = 8 }
  local r7, r8 = fire3(7), fire3(8)
  T("an entry stored by hand over one the index kept: the walk sees the place changed and runs what the list holds",
    r7 == "p" and r8 == "q t s", r7 .. " / " .. r8)
  l3[3] = kept
  T("(put back; the firing for 8 finds its kept place changed, and every index is found again)", fire3(8) == "q s" and fire3(7) == "p r")
  -- an entry for 7 stored over an entry for 8, at a place the index for 7 never looks at: not seen at
  -- once (the known limit), found by the audit within 256 firings, and said once
  local h0 = stats.healed
  l3[2] = { Mod = m, Function = function() log[#log + 1] = "u" end, Priority = 0, Param = 7 }
  local seen_at
  for n = 1, 300 do
    if fire3(7) == "p u r" then seen_at = n break end
  end
  T("an entry stored by hand at a place the index does not look at is found by the audit within 256 firings",
    seen_at ~= nil and seen_at <= 256 and stats.healed == h0 + 1, tostring(seen_at) .. " firings, healed " .. (stats.healed - h0))
end

-- the differential
do
  local bad, firstbad, entries = 0, nil, 0
  local f0, l0 = stats.fast, stats.left
  for t = 1, 120 do
    local ok, why, n = trial(3 + rnd(30), 14, false)
    entries = entries + n
    if not ok then bad = bad + 1 firstbad = firstbad or ("trial " .. t .. ": " .. why) end
  end
  T("120 random lists whose functions change them mid-walk: the layer runs what the reference walk runs, in its order, with its answers",
    bad == 0, firstbad or (entries .. " log entries, " .. (stats.fast - f0) .. " firings through an index, " .. (stats.left - l0) .. " left theirs mid-walk"))
  T("... and those firings did use the index, and some walks did leave it", stats.fast - f0 > 500 and stats.left - l0 > 20,
    (stats.fast - f0) .. " / " .. (stats.left - l0))
  bad, firstbad = 0, nil
  for t = 1, 40 do
    local ok, why = trial(100 + rnd(200), 30, true)
    if not ok then bad = bad + 1 firstbad = firstbad or ("trial " .. t .. ": " .. why) end
  end
  T("40 long quiet lists (100 to 300 functions): the same", bad == 0, firstbad)
end

-- the engine's own firings still reach a mod's functions by parameter (the walk's harness may
-- remove an enemy after its first update, so each is asked for once at least)
do
  local fly_f, fly_other, gap_g, gap_other = 0, 0, 0, 0
  local f = function(_, e) if e.Type == EntityType.ENTITY_FLY then fly_f = fly_f + 1 else fly_other = fly_other + 1 end end
  local g = function(_, e) if e.Type == EntityType.ENTITY_GAPER then gap_g = gap_g + 1 else gap_other = gap_other + 1 end end
  m:AddCallback(ModCallbacks.MC_NPC_UPDATE, f, EntityType.ENTITY_FLY)
  m:AddCallback(ModCallbacks.MC_NPC_UPDATE, g, EntityType.ENTITY_GAPER)
  local f0 = stats.fast
  local centre = Game():GetRoom():GetCenterPos()
  for i = 1, 4 do
    Isaac.Spawn(EntityType.ENTITY_FLY, 0, 0, centre + Vector(-120, -60), Vector(0, 0), nil)
    Isaac.Spawn(EntityType.ENTITY_GAPER, 0, 0, centre + Vector(120, -60), Vector(0, 0), nil)
    wait(4)
  end
  T("MC_NPC_UPDATE: the function registered for flies runs for flies only, the one for gapers for gapers only",
    fly_f >= 1 and gap_g >= 1 and fly_other == 0 and gap_other == 0,
    string.format("fly %d/%d gaper %d/%d, %d firings through an index", fly_f, fly_other, gap_g, gap_other, stats.fast - f0))
  T("... and the engine's firings went through an index", stats.fast - f0 >= 2)
  m:RemoveCallback(ModCallbacks.MC_NPC_UPDATE, f)
  m:RemoveCallback(ModCallbacks.MC_NPC_UPDATE, g)
  local before = fly_f + gap_g
  Isaac.Spawn(EntityType.ENTITY_FLY, 0, 0, centre + Vector(-120, -60), Vector(0, 0), nil)
  wait(6)
  T("and both stop once removed", fly_f + gap_g == before, fly_f + gap_g - before)
  for _, e in ipairs(Isaac.GetRoomEntities()) do
    if e.Type == EntityType.ENTITY_FLY or e.Type == EntityType.ENTITY_GAPER then e:Remove() end
  end
end

say("RGON END " .. checks .. " " .. failed)
