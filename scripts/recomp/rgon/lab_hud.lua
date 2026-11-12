-- lab_hud.lua (development only; ISAAC_RGON_LAB=lab_hud.lua, and start a run)
-- Where this build keeps three things REPENTOGON reads:
--   * the HUD's eight player slots (REPENTOGON: at 0, 0x6e0 bytes each; a
--     slot begins with its player, the HUD and its own index);
--   * the sprites inside the HUD (a sprite's two animation states, +0x30 and
--     +0x50, point back at it), with the file each has loaded;
--   * the player manager's list and, after Esau Jr. is used, the players it
--     keeps beside it (REPENTOGON: four pointers 0x80 after the list).
local T = ...
local B = T.B
local r32, r16 = B.r32, B.r16
local mod = RegisterMod("rgon lab hud", 1)
local say = function(s) B.log("lab_hud: " .. s) end
local f, pm = 0, nil

local function hud_slots()
  local hud = B.ptr(Game():GetHUD())
  local pl = B.ptr(Isaac.GetPlayer(0))
  say(string.format("hud=0x%08x player=0x%08x", hud, pl))
  for i = 0, 8 do
    local s = hud + 0x6e0 * i
    say(string.format("slot %d at +0x%x: player=0x%08x (%s) hud-back=%s index=%d", i, 0x6e0 * i, r32(s), tostring(r32(s) == pl), tostring(r32(s + 4) == hud), r16(s + 8)))
  end
  local n = 0
  for o = 0, 0x6000, 4 do
    local a = hud + o
    if r32(a + 0x30) == a and r32(a + 0x50) == a then
      n = n + 1
      local ok, name = pcall(function() return T.wrap("Sprite", a):GetFilename() end)
      if o >= 0x3700 or n <= 6 then say(string.format("sprite at hud+0x%x: %s", o, tostring(name))) end
    end
  end
  say(n .. " sprite(s) inside the HUD")
end

local function find_pm()
  local g = B.ptr(Game())
  local pl = B.ptr(Isaac.GetPlayer(0))
  for o = 0, 0x40000, 4 do
    local ok, b = pcall(r32, g + o)
    if ok and b > 0x10000 and b % 4 == 0 then
      local e = r32(g + o + 4)
      if e - b == 4 then
        local ok2, first = pcall(r32, b)
        if ok2 and first == pl then
          say(string.format("a one-player list at game+0x%x (begin 0x%08x)", o, b))
          pm = pm or (g + o)
        end
      end
    end
  end
end

local function around_pm(tag)
  if not pm then say("no player manager found") return end
  local pl = B.ptr(Isaac.GetPlayer(0))
  local vt = r32(pl)
  for o = 0, 0x200, 4 do
    local v = r32(pm + o)
    if v > 0x10000 and v % 4 == 0 then
      local ok, w = pcall(r32, v)
      if ok and w == vt then
        local okt, typ = pcall(function() return T.wrap("EntityPlayer", v):GetPlayerType() end)
        say(string.format("%s: list+0x%x -> player object 0x%08x type=%s%s", tag, o, v, tostring(okt and typ), v == pl and " (the player)" or ""))
      end
    end
  end
  say(tag .. ": scanned; the player is type " .. Isaac.GetPlayer(0):GetPlayerType())
end

local snap = {}
local LO, HI = -0x400, 0x800
local function snapshot()
  if not pm then return end
  for o = LO, HI, 4 do snap[o] = r32(pm + o) end
end
local function changed(tag)
  if not pm then return end
  local vt = r32(B.ptr(Isaac.GetPlayer(0)))
  local n = 0
  for o = LO, HI, 4 do
    local v = r32(pm + o)
    if v ~= snap[o] then
      n = n + 1
      local ok, w = pcall(r32, v)
      local isp = ok and w == vt
      local typ = isp and select(2, pcall(function() return T.wrap("EntityPlayer", v):GetPlayerType() end)) or ""
      if n <= 40 then say(string.format("%s: list%+d (0x%x): 0x%08x -> 0x%08x%s", tag, o, o & 0xffffffff, snap[o], v, isp and (" a player object, type " .. tostring(typ)) or "")) end
    end
  end
  say(tag .. ": " .. n .. " word(s) changed")
end

mod:AddCallback(ModCallbacks.MC_POST_UPDATE, function()
  f = f + 1
  local p = Isaac.GetPlayer(0)
  if f == 30 then
    hud_slots()
    find_pm()
    around_pm("before Esau Jr")
    for i = 0, 7 do
      local s = B.ptr(Game():GetHUD()) + 0x6dc * i
      say(string.format("0x6dc slot %d: hud-back=%s index=%d", i, tostring(r32(s + 4) == B.ptr(Game():GetHUD())), r16(s + 8)))
    end
  elseif f == 38 then
    snapshot()
    say(string.format("before: player 0x%08x type %d items %d", B.ptr(p), p:GetPlayerType(), p:GetCollectibleCount()))
  elseif f == 40 then
    p:AddCollectible(CollectibleType.COLLECTIBLE_ESAU_JR, 4, true, ActiveSlot.SLOT_PRIMARY)
    p:UseActiveItem(CollectibleType.COLLECTIBLE_ESAU_JR, UseFlag.USE_OWNED, ActiveSlot.SLOT_PRIMARY)
    say("used Esau Jr")
  elseif f == 44 or f == 90 or f == 200 then
    say(string.format("f%d: player 0x%08x type %d items %d", f, B.ptr(p), p:GetPlayerType(), p:GetCollectibleCount()))
    changed("f" .. f)
  end
end)
say("listening")
