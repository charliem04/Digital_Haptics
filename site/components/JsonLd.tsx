import { jsonLd } from "@/lib/json-ld";
import { site } from "@/site.config";
import { flags } from "@/lib/flags";

/**
 * Site-wide ProfessionalService structured data (PLAN §8), generated
 * from site.config.ts so it can't fall out of date.
 *
 * Placeholder and empty values are dropped: a schema asserting
 * "[PLACEHOLDER: agency phone]" as a telephone is worse than silence.
 *
 * Flagged services only appear when their flag is on (PLAN §2.1).
 */
const isReal = (v: unknown) =>
  Array.isArray(v)
    ? v.length > 0
    : v !== "" && v != null && !(typeof v === "string" && v.includes("[PLACEHOLDER"));

export function JsonLd() {
  const services = ["Web design", "Local SEO", ...(flags.automations ? ["Lead automations"] : [])];

  const data = {
    "@context": "https://schema.org",
    "@type": site.schemaType,
    name: site.name,
    legalName: site.legalName,
    description: site.seo.defaultDescription,
    url: site.url,
    telephone: site.phone.e164,
    email: site.email,
    address: {
      "@type": "PostalAddress",
      addressRegion: site.location.state,
      addressCountry: site.location.country,
    },
    areaServed: [
      ...site.serviceArea.cities.map((city) => ({
        "@type": "City",
        name: `${city}, ${site.location.state}`,
      })),
      { "@type": "Country", name: site.serviceArea.remoteCountry },
    ],
    knowsAbout: services,
    sameAs: Object.values(site.socials).filter(Boolean),
  };

  const pruned = Object.fromEntries(Object.entries(data).filter(([, v]) => isReal(v)));

  return <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(pruned)} />;
}
