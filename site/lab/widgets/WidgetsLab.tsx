"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Panel } from "@/components/ui/Panel";
import type { HoverMotion, WidgetMotion } from "@/motion.config";

const ENTRANCES: { id: WidgetMotion; name: string; note: string }[] = [
  { id: "rise", name: "A. Rise", note: "Cards lift into place." },
  { id: "settle", name: "B. Settle", note: "Cards scale up and land softly." },
  { id: "wipe", name: "C. Wipe", note: "Cards unroll from the top down." },
  { id: "tilt", name: "D. Tilt up", note: "Cards swing upright in 3D." },
  { id: "none", name: "E. None", note: "Cards are simply there." },
];

const HOVERS: { id: HoverMotion; name: string; note: string }[] = [
  { id: "glow", name: "A. Heat glow", note: "A warm light follows the pointer." },
  { id: "lift", name: "B. Lift", note: "The card rises toward you." },
  { id: "tilt", name: "C. 3D tilt", note: "The card leans toward the pointer." },
  { id: "ring", name: "D. Amber ring", note: "An amber outline snaps on." },
  { id: "none", name: "E. None", note: "No hover effect." },
];

const CARDS = [
  ["Web Design", "Sites that look like the work you do: solid, square, built right."],
  ["Local SEO", "Found first when someone nearby searches for your trade."],
  ["Google Business Profile", "Your listing on Google and Maps, set up right and kept current."],
];

const BUTTON =
  "min-h-touch rounded-control border border-muted px-4 font-body text-room-small text-text hover:bg-raised aria-pressed:border-amber aria-pressed:bg-amber aria-pressed:text-on-amber";

export function WidgetsLab() {
  const [entrance, setEntrance] = useState<WidgetMotion>("rise");
  const [hover, setHover] = useState<HoverMotion>("glow");
  const [copied, setCopied] = useState(false);
  const grid = useRef<HTMLUListElement>(null);
  const timer = useRef(0);

  const replay = useCallback(() => {
    const cards = grid.current?.querySelectorAll<HTMLElement>("[data-widget]");
    if (!cards) return;
    window.clearTimeout(timer.current);
    cards.forEach((el, i) => {
      delete el.dataset.wState;
      el.style.setProperty("--w-delay", `${i * 90}ms`);
      // Reading layout between states restarts the animation.
      void el.offsetWidth;
      el.dataset.wState = "armed";
      void el.offsetWidth;
      el.dataset.wState = "in";
    });
    timer.current = window.setTimeout(() => {
      cards.forEach((el) => delete el.dataset.wState);
    }, 2400);
  }, []);

  // The real CSS reads these from <html>, so the demo is the real effect.
  useEffect(() => {
    const root = document.documentElement;
    const before = { widget: root.dataset.motionWidget, hover: root.dataset.motionHover };
    return () => {
      root.dataset.motionWidget = before.widget;
      root.dataset.motionHover = before.hover;
    };
  }, []);

  useEffect(() => {
    document.documentElement.dataset.motionWidget = entrance;
    replay();
  }, [entrance, replay]);

  useEffect(() => {
    document.documentElement.dataset.motionHover = hover;
  }, [hover]);

  const copy = async () => {
    const e = ENTRANCES.find((x) => x.id === entrance)?.name;
    const h = HOVERS.find((x) => x.id === hover)?.name;
    await navigator.clipboard.writeText(`Widget entrance: ${e}\nWidget hover: ${h}`);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="page-x flex flex-col gap-10 py-12">
      <header className="flex flex-col gap-3">
        <h1 className="text-room-title font-medium">Widget motion</h1>
        <p className="max-w-[640px] text-room-lede text-muted">
          Pick an entrance and a hover. The card arrives first, then its text plays. Hover the cards
          below to try each effect.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-2">
        <fieldset className="flex flex-col gap-3">
          <legend className="mb-3 text-room-card font-medium">Entrance</legend>
          <div className="flex flex-wrap gap-2">
            {ENTRANCES.map((x) => (
              <button
                key={x.id}
                type="button"
                aria-pressed={entrance === x.id}
                onClick={() => setEntrance(x.id)}
                className={BUTTON}
              >
                {x.name}
              </button>
            ))}
          </div>
          <p className="text-room-small text-muted">
            {ENTRANCES.find((x) => x.id === entrance)?.note}
          </p>
        </fieldset>
        <fieldset className="flex flex-col gap-3">
          <legend className="mb-3 text-room-card font-medium">Hover</legend>
          <div className="flex flex-wrap gap-2">
            {HOVERS.map((x) => (
              <button
                key={x.id}
                type="button"
                aria-pressed={hover === x.id}
                onClick={() => setHover(x.id)}
                className={BUTTON}
              >
                {x.name}
              </button>
            ))}
          </div>
          <p className="text-room-small text-muted">{HOVERS.find((x) => x.id === hover)?.note}</p>
        </fieldset>
      </div>

      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={replay} className={BUTTON}>
          Replay entrance
        </button>
        <button
          type="button"
          onClick={copy}
          className="min-h-touch rounded-control bg-amber px-5 font-body text-room-small font-medium text-on-amber hover:bg-amber-hover"
        >
          {copied ? "Copied" : "Copy my picks"}
        </button>
      </div>

      <ul ref={grid} className="grid gap-6 md:grid-cols-3">
        {CARDS.map(([name, body]) => (
          <li key={name}>
            <Panel
              fill="raised"
              widget
              hover
              className="h-full"
              innerClassName="flex min-h-[240px] flex-col gap-4 p-8"
            >
              <h2 className="text-room-card font-medium">{name}</h2>
              <p className="text-room-body text-muted">{body}</p>
            </Panel>
          </li>
        ))}
      </ul>
    </div>
  );
}
