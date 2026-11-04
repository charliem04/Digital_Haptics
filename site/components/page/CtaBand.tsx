import { ctaLink, contactLinks } from "@/lib/nav";
import { Button } from "@/components/ui/Button";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Section } from "@/components/layout/Section";
import type { CtaCopy } from "@/content/types";

/**
 * The band that closes a page (PLAN §5 "Final CTA band"): an ink slab,
 * a heading in the page's own words, and the one action. A phone line
 * under it for people who'd rather call. Renders nothing if /start
 * isn't live.
 */
export function CtaBand({ copy, id = "cta" }: { copy: CtaCopy; id?: string }) {
  const cta = ctaLink();
  if (!cta) return null;
  const { phone } = contactLinks();

  return (
    <Section tone="ink" aria-labelledby={id} data-track-loc="cta-band">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex max-w-[720px] flex-col gap-4">
          <SectionLabel tone="ice">Next step</SectionLabel>
          <h2 id={id} className="font-display text-display-sm font-semibold uppercase">
            {copy.heading}
          </h2>
          <p className="text-body-lg text-ice/70">{copy.body}</p>
        </div>
        <div className="flex flex-col gap-3">
          <Button href={cta.href}>{cta.label}</Button>
          {phone && (
            <a
              href={phone.href}
              className="inline-flex min-h-touch items-center font-mono text-label uppercase tracking-label text-ice no-underline hover:text-signal active:text-ice/70"
            >
              Or call {phone.display}
            </a>
          )}
        </div>
      </div>
    </Section>
  );
}
