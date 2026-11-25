"use client";

import { useEffect, useRef, type ReactNode } from "react";

/** Below this, the header is in its open, transparent "top" state. */
const TOP_PX = 24;
/** Scroll this far in one direction before the header changes. */
const TURN_PX = 8;

/**
 * The sticky header's scroll states (app/globals.css, "HEADER"):
 *
 *   top      at the top of the page: open and transparent
 *   compact  scrolling down: shrinks into a small glass capsule
 *   full     scrolling back up: grows back to full size, on glass
 *
 * The state is written straight onto the element, so scrolling never
 * re-renders React. Without JavaScript the header simply stays "top".
 */
export function HeaderShell({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let anchor = window.scrollY;
    let frame = 0;

    const update = () => {
      frame = 0;
      const y = window.scrollY;
      if (y <= TOP_PX) {
        el.dataset.navState = "top";
        anchor = y;
        return;
      }
      if (el.dataset.navState === "top") el.dataset.navState = "compact";
      const moved = y - anchor;
      if (moved > TURN_PX) {
        el.dataset.navState = "compact";
        anchor = y;
      } else if (moved < -TURN_PX) {
        el.dataset.navState = "full";
        anchor = y;
      }
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <header ref={ref} data-nav-state="top" className="site-header">
      {children}
    </header>
  );
}
