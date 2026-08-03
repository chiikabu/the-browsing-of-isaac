/**
 * Pack Steam install into web/emu/isaac.zip for Path B.
 * Usage:
 *   node scripts/pack-isaac-app.mjs              # full English packs + stubs
 *   node scripts/pack-isaac-app.mjs --slim        # small packs only
 */
import { existsSync, mkdirSync, readdirSync, statSync, copyFileSync, writeFileSync, rmSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const game =
  process.env.ISAAC_GAME_DIR ||
  'C:/Program Files (x86)/Steam/steamapps/common/The Binding of Isaac Rebirth';
const slim = process.argv.includes('--slim');
const stage = join(root, '.scratch', 'isaac-app-stage');
const out = join(root, 'web', 'emu', 'isaac.zip');

if (!existsSync(join(game, 'isaac-ng.exe'))) {
  console.error('missing', join(game, 'isaac-ng.exe'));
  process.exit(1);
}
rmSync(stage, { recursive: true, force: true });
mkdirSync(stage, { recursive: true });

function copy(src, dest) {
  mkdirSync(dirname(dest), { recursive: true });
  copyFileSync(src, dest);
}

for (const name of readdirSync(game)) {
  const p = join(game, name);
  if (!statSync(p).isFile()) continue;
  if (/\.(exe|dll)$/i.test(name)) copy(p, join(stage, name));
}
// Prefer Steamless-unpacked PE (no SteamStub .bind DRM). Unpack once with:
//   tools/Steamless/Steamless.CLI.exe path\to\isaac-ng.exe
// and place as tools/isaac-ng.unpacked.exe
const unpacked = join(root, 'tools', 'isaac-ng.unpacked.exe');
if (existsSync(unpacked)) {
  copy(unpacked, join(stage, 'isaac-ng.exe'));
  console.log('using Steamless-unpacked isaac-ng.exe');
}
writeFileSync(join(stage, 'steam_appid.txt'), '250900');
// Offline stubs (prefer over Steam's live steam_api / EOSSDK).
const steamStub = join(root, 'native', 'steam_stub', 'steam_api.dll');
const eosStub = join(root, 'native', 'eos_stub', 'EOSSDK-Win32-Shipping.dll');
if (existsSync(steamStub)) copy(steamStub, join(stage, 'steam_api.dll'));
if (existsSync(eosStub)) copy(eosStub, join(stage, 'EOSSDK-Win32-Shipping.dll'));
// Launcher bat so `cmd /c run.bat` works under Wine (default Path B entry).
writeFileSync(
  join(stage, 'run.bat'),
  [
    '@echo off',
    'cd /d c:\\files',
    'echo START > c:\\files\\runlog.txt',
    'isaac-ng.exe',
    'echo EXIT=%ERRORLEVEL% >> c:\\files\\runlog.txt',
    'echo DONE >> c:\\files\\runlog.txt',
    '',
  ].join('\r\n'),
);
// Do NOT ship Windows ucrtbase/vcruntime/msvcp140 into the app dir — they shadow
// Wine builtins and break CRT forwarding under Boxedwine. Wine 5.0 provides them.
// Remove any that were copied from the Steam install tree above.
for (const s of [
  'ucrtbase.dll',
  'vcruntime140.dll',
  'msvcp140.dll',
  'msvcp140_1.dll',
  'msvcp140_2.dll',
  'concrt140.dll',
  'vccorlib110.dll',
]) {
  const p = join(stage, s);
  if (existsSync(p)) {
    try {
      rmSync(p);
    } catch {
      /* ignore */
    }
  }
}

const scripts = join(game, 'resources', 'scripts');
function walk(dir, rel = '') {
  for (const n of readdirSync(dir)) {
    const s = join(dir, n);
    const r = rel ? rel + '/' + n : n;
    if (statSync(s).isDirectory()) walk(s, r);
    else copy(s, join(stage, 'resources', 'scripts', r));
  }
}
if (existsSync(scripts)) walk(scripts);

const skipLang = new Set([
  'afterbirth_jp.a', 'afterbirth_kr.a', 'afterbirthp_jp.a', 'afterbirthp_kr.a',
  'repentance_de.a', 'repentance_es.a', 'repentance_fr.a', 'repentance_jp.a',
  'repentance_kr.a', 'repentance_ru.a', 'repentance_zh.a',
]);
const slimKeep = new Set(['config.a', 'rooms.a', 'fonts.a', 'animations.a', 'graphics.a', 'readme.txt']);
const packed = join(game, 'resources', 'packed');
if (existsSync(packed)) {
  for (const n of readdirSync(packed)) {
    if (skipLang.has(n)) continue;
    if (slim && !slimKeep.has(n)) continue;
    copy(join(packed, n), join(stage, 'resources', 'packed', n));
  }
}

// ZIP_STORED via python for speed/size honesty
const py = `
import zipfile
from pathlib import Path
stage=Path(r'${stage.replace(/\\/g, '/')}')
out=Path(r'${out.replace(/\\/g, '/')}')
out.parent.mkdir(parents=True, exist_ok=True)
if out.exists(): out.unlink()
with zipfile.ZipFile(out,'w',compression=zipfile.ZIP_STORED,allowZip64=True) as z:
    for p in stage.rglob('*'):
        if p.is_file():
            z.write(p, p.relative_to(stage).as_posix())
print('wrote', out, 'MB', out.stat().st_size/1e6)
`;
const r = spawnSync('python', ['-c', py], { stdio: 'inherit' });
process.exit(r.status || 0);
