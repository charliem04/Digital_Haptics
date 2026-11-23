import type { ReactNode } from "react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Container } from "@/components/layout/Container";
import { MotionText } from "@/components/motion/MotionText";

/**
 * The opening block of every inner page: breadcrumbs, a section label,
 * the page's one <h1> (display small, caps) and an optional lead.
 * Inner pages get no flare: PLAN §4.4 keeps it to the home hero.
 */
export function PageHero({
  path,
  leafLabel,
  label,
  title,
  lead,
  children,
}: {
  path: string;
  /** For pages the registry can't name (a case study). */
  leafLabel?: string;
  label: ReactNode;
  title: ReactNode;
  lead?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <Container className="flex flex-col gap-6 pb-10 pt-8 lg:pb-14 lg:pt-12">
      <Breadcrumbs path={path} leafLabel={leafLabel} />
      <div className="flex flex-col gap-5">
        <SectionLabel>{label}</SectionLabel>
        {/* data-mt plays only after a page transition. On first load it is
            on screen, so it paints at once and LCP is untouched. */}
        <h1 data-mt="" className="max-w-[10.016em] font-body text-room-title font-medium">
          <MotionText>{title}</MotionText>
        </h1>
        {lead && (
          <p data-mt="" className="max-w-[640px] text-room-lede text-muted">
            {lead}
          </p>
        )}
      </div>
      {children}
    </Container>
  );
}
