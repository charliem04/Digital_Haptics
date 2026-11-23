import Link from "next/link";
import type { Service } from "@/content/types";
import { Panel } from "@/components/ui/Panel";
import { Arrow } from "@/components/ui/Arrow";

/**
 * A service block, linking to its page. The whole card is the link.
 */
export function ServiceCard({
  service,
  headingAs: Heading = "h3",
}: {
  service: Service;
  /** h2 when the card sits directly under the page's h1. */
  headingAs?: "h2" | "h3";
}) {
  return (
    <Panel
      as={Link}
      href={`/services/${service.slug}/`}
      fill="surface"
      className="block h-full no-underline text-text"
      innerClassName="flex h-full flex-col gap-5 p-6 lg:p-8"
    >
      <Heading className="font-body text-room-card font-medium">{service.name}</Heading>
      <p className="text-room-body text-muted">{service.short}</p>
      <span className="mt-auto inline-flex items-center gap-2 pt-2 font-body text-room-small font-medium text-text underline underline-offset-[5px] group-hover/panel:decoration-2">
        About {service.name}
        <Arrow className="size-3.5 transition-transform duration-[250ms] ease-brand group-hover/panel:translate-x-0.5 group-hover/panel:translate-y-0.5" />
      </span>
    </Panel>
  );
}
