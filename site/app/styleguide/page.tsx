import Link from "next/link";
import type { ReactNode } from "react";
import { pageMetadata } from "@/lib/meta";
import { flags } from "@/lib/flags";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Arrow } from "@/components/ui/Arrow";
import { Logo } from "@/components/ui/Logo";
import {
  Checkbox,
  CheckboxGroup,
  SelectField,
  TextAreaField,
  TextField,
} from "@/components/ui/Field";
import { CaseCard } from "@/components/CaseCard";
import { LeadFlowPanel } from "@/components/LeadFlowPanel";
import { ChipDemo } from "@/components/styleguide/ChipDemo";
import { HeaderView } from "@/components/layout/Header";
import { FooterView } from "@/components/layout/Footer";
import { StickyBar } from "@/components/layout/StickyCta";
import { Section } from "@/components/layout/Section";
import { contactLinks, footerData, type NavLink } from "@/lib/nav";
import { isOn } from "@/lib/flags";
import { nav } from "@/lib/routes";
import { site } from "@/site.config";

/**
 * ════════════════════════════════════════════════════════════════════
 *  /styleguide — Molten Room tokens and components (docs/VISUAL_GUIDE.md).
 *
 *  Hidden: noindex (pageMetadata), out of the sitemap (route registry
 *  `noindex`), linked from nowhere. Shows this build's flag state, so a
 *  flag-off build shows flagged components in their off state only.
 *
 *  Sample values are bracketed placeholders (PLAN: never invent client
 *  names or results). Trades are PLAN §1's list. The site's real header
 *  and footer around this page keep the old look until the pages
 *  migrate; the layout shell section below shows the new ones.
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
 * The full nav as it looks once every page is live, with flagged items
 * still filtered by this build's flags. Every href is "/" because the
 * build fails on dead links. Styleguide only.
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

const COLORS: { token: string; hex: string; use: string; note: string; swatch: string }[] = [
  { token: "room", hex: "#12161A", use: "Page ground", note: "text 15.97", swatch: "bg-room" },
  {
    token: "surface",
    hex: "#1A2025",
    use: "Sections, forms",
    note: "text 14.45",
    swatch: "bg-surface",
  },
  { token: "raised", hex: "#232C30", use: "Cards", note: "text 12.51", swatch: "bg-raised" },
  { token: "line", hex: "#3B4847", use: "Dividers", note: "Decorative only", swatch: "bg-line" },
  {
    token: "text",
    hex: "#EEF1EE",
    use: "Text, focus ring",
    note: "On room 15.97",
    swatch: "bg-text",
  },
  {
    token: "muted",
    hex: "#A9B5B2",
    use: "Secondary text",
    note: "On raised 6.74",
    swatch: "bg-muted",
  },
  {
    token: "amber",
    hex: "#F5A254",
    use: "Primary action",
    note: "on-amber 8.95",
    swatch: "bg-amber",
  },
  {
    token: "amber-hover",
    hex: "#F9B878",
    use: "Primary hover",
    note: "on-amber 10.69",
    swatch: "bg-amber-hover",
  },
  {
    token: "on-amber",
    hex: "#171310",
    use: "Text on amber",
    note: "On amber 8.95",
    swatch: "bg-on-amber",
  },
  { token: "error", hex: "#FF9D8A", use: "Errors", note: "On raised 7.08", swatch: "bg-error" },
];

const SUBLINE =
  "Design and local SEO for trades businesses. Built to load fast, rank locally and turn visitors into calls.";

const TYPE: { role: string; spec: string; sample: string; className: string }[] = [
  {
    role: "Display",
    spec: "48–104px, 500",
    sample: "Websites that book the job.",
    className: "text-room-display",
  },
  { role: "Page title", spec: "43–90px, 500", sample: "Pricing", className: "text-room-title" },
  {
    role: "CTA heading",
    spec: "32–52px, 500",
    sample: "Tell us about the job.",
    className: "text-room-cta",
  },
  {
    role: "Section heading",
    spec: "30–46px, 500",
    sample: "How a project runs",
    className: "text-room-section",
  },
  {
    role: "Form heading",
    spec: "30px, 500",
    sample: "Project details",
    className: "text-room-form",
  },
  { role: "Card title", spec: "26px, 500", sample: "Web Design", className: "text-room-card" },
  { role: "Step title", spec: "21px, 500", sample: "We reach out", className: "text-room-step" },
  {
    role: "Price",
    spec: "20px, 500",
    sample: "Websites from $1,000",
    className: "text-room-price",
  },
  { role: "Lede", spec: "19px, 400", sample: SUBLINE, className: "max-w-[34em] text-room-lede" },
  { role: "Body", spec: "17px, 400", sample: SUBLINE, className: "max-w-[40em] text-room-body" },
  {
    role: "Small",
    spec: "15px",
    sample: "Found first when someone nearby searches for your trade.",
    className: "text-room-small",
  },
  {
    role: "Caption",
    spec: "14px, the minimum",
    sample: "Acadiana, LA",
    className: "text-room-caption text-muted",
  },
];

const SHAPES = [
  { name: "Panel", value: "28px", className: "rounded-panel" },
  { name: "Field", value: "12px", className: "rounded-field" },
  { name: "Notice", value: "10px", className: "rounded-notice" },
  { name: "Control", value: "Fully round", className: "rounded-control" },
];

function Specimen({
  id,
  title,
  note,
  children,
}: {
  id: string;
  title: string;
  note?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section aria-labelledby={id} className="flex flex-col gap-8 border-t border-line pt-10">
      <div className="flex flex-col gap-3">
        <h2 id={id} className="text-room-section">
          {title}
        </h2>
        {note && <p className="max-w-[40em] text-room-small text-muted">{note}</p>}
      </div>
      {children}
    </section>
  );
}

function Caption({ children }: { children: ReactNode }) {
  return <p className="text-room-caption text-muted">{children}</p>;
}

export default function StyleguidePage() {
  const flagState = flags.automations ? "on" : "off";

  return (
    <div className="room">
      <div className="page-x flex flex-col gap-room-section-sm py-room-section-sm lg:gap-room-section lg:py-room-section">
        <header className="flex flex-col gap-5">
          <p className="text-room-small text-muted">Flags {flagState}</p>
          <h1 className="text-room-title">Design system</h1>
          <p className="max-w-[34em] text-room-lede text-muted">
            Every Molten Room token and component, as this build renders them. Tab through the page
            to check the focus ring. The source of truth is docs/VISUAL_GUIDE.md.
          </p>
        </header>

        <Specimen id="sg-color" title="Colour" note="Ratios are measured WCAG contrast.">
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {COLORS.map((c) => (
              <li key={c.token} className="flex flex-col gap-2.5">
                <div className={cn("h-24 rounded-field border border-line", c.swatch)} />
                <div className="text-room-caption">
                  <p className="font-medium">
                    {c.token} {c.hex}
                  </p>
                  <p className="text-muted">{c.use}</p>
                  <p className="text-muted">{c.note}</p>
                </div>
              </li>
            ))}
          </ul>
        </Specimen>

        <Specimen id="sg-type" title="Type" note="Manrope throughout, in sentence case.">
          <ul className="flex flex-col">
            {TYPE.map((t) => (
              <li
                key={t.role}
                className="grid gap-3 border-b border-line py-6 lg:grid-cols-[220px_1fr] lg:gap-10"
              >
                <div>
                  <p className="text-room-small font-medium">{t.role}</p>
                  <Caption>{t.spec}</Caption>
                </div>
                <p className={t.className}>{t.sample}</p>
              </li>
            ))}
          </ul>
        </Specimen>

        <Specimen
          id="sg-surfaces"
          title="Surfaces and shape"
          note="Depth comes from tone and grain, never from shadows."
        >
          <ul className="grid gap-4 md:grid-cols-3">
            <li className="rounded-panel border border-line p-6">
              <p className="text-room-card">Room</p>
              <Caption>Page ground</Caption>
            </li>
            <li className="room-surface rounded-panel p-6">
              <p className="text-room-card">Surface</p>
              <Caption>Sections and forms</Caption>
            </li>
            <li className="room-raised rounded-panel p-6">
              <p className="text-room-card">Raised</p>
              <Caption>Cards</Caption>
            </li>
          </ul>
          <ul className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {SHAPES.map((s) => (
              <li key={s.name} className="flex flex-col gap-2.5">
                <div className={cn("room-raised h-20", s.className)} />
                <Caption>
                  {s.name}: {s.value}
                </Caption>
              </li>
            ))}
          </ul>
        </Specimen>

        <Specimen id="sg-buttons" title="Buttons" note="52px by default, 48px small.">
          <div className="flex flex-wrap items-center gap-3.5">
            <Button>Primary</Button>
            <Button variant="accent">Accent</Button>
            <Button variant="ghost">Ghost</Button>
            <Button href="/">As a link</Button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm">Primary</Button>
            <Button size="sm" variant="accent">
              Accent
            </Button>
            <Button size="sm" variant="ghost">
              Ghost
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button disabled>Primary disabled</Button>
            <Button variant="accent" disabled>
              Accent disabled
            </Button>
            <Button variant="ghost" disabled>
              Ghost disabled
            </Button>
          </div>
          <div className="max-w-sidebar">
            <Button block>Block</Button>
          </div>
          <Link
            href="/"
            className="inline-flex min-h-touch items-center gap-2 self-start font-medium underline underline-offset-[5px] hover:decoration-2 active:text-muted"
          >
            Text link
            <Arrow className="size-3.5" />
          </Link>
        </Specimen>

        <Specimen
          id="sg-fields"
          title="Form fields"
          note="Errors use a border and words, never colour alone."
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
              label="Phone"
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
              error="Check the email address."
            />
            <TextField
              id="sg-disabled"
              label="Disabled field"
              defaultValue="Not editable"
              disabled
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
              id="sg-time-error"
              label="Timeline"
              placeholder="Choose one"
              options={[{ value: "placeholder", label: "[Timeline options]" }]}
              error="Choose a timeline."
            />
            <SelectField
              id="sg-select-disabled"
              label="Disabled select"
              placeholder="Choose one"
              options={[{ value: "placeholder", label: "[Option]" }]}
              disabled
            />
            <TextAreaField
              id="sg-message"
              label="Message"
              className="md:col-span-2"
              placeholder="What do you need, and what isn't working now?"
            />
            <CheckboxGroup id="sg-services" legend="Services interested in">
              <Checkbox
                id="sg-svc-design"
                name="services"
                value="web-design"
                label="Web Design"
                defaultChecked
              />
              <Checkbox id="sg-svc-seo" name="services" value="local-seo" label="Local SEO" />
              <Checkbox id="sg-svc-off" label="Disabled option" disabled />
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

        <Specimen id="sg-chips" title="Chips" note="Static tags, and 44px toggles for filters.">
          <div className="flex flex-wrap gap-2">
            <Chip>Lafayette</Chip>
            <Chip>Broussard</Chip>
            <Chip active>Active</Chip>
          </div>
          <ChipDemo options={TRADES} />
        </Specimen>

        <Specimen
          id="sg-case"
          title="Case card"
          note="One link per card. Placeholder values until a case study is confirmed."
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
          id="sg-flagged"
          title={flags.automations ? "Flagged: lead-flow panel" : "Flagged components"}
          note={
            flags.automations
              ? "Rendered: its flag is on in this build."
              : "Not rendered in this build. Its off state is no panel at all."
          }
        >
          <LeadFlowPanel />
        </Specimen>

        <Specimen id="sg-logo" title="Logo">
          <Logo />
        </Specimen>

        <Specimen
          id="sg-sticky"
          title="Sticky call to action"
          note="Pinned to the bottom on phones, on every page except /start. Hidden from 1024px up."
        >
          <div className="-mx-gutter-sm lg:mx-0">
            <StickyBar cta={DEMO_CTA} />
          </div>
        </Specimen>
      </div>

      <section aria-labelledby="sg-sections" className="flex flex-col">
        <div className="page-x border-t border-line pt-10">
          <h2 id="sg-sections" className="text-room-section">
            Section tones
          </h2>
        </div>
        <Section aria-label="Default section">
          <p className="text-room-card">Default: room</p>
        </Section>
        <Section tone="frost" aria-label="Surface section">
          <p className="text-room-card">Alternate: surface</p>
        </Section>
        <Section tone="steel-panel" spacing="tight" aria-label="Raised section">
          <p className="text-room-card">Band: raised, tight spacing</p>
        </Section>
      </section>

      <section aria-labelledby="sg-shell" className="flex flex-col gap-8 pt-room-section-sm">
        <div className="page-x flex flex-col gap-3 border-t border-line pt-10">
          <h2 id="sg-shell" className="text-room-section">
            Header, menu and footer
          </h2>
          <p className="max-w-[40em] text-room-small text-muted">
            With every nav item, as it will look once the pages exist (these demo links all go
            home). Below 1024px the demo header&rsquo;s menu button opens the full-screen menu, and
            Escape closes it.
          </p>
        </div>
        <div className="border-y border-line">
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
    </div>
  );
}
