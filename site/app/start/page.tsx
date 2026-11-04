import { site } from "@/site.config";
import { pageMetadata } from "@/lib/meta";
import { contactLinks } from "@/lib/nav";
import { getIntakeOptions, getStartFaq, getStartSteps } from "@/lib/content";
import { PageHero } from "@/components/page/PageHero";
import { Section } from "@/components/layout/Section";
import { SectionHead } from "@/components/page/SectionHead";
import { StepsStrip } from "@/components/page/StepsStrip";
import { FaqList } from "@/components/FaqList";
import { CutFrame } from "@/components/ui/CutFrame";
import { BoxedLabel } from "@/components/ui/BoxedLabel";
import { IntakeForm } from "@/components/start/IntakeForm";
import { BookingEmbed } from "@/components/BookingEmbed";

/**
 * ════════════════════════════════════════════════════════════════════
 *  START A PROJECT (PLAN §5): how it works (3 steps) · intake form ·
 *  or book a call (Cal.com, shown once an event URL is set) · FAQ.
 *  Every CTA on the site points here. No sticky CTA on this page.
 * ════════════════════════════════════════════════════════════════════
 */
export const metadata = pageMetadata({
  title: "Start a Project",
  description:
    "Tell us about your trades business and what the website needs to do. One short form; we reach out to set up a call and quote the work.",
  path: "/start/",
});

const bookingUrl: string = site.booking.calUrl;

export default function StartPage() {
  const options = getIntakeOptions();
  const contact = contactLinks();

  return (
    <>
      <PageHero
        path="/start/"
        label="Start a project"
        title="Tell us about the job"
        lead={`One short form. We read every one and reach out within ${site.intake.responseTime}.`}
      >
        <div className="pt-6">
          <StepsStrip steps={getStartSteps()} />
        </div>
      </PageHero>

      <Section spacing="tight" aria-labelledby="intake" className="pb-section-sm lg:pb-section">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:gap-16">
          <CutFrame size="lg" fill="frost" innerClassName="flex flex-col gap-8 p-5 sm:p-8 lg:p-12">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ink pb-5">
              <BoxedLabel tone="ink">Intake</BoxedLabel>
              <span className="font-mono text-label uppercase tracking-label text-steel">
                All fields required unless marked
              </span>
            </div>
            <h2 id="intake" className="font-display text-heading font-semibold">
              Project details
            </h2>
            <IntakeForm
              endpoint={site.intake.endpoint}
              trades={options.trades}
              timelines={options.timelines}
              budgets={options.budgets}
              services={options.services}
              sms={options.sms}
              contact={contact}
            />
          </CutFrame>

          <aside aria-labelledby="direct" className="flex flex-col gap-6">
            <SectionHead
              id="direct"
              label="Prefer to talk?"
              title={bookingUrl ? "Book a call" : "Call or email"}
              lede={
                bookingUrl
                  ? "Pick a time that suits you. Same conversation, no form."
                  : "Same conversation, no form."
              }
            />
            <ul className="flex flex-col border-t border-ink font-mono text-label uppercase tracking-label">
              {contact.phone && (
                <li className="border-b border-hairline">
                  <a
                    href={contact.phone.href}
                    className="flex min-h-[56px] items-center justify-between gap-4 text-ink no-underline hover:underline active:text-steel-deep"
                  >
                    <span className="text-steel">Phone</span>
                    {contact.phone.display}
                  </a>
                </li>
              )}
              {contact.email && (
                <li className="border-b border-hairline">
                  <a
                    href={contact.email.href}
                    className="flex min-h-[56px] items-center justify-between gap-4 normal-case tracking-normal text-ink no-underline hover:underline active:text-steel-deep"
                  >
                    <span className="uppercase tracking-label text-steel">Email</span>
                    <span className="break-all">{contact.email.display}</span>
                  </a>
                </li>
              )}
            </ul>
          </aside>
        </div>

        {bookingUrl && (
          <div className="mt-section-sm flex flex-col gap-6 lg:mt-section">
            <SectionHead id="book" label="Book a call" title="Or pick a time" />
            <BookingEmbed />
          </div>
        )}
      </Section>

      <FaqList faqs={getStartFaq()} />
    </>
  );
}
