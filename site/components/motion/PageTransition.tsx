"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type Phase = "idle" | "cover" | "hold" | "reveal";

/**
 * Cover and reveal times per overlay mode, matching app/motion.css.
 * "glide" uses these only as its fallback (a soft fade) in browsers
 * without View Transitions.
 */
const TIMING: Record<string, { cover: number; reveal: number }> = {
  fade: { cover: 240, reveal: 300 },
  sheet: { cover: 240, reveal: 300 },
  molten: { cover: 240, reveal: 300 },
  iris: { cover: 240, reveal: 300 },
  glide: { cover: 180, reveal: 320 },
  veil: { cover: 320, reveal: 380 },
  ripple: { cover: 380, reveal: 360 },
};
/** If a page is slow, uncover anyway rather than trap the visitor. */
const MAX_HOLD_MS = 4000;
/** Glide: how long the old page may stay frozen while the next one loads. */
const MAX_GLIDE_WAIT_MS = 1500;

const clean = (path: string) => path.replace(/\/+$/, "") || "/";
/** The mode in use: read live, so the dev switcher can change it. */
const currentMode = () => document.documentElement.dataset.motionPage ?? "molten";

/**
 * Plays the chosen transition between internal pages.
 *
 * Overlay modes (fade, sheet, molten, iris, veil, ripple): cover, swap
 * the page out of sight, uncover. Ripple grows from where you clicked.
 *
 * Glide: a View Transition. The header, sticky bar and the inner pages'
 * liquid keep their place while the old page eases out and the new one
 * rises in (app/motion.css). Browsers without View Transitions get a
 * soft fade through the overlay instead.
 *
 * The listener only calls preventDefault, which next/link honours. The
 * click still bubbles, so conversion tracking and menu handlers run.
 * New-tab clicks, downloads, in-page anchors, other sites and the
 * browser's back button behave normally. Reduced motion skips it.
 */
export function PageTransition() {
  const router = useRouter();
  const pathname = usePathname();
  const [phase, setPhaseState] = useState<Phase>("idle");
  const phaseRef = useRef<Phase>("idle");
  const timer = useRef<number | undefined>(undefined);
  const overlay = useRef<HTMLDivElement>(null);
  /** Glide: resolves the View Transition once the new page is in. */
  const glideDone = useRef<(() => void) | null>(null);

  const setPhase = (next: Phase) => {
    phaseRef.current = next;
    setPhaseState(next);
  };

  const reveal = () => {
    window.clearTimeout(timer.current);
    setPhase("reveal");
    const { reveal: ms } = TIMING[currentMode()] ?? TIMING.molten;
    timer.current = window.setTimeout(() => setPhase("idle"), ms);
  };

  useEffect(() => {
    if (phaseRef.current === "hold") reveal();
    // The new page has rendered: let the View Transition capture it.
    glideDone.current?.();
    glideDone.current = null;
    // reveal reads only refs and the live mode.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const link = (e.target as Element | null)?.closest?.("a");
      if (!link || link.hasAttribute("download")) return;
      if (link.target && link.target !== "_self") return;

      const raw = link.getAttribute("href");
      if (!raw || raw.startsWith("#")) return;
      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (/\.[a-z0-9]+$/i.test(url.pathname)) return;
      if (clean(url.pathname) === clean(window.location.pathname)) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      e.preventDefault();
      if (phaseRef.current !== "idle" || glideDone.current) return;

      document.querySelectorAll("dialog[open]").forEach((d) => (d as HTMLDialogElement).close());
      const to = `${url.pathname}${url.search}${url.hash}`;
      const mode = currentMode();

      if (mode === "glide" && typeof document.startViewTransition === "function") {
        // If the browser skips the animation (say, the window resized
        // mid-way), the page still changes; just keep the console quiet.
        const vt = document.startViewTransition(
          () =>
            new Promise<void>((resolve) => {
              const wait = window.setTimeout(() => {
                glideDone.current = null;
                resolve();
              }, MAX_GLIDE_WAIT_MS);
              glideDone.current = () => {
                window.clearTimeout(wait);
                resolve();
              };
              router.push(to);
            })
        );
        vt.ready.catch(() => undefined);
        vt.finished.catch(() => undefined);
        return;
      }

      // Ripple grows from the click (or the link's centre, from a key).
      const box = link.getBoundingClientRect();
      const x = e.clientX || box.left + box.width / 2;
      const y = e.clientY || box.top + box.height / 2;
      overlay.current?.style.setProperty("--tx", `${x}px`);
      overlay.current?.style.setProperty("--ty", `${y}px`);

      setPhase("cover");
      const { cover } = TIMING[mode] ?? TIMING.molten;
      timer.current = window.setTimeout(() => {
        setPhase("hold");
        router.push(to);
        timer.current = window.setTimeout(reveal, MAX_HOLD_MS);
      }, cover);
    };

    window.addEventListener("click", onClick, true);
    return () => {
      window.removeEventListener("click", onClick, true);
      window.clearTimeout(timer.current);
    };
    // reveal reads only refs and the live mode.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  return <div ref={overlay} aria-hidden className="motion-page" data-phase={phase} />;
}
