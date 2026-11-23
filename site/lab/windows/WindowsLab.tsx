"use client";

import { useState, type ReactNode } from "react";
import { LiquidBackdrop } from "@/components/home/liquid/LiquidBackdrop";
import s from "./windows.module.css";

type Style = "band" | "side" | "tile" | "edge";
type Amount = "one" | "every";

const STYLES: { id: Style; name: string; note: string }[] = [
  { id: "band", name: "A. Wide band", note: "Full-width breaks between sections. The boldest." },
  { id: "side", name: "B. Side windows", note: "A tall rounded window beside the text." },
  { id: "tile", name: "C. Card windows", note: "One card in each grid is an opening." },
  { id: "edge", name: "D. Molten edge", note: "A band whose edges move like liquid." },
];

const AMOUNTS: { id: Amount; name: string }[] = [
  { id: "one", name: "One window" },
  { id: "every", name: "Every section" },
];

const SERVICES = [
  ["Web Design", "Sites that look like the work you do: solid, square, built right."],
  ["Local SEO", "Found first when someone nearby searches for your trade."],
  ["Google Business Profile", "Your listing on Google and Maps, set up right and kept current."],
];
const WORK = [
  ["Coastal Construction Services", "Dirt work · Fully hands-off"],
  ["Darren Aucoin's Plumbing", "Plumbing · 30+ leads since launch"],
  ["CTL Pro Construction", "Roofing · Demo"],
];
const STEPS = [
  ["Call", "A short call about your business and what the site needs to do."],
  ["Build", "We design and write the site, and set up local search."],
  ["Launch", "We put it live and test every call button and form."],
  ["Grow", "We keep it fast and keep working on how you show up."],
];

function Band({
  style,
  above = "room",
  below = "room",
}: {
  style: Style;
  /** The solid colour of the section on each side, so the edges match. */
  above?: "room" | "surface";
  below?: "room" | "surface";
}) {
  if (style === "edge") {
    return (
      <div className={`${s.band} ${s.edgeBand}`} data-liquid-opening aria-hidden>
        <svg
          className={s.waveTop}
          style={{ fill: `rgb(var(--${above}))` }}
          viewBox="0 0 1200 60"
          preserveAspectRatio="none"
        >
          <path d="M0 0H1200V24C1100 54 1000 54 900 24S700 -6 600 24 400 54 300 24 100 -6 0 24Z" />
        </svg>
        <svg
          className={s.waveBottom}
          style={{ fill: `rgb(var(--${below}))` }}
          viewBox="0 0 1200 60"
          preserveAspectRatio="none"
        >
          <path d="M0 60H1200V36C1100 6 1000 6 900 36S700 66 600 36 400 6 300 36 100 66 0 36Z" />
        </svg>
      </div>
    );
  }
  return <div className={s.band} data-liquid-opening aria-hidden />;
}

function Head({ label, title, lede }: { label: string; title: string; lede?: string }) {
  return (
    <div className={s.head}>
      <p className={s.label}>{label}</p>
      <h2>{title}</h2>
      {lede && <p className={s.lede}>{lede}</p>}
    </div>
  );
}

function Cards({
  items,
  window: open,
  columns = 3,
}: {
  items: string[][];
  window: boolean;
  columns?: 3 | 4;
}) {
  // A window takes the place of one card, and every real card stays.
  const cells = open ? [...items.slice(0, 1), null, ...items.slice(1)] : items;
  return (
    <ul className={s.cards} data-columns={open ? 4 : columns}>
      {cells.map((item, i) =>
        item ? (
          <li key={item[0]} className={s.card}>
            <h3>{item[0]}</h3>
            <p>{item[1]}</p>
          </li>
        ) : (
          <li key={`window-${i}`} className={s.cutout} data-liquid-opening aria-hidden />
        )
      )}
    </ul>
  );
}

function Block({
  style,
  show,
  surface = false,
  flip = false,
  head,
  children,
}: {
  style: Style;
  show: boolean;
  surface?: boolean;
  flip?: boolean;
  head: ReactNode;
  children?: ReactNode;
}) {
  const side = style === "side" && show;
  return (
    <section className={`${s.section} ${surface ? s.surface : ""}`}>
      <div className={`${s.inner} ${side ? s.split : ""} ${side && flip ? s.flip : ""}`}>
        <div className={s.copy}>
          {head}
          {children}
        </div>
        {side && <div className={`${s.cutout} ${s.sideWindow}`} data-liquid-opening aria-hidden />}
      </div>
    </section>
  );
}

export function WindowsLab() {
  const [style, setStyle] = useState<Style>("band");
  const [amount, setAmount] = useState<Amount>("every");
  const [copied, setCopied] = useState(false);

  // With "one", only the middle position opens.
  const at = (position: number) => amount === "every" || position === 1;
  const bandStyle = style === "band" || style === "edge";
  const active = STYLES.find((x) => x.id === style);

  const copy = async () => {
    await navigator.clipboard.writeText(
      `Liquid windows: ${active?.name}, ${AMOUNTS.find((x) => x.id === amount)?.name}`
    );
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className={s.lab}>
      {/* Remounted per layout, since it reads the openings when it starts. */}
      <LiquidBackdrop key={`${style}-${amount}`} />

      <div className={s.bar}>
        <div className={s.group} role="group" aria-label="Window style">
          {STYLES.map((x) => (
            <button
              key={x.id}
              type="button"
              aria-pressed={style === x.id}
              onClick={() => setStyle(x.id)}
            >
              {x.name}
            </button>
          ))}
        </div>
        <div className={s.group} role="group" aria-label="How many windows">
          {AMOUNTS.map((x) => (
            <button
              key={x.id}
              type="button"
              aria-pressed={amount === x.id}
              onClick={() => setAmount(x.id)}
            >
              {x.name}
            </button>
          ))}
          <button type="button" className={s.primary} onClick={copy}>
            {copied ? "Copied" : "Copy my pick"}
          </button>
        </div>
        <p className={s.note}>{active?.note}</p>
      </div>

      <section className={`${s.section} ${s.intro}`}>
        <div className={s.inner}>
          <p className={s.label}>Lab: liquid windows</p>
          <h1>Scroll to see the liquid</h1>
          <p className={s.lede}>
            A sample of your home page. All text stays on solid surfaces, and only the openings show
            the live background.
          </p>
        </div>
      </section>

      {bandStyle && at(0) && <Band style={style} />}

      <Block
        style={style}
        show={at(0)}
        head={<Head label="Services" title="What we do" lede="Most clients combine them." />}
      >
        {style !== "side" && <Cards items={SERVICES} window={style === "tile" && at(0)} />}
        {style === "side" && (
          <ul className={s.list}>
            {SERVICES.map(([name, body]) => (
              <li key={name}>
                <strong>{name}</strong> {body}
              </li>
            ))}
          </ul>
        )}
      </Block>

      {bandStyle && at(1) && <Band style={style} below="surface" />}

      <Block
        style={style}
        show={at(1)}
        flip
        surface
        head={<Head label="Work" title="Recent work" lede="Real projects for local trades." />}
      >
        {style !== "side" && <Cards items={WORK} window={style === "tile" && at(1)} />}
        {style === "side" && (
          <ul className={s.list}>
            {WORK.map(([name, body]) => (
              <li key={name}>
                <strong>{name}</strong> {body}
              </li>
            ))}
          </ul>
        )}
      </Block>

      {bandStyle && at(2) && <Band style={style} above="surface" />}

      <Block style={style} show={at(2)} head={<Head label="Process" title="How a project runs" />}>
        {style !== "side" && (
          <Cards
            items={style === "tile" && at(2) ? STEPS.slice(0, 3) : STEPS}
            window={style === "tile" && at(2)}
            columns={4}
          />
        )}
        {style === "side" && (
          <ul className={s.list}>
            {STEPS.map(([name, body]) => (
              <li key={name}>
                <strong>{name}</strong> {body}
              </li>
            ))}
          </ul>
        )}
      </Block>
    </div>
  );
}
