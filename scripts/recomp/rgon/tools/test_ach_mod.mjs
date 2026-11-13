// test_ach_mod.mjs -- the content mod test_ach.lua checks against (round 112):
// achievements a mod names, and the game's content that waits for them.
//
//   node scripts/recomp/rgon/tools/test_ach_mod.mjs <out.zip>
//
// Folder "zz-r112-ach" ("r112 ach test"): four achievements (R112_CHAR, R112_ITEM,
// R112_CARD, R112_HIDE); a character locked by R112_CHAR, a hidden one shown by
// R112_HIDE; a collectible (in the treasure pool) and a trinket locked by
// R112_ITEM; a card and a pill effect locked by R112_CARD; a challenge that needs
// R112_CHAR. Nothing of the game's is replaced. The graphics are the game's own.
import { writeFileSync } from 'node:fs';
import { zipStore } from '../../web/zip.mjs';

const out = process.argv[2];
if (!out) { console.log('usage: node scripts/recomp/rgon/tools/test_ach_mod.mjs <out.zip>'); process.exit(2); }

const FILES = {
  'metadata.xml': `<?xml version="1.0" encoding="UTF-8"?>
<metadata>
  <name>r112 ach test</name>
  <directory>zz-r112-ach</directory>
  <description>Round 112 test content: named achievements.</description>
  <version>1</version>
</metadata>
`,
  'main.lua': `local m = RegisterMod("r112 ach test", 1)
Isaac.DebugString("r112 ach test: loaded")
`,
  'content/achievements.xml': `<achievements gfxroot="gfx/ui/achievement/">
  <achievement name="R112_CHAR" text="r112 char" gfx="achievement_magdalene.png" />
  <achievement name="R112_ITEM" text="r112 item" gfx="achievement_magdalene.png" />
  <achievement name="R112_CARD" text="r112 card" gfx="achievement_magdalene.png" />
  <achievement name="R112_HIDE" text="r112 hide" gfx="achievement_magdalene.png" hidden="true" />
</achievements>
`,
  'content/players.xml': `<players root="gfx/characters/costumes/" portraitroot="gfx/ui/stage/" nameimageroot="gfx/ui/boss/">
  <player name="R112Char" skin="character_001_isaac.png" hp="6" achievement="R112_CHAR" />
  <player name="R112Hidden" hidden="true" skin="character_001_isaac.png" hp="6" hideachievement="R112_HIDE" />
</players>
`,
  'content/items.xml': `<items gfxroot="gfx/items/" version="1">
  <passive name="R112 Item" description="r112" gfx="Collectibles_001_TheSadOnion.png" quality="0" achievement="R112_ITEM" />
  <trinket name="R112 Trinket" description="r112" gfx="Trinket_001_SwallowedPenny.png" achievement="R112_ITEM" />
</items>
`,
  'content/itempools.xml': `<ItemPools>
  <Pool Name="treasure">
    <Item Name="R112 Item" Weight="1" DecreaseBy="1" RemoveOn="0.1" />
  </Pool>
</ItemPools>
`,
  'content/pocketitems.xml': `<pocketitems>
  <card name="R112 Card" description="r112" hud="R112 Card" mimiccharge="3" pickup="8" achievement="R112_CARD" />
  <pilleffect name="R112 Pill" description="r112" class="1" mimiccharge="2" achievement="R112_CARD" />
</pocketitems>
`,
  'content/challenges.xml': `<challenges version="1">
  <challenge name="R112 Challenge" playertype="0" achievements="R112_CHAR" endstage="1" />
</challenges>
`,
};
const enc = new TextEncoder();
const blob = zipStore(Object.entries(FILES).map(([name, text]) => ({ name: `zz-r112-ach/${name}`, bytes: enc.encode(text) })));
writeFileSync(out, Buffer.from(await blob.arrayBuffer()));
console.log(`wrote ${out}: ${Object.keys(FILES).length} files`);
