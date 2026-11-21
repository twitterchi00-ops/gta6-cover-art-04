// Vice Cover Lab — the cover renderer. Draws the multi-panel GTA-style poster:
// photo panels (each cropped and positioned), a synthwave sun and skyline in the
// title band, bold system-font lettering, and a colour grade over everything.
// No font files: all lettering uses the system font stack.

/** A small deterministic PRNG (mulberry32) so the skyline is identical every run. */
export function seededRandom(seed) {
  let a = seed >>> 0;
  return function next() {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** The five layouts: each names its panels as fractions [x, y, w, h] of the canvas. */
export const LAYOUTS = {
  stack: [[0, 0, 1, 0.44], [0, 0.44, 1, 0.30], [0, 0.74, 1, 0.26]],
  grid: [[0, 0, 0.5, 0.5], [0.5, 0, 0.5, 0.5], [0, 0.5, 0.5, 0.5], [0.5, 0.5, 0.5, 0.5]],
  hero: [[0, 0, 0.62, 1], [0.62, 0, 0.38, 0.5], [0.62, 0.5, 0.38, 0.5]],
  split: [[0, 0, 0.5, 1], [0.5, 0, 0.5, 1]],
  strip: [[0, 0, 0.25, 1], [0.25, 0, 0.25, 1], [0.5, 0, 0.25, 1], [0.75, 0, 0.25, 1]],
};

/** The five colour grades: sky, panel tint, sun colours and accent. */
export const GRADES = {
  vice: { sky: ['#2b0f4a', '#ff5e78', '#ffb03d'], tint: 'rgba(255, 94, 120, 0.18)', sun: ['#ffe66d', '#ff5e78'], accent: '#ff5da2', title: '#ffffff' },
  neon: { sky: ['#0b0626', '#7b2ff7', '#00e5ff'], tint: 'rgba(0, 229, 255, 0.16)', sun: ['#ff6ec7', '#7b2ff7'], accent: '#00e5ff', title: '#ffffff' },
  gold: { sky: ['#1d1206', '#c97b1e', '#ffd97a'], tint: 'rgba(255, 180, 60, 0.20)', sun: ['#fff3b0', '#ff9a3d'], accent: '#ffb03d', title: '#fff8e7' },
  noir: { sky: ['#0a0a0c', '#2e2e38', '#6d6d7d'], tint: 'rgba(20, 20, 28, 0.30)', sun: ['#e8e8ef', '#8a8a99'], accent: '#c9c9d6', title: '#f2f2f5' },
  candy: { sky: ['#2b0f33', '#ff8fd1', '#7ef0d4'], tint: 'rgba(255, 143, 209, 0.16)', sun: ['#fff0f7', '#ff8fd1'], accent: '#7ef0d4', title: '#ffffff' },
};

/** The four lettering styles. */
export const LETTERINGS = ['block', 'outline', 'neon', 'slant'];

/** Draws one photo into a panel rect with cover-fit crop, pan and zoom, clamped so the panel never shows a gap. */
export function drawPhotoPanel(ctx, photo, rect, crop) {
  const [rx, ry, rw, rh] = rect;
  if (!photo) {
    ctx.fillStyle = '#1d0f2a';
    ctx.fillRect(rx, ry, rw, rh);
    return;
  }
  const zoom = (crop?.zoom ?? 100) / 100;
  const panX = (crop?.panX ?? 0) / 100;
  const panY = (crop?.panY ?? 0) / 100;
  const scale = Math.max(rw / photo.naturalWidth, rh / photo.naturalHeight) * zoom;
  const dw = photo.naturalWidth * scale;
  const dh = photo.naturalHeight * scale;
  const maxOx = Math.max(0, (dw - rw) / 2);
  const maxOy = Math.max(0, (dh - rh) / 2);
  const dx = rx + (rw - dw) / 2 + panX * maxOx;
  const dy = ry + (rh - dh) / 2 + panY * maxOy;
  ctx.save();
  ctx.beginPath();
  ctx.rect(rx, ry, rw, rh);
  ctx.clip();
  ctx.drawImage(photo, dx, dy, dw, dh);
  ctx.restore();
}

/** Draws the synthwave sun: a striped gradient disc. */
export function drawSun(ctx, cx, cy, r, colors) {
  ctx.save();
  const g = ctx.createRadialGradient(cx, cy, r * 0.1, cx, cy, r);
  g.addColorStop(0, colors[0]);
  g.addColorStop(1, colors[1]);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.clip();
  let y = cy + r * 0.05;
  let h = r * 0.03;
  while (y < cy + r) {
    ctx.fillStyle = 'rgba(20, 9, 31, 0.9)';
    ctx.fillRect(cx - r, y, r * 2, h);
    y += h + r * 0.09;
    h += r * 0.02;
  }
  ctx.restore();
}

/** Draws a deterministic skyline silhouette with lit windows along a baseline. */
export function drawSkyline(ctx, x, baseline, w, h, seed) {
  const rnd = seededRandom(seed);
  let bx = x;
  ctx.fillStyle = '#12081c';
  while (bx < x + w) {
    const bw = w * (0.04 + rnd() * 0.07);
    const bh = h * (0.35 + rnd() * 0.65);
    ctx.fillRect(bx, baseline - bh, bw, bh);
    // Lit windows: a deterministic sprinkle of warm dots.
    const cols = Math.max(1, Math.floor(bw / (w * 0.012)));
    const rows = Math.max(1, Math.floor(bh / (h * 0.09)));
    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        if (rnd() < 0.32) {
          ctx.fillStyle = rnd() < 0.5 ? '#ffd97a' : '#ff9a3d';
          ctx.fillRect(bx + (c + 0.25) * (bw / cols), baseline - bh + (r + 0.25) * (bh / rows), Math.max(2, bw / cols * 0.4), Math.max(2, bh / rows * 0.4));
          ctx.fillStyle = '#12081c';
        }
      }
    }
    // Aerial on some roofs.
    if (rnd() < 0.4) ctx.fillRect(bx + bw / 2 - 1, baseline - bh - h * 0.08, 2, h * 0.08);
    bx += bw + w * 0.008;
  }
}

/** Fits the title to the canvas width and draws it in the chosen lettering style. */
export function drawTitle(ctx, text, sub, x, y, w, grade, lettering) {
  const clean = (text || '').trim().toUpperCase();
  if (!clean) return;
  let size = w * 0.115;
  const family = '"Arial Narrow", Impact, "Helvetica Neue", sans-serif';
  const fit = (s) => {
    ctx.font = `900 ${s}px ${family}`;
    ctx.letterSpacing = `${Math.max(1, s * 0.02)}px`;
    return ctx.measureText(clean).width;
  };
  while (fit(size) > w * 0.94 && size > 16) size -= 2;
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  // Skew around the title's own centre, so a slanted title stays centred.
  const cx = x + w / 2;
  ctx.translate(cx, y);
  if (lettering === 'slant') ctx.transform(1, 0, -0.16, 1, 0, 0);
  if (lettering === 'outline') {
    ctx.lineWidth = Math.max(2, size * 0.055);
    ctx.strokeStyle = grade.title;
    ctx.strokeText(clean, 0, 0);
  } else if (lettering === 'neon') {
    ctx.shadowColor = grade.accent;
    ctx.shadowBlur = size * 0.45;
    ctx.fillStyle = grade.title;
    ctx.fillText(clean, 0, 0);
    ctx.fillText(clean, 0, 0);
    ctx.shadowBlur = 0;
  } else {
    ctx.fillStyle = grade.title;
    ctx.shadowColor = 'rgba(0,0,0,0.65)';
    ctx.shadowBlur = size * 0.16;
    ctx.shadowOffsetY = size * 0.03;
    ctx.lineWidth = Math.max(2, size * 0.07);
    ctx.strokeStyle = 'rgba(10,4,18,0.9)';
    ctx.strokeText(clean, 0, 0);
    ctx.fillText(clean, 0, 0);
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
  }
  ctx.restore();
  const subText = (sub || '').trim();
  if (subText) {
    ctx.save();
    ctx.font = `600 ${Math.max(14, size * 0.24)}px system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = grade.accent;
    ctx.shadowColor = 'rgba(0,0,0,0.6)';
    ctx.shadowBlur = 6;
    ctx.fillText(subText, x + w / 2, y + size * 0.62);
    ctx.restore();
  }
}

/**
 * Draws the whole cover onto the canvas.
 * photos: array of images (one per panel, or a single image reused for all).
 * opts: { layout, grade, lettering, title, subtitle, crops: [{zoom,panX,panY}] }.
 */
export function drawCover(canvas, photos, opts = {}) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;
  const layout = LAYOUTS[opts.layout] || LAYOUTS.stack;
  const grade = GRADES[opts.grade] || GRADES.vice;
  const lettering = LETTERINGS.includes(opts.lettering) ? opts.lettering : 'block';
  const crops = opts.crops || [];

  // Backdrop: the grade's sky.
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, grade.sky[0]);
  sky.addColorStop(0.55, grade.sky[1]);
  sky.addColorStop(1, grade.sky[2]);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);

  // Photo panels fill the upper part; the title band takes the bottom.
  const bandH = H * 0.22;
  const artH = H - bandH;
  const gap = Math.max(3, W * 0.006);
  layout.forEach((cell, i) => {
    const [fx, fy, fw, fh] = cell;
    const rect = [
      fx * W + (fx > 0 ? gap / 2 : gap),
      fy * artH + (fy > 0 ? gap / 2 : gap),
      fw * W - (fx > 0 ? gap : gap * 2) + (fx + fw >= 1 ? gap : 0),
      fh * artH - (fy > 0 ? gap : gap * 2) + (fy + fh >= 1 ? gap : 0),
    ];
    const photo = photos[i] ?? photos[0] ?? null;
    drawPhotoPanel(ctx, photo, rect, crops[i]);
    ctx.fillStyle = grade.tint;
    ctx.fillRect(rect[0], rect[1], rect[2], rect[3]);
    ctx.strokeStyle = 'rgba(255,255,255,0.55)';
    ctx.lineWidth = Math.max(2, W * 0.002);
    ctx.strokeRect(rect[0], rect[1], rect[2], rect[3]);
  });

  // Title band: scrim, sun, skyline, lettering.
  const bandY = artH;
  const scrim = ctx.createLinearGradient(0, bandY, 0, H);
  scrim.addColorStop(0, 'rgba(12,5,20,0.25)');
  scrim.addColorStop(1, 'rgba(12,5,20,0.92)');
  ctx.fillStyle = scrim;
  ctx.fillRect(0, bandY, W, bandH);
  const sunR = bandH * 0.52;
  drawSun(ctx, W * 0.86, bandY + bandH * 0.52, sunR, grade.sun);
  drawSkyline(ctx, 0, H, W, bandH * 0.62, 20261121);
  drawTitle(ctx, opts.title, opts.subtitle, W * 0.03, bandY + bandH * 0.42, W * 0.94, grade, lettering);

  // Unifying grade wash + vignette.
  const wash = ctx.createLinearGradient(0, 0, 0, H);
  wash.addColorStop(0, 'rgba(255,255,255,0.03)');
  wash.addColorStop(1, grade.tint);
  ctx.fillStyle = wash;
  ctx.fillRect(0, 0, W, H);
  const vig = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.42, W / 2, H / 2, Math.max(W, H) * 0.72);
  vig.addColorStop(0, 'rgba(0,0,0,0)');
  vig.addColorStop(1, 'rgba(0,0,0,0.32)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, W, H);
}
