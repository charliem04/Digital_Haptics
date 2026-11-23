"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/** Long enough for the slowest text style, including its stagger. */
const TEXT_SETTLE_MS = 2200;
/** Lets the page transition start uncovering before text plays. */
const AFTER_NAV_DELAY = "180ms";

/**
 * Starts text entrances and runs looping decoration only while on screen.
 *
 * Text is visible in the HTML and is hidden only here, after JavaScript
 * has run. On first load anything already on screen is left alone, so the
 * headline paints immediately. Reduced motion skips all of this.
 */
export function MotionRuntime() {
  const pathname = usePathname();
  const lastPath = useRef(pathname);
  const navigated = useRef(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Compared by path, so React's dev-mode double effect isn't a navigation.
    if (lastPath.current !== pathname) navigated.current = true;
    lastPath.current = pathname;
    const initial = !navigated.current;
    const timers = new Set<number>();
    const armed = new Set<HTMLElement>();

    const settle = (el: HTMLElement) => {
      delete el.dataset.mtState;
      el.style.removeProperty("--mt-delay");
      armed.delete(el);
    };

    const textObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          textObserver.unobserve(el);
          el.dataset.mtState = "in";
          const timer = window.setTimeout(() => {
            timers.delete(timer);
            settle(el);
          }, TEXT_SETTLE_MS);
          timers.add(timer);
        }
      },
      { rootMargin: "0px 0px -8% 0px" }
    );

    document.querySelectorAll<HTMLElement>("[data-mt]").forEach((el) => {
      if (initial && el.getBoundingClientRect().top < window.innerHeight) return;
      numberLines(el);
      if (!initial) el.style.setProperty("--mt-delay", AFTER_NAV_DELAY);
      el.dataset.mtState = "armed";
      armed.add(el);
      textObserver.observe(el);
    });

    // Watch each section, since a 1px divider is a poor intersection target.
    const liveObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          entry.target
            .querySelectorAll<HTMLElement>(":scope > [data-motion-live]")
            .forEach((el) => (el.dataset.motionLive = entry.isIntersecting ? "on" : ""));
        }
      },
      { rootMargin: "64px 0px" }
    );
    document.querySelectorAll<HTMLElement>("[data-motion-live]").forEach((el) => {
      if (el.parentElement) liveObserver.observe(el.parentElement);
    });

    return () => {
      textObserver.disconnect();
      liveObserver.disconnect();
      timers.forEach((timer) => window.clearTimeout(timer));
      armed.forEach(settle);
    };
  }, [pathname]);

  return null;
}

/** For the line style: words on the same visual line share a delay. */
function numberLines(el: HTMLElement) {
  if (document.documentElement.dataset.motionText !== "line") return;
  let line = -1;
  let top = Number.NEGATIVE_INFINITY;
  el.querySelectorAll<HTMLElement>(".motion-word").forEach((word) => {
    if (word.offsetTop > top + 2) {
      top = word.offsetTop;
      line += 1;
    }
    word.style.setProperty("--i", String(line));
  });
}
