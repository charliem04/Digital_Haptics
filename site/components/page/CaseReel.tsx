import type { CaseStudy } from "@/content/types";
import { CaseCard } from "@/components/CaseCard";
import { caseCardProps } from "./CaseGrid";
import { ReelViewport } from "./ReelViewport";

/**
 * `inert` as an empty string: React 18 only writes it that way, though
 * its types (from a newer React) ask for a boolean.
 */
const INERT = { inert: "" } as unknown as { inert: boolean };

/** Drift speed in px/s: slow enough to read (about 11s per card). */
const SPEED = 37;

/**
 * ════════════════════════════════════════════════════════════════════
 *  CASE REEL: every published case drifting slowly sideways, on a loop
 *  (Home's Recent work, owner's request 2026-11-25).
 *
 *  - Drag it with the mouse or swipe it with a thumb; it glides a little
 *    after you let go, then carries on drifting (ReelViewport).
 *  - It holds still under the mouse, while a card has keyboard focus and
 *    while off screen. With reduced motion it never drifts, but can
 *    still be dragged. No pause button (owner's call): hover, focus and
 *    reduced motion are the ways to stop it.
 *  - The track holds the cards twice, so the loop has no seam. The copy
 *    is aria-hidden and inert: screen readers and the Tab key meet each
 *    case once.
 * ════════════════════════════════════════════════════════════════════
 */
export function CaseReel({ cases }: { cases: CaseStudy[] }) {
  const list = (copy: boolean) => (
    <ul className="case-reel-list" aria-hidden={copy || undefined} {...(copy ? INERT : {})}>
      {cases.map((c, i) => (
        <li key={c.slug}>
          <CaseCard {...caseCardProps(c, i)} widget={false} className="h-full" />
        </li>
      ))}
    </ul>
  );

  return (
    <ReelViewport speed={SPEED}>
      {list(false)}
      {list(true)}
    </ReelViewport>
  );
}
