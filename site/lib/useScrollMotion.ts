"use client";

/**
 * Reduced-motion gate for every animated component.
 *
 * The scroll-linked hooks the template shipped (useScrollMotion,
 * useStepMode) went with pinning and parallax, which PLAN §4.6 rules
 * out. What remains is the one hook that matters on a static export.
 */
import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

/**
 * "Should this render completely still?" — the reduced-motion gate, made
 * safe to branch a render tree on.
 *
 * ── WHY NOT useReducedMotion() DIRECTLY ─────────────────────────────
 * Because the server cannot know the answer. Rendering is static here:
 * the HTML in /out is produced once, with no visitor and no matchMedia,
 * so it is always the moving version. framer's useReducedMotion can
 * report true on the very first client render, and a component that
 * branches its tree on it then renders something structurally different
 * from the HTML being hydrated. That is React error #418, six of them on
 * the home page — and React's recovery is to throw the server markup
 * away and re-render the whole tree on the client, which is the most
 * expensive thing that can happen on the one path whose entire purpose
 * is to do less work.
 *
 * Holding false until after mount makes the first client render match
 * the HTML by construction. The stillness then applies on the second
 * render, one frame later.
 *
 * The one frame in between is covered by CSS, not by this hook — see the
 * prefers-reduced-motion block in app/globals.css, which neutralises the
 * inline entrance styles before the first paint. Between the two there
 * is no frame where a reduced-motion visitor sees movement.
 */
export function useStillness(): boolean {
  const reduce = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted && !!reduce;
}
