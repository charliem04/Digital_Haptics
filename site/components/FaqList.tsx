/**
 * Questions people actually ask before they call, answered in the open
 * rather than hidden behind an accordion that has to be fought with on
 * a phone. The first one starts open; the rest are one tap away, and
 * they are real <details> elements, so find-in-page and the keyboard
 * both work without any of this component’s help.
 *
 * Emits FAQPage structured data from the same array that renders the
 * list, so the two can never say different things.
 */
import type { Faq } from "@/content/types";

export function FaqList({
  faqs,
  heading = "Questions people ask",
  lede,
}: {
  faqs: Faq[];
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
    // Restyled in Phase 3 with the section label and heading components.
    <section className="page-x section-y">
      <h2 className="font-display text-heading font-semibold">{heading}</h2>
      {lede && <p className="mt-4 max-w-lede text-steel-deep">{lede}</p>}
      <div className="mt-10 border-t border-ink">
          {faqs.map((f, i) => (
            <details
              key={f.q}
              open={i === 0}
              className="group border-b border-ink py-5"
            >
              <summary className="flex min-h-touch cursor-pointer list-none items-start justify-between gap-6 font-display text-subheading font-semibold text-ink">
                {f.q}
                <span
                  aria-hidden
                  className="mt-1 shrink-0 font-mono text-steel group-open:hidden"
                >
                  +
                </span>
                <span
                  aria-hidden
                  className="mt-1 hidden shrink-0 font-mono text-steel group-open:block"
                >
                  −
                </span>
              </summary>
              <p className="mt-3 max-w-[68ch]">{f.a}</p>
            </details>
          ))}
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
      />
    </section>
  );
}
