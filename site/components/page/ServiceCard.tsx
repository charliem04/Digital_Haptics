import Link from "next/link";
import type { Service } from "@/content/types";
import { Panel } from "@/components/ui/Panel";
import { Arrow } from "@/components/ui/Arrow";

/**
 * A service block, linking to its page. The whole card is the link.
 * `detailed` adds the starting price and what's included, for the
 * Services page.
 */
export function ServiceCard({
  service,
  headingAs: Heading = "h3",
  detailed = false,
}: {
  service: Service;
  /** h2 when the card sits directly under the page's h1. */
  headingAs?: "h2" | "h3";
  detailed?: boolean;
}) {
  return (
    <Panel
      as={Link}
      href={`/services/${service.slug}/`}
      fill={detailed ? "raised" : "surface"}
      widget
      hover
      className="block h-full no-underline text-text"
      innerClassName="flex h-full flex-col gap-5 p-6 lg:p-8"
    >
      <Heading className="font-body text-room-card font-medium">{service.name}</Heading>
      <p className="text-room-body text-muted">{service.short}</p>
      {detailed && (
        <>
          <p className="font-body text-room-small text-muted">
            From{" "}
            <span className="text-[1.75rem] font-medium leading-none text-amber">
              {service.priceFrom}
            </span>{" "}
            {service.priceUnit}
          </p>
          <ul className="flex flex-col gap-2.5 border-t border-line pt-5 text-room-small text-muted">
            {service.included.slice(0, 3).map((item) => (
              <li key={item} className="flex items-start gap-2.5">
                <span
                  aria-hidden
                  className="mt-[0.55em] size-1.5 shrink-0 rounded-control bg-amber"
                />
                {item}
              </li>
            ))}
          </ul>
        </>
      )}
      <span className="mt-auto inline-flex items-center gap-2 pt-2 font-body text-room-small font-medium text-text underline underline-offset-[5px] group-hover/panel:decoration-2">
        About {service.name}
        <Arrow className="size-3.5 transition-transform duration-[250ms] ease-brand group-hover/panel:translate-x-0.5 group-hover/panel:translate-y-0.5" />
      </span>
    </Panel>
  );
}
