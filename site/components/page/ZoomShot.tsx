"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Zoom timing: the same ease-out as the rest of the site's motion. */
const ZOOM = { duration: 520, easing: "cubic-bezier(0.22, 1, 0.36, 1)" };
/** The enlarged shot fits inside this share of the visible page. */
const FIT = { width: 0.92, height: 0.86 };
/**
 * The card shuffle on close: the shot in front (shuffleWith) steps aside
 * while this one flies home, then slides back over it. Individual
 * translate/rotate/scale, so it adds to the shot's own float.
 */
const ASIDE = { move: { translate: "24% 3%" }, turn: { rotate: "5deg", scale: "0.97" } };
const HOME = { move: { translate: "0px 0px" }, turn: { rotate: "0deg", scale: "1" } };
const SHUFFLE_OUT = { duration: 420, easing: "cubic-bezier(0.22, 1, 0.36, 1)" };
const SHUFFLE_IN = { duration: 460, easing: "cubic-bezier(0.22, 1, 0.36, 1)" };
/** The copy fading off the screenshot once it has landed. */
const HAND_OFF = { duration: 140, easing: "linear", fill: "forwards" as const };
/** Keys that would scroll the page behind an open zoom. */
const SCROLL_KEYS = new Set(["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "]);

type Box = { left: number; top: number; width: number; height: number };

/**
 * ════════════════════════════════════════════════════════════════════
 *  ZOOM SHOT: a case study screenshot you can click to see larger.
 *
 *  Origin-aware: one copy of the shot is laid out at its enlarged size
 *  and starts transformed onto the exact box of the screenshot you
 *  clicked, then glides to the centre of the visible page. Only
 *  transform animates, so the browser never re-lays out mid-glide and
 *  it stays smooth on phones. Its corner radius is the screenshot's
 *  divided by the starting scale, so the corners match exactly where it
 *  starts and grow with it. Closing glides it back to wherever the
 *  screenshot is now, and the two swap in a single frame. The page
 *  behind can't scroll while it's open, without hiding the scrollbar
 *  (which would shift the page).
 *
 *  A native modal <dialog>: focus moves to Close, Escape closes, and
 *  focus returns to the screenshot. Reduced motion: no glide.
 * ════════════════════════════════════════════════════════════════════
 */
export function ZoomShot({
  label,
  className,
  shuffleWith,
  children,
}: {
  /** What the shot shows, for the button and the enlarged view. */
  label: string;
  className?: string;
  /**
   * A shot that sits in front of this one (a selector, looked up inside
   * the same .device-pair). On close it steps aside and then shuffles
   * back in front, instead of popping over this shot as it lands.
   */
  shuffleWith?: string;
  children: ReactNode;
}) {
  const button = useRef<HTMLButtonElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const big = useRef<HTMLImageElement>(null);
  const shade = useRef<HTMLDivElement>(null);
  const busy = useRef(false);
  /** Animations on the screenshot that were running when it opened. */
  const held = useRef<Animation[]>([]);

  const reduce = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /** The screenshot's own box, as it is on screen right now. */
  const smallBox = (el: HTMLElement): Box => {
    const r = el.getBoundingClientRect();
    return { left: r.left, top: r.top, width: r.width, height: r.height };
  };
  /** Centred in the visible page (scrollbar excluded), as large as fits. */
  const bigBox = (ratio: number): Box => {
    const vw = document.documentElement.clientWidth;
    const vh = window.visualViewport?.height ?? window.innerHeight;
    const width = Math.min(vw * FIT.width, vh * FIT.height * ratio);
    const height = width / ratio;
    return { left: (vw - width) / 2, top: (vh - height) / 2, width, height };
  };
  /** Lay the copy out at its enlarged box. */
  const place = (el: HTMLElement, b: Box) =>
    Object.assign(el.style, {
      left: `${b.left}px`,
      top: `${b.top}px`,
      width: `${b.width}px`,
      height: `${b.height}px`,
    });
  /** The transform that puts the enlarged copy (at `bigB`) onto `small`. */
  const onto = (small: Box, bigB: Box) =>
    `translate(${small.left - bigB.left}px, ${small.top - bigB.top}px) scale(${
      small.width / bigB.width
    }, ${small.height / bigB.height})`;
  /** Corner radius, in the copy's own units, that matches the screenshot. */
  const radiusFor = (btn: HTMLElement, small: Box, bigB: Box) =>
    `${(parseFloat(getComputedStyle(btn).borderTopLeftRadius) || 0) * (bigB.width / small.width)}px`;
  /** The copy's enlarged box (its layout, ignoring the transform). */
  const laidOut = (el: HTMLElement): Box => ({
    left: el.offsetLeft,
    top: el.offsetTop,
    width: el.offsetWidth,
    height: el.offsetHeight,
  });

  const open = async () => {
    const btn = button.current;
    const dlg = dialog.current;
    const box = frame.current;
    const img = big.current;
    const source = btn?.querySelector("img");
    if (!btn || !dlg || !box || !img || !source || busy.current || dlg.open) return;
    busy.current = true;

    // Hold a running float or entrance still, so the shot stays put. Only
    // running ones: resuming a finished animation would replay it.
    held.current = btn.getAnimations().filter((a) => a.playState === "running");
    held.current.forEach((a) => a.pause());
    // No hover lift on the pair while zoomed; it eases back after.
    btn.closest(".device-pair")?.setAttribute("data-zooming", "");
    img.src = source.currentSrc || source.src;
    img.alt = source.alt;
    await img.decode().catch(() => undefined);

    // Same corner shape as the screenshot (squircle where supported).
    box.style.setProperty("corner-shape", getComputedStyle(btn).getPropertyValue("corner-shape"));
    const from = smallBox(btn);
    const to = bigBox(source.naturalWidth / source.naturalHeight || from.width / from.height);
    place(box, to);
    box.style.borderRadius = radiusFor(btn, from, to);
    // Start on the screenshot, so the first frame is exactly where it was.
    box.style.transform = onto(from, to);

    dlg.showModal();
    btn.style.visibility = "hidden";
    if (!reduce()) {
      shade.current?.animate([{ opacity: 0 }, { opacity: 1 }], ZOOM);
      const glide = box.animate([{ transform: onto(from, to) }, { transform: "none" }], ZOOM);
      box.style.transform = "";
      await glide.finished.catch(() => undefined);
    } else {
      box.style.transform = "";
    }
    busy.current = false;
  };

  const close = async () => {
    const btn = button.current;
    const dlg = dialog.current;
    const box = frame.current;
    if (!btn || !dlg || !box || !dlg.open || busy.current) return;
    busy.current = true;
    const front = shuffleWith
      ? (btn.closest(".device-pair")?.querySelector<HTMLElement>(shuffleWith) ?? null)
      : null;
    const shuffle = !!front && !reduce();
    if (!reduce()) {
      const to = smallBox(btn);
      // The shot in front steps aside. The move is added to wherever it
      // already is (a hover lift, say), so nothing snaps when it's done.
      if (shuffle && front) {
        front.animate([HOME.move, ASIDE.move], {
          ...SHUFFLE_OUT,
          fill: "forwards",
          composite: "add",
        });
        front.animate([HOME.turn, ASIDE.turn], { ...SHUFFLE_OUT, fill: "forwards" });
      }
      shade.current?.animate([{ opacity: 1 }, { opacity: 0 }], { ...ZOOM, fill: "forwards" });
      // Land looking exactly like the screenshot: its border and shadow,
      // in the copy's own units (divided by the landing scale), so the
      // hand-off shows no thinner border or shadow popping off.
      const home = laidOut(box);
      const s = to.width / home.width || 1;
      const unscale = (v: string) => v.replace(/(-?[\d.]+)px/g, (_, n) => `${Number(n) / s}px`);
      const look = getComputedStyle(btn);
      const now = getComputedStyle(box);
      const shadowTo =
        look.boxShadow === "none"
          ? now.boxShadow.replace(/rgba?\([^)]*\)/g, "rgb(0 0 0 / 0)")
          : unscale(look.boxShadow);
      await box
        .animate(
          [
            { transform: "none", borderWidth: now.borderTopWidth, boxShadow: now.boxShadow },
            {
              transform: onto(to, home),
              borderWidth: unscale(look.borderTopWidth),
              boxShadow: shadowTo,
            },
          ],
          { ...ZOOM, fill: "forwards" }
        )
        .finished.catch(() => undefined);
    }
    // Hand off: the screenshot appears under the copy, which then fades
    // off it, so any last sub-pixel difference dissolves instead of
    // cutting.
    btn.style.visibility = "";
    held.current.forEach((a) => a.play());
    held.current = [];
    const handOff = reduce()
      ? Promise.resolve()
      : box.animate([{ opacity: 1 }, { opacity: 0 }], HAND_OFF).finished.catch(() => undefined);
    // The shot in front shuffles back over this one, now it's home.
    let settled: Promise<unknown> = Promise.resolve();
    if (shuffle && front) {
      const aside = front.getAnimations().filter((a) => !(a instanceof CSSAnimation));
      settled = front.animate([ASIDE.move, HOME.move], {
        ...SHUFFLE_IN,
        composite: "add",
      }).finished;
      front.animate([ASIDE.turn, HOME.turn], SHUFFLE_IN);
      aside.forEach((a) => a.cancel());
    }
    await handOff;
    dlg.close();
    box.getAnimations().forEach((a) => a.cancel());
    shade.current?.getAnimations().forEach((a) => a.cancel());
    busy.current = false;
    // Hover lift back once everything has landed (unless it reopened).
    // Two frames later: in the frame the shuffle ends, Chrome would skip
    // the transition and the lift would snap up.
    await settled.catch(() => undefined);
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    const pair = btn.closest(".device-pair");
    if (pair && !pair.querySelector("dialog[open]")) pair.removeAttribute("data-zooming");
  };

  useEffect(() => {
    const dlg = dialog.current;
    if (!dlg) return;
    // Keep it centred if the window changes size while open.
    const onResize = () => {
      const box = frame.current;
      const img = big.current;
      const btn = button.current;
      if (!dlg.open || !box || !btn || !img?.naturalWidth || busy.current) return;
      const to = bigBox(img.naturalWidth / img.naturalHeight);
      place(box, to);
      box.style.borderRadius = radiusFor(btn, smallBox(btn), to);
    };
    // The page behind stays put while it's open.
    const stop = (e: Event) => e.preventDefault();
    const stopKeys = (e: KeyboardEvent) => {
      const onButton = (e.target as HTMLElement).tagName === "BUTTON";
      if (SCROLL_KEYS.has(e.key) && !(onButton && e.key === " ")) e.preventDefault();
    };
    window.addEventListener("resize", onResize);
    dlg.addEventListener("wheel", stop, { passive: false });
    dlg.addEventListener("touchmove", stop, { passive: false });
    dlg.addEventListener("keydown", stopKeys);
    return () => {
      window.removeEventListener("resize", onResize);
      dlg.removeEventListener("wheel", stop);
      dlg.removeEventListener("touchmove", stop);
      dlg.removeEventListener("keydown", stopKeys);
    };
    // bigBox reads only the window; it never changes between renders.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <button
        ref={button}
        type="button"
        onClick={open}
        className={cn("block cursor-zoom-in p-0 text-left", className)}
      >
        {children}
        <span className="sr-only">View larger: {label}</span>
      </button>
      <dialog
        ref={dialog}
        aria-label={label}
        // Escape: glide back instead of vanishing.
        onCancel={(e) => {
          e.preventDefault();
          close();
        }}
        onClick={close}
        className="fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none cursor-zoom-out overflow-hidden bg-transparent p-0 backdrop:bg-transparent"
      >
        {/* A plain tint, no blur: fading a full-screen blur over the live
            liquid is what made the glide stutter on phones. */}
        <div ref={shade} aria-hidden className="absolute inset-0 bg-room/[0.9]" />
        {/* The copy that glides: its box is animated, the image just fills it. */}
        <div
          ref={frame}
          className="fixed overflow-hidden border border-text/[0.14] bg-room shadow-[0_40px_120px_-30px_rgb(0_0_0/0.9)] origin-top-left will-change-transform"
        >
          {/* The image is set when opened, from the screenshot's own source. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img ref={big} alt="" className="block size-full object-cover object-top" />
        </div>
        <button
          type="button"
          autoFocus
          onClick={(e) => {
            e.stopPropagation();
            close();
          }}
          className="fixed right-4 top-4 flex size-12 items-center justify-center rounded-control border border-line bg-surface text-text transition-colors duration-[160ms] hover:bg-raised"
        >
          <span className="sr-only">Close</span>
          <svg
            aria-hidden
            focusable="false"
            viewBox="0 0 16 16"
            className="size-4"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path d="M2 2 14 14 M14 2 2 14" />
          </svg>
        </button>
      </dialog>
    </>
  );
}
