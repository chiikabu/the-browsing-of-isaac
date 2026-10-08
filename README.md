<div align="center">

<img src="docs/media/banner.webp" alt="The Browsing of Isaac" width="100%">

**The Binding of Isaac: Repentance+, playable in a browser tab.**

[![Play](https://img.shields.io/badge/PLAY-tboi.online-b03a2e?style=for-the-badge&labelColor=1d1512)](https://tboi.online)
[![Stars](https://img.shields.io/github/stars/chiikabu/the-browsing-of-isaac?style=for-the-badge&logo=github&color=d7c9a7&labelColor=1d1512)](https://github.com/chiikabu/the-browsing-of-isaac/stargazers)
[![Last commit](https://img.shields.io/github/last-commit/chiikabu/the-browsing-of-isaac?style=for-the-badge&color=7d7263&labelColor=1d1512)](https://github.com/chiikabu/the-browsing-of-isaac/commits/main)

<img src="docs/media/gameplay.webp" alt="A run through the Basement: fights, the treasure room and the boss" width="800">

</div>

This is the real Repentance+ game code, recompiled from the Windows executable
to WebAssembly. It's not a remake and not an emulator, so every item, synergy
and bug works the way it does on PC.

It runs on desktop and on phones, keeps your saves in the browser, and can
install mods from the game's own MODS menu.

## On a phone

<p align="center"><img src="docs/media/phones.webp" width="800" alt="Playing upright and sideways on a phone"></p>

There are no extra buttons on screen; you play by touching the game.

| | |
| --- | --- |
| Move, shoot | Left thumb, right thumb |
| Active item, card or pill, bomb | Tap it in the bar under the room |
| Swap items | Tap the small second item |
| Drop a card or trinket | Hold it |
| Map | Tap the minimap, or hold it to peek |
| Pause | The paper icon next to the map |
| Menus | Tap, swipe to scroll, two fingers to go back |

Vibration follows the game's Rumble option.

## On a keyboard

| Key | |
| --- | --- |
| <kbd>W</kbd> <kbd>A</kbd> <kbd>S</kbd> <kbd>D</kbd> | Move |
| <kbd>←</kbd> <kbd>↑</kbd> <kbd>→</kbd> <kbd>↓</kbd> | Shoot |
| <kbd>Space</kbd> | Active item |
| <kbd>Q</kbd> | Card or pill |
| <kbd>E</kbd> | Bomb |
| <kbd>Ctrl</kbd> | Swap, hold to drop |
| <kbd>Tab</kbd> | Map |
| <kbd>Esc</kbd> | Pause |
| <kbd>F</kbd> | Fullscreen |

<p align="center"><img src="docs/media/menus.webp" width="640" alt="Loading, the title screen and the main menu"></p>

## Mods

<p align="center"><img src="docs/media/mods.webp" width="640" alt="Installing External Item Descriptions from the MODS screen, then using it in a run"></p>

Mods from the Steam Workshop run here too, Lua and all. Open the game's
**MODS** screen and click **MOD BROWSER** (press <kbd>B</kbd>, or tap it on a
phone): search the catalogue, read what each mod does, and install it. The game
restarts with the mod loaded. A mod you already have can be added from a
`.zip`.

## Saves

Saves stay in the browser you play in. **EDIT FILE** on the file select screen
exports a save or imports one, including a `.dat` save from PC.

## Browsers

Chrome, Edge and other Chromium browsers, on desktop or Android. If your browser
can't run it, the page says so.

## Building it yourself

You need your own copy of the game; this repository has no game files in it.
[docs/DEVELOPING.md](docs/DEVELOPING.md) covers the build.

## Star history

<a href="https://www.star-history.com/#chiikabu/the-browsing-of-isaac&Date">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=chiikabu/the-browsing-of-isaac&type=Date&theme=dark">
    <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=chiikabu/the-browsing-of-isaac&type=Date">
    <img alt="Star history" src="https://api.star-history.com/svg?repos=chiikabu/the-browsing-of-isaac&type=Date" width="640">
  </picture>
</a>

## Credits

- Ported by shisa.
- *The Binding of Isaac: Repentance+* is by Edmund McMillen and Nicalis.
- The loading screen dance is the [Specialist dance](https://tenor.com/view/isaac-tboi-dance-gif-7352492888219360785) by dazlex.
- Function signatures from [REPENTOGON](https://github.com/TeamREPENTOGON/REPENTOGON).

*The Binding of Isaac* belongs to Nicalis, Inc. and Edmund McMillen. This is a fan
project, not affiliated with or endorsed by them.
