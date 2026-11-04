import { flags } from "@/lib/flags";
import { addOn, demoCopy, modules, problem, voiceCopy } from "@/data/automations";
import { demoSequence } from "@/data/demo";
import { Section } from "@/components/layout/Section";
import { SectionHead } from "@/components/page/SectionHead";
import { CutFrame } from "@/components/ui/CutFrame";
import { BoxedLabel } from "@/components/ui/BoxedLabel";
import { LeadFlowPanel } from "@/components/LeadFlowPanel";
import { LiveDemo } from "./LiveDemo";

/**
 * 🚩 The Automations page's own sections (PLAN §5): the problem, the
 * modules (AI voice "coming soon"), the live demo (its own flag), the
 * voice call-in (FEATURE_VOICE), and add-on positioning.
 *
 * A server component, rendered by app/services/[slug] only for the
 * automations slug, which only exists with FEATURE_AUTOMATIONS on.
 */
export function AutomationsSections() {
  if (!flags.automations) return null;

  return (
    <>
      <Section aria-labelledby="auto-problem">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
          <SectionHead
            id="auto-problem"
            label="The problem"
            title={problem.title}
            lede={problem.body}
          />
          <LeadFlowPanel className="shrink-0" />
        </div>
      </Section>

      <Section tone="frost" className="border-y border-ink" aria-labelledby="auto-modules">
        <div className="flex flex-col gap-10">
          <SectionHead id="auto-modules" label="Modules" title="What it can run" />
          <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {modules.map((m) => (
              <li key={m.name}>
                <CutFrame
                  size="md"
                  fill="white"
                  className="h-full"
                  innerClassName="flex h-full flex-col gap-3 p-6"
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="font-display text-subheading font-semibold">{m.name}</h3>
                    {m.soon && <BoxedLabel>Coming soon</BoxedLabel>}
                  </div>
                  <p className="text-body-sm text-steel-deep">{m.body}</p>
                </CutFrame>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {flags.automationsDemo && (
        <Section aria-labelledby="auto-demo">
          <div className="flex flex-col gap-10">
            <SectionHead
              id="auto-demo"
              label={demoCopy.label}
              title={demoCopy.title}
              lede={demoCopy.lede}
            />
            <LiveDemo copy={demoCopy} mock={demoSequence} />
          </div>
        </Section>
      )}

      {flags.voice && (
        <Section tone="ink" aria-labelledby="auto-voice">
          <div className="flex flex-col gap-4">
            <SectionHead
              id="auto-voice"
              tone="dark"
              label={voiceCopy.label}
              title={voiceCopy.title}
              lede={voiceCopy.body}
            />
            <p className="font-display text-display-sm font-semibold">{voiceCopy.number}</p>
          </div>
        </Section>
      )}

      <Section aria-labelledby="auto-addon">
        <SectionHead id="auto-addon" label="How it fits" title={addOn.title} lede={addOn.body} />
      </Section>
    </>
  );
}
