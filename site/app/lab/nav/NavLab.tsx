"use client";

import Link from "next/link";
import { useState, type CSSProperties, type ReactNode } from "react";
import type { NavLink } from "@/lib/nav";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";

type Nav = "current" | "capsule" | "islands" | "segmented";
type Frame = "bleed" | "window";

const NAVS: { id: Nav; name: string; note: string }[] = [
  {
    id: "current",
    name: "A. Current",
    note: "A solid full-width bar with underlined links. For reference.",
  },
  {
    id: "capsule",
    name: "B. Floating capsule",
    note: "The whole nav in one rounded glass bar floating over the liquid. The liquid runs up to the top of the page.",
  },
  {
    id: "islands",
    name: "C. Islands",
    note: "The logo and button sit free; only the links share a glass pill in the middle. The liquid runs to the top.",
  },
  {
    id: "segmented",
    name: "D. Soft bar",
    note: "Keeps the solid bar, but the links sit in a rounded track and light up as pills instead of underlines.",
  },
];

const FRAMES: { id: Frame; name: string; note: string }[] = [
  {
    id: "bleed",
    name: "1. Edge to edge",
    note: "The liquid fills the hero from edge to edge, as now.",
  },
  {
    id: "window",
    name: "2. Squircle window",
    note: "The liquid sits in a big squircle window with a margin around it, matching the cards and panes below.",
  },
];

const GLASS =
  "border border-text/[0.12] bg-room/55 shadow-[inset_0_1px_0_rgb(255_255_255/0.12),0_12px_32px_-12px_rgb(0_0_0/0.6)] backdrop-blur-xl backdrop-saturate-150";

function Links({ links, pill = false }: { links: NavLink[]; pill?: boolean }) {
  return (
    <ul className="flex items-center gap-1 font-body text-[1rem]">
      {links.map((l) => (
        <li key={l.href}>
          <Link
            href={l.href}
            className={
              pill
                ? "inline-flex min-h-[40px] items-center rounded-control px-4 no-underline text-text transition-colors duration-[160ms] hover:bg-text/10"
                : "relative inline-flex min-h-touch items-center px-4 no-underline text-text after:absolute after:inset-x-4 after:bottom-2 after:h-[2px] after:origin-left after:scale-x-0 after:bg-amber after:transition-transform after:duration-[160ms] hover:after:scale-x-100"
            }
          >
            {l.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

function Header({
  v,
  links,
  cta,
}: {
  v: Nav;
  links: NavLink[];
  cta: { href: string; label: string } | null;
}) {
  const button = (
    <>
      {cta && (
        <div className="hidden whitespace-nowrap lg:block">
          <Button href={cta.href} size="sm">
            {cta.label}
          </Button>
        </div>
      )}
      <span
        aria-hidden
        className="flex size-11 items-center justify-center rounded-control border border-text/[0.14] bg-surface/60 lg:hidden"
      >
        <span className="flex w-4 flex-col gap-1">
          <span className="h-0.5 rounded-control bg-text" />
          <span className="h-0.5 rounded-control bg-text" />
        </span>
      </span>
    </>
  );
  switch (v) {
    case "current":
      return (
        <header className="relative z-30 bg-room">
          <div className="page-x flex h-20 items-center justify-between gap-6">
            <Logo className="whitespace-nowrap" />
            <nav className="ml-auto hidden lg:block">
              <Links links={links} />
            </nav>
            {button}
          </div>
        </header>
      );
    case "capsule":
      return (
        <header className="absolute inset-x-0 top-0 z-30 pt-4">
          <div className="page-x">
            <div
              className={`flex items-center justify-between gap-6 rounded-control py-1.5 pl-5 pr-1.5 ${GLASS}`}
            >
              <Logo className="whitespace-nowrap" />
              <nav className="ml-auto hidden lg:block">
                <Links links={links} pill />
              </nav>
              {button}
            </div>
          </div>
        </header>
      );
    case "islands":
      return (
        <header className="absolute inset-x-0 top-0 z-30 pt-4">
          <div className="page-x flex items-center justify-between gap-6 lg:grid lg:grid-cols-[1fr_auto_1fr]">
            <Logo className="justify-self-start whitespace-nowrap" />
            <nav className={`hidden rounded-control p-1 lg:block ${GLASS}`}>
              <Links links={links} pill />
            </nav>
            <div className="flex justify-self-end">{button}</div>
          </div>
        </header>
      );
    case "segmented":
      return (
        <header className="relative z-30 bg-room">
          <div className="page-x flex h-20 items-center justify-between gap-6">
            <Logo className="whitespace-nowrap" />
            <nav className="ml-auto hidden rounded-control border border-text/[0.08] bg-surface p-1 lg:block">
              <Links links={links} pill />
            </nav>
            {button}
          </div>
        </header>
      );
  }
}

export function NavLab({
  links,
  cta,
  bleed,
  window: win,
}: {
  links: NavLink[];
  cta: { href: string; label: string } | null;
  bleed: ReactNode;
  window: ReactNode;
}) {
  const [nav, setNav] = useState<Nav>("current");
  const [frame, setFrame] = useState<Frame>("bleed");
  const floating = nav === "capsule" || nav === "islands";
  const n = NAVS.find((x) => x.id === nav)!;
  const f = FRAMES.find((x) => x.id === frame)!;

  return (
    <div className="relative">
      {/* The site's own header is hidden on this page so each option can
          stand in for it. */}
      <style dangerouslySetInnerHTML={{ __html: "body > header { display: none !important; }" }} />
      <div
        className="relative lg:[--win-top:var(--win-top-lg)]"
        style={
          {
            "--win-top": floating ? "20px" : "0px",
            "--win-top-lg": floating ? "32px" : "0px",
          } as CSSProperties
        }
      >
        <Header v={nav} links={links} cta={cta} />
        {frame === "window" ? win : bleed}
      </div>

      {/* Pinned on screen, so a change to the hero is always in view. */}
      <div className="fixed bottom-4 left-1/2 z-50 flex w-[min(760px,calc(100vw-32px))] -translate-x-1/2 flex-col gap-2 rounded-panel border border-text/[0.14] bg-room/95 p-4 shadow-[0_16px_40px_-12px_rgb(0_0_0/0.7)]">
        <div className="flex flex-wrap gap-2">
          {NAVS.map((x) => (
            <button
              key={x.id}
              type="button"
              data-nav={x.id}
              onClick={() => setNav(x.id)}
              className={`rounded-control border px-4 py-2 font-body text-room-small ${x.id === nav ? "border-amber text-amber" : "border-line text-text"}`}
            >
              {x.name}
            </button>
          ))}
        </div>
        <p className="font-body text-room-small text-muted">{n.note}</p>
        <div className="flex flex-wrap gap-2 border-t border-text/[0.1] pt-2">
          {FRAMES.map((x) => (
            <button
              key={x.id}
              type="button"
              data-frame={x.id}
              onClick={() => setFrame(x.id)}
              className={`rounded-control border px-4 py-2 font-body text-room-small ${x.id === frame ? "border-amber text-amber" : "border-line text-text"}`}
            >
              {x.name}
            </button>
          ))}
        </div>
        <p className="font-body text-room-small text-muted">{f.note}</p>
      </div>
    </div>
  );
}
