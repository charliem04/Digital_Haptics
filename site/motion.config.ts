/**
 * ════════════════════════════════════════════════════════════════════
 *  SITE MOTION: change a word here, rebuild, and the whole site follows.
 *
 *  page     fade · sheet · molten · iris
 *  text     line · words · sweep · underline
 *  passive  glow · embers · contours · rim
 *  divider  draw · seam · wave · drip
 *
 *  Every option stays built (app/motion.css, components/motion/). Compare
 *  them side by side at /lab/motion under `npm run dev`.
 * ════════════════════════════════════════════════════════════════════
 */
export type PageMotion = "fade" | "sheet" | "molten" | "iris";
export type TextMotion = "line" | "words" | "sweep" | "underline";
export type PassiveMotion = "glow" | "embers" | "contours" | "rim";
export type DividerMotion = "draw" | "seam" | "wave" | "drip";

export const motionConfig: {
  page: PageMotion;
  text: TextMotion;
  passive: PassiveMotion;
  divider: DividerMotion;
} = {
  page: "molten",
  text: "sweep",
  passive: "embers",
  divider: "seam",
};
