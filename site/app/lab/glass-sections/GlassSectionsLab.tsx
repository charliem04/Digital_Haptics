"use client";

import { useState, type ReactNode } from "react";
import { LiquidBackdrop } from "@/components/home/liquid/LiquidBackdrop";
import { RefractGlass } from "../glass/RefractGlass";

/**
 * Page sections as frosted glass over the full-screen liquid, using the
 * settings Charles picked in /lab/liquid-glass (bend 0.1, colour split 0.3,
 * rim 15, curvature 0.6, frost 6.5, no amber).
 *
 * The bending happens behind each pane, which only Chrome and Edge can do.
 * Safari and Firefox get the same frost and tint without the bend.
 * The tint keeps text readable over the brightest liquid.
 */
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

type Settings = { bend: number; chroma: number; rim: number; frost: number; tint: number };

function Pane({ s, solid, children }: { s: Settings; solid: boolean; children: ReactNode }) {
  const inner = <div className="relative flex flex-col gap-8 p-8 lg:p-12">{children}</div>;
  if (solid) return <div className="rounded-[36px] bg-room">{inner}</div>;
  return (
    <RefractGlass
      radius={36}
      bevel={s.rim}
      strength={s.bend * 400}
      chroma={s.chroma}
      frost={s.frost}
      className="relative overflow-hidden border border-[rgb(255_255_255/0.16)] border-t-[rgb(255_255_255/0.4)] shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_16px_40px_-16px_rgba(0,0,0,0.5)]"
    >
      <div
        aria-hidden
        className="absolute inset-0"
        style={{ backgroundColor: `rgb(18 22 26 / ${s.tint})` }}
      />
      {inner}
    </RefractGlass>
  );
}

function Head({ label, title }: { label: string; title: string }) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-room-small text-muted">{label}</p>
      <h2 className="text-room-section font-medium">{title}</h2>
    </div>
  );
}

function Cards({ items, columns }: { items: string[][]; columns: string }) {
  return (
    <ul className={`grid gap-5 ${columns}`}>
      {items.map(([name, body]) => (
        <li key={name} className="rounded-panel bg-[rgb(35_44_48/0.7)] p-6">
          <h3 className="text-room-card font-medium">{name}</h3>
          <p className="mt-2 text-room-body text-muted">{body}</p>
        </li>
      ))}
    </ul>
  );
}

const SLIDERS: { key: keyof Settings; label: string; min: number; max: number; step: number }[] = [
  { key: "bend", label: "Bend", min: 0, max: 0.25, step: 0.005 },
  { key: "chroma", label: "Colour split", min: 0, max: 1, step: 0.05 },
  { key: "rim", label: "Rim width", min: 4, max: 80, step: 1 },
  { key: "frost", label: "Frost", min: 0, max: 20, step: 0.5 },
  { key: "tint", label: "Dark tint (readability)", min: 0, max: 0.9, step: 0.05 },
];

export function GlassSectionsLab() {
  const [s, setS] = useState<Settings>({ bend: 0.1, chroma: 0.3, rim: 15, frost: 6.5, tint: 0.55 });
  const [solid, setSolid] = useState(false);

  return (
    <div className="relative">
      <LiquidBackdrop />

      <div className="sticky top-2 z-40 mx-auto my-2 flex w-[min(1312px,calc(100%-24px))] flex-wrap items-end gap-x-6 gap-y-3 rounded-[20px] border border-line bg-surface px-5 py-3">
        {SLIDERS.map((x) => (
          <label key={x.key} className="flex min-w-[150px] flex-1 flex-col gap-1 text-room-caption">
            <span className="flex justify-between">
              {x.label}
              <span className="text-muted">{s[x.key]}</span>
            </span>
            <input
              type="range"
              min={x.min}
              max={x.max}
              step={x.step}
              value={s[x.key]}
              onChange={(e) => setS((v) => ({ ...v, [x.key]: Number(e.target.value) }))}
              className="accent-amber"
            />
          </label>
        ))}
        <label className="flex min-h-touch items-center gap-2 text-room-small">
          <input
            type="checkbox"
            checked={solid}
            onChange={(e) => setSolid(e.target.checked)}
            className="size-5 accent-amber"
          />
          Compare with solid
        </label>
      </div>

      <div data-liquid-opening className="page-x relative z-10 flex flex-col gap-16 py-16">
        <Pane s={s} solid={solid}>
          <p className="text-room-small text-muted">Lab: glass sections</p>
          <h1 className="max-w-[12em] text-room-title font-medium">
            The whole page as glass over the liquid
          </h1>
          <p className="max-w-[640px] text-room-lede text-muted">
            Each section is a frosted pane. Scroll to watch the liquid move behind them, and use the
            dark tint slider to find where the text stays easy to read.
          </p>
        </Pane>

        <Pane s={s} solid={solid}>
          <Head label="Services" title="What we do" />
          <Cards items={SERVICES} columns="md:grid-cols-3" />
        </Pane>

        <div className="h-[30vh]" />

        <Pane s={s} solid={solid}>
          <Head label="Work" title="Recent work" />
          <Cards items={WORK} columns="md:grid-cols-3" />
        </Pane>

        <Pane s={s} solid={solid}>
          <Head label="Process" title="How a project runs" />
          <Cards items={STEPS} columns="sm:grid-cols-2 lg:grid-cols-4" />
        </Pane>

        <div className="h-[30vh]" />
      </div>
    </div>
  );
}
