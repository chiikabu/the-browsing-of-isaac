/**
 * Canvas 2D renderer for the wasm hybrid demo.
 *
 * Reads room grid cells and entities straight out of the wasm linear memory
 * every frame — no host-side copies of the world state. Memory layout is the
 * proto-Room block published by demo.js (see PROTO_ROOM below):
 *
 *   ROOM_BASE + 0x00  u32 magic 'ISAC'
 *   ROOM_BASE + 0x04  u32 cell-array offset within the block
 *   ROOM_BASE + 0x0c  u32 grid width   (real Room+0xc field)
 *   ROOM_BASE + 0x10  u32 grid height  (real Room+0x10 field)
 *   ROOM_BASE + off   u32[w*h] cell types (0 floor, 7 rock, 1 pit, …)
 *
 *   ENT_BASE + 0x00            u32 entity count
 *   ENT_BASE + 4 + i*32        { id,type,variant:u32; x,y,hp:f32 } per entity
 */

export const CELL_TYPES = Object.freeze({
  0: { color: "#4a4a52", label: "floor" },
  1: { color: "#0a0a0a", label: "pit" },
  7: { color: "#8a5a2b", label: "rock" },
});

const ENTITY_COLORS = Object.freeze({
  1: "#3fa34d", // player tint (body)
  10: "#d64545", // enemies
  20: "#d9a521", // pickups
});

export class Renderer {
  /**
   * @param {HTMLCanvasElement} canvas
   * @param {DataView} view DataView over the wasm module's linear memory.
   */
  constructor(canvas, view) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.view = view;
    this.roomBase = 0;
    this.entBase = 0;
    this.cellSize = Math.floor(Math.min(
      canvas.width / 16,
      canvas.height / 9,
    ));
  }

  /** Point the renderer at the live room/entity blocks. */
  setBlocks(roomBase, entBase) {
    this.roomBase = roomBase;
    this.entBase = entBase;
  }

  #grid() {
    const base = this.roomBase;
    const w = this.view.getUint32(base + 0x0c, true);
    const h = this.view.getUint32(base + 0x10, true);
    const off = this.view.getUint32(base + 0x04, true);
    return { w, h, off };
  }

  /** @returns {{ id:number, type:number, variant:number, x:number, y:number }[]} */
  readEntities() {
    const count = this.view.getUint32(this.entBase, true);
    const out = [];
    for (let i = 0; i < count; i++) {
      const b = this.entBase + 4 + i * 32;
      out.push({
        id: this.view.getUint32(b + 0, true),
        type: this.view.getUint32(b + 4, true),
        variant: this.view.getUint32(b + 8, true),
        x: this.view.getFloat32(b + 12, true),
        y: this.view.getFloat32(b + 16, true),
      });
    }
    return out;
  }

  drawGridCell(x, y, type) {
    const { w, off } = this.#grid();
    const t = type ?? this.view.getUint32(this.roomBase + off + (y * w + x) * 4, true);
    const spec = CELL_TYPES[t] ?? { color: "#8040c0", label: `t${t}` };
    const s = this.cellSize;
    this.ctx.fillStyle = spec.color;
    this.ctx.fillRect(x * s, y * s, s, s);
    if (t === 7) { // rock shading so walls read as solid
      this.ctx.fillStyle = "rgba(0,0,0,0.25)";
      this.ctx.fillRect(x * s, y * s + s - s / 5, s, s / 5);
    }
  }

  drawEntity(ent) {
    const s = this.cellSize;
    const cx = ent.x * s;
    const cy = ent.y * s;
    const size = ent.type === 1 ? s * 0.62 : s * 0.5;
    if (ent.type === 1) {
      // player highlight ring
      this.ctx.strokeStyle = "#eaffea";
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.arc(cx, cy, size * 0.95, 0, Math.PI * 2);
      this.ctx.stroke();
    }
    this.ctx.fillStyle = ENTITY_COLORS[ent.type] ?? "#bbbbbb";
    this.ctx.fillRect(cx - size / 2, cy - size / 2, size, size);
  }

  /**
   * One frame: clear → every grid cell as a rect → every entity as a rect.
   */
  draw() {
    const { canvas, ctx } = this;
    const { w, h } = this.#grid();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) this.drawGridCell(x, y);
    }
    for (const ent of this.readEntities()) this.drawEntity(ent);
    return { gridW: w, gridH: h };
  }
}
