"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";

/**
 * Glass that bends what's behind it (lab mock-up).
 *
 * A displacement map is drawn for the card's exact size: neutral in the
 * middle, pushing outward across a curved rim, like the thick edge of a
 * pane. An SVG filter uses it to shift the backdrop, once per colour
 * channel by slightly different amounts, so the edges split into colour
 * the way real glass does.
 *
 * Only Chromium browsers (Chrome, Edge) apply an SVG filter as a
 * backdrop-filter. Everywhere else it falls back to a plain blur.
 */
function buildMap(width: number, height: number, radius: number, bevel: number): string {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  const image = ctx.createImageData(width, height);
  const hw = width / 2;
  const hh = height / 2;
  const r = Math.min(radius, hw, hh);

  // Signed distance to the rounded rectangle's edge (negative inside).
  const sdf = (px: number, py: number) => {
    const qx = Math.abs(px - hw) - (hw - r);
    const qy = Math.abs(py - hh) - (hh - r);
    const outside = Math.hypot(Math.max(qx, 0), Math.max(qy, 0));
    return outside + Math.min(Math.max(qx, qy), 0) - r;
  };

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const depth = -sdf(x + 0.5, y + 0.5);
      let dx = 0;
      let dy = 0;
      if (depth > 0 && depth < bevel) {
        // Outward normal, from the slope of the distance field.
        const nx = sdf(x + 1.5, y + 0.5) - sdf(x - 0.5, y + 0.5);
        const ny = sdf(x + 0.5, y + 1.5) - sdf(x + 0.5, y - 0.5);
        const len = Math.hypot(nx, ny) || 1;
        // A rounded rim: flat inside, bending steeply at the very edge.
        const t = 1 - depth / bevel;
        const bend = 1 - Math.sqrt(1 - t * t);
        dx = (nx / len) * bend;
        dy = (ny / len) * bend;
      }
      const i = (y * width + x) * 4;
      image.data[i] = 128 + dx * 127;
      image.data[i + 1] = 128 + dy * 127;
      image.data[i + 2] = 128;
      image.data[i + 3] = 255;
    }
  }
  ctx.putImageData(image, 0, 0);
  return canvas.toDataURL("image/png");
}

const CHANNELS = [
  { matrix: "1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0" },
  { matrix: "0 0 0 0 0 0 1 0 0 0 0 0 0 0 0 0 0 0 1 0" },
  { matrix: "0 0 0 0 0 0 0 0 0 0 0 0 1 0 0 0 0 0 1 0" },
];

export function RefractGlass({
  className = "",
  radius = 36,
  bevel = 30,
  strength = 70,
  frost = 1.4,
  chroma = 0.3,
  children,
}: {
  className?: string;
  radius?: number;
  /** How wide the bending rim is, in px. */
  bevel?: number;
  /** How far the rim bends the backdrop, in px. */
  strength?: number;
  /** Blur of what's behind, in px. */
  frost?: number;
  /** Colour split at the rim, 0–1. */
  chroma?: number;
  children: ReactNode;
}) {
  const spreads = [1, 1 + chroma * 0.2, 1 + chroma * 0.4];
  const fallback = `blur(${Math.max(frost, 6)}px) saturate(1.25)`;
  const ref = useRef<HTMLDivElement>(null);
  const id = `refract-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const [supported, setSupported] = useState(false);
  const [map, setMap] = useState<{ url: string; w: number; h: number } | null>(null);

  useEffect(() => {
    const ua = navigator.userAgent;
    setSupported(/Chrome|Chromium|Edg\//.test(ua) && !/Firefox|FxiOS|CriOS/.test(ua));
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el || !supported) return;
    const draw = () => {
      const w = Math.round(el.offsetWidth);
      const h = Math.round(el.offsetHeight);
      if (!w || !h) return;
      setMap((prev) =>
        prev && prev.w === w && prev.h === h ? prev : { url: buildMap(w, h, radius, bevel), w, h }
      );
    };
    draw();
    const observer = new ResizeObserver(draw);
    observer.observe(el);
    return () => observer.disconnect();
  }, [supported, radius, bevel]);

  const refracting = supported && map;

  return (
    <div
      ref={ref}
      className={className}
      style={{
        borderRadius: radius,
        backdropFilter: refracting ? `url(#${id}) saturate(1.2)` : fallback,
        WebkitBackdropFilter: fallback,
      }}
      data-refract={refracting ? "on" : "fallback"}
    >
      {refracting && (
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
            {/* A touch of frost, so the glass isn't perfectly clear. */}
            <feGaussianBlur in="SourceGraphic" stdDeviation={frost} result="soft" />
            {CHANNELS.map((c, i) => (
              <g key={i}>
                <feDisplacementMap
                  in="soft"
                  in2="map"
                  scale={strength * spreads[i]}
                  xChannelSelector="R"
                  yChannelSelector="G"
                  result={`shift${i}`}
                />
                <feColorMatrix in={`shift${i}`} type="matrix" values={c.matrix} result={`c${i}`} />
              </g>
            ))}
            <feBlend in="c0" in2="c1" mode="screen" result="rg" />
            <feBlend in="rg" in2="c2" mode="screen" />
          </filter>
        </svg>
      )}
      {children}
    </div>
  );
}
