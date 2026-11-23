import type { Metadata } from "next";
import { robotsFor } from "@/lib/meta";
import { isLive, CTA_HREF } from "@/lib/routes";
import { Container } from "@/components/layout/Container";
import { Panel } from "@/components/ui/Panel";
import { SmallLabel } from "@/components/ui/SmallLabel";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Page not found",
  robots: robotsFor(false),
};

/**
 * 404 (PLAN §5): a calm message with links back to Home / Work / Start.
 * Work and Start appear only while they're live, so this page never
 * links to another 404.
 *
 * The Worker serves out/404.html with a real 404 status, which is also
 * what a flagged route returns while its flag is off.
 */
export default function NotFound() {
  const work = isLive("/work/");
  const start = isLive(CTA_HREF);

  return (
    <Container className="py-section-sm lg:py-section">
      <Panel fill="surface" innerClassName="flex flex-col gap-8 p-6 lg:p-12">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-5 border-line">
          <SmallLabel>Error 404</SmallLabel>
        </div>
        <div className="flex max-w-[640px] flex-col gap-4">
          <h1 className="font-body text-room-title font-medium">That page isn&rsquo;t here.</h1>
          <p className="text-room-lede text-muted">
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
      </Panel>
    </Container>
  );
}
