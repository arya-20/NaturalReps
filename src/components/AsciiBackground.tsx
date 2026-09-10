"use client";

import { useEffect, useRef } from "react";

/**
 * ASCII / character-render animated background — Canvas2D reimplementation of
 * the 21st.dev "ascii" recipe. This version follows the recipe faithfully:
 *
 *   1. Draw a SOURCE image to an offscreen canvas.
 *   2. Divide into cellSize cells and sample each cell's average luminance.
 *   3. Render a glyph per cell from a ramp, sized/tinted by luminance.
 *   4. Apply contrast, tint, then post effects (vignette, bloom, grain, glitch).
 *   5. Animate with the "ripple" style using animSpeed / animIntensity.
 *
 * The source is a generated dumbbell silhouette so the effect reads as a real
 * image rather than noise. To use a photo instead, set SOURCE_SRC to a file in
 * /public and the loader will sample that instead.
 */

const CELL = 10; // cellSize — denser grid for photo detail
const CONTRAST = 15; // lift contrast a touch so the statue pops from black
const TINT = { r: 60, g: 166, b: 255 }; // #3ca6ff
const ANIM_SPEED = 1.0;
const ANIM_INTENSITY = 0.35; // gentler so the subject stays legible
const GLITCH = 0.2;
const GRAIN = 0.3;
const BLOOM = 0.25;
const VIGNETTE = 0.38;

const RAMP = " .:-=+*#%@";
const SOURCE_SRC: string | null = "/statue.png"; // sampled photo source

function applyContrast(v: number, contrast: number): number {
  const c = (contrast / 100) * 0.9;
  const f = (1 + c) / (1 - c || 1e-6);
  return Math.min(1, Math.max(0, f * (v - 0.5) + 0.5));
}

/** Draw a dumbbell silhouette with soft lighting onto ctx sized w×h. */
function drawSubject(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, w, h);

  // radial light behind the subject
  const g = ctx.createRadialGradient(
    w * 0.5,
    h * 0.42,
    10,
    w * 0.5,
    h * 0.42,
    Math.max(w, h) * 0.6
  );
  g.addColorStop(0, "#5b6b7a");
  g.addColorStop(1, "#000");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  // dumbbell, centred, scaled to viewport
  const cx = w * 0.5;
  const cy = h * 0.44;
  const unit = Math.min(w, h) * 0.007;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(-0.35);
  ctx.fillStyle = "#e8eef5";

  const barW = 46 * unit;
  const barH = 6 * unit;
  round(ctx, -barW / 2, -barH / 2, barW, barH, barH / 2);

  // plates
  const plate = (x: number, hh: number, ww: number) =>
    round(ctx, x, -hh / 2, ww, hh, 4 * unit);
  plate(-barW / 2 - 8 * unit, 34 * unit, 8 * unit);
  plate(-barW / 2 - 15 * unit, 26 * unit, 6 * unit);
  plate(barW / 2, 34 * unit, 8 * unit);
  plate(barW / 2 + 9 * unit, 26 * unit, 6 * unit);
  ctx.restore();
}

function round(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  ctx.fill();
}

export default function AsciiBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    // offscreen source + its sampled luminance grid
    const src = document.createElement("canvas");
    const sctx = src.getContext("2d", { willReadFrequently: true })!;

    let width = 0;
    let height = 0;
    let cols = 0;
    let rows = 0;
    let lumGrid: Float32Array = new Float32Array(0);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let photo: HTMLImageElement | null = null;

    function sample() {
      src.width = Math.max(1, cols);
      src.height = Math.max(1, rows);
      if (photo) {
        // cover-fit the photo
        const ar = photo.width / photo.height;
        const car = cols / rows;
        let dw = cols;
        let dh = rows;
        if (ar > car) dw = rows * ar;
        else dh = cols / ar;
        sctx.drawImage(photo, (cols - dw) / 2, (rows - dh) / 2, dw, dh);
      } else {
        drawSubject(
          sctx as unknown as CanvasRenderingContext2D,
          cols,
          rows
        );
      }
      const data = sctx.getImageData(0, 0, cols, rows).data;
      lumGrid = new Float32Array(cols * rows);
      for (let i = 0; i < cols * rows; i++) {
        const r = data[i * 4];
        const g = data[i * 4 + 1];
        const b = data[i * 4 + 2];
        const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        lumGrid[i] = applyContrast(lum, CONTRAST);
      }
    }

    function resize() {
      const parent = canvas!.parentElement;
      const rect = parent
        ? parent.getBoundingClientRect()
        : { width: window.innerWidth, height: window.innerHeight };
      width = Math.max(1, Math.floor(rect.width));
      height = Math.max(1, Math.floor(rect.height));
      canvas!.width = Math.floor(width * dpr);
      canvas!.height = Math.floor(height * dpr);
      canvas!.style.width = width + "px";
      canvas!.style.height = height + "px";
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(width / CELL);
      rows = Math.ceil(height / CELL);
      ctx!.font = `${CELL}px "JetBrains Mono", ui-monospace, monospace`;
      ctx!.textBaseline = "top";
      sample();
    }

    if (SOURCE_SRC) {
      const img = new Image();
      img.onload = () => {
        photo = img;
        resize();
      };
      img.src = SOURCE_SRC;
    }
    resize();
    window.addEventListener("resize", resize);

    let ro: ResizeObserver | null = null;
    if (canvas.parentElement && "ResizeObserver" in window) {
      ro = new ResizeObserver(() => resize());
      ro.observe(canvas.parentElement);
    }

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    function draw(now: number) {
      const t = reduceMotion ? 0 : (now / 1000) * ANIM_SPEED;

      ctx!.fillStyle = "#05070a";
      ctx!.fillRect(0, 0, width, height);

      // ripple modulation centre (slow drift)
      const ox = 0.5 + 0.2 * Math.sin(t * 0.15);
      const oy = 0.42 + 0.2 * Math.cos(t * 0.12);

      const glitchActive =
        !reduceMotion && Math.sin(t * 7.3) > 1 - GLITCH * 0.6;
      const glitchRow = glitchActive
        ? Math.floor((Math.sin(t * 13.1) * 0.5 + 0.5) * rows)
        : -1;

      for (let cy = 0; cy < rows; cy++) {
        for (let cx = 0; cx < cols; cx++) {
          const base = lumGrid[cy * cols + cx] || 0;

          // ripple animation: brightness wave over the sampled image
          const nx = cx / cols - ox;
          const ny = cy / rows - oy;
          const dist = Math.sqrt(nx * nx + ny * ny);
          const wave = Math.sin(dist * 24 - t * 2.2) * 0.5 + 0.5;
          // faint ambient floor so dark regions still show subtle glyphs,
          // plus a ripple shimmer that is visible even where the image is black
          const ambient = 0.06 + 0.05 * wave;
          const lum = Math.min(
            1,
            Math.max(
              ambient,
              base * (1 - ANIM_INTENSITY * 0.45) +
                base * wave * ANIM_INTENSITY * 0.7
            )
          );

          const idx = Math.min(
            RAMP.length - 1,
            Math.max(0, Math.floor(lum * (RAMP.length - 1)))
          );
          const ch = RAMP[idx];
          if (ch === " ") continue;

          const lift = lum * lum * BLOOM;
          const r = Math.min(255, Math.round(TINT.r * (0.35 + lum * 0.65) + 255 * lift));
          const g = Math.min(255, Math.round(TINT.g * (0.35 + lum * 0.65) + 255 * lift));
          const b = Math.min(255, Math.round(TINT.b * (0.4 + lum * 0.6) + 255 * lift));
          const alpha = 0.2 + lum * 0.7;

          let px = cx * CELL;
          if (cy >= glitchRow && cy < glitchRow + 3) px += Math.sin(t * 40 + cy) * 8;
          ctx!.fillStyle = `rgba(${r},${g},${b},${alpha})`;
          ctx!.fillText(ch, px, cy * CELL);
        }
      }

      // vignette
      const grad = ctx!.createRadialGradient(
        width / 2,
        height / 2,
        Math.min(width, height) * 0.3,
        width / 2,
        height / 2,
        Math.max(width, height) * 0.75
      );
      grad.addColorStop(0, "rgba(0,0,0,0)");
      grad.addColorStop(1, `rgba(0,0,0,${VIGNETTE})`);
      ctx!.fillStyle = grad;
      ctx!.fillRect(0, 0, width, height);

      // film grain
      if (!reduceMotion && GRAIN > 0) {
        const count = Math.floor((width * height) / 5000);
        ctx!.fillStyle = `rgba(255,255,255,${GRAIN * 0.035})`;
        for (let i = 0; i < count; i++) {
          ctx!.fillRect(Math.random() * width, Math.random() * height, 1, 1);
        }
      }

      rafRef.current = requestAnimationFrame(draw);
    }

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      ro?.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0"
    />
  );
}
