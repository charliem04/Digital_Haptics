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
export function StepsStrip({ steps }: { steps: ProcessStep[] }) {
  return (
    <ol className="grid gap-8 border-t border-ink pt-8 md:grid-cols-2 lg:grid-flow-col lg:grid-cols-none lg:auto-cols-fr lg:gap-10">
      {steps.map((s, i) => (
        <li key={s.name} className="relative flex flex-col gap-3">
          <Marker className="absolute -top-[36px] left-0" />
          <BoxedLabel>Step.{pad2(i + 1)}</BoxedLabel>
          <h3 className="font-display text-subheading font-semibold">{s.name}</h3>
          <p className="max-w-[40ch] text-body-sm text-steel-deep">{s.body}</p>
        </li>
      ))}
    </ol>
  );
}
