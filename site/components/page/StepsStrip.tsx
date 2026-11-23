import { pad2 } from "@/lib/cn";
import type { ProcessStep } from "@/content/types";
import { SmallLabel } from "@/components/ui/SmallLabel";

/**
 * A numbered process strip: Call → Build → Launch → Grow on Home, the
 * three "how it works" steps on /start (PLAN §5). An ordered list, a
 * column on phones and a row from lg, joined by an ink rule with a
 * marker at each step.
 */
export function StepsStrip({
  steps,
  headingAs: Heading = "h3",
}: {
  steps: ProcessStep[];
  /** h2 when the strip sits directly under the page's h1. */
  headingAs?: "h2" | "h3";
}) {
  return (
    <ol className="grid gap-8 border-line md:grid-cols-2 lg:grid-flow-col lg:grid-cols-none lg:auto-cols-fr lg:gap-10 border-t-0 pt-0">
      {steps.map((s, i) => (
        <li key={s.name} className="relative flex flex-col gap-2 border-l-2 border-amber pl-5">
          <SmallLabel>Step.{pad2(i + 1)}</SmallLabel>
          <Heading className="font-body text-room-step font-medium">{s.name}</Heading>
          <p className="max-w-[24.4em] text-room-small text-muted">{s.body}</p>
        </li>
      ))}
    </ol>
  );
}
