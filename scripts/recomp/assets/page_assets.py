#!/usr/bin/env python3
"""Page assets for the shipping page's EDIT FILE menu (round 52).

The save-select screen's DELETE FILE strip becomes EDIT FILE: the same sprite
sheet with the strip's text reset in the game's own Team Meat 16-bold font
(the strip's letters are that font's), carried in the bundle's afterbirthp.a
-- the last archive the engine mounts, whose index wins over the base
archives -- by a byte-for-byte repack with that one entry replaced. The
menu's own art, font and sounds are extracted beside it into
<bundle>/page-assets/ for the page to fetch: the patched sheet (its papers,
cursor and skull strip), the seed paper, the font, seven menu sounds, and
menu.json with the crop rectangles the anm2 uses.

  python scripts/recomp/assets/page_assets.py build <bundle-dir>   idempotent; updates the bundle manifest
  python scripts/recomp/assets/page_assets.py strip <bundle-dir> <out.png>   the patched sheet alone, for a look

The instance stays pristine (the bundle's archive becomes its own file); the
node build reads the instance and never sees the patched art.
"""
from __future__ import annotations

import hashlib
import io
import json
import os
import struct
import sys
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import archive as A  # noqa: E402

ARCHIVE = "resources/packed/afterbirthp.a"
BASE_ARCHIVE = "resources/packed/afterbirth.a"
OUT_DIR = "page-assets"
import bundle as _bundle  # noqa: E402  (the bundle's manifest name; bundle.py imports this module lazily, no cycle)
MANIFEST_NAME = _bundle.MANIFEST_NAME

SHEET = "resources/gfx/ui/main menu/saveselectmenu.png"
FONT_FNT = "resources/font/teammeatfont16bold.fnt"
FONT_PNG = "resources/font/teammeatfont16bold_0.png"
EXTRACT = {  # archive key -> page-assets file name
    SHEET: "saveselectmenu.png",
    FONT_FNT: "teammeatfont16bold.fnt",
    FONT_PNG: "teammeatfont16bold_0.png",
    "resources/gfx/ui/main menu/cursor.png": "cursor.png",
    "resources/gfx/ui/main menu/seedwidget.png": "seedwidget.png",
    "resources/sfx/V2/Menu_Scroll.wav": "menu_scroll.wav",
    "resources/sfx/V2/Menu_NoteAppear.wav": "menu_noteappear.wav",
    "resources/sfx/V2/Menu_NoteHide.wav": "menu_notehide.wav",
    "resources/sfx/V2/paper_in.wav": "paper_in.wav",
    "resources/sfx/V2/paper_out.wav": "paper_out.wav",
    "resources/sfx/CharacterMenuFlipLight.wav": "menu_flip_light.wav",
    "resources/sfx/CharacterMenuRip.wav": "menu_rip.wav",
}
BASE_EXTRACT = {"resources/gfx/ui/main menu/seedunlockpaper.png": "seedunlockpaper.png"}

# the sheet, at the game's 1x: the DELETE FILE strip and what the anm2 draws
# (saveselectmenu.anm2: Idle draws the strip at 119,234 pivot 16,16 from crop
# 16,192 272x48; DeleteConfirmationIdle draws the prompt paper at 234,123 pivot
# 120,64 from crop 32,32 240x144 and the cursor from crop 0,32 16x32)
STRIP = (16, 192, 272, 48)
STRIP_TEXT_X = (62, 198)          # between the skulls, strip-local
STRIP_TEXT_Y = (8, 44)
PROMPT_PAPER = (32, 32, 240, 144)
PROMPT_AT = (234 - 120, 123 - 64)
CURSOR = (0, 32, 16, 32)
TITLE = (16, 0, 144, 32)


def load_bmfont(b: bytes) -> dict:
    """BMFont binary v3: info, common, pages, chars, kernings."""
    if b[:3] != b"BMF" or b[3] != 3:
        raise ValueError("not a BMFont v3 binary")
    i = 4
    font: dict = {"chars": {}, "kern": {}, "pages": []}
    while i < len(b):
        t = b[i]
        n = struct.unpack_from("<I", b, i + 1)[0]
        body = b[i + 5:i + 5 + n]
        i += 5 + n
        if t == 1:
            font["size"] = struct.unpack_from("<h", body, 0)[0]
            font["name"] = body[14:].split(b"\0")[0].decode(errors="replace")
        elif t == 2:
            lh, base, sw, sh, pages = struct.unpack_from("<HHHHH", body, 0)
            font.update(lineHeight=lh, base=base, scaleW=sw, scaleH=sh)
        elif t == 3:
            font["pages"] = [p.decode() for p in body.split(b"\0") if p]
        elif t == 4:
            for k in range(0, n, 20):
                cid, x, y, w, h, xo, yo, xa, page, chnl = struct.unpack_from("<IHHHHhhhBB", body, k)
                font["chars"][cid] = (x, y, w, h, xo, yo, xa, page)
        elif t == 5:
            for k in range(0, n, 10):
                a, c, amt = struct.unpack_from("<IIh", body, k)
                font["kern"][(a, c)] = amt
    return font


def render_text(font: dict, atlas, text: str, ink: tuple[int, int, int]):
    """The text as an RGBA image in the font's own metrics, tinted with `ink`."""
    from PIL import Image
    w = sum(font["chars"][ord(c)][6] for c in text if ord(c) in font["chars"]) + 4
    h = font["lineHeight"] + 4
    im = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    x, prev = 2, None
    for c in text:
        cid = ord(c)
        if cid not in font["chars"]:
            x += 6
            prev = None
            continue
        gx, gy, gw, gh, xo, yo, xa, _page = font["chars"][cid]
        if prev is not None:
            x += font["kern"].get((prev, cid), 0)
        im.alpha_composite(atlas.crop((gx, gy, gx + gw, gy + gh)), (x + xo, yo))
        x += xa
        prev = cid
    tint = Image.new("RGBA", im.size, ink + (255,))
    tint.putalpha(im.getchannel("A"))
    return tint


def strip_colours(strip) -> tuple[tuple[int, int, int], tuple[int, int, int]]:
    """The strip's paper (median of the interior rows clear of the text) and its
    ink (median of the letters' dark pixels)."""
    px = strip.load()

    def dark(x, y):
        r, g, b, a = px[x, y]
        return a > 100 and (r + g + b) < 3 * 120
    paper = [px[x, y][:3] for x in range(30, 250) for y in (8, 9, 10, 36, 37) if not dark(x, y)]
    ink = [px[x, y][:3] for x in range(70, 190) for y in range(13, 30) if px[x, y][3] > 200 and sum(px[x, y][:3]) < 200]
    med = lambda s, i: sorted(c[i] for c in s)[len(s) // 2]
    return ((med(paper, 0), med(paper, 1), med(paper, 2)), (med(ink, 0), med(ink, 1), med(ink, 2)))


def patch_sheet(sheet_png: bytes, fnt: bytes, atlas_png: bytes) -> tuple[bytes, dict]:
    """The sheet with the strip's DELETE FILE reset to EDIT FILE. Returns the PNG
    bytes and the layout facts (for menu.json)."""
    from PIL import Image
    sheet = Image.open(io.BytesIO(sheet_png)).convert("RGBA")
    font = load_bmfont(fnt)
    atlas = Image.open(io.BytesIO(atlas_png)).convert("RGBA")
    sx, sy, sw, sh = STRIP
    strip = sheet.crop((sx, sy, sx + sw, sy + sh))
    paper, ink = strip_colours(strip)
    # erase the letters only: an ink pixel (dark, or an anti-aliased edge) takes
    # the median of its own row's paper pixels, so the strip's shading survives
    # and no rectangle shows; the rows are the letters' (the border rows stay)
    px = strip.load()
    lum = lambda p: (p[0] * 299 + p[1] * 587 + p[2] * 114) // 1000
    ink_lim = lum(paper) - 18
    for y in range(STRIP_TEXT_Y[0] + 2, STRIP_TEXT_Y[1] - 6):
        row = [px[x, y] for x in range(STRIP_TEXT_X[0], STRIP_TEXT_X[1])]
        clean = [p for p in row if p[3] > 200 and lum(p) > ink_lim]
        if len(clean) < 8:
            continue
        med = tuple(sorted(c[i] for c in clean)[len(clean) // 2] for i in range(3)) + (255,)
        for x in range(STRIP_TEXT_X[0], STRIP_TEXT_X[1]):
            p = px[x, y]
            if p[3] > 200 and lum(p) <= ink_lim:
                px[x, y] = med
    # the strip's letters are the font's, a pixel heavier: the glyphs land twice, a pixel apart
    text = render_text(font, atlas, "EDIT FILE", ink)
    tx = STRIP_TEXT_X[0] + (STRIP_TEXT_X[1] - STRIP_TEXT_X[0] - text.width - 1) // 2
    ty = 13 - 4                                  # the strip's letters sit at y 13; the glyph boxes start 4 px above
    strip.alpha_composite(text, (tx, ty))
    strip.alpha_composite(text, (tx + 1, ty))
    sheet.paste(strip, (sx, sy))
    out = io.BytesIO()
    sheet.save(out, format="PNG", optimize=True)
    facts = {"paper": paper, "ink": ink, "editfile_text_at": [sx + tx, sy + ty], "font": "teammeatfont16bold",
             "font_lineHeight": font["lineHeight"], "font_base": font["base"]}
    return out.getvalue(), facts


# ---- the touch HUD's art (the mobile item bar) -------------------------------
# The touch layer draws a row of the player's own items under the game -- the
# active item with its charge bar, the pocket item, the bombs -- with the art the
# game's HUD draws them with: each pocket pickup's own "HUD" animation (a frame
# of ui/ui_cardspills.png), the collectible's sprite, ui_chargebar's segments,
# the bomb pickup and the HUD's own number font. Resolved here, at build time,
# in the archive order the engine mounts them (afterbirthp.a wins).
HUD_ARCHIVES = ("afterbirthp.a", "afterbirth.a", "graphics.a", "config.a", "fonts.a", "animations.a")
HUD_FILES = {  # archive key -> page-assets file name
    "resources/gfx/ui/ui_cardspills.png": "hud-pocket.png",
    "resources/gfx/ui/ui_chargebar.png": "hud-chargebar.png",
    "resources/font/pftempestasevencondensed.fnt": "hud-font.fnt",
    "resources/font/pftempestasevencondensed_0.png": "hud-font_0.png",
}
HUD_CELL = 32


def _hud_reader(bundle_dir: str):
    opened = []
    for name in HUD_ARCHIVES:
        path = os.path.join(bundle_dir, "resources", "packed", name)
        if os.path.isfile(path):
            opened.append(A.Archive(path))

    def read(rel: str) -> bytes | None:
        key = A.key_of(A.resource_key(rel.replace("\\", "/")))
        for ar in opened:
            e = ar.by_key.get(key)
            if e is not None:
                return ar.decode(e)
        return None
    return read, opened


def _anm2_frame(anm2: bytes, anim_name: str, sheet_suffix: str | None = None):
    """The first visible frame of `anim_name` on the first layer drawing `sheet_suffix`
    (any sheet when None): ([x, y, w, h, pivot_x, pivot_y], the sheet's path as written)."""
    import xml.etree.ElementTree as ET
    root = ET.fromstring(anm2)
    sheets = {s.get("Id"): (s.get("Path") or "").replace("\\", "/") for s in root.iter("Spritesheet")}
    layers = {l.get("Id"): sheets.get(l.get("SpritesheetId"), "") for l in root.iter("Layer")}
    for anim in root.iter("Animation"):
        if anim.get("Name") != anim_name:
            continue
        las = anim.find("LayerAnimations")
        for la in (list(las) if las is not None else []):
            sheet = layers.get(la.get("LayerId"), "")
            if sheet_suffix is not None and not sheet.lower().endswith(sheet_suffix):
                continue
            for f in la.iter("Frame"):
                if f.get("Visible", "true") != "true":
                    continue
                return [int(float(f.get(k, "0"))) for k in ("XCrop", "YCrop", "Width", "Height", "XPivot", "YPivot")], sheet
    return None, None


def _anm2_hud_frame(anm2: bytes, sheet_suffix: str = "ui_cardspills.png") -> list[int] | None:
    """The first frame of an anm2's HUD animation on the layer drawing `sheet_suffix`:
    [x, y, w, h, pivot_x, pivot_y] in that sheet."""
    return _anm2_frame(anm2, "HUD", sheet_suffix)[0]


# The pause screen's paper buttons (pausescreen.png: KICK at 245,168 and INVITE at
# 245,103, 52x49 each) are the touch layer's pause and twin marks: the same paper,
# outline and shading, their words replaced by a glyph in the same ink.
PAPER_MARKS = {"pause": (245, 168, 52, 49), "twin": (245, 103, 52, 49)}
# backselectwidget.anm2's "Back" frame: a 96x96 crop at 0,0 of its sheet
BACK_PAPER = (0, 0, 96, 96)
PAPER, PAPER_INK = (199, 178, 154), (54, 47, 45)


def _paper_mark(sheet, box, glyph: str):
    from PIL import ImageDraw
    x, y, w, h = box
    mark = sheet.crop((x, y, x + w, y + h)).convert("RGBA")
    px = mark.load()
    if px[w // 2, h // 3][:3] != PAPER:
        return None                       # not the sheet this was measured on
    # the word and its anti-aliased edges sit in the face above the bottom shading
    for j in range(4, 40):
        for i in range(5, w - 5):
            r, g, b, alpha = px[i, j]
            if alpha == 255 and (r, g, b) != (0, 0, 0):
                px[i, j] = PAPER + (255,)
    draw = ImageDraw.Draw(mark)
    cx, cy = 25, 20                       # the face's centre, above the bottom shading
    if glyph == "pause":
        draw.rectangle((cx - 9, cy - 9, cx - 4, cy + 9), fill=PAPER_INK)
        draw.rectangle((cx + 3, cy - 9, cx + 8, cy + 9), fill=PAPER_INK)
    else:                                 # two heads: the other body
        draw.ellipse((cx - 13, cy - 6, cx - 1, cy + 6), fill=PAPER_INK)
        draw.ellipse((cx + 1, cy - 6, cx + 13, cy + 6), fill=PAPER_INK)
    return mark


def _back_mark(png: bytes):
    """backselectwidget.png's "Back" crop trimmed to the paper (transparent margin
    off), or None when the crop is empty."""
    from PIL import Image
    x, y, w, h = BACK_PAPER
    back = Image.open(io.BytesIO(png)).convert("RGBA").crop((x, y, x + w, y + h))
    box = back.getbbox()
    return back.crop(box) if box else None


def build_hud(bundle_dir: str, out_dir: str) -> dict[str, bytes]:
    """hud.json, the active items' icon atlas and the HUD sheets. Returns {file name: bytes}."""
    import xml.etree.ElementTree as ET
    from PIL import Image
    read, opened = _hud_reader(bundle_dir)
    try:
        items_xml, pockets_xml, entities_xml = read("items.xml"), read("pocketitems.xml"), read("entities2.xml")
        if not (items_xml and pockets_xml and entities_xml):
            return {}
        written: dict[str, bytes] = {}
        for key, name in HUD_FILES.items():
            data = read(key)
            if data is None:
                raise SystemExit("page-assets: no %s in the archives" % key)
            written[name] = data
        # the active items, one 32x32 cell each, the order of items.xml
        items = ET.fromstring(items_xml)
        root = (items.get("gfxroot") or "gfx/items/").rstrip("/") + "/collectibles/"
        actives = [e for e in items if e.tag == "active" and e.get("gfx")]
        cols = 16
        atlas = Image.new("RGBA", (cols * HUD_CELL, -(-len(actives) // cols) * HUD_CELL), (0, 0, 0, 0))
        cells: dict[str, list[int]] = {}
        for e in actives:
            png = read(root + e.get("gfx"))
            if png is None:
                continue
            icon = Image.open(io.BytesIO(png)).convert("RGBA")
            if icon.size != (HUD_CELL, HUD_CELL):
                icon = icon.crop((0, 0, HUD_CELL, HUD_CELL))
            n = len(cells)
            x, y = (n % cols) * HUD_CELL, (n // cols) * HUD_CELL
            atlas.alpha_composite(icon, (x, y))
            cells[e.get("id")] = [x, y]
        out = io.BytesIO()
        atlas.save(out, format="PNG", optimize=True)
        written["hud-actives.png"] = out.getvalue()
        # the pocket pickups: entity 5.<variant>.<subtype> -> its anm2's HUD frame
        ents = ET.fromstring(entities_xml)
        anm2_root = (ents.get("anm2root") or "gfx/").rstrip("/") + "/"
        sprite = {}
        for e in ents:
            if e.get("id") == "5" and e.get("variant") in ("70", "300") and e.get("anm2path"):
                sprite[(e.get("variant"), e.get("subtype") or "0")] = anm2_root + e.get("anm2path")
        frames: dict[str, list[int]] = {}

        def hud_frame(variant: str, subtype: str):
            path = sprite.get((variant, subtype))
            if path not in frames and path:
                data = read(path)
                frames[path] = _anm2_hud_frame(data) if data else None
            return frames.get(path) if path else None
        cards = {}
        for e in ET.fromstring(pockets_xml):
            if e.tag in ("card", "rune") and e.get("id") and e.get("pickup"):
                f = hud_frame("300", e.get("pickup"))
                if f:
                    cards[e.get("id")] = f
        pills = {}
        for colour in list(range(1, 15)) + list(range(2049, 2063)):
            f = hud_frame("70", str(colour))
            if f:
                pills[str(colour)] = f
        # the bar's bomb is the bomb pickup itself (5.40.1, golden 5.40.4): its Idle frame
        bombs = Image.new("RGBA", (2 * HUD_CELL, HUD_CELL), (0, 0, 0, 0))
        bomb_cells = {}
        anm2s = {(e.get("variant"), e.get("subtype")): anm2_root + e.get("anm2path")
                 for e in ents if e.get("id") == "5" and e.get("variant") == "40" and e.get("anm2path")}
        for n, (name, subtype) in enumerate((("bomb", "1"), ("goldenBomb", "4"))):
            data = read(anm2s.get(("40", subtype), ""))
            frame, sheet = _anm2_frame(data, "Idle") if data else (None, None)
            png = read(anm2_root + sheet) if sheet else None
            if not (frame and png):
                continue
            fx, fy, fw, fh, pvx, pvy = frame
            cell = Image.open(io.BytesIO(png)).convert("RGBA").crop((fx, fy, fx + fw, fy + fh))
            bombs.alpha_composite(cell.crop((0, 0, HUD_CELL, HUD_CELL)), (n * HUD_CELL, 0))
            bomb_cells[name] = [n * HUD_CELL, 0, min(fw, HUD_CELL), min(fh, HUD_CELL)]
        out = io.BytesIO()
        bombs.save(out, format="PNG", optimize=True)
        written["hud-bombs.png"] = out.getvalue()
        # the pause and twin marks, cut from the pause screen's own paper buttons
        marks_sheet = read("gfx/ui/pausescreen.png")
        marks = Image.new("RGBA", (2 * 56 + BACK_PAPER[2], max(52, BACK_PAPER[3])), (0, 0, 0, 0))
        mark_cells = {}
        if marks_sheet:
            paper = Image.open(io.BytesIO(marks_sheet)).convert("RGBA")
            for n, (name, box) in enumerate(PAPER_MARKS.items()):
                mark = _paper_mark(paper, box, name)
                if mark is not None:
                    marks.alpha_composite(mark, (n * 56, 0))
                    mark_cells[name] = [n * 56, 0, box[2], box[3]]
        # the menus' BACK sticker, as the file screen shows it, trimmed to the paper
        back_sheet = read("gfx/ui/backselectwidget.png")
        back = _back_mark(back_sheet) if back_sheet else None
        if back is not None:
            marks.alpha_composite(back, (2 * 56, 0))
            mark_cells["back"] = [2 * 56, 0, back.width, back.height]
        out = io.BytesIO()
        marks.save(out, format="PNG", optimize=True)
        written["hud-marks.png"] = out.getvalue()
        # ui_chargebar.anm2's BarEmpty/BarFull/BarOverlayN crops (16x32, pivot 8,16)
        hud = {
            "format": "isaac-touch-hud-2",
            "actives": {"sheet": "hud-actives.png", "cell": HUD_CELL,
                        "items": {k: {"at": v} for k, v in cells.items()}},
            "pocket": {"sheet": "hud-pocket.png", "cards": cards, "pills": pills},
            "bombs": {"sheet": "hud-bombs.png", **bomb_cells},
            "marks": {"sheet": "hud-marks.png", **mark_cells},
            "chargebar": {"sheet": "hud-chargebar.png", "size": [16, 32], "pivot": [8, 16],
                          "empty": [0, 0], "full": [16, 0],
                          "overlay": {"1": [48, 32], "2": [32, 32], "3": [16, 32], "4": [0, 32], "5": [64, 0],
                                      "6": [48, 0], "8": [64, 32], "12": [32, 0]}},
            "font": {"fnt": "hud-font.fnt", "png": "hud-font_0.png"},
        }
        for e in actives:
            entry = hud["actives"]["items"].get(e.get("id"))
            if entry is not None:
                entry["max"] = int(e.get("maxcharges") or 0)
        written["hud.json"] = (json.dumps(hud, indent=1, sort_keys=True) + "\n").encode()
        os.makedirs(out_dir, exist_ok=True)
        for name, data in written.items():
            with open(os.path.join(out_dir, name), "wb") as f:
                f.write(data)
        return written
    finally:
        for ar in opened:
            ar.close()


# The mod browser (mod_browser.mjs) is drawn on the paper the game's own MODS
# screen is: modsmenu.png, cut the way modsmenu.anm2 cuts it -- Top, Piece1..5,
# Bottom and the Cursor -- in two of the Team Meat fonts besides the menu's
# 16 bold: 16 for nothing yet, 10 for the list and the descriptions.
BROWSER_FILES = {  # archive key -> page-assets file name
    "resources/gfx/ui/main menu/modsmenu.png": "modsmenu.png",
    "resources/font/teammeatfont10.fnt": "teammeatfont10.fnt",
    "resources/font/teammeatfont10_0.png": "teammeatfont10_0.png",
    "resources/font/teammeatfont16.fnt": "teammeatfont16.fnt",
    "resources/font/teammeatfont16_0.png": "teammeatfont16_0.png",
}
BROWSER_ANM2 = "resources/gfx/ui/main menu/modsmenu.anm2"


def browser_layout(anm2: bytes) -> dict:
    """The MODS paper as modsmenu.anm2 cuts it, for menu.json: Piece1..5, Bottom
    and the Cursor from their animations; the Top is the sheet above Piece1."""
    cut = {}
    for anim in ("Piece1", "Piece2", "Piece3", "Piece4", "Piece5", "Bottom", "Cursor"):
        frame, _sheet = _anm2_frame(anm2, anim, "modsmenu.png")
        if frame is None:
            raise SystemExit("page-assets: modsmenu.anm2 has no %s" % anim)
        cut[anim] = frame[:4]
    return {
        "sheet": "modsmenu.png", "top": [0, 0, cut["Piece1"][2], cut["Piece1"][1]],
        "pieces": [cut["Piece%d" % i] for i in range(1, 6)],
        "bottom": cut["Bottom"], "cursor": cut["Cursor"],
        # the MODS lettering and its underline, covered on a page with no title
        "title": [22, 5, 214, 31],
        "fonts": {"small": {"fnt": "teammeatfont10.fnt", "png": "teammeatfont10_0.png"},
                  "body": {"fnt": "teammeatfont16.fnt", "png": "teammeatfont16_0.png"}},
    }


def build_browser(bundle_dir: str, out_dir: str) -> tuple[dict[str, bytes], dict | None]:
    """The mod browser's paper and fonts. Returns ({file name: bytes}, its menu.json entry)."""
    read, opened = _hud_reader(bundle_dir)
    try:
        anm2 = read(BROWSER_ANM2)
        if anm2 is None:
            return {}, None
        written: dict[str, bytes] = {}
        for key, name in BROWSER_FILES.items():
            data = read(key)
            if data is None:
                raise SystemExit("page-assets: no %s in the archives" % key)
            written[name] = data
        meta = browser_layout(anm2)
        os.makedirs(out_dir, exist_ok=True)
        for name, data in written.items():
            with open(os.path.join(out_dir, name), "wb") as f:
                f.write(data)
        return written, meta
    finally:
        for ar in opened:
            ar.close()


def entry_bytes(ar: A.Archive, path: str) -> bytes:
    e = ar.by_key.get(A.key_of(A.resource_key(path)))
    if e is None:
        raise SystemExit("page-assets: %s has no entry %s" % (ar.path, path))
    return ar.decode(e)


def sha256(b: bytes) -> str:
    return hashlib.sha256(b).hexdigest()


def build(bundle_dir: str, quiet: bool = False) -> dict:
    t0 = time.time()
    arch = os.path.join(bundle_dir, ARCHIVE)
    base = os.path.join(bundle_dir, BASE_ARCHIVE)
    out_dir = os.path.join(bundle_dir, OUT_DIR)
    if not (os.path.isfile(arch) and os.path.isfile(base)):
        # a bundle without the DLC archives (the test fixtures): no menu art to make
        if not quiet:
            print("page-assets: no %s / %s in %s, nothing to do" % (ARCHIVE, BASE_ARCHIVE, bundle_dir))
        return {"repacked": False, "files": [], "sheet_sha256": None}
    # the pristine sheet: the instance's archive when it sits beside the bundle
    # (the bundle's own entry is the patched one after the first build, and the
    # letters are cut from the paper it came with)
    pristine = os.path.join(os.path.dirname(os.path.abspath(bundle_dir)), "game-instance", ARCHIVE)
    try:
        with A.Archive(arch) as ar:
            raw = {k: entry_bytes(ar, k) for k in EXTRACT}
            version = ar.version
            sheet_key = A.key_of(A.resource_key(SHEET))
            current = raw[SHEET]
        source = current
        if os.path.isfile(pristine):
            with A.Archive(pristine) as pr:
                source = entry_bytes(pr, SHEET)
    except (ValueError, OSError, SystemExit) as e:
        # not the game's archive (a fixture stands in for it), or one without the menu's entries
        if not quiet:
            print("page-assets: %s is not the game's archive (%s), nothing to do" % (ARCHIVE, str(e).splitlines()[0][:120]))
        return {"repacked": False, "files": [], "sheet_sha256": None}
    os.makedirs(out_dir, exist_ok=True)
    patched, facts = patch_sheet(source, raw[FONT_FNT], raw[FONT_PNG])
    # already patched? the entry regenerates to itself (the pristine sheet does not)
    already = current == patched
    if not already:
        # is the current entry pristine (then patch it) or a stale patch (regenerate from it either way:
        # the strip region is reset from the paper colour, so the result is the same)
        tmp = arch + ".tmp"
        with A.Archive(arch) as ar:
            items = []
            for e in ar.entries:
                if e.key == sheet_key:
                    items.append({"h1": e.h1, "h2": e.h2, "data": patched})
                else:
                    items.append({"h1": e.h1, "h2": e.h2, "src": ar, "entry": e})
            r = A.write_archive(tmp, version, items)
        os.replace(tmp, arch)
        if not quiet:
            print("page-assets: %s repacked with the EDIT FILE sheet: %d entries, %d bytes (%d passthrough, %d encoded)"
                  % (ARCHIVE, r["entries"], r["size"], r["passthrough"], r["encoded"]))
    elif not quiet:
        print("page-assets: %s already carries the EDIT FILE sheet" % ARCHIVE)
    # the page's files
    written = {}
    files = dict(EXTRACT)
    raw[SHEET] = patched
    for key, name in files.items():
        data = raw[key]
        with open(os.path.join(out_dir, name), "wb") as f:
            f.write(data)
        written[name] = data
    with A.Archive(base) as br:
        for key, name in BASE_EXTRACT.items():
            data = entry_bytes(br, key)
            with open(os.path.join(out_dir, name), "wb") as f:
                f.write(data)
            written[name] = data
    written.update(build_hud(bundle_dir, out_dir))
    browser_files, browser = build_browser(bundle_dir, out_dir)
    written.update(browser_files)
    menu = {
        "format": "isaac-page-assets-1",
        "sheet": "saveselectmenu.png", "paper": "seedunlockpaper.png", "cursor": "cursor.png", "widget": "seedwidget.png",
        "font": {"fnt": "teammeatfont16bold.fnt", "png": "teammeatfont16bold_0.png",
                 "lineHeight": facts["font_lineHeight"], "base": facts["font_base"]},
        "rects": {"strip": list(STRIP), "prompt_paper": list(PROMPT_PAPER), "prompt_at": list(PROMPT_AT),
                  "cursor": list(CURSOR), "title": list(TITLE),
                  "widget": [0, 0, 144, 96]},
        "colours": {"paper": list(facts["paper"]), "ink": list(facts["ink"])},
        "sounds": {"open": "menu_noteappear.wav", "close": "menu_notehide.wav", "move": "menu_scroll.wav",
                   "select": "menu_flip_light.wav", "back": "paper_out.wav", "delete": "menu_rip.wav", "paper_in": "paper_in.wav"},
        "sound_ids": {"menu_scroll": 282, "menu_noteappear": 283, "menu_notehide": 284, "paper_in": 17, "paper_out": 18,
                      "menu_flip_light": 569, "menu_rip": 571},
        "game_size": [480, 270],
        "editfile_text_at": facts["editfile_text_at"],
    }
    if browser:
        menu["browser"] = browser
    mj = (json.dumps(menu, indent=1) + "\n").encode()
    with open(os.path.join(out_dir, "menu.json"), "wb") as f:
        f.write(mj)
    written["menu.json"] = mj
    # the bundle manifest: the archive's new bytes, the page-assets files, the totals
    mpath = os.path.join(bundle_dir, MANIFEST_NAME)
    if os.path.isfile(mpath):
        with open(mpath, encoding="utf-8") as f:
            man = json.load(f)
        keep = [e for e in man.get("files", []) if not e["path"].startswith(OUT_DIR + "/")]
        for e in keep:
            if e["path"] == ARCHIVE:
                e["size"] = os.stat(arch).st_size
                e["sha256"] = A_sha256_file(arch)
                e["rule"] = "mounted-archive"
                e["page_assets"] = "EDIT FILE sheet"
        for name in sorted(written):
            keep.append({"path": OUT_DIR + "/" + name, "size": len(written[name]), "sha256": sha256(written[name]),
                         "rule": "page-assets"})
        man["files"] = keep
        man["totals"] = {"files": len(keep), "bytes": sum(e["size"] for e in keep)}
        man["page_assets"] = {"format": menu["format"], "files": sorted(written), "archive": ARCHIVE,
                              "sheet_sha256": sha256(patched)}
        with open(mpath, "w", encoding="utf-8") as f:
            json.dump(man, f, indent=1)
            f.write("\n")
    if not quiet:
        print("page-assets: %d files in %s/%s (%s); %.1f s" % (len(written), bundle_dir, OUT_DIR,
                                                             ", ".join(sorted(written)), time.time() - t0))
    return {"repacked": not already, "files": sorted(written), "sheet_sha256": sha256(patched)}


def A_sha256_file(path: str) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def main(argv=None) -> int:
    argv = sys.argv[1:] if argv is None else argv
    if len(argv) >= 2 and argv[0] == "build":
        build(argv[1])
        return 0
    if len(argv) >= 3 and argv[0] == "strip":
        with A.Archive(os.path.join(argv[1], ARCHIVE)) as ar:
            png, _ = patch_sheet(entry_bytes(ar, SHEET), entry_bytes(ar, FONT_FNT), entry_bytes(ar, FONT_PNG))
        with open(argv[2], "wb") as f:
            f.write(png)
        print("wrote", argv[2])
        return 0
    print(__doc__)
    return 2


if __name__ == "__main__":
    sys.exit(main())
