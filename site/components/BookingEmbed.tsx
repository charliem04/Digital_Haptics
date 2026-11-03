/**
 * ════════════════════════════════════════════════════════════════════
 *  THE CAL.COM SCHEDULER, embedded on /start/ (PLAN §5).
 *
 *  Click-to-load (decision D3). There is no site-wide cookie banner, so
 *  the scheduler, a third party that sets its own cookies, only loads
 *  when the visitor presses "Load the calendar". The direct link and
 *  the intake form are always there for anyone who would rather not.
 *
 *  Pointing at or focusing the button opens the connection, so the
 *  handshake is usually done by the time the click lands. Once loaded,
 *  the iframe mounts when it is within a third of a screen, inside a
 *  box drawn at full size so nothing below it moves.
 *
 *  Nothing connects to the scheduler before the visitor reaches for the
 *  button: no preconnect in <head>, no lazy iframe waiting in the page.
 *
 *  PHASE 3: restyled with <Button> and <CutFrame>. The class strings
 *  below are temporary stand-ins on the new tokens.
 * ════════════════════════════════════════════════════════════════════
 */
"use client";

import { useEffect, useRef, useState } from "react";
import { site } from "@/site.config";
import { bookingOrigins, bookingEmbedSrc, schedulerName } from "@/lib/booking";

/** Temporary until <Button> lands in Phase 1. */
const primaryBtn =
  "inline-flex min-h-button items-center gap-3 bg-signal px-6 font-mono text-label-lg font-medium uppercase tracking-label-sm text-ink";
const ghostBtn =
  "inline-flex min-h-button items-center gap-3 border border-ink px-6 font-mono text-label-lg font-medium uppercase tracking-label-sm text-ink";

/** Close enough that the visitor means to use it. */
const MOUNT_MARGIN = "300px";

/**
 * The scheduler URL, widened to string.
 *
 * site.config.ts is `as const`, so with booking switched off the
 * literal type of site.booking.calUrl is "" and TypeScript narrows every
 * guarded use of it to `never` — correct about today's config, useless
 * to a component written to work either way. Reading it through one
 * widened binding keeps the code honest about what it handles without
 * loosening the config's types for everyone else.
 */
const bookingUrl: string = site.booking.calUrl;

/**
 * Open connections to the scheduler without asking it for anything yet.
 *
 * The origins come from lib/booking.ts rather than being written out
 * here, so the preconnects always point at what the iframe is about to
 * fetch — a hardcoded host quietly warms the wrong one the first time
 * the scheduler changes.
 *
 * Idempotent per origin: it can be reached from a hover, a focus and
 * a click inside the same second. Re-appending would be litter in the head, not a second
 * connection.
 */
function warmScheduler() {
  if (typeof document === "undefined") return;

  for (const origin of bookingOrigins()) {
    if (document.head.querySelector(`link[data-booking-warm="${origin}"]`)) {
      continue;
    }
    const link = document.createElement("link");
    link.rel = "preconnect";
    link.href = origin;
    // The iframe document is fetched as a cross-origin navigation, so
    // the connection has to be opened in anonymous mode to be reused.
    link.crossOrigin = "anonymous";
    link.setAttribute("data-booking-warm", origin);
    document.head.appendChild(link);
  }
}

export function BookingEmbed() {
  /** The visitor pressed "Load the calendar". */
  const [allowed, setAllowed] = useState(false);
  /** Scrolled close enough to mount the iframe. */
  const [near, setNear] = useState(false);
  /** The scheduler has actually painted, so the skeleton can go. */
  const [ready, setReady] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  /* ── Warm the connection once the visitor has asked for the embed.
     The button's pointer/focus handlers usually got there first; this
     covers a keyboard Enter with no prior focus event. */
  useEffect(() => {
    if (allowed) warmScheduler();
  }, [allowed]);

  /* ── Mount on approach ───────────────────────────────────────────
     Disconnects on the first hit; the answer cannot change back. */
  useEffect(() => {
    if (!bookingUrl) return;
    const el = boxRef.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      // No observer: mount on arrival rather than never. The embed is
      // still behind the load button, which is the part that matters.
      setNear(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin: MOUNT_MARGIN }
    );
    io.observe(el);
    return () => io.disconnect();
    // Re-observes when the gate opens, because the element the ref
    // points at is a different one on each side of it.
  }, [allowed]);

  if (!bookingUrl) return null;

  if (!allowed) {
    return (
      <div ref={boxRef} className="border border-dashed border-ink bg-frost p-8 text-center">
        <p className="font-mono text-label uppercase tracking-label-lg text-steel">
          Booking calendar
        </p>
        {/* Named, not "a scheduling service": agreeing to a third party
            the visitor cannot identify is not agreement, and /privacy/
            names the same one — both read schedulerName() from
            lib/booking.ts, so swapping bookingUrl renames it in both. */}
        <p className="mx-auto mt-3 max-w-[46ch]">
          The calendar is hosted by {schedulerName()}, which sets its own cookies. Load it here, or
          open it in a new tab — your choice.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2.5">
          <button
            type="button"
            onClick={() => setAllowed(true)}
            // The pointer arriving on the button is the earliest honest
            // signal there is. By the time the click lands the
            // handshake is usually done, so the iframe's first request
            // goes out on an open connection.
            onPointerEnter={warmScheduler}
            onFocus={warmScheduler}
            className={primaryBtn}
          >
            Load the calendar
          </button>
          <a
            href={bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            onPointerEnter={warmScheduler}
            className={ghostBtn}
          >
            Open {schedulerName()} instead
          </a>
        </div>
      </div>
    );
  }

  // An iframe rather than the scheduler's widget script: same flow,
  // no third-party JavaScript running in the page's own context.
  const src = bookingEmbedSrc();

  return (
    <div
      ref={boxRef}
      className="relative h-[760px] w-full overflow-hidden border border-ink bg-white md:h-[700px]"
    >
      {/* ── The wait ────────────────────────────────────────────────
          The box is drawn at full size before anything arrives in it,
          so the band never changes height and nothing below it moves
          when the calendar paints.

          What fills it is the shape of the thing being fetched, not a
          line of text in the middle of 760px of nothing. The scheduler
          is a third party on someone else's servers and some of that
          wait is not ours to remove; a rectangle that already looks
          like a month of dates reads as nearly-here, where an empty
          bordered box reads as broken and gets a reload — which
          genuinely does make it slower, because the reload throws away
          the connection this component spent the whole page opening.

          Marked aria-hidden and paired with an sr-only line: a screen
          reader should hear that the calendar is loading, not a grid
          of forty empty cells. */}
      {!ready && (
        <div className="absolute inset-0 p-8" aria-busy>
          {/* The pulse is the only signal that a third-party request is
              in flight, and it stops when the calendar lands.
              deliberate-ignore decorative-motion */}
          <div className="animate-pulse" aria-hidden>
            <div className="h-3 w-40 bg-hairline" />
            <div className="mt-8 grid grid-cols-7 gap-2">
              {Array.from({ length: 7 }, (_, i) => (
                <div key={`d${i}`} className="h-2 bg-hairline/60" />
              ))}
              {Array.from({ length: 35 }, (_, i) => (
                <div key={i} className="aspect-square bg-hairline/40" />
              ))}
            </div>
          </div>
          <p className="mt-8 text-center font-mono text-label-sm uppercase tracking-label text-steel">
            Loading the booking calendar…
          </p>
        </div>
      )}

      {near && (
        <iframe
          src={src}
          title={`Book a call with ${site.name}`}
          // Deliberately NOT lazy. Reaching this line already means the
          // visitor allowed the embed and is within a third of a screen
          // of it; deferring again is the behaviour this component was
          // rewritten to remove.
          loading="eager"
          onLoad={() => setReady(true)}
          className={`absolute inset-0 h-full w-full transition-opacity duration-200 ease-out ${
            ready ? "opacity-100" : "opacity-0"
          }`}
        />
      )}
    </div>
  );
}
