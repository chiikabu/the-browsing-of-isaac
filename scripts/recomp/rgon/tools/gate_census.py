"""gate_census.py -- what the catalogue's mods use of REPENTOGON, and what of it the layer has.

  python -I scripts/recomp/rgon/tools/gate_census.py <catalogue dir> <implemented.txt> [out.json]

<catalogue dir> holds catalogue.json and m/<id>.<n>.bin (a mod's zip in parts).
<implemented.txt> is the layer's own list, from a running engine: the lines of
lab_names.lua ("I Class.Name", "C <callback id>").

A name is REPENTOGON-only when REPENTOGON registers it (a `{ "Name", Lua_... }`
row in its sources, or a callback or global of enums_ex.lua and its docs) and
neither the executable nor the game's own scripts contain it. Methods are
matched by name without their class, as tools/coverage.mjs does: read a row as
a list of what to look at, not as proof.

Per mod: how often it says REPENTOGON, whether it looks unable to run without
it (a `not REPENTOGON` test), the REPENTOGON-only names it uses and the ones
the layer lacks. Then the missing names by the number of mods that use them.
"""
import io
import json
import os
import re
import sys
import zipfile
from collections import Counter

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', '..'))
RG = os.path.join(ROOT, 'third_party', 'REPENTOGON')
GAME = os.environ.get('ISAAC_GAME_DIR', 'C:/Program Files (x86)/Steam/steamapps/common/The Binding of Isaac Rebirth')
IDENT = re.compile(r'[A-Za-z_][A-Za-z0-9_]{2,}')

GLOBALS = """ImGui XMLData EntityConfig RoomConfig RoomConfigHolder PersistentGameData MenuManager MainMenu CharacterMenu
StatsMenu TitleMenu SaveMenu OptionsMenu ModsMenu SpecialSeedsMenu PauseMenu Console DebugRenderer ProceduralItemManager
BossPoolManager ItemOverlay RoomTransition NightmareScene StageTransition Minimap Ambush ScoreSheet DailyChallenge Debug
Beam Capsule GenericPrompt LootList WeightedOutcomePicker CompletionWidget HistoryHUD LevelGenerator
EntitySaveStateManager ColorParams FXParams SourceQuad DestinationQuad BestiaryMenu ChallengeMenu CollectionMenu
ControllerSelectMenu CustomChallengeMenu CutscenesMenu DailyChallengeMenu KeyConfigMenu JoinGameMenu BonusRoundMenu
OnlineLobbyMenu OnlineMenu Renderer RailManager NullFrame Backdrop Camera PlayerManager MultiShotParams""".split()


def walk(d, ext):
    for base, _, names in os.walk(d):
        for n in names:
            if n.lower().endswith(ext):
                yield os.path.join(base, n)


def read(p):
    with io.open(p, encoding='utf-8', errors='replace') as f:
        return f.read()


def main():
    cat_dir, impl_path = sys.argv[1], sys.argv[2]
    out = sys.argv[3] if len(sys.argv) > 3 else None
    rg_fns = set()
    for f in walk(os.path.join(RG, 'repentogon'), '.cpp'):
        for m in re.finditer(r'\{\s*"([A-Za-z_][A-Za-z0-9_]*)"\s*,\s*[A-Za-z_:][A-Za-z0-9_:]*\s*\}', read(f)):
            rg_fns.add(m.group(1))
    enums = read(os.path.join(RG, 'repentogon', 'resources', 'scripts', 'enums_ex.lua'))
    rg_cbs = {m.group(1): int(m.group(2)) for m in re.finditer(r'\b(MC_[A-Z0-9_]+)\s*=\s*(\d+)', enums)}
    vanilla = set()
    with open(os.path.join(ROOT, 'tools', 'isaac-ng.unpacked.exe'), 'rb') as f:
        vanilla.update(IDENT.findall(f.read().decode('latin1')))
    for f in walk(os.path.join(GAME, 'resources', 'scripts'), '.lua'):
        vanilla.update(IDENT.findall(read(f)))
    only_fns = {n for n in rg_fns if n not in vanilla}
    only_cbs = {n: i for n, i in rg_cbs.items() if n not in vanilla}
    only_globals = {g for g in GLOBALS if g not in vanilla}

    have_names, have_classes, have_ids = set(), set(), set()
    for line in read(impl_path).splitlines():
        if line.startswith('I '):
            full = line[2:].strip()
            have_names.add(full.split('.')[-1])
            have_classes.add(full.split('.')[0])
        elif line.startswith('C '):
            have_ids.add(int(line[2:]))

    cat = json.load(io.open(os.path.join(cat_dir, 'catalogue.json'), encoding='utf-8'))
    mods = cat.get('mods', cat)
    rows = []
    miss_fn, miss_cb, miss_gl = Counter(), Counter(), Counter()
    for m in mods:
        blob = b''
        try:
            for i in range(m.get('parts') or 1):
                with open(os.path.join(cat_dir, 'm', '%s.%d.bin' % (m['id'], i)), 'rb') as f:
                    blob += f.read()
            z = zipfile.ZipFile(io.BytesIO(blob))
        except (OSError, zipfile.BadZipFile):
            rows.append({'id': m['id'], 'error': 'no zip here (a packed mod?)'})
            continue
        mentions = hard = 0
        fns, cbs, gls = set(), set(), set()
        for name in z.namelist():
            if not name.lower().endswith('.lua'):
                continue
            t = z.read(name).decode('utf-8', 'replace')
            mentions += len(re.findall(r'\bREPENTOGON\b', t))
            hard += len(re.findall(r'\bnot\s+REPENTOGON\b|\bREPENTOGON\s*==\s*nil\b', t))
            fns.update(n for n in re.findall(r'[:.]([A-Za-z_][A-Za-z0-9_]*)\s*\(', t) if n in only_fns)
            cbs.update(n for n in re.findall(r'\bMC_[A-Z0-9_]+\b', t) if n in only_cbs)
            gls.update(g for g in re.findall(r'\b([A-Z][A-Za-z]+)\s*[.:(]', t) if g in only_globals)
        mfn = sorted(n for n in fns if n not in have_names)
        mcb = sorted(n for n in cbs if only_cbs[n] not in have_ids)
        mgl = sorted(g for g in gls if g not in have_classes)
        for n in mfn:
            miss_fn[n] += 1
        for n in mcb:
            miss_cb[n] += 1
        for n in mgl:
            miss_gl[n] += 1
        rows.append({'id': m['id'], 'name': m.get('name'), 'mentions': mentions, 'hard': hard,
                     'uses': len(fns) + len(cbs) + len(gls), 'missing': mfn + mcb + mgl,
                     'fns': sorted(fns), 'cbs': sorted(cbs), 'globals': sorted(gls)})
    using = [r for r in rows if r.get('uses') or r.get('mentions')]
    full = [r for r in using if r.get('uses') and not r['missing']]
    gaps = [r for r in using if r['missing']]
    none = [r for r in using if not r.get('uses')]
    print('%d mods in the catalogue; %d say REPENTOGON or use a name only it has' % (len(rows), len(using)))
    print('  %d use names the layer has, all of them' % len(full))
    print('  %d use at least one name the layer lacks' % len(gaps))
    print('  %d say REPENTOGON and use none of its names' % len(none))
    print('layer: %d names, %d callbacks; REPENTOGON-only: %d function names, %d callbacks, %d globals'
          % (len(have_names), len(have_ids), len(only_fns), len(only_cbs), len(only_globals)))
    for title, sel in (('all there', full), ('gaps', gaps), ('says REPENTOGON, uses nothing of it', none)):
        print('\n== %s' % title)
        for r in sorted(sel, key=lambda r: (len(r['missing']), r['id'])):
            print('  %-44s says %3d  not-tests %2d  uses %3d  lacks %3d  %s' % (
                r['id'][:44], r['mentions'], r['hard'], r['uses'], len(r['missing']), ' '.join(r['missing'][:8])))
    print('\n== missing names by the number of mods using them')
    allm = [(c, n, 'fn') for n, c in miss_fn.items()] + [(c, n, 'cb') for n, c in miss_cb.items()] + [(c, n, 'global') for n, c in miss_gl.items()]
    for c, n, k in sorted(allm, reverse=True)[:60]:
        print('  %3d  %-6s %s' % (c, k, n))
    if out:
        json.dump({'rows': rows}, io.open(out, 'w', encoding='utf-8'), indent=1)


main()
