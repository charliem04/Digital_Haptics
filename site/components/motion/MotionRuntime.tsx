"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/** Long enough for the slowest text style, including its stagger. */
const TEXT_SETTLE_MS = 2200;
/** After its stagger delay: the card, then its text. */
const WIDGET_SETTLE_MS = 2400;
/** A section pane only fades, so it settles sooner. */
const PANE_SETTLE_MS = 1000;
/** Gap between widgets in a cascade, and the longest any one waits. */
const CASCADE_STEP_MS = 110;
const CASCADE_MAX_MS = 660;
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

    // Widgets: the card arrives, then its text plays (app/motion.css).
    // A card's own text: its headings, paragraphs and lists, but not
    // those inside a nested card, and not the items inside its lists.
    const ownText = (el: HTMLElement) =>
      el.dataset.widget === "pane"
        ? []
        : Array.from(el.querySelectorAll<HTMLElement>("h2, h3, p, dl, ul")).filter((t) => {
            const list = t.parentElement?.closest("dl, ul");
            return t.closest("[data-widget]") === el && !(list && el.contains(list));
          });
    const settleWidget = (el: HTMLElement) => {
      delete el.dataset.wState;
      el.style.removeProperty("--w-delay");
      ownText(el).forEach((t) => {
        delete t.dataset.wt;
        t.style.removeProperty("--w-text");
      });
      armedWidgets.delete(el);
    };
    const armedWidgets = new Set<HTMLElement>();
    // A cascade: widgets that arrive together go one after another, top to
    // bottom and left to right. Ones that arrive while a cascade is still
    // running join the end of it, so fast scrolling still reads as a flow.
    let nextSlot = 0;
    const offset = initial ? 0 : 180;
    const widgetObserver = new IntersectionObserver(
      (entries) => {
        const arriving = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (a, b) =>
              a.boundingClientRect.top - b.boundingClientRect.top ||
              a.boundingClientRect.left - b.boundingClientRect.left
          );
        const now = performance.now();
        for (const entry of arriving) {
          const el = entry.target as HTMLElement;
          widgetObserver.unobserve(el);
          const delay = Math.min(Math.max(nextSlot - now, 0), CASCADE_MAX_MS);
          nextSlot = now + delay + CASCADE_STEP_MS;
          const start = Math.round(delay) + offset;
          el.style.setProperty("--w-delay", `${start}ms`);
          el.dataset.wState = "in";
          ownText(el).forEach((t) => {
            t.style.setProperty("--w-text", `${start + 380}ms`);
            t.dataset.wt = "in";
          });
          const settleAfter = el.dataset.widget === "pane" ? PANE_SETTLE_MS : WIDGET_SETTLE_MS;
          const timer = window.setTimeout(
            () => {
              timers.delete(timer);
              settleWidget(el);
            },
            delay + offset + settleAfter
          );
          timers.add(timer);
        }
      },
      { rootMargin: "0px 0px -6% 0px" }
    );
    document.querySelectorAll<HTMLElement>("[data-widget]").forEach((el) => {
      if (initial && el.getBoundingClientRect().top < window.innerHeight) return;
      el.dataset.wState = "armed";
      armedWidgets.add(el);
      widgetObserver.observe(el);
    });

    // Case study showcase (.device-pair): if it starts below the screen,
    // hold it at its first frame (data-wait, CSS) and play it from the
    // start once it's in view.
    const pairObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          pairObserver.unobserve(el);
          // Rewind to the first frame, then let it run.
          el.querySelectorAll<HTMLElement>(".device-desk, .device-phone").forEach((part) =>
            part.getAnimations().forEach((a) => (a.currentTime = 0))
          );
          delete el.dataset.wait;
        }
      },
      { rootMargin: "0px 0px -12% 0px" }
    );
    const pairs = Array.from(document.querySelectorAll<HTMLElement>(".device-pair"));
    pairs.forEach((el) => {
      if (el.getBoundingClientRect().top < window.innerHeight * 0.88) return;
      el.dataset.wait = "";
      pairObserver.observe(el);
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
      widgetObserver.disconnect();
      liveObserver.disconnect();
      pairObserver.disconnect();
      pairs.forEach((el) => delete el.dataset.wait);
      timers.forEach((timer) => window.clearTimeout(timer));
      armed.forEach(settle);
      armedWidgets.forEach(settleWidget);
    };
  }, [pathname]);

  // Tells the glow and tilt hovers where the pointer is on the card.
  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (prefers-reduced-motion: no-preference)").matches) {
      return;
    }
    let frame = 0;
    const onMove = (event: PointerEvent) => {
      if (frame) return;
      const { clientX, clientY, target } = event;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const el = (target as Element | null)?.closest?.<HTMLElement>("[data-hover]");
        if (!el) return;
        const box = el.getBoundingClientRect();
        const x = (clientX - box.left) / box.width;
        const y = (clientY - box.top) / box.height;
        el.style.setProperty("--hx", `${(x * 100).toFixed(1)}%`);
        el.style.setProperty("--hy", `${(y * 100).toFixed(1)}%`);
        el.style.setProperty("--ry", `${((x - 0.5) * 7).toFixed(2)}deg`);
        el.style.setProperty("--rx", `${((0.5 - y) * 7).toFixed(2)}deg`);
      });
    };
    document.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      document.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(frame);
    };
  }, []);

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
