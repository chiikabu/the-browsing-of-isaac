-- The mod the game lists. The layer itself is rgon.lua, which the engine runs
-- before any mod (this one included) once this folder is installed and on.
local mod = RegisterMod("REPENTOGON (browser)", 1)
if REPENTOGON and REPENTOGON.Browser then
  Isaac.DebugString("[REPENTOGON] browser layer, API " .. tostring(REPENTOGON.Version))
else
  Isaac.DebugString("[REPENTOGON] this engine has no support for the browser layer; nothing was loaded")
end
