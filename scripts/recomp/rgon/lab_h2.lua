-- lab_h2.lua (development only; ISAAC_RGON_LAB=lab_h2.lua, and start a run)
-- The probe for round h2's hooks: each new slot gets a raw handler that counts
-- its calls and writes the first few (ECX, the virtual table there, the return
-- address, the first stack words), while a scripted run makes each event happen
-- once: an item removed, an effect added and removed, an active item charged,
-- a room left and entered, a room cleared, an explosion, a new floor, a
-- restart. At the end one line per slot says how often it fired and between
-- which events, so "it fires exactly when the documented event happens" is read
-- off the log rather than assumed.
local T = ...
local B = T.B
local r32, ptr = B.r32, B.ptr
local say = function(s) B.log("lab_h2: " .. s) end
local mod = RegisterMod("rgon lab h2", 1)

local SLOTS = {
  [80] = "TriggerCollectibleRemoved", [81] = "TriggerRoomExit", [82] = "InitPostLevelInitStats",
  [83] = "PlayerHUD::RenderActiveItem", [84] = "Manager::Render", [85] = "TemporaryEffects::AddEffect",
  [86] = "TriggerEffectRemoved", [87] = "GetActiveMaxCharge", [88] = "GetActiveMinUsableCharge",
  [89] = "Room::Init", [90] = "Level::Init", [91] = "ApplyTearFlagEffects", [92] = "TriggerRoomClear",
  [93] = "TriggerNewRoom_TemporaryEffects", [94] = "TriggerNewStage", [15] = "InitPreLevelInitStats (slot 15)", [21] = "slot 21 (0x006bb790)",
  [60] = "RemoveCollectible", [56] = "Game::BombDamage", [57] = "BombTearflagEffects", [55] = "TryOpenChest",
  [53] = "DischargeActiveItem", [19] = "AddCostume", [20] = "RemoveCostume", [6] = "Level::SetStage", [33] = "UsePill",
}
local count, phase_of, first = {}, {}, {}
local phase = "boot"
local function hex(v) return string.format("0x%08x", v) end
local function word(a) local ok, v = pcall(r32, a) return ok and v or -1 end
for slot, name in pairs(SLOTS) do
  count[slot] = 0
  phase_of[slot] = {}
  first[slot] = 0
  B.hook(slot, function(ecx, esp, edx)
    count[slot] = count[slot] + 1
    phase_of[slot][phase] = (phase_of[slot][phase] or 0) + 1
    if first[slot] < 3 then
      first[slot] = first[slot] + 1
      say(string.format("%d %s [%s] ecx=%s vt=%s edx=%s ret=%s args=%s %s %s %s", slot, name, phase, hex(ecx), hex(word(ecx)), hex(edx),
        hex(word(esp)), hex(word(esp + 4)), hex(word(esp + 8)), hex(word(esp + 12)), hex(word(esp + 16))))
    end
  end, nil)
end

local f = 0
local gaper, chest
local plan = {
  [20] = function()
    local p = Isaac.GetPlayer(0)
    say(string.format("player=%s vt=%s effects=%s hud=%s room=%s level=%s game=%s", hex(ptr(p)), hex(word(ptr(p))),
      hex(ptr(p) + 0x1508), hex(ptr(Game():GetHUD())), hex(ptr(Game():GetRoom())), hex(ptr(Game():GetLevel())), hex(ptr(Game()))))
  end,
  [30] = function() phase = "remove item" local p = Isaac.GetPlayer(0) p:AddCollectible(1, 0, false) p:RemoveCollectible(1) end,
  [40] = function() phase = "add effect" Isaac.GetPlayer(0):GetEffects():AddCollectibleEffect(1, false, 2) end,
  [45] = function() phase = "remove effect" Isaac.GetPlayer(0):GetEffects():RemoveCollectibleEffect(1, 1) end,
  [50] = function() phase = "costume" local p = Isaac.GetPlayer(0) local it = Isaac.GetItemConfig():GetCollectible(1)
    p:AddCostume(it, false) p:RemoveCostume(it) end,
  [55] = function() phase = "active" local p = Isaac.GetPlayer(0) p:AddCollectible(45, 0, false) p:FullCharge(0, true) end,
  [60] = function() phase = "discharge" Isaac.GetPlayer(0):DischargeActiveItem(0) end,
  [65] = function() phase = "pill" Isaac.GetPlayer(0):UsePill(PillEffect.PILLEFFECT_BALLS_OF_STEEL, PillColor.PILL_BLUE_BLUE) end,
  [70] = function() phase = "explosion" local p = Isaac.GetPlayer(0)
    gaper = Isaac.Spawn(EntityType.ENTITY_GAPER, 0, 0, p.Position + Vector(60, 0), Vector(0, 0), nil)
  end,
  [74] = function() Game():BombDamage(gaper.Position, 1, 40, false, Isaac.GetPlayer(0), TearFlags.TEAR_NORMAL, 0, false) end,
  [76] = function() phase = "tearflag effects" Game():BombTearflagEffects(gaper.Position, 40, TearFlags.TEAR_NORMAL, Isaac.GetPlayer(0), 1) end,
  [80] = function() phase = "chest" local p = Isaac.GetPlayer(0)
    chest = Isaac.Spawn(EntityType.ENTITY_PICKUP, PickupVariant.PICKUP_CHEST, 0, p.Position + Vector(0, 60), Vector(0, 0), nil):ToPickup()
  end,
  [84] = function() chest:TryOpenChest(Isaac.GetPlayer(0)) end,
  [90] = function() phase = "room clear" for _, e in ipairs(Isaac.GetRoomEntities()) do if e:IsEnemy() then e:Remove() end end
    Game():GetRoom():TriggerClear(true) end,
  [100] = function() phase = "goto treasure" Isaac.ExecuteCommand("goto s.treasure.0") end,
  [160] = function() phase = "goto back" Game():StartRoomTransition(Game():GetLevel():GetStartingRoomIndex(), -1, 0) end,
  [220] = function() phase = "stage 2" Isaac.ExecuteCommand("stage 2") end,
  [330] = function() phase = "restart" Isaac.ExecuteCommand("restart") end,
  [480] = function()
    phase = "end"
    local names = {}
    for slot in pairs(SLOTS) do names[#names + 1] = slot end
    table.sort(names)
    for _, slot in ipairs(names) do
      local parts = {}
      for ph, n in pairs(phase_of[slot]) do parts[#parts + 1] = ph .. "=" .. n end
      table.sort(parts)
      say(string.format("SUMMARY %3d %-34s %6d  %s", slot, SLOTS[slot], count[slot], table.concat(parts, ", ")))
    end
  end,
}
mod:AddCallback(ModCallbacks.MC_POST_RENDER, function()
  f = f + 1
  local g = plan[f]
  if g then
    local ok, err = pcall(g)
    if not ok then say("frame " .. f .. ": " .. tostring(err)) end
  end
end)
local n = 0
for _ in pairs(SLOTS) do n = n + 1 end
say("armed " .. n .. " probe hooks; the plan runs on MC_POST_RENDER frames once a run is drawn")
