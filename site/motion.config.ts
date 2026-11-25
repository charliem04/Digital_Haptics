/**
 * ════════════════════════════════════════════════════════════════════
 *  SITE MOTION: change a word here, rebuild, and the whole site follows.
 *
 *  page     fade · sheet · molten · iris
 *  text     line · words · sweep · underline
 *  passive  glow · embers · contours · rim
 *  divider  draw · seam · wave · drip
 *  card     rim · none   (the glowing trim on case study cards)
 *  widget   rise · settle · wipe · tilt · none   (cards appearing on screen)
 *  hover    glow · lift · tilt · ring · none     (cards under the pointer)
 *
 *  Every option stays built (app/motion.css, components/motion/). Compare
 *  them at /lab/motion and /lab/widgets under `npm run dev`.
 * ════════════════════════════════════════════════════════════════════
 */
export type PageMotion = "fade" | "sheet" | "molten" | "iris";
export type TextMotion = "line" | "words" | "sweep" | "underline";
export type PassiveMotion = "glow" | "embers" | "contours" | "rim";
export type DividerMotion = "draw" | "seam" | "wave" | "drip";
export type CardMotion = "rim" | "none";
export type WidgetMotion = "rise" | "settle" | "wipe" | "tilt" | "none";
export type HoverMotion = "glow" | "lift" | "tilt" | "ring" | "none";

export const motionConfig: {
  page: PageMotion;
  text: TextMotion;
  passive: PassiveMotion;
  card: CardMotion;
  widget: WidgetMotion;
  hover: HoverMotion;
  divider: DividerMotion;
} = {
  page: "molten",
  text: "sweep",
  passive: "embers",
  card: "none",
  widget: "rise",
  hover: "glow",
  divider: "seam",
};
