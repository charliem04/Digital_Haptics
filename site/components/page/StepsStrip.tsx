import { pad2 } from "@/lib/cn";
import type { ProcessStep } from "@/content/types";
import { BoxedLabel } from "@/components/ui/BoxedLabel";
import { Marker } from "@/components/ui/Marker";

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
    <ol className="grid gap-8 border-t border-ink pt-8 md:grid-cols-2 lg:grid-flow-col lg:grid-cols-none lg:auto-cols-fr lg:gap-10 room:border-t-0 room:pt-0">
      {steps.map((s, i) => (
        <li
          key={s.name}
          className="relative flex flex-col gap-3 room:gap-2 room:border-l-2 room:border-amber room:pl-5"
        >
          <Marker className="absolute -top-[36px] left-0" />
          <BoxedLabel>Step.{pad2(i + 1)}</BoxedLabel>
          <Heading className="font-display text-subheading font-semibold room:font-body room:text-room-step room:font-medium">
            {s.name}
          </Heading>
          <p className="max-w-[40ch] text-body-sm text-steel-deep room:text-room-small room:text-muted">
            {s.body}
          </p>
        </li>
      ))}
    </ol>
  );
}
