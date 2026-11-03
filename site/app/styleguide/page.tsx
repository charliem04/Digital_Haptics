import type { ReactNode } from "react";
import { pageMetadata } from "@/lib/meta";
import { flags } from "@/lib/flags";
import { cn } from "@/lib/cn";
import { CutFrame, type Corner, type CutFill, type CutSize } from "@/components/ui/CutFrame";
import { Button } from "@/components/ui/Button";
import { BoxedLabel } from "@/components/ui/BoxedLabel";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Chip } from "@/components/ui/Chip";
import { Marker } from "@/components/ui/Marker";
import { Arrow, ArrowBlock } from "@/components/ui/Arrow";
import { Flare } from "@/components/ui/Flare";
import { Logo } from "@/components/ui/Logo";
import {
  Checkbox,
  CheckboxGroup,
  SelectField,
  TextAreaField,
  TextField,
} from "@/components/ui/Field";
import { CaseCard } from "@/components/CaseCard";
import { HeroSidebar } from "@/components/HeroSidebar";
import { LeadFlowPanel } from "@/components/LeadFlowPanel";
import { ChipDemo } from "@/components/styleguide/ChipDemo";
import { HeaderView } from "@/components/layout/Header";
import { FooterView } from "@/components/layout/Footer";
import { contactLinks, footerData, type NavLink } from "@/lib/nav";
import { isOn } from "@/lib/flags";
import { nav } from "@/lib/routes";
import { site } from "@/site.config";

/**
 * ════════════════════════════════════════════════════════════════════
 *  /styleguide — every token and component (PLAN §9, Phase 1).
 *
 *  Hidden: noindex (pageMetadata), out of the sitemap (route registry
 *  `noindex`), linked from nowhere. Shows this build's flag state, so a
 *  flag-off build shows flagged components in their off state only.
 *
 *  Sample values are bracketed placeholders (PLAN: never invent client
 *  names or results). Trades are PLAN §1's list.
 * ════════════════════════════════════════════════════════════════════
 */
export const metadata = pageMetadata(
  {
    title: "Styleguide",
    description: "Design tokens and components for the Digital Haptics site.",
    path: "/styleguide/",
  },
  { noindex: true }
);

const TRADES = ["Roofing", "Plumbing", "HVAC", "Contractors", "Dirt work"];

/**
 * The full header nav as it will look once every page is live, with
 * flagged items still filtered by this build's flags. Every href is "/"
 * because the real pages don't exist yet (the build fails on dead
 * links). Styleguide only.
 */
const DEMO_LINKS: NavLink[] = nav
  .filter((n) => isOn(n.flag))
  .map((n) => ({
    href: "/",
    label: n.label,
    children: (n.children ?? [])
      .filter((c) => isOn(c.flag))
      .map((c) => ({ href: "/", label: c.label })),
  }));
const DEMO_CTA = { href: "/", label: site.cta.label };

const COLORS: { token: string; hex: string; use: string; note: string; dark?: boolean }[] = [
  { token: "ice", hex: "#E4EEF4", use: "Page ground, dot grid", note: "ink 16.5:1" },
  { token: "frost", hex: "#F4F8FB", use: "Panels, section frames", note: "ink 18.2:1" },
  { token: "white", hex: "#FFFFFF", use: "Cards, inputs", note: "steel 7.61:1" },
  {
    token: "steel-panel",
    hex: "#CFDAE2",
    use: "Hero sidebar, bands",
    note: "steel 5.36 · steel-deep 6.56",
  },
  { token: "hairline", hex: "#C9D5DE", use: "Row dividers", note: "Decorative only" },
  { token: "ink", hex: "#0B0D10", use: "Text, borders, slabs", note: "ice 16.5:1", dark: true },
  {
    token: "steel",
    hex: "#4A5560",
    use: "Secondary text, labels",
    note: "6.46 on ice",
    dark: true,
  },
  {
    token: "steel-deep",
    hex: "#3E4852",
    use: "Hero subline, sidebar copy",
    note: "7.91 on ice",
    dark: true,
  },
  {
    token: "signal",
    hex: "#FF5A1F",
    use: "Actions, flare, markers",
    note: "Never text on light · ink on it 6.24",
  },
  { token: "flare-core", hex: "#FFF4EC", use: "Flare node", note: "Decorative" },
];

const SWATCH: Record<string, string> = {
  ice: "bg-ice",
  frost: "bg-frost",
  white: "bg-white",
  "steel-panel": "bg-steel-panel",
  hairline: "bg-hairline",
  ink: "bg-ink",
  steel: "bg-steel",
  "steel-deep": "bg-steel-deep",
  signal: "bg-signal",
  "flare-core": "bg-flare-core",
};

const TYPE: { role: string; spec: string; sample: ReactNode; className: string }[] = [
  {
    role: "Display",
    spec: "Chakra Petch 600 · 54→112px · lh .9 · caps",
    sample: "Booked.",
    className: "font-display text-display font-semibold uppercase",
  },
  {
    role: "Display small",
    spec: "Chakra Petch 600 · 40→70px · lh .9 · caps",
    sample: "Booked.",
    className: "font-display text-display-sm font-semibold uppercase",
  },
  {
    role: "Heading",
    spec: "Chakra Petch 600 · 28→36px · sentence case",
    sample: "Local SEO for Acadiana contractors",
    className: "font-display text-heading font-semibold",
  },
  {
    role: "Subheading",
    spec: "Chakra Petch 600 · 20→24px",
    sample: "Websites that book the job",
    className: "font-display text-subheading font-semibold",
  },
  {
    role: "Body large",
    spec: "Manrope 400 · 17→19px · lh 1.55 · steel-deep",
    sample:
      "Design and local SEO for trades businesses. Built to load fast, rank locally and turn visitors into calls.",
    className: "max-w-lede text-body-lg text-steel-deep",
  },
  {
    role: "Body",
    spec: "Manrope 400 · 16→17px · lh 1.55",
    sample:
      "Design and local SEO for trades businesses. Built to load fast, rank locally and turn visitors into calls.",
    className: "max-w-[640px] text-body",
  },
  {
    role: "Body small / xs",
    spec: "Manrope 400 · 15px / 14px",
    sample: "Found first when someone nearby searches for your trade.",
    className: "text-body-sm",
  },
  {
    role: "Label",
    spec: "JetBrains Mono 500 · 11–13px · .08–.16em · caps",
    sample: "( 01 ) — Web design · Local SEO",
    className: "font-mono text-label uppercase tracking-label-lg text-steel",
  },
];

const CUTS: { size: CutSize; px: string; corners: Corner[]; fill: CutFill; where: string }[] = [
  { size: "sm", px: "10px", corners: ["tl"], fill: "white", where: "Inputs (top-left)" },
  { size: "md", px: "16px", corners: ["tl", "br"], fill: "white", where: "Case cards, panels" },
  { size: "lg", px: "24px", corners: ["tl", "br"], fill: "frost", where: "Section frames" },
  { size: "xl", px: "56px", corners: ["bl"], fill: "steel-panel", where: "Hero sidebar" },
];

function Specimen({
  id,
  index,
  kicker,
  title,
  note,
  children,
}: {
  id: string;
  index: number;
  kicker: string;
  title: string;
  note?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section aria-labelledby={id} className="flex flex-col gap-8 border-t border-ink pt-10">
      <div className="flex flex-col gap-3">
        <SectionLabel index={index}>{kicker}</SectionLabel>
        <h2 id={id} className="font-display text-heading font-semibold">
          {title}
        </h2>
        {note && <p className="max-w-[680px] text-body-sm text-steel">{note}</p>}
      </div>
      {children}
    </section>
  );
}

function Caption({ children }: { children: ReactNode }) {
  return (
    <p className="font-mono text-label-sm uppercase tracking-label-xs text-steel">{children}</p>
  );
}

export default function StyleguidePage() {
  const flagState = flags.automations ? "on" : "off";

  return (
    <div className="flex flex-col gap-section-sm pb-section-sm lg:gap-section lg:pb-section">
      <header className="page-x flex flex-col gap-5 pt-section-sm lg:pt-section">
        <div className="flex flex-wrap items-center gap-4">
          <BoxedLabel tone="ink">Styleguide</BoxedLabel>
          <BoxedLabel>Flags {flagState}</BoxedLabel>
        </div>
        <h1 className="font-display text-display-sm font-semibold uppercase">Design system</h1>
        <p className="max-w-[680px] text-body text-steel-deep">
          Every token and component, as this build renders them. Tab through the page to check focus
          rings: they follow cut corners on fields and cards. Values come from PLAN §4 and the
          Hybrid mockup; contrast ratios are WCAG.
        </p>
      </header>

      <div className="page-x flex flex-col gap-section-sm lg:gap-section">
        <Specimen id="sg-color" index={1} kicker="Tokens" title="Color">
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {COLORS.map((c) => (
              <li key={c.token} className="flex flex-col gap-2.5">
                <div className={cn("h-24 border border-ink", SWATCH[c.token])} />
                <div className="font-mono text-label">
                  <p className="font-medium uppercase">
                    {c.token} · {c.hex}
                  </p>
                  <p className="text-steel">{c.use}</p>
                  <p className="text-steel">{c.note}</p>
                </div>
              </li>
            ))}
          </ul>
        </Specimen>

        <Specimen
          id="sg-type"
          index={2}
          kicker="Tokens"
          title="Typography"
          note="Display sizes scale with the viewport (clamp). Labels are always mono caps."
        >
          <ul className="flex flex-col">
            {TYPE.map((t) => (
              <li
                key={t.role}
                className="grid gap-3 border-b border-hairline py-6 lg:grid-cols-[240px_1fr] lg:gap-10"
              >
                <div className="flex flex-col gap-1">
                  <p className="font-mono text-label font-medium uppercase">{t.role}</p>
                  <Caption>{t.spec}</Caption>
                </div>
                <p className={t.className}>{t.sample}</p>
              </li>
            ))}
          </ul>
        </Specimen>

        <Specimen
          id="sg-cuts"
          index={3}
          kicker="Tokens"
          title="Cut corners"
          note="Radius is 0 everywhere. Shape comes from 45° cuts; the border follows the cut."
        >
          <ul className="grid grid-cols-2 gap-6 lg:grid-cols-4">
            {CUTS.map((c) => (
              <li key={c.size} className="flex flex-col gap-3">
                <CutFrame size={c.size} corners={c.corners} fill={c.fill} className="h-28" />
                <Caption>
                  {c.size} · {c.px} · {c.where}
                </Caption>
              </li>
            ))}
          </ul>
        </Specimen>

        <Specimen
          id="sg-signature"
          index={4}
          kicker="Elements"
          title="Signature elements"
          note="All decorative and aria-hidden. The flare pulses slowly; under reduced motion it holds still."
        >
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="flex flex-col gap-3">
              <div className="h-40 border border-ink bg-ice bg-dots bg-dot-pitch" />
              <Caption>Dot grid · 16px (14px mobile)</Caption>
            </div>
            <div className="flex flex-col gap-3">
              <div className="h-40 border border-ink bg-ice bg-dots-dense bg-dot-pitch-dense" />
              <Caption>Dense dot grid · 10px · screenshot slots</Caption>
            </div>
            <div className="flex flex-col gap-3">
              <div className="relative h-40 overflow-hidden border border-ink bg-ice">
                <Flare x="62%" y="58%" />
              </div>
              <Caption>Flare crosshair · hero only</Caption>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-8">
            <div className="flex items-center gap-3">
              <Marker />
              <Caption>Marker · 8px</Caption>
            </div>
            <div className="flex items-center gap-3">
              <Marker size="dot" />
              <Caption>Status dot · 7px</Caption>
            </div>
            <div className="flex items-center gap-3">
              <ArrowBlock />
              <Caption>Arrow block</Caption>
            </div>
            <div className="flex items-center gap-3">
              <Arrow className="size-5" />
              <Caption>Arrow glyph</Caption>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <BoxedLabel>ACT.01 — Design</BoxedLabel>
            <BoxedLabel active>ACT.02 — Active</BoxedLabel>
            <BoxedLabel size="md">ACT.02</BoxedLabel>
            <BoxedLabel tone="ink">System D</BoxedLabel>
          </div>
          <SectionLabel index={1}>Web design · Local SEO — Acadiana, LA</SectionLabel>
        </Specimen>

        <Specimen
          id="sg-buttons"
          index={5}
          kicker="Components"
          title="Buttons"
          note="52px default, 48px small. Hover nudges the arrow. Ghost is the secondary action beside a primary."
        >
          <div className="flex flex-wrap gap-3.5">
            <Button>Primary</Button>
            <Button variant="accent">Accent</Button>
            <Button variant="ghost">Ghost</Button>
            <Button href="/">As a link</Button>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button size="sm">Primary</Button>
            <Button size="sm" variant="accent">
              Accent
            </Button>
            <Button size="sm" variant="ghost">
              Ghost
            </Button>
            <Button size="sm" disabled>
              Disabled
            </Button>
          </div>
          <div className="max-w-sidebar">
            <Button block>Block</Button>
          </div>
        </Specimen>

        <Specimen
          id="sg-fields"
          index={6}
          kicker="Components"
          title="Form fields"
          note="White, 1px ink, top-left cut, 48px. Errors: ink text with an Error prefix and a signal bar, never color alone."
        >
          <form className="grid max-w-[880px] gap-6 md:grid-cols-2" action="#" noValidate>
            <TextField
              id="sg-name"
              label="Your name"
              autoComplete="name"
              placeholder="First and last"
            />
            <TextField
              id="sg-phone"
              label="Phone number"
              type="tel"
              autoComplete="tel"
              placeholder="(337) 555-0100"
              hint="Best number to reach you."
            />
            <TextField
              id="sg-email"
              label="Email"
              type="email"
              autoComplete="email"
              defaultValue="not-an-email"
              error="Enter an email we can reply to."
            />
            <TextField
              id="sg-website"
              label="Current website"
              type="url"
              optional
              placeholder="https://"
            />
            <SelectField
              id="sg-trade"
              label="Trade"
              placeholder="Choose one"
              options={TRADES.map((t) => ({ value: t.toLowerCase(), label: t }))}
            />
            <SelectField
              id="sg-trade-error"
              label="Timeline"
              placeholder="Choose one"
              options={[{ value: "placeholder", label: "[Timeline options]" }]}
              error="Pick a timeline."
            />
            <TextAreaField
              id="sg-message"
              label="Message"
              className="md:col-span-2"
              placeholder="What do you need?"
            />
            <CheckboxGroup id="sg-services" legend="Services interested in">
              <Checkbox id="sg-svc-design" name="services" value="web-design" label="Web Design" />
              <Checkbox id="sg-svc-seo" name="services" value="local-seo" label="Local SEO" />
            </CheckboxGroup>
            <CheckboxGroup
              id="sg-services-error"
              legend="With an error"
              error="Choose at least one."
            >
              <Checkbox id="sg-svc-e1" label="Web Design" />
              <Checkbox id="sg-svc-e2" label="Local SEO" />
            </CheckboxGroup>
          </form>
        </Specimen>

        <Specimen
          id="sg-chips"
          index={7}
          kicker="Components"
          title="Chips"
          note="Static tags, and toggles with aria-pressed for filters. Toggles are 44px tall."
        >
          <div className="flex flex-wrap gap-2">
            <Chip>ACT.01 Design</Chip>
            <Chip>ACT.02 SEO</Chip>
            <Chip active>Active</Chip>
          </div>
          <ChipDemo options={TRADES} />
        </Specimen>

        <Specimen
          id="sg-frames"
          index={8}
          kicker="Components"
          title="Section frame"
          note="CutFrame lg on frost, as the mockup frames a section."
        >
          <CutFrame size="lg" fill="frost" innerClassName="flex flex-col gap-8 p-6 lg:p-12">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ink pb-5">
              <div className="flex items-center gap-4">
                <BoxedLabel tone="ink">Frame</BoxedLabel>
                <span className="font-display text-subheading font-semibold uppercase tracking-subheading">
                  Section title
                </span>
              </div>
              <span className="text-body-sm text-steel">Meta line in steel</span>
            </div>
            <p className="max-w-[640px] text-body">
              Frames hold a section&rsquo;s content on frost. The header rule is 1px ink.
            </p>
          </CutFrame>
        </Specimen>

        <Specimen
          id="sg-case"
          index={9}
          kicker="Components"
          title="Case card"
          note="One link per card; the focus ring follows the cut. Placeholder values until a case study is confirmed."
        >
          <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((n) => (
              <li key={n}>
                <CaseCard
                  index={n}
                  href="/"
                  client="[Client name]"
                  trade={TRADES[n - 1]}
                  systems="Site / SEO"
                  result="[RESULT]"
                />
              </li>
            ))}
          </ul>
        </Specimen>

        <Specimen
          id="sg-sidebar"
          index={10}
          kicker="Components"
          title="Hero sidebar"
          note="Rail from 1280px up; a full-width band below that. Content follows this build's flags."
        >
          <div className="flex flex-wrap items-start gap-10">
            <HeroSidebar ctaHref="/" className="h-[640px]" />
          </div>
          <div className="-mx-gutter-sm lg:-mx-gutter">
            <HeroSidebar variant="band" />
          </div>
        </Specimen>

        <Specimen
          id="sg-flagged"
          index={11}
          kicker="Components"
          title={flags.automations ? "Flagged: lead-flow panel" : "Flagged components"}
          note={
            flags.automations
              ? "Rendered: its flag is on in this build."
              : "🚩 Flagged component. Not rendered in this build; its off state is no panel at all."
          }
        >
          <LeadFlowPanel />
        </Specimen>

        <Specimen id="sg-logo" index={12} kicker="Components" title="Logo">
          <Logo />
        </Specimen>
      </div>

      <section aria-labelledby="sg-shell" className="flex flex-col gap-8">
        <div className="page-x flex flex-col gap-3 border-t border-ink pt-10">
          <SectionLabel index={13}>Layout shell</SectionLabel>
          <h2 id="sg-shell" className="font-display text-heading font-semibold">
            Header, menu and footer
          </h2>
          <p className="max-w-[680px] text-body-sm text-steel">
            With every nav item, as it will look once the pages exist (these demo links all go
            home). The real header and footer on this page show only live pages. Below 1024px the
            demo header&rsquo;s menu button opens the full-screen menu: Escape closes it.
          </p>
        </div>
        <div className="border-y border-ink">
          <HeaderView links={DEMO_LINKS} cta={DEMO_CTA} contact={contactLinks()} />
        </div>
        <FooterView
          data={{
            ...footerData(),
            site: [...DEMO_LINKS.map(({ label }) => ({ href: "/", label })), DEMO_CTA],
            services: DEMO_LINKS.flatMap((l) => l.children ?? []),
          }}
          cta={DEMO_CTA}
        />
      </section>

      <section aria-labelledby="sg-hero" className="flex flex-col gap-8">
        <div className="page-x flex flex-col gap-3 border-t border-ink pt-10">
          <SectionLabel index={14}>Assembly</SectionLabel>
          <h2 id="sg-hero" className="font-display text-heading font-semibold">
            Hero assembly
          </h2>
          <p className="max-w-[680px] text-body-sm text-steel">
            The pieces together, to check the flare, sidebar and panel at 1024, 1280 and 1440px
            (REFACTOR_AUDIT R6, R12). The real hero is built in Phase 3.
          </p>
        </div>
        <HeroAssembly />
      </section>
    </div>
  );
}

/**
 * Hero layout check, at the mockup's proportions: the crossing sits
 * 350px left of the rail (770px at 1440, as drawn), so the lead-flow
 * panel beside it clears the rail at 1280 too. The horizontal line stops at the rail, and the rail runs
 * the full height. Below xl the rail becomes the band, and the crossing
 * drops below the buttons so the horizontal line never runs through
 * body text.
 */
function HeroAssembly() {
  return (
    <div className="border-y border-ink">
      <div className="relative mx-auto max-w-page overflow-hidden [--fh:0px] [--fx:86%] [--fy:calc(100%-40px)] xl:[--fh:320px] xl:[--fx:calc(100%-670px)] xl:[--fy:366px]">
        <Flare x="var(--fx)" y="var(--fy)" hEnd="var(--fh)" />
        <div className="relative flex flex-col gap-[26px] px-gutter-sm pb-16 pt-12 lg:px-gutter xl:min-h-[736px] xl:pr-[384px] xl:pt-[88px]">
          <SectionLabel index={1}>
            {flags.automations
              ? "Web design · Local SEO · Automations — Acadiana, LA"
              : "Web design · Local SEO — Acadiana, LA"}
          </SectionLabel>
          {/* At xl the line "Websites that" must fit left of the rail:
              available width = 100vw − 384 (rail + gutter) − 64 − ~100
              for the arrow block, and the line is ~7.35em wide. 7.6
              leaves headroom for the scrollbar. Without the cap it
              wraps to three lines at 1280. */}
          <p className="flex flex-col gap-1 font-display text-display font-semibold uppercase md:gap-[26px] xl:text-[min(7rem,calc((100vw-548px)/7.6))]">
            <span className="flex items-center gap-5">
              <ArrowBlock />
              Websites that
            </span>
            <span>book the job.</span>
          </p>
          <p className="max-w-lede text-body-lg text-steel-deep">
            {flags.automations
              ? "Design, local SEO and lead automations for trades businesses. Built to load fast, rank locally and follow up with every lead automatically."
              : "Design and local SEO for trades businesses. Built to load fast, rank locally and turn visitors into calls."}
          </p>
          <div className="flex flex-wrap gap-3.5">
            <Button href="/">Start a Project</Button>
            <Button href="/" variant="ghost">
              See the Work
            </Button>
          </div>
          <LeadFlowPanel className="xl:absolute xl:left-[calc(100%-650px)] xl:top-[386px]" />
        </div>
        <HeroSidebar ctaHref="/" className="absolute right-0 top-0 hidden h-full xl:block" />
      </div>
      <HeroSidebar variant="band" className="border-b-0 xl:hidden" />
    </div>
  );
}
