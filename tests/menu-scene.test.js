/**
 * tests/menu-scene.test.js
 *
 * Behavioural coverage for web/js/menu-scene.js — the presentation layer that
 * turns native Update-slice menu state (menuState23a74 @ Game+0x23a74 and the
 * generic-prompt fields) plus the game's REAL mounted resources into draw
 * commands.
 *
 * Every assertion below runs against the actual bytes of the extracted game
 * instance under .scratch/game-instance/resources (gitignored, local evidence
 * only). If that tree is absent the suite skips with an explicit message
 * rather than asserting against fabricated fixtures — a fixture-backed parser
 * test would prove nothing about the real format.
 *
 * NOTE: menu-scene.js is a presentation layer, not decompiler output. These
 * tests verify (a) the file-format parsers against real bytes and (b) the
 * state -> draw-list mapping. They make NO claim about PE fidelity of the
 * layout: the fabricated parts are asserted only for self-consistency, and are
 * tagged with the same convention letters the module documents.
 */

import { test, describe, before } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import {
  createMenuScene,
  parseBmFontBinary,
  parseAnm2,
  parseXml,
  anm2Composition,
  anm2Animation,
  anm2FrameAt,
  layoutBmFontText,
  readPngSize,
  normalizeMenuState,
  INTERNAL_WIDTH,
  INTERNAL_HEIGHT,
  ANM2_UNIT_SCALE,
  MENU_SLOTS,
  BMF_CHAR_RECORD_SIZE,
} from '../web/js/menu-scene.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '..');
const RESOURCES = path.join(REPO, '.scratch', 'game-instance', 'resources');

const FNT = path.join(RESOURCES, 'font', 'upheaval.fnt');
const ANM2 = path.join(RESOURCES, 'gfx', 'ui', 'main menu', 'titlemenu.anm2');

const HAVE_RESOURCES = fs.existsSync(FNT) && fs.existsSync(ANM2);
const SKIP = HAVE_RESOURCES
  ? false
  : `real game resources not present at ${RESOURCES} ` +
    '(expected font/upheaval.fnt and "gfx/ui/main menu/titlemenu.anm2"); ' +
    'extract the instance zip to run the menu-scene suite';

/** Node-side readFile injection: the module is browser code, fs stays out here. */
const readFile = (p) => new Uint8Array(fs.readFileSync(p));

/* =========================================================================
 * 1. BMFont BINARY parser vs the real bytes of resources/font/upheaval.fnt
 * ======================================================================= */

describe('BMFont binary parser (real upheaval.fnt)', { skip: SKIP }, () => {
  let bytes;
  let font;
  before(() => {
    bytes = readFile(FNT);
    font = parseBmFontBinary(bytes);
  });

  test('magic and version are read from the file, not assumed', () => {
    assert.equal(String.fromCharCode(bytes[0], bytes[1], bytes[2]), 'BMF');
    assert.equal(bytes[3], 3);
    assert.equal(font.version, 3);
  });

  test('block table matches the real file layout', () => {
    /* type, declared size, byte offset of the type tag. Read out of the file
       itself: 'BMF'+ver = 4 bytes, then (u8 type, i32 size, body). */
    assert.deepEqual(font.blocks.map((b) => [b.type, b.size, b.offset]), [
      [1, 27, 4],   // info
      [2, 15, 36],  // common — the format's fixed 15-byte block
      [3, 15, 56],  // pages — one 15-byte NUL-terminated name
      [4, 21200, 76], // chars — 21200 / 20 == 1060 records
    ]);
    /* No kerning block: the chars block ends exactly at EOF. */
    assert.equal(font.blocks.some((b) => b.type === 5), false);
    assert.equal(font.kerningCount, 0);
    assert.equal(font.bytesConsumed, bytes.length);
    assert.equal(bytes.length, 21281);
  });

  test('info block (1) field-by-field', () => {
    assert.equal(font.info.fontSize, -20); // negative == "match char height"
    assert.equal(font.info.bitField, 0x40);
    assert.equal(font.info.unicode, true); // high-bit-first reading
    assert.equal(font.info.smooth, false);
    assert.equal(font.info.italic, false);
    assert.equal(font.info.bold, false);
    /* 0x40 is a *reserved* bit under the low-bit-first reading, which is why
       high-bit-first is the reading this file supports. */
    assert.equal(font.info.bitFieldLsbFirst.unicode, false);
    assert.equal(font.info.charSet, 0);
    assert.equal(font.info.stretchH, 100);
    assert.equal(font.info.aa, 1);
    assert.deepEqual(
      [font.info.paddingUp, font.info.paddingRight, font.info.paddingDown, font.info.paddingLeft],
      [0, 0, 0, 0],
    );
    assert.equal(font.info.spacingHoriz, 1);
    assert.equal(font.info.spacingVert, 1);
    assert.equal(font.info.outline, 0);
    assert.equal(font.info.fontName, 'Upheaval Pro');
    /* 14 fixed bytes + NUL-terminated name == the declared 27. */
    assert.equal(14 + font.info.fontName.length + 1, 27);
  });

  test('common block (2) field-by-field, and it agrees with the page PNG', () => {
    assert.equal(font.common.lineHeight, 18);
    assert.equal(font.common.base, 15);
    assert.equal(font.common.scaleW, 512);
    assert.equal(font.common.scaleH, 512);
    assert.equal(font.common.pages, 1);
    assert.equal(font.common.packed, false);
    assert.equal(font.common.alphaChnl, 0); // glyph lives in alpha
    assert.deepEqual(
      [font.common.redChnl, font.common.greenChnl, font.common.blueChnl],
      [4, 4, 4], // "one"
    );
    /* Independent cross-check: the declared sheet size must equal the real
       PNG's IHDR dimensions. */
    const png = readPngSize(readFile(path.join(RESOURCES, 'font', 'upheaval_0.png')));
    assert.deepEqual([png.width, png.height], [font.common.scaleW, font.common.scaleH]);
  });

  test('pages block (3) names the page file (note the case difference on disk)', () => {
    assert.equal(font.pages.length, 1);
    assert.equal(font.pages[0], 'Upheaval_0.png');
    /* The .fnt says "Upheaval_0.png"; the extracted tree spells it lowercase.
       The scene's case-insensitive resolver is what bridges that. */
    assert.equal(fs.existsSync(path.join(RESOURCES, 'font', 'upheaval_0.png')), true);
  });

  test('chars block (4): 1060 records of 20 bytes, exact values for space/!/A', () => {
    assert.equal(BMF_CHAR_RECORD_SIZE, 20);
    assert.equal(font.charCount, 1060);
    assert.equal(font.charCount * BMF_CHAR_RECORD_SIZE, 21200);
    assert.equal(font.chars.size, 1060);

    assert.deepEqual(font.chars.get(32), {
      id: 32, x: 48, y: 26, width: 1, height: 1,
      xoffset: 0, yoffset: 0, xadvance: 5, page: 0, chnl: 15,
    });
    assert.deepEqual(font.chars.get(33), {
      id: 33, x: 507, y: 226, width: 4, height: 10,
      xoffset: 0, yoffset: 5, xadvance: 5, page: 0, chnl: 15,
    });
    assert.deepEqual(font.chars.get(65), {
      id: 65, x: 348, y: 285, width: 11, height: 10,
      xoffset: 0, yoffset: 5, xadvance: 12, page: 0, chnl: 15,
    });

    /* Unicode font: the id range runs well past Latin-1. */
    const ids = [...font.chars.keys()];
    assert.equal(Math.min(...ids), 32);
    assert.equal(Math.max(...ids), 8595);
  });

  test('every glyph rect lies inside the declared 512x512 page', () => {
    for (const g of font.chars.values()) {
      assert.ok(g.page < font.common.pages, `glyph ${g.id} page ${g.page} out of range`);
      assert.ok(g.x >= 0 && g.y >= 0, `glyph ${g.id} has a negative origin`);
      assert.ok(
        g.x + g.width <= font.common.scaleW && g.y + g.height <= font.common.scaleH,
        `glyph ${g.id} rect ${g.x},${g.y},${g.width},${g.height} escapes the page`,
      );
    }
  });

  test('the same parser handles the other real fonts in the tree', () => {
    /* pftempestasevencondensed.fnt is the one font here that DOES carry a
       kerning block (5) — it exercises the branch upheaval never reaches. */
    const t = parseBmFontBinary(readFile(path.join(RESOURCES, 'font', 'pftempestasevencondensed.fnt')));
    assert.equal(t.info.fontName, 'PF Tempesta Seven Condensed');
    assert.equal(t.charCount, 303);
    assert.equal(t.kerningCount, 25);
    assert.equal(t.kernings.size, 25);
    assert.ok(t.blocks.some((b) => b.type === 5), 'kerning block must be present');

    const tm = parseBmFontBinary(readFile(path.join(RESOURCES, 'font', 'teammeatfont16bold.fnt')));
    assert.equal(tm.common.lineHeight, 25);
    assert.equal(tm.common.base, 22);
    assert.equal(tm.charCount, 251);
  });

  test('text layout uses the real metrics (advance and baseline offsets)', () => {
    const laid = layoutBmFontText(font, 'A A', { x: 10, y: 20, scale: 1 });
    /* 'A' w=11 h=10 xoff=0 yoff=5 adv=12 ; ' ' w=1 h=1 adv=5.
       Space has a 1x1 rect so it is emitted; the second 'A' pen is 10+12+5. */
    assert.equal(laid.glyphs.length, 3);
    assert.deepEqual(laid.glyphs[0].src, [348, 285, 11, 10]);
    assert.deepEqual(laid.glyphs[0].dst, [10, 25, 11, 10]);
    assert.deepEqual(laid.glyphs[2].dst, [27, 25, 11, 10]);
    assert.equal(laid.width, 29); // 12 + 5 + 12
    assert.equal(laid.height, font.common.lineHeight);

    const scaled = layoutBmFontText(font, 'A', { x: 0, y: 0, scale: 2 });
    assert.deepEqual(scaled.glyphs[0].dst, [0, 10, 22, 20]);
  });

  test('rejects a text .fnt and a truncated block instead of guessing', () => {
    assert.throws(() => parseBmFontBinary(new Uint8Array([0x69, 0x6e, 0x66, 0x6f])), /bad magic/);
    const bad = bytes.slice(0, 100); // chars block declares 21200 bytes
    assert.throws(() => parseBmFontBinary(bad), /past EOF/);
  });
});

/* =========================================================================
 * 2. .anm2 parser vs the real titlemenu.anm2
 * ======================================================================= */

describe('anm2 parser (real titlemenu.anm2)', { skip: SKIP }, () => {
  let doc;
  before(() => {
    doc = parseAnm2(fs.readFileSync(ANM2, 'utf8'));
  });

  test('root element, Info and DefaultAnimation', () => {
    /* The real root is <AnimatedActor>, NOT <Anm2>. */
    const raw = parseXml(fs.readFileSync(ANM2, 'utf8'));
    assert.equal(raw.children[0].name, 'AnimatedActor');
    assert.equal(doc.info.fps, 30);
    assert.equal(doc.info.version, '3');
    assert.equal(doc.defaultAnimation, 'Idle');
  });

  test('spritesheets and layers', () => {
    assert.deepEqual([...doc.spritesheets], [[0, 'TitleMenu.png'], [1, 'logo.png']]);
    assert.deepEqual([...doc.layers].map(([id, l]) => [id, l.name, l.spritesheetId]), [
      [0, 'Background', 0],
      [1, 'Drawing', 0],
      [2, 'Logo', 1],
      [3, 'LogoShadow', 1],
    ]);
  });

  test('animation list, frame counts and per-layer delay totals', () => {
    assert.equal(doc.animations.length, 1);
    const idle = doc.animations[0];
    assert.equal(idle.name, 'Idle');
    assert.equal(idle.frameNum, 40);
    assert.equal(idle.loop, true);
    assert.equal(idle.rootFrames.length, 1);
    assert.equal(idle.layerAnimations.length, 4);

    /* [document order, layerId, frame count, summed Delay] */
    assert.deepEqual(
      idle.layerAnimations.map((la) => [la.order, la.layerId, la.frames.length, la.totalDelay]),
      [
        [0, 0, 1, 1],   // Background — one frame, delay 1, held for the rest
        [1, 1, 8, 40],  // Drawing    — 8 x delay 5
        [2, 3, 1, 40],  // LogoShadow — one frame, delay 40
        [3, 2, 7, 40],  // Logo       — 7 frames, delays 7+6+7+7+6+6+1
      ],
    );
    assert.equal(idle.layerAnimations.reduce((n, la) => n + la.frames.length, 0), 17);
    /* Draw order (0,1,3,2) is NOT the <Layers> declaration order (0,1,2,3). */
    assert.deepEqual(idle.layerAnimations.map((la) => la.layerId), [0, 1, 3, 2]);

    assert.equal(anm2Animation(doc, 'Idle'), idle);
    assert.equal(anm2Animation(doc, 'NoSuchAnimation'), idle); // falls back to DefaultAnimation
  });

  test('frame attributes are read verbatim, including fractional YPosition', () => {
    const idle = doc.animations[0];
    const bg = idle.layerAnimations[0].frames[0];
    assert.equal(bg.xCrop, 0);
    assert.equal(bg.yCrop, 0);
    assert.equal(bg.width, 480);
    assert.equal(bg.height, 272);
    assert.equal(bg.xScale, 100);
    assert.equal(bg.delay, 1);
    assert.equal(bg.visible, true);
    assert.deepEqual([bg.redTint, bg.greenTint, bg.blueTint, bg.alphaTint], [255, 255, 255, 255]);

    const logo = idle.layerAnimations[3];
    assert.equal(logo.frames[0].yPosition, 0);
    assert.equal(logo.frames[1].yPosition, 0.4); // fractional, must not be truncated
    assert.equal(logo.frames[3].yPosition, 1.5);
    assert.equal(logo.frames[0].xPivot, 230);
    assert.equal(logo.frames[0].yPivot, 4);
    assert.equal(logo.frames[0].interpolated, true);
    assert.deepEqual(logo.frames.map((f) => f.delay), [7, 6, 7, 7, 6, 6, 1]);
  });

  test('Delay drives frame selection over the timeline', () => {
    const drawing = doc.animations[0].layerAnimations[1]; // 8 frames, delay 5 each
    assert.equal(anm2FrameAt(drawing, 0).xCrop, 0);
    assert.equal(anm2FrameAt(drawing, 4).xCrop, 0);
    assert.equal(anm2FrameAt(drawing, 5).xCrop, 160); // second frame starts at t=5
    assert.equal(anm2FrameAt(drawing, 9).xCrop, 160);
    assert.equal(anm2FrameAt(drawing, 10).xCrop, 0);
    /* [CONVENTION C3] past the end, the last frame is held. */
    assert.equal(anm2FrameAt(drawing, 999).xCrop, 160);

    const bg = doc.animations[0].layerAnimations[0]; // single frame, delay 1
    assert.equal(anm2FrameAt(bg, 39).width, 480);
  });

  test('composition resolves src/dst/colour for every visible layer', () => {
    const comp = anm2Composition(doc, 'Idle', 0);
    assert.equal(comp.length, 4);
    assert.deepEqual(comp.map((c) => c.layerName), ['Background', 'Drawing', 'LogoShadow', 'Logo']);

    /* src = [XCrop, YCrop, Width, Height] verbatim from the file. */
    assert.deepEqual(comp[0].src, [0, 0, 480, 272]);
    assert.deepEqual(comp[1].src, [0, 384, 156, 160]);
    assert.deepEqual(comp[2].src, [0, 160, 480, 160]);
    assert.deepEqual(comp[3].src, [0, 0, 480, 160]);

    /* dst = ((XPosition - XPivot), (YPosition - YPivot)) * scale,
              (Width * XScale/100, Height * YScale/100) * scale   [CONVENTION C1] */
    assert.equal(ANM2_UNIT_SCALE, 2);
    assert.deepEqual(comp[0].dst, [0, 0, 960, 544]);
    assert.deepEqual(comp[1].dst, [306, 172, 312, 320]);   // (153-0, 86-0) * 2
    assert.deepEqual(comp[2].dst, [0, -12, 960, 320]);     // (230-230, 0-6) * 2
    assert.deepEqual(comp[3].dst, [0, -8, 960, 320]);      // (230-230, 0-4) * 2

    assert.deepEqual(comp[0].color, [1, 1, 1, 1]);
    assert.deepEqual(comp.map((c) => c.spritesheetPath),
      ['TitleMenu.png', 'TitleMenu.png', 'logo.png', 'logo.png']);

    /* The timeline really moves: at t=5 the Drawing layer flips its crop. */
    assert.deepEqual(anm2Composition(doc, 'Idle', 5)[1].src, [160, 384, 156, 160]);
  });

  test('the parser handles the other real menu anm2 files', () => {
    const opts = parseAnm2(fs.readFileSync(path.join(RESOURCES, 'gfx', 'ui', 'main menu', 'optionsmenu.anm2'), 'utf8'));
    assert.equal(opts.spritesheets.size, 3);
    assert.equal(opts.layers.size, 16);
    assert.ok(opts.animations.length >= 1);
    assert.equal(opts.defaultAnimation, 'Background');
    assert.equal(opts.nulls.length, 1);
    assert.equal(opts.nulls[0].name, 'OptionPositions');

    const chars = parseAnm2(fs.readFileSync(path.join(RESOURCES, 'gfx', 'ui', 'main menu', 'charactermenu.anm2'), 'utf8'));
    assert.ok(chars.animations.length >= 1);
    for (const a of chars.animations) {
      assert.ok(a.name.length > 0, 'every animation must carry a name');
      for (const la of a.layerAnimations) assert.ok(la.frames.length >= 0);
    }
  });
});

/* =========================================================================
 * 3. PNG header reader (metadata only — no pixel decoding)
 * ======================================================================= */

describe('readPngSize (IHDR only)', { skip: SKIP }, () => {
  test('real sheet dimensions', () => {
    const dir = path.join(RESOURCES, 'gfx', 'ui', 'main menu');
    assert.deepEqual(readPngSize(readFile(path.join(dir, 'titlemenu.png'))), { width: 480, height: 540, bitDepth: 8, colorType: 6 });
    assert.deepEqual(readPngSize(readFile(path.join(dir, 'logo.png'))), { width: 480, height: 320, bitDepth: 8, colorType: 6 });
    assert.deepEqual(readPngSize(readFile(path.join(dir, 'cursor.png'))), { width: 14, height: 17, bitDepth: 8, colorType: 6 });
    /* The data justification for [CONVENTION C1]: 480x270 == half of 960x540. */
    const overlay = readPngSize(readFile(path.join(dir, 'MenuOverlay.png')));
    assert.deepEqual([overlay.width * 2, overlay.height * 2], [INTERNAL_WIDTH, INTERNAL_HEIGHT]);
  });

  test('non-PNG input returns null rather than throwing', () => {
    assert.equal(readPngSize(readFile(ANM2)), null);
    assert.equal(readPngSize(new Uint8Array(4)), null);
    assert.equal(readPngSize(null), null);
  });
});

/* =========================================================================
 * 4. Native menu state -> draw commands
 * ======================================================================= */

describe('createMenuScene state -> draw commands', { skip: SKIP }, () => {
  let scene;
  const logged = [];
  before(async () => {
    scene = createMenuScene({ readFile, root: RESOURCES, log: (m) => logged.push(m) });
    await scene.load();
  });

  test('load() registers the real textures with real IHDR sizes', () => {
    assert.equal(scene.stats.loaded, true);
    assert.deepEqual(scene.stats.missing, []);
    assert.deepEqual(scene.stats.loadErrors, []);
    const byKey = new Map(scene.textures().map((t) => [t.key, t]));
    assert.deepEqual([...byKey.keys()].sort(), ['cursor', 'font:upheaval#0', 'sheet:0', 'sheet:1']);
    assert.deepEqual([byKey.get('sheet:0').width, byKey.get('sheet:0').height], [480, 540]);
    assert.deepEqual([byKey.get('sheet:1').width, byKey.get('sheet:1').height], [480, 320]);
    assert.deepEqual([byKey.get('font:upheaval#0').width, byKey.get('font:upheaval#0').height], [512, 512]);
    for (const t of byKey.values()) {
      assert.ok(t.bytes instanceof Uint8Array && t.bytes.length > 0, `${t.key} has no bytes`);
      /* PNG bytes are handed over untouched — the signature must survive. */
      assert.deepEqual([...t.bytes.slice(0, 4)], [0x89, 0x50, 0x4e, 0x47]);
    }
    assert.equal(scene.size.width, INTERNAL_WIDTH);
    assert.equal(scene.size.height, INTERNAL_HEIGHT);
  });

  test('menuState23a74 == 0 draws nothing at all [CONVENTION I]', () => {
    scene.update({ menuState23a74: 0, selection: 3 });
    assert.deepEqual(scene.commands(), []);
    /* Not even the prompt: closed is closed. */
    scene.update({
      menuState23a74: 0,
      genericPromptActiveObject: 1,
      genericPromptActiveFlag: 1,
      genericPromptSubmittedSelection: 1,
    });
    assert.equal(scene.commands().length, 0);
    /* And a missing/garbage state object must not throw. */
    scene.update(undefined);
    assert.equal(scene.commands().length, 0);
    scene.update({ menuState23a74: 'nonsense' });
    assert.equal(scene.commands().length, 0);
  });

  test('menu open emits the real anm2 composition as sprite commands', () => {
    scene.update({ menuState23a74: 1, selection: 0 });
    const cmds = scene.commands();
    assert.ok(cmds.length > 0);

    const sprites = cmds.filter((c) => c.type === 'sprite');
    assert.ok(sprites.length > 0, 'menu open must emit sprite commands');

    const anm2Sprites = sprites.filter((c) => c.source === 'anm2');
    assert.equal(anm2Sprites.length, 4);
    assert.deepEqual(anm2Sprites.map((c) => c.tag), [
      'anm2:Background', 'anm2:Drawing', 'anm2:LogoShadow', 'anm2:Logo',
    ]);
    /* Geometry comes from titlemenu.anm2, not from this module. */
    assert.deepEqual(anm2Sprites[0].src, [0, 0, 480, 272]);
    assert.deepEqual(anm2Sprites[0].dst, [0, 0, 960, 544]);
    assert.deepEqual(anm2Sprites[2].src, [0, 160, 480, 160]);
    assert.equal(anm2Sprites[0].tex, 'sheet:0');
    assert.equal(anm2Sprites[2].tex, 'sheet:1');

    /* Command shape is the documented contract. */
    for (const c of cmds) {
      assert.ok(['quad', 'sprite', 'text'].includes(c.type), `unexpected type ${c.type}`);
      assert.equal(c.color.length, 4);
      for (const ch of c.color) assert.ok(ch >= 0 && ch <= 1, 'colour channels are 0..1 floats');
      if (c.type === 'sprite') {
        assert.equal(c.src.length, 4);
        assert.equal(c.dst.length, 4);
        assert.ok(typeof c.tex === 'string' && scene.texture(c.tex), `${c.tex} is not a registered texture`);
      } else if (c.type === 'text') {
        assert.equal(c.at.length, 2);
        assert.ok(Array.isArray(c.glyphs) && c.glyphs.length > 0, 'text must be pre-expanded');
      } else {
        assert.equal(c.dst.length, 4);
      }
    }
  });

  test('every emitted src rect lies inside its real sheet', () => {
    /* Includes the pre-expanded glyph sprites carried by text commands. */
    for (const frame of [
      { menuState23a74: 1, selection: 0 },
      { menuState23a74: 1, selection: 4, frame: 5 },
      { menuState23a74: 1, selection: 2, genericPromptActiveObject: 1, genericPromptActiveFlag: 1, genericPromptSubmittedSelection: 1 },
    ]) {
      scene.update(frame);
      const sprites = scene.commands().flatMap(
        (c) => (c.type === 'sprite' ? [c] : c.type === 'text' ? c.glyphs : []),
      );
      assert.ok(sprites.length > 0);
      for (const s of sprites) {
        const tex = scene.texture(s.tex);
        assert.ok(tex, `${s.tag} references unknown texture ${s.tex}`);
        const [x, y, w, h] = s.src;
        assert.ok(Number.isFinite(x) && Number.isFinite(y), `${s.tag} has a non-finite src origin`);
        assert.ok(w > 0 && h > 0, `${s.tag} src ${s.src} is empty`);
        assert.ok(x >= 0 && y >= 0, `${s.tag} src ${s.src} has a negative origin`);
        assert.ok(
          x + w <= tex.width && y + h <= tex.height,
          `${s.tag} src ${s.src} escapes ${s.tex} (${tex.width}x${tex.height})`,
        );
      }
    }
  });

  test('[CONVENTION D] the out-of-sheet Drawing crop is clamped, not dropped', () => {
    /* titlemenu.anm2 asks for YCrop 384 + Height 160 = 544 rows of a 480x540
       sheet. The raw request is preserved on the command. */
    scene.update({ menuState23a74: 1, selection: 0 });
    const drawing = scene.commands().find((c) => c.tag === 'anm2:Drawing');
    assert.equal(drawing.clamped, true);
    assert.equal(drawing.convention, 'D');
    assert.deepEqual(drawing.srcRaw, [0, 384, 156, 160]);
    assert.deepEqual(drawing.src, [0, 384, 156, 156]);
    /* dst shrinks proportionally so the on-screen pixel scale is preserved. */
    assert.equal(drawing.dst[3], 320 * (156 / 160));
    assert.ok(scene.stats.clampedRects > 0);
    assert.equal(scene.stats.droppedRects, 0);
  });

  test('a selection change changes the command list', () => {
    scene.update({ menuState23a74: 1, selection: 0 });
    const a = scene.commands();
    const aJson = JSON.stringify(a.map((c) => [c.type, c.tag, c.dst ?? c.at, c.color, c.text ?? null]));

    scene.update({ menuState23a74: 1, selection: 1 });
    const b = scene.commands();
    const bJson = JSON.stringify(b.map((c) => [c.type, c.tag, c.dst ?? c.at, c.color, c.text ?? null]));

    assert.notEqual(aJson, bJson, 'selection 0 and 1 must not produce identical draw lists');
    /* commands() hands back a fresh array each frame: the old one is intact. */
    assert.notEqual(a, b);
    assert.equal(JSON.stringify(a.map((c) => [c.type, c.tag, c.dst ?? c.at, c.color, c.text ?? null])), aJson);

    /* Specifically: the highlighted slot moves, and only one slot is selected. */
    const selectedRow = (list) => {
      const slots = list.filter((c) => c.tag === 'slot' || c.tag === 'slot:selected');
      assert.equal(slots.length, MENU_SLOTS);
      const on = slots.filter((c) => c.selected);
      assert.equal(on.length, 1, 'exactly one slot is highlighted');
      return on[0].dst[1];
    };
    assert.notEqual(selectedRow(a), selectedRow(b));

    /* And the state readout text follows the native values. */
    assert.match(a.find((c) => c.tag === 'state:menu').text, /SEL 0$/);
    assert.match(b.find((c) => c.tag === 'state:menu').text, /SEL 1$/);

    /* The anm2 composition is identical across the two — only the fabricated
       selection layer differs. */
    const anm2Of = (l) => JSON.stringify(l.filter((c) => c.source === 'anm2'));
    assert.equal(anm2Of(a), anm2Of(b));
  });

  test('[CONVENTION E] selection wraps rather than walking off screen', () => {
    /* The input bridge walks an unbounded integer (no recovered entry count). */
    scene.update({ menuState23a74: 1, selection: 0 });
    const first = scene.commands().find((c) => c.selected).dst;
    scene.update({ menuState23a74: 1, selection: MENU_SLOTS });
    assert.deepEqual(scene.commands().find((c) => c.selected).dst, first);
    scene.update({ menuState23a74: 1, selection: 12345 });
    const wrapped = scene.commands().find((c) => c.selected).dst;
    assert.ok(wrapped[1] >= 0 && wrapped[1] + wrapped[3] <= INTERNAL_HEIGHT);
  });

  test('[CONVENTION G] the generic-prompt fields add the prompt layer', () => {
    scene.update({ menuState23a74: 1, selection: 1 });
    const withoutPrompt = scene.commands().length;

    scene.update({
      menuState23a74: 1,
      selection: 1,
      genericPromptActiveObject: 1, // sentinel from the input bridge
      genericPromptActiveFlag: 1,
      genericPromptSubmittedSelection: 1,
      genericPromptPostUpdateFlag: 0,
    });
    const withPrompt = scene.commands();
    assert.ok(withPrompt.length > withoutPrompt);
    assert.ok(withPrompt.some((c) => c.tag === 'prompt:dim'));
    assert.ok(withPrompt.some((c) => c.tag === 'prompt:panel'));
    assert.match(withPrompt.find((c) => c.tag === 'state:prompt-selection').text, /^SEL 1/);

    /* The native predicate is `object != 0 && flag != 0` — either being zero
       is not a prompt. */
    scene.update({ menuState23a74: 1, selection: 1, genericPromptActiveObject: 1, genericPromptActiveFlag: 0 });
    assert.equal(scene.commands().some((c) => c.tag === 'prompt:panel'), false);
    scene.update({ menuState23a74: 1, selection: 1, genericPromptActiveObject: 0, genericPromptActiveFlag: 1 });
    assert.equal(scene.commands().some((c) => c.tag === 'prompt:panel'), false);
  });

  test('accepts the input bridge snapshot().menu shape too', () => {
    /* frame-input-bridge.mjs publishes { open, openPending, selection,
       submitArmed, menuState23a74 }. */
    scene.update({ open: true, openPending: false, selection: 2, submitArmed: true, menuState23a74: 1 });
    const cmds = scene.commands();
    assert.ok(cmds.length > 0);
    assert.ok(cmds.some((c) => c.tag === 'prompt:panel'), 'submitArmed maps to promptActive');

    const n = normalizeMenuState({ menuState23a74: 1, submitArmed: true, selection: 3 });
    assert.equal(n.open, true);
    assert.equal(n.promptActive, true);
    assert.equal(n.selection, 3);
    assert.equal(normalizeMenuState({}).open, false);
    assert.equal(normalizeMenuState(null).menuState23a74, 0);
  });

  test('the animation frame index moves the composition', () => {
    scene.update({ menuState23a74: 1, selection: 0, frame: 0 });
    const at0 = scene.commands().find((c) => c.tag === 'anm2:Drawing').src;
    scene.update({ menuState23a74: 1, selection: 0, frame: 5 });
    const at5 = scene.commands().find((c) => c.tag === 'anm2:Drawing').src;
    assert.notDeepEqual(at0, at5);
    assert.equal(at5[0], 160);
    /* ...and back again (composition caching must not stick). */
    scene.update({ menuState23a74: 1, selection: 0, frame: 0 });
    assert.deepEqual(scene.commands().find((c) => c.tag === 'anm2:Drawing').src, at0);
  });
});

/* =========================================================================
 * 5. Graceful degradation — a missing file must never break a frame
 * ======================================================================= */

describe('createMenuScene degradation', () => {
  test('a reader that always throws still loads and still draws a frame', async () => {
    const logs = [];
    const s = createMenuScene({
      readFile: () => { throw new Error('ENOENT'); },
      root: '/does/not/exist',
      log: (m) => logs.push(m),
    });
    await assert.doesNotReject(s.load());
    assert.equal(s.stats.loaded, true);
    assert.ok(s.stats.missing.length >= 3, 'missing files are recorded');
    assert.ok(logs.some((m) => m.includes('missing/unreadable')));
    assert.deepEqual(s.textures(), []);

    assert.doesNotThrow(() => s.update({ menuState23a74: 0 }));
    assert.deepEqual(s.commands(), []);
    assert.doesNotThrow(() => s.update({ menuState23a74: 1, selection: 2, genericPromptActiveObject: 1, genericPromptActiveFlag: 1 }));
    const cmds = s.commands();
    /* No textures => no sprite/text commands, but the quads still describe the
       frame and nothing threw. */
    assert.ok(cmds.length > 0);
    assert.equal(cmds.some((c) => c.type === 'sprite'), false);
    assert.equal(cmds.some((c) => c.type === 'text'), false);
    assert.ok(cmds.every((c) => c.type === 'quad'));
  });

  test('a reader that returns empty buffers degrades the same way', async () => {
    const s = createMenuScene({ readFile: () => new Uint8Array(0), root: '/empty' });
    await assert.doesNotReject(s.load());
    assert.doesNotThrow(() => s.update({ menuState23a74: 1, selection: 0 }));
    assert.ok(s.commands().length > 0);
  });

  test('non-PNG bytes where a texture is expected are logged and skipped', async () => {
    const logs = [];
    const s = createMenuScene({
      readFile: (p) => (p.endsWith('.anm2') || p.endsWith('.fnt')
        ? (() => { throw new Error('skip'); })()
        : new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,
          17, 18, 19, 20, 21, 22, 23, 24, 25, 26])),
      root: '/junk',
      log: (m) => logs.push(m),
    });
    await s.load();
    assert.deepEqual(s.textures(), []);
    assert.ok(logs.some((m) => m.includes('not a PNG')));
    assert.doesNotThrow(() => s.update({ menuState23a74: 1 }));
  });

  test('createMenuScene requires a readFile injection', () => {
    assert.throws(() => createMenuScene({}), /readFile is required/);
  });

  test('the module is a browser ES module: no node: specifiers', () => {
    const src = fs.readFileSync(path.join(REPO, 'web', 'js', 'menu-scene.js'), 'utf8');
    assert.equal(/from\s+['"]node:/.test(src), false, 'menu-scene.js must not import node: builtins');
    assert.equal(/\brequire\s*\(/.test(src), false, 'menu-scene.js must stay ESM');
    /* It must also be importable by URL exactly as the browser would. */
    assert.ok(pathToFileURL(path.join(REPO, 'web', 'js', 'menu-scene.js')).href.endsWith('menu-scene.js'));
  });
});
