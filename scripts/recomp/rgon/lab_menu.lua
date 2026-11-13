-- lab_menu.lua (development only; ISAAC_RGON_LAB=lab_menu.lua, round 112)
-- The character menu as the layer sees it after Menu_Character::UpdateRotations:
-- which page is up, whose it is, whether the layer finds it locked, what the menu's
-- IsCharacterUnlocked ([menu+5]) and the page's "Unlocked By" and "Item Name"
-- layers hold. Said when any of that changes. With ISAAC_LAB_UNLOCK=<achievement
-- name>, once that character's page has been up for 240 menu frames the
-- achievement is unlocked through the API (PersistentGameData:Unlock), as a mod
-- would, and that is said too.
local T = ...
local B = T.B
local r8, r32, ri32, log = B.r8, B.r32, B.ri32, B.log
local unlock_name = B.env("ISAAC_LAB_UNLOCK")
local last, frames, done = nil, 0, false
local orig = T.menu_character_update
if type(orig) ~= "function" then log("lab_menu: no T.menu_character_update (an engine without the menu hook?)") return end
local said_in, calls, last_menu = false, 0, nil
T.menu_character_update = function(menu)
  orig(menu)
  -- the menu manager (g_MenuManager, [0x00c72a20]: stored once at 0x00959def) and its
  -- selected menu ([+0x40] in REPENTOGON's layout, measured here: it changes as the
  -- menus change), said when it changes
  local mm = r32(0x00c72a20)
  local cur = mm ~= 0 and ri32(mm + 0x40) or -1
  calls = calls + 1
  if cur ~= last_menu then
    last_menu = cur
    log(string.format("lab_menu: menu %d (Menu_Character at manager+0x%x, call %d)", cur, menu - mm, calls))
  end
  if not said_in then said_in = true log("lab_menu: first UpdateRotations") end
  local sel = ri32(menu + 0x10)
  local pt = T.menu_page(menu)
  local cfg = pt and T.player_config(pt)
  local name = cfg and B.stdstr(cfg + 4) or "-"
  local open = pt and T.character_unlocked(pt)
  local spr = cfg and r32(cfg + 0x134) or 0
  local ub, iname = "-", "-"
  if spr ~= 0 then
    local by = T.menu_layer_states(spr).by
    if by["Unlocked By"] then ub = tostring(r8(by["Unlocked By"] + 0x74)) end
    if by["Item Name"] then iname = tostring(r8(by["Item Name"] + 0x74)) end
  end
  local now = string.format("sel=%d tainted=%d pt=%s name=%s unlocked=%s menu+5=%d unlockedby=%s itemname=%s", sel, r32(menu + 0xdb4),
    tostring(pt), name, tostring(open), r8(menu + 5), ub, iname)
  if now ~= last then
    last = now
    frames = 0
    log("lab_menu: " .. now)
  end
  frames = frames + 1
  if unlock_name and not done and pt and open == false and frames >= 240 then
    local id = Isaac.GetAchievementIdByName(unlock_name)
    if id >= 0 and ri32(cfg + 0xe8) == id then          -- this page's character waits for that achievement
      done = true
      local ok = Isaac.GetPersistentGameData():Unlock(id, true)
      log(string.format("lab_menu: unlocked %s (%d) through PersistentGameData:Unlock -> %s", unlock_name, id, tostring(ok)))
    end
  end
end
log("lab_menu: listening" .. (unlock_name and (" (will unlock " .. unlock_name .. ")") or ""))
