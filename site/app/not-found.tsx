import type { Metadata } from "next";
import { robotsFor } from "@/lib/meta";
import { isLive, CTA_HREF } from "@/lib/routes";
import { Container } from "@/components/layout/Container";
import { CutFrame } from "@/components/ui/CutFrame";
import { BoxedLabel } from "@/components/ui/BoxedLabel";
import { Button } from "@/components/ui/Button";
import { Marker } from "@/components/ui/Marker";

export const metadata: Metadata = {
  title: "Page not found",
  robots: robotsFor(false),
};

/**
 * 404 (PLAN §5): a terminal-style NOT_FOUND label in a cut-corner
 * frame, with links back to Home / Work / Start. Work and Start appear
 * only while they're live, so this page never links to another 404.
 *
 * The Worker serves out/404.html with a real 404 status, which is also
 * what a flagged route returns while its flag is off.
 */
export default function NotFound() {
  const work = isLive("/work/");
  const start = isLive(CTA_HREF);

  return (
    <Container className="py-section-sm lg:py-section">
      <CutFrame size="lg" fill="frost" innerClassName="flex flex-col gap-8 p-6 lg:p-12">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ink pb-5">
          <BoxedLabel tone="ink">Error 404</BoxedLabel>
          <span className="flex items-center gap-2 font-mono text-label uppercase tracking-label text-steel">
            <Marker size="dot" />
            Status: NOT_FOUND
          </span>
        </div>
        <pre
          aria-hidden
          className="overflow-x-auto font-mono text-label leading-relaxed text-steel"
        >
          {`> request received
> lookup: no page at this address
> status: 404 NOT_FOUND`}
        </pre>
        <div className="flex max-w-[640px] flex-col gap-4">
          <h1 className="font-display text-display-sm font-semibold uppercase">
            That page isn&rsquo;t here.
          </h1>
          <p className="text-body-lg text-steel-deep">
            It may have moved, or the link may be wrong. These will get you back on track.
          </p>
        </div>
        <div className="flex flex-wrap gap-3.5">
          <Button href="/">Home</Button>
          {work && (
            <Button href="/work/" variant="ghost">
              Work
            </Button>
          )}
          {start && (
            <Button href={CTA_HREF} variant="accent">
              Start a Project
            </Button>
          )}
        </div>
      </CutFrame>
    </Container>
  );
}
