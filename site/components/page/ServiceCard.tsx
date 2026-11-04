import Link from "next/link";
import type { Service } from "@/content/types";
import { CutFrame } from "@/components/ui/CutFrame";
import { BoxedLabel } from "@/components/ui/BoxedLabel";
import { Arrow } from "@/components/ui/Arrow";

/**
 * A service block (PLAN §5: boxed ACT label, linking to its page). The
 * whole card is the link; the ring follows the cut.
 */
export function ServiceCard({ service, highlight }: { service: Service; highlight?: boolean }) {
  return (
    <CutFrame
      as={Link}
      href={`/services/${service.slug}/`}
      size="md"
      fill="frost"
      ring
      className="block h-full text-ink no-underline"
      innerClassName="flex h-full flex-col gap-5 p-6 lg:p-8"
    >
      <BoxedLabel active={highlight}>
        {service.code} — {service.name}
      </BoxedLabel>
      <h3 className="font-display text-subheading font-semibold">{service.name}</h3>
      <p className="text-body text-steel-deep">{service.short}</p>
      <span className="mt-auto inline-flex items-center gap-2 pt-2 font-mono text-label uppercase tracking-label">
        About {service.name}
        <Arrow className="size-3.5 transition-transform duration-[250ms] ease-brand group-hover/cut:translate-x-0.5 group-hover/cut:translate-y-0.5" />
      </span>
    </CutFrame>
  );
}
