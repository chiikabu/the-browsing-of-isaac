-- lab_mods.lua (development only; ISAAC_RGON_LAB=lab_mods.lua)
-- The mod manager's list as the game holds it when the first mod is about to
-- load: each entry's directory and name, in the list's order.
--   g_Manager = [0x00c7169c]; ModManager = g_Manager + 0x2a6c0 (asm, 0x009b2474)
--   its entries: a vector of ModEntry* at +0; directory +0x00, name +0x18 (std::string)
local T = ...
local B = T.B
local man = B.r32(0x00c7169c)
if man == 0 then B.log("lab_mods: no manager") return end
local mm = man + 0x2a6c0
local first, last = B.r32(mm), B.r32(mm + 4)
B.log(string.format("lab_mods: %d entries (vector %08x..%08x)", (last - first) // 4, first, last))
local i = 0
for at = first, last - 4, 4 do
  local e = B.r32(at)
  i = i + 1
  if i <= 40 then
    B.log(string.format("lab_mods: #%d dir=%q name=%q enabled@+0x30..: %02x %02x %02x %02x", i, B.stdstr(e), B.stdstr(e + 0x18),
      B.r8(e + 0x30), B.r8(e + 0x31), B.r8(e + 0x32), B.r8(e + 0x33)))
  end
end

-- the third entry's fields, as raw words and (where it looks like one) a string
do
  local e = B.r32(first + 8)
  for off = 0, 0xd8, 0x18 do
    local len, cap = B.r32(e + off + 0x10), B.r32(e + off + 0x14)
    local text = (cap == 15 or (cap > 15 and cap < 0x10000)) and len <= cap and string.format("%q", B.stdstr(e + off):sub(1, 60)) or "-"
    B.log(string.format("lab_mods: +%02x: %08x %08x %08x %08x len=%d cap=%d %s", off, B.r32(e + off), B.r32(e + off + 4), B.r32(e + off + 8), B.r32(e + off + 12), len, cap, text))
  end
end
