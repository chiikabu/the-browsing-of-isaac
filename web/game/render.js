/**
 * Canvas 2D renderer for the Isaac-style prototype. Draws one room per
 * frame from a plain snapshot object produced by the engine.
 */

const CELL = 64;
const HUD_TOP = 56;

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.facing = { x: 0, y: 1 };
    this.time = 0;
  }

  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = this.canvas.clientWidth * dpr;
    const h = this.canvas.clientHeight * dpr;
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w;
      this.canvas.height = h;
    }
    return dpr;
  }

  draw(snap) {
    const dpr = this.resize();
    const ctx = this.ctx;
    const W = this.canvas.width / dpr;
    const H = this.canvas.height / dpr;
    this.time += 1 / 60;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = "#101014";
    ctx.fillRect(0, 0, W, H);

    // Scale the room to fit the window, centered, leaving the HUD strip free.
    const gw = snap.gridW, gh = snap.gridH;
    const s = Math.min((W - 24) / (gw * CELL), (H - HUD_TOP - 16) / (gh * CELL));
    const ox = (W - gw * CELL * s) / 2;
    const oy = HUD_TOP + (H - HUD_TOP - gh * CELL * s) / 2;

    ctx.save();
    ctx.translate(ox, oy);
    ctx.scale(s, s);

    this.drawFloor(ctx, snap);
    this.drawDoors(ctx, snap);
    this.drawRocks(ctx, snap);
    for (const b of snap.bombs) this.drawBomb(ctx, b);
    for (const e of snap.enemies) this.drawEnemy(ctx, e);
    this.drawPlayer(ctx, snap);
    for (const ex of snap.explosions) this.drawExplosion(ctx, ex);

    ctx.restore();
    this.drawHearts(ctx, snap.hp, snap.maxHp);
  }

  /* ---- room ---- */

  drawFloor(ctx, snap) {
    const { gridW: gw, gridH: gh, cells } = snap;
    for (let y = 0; y < gh; y++) {
      for (let x = 0; x < gw; x++) {
        const px = x * CELL, py = y * CELL;
        ctx.fillStyle = "#33333a";
        ctx.fillRect(px, py, CELL, CELL);
        ctx.strokeStyle = "#2b2b31";
        ctx.lineWidth = 2;
        ctx.strokeRect(px + 1, py + 1, CELL - 2, CELL - 2);
        if (cells[y * gw + x] === 1) { // pit
          ctx.fillStyle = "#07070a";
          ctx.fillRect(px + 4, py + 4, CELL - 8, CELL - 8);
          ctx.strokeStyle = "#1c1c22";
          ctx.strokeRect(px + 4, py + 4, CELL - 8, CELL - 8);
        }
      }
    }
  }

  drawRocks(ctx, snap) {
    const { gridW: gw, gridH: gh, cells } = snap;
    for (let y = 0; y < gh; y++) {
      for (let x = 0; x < gw; x++) {
        if (cells[y * gw + x] !== 7) continue;
        const px = x * CELL, py = y * CELL;
        const wall = x === 0 || y === 0 || x === gw - 1 || y === gh - 1;
        ctx.fillStyle = wall ? "#4a3b28" : "#6e4a26";
        ctx.fillRect(px + 2, py + 2, CELL - 4, CELL - 4);
        ctx.fillStyle = wall ? "#5c4a33" : "#8a6034";
        ctx.fillRect(px + 6, py + 6, CELL - 20, CELL - 20); // highlight
        ctx.fillStyle = "rgba(0,0,0,0.25)";
        ctx.fillRect(px + 2, py + CELL - 10, CELL - 4, 8); // shadow edge
      }
    }
  }

  drawDoors(ctx, snap) {
    for (const d of snap.doors) {
      const cx = d.x * CELL, cy = d.y * CELL;
      const horiz = d.side === "left" || d.side === "right";
      ctx.fillStyle = "#17171c"; // dark opening
      ctx.fillRect(cx + 4, cy + 4, CELL - 8, CELL - 8);
      ctx.fillStyle = "#6b5433"; // jambs
      if (horiz) {
        ctx.fillRect(cx, cy + 2, 10, CELL - 4);
        ctx.fillRect(cx + CELL - 10, cy + 2, 10, CELL - 4);
      } else {
        ctx.fillRect(cx + 2, cy, CELL - 4, 10);
        ctx.fillRect(cx + 2, cy + CELL - 10, CELL - 4, 10);
      }
      ctx.strokeStyle = "#86683c";
      ctx.lineWidth = 3;
      ctx.strokeRect(cx + 5, cy + 5, CELL - 10, CELL - 10);
    }
  }

  /* ---- actors ---- */

  drawPlayer(ctx, snap) {
    const p = snap.player;
    const cx = p.x * CELL, cy = p.y * CELL;
    const blink = p.iframes > 0 && Math.floor(p.iframes / 4) % 2 === 0;
    ctx.globalAlpha = blink ? 0.35 : 1;

    // shadow
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.beginPath();
    ctx.ellipse(cx, cy + 20, 20, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // body: pale head over red skin tone, Isaac-style
    const r = 21;
    ctx.fillStyle = "#d8c39a";
    ctx.beginPath();
    ctx.arc(cx, cy - 4, r, Math.PI, 0); // head dome
    ctx.fill();
    ctx.fillStyle = "#cfd4dc";
    ctx.beginPath();
    ctx.arc(cx, cy + 8, r * 0.92, 0, Math.PI); // lower body
    ctx.fill();
    ctx.fillStyle = "#cfd4dc";
    ctx.fillRect(cx - r * 0.92, cy + 2, r * 1.84, 10);
    // tears eyes looking toward facing direction
    const fx = p.faceX * 4, fy = p.faceY * 3;
    ctx.fillStyle = "#14141a";
    ctx.beginPath();
    ctx.arc(cx - 7 + fx, cy - 6 + fy, 3.2, 0, Math.PI * 2);
    ctx.arc(cx + 7 + fx, cy - 6 + fy, 3.2, 0, Math.PI * 2);
    ctx.fill();

    // directional indicator (small nose dot toward facing)
    ctx.fillStyle = "#e8e2d2";
    ctx.beginPath();
    ctx.arc(cx + fx * 2.2, cy - 1 + fy * 2.0, 3.4, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 1;
  }

  drawEnemy(ctx, e) {
    const cx = e.x * CELL, cy = e.y * CELL;
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.beginPath();
    ctx.ellipse(cx, cy + 18, 17, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    if (e.kind === "gaper") {
      const pulse = 1 + Math.sin(this.time * 4 + e.seed) * 0.05;
      const r = 17 * pulse;
      ctx.fillStyle = "#c98f76";
      ctx.beginPath(); // fleshy head
      ctx.arc(cx, cy - 2, r, Math.PI, 0);
      ctx.fill();
      ctx.fillStyle = "#a86f58";
      ctx.beginPath();
      ctx.arc(cx, cy + 8, r * 0.85, 0, Math.PI);
      ctx.fill();
      ctx.fillStyle = "#c98f76";
      ctx.fillRect(cx - r * 0.85, cy + 2, r * 1.7, 8);
      ctx.fillStyle = "#1a1216"; // hollow eyes
      ctx.beginPath();
      ctx.arc(cx - 6, cy - 5, 3.4, 0, Math.PI * 2);
      ctx.arc(cx + 6, cy - 5, 3.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#7c2f24"; // open mouth
      ctx.beginPath();
      ctx.ellipse(cx, cy + 6, 4.5, 6, 0, 0, Math.PI * 2);
      ctx.fill();
    } else { // statue
      ctx.fillStyle = "#8d8fa0";
      ctx.fillRect(cx - 16, cy - 14, 32, 30);
      ctx.fillStyle = "#a7aabb";
      ctx.fillRect(cx - 12, cy - 10, 12, 10);
      ctx.fillStyle = "#5f6170";
      ctx.fillRect(cx - 16, cy + 8, 32, 8);
      ctx.fillStyle = "#3c3e49";
      ctx.fillRect(cx - 8, cy - 4, 5, 5);
      ctx.fillRect(cx + 3, cy - 4, 5, 5);
    }

    if (e.hitFlash > 0) {
      ctx.globalAlpha = Math.min(1, e.hitFlash / 8);
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(cx, cy, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  drawBomb(ctx, b) {
    const cx = b.x * CELL, cy = b.y * CELL;
    ctx.fillStyle = "#15151a";
    ctx.beginPath();
    ctx.arc(cx, cy, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#3a3a44";
    ctx.beginPath();
    ctx.arc(cx - 4, cy - 4, 4, 0, Math.PI * 2);
    ctx.fill();
    // sparking fuse
    const flick = Math.random() * 3;
    ctx.strokeStyle = "#c8a34a";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(cx + 6, cy - 11);
    ctx.quadraticCurveTo(cx + 12, cy - 18, cx + 8, cy - 22 - flick);
    ctx.stroke();
    ctx.fillStyle = Math.floor(b.fuse / 6) % 2 ? "#ffd75e" : "#ff8a3c";
    ctx.beginPath();
    ctx.arc(cx + 8, cy - 23 - flick, 3 + flick, 0, Math.PI * 2);
    ctx.fill();
  }

  drawExplosion(ctx, ex) {
    const t = ex.age / ex.life; // 0..1
    const cx = ex.x * CELL, cy = ex.y * CELL;
    const r = 30 + t * 55;
    ctx.globalAlpha = 1 - t;
    ctx.fillStyle = "#ff9a3c";
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffd75e";
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.62, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  /* ---- hud ---- */

  drawHearts(ctx, hp, maxHp) {
    const total = maxHp / 2; // hp counted in halves
    for (let i = 0; i < total; i++) {
      const filled = hp >= (i + 1) * 2;
      const half = !filled && hp === i * 2 + 1;
      this.drawHeart(ctx, 26 + i * 40, 28, filled ? 1 : half ? 0.5 : 0);
    }
  }

  drawHeart(ctx, cx, cy, fill) {
    const s = 13;
    const path = () => {
      ctx.beginPath();
      ctx.moveTo(cx, cy + s * 0.85);
      ctx.bezierCurveTo(cx - s * 1.4, cy - s * 0.15, cx - s * 0.55, cy - s * 1.05, cx, cy - s * 0.35);
      ctx.bezierCurveTo(cx + s * 0.55, cy - s * 1.05, cx + s * 1.4, cy - s * 0.15, cx, cy + s * 0.85);
      ctx.closePath();
    };
    path();
    ctx.fillStyle = "#241417";
    ctx.fill(); // empty socket behind
    if (fill > 0) {
      ctx.save();
      path();
      ctx.clip();
      ctx.fillStyle = "#c92a20";
      ctx.fillRect(cx - s * 1.5, cy - s * 1.1, s * 3, s * 2);
      if (fill === 0.5) {
        ctx.fillStyle = "#241417";
        ctx.fillRect(cx, cy - s * 1.1, s * 1.5, s * 2.2);
      }
      ctx.fillStyle = "rgba(255,255,255,0.35)";
      ctx.beginPath();
      ctx.ellipse(cx - s * 0.45, cy - s * 0.35, s * 0.28, s * 0.18, -0.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    path();
    ctx.strokeStyle = "#0c0507";
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}
