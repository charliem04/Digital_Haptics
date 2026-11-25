import type { Metadata } from "next";
import type { ReactNode } from "react";
import { LiquidBackdrop } from "@/components/home/liquid/LiquidBackdrop";
import { RefractGlass } from "./RefractGlass";

/**
 * /lab/glass: a quick, isolated mock-up of a frosted "Glass" card over the
 * live liquid. DEV ONLY (`.lab.tsx`), never built into the site.
 *
 * Self-contained on purpose: the component lives in this file so nothing
 * in the real site depends on it.
 */
export const metadata: Metadata = {
  title: "Lab: glass",
  robots: { index: false, follow: false },
};

type Tone = "frost" | "smoke" | "amber";
type Shape = "flat" | "bubble";

const TONES: Record<Tone, string> = {
  // The pasted snippet, translated to this site's Tailwind setup: the
  // default palette, radii and shadows are replaced here, so white, 2xl
  // and shadow-* become explicit values.
  frost:
    "border-[rgb(255_255_255/0.3)] bg-[rgb(255_255_255/0.15)] text-text supports-[not(backdrop-filter:blur(0))]:bg-[rgb(255_255_255/0.85)] supports-[not(backdrop-filter:blur(0))]:text-on-amber",
  // Dark smoke in the site's room colour, closer to the brand.
  smoke:
    "border-[rgb(255_255_255/0.14)] bg-[rgb(18_22_26/0.45)] text-text supports-[not(backdrop-filter:blur(0))]:bg-room",
  // A warm amber tint.
  amber:
    "border-[rgb(245_162_84/0.62)] !border-t-[rgb(249_184_120/0.8)] bg-[rgb(245_162_84/0.22)] text-text supports-[not(backdrop-filter:blur(0))]:bg-raised",
};

const SHAPES: Record<Shape, string> = {
  flat: "rounded-panel backdrop-blur-md backdrop-saturate-150 shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_8px_32px_rgba(0,0,0,0.12)]",
  // Glass: a clear pane rather than a bubble. Gently rounded, a thin
  // bright rim catching the light, a faint sheen across the top, and only
  // a light shadow. Hover lifts it slightly, with no bounce.
  bubble:
    "rounded-[36px] border-[rgb(255_255_255/0.22)] border-t-[rgb(255_255_255/0.45)] backdrop-blur-lg backdrop-saturate-[1.25] " +
    "shadow-[inset_0_1px_0_rgba(255,255,255,0.5),inset_0_0_0_1px_rgba(255,255,255,0.05),inset_0_-1px_0_rgba(0,0,0,0.15),0_12px_32px_-10px_rgba(0,0,0,0.4)] " +
    "transition-transform duration-300 ease-out hover:-translate-y-1 motion-reduce:transition-none motion-reduce:hover:transform-none",
};

function Glass({
  tone = "frost",
  shape = "flat",
  className = "",
  children,
}: {
  tone?: Tone;
  shape?: Shape;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={`relative isolate overflow-hidden border ${SHAPES[shape]} ${TONES[tone]} ${className}`}
    >
      {shape === "bubble" && (
        <>
          {/* A faint sheen across the top half, like light on a pane. */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(160deg,rgba(255,255,255,0.14)_0%,rgba(255,255,255,0.04)_38%,transparent_60%)]"
          />
          {/* One soft diagonal reflection. */}
          <span
            aria-hidden
            className="pointer-events-none absolute -left-[20%] top-0 -z-10 h-full w-[45%] -skew-x-[20deg] bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.07),transparent)]"
          />
        </>
      )}
      {children}
    </div>
  );
}

const CARDS: { tone: Tone; title: string; note: string }[] = [
  { tone: "frost", title: "Frost", note: "White frost, from your snippet." },
  { tone: "smoke", title: "Dark smoke", note: "Tinted with the site's room colour." },
  { tone: "amber", title: "Amber tint", note: "Warmed with the accent colour." },
];

function Row({ shape, title }: { shape: Shape; title: string }) {
  return (
    <div className="flex flex-col gap-5">
      <h2 className="w-fit rounded-control bg-room px-4 py-2 text-room-step font-medium">
        {title}
      </h2>
      <ul className="grid gap-8 md:grid-cols-3">
        {CARDS.map((c) => (
          <li key={c.tone}>
            <Glass tone={c.tone} shape={shape} className="flex min-h-[260px] flex-col gap-3 p-8">
              <h3 className="text-room-card font-medium">{c.title}</h3>
              <p className="text-room-body">{c.note}</p>
              <p className="mt-auto font-body text-room-small">From $1,000 per project</p>
            </Glass>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Lighter tints than the frosted rows, so the bending stays visible. */
const REFRACT_TINTS: Record<Tone, string> = {
  frost: "bg-[rgb(255_255_255/0.08)]",
  smoke: "bg-[rgb(18_22_26/0.32)]",
  amber: "bg-[rgb(245_162_84/0.1)]",
};

function RefractRow() {
  return (
    <div className="flex flex-col gap-5">
      <h2 className="w-fit rounded-control bg-room px-4 py-2 text-room-step font-medium">
        Refracting glass
      </h2>
      <ul className="grid gap-8 md:grid-cols-3">
        {CARDS.map((c) => (
          <li key={c.tone}>
            <RefractGlass
              className={`relative flex min-h-[260px] flex-col gap-3 overflow-hidden border border-[rgb(255_255_255/0.22)] border-t-[rgb(255_255_255/0.5)] p-8 text-text shadow-[inset_0_1px_0_rgba(255,255,255,0.5),inset_0_-1px_0_rgba(0,0,0,0.15),0_12px_32px_-10px_rgba(0,0,0,0.4)] transition-transform duration-300 ease-out hover:-translate-y-1 motion-reduce:transition-none motion-reduce:hover:transform-none ${REFRACT_TINTS[c.tone]}`}
            >
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-[linear-gradient(160deg,rgba(255,255,255,0.12)_0%,rgba(255,255,255,0.03)_38%,transparent_60%)]"
              />
              <h3 className="relative text-room-card font-medium">{c.title}</h3>
              <p className="relative text-room-body">{c.note}</p>
              <p className="relative mt-auto font-body text-room-small">From $1,000 per project</p>
            </RefractGlass>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function GlassLabPage() {
  return (
    <div className="relative">
      <LiquidBackdrop />
      <section data-liquid-opening className="page-x relative z-10 flex flex-col gap-14 py-16">
        <div className="max-w-[620px] rounded-panel bg-room p-6">
          <h1 className="text-room-title font-medium">Glass</h1>
          <p className="mt-3 text-room-lede text-muted">
            Glass over the live liquid. The top row bends and colour-splits what&rsquo;s behind it,
            in Chrome and Edge.
          </p>
        </div>
        <RefractRow />
        <Row shape="bubble" title="Glass" />
        <Row shape="flat" title="Flat, as pasted" />
        <div className="h-[40vh]" />
      </section>
    </div>
  );
}
