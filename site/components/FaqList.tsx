/**
 * Questions people ask, as real <details> elements: keyboard and
 * find-in-page work without any script, and the first one starts open.
 *
 * Emits FAQPage structured data from the same array that renders the
 * list, so the two can never say different things (PLAN §8).
 */
import type { Faq } from "@/content/types";
import { Section } from "@/components/layout/Section";
import { SectionHead } from "@/components/page/SectionHead";

export function FaqList({
  faqs,
  id = "faq",
  index,
  heading = "Questions people ask",
  lede,
}: {
  faqs: Faq[];
  id?: string;
  index?: number;
  heading?: string;
  lede?: string;
}) {
  if (faqs.length === 0) return null;

  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <Section aria-labelledby={id}>
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-16">
        <SectionHead id={id} index={index} label="FAQ" title={heading} lede={lede} />
        <div className="border-t border-ink">
          {faqs.map((f, i) => (
            <details key={f.q} open={i === 0} className="group border-b border-ink">
              <summary className="flex min-h-[64px] cursor-pointer list-none items-center justify-between gap-6 py-4 font-display text-subheading font-semibold text-ink [&::-webkit-details-marker]:hidden">
                {f.q}
                <span
                  aria-hidden
                  className="flex size-8 shrink-0 items-center justify-center border border-ink font-mono text-label transition-colors duration-[250ms] group-open:bg-ink group-open:text-ice"
                >
                  <span className="group-open:hidden">+</span>
                  <span className="hidden group-open:inline">−</span>
                </span>
              </summary>
              <p className="max-w-[68ch] pb-6 text-body text-steel-deep">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
      />
    </Section>
  );
}
