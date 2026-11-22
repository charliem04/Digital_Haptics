"use client";

import { useEffect, useState } from "react";
import {
  DIRECTIONS,
  VIEWS,
  isDirection,
  isView,
  type DirectionId,
  type ViewId,
} from "./directions";
import s from "./switcher.module.css";

const WIDTHS = [
  { id: "desktop", name: "Desktop 1440", px: 1440 },
  { id: "phone", name: "Phone 390", px: 390 },
] as const;

type WidthId = (typeof WIDTHS)[number]["id"];

/** Compare the same page across directions in one click. */
export function Switcher() {
  const [direction, setDirection] = useState<DirectionId>("a");
  const [view, setView] = useState<ViewId>("home");
  const [width, setWidth] = useState<WidthId>("desktop");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const d = q.get("d");
    const p = q.get("p");
    if (isDirection(d)) setDirection(d);
    if (isView(p)) setView(p);
    if (q.get("w") === "phone") setWidth("phone");
    setLoaded(true);
  }, []);

  // Wait for the URL to be read, or the defaults would overwrite it.
  useEffect(() => {
    if (!loaded) return;
    const url = `?d=${direction}&p=${view}&w=${width}`;
    window.history.replaceState(null, "", url);
  }, [loaded, direction, view, width]);

  const px = WIDTHS.find((w) => w.id === width)?.px ?? 1440;
  const current = DIRECTIONS.find((d) => d.id === direction);

  return (
    <div className={s.root}>
      <header className={s.bar}>
        <Group label="Direction">
          {DIRECTIONS.map((d) => (
            <Choice key={d.id} on={d.id === direction} onClick={() => setDirection(d.id)}>
              {d.name}
            </Choice>
          ))}
        </Group>
        <Group label="Page">
          {VIEWS.map((v) => (
            <Choice key={v.id} on={v.id === view} onClick={() => setView(v.id)}>
              {v.name}
            </Choice>
          ))}
        </Group>
        <Group label="Width">
          {WIDTHS.map((w) => (
            <Choice key={w.id} on={w.id === width} onClick={() => setWidth(w.id)}>
              {w.name}
            </Choice>
          ))}
        </Group>
        <p className={s.note}>{current?.note}</p>
      </header>
      <div className={s.stage}>
        <iframe
          key={`${direction}-${view}`}
          title={`${current?.name} preview`}
          src={`/lab/rehash/view/?d=${direction}&p=${view}`}
          className={s.frame}
          style={{ width: px }}
        />
      </div>
    </div>
  );
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div role="group" aria-label={label} className={s.group}>
      <span className={s.label}>{label}</span>
      {children}
    </div>
  );
}

function Choice({
  on,
  onClick,
  children,
}: {
  on: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button type="button" aria-pressed={on} onClick={onClick} className={s.choice}>
      {children}
    </button>
  );
}
