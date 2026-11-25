"use client";

import { useState, type ReactNode } from "react";
import { LiquidBackdrop } from "@/components/home/liquid/LiquidBackdrop";
import { GlassPane } from "@/components/ui/GlassPane";
import { Button } from "@/components/ui/Button";

/**
 * Hero options. Same copy as the live hero (PLAN §5, flag off). Every
 * variant keeps the headline as plain text that paints at once.
 */
type Variant = "glass" | "centered" | "window" | "open";

const VARIANTS: { id: Variant; name: string; note: string }[] = [
  {
    id: "glass",
    name: "A. Glass card",
    note: "Liquid fills the whole hero; the copy sits on a glass pane like the rest of the page.",
  },
  {
    id: "centered",
    name: "B. Centered",
    note: "A centered glass panel over full-bleed liquid. Bold and symmetrical.",
  },
  {
    id: "window",
    name: "C. Framed window",
    note: "Copy on solid on the left, the liquid in a big rounded window on the right.",
  },
  {
    id: "open",
    name: "D. Open with chips",
    note: "No panel: a soft shadow behind the copy, and small glass chips with real facts.",
  },
];

const LABEL = "Web design · Local SEO — Acadiana, LA";
const SUBLINE =
  "Design and local SEO for trades businesses. Built to load fast, rank locally and turn visitors into calls.";

/** Real facts only, from the case studies and pricing. */
const CHIPS = [
  { big: "30+", small: "new leads for a Scott plumber since May 2026" },
  { big: "From $1,000", small: "for a website, quoted after a short call" },
  { big: "Lafayette", small: "based here, working statewide" },
];

function Copy({ align = "left" }: { align?: "left" | "center" }) {
  return (
    <div
      className={`flex flex-col gap-[22px] ${align === "center" ? "items-center text-center" : ""}`}
    >
      <p className="text-room-small text-muted">{LABEL}</p>
      <h1 className="text-room-display">
        Websites that <br />
        book the job.
      </h1>
      <p className="max-w-[34em] text-room-lede">{SUBLINE}</p>
      <div className={`flex flex-wrap gap-3.5 ${align === "center" ? "justify-center" : ""}`}>
        <Button href="/start/">Start a Project</Button>
        <Button href="/work/" variant="ghost">
          See the Work
        </Button>
      </div>
    </div>
  );
}

function Chip({ big, small }: { big: string; small: string }) {
  return (
    <GlassPane className="w-[260px]" innerClassName="flex flex-col gap-1 px-5 py-4">
      <span className="font-body text-room-card font-medium text-amber">{big}</span>
      <span className="text-room-small text-text">{small}</span>
    </GlassPane>
  );
}

function Stage({ children, liquid = true }: { children: ReactNode; liquid?: boolean }) {
  return (
    <section
      data-liquid-opening
      className="relative flex min-h-[calc(100svh-80px)] items-center overflow-hidden"
    >
      {liquid && <LiquidBackdrop />}
      {children}
    </section>
  );
}

function Hero({ variant }: { variant: Variant }) {
  if (variant === "glass") {
    return (
      <Stage>
        <div className="page-x relative py-16">
          <GlassPane className="max-w-[760px]" innerClassName="p-8 lg:p-12">
            <Copy />
          </GlassPane>
        </div>
      </Stage>
    );
  }

  if (variant === "centered") {
    return (
      <Stage>
        <div className="page-x relative flex justify-center py-16">
          <GlassPane className="max-w-[920px]" innerClassName="px-8 py-12 lg:px-16 lg:py-16">
            <Copy align="center" />
          </GlassPane>
        </div>
      </Stage>
    );
  }

  if (variant === "window") {
    return (
      <Stage>
        <div className="page-x relative grid w-full items-center gap-10 py-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-16">
          <div className="relative z-[1]">
            <Copy />
          </div>
          <div className="relative min-h-[300px] self-stretch lg:min-h-[560px]">
            {/* The window: a clear rounded shape inside a solid frame. */}
            <div className="liquid-cutout !absolute inset-0 [--section-bg:var(--room)]" />
            <div className="absolute bottom-5 left-5 right-5 z-[1] flex flex-wrap gap-3 lg:bottom-8 lg:left-8">
              <Chip {...CHIPS[0]} />
            </div>
          </div>
        </div>
      </Stage>
    );
  }

  return (
    <Stage>
      {/* A soft dark shadow so the copy reads over the liquid. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_80%_at_20%_50%,rgb(var(--room)/0.94)_0%,rgb(var(--room)/0.85)_40%,transparent_75%)]"
      />
      <div className="page-x relative grid w-full items-center gap-10 py-16 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <Copy />
        <div className="flex flex-col items-start gap-4 lg:items-end">
          {CHIPS.map((c) => (
            <Chip key={c.big} {...c} />
          ))}
        </div>
      </div>
    </Stage>
  );
}

export function HeroLab() {
  const [variant, setVariant] = useState<Variant>("glass");
  const [copied, setCopied] = useState(false);
  const active = VARIANTS.find((v) => v.id === variant);

  return (
    <div className="relative">
      {/* Remounted per variant so the liquid re-reads its openings. */}
      <div key={variant}>
        <Hero variant={variant} />
      </div>

      <div className="fixed inset-x-0 bottom-3 z-50 mx-auto flex w-[min(1100px,calc(100%-24px))] flex-wrap items-center gap-2 rounded-[20px] border border-line bg-surface px-3 py-2">
        {VARIANTS.map((v) => (
          <button
            key={v.id}
            type="button"
            aria-pressed={variant === v.id}
            onClick={() => setVariant(v.id)}
            className="min-h-touch rounded-control border border-muted px-4 font-body text-room-small text-text hover:bg-raised aria-pressed:border-amber aria-pressed:bg-amber aria-pressed:text-on-amber"
          >
            {v.name}
          </button>
        ))}
        <button
          type="button"
          onClick={async () => {
            await navigator.clipboard.writeText(`Hero: ${active?.name}`);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1600);
          }}
          className="ml-auto min-h-touch rounded-control bg-amber px-4 font-body text-room-small font-medium text-on-amber hover:bg-amber-hover"
        >
          {copied ? "Copied" : "Copy my pick"}
        </button>
        <p className="basis-full px-2 pb-1 text-room-caption text-muted">{active?.note}</p>
      </div>
    </div>
  );
}
