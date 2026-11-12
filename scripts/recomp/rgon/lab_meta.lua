-- lab_meta.lua (development only; ISAAC_RGON_LAB=lab_meta.lua)
-- Reads a mod's metadata.xml the way ModManager::ListMods does (0x008f6368..0x008f6415):
-- open through the game's file manager, ask the stream its size, read, close.
local T = ...
local B = T.B
local function cstr(s)
  local p = B.alloc(#s + 1)
  for i = 1, #s do B.w8(p + i - 1, s:byte(i)) end
  B.w8(p + #s, 0)
  return p
end
for _, path in ipairs({ "//mods/repentogon//metadata.xml", "mods/repentogon/metadata.xml" }) do
  local p = cstr(path)
  local stream = B.call(0x00a178d0, 0x00c37a10, p, 0)
  B.log(string.format("lab_meta: open(%q) -> %08x", path, stream))
  if stream ~= 0 then
    local vt = B.r32(stream)
    B.log(string.format("lab_meta:   vtable %08x: [0]=%08x [4]=%08x [8]=%08x [c]=%08x [10]=%08x [14]=%08x", vt, B.r32(vt), B.r32(vt + 4), B.r32(vt + 8), B.r32(vt + 12), B.r32(vt + 16), B.r32(vt + 20)))
    local size = B.call(B.r32(vt + 4), stream)
    B.log(string.format("lab_meta:   size -> %d (0x%x)", size, size))
    if size > 0 and size < 100000 then
      local buf = B.alloc(size + 1)
      local got = B.call(B.r32(vt + 0x14), stream, buf, 1, size)
      B.w8(buf + size, 0)
      B.log(string.format("lab_meta:   read -> %d: %q", got, B.str(buf):sub(1, 90)))
      B.free(buf)
    end
    B.call(B.r32(vt), stream, 1)
  end
  B.free(p)
end
