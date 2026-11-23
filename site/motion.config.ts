/**
 * ════════════════════════════════════════════════════════════════════
 *  SITE MOTION: change a word here, rebuild, and the whole site follows.
 *
 *  page     fade · sheet · molten · iris
 *  text     line · words · sweep · underline
 *  passive  glow · embers · contours · rim
 *  divider  draw · seam · wave · drip
 *  card     rim · none   (the glowing trim on case study cards)
 *
 *  Every option stays built (app/motion.css, components/motion/). Compare
 *  them side by side at /lab/motion under `npm run dev`.
 * ════════════════════════════════════════════════════════════════════
 */
export type PageMotion = "fade" | "sheet" | "molten" | "iris";
export type TextMotion = "line" | "words" | "sweep" | "underline";
export type PassiveMotion = "glow" | "embers" | "contours" | "rim";
export type DividerMotion = "draw" | "seam" | "wave" | "drip";
export type CardMotion = "rim" | "none";

export const motionConfig: {
  page: PageMotion;
  text: TextMotion;
  passive: PassiveMotion;
  card: CardMotion;
  divider: DividerMotion;
} = {
  page: "molten",
  text: "sweep",
  passive: "embers",
  card: "rim",
  divider: "seam",
};
