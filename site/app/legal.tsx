import Link from "next/link";
import type { ReactNode } from "react";
import { site } from "@/site.config";

/** Shared shell for legal pages. Restyled in Phase 5. */
export function LegalPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="page-x section-y">
      <div className="max-w-3xl">
        <Link
          href="/"
          className="inline-flex min-h-touch items-center font-mono text-label uppercase tracking-label text-ink"
        >
          ← Back to {site.name}
        </Link>
        <h1 className="mt-6 font-display text-heading font-semibold">{title}</h1>
        <div className="mt-8 space-y-5">{children}</div>
      </div>
    </div>
  );
}
