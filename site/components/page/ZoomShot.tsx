"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Zoom timing: the same ease-out as the rest of the site's motion. */
const ZOOM = { duration: 520, easing: "cubic-bezier(0.22, 1, 0.36, 1)" };
/** The enlarged shot fits inside this share of the visible page. */
const FIT = { width: 0.92, height: 0.86 };
/** Corner radius of the enlarged shot. */
const BIG_RADIUS = 24;
/**
 * The card shuffle on close: the shot in front (shuffleWith) steps aside
 * while this one flies home, then slides back over it. Individual
 * translate/rotate/scale, so it adds to the shot's own float.
 */
const ASIDE: Keyframe = { translate: "24% 3%", rotate: "5deg", scale: "0.97" };
const HOME: Keyframe = { translate: "0 0", rotate: "0deg", scale: "1" };
const SHUFFLE_OUT = { duration: 420, easing: "cubic-bezier(0.22, 1, 0.36, 1)" };
const SHUFFLE_IN = { duration: 460, easing: "cubic-bezier(0.22, 1, 0.36, 1)" };
/** Keys that would scroll the page behind an open zoom. */
const SCROLL_KEYS = new Set(["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "]);

type Box = { left: number; top: number; width: number; height: number; radius: string };

/**
 * ════════════════════════════════════════════════════════════════════
 *  ZOOM SHOT: a case study screenshot you can click to see larger.
 *
 *  Origin-aware: one copy of the shot starts at the exact box of the
 *  screenshot you clicked (position, size, corner radius and shape) and
 *  animates that box, not a scale, to the centre of the visible page, so
 *  its corners and border stay crisp the whole way. Closing animates it
 *  back to wherever the screenshot is now, and the two swap in a single
 *  frame. The page behind can't scroll while it's open, without hiding
 *  the scrollbar (which would shift the page).
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
  const smallBox = (btn: HTMLElement): Box => {
    const r = btn.getBoundingClientRect();
    return {
      left: r.left,
      top: r.top,
      width: r.width,
      height: r.height,
      radius: getComputedStyle(btn).borderTopLeftRadius,
    };
  };
  /** Centred in the visible page (scrollbar excluded), as large as fits. */
  const bigBox = (ratio: number): Box => {
    const vw = document.documentElement.clientWidth;
    const vh = document.documentElement.clientHeight;
    const width = Math.min(vw * FIT.width, vh * FIT.height * ratio);
    const height = width / ratio;
    return {
      left: (vw - width) / 2,
      top: (vh - height) / 2,
      width,
      height,
      radius: `${BIG_RADIUS}px`,
    };
  };
  const css = (b: Box): Keyframe => ({
    left: `${b.left}px`,
    top: `${b.top}px`,
    width: `${b.width}px`,
    height: `${b.height}px`,
    borderRadius: b.radius,
  });
  const set = (el: HTMLElement, b: Box) => Object.assign(el.style, css(b));

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
    img.src = source.currentSrc || source.src;
    img.alt = source.alt;
    await img.decode().catch(() => undefined);

    // Same corner shape as the screenshot (squircle where supported).
    box.style.setProperty("corner-shape", getComputedStyle(btn).getPropertyValue("corner-shape"));
    const from = smallBox(btn);
    const to = bigBox(source.naturalWidth / source.naturalHeight || from.width / from.height);
    set(box, to);

    dlg.showModal();
    btn.style.visibility = "hidden";
    if (!reduce()) {
      shade.current?.animate([{ opacity: 0 }, { opacity: 1 }], ZOOM);
      await box.animate([css(from), css(to)], ZOOM).finished;
    }
    busy.current = false;
  };

  const close = async () => {
    const btn = button.current;
    const dlg = dialog.current;
    const box = frame.current;
    if (!btn || !dlg || !box || !dlg.open || busy.current) return;
    busy.current = true;
    let front: HTMLElement | null = null;
    if (!reduce()) {
      const from = {
        ...smallBox(box),
        radius: getComputedStyle(box).borderTopLeftRadius,
      };
      const to = smallBox(btn);
      front = shuffleWith
        ? (btn.closest(".device-pair")?.querySelector<HTMLElement>(shuffleWith) ?? null)
        : null;
      front?.animate([HOME, ASIDE], { ...SHUFFLE_OUT, fill: "forwards" });
      shade.current?.animate([{ opacity: 1 }, { opacity: 0 }], { ...ZOOM, fill: "forwards" });
      await box.animate([css(from), css(to)], { ...ZOOM, fill: "forwards" }).finished;
    }
    // Swap in one frame: the screenshot appears as the copy goes.
    btn.style.visibility = "";
    dlg.close();
    box.getAnimations().forEach((a) => a.cancel());
    shade.current?.getAnimations().forEach((a) => a.cancel());
    held.current.forEach((a) => a.play());
    held.current = [];
    // The shot in front shuffles back over this one, now it's home.
    if (front) {
      const aside = front.getAnimations().filter((a) => !(a instanceof CSSAnimation));
      front.animate([ASIDE, HOME], SHUFFLE_IN).finished.then(() => undefined);
      aside.forEach((a) => a.cancel());
    }
    busy.current = false;
  };

  useEffect(() => {
    const dlg = dialog.current;
    if (!dlg) return;
    // Keep it centred if the window changes size while open.
    const onResize = () => {
      const box = frame.current;
      const img = big.current;
      if (!dlg.open || !box || !img?.naturalWidth || busy.current) return;
      set(box, bigBox(img.naturalWidth / img.naturalHeight));
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
        <div ref={shade} aria-hidden className="absolute inset-0 bg-room/80 backdrop-blur-md" />
        {/* The copy that glides: its box is animated, the image just fills it. */}
        <div
          ref={frame}
          className="fixed overflow-hidden border border-text/[0.14] bg-room shadow-[0_40px_120px_-30px_rgb(0_0_0/0.9)] will-change-[left,top,width,height]"
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
