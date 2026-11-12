// pack.mjs -- the REPENTOGON-compatible layer as a mod archive:
//
//   node scripts/recomp/rgon/pack.mjs <out.zip>
//
// The layer is a mod named "repentogon" (host_rgon.c looks for
// mods/repentogon/rgon.lua). Its own files are this folder's. One file is not
// ours: REPENTOGON's enums_ex.lua, the table of callback numbers and enum
// values a mod and the layer have to agree on. It is copied unchanged from the
// submodule, and REPENTOGON's licence (GPL-2.0) goes in beside it.
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { zipStore } from '../web/zip.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..', '..', '..');
const rg = join(root, 'third_party', 'REPENTOGON');
const out = process.argv[2];
if (!out) { console.log('usage: node scripts/recomp/rgon/pack.mjs <out.zip>'); process.exit(2); }

const NOTICE = `REPENTOGON (browser)

rgon.lua, its api_*.lua parts, main.lua and metadata.xml are part of The Browsing of Isaac and are
licensed with it (GPL-3.0-or-later). They are not REPENTOGON's code.

enums_ex.lua is REPENTOGON's (https://github.com/TeamREPENTOGON/REPENTOGON),
copied unchanged and licensed under the GNU General Public License version 2;
see LICENSE-REPENTOGON.txt.
`;
const files = [
  ['metadata.xml', readFileSync(join(here, 'metadata.xml'))],
  ['main.lua', readFileSync(join(here, 'main.lua'))],
  ['rgon.lua', readFileSync(join(here, 'rgon.lua'))],
  // the layer's parts (rgon.lua loads them by name) and the hook table api_hooks.lua reads
  ...readdirSync(here).filter((n) => /^api_[a-z_]+\.lua$/.test(n) || n === 'hook_slots.lua').sort().map((n) => [n, readFileSync(join(here, n))]),
  ['enums_ex.lua', readFileSync(join(rg, 'repentogon', 'resources', 'scripts', 'enums_ex.lua'))],
  ['LICENSE-REPENTOGON.txt', readFileSync(join(rg, 'LICENSE'))],
  ['NOTICE.txt', Buffer.from(NOTICE)],
];
const blob = zipStore(files.map(([name, bytes]) => ({ name: `repentogon/${name}`, bytes: new Uint8Array(bytes) })));
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, Buffer.from(await blob.arrayBuffer()));
console.log(`${out}: ${files.length} files, ${files.reduce((n, f) => n + f[1].length, 0)} bytes`);
