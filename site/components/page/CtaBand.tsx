import { ctaLink, contactLinks } from "@/lib/nav";
import { Button } from "@/components/ui/Button";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Section } from "@/components/layout/Section";
import { Container } from "@/components/layout/Container";
import type { CtaCopy } from "@/content/types";

/**
 * The band that closes a page (PLAN §5 "Final CTA band"): a heading in
 * the page's own words, and the one action. A phone line under it for
 * people who'd rather call. Renders nothing if /start isn't live.
 *
 * `opening` is Home's version (docs/VISUAL_GUIDE.md §6): the band is a
 * window onto the fixed liquid layer, with its text on a solid plate.
 */
export function CtaBand({
  copy,
  id = "cta",
  opening = false,
}: {
  copy: CtaCopy;
  id?: string;
  opening?: boolean;
}) {
  const cta = ctaLink();
  if (!cta) return null;
  const { phone } = contactLinks();

  const content = (
    <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
      <div className="flex max-w-[720px] flex-col gap-4">
        <SectionLabel>Next step</SectionLabel>
        <h2 id={id} className="font-body text-room-cta font-medium">
          {copy.heading}
        </h2>
        <p className="text-room-lede text-muted">{copy.body}</p>
      </div>
      <div className="flex flex-col gap-3">
        <Button href={cta.href}>{cta.label}</Button>
        {phone && (
          <a
            href={phone.href}
            className="inline-flex min-h-touch items-center no-underline font-body text-room-small text-text hover:text-amber active:text-muted"
          >
            Or call {phone.display}
          </a>
        )}
      </div>
    </div>
  );

  if (opening) {
    return (
      <section
        aria-labelledby={id}
        data-track-loc="cta-band"
        data-liquid-opening
        className="relative z-10 py-16 lg:py-[140px]"
      >
        <Container>
          <div className="max-w-[880px] rounded-panel bg-room p-6 lg:p-10">{content}</div>
        </Container>
      </section>
    );
  }

  return (
    <Section tone="ink" aria-labelledby={id} data-track-loc="cta-band">
      {content}
    </Section>
  );
}
