/**
 * Parse Isaac ANM2 XML (AnimatedActor) for a single presentation frame.
 *
 * Zero imports: works in the browser and under node --test. Sheet paths and
 * crop rects come from the file; the chosen animation/layer may be a
 * [BRIDGE CONVENTION] default (WalkDown, then DefaultAnimation, then first
 * Layer with frames).
 */

function attrMap(tagInner) {
  const out = Object.create(null);
  const re = /([A-Za-z_][\w-]*)\s*=\s*"([^"]*)"/g;
  let m;
  while ((m = re.exec(tagInner))) out[m[1]] = m[2];
  return out;
}

function num(attrs, key, fallback = 0) {
  const raw = attrs[key];
  if (raw == null || raw === "") return fallback;
  const n = Number(raw);
  return Number.isFinite(n) ? n : fallback;
}

/** gfx-relative POSIX path. ANM2 Paths are already gfx-relative. */
export function normalizeSheetRel(path) {
  let p = String(path || "").replace(/\\/g, "/").replace(/^\/+/, "");
  if (!p) return "";
  if (p.toLowerCase().startsWith("resources/")) p = p.slice("resources/".length);
  if (!p.toLowerCase().startsWith("gfx/")) p = `gfx/${p}`;
  return p;
}

export function parseAnm2Xml(xml) {
  const text = String(xml || "");
  const sheets = [];
  const sheetRe = /<Spritesheet\b([^>]*)\/?>/gi;
  let m;
  while ((m = sheetRe.exec(text))) {
    const a = attrMap(m[1]);
    sheets.push({
      id: num(a, "Id", sheets.length),
      path: String(a.Path || "").replace(/\\/g, "/"),
    });
  }

  const layers = [];
  const layerRe = /<Layer\b([^>]*)\/?>/gi;
  while ((m = layerRe.exec(text))) {
    const a = attrMap(m[1]);
    layers.push({
      id: num(a, "Id", layers.length),
      name: String(a.Name || ""),
      sheetId: num(a, "SpritesheetId", 0),
    });
  }

  let defaultAnim = "";
  const animsHead = text.match(/<Animations\b([^>]*)>/i);
  if (animsHead) defaultAnim = attrMap(animsHead[1]).DefaultAnimation || "";

  const animations = [];
  const animRe = /<Animation\b([^>]*)>([\s\S]*?)<\/Animation>/gi;
  while ((m = animRe.exec(text))) {
    const a = attrMap(m[1]);
    const body = m[2];
    const layerAnims = [];
    const laRe = /<LayerAnimation\b([^>]*)>([\s\S]*?)<\/LayerAnimation>/gi;
    let la;
    while ((la = laRe.exec(body))) {
      const laAttr = attrMap(la[1]);
      const frames = [];
      const frRe = /<Frame\b([^>]*)\/?>/gi;
      let fr;
      while ((fr = frRe.exec(la[2]))) {
        const f = attrMap(fr[1]);
        frames.push({
          xCrop: num(f, "XCrop"),
          yCrop: num(f, "YCrop"),
          width: num(f, "Width"),
          height: num(f, "Height"),
          xPivot: num(f, "XPivot"),
          yPivot: num(f, "YPivot"),
        });
      }
      layerAnims.push({
        layerId: num(laAttr, "LayerId", 0),
        frames,
      });
    }
    animations.push({
      name: String(a.Name || ""),
      layers: layerAnims,
    });
  }

  return { sheets, layers, defaultAnim, animations };
}

function findAnim(parsed, prefer) {
  if (!parsed.animations.length) return null;
  const names = [];
  if (prefer) names.push(prefer);
  names.push("WalkDown", parsed.defaultAnim);
  for (const name of names) {
    if (!name) continue;
    const hit = parsed.animations.find((a) => a.name === name);
    if (hit) return hit;
  }
  return parsed.animations[0];
}

function findLayer(parsed, anim) {
  if (!anim) return null;
  const byId = new Map(parsed.layers.map((l) => [l.id, l]));
  const ranked = ["body", "layer0"];
  for (const want of ranked) {
    for (const la of anim.layers) {
      if (!la.frames.length) continue;
      const meta = byId.get(la.layerId);
      if (meta && meta.name.toLowerCase() === want) {
        return { la, meta };
      }
    }
  }
  for (const la of anim.layers) {
    if (!la.frames.length) continue;
    return { la, meta: byId.get(la.layerId) || { id: la.layerId, name: "", sheetId: 0 } };
  }
  return null;
}

/**
 * @returns {{sheetRel: string, src: number[], w: number, h: number, anim: string, layer: string, via: string} | null}
 */
export function spriteFromAnm2(xml, options = {}) {
  const parsed = parseAnm2Xml(xml);
  const anim = findAnim(parsed, options.anim);
  const picked = findLayer(parsed, anim);
  if (!anim || !picked) return null;
  const frame = picked.la.frames[0];
  const sheet = parsed.sheets.find((s) => s.id === picked.meta.sheetId) || parsed.sheets[0];
  if (!sheet || !frame) return null;
  const src = [frame.xCrop, frame.yCrop, frame.width, frame.height];
  const usedDefault = !options.anim || options.anim !== anim.name;
  return {
    sheetRel: normalizeSheetRel(sheet.path),
    src,
    w: frame.width,
    h: frame.height,
    anim: anim.name,
    layer: picked.meta.name || "",
    via: usedDefault
      ? `[BRIDGE CONVENTION] ${anim.name} ${picked.meta.name || "layer"}`
      : `${anim.name} ${picked.meta.name || "layer"}`,
  };
}

export default { normalizeSheetRel, parseAnm2Xml, spriteFromAnm2 };
