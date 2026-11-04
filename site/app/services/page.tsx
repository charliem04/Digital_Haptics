import { pageMetadata } from "@/lib/meta";
import { getCombineNote, getServices } from "@/lib/content";
import { PageHero } from "@/components/page/PageHero";
import { Section } from "@/components/layout/Section";
import { ServiceCard } from "@/components/page/ServiceCard";
import { CtaBand } from "@/components/page/CtaBand";
import { MoreLink } from "@/components/MoreLink";

/** Services overview (PLAN §5): service cards + the "combine" note. */
export const metadata = pageMetadata({
  title: "Services",
  description:
    "Web design and local SEO for trades businesses in Acadiana, Louisiana: sites built for phones, and the local search work that gets them found.",
  path: "/services/",
});

export default function ServicesPage() {
  const services = getServices();

  return (
    <>
      <PageHero path="/services/" label="Services" title="What we do" lead={getCombineNote()} />
      <Section spacing="tight" aria-label="Services" className="pb-section-sm lg:pb-section">
        <ul
          className={
            services.length > 2 ? "grid gap-6 md:grid-cols-3" : "grid gap-6 md:grid-cols-2"
          }
        >
          {services.map((s) => (
            <li key={s.slug}>
              <ServiceCard service={s} highlight={s.slug === "automations"} />
            </li>
          ))}
        </ul>
        <div className="mt-8">
          <MoreLink href="/pricing/">See where pricing starts</MoreLink>
        </div>
      </Section>
      <CtaBand
        copy={{
          heading: "Not sure what you need?",
          body: "Tell us about the business. We'll recommend what fits, and what doesn't.",
        }}
      />
    </>
  );
}
