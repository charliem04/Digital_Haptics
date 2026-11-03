import Link from "next/link";
import type { Metadata } from "next";
import { robotsFor } from "@/lib/meta";

export const metadata: Metadata = {
  title: "Page not found",
  robots: robotsFor(false),
};

/**
 * PHASE 0 PLACEHOLDER. The on-brand 404 (terminal-style NOT_FOUND label
 * in a cut-corner frame, links to Home / Work / Start) is built in
 * Phase 5 (PLAN §5). Work and Start are added here as they go live;
 * scripts/routes.mjs fails the build on a link to a page that doesn't
 * exist yet.
 *
 * Cloudflare Pages serves out/404.html with a real 404 status, which is
 * also what a flagged route returns while its flag is off.
 */
export default function NotFound() {
  return (
    <section className="page-x section-y">
      <p className="font-mono text-label uppercase tracking-label-lg text-steel">NOT_FOUND</p>
      <h1 className="mt-4 font-display text-display-sm font-semibold uppercase">
        That page isn&rsquo;t here.
      </h1>
      <Link
        href="/"
        className="mt-8 inline-flex min-h-button items-center gap-3 bg-signal px-6 font-mono text-label-lg font-medium uppercase tracking-label-sm text-ink"
      >
        Back to home <span aria-hidden>↘</span>
      </Link>
    </section>
  );
}
