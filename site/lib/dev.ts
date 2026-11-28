import type { ComponentType } from "react";

/** True only under `next dev`. */
export const IS_DEV = process.env.NODE_ENV === "development";

/**
 * The page transition switcher (components/motion/TransitionPicker),
 * or null in a build. The condition is a literal Next inlines, so a
 * production build drops the require and none of its code ships.
 */
export const DevTransitionPicker: ComponentType | null =
  process.env.NODE_ENV === "development"
    ? require("@/components/motion/TransitionPicker").TransitionPicker
    : null;
