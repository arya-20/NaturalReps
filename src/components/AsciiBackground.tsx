"use client";

import { useEffect, useRef } from "react";

/**
 * ASCII / character-render animated background, reimplemented in Canvas2D
 * from the 21st.dev "ascii" recipe and the supplied parameter set.
 *
 * Because this runs as a site background (no source photo), the "source"
 * is a procedurally animated gradient scene. The character-render pipeline
 * then samples that scene per cell and draws a luminance-mapped glyph.
 *
 * Config honoured from the recipe: renderMode "characters", cellSize,
 * contrast, tint, animStyle "ripple" with animSpeed/animIntensity, and the
 * enabled post effects (vignette, bloom, filmGrain, glitch). Other modes/
 * effects from the full recipe are intentionally not drawn in this variant.
 */

const CELL = 13; // cellSize
const CONTRAST = -62; // recipe contrast
const TINT = "#3ca6ff";
const ANIM_SPEED = 1.0; // animSpeed intensity 100 -> 1x
const ANIM_INTENSITY = 0.6; // animIntensity 60
const GLITCH = 0.2; // pfx.glitch intensity 20
const GRAIN = 0.3; // pfx.filmGrain intensity 30
const BLOOM = 0.25; // pfx.bloom intensity 25
const VIGNETTE = 0.38; // pfx.vignette intensity 38

// Luminance ramp: dark -> light. Denser glyphs for brighter cells.
const RAMP = " .:-=+*#%@";

function applyContrast(v: number, contrast: number): number {
  const c = (contrast / 100) * 0.9;
  const f = (1 + c) / (1 - c || 1e-6);
  return Math.min(1, Math.max(0, f * (v - 0.5) + 0.5));
}

export default function AsciiBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let cols = 0;
    let rows = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas!.width = Math.floor(width * dpr);
      canvas!.height = Math.floor(height * dpr);
      canvas!.style.width = width + "px";
      canvas!.style.height = height + "px";
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(width / CELL);
      rows = Math.ceil(height / CELL);
      ctx!.font = `${CELL}px "JetBrains Mono", ui-monospace, monospace`;
      ctx!.textBaseline = "top";
    }
    resize();
    window.addEventListener("resize", resize);

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    function sceneLum(cx: number, cy: number, t: number): number {
      const nx = cx / cols;
      const ny = cy / rows;
      const ox = 0.5 + 0.25 * Math.sin(t * 0.15);
      const oy = 0.45 + 0.25 * Math.cos(t * 0.12);
      const dx = nx - ox;
      const dy = ny - oy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const ripple = Math.sin(dist * 26 - t * 2.2 * ANIM_SPEED) * 0.5 + 0.5;
      const drift =
        Math.sin((nx + ny) * 6 + t * 0.6) * 0.5 +
        Math.sin((nx - ny) * 9 - t * 0.4) * 0.5;
      let v = 0.55 * ripple + 0.22 * (drift * 0.5 + 0.5);
      v *= 0.65 + 0.5 * ny;
      v = v * ANIM_INTENSITY + v * (1 - ANIM_INTENSITY) * 0.6;
      return applyContrast(Math.min(1, v), CONTRAST);
    }

    function hexToRgb(hex: string) {
      const h = hex.replace("#", "");
      return {
        r: parseInt(h.slice(0, 2), 16),
        g: parseInt(h.slice(2, 4), 16),
        b: parseInt(h.slice(4, 6), 16),
      };
    }
    const tintRgb = hexToRgb(TINT);

    function draw(now: number) {
      const t = reduceMotion ? 0 : (now / 1000) * ANIM_SPEED;

      ctx!.fillStyle = "#05070a";
      ctx!.fillRect(0, 0, width, height);

      const glitchActive =
        !reduceMotion && Math.sin(t * 7.3) > 1 - GLITCH * 0.6;
      const glitchRow = glitchActive
        ? Math.floor((Math.sin(t * 13.1) * 0.5 + 0.5) * rows)
        : -1;
      const glitchBand = 3;

      for (let cy = 0; cy < rows; cy++) {
        for (let cx = 0; cx < cols; cx++) {
          const lum = sceneLum(cx, cy, t);
          const idx = Math.min(
            RAMP.length - 1,
            Math.max(0, Math.floor(lum * (RAMP.length - 1)))
          );
          const ch = RAMP[idx];
          if (ch === " ") continue;

          const lift = lum * lum * BLOOM;
          const r = Math.round(tintRgb.r * (0.35 + lum * 0.65) + 255 * lift);
          const g = Math.round(tintRgb.g * (0.35 + lum * 0.65) + 255 * lift);
          const b = Math.round(tintRgb.b * (0.4 + lum * 0.6) + 255 * lift);
          const alpha = 0.25 + lum * 0.6;

          let px = cx * CELL;
          if (cy >= glitchRow && cy < glitchRow + glitchBand) {
            px += Math.sin(t * 40 + cy) * 8;
          }
          ctx!.fillStyle = `rgba(${Math.min(255, r)},${Math.min(
            255,
            g
          )},${Math.min(255, b)},${alpha})`;
          ctx!.fillText(ch, px, cy * CELL);
        }
      }

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

      if (!reduceMotion && GRAIN > 0) {
        const count = Math.floor((width * height) / 4000);
        ctx!.fillStyle = `rgba(255,255,255,${GRAIN * 0.04})`;
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
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10"
    />
  );
}
