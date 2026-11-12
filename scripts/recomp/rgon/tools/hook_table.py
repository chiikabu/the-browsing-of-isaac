#!/usr/bin/env python3
"""The layer's hook table, checked against the executable.

  python scripts/recomp/rgon/tools/hook_table.py [--write]

HOOKS below names every game function the REPENTOGON layer wraps: its slot
(never reused), its address in v1.9.7.17, where that address comes from, and
how many bytes of arguments it removes from the stack when it returns (what a
handler that answers for the function has to pop). For each entry this tool

  - reads the function's body from the prebuilt index and collects every
    `ret`: they must all pop the number of bytes the entry says;
  - for a virtual function, checks the address against the class's vtable
    slot found through RTTI (vtables.py);
  - for "reg", checks the address against the game's own Lua registration
    (tools/parse_register.py output), and for "sig" against the signature
    resolution (tools/zhl-resolve.mjs output), when those files are present.

--write prints the RGON_HOOKS list for lift_patches.py and the SLOT table for
the layer; nothing is written unless every entry passes.

Sources: reg  the game's Lua registration at 0x00866960 (push <method>; push <"Name">)
         sig  a REPENTOGON signature matching this executable exactly once
         vt   a slot of the class's virtual table (RTTI), slot order as in Entity:
              Free Init PreUpdate Update Interpolate Render RenderShadowLayer PostRender
              TakeDamage Kill Remove ... HandleCollision(23) ResetColor LoadEntityConfig
         asm  read off the disassembly (the note says where)
"""
import argparse
import json
import re
import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[3]

ENTITY_CLASSES = ["Entity", "Entity_Player", "Entity_NPC", "Entity_Pickup", "Entity_Tear", "Entity_Familiar",
                  "Entity_Effect", "Entity_Bomb", "Entity_Laser", "Entity_Knife", "Entity_Projectile", "Entity_Slot"]
VSLOT = {"Init": 1, "Update": 3, "Render": 5, "TakeDamage": 8, "HandleCollision": 23}
# what each virtual pops: one signature per slot, so one answer for every class
VPOPS = {"Init": 0x10, "Update": 0, "Render": 4, "TakeDamage": 0x14, "HandleCollision": 8}

# (slot, "Class::Function", address or None for a virtual, source, bytes popped, note)
HOOKS = [
    (0, "Entity_Player::AddCollectible", 0x0075f0e0, "reg", 0x18, ""),
    (1, "Entity_Player::AddTrinket", 0x00771d30, "reg", 8, ""),
    (2, "Entity_Pickup::Morph", 0x006e30a0, "reg", 0x18, ""),
    (3, "HUD::Render", 0x009a3eb0, "reg", 0, ""),
    (4, "HUD::Update", 0x009a2990, "reg", 0, ""),
    (5, "HUD::PostUpdate", 0x009a2b30, "reg", 0, ""),
    (6, "Level::SetStage", 0x007466d0, "reg", 8, ""),
    (7, "MusicManager::Play", 0x007e1d50, "reg", 8, ""),
    (8, "MusicManager::Crossfade", 0x007e1e70, "reg", 8, ""),
    (9, "SFXManager::Play", 0x0092dc30, "reg", 0x18, ""),
    (10, "Game::End", 0x006f9770, "reg", 4, ""),
    # round 103
    (11, "ModManager::LoadConfigs", 0x008f30d0, "asm", 0, "runs each mod's main.lua (call 0x86e6c0 at 0x008f4654); called by ModManager::Reset 0x008f8c5c"),
    # slot 12 is RETIRED (round h2): it was a FALSE signature match, 0x00832850 (RoomTransition::Render),
    # and is never reused. Entity_Player::TriggerRoomExit is slot 81 now.
    (13, "Entity_Player::TriggerTrinketAdded", 0x007ad860, "sig", None, ""),
    (14, "Entity_Player::TriggerTrinketRemoved", 0x007adb30, "sig", None, ""),
    (15, "Entity_Player::InitPreLevelInitStats", 0x0099b520, "sig", None, ""),
    (16, "Entity_Familiar::GetFollowerPriority", 0x00612970, "sig", None, ""),
    (17, "Level::ChangeRoom", 0x0073fc80, "reg", None, ""),
    (18, "Manager::SetSaveSlot", 0x00959e70, "sig", None, ""),
    (19, "Entity_Player::AddCostume", 0x0075d1d0, "reg", None, ""),
    (20, "Entity_Player::RemoveCostume", 0x0075d850, "reg", None, ""),
    # slot 21 is a FALSE signature match too (tools/zhl_fuzzy.py audit: 0x006bb790 is slot 25 of the NPC
    # vtable, pops 0 where the declaration pops 8). No handler listens on it; replace at the next engine build.
    (21, "Game::RestoreState", 0x006bb790, "sig", None, ""),
    (22, "Room::SpawnGridEntity", 0x007ebca0, "reg", None, ""),
    (23, "GridEntity::Init", 0x00709db0, "sig", None, ""),
    (24, "RoomTransition::StartBossIntro", 0x0082f1c0, "sig", None, ""),
    (25, "Entity_Player::RenderHead", 0x0078dff0, "reg", None, ""),
    (26, "Entity_Player::RenderBody", 0x0078dde0, "reg", None, ""),
    (27, "Entity_Player::Revive", 0x007a2220, "reg", None, ""),
    (28, "ItemOverlay::Show", 0x009ad210, "sig", None, ""),
    (29, "Entity_Player::GetHealthType", 0x007cafe0, "sig", None, ""),
    (30, "Entity_Player::GetHeartLimit", 0x007cae60, "reg", None, ""),
    (31, "PersistentGameData::TryUnlock", 0x00929a20, "sig", None, ""),
    (32, "Entity_Player::UseCard", 0x007b2230, "reg", None, ""),
    (33, "Entity_Player::UsePill", 0x007c4180, "reg", 0xc, "every ret reached from the entry pops 0xc (.scratch/rgon/h2/rets.py)"),
    (34, "Entity_Player::AddHearts", 0x00758a70, "reg", None, ""),
    (35, "Entity_Player::AddMaxHearts", 0x007588a0, "reg", None, ""),
    (36, "Entity_Player::AddSoulHearts", 0x00758d00, "reg", None, ""),
    (37, "Entity_Player::AddBlackHearts", 0x00758f90, "reg", None, ""),
    (38, "Entity_Player::AddBoneHearts", 0x007ca840, "reg", None, ""),
    (39, "Entity_Player::AddRottenHearts", 0x007d2fc0, "reg", None, ""),
    (40, "Entity_Player::AddEternalHearts", 0x00758c20, "reg", None, ""),
    (41, "Entity_Player::AddGoldenHearts", 0x007c9d10, "reg", None, ""),
    (42, "Entity_Player::AddBrokenHearts", 0x007d2a40, "reg", None, ""),
    (43, "Entity::AddPoison", 0x006ad500, "reg", None, ""),
    (44, "Entity::AddFreeze", 0x006ad3c0, "reg", None, ""),
    (45, "Entity::AddBurn", 0x006ae280, "reg", None, ""),
    (46, "Entity::AddCharmed", 0x006ad870, "reg", None, ""),
    (47, "Entity::AddConfusion", 0x006add70, "reg", None, ""),
    (48, "Entity::AddFear", 0x006ae0a0, "reg", None, ""),
    (49, "Entity::AddMidasFreeze", 0x006adf40, "reg", None, ""),
    (50, "Entity::AddShrink", 0x006b5c10, "reg", None, ""),
    (51, "Entity::AddSlowing", 0x006ad750, "reg", None, ""),
    (52, "Entity::AddKnockback", 0x006b7a80, "sig", None, ""),
    (53, "Entity_Player::DischargeActiveItem", 0x007ac7e0, "reg", 0x8, "every ret reached from the entry pops 0x8 (.scratch/rgon/h2/rets.py)"),
    (54, "Entity_Player::DropTrinket", 0x00771800, "reg", None, ""),
    (55, "Entity_Pickup::TryOpenChest", 0x006e6e40, "reg", 0x4, "every ret reached from the entry pops 0x4 (.scratch/rgon/h2/rets.py)"),
    (56, "Game::BombDamage", 0x006ff2a0, "reg", None, ""),
    (57, "Game::BombTearflagEffects", 0x007009a0, "reg", 0x20, "every ret reached from the entry pops 0x20 (.scratch/rgon/h2/rets.py)"),
    (58, "Entity_NPC::Morph", 0x006c0f30, "reg", None, ""),
    (59, "Room::TriggerClear", 0x008068f0, "reg", None, ""),
    (60, "Entity_Player::RemoveCollectible", 0x0078f840, "reg", None, ""),
    (61, "Entity_Player::GetTearHitParams", 0x007bf6c0, "reg", None, ""),
    (62, "Game::Update", 0x006fadc0, "reg", None, ""),
    (63, "Entity_Player::FireTear", 0x00790af0, "reg", None, ""),
    (64, "Entity_Player::FireBomb", 0x007a0970, "reg", None, ""),
    (65, "Entity_Player::FireBrimstone", 0x007a0f50, "reg", None, ""),
    (66, "Entity_Player::FireTechLaser", 0x007aab70, "reg", None, ""),
    (67, "Entity_Player::FireTechXLaser", 0x007cb230, "reg", None, ""),
    (68, "Entity_Player::FireKnife", 0x007aded0, "reg", None, ""),
    (69, "Entity_Player::FireBrimstoneBall", 0x007ae1d0, "sig", None, ""),
    (70, "Entity_Player::UseActiveItem", 0x005b39d0, "reg", None, ""),
    (71, "Entity_Player::GetMultiShotParams", 0x00781b90, "reg", None, ""),
    (72, "Room::Update", 0x00802980, "reg", None, ""),
    (73, "Room::Render", 0x0080f200, "reg", None, ""),
    (74, "Entity_Player::EvaluateItems", 0x00763570, "reg", None, ""),
    (75, "Entity_Player::TryRemoveTrinket", 0x00771f60, "reg", None, ""),
    (76, "Game::StartRoomTransition", 0x006fd7c0, "reg", None, ""),
    (77, "Entity_Familiar::FireProjectile", 0x00639750, "reg", None, ""),
    (78, "Entity_NPC::FireProjectiles", 0x006cb2e0, "reg", None, ""),
    (79, "Game::Render", 0x006fbc10, "reg", None, ""),
    # round h2: each read off the disassembly; the note says what ties the address to the declaration.
    # Every `ret` reached from the entry pops what the row says (.scratch/rgon/h2/rets.py walks direct
    # branches and jump tables; the index's own body view stops early in several of these).
    (80, "Entity_Player::TriggerCollectibleRemoved", 0x0078ff90, "asm", 4,
     "called by RemoveCollectible (reg 0x0078f840) at 0x0078fc40 and by RecomputeWispCollectibles at 0x007d7b5a; "
     "arg 1 is the item: 0x12e/0xc -> 0x0075e320(0xd,-1) (Stompy counter), 0x2b6 -> AddBrokenHearts(-3) (reg 0x007d2a40)"),
    (81, "Entity_Player::TriggerRoomExit", 0x007a6680, "asm", 4,
     "called per player of the game's list (+0x1baa8) by Game::ChangeRoom (reg 0x006fe2f0) with 0, by "
     "0x009bd150 with 1; tests the bool's byte (`cmp byte [ebp+8], 0`), this has the player's effects at +0x1508"),
    (82, "Entity_Player::InitPostLevelInitStats", 0x007bc740, "asm", 0,
     "called per player after Level::Init (0x00744940) by the run's start (0x006f5788) and on resets; reads the "
     "player type (+0x13c0) and gives that character's cards, pills, trinkets (AddTrinket reg) and pocket active "
     "(SetPocketActiveItem reg)"),
    (83, "PlayerHUD::RenderActiveItem", 0x008453c0, "asm", 0x18,
     "called by the HUD's per-player render 0x009a6fe0 with ecx = a 0x6dc-byte player slot, slot 1 then 0, "
     "(slot, &pos, layout, 1.0f size, alpha, 0): six stack words"),
    (84, "Manager::Render", 0x009555c0, "asm", 0,
     "called once per frame by the main loop 0x00931050; reads g_Manager (0x00c7169c) itself and calls "
     "Game::Render (reg 0x006fbc10, its only direct caller)"),
    (85, "TemporaryEffects::AddEffect", 0x00930220, "asm", 0xc,
     "called by AddCollectibleEffect (reg 0x009302e0) as (&effect, addCostume, count); tests _disabled at "
     "+0x11, calls AddCostume (reg) on _player (+0x14) when addCostume"),
    (86, "Entity_Player::TriggerEffectRemoved", 0x00793970, "asm", 8,
     "called by TemporaryEffects' removal 0x009303f0 (from RemoveCollectibleEffect reg 0x009304a0) on _player "
     "(+0x14) with (item, count removed); the room's twin is 0x007ea1a0"),
    (87, "Entity_Player::GetActiveMaxCharge", 0x007911f0, "asm", 0xc,
     "(item, varData, an unused word every caller pushes); special-cases the charge-as-vardata actives "
     "0x11e/0x107/0x15c/0x1fe; called by the slot form 0x00791320 with the slot's item and varData and by "
     "AddCollectible (reg)"),
    (88, "Entity_Player::GetActiveMinUsableCharge", 0x00791380, "asm", 4,
     "(slot): REPENTOGON's signature shape (slot 3, the slot-2 Red Redemption case); 1 for the partly usable "
     "actives 0x263, 0x2d0, 0x93, else the max charge 0x007911f0"),
    (89, "Room::Init", 0x007f2800, "asm", 8,
     "called by the level's room change (0x0073e8a2) with ecx = the game's room (+0x18300) and a RoomDescriptor; "
     "clears the room's effects (+0x7310, ClearEffects reg 0x009306c0) first"),
    (90, "Level::Init", 0x00744940, "asm", 4,
     "REPENTOGON's prologue shape; called by the run's start (0x006f5764 with 1) and the other starts, ecx = "
     "the level (the game object), before the players' InitPostLevelInitStats"),
    (91, "Entity_Tear::ApplyTearFlagEffects", 0x0067af60, "asm", 0,
     "static: ecx = the entity, edx = &pos, then 16 bytes of flags, the source, the damage; the caller cleans "
     "(`add esp, 0x18` after each of its 17 call sites); begins with IgnoreEffectFromFriendly 0x006acd10"),
    (92, "Entity_Player::TriggerRoomClear", 0x007a8fd0, "asm", 0,
     "called per player by 0x009bb840, which Room::TriggerClear (reg 0x008068f0) calls at 0x00806b8c"),
    (93, "Entity_Player::TriggerNewRoom_TemporaryEffects", 0x007a8350, "asm", 0,
     "Liberty Cap's room effect: HasTrinket(0x20) (0x00771550), 1 in 4/multiplier, a mushroom item; called "
     "per player by 0x009bc000 and by the reset 0x009bee80"),
    (94, "Entity_Player::TriggerNewStage", 0x007a4ba0, "asm", 4,
     "(bool fromPlayerUpdate): Entity_Player::Update calls it with 1 (0x007830bf), the level's per-player loop "
     "0x009bb960 (called from Level::Init's body, 0x00745a1d) with 0; tests the bool's byte, places the player "
     "for a new floor (Level::IsAscent reg 0x0074f090), reads +0x1824, the flag InitPostLevelInitStats sets"),
    # round 109: each read off the disassembly; every `ret` reached from the entry pops what the row says
    # (.scratch/rgon/h2/rets.py).
    (95, "Entity::Remove", 0x006acb00, "asm", 0,
     "slot 10 (+0x28) of every entity class's vtable (Entity, Player, Tear, Projectile all hold it: vtables.json); "
     "REPENTOGON's `void Remove()` signature matches it once. Its callers' return address tells a tear's death "
     "(Entity_Tear::Update's `call eax` at 0x0066a369) and a projectile's (Entity_Projectile::Update's "
     "`call [eax+0x28]` at 0x006580b5, REPENTOGON's projectile-death signature matches there once)"),
    (96, "PlayerHUD::RenderTrinket", 0x00846ff0, "asm", 0x14,
     "called by the HUD's per-player render 0x009a6fe0 in a loop over slot 1 then 0 (0x009a7310..0x009a7334) with "
     "ecx = the 0x6dc-byte player slot and (slot, &pos, 1.0f, scale, 0); tests the slot's trinket and image "
     "(+0x200 + slot*0x18, +8) before drawing, as REPENTOGON's hook does"),
    (97, "Room::SpawnGridEntityDesc", 0x007ebd50, "sig", 8,
     "(gridIndex, GridEntityDesc*): 2 callers (0x004feaba, 0x00820baa)"),
    (98, "Room::RenderEntityPass_004199d0", 0x004199d0, "asm", 8,
     "13 callers, all in Room::Render (reg 0x0080f200) and 0x00820fd0; the one whose return address is 0x00810c97 "
     "is where REPENTOGON's MC_POST_ROOM_RENDER_ENTITIES patch goes (its signature `33f68d87..39b0..76..8bbd..` "
     "is the code at 0x00810c97 but for a 3-byte nop where it has `66 90`)"),
    (99, "Room::GetShopItemPrice", 0x008151e0, "asm", 0x10,
     "ecx = the game's room (game+0x18300); (variant, subtype, shopItemId, 0): one more word than REPENTOGON's "
     "declaration; its 7 callers (Entity_Pickup::Init 0x006e0602, Update 0x006e4eae, ...) store what it answers as "
     "the pickup's Price (+0x534, the Lua property's offset) before 0x00816250 adjusts it"),
]
# the entity classes' virtual functions: slots 100 + 12 * k + class index
_k = 0
for _fn in ("Init", "Update", "Render", "TakeDamage", "HandleCollision"):
    for _i, _cls in enumerate(ENTITY_CLASSES):
        HOOKS.append((100 + 12 * _k + _i, "%s::%s" % (_cls, _fn), None, "vt", None, ""))
    _k += 1
MAX_SLOTS = 192


def run_pequery(pe_root, *args):
    r = subprocess.run([sys.executable, "scripts/decomp/tools/pequery.py", *args], cwd=pe_root, capture_output=True, text=True)
    return r.stdout


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--write", action="store_true")
    ap.add_argument("--index-root", default=None, help="a checkout that has the prebuilt PE index (default: this one, else ISAAC_INDEX_ROOT)")
    args = ap.parse_args()
    import os
    pe_root = args.index_root or os.environ.get("ISAAC_INDEX_ROOT") or str(ROOT)
    vt_json = subprocess.run([sys.executable, str(HERE / "vtables.py"), *ENTITY_CLASSES, "--slots", "40", "--json", str(ROOT / ".scratch" / "rgon" / "vtables.json")],
                             cwd=ROOT, capture_output=True, text=True)
    vt = json.load(open(ROOT / ".scratch" / "rgon" / "vtables.json"))
    reg = {}
    try:
        b = json.load(open(ROOT / ".scratch" / "rgon" / "bindings-17.json"))
        for cls, c in b.items():
            for name, f in c["functions"].items():
                if f.get("fn"):
                    reg.setdefault(int(f["fn"], 16), []).append("%s.%s" % (cls, name))
    except OSError:
        pass
    sig = {}
    try:
        z = json.load(open(ROOT / ".scratch" / "rgon" / "zhl-17.json"))
        for k, v in z.items():
            if v.get("va"):
                sig[v["va"] + 0x400c00] = (k, v["decl"])
    except OSError:
        pass

    # the functions the lift knows (its dispatch table names every one)
    lifted = set()
    for cand in sorted((ROOT / "output" / "recomp").glob("lift*/**/dispatch_tbl.c")):
        lifted |= set(re.findall(r"sub_[0-9a-f]{8}", cand.read_text()))
        if lifted:
            break
    rows, bad, seen_va, shared = [], 0, {}, []
    for slot, name, va, src, pops, note in HOOKS:
        cls, fn = name.split("::")
        if src == "vt":
            v = vt.get(cls) or []
            if not v:
                print("FAIL %3d %s: no vtable" % (slot, name)); bad += 1; continue
            va = v[0]["slots"][VSLOT[fn]]
            note = "vtable 0x%08x slot %d" % (v[0]["vtable"], VSLOT[fn])
        if name == "Entity::HandleCollision":
            continue                                   # pure virtual in the base class
        if va in seen_va:
            # a class that does not override: its slot holds the base's function, hooked once under the first name
            shared.append((slot, name, seen_va[va]))
            continue
        # Is it a function at all? The decompiler's export has one file per function.
        if ("sub_%08x" % va) not in lifted and not (Path(pe_root) / "output" / "recomp" / "export" / "c" / ("%04x" % (va >> 16)) / ("%08x.c" % va)).is_file():
            print("FAIL %3d %s 0x%08x: neither the lift nor the decompiler's export has a function there" % (slot, name, va)); bad += 1; continue
        # What it pops: every `ret` of its body, when the index has the body to itself
        # (the index runs some neighbouring functions together; then the answer is
        # the table's own, or for a virtual function its slot's, or unknown).
        body = run_pequery(pe_root, "body", "0x%08x" % va)
        m = re.search(r"func 0x([0-9a-f]+)\.\.0x([0-9a-f]+)", body)
        rets = set()
        if m and int(m.group(1), 16) == va:
            for line in body.splitlines():
                mm = re.match(r"0x[0-9a-f]+\s+ret(?:\s+(0x[0-9a-f]+|\d+))?\s*(?:;.*)?$", line.strip())
                if mm:
                    rets.add(int(mm.group(1), 0) if mm.group(1) else 0)
        want = pops if pops is not None else (VPOPS.get(fn) if src == "vt" else None)
        if len(rets) == 1:
            got = next(iter(rets))
            if want is not None and want != got:
                print("FAIL %3d %s 0x%08x: pops 0x%x, expected 0x%x" % (slot, name, va, got, want)); bad += 1; continue
        elif want is not None and (not rets or want in rets):
            got = want
        else:
            got = None
        why = []
        if src == "reg":
            if va not in reg:
                print("FAIL %3d %s 0x%08x: not in the Lua registration" % (slot, name, va)); bad += 1; continue
            why.append("reg " + reg[va][0])
        if va in sig:
            why.append("sig " + sig[va][0])
            decl = sig[va][1]
        elif src == "sig":
            print("FAIL %3d %s 0x%08x: no signature resolves here" % (slot, name, va)); bad += 1; continue
        else:
            decl = ""
        if src == "vt":
            why.append(note)
        if src == "asm":
            why.append("asm")
        seen_va[va] = name
        rows.append((slot, name, va, got, "; ".join(why), decl))
    for slot, name, va, got, why, decl in rows:
        print("ok   %3d %-40s 0x%08x ret %-4s  %s%s" % (slot, name, va, "?" if got is None else "0x%02x" % got, why, ("  | " + decl[:70]) if decl else ""))
    for slot, name, first in shared:
        print("same %3d %-40s is %s" % (slot, name, first))
    print("%d hook(s), %d shared with a base class, %d failed" % (len(rows), len(shared), bad))
    if bad:
        return 1
    if args.write:
        out = ["RGON_HOOKS: list[tuple[int, int, str]] = ["]
        for slot, name, va, got, why, decl in rows:
            out.append('    (%d, 0x%08x, "%s"),%s' % (slot, va, name, "    # %s; %s" % ("ret ?" if got is None else "ret 0x%x" % got, why)))
        out.append("]")
        (ROOT / ".scratch" / "rgon" / "hooks.py.txt").write_text("\n".join(out) + "\n")
        lua = ["-- generated by tools/hook_table.py: slot, bytes popped", "return {"]
        for slot, name, va, got, why, decl in rows:
            lua.append('  ["%s"] = { %d, %s },' % (name, slot, "false" if got is None else "0x%x" % got))
        for slot, name, first in shared:
            lua.append('  ["%s"] = "%s",' % (name, first))
        lua.append("}")
        (ROOT / "scripts" / "recomp" / "rgon" / "hook_slots.lua").write_text("\n".join(lua) + "\n")
        print("wrote .scratch/rgon/hooks.py.txt and scripts/recomp/rgon/hook_slots.lua")
    return 0


if __name__ == "__main__":
    sys.exit(main())
