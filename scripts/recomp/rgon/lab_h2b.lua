-- lab_h2b.lua (development only; ISAAC_RGON_LAB=lab_h2b.lua, and start a run)
-- What makes an explosion hurt a gaper from a script, and which of Game::BombDamage (slot 56) and
-- Entity_Tear::ApplyTearFlagEffects (slot 91) run for it: the gaper's hit points and the two slots'
-- calls around Game():BombDamage at once and later, and around Isaac.Explode.
local T = ...
local B = T.B
local say = function(s) B.log("lab_h2b: " .. s) end
local mod = RegisterMod("rgon lab h2b", 1)
local f, g = 0, nil
local n = { [56] = 0, [91] = 0 }
for s in pairs(n) do B.hook(s, function(ecx, esp, edx) n[s] = n[s] + 1 end, nil) end
local function hp(tag) say(string.format("%s: hp %.1f, slot 56 %d, slot 91 %d", tag, g.HitPoints, n[56], n[91])) end
local plan = {
  [20] = function()
    local p = Isaac.GetPlayer(0)
    g = Isaac.Spawn(EntityType.ENTITY_GAPER, 0, 0, Game():GetRoom():GetCenterPos() + Vector(0, 80), Vector(0, 0), nil)
    hp("spawned")
    Game():BombDamage(g.Position, 5, 40, false, p, TearFlags.TEAR_NORMAL, DamageFlag.DAMAGE_EXPLOSION, false)
    hp("BombDamage at once")
  end,
  [60] = function()
    Game():BombDamage(g.Position, 5, 40, false, Isaac.GetPlayer(0), TearFlags.TEAR_NORMAL, DamageFlag.DAMAGE_EXPLOSION, false)
    hp("BombDamage 40 frames later")
  end,
  [62] = function()
    Game():BombDamage(g.Position, 5, 40, false, nil, TearFlags.TEAR_NORMAL, DamageFlag.DAMAGE_EXPLOSION, false)
    hp("BombDamage with no source")
  end,
  [64] = function()
    Isaac.Explode(g.Position, Isaac.GetPlayer(0), 5)
    hp("Isaac.Explode")
  end,
  [70] = function() hp("6 frames after")
    g:TakeDamage(3, 0, EntityRef(Isaac.GetPlayer(0)), 0)
    hp("TakeDamage(3)")
    Game():BombDamage(g.Position, 5, 300, false, Isaac.GetPlayer(0), TearFlags.TEAR_NORMAL, DamageFlag.DAMAGE_EXPLOSION, true)
    hp("BombDamage radius 300, damageSource true")
    Isaac.Spawn(EntityType.ENTITY_BOMB, BombVariant.BOMB_NORMAL, 0, g.Position, Vector(0, 0), nil):ToBomb():SetExplosionCountdown(1)
  end,
  [100] = function() hp("30 frames after a real bomb")
    local p = Isaac.GetPlayer(0)
    p:FireTear(g.Position - Vector(30, 0), Vector(10, 0), false, true, false)
  end,
  [130] = function() hp("30 frames after a tear fired at it") end,
}
mod:AddCallback(ModCallbacks.MC_POST_RENDER, function()
  f = f + 1
  if plan[f] then local ok, err = pcall(plan[f]) if not ok then say("frame " .. f .. ": " .. tostring(err)) end end
end)
