"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * ════════════════════════════════════════════════════════════════════
 *  GLASS PANE: a frosted section over Home's fixed liquid layer.
 *
 *  Settings are the owner's picks from /lab/liquid-glass (2026-11-24):
 *  bend 0.1, colour split 0.3, rim 15, frost 6.5, no amber.
 *
 *  Dark frosted glass everywhere (owner's pick, 2026-11-25): a blur and
 *  the room tint, the same on every page, screen size and browser.
 *
 *  `refract` (off by default) adds the bending rim on desktop Chrome and
 *  Edge: an SVG backdrop filter that bends the liquid across a curved rim
 *  and splits it into colour. It reads lighter than the frost, which is
 *  why it is opt-in. Phones and other browsers never get it.
 *  - The dark tint is 70% so text passes WCAG AA even over the brightest
 *    amber of the liquid (muted text 4.75:1, body text 9:1 at worst).
 *
 *  It marks itself as a liquid opening, so the liquid keeps running
 *  while a pane is on screen.
 *
 *  Corners are squircles where the browser supports `corner-shape`
 *  (globals.css), and the bending rim is drawn to the same shape.
 * ════════════════════════════════════════════════════════════════════
 */
const RIM = 15;
const BEND = 40;
const FROST = 6.5;
const SPLIT = 0.3;
const TINT = 0.7;

const CHANNELS = [
  "1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0",
  "0 0 0 0 0 0 1 0 0 0 0 0 0 0 0 0 0 0 1 0",
  "0 0 0 0 0 0 0 0 0 0 0 0 1 0 0 0 0 0 1 0",
];
const SPREADS = [1, 1 + SPLIT * 0.2, 1 + SPLIT * 0.4];
const FALLBACK = `blur(${FROST}px) saturate(1.25)`;

/** Neutral everywhere except a curved rim that pushes outward. */
function buildMap(width: number, height: number, radius: number, squircle: boolean): string {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  const image = ctx.createImageData(width, height);
  // Every pixel starts neutral: R = G = B = 128, A = 255.
  new Uint32Array(image.data.buffer).fill(0xff808080);

  const hw = width / 2;
  const hh = height / 2;
  const r = Math.min(radius, hw, hh);
  // Distance to the edge: a round corner is a circle (power 2); a
  // squircle corner is a superellipse of power 4, as CSS draws it.
  const corner = squircle
    ? (x: number, y: number) => Math.sqrt(Math.sqrt(x ** 4 + y ** 4))
    : Math.hypot;
  const sdf = (px: number, py: number) => {
    const qx = Math.abs(px - hw) - (hw - r);
    const qy = Math.abs(py - hh) - (hh - r);
    return corner(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - r;
  };

  // Only the band near the edge can bend, so only that band is computed.
  const margin = Math.ceil(RIM + r);
  const shade = (x: number, y: number) => {
    const depth = -sdf(x + 0.5, y + 0.5);
    if (depth <= 0 || depth >= RIM) return;
    const nx = sdf(x + 1.5, y + 0.5) - sdf(x - 0.5, y + 0.5);
    const ny = sdf(x + 0.5, y + 1.5) - sdf(x + 0.5, y - 0.5);
    const len = Math.hypot(nx, ny) || 1;
    const t = 1 - depth / RIM;
    const bend = 1 - Math.sqrt(1 - t * t);
    const i = (y * width + x) * 4;
    image.data[i] = 128 + (nx / len) * bend * 127;
    image.data[i + 1] = 128 + (ny / len) * bend * 127;
  };
  for (let y = 0; y < height; y++) {
    if (y < margin || y >= height - margin) {
      for (let x = 0; x < width; x++) shade(x, y);
    } else {
      for (let x = 0; x < Math.min(margin, width); x++) shade(x, y);
      for (let x = Math.max(width - margin, margin); x < width; x++) shade(x, y);
    }
  }
  ctx.putImageData(image, 0, 0);
  return canvas.toDataURL("image/png");
}

export function GlassPane({
  className,
  innerClassName,
  widget = false,
  refract = false,
  children,
}: {
  className?: string;
  innerClassName?: string;
  /** The lighter, light-bending rim on desktop Chrome and Edge. */
  refract?: boolean;
  /** Fade in with the site's widget cascade (on the pane itself, since a
   *  fading parent would cut the glass off from the liquid behind it). */
  widget?: boolean;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const id = `glass-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const [map, setMap] = useState<{ url: string; w: number; h: number } | null>(null);

  useEffect(() => {
    const el = ref.current;
    const ua = navigator.userAgent;
    const chromium = /Chrome|Chromium|Edg\//.test(ua) && !/Firefox|FxiOS|CriOS|EdgiOS/.test(ua);
    // Desktop only: on a phone the bent rim is a few pixels wide and the
    // map costs main-thread time (Lighthouse TBT), so phones keep the frost.
    const wide = window.matchMedia("(min-width: 1024px)").matches;
    if (!refract || !el || !chromium || !wide) return;

    let idle = 0;
    const draw = () => {
      const w = Math.round(el.offsetWidth);
      const h = Math.round(el.offsetHeight);
      if (!w || !h) return;
      const radius = parseFloat(getComputedStyle(el).borderTopLeftRadius) || 36;
      const squircle = CSS.supports("corner-shape", "squircle");
      setMap((prev) =>
        prev && prev.w === w && prev.h === h
          ? prev
          : { url: buildMap(w, h, radius, squircle), w, h }
      );
    };
    // After first paint, so the map never competes with loading the page.
    const schedule = () => {
      if (typeof window.requestIdleCallback === "function") {
        idle = window.requestIdleCallback(draw, { timeout: 1500 });
      } else {
        idle = window.setTimeout(draw, 300);
      }
    };
    schedule();
    const observer = new ResizeObserver(schedule);
    observer.observe(el);
    return () => {
      observer.disconnect();
      if (typeof window.cancelIdleCallback === "function") window.cancelIdleCallback(idle);
      window.clearTimeout(idle);
    };
  }, [refract]);

  return (
    <div
      ref={ref}
      data-liquid-opening
      data-glass-pane
      data-widget={widget ? "pane" : undefined}
      className={cn(
        "relative overflow-hidden rounded-[var(--r-glass)] border border-[rgb(255_255_255/0.16)] border-t-[rgb(255_255_255/0.4)] shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_16px_40px_-16px_rgba(0,0,0,0.5)]",
        className
      )}
      style={{
        backdropFilter: map ? `url(#${id}) saturate(1.2)` : FALLBACK,
        WebkitBackdropFilter: FALLBACK,
      }}
    >
      {map && (
        <svg aria-hidden width="0" height="0" className="absolute">
          <filter
            id={id}
            x="0"
            y="0"
            width={map.w}
            height={map.h}
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feImage href={map.url} x="0" y="0" width={map.w} height={map.h} result="map" />
            <feGaussianBlur in="SourceGraphic" stdDeviation={FROST} result="soft" />
            {CHANNELS.map((matrix, i) => (
              <g key={i}>
                <feDisplacementMap
                  in="soft"
                  in2="map"
                  scale={BEND * SPREADS[i]}
                  xChannelSelector="R"
                  yChannelSelector="G"
                  result={`shift${i}`}
                />
                <feColorMatrix in={`shift${i}`} type="matrix" values={matrix} result={`c${i}`} />
              </g>
            ))}
            <feBlend in="c0" in2="c1" mode="screen" result="rg" />
            <feBlend in="rg" in2="c2" mode="screen" />
          </filter>
        </svg>
      )}
      {/* The dark tint that keeps text readable over the liquid. */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{ backgroundColor: `rgb(18 22 26 / ${TINT})` }}
      />
      <div className={cn("relative", innerClassName)}>{children}</div>
    </div>
  );
}
