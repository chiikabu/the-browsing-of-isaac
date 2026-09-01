/**
 * menu-scene.js — presentation layer for the native menu lane.
 *
 * ===========================================================================
 * WHAT THIS MODULE IS — AND WHAT IT IS NOT
 * ===========================================================================
 * This module is a **presentation layer over native menu state**. It is NOT
 * decompiler output and it carries NO PE fidelity claim.
 *
 * What is real here:
 *   - the *state* it reacts to comes from the native Game::Update slice
 *     (sparse field `menuState23a74` @ Game+0x23a74, the generic-prompt fields
 *     @ +0x267ac/+0x267bc/+0x268a4/+0x268a8, and the menu-lane runtime inputs);
 *   - the *geometry* it draws comes from the game's own shipped data files —
 *     `.anm2` layer frames (crop rect, position, pivot, scale, tint) and
 *     BMFont-binary `.fnt` glyph metrics, parsed byte-for-byte from the real
 *     resources mounted in MEMFS. No sprite rectangle is invented.
 *
 * What is NOT recovered from the PE (every item below is a **presentation
 * convention** chosen by this module, and is tagged `[CONVENTION]` at its
 * definition):
 *   C1  anm2 units -> Isaac internal px is a flat x2 scale. Justification is
 *       data, not code: `MenuOverlay.png` is 480x270 and titlemenu's Background
 *       layer frame is 480x272, exactly half of the 960x540 internal frame.
 *       The PE's real menu view transform was not recovered.
 *   C2  Only the *frame-0* composition of the chosen animation is drawn by
 *       default, and inter-frame `Interpolated="true"` blending is NOT applied.
 *       Frame values are used verbatim.
 *   C3  A layer whose delay timeline is shorter than the animation holds its
 *       last frame. (Standard anm2 behaviour, but not verified against the PE.)
 *   D   Source rects that fall outside the real sheet are proportionally
 *       CLAMPED (titlemenu.anm2's "Drawing" layer asks for YCrop 384 + Height
 *       160 = 544 rows from a 480x540 sheet). The raw rect is preserved on the
 *       command as `srcRaw` and counted in `stats.clampedRects`.
 *   E   The selection highlight geometry (a fixed column of MENU_SLOTS slots
 *       laid out by SLOT_*) is entirely fabricated. **There is no recovered
 *       menu-entry list, no entry count and no entry geometry anywhere in the
 *       Update slice** — `selection` is an unbounded integer walked by the
 *       input bridge, so this module wraps it modulo MENU_SLOTS purely so that
 *       a highlight stays on screen.
 *   F   All text strings emitted are *diagnostics about native state* (field
 *       names and their values), rendered with the real font. No menu copy,
 *       label or caption from the game is reproduced or invented.
 *   G   The generic-prompt panel (dim quad + panel quad + text) is a fabricated
 *       layout. Only the *decision* to show it is native
 *       (`genericPromptActiveObject != 0 && genericPromptActiveFlag != 0`).
 *   H   The cursor sprite position follows the fabricated slot column (E). The
 *       cursor *texture* is the real `cursor.png`, drawn whole (no invented
 *       sub-rect).
 *   I   `menuState23a74 == 0` draws nothing at all, including the prompt. The
 *       "menu closed => no menu presentation" rule is this module's, not a
 *       recovered PE predicate.
 *
 * ===========================================================================
 * DRAW COMMAND CONTRACT (this is the contract with the GL host)
 * ===========================================================================
 * Coordinates are **Isaac internal pixels: 960 x 540, origin TOP-LEFT**,
 * +x right, +y down — the same space web/js/render-host-gl.js documents.
 * Colours are float RGBA in 0..1, non-premultiplied.
 *
 *   { type: 'quad',
 *     dst: [x, y, w, h],
 *     color: [r, g, b, a] }
 *
 *   { type: 'sprite',
 *     tex: <string key from textures()>,
 *     src: [x, y, w, h],          // texels in that texture, top-left origin
 *     dst: [x, y, w, h],          // internal px
 *     color: [r, g, b, a] }       // multiplied into the sampled texel
 *
 *   { type: 'text',
 *     font: <string font key>,
 *     text: <string>,
 *     at: [x, y],                 // pen origin (top-left of the line box)
 *     color: [r, g, b, a],
 *     scale: <number>,
 *     glyphs: [ <sprite command>, ... ] }
 *
 * TEXT IS PRE-EXPANDED. Every `text` command carries a `glyphs` array of ready
 * `sprite` commands built from the real BMFont metrics, so a host that does not
 * want to implement font layout can simply draw `cmd.glyphs` and ignore
 * `cmd.text`. The `text` command itself is metadata; drawing BOTH the text
 * command and its glyphs would double-draw.
 *
 * Every command additionally carries a `tag` string (what it is) and, for the
 * fabricated ones, `convention: '<letter>'` naming the convention above.
 *
 * ===========================================================================
 * FILE FORMATS (parsed here, verified in tests/menu-scene.test.js)
 * ===========================================================================
 * .fnt — AngelCode BMFont **binary**: magic 'B','M','F' + version byte, then
 *   blocks of (u8 type, i32 size, body). Block 1 info, 2 common, 3 pages,
 *   4 chars (20 B records), 5 kerning (10 B records). Verified against
 *   resources/font/upheaval.fnt.
 * .anm2 — XML. NOTE: the real root element is `<AnimatedActor>` (not `<Anm2>`),
 *   containing `<Info>`, `<Content>` (`<Spritesheets>/<Spritesheet Id Path>`,
 *   `<Layers>/<Layer Id Name SpritesheetId>`, `<Nulls>`, `<Events>`) and
 *   `<Animations DefaultAnimation>` / `<Animation Name FrameNum Loop>` /
 *   `<RootAnimation>` + `<LayerAnimations>/<LayerAnimation LayerId Visible>` /
 *   `<Frame XPosition YPosition XPivot YPivot XCrop YCrop Width Height
 *   XScale YScale Delay Visible *Tint *Offset Rotation Interpolated>`.
 *   Draw order is the *document order of `<LayerAnimation>`*, which in
 *   titlemenu.anm2 (0,1,3,2) differs from the `<Layers>` declaration order.
 *
 * NO PNG DECODING HAPPENS HERE. `textures()` hands the raw PNG bytes to the GL
 * host. The only PNG bytes this module looks at are the 8-byte signature and
 * the IHDR width/height (needed for the src-rect bounds clamp, convention D).
 *
 * ZERO IMPORTS BY DESIGN — browser ES module, no `node:` specifiers, so the
 * same file loads from `/js/menu-scene.js` and from `node --test`.
 */

/* ---------------------------------------------------------------------------
 * Constants
 * ------------------------------------------------------------------------- */

/** Isaac internal render space (matches render-host-gl.js). */
export const INTERNAL_WIDTH = 960;
export const INTERNAL_HEIGHT = 540;

/**
 * [CONVENTION C1] anm2 authoring unit -> internal px.
 * Data justification: MenuOverlay.png is 480x270 == exactly half of 960x540,
 * and titlemenu.anm2's Background frame is 480x272. The PE's real menu view
 * transform was NOT recovered.
 */
export const ANM2_UNIT_SCALE = 2;

/** Default resource root inside MEMFS (the browser mounts the real files here). */
export const DEFAULT_RESOURCE_ROOT = '/game/resources';

/** Relative paths, resolved under the resource root. */
export const MENU_DIR = 'gfx/ui/main menu';
export const TITLE_ANM2 = `${MENU_DIR}/titlemenu.anm2`;
export const CURSOR_PNG = `${MENU_DIR}/cursor.png`;
export const FONT_DIR = 'font';
export const DEFAULT_FONT = 'upheaval';

/** BMFont binary block ids. */
export const BMF_BLOCK = Object.freeze({
  INFO: 1, COMMON: 2, PAGES: 3, CHARS: 4, KERNING: 5,
});
/** Fixed record sizes in the binary format. */
export const BMF_CHAR_RECORD_SIZE = 20;
export const BMF_KERNING_RECORD_SIZE = 10;

/**
 * [CONVENTION E] Fabricated selection column. There is NO recovered menu-entry
 * list in the Update slice; these numbers exist only so a highlight is visible.
 */
export const MENU_SLOTS = 6;
const SLOT_W = 300;
const SLOT_H = 26;
const SLOT_X = (INTERNAL_WIDTH - SLOT_W) / 2;
const SLOT_Y0 = 356;
const SLOT_STEP = 30;

/** [CONVENTION G] Fabricated generic-prompt panel box. */
const PROMPT_BOX = Object.freeze({ x: 240, y: 170, w: 480, h: 200 });

/* ---------------------------------------------------------------------------
 * Tiny byte readers (no PNG decoding, no node imports)
 * ------------------------------------------------------------------------- */

function asBytes(value) {
  if (value == null) return null;
  if (value instanceof Uint8Array) return value;
  if (ArrayBuffer.isView(value)) return new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
  if (value instanceof ArrayBuffer) return new Uint8Array(value);
  return null;
}

function viewOf(bytes) {
  return new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
}

/** UTF-8 decode without TextDecoder dependency (ASCII-safe fallback). */
function decodeUtf8(bytes) {
  if (typeof TextDecoder === 'function') return new TextDecoder('utf-8').decode(bytes);
  let out = '';
  for (let i = 0; i < bytes.length; i += 1) out += String.fromCharCode(bytes[i]);
  return out;
}

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

/**
 * Read a PNG's pixel dimensions from its IHDR header. This reads 24 bytes and
 * decodes NO image data — the pixels are handed to the GL host untouched.
 * @param {Uint8Array} bytes
 * @returns {{width:number, height:number, bitDepth:number, colorType:number}|null}
 */
export function readPngSize(input) {
  const bytes = asBytes(input);
  if (!bytes || bytes.length < 26) return null;
  for (let i = 0; i < 8; i += 1) if (bytes[i] !== PNG_SIGNATURE[i]) return null;
  const dv = viewOf(bytes);
  if (dv.getUint32(8, false) !== 13) return null;
  if (bytes[12] !== 0x49 || bytes[13] !== 0x48 || bytes[14] !== 0x44 || bytes[15] !== 0x52) return null;
  return {
    width: dv.getUint32(16, false),
    height: dv.getUint32(20, false),
    bitDepth: bytes[24],
    colorType: bytes[25],
  };
}

/* ---------------------------------------------------------------------------
 * BMFont binary parser
 *
 * Layout below is transcribed from the actual bytes of
 * resources/font/upheaval.fnt, not from memory. Verified field-by-field in
 * tests/menu-scene.test.js.
 *
 *   magic      : 'B','M','F', u8 version
 *   block      : u8 type, i32 size(LE), then `size` bytes of body
 *   info  (1)  : i16 fontSize, u8 bitField, u8 charSet, u16 stretchH, u8 aa,
 *                u8 padUp, u8 padRight, u8 padDown, u8 padLeft,
 *                u8 spacingH, u8 spacingV, u8 outline, cstring fontName
 *                => 14 fixed bytes + name. upheaval: 27 = 14 + len("Upheaval Pro")+1
 *   common(2)  : u16 lineHeight, u16 base, u16 scaleW, u16 scaleH, u16 pages,
 *                u8 bitField, u8 alphaChnl, u8 redChnl, u8 greenChnl, u8 blueChnl
 *                => exactly 15 bytes
 *   pages (3)  : `pages` equal-length NUL-terminated names
 *   chars (4)  : u32 id, u16 x, u16 y, u16 width, u16 height,
 *                i16 xoffset, i16 yoffset, i16 xadvance, u8 page, u8 chnl (20 B)
 *   kern  (5)  : u32 first, u32 second, i16 amount (10 B)
 *
 * NOTE on info.bitField: the AngelCode table numbers these bits from the HIGH
 * end. upheaval.fnt stores 0x40, which is `unicode` under high-bit-first and a
 * *reserved* bit under low-bit-first — so high-bit-first is the reading the
 * data itself supports. Both readings are reported (`bitFieldLsbFirst`).
 * ------------------------------------------------------------------------- */

/**
 * @param {Uint8Array} input raw .fnt bytes (BMFont BINARY, version 3)
 * @returns {object} parsed font
 */
export function parseBmFontBinary(input) {
  const bytes = asBytes(input);
  if (!bytes || bytes.length < 4) throw new Error('bmfont: file too small');
  if (bytes[0] !== 0x42 || bytes[1] !== 0x4d || bytes[2] !== 0x46) {
    throw new Error('bmfont: bad magic (expected "BMF"); text .fnt is not supported');
  }
  const version = bytes[3];
  if (version !== 3) throw new Error(`bmfont: unsupported binary version ${version}`);

  const dv = viewOf(bytes);
  const font = {
    version,
    info: null,
    common: null,
    pages: [],
    /** @type {Map<number, object>} codepoint -> glyph */
    chars: new Map(),
    /** @type {Map<number, number>} (first<<16|second) -> amount */
    kernings: new Map(),
    charCount: 0,
    kerningCount: 0,
    blocks: [],
    bytesConsumed: 4,
  };

  let off = 4;
  while (off + 5 <= bytes.length) {
    const type = bytes[off];
    const size = dv.getInt32(off + 1, true);
    const body = off + 5;
    if (size < 0 || body + size > bytes.length) {
      throw new Error(`bmfont: block ${type} at ${off} declares ${size} bytes past EOF`);
    }
    font.blocks.push({ type, size, offset: off, bodyOffset: body });

    switch (type) {
      case BMF_BLOCK.INFO: {
        const bitField = bytes[body + 2];
        let n = body + 14;
        while (n < body + size && bytes[n] !== 0) n += 1;
        font.info = {
          fontSize: dv.getInt16(body + 0, true),
          bitField,
          /* High-bit-first reading — the one upheaval.fnt's 0x40 supports. */
          smooth: (bitField & 0x80) !== 0,
          unicode: (bitField & 0x40) !== 0,
          italic: (bitField & 0x20) !== 0,
          bold: (bitField & 0x10) !== 0,
          fixedHeight: (bitField & 0x08) !== 0,
          /* Alternate low-bit-first reading, reported for auditability. */
          bitFieldLsbFirst: {
            smooth: (bitField & 0x01) !== 0,
            unicode: (bitField & 0x02) !== 0,
            italic: (bitField & 0x04) !== 0,
            bold: (bitField & 0x08) !== 0,
            fixedHeight: (bitField & 0x10) !== 0,
          },
          charSet: bytes[body + 3],
          stretchH: dv.getUint16(body + 4, true),
          aa: bytes[body + 6],
          paddingUp: bytes[body + 7],
          paddingRight: bytes[body + 8],
          paddingDown: bytes[body + 9],
          paddingLeft: bytes[body + 10],
          spacingHoriz: bytes[body + 11],
          spacingVert: bytes[body + 12],
          outline: bytes[body + 13],
          fontName: decodeUtf8(bytes.subarray(body + 14, n)),
        };
        break;
      }
      case BMF_BLOCK.COMMON: {
        const bitField = bytes[body + 10];
        font.common = {
          lineHeight: dv.getUint16(body + 0, true),
          base: dv.getUint16(body + 2, true),
          scaleW: dv.getUint16(body + 4, true),
          scaleH: dv.getUint16(body + 6, true),
          pages: dv.getUint16(body + 8, true),
          bitField,
          packed: (bitField & 0x01) !== 0,
          alphaChnl: bytes[body + 11],
          redChnl: bytes[body + 12],
          greenChnl: bytes[body + 13],
          blueChnl: bytes[body + 14],
        };
        break;
      }
      case BMF_BLOCK.PAGES: {
        let p = body;
        while (p < body + size) {
          let e = p;
          while (e < body + size && bytes[e] !== 0) e += 1;
          if (e > p) font.pages.push(decodeUtf8(bytes.subarray(p, e)));
          p = e + 1;
        }
        break;
      }
      case BMF_BLOCK.CHARS: {
        const n = Math.floor(size / BMF_CHAR_RECORD_SIZE);
        font.charCount = n;
        for (let i = 0; i < n; i += 1) {
          const r = body + i * BMF_CHAR_RECORD_SIZE;
          const id = dv.getUint32(r + 0, true);
          font.chars.set(id, {
            id,
            x: dv.getUint16(r + 4, true),
            y: dv.getUint16(r + 6, true),
            width: dv.getUint16(r + 8, true),
            height: dv.getUint16(r + 10, true),
            xoffset: dv.getInt16(r + 12, true),
            yoffset: dv.getInt16(r + 14, true),
            xadvance: dv.getInt16(r + 16, true),
            page: bytes[r + 18],
            chnl: bytes[r + 19],
          });
        }
        break;
      }
      case BMF_BLOCK.KERNING: {
        const n = Math.floor(size / BMF_KERNING_RECORD_SIZE);
        font.kerningCount = n;
        for (let i = 0; i < n; i += 1) {
          const r = body + i * BMF_KERNING_RECORD_SIZE;
          const first = dv.getUint32(r + 0, true);
          const second = dv.getUint32(r + 4, true);
          font.kernings.set(((first & 0xffff) << 16) | (second & 0xffff), dv.getInt16(r + 8, true));
        }
        break;
      }
      default:
        /* Unknown block: skipped by its declared size, as the format intends. */
        break;
    }
    off = body + size;
  }
  font.bytesConsumed = off;
  if (!font.info || !font.common) throw new Error('bmfont: missing info/common block');
  return font;
}

/** Kerning amount between two codepoints (0 when absent). */
export function bmFontKerning(font, a, b) {
  if (!font || !font.kernings || font.kernings.size === 0) return 0;
  return font.kernings.get(((a & 0xffff) << 16) | (b & 0xffff)) ?? 0;
}

/**
 * Lay a string out with real BMFont metrics.
 * @returns {{glyphs:Array, width:number, height:number, missing:number}}
 *   glyph: { code, page, src:[x,y,w,h], dst:[x,y,w,h] }
 */
export function layoutBmFontText(font, text, { x = 0, y = 0, scale = 1 } = {}) {
  const out = { glyphs: [], width: 0, height: 0, missing: 0 };
  if (!font || typeof text !== 'string' || text.length === 0) return out;
  const lineHeight = font.common.lineHeight * scale;
  let penX = x;
  let penY = y;
  let lineW = 0;
  let lines = 1;
  let prev = -1;
  for (const ch of text) {
    const code = ch.codePointAt(0);
    if (code === 10) {
      out.width = Math.max(out.width, lineW);
      lineW = 0; penX = x; penY += lineHeight; lines += 1; prev = -1;
      continue;
    }
    const g = font.chars.get(code);
    if (!g) { out.missing += 1; prev = -1; continue; }
    if (prev >= 0) {
      const k = bmFontKerning(font, prev, code) * scale;
      penX += k; lineW += k;
    }
    if (g.width > 0 && g.height > 0) {
      out.glyphs.push({
        code,
        page: g.page,
        src: [g.x, g.y, g.width, g.height],
        dst: [penX + g.xoffset * scale, penY + g.yoffset * scale, g.width * scale, g.height * scale],
      });
    }
    const adv = g.xadvance * scale;
    penX += adv;
    lineW += adv;
    prev = code;
  }
  out.width = Math.max(out.width, lineW);
  out.height = lines * lineHeight;
  return out;
}

/* ---------------------------------------------------------------------------
 * Minimal .anm2 XML parser
 *
 * Deliberately small: the anm2 files are machine-written, attribute-only XML
 * with no text nodes, no CDATA and no entities beyond the standard five.
 * ------------------------------------------------------------------------- */

const XML_ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };

function decodeEntities(s) {
  if (s.indexOf('&') < 0) return s;
  return s.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (m, body) => {
    if (body[0] === '#') {
      const code = body[1] === 'x' || body[1] === 'X'
        ? parseInt(body.slice(2), 16)
        : parseInt(body.slice(1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : m;
    }
    return XML_ENTITIES[body] ?? m;
  });
}

const ATTR_RE = /([A-Za-z_:][\w.:-]*)\s*=\s*("([^"]*)"|'([^']*)')/g;

function parseAttributes(src) {
  const attrs = Object.create(null);
  ATTR_RE.lastIndex = 0;
  let m;
  while ((m = ATTR_RE.exec(src)) !== null) {
    attrs[m[1]] = decodeEntities(m[3] !== undefined ? m[3] : (m[4] ?? ''));
  }
  return attrs;
}

/**
 * Parse attribute-only XML into a node tree.
 * @param {string} text
 * @returns {{name:string, attrs:object, children:Array}} root node
 */
export function parseXml(text) {
  if (typeof text !== 'string') throw new Error('parseXml: expected a string');
  const root = { name: '#document', attrs: Object.create(null), children: [] };
  const stack = [root];
  const tagRe = /<(\/)?([A-Za-z_:][\w.:-]*)((?:[^>"']|"[^"]*"|'[^']*')*?)(\/)?>|<\?[\s\S]*?\?>|<!--[\s\S]*?-->|<!\[CDATA\[[\s\S]*?\]\]>|<![^>]*>/g;
  let m;
  while ((m = tagRe.exec(text)) !== null) {
    if (m[2] === undefined) continue; /* declaration / comment / doctype */
    const closing = m[1] === '/';
    const name = m[2];
    const selfClosing = m[4] === '/';
    if (closing) {
      for (let i = stack.length - 1; i > 0; i -= 1) {
        if (stack[i].name === name) { stack.length = i; break; }
      }
      continue;
    }
    const node = { name, attrs: parseAttributes(m[3] ?? ''), children: [] };
    stack[stack.length - 1].children.push(node);
    if (!selfClosing) stack.push(node);
  }
  return root;
}

function childrenNamed(node, name) {
  return node ? node.children.filter((c) => c.name === name) : [];
}
function firstNamed(node, name) {
  return node ? node.children.find((c) => c.name === name) ?? null : null;
}
function num(attrs, key, fallback = 0) {
  const v = attrs?.[key];
  if (v === undefined || v === '') return fallback;
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}
function bool(attrs, key, fallback = true) {
  const v = attrs?.[key];
  if (v === undefined) return fallback;
  return v === 'true' || v === 'True' || v === '1';
}

/**
 * Parse an .anm2 document.
 *
 * Root element is `<AnimatedActor>` in the real files.
 *
 * @param {string} text
 * @returns {{
 *   info: object,
 *   spritesheets: Map<number,string>,
 *   layers: Map<number,{id:number,name:string,spritesheetId:number}>,
 *   nulls: Array, defaultAnimation: string|null, animations: Array
 * }}
 */
export function parseAnm2(text) {
  const doc = parseXml(text);
  const actor = firstNamed(doc, 'AnimatedActor') ?? firstNamed(doc, 'Anm2') ?? doc;
  const infoNode = firstNamed(actor, 'Info');
  const content = firstNamed(actor, 'Content');
  const animsNode = firstNamed(actor, 'Animations');

  const spritesheets = new Map();
  for (const s of childrenNamed(firstNamed(content, 'Spritesheets'), 'Spritesheet')) {
    spritesheets.set(num(s.attrs, 'Id', 0), s.attrs.Path ?? '');
  }

  const layers = new Map();
  for (const l of childrenNamed(firstNamed(content, 'Layers'), 'Layer')) {
    const id = num(l.attrs, 'Id', 0);
    layers.set(id, { id, name: l.attrs.Name ?? '', spritesheetId: num(l.attrs, 'SpritesheetId', 0) });
  }

  const nulls = childrenNamed(firstNamed(content, 'Nulls'), 'Null')
    .map((n) => ({ id: num(n.attrs, 'Id', 0), name: n.attrs.Name ?? '' }));

  const readFrame = (f) => ({
    xPosition: num(f.attrs, 'XPosition', 0),
    yPosition: num(f.attrs, 'YPosition', 0),
    xPivot: num(f.attrs, 'XPivot', 0),
    yPivot: num(f.attrs, 'YPivot', 0),
    xCrop: num(f.attrs, 'XCrop', 0),
    yCrop: num(f.attrs, 'YCrop', 0),
    width: num(f.attrs, 'Width', 0),
    height: num(f.attrs, 'Height', 0),
    xScale: num(f.attrs, 'XScale', 100),
    yScale: num(f.attrs, 'YScale', 100),
    delay: num(f.attrs, 'Delay', 1),
    visible: bool(f.attrs, 'Visible', true),
    redTint: num(f.attrs, 'RedTint', 255),
    greenTint: num(f.attrs, 'GreenTint', 255),
    blueTint: num(f.attrs, 'BlueTint', 255),
    alphaTint: num(f.attrs, 'AlphaTint', 255),
    redOffset: num(f.attrs, 'RedOffset', 0),
    greenOffset: num(f.attrs, 'GreenOffset', 0),
    blueOffset: num(f.attrs, 'BlueOffset', 0),
    rotation: num(f.attrs, 'Rotation', 0),
    interpolated: bool(f.attrs, 'Interpolated', false),
  });

  const animations = childrenNamed(animsNode, 'Animation').map((a) => {
    const layerAnimations = childrenNamed(firstNamed(a, 'LayerAnimations'), 'LayerAnimation')
      .map((la, order) => {
        const frames = childrenNamed(la, 'Frame').map(readFrame);
        return {
          layerId: num(la.attrs, 'LayerId', 0),
          visible: bool(la.attrs, 'Visible', true),
          order,
          frames,
          totalDelay: frames.reduce((sum, f) => sum + f.delay, 0),
        };
      });
    return {
      name: a.attrs.Name ?? '',
      frameNum: num(a.attrs, 'FrameNum', 0),
      loop: bool(a.attrs, 'Loop', false),
      rootFrames: childrenNamed(firstNamed(a, 'RootAnimation'), 'Frame').map(readFrame),
      layerAnimations,
      nullAnimations: childrenNamed(firstNamed(a, 'NullAnimations'), 'NullAnimation').length,
      triggers: childrenNamed(firstNamed(a, 'Triggers'), 'Trigger').length,
    };
  });

  return {
    info: {
      fps: num(infoNode?.attrs, 'Fps', 30),
      version: infoNode?.attrs?.Version ?? null,
      createdBy: infoNode?.attrs?.CreatedBy ?? null,
    },
    spritesheets,
    layers,
    nulls,
    defaultAnimation: animsNode?.attrs?.DefaultAnimation ?? null,
    animations,
  };
}

/** Find an animation by name (falls back to DefaultAnimation, then the first). */
export function anm2Animation(doc, name = null) {
  if (!doc || !doc.animations.length) return null;
  if (name) {
    const hit = doc.animations.find((a) => a.name === name);
    if (hit) return hit;
  }
  if (doc.defaultAnimation) {
    const hit = doc.animations.find((a) => a.name === doc.defaultAnimation);
    if (hit) return hit;
  }
  return doc.animations[0];
}

/**
 * The frame a LayerAnimation shows at animation-frame `t`, honouring Delay.
 * [CONVENTION C3] a layer whose delays sum short of the animation holds its
 * last frame; [CONVENTION C2] no interpolation is applied.
 */
export function anm2FrameAt(layerAnimation, t = 0) {
  const frames = layerAnimation?.frames ?? [];
  if (!frames.length) return null;
  let acc = 0;
  for (const f of frames) {
    acc += Math.max(1, f.delay);
    if (t < acc) return f;
  }
  return frames[frames.length - 1];
}

/**
 * Resolve one animation frame into flat layer draw records, in the anm2's own
 * draw order (document order of `<LayerAnimation>`).
 *
 * @returns {Array<{layerId, layerName, spritesheetId, spritesheetPath,
 *   src:[x,y,w,h], dst:[x,y,w,h], color:[r,g,b,a], rotation, order}>}
 */
export function anm2Composition(doc, animationName = null, t = 0, { scale = ANM2_UNIT_SCALE } = {}) {
  const anim = anm2Animation(doc, animationName);
  if (!anim) return [];
  const out = [];
  for (const la of anim.layerAnimations) {
    if (!la.visible) continue;
    const f = anm2FrameAt(la, t);
    if (!f || !f.visible) continue;
    if (f.width <= 0 || f.height <= 0) continue;
    const layer = doc.layers.get(la.layerId) ?? null;
    const sheetId = layer ? layer.spritesheetId : 0;
    out.push({
      layerId: la.layerId,
      layerName: layer?.name ?? `layer${la.layerId}`,
      spritesheetId: sheetId,
      spritesheetPath: doc.spritesheets.get(sheetId) ?? null,
      order: la.order,
      src: [f.xCrop, f.yCrop, f.width, f.height],
      dst: [
        (f.xPosition - f.xPivot) * scale,
        (f.yPosition - f.yPivot) * scale,
        f.width * (f.xScale / 100) * scale,
        f.height * (f.yScale / 100) * scale,
      ],
      color: [f.redTint / 255, f.greenTint / 255, f.blueTint / 255, f.alphaTint / 255],
      rotation: f.rotation,
      interpolated: f.interpolated,
    });
  }
  return out;
}

/* ---------------------------------------------------------------------------
 * Native menu state normalisation
 * ------------------------------------------------------------------------- */

/**
 * Accept either the raw Update-slice sparse field names or the input bridge's
 * `snapshot().menu` shape. Nothing here is a PE predicate: the mapping from
 * these fields to "what is on screen" is this module's convention.
 */
export function normalizeMenuState(input) {
  const s = input ?? {};
  const menuState23a74 = (s.menuState23a74 ?? s.menuState ?? 0) | 0;
  const promptObject = (s.genericPromptActiveObject ?? 0) | 0;
  const promptFlag = (s.genericPromptActiveFlag ?? 0) & 0xff;
  const promptActive = s.promptActive !== undefined
    ? !!s.promptActive
    : (s.submitArmed !== undefined
      ? !!s.submitArmed
      : (promptObject !== 0 && promptFlag !== 0));
  return {
    menuState23a74,
    open: menuState23a74 !== 0,
    selection: (s.selection ?? s.menuSelection ?? 0) | 0,
    promptActive,
    promptSelection: (s.promptSelection ?? s.genericPromptSubmittedSelection ?? 0) | 0,
    promptPostUpdateFlag: (s.promptPostUpdateFlag ?? s.genericPromptPostUpdateFlag ?? 0) & 0xff,
    promptObject,
    /* Animation timeline position, in anm2 frames. Optional. */
    frame: (s.frame ?? s.animationFrame ?? 0) | 0,
  };
}

/* ---------------------------------------------------------------------------
 * Scene
 * ------------------------------------------------------------------------- */

function joinPath(root, rel) {
  if (!root) return rel;
  return `${String(root).replace(/\/+$/, '')}/${rel}`;
}

/** Case variants for a resource name: the anm2 says "TitleMenu.png", disk says "titlemenu.png". */
function nameCandidates(name) {
  const seen = new Set();
  const out = [];
  const push = (v) => { if (v && !seen.has(v)) { seen.add(v); out.push(v); } };
  push(name);
  push(name.toLowerCase());
  push(name.toUpperCase());
  const dot = name.lastIndexOf('.');
  if (dot > 0) {
    const stem = name.slice(0, dot);
    const ext = name.slice(dot);
    push(stem.toLowerCase() + ext.toLowerCase());
    push(stem + ext.toLowerCase());
    push(stem.charAt(0).toUpperCase() + stem.slice(1).toLowerCase() + ext.toLowerCase());
  }
  return out;
}

/**
 * Build the menu presentation scene.
 *
 * @param {object}   opts
 * @param {(path:string)=>(Uint8Array|Promise<Uint8Array>)} opts.readFile
 *        Injected file reader. Browser: `Module.FS.readFile`. Node tests: fs.
 *        It MAY throw for a missing file — the scene catches, logs and skips.
 * @param {(msg:string)=>void} [opts.log]
 * @param {string}   [opts.root=DEFAULT_RESOURCE_ROOT] resource root
 * @param {string}   [opts.animation='Idle'] animation name in titlemenu.anm2
 * @param {string}   [opts.fontName='upheaval']
 * @param {number}   [opts.textScale=ANM2_UNIT_SCALE]
 */
export function createMenuScene({
  readFile,
  log = null,
  root = DEFAULT_RESOURCE_ROOT,
  animation = 'Idle',
  fontName = DEFAULT_FONT,
  textScale = ANM2_UNIT_SCALE,
} = {}) {
  if (typeof readFile !== 'function') throw new Error('createMenuScene: readFile is required');

  const say = (msg) => { try { if (log) log(`[menu-scene] ${msg}`); } catch { /* logging must never break a frame */ } };

  const stats = {
    loaded: false,
    loadErrors: [],
    missing: [],
    textures: 0,
    textureBytes: 0,
    fontChars: 0,
    fontKernings: 0,
    anm2Animations: 0,
    anm2Layers: 0,
    anm2Spritesheets: 0,
    compositionLayers: 0,
    clampedRects: 0,
    droppedRects: 0,
    missingGlyphs: 0,
    frames: 0,
    lastCommandCount: 0,
    lastSpriteCount: 0,
  };

  /** key -> { key, path, bytes, width, height } */
  const textureMap = new Map();
  let anm2 = null;
  let font = null;
  let fontPageKeys = [];
  let cursorKey = null;
  let composition = [];
  let compositionT = null;
  let state = normalizeMenuState(null);
  let commandList = [];
  let loadPromise = null;

  async function tryRead(relPath) {
    const full = joinPath(root, relPath);
    try {
      const bytes = asBytes(await readFile(full));
      if (!bytes || bytes.length === 0) throw new Error('empty');
      return { path: full, bytes };
    } catch (err) {
      stats.missing.push(full);
      say(`missing/unreadable: ${full} (${err && err.message ? err.message : err})`);
      return null;
    }
  }

  /** Read a file trying case variants of its basename. */
  async function tryReadAnyCase(dir, name) {
    for (const candidate of nameCandidates(name)) {
      const full = joinPath(root, `${dir}/${candidate}`);
      try {
        const bytes = asBytes(await readFile(full));
        if (bytes && bytes.length) return { path: full, bytes, name: candidate };
      } catch { /* try the next spelling */ }
    }
    stats.missing.push(joinPath(root, `${dir}/${name}`));
    say(`missing/unreadable (all case variants): ${joinPath(root, `${dir}/${name}`)}`);
    return null;
  }

  function registerTexture(key, path, bytes) {
    const size = readPngSize(bytes);
    if (!size) {
      say(`not a PNG (no IHDR): ${path} — texture skipped`);
      stats.loadErrors.push(`bad-png:${path}`);
      return null;
    }
    const entry = { key, path, bytes, width: size.width, height: size.height };
    textureMap.set(key, entry);
    stats.textures = textureMap.size;
    stats.textureBytes += bytes.length;
    return entry;
  }

  async function load() {
    if (loadPromise) return loadPromise;
    loadPromise = (async () => {
      /* --- titlemenu.anm2 + its spritesheets ---------------------------- */
      const anm2File = await tryRead(TITLE_ANM2);
      if (anm2File) {
        try {
          anm2 = parseAnm2(decodeUtf8(anm2File.bytes));
          stats.anm2Animations = anm2.animations.length;
          stats.anm2Layers = anm2.layers.size;
          stats.anm2Spritesheets = anm2.spritesheets.size;
          say(`titlemenu.anm2: ${anm2.animations.length} animation(s), ` +
              `${anm2.layers.size} layer(s), ${anm2.spritesheets.size} spritesheet(s)`);
        } catch (err) {
          anm2 = null;
          stats.loadErrors.push(`anm2:${err.message}`);
          say(`titlemenu.anm2 parse failed: ${err.message}`);
        }
      }
      if (anm2) {
        for (const [id, sheetPath] of anm2.spritesheets) {
          if (!sheetPath) continue;
          const file = await tryReadAnyCase(MENU_DIR, sheetPath);
          if (!file) continue;
          registerTexture(`sheet:${id}`, file.path, file.bytes);
        }
      }

      /* --- font --------------------------------------------------------- */
      const fntFile = await tryRead(`${FONT_DIR}/${fontName}.fnt`);
      if (fntFile) {
        try {
          font = parseBmFontBinary(fntFile.bytes);
          stats.fontChars = font.charCount;
          stats.fontKernings = font.kerningCount;
          say(`${fontName}.fnt: "${font.info.fontName}" size=${font.info.fontSize} ` +
              `lineHeight=${font.common.lineHeight} base=${font.common.base} ` +
              `sheet=${font.common.scaleW}x${font.common.scaleH} pages=${font.common.pages} ` +
              `chars=${font.charCount} kernings=${font.kerningCount}`);
        } catch (err) {
          font = null;
          stats.loadErrors.push(`fnt:${err.message}`);
          say(`${fontName}.fnt parse failed: ${err.message}`);
        }
      }
      if (font) {
        fontPageKeys = [];
        const pages = font.pages.length ? font.pages : [`${fontName}_0.png`];
        for (let i = 0; i < pages.length; i += 1) {
          const file = await tryReadAnyCase(FONT_DIR, pages[i]);
          if (!file) { fontPageKeys.push(null); continue; }
          const key = `font:${fontName}#${i}`;
          registerTexture(key, file.path, file.bytes);
          fontPageKeys.push(textureMap.has(key) ? key : null);
        }
      }

      /* --- cursor (drawn whole; no invented sub-rect) -------------------- */
      const cursorFile = await tryRead(CURSOR_PNG);
      if (cursorFile) {
        const entry = registerTexture('cursor', cursorFile.path, cursorFile.bytes);
        cursorKey = entry ? 'cursor' : null;
      }

      /* --- frame-0 composition ----------------------------------------- */
      rebuildComposition(0);
      stats.loaded = true;
      say(`load complete: ${stats.textures} texture(s), ` +
          `${composition.length} composition layer(s), ${stats.missing.length} missing`);
    })();
    return loadPromise;
  }

  function rebuildComposition(t) {
    composition = anm2 ? anm2Composition(anm2, animation, t) : [];
    compositionT = t;
    stats.compositionLayers = composition.length;
  }

  /* ------------------------------------------------------------------
   * Command emission
   * ---------------------------------------------------------------- */

  function quad(dst, color, tag, extra = null) {
    return { type: 'quad', dst, color, tag, ...(extra || {}) };
  }

  /**
   * Sprite command with [CONVENTION D] proportional clamping of the source rect
   * to the real sheet bounds. Returns null when nothing survives the clamp.
   */
  function sprite(texKey, src, dst, color, tag, extra = null) {
    const tex = textureMap.get(texKey);
    if (!tex) return null;
    let [sx, sy, sw, sh] = src;
    let [dx, dy, dw, dh] = dst;
    const rawSrc = [sx, sy, sw, sh];
    let clamped = false;

    if (sx < 0) { const cut = -sx; const f = sw > 0 ? cut / sw : 0; sx = 0; sw -= cut; dx += dw * f; dw -= dw * f; clamped = true; }
    if (sy < 0) { const cut = -sy; const f = sh > 0 ? cut / sh : 0; sy = 0; sh -= cut; dy += dh * f; dh -= dh * f; clamped = true; }
    if (sx + sw > tex.width) { const cut = sx + sw - tex.width; const f = sw > 0 ? cut / sw : 0; sw -= cut; dw -= dw * f; clamped = true; }
    if (sy + sh > tex.height) { const cut = sy + sh - tex.height; const f = sh > 0 ? cut / sh : 0; sh -= cut; dh -= dh * f; clamped = true; }

    if (!(sw > 0) || !(sh > 0)) {
      stats.droppedRects += 1;
      say(`src rect entirely outside ${texKey} (${rawSrc.join(',')}) — dropped`);
      return null;
    }
    if (clamped) stats.clampedRects += 1;
    const cmd = {
      type: 'sprite',
      tex: texKey,
      src: [sx, sy, sw, sh],
      dst: [dx, dy, dw, dh],
      color,
      tag,
      ...(extra || {}),
    };
    if (clamped) { cmd.srcRaw = rawSrc; cmd.clamped = true; cmd.convention = 'D'; }
    return cmd;
  }

  /**
   * Text command, pre-expanded into `glyphs` sprite commands (see the header:
   * draw `glyphs`, or handle `type:'text'` natively — not both).
   */
  function text(str, at, color, tag, scale = textScale, extra = null) {
    if (!font) return null;
    const laid = layoutBmFontText(font, str, { x: at[0], y: at[1], scale });
    stats.missingGlyphs += laid.missing;
    const glyphs = [];
    for (const g of laid.glyphs) {
      const key = fontPageKeys[g.page] ?? fontPageKeys[0] ?? null;
      if (!key) continue;
      const cmd = sprite(key, g.src, g.dst, color, `${tag}:glyph`, { code: g.code });
      if (cmd) glyphs.push(cmd);
    }
    if (!glyphs.length) return null;
    return {
      type: 'text',
      font: fontName,
      text: str,
      at: [at[0], at[1]],
      color,
      scale,
      glyphs,
      width: laid.width,
      height: laid.height,
      tag,
      ...(extra || {}),
    };
  }

  /** [CONVENTION E] fabricated slot rectangle for a selection index. */
  function slotRect(index) {
    const i = ((index % MENU_SLOTS) + MENU_SLOTS) % MENU_SLOTS;
    return [SLOT_X, SLOT_Y0 + i * SLOT_STEP, SLOT_W, SLOT_H];
  }

  /**
   * Rebuild this frame's draw list from the native menu state.
   * Never throws: any failure degrades to a shorter list.
   */
  function update(menuState) {
    const next = normalizeMenuState(menuState);
    const out = [];
    try {
      state = next;
      stats.frames += 1;

      /* [CONVENTION I] menu closed => nothing at all. */
      if (!next.open) {
        commandList = out;
        stats.lastCommandCount = 0;
        stats.lastSpriteCount = 0;
        return;
      }

      if (compositionT !== next.frame) rebuildComposition(next.frame);

      /* --- 1. real anm2 composition (real sheets, real rects) ---------- */
      for (const layer of composition) {
        const cmd = sprite(
          `sheet:${layer.spritesheetId}`,
          layer.src,
          layer.dst,
          layer.color,
          `anm2:${layer.layerName}`,
          {
            layerId: layer.layerId,
            spritesheetPath: layer.spritesheetPath,
            order: layer.order,
            source: 'anm2',
          },
        );
        if (cmd) out.push(cmd);
      }

      /* --- 2. [CONVENTION E] fabricated selection column ---------------- */
      const sel = ((next.selection % MENU_SLOTS) + MENU_SLOTS) % MENU_SLOTS;
      for (let i = 0; i < MENU_SLOTS; i += 1) {
        const r = slotRect(i);
        const active = i === sel;
        out.push(quad(
          r,
          active ? [1, 0.92, 0.55, 0.85] : [0, 0, 0, 0.35],
          active ? 'slot:selected' : 'slot',
          { convention: 'E', slot: i, selected: active },
        ));
      }
      if (cursorKey) {
        const tex = textureMap.get(cursorKey);
        const r = slotRect(sel);
        const cw = tex.width * ANM2_UNIT_SCALE;
        const ch = tex.height * ANM2_UNIT_SCALE;
        const cmd = sprite(
          cursorKey,
          [0, 0, tex.width, tex.height],
          [r[0] - cw - 6, r[1] + (r[3] - ch) / 2, cw, ch],
          [1, 1, 1, 1],
          'cursor',
          { convention: 'H' },
        );
        if (cmd) out.push(cmd);
      }

      /* --- 3. [CONVENTION F] native-state diagnostics in the real font -- */
      const label = text(
        `MENU ${next.menuState23a74}  SEL ${next.selection}`,
        [SLOT_X, SLOT_Y0 - 34],
        [1, 1, 1, 1],
        'state:menu',
        textScale,
        { convention: 'F' },
      );
      if (label) out.push(label);

      /* --- 4. [CONVENTION G] generic-prompt panel ---------------------- */
      if (next.promptActive) {
        out.push(quad([0, 0, INTERNAL_WIDTH, INTERNAL_HEIGHT], [0, 0, 0, 0.55], 'prompt:dim', { convention: 'G' }));
        out.push(quad([PROMPT_BOX.x, PROMPT_BOX.y, PROMPT_BOX.w, PROMPT_BOX.h], [0.06, 0.05, 0.08, 0.94], 'prompt:panel', { convention: 'G' }));
        out.push(quad([PROMPT_BOX.x + 4, PROMPT_BOX.y + 4, PROMPT_BOX.w - 8, PROMPT_BOX.h - 8], [0.85, 0.82, 0.74, 0.10], 'prompt:panel-inner', { convention: 'G' }));
        const p1 = text(
          `PROMPT ${next.promptObject}/${next.promptActive ? 1 : 0}`,
          [PROMPT_BOX.x + 24, PROMPT_BOX.y + 28],
          [1, 1, 1, 1],
          'state:prompt',
          textScale,
          { convention: 'F' },
        );
        if (p1) out.push(p1);
        const p2 = text(
          `SEL ${next.promptSelection}  POST ${next.promptPostUpdateFlag}`,
          [PROMPT_BOX.x + 24, PROMPT_BOX.y + 28 + (font ? font.common.lineHeight * textScale + 6 : 24)],
          [1, 0.92, 0.55, 1],
          'state:prompt-selection',
          textScale,
          { convention: 'F' },
        );
        if (p2) out.push(p2);
      }
    } catch (err) {
      /* A frame must never throw. */
      say(`update failed, degraded frame: ${err && err.message ? err.message : err}`);
      stats.loadErrors.push(`update:${err && err.message ? err.message : err}`);
    }
    commandList = out;
    stats.lastCommandCount = out.length;
    stats.lastSpriteCount = out.reduce(
      (n, c) => n + (c.type === 'sprite' ? 1 : 0) + (c.type === 'text' ? c.glyphs.length : 0),
      0,
    );
  }

  return {
    load,
    /** PNG bytes for the GL host to upload. Width/height come from IHDR only. */
    textures: () => [...textureMap.values()],
    update,
    /** This frame's draw list. A fresh array per update(); safe to retain. */
    commands: () => commandList,
    size: { width: INTERNAL_WIDTH, height: INTERNAL_HEIGHT },
    stats,
    /* --- introspection (not part of the draw contract) ----------------- */
    get anm2() { return anm2; },
    get font() { return font; },
    get state() { return state; },
    get composition() { return composition.slice(); },
    texture: (key) => textureMap.get(key) ?? null,
    conventions: Object.freeze({
      C1: 'anm2 unit -> internal px is a flat x2 scale',
      C2: 'frame-0 values used verbatim; Interpolated="true" is NOT applied',
      C3: 'a short layer timeline holds its last frame',
      D: 'out-of-sheet source rects are proportionally clamped',
      E: 'the selection column/slot geometry is fabricated; no entry list exists in the slice',
      F: 'all text is a diagnostic of native state, not game copy',
      G: 'the generic-prompt panel layout is fabricated; only the decision to show it is native',
      H: 'cursor position follows the fabricated slot column (texture is real, drawn whole)',
      I: 'menuState23a74 == 0 draws nothing, including the prompt',
    }),
  };
}

export default {
  createMenuScene,
  parseBmFontBinary,
  parseAnm2,
  parseXml,
  anm2Composition,
  anm2Animation,
  anm2FrameAt,
  layoutBmFontText,
  bmFontKerning,
  readPngSize,
  normalizeMenuState,
  INTERNAL_WIDTH,
  INTERNAL_HEIGHT,
  ANM2_UNIT_SCALE,
  MENU_SLOTS,
};
