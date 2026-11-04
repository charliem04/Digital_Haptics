import { site } from "@/site.config";
import { flags } from "@/lib/flags";
import { pageMetadata } from "@/lib/meta";
import { isLive } from "@/lib/routes";
import { Container } from "@/components/layout/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { CutFrame } from "@/components/ui/CutFrame";
import { BoxedLabel } from "@/components/ui/BoxedLabel";
import { Button } from "@/components/ui/Button";
import { LeadFlowPanel } from "@/components/LeadFlowPanel";
import { StepsStrip } from "@/components/page/StepsStrip";

/**
 * ════════════════════════════════════════════════════════════════════
 *  THANK-YOU (PLAN §5 /start/thanks). noindex (route registry).
 *
 *  Flag off: confirmation, "We'll reach out within [RESPONSE TIME],"
 *  next steps, link to Work.
 *  Flag on: adds the lead-flow panel and "That text you just got?
 *  That's the same system we build for clients."
 * ════════════════════════════════════════════════════════════════════
 */
export const metadata = pageMetadata(
  {
    title: "Thanks, it's in",
    description: "Your project details reached Digital Haptics. Here's what happens next.",
    path: "/start/thanks/",
  },
  { noindex: true }
);

export default function ThanksPage() {
  const work = isLive("/work/");

  return (
    <Container className="flex flex-col gap-section-sm py-section-sm lg:py-section">
      <CutFrame size="lg" fill="frost" innerClassName="flex flex-col gap-8 p-6 lg:p-12">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ink pb-5">
          <BoxedLabel tone="ink">Received</BoxedLabel>
          <SectionLabel>Start a project — done</SectionLabel>
        </div>
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex max-w-[640px] flex-col gap-5">
            <h1 className="font-display text-display-sm font-semibold uppercase">
              Thanks. It&rsquo;s in.
            </h1>
            <p className="text-body-lg text-steel-deep">
              We&rsquo;ll reach out within {site.intake.responseTime}.
            </p>
            {flags.automations && (
              <p className="text-body-lg text-ink">
                That text you just got? That&rsquo;s the same system we build for clients.
              </p>
            )}
          </div>
          <LeadFlowPanel className="shrink-0" />
        </div>
      </CutFrame>

      <div className="flex flex-col gap-8">
        <SectionLabel>What happens next</SectionLabel>
        <StepsStrip
          steps={[
            { name: "We read it", body: "Every submission is read by a person, not filed." },
            {
              name: "We reach out",
              body: `Within ${site.intake.responseTime}, to set up a short call.`,
            },
            { name: "You get a quote", body: "A clear quote after the call, for what you need." },
          ]}
        />
      </div>

      <div className="flex flex-wrap gap-3.5">
        {work && <Button href="/work/">See the work</Button>}
        <Button href="/" variant="ghost">
          Back to home
        </Button>
      </div>
    </Container>
  );
}
