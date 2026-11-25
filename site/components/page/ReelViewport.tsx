"use client";

import { useEffect, useRef, type ReactNode } from "react";

/** How far a press has to move before it counts as a drag, not a tap. */
const DRAG_PX = 6;
/** After a swipe on a touch screen, wait this long before drifting again. */
const RESUME_MS = 1800;
/** Fling: share of speed left after one second of gliding. */
const FRICTION = 0.04;

/**
 * The moving part of the case reel (CaseReel). Drifts the track left at
 * `speed` px/s, and lets you drag it with a mouse or swipe it with a
 * thumb, with a short glide after you let go. The track holds the cards
 * twice, so the position simply wraps at half its width.
 *
 * Stops drifting under the pointer, while a card has keyboard focus,
 * while off screen, and for reduced motion (dragging still works).
 * A drag never counts as a click on the card under it.
 */
export function ReelViewport({ speed, children }: { speed: number; children: ReactNode }) {
  const viewport = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const vp = viewport.current;
    const tr = track.current;
    if (!vp || !tr) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Only real hover counts: on touch screens :hover sticks after a tap.
    const canHover = window.matchMedia("(hover: hover)").matches;

    let x = 0;
    let half = tr.scrollWidth / 2;
    let velocity = 0;
    let focused = false;
    let visible = false;
    let resumeAt = 0;
    let frame = 0;
    let last = 0;
    // The current press, if any.
    let press: {
      id: number;
      startX: number;
      startOffset: number;
      lastX: number;
      lastT: number;
      dragging: boolean;
    } | null = null;
    let suppressClick = false;

    const wrap = () => {
      if (half <= 0) return;
      x %= half;
      if (x > 0) x -= half;
    };
    const paint = () => {
      tr.style.transform = `translate3d(${x}px, 0, 0)`;
    };

    const tick = (now: number) => {
      const dt = last ? Math.min((now - last) / 1000, 0.05) : 0;
      last = now;
      if (!press?.dragging) {
        if (Math.abs(velocity) > 4) {
          x += velocity * dt;
          velocity *= Math.pow(FRICTION, dt);
        } else {
          velocity = 0;
          const hovering = canHover && vp.matches(":hover");
          if (!reduce && !hovering && !focused && now >= resumeAt) x -= speed * dt;
        }
      }
      wrap();
      paint();
      frame = visible ? requestAnimationFrame(tick) : 0;
    };
    const start = () => {
      if (!frame && visible) {
        last = 0;
        frame = requestAnimationFrame(tick);
      }
    };

    const seen = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      start();
    });
    seen.observe(vp);
    const sized = new ResizeObserver(() => {
      half = tr.scrollWidth / 2;
      wrap();
      paint();
    });
    sized.observe(tr);

    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      press = {
        id: e.pointerId,
        startX: e.clientX,
        startOffset: x,
        lastX: e.clientX,
        lastT: e.timeStamp,
        dragging: false,
      };
      velocity = 0;
      suppressClick = false;
    };
    const onMove = (e: PointerEvent) => {
      if (!press || e.pointerId !== press.id) return;
      const dx = e.clientX - press.startX;
      if (!press.dragging && Math.abs(dx) > DRAG_PX) {
        press.dragging = true;
        suppressClick = true;
        try {
          vp.setPointerCapture(e.pointerId);
        } catch {
          // No live pointer to capture (a synthetic event): drag anyway.
        }
        vp.dataset.dragging = "";
      }
      if (!press.dragging) return;
      const dt = Math.max(e.timeStamp - press.lastT, 1) / 1000;
      // Smoothed, so one jittery event can't fling the reel.
      velocity = velocity * 0.6 + ((e.clientX - press.lastX) / dt) * 0.4;
      press.lastX = e.clientX;
      press.lastT = e.timeStamp;
      x = press.startOffset + dx;
      wrap();
      paint();
    };
    const onUp = (e: PointerEvent) => {
      if (!press || e.pointerId !== press.id) return;
      const wasDrag = press.dragging;
      press = null;
      // Keep cards unclickable until the click that ends this press has
      // passed (CSS: [data-dragging] a), so a drag never opens a card, even
      // for listeners that see the click before this component does.
      if (wasDrag) setTimeout(() => delete vp.dataset.dragging, 0);
      if (!wasDrag) velocity = 0;
      if (e.pointerType !== "mouse") resumeAt = performance.now() + RESUME_MS;
    };
    // A drag never opens the card it started on.
    const onClick = (e: MouseEvent) => {
      if (!suppressClick) return;
      e.preventDefault();
      e.stopPropagation();
      suppressClick = false;
    };
    // Keep a card reached by Tab in view, and hold still while it's there.
    const onFocusIn = (e: FocusEvent) => {
      // Keyboard focus only: a mouse press focuses nothing (noFocus below).
      if (!(e.target as HTMLElement).matches(":focus-visible")) return;
      focused = true;
      vp.scrollLeft = 0;
      const card = (e.target as HTMLElement).getBoundingClientRect();
      const box = vp.getBoundingClientRect();
      if (card.left < box.left) x += box.left - card.left + 24;
      else if (card.right > box.right) x -= card.right - box.right + 24;
      wrap();
      paint();
    };
    const onFocusOut = (e: FocusEvent) => {
      if (!vp.contains(e.relatedTarget as Node | null)) focused = false;
    };
    const noDrag = (e: DragEvent) => e.preventDefault();
    // Pressing a card to drag it shouldn't focus it (that would stop the
    // drift); the click still opens it.
    const noFocus = (e: MouseEvent) => e.preventDefault();

    vp.addEventListener("pointerdown", onDown);
    vp.addEventListener("pointermove", onMove);
    vp.addEventListener("pointerup", onUp);
    vp.addEventListener("pointercancel", onUp);
    vp.addEventListener("click", onClick, true);
    vp.addEventListener("focusin", onFocusIn);
    vp.addEventListener("focusout", onFocusOut);
    vp.addEventListener("dragstart", noDrag);
    vp.addEventListener("mousedown", noFocus);

    return () => {
      cancelAnimationFrame(frame);
      seen.disconnect();
      sized.disconnect();
      vp.removeEventListener("pointerdown", onDown);
      vp.removeEventListener("pointermove", onMove);
      vp.removeEventListener("pointerup", onUp);
      vp.removeEventListener("pointercancel", onUp);
      vp.removeEventListener("click", onClick, true);
      vp.removeEventListener("focusin", onFocusIn);
      vp.removeEventListener("focusout", onFocusOut);
      vp.removeEventListener("dragstart", noDrag);
      vp.removeEventListener("mousedown", noFocus);
    };
  }, [speed]);

  return (
    <div ref={viewport} className="case-reel">
      <div ref={track} className="case-reel-track">
        {children}
      </div>
    </div>
  );
}
