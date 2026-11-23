"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { LiquidMetal, type LiquidMetalHandle } from "@/lab/hero-motion/liquid/LiquidMetal";
import type { RehashContent } from "./content";
import { isDirection, isView, type DirectionId, type ViewId } from "./directions";
import s from "./rehash.module.css";

type P = { c: RehashContent; d: DirectionId };

/* ── Frame ─────────────────────────────────────────────────────────── */

export function RehashView({ content: c }: { content: RehashContent }) {
  const q = useSearchParams();
  const rawD = q.get("d");
  const rawP = q.get("p");
  const d: DirectionId = isDirection(rawD) ? rawD : "a";
  const view: ViewId = isView(rawP) ? rawP : "home";

  return (
    <div
      className={`${s.frame} ${s[d]}`}
      data-direction={d}
      data-view={view}
      // Demo only: links and forms never leave the page.
      onClickCapture={(e) => {
        if ((e.target as HTMLElement).closest("a")) e.preventDefault();
      }}
    >
      {/* Only pages with an opening load WebGL; the Liquid page mounts its own sample. */}
      {d === "a" && (view === "home" || view === "pricing" || view === "case") && <RoomLiquid />}
      <div className={s.page}>
        <Header c={c} d={d} />
        <main>
          {view === "home" && <Home c={c} d={d} />}
          {view === "pricing" && <Pricing c={c} d={d} />}
          {view === "start" && <Start c={c} d={d} />}
          {view === "case" && <CaseStudy c={c} d={d} />}
          {view === "components" && <Components c={c} d={d} />}
          {view === "liquid" && <LiquidUse d={d} />}
        </main>
        <Footer c={c} d={d} />
        {view !== "start" && <StickyCta c={c} />}
      </div>
    </div>
  );
}

/* ── Liquid ────────────────────────────────────────────────────────── */

function usePhone() {
  const [phone, setPhone] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    const on = () => setPhone(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return phone;
}

/** Lab measurement hook: lets the audit bench whichever canvas is mounted. */
function exposeHandle(handle: LiquidMetalHandle | null) {
  (window as unknown as { __rehash?: LiquidMetalHandle | null }).__rehash = handle;
}

/** Direction A: one fixed canvas, running only while an opening shows it. */
function RoomLiquid() {
  const phone = usePhone();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const seen = new Set<Element>();
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) seen.add(e.target);
        else seen.delete(e.target);
      }
      setVisible(seen.size > 0);
    });
    document.querySelectorAll("[data-aperture]").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div className={s.roomLiquid} aria-hidden>
      <LiquidMetal
        ref={exposeHandle}
        seed={5}
        coverage={0.46}
        flowSpeed={0.7}
        renderScale={phone ? 0.24 : 0.3}
        blobCount={phone ? 6 : 9}
        paused={!visible}
      />
    </div>
  );
}

function WindowLiquid() {
  const phone = usePhone();
  return (
    <LiquidMetal
      ref={exposeHandle}
      seed={11}
      coverage={0.62}
      flowSpeed={0.7}
      renderScale={phone ? 0.24 : 0.3}
      blobCount={phone ? 6 : 9}
    />
  );
}

function Still({ kind = "saddle", className = "" }: { kind?: string; className?: string }) {
  return <div aria-hidden className={`${s.still} ${s[`still_${kind}`]} ${className}`} />;
}

/* ── Small parts ───────────────────────────────────────────────────── */

function Arrow() {
  return (
    <svg aria-hidden viewBox="0 0 16 16" className={s.arrow}>
      <path d="M3 3l10 10M13 5v8H5" fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function Btn({
  kind = "primary",
  children,
  disabled,
  type = "button",
}: {
  kind?: "primary" | "accent" | "ghost";
  children: ReactNode;
  disabled?: boolean;
  type?: "button" | "submit";
}) {
  return (
    <button type={type} disabled={disabled} className={`${s.btn} ${s[`btn_${kind}`]}`}>
      <span>{children}</span>
      {kind !== "ghost" && <Arrow />}
    </button>
  );
}

function Logo() {
  return (
    <a href="/" className={s.logo}>
      <span aria-hidden className={s.logoMark} />
      Digital Haptics
    </a>
  );
}

function Header({ c }: P) {
  const [open, setOpen] = useState(false);
  return (
    <header className={s.header}>
      <div className={s.wrap}>
        <div className={s.headerRow}>
          <Logo />
          <nav aria-label="Main" className={s.nav}>
            {c.nav.map((n) => (
              <a key={n.href} href={n.href}>
                {n.label}
              </a>
            ))}
          </nav>
          <div className={s.headerCta}>
            <Btn>{c.cta.label}</Btn>
          </div>
          <button
            type="button"
            className={s.menuBtn}
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            <span aria-hidden>{open ? "×" : "≡"}</span>
          </button>
        </div>
      </div>
      {open && <MenuPanel c={c} />}
    </header>
  );
}

function MenuPanel({ c }: { c: RehashContent }) {
  return (
    <nav aria-label="Mobile" className={s.menu}>
      {c.nav.map((n) => (
        <a key={n.href} href={n.href}>
          {n.label}
        </a>
      ))}
      <Btn>{c.cta.label}</Btn>
    </nav>
  );
}

function StickyCta({ c }: { c: RehashContent }) {
  // On Home, the bar waits until the hero's own button has scrolled away.
  const [heroVisible, setHeroVisible] = useState(false);
  useEffect(() => {
    const hero = document.querySelector("[aria-labelledby=hero-title] button");
    if (!hero) return;
    const io = new IntersectionObserver(([e]) => setHeroVisible(e.isIntersecting));
    io.observe(hero);
    return () => io.disconnect();
  }, []);

  return (
    <div className={s.sticky} data-away={heroVisible || undefined}>
      <a href={c.cta.href}>
        {c.cta.label}
        <Arrow />
      </a>
    </div>
  );
}

function Footer({ c, d }: P) {
  const f = c.footer;
  return (
    <footer className={s.footer}>
      {d !== "a" && <Still kind={d === "b" ? "filament" : "saddle"} className={s.footerStill} />}
      <div className={`${s.wrap} ${s.footerInner}`}>
        <div className={s.footerBrand}>
          <Logo />
          <Btn>{c.cta.label}</Btn>
        </div>
        <FootCol title="Site" items={f.site.map((x) => x.label)} />
        <FootCol title="Services" items={f.services.map((x) => x.label)} />
        <FootCol title={`Serving ${f.areaLabel}`} items={f.areas.map((x) => x.label)} />
        <div>
          <h2 className={s.footTitle}>Contact</h2>
          <ul className={s.footList}>
            {f.contact.phone && (
              <li>
                <a href={f.contact.phone.href}>{f.contact.phone.display}</a>
              </li>
            )}
            {f.contact.email && (
              <li>
                <a href={f.contact.email.href}>{f.contact.email.display}</a>
              </li>
            )}
          </ul>
        </div>
      </div>
      <div className={`${s.wrap} ${s.footerBase}`}>
        <span>{f.copyright}</span>
        <span className={s.footLegal}>
          {f.legal.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </span>
      </div>
    </footer>
  );
}

function FootCol({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <div>
      <h2 className={s.footTitle}>{title}</h2>
      <ul className={s.footList}>
        {items.map((x) => (
          <li key={x}>
            <a href="#">{x}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Section({
  title,
  lede,
  children,
  tone,
}: {
  title: string;
  lede?: string;
  children?: ReactNode;
  tone?: "alt";
}) {
  return (
    <section className={`${s.section} ${tone === "alt" ? s.sectionAlt : ""}`}>
      <div className={s.wrap}>
        <div className={s.sectionHead}>
          <h2>{title}</h2>
          {lede && <p>{lede}</p>}
        </div>
        {children}
      </div>
    </section>
  );
}

function CtaBand({ c, d, heading, body }: P & { heading: string; body: string }) {
  return (
    <section className={s.cta} {...(d === "a" ? { "data-aperture": true } : {})}>
      {d !== "a" && <Still kind={d === "b" ? "sphere" : "saddle"} />}
      <div className={s.wrap}>
        <div className={s.ctaPlate}>
          <h2>{heading}</h2>
          <p>{body}</p>
          <Btn>{c.cta.label}</Btn>
        </div>
      </div>
    </section>
  );
}

function PageHead({
  d,
  title,
  lead,
  children,
}: {
  d: DirectionId;
  title: string;
  lead: string;
  children?: ReactNode;
}) {
  return (
    <section className={s.pageHead}>
      {d === "c" && <Still kind="saddle" className={s.pageHeadStill} />}
      <div className={s.wrap}>
        <h1>{title}</h1>
        <p>{lead}</p>
        {children}
      </div>
    </section>
  );
}

function Steps({ steps }: { steps: { name: string; body: string }[] }) {
  return (
    <ol className={s.steps}>
      {steps.map((x, i) => (
        <li key={x.name}>
          <span aria-hidden className={s.stepNo}>
            {i + 1}
          </span>
          <h3>{x.name}</h3>
          <p>{x.body}</p>
        </li>
      ))}
    </ol>
  );
}

/* ── Home ──────────────────────────────────────────────────────────── */

function Hero({ c, d }: P) {
  return (
    <section
      className={`${s.hero} ${s[`hero_${d}`]}`}
      aria-labelledby="hero-title"
      {...(d === "a" ? { "data-aperture": true } : {})}
    >
      {d === "b" && (
        <div className={s.heroWindow} aria-hidden>
          <WindowLiquid />
        </div>
      )}
      {d === "c" && <Still kind="saddle" className={s.heroPoster} />}
      <div className={s.wrap}>
        <div className={s.heroCopy}>
          <p className={s.heroLabel}>{c.hero.label}</p>
          <h1 id="hero-title">
            <span>{c.hero.line1}</span> <span>{c.hero.line2}</span>
          </h1>
          <p className={s.heroSub}>{c.hero.subline}</p>
          <div className={s.heroActions}>
            <Btn>{c.cta.label}</Btn>
          </div>
        </div>
      </div>
      {d === "b" && (
        <div className={s.heroActs}>
          <div className={s.wrap}>
            <ul>
              {c.acts.map((a) => (
                <li key={a.code}>
                  <strong>
                    {a.code} — {a.name}
                  </strong>
                  <span>{a.blurb}</span>
                </li>
              ))}
            </ul>
            <p>{c.flow}</p>
          </div>
        </div>
      )}
    </section>
  );
}

function Services({ c }: { c: RehashContent }) {
  return (
    <ul className={s.services}>
      {c.services.map((x) => (
        <li key={x.slug} className={s.service}>
          <h3>{x.name}</h3>
          <p className={s.servicePrice}>{x.price}</p>
          <p>{x.short}</p>
          <a href={`/services/${x.slug}/`} className={s.textLink}>
            What&rsquo;s included
            <Arrow />
          </a>
        </li>
      ))}
    </ul>
  );
}

function Home({ c, d }: P) {
  return (
    <>
      <Hero c={c} d={d} />
      <Section title="What we do" lede={c.combineNote}>
        <Services c={c} />
      </Section>
      <Section title="How a project runs" tone="alt">
        <Steps steps={c.process} />
      </Section>
      <Section title="Based in Acadiana, working statewide" lede={c.areaLede}>
        <ul className={s.chips}>
          {c.cities.map((x) => (
            <li key={x} className={s.chip}>
              {x}
            </li>
          ))}
        </ul>
      </Section>
      <CtaBand
        c={c}
        d={d}
        heading="Tell us about the job."
        body={`One short form. We'll reach out within ${c.responseTime}.`}
      />
    </>
  );
}

/* ── Pricing ───────────────────────────────────────────────────────── */

function Pricing({ c, d }: P) {
  return (
    <>
      <PageHead d={d} title="Pricing" lead={c.statement} />
      <section className={s.sectionTight}>
        <div className={s.wrap}>
          <Services c={c} />
        </div>
      </section>
      <Section title="What affects your quote" lede={c.statement} tone="alt">
        <ul className={s.factors}>
          {c.factors.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
      </Section>
      <CtaBand
        c={c}
        d={d}
        heading="Get a real number."
        body="Tell us what you need. We'll quote it after a short call."
      />
    </>
  );
}

/* ── Start ─────────────────────────────────────────────────────────── */

function Field({
  id,
  label,
  optional,
  state,
  error,
  value,
  placeholder,
}: {
  id: string;
  label: string;
  optional?: boolean;
  state?: "focus" | "error" | "disabled";
  error?: string;
  value?: string;
  placeholder?: string;
}) {
  return (
    <div className={s.field} data-state={state}>
      <label htmlFor={id}>
        {label}
        {optional && <span> (optional)</span>}
      </label>
      <input
        id={id}
        defaultValue={value}
        placeholder={placeholder}
        disabled={state === "disabled"}
        aria-invalid={state === "error" || undefined}
        aria-describedby={error ? `${id}-e` : undefined}
      />
      {error && (
        <p id={`${id}-e`} className={s.fieldError}>
          Error: {error}
        </p>
      )}
    </div>
  );
}

function SelectField({
  id,
  label,
  options,
  optional,
}: {
  id: string;
  label: string;
  options: { value: string; label: string }[];
  optional?: boolean;
}) {
  return (
    <div className={s.field}>
      <label htmlFor={id}>
        {label}
        {optional && <span> (optional)</span>}
      </label>
      <select id={id} defaultValue="">
        <option value="" disabled>
          Choose one
        </option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function FieldStates() {
  return (
    <div className={s.states} aria-label="Field states">
      <Field id="st-default" label="Your name" />
      <Field id="st-focus" label="Business name" state="focus" value="Focus state" />
      <Field
        id="st-error"
        label="Phone"
        state="error"
        value="337"
        error="Enter a 10-digit US phone number."
      />
      <Field id="st-disabled" label="Email" state="disabled" value="Disabled state" />
    </div>
  );
}

function Start({ c, d }: P) {
  const o = c.options;
  return (
    <>
      <PageHead
        d={d}
        title="Tell us about the job"
        lead={`One short form. We read every one and reach out within ${c.responseTime}.`}
      >
        <Steps steps={c.startSteps} />
      </PageHead>
      <section className={s.sectionTight}>
        <div className={`${s.wrap} ${s.startGrid}`}>
          <form className={s.form} onSubmit={(e) => e.preventDefault()} aria-labelledby="intake">
            <h2 id="intake">Project details</h2>
            <p className={s.formNote}>All fields required unless marked</p>
            <div className={s.formGrid}>
              <Field id="f-name" label="Your name" />
              <Field id="f-business" label="Business name" />
              <SelectField id="f-trade" label="Trade" options={o.trades} />
              <Field id="f-phone" label="Phone" />
              <Field id="f-email" label="Email" />
              <Field id="f-web" label="Current website" optional placeholder="https://" />
            </div>
            <fieldset className={s.checks}>
              <legend>Services interested in</legend>
              {o.services.map((x) => (
                <label key={x.value}>
                  <input type="checkbox" />
                  {x.label}
                </label>
              ))}
            </fieldset>
            <div className={s.formGrid}>
              <SelectField id="f-time" label="Timeline" options={o.timelines} />
              <SelectField id="f-budget" label="Budget range" options={o.budgets} optional />
            </div>
            <div className={s.field}>
              <label htmlFor="f-msg">Message</label>
              <textarea
                id="f-msg"
                rows={4}
                placeholder="What do you need, and what isn't working now?"
              />
            </div>
            <Btn type="submit">Send it</Btn>
            <h3 className={s.statesTitle}>Form states, for review</h3>
            <FieldStates />
            <Btn disabled>Sending…</Btn>
          </form>
          <aside className={s.aside}>
            <h2>Book a call</h2>
            <p>Pick a time that suits you. Same conversation, no form.</p>
            <ul>
              {c.contact.phone && (
                <li>
                  <span>Phone</span>
                  <a href={c.contact.phone.href}>{c.contact.phone.display}</a>
                </li>
              )}
              {c.contact.email && (
                <li>
                  <span>Email</span>
                  <a href={c.contact.email.href}>{c.contact.email.display}</a>
                </li>
              )}
            </ul>
          </aside>
        </div>
      </section>
      <Section title="Questions" tone="alt">
        <div className={s.faq}>
          {c.faq.map((f) => (
            <details key={f.q}>
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </Section>
    </>
  );
}

/* ── Case study ────────────────────────────────────────────────────── */

function CaseCard({ c }: { c: RehashContent }) {
  const k = c.caseStudy;
  return (
    <a href="#" className={s.caseCard}>
      <span className={s.caseTop}>
        <span>Case 1</span>
        <span>Draft</span>
      </span>
      <Still kind="filament" className={s.caseShot} />
      <dl>
        <div>
          <dt>Client</dt>
          <dd>{k.client}</dd>
        </div>
        <div>
          <dt>Trade</dt>
          <dd>{k.trade}</dd>
        </div>
        <div>
          <dt>Result</dt>
          <dd>{k.results[0]?.value}</dd>
        </div>
      </dl>
      <span className={s.caseFoot}>
        Read case study
        <Arrow />
      </span>
    </a>
  );
}

function CaseStudy({ c, d }: P) {
  const k = c.caseStudy;
  return (
    <>
      <PageHead d={d} title={k.client} lead={k.summary}>
        <p className={s.draftNote}>Draft: not published. Shown on preview builds only.</p>
        <dl className={s.caseMeta}>
          <div>
            <dt>Trade</dt>
            <dd>{k.trade}</dd>
          </div>
          <div>
            <dt>Location</dt>
            <dd>{k.location}</dd>
          </div>
          <div>
            <dt>Systems</dt>
            <dd>{k.systems.join(", ")}</dd>
          </div>
        </dl>
      </PageHead>
      <section className={s.section}>
        <div className={s.wrap}>
          <article className={s.prose}>
            {k.sections.map((x) => (
              <div key={x.title}>
                <h2>{x.title}</h2>
                <p>{x.body}</p>
              </div>
            ))}
          </article>
        </div>
      </section>
      <Section title="What changed" tone="alt">
        <dl className={s.results}>
          {k.results.map((r) => (
            <div key={r.label}>
              <dt>{r.label}</dt>
              <dd>{r.value}</dd>
            </div>
          ))}
        </dl>
      </Section>
      <CtaBand
        c={c}
        d={d}
        heading="Have a job like this?"
        body="Tell us about your business and what it needs."
      />
    </>
  );
}

/* ── Component sheet ───────────────────────────────────────────────── */

const SWATCHES: Record<DirectionId, [string, string][]> = {
  a: [
    ["Room", "#12161a"],
    ["Surface", "#1a2025"],
    ["Raised", "#232c30"],
    ["Text", "#eef1ee"],
    ["Muted", "#a9b5b2"],
    ["Amber", "#f5a254"],
    ["Error", "#ff9d8a"],
  ],
  b: [
    ["Ground", "#e8eef1"],
    ["Card", "#ffffff"],
    ["Steel", "#d3dde3"],
    ["Ink", "#0d1114"],
    ["Muted", "#46525b"],
    ["Molten", "#f56c36"],
    ["Error", "#a8201a"],
  ],
  c: [
    ["Paper", "#d9dcd6"],
    ["Light", "#e9ebe5"],
    ["Ink", "#161a1c"],
    ["Muted", "#454c4c"],
    ["Amber", "#f5a254"],
    ["Teal", "#133236"],
    ["Error", "#8f1a14"],
  ],
};

function Components({ c, d }: P) {
  return (
    <>
      <PageHead d={d} title="Components" lead="Every shared part in this direction." />
      <Section title="Colour">
        <ul className={s.swatches}>
          {SWATCHES[d].map(([name, hex]) => (
            <li key={name}>
              <span style={{ background: hex }} />
              {name} {hex}
            </li>
          ))}
        </ul>
      </Section>
      <Section title="Type" tone="alt">
        <div className={s.typeSheet}>
          <p className={s.tDisplay}>Websites that book the job.</p>
          <p className={s.tHeading}>How a project runs</p>
          <p className={s.tSub}>Tell us about the job</p>
          <p>{c.hero.subline}</p>
          <p className={s.tLabel}>{c.areaLabel}</p>
        </div>
      </Section>
      <Section title="Buttons and chips">
        <div className={s.row}>
          <Btn>{c.cta.label}</Btn>
          <Btn kind="accent">{c.cta.label}</Btn>
          <Btn kind="ghost">See the Work</Btn>
          <Btn disabled>Sending…</Btn>
        </div>
        <ul className={s.chips}>
          {c.cities.slice(0, 3).map((x) => (
            <li key={x} className={s.chip}>
              {x}
            </li>
          ))}
        </ul>
      </Section>
      <Section title="Inputs" tone="alt">
        <FieldStates />
      </Section>
      <Section title="Case card">
        <div className={s.cardDemo}>
          <CaseCard c={c} />
        </div>
      </Section>
      <Section title="Mobile menu" tone="alt">
        <div className={s.menuDemo}>
          <MenuPanel c={c} />
        </div>
      </Section>
    </>
  );
}

/* ── Liquid use ────────────────────────────────────────────────────── */

const LIQUID_NOTES: Record<DirectionId, { live: string; still: string; text: string }> = {
  a: {
    live: "One fixed canvas behind the whole page, visible through the hero and the final call to action. It stops whenever both are off screen.",
    still: "None. Every other section is a solid surface that covers the canvas.",
    text: "Text sits on a solid room colour. The liquid only shows beyond the edge of the copy.",
  },
  b: {
    live: "One framed window in the Home hero. No other page runs WebGL.",
    still: "CSS stills in the call-to-action band, the footer and case cards.",
    text: "Text never overlaps the live window. Over stills it sits on a solid plate.",
  },
  c: {
    live: "None. The site ships no WebGL.",
    still: "CSS poster plates with grain in the hero, page headers, call to action and footer.",
    text: "Text sits on paper or a solid plate, never directly on the poster.",
  },
};

function LiquidUse({ d }: { d: DirectionId }) {
  const n = LIQUID_NOTES[d];
  return (
    <>
      <PageHead d={d} title="How the liquid is used" lead={n.text} />
      <section className={s.section}>
        <div className={`${s.wrap} ${s.liquidGrid}`}>
          <div>
            <h2>Live</h2>
            <p>{n.live}</p>
            <div className={s.liquidSample}>
              {d === "c" ? <Still kind="saddle" /> : <WindowLiquid />}
            </div>
          </div>
          <div>
            <h2>Still</h2>
            <p>{n.still}</p>
            <div className={s.liquidSample}>
              <Still kind={d === "c" ? "sphere" : "filament"} />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
