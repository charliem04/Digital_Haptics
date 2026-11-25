"use client";

import Image from "next/image";
import { useState } from "react";
import type { Photo } from "@/content/types";
import { LiquidBackdrop } from "@/components/home/liquid/LiquidBackdrop";
import { GlassPane } from "@/components/ui/GlassPane";
import { Arrow } from "@/components/ui/Arrow";

export type LabCase = {
  slug: string;
  client: string;
  meta: string;
  result: string;
  status: string;
  image?: Photo;
};

type Variant = "current" | "bare" | "bleed" | "overlay" | "frost" | "row";

const VARIANTS: { id: Variant; name: string; note: string }[] = [
  {
    id: "current",
    name: "A. Current",
    note: "Grey raised frame around an inset screenshot. For reference.",
  },
  {
    id: "bare",
    name: "B. No frame",
    note: "Just the rounded screenshot. The text sits on the page under it, with no box at all.",
  },
  {
    id: "bleed",
    name: "C. Hairline",
    note: "The screenshot runs edge to edge across the top; the card is a clear box with a thin outline.",
  },
  {
    id: "overlay",
    name: "D. Overlay",
    note: "The screenshot is the whole card; the name and result sit on a dark fade at the bottom.",
  },
  {
    id: "frost",
    name: "E. Frosted",
    note: "A see-through frosted frame instead of grey, so whatever is behind tints it.",
  },
  {
    id: "row",
    name: "F. Wide rows",
    note: "One case per row: screenshot on the left, details on the right. Reads like a list.",
  },
];

function Shot({
  c,
  className = "",
  rounded = "rounded-[20px]",
}: {
  c: LabCase;
  className?: string;
  rounded?: string;
}) {
  return (
    <div className={`relative aspect-[16/10] overflow-hidden bg-room ${rounded} ${className}`}>
      {c.image && (
        <Image
          src={c.image.src}
          alt=""
          width={c.image.width}
          height={c.image.height}
          className="absolute inset-0 size-full object-cover object-top transition-transform duration-500 ease-brand group-hover:scale-[1.03]"
        />
      )}
      <span className="absolute left-3 top-3 rounded-control bg-room/85 px-3 py-1 font-body text-room-caption text-text">
        {c.status}
      </span>
    </div>
  );
}

function Text({ c }: { c: LabCase }) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <p className="font-body text-room-step font-medium leading-snug">{c.client}</p>
      <p className="font-body text-room-small text-muted">{c.meta}</p>
      <p className="pt-1 font-body text-room-small font-medium text-amber">{c.result}</p>
    </div>
  );
}

function Round({ className = "" }: { className?: string }) {
  return (
    <span
      className={`mt-1 flex size-10 shrink-0 items-center justify-center rounded-control border border-line transition-colors duration-[160ms] group-hover:border-text ${className}`}
    >
      <Arrow className="size-3.5" />
    </span>
  );
}

function Card({ v, c }: { v: Variant; c: LabCase }) {
  const link = "group block h-full no-underline text-text";
  switch (v) {
    case "current":
      return (
        <a href="#" className={`${link} rounded-panel bg-raised p-2`}>
          <Shot c={c} />
          <div className="flex items-start justify-between gap-4 p-4">
            <Text c={c} />
            <Round />
          </div>
        </a>
      );
    case "bare":
      return (
        <a href="#" className={link}>
          <Shot c={c} rounded="rounded-panel" className="ring-1 ring-text/10" />
          <div className="flex items-start justify-between gap-4 px-1 pt-5">
            <Text c={c} />
            <Round />
          </div>
        </a>
      );
    case "bleed":
      return (
        <a
          href="#"
          className={`${link} overflow-hidden rounded-panel border border-text/[0.14] transition-colors duration-200 hover:border-text/40`}
        >
          <Shot c={c} rounded="rounded-none" />
          <div className="flex items-start justify-between gap-4 p-5">
            <Text c={c} />
            <Round />
          </div>
        </a>
      );
    case "overlay":
      return (
        <a href="#" className={`${link} relative overflow-hidden rounded-panel`}>
          <Shot c={c} rounded="rounded-none" className="!aspect-[4/3.6]" />
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 bg-gradient-to-t from-room from-50% via-room/85 to-transparent p-5 pt-20">
            <Text c={c} />
            <Round className="bg-room/60" />
          </div>
        </a>
      );
    case "frost":
      return (
        <a
          href="#"
          className={`${link} rounded-panel border border-text/10 bg-text/[0.04] p-2 backdrop-blur-md transition-colors duration-200 hover:bg-text/[0.07]`}
        >
          <Shot c={c} />
          <div className="flex items-start justify-between gap-4 p-4">
            <Text c={c} />
            <Round />
          </div>
        </a>
      );
    case "row":
      return (
        <a
          href="#"
          className={`${link} grid items-center gap-6 border-t border-text/[0.14] py-6 sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]`}
        >
          <Shot c={c} />
          <div className="flex items-start justify-between gap-4">
            <Text c={c} />
            <Round />
          </div>
        </a>
      );
  }
}

function Grid({ v, cases }: { v: Variant; cases: LabCase[] }) {
  return (
    <ul className={v === "row" ? "flex flex-col" : "grid gap-6 md:grid-cols-2 lg:grid-cols-3"}>
      {cases.map((c) => (
        <li key={c.slug}>
          <Card v={v} c={c} />
        </li>
      ))}
    </ul>
  );
}

export function CardsLab({ cases }: { cases: LabCase[] }) {
  const [v, setV] = useState<Variant>("current");
  const info = VARIANTS.find((x) => x.id === v)!;
  return (
    <div className="relative">
      <div className="fixed inset-0 -z-10">
        <LiquidBackdrop />
      </div>
      <div className="page-x flex flex-col gap-10 py-10">
        <div className="sticky top-4 z-10 flex flex-wrap gap-2 rounded-panel bg-room/90 p-3">
          {VARIANTS.map((x) => (
            <button
              key={x.id}
              type="button"
              data-variant={x.id}
              onClick={() => setV(x.id)}
              className={`rounded-control border px-4 py-2 font-body text-room-small ${x.id === v ? "border-amber text-amber" : "border-line text-text"}`}
            >
              {x.name}
            </button>
          ))}
          <p className="w-full px-1 pt-1 font-body text-room-small text-muted">{info.note}</p>
        </div>

        <section className="flex flex-col gap-4">
          <p className="font-body text-room-small text-muted">
            On the home page (glass over the liquid)
          </p>
          <GlassPane innerClassName="flex flex-col gap-8 p-6 lg:p-10">
            <h2 className="text-room-card">Recent work</h2>
            <Grid v={v} cases={cases} />
          </GlassPane>
        </section>

        <section className="flex flex-col gap-4 rounded-panel bg-room p-6 lg:p-10">
          <p className="font-body text-room-small text-muted">On /work (plain room)</p>
          <Grid v={v} cases={cases} />
        </section>
      </div>
    </div>
  );
}
