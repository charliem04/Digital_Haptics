"use client";

import { useEffect, useState } from "react";

const MODES = ["glide", "veil", "ripple", "molten"] as const;
const KEY = "dh-page-transition";

/**
 * DEV ONLY (rendered under `npm run dev`, never in a build): a small
 * switcher in the corner to try the page transitions live. It sets the
 * same <html data-motion-page> that motion.config.ts sets, and remembers
 * the pick in this browser. To ship one, set `page` in motion.config.ts.
 */
export function TransitionPicker() {
  const [mode, setMode] = useState<string | null>(null);

  useEffect(() => {
    const saved = window.localStorage.getItem(KEY);
    if (saved) document.documentElement.dataset.motionPage = saved;
    setMode(document.documentElement.dataset.motionPage ?? null);
  }, []);

  const pick = (m: string) => {
    document.documentElement.dataset.motionPage = m;
    window.localStorage.setItem(KEY, m);
    setMode(m);
  };

  return (
    <div
      role="group"
      aria-label="Page transition (dev only)"
      className="fixed bottom-[76px] left-3 z-[60] flex items-center gap-1 rounded-control border border-line bg-surface/90 p-1 font-body text-[12px] shadow-lg backdrop-blur lg:bottom-4"
    >
      <span className="px-2 text-muted">Transition</span>
      {MODES.map((m) => (
        <button
          key={m}
          type="button"
          aria-pressed={mode === m}
          onClick={() => pick(m)}
          className={
            mode === m
              ? "rounded-control bg-amber px-2.5 py-1.5 font-medium text-on-amber"
              : "rounded-control px-2.5 py-1.5 text-text hover:bg-raised"
          }
        >
          {m}
        </button>
      ))}
    </div>
  );
}
