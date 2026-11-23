import type { CSSProperties } from "react";
import { motionConfig } from "@/motion.config";

const order = (i: number, left?: number) =>
  ({ "--i": i, ...(left === undefined ? {} : { left: `${left}%` }) }) as CSSProperties;

/** Sparks keep to the outer edges, clear of the reading column. */
const EMBER_POSITIONS = [3, 94, 9, 88, 14, 83, 6, 97, 18, 79, 11, 91];
const DRIP_HEIGHTS = [34, 62, 22, 78, 40, 28, 56];

/** Slow background life for a section. Decorative; sits behind its content. */
export function SectionAmbient() {
  const style = motionConfig.passive;
  return (
    <div aria-hidden className={`motion-ambient motion-ambient-${style}`} data-motion-live="">
      {style === "glow" && <span className="motion-glow" />}
      {style === "embers" &&
        EMBER_POSITIONS.map((left, i) => (
          <span key={left} className="motion-ember" style={order(i, left)} />
        ))}
      {style === "contours" && (
        <svg className="motion-contours" viewBox="0 0 800 240" preserveAspectRatio="none">
          {Array.from({ length: 8 }, (_, i) => (
            <path
              key={i}
              d={`M0 ${30 + i * 26} C 130 ${i * 26}, 270 ${70 + i * 26}, 400 ${30 + i * 26} S 670 ${i * 26}, 800 ${30 + i * 26}`}
            />
          ))}
        </svg>
      )}
      {style === "rim" && <span className="motion-rim" />}
    </div>
  );
}

/** The animated edge where a section meets the one above it. */
export function SectionDivider() {
  const style = motionConfig.divider;
  return (
    <div aria-hidden className={`motion-divider motion-divider-${style}`} data-motion-live="">
      {style === "seam" && <span className="motion-seam" />}
      {style === "wave" && (
        <svg viewBox="0 0 1200 60" preserveAspectRatio="none">
          <path d="M0 60V24C100 -6 200 -6 300 24S500 54 600 24 800 -6 900 24 1100 54 1200 24V60Z" />
        </svg>
      )}
      {style === "drip" &&
        DRIP_HEIGHTS.map((height, i) => <span key={i} style={{ ...order(i), height }} />)}
    </div>
  );
}
