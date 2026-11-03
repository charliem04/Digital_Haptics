/**
 * ── MOTION TOKENS ───────────────────────────────────────────────────
 * One vocabulary for every animation on the site. Nothing in
 * components/ writes its own duration, curve or travel distance; it
 * reaches for a name here. That is what keeps thirty animated bands
 * reading as one system instead of thirty improvisations.
 *
 * PLAN §4.6 allows exactly four kinds of motion: a fade/rise of 8–16px
 * as content enters, the flare glow pulse, the lead-flow rows
 * sequencing in, and the button arrow nudge. No scroll-jacking, no
 * parallax on content, nothing that delays reading. All of it stops
 * under prefers-reduced-motion (useStillness + app/globals.css).
 *
 * Every value below is a decision with a reason attached. If you change
 * one, change the reason with it.
 * ────────────────────────────────────────────────────────────────────
 */

/**
 * The site curve.
 *
 * It leaves fast and lands slow, with no overshoot. The job of this
 * motion is to make the page feel considered, not lively. Mirrored as
 * `ease-brand` in tailwind.config.ts; change both together.
 *
 * Deliberately not the Material default curve, which scripts/check.mjs
 * flags by name as the motion equivalent of reaching for indigo-500.
 * (The literal is spelled out in that rule's definition, not here —
 * writing it in this comment trips the rule on the very file whose job
 * is to document the curve we chose instead.)
 */
export const ease = {
  /** Entrances and state changes. Strong ease-out: the speed is spent up front. */
  out: [0.21, 0.65, 0.36, 1] as const,
  /**
   * Symmetric, for loops that run both ways: the flare glow pulse.
   */
  inOut: [0.65, 0, 0.35, 1] as const,
};

/**
 * Three durations, spaced far enough apart to be told apart. A scale
 * with six steps 100ms apart is a scale nobody can hold in their head,
 * and every value in it ends up chosen by coin flip.
 *
 * Bigger masses move for longer. The hero headline is the LCP element
 * and is never animated.
 */
export const dur = {
  /** 250ms — a control answering the pointer. Fast enough to feel causal. */
  quick: 0.25,
  /** 700ms — the standard band entrance. Long enough to read as motion rather than a jump-cut. */
  base: 0.7,
  /** 1100ms — the lead-flow sequence step. */
  slow: 1.1,
} as const;

/**
 * Travel distances in px, within PLAN §4.6's 8–16px.
 *
 * All travel is on the Y axis, and all of it rises: content comes up
 * into place. Nothing on this site slides in from the side, which would
 * imply the page has somewhere off-screen it keeps things.
 */
export const travel = {
  /** 8px — list items, table rows, anything appearing in a cascade. */
  sm: 8,
  /** 16px — the standard block: a card, a paragraph, a figure. */
  md: 16,
} as const;

/**
 * Gaps between siblings in a cascade. Past about ten items any stagger
 * becomes a queue the reader is waiting in, so `cascade()` below caps
 * the index it multiplies by.
 */
export const stagger = {
  /** 60ms — grid cards and list items. The step Reveal has always used. */
  tight: 0.06,
  /** 120ms — the few big elements of a band opening: mark, heading, lede, CTA. */
  loose: 0.12,
} as const;

/**
 * Viewport triggers for `whileInView`. The negative margins delay the
 * trigger until the element is properly on screen — firing at the exact
 * moment of intersection means the animation is over before anything
 * has scrolled far enough to be looked at.
 *
 * `once` is true everywhere. Re-animating on the way back up punishes
 * someone for scrolling up to re-read something, which is the moment
 * they are most engaged.
 */
export const viewport = {
  /** Standard: fires once the element is 64px past the bottom edge. */
  standard: { once: true, margin: "-64px" },
  /**
   * For tall elements — a full band, a large figure. Waits until the
   * element is committed to the screen rather than firing when its
   * first pixel appears.
   */
  deep: { once: true, margin: "-15% 0px -10% 0px" },
} as const;

/**
 * Cascade delay for the nth sibling, capped so a long list does not
 * become a waiting room. Ten steps at 60ms is 600ms of stagger, already
 * the longest anyone should be asked to watch a grid fill.
 */
export function cascade(index: number, step: number = stagger.tight): number {
  return Math.min(index, 9) * step;
}
